# Round 2 — verification pass (deepseek/deepseek-v4-pro:high)

HEAD under review: `945db9b` (fix commit on top of `feedd43`).
Consolidated round 1: 1 high, 6 medium, 6 low — all actioned or dismissed.

## (a) writeBundle config branch ordering

Traced all paths exhaustively. The branch precedence is:

1. `!configExists` → create fresh
2. `malformed|invalid` → hard-stop (even with `--force`)
3. `newer && !force` → refuse
4. `older && !force` → refuse
5. `non-current && force` → honest clean-break write (`cfg` from `assembleConfig`)
6. `intentFlags && !identityFlags && current` → patch path
7. `configMutating && force` → whole-file replacement (`cfg`)
8. `configMutating && !force` → refuse
9. fallthrough → retained

No unreachable branch, no combination produces an invalid or unintended config.
The `intentFlags` / `identityFlags` split correctly gates the patch path —
identity flags (prefix, labelPrefix, announce, etc.) never enter the
intent-patch branch. `--force` bypasses the clobbered guard inside the patch
path but preserves patch semantics (non-identity keys survive).

**clobbered computation** (`setup-sdlc.mjs:594`):
```js
const existingTracks = Object.keys(existing.overrides ?? {});
const clobbered = existingTracks.filter((t) =>
  JSON.stringify(existing.overrides[t]) !== JSON.stringify(patched.overrides?.[t])
);
```
This correctly detects all three override mutations: **delete** (when
`patched.overrides` is undefined or lacks track `t`), **alter** (when existing
and patched JSON strings differ), and **add** (when a track is new, it's not in
`existingTracks` so it passes). `JSON.stringify` as an equality check is safe
here because every value reaching it is a plain object with string/number/boolean
primitives, written by the same encoder — key-order stability is guaranteed by
`JSON.parse` → `structuredClone` → `JSON.stringify` round-trip.

**Verified edge cases:**

| Scenario | Branch | Result |
|---|---|---|
| New repo, no flags | 1 | created with standard preset |
| malformed config + `--force` | 2 | hard-stop refusal (by design) |
| v2 config, no force | 4 | refused with honest remedy |
| v2 config + `--force` | 5 | upgraded to v3 |
| v4 config + `--force` | 5 | downgraded to v3 |
| current, `--review-code human` | 6 | patched (review.code only) |
| current, `--preset solo` with existing overrides | 6 → clobbered → refused | data-loss guard |
| current, `--preset solo --force` with existing overrides | 6 → force bypasses guard | overwrites overrides |
| current, `--prefix foo --force` | 7 | full replacement |
| current, `--prefix foo` | 8 | refused without force |
| current, no flags | 9 | retained |

**Conclusion: no reachable combination writes an invalid or unintended config.**

## (b) reviewShapeFromOptions(opts, base) — seed correctness

`setup-sdlc.mjs:140-157`:

```js
function reviewShapeFromOptions(opts, base) {
  const seed = base ?? structuredClone(PRESETS[opts.preset ?? "standard"]);
  const review = { ...seed.review };
  const shape = { ...seed.shape };
  let overrides = seed.overrides ? structuredClone(seed.overrides) : undefined;
  // ...per-dial flag overrides...
}
```

**Single-dial patch path** (`setup-sdlc.mjs:586`):
```js
const patched = opts.preset === undefined
  ? reviewShapeFromOptions(opts, { review: existing.review, shape: existing.shape, overrides: existing.overrides })
  : { review: cfg.review, shape: cfg.shape, overrides: cfg.overrides };
```

When `--preset` is absent, the base is the existing config's intent blocks.
`review` and `shape` are shallow-copied (all values are primitives — no
mutation risk), and `overrides` is `structuredClone`d. Only explicitly flagged
dials mutate the copies; all other dials retain their existing values. Test
ICA19 (single-dial preserves) confirms: `--review-code human` on a solo-prefixed
config changes only `review.code` while preserving `review.brainstorm` (`"off"`),
`review.tasks` (`"self"`), and `shape.publishToTracker` (`"never"`) — values
that differ from the standard preset's defaults.

