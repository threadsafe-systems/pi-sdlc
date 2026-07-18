---
description: Enter the sdlc Specification phase directly (standalone sdlc:spec)
---
Standalone entrypoint for the **Specification** phase. Thin router; it does not
restate phase mechanics.

## 1. Resolve the skill and detect adoption

Resolve `<skill-dir>` (the folder containing the `sdlc` skill's `SKILL.md`) and
run the readiness gate:

```bash
<skill-dir>/scripts/sdlc-status.sh --repo-root . --format json
```

**Adopted-config-dominates:** the repo is **adopted** iff the FS8
`adoption.manifest-head` check passes (state ∈ {`ready`, `not-ready`}). On
`error` (exit 2) **stop** and surface the diagnostic; an errored `sdlc-status` is
unknown-adoption and is never treated as adopted.

**Readiness gate still applies.** Adoption detection is separate from readiness: only proceed when `sdlc-status` is `ready` (exit 0 — adopted, run under committed configuration) or `not-adopted` (exit 1 — unadopted, sampling path). On `not-ready` (exit 3) or `error` (exit 2) **stop** and surface the remediations/diagnostics, matching the `SKILL.md` startup table, before entering any phase or firing any hook.

## 2. Load the phase reference

Load `references/phase-spec.md` and run under it; do not duplicate its mechanics.

## 3. Degradation contract (#38)

Spec's authoritative upstream is a **committed plan doc**.

- **Unadopted, no committed plan:** **stamp-and-interview** — capture intent live,
  and emit the sampling stamp below as the first line of the produced artifact.
- **Adopted, no committed plan:** **refuse-with-redirect** — do not interview; tell
  the user to run `sdlc:plan` first and stop. (Adopted config dominates: no
  sampling leniency.)
- **Committed plan present:** run the configured spec gate under
  `review.design` + effective track (from current `.pi/sdlc/CONFIG.md` or
  authoritative `sdlc.config.json`).

## Sampling stamp (only this entrypoint emits one)

When and only when stamp-and-interview applies, emit exactly this single
plain-prose line (no YAML, no JSON, never parsed by tooling) as the first line of
the Spec artifact:

> Sampled via sdlc:spec, standalone — no committed plan found; intent captured by interview below. Not adopted; nothing here is checker-verified.
