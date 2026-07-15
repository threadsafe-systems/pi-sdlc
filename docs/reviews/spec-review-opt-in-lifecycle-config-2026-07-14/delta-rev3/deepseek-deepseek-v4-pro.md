### OLA12 survives with vendor-era `1/1` notation and plural "floors"

- severity: medium
- confidence: high
- location: spec §6 OLA12, `docs/specs/2026-07-14-opt-in-lifecycle-config.md:348`
- defect: OLA12 reads `floors are fixed 1/1` — the `1/1` was the `minPanel/minVendors` notation from rev 2's vendor vocabulary. Rev 3 drops vendor, and §4.2 correctly states `fixed floor 1 model`, but OLA12 was not updated. The word "floors" (plural) also survived from when two floors existed.
- evidence: spec §4.2 (line ~240): `fixed floor 1 model; models-file min_panel for…` vs OLA12: `floors are fixed 1/1`. The `1/1` format was `minPanel/minVendors` throughout rev 2's spec (see the old profile matrix at `gates.pr_review.minPanel/minVendors` and the old OLA10 `minPanel: 2, minVendors: 1`). The diff `git diff 01d8dcd..bd19bf8` shows OLA12 was not touched.
- impact: An implementer reading OLA12 sees `1/1` and may code a check for two floors (model count AND vendor count) on the task_validate path — contradicting §4.2's single `1 model` floor. The normative §4.2 text is correct, but the scenario's `1/1` destabilises the acceptance gate.
- fix: Change OLA12 to `the floor is fixed at 1 model` (or `fixed floor 1 model`), matching §4.2.

### `:thinking` suffix stripping algorithm is undefined in the normative spec

- severity: medium
- confidence: high
- location: spec §2 Panellist identity rule, `docs/specs/2026-07-14-opt-in-lifecycle-config.md:95-99`
- defect: The identity rule says `any :thinking suffix stripped` but the spec never enumerates which suffixes constitute a `:thinking` suffix. The set (`off/minimal/low/medium/high/xhigh/max`) appears only in the `$comment` of `skills/sdlc/schema/sdlc.models.example.json:2`, which is an example file — not the normative spec. The same `$comment` warns that `some providers use trailing colons for other things, e.g. Bedrock version suffixes`, making the stripping algorithm non-trivial. Without a normative definition, an implementer must guess: strip-last-colon-segment vs. match-against-known-enum vs. strip-all-after-first-colon — and each gives different identities for edge cases like Bedrock IDs.
- evidence: `skills/sdlc/schema/sdlc.models.example.json:2`: `pi's ':<thinking>' suffix (off/minimal/low/medium/high/xhigh/max)` and `some providers use trailing colons for other things, e.g. Bedrock version suffixes`. The spec itself only says `any :thinking suffix stripped` with no enumeration or algorithm. The plan rev 3 (line 107) says the same: `with the :thinking suffix stripped`. Neither defines the set or the stripping rule.
- impact: Two implementers could build different identity-resolution rules and produce different panels from the same models file. Specifically, a Bedrock model ID like `amazon-bedrock/anthropic.claude-sonnet-v2:0:18k` could be mis-stripped if the algorithm is a naive last-segment strip rather than known-suffix matching — or handled correctly if the algorithm matches only known thinking suffixes. The spec's falsifiability is compromised because OLA10(b) and OLA11 don't test the strip algorithm against a model ID containing a non-thinking colon (only `:high`/`:low` which are unambiguously thinking suffixes).
- fix: Define the stripping rule normatively in §2. E.g.: `A :thinking suffix is a trailing segment matching one of {off, minimal, low, medium, high, xhigh, max} after the last colon. No other colon-separated suffix is stripped.` Optionally add a scenario testing `:thinking` stripping against a model ID containing a non-thinking colon.

### Plan rev 3 `full` = "today, unchanged" parenthetical is contradicted by the spec's own floor

- severity: low
- confidence: high
- location: plan §2 (scope item 3), `docs/plans/2026-07-14-opt-in-lifecycle.md:123-125`
- defect: The plan rev 3 delta added a parenthetical qualifying `full` = "today, unchanged (design + PR panels of 2 distinct models)." Today's shipped v1 has no lifecycle block; the dogfood repo's `pr_review.min_panel` is 3 with vendor dedupe. The `full` profile's `pr_review.minPanel` is 2 with model-identity dedupe. This is neither "today" nor "unchanged" — the profile is one model smaller and uses a different diversity rule.
- evidence: `.pi/sdlc/sdlc.models.json:17`: `"min_panel": 3` for `pr_review`. Spec §3 `full` row: `gates.pr_review.minPanel: 2`. Spec §3 floor agreement section honestly acknowledges the divergence (`this repo's pr_review: 3`). The plan's "unchanged" claim contradicts its own spec.
- impact: A reader relying on the plan rather than the spec could believe `full` reproduces today's behaviour byte-for-byte, which is false on both floor count and dedupe semantics. The spec is honest; the plan's parenthetical introduced in the delta overclaims.
- fix: Replace "today, unchanged" with "2 distinct model panels on design + PR gates" (drop the "unchanged" claim), or explicitly note the reduction from today's dogfood `min_panel: 3`.

