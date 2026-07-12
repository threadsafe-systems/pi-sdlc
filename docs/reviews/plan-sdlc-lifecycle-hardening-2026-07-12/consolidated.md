# Consolidated plan review — observable, complete lifecycle programme

- Target: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md` (working-tree gate artifact)
- Panel: `zai/glm-5.2:high`, `anthropic/claude-opus-4-8:high`,
  `moonshotai/kimi-k2.6:high` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI
- Per-model findings: `glm-5.2.md`, `claude-opus-4-8.md`, `kimi-k2.6.md`

## High

### H1 — Programme scope exceeded one Specification

All three reviewers found that the plan combined several independent frozen
surfaces and products into one Plan → Spec → Build cycle.

**Adjudication: incorporated.** The artifact is now explicitly a programme plan
that never proceeds directly to one Specification or Build. It defines five
ordered child changes, each with its own full irreversible lifecycle and owned
outcome subset: adoption/contracts, authoring/traceability,
validation/lifecycle-state, model governance, and tracker coherence.

### H2 — Tracker board was an external, unowned blocking prerequisite

Two reviewers rated this high and the third medium. The DoD required a dedicated
board although none exists and no phase or owner created it.

**Adjudication: incorporated.** Board creation and read-back verification are
now an explicit in-scope prerequisite owned by the orchestrating agent at the
start of the first child Build. Failure blocks and escalates. Build still decides
implementation tickets only after its Specification is approved.

## Medium

### M1 — Durable state contradicted ADR 0011's transcript-only decision

**Adjudication: incorporated.** The programme explicitly re-opens ADR 0011 and
names a new versioned lifecycle-run receipt surface under `.pi/sdlc/runs/`.
Child 3 must amend/supersede the ADR and pin the exact schema and git policy.
The receipt is described honestly as agent-emitted evidence, not independent
proof or a mechanical hook runner.

### M2 — Panel invariants and author-preference schema home were undecided

**Adjudication: incorporated.** Plan/Spec/PR panels now have a fixed global floor
of two distinct reviewer vendors and mandatory author-vendor exclusion. Task
validation remains one mechanistic validator. Author preferences live in a new
versioned surface rather than extending FS2's exactly-four review phases.

### M3 — `author_default` risked a silent FS2 behaviour change

**Adjudication: incorporated.** `author_default` retains its current
vendor-exclusion fallback semantics and is documented, not repurposed for author
dispatch. Existing v1 fixtures must remain valid or cross an explicit tested
major migration.

### M4 — Documentation honesty lacked a direct DoD

**Adjudication: incorporated.** The DoD now requires automated checks that fail
when prose claims mandatory CI, templates, tracker facilities, panel inputs, or
commands that are neither shipped nor readiness-verified.

### M5 — Non-TypeScript fixture strategy was unnamed

**Adjudication: incorporated.** Child 3 owns offline TypeScript and
non-TypeScript fixtures; walkthroughs are explicitly fixture-based with no
network or model calls. Exact fixture construction remains a Build decision.

### M6 — Broken `CONTRIBUTORS.md` reference was omitted

**Adjudication: incorporated.** The programme decomposition, scope, and DoD now
explicitly include the erroneous `CONTRIBUTORS.md` versus `CONTRIBUTING.md`
reference.

### M7 — FS2 compatibility lacked a migration guard

**Adjudication: incorporated.** The DoD now requires unchanged v1 fixtures to
remain valid, or an approved schema-major migration with tested guidance.

## Low

### L1 — End-to-end walkthroughs versus no paid calls

**Adjudication: incorporated.** Walkthroughs are now explicitly offline fixture
simulations proving contract completeness through PR-ready state.

## Stop condition

No high or medium finding survives adjudication in the revised programme plan.
The next gate is human review of the programme decomposition and fixed decisions.
No child Specification, Build, tracker ticket, or implementation work begins
before that approval.
