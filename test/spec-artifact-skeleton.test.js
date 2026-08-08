// Contract tests for the S1 spec artifact skeleton. Offline string
// assertions over the markdown/test surfaces; no subprocess, model, or
// network calls. Marker sets M1-M8 mirror spec C7.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

const skeleton = readFileSync(join(repo, "skills/sdlc/references/spec-artifact-skeleton.md"), "utf8");

// The four canonical rule sentences fixed by spec C2. The skeleton carries
// each inside its owning section; the prompt must never carry them (M4).
const CANONICAL = [
	"every coined term used two or more times in the body appears in the Vocabulary table, and every term in the table appears in the body",
	"every interface this change introduces or modifies has a Contracts block (interfaces mentioned only as unchanged context do not, and must not be silently re-described)",
	"every scenario carries exactly one kind label and the mechanical/total ratio is readable off the spec",
	"every NFR has a response measure and a binding scenario id, or the literal marker `unbound — accepted at gate` with a reason",
];

const SECTIONS = ["Vocabulary", "Contracts", "Scenario kind labels", "Non-functional requirements", "Scenario form"];

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
	assert.ok(sections[owner].includes(marker), `spec-artifact-skeleton.md: marker ${JSON.stringify(marker)} missing from section "## ${owner}"`);
	const others = [preamble, ...SECTIONS.filter((s) => s !== owner).map((s) => sections[s] ?? "")].join("\n");
	assert.ok(!others.includes(marker), `spec-artifact-skeleton.md: marker ${JSON.stringify(marker)} appears outside its owning section "## ${owner}"`);
}

test("M1: skeleton H1 is exact", () => {
	assert.ok(skeleton.startsWith("# Spec artifact skeleton\n"), "spec-artifact-skeleton.md: H1 must be exactly '# Spec artifact skeleton'");
});

test("M1: section set is exactly the five components, in fixed order, no extras", () => {
	assert.deepEqual(order, SECTIONS, "spec-artifact-skeleton.md: the complete '## ' section set must be exactly the five components in the fixed order");
});

test("M1: Vocabulary markers are section-local", () => {
	inSectionOnly("| Term | Definition | Binds to |", "Vocabulary");
	inSectionOnly("| <term> | <one-sentence definition> | <identifier or file> |", "Vocabulary");
	inSectionOnly("<term>", "Vocabulary");
	inSectionOnly("<one-sentence definition>", "Vocabulary");
	inSectionOnly("<identifier or file>", "Vocabulary");
});

test("M1: Contracts markers are section-local", () => {
	inSectionOnly("### <interface name>", "Contracts");
	inSectionOnly("<interface name>", "Contracts");
	for (const bullet of ["- Signature/shape:", "- Preconditions:", "- Postconditions:", "- Invariants:", "- Error semantics:", "- Gated by:"]) {
		inSectionOnly(bullet, "Contracts");
	}
});

test("M1: kind-label markers are section-local", () => {
	for (const label of ["`mechanical`", "`inspection`", "`carried`"]) {
		inSectionOnly(label, "Scenario kind labels");
	}
});

test("M1: NFR markers are section-local", () => {
	inSectionOnly("| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |", "Non-functional requirements");
	inSectionOnly("unbound — accepted at gate", "Non-functional requirements");
});

test("M1: scenario-form markers are section-local", () => {
	for (const part of ["`Given:`", "`When–Then:`", "`Falsify:`"]) {
		inSectionOnly(part, "Scenario form");
	}
	inSectionOnly("`Given: none`", "Scenario form");
});

test("M1: the four canonical rule sentences sit in their owning sections", () => {
	const owners = ["Vocabulary", "Contracts", "Scenario kind labels", "Non-functional requirements"];
	CANONICAL.forEach((sentence, i) => {
		inSectionOnly(sentence, owners[i]);
	});
});

