import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import test, { after } from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCRIPT = join(ROOT, "skills", "sdlc", "scripts", "check-lifecycle.mjs");
const BODY = "```sdlc\ntrack: reversible\nslug: sdlc-adoption-bundle\n```\n";
const OLDER_REMEDY = "config schemaVersion 1 predates this skill (requires 4) — re-run setup-sdlc to write a fresh v4 config (--force to replace an existing one), or pin pi-sdlc to the release that wrote it; there is no pre-adoption fold-forward path";
const NEWER_REMEDY = "config schemaVersion 5 is newer than this skill (requires 4) — upgrade pi-sdlc, or run the pinned pi-sdlc release that wrote this config";

function consumerFixture(schemaVersion = 4) {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-lifecycle-consumer-"));
	mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
	mkdirSync(join(dir, "docs", "plans"), { recursive: true });
	const config = {
		schemaVersion,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
	};
	writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(config));
	writeFileSync(join(dir, "docs", "plans", "2026-07-16-sdlc-adoption-bundle.md"), "# plan\n");
	writeFileSync(join(dir, "docs", "plans", "2026-07-16-sdlc-adoption-bundle-build.md"), "# build\n");
	execFileSync("git", ["-C", dir, "init", "-q"]);
	execFileSync("git", ["-C", dir, "-c", "user.email=test@example.com", "-c", "user.name=Test", "add", "."]);
	execFileSync("git", ["-C", dir, "-c", "user.email=test@example.com", "-c", "user.name=Test", "-c", "commit.gpgsign=false", "commit", "-qm", "fixture"]);
	return dir;
}

const CONSUMER = consumerFixture();
after(() => rmSync(CONSUMER, { recursive: true, force: true }));

function run(args, cwd = CONSUMER) {
	return spawnSync(process.execPath, [SCRIPT, "--repo-root", cwd, ...args], { cwd, encoding: "utf8" });
}

function jsonRun(args, cwd = CONSUMER) {
	const result = run(["--format", "json", ...args], cwd);
	try {
		return { ...result, report: JSON.parse(result.stdout) };
	} catch (error) {
		throw new Error(`invalid JSON report: ${error.message}\nstdout: ${result.stdout}\nstderr: ${result.stderr}`);
	}
}

function fixture() {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-lifecycle-"));
	writeFileSync(join(dir, "body.md"), BODY);
	return dir;
}

test("help is available without a declaration source", () => {
	const result = run(["--help"]);
	assert.equal(result.status, 0);
	assert.match(result.stdout, /usage: check-lifecycle/);
});

test("flags mode accepts a reversible declaration", () => {
	const result = jsonRun(["--track", "reversible", "--slug", "sdlc-adoption-bundle"]);
	assert.equal(result.status, 0);
	assert.equal(result.report.schemaVersion, 1, "the independent FS9 envelope stays at schemaVersion 1");
	assert.equal(result.report.state, "pass");
	assert.equal(result.report.track, "reversible");
	assert.equal(result.report.slug, "sdlc-adoption-bundle");
	assert.equal(result.report.mode, "flags");
	assert.equal(result.report.checks.find((c) => c.id === "artifact.spec").status, "skip");
});

test("invalid track stays null in the report envelope", () => {
	const result = jsonRun(["--track", "banana", "--slug", "sdlc-adoption-bundle"]);
	assert.equal(result.status, 1);
	assert.equal(result.report.track, null);
});

test("track none requires a reason and demands no artifacts", () => {
	const good = jsonRun(["--track", "none", "--reason", "dependency update"]);
	assert.equal(good.status, 0);
	assert.equal(good.report.track, "none");
	assert.equal(good.report.checks.find((c) => c.id === "artifact.plan").status, "skip");
	const bad = jsonRun(["--track", "none"]);
	assert.equal(bad.status, 1);
	assert.equal(bad.report.checks.find((c) => c.id === "declaration.reason").status, "fail");
});

