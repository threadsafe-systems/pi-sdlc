### PR scope scenario rejects the spec’s own required review artifacts

- id: SPEC-R2-01
- severity: medium
- confidence: high
- origin: NEW
- area: B
- location: GPC15, `docs/specs/2026-08-09-gate-presentation-contract.md:350-360`
- quote: “the PR panel verifies every edit falls inside the surfaces C1–C6 and C9–C10 declare (phase-brainstorm.md §1/§8/§9, phase-plan.md §4, the one new test file)”
- defect: GPC15 is given the branch’s full PR diff but permits only phase references and the new test, excluding the spec itself and review artifacts. The reviewed commit’s diff already contains `docs/specs/2026-08-09-gate-presentation-contract.md` and three files under `docs/reviews/spec-review-gate-presentation-contract-2026-08-09/`.
- evidence: `git diff --name-only 9d45da9^ 9d45da9` lists the spec and three round-1 review files, none of which are in GPC15’s permitted surfaces.
- impact: A legitimate PR carrying the required spec and panel evidence fails its own carried scenario; the scope gate cannot be satisfied without omitting required lifecycle artifacts.
- fix: Qualify the rule as “every phase-doc edit” and explicitly allow the spec, review evidence, and required validation artifacts, while retaining the out-of-scope-file check.

### The no-parser requirement is omitted from its contract and FR bindings

- id: SPEC-R2-02
- severity: medium
- confidence: high
- origin: NEW
- area: B
- location: C8/F7 bindings, `docs/specs/2026-08-09-gate-presentation-contract.md:136-149,196`
- quote: “no runtime grammar machinery exists anywhere” and “Gated by: GPC10, GPC11, GPC12”; F7 is bound to “C8, GPC10, GPC11, GPC12”.
- defect: GPC15 is the only scenario that explicitly falsifies “any new parsing machinery” (`:350-360`), but C8 and F7 omit GPC15 from their gating lists.
- evidence: GPC15’s falsifier is “any new parsing machinery” (`docs/specs/2026-08-09-gate-presentation-contract.md:356-360`), while C8’s and F7’s bindings stop at GPC12.
- impact: The contract/FR traceability says the no-parser rule is gated without naming the only scenario that checks it; a contract matrix can report C8/F7 covered while omitting the carried parser guard.
- fix: Add GPC15 to C8’s `Gated by` list and F7’s binding, or bind the no-parser prohibition to a dedicated scenario.

### The exact two-artifact requirement has no falsifiable scenario

- id: SPEC-R2-03
- severity: high
- confidence: high
- origin: NEW
- area: C
- location: C1/GPC1, `docs/specs/2026-08-09-gate-presentation-contract.md:30-36,212-220`
- quote: C1 requires “the two-artifact requirement (sketch + decisions list)”, but GPC1 only requires that “exactly one fenced example shows a sketch and all three decision-line kinds”.
- defect: No scenario asserts that §8 declares exactly those two artifacts or rejects an additional recap/artifact. GPC17 checks the trigger, absence declaration, amendment loop, and transition, but never checks the exact artifact count.
- evidence: GPC1’s falsifiers are only “a second block, a missing kind in the example, or a grammar line altered” (`:219-220`); none covers an omitted two-artifact rule or a third artifact.
- impact: An implementation can pass all mechanical §8 checks while retaining or introducing a third contractual recap, violating the plan’s central two-artifact shape.
- fix: Extend GPC1 with a decidable exact-two-artifact anchor and a falsifier for an extra required artifact or recap.

### GPC13 names a Build validation point that the framework does not have

- id: SPEC-R2-04
- severity: medium
- confidence: high
- origin: NEW
- area: A
- location: GPC13, `docs/specs/2026-08-09-gate-presentation-contract.md:328-337`
- quote: “at the Build phase’s first task-close validation, the validator (or owner) judges”
- defect: The round-1 fix moved the inspection point to Build, but Build explicitly has no gate and its output is validated downstream during Implement.
- evidence: `skills/sdlc/references/phase-tasks.md:104-107` states “Build has **no gate of its own**” and “Its output is validated downstream, per-task, during Implement”; the per-task validator seam is defined at `skills/sdlc/references/phase-implement.md:103-118`.
- impact: The named inspection decision point cannot occur as written, leaving the usability NFR’s required human judgment without an executable owner or phase.
- fix: Rename the decision point to the first per-task validator/task-close validation during Implement.

### DoD 3 and the timing portions of DoD 4 are ungated

- id: SPEC-R2-05
- severity: medium
- confidence: high
- origin: NEW
- area: C
- location: GPC12, `docs/specs/2026-08-09-gate-presentation-contract.md:318-325`
- quote: “`npm test` passes in full … `node skills/sdlc/scripts/check-references.mjs` exits 0, and `npx biome check` is clean on the touched-file set.”
- defect: GPC12 never runs the required direct command `node --test test/gate-presentation-contract.test.js`, never enforces its `< 1 second` budget, and never enforces the plan’s external 30-second budget for `npm test`.
- evidence: Plan DoD 3–4 require the exact contract-test command and budgets at `docs/plans/2026-08-09-gate-presentation-contract.md:153-155`; the spec’s GPC12 contains neither timing bound nor direct command.
- impact: A missing or excluded contract-test file, an over-budget contract test, or an over-budget full corpus can satisfy the listed scenario.
- fix: Extend GPC12 or add a mechanical scenario that runs the exact contract-test command offline under one second and runs the full corpus under the stated 30-second external timeout.

### DoD 7 and the consumer-fixture half of DoD 8 are not gated

- id: SPEC-R2-06
- severity: medium
- confidence: high
- origin: NEW
- area: C
- location: GPC12/GPC15, `docs/specs/2026-08-09-gate-presentation-contract.md:318-325,350-360`
- quote: GPC12 lists only “`npm test`”, `check-references.mjs`, and Biome; GPC15 lists “no frozen surface changed” but no consumer-fixture diff check.
- defect: No scenario runs the required lifecycle command after Spec and Build artifacts are committed, and no scenario asserts `git diff main...HEAD -- test/fixtures/consumer/` is empty.
- evidence: Plan DoD 7–8 require both checks at `docs/plans/2026-08-09-gate-presentation-contract.md:160-167`. The standing frozen list at `test/frozen-surfaces.test.js:15-43` does not include `test/fixtures/consumer/`, so GPC15’s frozen-surface assertion cannot substitute for that explicit fixture check.
- impact: A branch can pass every named spec scenario while failing the lifecycle completion check or modifying the protected consumer fixtures.
- fix: Add the exact lifecycle command to a final verification scenario and add the explicit consumer-fixture diff assertion to the PR-gate scope scenario.

CLEAR: D — The dogfood scenario names the canonical home and requires byte-for-byte sketch comparison.

CLEAR: E — No additional skeleton or dangling-binding defect was found beyond the binding omission reported above.

CLEAR: PROPORTIONALITY — The delta’s checks are plan-mandated; no separate enforcement-cost defect is supported.

VERDICT: 6 findings (1 high, 5 medium, 0 low)
