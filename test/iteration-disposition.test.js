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

function reference(slug) {
	return readFileSync(join(refDir, `phase-${slug}.md`), "utf8");
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

test("IDV30: the existing 'Only … escalate' sentence is itself amended, not left standing", () => {
	const base = baseFile("skills/sdlc/references/phase-pr-review.md").replace(/\s+/g, " ");
	const originalSentence = "Only **proposed dismissals of high or medium findings** — plus anything touching a previously human-ratified residual-risk boundary — escalate";
	assert.ok(base.includes(originalSentence), "test premise broken: the original sentence is not in the branch base");
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

test("IDV14: templates/sdlc-tasks.md is byte-identical to the branch base", () => {
	const changed = execFileSync("git", ["-C", repo, "diff", "--name-only", baseRef(), "--", "templates/sdlc-tasks.md"], { encoding: "utf8" }).trim();
	assert.equal(changed, "", "the standalone-entrypoint router is a thin router; the spec-gap log belongs to phase-tasks.md §4");
});

test("IDV27: assumption-recorded routes to the existing Assumptions appendix", () => {
	const body = numberedSection(reference("tasks"), 4).replace(/\s+/g, " ");
	assert.match(body, /`assumption-recorded`\s+\*\*routes\s+the\s+entry\s+to\s+the\s+existing/i, "assumption-recorded does not route to the existing appendix");
	assert.match(body, /rather\s+than\s+opening\s+a\s+second\s+ledger/i, "the no-duplicate-ledger rule is absent");
});

test("IDV31: the finding-class alias sits at the binds-forward paragraph", () => {
	const bindsForward = paragraphContaining(prReviewGateSeam, "binds forward");
	assert.ok(bindsForward, "the binds-forward paragraph is not in §5");
	assert.match(bindsForward, /two\s+names\s+for\s+one\s+concept/i, "the alias sentence is not at the binds-forward paragraph");
	assert.match(bindsForward, /defect\s+class/i, "the alias sentence does not name `defect class`");
});
