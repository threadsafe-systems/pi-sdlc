### Scenario evidence: adoption readiness (AR1–AR12)

| Scenario | Passing tests |
|---|---|
| AR1 | `test/sdlc-status.test.js` "AR1: …"; `test/readiness-output.test.js` AR8 text/JSON goldens |
| AR2 | `test/sdlc-status.test.js` "AR2: absent, untracked, staged, and ignored…" |
| AR3 | `test/readiness-git.test.js` AR3 manifest+models dirty matrices; `test/sdlc-status.test.js` "AR3 (baseline): unrelated dirty files…" |
| AR4 | `test/sdlc-status.test.js` AR4 ×4 (args, implicit root, non-git root, no-HEAD); `test/readiness-git.test.js` "AR4: corrupt .git…"; `test/readiness-output.test.js` JSON pre-scan ×3 |
| AR5 | `test/sdlc-status.test.js` "AR5: committed clean but invalid manifests…"; `test/readiness-lib.test.js` RL9; `test/hooks.test.js` OH1 |
| AR6 | `test/sdlc-status.test.js` AR6 ×4; `test/readiness-lib.test.js` RL6–RL11 |
| AR7 | `test/readiness-output.test.js` AR7 ×4 (aggregation, precedence, skip pins) |
| AR8 | `test/readiness-output.test.js` AR8 ×6 (goldens, envelope fields/order, sentinels) + wrapper agreement |
| AR9 | `test/readiness-git.test.js` AR9 ×7 (linked worktree ×2, detached HEAD, symlink, monorepo, submodule, sparse) |
| AR10 | `test/docs.test.js` AR10 ×2 (branch/prohibition mutation tests) |
| AR11 | `test/docs.test.js` AR11 ×5 (migration, ADRs 0015/0016, stale terms, wrapper, setup template) |
| AR12 | full suite 106/106 + lint; "AR12: … PATH exposing only git"; pre-existing goldens byte-untouched (`git diff main` shows no changes to extraction/hooks/setup-sdlc/validator-contract tests, fixtures, or schemas) |

Residual platform risk: sparse-checkout and submodule fixtures depend on git ≥
2.37 behaviours (`sparse-checkout set --no-cone`, `protocol.file.allow`); CI and
dev machines satisfy this. No network, credential, PONG, or paid-model call
occurs anywhere in the suite.
