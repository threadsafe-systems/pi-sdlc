# Plan: brainstorm phase — companion persona, not mechanics-only

- Date: 2026-07-10
- Track: **reversible** (fast path). Prose/behavioural guidance in
  `skills/sdlc/SKILL.md`; no schema, CLI, or frozen-surface (FS1–FS7) change.
- Brainstorm: brief, conducted as live dialogue with the project owner
  (this thread); approved to proceed directly to plan.

## Objective

The Brainstorm section of SKILL.md is currently mechanics-only (track
selection, map-mode ticket plumbing, gates) with zero guidance on how the
dialogue itself should run. Add explicit behavioural guidance: the agent is
the author's thinking companion, not a sycophant — it actively rubber-ducks
the idea, raises genuine contradictions, uses its available research/codebase
tools when they'd sharpen the thinking, and presents multiple open questions
in a structured form when the environment provides a tool for that.

## Rationale

Brainstorming is creative work; a collaborator that only agrees isn't doing
the job. This is a documented design conversation (this thread) distilled
into concrete, checkable behavioural triggers — not personality adjectives,
which this project's own panels have already flagged as unfalsifiable
(`workflow.md` "binding local law" finding, spec review 2026-07-10).

## Scope

### In

- Restructure `## Brainstorm — map mode (wayfinder-lite)` into a parent
  `## Brainstorm` section (persona/behaviour, applies to both dialogue and
  map mode) with `### Map mode (wayfinder-lite)` as its child (mechanics,
  unchanged in substance).
- Persona guidance, as concrete triggers: raise-a-contradiction-or-say-none,
  proportional tool use (research/codebase exploration when it sharpens the
  idea, not mandatory ceremony), structured multi-question presentation with
  a named-but-optional tool example, and an explicit anti-directiveness rule
  (expand/pressure-test, never commandeer — the human stays gate-owner).
- **General graceful-fallback rule**: any skill/tool named anywhere in
  SKILL.md is an enhancement, never a hard dependency; missing it degrades to
  a stated plain-prose fallback, never blocks or stops the phase. State this
  once, generally, not just for brainstorm (mirrors the worktree-neutrality
  precedent already in this file: name no tool as a shipped dependency).

### Out

- No change to map-mode mechanics, HITL/AFK discipline, or tracker-ops.
- No `authors.brainstorm` delegation — brainstorm stays session-owned per the
  earlier design conversation (HITL map tickets need a real live exchange).
- No new tool/skill actually built (`questions-helper` is referenced as an
  example only, with graceful fallback — not a claimed dependency).

## Definition of done

- [ ] SKILL.md restructured: `## Brainstorm` parent + `### Map mode
      (wayfinder-lite)` child; no loss of existing map-mode content.
- [ ] Persona guidance present as concrete, checkable triggers (not vague
      adjectives): contradiction-or-none-found statement before the gate,
      proportional tool use, structured-questions-with-fallback, and the
      general graceful-fallback rule.
- [ ] `npm test` green (S2 loom-content grep must not trip on new prose; no
      other test references the restructured heading — confirmed pre-edit).
- [ ] PR opened, PR panel run to the stop condition (still required on the
      fast path per the iron law), consolidated and adjudicated.

## Context for the next agent

This is a direct implementation of a design conversation recorded in this
session's transcript; no separate spec is required (reversible track).
