---
name: sdlc
description: The enforced software development lifecycle. Use at the start of any feature or change. Sequences brainstorm, plan, spec, build, implement, and PR review, enforces the per-phase gates, and routes each phase to its reference. This is the project law, not a suggestion.
---

# sdlc

The one predictable way a change enters the codebase. This file is the **kernel
and router**: the small interface every lifecycle session must learn. Detailed
per-phase mechanics live in `references/phase-*.md`, loaded when that phase
begins; the whole public system map is `references/system-reference.md`. All
paths are skill-relative.

## Readiness gate and announcement (run first)

The sdlc is a framework a repo *adopts*, not a global default. A repo has
**adopted** it when its current `HEAD` commit contains
`.pi/sdlc/sdlc.config.json`; a manifest merely present on disk (untracked,
staged, or ignored) is not adoption. Being **ready** needs more: the manifest
clean and valid, its merged `panels` roster present and valid, any
`.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8, ADR 0016) proves this
mechanically with four states.

At the start of every session, run the mechanical gate and branch on its exit
code (prefer `--format json` when parsing):

1. In pi, run `scripts/sdlc-status.sh [--repo-root DIR] [--format text|json]`
   relative to this loaded skill (headless: `node <skill-dir>/scripts/sdlc-status.mjs`),
   with cwd inside the consumer repo or pass `--repo-root`.
2. **Exit 0 (`ready`)**: emit the `run.started` telemetry event (FS13, see the
   telemetry directive below), announce with the config's `announce` string, then
   enumerate each configured hook (phase, timing, kind) and each top-level rule of
   `.pi/sdlc/workflow.md` if present, then run the startup freshness check below.
   Proceed under full law.
3. **Exit 1 (`not-adopted`)**: do NOT announce. State the repo has not adopted the
   sdlc and offer `/setup-sdlc` to opt in, or advisory mode for this session only
   with the user's explicit in-session consent.
4. **Exit 2 (`error`)**: do NOT announce. Surface the report's diagnostics and
   stop. An error is never silently downgraded to advisory mode — advisory is not
   a bypass.
5. **Exit 3 (`not-ready`)**: do NOT announce. State the repo is adopted but
   incomplete, list the report's remediations, and stop. When
   `config.schema-current` is failing, the sanctioned actions are to pin the older
   skill release, or re-run `setup-sdlc` (`--force` to replace) —
   there is no pre-adoption config fold-forward.
   Never hand-edit `schemaVersion` or the config shape.
   Do not offer advisory mode as a bypass.

Before `sdlc-status` exits 0 the agent MUST NOT enter any lifecycle phase, MUST
NOT fire configured hooks, MUST NOT stamp panel agents, MUST NOT create or mutate
tracker objects, and MUST NOT claim any gate as passed. This startup table is
agent-executed prose law (ADR 0011): the script proves repository state; it does
not claim to enforce agent behaviour. Advisory-mode behaviour is documented in
`references/system-reference.md`, "Adoption & readiness".

## The iron law (two tracks)

The law fixes what may not be skipped **forward**. Backward moves (returning to
an earlier phase when a later one exposes a flaw) are always allowed and never
penalised: the sunk cost of an earlier gate never justifies shipping a
known-wrong design.

A change is **irreversible** if it freezes a shape other code, data, or
extensions bind to: public interfaces, contracts, persisted schemas, wire
formats, stored-record shapes — anything a consumer or stored record commits to.
Everything else is **reversible** (internal refactors, docs, tests, tooling).
When in doubt, use the repo's committed `shape.defaultTrack` (default
`irreversible`).

| Track | Phases required | Design panels |
|---|---|---|
| Irreversible | brainstorm, plan, spec, build, implement, PR | plan panel AND spec panel |
| Reversible (fast path) | brainstorm (may be brief), plan, build, implement, PR | none pre-PR; the PR panel still runs |

Every PR declares its track in the template's `sdlc` declaration block;
`check-lifecycle` verifies the declared track's artifacts are committed. Declared
values are `irreversible`, `reversible`, or `none`; tracks need a slug, `none`
needs a reason; `[bot]` PRs without a valid declaration are exempt; a valid
declaration dominates. Full PR-declaration and checker mechanics:
`references/phase-pr-review.md`.

## Effective-shape reading protocol

The table above states the **maximal** shape. Which gates actually run, and at
what strength, is the repo's committed config: `review.design`
(`panel` | `advisory` | `human` | `off`) gates plan+spec, `review.code` gates the
PR, `review.tasks` (`subagent` | `self` | `off`) sets per-task validation,
`review.brainstorm` (`human` | `off`) sets the brainstorm gate; per-track
`overrides` (`irreversible`/`reversible`) adjust `design`/`code`/`tasks`/
`panelSize`. `shape.separateSpec: false` merges Plan and Spec into one gated
artifact.

`sdlc.config.json` is **authoritative** for values; the generated
`.pi/sdlc/CONFIG.md` **explains** them and never overrides them. Read the config
for values, and `CONFIG.md` for meaning.

**Startup freshness check** (after ready + hook/workflow inventory, outside FS8
readiness and FS9 lifecycle completion): invoke
`scripts/config-doc.sh check [--repo-root DIR] [--format json]` and branch:

- **`current`** → read `.pi/sdlc/CONFIG.md` as the consumer-shape explanation.
- **`missing` or `stale`** → emit the fixed warning
  `[sdlc] CONFIG.md is <state>; reading sdlc.config.json as authoritative — regenerate with scripts/config-doc.sh write`,
  read authoritative `sdlc.config.json`, and continue under its values.
- **`error`** → branch on `reason`: `collision` (an unrecognized consumer file;
  the config itself is valid) uses the same fixed warning + JSON-fallback path;
  `invalid-config` cannot occur here because FS8 readiness already guarantees a
  valid config — if it ever surfaces, surface the diagnostic and stop rather than
  inventing a fallback.
- Never treat generated prose as authority over JSON.

`CONFIG.md` is never part of readiness, lifecycle completion, or mandatory CI. No
readiness state, FS8 check id/exit, or FS9 lifecycle-check id changes.

## Authority map (which artifact answers which question)

| Question | Canonical answer |
|---|---|
| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
| What global law and sequence apply? | `SKILL.md` kernel/router |
| What does this phase require? | The corresponding `references/phase-*.md` |
| What values has this repository chosen? | `sdlc.config.json` |
| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
| What implementation realizes a surface? | Source, only when implementation work requires it |

## Phases and the phase-reference loading rule

The lifecycle sequence, and where each phase's **detailed contract** is loaded
from when that phase begins:

| Phase | Artifact | Home | Detailed contract |
|---|---|---|---|
| Brainstorm | agreed design (or a map issue) | none | `references/phase-brainstorm.md` |
| Plan | objectives, rationale, scope, DoD, next-agent context | `<paths.plans>/<date>-<feat>.md` | `references/phase-plan.md` |
| Spec | contracts, interfaces, surface area, falsifiable scenarios | `<paths.specs>/<date>-<feat>.md` | `references/phase-spec.md` |
| Build | task breakdown with checks + scenario ids | `<paths.plans>/<date>-<feat>-build.md` | `references/phase-tasks.md` |
| Implement | code and tests | the feature branch | `references/phase-implement.md` |
| PR | the diff | GitHub | `references/phase-pr-review.md` |

Each phase's detailed entry conditions, hooks, gate seam, refusal, after-hooks,
completion evidence, and standalone `sdlc:<slug>` entrypoint behaviour live in its
phase reference — load it when the phase begins, do not reconstruct it here. The
shared panel run-shape (resolve → dispatch → consolidate → adjudicate → stop) is
owned by `references/phase-pr-review.md`; the tracker-backed Build (epic +
sub-issues + board) and Brainstorm map mode are advanced modes documented in their
phase references and `assets/tracker-ops.md`. Standalone entrypoints are the
package-owned `templates/sdlc-<slug>.md` prompts — one lifecycle skill's shared
named surfaces, not six discovered skills.

Instrumented runs emit **lifecycle telemetry** (FS13): at run start (before
announcing), on each phase entry, at every human gate approval, and at each
panel dispatch (with harvest-at-dispatch), emit the matching `record-run-event`
event and harvest panels — **load and follow** `references/system-reference.md`
("Lifecycle telemetry") for the event map. PR/epic **completion is
machine-checked** (`check-completion.mjs`), not narrated — see
`references/phase-pr-review.md` (completion evidence) and
`references/system-reference.md` ("Stall detection and self-resume"). Implement
worker-dispatch discipline (stop-conditions, `toolBudget`/`turnBudget`,
infra-retry-once) is in `references/phase-implement.md`.

## Gate/process conflict rule

For `.pi/sdlc/workflow.md` and any local rule: *gates* — each phase's invariant
gate seam (defined in its `references/phase-*.md`) plus the iron law's
forward-skip prohibitions — always resolve to the global rule
(local rules may ADD gates, never remove or weaken them); *process* —
everything else — resolves to the local rule. Hooks a repo has configured are
load-bearing contracts (before=block, after=warn), not optional enhancements; see
`references/system-reference.md`, "Hooks".

## Delegation (do not reimplement)

- `adversarial-review` (global): generic reviewer template mechanics; sdlc keeps
  its own phase-specific prompts, so use `scripts/ensure-panel-agent.sh`.
- `dispatch-subagents` (global): detached fan-out, model discovery, the
  0-byte-log rule, monitoring.
- `gh-pr-review-comments` (global): atomic inline posting and thread replies.
- `assets/tracker-ops.md` (project-local): GitHub sub-issue/blocking mutations and
  board mechanics shared by map mode and tracker-backed build.
- `assets/agent-brief.md` (project-local): durability rules and template for any
  ticket, sub-issue, or hand-written follow-up issue body.

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
- Bypassing the deterministic validation runner, running an undeclared command as
  a gate substitute, or editing a task's validation manifest mid-implementation
  without a Build correction and renewed approval.
- A stale whole-file validator prompt override claiming portable validation
  without adopting the PV1 manifest / PV2 runner contract.
- A build plan meeting the committed `shape.publishToTracker` threshold that skips
  the epic/sub-issue/board publish step.
- Treating the tracker (map, epic, sub-issues, board) as the source of truth
  instead of the committed doc it projects.
- Treating generated `CONFIG.md` prose as authority over `sdlc.config.json`.
- Claiming a phase, PR, or tracked effort "complete"/"PASS" without running the
  matching `check-completion.mjs` claim and it passing (a false summit).
