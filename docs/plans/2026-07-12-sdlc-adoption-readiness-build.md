# Build plan: adoption readiness semantics

- Date: 2026-07-12
- Plan: `docs/plans/2026-07-12-sdlc-adoption-readiness.md` (approved)
- Specification: `docs/specs/2026-07-12-sdlc-adoption-readiness.md`
  (approved)
- Track: irreversible
- Canonical source: this committed Build-plan document; GitHub issues are its
  projection.
- Human gate: Build decomposition, tracker projection, checks, and DoD approved
  by Neil Chambers on 2026-07-12.
- Validator decision: route 2 approved. The portable-validator programme child
  is promoted and must complete before this Build enters Implement.
- Implementation status: blocked on portable-validator completion.

## Build-time tracker bootstrap — completed and verified

The programme prerequisite was completed before task publication:

- Board: **pi-sdlc Build Board**
- URL: <https://github.com/orgs/threadsafe-systems/projects/5>
- Project node: `PVT_kwDODSkYH84BdK7l`
- Repository link: `threadsafe-systems/pi-sdlc` (GraphQL read-back verified)
- Status field options, read back after mutation:
  `Todo`, `In Progress`, `Blocked`, `In Review`, `Done`
- Labels created and read back: `sdlc:map`, `sdlc:ticket-research`,
  `sdlc:ticket-prototype`, `sdlc:ticket-grilling`, `sdlc:ticket-task`,
  `sdlc:epic`, `sdlc:build-task`, `sdlc:hitl`, `sdlc:afk`
- `.pi/sdlc/sdlc.config.json` now records tracker repo, board number 5, and URL;
  current config validation/status exits 0.

## Tracker projection — created and verified

