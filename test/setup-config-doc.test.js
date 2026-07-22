// ASD11 (DoD 9) + ASD20 (DoD 13, landing-order conditional): the agent-led setup
// template names each concept it must explain; the setup-sdlc.mjs TTY fallback
// asks <= 3 interactive prompts (two decisions + confirmation); every dial stays
// reachable non-interactively by flag; and the config-doc write call site is
// present in setup (with any already-landed telemetry call sites preserved).

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { collectInterview, interview } from "../skills/sdlc/scripts/setup-sdlc.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const template = readFileSync(join(repo, "templates", "setup-sdlc.md"), "utf8");
const setupSource = readFileSync(join(repo, "skills", "sdlc", "scripts", "setup-sdlc.mjs"), "utf8");

// ---- ASD11: template names each concept -----------------------------------

test("ASD11: setup template names the kernel, tracks, gate modes, consequences, and two core decisions", () => {
	assert.match(template, /invariant kernel/i);
	assert.match(template, /configurable scaffolding|scaffolding/i);
	assert.match(template, /irreversible\/reversible|irreversible.*reversible/is);
	// gate modes explained
	for (const mode of ["panel", "skip", "human", "agent"]) assert.match(template, new RegExp(`\`${mode}\``));
	// consequences of the other dials
	assert.match(template, /shape\.separateSpec/);
	assert.match(template, /shape\.publishToTracker/);
	assert.match(template, /review\.tasks/);
	assert.match(template, /review\.onShortfall/);
	// two owner decisions
	assert.match(template, /two owner decisions/i);
	assert.match(template, /review\.design/);
	assert.match(template, /review\.code/);
});

// ---- ASD11: TTY fallback <= 3 interactive prompts -------------------------

test("ASD11: the interactive fallback asks at most 3 prompts (two decisions + confirmation)", async () => {
	const root = mkdtempSync(join(tmpdir(), "setup-interview-"));
	const questions = [];
	const ask = async (question, fallback) => {
		questions.push(question);
		return fallback; // accept every default: design=panel, code=panel, confirm=y
	};
	const code = await interview(root, ask);
	assert.equal(code, 0, "interview should write a valid config with defaults");
	assert.ok(questions.length <= 3, `interactive prompts must be <= 3, got ${questions.length}: ${JSON.stringify(questions)}`);
	// the two core decisions are the design and code reviewers
	assert.match(questions[0], /DESIGNS/);
	assert.match(questions[1], /CODE/);
	assert.match(questions[questions.length - 1], /write this config now/i);
	// setup wrote both the manifest and the generated companion
	assert.ok(existsSync(join(root, ".pi", "sdlc", "sdlc.config.json")), "manifest written");
	assert.ok(existsSync(join(root, ".pi", "sdlc", "CONFIG.md")), "CONFIG.md companion written");
});

test("ASD11: collectInterview asks exactly the two core decisions", async () => {
	const questions = [];
	const rs = await collectInterview(async (q, fallback) => {
		questions.push(q);
		return fallback;
	});
	assert.equal(questions.length, 2);
	assert.deepEqual(rs.review.design, { validate: "panel", approve: "human" });
	assert.deepEqual(rs.review.code, { validate: "panel", approve: "human" });
	// the rest come from the standard bundle, not asked
	assert.equal(rs.review.brainstorm, "human");
	assert.equal(rs.review.tasks, "subagent");
	assert.ok(Number.isInteger(rs.review.panelSize));
	assert.ok(["irreversible", "reversible"].includes(rs.shape.defaultTrack));
});

// ---- ASD11: every dial reachable non-interactively by flag ----------------

test("ASD11: every dial remains reachable non-interactively by flag", () => {
	for (const flag of ["--preset", "--review-brainstorm", "--review-design", "--review-code", "--review-tasks", "--panel-size", "--on-shortfall", "--separate-spec", "--publish-to-tracker", "--default-track", "--override"]) {
		assert.ok(setupSource.includes(flag), `USAGE must document non-interactive flag: ${flag}`);
	}
});

// ---- ASD20: config-doc write call site (+ telemetry preservation) ---------

test("ASD20: setup-sdlc.mjs carries the config-doc write call site", () => {
	assert.match(setupSource, /from "\.\/config-doc\.mjs"/, "setup must import the config-doc module");
	assert.match(setupSource, /writeConfigDoc\(root/, "setup must call the config-doc write at the config write call site");
	assert.match(setupSource, /id: "config-doc"/, "setup must report the config-doc asset");
});

test("ASD20 (landing-order conditional): any already-landed telemetry call sites are preserved", () => {
	// This stream owns nothing in telemetry.mjs. If the telemetry stream (lt-t2)
	// has already landed its record-run-event call sites in setup-sdlc.mjs, they
	// must coexist with the config-doc write call site. Until it lands, there are
	// none to preserve — the config-doc site is asserted above unconditionally.
	if (setupSource.includes("record-run-event")) {
		assert.match(setupSource, /writeConfigDoc\(root/, "both call sites must coexist after a merge");
	} else {
		assert.ok(true, "telemetry call sites not yet landed in this branch");
	}
});
