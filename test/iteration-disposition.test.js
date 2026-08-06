// Scenarios for the cross-gate iteration & disposition vocabulary (S5).
// Spec: docs/specs/2026-07-26-iteration-disposition-vocabulary.md.
// Offline: reads the working tree only; no subprocess, model, or network calls.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { check } from "../skills/sdlc/scripts/config-doc.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const refDir = join(repo, "skills", "sdlc", "references");

const GLOSSARY_TITLE = "Iteration & disposition";

const systemReference = readFileSync(join(refDir, "system-reference.md"), "utf8");

function reference(slug) {
	return readFileSync(join(refDir, `phase-${slug}.md`), "utf8");
}

function assertExactImports(source, expected) {
	const prelude = `${expected.join("\n")}\n\n`;
	const preludeStart = source.indexOf(prelude);
	assert.notEqual(preludeStart, -1, "static module declarations must remain one exact local-only prelude");
	assert.equal(source.indexOf(prelude, preludeStart + 1), -1, "the module prelude must appear exactly once");
	const loadKeyword = ["im", "port"].join("");
	const exposeKeyword = ["ex", "port"].join("");
	const safeMeta = new RegExp(`\\b${loadKeyword}\\.meta\\b`, "g");
	const outsidePrelude = `${source.slice(0, preludeStart)}${source.slice(preludeStart + prelude.length)}`.replace(safeMeta, "");
	const moduleKeyword = new RegExp(`\\b(?:${loadKeyword}|${exposeKeyword})\\b`);
	assert.doesNotMatch(outsidePrelude, moduleKeyword, "no static or dynamic module load may appear outside the allowlisted prelude");
}

/** A numbered `## <n>. …` section body, heading included, up to the next `## `. */
function numberedSection(body, n) {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => line.startsWith(`## ${n}. `));
	if (start === -1) return null;
	let end = lines.length;
	for (let i = start + 1; i < lines.length; i++) {
		if (lines[i].startsWith("## ")) {
			end = i;
			break;
		}
	}
	return lines.slice(start, end).join("\n");
}

/** Maximal runs of `>` blockquote lines, joined per block with newlines collapsed. */
function calloutBlocks(section) {
	const blocks = [];
	let current = null;
	for (const line of section.split("\n")) {
		if (/^\s*>/.test(line)) {
			current ??= [];
			current.push(line);
		} else if (current) {
			blocks.push(current.join(" ").replace(/\s+/g, " "));
			current = null;
		}
	}
	if (current) blocks.push(current.join(" ").replace(/\s+/g, " "));
	return blocks;
}

/** The blank-line-delimited paragraph containing `needle`, newlines collapsed. */
function paragraphContaining(body, needle) {
	const para = body.split(/\n\s*\n/).find((block) => block.includes(needle));
	return para ? para.replace(/\s+/g, " ") : null;
}

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

