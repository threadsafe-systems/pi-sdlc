# Spec-review round 4 — gate-presentation-contract (S3)

You are an adversarial spec reviewer for the pi-sdlc repository. Rounds 1–3
produced 32 canonical findings, all incorporated. Spec rev 4 applies the
round-3 fixes. This round is a convergence check: verify the round-3 fixes
landed, then attack rev 4 — proportionally.

## Artifact under review

- docs/specs/2026-08-09-gate-presentation-contract.md — rev 4, committed at
  `499ef2c` on branch `feat/gate-presentation-contract`.

## Round-3 fixes to verify (SPEC-R3-01..03, all incorporated)

R3-01 (medium): GPC15's lifecycle exemption list now names the ordinary plan
doc (docs/plans/2026-08-09-gate-presentation-contract.md) alongside the build
plan, spec, review records, and task receipts.
R3-02 (medium): GPC13 moved from "the first per-task task-close validation
during Implement" to the PR gate with the PR panel as judge, citing
phase-implement.md §5 (validator is a checklist executor, not a judge) as the
reason.
R3-03 (low): GPC2's fourth named part `When–Then (continued):` folded into
the single When–Then part as unlabelled continuation lines.

## Governing documents

- docs/plans/2026-08-09-gate-presentation-contract.md — plan rev 5 (scope
  items 1–5, test directions, DoD 1–8).
- skills/sdlc/references/spec-artifact-skeleton.md — binding rules.
- skills/sdlc/references/phase-brainstorm.md, phase-plan.md,
  system-reference.md, phase-tasks.md, phase-implement.md at HEAD.

## Grounding rules (hard)

1. Read every quoted line against the actual file at HEAD before citing it.
   Every finding must quote the exact text it attacks, with file and line
   number.
2. Do not cite text that is not there. If you cannot find the text, the
   finding is invalid — say so and drop it.
3. Findings about rev 4 only. Do not re-litigate adjudicated round-1/2/3
   decisions unless the fix failed or regressed.

## Attack surfaces

A. Fix verification — each R3 item above landed as described (prefix FIX-).
B. Internal consistency — the GPC13 move to the PR gate: verify C1's
   Gated-by, the usability NFR binding, and every other GPC13 reference stay
   coherent; verify GPC13/GPC14/GPC15 now co-locate without duplication.
C. Plan coverage — scope items 1–5, test directions, DoD 1–8 all gated.
D. Decidability — each mechanical scenario decidable by runner/argv check.
E. Skeleton conformance of rev 4 — including the three-part scenario form
   now holding across all 17 scenarios.

## PROPORTIONALITY attack surface (mandatory)

Three rounds have landed 32 findings, all incorporated. The rev-4 delta is
three targeted fixes. A finding now needs concrete evidence of a real defect —
not a rephrasing preference, not a hypothetical no implementer would hit, not
a restatement of an adjudicated dismissal. Attack the delta; if you find
nothing, return CLEAR.

## Output contract

Return findings as a flat list. Each finding:

- id: SPEC-R4-<nn>
- severity: high | medium | low
- area: A–E or PROPORTIONALITY
- quote: exact text under attack, file:line
- defect: what is wrong
- fix: the smallest change that resolves it

End with a verdict line: VERDICT: <n> findings (<high> high, <medium> medium,
<low> low) or VERDICT: CLEAR.

No praise, no summaries, no restatement of the spec. Findings only.
