# PR panel round 4 — deepseek-v4-pro

Model: `deepseek/deepseek-v4-pro:xhigh`. Delta: `491b35e..51c00a9`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

All evidence gathered. Here are my findings:

---

### WC-R3-01 regression: frozen-surfaces header no longer accounts for reviewer prompts in FROZEN array

- severity: low
- confidence: high
- origin: NEW
- file: test/frozen-surfaces.test.js
- line: 1-5
- problem: The WC-R3-01 fix rewrote the header to remove process-history narration, but also dropped the explicit enumeration "plan/spec reviewer prompts, the task validator prompt" that accounted for three FROZEN entries (adversary-plan.prompt.md, adversary-spec.prompt.md, validator-task.prompt.md). The new header's categories — "readiness/lifecycle scripts, config and validation contracts, unchanged panel and validator surfaces, and shared panel law" — cover only 10 of 14 FROZEN entries. The trailing sentence "Reviewer prompts carry their rules inline because reviewer subagents do not inherit the lifecycle skill" describes a rationale for how prompts work, not their status as protected frozen surfaces. A reader cannot determine from the header alone that three reviewer prompts are frozen.
- repro_or_impact: The old header (at 491b35e) explicitly listed "plan/spec reviewer prompts, the task validator prompt" alongside the other categories. The new header (at 51c00a9) drops them. A maintainer scanning the header would incorrectly conclude the FROZEN array contains only scripts, contracts, surfaces, and law — missing the three prompts and `verify-task-receipt.mjs`. The FROZEN array remains the authoritative source, so no test fails.

---

### WC-R3-01: process-history narration removed — RESOLVED

- severity: n/a (verification)
- verdict: RESOLVED
- evidence: test/frozen-surfaces.test.js:1-5 — the phrase "changed by the focused code-prose cleanup" and the narration of absent files are gone. The header now states "The bounded exclusion set is asserted as one coherent unit below" which is a present-tense description of the current mechanism. However, see NEW finding above for a documentation regression introduced by the same edit.

### WC-R3-02: three-surface coherence assertion added — RESOLVED

- severity: n/a (verification)
- verdict: RESOLVED
- evidence: test/frozen-surfaces.test.js:34 — `BOUNDED_EXCLUSIONS` now contains all three surfaces (adversary-review.prompt.md, resolve-panel.mjs, validate-task.mjs). Line 53-55 — the coherence assertion iterates all three and asserts none is in FROZEN. Combined with the existing git-diff test (which would catch a changed file re-entering FROZEN), the tripwire now covers all three exclusions during the feature branch's lifetime. Build plan amendment A3 accurately records the mechanism. `node --test test/frozen-surfaces.test.js` → 3/3 pass.

### WC-R3-03: telemetry-preservation claim removed — RESOLVED

- severity: n/a (verification)
- verdict: RESOLVED
- evidence: test/setup-config-doc.test.js:1-4 — the header no longer contains "(with any already-landed telemetry call sites preserved)". It now reads "config-doc import, write call, and reported asset remain present" which matches the actual ASD20 test assertions (import check, write-call check, asset-id check). `node --test test/setup-config-doc.test.js` → 5/5 pass.

---

**No high-severity findings. No medium-severity findings.**
