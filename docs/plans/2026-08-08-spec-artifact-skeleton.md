# Plan: Spec artifact skeleton (S1)

Status: rev 2 — amended after plan-panel round 1 (PLAN-R1-01..07 all incorporated; adjudication in `docs/reviews/plan-review-spec-artifact-skeleton-2026-08-08/consolidated.md`)

Track: irreversible — freezes the specification artifact shape (a public surface later slices and consumers bind to)

Map: #192 (design-phase craft — decision-complete; S1 is the second ratified slice)

Run slug: `spec-artifact-skeleton`

## Objective

Close the author/reviewer asymmetry at the specification gate — the most expensive gate in the lifecycle — by giving spec authors the same artifact skeleton the reviewers already demand. Concretely: introduce a spec-authoring skeleton (vocabulary table, contract blocks, scenario-kind labels, bound NFR table, three-part scenario form) as new reference guidance, and state the binding rules for it in `references/phase-spec.md` §4, so omissions become explicit, structured, and reviewable at authoring time, and the spec panel — taught the same rules — enforces them at the gate. The skeleton is authoring guidance, not mechanical prevention: it makes every missing piece nameable and findable, at authoring cost instead of panel cost.

## Rationale

The spec reviewer prompt (`prompts/adversary-spec.prompt.md`) already demands that reviewers verify exact signatures, types, error semantics, and that every NFR is tied to a scenario. The authoring surface (`phase-spec.md` §4) enumerates "contracts, interfaces, surface area, FR/NFR, scenarios" and stops — there is no skeleton a spec author fills in. The result is proven asymmetry: in `docs/specs/2026-07-24-pv1-task-scoped-tests.md`, 3 of 8 round-1 panel findings were term/claim-precision defects (F5/F6/G1), finding F2 was an unspecified error-precedence rule, process-obligation criteria (TST14–18) sat in the same undifferentiated scenario list as machine-falsifiable ones, and §12 carried 4 NFR claims of which 3 were bound and 1 asserted unmarked. Each of those defects was paid for as frontier-model reading at panel cost; the skeleton prevents them at authoring time.

The map #192 R5 synthesis ratified S1 as the second slice (after S5, which shipped as v3.1.0) precisely because it closes the biggest and most expensive asymmetry. The R3 research (the source of the gaps) is the authority for the adapted models: DDD ubiquitous language (vocabulary), Design by Contract (contract blocks), Specification-by-Example's automate-validation pattern (scenario-kind labels), arc42 quality scenarios + ISO 25010 (bound NFRs), and BDD's explicit-precondition discipline (Given clause) — each **adapted**, with runtime assertion machinery, Gherkin syntax, step definitions, workshop patterns, and full quality-attribute trees explicitly rejected.

## Scope

### In

1. **New `skills/sdlc/references/spec-artifact-skeleton.md`** — the authoring surface holding the literal fill-in skeleton:
   - `## Vocabulary` — three-column table *term → definition → bound identifier/file* (G1).
   - `## Contracts` — one block per interface this change introduces or modifies: exact signature/shape, preconditions, postconditions, invariants, error semantics incl. precedence, and gating scenario id(s) (G2). Interfaces mentioned only as unchanged context get no block and must not be silently re-described.
   - Per-scenario kind label `mechanical` / `inspection` / `carried`, with `inspection` naming its decision point and `carried` naming its destination (G4).
   - `## Non-functional requirements` — one row per carried NFR: characteristic (ISO 25010 label) → stimulus/condition → response measure → binding scenario id, or the literal `unbound — accepted at gate` with a reason (G5).
   - Three-part scenario form on separate lines — `Given:` (state/fixture; `Given: none` permitted) / `When–Then:` (behaviour+outcome) / `Falsify:` (existing) (G6).
2. **`skills/sdlc/references/phase-spec.md` §4** — a short prose addition stating the binding rules and pointing to the skeleton: every coined term used ≥2× in the body appears in the Vocabulary table (and every table term appears in the body); every interface this change introduces or modifies has a Contracts block (interfaces mentioned only as unchanged context do not, and must not be silently re-described); every scenario carries exactly one kind label and the mechanical/total ratio is readable off the spec; every NFR has a measure + scenario id or the explicit `unbound` marker — anything missing is a spec defect.
3. **`skills/sdlc/prompts/adversary-spec.prompt.md`** — add attack surfaces that name the skeleton's five components and require checking them against `references/spec-artifact-skeleton.md` (reference, never restate — the skeleton stays the single source of truth). The file is on the FS19 frozen list; it is unfrozen by removing it from the frozen array under the deliberate-change precedent set by S5, and the unfreeze is recorded in the Amendments section of the spec this plan spawns.
4. **FS11 inventory row** — the new reference gains its `assets/normative-references.json` row (checked by `check-references.mjs`), without which the slice cannot pass its own lifecycle checks.
5. **Contract tests** proving the authoring surface (skeleton + `phase-spec.md` §4 + prompt attack surfaces) retains the binding rules and that the skeleton contains the three-part scenario form as literal fill-in blocks. Pure offline string assertions over markdown files; budget < 1 s, no network.

### Out

