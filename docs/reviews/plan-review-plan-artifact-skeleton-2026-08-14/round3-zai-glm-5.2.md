# Round 3 delta review — plan rev 3 (e07922d), range 47a6832..e07922d

## Findings (NEW)

### Assumption 4's "named permitted change classes" enumeration is stale after this delta

- severity: low
- confidence: high
- location: Assumptions §4 ("Frozen-surface discipline") vs Scope items 3, 7 and DoD 7
- defect: Assumption 4 enumerates the permitted change classes as "the deliberate `adversary-plan.prompt.md` unfreeze with the paired IDV19 reconciliation, the inventory row, and the contract tests" — but this delta adds a fourth named change class (the one-line C2-supersession entry in `docs/specs/2026-08-09-gate-presentation-contract.md`'s Amendments, Scope item 3 / DoD 7 / Context) and rev 2 added two more (the GPC2 pin update and the M5 81→82 amendment in `test/spec-artifact-skeleton.test.js`), none of which the enumeration carries.
- evidence: plan Assumptions §4 verbatim: "the deliberate `adversary-plan.prompt.md` unfreeze with the paired IDV19 reconciliation, the inventory row, and the contract tests are the named permitted change classes"; Scope item 3 (rev 3 addition): "The same supersession gets a one-line entry in the shipped gate-presentation spec's Amendments section"; DoD 7: "the gate-presentation spec's Amendments section records the C2 clause supersession in one line". Assumption 4 was not edited in the delta (git diff 47a6832..e07922d touches Status, Scope items 3–4, DoD 6–7, Context, A2 only).
- impact: Assumption 4 is the frozen-surface-discipline summary an implementer or later reviewer reconciles against Scope; a reader trusting it would conclude the gate-presentation spec-doc edit (and the M5/GPC2 pin amendments) are outside the permitted classes, inviting a mid-implementation doubt or a spurious "silent frozen-list narrowing" challenge. No verification breaks — Scope, DoD and Context all name the edit correctly — so the defect is internal incoherence, not a wrong instruction.
- fix: One sentence in Assumption 4 extending the enumeration to "…plus the GPC2 pin update, the M5 count amendment, and the gate-presentation spec's C2 Amendments entry".

## Confirmed prior fixes (one line each)

- PLAN-R2-01 confirmed — Scope item 4 / DoD 6 now declare goldens unchanged by design; verified the mechanism end-to-end: `skills/sdlc/scripts/ensure-panel-agent.mjs:70-75` resolves consumer-override-first, the golden-stamping test runs every phase with `--config consumer` (`test/extraction.test.js:133-142`, stamp call at :136), `test/fixtures/consumer/.pi/sdlc/prompts/adversary-plan.prompt.md` exists, `lib.mjs:11` maps only `plan_review` to the `adversary-plan` base, and every non-consumer-config stamping invocation in the corpus uses `pr_review` (`test/extraction.test.js:107,159,178`; `test/path-plumbing.test.js:94`; `test/telemetry-side-effects.test.js:143-156`, which pins no body bytes) — the package-prompt change cannot move any golden.
- PLAN-R2-02 confirmed — Scope item 3 / DoD 7 / Context add the one-line C2-supersession entry to `docs/specs/2026-08-09-gate-presentation-contract.md` (C2 shape restates "the prompt stays untouched" at :62; its Amendments section at :407+ reads "None at rev 3."); the spec doc is absent from the FROZEN array (`test/frozen-surfaces.test.js:14-32`) and no test pins its body content, so the entry is mechanically unobstructed and greppable.
- PLAN-R2-03 confirmed — Scope item 3 / DoD 7 / Context bound the replacement GPC2 pin under 80 characters, matching GPC10's verbatim-window assertion over governed docs including `phase-plan.md` (`test/gate-presentation-contract.test.js:324-330`), which is exactly the trip hazard the new pin would otherwise create.

## CLEAR surfaces

- CLEAR: A — delta DoD items (6, 7) are mechanically falsifiable: fixture byte-identity via git diff, a character-count bound, a greppable one-line Amendments entry, unmodified remaining pins.
- CLEAR: B — objective and outcome-proof text untouched by the delta; the retro-owned proxy measure from rev 2 stands.
- CLEAR: D — the supersession remains declared, bounded (single clause, one pin, one Amendments line), and escalated for owner ratification in Status, A2, and consolidated escalation 1 (now annotated "+ PLAN-R2-02").
- CLEAR: E — the delta's new change class carries no unnamed dependency: the spec doc is neither frozen nor test-pinned, and the package plan prompt's other content pins (NR7 governing-documents literal at `test/reference-contract.test.js:22`; IDV15/IDV28 in `test/iteration-disposition.test.js:436-453`; loom-literal walk in `test/extraction.test.js:47-65`) are all preserved by construction under additive anchors within existing lettered surfaces.
- CLEAR: F — track unchanged (irreversible); the delta neither adds nor removes frozen-shape contact beyond the already-adjudicated unfreeze.
- CLEAR: PROPORTIONALITY — the delta adds no new verification machinery (it removes a redundant regeneration step and rejects the second golden pipeline); DoD 9's per-check budgets (< 1 s contract tests, 30 s suite, ≤ 5 s biome/references/lifecycle) already bound everything the delta touches.

## PASS (with one low NEW finding)

The three round-2 dispositions are correctly implemented and independently re-verified against the tree; the single residual defect is the stale Assumption 4 enumeration above.