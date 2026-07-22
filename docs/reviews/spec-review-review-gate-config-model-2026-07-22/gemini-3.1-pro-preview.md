# Spec panel — google/gemini-3.1-pro-preview:xhigh

Target: docs/specs/2026-07-22-review-gate-config-model.md @ 66e38ee

(First dispatch returned EMPTY OUTPUT — infra failure; retried once per the
dispatch-recovery rule. The retry produced the verdict below.)

1. HIGH — §2 surface inventory misses v3-hardcoded test fixtures:
   test/fs8-helpers.js:16 (VALID_CONFIG schemaVersion 3 + design:"panel"),
   test/hooks.test.js:24, test/telemetry-side-effects.test.js:78,
   test/installed-consumer.test.js:60, test/check-lifecycle-git.test.js:21,
   test/check-completion.test.js, test/readiness-lib.test.js. Un-updated fixtures
   break S16.
2. MEDIUM — S9's ban on the word `advisory` over-fails on legitimate non-gate
   usage: SKILL.md:43 "advisory mode", resolve-panel.mjs:154 `advisory[${phase}]:`
   log prefix. Restrict to gate value/grammar.

CLEAR: A — Frozen shapes match the plan field by field; additionalProperties:false coherent.
CLEAR: B — Scenarios (aside from S9) are falsifiable with real covering tests.
CLEAR: C — Contracts buildable; validateReviewDial can differentiate base/override via its `at` parameter.
CLEAR: D — No internal contradictions.
CLEAR: E — Framework reality correctly represented.
CLEAR: F — NFRs correctly tied to scenarios.
CLEAR: G — Honesty sweep passed.
