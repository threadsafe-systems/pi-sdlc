# Build plan: portable per-task validator

- Date: 2026-07-12
- Plan: `docs/plans/2026-07-12-sdlc-portable-validator.md` (approved)
- Specification: `docs/specs/2026-07-12-sdlc-portable-validator.md`
  (approved)
- Track: irreversible
- Canonical source: this Build-plan document; manifests and GitHub issues are
  mechanically executable/tracker projections.
- Board: [pi-sdlc Build Board](https://github.com/orgs/threadsafe-systems/projects/5)
- Human gate: pending review. Implementation must not begin until approved.

## Build strategy

The old validator cannot honestly validate a preliminary “runner-only” task
because it still mandates TypeScript. Therefore T1 is an intentional atomic
cut-over: it delivers PV1 schema, PV2 runner, generic prompt/SKILL law, tests,
and receipt verification together. At T1 end, the new worktree contract exists;
the generated portable validator validates T1 using `pv-t1.json` and stores the
runtime receipt. There is no temporary exception.

T2 completes compatibility, ADRs, override migration, and documentation after
the cut-over is proven. T3 is integrated acceptance and PR handoff.

## Tracker projection — created and verified

- Epic: [#12 — Portable per-task validator (PV1/PV2)](https://github.com/threadsafe-systems/pi-sdlc/issues/12)
- T1: [#13 — Atomic cut-over and self-hosted gate](https://github.com/threadsafe-systems/pi-sdlc/issues/13)
- T2: [#14 — Compatibility, ADRs, migration, sibling handoff](https://github.com/threadsafe-systems/pi-sdlc/issues/14), blocked by #13
- T3: [#15 — Integrated acceptance and PR handoff](https://github.com/threadsafe-systems/pi-sdlc/issues/15), blocked by #14

Native sub-issue and `blockedBy` relationships were created. All four project
items are `Blocked` pending human Build approval.

## Definition of done

1. PV1 manifest schema and PV2 runner/output/exit surfaces satisfy PV1–PV9.
2. Generic validator prompt and `SKILL.md` satisfy PV10 with FS7 headings and
   panel resolution unchanged.
3. T1 self-hosting receipt satisfies PV11 without claiming model determinism.
4. Adoption Readiness remains Blocked through this PR, satisfying PV12.
5. Full regression/no-live-test-call gates satisfy PV13.
6. Every task manifest passes the deterministic runner; every task ends with a
   portable validator receipt whose required checks pass.
7. `npm test` and `npm run lint` exit 0.

## Scenario coverage matrix

| Scenario | Owning task(s) | Primary proof |
|---|---|---|
| PV1 | T1 | JavaScript manifest execution fixture |
| PV2 | T1 | TypeScript/non-Node command-isolation fixtures |
| PV3 | T1 | schema/cross-field mutation matrix |
| PV4 | T1 | exit/missing/signal/timeout/continue fixtures |
| PV5 | T1 | category applicability mutations |
| PV6 | T1 | scenario mapping verdict fixtures |
| PV7 | T1 | standards/banned-pattern command fixtures |
| PV8 | T1 | truncation/redaction/invalid-UTF8 fixtures |
| PV9 | T1 | exact text/JSON/report-write goldens |
| PV10 | T1, T2 | generated-agent/SKILL/golden and migration tests |
| PV11 | T1, T3 | runtime receipt plus offline hash mutation tests |
| PV12 | T2, T3 | board status and re-approval contract evidence |
| PV13 | T1–T3 | full suite/lint/no-live-call sentinel |

No Specification scenario is unowned.

## Dependency graph

```text
T1 atomic cut-over → T2 compatibility/docs → T3 integrated acceptance
```

## Validation manifests

- `docs/validation/portable-validator/pv-t1.json`
- `docs/validation/portable-validator/pv-t2.json`
- `docs/validation/portable-validator/pv-t3.json`

They are projections of the tasks below. Human Build approval covers their
semantic fidelity. Once T1 exists, PV2 validates them mechanically.

## T1 — Atomic PV1/PV2 cut-over and self-hosted gate

### Outcome

A dependency-free deterministic validator stack replaces the fixed-TypeScript
prose gate in one atomic task and successfully validates itself with the new
worktree contract.

### Scope

- PV1 JSON Schema and dependency-free runtime cross-field validation.
- PV2 Node runner/wrapper, argv execution, output/report/exit contracts,
  truncation, redaction, path safety, and receipt hash verification.
- Generic validator prompt and `SKILL.md` portable law/red flags.
- Validator contract fixtures/goldens for PV1–PV10 and PV13 compatibility.
- T1 agent regeneration, runner execution, validator dispatch, and stored PV11
  runtime receipt.

### Scenarios

PV1–PV11, PV13 compatibility portion.

### Named checks

```bash
node --test test/validator-contract.test.js test/extraction.test.js test/docs.test.js
node --check skills/sdlc/scripts/validate-task.mjs
node --check skills/sdlc/scripts/verify-task-receipt.mjs
npm run lint
git diff --check HEAD
```

### Task DoD

- [ ] PV1 schema and all cross-field rules reject PV3 mutations before commands.
- [ ] PV2 executes only exact argv, sequentially, and produces exact PASS/FAIL/
      ERROR text, JSON, and atomic report output.
- [ ] PV4–PV9 command, mapping, bounds, redaction, and output fixtures pass.
- [ ] Prompt/agent preserves all FS7 headings/name/tools and no generic fixed
      TypeScript or CONTRIBUTORS assumption remains.
- [ ] `SKILL.md` portable law and red flags are mutation-tested.
- [ ] Existing task-validator resolution and all other panel goldens remain.
- [ ] Receipt verifier catches mutation of manifest/report/generated-agent.
- [ ] New validator is generated from the worktree, validates T1, and a complete
      PV11 receipt is stored with runner+validator PASS.
- [ ] Every named check exits 0.

### Out of scope

Migration prose/ADRs beyond contract text needed for cut-over; Adoption Readiness
manifest conversion; unrelated refactoring.

## T2 — Compatibility, ADRs, override migration, and sibling handoff contract

### Outcome

Frozen surfaces, migration guidance, consumer overrides, and the blocked
Adoption Readiness handoff are documented and test-gated without weakening the
new runner contract.

### Scope

- ADR for PV1 manifest surface and ADR for PV2 runner/receipt surface.
- README/SKILL/setup documentation and validator-override migration guidance.
- Explicit ownership note for neutralised governing-standards input.
- Adoption Readiness re-projection procedure and renewed human-gate requirement;
  no issue leaves Blocked in this task.
- Documentation/reference tests and final golden updates attributable to the
  approved contract.

### Scenarios

PV10, PV12, PV13 documentation/compatibility portion.

### Named checks

```bash
node --test test/docs.test.js test/extraction.test.js test/validator-contract.test.js
npm run lint
git diff --check HEAD
```

### Task DoD

- [ ] Two ADRs freeze PV1 and PV2/receipt surfaces with compatibility consequences.
- [ ] Generic and consumer-override migration is explicit; FS7 headings remain.
- [ ] No stale fixed-TypeScript/CONTRIBUTORS generic law remains.
- [ ] Adoption Readiness refresh/re-approval procedure is documented and its
      existing board items remain Blocked.
- [ ] Normative-reference ownership does not overlap programme child 1.
- [ ] Every named check exits 0 and the portable validator stores a PASS receipt.

### Out of scope

Actually refreshing Adoption Readiness manifests/issues, which occurs only after
this PR merges; new runner behaviour.

## T3 — Integrated acceptance and PR handoff

### Outcome

PV1–PV13, repository quality gates, receipts, and compatibility are proven
together with no paid/network test calls.

### Scope

- Run all manifests through PV2 and verify T1/T2 receipts.
- Full suite, lint, syntax, schema/example, panel-golden, and diff checks.
- Verify generated prompt/SKILL law, report goldens, hashes, and board Blocked
  state.
- Produce scenario-to-test/receipt evidence for PR.

### Scenarios

PV1–PV13.

### Named checks

```bash
npm test
npm run lint
node --check skills/sdlc/scripts/validate-task.mjs
node --check skills/sdlc/scripts/verify-task-receipt.mjs
git diff --check HEAD
node scripts/check-commit-messages.mjs origin/main..HEAD
```

### Task DoD

- [ ] Every PV1–PV13 scenario maps to named passing test/runtime evidence.
- [ ] T1 and T2 manifests/reports/agents/receipts verify; T3 stores its own PASS
      receipt.
- [ ] Full suite, lint, syntax, diff, and commit-range checks exit 0.
- [ ] No automated test invokes a model, network, live credential, or PONG.
- [ ] Existing FS1/FS2 and panel contracts remain substantively unchanged.
- [ ] Adoption Readiness epic/tasks remain Blocked pending post-merge refresh and
      renewed approval.
- [ ] PR handoff lists scenario evidence and residual platform/security limits.

### Out of scope

Post-merge Adoption Readiness re-projection, new product behaviour, or
opportunistic refactoring.
