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
