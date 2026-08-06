# PR panel round 2 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `8cf8a2c..2fa27b3`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

## Verification of prior findings (delta 8cf8a2c..2fa27b3, fixes at f3c5a10)

### PR-R1-01 — v1 fixture not byte-pinned (test/config-doc.test.js:20,127)

- verdict: RESOLVED
- evidence: `test/config-doc.test.js:20` pins `V1_FIXTURE_SHA256 = 1af2ec94…3ae4f46e` and line 127 asserts `createHash("sha256").update(legacyBody)` equals it before CDFS7 runs. Recomputed `sha256sum test/fixtures/config-doc/v1-valid-config.md` → `1af2ec94ecad30a6e6bdec3c4684d0ae0ca14f3678bc898a2682a6043ae4f46e` (exact match), and an in-memory single-byte flip of the fixture bytes no longer matches the pin — any hand edit anywhere in the file now fails the suite, closing the "only the sentinel line was constrained" gap. Build amendment A2 (`docs/plans/2026-08-06-config-doc-formatter-stability-build.md:118–124`) records the DoD replacement, and the T1 DoD line (line 37) now states the SHA-256 pin instead of the provenance-comment requirement, so the DoD and the code agree.

### PR-R1-02 — spread into `Math.max` can exceed V8's argument limit (skills/sdlc/scripts/config-doc.mjs:146)

- verdict: RESOLVED
- evidence: `codeSpan` now iterates `value.matchAll(/`+/g)` updating one scalar (`config-doc.mjs:146–147`); argument count is constant. Repro confirmed the witness is genuine, not theatre: the OLD spread implementation on `"`a".repeat(150000)` throws `RangeError: Maximum call stack size exceeded`; the new loop returns `maxRun = 1` in ~19ms. The committed witness test ("CDFS2: many separated backtick runs do not overflow delimiter selection", `test/config-doc.test.js:92–95`) passes at HEAD and would have failed against the old code. Semantics are otherwise identical (same init 0, same run lengths).

### PR-R1-03 — `codeSpan` no-padding precondition undocumented (skills/sdlc/scripts/config-doc.mjs:149)

- verdict: RESOLVED
- evidence: Line 149 now carries `// JSON tokens never start or end with backticks or spaces, so CommonMark needs no boundary padding.` I verified the comment is accurate for the helper's actual domain: the sole call site (line 160) passes `JSON.stringify(config[key])`, whose output can never begin/end with a backtick or space. Also re-ran the CommonMark pairing scan on the HEAD `.pi/sdlc/CONFIG.md` panels line: backtick runs `1,1,2,1,1,2` → exactly 2 paired spans (key + intact value), so the rendered output remains valid CommonMark.

### PR-R1-04 — PR body reports stale test counts (/tmp/config-doc-formatter-stability-pr.md:28–30)

- verdict: RESOLVED
- evidence: PR body now claims 528 / 25 / 55. Reproduced all three at 2fa27b3: `npm test` → 528 pass, 0 fail (~7.8s, within the 30s budget); `node --test test/config-doc.test.js` → 25 pass; combined with `test/iteration-disposition.test.js` → 55 pass. The committed T1/T2 runner reports record the same numbers, so the PR's headline claims now match the head commit.

### Delta-wide re-checks (clean)

- **Receipts recomputed:** for both T1 and T2, `manifestSha256`, `runnerReportSha256`, and `generatedAgentSha256` in `receipt.json` match freshly computed SHA-256 of the committed files; runner/validator verdicts PASS/PASS; refreshed runner reports embed the new CDFS2 witness and the 528/25/55 counts.
- **Current v2:** `config-doc check --repo-root . --format json` → `state: current`, v2, fingerprint `e6a9…ccda9d` matching `expectedFingerprint`.
- **Carries:** repo grep across this feature's plan/spec/build/review records finds no `CARRY-TO-*` minted (only "no carry" statements) — nothing to land, nothing undischarged.
- **Stacked base:** `f112573` and `8cf8a2c` are both ancestors of `2fa27b3`; the delta touches only formatter-stability files, no #213 files, no ASD19-frozen surfaces (sentinel grammar, canonicalJson, CLI exits untouched by the 4-line code change).
- **Tree:** `git status --porcelain` is clean; no probe files.

### NEW DEFECTS

### Overflow witness's assertion is prefix-only and would pass an over-long-delimiter regression

- severity: low
- confidence: high
- origin: NEW
- file: test/config-doc.test.js
- line: 94
- problem: The new witness asserts `assert.match(keyLine(...), /^- \*\*`panels`\*\* = ``/)` — an unanchored-suffix prefix match. I confirmed by direct repro that a hypothetical regression producing a maxRun+2 delimiter (```` ``` ````) still satisfies this regex, and the test asserts nothing about value preservation at this scale. The test's real guard is only "does not throw."
- repro_or_impact: `/^- \*\*`panels`\*\* = ``/.test("- **`panels`** = ```{...}```")` → `true`. Impact is bounded: exact delimiter selection and byte preservation are pinned at small scale by CDFS1/CDFS2/CDFS3 and the shared helper makes divergent large-scale behavior implausible, so this only weakens the witness, not the contract. Tightening to the exact expected line (as CDFS1 does at line 81) would make the witness self-contained.

No high- or medium-severity new defects found in the delta.
