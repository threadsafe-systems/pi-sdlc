// OL-A T1: lifecycle vocabulary, cross-field validation, and gate-mode seam.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

import { decomposeGateMode, inspectConfig } from "../skills/sdlc/scripts/lib.mjs";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));

function readJson(path) {
	try {
		return JSON.parse(readFileSync(path, "utf8"));
	} catch (error) {
		throw new Error(`invalid JSON fixture ${path}: ${error.message}`);
	}
}

const minimal = (lifecycle) => ({
	schemaVersion: 1,
	prefix: "sdlc",
	labelPrefix: "sdlc",
	announce: "Using the sdlc skill.",
	lifecycle,
});

const profiles = {
	solo: {
		profile: "solo",
		gates: {
			brainstorm: { mode: "off" },
			plan_review: { mode: "human", minPanel: 1 },
			pr_review: { mode: "advisory", minPanel: 1 },
		},
		phases: { mergePlanSpec: true },
		tracker: { publishThreshold: "never" },
		taskValidation: { mode: "self" },
		tracks: { defaultTrack: "irreversible" },
	},
	standard: {
		profile: "standard",
		gates: {
			brainstorm: { mode: "human" },
			plan_review: { mode: "human", minPanel: 1 },
			pr_review: { mode: "panel", minPanel: 2 },
		},
		phases: { mergePlanSpec: true },
		tracker: { publishThreshold: 4 },
		taskValidation: { mode: "subagent" },
		tracks: { defaultTrack: "irreversible" },
	},
	full: {
		profile: "full",
		gates: {
			brainstorm: { mode: "human" },
			plan_review: { mode: { irreversible: "panel", reversible: "human" }, minPanel: 2 },
			spec_review: { mode: { irreversible: "panel" }, minPanel: 2 },
			pr_review: { mode: "panel", minPanel: 2 },
		},
		phases: { mergePlanSpec: false },
		tracker: { publishThreshold: 2 },
		taskValidation: { mode: "subagent" },
		tracks: { defaultTrack: "irreversible" },
	},
};

test("OLA1: lifecycle absence preserves the dogfood config and existing collector", () => {
	const dogfood = readJson(join(repo, ".pi", "sdlc", "sdlc.config.json"));
	assert.equal(Object.hasOwn(dogfood, "lifecycle"), false);
	assert.deepEqual(inspectConfig(dogfood), []);
});

test("OLA2: all three normative preset expansions validate", () => {
	for (const [name, lifecycle] of Object.entries(profiles)) {
		assert.deepEqual(inspectConfig(minimal(lifecycle)), [], name);
	}
});

test("OLA3/OLA19: lifecycle is closed, including merge and reserved automation", () => {
	assert.deepEqual(inspectConfig(minimal({ profile: "custom", gates: { merge: {} } })), [{ path: "lifecycle.gates", message: "unknown key 'merge'" }]);
	assert.deepEqual(inspectConfig(minimal({ profile: "custom", automation: {} })), [{ path: "lifecycle", message: "unknown key 'automation'" }]);
	const schema = readFileSync(join(repo, "skills", "sdlc", "schema", "sdlc.config.schema.json"), "utf8");
	assert.match(schema, /The key `automation` is reserved for future unattended-lane policy \(budget, escalation, graduation\); nothing may squat on it\./);
});

test("OLA4: defaultTrack rejects none and names the allowed enum", () => {
	const issues = inspectConfig(minimal({ profile: "custom", tracks: { defaultTrack: "none" } }));
	assert.deepEqual(issues, [{ path: "lifecycle.tracks.defaultTrack", message: "lifecycle.tracks.defaultTrack must be one of irreversible, reversible" }]);
});

test("OLA5: vendor vocabulary and non-positive panel floors are invalid", () => {
	const vendor = inspectConfig(minimal({ profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 2, minVendors: 2 } } }));
	assert.deepEqual(vendor, [{ path: "lifecycle.gates.pr_review", message: "unknown key 'minVendors'" }]);
	const floor = inspectConfig(minimal({ profile: "custom", gates: { pr_review: { mode: "panel", minPanel: 0 } } }));
	assert.deepEqual(floor, [{ path: "lifecycle.gates.pr_review.minPanel", message: "lifecycle.gates.pr_review.minPanel must be an integer >= 1" }]);
});

test("OLA6: merged plan/spec forbids a separate spec-review gate", () => {
	const issues = inspectConfig(
		minimal({
			profile: "custom",
			gates: { spec_review: { mode: "human", minPanel: 1 } },
			phases: { mergePlanSpec: true },
		}),
	);
	assert.deepEqual(issues, [
		{
			path: "lifecycle.gates.spec_review",
			message: "lifecycle.gates.spec_review must be absent when lifecycle.phases.mergePlanSpec is true",
		},
	]);
});

test("OLA7: spec-review has no reversible track and per-track maps cannot be empty", () => {
	assert.deepEqual(inspectConfig(minimal({ profile: "custom", gates: { spec_review: { mode: { reversible: "panel" } } } })), [{ path: "lifecycle.gates.spec_review.mode", message: "unknown track 'reversible'" }]);
	for (const gate of ["plan_review", "spec_review"]) {
		assert.deepEqual(inspectConfig(minimal({ profile: "custom", gates: { [gate]: { mode: {} } } })), [{ path: `lifecycle.gates.${gate}.mode`, message: `lifecycle.gates.${gate}.mode must contain at least one track` }]);
	}
});

test("OLA8: profile is required and provenance never constrains dial values", () => {
	assert.deepEqual(inspectConfig(minimal({})), [{ path: "lifecycle.profile", message: "lifecycle.profile must be one of solo, standard, full, custom" }]);
	for (const profile of ["tiny", null, 1]) {
		assert.equal(inspectConfig(minimal({ profile }))[0].path, "lifecycle.profile");
	}
	assert.deepEqual(inspectConfig(minimal({ ...profiles.standard, gates: { ...profiles.standard.gates, brainstorm: { mode: "off" } } })), []);
});

test("OLA18: decomposeGateMode is total over the frozen four-value enum", () => {
	assert.deepEqual(decomposeGateMode("panel"), { reviewer: "panel", arbiter: "human", blocking: true });
	assert.deepEqual(decomposeGateMode("advisory"), { reviewer: "panel", arbiter: "none", blocking: false });
	assert.deepEqual(decomposeGateMode("human"), { reviewer: "none", arbiter: "human", blocking: true });
	assert.deepEqual(decomposeGateMode("off"), { reviewer: "none", arbiter: "none", blocking: false });
	assert.throws(() => decomposeGateMode("mechanical"), /unknown gate mode/);
});

test("nested lifecycle vocabulary is closed and types are checked in deterministic order", () => {
	const issues = inspectConfig(
		minimal({
			profile: "custom",
			phases: { extra: true, mergePlanSpec: "yes" },
			tracker: { extra: 1, publishThreshold: 0 },
			taskValidation: { extra: true, mode: "maybe" },
			tracks: { extra: true, defaultTrack: "none" },
		}),
	);
	assert.deepEqual(
		issues.map(({ path }) => path),
		["lifecycle.phases", "lifecycle.phases.mergePlanSpec", "lifecycle.tracker", "lifecycle.tracker.publishThreshold", "lifecycle.taskValidation", "lifecycle.taskValidation.mode", "lifecycle.tracks", "lifecycle.tracks.defaultTrack"],
	);
});
