### Exit interpretation permits inadequate evidence to proceed

- severity: high
- confidence: high
- origin: NEW
- location: C2–C3; SER6–SER7
- defect: C3 permits direction selection after criteria are merely “evaluated,” so a spike with inadequately met criteria can select `proceed`; C2 blocks only continuation.
- evidence: Spec C2 says inadequate evidence “blocks continuation” (lines 64–66), while C3’s precondition requires only evaluation and its postcondition permits Plan transition (lines 76–80). The ratified sketch routes `Exit criteria adequately met?` = No back to the checkpoint and only Yes to interpretation (plan lines 25–28).
- impact: An insufficient spike can bypass the fresh-checkpoint loop and advance to Plan, contradicting the locked exit topology.
- fix: Make adequate satisfaction of current exit criteria a C3 precondition and add a SER6 falsifier for any direction/Plan transition before that condition.

### Topology scenario cannot detect its stated falsifiers

- severity: medium
- confidence: high
- origin: NEW
- location: SER1; NFR Compatibility
- defect: SER1 claims the existing phase-reference test detects a changed phase inventory, seventh phase, or router template, but that test reads only a hard-coded six-element list and does not enumerate the reference directory, lifecycle sequence, or templates.
- evidence: SER1 claims its falsifier includes “the phase inventory changes” and “a new phase/router template” (spec lines 169–176). `test/phase-references.test.js:15` fixes `SLUGS` to six names, and lines 30–47 only test those files’ headings/callouts.
- impact: The mechanical scenario and its NFR binding can pass after a seventh phase or router is introduced.
- fix: Route these diff-only topology constraints to a named durable PR diff inspection, or add a current-tree discovery assertion within the declared test surface.

### Required lifecycle verification is omitted

- severity: medium
- confidence: high
- origin: NEW
- location: SER12
- defect: SER12 omits the Plan DoD’s required lifecycle command, so no scenario gates the committed Plan/Spec/Build artifact check.
- evidence: Plan DoD 10 requires `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug spike-exit-rule` within five seconds; SER12 lists only focused tests, `npm test`, Biome, and reference checking (spec lines 277–285). The checker verifies `artifact.plan`, `artifact.spec`, and `artifact.build` at `skills/sdlc/scripts/check-lifecycle.mjs:279–317`.
- impact: S4 can satisfy every listed verification scenario while missing its Build artifact or otherwise failing the required irreversible lifecycle check.
- fix: Add the lifecycle command with its five-second budget to SER12 and its falsifier.

### PR-gate scenarios lack durable, bounded premises

- severity: medium
- confidence: high
- origin: NEW
- location: SER13–SER14
- defect: SER13 depends on a “full branch diff,” which expires after merge, and neither PR-gate scenario declares a time/cost budget.
- evidence: SER13’s Given is “full branch diff at the PR gate” (spec line 289); SER14 also runs before the PR gate passes (lines 299–306). `phase-spec.md:61–66` requires scenarios to remain falsifiable after merge and rejects moving-ref premises; `.pi/sdlc/workflow.md:5–10` requires an explicit budget for every CI/release-gate scenario.
- impact: The inspection cannot be replayed from the merged repository, and PR-gate work has unbounded cost despite the proportionality rule.
- fix: Bind both scenarios to an immutable retained PR-review record/current-tree evidence and state plausible panel/request budgets.

### Spike-block ownership has no stable boundary

- severity: medium
- confidence: high
- origin: NEW
- location: C1, C5, SER2, SER11
- defect: C1 requires only “a distinct titled block,” without specifying its title or start/end anchors, while C5 assigns SER assertions exclusively to that block.
- evidence: C1 gives no literal heading or delimiters (spec lines 30–36); C5 says SER owns “only the distinct spike block” (lines 111–114). The existing helper extracts all of §8, not a sub-block (`test/gate-presentation-contract.test.js:24–36`).
- impact: Implementers must invent the boundary; tests can match routing prose elsewhere in §8 and still claim exclusive spike-block ownership.
- fix: Specify a stable literal heading and block boundary in C1, and bind SER2–SER11 assertions to it.

### Coined routing terms are absent from Vocabulary

- severity: low
- confidence: high
- origin: NEW
- location: Vocabulary; C1–C2
- defect: `delivery-grade` and `human checkpoint` are newly defined, repeated contract terms but have no Vocabulary entries.
- evidence: The Vocabulary binding rule is at spec line 24. `delivery-grade` appears in C1/C2 and multiple requirements/scenarios (lines 40, 58, 144, 183); `human checkpoint` appears in C2 and scenarios (lines 52–56, 204, 222).
- impact: The frozen routing predicates and approval seam lack the required single definitions.
- fix: Add Vocabulary rows defining and binding both terms to `phase-brainstorm.md` §8.

CLEAR: E — no framework/dependency-behaviour claim required beyond verified repository source behavior.

CLEAR: H — no `CARRY-TO-SPEC` record exists in the ratified Plan or its plan-review artifacts; SER14 correctly carries its separate follow-up to `pr_review`.
