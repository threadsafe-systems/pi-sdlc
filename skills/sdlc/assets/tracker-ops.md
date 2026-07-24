# Tracker operations (GitHub)

> **Tokens** resolve from the project's `.pi/sdlc/sdlc.config.json`:
> `<LABEL_PREFIX>` = `labelPrefix`; `<TRACKER_REPO>` = `tracker.repo` (`owner/name`),
> with `<TRACKER_OWNER>`/`<TRACKER_REPO_NAME>` its two halves; `<TRACKER_BOARD>` /
> `<TRACKER_BOARD_URL>` = `tracker.board.{number,url}`. A project without a
> `tracker` block cannot use the map or epic/board modes.

Shared mechanics for both tracker-backed modes of `sdlc`: the Brainstorm
**map mode** (wayfinder-lite) and the Build **epic/sub-issue/board** mode.
Neither mode owns this file; both point at it so the mechanics are written
once.

Repo: `<TRACKER_REPO>`. Board owner: `<TRACKER_OWNER>` (org-level,
one reusable board — never one board per effort or per epic). The board is
**"<TRACKER_BOARD>"** (`<TRACKER_BOARD_URL>`), the project's one reusable,
org-owned board (its number/URL come from `tracker.board` in
`.pi/sdlc/sdlc.config.json`).

## Label vocabulary

Two disjoint label families — do not mix them. A map ticket resolves a
**decision** or unblocks one (the `ticket-task` type is the one exception —
see its row below); a build sub-issue **implements** an already-decided slice.
Using one prefix for both would make board queries and the frontier
ambiguous.

| Label | Mode | Meaning |
|---|---|---|
| `<LABEL_PREFIX>:map` | Brainstorm | The map issue itself (one per oversized/foggy effort). |
| `<LABEL_PREFIX>:ticket-research` | Brainstorm | AFK: read docs/third-party APIs/local resources, write a linked markdown summary. |
| `<LABEL_PREFIX>:ticket-prototype` | Brainstorm | HITL: raise fidelity with a cheap runnable artifact (state/logic terminal app, or UI variations). |
| `<LABEL_PREFIX>:ticket-grilling` | Brainstorm | HITL: one-question-at-a-time interview. The default ticket type. |
| `<LABEL_PREFIX>:ticket-task` | Brainstorm | HITL or AFK: manual work that must happen before a decision can be made (provisioning, data moves) — not itself a decision. |
| `<LABEL_PREFIX>:epic` | Build | The epic issue for a feature's task breakdown (one per build plan with 2+ tasks). |
| `<LABEL_PREFIX>:build-task` | Build | An implementation slice from the build plan, published as a native sub-issue of the epic. |
| `<LABEL_PREFIX>:hitl` | Brainstorm | This ticket only resolves through a live human exchange — applied alongside the ticket-type label. |
| `<LABEL_PREFIX>:afk` | Brainstorm | This ticket is agent-driven alone — applied alongside the ticket-type label. |

Every map ticket carries exactly one ticket-type label plus exactly one of
`<LABEL_PREFIX>:hitl` / `<LABEL_PREFIX>:afk`. Research defaults AFK, prototype and
grilling default HITL, task can be either — the label makes the choice
explicit and queryable rather than left in the body's prose.

## Using `tracker-ops.mjs` (primary interface)

Every mutation below — node lookup, issue/epic creation, sub-issue and
blocking edges, frontier computation, claiming, board add/status — is a
subcommand of `scripts/tracker-ops.mjs` (`tracker-ops.sh` thin wrapper), not a
`gh` recipe to hand-type. **Do not hand-roll `gh api graphql` or
`gh project item-list | jq` for anything this script covers** — see
`SKILL.md`'s Red flags. Tokens (`labelPrefix`, `tracker.repo`,
`tracker.board`) resolve from `.pi/sdlc/sdlc.config.json` automatically; pass
`--repo-root DIR` when not running from the consumer root. Every subcommand
prints `--format json` (default) or `--format text`, and returns
`{ok:true, ...}` / `{ok:false, reason}` — it never throws on a
caller-recoverable `gh` failure. Pass `--gh-cmd CMD` to point the real spawn
at a fake executable (safe manual exploration and CLI-level testing without
hitting live `gh` — use this rather than guessing at a subcommand's flags
against the real tracker).