**Fresh-write path** (`writeBundle` branches 1, 5, 7): no `base` argument
provided → `seed = structuredClone(PRESETS[opts.preset ?? "standard"])`.
Standard preset is the fallback, exactly as before. ✅

**Override interaction**: when `seed.overrides` is undefined and the override
loop mutates `overrides`, `overrides ??= {}` allocates a fresh object — the seed
is never mutated. ✅

**Conclusion: base seeding correctly preserves unrelated dials during patches
and correctly uses preset/standard seed for fresh writes.**

## (c) resolve-panel task_validate mode gate

`resolve-panel.mjs:168-175`:
```js
if (phase === "task_validate") {
  const mode = effective("tasks");
  if (mode === "off") fail("...task validation is off...", 1);
  if (mode !== "subagent") fail("...only 'subagent' resolves a validator panel", 1);
}
```

- Mode `"off"` → distinct refusal message ("off").
- Mode `"self"` → distinct refusal message ("only 'subagent' resolves"). Added by M1 fix.
- Any other value → same "only 'subagent'" refusal.
- Mode `"subagent"` → proceeds to panel resolution.

`effective("tasks")` correctly resolves per-track overrides via
`overrides?.[track]?.review?.tasks ?? review.tasks`. The `decomposeGateMode`
function is **never** invoked for `task_validate` (it's only used for non-task
phases with `panel|advisory|human|off` values).

`floorFor()` remains unchanged: for `task_validate`, it returns
`ph.panelSize` if set, otherwise the hardcoded `1` (spec §3, OL-A fixed-1
rule). This is correct per the L4 dismissal in the consolidated report.

Tests: ICA14 (off) and new ICA14 (self) both pass. Exit codes and stderr
messages match expectations.

**Conclusion: the task_validate mode gate correctly refuses `self` and `off`,
and `effective()`/`floorFor()` are unaffected.**

## (d) Residual retired vocabulary — grep sweep

**Runtime scripts** (`skills/sdlc/scripts/`):

| Token | Locations | Verdict |
|---|---|---|
| `readConfigRawForMigration` | zero | fully purged (confirmed no matches) |
| `minVendor`, `excludeAuthorVendor`, `mergePlanSpec`, `publishThreshold` | zero | fully purged |
| `profile`, `enforcement` | `setup-sdlc.mjs:242-247` only | retirement diagnostics only (case labels + `SetupError` throws); ICA20 confirms no runtime reader |
| `migration` | `setup-sdlc.sh:19` ("There is no config migration") | honest statement per M7 fix |
| `v2` | `lib.mjs:36` (comment about pre-v2 default behavior) | historical context in a code comment, not a stale migration promise |
| `lifecycle` | multiple files | natural-language use ("lifecycle phases", "lifecycle tracks"), not the retired config key |

**SKILL.md**: `enforcement` appears only as a natural English word ("CI
enforcement", "same enforcement") — not as a config vocabulary reference. The
tracker-publish decision and red flag both reference `shape.publishToTracker`.
No hardcoded task-count threshold remains (M4 fix).

**ADR 0022**: Decision and Consequences correctly use `review.onShortfall`
(`fail|proceed`), `panelSize` (model-identity). Revision note maps old→new.
(M5 fix).

**README.md**: References `schemaVersion-3`, `review`/`shape` intent blocks,
per-track `overrides`. No stale v2/lifecycle/enforcement vocabulary (M6 fix).

**Shell wrappers**: `setup-sdlc.sh` advertises v3 flags (`--preset`, dials,
`--override`, `--publish-to-tracker`, `--default-track`), states "no config
migration" (M7 fix). `resolve-panel.sh` uses `--author <provider/model>` (no
`|vendor` form, L2 fix). No `--enforcement` flag (retired).

**sdlc-status.mjs**: Header references "config-versioning spec §6; version
classification updated for schemaVersion 3 per ADR 0026" (L6 fix).

**Conclusion: shipped surfaces are clean. No residual retired vocabulary,
no migration promises, no stale flag references.**

## Verdict

