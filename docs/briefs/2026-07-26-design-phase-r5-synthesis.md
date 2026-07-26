# Design-phase gap analysis — R5: synthesis, cycle verdict, and the change slate

Resolves threadsafe-systems/pi-sdlc#198, the final ticket of map #192.
Consolidates R1–R4 (`docs/briefs/2026-07-26-design-phase-r{1..4}-*.md`, all at
baseline `f1cfad3`). Every decision below was owner-ratified in the R5 grill
session on 2026-07-26. The slate's slices are commitments to *propose* work,
not pre-approved designs: each slice runs its own lifecycle, with this map's
briefs and ratifications as its brainstorm input.

## 1. The 4×6 matrix

34 gap rows across 4 phases × 6 lenses. Full rows live in the phase briefs;
this table is the index.

| Lens | R1 Brainstorm | R2 Plan | R3 Spec | R4 Build |
|---|---|---|---|---|
| 1 Expertise | G1 problem-before-solution · G2 alternative-or-declare · G3 appetite · G4 research-or-declare | G1 problem/non-goals/alternatives · G5 pre-mortem rows | G1 vocabulary table · G2 contract blocks | G2 INVEST self-check · G6 task boundary rule |
| 2 Boundaries | G5 gate-recap skeleton · G6 spike exit table | G2 boundary labels | G3 amendment classes · G4 scenario kind labels | G1 build_review · G5 spec-gap log · G7 parallel surface check |
| 3 FR/NFR | G7 constraints entry prompt | G3 impact proof · G4 placement verdict | G5 NFR binding · G6 `Given:` line | G3 DoD beyond PV1 |
| 4 Iteration | no row (no-panel phase) | G6 NEW/REOPENED/CARRY | G7 delta re-rounds + escalation | (G1 partly) |
| 5 Comprehension | G8 gate mermaid sketch | G7 outcome/objective tree | G8 diagram-by-change-class · G9 IA-graph lint (advisory) | G4 sequencing rationale + dep graph |
| 6 Ceremony | no row — 3 enrichments → #158 | G8 handoff cue | G10 verifiability counts · G11 heavier-verification trigger | consistent |

**Cross-brief convergences** (found independently, not coordinated): every
phase's fix is a *declare-or-justify* skeleton — of 34 rows, almost all are
template/prose, with only two new-check candidates, both deliberately
advisory; three briefs proposed the same iteration vocabulary; and R3's
asymmetry finding (the adversary prompts specify richer artifacts than the
authoring guidance ever asks for) generalises to Plan and Build.

## 2. Cycle verdict — RATIFIED

**Brainstorm → plan → spec → build/implement → review survives**, on evidence:

1. Zero of 34 rows attacks phase topology — no brief proposed merging,
   eliminating, or reordering a phase; four models, four literatures, no
   structural dissent.
2. The literature maps 1:1 onto the phases (Double Diamond→brainstorm,
   design-doc culture→plan, SbE/DbC→spec, INVEST/WBS→build): the
   decomposition sits on the industry's own joints.
