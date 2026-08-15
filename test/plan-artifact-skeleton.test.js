// Contract tests for the plan artifact skeleton and the surfaces bound to
// it. Offline string assertions over markdown/JSON/test sources; no
// subprocess, model, or network calls.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

const skeleton = readFileSync(join(repo, "skills/sdlc/references/plan-artifact-skeleton.md"), "utf8");

// The five canonical rule sentences fixed by the plan-phase binding rules.
// The skeleton carries each inside its owning section.
const CANONICAL = [
	"the problem statement names an actor, observable baseline evidence, and a consequence, and contains no implementation prescription",
	"every in-scope item carries exactly one boundary label (`objective` | `constraint` | `solution decision`) and every parked item names its destination",
	"every objective has an outcome-proof row — a metric with baseline, target/window, and an evidence owner, or a cited proxy/no-measurement rationale — and the row names its Spec or retro landing site",
	"every NFR/repo-doc sweep row carries applicability with its reason, target, binding phase, and verification, or `n/a` with a technical reason",
	"every pre-mortem row carries trigger, consequence, mitigation, owner, and destination; only small reversible work may instead declare the block's zero state, with a one-line reason",
];

const SECTIONS = ["Brainstorm provenance", "Problem statement", "Non-goals", "Alternatives considered", "Objectives and scope", "Outcome proof", "Non-functional requirements & repo-doc sweep", "Pre-mortem", "Definition of done", "Context for the next agent"];