test("IDV3: system-reference.md keeps the standing §1–§14 heading contract", () => {
	const expected = [
		"1. Purpose",
		"2. Kernel — invariant guarantees and the two tracks",
		"3. Adoption & readiness",
		"4. Tracks, phases, transitions, gates, refusal",
		"5. Public composition inventory (FS11 taxonomy)",
		"6. Configuration & extension surfaces",
		"7. Artifacts & durable evidence",
		"8. Normal full-lifecycle operation and the six standalone entrypoints",
		"9. Advanced modes",
		"10. Operational troubleshooting and the source-inspection boundary",
		"11. Next-read routing (authority map)",
		"12. Lifecycle telemetry (FS13)",
		"13. Stall detection and self-resume",
		"14. Presenting questions to the human",
	];
	const numbered = (body) =>
		body
			.split("\n")
			.filter((line) => /^## \d+\. /.test(line))
			.filter((line) => Number.parseInt(line.slice(3), 10) <= 14)
			.map((line) => line.slice(3));
	assert.deepEqual(numbered(systemReference), expected, "a standing §1–§14 heading was deleted, renumbered, or retitled");
	const mutated = systemReference.replace("## 1. Purpose", "## 1. Changed");
	assert.notDeepEqual(numbered(mutated), expected, "the heading contract must fail when a heading changes");
});

test("IDV25: the glossary section is at most 60 lines", () => {
	const section = glossarySection(systemReference);
	assert.ok(section, "glossary section not found");
	assert.ok(section.length <= 60, `glossary is ${section.length} lines, budget is 60`);
});

// --- C2: the panel run-shape (T2) -------------------------------------------

const prReview = reference("pr-review");
const prReviewGateSeam = numberedSection(prReview, 5);
const prReviewPurpose = numberedSection(prReview, 1);

/** Every row of the Spec's C2 table, keyed by its distinctive phrase. */
const C2_ROWS = {
	"1 delta-dispatch obligation": /every\s+round\s+after\s+the\s+first\s+is\s+a\s+delta\s+review/i,
	"2 id minting": /mints\s+each\s+finding's\s+id/i,
	"3 origin tagging": /`NEW`\s+or\s+`REOPENED\(<id>\)`/,
	"4 ratified-collision escalation": /contradicts\s+an\s+owner-ratified\s+decision/i,
	"5 amended 'Only … escalate' sentence": /Only\s+three\s+cases\s+escalate/i,
	"6 dismissal posture": /two\s+consecutive\s+waves\s+at\s+100%\s+incorporation/i,
	"7 trim-the-tail": /re-dispatch\s+\*\*only\s+that\s+reviewer\*\*/i,
	"8 sub-floor exemption": /exempt\s+sub-floor\s+dispatch/i,
	"9 backlog checkpoint": /lacks\s+a\s+filed\s+issue\s+id/i,
	"10 round-4 cap": /no\s+5th\s+round\s+is\s+dispatched/i,
	"11 churn diagnosis": /four\s+bounded\s+options/i,
	"12 artifact-inventory self-audit": /artifact-inventory\s+self-audit/i,
	"13 finding-class alias": /two\s+names\s+for\s+one\s+concept/i,
};

test("IDV5: phase-pr-review.md §5 contains every row of the C2 table", () => {
	assert.ok(prReviewGateSeam, "phase-pr-review.md §5 not found");
	for (const [label, re] of Object.entries(C2_ROWS)) {
		assert.match(prReviewGateSeam, re, `§5 missing C2 row: ${label}`);
	}
});

test("IDV6: phase-pr-review.md §1 carries the floors-govern-full-rounds clause", () => {
	assert.ok(prReviewPurpose, "phase-pr-review.md §1 not found");
	assert.match(prReviewPurpose.replace(/\s+/g, " "), /floors\s+govern\s+\*\*full\s+review\s+rounds\*\*/i, "§1 does not define floors as governing full review rounds");
});

test("IDV7: the round cap names round 4 and lists exactly four bounded options", () => {
	const cap = paragraphContaining(prReviewGateSeam, "Round cap");
	assert.ok(cap, "round-cap paragraph not found in §5");
	assert.match(cap, /\*\*4th\*\*\s+round/i, "the cap does not name the 4th round");
	for (const option of ["(a)", "(b)", "(c)", "(d)"]) {
		assert.ok(cap.includes(option), `round cap missing option ${option}`);
	}
	assert.ok(!cap.includes("(e)"), "round cap lists more than four options");
});

test("IDV8: at pr_review, moving on requires a ratified dismissal and never permits merging past a survivor", () => {
	const cap = paragraphContaining(prReviewGateSeam, "Round cap");
	assert.ok(cap, "round-cap paragraph not found in §5");
	assert.match(cap, /at\s+`pr_review`,\s+\(d\)\s+is\s+the\s+only\s+route\s+to\s+"move\s+on"/i, 'the pr_review "move on" restriction is absent');
	assert.match(cap, /never\s+permits\s+merging\s+past\s+a\s+surviving\s+high\s+or\s+medium/i, "the cap does not forbid merging past a survivor");
});

test("IDV13: phase-pr-review.md states the backlog checkpoint", () => {
	assert.match(prReviewGateSeam.replace(/\s+/g, " "), /PR\s+gate\s+is\s+not\s+passable\s+while\s+any\s+`CARRY-TO-BACKLOG`\s+lacks\s+a\s+filed\s+issue\s+id/i, "the backlog checkpoint is absent from §5");
});

// Originally asserted the pre-amendment sentence was present in the branch
// base — a premise that expires on merge, and did: it turned main red. The
// durable invariant is that the superseded sentence never returns.
test("IDV30: the existing 'Only … escalate' sentence is itself amended, not left standing", () => {
	const originalSentence = "Only **proposed dismissals of high or medium findings** — plus anything touching a previously human-ratified residual-risk boundary — escalate";
	assert.ok(!prReview.replace(/\s+/g, " ").includes(originalSentence), "the original 'Only … escalate' sentence still stands unamended beside the new collision rule");
	const escalation = paragraphContaining(prReviewGateSeam, "Only three cases escalate");
	assert.ok(escalation, "the amended escalation sentence is not in §5");
	assert.match(escalation, /contradicts\s+an\s+owner-ratified\s+decision/i, "the amended sentence does not admit ratified-decision collisions");
});

// --- C3: carry dispositions, callout form (T3) -------------------------------

// The outbound (reference, section, token) triples of the Spec's C3 table.
// `CARRY-TO-BACKLOG` is deliberately absent: it is terminal and universally
// available, so wrapping it in a configuration callout would be misleading.
const CONDITIONAL_OUTBOUND = [
	{ slug: "plan", section: 5, token: "CARRY-TO-SPEC" },
	{ slug: "spec", section: 5, token: "CARRY-TO-BUILD" },
	{ slug: "tasks", section: 8, token: "CARRY-TO-IMPLEMENT" },
];

test("IDV11: every conditional outbound carry statement sits inside an 'under your configuration' callout", () => {
	for (const { slug, section, token } of CONDITIONAL_OUTBOUND) {
		const body = numberedSection(reference(slug), section);
		assert.ok(body, `phase-${slug}.md §${section} not found`);
		const mentions = body.split("\n").filter((line) => line.includes(token));
		// Existence of all four outbound statements is IDV26's assertion; this one
		// is about their form. The two Plan/Spec destinations are pinned here too
		// so the form check cannot pass vacuously for the phases it governs.
		if (slug !== "tasks") assert.ok(mentions.length > 0, `phase-${slug}.md §${section} states no ${token} disposition`);
		const inCallouts = calloutBlocks(body)
			.filter((block) => /under your configuration/i.test(block))
			.join(" ");
		for (const line of mentions) {
			const text = line
				.replace(/^\s*>?\s?/, "")
				.replace(/\s+/g, " ")
				.trim();
			assert.ok(inCallouts.includes(text), `phase-${slug}.md §${section}: ${token} stated outside a configuration callout:\n  ${text}`);
		}
	}
});

test("IDV11: CARRY-TO-BACKLOG is stated unconditionally, never wrapped in a callout", () => {
	const body = numberedSection(reference("pr-review"), 5);
	const wrapped = calloutBlocks(body).filter((block) => block.includes("CARRY-TO-BACKLOG"));
	assert.deepEqual(wrapped, [], "CARRY-TO-BACKLOG is terminal and universal; a configuration callout would be misleading");
	assert.ok(body.includes("CARRY-TO-BACKLOG"), "test premise broken: CARRY-TO-BACKLOG is absent from phase-pr-review.md §5");
});

// --- C3/C4/C5: amendment classes, checkpoints, spec-gap log (T4) -------------

// Where each amendment-class statement lives, per the Spec's C4 placement table.
const AMENDMENT_HOMES = [
	{ slug: "plan", section: 5 },
	{ slug: "spec", section: 5 },
	{ slug: "tasks", section: 8 },
];

test("IDV9: the three amendment classes appear at their C4 homes", () => {
	for (const { slug, section } of AMENDMENT_HOMES) {
		const body = numberedSection(reference(slug), section);
		assert.ok(body, `phase-${slug}.md §${section} not found`);
		for (const cls of ["(a)", "(b)", "(c)"]) {
			assert.ok(body.includes(`**${cls}**`), `phase-${slug}.md §${section} does not state amendment class ${cls}`);
		}
	}
});

test("IDV10: §6 of those three carries a class-(a) pointer and defines no forward amendment", () => {
	for (const { slug } of AMENDMENT_HOMES) {
		const body = numberedSection(reference(slug), 6);
		assert.ok(body, `phase-${slug}.md §6 not found`);
		assert.match(body, /class\s+\*\*\(a\)\*\*/, `phase-${slug}.md §6 lacks the class-(a) pointer`);
		for (const cls of ["(b)", "(c)"]) {
			assert.ok(!body.includes(cls), `phase-${slug}.md §6 defines forward-amendment class ${cls}; §6 means the opposite`);
		}
	}
});

test("IDV26: all four outbound carry statements exist at their C3 homes", () => {
	const homes = [
		{ slug: "plan", section: 5, token: "CARRY-TO-SPEC" },
		{ slug: "spec", section: 5, token: "CARRY-TO-BUILD" },
		{ slug: "tasks", section: 8, token: "CARRY-TO-IMPLEMENT" },
		{ slug: "pr-review", section: 5, token: "CARRY-TO-BACKLOG" },
	];
	for (const { slug, section, token } of homes) {
		const body = numberedSection(reference(slug), section);
		assert.ok(body, `phase-${slug}.md §${section} not found`);
		assert.ok(body.includes(token), `phase-${slug}.md §${section} mints no ${token} — a disposition no phase can emit`);
	}
});

test("IDV12: the four inbound carry checkpoints appear in their named reference and section", () => {
	const checkpoints = [
		{ slug: "spec", section: 5, token: "CARRY-TO-SPEC", blocks: /blocks\s+the\s+gate/i },
		{ slug: "tasks", section: 8, token: "CARRY-TO-BUILD", blocks: /completion\s+evidence/i },
		{ slug: "implement", section: 5, token: "CARRY-TO-IMPLEMENT", blocks: /does\s+not\s+close/i },
		{ slug: "pr-review", section: 5, token: "every carry minted anywhere in this run", blocks: /before\s+the\s+gate\s+passes/i },
	];
	for (const { slug, section, token, blocks } of checkpoints) {
		const body = numberedSection(reference(slug), section);
		assert.ok(body, `phase-${slug}.md §${section} not found`);
		const flat = body.replace(/\s+/g, " ");
		assert.ok(flat.includes(token), `phase-${slug}.md §${section} states no inbound checkpoint for ${token}`);
		assert.match(flat, blocks, `phase-${slug}.md §${section} names the carry but blocks nothing on it`);
	}
	// The landing site is §4, distinct from the §5 block (SPEC-R1-13).
	assert.match(numberedSection(reference("implement"), 4), /CARRY-TO-IMPLEMENT/, "phase-implement.md §4 has no carry landing beside the Assumptions appendix");
});

test("IDV29: phase-implement.md §5 states the review.tasks: off fallback", () => {
	const body = numberedSection(reference("implement"), 5).replace(/\s+/g, " ");
	assert.match(body, /`review\.tasks: off`/, "the fallback does not name `review.tasks: off`");
	assert.match(body, /no\s+configuration\s+leaves\s+a\s+carry\s+unchecked/i, "the fallback does not route the obligation to the PR panel");
});

test("IDV14: phase-tasks.md §4 specifies the spec-gap log with its exact columns and enums", () => {
	const body = numberedSection(reference("tasks"), 4);
	assert.ok(body, "phase-tasks.md §4 not found");
	const flat = body.replace(/\s+/g, " ");
	assert.match(flat, /Spec\s+gap\s+log/i, "§4 does not specify a spec gap log");
	for (const column of ["description", "severity", "disposition", "landing site"]) {
		assert.ok(flat.includes(column), `spec gap log missing column: ${column}`);
	}
	for (const value of ["`blocker`", "`minor`", "`backward-transition`", "`assumption-recorded`", "`CARRY-TO-IMPLEMENT`"]) {
		assert.ok(flat.includes(value), `spec gap log missing enum value: ${value}`);
	}
	assert.match(flat, /carried\s+inbound\s+from\s+Spec/i, "the log's inbound-carry source is omitted");
	assert.match(flat, /never\s+omitted/i, 'the explicit-"none" rule is absent');
});

test("IDV14: templates/sdlc-tasks.md remains a thin current-tree router", () => {
	const template = readFileSync(join(repo, "templates", "sdlc-tasks.md"), "utf8");
	const body = template.replace(/^---\n[\s\S]*?\n---\n/, "");
	const tableCells = (line) =>
		line
			.trim()
			.replace(/^\||\|$/g, "")
			.split("|")
			.map((cell) => cell.trim().toLowerCase());
	const hasSpecGapColumns = (text) => {
		const lines = text.split("\n");
		return lines.some((line, index) => {
			if (!line.trimStart().startsWith("|") || index + 1 >= lines.length) return false;
			const cells = tableCells(line);
			const separator = tableCells(lines[index + 1]);
			const isHeader = separator.length === cells.length && separator.every((cell) => /^:?-+:?$/.test(cell));
			return isHeader && ["description", "severity", "disposition", "landing site"].every((column) => cells.includes(column));
		});
	};
	assert.match(body, /Thin router/, "the standalone entrypoint no longer identifies itself as a thin router");
	assert.doesNotMatch(body, /Spec gap log/i, "the standalone router must not restate the Spec gap log");
	assert.equal(hasSpecGapColumns(body), false, "the standalone router must not carry the Spec gap table columns");
	const dataRow = `${body}\n| prose mentions description, severity, disposition, and landing site |`;
	assert.equal(hasSpecGapColumns(dataRow), false, "a prose data row is not a Markdown table header");
	const mutated = `${body}\n| description | severity | disposition | landing site |\n| --- | --- | --- | --- |`;
	assert.equal(hasSpecGapColumns(mutated), true, "the forbidden-table check must remain non-vacuous");
	const shortSeparator = `${body}\n| description | severity | disposition | landing site |\n| - | - | - | - |`;
	assert.equal(hasSpecGapColumns(shortSeparator), true, "a short valid Markdown separator must still identify the forbidden header");
});

test("IDV27: assumption-recorded routes to the existing Assumptions appendix", () => {
	const body = numberedSection(reference("tasks"), 4).replace(/\s+/g, " ");
	assert.match(body, /`assumption-recorded`\s+\*\*routes\s+the\s+entry\s+to\s+the\s+existing/i, "assumption-recorded does not route to the existing appendix");
	assert.match(body, /rather\s+than\s+opening\s+a\s+second\s+ledger/i, "the no-duplicate-ledger rule is absent");
});

// --- C6/C7: reviewer prompts and the frozen list (T5) ------------------------

const promptDir = join(repo, "skills", "sdlc", "prompts");
const ADVERSARY_PROMPTS = ["plan", "spec", "review"];

function prompt(slug) {
	return readFileSync(join(promptDir, `adversary-${slug}.prompt.md`), "utf8");
}

/** The prompt's STRICT output-format section: its heading to the next `## `. */
function outputFormat(body) {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => line.startsWith("## Output format"));
	if (start === -1) return null;
	let end = lines.length;
	for (let i = start + 1; i < lines.length; i++) {
		if (lines[i].startsWith("## ")) {
			end = i;
			break;
		}
	}
	return lines.slice(start, end).join("\n");
}

