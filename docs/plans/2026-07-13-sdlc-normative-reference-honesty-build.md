# Build plan: normative-reference honesty

- Date: 2026-07-13
- Plan: `docs/plans/2026-07-13-sdlc-normative-reference-honesty.md` (approved)
- Specification: `docs/specs/2026-07-13-sdlc-normative-reference-honesty.md` (approved)
- Track: irreversible
- Canonical source: this committed Build plan; tracker objects are its projection.
- Tracker projection: epic #25; T1 #26; T2 #27; T3 #28; shared board #5.
- Human gate: Build decomposition and tracker projection are approved autonomously under the user instruction to proceed without interactive approval.
- Validator policy: PV1 manifests under `docs/validation/normative-reference-honesty/`, executed by `skills/sdlc/scripts/validate-task.sh` with receipts under `docs/reviews/task-validate-normative-reference-honesty-<task>-<date>/`.

## Definition of done

1. FS11 inventory schema/data and reference checker implement NR1–NR6 exactly.
2. All known A7 non-path broken/assumed references are corrected, with NR7 mutation coverage and refreshed prompt fixtures.
3. Integrated acceptance proves NR1–NR8, no FS8/FS9/FS10 regression, and no live call.
4. `npm test`, `npm run lint`, syntax checks, and all PV2 receipts pass.
5. The final PR panel has no surviving high or medium finding.

## Task graph

```text
T1 ──→ T2 ──→ T3
```

T1 freezes and implements the inventory/checker. T2 consumes the checker contract to correct source references and add mutation tests. T3 runs integrated acceptance and compatibility checks.

## T1 — inventory and offline checker

### Outcome

Ship `normative-references.json` plus its schema and `check-references.mjs/.sh`. Implement the exact schema, containment, source assertion, ownership/status, readiness coupling, report, exit, and diagnostics contracts in Specification §§1.1–1.4 and scenarios NR1–NR6.

### Checks

```bash
node --check skills/sdlc/scripts/check-references.mjs
node --test test/check-references.test.js
npm run lint
```

### Scenarios

NR1, NR2, NR3, NR4, NR5, NR6.

### PV1 manifest

`docs/validation/normative-reference-honesty/nr-t1.json`.

### Scope boundaries

No edits to FS8/FS9/FS10 behaviour, generic prompts, or path-plumbing documentation beyond source paths needed to make inventory entries resolve.

## T2 — source corrections and mutation coverage

### Outcome

Correct the generic prompts, SKILL/README/template wording, and panel dispatch instructions per Specification §2. Refresh generated golden fixtures. Add mutation-style tests proving the known broken references and false claims cannot return while preserving existing extraction and validator contracts.

### Checks

```bash
node --check test/reference-contract.test.js
node --test test/reference-contract.test.js test/extraction.test.js test/validator-contract.test.js test/docs.test.js
npm run lint
```

### Scenarios

NR7, plus NR2 and NR8 compatibility portions.

### PV1 manifest

`docs/validation/normative-reference-honesty/nr-t2.json`.

### Scope boundaries

No new checker semantics, FS8/FS9/FS10 changes, or configured path plumbing.

## T3 — integrated acceptance and compatibility

### Outcome

Run the complete scenario and compatibility sweep, verify every inventory entry and receipt, assert FS8/FS9/FS10 files and tests are unchanged except explicitly scoped documentation/source corrections, and record the final offline evidence.

### Checks

```bash
node --check skills/sdlc/scripts/check-references.mjs
node --test
npm run lint
skills/sdlc/scripts/sdlc-status.sh --format json
node scripts/check-commit-messages.mjs origin/main..HEAD
```

### Scenarios

NR1–NR8.

### PV1 manifest

`docs/validation/normative-reference-honesty/nr-t3.json`.

### Scope boundaries

No opportunistic refactoring; no live credentials, network, GitHub, or model calls.
