# Spec: S4 spike exit rule (map #192)

Status: rev 4. Run slug `spike-exit-rule`, track irreversible. Plan:
`docs/plans/2026-08-09-spike-exit-rule.md` rev 4 at `e16f3db`. Spec author:
`openai-codex/gpt-5.6-sol`.

No inbound `CARRY-TO-SPEC` exists. The Plan's parked ephemeral-evidence
follow-up remains out of implementation scope; SER14 gives its durable issue
record a PR-gate destination.

## Vocabulary

| Term | Definition | Binds to |
|---|---|---|
| load-bearing uncertainty | An unresolved question whose answer can change the proposed design, delivery approach, or decision to proceed | `phase-brainstorm.md` §8 |
| delivery-grade | Requiring detailed solution requirements, delivery acceptance, or production behaviour and therefore belonging in Plan rather than a spike | `phase-brainstorm.md` §8 |
| human checkpoint | A stop where the human approves spike goals, addressed uncertainty, and exit criteria before work starts or continues | `phase-brainstorm.md` §8 |
| spike | An information-buying Brainstorm activity that begins only after a human approves its goals, addressed uncertainty, and exit criteria | `phase-brainstorm.md` §8 |
| exit criteria | Evidence conditions agreed before a spike that decide whether its uncertainty has been answered sufficiently | `phase-brainstorm.md` §8 |
| direction | The post-spike decision for the proposed change: stop, revise, or proceed | `phase-brainstorm.md` §8 |
| artifact treatment | The post-spike decision for the spike material: discard, retain as reference, provisional foundation, or provisional candidate deliverable | `phase-brainstorm.md` §8 |
| foundation | Provisional permission to build on retained spike material, never a requirement to reuse it | `phase-brainstorm.md` §8 |
| candidate deliverable | Provisional treatment of retained spike material as a possible deliverable, subject to every remaining lifecycle contract | `phase-brainstorm.md` §8 |
| spike evidence | Material produced or consulted by a spike and linked when retained; its durable decision-line summary survives removal of the material | `phase-brainstorm.md` §8 |

Binding rule: every coined term used two or more times in the body appears in the Vocabulary table, and every term in the table appears in the body.

## Contracts

### C1 Ordered uncertainty routing

- Signature/shape: one literal `### Spike exit loop` block inside
  `skills/sdlc/references/phase-brainstorm.md` §8, extending from that heading to
  the next heading of level 2 or 3 (`##` or `###`), or the end of §8.
  Deeper subheadings remain inside the block. It applies an ordered
  four-route guide to each load-bearing uncertainty: (1) existing evidence
  sufficient to settle it → read now; (2) answering is delivery-grade → Plan
  and front-load; (3) no empirical evidence can settle it → human judgment;
  (4) remaining empirical uncertainty → propose a spike.
- Preconditions: the Brainstorm design still contains a load-bearing
  uncertainty at the point the agent would otherwise present the gate.
- Postconditions: one route owns the next action; available-but-insufficient
  evidence cannot select read; delivery-grade uncertainty cannot fall through
  to judgment or spike; an incompletely defined spike remains in Brainstorm.
  The read route names #147 as future mechanisation and explicitly outside S4.
- Invariants: the guide is prose, not a parser or third gate artifact; no
  numerical time/cost threshold; no second fenced diagram; GPC C1's
  exactly-two-artifact presentation, one existing mermaid fence, three line
  kinds, amendment loop, and literal `The next transition is **Plan**` anchor
  remain unchanged.
- Error semantics: evaluate the routes in written order and stop at the first
  matching route. A candidate spike without approved exit criteria does not
  start and remains in Brainstorm; it is not a fifth route.
- Gated by: SER1, SER2, SER3, SER5, SER13

### C2 Spike checkpoint and continuation

- Signature/shape: before a spike starts, a human checkpoint approves one or
  more goals, the uncertainty each goal addresses, and exit criteria. If the
  exit criteria are inadequately met or the spike reveals a new uncertainty,
  continuing or redirecting requires a fresh checkpoint with amended goals and
  exit criteria.
