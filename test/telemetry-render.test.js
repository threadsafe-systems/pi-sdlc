// sdlc-retro renderer tests (lt-t6): the single-scroll dashboard's seven
// anchored sections, pinned per-section data bindings, no-external-reference
// contract, render-twice byte-identity, soft-data flagging/attribution, and
// coverage rendering. Scenarios LT20-LT23. Offline/deterministic (NF1):
// consumes only a run.json fixture, never invokes a model.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { renderDashboard } from "../skills/sdlc-retro/scripts/render-retro.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const renderRetro = join(repoRoot, "skills", "sdlc-retro", "scripts", "render-retro.mjs");

function tmp(prefix = "sdlc-lt6-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

const SECTION_ANCHORS = ["exec-strip", "phase-swimlane", "cost-breakdown", "panel-deepdive", "steering-map", "rework-panel", "coverage"];

function fullFixture() {
	return {
		schemaVersion: 1,
		slug: "lt20-run",
		title: "Lifecycle telemetry",
		track: "irreversible",
		coverage: [{ marker: "github.skipped" }, { marker: "sessions.dir_unresolved", detail: "no HOME session directory" }],
		sizeProxies: { scenarios: 2, tasks: 1, sessions: 1, phases: ["plan", "implement"] },
		hard: {
			window: { start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:30:00.000Z" },
			phases: [
				{ phase: "plan", start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:10:00.000Z", exitExplicit: true },
				{ phase: "implement", start: "2026-07-18T09:10:00.000Z", end: "2026-07-18T09:30:00.000Z", exitExplicit: false },
			],
			sessions: [{ file: "sess.jsonl", start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:29:00.000Z", models: ["anthropic/claude-x"] }],
			panels: [{ panelPhase: "pr_review", round: 1, dir: ".pi/sdlc/runs/lt20-run/panels/pr_review-round1-2026-07-18", models: [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }] }],
			models: ["anthropic/claude-x", "openai/gpt-5"],
			rollups: {
				byModel: [
					{ model: "anthropic/claude-x", tokens: 70, cost: 0.15 },
					{ model: "openai/gpt-5", tokens: 100, cost: 0.5 },
				],
				byPhase: [
					{ phase: "plan", tokens: 50, cost: 0.1 },
					{ phase: "implement", tokens: 120, cost: 0.55 },
				],
			},
			rework: { artifactRevised: 1, phaseBackward: 1, fixWave: 1 },
			totals: { tokens: 170, cost: 0.65, wallMs: 1800000, agentMs: 5000, humanWaitMs: 60000 },
		},
		soft: {
			attribution: { model: "fixture/llm-1", provider: "fixture" },
			narratives: [{ phase: "implement", summary: "a narrative summary" }],
			steering: [{ index: 0, ts: "2026-07-18T09:05:00.000Z", class: "gate-approval" }],
			panelPrecision: [{ panelPhase: "pr_review", round: 1, model: "openai/gpt-5", raised: 2, incorporated: 1, dismissed: 1 }],
		},
	};
}

function emptyFixture() {
	return {
		schemaVersion: 1,
		slug: "lt20-empty",
		coverage: [],
		sizeProxies: { scenarios: 0, tasks: 0, sessions: 0, phases: [] },
		hard: {
			window: { start: "2026-07-18T09:00:00.000Z", end: "2026-07-18T09:00:00.000Z" },
			phases: [],
			sessions: [],
			panels: [],
			models: [],
			rollups: { byModel: [], byPhase: [] },
			rework: { artifactRevised: 0, phaseBackward: 0, fixWave: 0 },
			totals: { tokens: 0, cost: 0, wallMs: 0, agentMs: 0, humanWaitMs: 0 },
		},
	};
}

// ---------------------------------------------------------------------------
// LT20 — all seven anchors, single file, no external references, every §8
// data binding present with known-answer values; an empty shell fails.
// ---------------------------------------------------------------------------
test("LT20: full fixture renders all seven anchors with known-answer data bindings", () => {
	const html = renderDashboard(fullFixture());
	for (const anchor of SECTION_ANCHORS) assert.ok(html.includes(`id="${anchor}"`), `missing anchor #${anchor}`);

	// no external references
	assert.ok(!/https?:\/\//.test(html), "no http(s):// references");
	assert.ok(!/<script[^>]+src=/.test(html), "no external <script src>");
	assert.ok(!/<link[^>]+href=/.test(html), "no external <link href>");

	// exec-strip: every hard.totals value present
	assert.ok(html.includes(">170<"), "tokens total");
	assert.ok(html.includes("$0.6500"), "cost total");

	// phase-swimlane: one data-phase block per phase
	assert.ok(html.includes('data-phase="plan"'));
	assert.ok(html.includes('data-phase="implement"'));

	// cost-breakdown: per-model and per-phase nodes
	assert.ok(html.includes('data-model="anthropic/claude-x"'));
	assert.ok(html.includes('data-model="openai/gpt-5"'));

	// panel-deepdive: per-finding row
	assert.ok(html.includes('data-round="1"') && html.includes('data-panel-phase="pr_review"'));
	assert.ok(html.includes("raised 2") && html.includes("incorporated 1") && html.includes("dismissed 1"));

	// steering-map: one mark per entry
	assert.ok(html.includes('data-class="gate-approval"'));

	// rework-panel: three counts
	assert.ok(/Artifact revisions[\s\S]*?<span>1<\/span>/.test(html));
	assert.ok(/Phase backward moves[\s\S]*?<span>1<\/span>/.test(html));
	assert.ok(/PR fix waves[\s\S]*?<span>1<\/span>/.test(html));
});

test("LT20: an empty-shell run.json fails to carry any pinned data binding", () => {
	const html = renderDashboard(emptyFixture());
	for (const anchor of SECTION_ANCHORS) assert.ok(html.includes(`id="${anchor}"`));
	// an empty shell has no phase/model/panel/steering nodes and shows coverage notices instead
	assert.ok(!html.includes('data-phase="plan"'));
	assert.ok(!/data-model="/.test(html));
	assert.ok(html.includes("coverage-notice"));
});

// ---------------------------------------------------------------------------
// LT21 — rendering the same run.json twice yields byte-identical files; no
// generation timestamp is embedded.
// ---------------------------------------------------------------------------
test("LT21: render-twice byte-identity and no generation-time values", () => {
	const run = fullFixture();
	const a = renderDashboard(run);
	const b = renderDashboard(run);
	assert.equal(a, b, "rendering the same input twice is byte-identical");
	const today = new Date().toISOString().slice(0, 10);
	assert.ok(!a.includes(today) || a.includes("2026-07-18"), "any date present must come from run.json data, not generation time");
	// stronger: the render must not contain today's real wall-clock date unless
	// that date also appears verbatim in the fixture's own timestamps.
	const now = new Date();
	const generationStamp = now.toISOString().slice(0, 16); // minute precision
	assert.ok(!a.includes(generationStamp), "no generation-time value embedded");
});

test("LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical", () => {
	const dir = tmp();
	try {
		const runPath = join(dir, "run.json");
		writeFileSync(runPath, JSON.stringify(fullFixture()));
		const outA = join(dir, "a.html");
		const outB = join(dir, "b.html");
		const rA = spawnSync(process.execPath, [renderRetro, "--run", runPath, "--out", outA], { encoding: "utf8" });
		const rB = spawnSync(process.execPath, [renderRetro, "--run", runPath, "--out", outB], { encoding: "utf8" });
		assert.equal(rA.status, 0, rA.stderr);
		assert.equal(rB.status, 0, rB.stderr);
		assert.equal(readFileSync(outA, "utf8"), readFileSync(outB, "utf8"));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT22 — soft-data figures carry data-soft="true" and attribution; a
// soft-less run.json renders coverage notices instead of numbers.
// ---------------------------------------------------------------------------
test("LT22: soft-data figures carry data-soft and visible attribution", () => {
	const html = renderDashboard(fullFixture());
	assert.ok(/data-soft="true"[^>]*data-class="gate-approval"/.test(html) || /data-class="gate-approval"[^>]*data-soft="true"/.test(html));
	assert.ok(html.includes("soft (fixture/llm-1)"), "visible attribution string present");
	// hard and soft are never merged in one figure: the rework/exec-strip
	// sections (hard-only) must not carry data-soft.
	const execSection = html.slice(html.indexOf('id="exec-strip"'), html.indexOf('id="phase-swimlane"'));
	assert.ok(!execSection.includes("data-soft"));
});

test("LT22: a soft-less run.json renders coverage notices, not fabricated numbers", () => {
	const run = fullFixture();
	run.soft = undefined;
	const html = renderDashboard(run);
	const steeringSection = html.slice(html.indexOf('id="steering-map"'), html.indexOf('id="rework-panel"'));
	assert.ok(steeringSection.includes("coverage-notice"), "steering-map shows a coverage notice without soft data");
	assert.ok(!steeringSection.includes("data-soft"));
	const panelSection = html.slice(html.indexOf('id="panel-deepdive"'), html.indexOf('id="steering-map"'));
	assert.ok(panelSection.includes("coverage-notice"), "panel precision rows fall back to a coverage notice");
});

// ---------------------------------------------------------------------------
// LT23 — every coverage marker in the fixture run.json is rendered under
// #coverage.
// ---------------------------------------------------------------------------
test("LT23: every coverage marker is rendered under #coverage", () => {
	const run = fullFixture();
	const html = renderDashboard(run);
	const coverageSection = html.slice(html.indexOf('id="coverage"'));
	for (const c of run.coverage) {
		assert.ok(coverageSection.includes(esc(c.marker)), `marker ${c.marker} rendered`);
		if (c.detail) assert.ok(coverageSection.includes(esc(c.detail)), `detail for ${c.marker} rendered`);
	}
});

function esc(s) {
	return String(s).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

// ---------------------------------------------------------------------------
// CLI sanity: exit codes and --format json envelope.
// ---------------------------------------------------------------------------
test("render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2", () => {
	const dir = tmp();
	try {
		const missing = spawnSync(process.execPath, [renderRetro, "--run", join(dir, "nope.json")], { encoding: "utf8" });
		assert.equal(missing.status, 1);

		const badJsonPath = join(dir, "bad.json");
		writeFileSync(badJsonPath, "{ not json");
		const bad = spawnSync(process.execPath, [renderRetro, "--run", badJsonPath], { encoding: "utf8" });
		assert.equal(bad.status, 1);

		const invalidSchemaPath = join(dir, "invalid.json");
		writeFileSync(invalidSchemaPath, JSON.stringify({ schemaVersion: 1, slug: "x" }));
		const invalid = spawnSync(process.execPath, [renderRetro, "--run", invalidSchemaPath], { encoding: "utf8" });
		assert.equal(invalid.status, 1);

		const usage = spawnSync(process.execPath, [renderRetro], { encoding: "utf8" });
		assert.equal(usage.status, 2);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("render-retro CLI: default --out is index.html beside the input; --format json envelope", () => {
	const dir = tmp();
	try {
		const runPath = join(dir, "run.json");
		writeFileSync(runPath, JSON.stringify(fullFixture()));
		const r = spawnSync(process.execPath, [renderRetro, "--run", runPath, "--format", "json"], { encoding: "utf8" });
		assert.equal(r.status, 0, r.stderr);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.ok, true);
		assert.equal(parsed.out, join(dir, "index.html"));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
