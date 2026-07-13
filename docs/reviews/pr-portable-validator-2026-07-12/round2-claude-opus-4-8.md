All three fixes verified against the actual new code and confirmed by repro + the test suite (17/17 pass).

### (1) HIGH boundStream O(n²) shift loop → single-pass byte trim (skills/sdlc/scripts/validate-task.mjs:49-76)

- verdict: RESOLVED
- evidence: The `while (... rendered() ...) { chars.shift(); ... }` loop (O(n²): each `shift()` + `join()` rescans the whole buffer) is gone. It is replaced by a single reverse pass over `Array.from(joined)` (validate-task.mjs:66-73) that accumulates byte-lengths from the tail until `budget` is hit, then one `chars.slice(start).join("")`. Repro on a 5,000,000-char single line completed in 44 ms (test asserts <2000 ms). Bounds hold: single huge line → 10240 bytes, marker present; 5000 lines → exactly 100 lines (99 tail + marker line), 931 bytes; `budget = STREAM_MAX_BYTES - byteLength(TRUNCATION_MARK)` so `TRUNCATION_MARK + joined ≤ 10240`; multibyte (`€`×5000) trimmed to 10238 bytes with no `\uFFFD` corruption (byte-length checked per char, never splits a codepoint). Non-truncated input returns `joinedFull` unchanged, no marker. Genuinely single-pass, ≤100 lines / ≤10240 bytes, marker always present when truncated.

### (2) MEDIUM verify-task-receipt did not corroborate the stored report (skills/sdlc/scripts/verify-task-receipt.mjs:48-64)

- verdict: RESOLVED
- evidence: `verifyReceipt` now re-parses `runner-report.json` and pushes failures unless `report.verdict === "PASS" && report.exitCode === 0`, plus a `report.taskId === receipt.taskId` cross-check when the receipt taskId is a string. The corroboration cannot be bypassed by omitting the file: `runnerReportSha256`→`runner-report.json` is in the `files` hash-map (lines 32-46), so a missing file yields "missing stored file runner-report.json" and a missing/invalid sha field yields "…is not a valid sha256". An unparseable report yields "cannot parse runner-report.json". A genuine FAIL report (verdict FAIL/exit 1) or ERROR report (verdict ERROR/exit 2) is caught even if `runnerVerdict:"PASS"` is asserted in the receipt. Test "PV11: a FAIL runner-report cannot ride under runnerVerdict PASS" passes.

### (3) LOW duplicated JSON-mode detection → extracted detectJsonMode (skills/sdlc/scripts/validate-task.mjs:398-405, 451, 455)

- verdict: RESOLVED
- evidence: A single exported `detectJsonMode(argv)` now backs `parseArgs` (line 409) and `main`'s catch-path (line 455). The former duplicate `argvHasJson` is deleted — `grep -rn "argvHasJson" skills/` returns nothing. Behaviour preserved: "parseArgs: recognises JSON anywhere and rejects bad flags" and "PV9: … JSON mode is order-independent" both pass.

### NEW DEFECTS

none found. The scoped diff is confined to `boundStream`, `verifyReceipt`, and the `detectJsonMode` extraction plus their locking tests; I traced each for regressions (negative budget impossible — `budget ≈ 10202`; line-cap still 100 including the marker; receipt file-existence still gated by the hash-map so no new bypass) and found none. Full suite: 17/17 pass.