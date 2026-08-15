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

// ---- M3/M4: the plan-review prompt's structure and anchors ----------------

const prompt = readFileSync(join(repo, "skills/sdlc/prompts/adversary-plan.prompt.md"), "utf8");

// The per-letter coverage map: each attack surface names exactly these
// skeleton sections in its anchor sentence.
const COVERAGE = {
	A: ["Definition of done", "Carried to"],
	B: ["Problem statement", "Outcome proof"],
	C: ["Objectives and scope", "Non-goals", "Context for the next agent"],
	D: ["Brainstorm provenance", "Alternatives considered"],
	E: ["Non-functional requirements & repo-doc sweep", "Pre-mortem"],
};

const SKELETON_PATH = "references/plan-artifact-skeleton.md";

/** The attack-surface segments: letter marker to the next letter or the carry-landing paragraph. */
function surfaceSegments(source) {
	const lines = source.split("\n");
	const segments = {};
	let current = null;
	for (const line of lines) {
		const m = line.match(/^([A-Z])\. /);
		if (m) {
			current = m[1];
			segments[current] = line;
			continue;
		}
		if (current && line.startsWith("**Carry landing")) current = null;
		else if (current) segments[current] += `\n${line}`;
	}
	return segments;
}

test("M3: exactly six attack-surface markers A. through F., in order", () => {
	const letters = [...prompt.matchAll(/^([A-Z])\. /gm)].map((m) => m[1]);
	assert.deepEqual(letters, ["A", "B", "C", "D", "E", "F"], "adversary-plan.prompt.md: the attack-surface letter set must be exactly A-F in order");
});

/** The sentence carrying the skeleton citation: terminator-bounded on both sides, null when unterminated. */
function anchorSentence(segment) {
	const cite = segment.indexOf(SKELETON_PATH);
	if (cite === -1) return null;
	const head = segment.slice(0, cite);
	const start = Math.max(head.lastIndexOf(". "), head.lastIndexOf("? "), head.lastIndexOf("! "));
	const tail = segment.slice(cite + SKELETON_PATH.length);
	const close = tail.search(/[.?!](\s|$)/);
	if (close === -1) return null;
	return segment.slice(start === -1 ? 0 : start + 2, cite + SKELETON_PATH.length + close + 1);
}

test("M3: exactly one anchor inside each of A-E with the pinned coverage map; F untouched", () => {
	const segments = surfaceSegments(prompt);
	for (const [letter, names] of Object.entries(COVERAGE)) {
		const segment = segments[letter];
		assert.ok(segment, `adversary-plan.prompt.md: attack surface ${letter} not found`);
		const anchors = segment.split(SKELETON_PATH).length - 1;
		assert.equal(anchors, 1, `adversary-plan.prompt.md: surface ${letter} must cite the skeleton path exactly once`);
		const sentence = anchorSentence(segment);
		assert.ok(sentence, `adversary-plan.prompt.md: surface ${letter}'s anchor sentence must end with a sentence terminator`);
		for (const name of names) {
			assert.ok(sentence.includes(name), `adversary-plan.prompt.md: surface ${letter}'s anchor sentence must name ${JSON.stringify(name)}`);
		}
	}
	assert.ok(!segments.F.includes(SKELETON_PATH), "adversary-plan.prompt.md: surface F carries no anchor");
});

test("M3: the carry-landing decision paragraph is present", () => {
	assert.ok(prompt.includes("**Carry landing: none applies here, by decision.**"), "adversary-plan.prompt.md: the carry-landing decision paragraph must remain");
});

// The byte-pinned sections: any edit inside them is a contract break. The
// expectations are embedded here so a tampered copy cannot pass its own pin.
const L1_DELTA_ROUNDS = `## Delta rounds

Round 1 reviews the whole plan. **Every round after the first is a delta review.** The caller gives you the prior rounds' findings and their dispositions, and your review is scoped to the delta since the previous round. Tag every finding \`NEW\`, or \`REOPENED(<prior-id>)\` when you re-raise an already-dispositioned finding by its id. A reopen is legal only when you cite evidence that did not exist, or was not available, when that finding was dispositioned; otherwise do not re-raise it. Confirming a prior fix is one line, not a re-litigation.`;

const L2_OUTPUT_FORMAT = `## Output format (STRICT: markdown only, findings only, no preamble, no conclusion)

### <short title>

- severity: high | medium | low
- confidence: high | medium (drop anything lower; do not speculate)
- origin: NEW | REOPENED(<prior-id>)
- location: <plan section or line>
- defect: <one or two sentences: the concrete problem>
- evidence: <what you verified: quoted plan text, or file:line in the repo>
- impact: <why it matters: what freezes wrong, what cannot be verified, what will bite>
- fix: <one sentence: the minimal plan change>

Rank most-severe first. For each attack surface A to F where you found nothing, emit one line: \`CLEAR: <letter> — <one-line reason>\`. Prefer a few high-confidence, evidence-backed findings over a long speculative list. Every finding must be concrete enough to act on without asking you anything.`;

