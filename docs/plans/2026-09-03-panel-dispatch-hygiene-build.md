# Build plan — panel dispatch hygiene

Plan: [`2026-09-03-panel-dispatch-hygiene.md`](2026-09-03-panel-dispatch-hygiene.md)
Track: **reversible** (no Spec) · Slug: `panel-dispatch-hygiene` · Closes #268, #270

Every task's Definition of Done includes the code-prose pass owned by
`references/phase-implement.md` §4, with the exact handoff
`Code-prose pass: complete`, placed before the task's validator/closure seam.

## Decomposition rationale

Two tasks, split by surface rather than by ticket. #268 and #270 each touch
both files at the edges — the roster's `$comment` explains the twin pairing
that §5's sentence also names — so slicing by ticket would put two authors in
the same two files. Slicing by surface gives each task one file, one failure
mode, and one reviewer question.

T1 is a data change: every edit is an id, verifiable mechanically against
`pi --list-models`. T2 is a doctrine change: no id, no test can falsify it,
and it is judged by reading. Mixing them would put a mechanically-checkable
change and an unfalsifiable one behind a single check command, and the weaker
evidence would set the bar for both.

The tasks are independent and carry no blocking edge. T2 references the twin
pairing T1 creates, but only in prose that reads correctly whichever lands
first.

## Dependency graph

```text
T1 (config roster)     ── independent
T2 (§5 doctrine)       ── independent
```

No edges. Both tasks may run in parallel; neither reads the other's output.

**Parallel surface-sharing check:** T1 owns `.pi/sdlc/sdlc.config.json`
exclusively; T2 owns `skills/sdlc/references/phase-pr-review.md` exclusively.
No file is written by both. `npm test` is a shared *read* only.

## Tasks

### T1 — Roster correction and generation sweep

- **Surfaces:** `.pi/sdlc/sdlc.config.json`, plus its generated companion
  `.pi/sdlc/CONFIG.md` (regenerated, never hand-edited — see A5).
- **Does:** corrects every configured model id to one that resolves, and to
  the current generation of its own family, without moving any entry's
  position within its `prefer` array. Specifically: `google/` →
  `google-vertex/` for the gemini entry in all three review pools;
  `amazon-bedrock/global.anthropic.claude-opus-4-8` →
  `amazon-bedrock/eu.anthropic.claude-opus-5` in `pr_review`, with direct
  `anthropic/claude-opus-5` inserted ahead of it as its principal;
  `anthropic/claude-opus-4-8` → `anthropic/claude-opus-5` in `plan_review` and
  `spec_review`; `anthropic/claude-fable-5` → `anthropic/claude-fable-5-1`
  everywhere including `authorDefault`; `zai/glm-5.2` → `zai/glm-5.3`
  preserving each entry's thinking suffix. Rewrites the `panels.$comment` so
  it states what was wrong with each corrected entry and names the
  opus-5 / Bedrock-opus-5 pairing as a deliberate route twin rather than a
  duplicate.
- **Scenarios owned:** none — reversible track, no Spec. See the Spec gap log.
- **Checks:**
  - `python3 -c` id-vs-live-list sweep: every `prefer` entry and
    `authorDefault`, thinking suffix stripped, appears in
    `pi --list-models` output (`scope: ["task"]`, ~20s, network).
  - `bash skills/sdlc/scripts/sdlc-status.sh --repo-root . --format json`
    exits 0 (`scope: ["task"]`, offline, <2s).
  - `npm test` (`scope: ["full"]`, offline, ~60s) — `lib-config`,
    `config-doc`, `schema-break` and `frozen-surfaces` all read this file.
  - `git diff --stat` shows no file from `test/frozen-surfaces.test.js`'s
    `FROZEN` list.
- **DoD:** the Plan's roster bullets under Definition of done, all satisfied;
  pool ordering provably unchanged; `Code-prose pass: complete`.
- **Parked to Implement:** the `$comment` is prose in a JSON file and the only
  rationale record the roster has. Keep it to what a future editor needs in
  order not to undo the change — the ticket archaeology belongs in the Plan,
  not the config.

### T2 — Dispatch time budget and timeout recovery in §5

- **Surfaces:** `skills/sdlc/references/phase-pr-review.md`, §5 only.
- **Does:** three edits to the panel run-shape. (a) States that every reviewer
  dispatch passes an explicit time budget, with a named floor of 45 minutes
  for a PR panel and a trigger at ≥30 changed files or ≥2,000 changed lines
  raising the start to 90 minutes — written as a floor open to revision, and
  recording that it is calibrated from a single observation (PR #261: 70
  files, 30 minutes failed, 90 minutes completed). (b) Amends the "Reviewer
  dispatch recovery" paragraph so a timeout is no longer classed with
  transient infra failures: a whole-wave timeout is deterministic, and the
  sanctioned response is one retry of the **same** models at a raised budget
  before any replacement, still within the original logical wave. (c) Adds a
  single sentence naming a provider-route twin as the first replacement to
  try for a provider-side failure.
