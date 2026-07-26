# Design-phase gap analysis — R1: Brainstorm (divergence, convergence, and the spike decision)

> Resolves map ticket [#194](https://github.com/threadsafe-systems/pi-sdlc/issues/194)
> (map [#192](https://github.com/threadsafe-systems/pi-sdlc/issues/192)). Method and
> corpus fixed by R0 (`docs/briefs/2026-07-26-design-phase-gap-analysis-method.md`,
> resolves #193). Research brief only — candidate changes are proposals for R5's
> ranked slate, not commitments; nothing here edits `skills/sdlc/`.
>
> **Object under critique** (craft layer only; gate/hook/refusal semantics are not
> under critique): `skills/sdlc/references/phase-brainstorm.md` and
> `templates/sdlc-brainstorm.md`, as committed at baseline **`f1cfad3`**. All
> `file:line` citations below are against that commit.

**Baseline characterisation (from R0, not re-litigated):** Brainstorm carries the
most craft guidance of the four design phases — rubber-duck adversarialism
(`phase-brainstorm.md:19-24`), contradiction-or-declare (`:28-32`), proportional
research (`:33-38`), the question-contract delta (`:39-46`), and map mode (§9,
`:106-169`). The critique below is therefore about *asymmetries* in that craft:
the reference disciplines how the agent **challenges** and **asks**, but says
almost nothing about how the dialogue **opens** (problem before solution), how it
**diverges** (alternatives), or how it **exits** (what the agreed design must
contain to be safe to hand to Plan).

---

## 1. Expertise

**Role:** in a mature human organisation this phase is owned jointly by a
**product-discovery lead** (Torres-style continuous-discovery practice — outcome
framing, opportunity mapping, evidence-grounded divergence
[[producttalk.org](https://www.producttalk.org/opportunity-solution-trees/)]) and
a **staff engineer acting as shaping partner** (Shape Up's shaper + the
"present to technical experts" walkthrough — feasibility-within-appetite,
rabbit-hole hunting [[Shape Up ch. 5](https://basecamp.com/shapeup/1.4-chapter-05)]).
The current reference casts the agent as a third role — the adversarial
rubber-duck — and does that well; the two roles above are the ones whose habitual
questions our guidance never prompts.

**Question list** (marked against `phase-brainstorm.md` + `templates/sdlc-brainstorm.md`):

| Habitual question | Status | Where / why |
|---|---|---|
| "What problem/outcome is this in service of — before we discuss the mechanism?" | **absent** | `:12` defines Brainstorm as "turns an idea into an agreed design" — entry is already solution-shaped; nothing prompts a problem statement distinct from the idea |
| "What would we observe if it worked?" | partial | deferred by design to Plan's measurable outcomes (`phase-plan.md` owns it); acceptable placement, but nothing tells Brainstorm to *name* the observable even loosely |
| "What alternative shapes are on the table?" | partial | `:41-46` guards the *agent's* recommendations from narrowing the option space, but nothing requires that more than one shape was ever generated before converging |
| "How much is this idea worth to us — what's the appetite?" | **absent** | no time/cost-worth question anywhere in either file |
| "What's the riskiest assumption, and what's the cheapest way to test it?" | partial | contradiction-or-declare (`:28-32`) surfaces assumptions; nothing follows up with a test-cheaply move (→ G6) |
| "Is this feasible under the actual constraints (SDK, config, platform)?" | partial | `:33-38` prompts codebase exploration "when the idea touches an existing pattern"; #147's background (Case #35: approved design was literally impossible under `noTools`) shows the prompt is too weak on its own |
| "Where are the rabbit holes — what could take 5× longer than it looks?" | **absent** | no rabbit-hole/tail-risk pass in plain mode (Shape Up ch. 5's core move) |
| "What is explicitly out of bounds?" | partial | map mode has an Out of scope section (`:146-150`); plain mode has nothing |
| "Who/what else does this touch?" (blast radius) | partial | arrives mechanically at the #158/#160 handoff via the estimator; never a dialogue prompt during the thinking itself |

**Corpus verdicts for this lens.** Double Diamond's first diamond
(Discover/Define before Develop/Deliver — [Design Council](https://www.designcouncil.org.uk/our-resources/framework-for-innovation/);
[Wikipedia](https://en.wikipedia.org/wiki/Double_Diamond_(design_process_model))):
**adapt** — the full four-stage ritual is human-cadence, but its one structural
law (explore/define the problem before exploring solutions) transfers directly
and costs one opening move. Working-backwards/PR-FAQ
([workingbackwards.com](https://workingbackwards.com/concepts/working-backwards-pr-faq-process/);
[aboutamazon.com](https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes)):
**adapt** — writing a full press release per change is wholesale human ritual
(smell), but "state the finished outcome first, then work backwards" collapses to
a one-line outcome statement at brainstorm open. JTBD
(Christensen/Klement): **adapt lightly** — useful vocabulary when the change has a
real consumer (Case's users, an adopting repo's operators); folds into G1's
problem framing rather than its own row. Opportunity Solution Trees (Torres):
**adapt** — the full tree is a standing discovery artifact for a product team, not
per-change ceremony; what transfers is the invariant *the solution node must hang
off an opportunity/outcome node* (G1) and *multiple solution candidates per
opportunity* (G2). Wardley mapping: **reject** as default brainstorm guidance —
it is business-landscape situational awareness on a strategy cadence
([lethain.com](https://lethain.com/wardley-mapping/)); map mode's
Destination/fog/out-of-scope structure (`:106-169`) already delivers proportionate
situational awareness for the efforts large enough to warrant any.

**Gap rows:**

| id | Current | Model | Gap | Candidate change |
|---|---|---|---|---|
| **R1-G1** | `phase-brainstorm.md:12` — "Brainstorm turns an idea into an agreed design"; dialogue enters at the solution. No problem/outcome-framing move anywhere in the reference or template. | Double Diamond first diamond (Design Council); Working Backwards outcome-first; OST root node (Torres) — **adapt** (one opening move, not the ritual) | The reference never requires the problem/outcome to be stated separately from the proposed mechanism, so a solution-shaped opening is converged on without the problem ever being examinable. | Add an opening move to §1: before pressure-testing the mechanism, state (or elicit) a one-line problem/outcome that names no mechanism, and get it agreed. **Done-means:** the gate recap contains a problem/outcome line a reader can point at that would survive the mechanism being swapped. **Size:** prose-only. |
| **R1-G2** | `phase-brainstorm.md:41-46` — recommendations must "widen the option space, not steer it"; nothing requires an alternative shape to ever be generated. | Double Diamond second diamond (Develop = diverge on solutions) — **adapt**: full ideation workshops are human-cadence; the machine-speed floor is one genuinely distinct alternative, or an explicit declaration | Divergence is guarded (agent may not narrow) but never mandated (nobody must widen): a brainstorm can pass the gate having only ever contained the human's first idea, with no evidence anyone looked sideways. | Add an "alternative-or-declare" rule to §1, mirroring contradiction-or-declare: before the gate, table at least one materially distinct solution shape, or state explicitly "no distinct alternative found — because X". **Done-means:** every gate recap carries either a rejected-alternative line or the explicit declination. **Size:** prose-only. |
| **R1-G3** | absent — neither file asks what the change is worth in time/cost; the only sizing question asked anywhere is the map-vs-plain trigger (`:108-113`). | Shape Up appetite / fixed-time-variable-scope ([ch. 3](https://basecamp.com/shapeup/1.2-chapter-03): "appetites start with a number and end with a design") — **adopt** (the question), **adapt** (the six-week cycle is rejected human cadence) | Brainstorm converges on a design with no declared bound on what the idea is worth, so the design's size is discovered downstream (plan/build) instead of constraining the design while it is still wet. | Add an appetite question to §1: elicit "how much is this worth?" (sessions/$-order, human's number) before converging, and use it as a design constraint ("what shape of this fits the appetite?"). **Done-means:** gate recap carries a human-uttered/ratified appetite line. **Size:** prose-only. Lens-6 consistency: feeds #160's `ceremony.recommended` evidence as a declared bound beside the estimator band (see §6). |
| **R1-G4** | `phase-brainstorm.md:33-38` — research is "proportional, not mandatory ceremony", used "when it would actually sharpen the thinking"; pure agent discretion with an explicit brevity bias. Map mode spawns research tickets structurally; plain mode has no default. | Double Diamond Discover (evidence-based divergence); Torres continuous-discovery habit (decisions grounded in touched evidence, not recall) — **adapt**: no weekly-interview cadence, but a default-on trigger list | Plain-mode brainstorms have no stated conditions under which research is expected, so whether prior art/external grounding happens is invisible: a skipped research pass and a considered-and-declined one look identical at the gate (#194's "should the guidance push harder?" — evidence: map-mode tickets research routinely, plain brainstorms rarely do). | "Research-or-declare": name default triggers in §1 (mechanism novel to the repo; external API/SDK/spec dependency; prior art plausibly exists; a load-bearing claim about external state) — when one fires, do the research pass before the gate or state "no research pass — because X" explicitly. **Done-means:** transcript shows grounding reads/citations before the gate, or the explicit declination line. **Size:** prose-only. |

## 2. Boundaries

Brainstorm's neighbour contract today: consumes nothing (`:52-56`), commits
nothing (`:72-74` — "the agreed design is carried forward into the Plan"), exits
via human approval (`:78-79`), and is always re-enterable backward (`:88-91`).
Completion evidence is "the human-approved design (plain mode) or a
decision-ready map destination (map mode)" (`:102-104`). The template is a thin
router by design (`templates/sdlc-brainstorm.md:4-6`, §3 degradation) and adds no
craft — correctly, per its own contract.

Two boundary gaps. First, the **exit artifact is shapeless**: "the agreed
design" has no stated minimum content, so what Plan receives depends entirely on
dialogue quality that session. Shape Up is the sharpest literature here: shaping
exits through an explicit de-risking pass (walk a use case in slow motion; patch
rabbit holes by dictating trade-offs; declare out-of-bounds; cut back) and a
pitch with five fixed ingredients (problem, appetite, solution, rabbit holes,
no-gos) ([ch. 5](https://basecamp.com/shapeup/1.4-chapter-05),
[ch. 6](https://basecamp.com/shapeup/1.5-chapter-06)). **Local evidence** (§5.5
of R0's method): the `pv1-task-scoped-tests` run — the brainstorm-approved design
pivoted twice under plan panel (regex naming rule disproven by counter-example in
round 2; single→array pivot in round 3;
`docs/plans/2026-07-24-pv1-task-scoped-tests.md:8-30`), pivots #174 itself calls
"brainstorm-grade rework". A slow-motion walkthrough of one manifest case at
brainstorm exit would plausibly have caught the regex counter-example a phase
earlier. Counter-evidence that the *recap-restated-into-plan* seam works when
exercised: the same plan doc's header cleanly carries the brainstorm's two
ratified corrections (`:7-11`) — the seam is sound; its input shape is what is
undefined.

Second, the **exit is binary when it should be three-way**: proceed-to-Plan or
map. The literature's third exit — *buy information first* — has no home. XP
spikes are precisely this: "sometimes you won't be able to estimate a story at
all until you've done your research; in this case, create a spike story and
estimate that instead", with hard discipline (small, standalone, throwaway,
answers one stated question, never becomes production code)
([Shore, Art of Agile Development](https://www.jamesshore.com/v2/books/aoad1/spike_solutions)).
Shape Up's expert walkthrough asks the same question conversationally ("not *is X
possible* but *is X possible within the appetite*"). Locally the pattern already
exists and works — map #158's #162 ticket was exactly a decision-grade prototype
(two runtimes built live, ≈$0.008, decision "build not borrow") — but only *map
mode* can express it (a `-prototype` ticket); plain brainstorm has no spike
vocabulary at all. #147 (grounded feasibility check) is the already-logged
partial answer for the *read tier* of the same problem: constraints that need no
experiment, just a mechanical dictionary check.

**Backward-transition findability** (the R0 lens question): the seam itself is
right and cheap (`:88-91`), but it is stated only from Brainstorm's side; whether
later phases *reach for it* is Plan/Spec/PR craft (#174 found it never proposed
across 14 rounds) — flagged as cross-phase tension for R5, not an R1 row.

**Gap rows:**

| id | Current | Model | Gap | Candidate change |
|---|---|---|---|---|
| **R1-G5** | `phase-brainstorm.md:72-74`, `:102-104` — exit is "the agreed design", content undefined; no de-risking pass; out-of-bounds exists only in map mode (`:146-150`). | Shape Up de-risking + pitch ingredients (problem, appetite, solution, rabbit holes, no-gos) — **adapt**: no committed pitch doc (Brainstorm rightly commits nothing); the ingredients become a structured *gate recap* the Plan restates | Because the exit artifact has no minimum shape, un-de-risked designs pass the gate and fail a phase later — falsified locally by pv1-task-scoped-tests' two plan-panel design pivots (`docs/plans/2026-07-24-pv1-task-scoped-tests.md:8-30`; #174 finding 3). | Define a **gate recap skeleton** in §8 (uncommitted; presented at the gate; Plan restates it): problem/outcome (G1) · appetite (G3) · agreed solution shape · rejected alternatives (G2, one line each) · rabbit holes found + patches dictated (incl. one slow-motion walkthrough of a concrete case) · out-of-bounds · surviving assumptions. **Done-means:** a Plan's brainstorm-provenance section can be filled by restating recap items verbatim; a recap missing an ingredient says so explicitly. **Size:** template section (structured section in the reference; router template untouched). |
| **R1-G6** | absent — no spike concept anywhere in either file; the only exits are Plan (`:102-104`) and map (`:108-113`); prototype-shaped work is expressible only as a map `-prototype` ticket (`:123-134`). #147 is logged for the read-tier subset. | XP spike solutions (Shore/Beck: spike when you cannot estimate until you've experimented; throwaway; one question; timeboxed) + Shape Up "present to technical experts" (feasibility-within-appetite) — **adopt** the trigger logic, **adapt** the packaging (a spike here is a pre-Plan child session/dispatch, not an iteration story) | There is no rule for when to buy information before incurring Plan ceremony, so feasibility assumptions either sail through (Case #35 / #147: approved design impossible under `noTools`) or force map mode's full apparatus for what is a single sharp question. | Add a **mechanical spike-vs-plan decision table** to §8, keyed on each load-bearing assumption surviving the recap (#161's verifiability vocabulary): (a) settleable by *reading* repo/config/docs/web → read now, never spike (extends the "never ask a repo-discoverable fact" law; #147's constraint-dictionary linter is this tier made mechanical — **endorse #147**, refined to the read-tier rung); (b) settleable only by a *bounded throwaway experiment* (runnable check exists; ≤ half-day; falsification would change the agreed design, not just a task) → spike before Plan: state the question first, timebox, throw the code away, record the answer as a recap assumption-resolution; (c) settleable only by *building the real thing* → no spike; carry as a named risk and front-load it in the Plan's sequencing; (d) not empirically checkable at all (judgment-only) → human call at the gate. **Done-means:** brainstorm exit is one of {Plan, map, spike}; every spike names its question + timebox before running; #147's linter passes at recap time where its dictionary applies. **Size:** prose-only in this reference; the linter itself stays #147's own slice (new check). |

## 3. FR/NFR placement

For Brainstorm (own-phase answer only; cross-phase verdict deferred to R2 per R0
§2, links #146): functional intent **enters** here by definition — it *is* the
idea. Nothing is **bound** here (correct: binding is Plan's measurable outcomes
and Spec's falsifiable scenarios), and nothing is **verified** here (correct).
The gap is on the NFR side of *entry*: `phase-brainstorm.md` contains no
requirements vocabulary at all — no prompt to surface performance, security,
compatibility, operability, or cost constraints as *design-shaping facts* during
the dialogue, even though such constraints routinely decide the design shape
(locally: pi-notion's read-only-by-construction posture, Case's trust-boundary
and posture-flag decisions were all NFR-driven design choices made at
brainstorm/design time). ISO/IEC 25010 is the shared taxonomy R2/R3 own; R1
needs only the *entry prompt*, not the taxonomy.

**Gap row:**

| id | Current | Model | Gap | Candidate change |
|---|---|---|---|---|
| **R1-G7** | absent — no NFR/constraint prompt anywhere in `phase-brainstorm.md`; constraints surface only if contradiction-or-declare (`:28-32`) happens to trip over one. | ISO/IEC 25010 as constraint-class checklist (via R2/R3's shared taxonomy) — **adapt**: at Brainstorm it is one elicitation question, never a taxonomy sweep | NFR-class constraints that will shape the design have no entry point at the phase where the shape is chosen, so they arrive late as plan/spec findings or not at all (#146's cross-phase question, seen from this phase's side). | Add one prompt to §1: "name the constraints that shape this design (performance, security, compatibility, cost, operability) — or state none were identified"; constraints are *named*, never bound, at this phase; binding placement is R2's verdict. **Done-means:** gate recap (G5) carries a constraints line, possibly "none identified". **Size:** prose-only, explicitly provisional on R2's #146 verdict. |

## 4. Iteration discipline

**No new gap row under this lens.** Reasoning, per the R0 lens question
(does human-world review literature transfer?): Brainstorm is the one design
phase with **no adversarial machine panel by construction**
(`review.brainstorm` ∈ {`human`, `off`}, `:81-84`), so the target-growth spiral
engine documented in #174 — fix waves growing the review target, feeding a
consistency-hunting reviewer — has no fuel here: there is no artifact to grow
and no re-dispatched reviewer. The phase's actual iteration risks are (a)
dialogue sprawl, already handled by the map trigger ("would blow the session's
context", `:108-113`), and (b) re-litigation of settled decisions on re-entry,
handled in map mode by the one-line "Decisions so far" gists and the
never-restate rule (`:115-121`) plus one-ticket-per-session (`:152-159`).
Fagan/Gilb inspection theory transfers only as the *idea of exit criteria* — and
that is exactly G5's recap, already rowed. The honest lens-4 answer for
machine-speed brainstorm iteration is "no prior art": the map-mode discipline is
homegrown and demonstrably working (map #158 ran five tickets to
decision-complete behind a stable low-res index; map #192 is doing it again),
and future tightening should derive from FS13 run data, not literature. Plain
mode's one durable-trace weakness — brainstorm decisions exist nowhere until the
Plan restates them, so late operator feedback (#136's discipline — link, not
restated) has nothing to reopen against — is closed by G5's recap, not by a
separate row. #174 and #136 are linked here as evidence anchors only.

## 5. Human comprehension surface

The R0 constraint: shallow surface, rich zoom-in; markdown-first;
mermaid-in-markdown is the zero-tooling baseline; `sdlc-visual-docs` is the
renderer seam proposals must position against. Map mode already *is* this
lens's answer for large efforts — the map body is the deliberately shallow
surface ("load the map's low-res body, not every ticket", `:152-159`) with
tickets as zoom-in; that is C4's zoom principle applied to decision records, and
it needs no change. Plain mode is the gap: the gate asks a human to approve a
design that exists only as scrollback. The minimum structural surface is G5's
recap. The minimum *visual* surface, for the change classes where prose
serialises badly (a new flow across components; ≥3 interacting parts; a state
machine), is a single mermaid block in the recap — verdict on the renderer seam:
**ignore `sdlc-visual-docs` for this phase**, deliberately: Brainstorm commits no
artifact, the skill's IA-graph front matter presumes a committed doc, and its
own contract already declares renders ephemeral/never required
(`system-reference.md` §9). Mermaid-in-dialogue is the whole answer at this
phase; the rich renderer belongs to Spec (R3 owns the deep treatment).

**Gap row:**

| id | Current | Model | Gap | Candidate change |
|---|---|---|---|---|
| **R1-G8** | absent — no visual/structural gate-surface guidance in plain mode; map mode's shallow-surface discipline (`:152-159`) covers only map-sized efforts. | C4 zoom-level principle (via R0 lens-5 corpus) + mermaid-as-baseline — **adapt**: one sketch at the gate, never a diagram set | For flow- or multi-component-bearing designs, the human approves a shape they have only ever seen as linear prose, so structural misunderstandings survive the gate silently. | In §8: when the agreed design introduces a new flow or ≥3 interacting components, the gate recap (G5) includes one mermaid sketch of the agreed shape; otherwise skip silently (no ceremony for small changes). Verdict on renderer seam stated explicitly: ignores `sdlc-visual-docs` (no committed artifact to feed it); markdown/mermaid only. **Done-means:** qualifying recaps carry one fenced mermaid block; non-qualifying recaps carry none. **Size:** prose-only. |

## 6. Ceremony scaling

**Consistency check only (per R0 §2 lens 6 and map #192 out-of-scope): no
contradiction with #158 found; three enrichments recorded as evidence for the
# 158 build stream, none reopening a decision.**

1. **Appetite (G3) enriches the #160 handoff.** Shape Up's "appetites start with
   a number and end with a design" is the human-declared complement of the #161
   estimator: the estimator *predicts* cost mechanically; appetite *declares*
   willingness. A brainstorm-elicited appetite line is exactly the kind of
   evidence the `ceremony.recommended` block should cite beside the mechanical
   band — and a band exceeding the declared appetite is a gate-time signal the
   estimator alone cannot produce. Enrichment, not contradiction: authority
   stays human, mechanism stays #161's.
2. **The spike exit (G6) is #158's named fog, fed — not reopened.** Map #158's
   "Not yet specified" explicitly parks "phase-collapsing rules (when does
   brainstorm hand off directly to implement?)". A spike is the inverse collapse
   (insert a bounded information-buying step *before* Plan), and G6's trigger
   table speaks #161's verifiability vocabulary (checkable-by-experiment vs
   settleable-by-reading vs judgment-only), so it slots into the estimator's
   `suggestion.collapse` conceptual frame. Recorded here as build-stream input
   per the R0 rule (contradictions/extensions are evidence for #158's build
   stream, never a reopened decision).
3. **Literature contradiction sweep.** Shape Up's *cadence* (senior people
   shaping out-of-cycle, a betting table every six weeks) is a human-clock
   ritual and is rejected wholesale — consistent with #158's dynamic,
   per-handoff ceremony rather than contradicting it. Double Diamond's scaled
   variants and XP's "most spikes are spur-of-the-moment; slack absorbs the
   cost" (Shore) both support banded, judgment-applied proportionality over
   fixed ritual — aligned with #161's S/M/L/XL bands and with the reference's
   existing "proportional, not mandatory ceremony" stance (`:33-38`). No
   corpus item was found that argues for *static* brainstorm ceremony floors.

**No gap row under this lens.**

---

## Consolidated gap table

| id | Lens | Current (f1cfad3) | Model (verdict) | Gap (falsifiable) | Candidate change (done-means · size) |
|---|---|---|---|---|---|
| **R1-G1** | 1 Expertise | `phase-brainstorm.md:12` — entry is solution-shaped; no problem-framing move | Double Diamond 1st diamond; Working Backwards; OST root (**adapt**) | Problem/outcome never required separately from mechanism, so it is never examinable | Opening move: agree a one-line mechanism-free problem/outcome before pressure-testing · recap carries a line that survives mechanism swap · prose-only |
| **R1-G2** | 1 Expertise | `:41-46` — agent may not narrow option space; nothing mandates widening | Double Diamond 2nd diamond, machine-speed floor (**adapt**) | A brainstorm can pass the gate having only ever contained the first idea | "Alternative-or-declare" mirroring contradiction-or-declare · recap carries rejected-alternative or explicit declination · prose-only |
| **R1-G3** | 1 Expertise | absent — no worth/appetite question in either file | Shape Up appetite (**adopt** question / **adapt** cadence) | Design converges with no declared bound on what it is worth; size discovered downstream | Elicit appetite before converging; use as design constraint · recap carries human-ratified appetite line · prose-only (feeds #160 evidence — §6) |
| **R1-G4** | 1 Expertise | `:33-38` — research fully discretionary with brevity bias; plain mode has no default triggers | Double Diamond Discover; Torres evidence-grounding (**adapt**) | Skipped research and considered-then-declined research are indistinguishable at the gate | "Research-or-declare" with named default triggers · transcript shows grounding reads or explicit declination · prose-only |
| **R1-G5** | 2 Boundaries | `:72-74`,`:102-104` — exit is "the agreed design", content undefined; out-of-bounds map-mode-only (`:146-150`) | Shape Up de-risking + pitch ingredients (**adapt**: recap, not committed doc) | Un-de-risked designs pass the gate and fail a phase later — pv1 plan pivots (`docs/plans/2026-07-24-pv1-task-scoped-tests.md:8-30`, #174 finding 3) | Gate-recap skeleton in §8: problem · appetite · shape · alternatives · rabbit holes/patches (incl. one slow-motion walkthrough) · out-of-bounds · assumptions · Plan provenance fillable verbatim · template section |
| **R1-G6** | 2 Boundaries | absent — exits are Plan or map only; no spike vocabulary; #147 logged for read tier | XP spikes (Shore/Beck) + Shape Up expert walkthrough (**adopt** trigger / **adapt** packaging) | No rule for when to buy information before Plan ceremony — Case #35/#147 sailed through; single sharp questions force full map apparatus | Mechanical read/spike/front-load/judgment decision table on recap assumptions (#161 vocabulary); **endorses #147** as the read-tier linter · exit ∈ {Plan, map, spike}; spikes name question+timebox first · prose-only (linter stays #147's slice) |
| **R1-G7** | 3 FR/NFR | absent — no constraint/NFR prompt in the reference | ISO/IEC 25010 entry prompt via R2/R3 taxonomy (**adapt**) | Design-shaping NFR constraints have no entry point at the phase where the shape is chosen (#146, this phase's side) | One elicitation prompt: name (never bind) design-shaping constraints, or "none identified" · recap carries constraints line · prose-only, provisional on R2's #146 verdict |
| **R1-G8** | 5 Comprehension | absent — no plain-mode gate surface; map-mode shallow surface (`:152-159`) covers maps only | C4 zoom principle + mermaid baseline (**adapt**) | Flow/multi-component designs are approved from linear scrollback only; structural misunderstanding survives silently | One mermaid sketch in recap when design introduces a new flow or ≥3 interacting components, else skip silently; **ignores `sdlc-visual-docs`** (no committed artifact) · qualifying recaps carry one mermaid block · prose-only |

Lens 4: no gap row (no-panel phase; map-mode discipline is the homegrown answer;
G5 closes the plain-mode trace weakness; #174/#136 linked as anchors).
Lens 6: no gap row (no contradiction; three enrichments recorded for #158's
build stream).

## Sources

**Kept:**

- Shape Up ch. 5, "Risks and Rabbit Holes" (<https://basecamp.com/shapeup/1.4-chapter-05>) — read in full; the de-risking pass, rabbit-hole questions, out-of-bounds, cut-back, expert walkthrough, "possible *within the appetite*"; backbone of G5/G6.
- Shape Up ch. 3, "Set Boundaries" (<https://basecamp.com/shapeup/1.2-chapter-03>) — appetite / fixed-time-variable-scope; backbone of G3.
- Shore & Warden, *The Art of Agile Development*, "Spike Solutions" (<https://www.jamesshore.com/v2/books/aoad1/spike_solutions>) — read in full; spike triggers ("can't estimate until you've researched → spike story"), throwaway discipline, contraindications; backbone of G6.
- Design Council, Framework for Innovation / Double Diamond (<https://www.designcouncil.org.uk/our-resources/framework-for-innovation/>; overview: <https://en.wikipedia.org/wiki/Double_Diamond_(design_process_model)>) — diverge/converge structure; G1/G2/G4.
- Teresa Torres, Opportunity Solution Trees (<https://www.producttalk.org/opportunity-solution-trees/>) — outcome-rooted discovery, multiple-solutions-per-opportunity invariant; G1/G2, expertise role.
- Working Backwards PR/FAQ (<https://workingbackwards.com/concepts/working-backwards-pr-faq-process/>; <https://www.aboutamazon.com/news/workplace/an-insider-look-at-amazons-culture-and-processes>) — outcome-first framing; G1.
- Will Larson on Wardley mapping (<https://lethain.com/wardley-mapping/>) — situational-awareness framing used for the reject verdict.
- Local primary evidence: `docs/plans/2026-07-24-pv1-task-scoped-tests.md` (brainstorm-grade pivots at plan panel + working recap-restatement seam); issues #147, #174, #136, #158, #161 brief (`docs/briefs/2026-07-23-ceremony-estimator-research.md`); map #158 as the map-mode exemplar.

**Dropped:**

- UXPin / EULE / Umbrex / Fountain Institute Double Diamond explainers — SEO secondaries; Design Council + Wikipedia suffice.
- PMAspirant / Bemind spike explainers — secondary; Shore is primary and richer.
- extremeprogramming.org/rules/spike.html — fetch blocked (ERR_BLOCKED_BY_CLIENT); Shore substitutes as primary.
- Amplitude / Shortform OST posts — secondary to producttalk.org.
- Stratrix / CIO Notes Wardley pages — SEO; Larson's practitioner account kept instead.

## Handoff to R5

Highest-leverage rows, in the author's judgment: **R1-G5** (the gate-recap
skeleton — it is the load-bearing change: G1, G2, G3, G7 and G8 all land as
lines *inside* that recap, so one template-section change carries five prose
rows and closes the plain-mode durable-trace weakness lens 4 identified) and
**R1-G6** (the spike decision table — the ticket's headline ask, mechanical via
# 161's vocabulary, and it upgrades #147 from an isolated linter into the read
tier of a principled three-way exit). Third: **R1-G1** (problem-before-solution
is the cheapest change with the widest literature consensus behind it).
Cross-phase tensions flagged, not resolved: (a) G5 moves de-risking work
*earlier* — Plan's provenance section must be specified to *restate the recap*,
which is an R2 surface (if R2 independently proposes a plan-side brainstorm
summary, the two must be one contract, not two); (b) the backward-transition
trigger problem (#174: brainstorm-grade findings at plan panel never proposed a
backward transition) is observable only from Plan/Spec/PR — R1 notes it but the
candidate guidance belongs in R2/R3's references and the shared panel prose;
(c) G6's spike exit gives the #158 build stream its "phase-collapsing rules"
fog a concrete first instance — R5 should route that row's ceremony-facing half
to the #158 build stream rather than slating it as pure phase-reference prose.