```bash
# Resolve an issue's GraphQL node id (the primitive every mutation below needs
# — GitHub's project/sub-issue/blocking mutations take node ids, not numbers).
scripts/tracker-ops.sh lookup-node --number 42

# Create the epic, or a task wired to its parent epic — both create the
# issue, label it, add it to the board (Todo), and return
# {number, nodeId, itemId, url} in one call (the exact "re-finding what I
# just created" gap this tool exists to close).
scripts/tracker-ops.sh create-epic --title "Epic: my feature" --body "$(cat epic-body.md)"
scripts/tracker-ops.sh create-task --title "T1: first slice" --body "$(cat t1-body.md)" --parent 168

# Wire a genuine ordering dependency (most tickets/tasks have none).
scripts/tracker-ops.sh add-blocked-by --issue 172 --blocking 169

# The frontier: open, unassigned children of a map or epic whose blockedBy
# list is empty or entirely closed.
scripts/tracker-ops.sh frontier --parent 168

# Claim by assignment — check-then-set, best-effort (see the non-atomicity
# note below; this call does not change that guarantee, it just automates
# the two steps).
scripts/tracker-ops.sh claim --issue 169 --login neilwashere

# Find items instead of hand-rolling `item-list | jq` — filter by number,
# status, a title substring, or an ISO --since timestamp (joined against
# each candidate issue's updatedAt via one batched graphql call).
scripts/tracker-ops.sh find-items --status "In Progress"
scripts/tracker-ops.sh find-items --since 2026-07-20T00:00:00Z

# Set status — pass an item id (PVTI_...) or a bare issue number (resolved
# to its board item id first).
scripts/tracker-ops.sh set-status --item 169 --status "In Progress"

# Bulk set-status by filter (--item and --from-status are mutually
# exclusive) — moves every item currently in --from-status, optionally
# narrowed further by --number/--title-contains/--since, to --status. This
# is the scripted form of a board-wide cleanup pass (e.g. moving a batch of
# stale Todo items to Done after a bulk close).
scripts/tracker-ops.sh set-status --from-status Todo --status Done --title-contains "spike"

# Add an existing issue to the board without changing anything else.
scripts/tracker-ops.sh board-add --issue 42
```

## The board

One project, reused across every future effort:

- **Owner:** `<TRACKER_OWNER>` (org-level).
- **Title:** "<TRACKER_BOARD>".
- **Linked repo:** `<TRACKER_REPO_NAME>`.
- **Status field** (single-select), options in order: `Todo`, `In Progress`,
  `Blocked`, `In Review`, `Done`.

### Setup (once)

Board *creation* is a one-time, per-project operation `tracker-ops.mjs` does
not wrap (every subcommand assumes the board already exists):

```bash
gh project create --owner <TRACKER_OWNER> --title "<TRACKER_BOARD>"
gh project link <NUMBER> --owner <TRACKER_OWNER> --repo <TRACKER_REPO>
```

`gh project create`'s default project ships its own built-in `Status`
single-select field with only `Todo`/`In Progress`/`Done`. That field is
built-in and **not deletable** (`deleteProjectV2Field` refuses it: "Only
custom fields can be deleted"), and `field-create` refuses a second field also
named `Status` ("Name has already been taken") — so don't try to replace it.
Instead, widen it in place via `updateProjectV2Field`'s `singleSelectOptions`,
re-supplying every existing option's `id` (so its colour/identity survives)
alongside the two new ones:

```bash
gh project field-list <NUMBER> --owner <TRACKER_OWNER> --format json # find the Status field id + existing option ids
gh api graphql -f query='
  mutation {
    updateProjectV2Field(input: {
      fieldId: "<STATUS_FIELD_ID>",
      singleSelectOptions: [
        { id: "<TODO_ID>", name: "Todo", color: GRAY, description: "" },
        { id: "<IN_PROGRESS_ID>", name: "In Progress", color: YELLOW, description: "" },
        { name: "Blocked", color: RED, description: "" },
        { name: "In Review", color: PURPLE, description: "" },
        { id: "<DONE_ID>", name: "Done", color: GREEN, description: "" }
      ]
    }) { projectV2Field { ... on ProjectV2SingleSelectField { name options { id name color } } } }
  }'
```

### Add an issue and set its state

Use `tracker-ops.sh board-add`/`set-status` (examples above). `create-epic`/
`create-task` already board-add as part of creation — this is only needed
when adding an issue that wasn't created through those subcommands.

### Board discipline

- Every map ticket and every build sub-issue gets added to the board on
  creation, defaulting to `Todo`.
- A ticket/task moves to `In Progress` the moment it's claimed (assigned).
- A build task moves to `In Review` when its PR opens, `Done` on merge/close.
- `Blocked` is for external stalls (waiting on a person, a credential, an
  upstream fix) — not the same as a native `blockedBy` dependency, which the
  frontier already accounts for structurally.
- The epic itself rides the board too, moving to `Done` only once every
  sub-issue is closed.

## Canonical source, per mode

The two modes don't share one canonical source — each has its own, because
Build already has a committed doc to project and Brainstorm's default
artifact (bare dialogue) does not:

- **Build mode:** the committed build-plan markdown
  (`<configured paths.plans>/<date>-<feat>-build.md`) remains the authoritative record of
  objectives, rationale, check commands, and definition of done. The epic and
  its sub-issues are a **live, resumable projection** of that record, never
  the other way around. If the tracker and the doc disagree, the doc wins and
  the tracker gets corrected.
- **Map mode:** there is no separate committed doc for Brainstorm to project
  — the map issue itself *is* the canonical, resumable record of that phase,
  right up until it resolves into a Plan. From that point on, the Plan
  artifact (`<configured paths.plans>/<date>-<feat>.md`) is canonical for everything
  downstream, same as any other brainstorm.

Either way, a stale tracker object (a map ticket overtaken by events, a
sub-issue that no longer matches its build task) gets closed/corrected rather
than trusted. This is why a CI artefact-presence check should read committed
docs, not the tracker, and why this file introduces no change to any such
check.

## Fallback: raw GraphQL / `gh` recipes

The recipes below are what `tracker-ops.mjs` executes on your behalf. They
are preserved here — not deleted — for the case a subcommand doesn't cover
(an edge case, a one-off inspection) or for debugging the tool itself. They
are **not** the primary documented path for anything the script already
does; reach for `tracker-ops.sh` first.

### Look up an issue's node id

Both mutations take GraphQL node ids, not issue numbers.

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$number) { id number title }
    }
  }' -f owner=<TRACKER_OWNER> -f repo=<TRACKER_REPO_NAME> -F number=42
