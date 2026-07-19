# Phase reference: Implement

> Detailed public contract for the Implement phase. `SKILL.md` owns the kernel
> and phase sequence; this reference owns Implement's mechanics, including the
> per-task validator. Paths are skill-relative. Every configuration-dependent
> branch is an explicit **under your configuration** callout routed to the
> effective shape (current `.pi/sdlc/CONFIG.md`, or authoritative
> `sdlc.config.json` when absent/stale).

## 1. Purpose and invocation modes

Implement turns the vetted Build breakdown into code and tests on the feature
branch. It runs two ways:

- **Full lifecycle:** entered after an approved Build breakdown.
- **Standalone entrypoint `sdlc:implement`** (`templates/sdlc-implement.md`):
  needs committed tasks/build with named checks. With absent upstream it
  **always refuses-with-redirect** in both adoption states and **never fabricates
  check tables**.

The implementer writes real tests **test-first** (watch them fail, then
implement) and treats the spec scenarios as the **floor, not the ceiling**.

## 2. Entry conditions and authoritative upstream inputs

The authoritative upstream input is the committed build-plan doc (and its tracker
projection above threshold): each task's check commands and the scenario ids it
satisfies. Work the board's frontier one sub-issue at a time when tracker-backed;
claim before starting.

## 3. Configured before-hook order and blocking semantics

Fire `hooks.implement.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. A common
`implement.before` hook creates **and enters** a worktree — the session's working
root must move into it (create-then-enter); writing to the main checkout after
creating a worktree is a red flag. Full hook contract, working-directory rule,
and announce-on-fire audit trail in `references/system-reference.md`, "Hooks".

> **Under your configuration:** the implement hooks that fire are exactly those
> declared in `sdlc.config.json`; do not assume a worktree hook exists.

## 4. Required activity and artifact/output shape

Produce code and tests on the feature branch (worktree or checkout per the
project's hooks/workflow). Each task's checks are whatever its approved Build task
declared.

**Dialogue discipline.** Implement lowers the interrupt surface of the shared
contract (`references/system-reference.md`,
"Presenting questions to the human") to near zero:

- **Mid-task interrupts are reserved for external blockers only** — missing
  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
  cases where proceeding is impossible and no repository reading helps.
- Everything else batches to the **task boundary** (the validator seam) under
  the uniform cap. Expected steady state is near zero: an upstream flaw is a
  backward transition (§6), and a discretionary implementation choice the
  upstream deliberately left open is the agent's call, recorded as an
  assumption — asking the human to make it is ceremony, not care.
- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
  tasks complete (plus the task's close comment when tracker-backed) and are
  copied into the PR body's **"Assumptions & discretionary calls"** section at
  PR preparation, where the panel reads them as review input
  (`references/phase-pr-review.md`).

## 5. Invariant gate/approval seam — the per-task validator

The invariant seam is per-task validation selected by `review.tasks`:

- `subagent` (default): each task ends with one **validator subagent**, a
  checklist executor, not a judge.
- `self`: the implementer runs the same declared checks directly (no subagent
  dispatch; `resolve-panel task_validate` refuses).
- `off`: per-task validation is skipped entirely — no manifest, runner, receipt,
  or PASS gate is required.

> **Under your configuration:** read the effective `review.tasks` value from
> current `CONFIG.md` (or authoritative `sdlc.config.json`); never assume
> `subagent`. Per-track `overrides` may adjust it.

Validation is **portable and deterministic**: the task's checks are whatever its
approved Build task declared, never a language or tool the skill imposes. There
is no unconditional `npx tsc --noEmit` and no assumed `CONTRIBUTORS` file — a
TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
linter, another repo declares its own tools.

Under `subagent` or `self`, every task carries a committed **PV1 validation manifest**
(`<repository validation home>/<feature>/<task-id>.json`, schema
`schema/task-validation-manifest.schema.json`) projected from its canonical Build
task. It names, as exact argv arrays, the task's checks across five categories —
`tests`, `static`, `scenarios`, `standards`, `bannedPatterns` — each `required`
or `n/a` with a Build-approved reason, plus the mapping from each owned
Specification scenario to the required checks that evidence it.

The **deterministic runner** (`scripts/validate-task.sh` → `validate-task.mjs`,
surface PV2) — not the model — validates the manifest, executes only its declared
argv with no shell, evaluates categories and scenarios, bounds and redacts command
evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or `ERROR` (exit 2).
Build, not the validator, owns which commands run and which categories are `n/a`;
the validator cannot invent a command, weaken a check, or decide applicability.
Under `subagent`, the validator subagent (`prompts/validator-task.prompt.md`) runs
the runner, confirms exit and report verdict agree, and reports each result; under
`self` the implementer runs the runner directly. A nonzero runner result blocks
task completion; a task is not done until the runner returns PASS. Each task stores
a runtime receipt (manifest copy, runner report, hashes, verdicts, plus the
generated-agent copy and model under `subagent`) under
`docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verifiable with
`scripts/verify-task-receipt.mjs`. Judgement review happens later at the PR panel.

