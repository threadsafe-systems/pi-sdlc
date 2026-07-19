# Plan: Retro collector — logical review-wave identity + review-dir naming reconciliation

- **Slug:** `sdlc-retro-panel-precision`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate; F4 dismissal human-ratified — see below)
- **Status:** rev2, awaiting design gate
- **Closes:** #118
- **Advisory review:** deepseek-v4-pro plan review (2026-07-19, beyond the
  reversible track's human-only gate, at the owner's request). Six findings;
  F1/F2/F3/F5 incorporated into this rev2, F4 dismissed with the owner's
  ratification (additive-narrowing adopted — track stays reversible, `run.json`
  stays v1 with `wave` an additive optional field).

## Objectives

1. **Preserve logical review-wave identity through the retro pipeline.** A run
   whose panel went through fix waves (multiple same-day harvest rounds,
   including infra-replacement dispatches) must retro to **one logical wave per
   review round**, with replacement dispatches attributed to their original
   wave — not counted as extra rounds and not silently dropped.
2. **Make the panel-precision join robust to multi-round streams.** Today the
   join requires exactly one harvested panel directory per `(panelPhase, date)`
   and emits `precision.unparsed` (dropping all precision) otherwise — which
   trips on *every* stream that needed a fix wave, the common case, not an edge
   case.
3. **Reconcile review-directory naming.** Widen the collector's discovery to
   accept both the historical `<phase>-<slug>-<date>` and the now-dominant
   `<phase>-review-<slug>-<date>` forms — in **both** `discoverReviewDirs`
   (directory listing) **and** `buildSoftData`'s phase extraction (the
   `startsWith` companion at `collect-run.mjs:885`, which fails on the
   `-review-` infix independently of the regex) — and add the `-review-` form
   to the spec and PR-review reference as an **explicitly-accepted alternative**
   (additive; the original naming line is preserved, not rewritten).
4. **Close the two recorded lows from #118**: the `<n>` placeholder that names
   two now-distinct numbers in the telemetry command templates, and the
   review-dir discovery pattern not matching a `-review-`-prefixed directory.

## Rationale

- The wave↔label mapping shipped by the `sdlc-question-discipline` stream lives
  only as prose in `consolidated.md`; the collector never consumes it, so a
  retro renders more apparent rounds than logical waves and — worse — the
  precision join's uniqueness requirement drops precision entirely for any
  multi-round day.
- Grounding (this session) established the join-uniqueness failure is the
  common case: `phase-pr-review.md` requires a fresh panel after each fix wave,
  and our own just-shipped stream produced four same-day harvest rounds — the
  exact failure shape.
