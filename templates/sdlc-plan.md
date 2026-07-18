---
description: Enter the sdlc Plan phase directly (standalone sdlc:plan)
---
Standalone entrypoint for the **Plan** phase of the sdlc lifecycle. Thin router;
it does not restate phase mechanics.

## 1. Resolve the skill and detect adoption

Resolve `<skill-dir>` (the folder containing the `sdlc` skill's `SKILL.md`) and
run the readiness gate:

```bash
<skill-dir>/scripts/sdlc-status.sh --repo-root . --format json
```

**Adopted-config-dominates:** the repo is **adopted** iff the FS8
`adoption.manifest-head` check passes (state ∈ {`ready`, `not-ready`}). On
`error` (exit 2) **stop** and surface the diagnostic; never treat an errored
`sdlc-status` as adopted.

**Readiness gate still applies.** Adoption detection is separate from readiness: only proceed when `sdlc-status` is `ready` (exit 0 — adopted, run under committed configuration) or `not-adopted` (exit 1 — unadopted, sampling path). On `not-ready` (exit 3) or `error` (exit 2) **stop** and surface the remediations/diagnostics, matching the `SKILL.md` startup table, before entering any phase or firing any hook.

## 2. Load the phase reference

Load `references/phase-plan.md` and run under it; do not duplicate its mechanics.

## 3. Degradation contract (#38)

Plan needs **no committed upstream**.

- **Unadopted:** runs and forms intent live.
- **Adopted:** loses sampling leniency and runs as the configured design gate
  (`review.design` + effective track, read from current `.pi/sdlc/CONFIG.md` or
  authoritative `sdlc.config.json`).

No sampling stamp is emitted by this entrypoint (only `sdlc:spec` stamps).
