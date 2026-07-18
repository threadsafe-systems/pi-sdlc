// Offline contract tests for the portable per-task validator (PV1-PV13).
// No live/paid model calls, no network: every command fixture is a local node
// stub or a missing binary. Deterministic runner + schema + receipt behaviour.

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { boundStream, buildRedactionValues, inspectManifest, parseArgs, redact, renderText, runManifest } from "../skills/sdlc/scripts/validate-task.mjs";
import { sha256, verifyReceipt } from "../skills/sdlc/scripts/verify-task-receipt.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const runnerMjs = join(repo, "skills", "sdlc", "scripts", "validate-task.mjs");
let schema;
try {
	schema = JSON.parse(readFileSync(join(repo, "skills", "sdlc", "schema", "task-validation-manifest.schema.json"), "utf8"));
} catch (error) {
	assert.fail(`task validation schema is unreadable: ${error.message}`);
}

const STUBS = {
	"ok.mjs": "process.stdout.write('ok\\n'); process.exit(0);",
	"fail.mjs": "process.stderr.write('boom\\n'); process.exit(3);",
	"lines.mjs": "for (let i=0;i<500;i++) process.stdout.write('line '+i+'\\n'); process.exit(0);",
	"secret.mjs": "process.stdout.write('leak '+ (process.env.MY_API_TOKEN||'') +'\\n'); process.exit(0);",
	"sleep.mjs": "setTimeout(()=>process.exit(0), 5000);",
	"marker.mjs": "import fs from 'node:fs'; fs.writeFileSync(process.argv[2],'x'); process.exit(0);",
};

function mkRepo() {
	const dir = mkdtempSync(join(tmpdir(), "pv-repo-"));
	writeFileSync(join(dir, "bp.md"), "# build plan\n");
	for (const [name, body] of Object.entries(STUBS)) writeFileSync(join(dir, name), body);
	return dir;
}

function baseManifest(overrides = {}) {
	return {
		schemaVersion: 1,
		taskId: "pv-x",
		buildPlan: "bp.md",
		repoRoot: ".",
		ownedScenarios: ["PV1"],
		checks: [
			{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["PV1"] },
			{ id: "static.ok", argv: ["node", "ok.mjs"], evidence: ["static"] },
			{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["patterns"] },
		],
		categories: {
			tests: { applicability: "required", checkIds: ["tests.ok"] },
			static: { applicability: "required", checkIds: ["static.ok"] },
			scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } },
			standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
			bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
		},
		...overrides,
	};
}

function writeManifest(dir, obj, name = "m.json") {
	const p = join(dir, name);
	writeFileSync(p, JSON.stringify(obj, null, 2));
	return p;
}

