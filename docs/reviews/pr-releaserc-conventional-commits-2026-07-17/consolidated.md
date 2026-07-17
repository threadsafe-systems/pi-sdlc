# Consolidated PR panel — chore/releaserc-conventional-commits (PR #72)

- Date: 2026-07-17
- Panel: openai-codex/gpt-5.6-sol:high, google/gemini-3.1-pro-preview:high,
  deepseek/deepseek-v4-pro:high (author vendor anthropic excluded)
- Orchestrating/adjudicating model: anthropic (Claude, session model)
- Per-model files: `gpt-5.6-sol.md`, `gemini-3.1-pro-preview.md`,
  `deepseek-v4-pro.md`

## Findings and adjudication

**Finding 1 (MEDIUM; gpt-5.6-sol + deepseek-v4-pro, independently
converged)** — installing npm-latest `conventional-changelog-
conventionalcommits` (10.2.1) breaks `release-notes-generator`'s output:
gpt-5.6-sol reproduced `generateNotes()` returning only the version
heading, dropping every Features/Bug Fixes/BREAKING CHANGES section, due
to v10's function-based template writer being incompatible with the
installed `conventional-changelog-writer` 8.4.0 (Handlebars-based).
**INCORPORATED**: pinned to `^9.3.1` (the version `release-notes-
generator`'s own devDependencies test against); re-verified full notes
render correctly and major-release classification still works, both by
direct `generateNotes`/`analyzeCommits` reproduction.

**Finding 2 (MEDIUM, gpt-5.6-sol)** — the PR's `track: none` declaration's
reason line exceeded the checker's 200-character/one-line contract,
failing the required `test + biome` CI check. **INCORPORATED**: shortened
the reason to a single sentence under the cap.

**track:none claim** — verified honest by all three reviewers
independently (diff touches only `.releaserc.json` + the devDependency;
zero product code, zero consumer-facing contract change).

**gemini-3.1-pro-preview**: returned no findings at any severity. Notable
low-precision result for this panel round (0 raised vs 2 substantive,
2 raised respectively by the other two) — recorded as panel-composition
signal, not actioned further.

## Outcome

2/2 findings incorporated, 0 dismissed. No high findings from any
reviewer. Stop condition met at merge time.

## Post-merge addendum (2026-07-17, same day)

The squash-merge of this PR (commit `04d6361`) was subsequently
mis-classified as a breaking release (`v2.0.0`) by semantic-release: one
commit's own prose (added during this PR's authoring, describing what the
new preset now recognises) contained a line that happened to start with
the note parser's exact breaking-change keyword. This was caught, and
corrected via PR #73 (`v2.0.0`'s tag/release deleted, `v1.0.1` hand-cut in
their place) — see
`docs/reviews/pr-changelog-v2-correction-2026-07-17/consolidated.md` for
the full account. Neither of the two findings above relate to or could
have caught this; it originated in this PR's own commit message prose,
outside the panel's review scope (which reviewed the diff, not commit
message text for parser side effects). Recorded here for the complete
paper trail on this feature.
