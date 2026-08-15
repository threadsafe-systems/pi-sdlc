### `anchorSentence` still fails to bound `?`/`!`-terminated anchors

- severity: medium
- confidence: high
- origin: REOPENED(PR-R2-01)
- file: test/plan-artifact-skeleton.test.js
- line: 229-238
- problem: The new helper claims to be terminator-bounded on both sides, but its forward search only recognizes a period (`/\.(\s|$)/`); a citation sentence ending in `?` or `!` falls through to the segment end. Required coverage names can therefore drift into a later sentence and still satisfy M3.
- repro_or_impact: In an archived f4ababf copy, changing surface A's citation sentence to end in `?`, removing `Definition of done` and `Carried to` from that sentence, and putting both names in the following sentence still yielded 29/29 passing contract tests. Any future anchor using a question/exclamation terminator can bypass PAS4/C7's sentence-local coverage guard.

### Round-3 consolidated record is committed as future/process narration

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md
- line: 73-78
- problem: The newly committed Round 3 section calls the target “the wave-2 head,” sends the exact SHA to an external dispatch/harvest meta, and says the section “is appended when its verdicts land.” This leaves a durable review record explicitly unfinished and dependent on unavailable process metadata rather than stating the actual reviewed range and disposition.
- repro_or_impact: A repository reader at f4ababf cannot determine Round 3's exact delta from this file, and the pending sentence becomes stale as soon as the verdict section is appended—the same record-integrity failure that PR-R2-03 corrected for Round 2.

- CLEAR: PR-R2-02 — `.tmp-t3-report.json` is deleted in f4ababf (delta deletion; no tracked root scratch report remains).
- CLEAR: PR-R2-03 — the Round 2 record now names `2f8be30..482bd95` and contains adjudicated dispositions at `docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:52-71`.
- CLEAR: PR-R1-01 — Plan/Spec approval status is resolved at `docs/plans/2026-08-14-plan-artifact-skeleton.md:3` and `docs/specs/2026-08-14-plan-artifact-skeleton.md:3`.
- CLEAR: PR-R1-02 — tightened manifest budgets and their class-b record remain present at `docs/plans/2026-08-14-plan-artifact-skeleton-build.md:144-152`.
- CLEAR: PR-R1-04/PR-R1-05/PR-R1-07 — prior recorded/deferred dispositions are unchanged and not reopened; the governing rationale remains at `docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:33-36`.
- CLEAR: carry landing — the Plan and Spec explicitly mint no inbound carry (`docs/plans/2026-08-14-plan-artifact-skeleton.md:127`, `docs/specs/2026-08-14-plan-artifact-skeleton.md:41-43`); no new carry is minted by this delta.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Two concrete delta findings are reported with severity, confidence, origin, committed file paths, line ranges, and reproductions; prior fix surfaces and carry landing were rechecked."
    }
  ],
  "changedFiles": [
    ".tmp-t3-report.json",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-deepseek-v4-pro.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-gpt-5.6-luna.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-gpt-5.6-sol.md",
    "test/plan-artifact-skeleton.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/plan-artifact-skeleton.test.js"
  ],
  "commandsRun": [
    {
      "command": "node --test test/plan-artifact-skeleton.test.js",
      "result": "passed",
      "summary": "29 tests passed at f4ababf."
    },
    {
      "command": "node --test test/iteration-disposition.test.js",
      "result": "passed",
      "summary": "30 tests passed at f4ababf."
    },
    {
      "command": "archived f4ababf copy with '?' anchor mutation plus node --test test/plan-artifact-skeleton.test.js",
      "result": "passed",
      "summary": "29 tests passed despite moving required names after the citation sentence."
    },
    {
      "command": "git diff --check 482bd95..f4ababf",
      "result": "passed",
      "summary": "No whitespace errors."
    },
    {
      "command": "git status --short --untracked-files=all",
      "result": "passed",
      "summary": "Working tree clean."
    }
  ],
  "validationOutput": [
    "The f4ababf focused contract and iteration suites are green (29/29 and 30/30).",
    "The '?' terminator mutation is a reproducible false negative in M3.",
    "The scratch report deletion and corrected Round 2 range are present in the committed tree.",
    "No formal CARRY-TO-* was minted by this delta; Plan/Spec carry declarations remain empty."
  ],
  "residualRisks": [
    "M3 remains vulnerable when an anchor citation sentence ends with '?' or '!'.",
    "The committed Round 3 consolidated section remains pending and externally keyed.",
    "PR-R1-05 owner escalation and the post-merge re-freeze/#146 closure remain open lifecycle obligations."
  ],
  "noStagedFiles": true,
  "diffSummary": "The delta bounds anchor extraction at a period, removes the root scratch report, and records Round 2 artifacts/adjudication; it leaves punctuation and Round 3 record-integrity gaps.",
  "reviewFindings": [
    "medium: test/plan-artifact-skeleton.test.js:229-238 - anchorSentence ignores '?'/'!' terminators, so forward drift still passes for those anchors",
    "low: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:73-78 - Round 3 record is unfinished future/process narration"
  ],
  "manualNotes": "PR-R2-02 and PR-R2-03's Round 2 range correction are confirmed. PR-R2-01 is reopened because the new terminator implementation handles only periods."
}
```
