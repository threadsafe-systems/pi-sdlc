// Offline output-contract tests for FS8 `sdlc-status` (AR build T2): exact
// text/JSON goldens for exits 0-3 (AR8), canonical order and skip pins,
// aggregation and precedence (AR7), JSON-mode argv pre-scan, secret safety,
// and shell/Node entry-point agreement. No network, no model calls (AR12).

import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { baseEnv, gitFixture, readyFixture, runStatus, statusSh, VALID_CONFIG, VALID_MODELS } from "./fs8-helpers.js";

const CANONICAL_IDS = ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "models.head", "models.clean", "models.valid", "workflow.readable"];

const SENTINELS = {
	SECRET_TOKEN: "sentinel-secret-token-XYZZY",
	API_KEY: "sentinel-api-key-PLUGH",
};

function idsOf(stdoutJson) {
	return JSON.parse(stdoutJson).checks.map((c) => c.id);
}

function statusesOf(stdoutJson) {
	return Object.fromEntries(JSON.parse(stdoutJson).checks.map((c) => [c.id, c.status]));
}

// ---------------------------------------------------------------------------
// AR8 — exact golden outputs
// ---------------------------------------------------------------------------

test("AR8: ready fixture — exact text golden", () => {
	const dir = readyFixture();
	try {
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.equal(r.stderr, "");
		const expected = [
			`root: ${dir}`,
			"state: ready",
			"exit-code: 0",
			"check: cli.arguments pass — arguments are valid",
			"check: root.resolve pass — consumer root resolved",
			"check: git.repository pass — resolved root is a git worktree",
			"check: adoption.manifest-head pass — current HEAD contains .pi/sdlc/sdlc.config.json",
			"check: adoption.manifest-clean pass — manifest matches HEAD in index and working tree",
			"check: config.valid pass — committed manifest is valid",
			"check: models.head pass — current HEAD contains .pi/sdlc/sdlc.models.json",
			"check: models.clean pass — models file matches HEAD in index and working tree",
			"check: models.valid pass — committed models file is valid",
			"check: workflow.readable pass — optional workflow.md is absent",
			"",
		].join("\n");
		assert.equal(r.stdout, expected);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8: ready fixture — exact JSON golden (deterministic serialization)", () => {
	const dir = readyFixture();
	try {
		const r = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
		assert.equal(r.stderr, "");
		const expected = `${JSON.stringify(
			{
				schemaVersion: 1,
				root: dir,
				state: "ready",
				exitCode: 0,
				checks: [
					{ id: "cli.arguments", status: "pass", message: "arguments are valid" },
					{ id: "root.resolve", status: "pass", message: "consumer root resolved" },
					{ id: "git.repository", status: "pass", message: "resolved root is a git worktree" },
					{ id: "adoption.manifest-head", status: "pass", message: "current HEAD contains .pi/sdlc/sdlc.config.json" },
					{ id: "adoption.manifest-clean", status: "pass", message: "manifest matches HEAD in index and working tree" },
					{ id: "config.valid", status: "pass", message: "committed manifest is valid" },
					{ id: "models.head", status: "pass", message: "current HEAD contains .pi/sdlc/sdlc.models.json" },
					{ id: "models.clean", status: "pass", message: "models file matches HEAD in index and working tree" },
					{ id: "models.valid", status: "pass", message: "committed models file is valid" },
					{ id: "workflow.readable", status: "pass", message: "optional workflow.md is absent" },
				],
			},
			null,
			2,
		)}\n`;
		assert.equal(r.stdout, expected);
		// double-check determinism
		assert.equal(runStatus(["--repo-root", dir, "--format", "json"]).stdout, expected);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8: not-adopted — text carries fail + remediation and pinned skips (exit 1)", () => {
	const dir = gitFixture({ files: { "README.md": "x" } });
	try {
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 1, r.stdout + r.stderr);
		assert.equal(r.stderr, "");
		const lines = r.stdout.trimEnd().split("\n");
		assert.equal(lines[0], `root: ${dir}`);
		assert.equal(lines[1], "state: not-adopted");
		assert.equal(lines[2], "exit-code: 1");
		assert.equal(lines[6], "check: adoption.manifest-head fail — current HEAD has no manifest blob at .pi/sdlc/sdlc.config.json");
		assert.equal(lines[7], "remediation: adoption.manifest-head — run /setup-sdlc and commit .pi/sdlc/sdlc.config.json");
		assert.equal(lines[8], "check: adoption.manifest-clean skip — manifest is not committed in current HEAD");
		assert.equal(lines[9], "check: config.valid skip — manifest is not committed in current HEAD");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8: JSON on every state 0-3 is a single valid envelope with only FS8 fields", () => {
	const fixtures = {
		0: readyFixture(),
		1: gitFixture({ files: { "README.md": "x" } }),
		2: gitFixture({ files: { ".pi/sdlc/sdlc.config.json": "{nope", ".pi/sdlc/sdlc.models.json": JSON.stringify(VALID_MODELS) } }),
		3: (() => {
			const d = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify(VALID_CONFIG) } });
			return d;
		})(),
	};
	try {
		for (const [exit, dir] of Object.entries(fixtures)) {
			const r = runStatus(["--repo-root", dir, "--format", "json"]);
			assert.equal(r.code, Number(exit), `${exit}: ${r.stdout}${r.stderr}`);
			assert.equal(r.stderr, "", `${exit}: stderr must be empty in JSON mode`);
			const rep = JSON.parse(r.stdout);
			assert.deepEqual(Object.keys(rep), ["schemaVersion", "root", "state", "exitCode", "checks"]);
			assert.equal(rep.schemaVersion, 1);
			assert.ok(rep.root.startsWith("/"), "root must be absolute");
			assert.equal(rep.exitCode, Number(exit));
			assert.deepEqual({ 0: "ready", 1: "not-adopted", 2: "error", 3: "not-ready" }[exit], rep.state);
			assert.deepEqual(idsOf(r.stdout), CANONICAL_IDS, `${exit}: canonical id order`);
			for (const c of rep.checks) {
				for (const k of Object.keys(c)) assert.ok(["id", "status", "message", "remediation"].includes(k), `${exit}: field ${k}`);
				assert.ok(["pass", "fail", "error", "skip"].includes(c.status));
				assert.ok(c.message.length > 0 && !c.message.includes("\n"));
			}
		}
	} finally {
		for (const dir of Object.values(fixtures)) rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8: secret sentinels in the environment never appear in output", () => {
	const dirs = [readyFixture(), gitFixture({ files: { "README.md": "x" } })];
	try {
		for (const dir of dirs) {
			for (const fmt of ["text", "json"]) {
				const r = runStatus(["--repo-root", dir, "--format", fmt], { env: baseEnv(SENTINELS) });
				for (const v of Object.values(SENTINELS)) {
					assert.ok(!r.stdout.includes(v) && !r.stderr.includes(v), "sentinel leaked");
				}
			}
		}
	} finally {
		for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// AR8/AR4 — full-argv JSON pre-scan
// ---------------------------------------------------------------------------

test("AR8: --format json anywhere in argv forces the envelope for argument errors", () => {
	const argvs = [
		["--bogus", "--format", "json"],
		["--format", "json", "--bogus"],
		["--config", "/a", "--repo-root", "/b", "--format", "json"],
		["--format", "yaml", "--format", "json"],
	];
	for (const args of argvs) {
		const r = runStatus(args, { cwd: tmpdir() });
		assert.equal(r.code, 2, args.join(" "));
		assert.equal(r.stderr, "", `${args.join(" ")}: no stderr once JSON mode is recognised`);
		const rep = JSON.parse(r.stdout);
		assert.equal(rep.state, "error");
		assert.equal(rep.checks[0].id, "cli.arguments");
		assert.equal(rep.checks[0].status, "error");
		assert.ok(rep.checks.slice(1).every((c) => c.status === "skip"));
	}
});

test("AR8: JSON envelope root falls back to absolute cwd on root-resolution failure", () => {
	const dir = gitFixture({ files: {}, init: false });
	try {
		const r = runStatus(["--format", "json"], { cwd: dir });
		assert.equal(r.code, 2, r.stdout + r.stderr);
		const rep = JSON.parse(r.stdout);
		assert.equal(rep.root, dir);
		assert.equal(statusesOf(r.stdout)["root.resolve"], "error");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8: cli.arguments error envelope uses the single unambiguous explicit root when available", () => {
	const dir = gitFixture({ files: {}, init: false });
	try {
		const r = runStatus(["--repo-root", dir, "--bogus", "--format", "json"], { cwd: tmpdir() });
		assert.equal(r.code, 2);
		assert.equal(JSON.parse(r.stdout).root, dir);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8/PR-panel: argument values after '=' are elided from diagnostics", () => {
	const r = runStatus(["--api-key=sentinel-secret-value-XYZZY", "--format", "json"], { cwd: tmpdir() });
	assert.equal(r.code, 2);
	assert.ok(!r.stdout.includes("sentinel-secret-value-XYZZY"), "argv value leaked into diagnostics");
	assert.match(JSON.parse(r.stdout).checks[0].message, /unexpected argument: --api-key=/);
});

test("AR4/PR-panel: a root flag never consumes a following option as its value", () => {
	const cwd = tmpdir();
	const r = runStatus(["--repo-root", "--format", "json"], { cwd });
	assert.equal(r.code, 2, r.stdout + r.stderr);
	const rep = JSON.parse(r.stdout);
	assert.match(rep.checks[0].message, /--repo-root requires a value/);
	assert.ok(!rep.root.includes("--format"), `root must not be fabricated from a flag: ${rep.root}`);
});

test("PR-panel: skips blocked by an errored check propagate that check's own message", () => {
	const r = runStatus(["--bogus", "--format", "json"], { cwd: tmpdir() });
	const rep = JSON.parse(r.stdout);
	assert.equal(rep.checks[0].status, "error");
	assert.equal(rep.checks[1].id, "root.resolve");
	assert.equal(rep.checks[1].status, "skip");
	assert.equal(rep.checks[1].message, rep.checks[0].message, "error skips must carry the accurate root cause");
});

// ---------------------------------------------------------------------------
// AR7 — independent blockers aggregate; precedence pins
// ---------------------------------------------------------------------------

test("AR7: missing committed models + workflow read failure both surface, exit 3", () => {
	const dir = gitFixture({
		files: {
			".pi/sdlc/sdlc.config.json": JSON.stringify(VALID_CONFIG),
			".pi/sdlc/workflow.md": "# wf\n",
		},
	});
	try {
		const r = runStatus(["--repo-root", dir, "--format", "json"], {
			env: baseEnv({ SDLC_STATUS_UNREADABLE: join(dir, ".pi", "sdlc", "workflow.md") }),
		});
		assert.equal(r.code, 3, r.stdout + r.stderr);
		const st = statusesOf(r.stdout);
		assert.equal(st["models.head"], "fail");
		assert.equal(st["workflow.readable"], "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR7: malformed config + missing committed models both report; error precedence wins (exit 2)", () => {
	const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": "{nope" } });
	try {
		const r = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(r.code, 2, r.stdout + r.stderr);
		const st = statusesOf(r.stdout);
		assert.equal(st["config.valid"], "error");
		assert.equal(st["models.head"], "fail", "independent models check still evaluated");
		assert.equal(JSON.parse(r.stdout).state, "error");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR7: skip pins — not-adopted repo", () => {
	const dir = gitFixture({ files: { "README.md": "x" } });
	try {
		const st = statusesOf(runStatus(["--repo-root", dir, "--format", "json"]).stdout);
		assert.deepEqual(st, {
			"cli.arguments": "pass",
			"root.resolve": "pass",
			"git.repository": "pass",
			"adoption.manifest-head": "fail",
			"adoption.manifest-clean": "skip",
			"config.valid": "skip",
			"models.head": "skip",
			"models.clean": "skip",
			"models.valid": "skip",
			"workflow.readable": "skip",
		});
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR7: skip pins — dirty manifest still evaluates independent models/workflow checks", () => {
	const dir = readyFixture();
	try {
		writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify({ ...VALID_CONFIG, announce: "changed" }));
		const r = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(r.code, 3, r.stdout + r.stderr);
		const st = statusesOf(r.stdout);
		assert.deepEqual(st, {
			"cli.arguments": "pass",
			"root.resolve": "pass",
			"git.repository": "pass",
			"adoption.manifest-head": "pass",
			"adoption.manifest-clean": "fail",
			"config.valid": "skip",
			"models.head": "pass",
			"models.clean": "pass",
			"models.valid": "pass",
			"workflow.readable": "pass",
		});
		const skipMsg = JSON.parse(r.stdout).checks.find((c) => c.id === "config.valid").message;
		assert.equal(skipMsg, "manifest has uncommitted changes");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Entry-point agreement
// ---------------------------------------------------------------------------

test("wrapper: sdlc-status.sh output and exit are identical to direct .mjs invocation", () => {
	const dir = readyFixture();
	try {
		for (const fmt of ["text", "json"]) {
			const viaNode = runStatus(["--repo-root", dir, "--format", fmt]);
			const viaSh = runStatus([statusSh, "--repo-root", dir, "--format", fmt], { argv0: "bash" });
			assert.equal(viaSh.code, viaNode.code);
			assert.equal(viaSh.stdout, viaNode.stdout);
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
