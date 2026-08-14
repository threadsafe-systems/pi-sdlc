# Consolidated adjudication: plan panel, S2 plan artifact skeleton

- Target: `docs/plans/2026-08-14-plan-artifact-skeleton.md`
- Round 1 commit under review: `581c2011af41abfa94d12a1348dbbb1c0d287590` (rev 1)
- Panel phase: `plan_review` (floor 2, track irreversible, `onShortfall: fail`)
- Orchestrator/adjudicator: `anthropic/claude-fable-5` (session identity, verified via `PI_MODEL`)
- Reviewers, round 1: `openai-codex/gpt-5.6-luna:xhigh` (`round1-gpt-5.6-luna.md`), `zai/glm-5.2:xhigh` (`round1-zai-glm-5.2.md`)
- Infra events, round 1: `google/gemini-3.1-pro-preview:xhigh` failed pre-verdict (HTTP 429, prepay credits depleted — non-transient billing exhaustion, no retry) and was replaced by the next untried credentialed model in the configured prefer list, `zai/glm-5.2:xhigh`, per the reviewer-dispatch recovery rule. Not counted against the floor; floor met (2 verdicts); no shortfall advisory applies.

## Round 1 — findings and dispositions

14 raw items (7 luna + 5 glm findings, 2 luna CLEARs implicit-none, 3 glm CLEARs), deduped to 10 findings: luna-F3 and glm-F1 are the same defect (glm adds the Out-bullet self-contradiction and the GPC2 insertion-point constraint); luna-F6 and glm-F5 are the same defect. All 10 verified against the tree at `581c201` before disposition.