test("body grammar rejects ambiguity and invalid lines", () => {
	const dir = fixture();
	try {
		writeFileSync(join(dir, "body.md"), `${BODY}\n${BODY}`);
		const ambiguous = jsonRun(["--body", join(dir, "body.md")]);
		assert.equal(ambiguous.status, 1);
		assert.equal(ambiguous.report.checks.find((c) => c.id === "declaration.parse").status, "fail");
		writeFileSync(join(dir, "body.md"), "```sdlc\ntrack: nope\nslug: bad\n```\n");
		const invalidTrack = jsonRun(["--body", join(dir, "body.md")]);
		assert.equal(invalidTrack.status, 1);
		assert.equal(invalidTrack.report.checks.find((c) => c.id === "declaration.track").status, "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("bot exemption applies only without a valid declaration", () => {
	const dir = fixture();
	try {
		writeFileSync(join(dir, "event.json"), JSON.stringify({ pull_request: { body: "", user: { login: "dependabot[bot]" } } }));
		const exempt = jsonRun(["--event", join(dir, "event.json")]);
		assert.equal(exempt.status, 0);
		assert.equal(exempt.report.exempt, true);
		assert.equal(exempt.report.track, "none");
		assert.match(exempt.report.reason, /dependabot\[bot\]/);
		writeFileSync(join(dir, "event.json"), JSON.stringify({ pull_request: { body: BODY, user: { login: "dependabot[bot]" } } }));
		const declared = jsonRun(["--event", join(dir, "event.json")]);
		assert.equal(declared.report.exempt, false);
		assert.equal(declared.report.track, "reversible");
		const invalid = jsonRun(["--track", "banana", "--slug", "bad", "--author", "dependabot[bot]"]);
		assert.equal(invalid.status, 0);
		assert.equal(invalid.report.exempt, true);
		assert.equal(invalid.report.track, "none");
		assert.match(invalid.report.checks.find((c) => c.id === "declaration.parse").message, /^no valid declaration; auto-generated exemption applies/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("empty body and event filenames remain source errors", () => {
	const body = jsonRun(["--body", ""]);
	assert.equal(body.status, 2);
	assert.equal(body.report.mode, "body");
	assert.equal(body.report.checks.find((c) => c.id === "declaration.source").status, "error");
	const event = jsonRun(["--event", ""]);
	assert.equal(event.status, 2);
	assert.equal(event.report.mode, "event");
	assert.equal(event.report.checks.find((c) => c.id === "declaration.source").status, "error");
});

test("event payload null body is an empty body and missing login is not exempt", () => {
	const dir = fixture();
	try {
		writeFileSync(join(dir, "event.json"), JSON.stringify({ pull_request: { body: null, user: {} } }));
		const result = jsonRun(["--event", join(dir, "event.json")]);
		assert.equal(result.status, 1);
		assert.equal(result.report.exempt, false);
		assert.equal(result.report.checks.find((c) => c.id === "declaration.parse").status, "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("JSON mode is inert for shell metacharacters and emits one envelope", () => {
	const dir = fixture();
	try {
		const payload = ["```sdlc\ntrack: none\nreason: $(touch /tmp/pwned) `quoted` ", String.fromCharCode(36), "{{ github.token }}\n```\n"].join("");
		writeFileSync(join(dir, "body.md"), payload);
		const result = jsonRun(["--body", join(dir, "body.md")]);
		assert.equal(result.stdout.trim().startsWith("{"), true);
		assert.equal(result.stderr, "");
		assert.equal(result.report.exitCode, 0);
		assert.equal(existsSync("/tmp/pwned"), false);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("CV27: config classification precedes inspection while FS9 semantics and envelope stay unchanged", () => {
	const current = jsonRun(["--track", "none", "--reason", "compatibility check"]);
	assert.equal(current.status, 0);
	assert.equal(current.report.schemaVersion, 1);
	assert.equal(current.report.checks.find((check) => check.id === "config.valid").status, "pass");

	const olderRoot = consumerFixture(1);
	try {
		const older = jsonRun(["--track", "none", "--reason", "compatibility check"], olderRoot);
		assert.equal(older.status, 2);
		assert.equal(older.report.schemaVersion, 1);
		const configCheck = older.report.checks.find((check) => check.id === "config.valid");
		assert.equal(configCheck.status, "error");
		assert.equal(configCheck.message, `manifest is superseded: ${OLDER_REMEDY}`);
		assert.equal(older.report.checks.find((check) => check.id === "declaration.track").status, "pass", "declaration semantics still evaluate independently");
		for (const id of ["artifact.plan", "artifact.spec", "artifact.build"]) assert.equal(older.report.checks.find((check) => check.id === id).status, "skip");
	} finally {
		rmSync(olderRoot, { recursive: true, force: true });
	}

	const newerRoot = consumerFixture(5);
	try {
		const newer = jsonRun(["--track", "none", "--reason", "compatibility check"], newerRoot);
		assert.equal(newer.status, 2);
		assert.equal(newer.report.checks.find((check) => check.id === "config.valid").message, NEWER_REMEDY);
	} finally {
		rmSync(newerRoot, { recursive: true, force: true });
	}
});
