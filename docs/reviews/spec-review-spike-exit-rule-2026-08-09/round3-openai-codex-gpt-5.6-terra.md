### Durable panel-budget evidence is absent

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md:310-342`
- defect: SER13 and SER14 impose time/model-call budgets but require no durable record of output availability, start/end times, or model-call count. Their falsifiers therefore cannot be decided after merge.
- evidence: SER13 preserves only SHA, inventory, and verdict (lines 312-322) while falsifying a five-minute overrun (line 327); SER14 claims its URL/review record remains falsifiable (lines 334-342) without requiring timing or call evidence. `skills/sdlc/references/phase-spec.md:61-65` requires scenarios to remain falsifiable after merge.
- impact: The new proportionality budgets can be exceeded while the required durable record remains green, making the claimed gate non-falsifiable.
- fix: Require the committed PR-review record to attest panel-output availability, adjudication/host-action start and finish, and model-call counts, and make those fields SER13/SER14 prerequisites.

CLEAR: A — Wave-2 #147 anchor and heading-boundary changes match the ratified Plan.
CLEAR: C — C1/C5 now consistently retain deeper headings and stop at the next level-3-or-shallower heading.
CLEAR: D — Rev-3 status contains no panel-history narrative; terminology and route order match Plan rev 4.
CLEAR: E — No new framework-composition claim was introduced by this documentation-only delta.
CLEAR: F — Every NFR table row retains a response measure and scenario binding.
CLEAR: H — No `CARRY-TO-SPEC` was minted; the parked follow-up remains carried to `pr_review`.
