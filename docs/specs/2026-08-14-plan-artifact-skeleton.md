# Specification: Plan artifact skeleton (S2)

Status: rev 3 — spec-panel rounds 1–2 incorporated (SPEC-R1-01..07 + SPEC-R2-01..02, 9 total, all incorporated, 0 dismissed; both reviewers confirmed every prior fix in round 2; adjudication in `docs/reviews/spec-review-plan-artifact-skeleton-2026-08-14/consolidated.md`); owner approval pending
Track: irreversible (freezes the plan artifact shape — a public authoring surface adopted repos and later slices bind to)
Run slug: `plan-artifact-skeleton`
Map: #192 (design-phase craft), slice S2
Plan: `docs/plans/2026-08-14-plan-artifact-skeleton.md` (rev 4, owner-approved 2026-08-14, including the ratified GPC clause supersession and the #146 close-as-superseded disposition)
Author: orchestrator (`anthropic/claude-fable-5`)

> **Form note.** This spec is authored against the shipped spec skeleton
> (`references/spec-artifact-skeleton.md`, S1): Vocabulary, Contracts, kind
> labels, bound NFR table, three-part scenarios. The artifact it ships is the
> Plan-side sibling of that shape.

## Amendments

### AM1 — FS19 unfreeze of `adversary-plan.prompt.md` (owner-ratified at the Plan gate)

- What: `skills/sdlc/prompts/adversary-plan.prompt.md` is temporarily removed from the `FROZEN` array in `test/frozen-surfaces.test.js` so this slice can extend it with skeleton-awareness anchors.
- Authority: owner-ratified at the Plan gate (2026-08-14); deliberate-change precedent S5 (#206 → re-freeze #207) → S1 (#231 → re-freeze #232).
- Class: **(a)-shaped exception, owner-ratified** — a frozen surface is deliberately changed; the gate record (this section + the plan's consolidated adjudication) is the disposition.
- Pairing: the unfreeze is paired with the IDV19 reconciliation (AM2) and the mandatory re-freeze (AM3); none of the three is valid without the other two.

### AM2 — temporary IDV19 reconciliation

- What: the IDV19 test in `test/iteration-disposition.test.js` (asserts every adversary prompt stays in the frozen list) is temporarily reconciled to exempt `adversary-plan.prompt.md` while the unfreeze window is open.
- Scope: the reconciliation touches only the IDV19 test's own loop. The other uses of `ADVERSARY_PROMPTS` in that file are untouched — the prompt change is additive and those tests keep passing.

### AM3 — mandatory post-merge re-freeze and tracker closure (orchestrator-owned)

- What: a track-none follow-up with three components: (1) re-add `adversary-plan.prompt.md` to the `FROZEN` array, (2) restore IDV19's full assertion (the unfiltered loop, filter and exemption comment removed), (3) remove the window-scoped contract tests (the FROZEN-membership pin and the IDV19-minimality pin — window-scoped by design from this spec, unlike S1 where the equivalent tests were reclassified at PR review). Alongside the re-freeze, the orchestrator **closes #146 as superseded** with a durable comment recording the absorbed sweep rows and the two deliberately-unadopted mandates (build-gate rejection, linters) — a tracker mutation riding no PR.
- Owner: the **orchestrator** session, not the implementing agent (whose session ends at PR creation). Precedent: S5 (#206 → #207), S1 (#231 → #232).
- Obligation record: this section and the PR description. Slice completion depends on the re-freeze merging and the #146 closure.

### AM4 — supersession of the gate-presentation clause "the prompt itself stays untouched" (owner-ratified at the Plan gate)

- What: three coupled edits land in one commit: (1) `phase-plan.md` §4's provenance paragraph drops its closing claim "the prompt itself stays untouched" for the surviving rule (C8); (2) GPC2's pin on that literal is updated to a replacement pin under GPC10's 80-character bound; (3) the shipped gate-presentation spec (`docs/specs/2026-08-09-gate-presentation-contract.md`, whose C2 shape restates the clause) has its Amendments section's `None at rev 3.` line replaced by a one-line full amendment record — trigger, class, disposition, author, and an in-place marker naming this slice's plan and spec as the full record.
- Authority: owner-ratified at the Plan gate (2026-08-14), escalated there per the never-absorbed-silently law (plan A1–A3; consolidated escalation 1).
- Class: declared supersession of a settled decision; the adjudication-routing rule itself (attack surface D, by reference) survives unchanged.

### Inbound carries

None: the Plan minted no `CARRY-TO-SPEC` (plan, "Context for the next agent": "No carry is minted by this plan"). Nothing to land; the no-orphan rule is trivially satisfied.

## Vocabulary

| Term | Definition | Binds to |
| --- | --- | --- |
| plan skeleton | The plan-authoring artefact this slice ships: literal fill-in blocks for the ten plan sections | `skills/sdlc/references/plan-artifact-skeleton.md` |
| binding rule | A prose law a plan must satisfy at authoring time; missing any piece is a plan defect | `skills/sdlc/references/phase-plan.md` §4 |
| boundary label | Exactly one of `objective` / `constraint` / `solution decision` on every in-scope item | plan skeleton `## Objectives and scope` |
| outcome-proof row | The per-objective row {goal, question, metric, baseline, target/window, evidence owner, carried to} | plan skeleton `## Outcome proof` |
| sweep row | One row of the NFR & repo-doc sweep: {area, applicability + reason, target, binding phase, verification} | plan skeleton `## Non-functional requirements & repo-doc sweep` |
| pre-mortem row | One row {risk, trigger, consequence, mitigation, owner, destination} | plan skeleton `## Pre-mortem` |
| zero state | The declared empty block: header kept, one `none — <one-line reason>` entry | plan skeleton intro law |
| anchor | An additive sentence inside an existing lettered attack surface of the plan-review prompt, naming skeleton sections and citing the skeleton path | `skills/sdlc/prompts/adversary-plan.prompt.md` |
| canonical rule sentence | One of the five numbered binding-rule sentences fixed in C2; the prompt must never contain them verbatim | C2, PAS5 |
| unfreeze / re-freeze | Temporary removal / mandatory restoration of one entry in the `FROZEN` array | `test/frozen-surfaces.test.js` |
| surviving rule | The replacement clause for the superseded "stays untouched" claim: adjudication still routes by reference to attack surface D; the prompt changes only under the deliberate-change discipline (a recorded unfreeze with a mandatory re-freeze) | C8, AM4 |

## Contracts

### C1 — `skills/sdlc/references/plan-artifact-skeleton.md` (new file)

- Signature/shape: one markdown reference file, H1 exactly `# Plan artifact skeleton`, opening with the intro law (the fixed shape for sdlc Plan docs under the configured `paths.plans`; fill every block, delete none of the markers; a block with legitimately zero entries keeps its header and carries one `none — <one-line reason>` entry; a Plan that omits a required piece is defective at authoring time — the plan gate refuses it; and the literal sentence `The skeleton is authoring guidance, not mechanical prevention.`), followed by ten sections in this exact order with these literal fill-in markers:
  1. `## Brainstorm provenance` — instruction to store the gate presentation per §4's storage rule (plain mode: sketch and decisions list verbatim; map mode: sketch verbatim, decisions indexed) or to declare the literal `no upstream gate`; placeholder `<sketch and decisions list, stored per the storage rule — or: no upstream gate>`.
  2. `## Problem statement` — bullets `- Actor/situation: <who hits this, in what situation>`, `- Baseline evidence: <observable evidence of the status quo>`, `- Consequence: <the cost of leaving it unsolved>`; plus C2's exact canonical sentence 1.
  3. `## Non-goals` — fill-in row `- <outcome deliberately not pursued> — <one-line reason>`.
  4. `## Alternatives considered` — fill-in row `- <alternative, including doing nothing> — <trade-off reason it was rejected>`.
  5. `## Objectives and scope` — fill-in rows `- [objective] <in-scope item>`, `- [constraint] <in-scope item>`, `- [solution decision] <in-scope item>`, `- parked: <item> — destination: <Spec, Build, a tracker issue, or a backward transition>`; plus C2's exact canonical sentence 2.
  6. `## Outcome proof` — table header exactly `| Goal | Question | Metric | Baseline | Target/window | Evidence owner | Carried to |`, fill-in row `| <goal> | <question> | <metric, a proxy, or: no measurement — <reason>> | <baseline> | <target and window> | <owner> | <Spec scenario/NFR id, or retro> |`; plus C2's exact canonical sentence 3.
  7. `## Non-functional requirements & repo-doc sweep` — table header exactly `| Area | Applicability + reason | Target | Binding phase | Verification |`, fill-in row `| <area> | <applies or n/a — <technical reason>> | <target> | <Spec, Build, Implement, or PR> | <how it will be verified> |`; the minimum-prompt sentence naming AGENTS/README documentation, observability, security/secret delivery, CI/CD, and ISO-25010-informed quality characteristics as the rows every sweep at least considers; plus C2's exact canonical sentence 4.
  8. `## Pre-mortem` — table header exactly `| Risk | Trigger | Consequence | Mitigation | Owner | Destination |`, fill-in row `| <risk or failed future> | <trigger> | <consequence> | <mitigation> | <owner> | <destination> |`; plus C2's exact canonical sentence 5.
  9. `## Definition of done` — fill-in row `- <falsifiable completion item>`.
  10. `## Context for the next agent` — fill-in row `- <context the next agent needs; parked questions land here, each with its destination>`.
- Preconditions: none (new file).
- Postconditions: the file exists at that path with those literal markers; every section is a non-empty fill-in scaffold (authoring guidance), not process narrative; the file is discoverable by FS11 (paired with C4).
- Invariants: the skeleton is authoring guidance, never mechanical prevention — it contains no checker, parser, or tooling mandate (PAS12); it carries no gap ids, slice names, issue numbers, or other process citations (writing-comments law for shipped surfaces).
- Error semantics: static markdown; the failure mode is a missing marker, surfaced by the contract tests (C7). Markers are independent, so several may fail simultaneously and each reports independently.
- Gated by: PAS1, PAS12, PAS13.

### C2 — `skills/sdlc/references/phase-plan.md` §4 binding rules

- Signature/shape: one new paragraph inserted immediately after §4's first paragraph (the one beginning `Produce the Plan doc:`), before the paragraph beginning `**Brainstorm provenance storage.**`. It states that Plans are authored against the fixed skeleton (fill every block, delete no markers, declared zero states), fixes five canonical rule sentences, numbered, verbatim:
  1. "the problem statement names an actor, observable baseline evidence, and a consequence, and contains no implementation prescription"
  2. "every in-scope item carries exactly one boundary label (`objective` | `constraint` | `solution decision`) and every parked item names its destination"
  3. "every objective has an outcome-proof row — a metric with baseline, target/window, and an evidence owner, or a cited proxy/no-measurement rationale — and the row names its Spec or retro landing site"
  4. "every NFR/repo-doc sweep row carries applicability with its reason, target, binding phase, and verification, or `n/a` with a technical reason"
  5. "every pre-mortem row carries trigger, consequence, mitigation, owner, and destination; only small reversible work may instead declare the block's zero state, with a one-line reason"
  followed by: anything missing is a plan defect, and the pointer `references/plan-artifact-skeleton.md`.
- Preconditions: §4 exists; its current paragraphs (first paragraph beginning `Produce the Plan doc:`, `**Brainstorm provenance storage.**`, `**Dialogue discipline.**`, the `> **Under your configuration:**` callout) stay present and in order — the provenance paragraph changing only per C8.
- Postconditions: §4 states all five binding rules and points to the skeleton; no section of `phase-plan.md` other than §4 changes.
- Invariants: the rules are prose law — no mechanical checker is introduced anywhere by this slice.
- Error semantics: a missing rule sentence or pointer fails the contract tests (C7); independent assertions, each reports independently.
- Gated by: PAS2, PAS10.

### C3 — `skills/sdlc/prompts/adversary-plan.prompt.md` skeleton-awareness anchors

- Signature/shape: additive sentences inside five existing lettered attack surfaces (A, B, C, D, E); F untouched; no new letter, no renumbering, no output-contract change. Each anchor NAMES its skeleton sections, instructs the reviewer to verify the plan against their definitions in `references/plan-artifact-skeleton.md`, and cites that path — no anchor restates any rule logic:
  - **A (Definition of done):** anchor covering `Definition of done` and the `Carried to` field of `Outcome proof` rows.
  - **B (Objectives vs outcomes):** anchor covering `Problem statement` and `Outcome proof`.
  - **C (Scope coherence):** anchor covering `Objectives and scope` (boundary labels, parked destinations), `Non-goals`, and `Context for the next agent`.
  - **D (Locked decisions):** anchor covering `Brainstorm provenance` and `Alternatives considered`.
  - **E (Missing risks and dependencies):** anchor covering `Non-functional requirements & repo-doc sweep` and `Pre-mortem`.
  Together the anchors name all ten skeleton section names.
- Preconditions: the file is unfrozen per AM1; the existing A–F letter set, the paragraph beginning `**Carry landing: none applies here, by decision.**`, the Delta rounds section, and the STRICT output format (including the `CLEAR: <letter>` line contract) are byte-stable except as pinned by C7's literal blocks.
- Postconditions: the prompt names all ten skeleton sections and cites the skeleton path; none of C2's five canonical rule sentences appears in it as a contiguous substring.
- Invariants: reference, never restate — the skeleton and §4 own the rule definitions; the prompt owns only the checking instruction. Package-default only: consumer overrides resolve first by design and are out of scope; goldens derive from the consumer override and stay untouched (plan, Scope item 4).
- Error semantics: a missing anchor fails PAS4; a restated rule sentence fails PAS5. Independent assertions.
- Gated by: PAS4, PAS5.

### C4 — `skills/sdlc/assets/normative-references.json` inventory row + S1 M5 count amendment

- Signature/shape: one new entry in `sources[]`:
  `{ "id": "reference.plan-artifact-skeleton", "source": "skills/sdlc/references/plan-artifact-skeleton.md", "assertion": "# Plan artifact skeleton", "targetKind": "file", "ownership": "package", "required": true, "resolution": "package", "target": "skills/sdlc/references/plan-artifact-skeleton.md", "class": "package-public" }`
  paired with amending S1's M5 assertion in `test/spec-artifact-skeleton.test.js` from exactly 81 to exactly 82 source rows (the pin is the design; the slice that adds a row amends it deliberately).
- Preconditions: the skeleton file exists (C1) — `skills/sdlc/references/*.md` is a discovery root, so inverse completeness requires this row the moment the file exists.
- Postconditions: `check-references` passes; S1's M5 passes at 82; every other M-assertion of S1's suite passes unmodified.
- Invariants: no other row changes; `schemaVersion` stays 1; no other line of `test/spec-artifact-skeleton.test.js` changes.
- Error semantics: missing row → `check-references` fails inverse completeness; malformed row → schema validation fails; unamended M5 → S1's suite fails at 82 rows. At most one cause per failure line.
- Gated by: PAS6 (mechanical), PAS10 (inspection half: no-other-row/no-other-line-changed, at the PR-gate diff).

### C5 — `test/frozen-surfaces.test.js` unfreeze

- Signature/shape: exactly one line removed from the `FROZEN` array — `"skills/sdlc/prompts/adversary-plan.prompt.md",`. No other entry added, removed, or reordered; `baseRef()` and the ASD19 test body untouched.
- Preconditions: AM1 recorded in this spec's Amendments.
- Postconditions: ASD19's diff guard governs the remaining 16 frozen surfaces; the plan prompt is deliberately mutable on this branch.
- Invariants: all other entries byte-stable (PAS7, PAS9).
- Error semantics: removing any further entry fails PAS7's membership pin; the ASD19 guard then silently narrows — PAS9 is the catch.
- Gated by: PAS7, PAS9.

### C6 — `test/iteration-disposition.test.js` IDV19 reconciliation

- Signature/shape: the IDV19 test's `for (const slug of ADVERSARY_PROMPTS)` loop is temporarily narrowed to exclude `"plan"` (e.g. a filter), with an accompanying comment naming AM1/AM3 and the re-freeze obligation, placed **inside the IDV19 test body adjacent to the filtered loop** — never contiguous with the ownership comment block above the test, whose IDV33 process-history guard absorbs contiguous `//` lines and rejects the word "plan" (as in `adversary-plan.prompt.md`). The `ADVERSARY_PROMPTS` constant itself is untouched; the other loops using it are untouched; the `validator-task.prompt.md` assertion in IDV19 stays.
- Preconditions: C5 applied (the exemption is only true while the unfreeze window is open).
- Postconditions: IDV19 still asserts spec + review adversary prompts and validator-task stay frozen; it stops asserting the deliberately-unfrozen plan prompt.
- Invariants: the reconciliation is minimal — one loop + one comment (PAS8).
- Error semantics: an over-broad reconciliation (touching other tests or the constant) fails PAS8; restoring the loop is the re-freeze's job (AM3).
- Gated by: PAS8.

### C7 — contract tests

- Signature/shape: one new test file (name chosen at Build), pure offline string assertions over the markdown/test surfaces, asserting exactly:
  - M1: C1's H1, the intro-law sentences (including the zero-state marker `none — <one-line reason>` and the literal `The skeleton is authoring guidance, not mechanical prevention.`), the ten section headers in C1's fixed order with the file's complete section set exactly those ten — no extras; every literal marker and placeholder of C1 present, each appearing only between its owning section header and the next; C2's five canonical rule sentences present in the skeleton, each inside its owning section (Problem statement→1, Objectives and scope→2, Outcome proof→3, sweep→4, Pre-mortem→5); the three table headers exactly as fixed in C1; the sweep's minimum-prompt sentence naming all five named areas.
  - M2: in `phase-plan.md` §4 — the first paragraph still begins `Produce the Plan doc:`; C2's five canonical rule sentences — each line beginning with its literal `1.`–`5.` marker in order — plus the literal sentence `anything missing is a plan defect` and the pointer `references/plan-artifact-skeleton.md` appear in the paragraph immediately after that first paragraph (adjacency — no paragraph between) and before the paragraph beginning `**Brainstorm provenance storage.**`; the paragraphs beginning `**Brainstorm provenance storage.**`, `**Dialogue discipline.**`, and `> **Under your configuration:**` follow, in that order; the provenance paragraph contains the surviving-rule clause `the prompt changes only under the deliberate-change discipline` and does not contain `the prompt itself stays untouched` — the shipped clause is self-descriptive, carrying no slice/check id (process citations stay in lifecycle artifacts). M2 asserts adjacency, beginnings, order, and the clause swap; full byte-intactness of the untouched §4 bodies is a diff-shape claim verified at the PR gate by PAS10.
  - M3: C3's structural protection — exactly six attack-surface markers `A.` through `F.` in order and no letter beyond F; exactly one anchor inside each of the A, B, C, D, E surface paragraphs (after its letter marker, before the next), each containing the literal skeleton path `references/plan-artifact-skeleton.md`, with the per-letter coverage map pinned exactly as C3 fixes it — A names `Definition of done` and `Carried to`; B names `Problem statement` and `Outcome proof`; C names `Objectives and scope`, `Non-goals`, and `Context for the next agent`; D names `Brainstorm provenance` and `Alternatives considered`; E names `Non-functional requirements & repo-doc sweep` and `Pre-mortem` (S1's shipped coverage-map assertion is the precedent); the paragraph beginning `**Carry landing: none applies here, by decision.**` present; the `## Delta rounds` section byte-identical to literal block **L1**; the section from `## Output format` to end-of-file byte-identical to literal block **L2** (trailing newline normalized).
  - M4: none of C2's five canonical rule sentences appears anywhere in the prompt as a contiguous substring.
  - M5: C4's row matches all nine fields exactly, the optional `verification` key is absent from it, and the inventory contains exactly 82 rows.
  - M6 (window-scoped): the `FROZEN` array holds exactly the 16 entries of literal block **L3**, in L3's exact order (the pre-slice list minus `adversary-plan.prompt.md`). Deleted by the re-freeze (AM3).
  - M7 (window-scoped): the IDV19 loop is the only filtered use of `ADVERSARY_PROMPTS` (exempting exactly `"plan"`); the constant is asserted as the literal `["plan", "spec", "review"]`; the sibling loops iterate unfiltered; the `validator-task.prompt.md` assertion remains; the accompanying comment names AM1 and AM3. Deleted by the re-freeze (AM3).
  - M8: the skeleton contains none of the literal substrings `Cucumber`, `Behat`, `Gherkin`, `linter`, or `CI check` anywhere, and carries the literal guidance sentence of M1's intro-law set (a decidable denial set, mirroring S1's shipped M8).
- Preconditions: C1–C6 and C8 landed.
- Postconditions: the suite is deterministic, offline, budget < 1 s; every marker assertion names the file and marker it checks.
- Invariants: no network, no new dependency, no snapshot tooling; expectations are self-contained literals (assumption 5), never a moving branch base.
- Error semantics: each marker set fails independently with a message naming file + marker; co-occurring failures report independently (no precedence — parallel assertions).
- Gated by: PAS1–PAS8 and PAS12 (each scenario's mechanical half is one marker set), PAS11 (the DoD sweep runs the whole suite). PAS9 and PAS10 gate C5's remainder and the PR diff, not C7.

**Pinned literal blocks (M3, M6).** Self-contained expectations per assumption 5 — the Build test embeds exactly these bytes, so a tampered embed cannot pass its own contract.

L1 — the prompt's `## Delta rounds` section:

```text
## Delta rounds

Round 1 reviews the whole plan. **Every round after the first is a delta review.** The caller gives you the prior rounds' findings and their dispositions, and your review is scoped to the delta since the previous round. Tag every finding `NEW`, or `REOPENED(<prior-id>)` when you re-raise an already-dispositioned finding by its id. A reopen is legal only when you cite evidence that did not exist, or was not available, when that finding was dispositioned; otherwise do not re-raise it. Confirming a prior fix is one line, not a re-litigation.
```

L2 — the prompt's output-format section, `## Output format` to end-of-file:

```text
## Output format (STRICT: markdown only, findings only, no preamble, no conclusion)

### <short title>

- severity: high | medium | low
- confidence: high | medium (drop anything lower; do not speculate)
- origin: NEW | REOPENED(<prior-id>)
- location: <plan section or line>
- defect: <one or two sentences: the concrete problem>
- evidence: <what you verified: quoted plan text, or file:line in the repo>
- impact: <why it matters: what freezes wrong, what cannot be verified, what will bite>
- fix: <one sentence: the minimal plan change>

Rank most-severe first. For each attack surface A to F where you found nothing, emit one line: `CLEAR: <letter> — <one-line reason>`. Prefer a few high-confidence, evidence-backed findings over a long speculative list. Every finding must be concrete enough to act on without asking you anything.
```

L3 — the expected post-unfreeze `FROZEN` array, in exact order:

```text
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
skills/sdlc/prompts/adversary-spec.prompt.md
skills/sdlc/prompts/adversary-review.prompt.md
skills/sdlc/prompts/validator-task.prompt.md
```

### C8 — the gate-presentation supersession (AM4's three coupled edits)

- Signature/shape: (1) in `phase-plan.md` §4's provenance paragraph, the clause `— the prompt itself stays untouched.` is replaced by `— the prompt changes only under the deliberate-change discipline: a recorded unfreeze with a mandatory re-freeze, and only with skeleton-awareness anchors.`; the rest of the sentence (adjudication routing by reference to the frozen adversary plan prompt's attack surface D) is unchanged, and the shipped clause carries no slice or check id — it is self-descriptive, resolvable by any package reader. (2) In `test/gate-presentation-contract.test.js`, GPC2's `assert.match(planSec4f, /the prompt itself stays untouched/)` becomes a match on the replacement pin `the prompt changes only under the deliberate-change discipline` (62 characters — under GPC10's 80-character verbatim-substring bound); no other GPC assertion changes. (3) In `docs/specs/2026-08-09-gate-presentation-contract.md`, the Amendments section's line `None at rev 3.` is replaced by a one-line full amendment record carrying trigger (S2 adds skeleton-awareness anchors to the plan prompt), class (declared supersession, owner-ratified 2026-08-14), disposition (C2's closing clause narrowed to the surviving rule), author (orchestrator `anthropic/claude-fable-5`), and an in-place marker naming this slice's plan and spec as the full record.
- Preconditions: AM4 recorded; the plan gate's ratification stands.
- Postconditions: the GPC suite passes with the replacement pin; `phase-plan.md` carries the surviving rule; the gate-presentation spec's amendment trail is non-empty and accurate.
- Invariants: every other GPC pin (literals and §4 ordering) passes unmodified; the gate-presentation spec doc changes only in its Amendments section; no test pins that spec doc's body (verified: it is absent from `FROZEN` and no suite reads it), so edit 3 is guarded by PAS10's diff inspection, not a mechanical assertion.
- Error semantics: a replacement pin at or over 80 characters fails GPC10 mechanically; a surviving-rule clause absent from §4 fails M2; a stale `None at rev 3.` line or a record missing a required field fails PAS10 at the PR gate.
- Gated by: PAS3 (mechanical halves), PAS10 (edit 3 and the no-other-change invariants).

