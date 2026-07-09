// Offline test harness for the sdlc skill extraction (spec scenarios S2-S7).
// No live/paid model calls (NFR1): resolve-panel runs under an isolated HOME with
// a stub auth.json so hasCreds() is deterministic; no --pong.

import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { agentDescription, agentName, PHASES } from "../skills/sdlc/scripts/lib.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skill = join(repo, "skills", "sdlc");
const scripts = join(skill, "scripts");
const fx = join(here, "fixtures");
const consumer = join(fx, "consumer");
const fxHome = join(fx, "home");

// Run a script as a child; return { code, stdout, stderr }.
function run(scriptMjs, args, { env } = {}) {
	try {
		const stdout = execFileSync("node", [join(scripts, scriptMjs), ...args], {
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
			env: env ?? process.env,
		});
		return { code: 0, stdout, stderr: "" };
	} catch (e) {
		return { code: e.status ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
	}
}
// Isolated env for resolve-panel: stub HOME auth, no ambient cred vars, no pong.
function isolatedEnv() {
	return { PATH: process.env.PATH, HOME: fxHome };
}
function frontmatter(md) {
	const m = md.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
	assert.ok(m, "agent file must have frontmatter + body");
	const fm = Object.fromEntries(
		m[1].split("\n").map((l) => {
			const i = l.indexOf(":");
			return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
		}),
	);
	return { name: fm.name, tools: fm.tools, description: fm.description, body: m[2] };
}
function mkConsumer() {
	const dir = mkdtempSync(join(tmpdir(), "sdlc-cons-"));
	cpSync(join(consumer, ".pi"), join(dir, ".pi"), { recursive: true });
	return dir;
}

test("S2: no loom-domain content in the generic surface", () => {
	const alt = /loom|rundriver|northstar|handover|conveyanc|clc|build board|threadsafe-systems|adapter boundary|sdlc-artifacts/i;
	const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => {
		const p = join(d, e.name);
		if (e.isDirectory()) return e.name === "schema" ? [] : walk(p);
		return /\.(md|mjs|sh)$/.test(e.name) ? [p] : [];
	});
	for (const f of walk(skill)) {
		const hit = readFileSync(f, "utf8").split("\n").findIndex((l) => alt.test(l));
		assert.equal(hit, -1, `${f}:${hit + 1} leaks a loom-domain literal`);
	}
});

test("S3: JSON schemas validate their examples", () => {
	const ajv = new Ajv({ allErrors: true, strict: false });
	for (const name of ["sdlc.config", "sdlc.models"]) {
		const schema = JSON.parse(readFileSync(join(skill, "schema", `${name}.schema.json`), "utf8"));
		const example = JSON.parse(readFileSync(join(skill, "schema", `${name}.example.json`), "utf8"));
		const validate = ajv.compile(schema);
		assert.ok(validate(example), `${name} example invalid: ${JSON.stringify(validate.errors)}`);
	}
});

test("S3b: ensure-panel-agent rejects malformed config (exit 2)", () => {
	const mutations = [
		'{"schemaVersion":2,"prefix":"loom","labelPrefix":"loom-sdlc","announce":"a"}',
		'{"schemaVersion":1,"prefix":"Loom","labelPrefix":"loom-sdlc","announce":"a"}',
		'{"schemaVersion":1,"prefix":"loom","labelPrefix":"loom-sdlc"}',
		'{"schemaVersion":1,"prefix":"loom","labelPrefix":"loom-sdlc","announce":"a","extra":1}',
		'{"schemaVersion":1,"prefix":"loom","labelPrefix":"loom-sdlc","announce":"a","tracker":{"repo":"bad","board":{"number":1,"url":"u"}}}',
	];
	for (const bad of mutations) {
		const dir = mkdtempSync(join(tmpdir(), "sdlc-badc-"));
		writeFileSync(join(dir, "cfg.json"), "");
		cpSync(join(consumer, ".pi", "sdlc", "sdlc.models.json"), join(dir, "models.json"));
		const cdir = mkdtempSync(join(tmpdir(), "sdlc-badcc-"));
		const pj = join(cdir, ".pi", "sdlc");
		execFileSync("mkdir", ["-p", pj]);
		writeFileSync(join(pj, "sdlc.config.json"), bad);
		cpSync(join(consumer, ".pi", "sdlc", "sdlc.models.json"), join(pj, "sdlc.models.json"));
		const r = run("ensure-panel-agent.mjs", ["pr_review", "--config", cdir]);
		assert.equal(r.code, 2, `mutation should exit 2: ${bad}`);
		rmSync(dir, { recursive: true, force: true });
		rmSync(cdir, { recursive: true, force: true });
	}
});

