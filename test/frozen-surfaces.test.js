// ASD19 protects contract surfaces that must remain byte-identical to the branch
// base: readiness/lifecycle scripts and shared law, config/validation contracts,
// unchanged panel and validator commands, receipt verification, and plan/spec/task
// validator prompts. The bounded exclusion set moves as one coherent unit.
// Uses git to compare against the base.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

const FROZEN = [
	"skills/sdlc/scripts/sdlc-status.mjs",
	"skills/sdlc/scripts/sdlc-status.sh",
	"skills/sdlc/scripts/check-lifecycle.mjs",
	"skills/sdlc/scripts/check-lifecycle.sh",
	"skills/sdlc/scripts/lib.mjs",
	"skills/sdlc/schema/sdlc.config.schema.json",
	"skills/sdlc/schema/sdlc.config.example.json",
	"skills/sdlc/schema/task-validation-manifest.schema.json",
	"skills/sdlc/scripts/resolve-panel.sh",
	"skills/sdlc/scripts/validate-task.sh",
	"skills/sdlc/scripts/verify-task-receipt.mjs",
	"skills/sdlc/prompts/adversary-plan.prompt.md",
	"skills/sdlc/prompts/adversary-spec.prompt.md",
	"skills/sdlc/prompts/validator-task.prompt.md",
];

const BOUNDED_EXCLUSIONS = ["skills/sdlc/prompts/adversary-review.prompt.md", "skills/sdlc/scripts/resolve-panel.mjs", "skills/sdlc/scripts/validate-task.mjs"];

function exclusionSetIsCoherent(frozen) {
	const frozenCount = BOUNDED_EXCLUSIONS.filter((path) => frozen.includes(path)).length;
	return frozenCount === 0 || frozenCount === BOUNDED_EXCLUSIONS.length;
}

function baseRef() {
	// The branch base: the merge-base with the main line. In CI `main` may not be a
	// local branch (only origin/main is fetched), so try both refs.
	for (const ref of ["main", "origin/main"]) {
		try {
			return execFileSync("git", ["-C", repo, "merge-base", "HEAD", ref], { encoding: "utf8" }).trim();
		} catch {}
	}
	throw new Error("cannot resolve the main-line base ref (main / origin/main)");
}

test("ASD19: frozen surfaces are byte-identical to the branch base", () => {
	const base = baseRef();
	const changed = execFileSync("git", ["-C", repo, "diff", "--name-only", base, "HEAD", "--", ...FROZEN], { encoding: "utf8" }).trim();
	assert.equal(changed, "", `frozen surfaces changed since ${base}:\n${changed}`);
});

test("ASD19: the bounded exclusion set remains coherent", () => {
	for (let count = 0; count <= BOUNDED_EXCLUSIONS.length; count++) {
		assert.equal(exclusionSetIsCoherent(BOUNDED_EXCLUSIONS.slice(0, count)), count === 0 || count === BOUNDED_EXCLUSIONS.length, `${count}/${BOUNDED_EXCLUSIONS.length} frozen`);
	}
	assert.ok(exclusionSetIsCoherent(FROZEN), "the live frozen set contains either none or all bounded exclusions");
});

test("ASD19: FS8/FS9 check ids remain present in their frozen scripts", () => {
	const status = execFileSync("git", ["-C", repo, "show", "HEAD:skills/sdlc/scripts/sdlc-status.mjs"], { encoding: "utf8" });
	for (const id of ["adoption.manifest-head", "config.valid", "workflow.readable"]) assert.ok(status.includes(id), `FS8 id missing: ${id}`);
});
