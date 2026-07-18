// FS13 harvest-panel tests (lt-t3): copying pi-subagents lifecycle artifacts
// from an async run directory into the run store, with honest missed[]
// coverage on partial/missing sources. Scenarios LT11-LT12. Offline (NF1).

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const harvestPanel = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.mjs");
const harvestPanelSh = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.sh");

function tmp(prefix = "sdlc-lt3-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

function eventsPath(root, slug) {
	return join(root, ".pi", "sdlc", "runs", slug, "events.jsonl");
}

function parseLine(line) {
	try {
		return JSON.parse(line);
	} catch (e) {
		assert.fail(`line is not valid JSON: ${e.message}\n${line}`);
	}
}

function readEvents(root, slug) {
	if (!existsSync(eventsPath(root, slug))) return [];
	return readFileSync(eventsPath(root, slug), "utf8").split("\n").filter(Boolean).map(parseLine);
}

// A fixture pi-subagents asyncDir: status.json + events.jsonl at top level.
function mkAsyncDir({ status = true, events = true, transcripts = false } = {}) {
	const dir = tmp("sdlc-lt3-asyncdir-");
	if (status) writeFileSync(join(dir, "status.json"), JSON.stringify({ state: "completed" }));
	if (events) writeFileSync(join(dir, "events.jsonl"), `${JSON.stringify({ event: "subagent.run.started" })}\n`);
	if (transcripts) {
		mkdirSync(join(dir, "transcripts"), { recursive: true });
		writeFileSync(join(dir, "transcripts", "child-1.md"), "# transcript\n");
	}
	return dir;
}

function run(args = []) {
	const r = spawnSync(process.execPath, [harvestPanel, ...args], { encoding: "utf8" });
	return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

// ---------------------------------------------------------------------------
// LT11 — harvesting a fixture pi-subagents run dir copies status.json +
// events.jsonl into panels/<panelPhase>-round<N>-<date>/ and emits
// panel.harvested; --with-transcripts also copies transcripts, default does
// not.
// ---------------------------------------------------------------------------
test("LT11: harvest copies status.json + events.jsonl and emits panel.harvested", () => {
	const root = tmp("sdlc-lt3-root-");
	const src = mkAsyncDir();
	try {
		const r = run(["--phase", "pr_review", "--round", "1", "--from", src, "--repo-root", root, "--slug", "lt11-run"]);
		assert.equal(r.status, 0, r.stderr);
		const date = new Date().toISOString().slice(0, 10);
		const destDir = join(root, ".pi", "sdlc", "runs", "lt11-run", "panels", `pr_review-round1-${date}`);
		assert.equal(existsSync(join(destDir, "status.json")), true);
		assert.equal(existsSync(join(destDir, "events.jsonl")), true);
		assert.equal(existsSync(join(destDir, "transcripts")), false, "no transcripts without --with-transcripts");
		assert.deepEqual(JSON.parse(readFileSync(join(destDir, "status.json"), "utf8")), { state: "completed" });

		const events = readEvents(root, "lt11-run");
		assert.equal(events.length, 1);
		assert.equal(events[0].event, "panel.harvested");
		assert.equal(events[0].by, "script:harvest-panel");
		assert.equal(events[0].payload.panelPhase, "pr_review");
		assert.equal(events[0].payload.round, 1);
		assert.deepEqual(events[0].payload.missed, []);
		assert.ok(events[0].payload.dir.includes("panels"));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});

test("LT11: --with-transcripts copies the transcripts/ subdirectory", () => {
	const root = tmp("sdlc-lt3-root-");
	const src = mkAsyncDir({ transcripts: true });
	try {
		const r = run(["--phase", "pr_review", "--round", "2", "--from", src, "--repo-root", root, "--slug", "lt11-tr", "--with-transcripts"]);
		assert.equal(r.status, 0, r.stderr);
		const date = new Date().toISOString().slice(0, 10);
		const destDir = join(root, ".pi", "sdlc", "runs", "lt11-tr", "panels", `pr_review-round2-${date}`);
		assert.equal(existsSync(join(destDir, "transcripts", "child-1.md")), true);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT12 — a missing source dir and a partially-present one (status without
// events) exit 0 with missed[] in the envelope and the event payload.
// ---------------------------------------------------------------------------
test("LT12: a missing source directory exits 0 with both files missed", () => {
	const root = tmp("sdlc-lt3-root-");
	const missingFrom = join(root, "no-such-dir");
	try {
		const r = run(["--phase", "spec_review", "--round", "1", "--from", missingFrom, "--repo-root", root, "--slug", "lt12-missing", "--format", "json"]);
		assert.equal(r.status, 0, r.stderr);
		const report = JSON.parse(r.stdout);
		assert.deepEqual(report.missed.sort(), ["events.jsonl", "status.json"]);
		const events = readEvents(root, "lt12-missing");
		assert.deepEqual(events[0].payload.missed.sort(), ["events.jsonl", "status.json"]);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT12: a partially-present source (status without events) reports one missed", () => {
	const root = tmp("sdlc-lt3-root-");
	const src = mkAsyncDir({ status: true, events: false });
	try {
		const r = run(["--phase", "spec_review", "--round", "1", "--from", src, "--repo-root", root, "--slug", "lt12-partial", "--format", "json"]);
		assert.equal(r.status, 0, r.stderr);
		const report = JSON.parse(r.stdout);
		assert.deepEqual(report.missed, ["events.jsonl"]);
		const date = new Date().toISOString().slice(0, 10);
		const destDir = join(root, ".pi", "sdlc", "runs", "lt12-partial", "panels", `spec_review-round1-${date}`);
		assert.equal(existsSync(join(destDir, "status.json")), true);
		assert.equal(existsSync(join(destDir, "events.jsonl")), false);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Usage-error and CLI sanity.
// ---------------------------------------------------------------------------
test("harvest-panel: unknown phase and non-positive round exit 2", () => {
	const root = tmp("sdlc-lt3-root-");
	const src = mkAsyncDir();
	try {
		const badPhase = run(["--phase", "bogus", "--round", "1", "--from", src, "--repo-root", root]);
		assert.equal(badPhase.status, 2);
		const badRound = run(["--phase", "pr_review", "--round", "0", "--from", src, "--repo-root", root]);
		assert.equal(badRound.status, 2);
		const missingArgs = run(["--phase", "pr_review"]);
		assert.equal(missingArgs.status, 2);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});

test("harvest-panel.sh wrapper delegates to .mjs identically", () => {
	const root = tmp("sdlc-lt3-root-");
	const src = mkAsyncDir();
	try {
		const r = spawnSync("bash", [harvestPanelSh, "--phase", "pr_review", "--round", "1", "--from", src, "--repo-root", root, "--slug", "lt-sh"], { encoding: "utf8" });
		assert.equal(r.status, 0, r.stderr);
		const date = new Date().toISOString().slice(0, 10);
		const destDir = join(root, ".pi", "sdlc", "runs", "lt-sh", "panels", `pr_review-round1-${date}`);
		assert.equal(existsSync(join(destDir, "status.json")), true);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(src, { recursive: true, force: true });
	}
});
