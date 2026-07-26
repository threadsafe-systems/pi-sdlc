# Design-phase gap analysis — R3: Specification

> Resolves threadsafe-systems/pi-sdlc#196, part of map #192. Method is
> `docs/briefs/2026-07-26-design-phase-gap-analysis-method.md` (R0): six fixed
> lenses in order, four-column gap rubric, 5–12 rows, stable ids, consolidated
> table, Sources, handoff to R5.
>
> **Baseline commit: `f1cfad3`.** Object under critique:
> `skills/sdlc/references/phase-spec.md` (craft layer only), plus
> `templates/sdlc-spec.md` and `skills/sdlc/prompts/adversary-spec.prompt.md`.
> Gate/hook/refusal semantics are **not** under critique (R0 §1). Research
> artifact only — nothing here is ratified design; R5 ranks, the owner ratifies.

## 0. What the Spec phase currently is

Three surfaces carry the whole phase:

- `references/phase-spec.md` — 108 lines. Its craft content is exactly three
  claims: the artifact contains "contracts, interfaces, surface area, functional
  and non-functional requirements, and falsifiable verification scenarios with
  stable ids" (`phase-spec.md:13–15`, restated `:46–48`); "a scenario that cannot
  be made to fail is a broken spec" (`:25–27`); and a dialogue delta —
  behavioural/edge-case questions are posed as *draft scenarios*, blocking slots
  reserved for genuinely open contract/surface decisions, never ask a
  repo-discoverable fact (`:54–66`). Everything else is invocation modes, hooks,
  gate routing, refusal, completion evidence.
- `templates/sdlc-spec.md` — 46 lines, a pure router (resolve skill → readiness
  gate → load `phase-spec.md` → degradation contract → sampling stamp). It
  contains **no artifact skeleton at all**: no section list, no heading
  vocabulary, no worked shape.
- `prompts/adversary-spec.prompt.md` — the reviewer contract, with seven attack
  surfaces A–G (`:23–29`).

The structural finding that recurs under four of the six lenses: **the reviewer
prompt is a materially richer specification of what a spec must contain than the
authoring guidance is.** The adversary is told to check "exact signatures, types,
and error semantics" (`adversary-spec.prompt.md:25`) and that performance,
durability, security and compatibility requirements must each be "stated and
tied to a scenario" (`:28`); nothing in `phase-spec.md` or `templates/sdlc-spec.md`
ever asks the author to produce either. The panel is therefore structurally
guaranteed to discover, every run, gaps the author was never prompted to close —
paid for at reviewer prices instead of authoring prices. Local evidence:
`docs/reviews/spec-pv1-task-scoped-tests-2026-07-25/consolidated.md` — 8 round-1
findings, **0 dismissed**, of which F1/F2/F5/G1/G2 are all "the spec asserts a
contract detail imprecisely" — precisely the class a template skeleton and a
contract block would have pre-empted.

Everything good about the real specs in this repo (`Frozen surfaces` header
bullets, a `Non-functional requirements` section, a `Degradations (normative)`
section, an explicit `Out of scope` list, an `Amends …` supersession section) is
**convention transmitted by example**, not guidance: none of those section names
appears anywhere in the three surfaces under critique. Compare
`docs/specs/2026-07-24-pv1-task-scoped-tests.md` and
`docs/specs/2026-07-12-sdlc-portable-validator.md` — near-identical structure,
zero documented basis. That works while one author and one model set the house
style; it is exactly what breaks first under the #158 dynamic-ceremony future
where the Spec producer model is re-derived at each handoff.

---

## 1. Lens 1 — Expertise

**Owning specialists in a mature organisation: the *domain modeller* and the
*API/contract designer*** (with a test architect as the third voice — but that
third voice is the one part of the phase we already do well, via the
falsifiable-scenario law and PV1). The Spec phase is where an org's interface
designer asks the questions that are cheap now and unfixable after data or
extensions bind.

The habitual question list, marked against the current three surfaces:

