### §5's in-harness panel recipe cannot enforce the new timeout contract

- severity: high
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 113-123, 152-173
- problem: §5 requires every reviewer dispatch to pass an explicit 45/90-minute `timeoutMs`, but its only in-harness recipe emits and invokes `subagent({ tasks: [...], async: true })` without any timeout. The currently installed pi-subagents public API rejects top-level `tasks` as removed legacy orchestration (and registers `bg_wait`, not the documented `wait`), while the detached `dispatch.sh` path exposes no timeout option either.
- repro_or_impact: Following the documented `--emit-tasks` flow produces a legacy `tasks` payload with no budget; the public tool rejects that shape before starting reviewers, and even a legacy-compatible tool would silently retain its default because no `timeoutMs` is supplied. The new budget and recovery policy therefore cannot be dogfooded or followed by either dispatch path.

### The documented resolver commands omit the required track argument

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 85-89, 111-114
- problem: Both resolver examples omit `--track`, although this repository's committed config has a `reversible` per-track override and `resolve-panel.mjs` refuses to run whenever overrides exist without an explicit track.
- repro_or_impact: Running the documented command (for example, `resolve-panel.sh pr_review --author anthropic/claude-fable-5-1`) exits before model resolution with `this config has per-track overrides — pass --track irreversible|reversible`; every panel phase is therefore blocked unless the operator invents the missing argument.

### The build deliberately skips a mandatory tracker projection on a false assumption

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 150-163
- problem: The build has two tasks and `shape.publishToTracker` is 2, so the governing Build contract requires an epic and one native `build-task` sub-issue per task. A4 waives that requirement on the claim that #268 and #270 are already labelled and on the shared board, but those live issues currently have no labels and no item in project 5.
- repro_or_impact: `gh issue view 268/270` reports `labels: []`, and `gh project item-list 5 --owner threadsafe-systems` contains neither issue. Implement has no epic frontier, native sub-issue/parent edges, or board lifecycle to work, while the PR merely closes two generic issues and cannot satisfy the projection contract described at `skills/sdlc/references/phase-tasks.md:156-179`.

### The route-twin “never appears” claim is false when the direct route is unavailable

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene.md
- line: 43-48
- problem: `resolve-panel` only adds an identity to `seenModels` after the candidate has credentials/PONG success. If `anthropic/claude-opus-5` is uncredentialed but AWS credentials are present, it is dropped and `amazon-bedrock/eu.anthropic.claude-opus-5` is accepted into the resolved panel, contrary to the plan's unconditional claim that a Bedrock entry is never an independent panelist.
- repro_or_impact: With a temporary auth file containing no Anthropic credential and dummy AWS credentials, the resolver emits `amazon-bedrock/eu.anthropic.claude-opus-5:xhigh` as a panel member. Operators following the route-twin-as-replacement-only prose can misread panel composition and count the same logical model as an ordinary seat in this valid credential configuration.

### The roster’s “no entry changed position” assertion is factually wrong

- severity: low
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46
- problem: `pr_review` inserts `anthropic/claude-opus-5` before the existing Bedrock entry, shifting Bedrock and every later candidate one index to the right; the changed `$comment` nevertheless says “No entry changed position,” matching the Plan/DoD assertion.
- repro_or_impact: The committed arrays show Bedrock moving from index 4 to 5 and deepseek/Zai/Gemini/Kimi moving from indices 5–8 to 6–9. Because resolver selection follows `prefer` order, this changes fallback order and makes the stated ordering-preservation assumption impossible to audit.

### The expanded roster comment is process archaeology rather than a durable invariant

- severity: low
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46
- problem: The changed `$comment` embeds redesign dates, owner direction, ticket/retro diagnoses, a dated live probe, supersession guidance, and references to transient evidence instead of only the present roster rationale; it also says future model data should be re-checked while being generated into a checked-in companion.
- repro_or_impact: Those operational and benchmark claims can become stale without the config changing, and the generated `.pi/sdlc/CONFIG.md` republishes the same giant comment. A future maintainer can therefore make roster decisions from obsolete process history even though the build plan explicitly says ticket archaeology belongs in the Plan, not the config.
