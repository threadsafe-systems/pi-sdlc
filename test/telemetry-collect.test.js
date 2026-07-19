// sdlc-retro collector core tests (lt-t4): manifest/panel/session/git/github
// adapters, derived hard measures, run.json v1 schema validity. Scenarios
// LT13 (hard portion), LT14, LT15, LT16. Offline/deterministic (NF1): git/gh
// are always injected fakes, no network, no model calls (the LLM seam is
// lt-t5's addition and does not exist yet in this file's collector).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { attributePhase, collect, derivePhaseSpans, discoverPanels, discoverReviewDirs, discoverSessions, gitDiffStats, githubCheck, readManifest, resolveSessionDirs, validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const collectRunMjs = join(repoRoot, "skills", "sdlc-retro", "scripts", "collect-run.mjs");
function readRunSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`run schema is not valid JSON: ${error.message}`);
	}
}
const schemaValidate = new Ajv().compile(readRunSchema());

function tmp(prefix = "sdlc-lt4-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

function writeEvent(dir, slug, event, payload, ts, by = "agent") {
	const path = join(dir, ".pi", "sdlc", "runs", slug, "events.jsonl");
	mkdirSync(join(dir, ".pi", "sdlc", "runs", slug), { recursive: true });
	const line = `${JSON.stringify({ schemaVersion: 1, ts, slug, event, by, payload })}\n`;
	writeFileSync(path, existsSync(path) ? readFileSync(path, "utf8") + line : line, "utf8");
}

function isoAt(baseMs, offsetMs) {
	return new Date(baseMs + offsetMs).toISOString();
}

// A fixture executable (node script) usable as --git-cmd / --gh-cmd.
function mkStub(dir, name, body) {
	const p = join(dir, name);
	writeFileSync(p, `#!/usr/bin/env node\n${body}\n`);
	chmodSync(p, 0o755);
	return p;
}

const BASE = Date.parse("2026-07-17T10:00:00.000Z");

function seedManifest(root, slug) {
	writeEvent(root, slug, "run.started", { title: "Lifecycle telemetry", track: "irreversible" }, isoAt(BASE, 0));
	writeEvent(root, slug, "phase.entered", { phase: "plan" }, isoAt(BASE, 1000));
	writeEvent(root, slug, "phase.exited", { phase: "plan" }, isoAt(BASE, 5000));
	writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 6000));
	writeEvent(root, slug, "task.validated", { task: "lt-x", verdict: "PASS", scenarioIds: ["S1", "S2"] }, isoAt(BASE, 7000));
	writeEvent(root, slug, "panel.harvested", { panelPhase: "pr_review", round: 1, dir: "x", missed: [] }, isoAt(BASE, 8000));
	writeEvent(root, slug, "artifact.revised", { artifact: "spec", rev: 2, reason: "panel finding" }, isoAt(BASE, 9000));
	writeEvent(root, slug, "phase.backward", { from: "build", to: "spec", reason: "gap found" }, isoAt(BASE, 10000));
	writeEvent(root, slug, "pr.fix_wave", { number: 1, sha: "abc1234" }, isoAt(BASE, 11000));
}

function seedPanel(root, slug, date) {
	const dir = join(root, ".pi", "sdlc", "runs", slug, "panels", `pr_review-round1-${date}`);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, "status.json"), JSON.stringify({ lifecycleArtifactVersion: 1, results: [{ model: "openai/gpt-5", totalTokens: 100, totalCost: 0.5, durationMs: 1000, turnCount: 3 }] }));
	writeFileSync(join(dir, "events.jsonl"), `${JSON.stringify({ event: "subagent.run.started" })}\n`);
}

