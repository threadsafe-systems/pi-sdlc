# PR panel — sdlc lifecycle retro fixes, batch 1 (PR #103)

- Date: 2026-07-18
- Phase: `pr_review` (reversible track — no pre-PR panels; this PR panel still runs)
- Branch: `feat/sdlc-lifecycle-retro-fixes-batch1`
- Orchestrating model (disclosure): `anthropic/claude-opus-4-8` (the author/orchestrator of this session)
- Governing docs: `docs/plans/2026-07-18-sdlc-lifecycle-retro-fixes-batch1.md` (+ `-build.md`)

## Panel roster and provider reality

Configured `pr_review` floor: `panelSize: 3`, `review.onShortfall: fail`.
Configured `prefer`: `[anthropic/claude-fable-5:high, openai-codex/gpt-5.6-sol:high,
google/gemini-3.1-pro-preview:high, deepseek/deepseek-v4-pro:high]`.

This panel exercised — live — the reviewer-dispatch-recovery rule this very batch
added (advance through the ordered `prefer` list on reviewer infra failure):

| Model | Provider | Outcome |
|---|---|---|
| `google/gemini-3.1-pro-preview` | Google | infra fail (429 prepay credits depleted), retried once, still failed |
| `anthropic/claude-fable-5:high` | Anthropic | round 1 findings; round 2 infra fail (429 account rate limit) |
| `openai-codex/gpt-5.6-sol:high` | OpenAI | round 1 findings; later infra fail (child-tool `intercom` unavailable) |
| `deepseek/deepseek-v4-pro:high` | DeepSeek | completed with findings (fallback candidate) |
| `amazon-bedrock/global.anthropic.claude-opus-4-8` | Bedrock | completed with findings (final wave) |

### Conscious override (recorded)

With Gemini (billing), Anthropic-direct (rate limit), and OpenAI (child-tool
registration) all failing on the final wave, the human owner directed use of
**Bedrock Opus 4.8** to complete the panel. This is the *same underlying model*
as the presumed author (`authorDefault: anthropic/claude-opus-4-8`, which
`resolve-panel` had excluded), routed through a different provider. It restores
a live third reviewer and dodges the Anthropic rate limit, but it **weakens the
independence** that author-exclusion exists to protect. Recorded as a conscious,
human-adjudicated one-off override, not a silent relaxation of the floor.

Note: the bare `amazon-bedrock/anthropic.claude-opus-4-8` id 400s on-demand;
the invocable id is the inference profile `global.anthropic.claude-opus-4-8`.

## Findings and adjudication

Findings converged across waves; each is listed once with its disposition.

### Fixed (incorporated)

- **HIGH — SKILL.md `epic-done` example omitted the required `--pr` flag**
  (fable-5, gpt-5.6-sol, deepseek). The documented command could never succeed.
  → SKILL.md now documents `--epic <n> --pr <n>`.
- **HIGH — `checkEpicDone` ignored `--repo-root`, ran `gh` in `process.cwd()`**
  (fable-5, gpt-5.6-sol, deepseek). → threads `root` into every `gh` call; test
  `epic-done: uses the resolved repo-root for every gh call`.
- **HIGH/MEDIUM — declaration accepted any parseable block; `--slug` was a dead
  param** (fable-5, gpt-5.6-sol). → `checkDeclaration` validates track and
  matches the declared slug against `--slug`; `--slug` now consumed.
- **MEDIUM — `epic-done` accepted any merged PR without confirming it closes the
  epic's sub-issues** (gpt-5.6-sol). → uses GitHub-native `closingIssuesReferences`
  and requires every sub-issue be referenced.
- **MEDIUM — `CLOSE_RE` false-positived on negation / code fences** (fable-5).
  → regex scanning replaced entirely by native `closingIssuesReferences`.
- **MEDIUM — PR-open/panel ordering contradiction** (fable-5, gpt-5.6-sol).
  → completion `pr-open` check moved to after "open the PR", not before.
- **MEDIUM — `parseArgs` `value()` swallowed a following flag on a missing
  value** (deepseek). → lookahead-then-consume; test added.
- **MEDIUM — `epic-done` vacuously passed on an epic with zero sub-issues**
  (bedrock opus-4-8). → now an `error` (exit 2); test added.
- **LOW — regex-metachar `--closes`/`--epic`/`--pr` could throw uncaught**
  (fable-5). → numeric validation in `parseArgs`; test added.
- **LOW — unpaginated `subIssues(first:100)` truncation** (fable-5). → refuses
  on `pageInfo.hasNextPage`.
- **LOW — unreachable slug-format guard** (bedrock opus-4-8). → reordered so it
  validates the untrusted PR-body slug first.
- **LOW — `pr-open` silently skipped linkage when `--closes` omitted**
  (bedrock opus-4-8). → emits a visible `closes.linkage` note; test added.
- **LOW — infra-failure vocabulary diverged between the reviewer and worker
  SKILL.md sections** (deepseek). → aligned (both include overload/billing
  exhaustion and empty output).
- **LOW — duplicated `--format` detection in the CLI shim vs `parseArgs`**
  (fable-5). → shim now reuses the single `parseArgs` result.
- **LOW — nested ternary / typo (`unparseable`)** (lens runners). → rewritten.

### Deferred with reason (dismissed for this batch)

- **MEDIUM (smell) — `sanitize`/`setResult`/`value()` duplicated from
  `check-lifecycle.mjs`** (fable-5, bedrock opus-4-8). A baseline smell, capped
  at medium and explicitly a judgement call. Deduping into `lib.mjs` would
  require editing the frozen FS8/FS9 checker surface (`check-lifecycle.mjs`) and
  its test corpus — disproportionate scope for a reversible docs/tooling batch.
  Recorded as a follow-up; not actioned here. The one concrete divergence noted
  (`sanitize` `max` 300 vs 120) is intentional (completion messages carry longer
  `gh` stderr) and harmless.

## Stop condition

No high or medium finding survives adjudication: every high/medium is either
incorporated or (for the one capped-medium smell) dismissed with a recorded
reason. Low findings recorded above. Deterministic gates green: `npm test`
(237+ tests), `biome check` clean, `check-lifecycle` pass, `check-completion
--claim pr-open` pass.
