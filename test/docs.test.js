// Offline doc-presence tests (spec OH7, OH8, OH9, OH12). Greps over committed
// docs; no model calls. An outline shows shape; these assert the normative text
// the spec requires is actually present.

import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skillMd = readFileSync(join(repo, "skills", "sdlc", "SKILL.md"), "utf8");
const readme = readFileSync(join(repo, "README.md"), "utf8");
const adrDir = join(repo, "docs", "adr");

test("OH7: SKILL.md carries the opt-in, advisory, hooks headings + red flags", () => {
	assert.match(skillMd, /^## Opt-in and advisory mode$/m);
	assert.match(skillMd, /^### Advisory mode$/m);
	assert.match(skillMd, /^## Hooks \(local workflow\)$/m);
	assert.match(skillMd, /\[sdlc hook\]/);
	assert.match(skillMd, /Skipping or silently reordering a configured phase hook\./);
	assert.match(skillMd, /Writing to the main checkout after creating a worktree\./);
	assert.match(skillMd, /creating one is not enough/);
});

test("OH7: the Implement table row no longer prescribes 'in a worktree'", () => {
	const implementRow = skillMd.split("\n").find((l) => l.startsWith("| Implement |"));
	assert.ok(implementRow, "Implement row must exist");
	assert.ok(!implementRow.includes("in a worktree"), `Implement row still prescribes a worktree: ${implementRow}`);
});

test("OH8: SKILL.md contains the announce-on-fire block and the workflow.md rule", () => {
	assert.match(skillMd, /\[sdlc hook\] <phase>:<before\|after> run\$ <command>/);
	assert.match(skillMd, /\[sdlc hook\] <phase>:<before\|after> result: ok/);
	assert.match(skillMd, /enumerate each top-level bullet/);
	assert.match(skillMd, /local rules may ADD gates, never remove or weaken/);
});

test("OH9: exactly two new ADRs (opt-in, hooks) with context/decision/consequences", () => {
	const files = readdirSync(adrDir).filter((f) => /^00(10|11)-/.test(f));
	assert.equal(files.length, 2, `expected 0010 + 0011, got ${files.join(", ")}`);
	for (const f of files) {
		const body = readFileSync(join(adrDir, f), "utf8");
		assert.match(body, /- Context:/, `${f} missing Context`);
		assert.match(body, /- Decision:/, `${f} missing Decision`);
		assert.match(body, /- Consequences:/, `${f} missing Consequences`);
	}
});

test("OH12: README has the opt-in story and drops the old no-manifest-defaults claim", () => {
	assert.match(readme, /\/setup-sdlc/);
	assert.match(readme, /has not committed .*sdlc\.config\.json|has not adopted|opt/i);
	assert.ok(!readme.includes("the skill still runs phases + panels using built-in defaults"), "README must not keep the old 'runs with defaults' claim");
});
