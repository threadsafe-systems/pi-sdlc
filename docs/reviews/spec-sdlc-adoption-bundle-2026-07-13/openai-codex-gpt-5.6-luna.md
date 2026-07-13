# Reviewer: openai-codex/gpt-5.6-luna:high — spec_review round 1, 2026-07-13

## Setup bundle mode and CLI are not specified

- severity: high; confidence: high
- location: Spec §3.1–§3.4, AB8–AB13
- defect: The specification never defines how bundle mode is selected, nor
  the complete `setup-sdlc` CLI for `--with-ci-workflow`, `--copy-prompts`,
  or `--format json`. AB8 therefore invokes flags whose behavior is
  unspecified.
- evidence: Existing parser only handles `--with-models` at
  `skills/sdlc/scripts/setup-sdlc.mjs:69-86`; all other flags fall through
  to the unknown-argument error at `:89-90`.
- fix: Freeze the complete setup invocation, bundle-mode trigger,
  optional-asset flags, `--format` pre-scan/error envelope, and report
  behavior for legacy and declined-interview runs.

## PR-template recognition accepts invalid declarations

- severity: high; confidence: high
- location: Spec §3.2, AB10
- defect: Structural acceptance only requires an `sdlc` block containing a
  line beginning `track:`, so `track: banana` or a lifecycle track with no
  `slug:` is retained; setup reports a template as retained/complete even
  though the checker will reject every PR using it.
- fix: Require the allowed track values and the corresponding
  `slug:`/`reason:` companion structure during template recognition.

## FS9 check dependencies and skip states are unfrozen

- severity: high; confidence: high
- location: Spec §2.3, AB1–AB7
- defect: The spec says failed prerequisites produce `skip` but provides no
  prerequisite matrix or rules for declaration, artifact, and inapplicable
  checks; FS8 freezes such a matrix (`sdlc-status.mjs:17-29`). Two
  conforming implementations can emit different check arrays.
- fix: Add a complete prerequisite matrix and pin every check's
  status/message behavior for parse failure, invalid track, invalid
  companions, exemption, and each track.

## Missing artifact directories are not classified

- severity: medium; confidence: high
- location: Spec §1.4, §2.2–§2.3, AB3–AB6
- defect: `git ls-tree` on a nonexistent directory is undefined — empty
  artifact set (exit 1) or operational error (exit 2)?
- fix: Zero matches and `artifact.*:fail`/exit 1; only git execution
  failures are exit 2.

## Exemption reason is not represented in the report contract

- severity: medium; confidence: high
- location: Spec §1.3, §2.4, AB2
- defect: The exemption requires a recorded generated reason, but
  `LifecycleReportV1` has no `reason` field.
- fix: Add a bounded `reason: string|null` field to the JSON/text contract.

## Referenced checker assets have no report identity

- severity: medium; confidence: high
- location: Spec §3.1, §3.4, AB12
- defect: AB12 requires verification of the checker script, but FS10's
  asset set contains no reference IDs and `SetupReportV1` has no
  reference-check shape.
- fix: Add stable IDs and report semantics for every verified package
  reference.

## Event payload null/missing semantics are unspecified

- severity: medium; confidence: high
- location: Spec §2.1, AB2, AB7
- defect: Behavior for `pull_request.body: null`, missing `body`, missing
  `user.login`, or non-string login is undefined; empty-body human PRs may
  become exit 1, 2, or a parser error by implementation.
- fix: Pin the accepted payload schema and null/missing classification.

## Configured paths can escape on supported path semantics

- severity: medium; confidence: high
- location: Spec §1.4, §6.1
- defect: FS1 only rejects leading `/` and `..` segments split on `/`
  (`lib.mjs:145-161`); on Windows `..\outside` is accepted and can resolve
  outside the consumer root when the checker joins it.
- fix: Require the checker to normalize and enforce resolved-root
  containment on every platform.

## AB14 does not prove byte-identical pre/post FS8 behavior

- severity: medium; confidence: high
- location: AB14
- defect: No baseline replay exists; existing tests are finite hard-coded
  cases (`test/readiness-output.test.js:33-147`,
  `test/sdlc-status.test.js:33-319`). An untested FS8 path can change while
  AB14 passes.
- fix: Baseline replay or narrow AB14 to the named existing goldens.

## Prompt contract requires invention

- severity: low; confidence: high
- location: Spec §5.1–§5.2
- defect: "Gains track awareness" defines no inserted input fields or exact
  reversible grounding text; the prompt has only generic placeholders
  (`adversary-review.prompt.md:37-42`).
- fix: Freeze the exact prompt input block and caller-provided values, with
  mutation tests tied to those fields.

CLEAR: G — The semantic honesty boundary is correctly narrowed: the checker
claims declared-artifact conformance; track/exemption honesty remains
PR-review judgment.
