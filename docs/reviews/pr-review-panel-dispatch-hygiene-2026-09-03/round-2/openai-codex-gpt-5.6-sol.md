### Implement doctrine requires a removed `turnBudget` parameter

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-implement.md
- line: 237-242
- problem: The revised text calls `turnBudget: { maxTurns, graceTurns }` a current `subagent` parameter and requires it on worker dispatches, but pi-subagents 0.65.1 removed assistant turn budgets and its current tool schema has no `turnBudget` field.
- repro_or_impact: Following this required shape either fails schema validation or silently supplies an unenforced field, so the promised turn nudge/finalization control does not exist. The installed package's changelog explicitly records “Remove assistant turn budgets,” and only `toolBudget`/`timeoutMs` remain in the launch schema.
- suggested_fix: Remove `turnBudget` from the contract and describe only current controls (`toolBudget`, `timeoutMs`, and any supported usage budget), or pin and test a pi-subagents version that actually provides the claimed parameter.

### The phase reference still advertises roster entries this delta removed

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-implement.md
- line: 201-204
- problem: The caller-facing “Under your configuration” block still says `task_validate` prefers `deepseek/deepseek-v4-flash` and undated `anthropic/claude-haiku-4-5`, while the new config contains neither and now orders dated Haiku, its Bedrock twin, GLM Flash, then GLM.
- repro_or_impact: A reader following the phase reference can dispatch the exact dead/identity-mismatched entries this roster fix removes. This is already stale in the committed blob even though generated `CONFIG.md` is current.
- suggested_fix: Remove the hard-coded roster from the phase reference and make effective `CONFIG.md` authoritative, or update it atomically with the manifest and add a consistency test.

### The configured lead still fails the required child-dispatch probe

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-05)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene.md
- line: 186-191
- problem: The strengthened DoD requires every configured id to answer as a subagent child, but `anthropic/claude-fable-5-1` remains `authorDefault` and the lead of every review pool despite the committed round-1 record showing that exact child launch fails on Claude Code 2.1.75.
- repro_or_impact: `docs/reviews/pr-review-panel-dispatch-hygiene-2026-09-03/consolidated.md:13-20` records the failure, and round 2 had to bypass the same configured lead. Thus the build plan's “all satisfied” claim is false and each affected panel still pays the wasted dispatch this PR exists to eliminate.
- suggested_fix: Land the child-runtime/extension fix before claiming this DoD, or remove/demote `fable-5-1` from this repo's effective child roster and record the external limitation as a residual risk until issue #275 is resolved.

### The detached recipe cannot impose the bound it requires

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-07)
- file: skills/sdlc/references/phase-pr-review.md
- line: 150-153
- problem: “Wrap each child” is not an actionable operation with the prescribed `dispatch.sh`: that helper internally starts each `pi` under a new `setsid` session and exposes no timeout or child-command hook.
- repro_or_impact: Wrapping the `dispatch.sh` invocation in an OS timeout only kills the short-lived launcher; its detached process groups continue running without a bound. A stalled headless reviewer can therefore outlive both its attempt budget and the claimed whole-gate ceiling.
- suggested_fix: Add a tested `--timeout-ms`/deadline option to `dispatch.sh` that places the limiter inside each `setsid bash -c` command, or document an exact replacement launch command that does so and an exact cancellation/harvest procedure.

### The 4× ceiling does not bound already-running attempts

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-02)
- file: skills/sdlc/references/phase-pr-review.md
- line: 235-241
- problem: At the cap the new rule says only to “stop dispatching”; it neither caps each newly launched retry/replacement to the gate's remaining time nor stops attempts already running when the cap arrives.
- repro_or_impact: After a 45-minute opening and 90-minute retry, a replacement launched near minute 135 may receive another 90-minute `timeoutMs`. At minute 180 the prose forbids new dispatches but leaves that child running until about minute 225, so model spend continues beyond the advertised 4× hard ceiling and may write late output after harvest.
- suggested_fix: Define one absolute gate deadline at opening, pass `min(requestedAttemptBudget, deadline-now)` to every later call, and explicitly stop all outstanding run ids before harvesting when the deadline is reached; state whether the unit is elapsed wall time or aggregate reviewer time.

