# Consolidated PR review — sdlc-question-discipline (2026-07-19)

- **Orchestrating model:** anthropic/claude-opus-4-8 (author; excluded from the
  panel roster)
- **Panel round 1:** anthropic/claude-fable-5:high, openai-codex/gpt-5.6-sol:high,
  deepseek/deepseek-v4-pro:high (replacing google/gemini-3.1-pro-preview:high,
  infra-failed 429 prepayment-depleted; known persistent since 2026-07-18, retry
  skipped, replaced from the ordered prefer pool). Floor 3 met with 3 distinct
  model identities; no shortfall.
- **Reviewed artifact:** branch diff `main...50c9286`
- **Escalations to the human owner:** none — zero proposed dismissals of
  high/medium findings (per the escalation delta this very PR introduces).

## Round 1 findings and adjudication

| ID | Severity | Raised by | Gist | Disposition |
|---|---|---|---|---|
| F1 | medium | fable | Retained "prefer `wait({ all: true })` for read-only fan-out" contradicts the new react-per-child mandate in the same section | **Incorporated** (fix wave 1): sentence rescoped to research fan-outs, explicitly excluding panel dispatch |
| F2 | medium | fable | "Binds forward across sessions" had no cross-session discovery mechanism | **Incorporated** (fix wave 1): named lookup step added — search prior `<paths.reviews>/pr-*/consolidated.md` for human-ratified dismissals before adjudicating |
| F3 | medium | sol | Harvest-at-dispatch copies a point-in-time snapshot; async finals and replacement dispatches were not preserved | **Incorporated** (fix waves 1+2): §5 harvest paragraph now requires re-harvest at terminal state and a distinct positive-integer `--round` label per dispatch (a replacement reusing its original's round overwrites that snapshot — confirmed in vivo this run, then corrected). Run-store labels here: round 1 = original panel, round 2 = deepseek replacement, round 3 = confirmation panel |
| F4 | low | fable | `wait` parenthetical ("only unblocks once every child finishes") contradicted the timeout-as-sleep advice | **Incorporated** (fix wave 1): reworded to "a bare `wait` with no timeout" |
| F5 | low | fable | Committed `pr-body.md` blob at review SHA was stale (previous stream); the panel's named input existed only in the working tree | **Incorporated** (fix wave 1): current PR body committed |
| F6 | low | fable + deepseek-adjacent, sol (cross-model agreement) | Brainstorm bullet restated the shared contract's element list, violating pointer-not-restatement | **Incorporated** (fix wave 1): bullet trimmed to pointer + brainstorm delta only |
| F7 | low | fable | §11 routing row cited the new section by number ("§14"), fragile to §13's self-described interim status | **Incorporated** (fix wave 1): cited by name only, matching sibling rows |
| F8 | low | sol | `patterns.diff` (`git diff --check HEAD`) claimed vacuous; committed review artifacts carry trailing whitespace | **Partially incorporated** (fix wave 1): trailing whitespace trimmed from both receipts' `validator.md` (not hash-protected) and the panel artifact copies. The vacuity claim is inaccurate for this run — both runners executed pre-commit on a dirty tree, so the check did cover the task's own edits. Residue: `generated-agent.md:5` ("extensions: ") is a verbatim, sha256-protected copy of the stamped agent whose source carries the trailing space; trimming would break `verify-task-receipt`. Recorded, not fixed; a range-based check is a candidate improvement for a future stream. Low — not blocking |
| F9 | low | deepseek | Shotgun-surgery smell: one logical change touches 8+ files in 4 directories | **Recorded, no action**: the scatter is the plan's deliberate architecture (one shared contract + one thin delta per phase); the alternative (single file) was rejected at brainstorm as unroutable. Low — not blocking |

Also recorded (deepseek residual note, sub-finding severity): T2's
`standards.panel-input-naming` grep depends on exact bold formatting of one
phrase; rephrasing emphasis would fail the check without a real defect. Frozen
with the committed receipt; noted for future manifest authoring.

## Round 1 verdict

No high findings. All three mediums incorporated in fix wave 1 (commits
`3cd708a` and `d7766f7`); no high/medium survives adjudication. Round 2
dispatched against the fixed branch to confirm convergence per the fix-wave
rule.

## Round 2 — confirmation panel (post fix wave 1; harvest label round 3)

- **Panel:** anthropic/claude-fable-5:high, openai-codex/gpt-5.6-sol:high,
  deepseek/deepseek-v4-pro:high, dispatched against `d7766f7`.
- **Round-1 confirmations:** F1, F2, F3 verified RESOLVED in the committed
  blobs by all reviewers (F4–F7 also spot-verified by fable). 397 tests,
  lint, lifecycle check, and both receipts re-verified at `d7766f7`.
- **Escalations to the human owner:** none — zero proposed dismissals of
  high/medium findings.

| ID | Severity | Raised by | Gist | Disposition |
|---|---|---|---|---|
| N1 | medium | fable + sol (convergent) | F3's per-dispatch harvest labels were unreconciled with §12's telemetry event map; the retro collector pairs by (panelPhase, round), and this run's store mispaired (dispatched round=2 = confirmation roster vs harvest round2 = replacement) | **Incorporated** (fix wave 2): §12 now defines `<n>` in `panel.dispatched`/`panel.consolidated` as the logical review-wave counter (replacements keep their original wave), with harvest `--round` an allocation-only label and the label↔wave mapping recorded in `consolidated.md`; phase-pr-review cross-references the same rule. This run's store completed with a late `panel.dispatched` (wave 1) for the deepseek replacement |
| N2 | low | fable | The cross-session lookup example (`human-ratified`) missed every pre-convention ratification record | **Incorporated** (fix wave 2): example broadened to the stem `ratif` with a legacy-wording note |
| N3 | low | fable | Round-1 verdict cited symbolic "commit fix-wave-1" instead of SHAs | **Incorporated** (fix wave 2): pinned to `3cd708a`/`d7766f7` |
| N4 | low | fable | Committed round-2 section was a dangling placeholder | **Incorporated** (fix wave 2): this section |

**Harvest label↔wave mapping for this run:** wave 1 = harvest rounds 1
(original panel) and 2 (deepseek replacement); wave 2 (confirmation) = harvest
round 3; wave-2 fix-verification pass = harvest round 4.

## Round 3 — wave-2 fix verification

_Appended after the round-3 pass below._
