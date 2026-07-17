### 1. The named migration fixture cannot preserve its panel semantics

- severity: high
- confidence: high
- location: Intent vocabulary / Migration / DoD 3–4 (lines 97–130, 226–233)
- defect: The plan deletes `minVendor` with no successor while requiring this repo’s no-`lifecycle` v2 config to migrate with identical panels and floors. That is impossible because the legacy branch deduplicates and floors by vendor, whereas the proposed always-explicit v3 shape resolves distinct models.
- evidence: The plan declares `panels.phases.*.minVendor` “deleted, no successor” and all v3 shapes explicit (`docs/plans/2026-07-17-config-intent-vocabulary.md:97-114`), then names this repo as the first fixture and demands identical panel outcomes (`docs/plans/2026-07-17-config-intent-vocabulary.md:125-130,226-233`). The fixture has no `lifecycle` block and carries vendor floors 2/2/3/1 (`.pi/sdlc/sdlc.config.json:29-50`); current resolution consequently enters `resolveVendor`, deduplicates vendors, and applies `minVendor` (`skills/sdlc/scripts/resolve-panel.mjs:163-210,296-297`), while lifecycle resolution deduplicates model identities (`skills/sdlc/scripts/resolve-panel.mjs:221-290`).
- impact: IC-A cannot satisfy its own mandatory fixture or non-regression DoD, and a roster containing two models from one provider can pass after migration when it failed before.
- fix: Add a v3 representation for legacy vendor-axis resolution or explicitly make no-`lifecycle`/`minVendor` configs refusing residues and remove the contradictory requirement that this repo migrate with preserved behaviour.

### 2. One `review.design` dial cannot encode valid independent Plan and Spec modes

- severity: high
- confidence: high
- location: Complete v2 → v3 dial mapping (lines 73–106)
- defect: Collapsing both `plan_review.mode` and `spec_review.mode` into one `review.design` value loses a valid v2 distinction between Plan and Spec review on the irreversible track; track overrides do not restore phase-specific modes.
- evidence: The proposed shape has one `review.design` and only track-keyed overrides, while per-phase overrides are promised only for `panelSize` (`docs/plans/2026-07-17-config-intent-vocabulary.md:73-92,97-106`). Current v2 independently validates both gate modes (`skills/sdlc/scripts/lib.mjs:387-437`), so `{phases:{mergePlanSpec:false}, gates:{plan_review:{mode:"panel"}, spec_review:{mode:"human"}}}` is expressible; only `mergePlanSpec:true` forbids a Spec gate (`skills/sdlc/scripts/lib.mjs:368-370`).
- impact: The binding “every v2 dial has exactly one v3 home” claim is false, and migration must silently strengthen/weaken one gate or reject an ordinary valid custom shape.
- fix: Give Plan and Spec separate mode homes (or permit phase-specific mode overrides), then add this divergent-mode fixture to the migration totality scenarios.

### 3. IC-A erases OL-B’s binding evidence opt-in before OL-B can migrate it

- severity: high
- confidence: high
- location: OL plan amendment item 2 and sequencing (lines 180–191)
- defect: The plan removes lifecycle-block presence before deciding or persisting its evidence-opt-in meaning, then lands IC-A before OL-B. Once a v2 config is migrated to always-explicit v3, OL-B cannot tell whether the source had a lifecycle block without provenance that this plan expressly forbids.
- evidence: The OL plan binds lifecycle-block presence to whether all three evidence checks are demanded (`docs/plans/2026-07-14-opt-in-lifecycle.md:59-72,163-172`). This plan makes review/shape always explicit and forbids provenance/history keys (`docs/plans/2026-07-17-config-intent-vocabulary.md:52-57,108-114`), but defers the replacement `evidence` key to OL-B Spec and sequences IC-A first (`docs/plans/2026-07-17-config-intent-vocabulary.md:180-191,197-211`).
- impact: OL-B must either impose new evidence failures on migrated legacy repos or fail to impose the obligations already accepted by shaped v2 adopters; no later migration can reconstruct the lost bit.
- fix: Decide and persist the operational evidence-opt-in value during v2→v3 migration in IC-A (or land that migration atomically with OL-B) rather than deferring it until after the source distinction is erased.

### 4. The CONFIG drift check illegally widens frozen FS9 while FS9 v2 is out of scope

- severity: high
- confidence: high
- location: Runtime re-sourcing / Self-explanation / Scope out (lines 116–121, 140–148, 204–216)
- defect: The plan requires check IDs to be appended and proposes a `check-lifecycle` ID for CONFIG drift, but explicitly leaves checker v2/OL-B out and does not require an ADR 0017 revision or FS9 migration.
- evidence: The plan says FS9 IDs are “preserved verbatim and appended” and proposes an appended lifecycle check (`docs/plans/2026-07-17-config-intent-vocabulary.md:116-121,140-148`), while excluding OL-B checker v2 (`docs/plans/2026-07-17-config-intent-vocabulary.md:204-211`). ADR 0017 freezes check IDs and requires an explicit FS9 schema-version bump and migration for any addition (`docs/adr/0017-lifecycle-checker-fs9.md:7-23`); the plan’s governance list names only the v3 ADR, ADR 0022, and OL amendment (`docs/plans/2026-07-17-config-intent-vocabulary.md:160-169`).
- impact: IC-B either breaks a frozen consumer report under schema version 1 or cannot meet its mechanical drift-detection DoD.
- fix: Bind CONFIG drift to a separate non-FS9 check command in this stream, leaving any `check-lifecycle` ID addition to OL-B’s explicit FS9 v2 migration.

