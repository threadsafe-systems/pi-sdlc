### anchorSentence's forward bound recognizes only `.` terminators — forward drift out of a `?`/`!`/unterminated anchor sentence still passes

- severity: medium
- confidence: high
- origin: REOPENED(PR-R2-01)
- file: test/plan-artifact-skeleton.test.js
- line: 236-237 (helper; docstring at 229)
- problem: The new forward bound is `tail.search(/\.(\s|$)/)` — it terminates the slice at the first *period*, not at the first sentence terminator. The backward bound recognizes `. `, `? `, and `! `; the forward bound ignores `?` and `!` entirely and falls back to `segment.length` when no period follows. So when the anchor sentence's terminator is `?`, `!`, or missing, the slice overruns past the citation sentence and a coverage name drifted into a following sentence still satisfies `sentence.includes(name)`. This falsifies the helper docstring "terminator-bounded on both sides" (line 229) and the committed disposition's claim "the helper now terminates at the first sentence terminator after the citation" (consolidated.md:64).
- repro_or_impact: In a scratch copy of f4ababf I mutated surface C: replaced `Objectives and scope` with `Boundary` in the anchor sentence, changed its terminal `.` to `?`, and appended `Objectives and scope stay pinned.` — `node --test test/plan-artifact-skeleton.test.js` reported 29/29 pass (name left the anchor sentence; assertion false-negative). Same pass with a `!` terminator and with the anchor sentence's terminator deleted. Control: appending a `?`-terminated sentence while the anchor keeps its `.` is caught (28 pass/1 fail), as are both round-2 declarative-drift mutations and sol's round-1 backward in-sentence mutation (each 28/1). Reopen basis, same standard as the round-2 accepted reopen of PR-R1-03: the evidence arises from the new forward-bound regex this wave introduced; the disposition verified completeness only on `.`-terminated replays. Fix: search `/[.!?](\s|$)/` on the tail (and keep the `close === -1` fallback for genuinely unterminated prompts only if drift into it is impossible to distinguish — otherwise reject).
- smell: none

### consolidated.md Round 3 section re-introduces both PR-R2-03 patterns: range endpoint deferred to out-of-repo material and future-narrating prose

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md
- line: 73-78
- problem: The committed record scopes round 3 as "`482bd95`..the wave-2 head" and adds "the exact sha is in the dispatch task and harvest label 4's meta" — the repo record does not name the reviewed range (the sha is f4ababf and could simply be written), deferring instead to session/dispatch material that never enters the repo. The same section ends "The round-3 section is appended when its verdicts land." — future-narrating prose that requires a rewrite the moment the verdicts land, exactly the "Verdicts pending" pattern PR-R2-03's incorporation removed from this file in this very commit.
- repro_or_impact: An auditor can resolve "the wave-2 head" only indirectly ("the commit carrying this round-2 adjudication"); the dispatch-task and harvest-label references point outside the repo, and the pending-append line becomes stale precisely when this file next changes for round 3. Both defects are the class PR-R2-03 fixed one section up; the fixing commit reintroduced them one section down.
- smell: none

## Confirm-fix lines (one line each)

- PR-R2-01: RESOLVED for `.`-terminated drift only — both round-2 forward-drift mutations and sol's round-1 backward mutation replayed at f4ababf, each 28 pass/1 fail; but the fix is incomplete, see REOPENED(PR-R2-01) above.
- PR-R2-02: RESOLVED — `.tmp-t3-report.json` absent from index and tree (`git ls-files` shows no tmp files; `ls` confirms no working-tree file); f4ababf stages exactly the intended six paths, no strays.
- PR-R2-03: RESOLVED — Round 2 range now reads `2f8be30..482bd95` (consolidated.md:55-57) and the "Verdicts pending" line is replaced by the adjudication table (lines 64-71); see NEW finding above for its Round 3 recurrence.

## CLEAR surfaces re-checked

