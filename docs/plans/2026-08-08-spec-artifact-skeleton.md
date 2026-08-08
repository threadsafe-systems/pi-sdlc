# Plan: Spec artifact skeleton (S1)

Status: rev 4 — amended after plan-panel round 3 (PLAN-R3-01..02 all incorporated; adjudication in `docs/reviews/plan-review-spec-artifact-skeleton-2026-08-08/consolidated.md`)

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
3. **`skills/sdlc/prompts/adversary-spec.prompt.md`** — extend the existing lettered attack surfaces (A–H) with skeleton-awareness checks: the prompt names the five skeleton components as check targets and references `references/spec-artifact-skeleton.md` for their definitions. No new attack-surface letter, no change to the output contract (the closed A–H CLEAR-line wording stays), no round-mechanics change. The binding-rule definitions themselves live only in the skeleton and `phase-spec.md` §4 — the prompt references, never restates. The file is on the FS19 frozen list; it is unfrozen by removing it from the frozen array under the deliberate-change precedent set by S5, and the unfreeze is recorded in the Amendments section of the spec this plan spawns.
4. **IDV19 reconciliation** — `test/iteration-disposition.test.js` (which asserts every adversary prompt stays in the frozen list) is temporarily reconciled to exempt the deliberately-unfrozen spec prompt, and restored by the re-freeze.
5. **Mandatory post-merge re-freeze** — the **orchestrator** (the session that outlives the implementation agent's PR) files and executes a track-none follow-up immediately after merge that re-adds `adversary-spec.prompt.md` to the frozen array and restores IDV19's full assertion (S5 precedent: #206 + re-freeze #207). The implementing agent's duty ends at recording the obligation (spec Amendments + PR description); slice completion depends on the re-freeze merging.
6. **FS11 inventory row** — the new reference gains its `assets/normative-references.json` row (checked by `check-references.mjs`), without which the slice cannot pass its own lifecycle checks.
7. **Contract tests** proving the authoring surface retains the binding rules and that the skeleton contains the three-part scenario form as literal fill-in blocks: `phase-spec.md` §4 carries the rule text, the skeleton carries the five components, and the prompt carries the five component anchors plus the skeleton-path reference. Pure offline string assertions over markdown files; budget < 1 s, no network.

### Out

- R3-G7 (spec re-rounds / delta re-review / NEW-REOPENED escalation) — rides S5's already-shipped iteration/disposition vocabulary; no new prose here.
- R3-G8 (diagram change-class rule) and R3-G9 (IA front-matter + `lint.mjs` advisory use) — routed to S7 (comprehension seam).
- R3-G10 (estimator counts into `ceremony.recommended`) and R3-G11 (verification-technique dial) — routed to #158's build stream.
- Any change to the re-round mechanics of `prompts/adversary-spec.prompt.md` (R3-G7 territory); the only permitted prompt change is skeleton-awareness within the existing lettered attack surfaces.
- Consumer prompt overrides: enforcement is bounded to the package-default prompt. Overrides resolve first by design (`ensure-panel-agent.mjs`) and are consumer law; migrating existing overrides is the consumer's own lifecycle work. The `test/fixtures/consumer/` override fixtures stay untouched, full stop — a test failing on fixture content is a test-isolation defect to fix in the test, never a reason to touch the fixtures.
- Any runtime assertion machinery, Gherkin syntax, step definitions, Cucumber-family tooling, or new tooling mandate.
- Changing `templates/sdlc-spec.md` (stays a pure standalone-entrypoint router; the skeleton is referenced from `phase-spec.md` §4, not restated there).
- Any new gate, dial, panel role, configuration value, or schema change.

## Assumptions

1. The skeleton lives under `references/` (authoring guidance) and is referenced from `phase-spec.md` §4, keeping `templates/sdlc-spec.md` a pure router — owner-ratified in Brainstorm (option a).
2. S2 (Plan skeleton) and S6 (Build craft) will follow the same `references/<skeleton>.md` pattern, so S1 should establish a clean, reusable shape rather than a spec-only hack.
3. The binding rules are prose law authored once in `phase-spec.md` §4 (and mirrored in the skeleton), enforced by the spec panel through skeleton-awareness anchors inside the prompt's existing lettered attack surfaces — not by a new mechanical checker. The contract tests prove the rules are present in the guidance and anchored in the prompt, not that a spec satisfies them.
4. Frozen-surface discipline governs production authoring prose: the changed authoring surfaces are `phase-spec.md` and the new `references/spec-artifact-skeleton.md`. Contract tests, the inventory row, the deliberate `adversary-spec.prompt.md` change with its FS19 unfreeze, the temporary IDV19 reconciliation, and the post-merge re-freeze are additional, named permitted change classes; every other frozen script/prompt/schema stays byte-identical.
5. The existing `#38` surface-name archaeology and canonical scenario-key design are out of scope (carried by #178), matching the writing-comments slice.

## Definition of done

1. `skills/sdlc/references/spec-artifact-skeleton.md` exists and contains the five skeleton components (Vocabulary, Contracts, scenario-kind labels, NFR table, three-part scenario form) as literal fill-in blocks.
2. `skills/sdlc/references/phase-spec.md` §4 states the binding rules (coined-term↔table, interface↔block, one-kind-label, NFR measure-or-unbound) and points to the skeleton.
3. Contract tests assert the rule text is present in `phase-spec.md` §4, the five components are present in the skeleton as literal fill-in blocks (including the three-part scenario form `Given:` / `When–Then:` / `Falsify:`), and the prompt contains anchors naming all five components plus a reference to the skeleton path — not restated rule definitions.
4. The five gaps are each traceable to a non-empty skeleton component by id (G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form).
5. All frozen surfaces are byte-identical to the branch base (ASD19) except the deliberate unfreeze of `prompts/adversary-spec.prompt.md` (removed from the frozen array; its only diff is skeleton-awareness within the existing lettered surfaces) and the paired temporary IDV19 reconciliation; both are restored by the mandatory post-merge re-freeze.
6. `templates/sdlc-spec.md` is unchanged.
7. Full test corpus passes (`npm test`, offline, under a 30-second external timeout — matching the #177 precedent); `biome check` over changed files is clean; the reference inventory (`check-references.mjs`) and lifecycle checks pass.
8. No new dependency, public API, schema, dial, gate, or configuration change.
9. The orchestrator files and executes the track-none re-freeze follow-up immediately after merge (the implementing agent records the obligation in the spec Amendments and PR description), and this slice is not complete until the re-freeze merges.

## Context for the next agent

- Primary authoring target: **new** `skills/sdlc/references/spec-artifact-skeleton.md`; extend the existing lettered attack surfaces in `skills/sdlc/prompts/adversary-spec.prompt.md`; edit `skills/sdlc/references/phase-spec.md` §4; add the `normative-references.json` inventory row; unfreeze the prompt in `test/frozen-surfaces.test.js` with the paired IDV19 reconciliation in `test/iteration-disposition.test.js` (record all of it in the spec's Amendments). Record the track-none re-freeze obligation in the spec Amendments and PR description — the orchestrator files and executes it after merge; your session ends at PR creation, so do not attempt post-merge actions yourself.
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

### A2 — plan rev 3: incorporate plan-panel round 2

- Trigger: round-2 delta review confirmed all seven rev-2 fixes and raised five new findings (3 high / 2 medium), all downstream consequences of the A1 unfreeze; all incorporated, none dismissed.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated** — see `docs/reviews/plan-review-spec-artifact-skeleton-2026-08-08/consolidated.md` (round 2). Key mechanics added: prompt change limited to extending the existing A–H attack surfaces (no new letter, no output-contract change); contract tests assert component anchors + skeleton-path reference in the prompt, never restated rules; temporary IDV19 reconciliation in `test/iteration-disposition.test.js`; mandatory track-none post-merge re-freeze (S5 precedent #206+#207) that slice completion depends on; enforcement bounded to the package-default prompt with consumer overrides out of scope.
- Author: orchestrator (`maas-qwen/qwen3.8-max`), during plan-panel adjudication on 2026-08-08.

### A3 — plan rev 4: incorporate plan-panel round 3

- Trigger: round-3 delta review — luna PASSed clean; gemini confirmed all five rev-3 fixes and raised two new findings (1 high / 1 medium); both incorporated, none dismissed.
- Class: **(c), normal fix wave**.
- Disposition: **incorporated** — see `docs/reviews/plan-review-spec-artifact-skeleton-2026-08-08/consolidated.md` (round 3). PLAN-R3-01: the "unless a test demands otherwise" hedge is removed; the consumer override fixtures are a strict boundary, and fixture-content test failures are test-isolation defects fixed in the test. PLAN-R3-02: re-freeze ownership corrected — the orchestrator files and executes the track-none re-freeze after merge; the implementing agent (whose session ends at PR creation) only records the obligation in the spec Amendments and PR description.
- Author: orchestrator (`maas-qwen/qwen3.8-max`), during plan-panel adjudication on 2026-08-08.
