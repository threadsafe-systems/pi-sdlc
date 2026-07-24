# ADR 0013: the task-validation manifest is a frozen surface (PV1)

- Context: the per-task validator previously hard-coded five checks in prose,
  including an unconditional `npx tsc --noEmit` and a `CONTRIBUTORS` grep. That
  is not portable: a non-TypeScript repo cannot honestly pass, and a
  documentation task has no meaningful typecheck. Build already owns each task's
  real check commands and scenario ids, so the gate should execute those, not a
  language the skill imposes.
- Decision: every implementation task carries a committed JSON manifest at
  `docs/validation/<feature>/<task-id>.json` validated by
  `schema/task-validation-manifest.schema.json` (schemaVersion 1). It declares
  checks as exact argv arrays with evidence labels, five mandatory categories
  (`tests`, `static`, `scenarios`, `standards`, `bannedPatterns`) each `required`
  or `n/a` with a Build-approved reason, and an exact owned-scenario → required-
  check mapping. The Build plan is canonical; the manifest is its executable
  projection and is reviewed at the Build human gate. The check set/shape is
  additive within schemaVersion 1; a new required field or category is a major
  bump.
- Consequences: task validation is portable across languages and repos, and a
  task cannot pass because the whole suite happens to be green — only its
  declared, scenario-mapped checks count. `n/a` is a Build decision, never
  validator discretion. A malformed manifest fails before any command runs.

## Amendment (2026-07-24): shape versioning is separate from acceptance-rule
strictness

The pv1-task-scoped-tests plan panel (round 3) surfaced a case this ADR did
not originally consider: `inspectManifest` can gain a **new cross-field
acceptance rule** — one that rejects a previously-valid manifest — **without**
any manifest *shape* change at all (no new required field, no new category).
The original text's bump trigger, "a new required field or category," is
silent on this case, and reading it broadly enough to cover it would also wrongly
capture routine additive changes (a new *optional* field, present here, was
always meant to stay within `schemaVersion 1`).

Owner-adjudicated (2026-07-24, ratified in the pv1-task-scoped-tests Plan
phase): **`schemaVersion` tracks manifest shape, not acceptance-rule
strictness.** An `inspectManifest` rule change that tightens what counts as a
valid manifest — with or without an accompanying optional-field addition — is
real, potentially breaking, and irreversible (SKILL.md's own definition:
changes what an already-committed manifest means), but that irreversibility is
adjudicated by the lifecycle itself (Plan + Spec + panel review, as this
amendment's own originating change was), not signalled via a manifest-embedded
version integer. A schemaVersion bump remains reserved for shape changes: a
new *required* field or category, a changed field type, or a removed field —
changes an old, unmodified manifest cannot possibly satisfy regardless of
what rules run against it. Bumping schemaVersion for a rules-only tightening
would be a false signal in the other direction too: it would suggest existing
compliant manifests need re-authoring for their *shape*, when in fact their
shape is untouched — the acceptance-rule change affects any manifest
re-validated under the new rules, old or newly-authored alike, not only new
ones. What does *not* happen is retroactive invalidation of already-merged
historical receipts: those are hash-verified against their own recorded
content (`verify-task-receipt.mjs`), never re-run through `inspectManifest`,
so a past PASS stays a past PASS on record even though the same manifest
file would newly fail if someone re-validated it today.

Consequence: this ADR's original bump trigger is read narrowly (shape only,
as literally written); rules-only tightenings ship under the existing
schemaVersion, gated by the ordinary lifecycle (irreversible track, Plan+Spec
panels, ADR 0027's coordinated-clean-break policy for co-owned dogfood
repos) rather than a version bump. A future ADR may introduce a distinct
acceptance-rule version axis if this proves insufficient in practice; none
exists today, and inventing one speculatively is out of scope for the change
that prompted this amendment.
