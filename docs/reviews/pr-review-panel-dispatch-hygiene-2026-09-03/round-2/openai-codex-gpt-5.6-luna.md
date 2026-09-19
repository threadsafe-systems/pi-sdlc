### Aggregate cap does not bound in-flight replacement work

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-02)
- file: skills/sdlc/references/phase-pr-review.md
- line: 234-237
- problem: §5 says to cap total panel time at four times the opening budget and, at the cap, merely stop dispatching. Replacement retries are explicitly brand-new top-level async calls with fresh `timeoutMs`, but the rule neither clamps a new call to the remaining aggregate budget nor stops already-running children.
- repro_or_impact: With a 45-minute opening budget, a replacement launched just before the 180-minute cap can keep running for another 45 minutes, so the claimed total-time ceiling is exceeded. The orchestrator needs to pass the remaining cap as the call's deadline and stop/harvest in-flight work at the cap, or narrow the claim to a launch cutoff.

### The new child-dispatch DoD has no executable check or committed evidence

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-05)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 62-65
- problem: The Plan now requires every configured entry to answer a probe dispatched as a subagent child, but T1's only liveness check still compares ids with `pi --list-models`; the resolver's optional `--pong` is a direct `pi --print` call, not a child dispatch. No per-entry child probe receipt is committed in this branch.
- repro_or_impact: A model can pass both the catalog sweep and `--pong` while its child launch fails (the fable version-gate failure documented in the run is exactly this class), leaving all documented T1 checks green while the new Definition of Done is unverified. Add a bounded child-dispatch check/receipt or remove the stronger DoD claim.

### The mandatory tracker projection is still skipped

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-09)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 155-173
- problem: This build has two tasks and `shape.publishToTracker` is 2, so the governing Build contract requires an epic, native task sub-issues, and board items; A4 and the Tracker section explicitly leave those objects uncreated and use #268/#270 as a substitute. Live issue state still shows both issues unlabelled, open, and absent from project 5.
- repro_or_impact: The two generic issues do not provide the required sub-issue/parent edges or a resumable board frontier, and `Closes #268`/`#270` on the PR does not create that projection. The plan must publish the threshold projection or obtain a contract-level exemption rather than recording this as a settled build choice.

### CARRY-TO-IMPLEMENT is falsely marked discharged by PR review

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-10)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 124
- problem: The build-plan gap row marks `CARRY-TO-IMPLEMENT` discharged because Round 1 of the PR panel read §5, but Implement requires this carry to be recorded against a commit, task, or test in the receiving task's checks/Assumptions and blocks task close while it is unlanded. The branch has no task-validation receipts or Implement landing for T1/T2; the only artifact cited is a PR review.
- repro_or_impact: With `review.tasks: subagent`, the required per-task validator receipt is absent and the carry's receiving-phase checkpoint is bypassed. Restore the carry's Implement landing and receipts before treating the build as complete.

### Implement guidance still names removed task-validator models and an invocation that fails

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-implement.md
- line: 201-204
- problem: The `Under your configuration` block still prescribes `deepseek/deepseek-v4-flash` followed by the undated `anthropic/claude-haiku-4-5`, although the committed `task_validate` roster now starts with dated Haiku, its Bedrock twin, and GLM fallbacks. Its example `resolve-panel task_validate` also omits the now-required `--track`.
- repro_or_impact: Following this shipped Implement reference either selects the removed/unusable aliases or exits before resolution with `this config has per-track overrides — pass --track irreversible|reversible`, reintroducing the dispatch failure this change claims to fix. Update the configuration-dependent guidance and include the track argument.

### Build T2 retains the falsified calibration

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-04)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 84-87
- problem: T2 still records its single observation as PR #261's “70 files, 30 minutes failed, 90 minutes completed,” while the same file's revised A2 says the observed panel was 55 files with two of three reviewers exhausting the default, and §5 now uses that corrected account.
- repro_or_impact: The build task carries two incompatible calibration records, so a future implementer can use the wrong sample or wrongly infer that all reviewers timed out. Synchronize T2 with A2 and the corrected §5 evidence.

### T1 still claims index stability despite inserting a roster entry

- severity: low
- confidence: high
- origin: REOPENED(PR-R1-11)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 47-56
- problem: T1 says it changes ids “without moving any entry's position” while its own next bullet inserts direct `anthropic/claude-opus-5` ahead of the existing Bedrock entry. That insertion shifts the Bedrock and later `pr_review` candidates, even though the revised Plan correctly claims only relative order is preserved.
- repro_or_impact: The build task's stated invariant is mechanically false and conflicts with the current config/Plan, making future roster review unable to tell whether an index shift is intentional. Change the task wording to the relative-order invariant.

VERDICT: REVISE