## Functional requirements

- FR1: the skeleton ships the ten sections as literal fill-in blocks (C1).
- FR2: `phase-plan.md` §4 states the five binding rules and points to the skeleton (C2).
- FR3: the plan-review prompt gains skeleton-awareness anchors within the existing lettered surfaces (C3).
- FR4: the skeleton is FS11-discoverable and S1's count pin is deliberately amended (C4).
- FR5: the unfreeze machinery lands as specified (C5, C6), recorded in Amendments, paired with the re-freeze obligation (AM3).
- FR6: contract tests prove all of the above offline (C7).
- FR7: the ratified supersession lands as three coupled edits (C8, AM4).
- FR8: traceability — each ratified gap maps to a non-empty skeleton section: G1→Problem statement + Non-goals + Alternatives considered, G2→Objectives and scope (boundary labels), G3→Outcome proof, G4→NFR & repo-doc sweep, G5→Pre-mortem.

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
| --- | --- | --- | --- |
| Performance efficiency | Full test corpus run offline (CI equivalent) | Green under a 30-second external timeout; new contract tests < 1 s; `biome check`, `check-references.mjs`, `check-lifecycle.sh` each ≤ 5 s externally bounded | PAS11 |
| Compatibility | Any frozen surface diffed against the branch base; the PR diff read hunk by hunk | Byte-identical for all 16 remaining frozen entries; the diff contains only the permitted change classes (`templates/sdlc-plan.md`, `test/fixtures/golden/`, `test/fixtures/consumer/`, `package.json`, lockfile all untouched) | PAS9, PAS10 |
| Maintainability | A reviewer or future slice reads the plan-review prompt | The prompt references the skeleton, never restates the five canonical rule sentences | PAS5 |
| Portability | A consumer adopts the skeleton in any language/toolchain | No runtime assertion machinery, Gherkin-family tooling, linter/CI-check mandate, or new dependency anywhere in the slice — the skeleton's wording mechanically clean (PAS12), the whole-slice boundary held at the diff (PAS10: `package.json` + lockfile untouched, hunks within permitted classes) | PAS10, PAS12 |
| Performance efficiency (gate inspections) | The spec/PR gate panels inspect this slice's artifacts | Inspections ride the already-dispatched gate panels — no separate dispatch, run, or machinery; the inspected set is bounded to this slice's permitted-class diff and the named artifacts, and a diff exceeding the permitted classes fails PAS10 rather than expanding the review | PAS10, PAS13, PAS14 |
| Maintainability (future slices) | S6 reuses the `references/<skeleton>.md` pattern | Future-slice quality — this slice's evidence is that the pattern held for its first reuse (S2 itself) with no spec-only or plan-only leakage in the generic shape, inspected at the spec gate | unbound — accepted at gate — reason: fully verifiable only when S6 lands; S2 is itself the first reuse evidence |

