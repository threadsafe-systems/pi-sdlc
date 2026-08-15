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
