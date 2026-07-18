// ASD4 (DoD 4): the committed SKILL.md is kernel-first — ≤ 220 physical lines and
// ≤ 16384 bytes, retains all seven kernel responsibilities, and contains no
// duplicated phase-mechanics section (no phase's detailed entry/hook/gate/refusal
// mechanics block appears in SKILL.md; those live in the references).

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skillPath = join(repo, "skills", "sdlc", "SKILL.md");
const skillMd = readFileSync(skillPath, "utf8");
const skillBytes = readFileSync(skillPath).length;

test("ASD4: SKILL.md is within the 220-line / 16384-byte ceiling", () => {
	const lines = skillMd.split("\n").length;
	assert.ok(lines <= 220, `SKILL.md is ${lines} physical lines (ceiling 220)`);
	assert.ok(skillBytes <= 16384, `SKILL.md is ${skillBytes} bytes (ceiling 16384)`);
});

test("ASD4: SKILL.md retains all seven kernel responsibilities", () => {
	// 1 readiness branching + announcement law
	assert.match(skillMd, /^## Readiness gate and announcement/m);
	assert.match(skillMd, /\*\*Exit 0 \(`ready`\)\*\*/);
	// 2 invariant kernel + forward/backward transition law (two tracks, iron law)
	assert.match(skillMd, /^## The iron law \(two tracks\)$/m);
	assert.match(skillMd, /Backward moves[\s\S]*are always allowed/);
	// 3 effective-shape reading protocol + startup check
	assert.match(skillMd, /^## Effective-shape reading protocol$/m);
	assert.match(skillMd, /config-doc\.sh check/);
	// 4 authority map + reference pointers
	assert.match(skillMd, /^## Authority map/m);
	assert.match(skillMd, /references\/system-reference\.md/);
	// 5 phase sequence + phase-reference loading rule
	assert.match(skillMd, /^## Phases and the phase-reference loading rule$/m);
	assert.match(skillMd, /load it when the phase begins/);
	// 6 cross-phase red flags + gate/process conflict rule
	assert.match(skillMd, /^## Red flags$/m);
	assert.match(skillMd, /^## Gate\/process conflict rule$/m);
	// 7 delegation pointers
	assert.match(skillMd, /^## Delegation \(do not reimplement\)$/m);
});

test("ASD4: SKILL.md contains no duplicated detailed phase-mechanics block", () => {
	// Detailed per-phase mechanics moved to references must not reappear in SKILL.
	const movedMarkers = [
		/^## 1\. Purpose and invocation modes$/m, // phase-reference heading shape
		/\[sdlc hook\] <phase>:<before\|after>/, // announce-on-fire block (system-reference)
		/Working the map/, // map-mode mechanics (phase-brainstorm)
		/PV1 validation manifest/, // per-task validator detail (phase-implement)
		/Save panel artifacts under/, // panel run-shape detail (phase-pr-review)
		/native GitHub sub-issues of the map/, // ticket mechanics (phase-brainstorm)
	];
	for (const re of movedMarkers) {
		assert.doesNotMatch(skillMd, re, `SKILL.md still carries moved phase-mechanics detail: ${re}`);
	}
});
