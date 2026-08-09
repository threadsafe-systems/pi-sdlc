# Plan: S3 brainstorm gate-presentation contract (map #192)

Status: rev 1, awaiting plan panel. Run slug `gate-presentation-contract`,
track irreversible. Map #192 slate row S3; bundles R1-G1, G2, G3, G4, G5, G7,
G8 with R1-G5's shape amended at this gate (see provenance `rejected:` lines).

## Brainstorm provenance

Ratified at the brainstorm gate 2026-08-09 (approver `human:neilwashere`),
plain mode — this block is the store. Design re-assessed Matt Pocock's
wayfinder + domain-modeling discipline: the whiteboard is framing and
throwaway; only the crystallised residue persists.

### The sketch

```mermaid
flowchart LR
    DLG["Brainstorm dialogue\nmoves G1 G2 G3 G4 G7\n(throwaway framing)"] --> GP["Gate presentation\n(two artifacts)"]
    GP --> SK["the sketch\nmermaid; conditional;\nabsence declared"]
    GP --> DECS["the decisions list\nappetite: / decision: / rejected:\none-line entries"]
    DECS -->|plain mode| STORE["plan provenance = STORE\nsketch + list embedded verbatim"]
    DECS -->|map mode| INDEX["plan provenance = INDEX\nname-wrapped ticket links,\nDecisions-so-far shape"]
    INDEX --> TICKET["ticket resolution comment\nsingle home of the full grammar"]
    DECS -.->|three-criteria bar| ADR["ADR\ndeep record"]
    STORE --> PP["Plan panel\ncontradicts-a-named-decision check"]
    INDEX --> PP
    DECS -.->|appetite: line| E158["#158 estimator\nfuture handoff evidence"]
```

### The decisions list

