# Plan panel round 2 (delta) — gemini-3.1-pro-preview

Model: `gemini-3.1-pro-preview`. Delta: `5eb2567..bcba627`.

- PLAN-R1-01: Confirmed — Rev 2 ran the sweep at HEAD, updated the design to the sharper moving-ref vs pinned-commit rule, and inventoried the results.
- PLAN-R1-02: Confirmed — DoD 5 is now a decidable three-way rule with a verifiable "meta-test passes" condition.
- PLAN-R1-03: Confirmed — DoD 6 now mandates a standing scenario to guard the law's presence in §4, plus a comment on #192.
- PLAN-R1-04: Confirmed — Objective 3 explicitly requires non-literal pattern assembly and an inline-mutation proof instead of an on-disk fixture.
### Uninventoried false positive on `main:` token
- severity: high
- confidence: high
- origin: NEW
- location: Objective 3 and Assumption 3
- defect: The plan claims the exemption inventory is complete based on a sweep at HEAD, but the defined search token `main:` produces 13 uninventoried false positives.
- evidence: `git grep "main:" test/` returns 13 matches in test names in `test/tracker-ops.test.js` (e.g., `test("main: dispatches find-items end to end", () => {`).
- impact: The meta-test will fail on `tracker-ops.test.js`. The implementer must either change the token definition (violating Objective 3) or add an uninventoried exemption (violating Assumption 3).
- fix: Refine the `main:` token in Objective 3 (e.g., limiting to git command arguments) or add `test/tracker-ops.test.js` to the exemption inventory with a reason.
### Diff guard dropped from sweep exclusion
- severity: medium
- confidence: high
- origin: NEW
- location: Objective 3 and Rationale
- defect: Rev 2 dropped Rev 1's explicit exclusion of the diff guard from the sweep, replacing it with an exemption list, but failed to include the diff guard in that list.
- evidence: Objective 3 scans "any file under `test/` that is not in its exemption list." The Rationale explicitly limits this by "carrying the three exemptions inventoried above" (which omits `test/frozen-surfaces.test.js`, despite it containing `merge-base`, `origin/main`, and `baseRef(`).
- impact: The diff guard will fail its own meta-test unless the implementer either adds a fourth uninventoried exemption or silently restores Rev 1's global exclusion, both of which contradict the strict "three exemptions" wording in the Rationale.
- fix: Restore Rev 1's explicit exclusion of `test/frozen-surfaces.test.js` from the sweep in Objective 3, or explicitly add it as the fourth item in the exemption inventory.
CLEAR: A — All new and modified DoD items are falsifiable and decidable.
CLEAR: B — Every outcome has a plausible verification path (e.g., suite passing, files untouched).
CLEAR: C — Scope boundaries are coherent; in and out of scope do not contradict.
CLEAR: D — No locked decisions from the governing docs or the brainstorm are contradicted.
CLEAR: F — Track classification (irreversible) is correct as it explicitly does not modify the frozen surface list.
