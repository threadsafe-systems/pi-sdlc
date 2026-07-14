import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const SKILL = join(ROOT, "skills", "sdlc");
const FIXTURE_HOME = join(ROOT, "test", "fixtures", "home");

function fixture() {
	const root = mkdtempSync(join(tmpdir(), "sdlc-paths-"));
	const consumer = join(root, "consumer");
	const installed = join(root, "installed", "pi-sdlc", "skills", "sdlc");
	mkdirSync(consumer, { recursive: true });
	mkdirSync(dirname(installed), { recursive: true });
	cpSync(SKILL, installed, { recursive: true });
	execFileSync("git", ["init", "-q", consumer]);
	return { root, consumer, installed };
}

function run(nodeScript, args, cwd, env = {}) {
	return spawnSync(process.execPath, [nodeScript, ...args], { cwd, env: { ...process.env, ...env }, encoding: "utf8" });
}

function config(paths) {
	return { schemaVersion: 1, prefix: "fixture", labelPrefix: "fixture", announce: "fixture", paths };
}

function writeConsumerConfig(consumer, paths) {
	mkdirSync(join(consumer, ".pi", "sdlc"), { recursive: true });
	writeFileSync(join(consumer, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(config(paths), null, 2));
	cpSync(join(ROOT, "test", "fixtures", "consumer", ".pi", "sdlc", "sdlc.models.json"), join(consumer, ".pi", "sdlc", "sdlc.models.json"));
}

function commitAll(consumer) {
	execFileSync("git", ["-C", consumer, "add", "."]);
	execFileSync("git", ["-C", consumer, "-c", "user.name=fixture", "-c", "user.email=fixture@example.test", "commit", "-qm", "fixture: adopt sdlc"]);
}

test("SP1: shipped generic commands use skill-relative forms", () => {
	const corpus = [
		readFileSync(join(ROOT, "skills", "sdlc", "SKILL.md"), "utf8"),
		readFileSync(join(ROOT, "README.md"), "utf8"),
		readFileSync(join(ROOT, "templates", "setup-sdlc.md"), "utf8"),
		...requireFiles(join(ROOT, "skills", "sdlc", "prompts")),
		...requireFiles(join(ROOT, "skills", "sdlc", "assets")),
		...requireFiles(join(ROOT, "skills", "sdlc", "scripts"), ".sh"),
		...requireFiles(join(ROOT, "test", "fixtures", "golden")),
	];
	for (const text of corpus) {
		assert.doesNotMatch(text, /<skill-dir>\/skills\/sdlc\//);
		assert.doesNotMatch(text, /skills\/sdlc\/scripts\//);
	}
	const workflow = readFileSync(join(ROOT, "skills", "sdlc", "assets", "sdlc-lifecycle.yml"), "utf8");
	assert.match(workflow, /node \.pi-sdlc\/skills\/sdlc\/scripts\/check-lifecycle\.mjs/);
	assert.doesNotMatch(workflow, /node skills\/sdlc\/scripts\/check-lifecycle\.mjs/);
	for (const name of ["normative-references.json", "normative-references.schema.json"]) assert.doesNotThrow(() => JSON.parse(readFileSync(join(ROOT, "skills", "sdlc", "assets", name), "utf8")));
});

function requireFiles(dir, suffix = ".md") {
	return readdirNames(dir, suffix).map((name) => readFileSync(join(dir, name), "utf8"));
}
function readdirNames(dir, suffix = ".md") {
	return readdirSync(dir).filter((name) => name.endsWith(suffix));
}

test("SP2: installed skill commands run from consumer cwd", () => {
	const f = fixture();
	try {
		const paths = { plans: "project/plans", specs: "project/specs", reviews: "project/reviews", agents: ".pi/generated-agents" };
		writeConsumerConfig(f.consumer, paths);
		mkdirSync(join(f.consumer, "project", "plans"), { recursive: true });
		mkdirSync(join(f.consumer, "project", "specs"), { recursive: true });
		mkdirSync(join(f.consumer, "project", "reviews"), { recursive: true });
		writeFileSync(join(f.consumer, "project", "plans", "2026-07-14-sdlc-fixture.md"), "# plan\n");
		writeFileSync(join(f.consumer, "project", "plans", "2026-07-14-sdlc-fixture-build.md"), "# build\n");
		writeFileSync(join(f.consumer, "project", "specs", "2026-07-14-sdlc-fixture.md"), "# spec\n");
		commitAll(f.consumer);
		const status = run(join(f.installed, "scripts", "sdlc-status.mjs"), ["--repo-root", f.consumer, "--format", "json"], f.consumer);
		assert.equal(status.status, 0, status.stderr);
		assert.equal(JSON.parse(status.stdout).state, "ready");
		const setup = run(join(f.installed, "scripts", "setup-sdlc.mjs"), ["--repo-root", f.consumer, "--yes", "--with-models"], f.consumer, { HOME: join(f.root, "home") });
		assert.equal(setup.status, 0, "bundle setup succeeds from consumer cwd while retaining the existing config");
		const agent = run(join(f.installed, "scripts", "ensure-panel-agent.mjs"), ["pr_review", "--repo-root", f.consumer, "--force"], f.consumer);
		assert.equal(agent.status, 0, agent.stderr);
		assert.ok(existsSync(join(f.consumer, ".pi", "generated-agents", "fixture-pr-review.md")));
		const home = join(f.root, "home");
		cpSync(FIXTURE_HOME, home, { recursive: true });
		const panel = run(join(f.installed, "scripts", "resolve-panel.mjs"), ["pr_review", "--author", "anthropic", "--repo-root", f.consumer, "--emit-tasks", "fixture-pr-review"], f.consumer, { HOME: home });
		assert.equal(panel.status, 0, panel.stderr);
		assert.ok(JSON.parse(panel.stdout).tasks.length >= 1);
		const body = join(f.consumer, "pr-body.md");
		writeFileSync(body, "```sdlc\ntrack: irreversible\nslug: sdlc-fixture\n```\n");
		const lifecycle = run(join(f.installed, "scripts", "check-lifecycle.mjs"), ["--body", body, "--repo-root", f.consumer, "--format", "json"], f.consumer);
		assert.equal(lifecycle.status, 0, lifecycle.stderr);
		const checkFile = join(f.consumer, "check.js");
		writeFileSync(checkFile, "const ok = true;\n");
		writeFileSync(join(f.consumer, "plan.md"), "# plan\n");
		writeFileSync(
			join(f.consumer, "manifest.json"),
			JSON.stringify({
				schemaVersion: 1,
				taskId: "fixture",
				buildPlan: "plan.md",
				repoRoot: ".",
				ownedScenarios: ["S1"],
				checks: [{ id: "static.syntax", argv: ["node", "--check", "check.js"], evidence: ["S1"] }],
				categories: {
					tests: { applicability: "n/a", reason: "no test applies" },
					static: { applicability: "required", checkIds: ["static.syntax"] },
					scenarios: { applicability: "required", evidence: { S1: ["static.syntax"] } },
					standards: { applicability: "n/a", reason: "fixture standards do not apply" },
					bannedPatterns: { applicability: "n/a", reason: "fixture banned patterns do not apply" },
				},
			}),
		);
		const validation = run(join(f.installed, "scripts", "validate-task.mjs"), ["--manifest", "manifest.json", "--repo-root", f.consumer, "--format", "json", "--report", "project/reviews/validation.json"], f.consumer);
		assert.equal(validation.status, 0, `${validation.stderr}\n${validation.stdout}`);
	} finally {
		rmSync(f.root, { recursive: true, force: true });
	}
});