- appetite: one lifecycle slice (brainstorm→PR), S1-comparable scale, track irreversible; human-gated brainstorm, panel-gated plan/spec per config
- decision: the gate presentation is exactly two artifacts — the whiteboard sketch and the decisions list; R1-G5's eight-item prose skeleton is dissolved; G1/G2/G3/G4/G7 survive as dialogue moves (shape the conversation, produce no artifact)
- decision: sketch trigger = the design introduces a new flow or ≥3 interacting components; absence is declared at the gate; the sketch is a gate artifact and embeds verbatim in the plan in both modes
- decision: decisions-list grammar = three line kinds — appetite (exactly one, always first, binds ceremony not shape), decision, rejected; one-line entries; optional (→ ADR 00NN) suffix
- decision: rejections always crystallise — a refused alternative is an explicit not-do decision recorded with its trade-off rationale
- decision: the three-criteria ADR bar (hard-to-reverse + surprising + real trade-off) stays an additional deep record; the rejected line is the always-record
- decision: plain mode — the plan is the store: sketch + decisions list embedded verbatim in the plan's provenance
- decision: map mode — the plan is the index: named links with one-line gists (Decisions-so-far shape); the full grammar lives in exactly one place, the ticket resolution comment; wayfinder's one-place law survives
- decision: assumptions cross in the plan's own Assumptions section, not recap material
- decision: enforcement = S1 pattern only — contract tests assert rule prose in phase-brainstorm.md §8 and phase-plan.md; substance rides the human gate (review.brainstorm=human); no gate-time list parser, no new dial (#159), no new panel
- rejected: a verbatim prose recap block restated in the plan — framing is throwaway; provenance = sketch + decisions only; supersedes R1-G5's slate wording ("the recap ingredients restated verbatim in the plan")
- rejected: a gate-time mechanical grammar parser over the recap — it polices framing at the one phase whose point is cheap human-judged discovery; the human gate suffices
- rejected: discarding rejected alternatives unless they clear the ADR bar — owner amendment; rejections are first-class crystallisation

## Problem statement

Brainstorm's exit is shapeless today: §8 names the completion evidence "the
human-approved design" with no structure, so (a) the Plan panel cannot
distinguish what the human ratified from what the plan author invented,
(b) refused alternatives evaporate the moment the session ends, and (c) in
map mode any recap would restate what tickets already hold, breaking the
one-place law. R1's answer — an eight-item prose skeleton restated verbatim
in the plan — over-contractualised a framing phase; the wayfinder and
domain-modeling re-assessment shows the correct split: framing is throwaway,
only decisions and language persist.

## Objective

Every brainstorm exits through a two-artifact gate presentation (sketch +
decisions list) whose residue lands in the plan's provenance — embedded
verbatim in plain mode, indexed by name in map mode — so downstream panels
can catch a plan contradicting a named decision or resurrecting a rejected
alternative.

## In scope

1. `skills/sdlc/references/phase-brainstorm.md` §8 rebuilt as **The gate
   presentation**: the two-artifact requirement, the three-kind grammar, the
   sketch trigger + absence declaration, the amendment loop (human speaks,
   agent updates, amended list lands), and the transition (the plan carries
   the provenance).
2. `skills/sdlc/references/phase-brainstorm.md` §1: the named dialogue moves
   — problem/outcome opening that names no mechanism (G1),
   alternative-or-declare (G2), appetite elicited before converging (G3),
   research-or-declare with named triggers (G4, folded into the existing
   tools bullet), one constraints prompt, named never bound (G7).
3. `skills/sdlc/references/phase-brainstorm.md` §9: the map-mode provenance
   split — the plan is the index (named links, gist lines); the ticket
   resolution comment is the single home of the full grammar.
4. `skills/sdlc/references/phase-plan.md` §4: the provenance rule — every
   Plan doc opens with the Brainstorm provenance block (the gate sketch when
   one exists, then the decisions list: store in plain mode, index in map
   mode); a plan contradicting a named decision must declare the deviation;
   the plan panel's scope check includes resurrected `rejected:` lines.
5. `test/gate-presentation-contract.test.js`: contract tests asserting the
   rule prose anchors above (offline string assertions, S1 pattern).

## Out of scope

- S2 (plan skeleton template embedding the provenance placeholder) — it
  consumes this seam; S3 defines the rule, S2 builds the skeleton.
- Map DAG rendering / sdlc-visual-docs — S7 territory, advisory-only.
- Mechanical appetite reading — #158's estimator consumes the line later.
- Review-dial changes (#159 no-dials law), adversary prompts (no brainstorm
  adversary exists), router templates (stay thin), tracker mechanics (owned
  by §9 + assets/tracker-ops.md).

## Definition of done

1. §8 rebuilt and §1 moves present; contract tests assert the anchors.
2. phase-plan.md §4 carries the provenance rule; contract tests assert
   placement between the first paragraph and **Dialogue discipline.**
3. Contract test file runs offline, < 1 second.
4. Full corpus `npm test` green, external budget 30 seconds.
5. biome clean on touched files.
6. `check-references` exit 0 — no new FS11 surface (rules live in existing
   references; no inventory row needed).
7. `check-lifecycle --track irreversible --slug gate-presentation-contract`
   exit 0 once build doc exists.
8. Frozen surfaces byte-identical (ASD19); `test/fixtures/consumer/`
   untouched; the two skill-kernel §9 anchors ("Working the map", "native
   GitHub sub-issues of the map") intact.

## Assumptions

1. No new `references/*.md` file → no normative-references.json row (FS11
   discovery/inverse-completeness unaffected).
2. phase-brainstorm.md and phase-plan.md are not in the FROZEN list
   (verified: 16 entries, no phase references) — no unfreeze/re-freeze dance.
3. test/diff-scoped-premises.test.js DSP1 is scoped to phase-spec.md §4 only
   (verified); phase-plan.md §4 insertions carry no DSP-class constraint,
   but keep the insertion a single paragraph to stay proportionate.
4. skill-kernel.test.js pins two §9 lines; the §9 addition appends a
   paragraph without touching them.

## Context for the next agent

The provenance block above is itself the dogfood artifact: it is exactly the
contract this slice writes into the phase references. If the panel changes
the contract, update the provenance block and the rule prose together.
`--author` identity: the orchestrating session's live model at dispatch
time (check the session jsonl, do not assume authorDefault). Branch:
`feat/gate-presentation-contract`.