- The naming mismatch has existed since before the collector was merged: the
  approved Specification (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md`)
  and a locking test both fix `<phase>-<slug>-<date>`, while repo practice has
  used `<phase>-review-<slug>-<date>` since 2026-07-14. Both forms coexist in
  `docs/reviews/` today.

## Agreed design (carried from Brainstorm)

**Wave vs round, carried coherently through three stages** (all additive and
backward-compatible — the `panel.*` telemetry payloads already accept extra
optional keys without a schema-version bump, confirmed against
`event.schema.json` and `validatePayload`):

- `harvest-panel.mjs` gains an **optional `--wave <n>`** (a positive integer;
  defaults to the `--round` value when omitted, so every historical harvest and
  every single-round dispatch is unaffected). It writes a small **`meta.json`
  sidecar** — `{ "round": <n>, "wave": <n> }` — alongside `status.json` and
  `events.jsonl` in the harvest directory, and includes `wave` in the
  `panel.harvested` event payload (optional field).
- `collect-run.mjs` `discoverPanels()` reads the sidecar (**absent → `wave =
  round`**, so pre-sidecar harvests degrade cleanly) and carries **both `round`
  and `wave`** on each panel entry, threaded through the `hard` assembly's
  `panels.map` (`collect-run.mjs:1061`) and allowed in `validateRunJson`'s
  panels key guard (**allowed-but-not-required**, so existing `wave`-less v1
  records still validate). The precision join groups by `(panelPhase, wave,
  date)` per the algorithm below. `panelPrecision[]` entries carry `wave`.

  **Precision join algorithm** (resolving F3): for a review directory of a
  given `(panelPhase, date)`, collect its `datedPanels`; take the distinct
  `wave` values among them. If they **all share one wave**, attribute the
  directory's precision to `(panelPhase, wave)`. Emit `precision.unparsed`
  **only when the waves disagree** (a genuine multi-wave same-date ambiguity,
  a narrow edge case) — not, as today, whenever more than one round shares a
  date. A single-panel `(panelPhase, date)` keeps today's behaviour (its lone
  wave defaults to its round).
- `render-retro.mjs` groups dashboard sections by **wave**, collapsing
  same-wave harvest rounds into one section (e.g. "Wave 1" listing its
  constituent rounds as sub-detail) and joining precision on `(panelPhase,
  wave)` — requiring `wave` to be present on the `hard.panels[]` entries per
  the collector change above.

**Naming reconciliation:**

- `discoverReviewDirs`' regex widens to accept both `<phase>-<slug>-<date>` and
  `<phase>-review-<slug>-<date>`, **and** `buildSoftData`'s phase-extraction
  `startsWith` (`collect-run.mjs:885`) is widened to the same two forms —
  without this companion fix the regex widening is inert and every `-review-`
  directory silently yields `precision.unparsed` (F1).
- The spec's review-artifact naming line and `phase-pr-review.md` §5's
  `<phase>-<feat>-<date>` guidance **keep their original wording** and gain the
  `-review-` form as an explicitly-accepted alternative (additive, per the F4
  ratification); the `-review-` form is recommended going forward. Old-style
  directories remain valid and are not retrofitted.

**Doc low:** the telemetry command templates in `system-reference.md` §12 use
distinct placeholders — `<wave>` for the `panel.dispatched`/`panel.consolidated`
round field and the harvest `--wave`, and `<label>` for the harvest `--round`
allocation label — so the two numbers are never conflated in an example.

## Scope

**In:**

- `skills/sdlc/scripts/harvest-panel.mjs` — `--wave` flag, `meta.json` sidecar,
  `wave` in the `panel.harvested` payload.
- `skills/sdlc/scripts/telemetry.mjs` — `wave` as an **optional** payload field
  for `panel.dispatched`/`panel.harvested`/`panel.consolidated` (never added to
  a required list).
- `skills/sdlc-retro/scripts/collect-run.mjs` — `discoverPanels` sidecar read +
  `wave` on panel entries; `discoverReviewDirs` widened regex; **`buildSoftData`
  phase-extraction `startsWith` widened to the `-review-` form (F1)**; precision
  join regrouped by wave per the algorithm above; `wave` threaded through the
  `hard` `panels.map` (line ~1061) and onto `panelPrecision[]`;
  `validateRunJson` updated to allow (not require) `wave` on both `panels[]`
  and `panelPrecision[]` (F2).
- `skills/sdlc-retro/scripts/render-retro.mjs` — wave-grouped rendering.
- `skills/sdlc-retro/schema/event.schema.json` — optional `wave` on the three
  panel events (additive).
- `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` — review-dir naming line
  gains the `-review-` form as an accepted alternative (original wording
  preserved, additive per F4); panel-artifact/`meta.json`, the optional `wave`
  field (additive to the **v1** record — no version bump), and the
  `panels.malformed_meta:<phase>` marker added to the closed v1 marker set (F5).
- `skills/sdlc/references/phase-pr-review.md` — §5 naming guidance; harvest
  paragraph gains `--wave`.
- `skills/sdlc/references/system-reference.md` — §12 placeholder split and
  `--wave` in the command templates.
- Tests: `test/telemetry-collect.test.js`, `test/telemetry-collect-soft.test.js`,
  `test/telemetry-render.test.js`, and any harvest-panel/telemetry emitter test.

**Out:**

- Retrofitting historical review directories or run stores to the new naming or
  the sidecar (regex + `wave=round` fallback handle them read-only).
- Any change to the `panel.dispatched`/`panel.consolidated` **required** payload
  fields, a telemetry `EVENT_SCHEMA_VERSION` bump, or a `run.json` **v1→v2**
  bump (the `wave` field is additive-optional to v1, human-ratified 2026-07-19).
- Wiring anything new into CI as a required check.
- The `render-retro` visual design beyond the wave-grouping change (no restyle).

## Definition of done

1. `harvest-panel.mjs --wave` works, defaults to `--round`, and writes
   `meta.json`; omitting it leaves behaviour byte-identical to today for a
   single dispatch.
2. A collector run over a fixture with an infra-replacement dispatch (two
   harvest rounds, one wave) and a multi-wave fix-wave sequence retros to one
   logical wave per review round; **no `precision.unparsed`** for a well-formed
   multi-round day; precision attributed to the correct wave. A well-formed
   multi-round same-wave day joins cleanly; only genuinely disagreeing waves on
   one date emit `precision.unparsed`.
3. `discoverReviewDirs` **and** `buildSoftData` phase-extraction match both
   naming forms; the LT15 discovery test is extended to assert both (and still
   excludes `task-validate-*`), and a fixture with a `-review-` directory
   produces non-empty precision (guarding F1).
4. `render-retro` renders one section per wave, collapsing same-wave rounds;
   `hard.panels[]` carries `wave` and the render join uses it (guarding F2).
5. Spec naming line + `phase-pr-review.md` §5 mandate `-review-`; the two
   telemetry-template placeholders are distinct in `system-reference.md`.
6. `npm test` and `npm run lint` (biome) clean; `validateRunJson` accepts the
   `wave`-bearing shape and the existing render consumer still parses.

## Context for the next agent (incl. parked questions)

- **Parked to Implement:** whether `panelPrecision[].round` is *retained
  alongside* `wave` or *replaced by* it — decide against the render join and the
  `validateRunJson`/`checkKeys` exact-key guard once the render change is
  written; keep both if `render-retro` still needs round-level sub-detail.
- **Parked to Implement:** exact `meta.json` schema-validation posture (a
  malformed sidecar should degrade to `wave=round` and emit the pre-registered
  `panels.malformed_meta:<phase>` coverage marker — F5 — not throw; mirror
  `discoverPanels`' existing tolerant status.json handling). The marker name is
  fixed here; only its emission mechanics are Implement's.
- The LT15 soft-test and the `docs/specs` naming line are the two "locked"
  surfaces this change deliberately re-opens; both are cited in the spec so the
  amendment is traceable.

## Assumptions ratified by approving this plan

1. **Track is reversible** (owner-ratified 2026-07-19 over deepseek's F4): every
   change is additive — optional `wave` (allowed-but-not-required on the v1
   `run.json` record, **no v2 bump**), a `meta.json` sidecar, a widened but
   backward-compatible regex, and an **additive** spec naming note that
   preserves the original frozen line. No persisted record shape is broken and
   every existing v1 record still validates. Under `overrides.reversible`,
   `review.design: human` — this human gate, no plan panel, no separate Spec
   (the spec-doc note is an Implement edit, not a re-gated Spec phase).
2. `wave` stays optional in all telemetry payloads; no dispatch call is forced
   to supply it.
3. Slug `sdlc-retro-panel-precision`; branch `feat/sdlc-retro-panel-precision`.
4. Four-task build (see build plan): harvest+telemetry fields → naming
   regex+spec → collector wave consumption → render-retro grouping.
