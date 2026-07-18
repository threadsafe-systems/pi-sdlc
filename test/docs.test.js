// Offline doc-presence tests (spec OH7, OH8, OH9, OH12; AR build T4: AR10
// startup-contract mutation tests, AR11 migration completeness). Greps over
// committed docs; no model calls. An outline shows shape; these assert the
// normative text the spec requires is actually present, and that removing any
// required startup branch or prohibition is detected.

import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const skillMd = readFileSync(join(repo, "skills", "sdlc", "SKILL.md"), "utf8");
const readme = readFileSync(join(repo, "README.md"), "utf8");
const adrDir = join(repo, "docs", "adr");
const setupTemplate = readFileSync(join(repo, "templates", "setup-sdlc.md"), "utf8");
const statusSh = readFileSync(join(repo, "skills", "sdlc", "scripts", "sdlc-status.sh"), "utf8");
const statusMjs = readFileSync(join(repo, "skills", "sdlc", "scripts", "sdlc-status.mjs"), "utf8");
const reviewPrompt = readFileSync(join(repo, "skills", "sdlc", "prompts", "adversary-review.prompt.md"), "utf8");
const prTemplate = readFileSync(join(repo, ".github", "pull_request_template.md"), "utf8");
const ciWorkflow = readFileSync(join(repo, ".github", "workflows", "ci.yml"), "utf8");
const sysRef = readFileSync(join(repo, "skills", "sdlc", "references", "system-reference.md"), "utf8");
const prReviewRef = readFileSync(join(repo, "skills", "sdlc", "references", "phase-pr-review.md"), "utf8");
const implementRef = readFileSync(join(repo, "skills", "sdlc", "references", "phase-implement.md"), "utf8");

