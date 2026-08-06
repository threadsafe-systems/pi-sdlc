# Phase reference: Build / Tasks

> Detailed public contract for the Build phase. Its `#38` standalone-entrypoint
> surface is named `sdlc:tasks`; the internal phase name, the `*-build.md`
> artifact suffix, the `sdlc:build` hook key, and the `sdlc:build-task`/`sdlc:epic`
> tracker labels stay "build". `SKILL.md` owns the kernel and phase sequence; this
> reference owns Build's mechanics. Paths are skill-relative. Every
> configuration-dependent branch is an explicit **under your configuration**
> callout routed to the effective shape (current `.pi/sdlc/CONFIG.md`, or
> authoritative `sdlc.config.json` when absent/stale).

## 1. Purpose and invocation modes

Build decomposes the vetted Spec into a task breakdown: each task names its check
commands and the scenario ids it satisfies, pulled from the Spec, never
re-derived. It runs two ways:

- **Full lifecycle:** entered after an approved Spec (or the merged Plan+Spec
  artifact / reversible-track Plan).
- **Standalone entrypoint `sdlc:tasks`** (`templates/sdlc-tasks.md`): needs
  committed scenario ids upstream. With absent upstream it **always
  refuses-with-redirect** in both adoption states and **never fabricates scenario
  ids or check tables** (the counterfeit-artifact rule).

## 2. Entry conditions and authoritative upstream inputs

