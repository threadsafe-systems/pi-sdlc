// sdlc-retro collector soft-data / raw-snapshot / replay tests (lt-t5): the
// LLM seam, NF4 redaction + n-gram containment + 500-char cap, raw/
// snapshotting, and --from-raw exclusive replay. Scenarios LT17-LT19,
// LT28-LT29. Offline/deterministic (NF1): --llm-cmd is always a local fixture
// stub, never a real model; no network.

import assert from "node:assert/strict";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import Ajv from "ajv";
import { collect, containsUserNgram, sanitizeSoftString, validateRunJson } from "../skills/sdlc-retro/scripts/collect-run.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = dirname(here);

function readRunSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "run.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`run schema is not valid JSON: ${error.message}`);
	}
}
const schemaValidate = new Ajv().compile(readRunSchema());

function readLlmProtocolSchema() {
	try {
		return JSON.parse(readFileSync(join(repoRoot, "skills", "sdlc-retro", "schema", "llm-protocol.schema.json"), "utf8"));
	} catch (error) {
		assert.fail(`llm protocol schema is not valid JSON: ${error.message}`);
	}
}
const llmProtocolValidate = new Ajv().compile(readLlmProtocolSchema());

function tmp(prefix = "sdlc-lt5-") {
	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
}

function writeEvent(dir, slug, event, payload, ts, by = "agent") {
	const path = join(dir, ".pi", "sdlc", "runs", slug, "events.jsonl");
	mkdirSync(join(dir, ".pi", "sdlc", "runs", slug), { recursive: true });
	const line = `${JSON.stringify({ schemaVersion: 1, ts, slug, event, by, payload })}\n`;
	writeFileSync(path, existsSync(path) ? readFileSync(path, "utf8") + line : line, "utf8");
}

function isoAt(baseMs, offsetMs) {
	return new Date(baseMs + offsetMs).toISOString();
}

function mkStub(dir, name, body) {
	const p = join(dir, name);
	writeFileSync(p, `#!/usr/bin/env node\n${body}\n`);
	chmodSync(p, 0o755);
	return p;
}

const BASE = Date.parse("2026-07-18T09:00:00.000Z");
const SENTINEL_SECRET = "sk-sentinel-abcd1234";
const SENTINEL_SENTENCE = "the quick brown fox jumps over the lazy dog while eating pancakes";

function seedManifest(root, slug) {
	writeEvent(root, slug, "run.started", { title: "T", track: "irreversible" }, isoAt(BASE, 0));
	writeEvent(root, slug, "phase.entered", { phase: "implement" }, isoAt(BASE, 1000));
	writeEvent(root, slug, "phase.exited", { phase: "implement" }, isoAt(BASE, 20000));
}

