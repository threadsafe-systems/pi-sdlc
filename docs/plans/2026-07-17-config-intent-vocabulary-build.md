# Build plan: IC-A — the intent-vocabulary break (schemaVersion 3)

- Date: 2026-07-17
- Track: **irreversible**; slug `config-intent-vocabulary`
- Sources: plan `docs/plans/2026-07-17-config-intent-vocabulary.md` (rev 5);
  spec `docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md` (rev 3)
- Definition of done: the spec's §10 scenarios ICA1–ICA24 (live ids) green;
  this repo runs on v3 (`sdlc-status` ready on the branch); biome + full
  `node --test` corpus clean; `CONFIG_SCHEMA_VERSION` bump trips the
  schema-break guard and the PR carries a `BREAKING CHANGE:` footer.

Check commands are portable argv (PV1). This repo's checks: `node --test`
(the file(s) named per task), `node --check` on edited scripts, and
`npx biome check` on edited files. Scenario ids map to the spec.

## T1 — validator + version seam + schema files + migrate deletion

- **Files:** `skills/sdlc/scripts/lib.mjs`, `skills/sdlc/scripts/migrate.mjs`
  (delete), `skills/sdlc/schema/sdlc.config.schema.json`,
  `skills/sdlc/schema/sdlc.config.example.json`,
  `test/migration.test.js` (delete), `test/lib-config.test.js`,
  `test/config-versioning.test.js` (prune migration cases),
  new `test/config-intent-vocabulary.test.js`.
- **Work:** `CONFIG_SCHEMA_VERSION = 3`; `KNOWN_PAST_VERSIONS = {1,2}`;
  reword `REMEDY_SCHEMA_OLDER`/`_NEWER` to name only re-run-setup / pin (no
  "migration"); rewrite `inspectConfig` for the §2 v3 shape (top-level closed
  set incl. `review`/`shape`/`overrides`, `lifecycle`/`enforcement`/`evidence`
  now unknown-key; `collectLifecycleIssues`/`collectPanelIssues` replaced by
  `collectReviewIssues`/`collectShapeIssues`/`collectOverridesIssues` +
  panels-without-`rules`/`minVendor`); delete `migrate.mjs` and its
  `FORWARD_MIGRATIONS`/`planMigration`/`applyMigration`; rewrite schema +
  example JSON in lockstep.
- **Scenarios:** ICA1, ICA2, ICA3, ICA4, ICA6, ICA7.
- **Checks:** `node --check skills/sdlc/scripts/lib.mjs`;
  `node --test test/config-intent-vocabulary.test.js test/lib-config.test.js`;
  `npx biome check skills/sdlc/scripts/lib.mjs skills/sdlc/schema/`.

## T2 — resolve-panel single path (depends on T1)

- **Files:** `skills/sdlc/scripts/resolve-panel.mjs`,
  `test/resolve-panel.test.js`, `test/resolve-panel-lifecycle.test.js`
  (fold into one v3 suite or prune).
- **Work:** delete `resolveVendor()` + `vendor()` + the superseded-note;
  single OL-A loop; `dialFor`/`effective`/`floor` per §3; refusal ordering
  per §4.3 (separateSpec → tasks-off → human/off); `--track` required with
  `overrides`; `onShortfall` rename in messages.
- **Scenarios:** ICA12, ICA13, ICA14, ICA15, ICA16.
- **Checks:** `node --check skills/sdlc/scripts/resolve-panel.mjs`;
  `node --test test/resolve-panel.test.js`;
  `npx biome check skills/sdlc/scripts/resolve-panel.mjs`.

## T3 — setup flags/presets/patch + migration-plumbing removal (depends on T1)

- **Files:** `skills/sdlc/scripts/setup-sdlc.mjs`, `test/setup-sdlc.test.js`,
  `test/setup-lifecycle.test.js`, `test/setup-bundle.test.js`.
- **Work:** replace `--profile`/`--lifecycle-json`/`--enforcement` with
  `--preset` + per-dial flags + `--override` (validated per §6/S8); retire
  `--preset custom`; v3 `PRESETS` bundles (§6); fully-explicit fresh write;
  preset-patch (`review`/`shape`/`overrides` only, byte-preserve rest,
  `--force` guard on consumer `overrides` — S7); delete `migrateConfig`,
  `cleanupResidue`, `MIGRATE_FIRST`, `migrationFlagsPresent`, the residue
  call sites, and the `migrate.mjs` import; older-schema config now `refused`
  with the reworded remedy (or `--force` wholesale replace); interview
  re-vocabularied to v3 (reduction is IC-B).
- **Scenarios:** ICA17, ICA18, ICA19, ICA23.
- **Checks:** `node --check skills/sdlc/scripts/setup-sdlc.mjs`;
  `node --test test/setup-sdlc.test.js test/setup-lifecycle.test.js test/setup-bundle.test.js`;
  `npx biome check skills/sdlc/scripts/setup-sdlc.mjs`.

## T4 — SKILL re-pointing + repo v3 config + ADRs (depends on T1)

- **Files:** `skills/sdlc/SKILL.md`, `.pi/sdlc/sdlc.config.json`,
  `docs/adr/0026-*.md` (v3 vocabulary), `docs/adr/0027-*.md` (pre-adoption
  clean-break policy), `docs/adr/0022-*.md` (revision note),
  `docs/plans/2026-07-14-opt-in-lifecycle.md` (rev-4 amendment note),
  `test/docs.test.js` / `test/reference-contract.test.js` if they assert
  SKILL vocabulary.
- **Work:** P1–P5 prose re-pointing (§7); hand-author this repo's v3 config
  (owner dial values; panels roster carried, `minVendor`→`panelSize`,
  `rules` dropped, `enforcement: strict`→`review.onShortfall: fail`); write
  the two ADRs, ADR 0022 revision, OL rev-4 note.
- **Scenarios:** ICA20, ICA21, ICA22, ICA24.
- **Checks:** `node --test test/docs.test.js test/reference-contract.test.js`;
  `node skills/sdlc/scripts/sdlc-status.mjs` (exit 0 on the branch);
  `npx biome check` on edited files.

## Cross-cutting close-out

- Full corpus: `node --test` (all of `test/`) green.
- `npx biome check` clean repo-wide on the diff.
- `node skills/sdlc/scripts/check-schema-break.mjs` behaviour verified by
  `test/schema-break.test.js`; the release PR body carries `BREAKING CHANGE:`.
- Per-task PV1 manifests under `docs/validation/config-intent-vocabulary/`
  and validator receipts under `docs/reviews/task-validate-*`.
