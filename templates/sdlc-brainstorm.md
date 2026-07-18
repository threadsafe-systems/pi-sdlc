---
description: Enter the sdlc Brainstorm phase directly (standalone sdlc:brainstorm)
---
Standalone entrypoint for the **Brainstorm** phase of the sdlc lifecycle. This is
a thin router; it does not restate phase mechanics.

## 1. Resolve the skill and detect adoption

Find the `sdlc` skill's own directory (the folder containing its `SKILL.md`) and
resolve `<skill-dir>` to that absolute path. Run the readiness gate:

```bash
<skill-dir>/scripts/sdlc-status.sh --repo-root . --format json
```

**Adopted-config-dominates (the binary switch).** Detection uses the FS8
`adoption.manifest-head` check directly: the repo is **adopted** iff that check
passes — equivalently its state ∈ {`ready`, `not-ready`} (the committed `HEAD`
contains `.pi/sdlc/sdlc.config.json`). On `error` (exit 2) **stop** and surface
the diagnostic — an errored `sdlc-status` is unknown-adoption and is never
treated as adopted.

## 2. Load the phase reference

Load `references/phase-brainstorm.md` and run under it. Do not duplicate its
mechanics here.

## 3. Degradation contract (#38)

Brainstorm needs **no committed upstream**.

- **Unadopted:** runs as a plain design dialogue (sampling leniency).
- **Adopted:** loses sampling leniency and runs as the configured brainstorm gate
  under committed configuration (`review.brainstorm`, read from current
  `.pi/sdlc/CONFIG.md` or authoritative `sdlc.config.json`).

No sampling stamp is emitted by this entrypoint (only `sdlc:spec` stamps).
