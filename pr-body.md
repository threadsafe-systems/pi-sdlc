<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->

```sdlc
track: irreversible
slug: pv1-task-scoped-tests
```

Add an additive optional per-check field **`scope: ("full" | "task")[]`** to the
PV1 task-validation manifest and enforce two acceptance rules in
`inspectManifest`, so a manifest declares — mechanically, not by naming
convention — which checks are the broad regression net and which are a task's
specific test evidence.

- **Rule A (manifest-level):** when the `tests` category is `required`, at least
  one referenced check must be tagged `"full"` (a regression net is guaranteed
  present, not inferred from a check's name).
- **Rule B (scenario-level):** when `scenarios` is `required`, each owned
  scenario whose evidence cites any `tests`-category check must cite at least
  one tagged `"task"` (the task's specific tests are declared, so their exact
  argv/stdout lands in the receipt for the PR panel to eyeball).

Enforcement lives in `inspectManifest` directly (the runtime path never loads
the JSON Schema); a shape-invalid `scope` counts as absent; the rules always
evaluate and stack with reference errors through the existing
`add()`/`sortAndFormat()` pure-lexicographic path. One check serving both roles
tags `scope: ["full", "task"]`. Degradations: `tests: n/a` is exempt from both;
a manifest with zero owned scenarios is exempt from Rule B but still subject to
Rule A; a scenario evidenced only by non-`tests` categories does not trigger
Rule B. `schemaVersion` stays `1` (the shape change is additive; the
acceptance-rule tightening is lifecycle-governed per the ratified ADR 0013
amendment).

The two ASD19-frozen surfaces (the PV1 schema and `validate-task.mjs`) are
deliberately reopened for this change; **a single-purpose follow-up PR re-adds
them immediately after this merges** (the re-add is mechanically impossible in
this PR because ASD19 diffs against the `main` merge-base).

## Governing documents

- Plan: `docs/plans/2026-07-24-pv1-task-scoped-tests.md`
- Spec: `docs/specs/2026-07-24-pv1-task-scoped-tests.md`
- Build plan: `docs/plans/2026-07-24-pv1-task-scoped-tests-build.md`
- Base PV1 contract + its §11 amendment: `docs/specs/2026-07-12-sdlc-portable-validator.md`
- ADRs (ratified): `docs/adr/0013-task-validation-manifest-pv1.md`, `docs/adr/0027-pre-adoption-clean-break-policy.md`
- Spec panel: `docs/reviews/spec-pv1-task-scoped-tests-2026-07-25/consolidated.md`
- PR panel: `docs/reviews/pr-pv1-task-scoped-tests-2026-07-25/consolidated.md`

## Tracker references

- Epic: #185
- Tasks: Closes #186, Closes #187, Closes #188
- Board: pi-sdlc build board (org project 5)

## Assumptions & discretionary calls

Copied from the build-plan doc's "Assumptions" appendix:

- New rule tests live in `test/validator-contract.test.js` (the PV1 contract
  suite); the `baseManifest` fixture tagging landed in **T1** (not T2) due to
  fixture coupling, so `npm test` is intentionally red between the T1 and T2
  commits and green from T2 onward.
- Each task manifest dogfoods `scope`: T1's `"full"` regression net is `npm test`
  (green at the delivered branch state), tagged distinct from its narrow
  `"task"` contract-suite check (a PR-panel round-1 correction — the earlier
  draft mislabeled the single-file selection `"full"`).
- Per-task `static.lint` scopes to touched files to avoid absorbing unrelated
  pre-existing repo lint debt; T2's `npm run lint` proves whole-repo clean.

## Coordinated clean break (no migrator)

This tightens a public contract that `threadsafe/case` and `threadsafe/pi-notion`
commit to. Per ADR 0027's ratified amendment, they pin the pre-break skill
release and re-author their own manifests as a coordinated follow-up.

BREAKING CHANGE: PV1 manifests with a required `tests` category must now tag a check `scope "full"`, and each owned scenario's `tests`-category evidence must include a `scope "task"` check; previously-valid manifests without `scope` tags become manifest-errors. Coordinated clean break with no migrator (ADR 0013 + ADR 0027).
