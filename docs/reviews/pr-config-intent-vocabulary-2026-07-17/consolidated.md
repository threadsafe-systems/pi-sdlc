# Consolidated PR review — config intent vocabulary (2026-07-17)

- Branch: `feat/config-intent-vocabulary`; track irreversible.
- Panel (round 1, at HEAD feedd43): `openai-codex/gpt-5.6-sol:high`,
  `zai/glm-5.2:high`, `deepseek/deepseek-v4-pro:high` (3 distinct vendors;
  author vendor anthropic excluded). Orchestrator: anthropic/claude.
  Final adjudicator: project owner.

## Round 1 — 1 high, 6 medium, 6 low (consolidated). All actioned or
dismissed with reason; fixes committed on top of feedd43.

### H1 (high, sol#1 + glm#1) — preset patch dropped partial consumer overrides
The data-loss guard only fired when the preset carried *no* overrides; a preset
with a partial `overrides` block silently replaced a consumer's other-track
override. **Incorporated:** the guard now refuses (without `--force`) when the
new intent blocks would delete *or alter* any existing overrides track
(`setup-sdlc.mjs`), test ICA19.

### M1 (sol#2) — `review.tasks: self` still resolved a validator panel
`resolve-panel task_validate` refused only `off`. **Incorporated:** refuses
every mode except `subagent`, distinct message for `self`; test ICA14.

### M2 (sol#3) — bare `--force` on an older config falsely succeeded
Fell through to `retained`, leaving the v2 file. **Incorporated:** older/newer
schema + `--force` is now an honest whole-file replacement; test ICA6.

### M3 (sol#4) — a single-dial patch reset unrelated dials to standard
**Incorporated:** a patch without `--preset` now seeds from the *existing*
intent blocks and overlays only supplied flags (`reviewShapeFromOptions(opts,
base)`); test ICA19 (single-dial preserves).

### M4 (sol#5) — SKILL still hard-coded the two-task threshold in two spots
**Incorporated:** the single-task rule and the red flag now defer to
`shape.publishToTracker`; test ICA21.

### M5 (sol#6) — ADR 0022 body still declared `strict|preference`/`minVendor`
**Incorporated:** Decision + Consequences reworded to `review.onShortfall`
`fail|proceed` and `panelSize` (model-identity), old names kept only as the
historical mapping in the revision note.

### M6 (sol#7) — README still advertised schemaVersion-2/lifecycle/enforcement
**Incorporated:** rewritten to the v3 `review`/`shape`/`overrides` vocabulary.

### M7 (sol#8 + glm#2 + deepseek#3) — `setup-sdlc.sh` wrapper promised a deleted
migration and a retired `--enforcement` flag. **Incorporated:** wrapper usage
synced to the v3 `.mjs` surface; migration sentence removed (FS11 honesty).

### L1 (glm#3 + deepseek#1) — `readConfigRawForMigration` dead export
**Incorporated:** deleted from `lib.mjs`.

### L2 (glm#4 + deepseek#4) — `resolve-panel.sh` `|vendor` author form stale
**Incorporated:** wrapper usage now `--author <provider/model>`.

### L3 (glm#5) — ICA20/ICA21/ICA24 had no tests
**Incorporated:** added the purge test (ICA20), the SKILL-pointer test (ICA21),
and the refusal-precedence test (ICA24).

### L5 (glm#6 + deepseek#5) — `--default-track` not validated at parse time
**Incorporated:** parse-time enum validation added.

### L6 (deepseek#6) — `sdlc-status.mjs` header referenced a stale spec name
**Incorporated:** comment updated to the config-versioning spec + ADR 0026.

### L4 (deepseek#2) — `task_validate` floor hardcoded to 1 — **DISMISSED**
Working as specified: spec §3 defines `floor(task_validate)=1` (the OL-A
fixed-1 rule), raised only by a per-phase `panels.phases.task_validate.panelSize`.
Not a defect; the spec already documents it.

### L7 (glm#6-b) — `--force` whole-file replace drops non-intent keys — **DISMISSED**
Pre-existing, spec-sanctioned behaviour ("wholesale replacement … exactly as
today"); not a regression of this stream. Noted as a known footgun; the new
preset-patch path is the non-destructive alternative.

## Stop condition
No high or medium finding survives adjudication after round 1. Round 2 (below)
re-runs the panel against the fixed HEAD to confirm convergence.
