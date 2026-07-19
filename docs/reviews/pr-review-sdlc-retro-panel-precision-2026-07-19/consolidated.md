# Consolidated PR review — sdlc-retro-panel-precision (2026-07-19)

- **Orchestrating model:** anthropic/claude-opus-4-8 (author; excluded from the panel)
- **Round 1 valid verdicts:** deepseek/deepseek-v4-pro:high, amazon-bedrock/global.anthropic.claude-sonnet-5
- **Floor:** `review.panelSize` pr_review = 3; **shortfall this round** — see the
  floor note below. `review.onShortfall: fail`.
- **Escalations to the human owner:** the floor shortfall (below). No proposed
  dismissals of high/medium findings — the one HIGH and one MEDIUM were both
  incorporated.

## Round 1 findings and adjudication

| ID | Severity | Raised by | Gist | Disposition |
|---|---|---|---|---|
| H1 | high | bedrock sonnet-5 (verified live by orchestrator) | The `(?:review-)?` infix let one directory be claimed by two slugs — slug `X` via the infix form and slug `review-X` via the classic form (`discoverReviewDirs` + `buildSoftData`) | **Incorporated** (fix wave 1): a slug starting with `review-` is matched only via the mandatory-infix form, so each directory belongs to exactly one slug; new collision regression test added |
| M1 | medium | bedrock sonnet-5 | Closed (`additionalProperties:false`) `run.json` schema/validator means the "no v1→v2 bump" claim holds backward (old data → new validator) but not forward (new data → a separately-pinned older schema) | **Incorporated** (fix wave 1): `run.schema.json` description documents same-version-pinned consumption; additive `wave` fields keep v1 per the owner's ratified no-v2-bump ruling |
| L1 | low | deepseek + bedrock | Cross-date fallback widened from `matchingPanels.length===1` to all `matchingPanels`; `precision.unparsed` slightly less strict for the no-date-match case | **Recorded** — benign (dates normally match); the wave-agreement guard still gates attribution |
| L2 | low | deepseek + bedrock | `panelPrecision[].round` now carries the wave value (retained only for v1 validator compat); name no longer matches value | **Recorded** — documented keep-both call; `round` required by v1, no v2 bump per owner ruling |
| L3 | low | bedrock | `wave` on `panel.dispatched`/`panel.consolidated` payloads is unused by any consumer in this diff (only `panel.harvested`'s is, via the sidecar) | **Recorded** — additive and documented in §12's wave vocabulary; kept for event-map coherence |
| L4 | low | bedrock | precision loop's `panel = candidates[0]` was dead weight (only `.panelPhase`, already invariant, was read) | **Incorporated** (fix wave 1): use the resolved `panelPhase`, drop `candidates[0]` |

## Floor shortfall (escalated)

Round 1 reached **2 distinct valid reviewers** (deepseek-v4-pro, bedrock
sonnet-5), one short of the pr_review floor of 3, because `claude-fable-5` and
`gpt-5.6-sol` were account-rate-limited (429) on both the initial dispatch and a
retry, and `gemini-3.1-pro` is prepay-depleted. `onShortfall: fail` routes this
to the human owner. Resolution pending — see the session for the decision.

## Round 2 — confirmation (post fix wave 1)

_Recorded after the confirmation dispatch._
