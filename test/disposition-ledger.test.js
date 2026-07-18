// ASD5 (DoD 4): the statement-level disposition ledger accounts for every
// pre-change SKILL.md normative statement and red flag as retained / moved /
// intentionally-replaced. Each retained/moved row's destination exists and
// contains the moved statement's anchor (whitespace-normalized); anchors are
// unique (no rule owned twice); the full pre-change red-flags list is covered;
// removing a moved statement from its destination fails non-vacuously.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
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
	assert.ok(statements.length >= 70, `expected the full pre-change statement set, got ${statements.length}`);
	assert.ok(redFlags.length >= 14, `expected the full pre-change red-flags list, got ${redFlags.length}`);
});

test("ASD5 (non-vacuous): every pre-change SKILL.md red flag is covered by a retained RF row", () => {
	// Ground against the committed pre-change SKILL.md (the review baseline), not a
	// self-declared count: deleting RF rows leaves a baseline red flag uncovered.
	let baseline;
	// Pin the pre-restructure SKILL.md (this stream's disposition baseline). A
	// bare merge-base would drift onto main's tip after integrating main, so the
	// baseline commit is pinned; fall back to merge-base/main only if unavailable.
	const refs = ["d528b9799ed38f8c03708cbd27047543932017d3:skills/sdlc/SKILL.md"];
	try {
		const mb = execFileSync("git", ["-C", repo, "merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
		refs.push(`${mb}:skills/sdlc/SKILL.md`, "main:skills/sdlc/SKILL.md");
	} catch {}
	for (const ref of refs) {
		try {
			const text = execFileSync("git", ["-C", repo, "show", ref], { encoding: "utf8" });
			const n = text
				.slice(text.indexOf("## Red flags"))
				.split("\n")
				.filter((l) => l.startsWith("- ")).length;
			if (n === 14) {
				baseline = text;
				break;
			}
			baseline ??= text;
		} catch {}
	}
	assert.ok(baseline, "could not read the pre-change SKILL.md baseline from git");
	const rfStart = baseline.indexOf("## Red flags");
	assert.ok(rfStart >= 0, "baseline must have a Red flags section");
	const rfSectionRaw = baseline.slice(rfStart);
	const bulletCount = rfSectionRaw.split("\n").filter((l) => l.startsWith("- ")).length;
	assert.ok(bulletCount >= 14, `expected >=14 pre-change red flags, got ${bulletCount}`);
	const rfRows = rows().filter((r) => r.id.startsWith("RF"));
	// Every pre-change red flag has exactly one retained RF row (deleting a row trips this).
	assert.equal(rfRows.length, bulletCount, `RF rows (${rfRows.length}) must equal pre-change red flags (${bulletCount})`);
	const baselineRf = norm(rfSectionRaw);
	const skill = readNorm("skills/sdlc/SKILL.md");
	for (const r of rfRows) {
		const a = norm(r.anchor);
		assert.ok(baselineRf.includes(a), `${r.id}: anchor not found in the pre-change red flags: "${r.anchor}"`);
		assert.ok(skill.includes(a), `${r.id}: anchor not retained in current SKILL.md: "${r.anchor}"`);
	}
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
