### DoD item 8 demands mechanical proof of a prose-law contract

- severity: high
- confidence: high
- location: Definition of done, item 8
- defect: "Tests prove the standard transition order, including before-hooks, review/gate, human approval, after-hooks, and next-phase entry" is not falsifiable. ADR 0011 explicitly forbids a mechanical hook runner and states hooks are "prose law executed by the agent"; human approval is a human gate. No automated test can "prove" transition order in a system that lacks a mechanical runner.
- evidence: Plan DoD: "Tests prove the standard transition order, including before-hooks, review/gate, human approval, after-hooks, and next-phase entry." ADR 0011: "Enforcement is prose law executed by the agent — the same model as the iron law — with NO mechanical runner and NO CI check that hooks fired."
- impact: The DoD cannot be satisfied as written. The spec author will be forced to either invent a mechanical runner (contradicting a locked decision) or write tests that only verify documentation prose, which does not constitute proof of transition order.
- fix: Reword to "The contract documents the standard transition order for both tracks, including before-hooks, review/gate, human approval, after-hooks, and next-phase entry; documentation-to-assets tests verify the contract text is present and consistent with SKILL.md and ADR 0011."

### A1 "where practical" makes the aggregate-diagnostics outcome unverifiable

- severity: medium
- confidence: high
- location: Required outcomes A1, bullet 3
- defect: The escape clause "where practical" makes it impossible to write a falsifiable test for whether diagnostics identify every discovered blocker in one run. Any failure to aggregate can be dismissed as not practical.
- evidence: Plan A1: "Diagnostics identify every discovered blocker in one run where practical, rather than forcing a fix-and-rerun loop for independent failures."
- impact: The outcome becomes a judgement call rather than a falsifiable requirement, weakening the acceptance contract and making panel adjudication subjective.
- fix: Replace "where practical" with a bounded criterion: "Diagnostics identify all blockers that do not depend on fixing another blocker; independent failures are reported in one run."

### Plan changes ADR 0010 gate semantics without explicitly flagging the amendment

- severity: medium
- confidence: high
- location: Required outcomes A1; Constraints and locked decisions
- defect: ADR 0010 already states that adoption requires a committed manifest and defines `sdlc-status` exit codes (0=opted-in, 1=no manifest, 2=invalid). The plan introduces a three-state model (not adopted / adopted-not-ready / ready) that changes what exit 0 means and adds new readiness checks, but never states it amends ADR 0010. The conditional phrasing "If commitment to git is part of adoption law" suggests the plan author is unaware ADR 0010 already decided this.
- evidence: ADR 0010: "Decision: a repo opts in by committing `.pi/sdlc/sdlc.config.json`. A new `sdlc-status` script is the mechanical gate (exit 0 opted-in / 1 no manifest / 2 invalid)." Plan A1: "If commitment to git is part of adoption law, an untracked or ignored manifest cannot be reported as fully adopted without an explicit diagnostic."
- impact: The spec author may not classify the exit-code/behaviour change against FS5, may omit migration guidance for existing consumers, and may leave the implementation inconsistent with the ADR.
- fix: Add to Constraints: "This plan amends ADR 0010 by enforcing its 'committed manifest' requirement in `sdlc-status` and layering readiness states beneath opt-in; the Specification must supersede ADR 0010's exit-code semantics and document the migration."

### The local lifecycle-checker CLI surface is undefined

- severity: medium
- confidence: high
- location: A2, Scope In, DoD item 6
- defect: The plan requires "a local lifecycle checker and shipped GitHub Actions integration" but never states whether this is a new script, an extension to `sdlc-status`, or a new npm script. The current repository has no such script, and the DoD requires it to have frozen CLI semantics.
- evidence: Plan DoD item 6: "A local lifecycle checker and shipped GitHub Actions integration fail when required track artifacts/declarations are absent..." Current `skills/sdlc/scripts/` contains only `sdlc-status`, `setup-sdlc`, `resolve-panel`, and `ensure-panel-agent`. `package.json` scripts are `test`, `lint`, `format`.
- impact: The spec author must invent the CLI surface without plan guidance, risking an inconsistent FS5 amendment or a missed frozen-surface classification.
- fix: Add to Scope In or A2: "The local lifecycle checker is a new script `skills/sdlc/scripts/sdlc-check.sh` (+ `.mjs`) with frozen CLI semantics (FS5), or an explicit extension of `sdlc-status` with new flags."

### A2 "model preference files" ambiguously bleeds into child 4 scope

- severity: medium
- confidence: high
- location: Required outcomes A2; Scope Out
- defect: A2 says setup provisions "valid identity/configuration and model preference files." The programme assigns a new author-model preference surface to child 4 (O7). The plan does not clarify whether "model preference files" means the existing FS2 `sdlc.models.json` only, or also the future child-4 author-preference file. This creates a contract boundary ambiguity.
- evidence: Plan A2: "valid identity/configuration and model preference files." Plan Out: "Author-model dispatch and panel-invariant changes; child 4." Programme O7: "Author preferences live in a new, separate, versioned surface rather than being added to FS2's exactly-four review phase keys."
- impact: Child 1's spec may accidentally design the author-preference file location or schema, creating a contract collision with child 4.
- fix: Explicitly state in A2 or Constraints: "Model preference files" refers to the existing `sdlc.models.json` (FS2) only; author-model preferences are explicitly out of scope and belong to child 4.

### Missing Windows/non-POSIX invocation risk for A5

- severity: low
- confidence: medium
- location: Risks and dependencies; Required outcomes A5
- defect: A5 requires "Every command shown in the skill, README, setup template, or generated output works when the session cwd is the consumer repository." All current script entry points are `.sh` bash wrappers that will not execute on Windows. The risk section names "Invocation portability" for pi package discovery but omits shell-script portability entirely.
- evidence: `skills/sdlc/scripts/*.sh` all have `#!/usr/bin/env bash` shebangs. Plan risks: "Invocation portability: pi package discovery may not expose a conventional binary path."
- impact: A Windows consumer cannot run the lifecycle checker or setup from consumer cwd via the `.sh` wrappers, making A5 unachievable on non-POSIX without a cross-platform mechanism.
- fix: Add risk: "Shell script wrappers are POSIX-only; the Specification must define the supported Windows invocation path (direct node `.mjs` or a pi-skill command) so A5 holds cross-platform."

CLEAR: B — Every stated outcome has a plausible verification path once "where practical" and "prove" are pinned; the spec can turn A1–A7 into falsifiable scenarios with the fixes above.
CLEAR: C — In-scope and out-of-scope items are coherent and do not contradict the objectives; the change is large but thematically unified around adoption honesty and matches the approved programme decomposition.
CLEAR: D — The plan does not reopen any settled decision except ADR 0010 (which it changes without flagging, already captured above); all other ADRs and programme constraints are respected.
CLEAR: F — The plan correctly classifies itself as irreversible and states that FS1/FS5 changes must be classified additive or breaking before implementation.
