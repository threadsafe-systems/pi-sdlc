import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { CONFIG_SCHEMA_VERSION, classifyConfigVersion, inspectConfig } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const scripts = join(repo, "skills", "sdlc", "scripts");

// Canonical valid v4 config (a "full"-equivalent shape, roster present).
function validV3() {
	return {
		schemaVersion: 4,
		prefix: "acme",
		labelPrefix: "acme-sdlc",
		announce: "Using the sdlc skill.",
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		overrides: { reversible: { review: { design: { validate: "skip" } } } },
		panels: {
			authorDefault: "anthropic/claude-opus-4",
			phases: {
				plan_review: { prefer: ["openai/gpt-5", "deepseek/deepseek-v3"] },
				spec_review: { prefer: ["openai/gpt-5", "deepseek/deepseek-v3"] },
				pr_review: { prefer: ["openai/gpt-5", "deepseek/deepseek-v3", "zai/glm-4"], panelSize: 3 },
				task_validate: { prefer: ["deepseek/deepseek-v3"], panelSize: 1 },
			},
		},
	};
}

// ICA1: canonical valid v3 and the shipped example pass with zero issues.
test("ICA1: valid v3 config has zero issues", () => {
	assert.deepEqual(inspectConfig(validV3()), []);
});

test("ICA1: shipped example is valid v3", () => {
	const example = JSON.parse(readFileSync(join(repo, "skills", "sdlc", "schema", "sdlc.config.example.json"), "utf8"));
	assert.equal(example.schemaVersion, CONFIG_SCHEMA_VERSION);
	assert.deepEqual(inspectConfig(example), []);
});

test("ICA1: minimal valid v3 (no optional blocks) has zero issues", () => {
	const c = validV3();
	delete c.overrides;
	delete c.panels;
	assert.deepEqual(inspectConfig(c), []);
});

// ICA2: kernel probes each yield >=1 issue.
test("ICA2: overrides.none is rejected", () => {
	const c = validV3();
	c.overrides = { none: { review: { design: { validate: "panel", approve: "human" } } } };
	assert.ok(inspectConfig(c).some((i) => i.path.startsWith("overrides")));
});

test("ICA2: a review.merge key is rejected", () => {
	const c = validV3();
	c.review.merge = "panel";
	assert.ok(inspectConfig(c).some((i) => i.path.startsWith("review")));
});

test("ICA2: shape.defaultTrack none is rejected", () => {
	const c = validV3();
	c.shape.defaultTrack = "none";
	assert.ok(inspectConfig(c).some((i) => i.path === "shape.defaultTrack"));
});

for (const key of ["lifecycle", "enforcement", "evidence"]) {
	test(`ICA2: retired/reserved top-level key '${key}' is unknown`, () => {
		const c = validV3();
		c[key] = key === "enforcement" ? "strict" : {};
		assert.ok(inspectConfig(c).some((i) => i.path === key && /unknown key/.test(i.message)));
	});
}

// ICA3: missing required keys and bad overrides.
test("ICA3: missing review block is an issue", () => {
	const c = validV3();
	delete c.review;
	assert.ok(inspectConfig(c).some((i) => i.path === "review"));
});

test("ICA3: missing a required review dial is an issue", () => {
	const c = validV3();
	delete c.review.onShortfall;
	assert.ok(inspectConfig(c).some((i) => i.path === "review.onShortfall"));
});

test("ICA3: missing shape block is an issue", () => {
	const c = validV3();
	delete c.shape;
	assert.ok(inspectConfig(c).some((i) => i.path === "shape"));
});

test("ICA3: overrides with an empty track object is an issue", () => {
	const c = validV3();
	c.overrides = { reversible: {} };
	assert.ok(inspectConfig(c).some((i) => i.path.startsWith("overrides.reversible")));
});

test("ICA3: per-track brainstorm override is rejected", () => {
	const c = validV3();
	c.overrides = { reversible: { review: { brainstorm: "off" } } };
	assert.ok(inspectConfig(c).some((i) => i.path.startsWith("overrides.reversible.review")));
});

// ICA4: panels sans rules/minVendor; a phase without prefer is invalid.
test("ICA4: panels.rules is an unknown key", () => {
	const c = validV3();
	c.panels.rules = { excludeAuthorVendor: true };
	assert.ok(inspectConfig(c).some((i) => i.path === "panels.rules"));
});

test("ICA4: panels.phases.*.minVendor is an unknown key", () => {
	const c = validV3();
	c.panels.phases.pr_review.minVendor = 2;
	assert.ok(inspectConfig(c).some((i) => i.path.includes("minVendor")));
});

test("ICA4: a panels phase without prefer is invalid", () => {
	const c = validV3();
	c.panels.phases.pr_review = { panelSize: 3 };
	assert.ok(inspectConfig(c).some((i) => i.path.includes("pr_review")));
});

// ICA6/ICA7: the clean break — old configs refused honestly; no migration surface.
test("ICA7: migrate.mjs does not exist", () => {
	assert.equal(existsSync(join(scripts, "migrate.mjs")), false);
});

