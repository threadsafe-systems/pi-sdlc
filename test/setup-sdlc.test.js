// Offline tests for the setup-sdlc scaffolder + template (spec OH4, OH5, OH6).
// NFR2: fresh mkdtemp repos, never this repo's own .pi/sdlc; no model calls.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const setupMjs = join(repo, "skills", "sdlc", "scripts", "setup-sdlc.mjs");

function setup(root, args) {
	const r = spawnSync("node", [setupMjs, "--repo-root", root, ...args], { encoding: "utf8" });
	return { code: r.status ?? 1, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}
function readCfg(root) {
	try {
		return JSON.parse(readFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), "utf8"));
	} catch (error) {
		throw new Error(`invalid setup config: ${error.message}`);
	}
}
function mkTemp() {
	return mkdtempSync(join(tmpdir(), "sdlc-setup-"));
}

test("OH4: --yes writes a schema-valid config; bundle re-run refuses config changes; --force overwrites", () => {
	const dir = mkTemp();
	try {
		const r1 = setup(dir, ["--prefix", "x", "--label-prefix", "y", "--yes"]);
		assert.equal(r1.code, 0, r1.stderr);
		const cfg = readCfg(dir);
		assert.equal(cfg.prefix, "x");
		assert.equal(cfg.labelPrefix, "y");
		assert.equal(cfg.schemaVersion, 3);
		assert.equal(cfg.review.onShortfall, "proceed");
		const before = readFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), "utf8");

		const r2 = setup(dir, ["--prefix", "z", "--label-prefix", "y"]);
		assert.equal(r2.code, 1, "bundle re-run without --force must refuse config replacement");
		const after = readFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), "utf8");
		assert.equal(after, before, "file must be byte-identical after refused overwrite");

		const r3 = setup(dir, ["--prefix", "z", "--label-prefix", "y", "--force"]);
		assert.equal(r3.code, 0, r3.stderr);
		assert.equal(readCfg(dir).prefix, "z");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: --hook-use fields 3-4 = use, do = remainder after 4th colon (colons in do preserved)", () => {
	const dir = mkTemp();
	try {
		const r = setup(dir, ["--hook-use", "implement:before:tool:my_worktree_tool:enter the worktree: now"]);
		assert.equal(r.code, 0, r.stderr);
		const item = readCfg(dir).hooks.implement.before[0];
		assert.equal(item.use, "tool:my_worktree_tool");
		assert.equal(item.do, "enter the worktree: now");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: --hook-run command = remainder after 2nd colon (colons preserved); trust warning on stderr", () => {
	const dir = mkTemp();
	try {
		const r = setup(dir, ["--hook-run", "implement:after:echo done: ok"]);
		assert.equal(r.code, 0, r.stderr);
		assert.equal(readCfg(dir).hooks.implement.after[0].run, "echo done: ok");
		assert.match(r.stderr, /WARNING.*run.*hooks/s, "run hook must emit the trust warning");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: mixed repeated hook flags preserve argv order in the written list", () => {
	const dir = mkTemp();
	try {
		const r = setup(dir, ["--hook-run", "plan:before:first", "--hook-use", "plan:before:tool:t:second", "--hook-run", "plan:before:third"]);
		assert.equal(r.code, 0, r.stderr);
		const list = readCfg(dir).hooks.plan.before;
		assert.deepEqual(
			list.map((i) => i.run ?? i.do),
			["first", "second", "third"],
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: malformed hook flags exit 2", () => {
	const cases = [
		["--hook-run", "onlyone"],
		["--hook-run", "deploy:before:x"], // bad phase
		["--hook-run", "plan:sideways:x"], // bad timing
		["--hook-run", "plan:before:"], // empty command after 2nd colon
		["--hook-run", "plan:before:line1\rline2"], // carriage return in command
		["--hook-use", "plan:before:tool:t"], // too few fields (no do)
		["--hook-use", "plan:before:bogus:name:do"], // use kind not skill|tool
	];
	for (const args of cases) {
		const dir = mkTemp();
		try {
			assert.equal(setup(dir, args).code, 2, `should exit 2: ${args.join(" ")}`);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("PR-fix: value-taking flags accept values that begin with '-' (e.g. --announce '--foo')", () => {
	const dir = mkTemp();
	try {
		const r = setup(dir, ["--prefix", "x", "--label-prefix", "y", "--announce", "--foo bar"]);
		assert.equal(r.code, 0, r.stderr);
		assert.equal(readCfg(dir).announce, "--foo bar");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: partial tracker flags exit 2 (all-or-none)", () => {
	const dir = mkTemp();
	try {
		assert.equal(setup(dir, ["--tracker-repo", "o/n"]).code, 2, "partial tracker must exit 2");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH5: no config flags and no TTY exits 2 (interview needs a TTY)", () => {
	const dir = mkTemp();
	try {
		// execFileSync gives no TTY on stdin → interactive path must refuse.
		assert.equal(setup(dir, []).code, 2, "no flags + no TTY must exit 2");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("OH6: package.json pi.prompts includes ./templates and the template has a description", () => {
	let pkg;
	try {
		pkg = JSON.parse(readFileSync(join(repo, "package.json"), "utf8"));
	} catch (error) {
		assert.fail(`invalid package.json: ${error.message}`);
	}
	assert.ok(Array.isArray(pkg.pi?.prompts) && pkg.pi.prompts.includes("./templates"), "pi.prompts must include ./templates");
	const tmpl = readFileSync(join(repo, "templates", "setup-sdlc.md"), "utf8");
	assert.match(tmpl, /^---\n[\s\S]*description:/m, "template must carry a description frontmatter");
});
