# Build plan: opt-in lifecycle — OL-A (config vocabulary and resolution)

- Date: 2026-07-14
- Spec: `docs/specs/2026-07-14-opt-in-lifecycle-config.md` (rev 4 — canonical
  for every contract; this breakdown never re-derives, only assigns)
- Plan: `docs/plans/2026-07-14-opt-in-lifecycle-config.md` (thin sub-change
  plan); stream plan `docs/plans/2026-07-14-opt-in-lifecycle.md` rev 3+
- Slug: `opt-in-lifecycle-config`; validation home:
  `docs/validation/opt-in-lifecycle-config/<task-id>.json` (PV1 manifests
  authored per task at implement time, projected from this breakdown)
- Tasks: 3 (≥ 2 ⇒ tracker-backed: epic + sub-issues + board, per the
  dogfood threshold of 2)

## Task breakdown

### ol-a-t1 — `lifecycle` schema, validation, and `decomposeGateMode`

- **Delivers:** `schema/sdlc.config.schema.json` additive `lifecycle`
  property + `automation` reservation `$comment`; `inspectConfig` extension
  in `scripts/lib.mjs` (closed vocabulary, cross-field rules 1–4, ordered
  issues, byte-identical for block-absent configs); exported
  `decomposeGateMode` (total over the four-value enum, the only site of
  gate-mode string comparison).
- **Scenario ids:** OLA1, OLA2, OLA3, OLA4, OLA5, OLA6, OLA7, OLA8, OLA18,
  OLA19.
- **Check commands:**
  - `node --test test/lifecycle-config.test.js` (new suite; scenarios above)
  - `node --test` (full corpus — OLA1's existing-assertions-unchanged
    falsifier and NF-1(a))
- **Blocked by:** none — can start immediately.

### ol-a-t2 — `resolve-panel` model-identity resolution

- **Delivers:** raw non-fatal config read; floor sourcing precedence with
  supersede notice; model-identity dedupe (exact thinking-level recogniser,
  positional winner) and distinct-model floor; author-model exclusion
  (lifecycle path governed solely by `minPanel`; legacy toggle v1-only);
  `--track` flag (enumerated values, per-track-requires-flag refusal);
  gate-mode refusals via `decomposeGateMode` (`reviewer === "none"`);
  `task_validate` fixed 1-model floor / `off` refusal; v1-path
  byte-identity.
- **Scenario ids:** OLA9, OLA10 (a–f incl. b′), OLA11, OLA12, OLA13 (a–e),
  OLA20, OLA21.
- **Check commands:**
  - `node --test test/resolve-panel-lifecycle.test.js` (new suite; scenarios
    above)
  - `node --test` (full corpus — v1-path byte-identity regressions)
- **Blocked by:** ol-a-t1 (consumes the validated block and
  `decomposeGateMode`).

### ol-a-t3 — `setup-sdlc` fresh-adoption profiles + models example alignment

- **Delivers:** profile interview step (pre-selecting `standard`, naming the
  presets and the solo credential fact) + `--profile` flag; §3 preset
  expansion tables (pure data); `--lifecycle-json <path|->` custom payload
  contract (no `profile` key, injected `custom`, inspectConfig-validated,
  pinned usage/refusal exits); no-`--profile` non-interactive byte-identity;
  existing-config refusal with the OL-B pointer;
  `schema/sdlc.models.example.json` review-gate `min_panel` alignment +
  `$comment` lifecycle caveat.
- **Scenario ids:** OLA14, OLA15, OLA16, OLA17.
- **Check commands:**
  - `node --test test/setup-lifecycle.test.js` (new suite; scenarios above)
  - `node --test` (full corpus — NF-1(c) and FS10 report byte-identity)
- **Blocked by:** ol-a-t1 (writes blocks that must validate against the T1
  vocabulary).

## Sequencing

`ol-a-t1` first; `ol-a-t2` and `ol-a-t3` are independent of each other and
may proceed in parallel once T1 lands on the branch.

## Definition of done (per task and overall)

A task is done when its PV1 manifest's runner returns PASS (all named
scenario ids green, full corpus green) and its receipt is stored under
`docs/reviews/task-validate-opt-in-lifecycle-config-<task-id>-<date>/`.
OL-A is done when all three tasks are done and the OL-A PR (slug
`opt-in-lifecycle-config`, track irreversible) passes `check-lifecycle` and
the PR panel to the stop condition.