- Preconditions: C1 selects the spike route; the candidate activity is
  exploratory rather than delivery-grade.
- Postconditions: the spike starts with an explicit evidence target; scope
  growth is visible and human-ratified; silent continuation is forbidden.
- Invariants: no mandatory clock or cost ceiling; criteria requiring detailed
  solution requirements or delivery acceptance identify a deliverable in
  disguise and route to Plan before work starts.
- Error semantics: absent goals, uncertainty, exit criteria, or human approval
  blocks the spike. Inadequate/new evidence blocks continuation, direction
  selection, and any Plan transition until the fresh checkpoint resolves it and
  the amended current criteria are adequately met.
- Gated by: SER3, SER4, SER5, SER6

### C3 Spike exit interpretation

- Signature/shape: after evaluating exit criteria, the decision line records
  what was learned and selects direction independently from artifact treatment.
  Direction is exactly stop, revise, or proceed. Artifact treatment is exactly
  discard, retain as reference, provisional foundation, or provisional
  candidate deliverable.
- Preconditions: a spike ran under C2 and its current exit criteria have been
  evaluated and adequately met.
- Postconditions: stop closes the proposed change without delivery; revise
  returns to Brainstorm; proceed allows the normal Brainstorm gate to transition
  to Plan. The material is handled according to its separately selected
  artifact treatment.
- Invariants: all direction × artifact-treatment combinations are legal only
  when a provisional foundation/candidate names the future or proceeding effort
  it serves; otherwise that treatment reduces to reference or discard. Reuse is
  never mandatory. Foundation and candidate-deliverable treatments remain
  provisional until downstream lifecycle contracts are satisfied.
- Error semantics: an unlisted direction/treatment or an unnamed destination for
  a provisional treatment is invalid; the decision line must be amended before
  the Brainstorm gate can pass.
- Gated by: SER7, SER8, SER9, SER11, SER13

### C4 Spike evidence record

- Signature/shape: retained spike evidence may use whatever durable form fits —
  document, issue comment, prototype branch, or artifact directory — and is
  linked from an existing `decision:` line. The line itself summarizes what was
  learned, direction, and artifact treatment without depending on the link.
- Preconditions: C3 selects a treatment other than discard.
- Postconditions: downstream phases can discover the retained material while it
  is useful; removing it later does not erase or falsify the durable decision.
- Invariants: no mandatory `docs/spikes/` hierarchy; no fourth decision-line
  kind; the initial corpus is qualitative decision lines and links only — no new
  FS13 event vocabulary.
- Error semantics: retained evidence without a link, or a decision line that is
  meaningless after link removal, blocks the Brainstorm gate. Discard requires
  no link but retains the self-contained learning summary.
- Gated by: SER10, SER13, SER14

### C5 Shared contract-test extension

- Signature/shape: append S4 assertions to
  `test/gate-presentation-contract.test.js`. A short structural helper extracts
  the literal `### Spike exit loop` block through the next heading matching
  `^#{2,3}[ ]`, while retaining deeper subheadings. Existing GPC assertions own
  the gate-presentation block; `SER` assertions own only that extracted spike
  block.
  The same file adds current-tree exact-set assertions for the six
  `references/phase-*.md` files and six `templates/sdlc-*.md` routers.
- Preconditions: C1–C4 prose exists in phase-brainstorm.md §8.
- Postconditions: anchor/order drift fails offline; the focused file remains the
  one test owner for §8 and stays under GPC10's anti-restatement self-check.
- Invariants: Node built-ins only; the block helper is structural test
  extraction, never runtime grammar machinery; no dependency, config dial,
  script, schema, consumer-fixture change, or new test file; no test contains a
  contiguous ≥80-character substring from a governed document.
