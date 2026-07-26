// Scenarios for the cross-gate iteration & disposition vocabulary (S5).
// Spec: docs/specs/2026-07-26-iteration-disposition-vocabulary.md.
// Offline: reads the working tree and shells out to local git only — no model
// calls and no network calls (N2/IDV17).

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const refDir = join(repo, "skills", "sdlc", "references");

const GLOSSARY_TITLE = "Iteration & disposition";

/** The merge-base with the main line; `main` may not exist locally in CI. */
function baseRef() {
	for (const ref of ["main", "origin/main"]) {
		try {
			return execFileSync("git", ["-C", repo, "merge-base", "HEAD", ref], { encoding: "utf8" }).trim();
		} catch {}
	}
	throw new Error("cannot resolve the main-line base ref (main / origin/main)");
}

function baseFile(path) {
	return execFileSync("git", ["-C", repo, "show", `${baseRef()}:${path}`], { encoding: "utf8" });
}

const systemReference = readFileSync(join(refDir, "system-reference.md"), "utf8");

/** The glossary section body: its heading through the next `## ` heading or EOF. */
function glossarySection(body) {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => line.startsWith("## ") && line.includes(GLOSSARY_TITLE));
	if (start === -1) return null;
	let end = lines.length;
	for (let i = start + 1; i < lines.length; i++) {
		if (lines[i].startsWith("## ")) {
			end = i;
			break;
		}
	}
	const section = lines.slice(start, end);
	while (section.length > 0 && section.at(-1).trim() === "") section.pop();
	return section;
}

// --- C1: the glossary section (T1) ------------------------------------------

test("IDV1: system-reference.md contains exactly one 'Iteration & disposition' section", () => {
	const headings = systemReference.split("\n").filter((line) => line.startsWith("## ") && line.includes(GLOSSARY_TITLE));
	assert.equal(headings.length, 1, `expected exactly one '${GLOSSARY_TITLE}' section, found ${headings.length}`);
});

test("IDV2: the glossary defines every term group, the alias, and the prefix mapping", () => {
	const section = glossarySection(systemReference);
	assert.ok(section, "glossary section not found");
	const body = section.join("\n");
	const required = {
		"origin tag NEW": /`NEW`/,
		"origin tag REOPENED": /`REOPENED\(<id>\)`/,
		"disposition incorporated": /`incorporated`/,
		"disposition dismissed": /`dismissed`/,
		"disposition barred": /`barred`/,
		"disposition carry": /`CARRY-TO-<dest>`/,
		"disposition escalated": /`escalated`/,
		"defect class": /defect class/i,
		'"finding class" alias': /finding\s+class/i,
		"reopen evidence bar": /evidence\s+that\s+did\s+not\s+exist/i,
		"finding record shape": /finding\s+record\s+shape/i,
		"landing site": /landing\s+site/i,
		"id format": /`<PREFIX>-R<round>-<nn>`/,
		"prefix mapping plan_review": /`plan_review`\s*(?:→|->)\s*`PLAN`/,
		"prefix mapping spec_review": /`spec_review`\s*(?:→|->)\s*`SPEC`/,
		"prefix mapping pr_review": /`pr_review`\s*(?:→|->)\s*`PR`/,
		"prefix mapping task_validate": /`task_validate`\s*(?:→|->)\s*`TASK`/,
		"run-scoped uniqueness": /unique\s+within\s+the\s+run/i,
		"carry destination spec": /`CARRY-TO-SPEC`/,
		"carry destination build": /`CARRY-TO-BUILD`/,
		"carry destination implement": /`CARRY-TO-IMPLEMENT`/,
		"carry destination backlog": /`CARRY-TO-BACKLOG`/,
		"no-orphan rule": /no-orphan/i,
		"ratified-decision collision": /ratified-decision\s+collision/i,
		"amendment classes": /amendment\s+classes/i,
		"amendment class (a)": /\(a\)/,
		"amendment class (b)": /\(b\)/,
		"amendment class (c)": /\(c\)/,
		"in-place marker rule": /in-place\W*\s+\W*marker/i,
	};
	for (const [label, re] of Object.entries(required)) {
		assert.match(body, re, `glossary missing: ${label}`);
	}
});

test("IDV2 (non-vacuous): a glossary stripped of the alias fails its own check", () => {
	const section = glossarySection(systemReference);
	const mutated = section.join("\n").replace(/finding\s+class/gi, "REDACTED");
	assert.doesNotMatch(mutated, /finding\s+class/i);
});

test("IDV3: §1–§14 numbering in system-reference.md is unchanged from the branch base", () => {
	const path = "skills/sdlc/references/system-reference.md";
	const numbered = (body) =>
		body
			.split("\n")
			.filter((line) => /^## \d+\. /.test(line))
			.filter((line) => Number.parseInt(line.slice(3), 10) <= 14);
	assert.deepEqual(numbered(systemReference), numbered(baseFile(path)), "a pre-existing §1–§14 heading was renumbered or retitled");
});

test("IDV25: the glossary section is at most 60 lines", () => {
	const section = glossarySection(systemReference);
	assert.ok(section, "glossary section not found");
	assert.ok(section.length <= 60, `glossary is ${section.length} lines, budget is 60`);
});
