# Specification: IC-A — the intent-vocabulary break (schemaVersion 3)

- Date: 2026-07-17 (rev 3)
- Revision history: rev 1 pre-panel draft. rev 2 incorporated all 9
  consolidated spec-panel findings
  (`docs/reviews/spec-review-config-intent-vocabulary-ic-a-2026-07-17/consolidated.md`).
  **rev 3 follows plan rev 5's clean-break decision: the v2→v3 migration is
  removed** — the former §5/§5a (fold algorithm, refusal rows, frozen
  `vendor()`, disclosure notes), the `evidence` key, and the floor-only
  panels relaxation are deleted; scenario ids ICA6/ICA7/ICA12 are
  redefined, ICA8–ICA11 and ICA25 are retired (never reused). Spec-panel
  findings S1–S6 are moot with their dispositions preserved in the review
  artifact; S7–S9 remain incorporated.
- Sub-change: IC-A of `docs/plans/2026-07-17-config-intent-vocabulary.md`
  (rev 5); track **irreversible**
- Upstream: plan rev 5; consolidated plan + spec reviews under
  `docs/reviews/`; ADRs 0021/0022; OL plan rev 3 (as amended by the plan's
  binding section)
- Scenario ids: `ICA<n>` (stable; the floor, not the ceiling, for tests)

## 1. Surface area

