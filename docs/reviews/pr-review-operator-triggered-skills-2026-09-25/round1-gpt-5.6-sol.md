### Git failures can silently bypass an adopted repository

- severity: high
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 39-43
- problem: The new branch assumes every `git.repository` or `root.resolve` error proves there is no repository, but `sdlc-status.mjs:51-53,151-167` uses `git.repository` for Git spawn failures, nonzero Git exits, and realpath failures too.
- repro_or_impact: In this adopted repository, running the status script with an absolute Node path and a `PATH` containing no Git returns exit 2 with `git.repository:error`; the new law then silently continues outside the lifecycle instead of stopping on this non-“no repo” error.

### Standalone `/sdlc-*` commands still halt in non-git directories

- severity: high
- confidence: high
- origin: NEW
- file: templates/sdlc-brainstorm.md
- line: 16-23
- problem: All six standalone templates still mandate stopping and surfacing diagnostics for every exit 2, contradicting the new `root.resolve`/`git.repository` exception in `skills/sdlc/SKILL.md:39-43`.
- repro_or_impact: Invoke `/sdlc-brainstorm` from a fresh non-git directory: its prescribed status command returns exit 2 with `git.repository:error`, after which the template halts and surfaces an adoption remediation. The same stale contract exists in the plan, spec, tasks, implement, and PR-review templates.

### ADR amendment metadata omits the exit-2 policy change

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 5-24
- problem: The ADR says it amends only ADR 0015’s exit-1 branch, while its Decision also changes selected exit-2 handling. Correspondingly, `docs/adr/0015-adoption-readiness-policy.md:20-23` still states that all exit-2 cases stop.
- repro_or_impact: A reader using the ADR amendment metadata encounters contradictory current policy and can preserve the obsolete blanket exit-2 stop rule.

### Build plan overstates mutation coverage

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills-build.md
- line: 56-62
- problem: The plan claims every focused-test assertion is checked against a reverted fixture, but the `disable-model-invocation` assertion at `test/operator-triggered-skills.test.js:63-65` has no mutated fixture.
- repro_or_impact: The committed validation description promises stronger non-vacuity evidence than the test provides, misleading future reviewers assessing this policy guard.