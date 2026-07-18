// ASD16 (DoD 12): every answer of the §5 source-free comprehension checklist is
// derivable from documentation alone (SKILL.md + references + ADRs), reading no
// implementation file; and no reference/doc claims that implementation work
// itself can avoid source inspection. Offline; no model calls.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skillDir = join(repo, "skills", "sdlc");

// The documentation corpus: SKILL.md + on-demand references only. Explicitly NOT
// any implementation file (scripts/*.mjs, *.sh) or schema.
const docCorpus = (() => {
	const parts = [readFileSync(join(skillDir, "SKILL.md"), "utf8")];
	const refDir = join(skillDir, "references");
	for (const f of readdirSync(refDir).filter((n) => n.endsWith(".md"))) {
		parts.push(readFileSync(join(refDir, f), "utf8"));
	}
	return parts.join("\n\n");
})();

// Each §5 checklist question, answered by a phrase that must appear in the docs.
const CHECKLIST = {
	"purpose (what pi-sdlc is)": /portable, project-agnostic software-development lifecycle skill/i,
	"kernel + two tracks": /two tracks|Irreversible|Reversible/,
	"adoption & readiness": /adopted.*HEAD|current `HEAD` commit contains/,
	"tracks/phases/transitions/gates/refusal": /brainstorm .*plan .*spec .*build .*implement/is,
	"public composition inventory": /package-public|Public composition inventory/,
	"configuration & extension surfaces": /sdlc\.config\.json[\s\S]*CONFIG\.md/,
	"artifacts & durable evidence": /Artifacts & durable evidence|validation receipts?/i,
	"full lifecycle + standalone entrypoints": /standalone entrypoints?/i,
	"advanced modes": /map mode|tracker-backed/i,
	"next-read routing": /Canonical answer|authority map/i,
};

test("ASD16: every §5 checklist answer is derivable from docs alone", () => {
	for (const [q, re] of Object.entries(CHECKLIST)) {
		assert.match(docCorpus, re, `checklist item not answerable from docs: ${q}`);
	}
});

test("ASD16: docs state the source-inspection boundary (source only when changing implementation)", () => {
	const sysRef = readFileSync(join(skillDir, "references", "system-reference.md"), "utf8");
	assert.match(sysRef, /only when changing[\s\S]*implementation/i);
	assert.match(sysRef, /Implementation work itself[\s\S]*require source inspection/i);
});

test("ASD16 (non-vacuous): no doc claims implementation work can avoid source inspection", () => {
	// A doc must never tell an implementer they can skip reading source.
	const forbidden = [/without reading (?:the )?source (?:code )?(?:when|while) implementing/i, /implementation .* without (?:reading|opening) source/i, /no need to read source .* implement/i];
	for (const re of forbidden) {
		assert.doesNotMatch(docCorpus, re, `a doc wrongly claims implementation can avoid source inspection: ${re}`);
	}
});
