// ASD6-ASD9 (DoD 5/6/7): the config-doc module — deterministic render, the
// write/collision matrix, the CONFIG.md content contract, and the four check
// states. Node builtins only; no model calls. Uses a temp repo root with a
// valid schemaVersion-4 config.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { check, CURRENT_SENTINEL_VERSION, fingerprint, parseSentinel, render, sentinelLine, write } from "../skills/sdlc/scripts/config-doc.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const CLI = join(repo, "skills", "sdlc", "scripts", "config-doc.mjs");

const VALID_CONFIG = {
	schemaVersion: 4,
	prefix: "demo",
	labelPrefix: "demo",
	announce: "Using the sdlc skill.",
	paths: { plans: "docs/plans", specs: "docs/specs", reviews: "docs/reviews", agents: ".pi/agents" },
	review: { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "fail" },
	shape: { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" },
	overrides: { reversible: { review: { design: { validate: "skip" } } } },
	panels: {
		authorDefault: "anthropic/claude-opus-4-8:high",
		phases: {
			plan_review: { panelSize: 2, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
			spec_review: { panelSize: 2, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
			pr_review: { panelSize: 3, prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
			task_validate: { panelSize: 1, prefer: ["deepseek/deepseek-v4-flash"] },
		},
	},
};

function fixture(config = VALID_CONFIG) {
	const root = mkdtempSync(join(tmpdir(), "config-doc-"));
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(config, null, 2));
	return root;
}
const companion = (root) => join(root, ".pi", "sdlc", "CONFIG.md");
const runCli = (args, root) => {
	try {
		const stdout = execFileSync("node", [CLI, ...args, "--repo-root", root], { encoding: "utf8" });
		return { status: 0, stdout };
	} catch (e) {
		return { status: e.status, stdout: e.stdout ?? "" };
	}
};

// ---- ASD6: deterministic render + full §14 content ------------------------

test("ASD6: render is deterministic and byte-identical across runs", () => {
	assert.equal(render(VALID_CONFIG), render(VALID_CONFIG));
});

test("ASD6: write twice is byte-identical (retained)", () => {
	const root = fixture();
	const first = write(root);
	assert.equal(first.action, "created");
	const a = readFileSync(companion(root), "utf8");
	const second = write(root);
	assert.equal(second.action, "retained");
	assert.equal(readFileSync(companion(root), "utf8"), a);
});

test("ASD6: rendered CONFIG.md carries all §14 sections and every schemaVersion-4 key in JSON order", () => {
	const body = render(VALID_CONFIG);
	// §14 ordered sections
	assert.match(body, /^<!-- pi-sdlc:config-doc v1 fingerprint=[0-9a-f]{64} -->$/m); // 1 sentinel
	assert.match(body, /Generated file — do not hand-edit/); // 2 warning
	assert.match(body, /## Effective lifecycle shape/); // 3 behaviour-first
	assert.match(body, /## Configuration keys \(JSON order\)/); // 4 key reference
	assert.match(body, /## Fingerprint & generator format/); // 5 fingerprint identity
	assert.match(body, /## Regenerate & check/); // 6 regeneration
	assert.match(body, /references\/system-reference\.md/); // 7 pointer
	// every persisted key appears, in JSON (insertion) order
	const keys = Object.keys(VALID_CONFIG);
	const positions = keys.map((k) => body.indexOf(`**\`${k}\`**`));
	for (const [i, p] of positions.entries()) assert.ok(p >= 0, `key not documented: ${keys[i]}`);
	for (let i = 1; i < positions.length; i++) assert.ok(positions[i] > positions[i - 1], `key ${keys[i]} out of JSON order`);
});

// ---- ASD8: CONFIG.md content contract -------------------------------------

test("ASD8: CONFIG.md declares JSON authority, warning, fingerprint identity, guidance, and pointer", () => {
	const body = render(VALID_CONFIG);
	assert.match(body, /`\.pi\/sdlc\/sdlc\.config\.json` is the\s*>? *\n?\s*>? *authoritative manifest/);
	assert.match(body, /detected as stale/);
	assert.match(body, new RegExp(`generator format: \`${CURRENT_SENTINEL_VERSION}\``));
	assert.match(body, new RegExp(`fingerprint: \`${fingerprint(VALID_CONFIG)}\``));
	assert.match(body, /config-doc\.sh write/);
	assert.match(body, /config-doc\.sh check/);
	assert.match(body, /references\/system-reference\.md/);
});

// ---- ASD7: recognition boundary + write matrix ----------------------------

test("ASD7: byte-matching current file is retained", () => {
	const root = fixture();
	write(root);
	assert.equal(write(root).action, "retained");
});

test("ASD7: a recognized stale / body-edited companion is regenerated", () => {
	const root = fixture();
	write(root);
	// body edit under a still-recognized sentinel
	const edited = `${readFileSync(companion(root), "utf8")}\nhand-edited line\n`;
	writeFileSync(companion(root), edited);
	const r = write(root);
	assert.equal(r.action, "regenerated");
	assert.equal(readFileSync(companion(root), "utf8"), render(VALID_CONFIG));
});

test("ASD7: an unrecognized collision is refused (exit 3) without --force and forced (exit 0) with it", () => {
	const root = fixture();
	writeFileSync(companion(root), "# hand-authored, no sentinel\n");
	const refused = write(root, { force: false });
	assert.equal(refused.action, "refused");
	assert.equal(refused.exitCode, 3);
	assert.equal(readFileSync(companion(root), "utf8"), "# hand-authored, no sentinel\n"); // untouched
	const forced = write(root, { force: true });
	assert.equal(forced.action, "forced");
	assert.equal(forced.exitCode, 0);
	assert.equal(readFileSync(companion(root), "utf8"), render(VALID_CONFIG));
});

test("ASD7 (CLI): refused write exits 3", () => {
	const root = fixture();
	writeFileSync(companion(root), "collision\n");
	assert.equal(runCli(["write"], root).status, 3);
});

// ---- ASD9: four check states + mutation-freedom ---------------------------

test("ASD9: check returns current / missing / stale / error for the four inputs", () => {
	// missing
	const root = fixture();
	assert.equal(check(root).state, "missing");
	assert.equal(check(root).exitCode, 1);
	// current
	write(root);
	assert.equal(check(root).state, "current");
	assert.equal(check(root).exitCode, 0);
	// stale (config value change after generation)
	const cfg = JSON.parse(readFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), "utf8"));
	cfg.review.panelSize = 3;
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify(cfg, null, 2));
	assert.equal(check(root).state, "stale");
	assert.equal(check(root).exitCode, 1);
	// error: collision (unrecognized sentinel)
	const c2 = fixture();
	writeFileSync(companion(c2), "no sentinel here\n");
	const errC = check(c2);
	assert.equal(errC.state, "error");
	assert.equal(errC.exitCode, 2);
	assert.match(errC.reason, /^collision:/);
	// error: invalid-config
	const c3 = fixture();
	writeFileSync(join(c3, ".pi", "sdlc", "sdlc.config.json"), JSON.stringify({ schemaVersion: 4 }, null, 2));
	const errI = check(c3);
	assert.equal(errI.state, "error");
	assert.equal(errI.exitCode, 2);
	assert.match(errI.reason, /^invalid-config:/);
});

test("ASD9: check detects a body edit and a render-format mismatch as stale", () => {
	const root = fixture();
	write(root);
	// body edit under a recognized, correctly-fingerprinted sentinel line
	const good = readFileSync(companion(root), "utf8");
	const lines = good.split("\n");
	lines[3] = `${lines[3]} tampered`;
	writeFileSync(companion(root), lines.join("\n"));
	assert.equal(check(root).state, "stale");

	// render-format mismatch: recognized v1 sentinel but a wrong fingerprint
	const root2 = fixture();
	write(root2);
	const expectedFp = fingerprint(VALID_CONFIG);
	const wrongFp = "0".repeat(64);
	const body = readFileSync(companion(root2), "utf8").replace(expectedFp, wrongFp);
	writeFileSync(companion(root2), body);
	const parsed = parseSentinel(body);
	assert.equal(parsed.recognized, true);
	assert.notEqual(parsed.fingerprint, expectedFp);
	assert.equal(check(root2).state, "stale");
});

test("ASD9: check mutates nothing in any state", () => {
	for (const setup of [
		() => {}, // missing
		(r) => write(r), // current
		(r) => {
			write(r);
			writeFileSync(companion(r), `${readFileSync(companion(r), "utf8")}x`);
		}, // stale
		(r) => writeFileSync(companion(r), "collision\n"), // error/collision
	]) {
		const root = fixture();
		setup(root);
		const before = existsSync(companion(root)) ? readFileSync(companion(root), "utf8") : null;
		const beforeMtime = existsSync(companion(root)) ? statSync(companion(root)).mtimeMs : null;
		check(root);
		const after = existsSync(companion(root)) ? readFileSync(companion(root), "utf8") : null;
		assert.equal(after, before, "check must not change companion content");
		if (beforeMtime !== null) assert.equal(statSync(companion(root)).mtimeMs, beforeMtime, "check must not touch the companion");
	}
});

test("ASD6/sentinel: sentinelLine round-trips through parseSentinel as recognized", () => {
	const line = sentinelLine(VALID_CONFIG);
	const parsed = parseSentinel(`${line}\nbody`);
	assert.equal(parsed.wellFormed, true);
	assert.equal(parsed.recognized, true);
	assert.equal(parsed.version, CURRENT_SENTINEL_VERSION);
	assert.equal(parsed.fingerprint, fingerprint(VALID_CONFIG));
});

test("panel floors: render surfaces per-track resolved floors incl task_validate=1 and per-phase overrides (§14)", () => {
	const body = render(VALID_CONFIG);
	assert.match(body, /## Resolved panel floors/);
	assert.match(body, /\*\*irreversible:\*\* plan_review=2, spec_review=2, pr_review=3, task_validate=1\./);
	assert.match(body, /\*\*reversible:\*\* plan_review=2, spec_review=2, pr_review=3, task_validate=1\./);
});

test("panel floors: task_validate resolves to 1 and per-track override applies when no per-phase panelSize", () => {
	const cfg = structuredClone(VALID_CONFIG);
	cfg.panels.phases = {
		plan_review: { prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
		spec_review: { prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
		pr_review: { prefer: ["zai/glm-5.2:high", "deepseek/deepseek-v4-pro:high"] },
		task_validate: { prefer: ["deepseek/deepseek-v4-flash"] },
	};
	cfg.overrides = { reversible: { review: { panelSize: 1 } } };
	const body = render(cfg);
	// irreversible: no per-phase size, not task_validate -> review.panelSize (2); task_validate -> 1
	assert.match(body, /\*\*irreversible:\*\* plan_review=2, spec_review=2, pr_review=2, task_validate=1\./);
	// reversible: overrides.reversible.review.panelSize (1); task_validate -> 1
	assert.match(body, /\*\*reversible:\*\* plan_review=1, spec_review=1, pr_review=1, task_validate=1\./);
});

test("symlink safety: a symlinked companion is never followed (check error / write refused)", () => {
	const root = fixture();
	const outside = mkdtempSync(join(tmpdir(), "config-doc-outside-"));
	const victim = join(outside, "victim.txt");
	writeFileSync(victim, "do not clobber\n");
	symlinkSync(victim, companion(root));
	const c = check(root);
	assert.equal(c.state, "error");
	assert.equal(c.exitCode, 2);
	assert.match(c.reason, /symlink/);
	const forced = write(root, { force: true });
	assert.equal(forced.action, "refused");
	assert.equal(forced.exitCode, 3);
	assert.equal(readFileSync(victim, "utf8"), "do not clobber\n");
});

test("symlink safety: a DANGLING symlink is refused, never created through the link", () => {
	const root = fixture();
	const outside = mkdtempSync(join(tmpdir(), "config-doc-dangling-"));
	const victim = join(outside, "does-not-exist.md");
	symlinkSync(victim, companion(root)); // target absent -> existsSync(companion) is false
	assert.equal(check(root).state, "error");
	const forced = write(root, { force: true });
	assert.equal(forced.action, "refused");
	assert.equal(forced.exitCode, 3);
	assert.equal(existsSync(victim), false, "a dangling symlink must not be written through");
});
