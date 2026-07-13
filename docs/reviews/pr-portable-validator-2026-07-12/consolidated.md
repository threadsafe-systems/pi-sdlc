# Consolidated PR review — portable per-task validator (PR #16)

- Target: PR #16, branch `feat/portable-validator`
- Panel: `anthropic/claude-opus-4-8:medium`, `zai/glm-5.2:medium`,
  `moonshotai/kimi-k2.6:medium` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI

## Round 1 (commit f02572b)

Opus completed; GLM and Kimi timed out at 900 s — both while independently
probing the same `boundStream` quadratic path Opus reported (cross-model
agreement on the high finding).

### H1 — `boundStream` O(n²) byte-trim could hang on a large single-line stream
- severity: high → **incorporated** (fix wave 1, 45f3c13). Replaced the
  char-by-char shift loop with a single reverse-pass byte trim; a 20 MiB line
  now bounds in <200 ms; still ≤100 lines / ≤10 240 bytes per stream with the
  marker. Locked by a new test.

### M1 — receipt verifier did not corroborate the stored runner report
- severity: medium → **incorporated** (45f3c13). `verify-task-receipt` now
  parses `runner-report.json` and requires its own `verdict:PASS`/`exitCode:0`
  and `taskId` match, so a FAIL report cannot ride under `runnerVerdict:PASS`.

### L1 — duplicated JSON-mode detection
- low → **incorporated** (45f3c13). Extracted `detectJsonMode`.

### L2 — sub-4-char credential values not redacted
- low → **recorded/accepted**. The length floor avoids over-redacting trivial
  values; redaction is defence in depth (documented in ADR 0014).

## Round 2 verification (commit 45f3c13)

Opus and GLM both ran. All of H1/M1/L1 verified **RESOLVED** with repro. GLM
raised two new findings:

### M2 — `--report` target not confined to the repo root (arbitrary overwrite)
- severity: medium → **incorporated** (fix wave 2, 5cea200). `atomicWriteReport`
  now realpath-confines the report parent to the repo root (symmetric with the
  manifest check) and refuses an escaping path with an ERROR. Locked by a test
  asserting an outside victim file is untouched.

### L3 — taskId corroboration skipped when `receipt.taskId` is not a string
- low → **incorporated** (5cea200). A non-string taskId is now a hard failure.

### L4 — redaction is env-name scoped only
- low → **recorded/accepted**; documented in ADR 0014 as the command's
  responsibility for non-env secrets.

## Round 3 verification (commit 5cea200)

Opus and GLM both ran. M2 and L3 verified **RESOLVED** with bypass probes
(symlinked parent, relative traversal, absolute path all refused; legitimate
in-repo `--report` still writes). No new defects. One out-of-scope TOCTOU note
(attacker with mid-execution write access to the parent dir) recorded as
context, outside the stray-misconfiguration threat model.

## Stop condition

No high or medium finding survives adjudication. `npm test` (51) and
`npm run lint` pass with no live model/network calls. The change is ready for
human merge review.
