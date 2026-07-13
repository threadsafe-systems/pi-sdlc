# Reviewer: deepseek/deepseek-v4-pro:high — spec_review round 1, 2026-07-13

Note: the subagent runner mis-flagged this task "failed" (review tasks make
no edits); the review below was returned in full.

## pr-template structural-acceptance contradicts the plan's adjudicated boundary

- severity: high; confidence: high
- defect: Spec §3.2 requires only "a line beginning `track:`"; plan §R3 and
  adjudicated plan-panel F12 require
  `track: (irreversible|reversible|none)` **with conditional
  `reason:`/`slug:` companion lines**. A template with `track: reversible`
  and no `slug:` would be `retained` yet fail every PR — false assurance
  from the recognise/refuse gate.
- fix: Add the conditional-companion rule to §3.2.

## CI-absence probe makes ci-workflow `retained` unreachable; AB8 asserts the opposite

- severity: medium; confidence: high
- defect: The probe fires on any `.github/workflows/*.yml`, including the
  `sdlc-lifecycle.yml` setup just created; on re-run the asset reports
  `refused`, but AB8 requires `retained` for all. Internally contradictory.
- fix: Carve the target file out of the probe, or correct AB8.

## check-lifecycle check dependency matrix is under-specified

- severity: medium; confidence: high
- defect: "FS8 §2.8 discipline" is cited but FS9's own PREREQ graph is
  absent (cf. `sdlc-status.mjs` PREREQ map); linear-chain vs partial-order
  readings produce different skip patterns.
- fix: Add an explicit dependency mapping.

## `track: null` semantics in the JSON envelope are undocumented

- severity: low; confidence: high
- defect: `LifecycleReportV1.track` admits `null` but no sentence defines
  when.
- fix: Pin: null until `declaration.track` passes.

## Artifact resolution of an absent directory in HEAD is undefined

- severity: low; confidence: medium
- defect: `git ls-tree HEAD:nonexistent` exits non-zero; the spec provides
  no handling rule (fail vs operational error).
- fix: Absent directory = zero entries = artifact does not exist; never an
  operational error.

CLEAR: A — Frozen shapes correct and complete; FS9/FS10 introduce exactly
the fields the plan demands.
CLEAR: B — AB1–AB17 all have identifiable pass and fail conditions.
CLEAR: C — Interfaces specified with exact signatures, exit codes, error
semantics; workflow acquisition self-contained with pinned checkout.
CLEAR: D — No contradictions with ADR 0014/0015/0016; FS8 untouched; FS5
gains only a new sibling CLI.
CLEAR: E — Framework composition sound: event-payload path valid;
`$GITHUB_EVENT_PATH` prevents body interpolation; `ls-tree`/prefix
correctly mirror `sdlc-status.mjs:150-165`; `readConfig` accurately
described.
CLEAR: F — NFRs stated and tied to scenarios (AB7, AB17).
CLEAR: G — Honesty sweep clean: no mechanical-enforcement overclaim;
CI correctly conditional; FS8 correctly untouched.
