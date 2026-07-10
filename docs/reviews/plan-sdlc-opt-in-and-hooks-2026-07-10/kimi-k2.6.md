### Arbitrary command execution risk unmentioned for `run` hooks

- severity: high
- confidence: high
- location: Objectives / Local workflow hooks
- defect: The plan introduces `run` hooks defined as "a shell command the agent executes verbatim" but names no security, sandboxing, or audit risk. A committed `sdlc.config.json` can now inject arbitrary shell commands into agent sessions.
- evidence: Plan text: "`run`: a shell command the agent executes verbatim".
- impact: Malicious or accidental commands in a repo's config will execute with the agent's privileges. No audit trail or allowlist is proposed.
- fix: Add a risk line acknowledging arbitrary execution, and require the scaffolder to warn about `run` hooks or suggest an allowlist.

### `workflow.md` "binding local law" outcome is not falsifiable

- severity: high
- confidence: high
- location: Objectives / Prose workflow layer
- defect: The objective states `.pi/sdlc/workflow.md` is "treated as binding local law: on conflict, local wins for process, global wins for gates". There is no mechanical way to distinguish "process" from "gates" in prose, no tooling to enforce it, and no falsifiable scenario can verify this outcome.
- evidence: Plan text: "Loaded at announce time and treated as binding local law: on conflict, local wins for process, global wins for gates" and "no tooling beyond 'load and obey' (agent-interpreted)".
- impact: The spec cannot write a test that fails when this objective is not met, making acceptance impossible.
- fix: Drop the "binding" claim or define mechanical, grep-able rules for what constitutes a gate vs. process override.

### Single ADR covers two distinct frozen surfaces, violating project convention

- severity: medium
- confidence: high
- location: Scope / In
- defect: docs/adr/README.md mandates "One ADR per frozen surface". The plan commits a single ADR for both the no-manifest behavior change and the hooks surface, conflating FS1 (config schema) with what it calls FS3 (actually skill policy).
- evidence: docs/adr/README.md: "One ADR per frozen surface of the sdlc skill"; plan Scope/In: "ADR committed covering the FS3 semantics change + hooks surface".
- impact: The ADR will be harder to reason about, harder to retire, and sets a precedent that undermines the ADR convention.
- fix: Split into two ADRs: one for the no-manifest policy change, one for the hooks surface.

### `use`/`do` hook semantics lack any verification path

- severity: medium
- confidence: high
- location: Objectives / Local workflow hooks
- defect: The plan describes `use`/`do` as "an instruction naming a skill/tool plus intent, interpreted by the agent". It provides no schema for valid values, no deterministic execution model, and no falsifiable acceptance scenario.
- evidence: Plan text: "`use`/`do`: an instruction naming a skill/tool plus intent, interpreted by the agent".
- impact: The spec cannot define a scenario that passes or fails for this hook kind; implementers will make incompatible interpretations.
- fix: Add a draft JSON shape and at least one concrete example to the plan, and require the spec to define how an agent maps `use`/`do` to tool calls.

### Plan mislabels no-manifest refusal as an FS3 change

- severity: medium
- confidence: high
- location: Track / Rationale / Context for the next agent
- defect: The plan states it amends FS3 with "defaults → refuse/advisory", but FS3 (ADR 0003) governs consumer-root resolution precedence, not config-read behavior. The no-manifest refusal is a skill policy / `readConfig` change, not a root-resolution change.
- evidence: ADR 0003: "resolve the consumer root independently of the skill dir, in fixed precedence... then the git top-level of \$PWD (defaults)". `skills/sdlc/scripts/lib.mjs:57` `resolveRoot` returns the git top-level; `skills/sdlc/scripts/lib.mjs:79` `readConfig` supplies defaults.
- impact: The spec writer may incorrectly modify `resolveRoot` instead of `readConfig` or SKILL.md, breaking the frozen resolution contract.
- fix: Remove the FS3 label from the no-manifest change; describe it as a skill policy / readConfig breaking change.

### DoD does not verify removal of generic worktree prescription

