# plan_review — zai/glm-5.2:high — cycle 1 (plan rev 1)

### resolve-panel exit-contract change reopens frozen FS5/ADR 0005 with no ADR revision

- severity: high
- confidence: high
- location: Decisions 2/3/6; "What this delivers" item 5; ADR ledger
- defect: The plan changes resolve-panel's exit contract — under enforcement: preference a sub-target panel must exit 0 where today it exits 1 (under-panel). ADR 0005 (FS5) explicitly freezes resolve-panel "exit codes (0 ok / 1 under-panel / 2 bad input)" and states "changing an exit code is a breaking change." The plan's ADR ledger revises 0001, 0002, 0012, 0015, 0016 but silently omits ADR 0005, and never lists FS5 among reopened surfaces.
- evidence: Plan "What this delivers" item 5; ADR 0005 (docs/adr/0005-script-clis-fs5.md): "exit codes (0 ok / 1 under-panel / 2 bad input) … renaming a flag or changing an exit code is a breaking change."
- impact: A locked consumer contract is reopened without the required ADR revision; downstream processes that branched on exit 1 = under-panel lose a frozen semantic.
- fix: Add a fourth ADR-ledger entry revising ADR 0005 (FS5), and name FS5 alongside FS1/FS2/FS8 as a reopened frozen surface.

### Retaining minVendor as a first-class axis contradicts the shipped OL-A vocabulary that deliberately dropped vendor

- severity: high
- confidence: high
- location: Decision 4/#52; scope item 1; Risks #1; Context (left-open Spec item)
- defect: OL-A (rev 3, shipped v0.8.0) froze lifecycle.gates.*.minPanel as a distinct-model floor and "dropped vendor from the vocabulary entirely"; the shipped resolve-panel lifecycle path computes only modelIdentity and never calls vendor(). This plan retains minVendor as a first-class knob in the merged v2 schema; for a lifecycle adopter it is a dead/unenforceable knob unless vendor computation is re-added — contradicting "lifecycle block carried through unchanged in semantics." The reconciliation is deferred to Spec when it is a reopened semantic decision.
- evidence: OL-A plan rev 3 scope item 2; skills/sdlc/scripts/resolve-panel.mjs:197-261 resolveLifecycle() uses only modelIdentity(); vendor() (137-146) only in resolveV1(). Plan decision 4 and scope item 1.
- impact: A lifecycle adopter configuring minVendor gets a dead knob; the Spec inherits a contradiction; zero-effective-panel-change cannot be defined for a mixed config.
- fix: Adjudicate at plan level: lifecycle present ⇒ model axis only (minVendor not applicable), or explicitly reopen OL-A's vendor removal — not both frozen while claiming "unchanged semantics."

### "Schema break rides a package major" has no enforcement; a feat: commit silently ships a minor and auto-migrates unattended consumers

- severity: medium
- confidence: high
- location: Decision 3/#52; "Release-channel discipline"; Compatibility constraints
- defect: ADR 0012 makes semantic-release derive the bump purely from commit types; nothing in release.yml/commit-lint.yml enforces a BREAKING CHANGE signal. The plan asserts majors-block is "enforced by process… not by code coupling" — circular, since release notes render after the bump is computed. A feat(config) merge yields a minor, silently hitting unpinned consumers.
- evidence: ADR 0012; grep of .github/workflows shows no breaking/major enforcement; plan Compatibility constraints text.
- impact: The binding consumer-safety guarantee is only as strong as an unwritten commit-hygiene norm.
- fix: Add concrete enforcement (CI rule failing when the schemaVersion constant changes without a breaking-change signal), or demote majors-block to a risk with a named fallback.

### Scope contradiction: the plan claims the fold "cures the recorded dogfood drift," but the zero-panel-change guarantee preserves exactly that drift, and map #49 excluded it

- severity: medium
- confidence: high
- location: "What this delivers" item 3; Decision 4; DoD item 8
- defect: The fold maps a no-lifecycle-block adopter (this repo) to enforcement: strict on the vendor axis, preserving the vendor-resolver drift, not curing it; map #49 excluded dogfood drift from the destination.
- evidence: Plan scope item 3; plan decision 4; map #49 "The gap" ("Immediate hygiene, tracked separately from this map — not part of the destination").
- impact: The change either violates its own fixed point or silently re-scopes an excluded item; DoD 8 asserts the preservation that contradicts "cures the drift."
- fix: Strike "curing the recorded dogfood drift" from scope item 3.

### DoD item 1 consumer list is wrong (over- and under-inclusive), breaking the "every consumer" falsifiability

- severity: medium
- confidence: high
- location: DoD item 1
- defect: DoD 1 lists validate-task and check-references as consumers of either old file, but neither reads them; ensure-panel-agent (readConfig at ensure-panel-agent.mjs:55) is omitted.
- evidence: DoD 1 text; grep of consumers; ensure-panel-agent.mjs:55.
- impact: Acceptance tests would miss a real consumer and prove non-consumers; the rationale misattributes the hard-reject to validate-task/check-references.
- fix: Replace the list with the verified set (lib.mjs, resolve-panel, ensure-panel-agent, setup-sdlc, check-lifecycle, sdlc-status) and correct the rationale.

### DoD item 7 ("every CI workflow, gate script, and skill instruction … updated and green") is an unenumerated coverage claim

- severity: low
- confidence: high
- location: DoD item 7
- defect: "Every … is updated and green" cannot be falsified without a manifest of bindings.
- evidence: DoD 7 text; .github/workflows/ci.yml calls check-lifecycle, not resolve-panel; SKILL.md carries resolve-panel prose.
- impact: A missed binding would not be caught.
- fix: Enumerate the concrete bindings in the DoD.

CLEAR: A (rest), C, F as noted in-line.
