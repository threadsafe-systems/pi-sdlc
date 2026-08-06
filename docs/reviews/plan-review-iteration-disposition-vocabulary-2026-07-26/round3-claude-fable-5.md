# plan_review round 3 (delta) — anthropic/claude-fable-5:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `66d9520`
(delta `bd19184..66d9520`). Verbatim reviewer output.

---

### Rev3's own R2 fixes are invisible to the DoD — the sweep updated scope rows but not the DoD items that verify them

- severity: medium
- confidence: high
- location: DoD items 3 and 4 (plan lines 178–183) vs scope items 2 and 7 (lines 106, 112)
- defect: NEW. Scope item 2 gained two deliverables in rev3 — id minting was already there, and the **backlog checkpoint** ("no PR gate passage while a `CARRY-TO-BACKLOG` lacks a filed issue id") is new — but DoD 3's enumeration of what `phase-pr-review.md` §5 must state is unchanged from rev2: "delta-dispatch obligation, per-row tagging, ratified-collision escalation, dismissal-posture rule, trim-the-tail, round-4 cap…, artifact-inventory self-audit" — no backlog checkpoint, no id minting. Likewise scope item 7 and Objective bullet 3 gained the **inbound-carry attack surface** (the PLAN-R2-02 fix), but DoD 4 still requires only "the static delta-round law and their phase's legal carry destinations."
- evidence: plan lines 178–181 (DoD 3 list), 182–183 (DoD 4), line 106 (scope 2 with "**backlog checkpoint**"), line 112 (scope 7 with "**Plus an inbound-carry attack surface**"), Objective bullet 3 ("the tagging law **and the inbound-carry check** inline"). DoD 12 binds the backlog checkpoint at plan level but names only "scope items 4, 5, 5b, plus the backlog checkpoint in scope item 2" — scope 7's prompt surface appears in no DoD item at all.
- impact: prompts delivered without the inbound-carry surface, and a §5 delivered without id minting or the backlog rule, pass every DoD item — the two fixes that answered PLAN-R2-01 and PLAN-R2-02 become unverifiable at merge, which is exactly the incomplete-propagation failure mode the sweep existed to end (DoD 13's own claim).
- fix: add "id minting" and "the backlog checkpoint" to DoD 3's list and "and the inbound-carry attack surface" to DoD 4.

### The inbound-carry attack surface is vacuous in two of the three prompts it was added to

- severity: medium
- confidence: high
- location: scope item 7 (plan line 112): "verify that every carry **addressed to this phase** has landed in its named artifact"
- defect: NEW (defect in the rev3 fix's wording, not a re-litigation of PLAN-R2-02). The glossary's destination set is `CARRY-TO-SPEC` / `-BUILD` / `-IMPLEMENT` / `-BACKLOG` (D8); no `CARRY-TO-PLAN` or `CARRY-TO-PR-REVIEW` exists anywhere in the plan. So "carries addressed to this phase" is a non-empty set only for `adversary-spec`. `adversary-plan` gets a check over an empty set, and `adversary-review` — the only prompt sitting at a gate downstream of Build and Implement — is scoped away from precisely the carries whose checkpoints are agentless self-attestations: `CARRY-TO-BUILD` blocks Build's completion evidence (Build has no gate — `phase-tasks.md:83-86`) and `CARRY-TO-IMPLEMENT` blocks task close, both attested by the implementing agent with no adversarial backstop.
- evidence: plan line 112; D8 row (destinations and checkpoint kinds); `phase-tasks.md:83-86` ("Build has **no gate of its own** … validated downstream"); `phase-pr-review.md` §5 (the PR panel is the last agent-run gate).
- impact: PLAN-R2-02's dead-letter concern survives for two of four destinations: an unlanded `CARRY-TO-BUILD` or `-IMPLEMENT` is never seen by any reviewer, only by the same agent that failed to land it — the wording defeats the fix's stated purpose ("the agent-run gates meant to enforce it").
- fix: reword `adversary-review`'s surface to verify **every carry minted upstream in this run** (visible in the consolidated files and the spec-gap log) has landed, and drop or mark vacuous the surface in `adversary-plan`.

### Term-group count is internally inconsistent three ways: DoD 1 says seven, enumerates eight, DoD 2a still says six

- severity: medium
- confidence: high
- location: DoD 1 (plan lines 165–169) and DoD 2a (line 174)
- defect: NEW. DoD 1 claims "all seven term groups" then enumerates eight coordinate items (origin tags, dispositions, `defect class` pointer, reopen bar, finding-record shape + id format, carry destinations + no-orphan, ratified collision, amendment classes). DoD 2a's boundary rule still reads "the six term groups' defining sentences belong to the glossary" — rev2's count, which the sweep failed to propagate when it split "classes" into three nouns per D12.
- evidence: plan line 166 ("all seven term groups —" followed by an eight-item list); line 174 ("the six term groups'"); the round-2 record itself asserts "DoD 1 now lists seven term groups" (`docs/reviews/plan-review-iteration-disposition-vocabulary-2026-07-26/consolidated.md`, PLAN-R2-08 disposition) — the disposition and the delivered text disagree with each other and with 2a.
- impact: DoD 1 is the merge-time falsifiability check on the glossary's completeness and DoD 2a is the non-duplication boundary; with three different counts a spec author cannot determine which groups the boundary covers, and DoD 13's "no document-internal contradiction survives" is falsified by the DoD list itself — the sweep's headline claim.
- fix: pick one count (eight as enumerated, or restructure the list to match seven) and use it identically in DoD 1 and DoD 2a.

### Assumption 4 still budgets "~5 additions" to §5 against a scope row now carrying ten plus a §1 clause

- severity: low
- confidence: high
- location: assumption 4 (plan line 141) vs scope item 2 (line 106)
- defect: NEW. Scope item 2 now enumerates ten §5 additions (delta-dispatch, id minting, origin tagging, ratified-collision escalation, dismissal-posture, trim-the-tail + sub-floor exemption, backlog checkpoint, round-4 cap, churn diagnosis, artifact-inventory self-audit) plus the §1 bridging clause; assumption 4 — the ratified guard against §5 outgrowing a readable reference — was not updated by the sweep and still says "~5 additions."
- evidence: plan line 141 ("can absorb ~5 additions"); line 106 (scope 2's enumeration).
- impact: the size-risk assumption ratified at this gate understates the actual load by roughly 2×, and DoD 13 asserts scope rows and assumptions agree; a spec author relying on assumption 4 will underestimate whether the §5 sub-structure escape hatch is needed.
- fix: update assumption 4's count to match scope item 2 (≈10 additions plus one §1 clause).

Prior-fix confirmations (one line each):

- PLAN-R2-01: fixed — D8, scope 2, and DoD 12 all carry the backlog checkpoint ("PR gate not passable until the issue is filed and its id recorded"); terminal destinations included in DoD 12.
- PLAN-R2-02: fix present in scope 7 / Objective 3, but see findings 1–2 above for the wording and DoD-coverage defects the fix introduced.
- PLAN-R2-03: fixed — D12's three nouns applied consistently across Objective 1, scope 1, scope 2 ("origin tagging"), and DoD 1; remaining uses of "class" ("recurring classes", `phase-pr-review.md:209-217` binds-forward key) all mean defect class.
- PLAN-R2-04: fixed — Objective bullet 2 now says §5 for Plan/Spec, §8 for Build, and lists `phase-implement.md`.
- PLAN-R2-05: fixed — scope 5 moves the Build amendment citation to §8 with the renewed-approval subject; assumption 5 amended to match; `phase-tasks.md:83-86` confirms §5 is "no gate."
- PLAN-R2-06: fixed — DoD 12 now says "**scope** items 4, 5, 5b."
- PLAN-R2-07: fixed — heading reads "D1–D10 brainstorm-ratified; D11–D12 minted at plan review"; both review-minted rows carry "*plan review, not brainstorm*."
- PLAN-R2-08: fix landed (D11 split term/mechanic; id format in DoD 1's list) but introduced the count defect in finding 3 above.
- PLAN-R2-09: fixed — scope 2's §1 bridging clause targets the verified "never below them" sentence (`phase-pr-review.md:21`) and defines floors as governing full rounds.

CLEAR: C — in/out boundaries unchanged in the delta and still coherent; the rev3 additions (backlog checkpoint, prompt surface, §1 clause) are clauses, not new scope, and the slice remains one spec's worth.
CLEAR: D — no locked decision reopened silently; every delta change to a D-row (D8, D11) carries its plan-review provenance, and D12 was minted additively with explicit source.
CLEAR: F — irreversible track claimed and consistent; the frozen-prompt reopen is handled via D9 + scope 8 + DoD 7 with the named re-freeze follow-up, matching `test/frozen-surfaces.test.js:14-38`'s actual FROZEN list.
CLEAR: PROPORTIONALITY — scope 9 states an explicit budget (offline greps per `test/phase-references.test.js:4`, no new CI job, <2s suite delta); the round-4 cap and trim-the-tail bound panel spend; the unbounded-CI gap is named and parked, not hidden.
