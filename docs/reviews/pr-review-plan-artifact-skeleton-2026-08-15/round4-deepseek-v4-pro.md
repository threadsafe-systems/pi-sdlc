## Confirm-fix lines

- PR-R3-01: PARTIAL — `.`/`?`/`!`-terminated forward drift, tail-empty unterminated anchors, and same-line backward drift all now fail (28/29 each at 0092099); trailing-question control and unmutated prompt pass 29/29. But the fix's fail-closed claim is falsified by one residual variant — see REOPENED(PR-R3-01) below.
- PR-R3-02: RESOLVED — `consolidated.md:72-89` now records the completed round with its exact range `482bd95..f4ababf` and adjudicated dispositions; no placeholder or future-narrating prose remains (grep for "appended when"/"wave-2 head"/"exact sha"/"Verdicts pending" returns only the historical disposition rows quoting what was removed).

## CLEAR surfaces re-checked

- Carry landing: CLEAR — no `CARRY-TO-*` minted anywhere in the delta; the only grep hits are round-3 files *stating* none was minted. Plan:127 "No carry is minted by this plan", spec:41-43 inbound carries "None", build gap log "None". PAS15 is a recorded post-merge orchestrator scenario, not a carry.
- Unmutated focused suite at 0092099: 29/29 pass; `git diff --check f4ababf..0092099` clean.
- Round-3 panel artifacts (3 files): historical records consistent with the round-2 convention; no misstatement affecting the live record (consolidated.md).
- Disposition's replay-battery claim: verified representative mutations — dot/q/bang drift, tail-empty unterminated, backward `. ` drift all caught; trailing-question control passes. Accurate for the six named mutations, but incomplete — see findings.

## Findings

### Unterminated anchor followed by a trailing sentence still lets drift pass — the round-3 "fails outright" claim is falsified

- severity: medium
- confidence: high
- origin: REOPENED(PR-R3-01)
- file: test/plan-artifact-skeleton.test.js
- line: 236-238 (helper; docstring at 229; M3 assertion at 249)
- problem: The round-3 disposition claims an unterminated anchor sentence "fails outright (`anchorSentence` returns null and M3 asserts termination)". That only holds when nothing follows the citation. If the anchor sentence's terminator is deleted while another sentence follows in the segment, `tail.search(/[.?!](\s|$)/)` matches the *next* sentence's terminator, the helper returns a non-null slice spanning anchor + trailing sentence, and coverage names drifted out of the anchor still satisfy `sentence.includes`. The helper docstring "null when unterminated" (line 229) and the consolidated disposition's completeness claim ("all three rounds' six drift mutations caught") are both falsified by this variant — the round-3 battery's unterminated mutation deleted the terminator of the segment's last sentence (tail empty), so this evidence did not exist when PR-R3-01 was dispositioned.
- repro_or_impact: In an archived 0092099 tree, surface A mutated to `... against their definitions in \`references/plan-artifact-skeleton.md\` The \`Definition of done\` block and the \`Carried to\` field stay pinned.` → `node --test test/plan-artifact-skeleton.test.js` = **29/29 PASS** with both coverage names outside the anchor sentence. Under the deliberate-change discipline any prompt edit that drops the anchor's period while appending a sentence re-opens the exact drift hole rounds 2-3 closed.
- smell: none

### Backward bound recognizes only space-terminated sentences — a `.\n` boundary hides backward drift

