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
whose task **owns one or more Specification scenarios** to also declare at
least one **task-scoped** test check (naming convention: id prefix
`tests.task`) whose argv runs specifically the tests introduced/modified by
that task, and require each scenario's test evidence to cite that task-scoped
check rather than the full-suite check alone. Separately, make explicit
(formalizing what every observed manifest already does in practice) that a
broader regression check must remain present whenever `tests` is required at
all, scenarios or not — the full suite never becomes optional.

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
1. `inspectManifest` (`validate-task.mjs`): three new structural rules, all
   keyed off one final reserved-prefix regex —
   **`TESTS_TASK_RE = /^tests\.task(?:[.-]|$)/`** (matches `tests.task`,
   `tests.task-t3`, `tests.task.emitter`; deliberately does **not** match
   `tests.taskless` or `tests.taskforce` — the boundary requires `.`, `-`, or
   end-of-string right after `task`, so an unrelated id that merely starts
   with the same letters never false-positives as a reserved id). This is the
   single final regex; no alternate candidate remains open for Spec.
   - **Rule A1** (unconditional whenever tests apply, scenarios or not):
     when `categories.tests.applicability === "required"`, `checkIds` must
     include at least one id that does **not** match `TESTS_TASK_RE` — a
     broader/full-regression check must stay present. This does not hardcode
     a literal id like `tests.full` (staying portable to other adopters'
     naming), it only guarantees *something* broader than a task-scoped check
     exists. Formalizes what every existing manifest already does in practice
     (confirmed: zero counter-examples found in this repo's own
     `docs/validation/`).
   - **Rule A2** (task-scoped requirement, gated on owning scenarios): when
     **both** `categories.tests.applicability === "required"` **and**
     `categories.scenarios.applicability === "required"`, `checkIds` must
     *additionally* include at least one id matching `TESTS_TASK_RE`. Ungated
     on scenarios, this rule does not fire — a pure refactor/chore task with
     `tests: required` but zero owned scenarios only needs Rule A1 (a
     regression check), never a task-scoped one, since there is nothing
     scenario-specific to isolate.
   - **Rule B** (evidence-mapping, gated on owning scenarios): when
     `categories.scenarios.applicability === "required"`, for every owned
     scenario's evidence array, restrict to ids that are also referenced by
     the `tests` category's `checkIds`; if that restricted set is non-empty,
     at least one of those ids must match `TESTS_TASK_RE`. (A scenario
     evidenced purely by non-test categories — e.g. a pure static/lint
     scenario — is unaffected.)
   - Degradation, precisely stated (corrects the prior draft's DoD/Rule
     mismatch): a manifest with **zero owned scenarios** is unaffected by
     Rule A2 and Rule B — never asked to declare or cite a task-scoped check.
     It remains subject to Rule A1 whenever `tests: required`, which adds no
     practical new burden (every such manifest already declares a full-suite
     check). A manifest with `categories.tests: n/a` is unaffected by all
     three rules.
2. `schema/task-validation-manifest.schema.json`: mirror the rules if JSON
   Schema can express them (a `contains`/`if`/`then` construct may be needed
   for the regex-membership conditions); otherwise stay `inspectManifest`-only
   with the schema's `description` documenting them — resolved in Spec/Build
   once JSON Schema expressiveness is checked.
3. `references/phase-tasks.md` / `references/phase-implement.md`: document
   `TESTS_TASK_RE`, Rule A1/A2/B, and the scenario-gating precisely (including
   the zero-scenario degradation) as part of Build's manifest authoring
   guidance.
4. `skills/sdlc/prompts/validator-task.prompt.md` (corrected path — the file
   is skill-relative, not at a bare `prompts/` root): no mandate change
   (confirmed unnecessary per Rationale) — but check whether its "Checks"
   list needs a one-line update so the reviewer reports the task-scoped
   check's result distinctly from the full-suite check's (it already reports
   every command by id, so likely no change; confirm in Build).