test("S3c: resolve-panel rejects malformed models (exit 2)", () => {
	const mutations = [
		'{"phases":{"plan_review":{"min_panel":0,"prefer":["a/b"]},"spec_review":{"min_panel":1,"prefer":["a/b"]},"pr_review":{"min_panel":1,"prefer":["a/b"]},"task_validate":{"min_panel":1,"prefer":["a/b"]}}}',
		'{"phases":{"plan_review":{"min_panel":1,"prefer":[]},"spec_review":{"min_panel":1,"prefer":["a/b"]},"pr_review":{"min_panel":1,"prefer":["a/b"]},"task_validate":{"min_panel":1,"prefer":["a/b"]}}}',
		'{"phases":{"plan_review":{"min_panel":1,"prefer":["a/b"]}}}',
		'{"phases":{"plan_review":{"min_panel":1,"prefer":["nobar"]},"spec_review":{"min_panel":1,"prefer":["a/b"]},"pr_review":{"min_panel":1,"prefer":["a/b"]},"task_validate":{"min_panel":1,"prefer":["a/b"]}}}',
	];
	for (const bad of mutations) {
		const cdir = mkdtempSync(join(tmpdir(), "sdlc-badm-"));
		const pj = join(cdir, ".pi", "sdlc");
		execFileSync("mkdir", ["-p", pj]);
		cpSync(join(consumer, ".pi", "sdlc", "sdlc.config.json"), join(pj, "sdlc.config.json"));
		writeFileSync(join(pj, "sdlc.models.json"), bad);
		const r = run("resolve-panel.mjs", ["plan_review", "--config", cdir], { env: isolatedEnv() });
		assert.equal(r.code, 2, `mutation should exit 2: ${bad}`);
		rmSync(cdir, { recursive: true, force: true });
	}
});

test("S4: stamped name+tools+body byte-identical to golden; description == FS4", () => {
	for (const phase of PHASES) {
		const dir = mkdtempSync(join(tmpdir(), "sdlc-s4-"));
		run("ensure-panel-agent.mjs", [phase, "--config", consumer, "--dir", dir, "--force"]);
		const got = frontmatter(readFileSync(join(dir, `${agentName("loom", phase)}.md`), "utf8"));
		const golden = frontmatter(readFileSync(join(fx, "golden", `${phase}.agent.md`), "utf8"));
		assert.equal(got.name, golden.name, `${phase} name`);
		assert.equal(got.tools, golden.tools, `${phase} tools`);
		assert.equal(got.body, golden.body, `${phase} body`);
		assert.equal(got.description, agentDescription("loom-sdlc", phase), `${phase} description == FS4`);
		rmSync(dir, { recursive: true, force: true });
	}
});

test("S5: agent lands in the CONSUMER's .pi/agents (not the skill dir)", () => {
	const cdir = mkConsumer();
	const r = run("ensure-panel-agent.mjs", ["pr_review", "--config", cdir, "--force"]);
	assert.equal(r.code, 0, r.stderr);
	assert.ok(existsSync(join(cdir, ".pi", "agents", "loom-pr-review.md")), "must land in consumer .pi/agents");
	assert.ok(!existsSync(join(scripts, "loom-pr-review.md")), "must not land in the skill dir");
	rmSync(cdir, { recursive: true, force: true });
});

test("S6: resolve-panel --emit-tasks deep-equals golden under isolated env", () => {
	for (const phase of PHASES) {
		const an = agentName("loom", phase);
		const r = run("resolve-panel.mjs", [phase, "--author", "anthropic", "--config", consumer, "--emit-tasks", an], { env: isolatedEnv() });
		const golden = readFileSync(join(fx, "golden", `${phase}.resolve.json`), "utf8");
		assert.deepEqual(JSON.parse(r.stdout), JSON.parse(golden), `${phase} resolve mismatch`);
	}
});

test("S7: resolution terminal cases", () => {
	// outside any repo, no flag/env -> exit 2 with diagnostic
	const empty = mkdtempSync(join(tmpdir(), "sdlc-noroot-"));
	const r = run("ensure-panel-agent.mjs", ["pr_review"], { env: { PATH: process.env.PATH, HOME: empty, GIT_CEILING_DIRECTORIES: dirname(empty) } });
	// spawn with cwd outside a git repo
	let outside;
	try {
		outside = execFileSync("node", [join(scripts, "ensure-panel-agent.mjs"), "pr_review"], {
			cwd: empty, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"],
			env: { PATH: process.env.PATH, HOME: empty, GIT_CEILING_DIRECTORIES: empty },
		});
		outside = { code: 0 };
	} catch (e) {
		outside = { code: e.status, stderr: e.stderr };
	}
	assert.equal(outside.code, 2, "outside a repo with no flag/env must exit 2");
	// missing models file -> resolve-panel errors clearly
	const cdir = mkdtempSync(join(tmpdir(), "sdlc-nomodels-"));
	execFileSync("mkdir", ["-p", join(cdir, ".pi", "sdlc")]);
	cpSync(join(consumer, ".pi", "sdlc", "sdlc.config.json"), join(cdir, ".pi", "sdlc", "sdlc.config.json"));
	const rm = run("resolve-panel.mjs", ["pr_review", "--config", cdir], { env: isolatedEnv() });
	assert.equal(rm.code, 2, "missing models file must exit non-zero");
	assert.match(rm.stderr, /requires .*sdlc\.models\.json/, "clear missing-models message");
	rmSync(empty, { recursive: true, force: true });
	rmSync(cdir, { recursive: true, force: true });
});
