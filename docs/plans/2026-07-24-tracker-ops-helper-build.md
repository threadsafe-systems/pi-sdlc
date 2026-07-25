# Build plan: tracker-ops helper (#82)

- Plan: `docs/plans/2026-07-24-tracker-ops-helper.md` (approved).
- Track: reversible — no Spec, no scenario ids; each task cites the Plan DoD
  bullet(s) it satisfies instead.
- `shape.publishToTracker` = 2; this build has 4 tasks, so it publishes as an
  epic + 4 native sub-issues on board 5, per `phase-tasks.md` §9.

## Interface design (binding for Implement — do not redesign mid-task)

`skills/sdlc/scripts/tracker-ops.mjs` (+ `tracker-ops.sh` thin wrapper, same
pairing as `collect-run.{mjs,sh}`):

- Global flags on every subcommand: `--repo-root DIR` (resolve
  `sdlc.config.json` for `labelPrefix`/`tracker.repo`/`tracker.board`),
  `--gh-cmd CMD` (default `gh`, `execFile`-no-shell, injectable for tests),
  `--format json|text` (default `json`).
- Subcommands and their return shape (`{ok:true, ...}` / `{ok:false, reason}`,
  never throws on a caller-recoverable `gh` failure):
  - `lookup-node --repo <owner/name> --number <n>` → `{nodeId, number, title}`.
  - `create-epic --title --body [--labels a,b]` → creates issue, labels it
    `<LABEL_PREFIX>:epic` plus any extra, adds to the configured board at
    `Todo` → `{number, nodeId, itemId, url}`.
  - `create-task --title --body --parent <epic#> [--labels a,b]` → creates
    issue labeled `<LABEL_PREFIX>:build-task` plus extra, wires `addSubIssue`
    to `--parent`, adds to board at `Todo` → `{number, nodeId, itemId, url}`.
  - `add-blocked-by --issue <n> --blocking <n>` → wires `addBlockedBy` →
    `{issue, blocking}`.
  - `frontier --parent <n>` → open + unassigned + (blockedBy empty or all
    closed) children → `{items: [{number, title}, ...]}`.
  - `claim --issue <n> --login <user>` → check-then-set best-effort (per
    `tracker-ops.md`'s documented non-atomicity) → `{claimed: bool, reason?}`.
  - `find-items --project <n> --owner <org> [--since ISO] [--status S]
    [--number N] [--title-contains STR]` → filtered `gh project item-list`
    projection → `{items: [...]}`.
  - `set-status --project <n> --owner <org> --item <id-or-issue-number>
    --status <Todo|In Progress|Blocked|In Review|Done>` → resolves an issue
    number to its project item id when given one → `{updated: true}`.
  - `board-add --project <n> --owner <org> --issue <n>` → `{itemId}`.

## Tasks

### T1 — Core script scaffold + creation ops

**Objective.** `tracker-ops.mjs` exists with the shared seam (config
resolution, `--gh-cmd` injection, `--format`, structured non-throwing
failures) and implements `lookup-node`, `create-epic`, `create-task`,
`add-blocked-by`.

**Satisfies (Plan DoD).** "`create-epic`/`create-task` ... **return**
`{number, nodeId, itemId, url}`" bullet; the shared seam bullet.

**Checks.**

```bash
node --check skills/sdlc/scripts/tracker-ops.mjs
node --test test/tracker-ops.test.js -- --filter creation
```

### T2 — Query/mutate ops: frontier, claim, find-items, set-status, board-add

**Objective.** Remaining subcommands implemented against the same seam as T1.

**Satisfies (Plan DoD).** The `frontier`/`claim`/`find-items`/`set-status`/
`board-add` bullets.

**Checks.**

```bash
node --check skills/sdlc/scripts/tracker-ops.mjs
node --test test/tracker-ops.test.js
```

### T3 — Rewrite `assets/tracker-ops.md`; ship `tracker-ops.sh`

**Objective.** `assets/tracker-ops.md` documents the script's commands as the
primary interface; the raw GraphQL recipes move to a clearly-labeled fallback
appendix, content preserved verbatim (node-id-vs-number, claim
non-atomicity, `blockedBy` connection nuance — Plan §"Context for the next
agent"). Add `tracker-ops.sh` (thin `exec node tracker-ops.mjs "$@"` wrapper,
matching `collect-run.sh`'s shape).

**Satisfies (Plan DoD).** "`assets/tracker-ops.md` rewritten; no raw recipe
remains as the primary documented path for an operation the script covers."

**Checks.**

```bash
node --test test/docs.test.js
shellcheck skills/sdlc/scripts/tracker-ops.sh
```

### T4 — SKILL.md rule; full-suite green; acceptance demonstration

**Objective.** Add the SKILL.md rule (new `## Red flags` bullet + a one-line
pointer beside the existing `assets/tracker-ops.md` entry under
`## Delegation`) routing tracker/board mutations through `tracker-ops.*`.
Demonstrate this session's board-5 cleanup pattern (bulk status move by
filter, find-by-number) as a `tracker-ops.mjs find-items` +
`set-status`invocation in `assets/tracker-ops.md`'s own examples, verified
under a fake `--gh-cmd` in tests — the Plan's explicit acceptance check.

**Satisfies (Plan DoD).** "`SKILL.md` carries the new rule ... `npm test` and
`npm run lint` exit 0, no live `gh`/model/network call in tests" and "this
session's board-5 cleanup pattern is expressible as a `tracker-ops.mjs`
invocation."

**Checks.**

```bash
node --test test/docs.test.js test/tracker-ops.test.js
npm test
npm run lint
```

## Definition of done (build-level, mirrors Plan)

- T1–T4 each pass their named checks.
- `npm test` and `npm run lint` exit 0 with no live `gh`/model/network call.
- Frozen surfaces (`test/frozen-surfaces.test.js`) unaffected — this change
  adds a new script/doc, touches no frozen surface.
- Board 5 shows one epic (`<LABEL_PREFIX>:epic`) + 4 sub-issues
  (`<LABEL_PREFIX>:build-task`) once published (this build meets the
  `shape.publishToTracker: 2` threshold).

## Assumptions carried to Implement

- No new npm dependency — `execFile` (Node builtin) is sufficient, matching
  every other skill script's `--*-cmd` seam.
- Bootstrapping irony: `tracker-ops.mjs` doesn't exist yet, so publishing this
  build's own epic/sub-issues to the board happens via direct `gh`
  calls/`gh project item-edit`, not dogfooded through the tool it's building.
  Once T1/T2 land, later builds should dogfood it instead.
