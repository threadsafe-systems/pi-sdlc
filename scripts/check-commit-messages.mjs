#!/usr/bin/env node
// Validates the Conventional Commits header grammar for a set of subjects.
// Usage: node scripts/check-commit-messages.mjs
//   Env: PR_TITLE          (optional) the pull-request title to check
//        COMMIT_RANGE       (optional) e.g. "origin/main..HEAD"; default HEAD~1..HEAD
import { execSync } from "node:child_process";

const TYPES = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
const HEADER = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9][a-z0-9._-]*\\))?(!)?: .+`);

function subjectsInRange(range) {
	const out = execSync(`git log --no-merges --format=%s ${range}`, { encoding: "utf8" });
	return out
		.split("\n")
		.map((s) => s.trim())
		.filter(Boolean);
}

const range = process.env.COMMIT_RANGE || "HEAD~1..HEAD";
const failures = [];
for (const subject of subjectsInRange(range)) {
	if (!HEADER.test(subject)) failures.push(`commit: ${subject}`);
}
const prTitle = (process.env.PR_TITLE || "").trim();
if (prTitle && !HEADER.test(prTitle)) failures.push(`PR title: ${prTitle}`);

if (failures.length) {
	console.error(`Non-conventional commit header(s) found:\n${failures.map((f) => `  - ${f}`).join("\n")}`);
	console.error(`\nExpected: <type>(<scope>)!: <description>  (type ∈ ${TYPES.join(", ")})`);
	process.exit(1);
}
console.log("All commit headers and the PR title follow Conventional Commits.");