// The C6 carry-landing clause, scoped per prompt: uniform wording would be
// vacuous for the plan reviewer and misdirected for the other two.
const CARRY_CLAUSE = {
	plan: /no\s+`CARRY-TO-PLAN`\s+destination\s+exists/i,
	spec: /every\s+`CARRY-TO-SPEC`[\s\S]{0,120}?landed/i,
	review: /every\s+carry\s+minted\s+anywhere\s+in\s+this\s+run/i,
};

test("IDV15: every adversary prompt carries the delta-round law and its C6 carry clause", () => {
	for (const slug of ADVERSARY_PROMPTS) {
		const body = prompt(slug).replace(/\s+/g, " ");
		assert.match(body, /every\s+round\s+after\s+the\s+first\s+is\s+a\s+delta\s+review/i, `adversary-${slug} lacks the delta-round law`);
		assert.match(body, /`REOPENED\(<prior-id>\)`/, `adversary-${slug} does not ask for a REOPENED tag`);
		assert.match(body, /evidence\s+that\s+did\s+not\s+exist/i, `adversary-${slug} states no reopen evidence bar`);
		assert.match(body, CARRY_CLAUSE[slug], `adversary-${slug} lacks its scoped carry-landing clause`);
	}
});

// validator-task.prompt.md is protected by test/frozen-surfaces.test.js's
// FROZEN list; this corpus does not duplicate that diff guard.

