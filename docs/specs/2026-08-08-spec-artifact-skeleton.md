# Specification: Spec artifact skeleton (S1)

Status: rev 1 — awaiting spec panel
Track: irreversible (freezes the specification artifact shape — a public surface later slices and consumers bind to)
Run slug: `spec-artifact-skeleton`
Map: #192 (design-phase craft), slice S1
Plan: `docs/plans/2026-08-08-spec-artifact-skeleton.md` (rev 4, owner-approved 2026-08-08, including the PLAN-R1-01 scope extension)
Author: orchestrator (`maas-qwen/qwen3.8-max`)

> **Self-demonstration.** This spec is authored in the skeleton's own form —
> Vocabulary, Contracts, kind labels, bound NFR table, three-part scenarios —
> because the shape it ships is the shape it should be reviewable against. The
> skeleton does not exist yet; this spec is the first artefact to pre-figure it.

## Amendments

### AM1 — FS19 unfreeze of `adversary-spec.prompt.md` (owner-ratified at the Plan gate)

- What: `skills/sdlc/prompts/adversary-spec.prompt.md` is temporarily removed from the `FROZEN` array in `test/frozen-surfaces.test.js` so this slice can extend it with skeleton-awareness anchors.
- Authority: owner-ratified PLAN-R1-01 scope extension at the Plan gate (2026-08-08); deliberate-change precedent set by S5 (`test/frozen-surfaces.test.js` dropped exactly three prompts, restored by re-freeze #207).
- Class: **(a)-shaped exception, owner-ratified** — a frozen surface is deliberately changed; the gate record (this section + the plan's consolidated adjudication) is the disposition.
- Pairing: the unfreeze is paired with the IDV19 reconciliation (AM2) and the mandatory re-freeze (AM3); none of the three is valid without the other two.

### AM2 — temporary IDV19 reconciliation

- What: the IDV19 test in `test/iteration-disposition.test.js` (asserts every adversary prompt stays in the frozen list) is temporarily reconciled to exempt `adversary-spec.prompt.md` while the unfreeze window is open.
- Scope: the reconciliation touches only the IDV19 test's own loop. The other two uses of `ADVERSARY_PROMPTS` in that file are untouched — the prompt change is additive and those tests keep passing.

### AM3 — mandatory post-merge re-freeze (orchestrator-owned)

- What: a track-none follow-up that re-adds `adversary-spec.prompt.md` to the `FROZEN` array and restores IDV19's full assertion.
- Owner: the **orchestrator** session, not the implementing agent (whose session ends at PR creation). Precedent: S5 (#206 → re-freeze #207), writing-comments (#223 → #224).
- Obligation record: this section and the PR description. Slice completion depends on the re-freeze merging.

### Inbound carries

None: the Plan minted no `CARRY-TO-SPEC` (plan, "Context for the next agent": "No carry is minted"). Nothing to land; the no-orphan rule is trivially satisfied.

## Vocabulary

| Term | Definition | Binds to |
|---|---|---|
| skeleton | The spec-authoring artefact this slice ships: literal fill-in blocks for the five components | `skills/sdlc/references/spec-artifact-skeleton.md` |
| binding rule | A prose law a spec must satisfy at authoring time; missing any piece is a spec defect | `skills/sdlc/references/phase-spec.md` §4 |
| contract block | The per-interface specification block: signature/shape, preconditions, postconditions, invariants, error semantics, gating scenario ids | skeleton `## Contracts` |
| kind label | Exactly one of `mechanical` / `inspection` / `carried` per scenario | skeleton kind-label section; this spec's scenarios |
| unbound marker | The literal text `unbound — accepted at gate`, with a reason, marking an NFR with no binding scenario | skeleton NFR table; last row of this spec's NFR table |
| anchor | An additive sentence inside an existing lettered attack surface of the spec-review prompt, naming a skeleton component and citing the skeleton path | `skills/sdlc/prompts/adversary-spec.prompt.md` |
| canonical rule sentence | One of the four numbered binding-rule sentences fixed in C2; the prompt must never contain them verbatim | C2, SAS4 |
| unfreeze / re-freeze | Temporary removal / mandatory restoration of one entry in the `FROZEN` array | `test/frozen-surfaces.test.js` |
| deliberate-change precedent | The FS19 pattern: a frozen prompt is changed deliberately, unfrozen in the same branch, re-frozen post-merge | S5: #206 → re-freeze #207 |

## Contracts

### C1 — `skills/sdlc/references/spec-artifact-skeleton.md` (new file)

- Signature/shape: one markdown reference file, H1 exactly `# Spec artifact skeleton`, containing five sections in this order with these exact fill-in blocks:
  1. `## Vocabulary` — table header exactly `| Term | Definition | Binds to |`, fill-in row `| <term> | <one-sentence definition> | <identifier or file> |`, plus the binding-rule sentence (mirrors C2 rule 1).
  2. `## Contracts` — fill-in block: `### <interface name>` with bullet rows `- Signature/shape:`, `- Preconditions:`, `- Postconditions:`, `- Invariants:`, `- Error semantics:` (precedence when several fire, or "at most one error possible"), `- Gated by:` (scenario ids); plus the binding-rule sentence (mirrors C2 rule 2) and the explicit note that interfaces mentioned only as unchanged context get no block and must not be silently re-described.
  3. `## Scenario kind labels` — defines exactly three labels, `mechanical` (a runner/argv check can decide it), `inspection` (a human or panel decides it at a named decision point — the label names that point), `carried` (deferred to a later phase — the label names the destination); states the one-label-per-scenario rule and that the mechanical/total ratio must be readable off the spec (mirrors C2 rule 3).
  4. `## Non-functional requirements` — table header exactly `| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |`; the Binding cell is a scenario id present in the spec's scenario list or the literal `unbound — accepted at gate` with a reason (mirrors C2 rule 4).
  5. `## Scenario form` — three named parts on separate lines: `Given:` (state/fixture; `Given: none` permitted and expected for pure-function scenarios), `When–Then:` (behaviour + outcome), `Falsify:` (what would show the scenario failing). No keyword parser, no step definitions.
- Preconditions: none (new file).
- Postconditions: the file exists at that path with those literal markers; every component is a non-empty fill-in scaffold (authoring guidance), not process narrative; the file is discoverable by FS11 (paired with C4).
- Invariants: the skeleton is authoring guidance, never mechanical prevention — it contains no checker, parser, or tooling mandate (SAS11).
- Error semantics: static markdown; the failure mode is a missing marker, surfaced by the contract tests (C7). Markers are independent, so several may fail simultaneously and each reports independently.
- Gated by: SAS1, SAS11, SAS12.

### C2 — `skills/sdlc/references/phase-spec.md` §4 binding rules

- Signature/shape: one new paragraph inserted immediately after §4's first paragraph ("Produce the Spec doc…"), before "Premise durability". It points at the skeleton and fixes four canonical rule sentences, numbered, verbatim:
  1. "every coined term used two or more times in the body appears in the Vocabulary table, and every term in the table appears in the body"
  2. "every interface this change introduces or modifies has a Contracts block"
  3. "every scenario carries exactly one kind label"
  4. "every NFR has a response measure and a binding scenario id, or the literal marker `unbound — accepted at gate` with a reason"
  followed by: anything missing is a spec defect, and the pointer `references/spec-artifact-skeleton.md`.
- Preconditions: §4 exists and its current paragraphs (Premise durability, Dialogue discipline, configuration callout) stay intact and in order.
- Postconditions: §4 states all four binding rules and points to the skeleton; no other section of `phase-spec.md` changes.
- Invariants: the rules are prose law — no mechanical checker is introduced anywhere by this slice.
- Error semantics: a missing rule sentence or pointer fails the contract tests (C7); independent assertions, each reports independently.
- Gated by: SAS2, SAS4.

### C3 — `skills/sdlc/prompts/adversary-spec.prompt.md` skeleton-awareness anchors

- Signature/shape: additive sentences inside four existing lettered attack surfaces; no new letter, no renumbering, no output-contract change:
  - **B (Verification scenarios):** anchor asking whether every scenario carries exactly one kind label per `references/spec-artifact-skeleton.md` (`mechanical` / `inspection` / `carried` — inspection naming its decision point, carried its destination), and whether every scenario block carries the three-part form (`Given:` / `When–Then:` / `Falsify:`).
  - **C (Contracts and interfaces):** anchor asking whether every interface the spec introduces or modifies has a Contracts block per `references/spec-artifact-skeleton.md` (signature/shape, preconditions, postconditions, invariants, error semantics incl. precedence, gating scenario ids), flagging any empty cell; interfaces mentioned only as unchanged context must not be silently re-described.
  - **D (Contradictions):** term-precision anchor asking whether every coined term used two or more times in the body appears in the spec's Vocabulary table bound to an identifier or file, and every table term appears in the body.
  - **F (Non-functional requirements):** anchor asking whether each NFR row carries characteristic, stimulus/condition, response measure, and a binding scenario id — or the explicit unbound marker with a reason — per `references/spec-artifact-skeleton.md`.
- Preconditions: the file is unfrozen per AM1; the existing A–H letter set, the Delta rounds section, and the STRICT output format (including the `CLEAR: <letter>` line contract) are byte-stable.
- Postconditions: the prompt names all five skeleton components and cites the skeleton path; it never contains the four canonical rule sentences of C2 verbatim (anchors are question-form, distinct text).
- Invariants: reference, never restate — the skeleton and §4 own the rule definitions; the prompt owns only the checking instruction.
- Error semantics: a missing anchor fails SAS3; a restated rule sentence fails SAS4. Independent assertions. The prompt is package-default only: consumer overrides resolve first by design and are out of scope (plan, Out).
- Gated by: SAS3, SAS4.

### C4 — `skills/sdlc/assets/normative-references.json` inventory row

- Signature/shape: one new entry in `sources[]`:
  `{ "id": "reference.spec-artifact-skeleton", "source": "skills/sdlc/references/spec-artifact-skeleton.md", "assertion": "# Spec artifact skeleton", "targetKind": "file", "ownership": "package", "required": true, "resolution": "package", "target": "skills/sdlc/references/spec-artifact-skeleton.md", "class": "package-public" }`
- Preconditions: the skeleton file exists (C1) — `skills/sdlc/references/*.md` is a discovery root, so the moment the file exists, inverse completeness requires this row.
- Postconditions: `check-references` passes with the new file present (row resolves, discovery is inverse-complete).
- Invariants: no other row changes; `schemaVersion` stays 1.
- Error semantics: missing row → `check-references` fails inverse completeness for the new file; malformed row → schema validation fails. At most one cause per failure line.
- Gated by: SAS5.

### C5 — `test/frozen-surfaces.test.js` unfreeze

- Signature/shape: exactly one line removed from the `FROZEN` array — `"skills/sdlc/prompts/adversary-spec.prompt.md",` (currently line 30). No other entry added, removed, or reordered; `baseRef()` and the ASD19 test body untouched.
- Preconditions: AM1 recorded in this spec's Amendments.
- Postconditions: ASD19's diff guard governs the remaining 16 frozen surfaces; the spec prompt is deliberately mutable on this branch.
- Invariants: all other entries byte-stable (SAS6, SAS8).
- Error semantics: removing any further entry fails SAS6's membership contract; the ASD19 guard then silently narrows — SAS8 is the catch.
- Gated by: SAS6, SAS8.

### C6 — `test/iteration-disposition.test.js` IDV19 reconciliation

- Signature/shape: the IDV19 test's `for (const slug of ADVERSARY_PROMPTS)` loop is temporarily narrowed to exclude `"spec"` (e.g. a filter), with an accompanying comment naming AM1/AM3 and the re-freeze obligation. The `ADVERSARY_PROMPTS` constant itself is untouched; the other two loops using it (lines ~437, ~450) are untouched; the `validator-task.prompt.md` assertion in IDV19 stays.
- Preconditions: C5 applied (the exemption is only true while the unfreeze window is open).
- Postconditions: IDV19 still asserts plan + review adversary prompts and validator-task stay frozen; it stops asserting the deliberately-unfrozen spec prompt.
- Invariants: the reconciliation is minimal — one loop + one comment (SAS7).
- Error semantics: an over-broad reconciliation (touching other tests or the constant) fails SAS7; restoring the loop is the re-freeze's job (AM3).
- Gated by: SAS7.

### C7 — contract tests

- Signature/shape: one new test file (name chosen at Build), pure offline string assertions over the markdown/test surfaces, asserting exactly:
  - M1: C1's H1 and all literal markers of the five components (section headers, table headers, bullet labels, the three kind-label names, the unbound marker, the three scenario-form labels).
  - M2: C2's four canonical rule sentences and the skeleton pointer, in `phase-spec.md`.
  - M3: C3's anchor presence — all five component names + the skeleton path in the prompt; the A–H letter set present; the STRICT output-format header and the `CLEAR:` line contract unchanged.
  - M4: C2's four canonical rule sentences are absent from the prompt (the reference-never-restate law).
  - M5: C4's row is present with those exact `id`/`target`/`assertion` values.
  - M6: C5's membership contract (16 entries, spec prompt absent, every other frozen path present).
  - M7: C6's minimality (IDV19 exempts only `"spec"`; constant and sibling loops untouched).
- Preconditions: C1–C6 landed.
- Postconditions: the suite is deterministic, offline, budget < 1 s; every marker assertion names the file and marker it checks.
- Invariants: no network, no new dependency, no snapshot tooling.
- Error semantics: each marker set fails independently with a message naming file + marker; co-occurring failures report independently (no precedence — parallel assertions).
- Gated by: SAS1–SAS7 (each scenario's mechanical half is one marker set), SAS10.

## Functional requirements

- FR1: the skeleton ships the five components as literal fill-in blocks (C1).
- FR2: `phase-spec.md` §4 states the four binding rules and points to the skeleton (C2).
- FR3: the spec-review prompt gains skeleton-awareness anchors within the existing lettered surfaces (C3).
- FR4: the skeleton is FS11-discoverable (C4).
- FR5: the unfreeze machinery lands as specified (C5, C6), recorded in Amendments, paired with the re-freeze obligation (AM3).
- FR6: contract tests prove all of the above offline (C7).
- FR7: traceability — each gap maps to a non-empty component by id: G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form.

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
|---|---|---|---|
| Performance efficiency | Full test corpus run offline (CI equivalent) | Completes green under a 30-second external timeout (#177 precedent); contract tests < 1 s | SAS10 |
| Compatibility | Any frozen surface diffed against the branch base | Byte-identical for all 17 remaining frozen entries + `templates/sdlc-spec.md`; only the AM1-class surfaces differ | SAS8, SAS9 |
| Maintainability | A reviewer or future slice reads the spec-review prompt | The prompt references the skeleton, never restates the four canonical rule sentences | SAS4 |
| Portability | A consumer adopts the skeleton in any language/toolchain | No runtime assertion machinery, Gherkin-family tooling, or new dependency anywhere in the slice | SAS10, SAS11 |
| Maintainability (future slices) | S2/S6 reuse the skeleton pattern (plan assumption 2) | Future-slice quality — this slice's evidence is that the shape is a generic `references/<skeleton>.md` with no spec-only content, inspected at the spec gate | unbound — accepted at gate |

## Verification scenarios

Ratio: 11 mechanical / 2 inspection / 0 carried = 13 total (85% mechanical).

### SAS1 — the skeleton ships five components as literal fill-in blocks `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: the contract tests' M1 set passes — the skeleton exists with H1 `# Spec artifact skeleton` and every literal marker of the five components (headers `## Vocabulary`, `## Contracts`, `## Scenario kind labels`, `## Non-functional requirements`, `## Scenario form`; the two table headers; bullet labels `- Preconditions:`, `- Postconditions:`, `- Invariants:`, `- Error semantics:`, `- Gated by:`; the three kind-label names; the unbound marker; `Given:`, `When–Then:`, `Falsify:`).
Falsify: removing any marker fails the corresponding M1 assertion.

### SAS2 — §4 carries the four binding rules and the pointer `(mechanical)`

Given: branch HEAD with C2 landed.
When–Then: M2 passes — all four canonical rule sentences and the `references/spec-artifact-skeleton.md` pointer appear in `phase-spec.md` §4, inserted after the first paragraph with the existing paragraphs intact and in order.
Falsify: deleting any rule sentence or the pointer fails M2.

### SAS3 — the prompt anchors all five components without touching the output contract `(mechanical)`

Given: branch HEAD with C3 landed (unfreeze per AM1 in force).
When–Then: M3 passes — the prompt contains all five component names and the skeleton path; the lettered surfaces remain exactly A through H; the STRICT output-format header and the `CLEAR: <letter>` line contract are byte-stable.
Falsify: removing an anchor fails M3; adding a letter or editing the output contract also fails M3.

### SAS4 — the prompt references, never restates `(mechanical)`

Given: branch HEAD with C2 and C3 landed.
When–Then: M4 passes — none of the four canonical rule sentences of C2 appears verbatim anywhere in the prompt.
Falsify: copying any canonical sentence into the prompt fails M4.

### SAS5 — the skeleton is FS11-discoverable `(mechanical)`

Given: branch HEAD with C1 and C4 landed.
When–Then: M5 passes (the row carries the exact `id`/`target`/`assertion` values of C4) and `node skills/sdlc/scripts/check-references.mjs` exits 0 — the discovery root `skills/sdlc/references/*.md` is inverse-complete with the new file present.
Falsify: dropping the row makes `check-references` fail inverse completeness for the new file.

### SAS6 — the unfreeze removes exactly one frozen entry `(mechanical)`

Given: branch HEAD with C5 landed.
When–Then: M6 passes — the `FROZEN` array holds exactly 16 entries, `adversary-spec.prompt.md` is absent, every other frozen path from the pre-slice list is present, and entry order is otherwise unchanged.
Falsify: removing or reordering any further entry fails M6.

### SAS7 — the IDV19 reconciliation is minimal `(mechanical)`

Given: branch HEAD with C6 landed.
When–Then: M7 passes — the IDV19 test exempts only `"spec"`; the `ADVERSARY_PROMPTS` constant, the two sibling loops, and the `validator-task.prompt.md` assertion are byte-stable relative to the branch base.
Falsify: touching the constant or a sibling loop fails M7.

### SAS8 — all other frozen surfaces stay byte-identical `(mechanical)`

Given: branch HEAD with C5 landed.
When–Then: the standing ASD19 diff guard (`test/frozen-surfaces.test.js`) passes against the reduced `FROZEN` list — every remaining frozen surface is byte-identical to the branch base. Non-change claim, so per `phase-spec.md` §4 premise durability it routes to the standing diff guard rather than a base-relative scenario test.
Falsify: any diff in a remaining frozen path fails ASD19.

### SAS9 — `templates/sdlc-spec.md` is unchanged `(mechanical)`

Given: branch HEAD.
When–Then: `git diff` of `templates/sdlc-spec.md` against the branch base is empty (plan scope: the template stays a pure standalone-entrypoint router).
Falsify: any edit to the template produces a non-empty diff.

### SAS10 — corpus green, offline, inside budget; no new dependency `(mechanical)`

Given: branch HEAD with all contracts landed; no network.
When–Then: `npm test` passes under a 30-second external timeout (#177 precedent); the new contract-test file runs in under 1 s; `package.json` and the lockfile are unchanged against the branch base.
Falsify: any failing test, a > 30 s run, or a dependency diff fails this scenario.

### SAS11 — the skeleton mandates no tooling `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: the contract tests assert (i) the skeleton contains no Cucumber/Behat/Gherkin vocabulary at all, and (ii) the scenario-form section carries the positive rejection sentence "No keyword parser, no step definitions."
Falsify: introducing any of the denied tool names, or deleting the rejection sentence, fails the assertion.

### SAS12 — gap traceability and guidance-not-prevention `(inspection)`

Given: the committed spec, skeleton, §4, and prompt.
When–Then: at the **spec gate**, the panel confirms (i) each gap maps to a non-empty component by id (G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form, FR7); and (ii) the skeleton reads as authoring guidance — every component is a fill-in scaffold, nothing in the slice behaves as a mechanical checker beyond the contract tests that pin the guidance text.
Falsify: a gap with an empty or missing component, or any component that reads as tooling/ceremony mandate, fails this scenario at the gate.

### SAS13 — the re-freeze obligation is recorded where the lifecycle can find it `(inspection)`

Given: this spec's Amendments (AM3) and the PR description.
When–Then: at the **PR gate**, both surfaces name the track-none re-freeze, its orchestrator owner, and its two components (restore the `FROZEN` entry; restore IDV19's full assertion), and state that slice completion depends on it merging.
Falsify: a PR description missing any of those elements fails this scenario; the gate does not pass until recorded.

## Assumptions

1. The skeleton lives under `references/` and `templates/sdlc-spec.md` stays a pure router — owner-ratified in Brainstorm, restated by the approved plan (assumption 1).
2. Enforcement rides the package-default prompt only; consumer overrides are consumer law and out of scope (plan, Out).
3. The contract tests' file name is a Build decision; this spec fixes only the assertion inventory (M1–M7).
4. Round mechanics of the spec panel (delta rounds, NEW/REOPENED tags) already exist in the prompt and are untouched by this slice.

## Out of scope (restated from the approved plan)

R3-G3/G7 (spec amendment seam, re-round mechanics — shipped in S5), R3-G8/G9 (→S7), R3-G10/G11 (→#158 build stream), consumer override migration, runtime assertion machinery, Gherkin/tooling mandates, template changes, any new gate/dial/config/schema change.
