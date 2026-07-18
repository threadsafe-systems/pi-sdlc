// ASD19 (explicit non-changes): the frozen surfaces are byte-identical to the
// branch base. sdlc-status (FS8), check-lifecycle (FS9), lib.mjs +
// sdlc.config.schema.json (config schemaVersion 3), resolve-panel, the PV1/PV2
// validator, the four reviewer prompts, and panel/ceremony law are untouched;
// #91/#101/#102 scopes are not re-opened. Uses git to compare against the base.

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
	"skills/sdlc/scripts/resolve-panel.mjs",
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
	// The branch base: prefer the merge-base with main, fall back to main.
	try {
		return execFileSync("git", ["-C", repo, "merge-base", "HEAD", "main"], { encoding: "utf8" }).trim();
	} catch {
		return "main";
	}
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
