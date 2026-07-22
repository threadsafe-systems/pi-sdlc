# Plan: review-gate config model — `validate` × `approve` decomposition (schemaVersion 4)

- Date: 2026-07-22 (rev 2)
- Revision history: rev 1 pre-panel draft. rev 2 incorporated all 6
  consolidated plan-panel findings
  (`docs/reviews/plan-review-review-gate-config-model-2026-07-22/consolidated.md`);
  the one disputed finding (H2, clean-break vs ADR 0027) was owner-adjudicated by
  Neil on 2026-07-22 — Case is co-owned dogfood, not an external adopter, so the
  clean break stands with ADR 0027 amended and a coordinated Case re-author.
- Track: **irreversible** (breaks the persisted `sdlc.config.json` shape
  consumers commit to: the `review.design`/`review.code` gate dials change from
  a scalar enum to an object; `schemaVersion 3 → 4`; rides a package major).
- Issue: [#150](https://github.com/threadsafe-systems/pi-sdlc/issues/150),
  spun out of #136's brainstorm (2026-07-21). We went **straight to #150**,
  skipping #136's reversible `workflow.md` prototype (owner's call, 2026-07-22).
- Brainstorm: plain dialogue, 2026-07-22 (this session), human-approved.
  Decision-ready recap:
  - Decompose the two gate dials `review.design` and `review.code` from the
    scalar `gateMode` (`panel|advisory|human|off`) into an object
    `{ validate, approve }` with `validate: panel|skip` and
    `approve: human|agent`.
  - Naming ratified by Neil: **`agent`** (not `auto`/`self`) names the
    accountable approver; **`skip`** (not `none`/`off`) names "no panel" — the
    "reads like a bypass" concern was raised and consciously overridden, so the
    rendered prose must frame `skip` as an *authored* choice, never an illicit
    gate-skip.
  - Faithful desugar (also the translation guide): `panel →
    {validate:panel, approve:human}`; `advisory → {validate:panel,
    approve:agent}`; `human → {validate:skip, approve:human}`; `off →
    {validate:skip, approve:agent}`.
  - `preview` **deferred** (additive later; the object shape must leave room);
    the `brainstorm` dial **stays `human|off`** (a brainstorm panel is a
    separate follow-up); the `tasks` dial **stays `subagent|self|off`** (a
    different axis, out of scope). Compat: **hard migrate** — v4 accepts only
    the object form.
- Programme: candidate member of the gate-integrity theme
  (`docs/plans/2026-07-21-sdlc-orchestration-epic-decomposition.md`); amends the
  v3 intent vocabulary shipped by
  `docs/plans/2026-07-17-config-intent-vocabulary.md`.

## Objective

Make the review-gate configuration express the two orthogonal decisions it has
always secretly held — **does an adversarial panel run** and **who adjudicates
its findings and advances the phase** — as two independent, honestly-named
fields, so that every combination is authorable and none reads as "findings are
ignorable."

## Rationale (grounded findings, why now)

1. **The scalar conflates two axes, and the split is already latent in code.**
   `lib.mjs:135 decomposeGateMode()` maps each scalar to a
   `{ reviewer, arbiter, blocking }` triple — `panel`=`{panel,human,true}`,
   `advisory`=`{panel,none,false}`, `human`=`{none,human,true}`,
   `off`=`{none,none,false}`. Only `.reviewer` is consumed
   (`resolve-panel.mjs:200`); `arbiter` and `blocking` are **dead fields**. The
   decomposition this plan ships is the promotion of that latent, half-built
   seam to an authored surface.
2. **"advisory" reads as "ignore the panel."** Its shipped meaning is `reviewer:
   panel, arbiter: none` — a panel runs, the agent proceeds without a human gate
   — but the word invites "look and shrug." The retro (Case #35) is the standing
   evidence that under-specified review posture causes real audit gaps. Renaming
   the *actor* (`approve: human|agent`) makes accountability legible; the
   disposition discipline (below) makes "ignore findings" unexpressible.
3. **The hidden constant was mis-stated.** #150's body says "`approve: human`
   was always implicitly on." Not so: `off` and `advisory` are both
   `arbiter: none` today. The real win is **orthogonalising `approve` from
   `validate`**, so a phase can pick each independently and deliberately.
4. **Why now:** the gate-integrity and panel-resolution epics (#135, #140) are
   about to build *on top of* the review dials. Landing the honest shape first
   means they build against `{validate, approve}` once, instead of shipping
   against the scalar and re-basing. The adopter population is two **co-owned
   dogfood** repos (this repo + Case), both hand-authorable, so ADR 0027's
   clean-break rationale ("a migration for a population of one is ceremony with no
   beneficiary") still holds. ADR 0027's "expires at first *external* adoption"
   clause is engaged head-on: Case is **not** an external adopter, and this change
   amends ADR 0027 to say so (scope in §3).

## Design principle (binding on every deliverable)

The **disposition discipline is an invariant, not a dial**: whenever
`validate: panel`, every finding is recorded and incorporated-or-justified and
no surviving high/medium may advance — *regardless of `approve`*. `approve:agent`
means "the agent adjudicates and does not block on a human," never "skip the
panel." This invariant is prose-law (SKILL red flags: "Dismissing a finding
without a recorded reason"; "Merging with a high or medium finding that survived
adjudication"), carried unchanged; no config field encodes "blocking."

`approve:agent` is **not new behaviour** — it is exactly today's `advisory`/`off`
adjudication (`arbiter:none`): the agent is the adjudicator for that gate and
advances without a human gate. The human-final-adjudicator rule in
`phase-pr-review.md` governs `approve:human` gates specifically; under
`approve:agent` there is no human escalation for that gate, but the disposition
invariant above still applies. Spec reconciles the phase prose, the
`gate.approved` telemetry approver value, and scenarios for the agent approver.
(Plan-panel H3.)

## What this delivers (scope in)

### 1. The `{ validate, approve }` gate-dial object (schemaVersion 4)

`review.design` and `review.code` (and their `overrides.{track}.review`
counterparts) change from the scalar `gateMode` to:

```
validate: "panel" | "skip"     # does an adversarial panel run before the artifact is presented?
approve:  "human" | "agent"    # who adjudicates findings and advances the phase?
```

- `schemaVersion` bumps **3 → 4**; the object form is the *only* accepted shape
  (hard migrate).
- `preview` semantics are **deferred**, but because the dial object is
  closed-world (`additionalProperties:false`), a later `preview` field would be
  rejected by an unchanged v4 reader — so "additive with no reader change" is only
  true if the field is **reserved now**. v4 therefore **reserves an optional
  `preview` field** (accepted by the schema, documented as reserved / no runtime
  effect in v4); its behaviour lands in a later, non-breaking change.
  (Plan-panel M5.)
- The exact required/optional split, whether the fields are `required` on the
  object, and the `overrides` merge semantics are **Spec** decisions (see Open
  Decisions).

### 2. Desugar table as the authoring/translation guide (an intentional amendment)

The desugar table is captured in the ADR as the canonical old→new mapping. It is
**not** shipped as a runtime desugarer (there are no scalars to accept at
runtime under hard-migrate) — it is the guide humans and `setup-sdlc` use to
translate a v3 config to v4.

It is **faithful on the reviewer/arbiter axes but not a behaviour-preserving
translation of old `advisory`**: today `advisory` is non-blocking
(`blocking:false`, "findings do not block"), whereas `{validate:panel,
approve:agent}` under the always-on disposition invariant makes disposition
mandatory (no surviving high/medium may pass). This tightening is **intended** —
it is the whole point of the change (making "ignore findings" unexpressible) — and
is recorded as an intentional amendment in the ADR with a covering scenario. No
current adopter uses `advisory` (this repo and Case both use `panel`), so the
real-world blast is nil. (Plan-panel M4.)

### 3. Every consumer of the gate value, updated

Grounded surface list (Spec confirms completeness; line refs are current):

- `schema/sdlc.config.schema.json` — replace `gateMode` def with the object;
  update `review.design`/`review.code` and the `trackOverride.review`
  properties; `schemaVersion const: 4`.
- `schema/sdlc.config.example.json` — re-author to the object shape.
- `scripts/lib.mjs` — `CONFIG_SCHEMA_VERSION 3→4`; add `3` to
  `KNOWN_PAST_VERSIONS`; update `REMEDY_SCHEMA_OLDER/NEWER` strings ("v3"→"v4");
  the config validator (`validateConfig`, ~`:206`) validates the object;
  `decomposeGateMode` is **removed or repurposed** (Spec decides — no runtime
  scalars remain to decompose).
- `scripts/resolve-panel.mjs` — the panel-presence read (`:200`,
  `decomposeGateMode(mode).reviewer === "none"`) becomes a direct
  `dial.validate === "skip"` read; `effective()`/`DIAL_FOR` return objects.
- `scripts/config-doc.mjs` — `GATE_MEANING` (`:100`) → separate `validate`/
  `approve` prose; `effectiveReview` (`:93`) merge becomes per-dial (see Open
  Decisions); `trackSummary` render lines (`:121–122`) print both fields.
- `scripts/setup-sdlc.mjs` — `LIFECYCLE_PRESETS` (`:40,44,48,50`) emit objects;
  the `--review-design`/`--review-code` flag grammar and the
  `--override track:dial:value` grammar (`:86`) accept `validate=…,approve=…`
  (exact CLI grammar is a Spec decision); JSON emit writes objects.
- `scripts/setup-sdlc.sh` (usage string, `:6-8`) and `templates/setup-sdlc.md`
  (the interview, `:29-32,58-62`) — both teach the scalar
  `panel|advisory|human|off` grammar; reword to the object shape. A
  stale-vocabulary sweep must cover package wrappers and templates.
  (Plan-panel M6.)
- `.pi/sdlc/sdlc.config.json` (this repo) — hand-authored to v4 object shape
  (current `design:panel`→`{validate:panel,approve:human}`,
  `code:panel`→`{validate:panel,approve:human}`, and the reversible override
  `design:human`→`{validate:skip,approve:human}`).
- Prose: the "under your configuration" callouts enumerating
  `panel|advisory|human|off` in `references/phase-plan.md`,
  `references/phase-spec.md`, `references/phase-pr-review.md`,
  `references/system-reference.md`, and the effective-shape reading protocol in
  `SKILL.md` — reworded to `{validate, approve}`. `phase-pr-review.md`'s
  human-final-adjudicator seam is reconciled with `approve:agent` (agent is the
  gate adjudicator; no human escalation for that gate). (Plan-panel H3.)
- Regenerate `.pi/sdlc/CONFIG.md` from the new renderer.
- One **ADR** recording the decomposition, the naming decisions (`agent`/`skip`
  incl. the overridden bypass-smell concern), the desugar table (with the
  intentional `advisory` amendment, M4), the invariant, and the clean-break
  migration posture.
- **Amend ADR 0027** (pre-adoption clean-break policy): define "external adopter"
  as a genuine third party, explicitly excluding **co-owned dogfood** repos (this
  repo + Case); record that v3→v4 ships as a coordinated clean break with a
  hand-authored Case re-author as the "equivalently honest forward path," not a
  migrator. (Plan-panel H2, owner-adjudicated 2026-07-22.)

## What this does not deliver (scope out)

- **`preview`** — deferred; only the additive path is preserved.
- **A brainstorm panel** — the `brainstorm` dial stays `human|off`; enabling
  `validate:panel` for brainstorm needs a new `brainstorm_review` panel phase +
  prompt + roster entry, a separate feature.
- **The `tasks` dial** — stays `subagent|self|off`.
- **An automated migrator / dual-accept** — consistent with ADR 0027 (as
  amended) and how v3 itself shipped (clean break, adopters hand-author, everyone
  else pins). v3 configs hit the existing `classifyConfigVersion` "older" branch
  → "pin, or `setup-sdlc --force`".
- **Case's config re-author** — Case (`threadsafe/case`) is a separate,
  **co-owned dogfood** repo that pins pi-sdlc; its v4 re-authoring is a
  coordinated follow-up on the Case board once Case adopts the release carrying
  v4 (Case pins the pre-v4 release until then). Out of this PR's tree, but named
  here as the release-order contract, not left implicit. (Plan-panel H2.)

## Open decisions (resolve in Spec)

1. **`overrides` merge semantics (resolved to a coherent contract; Spec pins the
   schema).** A **base** dial requires both `validate` + `approve`; an
   `overrides.{track}.review` dial is a **partial** object (each field optional)
   that **deep-merges** field-by-field onto the base (so a reversible track can
   flip only `approve`). This resolves the rev-1 contradiction the panel caught
   (H1): base fully explicit, override relaxes one axis. `config-doc.mjs:93`
   `effectiveReview` (today a shallow `{...base, ...over}` replace) and
   `resolve-panel`'s `effective()` must both implement this per-dial deep-merge
   and agree. Spec defines the exact required/optional schema split.
2. **`decomposeGateMode` fate.** Delete it (read fields directly) or keep it as a
   normalizer/accessor returning `{validate, approve}`? **Recommendation:** delete;
   direct field reads are clearer once the config is object-only.
3. **Object field requiredness (folded into #1).** Base dials require both fields
   (no implicit default, matching v3's "all dials explicit" ethos); override dials
   make each field optional to enable the partial deep-merge in #1. The reserved
   `preview` field (scope §1) is optional on both.
4. **CLI grammar for `setup-sdlc`.** Exact spelling of the flags and `--override`
   value (`validate=panel,approve=human`? two flags?) — a Spec/ergonomics call.

## Definition of Done

- schemaVersion is 4; `sdlc.config.schema.json` accepts only the
  `{validate, approve}` object for `review.design`/`review.code` and their
  overrides, rejects the old scalar and unknown fields, requires both fields on
  base dials, allows partial override dials, and **reserves** an optional
  `preview` field (accepted, no runtime effect in v4).
- Every grounded consumer above reads/writes the object; `resolve-panel`,
  `config-doc`, `setup-sdlc`, and `lib.mjs` validation are consistent; no code
  path reads a `gateMode` scalar or the dead `arbiter`/`blocking` fields.
- This repo's committed `.pi/sdlc/sdlc.config.json` is valid v4, `sdlc-status`
  reports ready, and `config-doc check` is `current` against a regenerated
  `.pi/sdlc/CONFIG.md`.
- CONFIG.md and all "under your configuration" prose describe `validate`/
  `approve` (not `panel|advisory|human|off`); `skip` is framed as an authored
  choice.
- The disposition-discipline invariant is stated once and unchanged; nothing in
  config encodes "blocking."
- An ADR records the model, naming, desugar table (with the intentional
  `advisory` amendment), invariant, and clean-break posture; **ADR 0027 is
  amended** to exclude co-owned dogfood repos from "external adopter."
- `setup-sdlc.sh`, `templates/setup-sdlc.md`, and every "under your configuration"
  prose callout describe `{validate, approve}`; a stale-vocabulary sweep finds no
  residual `panel|advisory|human|off` gate grammar in wrappers/templates/prose.
- `approve:agent`'s adjudication semantics are stated in `phase-pr-review.md`
  (agent is the gate adjudicator, no human escalation for that gate) and covered
  by a scenario; `gate.approved` telemetry accepts the agent approver value.
- Existing test corpus updated/extended to cover the object shape, the version
  bump (v3 now "older"), the renderer, `setup-sdlc` emit, and `resolve-panel`
  panel-presence; full suite + lint green.
- Spec's falsifiable scenarios all have a covering check.

## Context for the next agent (Spec)

- The five settled brainstorm decisions above are **ratified** — Spec designs
  the *exact schema, enums, merge semantics, and scenarios*, not the vocabulary.
- Open Decisions #1 (merge) and #3 (requiredness) are resolved to a coherent
  contract above; #2 (`decomposeGateMode` fate) and #4 (CLI grammar) retain
  latitude. Pin the exact required/optional schema split first.
- Grounding already done: `check-lifecycle` does **not** read gate modes
  (verified) — likely unaffected; confirm and record. The issue's impacted-surface
  list omitted `setup-sdlc.mjs` (heavily impacted) and overstated `check-lifecycle`.
- Frozen-surface care: this is the persisted config shape — Spec must pin the
  schema contract and the version-classification behaviour (v3→"older" remedy
  string) as falsifiable scenarios.
- The desugar table is a **guide**, not runtime code — do not spec a runtime
  scalar-acceptor.