- Error semantics: missing/duplicated route anchors, wrong route order, missing
  checkpoint/outcome/evidence anchors, restated governed prose, or a focused
  runtime ≥1 second fails the relevant scenario.
- Gated by: SER1–SER12

Binding rule: every interface this change introduces or modifies has a Contracts block (interfaces mentioned only as unchanged context do not, and must not be silently re-described).

## Surface area

| Surface | Change |
|---|---|
| `skills/sdlc/references/phase-brainstorm.md` §8 | Add the distinct ordered spike-exit loop and make the Plan transition conditional on post-spike direction while preserving the existing gate-presentation contract |
| `test/gate-presentation-contract.test.js` | Append `SER` anchor/order assertions under the existing imports, section helper, and anti-restatement guard |
| Lifecycle artifacts under `docs/` | Add this Spec, Build plan, panel records, task receipts, and the parked-follow-up issue link; no runtime or consumer surface |

No other public reference, template, prompt, config, script, schema, package
manifest, fixture, or runtime source is modified.

## Functional requirements

| FR | Requirement | Binding |
|---|---|---|
| F1 | Route every load-bearing uncertainty through the ordered read → Plan/front-load → human-judgment → spike guide, with first-match precedence and no fifth route; name #147 as future read-tier mechanisation outside S4 | C1, SER2, SER3, SER13 |
| F2 | Require a human-approved goal set, addressed uncertainty, and exit criteria before starting; require a fresh checkpoint for continuation or redirection | C2, SER4, SER6 |
| F3 | Keep spikes exploratory: no mandatory numerical threshold, and delivery-grade criteria route to Plan as a deliverable in disguise | C1, C2, SER3, SER5 |
| F4 | Record direction independently from artifact treatment and enforce the provisional-treatment destination/downstream-contract rule | C3, SER7, SER8, SER9 |
| F5 | Let retained evidence use a suitable durable form while keeping the decision line self-contained and the corpus qualitative | C4, SER10 |
| F6 | Preserve the exact six phase-reference and six router-template files, exactly two Brainstorm gate artifacts, the single existing mermaid fence, and the three-kind decisions grammar | C1, C5, SER1, SER11 |
| F7 | Extend the one existing §8 contract-test owner without adding parser/tooling/config/telemetry/storage machinery | C5, SER11, SER12, SER13 |
| F8 | Before the PR gate passes, file and link the parked ephemeral spike-evidence lifecycle follow-up without implementing it in S4 | C4, SER14 |

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
|---|---|---|---|
| Maintainability — analysability | An agent decides how to resolve a load-bearing uncertainty | Four route anchors appear once in a readable first-match order; route order is mechanically asserted | SER2, SER3 |
| Maintainability — modularity | A future editor changes §8 | One test file owns all §8 assertions; zero ≥80-character governed-doc restatements | SER11 |
| Performance efficiency — time behaviour | The focused contract corpus runs locally or in CI | Exit 0 offline in less than 1 second | SER12 |
| Compatibility — co-existence | The spike block lands beside GPC C1 | Existing GPC assertions remain green; exact current-tree phase-reference/router sets stay six; exactly two gate artifacts and one §8 mermaid fence | SER1, SER12 |
| Portability — adaptability | Retained spike evidence has a format unlike prior spikes | Any durable form is allowed; the decision line remains meaningful without resolving the link | SER10 |

Binding rule: every NFR has a response measure and a binding scenario id, or the literal marker `unbound — accepted at gate` with a reason.

## Scenarios

Kind tally: 12 mechanical, 1 inspection, 1 carried — 14 total, 86% mechanical.

### SER1 — existing gate and topology invariants survive · mechanical

Given: `phase-brainstorm.md`, `test/gate-presentation-contract.test.js`, and the
current-tree reference/template directories at HEAD.
When–Then: existing GPC assertions still prove one **The gate presentation**
block, exactly two artifacts, exactly one §8 mermaid fence, and three line
kinds; the appended exact-set assertion discovers precisely six
`references/phase-*.md` files and six `templates/sdlc-*.md` routers; the
proceed branch retains the literal `The next transition is **Plan**` anchor.
Falsify: any existing GPC assertion fails, a second mermaid fence appears, either
exact set differs, the spike becomes a gate artifact, or the literal Plan
transition anchor disappears.

