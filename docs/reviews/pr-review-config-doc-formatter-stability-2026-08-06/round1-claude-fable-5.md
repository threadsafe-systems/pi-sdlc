# PR panel round 1 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `f112573..8cf8a2c`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### v1 fixture is not byte-pinned by any test and lacks the build-plan-mandated provenance comment

- severity: medium
- confidence: high
- origin: NEW
- file: test/config-doc.test.js
- line: 18, 113–120
- problem: Build plan T1 DoD says "The v1 fixture is provenance-commented by test code, not hand-edited after capture," and Spec §4 calls the fixture "byte-pinned." Neither holds mechanically: `grep c3fd2a1 test/` finds nothing (no provenance comment anywhere in test code), and the only assertion on the fixture's content is a regex over the first sentinel line (`assert.match(legacyBody, /^<!-- pi-sdlc:config-doc v1 fingerprint=47b6... -->/)`). Every byte below line 1 is unconstrained — CDFS7's stale→regenerate outcome depends only on the recognized v1 sentinel, so any hand edit to the fixture body would pass all 24 tests unchanged.
- repro_or_impact: I confirmed the current fixture IS byte-identical to the base (f112573 == c3fd2a1 renderer) v1 render of `VALID_CONFIG` (sha and full diff clean; fingerprint recomputes to `47b6…f79c82`), so today's provenance is honest. But the guard the Spec claims ("byte-pinned") does not exist: mutate any body line of `test/fixtures/config-doc/v1-valid-config.md` below the sentinel and `node --test test/config-doc.test.js` still passes 24/24. The compatibility evidence then silently stops being "a real v1 render" and becomes "any file with a v1 sentinel." Add a body-hash assertion (or a provenance comment naming c3fd2a1 plus a pinned sha256 of the fixture) to close the DoD gap.

### `codeSpan` silently produces invalid CommonMark for backtick-edged/space-edged content; the load-bearing precondition is uncommented

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/config-doc.mjs
- line: 145–149
- problem: `codeSpan` omits the standard CommonMark space-padding rule. For content beginning or ending with a backtick, the delimiter merges with the edge run (e.g. content `` `x `` → output ``` ```x`` ```: opening run length 3, closing 2 — no valid code span); content edged with spaces would be stripped by CommonMark's boundary rule. This is safe today only because every call site passes `JSON.stringify` output, which can never begin/end with a backtick or space — but that invariant is stated only in the Spec (§3), not at the helper, and the repo's own comment standard (build plan Assumption 4: comments explain invariants) as well as the file's other helpers (`parseSentinel`, `isSymlink`, `readCompanion` all carry invariant comments) call for it.
- repro_or_impact: A future in-file reuse of `codeSpan` for a non-JSON string (a key name, a reason string, a doc fragment) reintroduces exactly the class of malformed-span bug #177 fixes, with no test tripping. One comment line (or an assertion on the edge bytes) removes the trap.

### PR document's validation claim "npm test — 526 pass" does not reproduce at HEAD

- severity: low
- confidence: high
- origin: NEW
- file: /tmp/config-doc-formatter-stability-pr.md (Validation section)
- line: 28
- problem: At 8cf8a2c, `npm test` yields **527** pass (I ran it: 527 pass, 0 fail, ~7.8s). The T2 runner report committed in this very branch (`docs/reviews/task-validate-config-doc-formatter-stability-t2-2026-08-06/runner-report.json`) also records 527; only the earlier T1 run shows 526. The PR text copies the stale T1 number.
- repro_or_impact: `cd <worktree> && npm test` → `ℹ pass 527`. Trivial, but the PR's headline validation claim should match the head commit it ships; the doc-driven test count evidently grows as review records land, so the number should be restated (or stated as "526→527 across T1/T2").

### No high-severity findings

Adversarial checks that came back clean (verified, not assumed):

- **Regression replay (real):** rendered the real `sdlc.config.json` through the base v1 renderer and scanned backtick runs with a CommonMark-pairing scanner — the v1 `panels` line garbles into 3+ spans (value split at `` `pi --list-models` ``); the committed v2 line parses as exactly 2 spans with the full JSON token intact. #177 is genuinely fixed for the recorded shape.
- **Adaptive-span correctness for the actual domain:** `JSON.stringify` of any JSON value never begins/ends with a backtick or space and never contains a raw newline, so maxRun+1 delimiters are sufficient here; the Spec's bounding claim (§3) is correct as bounded.
- **Fixture provenance:** byte-identical to the pre-change renderer's `VALID_CONFIG` output; fingerprint `47b6…` recomputes exactly; `c3fd2a1` and stacked base `f112573` have identical `config-doc.mjs`.
- **v1/v2 compatibility matrix:** v1 recognized→stale→regenerated without `--force`; unsupported v3 → check error/2, write refused/3, file unmutated (tests exercise the real fixture file, not a synthesized sentinel). Sentinel grammar, canonicalJson, collision/symlink matrix, CLI exits, and JSON envelope schemaVersion all unchanged (frozen surfaces intact).
- **Generated output:** `config-doc check --repo-root .` at HEAD → `current`, v2, fingerprint `e6a9…ccda9d` matching the committed sentinel; only the `panels` line and identity lines changed in CONFIG.md.
- **Normative consistency:** rev-3 amendment of the original spec updates §12 example, §13 identity (`v2` current, `{v1,v2}` supported), §14 adaptive-span sentence; no stale "v1 is current" statement remains; CDFS12's regexes match the actual amended text.
- **Receipts/manifests:** sha256 of both manifests, runner reports, and generated agents match their receipts; runner verdicts PASS with real per-check exit codes within declared budgets (30s full-suite ceiling vs ~7.8s observed).
- **Carries:** no `CARRY-TO-*` minted anywhere in this run's plan/spec/build/review records (repo-wide grep confirms only "no carry" statements) — nothing to land, nothing undischarged.
- **Stacked base:** f112573 is an ancestor of 8cf8a2c; the delta touches no #213 files; "retarget to main after #213" is recorded.
