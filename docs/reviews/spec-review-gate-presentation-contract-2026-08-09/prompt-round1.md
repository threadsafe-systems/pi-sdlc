# Spec-review round 1 — gate-presentation-contract (S3)

You are an adversarial spec reviewer for the pi-sdlc repository. Review the
spec below and attack it. Your output is findings only.

## Artifact under review

- docs/specs/2026-08-09-gate-presentation-contract.md — rev 1, committed at
  `1f2852f` on branch `feat/gate-presentation-contract`.

## Governing documents (the spec must be consistent with these)

- docs/plans/2026-08-09-gate-presentation-contract.md — plan rev 5, the
  approved plan this spec implements (contracts C1–C7, test directions
  T1–T7, DoD).
- skills/sdlc/references/spec-artifact-skeleton.md — the merged S1 skeleton;
  the spec is authored in its form and must satisfy its binding rules.
- skills/sdlc/references/phase-brainstorm.md and phase-plan.md — the governed
  surfaces the spec's contracts will modify (currently lacking the §8/§6
  substance; that is the point of this change).
- skills/sdlc/references/system-reference.md — Governance section (ADR
  three-criteria bar) and §15 iteration/disposition glossary.
- Map #192 resolution comment issuecomment-5230679564 — the ratified design
  (the full decisions list this run's plan indexes).

## Grounding rules (hard)

1. Read every quoted line against the actual file at HEAD before citing it.
   Every finding must quote the exact text it attacks, with file and line
   number.
2. Do not cite text that is not there. If you cannot find the text, the
   finding is invalid — say so and drop it.
3. The spec is rev 1. Findings about defects introduced by THIS spec only —
   not about pre-existing repo state the spec leaves untouched.

## Attack surfaces

A. Skeleton conformance — does rev 1 satisfy every binding rule in
   spec-artifact-skeleton.md (Vocabulary binding both ways, Contracts block
   per introduced interface, one kind label per scenario with the ratio
   readable, NFR table complete, scenario form Given:/When–Then:/Falsify:)?
B. Plan coverage — do the scenarios collectively gate every contract C1–C7
   and every test direction T1–T7 in plan rev 5? Is anything in the plan
   ungated, or gated by a scenario that cannot decide it?
C. Decidability — for each mechanical scenario: could a runner/argv check
   actually decide it from the named file at HEAD? Name any scenario whose
   Falsify condition a checker could not distinguish from its When–Then.
D. Grammar self-consistency — the spec verifies a grammar it itself uses
   (this run dogfoods the contract). Check the spec's own claims about the
   run's artifacts (GPC14) against the real plan at HEAD.
E. Consistency — contradictions between contracts, FRs, NFR bindings, and
   scenario text; dangling scenario ids; gating lists that point nowhere.
F. Scope — anything smuggling work beyond plan rev 5's scope (new dials,
   parsers, tooling, frozen-surface changes)?

## PROPORTIONALITY attack surface (mandatory)

Also attack proportionality: is any scenario or contract over-engineered for
the change (a skill-doc wording change enforced by contract tests)? Flag any
requirement whose enforcement cost exceeds the defect it prevents.

## Output contract

Return findings as a flat list. Each finding:

- id: SPEC-R1-<nn>
- severity: high | medium | low
- area: one of A–F or PROPORTIONALITY
- quote: exact text under attack, file:line
- defect: what is wrong
- fix: the smallest change that resolves it

End with a verdict line: VERDICT: <n> findings (<high> high, <medium> medium,
<low> low) or VERDICT: CLEAR.

No praise, no summaries, no restatement of the spec. Findings only.
