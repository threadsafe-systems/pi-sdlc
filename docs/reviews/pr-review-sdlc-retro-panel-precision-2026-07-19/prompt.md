# PR panel prompt — sdlc-retro-panel-precision (2026-07-19)

Stamped agent `.pi/agents/pi-sdlc-pr-review.md` (from `prompts/adversary-pr.prompt.md`
via `ensure-panel-agent.sh pr_review`), dispatched once per resolved model with the
review task (full diff `git diff main...HEAD`, reversible track, governing plan +
build-plan, pr-body.md's Assumptions section as named input, `file:line` grounding,
findings-only output).

Resolved roster (floor 3, author `anthropic/claude-opus-4-8` excluded):
`anthropic/claude-fable-5:high`, `openai-codex/gpt-5.6-sol:high`,
`google/gemini-3.1-pro-preview:high`.

Infra reality this run: `gemini-3.1-pro` 429 prepay-depleted (all session);
`claude-fable-5` (Anthropic) and `gpt-5.6-sol` (OpenAI-codex) both 429
rate-limited (account-wide, after a full day of panels) on the initial dispatch
and a retry — two consecutive infra failures each. `deepseek/deepseek-v4-pro:high`
(next prefer candidate, substituted for gemini) completed. The owner then added
`amazon-bedrock/global.anthropic.claude-sonnet-5` (a separate provider account,
unaffected by the direct-Anthropic rate limit; distinct identity from the opus-4-8
author) as an additional reviewer, which completed.
