# Spec: opt-in lifecycle — OL-A, config vocabulary and resolution

- Date: 2026-07-14 (rev 2 — spec panel findings incorporated; see
  `docs/reviews/spec-review-opt-in-lifecycle-config-2026-07-14/consolidated.md`)
- Sub-change: **OL-A** of the opt-in lifecycle stream (see
  `docs/plans/2026-07-14-opt-in-lifecycle.md`, "Spec decomposition"). OL-A
  delivers the `lifecycle` config vocabulary, its validation, profile-aware
  setup **for fresh adoption**, and panel-floor resolution. **No checker
  (`check-lifecycle`) change ships in OL-A** — that is OL-B. No skill-prose
  change ships in OL-A — that is OL-C. **Profile application to an
  already-adopted repo is deferred to OL-B** (adjudicated at spec review: it
  requires FS10 report-semantics evolution, which ADR 0018 permits only via an
  explicit schema-version bump — OL-B already carries the one FS10 v2 bump for
  the nudge line, and both changes ride it together).
- Track: irreversible (freezes the `lifecycle` vocabulary consumers commit to;
  FS1-additive).
- Upstream: plan rev 2 (canonical); ticket resolutions #35–#38 + amendments
  (#35, #36); research brief `research-36` (accepted 2026-07-14, on #36).

## 1. Surface area

Files changed (all under `skills/sdlc/` unless noted):

| Surface | File | Nature |
|---|---|---|
| FS1 manifest schema | `schema/sdlc.config.schema.json` | additive: `lifecycle` property + `automation` reservation `$comment` |
| FS1 validation | `scripts/lib.mjs` (`inspectConfig`, new `decomposeGateMode`) | additive: `lifecycle` inspection; existing checks byte-identical |
| Panel resolution | `scripts/resolve-panel.mjs` | floor sourcing precedence (**adds a raw, non-fatal read of `sdlc.config.json`** — see §4.2); vendor floor + deterministic selection; `--track` flag; `task_validate` rule |
| Setup | `scripts/setup-sdlc.mjs` (+ `setup-sdlc.sh`) | profile interview/`--profile` flag (fresh adoption); `--lifecycle-json` custom payload |
| Models example | `schema/sdlc.models.example.json` | review-gate `min_panel` values aligned to the preset floors (`pr_review` 3 → 2) so a fresh `--with-models` + `--profile full` adoption has agreeing floors |
| Tests | `test/` | new OLA fixtures; existing fixtures untouched (see §6) |

Explicitly untouched in OL-A: `check-lifecycle.mjs` (FS9 v1 as shipped),
`sdlc-status.mjs` (FS8 frozen), the FS10 report envelope and action semantics
(`SetupReportV1` byte-identical; the FS10 v2 bump is OL-B's), `sdlc.models.json`
FS2 schema (`min_panel` remains schema-valid; ignored-with-notice at *runtime*
when a `lifecycle` block is present), prompts, assets.

## 2. The `lifecycle` block — normative schema

One optional top-level key in `.pi/sdlc/sdlc.config.json`. `schemaVersion`
stays `1` (FS1 is additive within a major). **Absence of the block means
every consumer surface OL-A touches behaves byte-identically to today** (the
precise byte-identity domain is NF-1, §5).

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
      // {"irreversible","reversible"} (at least one key; no other keys;
      // an empty object {} is invalid).
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
  5. A per-track `mode` object must carry at least one allowed key (empty
     `{}` is invalid, on every gate that accepts the object form).
- The kernel-protecting absences are **normative**: there is no `merge` gate
  key, no `scenarios` key, no `checks` off-switch, and `defaultTrack` cannot
  say `none`. These are enforced by the closed vocabulary itself.

**Reviewer × arbiter modelling (plan DoD-8, #36 amendment).** `lib.mjs`
exports a single total decomposition function `decomposeGateMode(value)`:

| value | reviewer | arbiter | blocking |
|---|---|---|---|
| `panel` | panel | human | yes |
| `advisory` | panel | none | no |
| `human` | none | human | yes |
| `off` | none | none | no |

Every gate-mode decision in the changed scripts is expressed against the
decomposition's fields (`reviewer`/`arbiter`/`blocking`), **never against raw
mode strings** — so adding a fifth value (the reserved
panel/mechanical/blocking quadrant) is one row in this table plus enum
growth, never a remodel. `panel`'s human-approval coupling exists **only** in
this table.

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

**Floor agreement (normative).** `full`'s floors are the schema defaults
(2/2). The shipped `sdlc.models.example.json` review-gate `min_panel` values
are aligned to these floors in OL-A (§1), so a fresh adoption
(`--with-models --profile full`) has agreeing floors from both files. A repo
whose *existing* models file carries a higher `min_panel` than a preset floor
(e.g. this repo's `pr_review: 3`) keeps its higher effective floor only by
committing higher `lifecycle` floors — that situation arises on profile
application to an adopted repo, which is **OL-B**; the supersede notice (§4.2)
always names both values so the divergence is visible, never silent.

`custom` is **not a preset**. Interactively, the interview collects every
dial explicitly. Non-interactively, the **only** input path is
`--lifecycle-json <path|->` (§4.3); the placeholder idea of per-dial
`--lifecycle-*` flags is dropped from OL-A.

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

**Config read (new, non-fatal).** `resolve-panel` gains a raw read of
`.pi/sdlc/sdlc.config.json`: if the file is missing, unparseable, or parses
without a `lifecycle` key, the resolver takes the **v1 path — byte-identical
stdout/stderr/exit to shipped v1** (an invalid config with no `lifecycle`
block must not change resolver behaviour; it is FS8's problem, not the
resolver's). Only when a `lifecycle` key is present is the block validated
(via `inspectConfig`); an invalid block fails resolution: exit 1, stderr
naming the first validation issue.

**Floor sourcing precedence, per phase:**

- **Review gates** (`plan_review`, `spec_review`, `pr_review`):
  - `lifecycle` present: floors come from
    `lifecycle.gates.<phase>.{minPanel,minVendors}` (defaults per §2 when the
    gate key is absent). The models file's `phases.<phase>.min_panel` is
    **ignored with a one-line stderr notice naming both values**:
    `note: min_panel=<m> in sdlc.models.json superseded by lifecycle.gates.<phase> (minPanel=<p>, minVendors=<v>)`.
  - `lifecycle` absent: `min_panel` governs exactly as today (byte-identical
    output, including stderr).
- **Vendor floor and selection (normative acceptance condition):** a
  resolution succeeds only when **both** `panel.length >= minPanel` **and**
  the count of distinct vendors in the selected panel `>= minVendors`.
  Selection is deterministic, vendor-first: walk the phase's `prefer` list in
  order, first taking the first credentialed model of each not-yet-selected
  vendor until `minVendors` distinct vendors are selected, then filling
  remaining slots in `prefer` order subject to a per-vendor cap of
  `minPanel − minVendors + 1`. When `minVendors == minPanel` this reduces
  exactly to today's one-model-per-vendor dedupe. On failure, the existing
  floor-failure exit and message shape apply, extended to name whichever
  floor (size or vendors) was unmet.
- **Author-vendor exclusion:** activation condition becomes
  `rules.exclude_author_vendor !== false && effectiveMinVendors >= 2`
  (today's `min_panel >= 2` at defaults ⇒ unchanged behaviour; at
  `minVendors: 1` exclusion is off — a solo panel cannot exclude the author's
  vendor and still exist).
- **Gate-mode awareness (expressed via the decomposition, never raw
  strings):** for a review gate whose effective mode decomposes to
  `reviewer: "none"` (`human`, `off`), `resolve-panel` **refuses**: exit 1,
  stderr
  `resolve-panel: <phase> gate mode is '<mode>' in the committed lifecycle shape — no panel to resolve`.
  Modes decomposing to `reviewer: "panel"` (`panel`, `advisory`) resolve
  normally.
  - **`--track` flag (new):** accepts exactly `irreversible` or
    `reversible`; any other value is a usage error via the existing `fail`
    path (exit 1). When the gate's `mode` is a **single value**, `--track` is
    accepted and irrelevant. When the gate's `mode` is a **per-track
    object**, `--track` is **required**: without it the resolver refuses —
    exit 1, stderr
    `resolve-panel: <phase> mode is per-track in the committed lifecycle shape — pass --track irreversible|reversible`.
    (No "strictest value" heuristic exists; the ambiguity is refused, not
    guessed.) `--track` with a track whose key is absent from the object
    resolves that track's effective mode from the §2 defaults (e.g.
    `spec_review` for `reversible` has no spec phase and refuses with the
    no-panel message).
- **`task_validate`** (not a `gates` key; `--track` is irrelevant and
  accepted):
  - `lifecycle` present and `taskValidation.mode` ∈ {`subagent`,`self`}:
    fixed floor 1 model / 1 vendor; models-file `min_panel` for
    `task_validate` ignored with the same notice form.
  - `lifecycle` present and `taskValidation.mode == "off"`: refuses — exit 1,
    stderr
    `resolve-panel: task validation is off in the committed lifecycle shape`.
  - `lifecycle` absent: today's behaviour.

### 4.3 `setup-sdlc.mjs` — fresh adoption only (application to adopted repos is OL-B)

- New interview step (first substantive question) and `--profile
  <solo|standard|full|custom>` flag; interactive default pre-selects
  `standard`. The step's prose names the three presets in one line each and
  states the `solo` credential fact (advisory review needs ≥ 1 live model
  credential).
- **Fresh adoption** (no existing config): the written config carries the
  fully-expanded `lifecycle` block per §3. Non-interactive `--profile <p>
  --yes` writes preset `<p>`; `--profile custom` non-interactively requires
  `--lifecycle-json` (below) and is otherwise **refused** (exit 1, message
  naming the requirement).
- **`--lifecycle-json <path|->` (new, the only non-interactive custom
  input):** reads a complete `lifecycle` block as JSON from the file path (or
  stdin when `-`). The payload must NOT contain a `profile` key (usage error
  via `fail` if it does); setup injects `profile: "custom"`, validates the
  assembled block through `inspectConfig`, writes it on success, refuses
  (exit 1, first validation issue) otherwise. Supplying `--lifecycle-json`
  with a non-`custom` `--profile` is a usage error.
- **No `--profile` flag, non-interactive (`--yes`):** byte-identical v1
  behaviour — no `lifecycle` block is written, no new output lines
  (script/CI compatibility; NF-1). Interactive runs always ask the profile
  question — that is an intentional, accepted change to the interview.
- **Existing config present:** OL-A behaviour is byte-identical v1
  (`retained`/`refused` per the shipped `configMutating`/`--force` ladder;
  `--profile` against an existing config is **refused** with a message
  pointing at OL-B's application path). The FS10 report envelope, action
  vocabulary, and semantics are byte-identical in OL-A.
- `--with-models` and all other flags unchanged.

## 5. Non-functional requirements

- **NF-1 (non-regression, precise domain):** byte-identical
  stdout/stderr/exit codes to shipped v1 for: (a) `inspectConfig` on any
  config without a `lifecycle` key; (b) `resolve-panel` (all four phases)
  when the config is missing, unparseable, or lacks a `lifecycle` key —
  regardless of whether the config is otherwise valid; (c) `setup-sdlc`
  invoked without `--profile` and without `--lifecycle-json`, non-interactive.
  Fresh-adoption runs *with* `--profile`, and interactive interviews, are the
  intentional changed paths and are outside NF-1's domain.
- **NF-2 (closed vocabulary):** no code path interprets an unknown
  `lifecycle` key permissively; validation failure always precedes use.
- **NF-3 (determinism):** preset expansion is a pure data table; two runs of
  setup with the same inputs produce identical `lifecycle` blocks; panel
  selection under §4.2 is deterministic for a fixed roster and credential
  set.

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
  issue; invalid. **Empty per-track objects on every gate that accepts the
  object form** (`plan_review.mode: {}`, `spec_review.mode: {}`) each yield
  the at-least-one-key issue; invalid.
- **OLA8** — `lifecycle.profile` absent, or any value outside the four-value
  enum, is invalid; `profile: "standard"` with hand-edited dials differing
  from the preset table remains **valid** (provenance-only; falsifies any
  preset-comparison creep).

**Resolution (resolve-panel):**

- **OLA9** — with a `lifecycle` block present (`pr_review` floors 3/3),
  `resolve-panel pr_review` enforces 3/3 and prints the supersede notice
  naming both values; with the block absent, output is byte-identical to
  shipped v1 for the same models file.
- **OLA10** — vendor floor is real, not a cap artifact: (a)
  `minPanel: 2, minVendors: 1` resolves two models from one vendor
  (impossible today); (b) `minPanel: 5, minVendors: 3` against a
  credentialed roster shaped A,A,A,B,B,C selects a panel with ≥ 3 distinct
  vendors (vendor-first: A,B,C, then fill to 5 under the per-vendor cap) —
  fails if any implementation satisfies size with only 2 vendors; (c)
  `minVendors: 2` with only one credentialed vendor fails naming the vendor
  floor.
- **OLA11** — author-vendor exclusion: active at effective `minVendors >= 2`
  (author's vendor dropped, as today); inactive at `minVendors: 1` (author's
  vendor may appear).
- **OLA12** — `task_validate`: with `taskValidation.mode: "subagent"` floors
  are fixed 1/1 (models-file `min_panel: 3` for task_validate is ignored with
  the notice); with `mode: "off"`, exit 1 with the refusal message.
- **OLA13** — gate modes and `--track`: (a) `plan_review` single mode
  `"human"` ⇒ exit 1 with the no-panel message; (b) single mode `"advisory"`
  ⇒ resolves a panel normally; (c) per-track
  `{irreversible: "panel", reversible: "human"}` **without `--track`** ⇒
  exit 1 with the pass-`--track` message; (d) same gate with
  `--track irreversible` resolves and with `--track reversible` refuses with
  the no-panel message; (e) `--track banana` ⇒ usage failure (exit 1).
- **OLA20** — robustness: an **invalid** config (bad non-lifecycle key) with
  **no** `lifecycle` block + a valid models file ⇒ `resolve-panel` output
  byte-identical to shipped v1 (no new exit, no new stderr).
- **OLA21** — a config whose `lifecycle` block is invalid ⇒ `resolve-panel`
  exits 1 with stderr naming the first `lifecycle` validation issue.

**Setup (setup-sdlc, fresh adoption):**

- **OLA14** — non-interactive `--profile standard --yes` on a fresh repo
  writes a config whose `lifecycle` block equals the §3 `standard` expansion
  exactly (deep-equal), with `profile: "standard"`; the config passes
  `inspectConfig` with zero issues.
- **OLA15** — interactive run's profile step pre-selects `standard`
  (falsifier: accepting all defaults yields the `standard` expansion).
- **OLA16** — NF-1(c): non-interactive `--yes` without `--profile` on a fresh
  repo produces stdout/stderr/exit and a written config byte-identical to
  shipped v1 (no `lifecycle` block, no new lines). `--profile solo` against
  an **existing** config is refused (exit 1) with the OL-B pointer message
  and the manifest unmodified byte-for-byte.
- **OLA17** — custom: (a) `--profile custom --yes` without `--lifecycle-json`
  is refused naming the requirement; (b) `--lifecycle-json` with a valid
  complete block (no `profile` key) writes exactly that block plus injected
  `profile: "custom"`, and the config validates; (c) a payload containing a
  `profile` key, or `--lifecycle-json` combined with `--profile standard`,
  is a usage failure; (d) an invalid payload is refused with the first
  validation issue.

**Structure (future-proofing):**

- **OLA18** — `decomposeGateMode` is exported, total over the four-value
  enum, and returns the §2 table exactly. Falsifier: in the changed scripts
  (`resolve-panel.mjs`, `setup-sdlc.mjs`, the new validation paths of
  `lib.mjs`), **no comparison against any raw gate-mode string**
  (`"panel"`/`"advisory"`/`"human"`/`"off"`) exists outside the
  decomposition function itself and the §2 validation enum table — every
  behavioural branch reads the decomposition's `reviewer`/`arbiter`/
  `blocking` fields.
- **OLA19** — the shipped `schema/sdlc.config.schema.json` contains the
  `automation` reservation text verbatim, and `lifecycle.automation: {}` in a
  config is rejected as an unknown key.

A scenario that cannot be made to fail is a defect in this spec.

## 7. Out of scope for OL-A (binding)

- Any `check-lifecycle` change (shape-of-record, `shape` field, evidence
  checks) — OL-B.
- **Profile application to an already-adopted repo** (non-destructive
  `lifecycle`-key application, its value-preservation semantics — NOT
  byte-preservation, which whole-object re-serialisation cannot honestly
  promise — and its FS10 report action) — OL-B, riding the single FS10 v2
  schema-version bump together with the setup nudge line (ADR 0018 revision).
- The `evidence.channels.json` format — OL-B.
- SKILL.md/asset prose, standalone entrypoints — OL-C.
- FS2 schema changes (`min_panel` remains schema-valid).

## 8. Context for Tasks

- Suggested slicing: (T1) schema + `inspectConfig` + `decomposeGateMode`
  [OLA1–8, 18, 19]; (T2) `resolve-panel` [OLA9–13, 20, 21]; (T3) `setup-sdlc`
  fresh-adoption + models example alignment [OLA14–17]. T2/T3 depend on T1;
  T2 and T3 are independent of each other.
- The PR for OL-A declares slug `opt-in-lifecycle-config`; a thin sub-change
  plan doc (`docs/plans/2026-07-14-opt-in-lifecycle-config.md`, pointing at
  the stream plan) plus this spec and the build doc satisfy the FS9 v1
  artifact demands on the irreversible track.
