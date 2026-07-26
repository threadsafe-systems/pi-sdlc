# plan_review round 2 (delta) — anthropic/claude-fable-5:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `bd19184`
(delta `a83f11a..bd19184`). Verbatim reviewer output.

---

### CARRY-TO-BACKLOG is the only glossary destination with no checkpoint, yet DoD 12 asserts none lacks one

- severity: medium
- confidence: high
- location: D8 + Scope items 1–2 + DoD 12 (all rev2 text)
- tag: NEW
- defect: Rev2's no-orphan fix names checkpoints for the three phase destinations (Spec gate, Build completion evidence, Implement task close) but names none for the terminal `CARRY-TO-BACKLOG`, while the new DoD 12 claims "no destination in the glossary lacks one." Nothing in scope item 2's enumerated `phase-pr-review.md` §5 additions (delta-dispatch, id minting, tagging, collision escalation, dismissal posture, trim-the-tail, cap, diagnosis, self-audit) blocks anything until the backlog issue is actually filed.
- evidence: D8: "a carry addressed to **a phase** blocks that phase's gate … or its completion evidence" — backlog is not a phase, so the blocking clause is inapplicable by construction; DoD 12: "no destination in the glossary lacks one"; scope item 2 contains no backlog enforcement point.
- impact: DoD 12 is unsatisfiable as scoped (or gets satisfied vacuously by reinterpretation), and the exact orphan-carry failure PLAN-R1-01 closed for phase carries survives at the one destination reachable from the last gate — a `CARRY-TO-BACKLOG` minted at PR review with no filed issue is silently droppable at merge.
- fix: Name the checkpoint (e.g., the PR gate is not passable while a `CARRY-TO-BACKLOG` lacks a filed issue id) in scope item 2 and the glossary, or scope DoD 12's universal clause to phase destinations.

### Objective bullet 2 still files amendment law under §6 and omits phase-implement.md — contradicting the rev2 fixes

- severity: medium
- confidence: high
- location: Objective, bullet 2 (unchanged in the a83f11a..bd19184 diff)
- tag: NEW (incomplete propagation of the PLAN-R1-10 and PLAN-R1-01 fixes; rev1 was internally consistent, rev2 is not)
- defect: The Objective still says "`phase-spec.md` §6 and `phase-plan.md` §6 and `phase-tasks.md` §6 (amendment)" while rev2's scope items 3–5 and assumption 5 move amendment law to §5, and it omits `phase-implement.md` from the consumer list that DoD 2 now requires to cite the glossary.
- evidence: Objective bullet 2 (plan lines ~26–29) vs scope item 3 ("**§5** gains the amendment-class citation … **§6** keeps only class (a)'s backward-transition pointer"), assumption 5 ("amendment's actual question is … a §5 question"), and DoD 2 listing `phase-implement.md`.
- impact: The plan gives the spec author two contradictory placements for the same normative text; a spec following the Objective reproduces the exact defect PLAN-R1-10 was ratified to fix and misses a required consumer.
- fix: Rewrite Objective bullet 2 to say §5 for amendment and add `phase-implement.md` to the consumer list.

### Amendment classes for the Build plan land in a §5 that declares "no gate", making the relocation rationale vacuous there

- severity: medium
- confidence: high
- location: Scope item 5 + assumption 5
- tag: NEW (introduced by the PLAN-R1-10 relocation)
- defect: Assumption 5 justifies the §6→§5 move because "amendment's actual question is whether the gate re-runs — a §5 question", but `phase-tasks.md` §5's entire content is that Build has no gate; the plan never says what an amendment class decides for the Build plan (re-run of downstream per-task validation? a spec-gap log entry? nothing?).
- evidence: phase-tasks.md:81–84 ("## 5. Invariant gate/approval seam … Build has **no gate of its own** — it is derived from the vetted Spec. Its output is validated downstream, per-task, during Implement."); scope item 5: "§5 cites the amendment classes for the Build plan itself".
- impact: The spec author must invent the Build-plan amendment semantics inside a section whose invariant contradicts the citation's stated rationale — the same under-specified-placement class that produced PLAN-R1-10, now on the gateless phase.
- fix: State in scope item 5 what amendment decides for Build (e.g., whether downstream per-task validation re-runs / whether the change is a spec-gap log entry), or house the Build citation in §8 alongside the inbound-carry check.

### DoD 12 cross-references "items 4, 5, 5b" against the wrong numbering space

- severity: low
- confidence: high
- location: DoD 12
- tag: NEW
- defect: Inside the DoD list, "items 4, 5, 5b" reads as DoD items 4 and 5 (adversary prompts; sdlc-tasks template), which carry no inbound-carry obligations; the intended referents are Scope table rows 4, 5, 5b.
- evidence: DoD 4 = "The three adversary prompts…", DoD 5 = "`templates/sdlc-tasks.md`…"; only the Scope table has a row 5b.
- impact: A falsifiability item that names its own check targets ambiguously is not cleanly checkable — the defect class PLAN-R1-09 was about.
- fix: Change to "scope items 4, 5, 5b".

### Provenance table still labelled "the ten ratified brainstorm decisions" but now carries eleven rows, one minted at review