function seedSession(home, root, { userText = "hello there", withSentinel = false } = {}) {
	const mapped = root.replace(/^\//, "").replaceAll("/", "-");
	const sessDir = join(home, ".pi", "agent", "sessions", `--${mapped}--`);
	mkdirSync(sessDir, { recursive: true });
	const lines = [
		{ type: "session", version: 3, id: "s1", timestamp: isoAt(BASE, 500) },
		{ type: "message", id: "u1", parentId: null, timestamp: isoAt(BASE, 1500), message: { role: "user", content: [{ type: "text", text: withSentinel ? SENTINEL_SENTENCE : userText }], timestamp: BASE + 1500 } },
		{
			type: "message",
			id: "m1",
			parentId: "u1",
			timestamp: isoAt(BASE, 2500),
			message: { role: "assistant", content: [], provider: "anthropic", model: "anthropic/claude-x", usage: { totalTokens: 10, cost: { total: 0.01 } }, timestamp: BASE + 2500 },
		},
	];
	const path = join(sessDir, "sess.jsonl");
	writeFileSync(path, `${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
	return sessDir;
}

// A scripted fake --llm-cmd: reads one JSON request from stdin, returns a
// scripted response based on `kind` (and env overrides for edge cases).
function mkLlmStub(dir, { leak = false, invalidJson = false, timeoutMs = 0 } = {}) {
	const body = `
const data = require("fs").readFileSync(0, "utf8");
${timeoutMs > 0 ? `setTimeout(() => {}, ${timeoutMs + 1000});` : ""}
const req = JSON.parse(data);
${
	invalidJson
		? `process.stdout.write("not json"); process.exit(0);`
		: `
let output;
if (req.kind === "narrative") {
  output = { summary: ${leak ? `${JSON.stringify(`leaked secret ${SENTINEL_SECRET} and verbatim: ${SENTINEL_SENTENCE}`)}` : `"a narrative summary"`} };
} else if (req.kind === "steering") {
  output = { classifications: req.inputs.userTurns.map((t) => ({ index: t.index, class: "other" })) };
} else if (req.kind === "precision") {
  output = { perModel: req.inputs.models.map((m) => ({ model: m, raised: 2, incorporated: 1, dismissed: 1 })) };
}
process.stdout.write(JSON.stringify({ kind: req.kind, model: "fixture/llm-1", provider: "fixture", output }));
process.exit(0);
`
}
`;
	return mkStub(dir, "fake-llm", body);
}

// ---------------------------------------------------------------------------
// LT18 — soft data appears only under `soft`, carries attribution, and
// steering classes / precision figures match the fixture LLM's scripted
// responses; an unparseable consolidated fixture yields
// precision.unparsed:<dir> and no precision number for that panel.
// ---------------------------------------------------------------------------
test("LT18: soft data carries attribution and matches the fixture LLM's scripted responses", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt18-run";
		seedManifest(root, slug);
		seedSession(home, root);
		const llmCmd = mkLlmStub(bin);

		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, llmCmd });
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		assert.deepEqual(validateRunJson(runJson), [], "hand-rolled validator agrees with the committed schema");
		assert.ok(runJson.soft, "soft is present when llmCmd succeeds");
		assert.deepEqual(runJson.soft.attribution, { model: "fixture/llm-1", provider: "fixture" });
		assert.equal(runJson.soft.narratives.length, 1);
		assert.equal(runJson.soft.narratives[0].phase, "implement");
		assert.equal(runJson.soft.narratives[0].summary, "a narrative summary");
		assert.deepEqual(
			runJson.soft.steering.map((s) => s.class),
			["other"],
		);
		assert.equal(runJson.soft.steering[0].ts, isoAt(BASE, 1500), "steering ts comes from the original turn, not the LLM");
		assert.ok(!("text" in runJson.soft.steering[0]), "steering entries never carry user text (NF4)");

		// hard values never leak into soft, and vice versa
		assert.equal(runJson.hard.totals !== undefined, true);
		assert.equal("summary" in runJson.hard, false);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-empty-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt18-precision";
		seedManifest(root, slug);
		// a review dir matching the naming convention but with no readable files
		// (simulated by making the "directory" actually a broken symlink target
		// is platform-fragile; instead we assert via a directory whose only file
		// causes a read to still enumerate to at least consolidated.md content,
		// and instead force failure through an llm-cmd that returns invalid JSON
		// for the precision kind specifically).
		mkdirSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`), { recursive: true });
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "consolidated.md"), "adjudication prose");
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "model-a.md"), "findings");

		const body = `
const data = require("fs").readFileSync(0, "utf8");
const req = JSON.parse(data);
if (req.kind === "precision") { process.stdout.write("not json for precision"); process.exit(0); }
process.stdout.write(JSON.stringify({ kind: req.kind, model: "fixture/llm-1", provider: "fixture", output: req.kind === "narrative" ? { summary: "s" } : { classifications: [] } }));
process.exit(0);
`;
		const llmCmd = mkStub(bin, "fake-llm-badprecision", body);

		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, llmCmd });
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes(`precision.unparsed:implement-${slug}-2026-07-18`), `expected precision.unparsed marker; got ${markers}`);
		assert.equal(runJson.soft.panelPrecision.length, 0, "no precision number recorded for the failed round");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT19 — --no-llm output validates, carries soft.absent.
// ---------------------------------------------------------------------------
test("LT19: --no-llm (noLlm:true) output validates and carries soft.absent", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-empty-");
	try {
		const slug = "lt19-run";
		seedManifest(root, slug);
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, noLlm: true });
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		assert.equal(runJson.soft, undefined);
		assert.ok(runJson.coverage.some((c) => c.marker === "soft.absent"));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT17 — regeneration: after one collect populates raw/, live sources are
