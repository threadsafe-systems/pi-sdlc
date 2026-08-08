### Canonical rule 3 makes SAS4 unbuildable

- severity: high
- confidence: high
- origin: NEW
- location: C2/C3/SAS4, `docs/specs/2026-08-08-spec-artifact-skeleton.md:71-91,182-186`
- defect: C2 bans the exact string `every scenario carries exactly one kind label`, while C3 requires a B anchor containing that exact phrase. M4 bans canonical sentences “verbatim anywhere,” with no boundary definition.
- evidence: C2 rule 3 is exactly `"every scenario carries exactly one kind label"`; C3’s required anchor begins “whether every scenario carries exactly one kind label per…”.
- impact: A literal implementation of the required anchor necessarily fails M4; the contract tests cannot pass consistently.
- fix: Reword the B anchor to avoid the canonical substring and define M4’s exact matching semantics.

### Re-freeze is recorded but not gated

- severity: high
- confidence: high
- origin: NEW
- location: AM3/SAS13, `docs/specs/2026-08-08-spec-artifact-skeleton.md:29-33,236-240`
- defect: SAS13 only checks that the PR description records the follow-up; no scenario requires the orchestrator to open, execute, or merge it.
- evidence: C5 removes the prompt from FROZEN (`:106-112`), C6 exempts it from IDV19 (`:115-122`), while SAS13 stops at PR-gate recording. The current IDV19 loop is at `test/iteration-disposition.test.js:491-498`.
- impact: Forgetting the post-merge follow-up leaves both protections weakened while the normal test suite remains green, contradicting Plan DoD 9.
- fix: Add a carried/post-merge scenario requiring evidence of the single-purpose re-freeze PR’s merge before declaring the slice complete.

### M3 cannot protect the prompt’s frozen structure

- severity: high
- confidence: high
- origin: NEW
- location: C3/C7/SAS3, `docs/specs/2026-08-08-spec-artifact-skeleton.md:83-94,124-138,176-180`
- defect: M3 checks only that component names, A–H tokens, the output heading, and `CLEAR:` occur somewhere; it does not enforce placement inside B/C/D/F, reject an extra letter, or preserve the closed output field list.
- evidence: The actual closed output format is `skills/sdlc/prompts/adversary-spec.prompt.md:36-49`; C3 requires it to be byte-stable, but M3 specifies only token presence.
- impact: An implementation can alter the reviewer output contract, add a ninth attack surface, or put anchors outside the required surfaces while SAS3 passes.
- fix: Require structural comparisons against the baseline for the A–H surfaces and complete output-format section, permitting only additive anchors in B/C/D/F.

### M1 does not prove a literal fill-in skeleton

- severity: medium
- confidence: high
- origin: NEW
- location: C1/C7/SAS1, `docs/specs/2026-08-08-spec-artifact-skeleton.md:53-62,124-138,164-168`
- defect: C1 requires ordered sections and literal placeholders such as `<term>`, `<interface name>`, and the fill-in table row, but M1 checks only headers, labels, and marker names.
- evidence: M1’s inventory omits the placeholder rows and section-order assertion; SAS1 only requires those markers to exist.
- impact: Empty sections, reordered components, or a non-scaffold document can pass the contract suite and violate Plan DoD 1/3.
- fix: Assert the exact ordered section sequence and every literal fill-in row/block, including placeholders.

### M5 does not enforce the exact C4 inventory row

- severity: medium
- confidence: high
- origin: NEW
- location: C4/C7/SAS5, `docs/specs/2026-08-08-spec-artifact-skeleton.md:96-104,124-133,188-192`
- defect: M5 checks only `id`, `target`, and `assertion`, although C4 fixes all ten row fields.
- evidence: `check-references.mjs` validates field types/enums at `:93-100` but does not require C4’s exact `targetKind`, `required`, or `class` values; package validation then only checks source occurrence and target existence (`:177-208`).
- impact: A semantically wrong but schema-valid row can pass both M5 and `check-references`, freezing the wrong FS11 classification.
- fix: Assert the complete JSON row exactly and verify that no other inventory row changed.