function splitSections(source) {
	const headers = [...source.matchAll(/^## (.+)$/gm)];
	const preamble = source.slice(0, headers.length ? headers[0].index : source.length);
	const sections = {};
	for (let i = 0; i < headers.length; i++) {
		const start = headers[i].index + headers[i][0].length;
		const end = i + 1 < headers.length ? headers[i + 1].index : source.length;
		sections[headers[i][1]] = source.slice(start, end);
	}
	return { preamble, sections, order: headers.map((m) => m[1]) };
}

const { preamble, sections, order } = splitSections(skeleton);

function inSectionOnly(marker, owner) {
	assert.ok(sections[owner]?.includes(marker), `plan-artifact-skeleton.md: marker ${JSON.stringify(marker)} missing from section "## ${owner}"`);
	const others = [preamble, ...SECTIONS.filter((s) => s !== owner).map((s) => sections[s] ?? "")].join("\n");
	assert.ok(!others.includes(marker), `plan-artifact-skeleton.md: marker ${JSON.stringify(marker)} appears outside its owning section "## ${owner}"`);
}

function inPreambleOnly(marker) {
	assert.ok(preamble.includes(marker), `plan-artifact-skeleton.md: intro-law marker ${JSON.stringify(marker)} missing from the preamble`);
	const others = SECTIONS.map((s) => sections[s] ?? "").join("\n");
	assert.ok(!others.includes(marker), `plan-artifact-skeleton.md: intro-law marker ${JSON.stringify(marker)} appears outside the preamble`);
}

test("M1: skeleton H1 is exact", () => {
	assert.ok(skeleton.startsWith("# Plan artifact skeleton\n"), "plan-artifact-skeleton.md: H1 must be exactly '# Plan artifact skeleton'");
});

test("M1: section set is exactly the ten components, in fixed order, no extras", () => {
	assert.deepEqual(order, SECTIONS, "plan-artifact-skeleton.md: the complete '## ' section set must be exactly the ten components in the fixed order");
});

test("M1: intro law carries the zero-state marker and the guidance sentence", () => {
	inPreambleOnly("`none — <one-line reason>`");
	inPreambleOnly("The skeleton is authoring guidance, not mechanical prevention.");
});

test("M1: Brainstorm provenance markers are section-local", () => {
	inSectionOnly("<sketch and decisions list, stored per the storage rule — or: no upstream gate>", "Brainstorm provenance");
});

test("M1: Problem statement markers are section-local", () => {
	inSectionOnly("- Actor/situation: <who hits this, in what situation>", "Problem statement");
	inSectionOnly("- Baseline evidence: <observable evidence of the status quo>", "Problem statement");
	inSectionOnly("- Consequence: <the cost of leaving it unsolved>", "Problem statement");
});

test("M1: Non-goals marker is section-local", () => {
	inSectionOnly("- <outcome deliberately not pursued> — <one-line reason>", "Non-goals");
});

test("M1: Alternatives considered marker is section-local", () => {
	inSectionOnly("- <alternative, including doing nothing> — <trade-off reason it was rejected>", "Alternatives considered");
});

test("M1: Objectives and scope markers are section-local", () => {
	inSectionOnly("- [objective] <in-scope item>", "Objectives and scope");
	inSectionOnly("- [constraint] <in-scope item>", "Objectives and scope");
	inSectionOnly("- [solution decision] <in-scope item>", "Objectives and scope");
	inSectionOnly("- parked: <item> — destination: <Spec, Build, a tracker issue, or a backward transition>", "Objectives and scope");
});

test("M1: Outcome proof markers are section-local", () => {
	inSectionOnly("| Goal | Question | Metric | Baseline | Target/window | Evidence owner | Carried to |", "Outcome proof");
	inSectionOnly("| <goal> | <question> | <metric, a proxy, or: no measurement — <reason>> | <baseline> | <target and window> | <owner> | <Spec scenario/NFR id, or retro> |", "Outcome proof");
});

test("M1: sweep markers are section-local and the minimum areas are named", () => {
	inSectionOnly("| Area | Applicability + reason | Target | Binding phase | Verification |", "Non-functional requirements & repo-doc sweep");
	inSectionOnly("| <area> | <applies or n/a — <technical reason>> | <target> | <Spec, Build, Implement, or PR> | <how it will be verified> |", "Non-functional requirements & repo-doc sweep");
	for (const area of ["AGENTS.md", "README", "observability", "secret delivery", "CI/CD", "ISO 25010"]) {
		assert.ok(sections["Non-functional requirements & repo-doc sweep"].includes(area), `plan-artifact-skeleton.md: sweep minimum area ${JSON.stringify(area)} missing`);
	}
});

test("M1: Pre-mortem markers are section-local", () => {
	inSectionOnly("| Risk | Trigger | Consequence | Mitigation | Owner | Destination |", "Pre-mortem");
	inSectionOnly("| <risk or failed future> | <trigger> | <consequence> | <mitigation> | <owner> | <destination> |", "Pre-mortem");
});

test("M1: Definition of done marker is section-local", () => {
	inSectionOnly("- <falsifiable completion item>", "Definition of done");
});

test("M1: Context for the next agent marker is section-local", () => {
	inSectionOnly("- <context the next agent needs; parked questions land here, each with its destination>", "Context for the next agent");
});

test("M1: each canonical rule sentence sits inside its owning section", () => {
	const owners = ["Problem statement", "Objectives and scope", "Outcome proof", "Non-functional requirements & repo-doc sweep", "Pre-mortem"];
	for (let i = 0; i < CANONICAL.length; i++) inSectionOnly(CANONICAL[i], owners[i]);
});

// ---- M2: phase-plan.md §4 binding rules and the surviving clause ---------

const phasePlan = readFileSync(join(repo, "skills/sdlc/references/phase-plan.md"), "utf8");

function section4(source) {
	const head = source.match(/^## 4\. /m);
	assert.ok(head, "phase-plan.md: heading '## 4.' not found");
	const rest = source.slice(source.indexOf("\n", head.index) + 1);
	const next = rest.match(/^## /m);
	return next ? rest.slice(0, next.index) : rest;
}

const s4 = section4(phasePlan);
const s4flat = s4.replace(/\s+/g, " ");

test("M2: §4's first paragraph still begins 'Produce the Plan doc:'", () => {
	assert.ok(s4.trimStart().startsWith("Produce the Plan doc:"), "phase-plan.md §4: first paragraph must still begin 'Produce the Plan doc:'");
});

test("M2: the inserted block sits immediately after §4's first paragraph", () => {
	// The contiguous inserted region, enforced as blank-line-separated blocks
	// in order: first paragraph, rules lead-in, the five numbered rule lines,
	// defect sentence + pointer, Brainstorm provenance storage. Any paragraph
	// inserted between consecutive pairs fails this.
	const blocks = s4
		.split(/\n\s*\n/)
		.map((b) => b.trim())
		.filter(Boolean);
	const firstIdx = blocks.findIndex((b) => b.startsWith("Produce the Plan doc:"));
	assert.ok(firstIdx !== -1, "phase-plan.md §4: first paragraph block not found");
	const lead = blocks[firstIdx + 1];
	assert.ok(lead?.startsWith("Author the Plan against the fixed skeleton"), "phase-plan.md §4: the rules lead-in must be the block immediately after the first paragraph");
	const list = blocks[firstIdx + 2];
	assert.equal(list, CANONICAL.map((sentence, i) => `${i + 1}. ${sentence}`).join("\n"), "phase-plan.md §4: the block after the lead-in must be exactly the five numbered rule lines");
	const closing = blocks[firstIdx + 3];
	assert.ok(closing?.startsWith("The gate refuses"), "phase-plan.md §4: the defect sentence block must immediately follow the numbered rules");
	assert.ok(closing.includes("anything missing is a plan defect"), "phase-plan.md §4: literal 'anything missing is a plan defect' missing");
	assert.ok(closing.includes("references/plan-artifact-skeleton.md"), "phase-plan.md §4: skeleton pointer 'references/plan-artifact-skeleton.md' missing");
	const provenance = blocks[firstIdx + 4];
	assert.ok(provenance?.startsWith("**Brainstorm provenance storage.**"), "phase-plan.md §4: Brainstorm provenance storage must immediately follow the inserted block");
});

test("M2: the numbered rules open their own lines", () => {
	const lines = s4.split("\n");
	for (let i = 0; i < CANONICAL.length; i++) {
		const wanted = `${i + 1}. ${CANONICAL[i]}`;
		assert.ok(lines.includes(wanted), `phase-plan.md §4: rule ${i + 1} must open its own line verbatim`);
	}
});

test("M2: provenance storage, Dialogue discipline, configuration callout follow in order", () => {
	const anchors = ["**Brainstorm provenance storage.**", "**Dialogue discipline.**", "> **Under your configuration:**"];
	let cursor = 0;
	for (const anchor of anchors) {
		const idx = s4.indexOf(anchor);
		assert.ok(idx !== -1, `phase-plan.md §4: anchor missing: ${anchor}`);
		assert.ok(idx > cursor, `phase-plan.md §4: anchor out of order: ${anchor}`);
		cursor = idx;
	}
});

test("M2: the provenance paragraph carries the surviving clause, not the superseded one", () => {
	assert.match(s4flat, /the prompt changes only under the deliberate-change discipline: a recorded unfreeze with a mandatory re-freeze, and only with skeleton-awareness anchors/, "phase-plan.md §4: surviving-rule clause missing from the provenance paragraph");
	assert.ok(!s4flat.includes("the prompt itself stays untouched"), "phase-plan.md §4: the superseded clause must be gone");
	assert.match(s4flat, /routes by reference to the frozen adversary plan prompt's attack surface D/, "phase-plan.md §4: adjudication routing by reference to attack surface D must survive");
});

test("M5: the inventory row matches all nine fields exactly, no verification key, 82 rows", () => {
	const inventory = JSON.parse(readFileSync(join(repo, "skills/sdlc/assets/normative-references.json"), "utf8"));
	assert.equal(inventory.sources.length, 82, "normative-references.json: expected exactly 82 source rows");
	const row = inventory.sources.find((s) => s.id === "reference.plan-artifact-skeleton");
	assert.ok(row, "normative-references.json: row reference.plan-artifact-skeleton is missing");
	assert.ok(!("verification" in row), "normative-references.json: the row must not carry the optional verification key");
	assert.deepEqual(row, {
		id: "reference.plan-artifact-skeleton",
		source: "skills/sdlc/references/plan-artifact-skeleton.md",
		assertion: "# Plan artifact skeleton",
		targetKind: "file",
		ownership: "package",
		required: true,
		resolution: "package",
		target: "skills/sdlc/references/plan-artifact-skeleton.md",
		class: "package-public",
	});
});
