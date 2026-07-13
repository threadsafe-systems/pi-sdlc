# Reviewer: zai/glm-5.2:high — plan_review, 2026-07-13

## track:none exemption is not mechanically guardable — iron-law bypass path unnamed

- severity: medium
- confidence: high
- location: R1 (plan lines 36-38), R2 (lines 66-68), Risks (lines 184-209)
- defect: The checker's falsifiability thesis ("the declaration is what makes
  the check falsifiable," line 68) holds only for the
  reversible-vs-irreversible axis. A `track: none` declaration demands zero
  artifacts, so the checker can verify the declaration is *well-formed*
  (reason present) but cannot verify it is *honestly applied*. An
  irreversible change can self-declare `none` with a plausible reason and
  bypass the plan AND spec panels entirely; only the PR panel (ADR 0011 prose
  law) guards it. This is the one class of iron-law violation the checker
  provably cannot catch, and it is absent from Risks.
- evidence: R1 line 36-38; R2 line 66-68 names only the reversible-disguise
  violation, never the none-disguise; SKILL.md:61 fixes exactly "two tracks"
  and the iron-law table has two rows, yet R1 introduces a third declaration
  value. No Risks entry covers track-honesty.
- impact: The plan overstates mechanical completeness. A reviewer may believe
  the two-track contract is now machine-checkable end to end, when the most
  dangerous bypass (declaring none on a substantive change) is unfalsifiable
  by design. It also extends the locked two-track model with a new third
  value without flagging that as a decision.
- fix: Add a Risks entry stating that `track: none` correctness relies on the
  PR panel (prose law), not the checker, and narrow R2's falsifiability claim
  to "the reversible/irreversible axis"; record that introducing `none`
  extends the two-track declaration surface.

## R4's offered workflow "runs the consumer's tests/lints" is unachievable for an unknown toolchain