test("M3: the Delta rounds section is byte-identical to its pinned block", () => {
	const start = prompt.indexOf("## Delta rounds");
	const end = prompt.indexOf("## Output format");
	assert.ok(start !== -1 && end > start, "adversary-plan.prompt.md: Delta rounds and Output format headings must both exist, in order");
	assert.equal(prompt.slice(start, end).replace(/\n+$/, ""), L1_DELTA_ROUNDS, "adversary-plan.prompt.md: the Delta rounds section must match its pinned block byte-for-byte");
});

test("M3: the output-format section is byte-identical to its pinned block", () => {
	const start = prompt.indexOf("## Output format");
	assert.ok(start !== -1, "adversary-plan.prompt.md: Output format heading must exist");
	assert.equal(prompt.slice(start).replace(/\n+$/, ""), L2_OUTPUT_FORMAT, "adversary-plan.prompt.md: the output-format section must match its pinned block byte-for-byte");
});

test("M4: no canonical rule sentence appears in the prompt", () => {
	for (const sentence of CANONICAL) {
		assert.ok(!prompt.includes(sentence), `adversary-plan.prompt.md: canonical rule sentence must not be restated: ${sentence.slice(0, 60)}...`);
	}
});

// ---- M6/M7: the unfreeze window (deleted by the post-merge re-freeze) -----

// The expected FROZEN membership while the plan prompt is deliberately
// unfrozen: the standing list minus that one entry, order preserved.
const FROZEN_WINDOW = [
	"skills/sdlc/scripts/sdlc-status.mjs",
	"skills/sdlc/scripts/sdlc-status.sh",
	"skills/sdlc/scripts/check-lifecycle.mjs",
	"skills/sdlc/scripts/check-lifecycle.sh",
	"skills/sdlc/scripts/lib.mjs",
	"skills/sdlc/schema/sdlc.config.schema.json",
	"skills/sdlc/schema/sdlc.config.example.json",
	"skills/sdlc/schema/task-validation-manifest.schema.json",
	"skills/sdlc/scripts/resolve-panel.mjs",
	"skills/sdlc/scripts/resolve-panel.sh",
	"skills/sdlc/scripts/validate-task.mjs",
	"skills/sdlc/scripts/validate-task.sh",
	"skills/sdlc/scripts/verify-task-receipt.mjs",
	"skills/sdlc/prompts/adversary-spec.prompt.md",
	"skills/sdlc/prompts/adversary-review.prompt.md",
	"skills/sdlc/prompts/validator-task.prompt.md",
];

test("M6: the FROZEN array is exactly the 16-entry window list, in order", () => {
	const body = readFileSync(join(repo, "test/frozen-surfaces.test.js"), "utf8");
	const frozen = [...body.matchAll(/^\t"([^"]+)",$/gm)].map((m) => m[1]);
	assert.deepEqual(frozen, FROZEN_WINDOW, "frozen-surfaces.test.js: FROZEN must equal the pinned window list exactly (16 entries, order preserved, plan prompt absent)");
});

test("M7: the IDV19 reconciliation is minimal", () => {
	const body = readFileSync(join(repo, "test/iteration-disposition.test.js"), "utf8");
	assert.ok(body.includes('const ADVERSARY_PROMPTS = ["plan", "spec", "review"];'), "iteration-disposition.test.js: the ADVERSARY_PROMPTS constant must stay the full literal");
	const filtered = [...body.matchAll(/ADVERSARY_PROMPTS\.filter\(/g)];
	assert.equal(filtered.length, 1, "iteration-disposition.test.js: exactly one filtered use of ADVERSARY_PROMPTS (the IDV19 loop)");
	assert.ok(body.includes('ADVERSARY_PROMPTS.filter((s) => s !== "plan")'), "iteration-disposition.test.js: the IDV19 filter must exempt exactly the plan slug");
	const unfiltered = [...body.matchAll(/for \(const slug of ADVERSARY_PROMPTS\) \{/g)];
	assert.equal(unfiltered.length, 2, "iteration-disposition.test.js: the two sibling loops must iterate ADVERSARY_PROMPTS unfiltered");
	assert.ok(body.includes('frozen.includes("skills/sdlc/prompts/validator-task.prompt.md")'), "iteration-disposition.test.js: IDV19's validator-task assertion must remain");
	const idv19 = body.slice(body.indexOf('test("IDV19:'));
	assert.match(idv19, /spec AM1\/AM3/, "iteration-disposition.test.js: the exemption comment must cite the unfreeze and re-freeze record");
	assert.match(idv19, /re-freeze restores the unfiltered loop/, "iteration-disposition.test.js: the exemption comment must state the restoration obligation");
});

test("M8: the skeleton mandates no tooling", () => {
	for (const denied of ["Cucumber", "Behat", "Gherkin", "linter", "CI check"]) {
		assert.ok(!skeleton.includes(denied), `plan-artifact-skeleton.md: denied substring present: ${denied}`);
	}
	assert.ok(skeleton.includes("The skeleton is authoring guidance, not mechanical prevention."), "plan-artifact-skeleton.md: the guidance sentence must be present");
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
