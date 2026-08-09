### M2 does not enforce C2’s immediate §4 insertion

- severity: medium
- confidence: high
- origin: REOPENED(SPEC-R3-03)
- location: `docs/specs/2026-08-08-spec-artifact-skeleton.md:71,128,225-226`
- defect: C2 requires the rules paragraph immediately after §4’s first paragraph and requires existing paragraphs to remain intact. Rev 4’s M2 only checks that a paragraph appears somewhere afterward and that existing paragraphs merely begin with expected anchors.
- evidence: C2 says “inserted immediately after” (`:71`), while M2 permits placement “after ... and before” (`:128`); SAS2 repeats the weaker condition (`:225-226`). SAS9 permits any hunk within `phase-spec.md §4` (`:267`).
- impact: An extra paragraph could be inserted or existing paragraph bodies altered while M2 and SAS2 pass, freezing a shape that contradicts C2.
- fix: Require M2 to assert immediate adjacency and exact bodies for the rules and existing §4 paragraphs.

FIX CONFIRMED — SPEC-R3-01: M1 now asserts exact section set and locality (`:127`), reflected in SAS1 (`:219-220`).

FIX CONFIRMED — SPEC-R3-02: C1 pins all four canonical sentences and M1 checks ownership (`:58-61,127`).

FIX CONFIRMED — SPEC-R3-03: M2 adds literal placement/order anchors and SAS2 describes them (`:128,225-226`).

FIX CONFIRMED — SPEC-R3-04: M7/SAS7 require the AM1/AM3 re-freeze comment (`:133,255-256`).

FIX CONFIRMED — SPEC-R3-05: M6 pins L3’s exact order (`:132`); removing the pre-C5 prompt entry at `test/frozen-surfaces.test.js:30` yields L3 exactly.

FIX CONFIRMED — SPEC-R3-06: L1/L2 are pinned (`:138-163`); both match `adversary-spec.prompt.md:32-49` byte-for-byte after newline normalization.

CLEAR: A — L3 matches the specified post-C5 target; current extra entry is expected before C5.

CLEAR: E — No framework-behaviour defect found.

CLEAR: F — NFRs remain scenario-bound or explicitly unbound.

CLEAR: G — No additional overclaim found.

CLEAR: H — The plan mints no carry.

BLOCKING FINDING: REOPENED(SPEC-R3-03) — M2 does not enforce C2’s immediate insertion or intact paragraph bodies; rev 4 is not gate-ready.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "not-applicable",
      "evidence": "This was a read-only specification review, not an implementation task."
    }
  ],
  "changedFiles": [
    "docs/specs/2026-08-08-spec-artifact-skeleton.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "git diff --stat 1af8348^ 1af8348",
      "result": "passed",
      "summary": "Only the rev-4 specification document changed."
    },
    {
      "command": "Direct L1/L2/L3 byte comparison",
      "result": "passed",
      "summary": "L1/L2 exact; L3 exact after the specified C5 removal."
    },
    {
      "command": "git status --short",
      "result": "passed",
      "summary": "No staged or working-tree changes."
    }
  ],
  "validationOutput": [
    "L1 and L2 match the prompt; current FROZEN includes the expected pre-C5 extra spec-prompt entry."
  ],
  "residualRisks": [
    "M2 does not fully gate C2's immediate placement and unchanged paragraph-body requirements."
  ],
  "noStagedFiles": true,
  "diffSummary": "Reviewed the six rev-3 to rev-4 amendments and found one lawful reopened contract-test gap.",
  "reviewFindings": [
    "medium: docs/specs/2026-08-08-spec-artifact-skeleton.md:128 - M2 does not enforce immediate §4 placement or intact existing paragraph bodies."
  ],
  "manualNotes": "Rev 4 is blocked by REOPENED(SPEC-R3-03)."
}
```