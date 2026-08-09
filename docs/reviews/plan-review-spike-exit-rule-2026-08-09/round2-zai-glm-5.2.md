I now have a complete picture. Here is my round-2 delta review.

---

**Prior fixes (round 1) — all confirmed incorporated, one line each:**

- PLAN-R1-01 ✓ Scope 8 re-targets the append to `test/gate-presentation-contract.test.js`; S4 owns only the spike block, GPC owns the gate block, GPC10 covers both.
- PLAN-R1-02 ✓ Scope 2 now gives a falsifiable predicate per route applied to every load-bearing uncertainty; no third artifact.
- PLAN-R1-03 ✓ Scope 5 adds the direction×treatment combination rule (foundation/candidate names the future effort or reduces to reference/discard).
- PLAN-R1-04 ✓ Out-of-scope + next-agent context route ceremony/estimation/sizing to #158's build stream.
- PLAN-R1-05 ✓ DoD 5–10 each carry an explicit external time budget.
- PLAN-R1-06 ✓ Scope 1 + Assumption 2 classify the §8 addition as non-amending beside GPC C1 and justify §8 over §1.
- PLAN-R1-07 ✓ DoD 1 routes six-phase proof to `test/phase-references.test.js` (ASD3, six slugs verified live); DoD 4 routes telemetry/schema/config/script absence to a final-diff audit.
- PLAN-R1-08 ✓ Assumption 6 names the provisional-storage dependency pending the parked lifecycle follow-up.

---

### DoD 7 biome gate is vacuous for its two markdown targets

- severity: low
- confidence: high
- origin: NEW
- location: Definition of done, item 7
- defect: The biome command lists three files, but Biome 2.5.3 silently ignores both `.md` files, so the gate actually checks only the `.js` test file and supplies zero verification for `phase-brainstorm.md` and the plan doc.
- evidence: Running `npx biome check skills/sdlc/references/phase-brainstorm.md test/gate-presentation-contract.test.js docs/plans/2026-08-09-spike-exit-rule.md` prints `Checked 1 file` and exits 0; running it on the `.md` alone reports `These paths were provided but ignored: skills/sdlc/references/phase-brainstorm.md`. This was not raised in round 1 (round 1's PLAN-R1-05 addressed missing *time budgets*, not file-type coverage), and the delta did modify this DoD item.
- impact: A reader of DoD 7 infers the two markdown surfaces are biome-validated when they are not; the item overstates its coverage. Low blast radius because Biome cannot lint `.md` in this configuration at all and the markdown *semantic* content is covered by the contract assertions in DoD 5/9 — but the DoD as written is misleading rather than a real safeguard.
- fix: Drop the two `.md` paths from the DoD 7 command (leaving only the `.js` target), or add a clause stating Biome checks only the test file and the markdown is governed by the contract tests.

---

- CLEAR: B — every clause of the objective (route → human-approved spike → interpret without conflating direction/treatment → stop/revise/proceed without a new phase or gate bypass) maps to a falsifiable DoD item backed by greppable anchors or standing tests.
- CLEAR: C — in-scope and out-of-scope do not contradict each other or the objective; the change is one concept (spike routing) in one section plus a test append — one spec's worth, no decomposition needed.
- CLEAR: D — no in-scope or out-of-scope item contradicts an owner-ratified Brainstorm decision (the embedded decisions list is respected verbatim, including the rejected timebox/throwaway/mandatory-reuse items).
- CLEAR: E — the count-sensitive §8 invariants the spike block could trip (`The gate presentation` exactly once, exactly one ```mermaid fence, no restated ADR criteria) are caught by DoD 9 ("existing gate-presentation contract remains green") plus GPC10's anti-restatement guard; no unnamed ordering, migration, or irreversible-shape hazard remains.
- CLEAR: F — irreversible is correctly chosen: the change freezes a greppable contract shape in a `package-public` reference that adopting consumers depend on; nothing here belongs on the fast path.
- CLEAR: PROPORTIONALITY — appetite ("one S3-comparable irreversible slice, limited to Brainstorm guidance and contract tests") matches a one-block-plus-one-test change; the irreversible-track machinery is the repo norm for public-reference edits (S3 precedent), not disproportionate ceremony, and the scope is neither too large for one spec nor too small to need a plan.
