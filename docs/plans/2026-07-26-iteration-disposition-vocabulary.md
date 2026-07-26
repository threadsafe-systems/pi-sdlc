# Plan: cross-gate iteration & disposition vocabulary (S5)

Slice **S5** of the ratified design-phase change slate
(`docs/briefs/2026-07-26-design-phase-r5-synthesis.md` §3, ranked first in §4).
Brainstorm was a live dialogue on 2026-07-26; its ten ratified decisions are
restated below as this Plan's provenance. Track: **irreversible**.

**Rev 2** — incorporates all 12 findings of plan-panel round 1
(`docs/reviews/plan-review-iteration-disposition-vocabulary-2026-07-26/consolidated.md`,
ids `PLAN-R1-01`‥`-12`; 1 high, 7 medium, 4 low; 0 dismissed).

## Objective

Give the lifecycle **one shared vocabulary for what happens to a finding, and to
an approved artifact, across gates** — so that a finding is either fixed,
dismissed with a recorded reason, carried forward to a named landing site, or
escalated, and never silently absorbed, re-litigated, or dropped.

Concretely, at the end of this slice:

1. `references/system-reference.md` carries one normative **glossary** of the
   terms: the three finding classes, the reopen evidence bar, the disposition
   record shape, the carry destinations and the no-orphan rule, the
   ratified-decision collision, and the three artifact-amendment classes.
2. The phase references that already own the mechanics **consume** those terms
   rather than restating them: `phase-pr-review.md` §5 (panel run-shape),
   `phase-spec.md` §6 and `phase-plan.md` §6 and `phase-tasks.md` §6
   (amendment), `phase-tasks.md` §4 + `templates/sdlc-tasks.md` (spec-gap log).
3. The three adversary prompts carry the tagging law inline, because a reviewer
   subagent has no skill loaded and cannot follow a reference.
4. This repo's `.pi/sdlc/workflow.md` loses the four rules that have been
   promoted — the dogfood proof that the promotion actually landed.

## Rationale

### The problem, in evidence

| Evidence | Failure |
|---|---|
| #174 — `pv1-task-scoped-tests` plan panel, 14 rounds / 13 fix waves, plan grew 159 → 687 lines | **Zero dismissals across 60+ findings.** No delta instruction, so each round re-reviewed the whole grown artifact; recurring classes ("Build-authority" r10→r11→r12) were re-found instead of being barred; no round cap; no carry-to-Spec disposition for spec-grade material arriving at Plan altitude. |
| Case channel-presence rev5 (2026-07-23) | An **approved Spec amended pre-merge** with no disposition record distinguishing ratified fine-tuning from redesign smuggling. `phase-spec.md:88-92` is backward-only; forward amendment is absent. |
| R4-G5 | Decomposition-time spec gaps have only a **binary** choice: full backward transition, or silently assume and proceed. |
| #174 finding 4 | The per-round `consolidated.md` was skipped **13 times** and one `panel.consolidated` event was emitted for a 14-round run — the artifact discipline the vocabulary rides on is the discipline most often dropped. |

The common root is that the sdlc names *phases* and *gates* precisely and names
*findings* not at all. A finding has no identity, no class, no lifecycle and no
legal destinations, so nothing forbids re-raising it, nothing records why it was
dropped, and nothing gives it a home in a later phase.

### Why a shared vocabulary rather than per-phase rules

Findings cross gates by nature: a Spec panel mints a finding that only Build can
land; a Plan panel mints one that belongs to the Spec. Defining the terms inside
any single phase's mechanics under-scopes them by construction. Defining them
once, and referencing them from each phase, is the only shape where
`CARRY-TO-BUILD` at Spec and the build spec-gap log are the *same* mechanism
rather than two parallel inventions.

### Provenance — the ten ratified brainstorm decisions