### Base-relative non-change scenarios violate premise durability

- severity: medium
- confidence: high
- origin: NEW
- location: SAS9/SAS10, `docs/specs/2026-08-08-spec-artifact-skeleton.md:212-222`
- defect: SAS9 and SAS10 compare files against the moving branch base, although the governing law says non-change claims must use the standing diff guard or a durable inspection.
- evidence: `phase-spec.md:50-55` routes non-change claims to the standing diff guard; `CONTRIBUTING.md:29-35` repeats that rule. `templates/sdlc-spec.md`, `package.json`, and the lockfile are not in the current FROZEN list.
- impact: After merge, the moving base can make a changed file appear unchanged, so these scenarios cannot gate their claims durably.
- fix: Route these claims through a standing guard or make them PR-gate inspections against the current diff rather than post-merge scenarios.

### Plan DoD 7 is not covered

- severity: medium
- confidence: high
- origin: NEW
- location: SAS10, `docs/specs/2026-08-08-spec-artifact-skeleton.md:218-222`
- defect: SAS10 runs `npm test` and checks dependency diffs but does not require Biome over changed files or the lifecycle checker.
- evidence: Plan DoD 7 requires both (`docs/plans/2026-08-08-spec-artifact-skeleton.md:65`); `package.json:28-30` shows `npm test` and `lint` are separate commands.
- impact: The declared definition of done can pass with formatting failures or an unverified lifecycle check.
- fix: Add explicit changed-file Biome and lifecycle-check commands to SAS10.

### Compatibility NFR has an incorrect frozen-entry count

- severity: medium
- confidence: high
- origin: NEW
- location: Non-functional requirements, `docs/specs/2026-08-08-spec-artifact-skeleton.md:150-158`
- defect: The compatibility row says “all 17 remaining frozen entries,” while C5/SAS6 require removing one entry from the current 17-entry list, leaving 16.
- evidence: The current `FROZEN` array has 17 entries at `test/frozen-surfaces.test.js:15-33`; C5 specifies 16 remaining entries at the spec’s `:108-110`.
- impact: The NFR contradicts the executable frozen-surface shape and can produce false compatibility attestations.
- fix: Change “17 remaining” to “16 remaining,” or remove the hand-maintained count.

### SAS11 has no corresponding contract-test assertion

- severity: medium
- confidence: high
- origin: NEW
- location: C7/SAS11, `docs/specs/2026-08-08-spec-artifact-skeleton.md:124-138,224-228`
- defect: C7’s exhaustive M1–M7 inventory contains neither the denied-vocabulary check nor the required positive rejection sentence check demanded by SAS11.
- evidence: SAS11 requires both assertions, but C7 ends at M7 and says the suite asserts “exactly” M1–M7.
- impact: A Build implementation can omit SAS11’s checks while satisfying the specified contract-test inventory.
- fix: Add an explicit M8 (or expand M1) covering both SAS11 assertions.

### The self-demonstrating unbound NFR lacks its required reason

- severity: medium
- confidence: medium
- origin: NEW
- location: NFR table, `docs/specs/2026-08-08-spec-artifact-skeleton.md:156-158`
- defect: C1 requires the Binding cell’s `unbound — accepted at gate` marker to include a reason, but the final row’s Binding cell contains only the marker.
- evidence: C1 states this requirement at `:61`; the row at `:158` ends with `unbound — accepted at gate`, while M1 checks only marker presence (`:126-127`).
- impact: The spec’s own self-demonstration does not satisfy the binding shape it is introducing, and the contract tests cannot detect the omission.
- fix: Put the acceptance reason directly in the Binding cell and assert it.

CLEAR: E — no unsupported dependency/framework behavior claim was identified.  
CLEAR: H — the spec explicitly records that no inbound carry was minted.
