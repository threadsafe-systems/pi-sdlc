# Plan: the opt-in lifecycle (kernel, profiles, lanes-ready config)

- Date: 2026-07-14
- Track: **irreversible** (freezes the `lifecycle` config vocabulary consumers
  commit to, widens the FS9 declaration/checker contract to schemaVersion 2,
  and rewords ratified kernel text the skill's brand rests on)
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

## What this delivers (scope in)

1. **The kernel, as amended** (#35 + amendment): the six-invariant text —
   including the reworded item 4 ("a human-free lane exists only by explicit,
   declared, evidence-gated policy; v1 defines exactly one: `track: none`";
   arbitration "never disappears, only changes tense") — becomes the skill's
   leading section and the boundary every other deliverable is validated
   against.
2. **The `lifecycle` config block** (#36 + amendments): one optional top-level
   key in `.pi/sdlc/sdlc.config.json` (FS1-additive; schemaVersion stays 1).
   Absent block ⇒ today's full shape **byte-for-byte**. Dials: per-gate `mode`
   (`panel` | `advisory` | `human` | `off`, optionally per-track), per-gate
   `minPanel`/`minVendors`, `phases.mergePlanSpec`,
   `tracker.publishThreshold`, `taskValidation.mode`, `tracks.defaultTrack`
   (`none` excluded by enum). Kernel safety is structural (closed vocabulary;
   the merge gate has no key). Panel floors single-sourced here;
   `sdlc.models.json` `min_panel` deprecated-with-notice (FS2 untouched this
   stream). Future-proofing carried: gate `mode` modelled as reviewer ×
   arbiter with the panel/blocking/mechanically-adjudicated quadrant as the
   designated additive extension point; `lifecycle.automation` reserved by
   schema `$comment`.
3. **Profiles** (#37): `solo`/`standard`/`full`/`custom` presets expanded by
   setup into explicit dials (`profile` is provenance-only). Setup gains the
   profile question, pre-selecting `standard`. The ratified matrix is
   authoritative (see #37 resolution): `solo` = brainstorm off, merged
   plan+spec, human plan gate, **advisory** PR review 1/1, tracker never,
   self-run task validation; `standard` = merged plan+spec, human design
   gates, PR panel 2/2, subagent validation, tracker threshold 4; `full` =
   today, unchanged.
4. **Standalone entrypoints** (#38): all six phases invocable
   (`sdlc:brainstorm/plan/spec/tasks/implement/pr-review`; the "build"
   *surface* renamed `tasks`, internal phase name/artifacts/labels/hook key
   unchanged). Honest degradation split: stamp-and-interview (`spec` only,
   unadopted only; single unparsed prose stamp line) vs
   always-refuse-with-redirect (`tasks`/`implement`; never fabricate scenario
   ids). Adopted-config-dominates as a binary switch on manifest presence.
   `pr-review` offers an optional skippable grounding prompt and reuses
   `adversarial-review` mechanics minus the profile floor.
5. **Evidence ladder** (#41 + amendment): committed
   `docs/validation/<slug>/evidence.channels.json` (slug-derived, HEAD-read);
   channels `ci` → `agent` (existing receipt dirs + one scenario-PASS
   cross-check) → `attested` (inline rows, permanently labelled UNVERIFIED);
   non-blocking `recommendation:` nudges; rung choice never changes exit
   codes; `sdlc-status` stays frozen and out of it. Channel-floor-as-lane-
   property carried as a load-tested scenario.
6. **FS9 schemaVersion 1 → 2** (#40, #42): the checker consumes the
   `lifecycle` block from its existing `config.valid` parse (the PR
   declaration grammar does NOT widen); artifact demands become a function of
   `(track, mergePlanSpec)`; report gains a `shape` field disclosing the
   judged-under shape; new appended check ids `evidence.manifest`,
   `evidence.scenarios`, `evidence.channels` (the optional
   `artifact.scenarios` content check ships only if the Spec ratifies a
   pinned scenario-id pattern — a Spec-phase decision). **Shape-of-record:**
   every PR judged under the shape at the **base-branch tip**, never its own
   HEAD; non-blocking disclosure when they differ; error-not-fallback on an
   unreadable base. A `lifecycle`-block change is irreversible-by-convention
   (mechanical enforcement is a Spec-phase question). Exit set unchanged.
7. **SKILL.md restructure** (#39 draft as input, not verbatim): kernel-first;
   "your project's shape" config-interpreter section; today's prescriptive
   text preserved as documented `full`-profile semantics; map mode +
   tracker-backed build extracted to assets (`assets/map-mode.md`,
   `assets/tracker-backed-build.md`, plus new `assets/lifecycle-config.md`,
   `assets/evidence-ladder.md`); red flags rewritten profile-relative. The
   #39 disposition ledger (nothing silently dropped) is the review baseline.

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

## Definition of done

1. A repo with **no** `lifecycle` block behaves byte-for-byte as today across
   `check-lifecycle` (v2), `resolve-panel`, `setup-sdlc`, and the skill prose
   (the non-regression floor; falsifiable via existing FS9 v1 fixtures
   remaining green unmodified).
2. `setup-sdlc` interviews for a profile (default `standard`) and writes a
   fully-expanded, valid `lifecycle` block; all four presets round-trip
   through `inspectConfig` with zero issues.
3. A kernel-probing config (e.g. `gates.merge`, `defaultTrack: none`, unknown
   dial) can never produce a passing check: `config.valid` → error → exit 2.
4. `check-lifecycle` v2, on a shaped repo: demands artifacts per
   `(track, mergePlanSpec)`; reads the shape from the **base-branch tip** in
   CI mode with the disclosure line on divergence and error-not-fallback on
   an unreadable base; reports the `shape` field; enforces
   `evidence.manifest`/`evidence.scenarios`/`evidence.channels` with
   `attested` rows rendering UNVERIFIED and rung choice never changing exit
   codes.
5. `resolve-panel` takes floors from the `lifecycle` block when present
   (ignoring `min_panel` with a notice), supports `minVendors <` `minPanel`,
   and keeps author-vendor exclusion coherent at `minVendors: 1`.
6. The restructured SKILL.md ships with the #39 disposition ledger satisfied:
   every current normative statement kept, moved to a named asset, or
   re-expressed as `full`-profile semantics — none dropped; the kernel section
   carries the amended item-4 text.
7. Standalone entrypoints behave per the #38 table (stamp-and-interview vs
   refuse-with-redirect; adopted-config-dominates), falsifiably: a `tasks`
   invocation with no committed scenario ids refuses in both adopted and
   unadopted repos.
8. The FS9 v2 / evidence surface changes are recorded as ADRs on their
   sanctioned evolution paths (ADR 0017 revision for FS9 v2; a new ADR for
   the evidence disclosure surface), and the four future-proofing clauses
   appear verbatim in the shipped artifacts they bind (kernel text, schema
   `$comment`, spec scenario for the channel floor).

## Compatibility constraints (binding on Spec and Tasks)

- **Extend, never fork, the shipped FS9/FS10:** v1 check ids preserved
  verbatim and appended to; exit set unchanged; declaration grammar v1
  untouched; `__PI_SDLC_REF__` pin is the consumer migration switch; FS9 v1
  fixtures stay green unmodified.
- **Map #43 must remain buildable on top without kernel amendment:** the
  reviewer × arbiter seam, the `lifecycle.automation` reservation, the
  channel-floor scenario, and amended kernel item 4 are non-negotiable
  carry-throughs.
- **Tracker is projection; docs are canonical** — unchanged and out of reach
  of every dial.

## Context for the next agent (Spec phase)

- Authoritative inputs, in order: this plan; the #35–#42 resolution comments
  (each ticket carries its full adjudicated detail); the three amendment
  comments (#35, #36, #41); the #39 draft + disposition ledger; the #36/#40/
  #41 research briefs (accepted, spot-checked).
- Spec-phase decisions explicitly left open by the map: the
  `artifact.scenarios` pinned pattern (ship/drop); mechanical enforcement of
  lifecycle-change ⇒ irreversible; the exact stamp-line wording; the
  standalone `pr-review` fixed panel default.
- The scenario-id convention for this stream's own spec: continue `OL<n>`-style
  ids (or the house `AB`-style with a fresh prefix) — falsifiable, stable,
  and the spec must satisfy kernel invariant 2 about itself.
