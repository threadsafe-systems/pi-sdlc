# Shared panel prompt — PR review, PR #73 (docs/changelog-v2-correction)

Reviewer prompt: the stamped project agent `.pi/agents/pi-sdlc-pr-review.md`.

Panel resolution: `skills/sdlc/scripts/resolve-panel.sh pr_review --author
anthropic --emit-tasks pi-sdlc-pr-review` → `openai-codex/gpt-5.6-sol:high`,
`google/gemini-3.1-pro-preview:high`, `deepseek/deepseek-v4-pro:high` (3
vendors; `anthropic/claude-fable-5:high` dropped as author vendor).

Shared task focus: verify (a) the track:none claim is honest (docs-only
diff); (b) the CHANGELOG.md text is accurate against actual repo/gh state
(tag and release existence); (c) the safety-critical ordering claim — that
the hand-cut `v1.0.1` tag sits at or after the poisoned `04d6361` commit in
`main`'s history, so merging cannot cause semantic-release to reprocess it.
