### M3's anchor-sentence scoping is one-directional: a coverage name drifted into a trailing sentence of the same segment still passes

- severity: medium
- confidence: high
- origin: NEW
- file: test/plan-artifact-skeleton.test.js
- line: 229-235 (helper), 245-247 (assertions)
- problem: `anchorSentence` slices "from the terminator before the citation to the segment end", not to the end of the sentence that carries the citation. The assertion message claims "surface X's anchor sentence must name Y", but the region searched runs from the anchor sentence's start to the end of the whole attack-surface segment, so the PR-R1-03 fix only catches backward drift (name moved into an earlier sentence/heading); drift forward into a sentence added after the anchor sentence still passes.
- repro_or_impact: In a scratch copy at 482bd95 I mutated surface C to `Verify \`objectives\` ... against their definitions in \`references/plan-artifact-skeleton.md\`. Objectives and scope stay pinned.` — the coverage name `Objectives and scope` left the anchor sentence yet `node --test test/plan-artifact-skeleton.test.js` still reported 29/29 pass. The same mutation backward (name moved into the pre-anchor question sentence) correctly fails, so the fix works only in one direction. The consolidated adjudication (docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:38) claims "M3 now scopes name assertions to the anchor sentence" — overstated; PAS4/C7's pinned coverage map remains unenforced against forward drift. Fix: terminate the slice at the first sentence terminator after the citation (and drop the trailing backtick/newline), rather than at segment end.

### Tracked `.tmp-t3-report.json` at repo root ships an ERROR verdict no committed manifest state produces, and contradicts the t3 PASS receipt and the adjudication's re-run PASS claim

- severity: low
- confidence: high
- origin: NEW
- file: .tmp-t3-report.json
- line: 1-15
- problem: The fix-wave commit d81be3e added this dotfile at repo root. It records `verdict: "ERROR"`, `exitCode: 2`, and `manifestErrors: ["/checks/1/evidence/1: evidence labels must be single-line strings (max 160)"]`, but no committed state of docs/validation/plan-artifact-skeleton/t3.json ever produces that error — the evidence label at /checks/1/evidence/1 has been the same 121-character single-line string since b7bdfd0 (limit is 160), so the report is a stale scratch of an intermediate working-tree state, with `commands: []` (it attests no durations) and machine-specific absolute paths baked in. It is tracked (git ls-files) and will merge to main; the round-2 sol reviewer explicitly believed it was "untracked … and will not ship", which is false.
- repro_or_impact: A future auditor finds an ERROR validator verdict at the repo root that contradicts the committed t3 PASS receipt (docs/reviews/task-validate-plan-artifact-skeleton-t3-2026-08-14/runner-report.json) and the consolidated.md PR-R1-02 disposition's "runner re-run PASS under the tightened budgets" claim — for which no other committed artifact exists (the five receipts attest the pre-amendment runs only). Either remove the file from the branch or replace it with the actual re-run PASS report the disposition cites.

### consolidated.md records a round-2 scope narrower than the actual dispatch, and "Verdicts pending" narrates a future state in a committed record

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md
- line: 52-55
- problem: The Round 2 section says "Delta review over `2f8be30..d81be3e`", but the round-2 dispatch actually scopes the delta to `2f8be30..482bd95` (the fix wave plus the review-artifacts commit that contains this very file), so the committed record of the round-2 scope excludes the commit it ships in. The same section ends "Verdicts pending." — future-narrating prose that is stale the moment this round's verdicts land.
- repro_or_impact: Round-2 reviewers (including this one) are instructed to review 2f8be30..482bd95 while the record says 2f8be30..d81be3e, so an auditor cannot tell from the repo which surfaces the round actually covered; the pending-verdicts line will need a rewrite on the next commit that touches this file.

Prior-fix confirmations (one line each): PR-R1-01 RESOLVED (plan:3 and spec:3 both record owner-approved 2026-08-14 with both ratifications). PR-R1-02 RESOLVED (all t1–t5 checks now 30000/1000/5000 per PAS11's committed budgets, schema floor 1000 satisfied; class-b 2026-08-15 amendment recorded at build:141-149; receipt runner reports show measured durations inside budget — t1/t2/t4/t5 plus t3 verified: corpus ≤3.6s, single-file ≤54ms, static ≤244ms). PR-R1-03 PARTIAL (see finding 1: backward drift now caught, forward drift not). PR-R1-04 confirmed recorded-no-fix with the relocation convention documented in consolidated.md. PR-R1-05 still escalated with owner verdict pending (E1) — no code change to verify. PR-R1-06 RESOLVED (IDV19 renamed with the window qualifier; M7's `test("IDV19:` prefix anchor unaffected; iteration suite 30/30 green). PR-R1-07 dismissed with reason — no change made.