5. Compatibility note for **existing** manifests in this repo
   (`docs/validation/*/*.json`), corrected: not a blanket break. Verified
   directly — `docs/validation/telemetry-emitter-dx/t1.json` (merged in PR
   #164, authored before this law existed) already declares both `tests.task`
   and `tests.full` with `scenarios: n/a`, and passes all three new rules
   unchanged; `inspectManifest` on it returns `[]` under the new rules exactly
   as it did under the old. Manifests authored following the pre-existing
   informal convention are unaffected; only manifests that (a) own scenarios
   and (b) cite solely a full-suite-shaped check as scenario evidence — or (c)
   have `tests: required` with no broader check at all — newly fail. No
   inventory of every historical manifest is required by this slice (Out of
   scope, below); the corrected claim is narrower, not absent.
6. Regression tests in `test/portable-validator.test.js` (or wherever PV1/PV2
   tests live — confirm exact file in Build) for all three rules: positive
   (compliant manifest passes each), negative (A1: `tests: required` with only
   a `tests.task*` id and no broader check; A2: `tests`+`scenarios: required`
   with only `tests.full`; B: a scenario's evidence citing only `tests.full`),
   the zero-scenario degradation (A2/B do not fire), the `tests: n/a`
   degradation (nothing fires), and the `TESTS_TASK_RE` boundary case
   (`tests.taskless` must **not** count as task-scoped).

**Out:**
- Any diff-correspondence judgement capability in `task_validate` (rejected in
  Brainstorm Finding 2).
- A full inventory/audit of every historical manifest under
  `docs/validation/` classified against the new rules (they are receipts of
  past, already-merged work; the corrected compatibility note above states
  the general shape, not a per-file audit).
- Any change to `schemaVersion` (stays 1 — this is a tightening of validation
  *rules*, not a shape/field change to the manifest itself, so it is additive
  at the JSON level even though it is contract-breaking at the *acceptance*
  level; Spec should state this distinction precisely as it is the crux of the
  irreversible classification).
- Coordinating a simultaneous change to the co-owned dogfood repos —
  `threadsafe/case` **and** `threadsafe/pi-notion` (both named in ADR 0027's
  amendment, not Case alone). Per ADR 0027's already-established policy, this
  ships as a **coordinated clean break with no migrator**: this repo
  hand-authors the landing change, each co-owned repo re-authors its own
  manifests as a follow-up while pinning the pre-break skill release until it
  does. That coordinated re-author (not a forced lockstep bump in this PR) is
  the policy's own "equivalently honest forward path" — no new coordination
  mechanism is invented here.

## Definition of done

1. `inspectManifest` rejects a manifest with `categories.tests: required`
   whose `checkIds` contain **only** `TESTS_TASK_RE`-matching ids (Rule A1) —
   a broader regression check must remain present, scenarios or not.
2. `inspectManifest` rejects a manifest with **both** `categories.tests` and
   `categories.scenarios` `required` whose `checkIds` contain no
   `TESTS_TASK_RE`-matching id (Rule A2).
3. `inspectManifest` rejects a manifest with `categories.scenarios: required`
   where any scenario's evidence cites a `tests`-category check but none of
   those cited ids matches `TESTS_TASK_RE` (Rule B).
4. A manifest with `categories.tests: n/a` is unaffected by all three rules;
   a manifest with zero owned scenarios is unaffected by Rule A2 and Rule B
   but remains subject to Rule A1 (regression-tested, including the
   `tests.taskless` boundary case for `TESTS_TASK_RE`).
5. `references/phase-tasks.md`/`phase-implement.md` document the law
   (`TESTS_TASK_RE`, Rules A1/A2/B, the scenario-gating and its degradation)
   for Build authors.
6. Full test corpus green; touched files biome-clean; no change to
   `schemaVersion`.
7. A Specification exists (irreversible track) with falsifiable scenarios
   covering DoD 1–4, reviewed by a plan panel (this doc) and a spec panel
   (the Spec doc), both converged clean before Build.

## Context for the next agent

- Core file: `skills/sdlc/scripts/validate-task.mjs`, `inspectManifest`
  function (read via `read_symbol` before editing — do not re-derive its
  structure from memory; it has five interacting category branches already).
- `TESTS_TASK_RE = /^tests\.task(?:[.-]|$)/` is final per this Plan's panel
  review — do not re-litigate the regex choice in Spec, only write the
  falsifiable boundary scenarios for it (`tests.taskless` excluded,
  `tests.task`/`tests.task-t3`/`tests.task.emitter` included).
- `docs/validation/*/*.json` under this repo are a **mixed** population under
  the new law, not uniformly pre-law: some (e.g. `telemetry-emitter-dx/t1.json`,
  PR #164) already comply by coincidence of following the pre-existing
  informal convention; others may not. Do not assume either way — check
  individually if it matters for a given task; no blanket inventory is in
  scope (see Out of scope).
- Irreversible track: `review.design: panel` (no reversible override applies)
  → both a Plan panel and a Spec panel run before Build.
- Co-owned dogfood repos affected by this break: `threadsafe/case` and
  `threadsafe/pi-notion` (ADR 0027 amendment) — both pin pre-break and
  re-author as their own coordinated follow-up; neither is this slice's job.
