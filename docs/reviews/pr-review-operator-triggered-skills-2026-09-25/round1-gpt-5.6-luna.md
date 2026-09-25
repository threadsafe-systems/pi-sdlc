### Exit-2 Git failures fail open in adopted repositories

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 39-43
- problem: Any `root.resolve` or `git.repository` error is treated as “no repository” and continues as exit 1. `sdlc-status` maps missing/unlaunchable Git and other Git failures to those same error checks (`skills/sdlc/scripts/sdlc-status.mjs:51-53,151-167`).
- repro_or_impact: In an adopted checkout, running status with Git unavailable returns exit 2 with `git.repository:error`; following this branch silently bypasses lifecycle enforcement instead of stopping.

### Documentation contradicts preserved standalone sampling

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/system-reference.md
- line: 51-56
- problem: The new text says there is no partial or session-only lifecycle, echoed by ADR 0030 (`docs/adr/0030-operator-triggered-skills.md:30-32`). However, standalone commands intentionally retain unadopted sampling paths (`templates/sdlc-brainstorm.md:23-35`, `templates/sdlc-plan.md:21-34`).
- repro_or_impact: Running `/sdlc-brainstorm` in an unadopted repository proceeds as a plain design dialogue, contradicting the claimed absence of sanctioned non-binding guidance.

### ADR 0015 still prescribes the removed exit-1 behavior

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0015-adoption-readiness-policy.md
- line: 21-24
- problem: Despite adding ADR 0030 as an amendment, ADR 0015 still says exit 1 offers `/setup-sdlc`/advisory mode and that exits 2 and 3 stop. The current startup contract says exit 1 is silent and selected exit-2 cases continue (`skills/sdlc/SKILL.md:36-50`).
- repro_or_impact: Maintainers following ADR 0015’s explicitly named “policy consumer” can reintroduce the retired prompt or incorrectly stop non-git sessions.

### No-git regression test does not exercise a no-git directory

- severity: low
- confidence: high
- origin: NEW
- file: test/operator-triggered-skills.test.js
- line: 72-76
- problem: The test name claims directory behavior, but the body only regex-matches `SKILL.md`; it never runs `sdlc-status` in a non-git directory or exercises an exit-2 report.
- repro_or_impact: A regression in status classification or handling can pass this test while the advertised no-git behavior is broken.