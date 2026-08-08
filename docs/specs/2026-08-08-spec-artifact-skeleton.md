# Specification: Spec artifact skeleton (S1)

Status: rev 4 — amended after spec-panel round 3 (round 1: SPEC-R1-01..13; round 2: SPEC-R2-01..09; round 3: SPEC-R3-01..06 — all incorporated; see `docs/reviews/spec-review-spec-artifact-skeleton-2026-08-08/consolidated.md`)
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
  1. `## Vocabulary` — table header exactly `| Term | Definition | Binds to |`, fill-in row `| <term> | <one-sentence definition> | <identifier or file> |`, plus the binding-rule sentence — C2's exact canonical sentence 1.
  2. `## Contracts` — fill-in block: `### <interface name>` with bullet rows `- Signature/shape:`, `- Preconditions:`, `- Postconditions:`, `- Invariants:`, `- Error semantics:` (precedence when several fire, or "at most one error possible"), `- Gated by:` (scenario ids); plus the binding-rule sentence — C2's exact canonical sentence 2 (whose parenthetical is itself the explicit note that interfaces mentioned only as unchanged context get no block and must not be silently re-described).
  3. `## Scenario kind labels` — defines exactly three labels, `mechanical` (a runner/argv check can decide it), `inspection` (a human or panel decides it at a named decision point — the scenario names that point in its body, the label stays the literal `inspection`), `carried` (deferred to a later phase — the scenario names the destination in its body, the label stays the literal `carried`); states the one-label-per-scenario rule and that the mechanical/total ratio must be readable off the spec — C2's exact canonical sentence 3.
  4. `## Non-functional requirements` — table header exactly `| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |`; the Binding cell is a scenario id present in the spec's scenario list or the literal `unbound — accepted at gate` with a reason — C2's exact canonical sentence 4.
  5. `## Scenario form` — three named parts on separate lines: `Given:` (state/fixture; `Given: none` permitted and expected for pure-function scenarios), `When–Then:` (behaviour + outcome), `Falsify:` (what would show the scenario failing). No keyword parser, no step definitions.
- Preconditions: none (new file).
- Postconditions: the file exists at that path with those literal markers; every component is a non-empty fill-in scaffold (authoring guidance), not process narrative; the file is discoverable by FS11 (paired with C4).
- Invariants: the skeleton is authoring guidance, never mechanical prevention — it contains no checker, parser, or tooling mandate (SAS11).
- Error semantics: static markdown; the failure mode is a missing marker, surfaced by the contract tests (C7). Markers are independent, so several may fail simultaneously and each reports independently.
- Gated by: SAS1, SAS11, SAS12.

### C2 — `skills/sdlc/references/phase-spec.md` §4 binding rules

- Signature/shape: one new paragraph inserted immediately after §4's first paragraph ("Produce the Spec doc…"), before "Premise durability". It points at the skeleton and fixes four canonical rule sentences, numbered, verbatim:
  1. "every coined term used two or more times in the body appears in the Vocabulary table, and every term in the table appears in the body"
  2. "every interface this change introduces or modifies has a Contracts block (interfaces mentioned only as unchanged context do not, and must not be silently re-described)"
  3. "every scenario carries exactly one kind label and the mechanical/total ratio is readable off the spec"
  4. "every NFR has a response measure and a binding scenario id, or the literal marker `unbound — accepted at gate` with a reason"
  followed by: anything missing is a spec defect, and the pointer `references/spec-artifact-skeleton.md`.
- Preconditions: §4 exists and its current paragraphs (Premise durability, Dialogue discipline, configuration callout) stay intact and in order.
- Postconditions: §4 states all four binding rules and points to the skeleton; no other section of `phase-spec.md` changes.
- Invariants: the rules are prose law — no mechanical checker is introduced anywhere by this slice.
- Error semantics: a missing rule sentence or pointer fails the contract tests (C7); independent assertions, each reports independently.
- Gated by: SAS2, SAS4.

