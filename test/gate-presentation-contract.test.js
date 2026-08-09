// Gate presentation contract tests (S3, map #192).
//
// Spec: docs/specs/2026-08-09-gate-presentation-contract.md (scenario prefix
// GPC). Contract tests assert anchors in the governed docs; they never
// restate rule substance (spec C8). Offline string assertions; no model
// calls. Later tasks append their section's assertions to this one file.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

const brainstorm = readFileSync(join(repo, "skills", "sdlc", "references", "phase-brainstorm.md"), "utf8");

// Extract one numbered section body ("## N. ...") up to the next "## " line.
// Line-anchored on purpose: this helper is the falsification harness for
// GPC12 — if an edit removes a section boundary, extraction fails before any
// assertion can pass silently.
function sectionOf(source, n) {
	const lines = source.split("\n");
	const from = lines.findIndex((line) => line.startsWith(`## ${n}.`) || line === `## ${n}`);
	assert.ok(from >= 0, `phase-brainstorm.md must keep the "## ${n}." section heading`);
	const rest = lines.slice(from + 1);
	const span = rest.findIndex((line) => line.startsWith("## "));
	return rest.slice(0, span === -1 ? rest.length : span).join("\n");
}

const sec8 = sectionOf(brainstorm, 8);
// Prose is hard-wrapped; match anchors against whitespace-normalized text.
const flat = (s) => s.replace(/\s+/g, " ");
const sec8f = flat(sec8);

// ---- GPC1: §8 block and three-kind example ----------------------------------

test("GPC1 sec8 heading stays pinned and the block is titled The gate presentation", () => {
	// ASD3 pins the literal §8 heading; the spec's block title lands inside.
	assert.match(brainstorm, /^## 8\. Completion evidence and next transition/m);
	const titles = sec8f.match(/The gate presentation/g) ?? [];
	assert.equal(titles.length, 1, "exactly one §8 block titled The gate presentation");
});

test("GPC1 sec8 pins exactly two artifacts and no third", () => {
	assert.match(sec8f, /exactly two artifacts/);
	assert.match(sec8f, /No third contractual artifact/);
	assert.match(sec8f, /no prose recap/);
});

test("GPC1 sec8 example carries the sketch fence and all three line kinds", () => {
	const fences = sec8.match(/```mermaid/g) ?? [];
	assert.equal(fences.length, 1, "exactly one fenced sketch example in sec8");
	assert.match(sec8f, /- appetite: <scale\/time\/effort>/);
	assert.match(sec8f, /- decision:/);
	assert.match(sec8f, /- rejected:/);
});

// ---- GPC5: decision grammar ordered and one-line -----------------------------

test("GPC5 appetite is exactly one and first; entries are one physical line", () => {
	assert.match(sec8f, /exactly one `appetite:` line/);
	assert.match(sec8f, /first decision line/);
	assert.match(sec8f, /one physical line/);
});

test("GPC5 decision lines carry a one-line why; rejected lines are unconditional", () => {
	assert.match(sec8f, /`decision:` lines carry the ratified decision with a one-line why/);
	assert.match(sec8f, /`rejected:` lines are unconditional/);
});

// ---- GPC6: ADR bar by reference, conditional ASCII suffix ---------------------

test("GPC6 ADR bar is named by reference, never restated", () => {
	assert.match(sec8f, /Governance bar in `references\/system-reference\.md`/);
	const reference = readFileSync(join(repo, "skills", "sdlc", "references", "system-reference.md"), "utf8");
	assert.match(reference, /^Governance: when a decision made anywhere in the lifecycle is hard to reverse,/m);
	for (const criteria of ["hard to reverse", "surprising without context", "the result of a real trade-off"]) {
		assert.ok(!sec8f.includes(criteria), `sec8 must not restate the criteria "${criteria}"`);
	}
});

test("GPC6 qualifying decisions take the literal ASCII suffix", () => {
	assert.match(sec8f, /qualifying decisions take the suffix/);
	assert.match(sec8f, /\(-> ADR 00NN\)/);
	assert.ok(!sec8f.includes("(→ ADR"), "no unicode-arrow suffix form");
});

// ---- GPC17: trigger, absence, amendment loop, transition ----------------------

test("GPC17 sec8 names the sketch trigger and the absence declaration", () => {
	assert.match(sec8f, /new flow or three or more interacting components/);
	assert.match(sec8f, /its absence is declared at the gate, never silent/);
});

test("GPC17 sec8 names the amendment loop and the transition", () => {
	assert.match(sec8f, /the human speaks, the agent updates the list/);
	assert.match(sec8f, /the amended list lands/);
	assert.match(sec8f, /The next transition is \*\*Plan\*\*/);
	assert.match(sec8f, /the Plan carries the provenance/);
});
