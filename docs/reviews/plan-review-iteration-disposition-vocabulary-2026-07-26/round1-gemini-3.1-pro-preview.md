# plan_review round 1 — google/gemini-3.1-pro-preview:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `7c2ae92`.
Verbatim reviewer output.

---

### Missing time budget for new CI verification machinery

- severity: medium
- confidence: high
- location: Scope In #9
- defect: The plan introduces new CI verification scenarios for the glossary and citations without stating a time or cost budget.
- evidence: Scope In #9 delegates the check creation ("Exact scenario ids are the Spec's to fix") but fails to provide a runtime bound, violating the PROPORTIONALITY attack surface rule for CI gating machinery.
- impact: The new test suite could run unbounded or ratchet CI costs disproportionately without an explicit constraint.
- fix: Add a strict time budget (e.g., `timeout-minutes: 5`) to the test requirement in Scope In #9.

### Mismatched count of retained workflow rules makes DoD unsatisfiable

- severity: low
- confidence: high
- location: Scope In #10 and DoD 6
- defect: The plan claims there are "five retained ones" to keep verbatim in `workflow.md`, but there are actually six distinct unpromoted rules/blocks.
- evidence: `.pi/sdlc/workflow.md` currently contains (1) Price every verification scenario, (2) Keep spec altitude, (3) PROPORTIONALITY blockquote, (4) Identity discipline, (5) Artifact discipline, and (6) Writing comments.
- impact: DoD 6 cannot be satisfied "verbatim" because an implementer will either fail the count verification or silently drop one rule to force the count to 5.
- fix: Update Scope In #10 and DoD 6 to state "six retained rules" or explicitly name which of the six is being deleted.

CLEAR: A — All other DoD items are falsifiable, observable, and concrete.
CLEAR: B — The outcome of bounded convergence delegates its proof to explicit deferred telemetry, avoiding false claims at merge.
CLEAR: D — The plan explicitly adheres to the locked `#190 → #191` pattern for modifying and re-freezing locked prompt surfaces.
CLEAR: E — The proposed amendment classes and carry destinations correctly manage the risk of dropped findings across gates without requiring immediate mechanical enforcement.
CLEAR: F — The plan accurately claims the irreversible track for modifying locked prompts and system mechanics.