### C3 — `skills/sdlc/prompts/adversary-spec.prompt.md` skeleton-awareness anchors

- Signature/shape: additive sentences inside four existing lettered attack surfaces; no new letter, no renumbering, no output-contract change. Each anchor NAMES its component, instructs the reviewer to verify the spec against the component's definition in `references/spec-artifact-skeleton.md`, and cites that path — no anchor restates any rule logic (the reference-never-restate law, plan In #3):
  - **B (Verification scenarios):** anchor: every scenario is checked for its kind label and the three-part scenario form per `references/spec-artifact-skeleton.md`.
  - **C (Contracts and interfaces):** anchor: every interface the spec introduces or modifies is checked for a Contracts block per `references/spec-artifact-skeleton.md`; empty cells are flagged.
  - **D (Contradictions):** anchor: term precision is checked against the spec's Vocabulary table per `references/spec-artifact-skeleton.md`.
  - **F (Non-functional requirements):** anchor: every non-functional requirement is checked for its measure and binding per `references/spec-artifact-skeleton.md`.
- Preconditions: the file is unfrozen per AM1; the existing A–H letter set, the Delta rounds section, and the STRICT output format (including the `CLEAR: <letter>` line contract) are byte-stable.
- Postconditions: the prompt names all five skeleton components and cites the skeleton path; none of C2's four canonical rule sentences appears in it as a contiguous substring (M4's exact matching semantics).
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
- Gated by: SAS5 (mechanical half: the new row's shape and the row count), SAS9 (inspection half: the no-other-row-changed invariant, as a non-change claim inspected at the PR-gate diff — the standing premise-durability routing, same as SAS8/SAS9's other non-change claims).

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
  - M1: C1's H1 and all literal markers of the five components (section headers, table headers, bullet labels, the three kind-label names, the unbound marker, the three scenario-form labels); the five section headers in the fixed order, and the file's complete section set exactly those five sections — no extras — with every marker and placeholder appearing only between its owning section header and the next; C2's four canonical rule sentences present in the skeleton, each inside its owning section (Vocabulary→1, Contracts→2, Scenario kind labels→3, Non-functional requirements→4); and every literal fill-in placeholder of C1 (`<term>`, `<one-sentence definition>`, `<identifier or file>`, `<interface name>`, the fill-in table row).
  - M2: in `phase-spec.md` §4 — the first paragraph still begins `Produce the Spec doc:`; C2's four canonical rule sentences and the skeleton pointer appear in one paragraph after that first paragraph and before the paragraph beginning `**Premise durability.**`; and the paragraphs beginning `**Premise durability.**`, `**Dialogue discipline.**`, and `> **Under your configuration:**` follow, in that order — all literal anchor assertions, durable after merge.
  - M3: C3's structural protection — exactly eight attack-surface headings `A.` through `H.` in order and no letter beyond H; the four anchors present inside the B, C, D, F surface paragraphs (after each letter heading, before the next), each anchor containing its component name and the literal skeleton path `references/spec-artifact-skeleton.md`, and the four anchors together naming all five skeleton components (Vocabulary, Contracts, Scenario kind labels, Non-functional requirements, Scenario form); the `## Delta rounds` section — from its heading to the `## Output format` heading, trailing blank lines normalized — byte-identical to literal block **L1** pinned under C7 (C3's byte-stability precondition covers it, so the protection must too, and assumption 5 requires the expectation to be self-contained rather than left to whatever block the test chooses to embed); the output-format section from `## Output format` to end-of-file (trailing newline normalized) byte-identical to literal block **L2** pinned under C7 (the current closed contract: title/severity/confidence/origin/location/defect/evidence/impact/fix fields, the `CLEAR: <letter>` line, and the ranking instructions).
  - M4: none of C2's four canonical rule sentences — the exact strings fixed there — appears anywhere in the prompt as a contiguous substring (the reference-never-restate law).
  - M5: C4's row matches all nine fields exactly (every schema-required key present with C4's values; the schema forbids additional keys), the optional `verification` key is absent from it, and the inventory contains exactly 81 rows. The "no other row changed" invariant is not mechanically provable without a baseline and routes to SAS9's PR-gate diff inspection (C4's gating split).
  - M6: C5's membership contract — the `FROZEN` array holds exactly the 16 entries of C7's pinned list **L3**, in L3's exact order (the pre-slice list minus `adversary-spec.prompt.md`): the spec prompt is absent and every other frozen path present and unreordered.
  - M7: C6's minimality (IDV19 exempts only `"spec"`; constant and sibling loops untouched) plus the accompanying comment's presence — it names AM1 and AM3 and the re-freeze obligation (literal content assertion).
  - M8: SAS11's pair — the skeleton contains no `Cucumber`, `Behat`, or `Gherkin` substring at all, and its scenario-form section contains the literal sentence "No keyword parser, no step definitions."