| # | Decision | Source |
|---|---|---|
| D1 | **Shape A′**: glossary of *terms* in `system-reference.md`; mechanics stay in the phase references that already own them and cite the glossary. Rejected: moving panel mechanics out of `phase-pr-review.md` (would force relocating the working escalation/ratified-dismissal law at `phase-pr-review.md:196-215`). | brainstorm Q1/Q3 |
| D2 | **Prompt option 1**: static tagging/delta law inline in the three adversary prompts; the per-round prior-findings **data** is pasted at dispatch. Rejected: dispatch-time append only (no artifact, orchestrator-discipline — the exact failure mode #174 documents). | brainstorm Q2/Q9 |
| D3 | Amendment classes are **phase-neutral** — Plan, Spec, and Build plan — not Spec-only as R3-G3 proposed. | brainstorm Q4 |
| D4 | Round cap fires **after round 4**, not round 3: if the 4th panel returns any high/medium, no round 5 is dispatched; the orchestrator presents a churn diagnosis and **the human** adjudicates. Recorded as a deliberate amendment of **both** #174 rec 1 **and R5's ratified S5 slate row** (and R3-G7's candidate), which both say round 3 — keeping `.pi/sdlc/workflow.md`'s proven round-4 semantics. The diagnosis carries **four bounded options**: (a) genuine rev-1 defects → keep going; (b) churn caused by our own fix waves → restructure rather than re-dispatch; (c) design flaw → backward transition; (d) ratified dismissal of the survivors. At `pr_review` specifically, "move on" is reachable **only** through (d): the cap never permits merging past a surviving high or medium, because a local rule may add gates and never weaken one. | brainstorm Q5; `PLAN-R1-03`, `PLAN-R1-11` |
| D5 | **Prose-only plus a non-blocking artifact-inventory self-audit** at the churn/gate seam. #174 rec 3's mechanical check stays out (it would reopen frozen FS9 and impose a new failure mode on every consumer). | brainstorm Q6 |
| D6 | Promotion set from `workflow.md`: delta-dispatch block · dismissal-posture / 100%-incorporation smell · round cap · trim-the-tail → promoted **and deleted locally**. PROPORTIONALITY, spec-authoring rules, identity discipline, artifact discipline, writing-comments → stay local. | brainstorm Q7 |
| D7 | **Trim-the-tail is in**, recorded as a deliberate extension of R5's S5 row (it is not in R5's row nor in #174's recs; it is the same mechanism as the round cap and splitting them would reopen `phase-pr-review.md` §5 for one paragraph in a later slice). The configured **panel floor governs full review rounds only**; a trim-the-tail delta confirmation is an explicitly exempt **sub-floor dispatch**, recorded as such in that round's `consolidated.md`, so it is not a shortfall under `onShortfall: fail`. | brainstorm Q7; `PLAN-R1-04` |
| D8 | Carry destinations: **the next phase in the effective configured sequence**, single-hop only — `CARRY-TO-SPEC` / `-BUILD` / `-IMPLEMENT` are the maximal-shape instances, and each phase reference states its own destination behind an *under your configuration* callout (under `shape.separateSpec: false` a merged design gate carries to Build, not to a Spec that does not exist; on the reversible track Spec is not a legal destination) — **plus terminal `CARRY-TO-BACKLOG`** (a filed issue id) so PR-phase findings have a disposition other than dismissal. **No orphan carries**: every carry names its landing artifact or issue, and a carry addressed to a phase blocks that phase's **gate where it has one, or its completion evidence where it does not** (Build has no gate of its own — `phase-tasks.md:81-83`). Rejected: multi-hop carries (how spec-grade detail escapes review entirely). | brainstorm Q8; `PLAN-R1-01`, `PLAN-R1-02` |
| D9 | Prompt option 1 stands despite reopening three **frozen** surfaces; the branch removes them from `FROZEN` and a mandatory post-merge re-freeze PR follows (the #190 → #191 pattern). | brainstorm Q9 |
| D10 | Brainstorm gate approved; enter Plan under `review.design: panel` on the irreversible track. | brainstorm Q10 |
| D11 | **Finding identity**: the consolidation step mints ids, format `<panelPhase>-R<round>-<nn>`, unique within the run. The id is the within-run handle `REOPENED(<id>)` resolves against; the existing binds-forward dismissal bar continues to key on finding **class**, not id (`phase-pr-review.md:209-217`), so cross-session lookups are unaffected. | `PLAN-R1-06` |

### Relationship to adjacent work

- **Instantiates** #174 recs 1 (amended per D4), 2, and 4; and #136's
  operator-feedback discipline via amendment class (b).
- **Does not touch** #174 rec 3 (mechanical check), rec 5 (`--author`
  derivation — #159's), or rec 6's plan-altitude guard (S2's). Rec 6's
  "carry to Spec" half *is* this slice's `CARRY-TO-SPEC`.
- **Defers to** #158 on anything about ceremony *invocation* (how many
  reviewers, which models, when a phase collapses). S5 governs what happens to a
  finding once a panel has run; it never decides whether one runs.
- **Precedes** S1 (spec skeleton), which will add scenario kind labels including
  `carried` — S1 consumes S5's carry vocabulary, so the ordering is load-bearing.

## Scope

### In

| # | Surface | Change |
|---|---|---|
| 1 | `skills/sdlc/references/system-reference.md` | New section **"Iteration & disposition"**: finding classes `NEW` / `REOPENED(<id>)` / `CARRY-TO-<dest>`; reopen evidence bar; disposition record shape (id, class, severity, disposition, one-line reason, landing site where applicable); **id minting rule per D11**; carry destinations resolved against the effective configured sequence + no-orphan rule (gate *or* completion evidence); ratified-decision collision; the three artifact-amendment classes (a/b/c). Terms only — no when/who mechanics. |
| 2 | `skills/sdlc/references/phase-pr-review.md` §5 | Step 2 gains the **delta-dispatch obligation** (re-rounds carry prior findings + dispositions and scope the reviewer to the delta commit range). Steps 3–4 gain **id minting** (D11), **tagging** (every consolidated row is `NEW` or `REOPENED(<id>)`), the **ratified-collision escalation**, the **dismissal-posture rule** (two consecutive waves at 100% incorporation is a reportable smell), and **trim-the-tail** with its explicit sub-floor exemption. Step 5 gains the **round-4 cap**, the **churn diagnosis** (human-adjudicated, four bounded options per D4, with the `pr_review` constraint that "move on" is reachable only by ratified dismissal), and the **artifact-inventory self-audit**. |
| 3 | `skills/sdlc/references/phase-plan.md` | **§5** gains the amendment-class citation (amendment decides whether the gate re-runs) and `CARRY-TO-SPEC` as a legal Plan-panel disposition, behind an *under your configuration* callout for merged/reversible shapes; **§6** keeps only class (a)'s backward-transition pointer. |
| 4 | `skills/sdlc/references/phase-spec.md` | **§5** gains **"Amending an approved Spec"** (classes a/b/c, citing the glossary), `CARRY-TO-BUILD`, and the **inbound** check: the Spec gate is not passable while a `CARRY-TO-SPEC` addressed to it is unlanded; **§6** keeps class (a)'s pointer. |
| 5 | `skills/sdlc/references/phase-tasks.md` | §4 gains the **spec-gap log** obligation; §5 cites the amendment classes for the Build plan itself; **§8 (completion evidence)** carries the inbound-carry check, since Build has no gate (`phase-tasks.md:81-83`) — a build plan is not complete while a `CARRY-TO-BUILD` is unlanded in its spec-gap log. |
| 5b | `skills/sdlc/references/phase-implement.md` | Inbound `CARRY-TO-IMPLEMENT` lands in the receiving task's checks or the Assumptions appendix; the task is not closeable while its carry is unlanded. (Added at review: the plan originally omitted the receiving phase entirely.) |
| 6 | `skills/sdlc/templates/sdlc-tasks.md` | Spec-gap log section: one row per upstream gap — description, severity (blocker/minor), disposition (backward-transition / assumption-recorded / `CARRY-TO-IMPLEMENT`), landing site. |
| 7 | `skills/sdlc/prompts/adversary-{plan,spec,review}.prompt.md` | Static **delta-round law**: rounds after the first are delta reviews; tag every finding `NEW` or `REOPENED(<prior-id>)`; a reopen requires new evidence absent when the finding was dispositioned; confirming a prior fix is one line, not re-litigation. Phase-appropriate carry destination named in each. |
| 8 | `test/frozen-surfaces.test.js` | Remove the three reopened prompts from `FROZEN` (with the header comment updated to name this slice and its re-freeze follow-up), keeping `validator-task.prompt.md` frozen. |
| 9 | `test/` (new + existing) | Scenarios asserting the glossary section exists with its terms, that each consuming reference **cites** it by name, and that the prompts carry the delta law. **Budget:** offline greps in the existing corpus style (`test/phase-references.test.js:4` — "Offline grep; no model calls"), **no new CI job or step**, whole-suite runtime delta target **< 2s**. **No permanent test asserts consumer `.pi/sdlc/workflow.md` content** — that surface is `consumer-integration` and its process text is locally owned; the promotion is proved once, in this slice's diff (DoD 6). Exact scenario ids are the Spec's to fix. |
| 10 | `.pi/sdlc/workflow.md` | Delete the four promoted rules (D6); keep the other **six** verbatim (price-every-scenario · keep-spec-altitude · PROPORTIONALITY · identity discipline · artifact discipline · writing-comments). |
| 11 | `.pi/sdlc/CONFIG.md` | Regenerate (currently stale vs `sdlc.config.json`) as its own `chore` commit on this branch. |

### Out

- Any **mechanical** enforcement of the vocabulary (#174 rec 3): no
  `check-lifecycle` rule, no hook, no schema or config change, no CI gate. D5.
- `--author` derivation (#159), plan-altitude guard (S2), scenario kind labels
  (S1), comprehension/IA front matter (S7), `build_review` (S8).
- Ceremony invocation of any kind (#158).
- Retrofitting the vocabulary onto historical `consolidated.md` artifacts.
- The post-merge re-freeze PR itself — mandatory, but its own track:none change.
- Consumer repos (`threadsafe/case`, `threadsafe-systems/pi-notion`) adopting the
  new skill release; they pick it up on their next version bump.

### Assumptions (ratified at this gate)

1. The glossary stays small enough — target **under ~60 lines** — that it does
   not become a third place an agent must read before acting.
2. **Prose plus visibility is sufficient enforcement.** Falsified if a post-S5
   run again skips per-round artifacts; that outcome is the evidence that
   unlocks the deferred checker slice, and is a *result*, not a defect of this
   plan.
3. Three hand-synced prompt sections will not drift within one slice; the
   existing near-identical "Output format (STRICT)" blocks across the same three
   prompts are the precedent that this is tolerable.
4. `phase-pr-review.md` §5 can absorb ~5 additions without exceeding a
   reasonable reference size; if it cannot, the Spec may propose a §5
   sub-structure, which is a presentation change, not a scope change.
5. Placing amendment law in §5 rather than §6 is the least-bad fit: the nine
   headings are frozen by `test/phase-references.test.js:20-30`, §6 means
   *backward* transition, and amendment's actual question is whether the gate
   re-runs — a §5 question. If S7's comprehension work later wants a tenth
   heading, that is S7's to propose, not this slice's.

## Definition of done

**Impact this slice claims** — that a finding's fate is recorded and bounded, and
that convergence terminates by rule rather than by exhaustion. The honest proof
is deferred and named: this slice's own panels are the first instance, and the
next full run's telemetry (rounds-to-converge, dismissal rate ≠ 0%, presence of
per-round consolidated artifacts) is the first external evidence. No metric is
claimed as met at merge.

**Delivery DoD** — falsifiable at merge, except the one item explicitly marked
review-judged (2a), which is called out rather than smuggled into the list:

1. `system-reference.md` carries one "Iteration & disposition" section defining
   all six term groups (classes, reopen bar, record shape, carry destinations +
   no-orphan, ratified collision, amendment classes) and no when/who mechanics.
2. **(mechanical)** Each of `phase-plan.md`, `phase-spec.md`, `phase-tasks.md`,
   `phase-implement.md`, `phase-pr-review.md` cites that section **by name** —
   asserted by test.
   - **2a (review-judged, explicitly not mechanical):** none of those references
     restates a glossary *definition*. The boundary: the six term groups'
     defining sentences belong to the glossary; when/who/what-happens-next is
     mechanics and belongs to the phase. Adjudicated at spec and PR review and
     recorded there, not claimed as a merge-time check.
3. `phase-pr-review.md` §5 states: the delta-dispatch obligation, per-row
   tagging, ratified-collision escalation, the dismissal-posture rule,
   trim-the-tail, the round-4 cap with human-adjudicated churn diagnosis, and
   the artifact-inventory self-audit.
4. The three adversary prompts each carry the static delta-round law and their
   phase's legal carry destinations; `validator-task.prompt.md` is unchanged.
5. `templates/sdlc-tasks.md` carries the spec-gap log with all four columns.
6. `.pi/sdlc/workflow.md` no longer contains the four promoted rules and still
   contains the **six** retained ones, verbatim — verified against this slice's
   diff at review, not by a standing package test.
7. `test/frozen-surfaces.test.js` no longer freezes the three reopened prompts,
   still freezes everything else, and its header names the re-freeze follow-up.
8. The full test corpus passes and `biome` is clean on touched files.
9. `.pi/sdlc/CONFIG.md` reports `current`.
10. The nine-heading phase-reference contract (`test/phase-references.test.js`)
    still passes for all six references.
11. Every `consolidated.md` this slice commits (plan, spec, and PR panels) tags
    **every** finding row `NEW` or `REOPENED(<id>)` with a run-scoped id per
    D11, records a disposition and one-line reason per row, and carries the
    round's artifact-inventory self-audit table. Falsifiable by reading the
    committed artifacts; replaces the unfalsifiable "dividend observed" item
    that round 1 struck out (`PLAN-R1-05`).
12. Each inbound-carry obligation (items 4, 5, 5b) names the checkpoint it
    blocks — gate where one exists, completion evidence or task close where
    none does — and no destination in the glossary lacks one.

## Context for the next agent

- **Author/orchestrator identity**: pass `resolve-panel --author` as the model
  this session is actually running as (#174 finding 4 cost a run its strongest
  reviewer through a copied `--author`).
- **Branch**: `feat/iteration-disposition-vocabulary`, cut from `main` at
  `add07e8`. The `implement.before` hook creates and enters the worktree; the
  main checkout must be returned to `main` before that hook fires, since this
  branch is checked out there while Plan/Spec/Build are authored.
- **Parked, not scoped**: whether the disposition record shape should eventually
  become a machine-parsable table in `consolidated.md` (it would make
  `panelPrecision` and #160's judge-training corpus computable without prose
  parsing). Deliberately not decided here — it is a schema question and would
  drag #160's event vocabulary in. Revisit when the checker slice is evidenced.
- **Parked (pre-existing, found during round 1 verification)**:
  `.github/workflows/ci.yml` declares **no `timeout-minutes` on any job or
  step**, so the whole suite is unbounded. Not caused by and not fixed in this
  slice — but it is the reason `PLAN-R1-08`'s budget is stated in the plan
  rather than enforced in CI. Worth its own reversible-track slice.
- **Parked**: the phantom whitespace-only rewrite of `.pi/sdlc/CONFIG.md`
  observed twice on 2026-07-26 between tool calls, not reproducible from
  `config-doc check`. Regeneration (item 11) is orthogonal to it; if it recurs
  after this slice, file it separately.
- **Sequencing**: S1 follows and consumes the carry vocabulary. Do not let S1
  scope leak backwards into this slice — scenario kind labels are S1's, even
  though `carried` shares a name with this slice's disposition.
