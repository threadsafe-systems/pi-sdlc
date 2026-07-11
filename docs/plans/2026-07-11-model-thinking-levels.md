# Plan: document + adopt `provider/model:thinking` in panel preferences

- Date: 2026-07-11
- Track: **reversible** (docs/config only). Touches the FS2 schema file
  (`sdlc.models.schema.json`) but only via `description` additions — the
  validation contract (`pattern`, `required`, allowed properties) is
  unchanged, so nothing that was valid or invalid before changes. No ADR:
  the ADR trigger (hard to reverse, surprising, a real trade-off) isn't met
  by a documentation-only addition to a schema field.
- Brief brainstorm: this session's design conversation with the project
  owner, including a live verification dispatch confirming the mechanism.

## Objective

pi supports a `provider/model:thinking` shorthand (confirmed live: a
per-task `model` override of `"openai-codex/gpt-5.6-luna:low"` produced two
distinct session events, `model_change` then `thinking_level_change`, not a
silently-dropped suffix). `sdlc.models.json`'s `prefer` arrays already accept
this string shape today (`PM_RE = /^[^/]+\/.+$/` matches it; `vendor()`,
`hasCreds()`, and `pongOk()` in `lib.mjs` are all unaffected, verified).
Document the syntax so it's a discoverable, intentional pattern rather than
an implicit accident of a permissive regex, and adopt real levels in this
repo's own dogfood roster.

## Rationale

Reviewers judging an irreversible-track design decision (plan/spec panels)
benefit from more reasoning than a mechanistic checklist executor
(`task_validate`, which this project already picked a cheap/fast model for
on purpose). Making thinking level a first-class, documented part of model
preference lets each phase's rigor match its actual cost.

## A caught risk, deliberately not fixed by adding validation

Bedrock model IDs use colons for version numbers, not thinking levels — e.g.
`amazon-bedrock/anthropic.claude-opus-4-8-v1:0` (seen live in this session's
`pi --list-models` output). A validator that rejects an "unrecognized"
colon-suffix would break legitimate Bedrock preferences by mistaking `:0`
for an invalid thinking level. This project already validates model strings
by shape, not enum membership, because model IDs drift and aren't ours to
catalog. Conclusion: **no new validation code** — pure documentation, so this
risk is avoided by construction rather than by a runtime check.

## Scope

### In

- `schema/sdlc.models.schema.json`: add a `description` to the `phase`
  definition's `prefer` property documenting the `provider/model[:thinking]`
  shape, the valid levels (`off, minimal, low, medium, high, xhigh, max`),
  and the Bedrock-colon caveat as an explicit note against ever tightening
  this into a rejecting validator.
- `schema/sdlc.models.example.json`: illustrate the syntax with one example
  entry using a `:thinking` suffix (generic model ids, not tied to any real
  roster).
- This repo's own `.pi/sdlc/sdlc.models.json` (dogfood): set real levels per
  phase, reasoned explicitly:
  - `plan_review`, `spec_review`: `high` — irreversible-track design
    tradeoffs, gated once or twice per effort; worth the cost.
  - `pr_review`: `medium` — genuine defect-finding benefits from reasoning,
    but this panel iterates across fix waves (min_panel 3, most vendors) so
    cost compounds; `medium` balances rigor against repeated-run cost.
  - `task_validate`: `low` — a mechanistic checklist executor, not a judge;
    already deliberately cheap (`luna`), `low` rather than `off` so it can
    still reason through command output to a pass/fail.
  - Update the `$comment` to note the syntax is supported.

### Out

- No `lib.mjs` / `validateConfig` / `validateModels` code changes.
- No change to the not-yet-built `authors.{plan,spec,implement}` config
  (should adopt the same string convention when it's designed, not a
  separate `thinking` field — noted for that future work, not built here).
- No enum validation of thinking levels (see the caught risk above).

## Definition of done

- [ ] Schema `description` documents the syntax, levels, and Bedrock caveat.
- [ ] Example illustrates the syntax.
- [ ] This repo's roster carries real, reasoned levels per phase.
- [ ] `npm test` green (S3 example-validates-schema must still pass; no
      validation logic touched, so no new test cases required).
- [ ] PR opened, PR panel run to the stop condition.
