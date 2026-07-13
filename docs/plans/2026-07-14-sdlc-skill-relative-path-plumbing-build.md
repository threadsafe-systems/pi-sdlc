# Build plan: skill-relative invocation and path plumbing

- Date: 2026-07-14
- Plan: `docs/plans/2026-07-14-sdlc-skill-relative-path-plumbing.md`
- Specification: `docs/specs/2026-07-14-sdlc-skill-relative-path-plumbing.md`
- Track: irreversible
- Canonical source: this Build plan; tracker objects are its projection.
- Human gate: Build decomposition and tracker projection are approved autonomously.
- Validator policy: PV1 manifests under `docs/validation/skill-relative-path-plumbing/` with receipts under `docs/reviews/task-validate-skill-relative-path-plumbing-<task>-<date>/`.

## Definition of done

1. A contained consumer-path seam handles all four overrides and separator/escape cases without changing FS8/FS9/FS10 contracts.
2. Shipped generic sources use skill-relative in-harness and resolved direct-Node headless commands, and configured path homes are explicit.
3. Installed-consumer fixtures exercise the required command surfaces from consumer cwd.
4. SP1–SP7, full suite, lint, readiness, and PV2 receipts pass.
5. Final PR panel has no surviving high/medium finding.

## Task graph

```text
T1 ──→ T2
```

## T1 — consumer path seam and override coverage

### Outcome

Implement/reuse a pure consumer-root path resolver, harden FS1 path validation for backslash separators, wire configured paths through checker and panel-agent stamping, and add SP3–SP5 regression fixtures without changing default behavior.

### Checks

```bash
node --check skills/sdlc/scripts/lib.mjs
node --check skills/sdlc/scripts/check-lifecycle.mjs
node --test test/readiness-lib.test.js test/check-lifecycle-git.test.js test/extraction.test.js test/setup-sdlc.test.js
npm run lint
```

### Scenarios

SP3, SP4, SP5, SP7 compatibility portion.

### PV1 manifest

`docs/validation/skill-relative-path-plumbing/sp-t1.json`.

## T2 — documentation and installed-consumer acceptance

### Outcome

Update the shipped generic corpus, workflow/template/golden paths, migration ADR, and installed-consumer fixture. Exercise status, setup, panel-agent, panel resolution, lifecycle checker, and task validation from a separate consumer cwd using resolved installed skill paths.

### Checks

```bash
node --check test/path-plumbing.test.js
node --test test/path-plumbing.test.js test/docs.test.js test/extraction.test.js test/check-lifecycle.test.js test/validator-contract.test.js
npm test
npm run lint
skills/sdlc/scripts/sdlc-status.sh --format json
```

### Scenarios

SP1, SP2, SP6, SP7.

### PV1 manifest

`docs/validation/skill-relative-path-plumbing/sp-t2.json`.
