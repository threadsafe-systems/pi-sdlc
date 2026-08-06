# PR panel round 1 — gpt-5.6-luna

Model: `openai-codex/gpt-5.6-luna:xhigh`. Base: `2aa5a89`; commit: `3e81a25`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### DSP14 handoff check accepts unrelated comments

- severity: medium
- confidence: high
- origin: NEW
- file: docs/validation/diff-scoped-test-premises/t2.json
- line: 46-52
- problem: The handoff check passes when any issue comment contains `DSP3`; it does not verify the premise-durability law, Spec link, or the required S1 handoff content.
- repro_or_impact: Removing the law and link from the #192 handoff while leaving an unrelated `DSP3` mention still yields PASS, falsely attesting DSP14.

### Detector mutation negatives are incomplete

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 112-124
- problem: DSP5 tests three positive samples and unrelated standalone negatives, but never mutates each positive into its required current-tree or fixture-`HEAD` equivalent as mandated by Spec C4.5.
- repro_or_impact: Adding `HEAD` to `mainLine` makes `git show HEAD:path` report as moving-ref code, yet all existing DSP5 assertions still pass because no `git show HEAD:path` negative is tested.
