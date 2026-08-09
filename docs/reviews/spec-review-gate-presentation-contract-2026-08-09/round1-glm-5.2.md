I now have all the evidence I need. Let me compile the final findings.

### SPEC-R1-01 — Test file name contradicts the plan

- id: SPEC-R1-01
- severity: high
- area: B
- quote: "`test/gate-presentation.test.js` — contract tests that read the governed docs" (spec C8, `docs/specs/2026-08-09-gate-presentation-contract.md:129`); plan: "`test/gate-presentation-contract.test.js`: contract tests" (`docs/plans/2026-08-09-gate-presentation-contract.md:122`) and "`node --test test/gate-presentation-contract.test.js`" (plan DoD 3, `:154`)
- defect: The spec names the test file `test/gate-presentation.test.js` throughout (C8, Vocabulary lines 20/22, GPC7/GPC8/GPC10 at lines 228/238/257), but the plan names it `test/gate-presentation-contract.test.js` in both scope item 5 and DoD item 3. An implementer following the spec creates a differently-named file; the plan's DoD verification command at line 154 targets a file the spec never produces.
- fix: Replace every `test/gate-presentation.test.js` in the spec with `test/gate-presentation-contract.test.js` to match the plan.

### SPEC-R1-02 — phase-plan.md §6a/§6b vs the plan's §4

- id: SPEC-R1-02
- severity: high
- area: B
- quote: "### C2 Storage modes (§6a/§6b)" (spec, `docs/specs/2026-08-09-gate-presentation-contract.md:42`); plan: "4. `skills/sdlc/references/phase-plan.md` §4: the provenance rule, doc-side only" (`docs/plans/2026-08-09-gate-presentation-contract.md:111`); plan DoD 2: "phase-plan.md §4: first-paragraph enumeration extended with the provenance block" (`:150`)
- defect: The spec places all storage-mode rules in phase-plan.md §6a/§6b (C2 line 42, GPC2 line 179, GPC3 line 189, GPC4 line 201, GPC9 line 248, Vocabulary lines 16–21, GPC15 line 306). The plan says phase-plan.md §4. The current `skills/sdlc/references/phase-plan.md` has no §6a or §6b — §6 is "Refusal and backward-transition behaviour," which is unrelated to storage modes. The spec never states it is creating new sections, so every scenario that says "its §6a rule prose" or "its §6b rule prose" checks a location that does not exist and that the plan does not authorize.
- fix: Replace all §6a/§6b references in the spec with §4 (matching plan scope item 4 and DoD 2), or explicitly declare that the implementation creates new §6a/§6b subsections and justify the deviation from the plan's §4.

### SPEC-R1-03 — phase-brainstorm.md §9 (map-mode provenance split) omitted

- id: SPEC-R1-03
- severity: high
- area: B
- quote: plan: "3. `skills/sdlc/references/phase-brainstorm.md` §9: the map-mode provenance split — the sketch embeds verbatim in the plan in both modes (a gate artifact, belonging to no ticket); only the decisions list becomes the index" (`docs/plans/2026-08-09-gate-presentation-contract.md:102`); spec: no contract or scenario references phase-brainstorm.md §9.
- defect: The plan's scope item 3 requires phase-brainstorm.md §9 for the map-mode provenance split (sketch-in-both-modes, list-to-index, resolution comment as single home, thread variant). The spec has no contract and no scenario for §9. C2 relocates the map-mode rules to phase-plan.md §6b instead. An implementer following the spec would not modify phase-brainstorm.md §9, leaving a whole plan scope item unimplemented.
- fix: Add a contract and at least one scenario for phase-brainstorm.md §9 covering the map-mode provenance split, or justify the relocation to phase-plan.md with an amendment.

### SPEC-R1-04 — phase-brainstorm.md §1 (dialogue moves G1–G3) omitted

