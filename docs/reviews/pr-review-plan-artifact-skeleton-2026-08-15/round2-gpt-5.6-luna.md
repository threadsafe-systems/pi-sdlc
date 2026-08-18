### Committed temporary validation error report violates the permitted diff boundary

- severity: medium
- confidence: high
- origin: NEW
- file: .tmp-t3-report.json
- line: 1-15
- problem: The delta commits a root-level temporary report outside the configured review/validation artifact homes; its payload is an `ERROR` (exit 2) with a manifest error, while the committed T3 bundle is a PASS. PAS10 permits lifecycle evidence only under the configured homes, so this extra root file is outside the approved change classes.
- repro_or_impact: `git diff --name-only 2f8be30..482bd95` includes `.tmp-t3-report.json`, and the file records a non-portable absolute worktree path plus a failed validation result. Keeping it makes the PR fail the stated whole-diff boundary and leaves contradictory validation evidence in the branch; remove the temporary file.

- CLEAR: PR-R1-01 — Plan and Specification status lines now record owner approval on 2026-08-14.
- CLEAR: PR-R1-02 — source manifests t1–t5 now use the committed 30s/1s/5s budgets; receipt bundles remain internally hash-verifiable and measured durations are inside those budgets.
- CLEAR: PR-R1-03 — M3 now checks required names in the anchor sentence, and the focused contract suite passes.
- CLEAR: PR-R1-06 — IDV19's test name is window-qualified and matches its plan exemption.
- CLEAR: PR-R1-04/05/07 — no reopen: these were recorded/dismissed or owner-escalated prior dispositions without new delta evidence; carry scan found no minted carry.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Found one concrete NEW defect with severity, path, line range, and reproduction impact; rechecked the prior incorporated surfaces against the committed tree."
    }
  ],
  "changedFiles": [
    ".tmp-t3-report.json",
    "docs/plans/2026-08-14-plan-artifact-skeleton-build.md",
    "docs/plans/2026-08-14-plan-artifact-skeleton.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/prompt.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-deepseek-v4-pro.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-gpt-5.6-luna.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-gpt-5.6-sol.md",
    "docs/specs/2026-08-14-plan-artifact-skeleton.md",
    "docs/validation/plan-artifact-skeleton/t1.json",
    "docs/validation/plan-artifact-skeleton/t2.json",
    "docs/validation/plan-artifact-skeleton/t3.json",
    "docs/validation/plan-artifact-skeleton/t4.json",
    "docs/validation/plan-artifact-skeleton/t5.json",
    "test/iteration-disposition.test.js",
    "test/plan-artifact-skeleton.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/iteration-disposition.test.js",
    "test/plan-artifact-skeleton.test.js"
  ],
  "commandsRun": [
    {
      "command": "node --test test/plan-artifact-skeleton.test.js",
      "result": "passed",
      "summary": "29 tests passed"
    },
    {
      "command": "node --test test/iteration-disposition.test.js",
      "result": "passed",
      "summary": "30 tests passed"
    },
    {
      "command": "git diff --check 2f8be30..482bd95",
      "result": "passed",
      "summary": "no whitespace errors"
    },
    {
      "command": "verify-task-receipt.mjs --dir docs/reviews/task-validate-plan-artifact-skeleton-t{1..5}-2026-08-14",
      "result": "passed",
      "summary": "all five committed receipt bundles verified"
    }
  ],
  "validationOutput": [
    "The focused contract and iteration-disposition suites pass at 482bd95.",
    "All five receipt bundles verify internally; the root temporary ERROR report remains a diff-boundary violation."
  ],
  "residualRisks": [
    "The mandatory post-merge re-freeze and #146 closure remain recorded as future orchestrator-owned obligations (PAS15)."
  ],
  "noStagedFiles": true,
  "diffSummary": "Round-1 fix wave tightens lifecycle documents, validation budgets, anchor assertions, and IDV19 naming; round-1 review artifacts are added, along with an erroneous root temporary T3 report.",
  "reviewFindings": [
    "medium: .tmp-t3-report.json:1-15 - committed root-level ERROR report is outside PAS10's permitted artifact homes and contradicts the PASS validation bundle"
  ],
  "manualNotes": "PR-R1-01, PR-R1-02, PR-R1-03, and PR-R1-06 were rechecked clean. PR-R1-04/05/07 were not reopened because no new disposition-time evidence exists. No carries were minted in this run."
}
```
