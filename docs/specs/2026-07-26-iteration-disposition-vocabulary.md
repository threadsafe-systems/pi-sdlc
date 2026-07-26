# Spec: cross-gate iteration & disposition vocabulary (S5)

Upstream: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` rev5
(approved 2026-07-26, `af1db62`). Track: **irreversible**. Slice S5 of the
ratified slate in `docs/briefs/2026-07-26-design-phase-r5-synthesis.md`.

This Spec fixes the contracts, their exact placement, and the falsifiable
scenarios. It does not re-argue the Plan's decisions D1–D12.

## 1. Amendment to the approved Plan — class (b), recorded

Grounding the Spec against the repository falsified a premise in the Plan's scope
item 6.

| | |
|---|---|
| **Trigger** | Spec-phase grounding of scope item 6's target path. |
| **Finding** | The Plan named `skills/sdlc/templates/sdlc-tasks.md`. That path **does not exist**: `skills/sdlc/` contains `assets`, `prompts`, `references`, `schema`, `scripts`, `SKILL.md` — templates live at repo root `templates/`. Worse, the real `templates/sdlc-tasks.md` is a *standalone-entrypoint router* that states of itself "Thin router; it does not restate phase mechanics" (`templates/sdlc-tasks.md:4-5`) and whose whole body is adoption detection, reference loading, and the #38 degradation contract. **This repo has no build-plan document template at all**; the build-plan doc's shape is specified in `phase-tasks.md` §4. |
| **Class** | **(b)** — refines an unfrozen shape pre-merge. The Plan is approved but unmerged and nothing binds to it; the *deliverable* (a spec-gap log with its column shape) is unchanged, only its home. |
| **Disposition** | Plan scope item 6 is **folded into scope item 5**: the spec-gap log obligation *and* its column shape are specified in `phase-tasks.md` §4. No template file is touched. `templates/sdlc-tasks.md` stays byte-identical. |
| **Gate impact** | None. Class (b) amends in place with a recorded disposition and does not re-run the design gate (D3). Recorded here rather than by silently editing the Plan, so the amendment is auditable — the discipline this slice exists to install. |
| **Author** | Orchestrator (`anthropic/claude-opus-5`), Spec phase, 2026-07-26. |

Consequence for the Plan's DoD: item 5 ("`templates/sdlc-tasks.md` carries the
spec-gap log with every column enumerated in scope item 6") is superseded by
scenario **IDV14** below, which asserts the same content against
`phase-tasks.md` §4 and additionally asserts the template is unchanged.

## 2. Vocabulary (normative)

These are the terms the glossary defines. They are **three disjoint kinds** and
must not be conflated (D12).

| Kind | Values | Answers |
|---|---|---|
| **Origin tag** | `NEW`, `REOPENED(<id>)` | Where did this finding come from *this round*? |
| **Disposition** | `incorporated`, `dismissed`, `CARRY-TO-<dest>`, `escalated` | What was decided about it? |
| **Defect class** | free-text semantic category (e.g. "objective contradiction") | What *kind* of defect is it? **Pre-existing** — `phase-pr-review.md:209-217` keys the binds-forward dismissal bar on it. This slice records it; it does not redefine it. |

- **Reopen evidence bar.** `REOPENED(<id>)` is legal only when the finding cites
  evidence that did not exist, or was not available, when `<id>` was
  dispositioned. A reopen without such evidence is **barred** and the
  adjudicator records it as barred rather than re-arguing it.
- **Finding record shape.** Every consolidated finding row carries: `id`,
  origin tag, defect class, severity, disposition, one-line reason, and — when
  the disposition is a carry — its **landing site**.
- **Id format.** `<panelPhase>-R<round>-<nn>`, e.g. `PLAN-R2-03`; unique within
  the run. The id is the handle `REOPENED(<id>)` resolves against. It is *not*
  the binds-forward key (that stays the defect class), so cross-session lookups
  are unaffected.
- **Ratified-decision collision.** A finding that contradicts a decision the
  human owner has ratified is **escalated to the owner**, never absorbed by the
  adjudicator and never silently dismissed.
- **Carry destinations and the no-orphan rule.** §3, C7.
- **Amendment classes.** §3, C4.

## 3. Contracts

Each contract states *what normative text must exist, where*. Exact wording is
the implementer's, subject to the scenarios.

### C1 — Glossary section (`references/system-reference.md`)

- **Placement:** a new top-level section appended after §14 ("Presenting
  questions to the human"), numbered **§15 "Iteration & disposition"**.
  Appending (not inserting) keeps every existing section number stable, so no
  cross-reference in any other file breaks.
- **Content:** every term group in §2 above, plus the carry destinations (C7)
  and amendment classes (C4).
- **Boundary:** terms only. Who mints an id, when a panel re-dispatches, and
  what a gate does are **mechanics** and belong to the phase references. The
  glossary may name an actor only inside a term's definition where the actor is
  part of the meaning (e.g. "escalated *to the owner*").
- **Budget:** ≤ 60 lines (Plan assumption 1).

### C2 — Panel run-shape (`references/phase-pr-review.md` §5, plus one §1 clause)

Ten additions, distributed across the existing numbered steps:

| # | Step | Addition |
|---|---|---|
| 1 | 2 (Dispatch) | **Delta-dispatch obligation**: every round after the first carries the prior findings *and their dispositions* into the reviewer task, and scopes the reviewer to the delta commit range. |
| 2 | 3 (Consolidate) | **Id minting**: consolidation assigns each finding its `<panelPhase>-R<round>-<nn>` id. |
| 3 | 3 | **Origin tagging**: every consolidated row carries `NEW` or `REOPENED(<id>)`; a reopen failing the evidence bar is recorded as barred. |
| 4 | 4 (Adjudicate) | **Ratified-collision escalation**: a finding contradicting an owner-ratified decision escalates; it is never absorbed. |
| 5 | 4 | **Dismissal posture**: two consecutive waves at 100% incorporation is a reportable smell — the adjudicator says so to the human rather than continuing silently. |
| 6 | 4 | **Trim-the-tail**: when a round yields no highs and at most one medium from one reviewer, fix it and re-dispatch **only that reviewer** for a delta confirmation, or offer the human accept-without-re-dispatch. |
| 7 | 4 | **Sub-floor exemption**: the configured floor governs **full review rounds**; a trim-the-tail delta confirmation is an exempt sub-floor dispatch, recorded as such in that round's `consolidated.md`, and is **not** a shortfall under `review.onShortfall`. |
| 8 | 4 | **Backlog checkpoint**: the PR gate is not passable while a `CARRY-TO-BACKLOG` disposition lacks a filed issue id recorded in `consolidated.md`. |
| 9 | 5 (Stop) | **Round-4 cap**: if the 4th round returns any high or medium, no 5th round is dispatched; the orchestrator presents a churn diagnosis. |
| 10 | 5 | **Churn diagnosis**: four bounded options — (a) genuine rev-1 defects → continue; (b) churn from our own fix waves → restructure; (c) design flaw → backward transition; (d) ratified dismissal of survivors — **adjudicated by the human**. At `pr_review`, (d) is the only route to "move on": the cap never permits merging past a surviving high or medium. |
| — | 5 | **Artifact-inventory self-audit**: the diagnosis and each gate presentation state the per-round inventory (round *n* ↔ consolidated file ↔ `panel.dispatched`/`panel.consolidated` events ↔ harvest label). Non-blocking; visibility, not enforcement. |

**§1 bridging clause.** `phase-pr-review.md:21` says standalone adopted mode runs
"at the committed mode/floors, **never below them**". One clause is added there
defining floors as governing **full review rounds**, so the sub-floor exemption
does not contradict it.

### C3 — Carry dispositions per phase

| Reference | Outbound (may mint) | Inbound (must verify landed) | Checkpoint blocked |
|---|---|---|---|
| `phase-plan.md` §5 | `CARRY-TO-SPEC` | — (no `CARRY-TO-PLAN` exists) | — |
| `phase-spec.md` §5 | `CARRY-TO-BUILD` | `CARRY-TO-SPEC` | the Spec **gate** |
| `phase-tasks.md` §8 | — | `CARRY-TO-BUILD` | build-plan **completion evidence** (Build has no gate — `phase-tasks.md:83-86`) |
| `phase-implement.md` | — | `CARRY-TO-IMPLEMENT` | **task close** |
| `phase-pr-review.md` §5 | `CARRY-TO-BACKLOG` | all of the above (last agent-run gate) | the **PR gate**, pending a filed issue id |

Each outbound entry sits behind an **under your configuration** callout: the
destination is the next phase in the *effective configured sequence*, so under
`shape.separateSpec: false` a merged design gate carries to Build, and on the
reversible track Spec is not a legal destination.

### C4 — Amendment classes (phase-neutral, D3)

Three classes for changing an artifact after its gate approved it:

- **(a)** the change touches a shape already frozen, merged, or bound to →
  **backward transition**; the gate re-runs.
- **(b)** the change refines an unfrozen shape pre-merge → **amend in place**,
  recording trigger, class, disposition, and author; no new panel (#136).
- **(c)** a reviewer-grade contradiction discovered later → **normal fix wave**.

Placement, because the nine phase-reference headings are frozen
(`test/phase-references.test.js:20-30`):

| Reference | Section | Why |
|---|---|---|
| `phase-plan.md`, `phase-spec.md` | **§5** | The question is whether the gate re-runs — a gate-seam question. |
| `phase-tasks.md` | **§8** | Build has no gate; there the question is whether affected tasks' approved checks / PV1 manifests need **renewed approval**. |
| all three | §6 | keeps only a pointer: class (a)'s destination is the backward transition §6 already owns. |

### C5 — Spec-gap log (`phase-tasks.md` §4)

The build-plan doc gains a **Spec gap log** section: one row per upstream
deficiency found during decomposition, with four columns — **description**,
**severity** (`blocker` | `minor`), **disposition** (`backward-transition` |
`assumption-recorded` | `CARRY-TO-IMPLEMENT`), **landing site**. An empty log is
written as an explicit "none", never omitted.

`assumption-recorded` composes with the existing Assumptions appendix
(`phase-implement.md:63-67`) rather than duplicating it.

### C6 — Reviewer prompts (`prompts/adversary-{plan,spec,review}.prompt.md`)

Each gains, as static text in the prompt body:

1. **Delta-round law** (identical in all three): rounds after the first are
   delta reviews; tag every finding `NEW` or `REOPENED(<prior-id>)`; a reopen
   requires evidence absent when the ancestor was dispositioned; confirming a
   prior fix is one line, not re-litigation.
2. **A carry-landing attack surface, scoped per prompt** (uniform wording would
   be vacuous or misdirected — `PLAN-R3-02`):
   - `adversary-plan`: **none**, stated explicitly as a decision ("no
     `CARRY-TO-PLAN` destination exists"), so a later reader sees a decision
     rather than an omission.
   - `adversary-spec`: verify every inbound `CARRY-TO-SPEC` has landed.
   - `adversary-review`: verify **every carry minted anywhere in this run** has
     landed — including a `CARRY-TO-BACKLOG`'s filed issue id, and
     `CARRY-TO-BUILD`/`-IMPLEMENT`, whose checkpoints are otherwise attested
     only by the agent that owed them.

`validator-task.prompt.md` is **not** touched.

### C7 — Frozen-surface handling

`test/frozen-surfaces.test.js` drops the three reopened prompts from `FROZEN`,
retains every other entry including `validator-task.prompt.md`, and its header
comment names this slice and its mandatory post-merge re-freeze follow-up (the
# 190 → #191 pattern, D9).

### C8 — Consumer `workflow.md` (this repo only)

`.pi/sdlc/workflow.md` deletes the four promoted rules (delta-dispatch block,
dismissal posture, round cap, trim-the-tail) and retains the other six verbatim.
**No standing test asserts consumer workflow content** — it is a
`consumer-integration` surface whose process text is locally owned; the promotion
is proved once, in this slice's diff.

## 4. Non-functional requirements

| NFR | Requirement | Bound to |
|---|---|---|
| N1 | **Zero runtime behaviour change.** No script, schema, or config file changes; no new CI job or step. | IDV16 |
| N2 | **Test budget.** New scenarios are offline greps in the existing corpus style; whole-suite runtime delta < 2s. | IDV17 |
| N3 | **Reference size.** The glossary ≤ 60 lines; `phase-pr-review.md` stays readable after ten §5 additions — if it does not, a §5 sub-structure is a presentation change, not a scope change. | IDV18 (inspection) |
| N4 | **Frozen-surface integrity.** Every frozen surface except the three named prompts is byte-identical to the branch base. | IDV19 |
| N5 | **No consumer breakage.** A repo on the previous release that adopts this one gains prose obligations only; nothing it has committed becomes invalid. | IDV20 (inspection) |

## 5. Verification scenarios

Kind: **mechanical** (a test decides it) or **inspection** (a human/panel decides
it at a named point). Every scenario states its falsifier.

| id | kind | Scenario | Falsified when |
|---|---|---|---|
| **IDV1** | mechanical | `system-reference.md` contains exactly one section titled "Iteration & disposition". | zero or ≥2 such sections |
| **IDV2** | mechanical | That section defines both origin tags, all four dispositions, `defect class`, the reopen bar, the record shape, the id format, the carry destinations, the no-orphan rule, ratified collision, and the three amendment classes. | any term absent |
| **IDV3** | mechanical | Section numbering §1–§14 in `system-reference.md` is unchanged from the branch base. | any pre-existing section renumbered |
| **IDV4** | mechanical | Each of `phase-plan.md`, `phase-spec.md`, `phase-tasks.md`, `phase-implement.md`, `phase-pr-review.md` cites the glossary section **by name**. | any of the five lacks the citation |
| **IDV5** | mechanical | `phase-pr-review.md` §5 contains all ten C2 additions (asserted by distinctive phrase per row). | any addition missing |
| **IDV6** | mechanical | `phase-pr-review.md` §1 contains the floors-govern-full-rounds clause. | absent |
| **IDV7** | mechanical | The round cap in `phase-pr-review.md` names **round 4** and lists four bounded options. | states round 3, or lists ≠4 options |
| **IDV8** | mechanical | `phase-pr-review.md` states that at `pr_review` "move on" requires ratified dismissal and never permits merging past a surviving high/medium. | absent, or states an unconditional move-on |
| **IDV9** | mechanical | Amendment classes (a)(b)(c) appear in `phase-plan.md` §5, `phase-spec.md` §5, `phase-tasks.md` §8. | any of the three lacks them, or any places them in §6 |
| **IDV10** | mechanical | §6 of those three references contains a class-(a) pointer and **no** class-(b)/(c) definition. | §6 defines forward amendment |
| **IDV11** | mechanical | Each outbound carry statement sits within an "under your configuration" callout. | any states a destination unconditionally |
| **IDV12** | mechanical | The four inbound checkpoints of C3 each appear in their named reference and section. | any missing or in the wrong section |
| **IDV13** | mechanical | `phase-pr-review.md` states the backlog checkpoint (PR gate blocked pending a filed issue id). | absent |
| **IDV14** | mechanical | `phase-tasks.md` §4 specifies the spec-gap log with all four columns and the explicit-"none" rule; **and `templates/sdlc-tasks.md` is byte-identical to the branch base**. | a column missing, or the template modified |
| **IDV15** | mechanical | Each of the three adversary prompts contains the delta-round law; `adversary-spec` and `adversary-review` contain their carry surfaces; `adversary-plan` contains the explicit "no `CARRY-TO-PLAN`" statement; `validator-task.prompt.md` is byte-identical to the branch base. | any prompt lacks its clause, or the validator prompt changed |
| **IDV16** | mechanical | No file under `skills/sdlc/scripts/`, `skills/sdlc/schema/`, or `.github/workflows/` differs from the branch base. | any differs (N1) |
| **IDV17** | mechanical | The full corpus passes; the new scenarios execute no subprocess and make no model call. | any new test spawns a process or exceeds the budget (N2) |
| **IDV18** | inspection (spec + PR panel) | The glossary is ≤ 60 lines and `phase-pr-review.md` §5 remains navigable. | panel judges either false (N3) |
| **IDV19** | mechanical | `frozen-surfaces.test.js` passes with the three prompts removed and every other entry retained; its header names the re-freeze follow-up. | any other frozen file differs, or the header lacks the note (N4) |
| **IDV20** | inspection (PR panel) | Nothing a consumer repo has already committed becomes invalid under the new prose. | panel identifies a breaking obligation (N5) |
| **IDV21** | mechanical | `.pi/sdlc/workflow.md` contains none of the four promoted rules and all six retained ones. | any promoted rule survives, or a retained rule is lost. **Verified in this slice's diff only — no standing test** (C8) |
| **IDV22** | inspection (PR panel) | No phase reference restates a glossary *definition* (Plan DoD 2a). | panel finds a duplicated definition |
| **IDV23** | mechanical | `test/phase-references.test.js` still passes for all six references (nine headings + config callouts). | any reference breaks the heading contract |

**Coverage:** 19 mechanical, 4 inspection. Every NFR is bound to a scenario;
N3/N5 are bound to inspection scenarios with a named decision point, not left
unbound.

## 6. Out of scope

Unchanged from Plan §Out: no mechanical enforcement of the vocabulary (#174 rec
3), no `--author` derivation (#159), no plan-altitude guard (S2), no scenario
kind labels (S1), no IA front matter (S7), no `build_review` (S8), no ceremony
invocation (#158), no retrofit of historical `consolidated.md` artifacts, and
the post-merge re-freeze PR is its own track:none change.

## 7. Assumptions

1. Appending the glossary as §15 (rather than inserting it thematically) is the
   right trade: it keeps §1–§14 numbering stable for every existing
   cross-reference. IDV3 makes the trade checkable.
2. The three prompt sections are hand-synced; no generator guards them
   (Plan assumption 3, and `PLAN-R4-02` explicitly declined to claim otherwise).
   IDV15 checks presence, not identity.
3. `phase-pr-review.md` §5 absorbs ten additions without restructuring. If the
   spec panel judges otherwise (IDV18), a §5 sub-structure is a presentation
   change and needs no Plan amendment.
