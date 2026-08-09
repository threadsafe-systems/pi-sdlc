I've read the full target spec, the locked Plan (rev 4 at `e16f3db`), the skeleton, phase-brainstorm §8, the existing test file, the GPC spec C1/C8, ASD19's frozen list, and verified the git state. Findings below.

### Unlanded plan commitment: S4 never names #147 as future mechanisation of the read tier

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md` (throughout — C1 route 1 "read", F1, SER2/SER3)
- defect: The owner-ratified Plan commits the slice to naming #147 as the future mechanisation of the read tier, but the spec never mentions #147 anywhere, so an implementer following only the spec would not include the endorsement.
- evidence: Plan `docs/plans/2026-08-09-spike-exit-rule.md:53` — "decision: #147 remains the separate future mechanisation of the read tier — S4 endorses but does not implement its feasibility linter"; line 136 — "Implementing #147's SDK/config feasibility linter; S4 names it as future mechanisation of the read tier only." `grep -n "147" docs/specs/2026-08-09-spike-exit-rule.md` returns zero hits; the spec's C1 route 1 (read existing evidence) is precisely the tier #147 will mechanise but no FR/SER/Vocabulary entry requires the §8 prose to name it.
- impact: A ratified locked decision silently dies at implementation time; the spec fails the plan's "S4 names it" commitment with no scenario that could catch it (SER13's inspection covers only machinery, not the #147 endorsement).
- fix: Add one line to C1 (or a one-sentence FR/SER13 item) requiring the §8 read-tier route to name #147 as future mechanisation and out of this slice's scope.

### Spec does not pin the live GPC anchors the S4 §8 block must not disturb (a second mermaid fence breaks GPC1)

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md` — C1 invariant, SER1, Plus plan sketch
- defect: The spec constrains the spike block only with "the guide is prose", but the plan's own gate sketch is a mermaid flowchart, and embedding any fenced diagram into §8 would fail GPC1's "exactly one fenced sketch in sec8" assertion — a self-inflicted break the spec never warns about.
- evidence: `test/gate-presentation-contract.test.js` line ~47 `assert.equal(fences.length, 1, "exactly one fenced sketch example in sec8")`; `skills/sdlc/references/phase-brainstorm.md:133` is the only mermaid fence in §8 today; the plan's sketch is a `flowchart TD` mermaid (`docs/plans/...:19-44`); the plan's DoD item 1 wants the spike block to "add[] a greppable four-way uncertainty-routing guide" — greppability is prose anchors, not a diagram, but nothing in the spec forbids a second fence.
- impact: A natural implementation choice (copying/adapting the plan's mermaid spike loop into §8) turns a red GPC1/SER1 test; the failure is only caught at test time, not at authoring time, and the spec gives the implementer no explicit guardrail.
- fix: Add an explicit invariant to C1 (or SER1) that the S4 §8 block adds no second fenced diagram and preserves the existing "The next transition is **Plan**" literal (GPC17).

### SER3 falsify clause is ambiguous about route ordering

- severity: low
- confidence: medium
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md` — SER3 Falsify
- defect: "an empirical question can reach judgment before the Plan check" is garbled — judgment (route 3) comes *after* the Plan check (route 2) in the ordered guide, so "before the Plan check" is not a reachable ordering and the clause is redundant with SER3's When–Then "reserves judgment for questions no empirical evidence can settle".
- evidence: C1 route order "read → Plan/front-load → human judgment → spike"; SER2 asserts Plan strictly before judgment; SER3's own When–Then already reserves judgment for non-empirical questions.
- impact: An implementer cannot tell what behaviour this falsify outlaws beyond what the When–Then already states; the redundant qualifier adds confusion rather than a gate.
- fix: Reword the clause to "an empirically answerable question is routed to judgment instead of spike" (delete the "before the Plan check" qualifier).

CLEAR: A — No frozen shape over-commits; the four treatments and three directions exactly match the plan's locked decisions, and "provisional" stays provisional.
CLEAR: B — All 14 scenarios have the three-part form; kind tally is correct (12 mechanical + 1 inspection + 1 carried = 14, 86% mechanical); SER13 names the PR gate, SER14 names `pr_review`; each scenario gates its claimed outcome.
CLEAR: C — All five contracts have the six required cells; interfaces mentioned as unchanged context (existing §8 gate-presentation block, GPC C1) are not silently re-described.
CLEAR: D — No contradiction with the plan's prose routing order (read → Plan → judgment → spike) or with the sketch as framing; term usage matches the Vocabulary table (the #147 omission is covered by the first finding).
CLEAR: E — Composition with the existing §8 block and one test owner is sound; ASD19's FROZEN list (`test/frozen-surfaces.test.js:15-31`) does not include phase-brainstorm.md or the test file, so the plan's assumption 1 holds (mermaid-fence risk covered by the second finding).
CLEAR: F — All five NFRs carry a response measure and a binding scenario id; SER12 prices every CI-running command (focused 1s, npm test 30s, biome 5s, check-references 5s) per workflow PROPORTIONALITY.
CLEAR: G — No over-claiming: "no seventh phase / no third artifact" and "guide is prose, no parser" are each backed by the bounded mechanisms the scenarios assert.
CLEAR: H — No inbound `CARRY-TO-SPEC` was minted (plan-panel record "plan carries none and says so explicitly"); the spec's "No inbound CARRY-TO-SPEC exists" header is accurate; SER14's parked-follow-up landing is faithful to the plan's out-of-scope note.
