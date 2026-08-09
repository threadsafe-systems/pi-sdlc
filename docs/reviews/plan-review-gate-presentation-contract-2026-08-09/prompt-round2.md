# Task for pi-sdlc-plan-review

You are reviewing a REVISED PLAN document for the pi-sdlc repo at /home/neil/code/threadsafe/pi-sdlc (main, commit 1d1af2c). This is a DELTA review — round 2 of the plan panel.

ARTIFACT: docs/plans/2026-08-09-gate-presentation-contract.md (rev 2). The delta is commit 1d1af2c vs 00b3322 on that file (git diff 00b3322..1d1af2c -- docs/plans/2026-08-09-gate-presentation-contract.md), but you may read the whole file for context.

ROUND 1 FINDINGS AND THEIR ADJUDICATED FIXES (all 11 incorporated; records under docs/reviews/plan-review-gate-presentation-contract-2026-08-09/ — round1.md consolidation, adjudication.md):
R1-01 (high): panel-scope check delegated to authoring prose — FIXED by rewording In-scope 4 to a doc-side requirement only; enforcement routed by reference to adversary-plan.prompt.md attack surface D (locked decisions); the prompt stays untouched (it is frozen; verify no edit to it is implied anywhere).
R1-02 (high): §4 first-paragraph enumeration omitted provenance — FIXED: In-scope 4 + DoD 2 require extending the enumeration.
R1-03 (high): standalone Plan has no upstream — FIXED: rule qualified (Plans entered from Brainstorm carry the block; standalone Plans record live-formed intent + "no upstream gate" declaration).
R1-04 (medium): G4 fold vs anti-ceremony constraint — FIXED: In-scope 2 specifies proportionality preserved, named triggers, fired-but-skipped declaration.
R1-05 (medium): map-mode sketch/index ambiguity — FIXED: sketch embeds verbatim in both modes (gate artifact, no ticket); only the decisions list is indexed; full grammar = the three line kinds.
R1-06 (medium): contract-test coverage — FIXED: In-scope 5 enumerates semantic directions; literal anchors deferred to Spec phase (separateSpec=true).
R1-07 (medium): ADR bar absent from scope — FIXED: In-scope 1 adds preserving it by reference to system-reference.md's Governance paragraph (verify that reference exists at system-reference.md around line 268 and that the plan does not restate the criteria).
R1-08 (medium): lifecycle command — FIXED: DoD 7 names the exact bash command and conditions exit 0 on Spec AND Build artifacts.
R1-09 (medium): G7 under-specified — FIXED: one prompt, name constraints or declare "none identified", never bound in Brainstorm.
R1-10 (medium): DoD commands — FIXED: exact commands named in DoD 3-8.
R1-11 (low): Unicode arrow — FIXED: ASCII (-> ADR 00NN) pinned canonical in the grammar line.

YOUR TASK (three parts):
1. Verify each of the 11 fixes landed exactly as adjudicated — quote the rev-2 text proving each. If a fix is missing, partial, or contradicts its adjudication, report it (REOPEN R1-NN).
2. Regression hunt over the rev-2 delta: any NEW defect the edits introduced — internal contradictions between the provenance block, In scope, DoD, and Assumptions; any claim that is now uncheckable; any scope creep beyond the ratified design (contract tests on prose + human gate, nothing more).
3. Dogfood consistency re-check: the plan's own Brainstorm provenance block vs the contract rev 2 now prescribes — including the standalone-exception question (this plan WAS entered from Brainstorm, so the block must be the store; verify).

GROUNDING RULE: every finding cites file:line from the ACTUAL tree with verbatim quoted evidence; re-read before citing; run commands as evidence (npm test, grep, git). No speculation about unopened files.

OUTPUT CONTRACT: findings only — id (REOPEN R1-NN or NEW), severity, file:line, quoted evidence, concrete fix. CLEAR lines per verified fix group. End with one-line verdict: PASS (no high/medium) or FINDINGS.

## Acceptance Contract
Acceptance level: checked
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Implement the requested change without widening scope

Required evidence: changed-files, tests-added, commands-run, residual-risks, no-staged-files

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```