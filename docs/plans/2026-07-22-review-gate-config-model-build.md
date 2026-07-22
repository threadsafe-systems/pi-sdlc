# Build plan: review-gate config model (`review-gate-config-model`)

- **Slug:** `review-gate-config-model`
- **Date:** 2026-07-22
- **Track:** irreversible — tasks map to the Spec's falsifiable scenarios
  (S1–S17), never re-derived.
- **Governing plan:** `docs/plans/2026-07-22-review-gate-config-model.md` (rev 2,
  approved at the design gate 2026-07-22).
- **Governing spec:** `docs/specs/2026-07-22-review-gate-config-model.md` (rev 2,
  owner pre-approved after the spec panel 2026-07-22).
- **Branch:** `feat/review-gate-config-model`
- **Issue:** #150.

## Decomposition rationale (assumption-tier, stated inline)

Sliced as **five tasks** along the natural seam boundaries the Spec §6 names.
**T1 (schema + validation core)** must land first: it owns the frozen schema
shape *and* the single shared `effectiveReview` helper (Spec C3c) that every
other consumer imports — so T2 and T3 have a genuine content dependency on it
(`blockedBy` edges). **T2 (resolver + renderer)** and **T3 (setup authoring)**
are independent of each other. **T4 (prose + ADRs)** is prose-only and
independent. **T5 (integration)** flips this repo's own config to v4, regenerates
CONFIG.md, updates every v3-hardcoded test fixture, and only it can prove the
full suite green — so it is `blockedBy` all of T1–T4. Object via a Build
correction if this slicing is wrong.

## T1 — Schema + validation core (`schema/*`, `lib.mjs`)

**Objective.** Land the frozen v4 shape and its validation:

- `skills/sdlc/schema/sdlc.config.schema.json`: replace `gateMode` def with a
  `gateDial` object def (`additionalProperties:false`, `required:["validate",
  "approve"]`, `validate` enum `["panel","skip"]`, `approve` enum
  `["human","agent"]`, optional `preview` boolean); point `review.design`/`.code`
  at it; add a **partial** `gateDialOverride` def (all fields optional, `minProperties:1`)
  for `trackOverride.review.design`/`.code`; `schemaVersion const: 4`.
- `skills/sdlc/scripts/lib.mjs`: `VALIDATE_MODES`/`APPROVE_MODES` replace
  `GATE_MODES`; `validateReviewDial` validates the object for `design`/`code`
  (base = both required; override = partial, keyed off the `at` prefix per
  spec-panel gemini CLEAR-C); `collectOverridesIssues` allows partial dials;
  `CONFIG_SCHEMA_VERSION=4`; `KNOWN_PAST_VERSIONS` gains `3`; `REMEDY_SCHEMA_*`
  say v4; **delete `decomposeGateMode`**; add the **shared exported**
  `effectiveReview(config, track)` (deep-merge for `design`/`code` per C3c).
- `skills/sdlc/schema/sdlc.config.example.json`: object shape + `schemaVersion 4`.

**Satisfies (Spec):** S1, S2, S3, S4, S7, S8, S13(b/c reject); C1, C2, C3(helper),
C4.

