<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->

```sdlc
track: reversible
slug: sdlc-retro-panel-precision
```

Makes the sdlc-retro collector preserve logical review-wave identity across
multi-round and infra-replacement panel harvests, and reconciles review-dir
naming so the collector actually discovers current-form directories.

Root problem (closes #118): the panel-precision join required exactly one
harvested panel directory per `(panelPhase, date)` — so any stream that ran a
fix wave (the common case) dropped all precision as `precision.unparsed`. And
`discoverReviewDirs` only matched `<phase>-<slug>-<date>`, silently ignoring
the `<phase>-review-<slug>-<date>` form the repo has used since 2026-07-14.

Design (all additive, reversible): `harvest-panel.mjs` gains an optional
`--wave` (defaults to `--round`) and writes a `{round,wave}` `meta.json`
sidecar; the collector reads it (absent → `wave=round`; malformed → fallback +
`panels.malformed_meta:<phase>` marker) and groups the precision join by
`(panelPhase, wave, date)`, emitting `precision.unparsed` only when waves
genuinely disagree; `render-retro` groups the deep-dive by wave, collapsing
same-wave rounds. The naming regex **and** `buildSoftData`'s phase extraction
now accept both forms; the spec and PR-review reference keep their original
naming line and gain `-review-` as an accepted alternative. `wave` is optional
on the `run.json` v1 record (validator + schema allow-not-require it), so every
existing record still validates — no v1→v2 bump.

## Governing documents

- Plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision.md`
- Build plan: `docs/plans/2026-07-19-sdlc-retro-panel-precision-build.md`
- Reversible track — no Specification is required.

## Tracker references

- Epic: #120
- Tasks: Closes #121, Closes #122, Closes #123, Closes #124
- Board: pi-sdlc build board (org project 5)

## Assumptions & discretionary calls

Copied from the build-plan doc's "Assumptions" appendix:

- Four-task slicing (T1 harvest+telemetry → T2 naming → T3 collector consume →
  T4 render), with T3 blockedBy {T1,T2} and T4 blockedBy T3; T2 and T3 sequenced
  because both edit `buildSoftData`.
- `panelPrecision[]` carries both `round` and `wave` set to the wave value (the
  parked keep-vs-replace question, resolved "keep both"): `round` retained for
  `run.json` v1 validator compatibility, `wave` added for the render join.
- Validator model: `task_validate` primary `gpt-5.6-terra` deterministically
  echoed the acceptance-report template without running the runner (twice on
  T1); replaced with `anthropic/claude-haiku-4-5` per the dispatch-recovery
  rule for all four task validations.
