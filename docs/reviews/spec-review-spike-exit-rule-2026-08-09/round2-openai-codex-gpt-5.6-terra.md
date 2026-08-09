CONFIRMED: SPEC-R1-01–09 — amended contracts/scenarios contain the stated exit, topology, lifecycle, durability, block-boundary, #147, GPC-anchor, vocabulary, and SER3 fixes; SPEC-R1-04’s remaining budget gap is below.

### PR-panel inspection has no time budget

- severity: medium
- confidence: high
- origin: REOPENED(SPEC-R1-04)
- location: `docs/specs/2026-08-09-spike-exit-rule.md:307-322` (SER13)
- defect: SER13 bounds incremental model calls and checklist rows but gives no time budget for its PR-gate inspection.
- evidence: SER13 specifies “zero extra reviewers/model calls and at most one checklist row per reviewer” but no deadline. `.pi/sdlc/workflow.md:5-8` requires every release-gate scenario to state an explicit time budget.
- impact: The mandatory inspection can consume unbounded gate time despite the claimed proportionality controls.
- fix: Add an explicit SER13 time budget and falsify inspection completion beyond it.

### Spec header contains panel-history narrative

- severity: low
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md:3`
- defect: The status line says the spec is “incorporating every spec-panel round-1 finding,” embedding review history in the Spec.
- evidence: `.pi/sdlc/workflow.md:12-14` requires panel history to live only in the review artifact; the committed `docs/reviews/spec-review-spike-exit-rule-2026-08-09/consolidated.md` is that artifact.
- impact: The contract artifact accumulates mutable adjudication narrative rather than remaining at contract altitude.
- fix: Remove the round-1-incorporation clause from the Spec header.

CLEAR: A — Frozen routing, checkpoint, direction, treatment, and evidence shapes match the owner-ratified Plan.

CLEAR: B — All 14 scenarios retain one kind label and the required Given/When–Then/Falsify form.

CLEAR: C — C1–C5 each contain every required Contracts cell, with stable interfaces and error semantics.

CLEAR: D — The amended routing order and terminology remain consistent with Plan rev 4.

CLEAR: E — The specified §8 addition composes with the existing GPC owner and frozen-surface boundaries.

CLEAR: G — Substantive feature claims remain backed by specified mechanisms and scenarios.

CLEAR: H — No inbound `CARRY-TO-SPEC` was minted; SER14 remains correctly carried to `pr_review`.