- Carry landing: CLEAR — no `CARRY-TO-*` minted anywhere in the delta; plan:127 "No carry is minted by this plan", spec:41-43 inbound carries "None", build gap log (build:171-175) "None"; PAS15 is a recorded post-merge orchestrator scenario, not a formal carry.
- Unmutated suite: 29/29 pass at f4ababf; `git diff --check 482bd95..f4ababf` clean; biome clean on the changed test file.
- pr-body.md: gitignored (`.gitignore:20`) and untracked as recorded; its post-merge obligation list (re-freeze components 1-3, #146 closure) is accurate against the branch.
- round2-*.md artifacts: consistent as historical panel submissions; no factual misstatement found other than the PR-R2-01 completeness claim carried into consolidated.md:64 (covered by finding 1).

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Two concrete findings with severity, confidence, file:line (test/plan-artifact-skeleton.test.js:236-237, docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:73-78), plus mutation repros and one-line confirmations of PR-R2-01/02/03."
    }
  ],
  "changedFiles": [
    ".tmp-t3-report.json (deleted)",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-deepseek-v4-pro.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-gpt-5.6-luna.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round2-gpt-5.6-sol.md",
    "test/plan-artifact-skeleton.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/plan-artifact-skeleton.test.js (anchorSentence terminator-bounded slice)"
  ],
  "commandsRun": [
    {
      "command": "node --test test/plan-artifact-skeleton.test.js (f4ababf, unmutated)",
      "result": "passed",
      "summary": "29/29 pass"
    },
    {
      "command": "scratch-copy mutations: round-2 DS + SOL forward drift, sol round-1 backward drift",
      "result": "passed",
      "summary": "all three caught (28 pass / 1 fail each)"
    },
    {
      "command": "scratch-copy mutations: ? terminator, ! terminator, deleted terminator with forward drift",
      "result": "failed",
      "summary": "all three pass 29/29 — forward bound ignores ?/!/missing terminators (finding 1)"
    },
    {
      "command": "git diff --check 482bd95..f4ababf",
      "result": "passed",
      "summary": "no whitespace errors"
    },
    {
      "command": "npx biome check test/plan-artifact-skeleton.test.js",
      "result": "passed",
      "summary": "clean, no fixes applied"
    },
    {
      "command": "carry-landing sweep (git grep CARRY-TO across plan/spec/build + delta)",
      "result": "passed",
      "summary": "no minted carries anywhere in this run; plan/spec/build all record None"
    }
  ],
  "validationOutput": [
    "git ls-files shows no tracked tmp files; .tmp-t3-report.json absent from tree (PR-R2-02 confirmed)",
    "consolidated.md:55-57 records 2f8be30..482bd95 (PR-R2-03 confirmed)",
    "anchorSentence tail regex at test/plan-artifact-skeleton.test.js:236 is /[.](\\s|$)/ — no ? or ! branch"
  ],
  "residualRisks": [
    "M3 forward-drift gap persists for anchor sentences terminated by ?/!/nothing (REOPENED(PR-R2-01))",
    "consolidated.md Round 3 section carries an out-of-repo range pointer and future-narrating prose (NEW, low)",
    "PR-R1-05 owner escalation (E1) still open by design — outside this delta"
  ],
  "noStagedFiles": true,
  "diffSummary": "Round-2 fix wave: terminator-bounded anchorSentence helper, removal of the committed .tmp-t3-report.json scratch report, corrected round-2 consolidated record plus the three round-2 panel artifacts; 6 files, +358/-20.",
  "reviewFindings": [
    "medium: test/plan-artifact-skeleton.test.js:236-237 - forward bound only matches periods; drift out of a ?/!/unterminated anchor sentence still passes 29/29 (REOPENED(PR-R2-01))",
    "low: docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:73-78 - round-3 range sha deferred to dispatch material and 'appended when its verdicts land' future narration, re-introducing the PR-R2-03 class"
  ],
  "manualNotes": "PR-R2-01's disposition replay claims are true for the replays actually run; the general claim 'terminates at the first sentence terminator' is false for ? and !. One-line fix: tail.search(/[.!?](\\s|$)/)."
}
```