| # | Question a domain modeller / API designer habitually asks | Status |
|---|---|---|
| Q1 | What are the *nouns*? Name every domain object this change introduces or changes, and define each term once. | **absent** |
| Q2 | Does the name used in the spec equal the name used in code, config, and the human's speech (ubiquitous language)? | **absent** |
| Q3 | For each interface: exact signature, argument types, return type. | **partial** — demanded of the reviewer (`adversary-spec.prompt.md:25`), never of the author; `phase-spec.md:46–47` says "contracts, interfaces" with no shape. |
| Q4 | For each operation: preconditions (what the caller must guarantee), postconditions (what the supplier guarantees), invariants (what is true before and after). | **absent** |
| Q5 | Error semantics: what failures exist, how are they signalled, what is the ordering/precedence when several co-occur? | **partially** — `adversary-spec.prompt.md:25` asks for "error semantics"; the author is never prompted. Local evidence that this is a live defect class: spec-panel finding **F2** (`consolidated.md`) — "Rule A/B behaviour under co-occurring structural errors … was unspecified, yet TST11 freezes a byte-exact golden". A precondition/error-precedence prompt catches F2 at authoring time. |
| Q6 | What is *frozen* by this change — what can never be backfilled later? | **already prompted** in spirit (the two-track kernel; the reviewer's surface A) and in house practice (`docs/specs/2026-07-24-…:9–24` header bullets), but the header block itself is undocumented convention. |
| Q7 | What is the migration/compatibility story for existing instances of the shape? | **partially** — surface A ("any missing field that cannot be backfilled later"); ADR 0027 clean-break policy carries it in practice, not the phase reference. |
| Q8 | Which state transitions are legal, and which concurrent interleavings are possible? | **absent** (see lens 6, R3-G11). |
| Q9 | Who consumes this contract, and how do they learn it changed? | **partially** — `docs/specs/2026-07-24-…` §9 "Documentation surface" exists as convention; not prompted. |
| Q10 | What examples make the contract concrete for a reader who will not read the rules? | **partially** — we mandate falsifiable scenarios (`phase-spec.md:25–27`), which are examples in the Specification-by-Example sense, but nothing asks for the *illustrative* key example (the ATM-style worked case) distinct from the gating scenario. |

Two gaps are worth rows; Q6/Q7/Q9 are adequately covered in practice and Q10 is
subsumed by lens 3.

### Rows

**R3-G1 — no vocabulary/domain-object section.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:13–15` and `:46–48` enumerate "contracts, interfaces, surface area, FR/NFR, scenarios" — no term/glossary/domain-object item. `templates/sdlc-spec.md` — **absent** (no skeleton at all). |
| **Model** | Domain-Driven Design *ubiquitous language*: a rigorous shared language built on the domain model, evolved deliberately, tested in conversation with the domain expert ([Fowler on Evans](https://martinfowler.com/bliki/UbiquitousLanguage.html)); arc42 §12 Glossary as its documentation slot ([arc42](https://docs.arc42.org/section-10/) template family). **Verdict: adapt** — take the glossary + name-binding discipline; reject event-storming workshops and bounded-context mapping wholesale (they price a multi-team org's coordination problem we do not have). |
| **Gap** | Nothing requires a spec to define its own coined terms or bind them to identifiers, so term meaning is carried in prose and drifts: in `docs/specs/2026-07-24-pv1-task-scoped-tests.md` the terms `scope`, `"full"`, `"task"`, "regression net", "declared" and "owned scenario" are load-bearing and defined nowhere in one place — and 3 of 8 round-1 panel findings (F6, G1, and F5's citation slip) are term/claim-precision defects (`consolidated.md`). |
| **Candidate change** | Template section `## Vocabulary` — a three-column table *term → definition → the identifier/file it binds to*, required whenever the change coins or redefines a term. **Done-means:** a reader can check mechanically that every term in the table appears in the spec body, and every coined term used ≥2× in the body appears in the table. **Size:** template section (prose-only in `phase-spec.md`). |

**R3-G2 — contracts have no required shape (no design-by-contract block).**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:46–48` names "contracts, interfaces" as content and stops. `adversary-spec.prompt.md:25` demands the reviewer verify "exact signatures, types, and error semantics" and "name any under-specification an implementer would have to guess at". |
| **Model** | Design by Contract (Meyer): a component's interface is specified by *preconditions*, *postconditions* and *class invariants* — "formal, precise and verifiable interface specifications" ([Eiffel: Design by Contract, Assertions and Exceptions](https://www.eiffel.org/doc/eiffel/ET-_Design_by_Contract_%28tm%29%2C_Assertions_and_Exceptions); Meyer, *Applying "Design by Contract"*, IEEE Computer 25(10), 1992 — [PDF](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf), text not machine-extractable, cited from the abstract/secondary text). Contract-first API design (OpenAPI-style) as the same idea at the wire level. **Verdict: adapt** — adopt pre/post/invariant/error as *specification vocabulary*; reject runtime assertion machinery and any tooling mandate (portability: sdlc is language-agnostic). |
| **Gap** | The reviewer's contract checklist is strictly stronger than the author's, so under-specification is discovered at panel cost rather than prevented at authoring cost — and the specific failure mode is provable: panel finding **F2** (`consolidated.md`) is an *unspecified error-precedence rule* under co-occurring failures, exactly the cell a postcondition/error table has. |
| **Candidate change** | Template section `## Contracts` — per changed interface, a block with: exact signature/shape, **preconditions** (caller's obligation), **postconditions** (supplier's guarantee), **invariants**, **error semantics incl. precedence when several fire**, and the scenario id(s) that gate each. **Done-means:** every interface named in the spec body has a block; every block's error row names either a precedence rule or "at most one error possible"; a reviewer can point at any block cell that is empty. **Size:** template section + one prose paragraph in `phase-spec.md` §4. |

---

## 2. Lens 2 — Boundaries

Spec consumes the committed approved Plan (`phase-spec.md:31–32`), must fix
contracts/interfaces/surface/FR+NFR/scenarios (`:46–48`), and must not write
implementation test code (`:25–27`) or task breakdown (Build owns it,
`references/phase-tasks.md`). Backward transition to Plan/Brainstorm is always
allowed and explicitly stated (`:88–92`) — that escape hatch is present and
findable.

Two boundaries are unmanaged.

**Downward (Spec ↔ Build) altitude.** #174 documents the mirror-image failure at
the Plan gate — plan review became spec review because the plan carried
spec-grade mechanics, with no disposition for "carry to Spec" (see #174, finding
5 and recommendation 6; not restated here). Spec has the identical unmanaged
seam pointing at Build: nothing tells the author or the panel what to do with a
finding that demands *task-grade* precision. Local evidence that material has
already leaked downward-in-place: `docs/specs/2026-07-24-pv1-task-scoped-tests.md`
§14 carries **TST14–TST18** as "artifact/process acceptance criteria verified by
inspection at their named point in the lifecycle" — i.e. Build/PR-phase process
obligations sitting in the Spec's verification-scenario list alongside genuinely
executable scenarios TST1–TST13.

**Forward (amending an approved Spec).** `phase-spec.md:88–92` covers backward
transitions only. There is no seam for the legitimate case the owner has already
hit: Case's channel-presence slice (2026-07-23) fine-tuned an *approved* spec to
rev5 pre-merge on dev feedback, nothing frozen or merged, and the owner
deliberately fast-tracked it over re-running the design panel — flagging it in
the same breath as a real pi-sdlc gap. Today that path is undocumented, so it is
indistinguishable in the artifact record from redesign smuggling. #136 already
owns the general discipline (operator feedback is a finding, recorded in
`consolidated.md` with a disposition; late feedback reopens clearance for the
delta) — Spec needs the phase-shaped instantiation, not a new rule.

### Rows

**R3-G3 — no seam for amending an already-approved Spec.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:88–92` (backward transitions only); `:99–103` treats the committed spec + consolidated panel artifact + human approval as terminal completion evidence. Forward amendment: **absent**. |
| **Model** | #136's operator-feedback discipline (every-channel feedback is a finding with a recorded disposition; late feedback reopens clearance *for the delta*) + Fagan's exit-criteria framing — an operation completes against defined exit criteria, and rework past that point re-enters the process rather than bypassing it ([Fagan 1976, IBM Systems Journal 15(3)](https://dl.acm.org/doi/10.1147/sj.153.0182), paywalled; cited from abstract + the IEEE Xplore summary line "define exit criteria which must be satisfied for completion of each operation"). **Verdict: adapt** — keep the record-and-reopen-the-delta rule; reject re-inspection of the whole artifact (a human-cadence economy). |
| **Gap** | An approved spec revised pre-merge (Case channel-presence rev5, 2026-07-23) leaves no disposition record distinguishing "ratified fine-tuning of an unfrozen shape" from redesign smuggling, and no rule for when the design gate must re-run. |
| **Candidate change** | `phase-spec.md` §6 subsection "Amending an approved Spec": classify the delta — (a) changes a shape already frozen/merged/bound-to → backward transition, gate re-runs; (b) refines an unfrozen shape pre-merge → amend in place, record the trigger + disposition in the run's `consolidated.md` per #136, no new panel; (c) reviewer-grade contradiction discovered later → normal fix wave. **Done-means:** for any spec revised after its gate approval, an auditor can find a dated disposition line naming the class (a/b/c) and its author. **Size:** prose-only. Explicitly *endorses and instantiates* #136 rather than superseding it. |

**R3-G4 — no scenario-kind taxonomy / no "carry to Build" disposition.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:25–27` — one undifferentiated class: "falsifiable acceptance criteria with stable ids and pass/fail conditions … a scenario that cannot be made to fail is a broken spec". No kind labels, no rule for process/artifact obligations, no disposition vocabulary for findings that demand task-grade precision (contrast the backward escape at `:88–92`). |
| **Model** | Specification by Example (Adzic) key process patterns — *illustrating using examples*, *refining the specification*, and critically **automating validation without changing the specification**: the spec's examples are the gating artifact precisely because a runner binds them ([Manning TOC, Part 2 "Key process patterns"](https://www.ebooks.com/en-us/book/210311535/specification-by-example/gojko-adzic/); [Grokipedia summary](https://grokipedia.com/page/Specification_by_example)). **Verdict: adapt** — the automation link is the point; the collaborative-workshop patterns are priced for a human three-amigos cadence we do not run. |
| **Gap** | Because every acceptance criterion is the same kind, human-inspection process obligations (TST14–TST18 in `docs/specs/2026-07-24-pv1-task-scoped-tests.md` §14) sit in the same list as machine-falsifiable ones, so scenario **count** overstates machine coverage and the phase reference's own "must be able to fail" law is honoured only loosely for the inspection-verified subset. |
| **Candidate change** | Require one label per scenario: `mechanical` (a runner/argv check can decide it), `inspection` (a human/panel decides it at a named lifecycle point), `carried` (deferred to Build with a named destination). **Done-means:** every scenario id carries exactly one label; `inspection` scenarios name their decision point; the mechanical/total ratio is readable off the spec without reading prose. **Size:** template section + prose (feeds lens 6, R3-G10). |

---

## 3. Lens 3 — FR/NFR placement (Spec's own answer; R2 owns the cross-phase verdict)

For the Spec phase specifically:

- **Enter here:** contracts, interfaces, surface area, error semantics, the
  behavioural edge cases (`phase-spec.md:54–58` makes edge cases arrive as draft
  scenarios rather than questions — a genuinely good rule, and the one place our
  guidance is ahead of the literature's default of open elicitation).
- **Bound here:** *everything*. This is Spec's defining job: every requirement
  that entered at Plan must leave Spec attached to a falsifiable scenario id or
  be explicitly marked unbound. This is where our guidance is weakest for NFRs.
- **Verified here:** nothing — verification executes at Implement (PV1) and PR.
  Spec's obligation is that verification is *possible and named*.

The asymmetry repeats: `adversary-spec.prompt.md:28` (surface F) tells the
reviewer to check that "performance, durability, security, and compatibility
requirements are stated and **each tied to a scenario**". No authoring surface
states that rule. In practice a strong author satisfies it anyway —
`docs/specs/2026-07-24-pv1-task-scoped-tests.md` §12 carries four NFR claims and
three of them are genuinely bound (no-new-command-execution → TST4/TST5's
zero-commands-executed clause; determinism → TST11's byte-exact golden; formatting
→ TST19) — but "the strong author did it" is not a contract, and the one that is
*not* bound (the runtime-dependency-envelope claim) is bound by nothing but
assertion.

# 146 asks for a plan-time NFR & DoD sweep (declare-or-`n/a`-with-justification,
by technical domain). **R2 owns the where-verdict.** R3's position on the
how-bound question: a presence sweep is necessary but not sufficient — a declared
NFR with no response measure is unfalsifiable and cannot be reviewed, so Spec
must convert each surviving NFR into a *quality scenario* with a measure, or
mark it explicitly as named-but-unbound so the gate ratifies the risk.

**On BDD vocabulary (the ticket's headline question).** Our stable scenario ids +
`Falsify:` clauses are already the load-bearing half of Given/When/Then. Dan
North's own account is explicit that the value of the G/W/T template is (a) a
*ubiquitous language for analysis* shared with non-developers and (b) that "the
fragments of the scenario — the givens, event, and outcomes — are fine-grained
enough to be represented directly in code", i.e. each fragment maps to a reusable
`Given`/`Event`/`Outcome` class that a runner executes
([North, *Introducing BDD*, 2006](https://dannorth.net/blog/introducing-bdd/)).
Machine-checkability comes from that **binding layer** (step definitions), not
from the keywords: Gherkin without step definitions is prose with three extra
words per line. We already have a binding layer that is *better* suited to our
work — PV1 manifests bind scenario ids to argv checks with evidence, and the
`scope` field now types that binding. Adopting Gherkin syntax would add a parser,
a step-definition layer, and a scenario style optimised for business-readable
end-to-end behaviour, to specify things like "error pointers sort lexicographically
by `(pointer, message)`" — a poor fit. **Verdict: adapt one element, reject the
rest** — import the *explicit-precondition* discipline that `Given` enforces (our
scenarios routinely bury setup inside a run-on sentence: see TST8, TST11), keep
our ids + `Falsify:` clause, and reject Gherkin syntax, step definitions, and
Cucumber-family tooling as ceremony that buys nothing we do not already have.

### Rows

**R3-G5 — NFRs are named, not bound; no measure required.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:13–15`, `:46–47` list "non-functional requirements" as content; no binding rule anywhere in the reference or template. `adversary-spec.prompt.md:28` requires the *reviewer* to check each is tied to a scenario. |
| **Model** | arc42 §10 *quality scenarios*: quality requirements are made concrete and decidable by scenarios with **source/stimulus → response + response measure**, in usage, change, and fault/failure flavours; §10.1 uses ISO/IEC 25010:2023 categories as the checklist to summarise against ([arc42 §10](https://docs.arc42.org/section-10/)). ISO/IEC 25010:2023 provides the nine-characteristic taxonomy — Functional Suitability, Performance Efficiency, Compatibility, Interaction Capability, Reliability, Security, Maintainability, Flexibility, Safety ([iso25000.com](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010), [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html)). **Verdict: adapt** — adopt the quality-scenario *form* (measure or it does not count) and use the taxonomy as a one-pass checklist; reject the full quality-attribute-utility-tree ceremony and the sub-characteristic enumeration (dozens of leaves, priced for a system-wide architecture review, not a per-change spec). |
| **Gap** | A spec may state "no new runtime dependency", "cost stays proportionate", "observability unchanged" with no measure and no scenario id, and pass the authoring surfaces cleanly — the only thing that catches it is a reviewer applying surface F. `docs/specs/2026-07-24-…` §12 is 4 claims, 3 bound, 1 asserted; nothing marks the difference. |
| **Candidate change** | Template section `## Non-functional requirements` with one row per carried NFR: *characteristic (ISO 25010 label) → stimulus/condition → response measure → binding scenario id, or `unbound — accepted at gate` with a reason*. Prose rule in `phase-spec.md` §4: an NFR with neither a measure+scenario nor an explicit unbound marker is a spec defect. **Done-means:** a checker (human or script) can read the table and assert every row has either a scenario id present in §Scenarios or the literal unbound marker. **Size:** template section + prose. **Relation to #146:** endorses and refines — #146's plan-time sweep answers *did we consider it*; this answers *is it decidable*. Cross-phase tension flagged for R5, not resolved here. |

**R3-G6 — scenarios carry no explicit precondition; the "Given" is buried.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:54–58` prescribes the draft-scenario question form "SN: when X → Y (pass) / Z (fail)" — a When/Then with no Given slot. `:25–27` requires falsifiability, nothing about setup state. |
| **Model** | BDD's Given/When/Then, whose Given clause exists precisely to make the initial context explicit and reusable across scenarios ([North 2006](https://dannorth.net/blog/introducing-bdd/)). **Verdict: adapt (partial adopt of one clause, reject the syntax)** — see the vocabulary verdict above. |
| **Gap** | Because setup state is prose-embedded, two scenarios can silently disagree about the fixture they assume, and an implementer must reconstruct the fixture from a sentence: in `docs/specs/2026-07-24-…` §14, TST8's precondition ("`tests: required` satisfied by a `["full"]` check, so Rule A passes") is a parenthetical inside the behaviour sentence, and TST11 states three co-occurring error conditions as one clause — both were subsequently the subject of panel findings F2/F4 about what the golden actually pins. |
| **Candidate change** | Scenario form becomes three named parts on separate lines — `Given:` (state/fixture), `When/Then:` (the existing behaviour+outcome sentence), `Falsify:` (existing) — with `Given: none` permitted and expected for pure-function scenarios. No keyword parser, no step definitions. **Done-means:** every scenario block has all three labels; a reader can lift `Given:` into a test fixture without reading the rest. **Size:** template section (+ 2 lines in `phase-spec.md` §4's draft-scenario rule). |

---

## 4. Lens 4 — Iteration discipline

Spec's absorption loop is the `spec_review` panel, whose run-shape
`phase-spec.md:83–86` delegates wholesale to `phase-pr-review.md` "Panels".
Spec-specific absorption guidance: none.

Our own telemetry is the primary source here, and it says two things:

1. **The failure mode is real and phase-agnostic.** #174 anatomises 14-round
   non-convergence at the *plan* gate, driven by a review target that grew 4.3×
   under fix waves, zero dismissals across 60+ findings, and no round cap or
   delta-review rule (link, not restated).
2. **The spec gate has already improvised the fix, undocumented.** The
   `pv1-task-scoped-tests` spec panel converged in 3 rounds
   (`docs/reviews/spec-pv1-task-scoped-tests-2026-07-25/consolidated.md`) using
   exactly the guards #174 recommends but which no reference states: round 2 was
   dispatched as an explicit **delta** review that confirmed all eight round-1
   findings fixed; round 3 was a **narrow delta** scoped to "strictly §10 +
   TST17"; and reopened findings were tagged with their ancestor id
   (`R2-2 … REOPENED(F3)`, `R2-3 … REOPENED(G2)`). Also visible: an infra failure
   was correctly classified as non-verdict and replaced (luna → glm-5.2), and one
   finding was **escalated to the owner** rather than absorbed (R2-1, a policy
   collision with ratified commit discipline) — the pressure valve #174 found
   unused at the plan gate.

So the honest position is: human-world inspection literature contributes one
transferable idea — Fagan's *exit criteria per operation*, i.e. convergence is
defined by a stated criterion rather than by reviewer exhaustion
([Fagan 1976](https://dl.acm.org/doi/10.1147/sj.153.0182)) — and nothing else
that survives the cadence translation (inspection rate limits, meeting roles,
preparation-time ratios are all human-clock artefacts). **Verdict on the
literature: reject as process, adopt one principle; derive the rest from FS13
data.** The one thing to do is promote our own working practice from
orchestrator improvisation to documented spec-phase guidance, because right now
its recurrence depends on which model happens to orchestrate — the exact
variable #174 identifies as decisive.

### Row

**R3-G7 — delta re-review, reopen-tagging, and the escalation valve are undocumented at Spec.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:83–86` — panel run-shape delegated entirely to `phase-pr-review.md`; no spec-local re-round contract, no growth guard, no escalation prompt. `adversary-spec.prompt.md` — no NEW/REOPENED vocabulary, no prior-findings input slot. |
| **Model** | Own telemetry (primary, sanctioned by R0 §4 for this lens): #174's recommendations 1–2 and 4; the working three-round shape recorded in `docs/reviews/spec-pv1-task-scoped-tests-2026-07-25/consolidated.md`. Literature contributes only Fagan's exit-criteria principle ([Fagan 1976](https://dl.acm.org/doi/10.1147/sj.153.0182)); modern-code-review research studies human reviewer economics and does not address high-frequency adversarial machine review. **Verdict: adopt (own practice), reject (human inspection process).** |
| **Gap** | The convergence guards that produced a 3-round spec panel exist only in one session's transcript; a differently-modelled orchestrator gets 14 rounds (#174) with no reference telling it otherwise, and the spec's own growth per wave is unmeasured. |
| **Candidate change** | `phase-spec.md` §5 gains a "Re-rounds" paragraph: (i) re-dispatch carries prior findings + dispositions and scopes the reviewer to the delta commit range; (ii) every finding is tagged `NEW` or `REOPENED(<prior-id>)`, and a reopen without new evidence is barred; (iii) a finding that collides with a ratified project decision is **escalated to the owner**, not absorbed; (iv) after round 3 with new high/medium still arriving, stop dispatching and present a churn diagnosis (options: backward transition, carry to Build per R3-G4, ratified dismissals). Plus a matching prior-findings block in `adversary-spec.prompt.md`. **Done-means:** for any spec panel with ≥2 rounds, an auditor can read round *n*'s consolidated table and see every row tagged NEW or REOPENED with an ancestor id, and the round-3+ diagnosis present when the condition fires. **Size:** prose-only + prompt section. Endorses #174 recs 1–2/4, scoped to `spec_review`; does not touch gate semantics. |

---

## 5. Lens 5 — Human comprehension surface (deep treatment; R3 owns it)

**Current state: zero.** `phase-spec.md` contains no occurrence of *diagram*,
*mermaid*, *visual*, or *figure*; §9 "Advanced-mode pointers" says, in full,
"None specific to Spec" (`:105–107`) — while `references/system-reference.md` §9
"Advanced modes" does name visual gate artefacts (traceability matrix, contract
panel, risk map, DoD coverage) rendered by the global `sdlc-visual-docs` skill,
and FS11 inventories that skill as a `delegated` surface (system-reference §5).
So the *system* map advertises a visual surface for gates and the *phase that
most needs it* declines to point at it.

**The renderer seam, evaluated (not reinvented).** `sdlc-visual-docs`
(`~/.agents/skills/sdlc-visual-docs/SKILL.md`) already implements the exact
mechanism this lens would otherwise propose:

- node ids declared inline in headings — `O` objectives, **`C` contracts**,
  `S` scenarios, `T` tasks, `R` risks, `D` DoD;
- edges declared once in YAML front matter as `links` triples, with enforced
  endpoint kinds: **`S verifies O|C` required for every scenario and every
  contract**, `T implements S`, `R mitigated-by S`, `D covered-by S|T`;
- lint fails on a dangling endpoint anywhere in the upstream chain, a scenario
  verifying nothing, **a contract with no verifying scenario**, or a task with no
  implements edge;
- ```mermaid``` fenced blocks are inlined and rendered client-side from a
  vendored, pinned Mermaid — zero new tooling, offline, deterministic;
- renders are ephemeral by design ("never commit … never add a CI check that
  diffs rendered output"), and the IA schema is `v0-experimental` with an
  explicit "nothing may bind to it until a v1 freeze".

**The finding: we own a mechanical spec-completeness checker and do not feed it.**
Neither real spec examined declares the graph — `docs/specs/2026-07-24-pv1-task-scoped-tests.md:1`
and `docs/specs/2026-07-12-sdlc-portable-validator.md:1` both begin with an H1
and carry no `---` front matter, and neither uses `C<n>:` contract headings. So
the lint rule "a contract with no verifying scenario" — which is *precisely*
surface B of the adversary prompt ("is there an outcome or NFR with no
scenario?", `adversary-spec.prompt.md:24`), i.e. work we currently pay a frontier
model to do by reading — is sitting unused, three lines of front matter away.

**The zoom model.** C4's contribution is not its four diagram types but its
discipline: "the different levels of zoom allow you to tell different stories to
different audiences… **you don't need to use all 4 levels of diagram; only those
that add value** — the system context and container diagrams are sufficient for
most software development teams" ([C4 diagrams](https://c4model.com/diagrams)).
Applied to a per-change spec rather than a system architecture, the analogue is:
*one diagram, at the altitude the change actually lives at, chosen by change
class* — plus the arc42 pattern of a shallow overview section that references
detail rather than restating it ([arc42 §10.1](https://docs.arc42.org/section-10/)).
**Verdict: adapt** — adopt the "only the levels that add value" rule and the
zoom framing; reject the C4 level-1..4 set as a required artifact (a per-change
spec is almost never a system-context story) and reject arc42's 12-section
template wholesale (it documents a system, not a change).

### Rows

**R3-G8 — no diagram guidance at all; no change-class rule.**

| Column | Content |
|---|---|
| **Current** | **absent** — no diagram/mermaid/visual mention in `phase-spec.md` (§9 is "None specific to Spec", `:105–107`) or `templates/sdlc-spec.md`; the only pointer lives in `system-reference.md` §9. |
| **Model** | C4's zoom principle + "only the levels that add value" ([c4model.com/diagrams](https://c4model.com/diagrams)); mermaid-in-markdown as the zero-new-tooling baseline (already vendored and pinned inside `sdlc-visual-docs`). **Verdict: adapt.** |
| **Gap** | A spec that changes a state machine, an async multi-actor flow, or a persisted relation set ships as linear prose, and the reviewer must reconstruct the topology from sentences — measurable cost: `docs/specs/2026-07-24-…` §4 "Evaluation under co-occurring errors" is a four-way rule interaction (Rule A × Rule B × shape-invalid × dangling) expressed in one dense paragraph, and it took a high-severity panel round (F2) to pin it. |
| **Candidate change** | A change-class → minimum-diagram table in `phase-spec.md` §4: state-machine/lifecycle change → state diagram; multi-actor or async/ordering-bearing change → sequence diagram; new or changed persisted shape with relations → ER diagram; rule/predicate interaction with ≥3 interacting conditions → decision table (markdown table, not a diagram); everything else → **none, explicitly** ("no diagram required for this change class" is a legitimate and expected answer). Mermaid fenced block in the spec body; no new tooling. **Done-means:** the spec states its change class and either contains the mapped artifact or the explicit none-required line. **Size:** template section + prose. |

**R3-G9 — the `sdlc-visual-docs` IA graph is unfed, so a mechanical spec-completeness check goes unused.**

| Column | Content |
|---|---|
| **Current** | Real specs carry no IA front matter and no `C<n>` contract ids (`docs/specs/2026-07-24-pv1-task-scoped-tests.md:1`, `docs/specs/2026-07-12-sdlc-portable-validator.md:1`); `phase-spec.md` never mentions the skill; `templates/sdlc-spec.md` has no front-matter block. |
| **Model** | The existing renderer seam itself (`sdlc-visual-docs` SKILL.md — "Authoring rules (the IA graph)" and "Lint rules"), plus C4/arc42's shallow-surface-rich-zoom principle for *why* a projection beats a longer document. **Verdict: adopt (extend the existing seam), with one constraint** — the IA schema is `v0-experimental` and self-declares that nothing may bind to it until a v1 freeze, so any spec-phase use must be **advisory/non-blocking** until that freeze. |
| **Gap** | "Every contract has a verifying scenario" is mechanically checkable today by `lint.mjs` and is instead being checked by frontier-model reviewers reading prose (`adversary-spec.prompt.md:24`, surface B); the check simply never runs because specs declare no nodes or edges. |
| **Candidate change** | (1) Adopt `C<n>:` heading ids for the contracts introduced by R3-G2 and reuse existing scenario ids as `S` nodes; (2) add the four-line front-matter block (`ia`, `kind: spec`, `feature`, `upstream: <plan path>`, `links:`) to `templates/sdlc-spec.md`; (3) `phase-spec.md` §9 replaces "None specific to Spec" with a pointer: run `lint.mjs` before presenting the gate artifact, report its node/edge report in the gate message, **never block on it** while the schema is v0. **Done-means:** `node scripts/lint.mjs <spec>` exits 0 on a gate-ready spec, and its node report enumerates every contract and scenario id; the gate message quotes that report. **Size:** template section + prose (+ optional non-blocking check later, deliberately *not* now). |

---

## 6. Lens 6 — Ceremony scaling (consistency check only; #158 is decision-complete)

Nothing found in the literature contradicts #158's ratified design. Two places
where it *enriches* the estimator, reported as evidence for #158's build stream
and explicitly **not** as a reopened decision:

**(a) The estimator's verifiability class needs the Spec to declare something it
currently does not.** The #161 brief computes verifiability class at Spec/Build
from "scenarios with at least one named check command ÷ total scenarios"
(`docs/briefs/2026-07-23-ceremony-estimator-research.md` §2.3), with the class
feeding the ratified rule that *review ceremony scales inversely with mechanical
verifiability*. But at Spec time no check commands exist yet (they arrive with
the Build plan's per-task check tables and the PV1 manifests), and the Spec's
scenario list makes no distinction between a scenario a runner can decide and one
only a human can (R3-G4; TST14–TST18). So at the Spec→Build handoff — the first
gate where the estimator's verifiability input could be sharp — the denominator
is knowable and the numerator is not. The scenario-kind label proposed in R3-G4
makes it computable one phase earlier, for free, with no new tooling. This is
additive to #161's contract, not a change to it.

**(b) Ceremony has a third dial the estimator does not model: verification
*technique*, not just reviewer count/model class.** #158 scales steps, reviewers,
workers, verifiers and model choice. The lightweight-formal-methods literature
describes a different axis: for a narrow class of change, you escalate the *kind*
of verification rather than the number of eyes. Amazon's S3 ShardStore work is
the strongest available primary evidence for how to make that proportionate —
explicitly *not* full formal verification, but "decompos[ing] correctness into
independent properties, each checked by the most appropriate tool, and
develop[ing] executable reference models as specifications to be checked against
the implementation", extended by non-formal-methods engineers, catching 16
issues including "subtle crash consistency and concurrency problems"
([Bornholt et al., SOSP 2021](https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3)).
**Verdict: adapt, heavily bounded** — adopt the *trigger question* and the
reference-model idea; reject Alloy/TLA+ model-writing as any kind of default
(the cost is real, the skill is scarce, and the vast majority of our changes are
prose-and-predicate slices where a decision table plus golden test is strictly
better value).

### Rows

**R3-G10 — Spec does not make verifiability class computable at its own handoff.**

| Column | Content |
|---|---|
| **Current** | `phase-spec.md:25–27` (one undifferentiated scenario class); `:99–103` completion evidence names no verifiability summary. |
| **Model** | #161's estimator contract (`docs/briefs/2026-07-23-ceremony-estimator-research.md` §2.3) + SbE's automation link ([SbE key process patterns](https://www.ebooks.com/en-us/book/210311535/specification-by-example/gojko-adzic/)). **Verdict: adopt (consistency fix, additive to #158).** |
| **Gap** | The Spec→Build handoff cannot cite a mechanical verifiability ratio because scenario kinds are unlabelled, so the first sharp estimator input arrives a phase later than it could. |
| **Candidate change** | The Spec gate message reports `mechanical / inspection / carried` counts derived from R3-G4's labels, as evidence in the `ceremony.recommended` payload. **Done-means:** the three counts sum to the scenario count and are recomputable by a reader from the spec alone. **Size:** prose-only (rides R3-G4). **Handled as:** evidence for #158's build stream; no #158 decision reopened. |

**R3-G11 — no "when warranted" rule for heavier verification technique.**

| Column | Content |
|---|---|
| **Current** | **absent** — no mention of state machines, concurrency, interleavings, reference models, or property-based testing in `phase-spec.md`; `adversary-spec.prompt.md:27` (surface E) asks the *reviewer* to check the design composes with "concurrency, ordering, lifecycle, persistence, error paths", with no authoring counterpart. |
| **Model** | Lightweight formal methods as practised on S3 ShardStore: property decomposition + executable reference models + conformance checking, deliberately short of full verification, usable by non-specialists ([Bornholt et al., SOSP 2021](https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3)); Alloy/TLA+ as the heavyweight rung behind it. **Verdict: adapt, default-off.** |
| **Gap** | A change that introduces concurrent access, ordering guarantees, crash/partial-failure recovery, or a multi-state lifecycle gets the same verification vocabulary (argv checks + golden outputs) as a pure-function predicate change, and the guidance offers no trigger to escalate — the failure is silent because such specs still look complete. |
| **Candidate change** | A short "When heavier verification is warranted" paragraph in `phase-spec.md` §4: if the change introduces or alters (i) concurrency/interleaving, (ii) crash/partial-failure recovery or persistence ordering, or (iii) a state machine with ≥3 states, then the spec must either name a *reference-model or property-based* verification approach for the affected property, or record an explicit "not warranted — because" line ratified at the gate. Never a default; explicitly not a tooling mandate. **Done-means:** for any spec matching a trigger, the gate artifact contains either the named approach or the ratified not-warranted line. **Size:** prose-only. |

---

## 7. Consolidated gap table

The four rubric columns are abbreviated; "R5 hint" is this author's leverage
ranking, not part of the rubric.

| id | Lens | Current (grounded) | Model (verdict) | Gap (falsifiable) | Candidate change (size) | R5 hint |
|---|---|---|---|---|---|---|
| **R3-G1** | 1 Expertise | `phase-spec.md:13–15`, `:46–48`; template **absent** | DDD ubiquitous language (**adapt**) | Coined terms defined nowhere; 3/8 round-1 panel findings were term/claim precision (`consolidated.md` F5/F6/G1) | `## Vocabulary` term→definition→identifier table (template section) | med |
| **R3-G2** | 1 Expertise | `phase-spec.md:46–48` vs `adversary-spec.prompt.md:25` | Design by Contract, Meyer (**adapt**) | Reviewer checklist strictly stronger than authoring guidance; error-precedence unspecified until panel F2 | `## Contracts` block: signature/pre/post/invariant/error-precedence + gating scenario ids (template section + prose) | **high** |
| **R3-G3** | 2 Boundaries | `phase-spec.md:88–92` (backward only); forward **absent** | #136 discipline + Fagan exit criteria (**adapt**) | Approved-spec revision pre-merge (Case rev5, 2026-07-23) leaves no disposition record distinguishing fine-tuning from redesign | §6 "Amending an approved Spec" 3-class rule (prose-only) | **high** |
| **R3-G4** | 2 Boundaries | `phase-spec.md:25–27`; no disposition vocabulary | SbE automate-validation pattern (**adapt**) | Process/inspection criteria (TST14–TST18) counted as verification scenarios; scenario count overstates machine coverage | Per-scenario label `mechanical`/`inspection`/`carried` (template section + prose) | **high** |
| **R3-G5** | 3 FR/NFR | `phase-spec.md:13–15`, `:46–47` vs `adversary-spec.prompt.md:28` | arc42 quality scenarios + ISO 25010:2023 (**adapt**) | NFRs may ship with no measure and no scenario id; `docs/specs/2026-07-24-…` §12 has 4 claims, 3 bound, 1 asserted, unmarked | `## Non-functional requirements` table: characteristic→stimulus→measure→scenario id or explicit unbound (template section + prose); refines #146 | **high** |
| **R3-G6** | 3 FR/NFR | `phase-spec.md:54–58` ("when X → Y/Z" form) | BDD Given clause (**adapt one clause, reject syntax**) | Setup state buried in prose (TST8, TST11); fixtures must be reconstructed from a sentence | Three-part scenario form `Given:` / `When–Then:` / `Falsify:` (template section) | med |
| **R3-G7** | 4 Iteration | `phase-spec.md:83–86` delegates wholly; no re-round contract | Own telemetry (#174, `consolidated.md`) + Fagan exit criteria (**adopt own practice, reject human process**) | The 3-round delta/reopen/escalate discipline that worked exists only in one transcript; a different orchestrator gets #174's 14 rounds | §5 "Re-rounds": delta scope, NEW/REOPENED(id) tags, owner escalation, round-3 churn diagnosis (prose + prompt section) | **high** |
| **R3-G8** | 5 Comprehension | **absent**; `phase-spec.md:105–107` says "None specific to Spec" | C4 zoom / only-levels-that-add-value (**adapt**) | Topology-bearing changes ship as linear prose; a 4-way rule interaction needed a high-severity round to pin (F2) | Change-class → minimum-diagram table, mermaid, explicit "none required" (template section + prose) | med |
| **R3-G9** | 5 Comprehension | No IA front matter in any real spec (`…2026-07-24…:1`, `…2026-07-12…:1`) | Existing `sdlc-visual-docs` seam (**adopt, advisory until v1 freeze**) | "Contract with no verifying scenario" is lintable today and is instead paid for as frontier-model reading (`adversary-spec.prompt.md:24`) | `C<n>` ids + front-matter `links`; run `lint.mjs` at the gate, non-blocking (template section + prose) | **high** |
| **R3-G10** | 6 Ceremony | `phase-spec.md:25–27`, `:99–103` | #161 estimator §2.3 (**adopt; additive to #158**) | Verifiability ratio not computable at Spec→Build handoff because scenario kinds are unlabelled | Gate message reports mechanical/inspection/carried counts into `ceremony.recommended` (prose-only, rides R3-G4) | med |
| **R3-G11** | 6 Ceremony | **absent**; `adversary-spec.prompt.md:27` reviewer-side only | Lightweight formal methods, S3 ShardStore (**adapt, default-off**) | Concurrency/recovery/state-machine changes get identical verification vocabulary to pure-predicate changes, with no escalation trigger | "When heavier verification is warranted" trigger + ratified not-warranted line (prose-only) | low-med |

Size-class totals: 5 template sections, 5 prose-only, 1 hybrid; **zero new
mandatory checks proposed** (R3-G9's lint is deliberately advisory while the IA
schema is `v0-experimental`).

---

## 8. Sources

**Kept — literature**

- [Dan North, *Introducing BDD* (2006)](https://dannorth.net/blog/introducing-bdd/) — primary; the origin of Given/When/Then and, decisively for this brief, the statement that its fragments are valuable because they map directly to executable Given/Event/Outcome classes. Grounds the "adapt one clause, reject the syntax" verdict.
- [C4 model — Diagrams](https://c4model.com/diagrams) (Simon Brown) — primary; the zoom-level principle and the explicit "you don't need all 4 levels; only those that add value" rule that makes diagram-by-change-class defensible rather than ceremonial.
- [arc42 §10 — Quality Requirements](https://docs.arc42.org/section-10/) — primary; quality scenarios with source/stimulus/**response measure**, the shallow-overview-referencing-detail pattern, and ISO 25010:2023 used as the summarising checklist. The model for NFR *binding*.
- [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) + [iso25000.com characteristic list](https://iso25000.com/index.php/en/iso-25000-standards/iso-25010) — the nine-characteristic taxonomy (site page 1 enumerates the first four in full; the full nine confirmed via the ISO abstract and secondary summaries).
- [Bornholt et al., *Using Lightweight Formal Methods to Validate a Key-Value Storage Node in Amazon S3*, SOSP 2021](https://www.amazon.science/publications/using-lightweight-formal-methods-to-validate-a-key-value-storage-node-in-amazon-s3) — primary abstract; property decomposition + executable reference models, deliberately short of full verification, extended by non-specialists. The evidence base for a bounded "when warranted" rule.
- [Eiffel: Design by Contract, Assertions and Exceptions](https://www.eiffel.org/doc/eiffel/ET-_Design_by_Contract_%28tm%29%2C_Assertions_and_Exceptions) + [Meyer, *Applying "Design by Contract"*, IEEE Computer 25(10) 1992](https://se.inf.ethz.ch/~meyer/publications/computer/contract.pdf) — precondition/postcondition/invariant vocabulary. (PDF text was not machine-extractable in-session; claims are limited to the canonical, uncontested definitions also stated on the eiffel.org page.)
- [Gojko Adzic, *Specification by Example* — key process patterns](https://www.ebooks.com/en-us/book/210311535/specification-by-example/gojko-adzic/) (publisher TOC; corroborated by [Grokipedia](https://grokipedia.com/page/Specification_by_example)) — the seven patterns, in particular *illustrating using examples*, *refining the specification*, and *automating validation without changing the specification*. Book paywalled; summarised from the publisher TOC and secondary material, as R0 §4 permits.
- [Fagan, *Design and code inspections…*, IBM Systems Journal 15(3), 1976](https://dl.acm.org/doi/10.1147/sj.153.0182) — paywalled; used only for the one transferable principle (define exit criteria per operation), sourced from the abstract and the IEEE Xplore summary line.
- [Martin Fowler, *Ubiquitous Language*](https://martinfowler.com/bliki/UbiquitousLanguage.html) — Evans' concept, quoted; used for the glossary/naming discipline only.

**Kept — local evidence (R0 §5.5)**

- `docs/specs/2026-07-24-pv1-task-scoped-tests.md` — the real spec: §1.1 shape, §4 co-occurring-error predicate, §7 amendment section, §12 NFRs, §14 TST1–TST19.
- `docs/reviews/spec-pv1-task-scoped-tests-2026-07-25/consolidated.md` — the real spec-panel adjudication: 3 rounds, delta and narrow-delta re-dispatch, REOPENED(id) tagging, infra-failure substitution, owner escalation of R2-1.
- `docs/specs/2026-07-12-sdlc-portable-validator.md` — second data point for house-convention-without-guidance and for the absent IA front matter.
- `~/.agents/skills/sdlc-visual-docs/SKILL.md` — the renderer seam evaluated in lens 5 (IA graph vocabulary, lint rules, mermaid vendoring, v0-experimental constraint).
- Issues linked, not restated: #146 (NFR sweep — R2 owns placement), #174 (convergence anatomy), #136 (operator-feedback discipline), #158 + `docs/briefs/2026-07-23-ceremony-estimator-research.md` (ceremony), #165 (judgment tier — see Gaps).

**Dropped**

- Gherkin/Cucumber tutorial ecosystem (testquality.com, drizz.dev and similar SEO pages surfaced by search) — restate the keyword syntax, no evidence on whether the syntax buys machine-checkability; superseded by North's primary account.
- arXiv 2602.00180 "Spec-Driven Development … AI Coding Assistants" — adjacent and recent, but a survey-style framing paper; nothing in it bears on the four questions #196 actually asks, and it would have added a citation without changing a row.
- Bacchelli & Bird (modern code review) — considered for lens 4 and **not used**: its findings concern human reviewer expectations, comment sentiment and defect-vs-understanding outcomes in a human batch cadence; the honest lens-4 answer is that our telemetry is the primary source, and citing MCR research would have dressed a data-derived rule in borrowed authority.
- Quality-attribute utility trees / full ATAM (referenced from arc42 §10.1) — rejected as a model, not merely unused: it prices a whole-system architecture evaluation, and importing it into a per-change spec is exactly the human-cadence-ritual smell R0 §3 warns about.
- ISO 25010 sub-characteristic enumeration (dozens of leaves) — kept the nine top-level characteristics as a checklist, dropped the leaves as unusable per-change.

---

## 9. Handoff to R5

**Highest-leverage rows: R3-G2, R3-G5, R3-G7 — with R3-G4 as the cheapest
enabler.** The single structural fact R5 should carry into the synthesis is the
*asymmetry*: `adversary-spec.prompt.md` already specifies a richer spec than
`phase-spec.md` + `templates/sdlc-spec.md` ask for (contracts `:25`, NFR-scenario
binding `:28`, framework-reality `:27`), so every spec panel is structurally
guaranteed to spend frontier-model rounds rediscovering the same authoring gaps —
a permanent, quantifiable ceremony tax that no amount of ceremony *scaling* fixes,
because the work is real; it is just being done at the wrong price. R3-G2 and
R3-G5 close the two biggest halves of that asymmetry by adding template sections;
R3-G7 stops the loop that asymmetry feeds; R3-G4's one-word-per-scenario label is
nearly free and unlocks R3-G10 and honest coverage counts. If R5 must cut to three
slices, the natural bundle is *one* "spec artifact skeleton" slice (G1+G2+G5+G6,
all template sections, one coherent change to `templates/sdlc-spec.md` plus a
short `phase-spec.md` §4 paragraph), one "spec convergence discipline" slice
(G7+G3, prose + prompt), and one "comprehension surface" slice (G8+G9, which
should be sequenced *after* G2 because the `C<n>` contract ids G9 needs are
created by G2).

**Cross-phase tensions flagged, not resolved.** (1) **NFR ownership** — #146 puts
the sweep at Plan; R3-G5 puts the *binding* at Spec. If R2 recommends that NFRs
live only in the plan, R3-G5 must be re-cut as "Spec binds what Plan declared",
and the reversible track (no Spec) then has no binding step at all — a hole R5
should name explicitly. (2) **Where the diagram lives** — R3-G8's change-class
table could equally be argued into Plan (shape-of-the-change for the plan gate) or
split (Plan: context; Spec: mechanism); R3 asserts Spec because the mandatory
classes are all mechanism-level, but R2's lens 5 may collide. (3) **Scenario
labels vs Build's check tables** — R3-G4's `carried` label creates a Spec→Build
obligation R4 owns the receiving end of; if R4 proposes its own deferral
vocabulary, the two must be one vocabulary, not two. (4) **Ceremony inputs** —
R3-G10 feeds #158's estimator additively; it must be handed to that build stream
as evidence, and nothing here reopens a #158 decision.

**Gaps in this brief.** I did not evaluate the `sdlc-visual-docs` renderer by
running it against a real spec (no shell in this run) — R3-G9's claim that lint
would pass with front matter added is reasoned from the skill's documented lint
rules, not demonstrated; R5 should treat "add front matter to one existing spec
and run `lint.mjs`" as a 10-minute spike that de-risks the row. I also did not
sample specs from `threadsafe/case` or `threadsafe/pi-notion`, so "house
convention transmitted by example" is evidenced from two pi-sdlc specs only; a
third repo's spec would strengthen or falsify it cheaply. Adjacency noted for
completeness: #165 (retro judgment tier) is the same shape of problem one loop
later — facts recorded, judgment absent — and R3-G4/R3-G10's labelled counts are
exactly the kind of legible input that ticket wants; no action proposed here.
