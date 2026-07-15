// OL-A T2: lifecycle-aware panel resolution and frozen v1 fallback.

import assert from "node:assert/strict";
import { chmodSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { spawnSync } from "node:child_process";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const resolver = join(repo, "skills", "sdlc", "scripts", "resolve-panel.mjs");
const credentialVars = [
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_OAUTH_TOKEN",
	"AWS_ACCESS_KEY_ID",
	"AWS_BEARER_TOKEN_BEDROCK",
	"AWS_CONTAINER_CREDENTIALS_FULL_URI",
	"AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
	"AWS_PROFILE",
	"AWS_SECRET_ACCESS_KEY",
	"AWS_WEB_IDENTITY_TOKEN_FILE",
	"DEEPSEEK_API_KEY",
	"KIMI_API_KEY",
	"MINIMAX_API_KEY",
	"MOONSHOT_API_KEY",
	"OPENAI_API_KEY",
	"ZAI_API_KEY",
	"ZAI_CODING_CN_API_KEY",
];

function lifecycleConfig(lifecycle) {
	return {
		schemaVersion: 1,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		lifecycle,
	};
}

function fixture({ lifecycle, prefer = ["p/m1"], minPanel = 1, rules, config = "valid", providers } = {}) {
	const root = mkdtempSync(join(tmpdir(), "sdlc-resolve-lifecycle-"));
	const sdlc = join(root, ".pi", "sdlc");
	const home = join(root, "home");
	mkdirSync(sdlc, { recursive: true });
	mkdirSync(join(home, ".pi", "agent"), { recursive: true });
	const phase = { min_panel: minPanel, prefer };
	writeFileSync(join(sdlc, "sdlc.models.json"), `${JSON.stringify({ rules, phases: { plan_review: phase, spec_review: phase, pr_review: phase, task_validate: phase } }, null, 2)}\n`);
	const authProviders = providers ?? [...new Set(prefer.map((pm) => pm.split("/")[0]))];
	writeFileSync(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify(Object.fromEntries(authProviders.map((provider) => [provider, {}])))}\n`);
	if (config === "valid") writeFileSync(join(sdlc, "sdlc.config.json"), `${JSON.stringify(lifecycleConfig(lifecycle), null, 2)}\n`);
	else if (config === "malformed") writeFileSync(join(sdlc, "sdlc.config.json"), "{not json\n");
	else if (config === "invalid-v1") writeFileSync(join(sdlc, "sdlc.config.json"), '{"bogus":true}\n');
	return { root, home };
}

function run({ root, home }, phase, args = []) {
	const env = { ...process.env, HOME: home };
	for (const key of credentialVars) delete env[key];
	const result = spawnSync(process.execPath, [resolver, phase, "--config", root, ...args], { encoding: "utf8", env });
	return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function lines(stdout) {
	return stdout.trim() ? stdout.trim().split("\n") : [];
}

test("OLA9: lifecycle floor supersedes models min_panel and v1 path remains byte-identical", () => {
	const prefer = ["p/m1", "q/m2", "r/m3"];
	const adopted = fixture({ lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 3 } } }, prefer, minPanel: 1 });
	const resolved = run(adopted, "pr_review");
	assert.equal(resolved.status, 0);
	assert.deepEqual(lines(resolved.stdout), prefer);
	assert.match(resolved.stderr, /note: min_panel=1 .* lifecycle\.gates\.pr_review \(minPanel=3\)/);

	const missing = fixture({ prefer, minPanel: 1, config: "missing" });
	const malformed = fixture({ prefer, minPanel: 1, config: "malformed" });
	assert.deepEqual(run(malformed, "pr_review"), run(missing, "pr_review"));
});

test("OLA10a-b: same-provider models satisfy diversity and effort variants dedupe positionally", () => {
	const sameProvider = fixture({
		lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } },
		prefer: ["p/m1", "p/m2"],
	});
	assert.deepEqual(lines(run(sameProvider, "pr_review").stdout), ["p/m1", "p/m2"]);

	for (const [first, second] of [
		["p/m1:high", "p/m1:low"],
		["p/m1:low", "p/m1:high"],
	]) {
		const positional = fixture({
			lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } },
			prefer: [first, second, "p/m2"],
		});
		assert.deepEqual(lines(run(positional, "pr_review").stdout), [first, "p/m2"]);
	}
});

test("OLA10c: failure names the distinct-model floor", () => {
	const f = fixture({
		lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } },
		prefer: ["p/m1:high", "p/m1:low"],
	});
	const result = run(f, "pr_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /FAILED to reach distinct-model minPanel=2/);
});

test("OLA10d-f: embedded versions, colon versions, and providers are identity", () => {
	for (const [prefer, providers] of [
		[["p/m-5.4", "p/m-5.6"], ["p"]],
		[["p/bedrock-m:0", "p/bedrock-m:1"], ["p"]],
		[
			["p/m", "q/m"],
			["p", "q"],
		],
	]) {
		const f = fixture({
			lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } },
			prefer,
			providers,
		});
		assert.deepEqual(lines(run(f, "pr_review").stdout), prefer);
	}
	const efforts = fixture({
		lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } },
		prefer: ["p/m:high", "p/m:low"],
	});
	assert.equal(run(efforts, "pr_review").status, 1);
});

test("OLA11: lifecycle excludes the author model only when minPanel >= 2", () => {
	const lifecycle = { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } };
	for (const rules of [undefined, { exclude_author_vendor: false }]) {
		const f = fixture({ lifecycle, prefer: ["p/m1:low", "p/m2", "p/m3"], rules });
		const result = run(f, "pr_review", ["--author", "p/m1:high"]);
		assert.equal(result.status, 0);
		assert.deepEqual(lines(result.stdout), ["p/m2", "p/m3"]);
	}
	const solo = fixture({ lifecycle: { profile: "custom", gates: { pr_review: { mode: "advisory", minPanel: 1 } } }, prefer: ["p/m1", "p/m2"] });
	assert.deepEqual(lines(run(solo, "pr_review", ["--author", "p/m1"]).stdout), ["p/m1"]);
	const bare = run(solo, "pr_review", ["--author", "p"]);
	assert.equal(bare.status, 1);
	assert.match(bare.stderr, /--author must be provider\/model/);
});

test("OLA11/OLA20: v1 bare-vendor author and invalid non-lifecycle config are frozen", () => {
	const options = { prefer: ["anthropic/claude", "openai/gpt"], minPanel: 2, providers: ["anthropic", "openai"] };
	const absent = fixture({ ...options, config: "missing" });
	const malformed = fixture({ ...options, config: "malformed" });
	const invalid = fixture({ ...options, config: "invalid-v1" });
	const expected = run(absent, "pr_review", ["--author", "anthropic"]);
	assert.deepEqual(run(malformed, "pr_review", ["--author", "anthropic"]), expected);
	assert.deepEqual(run(invalid, "pr_review", ["--author", "anthropic"]), expected);
	const legacyTrackError = {
		status: 2,
		stdout: "",
		stderr: "resolve-panel: unexpected argument: --track\n",
	};
	for (const legacyRoot of [absent, malformed, invalid]) {
		assert.deepEqual(run(legacyRoot, "pr_review", ["--track", "banana"]), legacyTrackError);
		assert.deepEqual(run(legacyRoot, "pr_review", ["--track", "--unknown"]), legacyTrackError);
		assert.deepEqual(run(legacyRoot, "pr_review", ["--track"]), legacyTrackError);
	}
	writeFileSync(join(absent.root, ".pi", "sdlc", "sdlc.models.json"), "{not json\n");
	assert.deepEqual(run(absent, "pr_review", ["--track", "banana"]), legacyTrackError);
});

test("OLA12: task validation has a fixed one-model floor or refuses when off", () => {
	for (const mode of ["subagent", "self"]) {
		const enabled = fixture({ lifecycle: { profile: "custom", taskValidation: { mode } }, prefer: ["p/m1", "q/m2"], minPanel: 3 });
		const result = run(enabled, "task_validate");
		assert.equal(result.status, 0);
		assert.deepEqual(lines(result.stdout), ["p/m1"]);
		assert.match(result.stderr, /min_panel=3 .* lifecycle\.taskValidation \(minPanel=1\)/);
		assert.doesNotMatch(result.stderr, /vendor/);
	}
	const disabled = fixture({ lifecycle: { profile: "custom", taskValidation: { mode: "off" } } });
	const refusal = run(disabled, "task_validate");
	assert.equal(refusal.status, 1);
	assert.match(refusal.stderr, /task validation is off in the committed lifecycle shape/);
});

test("OLA13: gate decomposition and track selection govern panel availability", () => {
	const human = fixture({ lifecycle: { profile: "custom", gates: { plan_review: { mode: "human", minPanel: 1 } } } });
	let result = run(human, "plan_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /plan_review gate mode is 'human'.*no panel to resolve/);

	const advisory = fixture({ lifecycle: { profile: "custom", gates: { plan_review: { mode: "advisory", minPanel: 1 } } } });
	assert.equal(run(advisory, "plan_review").status, 0);
	assert.equal(run(advisory, "plan_review", ["--track", "reversible"]).status, 0);

	const perTrack = fixture({ lifecycle: { profile: "custom", gates: { plan_review: { mode: { irreversible: "panel", reversible: "human" }, minPanel: 1 } } } });
	result = run(perTrack, "plan_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /mode is per-track.*pass --track irreversible\|reversible/);
	assert.equal(run(perTrack, "plan_review", ["--track", "irreversible"]).status, 0);
	result = run(perTrack, "plan_review", ["--track", "reversible"]);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /gate mode is 'human'.*no panel/);
	assert.equal(run(perTrack, "plan_review", ["--track", "banana"]).status, 1);
});

test("OLA13: absent per-track keys resolve from defaults without guessing", () => {
	const f = fixture({ lifecycle: { profile: "custom", gates: { spec_review: { mode: { irreversible: "panel" }, minPanel: 1 } } } });
	const result = run(f, "spec_review", ["--track", "reversible"]);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /spec_review gate mode is 'human'.*no panel/);
});

test("OLA21: an invalid lifecycle block fails on its first lifecycle issue", () => {
	const f = fixture({ lifecycle: { profile: "custom", gates: { merge: {} } } });
	const result = run(f, "pr_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /invalid lifecycle at lifecycle\.gates: unknown key 'merge'/);
});

test("lifecycle config filesystem errors never silently select the v1 path", () => {
	const f = fixture({ lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 1 } } } });
	chmodSync(join(f.root, ".pi", "sdlc", "sdlc.config.json"), 0);
	const result = run(f, "pr_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /cannot read .*sdlc\.config\.json/);
});
