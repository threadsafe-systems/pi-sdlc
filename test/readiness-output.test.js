// Offline output-contract tests for FS8 `sdlc-status` (AR build T2): exact
// text/JSON goldens for exits 0-3 (AR8), canonical order and skip pins,
// aggregation and precedence (AR7), JSON-mode argv pre-scan, secret safety,
// and shell/Node entry-point agreement. No network, no model calls (AR12).

import assert from "node:assert/strict";
import { rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { baseEnv, gitFixture, readyFixture, runStatus, statusSh, VALID_CONFIG } from "./fs8-helpers.js";

const CANONICAL_IDS = ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "config.schema-current", "config.panels", "workflow.readable"];

const SENTINELS = {
	SECRET_TOKEN: "sentinel-secret-token-XYZZY",
	API_KEY: "sentinel-api-key-PLUGH",
};

function parseReport(stdoutJson) {
	try {
		return JSON.parse(stdoutJson);
	} catch (error) {
		throw new Error(`invalid JSON status report: ${error.message}\nstdout: ${stdoutJson}`);
	}
}

function idsOf(stdoutJson) {
	return parseReport(stdoutJson).checks.map((c) => c.id);
}

function statusesOf(stdoutJson) {
	return Object.fromEntries(parseReport(stdoutJson).checks.map((c) => [c.id, c.status]));
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
			"check: config.schema-current pass — config schema is current (schemaVersion 4)",
			"check: config.panels pass — panels roster present",
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
				schemaVersion: 2,
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
					{ id: "config.schema-current", status: "pass", message: "config schema is current (schemaVersion 4)" },
					{ id: "config.panels", status: "pass", message: "panels roster present" },
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
		2: gitFixture({ files: { ".pi/sdlc/sdlc.config.json": "{nope" } }),
		3: (() => {
			const { panels: _panels, ...withoutPanels } = VALID_CONFIG;
			return gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify(withoutPanels) } });
		})(),
	};
	try {
		for (const [exit, dir] of Object.entries(fixtures)) {
			const r = runStatus(["--repo-root", dir, "--format", "json"]);
			assert.equal(r.code, Number(exit), `${exit}: ${r.stdout}${r.stderr}`);
			assert.equal(r.stderr, "", `${exit}: stderr must be empty in JSON mode`);
			const rep = parseReport(r.stdout);
			assert.deepEqual(Object.keys(rep), ["schemaVersion", "root", "state", "exitCode", "checks"]);
			assert.equal(rep.schemaVersion, 2);
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
		const rep = parseReport(r.stdout);
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
		const rep = parseReport(r.stdout);
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
		assert.equal(parseReport(r.stdout).root, dir);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR8/PR-panel: argument values after '=' are elided from diagnostics", () => {
	const r = runStatus(["--api-key=sentinel-secret-value-XYZZY", "--format", "json"], { cwd: tmpdir() });
	assert.equal(r.code, 2);
	assert.ok(!r.stdout.includes("sentinel-secret-value-XYZZY"), "argv value leaked into diagnostics");
	assert.match(parseReport(r.stdout).checks[0].message, /unexpected argument: --api-key=/);
});

test("AR4/PR-panel: a root flag never consumes a following option as its value", () => {
	const cwd = tmpdir();
	const r = runStatus(["--repo-root", "--format", "json"], { cwd });
	assert.equal(r.code, 2, r.stdout + r.stderr);
	const rep = parseReport(r.stdout);
	assert.match(rep.checks[0].message, /--repo-root requires a value/);
	assert.ok(!rep.root.includes("--format"), `root must not be fabricated from a flag: ${rep.root}`);
});

test("PR-panel: skips blocked by an errored check propagate that check's own message", () => {
	const r = runStatus(["--bogus", "--format", "json"], { cwd: tmpdir() });
	const rep = parseReport(r.stdout);
	assert.equal(rep.checks[0].status, "error");
	assert.equal(rep.checks[1].id, "root.resolve");
	assert.equal(rep.checks[1].status, "skip");
	assert.equal(rep.checks[1].message, rep.checks[0].message, "error skips must carry the accurate root cause");
});

// ---------------------------------------------------------------------------
// AR7 — independent blockers aggregate; precedence pins
// ---------------------------------------------------------------------------

test("AR7: missing panels + workflow read failure both surface, exit 3", () => {
	const { panels: _panels, ...withoutPanels } = VALID_CONFIG;
	const dir = gitFixture({
		files: {
			".pi/sdlc/sdlc.config.json": JSON.stringify(withoutPanels),
			".pi/sdlc/workflow.md": "# wf\n",
		},
	});
	try {
		const r = runStatus(["--repo-root", dir, "--format", "json"], {
			env: baseEnv({ SDLC_STATUS_UNREADABLE: join(dir, ".pi", "sdlc", "workflow.md") }),
		});
		assert.equal(r.code, 3, r.stdout + r.stderr);
		const st = statusesOf(r.stdout);
		assert.equal(st["config.panels"], "fail");
		assert.equal(st["workflow.readable"], "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR7: malformed config still evaluates independent workflow check; error precedence wins", () => {
	const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": "{nope" } });
	try {
		const r = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(r.code, 2, r.stdout + r.stderr);
		const st = statusesOf(r.stdout);
		assert.equal(st["config.valid"], "error");
		assert.equal(st["workflow.readable"], "pass");
		assert.equal(parseReport(r.stdout).state, "error");
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
			"config.schema-current": "skip",
			"config.panels": "skip",
			"workflow.readable": "skip",
		});
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR7: skip pins — dirty manifest still evaluates independent workflow checks", () => {
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
			"config.schema-current": "skip",
			"config.panels": "skip",
			"workflow.readable": "pass",
		});
		const skipMsg = parseReport(r.stdout).checks.find((c) => c.id === "config.valid").message;
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
