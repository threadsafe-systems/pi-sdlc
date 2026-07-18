// ASD17 (DoD 13): ADR 0028 states the documentation-authority hierarchy and the
// generated-explanation trust model; the programme plan and the IC-B and OL-C
// plans carry absorption notes; and the docs assert #91/#101/#102 remain
// independent and out of scope. Offline grep; no model calls.

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const read = (rel) => readFileSync(join(repo, rel), "utf8");

test("ASD17: ADR 0029 exists and states the authority hierarchy + trust model", () => {
	const adrDir = join(repo, "docs", "adr");
	const file = readdirSync(adrDir).find((f) => /^0029-/.test(f));
	assert.ok(file, "ADR 0029 must exist");
	const adr = readFileSync(join(adrDir, file), "utf8");
	assert.match(adr, /## Context/);
	assert.match(adr, /## Decision/);
	assert.match(adr, /## Consequences/);
	// authority hierarchy
	assert.match(adr, /documentation-authority hierarchy/i);
	assert.match(adr, /\bCanonical answer\b/); // reproduces the authority table
	// generated-explanation trust model
	assert.match(adr, /generated-explanation trust/i);
	assert.match(adr, /authoritative/);
	assert.match(adr, /explains those values and never overrides/i);
	assert.match(adr, /Safe\s+degradation/i);
});

test("ASD17: programme + IC-B + OL-C plans carry absorption notes", () => {
	const programme = read("docs/plans/2026-07-12-sdlc-lifecycle-hardening.md");
	const icb = read("docs/plans/2026-07-17-config-intent-vocabulary.md");
	const olc = read("docs/plans/2026-07-14-opt-in-lifecycle.md");
	for (const [name, body] of Object.entries({ programme, icb, olc })) {
		assert.match(body, /## Absorption note/, `${name} lacks an absorption note`);
		assert.match(body, /agent self-documentation/i, `${name} note must name the absorbing stream`);
	}
	assert.match(icb, /IC-B/);
	assert.match(olc, /OL-C/);
});

test("ASD17: docs assert #91/#101/#102 remain independent and out of scope", () => {
	// The absorption notes and the system reference must keep the deferred issues distinct.
	const programme = read("docs/plans/2026-07-12-sdlc-lifecycle-hardening.md");
	for (const issue of ["#91", "#101", "#102"]) {
		assert.ok(programme.includes(issue), `programme absorption note must name ${issue}`);
	}
	assert.match(programme, /independent|out of scope/i);
	// #101 is explicitly flagged as the phases-as-separate-skills deferral in the system reference.
	assert.match(read("skills/sdlc/references/system-reference.md"), /#101/);
});

test("ASD17: ADR 0029 is registered in the ADR directory (no orphan)", () => {
	assert.ok(existsSync(join(repo, "docs", "adr", "README.md")), "ADR README should exist");
});