test("OH7: readiness/hooks law lives in the system reference; SKILL keeps the red flags", () => {
	assert.match(sysRef, /^## 3\. Adoption & readiness$/m);
	assert.match(sysRef, /### Hooks \(local workflow\)$/m);
	assert.match(sysRef, /\[sdlc hook\]/);
	assert.match(sysRef, /creating one is not enough/);
	assert.match(skillMd, /Skipping or silently reordering a configured phase hook\./);
	assert.match(skillMd, /Writing to the main checkout after creating a worktree\./);
});

test("OH7: the Implement table row no longer prescribes 'in a worktree'", () => {
	const implementRow = skillMd.split("\n").find((l) => l.startsWith("| Implement |"));
	assert.ok(implementRow, "Implement row must exist");
	assert.ok(!implementRow.includes("in a worktree"), `Implement row still prescribes a worktree: ${implementRow}`);
});

test("OH8: announce-on-fire + workflow.md enumeration in system reference; conflict rule in SKILL", () => {
	assert.match(sysRef, /\[sdlc hook\] <phase>:<before\|after> run\$ <command>/);
	assert.match(sysRef, /\[sdlc hook\] <phase>:<before\|after> result: ok/);
	assert.match(sysRef, /enumerate\s+each top-level bullet/);
	assert.match(skillMd, /local rules may ADD gates, never remove or weaken/);
});

test("OH9: exactly two new ADRs (opt-in, hooks) with context/decision/consequences", () => {
	const files = readdirSync(adrDir).filter((f) => /^00(10|11)-/.test(f));
	assert.equal(files.length, 2, `expected 0010 + 0011, got ${files.join(", ")}`);
	for (const f of files) {
		const body = readFileSync(join(adrDir, f), "utf8");
		assert.match(body, /- Context:/, `${f} missing Context`);
		assert.match(body, /- Decision:/, `${f} missing Decision`);
		assert.match(body, /- Consequences:/, `${f} missing Consequences`);
	}
});

test("OH12: README has the opt-in story and drops the old no-manifest-defaults claim", () => {
	assert.match(readme, /\/setup-sdlc/);
	assert.match(readme, /has not committed .*sdlc\.config\.json|has not adopted|opt/i);
	assert.ok(!readme.includes("the skill still runs phases + panels using built-in defaults"), "README must not keep the old 'runs with defaults' claim");
});

test("FS9/FS10 dogfood assets are present", () => {
	assert.match(prTemplate, /```sdlc[\s\S]*^track: reversible$[\s\S]*^slug: /m);
	assert.match(ciWorkflow, /check-lifecycle\.mjs --event/);
	assert.match(skillMd, /check-lifecycle/);
	assert.match(readme, /adoption bundle/i);
});

test("FS9 documentation carries declaration rules and reversible grounding", () => {
	for (const marker of ["irreversible", "reversible", "none", "slug", "reason", "[bot]", "check-lifecycle"]) assert.ok(skillMd.includes(marker), `missing ${marker}`);
	assert.match(reviewPrompt, /<TRACK>/);
	assert.match(reviewPrompt, /<GOVERNING_DOCS>/);
	assert.match(reviewPrompt, /When `<TRACK>` is `reversible`/);
	assert.match(prReviewRef, /populate the prompt's `<TRACK>` from the PR\s+declaration/);
	assert.match(prReviewRef, /`<GOVERNING_DOCS>`\s+from the linked documents/);
	assert.match(prReviewRef, /never send\s+literal\s+placeholders/);
	assert.doesNotMatch(skillMd, /CI checks\\s+the declared track's artifacts are committed/);
});

test("FS9 and FS10 ADRs freeze the new surfaces", () => {
	const adr17 = readFileSync(join(adrDir, "0017-lifecycle-checker-fs9.md"), "utf8");
	const adr18 = readFileSync(join(adrDir, "0018-adoption-bundle-fs10.md"), "utf8");
	for (const body of [adr17, adr18]) for (const marker of [/- Context:/, /- Decision:/, /- Consequences:/, /schema version 1/]) assert.match(body, marker);
});

// ---------------------------------------------------------------------------
// AR10 — the startup contract has four branches and the pre-exit-0 prohibitions,
// each mutation-tested: removing the fragment must be detectable.
// ---------------------------------------------------------------------------

const STARTUP_FRAGMENTS = {
	"exit 0 (ready) branch": /\*\*Exit 0 \(`ready`\)\*\*: announce/,
	"exit 1 (not-adopted) branch": /\*\*Exit 1 \(`not-adopted`\)\*\*: do NOT announce/,
	"exit 2 (error) branch": /\*\*Exit 2 \(`error`\)\*\*: do NOT announce/,
	"exit 3 (not-ready) branch": /\*\*Exit 3 \(`not-ready`\)\*\*: do NOT announce/,
	"error is never advisory": /never .*downgraded to advisory/,
	"not-ready is not bypassed": /Do not\s+offer advisory mode as a bypass/,
	"prohibition: enter a phase": /MUST\s+NOT\s+enter\s+any\s+lifecycle\s+phase/,
	"prohibition: fire hooks": /MUST\s+NOT\s+fire\s+configured\s+hooks/,
	"prohibition: stamp agents": /MUST\s+NOT\s+stamp\s+panel\s+agents/,
	"prohibition: tracker mutation": /MUST\s+NOT\s+create\s+or\s+mutate\s+tracker\s+objects/,
	"prohibition: claim gates": /MUST\s+NOT\s+claim\s+any\s+gate\s+as\s+passed/,
};

test("AR10: all four startup branches and every prohibition are present and mutation-detectable", () => {
	// scope to the startup block: the advisory section repeats some prohibitions
	const start = skillMd.indexOf("## Readiness gate and announcement");
	const end = skillMd.indexOf("## The iron law");
	assert.ok(start >= 0 && end > start, "startup section must exist before the iron-law section");
	const startupSection = skillMd.slice(start, end);
	for (const [label, re] of Object.entries(STARTUP_FRAGMENTS)) {
		assert.match(startupSection, re, `SKILL.md startup section missing: ${label}`);
		const mutated = startupSection.replace(re, "");
		assert.doesNotMatch(mutated, re, `mutation of '${label}' must be detected (fragment appears once)`);
	}
});

test("AR10: docs never equate manifest presence with readiness or claim mechanical agent enforcement", () => {
	assert.match(skillMd, /current `HEAD` commit|committed in .*HEAD|current `?HEAD`? /, "adoption must be defined against HEAD");
	assert.match(skillMd, /merely present on disk .*is not adoption|not adoption/, "filesystem presence must be disclaimed");
	assert.ok(!skillMd.includes("mechanically enforces agent behaviour"), "no claim of mechanical agent enforcement");
});

// ---------------------------------------------------------------------------
// AR11 — migration is complete: README/SKILL/setup + ADRs
// ---------------------------------------------------------------------------

const MIGRATION_FRAGMENTS = {
	"former exit 0 may become exit 3": /may now\s+exit 3/,
	"non-git roots move to exit 2": /non-git .*exit 2/i,
	"non-git historic exit 1 and 0": /exited\s+1\s+without\s+a\s+manifest\s+and\s+0\s+with/,
	"exit 3 is new": /exit 3 is new/i,
	"explicit 0\\/1\\/2\\/3 branching": /branch\s+on\s+0\/1\/2\/3\s+explicitly/,
	"legacy keys removed": /`opted-in:`.*removed|legacy text .*keys .*removed|legacy .*summary keys/,
	"prefer json": /--format json/,
};

test("AR11: README carries the complete migration story", () => {
	for (const [label, re] of Object.entries(MIGRATION_FRAGMENTS)) {
		assert.match(readme, re, `README missing migration item: ${label}`);
	}
});

test("AR11: ADR 0010 is superseded and the policy ADR 0015 restates the migration", () => {
	const adr10 = readFileSync(join(adrDir, "0010-opt-in-semantics.md"), "utf8");
	assert.match(adr10, /[Ss]uperseded by ADR 0015/);
	const adr15 = readFileSync(join(adrDir, "0015-adoption-readiness-policy.md"), "utf8");
	for (const marker of [/- Context:/, /- Decision:/, /- Consequences/]) {
		assert.match(adr15, marker, `ADR 0015 missing ${marker}`);
	}
	assert.match(adr15, /mechanically enforce/i, "ADR 0015 must state 0010's intent is now mechanically enforced");
	assert.match(adr15, /may now exit 3/);
	assert.match(adr15, /non-git roots move to exit 2/i);
	assert.match(adr15, /Supersedes: ADR 0010/);
});

test("AR11: ADR 0016 freezes the FS8 machine surface", () => {
	const adr16 = readFileSync(join(adrDir, "0016-status-surface-fs8.md"), "utf8");
	for (const marker of [/- Context:/, /- Decision:/, /- Consequences/]) {
		assert.match(adr16, marker, `ADR 0016 missing ${marker}`);
	}
	assert.match(adr16, /schema version 1|schemaVersion.*1/i);
	for (const id of ["cli.arguments", "root.resolve", "git.repository", "adoption.manifest-head", "adoption.manifest-clean", "config.valid", "models.head", "models.clean", "models.valid", "workflow.readable"]) {
		assert.ok(adr16.includes(id), `ADR 0016 must freeze check id ${id}`);
	}
	assert.match(adr16, /0 `ready`, 1 `not-adopted`, 2 `error`, 3 `not-ready`/);
});

test("AR11: no stale opted-in output claim remains in shipped guidance", () => {
	for (const [name, body] of Object.entries({ "SKILL.md": skillMd, "README.md": readme, "templates/setup-sdlc.md": setupTemplate, "sdlc-status.sh": statusSh })) {
		assert.doesNotMatch(body, /opted-in: (yes|no)/, `${name} still claims the legacy opted-in output`);
	}
});

test("AR11: wrapper help/comments and .mjs usage match the FS8 invocation", () => {
	assert.match(statusSh, /--format text\|json/, "wrapper comment must show --format");
	assert.match(statusSh, /0 ready.*1 not-adopted.*2 error.*3 not-ready|0 = ready/s, "wrapper must document the four exits");
	assert.match(statusMjs, /usage: sdlc-status\.sh \[--config DIR \| --repo-root DIR\] \[--format text\|json\]/);
});

test("AR11: the setup template requires committing .pi\u2044sdlc and points at the status gate", () => {
	assert.match(setupTemplate, /commit `\.pi\/sdlc\/`/);
	assert.match(setupTemplate, /sdlc-status/);
	assert.match(setupTemplate, /exit 0|ready/);
});

// ---------------------------------------------------------------------------
// CV29-CV32 — merged bindings, dogfood, skill law, and ADR ledger.
// ---------------------------------------------------------------------------

test("CV29: CI and shipped bindings point at the merged config surface", () => {
	assert.match(ciWorkflow, /fetch-depth: 0/);
	assert.match(ciWorkflow, /check-schema-break\.mjs --event/);
	for (const [name, body] of Object.entries({ "SKILL.md": skillMd, "ci.yml": ciWorkflow, "README.md": readme })) {
		assert.doesNotMatch(body, /sdlc\.models\.json/, `${name} retains the retired binding`);
	}
	assert.doesNotMatch(skillMd, /sdlc\.models\.schema\.json/);
});

test("CV30: repository and consumer dogfood fixtures use one schemaVersion-3 config", () => {
	for (const root of [repo, join(repo, "test", "fixtures", "consumer")]) {
		const dir = join(root, ".pi", "sdlc");
		let config;
		try {
			config = JSON.parse(readFileSync(join(dir, "sdlc.config.json"), "utf8"));
		} catch (error) {
			assert.fail(`invalid dogfood config at ${root}: ${error.message}`);
		}
		assert.equal(config.schemaVersion, 3);
		assert.ok(config.review && config.shape, `${root} lacks v3 review/shape`);
		assert.ok(config.panels && typeof config.panels === "object", `${root} lacks merged panels`);
		assert.equal(existsSync(join(dir, "sdlc.models.json")), false, `${root} retains the retired models file`);
	}
});

test("CV31: startup clean-break and shortfall carry instructions are explicit", () => {
	assert.match(skillMd, /`config\.schema-current`[\s\S]*sanctioned actions[\s\S]*re-run `setup-sdlc`/);
	assert.match(skillMd, /there is no pre-adoption config fold-forward/);
	assert.match(skillMd, /Never hand-edit `schemaVersion` or the config shape/);
	assert.match(prReviewRef, /merged config's\s+`panels` block/);
	assert.match(prReviewRef, /`proceed`-mode\s+shortfall advisory[\s\S]*consolidated writeup[\s\S]*PR\s+itself/);
	assert.match(prReviewRef, /Do not\s+commit a\s+standalone\s+decision log/);
});

test("CV32: five migration ADRs exist and amended decisions link forward", () => {
	const decisions = ["0021-merged-config-schema-and-release-guard.md", "0022-user-owned-panel-enforcement-posture.md", "0023-status-surface-fs8-v2.md", "0024-script-clis-fs5-v2.md", "0025-adoption-bundle-fs10-v2.md"];
	for (const file of decisions) {
		const body = readFileSync(join(adrDir, file), "utf8");
		for (const marker of [/## Context/, /## Decision/, /## Consequences/]) assert.match(body, marker, `${file} missing ${marker}`);
	}
	const fs10v2 = readFileSync(join(adrDir, "0025-adoption-bundle-fs10-v2.md"), "utf8");
	const migrationSpec = readFileSync(join(repo, "docs/specs/2026-07-16-config-versioning-migration.md"), "utf8");
	for (const [name, body] of Object.entries({ fs10v2, migrationSpec })) {
		assert.match(body, /single-writer boundary/i, `${name} lacks the ratified concurrency boundary`);
		assert.match(body, /concurrent\s+writes[\s\S]*residual risk/i, `${name} lacks the residual-risk disposition`);
	}
	const forwards = {
		"0001-config-schema-fs1.md": "ADR 0021",
		"0002-models-schema-fs2.md": "ADR 0021",
		"0005-script-clis-fs5.md": "ADR 0024",
		"0012-release-versioning-policy.md": "ADR 0021",
		"0015-adoption-readiness-policy.md": "ADR 0023",
		"0016-status-surface-fs8.md": "ADR 0023",
		"0018-adoption-bundle-fs10.md": "ADR 0025",
	};
	for (const [file, marker] of Object.entries(forwards)) assert.match(readFileSync(join(adrDir, file), "utf8"), new RegExp(marker), `${file} lacks ${marker}`);
});

test("RB1 (BT1): the PR reference requires check-completion.mjs before a complete/PASS claim", () => {
	assert.match(skillMd, /check-completion\.mjs/);
	assert.match(skillMd, /a false summit/);
	assert.match(prReviewRef, /--claim pr-open/);
	assert.match(prReviewRef, /--claim epic-done/);
	assert.match(prReviewRef, /Completion is\s+machine-checked, not narrated/);
});

test("RB2 (BT2): the Implement reference states the worker task-prompt shape and infra-retry-once rule", () => {
	assert.match(implementRef, /## 10\. Dispatching implementation workers/);
	assert.match(implementRef, /toolBudget/);
	assert.match(implementRef, /turnBudget/);
	assert.match(implementRef, /finalize now/i);
	assert.match(implementRef, /infra-class failure/);
	assert.match(implementRef, /Retry that exact dispatch once, automatically/);
});

test("RB3 (BT3): the system reference states the stall-detection threshold and self-resume action", () => {
	assert.match(sysRef, /## 13\. Stall detection and self-resume/);
	assert.match(sysRef, /2 consecutive\s*\n?\s*turns/);
	assert.match(sysRef, /self-issue a continuation\/retry/);
	assert.match(sysRef, /interim, prose-level mitigation/);
	assert.match(sysRef, /this\s+project does not own or ship/);
});

test("RB4 (panel recovery): the PR reference advances failed reviewers through the configured prefer list", () => {
	assert.match(prReviewRef, /Reviewer dispatch recovery/);
	assert.match(prReviewRef, /next untried, credentialed\s*\n?\s*model/);
	assert.match(prReviewRef, /Do not count a failed model\s*\n?\s*against the configured panel floor/);
	assert.match(prReviewRef, /review\.onShortfall/);
	assert.match(prReviewRef, /Never substitute an unconfigured model/);
});
