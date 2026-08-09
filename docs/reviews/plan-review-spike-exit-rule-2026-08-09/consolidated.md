# Consolidated plan review — spike exit rule

- Date: 2026-08-09
- Track: irreversible
- Plan revisions reviewed: rev 1 at `fa6ef9e`; rev 2 at `ed05281`
- Orchestrator: `openai-codex/gpt-5.6-sol`
- Logical review waves: 1–2
- Panel floor: 2 distinct successful models
- Successful reviewers: `openai-codex/gpt-5.6-luna:xhigh`, `zai/glm-5.2:xhigh`
- Result through wave 2: 10 consolidated findings; 10 incorporated, 0 dismissed; no surviving high or medium

## Dispatch and harvest inventory

| Logical wave | Dispatch | Outcome | Harvest label | Telemetry |
|---|---|---|---:|---|
| 1 | `anthropic/claude-fable-5:xhigh` + `google/gemini-3.1-pro-preview:xhigh` | Fable transient 429 before verdict; Gemini non-transient depleted-credit 429 before verdict | 1 | `panel.dispatched` wave 1 |
| 1 | `openai-codex/gpt-5.6-luna:xhigh` replacing Gemini | verdict returned | 2 | `panel.dispatched` wave 1 |
| 1 | `anthropic/claude-fable-5:xhigh` retry | second transient 429 before verdict; retry exhausted | 3 | `panel.dispatched` wave 1 |
| 1 | `zai/glm-5.2:xhigh` replacing Fable | verdict returned | 4 | `panel.dispatched` wave 1 |
| 2 | `openai-codex/gpt-5.6-luna:xhigh` + `zai/glm-5.2:xhigh` | both verdicts returned | 5 | `panel.dispatched` wave 2 |

Harvest destinations are `.pi/sdlc/runs/spike-exit-rule/panels/plan_review-round<label>-2026-08-09/`; every `meta.json` records its logical wave. Labels 2–4 differ from wave 1 because replacement dispatches require non-overwriting destinations.

## Adjudication

| id | origin | severity | defect class | Raised by | Disposition | Adjudication |
|---|---|---|---|---|---|---|
| PLAN-R1-01 | NEW | high | contract ownership | Luna, GLM | incorporated | S4 assertions now append to `test/gate-presentation-contract.test.js`; GPC owns the existing gate block, S4 owns only the distinct spike block, and GPC10 covers both. |
| PLAN-R1-02 | NEW | high | routing ambiguity | Luna | incorporated | Scope now gives a falsifiable predicate for each route and applies it to every load-bearing uncertainty. The requested extra per-assumption table was not added because the locked gate allows exactly two artifacts; deterministic prose guidance supplies the classification without a third artifact or parser. |
| PLAN-R1-03 | NEW | medium | outcome ambiguity | Luna | incorporated | All direction × treatment combinations are legal only when provisional foundation/candidate treatment names the future or proceeding effort it serves; otherwise treatment reduces to reference/discard. |
| PLAN-R1-04 | NEW | medium | handoff omission | Luna | incorporated | Out of scope and next-agent context now route ceremony invocation, collapse estimation, and sizing implications explicitly to #158's build stream. |
| PLAN-R1-05 | NEW | medium | proportionality | Luna | incorporated | Every focused, static, corpus, and lifecycle check now carries an explicit external time budget. |
| PLAN-R1-06 | NEW | medium | amendment boundary | GLM | incorporated | Scope classifies the §8 addition as non-amending beside GPC C1, names the preserved invariants, and justifies §8 as the completion/transition owner rather than §1 dialogue craft. |
| PLAN-R1-07 | NEW | low | verifiability gap | GLM | incorporated | DoD now routes six-phase proof through the standing current-tree inventory test and telemetry/schema absence through the final-diff audit instead of leaving both as unowned claims. |
| PLAN-R1-08 | NEW | low | deferred dependency | GLM | incorporated | Assumptions now name the absence of a mandatory home for provisional retained code and the human-approved temporary location/link as a dependency pending the parked lifecycle follow-up. |

GLM's separate-file low finding was consolidated into PLAN-R1-01 because it is
the same contract-ownership defect already raised at high severity by Luna.

### Wave 2 delta adjudication

| id | origin | severity | defect class | Raised by | Disposition | Adjudication |
|---|---|---|---|---|---|---|
| PLAN-R2-01 | NEW | high | routing ambiguity | Luna | incorporated | The guide is now ordered and exhaustive: sufficient existing evidence → read; empirically undecidable → judgment; delivery-grade evidence → Plan/front-load; remaining empirical uncertainty → propose spike after checkpoint. Incomplete criteria remain in Brainstorm rather than creating a fifth route. |
| PLAN-R2-02 | NEW | low | gate overclaim | GLM | incorporated | The Biome command now names only the JavaScript file it actually checks; Markdown coverage is attributed to the focused contract corpus instead of Biome. |

Every round-1 fix was confirmed. No finding was reopened.

## Stop condition

All high and medium findings through wave 2 were incorporated into Plan rev 3.
No finding was dismissed, no owner-ratified decision was contradicted, and no
high or medium survives adjudication. A focused delta convergence round is
required because PLAN-R2-01 changes the core route precedence.