- severity: medium
- confidence: high
- location: Definition of done / item 7
- defect: DoD item 7 checks for "no reference anywhere to pi-worktree as a dependency", but the actual problem is a generic worktree prescription in SKILL.md ("the feature branch, in a worktree"). The DoD would pass even if SKILL.md still hard-codes worktree usage without naming the package.
- evidence: `skills/sdlc/SKILL.md:52`: "Implement | code and tests | the feature branch, in a worktree"; DoD: "README updated; no reference anywhere to pi-worktree as a dependency."
- impact: The motivating bug (agents creating but not entering worktrees because the skill prescribes them) may not be fixed even though the DoD is ticked.
- fix: Change the DoD to require verification that SKILL.md no longer prescribes worktree usage as the default mechanism.

### Missing dependency on pi prompt template packaging mechanism

- severity: medium
- confidence: medium
- location: Scope / In / setup-sdlc
- defect: The plan assumes `/setup-sdlc` can be shipped as a pi prompt template in package.json, but does not verify the mechanism exists or specify the required package.json structure. The existing package.json only shows skill discovery, not prompt templates.
- evidence: `README.md`: "pi discovers the skill via its git package metadata (`package.json`'s `\"pi\": {\"skills\": [\"./skills\"]}`)"; plan Scope/In: "/setup-sdlc (pi prompt template shipped by the package...)".
- impact: The spec may discover late that the packaging mechanism doesn't support prompt templates, forcing scope reduction or a packaging redesign.
- fix: Verify the pi prompt-template convention in package.json and add the required fields to the plan's in-scope deliverables.

### Bootstrap ordering risk unmentioned

- severity: medium
- confidence: high
- location: Scope / Out / Migration tooling; Definition of done
- defect: The plan changes no-manifest behavior from defaults to refusal, yet the repo itself currently has no manifest. The dogfood step (committing config) is listed as a DoD item, but if the refusal behavior lands before the config is committed, maintainers' local use of `ensure-panel-agent.mjs` and other scripts will break during development.
- evidence: `skills/sdlc/scripts/lib.mjs:79` `readConfig` returns defaults when absent; plan DoD: "This repo itself opted in via the scaffolder"; plan Out: "Migration tooling for existing consumers (consumer count ≈ 1)".
- impact: Developers working on this feature will hit refusal errors before the scaffolder is usable, or tests may fail in CI if the repo lacks a config.
- fix: Add an explicit ordering note: commit the dogfood config (or update test fixtures) before merging the refusal behavior, or gate the refusal on a feature flag during development.

### `run` hook determinism claim is false

- severity: low
- confidence: high
- location: Objectives / Local workflow hooks
- defect: The plan calls `run` hooks "deterministic", but shell commands depend on ambient environment (PATH, env vars, installed binaries, OS) that vary across machines and sessions.
- evidence: Plan text: "`run`: a shell command the agent executes verbatim (deterministic; e.g. a notification script)".
- impact: Consumers may assume `run` hooks behave identically everywhere, leading to "works on my machine" failures.
- fix: Remove the "deterministic" qualifier or qualify it as "agent-deterministic (same command string, environment-dependent result)".

### `*` hook composition order with named phases is undefined

- severity: low
- confidence: high
- location: Objectives / Local workflow hooks
- defect: The plan allows hooks on `*` (every phase) and on specific phase names, but does not specify whether they compose and in what order.
- evidence: Plan text: "per-phase keys from the six phase names + `*`".
- impact: The spec writer must guess or defer the decision, likely causing inconsistent implementations.
- fix: State in the plan whether `*` runs before, after, or interleaved with named-phase hooks.

### DoD item 2 uses subjective "carries" criterion

- severity: low
- confidence: high
- location: Definition of done / item 2
- defect: "SKILL.md carries: opt-in gate at announce, advisory-mode wording..." is not falsifiable without a rubric. A reviewer cannot write a check that unambiguously fails if SKILL.md does not "carry" advisory-mode wording.
- evidence: DoD text: "SKILL.md carries: opt-in gate at announce, advisory-mode wording, hook discipline..."
- impact: DoD adjudication will be opinion-based.
- fix: Replace with specific, grep-able requirements (e.g., "SKILL.md contains a section titled 'Advisory mode' with the exact text ...").

CLEAR: F — The plan correctly classifies itself as irreversible: it amends frozen surfaces (FS1 schema, FS3 policy mislabel aside) and introduces a new consumer-bound hook shape.
