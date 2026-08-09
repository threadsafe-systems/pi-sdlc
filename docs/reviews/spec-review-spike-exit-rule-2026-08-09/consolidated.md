# Consolidated spec review — spike exit rule

- Date: 2026-08-09
- Track: irreversible
- Spec revision reviewed: rev 1 at `ecd5c47`
- Orchestrator/spec author: `openai-codex/gpt-5.6-sol`
- Logical review wave: 1
- Requested reviewers: `maas-qwen/deepseek-v4-flash-0732:high`, `openai-codex/gpt-5.6-terra:high`
- Successful reviewers: `maas-qwen/deepseek-v4-flash-0731:high`, `openai-codex/gpt-5.6-terra:high`
- Panel floor: 2 distinct successful models
- Result: 9 findings; 9 incorporated, 0 dismissed; no surviving high or medium

## Dispatch and harvest inventory

| Logical wave | Dispatch | Outcome | Harvest label | Telemetry |
|---|---|---|---:|---|
| 1 | owner-requested `deepseek-v4-flash-0732:high` + `gpt-5.6-terra:high` | 0732 returned non-transient `model_not_found`; Terra returned verdict | 1 | `panel.dispatched` wave 1 |
| 1 | adjacent available `deepseek-v4-flash-0731:high` replacing 0732 | verdict returned | 2 | `panel.dispatched` wave 1 |

Harvest destinations are `.pi/sdlc/runs/spike-exit-rule/panels/spec_review-round<label>-2026-08-09/`. DeepSeek 0732 was genuinely attempted as requested; the configured runtime does not expose that model id.

## Adjudication

| id | origin | severity | defect class | Raised by | Disposition | Adjudication |
|---|---|---|---|---|---|---|
| SPEC-R1-01 | NEW | high | exit-topology gap | Terra | incorporated | C3 now requires current exit criteria to be adequately met; C2 and SER6 block continuation, all direction selection, and Plan transition while criteria are inadequate. |
| SPEC-R1-02 | NEW | medium | verifiability gap | Terra | incorporated | C5/SER1 now add durable exact-set discovery for six phase references and six router templates rather than overclaiming the hard-coded phase-reference test. |
| SPEC-R1-03 | NEW | medium | lifecycle omission | Terra | incorporated | SER12 now includes `check-lifecycle` with its 5-second budget and committed Plan/Spec/Build precondition. |
| SPEC-R1-04 | NEW | medium | premise durability | Terra | incorporated | SER13/14 now bind to committed PR-review evidence, include replayable SHA/inventory/issue fields, and set zero-extra-model-call plus host-action/checklist budgets. |
| SPEC-R1-05 | NEW | medium | contract-boundary ambiguity | Terra | incorporated | C1 pins the literal `### Spike exit loop` boundary; C5 extracts only that block for SER ownership. |
| SPEC-R1-06 | NEW | medium | locked-decision omission | DeepSeek | incorporated | C1/F1/SER13 require §8's read route to name #147 as future mechanisation and explicitly outside S4. |
| SPEC-R1-07 | NEW | medium | composition guard | DeepSeek | incorporated | C1/SER1 preserve exactly one §8 mermaid fence and the literal `The next transition is **Plan**` GPC17 anchor. |
| SPEC-R1-08 | NEW | low | vocabulary omission | Terra | incorporated | Vocabulary now defines and binds `delivery-grade` and `human checkpoint`. |
| SPEC-R1-09 | NEW | low | falsifier ambiguity | DeepSeek | incorporated | SER3 now falsifies empirically answerable non-delivery-grade questions routed to judgment instead of spike. |

## Stop condition

Every round-1 finding was incorporated into Spec rev 2. None contradicted an
owner-ratified decision and none was dismissed. A delta convergence round is
required because SPEC-R1-01, SPEC-R1-02, and SPEC-R1-04 materially strengthen
exit semantics and verification contracts.
