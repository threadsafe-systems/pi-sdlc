// Offline tests for FS1 hooks + readConfig strict mode (spec scenarios OH1, OH2).
// No live/paid model calls (NFR2). Pure lib.mjs + JSON Schema (ajv) checks.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { readConfig } from "../skills/sdlc/scripts/lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skill = join(repo, "skills", "sdlc");
const schema = JSON.parse(readFileSync(join(skill, "schema", "sdlc.config.schema.json"), "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
const validateSchema = ajv.compile(schema);

const BASE = { schemaVersion: 1, prefix: "acme", labelPrefix: "acme-sdlc", announce: "a" };
const GOOD_HOOKS = {
	implement: { before: [{ use: "tool:my_worktree_tool", do: "enter the worktree" }] },
	"*": { after: [{ run: "scripts/notify.sh done" }] },
};

// validateConfig exits the process on failure; run it in a child to capture the code.
function validateConfigExit(configObj) {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-hookc-"));
	const pj = join(dir, ".pi", "sdlc");
	mkdirSync(pj, { recursive: true });
	writeFileSync(join(pj, "sdlc.config.json"), JSON.stringify(configObj));
	try {
		execFileSync("node", ["--input-type=module", "-e", `import { readConfig } from ${JSON.stringify(join(skill, "scripts", "lib.mjs"))}; readConfig(${JSON.stringify(dir)});`], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
		return { code: 0 };
	} catch (e) {
		return { code: e.status ?? 1, stderr: e.stderr ?? "" };
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

test("OH1: valid hooks pass both the JSON Schema and validateConfig", () => {
	const cfg = { ...BASE, hooks: GOOD_HOOKS };
	assert.ok(validateSchema(cfg), `schema rejected valid hooks: ${JSON.stringify(validateSchema.errors)}`);
	assert.equal(validateConfigExit(cfg).code, 0, "validateConfig rejected valid hooks");
});

test("OH1: the committed example (with hooks) validates against the schema", () => {
	const example = JSON.parse(readFileSync(join(skill, "schema", "sdlc.config.example.json"), "utf8"));
	assert.ok(example.hooks, "example must carry hooks");
	assert.ok(validateSchema(example), `example invalid: ${JSON.stringify(validateSchema.errors)}`);
});

test("OH1: mutations are rejected by BOTH the schema and validateConfig (exit 2)", () => {
	const mutations = {
		"empty top-level hooks": {},
		"unknown phase key": { deploy: { after: [{ run: "x" }] } },
		"unknown hook kind": { plan: { before: [{ exec: "x" }] } },
		"empty do": { plan: { before: [{ use: "tool:t", do: "" }] } },
		"multi-line run": { plan: { before: [{ run: "line1\nline2" }] } },
		"multi-line do": { plan: { before: [{ use: "tool:t", do: "a\nb" }] } },
		"both run and use": { plan: { before: [{ run: "x", use: "tool:t", do: "y" }] } },
		"empty before array": { plan: { before: [] } },
		"empty phase object": { plan: {} },
		"bad use pattern": { plan: { before: [{ use: "worktree", do: "x" }] } },
		"unknown timing key": { plan: { during: [{ run: "x" }] } },
	};
	for (const [label, hooks] of Object.entries(mutations)) {
		const cfg = { ...BASE, hooks };
		assert.equal(validateSchema(cfg), false, `schema wrongly accepted: ${label}`);
		assert.equal(validateConfigExit(cfg).code, 2, `validateConfig wrongly accepted: ${label}`);
	}
});

test("OH2: readConfig strict mode rejects a missing manifest naming /setup-sdlc", () => {
	const empty = mkdtempSync(join(tmpdir(), "sdlc-nomani-"));
	try {
		execFileSync("node", ["--input-type=module", "-e", `import { readConfig } from ${JSON.stringify(join(skill, "scripts", "lib.mjs"))}; readConfig(${JSON.stringify(empty)}, { requireManifest: true });`], { stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
		assert.fail("strict mode should have exited non-zero");
	} catch (e) {
		assert.equal(e.status, 2, "missing manifest under strict mode must exit 2");
		assert.match(e.stderr, /\/setup-sdlc/, "diagnostic must name /setup-sdlc");
	} finally {
		rmSync(empty, { recursive: true, force: true });
	}
});

test("OH2: default readConfig returns defaults for a missing manifest", () => {
	const empty = mkdtempSync(join(tmpdir(), "sdlc-defs-"));
	try {
		const cfg = readConfig(empty);
		assert.equal(cfg.prefix, "sdlc");
		assert.equal(cfg.labelPrefix, "sdlc");
	} finally {
		rmSync(empty, { recursive: true, force: true });
	}
});

test("OH2: strict mode returns the config (incl. hooks) when the manifest is present", () => {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-present-"));
	const pj = join(dir, ".pi", "sdlc");
	mkdirSync(pj, { recursive: true });
	writeFileSync(join(pj, "sdlc.config.json"), JSON.stringify({ ...BASE, hooks: GOOD_HOOKS }));
	try {
		const cfg = readConfig(dir, { requireManifest: true });
		assert.equal(cfg.prefix, "acme");
		assert.deepEqual(cfg.hooks, GOOD_HOOKS);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
