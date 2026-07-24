# PR panel: tracker-ops-helper — round 2 (verification) consolidated

Same 3 reviewers, verification mode against fix-wave commit
`67f81b3e90ec7e531b962427d02988c3dac2eee2`. Full per-model output:
`claude-fable-5-round2.md`, `gpt-5.6-sol-round2.md`, `gpt-5.6-luna-round2.md`.

## Round-1 finding verdicts

All of H1, H3, M1, M2, M3, M4, M5, L1 ruled **RESOLVED** by at least 2/3
reviewers (Sol rated H3 PARTIAL only on the disputed flag-set below, not on
`--gh-cmd` itself, which all three confirmed reaches the real spawn path).

**H2 (required-arg validation): PARTIAL**, 3/3 reviewers, convergent —
`needInt` accepted `0`/`""` and `opCreateEpicOrTask`'s `if (parent)` treated
0 as absent, so `--parent 0` (or an unset shell var) silently created a
live, unwired, boarded task reporting `ok:true` — the same failure shape as
#173 via a different path. **Disposition: incorporated.** `needInt` now
floors at 1 (every current caller is a GitHub issue number); `create-task`
also now looks up `--parent` *before* `createIssue` (Fable's second
finding) so a bad parent never creates a live orphan at all.

**M6 (bulk set-status): PARTIAL**, 3/3 reviewers — code and tests were real
and correct, but `assets/tracker-ops.md`'s primary-interface section
(the doc Build T4 explicitly named for the demonstration) had no
`--from-status` example. **Disposition: incorporated** — added.

## New defects (round 2)

### Bulk `--from-status` mutated repository-less draft items
Fable (medium) + Sol (medium), convergent. The `repository === undefined`
escape hatch in `find-items`'s repo filter — added for M4 — let a
DraftIssue (which has no `content.repository` or `content.number`) pass
through `--status`/`--title-contains` filters and get edited by bulk
`set-status`, on a shared/multi-repo org board. **Disposition:
incorporated.** Filter is now strict (`i.repository === tok.repo`, no
escape); the unused `repository` override parameter (Fable's speculative-
generality note) was also removed since the CLI never exposed it.

### Invalid `--since` silently returned `ok:true, items:[]`
Fable + Luna, convergent (low). `Date.parse("not-a-date")` is `NaN`,
filtering out every item without signaling anything. **Disposition:
incorporated** — validated up front, `{ok:false, reason}`.

### `find-items --status` typo silently matched nothing
Fable only (low). Unlike `set-status`, `find-items` never validated
`--status` against `STATUS_OPTIONS`. **Disposition: incorporated.**

### `--item` + `--from-status` combined silently favored `--item`
Fable only (low). **Disposition: incorporated** — explicit rejection.

### Truncation-refusal remedy was unfollowable; no server-side filtering
Fable (low) + Sol (medium) — same underlying gap, different severity
readings. The refusal message suggested narrowing with `--status`/
`--number`/`--title-contains`, but all three are client-side post-fetch —
they cannot reduce what's fetched, so the suggestion was actively wrong.
**Disposition: message incorporated** (now states the true situation: no
server-side filter exists, so no flag narrows the fetch). **Deeper gap
(add real server-side filtering via `gh project item-list --query`, the
Projects filter syntax) dismissed as accepted residual risk for now**: board
5 is ~170 items, two orders of magnitude below the 1000 cap; the two
reviewers disagreed on severity (low vs medium) which itself signals
genuine judgment-call territory rather than a clear defect; the proper fix
is a real design change (translating this tool's filters into GH Projects
filter-syntax), not a fix-wave patch. Revisit if board scale approaches the
cap.

### Fix-wave surface undocumented in the primary interface asset
All three, convergent (low). `--gh-cmd` and `--from-status` were real and
tested but absent from `assets/tracker-ops.md`. **Disposition:
incorporated** — both documented with examples.

## Disputed, not re-adjudicated by the author — routed to Neil

**Sol disputes the round-1 dismissal of `--repo`/`--project`/`--owner`/
`--labels` as literal per-subcommand CLI flags**, citing that my own Build
plan (`docs/plans/2026-07-24-tracker-ops-helper-build.md:9-39`) lists them
in the concrete subcommand bullets, not just the "Global flags" section I
cited as authoritative. On rereading: Sol is right that the doc is
genuinely self-contradictory (both readings are textually present), and my
round-1 dismissal was my own post-hoc rationalization of an ambiguity I
authored, not a clean resolution. Per SKILL.md, "disputed high or medium
findings are decided by the project's human owner" — bringing this to Neil
rather than re-dismissing it unilaterally a second time. See PR body /
session for the question and options.

## Result

Every convergent high/medium from round 2 incorporated (H2 fully closed at
its root cause — the floor plus the reorder — not just the reported repro).
Message-only fix + documented residual for the truncation-remedy gap
(judgment-call, not dismissed silently). One disputed finding escalated to
the human owner rather than settled by the same party who wrote the
ambiguous source document. 462 tests pass (41 in tracker-ops.test.js, up
from 35), `npm run lint` exit 0.
