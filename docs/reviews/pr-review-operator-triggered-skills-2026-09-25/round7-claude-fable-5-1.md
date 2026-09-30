Round-6 disposition confirmations (delta `4be31af..0f2a239`):

- PR-R6-01: landed — ADR 0015:5-6, 0016:4-6, 0023:6-9 now say "when the filesystem proves no git repository encloses the root or the working directory", matching `docs/specs/2026-07-12-sdlc-adoption-readiness.md:10-12` and the ADR 0030 body ("only when the filesystem proves it for both", `:29-31`). Confirmed.
- PR-R6-02: landed — the DoD (`docs/plans/2026-09-24-operator-triggered-skills.md:151-155`) names the proof and the `GIT_DIR`/`GIT_WORK_TREE`/`GIT_COMMON_DIR` condition. Confirmed, but the rewrite over-reaches on the exit-2 half (finding below).
- PR-R6-03: landed — `skills/sdlc/scripts/sdlc-status.mjs:206` says "cannot be proven outside a git repository" and the remediation ends "outside git, run from the root itself"; reproduced the broken-`.git`-cwd case (exit 2, new message) and running from the root itself (exit 1). `test/sdlc-status.test.js:319` asserts the new text. Confirmed.
- PR-R6-04: landed — on a git-initialised copy of `0f2a239`, `provablyOutsideGit(root)` → `true` at `:202` fails exactly 3 tests and dropping `physical` from the walk set at `:87` fails exactly 1; the corrected record (`consolidated.md:104`) matches. Confirmed.
- PR-R6-05: landed — script header `:8-10` and Build Surfaces bullet `:82-84` name both directories. Confirmed.
- PR-R6-06: landed — `test/sdlc-status.test.js:319` uses `check()`. Confirmed.
- Carries: no `CARRY-TO-*` record exists in the Plan, Build plan, ADR 0030 or the review directory for this feature (grep at `0f2a239`); nothing to discharge.
- Tests: `node --test test/sdlc-status.test.js` 16/16 pass; `operator-triggered-skills` + `frozen-surfaces` 10/10 pass. PR body's "Assumptions & discretionary calls" is consistent with the delta.

### Plan Definition of done now promises exit 2 for every failed proof, which includes every adopted repository

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 151-155
- problem: The rewritten DoD says `sdlc-status` "exits 1 when the filesystem proves no git repository encloses the root or the working directory (…), and exits 2 whenever that proof fails". "That proof" fails for any directory holding a `.git` entry (`skills/sdlc/scripts/sdlc-status.mjs:88`), i.e. for every ordinary adopted repository, which exits 0, 1 or 3, not 2. Exit 2 actually requires git to find no usable worktree at the root *and* the proof to fail (`sdlc-status.mjs:202-209`); the Build plan's "Does" bullet states this correctly ("Leaves every other root or git failure as `error`", `…-build.md:96`), and the round-6 wording ("whenever a `.git` exists that git cannot use or the root points away from the caller's repository") was also correct on this axis. The PR-R6-02 disposition repeats the over-broad claim ("that any failed proof exits 2", `consolidated.md:123`).
- repro_or_impact: `readyFixture()` → `sdlc-status --repo-root <dir>` exits 0 (`test/sdlc-status.test.js:43-48`), while the DoD as written requires 2 for it. The DoD is the acceptance rule the PR gate checks for the owner-ratified `sdlc-status` change; a verifier reading it literally cannot satisfy it, and a maintainer summarising the contract from it would carry the misstatement forward. Fix: "…and exits 2 when git finds no usable worktree at the root and that proof fails, including …".

No medium or high findings. No finding contradicts the owner-ratified decision to change `sdlc-status` in this PR.