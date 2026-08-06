# spec_review round 2 (delta, wave 2) — google/gemini-3.1-pro-preview:xhigh

Target: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `be21293`
(delta `c0e8d22..be21293`). Verbatim reviewer output (5 findings, one tagged
REOPENED with new evidence).

### REOPENED(SPEC-R1-05) Spec §...
(no output)
### REOPENED(SPEC-R1-05) Spec §1 claims A2 is marked in the Plan, but Plan row 11 lacks the in-place marker
- severity: medium
- confidence: high
- location: Spec §1 A2 / Plan scope row 11
- defect: Spec §1 claims the A2 amendment is "recorded here and marked in the Plan itself", but Plan scope row 11 and DoD 9 were modified without the required `AMENDED, class (b)` marker pointing back to the downstream record.
- evidence: Spec §1 A2 vs `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:127` (which updates the text but omits the marker).
- impact: The Spec makes a false claim, and violates C4(b)'s own "amend in place" rule (added specifically to prevent this) that downstream amendments must leave an explicit in-place marker in the Plan.
- fix: Add an explicit `AMENDED, class (b)` marker to Plan scope row 11 and DoD 9 pointing to Spec §1 A2.
### NEW Outbound CARRY-TO-BACKLOG statement in PR review is ungated
- severity: high
- confidence: high
- location: Spec §3 C3 / Spec §5 IDV26
- defect: C3 specifies that `phase-pr-review.md` §5 mints the outbound `CARRY-TO-BACKLOG` disposition. However, no mechanical scenario gates that this explicit outbound statement is written into `phase-pr-review.md` §5.
- evidence: IDV26 only gates `CARRY-TO-SPEC` (in Plan) and `CARRY-TO-BUILD` (in Spec). IDV13 asserts only the *checkpoint* for the backlog, not the outbound statement.
- impact: The PR review phase could fail to explicitly state its ability to mint `CARRY-TO-BACKLOG`, leaving the orphan rule unenforceable at its source.
- fix: Expand IDV26 to also assert that `phase-pr-review.md` §5 contains the `CARRY-TO-BACKLOG` outbound statement.
### NEW Unrecorded Plan amendments for id format and disposition set
- severity: medium
- confidence: high
- location: Spec §2 / Spec §7 Assumption 4 / Plan Scope 1
- defect: Plan Scope 1 locks the id format to `<panelPhase>-R<round>-<nn>` and the disposition set to exactly four values. Spec §2 changes these to `<PREFIX>-R<round>-<nn>` (with a prefix mapping) and a five-value set (`barred`), but does so silently or via Assumption 4, rather than using a formal class (b) Plan amendment.
- evidence: Spec §2 changes the id format and adds `barred`. Plan Scope 1 explicitly lists the original format and the 4-value set. Spec §7 Assumption 4 tries to justify `barred` as an assumption.
- impact: Contradicts the Plan's locked Scope 1 and D11/D12. Assumptions cannot override explicitly locked Plan scope without a formal amendment.
- fix: Formalize the id prefix mapping and the addition of `barred` as class (b) Plan amendments (e.g., A3 and A4) and amend the Plan in-place.
### NEW Implement fallback under review.tasks: off is weakly gated
- severity: medium
- confidence: high
- location: Spec §3 C3 / Spec §5 IDV12
- defect: C3 requires `phase-implement.md` §5 to state a fallback rule routing the carry obligation to the PR panel when `review.tasks: off`. IDV12 requires "§5 block" to appear, but does not explicitly assert the fallback clause.
- evidence: Spec §3 C3: "so §5 states that the obligation then falls to the PR panel's carry-landing surface". IDV12 lacks a distinctive check for this fallback statement.
- impact: An implementer could write the primary block but omit the fallback clause, leaving carries dropped and un-gated when tasks are configured off.
- fix: Update IDV12 (or add a new scenario) to explicitly require the fallback clause in `phase-implement.md` §5.
### NEW C4(b) downstream-record-plus-marker rule is not explicitly gated
- severity: medium
- confidence: high
- location: Spec §3 C4(b) / Spec §5 IDV2
- defect: C4(b) introduces the critical rule that a downstream amendment must leave an in-place marker pointing to it. IDV2 gates that the glossary defines "the three amendment classes" but does not explicitly require the marker rule to be part of the definition.
- evidence: Spec §3 C4(b) requires "an in-place marker pointing to it". Spec §5 IDV2 lacks specific phrasing for this rule.
- impact: The precise mechanism added to fix `SPEC-R1-05` might be omitted from the glossary by the implementer because the scenario doesn't strictly require it.
- fix: Update IDV2 to explicitly mention the "downstream record in-place marker" rule.
CLEAR: C — All interfaces, signatures, and routing specifications are buildable as written.
CLEAR: E — Spec composes correctly with the test corpus and workflow framework reality (offline greps, no model calls).
CLEAR: F — NFRs are explicitly bound to mechanical (IDV16, 17, 19, 24, 25) and inspection (IDV18, 20) scenarios.
