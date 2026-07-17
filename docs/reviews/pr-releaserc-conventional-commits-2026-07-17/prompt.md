# Shared panel prompt — PR review, PR #72 (chore/releaserc-conventional-commits)

Reviewer prompt: the stamped project agent `.pi/agents/pi-sdlc-pr-review.md`.

Panel resolution: `resolve-panel.sh pr_review --author anthropic
--emit-tasks pi-sdlc-pr-review` → `openai-codex/gpt-5.6-sol:high`,
`google/gemini-3.1-pro-preview:high`, `deepseek/deepseek-v4-pro:high`.

Shared task focus: verify (a) the track:none claim is honest; (b) the
substance — does the conventionalcommits preset swap correctly fix the
angular `!`-shorthand gap, does the added devDependency version risk
breaking any existing/historical commit classification; (c) test/lint
state as claimed.
