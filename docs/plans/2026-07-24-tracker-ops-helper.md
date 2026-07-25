# Plan: tracker-ops helper (#82)

- Track: **reversible** (internal tooling script + doc + SKILL.md rule; no
  public interface, persisted schema, wire format, or stored-record shape that
  any consumer repo binds to — Case and pi-notion adopt the `sdlc` skill
  package, not this script's CLI shape directly).
- Slug: `tracker-ops-helper`.
- Resolves: #82 (T4, `enhancement`/`priority:high`, part of epic #76's
  config-versioning lifecycle retro pass).

## Objectives

1. Replace every hand-rolled `gh api graphql` / `gh project item-list | jq`
   sequence the agent currently improvises for tracker mutations with a single
   scripted interface, `skills/sdlc/scripts/tracker-ops.mjs` (+ `.sh` thin
   wrapper, matching the repo's existing script pairing convention).
2. Make that interface the **actual implementation** behind everything
   `skills/sdlc/assets/tracker-ops.md` currently documents as copy-paste
   recipes — not a subset — so a SKILL.md rule that says "don't hand-roll
   `gh api graphql`" is true without caveats.
3. Add an explicit, always-visible **SKILL.md rule** routing any tracker/board
   mutation through the script, closing the discoverability gap that caused
   this exact hand-rolling to recur twice in one week (the original T4 retro
   finding, and again during live board-5 triage this session) even though
   the mechanics were already documented.

## Rationale

`assets/tracker-ops.md` is correct and complete as a *reference* — it already
covers node-id lookup, sub-issue wiring, blocking edges, frontier computation,
claim-by-assignment, and board add/status-set. The pain was never "we don't
know the GraphQL," it was "the agent re-derives it by hand every time and
sometimes doesn't consult the doc at all." Two independent occurrences of the
same waste (T4's original evidence, and this session's 25-item board cleanup +
2 issue closures, all hand-rolled) show the doc-only fix already shipped
(2026-07-17-era) didn't close the gap. A script closes the "re-derive by hand"
half; a SKILL.md rule closes the "didn't know to look" half. Neither alone is
sufficient — this plan does both.

The discoverability failure has a specific mechanism worth naming: `sdlc`
SKILL.md's own trigger ("use at the start of any feature or change") doesn't
obviously cover ad hoc board housekeeping, so the skill — and with it
`## Delegation`'s pointer to `assets/tracker-ops.md` — never entered context
for that work. The fix is not a separate always-loaded file (repo has no
`AGENTS.md`/`CLAUDE.md` and won't gain one for this); it's making the rule
live inside `SKILL.md` itself, prominent enough that any tracker-touching
session reads it once the skill is loaded for *any* reason, not just full
lifecycle work.

## Scope — in

- `skills/sdlc/scripts/tracker-ops.mjs` (Node, no new runtime deps — reuse the
  `execFile`-no-shell injectable-`--gh-cmd` seam pattern already established
  by `collect-run.mjs`) implementing, at minimum:
  - `lookup-node --repo <owner/name> --number <n>` — issue node id + number +
    title (the primitive every mutation below needs).
  - `create-epic` / `create-task` — create issue with labels, add to the
    configured board (defaulting `Todo`), wire `addSubIssue` when a `--parent`
    is given, and **return** `{number, nodeId, itemId, url}` — the exact gap
    T4's evidence named ("re-finding the epic/tasks it had just created").
  - `add-blocked-by --issue <n> --blocking <n>` (dependency edge).
  - `frontier --parent <n>` — the open/unassigned/unblocked-children
    computation `tracker-ops.md` already specifies.
  - `claim --issue <n> --login <user>` — the check-then-set best-effort
    pattern (never claims atomicity it can't provide).
  - `find-items --project <n> --owner <org> [--since <iso>] [--status <s>]
    [--number <n>] [--title-contains <s>]` — replaces the `item-list | jq`
    spelunking named in both the original evidence and this session.
  - `set-status --project <n> --owner <org> --item <id-or-issue-number>
    --status <Todo|In Progress|Blocked|In Review|Done>` — single-item and
    (per Build task breakdown) bulk-by-filter set.
  - `board-add --issue <n>` — add an issue to the configured board.
  - All commands: tokens (`labelPrefix`, `tracker.repo`, `tracker.board`)
    resolve from `.pi/sdlc/sdlc.config.json` the same way other scripts do;
    `--format json|text` (default json) matching `sdlc-status`/`config-doc`
    conventions; injectable `--gh-cmd` for tests; never throws on a
    caller-recoverable failure — structured `{ok:false, reason}` instead,
    matching `collect-run.mjs`'s `callLlm` seam philosophy.
- Rewrite `skills/sdlc/assets/tracker-ops.md` to document the script's
  commands as the primary interface. Retain the underlying raw GraphQL as a
  clearly-labeled fallback appendix (useful when the script doesn't cover an
  edge case, or for debugging) — never delete the mechanics knowledge, just
  demote it from "the thing you copy-paste" to "the thing the script does
  for you."
- Add a new, early, hard-to-miss rule in `SKILL.md` (candidate home: a new
  bullet under `## Red flags`, mirroring the existing "hand-rolled
  reimplementation" flags there, plus a one-line pointer near
  `## Delegation`'s existing `assets/tracker-ops.md` entry) stating tracker/
  board mutations go through `tracker-ops.*`, not raw `gh api graphql`/
  `gh project item-list | jq`.
- Tests: fake-`--gh-cmd` unit tests per command (success + representative
  failure shapes), following the existing fake-executable test pattern used
  for `--git-cmd`/`--gh-cmd` elsewhere in this repo (e.g.
  `test/check-lifecycle-git.test.js`'s fake git).

## Scope — out

- No change to the board's Status field options, the label vocabulary, or the
  canonical-source-per-mode semantics `tracker-ops.md` already establishes
  (build-plan doc / map issue remain canonical; the tracker stays a
  projection).
- No daemon, watcher, or standing process — stays a CLI invoked per-call, same
  posture as every other `skills/sdlc/scripts/*`. Respects ADR 0011 ("an
  auditable agent protocol, not a hook engine"); this is explicitly the kind
  of executable-orchestration-machinery boundary question raised on #130, and
  this script does not cross it (it wraps discrete `gh` calls, it doesn't run
  anything unattended).
- No change to `resolve-panel.mjs`, telemetry (FS13), or any other script
  outside the tracker-mutation surface.
- No retrofitting of `assets/tracker-ops.md`'s existing callers (map mode,
  tracker-backed Build docs in `phase-plan.md`/`phase-tasks.md`) beyond
  updating their prose to point at the script instead of raw recipes where
  they currently show a `gh` snippet inline.
- Does not build the broader "tracker-ops helper as an MCP tool" or similar —
  CLI only, matching every existing skill script.

## Definition of done

- `tracker-ops.mjs` implements every command listed in Scope — in; each has a
  passing fake-`gh` test.
- `assets/tracker-ops.md` rewritten; no raw recipe remains as the primary
  documented path for an operation the script covers.
- `SKILL.md` carries the new rule; `node --check` and existing doc/link tests
  (`test/docs.test.js`) still pass.
- `npm test` and `npm run lint` exit 0, no live `gh`/model/network call in
  tests.
- This session's board-5 cleanup pattern (bulk status move + find-by-filter)
  is expressible as a `tracker-ops.mjs` invocation, as a concrete acceptance
  check.

## Context for the next agent (Spec/Build)

- Track is reversible: no Spec phase, no pre-PR design panel — this Plan doc
  is the design gate; Build follows directly on human approval.
- `assets/tracker-ops.md` (read in full) is the ground truth for every
  mutation's exact GraphQL shape — the script is a faithful wrapper, not a
  redesign. Preserve its documented caveats verbatim (node-id-vs-number
  distinction, claim-is-best-effort-not-atomic, frontier's `blockedBy`-is-a-
  connection nuance).
- `collect-run.mjs` (`skills/sdlc-retro/scripts/`) is the concrete precedent
  for the injectable-command-seam + structured-failure pattern to follow —
  read `callLlm` and its surrounding seam before designing `tracker-ops.mjs`'s
  own `--gh-cmd` seam.
- Branch: `feat/tracker-ops-helper` (already created off `main`). Implement
  phase's `hooks.implement.before` fires `worktree_session` create+enter for
  this branch — do not implement in the primary checkout.
- `.pi/sdlc/CONFIG.md` is currently stale relative to `sdlc.config.json`
  (pre-existing, unrelated to this change). A naive `config-doc.sh write`
  regen was checked during this Plan and appeared to drop a space before a
  backtick in the `panels` field's rendered `$comment` text — looks like a
  latent rendering bug, not a safe drive-by fix. Left alone; flag separately,
  don't fix opportunistically inside this branch.
