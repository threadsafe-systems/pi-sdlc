# Plan panel — iteration & disposition vocabulary (S5)

- **Artifact under review (round 1):** `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `7c2ae92`
- **Phase:** `plan_review` · **Track:** irreversible · **Floor:** 2 · **onShortfall:** fail
- **Panel:** `anthropic/claude-fable-5:xhigh`, `google/gemini-3.1-pro-preview:xhigh`
- **Orchestrator / author identity:** `anthropic/claude-opus-5` (read from this session's `model_change` record; excluded from the panel)
- **Harvest:** `.pi/sdlc/runs/iteration-disposition-vocabulary/panels/plan_review-round1-2026-07-26` (label 1 = wave 1)

Finding ids are **run-scoped**: `PLAN-R<round>-<nn>`. They are the within-run
handle for `REOPENED(<id>)`; the binds-forward dismissal bar keys on finding
*class*, not id.

## Round 1 — 1 high, 7 medium, 4 low · incorporated 12, dismissed 0

| id | class | sev | reviewer(s) | finding | disposition |
|---|---|---|---|---|---|
| PLAN-R1-01 | NEW | high | fable-5 | No-orphan rule has no enforcement point; `CARRY-TO-BUILD`'s named receiver has no gate (`phase-tasks.md:81-83`) and `phase-implement.md` is absent from scope | **incorporated** — rev2 adds inbound-carry obligations per receiving phase and replaces "gate" with "gate *or completion evidence*" for gateless phases; `phase-implement.md` added to scope |
| PLAN-R1-02 | NEW | medium | fable-5 | Carry destinations assume the maximal shape; `separateSpec:false` / reversible make `CARRY-TO-SPEC` point at a phase that does not exist (`phase-plan.md:74,95-97`) | **incorporated** — destination defined as the next phase in the *effective configured sequence*; concrete tokens are maximal-shape instances; under-your-configuration callout required |
| PLAN-R1-03 | NEW | medium | fable-5 | Round-cap "move on" is unbounded and, in the shared §5, would let a human move past surviving high/medium at `pr_review` — weakening a gate (`SKILL.md:194`, `phase-pr-review.md:242`) | **incorporated** — churn options enumerated (keep-going / restructure / backward / ratified-dismissal); at `pr_review` "move on" is reachable **only** through ratified dismissal, never past a surviving high/medium |
| PLAN-R1-04 | NEW | medium | fable-5 | Trim-the-tail's one-reviewer round contradicts the configured floor + `onShortfall: fail` it will now live beside | **incorporated** — floor governs full review rounds; a trim-the-tail delta confirmation is an explicitly exempt sub-floor dispatch, recorded as such |
| PLAN-R1-05 | NEW | medium | fable-5 | DoD 11 cannot fail: the vocabulary is authored *after* this slice's own panels run, and "dividend observed" names no observable | **incorporated** — replaced with the checkable core (this slice's consolidated artifacts tag every row and record a disposition per row) |
| PLAN-R1-06 | NEW | medium | fable-5 | Finding-id minting is unowned; `REOPENED(<prior-id>)` presupposes stable ids nobody creates | **incorporated** — consolidation mints ids, run-scoped uniqueness, `<phase>-R<round>-<nn>`; class (not id) remains the binds-forward key |
| PLAN-R1-07 | NEW | medium | fable-5 | A permanent package test asserting this repo's `.pi/sdlc/workflow.md` content inverts the gate/process authority rule (consumer-integration surface, locally owned process) | **incorporated** — demoted to a one-time diff/DoD assertion for this slice; no standing corpus test over consumer workflow text |
| PLAN-R1-08 | NEW | medium | gemini-3.1-pro | New verification machinery states no time/cost budget (PROPORTIONALITY) | **incorporated** — budget stated: offline greps, no new CI job or step, whole-suite delta target < 2s. Verified beyond the finding: `ci.yml` carries **no `timeout-minutes` at all** — recorded as a parked pre-existing gap, not fixed here |
| PLAN-R1-09 | NEW | low | fable-5 | DoD 2's "does not restate a definition" is a judgement call inside an all-falsifiable list | **incorporated** — split into a mechanical citation-presence check and an explicitly review-judged non-duplication item |
| PLAN-R1-10 | NEW | low | fable-5 | Forward-amendment law filed under §6, a heading frozen as "Refusal and backward-transition behaviour" (`test/phase-references.test.js:20-30`) | **incorporated** — amendment classes move to **§5** (they decide whether the gate re-runs); §6 keeps class (a)'s backward destination pointer |
| PLAN-R1-11 | NEW | low | fable-5 | D4's round-3→4 change is recorded as amending #174 rec 1 but not as deviating from the ratified R5 slate text | **incorporated** — D4 now carries the same explicit deviation clause D7 carries |
| PLAN-R1-12 | NEW | low | gemini-3.1-pro | `workflow.md` retains **six** rules, not the five the plan claims | **incorporated** — verified against `.pi/sdlc/workflow.md`; corrected to six |

**Dismissal posture (self-audit).** Wave 1 ran at **100% incorporation, 0
dismissals**. Under the rule this slice is promoting, that is a reportable smell
at *two consecutive* waves; at wave 1 it is disclosed rather than defended.
Nothing in this wave was reviewer overreach — the high is a genuine hole in a
brainstorm-ratified decision (D8), and the two lows that looked like nits
(PLAN-R1-10, -12) were confirmed against the frozen heading test and the
consumer file respectively.

**Artifact-inventory self-audit (the mechanism this slice proposes).**

| Round | Reviewer outputs | Consolidated | `panel.dispatched` | `panel.consolidated` | Harvest |
|---|---|---|---|---|---|
| 1 | `fable-5.md`, `gemini-3.1-pro-preview.md` | this file | emitted | emitted | `plan_review-round1-2026-07-26` |

**Ratified-decision collisions:** none raised. Both reviewers respected the
provenance table; no finding demanded reopening D1–D10 without new evidence.

---

## Round 2 (delta, `a83f11a..bd19184`) — 1 high, 4 medium, 4 low · incorporated 9, dismissed 0

**Dispatch:** both panelists re-dispatched with the round-1 findings table and
their dispositions, scoped to the delta. Every finding came back tagged; fable-5
additionally returned twelve one-line prior-fix confirmations rather than
re-litigating — the delta instruction worked as designed.

**Reviewer-verdict recovery:** the `gemini-3.1-pro-preview` child was reported
`failed` by the subagent acceptance layer ("completed without making edits for an
implementation task") while having returned a complete verdict. Per
`phase-pr-review.md` §5 "Reviewer dispatch recovery", a reviewer that returns a
verdict has completed its assignment and is never replaced; this was an
acceptance-layer mislabel of a read-only review, **not** an infra failure. No
replacement was dispatched and the floor was met with the two configured models.

| id | origin | sev (adjudicated) | reviewer(s) | finding | disposition |
|---|---|---|---|---|---|
| PLAN-R2-01 | NEW | medium | **both** (fable medium, gemini high) | `CARRY-TO-BACKLOG` is the one destination with no checkpoint, yet DoD 12 claimed none lacks one | **incorporated**, taking fable's stronger fix over gemini's: rather than *exempting* terminal destinations, the PR gate is now not passable until the backlog issue is filed and its id recorded. Graded medium: the hole is real but one clause closes it. Cross-model agreement recorded as signal |
| PLAN-R2-02 | NEW | medium | gemini (self-graded high) | Adversary prompts never gain the inbound-carry check, so the no-orphan rule is a dead letter at the agent-run gates — reviewers cannot read phase references | **incorporated** — scope item 7 gains an inbound-carry attack surface. Re-graded medium: the human gate still catches it, and the fix is one prompt clause |
| PLAN-R2-03 | NEW | **high** | gemini | Terminology collision: rev2 called `NEW`/`REOPENED`/`CARRY-TO` "finding classes", but `phase-pr-review.md:209-217` already uses "finding class" for the semantic defect category the binds-forward bar keys on | **incorporated** as new **D12** — three distinct nouns (origin tag / disposition / defect class). Grade upheld at high: shipped as written it would corrupt the vocabulary of an existing working rule inside the very glossary meant to fix vocabulary |
| PLAN-R2-04 | NEW | medium | fable-5 | Objective bullet 2 still said §6 for amendment and omitted `phase-implement.md` — rev2's fixes were not propagated to the Objective | **incorporated**; triggered the rev3 whole-document sweep rather than a local patch |
| PLAN-R2-05 | NEW | medium | fable-5 | Build-plan amendment cited into `phase-tasks.md` §5, whose entire content is "Build has no gate" — making the relocation rationale vacuous there | **incorporated** — Build's amendment citation moves to §8 with an explicitly different subject (renewed task/PV1 approval) |
| PLAN-R2-06 | NEW | low | fable-5 | DoD 12's "items 4, 5, 5b" reads against the DoD numbering space, not the scope table | **incorporated** — disambiguated to "scope items" |
| PLAN-R2-07 | NEW | low | fable-5 | Provenance table headed "the ten ratified brainstorm decisions" while carrying eleven rows, one minted at review | **incorporated** — heading and intro now separate D1–D10 (brainstorm) from D11–D12 (plan review) |
| PLAN-R2-08 | NEW | low | fable-5 | Id-minting rule placed in the "terms only" glossary despite naming an actor; DoD 1's term list omitted the id format | **incorporated** — D11 split: format is a term (glossary), minting is a mechanic (§5); DoD 1 now lists seven term groups including the format |
| PLAN-R2-09 | NEW | low | fable-5 (confidence medium) | Sub-floor exemption written into §5 leaves §1's "never below them" (`phase-pr-review.md:21`) unreconciled | **incorporated** — scope item 2 now includes the §1 bridging clause |

### Dismissal posture — the smell fired

**Two consecutive waves at 100% incorporation, 0 dismissals.** Under the rule
this slice promotes (#174 rec 4), that is a reportable smell and is hereby
reported to the human owner rather than defended. The orchestrator's assessment:
no finding in either wave was reviewer overreach — every one was verified against
file:line before incorporation, and two (PLAN-R1-01, PLAN-R2-03) were holes in
decisions the orchestrator itself had written. The honest reading is that rev1
and rev2 were genuinely defective, not that the adjudicator is spineless; but the
rule exists precisely because that is what a spineless adjudicator would also
say, so the human is the judge.

### Churn diagnosis (volunteered early — the cap does not fire until after round 4)

Four of round 2's nine findings (`PLAN-R2-01`, `-04`, `-06`, `-07`, and arguably
`-05` and `-08`) were **introduced by rev2's own fix wave**, not present in rev1
— #174's churn signature exactly. Under D4's option (b) the response is to
**restructure rather than re-dispatch**: rev3 is a whole-document consistency
sweep, and the round-3 question for the human is whether to confirm it with a
full round, a trim-the-tail single-reviewer delta, or to accept and gate.

### Artifact-inventory self-audit

| Round | Reviewer outputs | Consolidated | `panel.dispatched` | `panel.consolidated` | Harvest |
|---|---|---|---|---|---|
| 1 | `round1-claude-fable-5.md`, `round1-gemini-3.1-pro-preview.md` | this file | emitted | emitted | `plan_review-round1-2026-07-26` |
| 2 | `round2-claude-fable-5.md`, `round2-gemini-3.1-pro-preview.md` | this file | emitted | emitted | `plan_review-round2-2026-07-26` |

**Ratified-decision collisions (round 2):** none. No reviewer demanded reopening
D1–D11; D12 was minted additively.
