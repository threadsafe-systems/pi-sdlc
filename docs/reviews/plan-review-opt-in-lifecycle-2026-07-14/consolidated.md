# Consolidated plan review — opt-in lifecycle (2026-07-14)

- Artifact: `docs/plans/2026-07-14-opt-in-lifecycle.md` @ 0703e76 (rev 1)
- Panel: openai-codex/gpt-5.6-sol:high, zai/glm-5.2:high, deepseek/deepseek-v4-pro:high (3 vendors; author vendor anthropic excluded)
- Orchestrating model: anthropic/claude (session orchestrator; also plan author — hence excluded from the panel)
- Verification: every load-bearing claim spot-checked against the tree before adjudication (ADR 0018:30 explicit-bump requirement; `test/check-lifecycle.test.js:37-43` fixture; absence of any `evidence.channels.json`; bare `actions/checkout@v4` in the shipped workflow) — all confirmed.

## Consolidated findings and adjudication

| # | Finding (deduped) | Raised by | Sev | Adjudication |
|---|---|---|---|---|
| 1 | DoD-1 "byte-for-byte" self-contradictory with the v2 evidence checks and envelope (existing repos with PV1 manifests + no evidence file would flip; schemaVersion/shape are byte changes; upstream #36 "safe-by-default" vs #40 "every profile" inconsistency) | all three | high | **Incorporated** — new "Binding migration decision" section: evidence checks keyed on `lifecycle`-block presence (the block is the v2 opt-in); byte-for-byte rescoped to semantics with explicit envelope caveat; fixture disposition made explicit. Refines the ratified #36/#40/#41 phrasings — flagged for owner sign-off at the plan gate. |
| 2 | Base-branch-tip shape unreadable on shipped paths (depth-1 checkout; no base-ref CLI input; local `--body`/flags modes have no defined shape source) | gpt + glm | high | **Incorporated** — scope item 6 gains named dependencies: base-ref input in event mode, workflow/setup fetch requirement (ADR 0020 terms), local-modes-judge-under-HEAD-with-fixed-disclosure rule; DoD-4 updated; risk added for consumer workflow drift. |
| 3 | Ratified setup `recommendation:` nudge line mutates the frozen FS10 v1 report (ADR 0018 requires explicit bump) | gpt | high | **Incorporated** — scope item 5 + DoD-9: ships via explicit FS10 schema-version bump + ADR 0018 revision. |
| 4 | Existing adopters have no safe path to select a profile (setup retains-or-`--force`-replaces whole config) | gpt | med | **Incorporated** — scope item 3: non-destructive application (add/replace only the `lifecycle` key, preserve consumer-owned config, FS10 refusal semantics); DoD-2 updated. Richer tune UX stays deferred. |
| 5 | `custom` mis-transcribed as a fourth preset (#37: custom = no preset, hand-picked dials) | gpt (+deepseek adjacent) | med | **Incorporated** — three presets + custom interview path; DoD-2 rewritten (representative hand-picked custom shape validates). |
| 6 | Standalone `pr-review` "minus the profile floor" could bypass an adopted repo's committed floors | gpt | med | **Incorporated** — fixed default qualified unadopted-only; adopted runs at committed mode/floors; DoD-7 gains the falsifier. |
| 7 | Track rationale says "widens the FS9 declaration/checker contract" — declaration does NOT widen (ratified #40 headline) | glm | med | **Incorporated** — header reworded: checker widens; declaration grammar v1 frozen. |
| 8 | No Spec decomposition/ordering for a 7-deliverable, 6-surface stream (prior smaller stream was force-split) | glm | med | **Incorporated** — "Spec decomposition" section: OL-A config vocabulary → OL-B v2 checking surface → OL-C skill surface, each independently gated; scenario-id prefixes OLA/OLB/OLC. |
| 9 | `task_validate` floor undefined when `lifecycle` present (not a `gates` key; models-file `min_panel` deprecated) | deepseek | high | **Incorporated** — scope item 2 + DoD-5: fixed 1/1 floor under `subagent`/`self` with deprecation notice; `resolve-panel` never invoked under `off`. |
| 10 | Epic #18 dependency not explicit | deepseek | med | **Incorporated** — "Dependencies" section (precondition satisfied: #18 closed; post-merge defect fixes trigger plan re-check). |
| 11 | Evidence applicability rules missing from DoD-4 (skip `none`; reversible iff non-empty PV1 union) | deepseek | med | **Incorporated** — scope item 6 + DoD-4 carry the #41 applicability rules verbatim, plus the block-presence gate from finding 1. |
| 12 | Reviewer × arbiter enum-growth constraint not a falsifiable DoD item | glm | low | **Incorporated** — DoD-8 added (Spec scenario, not prose). |
| 13 | "build"/"tasks" naming asymmetry reads as a contradiction between scope items 4 and 7 | deepseek | low | **Incorporated** — clarifying parenthetical in scope item 4. |
| 14 | Solo advisory panel still needs one live credential | deepseek (residual) | low | **Incorporated** — Risks section. |

**Dismissed: none.** All findings verified genuine; rev 2 (this commit) incorporates all 14.

## Stop condition

No high or medium finding survives adjudication (all incorporated in rev 2). Panel does not need to re-run unless the owner rejects rev 2's Binding migration decision, which alters finding 1's resolution.

## CLEAR attestations of note

- All three reviewers independently attested the **irreversible track classification is correct** (CLEAR: F).
- deepseek attested no ratified decision is re-opened or contradicted (CLEAR: D) — findings are transcription/precision defects, not design flaws.
