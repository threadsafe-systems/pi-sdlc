import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const testRoot = join(repo, "test");
const referenceRoot = join(repo, "skills", "sdlc", "references");
const SOURCE_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

const token = (...parts) => parts.join("");
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const processInvokers = [token("exec", "File", "Sync"), token("spawn", "Sync")];
const processGitStart = `(?:${processInvokers.map(escapeRegex).join("|")})\\s*\\(\\s*["']${token("g", "it")}["']\\s*,\\s*\\[`;
const runProcessGitStart = `${escapeRegex(token("run", "Process"))}\\s*\\(\\s*\\[\\s*["']${token("g", "it")}["']`;
const gitStart = `(?:${processGitStart}|${runProcessGitStart})`;
const argvTail = "[^\\]]*";
const historyRead = token("merge", "-", "base");
const contentReads = [token("sh", "ow"), token("di", "ff")];
const mainLine = `${token("ma", "in")}|${token("orig", "in/", "main")}`;
const helperPattern = new RegExp(`\\b${token("ba", "se")}(?:${token("Re", "f")}|${token("Fi", "le")})\\s*\\(`, "g");
const mergeBasePattern = new RegExp(`${gitStart}${argvTail}["']${escapeRegex(historyRead)}["']`, "g");
const directReadPattern = new RegExp(`${gitStart}${argvTail}["'](?:${contentReads.map(escapeRegex).join("|")})["']${argvTail}["'](?:${mainLine})(?::[^"']*)?["']`, "g");

const EXEMPTIONS = new Map([
	["test/disposition-ledger.test.js", "Historical fixture uses a full pinned commit first; its moving-main lookup is a guarded compatibility fallback when that commit is unavailable."],
	["test/frozen-surfaces.test.js", "Standing diff guard: its contract is to compare the protected list with the branch base."],
]);

function sourceFiles(dir) {
	return readdirSync(dir, { withFileTypes: true })
		.flatMap((entry) => {
			const path = join(dir, entry.name);
			if (entry.isDirectory()) return sourceFiles(path);
			return SOURCE_EXTENSIONS.has(extname(entry.name)) ? [path] : [];
		})
		.sort();
}

function matches(source) {
	const reasons = [];
	if (helperPattern.test(source)) reasons.push("base helper");
	helperPattern.lastIndex = 0;
	if (mergeBasePattern.test(source)) reasons.push("git merge-base invocation");
	mergeBasePattern.lastIndex = 0;
	if (directReadPattern.test(source)) reasons.push("git show/diff with inline moving ref");
	directReadPattern.lastIndex = 0;
	return reasons;
}

function numberedSection(body, number) {
	const lines = body.split("\n");
	const start = lines.findIndex((line) => line.startsWith(`## ${number}. `));
	assert.notEqual(start, -1, `section ${number} is missing`);
	const next = lines.findIndex((line, index) => index > start && line.startsWith("## "));
	return lines.slice(start, next === -1 ? lines.length : next).join("\n");
}

function lawIssues(section) {
	const required = [
		["moving", /\bmoving\b/i],
		["expire", /\bexpire\w*\b/i],
		["pinned", /\bpinned\b/i],
		["non-change route", /non-change[\s\S]*standing diff guard/i],
		["current-tree route", /current tree/i],
	];
	return required.filter(([, pattern]) => !pattern.test(section)).map(([label]) => label);
}

const specReference = readFileSync(join(referenceRoot, "phase-spec.md"), "utf8");
const specActivity = numberedSection(specReference, 4);
const implementActivity = numberedSection(readFileSync(join(referenceRoot, "phase-implement.md"), "utf8"), 4);

test("DSP1: phase-spec §4 owns the single durable-premise law", () => {
	assert.deepEqual(lawIssues(specActivity), []);
	const lawParagraphs = specActivity.split(/\n\s*\n/).filter((paragraph) => lawIssues(paragraph).length === 0);
	assert.equal(lawParagraphs.length, 1, "phase-spec §4 must contain exactly one complete durable-premise law");
	for (const entry of readdirSync(referenceRoot, { withFileTypes: true })) {
		if (!entry.isFile() || !entry.name.endsWith(".md") || entry.name === "phase-spec.md") continue;
		const body = readFileSync(join(referenceRoot, entry.name), "utf8");
		assert.notEqual(lawIssues(body).length, 0, `${entry.name} duplicates the complete durable-premise law`);
	}
});