- id: SPEC-R1-04
- severity: high
- area: B
- quote: plan: "2. `skills/sdlc/references/phase-brainstorm.md` §1: the named dialogue moves — problem/outcome opening that names no mechanism (G1), alternative-or-declare (G2), appetite elicited before converging (G3), research-or-declare (G4), and one constraints prompt (G7)" (`docs/plans/2026-08-09-gate-presentation-contract.md:89–91`); plan DoD 1: "§8 rebuilt and §1 moves present" (`:148`); spec: no contract or scenario references phase-brainstorm.md §1; G1, G2, G3 do not appear in the spec at all.
- defect: The plan requires phase-brainstorm.md §1 to name dialogue moves G1, G2, G3, G4, G7. The spec has no contract or scenario for §1. G4 (C5) and G7 (C6) are placed in §8 only, not §1. G1, G2, G3 are not mentioned anywhere in the spec. The plan's DoD 1 explicitly requires "§1 moves present" — the spec leaves this ungated and unaddressed.
- fix: Add a contract and scenario for phase-brainstorm.md §1 covering the named dialogue moves G1–G3, G4, G7, or justify their omission with an amendment.

### SPEC-R1-05 — Sketch trigger + absence declaration unguarded

- id: SPEC-R1-05
- severity: medium
- area: B
- quote: plan: "the sketch trigger + absence declaration, the amendment loop" (`docs/plans/2026-08-09-gate-presentation-contract.md:84`); plan test directions: "sketch trigger + absence declaration" (`:125`); plan decision: "sketch trigger = new flow or ≥3 interacting components; absence declared at the gate" (`:46`); spec: no contract or scenario mentions "sketch trigger" or "absence."
- defect: The plan requires §8 to include the sketch trigger (condition: new flow or ≥3 interacting components) and an absence declaration (declaring the sketch is absent at the gate). These are plan scope item 1 content and a named test direction. The spec's C1 signature (line 28) says "prose guidance + exactly one fenced example showing a sketch" but never mentions the trigger or absence declaration. No scenario gates either. The spec omits "sketch trigger" and "absence" entirely.
- fix: Add the sketch trigger condition and absence declaration to C1's signature, and add a scenario (or extend GPC1) that asserts §8 names the trigger condition and requires the absence declaration.

### SPEC-R1-06 — Sketch-in-both-modes rule unguarded

