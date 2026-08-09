# Wave 1 dispatch inventory

| Harvest label | Logical wave | Model | Outcome |
|---|---:|---|---|
| `pr_review-round1-2026-08-09` | 1 | `anthropic/claude-fable-5:xhigh` | pre-verdict 429 rate limit |
| `pr_review-round1-2026-08-09` | 1 | `openai-codex/gpt-5.6-luna:xhigh` | verdict returned |
| `pr_review-round1-2026-08-09` | 1 | `amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh` | pre-verdict AccessDenied; non-transient |
| `pr_review-round2-2026-08-09` | 1 | `deepseek/deepseek-v4-pro:xhigh` | configured replacement; verdict returned |
| `pr_review-round3-2026-08-09` | 1 | `anthropic/claude-fable-5:xhigh` | one permitted retry; pre-verdict 429 rate limit |
| `pr_review-round4-2026-08-09` | 1 | `zai/glm-5.2:xhigh` | configured replacement; verdict returned |

The three verdict-bearing reviewers meet the configured distinct-model floor.
Every replacement came from `pr_review`'s committed preference list. Point-in-
time harvests were refreshed after each run reached terminal state.