- R3-G7 (spec re-rounds / delta re-review / NEW-REOPENED escalation) — rides S5's already-shipped iteration/disposition vocabulary; no new prose here.
- R3-G8 (diagram change-class rule) and R3-G9 (IA front-matter + `lint.mjs` advisory use) — routed to S7 (comprehension seam).
- R3-G10 (estimator counts into `ceremony.recommended`) and R3-G11 (verification-technique dial) — routed to #158's build stream.
- Any change to the re-round mechanics of `prompts/adversary-spec.prompt.md` (R3-G7 territory); the only permitted prompt change is the skeleton-awareness attack surfaces of In-scope item 3.
- Any runtime assertion machinery, Gherkin syntax, step definitions, Cucumber-family tooling, or new tooling mandate.
- Changing `templates/sdlc-spec.md` (stays a pure standalone-entrypoint router; the skeleton is referenced from `phase-spec.md` §4, not restated there).
- Any new gate, dial, panel role, configuration value, or schema change.

## Assumptions

1. The skeleton lives under `references/` (authoring guidance) and is referenced from `phase-spec.md` §4, keeping `templates/sdlc-spec.md` a pure router — owner-ratified in Brainstorm (option a).
2. S2 (Plan skeleton) and S6 (Build craft) will follow the same `references/<skeleton>.md` pattern, so S1 should establish a clean, reusable shape rather than a spec-only hack.
3. The binding rules are prose law authored once in `phase-spec.md` §4 (and mirrored in the skeleton), enforced by the spec panel through the updated `adversary-spec.prompt.md` attack surfaces — not by a new mechanical checker. The contract tests prove the rules are present in the guidance, not that a spec satisfies them.
4. Frozen-surface discipline governs production authoring prose: the changed authoring surfaces are `phase-spec.md` and the new `references/spec-artifact-skeleton.md`. Contract tests, the inventory row, and the deliberate `adversary-spec.prompt.md` change with its FS19 unfreeze are additional, named permitted change classes; every other frozen script/prompt/schema stays byte-identical.
5. The existing `#38` surface-name archaeology and canonical scenario-key design are out of scope (carried by #178), matching the writing-comments slice.

## Definition of done

1. `skills/sdlc/references/spec-artifact-skeleton.md` exists and contains the five skeleton components (Vocabulary, Contracts, scenario-kind labels, NFR table, three-part scenario form) as literal fill-in blocks.
2. `skills/sdlc/references/phase-spec.md` §4 states the binding rules (coined-term↔table, interface↔block, one-kind-label, NFR measure-or-unbound) and points to the skeleton.
3. Contract tests assert the rules are present in all three surfaces (`phase-spec.md` §4, the skeleton, the prompt attack surfaces) and that the skeleton contains the three-part scenario form (`Given:` / `When–Then:` / `Falsify:`) as literal fill-in blocks.
4. The five gaps are each traceable to a non-empty skeleton component by id (G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form).
5. All frozen surfaces are byte-identical to the branch base (ASD19) except the deliberate unfreeze of `prompts/adversary-spec.prompt.md`, which is removed from the frozen array and whose only diff is the skeleton-awareness attack surfaces.
6. `templates/sdlc-spec.md` is unchanged.
7. Full test corpus passes (`npm test`, offline, under a 30-second external timeout — matching the #177 precedent); `biome check` over changed files is clean; the reference inventory (`check-references.mjs`) and lifecycle checks pass.
8. No new dependency, public API, schema, dial, gate, or configuration change.

## Context for the next agent

- Primary authoring target: **new** `skills/sdlc/references/spec-artifact-skeleton.md`; edit `skills/sdlc/references/phase-spec.md` §4 and the `adversary-spec.prompt.md` attack surfaces; add the `normative-references.json` inventory row and unfreeze the prompt in `test/frozen-surfaces.test.js` (record both in the spec's Amendments).
- The R3 brief `docs/briefs/2026-07-26-design-phase-r3-spec.md` is the authority for each gap's exact candidate change and done-means — read the G1/G2/G4/G5/G6 rows before writing.
- The R5 synthesis `docs/briefs/2026-07-26-design-phase-r5-synthesis.md` row 58 is S1's ratified scope.
- A real spec showcasing the skeleton is not required in this slice (dogfooding the skeleton on a future spec is a later concern); the skeleton + `phase-spec.md` §4 + tests are the deliverable.
- Watch the writing-comments discipline: skeleton blocks are fill-in scaffolding, not process-narrative prose.
- No carry is minted. The Specification must price all verification scenarios and the panel must verify the skeleton doesn't drift into a tooling or ceremony mandate.

## Amendments

### A1 — plan rev 2: incorporate plan-panel round 1

- Trigger: plan-panel round 1 (gemini-3.1-pro-preview + gpt-5.6-luna) returned 3 high / 4 medium findings; all incorporated, none dismissed.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated** — see `docs/reviews/plan-review-spec-artifact-skeleton-2026-08-08/consolidated.md`. The single substantive scope change is PLAN-R1-01: `adversary-spec.prompt.md` moves from Out to In (skeleton-awareness attack surfaces only, unfrozen under the FS19 precedent), because enforcement is intrinsic to S1's ratified purpose of closing the author/reviewer asymmetry. Recorded for owner ratification at the Plan gate.
- Author: orchestrator (`maas-qwen/qwen3.8-max`), during plan-panel adjudication on 2026-08-08.
