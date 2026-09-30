import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const repo = fileURLToPath(new URL("..", import.meta.url));
const read = (path) => readFileSync(join(repo, path), "utf8");
const skillMd = read("skills/sdlc/SKILL.md");
const retroMd = read("skills/sdlc-retro/SKILL.md");
const sysRef = read("skills/sdlc/references/system-reference.md");
const readme = read("README.md");

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
	return line.slice("description:".length).trim();
}

function between(body, startMarker, endMarker) {
	const start = body.indexOf(startMarker);
	const end = body.indexOf(endMarker);
	assert.ok(start >= 0 && end > start, `expected '${startMarker}' before '${endMarker}'`);
	return body.slice(start, end);
}

// Runs a contract over the real text, then proves each clause can fail: every
// required pattern is deleted in turn, and every forbidden sample is appended
// in turn, and the contract must reject each mutant.
function assertContract(label, text, { required = [], forbidden = [] }) {
	const check = (t) => {
		for (const re of required) assert.match(t, re, `${label}: missing ${re}`);
		for (const sample of forbidden) assert.ok(!t.toLowerCase().includes(sample.toLowerCase()), `${label}: contains '${sample}'`);
	};
	check(text);
	for (const re of required) assert.throws(() => check(text.replace(re, "")), `${label}: deleting ${re} must be detected`);
	for (const sample of forbidden) assert.throws(() => check(`${text} ${sample}`), `${label}: adding '${sample}' must be detected`);
}

const DESCRIPTION_CONTRACT = {
	required: [/^Operator-triggered only\. Load this skill only when the operator explicitly asks/],
	// pi parses frontmatter as YAML; ": " inside an unquoted scalar is a parse
	// error, and pi then silently drops the skill.
	forbidden: ["Use at the start of any feature or change", "This is the project law, not a suggestion", ": "],
};

test("both skill descriptions restrict loading to an explicit operator request", () => {
	assertContract("sdlc description", description(skillMd), DESCRIPTION_CONTRACT);
	assertContract("sdlc-retro description", description(retroMd), DESCRIPTION_CONTRACT);
});

test("both skills stay listed to the model so /sdlc-* templates can resolve the skill directory", () => {
	for (const body of [skillMd, retroMd]) assertContract("frontmatter", frontmatter(body), { forbidden: ["disable-model-invocation"] });
});

test("the not-adopted branch neither asks nor mentions adoption, and continues the task", () => {
	assertContract("exit-1 branch", between(skillMd, "**Exit 1 (`not-adopted`)**", "**Exit 2 (`error`)**"), {
		required: [/do NOT announce and do NOT ask/, /Say nothing about\s+the sdlc or its adoption/, /continue the task outside it/],
		forbidden: ["/setup-sdlc", "advisory", "opt in", "offer `"],
	});
});

test("every exit 2 stops; no failing check is handled as not-adopted", () => {
	assertContract("exit-2 branch", between(skillMd, "**Exit 2 (`error`)**", "**Exit 3 (`not-ready`)**"), {
		required: [/Surface the report's diagnostics and\s+stop/, /an error is never a reason to continue outside the\s+lifecycle/],
		forbidden: ["`root.resolve`", "`git.repository`", "exactly as exit 1"],
	});
});

test("the startup gate accepts an explicit consumer root", () => {
	assertContract("startup step 1", between(skillMd, "1. In pi, run", "2. **Exit 0 (`ready`)**"), {
		required: [/with cwd inside the consumer repo or pass `--repo-root`/],
		forbidden: ["without `--repo-root`"],
	});
});

test("advisory mode is gone from the kernel and the system reference", () => {
	assertContract("SKILL.md", skillMd, { forbidden: ["advisory mode"] });
	assertContract("system-reference.md", sysRef, { forbidden: ["advisory mode"] });
});

test("the README states operator-only loading and the silent unadopted path", () => {
	assertContract("README", readme, {
		required: [/Both skills are \*\*operator-triggered\*\*/, /sets the lifecycle aside\s+silently/, /it never asks whether to adopt/],
		forbidden: ["advisory mode"],
	});
});

test("ADR 0030 records the decision and ADRs 0010 and 0015 point to it", () => {
	assert.ok(existsSync(join(repo, "docs/adr/0030-operator-triggered-skills.md")));
	assertContract("ADR 0010", read("docs/adr/0010-opt-in-semantics.md"), { required: [/removed by ADR 0030/] });
	assertContract("ADR 0015", read("docs/adr/0015-adoption-readiness-policy.md"), { required: [/\[ADR 0030\]\(0030-operator-triggered-skills\.md\)/] });
});
