# PR review: config-intent-vocabulary (schemaVersion 3 clean break) — glm-5.2

Repo: `feat/config-intent-vocabulary` @ `feedd43`. Track: irreversible.
Diff reviewed: `git diff main..HEAD` (full sources + tests read in context).
Repros below were run against the worktree HEAD.

---

### Preset patch silently drops consumer-authored per-track overrides

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 566–573
- problem: The preset-patch data-loss guard at line 566 only fires when the
  preset carries NO overrides at all (`cfg.overrides === undefined`). When the
  preset carries a PARTIAL overrides block, line 573 (`existing.overrides =
  cfg.overrides`) wholesale-replaces the consumer's overrides, silently
  dropping any track the preset does not itself carry. Spec ICA19 says the
  guard must refuse when the patch "would delete **or alter** an existing
  overrides block the preset does not itself carry" — the code implements only
  the delete (whole-block-absence) case, not the alter (per-track-overwrite)
  case.
- repro_or_impact: Confirmed by repro. Existing v3 config with
  `overrides: { reversible: { review: { design: "human" } }, irreversible:
  { review: { code: "advisory" } } }`. Run `setup-sdlc.mjs --config .
  --preset full` (full carries only `overrides.reversible`). Result: exit 0,
  asset action `patched`, and `overrides.irreversible` is silently gone from
  the file. The before→after JSON dump in the report is the only disclosure
  (buried, action is success). A consumer who hand-authored per-track
  overrides loses them with no refusal. Fix: before `existing.overrides =
  cfg.overrides`, diff the consumer's overrides track-keys against the
  preset's and refuse (unless `--force`) when the consumer carries a track the
  preset lacks — mirroring the existing block-level guard at the per-track
  grain the spec language ("delete or alter … the preset does not itself
  carry") demands.

### `setup-sdlc.sh` wrapper documents a retired flag and promises a deleted migration

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.sh
- line: 9, 12
- problem: The shell entry point (the documented invocation surface in
  `templates/setup-sdlc.md`) was not updated in lockstep with the v3 `.mjs`
  rewrite. Line 9's usage still lists `[--enforcement strict|preference]` —
  a flag the `.mjs` now hard-errors on as retired (`--enforcement is retired
  — use --on-shortfall proceed|fail`). Line 12 states "Existing schema-1
  configs migrate only after a live-TTY confirmation; otherwise setup refuses
  safely" — promising a migration surface that ADR 0027 / ICA7 deleted. It
  also omits every new v3 flag (`--preset`, `--review-*`, `--panel-size`,
  `--on-shortfall`, `--separate-spec`, `--publish-to-tracker`,
  `--default-track`, `--override`). No test scans `setup-sdlc.sh` for stale
  vocabulary (AR11 scans `sdlc-status.sh` only; ICA20's allowlist covers
  `setup-sdlc.mjs`'s parse/error path, not the `.sh`).
- repro_or_impact: `grep enforcement skills/sdlc/scripts/setup-sdlc.sh` →
  documents the retired flag as current. `grep migrate
  skills/sdlc/scripts/setup-sdlc.sh` → promises the deleted migration. A user
  who reads the wrapper header (or greps for flags) is misled; FS11 honesty
  and ICA6's "never name migration as an offered path" are violated in the
  shipped entry point. Fix: sync the `.sh` usage comment to the `.mjs` USAGE
  string and drop the migration sentence.

### `readConfigRawForMigration` is dead exported code — migration plumbing not fully purged

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/lib.mjs
- line: 194–213
- problem: `readConfigRawForMigration` is still exported but has zero callers
  (`migrate.mjs` deleted; `setup-sdlc.mjs` no longer imports it). It reads
  `sdlc.models.json` — a file that does not exist in v3 and whose schema was
  deleted. ADR 0027 states "deletes `migrate.mjs` and all setup migration
  plumbing"; spec §1 lists `readConfigRawForMigration` call-site removal as
  scope. The ICA7 grep test checks only
  `FORWARD_MIGRATIONS|planMigration|applyMigration|MIGRATE_FIRST` — it does
  not grep for `readConfigRawForMigration`, so the test passes while orphaned
  migration IO survives as part of the module's exported API.
- repro_or_impact: `grep -rn readConfigRawForMigration skills/sdlc/scripts/`
  → only the definition at lib.mjs:194, no import/call. The function is the
  migration-scoped raw reader whose three-state contract existed solely to
  feed `planMigration`; with migration gone it is dead surface area that reads
  a non-existent file. Fix: delete the export (and its JSDoc comment).

### `resolve-panel.sh` usage documents the retired `|vendor` author format

- severity: low
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.sh
- line: 6
- problem: The wrapper usage still shows `[--author
  <provider/model|vendor>]`. The vendor heuristic was deleted (the `.mjs`
  usage correctly says `[--author <provider/model>]`, and `--author
  anthropic` without a `/model` now hard-fails exit 1). The `|vendor` suffix
  is stale.
- repro_or_impact: Reading the wrapper header misleads a user into thinking a
  bare vendor string is still accepted. The extraction/path-plumbing tests
  were updated to pass `--author anthropic/claude-fable-5` (model form), but
  the `.sh` comment was not. Fix: drop `|vendor` from the `.sh` usage line.

### Spec scenarios ICA20, ICA21, ICA24 have no implementing tests

- severity: low
- confidence: high
- file: test/
- line: n/a
- problem: Three declared falsifiable scenarios have no test. ICA20
  (syntax-aware purge of retired vocabulary from runtime read paths, with the
  enumerated allowlist) — no test; the purge is currently clean but
  unguarded. ICA21 (SKILL instructs reading `shape.publishToTracker` for the
  publish decision, no hardcoded task-count constant) — CV31 in docs.test.js
  checks the shortfall/schema sentences but does not assert the
  `publishToTracker` pointer or the absence of a hardcoded constant. ICA24
  (refusal precedence: `separateSpec: false` AND `design: human` →
  no-spec-gate message, not no-panel) — ICA14 tests `separateSpec: false`
  alone (with default `design: panel`); the combined-precedence case is
  correct in the code (the separateSpec check at resolve-panel.mjs:169 fires
  first) but unverified.
- repro_or_impact: A future regression in any of these three behaviours would
  not be caught. ICA24 was verified by hand (config with
  `separateSpec:false`+`design:human` → exit 1, "no spec gate" message), but
  that is not a durable guard. Fix: add the three tests (the ICA20 allowlist
  grep, the ICA21 SKILL assertion, and the ICA24 combined-config repro).

### `--force` with identity flags silently drops paths / panels / tracker / hooks

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 585–587
- problem: `setup-sdlc --prefix new --force` (identity flag + `--force`, no
  intent flags) writes `cfg` from `assembleConfig` over the existing config.
  `assembleConfig` never includes `paths`, `panels`, `tracker`, or `hooks`
  unless the corresponding flags are re-passed, so the wholesale replacement
  silently destroys the consumer's panels roster, custom `paths`, tracker
  binding, and hooks. The report says only `asset: config upgraded` with no
  disclosure of which keys were dropped. This is pre-existing (v2 had the same
  `writeFileSync(JSON.stringify(cfg))` path) and the spec calls it "wholesale
  replacement … exactly as today", so it is not a regression — but the new
  preset-patch path (which DOES byte-preserve non-intent keys) makes the
  contrast starker and the footgun less obvious.
- repro_or_impact: Confirmed by repro: existing v3 config with custom `paths`,
  `panels`, and `tracker`; run `setup-sdlc.mjs --config . --prefix newprefix
  --force --yes`; after = `paths` absent, `panels` absent, `tracker` absent,
  report `upgraded` exit 0. Fix (optional, low priority): either include
  preserved keys in `cfg` before the `--force` write, or disclose dropped
  top-level keys in the `upgraded` report.

---

No HIGH-severity defects found. The validator kernel (closed-vocab probes,
deterministic issue order, refusal ordering, effective-value/floor resolution,
author-exclusion axis, onShortfall proceed/fail semantics) is correct against
ICA1–ICA16; the clean-break refusal path (v2 → refused, not mutated, honest
remedy) is correct against ICA6; `migrate.mjs` and its test files are fully
deleted; 211 tests pass and biome is clean.
