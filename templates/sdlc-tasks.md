---
description: Enter the sdlc Build/Tasks phase directly (standalone sdlc:tasks)
---
Standalone entrypoint for the **Build/Tasks** phase (the #38 surface name for
Build). Thin router; it does not restate phase mechanics.

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

Load `references/phase-tasks.md` and run under it; do not duplicate its mechanics.

## 3. Degradation contract (#38)

Tasks' authoritative upstream is **committed scenario ids** (from the Spec, or the
approved Plan's definition of done on the reversible track).

- **Upstream absent — in BOTH adoption states:** **always refuse-with-redirect**.
  Tell the user which upstream artifact is missing and to produce it first
  (`sdlc:spec`, or the plan's definition of done), then stop.
- **This entrypoint never fabricates scenario ids or check tables** for absent
  upstream, in any adoption state (the counterfeit-artifact rule). It emits no
  invented ids and no invented check tables.
- **Upstream present:** decompose the vetted upstream into the build breakdown per
  `references/phase-tasks.md`, publishing to the tracker only when the committed
  `shape.publishToTracker` threshold is met.