- severity: medium
- confidence: high
- origin: NEW
- file: test/plan-artifact-skeleton.test.js
- line: 234
- problem: The backward bound searches the head for literal `". "`, `"? "`, `"! "` only, while the forward bound accepts any whitespace (`/[.?!](\s|$)/`, line 236). A preceding sentence ending with a terminator at end-of-line (`.\n`, i.e., a line-wrapped segment) is invisible to the backward bound, so `start` falls back to the segment head and coverage names drifted into an earlier line are swept into the returned slice. The round-3 fix made the terminator *set* symmetric, not the whitespace class.
- repro_or_impact: In an archived 0092099 tree, surface A mutated to two lines — `A. The \`Definition of done\` and \`Carried to\` fields matter.` + newline + `Check the plan's blocks against their definitions in \`references/plan-artifact-skeleton.md\`.` → **29/29 PASS** with both names outside the anchor sentence. Same-line control (`. ` boundary, sol's round-1 mutation shape) correctly fails 28/29, isolating the whitespace-class asymmetry. Line-wrapping a surface is a plausible edit under the deliberate-change discipline, and the drift then goes undetected.
- smell: none

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Two concrete findings with severity, confidence, origin tags, file:line (test/plan-artifact-skeleton.test.js:236-238 and :234), and mutation reproductions at 0092099; one-line confirmations for PR-R3-01 (PARTIAL) and PR-R3-02 (RESOLVED); CLEAR lines for carry landing, whitespace, unmutated suite, and round-3 artifact consistency."
    }
  ],
  "changedFiles": [
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round3-deepseek-v4-pro.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round3-gpt-5.6-luna.md",
    "docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round3-gpt-5.6-sol.md",
    "test/plan-artifact-skeleton.test.js"
  ],
  "testsAddedOrUpdated": [
    "test/plan-artifact-skeleton.test.js (symmetric [.?!] forward bound + M3 termination assert)"
  ],
  "commandsRun": [
    {
      "command": "node --test test/plan-artifact-skeleton.test.js (0092099, unmutated)",
      "result": "passed",
      "summary": "29/29 pass"
    },
    {
      "command": "archived-tree mutation battery: dot/q/bang drift, tail-empty unterminated, backward '. ' drift, trailing-question control",
      "result": "passed",
      "summary": "drift mutations fail 28/29; control passes 29/29 — as claimed"
    },
    {
      "command": "archived-tree mutation: unterminated anchor + trailing sentence with drift",
      "result": "failed",
      "summary": "29/29 PASS — false negative, reopen basis"
    },
    {
      "command": "archived-tree mutation: backward drift across '.\\n' boundary (two-line surface A)",
      "result": "failed",
      "summary": "29/29 PASS — false negative, new finding"
    },
    {
      "command": "git diff --check f4ababf..0092099",
      "result": "passed",
      "summary": "no whitespace errors"
    },
    {
      "command": "grep CARRY-TO- over the delta + plan/spec/build carry declarations",
      "result": "passed",
      "summary": "no carry minted anywhere in the delta; plan/spec/build record none"
    }
  ],
  "validationOutput": [
    "PR-R3-02 fix verified: consolidated.md:72-89 is the completed round-3 record with exact range; no placeholder/future prose remains.",
    "Carry landing CLEAR at 0092099.",
    "Two mutation-proven residual false-negatives remain in anchorSentence (see findings)."
  ],
  "residualRisks": [
    "M3 still passes drift when an unterminated anchor sentence is followed by another sentence in the segment (falsifies the round-3 'fails outright' disposition claim).",
    "M3 still passes backward drift across a '.\\n' sentence boundary because the backward bound matches literal space only (forward bound matches \\s).",
    "PR-R1-05 owner escalation and PAS15 post-merge obligations remain open lifecycle items, unchanged by this delta."
  ],
  "noStagedFiles": true,
  "diffSummary": "Round-3 fix wave: symmetric [.?!] forward terminator bound with fail-closed null on tail-empty unterminated anchors, M3 termination assertion, completed round-3 record with exact range and a no-placeholder convention, plus the three round-3 panel artifacts.",
  "reviewFindings": [
    "medium: test/plan-artifact-skeleton.test.js:236-238 - unterminated anchor + trailing sentence still lets drift pass (REOPENED(PR-R3-01))",
    "medium: test/plan-artifact-skeleton.test.js:234 - backward bound misses '.\\n' boundaries, backward drift across a line wrap passes (NEW)"
  ],
  "manualNotes": "Cap round: the two residual gaps are mutation-proven at 0092099 and were not in the round-3 battery (tail-empty unterminated and space-terminated backward drift were). Recommend recording them rather than another fix wave, since both require a prompt edit to exploit and the current pinned prompt is clean."
}
```