CLEAR surfaces re-checked: full corpus 618/618 green at 482bd95 (canonical TMPDIR); biome clean on both changed test files; t1/t2/t4/t5 receipt durations re-measured inside the tightened budgets; carry landing — no `CARRY-TO-*` minted anywhere in the delta (build-plan gap log and spec "Inbound carries: None" still accurate); pr-body.md at the repo root is gitignored/untracked, so its re-freeze component-2 text (IDV19 name restoration) is dispatch context, not branch state.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Three NEW findings returned with file:line and severity (test/plan-artifact-skeleton.test.js:229-235, .tmp-t3-report.json:1-15, docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:52-55), plus one-line confirmations of all seven prior dispositions."
    }
  ],
  "changedFiles": [
    "test/plan-artifact-skeleton.test.js",
    "test/iteration-disposition.test.js",
    ".tmp-t3-report.json",
    "docs/validation/plan-artifact-skeleton/t1.json",
    "docs/validation/plan-artifact-skeleton/t2.json",
    "docs/validation/plan-artifact-skeleton/t3.json",
    "docs/validation/plan-artifact-skeleton/t4.json",
    "docs/validation/plan-artifact-skeleton/t5.json",
    "docs/plans/2026-08-14-plan-artifact-skeleton.md",
    "docs/specs/2026-08-14-plan-artifact-skeleton.md",
    "docs/plans/2026-08-14-plan-artifact-skeleton-build.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/prompt.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-deepseek-v4-pro.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-gpt-5.6-luna.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-gpt-5.6-sol.md"
  ],
  "testsAddedOrUpdated": [
    "test/plan-artifact-skeleton.test.js (M3 anchorSentence helper + scoped assertions)",
    "test/iteration-disposition.test.js (IDV19 window-qualified rename)"
  ],
  "commandsRun": [
    {
      "command": "git diff 2f8be30..482bd95",
      "result": "passed",
      "summary": "delta inspected hunk-by-hunk"
    },
    {
      "command": "node --test test/plan-artifact-skeleton.test.js (scratch mutation repros)",
      "result": "passed",
      "summary": "backward-drift mutation fails (scoping works); trailing-sentence drift mutation passes 29/29 (finding 1)"
    },
    {
      "command": "TMPDIR=/private$TMPDIR npm test",
      "result": "passed",
      "summary": "618/618 green at 482bd95"
    },
    {
      "command": "npx biome check test/plan-artifact-skeleton.test.js test/iteration-disposition.test.js",
      "result": "passed",
      "summary": "clean, no fixes applied"
    },
    {
      "command": "node -e receipt duration sweep over t1/t2/t4/t5 runner-report.json",
      "result": "passed",
      "summary": "all durations inside the tightened budgets (corpus <=3641ms, single-file <=54ms, static <=244ms)"
    }
  ],
  "validationOutput": [
    "schema floor for timeoutMs is 1000; all tightened manifests satisfy it",
    "evidence label at t3 /checks/1/evidence/1 is 121 chars (<=160), so the committed .tmp-t3-report.json ERROR is unproducible from any committed manifest state",
    "git ls-files confirms .tmp-t3-report.json is tracked at HEAD despite the round-2 sol reviewer's note calling it untracked"
  ],
  "residualRisks": [
    "M3 forward-drift gap (finding 1) until the anchor extraction terminates at the sentence end",
    "stale ERROR scratch file ships unless removed",
    "PR-R1-05 owner escalation still open by design"
  ],
  "noStagedFiles": true,
  "diffSummary": "Round-1 fix wave (status lines, budget-true manifests, anchor-sentence M3, window-qualified IDV19) plus the PR panel round-1 review artifacts and consolidated adjudication; 16 files, +495/-68.",
  "reviewFindings": [
    "medium: test/plan-artifact-skeleton.test.js:229-235 - anchorSentence slices to segment end, so forward drift of a coverage name still passes (repro 29/29)",
    "low: .tmp-t3-report.json:1-15 - tracked ERROR scratch that no committed manifest state produces, contradicting the t3 PASS receipt",
    "low: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:52-55 - recorded round-2 scope narrower than actual dispatch; 'Verdicts pending' future narration"
  ],
  "manualNotes": "PR-R1-03 is PARTIAL, not fully resolved: the helper's own docstring admits 'to the segment end'. One-line fix: slice to the first terminator after the citation."
}
```
