// Offline behavioural tests for the FS8 four-state `sdlc-status` readiness
// command (AR build T2): git-fixture-backed state machine coverage for AR1,
// AR2 (baseline), AR4 (baseline), AR5, AR6 (baseline). Output-contract goldens
// live in test/readiness-output.test.js. No network, no model calls (AR12).

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { baseEnv, git, gitFixture, readyFixture, runStatus, VALID_CONFIG, VALID_MODELS } from "./fs8-helpers.js";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

function checkLine(stdout, id) {
	const m = stdout.split("\n").find((l) => l.startsWith(`check: ${id} `));
	assert.ok(m, `missing check line for ${id} in:\n${stdout}`);
	return m;
}

function checkStatus(stdout, id) {
	return checkLine(stdout, id).split(" ")[2];
}

// ---------------------------------------------------------------------------
// AR1 — clean committed repository is ready
// ---------------------------------------------------------------------------

test("AR1: committed valid config+models, clean tree — exit 0, state ready, all checks pass", () => {
	const dir = readyFixture();
	try {
		for (const fmt of ["text", "json"]) {
			const r = runStatus(["--repo-root", dir, "--format", fmt]);
			assert.equal(r.code, 0, r.stdout + r.stderr);
			assert.equal(r.stderr, "");
			if (fmt === "json") {
				const rep = JSON.parse(r.stdout);
				assert.equal(rep.state, "ready");
				assert.equal(rep.exitCode, 0);
				assert.ok(rep.checks.every((c) => c.status === "pass"));
				assert.match(rep.checks.find((c) => c.id === "workflow.readable").message, /optional/);
			} else {
				assert.match(r.stdout, /^root: /);
				assert.ok(r.stdout.includes("state: ready"));
				assert.ok(r.stdout.includes("exit-code: 0"));
			}
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// AR2 (baseline) — filesystem presence is not committed adoption
// ---------------------------------------------------------------------------

test("AR2: absent, untracked, staged, and ignored manifests all exit 1 not-adopted", () => {
	const variants = {
		absent: () => gitFixture({ files: { "README.md": "x" } }),
		untracked: () => {
			const d = gitFixture({ files: { "README.md": "x" } });
			mkdirSync(join(d, ".pi", "sdlc"), { recursive: true });
			writeFileSync(join(d, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			return d;
		},
		"staged-for-addition": () => {
			const d = gitFixture({ files: { "README.md": "x" } });
			mkdirSync(join(d, ".pi", "sdlc"), { recursive: true });
			writeFileSync(join(d, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			git(d, ["add", "-A"]);
			return d;
		},
		ignored: () => {
			const d = gitFixture({ files: { ".gitignore": ".pi/\n" } });
			mkdirSync(join(d, ".pi", "sdlc"), { recursive: true });
			writeFileSync(join(d, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			return d;
		},
	};
	for (const [label, make] of Object.entries(variants)) {
		const dir = make();
		try {
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 1, `${label}: expected exit 1, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.ok(r.stdout.includes("state: not-adopted"), label);
			assert.equal(checkStatus(r.stdout, "adoption.manifest-head"), "fail", label);
			for (const id of ["adoption.manifest-clean", "config.valid", "models.head", "models.clean", "models.valid", "workflow.readable"]) {
				assert.equal(checkStatus(r.stdout, id), "skip", `${label}: ${id} must skip`);
			}
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

// ---------------------------------------------------------------------------
// AR4 (baseline) — git and CLI errors are distinct
// ---------------------------------------------------------------------------

test("AR4: argument errors exit 2 at cli.arguments with later checks skipped", () => {
	const cases = [["--bogus"], ["--config"], ["--repo-root"], ["--config", "/a", "--repo-root", "/b"], ["--format", "yaml"], ["--format", "text", "--format", "text"], ["extra-positional"]];
	for (const args of cases) {
		const r = runStatus(args, { cwd: tmpdir() });
		assert.equal(r.code, 2, `${args.join(" ")}: expected exit 2, got ${r.code}\n${r.stdout}${r.stderr}`);
		assert.ok(r.stdout.includes("state: error"), args.join(" "));
		assert.equal(checkStatus(r.stdout, "cli.arguments"), "error", args.join(" "));
		assert.equal(checkStatus(r.stdout, "root.resolve"), "skip", args.join(" "));
	}
});

test("AR4: unresolvable implicit root exits 2 at root.resolve", () => {
	const dir = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-noroot-")));
	try {
		const r = runStatus([], { cwd: dir });
		assert.equal(r.code, 2, r.stdout + r.stderr);
		assert.equal(checkStatus(r.stdout, "root.resolve"), "error");
		assert.equal(checkStatus(r.stdout, "git.repository"), "skip");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR4: non-git explicit root exits 2 at git.repository, with or without a manifest", () => {
	for (const withManifest of [false, true]) {
		const dir = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-nongit-")));
		try {
			if (withManifest) {
				mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
				writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			}
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 2, `manifest=${withManifest}: ${r.stdout}${r.stderr}`);
			assert.equal(checkStatus(r.stdout, "git.repository"), "error");
			assert.equal(checkStatus(r.stdout, "adoption.manifest-head"), "skip");
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("AR4: a git repository without HEAD exits 1 not-adopted, not 2", () => {
	const dir = gitFixture({ files: {}, commit: false });
	try {
		mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
		writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 1, r.stdout + r.stderr);
		assert.ok(r.stdout.includes("state: not-adopted"));
		assert.equal(checkStatus(r.stdout, "git.repository"), "pass");
		assert.equal(checkStatus(r.stdout, "adoption.manifest-head"), "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR4: --help prints usage, exits 0, and emits no status envelope", () => {
	const r = runStatus(["--help"], { cwd: tmpdir() });
	assert.equal(r.code, 0);
	assert.match(r.stdout, /^usage: /);
	assert.ok(!r.stdout.includes("state:"), "help must not emit the status envelope");
});

// ---------------------------------------------------------------------------
// AR5 — manifest validity remains an error
// ---------------------------------------------------------------------------

test("AR5: committed clean but invalid manifests exit 2 at config.valid", () => {
	const bads = {
		"invalid JSON": "{nope",
		"path escape": JSON.stringify({ ...VALID_CONFIG, paths: { plans: "../out" } }),
		"malformed hook": JSON.stringify({ ...VALID_CONFIG, hooks: { deploy: { after: [{ run: "x" }] } } }),
	};
	for (const [label, manifest] of Object.entries(bads)) {
		const dir = gitFixture({
			files: {
				".pi/sdlc/sdlc.config.json": manifest,
				".pi/sdlc/sdlc.models.json": JSON.stringify(VALID_MODELS),
			},
		});
		try {
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 2, `${label}: expected exit 2, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.ok(r.stdout.includes("state: error"), label);
			assert.equal(checkStatus(r.stdout, "config.valid"), "error", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

// ---------------------------------------------------------------------------
// AR6 (baseline) — supporting prerequisites are not-ready
// ---------------------------------------------------------------------------

test("AR6: models absent from HEAD (filesystem-only variants) exits 3 at models.head", () => {
	const variants = {
		absent: (d) => d,
		untracked: (d) => {
			writeFileSync(join(d, ".pi", "sdlc", "sdlc.models.json"), JSON.stringify(VALID_MODELS));
			return d;
		},
		"staged-for-addition": (d) => {
			writeFileSync(join(d, ".pi", "sdlc", "sdlc.models.json"), JSON.stringify(VALID_MODELS));
			git(d, ["add", "-A"]);
			return d;
		},
	};
	for (const [label, mutate] of Object.entries(variants)) {
		const dir = mutate(gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify(VALID_CONFIG) } }));
		try {
			const r = runStatus(["--repo-root", dir]);
			assert.equal(r.code, 3, `${label}: expected exit 3, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.ok(r.stdout.includes("state: not-ready"), label);
			assert.equal(checkStatus(r.stdout, "models.head"), "fail", label);
			assert.equal(checkStatus(r.stdout, "models.clean"), "skip", label);
			assert.equal(checkStatus(r.stdout, "models.valid"), "skip", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("AR6: dirty committed models exits 3 at models.clean; models.valid skips", () => {
	const dir = readyFixture();
	try {
		writeFileSync(join(dir, ".pi", "sdlc", "sdlc.models.json"), JSON.stringify({ ...VALID_MODELS, $comment: "dirty" }));
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 3, r.stdout + r.stderr);
		assert.equal(checkStatus(r.stdout, "models.head"), "pass");
		assert.equal(checkStatus(r.stdout, "models.clean"), "fail");
		assert.equal(checkStatus(r.stdout, "models.valid"), "skip");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR6: committed malformed / FS2-invalid / unreadable models exit 3 at models.valid", () => {
	const cases = {
		"invalid JSON": { models: "{nope", deny: false },
		"FS2-invalid": { models: JSON.stringify({ phases: {} }), deny: false },
		unreadable: { models: JSON.stringify(VALID_MODELS), deny: true },
	};
	for (const [label, { models, deny }] of Object.entries(cases)) {
		const dir = gitFixture({
			files: {
				".pi/sdlc/sdlc.config.json": JSON.stringify(VALID_CONFIG),
				".pi/sdlc/sdlc.models.json": models,
			},
		});
		try {
			const env = deny ? baseEnv({ SDLC_STATUS_UNREADABLE: join(dir, ".pi", "sdlc", "sdlc.models.json") }) : undefined;
			const r = runStatus(["--repo-root", dir], { env });
			assert.equal(r.code, 3, `${label}: expected exit 3, got ${r.code}\n${r.stdout}${r.stderr}`);
			assert.ok(r.stdout.includes("state: not-ready"), label);
			assert.equal(checkStatus(r.stdout, "models.valid"), "fail", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("AR6: workflow.md present+readable passes; injected read failure exits 3", () => {
	const dir = readyFixture({ ".pi/sdlc/workflow.md": "# workflow\n" });
	try {
		const ok = runStatus(["--repo-root", dir]);
		assert.equal(ok.code, 0, ok.stdout + ok.stderr);
		assert.equal(checkStatus(ok.stdout, "workflow.readable"), "pass");
		const bad = runStatus(["--repo-root", dir], {
			env: baseEnv({ SDLC_STATUS_UNREADABLE: join(dir, ".pi", "sdlc", "workflow.md") }),
		});
		assert.equal(bad.code, 3, bad.stdout + bad.stderr);
		assert.equal(checkStatus(bad.stdout, "workflow.readable"), "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("AR3 (baseline): unrelated dirty files do not affect readiness", () => {
	const dir = readyFixture();
	try {
		writeFileSync(join(dir, "scratch.txt"), "dirty");
		const r = runStatus(["--repo-root", dir]);
		assert.equal(r.code, 0, r.stdout + r.stderr);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// AR12 (portion) — the status command spawns nothing but git
// ---------------------------------------------------------------------------

test("AR12: status completes with a PATH exposing only git (no other executable can run)", () => {
	const dir = readyFixture();
	const shim = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-shim-")));
	try {
		const gitPath = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
		execFileSync("ln", ["-s", gitPath, join(shim, "git")]);
		const r = runStatus(["--repo-root", dir], { env: { PATH: shim, HOME: process.env.HOME } });
		assert.equal(r.code, 0, r.stdout + r.stderr);
	} finally {
		rmSync(dir, { recursive: true, force: true });
		rmSync(shim, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Dogfood — this repository is ready
// ---------------------------------------------------------------------------

test("dogfood: this repo's committed config+models make sdlc-status exit 0", () => {
	const r = runStatus(["--repo-root", repo]);
	assert.equal(r.code, 0, `dogfood must be ready:\n${r.stdout}${r.stderr}`);
	assert.ok(r.stdout.includes("state: ready"));
});