The authoritative upstream input is the committed Spec's falsifiable scenarios
(or, on the reversible track, the approved Plan's definition of done). Build
never invents scenario ids for absent upstream.

## 3. Configured before-hook order and blocking semantics

Fire `hooks.build.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".

## 4. Required activity and artifact/output shape

Produce the committed build-plan doc — the canonical task breakdown carrying
objectives, rationale, check commands, and scenario ids per task. Its home routes
to the configured `paths.plans` as `<date>-<feat>-build.md`. This doc stays the
authoritative record even when it is also projected to the tracker.

When a task's checks (projected into its PV1 manifest during Implement) include
`tests`-category commands, tag the **`scope`** role of the ones that carry a
role: `"full"` for the check that runs the broad regression net (genuinely the
whole relevant suite, not a task-narrowed selection) and `"task"` for the check
whose argv names this task's specific tests — so the manifest satisfies the
validator's **Rule A** (a required `tests` category needs a `"full"`-tagged
check) and **Rule B** (a scenario's `tests`-category evidence needs a
`"task"`-tagged check). One check that is both roles tags
`scope: ["full", "task"]`; a `tests` check that carries neither role needs no
tag. Degradations: a `tests: n/a` task is exempt from both rules, and a task
with no owned scenarios is exempt from Rule B (but still needs a `"full"` check
under Rule A). `scope` is data the existing Build human gate already reviews
(PR-panel review of the committed manifest), made machine-checkable — not a new
gate; the panel still judges whether a `"full"`-tagged check is genuinely the
broad suite. Full contract: `references/phase-implement.md` (PV1 manifest) and
`docs/specs/2026-07-12-sdlc-portable-validator.md` §11.

**Dialogue discipline.** Build expects **zero blocking questions**
(shared contract: `references/system-reference.md`,
"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
scenarios or the Plan's definition of done are incomplete — present it as a
proposed backward transition (§6). This is the counterfeit-artifact rule's
conversational twin: Build papers over an upstream hole with neither
fabricated ids nor questions. Mechanical decomposition choices — granularity,
ordering, blocking edges, a near-threshold publish call — are the agent's
derivation calls: state them inline as assumptions and proceed; the committed
build-plan doc is the reviewable record, and a gateless phase manufactures no
approval interaction. A question **parked to Implement attaches to the
build-plan doc entry of the task it affects** (projected into the sub-issue
body above threshold; the doc row is the source), so the claiming session sees
it at claim time. The build-plan doc also carries an **"Assumptions"
appendix** — the accrual home Implement appends discretionary calls to as
tasks complete (`references/phase-implement.md`).

**Spec gap log.** The build-plan doc carries a **Spec gap log**: one row per
upstream deficiency, whether found during decomposition or **carried inbound
from Spec** as a `CARRY-TO-BUILD`. Four columns, with exactly these values:

| Column | Contents |
|---|---|
| description | the deficiency, in one line |
| severity | `blocker` \| `minor` |
| disposition | `backward-transition` \| `assumption-recorded` \| `CARRY-TO-IMPLEMENT` |
| landing site | where that disposition discharges |

An empty log is written as an explicit "none", **never omitted** — an absent log
and a clean decomposition are otherwise indistinguishable. `assumption-recorded`
**routes the entry to the existing "Assumptions" appendix** above, rather than
opening a second ledger. The vocabulary is
`references/system-reference.md`, "Iteration & disposition".

> **Under your configuration:** the artifact home uses committed `paths.plans`;
> do not hardcode `docs/plans`.

## 5. Invariant gate/approval seam

Build has **no gate of its own** — it is derived from the vetted Spec. Its output
is validated downstream, per-task, during Implement.

> **Under your configuration:** whether the breakdown is also published to the
> tracker depends on `shape.publishToTracker` (see §9); the gate seam itself does
> not vary.

## 6. Refusal and backward-transition behaviour

Standalone `sdlc:tasks` refuses-with-redirect when its committed scenario/id
upstream is absent, in any adoption state, emitting no fabricated ids or check
tables. Backward transition to Spec/Plan is always allowed when decomposition
reveals an upstream gap. A class **(a)** amendment (§8) resolves here: it touches
a shape already frozen, merged, or bound to, so it is a backward transition to
the phase that owns that shape, whose gate re-runs.

## 7. After-hook order and warning semantics

Fire `hooks.build.after` (and `hooks."*"`) after the breakdown: phase-specific
first, then `*`. A failed `after` hook **warns** (recorded, never blocking).

## 8. Completion evidence and next transition

Completion evidence is the committed build-plan doc (and, above threshold, its
tracker projection), **plus a discharged carry ledger**: every `CARRY-TO-BUILD`
minted at Spec has landed in this build plan — in the spec gap log, in a task, or
in the Assumptions appendix — at the landing site its record names. Build has no
gate, so completion evidence is where the no-orphan rule of
`references/system-reference.md`, "Iteration & disposition", is checked here.
Next transition is **Implement** (`references/phase-implement.md`).

**Amending an approved breakdown.** Classify the change under the three
classes in `references/system-reference.md`, "Iteration & disposition"; that
glossary owns their definitions. Here, class **(a)** takes the backward
transition at §6; class **(b)** is amended in place in this breakdown, recording
the trigger, class, disposition and author, and renews approval when it touches
an already-approved task's checks or PV1 manifest; and class **(c)** starts a
normal fix wave. Build has no gate, so this phase's amendment question is
renewed task approval rather than a re-run gate.

> **Under your configuration:** a deficiency this phase cannot resolve, and that
> the next phase must, takes the disposition `CARRY-TO-IMPLEMENT` in the spec gap
> log, recorded with its landing site. Implement is the next phase in the
> *effective configured sequence*, so read that sequence from current
> `CONFIG.md` (or authoritative `sdlc.config.json`) rather than assuming it.

## 9. Advanced-mode pointers — tracker-backed Build (epic + sub-issues + board)

The committed build-plan doc stays the canonical task breakdown — objectives,
rationale, check commands, and scenario ids per task never live only in the
tracker. When that breakdown has at least the committed `shape.publishToTracker`
count of tasks, publish it as tracker objects too, so the work is visible and
resumable across sessions:

- One **epic issue** (label `<LABEL_PREFIX>:epic`), body linking the plan/spec/
  build-plan docs and restating the definition of done.
- One **native sub-issue per task** (label `<LABEL_PREFIX>:build-task`, wired via
  `addSubIssue`), body written to `assets/agent-brief.md`'s template: the task's
  check commands and the scenario ids it satisfies, pulled from the build plan,
  never re-derived.
- **Blocking edges** (`addBlockedBy`) only where a task genuinely can't start
  before another finishes — most tasks in a well-sliced build have none and stay
  simultaneously open.
- Every issue added to the shared board (one reusable, org-owned board, never one
  per epic — see `assets/tracker-ops.md`), moving `Todo → In Progress` on claim,
  `→ In Review` when its PR opens, `→ Done` on merge/close, `→ Blocked` on an
  external stall. The epic itself moves to `Done` only once every sub-issue is
  closed.

> **Under your configuration:** the publish threshold is the committed
> `shape.publishToTracker` count (the value is authoritative; `"never"` disables
> the publish step). A build below the threshold (or any build when it is
> `"never"`) stays a plain committed build-plan doc — the tracker overhead is not
> proportionate. A project without a `tracker` block cannot use this mode.

**Implement** then works the board's frontier one sub-issue at a time, same
discipline as working a map: claim before starting, close and update the board on
completion, and let a PR's `Closes #<sub-issue>` list do the bookkeeping. The
tracker is a **projection** of the committed docs, never the source of truth — if
they disagree, the doc wins and the tracker gets corrected, which is why the CI
presence-check keeps reading committed docs, not issues. All sub-issue/blocking
mutations and board mechanics are owned once by `assets/tracker-ops.md`.
