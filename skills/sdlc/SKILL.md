---
name: sdlc
description: The enforced software development lifecycle. Use at the start of any feature or change. Sequences brainstorm, plan, spec, build, implement, and PR review, enforces the per-phase gates, and delegates fan-out to the global adversarial-review, dispatch-subagents, and gh-pr-review-comments skills. This is the project law, not a suggestion.
---

# sdlc

The one predictable way a change enters the codebase. Read this before starting a
feature.

Announce at start with the project's `announce` string from
`.pi/sdlc/sdlc.config.json` (default: "Using the sdlc skill to drive this change
through its lifecycle.").

## The iron law (two tracks)

The law fixes what may not be skipped forward. Backward moves (returning to an
earlier phase when a later one exposes a flaw) are always allowed and never
penalised: the sunk cost of an earlier gate never justifies shipping a
known-wrong design.

A change is **irreversible** if it freezes a shape other code, data, or
extensions bind to: public interfaces, contracts, persisted schemas, wire
formats, stored-record shapes, anything a consumer or stored record commits to.
Everything else is **reversible** (internal refactors, docs, tests, tooling).
When in doubt, it is irreversible.

| Track | Phases required | Design panels |
|---|---|---|
| Irreversible | brainstorm, plan, spec, build, implement, PR | plan panel AND spec panel |
| Reversible (fast path) | brainstorm (may be brief), plan, build, implement, PR | none pre-PR; the PR panel still runs |

Every PR declares its track (see `.github/pull_request_template.md`). CI checks
the declared track's artifacts are committed.

## Phases, artifacts, gates

| Phase | Artifact | Home | Gate |
|---|---|---|---|
| Brainstorm¹ | dialogue to an agreed design | none | human approves the design |
| Plan | objectives, rationale, scope in/out, definition of done, context for the next agent | `docs/plans/<date>-<feat>.md` | plan panel (irreversible); human approval |
| Spec | contracts, interfaces, surface area, functional and non-functional requirements, falsifiable verification scenarios with stable ids | `docs/specs/<date>-<feat>.md` | spec panel grounded in the code; human approval |
| Build¹ | task breakdown; each task names its check commands and the scenario ids it satisfies | `docs/plans/<date>-<feat>-build.md` | none (derived from the vetted spec) |
| Implement | code and tests | the feature branch, in a worktree | per-task mechanistic validator |
| PR | the diff | GitHub | PR panel to the stop condition |

¹ Both have a second mode for scale, backed by GitHub's native sub-issue and
blocking relationships (see `assets/tracker-ops.md`) — see the two sections
below. Brainstorm can run as a **map** for oversized/foggy efforts; Build can
publish as an **epic + sub-issues + board** once a build plan has two or more
tasks. Each mode has its own canonical source (map mode: the map issue itself;
tracker-backed build: the committed build-plan doc) — see each section for
which.

## Brainstorm — map mode (wayfinder-lite)

Default brainstorm is a single dialogue gated by human approval, sized for one
session. Switch to **map mode** when the idea is too large or too foggy for
that: the destination — what reaching the end of this effort's brainstorming
looks like, usually a Plan-ready decision — isn't visible yet, and forcing it
into one dialogue would either truncate the thinking or blow the session's
context.

**The map** is a GitHub issue labeled `<LABEL_PREFIX>:map` — the canonical,
resumable artifact for the effort, not a doc. Its body carries: **Destination**
(what reaching the end of this map looks like, one or two lines), **Notes**
(skills to consult, standing preferences), **Decisions so far** (one line per
closed ticket, gisted, linking the ticket for detail), and **Not yet
specified** (the fog — see below). Never restate a ticket's detail on the map;
the map is an index, the ticket is the store.

**Tickets** are native GitHub sub-issues of the map, each typed by label
(`<LABEL_PREFIX>:ticket-research` | `-prototype` | `-grilling` | `-task` — see
`assets/tracker-ops.md` for the label vocabulary and every mutation below).
Every ticket is either **HITL** (worked with a live human — it only resolves
through that real exchange; an agent answering its own grilling questions has
broken this) or **AFK** (agent alone), marked explicitly with the
`<LABEL_PREFIX>:hitl` / `<LABEL_PREFIX>:afk` label alongside its ticket-type label. A
session **claims** a ticket by
assigning it to itself before starting work (`tracker-ops.md`, "Claim by
assignment"). Blocking uses the native `blockedBy` edge so the **frontier** —
open, unblocked, unclaimed tickets — is visible without reopening a
conversation.

**Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
whether the question is sharp now, not whether you can answer it now: ticket
when it's already sharp (even if blocked); leave it in **Not yet specified**
when you can't yet phrase it that sharply — write it as loosely as the view
allows. Resolving a ticket clears the fog ahead of it, graduating whatever's
now specifiable into fresh tickets, one at a time.

**Out of scope.** Work beyond the destination isn't fog — it's out of scope,
its own map section, never graduating. If a ticket turns out to sit past the
destination, close it and record one line (gist + why) in Out of scope rather
than resolving it on the route.

**Working the map** (never resolve more than one ticket per session): load the
map's low-res body (not every ticket); choose the ticket (the user's choice,
or the first frontier ticket); claim it; resolve it, invoking whatever the
ticket type and `## Notes` call for; record the resolution as a comment,
close the ticket, and append one line to Decisions so far; graduate any fog
the answer specifies into fresh tickets, and rule out of scope anything the
answer reveals is past the destination.

**Exit** the moment the destination is decision-ready — often before every fog
patch has graduated. At that point proceed to Plan normally, using the
destination as its objective. If breadth-first mapping surfaces no fog at
all — the whole effort fits in one session — skip the map and use plain
brainstorm dialogue instead.

## Build — tracker-backed (epic + sub-issues + board)

The committed build-plan doc (`docs/plans/<date>-<feat>-build.md`) stays the
canonical task breakdown — objectives, rationale, check commands, and
scenario ids per task never live only in the tracker. Whenever that breakdown
has **two or more tasks**, publish it as tracker objects too, so the work is
visible and resumable across sessions without reopening the build-plan doc:

- One **epic issue** (label `<LABEL_PREFIX>:epic`), body linking the plan/spec/
  build-plan docs and restating the definition of done.
- One **native sub-issue per task** (label `<LABEL_PREFIX>:build-task`, wired via
  `addSubIssue` — see `assets/tracker-ops.md`), body written to
  `assets/agent-brief.md`'s template: the task's check commands and the
  scenario ids it satisfies, pulled from the build plan, never re-derived.
- **Blocking edges** (`addBlockedBy`) only where a task genuinely can't start
  before another finishes — most tasks in a well-sliced build have none and
  stay simultaneously open.
- Every issue added to the shared **"<TRACKER_BOARD>"** project (one
  reusable board, org-owned, never one per epic — see `tracker-ops.md`),
  moving `Todo → In Progress` on claim, `→ In Review` when its PR opens,
  `→ Done` on merge/close, `→ Blocked` on an external stall. The epic itself
  moves to `Done` only once every sub-issue is closed.

A single-task build stays a plain committed build-plan doc — the tracker
overhead isn't proportionate for one task. **Implement** then works the
board's frontier one sub-issue at a time, same discipline as working a map:
claim before starting, close and update the board on completion, and let a
PR's `Closes #<sub-issue>` list do the bookkeeping it already does today.

The tracker is a **projection** of the committed docs, never the source of
truth — if they disagree, the doc wins and the tracker gets corrected. This is
why the CI presence-check keeps reading committed docs, not
issues.

The spec defines verification **scenarios** (falsifiable acceptance criteria with
stable ids and pass or fail conditions), not implementation test code. The
implementer writes real tests test-first (watch them fail, then implement) and
treats the spec scenarios as the floor, not the ceiling. A scenario that cannot
be made to fail is a broken spec.

## Panels: resolve, dispatch, consolidate, adjudicate, stop

Each design panel and the PR panel run the same shape. The four phase reviewer
prompts are the single sources of truth in `assets/`; never hand-copy a prompt
per model.

1. **Resolve the panel** for the phase (live, deduped, author-excluded):

   ```bash
   scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <author-vendor>
   ```

   It reads `sdlc.models.json`, keeps models with credentials, enforces at least
   two distinct vendors (one for task_validate), and excludes the author's
   vendor. Add `--pong` for a live smoke test when you want it (costs a call per
   candidate; off by default for cost).
2. **Dispatch** the phase template across the resolved models. Two paths:
   - in-harness (default in a live pi session): stamp the phase's project prompt
     into ONE model-agnostic, project-scoped agent, then dispatch it once per
     resolved model via the `subagent` tool's per-task `model` override (one
     agent reused across the panel, not one file per model):
     ```bash
     scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
     scripts/resolve-panel.sh pr_review --author <vendor> --emit-tasks <prefix>-pr-review
     ```
     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array; fill
     the `FILL_IN_TASK_BLOCK` placeholder with the task block below and dispatch
     in one call. Per-model attribution comes back on each task's `result.model`.
     `ensure-panel-agent.sh` copies the prompt body verbatim (the prompts have
     no H1 title to strip) and writes to the consumer repo's `.pi/agents` where the
     session resolves project agents (NOT a `cd`-ed cwd). See the sub-agent
     gotchas in AGENTS.md.
   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s
     `dispatch.sh` stamps one prompt file across `--model` flags.
   Give each reviewer the exact inputs: the artifact under review, the upstream
   artifacts it must be consistent with, the repo path and commit, and the
   grounding rule (cite file:line for any framework claim).

