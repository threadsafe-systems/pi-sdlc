---
description: Enter the sdlc PR-review panel directly (standalone sdlc:pr-review)
---
Standalone entrypoint for the **PR review** phase. Thin router; it does not
restate phase mechanics (the panel run-shape is owned by
`references/phase-pr-review.md`).

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

Load `references/phase-pr-review.md` and run the panel under it when
`review.code.validate` is `panel` (when it is `skip`, no local panel runs — the
phase is the pre-PR sense check plus `check-lifecycle`); do not duplicate its
mechanics.

## 3. Degradation contract (#38)

PR review needs **no committed upstream** — the diff is self-contained.

- **Unadopted:** apply a small fixed panel default (there is no committed floor to
  read) and offer an **optional, skippable grounding prompt** for existing design
  material. The output **discloses grounded-vs-diff-only** — state explicitly
  whether the review was grounded against design docs or ran diff-only.
- **Adopted:** loses sampling leniency and runs the committed `pr_review` gate at
  the committed mode/floors (`review.code` + `panels`, from current
  `.pi/sdlc/CONFIG.md` or authoritative `sdlc.config.json`), **never below them**.

No sampling stamp is emitted by this entrypoint (only `sdlc:spec` stamps).
