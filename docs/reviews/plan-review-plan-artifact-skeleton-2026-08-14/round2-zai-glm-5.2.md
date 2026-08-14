# Plan review — round 2 (delta 581c201..47a6832) — `docs/plans/2026-08-14-plan-artifact-skeleton.md` rev 2

## Findings (NEW)

### NEW-1: Golden-regeneration change class rests on a false premise — the stamped golden derives from the consumer override, not the package prompt

- severity: high
- confidence: high
- location: Scope item 4 ("Stamped-agent golden regeneration") + DoD 6 (first clause)
- defect: Scope item 4 asserts "the prompt change regenerates it deterministically via the existing stamping path", but the S4 extraction test stamps with `--config test/fixtures/consumer` and prompt resolution is consumer-override-first — the consumer fixture ships its own `adversary-plan.prompt.md`, so changing the package default leaves the stamped plan_review body and the golden byte-identical; the golden does not regenerate.
- evidence: `skills/sdlc/scripts/ensure-panel-agent.mjs:73-75` ("Prompt resolution order (FS5): consumer override first, then skill generic"; `overridePath = <root>/.pi/sdlc/prompts/adversary-plan.prompt.md` wins when present); `skills/sdlc/scripts/lib.mjs:64-67` (`--config DIR` sets root to that dir); `test/extraction.test.js:21` (`consumer = join(fx, "consumer")`) and the S4 test (`test/extraction.test.js:133-142`) stamps every phase with that config; `test/fixtures/consumer/.pi/sdlc/prompts/adversary-plan.prompt.md` exists (36 lines vs the package default's 43). Byte-verification performed: the golden `test/fixtures/golden/plan_review.agent.md` body equals the consumer override body (after reversing the REVIEWER_TAG substitution) and does NOT equal `skills/sdlc/prompts/adversary-plan.prompt.md`. Neither round-1 reviewers nor the adjudication checked the resolution order (round1-gpt-5.6-luna.md:7-10 assumed direct derivation).
- impact: DoD 6's regeneration clause is vacuous — it cannot fail from this slice's prompt change, so it verifies nothing about the prompt edit; worse, an implementer who mechanically "regenerates via the stamping path" against the package default writes a golden that fails S4 (stamped-from-consumer ≠ new golden), and the Out list ("`test/fixtures/consumer/` stays untouched, full stop") forbids the only fixture-side reconciliation. In reality the changed package prompt has zero stamped-golden coverage — the opposite of what the ratified change class claims.
- fix: Correct Scope item 4/DoD 6 to state the golden is fed by the consumer override and is unaffected (drop the regeneration change class), recording explicitly that the package-default plan prompt has no stamped-golden guard by design (FS5 consumer law).

### NEW-2: The declared supersession leaves the governing gate-presentation spec internally contradicting the repo

- severity: medium
- confidence: high
- location: Scope item 3 supersession paragraph; DoD 7; Out list ("Any change to the provenance contract's semantics…")
- defect: The supersession covers `phase-plan.md` §4's shipped clause and GPC2's pinned literal, but a third authoritative restatement of the same settled rule — C2's signature/shape in the shipped spec `docs/specs/2026-08-09-gate-presentation-contract.md` ("by reference, never restated, and the prompt stays untouched") — is neither amended nor named, so after merge the governing spec that GPC2 traces to asserts a rule the repo falsifies.
- evidence: `docs/specs/2026-08-09-gate-presentation-contract.md:55-63` (C2 signature/shape ends "— by reference, never restated, and the prompt stays untouched."); its `## Amendments` section reads "None at rev 3." (line ~407-409); the plan records the supersession only in "the Amendments section of the spec this plan spawns" (Scope item 3) and DoD 7 names only `phase-plan.md` + GPC2. The spec's own `Gated by: GPC2` line ties C2 to the test being edited.
- impact: The "never absorbed silently" discipline is undermined at its source: the locked-decision record itself stays contradictory, invisible to CI (no test pins the spec doc), and any adoption audit reading the gate-presentation spec post-S2 sees a false invariant with an empty Amendments trail.
- fix: Name a one-line Amendments entry in `docs/specs/2026-08-09-gate-presentation-contract.md` recording the C2 clause supersession (as a permitted change class in Scope item 3 or part of the re-freeze obligation).

### NEW-3: The mandated GPC2 literal update omits the GPC10 restatement bound governing the same file

- severity: low
- confidence: medium
- location: Scope item 3 ("honouring its ordering pins… update GPC2's pinned literal in the same commit") + DoD 7
- defect: The plan constrains the GPC2 literal update only by GPC2's ordering pins, but GPC10 forbids any ≥80-character verbatim substring of a governed doc (including `phase-plan.md`) inside `test/gate-presentation-contract.test.js` — pinning the new, longer surviving-rule clause verbatim can trip it.
- evidence: `test/gate-presentation-contract.test.js:324-330` (GPC10 sliding 80-char window over the test source against `phase-plan.md` et al.); plan text names only "ordering pins" (Scope item 3) and "literals and §4 ordering" (DoD 7).
- impact: The natural spec-authoring move (pin the replacement clause verbatim, as GPC2 does today at test:309) can fail GPC10 with no plan guidance, forcing an unplanned pin-length rework at spec time.
- fix: Add one clause to Scope item 3: the replacement GPC2 pin must stay under GPC10's 80-character verbatim-substring bound.

## Prior fixes — confirmed (one line each)

- PLAN-R1-01: Confirmed incorporated (Scope item 4, DoD 6) — but see NEW-1: the incorporated mechanism's premise is false.
- PLAN-R1-02: Confirmed — window-scoped guards (exact post-unfreeze FROZEN membership + one-prompt IDV19 exemption) in Scope item 8, deleted by the re-freeze (Scope item 6, DoD 3/5).
- PLAN-R1-03: Confirmed — single-clause §4 supersession + paired GPC2 literal update (Scope item 3), Out list narrowed to the exact carve-out, owner escalation recorded (Status, A1).
- PLAN-R1-04: Confirmed — M5 81→82 amendment named (Scope item 7, DoD 6); live count verified at exactly 81 (`test/spec-artifact-skeleton.test.js:99`, `normative-references.json` sources: 81).
- PLAN-R1-05: Confirmed — close-as-superseded unified across body positions, attributed to the 2026-08-14 gate (Scope item 9, DoD 11), escalated to owner.
- PLAN-R1-06: Confirmed — outcome-proof row gains `carried to`; binding rule 3 names the Spec/retro landing site.
- PLAN-R1-07: Confirmed — binding rule 4 requires applicability with its reason.
- PLAN-R1-08: Confirmed — rule 5's zero state conditioned on small reversible work + one-line reason, matching R2-G5's done-means (`docs/briefs/2026-07-26-design-phase-r2-plan.md:19`).
- PLAN-R1-09: Confirmed — objective recast structurally; proxy outcome note names metric (round-1 finding mix of future plan panels), evidence owner (sdlc-retro), and FS13 telemetry (real: `docs/adr/0028-lifecycle-telemetry-fs13.md`).
- PLAN-R1-10: Confirmed — DoD 9 externally budgets every check; `check-lifecycle.sh --track/--slug` invocation verified against the script's usage line.

## CLEAR surfaces

- CLEAR: B — the objective is now structural with a named proxy measure, evidence owner, and window; no delta outcome lacks a verification path beyond the ratified retro-proxy framing.
- CLEAR: C — in/out boundaries are coherent after the Out-list narrowing (the provenance carve-out exactly matches Scope item 3's single-clause supersession); still one spec's worth of work.
- CLEAR: F — irreversible track unchanged and correct (freezes a public authoring surface adopted repos bind to).
- CLEAR: PROPORTIONALITY — every CI/gate check now carries an external budget (DoD 9); the added window-scoped guards are sub-second string assertions inside the <1 s contract-test budget; the FS13-based proxy measurement costs nothing in CI.