- severity: low
- confidence: high
- location: Plan intro ("its ten ratified decisions are restated below") + "Provenance — the ten ratified brainstorm decisions" heading + D11 row
- tag: NEW
- defect: D11 is sourced solely to `PLAN-R1-06` (plan-panel round 1), not the brainstorm, yet sits in a table whose heading and intro claim ten brainstorm-ratified decisions.
- evidence: D11 source column reads "`PLAN-R1-06`" with no brainstorm Q reference; heading text unchanged in the diff.
- impact: The provenance boundary the plan itself makes load-bearing (ratified-decision collisions must be raised explicitly against the ratified set) is blurred: a reader cannot tell from the table whether D11 carries brainstorm-gate ratification or review-wave incorporation authority.
- fix: Retitle/annotate: D1–D10 brainstorm-ratified, D11 added and ratified at plan review round 1.

### Id-minting rule is placed in the "terms only" glossary despite naming an actor, and DoD 1's six groups omit it

- severity: low
- confidence: high
- location: Scope item 1 vs D11 and DoD 1
- tag: NEW (introduced by the PLAN-R1-06 fix placement)
- defect: Scope item 1 adds the "id minting rule per D11" to a section whose own constraint is "Terms only — no when/who mechanics", while D11's rule names a who ("the **consolidation step** mints ids") and scope item 2 separately gives §5 "id minting (D11)"; DoD 1's checklist of six term groups does not include the id format, so DoD 1 passes even if the glossary omits it.
- evidence: Scope item 1: "**id minting rule per D11**; … Terms only — no when/who mechanics"; D11: "the consolidation step mints ids"; DoD 1: "(classes, reopen bar, record shape, carry destinations + no-orphan, ratified collision, amendment classes)".
- impact: The glossary/mechanics split the whole slice rests on (D1) is violated by the plan's own newest addition, and the duplication invites exactly the restatement DoD 2a polices.
- fix: Glossary carries the id *format* and run-scoped-uniqueness term; §5 carries the minting step; add the format to DoD 1's list.

### Sub-floor exemption is scoped into §5 only, leaving §1's "never below them" unreconciled

- severity: low
- confidence: medium
- location: D7 + Scope item 2 vs `phase-pr-review.md` §1
- tag: NEW
- defect: The trim-the-tail sub-floor exemption is written into §5, but §1 states the adopted standalone mode "runs the committed `pr_review` gate at the committed mode/floors, never below them", and §1 is not in scope; the two sentences will coexist without a bridge.
- evidence: phase-pr-review.md:21 ("at the committed mode/floors, never below them"); scope item 2 touches §5 only. (No mechanical collision: `check-lifecycle.mjs` contains no panel/floor assertions — grep for `panel|floor|consolidated` returns nothing — and `resolve-panel.mjs` gates roster resolution, not re-dispatch.)
- impact: A literal reader of §1 can conclude a one-reviewer delta confirmation is forbidden in standalone-adopted mode, re-creating the ambiguity PLAN-R1-04 closed.
- fix: Have the §5 exemption text explicitly define "floor" as governing full rounds wherever the reference uses it, or add §1's sentence to the touched surfaces.

Prior-fix confirmations (one line each):

- PLAN-R1-01: fixed — D8's gate-or-completion-evidence rule, scope 4/5/5b, DoD 12; `phase-tasks.md:81-84` correctly cited (but see backlog finding above for the residual terminal destination).
- PLAN-R1-02: fixed — D8 resolves destinations against the effective configured sequence with under-your-configuration callouts.
- PLAN-R1-03: fixed — D4's four bounded options with `pr_review` "move on" reachable only via (d).
- PLAN-R1-04: fixed — D7's explicit sub-floor exemption; verified no mechanical enforcement collides (`check-lifecycle.mjs` asserts nothing about panels).
- PLAN-R1-05: fixed — DoD 11 is checkable against committed artifacts, and round-1 `consolidated.md` already complies (NEW tags, run-scoped ids, self-audit tables at consolidated.md:17-38).
- PLAN-R1-06: fixed — D11 matches the id format the round-1 artifact actually uses (`PLAN-R1-01`…); class-keyed binds-forward bar verified at phase-pr-review.md:209-217.
- PLAN-R1-07: fixed — scope item 9 forbids standing tests over consumer `workflow.md`; DoD 6 is diff-verified.
- PLAN-R1-08: fixed — budget stated (offline greps, no new CI step, <2s); verified `.github/workflows/ci.yml` has no `timeout` anywhere (grep exit 1) and the parked note records it honestly.
- PLAN-R1-09: fixed — DoD 2/2a split with the boundary stated.
- PLAN-R1-10: substantively fixed (scope items 3–5, assumption 5) but propagation incomplete — see Objective finding above.
- PLAN-R1-11: fixed — D4 records amendment of #174 rec 1, R5's S5 row, and R3-G7.
- PLAN-R1-12: fixed — the six retained rules named in item 10 match `.pi/sdlc/workflow.md` exactly (price-every-scenario, keep-spec-altitude, PROPORTIONALITY, identity, artifact, writing-comments; verified against the file).

CLEAR: F — track declared irreversible and correct: the glossary freezes a cross-gate vocabulary consumed by S1 ("Precedes S1 … ordering is load-bearing"), and D9/D10 handle the frozen-surface reopen explicitly.
CLEAR: PROPORTIONALITY — the only standing machinery is scope item 9's offline greps with a stated <2s budget in the existing corpus style (test/phase-references.test.js:1-4, "Offline grep; no model calls"); all other new checks are prose obligations or one-time diff review, and the pre-existing unbounded CI is parked, not ratcheted.