| Surface | Change |
|---|---|
| `skills/sdlc/scripts/lib.mjs` | `CONFIG_SCHEMA_VERSION = 3`; `inspectConfig` validates the v3 shape; v2 `lifecycle`/`enforcement` collectors removed; schema-older/newer remedy strings reworded (§5); `decomposeGateMode` unchanged |
| `skills/sdlc/scripts/migrate.mjs` | **deleted** (with its tests); no migration surface exists |
| `skills/sdlc/scripts/resolve-panel.mjs` | single model-identity resolution path; `resolveVendor()` and the `vendor()` heuristic deleted; v3 dial/floor sourcing (§4) |
| `skills/sdlc/scripts/setup-sdlc.mjs` | `--preset` + per-dial flags; retired-flag errors; preset patch on existing v3 config; migration plumbing (`migrateConfig`, `readConfigRawForMigration` call sites, residue cleanup, `MIGRATE_FIRST`) removed; interview re-vocabularied (reduction itself is IC-B) |
| `skills/sdlc/scripts/check-lifecycle.mjs` | no direct change — v3 flows through `inspectConfig` on the existing `config.valid` ride; check ids, exits, declaration grammar byte-identical |
| `skills/sdlc/scripts/sdlc-status.mjs` | no direct change — `config.valid` / `config.schema-current` ride `lib.mjs` |
| `skills/sdlc/schema/sdlc.config.schema.json` + `sdlc.config.example.json` | rewritten for v3 in lockstep with the hand-rolled validator |
| `skills/sdlc/SKILL.md` | minimal prose re-pointing only (§6) |
| `.pi/sdlc/sdlc.config.json` (this repo) | **hand-authored v3 config**, committed in the same PR (values are the owner's implement-phase call; plan DoD 4) |
| `docs/adr/` | v3 ADR; pre-adoption clean-break policy ADR; ADR 0022 revision; OL plan rev-4 amendment note |

Out of IC-A (owned by IC-B): `CONFIG.md` generator, drift check,
`templates/setup-sdlc.md` rewrite, interview reduction to two questions.

## 2. The v3 config contract (normative)

Top-level keys — closed set:
`schemaVersion, prefix, labelPrefix, announce, paths, tracker, hooks,
review, shape, overrides, panels`. Any other key is an issue — including
`lifecycle`, `enforcement`, and `evidence` (reserved for OL-B's additive
introduction; its presence in v3.0 is an unknown-key error by closure, no
special case needed).

Required: `schemaVersion` (const 3), `prefix`, `labelPrefix`, `announce`,
`review`, `shape`. Optional: `paths`, `tracker`, `hooks` (unchanged v2
semantics and validation), `overrides`, `panels` (presence remains a
readiness concern per FS8, not structural validity).

### 2.1 `review` (required; all six keys required — always explicit)

| Key | Type | Meaning |
|---|---|---|
| `brainstorm` | `"human" \| "off"` | whether brainstorm has a human gate |
| `design` | `"panel" \| "advisory" \| "human" \| "off"` | the plan and spec gate mode |
| `code` | `"panel" \| "advisory" \| "human" \| "off"` | the PR gate mode |
| `tasks` | `"subagent" \| "self" \| "off"` | per-task validation mode |
| `panelSize` | integer ≥ 1 | default distinct-model floor for review gates |
| `onShortfall` | `"proceed" \| "fail"` | panel-shortfall posture (ADR 0022 semantics, renamed) |

### 2.2 `shape` (required; all three keys required)

| Key | Type | Meaning |
|---|---|---|
| `separateSpec` | boolean | `true` = distinct Spec phase + gate; `false` = merged plan+spec |
| `publishToTracker` | integer ≥ 1 or `"never"` | build-task count at/above which the tracker publish step fires |
| `defaultTrack` | `"irreversible" \| "reversible"` | when-in-doubt track (never `none` — enum-closed) |

### 2.3 `overrides` (optional)

Keys: exactly `irreversible` and/or `reversible` (closed — `none` or any
other key is an issue), at least one when present. Each value:
`{ "review": { ... } }` with `review` required, non-empty, and its keys a
closed subset of `design`, `code`, `tasks`, `panelSize` (same types as
§2.1). `brainstorm` and `onShortfall` are not per-track (issue if present).

### 2.4 `panels` (optional; roster + floors)

Keys: `$comment`, `authorDefault` (provider/model), `phases` (required when
`panels` present). `rules` is **gone** (unknown-key issue).
`phases` requires all four phase keys (`plan_review`, `spec_review`,
`pr_review`, `task_validate`); each is
`{ "prefer": [provider/model[:thinking], ...] (required, non-empty),
"panelSize": integer ≥ 1 (optional per-phase floor override) }`.
`minVendor` is **gone** (unknown-key issue). (rev 3: the rev-2 floor-only
relaxation is reverted — it existed solely for migrating roster-less v2
configs.)

### 2.5 Validator

Hand-rolled in `lib.mjs` (`inspectConfig`), deterministic issue order,
non-exiting collector semantics preserved; the JSON Schema file is the
documentation twin updated in lockstep. Kernel probes are structural:
unknown keys anywhere (e.g. a `review.merge` key, `overrides.none`,
`shape.defaultTrack: "none"`) produce issues → `config.valid` error →
exit 2 in the consuming checkers.

## 3. Effective-value resolution (normative, shared vocabulary)

- `dialFor(phase)`: `plan_review → design`, `spec_review → design`,
  `pr_review → code`, `task_validate → tasks`.
- `effective(dial, track) = overrides?.[track]?.review?.[dial] ?? review[dial]`.
- `floor(phase, track)`:
  `panels.phases[phase].panelSize ??
  (phase === "task_validate" ? 1 : (overrides?.[track]?.review?.panelSize ?? review.panelSize))`
  — the fixed-1 `task_validate` default preserves the OL-A rule
  (`resolve-panel.mjs:233-237`); a per-phase `panelSize` may raise it.
- Author exclusion: model-identity axis, active iff the resolved floor ≥ 2
  (OL-A rule, unchanged); `modelIdentity()` (thinking-suffix-stripped,
  version-strict) is the only identity function; no vendor heuristic exists
  anywhere in the runtime.

## 4. `resolve-panel` v3 behaviour (normative)

1. Single resolution path: the OL-A candidate loop (break at floor,
   model-identity dedupe — `resolve-panel.mjs:251-273` semantics) is the
   only loop; the v2 `lifecycle === null` branch, `resolveVendor()`, and
   the "minVendor superseded" note are deleted.
2. `--track`: accepted always (validated `irreversible|reversible`);
   **required** whenever the config has an `overrides` block; invalid value
   errors keep exit 1.
3. Gate refusals (exit 1, message names the committed dial), checked in
   this **order** (S9): (1) for `spec_review`,
   `shape.separateSpec === false` → refuse: the committed shape has no spec
   gate; (2) for `task_validate`, `effective(tasks) === "off"` → task
   validation off; (3) `effective(dialFor(phase), track)` is `human` or
   `off` → "no panel to resolve" (via `decomposeGateMode`, unchanged).
4. Floors and dedupe per §3; credential checks, `--pong`, `--emit-tasks`,
   stderr report format preserved from the OL-A loop.
5. `onShortfall`: `proceed` keeps v2 `preference` semantics (advisory +
   author-model readmission, exit 0 when a panel forms), `fail` keeps v2
   `strict` semantics (exit 1 below floor). Message text says
   `onShortfall is 'proceed'` in place of `enforcement is 'preference'`;
   structure otherwise unchanged.

## 5. The clean break (normative; plan scope item 3)

1. `migrate.mjs` and every migration entry point are deleted. No code path
   reads or rewrites a v1/v2 config.
2. `classifyConfigVersion` stays (it powers honest diagnostics). The
   remedy strings are reworded to name only paths that exist:
   - older: `config schemaVersion <n> predates this skill (requires 3) —
     re-run setup-sdlc to write a fresh v3 config (--force to replace), or
     pin the pi-sdlc release that wrote it; no migration path exists
     pre-adoption`
   - newer: unchanged in meaning (upgrade or run the pinned release).
   Exact final wording is Build's call; naming a migration is forbidden
   (FS11 honesty; plan DoD 3).
3. Setup against an existing older-schema config: any invocation refuses
   with the reworded remedy (asset action `refused`); `--force` replaces
   wholesale (existing semantics). `sdlc-status` reports not-ready via the
   existing `config.schema-current` check with the same honest remedy.
4. This repo's v3 config is hand-authored and committed in the same PR;
   its dial values are the owner's implement-phase decision, and the PR
   body records in one line the acceptance of OL-A panel semantics
   (floor-capped panels; model-identity author exclusion).

## 6. `setup-sdlc` v3 behaviour (normative)

- **New flags:** `--preset solo|standard|full`; per-dial
  `--review-brainstorm`, `--review-design`, `--review-code`,
  `--review-tasks`, `--panel-size N`, `--on-shortfall proceed|fail`,
  `--separate-spec true|false`, `--publish-to-tracker N|never`,
  `--default-track irreversible|reversible`, repeatable
  `--override <track>:<dial>:<value>`. Every dial reachable
  non-interactively.
- **Retired flags** (hard error naming the successor): `--profile` →
  `--preset`; `--lifecycle-json` → per-dial flags; `--enforcement` →
  `--on-shortfall`; `--preset custom` → "omit --preset and set dials via
  flags". (Pattern: the existing `--with-models` retirement message,
  `setup-sdlc.mjs:37`.)