### SER2 — ordered four-route guide · mechanical

Given: the distinct spike block in `phase-brainstorm.md` §8.
When–Then: normalized prose contains one anchor for each route and their first
occurrences are strictly ordered: read existing sufficient evidence, Plan and
front-load delivery-grade work, human judgment for empirically undecidable
questions, then propose a spike for the remainder; the prose names first-match
precedence, and the read route names #147 as future mechanisation outside S4.
Falsify: a missing/duplicate route, Plan after judgment, spike before a prior
route, no first-match rule, or removal/implementation of the #147 future-work
anchor.

### SER3 — route boundaries are exhaustive · mechanical

Given: a load-bearing uncertainty at Brainstorm exit.
When–Then: §8 distinguishes sufficient from merely available evidence; sends
detailed requirements, delivery acceptance, or production behaviour to Plan;
reserves judgment for questions no empirical evidence can settle; and keeps a
candidate spike with incomplete goals/criteria in Brainstorm rather than
starting work or inventing a fifth route.
Falsify: available-but-insufficient evidence selects read, delivery-grade work
can reach judgment/spike, an empirically answerable non-delivery-grade question
is routed to judgment instead of spike, or incomplete criteria permit a spike
to start.

### SER4 — pre-spike human checkpoint · mechanical

Given: C1 selects the spike route.
When–Then: §8 requires human approval of one or more goals, the uncertainty each
goal addresses, and exit criteria before work begins.
Falsify: any of the three fields or human approval is optional, inferred after
the work, or omitted.

### SER5 — exploratory altitude without a numeric threshold · mechanical

Given: proposed spike exit criteria.
When–Then: §8 says no mandatory numerical time/cost threshold applies initially,
but criteria requiring detailed solution requirements or delivery acceptance
identify a deliverable in disguise and route toward Plan.
Falsify: a fixed duration/cost becomes mandatory, the disguise warning is
missing, or delivery acceptance is allowed to remain a spike.

### SER6 — continuation requires a fresh checkpoint · mechanical

Given: a spike whose criteria are inadequately met or whose evidence reveals a
new uncertainty.
When–Then: §8 requires a fresh human checkpoint with amended goals and exit
criteria before continuing, redirecting, selecting any direction, or
transitioning to Plan; only adequately met current criteria unlock C3.
Falsify: the agent may silently extend scope, continue under stale criteria,
select stop/revise/proceed while current criteria are inadequate, transition to
Plan, or ratify the amendment after more work has occurred.

### SER7 — direction and lifecycle transition · mechanical

Given: a spike whose current exit criteria have been evaluated and adequately
met.
When–Then: §8 lists direction as exactly stop, revise, or proceed; stop closes
the proposed change without delivery, revise returns to Brainstorm, and proceed
allows the normal gate transition to Plan.
Falsify: another direction appears, stop still mandates Plan, revise exits
Brainstorm, or proceed bypasses the Brainstorm gate.

### SER8 — artifact treatment is independent and provisional · mechanical

Given: the same completed spike as SER7.
When–Then: §8 lists artifact treatment separately as exactly discard, retain as
reference, provisional foundation, or provisional candidate deliverable; reuse
is never mandatory and both provisional forms remain subject to downstream
lifecycle contracts.
Falsify: treatment is derived from direction, reuse becomes mandatory, a
foundation is treated as accepted implementation, or a candidate deliverable
bypasses a downstream gate.

### SER9 — direction × treatment combination rule · mechanical

