# Build plan: lifecycle telemetry and post-mortem dashboard (sdlc-retro)

- Date: 2026-07-17
- Spec: `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 3 — canonical
  for every contract; this breakdown never re-derives, only assigns)
- Plan: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 2)
- Slug: `sdlc-lifecycle-telemetry`; validation home:
  `docs/validation/sdlc-lifecycle-telemetry/<task-id>.json` (PV1 manifests
  authored per task at implement time, projected from this breakdown)
- Tasks: 8 (≥ 2 ⇒ tracker-backed: epic + sub-issues + board)

## Task breakdown

### lt-t1 — FS13 emitter, run store, event schema

- **Delivers:** `skills/sdlc/scripts/record-run-event.{mjs,sh}` (spec §3.1:
  envelope construction, payload prevalidation, 32 KiB cap, `by` grammar
  with `agent` default, atomic O_APPEND, `sdlc-telemetry:` stderr prefix,
  exits 0/2); run-identity resolution (§3.2: flag → env → branch mapping;
  skip-with-warning); run-store layout creation (§2);
  `skills/sdlc-retro/schema/event.schema.json` mirroring the §3 tables +
  hand-rolled event validator (shared, exported for T4); `.gitignore` entry
  `.pi/sdlc/runs/`.
- **Scenario ids:** LT1, LT2, LT3, LT4, LT5, LT26.
- **Check commands:**
  - `node --test test/telemetry-emitter.test.js` (new suite)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** none.

### lt-t2 — FS5 side-effect emission

- **Delivers:** additive `--slug`/env handling + post-success emission in
  `resolve-panel.mjs` (`panel.resolved`), `ensure-panel-agent.mjs`
  (`panel.agent_stamped`), `validate-task.mjs` (`task.validated` per §3.3's
  verdict/attribution rule); `panelPhase` vocabulary in payloads; stdout/exit
  byte-identity preserved; emission failure → skip-with-warning;
  `check-lifecycle.{mjs,sh}` untouched.
- **Scenario ids:** LT6, LT7, LT8, LT9, LT10.
- **Check commands:**
  - `node --test test/telemetry-side-effects.test.js` (new suite)
  - `node --test` (full corpus — frozen-CLI regression floor) · `npm run lint`
- **Blocked by:** lt-t1 (emitter library).

### lt-t3 — harvest-panel

- **Delivers:** `skills/sdlc/scripts/harvest-panel.{mjs,sh}` (spec §5: flat
  top-level `status.json`/`events.jsonl` copy into
  `panels/<panelPhase>-round<N>-<date>/`, `--with-transcripts`, per-file
  copied/missed envelope, report-not-throw on missing sources, exits 0/2,
  `panel.harvested` emission).
- **Scenario ids:** LT11, LT12.
- **Check commands:**
  - `node --test test/telemetry-harvest.test.js` (new suite)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** lt-t1 (emitter library).

### lt-t4 — collector core: adapters, hard measures, run.json

- **Delivers:** `skills/sdlc-retro/scripts/collect-run.{mjs,sh}` (spec §6
  CLI/envelope/atomic write) with the five source adapters (§6.1: manifest +
  `manifest.partial`; panel harvests; session discovery/correlation incl.
  the pi dir mapping, top-level-only rule, `sessions.dir_unresolved` /
  `sessions.none`; review artifacts; `--git-cmd`/`--gh-cmd` seams with
  `git.error`/`github.error`); derived hard measures (§6.3 formulas,
  `unattributed` bucket, disjointness rule, panel→lifecycle mapping); size
  proxies; `skills/sdlc-retro/schema/run.schema.json` + hand-rolled
  validator, uniform absence encoding, closed coverage-marker set (§7);
  `title`/`track` from `run.started`.
- **Scenario ids:** LT13 (hard portion), LT14, LT15, LT16.
- **Check commands:**
  - `node --test test/telemetry-collect.test.js` (new suite)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** lt-t1 (event validator, store layout). Fixture-driven:
  does not require lt-t2/lt-t3 code, only their artifact shapes (from spec).

### lt-t5 — collector soft data, raw snapshots, replay

- **Delivers:** LLM seam (§6.2 protocol: execFile-no-shell, per-kind
  request/response shapes, 120 s timeout, `llm.error:<kind>`,
  `skills/sdlc-retro/schema/llm-protocol.schema.json`); soft outputs
  (narratives, steering `{index, ts, class}`, precision with
  `precision.unparsed`); NF4 pipeline (env-value redaction, 500-char cap,
  ≥12-word n-gram containment rejection); `raw/` snapshotting of every
  non-manifest input and `--from-raw` exclusive replay (§6.4); `--no-llm`.
- **Scenario ids:** LT17, LT18, LT19, LT28, LT29.
- **Check commands:**
  - `node --test test/telemetry-collect-soft.test.js` (new suite)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** lt-t4 (collector core).

### lt-t6 — renderer

- **Delivers:** `skills/sdlc-retro/scripts/render-retro.{mjs,sh}` (spec §8:
  CLI/envelope/exits, atomic write); single self-contained single-scroll
  dashboard (seven anchors, pinned per-section data bindings, `data-soft`
  flagging + attribution, coverage notices, no external references, no
  generation-time values, render-twice byte-identity).
- **Scenario ids:** LT20, LT21, LT22, LT23.
- **Check commands:**
  - `node --test test/telemetry-render.test.js` (new suite)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** lt-t4 (run.schema.json + fixture run.json shapes). Does
  not require lt-t5 (renders `soft`-less input per LT19/LT22).

### lt-t7 — skill surfaces, docs, FS11 inventory, ADR 0021

- **Delivers:** `skills/sdlc-retro/SKILL.md` (store layout, collect/render
  invocation FS12-relative, coverage semantics, regenerate policy); sdlc
  `SKILL.md` hook steps (§4 token contract incl. validator-dispatch harvest
  token) + sdlc-retro pointer; FS11 inventory additions with unique-phrase
  assertions + the structural omission-coverage test (§9 breadth: scripts,
  schema files, ADR 0021, store/retro paths); `docs/adr/0021` freezing FS13
  (event vocabulary, run.json v1, additive FS5 flags, schemas-mirror-tables
  rule).
- **Scenario ids:** LT24, LT25.
- **Check commands:**
  - `node --test test/telemetry-docs.test.js` (new suite)
  - `node --test test/check-references.test.js` · `node --test` (full corpus)
  - `npm run lint`
- **Blocked by:** lt-t1, lt-t3 (hook script names must exist for FS11
  target checks); content may draft in parallel.

### lt-t8 — dogfood retro

- **Delivers:** instrument the remainder of this feature's own run
  (manifest events from the point the emitter exists; harvest any remaining
  panel dispatches); run `collect` (real LLM seam or `--no-llm`, author's
  choice at implement time) and `render`; commit
  `docs/retros/sdlc-lifecycle-telemetry/run.json` + `index.html` with honest
  pre-instrumentation coverage markers.
- **Scenario ids:** LT27.
- **Check commands:**
  - `node --test test/telemetry-dogfood.test.js` (committed-artifact
    assertions: files exist, run.json schema-valid, coverage honest)
  - `node --test` (full corpus) · `npm run lint`
- **Blocked by:** lt-t5, lt-t6 (needs full pipeline); lt-t7 for the hook
  wording it follows.

## Sequencing

`lt-t1` first. Then `lt-t2`, `lt-t3`, `lt-t4` in parallel; `lt-t5` and
`lt-t6` after `lt-t4` (parallel with each other); `lt-t7` once `lt-t1` +
`lt-t3` exist; `lt-t8` last.

## Definition of done (per task and overall)

A task is done when its PV1 manifest's runner returns PASS (all named
scenario ids green, full corpus green, lint green) and its receipt is stored
under `docs/reviews/task-validate-sdlc-lifecycle-telemetry-<task-id>-<date>/`.
The feature is done when all eight tasks are done, the plan/spec DoD items
hold, and the PR (slug `sdlc-lifecycle-telemetry`, track irreversible)
passes `check-lifecycle` and the PR panel to the stop condition.
