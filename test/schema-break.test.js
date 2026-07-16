import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCRIPT = join(ROOT, "skills", "sdlc", "scripts", "check-schema-break.mjs");

function git(root, ...args) {
	return execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
}

function fixture({ path = "skills/sdlc/schema/sdlc.config.schema.json", innerTitle = "feat: change" } = {}) {
	const root = mkdtempSync(join(tmpdir(), "schema-break-"));
	git(root, "init", "-q");
	mkdirSync(join(root, "skills/sdlc/schema"), { recursive: true });
	mkdirSync(join(root, "skills/sdlc/scripts"), { recursive: true });
	writeFileSync(join(root, "skills/sdlc/schema/sdlc.config.schema.json"), "{}\n");
	writeFileSync(join(root, "skills/sdlc/schema/sdlc.models.schema.json"), "{}\n");
	writeFileSync(join(root, "skills/sdlc/scripts/lib.mjs"), "export const CONFIG_SCHEMA_VERSION = 1;\nexport const OTHER = 1;\n");
	writeFileSync(join(root, "README.md"), "base\n");
	git(root, "add", ".");
	git(root, "-c", "user.name=fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", "chore: base");
	const base = git(root, "rev-parse", "HEAD");
	const target = join(root, path);
	mkdirSync(join(target, ".."), { recursive: true });
	if (path.endsWith("lib.mjs")) writeFileSync(target, "export const CONFIG_SCHEMA_VERSION = 2;\nexport const OTHER = 1;\n");
	else writeFileSync(target, "changed\n");
	git(root, "add", ".");
	git(root, "-c", "user.name=fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", innerTitle);
	return { root, base, head: git(root, "rev-parse", "HEAD") };
}

function run(fx, title, body = "") {
	const event = join(fx.root, "event.json");
	writeFileSync(event, JSON.stringify({ pull_request: { title, body, base: { sha: fx.base }, head: { sha: fx.head } } }));
	return spawnSync(process.execPath, [SCRIPT, "--event", event, "--repo-root", fx.root], { encoding: "utf8" });
}

function scenario(options, title, body, expected) {
	const fx = fixture(options);
	try {
		const result = run(fx, title, body);
		assert.equal(result.status, expected, result.stderr);
		return result;
	} finally {
		rmSync(fx.root, { recursive: true, force: true });
	}
}

test("CV28: watched config schema changes require the PR release signal", () => {
	const failure = scenario({}, "feat: x", "", 1);
	assert.match(failure.stderr, /sdlc\.config\.schema\.json/);
	assert.match(failure.stderr, /release-visible breaking-change signal/);
	scenario({}, "feat!: x", "", 0);
	scenario({}, "feat(config)!: x", "", 0);
	scenario({}, "feat: x", "context\n\nBREAKING CHANGE: schema v2", 0);
	scenario({}, "feat: x", "BREAKING-CHANGE: schema v2", 0);
});

test("CV28: inner breaking commits are ignored in favour of the squash title", () => {
	scenario({ innerTitle: "feat!: inner break" }, "feat: plain squash title", "", 1);
});

test("CV28: only the named schemas and CONFIG_SCHEMA_VERSION line are watched", () => {
	scenario({ path: "README.md" }, "feat: docs", "", 0);
	scenario({ path: "skills/sdlc/scripts/lib.mjs" }, "feat: constant", "", 1);
	scenario({ path: "skills/sdlc/schema/task-validation-manifest.schema.json" }, "feat: unrelated schema", "", 0);
});
