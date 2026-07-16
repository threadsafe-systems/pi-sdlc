import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { CONFIG_SCHEMA_VERSION, KNOWN_PAST_VERSIONS, REMEDY_SCHEMA_NEWER, REMEDY_SCHEMA_OLDER, classifyConfigVersion, inspectConfig, readConfigRawForMigration } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const lib = join(repo, "skills", "sdlc", "scripts", "lib.mjs");
const ensureAgent = join(repo, "skills", "sdlc", "scripts", "ensure-panel-agent.mjs");
const fixtureRoot = join(repo, "test", "fixtures", "config-versioning");

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`invalid JSON fixture ${path}: ${error.message}`);
	}
}

function tempRoot(prefix = "sdlc-cv-") {
	const root = mkdtempSync(join(tmpdir(), prefix));
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	return root;
}

function writeConfig(root, value) {
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(value, null, 2)}\n`);
}

function clone(value) {
	return structuredClone(value);
}

function directoryBytes(root) {
	const out = {};
	const walk = (dir) => {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) walk(path);
			else out[relative(root, path)] = readFileSync(path).toString("base64");
		}
	};
	walk(root);
	return out;
}

const full = readJson(join(repo, "skills", "sdlc", "schema", "sdlc.config.example.json"));

function expectOnlyPath(value, path) {
	const issues = inspectConfig(value);
	assert.equal(issues.length, 1, JSON.stringify(issues));
	assert.equal(issues[0].path, path);
}

test("CV1: merged full-union config validates and panels vocabulary is closed per path", () => {
	assert.deepEqual(inspectConfig(full), []);

	const panelUnknown = clone(full);
	panelUnknown.panels.foo = true;
	expectOnlyPath(panelUnknown, "panels.foo");

	const rulesUnknown = clone(full);
	rulesUnknown.panels.rules.foo = true;
	expectOnlyPath(rulesUnknown, "panels.rules.foo");

	const phasesUnknown = clone(full);
	phasesUnknown.panels.phases.foo = { prefer: ["p/m"] };
	expectOnlyPath(phasesUnknown, "panels.phases.foo");

	const phaseUnknown = clone(full);
	phaseUnknown.panels.phases.plan_review.foo = true;
	expectOnlyPath(phaseUnknown, "panels.phases.plan_review.foo");

	const requiredMissing = clone(full);
	delete requiredMissing.panels.phases.plan_review.prefer;
	expectOnlyPath(requiredMissing, "panels.phases.plan_review.prefer");
});

test("CV2: enforcement, panel floors, preferences, and exact phase set validate", () => {
	const prompt = clone(full);
	prompt.enforcement = "prompt";
	expectOnlyPath(prompt, "enforcement");

	const floor = clone(full);
	floor.panels.phases.plan_review.minVendor = 0;
	expectOnlyPath(floor, "panels.phases.plan_review.minVendor");

	const prefer = clone(full);
	prefer.panels.phases.plan_review.prefer = "p/m";
	expectOnlyPath(prefer, "panels.phases.plan_review.prefer");

	const phase = clone(full);
	delete phase.panels.phases.task_validate;
	expectOnlyPath(phase, "panels.phases.task_validate");

	const noPanels = clone(full);
	delete noPanels.panels;
	assert.deepEqual(inspectConfig(noPanels), []);
	delete noPanels.enforcement;
	assert.deepEqual(inspectConfig(noPanels), []);
});

test("CV3: config version classification is total and throw-free over the normative matrix", () => {
	assert.equal(CONFIG_SCHEMA_VERSION, 2);
	assert.deepEqual([...KNOWN_PAST_VERSIONS], [1]);
	assert.deepEqual(classifyConfigVersion({ schemaVersion: 2 }), { kind: "current" });
	assert.deepEqual(classifyConfigVersion({ schemaVersion: 1 }), { kind: "older", version: 1 });
	assert.deepEqual(classifyConfigVersion({ schemaVersion: 3 }), { kind: "newer", version: 3 });
	for (const raw of [{ schemaVersion: "2" }, { schemaVersion: 2.5 }, { schemaVersion: 0 }, { schemaVersion: -1 }, {}, null, [], "x", undefined]) {
		assert.doesNotThrow(() => classifyConfigVersion(raw));
		assert.deepEqual(classifyConfigVersion(raw), { kind: "invalid" });
	}
	assert.equal(REMEDY_SCHEMA_OLDER(1), "config schemaVersion 1 predates this skill (requires 2) — run the setup-sdlc migration interactively to fold it forward, or pin pi-sdlc to a release before the schema-2 major");
	assert.equal(REMEDY_SCHEMA_NEWER(3), "config schemaVersion 3 is newer than this skill (requires 2) — upgrade pi-sdlc, or run the pinned pi-sdlc release that wrote this config");
});

test("CV4: lifecycle and minVendor coexist without additive schema constraints", () => {
	const config = {
		schemaVersion: 2,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		enforcement: "strict",
		lifecycle: { profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 1 } } },
		panels: {
			phases: Object.fromEntries(["plan_review", "spec_review", "pr_review", "task_validate"].map((phase) => [phase, { minVendor: 99, prefer: ["p/m"] }])),
		},
	};
	assert.deepEqual(inspectConfig(config), []);
	assert.equal(config.lifecycle.gates.pr_review.minPanel, 1);
	assert.equal(config.panels.phases.pr_review.minVendor, 99);
});

test("CV5: guarded loader and inherited consumer halt on v1 without prompt or write", () => {
	const root = tempRoot();
	const v1 = readJson(join(fixtureRoot, "migration-input", "pair-a", "sdlc.config.json"));
	writeConfig(root, v1);
	const before = directoryBytes(root);
	const ttyPrelude = "Object.defineProperty(process.stdin, 'isTTY', { value: true }); process.stdin.read = () => { throw new Error('stdin read attempted'); };";
	const loadScript = `${ttyPrelude} const { readConfig } = await import(${JSON.stringify(lib)}); readConfig(${JSON.stringify(root)});`;
	const loaded = spawnSync(process.execPath, ["--input-type=module", "-e", loadScript], { encoding: "utf8", input: "y\n" });
	assert.equal(loaded.status, 2);
	assert.equal(loaded.stdout, "");
	assert.equal(loaded.stderr, `sdlc: ${REMEDY_SCHEMA_OLDER(1)}\n`);
	assert.deepEqual(directoryBytes(root), before);

	const preload = join(root, "tty-preload.mjs");
	writeFileSync(preload, ttyPrelude);
	const beforeConsumer = directoryBytes(root);
	const inherited = spawnSync(process.execPath, ["--import", preload, ensureAgent, "pr_review", "--config", root], { encoding: "utf8", input: "y\n" });
	assert.equal(inherited.status, 2);
	assert.equal(inherited.stdout, "");
	assert.equal(inherited.stderr, `sdlc: ${REMEDY_SCHEMA_OLDER(1)}\n`);
	assert.deepEqual(directoryBytes(root), beforeConsumer);
});

test("CV5: raw migration read preserves absent/parsed/malformed states and importer containment", () => {
	const root = tempRoot();
	assert.deepEqual(readConfigRawForMigration(root), { config: { status: "absent" }, models: { status: "absent" } });
	const configText = '{"schemaVersion":1}\n';
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), configText);
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.models.json"), "{not json\n");
	const raw = readConfigRawForMigration(root);
	assert.deepEqual(raw.config, { status: "parsed", value: { schemaVersion: 1 }, text: configText });
	assert.equal(raw.models.status, "malformed");
	assert.equal(raw.models.text, "{not json\n");
	assert.match(raw.models.error, /JSON/);

	const scripts = join(repo, "skills", "sdlc", "scripts");
	const importers = readdirSync(scripts)
		.filter((name) => name.endsWith(".mjs"))
		.filter((name) => /import\s*\{[^}]*\breadConfigRawForMigration\b[^}]*\}\s*from/s.test(readFileSync(join(scripts, name), "utf8")));
	assert.ok(
		importers.every((name) => name === "setup-sdlc.mjs" || name === "migrate.mjs"),
		JSON.stringify(importers),
	);
});