## Verification scenarios

Ratio: 11 mechanical / 3 inspection / 1 carried = 15 total (73% mechanical). Base-relative non-change claims route to the standing ASD19 guard or the PR-gate diff inspection per the premise-durability law, not to base-relative scenario tests.

### PAS1 — the skeleton ships ten sections as literal fill-in blocks `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: the contract tests' M1 set passes — H1, intro law (zero-state marker, guidance-not-prevention sentence), the ten section headers in fixed order and no extras, every literal marker and placeholder inside its owning section, the five canonical rule sentences each inside its owning section, the three exact table headers, and the sweep's five named minimum areas.
Falsify: removing any marker or placeholder, reordering or adding sections, or moving a marker out of its owning section fails the corresponding M1 assertion.

### PAS2 — §4 carries the five binding rules and the pointer `(mechanical)`

Given: branch HEAD with C2 landed.
When–Then: M2 passes — the rules paragraph sits immediately after §4's first paragraph and before `**Brainstorm provenance storage.**`, carries the five canonical sentences numbered `1.`–`5.` in order, the `anything missing is a plan defect` sentence, and the skeleton pointer; the three following paragraph anchors appear in order.
Falsify: deleting any rule sentence or the pointer, dropping or reordering the numbering, inserting a paragraph between the first paragraph and the rules, or disturbing the following anchors fails M2.

