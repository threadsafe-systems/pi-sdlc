# Research: R2 — Plan phase craft gap analysis

**Baseline:** `f1cfad3`. **Object:** craft only in `skills/sdlc/references/phase-plan.md`, `templates/sdlc-plan.md`, and `skills/sdlc/prompts/adversary-plan.prompt.md`; gate, hook, and refusal semantics are out of scope.

## 1. Expertise

The mature owner is a **staff/principal engineer acting as design-document author and technical decision owner**. Questions checked against the current surfaces:

- Problem, affected actor, evidence, and baseline? — **absent** (`phase-plan.md:12,34-35`; `sdlc-plan.md:4-5` is only a router).
- Non-goals and rejected alternatives, including doing nothing? — **absent** (`phase-plan.md:34-35` only names scope in/out).
- Outcome proof rather than proof that files shipped? — **absent** (`phase-plan.md:34-35`).
- Quality attributes, targets, binding phase, and verification? — **absent**; #146 is only a logged candidate.
- Failure modes, trigger, owner, mitigation, and escape route? — **partial**: rationale/context exist but no risk register (`phase-plan.md:34-35,50-52`).
- Assumptions versus parked questions? — **prompted** by prose triage (`phase-plan.md:45-52`), but not structurally auditable.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G1 — High.** `phase-plan.md:12,34-35`; `sdlc-plan.md:4-5`: objective/rationale fields exist, but no problem-statement structure. | Google design docs recommend goals, alternatives, and trade-offs; Rust RFC 0000 requires detailed problem/use cases, drawbacks, rationale, and alternatives; Oxide RFD 1 separates discussion from authority. [Google](https://abseil.io/resources/swe-book/html/ch10.html) [Rust](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) [Oxide](https://rfd.shared.oxide.computer/rfd/0001) — **adapt** for machine-speed drafts. | A Plan can pass with a solution-shaped rationale and no falsifiable actor, baseline, consequence, evidence, or non-goals. | Add `Problem statement`, `Non-goals`, and `Alternatives considered`. **Done means:** actor/situation, observable baseline evidence, consequence, non-goal, and rejected alternative (or justified “none”) are present; problem prose contains no implementation prescription. **Size:** template section + prose guidance; **adapt**. |
| **R2-G5 — Medium.** `phase-plan.md:45-52` has prose assumptions/parked questions but no risk/pre-mortem fields. | Google/Rust design-doc practice and Klein’s pre-mortem make failure modes and unresolved questions reviewable. [Klein](https://www.gary-klein.com/premortem) [Rust](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) — **adapt**, not a heavyweight project ritual. | Risks lack required trigger, consequence, owner, mitigation, and destination, so risk review is not auditable. | Add compact `{risk/failed future, trigger, consequence, mitigation, owner, destination}` rows. **Done means:** irreversible/cross-component Plans have a risk row and every unresolved item has an owner/destination; small reversible work may justify “no material risks.” **Size:** template section; **adapt**. |

## 2. Boundaries

Plan consumes the agreed Brainstorm design and emits scope/DoD/context, but it does not make the **problem-space → solution-space boundary** explicit. It only says backward transition is allowed (`phase-plan.md:21-22,65-67`), not when new detail is redesign or Spec work. This is craft guidance, not a change to the transition contract.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G2 — High.** `phase-plan.md:21-22,34-35,65-67`: upstream design, scope in/out, and backward transition are named, but no decision-boundary test exists. | Rust RFCs separate motivation/problem, design, drawbacks, alternatives, and unresolved questions; Oxide RFDs preserve pre-commit discussion. [Rust](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) [Oxide](https://rfd.shared.oxide.computer/rfd/0001) — **adapt**. | A Plan can silently turn an objective into implementation/spec detail, and later reviewers cannot falsify whether that detail belongs here. | Add a `Plan boundary` note: objectives/outcomes/constraints here; contracts, schemas, exact scenarios, and mechanics bind in Spec or park/backward. **Done means:** each in-scope item is labelled objective, constraint, or solution decision and each parked item names a destination. **Size:** prose/template labels; **adapt**. |

## 3. FR/NFR placement

### Cross-phase verdict (owned by R2)

**NFRs should be surfaced and classified in Plan, not fully specified there.** Plan should discover applicability, risk, owner, baseline, and intended target. Spec should bind each applicable NFR to a contract, threshold, scenario, or evidence requirement. Build/Implement should assign checks and produce evidence; PR/review and, where relevant, post-merge operation verify it. ISO/IEC 25010 is a taxonomy/checklist, not a requirement to fill every attribute: the official model says characteristics should be specified, measured, and evaluated where possible. [ISO/IEC 25010:2023](https://www.iso.org/obp/ui/en/#!iso:std:78176:en)

This refines #146: retain its AGENTS/README, observability, security/secret delivery, and CI/CD sweep, but add applicability/target/binding/verification columns and map them forward. `n/a` requires a technical reason. Do not duplicate exact scenarios in Plan or command-level checks in Spec.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G3 — High.** `phase-plan.md:34-35` requires objectives and delivery DoD but no impact measurement; #158 only says measurable outcomes are pegged to specifications. | Goal–Question–Metric derives metrics from goals via questions; Impact Mapping connects goal → actors → behaviour change → deliverables. [GQM, University of Maryland](https://www.cs.umd.edu/users/mvz/handouts/gqm.pdf) [Impact Mapping](https://gojko.net/books/impact-mapping/) — **adapt**: internal tooling may use an operational/adoption proxy or explicitly justify no feasible impact measure. | A DoD can prove delivery while no baseline, target, observation window, or evidence can show the problem outcome moved. | Add `Outcome proof` with `{goal, question, metric, baseline, target/window, evidence owner}` and a proxy/no-measurement justification. **Done means:** every objective has one metric or a cited no-measurement rationale, and the metric is carried to Spec/retro. **Size:** template section + optional new check; **adapt**. |
| **R2-G4 — High.** `phase-plan.md:34-35`; `sdlc-plan.md:4-5` add no NFR fields. #146 explicitly proposes a mandatory Plan-time NFR & DoD sweep and downstream validation. | ISO/IEC 25010; #146’s operational/documentation incident evidence — **adapt**: Plan discovers, Spec binds, Build verifies. | Applicable quality attributes and operational/doc obligations may be omitted and cannot then be bound or verified. | Add `Non-functional requirements & repo-doc sweep`: ISO attributes plus #146 rows, each with applicability reason, target/bound phase, owner, and evidence, or justified `n/a`. **Done means:** no blanks; applicable rows appear in Spec/Build traceability. **Size:** template + new-check/linter candidate; **adapt/refine #146**. |

## 4. Iteration discipline

Human inspection and modern code review are analogies, not validated recipes for high-frequency adversarial model review. The local source of truth for round caps, delta review, re-open classification, and altitude is telemetry and #174; #136 supplies operator-feedback durability. These issues are linked rather than restated, per the method.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G6 — High.** `phase-plan.md:62-63` delegates panel shape and `adversary-plan.prompt.md:1-31` lists attack surfaces, but neither gives Plan-craft rules for bounded deltas, NEW/REOPENED findings, plan-vs-spec altitude, or keeping panel history out of the Plan. | Fagan entry/exit discipline and Bacchelli–Bird modern-review evidence are analogies; #174 is primary local evidence. [Bacchelli & Bird](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ICSE202013-codereview.pdf) — **adapt** local telemetry; reject wholesale human cadence. | Re-rounds can absorb every finding and spec-grade detail, growing the target and contradiction surface without a falsifiable boundary. | Add craft instructions: classify findings `NEW`, `REOPENED` with prior id/new evidence, or `CARRY-TO-SPEC`; keep round history in review artifacts; after #174’s evidence threshold present bounded backward/carry/dismiss options. **Done means:** a sample review identifies class, evidence, disposition, and changed sections; operator feedback follows #136’s durable disposition path. **Size:** prose-only prompt/reference; no gate/hook change; **adapt**. |

## 5. Human comprehension surface

The Plan artifact list is shallow prose (`phase-plan.md:34-35`). The shared reference makes visual artefacts optional and points to Mermaid plus the existing `sdlc-visual-docs` IA-graph → interactive HTML seam (`system-reference.md:§9`). The minimum useful Plan visual is an **outcome/objective tree** connecting problem → outcome → objectives → scope/DoD → measures, with risk nodes where useful; Mermaid is the fallback, not new tooling.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G7 — Medium.** `phase-plan.md:34-35` requires no structural/visual artifact; `system-reference.md:§9` leaves visual gate artefacts optional. | C4 zoom, Mermaid markdown diagrams, and the existing renderer seam — **adapt**: one shallow map, zoom only for complex work. [Mermaid](https://mermaid.js.org/) | Reviewers must reconstruct causal links among objectives, scope, DoD, measures, and risks from prose. | Add `Outcome/objective map` with stable IDs/edges for problem/outcome/objective/scope/DoD/measure, as Mermaid or IA-graph front matter. **Done means:** irreversible or multi-objective/cross-component Plans contain it and each objective links to a DoD item and measure (or explicit no-impact reason); small reversible work may justify skipping; renderer lint/render consumes same IDs when available. **Size:** template section + prose-only seam; no new visual tool; **adapt**. |

## 6. Ceremony scaling

**R2-G8 — Low (consistency/enrichment only; #158 is not reopened).** `phase-plan.md:34-35` requires context for the next agent but does not say to carry estimator evidence and the human-ratified recommendation. #158 is decision-complete: ceremony re-derives at every handoff; #160 captures estimate + recommendation + ratification, with class/count rather than concrete models. The estimator brief supplies evidence-first declared-vs-actual progression. [#158](https://github.com/threadsafe-systems/pi-sdlc/issues/158) [Estimator brief](2026-07-23-ceremony-estimator-research.md) — **adopt/enrich**, not contradict.

| Current | Model | Gap | Candidate change |
|---|---|---|---|
| **R2-G8 — Low.** `phase-plan.md:34-35` names next-agent context but no ceremony recommendation payload/evidence. | Ratified #158/#160 handoff model and estimator brief — **adopt** as an implementation-aligned craft pointer. | A Plan can complete without carrying evidence-backed ceremony recommendation needed for next-handoff re-derivation. | Carry estimate evidence, recommendation, ratification/deviations, and declared touch set; concrete roster/model selection stays with envelope/resolve-panel. **Done means:** fields or explicit unavailable reason are present and no static `solo/standard/full` decision is invented. **Size:** prose-only; **adopt, no reopen**. |

## Consolidated gap table

| ID | Severity | Current cited file:line or absent | Model cited + verdict | Gap falsifiable | Candidate change with done-means + size class + verdict |
|---|---|---|---|---|---|
| R2-G1 | High | `phase-plan.md:12,34-35`; `sdlc-plan.md:4-5` — no problem-space fields | Google; Rust RFC; Oxide — adapt | Plan can pass without actor, baseline, consequence, non-goals, or solution-independent evidence. | Problem/non-goals/alternatives; required fields and no implementation prescription. **Template; adapt.** |
| R2-G2 | High | `phase-plan.md:21-22,34-35,65-67` — no explicit boundary test | Rust/Oxide structure — adapt | Design/spec detail can enter Plan without destination or justification. | Label objective/constraint/solution and parked destination; backward option. **Prose/template; adapt.** |
| R2-G3 | High | `phase-plan.md:34-35`; impact block absent | GQM; Impact Mapping — adapt | Delivery DoD can pass with no baseline, target, window, or evidence of outcome movement. | Goal/question/metric/baseline/target/window/owner or justified proxy/no-measurement; carry to Spec/retro. **Template + optional check; adapt.** |
| R2-G4 | High | `phase-plan.md:34-35`; #146 — NFR sweep absent | ISO 25010; #146 — adapt/refine | Applicable quality/operational obligations may be omitted and cannot be bound/verified. | ISO-informed + #146 rows with applicability, target/binding/owner/evidence or justified n/a. **Template + linter candidate; adapt/refine.** |
| R2-G5 | Medium | `phase-plan.md:45-52` — no risk register | Google/Rust; Klein — adapt | Risk trigger, consequence, owner, mitigation, and destination are not auditable. | Compact pre-mortem/risk register with proportional exemption. **Template; adapt.** |
| R2-G6 | High | `phase-plan.md:62-63`; `adversary-plan.prompt.md:1-31` — no delta/altitude discipline | Fagan/MCR analogies + #174/#136 — adapt local evidence | Re-rounds can grow target without NEW/REOPENED evidence or bounded escalation. | Finding classes, prior ids/evidence, carry-to-Spec, external history, bounded options; no gate change. **Prose-only; adapt.** |
| R2-G7 | Medium | `phase-plan.md:34-35`; renderer optional at `system-reference.md:§9` | C4/Mermaid/visual seam — adapt | Causal links problem→outcome→objective→DoD/measure/risk are not structurally visible. | Outcome/objective tree for irreversible/complex work, Mermaid fallback, existing renderer IDs. **Template; adapt.** |
| R2-G8 | Low | `phase-plan.md:34-35` — no estimator handoff cue | #158/#160 + estimator brief — adopt | Next phase may lack evidence-backed ceremony recommendation for re-derivation. | Carry estimate/recommendation/ratification/deviations/touch set, no concrete model. **Prose-only; adopt, no reopen.** |

## Sources

- Kept: [Software Engineering at Google, Documentation](https://abseil.io/resources/swe-book/html/ch10.html) — public primary chapter on design-doc goals, alternatives, and trade-offs.
- Kept: [Oxide RFD 1](https://rfd.shared.oxide.computer/rfd/0001) — primary RFD discussion/authority framing.
- Kept: [Rust RFC 0000](https://github.com/rust-lang/rfcs/blob/master/0000-template.md) — primary problem, drawbacks, alternatives, prior art, unresolved questions template.
- Kept: [GQM, University of Maryland](https://www.cs.umd.edu/users/mvz/handouts/gqm.pdf) — primary Goal → Question → Metric source.
- Kept: [Impact Mapping, Gojko Adzic](https://gojko.net/books/impact-mapping/) — primary goal/actor/impact/deliverable source.
- Kept: [ISO/IEC 25010:2023](https://www.iso.org/obp/ui/en/#!iso:std:78176:en) — official quality taxonomy and measurement principle.
- Kept: [Gary Klein Pre-mortem](https://www.gary-klein.com/premortem) — originator’s risk-discovery description.
- Kept: [Bacchelli & Bird](https://www.microsoft.com/en-us/research/wp-content/uploads/2016/02/ICSE202013-codereview.pdf) — primary modern-review research; used as analogy only.
- Kept: local `docs/plans/2026-07-24-pv1-task-scoped-tests.md` — real plan and plan/spec altitude evidence.
- Kept: local `docs/reviews/plan-review-sdlc-agent-self-documentation-2026-07-18/consolidated.md` — real panel adjudication showing falsifiable plan omissions.
- Kept: local `docs/briefs/2026-07-23-ceremony-estimator-research.md` and #158 — lens-6 consistency evidence only.
- Dropped: SEO summaries and secondary RFC roundups — redundant with primary sources.

## Handoff to R5

Highest leverage: **R2-G1** (falsifiable problem space), **R2-G3** (impact proof separated from delivery DoD), and **R2-G4** (Plan NFR surfacing with Spec binding and Build verification). **R2-G6** is the process-risk amplifier from #174 and should rank alongside them, but remains craft guidance rather than a gate/hook rewrite. Cross-phase tension: NFR and impact rows increase Plan surface, while exact thresholds/scenarios belong in Spec and executable evidence in Build; R5 should require one traceable handoff without duplication. The visual map and #158 handoff are lower-cost enrichments.

## Residual risks

- Human literature does not establish machine-review round caps; calibrate from FS13.
- Internal tooling may lack impact telemetry; require an explicit proxy/no-measurement rationale, not false precision.
- `sdlc-visual-docs` is optional; Markdown/Mermaid remains complete fallback.