test("IDV28: every adversary prompt's STRICT output format declares an origin field", () => {
	for (const slug of ADVERSARY_PROMPTS) {
		const format = outputFormat(prompt(slug));
		assert.ok(format, `adversary-${slug} has no output-format section`);
		assert.match(format, /^- origin: /m, `adversary-${slug}'s closed field list has no home for the origin tag`);
	}
});

// Non-change obligations are enforced by test/frozen-surfaces.test.js;
// standing scenarios assert current-tree behaviour.

test("IDV33: retired checks name their present enforcement owners", () => {
	const source = readFileSync(join(here, "iteration-disposition.test.js"), "utf8");
	const lines = source.split("\n");
	const commentBlock = (bodyLines, needle) => {
		const needleLine = bodyLines.findIndex((line) => line.trimStart().startsWith("//") && line.includes(needle));
		assert.notEqual(needleLine, -1, `ownership comment is missing: ${needle}`);
		let start = needleLine;
		while (start > 0 && bodyLines[start - 1].trimStart().startsWith("//")) start--;
		let end = needleLine;
		while (end + 1 < bodyLines.length && bodyLines[end + 1].trimStart().startsWith("//")) end++;
		return bodyLines.slice(start, end + 1).join("\n");
	};
	const frozenOwner = commentBlock(lines, "validator-task.prompt.md");
	const nonChangeOwner = commentBlock(lines, "Non-change obligations");
	assert.match(frozenOwner, /FROZEN[\s\S]*diff guard/i, "the validator prompt comment does not name the FROZEN-list owner");
	assert.match(nonChangeOwner, /frozen-surfaces[\s\S]*current-tree behaviour/i, "the non-change comment does not name the standing diff guard");
	const processHistory = /\b(?:Plan|panel|PR|removed|retired)\b/i;
	for (const comment of [frozenOwner, nonChangeOwner]) {
		assert.doesNotMatch(comment, processHistory, "ownership comments must describe present enforcement, not process history");
	}
	for (const mutation of [source.replace("// validator-task.prompt.md", "// Retired by the PR.\n// validator-task.prompt.md"), source.replace("// FROZEN list;", "// FROZEN list;\n\t// Retired by the PR.")]) {
		assert.match(commentBlock(mutation.split("\n"), "validator-task.prompt.md"), processHistory, "process history anywhere in the ownership block must remain detectable");
	}
});