> **Under your configuration:** the task-validator model preference is
> `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5` — a `:low` (or
> `:off`) thinking suffix fits this checklist-executor role. The effective roster
> resolves from the committed `panels` block via `resolve-panel task_validate`.

## 6. Refusal and backward-transition behaviour

Standalone `sdlc:implement` refuses-with-redirect when its committed
tasks/build upstream is absent. A failing validator blocks the task, not the
whole lifecycle. Backward transition to Build/Spec is always allowed when
implementation reveals an upstream flaw.

## 7. After-hook order and warning semantics

Fire `hooks.implement.after` (and `hooks."*"`) after each unit of work:
phase-specific first, then `*`. A failed `after` hook **warns** (recorded, never
blocking).

## 8. Completion evidence and next transition

Completion evidence is passing tests, per-task PASS receipts (under `subagent`/
`self`), and closed sub-issues (tracker-backed). Next transition is **PR review**
(`references/phase-pr-review.md`).

## 9. Advanced-mode pointers

Tracker-backed frontier work is described in `references/phase-tasks.md`, "§9".

## 10. Dispatching implementation workers

When Implement delegates a task to a subagent rather than building in the
surface directly, give it the same shape every time:

- **Scope, stated as a stop-condition.** Name exactly the task's check
  commands and Definition-of-Done items as the boundary of its work, and say
  plainly not to explore or fix adjacent things past that boundary.
- **A `toolBudget`/`turnBudget` by default.** Attach a bounded budget (the
  `subagent` tool's own `toolBudget: { soft, hard }` / `turnBudget: {
  maxTurns, graceTurns }` parameters) so a worker drifting past scope is
  nudged, then finalized, without a human having to notice and intervene.
- **A canonical "finalize now" resume message** for a worker caught
  exploring past scope: "You were exploring past this task's stated scope.
  Stop investigating and finalize your current change against the stated
  check commands now." Reuse this wording rather than improvising a new one
  each time.
- **Workers never triage for themselves.** A dispatched worker's blocking
  question returns to the dispatching implementer — its stop-condition and
  budget shape already imply this — and the implementer applies the shared
  contract's triage tiers. One channel to the human, never one per worker.
- **Infra failure gets one automatic retry; no verdict does.** If a
  dispatched worker's run ends in an **infra-class failure** — a process
  crash, an out-of-memory kill, overload or billing exhaustion, a provider
  timeout, a transport/tool error, or empty output — that is infrastructure
  noise, not a REVISE/FAIL verdict from the model. Retry that exact dispatch once, automatically, before treating it as
  needing human attention. A second consecutive infra failure on the same
  dispatch, or any model-authored verdict, surfaces to the human as normal —
  never silently retried away.

