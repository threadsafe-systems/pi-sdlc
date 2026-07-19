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
reveals an upstream gap.

## 7. After-hook order and warning semantics

Fire `hooks.build.after` (and `hooks."*"`) after the breakdown: phase-specific
first, then `*`. A failed `after` hook **warns** (recorded, never blocking).

## 8. Completion evidence and next transition

Completion evidence is the committed build-plan doc (and, above threshold, its
tracker projection). Next transition is **Implement** (`references/phase-implement.md`).

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
