import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { classifyConfigVersion, CONFIG_DEFAULTS, effectiveReview, effectiveReviewDial, inspectConfig, REMEDY_SCHEMA_NEWER, readConfig } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const lib = join(repo, "skills", "sdlc", "scripts", "lib.mjs");

function tempRoot() {
	const root = mkdtempSync(join(tmpdir(), "sdlc-lib-config-"));
	mkdirSync(join(root, ".pi", "sdlc"), { recursive: true });
	return root;
}

function writeConfig(root, config) {
	writeFileSync(join(root, ".pi", "sdlc", "sdlc.config.json"), `${JSON.stringify(config)}\n`);
}

function childRead(root) {
	const source = `const { readConfig } = await import(${JSON.stringify(lib)}); readConfig(${JSON.stringify(root)});`;
	return spawnSync(process.execPath, ["--input-type=module", "-e", source], { encoding: "utf8" });
}

const panels = {
	phases: Object.fromEntries(["plan_review", "spec_review", "pr_review", "task_validate"].map((phase) => [phase, { prefer: ["p/m"] }])),
};
const shape = { separateSpec: true, publishToTracker: 2, defaultTrack: "irreversible" };
// A v4 base review block: design/code are { validate, approve } objects.
function v4Review(overrides = {}) {
	return { brainstorm: "human", design: { validate: "panel", approve: "human" }, code: { validate: "panel", approve: "human" }, tasks: "subagent", panelSize: 2, onShortfall: "fail", ...overrides };
}
function v4Config(extra = {}) {
	return { schemaVersion: 4, prefix: "x", labelPrefix: "x", announce: "x", paths: { plans: "plans" }, review: v4Review(), shape, panels, ...extra };
}

test("readConfig returns current defaults when the manifest is absent", () => {
	const root = tempRoot();
	assert.deepEqual(readConfig(root), { ...CONFIG_DEFAULTS, paths: { ...CONFIG_DEFAULTS.paths }, tracker: undefined });
});

test("readConfig validates and returns merged v4 fields", () => {
	const root = tempRoot();
	const review = v4Review();
	writeConfig(root, { schemaVersion: 4, prefix: "x", labelPrefix: "x", announce: "x", paths: { plans: "plans" }, review, shape, panels });
	assert.deepEqual(readConfig(root), {
		schemaVersion: 4,
		prefix: "x",
		labelPrefix: "x",
		announce: "x",
		paths: { ...CONFIG_DEFAULTS.paths, plans: "plans" },
		tracker: undefined,
		hooks: undefined,
		review,
		shape,
		panels,
	});
});

test("readConfig keeps newer and malformed version diagnostics distinct", () => {
	const newerRoot = tempRoot();
	writeConfig(newerRoot, { schemaVersion: 5 });
	const newer = childRead(newerRoot);
	assert.equal(newer.status, 2);
	assert.equal(newer.stderr, `sdlc: ${REMEDY_SCHEMA_NEWER(5)}\n`);

	const invalidRoot = tempRoot();
	writeConfig(invalidRoot, { schemaVersion: "4", prefix: "x", labelPrefix: "x", announce: "x" });
	const invalid = childRead(invalidRoot);
	assert.equal(invalid.status, 2);
	assert.match(invalid.stderr, /schemaVersion must be 4/);
	assert.doesNotMatch(invalid.stderr, /newer than this skill|predates this skill/);
});

// S1 — schema accepts a valid v4 config (empty issues).
test("S1: inspectConfig accepts a valid v4 config", () => {
	assert.deepEqual(inspectConfig(v4Config()), []);
});

// S2 — both base fields required.
test("S2: a base dial missing a field yields an 'is required' issue", () => {
	const missingApprove = inspectConfig(v4Config({ review: v4Review({ design: { validate: "panel" } }) }));
	assert.ok(missingApprove.some((i) => i.path === "review.design.approve" && /is required/.test(i.message)));
	const missingValidate = inspectConfig(v4Config({ review: v4Review({ code: { approve: "agent" } }) }));
	assert.ok(missingValidate.some((i) => i.path === "review.code.validate" && /is required/.test(i.message)));
});

