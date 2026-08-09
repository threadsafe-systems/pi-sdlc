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
	["test/gate-presentation-contract.test.js", "GPC11's Given mandates manifest and fixture comparison against the merge-base; a branch-scoped diff guard in the same class as frozen-surfaces."],
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

function statesMovingPinnedLaw(section) {
	return [/\bpremise\b/i, /\bmoving ref\b/i, /\bexpire\w*\b/i, /\bcurrent tree\b/i, /\bpinned immutable commit\b/i].every((anchor) => anchor.test(section));
}

function invertsMovingPinnedLaw(section) {
	const premiseDenied = /\b(?:(?:it is )?(?:false|not true) that|cannot be true that)\b[\s\S]{0,50}\bpremise\b[\s\S]{0,100}\bmoving ref\b/i.test(section);
	const expiryDenied = /\bmoving ref\b[\s\S]{0,35}\b(?:never|not|cannot|can't|won't|no longer|does not ever)\b[\s\S]{0,20}\bexpire\w*\b/i.test(section);
	const routeDenied = /\b(?:do not|don't|must not|never)\s+assert\b[\s\S]{0,40}\bcurrent tree\b/i.test(section);
	return premiseDenied || expiryDenied || routeDenied;
}

function lawIssues(section) {
	const issues = [];
	if (!statesMovingPinnedLaw(section) || invertsMovingPinnedLaw(section)) issues.push("moving-ref expiry and pinned-current-tree route");
	if (!/non-change claim[\s\S]{0,100}falsifiable only by a diff[\s\S]{0,120}standing diff guard/i.test(section)) issues.push("non-change route");
	return issues;
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
		assert.equal(statesMovingPinnedLaw(body), false, `${entry.name} duplicates the moving-ref-versus-pinned law`);
	}
});

test("DSP2: phase-implement §4 points to the law without restating it", () => {
	assert.match(implementActivity, /phase-spec\.md[\s\S]*§4/i);
	assert.match(implementActivity, /standing diff guard/i);
	assert.equal(statesMovingPinnedLaw(implementActivity), false, "the implementation pointer must not restate the moving-ref-versus-pinned law");
});

test("DSP3: every concept anchor and semantic direction is load-bearing", () => {
	for (const anchor of [/\bmoving\b/i, /\bexpire\w*\b/i, /\bpinned\b/i]) {
		assert.match(specActivity, anchor, `the baseline law does not contain ${anchor}`);
		const mutated = specActivity.replace(anchor, "removed");
		assert.notEqual(mutated, specActivity, `the mutation did not remove ${anchor}`);
		assert.notEqual(lawIssues(mutated).length, 0, `removing ${anchor} must break the law check`);
	}
	for (const inverted of [
		specActivity.replace("moving ref expires", "moving ref cannot expire"),
		specActivity.replace("moving ref expires", "moving ref won't expire"),
		specActivity.replace("moving ref expires", "moving ref no longer expires"),
		specActivity.replace("moving ref expires", "moving ref does not ever expire"),
		specActivity.replace(/A\s+premise/, "It is false that a premise"),
		specActivity.replace(/A\s+premise/, "It is not true that a premise"),
		specActivity.replace("assert the current tree", "do not assert the current tree"),
	]) {
		assert.notEqual(lawIssues(inverted).length, 0, "inverting either semantic direction must break the law check");
	}
	for (const route of ["assert the current tree or a pinned immutable commit", "use the current tree or a pinned immutable commit", "rely on the current tree or a pinned immutable commit", "check against the current tree or a pinned immutable commit", "rely on a pinned immutable commit or the current tree"]) {
		const duplicated = `${implementActivity}\nA premise anchored to a moving ref expires; ${route}.`;
		assert.equal(statesMovingPinnedLaw(duplicated), true, `the '${route}' duplication probe must reproduce the forbidden law shape`);
	}
});

test("DSP4: the detector recursively enumerates every required source extension", () => {
	assert.deepEqual([...SOURCE_EXTENSIONS].sort(), [".cjs", ".js", ".mjs"], "the required extension vocabulary drifted");
	const files = sourceFiles(testRoot).map((path) => relative(repo, path));
	assert.ok(files.includes("test/e2e/harness.mjs"), "the recursive sweep omitted the nested e2e harness");
	assert.ok(files.includes("test/diff-scoped-premises.test.js"), "the detector does not scan itself");
});

test("DSP5: every detector variant is non-vacuous and named negatives stay clean", () => {
	const exec = token("exec", "File", "Sync");
	const spawn = token("spawn", "Sync");
	const run = token("run", "Process");
	const refHelper = token("ba", "se", "Ref");
	const fileHelper = token("ba", "se", "File");
	const positives = [
		[`function ${refHelper}() {}`, "base helper"],
		[`${fileHelper}("path")`, "base helper"],
		[`${exec}("git", ["merge-base", "HEAD", "main"])`, "git merge-base invocation"],
		[`${spawn}("git", ["merge-base", "HEAD", "origin/main"])`, "git merge-base invocation"],
		[`${run}(["git", "merge-base", "HEAD", "main"])`, "git merge-base invocation"],
		[`${run}(["git", "show", "origin/main:path"])`, "git show/diff with inline moving ref"],
		[`${exec}("git", ["show", "main:path"])`, "git show/diff with inline moving ref"],
		[`${spawn}("git", ["diff", "origin/main"])`, "git show/diff with inline moving ref"],
	];
	for (const [source, reason] of positives) assert.ok(matches(source).includes(reason), `${reason} variant is vacuous: ${source}`);
	for (const source of ['readFileSync("current")', `${exec}("git", ["rev-parse", "HEAD"])`, `${exec}("git", ["show", "HEAD:path"])`, `${spawn}("git", ["diff", "HEAD"])`, `${run}(["git", "init", "-b", "main"])`, `${exec}("git", args); log("merge-base")`]) {
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
	const staticLoad = ["im", "port"].join("");
	const staticExpose = ["ex", "port"].join("");
	const allowedImports = [`${staticLoad} assert from "node:assert/strict";`, `${staticLoad} { readFileSync, readdirSync } from "node:fs";`, `${staticLoad} { dirname, extname, join, relative } from "node:path";`, `${staticLoad} { fileURLToPath } from "node:url";`, `${staticLoad} { test } from "node:test";`];
	assertExactImports(source, allowedImports);
	for (const mutation of [
		`${staticLoad} "node:https"`,
		`\t${staticLoad} { execFileSync as run } from "node:child_process";`,
		`/* preload */ ${staticLoad} { execFileSync as run } from "node:child_process";`,
		`${staticExpose} * from "./helper.mjs";`,
		`${staticLoad} {\n\t// from "node:fs"\n\texecFileSync\n} from "node:child_process";`,
	]) {
		assert.throws(() => assertExactImports(`${source}\n${mutation}`, allowedImports), `prohibited module load must disturb the exact prelude: ${mutation}`);
	}
	const offlinePatterns = [new RegExp(`\\b${token("fe", "tch")}\\s*\\(`), new RegExp(`\\b${token("im", "port")}\\s*\\(`)];
	for (const pattern of offlinePatterns) assert.doesNotMatch(source, pattern, `the guard must stay local and offline: ${pattern}`);
	const contributing = readFileSync(join(repo, "CONTRIBUTING.md"), "utf8");
	for (const pattern of [/Durable scenario premises/i, /current-tree/i, /pinned immutable/i, /test\/frozen-surfaces\.test\.js/, /`FROZEN`/, /reasoned exemption/i]) {
		assert.match(contributing, pattern, `contributor policy is missing ${pattern}`);
	}
});
