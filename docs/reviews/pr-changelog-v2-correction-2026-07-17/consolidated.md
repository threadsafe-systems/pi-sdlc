# Consolidated PR panel — docs/changelog-v2-correction (PR #73)

- Date: 2026-07-17
- Panel: openai-codex/gpt-5.6-sol:high, google/gemini-3.1-pro-preview:high,
  deepseek/deepseek-v4-pro:high (author vendor anthropic excluded)
- Orchestrating/adjudicating model: anthropic (Claude, session model)
- Per-model files: `gpt-5.6-sol.md`, `gemini-3.1-pro-preview.md`,
  `deepseek-v4-pro.md`

## Load-bearing safety claim — independently triple-verified

All three reviewers independently confirmed, via direct git inspection
(`merge-base`, `ancestry-path`, `show-ref -d`), that the poisoned commit
`04d6361` (containing the accidental `BREAKING CHANGE:` line-start match)
is an **ancestor** of the hand-cut `v1.0.1` tag (`b375469`), and that this
PR's only new commit on top is `docs:`-typed (no release trigger). Merging
this PR cannot cause semantic-release to reprocess `04d6361`.
deepseek-v4-pro additionally verified the tag-collision edge case (a
locally-cached stale `v2.0.0` tag pointing at the same commit) resolves to
the same safe outcome even in the worst case.

## Findings and adjudication

**Finding 1 (LOW, gpt-5.6-sol)** — CHANGELOG text claimed the angular
preset recognised neither the `!` shorthand nor the `BREAKING CHANGE:`
footer; angular does recognise the footer, only not `!`. **INCORPORATED**:
reworded to state precisely what angular did and didn't parse.

**Finding 2 (LOW, gpt-5.6-sol)** — "No v2.0.0 was ever published" is
imprecise: a real (non-draft) GitHub Release existed briefly before
deletion, which is this repo's actual publication mechanism (no npm
registry). **INCORPORATED**: reworded to "briefly published, then deleted".

**Residual note (deepseek-v4-pro)** — a stale local `v2.0.0` tag remains in
this worktree's clone only (confirmed absent from `git ls-remote --tags
origin`); no merge risk, local hygiene only. Not incorporated as a PR
change; will `git tag -d` locally.

## Outcome

2/2 substantive findings incorporated, 0 dismissed. No high or medium
findings raised by any reviewer. track:none independently verified honest
by all three. Stop condition met.
