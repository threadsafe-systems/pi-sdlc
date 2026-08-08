# PR review round 1 — spec-artifact-skeleton (2026-08-08)

Panel: gpt-5.6-sol:xhigh (r1-sol), gpt-5.6-luna:xhigh (r1-luna), deepseek-v4-pro:xhigh (r1-deepseek, replaced amazon-bedrock opus-4-8 which failed on an AccessDeniedException — infra, not a verdict).

Diff: main...103148c (37 files, +2135/-8).

---

## r1-sol (gpt-5.6-sol:xhigh)

### Skeleton has no valid zero-item representation

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/spec-artifact-skeleton.md
- line: 3-24
- problem: Authors must “fill in every block” and “delete none of the markers,” but Vocabulary is conditional and Contracts permits zero changed interfaces. A spec with no coined terms or interfaces must either retain invalid placeholders or delete them contrary to the instruction.
- repro_or_impact: A no-interface change cannot produce a compliant completed skeleton; add an explicit empty-state convention or clarify which exemplar rows/blocks may be removed.

### SAS9’s permitted diff list excludes mandatory validation evidence

- severity: medium
- confidence: high
- origin: NEW
- file: docs/specs/2026-08-08-spec-artifact-skeleton.md
- line: 264-268
- problem: SAS9 permits only the production surfaces and tests listed there, “and nothing else,” but this branch adds 30 PV1 manifest/receipt files outside that list.
- repro_or_impact: The PR-gate inspection scenario fails against the submitted diff even though the build plan requires these artifacts. The permitted classes need to include lifecycle validation evidence explicitly.

### Skeleton hardcodes the default specification directory

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/spec-artifact-skeleton.md
- line: 3
- problem: The public skeleton identifies `docs/specs/<date>-<feat>.md` as the Spec location, while `phase-spec.md` says the authoritative home is configurable through `paths.specs`.
- repro_or_impact: Consumers with a non-default `paths.specs` receive contradictory authoring guidance and may create the artifact in the wrong directory.

### Inventory edit changes two unrelated rows

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/assets/normative-references.json
- line: 144-155
- problem: Besides adding the skeleton row, the diff rewrites two existing tracker assertions from literal em dashes to `\u2014`. This violates C4’s “no other row changes” invariant and SAS9’s permitted inventory-row change.
- repro_or_impact: M5 and `check-references` remain green because JSON decoding preserves the values, so only diff inspection exposes the unauthorized byte changes.

### M2 does not enforce immediate adjacency

- severity: medium
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 133-150
- problem: M2 searches the entire region between `Produce the Spec doc:` and Premise durability, rather than proving that the binding-rules material is the immediately following paragraph/block as C7 and SAS2 require.
- repro_or_impact: In a temporary copy, inserting a distinct paragraph between the existing first paragraph and the binding rules still left all 22 contract tests passing.

### M1 permits removal of the NFR fill-in row

- severity: medium
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 77-80
- problem: M1 checks only the NFR header and an `unbound` substring, which also occurs in the canonical rule sentence; it never checks the NFR table’s fill-in row or its placeholders.
- repro_or_impact: Removing the complete `<characteristic> | <stimulus or condition> | ...` row still left all 22 contract tests passing, despite SAS1 promising a literal non-empty fill-in block.

### SAS10’s 30-second limit is configured as five minutes

- severity: medium
- confidence: high
- origin: NEW
- file: docs/validation/spec-artifact-skeleton/t5.json
- line: 9-12
- problem: The check mapped to SAS10 gives `npm test` a 300,000 ms timeout, while SAS10 says any run over 30 seconds fails.
- repro_or_impact: A 31–300 second corpus run receives PASS from the validator, so the performance requirement is reported but not gated.

### T1 and T2 validator records cite nonexistent reports

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/task-validate-spec-artifact-skeleton-t1-2026-08-08/validator.md
- line: 5
- problem: The T1 and T2 validator records cite `report.json`, but their bundles contain only `runner-report.json`.
- repro_or_impact: Their receipt hashes verify, but the human-readable validation evidence and embedded acceptance reports point auditors to files that do not exist.
---

## r1-luna (gpt-5.6-luna:xhigh)

### Temporary unfreeze tests block the mandatory re-freeze