- **`--override` validation (S8):** `<track>` must be
  `irreversible|reversible`, `<dial>` one of
  `design|code|tasks|panelSize` (per-track `brainstorm`/`onShortfall`
  rejected exactly as §2.3 rejects them structurally), and the value must
  satisfy the dial's §2.1 type. Violations are `SetupError` exit 2 with the
  offending flag text, mirroring the existing malformed-flag pattern
  (`setup-sdlc.mjs:82-84`).
- **Presets are answer bundles** (never persisted; #37 matrix re-expressed;
  no `evidence` key exists in v3 — rev 3):
  - `solo`: brainstorm `off`, design `human`, code `advisory`, tasks
    `self`, panelSize 1, onShortfall `proceed`; separateSpec `false`,
    publishToTracker `"never"`, defaultTrack `irreversible`.
  - `standard`: brainstorm `human`, design `human`, code `panel`, tasks
    `subagent`, panelSize 2, onShortfall `proceed`; separateSpec `false`,
    publishToTracker 4, defaultTrack `irreversible`.
  - `full`: brainstorm `human`, design `panel` +
    `overrides.reversible.review.design: "human"`, code `panel`, tasks
    `subagent`, panelSize 2, onShortfall `proceed`; separateSpec `true`,
    publishToTracker 2, defaultTrack `irreversible`.
- **Fresh write:** config is fully explicit (all required blocks/keys).
- **Preset patch (plan C6; S7):** `--preset` against an existing *valid v3*
  config replaces only `review`, `shape`, `overrides`; `prefix`,
  `labelPrefix`, `announce`, `paths`, `tracker`, `hooks`, `panels` are
  byte-preserved; reported as asset action `patched`, with each replaced
  block's before→after values listed. When the patch would **delete or
  alter an existing `overrides` block** the preset does not itself carry,
  it refuses without `--force` (data-loss guard); with `--force` it
  proceeds and the report shows the dropped block. The v2 "refused profile
  application" branch (`setup-sdlc.mjs:564-570`) is deleted. Whole-file
  replacement still requires `--force` and is reported as `upgraded`,
  exactly as today.
- **Interview (IC-A scope only):** questions re-vocabularied to v3 (preset
  question replaces profile; dial questions use v3 names). The reduction to
  two teaching questions and the template rewrite are IC-B.

## 7. SKILL.md minimal prose re-pointing (normative requirements)

Surgical substitutions only — no restructure (that is OL-C):

- **P1**: the tracker-backed Build section's hardcoded thresholds ("two or
  more tasks", "A single-task build") defer to the committed
  `shape.publishToTracker` value (`"never"` = the publish step never
  fires).
- **P2**: the Panels section's `strict`/`preference` posture references
  become `review.onShortfall` `fail`/`proceed`.