**Pinned literal blocks (M3, M6).** Self-contained expectations per assumption 5 — the Build test embeds exactly these bytes, so a tampered embed cannot pass its own contract.

L1 — the prompt's `## Delta rounds` section:

```
## Delta rounds

Round 1 reviews the whole spec. **Every round after the first is a delta review.** The caller gives you the prior rounds' findings and their dispositions, and your review is scoped to the delta since the previous round. Tag every finding `NEW`, or `REOPENED(<prior-id>)` when you re-raise an already-dispositioned finding by its id. A reopen is legal only when you cite evidence that did not exist, or was not available, when that finding was dispositioned; otherwise do not re-raise it. Confirming a prior fix is one line, not a re-litigation.
```

L2 — the prompt's output-format section, `## Output format` to end-of-file:

```
## Output format (STRICT: markdown only, findings only, no preamble, no conclusion)

### <short title>

- severity: high | medium | low
- confidence: high | medium (drop anything lower; do not speculate)
- origin: NEW | REOPENED(<prior-id>)
- location: <spec section, or doc/file:line>
- defect: <one or two sentences: the concrete problem>
- evidence: <what you verified: quoted spec text, file:line in the repo, or framework file:line at the pinned version>
- impact: <why it matters: what freezes wrong, what test cannot gate, what claim is false>
- fix: <one sentence: the minimal spec change>

Rank most-severe first. For each attack surface A to H where you found nothing, emit one line: `CLEAR: <letter> — <one-line reason>`. Prefer a few high-confidence, evidence-backed findings over a long speculative list. Every finding must be concrete enough that the spec author could act on it without asking you anything.
```

L3 — the expected post-unfreeze `FROZEN` array, in exact order:

```
skills/sdlc/scripts/sdlc-status.mjs
skills/sdlc/scripts/sdlc-status.sh
skills/sdlc/scripts/check-lifecycle.mjs
skills/sdlc/scripts/check-lifecycle.sh
skills/sdlc/scripts/lib.mjs
skills/sdlc/schema/sdlc.config.schema.json
skills/sdlc/schema/sdlc.config.example.json
skills/sdlc/schema/task-validation-manifest.schema.json
skills/sdlc/scripts/resolve-panel.mjs
skills/sdlc/scripts/resolve-panel.sh
skills/sdlc/scripts/validate-task.mjs
skills/sdlc/scripts/validate-task.sh
skills/sdlc/scripts/verify-task-receipt.mjs
skills/sdlc/prompts/adversary-plan.prompt.md
skills/sdlc/prompts/adversary-review.prompt.md
skills/sdlc/prompts/validator-task.prompt.md
```

