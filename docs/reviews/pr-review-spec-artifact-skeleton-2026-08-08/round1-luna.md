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