- **P3**: the phase table / iron-law prose gains one sentence: the Gate
  column states the maximal shape; the committed `review.*`/`shape.*`
  dials of the repo's config are authoritative for which gates run and at
  what floor (`separateSpec: false` merges Plan and Spec into one gated
  artifact; `review.brainstorm: off` removes the brainstorm gate).
- **P4**: the when-in-doubt track sentence points at `shape.defaultTrack`.
- **P5**: no SKILL sentence may state a v2 key name (`profile`,
  `enforcement`, `minPanel`, `minVendor`, `mergePlanSpec`,
  `publishThreshold`) as current vocabulary.

## 8. Key → reader audit (plan DoD 2)

| v3 key | Reader (kind) |
|---|---|
| `schemaVersion` | `lib.mjs` `classifyConfigVersion`/`inspectConfig` (mechanical) |
| `prefix` | `ensure-panel-agent` stamped agent name (mechanical) |
| `labelPrefix` | tracker label vocabulary, SKILL/`assets/tracker-ops.md` (prose-law) |
| `announce` | SKILL announce law (prose-law) |
| `paths.*` | `check-lifecycle` artifact homes (mechanical); SKILL artifact table (prose-law) |
| `tracker.*` | SKILL tracker ops (prose-law) |
| `hooks` | SKILL hooks law (prose-law); validated mechanically |
| `review.brainstorm` | SKILL brainstorm gate via P3 (prose-law) |
| `review.design` | `resolve-panel` (mechanical); SKILL gates via P3 (prose-law) |
| `review.code` | `resolve-panel` (mechanical); SKILL PR section (prose-law) |
| `review.tasks` | `resolve-panel` `task_validate` (mechanical); SKILL validator section (prose-law) |
| `review.panelSize` | `resolve-panel` floor (mechanical) |
| `review.onShortfall` | `resolve-panel` posture (mechanical) |
| `shape.separateSpec` | `resolve-panel` spec-gate refusal (mechanical); SKILL via P3 (prose-law); checker parameterisation in OL-B |
| `shape.publishToTracker` | SKILL tracker-backed Build via P1 (prose-law) |
| `shape.defaultTrack` | SKILL when-in-doubt sentence via P4 (prose-law) |
| `overrides.*` | `resolve-panel` per-track resolution (mechanical) |
| `panels.*` | `resolve-panel` roster/floors (mechanical); FS8 readiness (mechanical) |

## 9. Non-functional requirements

- No new runtime dependencies; Node builtins only; hand-rolled validation.
- Deterministic issue order; existing error-message style and exit codes.
- `check-lifecycle`/`sdlc-status` check ids, exit sets, and the FS9
  declaration grammar byte-identical (no FS9/FS8 surface change — plan C4).
- Release: `CONFIG_SCHEMA_VERSION` bump trips the `check-schema-break` CI
  guard; the release PR carries a `BREAKING CHANGE:` footer (never `!`).
- Tests: `node --test` corpus + biome lint clean, per repo CI.

## 10. Verification scenarios (falsifiable)

Retired ids (rev 3, never reused): ICA5 (merged into ICA4), ICA8, ICA9,
ICA10, ICA11, ICA25.

Validator and kernel safety:

- **ICA1**: the updated `schema/sdlc.config.example.json` and all three
  preset expansions pass `inspectConfig` with zero issues.
- **ICA2**: each kernel probe — `overrides.none`, a `review.merge` key,
  `shape.defaultTrack: "none"`, and the retired vocabulary as top-level
  keys (`lifecycle`, `enforcement`, `evidence`) — yields ≥1 issue, and
  `check-lifecycle` on such a config reports `config.valid` error with
  exit 2.
- **ICA3**: omitting any required `review`/`shape` key, or supplying
  `overrides` with an empty/foreign track key or a per-track `brainstorm`,
  yields the named issue.
- **ICA4**: `panels.rules` or any `minVendor` in a v3 config yields
  unknown-key issues; a `panels.phases` entry without `prefer` is invalid.

The clean break:

- **ICA6** (redefined rev 3): a valid v2 config under the v3 skill:
  `sdlc-status` exits not-ready via `config.schema-current` and
  `check-lifecycle` fails `config.valid`, each with remedy text that names
  re-running setup and pinning and does **not** contain the word
  "migration" as an offered path; no invocation of any script mutates the
  file; `setup-sdlc` with config flags refuses (asset `refused`) and
  `--force` replaces wholesale.
- **ICA7** (redefined rev 3): `migrate.mjs` does not exist;
  `skills/sdlc/scripts/` contains no `FORWARD_MIGRATIONS`,
  `planMigration`, or `applyMigration` symbol; `setup-sdlc` contains no
  migration flow (the former `MIGRATE_FIRST` string is gone).