- severity: high
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 268-295
- problem: M6 permanently requires the spec prompt to be absent, while M7 permanently requires the temporary filtered IDV19 loop. AM3 requires restoring both, so the mandatory re-freeze will necessarily fail these tests.
- repro_or_impact: Re-add the prompt and restore the loop per AM3; M6 sees 17 entries instead of 16 and M7 sees zero filtered uses/three unfiltered loops. The re-freeze cannot leave the corpus green.

### M2 does not actually enforce paragraph adjacency

- severity: medium
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 141-164
- problem: The test only checks that rules occur somewhere between the first paragraph and Premise durability; it does not require the rules paragraph to immediately follow the first paragraph.
- repro_or_impact: Insert an unrelated paragraph between “Produce the Spec doc:” and rule 1. All M2 assertions still pass despite violating SAS2/C2 adjacency.

### Inventory row-count assertion is not durable

- severity: medium
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 96-99
- problem: M5 hardcodes `inventory.sources.length === 81`. The explicitly planned S2/S6 skeleton slices will add reference rows, turning a valid future inventory change into a failing main-branch test.
- repro_or_impact: Add any legitimate future `skills/sdlc/references/*.md` row; `npm test` fails before checking the new row. Assert the target row and use diff-gate inspection for unchanged-row claims instead.

### Unrelated inventory rows changed

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/assets/normative-references.json
- line: 144, 155
- problem: The diff rewrites two existing em dashes as `\u2014`, although C4 permits only the new skeleton row and says no other row changes.
- repro_or_impact: The parsed values are equivalent, but the byte diff violates the inventory change boundary and obscures the intended single-row addition.

### Validation receipts reference nonexistent report paths

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/task-validate-spec-artifact-skeleton-t1-2026-08-08/validator.md
- line: 5, 18, 25
- problem: T1 and T2 validator artifacts refer to `report.json`, but only `runner-report.json` exists; their acceptance commands also write to the nonexistent path.
- repro_or_impact: A reviewer following the committed evidence link cannot inspect the claimed report. Correct the T1/T2 references to `runner-report.json`.

### H1 “exact” test accepts a malformed heading

- severity: low
- confidence: high
- origin: NEW
- file: test/spec-artifact-skeleton.test.js
- line: 47-49
- problem: `startsWith("# Spec artifact skeleton\n")` allows extra text after the heading on the same line, despite M1 requiring an exact H1.
- repro_or_impact: Change the heading to `# Spec artifact skeleton (wrong)` and the test still passes. Assert the first line equals the exact heading.
---

## r1-deepseek (deepseek-v4-pro:xhigh)

Now let me compile my findings after exhaustive review of the spec, build plan, diff, and all changed files:

---

### Evidence label mislabels lifecycle declaration (T5 PV1 manifest)

- severity: low
- confidence: high
- file: docs/validation/spec-artifact-skeleton/t5.json
- line: approx 30 (the `lifecycle.declaration` check's `evidence` field)
- problem: The `lifecycle.declaration` check's evidence label says "SAS4: the run's lifecycle declaration…passes the FS9 checker", but lifecycle.declaration is mapped to SAS10 (corpus green / DoD-7), not SAS4 (prompt references, never restates). The evidence label copies the wrong scenario id.
- repro_or_impact: The scenario mapping in `categories.scenarios` correctly maps SAS10 → `lifecycle.declaration`, so the mechanical verdict is unaffected. The error is confined to the human-readable evidence label; it misleads future readers about which scenario the check supports during PV1 receipt inspection.
- smell: Mysterious Name

### No surviving findings

Beyond the low-severity label error above, the branch is contractually correct. All eight marker sets M1–M8 pass. The skeleton file ships every required component, marker, and canonical rule sentence in the exact shape C1 pins; the phase-spec.md §4 insertion lands between the correct paragraphs with all four numbered rules, the defect sentence, and the pointer; the adversary-spec prompt carries skeleton-awareness anchors in exactly B/C/D/F, names all five components, preserves L1/L2 byte-identity, and restates no canonical rule sentence; the FROZEN array matches L3 precisely with the spec prompt removed; the IDV19 reconciliation is minimal (one filter, one comment naming AM1/AM3/re-freeze); the normative-references row has all nine fields, no `verification` key, and the inventory is exactly 81 rows; the corpus is clean at 556 pass / 0 fail; frozen-surface ASD19 guards the remaining 16 entries; no changes to `templates/sdlc-spec.md`, `test/fixtures/consumer/`, `package.json`, or the lockfile.