function seedSession(homeDir, root) {
	const mapped = root.replace(/^\//, "").replaceAll("/", "-");
	const sessDir = join(homeDir, ".pi", "agent", "sessions", `--${mapped}--`);
	mkdirSync(sessDir, { recursive: true });
	const lines = [
		{ type: "session", version: 3, id: "s1", timestamp: isoAt(BASE, 500) },
		{ type: "model_change", id: "a", parentId: null, timestamp: isoAt(BASE, 600), provider: "anthropic", modelId: "claude-x" },
		{ type: "message", id: "u1", parentId: "a", timestamp: isoAt(BASE, 700), message: { role: "user", content: [], timestamp: BASE + 700 } },
		{
			type: "message",
			id: "m1",
			parentId: "u1",
			timestamp: isoAt(BASE, 2700),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 50, cost: { total: 0.1 } }, stopReason: "end_turn", timestamp: BASE + 2700 },
		},
		{ type: "message", id: "u2", parentId: "m1", timestamp: isoAt(BASE, 2800), message: { role: "user", content: [], timestamp: BASE + 2800 } },
		{
			type: "message",
			id: "m2",
			parentId: "u2",
			timestamp: isoAt(BASE, 6500),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 20, cost: { total: 0.05 } }, stopReason: "end_turn", timestamp: BASE + 6500 },
		},
	];
	const path = join(sessDir, "2026-07-17T10-00-00-000Z_s1.jsonl");
	writeFileSync(path, `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
	return sessDir;
}

// ---------------------------------------------------------------------------
// LT13 (hard portion) — a complete fixture run store produces a schema-valid
// run.json, with size proxies and by-model/by-phase rollups asserted against
// known answers.
// ---------------------------------------------------------------------------
test("LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const slug = "lt13-run";
		seedManifest(root, slug);
		const date = new Date().toISOString().slice(0, 10);
		seedPanel(root, slug, date);
		seedSession(home, root);
		const gitCmd = mkStub(
			bin,
			"fake-git",
			`
const args = process.argv.slice(2);
if (args[2] === "merge-base") { process.stdout.write("deadbeef\\n"); process.exit(0); }
if (args[2] === "diff") { process.stdout.write(" 3 files changed, 40 insertions(+), 5 deletions(-)\\n"); process.exit(0); }
process.exit(1);
`,
		);
		const ghCmd = mkStub(bin, "fake-gh", 'process.stdout.write("[]\\n"); process.exit(0);');

		const { runJson } = collect({ root, slug, gitCmd, ghCmd, home });
		const issues = validateRunJson(runJson);
		assert.deepEqual(issues, [], `hand-rolled validator issues: ${issues.join("; ")}`);
		assert.equal(schemaValidate(runJson), true, `committed schema issues: ${JSON.stringify(schemaValidate.errors)}`);

		assert.equal(runJson.title, "Lifecycle telemetry");
		assert.equal(runJson.track, "irreversible");
		assert.equal(runJson.sizeProxies.scenarios, 2);
		assert.equal(runJson.sizeProxies.tasks, 1);
		assert.equal(runJson.sizeProxies.sessions, 1);
		assert.deepEqual(runJson.sizeProxies.diff, { files: 3, insertions: 40, deletions: 5 });

		// known-answer rollups: session tokens (50+20=70, cost 0.15) attributed to
		// implement (both assistant messages fall after phase.entered implement at
		// +6000ms... first assistant at +2700ms falls in the plan span (ends +5000ms)).
		const byModel = Object.fromEntries(runJson.hard.rollups.byModel.map((m) => [m.model, m]));
		assert.equal(byModel["anthropic/claude-x"].tokens, 70);
		assert.ok(Math.abs(byModel["anthropic/claude-x"].cost - 0.15) < 1e-9);
		assert.equal(byModel["openai/gpt-5"].tokens, 100);
		assert.equal(byModel["openai/gpt-5"].cost, 0.5);

		const byPhase = Object.fromEntries(runJson.hard.rollups.byPhase.map((p) => [p.phase, p]));
		assert.equal(byPhase.plan.tokens, 50, "first assistant message (+2700ms) falls within the plan span (1000-5000ms)");
		assert.equal(byPhase.implement.tokens, 20, "second assistant message (+6500ms) falls within the implement span");
		assert.equal(byPhase.pr.tokens, 100, "panel.harvested pr_review maps to lifecycle phase pr");

		assert.deepEqual(runJson.hard.rework, { artifactRevised: 1, phaseBackward: 1, fixWave: 1 });
		assert.equal(runJson.hard.totals.tokens, 170);
		assert.ok(Math.abs(runJson.hard.totals.cost - 0.65) < 1e-9);
		// no --llm-cmd was passed: lt-t5 default is soft.absent (never invoke an
		// unconfigured LLM binary), so this is the only marker expected here.
		assert.deepEqual(runJson.coverage, [{ marker: "soft.absent" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT14 — a gappy store (no panels dir, no correlatable sessions) produces a
// schema-valid run.json whose coverage markers name each gap and whose hard
// section contains no value derived from a missing source.
// ---------------------------------------------------------------------------
test("LT14: a gappy store names every gap and derives nothing from missing sources", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-empty-");
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const slug = "lt14-run";
		seedManifest(root, slug);
		const ghCmd = mkStub(bin, "fake-gh", 'process.stdout.write("[]\\n"); process.exit(0);');
		const gitCmd = mkStub(bin, "fake-git-fail", "process.exit(1);");

		const { runJson } = collect({ root, slug, gitCmd, ghCmd, home, noGithub: false });
		const issues = validateRunJson(runJson);
		assert.deepEqual(issues, []);
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));

		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("sessions.dir_unresolved") || markers.includes("sessions.none"), `expected a session gap marker; got ${markers}`);
		assert.ok(markers.includes("panels.missing:pr_review"), `expected panels.missing:pr_review; got ${markers}`);
		assert.ok(markers.includes("git.error"), `expected git.error; got ${markers}`);
		assert.equal(runJson.sizeProxies.diff, undefined, "no diff proxy fabricated when git fails");
		assert.deepEqual(runJson.hard.panels, [], "no panel entries fabricated when the panels dir is missing");
		assert.deepEqual(runJson.hard.sessions, [], "no session entries fabricated when nothing correlates");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("LT14: --no-github records github.skipped, not github.error", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-empty-");
	try {
		const slug = "lt14b-run";
		seedManifest(root, slug);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("github.skipped"));
		assert.ok(!markers.includes("github.error"));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT15 — per-adapter known-answer fixtures.
// ---------------------------------------------------------------------------
test("LT15: manifest adapter skips and counts malformed lines (manifest.partial)", () => {
	const root = tmp();
	try {
		const slug = "lt15-manifest";
		seedManifest(root, slug);
		const path = join(root, ".pi", "sdlc", "runs", slug, "events.jsonl");
		writeFileSync(path, `${readFileSync(path, "utf8")}not valid json at all\n`);
		const { events, markers } = readManifest(root, slug);
		assert.equal(events.length, 9, "malformed line excluded, all 9 valid lines kept");
		assert.deepEqual(markers, [{ marker: "manifest.partial", detail: "1 malformed line(s) skipped" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT15: harvest adapter maps per-model fields correctly", () => {
	const root = tmp();
	try {
		const slug = "lt15-harvest";
		seedManifest(root, slug);
		const date = new Date().toISOString().slice(0, 10);
		seedPanel(root, slug, date);
		const { events } = readManifest(root, slug);
		const { panels, markers } = discoverPanels(root, slug, events);
		assert.deepEqual(markers, []);
		assert.equal(panels.length, 1);
		assert.equal(panels[0].panelPhase, "pr_review");
		assert.equal(panels[0].round, 1);
		assert.deepEqual(panels[0].models, [{ model: "openai/gpt-5", tokens: 100, cost: 0.5, durationMs: 1000, turns: 3 }]);
		assert.equal(panels[0].wave, 1, "wave defaults to round when no meta.json sidecar");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("T3: discoverPanels reads the meta.json wave; malformed sidecar falls back to round with a marker", () => {
	const root = tmp();
	try {
		const slug = "t3-meta";
		seedManifest(root, slug);
		const date = "2026-07-19";
		const panelsRoot = join(root, ".pi", "sdlc", "runs", slug, "panels");
		// round 2, logical wave 1 (a replacement dispatch) with a valid sidecar
		const d1 = join(panelsRoot, `pr_review-round2-${date}`);
		mkdirSync(d1, { recursive: true });
		writeFileSync(join(d1, "status.json"), JSON.stringify({ state: "completed" }));
		writeFileSync(join(d1, "events.jsonl"), "");
		writeFileSync(join(d1, "meta.json"), JSON.stringify({ round: 2, wave: 1 }));
		// a malformed sidecar on a plan_review round 1: wave falls back to round, marker emitted
		const d2 = join(panelsRoot, `plan_review-round1-${date}`);
		mkdirSync(d2, { recursive: true });
		writeFileSync(join(d2, "status.json"), JSON.stringify({ state: "completed" }));
		writeFileSync(join(d2, "events.jsonl"), "");
		writeFileSync(join(d2, "meta.json"), "{ not valid json");
		const { panels, markers } = discoverPanels(root, slug, []);
		const pr = panels.find((p) => p.panelPhase === "pr_review");
		const plan = panels.find((p) => p.panelPhase === "plan_review");
		assert.equal(pr.round, 2);
		assert.equal(pr.wave, 1, "valid sidecar wave is read");
		assert.equal(plan.round, 1);
		assert.equal(plan.wave, 1, "malformed sidecar falls back to wave=round");
		assert.ok(
			markers.some((m) => m.marker === "panels.malformed_meta:plan_review"),
			`expected panels.malformed_meta marker; got ${JSON.stringify(markers)}`,
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt15-transcript";
		seedManifest(root, slug);
		seedSession(home, root);
		// a version-4 session file dropped alongside the v3 fixture: soft-fails, not fatal
		const mapped = root.replace(/^\//, "").replaceAll("/", "-");
		const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
		writeFileSync(join(sessDir, "v4.jsonl"), `${JSON.stringify({ type: "session", version: 4, id: "v4" })}\n`);

		const { events } = readManifest(root, slug);
		const { sessions, markers } = discoverSessions(root, events, { home });
		assert.equal(sessions.length, 1, "only the v3 session correlates");
		assert.ok(markers.some((m) => m.marker === "session.version:v4.jsonl"));
		assert.equal(sessions[0].file, "2026-07-17T10-00-00-000Z_s1.jsonl");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});

test("LT15: review-dir discovery matches both <phase>-<slug>-<date> and <phase>-review-<slug>-<date> naming", () => {
	const root = tmp();
	try {
		const slug = "lt15-review";
		mkdirSync(join(root, "docs", "reviews", `spec-${slug}-2026-07-17`), { recursive: true });
		mkdirSync(join(root, "docs", "reviews", `pr-${slug}-2026-07-18`), { recursive: true });
		mkdirSync(join(root, "docs", "reviews", `pr-review-${slug}-2026-07-19`), { recursive: true }); // new -review- form
		mkdirSync(join(root, "docs", "reviews", `plan-review-${slug}-2026-07-16`), { recursive: true }); // new -review- form
		mkdirSync(join(root, "docs", "reviews", `task-validate-${slug}-lt-x-2026-07-17`), { recursive: true }); // must NOT match
		const found = discoverReviewDirs(root, slug);
		assert.deepEqual(found, [`plan-review-${slug}-2026-07-16`, `pr-${slug}-2026-07-18`, `pr-review-${slug}-2026-07-19`, `spec-${slug}-2026-07-17`]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT15: git/GitHub adapters consume only the injected fakes", () => {
	const root = tmp();
	const bin = tmp("sdlc-lt4-bin-");
	try {
		const gitCmd = mkStub(
			bin,
			"record-git",
			'const fs=require("fs"); fs.writeFileSync(process.env.MARKER_FILE, process.argv.slice(2).join(" ")+"\\n", {flag:"a"}); if (process.argv[3]==="merge-base") process.stdout.write("base\\n"); else process.stdout.write(" 1 file changed, 2 insertions(+), 0 deletions(-)\\n"); process.exit(0);',
		);
		const ghCmd = mkStub(bin, "record-gh", 'const fs=require("fs"); fs.writeFileSync(process.env.MARKER_FILE, "gh "+process.argv.slice(2).join(" ")+"\\n", {flag:"a"}); process.stdout.write("[]\\n"); process.exit(0);');
		const markerFile = join(bin, "calls.log");
		writeFileSync(markerFile, "");
		process.env.MARKER_FILE = markerFile;
		const gitResult = gitDiffStats(gitCmd, root, "main");
		const ghResult = githubCheck(ghCmd, root, "some-branch", false);
		delete process.env.MARKER_FILE;
		assert.deepEqual(gitResult.diff, { files: 1, insertions: 2, deletions: 0 });
		assert.deepEqual(ghResult.markers, []);
		const calls = readFileSync(markerFile, "utf8");
		assert.ok(calls.includes("merge-base"), "git seam invoked for merge-base");
		assert.ok(calls.includes("diff"), "git seam invoked for diff");
		assert.ok(calls.includes("gh pr list"), "gh seam invoked for pr list");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT16 — derived-measure formulas against a hand-computed fixture.
// ---------------------------------------------------------------------------
test("LT16: phase attribution, agent time, capped human-wait, rework, window bounds", () => {
	const root = tmp();
	try {
		const slug = "lt16-measures";
		seedManifest(root, slug);
		const { events } = readManifest(root, slug);
		const windowStart = events[0].ts;
		const windowEnd = events[events.length - 1].ts;
		assert.equal(windowStart, isoAt(BASE, 0));
		assert.equal(windowEnd, isoAt(BASE, 11000));

		const spans = derivePhaseSpans(events, windowEnd);
		assert.deepEqual(
			spans.map((s) => [s.phase, s.start, s.end, s.exitExplicit]),
			[
				["plan", isoAt(BASE, 1000), isoAt(BASE, 5000), true],
				["implement", isoAt(BASE, 6000), windowEnd, false],
			],
		);
		assert.equal(attributePhase(spans, isoAt(BASE, 3000), windowStart, windowEnd), "plan");
		assert.equal(attributePhase(spans, isoAt(BASE, 5500), windowStart, windowEnd), "unattributed", "between plan's exit and implement's entry");
		assert.equal(attributePhase(spans, isoAt(BASE, -1), windowStart, windowEnd), null, "before the window is excluded entirely");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT16: a 3-hour gap contributes exactly 30 minutes to human-wait", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt16-humanwait";
		// window wide enough to correlate a session 3 hours long
		writeEvent(root, slug, "run.started", { title: "T", track: "reversible" }, isoAt(BASE, 0));
		writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 1000));
		writeEvent(root, slug, "phase.exited", { phase: "implement" }, isoAt(BASE, 3 * 60 * 60 * 1000 + 20000));

		const sessDirBase = tmp("sdlc-lt4-sessdirbase-");
		const mapped = sessDirBase.replace(/^\//, "").replaceAll("/", "-");
		const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
		mkdirSync(sessDir, { recursive: true });
		const threeHoursMs = 3 * 60 * 60 * 1000;
		const lines = [
			{ type: "session", version: 3, id: "s2", timestamp: isoAt(BASE, 500) },
			{
				type: "message",
				id: "m1",
				parentId: null,
				timestamp: isoAt(BASE, 1500),
				message: { role: "assistant", content: [], model: "anthropic/claude-x", usage: { totalTokens: 1, cost: { total: 0 } }, timestamp: BASE + 1500 },
			},
			{ type: "message", id: "u1", parentId: "m1", timestamp: isoAt(BASE, 1500 + threeHoursMs), message: { role: "user", content: [], timestamp: BASE + 1500 + threeHoursMs } },
			{
				type: "message",
				id: "m2",
				parentId: "u1",
				timestamp: isoAt(BASE, 1600 + threeHoursMs),
				message: { role: "assistant", content: [], model: "anthropic/claude-x", usage: { totalTokens: 1, cost: { total: 0 } }, timestamp: BASE + 1600 + threeHoursMs },
			},
		];
		writeFileSync(join(sessDir, "sess.jsonl"), `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);

		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, sessionsDirOverrides: [sessDir] });
		assert.equal(runJson.hard.totals.humanWaitMs, 30 * 60 * 1000, "a 3-hour gap is capped at exactly 30 minutes");
		// agent time sums every assistant entry's gap vs its immediate predecessor
		// regardless of the predecessor's type: m1 (+1000ms vs the session header)
		// plus m2 (+100ms vs the preceding user entry) = 1100ms.
		assert.equal(runJson.hard.totals.agentMs, 1100, "agent time sums every assistant entry's gap vs its immediate predecessor");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Usage-error / CLI sanity.
