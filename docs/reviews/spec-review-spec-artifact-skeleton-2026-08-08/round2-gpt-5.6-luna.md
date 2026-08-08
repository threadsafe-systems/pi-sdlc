# Round 2 raw output — luna (openai-codex/gpt-5.6-luna:xhigh)

Delta review of spec rev 2 (`1aaf4b1`). Unedited reviewer output.

- CONFIRMED: SPEC-R1-01 — C2 clauses landed at spec:72-75.
- CONFIRMED: SPEC-R1-02 — Reference-only anchors and path landed at spec:85-93.
- CONFIRMED: SPEC-R1-03 — SAS9 gates consumer fixtures at spec:213-217.
- CONFIRMED: SPEC-R1-04 — M4 contiguous matching semantics landed at spec:129-130.
- CONFIRMED: SPEC-R1-05 — SAS14 carried re-freeze landed at spec:243-247.
- CONFIRMED: SPEC-R1-06 — M3 structural assertions landed at spec:129 and spec:177-181.
- CONFIRMED: SPEC-R1-07 — M1 order/placeholders landed at spec:127 and spec:168-169.
- CONFIRMED: SPEC-R1-08 — M5 expanded row/count assertions landed at spec:131 and spec:192-193.
- CONFIRMED: SPEC-R1-09 — Base-relative claims moved to SAS9/assumption 5 at spec:216 and spec:255.
- CONFIRMED: SPEC-R1-10 — SAS10 DoD-7 sweep landed at spec:222.
- CONFIRMED: SPEC-R1-11 — Frozen count is 16 at spec:156.
- CONFIRMED: SPEC-R1-12 — M8 landed at spec:134 and spec:228.
- CONFIRMED: SPEC-R1-13 — Unbound reason is in Binding at spec:159.

### M3 does not gate all required anchor names

- severity: medium
- confidence: high
- origin: NEW
- location: spec C7/M3, SAS3
- defect: The plan and C3 require anchors naming all five components and the skeleton path, but M3 only says anchors are present in B/C/D/F. A test checking four paragraph-local strings can pass without verifying component names or path.
- evidence: Plan:32,36,61; spec:85-91; spec:129 and spec:177-181 omit explicit name/path assertions.
- impact: FR3 and DoD 3 can fail while the mechanical gate passes.
- fix: Require M3 to assert each anchor’s component name and `references/spec-artifact-skeleton.md` path explicitly.

### M3 leaves delta-round mechanics mutable

- severity: high
- confidence: high
- origin: NEW
- location: spec C3/C7/M3, SAS3
- defect: C3 requires the existing Delta rounds section to remain byte-stable, but M3 protects only attack-surface headings, anchors, and the output-format block.
- evidence: C3 precondition at spec:90; plan prohibits round-mechanics changes at plan:32 and plan:43; M3 inventory at spec:129 and SAS3 at spec:180 contain no Delta-section assertion.
- impact: An implementation can alter reviewer round mechanics while all contract tests pass, violating the locked prompt scope.
- fix: Add a self-contained literal assertion for the Delta rounds section.

### M1 does not enforce section-local skeleton shape

- severity: medium
- confidence: high
- origin: NEW
- location: spec C1/C7/M1, SAS1
- defect: M1 checks marker presence, section ordering, and placeholders, but not that each marker is inside its owning component section or that the H1/section set is unique.
- evidence: C1 requires five exact component blocks at spec:57-65; M1 only enumerates global markers/order at spec:126-129; SAS1 falsifies only removal/reordering at spec:168-169.
- impact: A malformed scaffold with markers moved into one section or extra sections can pass while FR1/DoD 1 is false.
- fix: Assert exact section boundaries and each component’s required markers/placeholders within its own section.

### M5 specifies an impossible ten-field row

- severity: medium
- confidence: high
- origin: NEW
- location: spec C4/C7/M5
- defect: The C4 row contains nine keys, while the pinned schema requires nine keys and permits only optional `verification`; M5’s “all ten fields exactly” has no defined tenth field and conflicts with the exact row shape.
- evidence: C4 row at spec:98-103; schema required keys at `skills/sdlc/assets/normative-references.schema.json:24-41`, with `additionalProperties: false` at line 25.
- impact: Build cannot implement an unambiguous exact assertion without inventing a field or an unstated absence rule.
- fix: Change M5 to assert the nine required keys and explicitly assert that optional `verification` is absent.

### M5 cannot prove other inventory rows were unchanged

- severity: medium
- confidence: high
- origin: NEW
- location: spec C4/C7/M5, SAS5
- defect: Matching the new row and counting 81 rows leaves the other 80 rows unconstrained; an existing row can be replaced while preserving both checks.
- evidence: Spec claims “no other row changed” at spec:131 and spec:192; the checker validates each current entry but performs no baseline comparison at `skills/sdlc/scripts/check-references.mjs:90-113`.
- impact: C4’s no-other-row invariant and the inventory compatibility claim can silently regress.
- fix: Assert the complete expected `sources[]` array or require SAS9 to inspect that exactly one row was added.

### SAS10 invokes `check-lifecycle` with invalid arguments

- severity: high
- confidence: high
- origin: NEW
- location: spec SAS10
- defect: SAS10 requires `bash skills/sdlc/scripts/check-lifecycle.sh` with no declaration source and expects exit 0, but the checker requires exactly one `--event`, `--body`, or `--track` source.
- evidence: Usage is `skills/sdlc/scripts/check-lifecycle.mjs:29`; argument validation requires one source at lines 56-104. Running the specified command exits 2 with `exactly one declaration source group is required`.
- impact: The mandatory DoD-7 scenario cannot pass as written.
- fix: Specify a valid invocation such as `--track irreversible --slug spec-artifact-skeleton` with the required artifact context.

CLEAR: D — no additional delta contradiction found beyond the concrete omissions above.  
CLEAR: F — the revised Compatibility binding still references valid SAS8/SAS9 scenarios.  
CLEAR: H — the plan minted no carry, and SAS14 names its destination.
