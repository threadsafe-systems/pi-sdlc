### Overlapping routing predicates leave classifications ambiguous

- severity: high
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-09-spike-exit-rule.md:88-95`
- defect: The newly added predicates are neither mutually exclusive nor exhaustive: existing evidence can qualify for both **read** and **spike**, while empirical exploratory work without declared criteria matches none. No precedence or fallback is specified.
- evidence: The plan says evidence “already present” routes to **read**, exploratory work “with declared exit criteria” routes to **spike**, and calls this “deterministic prose guidance.”
- impact: Agents can route the same uncertainty differently or leave it in an unowned ad-hoc state, undermining the core exit rule.
- fix: Define an ordered, exhaustive classification rule; distinguish evidence sufficient to settle the uncertainty from evidence merely available, and specify the route when exploratory criteria are incomplete.

CLEAR: A — No additional delta-only DoD defect beyond the incorporated ownership and budget fixes.  
CLEAR: C — The delta remains one reference-block plus shared-contract-test slice with coherent scope.  
CLEAR: D — Owner-ratified Brainstorm decisions, including timebox/throwaway rejection and #158 routing, remain respected.  
CLEAR: E — The #158 handoff and provisional-retention dependency are now explicitly named.  
CLEAR: F — Irreversible classification remains appropriate for a public lifecycle-reference contract.  
CLEAR: PROPORTIONALITY — Focused, full-suite, lint, and reference checks have plausible explicit budgets; observed full-suite runtime was about 5 seconds.
