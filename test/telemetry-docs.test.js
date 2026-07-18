// Docs, FS11 inventory, and structural coverage tests (lt-t7). Scenarios
// LT24-LT25: the sdlc SKILL.md hook-token contract, sdlc-retro SKILL.md's
// skill-relative collect/render invocations, FS11 inventory correctness, and
// the structural omission-coverage test the FS11 checker itself cannot
// perform (it can't detect an *omitted* entry). Offline (NF1): no network.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
// The agent self-documentation stream relocated the FS13 telemetry section from
// SKILL.md into the package system reference (kernel-first SKILL ceiling).
const telemetryDoc = readFileSync(join(repoRoot, "skills", "sdlc", "references", "system-reference.md"), "utf8");
const retroSkillMd = readFileSync(join(repoRoot, "skills", "sdlc-retro", "SKILL.md"), "utf8");
const inventoryPath = join(repoRoot, "skills", "sdlc", "assets", "normative-references.json");
const checkReferences = join(repoRoot, "skills", "sdlc", "scripts", "check-references.mjs");

function inventory() {
	try {
		return JSON.parse(readFileSync(inventoryPath, "utf8"));
	} catch (error) {
		assert.fail(`inventory is not valid JSON: ${error.message}`);
	}
}

// ---------------------------------------------------------------------------
// LT24 — each mandated sdlc SKILL.md hook step contains record-run-event.sh
// and its event-type token; the panel-dispatch step (and the validator-
// dispatch step) additionally contains the skill-relative harvest-panel.sh
// token; sdlc-retro SKILL.md names collect/render invocations
// skill-relatively (FS12 forms).
// ---------------------------------------------------------------------------
const MANDATED_EVENTS = ["run.started", "phase.entered", "gate.approved", "panel.dispatched", "panel.consolidated", "lifecycle.checked", "pr.opened", "pr.fix_wave"];

test("LT24: every mandated hook step names record-run-event.sh and its event-type token together", () => {
	for (const event of MANDATED_EVENTS) {
		const idx = telemetryDoc.indexOf(event);
		assert.ok(idx >= 0, `event token '${event}' must appear in the telemetry doc`);
		const window = telemetryDoc.slice(Math.max(0, idx - 400), idx + 400);
		assert.ok(window.includes("record-run-event.sh"), `event '${event}' must be co-located with a record-run-event.sh mention`);
	}
});

test("LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh", () => {
	const dispatchIdx = telemetryDoc.indexOf("panel.dispatched");
	assert.ok(dispatchIdx >= 0);
	const dispatchWindow = telemetryDoc.slice(dispatchIdx, dispatchIdx + 600);
	assert.ok(dispatchWindow.includes("harvest-panel.sh"), "panel-dispatch step must name harvest-panel.sh");

	const telemetrySectionIdx = telemetryDoc.indexOf("Lifecycle telemetry (FS13)");
	assert.ok(telemetrySectionIdx >= 0);
	const telemetrySection = telemetryDoc.slice(telemetrySectionIdx);
	assert.ok(/validator dispatch also harvests[\s\S]*harvest-panel\.sh/.test(telemetrySection), "the validator-dispatch step must name harvest-panel.sh");
});

test("LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms)", () => {
	assert.ok(retroSkillMd.includes("scripts/collect-run.sh --slug"), "skill-relative collect invocation");
	assert.ok(retroSkillMd.includes("node <skill-dir>/scripts/collect-run.mjs"), "headless node fallback for collect");
	assert.ok(retroSkillMd.includes("scripts/render-retro.sh --run"), "skill-relative render invocation");
	assert.ok(retroSkillMd.includes("node <skill-dir>/scripts/render-retro.mjs"), "headless node fallback for render");
});

// ---------------------------------------------------------------------------
// LT25 — check-references passes with the new inventory entries; a mutation
// deleting a new entry's target file fails it.
// ---------------------------------------------------------------------------
test("LT25: check-references passes with the new inventory entries", () => {
	const r = spawnSync(process.execPath, [checkReferences, "--format", "json"], { encoding: "utf8" });
	assert.equal(r.status, 0, r.stdout);
	let report;
	try {
		report = JSON.parse(r.stdout);
	} catch (error) {
		assert.fail(`check-references report is not valid JSON: ${error.message}\n${r.stdout}`);
	}
	assert.equal(report.state, "pass");
	const newIds = ["script.record-run-event", "script.harvest-panel", "retro.script.collect-run", "retro.script.render-retro", "retro.schema.event", "retro.schema.run", "retro.schema.llm-protocol", "retro.skill.source", "telemetry.adr-0028", "sdlc.skill.telemetry-section"];
	for (const id of newIds) {
		const check = report.checks.find((c) => c.id === id);
		assert.ok(check, `check ${id} must be present`);
		assert.equal(check.status, "pass", `${id}: ${check.message}`);
	}
});

