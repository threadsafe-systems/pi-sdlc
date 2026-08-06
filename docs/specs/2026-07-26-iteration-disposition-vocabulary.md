# Spec: cross-gate iteration & disposition vocabulary (S5)

Upstream: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` rev5
(approved 2026-07-26). Track: **irreversible**. Slice S5 of the ratified slate in
`docs/briefs/2026-07-26-design-phase-r5-synthesis.md`.

**Rev 3** — incorporates spec-panel round 1 (17 findings) and round 2 (12 after
cross-model dedup: 3 high, 9 medium); 0 dismissed in either wave. Round 2's
reviewer roster changed mid-wave: `claude-fable-5` infra-failed twice without a
verdict and was replaced by `openai-codex/gpt-5.6-luna:xhigh` per
`phase-pr-review.md` §5's dispatch-recovery rule. Record:
`docs/reviews/spec-review-iteration-disposition-vocabulary-2026-07-26/consolidated.md`.
Rewritten whole rather than patched: three of round 1's findings were
enumeration/pointer drift, the defect class this run has regenerated in every
patch wave.

This Spec fixes the contracts, their exact placement, and the falsifiable
scenarios. It does not re-argue the Plan's decisions D1–D12.

## 1. Amendments to the approved Plan

Every amendment below is **class (b)** — refining an unfrozen, unmerged shape —
recorded here *and* marked in the Plan itself, because C4(b) requires amendment
**in place** and a record that lives only downstream leaves the approved artifact
lying to its next reader (`SPEC-R1-05`). No count is stated: the records are
A1‥A*n* below and a hand-maintained cardinality has drifted four times in this
run (`SPEC-R3-02`).

### A1 — scope item 6 folded into scope item 5

| | |
|---|---|
| **Trigger** | Spec-phase grounding of scope item 6's target path. |
| **Finding** | The Plan named `skills/sdlc/templates/sdlc-tasks.md`. That path does **not** exist: `skills/sdlc/` holds `assets`, `prompts`, `references`, `schema`, `scripts`, `SKILL.md`; templates live at repo root `templates/`. The real `templates/sdlc-tasks.md` is a standalone-entrypoint router — "Thin router; it does not restate phase mechanics" (`templates/sdlc-tasks.md:4-5`). **This repo has no build-plan document template**; the build-plan doc's shape is specified in `phase-tasks.md` §4. |
| **Class** | (b) — the deliverable (spec-gap log + column shape) is unchanged; only its home moves. |
| **Disposition** | Specified in `phase-tasks.md` §4 (C5). No template file is touched. |
| **In-place marker** | Plan scope row 6 and DoD 5 carry an `AMENDED, class (b)` marker pointing here. |
| **Gate impact** | None (D3: class (b) does not re-run the design gate). |
| **Author** | Orchestrator (`anthropic/claude-opus-5`), Spec phase, 2026-07-26. |

### A2 — scope item 11 (CONFIG.md) reconciled, not dropped

| | |
|---|---|
| **Trigger** | Round-1 finding `SPEC-R1-04`: rev1 of this Spec was silent on Plan scope item 11 / DoD 9, and N1's "no config file changes" appeared to forbid them. |
| **Correction to the finding's evidence** | The reviewer asserted "no `chore` commit exists on the branch", having examined only `bd19184..c0e8d22`. The regeneration **was** executed at **`7c2ae92`** (`chore(config-doc): regenerate stale CONFIG.md companion`), earlier on the same branch. The *finding* stands — the Spec was silent — but its evidence is corrected here rather than copied forward. |
| **Class** | (b) — no deliverable changes; the Spec gains the contract and scenario it was missing. |
| **Disposition** | The obligation is already satisfied; it is now gated by **IDV24**, and N1's wording is narrowed to exclude it. |
| **Author** | Orchestrator, Spec phase, 2026-07-26. |

### A3 — id format gains a closed prefix mapping

| | |
|---|---|
| **Trigger** | Round-1 finding `SPEC-R1-08`, formalised after round 2 (`SPEC-R2-01`) noted it changed locked Plan scope without a record. |
| **Finding** | Plan D11 and scope item 1 locked the id format as `<panelPhase>-R<round>-<nn>`. The framework's panel-phase tokens are `plan_review`/`spec_review`/`pr_review`/`task_validate`, so the prefix was underivable and `REOPENED(<id>)` resolution was not reproducible across sessions. |
| **Class** | (b) — the id shape is unfrozen and unmerged; the mapping makes an existing field derivable rather than changing its role. |
| **Disposition** | `<PREFIX>-R<round>-<nn>` with the closed mapping in §2. |
| **In-place marker** | Plan D11 and scope item 1. |
| **Author** | Orchestrator, Spec phase, 2026-07-26. |

### A4 — `barred` added to the disposition set

| | |
|---|---|
| **Trigger** | Round-1 finding `SPEC-R1-09`; round 2 (`SPEC-R2-01`, high, raised independently by both reviewers) established that justifying it in an *assumption* was not sufficient — an assumption cannot override locked Plan scope. |
| **Finding** | Plan D12 and scope item 1 locked a four-value disposition set. A reopen failing the evidence bar is a named outcome with no legal value in it, so the mandatory disposition field had nothing to record. |
| **Class** | (b) — purely additive: no committed artifact uses the four-value set, so nothing is retrofitted. `barred` is distinct from `dismissed` because it is a mechanical consequence of the evidence rule, not a human-ratified verdict. |
| **Disposition** | Five-value set in §2. |
| **In-place marker** | Plan D12 and scope item 1. |
| **Author** | Orchestrator, Spec phase, 2026-07-26. |

> **Amendment hygiene.** A1's fold also required correcting the Plan's
> **Objective** pointer (which still named `templates/sdlc-tasks.md`) and A2's
> row-11 marker, both missing from rev2 and found by round 2 (`SPEC-R2-04`,
> `SPEC-R2-05`). Every amendment recorded here now has a matching in-place
> marker, mechanically asserted by **IDV32**.

## 2. Vocabulary (normative)

Three disjoint kinds, never conflated (D12).

| Kind | Values | Answers |
|---|---|---|
| **Origin tag** | `NEW`, `REOPENED(<id>)` | Where did this finding come from *this round*? |
| **Disposition** | `incorporated`, `dismissed`, `barred`, `CARRY-TO-<dest>`, `escalated` | What was decided about it? |
| **Defect class** | free-text semantic category (e.g. "objective contradiction") | What *kind* of defect is it? **Pre-existing**; this slice records it, and does not redefine it. |

- **`defect class` is the same concept `phase-pr-review.md` §5 currently calls
  "finding class"** (`phase-pr-review.md:211`, `:217` — "do not re-litigate the
  same finding class"). The glossary states the alias explicitly and C2 row 12
  adds the alias sentence at the existing text, so an agent grepping either term
  finds the other (`SPEC-R1-07`).
- **Reopen evidence bar.** `REOPENED(<id>)` is legal only when the finding cites
  evidence that did not exist, or was not available, when `<id>` was
  dispositioned. A reopen failing the bar takes disposition **`barred`** — a
  distinct value, because it is a mechanical consequence of the evidence rule,
  not a human-ratified `dismissed` (`SPEC-R1-09`).
- **Finding record shape.** Every consolidated row carries: `id`, origin tag,
  defect class, severity, disposition, one-line reason, and — when the
  disposition is a carry — its **landing site**.
- **Id format.** `<PREFIX>-R<round>-<nn>`, unique within the run, where `<PREFIX>`
  comes from a **closed mapping** off the panel phase (`SPEC-R1-08`):

  | panelPhase | prefix |
  |---|---|
  | `plan_review` | `PLAN` |
  | `spec_review` | `SPEC` |
  | `pr_review` | `PR` |
  | `task_validate` | `TASK` |

  The id is the handle `REOPENED(<id>)` resolves against. It is **not** the
  binds-forward key — that stays the defect class — so cross-session lookups are
  unaffected.
- **Ratified-decision collision.** A finding contradicting an owner-ratified
  decision is **escalated to the owner**, never absorbed and never silently
  dismissed.
- **Carry destinations and the no-orphan rule.** §3, **C3**.
- **Amendment classes.** §3, **C4**.

## 3. Contracts

Each contract states *what normative text must exist, where*. Wording is the
implementer's, subject to the scenarios.

### C1 — Glossary section (`references/system-reference.md`)

- **Placement:** appended after §14 as **§15 "Iteration & disposition"**.
  Appending keeps §1–§14 numbering stable. (Round 1 verified independently that
  every cross-file reference to a numbered `system-reference.md` section targets
  §≤14 and is presence-based, so appending breaks nothing.)
- **Content:** every term group in §2, plus the carry destinations and no-orphan
  rule (**C3**) and the amendment classes (**C4**).
- **Boundary:** terms only. Who mints an id, when a panel re-dispatches, what a
  gate does — mechanics, owned by the phase references. An actor may appear only
  where it is part of a term's meaning ("escalated *to the owner*").
- **Budget:** ≤ 60 lines, gated **mechanically** by IDV25 (`SPEC-R1-17`).

### C2 — Panel run-shape (`references/phase-pr-review.md` §5, plus one §1 clause)

The additions below are stated **without a count**: IDV5 asserts *every row of
this table* by distinctive phrase, so a row added later cannot escape its gate
and no header number can drift from the table (`SPEC-R1-02` — whose ancestor
class, hand-copied cardinality, this Spec reproduced once before deleting the
count).

| # | Step | Addition |
|---|---|---|
| 1 | 2 | **Delta-dispatch obligation**: every round after the first carries prior findings *and their dispositions* into the reviewer task, scoped to the delta commit range. |
| 2 | 3 | **Id minting**: consolidation assigns each finding its `<PREFIX>-R<round>-<nn>` id per §2's closed mapping. |
| 3 | 3 | **Origin tagging**: every consolidated row carries `NEW` or `REOPENED(<id>)`; a reopen failing the evidence bar takes disposition `barred`. |
| 4 | 4 | **Ratified-collision escalation**: a finding contradicting an owner-ratified decision escalates; it is never absorbed. |
| 5 | 4 | **Amendment of the existing "Only … escalate" sentence** (`phase-pr-review.md:205-207`), which today permits escalation *only* for proposed high/medium dismissals and ratified residual-risk boundaries. It gains ratified-decision collisions as a third case — otherwise §5 ships two contradicting normative sentences (`SPEC-R1-06`). |
| 6 | 4 | **Dismissal posture**: two consecutive waves at 100% incorporation is a reportable smell; the adjudicator says so to the human. |
| 7 | 4 | **Trim-the-tail**: a round with no highs and at most one medium from one reviewer → fix, then re-dispatch **only that reviewer** for a delta confirmation, or offer the human accept-without-re-dispatch. |
| 8 | 4 | **Sub-floor exemption**: the configured floor governs **full review rounds**; a trim-the-tail confirmation is an exempt sub-floor dispatch, recorded as such, and is **not** a shortfall under `review.onShortfall`. |
| 9 | 4 | **Backlog checkpoint**: the PR gate is not passable while a `CARRY-TO-BACKLOG` lacks a filed issue id recorded in `consolidated.md`. |
| 10 | 5 | **Round-4 cap**: if the 4th round returns any high or medium, no 5th round is dispatched. |
| 11 | 5 | **Churn diagnosis**: four bounded options — (a) genuine rev-1 defects → continue; (b) churn from our own fix waves → restructure; (c) design flaw → backward transition; (d) ratified dismissal of survivors — **adjudicated by the human**. At `pr_review`, (d) is the only route to "move on"; the cap never permits merging past a surviving high or medium. |
| 12 | 5 | **Artifact-inventory self-audit**: the diagnosis and each gate presentation state the per-round inventory (round *n* ↔ consolidated file ↔ `panel.dispatched`/`panel.consolidated` ↔ harvest label). Non-blocking — visibility, not enforcement. |
| 13 | 3–4 | **Finding-class alias**: one sentence at the existing binds-forward text stating that "finding class" and the glossary's `defect class` are the same concept. |

**§1 bridging clause.** `phase-pr-review.md:21` ("at the committed mode/floors,
**never below them**") gains one clause defining floors as governing **full
review rounds**, reconciling it with row 8.

### C3 — Carry dispositions per phase

| Reference | § | Outbound (may mint) | Inbound (must verify landed) | Checkpoint blocked |
|---|---|---|---|---|
| `phase-plan.md` | §5 | `CARRY-TO-SPEC` | — (no `CARRY-TO-PLAN` exists) | — |
| `phase-spec.md` | §5 | `CARRY-TO-BUILD` | `CARRY-TO-SPEC` | the Spec **gate** |
| `phase-tasks.md` | §8 | **`CARRY-TO-IMPLEMENT`** (minted as a spec-gap log disposition, C5) | `CARRY-TO-BUILD` | build-plan **completion evidence** (Build has no gate — `phase-tasks.md:83-86`) |
| `phase-implement.md` | **§4** (landing) + **§5** (block) | — | `CARRY-TO-IMPLEMENT` | **task close** at the per-task validator seam |
| `phase-pr-review.md` | §5 | `CARRY-TO-BACKLOG` | every carry minted in the run | the **PR gate**, pending a filed issue id |

- **`phase-implement.md` placement** (`SPEC-R1-13`): the carry *lands* in §4,
  beside the Assumptions appendix it composes with (`phase-implement.md:63-67`);
  the *block* is stated in §5, the per-task validator seam. **Fallback:** under
  `review.tasks: off` there is no PASS gate at all
  (`phase-implement.md:71-73`), so §5 states that the obligation then falls to
  the PR panel's carry-landing surface (C6), which checks every carry minted in
  the run. No configuration leaves the carry unchecked.
- **Configuration callouts:** each outbound entry **except `CARRY-TO-BACKLOG`**
  sits behind an *under your configuration* callout, because the destination is
  the next phase in the *effective configured sequence* (under
  `shape.separateSpec: false` a merged design gate carries to Build; on the
  reversible track Spec is not a legal destination). `CARRY-TO-BACKLOG` is
  terminal and universally available, so a callout would be misleading
  (`SPEC-R1-16`).
- **Every outbound statement is gated** by IDV26 — all four, not two: rev1 gated
  only the callout *form* (vacuous with zero statements, `SPEC-R1-01`), and rev2
  still omitted `CARRY-TO-IMPLEMENT` and `CARRY-TO-BACKLOG` (`SPEC-R2-02`,
  `SPEC-R2-03`). `CARRY-TO-IMPLEMENT` previously had **no minting owner at all**:
  C5 permitted it as a spec-gap disposition while C3 gave `phase-tasks.md` no
  outbound column — a legal disposition no phase could emit.

### C4 — Amendment classes (phase-neutral, D3)

- **(a)** touches a shape already frozen, merged, or bound to → **backward
  transition**; the gate re-runs.
- **(b)** refines an unfrozen shape pre-merge → **amend in place**, recording
  trigger, class, disposition, and author; no new panel (#136). When the
  amendment is authored by a *later* phase, the full record may live in that
  phase's artifact provided the amended artifact carries an in-place marker
  pointing to it — an amendment discoverable only downstream is not "in place"
  (`SPEC-R1-05`; §1 is the worked example).
- **(c)** a reviewer-grade contradiction discovered later → **normal fix wave**.

Placement, given the nine frozen headings (`test/phase-references.test.js:20-30`):

| Reference | § | Subject |
|---|---|---|
| `phase-plan.md`, `phase-spec.md` | §5 | whether the gate re-runs |
| `phase-tasks.md` | §8 | whether affected tasks' approved checks / PV1 manifests need **renewed approval** (Build has no gate) |
| all three | §6 | a pointer only: class (a)'s destination is the backward transition §6 already owns |

### C5 — Spec-gap log (`phase-tasks.md` §4)

The build-plan doc gains a **Spec gap log**: one row per upstream deficiency
**found during decomposition *or* carried inbound from Spec** (`SPEC-R1-14` — an
inbound `CARRY-TO-BUILD` originates at Spec, so a decomposition-only definition
could not receive it). Four columns: **description**, **severity**
(`blocker` | `minor`), **disposition** (`backward-transition` |
`assumption-recorded` | `CARRY-TO-IMPLEMENT`), **landing site**. An empty log is
written as an explicit "none", never omitted.

`assumption-recorded` **routes the entry to the existing Assumptions appendix**
(`phase-implement.md:63-67`) rather than duplicating it — gated by IDV27
(`SPEC-R1-15`).

### C6 — Reviewer prompts (`prompts/adversary-{plan,spec,review}.prompt.md`)

Three additions per prompt:

1. **Delta-round law** (identical in all three): rounds after the first are delta
   reviews; tag every finding `NEW` or `REOPENED(<prior-id>)`; a reopen requires
   evidence absent when the ancestor was dispositioned; confirming a prior fix is
   one line, not re-litigation.
2. **An `origin:` field added to each prompt's STRICT output format**
   (`SPEC-R1-12`). All three prompts enumerate a closed per-finding field list
   and `adversary-review` says "Return ONLY a markdown list of findings, nothing
   else" — so the tag needs a declared home, or a format-compliant reviewer may
   legally omit it.
3. **A carry-landing attack surface, scoped per prompt** (uniform wording would
   be vacuous or misdirected):
   - `adversary-plan`: **none**, stated explicitly as a decision ("no
     `CARRY-TO-PLAN` destination exists"), so a later reader sees a decision, not
     an omission.
   - `adversary-spec`: verify every inbound `CARRY-TO-SPEC` has landed.
   - `adversary-review`: verify **every carry minted anywhere in this run** has
     landed — including a `CARRY-TO-BACKLOG`'s filed issue id, and
     `CARRY-TO-BUILD`/`-IMPLEMENT`, whose checkpoints are otherwise attested only
     by the agent that owed them (and which are unchecked entirely under
     `review.tasks: off` — C3's fallback).

`validator-task.prompt.md` is **not** touched.

### C7 — Frozen-surface handling

`test/frozen-surfaces.test.js` drops the three reopened prompts from `FROZEN`,
retains every other entry including `validator-task.prompt.md`, and its header
names this slice and the mandatory post-merge re-freeze follow-up (#190 → #191
pattern, D9).

### C8 — Consumer `workflow.md` (this repo only)

`.pi/sdlc/workflow.md` deletes the four promoted rules and retains the other six
verbatim. **No standing test asserts consumer workflow content** — it is a
`consumer-integration` surface whose process text is locally owned; the promotion
is proved once, in this slice's diff.

## 4. Non-functional requirements

| NFR | Requirement | Bound to |
|---|---|---|
| N1 | **Zero runtime behaviour change.** No changes to `skills/sdlc/scripts/`, `skills/sdlc/schema/`, or `.github/workflows/`; no new CI job or step. (`.pi/sdlc/CONFIG.md`'s already-committed regeneration is *excluded* — it is generated consumer state required by Plan scope item 11, not a runtime surface — A2.) | IDV16, IDV24 |
| N2 | **Test budget.** New scenarios make **no model calls and no network calls**; local `git` subprocesses are permitted, matching the corpus (`test/frozen-surfaces.test.js:44-48` uses `execFileSync("git", …)`). Whole-suite runtime delta target ~2s, **advisory** — no measurement procedure is specified, so it is not claimed as a gate (`SPEC-R1-03`). | IDV17 |
| N3 | **Reference size.** Glossary ≤ 60 lines (mechanical); `phase-pr-review.md` §5 remains navigable after the C2 additions (inspection). | IDV25, IDV18 |
| N4 | **Frozen-surface integrity.** Every frozen surface except the three named prompts is byte-identical to the branch base. | IDV19 |
| N5 | **No consumer breakage — bounded claim.** Within **this repository's** committed artifacts (`docs/plans/*`, `docs/specs/*`, `docs/reviews/*/consolidated.md`, `.pi/sdlc/*`), nothing becomes invalid under the new prose. Consumer repos are **out of scope** by the Plan's own boundary, so no claim is made about them (`SPEC-R2-12` — rev2's universal claim was unfalsifiable and contradicted that boundary). | IDV20 (inspection, bounded) |

## 5. Verification scenarios

Kinds: **mechanical** (a standing test decides it), **inspection** (a human/panel
decides it at a named point), **diff-inspection** (this slice's PR panel decides
it by reading the diff; deliberately leaves no standing test).

| id | kind | Scenario | Falsified when |
|---|---|---|---|
| **IDV1** | mechanical | `system-reference.md` contains exactly one section titled "Iteration & disposition". | zero or ≥2 |
| **IDV2** | mechanical | That section defines both origin tags, all five dispositions, `defect class` **with its "finding class" alias**, the reopen bar, the record shape, the id format **with the closed prefix mapping**, carry destinations, no-orphan, ratified collision, and the three amendment classes. | any term or the alias/mapping absent |
| **IDV3** | mechanical | §1–§14 numbering in `system-reference.md` is unchanged from the branch base. | any pre-existing section renumbered |
| **IDV4** | mechanical | `phase-plan.md`, `phase-spec.md`, `phase-tasks.md`, `phase-implement.md`, `phase-pr-review.md` each cite the glossary section by name. | any of the five lacks it |
| **IDV5** | mechanical | `phase-pr-review.md` §5 contains **every row of the C2 table**, asserted by distinctive phrase per row. | any row's phrase absent |
| **IDV6** | mechanical | `phase-pr-review.md` §1 contains the floors-govern-full-rounds clause. | absent |
| **IDV7** | mechanical | The round cap names **round 4** and lists four bounded options. | states round 3, or ≠4 options |
| **IDV8** | mechanical | At `pr_review`, "move on" requires ratified dismissal and never permits merging past a surviving high/medium. | absent, or an unconditional move-on |
| **IDV9** | mechanical | Amendment classes (a)(b)(c) appear in `phase-plan.md` §5, `phase-spec.md` §5, `phase-tasks.md` §8. | any missing, or any placed in §6 |
| **IDV10** | mechanical | §6 of those three contains a class-(a) pointer and **no** class-(b)/(c) definition. | §6 defines forward amendment |
| **IDV11** | mechanical | Every outbound carry statement **except `CARRY-TO-BACKLOG`** sits within an "under your configuration" callout. | any conditional destination stated unconditionally, or backlog wrapped in a callout |
| **IDV12** | mechanical | The four inbound checkpoints of C3 each appear in their named reference **and section**, including `phase-implement.md` §4 landing + §5 block. | any missing or in the wrong section |
| **IDV29** | mechanical | `phase-implement.md` §5 states the `review.tasks: off` fallback routing the carry obligation to the PR panel's carry-landing surface. | absent — in which case the claim "no configuration leaves the carry unchecked" is false (`SPEC-R2-07`) |
| **IDV30** | mechanical | The existing "**Only** … escalate" sentence at `phase-pr-review.md:205-207` is itself amended to admit ratified-decision collisions as a third case. | a collision rule is appended elsewhere while the "Only" sentence stands unchanged — the contradiction `SPEC-R1-06` identified, surviving (`SPEC-R2-08`) |
| **IDV31** | mechanical | The `finding class` ↔ `defect class` alias sentence appears **at the binds-forward paragraph** (`phase-pr-review.md:209-217`), not merely somewhere in §5. | the alias exists only in the glossary or elsewhere in §5 (`SPEC-R2-09`) |
| **IDV32** | mechanical | For every amendment record `A<n>` in this Spec's §1, **every Plan surface that amendment touches** carries an adjacent marker naming **that specific record** (`AMENDED, class (b) … A<n>`). | any amended surface lacking its own marker, or a marker naming no record — a marker elsewhere in the Plan must not satisfy the gate (`SPEC-R2-06`, strengthened per `SPEC-R3-01`) |
| **IDV13** | mechanical | `phase-pr-review.md` states the backlog checkpoint. | absent |
| **IDV14** | mechanical | `phase-tasks.md` §4 specifies the spec-gap log with all four columns, **their exact allowed values** (severity `blocker`\|`minor`; disposition `backward-transition`\|`assumption-recorded`\|`CARRY-TO-IMPLEMENT`), the explicit-"none" rule, and the inbound-carry source; **`templates/sdlc-tasks.md` is byte-identical to the branch base**. | a column missing, an enum value absent or extended, source omitted, or the template modified (`SPEC-R2-10`) |
| **IDV15** | mechanical | Each of the three adversary prompts contains the delta-round law and its C6 clause; `adversary-plan` states the explicit "no `CARRY-TO-PLAN`"; `validator-task.prompt.md` is byte-identical to the branch base. | any prompt lacks its clause, or the validator prompt changed |
| **IDV16** | mechanical | No file under `skills/sdlc/scripts/`, `skills/sdlc/schema/`, or `.github/workflows/` differs from the branch base. | any differs (N1) |
| **IDV17** | mechanical | The full corpus passes; new scenarios make no model call and no network call. | any new test calls a model or the network (N2) |
| **IDV18** | inspection (spec + PR panel) | `phase-pr-review.md` §5 remains navigable after the C2 additions. | panel judges it unnavigable (N3) |
| **IDV19** | mechanical | `frozen-surfaces.test.js` passes with the three prompts removed and every other entry retained; its header names the re-freeze follow-up. | any other frozen file differs, or the header lacks the note (N4) |
| **IDV20** | inspection (PR panel) | No artifact committed **in this repository** at the named N5 paths becomes invalid under the new prose. | panel identifies a committed artifact at those paths that the new obligations invalidate (N5) |
| **IDV21** | diff-inspection (PR panel) | `.pi/sdlc/workflow.md` contains none of the four promoted rules and all six retained ones. | any promoted rule survives, or a retained rule is lost (C8 — deliberately no standing test) |
| **IDV22** | inspection (PR panel) | No phase reference restates a glossary *definition* (Plan DoD 2a). | panel finds a duplicated definition |
| **IDV23** | mechanical | `test/phase-references.test.js` still passes for all six references. | any reference breaks the heading contract |
| **IDV24** | mechanical | `config-doc check` reports `current` for `.pi/sdlc/CONFIG.md`. | reports `stale`/`missing`/`error` (A2, Plan DoD 9) |
| **IDV25** | mechanical | The glossary section is ≤ 60 lines. | 61+ lines (N3) |
| **IDV26** | mechanical | **All four** outbound statements exist at their C3 homes: `CARRY-TO-SPEC` in `phase-plan.md` §5, `CARRY-TO-BUILD` in `phase-spec.md` §5, `CARRY-TO-IMPLEMENT` in `phase-tasks.md` §8, `CARRY-TO-BACKLOG` in `phase-pr-review.md` §5. | any outbound statement absent (`SPEC-R1-01`, `SPEC-R2-02`, `SPEC-R2-03`) |
| **IDV27** | mechanical | `phase-tasks.md` states that `assumption-recorded` entries route to the existing Assumptions appendix. | absent, or specifies a duplicate ledger |
| **IDV28** | mechanical | Each of the three prompts' STRICT output formats includes an `origin:` field. | any lacks it (`SPEC-R1-12`) |

### Coverage

**No totals are stated.** A hand-maintained count of this table has drifted three
times in this run (`PLAN-R3-04`, `SPEC-R1-02`, `SPEC-R2-11`); the kind labels in
the rows are the only source, and coverage is asserted per contract instead:

| Contract | Gating scenarios |
|---|---|
| C1 glossary | IDV1, IDV2, IDV3, IDV25 |
| C2 panel run-shape | IDV5, IDV6, IDV7, IDV8, IDV13, IDV30, IDV31, IDV18 (inspection) |
| C3 carry dispositions | IDV11, IDV12, IDV26, IDV29 |
| C4 amendment classes | IDV9, IDV10, IDV32 |
| C5 spec-gap log | IDV14, IDV27 |
| C6 reviewer prompts | IDV15, IDV28 |
| C7 frozen surfaces | IDV16, IDV19 |
| C8 consumer `workflow.md` | **IDV21 only — deliberately diff-inspection, no standing test.** This is the one contract with no mechanical scenario, by ratified decision (`PLAN-R1-07`): a package test asserting consumer process text would invert the gate/process authority rule. Stated plainly rather than hidden behind a coverage claim (`SPEC-R2-11`). |
| glossary citations | IDV4 |
| corpus integrity | IDV17, IDV23, IDV24 |

Every NFR N1–N5 is bound (see §4).

## 6. Out of scope

Unchanged from Plan §Out: no mechanical enforcement of the vocabulary (#174 rec
3), no `--author` derivation (#159), no plan-altitude guard (S2), no scenario
kind labels (S1), no IA front matter (S7), no `build_review` (S8), no ceremony
invocation (#158), no retrofit of historical `consolidated.md` artifacts, and the
post-merge re-freeze PR is its own track:none change.

## 7. Assumptions

1. Appending the glossary as §15 is the right trade: §1–§14 stay stable for every
   existing cross-reference. IDV3 makes it checkable; round 1 verified no numbered
   cross-reference targets §15+.
2. The three prompt sections are hand-synced; no generator guards them (Plan
   assumption 3). IDV15/IDV28 check presence, not identity.
3. `phase-pr-review.md` §5 absorbs the C2 additions without restructuring. If the
   panel judges otherwise (IDV18), a §5 sub-structure is a presentation change
   needing no Plan amendment.
4. Adding `barred` as a fifth disposition is additive: no committed artifact
   currently uses the four-value set, so nothing is retrofitted. Recorded as
   Plan amendment **A4**, not left as an assumption — an assumption cannot
   override locked Plan scope (`SPEC-R2-01`).