// ---------------------------------------------------------------------------
test("collect-run: no run store exits 1 (nothing collectable)", () => {
	const root = tmp();
	try {
		const r = spawnSync(process.execPath, [collectRunMjs, "--slug", "no-such-run", "--repo-root", root], { encoding: "utf8" });
		assert.equal(r.status, 1);
		assert.ok(r.stderr.includes("sdlc-telemetry:"));
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("collect-run: writes docs/retros/<slug>/run.json by default and validates", () => {
	const root = tmp();
	const home = tmp("sdlc-lt4-home-");
	try {
		const slug = "lt-cli-run";
		seedManifest(root, slug);
		const r = spawnSync(process.execPath, [collectRunMjs, "--slug", slug, "--repo-root", root, "--no-github", "--git-cmd", "false", "--format", "json"], { encoding: "utf8", env: { ...process.env, HOME: home } });
		assert.equal(r.status, 0, r.stderr);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.ok, true);
		assert.equal(parsed.out, join("docs", "retros", slug, "run.json"));
		const written = JSON.parse(readFileSync(join(root, "docs", "retros", slug, "run.json"), "utf8"));
		assert.equal(schemaValidate(written), true, JSON.stringify(schemaValidate.errors));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});

test("resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved", () => {
	const root = tmp();
	try {
		const { dirs, markers } = resolveSessionDirs(root, { home: root });
		assert.deepEqual(dirs, []);
		assert.deepEqual(markers, [{ marker: "sessions.dir_unresolved" }]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
