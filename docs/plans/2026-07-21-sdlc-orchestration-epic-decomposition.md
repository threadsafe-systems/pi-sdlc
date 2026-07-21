# Epic Decomposition: Retro-Informed Orchestration, Ceremony, & Gate Hardening

Status: plan approved 2026-07-21. This document serves as the canonical backlog
decomposition of the five approved SDLC epics (Epic A through Epic E) into 19
granular, independent, and self-contained sub-issues/tickets.

---

## Epic A: Attended Orchestration — Dynamic Authoring & Phase Handovers

**Objective:** Move past the "one long continuous session" bottleneck. Establish
clear, tool-agnostic phase handovers, session compaction boundaries, and model-steering
mechanisms that allow a human/orchestrator to dynamically route work and switch
models between gates.

### EPIC-A-T1: Phase Handover Brief Automation

- **Outcome:** The SDLC transition script automatically generates a structured
  Markdown context handoff brief at each completed phase transition.
- **Done Means:** Moving from Plan to Spec, Spec to Build, or Build to Implement
  writes a file `docs/reviews/handoff-context.md` (git-ignored) containing:
  1. The path and fingerprint of the newly approved phase document.
  2. The exact list of settled architectural decisions and accepted residuals.
  3. The exact list of open risks and scope constraints carried forward.
  4. The next-phase target requirements or task lists.
- **Background:** In Case PR #35, one continuous session did everything. A fresh
  model had no way to receive clean, pre-digested context from the prior phase,
  forcing human manual handovers.
- **Implementation Guidance:** Add a step in the phase transition CLI to write the
  brief, pulling from the newly approved markdown file's YAML header and sections.

### EPIC-A-T2: Session Compaction Tooling

- **Outcome:** A new utility command allows the orchestrator to safely archive old
  turn history and restart the session with only the active handover brief.
- **Done Means:** Executing `scripts/compact-session.sh` compiles the current
  active session transcript into a static markdown log, clears the active session,
  and seeds the new session with only the `handoff-context.md` as its starting prompt.
- **Background:** Token bloat and long-context drift in the 10-hour Case session
  prevented model steering and contributed to the sequential implementation rush.
- **Implementation Guidance:** Use `pi --print` to dump the current session's
  raw transcript, write it to a dated log under `.pi/sdlc/transcripts/`, then use the
  pi SDK's session-reset APIs to start fresh.

### EPIC-A-T3: Attended Model-Steering Command

- **Outcome:** Transitions allow specifying a different model for the next authoring
  phase, reading from a new dynamic authoring config.
- **Done Means:** The config schema supports an optional `authoring` block mapping
  each phase (brainstorm, plan, spec, build, implement) to its preferred model:

  ```json
  "authoring": {
    "plan": "anthropic/claude-fable-5:high",
    "implement": "deepseek/deepseek-v4-pro:low"
  }
  ```

  The transition CLI reads this block and launches the new compacted session using
  the specified model instead of inheriting the global `authorDefault`.
- **Background:** Currently, `panels.authorDefault` is a single global fallback for the
  entire lifecycle. There is no config-driven mechanism to use a cheaper/faster model for
  Implementation authoring while keeping Fable 5 for Plan/Spec.
- **Implementation Guidance:** Schema additions to `sdlc.config.schema.json` under a new
  `authoring` key; update the transition hooks to resolve and spawn the chosen model.

---

## Epic B: Parallel Build Supervisor & EM Task Review

**Objective:** Implement an Engineering Manager review phase over Build-plan task
decomposition, then use an async supervisor loop to dispatch and execute independent
implementation tasks in parallel where the dependency frontier allows it.

### EPIC-B-T1: Build Plan Review Phase (`build_review`)

- **Outcome:** The schema supports a new `build_review` phase to run a 1-reviewer
  sense-check on the task splits, sequencing, and parallel frontiers.
- **Done Means:**
  1. `panels.phases` allows `build_review` as a closed enum value.
  2. The `build` phase gate requires a signed-off `build-review` receipt under
     `docs/reviews/build-review-<feature>-<date>/` before Implement can begin.
  3. The review prompt (`prompts/adversary-build.prompt.md`) specifically checks
     for un-sequenced blocking tasks and verify Spec-to-Task completeness.
- **Background:** Case #35's build plan identified a parallel frontier (`cc-t1`/`cc-t2`
  independent), but execution completely ignored it. No second eyes reviewed the task
  splits, sequencing, or parallelisable seams before coding started.
