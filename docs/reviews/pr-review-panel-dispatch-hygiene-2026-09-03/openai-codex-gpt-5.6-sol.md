### Detached dispatch remains without a time bound

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 129-130, 166-173
- problem: The supported detached path is described only as `dispatch.sh` with `--model` flags, while the new rule requires the in-harness field `timeoutMs` without defining any detached equivalent.
- repro_or_impact: A headless/CI session following §5 cannot construct a compliant bounded dispatch from the shipped contract, contradicting `.pi/sdlc/workflow.md:5-9,18-22`.

### Timeout does not identify a deterministic failure

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 190-205
- problem: The policy classifies every run-level timeout as deterministic, although provider or transport stalls can also consume the deadline (`skills/sdlc/references/system-reference.md:353-362`). It therefore mandates doubling the same route before the provider-route recovery immediately below.
- repro_or_impact: A provider that hangs until timeout is given another 90 or 180 minutes on the same route before its twin is tried, increasing delay and cost without distinguishing workload exhaustion from transient infrastructure failure.

### Recovery has no whole-gate time or cost ceiling

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 166-198
- problem: The new figures are minimum per-attempt timeouts, while recovery retries every timed-out model at double budget and continues through the entire pool; no aggregate wave ceiling or cost bound is stated. Consumer pools are themselves unbounded because `prefer` has no `maxItems` (`skills/sdlc/schema/sdlc.config.schema.json:200-205`).
- repro_or_impact: With this repository’s eight distinct PR-review identities, a large-diff failure can consume up to 8 × (90 + 180) = 2,160 model-minutes before shortfall handling, contrary to `.pi/sdlc/workflow.md:18-22`.

### Route twins can appear in the resolved panel

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 200-205
- problem: The categorical claim that a twin “never appears” is false: `resolve-panel` checks credentials before deduplication and only skips an identity already selected (`skills/sdlc/scripts/resolve-panel.mjs:214-235`).
- repro_or_impact: Running with AWS, DeepSeek, and Zai credentials but no Anthropic credentials resolves `amazon-bedrock/eu.anthropic.claude-opus-5` alongside DeepSeek and Zai and exits successfully. Sessions may therefore encounter the alleged recovery-only twin as an original panelist.

### The stated budget calibration misreports its sole observation

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 166-173
- problem: The cited panel did not have all reviewers time out at 30 minutes: only Sol and Luna timed out, while Opus failed immediately with `AccessDeniedException` and was replaced by DeepSeek (`docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/consolidated.md:12-20`). Its reviewed target was also 55 changed files, not the final PR’s 70 (`docs/reviews/pr-review-plan-artifact-skeleton-2026-08-15/round1-deepseek-v4-pro.md:25`).
- repro_or_impact: The shipped 45/90-minute doctrine presents final-PR size and a mixed failure/replacement wave as one clean timeout calibration, giving future maintainers false evidence for its thresholds.

### Task validation and the Implement carry are not discharged

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 43-124
- problem: With `review.tasks: subagent` (`.pi/sdlc/sdlc.config.json:33`), neither T1 nor T2 has the committed PV1 manifest or task-validation receipt required by `skills/sdlc/references/phase-implement.md:136-139,195-199`. The formal `CARRY-TO-IMPLEMENT` at line 124 still points to a later PR-panel review rather than recording an Implement commit/task/test discharge as required by `phase-implement.md:97-101`.
- repro_or_impact: `git ls-tree -r --name-only ecd0cf44... | grep panel-dispatch-hygiene` finds only the two plan documents. Task completion evidence and the PR gate’s no-orphan checkpoint are therefore unsatisfied.

### A4 overrides the configured tracker threshold without authority

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 150-163
- problem: The build has two tasks and the configured threshold is two (`.pi/sdlc/sdlc.config.json:39`), yet A4 deliberately omits the required epic and native task sub-issues. Existing standalone issues do not satisfy the tracker shape required by `skills/sdlc/references/phase-tasks.md:156-165`.
- repro_or_impact: The branch lacks the tracker projection and epic/task references required for an at-threshold Build and its PR body (`skills/sdlc/references/phase-pr-review.md:41-47`).

### “Only ids moved” is false for the PR pool

- severity: low
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46, 63-68
- problem: The comment says no entry changed position and only ids moved, but inserting the direct Opus entry shifts DeepSeek, Zai, Gemini, and Kimi from positions 5–8 to 6–9.
- repro_or_impact: The committed prose and Plan DoD (`docs/plans/2026-09-03-panel-dispatch-hygiene.md:199-200`) misstate the actual array change, obscuring that the pool gained a candidate rather than undergoing only identifier substitutions.

- **Verdict: REVISE**