// #150 review-gate config model (schemaVersion 4): the scenarios that don't
// live in the per-surface suites — S9 (scoped stale-vocabulary + version sweep),
// S11 (approve:agent reconciliation across all three design/PR references),
// S12 (ADR records the desugar table + intentional advisory amendment), and
// S17 (agent-approval telemetry directive). Node builtins only.

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const repo = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (rel) => readFileSync(join(repo, rel), "utf8");

// The gate-authoring surfaces: none may carry the old scalar gate grammar.
const GATE_SURFACES = ["skills/sdlc/schema/sdlc.config.schema.json", "skills/sdlc/schema/sdlc.config.example.json", "skills/sdlc/scripts/lib.mjs", "skills/sdlc/scripts/config-doc.mjs", "skills/sdlc/scripts/setup-sdlc.mjs", "skills/sdlc/scripts/setup-sdlc.sh", "templates/setup-sdlc.md"];
// The full swept set (adds prose that legitimately still uses the word
// "advisory" for the unadopted-session advisory MODE / shortfall log prefix).
const SWEPT = [...GATE_SURFACES, "skills/sdlc/SKILL.md", "skills/sdlc/references/phase-plan.md", "skills/sdlc/references/phase-spec.md", "skills/sdlc/references/phase-pr-review.md", "skills/sdlc/references/system-reference.md", "skills/sdlc/scripts/resolve-panel.mjs"];
const VERSION_SWEPT = ["skills/sdlc/scripts/resolve-panel.mjs", "skills/sdlc/scripts/config-doc.mjs", "skills/sdlc/scripts/setup-sdlc.mjs", "skills/sdlc/scripts/setup-sdlc.sh", "skills/sdlc/scripts/sdlc-status.mjs", "skills/sdlc/scripts/lib.mjs"];

// S9 — scoped stale-vocabulary sweep.
test("S9: no removed gate-scalar grammar survives (scoped; legal uses allowed)", () => {
	// (a) no `panel | advisory | human | off` enumeration on any single line anywhere.
	const enumRe = /panel[^\n]*advisory[^\n]*human[^\n]*off/;
	for (const rel of SWEPT) assert.doesNotMatch(read(rel), enumRe, `${rel} still enumerates the removed gate scalars`);
	// (b) the gate-authoring surfaces contain no `advisory` at all (it was only ever a gate value here).
	for (const rel of GATE_SURFACES) assert.doesNotMatch(read(rel), /advisory/, `${rel} still references the removed 'advisory' gate value`);
	// (c) the removed symbols are gone from the core scripts.
	for (const rel of ["skills/sdlc/scripts/lib.mjs", "skills/sdlc/scripts/resolve-panel.mjs", "skills/sdlc/scripts/config-doc.mjs"]) {
		assert.doesNotMatch(read(rel), /decomposeGateMode|GATE_MODES/, `${rel} still references a removed gate-mode symbol`);
	}
	// (d) legal `advisory` uses ARE still present (proves the sweep is scoped, not a blanket ban).
	assert.match(read("skills/sdlc/SKILL.md"), /advisory mode/);
	assert.match(read("skills/sdlc/scripts/resolve-panel.mjs"), /advisory\[\$\{phase\}\]/);
	// (e) version-string sweep: no stale v3 in the swept scripts.
	for (const rel of VERSION_SWEPT) assert.doesNotMatch(read(rel), /schemaVersion[ -]3\b|requires 3\)|fresh v3/, `${rel} carries a stale v3 version string`);
});

// S11 — approve:agent reconciliation across all three design/PR references.
test("S11: phase-plan, phase-spec, and phase-pr-review reconcile approve:agent (no unconditional human gate)", () => {
	for (const rel of ["skills/sdlc/references/phase-plan.md", "skills/sdlc/references/phase-spec.md"]) {
		const body = read(rel);
		assert.match(body, /effective approver/, `${rel} must describe the effective approver`);
		assert.match(body, /approve: ?agent|approve: agent|`approve: agent`/, `${rel} must name approve: agent`);
		assert.doesNotMatch(body, /design gate plus human approval/, `${rel} still asserts an unconditional human gate`);
	}
	const pr = read("skills/sdlc/references/phase-pr-review.md");
	assert.match(pr, /approve: ?agent/);
	assert.match(pr, /no human\s*\n?\s*>?\s*escalation|no human escalation/);
});

// S12 — the ADR records the desugar table and the intentional advisory amendment.
test("S12: ADR 0030 records the desugar table and the intentional advisory amendment", () => {
	const adr = read("docs/adr/0030-review-gate-validate-approve-decomposition.md");
	assert.match(adr, /validate: panel, approve: agent/); // the advisory row
	assert.match(adr, /intentional amendment/i);
	assert.match(adr, /validate.*approve/); // the vocabulary
});

// S17 — agent-approval telemetry directive.
test("S17: system-reference telemetry directive covers agent approvals", () => {
	const sysref = read("skills/sdlc/references/system-reference.md");
	assert.match(sysref, /every gate approval \(human or agent\)/i);
	assert.doesNotMatch(sysref, /- \*\*Every human gate approval\*\*/); // the human-only phrasing is gone
});