- **Implementation Guidance:** Add `build_review` to `sdlc.config.schema.json` with a
  panelSize floor of 1. Write the EM sense-check prompt.

### EPIC-B-T2: Task Model Assigner ("Know Your Team")

- **Outcome:** The `build_review` agent annotates the Build plan's task manifests
  with a recommended implementer model suited to each task's technical domain.
- **Done Means:** The task-validation manifest schema includes an optional
  `recommendedModel` string. The `build_review` agent writes its recommended
  model selection into this field based on task characteristics (e.g. CLI script vs
  core algorithm).
- **Background:** Part of Neil's build review vision: the "EM" reviewer should identify
  which specialized model is best suited for each individual implementer task ahead
  of time ("know your team") rather than guessing.
- **Implementation Guidance:** Update `task-validation-manifest.schema.json` to allow
  `recommendedModel`.

### EPIC-B-T3: Parallel Task Supervisor (Build Dispatch)

- **Outcome:** An async supervisor loop reads the build plan's dependency frontier
  and dispatches parallel `subagent` runs for unblocked tasks.
- **Done Means:** A new tool/script `scripts/dispatch-tasks.sh` parses the Build
  plan's task table and `blockedBy` properties, identifies unblocked tasks, launches
  them as async `subagents` using their `recommendedModel`, and polls them concurrently,
  advancing the frontier as tasks complete.
- **Background:** Even when a parallel frontier is calculated on paper, the lack of
  an automated dispatcher means work defaults to sequential execution in a single
  thread.
- **Implementation Guidance:** Implement a task-graph parser in Node.js that reads
  the build-plan markdown table, resolves blocking edges, and uses the `subagent`
  tool's parallel and async capabilities.

### EPIC-B-T4: Falsifiable Red-Green TFD Verification

- **Outcome:** The task validator checks and requires that red (failing) test results
  existed prior to green (passing) results for every implemented task.
- **Done Means:** The task validation receipt (`receipt.json`) requires a `"redEvidence"`
  array containing the specific failing test command and output, separate from the
  final PASS report. The validator rejects completion if this evidence is missing or
  identical to the passing state.
- **Background:** 5 tasks were completed sequentially in 43 minutes in Case #35. This
  timeline is inconsistent with genuine, reflective Test-First Discipline, indicating
  tests and code were likely written together post hoc.
- **Implementation Guidance:** Extend the task receipt schema to make `redEvidence`
  mandatory on the irreversible track.

---

## Epic C: Terminal Gate Hardening & Post-Clearance Compliance

**Objective:** Plug the critical terminal gate compliance holes. Ensure no unreviewed
code merges (prevent post-clearance commits and un-reviewed ADR edits), resolve the
3-cycle incentive cliff, and enforce validator model rotation.

### EPIC-C-T1: Post-Clearance Commit Blocker

- **Outcome:** `check-lifecycle` rejects merge readiness if any commit is pushed
  to the branch after the final PR review cycle is signed off.
- **Done Means:** Running `scripts/check-lifecycle.sh` compares the git HEAD commit
  hash against the signed-off hash in `docs/reviews/pr-*/consolidated-cycle3.md`. If the
  hashes differ, it fails with a prominent compliance warning and resets readiness state.
- **Background:** Case #35 had 7 commits pushed *after* the final cycle-3 review signed
  off, changing Docker configurations, token handling, and source files — all of which
  bypassed adversarial panel review completely.
- **Implementation Guidance:** Add a git-log parse step to `check-lifecycle` that extracts
  the final cleared commit from the latest review report and asserts HEAD matches it.

### EPIC-C-T2: PR-Review 3-Cycle Cliff Mitigator

- **Outcome:** The hard 3-cycle review limit is replaced with a graceful escalation
  and narrow-diff re-review pathway.
- **Done Means:** If a PR panel reaches cycle 3 and still carries high/medium findings,
  the tool does not force an exit or a "must-pass" compromise. Instead, it generates
  a "Narrow Diff Handoff" (git diff of the un-converged files) and triggers a human
  adjudication prompt or spawns a focused, 1-model "fix verify" turn.
- **Background:** A hard 3-cycle cap creates a structural "cliff" where cycle 3 becomes
  a forced pass, incentivizing reviewers to artificially downrate late findings to
  clear the gate.
- **Implementation Guidance:** Update the PR consolidation script to support an
  `escalate` state at cycle 3 instead of a hard crash, outputting the narrow diff for
  human triage.

