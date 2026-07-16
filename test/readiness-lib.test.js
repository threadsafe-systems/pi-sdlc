// Offline tests for the non-fatal readiness inspection seams (AR build T1):
// inspectRoot / inspectConfig / inspectModels (spec §2.3, §2.5, §2.6), plus
// byte-compatibility of the existing exiting validators that now delegate to
// the collectors. No live/paid model calls, no network (AR12 / NFR).

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { inspectConfig, inspectConsumerPath, inspectModels, inspectRoot } from "../skills/sdlc/scripts/lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skill = join(repo, "skills", "sdlc");
const libPath = join(skill, "scripts", "lib.mjs");

function tmp(prefix) {
	// realpath: mkdtemp may hand back a symlinked path (e.g. /var -> /private/var).
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`invalid JSON fixture ${path}: ${error.message}`);
	}
}

function withoutEnv(name, fn) {
	const had = Object.hasOwn(process.env, name);
	const prev = process.env[name];
	delete process.env[name];
	try {
		return fn();
	} finally {
		if (had) process.env[name] = prev;
	}
}

// Run validateConfig/validateModels in a child (they exit the process on failure).
function validatorExit(fnName, raw, p) {
	const script = `import { ${fnName} } from ${JSON.stringify(libPath)}; ${fnName}(JSON.parse(process.argv[1]), process.argv[2]);`;
	try {
		execFileSync("node", ["--input-type=module", "-e", script, JSON.stringify(raw), p], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		});
		return { code: 0, stderr: "" };
	} catch (e) {
		return { code: e.status ?? 1, stderr: (e.stderr ?? "").trim() };
	}
}

// ---------------------------------------------------------------------------
// inspectRoot (spec §2.3.1): success/error union, never exits.
// ---------------------------------------------------------------------------

test("RL1: inspectRoot explicit precedence — config over repoRoot over sdlcRoot; relative resolves against cwd", () => {
	const cwd = tmp("sdlc-rl1-");
	const r1 = inspectRoot({ config: "/tmp/a", repoRoot: "/tmp/b", sdlcRoot: "/tmp/c", cwd });
	assert.deepEqual(r1, { ok: true, root: "/tmp/a" });
	const r2 = inspectRoot({ repoRoot: "/tmp/b", sdlcRoot: "/tmp/c", cwd });
	assert.deepEqual(r2, { ok: true, root: "/tmp/b" });
	const r3 = inspectRoot({ sdlcRoot: "/tmp/c", cwd });
	assert.deepEqual(r3, { ok: true, root: "/tmp/c" });
	// relative explicit path resolves against the provided cwd
	const r4 = inspectRoot({ config: "sub", cwd });
	assert.deepEqual(r4, { ok: true, root: resolve(cwd, "sub") });
	rmSync(cwd, { recursive: true, force: true });
});

test("RL2: inspectRoot walks ancestors from cwd to a configured project root", () => {
	withoutEnv("SDLC_ROOT", () => {
		const root = tmp("sdlc-rl2-");
		mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
		writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), "{}");
		const nested = join(root, "a", "b");
		mkdirSync(nested, { recursive: true });
		assert.deepEqual(inspectRoot({ cwd: nested }), { ok: true, root });
		rmSync(root, { recursive: true, force: true });
	});
});

test("RL3: inspectRoot falls back to the git top-level for a manifest-less repo", () => {
	withoutEnv("SDLC_ROOT", () => {
		const root = tmp("sdlc-rl3-");
		execFileSync("git", ["init", "-q", root], { stdio: "ignore" });
		const nested = join(root, "x", "y");
		mkdirSync(nested, { recursive: true });
		const r = inspectRoot({ cwd: nested });
		assert.equal(r.ok, true);
		assert.equal(realpathSync(r.root), root);
		rmSync(root, { recursive: true, force: true });
	});
});

test("RL4: inspectRoot returns the error member (never exits) outside any project", () => {
	withoutEnv("SDLC_ROOT", () => {
		const dir = tmp("sdlc-rl4-");
		const r = inspectRoot({ cwd: dir });
		assert.equal(r.ok, false);
		assert.equal(r.attemptedRoot, dir, "attemptedRoot must be the absolute cwd");
		assert.match(r.message, /cannot locate a consumer repo/);
		assert.match(r.message, /--config <dir>|\$SDLC_ROOT/);
		rmSync(dir, { recursive: true, force: true });
	});
});

