# Build plan: Question-presentation discipline (sdlc-question-discipline)

- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible — no Specification; tasks map to the Plan's
  definition-of-done items (never re-derived).
- **Governing plan:** `docs/plans/2026-07-19-sdlc-question-discipline.md`
  (rev1, approved at the human design gate 2026-07-19)
- **Branch:** `feat/sdlc-question-discipline`

## Decomposition rationale (assumption-tier, stated inline)

Sliced as **two tasks**: the shared contract must land before the six
phase deltas that point at it (a real content dependency, wired as a
`blockedBy` edge), while the deltas + template edits are one coherent slice
because every delta is a thin layer over the same contract and splitting them
six ways would multiply validation ceremony with no independence gained.
Object via a Build correction if this slicing is wrong.

## T1 — Shared question-presentation contract in `system-reference.md`

**Objective.** Add the new top-level section **"Presenting questions to the
human"** to `skills/sdlc/references/system-reference.md` (appended after §13 as
§14; no renumbering of §1–13): single end-of-reply numbered block; one distinct
question per item, one question per sentence; context line only when needed;
enumerated alternatives, never fabricated; at most one reasoned recommendation
per question, never fabricated; **uniform soft cap 3–5 blocking questions per
turn, deltas may only lower it; overflow demotes, never lengthens**; triage
tiers **Blocking / Assumption / Parked**; **never ask a repo-discoverable
fact**; explicitly tool-agnostic. Update §6 "Skills and tools are enhancements"
to neutral example language (no "questions-helper plugin" / "questions tool").
Add a §11 routing-table row for the new section.

**Satisfies plan DoD:** items 1, 3 (system-reference share), 5.

**Checks (exact commands; PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required — full suite green (catches structural tests over references) |
| static | `npx biome check .` | required — repo lint |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 1/3/5 |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` | required — section exists |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` scoped check via `node -e` asserting the §11 routing row also matches (implementer projects exact argv) | required — routed |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc/references/system-reference.md` and `grep -ri "questions tool" skills/sdlc/references/system-reference.md` | required — pattern must be ABSENT (runner's bannedPatterns semantics: the named pattern occurring is the failure) |

## T2 — Six phase deltas + PR-template assumptions section

**Objective.** Layer the per-phase deltas from the approved plan's "Agreed
design" table onto the shared contract, as pointers-plus-delta (no
restatement), in all six `skills/sdlc/references/phase-*.md`:

- **brainstorm**: replace the broken §1 questions bullet with a contract
  pointer; recommendations widen-not-steer; map mode: parked = fog →
  "Not yet specified"; no assumption ledger.
- **plan**: questions close doc-section-blocking decisions; design-reopening
  questions surface as proposed backward transitions; recommendations
  expected; draft-first; assumption→in-doc / parked→"context for the next
  agent"; scope questions always enumerated.
- **spec**: behavioural/edge-case questions as draft scenarios (id, pass/fail,
  recommendation, ratify-by-exception); blocking slots reserved for
  contract/surface decisions; overflow demotes into the draft; `file:line`
  emphasis on the repo-discoverable rule.
- **tasks**: question block effectively banned (backward transition or
  assumption); mechanical calls stated inline; parked questions attach
  per-task in the build-plan doc, projected to sub-issue bodies; note the
  build-plan **"Assumptions" appendix** contract (plan-ratified accrual home).
- **implement**: mid-task interrupts = external blockers only (class-based);
  all else batches to the validator seam; assumptions accrue in the build-plan
  appendix and land in the PR body's "Assumptions & discretionary calls"
  section (+ task close comment when tracker-backed); §10 gains
  worker-questions-route-to-dispatcher.
- **pr-review**: §5.4 escalation shape (pre-adjudicated ratify/amend: id,
  gist, raising reviewers, recommended disposition + reason); only proposed
  high/medium dismissals and ratified-residual-risk touches escalate;
  per-wave post-consolidation under the cap; human-ratified dismissals bind
  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
  PR body's assumptions section as panel input **without weakening** the
  no-development-findings-in-body rule.

Add the empty-allowed **"Assumptions & discretionary calls"** section to
`skills/sdlc/assets/pull_request_template.md` and
`.github/pull_request_template.md`.

**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.

**Blocked by:** T1 (the pointer target must exist).

**Checks (exact commands; PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required |
| static | `npx biome check .` | required |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |

## Assumptions (appendix — accrues during Implement; copied into the PR body)

- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
  rationale above.
- (T1) The shared-contract section wording avoids the repo's S2
  generic-surface banned literals (e.g. the word "handover" is loom-domain);
  "carried forward in the phase's context for the next agent" is the
  sanctioned phrasing.
- (T2) `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`
  S25 anchor updated to the new brainstorm bullet text — one line, outside
  the plan's stated scope, forced by ASD5's living-anchor test when the old
  bullet was replaced. Treated as a discretionary call, not a scope change.

## Tracker projection

Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
`blockedBy` T1. This doc remains canonical; the tracker is a projection.
