import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SCRIPT = join(ROOT, "skills", "sdlc", "scripts", "check-lifecycle.mjs");

function git(cwd, ...args) {
	execFileSync("git", ["-C", cwd, ...args], { stdio: "ignore" });
}

function fixture({ plan = true, spec = true, build = true, paths = undefined, slug = "feature" } = {}) {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-lifecycle-git-"));
	git(dir, "init", "-q");
	git(dir, "config", "user.email", "test@example.com");
	git(dir, "config", "user.name", "Lifecycle Test");
	const config = {
		schemaVersion: 4,
		prefix: "sdlc",
		labelPrefix: "sdlc",
		announce: "test",
		review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "proceed" },
		shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
		...(paths ? { paths } : {}),
	};
	writeFileSync(join(dir, ".gitignore"), "");
	writeFileSync(join(dir, "config.json"), JSON.stringify(config));
	mkdir(dir, ".pi/sdlc");
	writeFileSync(join(dir, ".pi/sdlc/sdlc.config.json"), `${JSON.stringify(config)}\n`);
	const planDir = paths?.plans ?? "docs/plans";
	const specDir = paths?.specs ?? "docs/specs";
	if (plan) writeFile(dir, join(planDir, `2026-07-13-${slug}.md`), "# plan\n");
	if (spec) writeFile(dir, join(specDir, `2026-07-13-${slug}.md`), "# spec\n");
	if (build) writeFile(dir, join(planDir, `2026-07-13-${slug}-build.md`), "# build\n");
	git(dir, "add", ".");
	git(dir, "commit", "-qm", "fixture");
	return dir;
}

function mkdir(root, path) {
	execFileSync("mkdir", ["-p", join(root, path)]);
}

function writeFile(root, path, content) {
	mkdir(root, path.split("/").slice(0, -1).join("/"));
	writeFileSync(join(root, path), content);
}

function run(root, ...args) {
	return spawnSync(process.execPath, [SCRIPT, "--repo-root", root, "--format", "json", "--track", "irreversible", "--slug", "feature", ...args], { cwd: root, encoding: "utf8" });
}

function report(result) {
	assert.equal(result.stderr, "");
	try {
		return JSON.parse(result.stdout);
	} catch (error) {
		throw new Error(`invalid JSON lifecycle report: ${error.message}\nstdout: ${result.stdout}`);
	}
}

test("irreversible artifacts pass only when all committed documents exist", () => {
	const dir = fixture();
	try {
		const result = run(dir);
		assert.equal(result.status, 0);
		assert.equal(report(result).state, "pass");
		for (const id of ["artifact.plan", "artifact.spec", "artifact.build"]) assert.equal(report(result).checks.find((check) => check.id === id).status, "pass");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("missing artifact and missing artifact directory are contract failures", () => {
	const dir = fixture({ spec: false });
	try {
		const result = run(dir);
		const output = report(result);
		assert.equal(result.status, 1);
		assert.equal(output.checks.find((check) => check.id === "artifact.spec").status, "fail");
		const empty = fixture({ plan: false, spec: false, build: false });
		try {
			const emptyOutput = report(run(empty));
			assert.equal(emptyOutput.exitCode, 1);
			assert.equal(emptyOutput.checks.find((check) => check.id === "artifact.plan").status, "fail");
		} finally {
			rmSync(empty, { recursive: true, force: true });
		}
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("reversible never requires a specification", () => {
	const dir = fixture({ spec: false });
	try {
		const result = spawnSync(process.execPath, [SCRIPT, "--repo-root", dir, "--format", "json", "--track", "reversible", "--slug", "feature"], { cwd: dir, encoding: "utf8" });
		const output = report(result);
		assert.equal(result.status, 0);
		assert.equal(output.checks.find((check) => check.id === "artifact.spec").message, "specification not required on the reversible track");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("configured paths are authoritative and multiple dated matches pass", () => {
	const dir = fixture({ paths: { plans: "project/plans", specs: "project/specs" } });
	try {
		writeFile(dir, "project/plans/2026-07-14-feature.md", "# newer\n");
		git(dir, "add", ".");
		git(dir, "commit", "-qm", "second plan");
		const result = run(dir);
		const output = report(result);
		assert.equal(result.status, 0);
		assert.match(output.checks.find((check) => check.id === "artifact.plan").message, /2026-07-13-feature\.md/);
		assert.match(output.checks.find((check) => check.id === "artifact.plan").message, /2026-07-14-feature\.md/);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("working-tree-only artifacts do not count", () => {
	const dir = fixture({ plan: false });
	try {
		writeFile(dir, "docs/plans/2026-07-13-feature.md", "# uncommitted\n");
		const output = report(run(dir));
		assert.equal(output.exitCode, 1);
		assert.equal(output.checks.find((check) => check.id === "artifact.plan").status, "fail");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});

test("configured path escape is an operational config error", () => {
	const dir = fixture({ paths: { plans: "..\\outside", specs: "docs/specs" } });
	try {
		const output = report(run(dir));
		assert.equal(output.exitCode, 2);
		assert.equal(output.checks.find((check) => check.id === "config.valid").status, "error");
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
});
