# spec_review round 2 (delta, wave 2) — openai-codex/gpt-5.6-luna:xhigh

Target: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `be21293`
(delta `c0e8d22..be21293`). Verbatim reviewer output (10 findings + 17 one-line
prior-fix confirmations).

**Replacement reviewer.** `anthropic/claude-fable-5:xhigh` was the resolved
panelist for this wave and infra-failed twice without returning a verdict
(attempt 1: 124KB of tool output, no findings; attempt 2 after a tightened
effort-budget brief: 3.9KB that was the acceptance-report template echoed back).
Per `phase-pr-review.md` §5 "Reviewer dispatch recovery" the model was retried
once and then replaced with the next untried credentialed candidate in the
`spec_review` prefer list. The failed model does **not** count against the
panel floor; the wave met `panelSize: 2` with gemini + luna.

### NEW — Rev2 silently widens the Plan’s locked disposition set
- severity: high
- confidence: high
- location: Spec §2; Plan D12 and Scope item 1
- defect: Rev2 adds `barred` as a fifth disposition, while the approved Plan still defines exactly four dispositions and says the slice does not re-argue D1–D12. Neither A1 nor A2 records this amendment.
- evidence: Spec `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:52-65`; Plan `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:30-42,95,116`.
- impact: Implementers have contradictory legal vocabularies; the frozen disposition shape changes without an in-place Plan amendment.
- fix: Amend Plan D12, Objective, and Scope item 1 in place with a class-(b) record/marker and gate that reconciliation.
### NEW — A1 leaves a stale template pointer in the Plan Objective
- severity: medium
- confidence: high
- location: Spec §1 A1; Plan Objective
- defect: A1 says scope item 6 is folded into `phase-tasks.md` and no template is touched, but the Plan Objective still requires `phase-tasks.md §4 + templates/sdlc-tasks.md`.
- evidence: Spec `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:28-34`; Plan `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:43-48,122`.
- impact: The amended Plan still directs its next reader toward the nonexistent/non-template path; IDV14 does not detect this contradiction.
- fix: Amend the Plan Objective pointer in place and include it in A1’s consistency gate.
### NEW — `CARRY-TO-IMPLEMENT` has no outbound minting owner
- severity: high
- confidence: high
- location: Spec C3/C5
- defect: C5 permits a Build-plan Spec-gap row with disposition `CARRY-TO-IMPLEMENT`, but C3 says `phase-tasks.md` has no outbound carry and assigns only the inbound `CARRY-TO-BUILD`.
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:136-142,184-190`; IDV26 only checks Plan/Spec outbound statements at `:280`.
- impact: A legal disposition can be emitted by no defined phase, with no outbound configuration rule or scenario.
- fix: Make `phase-tasks.md §8` the configured outbound owner and add it to the outbound gate, or remove that disposition and specify its source.
### NEW — The C4(b) in-place marker rule is ungated
- severity: medium
- confidence: high
- location: Spec C4(b), IDV2/IDV9
- defect: Rev2 requires a later-phase amendment to leave an in-place marker in the amended artifact, but IDV2/IDV9 only require that amendment classes appear; no scenario checks the marker or its target.
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:166-171,256,263-264`.
- impact: An amendment record can remain discoverable only downstream while all stated mechanical scenarios pass.
- fix: Add a scenario asserting the upstream marker points to the downstream amendment record and carries the required fields.
### NEW — The `review.tasks: off` carry fallback is not gated
- severity: medium
- confidence: high
- location: Spec C3 fallback and IDV12/IDV15
- defect: C3 requires the PR carry-landing surface to take over when task validation is off, but IDV12 checks only normal §4/§5 placement and IDV15 checks only prompt presence.
- evidence: Spec `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:144-150,266,269`; actual framework contract says `off` has no PASS gate at `skills/sdlc/references/phase-implement.md:69-76`.
- impact: An implementation can omit the fallback while claiming “No configuration leaves the carry unchecked.”
- fix: Add an IDV scenario requiring the explicit `review.tasks: off` fallback in `phase-implement.md §5` and its PR-panel landing obligation.
### NEW — C2 row 5 does not gate amendment of the existing escalation sentence
- severity: medium
- confidence: high
- location: Spec C2 row 5 and IDV5
- defect: IDV5 checks that a distinctive collision phrase exists somewhere in §5, not that the existing “Only … escalate” sentence is amended; an implementation can append a third rule and leave the contradictory sentence unchanged.
- evidence: Spec `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:120,259`; existing sentence at `skills/sdlc/references/phase-pr-review.md:205-207`.
- impact: The exact contradiction identified by SPEC-R1-06 can survive while IDV5 passes.
- fix: Require the scenario to inspect the anchored existing sentence and verify that ratified-decision collisions are its third exception.
### NEW — The finding-class alias is not gated at its required location
- severity: medium
- confidence: high
- location: Spec C2 row 13 and IDV2/IDV5
- defect: C2 requires the alias sentence at the existing binds-forward text, but IDV2 checks only the glossary and IDV5 only checks phrase presence somewhere in §5.
- evidence: Spec `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:128,256,259`; existing binds-forward text at `skills/sdlc/references/phase-pr-review.md:209-217`.
- impact: The old `finding class` text can remain unlinked to `defect class` at the point where consumers use it.
- fix: Add a location-specific assertion for the alias in the existing binds-forward paragraph.
### NEW — C5’s allowed enum values are absent from IDV14
- severity: medium
- confidence: high
- location: Spec C5 and IDV14
- defect: C5 freezes severity values `blocker|minor` and disposition values `backward-transition|assumption-recorded|CARRY-TO-IMPLEMENT`, while IDV14 checks only column presence, explicit “none,” and inbound source.
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:184-190,268`.
- impact: A log using arbitrary severity/disposition values satisfies the stated gate and freezes an incompatible record shape.
- fix: Make IDV14 assert the exact allowed enum values.
### NEW — Coverage arithmetic and the C8 mechanical-coverage claim are false
- severity: medium
- confidence: high
- location: Spec §5 coverage summary
- defect: IDs 1–28 contain 24 mechanical scenarios, 3 inspection scenarios, and 1 diff-inspection scenario, not 23/4/1; additionally C8 is covered only by diff-inspection IDV21, contradicting “every C1–C8 has ≥1 mechanical scenario.”
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:253-282,284-286`.
- impact: The summary misstates verification completeness exactly where the spec claims coverage.
- fix: Correct the arithmetic and state that C8 is intentionally diff-only.
### NEW — N5’s universal consumer-compatibility claim is not falsifiable
- severity: medium
- confidence: high
- location: Spec N5/IDV20
- defect: “Nothing a consumer repo has committed becomes invalid” names no consumer corpus, paths, compatibility rules, or inspection procedure; a panel cannot falsifiably establish this universal claim.
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:245,274`; the Plan explicitly excludes consumer repos at `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:138-139`.
- impact: IDV20 can pass by opinion while unsupported consumers break.
- fix: Bound N5 to named repositories/surfaces with an explicit compatibility inspection, or narrow the claim to this repository.
CONFIRMED: SPEC-R1-01 — incorporated by IDV26 requiring Plan/Spec outbound carry statements.  
CONFIRMED: SPEC-R1-02 — incorporated by removing the hand-copied C2 count and making IDV5 row-based.  
CONFIRMED: SPEC-R1-03 — incorporated by permitting local git and making runtime advisory.  
CONFIRMED: SPEC-R1-04 — incorporated by A2, narrowed N1, and IDV24.  
CONFIRMED: SPEC-R1-05 — incorporated by Plan in-place markers and the downstream-marker rule.  
CONFIRMED: SPEC-R1-06 — incorporated as C2 row 5’s escalation amendment.  
CONFIRMED: SPEC-R1-07 — incorporated by the explicit `finding class`/`defect class` alias.  
CONFIRMED: SPEC-R1-08 — incorporated by the closed panel-phase prefix mapping.  
CONFIRMED: SPEC-R1-09 — incorporated by adding `barred` to the disposition set.  
CONFIRMED: SPEC-R1-10 — incorporated by correcting carry pointers to C3.  
CONFIRMED: SPEC-R1-11 — incorporated by the diff-inspection kind and revised coverage table.  
CONFIRMED: SPEC-R1-12 — incorporated by `origin:` in all three STRICT formats and IDV28.  
CONFIRMED: SPEC-R1-13 — incorporated by Implement §4 landing, §5 blocking, and the off fallback text.  
CONFIRMED: SPEC-R1-14 — incorporated by allowing decomposition or inbound-carry origins.  
CONFIRMED: SPEC-R1-15 — incorporated by IDV27’s Assumptions-appendix route.  
CONFIRMED: SPEC-R1-16 — incorporated by exempting terminal backlog from configuration callouts.  
CONFIRMED: SPEC-R1-17 — incorporated by mechanical IDV25 glossary line counting.
