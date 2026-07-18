# Plan: resolve-panel cross-provider model identity + roster fallback fix

- Date: 2026-07-18
- Track: **reversible** (fast path). Internal resolver logic and this repo's
  own committed roster data; no persisted consumer schema change, no
  public/frozen contract touched. `resolve-panel.mjs`'s stdout shape
  (one model id per line, or the `--emit-tasks` JSON) and exit codes are
  unchanged.
- Source: Issue #80 (`resolve-panel: shared credential table + record-and-
  proceed (T3, H3)`), scope narrowed and widened by this session's brainstorm
  against the issue's 2026-07-18 batch-1-retro comment.
- Human gate: **Approved** by Neil Chambers, 2026-07-18 (brainstorm dialogue:
  "keep; reversible; let's fix our own roster ids").

## Objective

Close the two gaps in resolve-panel's model-identity handling that #80's
retro-comment scope-widening identified, without reopening the parts of #80
that later work already resolved.

## Status audit (brainstorm finding, not new work)

Issue #80's original T3 and H3 are **already resolved**, chronologically
overtaken by work that landed after the issue was filed:

- **T3** (resolver didn't recognize `GEMINI_API_KEY`) — fixed same day,
  commit `a67be29`. `resolve-panel.mjs`'s `ENV_VARS` table already lists
  `google`.
- **H3** (hard-halt instead of record-and-proceed) — the requested mechanism
  (form best panel, record shortfall, proceed) shipped the next day as the
  `review.onShortfall: "proceed"|"fail"` config dial (schemaVersion 3,
  commit `a6b9d80`). `resolve-panel.mjs` already implements exactly this.

This repo's own `.pi/sdlc/sdlc.config.json` deliberately keeps
`onShortfall: "fail"` — a considered choice, confirmed to stand, not a defect
this plan revisits.

## Contradiction / boundary named up front

The retro comment's gap 1 ("invocable model-id, not just credentialed
vendor") has no static fix: `pi --list-models` lists both the bare
`amazon-bedrock/anthropic.claude-opus-4-8` and the invocable
`amazon-bedrock/global.anthropic.claude-opus-4-8` as available — the 400 is a
live-invocation-only failure mode, only observable via `--pong` (opt-in,
costs a call per candidate). Rather than adding resolver-side structural
validation for one provider's id quirks, this plan fixes the actual root
cause found in PR #103's review trail: pi-sdlc's own roster never listed a
Bedrock candidate at all. The bare-id 400 came from a human ad-hoc override
during that PR's live panel crisis (3 of 4 configured panelists infra-failed
in one run), not from a resolver bug or a broken roster entry. This plan
turns that emergency override into a real, correctly-idd roster entry instead
of writing code to defend against a self-inflicted typo.

## Scope

### In

- `resolve-panel.mjs`'s `modelIdentity()`: collapse known cross-provider
  aliases to the same identity key for author-exclusion purposes only (panel
  output still prints the real, invocable id — never the canonical form).
  Concretely:
  - Strip Bedrock's region/`global.` inference-profile prefix from the model
    segment before comparing.
  - Map recognized cross-provider vendor dotted-names (at minimum
    `anthropic.*`, `deepseek.*`) hosted on `amazon-bedrock` to the direct
    provider's `provider/model` identity form (e.g.
    `amazon-bedrock/global.anthropic.claude-opus-4-8` collapses to the same
    identity as `anthropic/claude-opus-4-8`).
  - Preserve the existing, already-correct rule that only a *recognized*
    trailing `:thinking` token is stripped — a Bedrock version qualifier
    (e.g. `-v1:0`) is never mistaken for a thinking suffix and stays part of
    identity (this guards the exact ambiguity flagged repeatedly in the
    2026-07-14 opt-in-lifecycle-config spec reviews).
  - Bedrock-native models with no direct-provider equivalent (e.g.
    `amazon.nova-*`) are left as their own identity, untouched.
- `.pi/sdlc/sdlc.config.json`: add `amazon-bedrock/global.anthropic.claude-
  opus-4-8` (the correct, invocable inference-profile id) to `pr_review`'s
  `prefer` list as a 5th fallback candidate. `plan_review`, `spec_review`,
  `task_validate` are untouched — their 4-candidate rosters were not the ones
  that ran dry in PR #103.
- `test/resolve-panel-v3.test.js`: new cases —
  - a Bedrock-hosted Claude collapses to the same identity as direct-API
    Claude for author-exclusion (the PR #103 scenario, made mechanically
    verifiable instead of relying on a human override again);
  - two distinct Bedrock version-qualified ids stay distinct identities;
  - a Bedrock-native id with no direct-provider counterpart is unaffected.
- Close #80, recording the T3/H3-already-resolved audit above so the tracker
  reflects reality rather than silently going stale.

### Out

- Any resolver-side structural validation of Bedrock id invocability
  (region-prefix regex, `--pong`-by-default, etc.) — no static signal exists
  to justify it; revisit only if a *future* provider/id pairing recurs after
  this fix.
- Flipping `onShortfall` for pi-sdlc's own config — confirmed to stand as-is.
- Any change to the credential-table architecture (`ENV_VARS`) beyond what
  T3 already fixed — no evidence of a further gap there.
- Adding Bedrock to `plan_review`/`spec_review`/`task_validate` rosters.

## Definition of done

- [ ] `modelIdentity()` collapses the documented Bedrock cross-provider
      aliases; version-qualified and Bedrock-native ids remain distinct.
- [ ] `pr_review`'s `prefer` list carries the correctly-idd Bedrock fallback
      candidate.
- [ ] `test/resolve-panel-v3.test.js` covers all three new cases; full suite
      green.
- [ ] `npm test` and `npm run lint` (biome) clean.
- [ ] Issue #80 closes on this effort's PR merge (`Closes #80`), with the
      T3/H3-already-resolved audit recorded in the PR body or a linked
      comment.
- [ ] PR panel runs to the stop condition (reversible track: no pre-PR
      panel; the PR panel still runs).

## Context for the next agent

Build must pin: the exact set of cross-provider vendor dotted-names
`modelIdentity()` recognizes for Bedrock aliasing (this plan names
`anthropic` and `deepseek` as the minimum — extend only if the roster
actually carries another Bedrock-hosted vendor with a direct-provider
equivalent), and the exact regex/parsing approach for stripping Bedrock
region prefixes. Verified live against this session's `pi --list-models`
output (`amazon-bedrock` rows only): the region prefixes actually present
are `us.`, `eu.`, `au.`, `jp.`, `global.` — no `usgov.`/`apac.` observed.
Treat this as a live snapshot, not a documented AWS guarantee: re-verify
against `pi --list-models` at Build/Implement time rather than trusting this
list as exhaustive or stable.
Below the `shape.publishToTracker: 2` threshold this build plan likely stays
a plain committed doc (small, single-file-focused change) — Build confirms
task count either way.