### PAS3 — the supersession clause swap lands and the GPC suite stays green `(mechanical)`

Given: branch HEAD with C8 edits 1–2 landed.
When–Then: M2's clause assertions pass (`the prompt itself stays untouched` absent from §4; the surviving-rule clause present) and `node --test test/gate-presentation-contract.test.js` passes — GPC2 matches the 62-character replacement pin, GPC10's 80-character bound holds over the whole test source, and every other GPC pin passes unmodified.
Falsify: a lingering superseded clause, a missing surviving-rule clause, a replacement pin ≥ 80 characters (GPC10 fails mechanically), or any other GPC assertion changing fails this scenario.

### PAS4 — the prompt's structure is protected, anchors placed inside A–E `(mechanical)`

Given: branch HEAD with C3 landed (unfreeze per AM1 in force).
When–Then: M3 passes — exactly six attack-surface markers `A.`–`F.` in order, no letter beyond F; exactly one anchor inside each of A/B/C/D/E, each citing `references/plan-artifact-skeleton.md`, with the per-letter coverage map exactly as C3 fixes it (A→DoD + `Carried to`; B→Problem statement + Outcome proof; C→Objectives and scope + Non-goals + Context; D→Brainstorm provenance + Alternatives considered; E→sweep + Pre-mortem); the carry-landing paragraph present; Delta rounds byte-identical to L1; output format byte-identical to L2.
Falsify: a missing or mis-lettered anchor, a coverage name in the wrong letter's paragraph, a stripped section name or path, a seventh letter, or any edit inside L1/L2 fails M3.

