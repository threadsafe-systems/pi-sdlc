### Bootstrap elided as self-hosting without cut-over mechanics

- severity: high
- confidence: high
- location: PV5, DoD item 11
- defect: The plan claims the first implementation task will be validated by the freshly generated portable validator using its approved manifest, but the old committed prompt still mandates `npx tsc --noEmit` until that task merges the new prompt. The plan never explains how the first task avoids validation by the old law, framing the transition as "self-hosting" rather than the unavoidable cut-over it is.
- evidence: "The first implementation task for this change updates the validator contract and its offline tests. At that task's end, the freshly generated portable validator validates the task using its approved manifest. This is self-hosting after the new contract exists, not a temporary exception to the old TypeScript command." (PV5); current prompt at `skills/sdlc/prompts/validator-task.prompt.md:20` mandates "`npx tsc --noEmit`".
- impact: The first task cannot honestly pass under the old validator in this JS repository. Without explicit cut-over instructions, implementers will either create a hidden temporary exception or block forever.
- fix: Add an explicit bootstrap task to the plan (or Build guidance) that states the first task is validated by the new prompt file already present in the branch, and document this as a one-time transition exception in `SKILL.md`.

### FS7 heading change left unclassified

- severity: medium
- confidence: high
- location: Constraints and locked decisions
- defect: The plan amends the validator prompt under FS7 but does not state whether the required `##` section headings change. ADR 0007 treats heading changes as breaking and requires override preservation; the plan only says "any required heading amendment is classified before implementation," leaving the locked decision unresolved.
- evidence: `docs/adr/0007-prompt-skeletons-fs7.md`: "freeze the required `##` section headings of the four generic prompts... changing a required heading is a breaking change for overrides." Plan: "Prompt section-heading compatibility follows ADR 0007/FS7; any required heading amendment is classified before implementation."
- impact: If the generic prompt headings change, every consumer override becomes silently incompatible. The Specification cannot be written without knowing whether FS7 is superseded or preserved.
- fix: Explicitly classify now: either state the current validator headings are preserved verbatim, or flag an ADR 0007 supersession/amendment as part of this irreversible change.

### Mandatory command check contradicts honest applicability

- severity: medium
- confidence: high
- location: PV2
- defect: PV2 requires "At least one command check must be required for every implementation task," which forces documentation-only or toolchain-less tasks to invent a spurious command rather than honestly marking categories `n/a` with Build-approved reasons.
- evidence: "Every category appears in the task manifest. A category may be `n/a` only with a specific Build-approved reason. At least one command check must be required for every implementation task." (PV2)
- impact: A task with no runnable verification (e.g., pure documentation or ADR migration) must declare a command that will fail or is meaningless, violating PV3's goal of removing dishonest universal mandates.
- fix: Replace the universal mandate with "At least one check (command or scenario evidence) must be required; a task may mark all command categories `n/a` if the Build plan approves the reason and scenario coverage is required."

### DoD "bounded" lacks a measurable limit

- severity: medium
- confidence: high
- location: DoD item 8
- defect: The DoD requires "Overall output and verdict grammar are deterministic and bounded" but never defines the bound (max characters, max lines, truncation rule), making the item impossible to falsify with a test.
- evidence: "Overall output and verdict grammar are deterministic and bounded." (DoD)
- impact: Implementers cannot write a failing test for an unbounded validator output, and the spec cannot pin an acceptance threshold.
- fix: Replace "bounded" with a concrete limit, e.g., "truncated to last 2000 lines or 50KB" to match the existing tool contract, or state the bound is TBD by the Specification.

### Test fixture location and integration unspecified

- severity: medium
- confidence: medium
- location: Scope: In
- defect: The plan promises new offline contract tests for TypeScript, JavaScript, and non-Node manifests but does not state where the fixtures live, how they are discovered by `npm test`, or whether they extend the existing `test/extraction.test.js` harness.
- evidence: "Deterministic offline prompt/golden/contract tests for TypeScript, JavaScript, and non-Node task manifests." (Scope: In); existing test harness at `test/extraction.test.js:1` uses `node --test`.
- impact: The Build cannot decompose this into verifiable files, and the DoD items about mutation fixtures cannot be independently checked without asking the author.
- fix: Add a sentence to Scope naming the test directory or file pattern (e.g., `test/validator-contract.test.js` and `test/fixtures/manifests/`).

### Secret exposure risk absent from DoD

- severity: low
- confidence: high
- location: Risks: Output volume; DoD
- defect: The plan identifies that raw command output may contain secrets, but no DoD item requires evidence to redact environment variables, credentials, or auth contents.
- evidence: "Output volume: raw command output can be large or contain secrets. Evidence must be bounded and must not echo environment/auth contents unnecessarily." (Risks)
- impact: A validator passing all DoD items could still leak `AWS_SECRET_ACCESS_KEY` or bearer tokens in failed-command evidence.
- fix: Add a DoD item: "Command evidence in output never echoes environment variables, credential files, or auth headers; mutation fixtures verify redaction."

CLEAR: A — Most DoD items are directly falsifiable; the two flagged items are specific and actionable.
CLEAR: C — In-scope and out-of-scope are coherent, consistent with programme child 3a owning O4, and represent one spec's worth of tightly coupled FS7 work.
CLEAR: F — The plan correctly classifies as irreversible because it amends the shipped FS7 prompt contract and `SKILL.md` validation law.
