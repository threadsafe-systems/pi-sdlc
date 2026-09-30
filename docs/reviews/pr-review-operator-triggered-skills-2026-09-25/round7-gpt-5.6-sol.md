- PR-R6-01: RESOLVED — corrected proof-of-absence wording appears in all three ADR notes (`docs/adr/0015-adoption-readiness-policy.md:5-6`, `0016-status-surface-fs8.md:4-6`, `0023-status-surface-fs8-v2.md:6-9`).
- PR-R6-02: PARTIAL — the environment condition landed (`docs/plans/2026-09-24-operator-triggered-skills.md:151-155`), but its new exit-2 claim is overbroad as detailed below.
- PR-R6-03: RESOLVED — the diagnostic now says the working directory “cannot be proven outside” and provides both applicable remedies (`skills/sdlc/scripts/sdlc-status.mjs:205-206`).
- PR-R6-04: RESOLVED — the ledger records 3 and 1 failing tests (`docs/reviews/pr-review-operator-triggered-skills-2026-09-25/consolidated.md:104`), reproduced with both mutants.
- PR-R6-05: RESOLVED — both the script header and Build surface name the root and working directory (`skills/sdlc/scripts/sdlc-status.mjs:8-10`; `docs/plans/2026-09-24-operator-triggered-skills-build.md:82-85`).
- PR-R6-06: RESOLVED — the assertion now uses `check()` (`test/sdlc-status.test.js:319`).

### Plan DoD incorrectly maps every failed absence proof to exit 2

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 151-155
- problem: The amended DoD says `sdlc-status` “exits 2 whenever that proof fails” without limiting this to the fallback after git repository discovery fails. In an ordinary repository the filesystem cannot prove that no repository encloses the paths, yet successful git discovery passes `git.repository` (`skills/sdlc/scripts/sdlc-status.mjs:198-220`) and the command may exit 0, 1, or 3.
- repro_or_impact: Running the committed script in a valid git repository without a manifest produced `git.repository:pass`, `adoption.manifest-head:fail`, and exit 1—not exit 2. This makes the governing acceptance rule contradict the retained four-state behavior; qualify the exit-2 clause with the failed-git-discovery context.