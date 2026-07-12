Confirmed: symlinked parent and relative `..` escapes both refused; legitimate in-repo `--report` still writes. Both findings resolved.

### (A) --report not confined to repo root — arbitrary file overwrite (skills/sdlc/scripts/validate-task.mjs:399-419)

- verdict: RESOLVED
- evidence: `atomicWriteReport` now computes `realParent = realpathSync(parent)` (line 405) and throws `"report path escapes the repository root"` unless `realParent === canonicalRoot || realParent.startsWith(canonicalRoot + "/")` (line 406). The tmpdir and final rename both target `realParent`/`finalTarget = join(realParent, basename(absTarget))` (lines 407-409, 417), so the confinement is on the *resolved* parent — a symlinked parent cannot bypass it. Live repro confirms: `link/victim.json` (symlink dir → outside) REFUSED, `../outside/victim.json` REFUSED, in-repo `report.json` ALLOWED. `renameSync` targets a name inside `realParent` and does not follow a pre-existing symlink at the leaf, so no write-through. Committed blob (`git show 5cea200:...`) matches the worktree. New test "PV9: --report outside the repo root is refused and clobbers nothing" passes and asserts the victim bytes are untouched.

### (B) verify-task-receipt skips taskId corroboration when receipt.taskId not a string (skills/sdlc/scripts/verify-task-receipt.mjs:62-63)

- verdict: RESOLVED
- evidence: The `if (report)` block now does `if (typeof receipt.taskId !== "string") failures.push("receipt taskId is not a string"); else if (report.taskId !== receipt.taskId) failures.push(...)` (lines 62-63). A non-string `receipt.taskId` now produces a hard failure instead of silently skipping the check, and the string case always compares against `report.taskId`. Scope matches the original (only exercised when a parseable `runner-report.json` is present, which is the report-corroboration path). Test "PV11: a FAIL runner-report cannot ride under runnerVerdict PASS" still passes.

### NEW DEFECTS

none found. The delta (added `basename` import, realpath confinement, taskId type gate, one new test) introduces no regressions. The `finalTarget`/`realParent` rewrite keeps the atomic-write semantics intact (tmp dir created under the same resolved parent as the rename target, so `renameSync` stays same-filesystem), and the existing "PV9: --report writes the exact JSON bytes atomically" test still passes.