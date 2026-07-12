### DoD behavioural fixtures are unfalsifiable under the plan's own constraints

- severity: high
- confidence: high
- location: Definition of done (items 3–6, 12); Risks ("Manifest remains prose"); Constraints ("Tests make no paid model or network call")
- defect: The DoD requires deterministic, offline "contract fixtures" and "mutation fixtures" that prove verdict behaviour (missing category → `FAIL`, undeclared command substituted → fail, validator-invented `n/a` → `FAIL`, scenario evidence missing → fail), but the validator is an LLM subagent interpreting prose, the plan forbids "pretending there is a parser," and tests may make "no paid model or network call." There is no mechanism left that can produce these verdicts deterministically in a test.
- evidence: DoD: "Missing category/id/command/reason, duplicate id, validator-invented `n/a`, or unrun required check deterministically yields `FAIL` in contract fixtures"; Risk: "make its grammar strict enough for an agent to reject omissions consistently without pretending there is a parser"; Constraint: "Tests make no paid model or network call." The existing suite has no verdict harness — `test/*.test.js` are prompt-golden/CLI-status tests only (e.g. `test/fixtures/golden/task_validate.agent.md`, `test/sdlc-status.test.js`), none evaluate a validator's PASS/FAIL.
- impact: Every behavioural DoD item is a claim no permitted check can falsify: with no parser and no model call, offline fixtures can only assert prompt text, not that malformed manifests actually fail. The Specification inherits an impossible falsifiability requirement, or a parser gets smuggled in against a locked constraint.
- fix: State explicitly whether verdict enforcement is mechanical (a manifest-linter script, then say so and drop "no parser") or agent-only (then reframe the DoD as prompt-content/grammar-presence assertions, not deterministic verdict fixtures).

### Self-hosting DoD requires a live model run with no falsifiable evidence path

- severity: medium
- confidence: high
- location: PV5 "Bootstrap is honest"; DoD "The portable validator validates its own implementation tasks … with every required check passing"
- defect: This DoD item can only be met by actually running the LLM validator agent, which the constraints bar from the test suite ("no paid model or network call"). As a one-time manual bootstrap its only evidence is a transcript, so the plan states an outcome with no reproducible check that fails when it is not met.
- evidence: PV5: "the freshly generated portable validator validates the task using its approved manifest"; Constraint: "Tests make no paid model or network call"; the validator is a dispatched subagent (`SKILL.md:275` "Each task ends with one validator subagent").
- impact: A DoD item that only a non-reproducible model transcript can satisfy cannot gate the PR falsifiably; "every required check passing" becomes an assertion, not an observable.
- fix: Separate the runtime self-hosting action from the DoD, and make the checkable DoD item "the generated agent golden contains the portable contract and no fixed `npx tsc`" (already listed) rather than a live self-validation.

### `standards`/`<CONTRIBUTORS_PATH>` rewrite silently overlaps programme child 1's frozen surface

- severity: medium
- confidence: high
- location: PV2 category 4 ("standards … when a governing file exists"); Scope In "Generic `validator-task.prompt.md` input/output/check contract"; Out (silent on references)
- defect: The validator prompt's standards input is hard-wired to `<CONTRIBUTORS_PATH>` — a known-broken reference the programme explicitly assigns to child 1 (`AGENTS.md`/`CONTRIBUTORS.md`-vs-`CONTRIBUTING.md`). This plan rewrites that exact input line but neither claims nor disclaims the reference fix, violating the programme rule that "No child may absorb another child's frozen surface."
- evidence: `skills/sdlc/prompts/validator-task.prompt.md:8,15,25` reference `<CONTRIBUTORS_PATH>`/"no CONTRIBUTORS"; programme plan child 1 owns "`CONTRIBUTORS.md` versus `CONTRIBUTING.md`" and "broken/assumed references"; this plan's Out list omits it.
- impact: Two child changes edit the same prompt line; whichever merges second conflicts or re-opens the other's decision, and the "standards" contract may freeze a reference name child 1 is separately correcting.
- fix: Add an explicit In/Out sentence stating whether this change renames `<CONTRIBUTORS_PATH>` to a neutral governing-file input or leaves the name for child 1, and coordinate the boundary.

### In-scope edit of the already-approved Adoption Readiness Build omits its re-approval/re-projection dependency

- severity: medium
- confidence: medium
- location: Scope In "Update the blocked Adoption Readiness Build to use the merged contract"; Risks/Dependencies
- defect: The Adoption Readiness Build plan is a human-approved canonical artifact whose tasks are projected to GitHub issues #6–#11 and whose DoD/"Build blocker" section is written against the old validator. Rewriting its task manifests is in scope, but the plan names no dependency on re-running that Build's human gate or updating its tracker projection.
- evidence: `docs/plans/2026-07-12-sdlc-adoption-readiness-build.md`: "Human gate … approved by Neil Chambers on 2026-07-12", tracker "Epic #6 … T1–T5 (#7–#11)", and a "Build blocker requiring human adjudication" section keyed to `npx tsc --noEmit`; this plan lists the update as work but its Risks omit re-approval/re-projection.
- impact: Silently editing another child's approved Build and its issue projection can bypass that child's Build human gate and desynchronise canonical doc vs tracker, exactly the projection-drift the programme guards against.
- fix: Name the dependency: state that updating the Adoption Readiness Build re-triggers its Build approval and tracker projection refresh, owned by that child.

### Frozen-heading (FS7) change defers its major-version impact without naming ADR 0012

- severity: low
- confidence: medium
- location: Constraints ("Prompt section-heading compatibility follows ADR 0007/FS7; any required heading amendment is classified before implementation"); Track header
- defect: The plan wholesale replaces the validator prompt's input/checks contract while asserting frozen headings are "preserved," and defers whether any heading must change — but a heading change is breaking for overrides (ADR 0007) and triggers a major-version decision (ADR 0012), which the plan does not name as a dependency.
- evidence: ADR 0007: "changing a required heading is a breaking change for overrides"; programme constraint: "The Specification must identify any major-version requirement rather than disguising a breaking change as additive"; plan cites ADR 0007/FS7 but not ADR 0012 versioning.
- impact: If the new manifest contract cannot fit the existing three headings, the release-impact/major-bump decision is undecided at plan time, risking a breaking override contract shipped as additive.
- fix: Add ADR 0012 release-impact classification as an explicit Specification dependency alongside the ADR 0007 heading check.

CLEAR: C — In/Out cohere around a single FS7 validator contract surface; the change is plausibly one Specification's worth (the cross-child overlaps are flagged under D and E, not decomposition).

CLEAR: F — Track is correctly declared **irreversible**; it freezes the shipped per-task gate contract in `SKILL.md`/`validator-task.prompt.md` (FS7), consistent with ADR 0007 treating heading/contract changes as breaking.
