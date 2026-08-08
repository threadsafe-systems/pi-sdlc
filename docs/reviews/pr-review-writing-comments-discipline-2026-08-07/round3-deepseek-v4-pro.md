# PR panel round 3 — deepseek-v4-pro

Model: `deepseek/deepseek-v4-pro:xhigh`. Delta: `5a877da..491b35e`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

Now I have all the evidence. Let me compile my final findings.

---

### WC-R2-01: resolve-panel.mjs / validate-task.mjs removed from FROZEN, tests pass — REMEDIED

- severity: n/a (verification, not a finding)
- verdict: RESOLVED
- evidence: `test/frozen-surfaces.test.js:25-40` — `resolve-panel.mjs` and `validate-task.mjs` are no longer in the `FROZEN` array. `resolve-panel.sh` and `validate-task.sh` (the shell wrappers) remain in the array. `node --test test/frozen-surfaces.test.js` → 2/2 pass. Non-e2e full suite → 534/534 pass. `git diff base..HEAD` confirms only comment changes (`lt-t2` label removal) in the two `.mjs` files. Build plan amendment A3 accurately records the bounded reopening with post-merge re-freeze tracked by #222.

### WC-R2-02: redundant coexistence test deleted — REMEDIED

- severity: n/a (verification, not a finding)
- verdict: RESOLVED
- evidence: `test/setup-config-doc.test.js` no longer contains the `ASD20: optional telemetry and config-doc call sites coexist` test. The preceding test `ASD20: setup-sdlc.mjs carries the config-doc write call site` (lines 83-87) retains the real coverage: import check, write-call check, and asset-id check. `node --test test/setup-config-doc.test.js` → 5/5 pass.

### Process-history prose in frozen-surfaces header comment

- severity: low
- confidence: high
- origin: NEW
- file: test/frozen-surfaces.test.js
- line: 3-4
- problem: The header comment states "The PR reviewer prompt plus the two script implementations changed by the focused code-prose cleanup are absent from this list." The phrase "changed by the focused code-prose cleanup" is process-history provenance that states *why* items are absent rather than simply declaring their status. The code-prose discipline this feature branch enforces requires prose to serve the reader now without narrating past events (Plans, cleanup operations, issue references).
- repro_or_impact: A maintainer reading the header gets a historical narrative rather than a present-tense invariant. The staleness risk is low (the comment describes a deliberate absence that matches the array), but the prose pattern violates the reader-now law shipped in this very feature. The information is not wrong — only worded as provenance.
- smell: Speculative Generality (the "why" narration of a past event adds no present-tense invariant)
