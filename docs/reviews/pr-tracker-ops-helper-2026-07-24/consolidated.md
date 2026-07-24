# PR panel: tracker-ops-helper — round 1 consolidated findings

Orchestrating model: anthropic/claude-opus-4-8 (this session).
Reviewers: anthropic/claude-fable-5:xhigh, openai-codex/gpt-5.6-sol:xhigh, openai-codex/gpt-5.6-luna:xhigh.
Dispatched via `subagent` (async), commit `2e0b8180a85488f1e656c7dcaf99c96668899310`.

**Incident during review:** reproducing the missing-required-args finding, one
reviewer's repro invoked live `gh` and created a real issue (#173, title/body
`"undefined"`) on `threadsafe-systems/pi-sdlc`, added to board 5. Deleted
immediately (`gh issue delete 173 --yes`) once reported. This is itself
confirming evidence for finding H2 below, not a separate incident to litigate.

## High

### H1 — `--repo-root`/`--config` are dead: empty-string defaults win `inspectRoot`'s `??` chain
Fable. `opts.repoRoot`/`opts.config` defaulted to `""`, and `inspectRoot`'s
`config ?? repoRoot ?? sdlcRoot ?? $SDLC_ROOT` treats `""` as present (not
nullish), so it always wins and then fails the `if (explicit)` truthiness
check — both flags were silently no-ops, always falling back to the cwd
ancestor walk. This is a **previously-documented gotcha in this exact
codebase** (recorded from an earlier session: "pass `config||undefined`") that
I failed to apply here.
**Disposition: incorporated.** Default both to `undefined`; guard with
`|| undefined` at the call site.

### H2 — Missing required-argument validation → malformed live mutations
All three reviewers, independently. No subcommand validated required
options; a missing `--body`/`--title`/`--parent` flowed as literal JS
`undefined` into `gh` argv (stringified by `spawnSync`), executing a real
mutation instead of failing usage. Directly caused the live #173 incident
during review.
**Disposition: incorporated.** Added per-subcommand required-field
validation (title/body for create-*, parent for create-task, integer
validation for --issue/--blocking/--number/--parent) — usage errors exit 2
via `fail()` before any `gh` call.

### H3 — The build plan's binding `--gh-cmd` flag was never implemented
All three reviewers. My own Build plan's "Interface design (**binding for
Implement — do not redesign mid-task**)" section commits to a global
`--gh-cmd CMD` flag; I implemented JS-level `main(argv,{gh})` injection only
(the `check-completion.mjs` precedent) and never added the CLI flag or
amended the Build plan to reflect the deviation — exactly the "redesigning
mid-task without a Build correction" red flag SKILL.md names for a different
surface.
**Disposition: incorporated.** Added `--gh-cmd CMD` (default `gh`) wired
into the real `spawnSync` path, independent of and in addition to the
JS-level `{gh}` test seam (which stays — it's still the faster, house-style
unit-test path). This also would have prevented the #173 incident: a
reviewer could have safely pointed `--gh-cmd` at a no-op script.

Two sub-claims under this finding are **dismissed**:
- `--repo`/`--project`/`--owner` as literal required flags (Sol, Luna): my
  own Build plan is internally inconsistent — per-command usage sketches show
  `--repo <owner/name>` but the "Global flags" section (the more specific,
  authoritative passage) commits to config-derived resolution via
  `--repo-root`. Config-derived resolution is also what `assets/tracker-ops.md`
  documents and what the tool ships. Not fixing; the doc inconsistency was
  mine, the shipped design is the intended one.
- `--labels a,b` (comma-joined) vs shipped repeated `--label L` (Sol, Luna):
  my Build plan's bracket-notation examples say `--labels a,b`; the shipped
  repeated flag matches `gh issue create --label`'s own convention and avoids
  comma-escaping in a title/label. Kept as a discretionary call, recorded in
  the PR body.

## Medium

### M1 — Partial create failure discards the created issue's identity
All three reviewers. `opCreateEpicOrTask` returns only the failing step's
`{ok:false,reason}` after `createIssue` succeeds, losing `number`/`url` —
inviting duplicate creation on retry.
**Disposition: incorporated.** Every post-create failure now includes
`created:{number,url}` and `failedStep`.

### M2 — `frontier`'s `blockedBy(first:10)` has no pagination guard
All three reviewers. `subIssues(first:100)` is guarded with a `hasNextPage`
refusal; the nested `blockedBy` connection isn't, so an 11th+ open blocker is
silently missed.
**Disposition: incorporated.** Same refusal pattern applied to `blockedBy`.

### M3 — `find-items` silently truncates at 1000 with no `totalCount` check
Fable, Luna.
**Disposition: incorporated.** Compares `items.length` against
`totalCount`; refuses (matching `frontier`'s honesty convention) rather than
returning a silently incomplete result.

### M4 — Cross-repo item-number collision on multi-repo boards
Fable (medium confidence). `content.repository` was dropped from the
projection; `set-status`-by-number took `items[0]` blindly.
**Disposition: incorporated.** `find-items` now carries `repository`;
`set-status`'s number-resolution filters to `tok.repo`.

### M5 — Creation doesn't explicitly guarantee `Todo` status
Luna. `item-add` was observed defaulting new items to `Todo` on this
project's board, but that isn't a documented GitHub Projects v2 guarantee —
likely project-specific automation, not something to depend on silently.
**Disposition: incorporated.** `create-epic`/`create-task` now explicitly
set `Todo` after boarding, matching the documented "defaulting to Todo"
discipline instead of assuming it.

### M6 — `set-status` has no bulk-by-filter mode
Luna. My own Plan explicitly promised "single-item and (per Build task
breakdown) bulk-by-filter set," and Build T4's acceptance check named "bulk
status move by filter" as the explicit demonstration — I only shipped the
single-item path.
**Disposition: incorporated (real scope gap, not overreach).** Added
`--from-status` — when present without `--item`, `set-status` runs
`find-items` with the other filters plus `--status <from-status>` and
applies the target `--status` to every match, returning
`{ok:true, updated:[...]}`.

## Low

### L1 — `--format` value unvalidated
Fable. **Disposition: incorporated** (trivial): `--format` restricted to
`json|text`, else usage error.

### L2 — `needVal` rejects dash-prefixed values
Fable. Matches `resolve-panel.mjs`'s existing `needVal` (`v.startsWith("-")`)
verbatim — a repo-wide hand-rolled-parser limitation, not something novel to
this script. **Disposition: dismissed.** Fixing it here alone would diverge
from the sibling-script convention my Build plan explicitly said to match;
a cross-script fix is out of scope for this task.

## Result

Zero high/medium dismissed without incorporation bar L2 (which is low, and
carries a recorded reason). Fix wave applied; re-verification round 2 to
follow before opening the PR.
