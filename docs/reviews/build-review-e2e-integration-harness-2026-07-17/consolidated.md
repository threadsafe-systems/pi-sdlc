# Consolidated build-plan review — e2e integration harness (2026-07-17)

- Artifact: `docs/plans/2026-07-17-e2e-integration-harness-build.md` (rev 1)
- Panel (owner-requested advisory; owner explicitly included the author
  vendor): `openai-codex/gpt-5.6-luna:high` (→ `gpt-5.6-luna.md`),
  `anthropic/claude-sonnet-5` (→ `claude-sonnet-5.md`).
- Orchestrator: anthropic/claude; final adjudicator: owner.
- Outcome: **13 consolidated findings, all incorporated into build-plan
  rev 2.** The two vendors converged strongly; no dismissals.

## Consolidated findings and adjudication (all incorporated)

### B1 (high; sonnet#1+#2, luna#2) — project-trust mechanism was wrong AND under-specified
Verified against `settings.md:16,18,20,57`: non-interactive `-p` with the
default `defaultProjectTrust: "ask"` **ignores** project resources — so the
`-l`-installed package/skill would be silently absent and the harness could
run green without ever loading the skill. The plan called this vague
"settings-level project trust." **Fix:** sandbox construction (not a spike
discovery) sets `defaultProjectTrust: "always"` in the scratch global
`~/.pi/agent/settings.json` (or passes `--approve` on every `pi install -l`
and `pi -p`); the spike asserts trust behaviour with exact argv.

### B2 (high; sonnet#2, luna#2) — T1 overloaded; spike not a falsifiable gate
Fused harness-core code with an open-ended 4-part discovery spike under one
"T1 done", with no re-plan checkpoint if the spike falsifies a ratified
decision (Otto-gotcha precedent). **Fix:** split a gating **T0 (spike only)**
— exact argv + pass/fail assertions for local-path install+discovery, `-e`
provider registration (models+apiKey), headless `-p`, project trust, and a
per-op baseline — output SPIKE.md + explicit go/no-go against each decision;
T1 builds harness core on T0's confirmed findings.

### B3 (high; luna#1) — tracker deferral violates the publish law
Deferring epic/sub-issue/board to implement-start is not a permitted
exception; ≥2 tasks trips the publish rule (v2 default "two or more"; post-#92
`publishToTracker: 2`). **Fix:** publish the epic + sub-issues + board now
(on build-plan commit), with the whole stream marked blocked-on-#92; the
deferral is removed.

### B4 (high; luna#3) — missing mandatory PV1 manifests
Post-#92 `review.tasks: subagent` makes per-task PV1 manifests mandatory, not
conditional. **Fix:** close-out names `docs/validation/e2e-integration-harness/t*.json`
per task with exact argv + category dispositions + A–E/G scenario ownership,
and a validator receipt as an explicit DoD output per task.

### B5 (med; luna#4) — T0 timing can't set the T5 timeout
T0 measures one-L1+one-L2; T5 runs two full 6-scenario passes. **Fix:** T0
records a per-op benchmark only; T5 measures the real two-run workload and
sets the timeout via a declared headroom formula, asserting configured
timeout > measured bound.

### B6 (med; luna#5) — "PR + main / blocks merge" not achievable as stated
Existing workflow triggers only on `pull_request`; adding a job ≠ branch
protection. **Fix:** T5 adds `push: branches: [main]`; DoD narrowed to "the
`e2e` status check is emitted on PR + main"; the branch-protection
requirement is called out as a repo-admin action, not a code deliverable.

### B7 (med; luna#6) — package pin omits the lockfile CI needs
CI runs `npm ci`; adding pi to `package.json` without `package-lock.json`
breaks both jobs on the first commit. **Fix:** T0/T1 includes the lockfile
update (`npm install --package-lock-only`), checked by `npm ci`.

### B8 (med; luna#7) — isolation hardening not exercised by any check
**Fix:** a named harness guard self-test injects one var per denial class +
a glob hit + a permitted escape, probes `command -v gh`, attempts an
out-of-root write, and asserts refusal/scan failure.

### B9 (med; luna#8) — T4 dropped canonical acceptance details
A's setup/advisory offer, B's brainstorm on/off, C's refuse-to-enter-phases
were dropped from T4. **Fix:** restored to T4 rows with mechanical assertions
+ negative twins.

### B10 (med; luna#9, sonnet#3) — scenario G: ellipses + no negative twin
G used `use=…/do=…/result: ok|failed` and had no negative twin, so it can
pass by construction (hooks are prose law, no mechanical runner,
`SKILL.md:453-465`). **Fix:** pin the literal hook line contract (exact
`use`, truncated `do`, `result`, event ordering around the hook tool call +
first write) and add the negative twin (no hook configured ⇒ lines absent).

### B11 (med; luna#10, sonnet#6) — post-#92 rebase gate only rechecks T0
T2/T4 hard-code v3 field paths (`review.tasks`) and literal remedy strings
that are still in flux on the open #92 branch. **Fix:** a post-merge gate
diffs `sdlc.config.schema.json` + the exact remedy/refusal strings the
scenarios assert against the pre-rebase snapshot and fails on any touched
field/string before T2/T4 land.

### B12 (med; sonnet#4) — F (onShortfall) named L1-strength but unowned
**Fix:** explicit T2 bullet re-runs the `onShortfall` (proceed/fail)
shortfall behaviour through install-root paths.

### B13 (med/low; sonnet#5, sonnet#7) — determinism ignores parallel tool ordering; close-out lacks checks
`tool_execution_end` fires in completion order (`extensions.md`), which can
differ across runs. **Fix:** scenario-authoring constraint — normalize the
manifest's tool calls by **assistant source order** (stable per docs), or one
tool call per assistant turn; and the close-out gets its own `Checks:` line.

## Reviewer CLEARs (recorded)
Both: reversible classification correct (test-tooling only, no frozen
surface); no locked decision reopened. sonnet: all DoD items falsifiable.
luna: in/out boundary coherent.
