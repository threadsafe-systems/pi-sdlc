// Gate presentation contract tests (S3, map #192).
//
// Spec: docs/specs/2026-08-09-gate-presentation-contract.md (scenario prefix
// GPC). Contract tests assert anchors in the governed docs; they never
// restate rule substance (spec C8). Offline string assertions; no model
// calls. Later tasks append their section's assertions to this one file.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
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
const sec1 = sectionOf(brainstorm, 1);
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

function blockOf(source, heading) {
	const lines = source.split("\n");
	const from = lines.findIndex((line) => line === heading);
	assert.ok(from >= 0, `${heading} must exist`);
	const rest = lines.slice(from + 1);
	const span = rest.findIndex((line) => /^#{2,3} /.test(line));
	return rest.slice(0, span === -1 ? rest.length : span).join("\n");
}

const spike = blockOf(sec8, "### Spike exit loop");
const spikef = flat(spike);

// ---- Spike routing and exit loop ---------------------------------------------

test("SER1 preserves one spike block and the exact phase/router sets", () => {
	assert.equal(sec8.match(/^### Spike exit loop$/gm)?.length, 1);
	const phaseRefs = readdirSync(join(repo, "skills", "sdlc", "references"))
		.filter((name) => name.startsWith("phase-") && name.endsWith(".md"))
		.sort();
	assert.deepEqual(phaseRefs, ["phase-brainstorm.md", "phase-implement.md", "phase-plan.md", "phase-pr-review.md", "phase-spec.md", "phase-tasks.md"]);
	const routers = readdirSync(join(repo, "templates"))
		.filter((name) => name.startsWith("sdlc-") && name.endsWith(".md"))
		.sort();
	assert.deepEqual(routers, ["sdlc-brainstorm.md", "sdlc-implement.md", "sdlc-plan.md", "sdlc-pr-review.md", "sdlc-spec.md", "sdlc-tasks.md"]);
});

test("SER2 orders the four first-match routes and keeps the read tier future-only", () => {
	const routes = ["Read now", "Plan and front-load", "Use human judgment", "Propose a spike"].map((anchor) => spike.indexOf(anchor));
	assert.ok(routes.every((index) => index >= 0), "all route anchors exist");
	assert.deepEqual(routes, [...routes].sort((a, b) => a - b), "route anchors stay ordered");
	assert.match(spikef, /first matching route/);
	assert.match(spikef, /Issue #147/);
	assert.match(spikef, /future mechanisation/);
	assert.match(spikef, /does not implement/);
});

test("SER3 keeps route boundaries exhaustive", () => {
	assert.match(spikef, /available but insufficient/);
	assert.match(spikef, /detailed requirements, delivery acceptance, or production behaviour/);
	assert.match(spikef, /no empirical evidence can settle/);
	assert.match(spikef, /remaining empirical uncertainty/);
	assert.match(spikef, /Incomplete goals or exit criteria stay in Brainstorm/);
});

test("SER4 requires the pre-spike human checkpoint", () => {
	assert.match(spikef, /human checkpoint/);
	assert.match(spikef, /one or more goals/);
	assert.match(spikef, /uncertainty each goal addresses/);
	assert.match(spikef, /exit criteria/);
	assert.match(spikef, /Before work starts/);
});

test("SER5 keeps spikes exploratory without a numeric threshold", () => {
	assert.match(spikef, /no mandatory numerical time or cost threshold/);
	assert.match(spikef, /deliverable in disguise/);
	assert.match(spikef, /route to Plan/);
});

test("SER6 blocks continuation and direction until a fresh checkpoint", () => {
	assert.match(spikef, /fresh human checkpoint/);
	assert.match(spikef, /amended goals and exit criteria/);
	assert.match(spikef, /before continuing, redirecting, selecting a direction, or transitioning to Plan/);
	assert.match(spikef, /current exit criteria are adequately met/);
});

test("SER7 keeps direction separate and preserves lifecycle transitions", () => {
	assert.match(spikef, /Direction is exactly \*\*stop\*\*, \*\*revise\*\*, or \*\*proceed\*\*/);
	assert.match(spikef, /stop closes the proposed change without delivery/);
	assert.match(spikef, /revise returns to Brainstorm/);
	assert.match(sec8f, /The next transition is \*\*Plan\*\*/);
});

test("SER8 keeps artifact treatment independent and provisional", () => {
	for (const anchor of ["discard", "retain as reference", "provisional foundation", "provisional candidate deliverable"]) assert.match(spikef, new RegExp(anchor));
	assert.match(spikef, /independently from direction/);
	assert.match(spikef, /Reuse is never mandatory/);
	assert.match(spikef, /downstream lifecycle contracts/);
});

test("SER9 requires a destination for provisional treatments", () => {
	assert.match(spikef, /names the future or proceeding effort/);
	assert.match(spikef, /reduces to reference or discard/);
});

test("SER10 keeps retained evidence linked and its decision self-contained", () => {
	for (const anchor of ["document", "issue comment", "prototype branch", "artifact directory"]) assert.match(spikef, new RegExp(anchor));
	assert.match(spikef, /existing `decision:` line/);
	assert.match(spikef, /meaningful if the link is later removed/);
	assert.match(spikef, /qualitative corpus/);
	assert.match(spikef, /no new FS13 event/);
});

// ---- GPC16: §1 dialogue moves named ------------------------------------------

const sec1f = flat(sec1);

test("GPC16 sec1 names G1, G2, G3 alongside the G4 and G7 moves", () => {
	assert.match(sec1f, /G1 open on problem and outcome, naming no mechanism/);
	assert.match(sec1f, /G2 alternative-or-declare/);
	assert.match(sec1f, /G3 appetite before converging/);
	assert.match(sec1f, /elicit scale, time, and effort before the design converges/);
	assert.match(sec1f, /Moves G4 and G7 are the two labelled bullets below/);
});

// ---- GPC7: G4 triggers in §1 with declared skips --------------------------------

test("GPC7 tools bullet names exactly the three triggers", () => {
	assert.match(sec1f, /\*\*external dependency\*\*/);
	assert.match(sec1f, /\*\*prior-art claim\*\*/);
	assert.match(sec1f, /\*\*cross-repo pattern invoked\*\*/);
	assert.match(sec1f, /exactly three triggers/);
	assert.match(sec1f, /outside those triggers there is no research ceremony/);
});

test("GPC7 both branches: fired-and-researched, fired-but-skipped-with-declaration", () => {
	// Fired branch: research is required when a trigger fires.
	assert.match(sec1f, /Research is required only when one of exactly three triggers fires/);
	// Skipped branch: a fired-but-skipped trigger must be declared.
	assert.match(sec1f, /A fired-but-skipped trigger must be declared in the same gate presentation/);
	// The proportionality sentence stays.
	assert.match(sec1f, /proportional, not mandatory ceremony/);
});

// ---- GPC8: G7 one prompt in §1, none identified, no binding -----------------------

test("GPC8 one prompt, none identified is a complete answer", () => {
	assert.match(sec1f, /move G7 — constraints prompt/);
	assert.match(sec1f, /One prompt, not a battery/);
	assert.match(sec1f, /`none identified` — a complete answer, not a failure state/);
});

test("GPC8 named constraints bind only when they actually bind", () => {
	assert.match(sec1f, /become decision lines only when they actually bind/);
	assert.match(sec1f, /Brainstorm never binds a constraint itself/);
});

// ---- GPC18/GPC3/GPC4: §9 map-mode provenance split ----------------------------

const sec9 = sectionOf(brainstorm, 9);
const sec9f = flat(sec9);

test("GPC18 sketch embeds verbatim in the plan in both modes", () => {
	assert.match(sec9f, /The sketch embeds verbatim in the plan in both modes/);
	assert.match(sec9f, /a gate artifact, belonging to no ticket/);
});

test("GPC3 one gist line + named link per ticket; full list in exactly one home", () => {
	assert.match(sec9f, /Only \*\*the decisions list becomes the index\*\*/);
	assert.match(sec9f, /one gist line \+ named link per ticket/);
	assert.match(sec9f, /exactly one home/);
	assert.match(sec9f, /never duplicated into the plan/);
});

test("GPC3 resolution comment is the home; boundary rule stated", () => {
	assert.match(sec9f, /The home is the \*\*resolution comment\*\*/);
	assert.match(sec9f, /no line-kind prefix and no uniform classification of any kind/);
	assert.match(sec9f, /kind names may appear as subject matter of the decision being gisted/);
	assert.match(sec9f, /entry classification lives only at the home/);
});

test("GPC4 thread variant is conditional and shares one home", () => {
	assert.match(sec9f, /only when the decisions were ratified as thread comments on the map issue/);
	assert.match(sec9f, /entries sharing that comment share one home/);
});

// ---- GPC2: phase-plan.md §4 storage rule ---------------------------------------

const planDoc = readFileSync(join(repo, "skills", "sdlc", "references", "phase-plan.md"), "utf8");
const planSec4 = sectionOf(planDoc, 4);
const planSec4f = flat(planSec4);

test("GPC2 sec4 enumeration names the Brainstorm provenance block", () => {
	assert.match(planSec4, /Brainstorm provenance block/);
});

test("GPC2 storage rule sits between the opening paragraph and Dialogue discipline", () => {
	const openIdx = planSec4.indexOf("Produce the Plan doc");
	const ruleIdx = planSec4.indexOf("**Brainstorm provenance storage.**");
	const dialogueIdx = planSec4.indexOf("**Dialogue discipline.**");
	assert.ok(openIdx >= 0, "opening paragraph present");
	assert.ok(ruleIdx > openIdx, "rule after the opening paragraph");
	assert.ok(dialogueIdx > ruleIdx, "rule before Dialogue discipline");
});

test("GPC2 both storage branches and the standalone branch are named", () => {
	assert.match(planSec4f, /in plain mode store both verbatim/);
	assert.match(planSec4f, /in map mode store the sketch verbatim and index the decisions list/);
	assert.match(planSec4f, /no upstream gate/);
});

test("GPC2 no-contradiction clause with declared deviation, enforcement by reference", () => {
	assert.match(planSec4f, /must not contradict a named decision or resurrect a `rejected:` line without a declared deviation/);
	assert.match(planSec4f, /routes by reference to the frozen adversary plan prompt's attack surface D/);
	assert.match(planSec4f, /the prompt itself stays untouched/);
});

// ---- GPC10: C8 cross-cutting bounds ----------------------------------------

const testSource = readFileSync(join(here, "gate-presentation-contract.test.js"), "utf8");

test("GPC10 test file imports only node built-ins (no parser)", () => {
	const imports = [...testSource.matchAll(/^import .*$/gm)].map((m) => m[0]);
	assert.ok(imports.length >= 1, "sanity: imports exist");
	for (const line of imports) {
		assert.match(line, /from "node:/, `non-builtin import: ${line}`);
	}
});

test("GPC10 no >=80-character verbatim substring of any governed doc in the test file", () => {
	const governed = [readFileSync(join(repo, "skills", "sdlc", "references", "phase-brainstorm.md"), "utf8"), readFileSync(join(repo, "skills", "sdlc", "references", "phase-plan.md"), "utf8"), readFileSync(join(repo, "skills", "sdlc", "references", "system-reference.md"), "utf8")];
	// Windows are taken on the raw source, so regex bodies count too.
	for (let i = 0; i + 80 <= testSource.length; i++) {
		const window = testSource.slice(i, i + 80);
		for (const doc of governed) {
			assert.ok(!doc.includes(window), `restated governed text at test offset ${i}: ${window.slice(0, 40)}...`);
		}
	}
});

// The three window-scoped GPC11 branch-relative tests (manifest/scripts/
// fixture drift vs merge-base) were deleted post-merge per the PR #240 body
// obligation: diff-scoped premises expire at merge (S1-AM4 pattern; #208).
// GPC11's C8 bound stays enforced by the current-tree GPC10 tests above and
// by the PR-gate scope inspection (GPC15).
