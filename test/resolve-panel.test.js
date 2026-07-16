// CV21-CV26: merged-roster resolver posture and v1 conservation.

import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

import { REMEDY_SCHEMA_OLDER } from "../skills/sdlc/scripts/lib.mjs";
import { planMigration } from "../skills/sdlc/scripts/migrate.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const resolver = join(repo, "skills", "sdlc", "scripts", "resolve-panel.mjs");
const fixtures = join(repo, "test", "fixtures", "config-versioning");
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

function baseConfig({ enforcement, lifecycle, prefer = ["p/m1", "q/m2"], minVendor = 1, authorDefault, rules } = {}) {
	const phase = { minVendor, prefer };
	return {
		schemaVersion: 2,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		...(enforcement === undefined ? {} : { enforcement }),
		...(lifecycle === undefined ? {} : { lifecycle }),
		panels: {
			...(authorDefault === undefined ? {} : { authorDefault }),
			...(rules === undefined ? {} : { rules }),
			phases: { plan_review: phase, spec_review: phase, pr_review: phase, task_validate: phase },
		},
	};
}

function fixture(config, providers = []) {
	const root = mkdtempSync(join(tmpdir(), "sdlc-resolve-v2-"));
	const home = join(root, "home");
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	mkdirSync(join(home, ".pi", "agent"), { recursive: true });
	if (config !== null) writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config, null, 2)}\n`);
	writeFileSync(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify(Object.fromEntries(providers.map((provider) => [provider, {}])))}\n`);
	return { root, home };
}

function run({ root, home }, phase = "plan_review", args = []) {
	const env = { ...process.env, HOME: home };
	for (const key of credentialVars) delete env[key];
	const result = spawnSync(process.execPath, [resolver, phase, "--config", root, ...args], { encoding: "utf8", env });
	return { status: result.status, stdout: result.stdout, stderr: result.stderr };
}

function lines(stdout) {
	return stdout.trim() ? stdout.trim().split("\n") : [];
}

function parseJson(text, label = "JSON") {
	try {
		return JSON.parse(text);
	} catch (error) {
		assert.fail(`${label} did not parse: ${error.message}`);
	}
}

test("CV21: preference shortfalls proceed on both axes and keep machine stdout parseable", () => {
	const vendor = fixture(baseConfig({ enforcement: "preference", minVendor: 3 }), ["p", "q"]);
	let result = run(vendor);
	assert.equal(result.status, 0);
	assert.deepEqual(lines(result.stdout), ["p/m1", "q/m2"]);
	assert.match(result.stderr, /advisory\[plan_review\]: enforcement is 'preference' — panel below target: minVendor=3, achieved=2; proceeding\. Carry this shortfall into the phase writeup and the PR\./);
	result = run(vendor, "plan_review", ["--emit-tasks", "reviewer"]);
	assert.deepEqual(
		parseJson(result.stdout, "emit-tasks stdout").tasks.map(({ model }) => model),
		["p/m1", "q/m2"],
	);
	assert.doesNotMatch(result.stdout, /advisory/);

	const lifecycle = { profile: "custom", gates: { plan_review: { mode: "panel", minPanel: 3 } } };
	result = run(fixture(baseConfig({ enforcement: "preference", lifecycle }), ["p", "q"]));
	assert.equal(result.status, 0);
	assert.match(result.stderr, /panel below target: minPanel=3, achieved=2/);
});

test("CV22: strict shortfalls fail and absent enforcement defaults to preference", () => {
	let result = run(fixture(baseConfig({ enforcement: "strict", minVendor: 3 }), ["p", "q"]));
	assert.equal(result.status, 1);
	assert.deepEqual(lines(result.stdout), ["p/m1", "q/m2"]);
	assert.match(result.stderr, /FAILED to reach min_panel=3/);
	assert.doesNotMatch(result.stderr, /advisory/);
	result = run(fixture(baseConfig({ minVendor: 3 }), ["p", "q"]));
	assert.equal(result.status, 0);
	assert.match(result.stderr, /panel below target: minVendor=3, achieved=2/);
});

