### 1. `readConfigRawForMigration` is dead code — residual from migration removal

- severity: low
- confidence: high
- file: skills/sdlc/scripts/lib.mjs
- line: 192–207
- problem: This exported function is the IO bypass that fed the removed `migrate.mjs` pipeline. It has zero call sites anywhere in the codebase after the clean break — not in `setup-sdlc.mjs` (which previously called it), not in any consumer, and not in any test. It is dead code sitting on a frozen surface (FS1).
- repro_or_impact: `grep -rn "readConfigRawForMigration" skills/sdlc/scripts/` returns only the definition. Retaining it violates the "no migration surface exists" contract in the spec (§1), wastes a frozen-surface slot, and risks someone discovering it and attempting to rebuild migration against it.
- smell: Speculative Generality
- fix: Delete the function and its comment block. If the removed `migrate.mjs` was the only consumer, nothing references it.

---

### 2. `floorFor()` hardcodes task_validate floor to 1, ignoring `review.panelSize` and per-track overrides

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.mjs
- line: 82–87
- problem: The function `floorFor()` returns 1 unconditionally for `task_validate` when no per-phase `panels.phases.task_validate.panelSize` is set. It short-circuits before consulting `overrides.<track>.review.panelSize` or `review.panelSize`. The schema explicitly permits `panelSize` in per-track overrides (§2.3), and `review.panelSize` is documented as "default distinct-model floor for review gates" (§2.1) — but neither path ever reaches task_validate.
- repro_or_impact: A consumer who sets `review.panelSize: 4` (or an `overrides.reversible.review.panelSize: 3`) and omits `panels.phases.task_validate.panelSize` will see task_validate resolve with floor 1, producing a single-validator panel. This is silently inconsistent with every other phase, where the floor flows correctly through the precedence chain. The behaviour is preserved from v2 (`resolveLifecycle()` also hardcoded task_validate floor to 1), so it is not a regression, but the v3 vocabulary makes the inconsistency more visible because `review.panelSize` now claims to be the universal default.
- fix: Either (a) remove the `phase === "task_validate"` special case and let the per-track/default chain apply normally (task_validate would then respect `review.panelSize` unless overridden), or (b) explicitly document in the spec (§2.1, `panelSize` row) that task_validate always defaults to 1 regardless of `review.panelSize`. The first option changes behaviour; the second is a spec-only fix.

---

### 3. `setup-sdlc.sh` wrapper comment lists retired `--enforcement` flag

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.sh
- line: 9
- problem: The shell wrapper usage comment on line 9 reads `[--seed-panels] [--enforcement strict|preference] [--force] [--yes]`. The `--enforcement` flag is retired in v3 — `setup-sdlc.mjs` throws a `SetupError` naming `--on-shortfall` as its successor. The wrapper comment is out of sync.
- repro_or_impact: A user reading the shell wrapper comment may try `--enforcement strict` and get a confusing error. The .mjs correctly rejects it; only the documentation is stale.
- fix: Update line 9 to match the .mjs usage string, removing `--enforcement` and adding the v3 flags.

---

### 4. `resolve-panel.sh` wrapper comment advertises `vendor` format for `--author`

- severity: low
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.sh
- line: 6
- problem: The shell wrapper comment says `--author <provider/model|vendor>`. The `vendor` heuristic was deleted in this PR — `resolve-panel.mjs` only accepts `provider/model` format and rejects anything else with `--author must be provider/model`. The wrapper comment misleads about the accepted format.
- repro_or_impact: A user who passes a bare vendor name (e.g., `--author anthropic`) based on the wrapper comment would get a hard error. The .mjs rejects it correctly; the wrapper comment is stale.
- fix: Change line 6 to `--author <provider/model>` to match the .mjs.

---

### 5. `setup-sdlc.mjs` `--default-track` value is not validated in `parseArgs`

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 233–236
- problem: `--default-track` accepts any string without validation during argument parsing. Invalid values like `--default-track none` pass through to `reviewShapeFromOptions`, flow into the assembled config, and are only caught later by `inspectConfig` producing a generic `shape.defaultTrack must be one of irreversible, reversible` error. By contrast, `--review-design`, `--on-shortfall`, `--panel-size`, `--publish-to-tracker`, and `--separate-spec` all validate at parse time.
- repro_or_impact: Poor UX — the error says the config is invalid rather than naming the specific flag. Not a correctness issue (the config is never written with an invalid track).
- fix: Add a validation check in the `case "--default-track"` branch: reject values outside `new Set(["irreversible", "reversible"])` with a clear flag-level error, matching the style of `--on-shortfall` and `--review-design`.

---

### 6. `sdlc-status.mjs` header comment references a stale spec document name

- severity: low
- confidence: medium
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 3
- problem: The header comment says `docs/specs/2026-07-16-config-versioning-migration.md §6`. The "migration" spec name is from the pre-clean-break era. The active spec for v3 is `docs/specs/2026-07-17-config-intent-vocabulary.md` (or the versioning spec may have been superseded). The comment is not load-bearing but is misleading about the governing document.
- repro_or_impact: A maintainer following the header reference would look for a spec that may no longer exist or has been replaced. No effect on runtime behaviour.
- fix: Update the comment to reference the current spec document if one exists, or remove the stale filename and keep only the section reference.
