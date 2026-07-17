// Lifecycle model-axis conservation and preference posture for resolve-panel.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

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

function fixture({ lifecycle, prefer = ["p/m1"], minVendor = 1, enforcement = "strict", authorDefault, providers } = {}) {
	const root = mkdtempSync(join(tmpdir(), "sdlc-resolve-lifecycle-"));
	const home = join(root, "home");
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	mkdirSync(join(home, ".pi", "agent"), { recursive: true });
	const phase = { minVendor, prefer };
	const config = {
		schemaVersion: 2,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		enforcement,
		lifecycle,
		panels: {
			...(authorDefault === undefined ? {} : { authorDefault }),
			phases: { plan_review: phase, spec_review: phase, pr_review: phase, task_validate: phase },
		},
	};
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config, null, 2)}\n`);
	const authProviders = providers ?? [...new Set(prefer.map((pm) => pm.split("/")[0]))];
	writeFileSync(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify(Object.fromEntries(authProviders.map((provider) => [provider, {}])))}\n`);
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

test("CV4/CV21: lifecycle floor exclusively supersedes minVendor and reports model shortfall", () => {
	const lifecycle = { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 1 } } };
	let result = run(fixture({ lifecycle, prefer: ["p/m1"], minVendor: 99 }), "pr_review");
	assert.equal(result.status, 0);
	assert.match(result.stderr, /note: minVendor=99 in sdlc\.config\.json panels superseded by lifecycle\.gates\.pr_review \(minPanel=1\)/);
	assert.doesNotMatch(result.stderr, /below target/);

	lifecycle.gates.pr_review.minPanel = 3;
	result = run(fixture({ lifecycle, prefer: ["p/m1", "q/m2"], enforcement: "preference" }), "pr_review");
	assert.equal(result.status, 0);
	assert.deepEqual(lines(result.stdout), ["p/m1", "q/m2"]);
	assert.match(result.stderr, /panel below target: minPanel=3, achieved=2/);
});

test("strict model-axis ordering and recognised effort suffix dedupe are conserved", () => {
	const lifecycle = { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } };
	const result = run(fixture({ lifecycle, prefer: ["p/m1:high", "p/m1:low", "p/m2", "q/m3"] }), "pr_review");
	assert.equal(result.status, 0);
	assert.deepEqual(lines(result.stdout), ["p/m1:high", "p/m2"]);
	assert.match(result.stderr, /dropped p\/m1:low: model p\/m1 already in panel/);
});

test("same-provider distinct models, embedded versions, and provider identity remain distinct", () => {
	const lifecycle = { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } };
	for (const prefer of [
		["p/m1", "p/m2"],
		["p/m-5.4", "p/m-5.6"],
		["p/bedrock-m:0", "p/bedrock-m:1"],
		["p/m", "q/m"],
	]) {
		const result = run(fixture({ lifecycle, prefer }), "pr_review");
		assert.equal(result.status, 0);
		assert.deepEqual(lines(result.stdout), prefer);
	}
});

test("CV23: lifecycle author model is readmitted only for preference shortfall", () => {
	const lifecycle = { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2 } } };
	let result = run(fixture({ lifecycle, prefer: ["p/m1:low", "p/m2"], authorDefault: "p/m1:high", enforcement: "preference" }), "pr_review");
	assert.equal(result.status, 0);
	assert.deepEqual(lines(result.stdout), ["p/m2", "p/m1:low"]);
	assert.match(result.stderr, /advisory\[pr_review\]: author model p\/m1 included — author exclusion demoted under 'preference'/);

	result = run(fixture({ lifecycle, prefer: ["p/m1:low", "p/m2"], authorDefault: "p/m1:high", enforcement: "strict" }), "pr_review");
	assert.equal(result.status, 1);
	assert.deepEqual(lines(result.stdout), ["p/m2"]);
	assert.match(result.stderr, /FAILED to reach distinct-model minPanel=2/);
});

test("gate decomposition, track selection, and task-validation off refuse in preference", () => {
	let lifecycle = { profile: "custom", gates: { plan_review: { mode: { irreversible: "panel", reversible: "human" }, minPanel: 1 } } };
	const f = fixture({ lifecycle, enforcement: "preference" });
	let result = run(f, "plan_review");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /mode is per-track/);
	assert.equal(run(f, "plan_review", ["--track", "irreversible"]).status, 0);
	result = run(f, "plan_review", ["--track", "reversible"]);
	assert.equal(result.status, 1);
	assert.match(result.stderr, /no panel to resolve/);

	lifecycle = { profile: "custom", taskValidation: { mode: "off" } };
	result = run(fixture({ lifecycle, enforcement: "preference" }), "task_validate");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /task validation is off/);
});

test("task validation retains its fixed one-model model-axis floor", () => {
	for (const mode of ["subagent", "self"]) {
		const lifecycle = { profile: "custom", taskValidation: { mode } };
		const result = run(fixture({ lifecycle, prefer: ["p/m1", "q/m2"], minVendor: 3 }), "task_validate");
		assert.equal(result.status, 0);
		assert.deepEqual(lines(result.stdout), ["p/m1"]);
		assert.match(result.stderr, /minVendor=3 .* lifecycle\.taskValidation \(minPanel=1\)/);
	}
});
