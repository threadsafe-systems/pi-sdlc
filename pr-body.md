```sdlc
track: irreversible
slug: config-intent-vocabulary
```

## Summary

schemaVersion 3 intent-vocabulary clean break (IC-A). Replaces the
`lifecycle`/`profile`/`enforcement` config with always-explicit
`review`/`shape`/`overrides` blocks; deletes `profile`, `minVendor`,
`excludeAuthorVendor`, the vendor resolution axis, and `migrate.mjs`.
`resolve-panel` runs one model-identity path; `setup-sdlc` gains
`--preset` + per-dial flags + `--override` and a preset-patch path; older
configs are refused with an honest remedy (no migration — sole adopter
hand-authors v3). SKILL prose re-points to the committed dials.

**Accepted behaviour change (this repo):** migrating our own config to v3
adopts OL-A panel semantics — panels are floor-capped at `panelSize` and
author exclusion is by model identity (so an anthropic non-author model may
sit on a PR panel). Floors are preserved from the prior config.

## Governing documents

- Plan: `docs/plans/2026-07-17-config-intent-vocabulary.md` (rev 5)
- Specification: `docs/specs/2026-07-17-config-intent-vocabulary.md` (rev 3)
- Build plan: `docs/plans/2026-07-17-config-intent-vocabulary-build.md`
- ADRs: `docs/adr/0026-intent-vocabulary-config-v3.md`,
  `docs/adr/0027-pre-adoption-clean-break-policy.md`,
  `docs/adr/0022-user-owned-panel-enforcement-posture.md` (revised)

## Tracker references

- Epic: #86
- Tasks: #87, #88, #89, #90
- Board: pi-sdlc (project 5)

Closes #87
Closes #88
Closes #89
Closes #90

## Validation

211 tests pass (`node --test`), biome clean, `node --check` clean on every
edited script; `sdlc-status` reports ready on the branch. Plan and Spec
panels ran (2 models each; all findings adjudicated) — artifacts under
`docs/reviews/`.

BREAKING CHANGE: sdlc.config.json schemaVersion 3 replaces the schemaVersion 2
lifecycle/enforcement vocabulary with review/shape/overrides. There is no
config migration; re-run setup-sdlc (or pin the prior release).
