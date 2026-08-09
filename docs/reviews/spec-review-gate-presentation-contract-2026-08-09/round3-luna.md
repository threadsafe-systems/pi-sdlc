### Unclosed lifecycle scope allowlist

- id: SPEC-R3-01
- severity: medium
- confidence: high
- origin: NEW
- area: B
- location: GPC15, `docs/specs/2026-08-09-gate-presentation-contract.md:369-378`
- quote: “the PR panel verifies every phase-doc edit falls inside the surfaces C1–C6, C8, and C9–C10 declare … Lifecycle artifacts — this spec, the build plan, the review records under docs/reviews/, and task receipts — are expected in the diff and exempt from the surface check.”
- defect: GPC15 does not define a closed allowlist for the full diff: it omits the ordinary Plan doc (`docs/plans/2026-08-09-gate-presentation-contract.md`), which is distinct from the Build plan, and does not reject arbitrary non-governed/non-lifecycle paths such as an extra source or test file.
- evidence: `skills/sdlc/references/phase-plan.md:36-38` calls the ordinary artifact the “Plan doc,” while `skills/sdlc/references/phase-tasks.md:36-40` separately calls the Build output the “build-plan doc”; the reviewed branch diff includes the ordinary Plan.
- impact: The carried PR scenario can either reject a required lifecycle artifact or let unrelated files enter a docs-only change without triggering its out-of-scope falsifier.
- fix: State that every changed path must be in an explicit allowlist covering both Plan artifacts, the two phase references, exactly the contract test, and named lifecycle evidence; reject every other path.

### GPC13 assigns prose judgment to a checklist validator

- id: SPEC-R3-02
- severity: medium
- confidence: high
- origin: NEW
- area: B
- location: GPC13, `docs/specs/2026-08-09-gate-presentation-contract.md:345-350`
- quote: “at the first per-task task-close validation during Implement … the validator (or owner) judges whether the guidance captures entities, boundaries, data flows, and actors as framing”
- defect: At the newly selected Implement decision point, the framework’s configured validator is explicitly a checklist executor, “not a judge”; judgment review occurs later at the PR panel. “Validator (or owner)” does not identify an actual owner-side inspection step, so the usability NFR has no guaranteed decision-maker at the named point.
- evidence: `skills/sdlc/references/phase-implement.md:107-108` defines the validator as “a checklist executor, not a judge,” and `skills/sdlc/references/phase-implement.md:190-194` says “Judgement review happens later at the PR panel.”
- impact: The first task-close validation can pass without anyone deciding whether the sketch guidance is framing rather than contractual, so GPC13 cannot gate the NFR it binds.
- fix: Move the inspection to the PR panel, or define an explicit Implement owner inspection before task closure and name that actor in GPC13.

### GPC2 violates the required three-part scenario form

- id: SPEC-R3-03
- severity: low
- confidence: high
- origin: NEW
- area: E
- location: GPC2, `docs/specs/2026-08-09-gate-presentation-contract.md:229-242`
- quote: “When–Then (continued): the §4 rule also states that a plan must not contradict a named decision or resurrect a `rejected:` line”
- defect: The skeleton requires exactly three named parts—`Given:`, `When–Then:`, and `Falsify:`—but GPC2 introduces a second differently named `When–Then (continued):` part.
- evidence: `skills/sdlc/references/spec-artifact-skeleton.md:62-71` defines the three-part form and names no continuation label.
- impact: The scenario is not conformant to the binding artifact shape and requires an implementer or checker to infer that the fourth label belongs to the existing `When–Then:` part.
- fix: Fold the added clause into the existing `When–Then:` paragraph or continue it on unlabelled wrapped lines.

CLEAR: A — all ten SPEC-R2 fixes are present in rev 3 as described.  
CLEAR: C — scope items 1–5 and the DoD bindings are represented by the contract/scenario matrix; no separate new coverage defect found.  
CLEAR: D — the remaining mechanical scenarios have runner- or argv-decidable checks; no additional decidability defect found.  
CLEAR: PROPORTIONALITY — the findings concern a missing scope boundary, an invalid inspection owner, and a literal skeleton violation in the rev-3 delta.

VERDICT: 3 findings (2 medium, 0 high, 1 low)