test("M5: inventory row matches C4's nine fields exactly", () => {
	const inventory = JSON.parse(readFileSync(join(repo, "skills/sdlc/assets/normative-references.json"), "utf8"));
	assert.equal(inventory.sources.length, 81, "normative-references.json: expected exactly 81 source rows");
	const row = inventory.sources.find((r) => r.id === "reference.spec-artifact-skeleton");
	assert.ok(row, "normative-references.json: row reference.spec-artifact-skeleton missing");
	assert.deepEqual(row, {
		id: "reference.spec-artifact-skeleton",
		source: "skills/sdlc/references/spec-artifact-skeleton.md",
		assertion: "# Spec artifact skeleton",
		targetKind: "file",
		ownership: "package",
		required: true,
		resolution: "package",
		target: "skills/sdlc/references/spec-artifact-skeleton.md",
		class: "package-public",
	});
	assert.ok(!("verification" in row), "normative-references.json: row reference.spec-artifact-skeleton must not carry the optional verification key");
});

// ---- M2: phase-spec.md §4 binding rules (C2) -----------------------------

const phaseSpec = readFileSync(join(repo, "skills/sdlc/references/phase-spec.md"), "utf8");

function section4(source) {
	const head = source.match(/^## 4\. /m);
	assert.ok(head, "phase-spec.md: heading '## 4.' not found");
	const rest = source.slice(source.indexOf("\n", head.index) + 1);
	const next = rest.match(/^## /m);
	return next ? rest.slice(0, next.index) : rest;
}

const s4 = section4(phaseSpec);

test("M2: §4's first paragraph still begins 'Produce the Spec doc:'", () => {
	assert.ok(s4.trimStart().startsWith("Produce the Spec doc:"), "phase-spec.md §4: first paragraph must still begin 'Produce the Spec doc:'");
});

test("M2: the numbered binding rules sit between §4's first paragraph and Premise durability", () => {
	const premiseIdx = s4.indexOf("**Premise durability.**");
	assert.ok(premiseIdx > 0, "phase-spec.md §4: '**Premise durability.**' paragraph not found");
	const region = s4.slice(s4.indexOf("Produce the Spec doc:"), premiseIdx);
	const ruleLines = CANONICAL.map((sentence, i) => `${i + 1}. ${sentence}`);
	let cursor = 0;
	for (const line of ruleLines) {
		const idx = region.indexOf(line);
		assert.ok(idx !== -1, `phase-spec.md §4: numbered binding rule missing: ${JSON.stringify(line.slice(0, 40))}...`);
		assert.ok(idx > cursor, `phase-spec.md §4: binding rule out of order: ${JSON.stringify(line.slice(0, 40))}...`);
		cursor = idx;
	}
	const defectIdx = region.indexOf("anything missing is a spec defect");
	assert.ok(defectIdx !== -1, "phase-spec.md §4: literal 'anything missing is a spec defect' missing");
	assert.ok(defectIdx > cursor, "phase-spec.md §4: 'anything missing is a spec defect' must follow the four numbered rules");
	const pointerIdx = region.indexOf("references/spec-artifact-skeleton.md");
	assert.ok(pointerIdx !== -1, "phase-spec.md §4: skeleton pointer 'references/spec-artifact-skeleton.md' missing");
	assert.ok(pointerIdx > defectIdx, "phase-spec.md §4: skeleton pointer must follow the defect sentence");
});

test("M2: the numbered rules open their own lines", () => {
	const lines = s4.split("\n");
	for (let i = 0; i < CANONICAL.length; i++) {
		const wanted = `${i + 1}. ${CANONICAL[i]}`;
		assert.ok(lines.includes(wanted), `phase-spec.md §4: rule ${i + 1} must open its own line verbatim`);
	}
});

test("M2: Premise durability, Dialogue discipline, configuration callout follow in order", () => {
	const anchors = ["**Premise durability.**", "**Dialogue discipline.**", "> **Under your configuration:**"];
	let cursor = 0;
	for (const anchor of anchors) {
		const idx = s4.indexOf(anchor);
		assert.ok(idx !== -1, `phase-spec.md §4: anchor missing: ${anchor}`);
		assert.ok(idx > cursor, `phase-spec.md §4: anchor out of order: ${anchor}`);
		// Each anchor still opens its paragraph: preceded by a blank line.
		assert.ok(idx >= 2 && s4.slice(idx - 2, idx) === "\n\n", `phase-spec.md §4: anchor must still begin its paragraph: ${anchor}`);
		cursor = idx;
	}
});

// ---- M3/M4: adversary-spec.prompt.md skeleton awareness (C3) ------------

const prompt = readFileSync(join(repo, "skills/sdlc/prompts/adversary-spec.prompt.md"), "utf8");

const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function surfaceLine(letter) {
	const m = prompt.match(new RegExp(`^${letter}\\. `, "m"));
	assert.ok(m, `adversary-spec.prompt.md: surface ${letter}. missing`);
	return prompt.slice(m.index, prompt.indexOf("\n", m.index));
}

test("M3: exactly eight attack surfaces A-H in order, no letter beyond H", () => {
	const heads = [...prompt.matchAll(/^([A-Z])\. /gm)].map((m) => m[1]);
	assert.deepEqual(heads, LETTERS, "adversary-spec.prompt.md: attack surfaces must be exactly A-H in order");
});

test("M3: the B/C/D/F anchors cite the skeleton path inside their surface lines", () => {
	for (const letter of ["B", "C", "D", "F"]) {
		assert.ok(surfaceLine(letter).includes("references/spec-artifact-skeleton.md"), `adversary-spec.prompt.md: surface ${letter} anchor must cite references/spec-artifact-skeleton.md`);
	}
});

test("M3: the four anchors together name all five skeleton components", () => {
	const coverage = {
		Vocabulary: surfaceLine("D"),
		Contracts: surfaceLine("C"),
		"Scenario kind labels": surfaceLine("B"),
		"Non-functional requirements": surfaceLine("F"),
		"Scenario form": surfaceLine("B"),
	};
	for (const [component, line] of Object.entries(coverage)) {
		assert.ok(line.includes(component), `adversary-spec.prompt.md: component ${JSON.stringify(component)} not named in its anchor line`);
	}
});

const L1 = `## Delta rounds

Round 1 reviews the whole spec. **Every round after the first is a delta review.** The caller gives you the prior rounds' findings and their dispositions, and your review is scoped to the delta since the previous round. Tag every finding \`NEW\`, or \`REOPENED(<prior-id>)\` when you re-raise an already-dispositioned finding by its id. A reopen is legal only when you cite evidence that did not exist, or was not available, when that finding was dispositioned; otherwise do not re-raise it. Confirming a prior fix is one line, not a re-litigation.`;

const L2 = `## Output format (STRICT: markdown only, findings only, no preamble, no conclusion)

### <short title>

- severity: high | medium | low
- confidence: high | medium (drop anything lower; do not speculate)
- origin: NEW | REOPENED(<prior-id>)
- location: <spec section, or doc/file:line>
- defect: <one or two sentences: the concrete problem>
- evidence: <what you verified: quoted spec text, file:line in the repo, or framework file:line at the pinned version>
- impact: <why it matters: what freezes wrong, what test cannot gate, what claim is false>
- fix: <one sentence: the minimal spec change>

Rank most-severe first. For each attack surface A to H where you found nothing, emit one line: \`CLEAR: <letter> — <one-line reason>\`. Prefer a few high-confidence, evidence-backed findings over a long speculative list. Every finding must be concrete enough that the spec author could act on it without asking you anything.`;

test("M3: Delta rounds section byte-identical to pinned block L1", () => {
	const start = prompt.indexOf("## Delta rounds");
	const end = prompt.indexOf("## Output format");
	assert.ok(start !== -1 && end !== -1 && start < end, "adversary-spec.prompt.md: Delta rounds / Output format headings missing or misordered");
	assert.equal(prompt.slice(start, end).replace(/\s+$/, ""), L1, "adversary-spec.prompt.md: Delta rounds section drifted from pinned block L1");
});

test("M3: output-format section byte-identical to pinned block L2", () => {
	const start = prompt.indexOf("## Output format");
	assert.ok(start !== -1, "adversary-spec.prompt.md: Output format heading missing");
	assert.equal(prompt.slice(start).replace(/\n+$/, ""), L2, "adversary-spec.prompt.md: output-format section drifted from pinned block L2");
});

test("M4: none of the four canonical rule sentences appears in the prompt", () => {
	for (const sentence of CANONICAL) {
		assert.ok(!prompt.includes(sentence), `adversary-spec.prompt.md: canonical rule sentence restated (reference-never-restate): ${JSON.stringify(sentence.slice(0, 60))}...`);
	}
});
