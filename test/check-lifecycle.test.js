import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCRIPT = join(ROOT, "skills", "sdlc", "scripts", "check-lifecycle.mjs");
const BODY = "```sdlc\ntrack: reversible\nslug: sdlc-adoption-bundle\n```\n";

function run(args, cwd = ROOT) {
	return spawnSync(process.execPath, [SCRIPT, "--repo-root", cwd, ...args], { cwd, encoding: "utf8" });
}

function jsonRun(args, cwd = ROOT) {
	const result = run(["--format", "json", ...args], cwd);
	return { ...result, report: JSON.parse(result.stdout) };
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
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
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
