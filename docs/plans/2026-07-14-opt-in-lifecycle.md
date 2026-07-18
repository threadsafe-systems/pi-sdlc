# Plan: the opt-in lifecycle (kernel, profiles, lanes-ready config)

> **rev-4 amendment (2026-07-17, config-intent-vocabulary stream).** This plan
> is amended by `docs/plans/2026-07-17-config-intent-vocabulary.md` (rev 5).
> The persisted `lifecycle`/`profile` vocabulary of scope item 3 is superseded
> by the schemaVersion-3 intent vocabulary (`review`/`shape`/`overrides`;
> ADR 0026); `profile` and the deferred existing-adopter profile-application
> deliverable are **cancelled, not moved**. OL-B re-bases on v3 (shape-
> parameterised demands read `shape.separateSpec`/track overrides; the evidence
> opt-in is re-decided at OL-B Spec as an optional additive `evidence` key,
> since the clean break (ADR 0027) leaves no v2 block-presence bit to
> preserve). OL-C documents v3 only. Read that plan as canonical where the two
> disagree.

- Date: 2026-07-14 (rev 3 — rev 2 incorporated the plan panel's 14 findings
  (`docs/reviews/plan-review-opt-in-lifecycle-2026-07-14/consolidated.md`);
  rev 3 is an owner-directed backward amendment at the OL-A spec gate: the
  panel diversity floor moves from vendor to **model identity**, vendor is
  dropped from the vocabulary entirely — see the amendments on #36/#37)
- Track: **irreversible** (freezes the `lifecycle` config vocabulary consumers
  commit to, widens the FS9 **checker** contract to schemaVersion 2 — the
  declaration grammar v1 is frozen and does NOT widen — and rewords ratified
  kernel text the skill's brand rests on)
- Brainstorm: map issue
  [#34](https://github.com/threadsafe-systems/pi-sdlc/issues/34) —
  decision-ready 2026-07-14; eight tickets (#35–#42) closed, four post-closure
  future-proofing amendments ratified (recorded on #35, #36, #41). The map is
  canonical for brainstorm-phase decisions until this document; this document
  is canonical from here.
- Related map (independent, not delivered here):
  [#43](https://github.com/threadsafe-systems/pi-sdlc/issues/43)
  orchestrator-led automation / intake contract. This plan must not foreclose
  it; see "Compatibility constraints".

## Objective

Make the full sdlc opt-in rather than edict, without weakening what it
guarantees: separate the **invariant kernel** (the traceability chain any
reviewer can independently verify — intent → falsifiable scenario → evidenced
check → human-authorised merge) from the **enforcement scaffolding** (panels,
phase separation, tracker ceremony, validator subagents), and make the
scaffolding committed, checkable configuration with named profiles — so a
sceptical developer can adopt at `solo` strength, a team at `standard`, and
this repo at `full`, all honestly checkable, all under one law: **you may not
skip forward past your own committed shape.**

## Rationale (why this, why now)

- The skill's real product is the kernel; the maximal enforcement shape is
  presented as identity, which reads "not for me" to anyone wanting 60% of it.
  There is currently no legitimate 60%.
- Config today tunes names and integrations, not process shape; prose floors
  ("at least two distinct vendors") overlap ambiguously with `min_panel`; a
  one-key solo developer cannot run the irreversible track at all.
- Epic #18 (FS9/FS10) shipped the declaration-dominates checker contract this
  widening was designed to extend; its ADR-sanctioned evolution path (FS9
  schemaVersion bump) is now open.
- Map #43 established the forward direction (unattended delivery as declared
  policy); the ratified future-proofing clauses must land in the same stream
  that introduces the config, or the config ships with the seams welded shut.

## Dependencies

- **Epic #18 shipped** (closed before this plan was drafted; FS9 v1 checker,
  FS10 bundle, and fixtures are in the tree). This stream is its designated
  successor and extends its shipped surface on the ADR-sanctioned paths. Any
  post-merge defect fix to #18's surfaces discovered during this stream
  requires re-checking this plan's compatibility constraints before Spec
  work continues.

## Binding migration decision (adjudicated at plan review)

The panel unanimously found the original "absent block ⇒ byte-for-byte, AND
v2 enforces evidence checks" pair self-contradictory (a repo with committed
PV1 manifests and no `evidence.channels.json` — this repo, today — would flip
from pass to fail; and the v2 envelope necessarily changes bytes). The binding
resolution, refining #36/#40/#41's overlapping phrasings:

1. **The `lifecycle` block is the v2 opt-in switch for the evidence surface.**
   `evidence.manifest` / `evidence.scenarios` / `evidence.channels` are
   demanded **only when a `lifecycle` block is present** in the committed
   manifest. Adding the block *is* adopting the evidence obligations —
   consistent with "your own committed shape". A repo with no block gets v1
   *demands* exactly (no evidence checks, v1 artifact table).
2. **"Byte-for-byte" is scoped to semantics, not envelope.** On a no-block
   repo, the v2 checker produces **semantically identical results** (same
   check ids, same statuses, same exit codes) as v1; the JSON envelope gains
   `schemaVersion: 2` and the `shape` field, and the text output gains a
   `shape:` header, per ADR 0017's sanctioned bump. "Byte-for-byte" continues
   to hold for the *dial semantics* (gates, panels, thresholds, validation).
3. **Fixture disposition is explicit, not vibes:** existing FS9 v1 fixtures
   remain green unmodified **where they assert semantics** (states, statuses,
   exits, messages); fixtures asserting the envelope (`schemaVersion`, full
   JSON shape) are updated once, mechanically, as part of the v2 golden set —
   enumerated in the Spec, never silently.
4. **The `__PI_SDLC_REF__` pin remains the consumer migration switch**: a
   v1-pinned consumer keeps v1 behaviour entirely; re-running setup bumps the
   pin.

## What this delivers (scope in)

1. **The kernel, as amended** (#35 + amendment): the six-invariant text —
   including the reworded item 4 ("a human-free lane exists only by explicit,
   declared, evidence-gated policy; v1 defines exactly one: `track: none`";
   arbitration "never disappears, only changes tense") — becomes the skill's
   leading section and the boundary every other deliverable is validated
   against.
2. **The `lifecycle` config block** (#36 + amendments): one optional top-level
   key in `.pi/sdlc/sdlc.config.json` (FS1-additive; schemaVersion stays 1).
   Absent block ⇒ today's dial semantics byte-for-byte (see Binding migration
   decision for the envelope caveat). Dials: per-gate `mode`
   (`panel` | `advisory` | `human` | `off`, optionally per-track), per-gate
   `minPanel`, `phases.mergePlanSpec`,
   `tracker.publishThreshold`, `taskValidation.mode`, `tracks.defaultTrack`
   (`none` excluded by enum). Kernel safety is structural (closed vocabulary;
   the merge gate has no key). **Panel diversity is model-identity based
   (rev 3)**: `minPanel` is the single floor — ≥ minPanel **distinct
   models**, identity = `provider/model` with the `:thinking` suffix
   stripped, version-strict (`opus-5.4` ≠ `opus-5.6`); no vendor dial,
   dedupe, or tie-break exists anywhere. Author exclusion is author-model,
   active at `minPanel >= 2`. Panel floors for the three review gates are
   single-sourced here; `sdlc.models.json` `min_panel` is deprecated-with-
   notice (FS2 untouched this stream). **`task_validate` floor rule** (it is
   not a `gates` key): when the block is present and `taskValidation.mode` is
   `subagent` or `self`, `resolve-panel task_validate` uses a fixed floor of
   1 model, ignoring the models-file `min_panel` with the same
   deprecation notice; when `off`, `resolve-panel` is never invoked for
   `task_validate`. Future-proofing carried: gate `mode` modelled as
   reviewer × arbiter with the panel/blocking/mechanically-adjudicated
   quadrant as the designated additive extension point; `lifecycle.automation`
   reserved by schema `$comment`.
3. **Profiles** (#37): **three named presets** — `solo`/`standard`/`full` —
   expanded by setup into explicit dials, plus **`custom`, which is not a
   preset**: the interview walks every dial hand-picked (`profile: custom` is
   recorded provenance, with no pinned expansion). Setup gains the profile
   question, pre-selecting `standard`. The ratified matrix is authoritative
   (see #37 resolution): `solo` = brainstorm off, merged plan+spec, human plan
   gate, **advisory** PR review (minPanel 1), tracker never, self-run task
   validation; `standard` = merged plan+spec, human design gates, PR panel of
   2 distinct models, subagent validation, tracker threshold 4; `full` =
   the maximal preset (design + PR panels of 2 distinct models — this
   repo's own committed `pr_review` floor of 3 exceeds the preset and is
   its preference to carry at application time, not the shipped floor).
   **Existing
   adopters get a non-destructive path**: setup can apply a selected profile
   to an existing *valid* manifest by adding/replacing only the `lifecycle`
   key, preserving all other consumer-owned config (paths, tracker, hooks),
   within FS10's refusal semantics — no whole-file `--force` reconstruction
   required. (The richer tune-command UX stays deferred per map fog.)
4. **Standalone entrypoints** (#38): all six phases invocable
   (`sdlc:brainstorm/plan/spec/tasks/implement/pr-review`; the "build"
   *surface* renamed `tasks` — internal phase name, `*-build.md` artifact
   suffix, tracker labels, hook key, and asset names such as
   `assets/tracker-backed-build.md` deliberately stay "build" per #38).
   Honest degradation split: stamp-and-interview (`spec` only, unadopted
   only; single unparsed prose stamp line) vs always-refuse-with-redirect
   (`tasks`/`implement`; never fabricate scenario ids).
   Adopted-config-dominates as a binary switch on manifest presence.
   `pr-review` offers an optional skippable grounding prompt and reuses
   `adversarial-review` mechanics; **its small fixed panel default applies
   only when unadopted** (no committed config to read floors from) — in an
   adopted repo it runs as the configured `pr_review` gate at the committed
   mode and floors, never below them.
5. **Evidence ladder** (#41 + amendment): committed
   `docs/validation/<slug>/evidence.channels.json` (slug-derived, HEAD-read);
   channels `ci` → `agent` (existing receipt dirs + one scenario-PASS
   cross-check) → `attested` (inline rows, permanently labelled UNVERIFIED);
   non-blocking `recommendation:` nudges; rung choice never changes exit
   codes; `sdlc-status` stays frozen and out of it. Channel-floor-as-lane-
   property carried as a load-tested scenario. **The ratified setup-report
   nudge line** (`recommendation: ci-workflow — …`) is an FS10 report
   addition and therefore ships via an **explicit FS10 schema-version bump
   with migration, revising ADR 0018** — never as a silent mutation of the
   frozen v1 report.
6. **FS9 checker schemaVersion 1 → 2** (#40, #42): the checker consumes the
   `lifecycle` block from its existing `config.valid` parse (the PR
   declaration grammar does NOT widen); artifact demands become a function of
   `(track, mergePlanSpec)`; report gains a `shape` field disclosing the
   judged-under shape; new appended check ids `evidence.manifest`,
   `evidence.scenarios`, `evidence.channels` **with the #41 applicability
   rules** (all three skip for `track: none`; on the reversible track,
   demanded only when the committed PV1 `ownedScenarios` union is non-empty;
   demanded only when a `lifecycle` block is present, per the Binding
   migration decision). The optional `artifact.scenarios` content check ships
   only if the Spec ratifies a pinned scenario-id pattern — a Spec-phase
   decision. **Shape-of-record:** every PR judged under the shape at the
   **base-branch tip**, never its own HEAD; non-blocking disclosure when they
   differ; error-not-fallback on an unreadable base. **Named dependencies of
   that rule:** (a) the checker gains a base-ref input in CI/event mode
   (extracted from the event payload); (b) the shipped workflow and setup's
   `ci-workflow` asset must fetch the base ref (the current bare
   `actions/checkout@v4` is depth-1 and cannot see the base tip) — a
   consumer-owned-file change handled on ADR 0020's terms, taught by setup;
   (c) **local modes** (`--body`/flags, no event) judge under the HEAD shape
   and print a fixed disclosure that CI judges under the base tip — local is
   the pre-PR convenience check, CI is authoritative. A `lifecycle`-block
   change is irreversible-by-convention (mechanical enforcement is a
   Spec-phase question). Exit set unchanged.
7. **SKILL.md restructure** (#39 draft as input, not verbatim): kernel-first;
   "your project's shape" config-interpreter section; today's prescriptive
   text preserved as documented `full`-profile semantics; map mode +
   tracker-backed build extracted to assets (`assets/map-mode.md`,
   `assets/tracker-backed-build.md`, plus new `assets/lifecycle-config.md`,
   `assets/evidence-ladder.md`); red flags rewritten profile-relative. The
   #39 disposition ledger (nothing silently dropped) is the review baseline.

## Spec decomposition (sequencing, binding on the Spec phase)

The prior stream's panel forced a decomposition for a smaller surface; this
stream decomposes up front into **three independently gated sub-changes**,
each with its own Spec (and spec panel), in dependency order:

- **OL-A — config vocabulary and resolution**: the `lifecycle` schema +
  validator (reviewer × arbiter modelling, `$comment` reservation), profile
  presets + `custom` interview, setup profile question + non-destructive
  existing-adopter application, `resolve-panel` floor sourcing (incl. the
  `task_validate` rule). No checker changes.
- **OL-B — the v2 checking surface**: FS9 schemaVersion 2 (shape-
  parameterised artifact demands, `shape` field, base-branch-tip
  shape-of-record + workflow fetch + local-mode rule), the evidence surface
  (`evidence.channels.json` format + three check ids + applicability), the
  FS10 report bump for the setup nudge (ADR 0018 revision), fixture
  disposition per the Binding migration decision. Depends on OL-A's schema.
- **OL-C — the skill surface**: SKILL.md restructure + four assets +
  standalone entrypoints + adopted-config-dominates behaviour. Depends on
  OL-A (vocabulary) and OL-B (what the checker actually enforces, so prose
  never overclaims).

One epic tracks the stream; each sub-change is spec'd and gated separately;
tasks publish per the tracker threshold as usual.

## Scope out (explicitly not this stream)

- **Anything from map #43**: the intake lint/panel, budget/escalation
  binding, graduation ledgers, any `delegated` lane, any unbundled gate-mode
  *value*. This stream only reserves their seams.
- **Custom lane taxonomy** (`tracks.lanes`, FS9 grammar v2 declaration
  widening) — deferred at #36 Q5, confirmed at #37.
- **FS2 (`sdlc.models.json`) schema bump** — `min_panel` is deprecated with a
  notice, not removed; FS2 v2 is a later change under ADR 0002's own path.
- **FS8 `sdlc-status`** — frozen, byte-identical (the `lifecycle` block rides
  its existing `config.valid` check).
- **The loosening ratchet** (committed rationale on dial-down) — deferred at
  #42; safe because base-shape judging neutralises self-benefiting loosening.
- **Phase-terminology rename** ("Build vs Implement") — deferred fog on #34.
- **Advisory-finding persistence policy** beyond what panels already save to
  `docs/reviews/` — open fog, not blocking (advisory mode records findings as
  recommendations in the existing consolidated artifact).
- **The tune-command UX** for adjusting dials post-adoption — deferred map
  fog; this stream ships only the minimal non-destructive profile
  application in setup (scope item 3).

## Definition of done

1. **Non-regression (semantic):** a repo with no `lifecycle` block produces
   semantically identical results as today across `check-lifecycle` (same
   check ids, statuses, exits — envelope gains `schemaVersion: 2` + `shape`
   per the Binding migration decision), `resolve-panel`, `setup-sdlc`, and
   the skill prose. Falsifiable: FS9 v1 fixtures asserting semantics stay
   green unmodified; the enumerated envelope-asserting fixtures are updated
   once as v2 goldens, and no other fixture changes.
2. `setup-sdlc` interviews for a profile (default `standard`) and writes a
   fully-expanded, valid `lifecycle` block; the **three presets** round-trip
   through `inspectConfig` with zero issues, and a representative hand-picked
   `custom` shape validates equally; applying a profile to an existing valid
   manifest replaces only the `lifecycle` key and preserves all other config.
3. A kernel-probing config (e.g. `gates.merge`, `defaultTrack: none`, unknown
   dial) can never produce a passing check: `config.valid` → error → exit 2.
4. `check-lifecycle` v2, on a shaped repo: demands artifacts per
   `(track, mergePlanSpec)`; reads the shape from the **base-branch tip** in
   CI/event mode (base ref from the event payload; the shipped workflow
   fetches it) with the disclosure line on divergence and error-not-fallback
   on an unreadable base; local modes judge under HEAD with the fixed
   disclosure; reports the `shape` field; enforces
   `evidence.manifest`/`evidence.scenarios`/`evidence.channels` **per the
   #41 applicability rules** (skip for `track: none`; reversible demanded
   only on non-empty PV1 union; only when a `lifecycle` block is present),
   with `attested` rows rendering UNVERIFIED and rung choice never changing
   exit codes.
5. `resolve-panel` takes the three review-gate floors from the `lifecycle`
   block when present (ignoring `min_panel` with a notice), enforces the
   distinct-model floor with effort-suffix-insensitive, version-strict
   identity, applies author-model exclusion (active at `minPanel >= 2`, off
   at `minPanel: 1`), and applies the `task_validate` rule from scope item 2
   (fixed 1-model floor under `subagent`/`self`; never invoked under `off`).
6. The restructured SKILL.md ships with the #39 disposition ledger satisfied:
   every current normative statement kept, moved to a named asset, or
   re-expressed as `full`-profile semantics — none dropped; the kernel section
   carries the amended item-4 text.
7. Standalone entrypoints behave per the #38 table (stamp-and-interview vs
   refuse-with-redirect; adopted-config-dominates), falsifiably: a `tasks`
   invocation with no committed scenario ids refuses in both adopted and
   unadopted repos; an adopted repo's `sdlc:pr-review` runs at the committed
   `pr_review` mode and floors (the fixed default is unreachable when a
   manifest is present).
8. **Gate-mode structure is falsifiably future-proof:** the gate-mode
   validator decomposes reviewer × arbiter such that adding the
   panel-reviewed/blocking/mechanically-adjudicated value is enum growth (a
   validator change), not a remodel, and `panel`'s human-approval coupling
   lives only in `panel`'s own semantics — verified by a Spec scenario, not
   prose.
9. Surface evolution is recorded on the sanctioned paths: ADR 0017 revision
   for FS9 v2; an explicit FS10 schema-version bump + ADR 0018 revision for
   the setup-report nudge line; a new ADR for the evidence disclosure
   surface; and the four future-proofing clauses appear verbatim in the
   shipped artifacts they bind (kernel text, schema `$comment`, channel-floor
   spec scenario).

## Risks

- **Solo profile still needs one live credential**: `advisory` PR review
  (minPanel 1) requires at least one model with credentials; setup's profile step
  should say so rather than let the first review fail cold.
- **Envelope-fixture churn**: the v2 golden update (Binding migration
  decision, item 3) is a one-time mechanical change but touches the prior
  stream's test surface; the Spec must enumerate every touched fixture so
  the diff is reviewable as "envelope only".
- **Consumer workflow drift**: base-ref fetching lives in a consumer-owned
  file (ADR 0020); consumers who hand-edited their workflow may miss the
  fetch and hit error-not-fallback. Mitigation: the checker's unreadable-base
  error message names the fix (fetch instruction), and setup's upgrade path
  re-stamps the workflow.

## Compatibility constraints (binding on Spec and Tasks)

- **Extend, never fork, the shipped FS9/FS10:** v1 check ids preserved
  verbatim and appended to; exit set unchanged; declaration grammar v1
  untouched; `__PI_SDLC_REF__` pin is the consumer migration switch; fixture
  disposition per the Binding migration decision.
- **Map #43 must remain buildable on top without kernel amendment:** the
  reviewer × arbiter seam, the `lifecycle.automation` reservation, the
  channel-floor scenario, and amended kernel item 4 are non-negotiable
  carry-throughs.
- **Tracker is projection; docs are canonical** — unchanged and out of reach
  of every dial.

## Context for the next agent (Spec phase)

- Authoritative inputs, in order: this plan (rev 2); the consolidated plan
  review (`docs/reviews/plan-review-opt-in-lifecycle-2026-07-14/`); the
  #35–#42 resolution comments (each ticket carries its full adjudicated
  detail); the three amendment comments (#35, #36, #41); the #39 draft +
  disposition ledger; the #36/#40/#41 research briefs (accepted,
  spot-checked).
- Spec-phase decisions explicitly left open by the map and this plan: the
  `artifact.scenarios` pinned pattern (ship/drop); mechanical enforcement of
  lifecycle-change ⇒ irreversible; the exact stamp-line wording; the
  standalone `pr-review` fixed panel default **value** (its unadopted-only
  applicability is already decided).
- The scenario-id convention for this stream's specs: `OLA<n>`/`OLB<n>`/
  `OLC<n>` per sub-change — falsifiable, stable, and each spec must satisfy
  kernel invariant 2 about itself.

## Absorption note — OL-C absorbed by agent self-documentation (2026-07-18)

OL-C (scope items 4/7 of this plan plus issue #38's ratified entrypoint contract:
the kernel-first `SKILL.md` surface, the supporting package references, the six
standalone `sdlc:<slug>` entrypoints, and adopted-config-dominates) is **fully
absorbed** by the agent self-documentation stream
(`docs/plans/2026-07-18-sdlc-agent-self-documentation.md`, rev 2; spec rev 2,
scenarios ASD1–ASD20). OL-C does **not** ship as a separate stream; that stream
carries forward #38's exact entrypoint table, stamp text, adopted-config detection
rule, and `adversarial-review` relationship rather than re-deciding them. See
**ADR 0029** for the documentation-authority hierarchy. Issues **#91/#101/#102**
remain independent and out of scope.
