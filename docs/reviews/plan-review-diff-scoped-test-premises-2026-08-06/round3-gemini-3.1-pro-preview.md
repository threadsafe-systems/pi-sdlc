# Plan panel round 3 (delta) — gemini-3.1-pro-preview

Model: `gemini-3.1-pro-preview`. Delta: `bcba627..8091fc8`.

### Call-shape detector misses detached-fixture false positive
- severity: high
- confidence: high
- origin: NEW
- location: § "The refinement the panel forced: moving ref vs pinned commit, matched by call shape" (measurement table and git-stub list)
- defect: The plan claims the call-shape detector yields 0 false positives and asserts `telemetry-emitter.test.js` is "not a match at all, so they need neither a fix nor an exemption", but the file contains a direct textual match for the detector.
- evidence: `test/telemetry-emitter.test.js:288` invokes `execFileSync("git", ["-C", detached, "rev-parse", "HEAD"])`; the plan's own concept table explicitly defines `HEAD` as a moving ref.
- impact: Factual contradiction in the plan's measurement. Implementing the detector exactly as specified will flag this file (because it textually names `HEAD`), breaking the CI, but the plan explicitly forbids S1 from adding an exemption for it.
- fix: Update the table to acknowledge 1 false positive, explicitly identify `telemetry-emitter.test.js:288` (detached fixture manipulation) as exemption 3, and remove it from the "not a match at all" list.
`PLAN-R2-01`: discharged
`PLAN-R2-02`: discharged
`PLAN-R2-03`: discharged
`PLAN-R2-04`: discharged
`PLAN-R2-05`: discharged
`PLAN-R2-06`: discharged
CLEAR: A — all DoD items are concrete and falsifiable.
CLEAR: B — outcomes are mechanically verifiable.
CLEAR: C — scope is coherent and bounded.
CLEAR: D — respects locked decisions.
CLEAR: E — no other missing risks found.
CLEAR: F — properly classified as irreversible.
CLEAR: PROPORTIONALITY — time budget is strictly bounded to <1s without external calls.