// S3 — a scalar dial is rejected (no desugaring at runtime).
test("S3: a scalar gate dial is rejected as not-an-object", () => {
	const issues = inspectConfig(v4Config({ review: v4Review({ design: "panel" }) }));
	assert.ok(issues.some((i) => i.path === "review.design" && /must be an object/.test(i.message)));
});

// S4 — enum guards on validate/approve.
test("S4: out-of-enum validate/approve are rejected naming the legal set", () => {
	const badV = inspectConfig(v4Config({ review: v4Review({ design: { validate: "advisory", approve: "human" } }) }));
	assert.ok(badV.some((i) => i.path === "review.design.validate" && /panel, skip/.test(i.message)));
	const badA = inspectConfig(v4Config({ review: v4Review({ code: { validate: "panel", approve: "auto" } }) }));
	assert.ok(badA.some((i) => i.path === "review.code.approve" && /human, agent/.test(i.message)));
});

// S13 — reserved preview: accepted (b) non-boolean rejected, (c) unknown sibling rejected.
test("S13: reserved preview is accepted; non-boolean and unknown sibling rejected", () => {
	assert.deepEqual(inspectConfig(v4Config({ review: v4Review({ design: { validate: "panel", approve: "human", preview: true } }) })), []);
	const badPreview = inspectConfig(v4Config({ review: v4Review({ design: { validate: "panel", approve: "human", preview: "yes" } }) }));
	assert.ok(badPreview.some((i) => i.path === "review.design.preview" && /must be a boolean/.test(i.message)));
	const unknownSibling = inspectConfig(v4Config({ review: v4Review({ code: { validate: "panel", approve: "human", bogus: 1 } }) }));
	assert.ok(unknownSibling.some((i) => i.path === "review.code.bogus" && /unknown key/.test(i.message)));
});

// S5 (validation side) — partial override deep-merge keeps the inherited axis.
test("S5: a partial override deep-merges, inheriting the un-named axis", () => {
	const config = v4Config({ overrides: { reversible: { review: { design: { approve: "agent" } } } } });
	assert.deepEqual(inspectConfig(config), []); // partial override accepted
	const eff = effectiveReview(config, "reversible");
	assert.deepEqual(eff.design, { validate: "panel", approve: "agent" }); // validate inherited, not dropped
	// no override for a track leaves the base intact
	assert.deepEqual(effectiveReview(config, "irreversible").design, { validate: "panel", approve: "human" });
	// effectiveReviewDial in isolation
	assert.deepEqual(effectiveReviewDial({ validate: "panel", approve: "human" }, { approve: "agent" }), { validate: "panel", approve: "agent" });
	assert.deepEqual(effectiveReviewDial({ validate: "panel", approve: "human" }, undefined), { validate: "panel", approve: "human" });
});

// S8 — v3 now classifies as "older".
test("S8: classifyConfigVersion(3) is older, not current", () => {
	assert.deepEqual(classifyConfigVersion({ schemaVersion: 3 }), { kind: "older", version: 3 });
	assert.equal(classifyConfigVersion({ schemaVersion: 4 }).kind, "current");
});

// S7 — no dead gate-mode symbols survive in the core scripts.
test("S7: decomposeGateMode / GATE_MODES / arbiter / blocking are gone from the core scripts", () => {
	for (const rel of ["scripts/lib.mjs", "scripts/resolve-panel.mjs", "scripts/config-doc.mjs"]) {
		const src = readFileSync(join(repo, "skills", "sdlc", rel), "utf8");
		assert.doesNotMatch(src, /decomposeGateMode|GATE_MODES/, `${rel} still references a removed gate-mode symbol`);
		assert.doesNotMatch(src, /\barbiter\b/, `${rel} still references arbiter`);
	}
});
