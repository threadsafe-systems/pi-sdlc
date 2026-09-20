# PR #274 — round 2 delta review, consolidated

Delta: `ecd0cf44..8999315`. Seats: `openai-codex/gpt-5.6-sol:xhigh`,
`openai-codex/gpt-5.6-luna:xhigh`, `zai/glm-5.3:xhigh` (all `xhigh`).
`anthropic/claude-fable-5-1` resolved first in the pool and was skipped without
dispatch: issue #275 records that it cannot launch as a subagent child.

All three seats returned **REVISE**. 28 raw findings dedupe to 18.

## The pattern that matters

Round 1 raised 15 findings; 13 were marked incorporated. Round 2 reopens **six**
of those. In every reopened case the fix corrected the exact line the reviewer
cited and left the identical false claim standing elsewhere — the reference was
fixed, the Plan and Build plan were not.

The fix wave also introduced **two new false claims** while correcting five old
ones. Round 1's lesson was not learned; it was applied literally to the cited
line numbers.

## Findings

| id | sev | seats | finding | status |
| --- | --- | --- | --- | --- |
| R2-01 | med | sol · luna · glm | The 4× gate ceiling does not compose with the ladder it bounds. With opening budget B, a mandated sequence reaches ≥4B and, at the ladder's own raised budget, 5B. "Total panel time" is undefined (elapsed vs summed), "the wave's opening budget" is ambiguous (gate's first vs current wave — the latter makes the cap 8B and decorative), and there is no rule for in-flight children at the cap. | open |
| R2-02 | med | sol · glm | The zero-output stall carve-out keys on a signal that also describes every budget-exhausted reviewer. A reviewer killed at its deadline mid-analysis also produced no output; the rule routes deterministic exhaustion into the twin path at the same budget, where it times out again. Should key on zero reported usage/turns, not zero output. | open |
| R2-03 | med | sol | `phase-implement.md:237-242` mandates `turnBudget: {maxTurns, graceTurns}`. pi-subagents 0.59 removed assistant turn budgets; the string appears nowhere in installed 0.65.1 and the tool schema has no such field. **Verified independently.** | open |
| R2-04 | med | sol · luna | `phase-implement.md:201-204` still prescribes `deepseek/deepseek-v4-flash` then undated `anthropic/claude-haiku-4-5` as the task-validator preference. Neither is in the roster; the undated alias is the identity-check failure this PR exists to fix. Its `resolve-panel task_validate` example also omits the now-mandatory `--track`. **Verified independently.** | open |
| R2-05 | med | glm | A4's correction introduced a new false claim. #268 and #270 **are** on project 5, both since 2026-08-18. The original claim was half true (board yes, labels no); the correction flipped the true half to false. **Verified independently — the earlier negative was an undersampled query: `first: 100` against a 209-item board.** | open |
| R2-06 | med | glm | The `$comment` states `modelIdentity()` folds a Bedrock alias onto its direct vendor/model as a general rule. True for the opus pair; **false for the haiku pair this same delta added** — `…claude-haiku-4-5-20251001-v1:0` does not fold onto `…claude-haiku-4-5-20251001`. **Verified independently by executing `modelIdentity`.** | open |
| R2-07 | med | glm | "The subagent tool's 30-minute default" is false for the dispatch shape §5 now prescribes. Async composites have **no default parent deadline** — silence yields an unbounded run, not a 30-minute one. The paragraph names the wrong failure mode. | open |
| R2-08 | med | sol · luna | The falsified calibration survives uncorrected in the Plan: `…hygiene.md:60` still reads "PR #261's PR panel (70 files, +5,148/−12) lost both". The reference and Build plan were corrected to 55 files / two of three. **Verified.** | open |
| R2-09 | med | sol · luna · glm | The DoD now claims every configured id answers a probe dispatched as a subagent child. No receipt is committed, the probe predates three currently-configured ids, and `fable-5-1` remains `authorDefault` and pool lead while being the one id proven to fail child launch. | open |
| R2-10 | med | luna · glm | PR-R1-10 remains undispositioned. `review.tasks: subagent` requires a task-validation receipt per task; `docs/validation/` has no artifacts for this slug, and no owner ratification of a waiver is recorded. | open |
| R2-11 | med | luna | The tracker projection is still absent. `shape.publishToTracker` is 2 and this build has 2 tasks, so an epic plus sub-issues is required. Note R2-05: the board half of the waiver's premise actually holds. | escalated |
| R2-12 | med | sol | "Wrap each child" is not an actionable instruction for `dispatch.sh`, which starts each `pi` under its own `setsid` and exposes no timeout hook — an external timeout kills only the launcher. (glm judged PR-R1-07 landed; sol's mechanism argument is the stronger reading.) | open |
| R2-13 | med | glm | `phase-implement.md` was aligned on the deterministic-timeout rule but not on the stall carve-out, so it now unconditionally mandates a doubled retry for a zero-progress worker — the move §5 declares futile. | open |
| R2-14 | low | sol · luna | The Build plan retains the index-stability claim at line 49 after its falsification was incorporated into the Plan. | open |
| R2-15 | low | glm | The recipe's per-child relative `output` is routed under the run's artifacts dir, not the reviews path §5 points at. **Self-verifying: this round's outputs had to be copied out of `artifacts/outputs/<runId>/`.** | open |
| R2-16 | low | glm | Provider-side failures lost the same-budget retry entirely; `plan_review`/`spec_review` declare no twin, so one 429 now costs a panelist where a short retry used to recover it. | open |
| R2-17 | low | glm | Round 1's artifact set omits the shared `prompt.md` §5 requires. **Verified.** | open |
| R2-18 | low | sol | The retargeted assertion in `reference-contract.test.js` does not guard the corrected dispatch recipe against regressing to the removed legacy shape. | open |

## Proportionality

`glm` raised none, and reviewed the delta as correctly sized. The finding volume
is not scope creep — it is concentrated in newly authored normative prose that no
machine check can falsify.

VERDICT: REVISE
