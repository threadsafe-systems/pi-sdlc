All evidence gathered. Here is my verification report.

---

### boundStream O(n²) shift loop → single-pass byte trim (validate-task.mjs:46-72)

- verdict: RESOLVED
- evidence: The new `boundStream` reserves one line for the marker (`lines.slice(lines.length - 99)`), then trims to the byte budget in a **single reverse for-loop** (`for (let i = chars.length - 1; ...)`) — no nested shift. `Array.from(joined)` splits by code point so multibyte is safe. I verified the committed blob (git show matches working tree) and ran a boundary repro: 20 MB single line bounds in **169 ms** (was quadratic), exactly-100-lines/small-bytes is NOT truncated (no marker), 101 lines and 10241 bytes both truncate with the marker, and every truncated output is ≤100 lines and ≤10240 bytes including the 41-byte marker. Multibyte cut produces valid UTF-8. All 17 contract tests pass.

### verify-task-receipt did not corroborate the stored report (verify-task-receipt.mjs:55-76)

- verdict: RESOLVED
- evidence: The verifier now re-reads `runner-report.json` (line 57), parses it, and requires `report.verdict === "PASS" && report.exitCode === 0` (line 61), plus a taskId match when `receipt.taskId` is a string (line 62). A genuine FAIL report can no longer ride under `runnerVerdict: PASS`. Confirmed by the PV11 test "a FAIL runner-report cannot ride under runnerVerdict PASS" and by live repro — a `verdict:FAIL/exitCode:1` report with matching hashes produces `runner-report verdict/exit is FAIL/1, expected PASS/0`.

### Duplicated JSON-mode detection → detectJsonMode (validate-task.mjs:353-359)

- verdict: RESOLVED
- evidence: `detectJsonMode` is a single exported function; `parseArgs` calls it at line 367 and `main`'s catch calls it at line 378. No inline duplication remains. The `parseArgs` contract test confirms `--format json` is recognised in any position, and a bare `--bogus` before `--format json` still yields a JSON error envelope.

### NEW DEFECTS

### `--report` write path is not confined to the repo root (arbitrary file overwrite via rename)

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/validate-task.mjs
- line: 398-411
- problem: `atomicWriteReport` resolves the `--report` target (`absTarget = isAbsolute(target) ? target : resolve(canonicalRoot, target)`) but never checks the resolved path is inside `canonicalRoot`. The manifest path IS confined (`absManifest.startsWith(canonicalRoot + "/")`), but the report path is not — an asymmetry in the security boundary. `renameSync(tmpFile, absTarget)` silently overwrites whatever already exists at the target.
- repro_or_impact: Live repro: with `--repo-root /tmp/pv-repo-XXX` and `--report /tmp/pv-outside-YYY/victim.json`, the runner (exit 0) overwrote a pre-existing `{"important":"data"}` file outside the repo with the report JSON. If the report path is ever influenced by prompt injection or a misconfigured caller, any writable file on the filesystem can be clobbered. Fix: apply the same `startsWith(canonicalRoot + "/")` confinement used for the manifest.

### taskId corroboration is skipped when `receipt.taskId` is not a string

- severity: low
- confidence: high
- file: skills/sdlc/scripts/verify-task-receipt.mjs
- line: 62
- problem: `if (typeof receipt.taskId === "string" && report.taskId !== receipt.taskId)` — a receipt with `taskId: null` (or undefined/number) skips the taskId match entirely. A stored `runner-report.json` from a completely different task verifies as long as verdicts are PASS and hashes match.
- repro_or_impact: Live repro: receipt `taskId: null` + runner-report `taskId: "different-task"` with `verdict:PASS/exitCode:0` and correct hashes → `verifyReceipt` returns `[]` (passes). The verdict/exit and hash checks still provide primary defence, so this is a defence-in-depth gap, not a full bypass. Fix: require `receipt.taskId` to be a string and always compare, or fail if the field is absent.

### Redaction is scoped to env-var-named secrets only

- severity: low
- confidence: high
- file: skills/sdlc/scripts/validate-task.mjs
- line: 31-36
- problem: `buildRedactionValues` only collects values from env vars whose **name** matches `REDACT_NAME_RE` (KEY/TOKEN/SECRET/PASSWORD/PASSWD/AUTH/CREDENTIALS) and are ≥4 chars. Secrets that commands read from config files, or env vars with non-credential names (e.g. `DATABASE_URL`, `CONNECTION_STRING`), pass through stdout/stderr unredacted.
- repro_or_impact: A check command that prints a value from a `.env` file or a `DATABASE_URL` env var will leak it into the stored `runner-report.json`. This is a deliberate design trade-off (the runner can only know about env), but it is a real residual redaction gap worth documenting for receipt consumers.