**Before you fan out** (either path): confirm the `subagent` tool is actually in
your toolset. If it is missing in a live pi session, the fix is a session reload
(the plugin registers tools at session start, so a package added mid-session is
not retroactively injected), NOT a switch to the detached path or a claim that
you are outside pi. For a read-only research fan-out inside a worktree, dispatch
the project `researcher-readonly` agent (no `write` tool, returns the brief
inline) so children never block on a forbidden write. Prefer `wait({ all: true })`
over status-polling for read-only fan-out, and read a child's transcript before
treating a "detached" status label as lost output.
3. **Consolidate**: collapse duplicates into one issue, keep cross-model
   agreement as signal, preserve genuine disagreement.
4. **Adjudicate**: for every high or medium finding, either incorporate it or
   record a one-line reason for dismissal. Disclose the orchestrating model in
   the consolidated file. Disputed high or medium findings are decided by the
   human (Neil), who is the final adjudicator. Reviewer output is roughly eighty
   per cent right and overreaches, so nothing is actioned blindly and nothing is
   dismissed silently.
5. **Stop** when no high or medium finding survives adjudication. Low findings
   are recorded, not blocking. Termination is measured against surviving
   findings, so a ruthless panel that always emits nits still converges.

Save panel artifacts under `docs/reviews/<phase>-<feat>-<date>/`: one file per
model, the shared `prompt.md`, and a `consolidated.md` carrying the adjudication
and the orchestrating model.