test("CV23: author readmission is shortfall-only; empty panels and gate modes still refuse", () => {
	let config = baseConfig({ enforcement: "preference", minVendor: 2, prefer: ["p/m1", "q/m2", "r/m3"], authorDefault: "p/author" });
	let result = run(fixture(config, ["p", "q", "r"]));
	assert.deepEqual(lines(result.stdout), ["q/m2", "r/m3"]);
	assert.doesNotMatch(result.stderr, /author vendor p included/);

	config = baseConfig({ enforcement: "preference", minVendor: 2, prefer: ["p/m1", "q/m2"], authorDefault: "p/author" });
	result = run(fixture(config, ["p", "q"]));
	assert.equal(result.status, 0);
	assert.deepEqual(lines(result.stdout), ["q/m2", "p/m1"]);
	assert.match(result.stderr, /advisory\[plan_review\]: author vendor p included — author exclusion demoted under 'preference'/);

	config.enforcement = "strict";
	result = run(fixture(config, ["p", "q"]));
	assert.equal(result.status, 1);
	assert.deepEqual(lines(result.stdout), ["q/m2"]);

	for (const enforcement of ["strict", "preference"]) {
		result = run(fixture(baseConfig({ enforcement }), []));
		assert.equal(result.status, 1);
		assert.match(result.stderr, /no credentialed models available for plan_review/);
	}

	const humanLifecycle = { profile: "custom", gates: { plan_review: { mode: "human", minPanel: 1 } } };
	result = run(fixture(baseConfig({ enforcement: "preference", lifecycle: humanLifecycle }), ["p"]));
	assert.equal(result.status, 1);
	assert.match(result.stderr, /no panel to resolve/);
	const offLifecycle = { profile: "custom", taskValidation: { mode: "off" } };
	result = run(fixture(baseConfig({ enforcement: "preference", lifecycle: offLifecycle }), ["p"]), "task_validate");
	assert.equal(result.status, 1);
	assert.match(result.stderr, /task validation is off/);
});

test("CV24/CV25: retired input and manifest/version/roster halts are distinct", () => {
	let result = run(fixture(baseConfig(), ["p"]), "plan_review", ["--models-file", "/definitely/not/read"]);
	assert.deepEqual(result, {
		status: 2,
		stdout: "",
		stderr: "resolve-panel: --models-file is retired — the panel roster now lives in .pi/sdlc/sdlc.config.json (schemaVersion 2)\n",
	});

	result = run(fixture(null));
	assert.equal(result.status, 2);
	assert.equal(result.stderr, "sdlc: this project requires .pi/sdlc/sdlc.config.json with a panels roster to resolve a panel (the skill ships no built-in model roster)\n");

	const panelsLess = baseConfig();
	delete panelsLess.panels;
	result = run(fixture(panelsLess));
	assert.equal(result.status, 1);
	assert.equal(result.stderr, "resolve-panel: no panels roster for plan_review in .pi/sdlc/sdlc.config.json — add a panels block (see schema/sdlc.config.example.json)\n");

	const old = baseConfig();
	old.schemaVersion = 1;
	result = run(fixture(old));
	assert.equal(result.status, 2);
	assert.equal(result.stderr, `sdlc: ${REMEDY_SCHEMA_OLDER(1)}\n`);
});

test("CV26: folded pair-A strict output and exit match real pre-T1 v1 goldens", () => {
	const readJson = (path) => parseJson(readFileSync(path, "utf8"), path);
	const input = join(fixtures, "migration-input", "pair-a");
	const planned = planMigration({ config: readJson(join(input, "sdlc.config.json")), models: readJson(join(input, "sdlc.models.json")) });
	assert.equal(planned.ok, true);
	const golden = readJson(join(fixtures, "goldens", "pair-a-resolver-v1-316fc33.json"));
	assert.equal(golden.provenance.commit, "316fc33");
	const providers = golden.provenance.credentials;
	const f = fixture(planned.config, providers);
	for (const [phase, expected] of Object.entries(golden.phases)) {
		const actual = run(f, phase);
		assert.equal(actual.status, expected.exitCode, phase);
		assert.equal(actual.stdout, expected.stdout, phase);
		assert.equal(actual.stderr, expected.stderr, phase);
	}
});