// IDV19 was written diff-scoped, asserting the S5 branch DROPPED these three
// entries. The post-merge re-freeze discharged that; the durable obligation is
// the opposite one, so the scenario is restated as the standing guard rather
// than deleted.
test("IDV19: the three reopened adversary prompts are frozen again", () => {
	const path = "test/frozen-surfaces.test.js";
	const body = readFileSync(join(repo, path), "utf8");
	const frozen = [...body.matchAll(/^\t"([^"]+)",$/gm)].map((m) => m[1]);
	for (const slug of ADVERSARY_PROMPTS) {
		assert.ok(frozen.includes(`skills/sdlc/prompts/adversary-${slug}.prompt.md`), `adversary-${slug}.prompt.md was reopened for S5 and must be re-frozen`);
	}
	assert.ok(frozen.includes("skills/sdlc/prompts/validator-task.prompt.md"), "validator-task.prompt.md must stay frozen");
	const header = body.split("\n\n")[0];
	assert.match(header, /re-frozen/i, "the header does not record that the reopened prompts were re-frozen");
	assert.match(header, /iteration\s*&\s*disposition|S5/i, "the header does not name the slice that reopened them");
});

// --- Cross-cutting: citations, budget, amendment markers (T6) ----------------

const CITING_REFERENCES = ["plan", "spec", "tasks", "implement", "pr-review"];