### Dedupe description says "most-preferred entry wins"; selection says "first credentialed entry" — mild tension

- severity: low
- confidence: medium
- location: spec §4.2 selection algorithm, `docs/specs/2026-07-14-opt-in-lifecycle-config.md:199-208`
- defect: The dedupe sentence says `the most-preferred entry wins and carries its :thinking suffix into execution`, implying position-in-prefer-list determines the winner regardless of credentials. The selection sentence says `walk the phase's prefer list in order, taking the first credentialed entry of each not-yet-selected model identity`, which correctly ties credential availability to the outcome. When the most-preferred entry for a model identity lacks credentials but a less-preferred entry has them, the dedupe description says "most-preferred wins" (which can't execute because it has no creds) while the selection algorithm correctly picks the first credentialed entry. The selection algorithm's text is unambiguous and correct; the dedupe description is slightly misleading.
- evidence: Spec §4.2: `candidates are deduped to one entry per model identity (§2; the most-preferred entry wins and carries its :thinking suffix into execution)` vs `Selection is deterministic: walk the phase's prefer list in order, taking the first credentialed entry of each not-yet-selected model identity`. OLA10(b) tests the case where both entries have credentials — the tension is not falsified by any scenario.
- impact: An implementer who reads only the dedupe sentence could code "pick the first prefer-list entry by identity regardless of credentials, then fail if uncredentialed" — contradicting the selection algorithm. In practice the two sentences are adjacent and the selection algorithm dominates, so the risk is low.
- fix: Change dedupe sentence to `candidates are deduped to one entry per model identity (§2; the first credentialed entry in prefer-order wins and carries its :thinking suffix into execution)`.

### CLEAR: A — Frozen shapes vs the plan's locked decisions. The `lifecycle` block vocabulary is fully specified; no missing fields that cannot be backfilled; no over-committed fields. The kernel-protecting absences (no merge gate, no scenarios key, no checks off-switch, `defaultTrack` cannot be `none`) are explicit and enforced by the closed vocabulary.

### CLEAR: B — Verification scenarios, except the `1/1`/`floors` text in OLA12 noted above. OLA5 correctly tests `minVendors` as an unknown key. OLA10(a)–(d) covers all four dedupe/identity claims (single-vendor-two-models, effort-variant dedupe, credential-shortfall failure, version strictness). OLA11 covers author-model exclusion, suffix stripping on `--author`, bare-vendor usage failure on lifecycle path, and v1-path byte-identical behaviour. The v1-path byte-identity for bare-vendor `--author` is testable (compare output to shipped v1). The dedupe-keep-most-preferred-effort rule is tested by OLA10(b).

### CLEAR: C — Contracts and interfaces, except the `:thinking` suffix ambiguity noted above. Every surface is buildable: `decomposeGateMode` is a total function over the four-value enum; `inspectConfig` extension is additive to the existing ordered-collector; `resolve-panel` config read is raw/non-fatal with pinned fallback; `setup-sdlc` profile interview has explicit exit contracts for all flag combinations. The `--author` `provider/model` vs bare-vendor detection is implementable (PM_RE matches contain `/`).

### CLEAR: D — Internal contradictions, other than the plan "unchanged" overstatement noted above. Spec §2 identity rule and §4.2 selection are consistent. Profile matrix values in §3 match the plan's scope item 3 description (`solo` minPanel 1, `standard`/`full` minPanel 2). Author exclusion activation (`minPanel >= 2`) and deactivation (`minPanel: 1`) are stated consistently in both §§4.2 and OLA11. The supersede notice format was correctly updated to remove the vendor value.

### CLEAR: E — Framework reality. The current `resolve-panel.mjs` (`skills/sdlc/scripts/resolve-panel.mjs`) uses a `vendor()` function and `seenVendors` Set for dedupe — the spec's new model-identity dedupe requires a complete rewrite of lines 85–117, which is correctly scoped. The `lib.mjs` `readConfig` is fatal on invalid configs (`fail()`), so the spec's raw/non-fatal read (`resolve-panel` gains a raw read) requires a different code path (e.g., `JSON.parse` + conditional `inspectConfig`), which is adequately described. The `PM_RE` regex (`/^[^/]+\/.+$/`) correctly distinguishes `provider/model` from bare vendor.

### CLEAR: F — Non-functional requirements. NF-1 domain is precisely specified (three-part: inspectConfig without block, resolve-panel without block, setup non-interactive without `--profile`). NF-2 (closed vocabulary) is enforced by `additionalProperties: false` throughout. NF-3 (determinism) is stated for both preset expansion and panel selection. No new non-functional requirements were introduced by the delta.

### CLEAR: G — Honesty sweep. The spec's "any vendor mix" parenthetical in §3 (`minPanel 2 — two distinct models, any vendor mix`) is honest: same-vendor models satisfy the floor. The spec's OLA10(a) explicitly states the model-identity floor makes the single-key-developer case possible, which is an honest admission of the trade-off. The plan's "unchanged" overstatement is noted as a separate low-severity finding.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Delta-only review of the vendor→model-identity amendment across spec rev 3 (bd19bf8) and plan rev 3. Findings restricted to defects introduced or left uncorrected by the delta; no re-litigation of adjudicated rev 2 panel findings."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "All findings cite file:line from the spec (docs/specs/2026-07-14-opt-in-lifecycle-config.md), plan (docs/plans/2026-07-14-opt-in-lifecycle.md), current code (skills/sdlc/scripts/resolve-panel.mjs, skills/sdlc/scripts/lib.mjs, skills/sdlc/schema/sdlc.models.example.json, .pi/sdlc/sdlc.models.json), and git diff evidence (git diff 01d8dcd..bd19bf8). Each finding includes a concrete one-sentence fix."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-opt-in-lifecycle && git diff 01d8dcd..bd19bf8",
      "result": "passed",
      "summary": "Full delta diff reviewed — touches docs/plans/2026-07-14-opt-in-lifecycle.md and docs/specs/2026-07-14-opt-in-lifecycle-config.md"
    },
    {
      "command": "grep -n '1/1\\|minVendors\\|floors are fixed' docs/specs/2026-07-14-opt-in-lifecycle-config.md",
      "result": "passed",
      "summary": "Confirmed OLA12 surviving vendor-era 1/1 notation at line 348"
    },
    {
      "command": "grep -n 'thinking.*suffix' docs/specs/2026-07-14-opt-in-lifecycle-config.md docs/plans/2026-07-14-opt-in-lifecycle.md",
      "result": "passed",
      "summary": "Confirmed :thinking suffix referenced but never enumerated in normative spec/plan"
    },
    {
      "command": "read skills/sdlc/scripts/resolve-panel.mjs lines 85-117",
      "result": "passed",
      "summary": "Verified current dedupe is vendor-keyed (seenVendors Set, vendor() function); rewrite to model-identity dedupe required"
    },
    {
      "command": "read skills/sdlc/schema/sdlc.models.example.json",
      "result": "passed",
      "summary": "Confirmed $comment contains thinking-suffix enumeration and Bedrock colon warning — non-normative location"
    }
  ],
  "validationOutput": [
    "OLA12 line 348: 'floors are fixed 1/1' — vendor-era notation, should be 'fixed floor 1 model'",
    "Spec §2 identity rule: ':thinking' suffix stripping not algorithmically defined; example file $comment is non-normative",
    "Plan §2 scope item 3: 'full = today, unchanged (design + PR panels of 2 distinct models)' contradicts dogfood pr_review.min_panel:3",
    "Spec §4.2 dedupe vs selection: mild wording tension between 'most-preferred entry wins' and 'first credentialed entry', resolved by selection text",
    "All other attack surfaces A–G: CLEAR"
  ],
  "residualRisks": [
    "OLA12 1/1 notation: low risk (implementer will read §4.2 which correctly says 'fixed floor 1 model')",
    ":thinking ambiguity: medium risk (two implementers could arrive at different strip algorithms for Bedrock-style model IDs with non-thinking colons)",
    "Plan 'unchanged' overstatement: low risk (spec §3 honestly documents the divergence; the plan is non-normative per its own 'Spec is canonical' convention)"
  ],
  "noStagedFiles": true,
  "diffSummary": "Rev 3 delta (01d8dcd→bd19bf8): panel diversity floor moved from vendor to model identity. vendor dropped from lifecycle vocabulary entirely. minPanel is the single floor (distinct models). Identity = provider/model with :thinking suffix stripped (version-strict). Author exclusion is author-model (bare vendor = usage failure on lifecycle path). Profile matrix floors re-ratified (solo minPanel 1, standard/full minPanel 2). Spec: 141 lines changed. Plan: 43 lines changed.",
  "reviewFindings": [
    "medium: spec §6 OLA12 — '1/1' vendor-era notation and plural 'floors' survived the delta; §4.2 correctly says 'fixed floor 1 model'",
    "medium: spec §2 identity rule — ':thinking' suffix stripping algorithm undefined in normative text; enumeration only in example-file $comment",
    "low: plan §2 scope item 3 — 'full = today, unchanged' parenthetical contradicts dogfood pr_review min_panel:3",
    "low: spec §4.2 — dedupe 'most-preferred entry wins' vs selection 'first credentialed entry' wording tension"
  ],
  "manualNotes": "The delta is substantially clean. The two medium findings (OLA12 1/1 notation and :thinking suffix undefined) are spec-text hygiene issues — the intent is clear from context and the normative §4.2 text. The plan's 'unchanged' overstatement is cosmetic (the spec is honest). No high-severity defect found. Recommend accepting rev 3 with the two medium findings addressed (one-word changes each)."
}
```
