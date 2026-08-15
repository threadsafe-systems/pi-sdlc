### PAS11 validation permits runs far beyond the governed budgets

- severity: medium
- confidence: high
- origin: NEW
- file: docs/validation/plan-artifact-skeleton/t5.json
- line: 18-91
- problem: The PAS11-owning manifest gives `npm test` 300 seconds, task tests 120 seconds, reference/lifecycle checks 60 seconds, and Biome 120 seconds, although the committed contract requires 30 seconds, less than 1 second, and 5 seconds respectively (`docs/specs/2026-08-14-plan-artifact-skeleton.md:303-307`). The same over-wide caps recur in the T1-T4 manifests, so the validation machinery is disproportionate to what it gates and does not enforce the budget it marks PASS.
- repro_or_impact: A full test run taking 299 seconds, or a reference check taking 59 seconds, is accepted by these manifests even though PAS11 says each must fail after 30 or 5 seconds; consequently the committed PASS receipts do not attest the externally bounded requirement.

### M3 does not pin coverage names to the anchor sentence

- severity: medium
- confidence: high
- origin: NEW
- file: test/plan-artifact-skeleton.test.js
- line: 229-240
- problem: M3 searches each entire attack-surface segment for required names rather than the single sentence that cites the skeleton, and it never rejects names assigned to another surface. Thus its claim to enforce the exact per-anchor coverage map is false.
- repro_or_impact: In a temporary copy of commit `2f8be30`, changing A's anchor from ``Check the plan's `Definition of done` block`` to `Check the plan's completion block` still produced 29/29 passing tests because the pre-existing `A. Definition of done:` heading satisfied the name check. PAS4/C7 anchor drift can therefore pass the regression suite.

### Approved governing documents still declare approval pending

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-08-14-plan-artifact-skeleton.md
- line: 3
- problem: The Plan status still says owner approval is pending even though the committed Specification records that Plan as owner-approved (`docs/specs/2026-08-14-plan-artifact-skeleton.md:7`); the Specification repeats the same stale pending status at its line 3 despite the Build plan recording approval at lines 3-4.
- repro_or_impact: A lifecycle reader using these governing documents gets mutually contradictory authorization state and can incorrectly stop for, or repeat, gates that the branch and PR body say have already passed.

### Validation verdicts point to nonexistent runner reports

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/task-validate-plan-artifact-skeleton-t1-2026-08-14/validator.md
- line: 5
- problem: The validator names `s2-t1-runner-report.json`, which is not committed; T2-T5 likewise name nonexistent report paths at their line 5, while every actual report is committed as `docs/reviews/task-validate-plan-artifact-skeleton-tN-2026-08-14/runner-report.json`.
- repro_or_impact: Following the evidence pointer in any of the five task verdicts fails, forcing an auditor to search the tree and weakening the trace from the PASS assertion to the hashed runner output.

### Temporary-test comments narrate lifecycle provenance and future edits

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 495-497
- problem: The changed comment cites a particular Spec and amendment ids, narrates what is mutable "on this branch," and describes a mandatory future deletion; `test/plan-artifact-skeleton.test.js:287` similarly narrates its future post-merge removal. These comments encode run history and future work instead of stating the current invariant reader-now.
- repro_or_impact: The explanation depends on external lifecycle state and becomes obsolete as that state changes; readers must chase AM1/AM3 to understand a local filter that can be described directly as the plan-prompt exclusion during the mutable window.
