# PR panel prompt — PR #17 (adoption readiness, FS8)

Shared task text dispatched to each resolved model via the project
`pi-sdlc-pr-review` agent (one task per model, per-task `model` override):

Review PR #17 "feat(readiness): FS8 four-state adoption readiness for
sdlc-status" of threadsafe-systems/pi-sdlc.

- Repo checkout: the feat/adoption-readiness worktree (HEAD f62b157; base main
  at cace540).
- Diff: `git diff main...HEAD -- skills/ test/ templates/ README.md docs/adr/
  docs/validation/` (generated receipts under docs/reviews/ out of scope).
- Upstream artifacts: docs/specs/2026-07-12-sdlc-adoption-readiness.md,
  docs/plans/2026-07-12-sdlc-adoption-readiness.md,
  docs/plans/2026-07-12-sdlc-adoption-readiness-build.md.
- Grounding rule: cite file:line for every claim.
- Hunt: spec divergence, false-ready/false-error, git edge cases, output
  contract violations, FS1/FS2/FS3 compatibility regressions, weakened tests.

Panel resolved by `resolve-panel.sh pr_review --author anthropic`:
openai-codex/gpt-5.6-sol:medium, zai/glm-5.2:medium,
deepseek/deepseek-v4-pro:medium (anthropic excluded as author vendor).
