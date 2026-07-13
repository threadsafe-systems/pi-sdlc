Verification complete. Both fixes are confirmed working with empirical evidence; no regressions found.

### (A) --report not confined to repo root (validate-task.mjs:398-417) — arbitrary overwrite

- verdict: RESOLVED
- evidence: `atomicWriteReport` now does `realParent = realpathSync(parent)` and throws `"report path escapes the repository root"` when `realParent !== canonicalRoot && !realParent.startsWith(`${canonicalRoot}/`)`, writing only to `finalTarget = join(realParent, basename(absTarget))` (`skills/sdlc/scripts/validate-task.mjs:404-407`). Empirical bypass probes all blocked with exit 2, victim file untouched:
  - **Symlinked parent dir** (`reports/` → outside dir inside repo): exit 2, "escapes the repository root", victim intact. `realpathSync` resolves the symlink, so the indirection is defeated.
  - **Relative traversal** (`../../../victim.json`): exit 2, escapes message, victim intact. `resolve()` + `realpathSync` collapse the `..`.
  - **Absolute path outside**: exit 2, escapes message, victim intact (also covered by new test `PV9: --report outside the repo root is refused and clobbers nothing`).
  - **Legitimate in-repo paths still write**: `--report report.json` (repo root) → exit 0, file written; `--report reports/r.json` (real subdir) → exit 0, file written. The `realParent === canonicalRoot` and `startsWith(canonicalRoot/)` arms admit both. The `basename()` final write also strips any residual traversal in the filename component — defense in depth. Prefix-confusion is correctly avoided by the `canonicalRoot + "/"` separator (canonicalRoot is itself a realpath, no trailing-slash ambiguity).

### (B) verify-task-receipt skipped taskId check when receipt.taskId not a string (verify-task-receipt.mjs:62-64)

- verdict: RESOLVED
- evidence: Code now reads `if (typeof receipt.taskId !== "string") failures.push("receipt taskId is not a string"); else if (report.taskId !== receipt.taskId) failures.push(...)` (`skills/sdlc/scripts/verify-task-receipt.mjs:62-64`). Empirical probe results:
  - taskId missing → fails `"receipt taskId is not a string"`.
  - taskId = number `123` → fails `"receipt taskId is not a string"` (previously silently passed).
  - taskId matching string `"t-1"` → passes (no failures).
  - taskId mismatched string `"t-2"` → fails with the mismatch message.
  - No `runner-report.json` present → taskId check correctly skipped (the whole corroboration block is guarded by `if (report)` after `existsSync(reportPath)`, line 56-61), so no spurious failure. All 18 validator-contract tests pass, including PV11.

### NEW DEFECTS

none found

- Full `node --test test/validator-contract.test.js` passes 18/18.
- `atomicWriteReport` and `verifyReceipt` signatures are unchanged at their call sites (single CLI caller at `validate-task.mjs:480` passes `canonicalRoot`; `verifyReceipt` has two test callers) — no API breakage.
- Residual (out-of-scope, not a regression): a symlink TOCTOU window exists between `realpathSync(parent)` and the subsequent `mkdtempSync`/`renameSync` (lines 404→406/410); exploitation requires an attacker with write access to the parent directory mid-execution, outside the "stray --report operator misconfiguration" threat model this fix targets. Noting only as context, not a defect.