test("IDV4: every phase reference the vocabulary binds cites the glossary by name", () => {
	for (const slug of CITING_REFERENCES) {
		const body = reference(slug).replace(/\s+/g, " ");
		assert.ok(body.includes(`"${GLOSSARY_TITLE}"`), `phase-${slug}.md does not cite the glossary section by name`);
		assert.match(body, /system-reference\.md/, `phase-${slug}.md names the section but not the reference that owns it`);
	}
});

test("IDV17: this scenario corpus makes no subprocess, model, or network call", () => {
	const source = readFileSync(join(here, "iteration-disposition.test.js"), "utf8");
	const staticLoad = ["im", "port"].join("");
	const staticExpose = ["ex", "port"].join("");
	const allowedImports = [
		`${staticLoad} assert from "node:assert/strict";`,
		`${staticLoad} { readFileSync } from "node:fs";`,
		`${staticLoad} { dirname, join } from "node:path";`,
		`${staticLoad} { fileURLToPath } from "node:url";`,
		`${staticLoad} { test } from "node:test";`,
		`${staticLoad} { check } from "../skills/sdlc/scripts/config-doc.mjs";`,
	];
	assertExactImports(source, allowedImports);
	for (const mutation of [
		`${staticLoad} "node:https"`,
		`\t${staticLoad} { execFile as run } from "node:child_process";`,
		`/* preload */ ${staticLoad} { execFile as run } from "node:child_process";`,
		`${staticExpose} * from "./helper.mjs";`,
		`${staticLoad} {\n\t// from "node:fs"\n\texecFile as run\n} from "node:child_process";`,
	]) {
		assert.throws(() => assertExactImports(`${source}\n${mutation}`, allowedImports), `prohibited module load must disturb the exact prelude: ${mutation}`);
	}
	const code = source
		.replace(/^\s*\/\/.*$/gm, "")
		.replace(/"[^"]*"/g, '""')
		.replace(/`[^`]*`/g, "``");
	for (const banned of [/\bfetch\s*\(/, new RegExp(`\\b${staticLoad}\\s*\\(`), /\brequire\s*\(/, /\bexecFileSync\s*\(/, /\bexecSync\s*\(/, /\bspawnSync\s*\(/, /\bspawn\s*\(/]) {
		assert.doesNotMatch(code, banned, `a scenario must not reach beyond the working tree: ${banned}`);
	}

	const subprocessPatternSource = String.raw`execFileSync\("([^"]+)"`;
	const subprocesses = (body) => [...body.matchAll(new RegExp(subprocessPatternSource, "g"))].map((match) => match[1]);
	const synthetic = `${["exec", "File", "Sync"].join("")}("fixture"`;
	assert.deepEqual(subprocesses(synthetic), ["fixture"], "the subprocess inventory pattern must remain non-vacuous");
	assert.deepEqual([...new Set(subprocesses(source))], [], "the scenario corpus must not execute a subprocess");
});

