// Offline behavioural tests for the FS8 v2 `sdlc-status` readiness command.
// Covers the four-state baseline plus CV17-CV20 schema drift and panels
// readiness. No network, credentials, or model calls.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { baseEnv, gitFixture, readyFixture, runStatus, VALID_CONFIG } from "./fs8-helpers.js";

const CANONICAL_IDS = ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "config.schema-current", "config.panels", "workflow.readable"];
const OLDER_REMEDY = "config schemaVersion 1 predates this skill (requires 2) — run the setup-sdlc migration interactively to fold it forward, or pin pi-sdlc to a release before the schema-2 major";
const NEWER_REMEDY = "config schemaVersion 3 is newer than this skill (requires 2) — upgrade pi-sdlc, or run the pinned pi-sdlc release that wrote this config";

function reportOf(result) {
	assert.equal(result.stderr, "");
	try {
		return JSON.parse(result.stdout);
	} catch (error) {
		throw new Error(`invalid JSON status report: ${error.message}\nstdout: ${result.stdout}`);
	}
}

function check(report, id) {
	const found = report.checks.find((candidate) => candidate.id === id);
	assert.ok(found, `missing check ${id}`);
	return found;
}

function textCheckStatus(stdout, id) {
	const line = stdout.split("\n").find((candidate) => candidate.startsWith(`check: ${id} `));
	assert.ok(line, `missing check line for ${id} in:\n${stdout}`);
	return line.split(" ")[2];
}

function v1Config() {
	return { schemaVersion: 1, prefix: "acme", labelPrefix: "acme-sdlc", announce: "legacy" };
}

