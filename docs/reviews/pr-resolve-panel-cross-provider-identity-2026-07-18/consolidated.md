# PR panel — resolve-panel cross-provider model identity (issue #80)

- Date: 2026-07-18
- Phase: `pr_review` (reversible track — no pre-PR panel; this PR panel still runs)
- Branch: `fix/resolve-panel-cross-provider-identity`
- Commit reviewed: `f649499829cb04578d37ba581878a2c1b0ee4b9a`
- Orchestrating model (disclosure): `anthropic/claude-opus-4-8` (the author/orchestrator of this session)
- Governing docs: `docs/plans/2026-07-18-resolve-panel-cross-provider-identity.md` (+ `-build.md`)

## Panel roster and provider reality

Configured `pr_review` floor: `panelSize: 3`, `review.onShortfall: fail`.
Configured `prefer` (as committed by this PR): `[anthropic/claude-fable-5:high,
openai-codex/gpt-5.6-sol:high, google/gemini-3.1-pro-preview:high,
deepseek/deepseek-v4-pro:high, amazon-bedrock/global.anthropic.claude-opus-4-8:high]`.
Author (`anthropic/claude-opus-4-8`) excluded per floor >= 2 (also excludes the
new Bedrock candidate, since it collapses to the same identity — this PR's own
mechanism working as designed against its own author).

| Model | Provider | Outcome |
|---|---|---|
| `anthropic/claude-fable-5:high` | Anthropic | completed, 4 findings (1 medium, 3 low) |
| `openai-codex/gpt-5.6-sol:high` | OpenAI | completed, no findings |
| `google/gemini-3.1-pro-preview:high` | Google | infra fail (429 prepay credits depleted), retried once per the auto-retry-once rule, still failed |
| `deepseek/deepseek-v4-pro:high` | DeepSeek | advanced-to fallback candidate (per the batch-1 dispatch-recovery rule: advance through `prefer` on reviewer infra failure) — completed, 2 findings (both low) |

Panel achieved: 3 distinct-identity completions (fable-5, gpt-5.6-sol,
deepseek-v4-pro) — floor met without needing the new Bedrock fallback itself
(which was excluded as the author's own identity, as intended).

## Findings and adjudication

### Incorporated

- **MEDIUM — unrecognized Bedrock routing prefixes could defeat author-exclusion** (fable-5).
  `modelIdentity()` rewritten from a hardcoded region-prefix whitelist to a
  vendor-segment scan: it now finds a recognized alias vendor (`anthropic`,
  `deepseek`) as a dot-segment anywhere in a Bedrock model id, rather than
  only after stripping one of five hardcoded region prefixes. This closes
  the self-review-bypass gap for any current or future AWS routing prefix
  and also resolves deepseek's low finding below (the discarded-prefix-strip
  code path no longer exists — the whole prefix-list mechanism is gone).
- **LOW — Bedrock roster entry omitted `:high`** (fable-5). Added, for
  consistency with the other four `pr_review` candidates.
- **LOW — test comment imprecision + missing cross-region dedup test** (fable-5).
  Reworded the version-distinctness test's comment to state plainly that the
  ids *do* collapse to a canonical form and merely stay mutually distinct by
  version. Added a new test exercising the actually-novel merge path: same
  model + same version, different Bedrock region, dedupes to exactly one
  panelist.
- **LOW — Bedrock-native prefix-strip-then-discard code smell** (deepseek).
  Resolved as a side effect of the `modelIdentity()` rewrite above — the
  discarded intermediate computation no longer exists.
- **LOW — PV1 manifest `tests` check narrower than the Build DoD's "full
  `npm test` suite green"** (deepseek). Manifest's `tests.resolve-panel`
  check replaced with `tests.full-suite` running `npm test` (all 29 files,
  316 tests) instead of just the one file.

### Dismissed (recorded, not incorporated)

- **LOW — new Bedrock fallback is permanently inert whenever the author is
  `claude-opus-4-8` (the config's own `authorDefault`)** (fable-5). This is
  correctly observed but is the *intended* behaviour, not a defect: the
  entire point of this PR's identity-collapsing fix is to prevent a
  Bedrock-hosted Claude from substituting for a direct-API Claude author —
  exactly the substitution PR #103's crisis used as a conscious one-off
  override. A fallback that "worked" when the author is opus-4-8 would mean
  the independence guarantee had a hole. Documented instead of coded around:
  added a note to the roster's `$comment` in `.pi/sdlc/sdlc.config.json`
  stating explicitly that this candidate is always excluded when the author
  is the default identity, and only helps a non-opus-4-8 author fill a 5th
  distinct-identity seat.

No high-severity findings from any panelist. No finding survived adjudication
without either a code/doc fix or a recorded reason.

## Stop condition

All incorporated findings addressed; the one dismissed finding is a recorded,
reasoned non-fix. Full suite (316/316) and lint clean after the fix wave. No
further review round required — this consolidated file is the durable
internal record; it is not restated in the PR body.
