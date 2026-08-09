# PR review — spike exit rule

- Track: irreversible
- Logical wave: 1 (full diff)
- Reviewed head: `763706b6871e3508f5066e52b208d6ae3a4da1d5`
- Base: `a3f62c7ddc8697fd3712f18e241296de5df2d312`
- Orchestrator: `openai-codex/gpt-5.6-sol`
- Verdict-bearing panel: `openai-codex/gpt-5.6-luna:xhigh`,
  `deepseek/deepseek-v4-pro:xhigh`, `zai/glm-5.2:xhigh`
- Panel outputs available: `2026-08-09T21:00:56Z`
- Adjudication: `2026-08-09T21:01:47Z`–`2026-08-09T21:02:10Z`
- Incremental SER13 reviewers/model calls beyond the configured panel: `0`
- Surviving high/medium findings: 0 after incorporation

## Findings and dispositions

| id | class | origin | severity | reviewers | finding | disposition |
|---|---|---|---|---|---|---|
| PR-R1-01 | carry landing | NEW | high | luna; glm (low) | SER14 named a committed PR consolidated record, but the reviewed head still said `PR landing pending` and had no such record | **incorporated** — this consolidated record verifies #245 and records its URL, issue content, host timestamps, zero issue-creation calls, reviewed head, inventory, panel timing, and verdict; the fix wave updates the Build carry ledger to this landing |
| PR-R1-02 | transition semantics | NEW | medium | luna; deepseek (low) | scoping the only Plan-transition sentence to post-spike `proceed` left ordinary Brainstorm completion without an explicit next transition and moved the GPC anchor out of its original gate context | **incorporated** — the sentence will cover both ordinary completion and post-spike proceed, while preserving the literal anchor and normal human gate |
| PR-R1-03 | evidence durability | NEW | medium | luna | only retained evidence required a self-contained decision summary, allowing discarded spike learning to disappear despite C4 | **incorporated** — every spike will require the self-contained existing `decision:` line; only retained evidence requires a link |
| PR-R1-04 | verifiability gap | NEW | low | luna | SER2 asserted first occurrence order but not the Spec's duplicate-route falsifier | **incorporated** — count each route anchor exactly once before asserting order |
| PR-R1-05 | vocabulary drift | NEW | low | glm | `delivery-grade` was defined with “detailed solution requirements” but route 2 used the broader ratified “detailed requirements” trigger | **incorporated** — align the Vocabulary definition to route 2 without changing the narrower deliverable-in-disguise example |

DeepSeek disagreed that SER14 was undischarged because its issue and evidence were
already prepared. The phase contract requires the named destination itself to
exist before the PR gate passes, so the stronger Luna/GLM reading is applied;
this file is that destination. No finding is dismissed.

## SER13 guidance inspection

All three verdict-bearing reviewers found the ordered first-match rule usable as
prose without parser or implementation knowledge. The predicates introduce no
hidden numeric threshold or fifth route; #147 remains future read-tier
mechanisation only. The reviewed diff adds no config, runtime script, schema,
telemetry vocabulary, mandatory storage hierarchy, or reuse mandate. The three
configured verdict-bearing reviewers are the only SER13 reviewers; replacements
for pre-verdict infrastructure failures did not add a separate SER13 review.

## SER14 carry landing

- Durable issue: [#245 — Grill: ephemeral spike evidence lifecycle](https://github.com/threadsafe-systems/pi-sdlc/issues/245)
- Issue state verified live during adjudication: open
- GitHub issue `createdAt`: `2026-08-09T19:45:58Z`
- Recorded host action: `2026-08-09T19:45:57Z`–`2026-08-09T19:45:58Z`
- Incremental model calls for issue creation: `0`
- Promotion outcome present: durable home plus maintained-pointer obligation
- Delete-and-repair outcome present: remove or replace every temporary Plan/Spec
  pointer before merge
- Durable decision summary survives either outcome

SER14 is landed at its named PR-review destination. Issue creation took one
second, below its five-minute budget.

## Reviewed-head changed-file inventory

```text
docs/plans/2026-08-09-spike-exit-rule-build.md
docs/plans/2026-08-09-spike-exit-rule.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/consolidated.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/prompt-round2.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/prompt-round3.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/prompt-round4.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/prompt.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round1-openai-codex-gpt-5.6-luna.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round1-zai-glm-5.2.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round2-openai-codex-gpt-5.6-luna.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round2-zai-glm-5.2.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round3-openai-codex-gpt-5.6-luna.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round3-zai-glm-5.2.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round4-openai-codex-gpt-5.6-luna.md
docs/reviews/plan-review-spike-exit-rule-2026-08-09/round4-zai-glm-5.2.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/consolidated.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/prompt-round2.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/prompt-round3.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/prompt-round4.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/prompt.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round1-maas-qwen-deepseek-v4-flash-0731.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round1-openai-codex-gpt-5.6-terra.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round2-maas-qwen-deepseek-v4-flash-0731.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round2-openai-codex-gpt-5.6-terra.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round3-maas-qwen-deepseek-v4-flash-0731.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round3-openai-codex-gpt-5.6-terra.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round4-maas-qwen-deepseek-v4-flash-0731.md
docs/reviews/spec-review-spike-exit-rule-2026-08-09/round4-openai-codex-gpt-5.6-terra.md
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/generated-agent.md
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/manifest.json
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/receipt.json
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/report.json
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/runner-report.json
docs/reviews/task-validate-spike-exit-rule-t1-2026-08-09/validator.md
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/generated-agent.md
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/manifest.json
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/receipt.json
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/report.json
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/runner-report.json
docs/reviews/task-validate-spike-exit-rule-t2-2026-08-09/validator.md
docs/specs/2026-08-09-spike-exit-rule.md
docs/validation/spike-exit-rule/t1.json
docs/validation/spike-exit-rule/t2.json
skills/sdlc/references/phase-brainstorm.md
test/gate-presentation-contract.test.js
```

## Artifact inventory

| Logical wave | Harvest labels | Consolidated record | Events |
|---:|---|---|---|
| 1 | `pr_review-round1` through `pr_review-round4` | this file | four `panel.dispatched`; `panel.consolidated` recorded after adjudication |

A delta convergence wave is required because PR-R1-02 and PR-R1-03 change
normative phase guidance and PR-R1-04 strengthens mechanical enforcement.
