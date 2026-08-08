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