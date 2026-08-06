# PR panel — repo-hygiene-readme-refresh

- Phase: `pr_review`
- Track: `none` (exemption; honesty of the exemption was explicitly put to the panel)
- Commit under review, round 1: `43d591fa7ea7b9d0e7b8cc55d230b45f5c9f4b3e`
- Orchestrator / author identity: `anthropic/claude-opus-5`
- Author model excluded from the panel by `resolve-panel`.

## Round 1

Resolved: `anthropic/claude-fable-5:xhigh`, `openai-codex/gpt-5.6-sol:xhigh`,
`openai-codex/gpt-5.6-luna:xhigh` (panelSize 3).

Returned: **1 of 3**. Both `openai-codex` reviewers failed with
`Codex error: The usage limit has been reached` and produced no findings. Under
`review.onShortfall: fail` this is a shortfall, not a pass — round 2 refills it
with different models rather than accepting a one-reviewer verdict.

No high-severity findings. All seven findings incorporated.

| id | severity | reviewer | finding | disposition |
|---|---|---|---|---|
| F1 | medium | fable-5 | Unanchored `pr-body.md` ignore rule also matches `docs/reviews/<dir>/pr-body.md`, the committed panel snapshots; `git add <dir>` skips ignored files silently, so a future snapshot would vanish without error — re-creating the provenance hazard the PR exists to fix. | **Incorporated.** Anchored to `/pr-body.md`; verified with `git check-ignore -v --no-index` that the tracked snapshot class no longer matches. |
| F2 | medium | fable-5 | README claimed an unwritable store "degrades to a single stderr warning"; the standalone emitter exits 2 on I/O failure (`record-run-event.mjs:171-176`). Only the in-process emitter is fail-soft on I/O. | **Incorporated.** Sentence rewritten to separate soft-skip (identity) from exit 2 (I/O) and to point at the owning reference for the full contract. |
| F3 | medium | fable-5 | "The run store is git-ignored" is true only of pi-sdlc's own repo; `setup-sdlc` provisions no ignore rule, so an adopter can commit raw run material. | **Incorporated.** README now tells adopters to add `**/.pi/sdlc/runs/` themselves; the gap in the adoption bundle is recorded as residual risk (a behaviour change, out of scope for `track: none`). |
| F4 | low | fable-5 | Two verification claims in the PR body were wrong: lint is 2 warnings/1 info (not 2 infos), and 8 of the 29 failures come from `check-lifecycle.test.js`, not `setup-sdlc`'s check. | **Incorporated.** Both corrected after re-running; the macOS `/var` symlink root cause holds, but it spans more than one script. |
| F5 | low | fable-5 | "The loaded skill directory" is singular while the README's commands span two skills with two script directories; a reader following the retro block under the `sdlc` skill gets file-not-found. | **Incorporated.** The retro block now says which skill it resolves against, without naming a literal path (SP1 bars that). |
| F6 | low | fable-5 | Consumers keep the stale-`pr-body.md` hazard; the PR body never recorded it as a known residual. | **Incorporated.** Recorded under "Residual risk" and flagged for a follow-up PR. |
| F7 | low | fable-5 | The new telemetry/retro prose near-duplicates `system-reference.md` §12 and `sdlc-retro/SKILL.md`, creating a second copy of contract prose to drift-track — and it already inherited §12's divergence from the code (F2). | **Incorporated.** Trimmed to a summary plus explicit pointers to the two owning references. |

Verified by the reviewer and not re-litigated: every documented argv against the
real scripts (`record-run-event`, `harvest-panel`, `tracker-ops`, `collect-run`,
`render-retro`), the seven `templates/` filenames against the seven claimed slash
commands, the tracker section against the config schema, SP1 on the new README,
`check-references`, and that CI's lifecycle check reads `$GITHUB_EVENT_PATH`
rather than the now-untracked file — so the untracking breaks no gate. The
reviewer independently judged the `track: none` declaration honest for this diff.

## Round 2

Resolved manually against live credentials after round 1's shortfall:
`amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh` and
`deepseek/deepseek-v4-pro:xhigh`.

Returned: **1 of 2**. The Bedrock reviewer failed with `No API key found for
amazon-bedrock` — it is in the committed roster but has no live credential on
this machine, which `resolve-panel`'s reconciliation would have caught had the
orchestrator gone through it instead of picking from the roster by hand.

`deepseek-v4-pro` reviewed the whole diff (it had not seen round 1) and verified
each round-1 fix independently against the working tree and the scripts:
F1–F7 all **RESOLVED**, including re-running lint and the failing-test attribution.

| id | severity | reviewer | finding | disposition |
|---|---|---|---|---|
| F8 | low | deepseek-v4-pro | The PR body's opening paragraph still said the ignore entry "is unanchored" in the present tense, contradicting the anchored `.gitignore`; the correction was recorded only in the assumptions section. | **Incorporated.** Opening paragraph rewritten. The same stale sentence in the first commit's message was reworded by rebase, so the squashed history will not carry a claim its own diff contradicts. |