- Epic: [#6 — Adoption readiness semantics (FS8)](https://github.com/threadsafe-systems/pi-sdlc/issues/6)
- T1: [#7 — Non-fatal inspection primitives](https://github.com/threadsafe-systems/pi-sdlc/issues/7)
- T2: [#8 — FS8 command/state/output](https://github.com/threadsafe-systems/pi-sdlc/issues/8), blocked by #7
- T3: [#9 — Git integrity/topology](https://github.com/threadsafe-systems/pi-sdlc/issues/9), blocked by #8
- T4: [#10 — Startup policy/ADRs/migration](https://github.com/threadsafe-systems/pi-sdlc/issues/10), blocked by #8
- T5: [#11 — Integrated acceptance](https://github.com/threadsafe-systems/pi-sdlc/issues/11), blocked by #9 and #10

GraphQL read-back verifies all five native sub-issue relationships and every
`blockedBy` edge. All six board items are `Blocked` pending human Build approval
and validator adjudication.

## Definition of done

The Build is complete when:

1. FS8 exits, state precedence, exact text/JSON envelopes, and all ten check IDs
   satisfy AR1–AR9.
2. Existing FS1/FS2 acceptance, panel CLI exits/output, and `readConfig` default
   behaviour remain compatible.
3. ADR 0010 is superseded and a separate FS8 ADR freezes the machine surface.
4. Startup/migration documentation satisfies AR10–AR11 without claiming live
   agent enforcement.
5. Every scenario AR1–AR12 maps to a passing automated check with no network,
   credential inspection, or paid-model call.
6. `npm test` and `npm run lint` exit 0.
7. Every implementation task passes its named checks and the approved
   mechanistic validation policy.

## Scenario coverage matrix

| Scenario | Owning task(s) | Primary proof |
|---|---|---|
| AR1 | T2 | ready text/JSON golden in git fixture |
| AR2 | T2, T3 | HEAD-absent variants, including staged/untracked/ignored |
| AR3 | T3 | independent index/working-tree dirty variants |
| AR4 | T2, T3 | argument/root/git error fixtures |
| AR5 | T1, T2 | collector compatibility + config-error status |
| AR6 | T1, T3 | committed/clean/readable models and workflow failures |
| AR7 | T2 | dependency matrix and aggregate precedence goldens |
| AR8 | T2 | exact FS8 text/JSON/security goldens |
| AR9 | T3 | linked/detached/symlink/monorepo/submodule/sparse fixtures |
| AR10 | T4 | startup-contract mutation tests |
| AR11 | T4 | migration docs/fixture assertions |
| AR12 | T1–T5 | compatibility suite, lint, no-live-call sentinel |

Every scenario is owned; no row is deferred beyond this Build.

## Task dependency graph

```text
T1 ──→ T2 ──→ T3 ──┐
          └──→ T4 ──┼──→ T5
T1 ────────────────┘
```

- T1 establishes non-fatal inspection primitives without changing existing
  callers.
- T2 builds FS8 against those primitives.
- T3 completes adversarial git topology/integrity behaviour on the working
  status command.
- T4 may begin after T2 fixes the final command/terminology contract.
- T5 runs only after T1–T4.

## T1 — Non-fatal inspection primitives with compatibility preservation

### Outcome

The shared script library exposes non-exiting root/config/models inspection
needed by readiness while existing fatal readers/validators and panel CLIs keep
their acceptance, diagnostic, and exit contracts.

### Scope

- Add the specified `inspectRoot`, `inspectConfig`, and `inspectModels` seams.
- Preserve FS3 selection precedence in existing `resolveRoot`.
- Preserve existing validators' first-finding order and path-prefixed messages.
- Add deterministic issue ordering and non-object handling.
- Add focused offline tests; do not implement FS8 formatting/state orchestration.

### Scenarios

AR5, AR6 (validation seam), AR12 (compatibility portion).

### Checks

```bash
node --test test/readiness-lib.test.js test/extraction.test.js test/hooks.test.js
node --check skills/sdlc/scripts/lib.mjs
npm run lint
```

### Task DoD

- [ ] `inspectRoot` returns the specified success/error union and never exits.
- [ ] Existing `resolveRoot` terminal cases and FS3 precedence remain green.
- [ ] Config/models collectors return deterministic arrays, including non-object
      input, and never throw/exit for validation findings.
- [ ] Existing validators preserve acceptance, first diagnostic, and exit code.
- [ ] Existing panel generation/resolution goldens are byte/JSON compatible.
- [ ] Named checks exit 0.

### Out of scope

FS8 CLI/output, git cleanliness, documentation, ADRs.

## T2 — FS8 command, state machine, output contracts, and aggregation

### Outcome

`sdlc-status` implements the exact FS8 CLI, ten-check dependency graph,
0/1/2/3 precedence, text/JSON output, argument/root envelopes, and secret-safe
diagnostics for baseline git fixtures.

### Scope

- Full-argv JSON-mode pre-scan and `cli.arguments` handling.
- Canonical FS8 report/check structures and deterministic rendering.
- Nonfatal root/config/models integration from T1.
- Baseline committed/clean manifest and models checks.
- Dependency matrix, skips, aggregate precedence, and no-live-call sentinel.
- Rewrite current non-git status tests as explicit git fixtures.

### Scenarios

AR1, AR2 baseline, AR4 baseline, AR5 status path, AR7, AR8, AR12.

### Checks

```bash
node --test test/sdlc-status.test.js test/readiness-output.test.js
node --check skills/sdlc/scripts/sdlc-status.mjs
skills/sdlc/scripts/sdlc-status.sh --format json
npm run lint
```

### Task DoD

- [ ] Text/JSON golden reports cover exits 0–3 and all ten IDs in canonical order.
- [ ] JSON-mode argument/root failures always emit one valid envelope and no
      stderr after mode recognition.
- [ ] State precedence and every skip/run dependency match §2.8.
- [ ] Baseline HEAD/clean config+models fixture is ready; HEAD-absent variants
      are not adopted.
- [ ] Config failures are exit 2; supporting prerequisite failures are exit 3.
- [ ] Secret sentinels never appear and no network/model command can execute.
- [ ] Shell and direct-Node entry points agree.
- [ ] Named checks exit 0.

### Out of scope

Full adversarial topology matrix and documentation migration.

## T3 — Git integrity and topology matrix

### Outcome

FS8 handles index/worktree integrity and supported git topologies exactly as
specified, without false readiness or cross-worktree contamination.

### Scope

- Separate index-vs-HEAD and working-tree-vs-index checks for config and models.
- Realpath-safe symlink comparison and safe consumer-root git prefix.
- Linked worktree, detached HEAD, monorepo subdirectory, submodule boundary, and
  sparse-checkout behaviour.
- Deterministic filesystem seam for unreadable models/workflow.
- Extend status tests; do not change FS8 fields or check IDs.

### Scenarios

AR2 completion, AR3, AR4 git cases, AR6, AR9, AR12.

### Checks

```bash
node --test test/sdlc-status.test.js test/readiness-git.test.js
node --check skills/sdlc/scripts/sdlc-status.mjs
npm run lint
```

### Task DoD

- [ ] Staged, unstaged, deleted, type-changed, and cancelling/reverted manifest
      or models changes are never ready.
- [ ] Unrelated dirty files do not affect readiness.
- [ ] Linked worktrees use their own HEAD/index/worktree; detached HEAD works.
- [ ] Symlinked roots and configured monorepo subdirectories resolve safely.
- [ ] Submodule and sparse-checkout behaviour matches AR9 exactly.
- [ ] Missing/unreadable/malformed/invalid models and unreadable workflow are
      stable exit-3 checks.
- [ ] Named checks exit 0.

### Out of scope

Documentation, ADRs, new FS8 check IDs.

## T4 — Startup policy, ADRs, and migration contract

### Outcome

Shipped prose and ADRs accurately describe four-state readiness, preserve the
prose-law boundary, and give existing callers a complete migration.

### Scope

- Update `SKILL.md` startup table and pre-exit-0 prohibitions.
- Update README, setup template, wrapper usage/comments, and status examples.
- Supersede ADR 0010; add separate FS8 frozen-surface ADR.
- Add documentation mutation/presence tests and stale-terminology checks.
- Cover non-git historical exit 0/1, legacy text keys, and explicit 0/1/2/3
  caller branching.

### Scenarios

AR10, AR11, AR12 documentation portion.

### Checks

```bash
node --test test/docs.test.js test/sdlc-status.test.js
node scripts/check-commit-messages.mjs origin/main..HEAD
npm run lint
```

The commit-message check runs once commits exist; before the feature branch has
commits, its equivalent is deferred to T5 rather than treated as a false pass.

### Task DoD

- [ ] All four startup branches and prohibitions are present and mutation-tested.
- [ ] Docs never equate manifest presence with readiness or claim mechanical
      agent enforcement.
- [ ] Both required ADRs exist with context, decision, consequences, and
      compatibility treatment.
- [ ] Migration covers legacy output, exit-3 introduction, and non-git roots
      historically returning both exit 0 and exit 1.
- [ ] Wrapper help/comments match FS8 invocation.
- [ ] Named applicable checks exit 0; commit-range check is evidenced in T5 if no
      commits exist yet.

### Out of scope

Implementation code beyond wrapper/help text.

## T5 — Integrated acceptance and release compatibility

### Outcome

The complete change passes every scenario and repository quality gate without
hiding regressions or making live calls.

### Scope

- Run the entire scenario matrix and full suite.
- Verify old panel/config/models goldens were not weakened to mask regressions.
- Verify FS8 text/JSON examples against the implementation.
- Run lint, syntax checks, and commit-message checks on the feature range.
- Record scenario-to-test evidence for PR and validator handoff.

### Scenarios

AR1–AR12.

### Checks

```bash
npm test
npm run lint
node --check skills/sdlc/scripts/lib.mjs
node --check skills/sdlc/scripts/sdlc-status.mjs
node scripts/check-commit-messages.mjs origin/main..HEAD
```

### Task DoD

- [ ] Every AR1–AR12 scenario maps to a named passing test.
- [ ] All full-suite, lint, syntax, and commit-range checks exit 0.
- [ ] No live provider credential, network call, PONG, or paid model is used.
- [ ] Existing FS1/FS2 and panel goldens remain substantively unchanged.
- [ ] FS8 examples and implementation output match exactly.
- [ ] PR handoff lists scenario evidence and any residual platform risk.

### Out of scope

New product behaviour or opportunistic refactoring.

## Build blocker requiring human adjudication

The current global validator prompt unconditionally requires
`npx tsc --noEmit`. This repository has no local TypeScript compiler or
`tsconfig`, and the approved Specification explicitly does not change task
validation (programme child 3 owns portable validation). Running the mandated
command is therefore not an honest applicable check and currently cannot pass.

The human owner selected the process-safe route: promote and complete the
portable-validator programme child before this implementation. No temporary
exception was granted.

The Build does **not** add TypeScript/`tsconfig` merely to manufacture a green
check. Board tasks remain `Blocked` until the portable-validator change is
merged and this Build can use its approved applicability contract.