test("DSP2: phase-implement §4 points to the law without restating it", () => {
	assert.match(implementActivity, /phase-spec\.md[\s\S]*§4/i);
	assert.match(implementActivity, /standing diff guard/i);
	assert.notEqual(lawIssues(implementActivity).length, 0, "the implementation pointer must not duplicate the complete law");
});

test("DSP3: every concept anchor is load-bearing", () => {
	for (const anchor of [/\bmoving\b/i, /\bexpire\w*\b/i, /\bpinned\b/i]) {
		assert.match(specActivity, anchor, `the baseline law does not contain ${anchor}`);
		const mutated = specActivity.replace(anchor, "removed");
		assert.notEqual(mutated, specActivity, `the mutation did not remove ${anchor}`);
		assert.notEqual(lawIssues(mutated).length, 0, `removing ${anchor} must break the law check`);
	}
});

test("DSP4: the detector recursively enumerates executable test source", () => {
	const files = sourceFiles(testRoot).map((path) => relative(repo, path));
	assert.ok(files.includes("test/e2e/harness.mjs"), "the recursive sweep omitted the nested e2e harness");
	assert.ok(files.includes("test/diff-scoped-premises.test.js"), "the detector does not scan itself");
	assert.ok(
		files.every((path) => SOURCE_EXTENSIONS.has(extname(path))),
		"the sweep admitted a non-source fixture",
	);
});

test("DSP5: every detector branch is non-vacuous and named negatives stay clean", () => {
	const exec = token("exec", "File", "Sync");
	const run = token("run", "Process");
	const helper = token("ba", "se", "Ref");
	const positives = [
		[`function ${helper}() {}`, "base helper"],
		[`${exec}("git", ["merge-base", "HEAD", "main"])`, "git merge-base invocation"],
		[`${exec}("git", ["show", "main:path"])`, "git show/diff with inline moving ref"],
	];
	for (const [source, reason] of positives) assert.ok(matches(source).includes(reason), `${reason} branch is vacuous`);
	for (const source of ['readFileSync("current")', `${exec}("git", ["rev-parse", "HEAD"])`, `${run}(["git", "init", "-b", "main"])`, `${exec}("git", args); log("merge-base")`]) {
		assert.deepEqual(matches(source), [], `named negative was reported: ${source}`);
	}
});

test("DSP6: detector source does not report itself", () => {
	const source = readFileSync(join(here, "diff-scoped-premises.test.js"), "utf8");
	assert.deepEqual(matches(source), [], "the detector reports its own fragmented pattern source");
});

test("DSP7: detector hits equal the reasoned exemption map exactly", () => {
	const hits = sourceFiles(testRoot)
		.map((path) => ({ file: relative(repo, path), reasons: matches(readFileSync(path, "utf8")) }))
		.filter(({ reasons }) => reasons.length > 0);
	assert.deepEqual(
		hits.map(({ file }) => file),
		[...EXEMPTIONS.keys()].sort(),
		"moving-ref hits and exemptions differ",
	);
	for (const [file, reason] of EXEMPTIONS) {
		assert.ok(reason.trim().length > 0, `${file} has no exemption reason`);
		assert.ok(
			hits.some((hit) => hit.file === file && hit.reasons.length > 0),
			`${file} is a stale exemption`,
		);
	}
});

test("DSP12/DSP13: the guard stays offline and contributor policy states every local rule", () => {
	const source = readFileSync(join(here, "diff-scoped-premises.test.js"), "utf8");
	const offlinePatterns = [new RegExp(token("node:child", "_process")), new RegExp(`\\b${token("fe", "tch")}\\s*\\(`), new RegExp(`\\b${token("im", "port")}\\s*\\(`)];
	for (const pattern of offlinePatterns) assert.doesNotMatch(source, pattern, `the guard must stay local and offline: ${pattern}`);
	const contributing = readFileSync(join(repo, "CONTRIBUTING.md"), "utf8");
	for (const pattern of [/Durable scenario premises/i, /current-tree/i, /pinned immutable/i, /test\/frozen-surfaces\.test\.js/, /`FROZEN`/, /reasoned exemption/i]) {
		assert.match(contributing, pattern, `contributor policy is missing ${pattern}`);
	}
});