## Per-task validator (implementation)

Each task ends with one validator subagent, a checklist executor, not a judge.
Its remit is only checks it runs (see `assets/validator-task.prompt.md`): the
test command exits zero, `npx tsc --noEmit` exits zero, the task's named
scenario ids pass, greppable CONTRIBUTORS rules hold, no banned patterns. It
gives a pass or fail per check, never a quality opinion. A task is not done
until every check passes. Judgement review happens later at the PR panel. Model
preference: `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5`.

## PR and review cycle

Open the PR with `.github/pull_request_template.md` filled in (track declared,
plan and spec linked, checklist complete). Run the PR panel
(`assets/adversary-review.prompt.md`), consolidate and adjudicate, and post
inline via the `gh-pr-review-comments` skill's atomic review scripts (one pending
review, verified by content, single submit event). When addressing comments,
reply on each thread with the short SHA of the commit that addressed it. Repeat
the panel after each fix wave until no high or medium survives adjudication.

## Visual gate artefacts (optional)

Gate artefacts may be rendered into a self-contained interactive HTML view
(traceability matrix, contract panel, risk map, DoD coverage) with the global
`sdlc-visual-docs` skill (`~/.agents/skills/sdlc-visual-docs/`): declare node
IDs in headings and edge triples in front matter, then `lint.mjs` /
`render.mjs`. Spec scenario IDs double as graph nodes. This is a pointer, not
a dependency: renders are ephemeral, never committed as a requirement, and
never CI-checked.

## Delegation (do not reimplement)

- `adversarial-review` (global): the generic reviewer template mechanics and the
  `ensure-adversary-agent.sh` generator (one shared agent + per-task `model`).
  sdlc keeps its own phase-specific prompts, so use the project-local
  `scripts/ensure-panel-agent.sh` (phase-aware) to stamp them, not the global
  generic script.
- `dispatch-subagents` (global): detached fan-out, model discovery, the
  0-byte-log rule, monitoring.
- `gh-pr-review-comments` (global): atomic inline posting and thread replies.
- `assets/tracker-ops.md` (project-local): the GitHub sub-issue/blocking
  mutations and board mechanics shared by map mode and tracker-backed build —
  don't re-derive them per phase.
- `assets/agent-brief.md` (project-local): the durability rules and template
  for any ticket, sub-issue, or hand-written follow-up issue body.

## ADRs

When a decision made anywhere in the lifecycle (a map ticket, a plan, a spec)
is hard to reverse, surprising without context, and the result of a real
trade-off — all three — write it to `docs/adr/` immediately rather than only
stating it in the artifact that triggered it. See `docs/adr/README.md` for the
full criteria and template. Existing flat locked-decisions lists in a project's
governing docs are historical record and are not migrated.

## Red flags

- Skipping a gate forward (backward is always fine).
- Merging with a high or medium finding that survived adjudication.
- Dismissing a finding without a recorded reason, or incorporating one blindly.
- A spec outcome that no scenario can falsify.
- Committing generated per-model adversary files (they are git-ignored; the
  templates in `assets/` are the source of truth).
- Editing a phase reviewer prompt in more than one place.
- Resolving more than one map ticket in a single session.
- A HITL ticket resolved by the agent answering its own questions.
- A build plan with two or more tasks that skips the epic/sub-issue/board
  publish step.
- Treating the tracker (map, epic, sub-issues, board) as the source of truth
  instead of the committed doc it projects.