Given: a decision line selecting direction and a provisional foundation or
candidate-deliverable treatment.
When–Then: §8 permits the combination only when the line names the future or
proceeding effort it serves; without that destination, treatment reduces to
reference or discard.
Falsify: a dangling provisional treatment passes the gate, a named treatment
mandates reuse, or direction and treatment are collapsed into one enum.

### SER10 — evidence location, link, summary, and qualitative corpus · mechanical

Given: spike evidence selected for retention.
When–Then: §8 allows a document, issue comment, prototype branch, or artifact
directory; requires a link from an existing `decision:` line; requires the line
to summarize the learning, direction, and treatment independently of the link;
and says the initial corpus is qualitative only.
Falsify: one storage hierarchy becomes mandatory, a fourth line kind appears,
the line becomes meaningless after link removal, or a new telemetry event is
required.

### SER11 — shared test ownership and anti-restatement · mechanical

Given: `test/gate-presentation-contract.test.js` after S4 assertions land.
When–Then: the existing file owns both its GPC block assertions and the distinct
SER spike-block assertions; imports remain Node built-ins; GPC10 finds no
contiguous ≥80-character governed-doc substring in the whole test file.
Falsify: a second test file owns §8, a non-built-in parser appears, GPC and SER
ownership overlap ambiguously, or GPC10 reports restated prose.

### SER12 — focused and full verification budgets · mechanical

Given: the implemented S4 diff.
When–Then: `node --test test/gate-presentation-contract.test.js` exits 0 offline
within 1 second; `npm test` exits 0 within 30 seconds; `npx biome check
test/gate-presentation-contract.test.js` exits 0 within 5 seconds; and
`node skills/sdlc/scripts/check-references.mjs` exits 0 within 5 seconds; and
`bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug
spike-exit-rule` exits 0 within 5 seconds once the Plan, Spec, and Build
artifacts are committed.
Falsify: any non-zero exit, missing lifecycle artifact, network access, focused
runtime ≥1 second, or command exceeding its named budget.

### SER13 — guidance stays guidance · inspection

Given: the committed PR-review consolidated record, which names the immutable
reviewed head SHA, exact changed-file inventory, panel-output-availability time,
adjudication start/finish times, and incremental model-call count, plus the final
§8 prose at that SHA.
When–Then: in the existing configured PR-panel wave, with an incremental budget
of zero extra reviewers/model calls, at most one checklist row per reviewer, and
at most 5 minutes of adjudication after panel outputs are available, the panel
judges that the ordered rule is understandable without a parser, that
qualitative predicates imply no hidden numerical threshold, that #147 is named
only as future read-tier mechanisation, and that no config, script, schema,
telemetry, mandatory storage hierarchy, or reuse mandate was introduced; the
consolidated record preserves the verdict and inventory after merge.
Falsify: the record lacks the SHA, inventory, verdict, output-availability time,
adjudication start/finish times, or model-call count; the prose needs
implementation knowledge to apply; an unstated fifth route is needed; #147 is
implemented or omitted; the diff adds prohibited machinery/mandate; the
inspection launches any reviewer beyond the configured PR panel; or the retained
timestamps show adjudication exceeding 5 minutes after outputs are available.

### SER14 — ephemeral-evidence lifecycle follow-up is durable · carried

Carried to: pr_review.
Given: the committed PR-review consolidated record, which records host-action
start/finish times and incremental model-call count, and the Plan's parked
question about temporary spike evidence that becomes noise after implementation.
When–Then: before the PR gate passes, within a host-action budget of 5 minutes
and zero model calls, a durable tracker issue exists and is linked from the
consolidated review; it asks whether to promote retained material or delete it
and repair every temporary Plan/Spec pointer before merge. S4 itself does not
implement that policy; the retained issue URL, timestamps, call count, and
review record keep the scenario falsifiable after merge.
Falsify: the committed review record lacks the durable issue id/link,
host-action start/finish times, or model-call count; the follow-up loses either
promotion or delete-and-repair outcome; retained timestamps exceed 5 minutes;
the call count is non-zero; or S4 grows retention tooling.