test("RL5: inspectRoot honours $SDLC_ROOT when no explicit option is given", () => {
	const dir = tmp("sdlc-rl5-");
	const had = Object.hasOwn(process.env, "SDLC_ROOT");
	const prev = process.env.SDLC_ROOT;
	process.env.SDLC_ROOT = dir;
	try {
		assert.deepEqual(inspectRoot({ cwd: dir }), { ok: true, root: dir });
		// an explicit sdlcRoot option overrides the environment
		assert.deepEqual(inspectRoot({ sdlcRoot: "/tmp/z", cwd: dir }), { ok: true, root: "/tmp/z" });
	} finally {
		if (had) process.env.SDLC_ROOT = prev;
		else delete process.env.SDLC_ROOT;
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// inspectConfig / inspectModels (spec §2.5): deterministic, non-exiting.
// ---------------------------------------------------------------------------

const GOOD_CONFIG = {
	schemaVersion: 2,
	prefix: "acme",
	labelPrefix: "acme-sdlc",
	announce: "hi",
	paths: { plans: "docs/plans" },
	hooks: { implement: { before: [{ use: "tool:worktree_session", do: "enter the worktree" }] } },
};

test("SP4: consumer path seam preserves spelling and rejects slash/backslash escapes", () => {
	const root = tmp("sdlc-sp4-");
	assert.deepEqual(inspectConsumerPath(root, "project\\plans", "paths.plans"), { ok: true, resolved: join(root, "project", "plans"), configured: "project\\plans", normalized: "project/plans" });
	for (const bad of ["", "/absolute", "C:\\absolute", "../escape", "project/../escape", "project\\..\\escape"]) {
		assert.equal(inspectConsumerPath(root, bad, "paths.plans").ok, false, bad);
	}
	const outside = join(root, "..", "sdlc-sp4-outside");
	mkdirSync(outside, { recursive: true });
	const link = join(root, "linked");
	try {
		execFileSync("ln", ["-s", outside, link]);
		assert.equal(inspectConsumerPath(root, "linked", "paths.agents").ok, false);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("RL6: inspectConfig — valid input yields [], non-objects yield the deterministic issue", () => {
	assert.deepEqual(inspectConfig(GOOD_CONFIG), []);
	for (const bad of [null, [], "x", 42, undefined, true]) {
		assert.deepEqual(inspectConfig(bad), [{ path: "", message: "must be a JSON object" }]);
	}
});

test("RL7: inspectConfig — aggregates every issue in validation-rule order, never throws", () => {
	const raw = {
		bogus: 1,
		schemaVersion: 3,
		prefix: "BAD CAPS",
		labelPrefix: "ok",
		announce: "",
		paths: { plans: "", nope: "x" },
		tracker: "not-an-object",
		hooks: { deploy: { before: [{ run: "x" }] } },
	};
	const issues = inspectConfig(raw);
	assert.ok(issues.length >= 7, `expected multiple aggregated issues, got ${JSON.stringify(issues)}`);
	// deterministic: same input, same array
	assert.deepEqual(inspectConfig(raw), issues);
	// validation-rule order: unknown key first, then schemaVersion, then prefix...
	assert.equal(issues[0].message, "unknown key 'bogus'");
	assert.equal(issues[1].message, "schemaVersion must be 2 (got 3)");
	assert.match(issues[2].message, /^prefix must match /);
	const messages = issues.map((i) => i.message);
	assert.ok(messages.includes("announce must be a non-empty string"));
	assert.ok(messages.includes("tracker must be an object"));
	assert.ok(messages.some((m) => m.startsWith("unknown hooks phase 'deploy'")));
	// every issue carries the {path, message} shape
	for (const i of issues) {
		assert.deepEqual(Object.keys(i).sort(), ["message", "path"]);
		assert.equal(typeof i.path, "string");
		assert.equal(typeof i.message, "string");
	}
});

test("RL7b: inspectConfig — malformed nested structures aggregate without throwing", () => {
	const raw = { ...GOOD_CONFIG, paths: 3, hooks: { plan: { before: [null, { run: "a\nb" }, { use: "x", do: "" }] } } };
	const issues = inspectConfig(raw);
	const messages = issues.map((i) => i.message);
	assert.ok(messages.includes("paths must be an object"));
	assert.ok(messages.includes("hooks.plan.before[0] must be an object"));
	assert.ok(messages.some((m) => m.startsWith("hooks.plan.before[1].run ")));
});

test("RL8: inspectModels — valid roster yields [], non-objects and aggregates are deterministic", () => {
	const example = readJson(join(skill, "schema", "sdlc.models.example.json"));
	assert.deepEqual(inspectModels(example), []);
	for (const bad of [null, [], "x", 7]) {
		assert.deepEqual(inspectModels(bad), [{ path: "", message: "must be a JSON object" }]);
	}
	const raw = {
		junk: true,
		author_default: "no-slash",
		rules: { unknown_rule: 1 },
		phases: { plan_review: { min_panel: 0, prefer: ["also-bad"] } },
	};
	const issues = inspectModels(raw);
	assert.deepEqual(inspectModels(raw), issues);
	assert.equal(issues[0].message, "unknown key 'junk'");
	const messages = issues.map((i) => i.message);
	assert.ok(messages.includes("author_default must be provider/model"));
	assert.ok(messages.includes("unknown rules key 'unknown_rule'"));
	assert.ok(messages.some((m) => m.startsWith("phases must contain exactly ")));
});

test("RL8b: inspectModels — non-object phases and phase entries never throw", () => {
	const messages = (raw) => inspectModels(raw).map((i) => i.message);
	assert.ok(messages({ phases: null }).includes("phases must be an object"));
	const roster = (over) => ({
		phases: {
			plan_review: { min_panel: 1, prefer: ["a/b"] },
			spec_review: { min_panel: 1, prefer: ["a/b"] },
			pr_review: { min_panel: 1, prefer: ["a/b"] },
			task_validate: { min_panel: 1, prefer: ["a/b"] },
			...over,
		},
	});
	assert.ok(messages(roster({ pr_review: 5 })).includes("phases.pr_review must be an object"));
	assert.ok(messages(roster({ pr_review: { min_panel: 1, prefer: [] } })).includes("phases.pr_review.prefer must be a non-empty array"));
});

// ---------------------------------------------------------------------------
// Delegation compatibility (spec §2.5): the exiting validators keep their
// acceptance, first-diagnostic text, and exit code.
// ---------------------------------------------------------------------------

test("RL9: validateConfig first diagnostic is byte-identical to the first collector issue (exit 2)", () => {
	const p = "/x/.pi/sdlc/sdlc.config.json";
	const cases = [
		null,
		{ bogus: 1, schemaVersion: 2, prefix: "acme", labelPrefix: "acme", announce: "a" },
		{ schemaVersion: 2, prefix: "acme", labelPrefix: "acme", announce: "a", paths: { plans: "/abs" } },
		{ schemaVersion: 2, prefix: "acme", labelPrefix: "acme", announce: "a", paths: { plans: "..\\\\escape" } },
		{ schemaVersion: 2, prefix: "acme", labelPrefix: "acme", announce: "a", hooks: {} },
		{ schemaVersion: 2, prefix: "acme", labelPrefix: "acme", announce: "a", hooks: { plan: { before: [{ run: "x", use: "tool:t", do: "y" }] } } },
	];
	for (const raw of cases) {
		const { code, stderr } = validatorExit("validateConfig", raw, p);
		assert.equal(code, 2, `expected exit 2 for ${JSON.stringify(raw)}`);
		const first = inspectConfig(raw)[0];
		assert.ok(first, "collector must report at least one issue");
		assert.equal(stderr, `sdlc config ${p}: ${first.message}`);
	}
});

test("RL10: validateModels first diagnostic is byte-identical to the first collector issue (exit 2)", () => {
	const p = "/x/.pi/sdlc/sdlc.models.json";
	const cases = [[], { author_default: "nope", phases: {} }, { phases: { plan_review: {} } }, { phases: { plan_review: { min_panel: 0, prefer: ["a/b"] }, spec_review: { min_panel: 1, prefer: ["a/b"] }, pr_review: { min_panel: 1, prefer: ["a/b"] }, task_validate: { min_panel: 1, prefer: ["a/b"] } } }];
	for (const raw of cases) {
		const { code, stderr } = validatorExit("validateModels", raw, p);
		assert.equal(code, 2, `expected exit 2 for ${JSON.stringify(raw)}`);
		const first = inspectModels(raw)[0];
		assert.ok(first, "collector must report at least one issue");
		assert.equal(stderr, `sdlc models ${p}: ${first.message}`);
	}
});

test("RL11: validators still accept valid input (exit 0) after delegation", () => {
	const example = readJson(join(skill, "schema", "sdlc.models.example.json"));
	assert.equal(validatorExit("validateModels", example, "/x/m.json").code, 0);
	assert.equal(validatorExit("validateConfig", GOOD_CONFIG, "/x/c.json").code, 0);
});