test("IDV32: every amendment record in the Spec is named by an in-place marker in the Plan", () => {
	const spec = readFileSync(join(repo, "docs", "specs", "2026-07-26-iteration-disposition-vocabulary.md"), "utf8");
	const plan = readFileSync(join(repo, "docs", "plans", "2026-07-26-iteration-disposition-vocabulary.md"), "utf8");
	const records = [...spec.matchAll(/^### (A\d+) — /gm)].map((m) => m[1]);
	assert.ok(records.length > 0, "test premise broken: the Spec records no amendments");
	// Markers wrap across lines in tables and prose, so match on flattened text.
	const markers = [...plan.replace(/\s+/g, " ").matchAll(/\*\*AMENDED[^*]*\*\*/g)].map((m) => m[0]);
	assert.ok(markers.length > 0, "test premise broken: the Plan carries no in-place markers");
	for (const record of records) {
		const named = markers.filter((line) => new RegExp(`\\b${record}\\b`).test(line));
		assert.ok(named.length > 0, `no Plan surface carries an in-place marker naming ${record}`);
	}
	// A marker that names no record leaves its surface undiscoverable from the
	// Spec, which is the failure IDV32 exists to catch.
	for (const marker of markers) {
		assert.ok(
			records.some((record) => new RegExp(`\\b${record}\\b`).test(marker)),
			`an AMENDED marker names no amendment record: ${marker.trim()}`,
		);
	}
});

test("IDV31: the finding-class alias sits at the binds-forward paragraph", () => {
	const bindsForward = paragraphContaining(prReviewGateSeam, "binds forward");
	assert.ok(bindsForward, "the binds-forward paragraph is not in §5");
	assert.match(bindsForward, /two\s+names\s+for\s+one\s+concept/i, "the alias sentence is not at the binds-forward paragraph");
	assert.match(bindsForward, /defect\s+class/i, "the alias sentence does not name `defect class`");
});

test("IDV24: config-doc check reports current for .pi/sdlc/CONFIG.md", () => {
	const result = check(repo);
	assert.equal(result.state, "current", `expected current, got ${result.state}: ${result.reason}`);
	assert.equal(result.exitCode, 0);
});
