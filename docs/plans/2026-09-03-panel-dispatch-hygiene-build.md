# Build plan — panel dispatch hygiene

Plan: [`2026-09-03-panel-dispatch-hygiene.md`](2026-09-03-panel-dispatch-hygiene.md)
Track: **reversible** (no Spec) · Slug: `panel-dispatch-hygiene` · Closes #270

**Scope split.** The §5 doctrine task this Build originally carried as T2 moved
to #268's own track. T2 below is its replacement: the reference-prose currency
sweep the roster change itself creates.

Every task's Definition of Done includes the code-prose pass owned by
`references/phase-implement.md` §4, with the exact handoff
`Code-prose pass: complete`, placed before the task's validator/closure seam.

## Decomposition rationale

Two tasks, split by surface. T1 changes the roster the resolver reads; T2
corrects the reference prose that quotes it. They are separated because a roster
edit and a prose sweep fail differently: T1 is falsified by comparing ids to a
live list, T2 only by reading every reference that names a model.

T1 is a data change: every edit is an id, verifiable mechanically against
`pi --list-models`. T2 is a small prose change with a grep-able check. Neither
carries unfalsifiable doctrine — that was the original T2, now #268's, and the
reason this Build's own rationale argued for splitting them in the first place.

The tasks share no file and carry no blocking edge, but T2's content is
determined by T1's result, so T1 lands first.

## Dependency graph

```text
T1 (config roster)          ── independent
T2 (reference prose sweep)  ── reads T1's result
```

One soft edge: T2 quotes the order T1 ships, so T1 lands first. Neither writes
the other's file.

**Parallel surface-sharing check:** T1 owns `.pi/sdlc/sdlc.config.json`
exclusively; T2 owns `skills/sdlc/references/phase-implement.md` exclusively.
No file is written by both. `npm test` is a shared *read* only.

## Tasks

### T1 — Roster correction and generation sweep

- **Surfaces:** `.pi/sdlc/sdlc.config.json`, plus its generated companion
  `.pi/sdlc/CONFIG.md` (regenerated, never hand-edited — see A5).
- **Does:** corrects every configured model id to one that resolves, and to
  the current generation of its own family, without re-ranking any entry
  relative to another. Inserting a candidate shifts the array index of the
  entries after it; index stability is not claimed, relative order is.
  Specifically: `google/` →
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
  relative order provably unchanged; `Code-prose pass: complete`.
- **Parked to Implement:** the `$comment` is prose in a JSON file and the only
  rationale record the roster has. Keep it to what a future editor needs in
  order not to undo the change — the ticket archaeology belongs in the Plan,
  not the config.

### T2 — Reference-prose currency sweep

- **Surfaces:** `skills/sdlc/references/phase-implement.md`, the
  task-validator paragraph only.
- **Does:** replaces the quoted task-validator preference, which names
  `deepseek/deepseek-v4-flash` and the undated `anthropic/claude-haiku-4-5`,
  with the order T1 ships. Both quoted ids are wrong after T1: no `deepseek/`
  id remains in the repo, and the undated haiku alias is the entry that fails
  the launch identity check. The paragraph's `resolve-panel task_validate`
  example also gains the `--track` this repo's per-track overrides require.
  The prose is left pointing at the resolver as authoritative rather than
  re-quoting a list that will rot again.
- **Scenarios owned:** none — reversible track, no Spec.
- **Checks:**
  - `grep -rn` over `skills/sdlc/references/` for `deepseek/`, an undated
    `claude-haiku-4-5`, `glm-5.2`, `opus-4-8` and `google/gemini` returns
    nothing (`scope: ["task"]`, offline, <2s). Scoped to `references/` rather
    than `skills/`: `schema/sdlc.config.example.json` is frozen and carries
    generic placeholder ids (`deepseek-v3`, `claude-opus-4`, `glm-4`) that name
    no real roster and are out of scope per the Plan's non-goals.
  - `node skills/sdlc/scripts/check-references.mjs` (offline, ≤5s).
  - `npm test` (`scope: ["full"]`, offline, ~60s).
- **DoD:** no phase reference quotes a model id absent from the roster;
  `Code-prose pass: complete`.
- **Parked to Implement:** this paragraph is pre-existing prose the roster
  change turned false rather than something this branch wrote. Prefer deleting
  a quoted roster over refreshing it — a reference that names ids rots on every
  roster edit, and nothing tests it.

## Scenario → task ownership

None. The reversible track runs without a Spec, so no scenario ids exist to
own. Both tasks are verified by their check commands and by the PR panel
reading the diff; the Plan's Definition of done is the falsifiable list
standing in for scenario coverage.

## Spec gap log

| description | severity | disposition | landing site |
| --- | --- | --- | --- |
| No Spec exists — reversible track, `shape.separateSpec` not exercised — so no scenario ids back either task's checks | minor | assumption-recorded | Assumptions appendix, A1 |
| Neither task's check can prove reference prose is *complete*, only that known-stale ids are absent | minor | assumption-recorded | Assumptions appendix, A2 |

## Assumptions

- **A1 — no scenario ids.** The reversible track carries no Spec, so tasks own
  no scenarios and the validator's Rule B does not apply. Each task still
  carries a `"full"`-tagged check under Rule A.
- **A2 — the prose sweep is a denylist, not a proof.** T2's check greps for the
  specific ids this change retires. It cannot prove no reference quotes some
  other stale id, because nothing enumerates "every model id mentioned in
  prose". The durable fix is to stop quoting rosters in references at all, which
  T2 starts by pointing at the resolver instead.
- **A3 — decomposition granularity.** Two tasks, split by file: the roster and
  the prose that quotes it.
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
  change would produce four tracker objects for one PR.

  Two earlier revisions of this assumption were both wrong about the tracker
  state, in opposite directions. The first claimed #268 and #270 were labelled
  and on the shared board; the second claimed neither was. The measured state:
  both are **unlabelled**, and both **are** on project 5 ("pi-sdlc Build
  Board") and have been since 2026-08-18. The second revision's error came from
  a board query returning its first 100 items out of 209 and reading the empty
  result as a negative. So the projection half of the original argument does
  hold — these issues are on the board a resumable frontier would be read from
  — while the labelling half does not. Escalated to the owner on that corrected
  basis, not settled here.

## Tracker

No new tracker objects. #270 is closed by this PR; #268 stays open for its own
branch. Both sit on project 5 already (since 2026-08-18) but carry no labels, so
the board-projection half of A4's argument holds and the labelling half does not
— see A4, escalated to the owner. #141 receives a comment recording the PONG
falsification of its gemini-credits premise, per the Plan's Definition of done —
a comment on an existing ticket, not a new object.
</content>
