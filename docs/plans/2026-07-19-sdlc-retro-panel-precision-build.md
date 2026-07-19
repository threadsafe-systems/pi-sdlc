# Build plan: retro wave-identity + review-dir naming (sdlc-retro-panel-precision)

- **Slug:** `sdlc-retro-panel-precision`
- **Date:** 2026-07-19
- **Track:** reversible — no Specification; tasks map to the approved Plan's DoD.
- **Governing plan:** `docs/plans/2026-07-19-sdlc-retro-panel-precision.md` (rev2,
  human-approved 2026-07-19; deepseek advisory review incorporated)
- **Branch:** `feat/sdlc-retro-panel-precision`
- **Closes:** #118

## Decomposition rationale (assumption-tier, stated inline)

Four tasks. The `wave` field must exist at harvest time (T1) before the
collector can consume it (T3); the naming fix (T2) and the wave consumption (T3)
both edit `buildSoftData`, so they are **sequenced, not parallel**, to keep one
writer per function; render (T4) needs `wave` on `hard.panels[]` from T3. Net
edges: T3 blockedBy T1 **and** T2; T4 blockedBy T3; T1 and T2 start immediately.
Object via a Build correction if this slicing is wrong.

## T1 — Harvest `--wave` flag, `meta.json` sidecar, optional telemetry field

**Objective.** `harvest-panel.mjs` gains an optional `--wave <n>` (positive
integer; **defaults to `--round`'s value**), writes a `meta.json` sidecar
`{ "round": <n>, "wave": <n> }` into the harvest directory, and includes `wave`
in the `panel.harvested` event payload. `telemetry.mjs` `EVENT_PAYLOADS` gains
`wave` as an **optional** field on `panel.dispatched`/`panel.harvested`/
`panel.consolidated` (never added to a required list; `validatePayload` only
checks required fields, so optionality is automatic). `event.schema.json` adds
optional `wave` to those three events (additive; payloads are not
`additionalProperties:false`).

**Satisfies plan DoD:** item 1.

**Checks:** `npm test`; `npm run lint`; `node --check` on the two scripts;
`harvest-panel.mjs --help` parses; a unit assertion that omitting `--wave`
writes `meta.json` with `wave === round` and behaviour is otherwise unchanged.

**Blocked by:** none.

## T2 — Review-dir naming reconciliation (regex + extraction + additive docs)

**Objective.** In `collect-run.mjs`: widen `discoverReviewDirs`' regex to accept
both `<phase>-<slug>-<date>` and `<phase>-review-<slug>-<date>`, **and** widen
`buildSoftData`'s phase-extraction `startsWith` (line ~885) to the same two
forms (F1 — the regex widening is inert without this). Docs (all additive,
per the F4 ratification — original wording preserved): the spec's review-dir
naming line and `phase-pr-review.md` §5 gain the `-review-` form as an
accepted alternative; `system-reference.md` §12 splits the `<n>` placeholder
into distinct `<wave>` / `<label>` and shows `--wave` in the command templates.

**Satisfies plan DoD:** items 3 (naming half), 5.

**Checks:** `npm test`; `npm run lint`; LT15 discovery test extended to assert
both naming forms and still exclude `task-validate-*`; a fixture with a
`-review-` directory yields non-empty precision (guarding F1); grep asserts the
spec/reference retain their original line and gain the `-review-` note.

**Blocked by:** none.

## T3 — Collector wave consumption + precision join regroup

**Objective.** In `collect-run.mjs`: `discoverPanels()` reads the `meta.json`
sidecar (**absent → `wave = round`**; a malformed sidecar degrades to
`wave=round` and emits the pre-registered `panels.malformed_meta:<phase>`
marker — F5 — never throws, mirroring the tolerant status.json handling) and
carries `round` **and** `wave` on each panel entry; thread `wave` through the
`hard` assembly `panels.map` (line ~1061) and onto `panelPrecision[]` (F2);
`validateRunJson` **allows (not requires)** `wave` on both `panels[]` and
`panelPrecision[]` so existing v1 records still validate. Regroup the precision
join by `(panelPhase, wave, date)` per the Plan's algorithm: attribute when the
dated panels share one wave; emit `precision.unparsed` **only when waves
disagree**.

**Satisfies plan DoD:** items 2, 3 (marker), 6.

**Checks:** `npm test`; `npm run lint`; a fixture with an infra-replacement
dispatch (two rounds, one wave) joins with no `precision.unparsed`; a
disagreeing-wave same-date fixture does emit it; a malformed-sidecar fixture
emits `panels.malformed_meta`; `validateRunJson` accepts both `wave`-bearing and
`wave`-less records.

**Blocked by:** T1, T2.

## T4 — render-retro wave grouping

**Objective.** `render-retro.mjs` groups dashboard sections by **wave**,
collapsing same-wave harvest rounds into one section (constituent rounds as
sub-detail) and joining precision on `(panelPhase, wave)` using the `wave`
now present on `hard.panels[]`.

**Satisfies plan DoD:** item 4.

**Checks:** `npm test`; `npm run lint`; a render test over a multi-round
one-wave fixture produces one section per wave (not per round) with the
precision joined.

**Blocked by:** T3.

## Assumptions (appendix — accrues during Implement; copied into the PR body)

- (build-time) Four-task slicing and the T3-blockedBy-{T1,T2}, T4-blockedBy-T3
  edges, per the decomposition rationale above.

## Tracker projection

Threshold met (4 tasks ≥ `shape.publishToTracker: 2`): one epic (`sdlc:epic`)
- four sub-issues (`sdlc:build-task`) on board 5, edges as above. This doc
remains canonical; the tracker is a projection.
