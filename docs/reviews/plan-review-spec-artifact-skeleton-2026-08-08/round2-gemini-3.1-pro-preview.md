PLAN-R1-01: fixed — Objective updated to panel enforcement; In-scope 3 added unfreeze and prompt updates; Out and DoD 5 updated.
PLAN-R1-02: fixed — In-scope 4 and Context require normative-references.json row.
PLAN-R1-03: fixed — DoD 3 asserts the scenario form is present as "literal fill-in blocks".
PLAN-R1-04: fixed — Objective recasts to "omissions become explicit, structured, and reviewable... spec panel enforces".
PLAN-R1-05: fixed — Assumption 4 scopes boundary to authoring prose and names the exact permitted change classes.
PLAN-R1-06: fixed — In-scope 1 and 2 define split as "introduces or modifies" vs "unchanged context".
PLAN-R1-07: fixed — In-scope 5 and DoD 7 state explicit budgets (<1s offline; 30s npm test timeout) and name the linter (biome).

### Contradictory prompt instructions regarding binding rules

- severity: high
- confidence: high
- location: In-scope 3 vs DoD 3
- defect: In-scope 3 explicitly forbids the prompt from restating the skeleton/rules ("reference, never restate"), but DoD 3 mandates that contract tests assert the binding rules are present in all three surfaces, including the prompt attack surfaces. A test cannot assert rules are present in a file that is forbidden from restating them.
- evidence: In-scope 3 restricts the prompt to "(reference, never restate — the skeleton stays the single source of truth)". DoD 3 demands "Contract tests assert the rules are present in all three surfaces (`phase-spec.md` §4, the skeleton, the prompt attack surfaces)".
- impact: The implementation agent will face an unresolvable contradiction: either restate the rules to pass the contract tests (violating In-scope 3), or keep the prompt purely referential (failing DoD 3).
- fix: Change DoD 3 to assert that the prompt contains the references to the skeleton components, not the rules themselves.

CLEAR: A — all DoD items are falsifiable.
CLEAR: B — outcomes (explicit omissions, reviewer enforcement) are now observable and verifiable.
CLEAR: C — in and out of scope bounds are coherent and manage the frozen-surface boundary explicitly.
CLEAR: D — unfreezing the prompt respects the established deliberate-change precedent.
CLEAR: E — inventory row and unfreeze dependencies are explicitly required and scheduled.
CLEAR: F — artifact shape changes are properly routed to the irreversible track.
CLEAR: PROPORTIONALITY — time/cost budgets are stated and plausible (<1s for offline contract tests, 30s external timeout for npm test).

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Verification of prior findings and discovery of new high-severity defect regarding prompt rule contradiction."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "git diff 756f929..832e182 -- docs/plans/2026-08-08-spec-artifact-skeleton.md",
      "result": "passed",
      "summary": "verified delta for changes"
    }
  ],
  "validationOutput": [],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "no modifications made (read-only task)",
  "reviewFindings": [
    "PLAN-R2-01: high: docs/plans/2026-08-08-spec-artifact-skeleton.md (In-scope 3 vs DoD 3) - Contradictory prompt instructions regarding binding rules."
  ],
  "manualNotes": ""
}
```