### PAS5 — the prompt references, never restates `(mechanical)`

Given: branch HEAD with C2 and C3 landed.
When–Then: M4 passes — none of C2's five canonical rule sentences appears anywhere in the prompt as a contiguous substring.
Falsify: copying any canonical rule sentence into the prompt verbatim fails M4 (a partial sub-span is below M4's detection threshold by design — full-sentence matching, mirroring S1's shipped M4).

### PAS6 — the skeleton is FS11-discoverable and the count pin is amended `(mechanical)`

Given: branch HEAD with C1 and C4 landed.
When–Then: M5 passes (the row matches all nine fields, `verification` absent, exactly 82 rows), S1's amended M5 passes at 82, and `node skills/sdlc/scripts/check-references.mjs` exits 0 — the discovery root is inverse-complete with the new file present.
Falsify: dropping the row fails inverse completeness; a wrong row fails M5; an unamended S1 pin fails at 82 rows.

### PAS7 — the unfreeze removes exactly one frozen entry `(mechanical, window-scoped)`

Given: branch HEAD with C5 landed, before the post-merge re-freeze.
When–Then: M6 passes — the `FROZEN` array equals L3 exactly: 16 entries in order, `adversary-plan.prompt.md` absent, every other frozen path present and unreordered. The assertion itself is deleted by the re-freeze (AM3).
Falsify: removing or reordering any further entry fails M6.