- severity: medium
- confidence: high
- location: R4 (plan lines 103-104), Constraints (173-181)
- defect: A shipped generic GitHub Actions workflow cannot know an arbitrary
  consumer's test/lint command (npm? make? pytest? cargo?), so this outcome
  is not realizable out-of-the-box without either assuming a toolchain
  (contradicting the stream's portability stance) or shipping a placeholder
  that does not in fact run anything. Only the lifecycle-check step is
  package-owned and deterministic.
- evidence: Plan line 103-104; the workflow is offered precisely "when the
  repository has no CI configuration at all" (line 95-96) — a no-CI repo has
  no established CI test command to run. No constraint or risk addresses the
  toolchain assumption.
- impact: An unfalsifiable/unachievable outcome. Either the spec ships a
  node-assuming starter (silent toolchain prescription) or a non-running
  skeleton mislabelled as "runs the consumer's tests."
- fix: Scope the offered workflow to ship only the deterministic
  lifecycle-check step and document that the consumer must add their own
  test/lint steps; or restate R4 as "offers a starter workflow containing the
  lifecycle-check step and a documented placeholder for the consumer's
  tests/lints."

## R3 "verifies shipped phase/review assets resolve" has no DoD and overlaps sub-change 3 without a stated boundary

- severity: medium
- confidence: high
- location: R3 (plan lines 93-94), Definition of done (211-247), Out (line
  157), contrast sub-4 boundary (lines 205-207)
- defect: R3 lists an outcome — setup "verifies the shipped phase/review
  assets ... actually resolve from the installed package" — but no DoD item
  exercises it. It also overlaps sub-change 3's normative-reference inventory
  which this plan partially excludes (line 157). Unlike the
  explicitly-flagged sub-4 overlap, the A2↔A4/A7 boundary for
  asset-resolution is unstated.
- evidence: Plan line 93-94; DoD lines 211-247 contain no fixture asserting
  setup reports package-asset resolution; line 157 excludes the full
  inventory while R3 performs a partial version of exactly that.
- impact: An outcome with no verification path plus a scope boundary the plan
  fails to draw, risking duplicate or dropped asset-resolution checks across
  children 2 and 3.
- fix: Either add a DoD fixture proving setup verifies package-asset
  resolution, or explicitly move asset-resolution verification to sub-3 and
  drop the R3 bullet.

## DoD item "SKILL.md/README document declaration, checker, and setup semantics" is not falsifiable

- severity: medium
- confidence: high
- location: Definition of done (plan lines 240-242)
- defect: The middle clause of the DoD item is an opinion with no observable
  failure. Unlike the sibling readiness child's falsifiable "documentation
  mutation tests fail when any `SKILL.md` branch omits its required
  stop/proceed rule," nothing here specifies what the docs must contain or
  what mutation would fail the check.
- evidence: Plan line 240-242 — the first and third clauses are checkable
  (grep-absence, ADR-existence); the middle is not.
- impact: A DoD item that cannot fail; the spec author has no falsifiable
  target for the documentation surface, the largest editable deliverable.
- fix: Replace the middle clause with specific doc-presence assertions each
  backed by a mutation test (e.g., "SKILL.md states the three track values,
  the slug-when-not-none rule, the reason-when-none rule, and the checker's
  local+CI invocation; removing any fails a doc-presence test").

## CI-offer negative branch (existing CI → no workflow created) has no DoD fixture

- severity: medium
- confidence: high
- location: R4 (plan lines 95-96), Definition of done (lines 228, 232)
- defect: The CI-offer condition has a positive-branch fixture but no
  negative-branch fixture proving that when CI markers exist, setup creates
  no workflow file and instead emits the documented snippet. The DoD's
  "existing workflows are never edited" covers *editing*, not *creation
  suppression* — setup could still write a new
  `.github/workflows/sdlc-*.yml` alongside existing CI and pass.
- evidence: R4 line 95-96; DoD line 228 tests only the no-CI positive case;
  line 232 is silent on whether a new workflow file is created.
- impact: The guard against workflow collision (a named stream risk) is not
  pinned by a falsifiable negative test.
- fix: Add a DoD fixture: a repo with an existing CI marker receives no new
  workflow file from setup and is instead emitted the instruction snippet.

## Prompt-copy option creates silent staleness that re-running setup will not cure

- severity: low
- confidence: medium
- location: R3 (plan lines 89-92), Risks (184-209)
- defect: Once copied, the prompt file is consumer-authored, so
  recognise/refuse/instruct semantics mean re-running setup will never
  refresh it; a later package prompt change silently never reaches an
  opted-in consumer. The setup *action* of populating the override slot is
  new and its upgrade consequence is unnamed.
- evidence: Plan line 89-92; `ensure-panel-agent.mjs:28-31` resolves the
  consumer override first; stream A4/A7 (sub-change 3) will report whole-file
  overrides as "consumer-owned and semantically unverified" — this child
  seeds exactly what sub-3 will flag. No Risks entry covers it.
- impact: Consumers who opt into prompt-copy drift from upstream reviewer
  prompts with no detection.
- fix: Add a Risks entry; document the refresh action (delete + re-copy).

## CI lifecycle-check step reading the PR body has an unaddressed mechanism/permissions consideration

- severity: low
- confidence: medium
- location: R4 (plan lines 105-107), `.github/workflows/ci.yml:7-8`
- defect: The plan does not flag whether the checker reads
  `github.event.pull_request.body` (no extra permission) or shells to the
  GitHub API (needs `pull-requests: read`, absent from the current
  `permissions: contents: read`).
- evidence: `ci.yml:7-8`; plan line 105-107; R2 line 64 without specifying
  the extraction mechanism.
- impact: A latent CI failure or a spec-time permission change the plan does
  not pre-warn; low because the event-payload path needs no extra permission.
- fix: Note in Risks that the spec must pin the declaration-extraction
  mechanism and that an API-based path requires elevating `ci.yml`
  permissions.

CLEAR: D — no reopening of FS8/ADR 0016, ADR 0015, ADR 0011, ADR 0005, or
ADR 0002; FS1/FS2 schemas explicitly unchanged; `sdlc-status` byte-identical
for existing consumers; all stream locked decisions honoured.

CLEAR: F — track classification correct: four genuinely shape-freezing
deliverables; each forces the irreversible track.
