### Lifecycle documents contradict the owner-approved state

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-08-14-plan-artifact-skeleton.md
- line: 3
- problem: The plan and its spawned specification both say `owner approval pending`, while the supplied governing state and the spec's own Plan pointer/pr-body say rev 4/rev 3 are owner-approved and the two escalations are already owner-ratified. The committed lifecycle records therefore present an internally contradictory approval state.
- repro_or_impact: A reader or lifecycle gate following the authoritative status line will treat the artifacts as still awaiting approval and may hold or re-route the slice despite the ratified GPC/#146 decisions. Update the status lines in both `docs/plans/2026-08-14-plan-artifact-skeleton.md:3` and `docs/specs/2026-08-14-plan-artifact-skeleton.md:3` to the approved state.

### IDV19 test name claims an invariant its temporary implementation exempts

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 491
- problem: `IDV19: the frozen list contains every adversary prompt` is false during this branch's deliberate unfreeze: the loop at lines 498–499 filters out `plan` and only checks the spec/review prompts. The body comment documents the exception, but the test's public name still asserts the opposite.
- repro_or_impact: The suite passes while a reader of the test output can incorrectly conclude that `adversary-plan.prompt.md` is frozen, obscuring the weakened safety boundary until the post-merge re-freeze. Rename the test to state the remaining-prompt/window behavior, then restore the stronger name with the unfiltered loop in the follow-up.

### Frozen-surfaces header still says the unfrozen plan prompt is protected

- severity: low
- confidence: high
- origin: NEW
- file: test/frozen-surfaces.test.js
- line: 1-4
- problem: The ASD19 header says it protects “plan/spec/task validator prompts,” but the changed `FROZEN` array at lines 15–32 deliberately removes `adversary-plan.prompt.md`. That prose is stale for the branch's active guard.
- repro_or_impact: A maintainer may rely on ASD19 as a byte-identity guard for the plan prompt even though edits to it are intentionally outside the diff command, weakening review of future changes during the unfreeze window. Remove “plan” from the protected-surface description or explicitly document the temporary exception and re-freeze owner.
