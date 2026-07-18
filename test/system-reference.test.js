// ASD2 (DoD 2): the system reference answers the §5 source-free comprehension
// checklist. Every required section is present; deleting any one section fails
// non-vacuously (mutation removes it once, then the section-presence check must
// fail). Offline grep over committed docs; no model calls.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const sysRef = readFileSync(join(repo, "skills", "sdlc", "references", "system-reference.md"), "utf8");

// The §5 checklist, as stable section headings (11 required sections).
const SECTIONS = {
	"1. Purpose": /^## 1\. Purpose$/m,
	"2. Kernel": /^## 2\. Kernel/m,
	"3. Adoption & readiness": /^## 3\. Adoption & readiness$/m,
	"4. Tracks/phases/transitions/gates/refusal": /^## 4\. Tracks, phases, transitions, gates, refusal$/m,
	"5. Public composition inventory": /^## 5\. Public composition inventory/m,
	"6. Configuration & extension surfaces": /^## 6\. Configuration & extension surfaces$/m,
	"7. Artifacts & durable evidence": /^## 7\. Artifacts & durable evidence$/m,
	"8. Full lifecycle + standalone entrypoints": /^## 8\. Normal full-lifecycle operation and the six standalone entrypoints$/m,
	"9. Advanced modes": /^## 9\. Advanced modes$/m,
	"10. Troubleshooting + source-inspection boundary": /^## 10\. Operational troubleshooting and the source-inspection boundary$/m,
	"11. Next-read routing": /^## 11\. Next-read routing/m,
};

test("ASD2: system reference contains every §5 checklist section", () => {
	for (const [label, re] of Object.entries(SECTIONS)) {
		assert.match(sysRef, re, `system-reference.md missing section: ${label}`);
	}
});

test("ASD2 (non-vacuous): deleting any one section is detected", () => {
	for (const [label, re] of Object.entries(SECTIONS)) {
		const mutated = sysRef.replace(re, "## (removed)");
		assert.doesNotMatch(mutated, re, `mutation of section '${label}' must be detected (heading appears once)`);
	}
});

test("ASD2: §5 public-composition inventory narrates the six-class taxonomy", () => {
	for (const cls of ["package-public", "delegated", "runtime-tool", "consumer-integration", "optional-enhancement", "internal"]) {
		assert.ok(sysRef.includes(cls), `inventory narration missing taxonomy class: ${cls}`);
	}
	// the source-inspection boundary must be stated
	assert.match(sysRef, /source-inspection boundary/i);
});