### EPIC-C-T3: Panel Substitute Diversity & Identification Guard

- **Outcome:** Timeout substitutions in `resolve-panel` are guaranteed to preserve
  the distinct-vendor and author-exclusion invariants.
- **Done Means:** When `resolve-panel` replaces a failed panelist mid-cycle, the
  selection algorithm explicitly verifies that the chosen substitute's `modelIdentity()`
  does not match the vendor of the author or any sibling panelist already in that round.
- **Background:** When Kimi timed out, Bedrock Opus was substituted. Across three cycles,
  Bedrock Opus reviewed the same code, creating an exposure concentration and thinning
  adversarial diversity compared to three genuinely distinct vendors.
- **Implementation Guidance:** Harden the substitution array walk in `resolve-panel.mjs`
  to dynamically pass current round participants into the exclusion set.

### EPIC-C-T4: Validator Model Rotation

- **Outcome:** Task validation enforces model rotation, dropping the single-point-of-failure
  on one validator model.
- **Done Means:** `resolve-panel task_validate` does not return the same model
  consecutively for adjacent tasks in the same build plan. If Task 1 used `haiku-4-5`,
  Task 2 is assigned the next prefer-list candidate (`deepseek-v4-flash`), ensuring
  no single-model blind spot can quietly pass an entire build.
- **Background:** In Case #35, all 5 task validations used the exact same `haiku-4-5`
  validator model. A systematic bias or parsing error in that model would have passed all
  5 tasks identically.
- **Implementation Guidance:** Update `resolve-panel` to accept an optional `--exclude`
  model flag, which the build supervisor passes using the prior task's validator.

---

## Epic D: Fail-Resilient Panel Execution & Telemetry Policy

**Objective:** Stabilize panel dispatches against timeouts (Kimi) and credit/quota
failures (Gemini). Enforce async dispatches and non-blocking per-child reaction across
all phases, and capture exact latency distributions in telemetry.

### EPIC-D-T1: Proactive Model Health & Quota Checking (`--pong` by default)

- **Outcome:** `resolve-panel` runs a fast pre-flight check on preferred models
  to detect and skip quota-exhausted or offline providers before dispatching a panel.
- **Done Means:** Executing `resolve-panel` runs the internal `pongOk()` check
  on all chosen panelists by default (non-blocking, parallel, 5s timeout). Models
  failing the ping are skipped and substituted *before* the panel is written or
  dispatched.
- **Background:** Gemini was selected for plan/spec reviews despite having depleted
  credits because `hasCreds()` only checks for key presence, not actual quota. This
  surfaced as an infra failure only *after* the panel was dispatched.
- **Implementation Guidance:** Make the `--pong` behavior the default in
  `resolve-panel.mjs`, optimized to run concurrently over the resolved candidates.

### EPIC-D-T2: Automatic Timeout-Exclusion Rule

- **Outcome:** The resolver automatically excludes a model from the prefer list
  for the remainder of a feature run if it records two consecutive timeouts.
- **Done Means:** `resolve-panel` checks the `.pi/sdlc/runs/<slug>/events.jsonl`
  manifest. If the manifest shows two consecutive `reviewer.timeout` events for
  the same model ID, that model is blacklisted and skipped during resolution.
- **Background:** Kimi-k3 timed out for 20 minutes in cycle 1, and again for 20 minutes
  in cycle 2. It cost 40 minutes of dead wallclock before being manually excluded
  by "owner direction" in cycle 3.
- **Implementation Guidance:** Add a manifest-parsing helper to `resolve-panel.mjs` to
  extract the active slug's timeout history and build a dynamic blacklist.

### EPIC-D-T3: Finer-Grained Latency Telemetry (FS13 Extension)

- **Outcome:** Telemetry records the exact start, polling-states, and end/timeout
  events per individual model in a panel.
- **Done Means:** `telemetry.mjs` supports new event types:
  1. `reviewer.dispatched`: carrying the start timestamp, task, and model ID.
  2. `reviewer.polled`: carrying elapsed time and last observed tool/activity.
  3. `reviewer.completed`: carrying elapsed time, input/output tokens, and cost.
  4. `reviewer.timeout`: carrying the exact timeout ceiling hit (e.g. 1,200,000ms).
- **Background:** Currently, the telemetry vocabulary only timestamps the batch dispatch
  and harvest. It cannot measure individual model latencies or document how long a
  stalled reviewer sat before being substituted.
