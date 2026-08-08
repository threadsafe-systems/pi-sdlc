# Plan: Spec artifact skeleton (S1)

Status: draft at Plan gate

Track: irreversible — freezes the specification artifact shape (a public surface later slices and consumers bind to)

Map: #192 (design-phase craft — decision-complete; S1 is the second ratified slice)

Run slug: `spec-artifact-skeleton`

## Objective

Close the author/reviewer asymmetry at the specification gate — the most expensive gate in the lifecycle — by giving spec authors the same artifact skeleton the reviewers already demand. Concretely: introduce a spec-authoring skeleton (vocabulary table, contract blocks, scenario-kind labels, bound NFR table, three-part scenario form) as new reference guidance, and state the binding rules for it in `references/phase-spec.md` §4, so under-specification is prevented at authoring cost rather than discovered at panel cost.

## Rationale

The spec reviewer prompt (`prompts/adversary-spec.prompt.md`) already demands that reviewers verify exact signatures, types, error semantics, and that every NFR is tied to a scenario. The authoring surface (`phase-spec.md` §4) enumerates "contracts, interfaces, surface area, FR/NFR, scenarios" and stops — there is no skeleton a spec author fills in. The result is proven asymmetry: in `docs/specs/2026-07-24-pv1-task-scoped-tests.md`, 3 of 8 round-1 panel findings were term/claim-precision defects (F5/F6/G1), finding F2 was an unspecified error-precedence rule, process-obligation criteria (TST14–18) sat in the same undifferentiated scenario list as machine-falsifiable ones, and §12 carried 4 NFR claims of which 3 were bound and 1 asserted unmarked. Each of those defects was paid for as frontier-model reading at panel cost; the skeleton prevents them at authoring time.

The map #192 R5 synthesis ratified S1 as the second slice (after S5, which shipped as v3.1.0) precisely because it closes the biggest and most expensive asymmetry. The R3 research (the source of the gaps) is the authority for the adapted models: DDD ubiquitous language (vocabulary), Design by Contract (contract blocks), Specification-by-Example's automate-validation pattern (scenario-kind labels), arc42 quality scenarios + ISO 25010 (bound NFRs), and BDD's explicit-precondition discipline (Given clause) — each **adapted**, with runtime assertion machinery, Gherkin syntax, step definitions, workshop patterns, and full quality-attribute trees explicitly rejected.

## Scope

### In

1. **New `skills/sdlc/references/spec-artifact-skeleton.md`** — the authoring surface holding the literal fill-in skeleton:
   - `## Vocabulary` — three-column table *term → definition → bound identifier/file* (G1).
   - `## Contracts` — per changed interface: exact signature/shape, preconditions, postconditions, invariants, error semantics incl. precedence, and gating scenario id(s) (G2).
   - Per-scenario kind label `mechanical` / `inspection` / `carried`, with `inspection` naming its decision point and `carried` naming its destination (G4).
   - `## Non-functional requirements` — one row per carried NFR: characteristic (ISO 25010 label) → stimulus/condition → response measure → binding scenario id, or the literal `unbound — accepted at gate` with a reason (G5).
   - Three-part scenario form on separate lines — `Given:` (state/fixture; `Given: none` permitted) / `When–Then:` (behaviour+outcome) / `Falsify:` (existing) (G6).
2. **`skills/sdlc/references/phase-spec.md` §4** — a short prose addition stating the binding rules and pointing to the skeleton: every coined term used ≥2× in the body appears in the Vocabulary table (and every table term appears in the body); every interface named in the body has a Contracts block; every scenario carries exactly one kind label and the mechanical/total ratio is readable off the spec; every NFR has a measure + scenario id or the explicit `unbound` marker — anything missing is a spec defect.
3. **Contract tests** proving the authoring surface (skeleton + `phase-spec.md` §4) retains the binding rules, and that the skeleton's scenarios forms require the three parts.

### Out

- R3-G7 (spec re-rounds / delta re-review / NEW-REOPENED escalation) — rides S5's already-shipped iteration/disposition vocabulary; no new prose here.
- R3-G8 (diagram change-class rule) and R3-G9 (IA front-matter + `lint.mjs` advisory use) — routed to S7 (comprehension seam).
- R3-G10 (estimator counts into `ceremony.recommended`) and R3-G11 (verification-technique dial) — routed to #158's build stream.
- Any change to `prompts/adversary-spec.prompt.md` (frozen; G7 territory).
- Any runtime assertion machinery, Gherkin syntax, step definitions, Cucumber-family tooling, or new tooling mandate.
- Changing `templates/sdlc-spec.md` (stays a pure standalone-entrypoint router; the skeleton is referenced from `phase-spec.md` §4, not restated there).
- Any new gate, dial, panel role, configuration value, or schema change.

## Assumptions

1. The skeleton lives under `references/` (authoring guidance) and is referenced from `phase-spec.md` §4, keeping `templates/sdlc-spec.md` a pure router — owner-ratified in Brainstorm (option a).
2. S2 (Plan skeleton) and S6 (Build craft) will follow the same `references/<skeleton>.md` pattern, so S1 should establish a clean, reusable shape rather than a spec-only hack.
3. The binding rules are prose law authored once in `phase-spec.md` §4 (and mirrored in the skeleton), enforced by the spec panel — not by a new mechanical checker. The skeleton's "done-means" tests prove the rules are present in the guidance, not that a spec satisfies them.
4. Frozen-surface discipline: only `phase-spec.md` and the new `references/spec-artifact-skeleton.md` change; all frozen scripts/prompts/schemas stay byte-identical.
5. The existing `#38` surface-name archaeology and canonical scenario-key design are out of scope (carried by #178), matching the writing-comments slice.

## Definition of done

1. `skills/sdlc/references/spec-artifact-skeleton.md` exists and contains the five skeleton components (Vocabulary, Contracts, scenario-kind labels, NFR table, three-part scenario form) as literal fill-in blocks.
2. `skills/sdlc/references/phase-spec.md` §4 states the binding rules (coined-term↔table, interface↔block, one-kind-label, NFR measure-or-unbound) and points to the skeleton.
3. Contract tests assert the rules are present in both surfaces and that the skeleton's scenario form requires all three parts (`Given:` / `When–Then:` / `Falsify:`).
4. The five gaps are each traceable to a non-empty skeleton component by id (G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form).
5. `prompts/adversary-spec.prompt.md` and all other frozen surfaces are byte-identical to the branch base (ASD19).
6. `templates/sdlc-spec.md` is unchanged.
7. Full test corpus passes; touched-surface lint is clean; reference inventory and lifecycle checks pass.
8. No new dependency, public API, schema, dial, gate, or configuration change.

## Context for the next agent

- Primary authoring target: **new** `skills/sdlc/references/spec-artifact-skeleton.md`; edit `skills/sdlc/references/phase-spec.md` §4 only.
- The R3 brief `docs/briefs/2026-07-26-design-phase-r3-spec.md` is the authority for each gap's exact candidate change and done-means — read the G1/G2/G4/G5/G6 rows before writing.
- The R5 synthesis `docs/briefs/2026-07-26-design-phase-r5-synthesis.md` row 58 is S1's ratified scope.
- A real spec showcasing the skeleton is not required in this slice (dogfooding the skeleton on a future spec is a later concern); the skeleton + `phase-spec.md` §4 + tests are the deliverable.
- Watch the writing-comments discipline: skeleton blocks are fill-in scaffolding, not process-narrative prose.
- No carry is minted. The Specification must price all verification scenarios and the panel must verify the skeleton doesn't drift into a tooling or ceremony mandate.

## Amendments

None yet.