3. The genuinely novel territory is iteration *inside* a gate under
   machine-speed adversarial review, where all four briefs concur the
   literature is silent and our own telemetry (#174) is the primary source.
   Re-review suboptimality is a convergence-discipline problem, not a cycle
   problem.
4. **Ratified refinement:** the cycle survives as a *spine with disciplined
   escape hatches*, not a strict pipeline — the spike exit (R1-G6), forward
   spec-amendment classes (R3-G3), and the build spec-gap log (R4-G5) become
   legitimate documented paths rather than deviations. The phases hold; the
   seams get vocabulary.
5. Scaling is orthogonal and decided (#158); nothing found contradicts it and
   five rows enrich it (§5).

## 3. The change slate — RATIFIED bundling

| Slice | Rows | Change surface | Gist |
|---|---|---|---|
| **S1 Spec artifact skeleton** | R3-G1, G2, G4, G5, G6 | `templates/sdlc-spec.md` + `phase-spec.md` §4 | Vocabulary table; contract blocks (signature/pre/post/invariant/error-precedence + gating scenario ids); scenario kind labels `mechanical`/`inspection`/`carried`; NFR table (measure + scenario id, or explicit `unbound — accepted at gate`); `Given:`/`When–Then:`/`Falsify:` scenario form. Closes the author/reviewer asymmetry at its most expensive gate. |
| **S2 Plan artifact skeleton** | R2-G1, G2, G3, G4, G5 | `templates/sdlc-plan.md` + `phase-plan.md` §4 | Problem statement (actor/baseline/consequence, mechanism-free) + non-goals + alternatives; objective/constraint/solution boundary labels with parked destinations; outcome-proof block {goal, question, metric, baseline, target/window, evidence owner} with proxy/no-measurement rationale allowed; NFR sweep with applicability/target/binding/verification columns (**supersedes #146's bare-checklist shape**); compact pre-mortem rows. |
| **S3 Brainstorm exit contract** | R1-G1, G2, G3, G4, G5, G7, G8 | `phase-brainstorm.md` §1/§8 (+ the Plan provenance seam) | Gate-recap skeleton (uncommitted, presented at gate, restated by Plan): problem/outcome · appetite · agreed shape · rejected alternatives (alternative-or-declare) · rabbit holes + patches incl. one slow-motion walkthrough · out-of-bounds · constraints line · surviving assumptions · research-or-declare evidence · conditional mermaid sketch. **Owns the recap↔plan-provenance contract; S2 consumes it** (tension (a) resolved). |
| **S4 Spike exit rule** | R1-G6 | `phase-brainstorm.md` §8 | Mechanical read/spike/front-load/judgment table over recap assumptions, in #161's verifiability vocabulary; brainstorm exit becomes Plan \| map \| spike; spikes name question + timebox first, code is throwaway. Endorses #147 as the read tier (linter stays #147's slice). Ceremony-facing half routes to #158 (§5). |
| **S5 Iteration/disposition vocabulary** | R2-G6 + R3-G3, G7 + R4-G5 | adversary prompts + phase refs + `phase-pr-review.md` Panels | ONE cross-gate contract: findings tagged `NEW` / `REOPENED(<prior-id>)` (reopen without new evidence barred) / `CARRY-TO-<phase>`; re-dispatch carries prior findings + dispositions, scoped to the delta; ratified-decision collisions escalate to the owner, never absorbed; round-3 churn diagnosis with bounded options; spec amendment classes (a: frozen→backward, b: unfrozen pre-merge→amend+disposition per #136, c: contradiction→fix wave); build spec-gap log (blocker/minor × backward/assumption/carry). Unifies R3's `carried` with R4's dispositions (tension (c) resolved). Instantiates #174 recs 1–2/4 + #136. |
| **S6 Build craft** | R4-G2, G3, G4, G6, G7 | `phase-tasks.md` §4 + `templates/sdlc-tasks.md` | INVEST-adapted task self-check; per-task DoD (assumptions recorded, frozen surfaces audited, evidence linked — composes with, never duplicates, #160's verification dial); per-edge sequencing rationale + parallel-group independence justification + optional mermaid dep graph; task boundary rule ("dispatchable without reading the Spec"); parallel surface-sharing check. |
| **S7 Comprehension seam** | R3-G9 + IA halves of R2-G7/R4-G4 | spec/plan/build templates front matter | IA-graph front matter + `C<n>` ids feeding `sdlc-visual-docs` `lint.mjs` at gates — **advisory/non-blocking while the IA schema is v0**; opens with the 10-minute de-risking spike (front-matter one real spec, run lint). Per-phase diagram/table *requirements* (R1-G8, R2-G7 tree, R3-G8, R4-G4) fold into S3/S2/S1/S6 respectively, so each template is touched once. Diagram home resolved by altitude: Plan carries the outcome tree, Spec the mechanism diagrams (tension (b) resolved). |
| **S8 build_review capability** | R4-G1 / #131 — **ratified as option (c)** | `prompts/adversary-build.prompt.md` + panel-phase vocabulary | Build the capability (decomposition-defect-only reviewer prompt, `build_review` phase registered), **invocation is never a static gate**: pre-envelope the orchestrator dispatches at discretion with `workflow.md` steering; post-envelope it is a step the estimator recommends and the human ratifies at the Spec→Build handoff. Rejected: a new gate dial (collides with #159's no-dials law) and an envelope bound (a ceremony judgment in bound's clothing; #159's reintroduction bar unmet). **#131 is re-scoped to this.** |

## 4. Ranking — RATIFIED

**S5 → S1 → S3 → S4 → S2 → S6 → S8 → S7.**

Rationale: S5 first because it stops the live bleeding (#174) and improves
every subsequent slice's own panels — a dogfood dividend from day one. S1
second (biggest asymmetry, most expensive gate). S3 before S2 because S3 owns
the recap↔provenance contract S2's template consumes; S4 rides directly after
S3 (same file, keys off the recap). S6 then S8 (the adversary-build prompt
reviews against S6's definition of a good build plan). S7 deliberately last
(needs S1's `C<n>` ids; starts with its spike).

Standing rules: each slice runs its own normal lifecycle; any slice row that
drifts toward ceremony *invocation* re-routes to #158's build stream rather
than growing here.

## 5. Routed to #158's build stream (evidence, never reopened decisions)

- R1's three enrichments: appetite as human-declared bound beside the
  estimator band in `ceremony.recommended`; the spike exit as the first
  concrete instance of #158's parked "phase-collapsing rules" fog; literature
  support for banded proportionality over static floors.
- R2-G8: Plan handoff carries estimate/recommendation/ratification/deviations
  per #160 (adopt, no reopen).
- R3-G10: `mechanical`/`inspection`/`carried` counts (from S1's labels) make
  the estimator's verifiability ratio computable at the Spec→Build handoff, a
  phase earlier than #161 assumed — additive to its contract.
- R3-G11: verification *technique* as a third ceremony dial
  (reference-model/property-based when concurrency/recovery/state-machine
  triggers fire; default-off, never a tooling mandate).
- R4's flag: build_review sits in neither dials nor bounds — resolved by S8's
  capability-not-gate shape.

## 6. Ratification record

| # | Decision | Outcome |
|---|---|---|
| 1 | Cycle verdict incl. "spine with disciplined escape hatches" refinement | Ratified (owner, 2026-07-26) |
| 2 | Slate bundling: 7 slices + #158 routing list | Ratified (owner, 2026-07-26) |
| 3 | build_review as capability-not-gate (option c); #131 re-scoped | Ratified (owner, 2026-07-26) |
| 4 | Ranking S5 → S1 → S3 → S4 → S2 → S6 → S8 → S7 | Ratified (owner, 2026-07-26) |
