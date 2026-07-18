// Dogfood retro tests (lt-t8, scenario LT27): the committed
// docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist, the
// run.json validates against the committed schema, and its coverage markers
// honestly record the pre-instrumentation gap (partial coverage by design —
// this feature's own run was only partway instrumented when the emitter
// first existed). Offline (NF1): reads only the committed artifacts.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const retroDir = join(repoRoot, "docs", "retros", "sdlc-lifecycle-telemetry");
const runPath = join(retroDir, "run.json");
const indexPath = join(retroDir, "index.html");

function readRunSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`run schema is not valid JSON: ${error.message}`);
	}
}
const schemaValidate = new Ajv().compile(readRunSchema());

function readRun() {
	try {
		return JSON.parse(readFileSync(runPath, "utf8"));
	} catch (error) {
		assert.fail(`dogfood run.json is not valid JSON: ${error.message}`);
	}
}

test("LT27: docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist", () => {
	assert.ok(existsSync(runPath), "run.json must be committed");
	assert.ok(existsSync(indexPath), "index.html must be committed");
});

test("LT27: the dogfood run.json validates against the committed schema and hand-rolled validator", () => {
	const run = readRun();
	assert.equal(schemaValidate(run), true, JSON.stringify(schemaValidate.errors));
	assert.deepEqual(validateRunJson(run), [], "hand-rolled validator agrees with the committed schema");
	assert.equal(run.schemaVersion, 1);
	assert.equal(run.slug, "sdlc-lifecycle-telemetry");
});

test("LT27: coverage markers honestly record the pre-instrumentation gap (partial coverage by design)", () => {
	const run = readRun();
	const markers = run.coverage.map((c) => c.marker);
	// this feature's manifest only exists from the point the emitter (lt-t1)
	// landed partway through implement — phase.entered/gate.approved events
	// from brainstorm/plan/spec/build were never recorded, and no LLM seam was
	// used for this real one-time collection (author's choice, spec §build).
	assert.ok(markers.length > 0, "an honest dogfood run names at least one coverage gap");
	assert.ok(markers.includes("soft.absent"), "no LLM seam was used for the real dogfood collection");
	// the hard section must never claim phase data it doesn't have: no
	// fabricated phase spans or by-phase rollups for the uninstrumented period.
	assert.deepEqual(run.hard.phases, [], "phase spans are honestly empty (phase.entered was never recorded pre-lt-t2)");
	assert.deepEqual(run.hard.rollups.byPhase, [], "by-phase rollups are honestly empty for the same reason");
	// hard totals and by-model rollups, by contrast, ARE measured (from the
	// correlated session and git diff stats) and must be present.
	assert.ok(run.hard.totals.tokens > 0, "hard totals are genuinely measured, not fabricated");
	assert.ok(run.hard.rollups.byModel.length > 0, "by-model rollups are genuinely measured");
});

test("LT27: the committed dashboard renders all seven anchors for the dogfood run", () => {
	const html = readFileSync(indexPath, "utf8");
	for (const anchor of ["exec-strip", "phase-swimlane", "cost-breakdown", "panel-deepdive", "steering-map", "rework-panel", "coverage"]) {
		assert.ok(html.includes(`id="${anchor}"`), `missing anchor #${anchor}`);
	}
	assert.ok(!/https?:\/\//.test(html), "no external references in the committed dashboard");
});