test("CV19: committed migrated v2 config without a models file is ready in text and JSON", () => {
	const dir = readyFixture();
	try {
		for (const format of ["text", "json"]) {
			const result = runStatus(["--repo-root", dir, "--format", format]);
			assert.equal(result.code, 0, result.stdout + result.stderr);
			assert.equal(result.stderr, "");
			if (format === "json") {
				const report = reportOf(result);
				assert.equal(report.schemaVersion, 2);
				assert.equal(report.state, "ready");
				assert.equal(report.exitCode, 0);
				assert.deepEqual(
					report.checks.map((candidate) => candidate.id),
					CANONICAL_IDS,
				);
				assert.ok(report.checks.every((candidate) => candidate.status === "pass"));
				assert.ok(report.checks.every((candidate) => !candidate.id.startsWith("models.")));
			} else {
				assert.match(result.stdout, /state: ready/);
				assert.match(result.stdout, /check: config\.schema-current pass — config schema is current \(schemaVersion 2\)/);
				assert.match(result.stdout, /check: config\.panels pass — panels roster present/);
				assert.doesNotMatch(result.stdout, /check: models\./);
			}
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("CV17: recognised v1 is not-ready with canonical migration remedy and unrelated checks still report", () => {
	const dir = gitFixture({
		files: {
			".pi/sdlc/sdlc.config.json": JSON.stringify(v1Config()),
			".pi/sdlc/workflow.md": "# workflow\n",
		},
	});
	try {
		const result = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(result.code, 3, result.stdout + result.stderr);
		const report = reportOf(result);
		assert.equal(report.schemaVersion, 2);
		assert.equal(report.state, "not-ready");
		assert.deepEqual(
			report.checks.map((candidate) => candidate.id),
			CANONICAL_IDS,
		);
		assert.deepEqual(check(report, "config.valid"), {
			id: "config.valid",
			status: "pass",
			message: "manifest parses; schemaVersion 1 is a recognised superseded schema (full validation deferred to migration)",
		});
		assert.deepEqual(check(report, "config.schema-current"), {
			id: "config.schema-current",
			status: "fail",
			message: "config schema is behind this skill (schemaVersion 1 < 2)",
			remediation: OLDER_REMEDY,
		});
		assert.deepEqual(check(report, "config.panels"), {
			id: "config.panels",
			status: "skip",
			message: "config schema is not current",
		});
		for (const id of ["git.repository", "adoption.manifest-head", "adoption.manifest-clean", "workflow.readable"]) assert.equal(check(report, id).status, "pass", id);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("CV18: schemaVersion 3 is an error with the canonical newer remedy", () => {
	const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify({ ...VALID_CONFIG, schemaVersion: 3 }) } });
	try {
		const result = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(result.code, 2, result.stdout + result.stderr);
		const report = reportOf(result);
		assert.equal(report.state, "error");
		assert.deepEqual(check(report, "config.valid"), { id: "config.valid", status: "error", message: NEWER_REMEDY });
		assert.equal(check(report, "config.schema-current").status, "skip");
		assert.equal(check(report, "workflow.readable").status, "pass", "independent checks still evaluate");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("CV19: a panels-less v2 config is valid but not-ready", () => {
	const { panels: _panels, ...withoutPanels } = VALID_CONFIG;
	const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify(withoutPanels) } });
	try {
		const result = runStatus(["--repo-root", dir, "--format", "json"]);
		assert.equal(result.code, 3, result.stdout + result.stderr);
		const report = reportOf(result);
		assert.equal(report.state, "not-ready");
		assert.equal(check(report, "config.valid").status, "pass");
		assert.equal(check(report, "config.schema-current").status, "pass");
		assert.deepEqual(check(report, "config.panels"), {
			id: "config.panels",
			status: "fail",
			message: "no panels roster in the manifest",
			remediation: "add a panels block to .pi/sdlc/sdlc.config.json (see schema/sdlc.config.example.json)",
		});
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("CV20: malformed JSON and invalid schemaVersion remain config errors", () => {
	const cases = {
		"invalid JSON": { text: "{nope", message: "manifest is not valid JSON" },
		"junk schemaVersion": { text: JSON.stringify({ ...VALID_CONFIG, schemaVersion: "2" }), message: 'manifest is invalid: schemaVersion must be 2 (got "2")' },
	};
	for (const [label, fixture] of Object.entries(cases)) {
		const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": fixture.text } });
		try {
			const result = runStatus(["--repo-root", dir, "--format", "json"]);
			assert.equal(result.code, 2, `${label}: ${result.stdout}${result.stderr}`);
			const report = reportOf(result);
			assert.equal(report.state, "error", label);
			assert.equal(check(report, "config.valid").status, "error", label);
			assert.equal(check(report, "config.valid").message, fixture.message, label);
			assert.equal(check(report, "config.schema-current").status, "skip", label);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("current v2 structural validation errors remain config.valid errors", () => {
	const bads = {
		"path escape": { ...VALID_CONFIG, paths: { plans: "../out" } },
		"malformed hook": { ...VALID_CONFIG, hooks: { deploy: { after: [{ run: "x" }] } } },
	};
	for (const [label, raw] of Object.entries(bads)) {
		const dir = gitFixture({ files: { ".pi/sdlc/sdlc.config.json": JSON.stringify(raw) } });
		try {
			const result = runStatus(["--repo-root", dir, "--format", "json"]);
			assert.equal(result.code, 2, `${label}: ${result.stdout}${result.stderr}`);
			assert.equal(check(reportOf(result), "config.valid").status, "error");
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("filesystem-only manifests are not committed adoption", () => {
	const variants = {
		absent: () => gitFixture({ files: { "README.md": "x" } }),
		untracked: () => {
			const dir = gitFixture({ files: { "README.md": "x" } });
			mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
			writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			return dir;
		},
		staged: () => {
			const dir = gitFixture({ files: { "README.md": "x" } });
			mkdirSync(join(dir, ".pi", "sdlc"), { recursive: true });
			writeFileSync(join(dir, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(VALID_CONFIG));
			return dir;
		},
	};
	for (const [label, make] of Object.entries(variants)) {
		const dir = make();
		try {
			const result = runStatus(["--repo-root", dir]);
			assert.equal(result.code, 1, label);
			assert.equal(textCheckStatus(result.stdout, "adoption.manifest-head"), "fail", label);
			for (const id of ["adoption.manifest-clean", "config.valid", "config.schema-current", "config.panels", "workflow.readable"]) assert.equal(textCheckStatus(result.stdout, id), "skip", `${label}: ${id}`);
		} finally {
			rmSync(dir, { recursive: true, force: true });
		}
	}
});

test("argument, root, and git errors retain exit 2", () => {
	for (const args of [["--bogus"], ["--config"], ["--repo-root"], ["--config", "/a", "--repo-root", "/b"], ["--format", "yaml"]]) {
		const result = runStatus(args, { cwd: tmpdir() });
		assert.equal(result.code, 2, `${args.join(" ")}: ${result.stdout}${result.stderr}`);
		assert.equal(textCheckStatus(result.stdout, "cli.arguments"), "error");
	}
	const dir = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-nongit-")));
	try {
		const result = runStatus(["--repo-root", dir]);
		assert.equal(result.code, 2, result.stdout + result.stderr);
		assert.equal(textCheckStatus(result.stdout, "git.repository"), "error");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("workflow readability remains an independent readiness check", () => {
	const dir = readyFixture({ ".pi/sdlc/workflow.md": "# workflow\n" });
	try {
		assert.equal(runStatus(["--repo-root", dir]).code, 0);
		const result = runStatus(["--repo-root", dir, "--format", "json"], {
			env: baseEnv({ SDLC_STATUS_UNREADABLE: join(dir, ".pi", "sdlc", "workflow.md") }),
		});
		assert.equal(result.code, 3, result.stdout + result.stderr);
		assert.equal(check(reportOf(result), "workflow.readable").status, "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("unrelated dirty files do not affect readiness", () => {
	const dir = readyFixture();
	try {
		writeFileSync(join(dir, "scratch.txt"), "dirty");
		assert.equal(runStatus(["--repo-root", dir]).code, 0);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("status completes with a PATH exposing only git", () => {
	const dir = readyFixture();
	const shim = realpathSync(mkdtempSync(join(tmpdir(), "sdlc-shim-")));
	try {
		const gitPath = execFileSync("sh", ["-c", "command -v git"], { encoding: "utf8" }).trim();
		execFileSync("ln", ["-s", gitPath, join(shim, "git")]);
		const result = runStatus(["--repo-root", dir], { env: { PATH: shim, HOME: process.env.HOME } });
		assert.equal(result.code, 0, result.stdout + result.stderr);
	} finally {
		rmSync(dir, { recursive: true, force: true });
		rmSync(shim, { recursive: true, force: true });
	}
});