```

### Wire a sub-issue (hierarchy)

```bash
gh api graphql -f query='
  mutation($issueId:ID!, $subIssueId:ID!) {
    addSubIssue(input:{issueId:$issueId, subIssueId:$subIssueId}) {
      subIssue { number title }
    }
  }' -f issueId=<EPIC_NODE_ID> -f subIssueId=<TASK_NODE_ID>
```

Verify with `subIssues`/`parent` on either issue via the lookup query's shape,
extended with `subIssues(first:20){ nodes { number title } }` or
`parent { number title }`.

### Wire a blocking edge (dependency, for the frontier)

Only wire this where a genuine ordering dependency exists — most build tasks
and most map tickets have none, and stay simultaneously open.

```bash
gh api graphql -f query='
  mutation($issueId:ID!, $blockingIssueId:ID!) {
    addBlockedBy(input:{issueId:$issueId, blockingIssueId:$blockingIssueId}) {
      issue { number title } blockingIssue { number title }
    }
  }' -f issueId=<BLOCKED_NODE_ID> -f blockingIssueId=<BLOCKER_NODE_ID>
```

Verify with `blockedBy`/`blocking` on either issue, same shape as above.

### The frontier

The **frontier** is every open, unassigned child issue (of a map or an epic)
whose `blockedBy` list is either empty or entirely closed issues. Compute it
with one query per parent — note `blockedBy`/`subIssues` are connections, so
`state` lives on `.nodes`, not on the connection itself:

```bash
gh api graphql -f query='
  query($owner:String!, $repo:String!, $number:Int!) {
    repository(owner:$owner, name:$repo) {
      issue(number:$number) {
        subIssues(first:20) {
          nodes {
            number title state
            assignees(first:5) { nodes { login } }
            blockedBy(first:10) { nodes { number state } }
          }
        }
      }
    }
  }' -f owner=<TRACKER_OWNER> -f repo=<TRACKER_REPO_NAME> -F number=<PARENT_NUMBER>
```

A child is on the frontier iff `state` is `OPEN`, `assignees` is empty, and
every node in `blockedBy` has `state: CLOSED` (or the list is empty). Or read
it visually off the board — that visibility is the whole point of publishing
to the tracker instead of keeping the breakdown in a conversation.

### Claim by assignment (best-effort, not a hard lock)

A session **claims** a ticket or sub-issue by assigning it to the identity
driving the work, **before** any work starts, so concurrent sessions skip it.
`gh issue edit --add-assignee` is not compare-and-set — GitHub issues allow
multiple assignees, so two sessions that both read the same unassigned item
can both add themselves with neither call erroring. Narrow the race by
checking first, then claiming:

```bash
gh issue view <NUMBER> -R <TRACKER_REPO> --json assignees -q '.assignees | length'
# 0 -> unclaimed, proceed; non-zero -> already claimed, pick a different frontier item
gh issue edit <NUMBER> -R <TRACKER_REPO> --add-assignee <login>
```

This is a **best-effort** claim, the same honesty discipline a project should
apply to any non-atomic guarantee ("best-effort," not "no-loss") — it narrows
the race window but a check-then-set is not atomic. A
true exclusive lock would need a different primitive GitHub doesn't offer
for issue assignment; don't claim more than this gives you. `tracker-ops.sh
claim` automates exactly these two calls and no more.
