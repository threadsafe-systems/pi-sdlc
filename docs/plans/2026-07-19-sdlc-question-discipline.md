# Plan: Question-presentation discipline across SDLC phase prompts

- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate, 2026-07-19)
- **Status:** rev1, approved (human gate per `overrides.reversible.review.design: human`)

## Objectives

1. Establish **one shared question-presentation contract** — owned once in
   `references/system-reference.md` — governing how any lifecycle phase asks the
   human for input: single end-of-reply numbered block, one question per item,
   enumerated alternatives, explicit reasoned recommendations, a uniform soft cap
   of 3–5 blocking questions per turn, and three triage tiers (Blocking /
   Assumption / Parked).
2. Give each of the six phase references a **phase-shaped delta** layered on that
   contract, so clarification behaviour matches each phase's character
   (divergent brainstorm → convergent plan → falsifiable spec → gateless build →
   interrupt-minimal implement → pre-adjudicated PR escalations).
3. **Remove the unactionable tool framing**: the current brainstorm bullet tells
   the agent to use "a tool for that (e.g. a questions-helper plugin)" — but
   `pi-questions-helper` is a user-side slash command, not an agent tool. The
   contract defines a structured format that interactive helpers can extract
   well, without naming or depending on any tool.
4. End **question bombardment**: overflow beyond the cap demotes to assumption or
   parked tiers — never a longer block — and repo-discoverable facts are never
   asked at all.

## Rationale

- The brainstorm reference's question-tool bullet is unactionable as written
  (the referenced plugin is human-invoked; the agent has no such tool), so
  agents silently degrade to unstructured question walls.
- Brainstorm is the **only** phase with any question-presentation guidance;
  plan/spec/tasks/implement/pr-review have none, yet plan/spec negotiation and
  PR-panel adjudication are where the human is bombarded hardest.
- The design was agreed in a full brainstorm dialogue (2026-07-19, this
  session) covering the shared contract plus all six phase deltas; every open
  question below was resolved by the human owner during that dialogue.

## Agreed design (carried from Brainstorm)

### Shared contract (new top-level section in `system-reference.md`)

- Single numbered question block, last thing in the reply; never scattered.
- One distinct question per item; one question per sentence; context line only
  when the bare question is ambiguous.
- Alternatives as a numbered list when they exist; never fabricated (no
  invented yes/no framing of genuinely open questions).
- At most one **Recommended — because <reason>** per question; never a
  recommendation without a reason; never fabricated when genuinely neutral.
- **Soft cap: 3–5 blocking questions per turn, uniform across phases.** Phase
  deltas may only lower it. Overflow **demotes** (to assumption or parked),
  never lengthens the block.
