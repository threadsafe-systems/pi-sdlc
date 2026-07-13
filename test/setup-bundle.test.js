import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SETUP = join(ROOT, "skills", "sdlc", "scripts", "setup-sdlc.mjs");
function run(root, args) {
	return spawnSync(process.execPath, [SETUP, "--repo-root", root, ...args], { cwd: root, encoding: "utf8" });
}
function temp() {
	return mkdtempSync(join(tmpdir(), "sdlc-bundle-"));
}
function jsonRun(root, args) {
	const result = run(root, ["--format", "json", ...args]);
	return { ...result, report: JSON.parse(result.stdout) };
}

test("fresh bundle provisions requested assets and idempotent rerun retains them", () => {
	const root = temp();
	try {
		const first = jsonRun(root, ["--yes", "--with-models", "--with-ci-workflow", "--copy-prompts"]);
		assert.equal(first.status, 0, first.stderr);
		assert.equal(first.report.exitCode, 0);
		for (const path of [".pi/sdlc/sdlc.config.json", ".pi/sdlc/sdlc.models.json", ".github/pull_request_template.md", ".github/workflows/sdlc-lifecycle.yml", ".pi/sdlc/prompts/adversary-plan.prompt.md"]) assert.equal(existsSync(join(root, path)), true, path);
		const before = readFileSync(join(root, ".github/pull_request_template.md"), "utf8");
		const second = jsonRun(root, ["--yes", "--with-models", "--with-ci-workflow", "--copy-prompts"]);
		assert.equal(second.status, 0, second.stderr);
		assert.equal(second.report.assets.filter((asset) => asset.action === "retained").length >= 5, true);
		assert.equal(readFileSync(join(root, ".github/pull_request_template.md"), "utf8"), before);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("existing CI suppresses workflow creation and reports refusal", () => {
	const root = temp();
	try {
		writeFileSync(join(root, "ci.yml"), "name: existing\n");
		const workflows = join(root, ".github", "workflows");
		spawnSync("mkdir", ["-p", workflows]);
		writeFileSync(join(workflows, "ci.yml"), "name: existing\n");
		const result = jsonRun(root, ["--yes", "--with-ci-workflow"]);
		assert.equal(result.status, 1);
		assert.equal(existsSync(join(root, ".github/workflows/sdlc-lifecycle.yml")), false);
		assert.equal(result.report.assets.find((asset) => asset.id === "ci-workflow").action, "refused");
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("consumer template without the declaration is refused byte-identically", () => {
	const root = temp();
	try {
		const target = join(root, ".github", "pull_request_template.md");
		spawnSync("mkdir", ["-p", join(root, ".github")]);
		writeFileSync(target, "# Consumer template\n");
		const before = readFileSync(target, "utf8");
		const result = jsonRun(root, ["--yes"]);
		assert.equal(result.status, 1);
		assert.equal(result.report.assets.find((asset) => asset.id === "pr-template").action, "refused");
		assert.equal(readFileSync(target, "utf8"), before);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});

test("bundle reports resolved package references before writing", () => {
	const root = temp();
	try {
		const result = jsonRun(root, ["--yes", "--copy-prompts"]);
		assert.equal(result.status, 0);
		assert.equal(
			result.report.references.every((ref) => ref.status === "ok"),
			true,
		);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
});
