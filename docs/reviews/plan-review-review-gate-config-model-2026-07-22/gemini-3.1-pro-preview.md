# Plan panel — google/gemini-3.1-pro-preview:xhigh

Target: docs/plans/2026-07-22-review-gate-config-model.md @ 66e38ee (main)

### Overrides Deep-Merge Contradiction

- severity: high
- confidence: high
- location: Open decisions (resolve in Spec) -> 1 and 3
- defect: The plan recommends that `overrides` deep-merge per dial (Decision 1) but also recommends that both `validate` and `approve` fields are required with no implicit defaults (Decision 3). If both fields are required by the config schema, partial overrides are invalid, making deep-merge functionally identical to full replacement and defeating the stated goal of "relaxing only one axis".
- evidence: Decision 1: "Recommendation: deep-merge per dial (a reversible track commonly wants to relax only one axis)". Decision 3: "Recommendation: both required, no implicit default."
- impact: Spec cannot satisfy both recommendations. If it makes fields required, users cannot author partial overrides.
- fix: Decide one path: allow partial dials in `overrides` (override fields optional) OR whole-dial replacement (abandon deep-merge).

CLEAR: A — Every DoD item is falsifiable and observable.
CLEAR: B — All stated outcomes have plausible verification paths via the test suite updates.
CLEAR: C — Scope boundaries are coherent; deferral of 'preview' avoids conflating the schema break with a new feature.
CLEAR: D — The deliberate amendment to the #150 desugar is flagged, internally consistent, and closes the "ignore findings" loophole.
CLEAR: E — Clean-break migration posture is declared and safe because downstream adopters (Case) pin the package.
CLEAR: F — Track classification is correct: irreversible is mandatory (persisted schema contract + version bump).
