# Spec: review-gate config model — `validate` × `approve` (schemaVersion 4)

- Date: 2026-07-22 (rev 2)
- Revision history: rev 1 pre-panel draft. rev 2 incorporated all 8 consolidated
  spec-panel findings
  (`docs/reviews/spec-review-review-gate-config-model-2026-07-22/consolidated.md`);
  M3 (schema-break `!`) resolved by correcting N2's over-claim, not by widening
  scope. Spec is owner pre-approved after review rounds (goal directive).
- Track: **irreversible** (persisted `sdlc.config.json` shape break; `schemaVersion 3 → 4`).
- Plan: `docs/plans/2026-07-22-review-gate-config-model.md` (rev 2, approved).
- Grounding commit: 66e38ee (main). Reviewers cite `file:line` for framework claims.
- Issue: [#150](https://github.com/threadsafe-systems/pi-sdlc/issues/150).

This Spec fixes the contracts, the full surface area, and falsifiable scenarios.
It resolves the Plan's Open Decisions #2 (delete `decomposeGateMode`) and #4
(setup CLI grammar). Vocabulary and the five brainstorm decisions are ratified
upstream and not re-opened here.

## 1. Contracts and interfaces

### C1 — the gate-dial object (`sdlc.config.schema.json`)

`review.design` and `review.code` change from the scalar `gateMode` enum to a
**gate-dial object**:

```jsonc
{ "validate": "panel" | "skip", "approve": "human" | "agent", "preview"?: boolean }
```

- New schema definition `gateDial` (replaces `gateMode`), `additionalProperties:
  false`, `required: ["validate", "approve"]`.
- `validate` enum: `["panel", "skip"]`. `approve` enum: `["human", "agent"]`.
- `preview` is an **optional reserved boolean** (C3d): accepted by the schema, no
  runtime effect in v4.
- `review.brainstorm` (`human|off`), `review.tasks` (`subagent|self|off`),
  `review.panelSize`, `review.onShortfall` are **unchanged** scalars.
- `schemaVersion` const becomes `4`.

### C2 — the desugar/translation guide (ADR only, not runtime)

The canonical v3→v4 mapping, recorded in the ADR, used to hand-author configs and
by `setup-sdlc` presets. **No runtime scalar acceptor exists** — a v4 reader that
sees a string where a dial object is expected fails validation (C4/S3).

| v3 scalar | v4 gate-dial |
|---|---|
| `panel` | `{ "validate": "panel", "approve": "human" }` |
| `advisory` | `{ "validate": "panel", "approve": "agent" }` |
| `human` | `{ "validate": "skip", "approve": "human" }` |
| `off` | `{ "validate": "skip", "approve": "agent" }` |

The `advisory → approve:agent` row is an **intentional amendment**: old `advisory`
was non-blocking, but `{validate:panel, approve:agent}` under the always-on
disposition invariant (C9) makes disposition mandatory. Recorded as intentional in
the ADR + covered by S12.

### C3 — base vs override, and the deep-merge algorithm

- **C3a Base dials** (`review.design`, `review.code`): both `validate` and
  `approve` are **required** (no defaults) — v4 keeps v3's "all dials explicit"
  ethos.
- **C3b Override dials** (`overrides.<track>.review.design`/`.code`): a **partial**
  gate-dial object — each of `validate`/`approve`/`preview` is optional; the
  object must carry **at least one** field. `additionalProperties: false`. The
  per-track override keys stay exactly `design|code|tasks|panelSize`.
- **C3c Effective merge — one shared exported helper** (spec-panel M5). `lib.mjs`
  exports a single `effectiveReview(config, track)` (and/or `effectiveReviewDial`)
  that both `config-doc.mjs` and `resolve-panel.mjs` import and use — **neither may
  keep a private merge**, so the two consumers cannot drift:
  1. Dial-level: `out = { ...review, ...(overrides[track]?.review ?? {}) }`
     (a present override dial replaces at the dial slot — unchanged for the
     scalar dials `brainstorm`/`tasks`/`panelSize`/`onShortfall`).
  2. Field-level, for the object dials `design` and `code` **only**: when the
     override supplies that dial, `out[dial] = { ...review[dial], ...override[dial] }`
     so an override that names only `approve` inherits the base `validate`
     (and `preview`). This is the deep-merge that lets a track relax one axis.
  Because the guard compares `.validate === "skip"`, a merge that dropped an
  inherited `validate` (leaving `undefined`) would silently resolve a panel — the
  shared helper plus S5/S6's observable assertions close that hole.
- **C3d Reserved `preview`**: valid on base and override dials; carried through the
  merge; **read by nothing** in v4. When present, `config-doc` renders a single
  visibility line `preview: reserved (no effect in v4)` so it is never a silent
  no-op (C5). No other behaviour observes it.

### C4 — version classification (`lib.mjs`)

- `CONFIG_SCHEMA_VERSION = 4`; `KNOWN_PAST_VERSIONS = {1, 2, 3}`.
- `REMEDY_SCHEMA_OLDER`/`REMEDY_SCHEMA_NEWER` strings say "v4" (not "v3") and
  continue to name only real paths (re-run setup / pin); never promise a migrator.
- `classifyConfigVersion(3)` → `{ kind: "older", version: 3 }` (S8).
- `inspectConfig` requires `schemaVersion === 4`; a v3 config is structurally
  rejected with the older-remedy path (S3/S8).

### C5 — renderer (`config-doc.mjs`)

- `GATE_MEANING` (scalar map) is **replaced** by two field-level explanations:
  - `validate`: `panel` = "an adversarial multi-model panel runs before the
    artifact is presented"; `skip` = "no panel runs for this gate (an authored
    choice, not a bypass)".
  - `approve`: `human` = "a human owner adjudicates and advances"; `agent` = "the
    agent adjudicates findings and advances (no human gate; the disposition
    discipline still applies)".
- `effectiveReview` is the **shared exported helper** from `lib.mjs` (C3c), not a
  private copy.
- `trackSummary` renders each object dial as its `validate` + `approve` (+ the
  reserved-`preview` line when present), never the removed scalar words.
- The render fingerprint changes; `.pi/sdlc/CONFIG.md` is regenerated and
  `config-doc check` returns `current` (S10).

### C6 — panel resolution (`resolve-panel.mjs`)

- `effective(dial)` is backed by the **shared** C3c helper from `lib.mjs` (not a
  private merge); for `design`/`code` it returns a fully-merged gate-dial object
  (no `undefined` inherited fields).
- The panel-presence guard (currently `decomposeGateMode(mode).reviewer === "none"`)
  becomes `effective(DIAL_FOR[phase]).validate === "skip"` → "no panel to resolve"
  (S6). `DIAL_FOR` unchanged (`plan_review`/`spec_review`→`design`,
  `pr_review`→`code`, `task_validate`→`tasks`). `task_validate` still reads the
  scalar `review.tasks` and its `off` guard is unchanged.

### C7 — setup authoring (`setup-sdlc.mjs`, `setup-sdlc.sh`, `templates/setup-sdlc.md`)

- **C7a Presets** (`LIFECYCLE_PRESETS`) emit gate-dial objects per C2:
  - `solo`: `design {validate:skip, approve:human}`, `code {validate:panel, approve:agent}`.
  - `standard`: `design {validate:skip, approve:human}`, `code {validate:panel, approve:human}`.
  - `full`: `design {validate:panel, approve:human}`, `code {validate:panel, approve:human}`,
    `overrides.reversible.review.design {validate:skip}` (partial — relaxes only
    `validate`, inheriting `approve:human`).
- **C7b Flags**: `--review-design` / `--review-code` take `<validate>/<approve>`
  (both parts required), e.g. `panel/human`, `skip/agent`. Invalid halves are
  rejected naming the legal sets.
- **C7c `--override`**: `<track>:<dial>:<value>`. For `design`/`code`, `<value>`
  is `<validate>/<approve>` with **either half omittable** for a partial override
  (`skip/`, `/agent`, `panel/human`); at least one half required. For
  `tasks`/`panelSize`, `<value>` is the bare scalar (unchanged).
- **C7d Interview**: **one compound prompt per object dial** accepting
  `<validate>/<approve>` (e.g. `panel/human`) — replacing the single
  `panel/advisory/human/off` prompt — so the two core decisions (design, code) plus
  a final confirmation stay within the locked **≤3-prompt** TTY ceiling
  (`templates/setup-sdlc.md`, spec-panel M8). Wording teaches `skip` as an authored
  choice and `agent` as agent-adjudication.
- **C7e `.sh` usage** mirrors the new flag grammar; no `panel|advisory|human|off`
  string survives.

### C8 — ADRs

- **New ADR** (next free number) records: the decomposition, the `agent`/`skip`
  naming (incl. the overridden bypass-smell concern), the desugar table, the
  intentional `advisory` amendment (C2), the disposition invariant (C9), the
  reserved `preview`, and the clean-break posture.
- **ADR 0027 amended**: "external adopter" defined as a genuine third party,
  explicitly excluding co-owned dogfood repos (this repo + Case); v3→v4 ships as a
  coordinated clean break with a hand-authored Case re-author as the "equivalently
  honest forward path," not a migrator.

### C9 — the disposition invariant (prose-law, unchanged)

Whenever `validate: panel`, every finding is recorded and incorporated-or-justified
and no surviving high/medium may advance — regardless of `approve`. `approve:agent`
= the agent is the gate adjudicator with no human escalation for that gate; the
human-final-adjudicator rule in `phase-pr-review.md` governs `approve:human` gates.
No config field encodes "blocking." **All three design/PR references are
reconciled** (spec-panel H2): `phase-plan.md` and `phase-spec.md` currently say the
seam is "a design gate plus human approval" — reworded to "a design gate plus
approval by the effective approver (human, or the agent under `approve:agent`)";
`phase-pr-review.md` gains the matching sentence that its human-final-adjudicator
seam governs `approve:human` gates specifically. Covered by S11.

## 2. Surface area (complete inventory — DoD requires all touched)

Code:

- `skills/sdlc/schema/sdlc.config.schema.json` — `gateDial` def (replaces
  `gateMode` @137), `review.design`/`.code` @79-80, `trackOverride.review`
  `design`/`code` refs, `schemaVersion const:4`.
- `skills/sdlc/schema/sdlc.config.example.json` — object shape + `schemaVersion 4`.
- `skills/sdlc/scripts/lib.mjs` — `GATE_MODES` @24 removed/replaced by
  `VALIDATE_MODES`/`APPROVE_MODES`; `CONFIG_SCHEMA_VERSION`/`KNOWN_PAST_VERSIONS`/
  `REMEDY_*` @26-29; `validateReviewDial` @~315-333 (object dials, base vs
  partial); `collectOverridesIssues` partial-dial handling; **`decomposeGateMode`
  @135 deleted** (Open Decision #2).
- `skills/sdlc/scripts/resolve-panel.mjs` — `effective()` @92 merge, guard @200
  (`.validate === "skip"`), drop the `decomposeGateMode` import @16.
- `skills/sdlc/scripts/config-doc.mjs` — `GATE_MEANING` @100, `effectiveReview`
  @93, `trackSummary` @121-122.
- `skills/sdlc/scripts/setup-sdlc.mjs` — usage @33, `--override` gate set @86-88,
  `LIFECYCLE_PRESETS` @40-50, interview @643-651.
- `skills/sdlc/scripts/setup-sdlc.sh` — usage @6-7.
- `skills/sdlc/scripts/check-lifecycle.mjs` (@10,220-224) and
  `skills/sdlc/scripts/sdlc-status.mjs` (@14,234-244) — consume the version seam
  (`classifyConfigVersion`/`inspectConfig`); verify no logic change beyond the
  `lib.mjs` bump and refresh any v3 comment (spec-panel M7). FS8/FS9 check ids and
  exits are preserved (N5).
- **v4 version-string sweep** (spec-panel L9): refresh stale "v3"/"schemaVersion 3"
  text in `resolve-panel.mjs` (@3,55), `config-doc.mjs` (@183),
  `setup-sdlc.mjs` (@34,244,567), `setup-sdlc.sh` (@18), `sdlc-status.mjs` (@3).
- **`check-schema-break.mjs` is deliberately out of scope** (spec-panel M3):
  hardening its guard to reject the `!` shorthand is a separate release-guard
  concern; this change only relies on it accepting the `BREAKING CHANGE:` footer
  (which it already does). Candidate follow-up, not part of #150.

Prose / docs:

- `skills/sdlc/SKILL.md` @86 (effective-shape reading protocol).
- `skills/sdlc/references/phase-plan.md`, `phase-spec.md`, `phase-pr-review.md`
  (@230 + adjudicator reconciliation), `system-reference.md` — "under your
  configuration" callouts.
- `templates/setup-sdlc.md` @29,58-62.
- `docs/adr/<new>.md` (new) + `docs/adr/0027-*.md` (amended).
- `.pi/sdlc/sdlc.config.json` (this repo) → v4 object shape; regenerate
  `.pi/sdlc/CONFIG.md`.

Tests (updated/added): `lib-config.test.js`, `config-intent-vocabulary.test.js`,
`config-doc.test.js`, `resolve-panel-v3.test.js`, `setup-sdlc.test.js`,
`setup-v3.test.js`, `setup-config-doc.test.js`, `schema-break.test.js`,
`frozen-surfaces.test.js`, `docs.test.js`, `phase-references.test.js`,
`system-reference.test.js`, `skill-kernel.test.js`. **Plus the v3-hardcoded
fixtures/tests the panel found (spec-panel H1/M7) — do not miss these or S16 fails
catastrophically:** the shared helper `test/fs8-helpers.js` (`VALID_CONFIG`,
high-leverage), `test/hooks.test.js`, `test/telemetry-side-effects.test.js`,
`test/installed-consumer.test.js`, `test/check-completion.test.js`,
`test/check-lifecycle-git.test.js`, `test/check-lifecycle.test.js`,
`test/readiness-lib.test.js`, and every fixture under `test/fixtures/**` plus
`test/fixtures/consumer/.pi/sdlc/sdlc.config.json`. Build task "tests" begins with
a repo-wide grep for `schemaVersion` / `design: "` / `"advisory"` across `test/`
to enumerate the full fixture set before editing.

## 3. Non-functional requirements

- **N1** No runtime scalar acceptor / no dual-accept: nothing in `lib.mjs`,
  `resolve-panel.mjs`, `config-doc.mjs`, or `setup-sdlc.mjs` reads a `gateMode`
  string or the removed `arbiter`/`blocking`/`decomposeGateMode` symbols (S7).
- **N2** Intended break is release-signalled: **this PR's commit carries a
  `BREAKING CHANGE:` footer** (which both `check-schema-break.mjs` and the
  angular-preset semantic-release honor; the bare `!` yields "no release" per the
  known gotcha, so the footer is required for the major bump). N2 does **not**
  require changing `check-schema-break.mjs`'s acceptance of `!` (spec-panel M3);
  `frozen-surfaces.test.js`/`schema-break.test.js` are updated only for the v4
  shape, not the guard's signal logic.
- **N3** Determinism: `config-doc` render stays byte-deterministic; the sentinel
  fingerprint recomputes and `check` is `current`.
- **N4** No stale vocabulary: a repo-wide sweep finds no `advisory` **as a gate
  value/grammar** and no `panel|advisory|human|off` gate **enumeration** in
  schema/scripts/prose/templates, and no stale `schemaVersion 3`/`v3` version
  string in the swept scripts (S9). The word `advisory` remains legal for the
  unadopted-session "advisory mode" and the `advisory[${phase}]:` log prefix; the
  words `panel`/`human` remain legal as `validate`/`approve` values and brainstorm
  `human|off`.
- **N5** `sdlc-status` stays ready and no FS8/FS9 check id or exit changes.

## 4. Resolved open decisions

- **#2 `decomposeGateMode`**: **deleted**. Direct field reads (`.validate`) replace
  it; its `arbiter`/`blocking` fields were already dead.
- **#4 CLI grammar**: as C7b/C7c above (`<validate>/<approve>`, omittable halves
  for partial overrides).

## 5. Falsifiable scenarios

Each has a stable id, a pass/fail condition, and a covering test. A scenario that
cannot be made to fail is a broken spec.

- **S1 — schema accepts a valid v4 config.** A config with `schemaVersion:4` and
  `review.design/.code` as `{validate,approve}` objects passes `inspectConfig`
  (empty issues) and JSON-schema validation. *Fails if* either rejects a valid
  object. (`lib-config.test.js`, `config-intent-vocabulary.test.js`)
- **S2 — both base fields required.** A base dial missing `validate` or `approve`
  yields exactly the `review.<dial>.<field> is required` issue. *Fails if* a
  one-field base dial validates. (`lib-config.test.js`)
- **S3 — scalar dial rejected.** `review.design:"panel"` (string) is rejected with
  a "must be an object" issue; no desugaring occurs. *Fails if* a scalar validates.
  (`lib-config.test.js`)
- **S4 — enum guards.** `validate` outside `{panel,skip}` or `approve` outside
  `{human,agent}` is rejected naming the legal set. *Fails if* an out-of-enum value
  passes. (`lib-config.test.js`)
- **S5 — partial override deep-merge.** Base `design {validate:panel,
  approve:human}` + `overrides.reversible.review.design {approve:agent}` yields
  effective reversible `design {validate:panel, approve:agent}`. *Fails if*
  `validate` is dropped or the override is rejected. (`lib-config.test.js`,
  `config-doc.test.js`, `resolve-panel-v3.test.js`)
- **S6 — panel-presence guard.** `resolve-panel plan_review --track T` where
  effective `design.validate==="skip"` exits 1 "no panel to resolve"; with
  `validate:"panel"` it resolves the roster. *Fails if* a `skip` gate resolves a
  panel or a `panel` gate refuses. (`resolve-panel-v3.test.js`)
- **S7 — no dead symbols.** `decomposeGateMode`, `arbiter`, `blocking`, `gateMode`
  do not appear in `lib.mjs`/`resolve-panel.mjs`/`config-doc.mjs`. *Fails if* any
  remains. (`lib-config.test.js` or a grep assertion)
- **S8 — v3 now "older".** `classifyConfigVersion(3)` is `{kind:"older",version:3}`;
  a committed v3 config makes `sdlc-status` report the older-remedy (naming setup/
  pin, no migrator). *Fails if* v3 classifies current or the remedy promises a
  migration. (`schema-break.test.js`, `readiness-lib.test.js`)
- **S9 — scoped stale-vocabulary sweep.** A test asserts no `review.design`/
  `review.code` **scalar** grammar and no `panel|advisory|human|off` gate
  **enumeration** survives in schema/scripts/references/SKILL/templates, and no
  stale `v3`/`schemaVersion 3` string in the swept scripts — while **explicitly
  allowing** `approve:human`, `validate:panel`, brainstorm `human|off`, the
  session "advisory mode" (`SKILL.md:43`), and the `advisory[${phase}]:` log
  prefix (`resolve-panel.mjs:154`). *Fails if* residual gate-scalar grammar remains
  **or** the test over-matches a legal use. (`docs.test.js` / `frozen-surfaces.test.js`)
- **S10 — renderer.** `config-doc` render for a v4 config contains the `validate`/
  `approve` explanations and none of the **removed scalar gate-explanations** (the
  old `GATE_MEANING` phrases for `advisory`/`human`/`off`); regenerated
  `.pi/sdlc/CONFIG.md` makes `config-doc check` return `current`. *Fails if* render
  carries an old scalar explanation or `check` is `stale`. (`config-doc.test.js`,
  `setup-config-doc.test.js`)
- **S11 — approve:agent prose across all three references.** `phase-plan.md`,
  `phase-spec.md`, and `phase-pr-review.md` each state the seam is "a design gate
  plus approval by the effective approver (human, or the agent under
  `approve:agent`)"; none still says "design gate plus **human** approval"
  unconditionally. `phase-references.test.js`/`system-reference.test.js` assert the
  reconciliation in all three. *Fails if* any reference still implies a mandatory
  human gate on a design/code panel. (`phase-references.test.js`)
- **S12 — intentional advisory amendment recorded.** The new ADR contains the
  desugar table and labels the `advisory → approve:agent` row an intentional
  amendment; `adr-absorption.test.js`/`docs.test.js` see the ADR. *Fails if* the ADR
  omits the amendment note. (`docs.test.js`)
- **S13 — reserved preview, accepted but bounded.** (a) A config with
  `preview:true` on a base or override dial validates and has **no** runtime effect:
  `resolve-panel` behaviour is identical to `preview` absent, and `config-doc`
  renders the single reserved-visibility line. (b) A **non-boolean** `preview` is
  rejected, and (c) an **unknown sibling key** on a gate dial (base or override) is
  rejected (`additionalProperties:false` holds). *Fails if* `preview` changes gate
  behaviour, is silently invisible, or the closed-world boundary leaks.
  (`lib-config.test.js`, `config-doc.test.js`)
- **S14 — setup emits v4.** `setup-sdlc --preset full` (and the flag/interview
  paths) writes gate-dial objects and `schemaVersion:4`; `--review-design panel/human`
  and `--override reversible:design:/agent` produce the expected objects; the v4
  config it writes passes `inspectConfig`. *Fails if* setup emits a scalar or an
  invalid config. (`setup-sdlc.test.js`, `setup-v3.test.js`)
- **S15 — this repo's config is valid v4.** `.pi/sdlc/sdlc.config.json` is
  `schemaVersion:4`, `design`/`code` = `{validate:panel,approve:human}`, the
  reversible override = `design {validate:skip}` (partial), `sdlc-status` exits 0
  ready. *Fails if* the committed config is invalid or not-ready. (`sdlc-status.test.js`,
  live `sdlc-status`)
- **S16 — full suite + lint green.** `node --test test/*.test.js` and `biome check .`
  pass. *Fails if* any test or lint fails.
- **S17 — agent-approval telemetry.** The `gate.approved` event accepts an agent
  approver: the payload `approver` uses the telemetry `--by` grammar's `agent`
  token (e.g. `approver:"agent"`), and `system-reference.md`'s telemetry directive
  reads "every gate approval (human or agent)" rather than "every human gate
  approval". *Fails if* the emission rule/approver value is undefined or the docs
  still say human-only. (`telemetry-emitter.test.js`, `system-reference.test.js`)

## 6. Context for the next agent (Build)

- The surface inventory in §2 is the task-decomposition seed; group by
  schema+validation, resolvers/renderer, setup, prose/ADR, this-repo config+CONFIG.md,
  tests — mind the shared `validateReviewDial`/`effectiveReview`/`effective()`
  merge contract (C3c) that both `config-doc` and `resolve-panel` must implement
  identically.
- `review.tasks`/`brainstorm`/`panelSize`/`onShortfall` are untouched scalars — do
  not object-ify them.
- The break is intended; the PR body carries a `BREAKING CHANGE:` footer (no `!`).
