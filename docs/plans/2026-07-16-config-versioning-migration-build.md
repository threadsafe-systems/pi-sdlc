# Build plan: config versioning and migration contract

- Date: 2026-07-16
- Plan: `docs/plans/2026-07-16-config-versioning-migration.md` (rev 3,
  panel-approved)
- Specification: `docs/specs/2026-07-16-config-versioning-migration.md` (rev 2,
  panel-reviewed; canonical contract)
- Track: irreversible
- Slug: `config-versioning-migration`
- Canonical source: this committed Build-plan document; GitHub issues are its
  projection.
- Validation home: `docs/validation/config-versioning-migration/<task-id>.json`
  (one PV1 manifest per task), with receipts under
  `docs/reviews/task-validate-config-versioning-migration-<task>-<date>/`.
- Tasks: 5 (tracker-backed: epic + five sub-issues + board #5).

## Tracker projection — created and verified

- Epic: [#56 — config versioning and migration contract](https://github.com/threadsafe-systems/pi-sdlc/issues/56)
- T1: [#57](https://github.com/threadsafe-systems/pi-sdlc/issues/57)
- T2: [#58](https://github.com/threadsafe-systems/pi-sdlc/issues/58), blocked by #57
- T3: [#59](https://github.com/threadsafe-systems/pi-sdlc/issues/59), blocked by #57
- T4: [#60](https://github.com/threadsafe-systems/pi-sdlc/issues/60), blocked by #57
- T5: [#61](https://github.com/threadsafe-systems/pi-sdlc/issues/61), blocked by #58, #59, and #60

GraphQL read-back verified all five native sub-issue relationships and six
native blocking edges; all six issues are on board #5 at `Todo`.

## Definition of done

1. The two v1 consumer files fold into one schemaVersion-2 config without
   consumer-owned data loss, with strict-mode effective-panel conservation and
   an interactive, forwards-only migration seam.
2. Every changed consumer surface implements the spec's version, migration,
   posture, status, checker, setup, and release-channel contracts; all CV1–CV32
   scenarios have automated proof owned by a task below.
3. Malformed/unmappable inputs write nothing, migration writes are recoverable,
   and cleanup-safe residue is proven not to affect v2 consumers.
4. This repository is dogfooded through the real setup entrypoint: one merged
   v2 config, no models file, ready status, and equivalent live panel output.
5. `npm test`, `npm run lint`, every named task check, and every task PV1/PV2
   validator pass without network, credentials, or model calls.

## Scenario coverage matrix

| Scenarios | Owning task | Primary proof |
|---|---|---|
| CV1–CV5 | T1 | v2 schema/version seam/loader fixtures and TTY-like no-write guard |
| CV6–CV16 | T2 | fold fixtures, refusal/fault injection, setup migration and FS10 goldens |
| CV21–CV26 | T3 | strict/preference resolver goldens, stdout/stderr and retired flag tests |
| CV17–CV20, CV27 | T4 | FS8 v2 status fixtures and checker compatibility tests |
| CV28–CV32 | T5 | release guard, binding/prose/ADR assertions, dogfood and full sweep |

T5 is the first task that runs the complete suite as the regression proof for
CV1–CV27. T1–T4 validators run their owned focused suites while the remaining
consumers are intentionally migrated in sequence; this avoids treating known
transitional failures as task-local defects.

## Task dependency graph

```text
             ┌──→ T2 ──┐
T1 ──────────┼──→ T3 ──┼──→ T5
             └──→ T4 ──┘
```

T1 lands the merged schema and shared version seam first. T2, T3, and T4 are
independent implementation slices once T1 is available. T5 integrates all
surfaces and performs the dogfood fold, so it is blocked by T2, T3, and T4.

---

## T1 — v2 schema, version seam, and detection-only loader

### Outcome

The merged config schema validates the complete v2 union and the shared loader
classifies versions with the exact remedy strings. All non-migration consumers
halt on older/newer/invalid versions without prompting or writing; the raw
migration bypass exists only for the designated setup/migration path. During
this staged implementation, the old models loader/validators and assets remain
as transitional compatibility until T2–T4 migrate their callers; the final
retirement is still required by the spec and is verified by T5.

### Scope

- Update `schema/sdlc.config.schema.json` and its example with `panels`,
  `enforcement`, and schemaVersion 2; delete the standalone models schema and
  example.
- Extend `scripts/lib.mjs` with `CONFIG_SCHEMA_VERSION`, past-version set,
  `classifyConfigVersion`, remedy constants, v2 inspection, guarded
  `readConfig`, and the three-state raw migration read.
- Add the v2 seam without breaking still-unmigrated consumers: retain the
  legacy models loader/validators and assets temporarily, with their retirement
  owned by T2–T4 when their callers move to the merged file.
- Re-home v1 config/models samples as migration-input fixtures. Resolver
  goldens are recorded by T3 immediately before resolver edits.

### Scenarios

CV1, CV2, CV3, CV4, CV5.

### Checks

```bash
node --check skills/sdlc/scripts/lib.mjs
node --check skills/sdlc/scripts/resolve-panel.mjs
node --check skills/sdlc/scripts/sdlc-status.mjs
node --check skills/sdlc/scripts/setup-sdlc.mjs
node --test test/config-versioning.test.js test/lib-config.test.js test/readiness-lib.test.js test/hooks.test.js
npm run lint
```

### Task DoD

- [ ] Full-union v2 fixtures pass, with ordered per-path closed-vocabulary
      issues for invalid fields and absent panels remaining valid.
- [ ] Classification is total/throw-free for current, older, newer, and
      invalid inputs; all consumers use the shared seam.
- [ ] Older configs produce the exact remedy with no prompt or write even on a
      TTY-like stdin; malformed/newer behavior remains distinct.
- [ ] The raw-read importer containment assertion names setup/migration only.
- [ ] Recorded v1 goldens are generated from shipped pre-change behavior.

### Out of scope

Migration writes/setup interview (T2), resolver behavior (T3), FS8/checker
surfaces (T4), and docs/ADRs/dogfood (T5).

## T2 — migration engine, setup migration mode, and FS10 v2

### Outcome

`planMigration` is a pure registry-composed 1→2 fold and `applyMigration` is
the sole staged writer. `setup-sdlc` is the only confirmation surface, handles
migration/refusal/residue cleanup, writes the merged v2 file for fresh adopters,
and emits the schemaVersion-2 FS10 report with retired/seeding flags enforced.

### Scope

- Add `scripts/migrate.mjs` with exhaustive mapping, unmappable reporting,
  fsync/rename/unlink recovery ordering, and fault-injection seams.
- Add setup migration detection, live-TTY confirmation, non-TTY/decline and
  flag-mixing refusals, independent models/staging residue prompts, and
  `--yes` non-confirmation behavior.
- Change fresh setup to write explicit `enforcement` and optional seeded
  `panels`; retire `--with-models`; add `--seed-panels` and `--enforcement`.
- Update setup shell wrapper and FS10 text/JSON/catastrophic goldens to v2.

### Scenarios

CV6–CV16.

### Checks

```bash
node --check skills/sdlc/scripts/migrate.mjs
node --check skills/sdlc/scripts/setup-sdlc.mjs
node --test test/migration.test.js test/setup-sdlc.test.js
npm run lint
```

### Task DoD

- [ ] Pair-A, pair-B, and config-only folds deep-equal committed v2 fixtures;
      unknown keys, malformed files, and non-string comments list every
      unmappable path and leave directory bytes untouched.
- [ ] Faults at staging write/fsync/rename/unlink expose only the two allowed
      recovery classes; v2 consumers ignore models residue.
- [ ] TTY accept/decline, non-TTY, `--yes`, and mutation-flag mixing match the
      exact migration contract and reports.
- [ ] Fresh setup defaults to explicit preference; strict and panel seeding
      are opt-in and `--with-models` is a usage error.
- [ ] Every report envelope, including refusal and catastrophic paths, is
      schemaVersion 2 with pinned action vocabulary.

### Out of scope

Resolver selection/posture (T3), FS8/checker changes (T4), release guard and
repository documentation (T5).

## T3 — resolver posture and merged-roster input

### Outcome

`resolve-panel` reads the validated merged `panels` block, preserves strict
resolution behavior, adds preference-mode best-effort shortfalls and author
readmission advisories on stderr, and retires `--models-file` without changing
machine stdout shape.

### Scope

- Replace standalone models-file input with `readConfig(root).panels`, while
  distinguishing missing manifest from panels-less valid config.
- Preserve vendor-axis and lifecycle model-axis ordering/deduplication and
  supersede notices; source floors from `minVendor` or `minPanel` as specified.
- Implement strict/preference enforcement, author demotion, empty-panel and
  gate-mode refusals, exact stderr advisories, and both stdout formats.
- Update shell wrapper and resolver tests/goldens, including residue safety.

### Scenarios

CV21–CV26.

### Checks

```bash
node --check skills/sdlc/scripts/resolve-panel.mjs
node --test test/resolve-panel.test.js test/resolve-panel-lifecycle.test.js
npm run lint
```

### Task DoD

- [ ] Preference shortfalls exit 0 with parseable unchanged stdout and exact
      stderr advisories; strict shortfalls retain exit 1.
- [ ] Author exclusion is retained while reachable and demoted only on
      preference shortfall; empty panels and mode refusals still exit 1.
- [ ] Vendor and model axes retain their effective ordering/deduplication and
      strict folded pair-A output matches recorded v1 goldens modulo the
      enumerated path/name notices.
- [ ] Missing manifest, panels-less manifest, v1 config, and retired flag each
      produce their specified distinct outcome without reading a supplied
      `--models-file` path.

### Out of scope

Migration mechanics (T2), FS8/checker (T4), CI/docs/ADRs/dogfood (T5).

## T4 — FS8 v2 and checker compatibility

### Outcome

`sdlc-status` reports schema drift through the additive `config.schema-current`
and `config.panels` checks with the v2 report envelope, while
`check-lifecycle` routes version classification before v2 validation and
retains its independent FS9 envelope and semantics.

### Scope

- Implement the FS8 v2 check set, prerequisites, behind/ahead/invalid split,
  roster readiness, retired models checks, skip reasons, exits, and text/JSON
  envelope goldens.
- Route `check-lifecycle` config validation through the shared classifier with
  canonical older/newer remedies; leave declarations, artifacts, and FS9
  envelope schemaVersion 1 untouched.
- Update shell wrappers and focused status/checker tests.

### Scenarios

CV17–CV20, CV27.

### Checks

```bash
node --check skills/sdlc/scripts/sdlc-status.mjs
node --check skills/sdlc/scripts/check-lifecycle.mjs
node --test test/sdlc-status.test.js test/readiness-output.test.js test/check-lifecycle.test.js
npm run lint
```

### Task DoD

- [ ] v1 is not-ready/exit 3 with a passing deferred config-valid check and a
      failing schema-current remedy; every unrelated check still evaluates.
- [ ] v3 is error/exit 2 with the newer remedy; malformed input retains the
      existing error shape; panels-less v2 is not-ready/exit 3.
- [ ] Clean migrated v2 without a models file reaches ready/exit 0 and emits
      no `models.*` check ids.
- [ ] Checker v2 passes, v1 gives the canonical superseded remedy, and its
      FS9 report remains schemaVersion 1.

### Out of scope

Migration/setup (T2), resolver (T3), release guard and prose/binding changes
(T5).

## T5 — release guard, bindings, ADRs, prose, and dogfood integration

### Outcome

The release channel mechanically rejects watched schema-shape changes without a
breaking PR signal; all references, CI, SKILL prose, ADR amendments, and
repository dogfood reflect the merged surface. The integrated branch passes the
full compatibility sweep.

### Scope

- Add `check-schema-break.mjs` and the thin CI step with squash/PR-title-aware
  event payload handling; add offline synthetic-repo/event tests.
- Repoint normative references, update `.github/workflows/ci.yml`, SKILL.md,
  and all non-historical bindings; enforce the historical-doc-only models-file
  grep.
- Write the five ADR ledger items and cross-reference superseded/amended ADRs.
- Fold this repo's own files through interactive setup, remove the models file,
  verify status/panels, and add dogfood tests.
- Run integrated full suite/lint and produce all task validation manifests and
  receipts.

### Scenarios

CV28–CV32, plus regression confirmation for CV1–CV27.

### Checks

```bash
node --check skills/sdlc/scripts/check-schema-break.mjs
node --test test/schema-break.test.js test/docs.test.js test/reference-contract.test.js
node --test
npm run lint
```

### Task DoD

- [ ] Watched schema/config constant diffs fail without a breaking PR title or
      body signal, including the plain squash title over a `feat!` inner commit;
      non-watched diffs pass.
- [ ] CI wiring, normative references, setup/resolver prose, and startup
      migration instruction match the spec; no non-historical models binding
      remains.
- [ ] All five ADRs exist and each superseded/amended ADR has a forward link.
- [ ] Dogfood fold is performed through setup, leaves exactly one v2 config,
      no models file, ready status, and equivalent live panels.
- [ ] `npm test`, `npm run lint`, and every task validator pass offline.

### Out of scope

New OL-B checker/evidence or report-nudge content, profile application to
existing adopters, prompt enforcement mode, downgrade paths, and PR-panel
remediation.