function runCli(dir, args, env) {
	const r = spawnSync("node", [runnerMjs, ...args], { cwd: dir, encoding: "utf8", env: env ?? process.env });
	return { code: r.status, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

// ---- PV1 -----------------------------------------------------------------

test("PV1: a valid JavaScript manifest runs only declared checks and passes", () => {
	const dir = mkRepo();
	try {
		const p = writeManifest(dir, baseManifest());
		const report = runManifest({ manifestPath: p, repoRoot: dir });
		assert.equal(report.verdict, "PASS");
		assert.equal(report.exitCode, 0);
		assert.deepEqual(
			report.commands.map((c) => c.id),
			["tests.ok", "static.ok", "patterns.ok"],
		);
		assert.ok(report.commands.every((c) => c.status === "PASS"));
		assert.equal(report.categories.find((c) => c.category === "standards").status, "N/A");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV2: only declared argv run; an undeclared tool command never executes", () => {
	const dir = mkRepo();
	try {
		const marker = join(dir, "undeclared-ran");
		// A manifest that does NOT declare the marker command.
		const p = writeManifest(dir, baseManifest());
		runManifest({ manifestPath: p, repoRoot: dir });
		assert.ok(!existsSyncSafe(marker), "undeclared command must not run");
		// Now declare it and confirm it runs.
		const withMarker = baseManifest({
			checks: [
				{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["PV1"] },
				{ id: "static.mark", argv: ["node", "marker.mjs", marker], evidence: ["marker"] },
				{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["patterns"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.ok"] },
				static: { applicability: "required", checkIds: ["static.mark"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } },
				standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
				bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
			},
		});
		runManifest({ manifestPath: writeManifest(dir, withMarker, "m2.json"), repoRoot: dir });
		assert.ok(existsSyncSafe(marker), "declared command must run");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

function existsSyncSafe(p) {
	try {
		readFileSync(p);
		return true;
	} catch {
		return false;
	}
}

// ---- PV3 -----------------------------------------------------------------

test("PV3: schema and inspectManifest reject the mutation matrix before any command runs", () => {
	const dir = mkRepo();
	const ajv = new Ajv({ allErrors: true, strict: false });
	const validate = ajv.compile(schema);
	try {
		assert.ok(validate(baseManifest()), `base should be schema-valid: ${JSON.stringify(validate.errors)}`);
		assert.deepEqual(inspectManifest(baseManifest(), { repoRoot: dir }), []);

		const mutate = (fn) => {
			const m = baseManifest();
			fn(m);
			return m;
		};
		const mutations = [
			mutate((m) => delete m.categories.standards),
			mutate((m) => (m.categories.deploy = { applicability: "n/a", reason: "unknown category here" })),
			mutate((m) => {
				m.checks[0].id = "dup.x";
				m.checks[1].id = "dup.x";
			}),
			mutate((m) => (m.checks[0].id = "Bad Id")),
			mutate((m) => (m.checks[0].argv = [])),
			mutate((m) => (m.checks[0].argv = ["multi\nline"])),
			mutate((m) => (m.checks[0].timeoutMs = 10)),
			mutate((m) => (m.categories.standards = { applicability: "n/a", reason: "short" })),
			mutate((m) => (m.categories.tests = { applicability: "required", checkIds: ["nope"] })),
			mutate((m) => m.checks.push({ id: "dangling.x", argv: ["node", "ok.mjs"], evidence: ["x"] })),
			mutate((m) => (m.buildPlan = "../escape.md")),
			mutate((m) => (m.repoRoot = "sub")),
			mutate((m) => delete m.checks[0].evidence),
		];
		for (const m of mutations) {
			const schemaOk = validate(m);
			const issues = inspectManifest(m, { repoRoot: dir });
			assert.ok(!schemaOk || issues.length > 0, `mutation should be rejected: ${JSON.stringify(m.categories.deploy ?? m.checks)}`);
		}

		// Scenario cross-field mutations
		const s1 = baseManifest({ ownedScenarios: ["PV1", "PV9"], categories: { ...baseManifest().categories, scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } } } });
		assert.ok(
			inspectManifest(s1, { repoRoot: dir }).some((e) => e.startsWith("/categories/scenarios/evidence")),
			"missing scenario mapping must be caught",
		);

		// static.ok is referenced by a required category, so mapping to it is legal; map to an unreferenced check instead:
		const s3 = baseManifest({
			checks: [...baseManifest().checks, { id: "extra.x", argv: ["node", "ok.mjs"], evidence: ["x"] }],
			categories: { ...baseManifest().categories, scenarios: { applicability: "required", evidence: { PV1: ["extra.x"] } } },
		});
		assert.ok(
			inspectManifest(s3, { repoRoot: dir }).some((e) => e.includes("not referenced by any required")),
			"scenario mapped to unreferenced check must be caught",
		);

		// A malformed manifest through the CLI runs zero commands.
		const bad = writeManifest(
			dir,
			mutate((m) => delete m.categories.standards),
			"bad.json",
		);
		const r = runCli(dir, ["--manifest", bad, "--repo-root", dir, "--format", "json"]);
		assert.equal(r.code, 2);
		const rep = JSON.parse(r.stdout);
		assert.equal(rep.verdict, "ERROR");
		assert.equal(rep.commands.length, 0);
		assert.ok(rep.manifestErrors.length > 0);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV4 -----------------------------------------------------------------

test("PV4: command outcomes are complete and deterministic; runner continues after failures", () => {
	const dir = mkRepo();
	try {
		const m = baseManifest({
			ownedScenarios: ["PV1"],
			checks: [
				{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["PV1"] },
				{ id: "c.fail", argv: ["node", "fail.mjs"], evidence: ["x"] },
				{ id: "c.missing", argv: ["this-binary-does-not-exist-xyz"], evidence: ["y"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.ok"] },
				static: { applicability: "required", checkIds: ["c.fail", "c.missing"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } },
				standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
				bannedPatterns: { applicability: "n/a", reason: "no banned-pattern scan applies to this task" },
			},
		});
		const report = runManifest({ manifestPath: writeManifest(dir, m), repoRoot: dir });
		assert.equal(report.verdict, "FAIL");
		assert.equal(report.exitCode, 1);
		const fail = report.commands.find((c) => c.id === "c.fail");
		assert.equal(fail.status, "FAIL");
		assert.equal(fail.exitCode, 3);
		const missing = report.commands.find((c) => c.id === "c.missing");
		assert.equal(missing.status, "FAIL");
		assert.equal(missing.exitCode, null);
		assert.equal(report.commands.length, 3, "runner must not fail-fast");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV4: a timeout is reported as FAIL with timedOut", () => {
	const dir = mkRepo();
	try {
		const m = baseManifest({
			checks: [
				{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["PV1"] },
				{ id: "slow", argv: ["node", "sleep.mjs"], timeoutMs: 1000, evidence: ["x"] },
				{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["p"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.ok"] },
				static: { applicability: "required", checkIds: ["slow"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } },
				standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
				bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
			},
		});
		const report = runManifest({ manifestPath: writeManifest(dir, m), repoRoot: dir });
		const slow = report.commands.find((c) => c.id === "slow");
		assert.equal(slow.status, "FAIL");
		assert.equal(slow.timedOut, true);
		assert.equal(report.verdict, "FAIL");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV5 -----------------------------------------------------------------

test("PV5: category applicability is exact; injected n/a shapes are rejected", () => {
	const dir = mkRepo();
	try {
		// required category with a reason field (invented n/a smuggling) -> invalid
		const m1 = baseManifest();
		m1.categories.tests = { applicability: "required", checkIds: ["tests.ok"], reason: "should not be here" };
		assert.ok(inspectManifest(m1, { repoRoot: dir }).length > 0);

		// n/a category with checkIds -> invalid
		const m2 = baseManifest();
		m2.categories.standards = { applicability: "n/a", reason: "a valid enough reason here", checkIds: ["tests.ok"] };
		assert.ok(inspectManifest(m2, { repoRoot: dir }).length > 0);

		// n/a reason present and structural -> the runner does not judge its substance
		const m3 = baseManifest();
		const report = runManifest({ manifestPath: writeManifest(dir, m3), repoRoot: dir });
		assert.equal(report.categories.find((c) => c.category === "standards").status, "N/A");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV6 -----------------------------------------------------------------

test("PV6: scenario mapping gates the verdict", () => {
	const dir = mkRepo();
	try {
		const m = baseManifest({
			ownedScenarios: ["PV1"],
			checks: [
				{ id: "tests.fail", argv: ["node", "fail.mjs"], evidence: ["PV1"] },
				{ id: "static.ok", argv: ["node", "ok.mjs"], evidence: ["s"] },
				{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["p"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.fail"] },
				static: { applicability: "required", checkIds: ["static.ok"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.fail"] } },
				standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
				bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
			},
		});
		const report = runManifest({ manifestPath: writeManifest(dir, m), repoRoot: dir });
		assert.equal(report.scenarios.find((s) => s.scenarioId === "PV1").status, "FAIL");
		assert.equal(report.verdict, "FAIL");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV7 -----------------------------------------------------------------

test("PV7: standards and banned patterns are commands, not judgement", () => {
	const dir = mkRepo();
	try {
		const m = baseManifest({
			ownedScenarios: ["PV1"],
			checks: [
				{ id: "tests.ok", argv: ["node", "ok.mjs"], evidence: ["PV1"] },
				{ id: "static.ok", argv: ["node", "ok.mjs"], evidence: ["s"] },
				{ id: "standards.fail", argv: ["node", "fail.mjs"], evidence: ["governing standard"] },
				{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["p"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.ok"] },
				static: { applicability: "required", checkIds: ["static.ok"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.ok"] } },
				standards: { applicability: "required", checkIds: ["standards.fail"] },
				bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
			},
		});
		const report = runManifest({ manifestPath: writeManifest(dir, m), repoRoot: dir });
		assert.equal(report.categories.find((c) => c.category === "standards").status, "FAIL");
		assert.equal(report.verdict, "FAIL");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV8 -----------------------------------------------------------------

test("PV8: evidence is bounded and secrets are redacted", () => {
	const dir = mkRepo();
	const SENTINEL = "s3cr3t-sentinel-value-1234567890";
	const env = { ...process.env, MY_API_TOKEN: SENTINEL };
	try {
		const m = baseManifest({
			checks: [
				{ id: "tests.lines", argv: ["node", "lines.mjs"], evidence: ["PV1"] },
				{ id: "static.secret", argv: ["node", "secret.mjs"], evidence: ["s"] },
				{ id: "patterns.ok", argv: ["node", "ok.mjs"], evidence: ["p"] },
			],
			categories: {
				tests: { applicability: "required", checkIds: ["tests.lines"] },
				static: { applicability: "required", checkIds: ["static.secret"] },
				scenarios: { applicability: "required", evidence: { PV1: ["tests.lines"] } },
				standards: { applicability: "n/a", reason: "no extra governing standard applies here" },
				bannedPatterns: { applicability: "required", checkIds: ["patterns.ok"] },
			},
		});
		const report = runManifest({ manifestPath: writeManifest(dir, m), repoRoot: dir, env });
		const lines = report.commands.find((c) => c.id === "tests.lines");
		assert.ok(lines.stdoutTail.startsWith("[...truncated; showing bounded tail...]\n"), "long output must be truncated with the marker");
		assert.ok(lines.stdoutTail.replace(/\n$/, "").split("\n").length <= 100, "at most 100 lines");
		assert.ok(Buffer.byteLength(lines.stdoutTail, "utf8") <= 10240, "at most 10240 bytes");
		const secret = report.commands.find((c) => c.id === "static.secret");
		assert.ok(!secret.stdoutTail.includes(SENTINEL), "sentinel must be redacted");
		assert.ok(secret.stdoutTail.includes("[REDACTED]"), "redaction marker present");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV8 unit: boundStream and redaction name-matching are precise", () => {
	const big = `${Array.from({ length: 500 }, (_, i) => `l${i}`).join("\n")}\n`;
	const bounded = boundStream(big);
	assert.ok(bounded.startsWith("[...truncated; showing bounded tail...]\n"));
	assert.ok(bounded.split("\n").filter(Boolean).length <= 100);
	assert.equal(boundStream(""), "");
	// a single very large line must bound in one pass (no O(n^2) hang) and fit the byte cap
	const hugeLine = "a".repeat(20 * 1024 * 1024);
	const t0 = Date.now();
	const boundedHuge = boundStream(hugeLine);
	assert.ok(Date.now() - t0 < 2000, "boundStream must not be quadratic on a huge single line");
	assert.ok(boundedHuge.startsWith("[...truncated; showing bounded tail...]\n"));
	assert.ok(Buffer.byteLength(boundedHuge, "utf8") <= 10240, "single-line tail within byte cap");
	// name matching: credential tokens delimited, benign names ignored
	const values = buildRedactionValues({ OPENAI_API_KEY: "abcd1234", MONKEY: "banana99", AUTHOR: "neil-writes", OAUTH_TOKEN: "tok-000111" });
	assert.ok(values.includes("abcd1234"));
	assert.ok(values.includes("tok-000111"));
	assert.ok(!values.includes("banana99"), "MONKEY is not a credential name");
	assert.ok(!values.includes("neil-writes"), "AUTHOR is not a credential name");
	assert.equal(redact("x abcd1234 y", ["abcd1234"]), "x [REDACTED] y");
});

// ---- PV9 -----------------------------------------------------------------

test("PV9: JSON/text/exit agree and JSON mode is order-independent", () => {
	const dir = mkRepo();
	try {
		const p = writeManifest(dir, baseManifest());
		// --slug gives telemetry a resolvable identity (this fixture dir is not a
		// git repo) so emission succeeds silently, keeping this assertion about the
		// runner's own stdout/stderr purity meaningful (lt-t2: FS5 emission adds a
		// stderr warning only on skip/failure, never on success).
		const jsonRun = runCli(dir, ["--manifest", p, "--repo-root", dir, "--format", "json", "--slug", "pv9-x"]);
		assert.equal(jsonRun.code, 0);
		const rep = JSON.parse(jsonRun.stdout);
		assert.equal(rep.verdict, "PASS");
		assert.equal(jsonRun.stderr, "", "no stderr in JSON mode");

		const textRun = runCli(dir, ["--manifest", p, "--repo-root", dir]);
		assert.equal(textRun.code, 0);
		assert.ok(textRun.stdout.startsWith("task: pv-x\nmanifest: "));
		assert.match(textRun.stdout, /\nverdict: PASS\nexit-code: 0\n/);

		// argument error before --format json still yields a JSON envelope
		const badArg = runCli(dir, ["--bogus", "--format", "json"]);
		assert.equal(badArg.code, 2);
		const errRep = JSON.parse(badArg.stdout);
		assert.equal(errRep.verdict, "ERROR");
		assert.ok(errRep.errors.length > 0);

		// determinism: normalise durationMs then compare two runs
		const norm = (s) => {
			const o = JSON.parse(s);
			for (const c of o.commands) c.durationMs = 0;
			o.manifest = "";
			o.repoRoot = "";
			return JSON.stringify(o);
		};
		const a = runCli(dir, ["--manifest", p, "--repo-root", dir, "--format", "json"]).stdout;
		const b = runCli(dir, ["--manifest", p, "--repo-root", dir, "--format", "json"]).stdout;
		assert.equal(norm(a), norm(b));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV9: --report writes the exact JSON bytes atomically", () => {
	const dir = mkRepo();
	try {
		const p = writeManifest(dir, baseManifest());
		const out = join(dir, "report.json");
		const r = runCli(dir, ["--manifest", p, "--repo-root", dir, "--format", "json", "--report", out]);
		assert.equal(r.code, 0);
		assert.equal(readFileSync(out, "utf8"), r.stdout, "report file bytes equal stdout");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV9: --report outside the repo root is refused and clobbers nothing", () => {
	const dir = mkRepo();
	const outsideDir = mkdtempSync(join(tmpdir(), "pv-outside-"));
	const victim = join(outsideDir, "victim.json");
	writeFileSync(victim, '{"important":"data"}\n');
	try {
		const p = writeManifest(dir, baseManifest());
		const r = runCli(dir, ["--manifest", p, "--repo-root", dir, "--format", "json", "--report", victim]);
		assert.equal(r.code, 2, "escaping report path must be an ERROR");
		const rep = JSON.parse(r.stdout);
		assert.equal(rep.verdict, "ERROR");
		assert.ok(rep.errors.some((e) => e.includes("escapes the repository root")));
		assert.equal(readFileSync(victim, "utf8"), '{"important":"data"}\n', "victim file must be untouched");
	} finally {
		rmSync(dir, { recursive: true, force: true });
		rmSync(outsideDir, { recursive: true, force: true });
	}
});

// ---- PV10 ----------------------------------------------------------------

test("PV10: generic validator law and generated agent are portable", () => {
	const skillMd = readFileSync(join(repo, "skills", "sdlc", "SKILL.md"), "utf8");
	// The old unconditional mandate is gone from generic law.
	assert.doesNotMatch(skillMd, /`npx tsc --noEmit` exits zero/);
	assert.doesNotMatch(skillMd, /greppable CONTRIBUTORS rules hold/);
	// The portable law markers moved to the Implement phase reference (mutation of any fails this).
	const implementRef = readFileSync(join(repo, "skills", "sdlc", "references", "phase-implement.md"), "utf8");
	for (const marker of ["PV1 validation manifest", "deterministic runner", "validate-task.sh", "verify-task-receipt.mjs", "portable and deterministic"]) {
		assert.ok(implementRef.includes(marker), `phase-implement.md must document: ${marker}`);
	}
	assert.match(skillMd, /Bypassing the deterministic validation runner/);

	const prompt = readFileSync(join(repo, "skills", "sdlc", "prompts", "validator-task.prompt.md"), "utf8");
	for (const heading of ["## Inputs the caller gives you", "## Checks (run every one; do not skip)", "## Output format (STRICT: markdown only)"]) {
		assert.ok(prompt.includes(heading), `FS7 heading preserved: ${heading}`);
	}
	assert.doesNotMatch(prompt, /npx tsc --noEmit/);
	assert.doesNotMatch(prompt, /CONTRIBUTORS_PATH/);
	assert.match(prompt, /validate-task\.sh/);

	// The regenerated golden agent carries the portable prompt body, name and tools.
	const golden = readFileSync(join(repo, "test", "fixtures", "golden", "task_validate.agent.md"), "utf8");
	assert.match(golden, /^tools: read,grep,find,ls,bash$/m);
	assert.ok(golden.includes("validate-task.sh"));
	assert.doesNotMatch(golden, /npx tsc --noEmit/);
});

// ---- PV11 ----------------------------------------------------------------

test("PV11: receipt hash verification detects mutation of any stored file", () => {
	const dir = mkdtempSync(join(tmpdir(), "pv-receipt-"));
	try {
		writeFileSync(join(dir, "manifest.json"), '{"taskId":"pv-x"}\n');
		writeFileSync(join(dir, "runner-report.json"), '{"taskId":"pv-x","verdict":"PASS","exitCode":0}\n');
		writeFileSync(join(dir, "generated-agent.md"), "agent body\n");
		const hash = (f) =>
			createHash("sha256")
				.update(readFileSync(join(dir, f)))
				.digest("hex");
		const receipt = {
			schemaVersion: 1,
			taskId: "pv-x",
			manifestPath: "docs/validation/x/pv-x.json",
			manifestSha256: hash("manifest.json"),
			runnerReportSha256: hash("runner-report.json"),
			generatedAgentSha256: hash("generated-agent.md"),
			model: "provider/model:low",
			runnerVerdict: "PASS",
			validatorVerdict: "PASS",
			createdAt: new Date().toISOString(),
		};
		writeFileSync(join(dir, "receipt.json"), JSON.stringify(receipt, null, 2));
		assert.deepEqual(verifyReceipt(dir), [], "clean receipt verifies");
		assert.equal(sha256(Buffer.from("agent body\n")), receipt.generatedAgentSha256);

		writeFileSync(join(dir, "generated-agent.md"), "tampered\n");
		assert.ok(verifyReceipt(dir).some((f) => f.includes("generated-agent.md hash mismatch")));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("PV11: a FAIL runner-report cannot ride under runnerVerdict PASS", () => {
	const dir = mkdtempSync(join(tmpdir(), "pv-receipt2-"));
	try {
		writeFileSync(join(dir, "manifest.json"), '{"taskId":"pv-x"}\n');
		writeFileSync(join(dir, "runner-report.json"), '{"taskId":"pv-x","verdict":"FAIL","exitCode":1}\n');
		writeFileSync(join(dir, "generated-agent.md"), "agent body\n");
		const hash = (f) =>
			createHash("sha256")
				.update(readFileSync(join(dir, f)))
				.digest("hex");
		const receipt = {
			schemaVersion: 1,
			taskId: "pv-x",
			manifestPath: "docs/validation/x/pv-x.json",
			manifestSha256: hash("manifest.json"),
			runnerReportSha256: hash("runner-report.json"),
			generatedAgentSha256: hash("generated-agent.md"),
			model: "provider/model:low",
			runnerVerdict: "PASS",
			validatorVerdict: "PASS",
			createdAt: new Date().toISOString(),
		};
		writeFileSync(join(dir, "receipt.json"), JSON.stringify(receipt, null, 2));
		const failures = verifyReceipt(dir);
		assert.ok(
			failures.some((f) => f.includes("runner-report verdict/exit")),
			"a FAIL report must break verification even with matching hashes",
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

// ---- PV3/PV5 CLI arg contract --------------------------------------------

test("parseArgs: recognises JSON anywhere and rejects bad flags", () => {
	assert.equal(parseArgs(["--manifest", "m", "--format", "json"]).jsonMode, true);
	assert.throws(() => parseArgs(["--bogus", "--format", "json"]));
	assert.throws(() => parseArgs(["--nope"]));
	assert.throws(() => parseArgs(["--format", "yaml"]));
});

// ---- PV13 ----------------------------------------------------------------

test("PV13: renderText is a faithful projection of the report", () => {
	const dir = mkRepo();
	try {
		const report = runManifest({ manifestPath: writeManifest(dir, baseManifest()), repoRoot: dir });
		const text = renderText(report);
		assert.ok(text.includes("verdict: PASS"));
		assert.ok(text.includes("scenario: PV1 PASS"));
		assert.ok(text.includes("category: standards N/A reason="));
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
