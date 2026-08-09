CONFIRMED: PLAN-R2-01 — Ordered route precedence and the remain-in-Brainstorm fallback are present.

CONFIRMED: PLAN-R2-02 — Biome now targets only the JavaScript test file.

### Delivery-grade uncertainties can be diverted to human judgment

- severity: high
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-09-spike-exit-rule.md:88-101`
- defect: The new precedence routes every uncertainty with no empirically settling evidence to human judgment before checking whether it requires detailed requirements or delivery acceptance. That conflicts with the owner-ratified rule that delivery-grade criteria route toward Plan.
- evidence: Lines 90-92 place human judgment before Plan; lines 46 and 100-101 state that detailed requirements or delivery acceptance criteria route toward Plan.
- impact: A delivery-grade uncertainty can be labeled judgment-only, bypassing Plan/front-loaded risk and freezing contradictory routing semantics.
- fix: Define the overlap explicitly, routing delivery-grade requirements/acceptance needs to Plan before the judgment fallback.

CLEAR: A — DoD items remain falsifiable through contract tests, audits, or bounded commands.

CLEAR: B — Objective outcomes have plausible verification paths.

CLEAR: C — Scope remains a single Brainstorm-reference and contract-test slice.

CLEAR: E — No additional delta-specific dependency or migration defect found.

CLEAR: F — Irreversible classification remains appropriate for the public lifecycle reference.

CLEAR: PROPORTIONALITY — Verification commands have explicit, plausible budgets and observed runs are within them.