resolve-panel:

- **ICA12** (redefined rev 3): forward-only pinned fixture — a synthetic
  v3 config (roster of 4 distinct-identity models incl. one sharing the
  author's provider, `review.panelSize: 2`,
  `panels.phases.pr_review.panelSize: 3`, all providers credentialed,
  author fixed, no `--pong`) resolves the exact expected panel arrays for
  all four phases: floor-capped, model-identity deduped, author-identity
  excluded (the author's provider-mate stays), `task_validate` floored at
  1. The repo's committed config additionally resolves every
  reviewer-moded phase with exit 0 (smoke, values owner-chosen).
- **ICA13**: `--track` required when `overrides` present (error names the
  block); accepted and validated otherwise; per-track dial resolution
  follows §3 (`overrides.reversible.review.design: human` refuses a
  reversible `plan_review` panel while irreversible resolves).
- **ICA14**: `review.tasks: "off"` → `task_validate` refusal exit 1;
  `effective` mode `human`/`off` → "no panel to resolve" exit 1;
  `separateSpec: false` → `spec_review` refusal exit 1 with the
  no-spec-gate message.
- **ICA15**: floor sourcing — `panels.phases.pr_review.panelSize: 3`
  overrides `review.panelSize: 2`; `task_validate` floors at 1 absent an
  override; author exclusion active exactly when the resolved floor ≥ 2.
- **ICA16**: `onShortfall: "proceed"` below floor → advisory naming
  `onShortfall 'proceed'`, author-model readmission, exit 0 when a panel
  forms; `onShortfall: "fail"` below floor → exit 1.

setup:

- **ICA17**: `--profile`, `--lifecycle-json`, `--enforcement`, and
  `--preset custom` each fail with an error naming their successor.
- **ICA18**: `--preset standard` fresh write produces the standard bundle,
  fully explicit, `inspectConfig`-clean; per-dial flags override preset
  values; `--override reversible:design:human` lands in
  `overrides.reversible.review.design`.
- **ICA19**: `--preset` against an existing valid v3 config replaces
  exactly `review`/`shape`/`overrides` and byte-preserves every other key
  (asset action `patched`, before→after listing); when the existing config
  carries an `overrides` block the preset lacks, it refuses without
  `--force` and proceeds-with-disclosure with it (S7).
- **ICA23**: `--override` rejects an unknown track, an unknown dial,
  per-track `brainstorm`/`onShortfall`, and a type-invalid value, each as
  `SetupError` exit 2 naming the flag text (S8).
- **ICA24**: refusal precedence — a config with `separateSpec: false` AND
  `design: human` refuses `spec_review` with the no-spec-gate message, not
  the no-panel message (S9).

Prose and purge:

- **ICA20** (S9-adjusted; allowlist shrunk rev 3): syntax-aware purge —
  zero reads of the retired config vocabulary (`profile`, `minVendor`,
  `excludeAuthorVendor`, `enforcement`, `mergePlanSpec`,
  `publishThreshold`, `minPanel`) from any **runtime read path** in
  `skills/sdlc/`, with an explicit allowlist for: retired-flag spellings
  inside `setup-sdlc.mjs`'s parse/error path (the §6 diagnostics must name
  them) and test fixtures. The test enumerates the allowlist; any
  occurrence outside it fails. P5 covers SKILL.md prose separately.
- **ICA21**: SKILL.md instructs reading `shape.publishToTracker` for the
  publish decision (P1) and contains no hardcoded task-count constant for
  it; P2–P4 sentences present.

Non-regression:

- **ICA22**: `check-lifecycle` fixture set: check ids, statuses, exits, and
  declaration parsing byte-identical on a v3 repo vs today's baseline (the
  `config.valid` message text may differ only on invalid configs).

## 11. Context for Build

- Task seams: (T1) lib.mjs validator + remedy strings + schema/example
  files + migrate.mjs deletion; (T2) resolve-panel re-sourcing; (T3)
  setup-sdlc flags/presets/patch + migration-plumbing removal + interview
  re-vocabulary; (T4) SKILL re-pointing + this repo's hand-authored v3
  config + ADRs (v3, clean-break policy, ADR 0022 revision, OL rev-4
  note). T2–T4 depend on T1.
- The repo's own config must land in the same PR as the code, or
  `sdlc-status` goes not-ready on the feature branch.
- Test corpus: extend `test/` per scenario ids; delete `migrate` test
  files; existing FS9/FS10 fixtures must not change semantically (ICA22
  guards).
