import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const implement = read("skills/sdlc/references/phase-implement.md");
const tasks = read("skills/sdlc/references/phase-tasks.md");

const implementObligations = [
	/reader of the code now/i,
	/behavior is mechanically green[\s\S]{0,300}reader-facing comments and docstrings/i,
	/machine-consumed or type-affecting/i,
	/process (?:history|provenance)/i,
	/absent, removed, or future/i,
	/contracts, invariants, or non-obvious rationale/i,
	/restat(?:e|ing) what the code says/i,
	/stale\s+without this file\s+changing/i,
	/every changed test name[\s\S]{0,200}standalone behavioral claim/i,
];

test("Implement owns the complete reader-now authoring law", () => {
	for (const obligation of implementObligations) assert.match(implement, obligation);
});

test("Implement permits executable directives without exempting their prose", () => {
	assert.match(implement, /compiler,\s+lint,\s+coverage,\s+and\s+generation directives/i);
	assert.match(implement, /human-facing prose[\s\S]{0,200}(?:final|code-prose) pass/i);
});

test("Implement blocks validation or closure until the exact task attestation", () => {
	assert.match(implement, /Code-prose pass: complete/);
	assert.match(implement, /before\s+(?:dispatching|running)[\s\S]{0,30}deterministic (?:task )?validator/i);
	assert.match(implement, /review\.tasks: off[\s\S]{0,300}before\s+(?:commit|committing|task completion|declaring the task complete)/i);
	assert.match(implement, /standalone[\s\S]{0,200}before declaring (?:Implement|implementation) complete/i);
});

test("Tasks projects the code-prose pass into every task Definition of Done", () => {
	assert.match(tasks, /every task(?:'s)? Definition of Done[\s\S]{0,300}code-prose pass/i);
	assert.match(tasks, /Code-prose pass: complete/);
	assert.match(tasks, /does not make the (?:deterministic )?validator (?:a prose\s+)?judge/i);
});
