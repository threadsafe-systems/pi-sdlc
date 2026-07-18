// FS5 side-effect emission tests (lt-t2): additive --slug handling + post-success
// telemetry emission on resolve-panel, ensure-panel-agent, and validate-task,
// with frozen stdout/exit contracts (NF3) and check-lifecycle left untouched
// (FS9). Scenarios LT6-LT10. Offline/deterministic (NF1): no network calls.

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);
const resolvePanel = join(repoRoot, "skills", "sdlc", "scripts", "resolve-panel.mjs");
const ensurePanelAgent = join(repoRoot, "skills", "sdlc", "scripts", "ensure-panel-agent.mjs");
const validateTask = join(repoRoot, "skills", "sdlc", "scripts", "validate-task.mjs");
const checkLifecycleMjs = join(repoRoot, "skills", "sdlc", "scripts", "check-lifecycle.mjs");
const checkLifecycleSh = join(repoRoot, "skills", "sdlc", "scripts", "check-lifecycle.sh");

const credentialVars = [
	"ANTHROPIC_API_KEY",
	"ANTHROPIC_OAUTH_TOKEN",
	"DEEPSEEK_API_KEY",
	"OPENAI_API_KEY",
	"ZAI_API_KEY",
	"GEMINI_API_KEY",
	"GOOGLE_API_KEY",
	"MINIMAX_API_KEY",
	"MOONSHOT_API_KEY",
	"KIMI_API_KEY",
	"ZAI_CODING_CN_API_KEY",
	"AWS_ACCESS_KEY_ID",
	"AWS_SECRET_ACCESS_KEY",
	"AWS_PROFILE",
	"AWS_BEARER_TOKEN_BEDROCK",
	"AWS_CONTAINER_CREDENTIALS_FULL_URI",
	"AWS_CONTAINER_CREDENTIALS_RELATIVE_URI",
	"AWS_WEB_IDENTITY_TOKEN_FILE",
];

function baseEnv(extra = {}) {
	const env = { ...process.env, ...extra };
	for (const key of credentialVars) delete env[key];
	return env;
}