**Checks (PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `node --test test/lib-config.test.js test/config-intent-vocabulary.test.js test/schema-break.test.js test/readiness-lib.test.js` | required — validation + version-classification green |
| static | `npx biome check skills/sdlc/scripts/lib.mjs skills/sdlc/schema` | required |
| standards | `node -e "import('./skills/sdlc/scripts/lib.mjs').then(m=>{if(m.CONFIG_SCHEMA_VERSION!==4)process.exit(1)})"` | required — version is 4 |
| bannedPatterns | `grep -n "decomposeGateMode\|GATE_MODES" skills/sdlc/scripts/lib.mjs` | required — ABSENT (removed symbols) |

## T2 — Resolver + renderer (`resolve-panel.mjs`, `config-doc.mjs`)

**Objective.** Consume the shared helper; no private merge survives.

- `resolve-panel.mjs`: drop the `decomposeGateMode` import; `effective()` is
  backed by the shared `effectiveReview`; the panel-presence guard becomes
  `effective(DIAL_FOR[phase]).validate === "skip"`; refresh v3 strings (@3,55).
- `config-doc.mjs`: `GATE_MEANING` scalar map → field-level `validate`/`approve`
  explanations; `effectiveReview` is the imported shared helper (not a private
  copy); `trackSummary` renders `validate` + `approve` (+ a `preview: reserved
  (no effect in v4)` line when present); refresh v3 string (@183).

**Satisfies (Spec):** S5(resolver+doc), S6, S10, S13(a); C5, C6.

**Blocked by:** T1 (shared helper + schema).

**Checks (PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `node --test test/resolve-panel-v3.test.js test/config-doc.test.js test/setup-config-doc.test.js` | required |
| static | `npx biome check skills/sdlc/scripts/resolve-panel.mjs skills/sdlc/scripts/config-doc.mjs` | required |
| bannedPatterns | `grep -rn "decomposeGateMode" skills/sdlc/scripts/resolve-panel.mjs skills/sdlc/scripts/config-doc.mjs` | required — ABSENT |

## T3 — Setup authoring (`setup-sdlc.mjs`, `setup-sdlc.sh`, `templates/setup-sdlc.md`)

**Objective.** Author v4 objects through every setup path.

- `LIFECYCLE_PRESETS` emit gate-dial objects (Spec C7a: solo `design skip/human`,
  `code panel/agent`; standard `design skip/human`, `code panel/human`; full
  `design panel/human`, `code panel/human`, `overrides.reversible.review.design
  {validate:skip}`).
- Flags `--review-design`/`--review-code` take `<validate>/<approve>` (C7b);
  `--override` design/code takes `<validate>/<approve>` with an omittable half
  (C7c); tasks/panelSize unchanged.
- Interview: **one compound prompt per object dial** (C7d, ≤3-prompt ceiling).
- `.sh` usage + `templates/setup-sdlc.md` reword to the new grammar; refresh v3
  strings (@34,244,567 / @18).

**Satisfies (Spec):** S14, S9(templates/usage portion); C7.

**Blocked by:** T1 (validation accepts what setup emits).

**Checks (PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `node --test test/setup-sdlc.test.js test/setup-v3.test.js test/setup-config-doc.test.js` | required |
| static | `npx biome check skills/sdlc/scripts/setup-sdlc.mjs` | required |
| bannedPatterns | `grep -n "panel|advisory|human|off" skills/sdlc/scripts/setup-sdlc.sh templates/setup-sdlc.md` | required — ABSENT (gate enumeration) |

## T4 — Prose + ADRs + telemetry directive

**Objective.** Reconcile prose and record the decision.

- `SKILL.md` effective-shape reading protocol (@86); `phase-plan.md`,
  `phase-spec.md`, `phase-pr-review.md` (@230) "under your configuration"
  callouts + the **effective-approver** reconciliation (Spec C9/S11);
  `system-reference.md` callouts + telemetry directive reworded to "every gate
  approval (human or agent)" with the `agent` approver value (S17).
- New ADR (next free number) per Spec C8 (decomposition, `agent`/`skip` naming,
  desugar table, intentional `advisory` amendment, invariant, reserved preview,
  clean-break posture).
- Amend `docs/adr/0027-*.md`: "external adopter" = genuine third party, excludes
  co-owned dogfood repos; coordinated clean break, not a migrator.

**Satisfies (Spec):** S9(prose), S11, S12, S17; C8, C9.

**Checks (PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `node --test test/phase-references.test.js test/system-reference.test.js test/skill-kernel.test.js test/docs.test.js test/adr-absorption.test.js test/telemetry-emitter.test.js` | required |
| static | `npx biome check .` | required |
| standards | `grep -q "effective approver" skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md` | required — reconciliation prose present |

## T5 — Integration: this-repo config + CONFIG.md + fixtures + sweeps + full green

**Objective.** Flip the dogfood repo to v4 and prove the whole thing green.

- `.pi/sdlc/sdlc.config.json` → v4 (`design`/`code` = `{validate:panel,
  approve:human}`; `overrides.reversible.review.design` = `{validate:skip}`
  partial); regenerate `.pi/sdlc/CONFIG.md` via `config-doc.sh write`.
- Update **every** v3-hardcoded fixture/test the spec panel enumerated:
  `test/fs8-helpers.js` (`VALID_CONFIG`), `test/hooks.test.js`,
  `test/telemetry-side-effects.test.js`, `test/installed-consumer.test.js`,
  `test/check-completion.test.js`, `test/check-lifecycle-git.test.js`,
  `test/check-lifecycle.test.js`, `test/readiness-lib.test.js`, and every
  `test/fixtures/**` config (begin with a repo-wide grep for `schemaVersion` /
  `design: "` / `"advisory"` under `test/`).
- Add the **scoped stale-vocabulary + version-string sweep test** (S9) to
  `docs.test.js`/`frozen-surfaces.test.js`.
- Verify `check-lifecycle.mjs`/`sdlc-status.mjs` need no logic change (version
  seam consumed via `lib.mjs`); FS8/FS9 ids/exits unchanged (N5).

**Satisfies (Spec):** S9(sweep test), S15, S16.

**Blocked by:** T1, T2, T3, T4.

**Checks (PV1 manifest projected from this table):**

| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `node --test test/*.test.js` | required — full suite green (S16) |
| static | `npx biome check .` | required — repo lint (S16) |
| standards | `node skills/sdlc/scripts/sdlc-status.mjs --format json` (exit 0) | required — repo ready on v4 (S15) |
| standards | `node skills/sdlc/scripts/config-doc.mjs check` (state `current`) | required — CONFIG.md regenerated (S10/S15) |

## Assumptions (appendix — accrues during Implement; copied into the PR body)

- (build-time) Five-task slicing and the T1←T2/T3 and T5←all edges, per the
  rationale above.
- Fixture enumeration is grep-driven at T5 start; any fixture the grep finds
  beyond the panel's named list is in-scope for T5 (completeness over the named
  list, per spec-panel H1).

## Tracker projection

Threshold met (5 tasks ≥ `shape.publishToTracker: 2`): one epic (`sdlc:epic`) +
five sub-issues (`sdlc:build-task`) on board 5; T2/T3 wired `blockedBy` T1, T5
wired `blockedBy` T1–T4. This doc remains canonical; the tracker is a projection.
