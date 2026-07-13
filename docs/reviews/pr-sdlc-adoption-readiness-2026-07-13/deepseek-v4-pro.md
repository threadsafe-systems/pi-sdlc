After exhaustive analysis of the diff, spec, implementation, and test behavior, here are my findings.

### SKIP_REASON for errored `adoption.manifest-clean` conflates "fail" and "error" skip messages

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 35-37 (SKIP_REASON map, "adoption.manifest-clean" entry)
- problem: When `adoption.manifest-clean` has status `"error"` (git comparison infrastructure failure, not a detected dirty file), downstream checks that skip because of it use the SKIP_REASON message `"manifest has uncommitted changes"` — which wrongly describes the situation. The actual error (from the check's own message, e.g. "git could not compare the manifest against HEAD") is not propagated to dependents' skip messages.
- repro_or_impact: If `git diff` fails with a real error (corrupt index, I/O error, permission problem), the `adoption.manifest-clean` check correctly reports `status: "error"` with an accurate message. But every downstream skip (config.valid, and transitively anything depending on it) displays "manifest has uncommitted changes". This misleads a human or parser into thinking the manifest is dirty, when in fact git itself could not complete the comparison. The aggregate exit code (2) is correct; the information loss is in the diagnostic text only.
- smell: Primitive Obsession (SKIP_REASON is keyed only by check ID, not by status, losing the distinction between fail/error)

### Duplicate `--config` / `--repo-root` silently overwrites

- severity: low
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 74-82 (parseArgs, option-setting logic)
- problem: `parseArgs` does not detect when `--config` or `--repo-root` appears more than once. If you pass `--config /a --config /b`, the second silently overwrites the first with no error. The `explicitRoots` array collects both, but the root resolution uses only the last value. This violates the principle of least surprise — users expect duplicate exclusive options to be rejected.
- repro_or_impact: `sdlc-status --config /first --config /second` resolves root to `/second` with no diagnostic. Contrast with `--format text --format text` which correctly produces an error. The test suite does not cover duplicate `--config` or duplicate `--repo-root`.
- smell: Repeated Switches (the same overwrite pattern appears for both `--config` and `--repo-root`; no guard clause exists for either)

### `parsed.format` is dead code — set but never consumed

- severity: low
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 68 (jsonMode from pre-scan) vs line 99 (`out.format = v` in parseArgs)
- problem: `parseArgs` validates the `--format` value and stores it in `out.format`, but `buildReport` never reads `parsed.format`. The output format is determined solely by the `scanJsonMode` pre-scan (`jsonMode` variable at the module scope). This makes the `parseArgs` format handling misleading dead code — changes to `parsed.format` cannot affect output.
- repro_or_impact: If someone modifies only `parseArgs`'s format logic without understanding the dual path, they could introduce a silent regression. For example, adding `--format=json` support to `parseArgs` alone would not produce JSON output because the pre-scan only matches space-separated `--format json`. The reverse is also true: the pre-scan finding `--format json` enables JSON mode even if `parseArgs` later rejects the format value due to a duplicate error — the error is then rendered in JSON, which is correct, but the `parsed.format` field is internally inconsistent.
- smell: Duplicated Code (format detection happens in two places — scanJsonMode pre-scan AND parseArgs — but only the pre-scan result is actually consumed)

### `--format=json` syntax silently rejected as unexpected argument

- severity: low
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 61-65 (scanJsonMode) and 93-101 (parseArgs format branch)
- problem: Both `scanJsonMode` and `parseArgs` check for `argv[i] === "--format"` followed by a separate `argv[i+1]` value. The common `--format=json` (GNU-style `=` syntax) does not match this pattern — the entire string `--format=json` is a single `argv` element that fails the `=== "--format"` check, falling through to the "unexpected argument" error. The spec (§1.1) says "a well-formed `--format json` pair", so this is within-spec, but `--format` is the only option with this limitation.
- repro_or_impact: `sdlc-status --format=json` exits 2 with `check: cli.arguments error — unexpected argument: --format=json`. A user who habitually uses `=` syntax for flags gets a confusing error. The JSON output mode documented in ADR 0016 and README explicitly shows the space-separated form, so this is a usability surprise rather than a spec violation.

### No `reasonFor` escape for passed prerequisites — theoretical dead code path

- severity: low
- confidence: medium
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 210-216 (reasonFor function)
- problem: The `reasonFor` function's fallback return value `"prerequisite did not pass"` can only be reached if a check's prerequisite chain ends at a check with `status: "pass"` but the original check was never set in `results`. In the current implementation, every check whose prerequisite passes is unconditionally set (always either pass/fail/error). The fallback is unreachable. If future code ever introduces a conditional check that can be unset even when its prerequisite passes, the generic message would silently appear.
- repro_or_impact: Currently unreachable — no test exercises this path. If someone adds a check (e.g., a future adoption-bundle check) whose evaluation is conditional and they forget to set it when the prerequisite passes, the generic "prerequisite did not pass" message would appear instead of a specific reason, masking the bug.
- smell: Speculative Generality (the fallback handles a case that cannot occur in the current design)

### Summary

No high-severity defects found. The implementation faithfully implements FS8 per the spec, the test suite is comprehensive (106 tests, all passing), and the key invariants (four-state exit mapping, canonical check order, skip pinning, secret safety, worktree isolation, sparse-checkout handling) are correctly enforced. The issues above are cosmetic, informational, or future-proofing concerns — none affect correctness, security, or the output contract.