- **Implementation Guidance:** Add these 4 events to `KNOWN_EVENTS` and their schemas
  to `event.schema.json`; update the async polling loop to emit them.

### EPIC-D-T4: Enforced Async & Non-Blocking Validator Hooks

- **Outcome:** Strict async dispatch and non-blocking per-child polling are enforced
  across task validation and all review dispatches.
- **Done Means:** Running a plan, spec, PR, or task validation panel forces
  `async: true` in the `subagent` call. The transition runner is forbidden from
  using blocking foreground parallel dispatches, and must poll the async ID.
- **Background:** Task validation is currently synchronous and blocking. A hung
  validator can freeze the entire implementation phase with no reactive substitution.
- **Implementation Guidance:** Audit the transitions in `SKILL.md` and references;
  assert that any parallel or validation dispatch uses the async-and-poll pattern.

---

## Epic E: Strategic SDLC Inputs & NFR Governance

**Objective:** Secure and govern early-stage SDLC inputs (Brainstorm & Plan).
Introduce plan-time non-functional checklists, technical grounding checks, and
automated post-implementation drift detection to catch NFR gaps early.

### EPIC-E-T1: Domain-Aware Plan-Time NFR & DoD Sweep

- **Outcome:** The Plan template includes a mandatory NFR & DoD checklist prompted
  during the planning phase based on the change's technical domain.
- **Done Means:** The Plan template has a section `## Non-Functional Requirements & Repo Docs`
  that must explicitly declare what changes are required for `AGENTS.md`, `README.md`,
  observability (logging/metrics), security (secret delivery), and CI/CD, or state
  `n/a` with a technical justification. The Build gate rejects blank or missing sweeps.
- **Background:** In Case #35, documentation sweeps (README/AGENTS) happened as a late
  afterthought outside the spec, and the built image lacked the `qmd` binary because
  no operational-readiness NFR was ever planned.
- **Implementation Guidance:** Add the NFR checklist section to `sdlc-plan.md` template
  and update the Spec/Build validation linters to assert coverage.

### EPIC-E-T2: Grounded Brainstorming (SDK Feasibility Check)

- **Outcome:** A fast linter during Brainstorm verifies that core design assumptions
  are technically feasible under the active SDK and config constraints.
- **Done Means:** The brainstorm recap linter checks proposed architectural vectors
  against a localized dictionary of known constraints (e.g., verifying that a project with
  `noTools` configured doesn't plan to use tools that require that visibility).
- **Background:** Case #35 approved a brainstorm design that was literally impossible
  because skills are unloadable without the builtin `read` tool (which was denied),
  forcing a mid-plan owner scope fork.
- **Implementation Guidance:** Add an SDK feasibility checking step in the brainstorm
  concluding tool to warn if conflicting configs are detected.

### EPIC-E-T3: Residual Risk & ADR Drift Detector

- **Outcome:** An automated post-implementation check verifies that the codebase does
  not violate documented ADR or residual risk constraints.
- **Done Means:** A new script `scripts/check-adr-compliance.sh` uses `ast-grep` or
  direct analysis to verify that constraints declared in active ADRs (e.g., "no secrets
  loaded from process.env") are not violated by the current working-tree code.
- **Background:** ADR 0004 accepted the `/proc/self/environ` secret exposure risk on
  the condition that production secret delivery avoids environment variables — yet the
  shipped code unconditionally loaded secrets from `process.env` anyway.
- **Implementation Guidance:** Write a compliance-check runner that maps ADR metadata
  rules to specific `ast-grep` search patterns and runs them during the PR gate.

### EPIC-E-T4: Source & Ref Validation Consolidation

- **Outcome:** Fragile, cascading validation regexes are replaced with a single,
  unified, test-hardened URL and revision parsing library.
- **Done Means:** A single, isolated ES module `lib/validation.mjs` handles all git source
  and revision parsing, explicitly resolving the WHATWG-normalization, Option-injection,
  and Tag-ancestry vulnerabilities.
- **Background:** Every single one of the 3 PR cycles in Case #35 found a new minor gap
  in git ref/source validation (git injection → tag ancestry → WHATWG divergence → malformed https),
  indicating piecemeal fixes rather than a robust, consolidated threat model.
- **Implementation Guidance:** Consolidate the parser and write an extensive, adversarial
  test suite containing over 50 malformed, hostile, and option-injected inputs.