- Preconditions: C1–C6 landed.
- Postconditions: the suite is deterministic, offline, budget < 1 s; every marker assertion names the file and marker it checks.
- Invariants: no network, no new dependency, no snapshot tooling.
- Error semantics: each marker set fails independently with a message naming file + marker; co-occurring failures report independently (no precedence — parallel assertions).
- Gated by: SAS1–SAS7 (each scenario's mechanical half is one marker set, M1–M7), SAS11 (its mechanical half is marker set M8), SAS10 (the DoD-7 sweep runs the whole suite). SAS8 and SAS9 gate C5 and the PR diff respectively, not C7.

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
| Compatibility | Any frozen surface diffed against the branch base | Byte-identical for all 16 remaining frozen entries; the PR diff contains only the permitted change classes (`templates/sdlc-spec.md`, `test/fixtures/consumer/`, `package.json`, lockfile all untouched) | SAS8, SAS9 |
| Maintainability | A reviewer or future slice reads the spec-review prompt | The prompt references the skeleton, never restates the four canonical rule sentences | SAS4 |
| Portability | A consumer adopts the skeleton in any language/toolchain | No runtime assertion machinery, Gherkin-family tooling, or new dependency anywhere in the slice | SAS10, SAS11 |
| Maintainability (future slices) | S2/S6 reuse the skeleton pattern (plan assumption 2) | Future-slice quality — this slice's evidence is that the shape is a generic `references/<skeleton>.md` with no spec-only content, inspected at the spec gate | unbound — accepted at gate — reason: only verifiable when S2/S6 land; self-demonstrated here by keeping the skeleton spec-generic |

## Verification scenarios

Ratio: 10 mechanical / 3 inspection / 1 carried = 14 total (71% mechanical). The mechanical ratio fell deliberately in rev 2: round-1 adjudication moved base-relative non-change claims out of mechanical scenarios and into a PR-gate diff inspection (SAS9) under the premise-durability law (`phase-spec.md` §4; `CONTRIBUTING.md` "Durable scenario premises") — honesty over ratio, which is exactly what kind labels are for.

### SAS1 — the skeleton ships five components as literal fill-in blocks `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: the contract tests' M1 set passes — the skeleton exists with H1 `# Spec artifact skeleton`; its complete section set is exactly those five component sections, each component's markers and placeholders appearing inside its own section (between its header and the next); the five component headers (`## Vocabulary`, `## Contracts`, `## Scenario kind labels`, `## Non-functional requirements`, `## Scenario form`) appear in that fixed order; every literal marker is present (the two table headers; bullet labels `- Preconditions:`, `- Postconditions:`, `- Invariants:`, `- Error semantics:`, `- Gated by:`; the three kind-label names; the unbound marker; `Given:`, `When–Then:`, `Falsify:`); C2's four canonical rule sentences, each inside its owning section; and every literal fill-in placeholder of C1 is present (`<term>`, `<one-sentence definition>`, `<identifier or file>`, `<interface name>`, the fill-in table row) — proving a fill-in scaffold, not an empty or reordered document.
Falsify: removing any marker or placeholder, reordering the sections, adding any extra section, or moving a marker or placeholder out of its owning section fails the corresponding M1 assertion.

### SAS2 — §4 carries the four binding rules and the pointer `(mechanical)`

Given: branch HEAD with C2 landed.
When–Then: M2 passes — all four canonical rule sentences, including the unchanged-context clause in rule 2 and the ratio clause in rule 3, and the `references/spec-artifact-skeleton.md` pointer appear in `phase-spec.md` §4, inserted after the first paragraph with the existing paragraphs intact and in order.
Falsify: deleting any rule sentence, either clause, or the pointer fails M2; so does placing the rules paragraph anywhere but between §4's first paragraph and `**Premise durability.**`, or deleting, reordering, or altering any of §4's existing anchor paragraphs.

### SAS3 — the prompt's structure is protected, anchors placed inside B/C/D/F `(mechanical)`

Given: branch HEAD with C3 landed (unfreeze per AM1 in force).
When–Then: M3 passes — the prompt contains exactly eight attack-surface headings `A.` through `H.` in order and no letter beyond H; the four anchors appear inside the B, C, D, F surface paragraphs (after each letter heading, before the next), each naming its component and citing `references/spec-artifact-skeleton.md`, together naming all five skeleton components; the `## Delta rounds` section is byte-identical to literal block **L1** pinned at C7; the output-format section from `## Output format` to end-of-file is byte-identical to literal block **L2** pinned at C7.
Falsify: removing an anchor, stripping a component name or the skeleton path from an anchor, adding a ninth letter, placing an anchor outside B/C/D/F, editing any Delta-rounds line, or editing any output-format line fails M3.

### SAS4 — the prompt references, never restates `(mechanical)`

Given: branch HEAD with C2 and C3 landed.
When–Then: M4 passes — none of C2's four canonical rule sentences appears anywhere in the prompt as a contiguous substring (exact matching semantics; the anchors of C3 are distinct text that name components and cite the skeleton path).
Falsify: copying any canonical sentence, or any contiguous span of one, into the prompt fails M4.

### SAS5 — the skeleton is FS11-discoverable `(mechanical)`

Given: branch HEAD with C1 and C4 landed.
When–Then: M5 passes (the row matches all nine fields of C4 exactly, the optional `verification` key is absent, and the inventory contains exactly 81 rows) and `node skills/sdlc/scripts/check-references.mjs` exits 0 — the discovery root `skills/sdlc/references/*.md` is inverse-complete with the new file present.
Falsify: dropping the row makes `check-references` fail inverse completeness; a semantically wrong but schema-valid row, an unexpected extra key, or a missing required key fails M5; any change to another row fails C4's invariant via SAS9's diff inspection.

### SAS6 — the unfreeze removes exactly one frozen entry `(mechanical)`

Given: branch HEAD with C5 landed.
When–Then: M6 passes — the `FROZEN` array holds exactly 16 entries, `adversary-spec.prompt.md` is absent, every other frozen path from the pre-slice list is present, and entry order is otherwise unchanged.
Falsify: removing or reordering any further entry fails M6.

### SAS7 — the IDV19 reconciliation is minimal `(mechanical)`

Given: branch HEAD with C6 landed.
When–Then: M7 passes — the IDV19 test's loop is the only filtered use of `ADVERSARY_PROMPTS` (exempting exactly `"spec"`); the constant is asserted as the literal `["plan", "spec", "review"]`, the two sibling loops iterate unfiltered, the `validator-task.prompt.md` assertion remains, and the accompanying comment names AM1 and AM3 and the re-freeze obligation — all as literal content assertions, durable after merge.
Falsify: touching the constant, filtering a sibling loop, broadening the exemption, or deleting or hollowing the AM1/AM3 comment fails M7.

### SAS8 — all other frozen surfaces stay byte-identical `(mechanical)`

Given: branch HEAD with C5 landed.
When–Then: the standing ASD19 diff guard (`test/frozen-surfaces.test.js`) passes against the reduced `FROZEN` list — every remaining frozen surface is byte-identical to the branch base. Non-change claim, so per `phase-spec.md` §4 premise durability it routes to the standing diff guard rather than a base-relative scenario test.
Falsify: any diff in a remaining frozen path fails ASD19.

### SAS9 — the PR diff contains only the permitted change classes `(inspection)`

Given: the branch's full diff at the **PR gate**.
When–Then: the panel confirms every diff hunk falls inside the plan's permitted change classes (assumption 4): the new skeleton file, `phase-spec.md` §4, the deliberately-unfrozen prompt, the inventory row, the two named test changes, and the new contract-test file — and nothing else. In particular `templates/sdlc-spec.md` is unchanged, everything under `test/fixtures/consumer/` is byte-identical (plan A3 strict boundary), and `package.json` plus the lockfile carry no dependency change. Non-change claims, so per the premise-durability law they are inspected against the authoring diff here rather than encoded as base-relative scenario tests (none of these surfaces is in the standing FROZEN guard, and adding them is out of scope).
Falsify: any hunk outside the permitted list fails this scenario at the PR gate.

### SAS10 — corpus green, offline, inside budget; full DoD-7 sweep `(mechanical)`

Given: branch HEAD with all contracts landed; no network.
When–Then: `npm test` passes under a 30-second external timeout (#177 precedent); the new contract-test file runs in under 1 s; `biome check` over the changed files is clean; `node skills/sdlc/scripts/check-references.mjs` exits 0; `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug spec-artifact-skeleton` exits 0 (plan DoD 7; the checker requires exactly one declaration-source group, so the bare invocation is invalid — at DoD-7 time the build document exists and the track/slug form resolves). The current spec-stage failure (`artifact.build: no committed build document`) is expected until the Build phase lands and is not a spec defect.
Falsify: any failing test, a > 30 s run, a biome finding on a changed file, a failing inventory check, or the lifecycle check failing with those arguments once the build document exists, fails this scenario.

### SAS11 — the skeleton mandates no tooling `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: the M8 assertions pass — (i) the skeleton contains no Cucumber/Behat/Gherkin vocabulary at all, and (ii) the scenario-form section carries the positive rejection sentence "No keyword parser, no step definitions."
Falsify: introducing any of the denied tool names, or deleting the rejection sentence, fails M8.

### SAS12 — gap traceability and guidance-not-prevention `(inspection)`

Given: the committed spec, skeleton, §4, and prompt.
When–Then: at the **spec gate**, the panel confirms (i) each gap maps to a non-empty component by id (G1→Vocabulary, G2→Contracts, G4→kind labels, G5→NFR table, G6→scenario form, FR7); and (ii) the skeleton reads as authoring guidance — every component is a fill-in scaffold, nothing in the slice behaves as a mechanical checker beyond the contract tests that pin the guidance text.
Falsify: a gap with an empty or missing component, or any component that reads as tooling/ceremony mandate, fails this scenario at the gate.

### SAS13 — the re-freeze obligation is recorded where the lifecycle can find it `(inspection)`

Given: this spec's Amendments (AM3) and the PR description.
When–Then: at the **PR gate**, both surfaces name the track-none re-freeze, its orchestrator owner, and its two components (restore the `FROZEN` entry; restore IDV19's full assertion), and state that slice completion depends on it merging.
Falsify: a PR description missing any of those elements fails this scenario; the gate does not pass until recorded.

### SAS14 — the re-freeze actually merges before the slice is complete `(carried)`

Given: the merged S1 PR, with AM3 recorded.
When–Then: the orchestrator files and executes the track-none re-freeze follow-up — re-add `adversary-spec.prompt.md` to the `FROZEN` array and restore IDV19's unfiltered loop — and the slice is **not complete until that follow-up PR merges**. Destination: post-merge track-none follow-up, orchestrator-owned (plan DoD 9, In #5).
Falsify: a merged S1 with no merged re-freeze means the slice is incomplete — ASD19 and IDV19 stay weakened while the suite is green.

## Assumptions

1. The skeleton lives under `references/` and `templates/sdlc-spec.md` stays a pure router — owner-ratified in Brainstorm, restated by the approved plan (assumption 1).
2. Enforcement rides the package-default prompt only; consumer overrides are consumer law and out of scope (plan, Out).
3. The contract tests' file name is a Build decision; this spec fixes only the assertion inventory (M1–M8).
4. Round mechanics of the spec panel (delta rounds, NEW/REOPENED tags) already exist in the prompt and are untouched by this slice.
5. Contract tests compare against self-contained literal expectations (embedded blocks, literal content, fixed counts), never against a moving branch base — the premise-durability law (`CONTRIBUTING.md` "Durable scenario premises") routes base-relative non-change claims to the standing FROZEN guard or to SAS9's PR-gate inspection.

## Out of scope (restated from the approved plan)

R3-G3/G7 (spec amendment seam, re-round mechanics — shipped in S5), R3-G8/G9 (→S7), R3-G10/G11 (→#158 build stream), consumer override migration, runtime assertion machinery, Gherkin/tooling mandates, template changes, any new gate/dial/config/schema change.
