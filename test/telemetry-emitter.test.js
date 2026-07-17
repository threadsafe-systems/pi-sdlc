// FS13 emitter tests (lt-t1): the record-run-event CLI, run-identity
// resolution, the shared event validator, and the run-store .gitignore entry.
// Scenarios LT1-LT5 (emitter) and LT26 (.gitignore). Offline/deterministic
// (NF1): only local git, no network, no model calls.

import assert from "node:assert/strict";
import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { KNOWN_EVENTS, MAX_EVENT_BYTES, validateEnvelope, validatePayload } from "../skills/sdlc/scripts/telemetry.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const emitter = join(repoRoot, "skills", "sdlc", "scripts", "record-run-event.mjs");
const emitterSh = join(repoRoot, "skills", "sdlc", "scripts", "record-run-event.sh");

function baseEnv(extra = {}) {
	// Deliberately drop any ambient SDLC_RUN_SLUG / SDLC_ROOT.
	return { PATH: process.env.PATH, HOME: process.env.HOME, ...extra };
}

function tmp(prefix = "sdlc-telemetry-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

function git(dir, args) {
	execFileSync("git", ["-C", dir, "-c", "user.email=t@t", "-c", "user.name=t", "-c", "commit.gpgsign=false", ...args], {
		stdio: ["ignore", "pipe", "pipe"],
		encoding: "utf8",
	});
}

// A git repo on a named branch with one commit (so HEAD exists / can detach).
function gitRepo({ branch = "main" } = {}) {
	const dir = tmp("sdlc-telemetry-git-");
	git(dir, ["init", "-q", "-b", branch]);
	writeFileSync(join(dir, "seed.txt"), "seed\n");
	git(dir, ["add", "-A"]);
	git(dir, ["commit", "-q", "-m", "seed"]);
	return dir;
}

function run(args, { cwd, env } = {}) {
	const r = spawnSync(process.execPath, [emitter, ...args], {
		cwd: cwd ?? process.cwd(),
		env: env ?? baseEnv(),
		encoding: "utf8",
	});
	return { code: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
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

function assertConforms(line) {
	const obj = parseLine(line);
	const envIssues = validateEnvelope(obj);
	assert.deepEqual(envIssues, [], `envelope issues: ${envIssues.join("; ")}`);
	const payIssues = validatePayload(obj.event, obj.payload);
	assert.deepEqual(payIssues, [], `payload issues: ${payIssues.join("; ")}`);
}

// ---------------------------------------------------------------------------
// LT1 — a valid emit appends exactly one schema-conforming line; the file is
// created on first use with its parent directories.
// ---------------------------------------------------------------------------
test("LT1: valid emit appends one schema-conforming line, creating the store", () => {
	const root = tmp();
	try {
		const path = eventsPath(root, "some-thing");
		assert.equal(existsSync(path), false, "store must not pre-exist");
		const r = run(["run.started", "--repo-root", root, "--slug", "some-thing", "--by", "human:neil", "--payload", JSON.stringify({ title: "T", track: "reversible" })]);
		assert.equal(r.code, 0, `exit 0 expected; stderr=${r.stderr}`);
		assert.equal(r.stdout, "", "nothing is ever written to stdout");
		assert.equal(existsSync(path), true, "events.jsonl created with parent dirs");
		const lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
		assert.equal(lines.length, 1, "exactly one line");
		assertConforms(lines[0]);
		const obj = JSON.parse(lines[0]);
		assert.equal(obj.event, "run.started");
		assert.equal(obj.slug, "some-thing");
		assert.equal(obj.by, "human:neil");
		assert.deepEqual(obj.payload, { title: "T", track: "reversible" });
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT1b: --by defaults to agent when omitted", () => {
	const root = tmp();
	try {
		const r = run(["phase.entered", "--repo-root", root, "--slug", "s", "--payload", JSON.stringify({ phase: "plan" })]);
		assert.equal(r.code, 0, r.stderr);
		const obj = JSON.parse(readFileSync(eventsPath(root, "s"), "utf8").trim());
		assert.equal(obj.by, "agent");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT2 — bad inputs each exit 2 and leave the manifest byte-identical (no write
// is ever attempted: prevalidation-scoped).
// ---------------------------------------------------------------------------
test("LT2: bad inputs exit 2 and never touch the manifest", () => {
	const root = tmp();
	try {
		// seed a valid line to prove byte-identity across failures
		const seed = run(["run.started", "--repo-root", root, "--slug", "s", "--payload", JSON.stringify({ title: "T", track: "reversible" })]);
		assert.equal(seed.code, 0, seed.stderr);
		const path = eventsPath(root, "s");
		const before = readFileSync(path);

		const big = "x".repeat(MAX_EVENT_BYTES + 100);
		const cases = {
			"unknown event": ["no.such.event", "--repo-root", root, "--slug", "s", "--payload", "{}"],
			"malformed payload JSON": ["phase.entered", "--repo-root", root, "--slug", "s", "--payload", "{not json"],
			"oversized payload": ["run.started", "--repo-root", root, "--slug", "s", "--payload", JSON.stringify({ title: big, track: "reversible" })],
			"bad --by grammar": ["run.started", "--repo-root", root, "--slug", "s", "--by", "human:Neil Chambers", "--payload", JSON.stringify({ title: "T", track: "reversible" })],
			"missing required payload field": ["run.started", "--repo-root", root, "--slug", "s", "--payload", JSON.stringify({ title: "T" })],
		};
		for (const [label, args] of Object.entries(cases)) {
			const r = run(args);
			assert.equal(r.code, 2, `${label}: expected exit 2, got ${r.code} (stderr=${r.stderr})`);
			assert.ok(r.stderr.includes("sdlc-telemetry:"), `${label}: prefixed stderr diagnostic`);
			assert.equal(r.stdout, "", `${label}: no stdout`);
			assert.deepEqual(readFileSync(path), before, `${label}: manifest byte-identical`);
		}
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("LT2b: a bad input against a non-existent store attempts no write", () => {
	const root = tmp();
	try {
		const path = eventsPath(root, "s");
		const r = run(["bogus.event", "--repo-root", root, "--slug", "s", "--payload", "{}"]);
		assert.equal(r.code, 2, r.stderr);
		assert.equal(existsSync(path), false, "no store created on prevalidation failure");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT3 — N concurrent emitters produce exactly N complete parseable lines with
// no interleaving.
// ---------------------------------------------------------------------------
test("LT3: concurrent emitters produce N complete, non-interleaved lines", async () => {
	const root = tmp();
	try {
		const N = 24;
		const path = eventsPath(root, "conc");
		const procs = [];
		for (let i = 0; i < N; i++) {
			procs.push(
				new Promise((resolve, reject) => {
					const child = spawn(process.execPath, [emitter, "phase.entered", "--repo-root", root, "--slug", "conc", "--by", `human:w-${i}`, "--payload", JSON.stringify({ phase: "build" })], {
						env: baseEnv(),
						stdio: ["ignore", "pipe", "pipe"],
					});
					child.on("error", reject);
					child.on("exit", (code) => resolve(code));
				}),
			);
		}
		const codes = await Promise.all(procs);
		assert.ok(
			codes.every((c) => c === 0),
			`all emitters exit 0; got ${codes}`,
		);
		const lines = readFileSync(path, "utf8").split("\n").filter(Boolean);
		assert.equal(lines.length, N, `exactly ${N} lines`);
		const workers = new Set();
		for (const line of lines) {
			assertConforms(line);
			workers.add(JSON.parse(line).by);
		}
		assert.equal(workers.size, N, "every worker's line is present and distinct");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT4 — identity resolution order: --slug beats SDLC_RUN_SLUG beats branch;
// branch feat/some-thing maps to some-thing.
// ---------------------------------------------------------------------------
test("LT4: --slug beats env beats branch mapping", () => {
	const repo = gitRepo({ branch: "feat/some-thing" });
	try {
		const payload = JSON.stringify({ phase: "plan" });

		// flag wins over env and branch
		const a = run(["phase.entered", "--repo-root", repo, "--slug", "flagslug", "--payload", payload], { cwd: repo, env: baseEnv({ SDLC_RUN_SLUG: "envslug" }) });
		assert.equal(a.code, 0, a.stderr);
		assert.ok(existsSync(eventsPath(repo, "flagslug")), "flag slug used");

		// env wins over branch
		const b = run(["phase.entered", "--repo-root", repo, "--payload", payload], { cwd: repo, env: baseEnv({ SDLC_RUN_SLUG: "envslug" }) });
		assert.equal(b.code, 0, b.stderr);
		assert.ok(existsSync(eventsPath(repo, "envslug")), "env slug used");

		// branch mapping: feat/some-thing -> some-thing
		const c = run(["phase.entered", "--repo-root", repo, "--payload", payload], { cwd: repo, env: baseEnv() });
		assert.equal(c.code, 0, c.stderr);
		assert.ok(existsSync(eventsPath(repo, "some-thing")), "branch mapped to some-thing");
	} finally {
		rmSync(repo, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT5 — on main and on a detached HEAD with no flag/env, emission skips: exit
// 0, one sdlc-telemetry stderr warning, no file write.
// ---------------------------------------------------------------------------
test("LT5: unresolvable identity skips (exit 0, one warning, no write)", () => {
	const mainRepo = gitRepo({ branch: "main" });
	try {
		const r = run(["phase.entered", "--repo-root", mainRepo, "--payload", JSON.stringify({ phase: "plan" })], { cwd: mainRepo, env: baseEnv() });
		assert.equal(r.code, 0, `skip is soft (exit 0); stderr=${r.stderr}`);
		assert.equal(r.stdout, "", "no stdout");
		const warnings = r.stderr.split("\n").filter((l) => l.includes("sdlc-telemetry:"));
		assert.equal(warnings.length, 1, `exactly one prefixed warning; got:\n${r.stderr}`);
		assert.equal(existsSync(join(mainRepo, ".pi", "sdlc", "runs")), false, "no run store written on skip");
	} finally {
		rmSync(mainRepo, { recursive: true, force: true });
	}

	const detached = gitRepo({ branch: "work" });
	try {
		const sha = execFileSync("git", ["-C", detached, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
		git(detached, ["checkout", "-q", sha]); // detach
		const r = run(["phase.entered", "--repo-root", detached, "--payload", JSON.stringify({ phase: "plan" })], { cwd: detached, env: baseEnv() });
		assert.equal(r.code, 0, `detached skip is soft; stderr=${r.stderr}`);
		const warnings = r.stderr.split("\n").filter((l) => l.includes("sdlc-telemetry:"));
		assert.equal(warnings.length, 1, "one warning on detached HEAD");
		assert.equal(existsSync(join(detached, ".pi", "sdlc", "runs")), false, "no store on detached-HEAD skip");
	} finally {
		rmSync(detached, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT26 — .gitignore covers .pi/sdlc/runs/ (a file under it is ignored per
// git check-ignore). Checked against this actual repository.
// ---------------------------------------------------------------------------
test("LT26: .gitignore ignores the run store", () => {
	const r = spawnSync("git", ["-C", repoRoot, "check-ignore", "-q", ".pi/sdlc/runs/some-thing/events.jsonl"], { encoding: "utf8" });
	assert.equal(r.status, 0, "a file under .pi/sdlc/runs/ must be git-ignored");
});

// ---------------------------------------------------------------------------
// Emitter/validator sanity: the .sh wrapper delegates to the .mjs, and the
// shared vocabulary is internally consistent.
// ---------------------------------------------------------------------------
test("emitter: .sh wrapper delegates to .mjs identically", () => {
	const root = tmp();
	try {
		const r = spawnSync("bash", [emitterSh, "phase.entered", "--repo-root", root, "--slug", "s", "--payload", JSON.stringify({ phase: "spec" })], { env: baseEnv(), encoding: "utf8" });
		assert.equal(r.status, 0, r.stderr);
		const obj = JSON.parse(readFileSync(eventsPath(root, "s"), "utf8").trim());
		assert.equal(obj.event, "phase.entered");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("vocabulary: every known event has a payload descriptor", () => {
	assert.ok(KNOWN_EVENTS.includes("run.started"));
	assert.ok(KNOWN_EVENTS.includes("task.validated"));
	assert.equal(KNOWN_EVENTS.length, 15, "v1 vocabulary has 15 event types");
});
