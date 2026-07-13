# Reviewer: openai-codex/gpt-5.6-sol:high — plan_review, 2026-07-13

## `track: none` contradicts the locked two-track iron law

- severity: high
- confidence: high
- location: R1, lines 29–38
- defect: The plan invents a third, lifecycle-exempt classification even
  though the governing contract says every non-irreversible change is
  reversible and must follow the reversible lifecycle.
- evidence: `docs/plans/2026-07-13-sdlc-adoption-bundle.md:29-38` allows
  `track: none` with no artifacts; `skills/sdlc/SKILL.md:68-77` defines
  exactly irreversible and reversible tracks;
  `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md:90-95` likewise
  requires one of those two phase sequences.
- impact: Any change can bypass Plan, Build, implementation validation, and
  PR artifact checks merely by supplying a reason; the checker cannot
  determine whether "trivia" is honest.
- fix: Remove `track: none`, or explicitly reopen and obtain upstream
  approval for a third exemption policy with bounded eligibility and approval
  semantics.

## The assigned reversible PR contract remains incomplete

- severity: high
- confidence: high
- location: Ownership statement and R1/R5, lines 6–7, 27–47, 114–125
- defect: This child owns A3's track/PR contract but never defines the
  reversible PR's required links or the source of review constraints when no
  Specification exists.
- evidence: The parent requires both "the source of PR review constraints
  when a Specification is absent" and "which links and declarations the PR
  must carry" at `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md:97-103`.
  Current law still universally says to link "plan and spec" at
  `skills/sdlc/SKILL.md:327-331`, despite reversible omitting Specification
  at `skills/sdlc/SKILL.md:74-77`.
- impact: A reversible PR still encounters the exact contradictory
  missing-Specification input this stream was meant to eliminate.
- fix: Add an outcome and DoD scenarios pinning track-specific PR links and
  Plan/Build-derived review constraints for reversible PRs, including the
  corresponding SKILL/template correction.

## A clean consumer CI runner has no defined way to obtain the checker

- severity: high
- confidence: high
- location: R3/R4 and Scope, lines 89–110, 146–147
- defect: The plan assumes the checker resolves from an installed pi package
  locally, but the generated consumer workflow runs in a clean checkout where
  that git-installed package is not present; it specifies neither vendoring
  nor a version-pinned checkout/action.
- evidence: `docs/plans/2026-07-13-sdlc-adoption-bundle.md:89-94` keeps
  package resolution as the default, while lines 101–110 require a runnable
  consumer workflow. The governing stream records that package scripts are
  not conventional binaries and require resolved package paths at
  `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md:234-238`;
  `package.json:19-25` exposes only pi skill/prompt metadata, with no binary
  or action. The DoD at plan lines 227–232 checks workflow presence, not
  execution from a clean consumer checkout.
- impact: Setup can generate a workflow that immediately fails with a missing
  checker, while every stated DoD item still passes.
- fix: Choose and test a version-pinned CI acquisition strategy — such as a
  pinned secondary checkout/action or a maintained vendored checker — and
  define its upgrade path.

## The checker cannot detect semantic track misclassification

- severity: medium
- confidence: high
- location: R2, lines 54–68
- defect: The checker observes only the self-declared track and artifact
  presence, so it cannot distinguish an API/schema change falsely declared
  reversible from a genuinely reversible change, contrary to the stated
  claim.
- evidence: The only checks listed at
  `docs/plans/2026-07-13-sdlc-adoption-bundle.md:54-60` are declaration
  syntax and artifact existence, yet lines 64–68 claim the declaration lets
  it distinguish an irreversible change presenting reversible artifacts.
  Classification depends on whether the diff freezes a consumer-bound shape
  under `skills/sdlc/SKILL.md:68-72`.
- impact: A mistaken or dishonest `track: reversible` declaration passes with
  plan+build and no Specification; the iron-law classification itself remains
  a human-review assertion, not mechanically falsified.
- fix: Narrow the outcome and documentation to "declared-track artifact
  conformance" and explicitly assign semantic classification verification to
  PR review.

