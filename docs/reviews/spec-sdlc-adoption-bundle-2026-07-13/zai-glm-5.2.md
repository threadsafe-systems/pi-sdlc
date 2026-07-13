# Reviewer: zai/glm-5.2:high — spec_review round 1, 2026-07-13

## Config-mutating-without-`--force` exit code contradicts across §3.1, §3.4, and AB9

- severity: high; confidence: high
- defect: §3.1 "the hard-fail remains" points at `setup-sdlc.mjs:161`
  `fail()` → exit 2 (pinned by `test/setup-sdlc.test.js:39`), but AB9 pins
  the same case as `config refused` + exit 1 and §3.4 classes it as
  refusal, not operational error. A frozen FS10 exit shape cannot be both.
- fix: Bundle mode: config-mutating flags without `--force` → `refused`
  (exit 1), provisioning continues; state the distinction explicitly.

## "Bundle run" trigger is never defined

- severity: medium; confidence: high
- defect: `pr-template` is provisioned "always in bundle runs" but nothing
  distinguishes a bundle run from a config-only run
  (`setup-sdlc.mjs:228` `sawConfigFlag || opts.yes`); the config
  compatibility change's applicability is undefined; OH4 test interplay
  unstated.
- fix: Define the trigger (any flags-mode invocation), flag-gated assets,
  and the OH4 update.

## FS9 check dependency/prerequisite matrix is not pinned

- severity: medium; confidence: high
- defect: "FS8 §2.8 discipline" referenced but FS9's own PREREQ graph
  (cf. `sdlc-status.mjs:16-27`) is absent; skip messages for
  `artifact.plan`/`artifact.build` under `track=none` unpinned.
- fix: Add the prerequisite table and pin the skip messages.

## `declaration.parse` vs `declaration.slug`/`declaration.reason` validation boundary is undefined

- severity: medium; confidence: high
- defect: §1.1 folds value rules into block validity while §2.3 has
  separate value checks; the check id firing for a value defect is
  implementation-dependent; flags mode has no block at all.
- fix: parse = structure only; value-level validation owned by
  `.track`/`.slug`/`.reason` in all modes.

## AB7's "identical check arrays" across modes is ambiguous or unachievable

- severity: medium; confidence: high
- defect: the envelope's `mode` field and naturally mode-specific
  `declaration.source` messages make byte-identical arrays unachievable.
- fix: identical state/exitCode/check id+status sequences; messages may
  differ by mode.

## RUN_HOOK_WARNING contradicts JSON mode's "nothing on stderr"

- severity: medium; confidence: high
- defect: `setup-sdlc.mjs:169` emits the warning via `console.error`; FS8
  JSON semantics require empty stderr (`readiness-output.test.js:130`);
  `fail()` paths have no JSON envelope conversion.
- fix: JSON mode embeds the warning in the `config` asset message; all
  post-pre-scan errors emit the envelope with empty stderr.

## ci-workflow structural-acceptance matching criteria are under-specified

- severity: medium; confidence: high
- defect: "a checkout step pinning the pi-sdlc repository at a fixed ref"
  has no matching logic; AB10 fixtures cannot be written without invention.
- fix: Pin exact line-match criteria (repository, ref, node invocation).

## pr-template structural-acceptance is weaker than the plan's pinned boundary

- severity: medium; confidence: high
- defect: plan §R3 requires `track: (irreversible|reversible|none)` with
  conditional companions; spec §3.2 accepts any line beginning `track:`.
- fix: Align with the plan's boundary.

## FS10 text format omits header lines, leaving the output unpinned

- severity: medium; confidence: medium
- defect: no `root:`/`exit-code:` headers pinned (contrast ADR 0016);
  golden text tests cannot be written.
- fix: Pin header lines then asset lines in §3.1 order.

## CI-absence probe is relative to consumer root, missing repo-root CI for monorepo subdirectory consumers

- severity: low; confidence: medium
- defect: GitHub Actions only runs workflows at the repo root; a
  subdirectory consumer would get a non-functional `created` workflow.
- fix: Non-empty prefix ⇒ `ci-workflow` refused with a repo-root
  remediation.

## Frozen-surfaces section claims "without changing existing ones" but setup-sdlc is changed

- severity: low; confidence: high
- defect: setup gains flags and an ADR-0018 compatibility change; the
  header claim is inaccurate.
- fix: Disclose the additive flags and compatibility change in the header.

CLEAR: E — Framework composition is sound (prefix/`ls-tree` precedent,
`readConfig`/`inspectConfig`, `resolveRoot`/`inspectRoot`, event-payload
shape, ADR 0014 exits). Issues found are spec precision, not framework
misuse.

CLEAR: F — Non-functional requirements are stated and each ties to a
falsifiable scenario (AB5, AB7, AB17).
