### PAS3 still pins the revoked 66-character replacement pin, contradicting C8's 62-character pin

- severity: medium
- confidence: high
- origin: NEW
- location: docs/specs/2026-08-14-plan-artifact-skeleton.md — PAS3 When–Then (spec rev 2, the "GPC2 matches the 66-character replacement pin" clause) vs C8 edit 2
- defect: The SPEC-R1-02 fix re-counted the re-worded pin to 62 characters in C8 but left PAS3 asserting "GPC2 matches the 66-character replacement pin" — 66 was the length of the revoked FS19-worded pin (`the prompt changes only under the FS19 deliberate-change precedent`), not the shipped one. The gating scenario for C8's mechanical half misstates the quantity the contract fixes.
- evidence: C8 (spec): "becomes a match on the replacement pin `the prompt changes only under the deliberate-change discipline` (62 characters — under GPC10's 80-character verbatim-substring bound)". PAS3 (spec, unchanged in the 2b521ff..9b40119 delta): "GPC2 matches the 66-character replacement pin". `printf '%s' 'the prompt changes only under the deliberate-change discipline' | wc -c` → 62. The stale "66" is the rev-1 count: the FS19 variant measures 66. GPC10's bound (test/gate-presentation-contract.test.js:322-332, `i + 80 <= testSource.length` window check over the governed docs incl. phase-plan.md) is what makes pin length a first-class spec quantity, so the number is load-bearing, not prose.
- impact: A verifier or implementer cross-checking PAS3 against C8 gets two different pin lengths for the same assertion; a panel executing PAS3 as written would flag a correct 62-char pin as non-conforming (or "fix" the pin toward 66). Internal contradiction in the contract/scenario pair that round 2 exists to catch.
- fix: In PAS3's When–Then, change "66-character replacement pin" to "62-character replacement pin" (one word).

## Prior-fix confirmations (round 1, all verified against the tree at 9b40119)

- SPEC-R1-01 confirmed — M3 and PAS4 now pin exactly one anchor per letter A–E with the full per-letter coverage map; C3's map, M3's pin, and PAS4's shorthand are mutually consistent and name all ten skeleton sections exactly once across A–E (A→DoD+`Carried to`, B→2, C→3, D→2, E→2).
- SPEC-R1-02 confirmed — the §4 replacement clause, the GPC2 pin, M2's clause, and the Vocabulary "surviving rule" row carry no process id; "FS19" survives only in the spec's own Amendments (a lifecycle artifact, permitted); pin verified at 62 chars (`wc -c`).
- SPEC-R1-03 confirmed — the Portability NFR row is re-bound to PAS10 + PAS12 with the split stated in the measure ("the skeleton's wording mechanically clean (PAS12), the whole-slice boundary held at the diff (PAS10…)").
- SPEC-R1-04 confirmed — PAS10/PAS13/PAS14 each state a budget (rides the already-dispatched gate panel; bounded inspected set; over-permitted diff fails rather than expanding review) and a new "Performance efficiency (gate inspections)" NFR row binds them.
- SPEC-R1-05 confirmed — M8/PAS12 fixed as five literal substrings (`Cucumber`, `Behat`, `Gherkin`, `linter`, `CI check`) plus the required guidance sentence; verified no self-collision with C1's mandated text (the sweep's required "CI/CD" does not contain the denied `CI check`; C1's "no checker, parser, or tooling mandate" does not contain `linter`).
- SPEC-R1-06 confirmed — PAS5's Falsify now states full-sentence contiguous matching by design, mirroring S1's shipped M4.
- SPEC-R1-07 confirmed — C6 pins the comment inside the IDV19 test body adjacent to the filtered loop; verified the hazard is real and the fix is safe: test/iteration-disposition.test.js:468-476 `commentBlock` absorbs contiguous `//` lines around its needles and the `processHistory` regex at :476 (`/\b(?:Plan|panel|PR|removed|retired)\b/i`) matches the hyphen-delimited `plan` in `adversary-plan.prompt.md`; a comment inside IDV19's body (lines 491-499, below IDV33's test) is contiguous with neither ownership block (above IDV28 at ~:446 and above IDV33 at :457-458).

## Delta grounding checks performed (evidence base)

- L1, L2, L3 byte-verified: extracted the three ```text blocks from the spec and diffed against the live prompt's `## Delta rounds` section, `## Output format`→EOF, and `test/frozen-surfaces.test.js`'s `FROZEN` array minus `adversary-plan.prompt.md` (16 entries, exact order) — all True.
- GPC2's superseded pin exists verbatim (`assert.match(planSec4f, /the prompt itself stays untouched/)`, test/gate-presentation-contract.test.js:310); GPC2's ordering assertions (:291-297, indexOf-based) survive both C2's inserted paragraph and C8's clause swap; SER1's `phaseRefs` deep-equal (:124) filters `phase-*` so the new skeleton file cannot break it; the 62-char pin plus its regex delimiters cannot form an 80-char window present in phase-plan.md, so GPC10 (:322-332) holds.
- §4 structure verified in skills/sdlc/references/phase-plan.md: first paragraph begins `Produce the Plan doc:`; `**Brainstorm provenance storage.**`, `**Dialogue discipline.**`, `> **Under your configuration:**` follow in M2's asserted order; the provenance paragraph ends `— the prompt itself stays untouched.` as C8 assumes.
- Inventory: 81 source rows today (node), `discovery.roots` includes `skills/sdlc/references/*.md` (inverse completeness forces C4's row once C1 lands); S1's M5 count pin at test/spec-artifact-skeleton.test.js:99 asserts 81 → the 81→82 amendment is required and correctly sized; the C4 row's nine fields mirror the shipped `reference.spec-artifact-skeleton` row exactly.
- IDV19/IDV33/ADVERSARY_PROMPTS verified at test/iteration-disposition.test.js:407 (constant literal `["plan", "spec", "review"]`), :437/:450 (unfiltered sibling loops in IDV15/IDV28), :491-499 (IDV19 body incl. the validator-task assertion).
- Goldens: test/fixtures/golden/plan_review.agent.md is a loom-consumer template (front-matter, 43 lines, zero `REVIEWER_TAG` occurrences) — the package-prompt edit cannot move it, grounding assumption 2 and the "goldens untouched" permitted-class claim.
- `docs/specs/2026-08-09-gate-presentation-contract.md:409` carries `None at rev 3.` — C8 edit 3's target exists; that doc's C2 (line 62, "the prompt stays untouched") is the clause the amendment record's disposition field names.

CLEAR: A — the delta changes no frozen shape; every pinned literal (L1/L2/L3, clause, pin, row fields) re-verified byte-level against the tree.
CLEAR: B — every delta scenario still gates a falsifiable outcome; the PAS3 defect is a misstated quantity (counted under D), not a missing or non-gating scenario.
CLEAR: C — M2/M3/M7/M8 assertion shapes are buildable as written against the verified file structures; no guessed signatures introduced by the delta.
CLEAR: E — all framework-behaviour claims in the delta (IDV33 absorption + word-bounded regex, GPC10 window mechanics, GPC2 ordering, FROZEN extraction regex `^\t"…",$`) verified at cited file:line.
CLEAR: F — portability re-bound with the split stated; the new gate-inspections NFR row states stimulus, measure, and binding.
CLEAR: G — no delta sentence overclaims; PAS5's threshold honesty and M8's decidability fixes verified as landed.
CLEAR: PROPORTIONALITY — all CI/gate scenarios state plausible budgets (<1 s / 30 s / 5 s externally bounded; inspections ride existing dispatches with bounded sets; no new machinery).