## "Run the consumer's tests/lints" has no portable contract

- severity: medium
- confidence: high
- location: R4, lines 101–104
- defect: The plan requires a generic generated workflow to run consumer
  tests and lint without defining how those commands are supplied or
  discovered.
- evidence: `docs/plans/2026-07-13-sdlc-adoption-bundle.md:103-104` requires
  tests/lints, but FS1 accepts only identity, paths, tracker, and hooks at
  `skills/sdlc/scripts/lib.mjs:137-160`; `package.json:27-30` contains
  commands for pi-sdlc itself, not arbitrary consumers. The project describes
  itself as project-agnostic at `README.md:3-11`.
- impact: Any hard-coded npm commands break non-Node consumers, while
  heuristic discovery freezes an unspecified and error-prone contract.
- fix: Generate a lifecycle-check-only workflow, or add an explicit setup
  input defining exact consumer check commands and pin its behavior.

## Re-run upgrade semantics conflict with the existing setup guard

- severity: medium
- confidence: high
- location: R3/R6 and Constraints, lines 97–99, 127–135, 173–176
- defect: The plan promises an idempotent re-run upgrade while preserving
  `--force` semantics, but does not say how setup proceeds past an existing
  config or distinguishes bundle-only re-runs from requested config
  replacement.
- evidence: Existing setup aborts on any existing config without `--force` at
  `skills/sdlc/scripts/setup-sdlc.mjs:157-162`, and this behavior is pinned
  by `test/setup-sdlc.test.js:27-45`. The plan simultaneously requires
  re-running setup to acquire the bundle at lines 97–99 and 129–135, while
  line 175 preserves the config-specific force rule.
- impact: Implementations can either leave the documented upgrade unusable,
  silently ignore requested config changes, or weaken the existing overwrite
  guard.
- fix: State that an existing config is retained and bundle processing
  continues when no config mutation is requested, while requested config
  changes retain the existing `--force` requirement, and test both paths.

## Setup's new refusal/report surface lacks aggregate exit semantics

- severity: medium
- confidence: high
- location: R3/R5 and Specification context, lines 82–99, 124–125, 268–272
- defect: The plan freezes four per-asset report words but never defines
  whether a refused asset aborts before writes, permits partial provisioning,
  or causes exit 1 or 2; the proposed ADR covers only the declaration/checker.
- evidence: `docs/plans/2026-07-13-sdlc-adoption-bundle.md:82-99` introduces
  refusal and report states, and lines 268–272 require the vocabulary to be
  pinned. Existing setup exposes 0 written / 1 declined / 2 error at
  `skills/sdlc/scripts/setup-sdlc.mjs:7-8`, but plan lines 124–125 scope the
  ADR only to the PR declaration and checker.
- impact: Automation cannot determine whether setup succeeded, and different
  implementations may leave different partial bundles after the same
  conflict.
- fix: Add setup's report envelope, aggregate exit mapping, preflight/
  partial-write rule, and upgrade compatibility to the frozen ADR and DoD.

## PR-body transport is missing an untrusted-input constraint

- severity: medium
- confidence: high
- location: R2 and Risks, lines 62–63, 184–209
- defect: The plan requires CI extraction from an attacker-controlled PR body
  but discusses only parsing fragility, not safe transport into the checker.
- evidence: `docs/plans/2026-07-13-sdlc-adoption-bundle.md:62-63` makes the
  PR body a CI input; its risks at lines 184–209 omit shell/expression
  injection. Existing GitHub workflow steps use shell `run` commands at
  `.github/workflows/ci.yml:22-26`.
- impact: A generated workflow could interpolate body text containing command
  substitutions, quotes, or workflow-expression payloads into a shell
  command, causing execution or corrupted declarations.
- fix: Require reading the body from `$GITHUB_EVENT_PATH` or another
  non-interpolated channel and add metacharacter/injection fixtures.

CLEAR: F — The plan correctly classifies the new declaration, checker CLI,
setup behavior, and workflow integration as irreversible.