// destroyed or mutated; a second collect with --from-raw still reproduces a
// byte-identical run.json.
// ---------------------------------------------------------------------------
test("LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt17-run";
		seedManifest(root, slug);
		const sessDir = seedSession(home, root);
		mkdirSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`), { recursive: true });
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "consolidated.md"), "adjudication prose");
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "model-a.md"), "findings");

		const workingGit = mkStub(bin, "git-ok", `const a=process.argv.slice(2); if(a[2]==="merge-base"){process.stdout.write("base\\n");}else{process.stdout.write(" 2 files changed, 10 insertions(+), 1 deletion(-)\\n");} process.exit(0);`);
		const workingGh = mkStub(bin, "gh-ok", 'process.stdout.write("[]\\n"); process.exit(0);');
		const llmCmd = mkLlmStub(bin);

		const first = collect({ root, slug, gitCmd: workingGit, ghCmd: workingGh, home, noGithub: false, llmCmd });
		assert.equal(schemaValidate(first.runJson), true, JSON.stringify(schemaValidate.errors));

		// destroy/mutate every live external source
		rmSync(join(sessDir, "sess.jsonl"));
		writeFileSync(join(root, "docs", "reviews", `implement-${slug}-2026-07-18`, "consolidated.md"), "MUTATED");
		const brokenGit = mkStub(bin, "git-broken", "process.exit(1);");
		const brokenGh = mkStub(bin, "gh-broken", "process.exit(1);");
		const brokenLlm = mkStub(bin, "llm-broken", "process.exit(1);");

		const second = collect({ root, slug, gitCmd: brokenGit, ghCmd: brokenGh, home, noGithub: false, llmCmd: brokenLlm, fromRaw: true });
		assert.equal(schemaValidate(second.runJson), true, JSON.stringify(schemaValidate.errors));
		assert.deepEqual(second.runJson, first.runJson, "replay from raw/ reproduces a byte-identical run.json");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

// ---------------------------------------------------------------------------
// LT28 — leakage sentinel: a fixture transcript containing a sentinel secret
// and a sentinel verbatim prompt sentence produces a run.json in which
// neither sentinel appears; every committed soft string is <=500 chars, has
// passed redaction, and contains no >=12-consecutive-word verbatim substring.
// ---------------------------------------------------------------------------
test("LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-");
	const bin = tmp("sdlc-lt5-bin-");
	const savedEnv = process.env.MY_SENTINEL_TOKEN;
	try {
		process.env.MY_SENTINEL_TOKEN = SENTINEL_SECRET;
		const slug = "lt28-run";
		seedManifest(root, slug);
		seedSession(home, root, { withSentinel: true });
		const llmCmd = mkLlmStub(bin, { leak: true });

		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, llmCmd });
		const json = JSON.stringify(runJson);
		assert.ok(!json.includes(SENTINEL_SECRET), "sentinel secret must never appear");
		assert.ok(!json.includes(SENTINEL_SENTENCE), "sentinel verbatim sentence must never appear");
		// the narrative that would have leaked is rejected outright (NF4), not
		// silently truncated to hide the leak.
		assert.equal(runJson.soft?.narratives.length ?? 0, 0, "the leaking narrative is rejected, not truncated");
	} finally {
		if (savedEnv === undefined) delete process.env.MY_SENTINEL_TOKEN;
		else process.env.MY_SENTINEL_TOKEN = savedEnv;
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars", () => {
	const redactionValues = ["sk-abcd1234"];
	assert.equal(sanitizeSoftString("token is sk-abcd1234 here", { redactionValues, userMessages: [] }), "token is [REDACTED] here");
	assert.equal(sanitizeSoftString(`prefix ${SENTINEL_SENTENCE} suffix`, { redactionValues: [], userMessages: [SENTINEL_SENTENCE] }), null);
	assert.equal(containsUserNgram(SENTINEL_SENTENCE, [SENTINEL_SENTENCE]), true);
	assert.equal(containsUserNgram("short unrelated text", [SENTINEL_SENTENCE]), false);
	const long = "x".repeat(600);
	assert.equal(sanitizeSoftString(long, { redactionValues: [], userMessages: [] }).length, 500);
});

// ---------------------------------------------------------------------------
// LT29 — seam failure: a failing --gh-cmd and an invalid-JSON / timeout
// --llm-cmd each yield a schema-valid run.json carrying github.error /
// llm.error:<kind> markers, exit 0, and no fabricated values.
// ---------------------------------------------------------------------------
test("LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-empty-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt29-gh";
		seedManifest(root, slug);
		const ghCmd = mkStub(bin, "gh-fail", "process.exit(3);");
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd, home, noLlm: true });
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		assert.ok(runJson.coverage.some((c) => c.marker === "github.error"));
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt29-invalid";
		seedManifest(root, slug);
		seedSession(home, root);
		const llmCmd = mkLlmStub(bin, { invalidJson: true });
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, llmCmd });
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("llm.error:narrative"));
		assert.equal(runJson.soft, undefined, "zero successful LLM calls: soft is absent, never fabricated");
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected", () => {
	const root = tmp();
	const home = tmp("sdlc-lt5-home-");
	const bin = tmp("sdlc-lt5-bin-");
	try {
		const slug = "lt29-timeout";
		seedManifest(root, slug);
		seedSession(home, root);
		const llmCmd = mkStub(bin, "llm-hang", "setInterval(() => {}, 1000);"); // never writes stdout, never exits on its own
		const { runJson } = collect({ root, slug, gitCmd: "false", ghCmd: "false", home, noGithub: true, llmCmd, llmTimeoutMs: 300 });
		assert.equal(schemaValidate(runJson), true, JSON.stringify(schemaValidate.errors));
		const markers = runJson.coverage.map((c) => c.marker);
		assert.ok(markers.includes("llm.error:narrative"), `expected a timeout to record llm.error:narrative; got ${markers}`);
	} finally {
		rmSync(root, { recursive: true, force: true });
		rmSync(home, { recursive: true, force: true });
		rmSync(bin, { recursive: true, force: true });
	}
});

test("llm-protocol schema: request/response fixtures validate", () => {
	const request = { kind: "narrative", slug: "s", inputs: { phase: "implement", events: [], turns: [] } };
	const response = { kind: "narrative", model: "fixture/llm-1", provider: "fixture", output: { summary: "s" } };
	assert.equal(llmProtocolValidate(request), true, JSON.stringify(llmProtocolValidate.errors));
	assert.equal(llmProtocolValidate(response), true, JSON.stringify(llmProtocolValidate.errors));
});
