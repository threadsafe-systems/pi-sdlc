### 1. Tracker deferral contradicts the governing publish rule

- severity: high
- confidence: high
- location: Build plan lines 10–13, 104–111
- defect: The build plan explicitly defers publishing the epic, five task issues, and board until implementation starts, but the governing SKILL requires a tracker-backed build as soon as its task count reaches the committed `shape.publishToTracker` threshold. The post-#92 committed config sets that threshold to `2`, so this five-task build cannot be treated as an untracked blocked plan.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness-build.md:10-13,104-111`; `skills/sdlc/SKILL.md:211-218`; post-#92 `.pi/sdlc/sdlc.config.json:37-40` (`"publishToTracker": 2`)
- impact: The stream starts with no resumable board frontier and violates the project law before implementation begins; the stated “at implement-start” exception is not a permitted exception under the merged config.
- fix: Publish the epic, five native sub-issues, blocking edges, and board projection when this build plan is committed, or explicitly change the governing `shape.publishToTracker` decision before approving this plan.

### 2. T1’s spike is an exploratory note, not a falsifiable gate for the load-bearing unknowns

- severity: high
- confidence: high
- location: T1 work/checks, lines 40–49
- defect: T1 names local install, `-e`, `-p`, trust, and timing probes but supplies neither exact argv nor pass/fail assertions for them; its only check is that “spike commands” are recorded in `SPIKE.md`. In particular, “settings-level project trust” is not a concrete pi mechanism: headless trust is controlled by global `defaultProjectTrust` or per-run `--approve`, not a project setting.
- evidence: Build plan `:40-49`; pi `docs/settings.md:14-20` says non-interactive modes use global `defaultProjectTrust` and support `--approve`; pi `docs/packages.md:43-45` says project installs depend on the project being trusted; custom-provider requirements are explicit at `docs/custom-provider.md:95-116`.
- impact: T1 can be marked passed after documenting a command that silently ignores `.pi/settings.json`, fails to load the staged package, or registers no selectable model, leaving T2/T4 unbuildable while the dependency gate appears satisfied.
- fix: Make T1 execute a committed spike/self-test with exact `pi install --approve` and `pi -p --approve` (or an explicit global settings fixture), and assert staged discovery, `pi --list-models`/provider selection, request receipt, tool-loop completion, and expected trust behavior with nonzero failure exits.

### 3. The build omits the mandatory PV1 manifests and exact validator mapping

- severity: high
- confidence: high
- location: Cross-cutting close-out, lines 104–111; all task Checks sections
- defect: The plan only says PV1 manifests may be added “where ... required at implement time” and never assigns one per T1–T5, names the validation home/task IDs, or maps owned scenarios to checks. After #92, `review.tasks` is `subagent`, which makes these five implementation manifests mandatory, not conditional.
- evidence: Build plan `:109-111`; governing `skills/sdlc/SKILL.md:321-340` requires every implementation task’s committed manifest, exact argv arrays, five categories, scenario mapping, and validator receipt; post-#92 `.pi/sdlc/sdlc.config.json:29-35` sets `"tasks": "subagent"`.
- impact: Implementers cannot produce the required deterministic task receipts from this build, and checks such as `node --check`/`npx biome check` are currently incomplete argv rather than executable PV1 declarations.
- fix: Add `docs/validation/e2e-integration-harness/t1.json` through `t5.json` (or the repository’s canonical equivalent), with exact argv, category dispositions, and A–E/G scenario ownership, and make each task’s validator receipt an explicit DoD output.

### 4. The T1 timing sample cannot set the timeout for the T5 workload

- severity: medium
- confidence: high
- location: T1 lines 43–45 and T5 lines 96–102
- defect: T1 measures only “one-L1 + one-L2-skeleton” and then is said to set the CI timeout, while T5 runs two complete fresh-sandbox executions containing six L2 scenarios, negative controls, staging, and manifest comparison. No multiplier, per-scenario allowance, or timeout formula is specified, and T1 cannot edit the workflow because `.github/workflows/*.yml` is assigned only to T5.
- evidence: Build plan `:43-45` versus `:96-102`; stream DoD requires all six scenarios plus negative control and two runs at `:17-21`.
- impact: A T1 “baseline-derived” timeout can be too short by construction, making the eventual CI job flaky or permanently red despite a passing spike.
- fix: Have T1 record a reproducible per-operation benchmark only, then have T5 measure two complete runs and set a declared formula with explicit headroom (and assert the configured timeout exceeds that measured bound).

### 5. T5 does not make “PR and main” or “blocks merge” achievable

- severity: medium
- confidence: high
- location: T5 lines 92–102 and DoD line 173–174
- defect: The only existing workflow triggers on `pull_request` and has no `push` trigger for `main`, while the task merely says “job on PR + main”; adding a job does not make it a required branch-protection check either. No task changes or verifies either the event trigger or repository merge-protection setting.
- evidence: Existing `.github/workflows/ci.yml:3-5` has only `pull_request`; build plan `:96-100` and DoD `:173-174` require PR/main execution and merge blocking.
- impact: The declared main-branch and merge-gate DoD can remain false even with a green e2e job on a PR, and the plan has no falsifiable repository-level check for it.
- fix: Specify the workflow `push: branches: [main]` trigger and an explicit branch-protection verification (or narrow the DoD to the status check being emitted rather than claiming it blocks merges).

### 6. T1’s package pin omits the lockfile required by this repository’s CI