**Zero defects found.** All 13 round-1 findings (1 high, 6 medium, 6 low) are
correctly resolved. No regressions introduced. All 218 tests pass. The four
focus areas (a–d) have been exhaustively traced and are correct.

---

- severity: none — no findings
- confidence: high

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "All 13 round-1 findings verified resolved. 218 tests pass (7 new tests added for round-1 fixes). Exhaustive branch trace of writeBundle config ordering confirms no reachable combination writes an invalid or unintended config. Clobbered guard correctly detects delete/alter/add of override tracks. reviewShapeFromOptions base-seeding correctly preserves unrelated dials on patches and uses preset/standard for fresh writes. resolve-panel task_validate mode gate correctly refuses self/off, effective()/floorFor() unaffected. Grep sweep confirms zero residual retired vocabulary in shipped surfaces."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Changed files inspected at HEAD 945db9b: setup-sdlc.mjs (branch ordering, clobbered guard, base seeding), resolve-panel.mjs (task_validate gate), lib.mjs (readConfigRawForMigration deleted), README.md, ADR 0022, SKILL.md, sdlc-status.mjs, setup-sdlc.sh, resolve-panel.sh. Tests: config-intent-vocabulary.test.js (+2), setup-v3.test.js (+3), resolve-panel-v3.test.js (+2). npm test: 218/218 pass. Grep for retired vocabulary: clean across all shipped surfaces."
  }
  ],
  "changedFiles": [
    "README.md",
    "docs/adr/0022-user-owned-panel-enforcement-posture.md",
    "skills/sdlc/SKILL.md",
    "skills/sdlc/scripts/lib.mjs",
    "skills/sdlc/scripts/resolve-panel.mjs",
    "skills/sdlc/scripts/resolve-panel.sh",
    "skills/sdlc/scripts/sdlc-status.mjs",
    "skills/sdlc/scripts/setup-sdlc.mjs",
    "skills/sdlc/scripts/setup-sdlc.sh"
  ],
  "testsAddedOrUpdated": [
    "test/config-intent-vocabulary.test.js (ICA20 retired vocab, ICA21 SKILL pointer)",
    "test/resolve-panel-v3.test.js (ICA14 self refusal, ICA24 refusal precedence)",
    "test/setup-v3.test.js (ICA6 older-schema + force, ICA19 single-dial preserves, ICA19 preset-patch override guard)"
  ],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "218 tests, 0 failures, 3.95s"
    },
    {
      "command": "grep for retired vocabulary (minVendor, excludeAuthorVendor, mergePlanSpec, publishThreshold, profile, enforcement, readConfigRawForMigration)",
      "result": "passed",
      "summary": "Zero matches in runtime scripts after filtering retirement diagnostics; SKILL.md/README.md clean"
    }
  ],
  "validationOutput": [
    "All 218 tests pass (npm test)",
    "Grep sweep: zero residual retired vocabulary in runtime surfaces",
    "Manual branch trace: all writeBundle paths enumerated, no unreachable or invalid combination",
    "clobbered guard verified for delete/alter/add edge cases",
    "reviewShapeFromOptions verified for base-seeding and fresh-write paths",
    "resolve-panel task_validate gate verified for self/off/subagent modes"
  ],
  "residualRisks": [
    "none — round 1 fixes are complete and correct"
  ],
  "noStagedFiles": true,
  "diffSummary": "Round 1 fix commit (945db9b): 14 files, +315/-62. Fixes H1 (override data-loss guard with JSON.stringify clobbered check), M1 (task_validate self refusal), M2 (older schema + force clean-break), M3 (single-dial base-seeding), M4 (SKILL publishToTracker pointer), M5 (ADR 0022 vocabulary), M6 (README v3), M7 (setup-sdlc.sh no migration), L1 (readConfigRawForMigration deleted), L2 (resolve-panel.sh author form), L3 (missing tests added), L5 (default-track parse validation), L6 (sdlc-status.mjs header). L4 (task_validate floor 1) and L7 (force drops non-intent keys) dismissed as spec-sanctioned.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "Round 2 verification confirms full convergence. No defects found. The branch is ready for merge."
}
```
