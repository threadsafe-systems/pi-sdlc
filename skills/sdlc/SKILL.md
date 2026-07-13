---
name: sdlc
description: The enforced software development lifecycle. Use at the start of any feature or change. Sequences brainstorm, plan, spec, build, implement, and PR review, enforces the per-phase gates, and delegates fan-out to the global adversarial-review, dispatch-subagents, and gh-pr-review-comments skills. This is the project law, not a suggestion.
---

# sdlc

The one predictable way a change enters the codebase. Read this before starting a
feature.

Announce at start with the project's `announce` string from
`.pi/sdlc/sdlc.config.json` (default: "Using the sdlc skill to drive this change
through its lifecycle.") — but first run the readiness gate below: announce only
after `sdlc-status` reports this repo is ready (exit 0).

## Opt-in and advisory mode

The sdlc is a framework a repo *adopts*, not a global default. A repo has
adopted the sdlc when its **current `HEAD` commit** contains
`.pi/sdlc/sdlc.config.json` — a manifest merely present on disk (untracked,
staged, or ignored) is not adoption. Being **ready** to run under law needs
more: the active manifest must also be clean and valid, the models roster
(`.pi/sdlc/sdlc.models.json`) committed, clean, and valid, and any
`.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8, ADR 0016) proves all of
this mechanically with four states.

At the start of every session, run the mechanical gate and branch on its exit
code (prefer `--format json` when parsing):

1. Run `skills/sdlc/scripts/sdlc-status.sh [--repo-root DIR] [--format text|json]`
   (with the session's cwd inside the consumer repo, or pass `--repo-root`).
2. **Exit 0 (`ready`)**: announce with the config's `announce` string, then
   enumerate each configured hook (phase, timing, kind) and each top-level rule
   of `.pi/sdlc/workflow.md` if present. Proceed under full law.
3. **Exit 1 (`not-adopted`)**: do NOT announce. State that this repo has not
   adopted the sdlc and offer either `/setup-sdlc` to opt in, or advisory
   mode for this session only, with the user's explicit in-session consent.
4. **Exit 2 (`error`)**: do NOT announce. Surface the report's diagnostics and
   stop the SDLC. An error is never silently downgraded to advisory mode —
   advisory is not a bypass.
5. **Exit 3 (`not-ready`)**: do NOT announce. State that the repo is adopted
   but incomplete (for example uncommitted manifest changes or a missing
   committed models file), list the report's remediations, and stop the SDLC.
   Do not offer advisory mode as a bypass.

Before `sdlc-status` exits 0 the agent MUST NOT enter any lifecycle phase, MUST
NOT fire configured hooks, MUST NOT stamp panel agents, MUST NOT create or
mutate tracker objects, and MUST NOT claim any gate as passed. This startup
table is agent-executed prose law (ADR 0011): the script proves repository
state; it does not claim to enforce agent behaviour.

### Advisory mode

Advisory mode is the escape hatch when a repo has not opted in but the user still
wants sdlc guidance for one session. In advisory mode: never use any `announce`
string and never claim the session runs "under law"; prefix every phase marker
with `advisory:`; follow the phase sequence as guidance only; and MUST NOT create
or mutate tracker objects, MUST NOT claim any gate as passed, and MUST NOT stamp
panel agents.

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

Every PR declares its track in the template's `sdlc` declaration block
(provisioned by setup). The `check-lifecycle` script verifies the declared
track's artifacts are committed: run it locally before opening the PR; in CI
it runs wherever the repository has configured the shipped workflow or the
documented snippet. The declaration values are `irreversible`, `reversible`,
or `none`; lifecycle tracks require a slug, and `none` requires a reason.
Auto-generated `[bot]` PRs without a valid declaration are exempt; a valid
present declaration always dominates.

## Phases, artifacts, gates

| Phase | Artifact | Home | Gate |
|---|---|---|---|
| Brainstorm¹ | dialogue to an agreed design | none | human approves the design |
| Plan | objectives, rationale, scope in/out, definition of done, context for the next agent | `docs/plans/<date>-<feat>.md` | plan panel (irreversible); human approval |
| Spec | contracts, interfaces, surface area, functional and non-functional requirements, falsifiable verification scenarios with stable ids | `docs/specs/<date>-<feat>.md` | spec panel grounded in the code; human approval |
| Build¹ | task breakdown; each task names its check commands and the scenario ids it satisfies | `docs/plans/<date>-<feat>-build.md` | none (derived from the vetted spec) |
| Implement | code and tests | the feature branch (worktree or checkout per the project's hooks/workflow) | per-task mechanistic validator |
| PR | the diff | GitHub | PR panel to the stop condition |

¹ Both have a second mode for scale, backed by GitHub's native sub-issue and
blocking relationships (see `assets/tracker-ops.md`) — see the two sections
below. Brainstorm can run as a **map** for oversized/foggy efforts; Build can
publish as an **epic + sub-issues + board** once a build plan has two or more
tasks. Each mode has its own canonical source (map mode: the map issue itself;
tracker-backed build: the committed build-plan doc) — see each section for
which.

## Brainstorm

Brainstorm is a live dialogue, not a drafting exercise the agent completes
alone. The agent's job is to be the author's thinking companion: actively
rubber-duck the idea, not agree with it. Going along with whatever the human
says first is a failure mode, not politeness. This applies to both plain
dialogue and map mode below — it's how the conversation runs, not a mode of
its own.

Concrete behaviour, not just tone:

- **Raise a contradiction, or say there isn't one.** Before the gate, name at
  least one contradiction, unstated assumption, or gap in the design if one
  exists. If the design is genuinely clean, state that explicitly ("no
  contradiction found") rather than saying nothing — silence is not evidence
  of soundness.
- **Use the tools available**, not just the conversation, when they'd
  actually sharpen the thinking: web research for prior art or external
  grounding, and codebase exploration when the idea touches an existing
  pattern the human might be unaware of or might be wrongly assuming is
  novel. This is proportional, not mandatory ceremony — a brief brainstorm
  (see below) doesn't need a research pass just to be brief.
- **Present multiple open questions in a structured form** when the
  environment provides a tool for that (e.g. a questions-helper plugin)
  rather than a wall of unstructured prose. See "Skills and tools are
  enhancements, not dependencies" (below, after Hooks) for what to do when
  it isn't there — note that rule explicitly does not cover hooks.
- **Expand and pressure-test, don't commandeer.** Contradictions and
  questions exist to widen the human's option space, not to steer the design
  toward the agent's own preferred answer. The human remains the owner of
  the direction; the gate is *their* approval, not the agent's conviction.

### Map mode (wayfinder-lite)

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
prompts are the single sources of truth in `prompts/`; never hand-copy a prompt
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
   project's human owner, who is the final adjudicator. Reviewer output is roughly eighty
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
Validation is **portable and deterministic**: the task's checks are whatever its
approved Build task declared, never a language or tool the skill imposes. There
is no unconditional `npx tsc --noEmit` and no assumed `CONTRIBUTORS` file; a
TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
linter, another repo declares its own tools.

Every implementation task carries a committed **PV1 validation manifest**
(`docs/validation/<feature>/<task-id>.json`, schema
`schema/task-validation-manifest.schema.json`) projected from its canonical
Build task. The manifest names, as exact argv arrays, the task's checks across
five categories — `tests`, `static`, `scenarios`, `standards`, `bannedPatterns`
— each `required` or `n/a` with a Build-approved reason, plus the mapping from
each owned Specification scenario to the required checks that evidence it.

The **deterministic runner** (`scripts/validate-task.sh` → `validate-task.mjs`,
surface PV2) — not the model — validates the manifest, executes only its
declared argv with no shell, evaluates categories and scenarios, bounds and
redacts command evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or
`ERROR` (exit 2). Build, not the validator, owns which commands run and which
categories are `n/a`; the validator cannot invent a command, weaken a check, or
decide applicability. The validator subagent (see
`prompts/validator-task.prompt.md`) runs the runner, confirms exit and report
verdict agree, and reports each result. A nonzero runner result blocks task
completion; a task is not done until the runner returns PASS. Each task stores a
runtime receipt (manifest copy, runner report, generated-agent copy, hashes,
model, verdicts) under `docs/reviews/task-validate-<feature>-<task-id>-<date>/`,
verifiable with `scripts/verify-task-receipt.mjs`. Judgement review happens later
at the PR panel. Model preference: `deepseek/deepseek-v4-flash`, then
`anthropic/claude-haiku-4-5` — a `:low` (or `:off`) thinking suffix on either
fits this role well, since a checklist executor doesn't need deep reasoning (see
`sdlc.models.schema.json` for the full `provider/model[:thinking]` syntax).

## PR and review cycle

Open the PR with `.github/pull_request_template.md` filled in: declare the
track and slug, then link governing documents per track — irreversible:
plan, Specification, Build plan; reversible: plan and Build plan, never a
Specification; none: a reason. For reversible PRs, the plan and Build plan
are the review grounding and a Specification must not be demanded. Run the
PR panel (`prompts/adversary-review.prompt.md`), consolidate and adjudicate,
and post inline via the `gh-pr-review-comments` skill's atomic review scripts
(one pending review, verified by content, single submit event). When
addressing comments, reply on each thread with the short SHA of the commit
that addressed it. Repeat the panel after each fix wave until no high or
medium survives adjudication.

Before opening the PR, run the local lifecycle checker from the installed
skill path:

```bash
node <skill-dir>/skills/sdlc/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .
```

`track: none` is an exemption declaration, not a third lifecycle track; it
requires a reason and its honesty remains PR-panel prose law. CI enforcement
is conditional on the repository configuring the shipped workflow or snippet.

## Visual gate artefacts (optional)

Gate artefacts may be rendered into a self-contained interactive HTML view
(traceability matrix, contract panel, risk map, DoD coverage) with the global
`sdlc-visual-docs` skill (`~/.agents/skills/sdlc-visual-docs/`): declare node
IDs in headings and edge triples in front matter, then `lint.mjs` /
`render.mjs`. Spec scenario IDs double as graph nodes. This is a pointer, not
a dependency: renders are ephemeral, never committed as a requirement, and
never CI-checked.

## Hooks (local workflow)

A repo may declare local workflow actions in the `hooks` object of
`sdlc.config.json`, so the global process stays identical everywhere while each
repo layers on its own ways of working. Hook phase keys are the six lifecycle
names — `brainstorm`, `plan`, `spec`, `build`, `implement`, `pr` — plus `*`
(every phase). This vocabulary is distinct from the four review-panel phases and
must not be conflated. Each phase key carries optional `before`/`after` arrays
of hook items; each item is exactly one of:

- `{ "run": "<command>" }` — a shell command the agent executes verbatim.
- `{ "use": "skill:<name>" | "tool:<name>", "do": "<intent>" }` — an
  instruction the agent interprets: `tool:<name>` invokes that tool with `do`
  as the intent (missing tool = hook failure); `skill:<name>` loads that skill
  and performs `do` per its instructions (missing skill = hook failure). The
  `do` text is the acceptance criterion.

**Ordering.** `before` hooks fire `*` items first, then phase-specific; `after`
hooks fire phase-specific first, then `*`. Within a list, array order.

**Failure.** A failed or skipped `before` hook **blocks** the phase (report,
then retry, ask, or move backward — do not enter the phase). A failed `after`
hook **warns**: recorded, never blocking.

**Working directory.** A `run` hook executes from the session's current working
root at fire time — the consumer root unless a hook or workflow has legitimately
moved it (e.g. a `before` hook entered a worktree; a worktree is a checkout of
the same repo, so repo-relative commands still resolve).

**Announce-on-fire (the audit trail).** Before executing any hook and after it
completes, emit exactly:

```
[sdlc hook] <phase>:<before|after> run$ <command>
[sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
[sdlc hook] <phase>:<before|after> result: ok
[sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
```

A transcript that enters a phase whose `before` hooks lack these lines is a
violation. Hooks are prose law executed by the agent — the same enforcement
model as the iron law; there is no mechanical runner.

**Trust boundary.** `run` hooks execute arbitrary shell commands with the
agent's privileges, from a committed file. They sit inside pi's existing
project-trust boundary: enabling hooks for a repo means trusting that repo's
config, exactly as you already must for `.pi/prompts` and project settings. The
agent always echoes the exact command before running it, and the scaffolder
warns whenever it writes a `run` hook.

**`workflow.md` (prose layer).** An optional `.pi/sdlc/workflow.md` carries
local ways-of-working that don't decompose into hooks (e.g. "no risky merges on
Fridays"). At announce, enumerate each top-level bullet (first line, truncated
to 80 chars). Conflict rule: *gates* — the Gate column of the phase table plus
the iron law's forward-skip prohibitions — always resolve to the global rule
(local rules may ADD gates, never remove or weaken those); *process* —
everything else — resolves to the local rule.

**Worktrees.** If your workflow uses worktrees: creating one is not enough — the
session's working root must move into it (create-then-enter). Writing to the
main checkout after creating a worktree is a red flag.

## Skills and tools are enhancements, not dependencies

Any skill or tool the agent reaches for opportunistically — a questions-helper
plugin, web research, codebase exploration, anything else named anywhere in
this document as a way to do a phase better — is an enhancement, never a
hard dependency a phase blocks on. When it's missing, degrade to the plain
fallback (inline structured prose for a missing questions tool, a direct
read/grep for missing research tooling) and say so, rather than stopping or
refusing to proceed. This mirrors the worktree-neutrality principle already
in this file: name no external tool as a shipped dependency of the skill
itself.

**This rule does not cover hooks.** A `hooks` entry a repo has explicitly
configured in `sdlc.config.json` is a deliberate, load-bearing contract, not
an opportunistic enhancement — its failure semantics are defined above
(before=block, after=warn) and stand as written. A missing `use:` tool/skill
on a configured hook is a hook failure, per Hooks, full stop.

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
- Skipping or silently reordering a configured phase hook.
- Writing to the main checkout after creating a worktree.
- Merging with a high or medium finding that survived adjudication.
- Dismissing a finding without a recorded reason, or incorporating one blindly.
- A spec outcome that no scenario can falsify.
- Committing generated per-model adversary files (they are git-ignored; the
  templates in `prompts/` are the source of truth).
- Editing a phase reviewer prompt in more than one place.
- Resolving more than one map ticket in a single session.
- A HITL ticket resolved by the agent answering its own questions.
- Bypassing the deterministic validation runner, running an undeclared command
  as a gate substitute, or editing a task's validation manifest mid-
  implementation without a Build correction and renewed approval.
- A stale whole-file validator prompt override claiming portable validation
  without adopting the PV1 manifest / PV2 runner contract.
- A build plan with two or more tasks that skips the epic/sub-issue/board
  publish step.
- Treating the tracker (map, epic, sub-issues, board) as the source of truth
  instead of the committed doc it projects.
