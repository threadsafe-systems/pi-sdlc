# Plan: PV1 task-scoped test declaration + scenario-evidence tightening

- **Track:** irreversible (PV1 is a portable validator contract every adopting
  repo's committed manifests bind to; tightening its acceptance rules changes
  what an already-committed manifest means on skill upgrade — see Brainstorm
  Finding 1).
- **Slug:** `pv1-task-scoped-tests`
- **Brainstorm:** approved 2026-07-24 (human:neil), with two corrections
  surfaced and ratified in-session: (1) track reclassified reversible→
  irreversible; (2) the validator's job stays purely mechanistic — no
  diff-correspondence judgement in `task_validate` — visibility is achieved
  structurally instead (see Rationale).

## Objective

Today a PV1 manifest satisfies its `tests` category and any scenario's test
evidence by pointing at a single whole-suite check (conventionally
`tests.full`, e.g. `npm test`). The validator's only inference is "did the
suite run" — there is no visibility into *which* tests a task actually
introduced or modified to earn its scenario evidence. Require every manifest
with a required `tests` category to also declare at least one **task-scoped**
test check (naming convention: id prefix `tests.task`) whose argv runs
specifically the tests introduced/modified by that task, and require scenario
evidence to cite that task-scoped check rather than the full-suite check alone.
The full suite keeps running as a regression net; it stops being the *only*
evidence for what a task actually tested.

## Rationale

- **Structural, not judgement-based.** `task_validate`'s mandate
  (`prompts/validator-task.prompt.md`) is explicitly mechanistic — no quality
  opinions, no diff review, judgement is the PR panel's job. So this slice does
  not ask the validator to check that the declared task-scoped tests
  *correspond* to the diff. It instead makes the right evidence land in the
  receipt for free: the task-scoped check's exact argv and stdout tail (naming
  the specific tests that ran) is already captured by the existing evidence-
  bounding/redaction pipeline once the check is declared. A human, or the PR
  panel (which *is* mandated to judge), can eyeball it. No new judgement
  machinery, no mandate conflict.
- **Portable naming convention, not a hardcoded id.** Rather than reserving a
  single magic check id (e.g. treating literal `"tests.full"` as forbidden),
  the law is a reserved **prefix**: any check id matching `^tests\.task` is a
  task-scoped test check. This lets any adopting repo name its task-scoped
  checks however it likes past the prefix, using whatever test runner/filter
  syntax it has (`--test path`, `--test-name-pattern`, a package-script per
  task, etc.) — `inspectManifest` only cares about the prefix, never the argv
  shape.
- **Track (Brainstorm Finding 1).** PV1/PV2 is consumed by every repo that has
  adopted the sdlc skill (this repo, and Case as co-owned dogfood) — their
  committed manifests are validated against whatever `inspectManifest` rules
  ship in the pinned skill version. Tightening those rules means a manifest
  that validated cleanly under the old rules can start failing
  `inspectManifest` (a `manifest-error`, not a check failure) after a skill
  upgrade with no change to the manifest itself. That is a breaking change to
  a public contract other repos commit to — the SKILL.md iron law's own
  definition of irreversible, and its own tiebreaker
  (`shape.defaultTrack: irreversible`) agrees.

## Scope

**In:**
1. `inspectManifest` (`validate-task.mjs`): two new structural rules.
   - **Rule A:** when `categories.tests.applicability === "required"`, its
     `checkIds` must include at least one id matching `/^tests\.task/`
     (case-sensitive, following the existing `ID_RE` grammar
     `^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$`, so `tests.task`, `tests.task-t3`,
     `tests.task.emitter` are all valid; `tests.taskless` is *not* excluded by
     this pattern deliberately narrow scope — regex is `/^tests\.task(?:[.-]|$)/`
     to avoid a false-positive prefix match — confirm exact regex in Spec).
   - **Rule B:** when `categories.scenarios.applicability === "required"`, for
     every owned scenario's evidence array, restrict to ids that are also
     referenced by the `tests` category's `checkIds`; if that restricted set is
     non-empty, at least one of those ids must match the same `tests.task`
     pattern. (A scenario evidenced purely by non-test categories — e.g. a pure
     static/lint scenario — is unaffected; this rule only bites when a scenario
     cites a `tests`-category check at all.)
   - Both rules degrade cleanly for tasks with **no** owned scenarios (Rule B
     is vacuous) and for tasks where `categories.tests` is `n/a` (both rules
     vacuous) — e.g. a pure-docs task.
