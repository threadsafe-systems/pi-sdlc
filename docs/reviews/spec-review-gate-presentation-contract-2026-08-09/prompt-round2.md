# Spec-review round 2 — gate-presentation-contract (S3)

You are an adversarial spec reviewer for the pi-sdlc repository. Round 1
produced 19 canonical findings, all incorporated into spec rev 2. This round
verifies those fixes landed correctly and attacks rev 2 fresh.

## Artifact under review

- docs/specs/2026-08-09-gate-presentation-contract.md — rev 2, committed at
  `9d45da9` on branch `feat/gate-presentation-contract`.

## Round-1 fixes to verify (CANON-01..19, all incorporated)

01 test file renamed to test/gate-presentation-contract.test.js everywhere;
02 all §6a/§6b references moved to phase-plan.md §4;
03 new contract C9 on phase-brainstorm.md §9 (home, thread variant, no
duplication, boundary rule);
04 new contract C10 on §1 dialogue moves; C5/C6 re-pointed to §1;
05 C1 gained sketch trigger (new flow or ≥3 interacting components), absence
declaration, amendment loop, transition; GPC17 added;
06 GPC18 gates sketch-in-both-modes; GPC14 gains mismatched-sketch falsifier;
07 C3 invariant: every entry one physical line; GPC5 rejects multiline;
08 C2 precondition covers standalone Plans;
09 ADR suffix required whenever the Governance bar applies (GPC6 asserts the
conditional);
10 GPC10 decidability: ≥80-char verbatim substring bound replaces semantic
test;
11 GPC1 structural-only; framing judgment stays with GPC13 inspection;
12 GPC14 compares plan embed against the canonical home byte-for-byte;
13 GPC11 extended to package.json/package-lock.json byte-identity + file
surface; compatibility NFR narrowed to match;
14 modularity NFR rebound to the static one-home invariant GPC3 checks;
15 GPC12 uses DoD-verbatim commands (node skills/sdlc/scripts/check-references.mjs);
16 no-parser guard: GPC15 falsifies any new parsing machinery; GPC11 forbids
new scripts;
17 C7 (phase-brainstorm.md §4 bullet) and old GPC9 dropped as unauthorized;
18 GPC11 moved from C2's to C8's Gated-by; FR bindings consistent;
19 GPC13 decision point renamed to the Build phase's first task-close
validation.

## Governing documents

- docs/plans/2026-08-09-gate-presentation-contract.md — plan rev 5 (contracts
  C1–C7 plan-side, scope items 1–5, test directions, DoD 1–8).
- skills/sdlc/references/spec-artifact-skeleton.md — binding rules.
- skills/sdlc/references/phase-brainstorm.md, phase-plan.md,
  system-reference.md at HEAD.

## Grounding rules (hard)

1. Read every quoted line against the actual file at HEAD before citing it.
   Every finding must quote the exact text it attacks, with file and line
   number.
2. Do not cite text that is not there. If you cannot find the text, the
   finding is invalid — say so and drop it.
3. Findings about rev 2 only — not about pre-existing repo state the spec
   leaves untouched, and not about round-1 findings already adjudicated
   unless the fix failed or regressed.

## Attack surfaces

A. Fix verification — for each CANON item above, verify the fix landed as
   described. A fix that landed wrong, half, or with a new inconsistency is a
   finding (area A, prefix FIX-).
B. Internal consistency of rev 2 — GPC numbering gaps are intentional (GPC9
   dropped); check gating lists, FR bindings, NFR bindings, and Vocabulary
   binding both ways for dangling or contradictory references introduced by
   the restructure.
C. Plan coverage after restructure — do the scenarios collectively gate every
   plan scope item 1–5, every test direction, and DoD 1–8? Name any plan
   requirement now ungated (including anything the restructure accidentally
   dropped).
D. Decidability — each mechanical scenario must be decidable from the named
   file at HEAD by a runner/argv check.
E. Skeleton conformance of rev 2 — every binding rule in
   spec-artifact-skeleton.md still satisfied after the rewrite.

## PROPORTIONALITY attack surface (mandatory)

Attack proportionality: flag any rev-2 addition whose enforcement cost
exceeds the defect it prevents. Round 1 found the overall pattern
proportionate; attack the DELTA.

## Output contract

Return findings as a flat list. Each finding:

- id: SPEC-R2-<nn>
- severity: high | medium | low
- area: A–E or PROPORTIONALITY
- quote: exact text under attack, file:line
- defect: what is wrong
- fix: the smallest change that resolves it

End with a verdict line: VERDICT: <n> findings (<high> high, <medium> medium,
<low> low) or VERDICT: CLEAR.

No praise, no summaries, no restatement of the spec. Findings only.