### 5. Load-bearing intent dials conflict with deferring the only agent interpreter

- severity: high
- confidence: high
- location: Objective / Runtime re-sourcing / OL-C scope boundary / DoD 2 (lines 17–23, 116–121, 186–211, 223–225)
- defect: IC-A requires every v3 key to drive runtime behaviour, but defers OL-C’s config-interpreter/SKILL work even though several dials are agent law rather than behaviour of the listed scripts. In particular, `shape.publishToTracker` cannot be effective while the shipped skill still mandates publication at exactly two tasks.
- evidence: The plan requires a script-and-behaviour reader for every key (`docs/plans/2026-07-17-config-intent-vocabulary.md:17-23,223-225`) but limits re-sourcing to `resolve-panel`, `check-lifecycle`, setup, and validation and puts OL-C content out (`docs/plans/2026-07-17-config-intent-vocabulary.md:116-121,186-211`). Current code references `publishThreshold`, `defaultTrack`, and `mergePlanSpec` only in validation/setup (`skills/sdlc/scripts/lib.mjs:354-367`; `skills/sdlc/scripts/setup-sdlc.mjs:37-65,626-637`), while the operative SKILL unconditionally publishes tracker objects at two tasks (`skills/sdlc/SKILL.md:197-224`). Current `check-lifecycle` reads only configured paths and derives artifact demands directly from the declaration track (`skills/sdlc/scripts/check-lifecycle.mjs:214-225,279-317`).
- impact: v3 can ship with valid keys that do not change the lifecycle, directly violating the objective and generating CONFIG.md explanations that contradict shipped law until OL-C lands.
- fix: Bring the minimal v3 config interpreter and all dial-driven SKILL behaviour into IC-A, or defer those keys/the v3 migration until OL-B/OL-C can make them load-bearing atomically.

### 6. The OL amendment treats destructive whole-file replacement as dial application

- severity: medium
- confidence: high
- location: OL plan amendment item 1 (lines 175–179)
- defect: The amendment claims preset application is “just setting keys” governed by existing `--force` semantics, but existing setup assembles a fresh config from supplied flags/defaults and `--force` overwrites the whole file rather than patching review/shape keys.
- evidence: The claim appears at `docs/plans/2026-07-17-config-intent-vocabulary.md:175-179`. `assembleConfig` reconstructs only supplied tracker/hooks and generated lifecycle data (`skills/sdlc/scripts/setup-sdlc.mjs:111-123`), and the existing-config force path writes that reconstructed object wholesale (`skills/sdlc/scripts/setup-sdlc.mjs:555-574`). The accepted FS10 contract also describes `--force` as configuration replacement, not key merge (`docs/adr/0018-adoption-bundle-fs10.md:16-24`).
- impact: Following the amended plan can erase consumer-owned paths, tracker, hooks, and panel roster when an adopter applies a preset, the exact data-loss risk the superseded OL requirement avoided.
- fix: Specify that `--preset` patches only v3 intent blocks while preserving all other validated keys, or explicitly refuse presets on existing configs instead of presenting `--force` as dial application.

### 7. Kernel safety does not close the `overrides.none` hole

- severity: medium
- confidence: high
- location: Intent vocabulary kernel safety / Spec decisions (lines 86–114, 275–280)
- defect: The plan binds `shape.defaultTrack` to exclude `none` but leaves the override grammar open, so its structural safety statement does not actually forbid a `none` override or another lane key.
- evidence: The only proposed override example is `reversible`, but exact override grammar is deferred (`docs/plans/2026-07-17-config-intent-vocabulary.md:86-88,275-280`); the safety claim mentions only the `defaultTrack` enum (`docs/plans/2026-07-17-config-intent-vocabulary.md:108-110`). Current v2 closes per-track mode objects to `irreversible`/`reversible` (`skills/sdlc/scripts/lib.mjs:432-436`), and the OL plan explicitly keeps custom lane taxonomy and declaration widening out (`docs/plans/2026-07-14-opt-in-lifecycle.md:220-226`).
- impact: A Spec could satisfy the literal plan while introducing a configuration path for `track: none`, weakening the invariant that `none` is a declaration exemption rather than a configurable lifecycle lane.
- fix: Make it binding now that override keys are exactly `irreversible` and `reversible`, with a DoD negative fixture proving `overrides.none` fails `config.valid` with exit 2.

CLEAR: F — The plan correctly classifies the persisted schema break as irreversible and requires a package major under ADR 0021.
