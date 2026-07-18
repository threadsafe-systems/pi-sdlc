# Phase reference: Plan

> Detailed public contract for the Plan phase. `SKILL.md` owns the kernel,
> readiness gate, and phase sequence; this reference owns Plan's mechanics. Paths
> are skill-relative. Every configuration-dependent branch is an explicit **under
> your configuration** callout routed to the effective shape (current
> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the companion is
> absent or stale) — never a silently assumed track, gate mode, or panel floor.

## 1. Purpose and invocation modes

Plan fixes the objectives, rationale, scope, definition of done, and context for
the next agent. It runs two ways:

- **Full lifecycle:** entered after an agreed Brainstorm design.
- **Standalone entrypoint `sdlc:plan`** (`templates/sdlc-plan.md`): needs no
  committed upstream; unadopted it runs and forms intent live, adopted it runs as
  the configured gate.

## 2. Entry conditions and authoritative upstream inputs

The authoritative upstream input is the agreed Brainstorm design (or, standalone,
the intent formed live). No committed artifact is required to begin.

## 3. Configured before-hook order and blocking semantics

Fire `hooks.plan.before` (and `hooks."*"`) first: `*` items first, then
phase-specific; array order within a list. A failed or skipped `before` hook
**blocks** the phase. Full contract in `references/system-reference.md`, "Hooks".

> **Under your configuration:** the plan hooks that fire are exactly those
> declared in `sdlc.config.json`; assume none by default.

## 4. Required activity and artifact/output shape

Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
and context for the next agent**. Its home routes to the configured
`paths.plans`.

> **Under your configuration:** the artifact home is `<paths.plans>/<date>-<feat>.md`
> using the committed `paths.plans` value — do not hardcode `docs/plans`.

## 5. Invariant gate/approval seam

The invariant seam is a **design gate plus human approval**. The design gate is
`review.design`; on the irreversible track a plan panel runs before approval.

> **Under your configuration:** `review.design` is one of `panel` | `advisory` |
> `human` | `off`, and per-track `overrides.{irreversible,reversible}` may adjust
> it. On the **reversible** track there is no pre-PR design panel (the PR panel
> still runs); on the **irreversible** track the plan panel runs. Read the
> effective track and `review.design` from current `CONFIG.md` (or authoritative
> `sdlc.config.json`) — never assume `panel`, and never assume the track. When
> `shape.separateSpec: false`, Plan and Spec merge into one gated artifact.

When a panel runs, it follows the shared panel run-shape (resolve → dispatch →
consolidate → adjudicate → stop) owned by `references/phase-pr-review.md`,
"Panels". The reviewer prompt is `prompts/adversary-plan.prompt.md` via the
`plan_review` phase; never hand-copy a prompt per model.

## 6. Refusal and backward-transition behaviour

Plan does not refuse on upstream grounds. Backward transition to Brainstorm is
always allowed when planning reveals the design is unsound.

## 7. After-hook order and warning semantics

Fire `hooks.plan.after` (and `hooks."*"`) after the gate: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).

## 8. Completion evidence and next transition

Completion evidence is the committed Plan doc plus, on the irreversible track,
the consolidated plan-panel artifact under the configured reviews home and human
approval. Next transition is **Specification** (or **Build/Tasks** directly when
`shape.separateSpec: false` merges them, or on the reversible track where Spec is
not required).

> **Under your configuration:** whether a separate Spec follows is set by
> `shape.separateSpec` and the effective track; read it rather than assuming a
> Spec is always next.

## 9. Advanced-mode pointers

None specific to Plan. Oversized/foggy efforts are handled upstream by Brainstorm
map mode (`references/phase-brainstorm.md`).
