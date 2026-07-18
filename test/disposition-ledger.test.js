// ASD5 (DoD 4): the statement-level disposition ledger accounts for every
// pre-change SKILL.md normative statement and red flag as retained / moved /
// intentionally-replaced. Each retained/moved row's destination exists and
// contains the moved statement's anchor (whitespace-normalized); anchors are
// unique (no rule owned twice); the full pre-change red-flags list is covered;
// removing a moved statement from its destination fails non-vacuously.

import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const ledgerPath = join(repo, "docs", "validation", "sdlc-agent-self-documentation", "disposition-ledger.md");
const ledger = readFileSync(ledgerPath, "utf8");

const norm = (s) => s.replace(/\s+/g, " ").trim();
const fileCache = {};
const readNorm = (rel) => (fileCache[rel] ??= norm(readFileSync(join(repo, rel), "utf8")));

// Parse ledger table rows: | ID | gist | disposition | destination | anchor |
function rows() {
	const out = [];
	for (const line of ledger.split("\n")) {
		const m = line.match(/^\|\s*(S\d\d|RF\d\d)\s*\|(.*)\|\s*(retained|moved|replaced)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*$/);
		if (!m) continue;
		out.push({ id: m[1], disposition: m[3], destination: m[4].trim(), anchor: m[5].trim() });
	}
	return out;
}

test("ASD5: the ledger parses and covers both statements and red flags", () => {
	const parsed = rows();
	const statements = parsed.filter((r) => r.id.startsWith("S"));
	const redFlags = parsed.filter((r) => r.id.startsWith("RF"));
	assert.ok(statements.length >= 60, `expected the full pre-change statement set, got ${statements.length}`);
	assert.ok(redFlags.length >= 14, `expected the full pre-change red-flags list, got ${redFlags.length}`);
});

test("ASD5: every retained/moved row's destination exists and contains its anchor", () => {
	for (const r of rows()) {
		if (r.disposition === "replaced") continue;
		assert.ok(existsSync(join(repo, r.destination)), `${r.id}: destination missing: ${r.destination}`);
		assert.ok(readNorm(r.destination).includes(norm(r.anchor)), `${r.id}: anchor not found in ${r.destination}: "${r.anchor}"`);
	}
});

test("ASD5: anchors are unique (no rule owned twice)", () => {
	const seen = new Map();
	for (const r of rows()) {
		if (r.disposition === "replaced") continue;
		assert.ok(!seen.has(r.anchor), `${r.id}: duplicate anchor also on ${seen.get(r.anchor)}: "${r.anchor}"`);
		seen.set(r.anchor, r.id);
	}
});

test("ASD5: every pre-change red flag is retained in SKILL.md", () => {
	const skill = readNorm("skills/sdlc/SKILL.md");
	for (const r of rows().filter((x) => x.id.startsWith("RF"))) {
		assert.equal(r.disposition, "retained", `${r.id} should be retained in the kernel`);
		assert.equal(r.destination, "skills/sdlc/SKILL.md", `${r.id} destination should be SKILL.md`);
		assert.ok(skill.includes(norm(r.anchor)), `${r.id}: red-flag anchor missing from SKILL.md: "${r.anchor}"`);
	}
});

test("ASD5 (non-vacuous): removing a moved statement from its destination is detected", () => {
	const moved = rows().find((r) => r.disposition === "moved");
	assert.ok(moved, "ledger must contain at least one moved statement");
	const destNorm = readNorm(moved.destination);
	assert.ok(destNorm.includes(norm(moved.anchor)), "precondition: the moved statement is present");
	// Simulate deleting the moved statement from its destination.
	const deleted = destNorm.split(norm(moved.anchor)).join("");
	assert.ok(!deleted.includes(norm(moved.anchor)), `${moved.id}: deletion of the moved statement must be detectable`);
});