### PAS8 — the IDV19 reconciliation is minimal `(mechanical, window-scoped)`

Given: branch HEAD with C6 landed, before the post-merge re-freeze.
When–Then: M7 passes — only the IDV19 loop is filtered (exempting exactly `"plan"`), the constant is the literal `["plan", "spec", "review"]`, sibling loops unfiltered, the validator-task assertion remains, the comment names AM1/AM3. The assertion itself is deleted by the re-freeze (AM3).
Falsify: touching the constant, filtering a sibling loop, broadening the exemption, or hollowing the comment fails M7.

### PAS9 — all other frozen surfaces stay byte-identical `(mechanical)`

Given: branch HEAD with C5 landed.
When–Then: the standing ASD19 diff guard passes against the reduced `FROZEN` list — every remaining frozen surface byte-identical to the branch base. Non-change claim routed to the standing guard per premise durability.
Falsify: any diff in a remaining frozen path fails ASD19.

### PAS10 — the PR diff contains only the permitted change classes `(inspection)`

Given: the branch's full diff at the **PR gate**.
When–Then: the panel confirms every hunk falls inside the permitted classes: the new skeleton file; `phase-plan.md` §4 (the inserted rules paragraph plus C8's single-clause swap; every other §4 line untouched — where C2's stay-intact precondition and C8's no-other-change invariant are verified); the deliberately-unfrozen prompt (additive anchors only); the inventory row with S1's M5 count amendment and no other line of that suite; the GPC2 pin update and no other GPC change; the gate-presentation spec's Amendments record replacing `None at rev 3.` with all required fields (trigger, class, disposition, author, in-place marker) and no other change to that doc; the two named test reconciliations; the new contract-test file; and the slice's committed lifecycle artifacts (plan, this spec, build plan, review and validation evidence under their configured homes) — and nothing else. In particular `templates/sdlc-plan.md`, `test/fixtures/golden/`, `test/fixtures/consumer/`, `package.json`, and the lockfile are untouched. Budget: the inspection rides the PR panel's existing dispatch (no separate run); the inspected set is exactly this slice's diff, itself bounded by the permitted classes — a diff exceeding them fails the scenario rather than expanding the review.
Falsify: any hunk outside the permitted list, a stale `None at rev 3.` line, or an amendment record missing a required field fails this scenario at the PR gate.

### PAS11 — corpus green, offline, inside budget; full DoD sweep `(mechanical)`

Given: branch HEAD with all contracts landed; no network.
When–Then: `npm test` passes under a 30-second external timeout; the new contract-test file runs in under 1 s; `npx biome check` over the changed JS files is clean within 5 s; `node skills/sdlc/scripts/check-references.mjs` exits 0 within 5 s; `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug plan-artifact-skeleton` exits 0 within 5 s once Spec and Build artifacts are committed (an earlier `artifact.build: no committed build document` failure is expected mid-run and is not a defect).
Falsify: any failing test, a > 30 s run, a biome finding on a changed file, a failing inventory check, or the lifecycle check failing with those arguments once the build document exists.

### PAS12 — the skeleton mandates no tooling `(mechanical)`

Given: branch HEAD with C1 landed.
When–Then: M8 passes — none of the literal substrings `Cucumber`, `Behat`, `Gherkin`, `linter`, `CI check` anywhere in the skeleton, and the guidance-not-prevention sentence present.
Falsify: introducing any denied substring, or deleting the guidance sentence, fails M8.

### PAS13 — gap traceability and guidance-not-prevention `(inspection)`

Given: the committed spec, skeleton, §4, and prompt.
When–Then: at the **spec gate**, the panel confirms (i) each ratified gap maps to a non-empty skeleton section per FR8; and (ii) the skeleton reads as authoring guidance — every section a fill-in scaffold, nothing behaving as a mechanical checker beyond the contract tests pinning the guidance text, and no process citations in the shipped file. Budget: rides the spec-gate panel's existing dispatch; the inspected set is the four named artifacts (this spec, the skeleton, §4, the prompt).
Falsify: a gap with an empty or missing section, a component reading as tooling/ceremony mandate, or a process citation in the skeleton fails this scenario at the gate.

### PAS14 — the post-merge obligations are recorded where the lifecycle can find them `(inspection)`

Given: this spec's Amendments (AM3, AM4) and the PR description.
When–Then: at the **PR gate**, both surfaces name the track-none re-freeze, its orchestrator owner, its three components (restore the `FROZEN` entry; restore IDV19; delete the window-scoped M6/M7 assertions), the #146 close-as-superseded closure with its durable-comment content, and state that slice completion depends on the re-freeze merging. Budget: rides the PR gate's existing review; the inspected set is two named surfaces (this spec's Amendments, the PR description).
Falsify: a PR description missing any element fails this scenario; the gate does not pass until recorded.

### PAS15 — the re-freeze merges and #146 closes before the slice is complete `(carried)`

Given: the merged S2 PR, with AM3/AM4 recorded.
When–Then: the orchestrator files and executes the track-none re-freeze follow-up — re-add `adversary-plan.prompt.md` to `FROZEN`, restore IDV19's unfiltered loop, delete the window-scoped M6/M7 assertions — and closes #146 as superseded with the durable comment; the slice is **not complete until the follow-up PR merges and the closure lands**. Destination: post-merge track-none follow-up, orchestrator-owned (plan DoD 11, Scope items 6 and 9).
Falsify: a merged S2 with no merged re-freeze, or with #146 still open, means the slice is incomplete — ASD19 and IDV19 stay weakened, or the superseded epic keeps advertising undone work, while the suite is green.

## Assumptions

1. The skeleton lives under `references/` and `templates/sdlc-plan.md` stays a pure router — owner-ratified in Brainstorm, restated by the approved plan (assumption 1).
2. Enforcement rides the package-default prompt only; consumer overrides are consumer law, and the stamped goldens derive from the consumer override fixture (FS5), so `test/fixtures/golden/` and `test/fixtures/consumer/` are untouched (plan, Scope item 4).
3. The contract tests' file name is a Build decision; this spec fixes only the assertion inventory (M1–M8) and the window-scoped lifecycle of M6/M7.
4. Round mechanics of the plan panel (delta rounds, NEW/REOPENED tags, the carry-landing decision paragraph) already exist in the prompt and are untouched by this slice.
5. Contract tests compare against self-contained literal expectations (embedded blocks, literal content, fixed counts), never against a moving branch base — the premise-durability law routes base-relative non-change claims to the standing FROZEN guard or PAS10's PR-gate inspection.
6. The gate-presentation spec doc's body is pinned by no test (its edit is guarded by PAS10's diff inspection); the GPC suite pins only `phase-brainstorm.md`, `phase-plan.md`, and `system-reference.md` content.

## Out of scope (restated from the approved plan)

R2-G6 (shipped in S5), R2-G7 and all diagram/IA requirements (→S7), R2-G8 (→#158 build stream), any mechanical linter/CI check for sweep completeness, `templates/sdlc-plan.md`, the provenance contract's semantics beyond C8's single clause, CARRY-TO semantics and amendment classes (S5's glossary), re-round mechanics of the plan prompt, consumer override migration, `test/fixtures/golden/` and `test/fixtures/consumer/`, any new gate, dial, panel role, configuration value, schema change, or dependency.
