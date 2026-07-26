# spec_review round 1 — google/gemini-3.1-pro-preview:xhigh

Target: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `c0e8d22`.
Verbatim reviewer output.

Dispatch note: this child was again marked `failed` by the subagent acceptance
layer ("completed without making edits for an implementation task") while having
returned a complete verdict. Per `phase-pr-review.md` §5 "Reviewer dispatch
recovery" a reviewer that returns a verdict is never replaced; the verdict below
was recovered from the run's `output-1.log`. Third occurrence this run.

---

### Inbound checkpoint for Implement phase is unplaceable and breaks IDV12

- severity: high
- confidence: high
- location: C3 table (`phase-implement.md` row) and IDV12
- defect: C3 names no target section for `phase-implement.md`, but IDV12 asserts that "The four inbound checkpoints of C3 each appear in their named reference and section." An implementer cannot place the checkpoint in a named section because none is named, rendering IDV12 impossible to pass or write as specified.
- evidence: Spec C3 table: `| phase-implement.md | — | CARRY-TO-IMPLEMENT | task close |` (no section specified). Spec IDV12: "The four inbound checkpoints of C3 each appear in their named reference and section."
- impact: The inbound carry checkpoint for the implementation phase is underspecified, freezing a test failure or forcing the implementer to guess the section (e.g., §5 or §8).
- fix: Specify the target section in C3 for `phase-implement.md` (e.g., `phase-implement.md` §8).

### Artifact-inventory self-audit is ungated

- severity: medium
- confidence: high
- location: C2 table and IDV5
- defect: C2's text and IDV5 state there are "ten C2 additions" in `phase-pr-review.md` §5, but the C2 table actually lists 11 items (10 numbered + 1 unnumbered "Artifact-inventory self-audit"). An implementer could omit the self-audit while satisfying IDV5.
- evidence: Spec C2 says "Ten additions, distributed across the existing numbered steps". The C2 table has 11 rows (1-10 plus "—"). IDV5 explicitly asserts "`phase-pr-review.md` §5 contains all ten C2 additions".
- impact: The non-blocking artifact-inventory self-audit (D5 from the Plan) is not enforced by IDV5 and could be silently dropped by a passing implementation.
- fix: Update C2 and IDV5 to state there are eleven additions, and assert all 11 (including the self-audit) in IDV5.

### Spec-gap log definition excludes inbound Spec carries

- severity: medium
- confidence: high
- location: C5 (Spec-gap log)
- defect: C5 defines the spec-gap log as containing gaps "found during decomposition", but the Plan explicitly requires that an inbound `CARRY-TO-BUILD` from the Spec phase lands in the build plan's spec-gap log. A gap from the Spec phase is not "found during decomposition".
- evidence: Plan scope item 5 says "A build plan is not complete while a `CARRY-TO-BUILD` is unlanded in its spec-gap log." Spec C5 restricts the log to "upstream deficiency found during decomposition" and does not list `CARRY-TO-BUILD` handling.
- impact: Contradiction with the plan's locked decision on where `CARRY-TO-BUILD` lands. An implementer cannot faithfully implement both C5's restriction and the inbound `CARRY-TO-BUILD` rule.
- fix: Broaden C5's definition to include inbound Spec carries ("deficiency found during decomposition or carried inbound from Spec").

### Assumption-recorded composition rule is ungated

- severity: medium
- confidence: high
- location: C5 (Spec-gap log) and IDV14
- defect: C5 contracts that `assumption-recorded` "composes with the existing Assumptions appendix... rather than duplicating it", but no verification scenario asserts this behaviour.
- evidence: C5 text: "`assumption-recorded` composes with the existing Assumptions appendix". IDV14 definition lists exactly what is verified for C5, omitting the composition rule entirely.
- impact: The composition contract in C5 is ungated, meaning an implementer could just duplicate the Assumptions appendix or ignore the rule, and still pass IDV14.
- fix: Update IDV14 (or add a scenario) to assert that `phase-tasks.md` specifies `assumption-recorded` entries are routed to the existing Assumptions appendix.

### CARRY-TO-BACKLOG improperly forced into a configuration callout

- severity: low
- confidence: high
- location: C3 description and IDV11
- defect: C3 requires that "Each outbound entry" sits behind an "under your configuration" callout. This technically includes `CARRY-TO-BACKLOG`, but `CARRY-TO-BACKLOG` is terminal and universally available at the PR gate regardless of configuration track.
- evidence: C3 text says "Each outbound entry sits behind an under your configuration callout" and IDV11 asserts this strictly. C3's table lists `CARRY-TO-BACKLOG` as an outbound entry.
- impact: Forces the implementer to wrap a universal, non-configurable disposition inside a configuration callout, or fail IDV11.
- fix: Exempt `CARRY-TO-BACKLOG` from the "under your configuration" callout rule in C3 and IDV11.

### Typo in Glossary content cross-reference

- severity: low
- confidence: high
- location: C1 (Glossary section)
- defect: C1 lists "carry destinations (C7)" as required glossary content, but C7 is the frozen-surface handling section. Carry destinations are defined in C3.
- evidence: Spec C1 says "Content: every term group in §2 above, plus the carry destinations (C7) and amendment classes (C4)."
- impact: Typo that points the implementer to the wrong section for definitions.
- fix: Change "(C7)" to "(C3)" in C1.
CLEAR: A — No frozen shapes are illegally modified; the template preservation requirement correctly avoids modifying the thin router and the `test/frozen-surfaces.test.js` rules are faithfully extended.
CLEAR: E — The proposed changes correctly compose with the agent runner and tooling without contradicting existing `phase-pr-review.md` §5 run-shape mechanics (floor exemptions, recovery, and adjudicator caps).
CLEAR: F — Non-functional requirements are well-stated, with proportional test budgets accurately reflecting the offline-grep corpus style.
CLEAR: G — Spec text honestly claims only the mechanisms it builds, accurately reflecting the plan's scope, with class (b) amendments documented transparently.
