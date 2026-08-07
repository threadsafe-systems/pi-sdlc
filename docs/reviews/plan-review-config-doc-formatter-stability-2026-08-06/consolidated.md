# Plan-panel adjudication — config-doc formatter stability

Plan: `docs/plans/2026-08-06-config-doc-formatter-stability.md`  
Track: irreversible  
Orchestrator: `anthropic/claude-opus-5`

## Artifact inventory

| logical wave | harvest round | reviewer | artifact | result |
| --- | ---: | --- | --- | --- |
| 1 | 1 | requested floor | `round1-infrastructure-failure.md` | generated agent absent; no model verdict |
| 1 | 2 | `claude-fable-5` | `round2-claude-fable-5.md` | 2 medium, 3 low |
| 1 | 2 | `gemini-3.1-pro-preview` | `round2-gemini-3.1-pro-preview.md` | clear |

Telemetry pairs `panel.dispatched{round:1,wave:1}` with the failed harvest and `panel.dispatched{round:2,wave:1}` with the replacement harvest. The two successful model verdicts satisfy the configured distinct-model floor.

## Findings

| id | severity | origin | defect | disposition |
| --- | --- | --- | --- | --- |
| `PLAN-R1-01` | medium | NEW | DoD says existing tests stay green while an existing assertion hardcodes v1 | **incorporated** — scope names the one current-version assertion update and DoD preserves all other behavior |
| `PLAN-R1-02` | medium | NEW | headline formatter-stability claim outruns the proxy-only verification path | **incorporated** — objective and evidence boundary now claim collision-free CommonMark spans for embedded backticks, not arbitrary formatter canonicalization; general formatter round-trip is explicit residual risk |
| `PLAN-R1-03` | low | NEW | amendment boundary omits the §12 v1 envelope and revision/approval mechanics | **incorporated** — scope covers §§12–14 plus a rev-3 header citing #177 and this slice's approved Spec |
| `PLAN-R1-04` | low | NEW | irreversible classification appears only as an assumption | **incorporated** — explicit Track declaration added beneath the title |
| `PLAN-R1-05` | low | NEW | full-suite proportionality clause has no numeric budget | **incorporated** — focused tests <1s; full `npm test` gets a 30s external timeout; zero model/network cost |

**Counts:** 2 medium, 3 low. Incorporated 5; dismissed 0; barred 0; carries 0.

Gemini independently returned CLEAR on all six review axes. Fable's findings were reproduced against `test/config-doc.test.js`, the base Specification, and workflow budgets before incorporation.

## Stop condition

No high or medium finding survives adjudication. No carry was minted. The Plan is ready for human approval.
