### PAS3 retains the obsolete 66-character pin count

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-14-plan-artifact-skeleton.md:210,258` (C8 and PAS3)
- defect: C8 now fixes the GPC2 replacement pin `the prompt changes only under the deliberate-change discipline` at 62 characters, but PAS3 still requires “GPC2 matches the 66-character replacement pin.” The two contract statements disagree.
- evidence: C8 explicitly says “(62 characters — under GPC10's 80-character verbatim-substring bound)” at line 210, while PAS3 says “66-character replacement pin” at line 258; the literal's measured length is 62 and GPC10's bound is enforced in `test/gate-presentation-contract.test.js:324-334`.
- impact: PAS3 is internally impossible to satisfy as written or encourages Build to implement the wrong pin-count assertion, so the supersession verification cannot reliably gate the shipped clause.
- fix: Change PAS3's “66-character” to “62-character.”

### Gate-inspection NFR does not bind its spec-gate half

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-14-plan-artifact-skeleton.md:236` (Performance efficiency (gate inspections) NFR)
- defect: The new NFR's stimulus covers “the spec/PR gate panels,” but its sole binding is PAS10, which is explicitly the PR-gate diff inspection. PAS13 is the spec-gate inspection and PAS14 is the other PR-gate inspection, so the stated spec-gate condition has no binding scenario.
- evidence: The NFR row binds only `PAS10` at line 236; PAS13 names “at the **spec gate**” at line 318, while PAS14 names “at the **PR gate**” at line 324.
- impact: The NFR can claim all gate inspections use the bounded existing dispatch while the spec-gate portion is not tied to any scenario id, leaving that half outside the stated verification contract.
- fix: Bind the row to `PAS10, PAS13, PAS14`, or narrow its stimulus and response to the PR-gate inspection covered by PAS10.

CONFIRMED(SPEC-R1-01) — M3/PAS4 now pin exactly one anchor in each A–E surface with the complete per-letter coverage map.
CONFIRMED(SPEC-R1-02) — the surviving rule and GPC2 pin now use the self-descriptive deliberate-change discipline and the 62-character prefix, with no FS19 in the shipped clause.
CONFIRMED(SPEC-R1-03) — Portability is now split across PAS10 for the whole-slice boundary and PAS12 for skeleton wording/tooling.
CONFIRMED(SPEC-R1-04) — PAS10, PAS13, and PAS14 now state existing-panel/bounded-set inspection budgets, and the inspection NFR is added.
CONFIRMED(SPEC-R1-05) — M8 now has the five literal denial substrings plus the required guidance sentence.
CONFIRMED(SPEC-R1-06) — PAS5 now honestly limits falsification to full-sentence matching.
CONFIRMED(SPEC-R1-07) — C6 now places its reconciliation comment inside IDV19 adjacent to the filtered loop, avoiding IDV33's ownership block.

CLEAR: A — no new frozen-shape defect in the delta; the surviving-rule wording is self-descriptive and the anchor map is pinned.
CLEAR: C — no buildable interface/signature defect found.
CLEAR: E — no new framework/lifecycle-behaviour defect found in the delta.
CLEAR: G — no separate honesty overclaim found beyond the stale PAS3 count and the unbound NFR portion above.
CLEAR: PROPORTIONALITY — PAS10/13/14 now state bounded existing-panel inspection budgets; no new unbounded machinery was introduced.