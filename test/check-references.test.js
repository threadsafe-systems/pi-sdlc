import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCRIPT = join(ROOT, "skills", "sdlc", "scripts", "check-references.mjs");
const INVENTORY = join(ROOT, "skills", "sdlc", "assets", "normative-references.json");

function run(args, cwd = ROOT) {
	return spawnSync(process.execPath, [SCRIPT, ...args], { cwd, encoding: "utf8" });
}

function parseJson(text) {
	try {
		return JSON.parse(text);
	} catch (error) {
		throw new Error(`invalid JSON report: ${error.message}\n${text}`);
	}
}

function jsonRun(args, cwd = ROOT) {
	const result = run(["--format", "json", ...args], cwd);
	return { ...result, report: parseJson(result.stdout) };
}

function fixture() {
	return mkdtempSync(join(tmpdir(), "sdlc-reference-"));
}

function writeFixture(root, entry, target = "target.txt", sourceText = entry.assertion) {
	writeFileSync(join(root, "source.txt"), sourceText);
	if (target) writeFileSync(join(root, target), "target\n");
	writeFileSync(join(root, "inventory.json"), JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", discovery: { roots: ["nonexistent-discovery-root/*.md"], exclude: [] }, sources: [{ ...entry, source: "source.txt", target }] }));
}

const BASE = { id: "fixture.source", assertion: "stable assertion", targetKind: "file", ownership: "package", required: true, resolution: "package", class: "package-public" };

test("live inventory passes with explicit non-package classifications", () => {
	const result = jsonRun(["--inventory", INVENTORY]);
	assert.equal(result.status, 0);
	assert.equal(result.report.state, "pass");
	assert.equal(result.report.reportVersion, 1);
	assert.ok(result.report.checks.some((check) => check.status === "unverified-consumer"));
	assert.ok(result.report.checks.some((check) => check.status === "external"));
});

test("missing target and assertion mutations are contract failures", () => {
	const root = fixture();
	try {
		writeFixture(root, BASE, "target.txt");
		rmSync(join(root, "target.txt"));
		let result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 1);
		assert.equal(result.report.checks[0].status, "fail");
		writeFileSync(join(root, "source.txt"), "changed");
		result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 1);
		assert.match(result.report.checks[0].message, /assertion occurs 0/);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("consumer and external entries are classified without probing", () => {
	const root = fixture();
	try {
		writeFileSync(join(root, "source.txt"), "consumer marker\nexternal marker\n");
		writeFileSync(
			join(root, "inventory.json"),
			JSON.stringify({
				schemaVersion: 1,
				package: "pi-sdlc",
				discovery: { roots: ["nonexistent-discovery-root/*.md"], exclude: [] },
				sources: [
					{ id: "consumer.optional", source: "source.txt", assertion: "consumer marker", targetKind: "file", ownership: "consumer", required: false, resolution: "consumer", target: ".pi/sdlc/workflow.md", class: "consumer-integration" },
					{ id: "external.facility", source: "source.txt", assertion: "external marker", targetKind: "external", ownership: "external", required: false, resolution: "external", target: "github.com", class: "runtime-tool" },
				],
			}),
		);
		const result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 0);
		assert.deepEqual(
			result.report.checks.map((check) => check.status),
			["unverified-consumer", "external"],
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("readiness requires the verifier assertion and path containment", () => {
	const root = fixture();
	try {
		writeFileSync(join(root, "source.txt"), "claim\n");
		writeFileSync(join(root, "verifier.txt"), "verifier marker\n");
		writeFileSync(join(root, "target.txt"), "target\n");
		const entry = {
			id: "readiness.claim",
			source: "source.txt",
			assertion: "claim",
			targetKind: "facility",
			ownership: "consumer",
			required: true,
			resolution: "readiness",
			target: ".github/pull_request_template.md",
			verification: { source: "verifier.txt", assertion: "verifier marker" },
			class: "consumer-integration",
		};
		writeFileSync(join(root, "inventory.json"), JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", discovery: { roots: ["nonexistent-discovery-root/*.md"], exclude: [] }, sources: [entry] }));
		let result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 0);
		writeFileSync(join(root, "verifier.txt"), "removed\n");
		result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 1);
		assert.match(result.report.checks[0].message, /readiness assertion/);
		const invalid = { ...entry, target: "../outside" };
		writeFileSync(join(root, "inventory.json"), JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", sources: [invalid] }));
		result = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(result.status, 2);
		const outside = join(root, "..", "outside-inventory.json");
		writeFileSync(outside, JSON.stringify({ schemaVersion: 1, package: "pi-sdlc", sources: [BASE] }));
		result = jsonRun(["--package-root", root, "--inventory", outside]);
		assert.equal(result.status, 2);
		rmSync(outside, { force: true });
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("invalid inventory and JSON argument errors emit one envelope", () => {
	const root = fixture();
	try {
		writeFileSync(join(root, "inventory.json"), JSON.stringify({ schemaVersion: 2, package: "pi-sdlc", sources: [] }));
		const invalid = jsonRun(["--package-root", root, "--inventory", join(root, "inventory.json")]);
		assert.equal(invalid.status, 2);
		assert.equal(invalid.stdout.trim().split("\n").length, 1);
		const args = run(["--format=json", "--unknown"], root);
		assert.equal(args.status, 2);
		assert.equal(args.stderr, "");
		assert.equal(JSON.parse(args.stdout).state, "error");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("shell wrapper resolves beside itself from a consumer cwd", () => {
	const root = fixture();
	try {
		const wrapper = join(ROOT, "skills", "sdlc", "scripts", "check-references.sh");
		const result = spawnSync(wrapper, ["--format", "json", "--inventory", INVENTORY], { cwd: root, encoding: "utf8" });
		assert.equal(result.status, 0);
		assert.equal(JSON.parse(result.stdout).state, "pass");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