- **Scenarios owned:** none — reversible track, no Spec.
- **Checks:**
  - `node --test test/reference-contract.test.js test/docs.test.js
    test/skill-kernel.test.js test/gate-presentation-contract.test.js
    test/iteration-disposition.test.js` (`scope: ["task"]`, offline, <5s) —
    the five suites that assert over this file.
  - `node skills/sdlc/scripts/check-references.mjs` (offline, ≤5s).
  - `npm test` (`scope: ["full"]`, offline, ~60s).
- **DoD:** the Plan's §5 bullets under Definition of done, all satisfied; the
  route-twin content is one sentence and introduces no seat table, no
  per-seat fallback column, and no vendor-diversity rule;
  `Code-prose pass: complete`.
- **Parked to Implement:** §5 was rewritten by #272 around, but not inside,
  the recovery paragraph. Edit against current `main` and re-read the
  paragraph before changing it — the installed skill copy is v3.0.0 and its
  §5 differs.

## Scenario → task ownership

None. The reversible track runs without a Spec, so no scenario ids exist to
own. Both tasks are verified by their check commands and by the PR panel
reading the diff; the Plan's Definition of done is the falsifiable list
standing in for scenario coverage.

## Spec gap log

| description | severity | disposition | landing site |
| --- | --- | --- | --- |
| No Spec exists — reversible track, `shape.separateSpec` not exercised — so no scenario ids back either task's checks | minor | assumption-recorded | Assumptions appendix, A1 |
| The 45/90-minute budget figures rest on one observation, and no scenario pins them | minor | assumption-recorded | Assumptions appendix, A2 |
| No mechanical check can falsify T2; §5 doctrine is judged by reading only | minor | CARRY-TO-IMPLEMENT — discharged | Round 1 of the PR panel read the §5 diff and returned findings against it |

## Assumptions

- **A1 — no scenario ids.** The reversible track carries no Spec, so tasks own
  no scenarios and the validator's Rule B does not apply. Each task still
  carries a `"full"`-tagged check under Rule A.
- **A2 — the budget figures are a floor, not a derivation.** Only the 90 has an
  observation behind it: a 55-file panel where two of three reviewers exhausted
  the 30-minute default and both completed on a 90-minute retry, the third
  having failed on credentials. The 45-minute floor and the ≥30-file/≥2,000-line
  trigger are interpolation and remain untested. T2 states this in the text
  rather than implying a calibrated model.
- **A3 — decomposition granularity.** Two tasks, split by file. A single task
  was rejected because it would put an unfalsifiable doctrine change behind a
  data change's mechanical check.
- **A5 — CONFIG.md is a T1 surface, discovered at implement.** `.pi/sdlc/CONFIG.md`
  is generated from the manifest, so editing the manifest makes it stale and
  `config-doc.sh check` reports `stale`. Regenerated with `config-doc.sh write`;
  never hand-edited. The build plan originally named only the manifest.
- **A6 — the suite is green; macOS needs a canonical `TMPDIR`.** `npm test` is
  616/616 on this branch and on `main`. The 29 failures seen with the default
  macOS `TMPDIR` share one cause: `mktemp -d` returns a `/var/folders/…` path
  that is a symlink to `/private/var/folders/…`, `git rev-parse --show-toplevel`
  resolves the symlink, and the containment check compares the two literally and
  reports `git.repository :: resolved root escapes its git top-level` (exit 2).
  Exporting `TMPDIR=$(cd "$TMPDIR" && pwd -P)/` removes all 29. Linux CI is
  unaffected because the two paths agree there. The DoD therefore states
  "616/616 green", not "no new failures" — an earlier revision of this appendix
  claimed a non-zero baseline, which was a local path artefact mistaken for a
  property of the repository.
- **A4 — near-threshold publish call, deviating from `shape.publishToTracker`.**
  The committed threshold is 2 and this build has 2 tasks, so the contract's
  default is to mint an epic plus two `build-task` sub-issues. Not done here,
  on the argument that minting an epic and two more issues over a two-file
  change would produce four tracker objects for one PR, and that #268 and #270
  already partition this work as cleanly as the two tasks do.

  The original form of this assumption also claimed those two issues were
  labelled and on the shared board. They are not: both carry no labels and
  neither appears on the project board, so the half of the argument that rested
  on an existing projection does not hold. The remaining proportionality
  argument stands on its own. Escalated to the owner rather than settled here.

## Tracker

No new tracker objects. #268 and #270 stand in for the projection per A4; the PR
closes both. Neither carries labels nor appears on the project board, so this is
a deviation from `shape.publishToTracker` rather than a projection that already
existed — see A4, escalated to the owner. #141 receives a comment recording the PONG falsification of its
gemini-credits premise, per the Plan's Definition of done — a comment on an
existing ticket, not a new object.
</content>
