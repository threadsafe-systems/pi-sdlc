# Build plan: sdlc lifecycle retro fixes, batch 1

- Date: 2026-07-18
- Plan: `docs/plans/2026-07-18-sdlc-lifecycle-retro-fixes-batch1.md`
- Track: **reversible** (fast path) — no specification phase; this Build
  plan is the traceable artifact between Plan and Implement.
- Canonical source: this Build plan; tracker objects are its projection.
- Tracker projection: epic #76 (existing, reused); BT1 → #77; BT2 → #78;
  BT3 → #79 (existing native sub-issues, retargeted to build-task shape —
  no new tracker objects created). Board: #5.
- Human gate: **Approved** alongside the Plan, 2026-07-18. Tracker bodies
  for #77–79 already match this decomposition.
- Validator policy: task-local `npm run lint` + the named `node --test`
  files per task; no PV1 manifest required for this reversible-track,
  script-only batch — task completion is the named checks passing plus the
  Definition of Done in the Plan.

## Definition of done

1. The completion-check script (BT1) exists, is unit-tested, and `SKILL.md`
   requires it before any Implement/PR complete/PASS claim.
2. `SKILL.md`'s Implement section carries the worker task-prompt shape and
   infra-retry-once rule (BT2), and the phase-agnostic stall-detection rule
   (BT3).
3. `npm test` and `npm run lint` clean across the whole suite (not just the
   touched files).
4. #77, #78, #79 close via this effort's PR (`Closes #77, Closes #78,
   Closes #79`).
5. PR panel runs to the stop condition.

## Task graph

```text
BT1, BT2, BT3 — independent, no ordering dependency; may run in parallel.
```

## BT1 — completion-check script + SKILL.md wiring (closes #77)

### Outcome

A new script, `skills/sdlc/scripts/check-completion.mjs` (+ thin
`check-completion.sh` wrapper, matching every existing script in this
directory), exposing two modes:

- `--claim pr-open --slug <slug> [--repo-root DIR] [--format text|json]` —
  fails unless: the current branch has an upstream with no unpushed commits
  (`git rev-parse @{u}` succeeds, `git status -sb` shows no ahead-count
  beyond what's pushed); `gh pr view` finds exactly one open PR for the
  branch; the PR body contains exactly one valid `sdlc` declaration block
  (reuse `lib.mjs`'s existing block-parsing, do not re-derive it); the PR
  body references every issue number passed via `--closes <n> [--closes <n>
  ...]`.
- `--claim epic-done --epic <n> --pr <n> [--repo-root DIR] [--format text|json]` —
  fails unless every native sub-issue of `--epic <n>` is `CLOSED` (GraphQL
  `subIssues` query, refusing an incomplete page) and the named PR is
  `MERGED` and has GitHub-native closing references for every sub-issue.

This script **calls `gh`** (network) — a deliberate, explicitly documented
divergence from `check-lifecycle.mjs`'s offline-only contract (state this in
the script's header comment). It uses GitHub's native `closingIssuesReferences`
relationship rather than regex-scanning PR prose. Do not extend or repurpose
`check-lifecycle.mjs` for this.

`SKILL.md`'s Implement/PR phase section gets a new normative line: the agent
MUST NOT state a "complete" or "PASS" claim of either kind without having run
the matching `check-completion.mjs` mode and gotten a pass; on failure, state
what's missing instead of declaring done.

### Files

- `skills/sdlc/scripts/check-completion.mjs` (new)
- `skills/sdlc/scripts/check-completion.sh` (new)
- `skills/sdlc/SKILL.md` (Implement/PR phase section)
- `test/check-completion.test.js` (new)

### Checks

```bash
node --check skills/sdlc/scripts/check-completion.mjs
node --test test/check-completion.test.js
npx biome check skills/sdlc/scripts/check-completion.mjs skills/sdlc/SKILL.md
npm test
```

### Test coverage (minimum)

Not-pushed branch → `pr-open` fails. No open PR found → fails. Zero or
duplicate `sdlc` declaration blocks, an invalid track, or a declaration slug
that differs from `--slug` → fails. A required issue absent from GitHub's
native `closingIssuesReferences` → fails. Valid pushed branch + single open PR
+ matching declaration + all native closing references present → `pr-open`
passes. Open sub-issue among `--epic`'s children → `epic-done` fails. An
unmerged PR, or a merged PR that does not close every epic sub-issue → fails.
All sub-issues closed + the named PR merged with complete native closing
references → `epic-done` passes.

## BT2 — worker dispatch prompt + infra-retry-once rule (closes #78)

### Outcome

`SKILL.md`'s Implement-phase dispatch guidance states, for any subagent it
dispatches:

- The canonical worker task-prompt shape: explicit stop-conditions ("scope is
  exactly this task's check commands and Definition-of-Done items — do not
  explore beyond them"), a recommended `toolBudget`/`turnBudget` default to
  attach via the `subagent` tool call, and the canonical "finalize now" resume
  message text to send a worker caught exploring past scope.
- The infra-vs-verdict distinction: an **infra-class failure** (process
  crash, OOM, timeout, transport/tool error — never a model-authored
  REVISE/FAIL verdict) gets exactly one automatic retry of that same dispatch
  before it is treated as needing human attention. A second consecutive
  infra failure, or any verdict-based outcome, surfaces to the human as
  normal.

This is prose-only, in-repo. No file outside this repository (in particular,
nothing under `~/.agents/skills/dispatch-subagents`) is touched by this task.

### Files

- `skills/sdlc/SKILL.md` (Implement-phase dispatch guidance)
- `test/docs.test.js` (new assertions)

### Checks

```bash
node --test test/docs.test.js
npx biome check skills/sdlc/SKILL.md
npm test
```

### Test coverage (minimum)

`test/docs.test.js` gains assertions that `SKILL.md` contains: the
stop-conditions/toolBudget worker-prompt wording; the explicit "infra-class
failure" definition (crash/OOM/timeout/transport error) as distinct from a
verdict; the auto-retry-once statement; and the panel fallback rule that
advances through the ordered configured `prefer` list after reviewer failure.

## BT3 — stall-detection guidance (closes #79)

### Outcome

`SKILL.md` states a phase-agnostic (not Spec-only) stall-detection rule:
after **N consecutive turns** (pin N = 2 unless Implement finds evidence this
repo's actual retry cadence warrants a different value — record the choice
either way) ending in a provider/tool error with no assistant content, the
agent treats this as a stall and self-issues a continuation/retry rather than
going quiet and waiting on the human to notice. The wording explicitly states
this is an interim, prose-level mitigation, distinct from and not a
replacement for a genuine harness-level visible-stall/auto-resume feature,
which is out of scope for this repository.

### Files

- `skills/sdlc/SKILL.md` (new stall-detection subsection, phase-agnostic —
  not nested under Spec or any single phase)
- `test/docs.test.js` (new assertions)

### Checks

```bash
node --test test/docs.test.js
npx biome check skills/sdlc/SKILL.md
npm test
```

### Test coverage (minimum)

`test/docs.test.js` gains assertions that `SKILL.md` contains: the numeric
stall threshold and self-resume action, and the explicit
interim-vs-harness-fix distinction naming the harness fix out of scope.