- severity: medium
- confidence: high
- location: T1 Files, lines 28–30
- defect: T1 assigns the exact pi `devDependency` to `package.json` but omits `package-lock.json`, although the governing CI runs `npm ci`. The current lockfile has no pi dependency entry, so the planned package change without a lockfile update is not installable in CI.
- evidence: Build plan `:28-30`; current `package.json:27-38` has no pi dependency; current `.github/workflows/ci.yml:21-25` runs `npm ci`; `package-lock.json` root dependencies currently contain no pi entry.
- impact: The first implementation commit that follows the task literally makes both the existing unit job and the new e2e job fail at dependency installation.
- fix: Include `package-lock.json` in T1 and require `npm install --package-lock-only`/`npm ci` (with the exact resulting lockfile) in T1’s checks.

### 7. Isolation hardening is assigned in prose but not exercised by any T1 check

- severity: medium
- confidence: high
- location: T1 lines 31–49; DoD 3
- defect: T1 describes the denial list and teardown scan, but its checks run only syntax, Biome, and unspecified spike commands; it does not test representative denied variables, glob catch-alls, the allow escape hatch, `gh` absence, or an out-of-root write. The task also never explicitly assigns construction of a PATH without `gh`; T4’s logging stub is only for scenario E.
- evidence: Build plan `:31-49`; source plan’s required observed guards and named credential list at `docs/plans/2026-07-17-e2e-integration-harness.md:58-70`; DoD `:161-165`.
- impact: A harness can pass T1 while leaking ambient `gh`, accepting a credential variable, or failing to detect writes, invalidating the isolation DoD and making scenario E’s stub behavior non-representative.
- fix: Add a named T1 guard self-test that injects one value from every denial class plus a glob hit and permitted escape, probes `command -v gh`, attempts an outside write, and asserts refusal/scan failures; explicitly make T4’s `gh` stub an isolated override.

### 8. T4 drops canonical acceptance details from scenarios A, B, and C

- severity: medium
- confidence: high
- location: T4 work, lines 80–90
- defect: The build task summary reduces A to “announce absent,” B to the solo/full design-gate delta, and C to “v2 → not-ready”/no migration, but the canonical plan also requires A’s setup/advisory offer, B’s Brainstorm on/off effect, and C’s refusal to enter phases. None of those omitted outcomes appears in T4’s checks or DoD mapping.
- evidence: Build plan `:81-90`; canonical plan `docs/plans/2026-07-17-e2e-integration-harness.md:115-127`.
- impact: T4 can be declared complete while the v3 behavior net does not cover those acceptance criteria, and the per-task scenario mapping cannot show evidence for them.
- fix: Expand T4’s scenario rows and negative twins with mechanical assertions for A setup/advisory, B brainstorm gate on/off, and C no phase/tool effects, and assign each to explicit checks.

### 9. Scenario G still has parameterized ellipses instead of an exact assertion contract

- severity: medium
- confidence: high
- location: T4 lines 86–88; source plan lines 131–134
- defect: G is described as asserting exact hook lines, but the task and source plan still use `use=…`, `do=…`, and `result: ok|failed`; they do not pin the literal hook identity, first-80-character `do` value, expected result, or event sequence. The task check is only the broad full e2e command.
- evidence: Build plan `:86-90`; source plan `:131-134`; the governing hook law defines concrete emitted forms and ordering at `skills/sdlc/SKILL.md:453-465`.
- impact: An implementation can assert only prefixes or the wrong hook payload/result and still claim the “exact” G marker, so the ordering and configured-hook contract are not falsifiable.
- fix: Put a concrete hook fixture and expected JSONL/transcript sequence in T4, including literal `use`/`do` (truncated per law), `result`, hook-tool event, and first-write event, with negative twins for each ordering violation.

### 10. The post-#92 rebase gate rechecks only T1, not the v3-dependent task matrix

- severity: medium
- confidence: medium
- location: Sequencing lines 7–9 and close-out lines 104–107
- defect: The plan branches from pre-#92 and requires only the T1 spike to be re-verified after rebasing, even though T2 and T4 encode #92’s v3 semantics and exact behavior. There is no post-merge compatibility gate to compare the final #92 surfaces/ICA behavior against the L1 fixtures and A–E/G scenarios before dependent tasks are implemented.
- evidence: Build plan `:7-9,84-88,104-107`; the referenced v3 spec makes the clean-break/refusal and setup semantics normative at the #92 branch’s `docs/specs/2026-07-17-config-intent-vocabulary.md:287-319,329-345`.
- impact: A final #92 review fix or rebase conflict can invalidate scenario fixtures, messages, or setup shapes after T1 passes, causing avoidable churn or silently stale coverage in T2/T4.
- fix: Add a post-#92 merge gate before T2/T3/T4 that records the merged SHA, runs the relevant ICA checks, and requires an explicit plan/scenario reconciliation before dependent implementation starts.

CLEAR: C — the in/out boundaries and reversible tooling classification are coherent; no decomposition contradiction was verified.
CLEAR: F — the plan remains test tooling/fixtures only and does not freeze a production contract, schema, or wire shape.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Produced the requested read-only adversarial BUILD-PLAN review at the authoritative output path without modifying the repository worktree."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read both e2e plan documents and consolidated advisory review",
      "result": "passed",
      "summary": "Reviewed top to bottom."
    },
    {
      "command": "inspect pi docs, governing SKILL.md, existing workflow, package manifests, and #92 branch surfaces",
      "result": "passed",
      "summary": "Verified cited framework and repository evidence."
    }
  ],
  "validationOutput": [
    "Findings written to the required authoritative output path."
  ],
  "residualRisks": [
    "Review is advisory and no implementation files were changed."
  ],
  "noStagedFiles": true,
  "diffSummary": "No repository diff; review artifact only.",
  "reviewFindings": [
    "10 findings recorded, ranked by severity."
  ],
  "manualNotes": "The worktree was treated as read-only; findings are grounded in the pre-#92 checkout, governing SKILL, post-#92 surfaces, and pi documentation."
}
```
