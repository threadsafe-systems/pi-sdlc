# Plan: config intent vocabulary and self-explaining setup (schemaVersion 3)

- Date: 2026-07-17 (rev 5)
- Revision history: rev 1 pre-panel draft. rev 2 incorporated all 7
  consolidated plan-panel findings
  (`docs/reviews/plan-review-config-intent-vocabulary-2026-07-17/consolidated.md`).
  rev 3–4: spec-phase backward amendments (refusing rows; the disclosed
  semantic move replacing C1's outcome-equivalence contract — see the spec
  panel's S1). **rev 5 (owner-directed, at the spec gate): the v2→v3
  migration is removed from scope entirely.** pi-sdlc has exactly one
  adopter — this repo — and is expected to iterate before external adoption;
  a provably-honest migration for a population of one was ceremony without a
  beneficiary. v3 is a clean break: the sole adopter hand-authors its v3
  config; everyone else pins. This dissolves plan-panel findings C1/C3 and
  spec-panel findings S1–S6 as moot (their dispositions remain recorded in
  the review artifacts); C2 survives only as vocabulary design; C4–C7 and
  S7–S9 survive unchanged.
- Track: **irreversible** (breaks the persisted `sdlc.config.json` shape
  consumers commit to: schemaVersion 2 → 3, key deletions and renames; rides
  a package major per ADR 0021)
- Brainstorm: plain dialogue, 2026-07-17 (this session). Decision-ready:
  Neil ratified "Option B vocabulary with Option A mechanics" — delete
  `profile`, rename `enforcement`, replace the gate matrix with intent-level
  dials, generate a self-documenting companion doc, move the setup interview
  into the agent. The contradiction with the OL stream plan (rev 3) was
  raised explicitly and accepted: this stream formally amends that plan.
  The rev-5 clean-break decision was likewise raised and ratified in
  dialogue.
- Programme: child stream of the lifecycle-hardening programme
  (`docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`); backward amendment
  to `docs/plans/2026-07-14-opt-in-lifecycle.md` (see "OL plan amendment").

## Objective

Make the committed configuration **direct, honest, and self-explaining**:
every persisted key is read at runtime and means exactly what it says; setup
is a teaching conversation, not a jargon quiz; and an agent (or human) can
understand a repo's process shape from the committed artifacts alone, without
reading `lib.mjs` or 500 lines of SKILL.md.

## Rationale (grounded findings, why now)

1. **`profile` is a write-time macro pretending to be state.**
   `LIFECYCLE_PRESETS` (`setup-sdlc.mjs:38`) expands solo/standard/full into
   dials at write time and persists the label; the only runtime touch is an
   enum validation (`lib.mjs:350`). Hand-edit any gate and the label silently
   lies. It cannot even be used as a lever: setup refuses profile application
   to an existing config (`setup-sdlc.mjs:568`, "deferred to OL-B").
2. **The interview is a quiz, not a guide.** It asks "spec review minPanel
   [2]", "tracker publishThreshold (integer >=1 or never)", "enforcement
   (preference/strict)" — one line each, no explanation of what a panel is or
   what human/advisory/off mean in practice. A readline loop cannot teach.
3. **`enforcement` is misnamed and mislocated.** It governs panel-shortfall
   posture (`resolve-panel.mjs:80,194,274`), not lifecycle strictness, and
   sits top-level, far from the panels it governs (ADR 0022 semantics).
4. **Two floor concepts and two resolution axes coexist.**
   `panels.phases.*.minVendor` (vendor axis, no-block configs,
   `resolve-panel.mjs:164,296`) and `lifecycle.gates.*.minPanel`
   (model-identity axis, OL-A) overlap; `resolve-panel.mjs:241` literally
   prints a "minVendor … superseded by … minPanel" note at every resolution.
5. **The config does not explain itself.** Understanding a committed
   `sdlc.config.json` requires the schema, `lib.mjs`, and SKILL.md. Nothing
   in `.pi/sdlc/` states what the current values *do*. Some keys are worse
   than undocumented — they are unread: the operative "two or more tasks"
   tracker-publish rule is hardcoded prose (`SKILL.md:202`), not the
   committed `publishThreshold` value (only `lib.mjs:357-359` validates it).
6. **Why now:** OL-B (checker v2) and OL-C (skill surface) have not started.
   Landing the vocabulary break first means OL-B/OL-C build on v3 once,
   instead of shipping against v2 and re-basing immediately after. And with
   zero external adopters, a clean break is still available — that window
   closes at the first real adoption.

## Design principle (binding on every deliverable)

Every persisted key is read at runtime and means exactly what it says; no
key records provenance, history, or a setup-time answer. Presets are answer
bundles inside setup, never state. The committed artifacts are sufficient
documentation for an agent. A "reader" is one of exactly two kinds
(panel finding C5): **mechanical** (a script, cited `file:line`) or
**prose-law** (a SKILL.md sentence that instructs the agent to read the
committed value — never a hardcoded constant the value merely mirrors).

## What this delivers (scope in)

### 1. Intent vocabulary, schemaVersion 3

Replace `lifecycle` (profile, gates, phases, tracker.publishThreshold,
taskValidation, tracks) and top-level `enforcement` with two intent-level
blocks. Plan-level sketch (exact schema, enums, and required/optional split
are Spec decisions; the *vocabulary* below is ratified):

```jsonc
{
  "schemaVersion": 3,
  // identity/integration keys unchanged: prefix, labelPrefix, announce,
  // paths, tracker, hooks
  "review": {
    "brainstorm": "human",      // human | off
    "design": "panel",          // plan+spec gating: panel | advisory | human | off
    "code": "panel",            // PR gate: panel | advisory | human | off
    "tasks": "subagent",        // per-task validation: subagent | self | off
    "panelSize": 2,             // single distinct-model floor (default)
    "onShortfall": "proceed"    // proceed | fail (was enforcement preference|strict)
  },
  "shape": {
    "separateSpec": true,       // inverse of mergePlanSpec: true = more ceremony
    "publishToTracker": 2,      // integer >= 1 | "never"
    "defaultTrack": "irreversible"
  },
  "overrides": {                // optional; keys are EXACTLY irreversible |
                                // reversible — closed, no lane growth
    "reversible": { "review": { "design": "human" } }
  },
  "panels": {
    // roster + floors: authorDefault, phases.*.prefer,
    // optional phases.*.panelSize (per-phase floor override of
    // review.panelSize — the ONE floor concept, model-identity axis)
  }
}
```

**v2 → v3 crosswalk** (rev 5: **informative**, not a migration contract —
it documents where each old dial's meaning went, and guides hand-authoring
this repo's v3 config):

| v2 | v3 |
|---|---|
| `gates.brainstorm.mode` | `review.brainstorm` |
| `gates.plan_review.mode` / `gates.spec_review.mode` | `review.design` (+ `overrides.<track>`); per-gate same-track divergence is deliberately inexpressible (C2 — simplicity wins) |
| `gates.pr_review.mode` | `review.code` |
| `gates.*.minPanel`, `panels.phases.*.minVendor` | `review.panelSize` + optional per-phase `panels.phases.<phase>.panelSize` — one floor concept, model-identity axis; the vendor axis and its heuristic are retired |
| `taskValidation.mode` | `review.tasks` |
| `phases.mergePlanSpec` | `shape.separateSpec` (inverted) |
| `lifecycle.tracker.publishThreshold` | `shape.publishToTracker` |
| `tracks.defaultTrack` | `shape.defaultTrack` |
| `enforcement` | `review.onShortfall` |
| `lifecycle.profile`, `panels.rules.excludeAuthorVendor` | **deleted, no successor** (exclusion derives from floor ≥ 2, OL-A rule) |
| v2 "lifecycle block present" evidence opt-in | **no v3 key in this stream** — with no migrating population there is no bit to preserve; OL-B adds an optional `evidence` key additively when it ships enforcement (see OL plan amendment) |

Kernel safety carries over structurally: closed vocabulary, the merge gate
has no key, `defaultTrack` enum excludes `none`, `overrides` keys are
exactly `irreversible`/`reversible` (C6 — no configurable lane can express
`track: none`), and the reviewer × arbiter seam and the `automation`
reservation from OL-A are re-expressed on v3 (Spec enumerates where). In v3
the review/shape blocks are **always explicit** — the "absent lifecycle
block ⇒ implicit legacy semantics" special case is retired.

### 2. Runtime re-sourcing (same stream, atomic with the break)

`resolve-panel`, `check-lifecycle`, `setup-sdlc`, and `inspectConfig`
(`lib.mjs`) read v3 only; the vendor-axis `resolveVendor` branch and its
`vendor()` heuristic are deleted with `minVendor`. FS9 check ids, exit
sets, and the declaration grammar are **untouched this stream** (C4);
`sdlc-status` stays out except for its existing
`config.valid`/`config.schema-current` rides.

**Minimal prose re-pointing (C5):** IC-A also makes the smallest SKILL.md
edits required so every v3 key has a real reader — e.g. the tracker-backed
build section reads `shape.publishToTracker` instead of hardcoding "two or
more tasks", and the phase table defers to `review.*`/`shape.*` where it
currently states fixed ceremony. This is surgical substitution of constants
with committed values, **not** the OL-C kernel-first restructure, which
remains scoped out.

### 3. Clean break, no migration (rev 5)

There is **no v2→v3 migration path**. `migrate.mjs` (including the dormant
1→2 fold) and setup's migration plumbing are **deleted**; there is no
migrating population for either step. Consequences the Spec must bind:

- The schema-older remedy strings (`lib.mjs:28`) are reworded to stop
  promising an interactive migration: the sanctioned paths are re-running
  setup (fresh write or `--force`) or pinning the prior release. Honest
  reference text is FS11 law.
- **This repo hand-authors its v3 config in the same PR** as the code (or
  `sdlc-status` goes not-ready on the branch). Its values are chosen
  consciously at implement — including accepting the OL-A model-identity
  panel semantics (floor-capped panels; author exclusion by model identity,
  so e.g. an anthropic non-author model may sit on a PR panel) — and the PR
  body records that acceptance in one line.
- **Pre-adoption clean-break policy ADR**: until a first external adopter
  exists, config-schema breaks ship without migration tooling; the version
  pin is the escape hatch; breaks still ride package majors under ADR
  0021's guard. The policy expires at first external adoption.

### 4. Presets become answer bundles

solo/standard/full survive **only** inside setup as starting answer sets
(flag `--preset`, interview pre-fill), expanded to explicit v3 dials and
never persisted. The ratified #37 matrix values carry over, re-expressed in
v3 vocabulary. `custom` disappears as a word: not choosing a preset IS
custom. **Preset application to an existing valid v3 config patches only
the intent blocks (`review`, `shape`, `overrides`), preserving identity,
integration, and `panels` keys (C6)** — with a refusal-without-`--force`
guard when the patch would delete consumer-authored `overrides` (S7).
Whole-file `--force` replacement remains a separate, explicit act.

### 5. Self-explanation surface: generated `.pi/sdlc/CONFIG.md`

Setup (and a regeneration entry point) writes a companion doc rendered from
the actual values: per key — current value, what it makes the agent do, the
alternatives, and how to change it. The doc embeds a hash of the config it
was rendered from; drift is mechanically detected by a **standalone non-FS9
surface** (C4): `setup-sdlc --check-explain` (name final at Spec), offered
as an optional CI snippet. `check-lifecycle` gains no check id this stream;
OL-B may fold the drift check into FS9 v2 on ADR 0017's explicit-bump terms
later. The SKILL points agents at `CONFIG.md` before schema or source.

### 6. Agent-led setup interview

`templates/setup-sdlc.md` becomes the interview: it instructs the agent to
explain the kernel, what panel/advisory/human/off each mean in practice,
what tracks are, and then elicit essentially two decisions — **who reviews
designs?** and **who reviews code?** — with everything else defaulted and
explained rather than asked. The script keeps: complete non-interactive
flags for every dial, `--preset`, and a minimal headless TTY fallback (the
two core questions plus confirmation, not today's twelve-question quiz).

### 7. Governance artifacts

- New ADR: intent vocabulary v3 — profile deletion, single floor concept
  (model-identity axis, vendor axis retired), always-explicit shape.
- New ADR: pre-adoption clean-break policy (scope item 3).
- ADR 0022 revised: posture semantics unchanged, renamed/relocated to
  `review.onShortfall`.
- OL plan amendment (below) recorded as a rev-4 note on that doc.
- Release rides a package major (ADR 0021 CI guard: `CONFIG_SCHEMA_VERSION`
  bump + breaking signal via `BREAKING CHANGE:` footer — never the `!`
  shorthand, per ratified commit discipline).

## OL plan amendment (binding)

`docs/plans/2026-07-14-opt-in-lifecycle.md` rev 3 is amended:

1. **Scope item 3 (profiles) is superseded.** `profile` as persisted
   vocabulary and "non-destructive existing-adopter profile application" are
   dissolved. Preset application becomes the intent-block patch defined in
   scope item 4 above (C6/S7) — not whole-file `--force` reconstruction.
   OL-B's deferred profile-application deliverable is cancelled, not moved.
2. **OL-B re-bases on v3.** Shape-parameterised artifact demands read
   `shape.separateSpec`/track overrides instead of `mergePlanSpec`/`gates`.
   The Binding migration decision's item 1 ("evidence demanded only when a
   lifecycle block is present") is **re-decided at OL-B Spec** (rev 5):
   with no migrating v2 population the presence-bit has no meaning to
   preserve; the working proposal is an optional additive `evidence` key
   whose absence means not-opted-in.
3. **OL-C documents v3 only.** The SKILL restructure's config-interpreter
   section describes intent dials and `CONFIG.md`, never the v2 gate matrix.
   IC-A's minimal prose re-pointing (scope item 2) is a floor OL-C builds
   on, not a partial delivery of the restructure.
4. Everything else in the OL plan (kernel text, evidence ladder, standalone
   entrypoints, shape-of-record) stands unchanged.

Sequencing: **this stream lands before OL-B starts.**

## Sub-change decomposition (binding on Spec)

Two independently gated sub-changes, in dependency order:

- **IC-A — the vocabulary break**: schema v3 + validator + runtime
  re-sourcing (resolve-panel, check-lifecycle config read, setup
  flags/presets/patch, minimal SKILL prose re-pointing) + deletion of
  `migrate.mjs` and migration plumbing + remedy-string rewording + this
  repo's hand-authored v3 config + ADRs. One atomic schema break.
- **IC-B — the self-explaining surface**: `CONFIG.md` generator +
  standalone drift check + agent-led interview template + script interview
  reduction. Depends on IC-A's vocabulary.

## Scope out (explicitly not this stream)

- **Any migration tooling** (rev 5): no v2→v3 fold, no refusal taxonomy, no
  equivalence proofs; the pin is the only backward path.
- **Proportionate ceremony / O9** (effort-scaled panel sizing, `dynamic`
  posture): v3 is deliberately a friendlier substrate for it (a future
  `review.sizing` dial is enum growth), but nothing of it ships here.
- **OL-B and OL-C content** (checker v2, evidence surface incl. the
  `evidence` key, SKILL kernel-first restructure, standalone entrypoints) —
  re-based by amendment, delivered in their own stream.
- **FS9 changes of any kind** — no new check ids, no schema bump (C4).
- Map #43 automation/intake; `lifecycle.automation`'s reservation
  re-expressed on v3, nothing more.
- FS8 `sdlc-status` behaviour changes.
- The tune-command UX for post-adoption dial changes (`CONFIG.md` tells you
  what to edit; a guided tune command stays deferred map fog).
- Any change to prompts, panel mechanics, or the PV1/PV2 validator contract.

## Definition of done (falsifiable)

1. **No vestigial keys or code:** `profile`, `minVendor`,
   `excludeAuthorVendor`, and the vendor heuristic appear nowhere in
   `skills/sdlc/` runtime read paths; `migrate.mjs` does not exist;
   falsifiable by the Spec's syntax-aware purge scenario with its
   enumerated allowlist (retired-flag diagnostics, fixtures).
2. **Every key is load-bearing:** the Spec carries a key → reader audit
   table for every v3 key; each row names a mechanical reader
   (script:line) or a prose-law reader (SKILL sentence reading the
   committed value — C5); a key with neither fails the Spec gate.
   `shape.publishToTracker` specifically gains its prose-law reader via the
   IC-A re-pointing.
3. **The break is honest:** a v1/v2 config under the v3 skill is refused
   with remedy text that names only paths that exist (re-run setup, pin) —
   never a migration; `sdlc-status` reports not-ready with the same honest
   remedy; no reader ever mutates an old config.
4. **This repo runs on v3:** its hand-authored config is committed in the
   same PR, `inspectConfig`-clean, `sdlc-status` ready; forward-only
   `resolve-panel` fixtures pin the expected panels for its committed
   values (all-credential simulation), and the PR body records the accepted
   OL-A panel-semantics change in one line.
5. **Kernel negative fixtures:** `overrides.none` (C6), a `review`-block
   merge-gate key, and `shape.defaultTrack: none` each fail `config.valid`
   with exit 2.
6. **Self-explanation:** `CONFIG.md` is generated from values, hash-bound to
   the config, and drift is mechanically detected by the standalone check;
   a hand-edited config with a stale `CONFIG.md` fails that check with a
   message naming the regeneration command. No FS9 check id exists for it.
7. **Interview:** the setup template instructs an agent-led explanatory
   interview; the script's TTY fallback asks at most the two core decisions
   plus confirmation; every dial remains reachable non-interactively by
   flag. Falsifiable: the template names each concept it must explain;
   the script's question count is asserted in tests.
8. **Governance:** v3 ADR + clean-break policy ADR committed; ADR 0022
   revised; OL plan rev-4 amendment note committed; the release PR carries
   the breaking signal and the CI schema-break guard passes.

## Risks

- **In-flight telemetry stream churn:** feat/sdlc-lifecycle-telemetry
  (lt-t2…lt-t8) touches `skills/sdlc/scripts/`; lt-t2 (FS5 side-effect
  emission) will embed `record-run-event` call sites **inside**
  `resolve-panel.mjs`/`check-lifecycle.mjs`/`setup-sdlc.mjs` — the same
  files IC-A rewrites (C7). Merge-order contract: whichever stream lands
  second re-seeds the other's embedded call sites as part of its rebase,
  verified by the telemetry stream's own scenario suite; IC-A does not
  touch `telemetry.mjs` itself.
- **Stealth adopters:** the repo is public; an unknown adopter would hit
  the clean break. Mitigated by the pin (their config keeps working on
  their pinned release), the honest remedy text, and the clean-break
  policy ADR stating the posture openly. Accepted residual risk.
- **Hand-authored config drift from intent:** the repo's v3 values are
  chosen once by the owner; a wrong dial is cheap to change (that
  directness is the point of v3), and IC-B's `CONFIG.md` makes the values
  legible immediately after.

## Definition-of-done ↔ scenario convention

Spec scenario ids: `ICA<n>` / `ICB<n>` per sub-change; each spec must
satisfy kernel invariant 2 about itself. Scenario ids retired by rev 5 stay
retired (never reused).

## Context for the next agent (Spec phase)

- Authoritative inputs, in order: this plan (rev 5); the consolidated plan
  and spec reviews under `docs/reviews/`; the OL plan rev 3 + its amendment
  section here; ADRs 0021/0022; the grounded code references in Rationale.
- Spec-phase decisions explicitly left open: exact schema (required vs
  optional split, per-phase `panelSize` override grammar); the drift-check
  entry-point name; the exact TTY-fallback question wording; this repo's
  hand-authored dial values (owner's call at implement, recorded in the PR).
- The crosswalk table in scope item 1 is informative documentation; the
  Spec's schema section is the binding contract.

## Absorption note — IC-B absorbed by agent self-documentation (2026-07-18)

IC-B (scope items 5/6 of this plan: the generated consumer `CONFIG.md`, the
deterministic drift check, the agent-led setup interview, and the reduced TTY
fallback) is **fully absorbed** by the agent self-documentation stream
(`docs/plans/2026-07-18-sdlc-agent-self-documentation.md`, rev 2; spec rev 2,
scenarios ASD1–ASD20). IC-B does **not** ship as a separate stream; that stream
is the canonical owner of the `config-doc` render/write/check module, the
`.pi/sdlc/CONFIG.md` contract, and the setup interview. Prior IC-B disposition
work is preserved here as review input, not copied verbatim. See **ADR 0029** for
the documentation-authority hierarchy and generated-explanation trust model.
Issues **#91/#101/#102** remain independent and out of scope.