### No-output is not sufficient evidence of a provider stall

- severity: medium
- confidence: medium
- origin: REOPENED(PR-R1-06)
- file: skills/sdlc/references/phase-pr-review.md
- line: 229-233
- problem: The fix turns every zero-output timeout into a provider-side failure, although a healthy reviewer can consume the deadline while reasoning or using tools before it emits final prose. The same observable state therefore represents both provider stall and genuine budget exhaustion.
- repro_or_impact: Such a reviewer is routed to a twin/replacement instead of receiving the sanctioned raised-budget retry, discarding completed investigation and changing panel composition. With no usable twin (the configured Fable lead is the known example), the recovery ladder has no reliable basis for choosing the provider branch.
- suggested_fix: Require provider/transport evidence or absence of all child activity (assistant events, token progress, and tool calls), not merely absent final output; ambiguous timeouts should take the bounded raised-budget path or escalate rather than be asserted to be provider-side.

### The incorporated calibration correction left two false 70-file claims

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-04)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene.md
- line: 60-62
- problem: The Plan's baseline evidence still says PR #261 had 70 changed files and lost both surviving reviewers, and the Build task repeats “70 files” at lines 86-87, while the corrected A2 and §5 say 55 files, two of three timeouts, and one credential failure.
- repro_or_impact: The governing documents now contradict each other about the only observation offered for the 90-minute figure, so the commit's claim that this falsified assertion was corrected is only partial and future calibration can be based on the wrong sample.
- suggested_fix: Replace every remaining 70/all-reviewers occurrence with the verified 55-file, two-timeout/one-credential-failure record and keep the untested 45-minute floor and size trigger clearly separate.

### The Build plan still claims index stability after incorporating its falsification

- severity: low
- confidence: high
- origin: REOPENED(PR-R1-11)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 47-60, 72-73
- problem: Although the Plan now honestly distinguishes relative order from index stability, T1 still promises no entry moves position and its DoD says pool ordering is “provably unchanged.” The committed config inserts/removes candidates and shifts later indexes.
- repro_or_impact: The canonical implementation contract contradicts both the actual manifest and the corrected Plan, leaving PR-R1-11 only partially incorporated.
- suggested_fix: Mirror the Plan's precise invariant in T1: preserve relative order of surviving entries while explicitly naming insertions, deletions, and resulting index shifts.

### The retargeted test does not guard the corrected dispatch recipe

- severity: low
- confidence: high
- origin: NEW
- file: test/reference-contract.test.js
- line: 32-34
- problem: The new checks search the entire document independently for `runs.all([` and `timeoutMs`; they do not assert that the fenced dispatch call combines `async: true`, top-level `timeoutMs`, `workflowScript`, and awaited `runs.all`, or that removed legacy fields stay absent.
- repro_or_impact: Delete the entire JavaScript recipe at `phase-pr-review.md:124-138`: all three changed assertions still pass because “exact review task” remains above it, `runs.all` remains in recovery prose, and `timeoutMs` appears elsewhere. The high-severity API regression from PR-R1-01 can therefore return under a green suite.
- suggested_fix: Extract the fenced JavaScript example and validate it structurally (preferably through pi-subagents' offline workflow validator), while asserting `async: true`, the top-level timeout, awaited `runs.all`, and absence of legacy `tasks`/`wait` payloads in that same snippet.

### The corrected Build prose embeds stale review history and live tracker state

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 144-175
- problem: New prose narrates an “earlier revision,” an “original form,” and an escalation, then states current issue-label/project membership. Those are review/process history and external facts that can become false without this file changing.
- repro_or_impact: A later label or board edit silently invalidates the governing Build plan, while the historical correction duplicates material that already belongs in `consolidated.md`.
- suggested_fix: State only the durable present contract and proportionality rationale in the Build plan; keep review-round provenance and point-in-time tracker evidence in the consolidated review record.

VERDICT: REVISE
