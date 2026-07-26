# Design-phase gap analysis — method & corpus (R0)

Resolves threadsafe-systems/pi-sdlc#193, part of map #192.

This brief fixes the research method for R1–R4 (#194–#197) so their four phase
critiques are structurally comparable and R5 (#198) can consolidate them
mechanically. It defines: the mandatory brief skeleton (the six lenses), the
evaluation rubric, the per-phase literature corpus, the grounding-read list,
and the output contract. It makes no phase judgments itself.

## 1. The object under critique

Each phase ticket critiques exactly one phase reference, as committed at the
time the research brief is written (name the commit SHA in the brief):

| Ticket | Phase | Reference under critique |
|---|---|---|
| R1 #194 | Brainstorm | `skills/sdlc/references/phase-brainstorm.md` |
| R2 #195 | Plan | `skills/sdlc/references/phase-plan.md` |
| R3 #196 | Spec | `skills/sdlc/references/phase-spec.md` |
| R4 #197 | Build | `skills/sdlc/references/phase-tasks.md` |

Baseline characterisation (agreed at R0, so R1–R4 don't re-litigate it): all
four references are **procedural contracts** — invocation modes, hooks, gate
seams, refusal/backward-transition rules, artifact homes. Craft guidance (how
to *think* in the phase) exists but is thin and unevenly distributed:
Brainstorm carries the most (rubber-duck adversarialism, contradiction-or-
declare, proportional research, map mode); Spec carries the draft-scenario
discipline; Build carries the zero-blocking-questions / no-redesign rule; Plan
carries the least (a section list and question triage). The gap analysis is
about that craft layer. The procedural contract is **not** under critique —
candidate changes may *add* craft sections to a reference or a template, but a
proposal to alter gate/hook/refusal semantics is out of scope for this map.

## 2. Mandatory brief skeleton — the six lenses

Every phase brief (R1–R4) uses exactly these top-level sections, in this
order. A lens with nothing to say states that explicitly ("no gap found under
this lens") — silence is not evidence of soundness (the brainstorm reference's
own rule, applied to the research).

1. **Expertise.** Which specialist owns this phase in a mature human
   organisation, and what questions do they habitually ask that our guidance
   never prompts? Output: a named role + a concrete question list, each
   question marked *already prompted / partially / absent* against the current
   reference and template.
2. **Boundaries.** The phase's contract with its neighbours: what it consumes,
   what it must fix, what it must not touch. Where is legitimate deviation
   (e.g. pre-merge spec fine-tuning, Case channel-presence 2026-07-23) vs.
   redesign smuggling? Is the backward-transition seam the right escape hatch,
   and is it findable when needed?
3. **FR/NFR placement.** For this phase: which requirements *enter* here,
   which get *bound* (made falsifiable) here, which get *verified* here.
   R2 additionally owns the cross-phase verdict (do NFRs belong in the plan at
   all — links #146); R1/R3/R4 answer only for their own phase and defer the
   verdict to R2.
4. **Iteration discipline.** How this phase's artifact absorbs reviewer and
   operator material without target-growth spirals. Primary evidence is our
   own telemetry and post-mortems (#174 is the canonical case; #136 the
   operator-feedback discipline) — link, never restate. The literature
   question is narrow: does human-world review research (inspection theory,
   modern code review) transfer to high-frequency adversarial machine review,
   or is the honest answer "no prior art — derive rules from FS13 data"?
5. **Human comprehension surface.** Shallow surface, rich zoom-in. What is the
   *minimum* visual/structural artifact for this phase's gate, and for which
   change classes is it mandatory vs. skipped? Constraint: markdown-first;
   mermaid-in-markdown is the zero-new-tooling baseline; the existing
   `sdlc-visual-docs` skill (IA-graph front matter → interactive HTML) is the
   renderer seam to evaluate — proposals must state whether they feed it,
   extend it, or ignore it, never reinvent it.
6. **Ceremony scaling.** How the phase collapses for small changes. Map #158
   is decision-complete here (dynamic ceremony, estimator, handoff,
   always-park). This lens is a **consistency check only**: does the
   literature contradict or enrich #158's design? A contradiction is reported
   as evidence for #158's build stream, never as a reopened decision.

## 3. Evaluation rubric

Within each lens, every finding is a four-column row. The gap table is the
machine-consolidatable core of the brief; prose argues, the table concludes.

| Column | Content | Discipline |
|---|---|---|
| **Current** | What the reference/template actually says (or omits) | Cite `file:line` or "absent" — the same grounding demanded of panel reviewers |
| **Model** | The literature practice compared against | Named framework + citation (see §4); "own telemetry" is a valid source for lens 4 |
| **Gap** | The delta, stated falsifiably | One sentence; "we could be better at X" is not a gap |
| **Candidate change** | The proposed guidance change | Must carry a falsifiable **done-means** (what a reader/checker could verify) and a **size class** (prose-only / template section / new check) |

Rules:

- **Adopt / adapt / reject** — every Model column entry gets a verdict. The
  literature is written for human teams on human clocks; "adapt" findings must
  say *what changes* under machine-speed iteration; wholesale adoption of a
  human-cadence ritual is a smell.
- **Candidate changes are not commitments.** R1–R4 propose; R5 ranks; the
  owner ratifies; ratified items become normal sdlc slices. A phase brief that
  starts editing `skills/sdlc/` has broken the map.
- **Fold in logged issues.** Where an open issue already states the gap
  (#146, #147, #131, #174, #136, #165), the row cites the issue in the Gap
  column and the candidate change either endorses, refines, or supersedes it —
  explicitly.
- **Prefer fewer, sharper rows.** Target 5–12 gap rows per brief. A 40-row
  brief is an unranked backlog, not an analysis.

## 4. Literature corpus

Seed corpus per phase. R1–R4 may extend it, but every extension carries a
citation and one line on why the seed list didn't cover it. Web research is
expected (agent-browser / web-search); paywalled sources are summarised from
secondary material with that noted.

**R1 — Brainstorm (divergence, convergence, spike decision)**

- Double Diamond (UK Design Council) — explicit diverge/converge structure.
- Shape Up (Basecamp, Singer) — shaping, appetite, fixed-time/variable-scope.
- Amazon Working Backwards / PR-FAQ — outcome-first framing.
- Opportunity Solution Trees (Teresa Torres) — problem/solution mapping.
- XP spikes (Beck) — throwaway-code-to-buy-information; the spike-vs-plan
  trigger question.
- Wardley mapping — situational awareness before commitment (evaluate for
  proportionality; likely "adapt heavily or reject").
- Jobs-to-be-Done (Christensen/Klement) — problem-space framing vocabulary.

**R2 — Plan (problem space, outcome measurement, NFR placement)**

- Engineering design-doc culture: Google eng design docs (Winters/Manshreck/
  Wright "Software Engineering at Google" ch. 3 practices + public write-ups),
  Oxide RFDs, Rust RFCs — structure, non-goals sections, alternatives-considered.
- Goal-Question-Metric (Basili) — deriving measurement from objectives.
- Impact Mapping (Adzic) — connecting deliverables to behaviour change.
- Risk registers / pre-mortems (Klein) — surfacing failure modes at plan time.
- ISO/IEC 25010 — as the checklist taxonomy for the NFR-placement verdict
  (shared with R3; R2 owns *where*, R3 owns *how bound*).

**R3 — Spec (solution space, contracts, diagrams, vocabulary)**

- Specification by Example (Adzic) + BDD/Gherkin (North) — the standardised-
  vocabulary question; what Given/When/Then buys beyond our stable scenario ids.
- C4 model (Brown) + arc42 — the shallow-surface/rich-zoom architecture answer.
- Domain-Driven Design (Evans, distilled via Vernon) — domain objects,
  bounded contexts, ubiquitous language; event storming as a discovery tool.
- Contract-first / design-by-contract (Meyer; OpenAPI-style interface-first).
- ISO/IEC 25010 — NFR taxonomy: cost/performance, maintainability,
  observability, security; where each is bound vs. merely named.
- Lightweight formal methods: Alloy (Jackson), TLA+ (Lamport) — propose a
  "when warranted" rule (state-machine/concurrency-bearing changes), never a
  default.

**R4 — Build (decomposition, sequencing, DoD)**

- INVEST (Wake) — task-quality checklist.
- Vertical slicing vs. layer slicing; elephant-carpaccio-style thin-slice
  arguments (Kniberg/Cockburn).
- User Story Mapping (Patton) — sequencing/grouping by narrative flow.
- Definition of Done / Definition of Ready literature (Scrum guides + critiques)
  — against PV1: verification ≠ done.
- Dependency-aware sequencing: critical path/chain — evaluate against the
  existing blocking-edge + frontier discipline (likely "already adequate";
  prove it).

**Lens 4 shared corpus (all phases — iteration discipline)**

- Fagan inspections + Gilb/Graham software inspection — entry/exit criteria,
  defect-density stop rules (the closest human analogue to convergence guards).
- Modern code review research (Bacchelli & Bird "Expectations, Outcomes, and
  Challenges of Modern Code Review"; Google/Microsoft MCR studies) — review as
  convergent conversation.
- Our own telemetry as primary source: #174 (14-round non-convergence
  anatomy), FS13 run stores, docs/reviews/ round histories. Where literature
  is silent on machine-speed adversarial review, say so and derive from data.

**Lens 5 shared corpus (all phases — comprehension surface)**

- Mermaid (flowchart/sequence/ER) as markdown-native baseline.
- `sdlc-visual-docs` skill (existing renderer: IA-graph front matter →
  self-contained interactive HTML; traceability/contracts/risks/DoD views).
- C4's zoom-level principle applied beyond architecture (R3 owns the deep
  treatment; R1/R2/R4 reference it).

## 5. Grounding-read list

Before literature, every phase brief grounds in (minimum):

1. Its phase reference (§1 table) + the matching `templates/sdlc-<slug>.md`
   entrypoint + `prompts/adversary-{plan,spec}.prompt.md` where a panel exists.
2. `skills/sdlc/references/system-reference.md` — the shared question-
   presentation contract and panel run-shape.
3. Map #192 (lenses, out-of-scope) and this brief.
4. The linked issues for its folded material: R1→#147; R2→#146, #174; R3→#146
   (taxonomy), #165 (judgment-tier adjacency); R4→#131. All→#174, #136 for
   lens 4; #158 + `docs/briefs/2026-07-23-ceremony-estimator-research.md` for
   lens 6.
5. At least one real artifact pair from this repo's history (a plan/spec and
   its panel round history under `docs/reviews/`) — the critique must name
   concrete local evidence, not only cite the reference prose.

## 6. Output contract

- One brief per ticket: `docs/briefs/<date>-design-phase-r<N>-<phase>.md`,
  direct-to-main per the briefs policy, linked back from the ticket on close.
- Sections: the six lenses (§2 order), each ending in its gap-table rows;
  a final **Consolidated gap table** repeating all rows with stable ids
  `R<N>-G<k>` (so R5 can join across briefs); a **Sources** list.
- Each brief ends with a one-paragraph **handoff to R5**: the 2–3 rows the
  author judges highest-leverage, and any cross-phase tension spotted (e.g. a
  candidate that moves work between phases — flagged, not resolved).
- Ticket-close comment: gist + brief link + the Decisions-so-far line for the
  map body.

## 7. Dispatch notes

- R1–R4 are independent after this brief and may run as parallel async AFK
  research children (owner's cadence call — map #192 "Cadence"). Suggested
  child shape: fresh context, this brief + §5 grounding list in the task,
  web research enabled, output to the §6 path, no repo edits outside
  `docs/briefs/`.
- R5 is a HITL grill: consolidate the four gap tables into the 4×6 matrix,
  argue the cycle verdict, rank the slate, owner ratifies.