test("LT25: deleting a new entry's target file fails check-references", () => {
	// the inventory path must resolve inside the package root (check-references
	// refuses an inventory outside it), so the scratch file lives under the
	// repo's own reviews scratch area rather than a system tmpdir.
	const pkgRoot = repoRoot;
	const dir = mkdtempSync(join(pkgRoot, "docs", "reviews", ".sdlc-lt25-"));
	try {
		const scratchInventory = join(dir, "inventory.json");
		const inv = inventory();
		// isolate to a single new entry so the mutation is unambiguous
		const entry = inv.sources.find((s) => s.id === "retro.script.render-retro");
		assert.ok(entry);
		writeFileSync(scratchInventory, JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", discovery: { roots: [], exclude: [] }, sources: [entry] }));
		const before = spawnSync(process.execPath, [checkReferences, "--package-root", pkgRoot, "--inventory", scratchInventory, "--format", "json"], { encoding: "utf8" });
		assert.equal(JSON.parse(before.stdout).state, "pass");

		// mutate: point the entry's target at a file that doesn't exist
		const mutated = { ...entry, target: "skills/sdlc-retro/scripts/does-not-exist.mjs" };
		writeFileSync(scratchInventory, JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", discovery: { roots: [], exclude: [] }, sources: [mutated] }));
		const after = spawnSync(process.execPath, [checkReferences, "--package-root", pkgRoot, "--inventory", scratchInventory, "--format", "json"], { encoding: "utf8" });
		const report = JSON.parse(after.stdout);
		assert.equal(report.state, "fail");
		assert.equal(after.status, 1);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Structural omission-coverage test (spec §9): the FS11 checker cannot detect
// an *omitted* entry, so this test asserts every script under
// skills/sdlc-retro/scripts/, every hook script named by §4, every committed
// schema file under skills/sdlc-retro/schema/, ADR 0028, and every run-store/
// retro path named normatively by either SKILL.md has an inventory entry.
// ---------------------------------------------------------------------------
function hasEntryFor(inv, relPath) {
	return inv.sources.some((s) => s.source === relPath || s.target === relPath);
}

test("structural coverage: every sdlc-retro script has an FS11 inventory entry", () => {
	const inv = inventory();
	const scriptsDir = join(repoRoot, "skills", "sdlc-retro", "scripts");
	for (const f of readdirSync(scriptsDir)) {
		assert.ok(hasEntryFor(inv, `skills/sdlc-retro/scripts/${f}`), `missing FS11 entry for skills/sdlc-retro/scripts/${f}`);
	}
});

test("structural coverage: every hook script named by §4 has an FS11 inventory entry", () => {
	const inv = inventory();
	for (const rel of ["skills/sdlc/scripts/record-run-event.mjs", "skills/sdlc/scripts/record-run-event.sh", "skills/sdlc/scripts/harvest-panel.mjs", "skills/sdlc/scripts/harvest-panel.sh"]) {
		assert.ok(hasEntryFor(inv, rel), `missing FS11 entry for ${rel}`);
	}
});

test("structural coverage: every committed sdlc-retro schema file has an FS11 inventory entry", () => {
	const inv = inventory();
	const schemaDir = join(repoRoot, "skills", "sdlc-retro", "schema");
	for (const f of readdirSync(schemaDir)) {
		assert.ok(hasEntryFor(inv, `skills/sdlc-retro/schema/${f}`), `missing FS11 entry for skills/sdlc-retro/schema/${f}`);
	}
});

test("structural coverage: ADR 0028 has an FS11 inventory entry and exists", () => {
	const inv = inventory();
	assert.ok(existsSync(join(repoRoot, "docs", "adr", "0028-lifecycle-telemetry-fs13.md")));
	assert.ok(hasEntryFor(inv, "docs/adr/0028-lifecycle-telemetry-fs13.md"));
});

test("structural coverage: every run-store/retro path named normatively by either SKILL.md has an inventory entry", () => {
	const inv = inventory();
	const NORMATIVE_PATH_PHRASES = [".pi/sdlc/runs/<slug>/", "docs/retros/<slug>/run.json"];
	for (const phrase of NORMATIVE_PATH_PHRASES) {
		assert.ok(retroSkillMd.includes(phrase), `sdlc-retro SKILL.md must name ${phrase}`);
		const covered = inv.sources.some((s) => s.source === "skills/sdlc-retro/SKILL.md" && s.assertion.includes(phrase));
		assert.ok(covered, `missing FS11 entry covering the ${phrase} path reference`);
	}
});
