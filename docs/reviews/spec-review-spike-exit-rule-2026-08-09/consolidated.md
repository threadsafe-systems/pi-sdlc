# Consolidated spec review — spike exit rule

- Date: 2026-08-09
- Track: irreversible
- Spec revisions reviewed: rev 1 at `ecd5c47`; rev 2 at `b8ad46c`; rev 3 at `59e3712`
- Orchestrator/spec author: `openai-codex/gpt-5.6-sol`
- Logical review waves: 1–3
- Requested reviewers: `maas-qwen/deepseek-v4-flash-0732:high`, `openai-codex/gpt-5.6-terra:high`
- Successful reviewers: `maas-qwen/deepseek-v4-flash-0731:high`, `openai-codex/gpt-5.6-terra:high`
- Panel floor: 2 distinct successful models
- Result through wave 3: 15 findings; 15 incorporated, 0 dismissed; no surviving high or medium

## Dispatch and harvest inventory

| Logical wave | Dispatch | Outcome | Harvest label | Telemetry |
|---|---|---|---:|---|
| 1 | owner-requested `deepseek-v4-flash-0732:high` + `gpt-5.6-terra:high` | 0732 returned non-transient `model_not_found`; Terra returned verdict | 1 | `panel.dispatched` wave 1 |
| 1 | adjacent available `deepseek-v4-flash-0731:high` replacing 0732 | verdict returned | 2 | `panel.dispatched` wave 1 |
| 2 | `deepseek-v4-flash-0731:high` + `gpt-5.6-terra:high` | both verdicts returned | 3 | `panel.dispatched` wave 2 |
| 3 | `deepseek-v4-flash-0731:high` + `gpt-5.6-terra:high` | both verdicts returned | 4 | `panel.dispatched` wave 3 |

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

### Wave 2 delta adjudication

| id | origin | severity | defect class | Raised by | Disposition | Adjudication |
|---|---|---|---|---|---|---|
| SPEC-R2-01 | NEW | medium | mechanical coverage | DeepSeek | incorporated | SER2 now mechanically asserts the #147 future-work anchor in the extracted spike block and falsifies omission or implementation. |
| SPEC-R2-02 | NEW | medium | boundary ambiguity | DeepSeek | incorporated | C1/C5 now define the block through the next heading of level 3 or shallower using `^#{2,3}[ ]`; deeper subheadings remain inside. |
| SPEC-R2-03 | REOPENED(SPEC-R1-04) | medium | proportionality | Terra | incorporated | SER13 adds a 5-minute adjudication budget after outputs are available and falsifies an overrun. |
| SPEC-R2-04 | NEW | low | artifact narration | Terra | incorporated | The Spec status is contract-only (`rev 3`); panel history remains solely in this review artifact. |

All nine wave-1 fixes were confirmed.

### Wave 3 delta adjudication

| id | origin | severity | defect class | Raised by | Disposition | Adjudication |
|---|---|---|---|---|---|---|
| SPEC-R3-01 | NEW | medium | premise durability | Terra | incorporated | SER13/14 now require the committed review record to retain output-availability/action start/finish timestamps and incremental model-call counts, making time/cost falsifiers replayable after merge. |
| SPEC-R3-02 | NEW | low | boundary terminology | DeepSeek | incorporated | C1 now says exactly “level 2 or 3,” matching its `##`/`###` parenthetical and C5's `^#{2,3}[ ]` regex. |

Every wave-2 fix was confirmed.

## Stop condition

Every finding through wave 3 was incorporated into Spec rev 4. None contradicted
an owner-ratified decision and none was dismissed. Wave 4 is the final permitted
convergence round; a surviving high or medium triggers round-cap diagnosis
rather than a fifth dispatch.
