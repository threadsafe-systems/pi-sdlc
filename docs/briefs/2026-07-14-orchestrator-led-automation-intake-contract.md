# Brief: orchestrator-led automation and the intake contract

Status: conjecture / future feature investigation. Not a plan, not a spec —
a map-mode destination to work toward when we're ready to pick it up.

## Reference

Addy Osmani, "Agentic Autonomy Levels"
(<https://addyo.substack.com/p/agentic-autonomy-levels>, 2026-07-03).

Splits autonomy into two axes — **agency** (how far one agent roams: suggest
→ scoped task → goal-chasing) and **orchestration** (how many agents: one
thread → isolated worktrees → a manager agent turning a queue into continuous
work, "management by exception") — collapsed into six levels (0 Assist … 5
Managed-by-exception orchestration). Core claims we're building on:

- The autonomy level should follow the *verification*, not the task name.
- Every unattended run needs a contract up front: goal, scope, non-goals,
  tools/permissions, stopping condition, evidence, escalation, budget.
- Three questions decide whether autonomy is defensible: how quickly will we
  know we're wrong, how cleanly can we undo it, what proves we're right.
- Four anti-patterns to guard against: autonomy as status, permission
  laundering, summary substitution, fleet cosplay.
- Risk and reversibility set the ceiling on how high a task should run.

## How pi-sdlc maps onto it today

pi-sdlc is not itself a level — it's the "operating system" the article says
Level 5 needs but leaves undefined: a verification-and-governance harness
that makes higher autonomy defensible, deliberately capped by human approval
gates at each phase transition. Concretely: implementer runs are Level 2
(scoped task, evidence-emitting), test-first-against-falsifiable-scenarios
edges toward Level 3, design/PR panels are Level 4 (independent models,
isolated worktrees, consolidated), and map mode / tracker-backed build (epic
- sub-issues + frontier) are the Level 5 substrate — a queue, a frontier, and
board state — minus the autonomous manager agent that would dispatch off it
without a human.

The contract fields the article prescribes already exist, just spread across
phases: goal/scope/non-goals → Plan; stopping condition → Spec's falsifiable
scenarios; evidence → per-task check commands + `check-lifecycle`; risk
ceiling → the reversible/irreversible track law.

## The observation motivating this brief

Empirically, spec and build-plan artifacts rarely need human amendment once
a plan is approved — agents are reliable at *translating* agreed judgment
into contracts, scenarios, and tasks. What's scarce is *judgment*: why this,
why now, what's out, what trade-off was accepted. That content currently
lives in Brainstorm + Plan, both human-gated. Spec + Build are translation,
and translation is where the reliability already shows up.

**Conjecture:** if judgment is captured with enough precision at task
*intake* — before Plan even starts — the translation phases (Plan → Spec →
Build → Implement) could run unattended, with the PR panel remaining as the
non-negotiable independent verification backstop. This doesn't remove the
human gates the article insists on; it compresses them into one artifact at
the front. Writing the intake ticket well *is* the approval.

## Conjectured intake conditions

For an orchestrator to run a ticket through Plan → Spec → Build → Implement
unattended, the ticket needs to let it answer the article's three questions
before starting. Two adjudication tiers:

**Mechanically checkable (lint, exit 0/1):**

1. **Falsifiable outcome** — at least one done-condition that fails today and
   would pass after; derivable into a spec scenario verbatim. Filters wooly
   goals by construction: if no failing check can be derived from the ticket
   alone, it fails lint.
2. **Track declared** — reversible/irreversible, up front. Irreversible
   tickets route to the existing human-gated lifecycle, not the unattended
   path — risk and reversibility set the ceiling on which lane a ticket
   enters, not just how it's built once it's in one.
3. **Anchors resolve** — 1–3 pointers into the repo (files, ADRs, prior PRs)
   that actually exist (`test -e` per anchor). Kills context-free tickets by
   construction.
4. **Budget + escalation named** — attempt cap, token/time ceiling, who gets
   paged on exception; may default from a repo-level policy file as long as
   it binds to something concrete.

**Panel-adjudicated (adversarial fan-out, retargeted at intake sufficiency
rather than design quality):**

1. **Scope closure** — non-goals explicit enough the panel can't name a
   plausible implementation a reasonable engineer would dispute is in scope.
2. **Decision residue** — the brainstorm's output distilled: decisions made,
   options rejected and why. Without this, agents re-litigate settled
   questions mid-flight — the likely #1 cause of drift in an unattended run.
3. **No unpriced unknowns** — the panel names any question the implementer
   would be forced to *decide* rather than *derive*. One such question =
   reject, with the question attached.

Rejection returns the *specific* condition and question, not "insufficient" —
the rejection message doubles as the completion prompt, so a sparse-ticket
human gets one concrete question at a time instead of a lecture on process.

## Sketch template (fits one screen)

```markdown
## Outcome        (one sentence, observable state of the world)
## Done means     (≥1 check that fails today: command/scenario + expected)
## Track          reversible | irreversible → human lane
## Anchors        1–3 paths/ADRs/PRs, with one clause each on why
## Non-goals      what a keen agent must NOT expand into
## Decided        choices already made; roads not taken, and why
## Budget         attempts / tokens / escalate-to
```

Assumes brainstorming already happened among humans (or an already-resolved
map) — this is the bones-to-meat step, not a replacement for brainstorm.

## Two mechanisms worth keeping if we build this

- **Graduation, not a global switch.** Let ticket *classes* earn the
  unattended lane after N tickets pass with zero spec/build amendments; one
  amendment demotes the class. Makes "rise only as evidence accumulates"
  (the article's prescription) mechanical instead of a one-time policy call.
- **The intake gate is itself falsifiable.** Track intervention/rework rate
  per intake condition. If fully-passing tickets still get interrupted, a
  condition is missing; if a condition never correlates with downstream
  failure, it's too strict. The rubric becomes a living spec with its own
  scenarios, same as everything else in this repo.

## Open questions for whoever picks this up

- Where does the intake lint/panel live mechanically — a new pre-Brainstorm
  phase, or a mode of Brainstorm itself (map mode already has HITL/AFK
  ticket typing that's close to this shape)?
- Does the PR panel need a new failure class for "unattended run drifted from
  intake contract," distinct from a normal design/implementation finding?
- What's the smallest ticket class to pilot graduation on, given this repo's
  own history (candidates: docs-only changes, single-file lint-rule
  additions)?
- How does budget/escalation actually bind in this repo's tooling today (pi
  subagent toolBudget/turnBudget) vs. what the article assumes?

This brief is intentionally not a Plan — no scope-in/out decision has been
made about *whether* to build this, only that it's worth investigating. The
map ticket tracks that investigation.
