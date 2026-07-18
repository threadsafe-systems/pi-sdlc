# ADR 0026: intent-vocabulary configuration (schemaVersion 3)

- Status: accepted
- Date: 2026-07-17
- Amends: ADR 0021 (config schema clock), ADR 0022 (enforcement posture)
- Supersedes the persisted `lifecycle`/`profile` vocabulary introduced by the
  opt-in-lifecycle stream (OL-A)

## Context

The schemaVersion-2 config expressed process shape through a `lifecycle` block
whose `profile` key was a write-time preset label that nothing read at
runtime, a gate matrix (per-gate `mode`/`minPanel`, `mergePlanSpec` interlock)
duplicated by a separate `panels.phases.*.minVendor` floor on a different
resolution axis, and a top-level `enforcement` key whose name did not describe
what it governed (panel-shortfall posture). Understanding a committed config
required reading `lib.mjs` and the skill; some keys (`publishThreshold`) had no
reader at all.

## Decision

Replace `lifecycle` and `enforcement` with two always-explicit intent blocks in
`.pi/sdlc/sdlc.config.json` (schemaVersion 3):

- `review`: `brainstorm` (human|off), `design` and `code` (panel|advisory|
  human|off), `tasks` (subagent|self|off), `panelSize` (integer floor),
  `onShortfall` (proceed|fail — the renamed ADR 0022 posture).
- `shape`: `separateSpec` (boolean, inverse of the old `mergePlanSpec`),
  `publishToTracker` (integer|"never"), `defaultTrack` (irreversible|
  reversible).
- optional `overrides`: per-track (`irreversible`/`reversible` only) dial
  overrides.

There is exactly one floor concept — `review.panelSize`, model-identity axis,
with an optional per-phase `panels.phases.<phase>.panelSize` override. The
vendor-distinct axis, its heuristic, `panels.rules.excludeAuthorVendor`, and
`profile` are deleted with no successor (author exclusion derives from
floor ≥ 2). Presets (`solo`/`standard`/`full`) survive only inside `setup-sdlc`
as answer bundles that expand into explicit dials; they are never persisted.

Kernel safety is structural: closed top-level and per-block vocabularies, no
key for the merge gate, `defaultTrack` and `overrides` keys enum-closed so no
config can express `track: none` as a lane.

## Consequences

- Every persisted key is read at runtime (mechanically, or as prose-law the
  SKILL instructs the agent to read) and means exactly what it says.
- A config-schema shape break rides a package major per ADR 0021; the
  `CONFIG_SCHEMA_VERSION` bump to 3 trips the release guard.
- OL-B (checker v2) and OL-C (skill restructure) build on v3 directly; the
  OL-A `profile`/existing-adopter-application deliverables are cancelled (see
  the opt-in-lifecycle plan rev-4 amendment).