function tmp(prefix = "sdlc-lt2-") {
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

// A resolve-panel fixture: v3 config with one credentialed model in plan_review.
function panelFixture() {
	const root = tmp("sdlc-lt2-panel-");
	const home = join(root, "home");
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	mkdirSync(join(home, ".pi", "agent"), { recursive: true });
	const config = {
		schemaVersion: 3,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		review: { brainstorm: "human", design: "panel", code: "panel", tasks: "subagent", panelSize: 1, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		panels: {
			authorDefault: "anthropic/claude-opus-4",
			phases: {
				plan_review: { prefer: ["deepseek/deepseek-v3"] },
				spec_review: { prefer: ["deepseek/deepseek-v3"] },
				pr_review: { prefer: ["deepseek/deepseek-v3"] },
				task_validate: { prefer: ["deepseek/deepseek-v3"] },
			},
		},
	};
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config, null, 2)}\n`);
	writeFileSync(join(home, ".pi", "agent", "auth.json"), `${JSON.stringify({ deepseek: {} })}\n`);
	return { root, home };
}

function runResolvePanel({ root, home }, args = []) {
	const r = spawnSync(process.execPath, [resolvePanel, "plan_review", "--author", "anthropic/claude-opus-4", "--config", root, ...args], { encoding: "utf8", env: baseEnv({ HOME: home }) });
	return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

function runEnsurePanelAgent(root, args = []) {
	const r = spawnSync(process.execPath, [ensurePanelAgent, "plan_review", "--config", root, "--force", ...args], { encoding: "utf8", env: baseEnv() });
	return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

// ---------------------------------------------------------------------------
// LT6 — resolve-panel emits panel.resolved on a resolvable slug; stdout/exit
// are byte-identical to a run without emission, including --emit-tasks output.
// ---------------------------------------------------------------------------
test("LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug", () => {
	const f = panelFixture();
	try {
		const without = runResolvePanel(f);
		const withSlug = runResolvePanel(f, ["--slug", "lt6-run"]);
		assert.equal(without.status, 0, without.stderr);
		assert.equal(withSlug.status, without.status);
		assert.equal(withSlug.stdout, without.stdout, "stdout byte-identical with emission active vs inactive");

		const events = readEvents(f.root, "lt6-run");
		assert.equal(events.length, 1);
		assert.equal(events[0].event, "panel.resolved");
		assert.equal(events[0].by, "script:resolve-panel");
		assert.deepEqual(events[0].payload.panelPhase, "plan_review");
		assert.deepEqual(events[0].payload.models, ["deepseek/deepseek-v3"]);
		assert.equal(events[0].payload.authorExcluded, "");

		// --emit-tasks output identical too.
		const withoutEmit = runResolvePanel(f, ["--emit-tasks", "sdlc-plan-review"]);
		const withEmit = runResolvePanel(f, ["--slug", "lt6-run", "--emit-tasks", "sdlc-plan-review"]);
		assert.equal(withEmit.stdout, withoutEmit.stdout, "--emit-tasks stdout byte-identical");
	} finally {
		rmSync(f.root, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT7 — ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical
// either way (fresh-write path and up-to-date path).
// ---------------------------------------------------------------------------
test("LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical", () => {
	const root = tmp("sdlc-lt2-epa-");
	try {
		// fresh write path
		const without = runEnsurePanelAgent(root);
		rmSync(join(root, ".pi", "agents"), { recursive: true, force: true });
		const withSlug = runEnsurePanelAgent(root, ["--slug", "lt7-run"]);
		assert.equal(without.status, 0, without.stderr);
		assert.equal(withSlug.status, 0, withSlug.stderr);
		assert.equal(withSlug.stdout, without.stdout, "fresh-write stdout byte-identical");
		let events = readEvents(root, "lt7-run");
		assert.equal(events.length, 1);
		assert.equal(events[0].event, "panel.agent_stamped");
		assert.equal(events[0].by, "script:ensure-panel-agent");
		assert.equal(events[0].payload.panelPhase, "plan_review");
		assert.equal(events[0].payload.agent, "sdlc-plan-review");

		// up-to-date path (content already identical; --force omitted this time by
		// re-invoking with the same content already stamped)
		const upToDateWithout = spawnSync(process.execPath, [ensurePanelAgent, "plan_review", "--config", root], { encoding: "utf8", env: baseEnv() });
		const upToDateWith = spawnSync(process.execPath, [ensurePanelAgent, "plan_review", "--config", root, "--slug", "lt7-again"], { encoding: "utf8", env: baseEnv() });
		assert.equal(upToDateWithout.status, 0, upToDateWithout.stderr);
		assert.equal(upToDateWith.stdout, upToDateWithout.stdout, "up-to-date stdout byte-identical");
		events = readEvents(root, "lt7-again");
		assert.equal(events.length, 1, "up-to-date path also emits");
		assert.equal(events[0].event, "panel.agent_stamped");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT8 — validate-task emits task.validated with task id, verdict, scenario ids
// on PASS/FAIL/parsing-ERROR fixtures, with and without --report; an
// unparseable-manifest ERROR skips emission; report/stdout bytes identical
// with emission active vs inactive.
// ---------------------------------------------------------------------------
function mkTaskRepo() {
	const dir = tmp("sdlc-lt2-vt-");
	writeFileSync(join(dir, "bp.md"), "# build plan\n");
	writeFileSync(join(dir, "ok.mjs"), "process.exit(0);");
	writeFileSync(join(dir, "bad.mjs"), "process.exit(1);");
	return dir;
}

function passManifest() {
	return {
		schemaVersion: 1,
		taskId: "lt8-pass",
		buildPlan: "bp.md",
		repoRoot: ".",
		ownedScenarios: ["LT8"],
		checks: [{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["LT8"] }],
		categories: {
			tests: { applicability: "required", checkIds: ["tests.ok"] },
			static: { applicability: "n/a", reason: "no static checks needed for this fixture" },
			scenarios: { applicability: "required", evidence: { LT8: ["tests.ok"] } },
			standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
			bannedPatterns: { applicability: "n/a", reason: "no banned-pattern checks for this fixture" },
		},
	};
}

function failManifest() {
	return {
		...passManifest(),
		taskId: "lt8-fail",
		checks: [{ id: "tests.bad", argv: ["node", "bad.mjs"], evidence: ["LT8"] }],
		categories: { ...passManifest().categories, tests: { applicability: "required", checkIds: ["tests.bad"] }, scenarios: { applicability: "required", evidence: { LT8: ["tests.bad"] } } },
	};
}

// Parses as JSON, carries a taskId, but fails inspectManifest (missing categories).
function errorManifestParses() {
	return { schemaVersion: 1, taskId: "lt8-error", buildPlan: "bp.md", repoRoot: "." };
}

function runValidateTask(dir, manifestName, args = []) {
	const manifestPath = join(dir, manifestName);
	const r = spawnSync(process.execPath, [validateTask, "--manifest", manifestPath, "--repo-root", dir, "--format", "json", ...args], { encoding: "utf8", env: baseEnv() });
	return { status: r.status, stdout: r.stdout, stderr: r.stderr };
}

// durationMs is real wall-clock jitter, not part of the frozen contract;
// normalize it before byte-identity comparisons.
function normalizeDurations(json) {
	return json.replace(/"durationMs": \d+/g, '"durationMs": 0');
}

test("LT8: validate-task emits task.validated on PASS with and without --report", () => {
	const dir = mkTaskRepo();
	try {
		writeFileSync(join(dir, "pass.json"), JSON.stringify(passManifest()));
		const without = runValidateTask(dir, "pass.json");
		const withSlug = runValidateTask(dir, "pass.json", ["--slug", "lt8-pass-run"]);
		assert.equal(without.status, 0, without.stderr);
		assert.equal(normalizeDurations(withSlug.stdout), normalizeDurations(without.stdout), "stdout byte-identical without --report");

		const reportA = join(dir, "report-a.json");
		const reportB = join(dir, "report-b.json");
		const withoutReport = runValidateTask(dir, "pass.json", ["--report", reportA]);
		const withReport = runValidateTask(dir, "pass.json", ["--report", reportB, "--slug", "lt8-pass-run2"]);
		assert.equal(withoutReport.status, 0, withoutReport.stderr);
		assert.equal(normalizeDurations(withReport.stdout), normalizeDurations(withoutReport.stdout), "stdout byte-identical with --report");
		assert.equal(normalizeDurations(readFileSync(reportA, "utf8")), normalizeDurations(readFileSync(reportB, "utf8")), "report bytes identical with emission active vs inactive");

		const events = readEvents(dir, "lt8-pass-run");
		assert.equal(events.length, 1);
		assert.equal(events[0].event, "task.validated");
		assert.equal(events[0].by, "script:validate-task");
		assert.equal(events[0].payload.task, "lt8-pass");
		assert.equal(events[0].payload.verdict, "PASS");
		assert.deepEqual(events[0].payload.scenarioIds, ["LT8"]);

		const events2 = readEvents(dir, "lt8-pass-run2");
		assert.equal(events2.length, 1, "emission also happens with --report present");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("LT8: validate-task emits task.validated on FAIL", () => {
	const dir = mkTaskRepo();
	try {
		writeFileSync(join(dir, "fail.json"), JSON.stringify(failManifest()));
		const r = runValidateTask(dir, "fail.json", ["--slug", "lt8-fail-run"]);
		assert.equal(r.status, 1, r.stderr);
		const events = readEvents(dir, "lt8-fail-run");
		assert.equal(events.length, 1);
		assert.equal(events[0].payload.task, "lt8-fail");
		assert.equal(events[0].payload.verdict, "FAIL");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses", () => {
	const dir = mkTaskRepo();
	try {
		writeFileSync(join(dir, "error.json"), JSON.stringify(errorManifestParses()));
		const r = runValidateTask(dir, "error.json", ["--slug", "lt8-error-run"]);
		assert.equal(r.status, 2, r.stderr);
		const events = readEvents(dir, "lt8-error-run");
		assert.equal(events.length, 1, "manifest parsed far enough to yield a task id");
		assert.equal(events[0].payload.task, "lt8-error");
		assert.equal(events[0].payload.verdict, "ERROR");
		assert.deepEqual(events[0].payload.scenarioIds, []);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("LT8: an unparseable-manifest ERROR skips emission with the standard warning", () => {
	const dir = mkTaskRepo();
	try {
		writeFileSync(join(dir, "bad.json"), "{ not json");
		const r = runValidateTask(dir, "bad.json", ["--slug", "lt8-bad-run"]);
		assert.equal(r.status, 2);
		assert.equal(existsSync(eventsPath(dir, "lt8-bad-run")), false, "no store written when the manifest is unparseable");
		assert.ok(r.stderr.includes("sdlc-telemetry:"), "standard skip warning present");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT9 — with the run store unwritable, all three commands succeed with their
// normal output plus one prefixed stderr warning.
// ---------------------------------------------------------------------------
function blockRunStore(root) {
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	// A plain file where a directory is expected blocks mkdirSync beneath it.
	writeFileSync(join(root, ".pi", "sdlc", "runs"), "blocker");
}

test("LT9: unwritable run store degrades to a warning; primary output unaffected", () => {
	// resolve-panel
	const pf = panelFixture();
	try {
		blockRunStore(pf.root);
		const r = runResolvePanel(pf, ["--slug", "lt9-run"]);
		assert.equal(r.status, 0, r.stderr);
		assert.ok(r.stdout.length > 0, "normal panel output still printed");
		const warnings = r.stderr.split("\n").filter((l) => l.includes("sdlc-telemetry:"));
		assert.equal(warnings.length, 1, `exactly one prefixed warning; got:\n${r.stderr}`);
	} finally {
		rmSync(pf.root, { recursive: true, force: true });
	}

	// ensure-panel-agent
	const epaRoot = tmp("sdlc-lt2-epa-blocked-");
	try {
		blockRunStore(epaRoot);
		const r = runEnsurePanelAgent(epaRoot, ["--slug", "lt9-run"]);
		assert.equal(r.status, 0, r.stderr);
		assert.ok(r.stdout.includes("agent:"), "normal ensure-panel-agent output still printed");
		const warnings = r.stderr.split("\n").filter((l) => l.includes("sdlc-telemetry:"));
		assert.equal(warnings.length, 1, `exactly one prefixed warning; got:\n${r.stderr}`);
	} finally {
		rmSync(epaRoot, { recursive: true, force: true });
	}

	// validate-task
	const vtDir = mkTaskRepo();
	try {
		writeFileSync(join(vtDir, "pass.json"), JSON.stringify(passManifest()));
		blockRunStore(vtDir);
		const r = runValidateTask(vtDir, "pass.json", ["--slug", "lt9-run"]);
		assert.equal(r.status, 0, r.stderr);
		const parsed = JSON.parse(r.stdout);
		assert.equal(parsed.verdict, "PASS", "normal validate-task report still produced");
		const warnings = r.stderr.split("\n").filter((l) => l.includes("sdlc-telemetry:"));
		assert.equal(warnings.length, 1, `exactly one prefixed warning; got:\n${r.stderr}`);
	} finally {
		rmSync(vtDir, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// Regression: a --repo-root nested inside this repo (as several existing
// fixture-driven tests use, e.g. test/fixtures/consumer) resolves branch
// identity against the outer .git and can legitimately write a run store
// under that nested directory. .gitignore's **/ anchoring must cover it too,
// not just the true repo root (a plain `.pi/sdlc/runs/` entry only matches at
// the .gitignore's own directory level per git's pattern semantics).
// ---------------------------------------------------------------------------
test("nested --repo-root run stores are git-ignored too (gitignore anchoring)", () => {
	const r = spawnSync("git", ["-C", repoRoot, "check-ignore", "-q", "test/fixtures/consumer/.pi/sdlc/runs/anchoring-regression/events.jsonl"], { encoding: "utf8" });
	assert.equal(r.status, 0, "a nested run store must be git-ignored too");
});

// ---------------------------------------------------------------------------
// LT10 — check-lifecycle.mjs and check-lifecycle.sh are byte-identical to main
// (FS9 read-only surface untouched by this task).
// ---------------------------------------------------------------------------
test("LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission", () => {
	const sha256 = (path) => createHash("sha256").update(readFileSync(path)).digest("hex");
	assert.equal(sha256(checkLifecycleMjs), "306f5a1464f3e74b094655418a5743e37db99953bcc56364b56b4ec04f6930d0", "check-lifecycle.mjs must stay byte-identical (FS9)");
	assert.equal(sha256(checkLifecycleSh), "cbb772dffb9eb12519782fd87b05b501a7b0e0b3ba52db38c188504e9971a8bb", "check-lifecycle.sh must stay byte-identical (FS9)");
});
