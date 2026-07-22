// ASD19 (explicit non-changes): the frozen surfaces are byte-identical to the
// branch base. check-lifecycle (FS9), the PV1/PV2 validator, the four reviewer
// prompts, and panel/ceremony law are untouched.
//
// #150 (review-gate config model) intentionally changes the config-schema core:
// lib.mjs (validation + the shared effectiveReview helper), sdlc.config.schema.json
// and sdlc.config.example.json (the { validate, approve } gate dial, schemaVersion
// 3 -> 4), resolve-panel.mjs (the .validate === "skip" guard), and a stale version
// comment in sdlc-status.mjs. Those five are removed from the frozen list here;
// FS8's behaviour (check ids + exits) is unchanged and still guarded by the
// second test below.

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);

const FROZEN = [
	"skills/sdlc/scripts/sdlc-status.sh",
	"skills/sdlc/scripts/check-lifecycle.mjs",
	"skills/sdlc/scripts/check-lifecycle.sh",
	"skills/sdlc/schema/task-validation-manifest.schema.json",
	"skills/sdlc/scripts/resolve-panel.sh",
	"skills/sdlc/scripts/validate-task.mjs",
	"skills/sdlc/scripts/validate-task.sh",
	"skills/sdlc/scripts/verify-task-receipt.mjs",
	"skills/sdlc/prompts/adversary-plan.prompt.md",
	"skills/sdlc/prompts/adversary-spec.prompt.md",
	"skills/sdlc/prompts/adversary-review.prompt.md",
	"skills/sdlc/prompts/validator-task.prompt.md",
];

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

test("ASD19: FS8/FS9 check ids remain present in their frozen scripts", () => {
	const status = execFileSync("git", ["-C", repo, "show", "HEAD:skills/sdlc/scripts/sdlc-status.mjs"], { encoding: "utf8" });
	for (const id of ["adoption.manifest-head", "config.valid", "workflow.readable"]) assert.ok(status.includes(id), `FS8 id missing: ${id}`);
});