- **Triage tiers** — every candidate question lands in exactly one:
  - **Blocking**: asked now, in the block.
  - **Assumption**: not asked; stated explicitly ("Proceeding on the assumption
    that X — object now if wrong").
  - **Parked**: one line + destination phase, carried in the phase handover.
- **Never ask the human a fact the repo can answer** — legitimate questions are
  about intent; a question about what the code does means the reading was
  skipped. (Universal rule; Spec adds the `file:line` emphasis.)
- The section is tool-agnostic. The existing §6 "Skills and tools are
  enhancements" example language ("a questions-helper plugin", "a missing
  questions tool") is neutralised to match.
- §11 next-read routing table gains a row for the new section.

### Per-phase deltas

| Phase | Delta |
|---|---|
| Brainstorm | Replace the broken §1 bullet with a pointer to the shared contract. Recommendations must widen the option space, not steer it (free on mechanical questions, sparing on design direction). Map mode: a parked question **is** fog — it lands in "Not yet specified"; sharp parked questions become tickets. No assumption ledger (artifact-free phase; the Plan restates surviving assumptions). |
| Plan | Questions must close a decision blocking a specific Plan-doc section. A question that would reopen the agreed design is presented as a **proposed backward transition** to Brainstorm, never smuggled into the block. Recommendations expected (their absence signals an un-agreed design). **Draft-first**: present the drafted doc with the block alongside; ask-first only when no credible draft is possible. Assumption tier → written into the doc (gate approval ratifies); Parked tier → the doc's "context for the next agent" section. Scope-boundary questions always carry enumerated alternatives. |
| Spec | Inherits draft-first and tiers-map-onto-artifact. **Behavioural/edge-case questions must be posed as draft scenarios** (stable id, pass/fail, recommendation) ratified by exception — never open "what should happen when X?" questions. Blocking slots are reserved for genuinely open contract/surface decisions; the cap's escape valve is demotion into the draft. `file:line` grounding emphasis on the repo-discoverable-facts rule. |
| Tasks/Build | Question block effectively banned: a blocking question resolves to either a proposed backward transition (upstream gap — the counterfeit-artifact rule's conversational twin) or an assumption (mechanical decomposition call, stated inline). Parked questions attach **per-task** in the build-plan doc entry and are projected into sub-issue bodies at tracker publish; the doc row is the source. |
| Implement | Mid-task interrupts reserved for **external blockers only** (credentials, tooling, billing, permissions — class-based, no number). Everything else batches to the task boundary (validator seam) under the uniform cap; steady-state near zero because upstream flaws go backward and discretionary calls are the agent's, recorded as assumptions. Assumptions get a durable, PR-visible home: an **"Assumptions & discretionary calls"** section in the PR body (+ task close comment when tracker-backed). §10 gains: a dispatched worker's blocking question routes to the dispatching implementer, who applies the triage — one channel to the human. |
| PR review | Escalations arrive **pre-adjudicated** as ratify/amend decisions: finding id + one-line gist + raising reviewers (agreement signal) + recommended disposition with reason. Only **proposed dismissals of high/medium findings** (plus anything touching a previously human-ratified residual-risk boundary) escalate; incorporations are just work. Escalation happens per fix wave, post-consolidation, never streamed, under the uniform cap; overflow means incorporate the cheap ones. **Human-ratified dismissals bind forward** across waves and sessions on the same finding class (recorded in `consolidated.md` with human-ratified attribution) unless new evidence emerges. The panel receives the PR body's assumptions section as named review input. |

## Scope

**In:**

- `skills/sdlc/references/system-reference.md` — new top-level section
  ("Presenting questions to the human"), §6 example-language neutralisation,
  §11 routing row.
- All six `skills/sdlc/references/phase-*.md` — per-phase deltas above.
- `skills/sdlc/assets/pull_request_template.md` and this repo's own
  `.github/pull_request_template.md` — add an "Assumptions & discretionary
  calls" section (empty-allowed), with `phase-pr-review.md` §4 wording that
  names it as **panel input** while preserving the existing "the PR body does
  not carry the local panel's development findings" rule.
- The pre-existing uncommitted async-dispatch guidance in
  `phase-pr-review.md` §5 (async `tasks:` dispatch + react-per-child polling)
  — ratified at the plan gate as folded into this stream and carried as its
  own commit on the feature branch.

**Out:**

- `SKILL.md` kernel (routing via system-reference §11 suffices; keeps the
  frozen kernel surface untouched).
- All `scripts/`, `schema/`, `prompts/` files — no behaviourally-executed
  surface changes; the PR-review delta instructs the orchestrating agent to
  name the assumptions section in its dispatch task text rather than editing
  `prompts/adversary-pr.prompt.md`.
- `templates/sdlc-*.md` standalone entrypoints (verified: they route to the
  references and restate no question guidance).
- Any config schema or FS-numbered contract change (prose-only; FS5/FS8/FS9/
  FS10/FS13 untouched).

## Definition of done

1. `system-reference.md` contains the shared-contract section with the exact
   cap (3–5, uniform, deltas lower-only), the three tiers, the
   overflow-demotes rule, the repo-discoverable-facts rule, and no tool names;
   §11 routes to it; §6's example language no longer names a questions tool.
2. Each of the six phase references contains its delta, phrased as a layer on
   the shared contract (pointer, not restatement).
3. `grep -ri "questions-helper\|questions tool" skills/sdlc/` returns no
   matches.
4. Both PR templates contain the "Assumptions & discretionary calls" section;
   `phase-pr-review.md` §4 names it as panel input without weakening the
   no-findings-in-body rule.
5. Full test suite passes (`npm test`) and lint is clean — including any
   structural tests over the references.
6. The two brainstorm-identified tensions are resolved in the shipped text:
   (a) PR-body wording cannot be read as licence to put panel findings in the
   body; (b) the assumption-accrual point (below) is stated in
   `phase-implement.md`.

## Context for the next agent (including parked questions)

- **Assumption-accrual home (parked from Brainstorm, resolved here as a
  proposed decision):** assumptions accrue during Implement as an
  **"Assumptions" appendix of the build-plan doc** (which exists on both
  tracks and below the tracker threshold), appended per task; PR preparation
  copies the appendix into the PR body section. Gate approval of this plan
  ratifies that choice.
- **Parked to Implement:** whether any existing structural tests assert
  section counts/ordering in `system-reference.md` — discover by running the
  suite before editing; adjust expectations only where the test encodes
  structure rather than behaviour.
- The previously uncommitted async-dispatch diff in `phase-pr-review.md` is
  folded into this stream (gate decision) and committed first on the feature
  branch, so all later edits to that file build on it.
- Reviewer-facing precedent: PR #17 finding-11 and PR #114's reuse of it are
  the motivating examples for the binding-dismissals rule.

## Assumptions ratified by approving this plan

1. Track is **reversible** (prose-only change to skill documentation surfaces;
   trivially revertable; freezes no schema, wire format, or executed
   contract). Under `overrides.reversible`, `review.design: human` — this
   human gate, no plan panel, and no separate Spec phase.
2. The PR-template addition is in scope now (both copies), not parked.
3. Assumption-accrual home is the build-plan appendix, as above.
4. Slug `sdlc-question-discipline`; branch `feat/sdlc-question-discipline`.
