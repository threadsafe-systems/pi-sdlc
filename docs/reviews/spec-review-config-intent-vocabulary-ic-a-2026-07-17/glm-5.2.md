# Spec review — IC-A config intent vocabulary (rev 1)

- Artifact: `docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md` (rev 1, working tree)
- Repo HEAD: `63ef0d6`; track irreversible; reviewer glm-5.2
- Every framework claim below is grounded at file:line in the current code.

---

### 1. ICA12 / DoD-4 "identical panels" is false for the repo's own config — the block-absent vendor path and the v3 single path have incompatible loop + exclusion semantics, and R2 does not guard it

- severity: high
- confidence: high
- location: spec §10 ICA12, §4.4; plan DoD 4; `resolve-panel.mjs`
- defect: The repo's config has no `lifecycle` block, so today it resolves via
  `resolveVendor()` (`resolve-panel.mjs:296`). That path (a) does **not** break at
  the floor — its prefer loop pushes every distinct-vendor, credentialed,
  non-author model (`resolve-panel.mjs:192`, no `break`; the only break at
  `:200` is inside the preference-shortfall readmission sub-loop) — and (b)
  excludes the author by **vendor** (`resolve-panel.mjs:165,174`,
  `v === authorVendor`). v3 collapses to the `resolveLifecycle()` path, which
  (a) breaks at floor (`resolve-panel.mjs:271-272`) and (b) excludes by
  **model-identity** (`resolve-panel.mjs:246,253`). Recomputing the repo's
  roster from `.pi/sdlc/sdlc.config.json` (authorDefault
  `anthropic/claude-opus-4-8:high`):
  - `plan_review` (floor 2): v2 = {sol, glm, deepseek} (3, no break); v3 =
    {sol, glm} (2, breaks). Different size.
  - `spec_review` (floor 2): v2 = {luna, glm, deepseek} (3); v3 = {luna, glm} (2).
  - `pr_review` (floor 3): v2 = {sol, gemini, deepseek} — `claude-fable-5` is
    dropped as author-vendor (`anthropic`); v3 = {fable, sol, gemini} —
    `claude-fable-5` is **kept** (identity `claude-fable-5` ≠ author's
    `claude-opus-4-8`). Different composition; the agent dispatches to a
    different model set.
  - `task_validate` (floor 1): v2 = {terra, haiku, flash, glm} (4, no break);
    v3 = {terra} (1, breaks).
  R2 only refuses when *two prefer-list entries* share a vendor but differ in
  model identity (spec §5). The repo's `pr_review.prefer` has four distinct
  vendors, so R2 does not fire — yet the panel still changes because the
  divergence is author-vs-prefer, not prefer-internal. So ICA12 ("identical
  panels for all four phases") cannot pass, and plan DoD 4's "identical
  resolve-panel outcomes" is false for the first migration fixture.
- evidence: `resolve-panel.mjs:165,174,192` (vendor path: vendor exclusion, no
  break); `:246,253,271-272` (lifecycle path: model exclusion, break at floor);
  `:296-297` (branch selection on `lifecycle === null`); `.pi/sdlc/sdlc.config.json`
  pr_review.prefer contains `anthropic/claude-fable-5:high` with authorDefault
  `anthropic/claude-opus-4-8:high`; spec §5 R2 text ("if any phase's prefer list
  contains two entries …").
- impact: The change's central non-regression guarantee is unfalsifiable as
  written; the repo's own PR panel composition silently changes on migration;
  §4.4's "candidate loop … preserved" is unsatisfiable because v2 has two
  incompatible loops and v3 keeps one.
- fix: Add a refusal (R4) that fires block-absent whenever the author's vendor is
  shared by any prefer entry whose model identity differs from the author's (the
  exact `pr_review` case), OR disclose the panel-size/composition deltas as named
  deviations alongside the spec_review one and rewrite ICA12 to assert the
  disclosed deltas (and specify whether the v3 loop breaks at floor).

### 2. Undisclosed behaviour change: v2 block-absent ignores gate modes entirely, so v3's synthesised `overrides.reversible.review.design: "human"` newly REFUSES reversible plan/spec panels the repo resolves today

- severity: high
- confidence: high
- location: spec §5 step 3 (absent-block synthesis), §4.3, §4.2; plan DoD 4; `resolve-panel.mjs`
- defect: `resolveVendor()` never consults any gate mode — it unconditionally
  builds a panel from `prefer` (`resolve-panel.mjs:163-204`, no `decomposeGateMode`
  call), and block-absent rejects `--track` outright (`resolve-panel.mjs:71`).
  So today the repo resolves a plan/spec panel for **every** track with no
  mode check (this very spec's reversible-track plan review was a 2-model
  panel). v3's §5 absent-block synthesis writes
  `overrides.reversible.review.design := "human"`, and §4.3 then refuses
  plan_review/spec_review on the reversible track ("effective … is human or
  off → no panel to resolve"). That is a second behaviour divergence of the
  same class as the one DoD 4 *does* disclose (merged-shape spec_review), but
  it is not disclosed and ICA12 asserts no divergence. The synthesis also
  misrepresents the v2 meaning: a block-absent config had no track/mode
  semantics at all, so "reversible design = human" is invented, not preserved
  (plan scope item 1 promises "the explicit equivalent of whatever the v2
  config meant").
- evidence: `resolve-panel.mjs:71` (`lifecycle === null && trackSeen` → reject
  `--track`); `:163-204` (resolveVendor has no mode/refusal branch);
  `:216-218` (`defaultGateMode` reversible → `"human"`, the value the synthesis
  hard-codes); spec §5 step 3 absent-block row
  (`overrides.reversible.review.design: human`); spec §4.3 first bullet; plan
  DoD 4 (only the spec_review deviation is disclosed).
- impact: The repo's active reversible plan/spec review workflow stops
  resolving panels after migration; the spec/plan claim of outcome-equivalence
  is false; §4.2's "`--track` required whenever overrides present" is itself a
  contract change (today block-absent *rejects* `--track`).
- fix: Disclose this as a named deviation in DoD 4 / ICA12 with its own paired
  fixture asserting the refusal, or drop `overrides.reversible.review.design`
  from the absent-block synthesis (synthesise `panel`, matching the vendor
  path's actual behaviour) and let adopters opt into the iron-law fast path
  explicitly.

### 3. ICA7's "three presets round-trip" is false for solo/standard on the `evidence` bit

- severity: medium
- confidence: high
- location: spec §10 ICA7, §6 presets, §5 step 2; `setup-sdlc.mjs`
- defect: Every v2 preset write produces a non-null `lifecycle` block
  (`setup-sdlc.mjs` `assembleConfig` → `lifecycleFromOptions` returns
  `structuredClone(LIFECYCLE_PRESETS[profile])` for solo/standard/full), so
  migration sets `evidence := (L !== null) = true` for all three (spec §5
  step 2). But the v3 preset bundles in §6 set `evidence: false` for solo and
  standard. So a v2 solo/standard config folds to `evidence: true` while the
  v3 solo/standard bundle is `evidence: false` — the round-trip ICA7 asserts
  ("the three v2 preset expansions all fold onto their v3 bundles") fails for
  two of the three presets on a key the scenario itself makes load-bearing
  (it checks `evidence: true` for the full fold).
- evidence: `setup-sdlc.mjs` `LIFECYCLE_PRESETS` (solo/standard/full all carry
  full lifecycle structure) and `assembleConfig`/`lifecycleFromOptions`
  (lifecycle always written for a preset); spec §5 step 2
  (`evidence := (L !== null)`); spec §6 (`solo`/`standard` … `evidence false`).
- impact: A falsifiable scenario that asserts an untrue equivalence; hides a
  real tension between migration-derived evidence (block presence) and
  preset-intent evidence.
- fix: Either set all three v3 presets' `evidence` to `true` (matching the
  fact that presets always wrote a lifecycle block), or rewrite ICA7 to
  exclude `evidence` from the round-trip assertion and state why (migration
  vs fresh-write semantics differ for that key).

### 4. Preset patch silently replaces the whole `overrides` block, dropping consumer-authored per-track dials

- severity: medium
- confidence: high
- location: spec §6 "Preset patch"
- defect: §6 says the patch "replaces only `review`, `shape`, `overrides`". The
  `solo` and `standard` bundles carry **no** `overrides`, and `full` carries
  only `{reversible:{review:{design:"human"}}}`. "Replaces overrides" therefore
  deletes any existing per-track dials (e.g. a consumer's
  `overrides.irreversible.review.code` or a raised
  `overrides.reversible.review.panelSize`) on every `--preset` patch. This is
  not disclosed and contrasts with the byte-preservation promise for the other
  blocks; nothing in §10 gates it.
- evidence: spec §6 preset values (solo/standard have no `overrides`; full has
  one dial) and "replaces only review, shape, overrides"; no scenario asserts
  override preservation.
- impact: Consumer-owned per-track tuning is lost on a preset patch with no
  warning — an irreversible data-loss surprise on a track-irreversible change.
- fix: Either deep-merge `overrides` (preset dials override, consumer dials
  not named by the preset survive) and add an ICA scenario asserting survival,
  or disclose the wholesale replacement and require `--force` for it.

### 5. R3 over-refuses: it fires on `excludeAuthorVendor: false` even when no phase has floor ≥ 2 (a dead opt-out)

- severity: medium
- confidence: high
- location: spec §5 R3; `resolve-panel.mjs:165`
- defect: R3 refuses any block-absent config with
  `panels.rules.excludeAuthorVendor === false`, framed as guarding a "live
  opt-out". But the opt-out is only *live* when author exclusion would
  otherwise engage, i.e. some phase has `minVendor ≥ 2`
  (`resolve-panel.mjs:165`: `excludeAuthor = rules?.excludeAuthorVendor !== false
  && floor >= 2`). A block-absent config with `excludeAuthorVendor: false` and
  every `minVendor: 1` has author exclusion off regardless, so deleting the
  key is behaviour-equivalent — yet R3 still refuses. The refusal condition is
  broader than the "live opt-out" rationale.
- evidence: `resolve-panel.mjs:165` (the `&& floor >= 2` gate); spec §5 R3
  ("block-absent with `panels.rules.excludeAuthorVendor === false` → refuse …
  live opt-out").
- impact: Valid, safely-migratable block-absent configs are refused; the
  spec's stated semantics ("live opt-out") do not match its actual condition.
- fix: Gate R3 on "block-absent AND `excludeAuthorVendor === false` AND at
  least one phase has `minVendor ≥ 2`", matching the `floor >= 2` liveness
  condition at `resolve-panel.mjs:165`.

### 6. Contract gaps in `--override` / `--preset` validation (exit codes, dial value types, `custom` disposition) that Build must invent

- severity: medium
- confidence: high
- location: spec §6
- defect: §6 introduces `--override <track>:<dial>:<value>` and an enum-closed
  `--preset solo|standard|full` but leaves undefined: (a) the exit code and
  message for a malformed `--override` or a `<dial>` outside
  `{design,code,tasks,panelSize}` (§2.4 forbids per-track `brainstorm`/`onShortfall`
  but §6 doesn't say the flag rejects them); (b) value-type validation per dial
  (`panelSize` integer vs mode-string); (c) the disposition of `--preset custom`,
  which today is accepted (`setup-sdlc.mjs` parseArgs allows `custom`) but which
  the plan retires ("custom disappears as a word") and §6's enum omits without
  listing it among the retired flags. Each is a decision Build would have to
  guess.
- evidence: spec §6 ("repeatable `--override <track>:<dial>:<value>`", retired
  flags list omits `custom`); §2.4 (per-track dial closed subset);
  `setup-sdlc.mjs` parseArgs (`new Set(["solo","standard","full","custom"])`).
- impact: Under-specified CLI contract on an irreversible-track surface;
  implementer guesses propagate into frozen message text and exit codes.
- fix: Specify the `--override` error cases + exit code (mirror the retired-flag
  pattern), the per-dial value validation, and add `--preset custom` to the
  retired-flags list with its successor ("not choosing a preset").

### 7. §4.3 refusal ordering is unspecified when "no panel to resolve" and "no spec gate" both apply

- severity: low
- confidence: high
- location: spec §4.3
- defect: §4.3 lists the gate refusals as un-ordered bullets. For
  `shape.separateSpec === false` AND `review.design` resolving to `human`/`off`,
  both the first bullet ("effective … human or off → no panel to resolve") and
  the third ("spec_review and separateSpec false → no spec gate") match a
  `spec_review` call. Which message/exit fires is undefined; the two messages
  name different root causes.
- evidence: spec §4.3 (three bullets, no precedence stated).
- impact: Non-deterministic-by-spec diagnostic on a refusal path; a test
  asserting one message could pass while the other fires.
- fix: State the precedence (e.g. separateSpec refusal is checked before the
  mode refusal for `spec_review`) in §4.3.

---

CLEAR: A — the v3 top-level/key shape (§2) covers every plan-required key and the closed-vocabulary kernel probes (§2.6) match the plan's C6 invariants; the defects above are behavioural/verification, not missing frozen fields.
CLEAR: F — NFRs (§9) state no-new-deps, deterministic issue order, preserved exit codes, and the `BREAKING CHANGE:` footer discipline; none are tied to an unverifiable outcome.