2. `schema/task-validation-manifest.schema.json`: mirror both rules if the
   schema can express them (a regex `pattern` on an array-membership condition
   may need a JSON Schema `contains`/`if`/`then` construct, or the rules may
   stay `inspectManifest`-only with the schema documenting them in
   `description` — resolved in Spec/Build once the exact JSON Schema
   expressiveness is checked).
2. `references/phase-tasks.md` / `references/phase-implement.md`: document the
   `tests.task*` law and the scenario-evidence rule as part of Build's manifest
   authoring guidance.
3. `prompts/validator-task.prompt.md`: no mandate change (confirmed
   unnecessary per Rationale) — but check whether its "Checks" list needs a
   one-line update so the reviewer reports the task-scoped check's result
   distinctly from the full-suite check's (it already reports every command by
   id, so likely no change; confirm in Build).
4. Migration note for **existing** manifests in this repo
   (`docs/validation/*/*.json`): they predate this law and will now fail
   `inspectManifest` if re-validated. They are historical receipts, not
   re-validated — `verify-task-receipt.mjs` only hash-checks self-consistency,
   never re-runs `inspectManifest`. No retroactive migration needed; the law
   applies to manifests authored from this change forward. State this
   explicitly as a compatibility note (Spec scenario territory).
5. Regression tests in `test/portable-validator.test.js` (or wherever PV1/PV2
   tests live — confirm exact file in Build) for both new rules: positive
   (compliant manifest passes), negative (Rule A violation: required tests
   category with only `tests.full`; Rule B violation: a scenario's evidence
   pointing only at `tests.full`), and the two vacuous cases (no scenarios;
   `tests: n/a`).

**Out:**
- Any diff-correspondence judgement capability in `task_validate` (rejected in
  Brainstorm Finding 2).
- Retroactively migrating this repo's own historical manifests under
  `docs/validation/` to comply (they are receipts of past, already-merged
  work; out of scope).
- Any change to `schemaVersion` (stays 1 — this is a tightening of validation
  *rules*, not a shape/field change to the manifest itself, so it is additive
  at the JSON level even though it is contract-breaking at the *acceptance*
  level; Spec should state this distinction precisely as it is the crux of the
  irreversible classification).
- Coordinating a simultaneous change to Case (co-owned dogfood, per ADR
  0027 policy) — Case's own manifests are authored going forward under
  whatever pi-sdlc version it's pinned to; no forced lockstep bump is in scope
  here, consistent with how every other pi-sdlc skill-behavior change has
  shipped.

## Definition of done

1. `inspectManifest` rejects a manifest with `categories.tests: required` whose
   `checkIds` contain no `tests.task*`-prefixed id, with a clear diagnostic
   naming the missing law.
2. `inspectManifest` rejects a manifest with `categories.scenarios: required`
   where any scenario's evidence cites a `tests`-category check but none of
   those cited ids is `tests.task*`-prefixed.
3. A manifest with `categories.tests: n/a` or zero owned scenarios is
   unaffected by both rules (regression-tested).
4. `references/phase-tasks.md`/`phase-implement.md` document the law for Build
   authors.
5. Full test corpus green; touched files biome-clean; no change to
   `schemaVersion`.
6. A Specification exists (irreversible track) with falsifiable scenarios
   covering DoD 1–3, reviewed by a plan panel (this doc) and a spec panel
   (the Spec doc), both converged clean before Build.

## Context for the next agent

- Core file: `skills/sdlc/scripts/validate-task.mjs`, `inspectManifest`
  function (read via `read_symbol` before editing — do not re-derive its
  structure from memory; it has five interacting category branches already).
- Reserved-prefix regex needs Spec-level precision: candidate
  `/^tests\.task(?:[.-]|$)/` vs the simpler `/^tests\.task/` — decide exactly
  in Spec with test cases for boundary ids like `tests.taskless` (a
  hypothetical bad-faith or accidental id) so the regex doesn't accidentally
  admit or reject the wrong thing.
- `docs/validation/*/*.json` under this very repo are now examples of
  **pre-law** manifests — do not treat them as templates for new manifests
  written after this ships; the telemetry-emitter-dx slice's own `t1.json`
  (just merged, PR #164) is one such pre-law example and is *not* migrated
  under this slice's Out-of-scope item.
- Irreversible track: `review.design: panel` (no reversible override applies)
  → both a Plan panel and a Spec panel run before Build.
