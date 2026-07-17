import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { CONFIG_DEFAULTS, REMEDY_SCHEMA_NEWER, readConfig } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const lib = join(repo, "skills", "sdlc", "scripts", "lib.mjs");

function tempRoot() {
	const root = mkdtempSync(join(tmpdir(), "sdlc-lib-config-"));
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	return root;
}

function writeConfig(root, config) {
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config)}\n`);
}

function childRead(root) {
	const source = `const { readConfig } = await import(${JSON.stringify(lib)}); readConfig(${JSON.stringify(root)});`;
	return spawnSync(process.execPath, ["--input-type=module", "-e", source], { encoding: "utf8" });
}

test("readConfig returns current defaults when the manifest is absent", () => {
	const root = tempRoot();
	assert.deepEqual(readConfig(root), { ...CONFIG_DEFAULTS, paths: { ...CONFIG_DEFAULTS.paths }, tracker: undefined });
});

test("readConfig validates and returns merged v2 fields", () => {
	const root = tempRoot();
	const panels = {
		phases: Object.fromEntries(["plan_review", "spec_review", "pr_review", "task_validate"].map((phase) => [phase, { prefer: ["p/m"] }])),
	};
	writeConfig(root, { schemaVersion: 2, prefix: "x", labelPrefix: "x", announce: "x", paths: { plans: "plans" }, enforcement: "strict", panels });
	assert.deepEqual(readConfig(root), {
		schemaVersion: 2,
		prefix: "x",
		labelPrefix: "x",
		announce: "x",
		paths: { ...CONFIG_DEFAULTS.paths, plans: "plans" },
		tracker: undefined,
		hooks: undefined,
		enforcement: "strict",
		panels,
	});
});

test("readConfig keeps newer and malformed version diagnostics distinct", () => {
	const newerRoot = tempRoot();
	writeConfig(newerRoot, { schemaVersion: 3 });
	const newer = childRead(newerRoot);
	assert.equal(newer.status, 2);
	assert.equal(newer.stderr, `sdlc: ${REMEDY_SCHEMA_NEWER(3)}\n`);

	const invalidRoot = tempRoot();
	writeConfig(invalidRoot, { schemaVersion: "2", prefix: "x", labelPrefix: "x", announce: "x" });
	const invalid = childRead(invalidRoot);
	assert.equal(invalid.status, 2);
	assert.match(invalid.stderr, /schemaVersion must be 2/);
	assert.doesNotMatch(invalid.stderr, /newer than this skill|predates this skill/);
});
