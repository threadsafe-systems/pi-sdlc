# Spec: opt-in lifecycle — OL-A, config vocabulary and resolution

- Date: 2026-07-14
- Sub-change: **OL-A** of the opt-in lifecycle stream (see
  `docs/plans/2026-07-14-opt-in-lifecycle.md`, "Spec decomposition"). OL-A
  delivers the `lifecycle` config vocabulary, its validation, profile-aware
  setup, and panel-floor resolution. **No checker (`check-lifecycle`) change
  ships in OL-A** — that is OL-B. No skill-prose change ships in OL-A — that
  is OL-C.
- Track: irreversible (freezes the `lifecycle` vocabulary consumers commit to;
  FS1-additive).
- Upstream: plan rev 2 (canonical); ticket resolutions #35–#38 + amendments
  (#35, #36); research brief `research-36` (accepted 2026-07-14, on #36).

## 1. Surface area

Files changed (all under `skills/sdlc/` unless noted):

| Surface | File | Nature |
|---|---|---|
| FS1 manifest schema | `schema/sdlc.config.schema.json` | additive: `lifecycle` property + `$comment` reservation |
| FS1 validation | `scripts/lib.mjs` (`inspectConfig`) | additive: `lifecycle` inspection; existing checks byte-identical |
| Panel resolution | `scripts/resolve-panel.mjs` | floor sourcing precedence; vendor-dedupe relaxation; `task_validate` rule |
| Setup | `scripts/setup-sdlc.mjs` (+ `setup-sdlc.sh`) | profile interview/flag; preset expansion; non-destructive application |
| Tests | `test/` | new OLA fixtures; existing fixtures untouched (see §6) |

Explicitly untouched in OL-A: `check-lifecycle.mjs` (FS9 v1 as shipped),
`sdlc-status.mjs` (FS8 frozen), the FS10 report envelope (`SetupReportV1`
gains **no** new line kinds in OL-A), `sdlc.models.json` schema (FS2 —
`min_panel` remains schema-valid; it is ignored-with-notice at *runtime* when
a `lifecycle` block is present), prompts, assets.

## 2. The `lifecycle` block — normative schema

One optional top-level key in `.pi/sdlc/sdlc.config.json`. `schemaVersion`
stays `1` (FS1 is additive within a major). **Absence of the block means
every consumer surface OL-A touches behaves byte-identically to today.**

```jsonc
"lifecycle": {
  // Provenance of the setup-time choice. Informational: no validator may
  // compare dials against a preset table (profile != custom never fails
  // validation on dial values). Required key.
  "profile": "solo" | "standard" | "full" | "custom",

  "gates": {                       // optional; each gate key optional
    "brainstorm":  { "mode": "human" | "off" },
    "plan_review": {
      // GateMode = "panel" | "advisory" | "human" | "off"
      // mode: single GateMode, or per-track object with keys drawn from
      // {"irreversible","reversible"} (at least one key; no other keys).
      "mode": GateMode | { "irreversible"?: GateMode, "reversible"?: GateMode },
      "minPanel": int >= 1,        // optional; default 2
      "minVendors": int >= 1       // optional; default min(2, minPanel); must be <= minPanel
    },
    "spec_review": {
      // per-track object may carry ONLY "irreversible" (reversible has no
      // spec phase — a "reversible" key here is a validation error).
      "mode": GateMode | { "irreversible": GateMode },
      "minPanel": int >= 1, "minVendors": int >= 1
    },
    "pr_review": { "mode": GateMode, "minPanel": int >= 1, "minVendors": int >= 1 }
  },

  "phases":  { "mergePlanSpec": bool },                        // default false
  "tracker": { "publishThreshold": int >= 1 | "never" },       // default 2
  "taskValidation": { "mode": "subagent" | "self" | "off" },   // default "subagent"
  "tracks":  { "defaultTrack": "irreversible" | "reversible" } // default "irreversible"; "none" is NOT in the enum
}
```

Structural rules (all `additionalProperties: false`, everywhere):

- Unknown keys at any level are per-path issues in `inspectConfig`'s existing
  ordered-collector style (`lifecycle.gates: unknown key 'merge'`).
- Cross-field rules, emitted as ordered issues:
  1. `minVendors <= minPanel` (per gate).
  2. `phases.mergePlanSpec == true` ⇒ `gates.spec_review` must be absent.
  3. `gates.spec_review.mode` per-track object must not carry `reversible`.
  4. `gates.brainstorm.mode` ∈ {`human`,`off`} only (panel modes structurally
     inexpressible).
- The kernel-protecting absences are **normative**: there is no `merge` gate
  key, no `scenarios` key, no `checks` off-switch, and `defaultTrack` cannot
  say `none`. These are enforced by the closed vocabulary itself.

**Reviewer × arbiter modelling (plan DoD-8, #36 amendment).** The validator
and every consumer of gate modes MUST resolve a `GateMode` value through a
single total decomposition function:

| value | reviewer | arbiter | blocking |
|---|---|---|---|
| `panel` | panel | human | yes |
| `advisory` | panel | none | no |
| `human` | none | human | yes |
| `off` | none | none | no |

exported from `lib.mjs` (e.g. `decomposeGateMode(value)`), such that adding a
fifth value (the reserved panel/mechanical/blocking quadrant) is one row in
this table plus enum growth — never a remodel. `panel`'s human-approval
coupling exists **only** in this table.

**Reservation.** The shipped `schema/sdlc.config.schema.json` `lifecycle`
description carries verbatim: *"The key `automation` is reserved for future
unattended-lane policy (budget, escalation, graduation); nothing may squat on
it."* The validator rejects `lifecycle.automation` today like any unknown key
(the reservation is documentary, not a live surface).

## 3. Profile presets — normative expansion tables

Setup writes **fully-expanded dials**; no reader ever needs a preset table to
interpret a committed config. `profile` records provenance only.

| Dial | `solo` | `standard` | `full` |
|---|---|---|---|
| `gates.brainstorm.mode` | `"off"` | `"human"` | `"human"` |
| `phases.mergePlanSpec` | `true` | `true` | `false` |
| `gates.plan_review.mode` | `"human"` | `"human"` | `{"irreversible":"panel","reversible":"human"}` |
| `gates.plan_review.minPanel/minVendors` | 1 / 1 | 1 / 1 | 2 / 2 |
| `gates.spec_review` | absent | absent | `{"mode":{"irreversible":"panel"},"minPanel":2,"minVendors":2}` |
| `gates.pr_review.mode` | `"advisory"` | `"panel"` | `"panel"` |
| `gates.pr_review.minPanel/minVendors` | 1 / 1 | 2 / 2 | 2 / 2 |
| `tracker.publishThreshold` | `"never"` | `4` | `2` |
| `taskValidation.mode` | `"self"` | `"subagent"` | `"subagent"` |
| `tracks.defaultTrack` | `"irreversible"` | `"irreversible"` | `"irreversible"` |

(`solo`/`standard` plan-gate floors are 1/1: with `mode: "human"` no panel
runs, but the committed floors must still be valid and coherent if a repo
later dials the mode up.)

`custom` is **not a preset**: the interview collects every dial explicitly
(non-interactive: requires explicit `--lifecycle-*` flags or a
`--lifecycle-json` payload; refusing to guess is correct behaviour).

## 4. Behavioural contracts

### 4.1 `inspectConfig` (`lib.mjs`)

- `lifecycle` joins the allowed top-level key set. All existing checks and
  message texts are byte-identical for configs without the block.
- With the block present: full structural + cross-field validation per §2;
  issues use the existing `add(path, message)` collector, ordered, first
  issue is the exiting diagnostic downstream.
- A config whose `lifecycle` block is invalid makes the manifest invalid —
  surfaced through every existing consumer of `inspectConfig` (FS8
  `config.valid` reports it; no FS8 change needed — same check, wider
  message set).

### 4.2 `resolve-panel.mjs`

Floor sourcing precedence, per phase:

- **Review gates** (`plan_review`, `spec_review`, `pr_review`):
  - `lifecycle` present: floors come from
    `lifecycle.gates.<phase>.{minPanel,minVendors}` (defaults per §2 when the
    gate key is absent). The models file's `phases.<phase>.min_panel` is
    **ignored with a one-line stderr notice**:
    `note: min_panel in sdlc.models.json superseded by lifecycle.gates.<phase>`.
  - `lifecycle` absent: `min_panel` governs exactly as today (bit-identical
    output, including stderr).
- **Vendor dedupe relaxation:** when `minVendors < minPanel`, allow up to
  `minPanel − minVendors + 1` models from one vendor; when
  `minVendors == minPanel`, behaviour is today's one-model-per-vendor dedupe.
- **Author-vendor exclusion:** activation condition becomes
  `rules.exclude_author_vendor !== false && effectiveMinVendors >= 2`
  (today's `min_panel >= 2` at defaults ⇒ unchanged behaviour; at
  `minVendors: 1` exclusion is off — a solo panel cannot exclude the author's
  vendor and still exist).
- **`task_validate`** (not a `gates` key):
  - `lifecycle` present and `taskValidation.mode` ∈ {`subagent`,`self`}:
    fixed floor 1 model / 1 vendor; models-file `min_panel` for
    `task_validate` ignored with the same notice form.
  - `lifecycle` present and `taskValidation.mode == "off"`: `resolve-panel
    task_validate` **refuses**: exit 1, stderr
    `resolve-panel: task validation is off in the committed lifecycle shape`.
  - `lifecycle` absent: today's behaviour.
- Gate-mode awareness: `resolve-panel <review-gate>` for a gate whose
  *effective* mode (single value, or the value for the track passed via a new
  optional `--track` flag; without `--track`, the strictest configured value)
  is `human` or `off` **refuses**: exit 1, stderr
  `resolve-panel: <phase> gate mode is '<mode>' in the committed lifecycle shape — no panel to resolve`.
  (`advisory` resolves normally — the panel runs, adjudication differs.)

### 4.3 `setup-sdlc.mjs`

- New interview step (first substantive question) and `--profile
  <solo|standard|full|custom>` flag; interactive default pre-selects
  `standard`. The step's prose names the three presets in one line each and
  states the `solo` credential fact (advisory review needs ≥ 1 live model
  credential).
- Fresh adoption: the written config carries the fully-expanded `lifecycle`
  block per §3.
- **Non-destructive application to an existing valid manifest** (new): when
  the target repo already has a valid `.pi/sdlc/sdlc.config.json`, setup with
  `--profile <p>` (or the interview) **adds or replaces only the `lifecycle`
  key**, byte-preserving every other key (including formatting produced by
  re-serialisation being limited to the `lifecycle` key's addition — the
  implementation re-serialises the parsed object with 2-space indent, which
  MUST be the same serialisation the file already uses from setup). An
  *invalid* existing manifest is refused with the existing refusal semantics
  (exit 1, `refused` asset action) — never partially rewritten.
- FS10 report: the `config` asset's existing action vocabulary
  (`created|retained|upgraded|refused`) is reused — profile application to an
  existing manifest reports `upgraded`. **No new report line kinds in OL-A.**
- `--with-models` and all other flags unchanged.

## 5. Non-functional requirements

- **NF-1 (non-regression):** with no `lifecycle` block, `inspectConfig`,
  `resolve-panel` (all four phases), and `setup-sdlc` produce byte-identical
  stdout/stderr/exit codes to the shipped v1 for the existing test corpus.
- **NF-2 (closed vocabulary):** no code path interprets an unknown
  `lifecycle` key permissively; validation failure always precedes use.
- **NF-3 (determinism):** preset expansion is a pure data table; two runs of
  setup with the same inputs produce identical `lifecycle` blocks.

## 6. Verification scenarios (falsifiable; ids stable)

Each scenario names its pass/fail condition; the Tasks phase maps them to
check commands (expected: `node --test test/lifecycle-config.test.js` and
extensions to existing suites).

**Validation (inspectConfig):**

- **OLA1** — the dogfood repo's current config (no `lifecycle` block) yields
  zero issues, and the full existing `inspectConfig` test corpus passes
  unmodified. Fails if any existing assertion changes.
- **OLA2** — each of the three §3 preset expansions, embedded in an otherwise
  minimal valid config, yields zero issues.
- **OLA3** — `lifecycle.gates.merge: {...}` yields exactly one issue for path
  `lifecycle.gates` containing `unknown` and `merge`; manifest reported
  invalid.
- **OLA4** — `tracks.defaultTrack: "none"` yields an enum issue naming the
  allowed values; invalid.
- **OLA5** — `pr_review: {minPanel: 2, minVendors: 3}` yields a
  `minVendors ... <= minPanel` issue; invalid.
- **OLA6** — `phases.mergePlanSpec: true` alongside any `gates.spec_review`
  yields the cross-rule issue; invalid.
- **OLA7** — `spec_review.mode: {reversible: "panel"}` yields the structural
  issue; invalid. `plan_review.mode: {}` (empty per-track object) is invalid.
- **OLA8** — `lifecycle.profile` absent, or any value outside the four-value
  enum, is invalid; `profile: "standard"` with hand-edited dials differing
  from the preset table remains **valid** (provenance-only; falsifies any
  preset-comparison creep).

**Resolution (resolve-panel):**

- **OLA9** — with a `lifecycle` block present (`pr_review` floors 3/3),
  `resolve-panel pr_review` enforces 3/3 and prints the supersede notice;
  with the block absent, output is byte-identical to shipped v1 for the same
  models file.
- **OLA10** — `minPanel: 2, minVendors: 1` resolves a panel of two models
  from one vendor (impossible today); `minVendors: 2` with only one
  credentialed vendor fails with the existing floor-failure exit.
- **OLA11** — author-vendor exclusion: active at effective `minVendors >= 2`
  (author's vendor dropped, as today); inactive at `minVendors: 1` (author's
  vendor may appear).
- **OLA12** — `task_validate`: with `taskValidation.mode: "subagent"` floors
  are fixed 1/1 (models-file `min_panel: 3` for task_validate is ignored with
  the notice); with `mode: "off"`, exit 1 with the refusal message.
- **OLA13** — gate-mode refusal: `plan_review` effective mode `human` ⇒
  `resolve-panel plan_review` exits 1 with the no-panel message; mode
  `advisory` resolves a panel normally; per-track mode
  `{irreversible: "panel", reversible: "human"}` with `--track reversible`
  refuses and with `--track irreversible` resolves.

**Setup (setup-sdlc):**

- **OLA14** — non-interactive `--profile standard --yes` on a fresh repo
  writes a config whose `lifecycle` block equals the §3 `standard` expansion
  exactly (deep-equal), with `profile: "standard"`; the config passes
  `inspectConfig` with zero issues.
- **OLA15** — interactive run's profile step pre-selects `standard`
  (falsifier: accepting all defaults yields the `standard` expansion).
- **OLA16** — applying `--profile solo` to an existing **valid** manifest
  changes only the `lifecycle` key: every other top-level key deep-equals its
  prior value, and the FS10 report records the `config` asset as `upgraded`;
  applying to an **invalid** manifest is `refused` (exit 1) with the manifest
  unmodified byte-for-byte.
- **OLA17** — `--profile custom` non-interactively without explicit dial
  flags/payload is refused with a message naming the requirement; with a full
  `--lifecycle-json` payload it writes exactly that block (validated), with
  `profile: "custom"`.

**Structure (future-proofing):**

- **OLA18** — `decomposeGateMode` is exported, total over the four-value
  enum, and returns the §2 table exactly; no other module hard-codes a
  `mode === "panel"` human-approval branch (falsifier: grep for `"panel"`
  comparisons outside the decomposition module in the changed scripts).
- **OLA19** — the shipped `schema/sdlc.config.schema.json` contains the
  `automation` reservation text verbatim, and `lifecycle.automation: {}` in a
  config is rejected as an unknown key.

A scenario that cannot be made to fail is a defect in this spec.

## 7. Out of scope for OL-A (binding)

- Any `check-lifecycle` change (shape-of-record, `shape` field, evidence
  checks) — OL-B.
- The FS10 report nudge line and its ADR 0018 bump — OL-B.
- SKILL.md/asset prose, standalone entrypoints — OL-C.
- The `evidence.channels.json` format — OL-B.
- FS2 schema changes (`min_panel` remains schema-valid).

## 8. Context for Tasks

- Suggested slicing: (T1) schema + `inspectConfig` + `decomposeGateMode`
  [OLA1–8, 18, 19]; (T2) `resolve-panel` [OLA9–13]; (T3) `setup-sdlc`
  [OLA14–17]. T2/T3 depend on T1; T2 and T3 are independent of each other.
- The PR for OL-A declares slug `opt-in-lifecycle-config`; a thin sub-change
  plan doc (`docs/plans/2026-07-14-opt-in-lifecycle-config.md`, pointing at
  the stream plan) plus this spec and the build doc satisfy the FS9 v1
  artifact demands on the irreversible track.
