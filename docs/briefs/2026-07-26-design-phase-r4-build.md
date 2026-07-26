# R4: Build — decomposition, sequencing, DoD assertion (gap analysis)

Resolves ticket [#197](https://github.com/threadsafe-systems/pi-sdlc/issues/197),
part of map [#192](https://github.com/threadsafe-systems/pi-sdlc/issues/192).
Baseline commit: `f1cfad3`.

## Object under critique

`skills/sdlc/references/phase-tasks.md` (craft layer only — gate/hook/refusal
semantics not under critique per map #192) and `templates/sdlc-tasks.md`
(standalone entrypoint router). Craft guidance evaluated: decomposition
(granularity, slicing, grouping), sequencing (blocking-edge discipline), DoD
assertion (PV1 coverage vs done), no-redesign boundary, human comprehension
surface.

Grounding evidence: two real build plans from this repo —
`docs/plans/2026-07-24-pv1-task-scoped-tests-build.md` (irreversible, 3 tasks,
tracker-published) and `docs/plans/2026-07-24-tracker-ops-helper-build.md`
(reversible, 4 tasks, tracker-published) — plus the PV1 manifest contract in
`references/phase-implement.md` and the shared question-presentation contract in
`references/system-reference.md` §14.

---

## 1. Expertise — the Delivery Lead / Tech Lead lens

**Owner role:** In a mature human organisation, the Build phase is owned by the
**Tech Lead / Delivery Lead** — the person who translates a vetted design into
an executable work plan and assigns it to engineers. Their habitual questions,
mapped against the current reference:

1. **"Does each task have one clear owner and a bounded stop-condition?"**
   — *Partially.* Phase-implement.md §10 defines dispatched-worker scope and
   stop-condition for Implement. Phase-tasks.md §9 (tracker projection) wires
   blocking edges and per-task sub-issues. But the build-plan doc itself does
   not mandate these as per-task structural fields — the stop-condition concept
   is an Implement concern, not a Build one. The real examples show good
   practice (pv1 T1 has "Scope of work:" bullets) but the reference never
   requires it.

2. **"Is the sequencing defensible — which tasks are on the critical path, which
   are genuinely parallel, and why?"** — *Absent.* Phase-tasks.md §9 states
   blocking edges "only where a task genuinely can't start before another
   finishes" and adds "most tasks in a well-sliced build have none." The
   tracker-ops build plan has zero rationale for its T1→T2→T3→T4 ordering. The
   pv1 build plan says T3 "can run in parallel with T1/T2" but never explains
   *why* (T3 is docs-only; T1 edits code). No critical-path reasoning exists
   anywhere.

3. **"How much detail is enough — could a new engineer pick up any task and
   ship?"** — *Absent.* Phase-tasks.md §4 says tasks carry "objectives,
   rationale, check commands, and scenario ids." No boundary rule. An agent
   could produce a one-sentence task or an encyclopedic brief — neither
   violates the contract. The stop-condition concept (phase-implement.md §10)
   is Implement-level; Build never defines "enough."

4. **"What is the integration risk — does finishing task A break task B's
   assumptions?"** — *Absent.* No integration-ordering rationale, no
   surface-sharing annotation. When two tasks are declared parallel (no
   blocking edge), there is no check that they don't touch the same file or
   frozen surface.

5. **"If the spec was wrong about something, how do we know — and what do we
   do?"** — *Partially.* Backward transition is "always allowed" (§6, plus
   system-reference.md iron law), and the "zero blocking questions" discipline
   (§4) forces any upstream gap into a backward transition or an assumption.
   But there is no structured gap-report mechanism — the agent either rolls
   back the whole lifecycle or silently patches via assumption.

---

## 2. Boundaries — contract with Spec and Implement, and the redesign line

**Consumption boundary.** Phase-tasks.md §2: Build "never invents scenario ids
for absent upstream." The consumption contract is clean: the Spec's committed
scenario ids are the sole input, and Build refuses-with-redirect when they are
absent (`sdlc:tasks` template, §3 degradation contract). This is sound, cited
at `phase-tasks.md:38-42` and `templates/sdlc-tasks.md:18-21`.

**Production boundary.** Build produces a committed build-plan doc with per-task
objectives, rationale, check commands, and scenario ids (§4). The doc stays
authoritative even when projected to the tracker. This is clean at
`phase-tasks.md:21-23`.

**The no-redesign rule.** Phase-tasks.md §4 dialogue discipline: "Build expects
zero blocking questions … A genuinely blocking question here almost always means
the Spec's scenarios or the Plan's definition of done are incomplete — present
it as a proposed backward transition." This is the counterfeit-artifact rule's
conversational twin: Build papers over an upstream hole with neither fabricated
ids nor questions. The rule is sound, but it has no structural middle ground
between "roll back" and "assume and proceed."

**Backward-transition seam.** §6: "always allowed when decomposition reveals an
upstream gap." The seam is findable (a short, prominent section) but not
*actionable* — there is no structured gap-report artifact, no severity
classification, and no "lightweight amendment" path. The Case channel-presence
pre-merge fine-tuning (2026-07-23, cited in map #192) is the canonical
exhibit: a spec revision happened at build/implement time, and the owner noted
the existing process had no proportionate path for it. The backward-transition
seam exists; what's missing is the granularity of response — "back to Spec" vs
"spec-amendment note, carry on" vs "recorded assumption."

**Build as "reviewable record" with no reviewer.** Phase-tasks.md §4 says "the
committed build-plan doc is the reviewable record." But §5 states "Build has no
gate of its own." The phrase "reviewable record" is honest about intent but
undermined without a review mechanism — who reviews it, and when? The answer is
"downstream, per-task, during Implement" (§5), which means a build-plan error
surfaces at the most expensive point. This tension between "reviewable" and
"ungated" is the structural gap that #131's `build_review` proposal addresses.

---

## 3. FR/NFR placement — what enters, gets bound, gets verified at Build

Build is a *translation* phase: it doesn't introduce new requirements. It
converts the Spec's falsifiable scenarios into per-task check commands.

**What enters:** Committed scenario ids from the approved Spec (irreversible) or
the Plan's definition of done (reversible). Phase-tasks.md §2:8-10.

**What gets bound (made falsifiable at the task level):** Every scenario maps to
named check commands via the per-task ownership map. The pv1 build plan makes
this explicit: "T1 → TST1–TST14, evidence: TST1–TST12 → tests.contract." Each
check command is an exact argv string → mechanically executable → falsifiable.
This binding is the strongest part of the current Build design.

**What gets verified:** PV1 manifests (phase-implement.md §5) carry five
categories — `tests`, `static`, `scenarios`, `standards`, `bannedPatterns` —
each `required` or `n/a`-with-reason. The `scope` field (Rule A/Rule B) adds a
mechanical completeness check. Build *defines* the verification (names the
checks); Implement *executes* it. This separation is clean and defensible.

**NFRs at Build:** If the Spec carries an NFR scenario (e.g., "response time
<200ms under 100 concurrent requests"), Build has no guidance on translating it
into a check command. The five PV1 categories cover quality attributes narrowly:
`tests` (correctness), `static` (style), `standards` (version/doc compliance),
`bannedPatterns` (security-sensitive patterns). Performance, observability,
accessibility, and resilience have no natural category. This is a real gap but
a mild one — NFR binding is primarily a Plan/Spec responsibility per map #192.
Build's role is only to name the check command when one exists.

**DoD at task level — verification vs done.** PV1 PASS means "checks passed."
Phase-implement.md §5: "A task is not done until the runner returns PASS." The
Plan's DoD is at the *change* level, not per task. There is no per-task DoD
beyond PV1 PASS — no assertion that assumptions were recorded, that frozen
surfaces were re-protected (the post-merge follow-up pattern visible in the pv1
build plan), or that a non-mechanical judgment task got human eyes. The
build-plan doc itself carries a "Definition of done (build-level)" in the
tracker-ops example, but that's the change-level DoD restated, not per-task.

---

## 4. Iteration discipline — absorbing reviewer material without target-growth spirals

**Build has no gate** (phase-tasks.md §5). This is a deliberate design choice:
Build is a derived artifact from the vetted Spec, so it needs no adversarial
panel. The consequence: any Build error — wrong sequencing, missing task,
incorrect scenario mapping — propagates to Implement and surfaces at the PR
panel, the most expensive catch point.

**Evidence: Case #35 (#131).** The build plan correctly identified a parallel
frontier (`cc-t1` / `cc-t2` independent), but execution completely ignored it.
"No second eyes reviewed the task splits, sequencing, or parallelisable seams
before coding started" (#131). A 1-reviewer sense-check at the build→implement
boundary would have caught this before work was dispatched.

**Evidence: #174 (plan-panel non-convergence).** The 14-round plan-panel churn
analysis is not a Build problem — it happened at Plan. But two findings
transfer: (a) target-growth spirals happen when every fix wave adds text, and
(b) the binds-forward dismissal machinery must engage on recurring finding
classes. If a `build_review` gate were introduced, it should carry the same
guards: a 1-reviewer pass (not a panel), no target growth (review the plan as
committed — don't grow it during review), and a dismissal rule (reviewer flags
problems; the builder addresses or records a reasoned dismissal).

**Literature transferability.** The method brief's lens-4 corpus asks whether
human inspection theory transfers to machine-speed adversarial review. For
Build specifically:

- **Fagan inspections** (entry/exit criteria at every phase boundary): the
  Fagan model says inspect the output of each operation before entering the
  next. In our terms: inspect the build plan before entering Implement. This
  transfers directly — a 1-reviewer build_review is a literal Fagan inspection
  between design-complete and coding. **Adopt.**

- **Defect-density stop rules** (Gilb/Graham): "inspect until defect density
  drops below threshold." For a build review, the equivalent is simpler: one
  pass, flag problems, address or dismiss, proceed. A build plan is a small,
  bounded artifact (~50–150 lines in the real examples) — one review pass is
  the natural ceiling.

- **Modern code review research** (Bacchelli & Bird): review as convergent
  conversation. For a build review this means: the reviewer should verify
  Spec-to-Task completeness (every scenario owned by some task) and
  blocking-edge correctness (no declared-parallel tasks touching the same
  frozen surface), not audit implementation-level detail. The prompt boundary
  is narrow by design.

- **Own telemetry as primary source:** n=0 — no build_review has ever run, so
  there is no telemetry to derive rules from. The honest answer for Build is
  "derive guardrails from the plan-panel evidence (#174 clauses adapted) and
  calibrate after a few runs."

---

## 5. Human comprehension surface — the minimum visual/structural artifact

**Current state.** The build plan is a linear markdown doc. Both real examples
are well-structured: ownership map, per-task objective/scope/checks, scenario
ids. But neither explains *why* the ordering, and neither provides a structural
comprehension artifact that a human can scan for the shape of the work.

The pv1 build plan says "T2 blocked by T1" and "T3 can run in parallel with
T1/T2" — the data exists but the reasoning is absent. The tracker-ops build
plan has no sequencing justification at all beyond the numbered order.

**What the `sdlc-visual-docs` seam could do.** System-reference.md §9 describes
the skill: declare node IDs in headings, edge triples in front matter, render
to interactive HTML. A build plan's task ids are already node IDs, and its
blocking relationships are already edges. A dependency-graph front-matter
block — declarative, markdown-native, zero code change — would make the work
shape immediately visible:

```yaml
---
ia:
  nodes:
    - T1: Validator core + frozen-surface reopen
    - T2: Fixture reconciliation + full corpus green
    - T3: Documentation
  edges:
    - [T1, T2, blocks]
    - [T1, T3, independent]
    - [T2, T3, independent]
---
```

This is the zero-tooling baseline (mermaid flowchart in markdown, rendered by
GitHub natively) and optional `sdlc-visual-docs` enrichment (interactive HTML).
The data already exists in the tracker projection's blocking edges; the gap is
surfacing it in the build plan doc itself.

**Minimum mandatory surface.** For tracker-backed builds above the
`publishToTracker` threshold (i.e., multi-session, multi-worker builds), a
dependency graph is the minimum structural artifact. For below-threshold
single-session builds, it is optional — the plain task list is sufficient. This
follows the existing threshold-based pattern (§9 already gates tracker
publication on task count).

**What's missing in the current reference:** Phase-tasks.md never mentions
`sdlc-visual-docs` or any comprehension artifact. The build plan carries the
data but not the reasoning, and the surface is pure linear prose.

---

## 6. Ceremony scaling — consistency check against map #158

Map #158 is decision-complete: dynamic ceremony, estimator, per-handoff
re-derivation, always-park. Build under the current design already scales to
zero ceremony for small changes: no gate, optional tracker publish
(threshold-gated), per-task validation at Implement.

**Consistency points:**

1. **Build has no gate** — this is the ultimate collapse for small changes.
   Phase-tasks.md §5: "Build has no gate of its own — it is derived from the
   vetted Spec." This is consistent with #158's design that ceremony collapses
   for low-complexity changes. The estimator (#161 brief §6) suggests a
   `collapse` field that can skip phases; Build is already the most
   collapsible.

2. **Verification is a per-task dial priced at build-exit** (#160 decision).
   The build plan carries per-task check commands and scope tags, which the
   verification dial needs to price. This is fully consistent — Build is the
   artifact that feeds the verification estimator.

3. **Tracker publish is already threshold-gated** (§9). This is a natural
   ceremony-scaling knob: below-threshold builds stay plain docs; above-
   threshold builds get the tracker overhead. Consistent with #158's cost-
   ceiling bounds.

**No literature contradiction found.** The INVEST-derived "Small" criterion
says "tasks should fit in a sprint" (human-scale). Our equivalent is "task
should fit in a single agent dispatch (a few turns)" — the existing build
examples average ~50 lines per task, which is consistent. The estimator brief's
S/M/L/XL banding would make this structural.

**One named tension for the build stream:** If #159's envelope drops
`publishToTracker` as a config value (the envelope deletes all ceremony
judgments), the threshold becomes an estimator output instead. The existing
build-plan doc's task count threshold needs to be either (a) kept as a
surviving *law* (a fact about the repo, not a ceremony judgment) or (b) moved
to the estimator as a suggestion. This is a build-stream implementation
question, not a contradiction — the estimator brief's §6 `suggestion` block
already has the shape for it.

---

## Consolidated gap table

| Id | Lens | Current | Model | Gap | Candidate change | Verdict |
|---|---|---|---|---|---|---|
| R4-G1 | 2,4 | `phase-tasks.md:64` — "Build has no gate of its own" | Fagan inspection — entry/exit criteria at every phase boundary (Fagan, 1976); #131 `build_review` proposal | A build-plan error (wrong sequencing, missing task, incorrect scenario mapping) propagates undetected to Implement and PR. Case #35 (#131): identified parallel frontier was ignored. | Add an optional `build_review` gate — 1-reviewer sense-check, adversary-build.prompt.md verifying Spec-to-Task completeness + blocking-edge correctness, no target growth (review the committed plan, don't grow it). Size class: new check + template section. | **Adopt** |
| R4-G2 | 1 | `phase-tasks.md:21-30` — tasks carry "objectives, rationale, check commands, and scenario ids"; no granularity rule | INVEST (Wake, 2003) — I-N-V-E-S-T criteria for task quality | Task granularity is habitual, not principled. An agent could produce a monolithic T1 spanning half the Spec with no structural warning. Both real examples show good slicing but the guidance never cites a standard. | Add an INVEST-derived task-quality checklist to §4 as a "before committing the build plan" self-check: each task must be Independent (no undeclared dependency), bounded-scope (stop-condition stated), Testable (at least one named check command), and scenario-traceable (≥1 spec scenario owned). Size class: prose-only. | **Adapt** — "Negotiable" and "Valuable" (human-negotiation concepts) become "bounded scope" and "scenario-coverage"; "Estimable" becomes the estimator's S/M/L/XL band. |
| R4-G3 | 3 | `phase-implement.md:155` — "A task is not done until the runner returns PASS" | Definition of Done (Scrum Guide 2020) — "formal description of the state … when it meets the quality measures"; DoD vs Acceptance Criteria distinction (Atlassian, 2026) | PV1 covers verification ("did the checks pass") but not the broader "is this task complete" — e.g., assumptions recorded, frozen surfaces re-protected, non-mechanical tasks got human eyes. The "Assumptions" appendix (§4) records calls but isn't a DoD gate. | Add a per-task DoD template to §4 that Build populates: checks pass, assumptions recorded, scenario evidence linked, adjacent frozen surfaces audited (where the build plan maps surface-sharing). PV1 already covers the check-passing half. Size class: template section. | **Adopt** |
| R4-G4 | 1,5 | `phase-tasks.md:78` — blocking edges per §9; no rationale or dependency graph in the build plan doc | Critical Path Method (PMBOK/Atlassian) — longest sequence of interdependent tasks; User Story Mapping (Patton, 2014) — "arrange tasks in left-to-right narrative flow" | The build plan declares blocking edges but never explains *why*. Both real examples state sequencing as fact without rationale. No structural comprehension artifact (dependency graph) exists in the doc, though the data exists in the tracker projection. | Add "Sequencing rationale" to §4: per blocking edge, one-line reason; per parallel group, independence justification. Add optional mermaid dependency graph (or `sdlc-visual-docs` front matter) for tracker-backed builds above threshold. Size class: template section + optional structural graph. | **Adapt** — CPM assumes estimated durations (we don't have them); adopt the dependency-graphing and rationale parts only. |
| R4-G5 | 2 | `phase-tasks.md:65-66` — "Backward transition … always allowed when decomposition reveals an upstream gap"; system-reference.md §3 iron law | No direct literature analogue. Closest: Google design-doc culture (Winters/Manshreck) — "anyone can comment; author addresses or records as non-goal." | The backward-transition mechanism is binary (go back / proceed). There is no structured "gap found but small — record, carry on, let the human decide at gate review" path. An agent must either trigger a full lifecycle rollback or silently assume-and-proceed. The #174 finding that mid-review pivots needed a "push to Spec" escape applies symmetrically. | Add "Spec gap log" to the build plan template: upstream deficiencies discovered during decomposition, each with description, severity (blocker/minor), and disposition (backward-transition / assumption-recorded / carry-to-Implement-checklist). Makes the spec-adequacy signal visible without forcing rollback for every finding. Size class: template section. | **Adapt** — not from a named framework; derived from own process evidence (#174). |
| R4-G6 | 1 | `phase-tasks.md:21-23` — tasks carry "objectives, rationale, check commands, and scenario ids." No boundary rule. | Work Breakdown Structure (PMI) — "decompose until each work package has enough detail for one owner to estimate, complete, and track"; Google design doc culture — "enough detail that a new team member could implement it" | The task detail level is implied by example but never stated as a rule. An agent could produce one-sentence tasks or encyclopedic briefs — neither violates the contract. The stop-condition concept exists in Implement (§10) but isn't seeded in Build. | Add "Task boundary rule" to §4: "Each task describes enough that a same-model agent dispatched with only the task's objective, check commands, and scenario ids can complete it without reading the Spec. If it needs the Spec, the task is under-specified." Size class: prose-only. | **Adopt** — direct adaptation of the "new team member" test to agent dispatch. |
| R4-G7 | 1,2 | `phase-tasks.md:78` — blocking edges "only where a task genuinely can't start before another finishes"; "most tasks in a well-sliced build have none" | Critical Path Method — parallel task coordination risk | When two tasks are declared parallel (no blocking edge), there is no check that they don't touch the same code surface or frozen surface. The pv1 example has T1 (code) and T3 (docs-only) parallel — safe by accident, not by rule. An agent could declare two file-sharing tasks parallel, creating merge-conflict churn. | Add integration-risk annotation per parallel group: for each set of unblocked parallel tasks, state the surfaces they share (if any) and the merge-order discipline. If two parallel tasks touch the same file, flag it and either sequence or add a merge-note. Size class: prose-only. | **Adopt** |

---

## Sources

**Kept:**

- Wake, B. (2003). INVEST in Good Stories. XP2003 / xp123.com. — canonical task-quality criteria; adapted for agent-scale tasks at R4-G2.
- Kniberg, H. & Cockburn, A. (2013). Elephant Carpaccio facilitation guide (blog.crisp.se). — vertical-slicing exercise; referenced as the thin-slice principle's canonical workshop format. Supports R4-G2 (adapt INVEST to vertical slices).
- Patton, J. (2014). User Story Mapping. O'Reilly. — narrative-flow sequencing and grouping (backbone activities). Cited at R4-G4 for sequencing-by-narrative-flow.
- Fagan, M. E. (1976). Design and Code Inspections to Reduce Errors in Program Development. IBM Systems Journal. — entry/exit criteria at every phase boundary. The direct analogue for a build_review gate at R4-G1.
- Scrum Guide (2020, Schwaber & Sutherland). — Definition of Done as "formal description of quality measures." DoD is part of Scrum; DoR is optional/not official. Cited at R4-G3 for per-task DoD.
- Atlassian (2026). Definition of Done vs Acceptance Criteria (atlassian.com/agile). — DoD validates engineering quality; AC validates feature behaviour. Cited at R4-G3.
- PMI. Work Breakdown Structure (PMBOK Guide). — decompose until one owner can estimate/complete/track. Cited at R4-G6 for task boundary rule.
- PMI. Critical Path Method (PMBOK Guide / Atlassian 2026, atlassian.com/work-management). — longest sequence of interdependent tasks. Cited at R4-G4 and R4-G7.
- Winters, T., Manshreck, T., Wright, H. (2020). Software Engineering at Google, ch. 3. — design-doc culture: "enough that a new team member could implement it," alternatives considered. Referenced at R4-G5 and R4-G6.
- Gilb, T. & Graham, D. (1993). Software Inspection. — defect-density stop rules. Referenced in lens 4 for convergence guards.
- Bacchelli, A. & Bird, C. (2013). Expectations, Outcomes, and Challenges of Modern Code Review. ICSE. — review as convergent conversation. Referenced in lens 4.
- pi-sdlc internal: #174 (plan-panel non-convergence evidence), #136 (operator-feedback discipline), #131 (build_review candidate), #158 + estimator brief (ceremony consistency), pv1-task-scoped-tests build plan, tracker-ops-helper build plan.

**Dropped:**

- Scrum Alliance (2025) DoR-vs-DoD blog — secondary summary of the official Scrum Guide position; superseded by primary source (Scrum Guide 2020).
- Various Medium/blog INVEST summaries — secondary; Wake's original formulation is the primary source.
- Asana/Wrike CPM guides — tool-vendor summaries; PMBOK/Atlassian are the canonical framework sources.

---

## Handoff to R5 (#198)

**Top-3 gap rows by judged leverage:**

1. **R4-G1 (build_review gate):** The highest-leverage single change. A
   1-reviewer sense-check between build and implement would have caught the
   Case #35 parallel-frontier ignore — the canonical failure mode. Fagan
   inspection theory directly supports it; the adversary-build prompt is a
   natural sibling to the existing adversary-plan/adversary-spec prompts. This
   is the one gap where the literature says "you must" and we say "we don't."

2. **R4-G3 (per-task DoD):** PV1 PASS is verification, not done. The gap
   between "checks passed" and "task is complete" is where frozen-surface
   re-protection, assumption recording, and non-mechanical judgment live. The
   pv1 build plan's post-merge follow-up PR pattern is exactly the kind of
   task-level completion work that slips through a verification-only gate.

3. **R4-G4 (sequencing rationale + dependency graph):** The data exists
   (blocking edges in tracker projection) but the reasoning doesn't. The
   `sdlc-visual-docs` seam is the zero-new-tooling path — mermaid in markdown
   front matter, rendered by GitHub natively, enriched by the existing
   renderer. For tracker-backed builds above threshold, this is the minimum
   structural artifact that makes the work shape visible.

**Cross-phase tension flagged for R5:**

- **R4-G1 (build_review) interacts with the envelope config (#159).** If the
  envelope deletes per-phase gate dials in favour of estimator-driven ceremony,
  `build_review` needs to sit in the bounds layer (allowlisted phase for
  optional review) rather than as a config dial. R5 should state whether
  build_review is an envelope *bound* (repo declares "I want build reviews
  above complexity L") or a dead dial (the estimator decides). I judge it a
  bound — it's a repo policy, not a ceremony judgment — but that's R5's call.

- **R4-G3 (per-task DoD) composes with #160's per-task verification dial.**
  The verification dial at build-exit (#160) prices *how* to verify. The
  per-task DoD says *what done means beyond verification*. These are distinct
  but adjacent — R5 must ensure they don't duplicate or conflict. The DoD
  template here says "assumptions recorded, frozen surfaces audited"; the
  verification dial says "runner-only / runner+validator / runner+independent-
  eyes." Both can coexist as separate task-table columns.
