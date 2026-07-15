# Plan: opt-in lifecycle — OL-A sub-change (config vocabulary and resolution)

- Date: 2026-07-14
- Track: **irreversible** (freezes the `lifecycle` config vocabulary,
  FS1-additive)
- Slug: `opt-in-lifecycle-config`

This is the **thin sub-change plan** for OL-A of the opt-in lifecycle stream.
The stream plan (`docs/plans/2026-07-14-opt-in-lifecycle.md`, rev 3+) is
canonical for objectives, rationale, the Binding migration decision, the
decomposition (OL-A → OL-B → OL-C), and compatibility constraints; this
document exists so the OL-A PR's declared slug resolves to its own committed
plan/spec/build artifact set, per FS9 v1's artifact demands.

## Objective (delegated)

Deliver OL-A exactly as specified by
`docs/specs/2026-07-14-opt-in-lifecycle-config.md` (rev 4, panel-reviewed
twice, human-approved): the `lifecycle` config vocabulary and validation, the
`decomposeGateMode` decomposition, model-identity panel resolution, and
profile-aware fresh-adoption setup — with no checker, skill-prose, or FS10
report change (those are OL-B/OL-C).

## Definition of done (delegated)

Scenarios OLA1–OLA21 (spec §6) pass via the check commands named in the build
plan (`docs/plans/2026-07-14-opt-in-lifecycle-config-build.md`); NF-1/NF-2/
NF-3 hold; the existing test corpus passes unmodified.

## Scope out

Everything the spec's §7 lists, verbatim — OL-B (checker, FS10 v2, evidence
surface, profile application to adopted repos), OL-C (SKILL.md, entrypoints),
FS2 schema changes.
