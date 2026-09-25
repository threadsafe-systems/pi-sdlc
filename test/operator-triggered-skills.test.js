import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const skillMd = read("skills/sdlc/SKILL.md");
const retroMd = read("skills/sdlc-retro/SKILL.md");
const sysRef = read("skills/sdlc/references/system-reference.md");

function frontmatter(body) {
	const m = body.match(/^---\n([\s\S]*?)\n---\n/);
	assert.ok(m, "skill must open with a frontmatter block");
	return m[1];
}

function description(body) {
	const line = frontmatter(body)
		.split("\n")
		.find((l) => l.startsWith("description:"));
	assert.ok(line, "frontmatter must carry a description");
	// pi parses frontmatter as YAML; ": " inside an unquoted scalar is a parse
	// error, and pi then silently drops the skill.
	assert.doesNotMatch(line.slice("description:".length), /: /, "unquoted description must not contain ': '");
	return line.slice("description:".length).trim();
}

function exitOneBranch(body) {
	const start = body.indexOf("**Exit 1 (`not-adopted`)**");
	const end = body.indexOf("**Exit 2 (`error`)**");
	assert.ok(start >= 0 && end > start, "startup table must list exit 1 before exit 2");
	return body.slice(start, end);
}

const OPERATOR_ONLY = /^Operator-triggered only\. Load this skill only when the operator explicitly asks/;
const AMBIENT = [/Use at the start of any feature or change/i, /This is the project law, not a suggestion/i];

// Each check runs against the real text and against a reverted fixture, so a
// check that can no longer fail is caught rather than passing vacuously.
const REVERTED = {
	description: "The enforced software development lifecycle. Use at the start of any feature or change. This is the project law, not a suggestion.",
	exitOne: "**Exit 1 (`not-adopted`)**: do NOT announce. State the repo has not adopted the\n   sdlc and offer `/setup-sdlc` to opt in, or advisory mode for this session only\n   with the user's explicit in-session consent.\n",
	advisory: "**Advisory mode** is the escape hatch when a repo has not opted in.",
};

function assertOperatorOnly(desc) {
	assert.match(desc, OPERATOR_ONLY);
	for (const re of AMBIENT) assert.doesNotMatch(desc, re);
}

function assertSilentExitOne(branch) {
	assert.match(branch, /do NOT announce and do NOT ask/);
	assert.match(branch, /Say nothing about\s+the sdlc or its adoption/);
	assert.match(branch, /continue the task outside it/);
	assert.doesNotMatch(branch, /\/setup-sdlc|advisory|opt in|offer `/i);
}

test("both skill descriptions restrict loading to an explicit operator request", () => {
	assertOperatorOnly(description(skillMd));
	assertOperatorOnly(description(retroMd));
	assert.throws(() => assertOperatorOnly(REVERTED.description));
});

test("both skills stay listed to the model so /sdlc-* templates can resolve the skill directory", () => {
	for (const body of [skillMd, retroMd]) assert.doesNotMatch(frontmatter(body), /disable-model-invocation/);
});

test("the not-adopted branch neither asks nor mentions adoption, and continues the task", () => {
	assertSilentExitOne(exitOneBranch(skillMd));
	assert.throws(() => assertSilentExitOne(REVERTED.exitOne));
});

test("a directory with no git repository is handled as not-adopted rather than halting", () => {
	const start = skillMd.indexOf("**Exit 2 (`error`)**");
	const branch = skillMd.slice(start, skillMd.indexOf("**Exit 3 (`not-ready`)**"));
	assert.match(branch, /`root\.resolve` or\s+`git\.repository`[\s\S]*handle it exactly as exit 1/);
});

test("advisory mode is gone from the kernel and the system reference", () => {
	for (const body of [skillMd, sysRef]) assert.doesNotMatch(body, /advisory mode/i);
	assert.match(REVERTED.advisory, /advisory mode/i);
});