| ID | Sev | Source | Finding (gist) | Verified evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| PLAN-R1-01 | high | luna-F1 | Prompt edit breaks the stamped-agent golden; golden regeneration unplanned | `test/extraction.test.js:133-142` byte-compares to `test/fixtures/golden/plan_review.agent.md` | **incorporated** — golden regeneration added as a named change class (Scope In, DoD) |
| PLAN-R1-02 | high | luna-F2 | Unfreeze window leaves FROZEN narrowing and IDV19 exemption mechanically unguarded | `test/frozen-surfaces.test.js:15-49` diffs only current `FROZEN` entries; `test/iteration-disposition.test.js:491-499` checks prompts only | **incorporated** — window-scoped assertions (exact post-unfreeze FROZEN membership + one-prompt IDV19 exemption) added to the contract tests; their removal added to the re-freeze obligation (S3 precedent: window-scoped GPC11 tests deleted post-merge, #241) |
| PLAN-R1-03 | high | luna-F3 + glm-F1 | Slice falsifies the shipped, test-pinned §4 clause "the prompt itself stays untouched" while its own Out list bars the §4 fix; GPC2 also pins §4 ordering | `phase-plan.md:50`; `test/gate-presentation-contract.test.js:309`; plan Out bullet barring provenance-text changes | **incorporated** — scope now permits the single-clause §4 adjustment + the paired GPC2 literal update, constrained by GPC2's ordering pins; **escalated to owner at the plan gate as a declared supersession of a settled decision** (never absorbed silently) |
| PLAN-R1-04 | medium | glm-F2 | S1's M5 test pins the inventory at exactly 81 rows; S2's row makes 82, surface unnamed | `test/spec-artifact-skeleton.test.js:99`; live count 81 | **incorporated** — M5 amendment (81→82) named as a change surface |
| PLAN-R1-05 | medium | glm-F3 | #146 end-state stated two ways (re-scope vs close-as-superseded) and misattributed to R5 §3 | R5 §3 ratified only shape supersession; gate decision line says "re-scoped"; plan body said "closes" | **incorporated** — one disposition (close as superseded) stated in all body positions, attributed to the 2026-08-14 gate as its concretisation, **presented for owner ratification at the plan gate**; the verbatim provenance block is not rewritten |
| PLAN-R1-06 | medium | glm-F4 | G3 done-means "metric carried to Spec/retro" has no home in the outcome-proof row | R2 brief G3 done-means; row spec had no carry field | **incorporated** — outcome-proof row gains a carry/destination field; binding rule 3 requires the landing site |
| PLAN-R1-07 | medium | luna-F5 | Binding rule 4 accepts bare applicability while the skeleton demands applicability + reason | Plan rule 4 vs skeleton column spec; R2-G4 "applicability reason" | **incorporated** — rule 4 requires the reason on every row |
| PLAN-R1-08 | medium | luna-F6 + glm-F5 | Binding rule 5 lets any Plan declare a pre-mortem zero state; G5 reserves it for small reversible work | R2-G5 done-means; plan rule 5 unconditioned | **incorporated** — rule 5 conditions the zero state on small reversible work with a one-line reason |
| PLAN-R1-09 | medium | luna-F4 | Objective claims an authoring-time-vs-panel-cost outcome nothing verifies | Contract tests prove guidance presence only (plan assumption 3) | **incorporated** — objective recast to the structural deliverable; an outcome-proof note names the proxy metric (round-1 finding mix of future plan panels via FS13 telemetry), evidence owner (retro), and window |
| PLAN-R1-10 | medium | luna-F7 | Only the new contract test is budgeted; biome/reference/lifecycle checks unbounded | Spike-exit plan budgets each check individually | **incorporated** — per-check external budgets added to the DoD, matching the spike-exit precedent |

Tally, round 1: 3 high / 7 medium; **10 incorporated, 0 dismissed**.

## CLEAR reconciliation

- glm CLEAR A (DoD falsifiability) and CLEAR F (track) accepted; luna independently CLEARed F.
- glm CLEAR PROPORTIONALITY conflicts with luna PLAN-R1-10; adjudicated **in favour of the finding** — the repository's own precedent budgets every gate check individually, and an unbudgeted check is exactly what the workflow's proportionality law flags.

## Round 2 — delta review of `581c201..47a6832` (rev 2)

- Round 2 commit under review: `47a6832` (rev 2); reviewers: `openai-codex/gpt-5.6-luna:xhigh` (`round2-gpt-5.6-luna.md`), `zai/glm-5.2:xhigh` (`round2-zai-glm-5.2.md`). No infra events.
- All ten round-1 fixes confirmed by both reviewers (one line each in their outputs).
- 4 raw findings deduped to 3 (luna's single high and glm's NEW-1 are the same defect, established independently; glm supplied byte-level verification).

| ID | Sev | Source | Finding (gist) | Verified evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| PLAN-R2-01 | high | luna-F1 + glm-NEW-1 | Round-1 golden-regeneration class rests on a false premise: the extraction suite stamps from the consumer fixture config and FS5 resolves consumer-override-first; the fixture ships its own plan prompt, so the package-prompt change cannot move the golden | `ensure-panel-agent.mjs:70-75`; `test/extraction.test.js:21,133-142`; `test/fixtures/consumer/.pi/sdlc/prompts/adversary-plan.prompt.md` exists; S1's merge commit touched no goldens | **incorporated** — the change class is replaced by an explicit goldens-unchanged-by-design declaration; package-prompt content coverage is the contract-test anchors (S1 precedent). Fix-shape adjudication: luna's alternative (a second, package-default golden pipeline) **rejected** as redundant CI machinery over the same content the anchor tests already pin |
| PLAN-R2-02 | medium | glm-NEW-2 | The shipped gate-presentation spec's C2 shape restates the superseded clause ("…and the prompt stays untouched") with an empty Amendments trail, so post-merge the settled-decision record contradicts the repo silently | `docs/specs/2026-08-09-gate-presentation-contract.md` C2 signature/shape; its Amendments section reads "None at rev 3." | **incorporated** — a one-line C2-supersession Amendments entry in that spec joins the named change classes |
| PLAN-R2-03 | low | glm-NEW-3 | The replacement GPC2 pin can trip GPC10's ≥80-character verbatim-substring bound over governed docs | `test/gate-presentation-contract.test.js:324-330` | **incorporated** — Scope item 3 bounds the replacement pin under 80 characters |

Tally, round 2: 1 high / 1 medium / 1 low; **3 incorporated, 0 dismissed** (one fix-shape alternative rejected within PLAN-R2-01's adjudication). Round-2 CLEARs: luna B/D/F/PROPORTIONALITY; glm B/C/F/PROPORTIONALITY — no conflicts.

## Escalations carried to the plan gate

1. **PLAN-R1-03 (+ PLAN-R2-02)** — supersession of the shipped gate-presentation clause "the prompt itself stays untouched" (`phase-plan.md` §4, pinned by GPC2; restated by the gate-presentation spec's C2 shape): the slice narrows it to "changed only under the FS19 deliberate-change precedent, limited to skeleton-awareness anchors", updates the GPC2 pin (under GPC10's bound), and records a one-line Amendments entry in the shipped spec. Requires explicit owner ratification.
2. **PLAN-R1-05** — #146 tracker end-state concretised as **close as superseded** (durable comment records the absorbed sweep rows and the two deliberately-unadopted mandates). Requires explicit owner ratification of the disposition wording.
