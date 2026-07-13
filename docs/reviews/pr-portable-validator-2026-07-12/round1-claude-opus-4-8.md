Based on my review of the runner, receipt verifier, schema, and tests, here are my findings.

### O(n²) byte-bounding loop can hang the runner on large evidence tails

- severity: high
- confidence: high
- file: skills/sdlc/scripts/validate-task.mjs
- line: 52-69 (`boundStream`)
- problem: After the line cap keeps the last 99 lines, the byte cap is enforced by dropping ONE character at a time in a `while` loop that re-runs `Array.from(joined)` (full O(L) allocation) and `chars.join("")` every iteration. Line truncation does not bound line *length* or total tail size, so `joined` can be arbitrarily large (up to `maxBuffer` = 64 MiB, e.g. a single long base64/minified line, or 99 long lines from verbose test output). The loop then performs ~L iterations each O(L) ⇒ O(L²).
- repro_or_impact: A declared check that emits a large single-line stream (say a 20 MiB line with no `\n`) makes `boundStream` do ~10^14 operations — the runner effectively hangs for hours, defeating the "deterministic, bounded evidence" invariant the whole PV2 design rests on. Reachable with ordinary verbose command output; not covered by the multi-short-line tests (`test/validator-contract.test.js:382`). Fix: slice the last `STREAM_MAX_BYTES` bytes/chars in one pass instead of char-by-char shifting.

### Receipt verifier never checks the stored runner-report's own verdict/exit

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/verify-task-receipt.mjs
- line: 19-51 (`verifyReceipt`)
- problem: The verifier hashes `runner-report.json` and separately asserts `receipt.runnerVerdict === "PASS"`, but it never parses `runner-report.json` to confirm that file's own `verdict`/`exitCode` is actually PASS/0. The two are independent fields.
- repro_or_impact: Store a genuine runner report whose content is `{"verdict":"FAIL","exitCode":1,...}`, record its correct sha256, and set `receipt.runnerVerdict:"PASS"`. `verify-task-receipt` reports "receipt verified" and exits 0, even though the stored evidence contradicts the recorded verdict. This undermines the receipt's advertised tamper-evidence (ADR 0014): the artifact and the claimed result can disagree with a green verification. Fix: read `runner-report.json`, assert its `verdict==="PASS"`/`exitCode===0` and that its `taskId`/`manifest` hash line up with the stored manifest.

### Credential values shorter than 4 chars are never redacted

- severity: low
- confidence: high
- file: skills/sdlc/scripts/validate-task.mjs
- line: 31-40 (`buildRedactionValues`)
- problem: `buildRedactionValues` skips any env value with `value.length < 4`, so a short credential-named secret (e.g. a 3-char PIN in `X_SECRET`) is never added to the redaction set and passes through evidence verbatim.
- repro_or_impact: With `env.API_KEY="abc"`, any command echoing `abc` leaks it into `stdoutTail`. Narrow (short secrets are rare) but it is a real redaction bypass of the "credential-named env values redacted" constraint. Consider lowering/removing the length floor or documenting it as intentional.

### Duplicated JSON-mode detection logic

- severity: low
- confidence: high
- file: skills/sdlc/scripts/validate-task.mjs
- line: 366-370 (`parseArgs` pre-scan) and 449-452 (`argvHasJson`)
- problem: The `--format json` full-argv pre-scan is implemented twice with identical logic (once inside `parseArgs`, once in the standalone `argvHasJson`). They can drift, and a change to JSON-mode recognition must be made in two places.
- repro_or_impact: No current defect, but a future edit to how JSON mode is recognised risks inconsistent error-envelope behaviour between the parse-failure path and the normal path. Extract one helper and call it from both.
- smell: Duplicated Code

No high- or medium-severity findings on path-escape/argv-injection (the realpath containment check on the manifest and `shell:false` execution of Build-approved argv are sound), truncation-marker determinism (the marker is fixed and prepended deterministically), timeout/signal handling (timeouts and signals correctly map to FAIL), atomic-write races (same-directory `mkdtemp`+`rename` is atomic), or exit-code mapping (0/1/2 are correct, manifest-invalid short-circuits before any command).