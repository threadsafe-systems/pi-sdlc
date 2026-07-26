# plan_review round 4 — trim-the-tail delta confirmation — anthropic/claude-fable-5:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `848b995`
(delta `66d9520..848b995`). Verbatim reviewer output.

**Sub-floor dispatch, deliberately.** One reviewer, not the configured floor of
2, under D7's trim-the-tail exemption: round 3 yielded no findings from the
second panelist that fable-5 did not also raise or that survived dedup, so a full
round to chase a confirmation would be disproportionate. Recorded here as the
exemption requires. The `pi-sdlc-plan-review` child was again marked `failed` by
the subagent acceptance layer for making no edits on a read-only review; verdict
recovered from `output-0.log` per `phase-pr-review.md` §5.

---

### Round-3 disposition confirmations (delta `66d9520..848b995`)

- **PLAN-R3-01 — FIXED.** Scope item 1's record shape now reads "(id, origin tag, **defect class**, severity, disposition, one-line reason, landing site where applicable)" with the unrecorded-key rationale inline; the binds-forward bar it feeds verified extant at `skills/sdlc/references/phase-pr-review.md:210-217`.
- **PLAN-R3-02 — FIXED.** Scope item 7 is now scoped per prompt: `adversary-spec` inbound-only, `adversary-review` every carry minted in the run (backlog issue ids, `-BUILD`/`-IMPLEMENT` explicitly named as otherwise self-attested), `adversary-plan` carries none and records that as a decision — consistent with D8's destination set.
- **PLAN-R3-03 — FIXED.** Single-source rule added at the head of Delivery DoD; DoD 1/3/4 now verify by reference to scope items 1/2/7 respectively (residual exception: new DoD 14 — see finding below).
- **PLAN-R3-04 — FIXED.** Counts removed from DoD 1 and DoD 2a; the term-group enumeration now lives only in scope item 1.
- **PLAN-R3-05 — FIXED.** Assumption 4 restated at ten §5 additions plus one §1 clause with the growth history acknowledged; the count of ten independently verified against scope item 2's enumeration (1 step-2 addition, 6 steps-3–4 additions, 3 step-5 additions).

**Verdict on the claim under hardest scrutiny:** verification-by-reference does **not** make any DoD item unfalsifiable — DoD 1/3/4 each still fail iff the named artifact lacks an element the referenced scope row enumerates, and the lost redundancy had negative yield (it generated 9 drift findings across two rounds and caught nothing). But the claim that rev4 removes the *generator* is overstated in two textually verifiable ways:

### Single-source rule is violated within the commit that adds it, and does not cover counts

- severity: medium
- confidence: high
- location: Delivery DoD — single-source rule block, DoD 13 (final sentence), DoD 14; residually DoD 5, DoD 6, assumption 4
- defect: DoD 13's new assertion "no DoD item re-lists a scope row's contents" is falsified by the same delta that adds it: DoD 14 (added rev4) re-lists a field of scope item 1's record shape ("The finding-record shape includes `defect class`"), and hand-copied cardinalities — exactly PLAN-R3-04's drift mechanism — survive in DoD 5 ("all four columns" ← scope item 6), DoD 6 ("four promoted… six retained" ← scope item 10/D6), and rev4's own restated assumption 4 ("the **ten** additions" ← scope item 2).
- evidence: `git diff 66d9520..848b995` adds both the rule block ("re-listing is the defect generator, so the list is defined once, in Scope") and DoD 14 in the same hunk; DoD 5/6 counts unchanged from rev3 but now sit under the new absolute claim; assumption 4's "ten" is a delta addition.
- impact: the generator is narrowed, not removed — the next scope-row edit that changes a cardinality (an eleventh §5 addition, a fifth spec-gap column) regenerates the round-3 desync class while DoD 13 asserts that class can no longer occur, masking precisely what DoD 13 exists to catch by reading.
- fix: fold DoD 14 into DoD 1's reference (the record shape is already a scope-item-1 term group), convert the counts in DoD 5/6 and assumption 4 to references or mark them as deliberately maintained derived copies, and narrow DoD 13's claim to match.
- tag: NEW

### Rev-header diagnosis overgeneralizes round 3, overstating what the structural fix guards

- severity: low
- confidence: high
- location: rev-header paragraph ("all five round-3 findings were… every one of them a hand-copied enumeration that drifted from its source")
- defect: PLAN-R3-02 was a wrongly-uniform rule applied across three heterogeneous prompts (empty set at plan, misdirected at review), not a hand-copied enumeration; "every one of them" is false for at least that finding, and the single-source rule provides no structural guard against R3-02's class recurring.
- evidence: `docs/reviews/plan-review-iteration-disposition-vocabulary-2026-07-26/consolidated.md:125` records R3-02 as "'carries addressed to **this phase**', which is empty for `adversary-plan`… and scopes `adversary-review` away from `-BUILD`/`-IMPLEMENT`/`-BACKLOG`" — a scoping-logic defect; the single-source rule governs only DoD-vs-scope duplication.
- impact: a reader auditing rev4's de-duplication will over-trust it — a future uniform edit across the three prompts (scope item 7's known hand-sync surface, per assumption 3) has no generator-level guard, contrary to the header's claim.
- fix: narrow the sentence to the four enumeration-drift findings and name R3-02 as fixed by instance, not by generator.
- tag: NEW

CLEAR: B — objectives and outcomes untouched by the delta; every rev4-changed DoD item retains a verification path (read-and-dereference against a named scope row).
CLEAR: C — the delta's only scope change (item 7's per-prompt re-scope) tightens coherence with D8 rather than widening; one-spec sizing unchanged.
CLEAR: D — no locked decision (D1–D12) is reopened or contradicted by the delta; the per-prompt carry surfaces implement D8's destination topology exactly.
CLEAR: E — the delta introduces no new unnamed risk or dependency; it explicitly names one previously implicit (self-attested `-BUILD`/`-IMPLEMENT` checkpoints, backstopped at `adversary-review`).
CLEAR: F — track remains **irreversible**, unchanged and correct; nothing in the delta alters what shapes freeze.