- id: SPEC-R1-06
- severity: medium
- area: B
- quote: plan: "the sketch embeds verbatim in the plan in both modes (a gate artifact, belonging to no ticket)" (`docs/plans/2026-08-09-gate-presentation-contract.md:103`); plan test directions: "the store/index split and the sketch-in-both-modes rule" (`:125`); spec: GPC2 (line 179) checks the decisions list in plain mode but not the sketch; GPC3 (line 189) checks the list and home but not the sketch.
- defect: The plan requires the sketch to embed verbatim in the plan in both plain and map modes. No spec scenario gates this rule. GPC2 (plain mode) and GPC3 (map mode) check the decisions list but neither checks that the sketch embeds in the plan. GPC14 checks the dogfood (this run's plan carries the sketch) but does not establish the general rule. A plan test direction is ungated.
- fix: Extend GPC2 or GPC3 (or add a scenario) to assert that the storage-mode rule prose requires the sketch to embed verbatim in the plan in both modes.

### SPEC-R1-07 — GPC1 mechanical scenario contains undecidable semantic assertion

- id: SPEC-R1-07
- severity: medium
- area: C
- quote: "the surrounding prose calls the sketch framing, not contractual, and throw-away" (spec GPC1 When–Then, `docs/specs/2026-08-09-gate-presentation-contract.md:172`); Falsify: "prose making the sketch contractual" (`:173`); label: "GPC1 — §8 block and three-kind example · mechanical" (`:166`)
- defect: GPC1 is labeled `mechanical` but its When–Then asserts a semantic property ("prose calls the sketch framing, not contractual, and throw-away") and its Falsify condition ("prose making the sketch contractual") is equally semantic. A runner/argv check cannot decide whether prose "calls the sketch framing" or "makes the sketch contractual" — these require human judgment. The same judgment is already covered by GPC13 (inspection, line 284–285). A mechanical scenario should assert only structural facts (block count, kind presence, grammar line text).
- fix: Remove the semantic assertion from GPC1's When–Then and Falsify, keeping only structural checks (exactly one §8 block, one fenced example, three kinds, literal grammar line). Leave the framing/contractual judgment to GPC13 (inspection) where it already lives.

### SPEC-R1-08 — C7 introduces phase-brainstorm.md §4 modification not in the plan

- id: SPEC-R1-08
- severity: medium
- area: F
- quote: "the §4 authoring-skeleton bullet in phase-brainstorm.md (pointing at references/spec-artifact-skeleton.md)" (spec C7, `docs/specs/2026-08-09-gate-presentation-contract.md:116`); GPC15 declares: "phase-brainstorm.md §4/§8, phase-plan.md §6a/§6b" as the edit surface (`:306`); plan scope authorizes phase-brainstorm.md §1, §8, §9 only (`docs/plans/2026-08-09-gate-presentation-contract.md:82,89,102`).
- defect: C7 introduces a new bullet in phase-brainstorm.md §4 pointing at spec-artifact-skeleton.md. The plan's scope items for phase-brainstorm.md are §1 (dialogue moves), §8 (gate presentation), §9 (map-mode split) — §4 is not authorized. GPC15 propagates this: it declares "phase-brainstorm.md §4/§8" as the edit surface, smuggling §4 into the scope check. The current phase-brainstorm.md §4 ("Required activity and artifact/output shape") has no spec-artifact-skeleton pointer.
- fix: Either move the authoring-skeleton bullet to §8 (which the plan authorizes) or drop C7's phase-brainstorm.md §4 component and justify the addition with an amendment.

### SPEC-R1-09 — GPC11 binding under the wrong contract

- id: SPEC-R1-09
- severity: low
- area: E
- quote: C2 "Gated by: GPC2, GPC3, GPC4, GPC11" (`docs/specs/2026-08-09-gate-presentation-contract.md:55`); F2 binding: "C2, GPC2, GPC3, GPC4" (no GPC11, `:146`); C8 "Gated by: GPC10, GPC12" (no GPC11, `:139`); F6 binding: "C8, GPC10, GPC11, GPC12" (includes GPC11, `:150`)
- defect: GPC11 ("no new dial, no schema change," line 265) gates the "no new config dial" invariant, which belongs to C8 (test discipline) / F6, not C2 (storage modes). C2 lists GPC11 in its "Gated by" but F2's binding omits it; C8 omits GPC11 from its "Gated by" but F6 includes it. The GPC11 binding is inconsistent and placed under the wrong contract.
- fix: Remove GPC11 from C2's "Gated by" (line 55) and add it to C8's "Gated by" (line 139), making both contract blocks and FR bindings consistent.

### SPEC-R1-10 — GPC13 references undefined "T1"

- id: SPEC-R1-10
- severity: low
- area: E
- quote: "Given: the §8 sketch guidance prose in phase-brainstorm.md after T1 lands." and "at T1's task-close validation, the validator (or owner) judges" (spec GPC13, `docs/specs/2026-08-09-gate-presentation-contract.md:284–285`); plan: no occurrence of "T1" anywhere in `docs/plans/2026-08-09-gate-presentation-contract.md`.
- defect: GPC13 is an inspection scenario that names its decision point as "T1's task-close validation," but T1 is not defined in the plan or the spec. The skeleton requires inspection scenarios to "name that point in its body" — the named point references an undefined identifier, so a validator cannot resolve where or when to apply this judgment.
- fix: Replace "T1" with a concretely identifiable decision point (e.g., "the Build phase's first task-close validation" or a named task id the build plan will define), or define T1 in the spec's Vocabulary.

CLEAR: A — Vocabulary, Contracts blocks, NFR table, scenario kind labels, and three-part scenario form all conform to the skeleton; every contract has all six required fields and every scenario has exactly one kind label and Given/When–Then/Falsify parts.

CLEAR: D — GPC14's dogfood claims (plan carries sketch verbatim, index gists classify nothing, home is issuecomment-5230679564) verified accurate against the real plan at HEAD (`docs/plans/2026-08-09-gate-presentation-contract.md:21–55`).

CLEAR: PROPORTIONALITY — 15 scenarios for 8 contracts follow the existing S1 pattern (contract tests on rule prose); no scenario or contract is over-engineered for a skill-doc wording change.

VERDICT: 10 findings (4 high, 4 medium, 2 low)
