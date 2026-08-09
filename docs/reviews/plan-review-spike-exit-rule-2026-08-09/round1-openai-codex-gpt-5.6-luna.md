### Separate contract-test file breaks the existing corpus

- severity: high
- confidence: high
- origin: NEW
- location: In scope 7; Definition of done 5
- defect: The Plan adds `test/spike-exit-rule.test.js`, but the existing gate contract requires all such assertions in `test/gate-presentation-contract.test.js`.
- evidence: `test/gate-presentation-contract.test.js:3-6` says later assertions append to “this one file”; `docs/specs/2026-08-09-gate-presentation-contract.md:142-148` fixes that file as the contract-test shape.
- impact: A second file violates the locked corpus shape and escapes the existing anti-restatement guard.
- fix: Append S4 assertions to `test/gate-presentation-contract.test.js` instead of creating a new test file.

### Four-way routing lacks the required mechanical classification

- severity: high
- confidence: high
- origin: NEW
- location: In scope 1-3
- defect: The Plan promises labels for four routes but does not require predicates for classifying each recap assumption or a route for read-settleable, experiment-settleable, delivery-grade, and judgment-only uncertainty.
- evidence: Plan lines 81-91 only name the four-way table and checkpoint; R5 S4 requires a “mechanical read/spike/front-load/judgment table over recap assumptions, in #161’s verifiability vocabulary” (`docs/briefs/2026-07-26-design-phase-r5-synthesis.md:61`).
- impact: Agents can route the same uncertainty inconsistently, including silently using a spike to avoid Plan; anchor tests cannot verify the intended decision rule.
- fix: Require an explicit per-assumption classification table and falsifiable route predicates, without restoring a fixed numerical threshold.

### Direction and artifact treatment combinations are undefined

- severity: medium
- confidence: high
- origin: NEW
- location: In scope 4-6
- defect: The Plan declares direction and treatment independent but never defines valid combinations or what happens to provisional foundation/candidate material when direction is `stop` or `revise`.
- evidence: Plan lines 92-103 independently enumerate both sets and only define the three direction transitions; lines 47-50 state foundation/candidate status remains provisional.
- impact: Implementation can leave a stopped change with indefinitely provisional material, or disagree on whether evidence must be retained, discarded, or carried into the next Brainstorm.
- fix: Add a direction × treatment outcome matrix while preserving their independent selection.

### Ceremony-facing handoff to #158 is missing

- severity: medium
- confidence: high
- origin: NEW
- location: Out of scope; Context for the next agent
- defect: The Plan omits the ratified routing of ceremony-facing spike invocation/scaling questions to #158’s build stream.
- evidence: R5 S4 explicitly says “Ceremony-facing half routes to #158 (§5)” (`docs/briefs/2026-07-26-design-phase-r5-synthesis.md:61`); the Plan’s scope and context contain no #158 destination.
- impact: The implementation agent has no landing site for ceremony behavior and may either omit the dependency or grow S4 into tooling/estimator machinery.
- fix: Add an explicit #158 handoff and state that S4 implements only the Brainstorm guidance half.

### Gate checks are not all budgeted

- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done 7-10
- defect: Only the focused test and full suite have time budgets; Biome, reference checking, frozen-surface verification, and lifecycle checking have none.
- evidence: Plan lines 139-146; `.pi/sdlc/workflow.md:5-11` requires every CI/release-gate scenario to state an explicit time budget.
- impact: The gate’s total cost is not bounded or falsifiable under the project’s governing workflow.
- fix: Give each remaining check a plausible explicit timeout/cost bound or place it under a clearly bounded aggregate gate budget.

CLEAR: A — The semantic DoD items have observable prose anchors or existing mechanical checks.
CLEAR: F — The irreversible classification is consistent with changing a public lifecycle contract.
