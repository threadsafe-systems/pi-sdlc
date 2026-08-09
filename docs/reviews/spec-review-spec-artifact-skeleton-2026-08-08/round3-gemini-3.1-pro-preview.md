# Round 3 raw output — gemini (google/gemini-3.1-pro-preview:xhigh)

Delta review of spec rev 3 (`c58ad7a`). Unedited reviewer output.

### Round 3 Delta Review

- SPEC-R2-01: Confirmed (M5/SAS5 assert exactly 9 fields, extra keys forbidden).
- SPEC-R2-02: Confirmed (C7 Gated-by correctly routes SAS8/SAS9).
- SPEC-R2-03: Confirmed (C1 kind-label wording corrected).
- SPEC-R2-04: Confirmed (M3/SAS3 require anchors to contain component name and skeleton path).
- SPEC-R2-05: Confirmed (M3/SAS3 byte-identity assertion for Delta rounds).
- SPEC-R2-07: Confirmed (merged with R2-01).
- SPEC-R2-08: Confirmed (M5 drops the unprovable invariant, routed to SAS9).
- SPEC-R2-09: Confirmed (SAS10 specifies `--track irreversible --slug spec-artifact-skeleton` and records expected build-doc failure).

- severity: medium
- confidence: high
- origin: REOPENED(SPEC-R2-06)
- location: C7 (M1) vs SAS1
- defect: SAS1 claims M1 checks section-locality and exact set, but M1's definition still omits both.
- evidence: SAS1 asserts "its complete section set is exactly those five component sections, each component's markers and placeholders appearing inside its own section". However, C7 M1 merely asserts "the five section headers in the fixed order, and every literal fill-in placeholder of C1", omitting any restriction against extra sections or markers leaking outside their owning headers.
- impact: M1 as specified cannot falsify markers placed outside their owning section or extra sections being added, making SAS1's falsification claim dishonest.
- fix: Update C7 M1 to explicitly define its assertion as checking that the file contains exactly those five component sections and each marker/placeholder appears exclusively between its owning section header and the next.

- severity: medium
- confidence: high
- origin: NEW
- location: C1 vs C7 (M1)
- defect: C1 mandates that the skeleton contains the binding-rule sentences, but no scenario verifies their presence.
- evidence: C1 specifies that the Vocabulary, Contracts, and kind-labels blocks include the binding-rule sentences (e.g., "plus the binding-rule sentence (mirrors C2 rule 1)"). However, C7 M1 explicitly enumerates the literal markers it checks, and the binding-rule sentences are not listed. M2 only checks `phase-spec.md`.
- impact: A required component of the skeleton's shape is unverified by any falsifiable scenario.
- fix: Add the four mirrored binding-rule sentences to C7 M1's explicit list of literal strings checked in the skeleton.

- severity: medium
- confidence: high
- origin: NEW
- location: C7 (M2) vs SAS2
- defect: SAS2 claims M2 checks paragraph order and locality within §4, but M2 is defined as a loose file-presence check.
- evidence: SAS2 states "M2 passes — all four canonical rule sentences... appear in phase-spec.md §4, inserted after the first paragraph with the existing paragraphs intact and in order." However, C7 M2 simply asserts "C2's four canonical rule sentences and the skeleton pointer, in phase-spec.md".
- impact: M2 cannot mechanically falsify the misplacement of the rules or the deletion/reordering of §4's existing paragraphs, making SAS2 dishonest.
- fix: Update C7 M2 to explicitly assert the exact string structure of §4, proving the rules are located between the first paragraph and the Premise durability paragraph, and that the rest of the section is intact.

- severity: low
- confidence: high
- origin: NEW
- location: C6 vs C7 (M7)
- defect: C6 requires an accompanying comment that is unverified by M7/SAS7.
- evidence: C6 mandates "an accompanying comment naming AM1/AM3 and the re-freeze obligation". However, C7 M7 only asserts minimality (loop excluded, constant/sibling loops untouched), and SAS7 mentions no check for the comment.
- impact: The mandated comment in the test file is unfalsifiable.
- fix: Update C7 M7 to assert the literal presence of the required comment string.

- severity: low
- confidence: high
- origin: NEW
- location: C7 (M6) vs SAS6
- defect: SAS6 claims M6 falsifies array reordering, but M6 defines only a membership check.
- evidence: SAS6 asserts M6 falsifies "removing or reordering any further entry" and states "entry order is otherwise unchanged". C7 M6 states only "C5's membership contract (16 entries, spec prompt absent, every other frozen path present)".
- impact: A membership and count check allows arbitrary reordering, making SAS6's claim that reordering fails M6 dishonest.
- fix: Update C7 M6 to explicitly assert that the entry order of the 16 remaining paths is unchanged.

CLEAR: A — Frozen shapes vs the plan's locked decisions, field by field (No over-commits found; C4 fields perfectly match the `normative-references` schema, verified via `assets/normative-references.schema.json`).
CLEAR: C — Contracts and interfaces (All modified interfaces have well-specified, buildable contracts).
CLEAR: D — Contradictions (No internal contradictions found beyond the verification scenario gaps).
CLEAR: E — Framework reality (Lifecycle script behavior correctly matches expected exit codes and conditions for missing build doc).
CLEAR: F — Non-functional requirements (All NFRs bound to valid scenarios or explicitly unbounded with reason).
CLEAR: H — Carry landing (No carry minted by the plan, trivially satisfied).