test("ICA7: no migration symbols remain in scripts", () => {
	const out = spawnSync("grep", ["-rlE", "FORWARD_MIGRATIONS|planMigration|applyMigration|MIGRATE_FIRST", scripts], { encoding: "utf8" });
	assert.equal(out.stdout.trim(), "", `migration symbols found in: ${out.stdout}`);
});

test("ICA6: schema-older remedy names re-run/pin and never 'migration'", async () => {
	const { REMEDY_SCHEMA_OLDER } = await import("../skills/sdlc/scripts/lib.mjs");
	const msg = REMEDY_SCHEMA_OLDER(2);
	assert.match(msg, /setup/);
	assert.doesNotMatch(msg, /migrat/i);
});

test("ICA6: a v2 config is refused (not mutated) by readConfig", () => {
	const root = mkdtempSync(join(tmpdir(), "sdlc-v3-"));
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	const p = join(root, ".pi", "sdlc", "sdlc.config.json");
	const v2 = { schemaVersion: 2, prefix: "x", labelPrefix: "x", announce: "x", panels: { phases: {} } };
	writeFileSync(p, `${JSON.stringify(v2)}\n`);
	const src = `import { readConfig } from ${JSON.stringify(join(scripts, "lib.mjs"))}; readConfig(${JSON.stringify(root)});`;
	const res = spawnSync(process.execPath, ["--input-type=module", "-e", src], { encoding: "utf8" });
	assert.notEqual(res.status, 0);
	assert.match(res.stderr, /schemaVersion 2/);
	assert.doesNotMatch(res.stderr, /migrat/i);
	assert.equal(readFileSync(p, "utf8"), `${JSON.stringify(v2)}\n`); // untouched
});

// Version classification is total and treats v1+v2+v3 as recognised-older, v4 as
// current, and >4 as newer (clean break, no migration).
test("ICA6: classifyConfigVersion is total over the version matrix", () => {
	assert.equal(CONFIG_SCHEMA_VERSION, 4);
	assert.equal(classifyConfigVersion({ schemaVersion: 1 }).kind, "older");
	assert.equal(classifyConfigVersion({ schemaVersion: 2 }).kind, "older");
	assert.equal(classifyConfigVersion({ schemaVersion: 3 }).kind, "older");
	assert.equal(classifyConfigVersion({ schemaVersion: 4 }).kind, "current");
	assert.equal(classifyConfigVersion({ schemaVersion: 5 }).kind, "newer");
	assert.equal(classifyConfigVersion({ schemaVersion: "4" }).kind, "invalid");
	assert.equal(classifyConfigVersion({}).kind, "invalid");
	assert.equal(classifyConfigVersion(null).kind, "invalid");
});

// ICA20: syntax-aware purge — retired config vocabulary is not read from any
// runtime path (allowlist: retired-flag diagnostics in setup-sdlc.mjs).
test("ICA20: retired config vocabulary has no runtime reader", () => {
	const retired = ["profile", "minVendor", "excludeAuthorVendor", "enforcement", "mergePlanSpec", "publishThreshold"];
	const runtimeScripts = ["lib.mjs", "resolve-panel.mjs", "check-lifecycle.mjs", "sdlc-status.mjs"];
	for (const file of runtimeScripts) {
		const body = readFileSync(join(scripts, file), "utf8");
		for (const token of retired) assert.doesNotMatch(body, new RegExp(`\\b${token}\\b`), `${file} references retired '${token}'`);
	}
	// setup-sdlc.mjs may only name retired FLAGS in its retirement diagnostics.
	const setup = readFileSync(join(scripts, "setup-sdlc.mjs"), "utf8");
	for (const token of ["minVendor", "excludeAuthorVendor", "mergePlanSpec", "publishThreshold"]) {
		assert.doesNotMatch(setup, new RegExp(`\\b${token}\\b`), `setup-sdlc.mjs references retired '${token}'`);
	}
	// 'profile'/'enforcement' appear only inside the retired-flag handling (case label or SetupError).
	for (const line of setup.split("\n")) {
		if (/\b(profile|enforcement)\b/.test(line)) assert.match(line, /retired|case "--(profile|enforcement)"/, `unexpected retired vocab: ${line.trim()}`);
	}
});

// ICA21: SKILL points the tracker-publish decision at shape.publishToTracker.
test("ICA21: SKILL reads shape.publishToTracker (no hardcoded task-count law)", () => {
	const skill = readFileSync(join(repo, "skills", "sdlc", "SKILL.md"), "utf8");
	assert.match(skill, /shape\.publishToTracker/);
	// tracker-backed Build law moved to the phase reference; it must read the dial, not a fixed count
	const tasksRef = readFileSync(join(repo, "skills", "sdlc", "references", "phase-tasks.md"), "utf8");
	assert.match(tasksRef, /shape\.publishToTracker/);
	assert.doesNotMatch(tasksRef, /\btwo or more tasks\b/);
});
