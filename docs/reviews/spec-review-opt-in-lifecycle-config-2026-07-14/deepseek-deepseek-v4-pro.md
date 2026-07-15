### resolve-panel "strictest configured value" is undefined

- severity: high
- confidence: high
- location: spec §4.2 line 178
- defect: The spec says `resolve-panel` without `--track` uses "the strictest configured value" for per-track gate modes, but never defines a strictness ordering across the four `GateMode` values. For `{irreversible: "panel", reversible: "human"}` it is ambiguous whether `panel` or `human` is "strictest." The outcome differs materially: if `human` is strictest, `resolve-panel plan_review` without `--track` refuses (exit 1); if `panel`, it resolves normally. An implementer has no basis to choose.
- evidence: The word "strictest" appears only at spec line 178; it is not defined in §2, §4, or anywhere else in the spec. GateMode values are `panel | advisory | human | off` — no intrinsic ordering is stated. The plan and ratified decisions (#36 amendment, #37 profile matrix) define no such ordering. OLA13 tests `--track reversible` and `--track irreversible` but never tests the no-`--track` case for per-track modes.
- impact: An implementer must invent a gate-mode ordering (e.g., `off > human > advisory > panel` based on "most restrictive" or the inverse). Two independent implementers could pick opposite orderings. The checker (OL-B) depends on `resolve-panel` correctly resolving per-track modes; getting this wrong in OL-A breaks OL-B's gate-mode awareness.
- fix: Either (a) define the strictest value as the value from the per-track key with the *most restrictive* reviewer behaviour, using the `decomposeGateMode` table — "strictest = the value whose `decomposeGateMode` has `reviewer === 'none'` (i.e., `human`/`off` beats `panel`/`advisory`); if still ambiguous, `off` beats `human`" — and add an OLA scenario for it; or (b) drop the no-`--track` fallback and require `--track` when the gate uses a per-track object (refuse with a diagnostic if omitted), which eliminates the ambiguity entirely.

### `--track` flag accepted values not enumerated

- severity: medium
- confidence: high
- location: spec §4.2 lines 177-178
- defect: The spec introduces a new `--track` flag for `resolve-panel` but never states the allowed values. It is implied to be `irreversible` or `reversible` (the only track enum values excluding `none`), but the spec never says so. The current `resolve-panel.mjs` (`skills/sdlc/scripts/resolve-panel.mjs:21-40`) parses CLI args manually and would need this new flag added to its arg parser — without a defined value set, the Tasks author must guess the exact strings.
- evidence: Spec lines 177-178: "the value for the track passed via a new optional `--track` flag." No value enumeration follows. Compare with plan DoD-5 which mentions per-track resolution but doesn't enumerate `--track` values either. The current `resolve-panel.mjs` arg parser at lines 21-40 has no `--track` case.
- impact: The Tasks author might pick `irreversible`/`reversible`, or `irrev`/`rev`, or `1`/`2`. If the wrong strings are baked in, OLA13 tests them but later consumers (CI workflow, OL-B checker) would need to match. The frozen shape of the CLI interface matters.
- fix: Add to §4.2: "`--track` accepts `irreversible` or `reversible` (matching the FS9 declaration grammar track enum). Any other value is a usage error (exit 2)."

### No scenario gates `--track` absence with per-track modes

- severity: medium
- confidence: high
- location: spec §6, OLA13 (line 262-264)
- defect: OLA13 verifies `--track reversible` refuses and `--track irreversible` resolves for a per-track mode object, but there is no scenario testing the behaviour when `--track` is NOT passed for a per-track mode. The "strictest configured value" rule in §4.2 has no falsifiable test, making it unverified by the scenario suite and potentially implementable differently by different Tasks authors.
- evidence: OLA13 text: "per-track mode `{irreversible: "panel", reversible: "human"}` with `--track reversible` refuses and with `--track irreversible` resolves." The no-`--track` case is absent. Compare OLA9 (block-present vs block-absent, no `--track` needed because it tests `pr_review` with a scalar mode), OLA10-11 (no `--track` needed), OLA12 (no `--track` needed). Only OLA13 touches `--track` and only the two explicit-flag cases.
- impact: Combined with finding 1 (undefined "strictest"), this means the spec's gate-mode resolution for per-track objects is underspecified and unverified — two defects compounding. The OL-B checker depends on this gate-mode awareness working correctly for CI flows that may or may not pass `--track`.
- fix: Add an OLA scenario (e.g., OLA13b): "`resolve-panel plan_review` without `--track` against `{irreversible: 'panel', reversible: 'human'}` exits 1 with the refusal message (strictest = human)" — once the strictest ordering is defined per finding 1.

### `plan_review.mode: {}` validity rule has no dedicated scenario

- severity: low
- confidence: high
- location: spec §6, OLA7 (line 238-239)
- defect: §2 cross-field rule states "per-track object with keys drawn from {`irreversible`,`reversible`} (at least one key)." An empty per-track object `{}` is invalid. OLA7 mentions this parenthetically ("`plan_review.mode: {}` (empty per-track object) is invalid") but it is buried inside OLA7 which primarily covers `spec_review.mode: {reversible: ...}`. The same rule applies to `spec_review.mode: {}` (at least one key = `irreversible`), but no scenario tests an empty `spec_review` per-track object. A Tasks author skimming OLA7 by its title ("spec_review.mode: {reversible: 'panel'} yields the structural issue") could miss the empty-object validation requirement entirely.
- evidence: OLA7 text: "`spec_review.mode: {reversible: 'panel'}` yields the structural issue; invalid. `plan_review.mode: {}` (empty per-track object) is invalid." No separate scenario for empty per-track objects. The `spec_review` empty-object case is not mentioned at all.
- impact: The `at least one key` rule for all per-track mode objects is under-tested. A Tasks author might only validate `plan_review.mode: {}` and miss `spec_review.mode: {}` — producing a validator that accepts an empty `spec_review` per-track mode object, which then has undefined effective mode semantics at resolution time.
- fix: Add a dedicated scenario (e.g., OLA7b): "`plan_review.mode: {}`, `spec_review.mode: {}`, and `pr_review.mode: {}` each yield a structural issue (empty per-track object); invalid."

### `resolve-panel` lifecycle-floor sourcing requires config read not documented in surface table

- severity: low
- confidence: medium
- location: spec §1 surface table / §4.2
- defect: The spec says `resolve-panel.mjs` takes floor values from the `lifecycle` block (§4.2), but currently `resolve-panel.mjs` reads only `sdlc.models.json` via `readModels()` (`skills/sdlc/scripts/resolve-panel.mjs:72`). It has no code path to read `sdlc.config.json`. The spec's surface table (§1) lists `scripts/resolve-panel.mjs` as changed ("floor sourcing precedence; vendor-dedupe relaxation; `task_validate` rule") but does not call out the new dependency on reading `sdlc.config.json`. The Tasks author will discover this during T2 but the spec doesn't make the input dependency explicit.
- evidence: `resolve-panel.mjs:72`: `const cfg = readModels(root, modelsFile || undefined);` — only reads models. `readModels` calls `validateModels`; the config is never parsed by `resolve-panel`. The spec §4.2 requires reading `lifecycle.gates.<phase>.{minPanel,minVendors}` and `lifecycle.taskValidation.mode` from config. The `readConfig` function exists in `lib.mjs:101-118` but is unused by `resolve-panel` today.
- impact: A Tasks author implementing T2 needs to add `readConfig` or `inspectConfig` usage to `resolve-panel`. This is straightforward but the spec should name it in the surface table to prevent the author from attempting to keep `resolve-panel` config-free and instead adding lifecycle floor awareness to `readModels` (which would be the wrong layering).
- fix: Add to the §1 surface table's `resolve-panel` row: "now reads `sdlc.config.json` via `readConfig` for lifecycle floor sourcing when the block is present."

CLEAR: A — The `lifecycle` vocabulary is fully specified; every dial named, typed, and defaulted. The closed-vocabulary rules (no merge key, no scenarios key, no checks off-switch, `defaultTrack` excludes `none`) are correctly kernel-protecting. No missing field that cannot be backfilled.

CLEAR: B — All 19 OLA scenarios have determinable pass/fail conditions and are falsifiable. The gaps noted above (findings 3, 4) are about missing coverage cases, not unfalsifiable scenarios.

CLEAR: C — All interfaces are buildable against the current `lib.mjs`/`resolve-panel.mjs`/`setup-sdlc.mjs` surface with the documented additive changes. The `decomposeGateMode` export, profile expansion table, and `inspectConfig` extension follow existing patterns (hooks precedent). The one implicit dependency (finding 5) is low-severity.

CLEAR: D — No contradictions with the plan rev 2, consolidated review findings, or ratified #35-#38 decisions. The spec correctly implements #36's `defaultTrack` as `"irreversible" | "reversible"` (the research brief's `"ask"` was not ratified in the plan or profile matrix). Profile presets exactly match the #37 ratified matrix. `profile` is correctly provenance-only per #37 Q6 resolution.

CLEAR: E — The spec composes correctly with how `inspectConfig` (ordered-issues collector, `additionalProperties:false` discipline), `resolve-panel` (vendor dedupe, author exclusion, floor enforcement), and `setup-sdlc` (config write, existing-asset refusal, FS10 report vocabulary) actually behave. The `upgraded` action already exists in the FS10 report vocabulary (setup-sdlc.mjs:390). The non-destructive application to existing manifests requires a new code path but is correctly scoped as new behaviour.

CLEAR: F — Non-functional requirements NF-1 (byte-identical without lifecycle block), NF-2 (closed vocabulary), and NF-3 (deterministic preset expansion) are each tied to at least one scenario (OLA1, OLA3/OLA19, OLA14 respectively). NF-1 is falsifiable: any existing test assertion change fails OLA1. NF-2 is falsifiable: adding `lifecycle.automation` must reject (OLA19). NF-3 is falsifiable: two OLA14 runs produce identical blocks.

CLEAR: G — Honesty sweep passed. No over-claiming detected. The spec correctly states OL-A scope boundaries (§7), acknowledges that `check-lifecycle` changes are OL-B, and does not claim FS8 or FS10 report envelope changes. The "preset-comparison creep" guard in OLA8 (hand-edited dials differing from preset remain valid) is honest. The `$comment` reservation is correctly described as documentary-only ("rejected like any unknown key").

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Review targets only the spec artifact docs/specs/2026-07-14-opt-in-lifecycle-config.md. All 19 OLA scenarios examined; findings are confined to spec defects (under-specification, missing scenarios, implicit dependencies). No scope-widening recommendations made. OL-A boundaries verified against plan §7 scope-out and spec §7 out-of-scope list."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Findings cite spec line numbers, source file:line references (resolve-panel.mjs:72, setup-sdlc.mjs:382-391, lib.mjs:101-118), and ratified decision resolutions (#36, #37). 5 concrete findings with severity, confidence, evidence, impact, and fix. CLEAR attestations for all 7 attack surfaces A-G."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read docs/specs/2026-07-14-opt-in-lifecycle-config.md (full)",
      "result": "passed",
      "summary": "Full spec read, all 8 sections + 19 scenarios"
    },
    {
      "command": "read docs/plans/2026-07-14-opt-in-lifecycle.md (full)",
      "result": "passed",
      "summary": "Full plan rev 2 read, verified Spec decomposition, DoD, scope boundaries"
    },
    {
      "command": "read docs/reviews/plan-review-opt-in-lifecycle-2026-07-14/consolidated.md (full)",
      "result": "passed",
      "summary": "All 14 findings verified incorporated in plan rev 2"
    },
    {
      "command": "read skills/sdlc/scripts/lib.mjs, resolve-panel.mjs, setup-sdlc.mjs (full)",
      "result": "passed",
      "summary": "Ground-truth verified: inspectConfig allowed-key set, resolve-panel min_panel ?? 1, configMutating logic, setup-sdlc upgraded action path"
    },
    {
      "command": "read schema/sdlc.config.schema.json, .pi/sdlc/sdlc.models.json (full)",
      "result": "passed",
      "summary": "Current schema additionalProperties:false and models min_panel structure verified"
    },
    {
      "command": "gh issue view 35,36,37,38 -R threadsafe-systems/pi-sdlc --comments",
      "result": "passed",
      "summary": "All resolutions and amendments verified: kernel items, lifecycle schema, profile presets, entrypoint contracts"
    },
    {
      "command": "grep for 'strictest' across docs/",
      "result": "passed",
      "summary": "Confirmed 'strictest' appears only at spec line 178 with no definition anywhere"
    },
    {
      "command": "read test/extraction.test.js, test/setup-sdlc.test.js, test/setup-bundle.test.js",
      "result": "passed",
      "summary": "Existing test patterns understood; resolve-panel isolated-env test structure confirmed"
    }
  ],
  "validationOutput": [
    "Spec §2 normative schema: all dials named, typed, defaulted. Closed vocabulary consistent with kernel invariants.",
    "Spec §3 profile presets: exactly matches #37 ratified matrix (10 dials × 3 presets).",
    "Spec §4.1 inspectConfig: additive pattern matches hooks precedent in lib.mjs.",
    "Spec §4.2 resolve-panel: floor sourcing, vendor dedupe relaxation formula, task_validate rule all match #36/#37 ratified decisions.",
    "Spec §4.3 setup-sdlc: profile interview, non-destructive application, FS10 report reuse all match plan DoD-2.",
    "Spec §6 scenarios: all 19 have determinable pass/fail conditions. OLA1 and OLA9 correctly test byte-identical non-regression.",
    "Spec §7 out-of-scope: correctly excludes OL-B (checker), OL-C (skill prose), evidence.channels.json, FS2 schema changes.",
    "5 defects found (1 high, 2 medium, 2 low). No blockers that would prevent proceeding to Build phase with addressed findings."
  ],
  "residualRisks": [
    "JSON.stringify re-serialization of existing config for non-destructive profile application (§4.3) may not be byte-identical to the original file in all edge cases (e.g., trailing whitespace, BOM, non-standard line endings), though spec constrains this by requiring 2-space indent matching setup's own serialization format.",
    "resolve-panel lifecycle-floor sourcing depends on readConfig being usable from resolve-panel — currently resolve-panel only calls readModels. Adding config-reading changes resolve-panel's error paths (config parse failures, missing manifest) which must compose correctly with the existing 'missing models file' error handling."
  ],
  "noStagedFiles": true,
  "diffSummary": "No files changed (read-only review). Spec artifact reviewed at commit 4d34840 on branch feat/opt-in-lifecycle, worktree /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-opt-in-lifecycle.",
  "reviewFindings": [
    "high: spec §4.2 line 178 — 'strictest configured value' for per-track gate modes is undefined; OLA13 never tests the no---track case",
    "medium: spec §4.2 lines 177-178 — --track flag accepted values not enumerated",
    "medium: spec §6 OLA13 — no scenario for --track absence with per-track modes",
    "low: spec §6 OLA7 — empty per-track object validity rule for spec_review.mode: {} not tested",
    "low: spec §1 surface table — resolve-panel config-read dependency not documented"
  ],
  "manualNotes": "The high-severity finding (undefined 'strictest') is the only finding that should block Build phase. Recommend the spec author choose between (a) defining a strictness ordering anchored in the decomposeGateMode table, or (b) making --track mandatory when the gate uses a per-track mode object — option (b) is simpler and eliminates the ambiguity entirely. The medium findings are clarifications that a Tasks author could resolve during implementation but should be settled in the spec to avoid divergent implementations. All CLEAR surfaces A-G confirmed: the spec is well-grounded in the code, consistent with ratified decisions, and correctly scoped to OL-A."
}
```
