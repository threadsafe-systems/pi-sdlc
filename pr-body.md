<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->

```sdlc
track: reversible
slug: sdlc-question-discipline
```

Teaches every lifecycle phase how to ask the human for input. One shared
question-presentation contract now lives in the system reference — single
end-of-reply numbered block, enumerated alternatives, reasoned
recommendations, a uniform 3–5 soft cap, and Blocking/Assumption/Parked
triage tiers — and each of the six phase references layers a phase-shaped
delta over it (divergent brainstorm through pre-adjudicated PR-review
escalations). The unactionable "questions tool" framing is removed: the
contract is tool-agnostic and degrades to plain prose. Also carries the
previously drafted async panel-dispatch guidance (react per-child) folded in
at the plan gate, and both PR templates gain the "Assumptions & discretionary
calls" section as named panel input.

## Governing documents

- Plan: `docs/plans/2026-07-19-sdlc-question-discipline.md`
- Build plan: `docs/plans/2026-07-19-sdlc-question-discipline-build.md`
- Reversible track — no Specification is required.

## Tracker references

- Epic: #115
- Tasks: Closes #116, Closes #117
- Board: pi-sdlc build board (org project 5)

## Assumptions & discretionary calls

Copied from the build-plan doc's "Assumptions" appendix:

- Two-task slicing (T1 shared contract → T2 phase deltas) with a native
  blockedBy edge; decomposition rationale recorded in the build plan.
- Shared-contract wording avoids the S2 generic-surface banned literals
  (e.g. "handover" is a loom-domain word); "carried forward in the phase's
  context for the next agent" is the sanctioned phrasing.
- Disposition-ledger S25 anchor updated to the reworded brainstorm bullet —
  one line outside the plan's stated scope, forced by ASD5's living-anchor
  test; treated as a discretionary call, not a scope change.
