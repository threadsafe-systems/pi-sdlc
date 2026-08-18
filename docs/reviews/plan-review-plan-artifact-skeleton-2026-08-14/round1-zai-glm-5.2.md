### Shipped §4 prose pins a promise this plan falsifies — and bars the fix

- severity: high
- confidence: high
- origin: NEW
- location: Plan Scope In item 3 vs Out bullet 1 ("Any change to the provenance contract itself (owned by the gate-presentation spec and §4's existing text)"); `skills/sdlc/references/phase-plan.md:50`; `test/gate-presentation-contract.test.js:306-309`
- defect: In-scope item 3 deliberately edits `adversary-plan.prompt.md` (FS19 unfreeze), but `phase-plan.md` §4 — S3's shipped gate-presentation text, pinned literal by GPC2 — states "the prompt itself stays untouched", and the plan's out-of-scope list bars any change to §4's existing provenance text, so the plan mandates a state that falsifies shipped prose it has simultaneously locked out of scope.
- evidence: `phase-plan.md:50` "adversary plan prompt's attack surface D — the prompt itself stays untouched."; `test/gate-presentation-contract.test.js:309` `assert.match(planSec4f, /the prompt itself stays untouched/)`; plan In item 3 "it is unfrozen by removing it from the frozen array under the deliberate-change precedent"; plan Out: "Any change to the provenance contract itself (owned by the gate-presentation spec and §4's existing text)".
- impact: After merge and re-freeze, §4 carries a test-pinned, now-false current-tree claim; the project's own premise-durability law (`phase-spec.md` §4 "Premise durability"; IDV30, where an expired premise "turned main red") treats exactly this class as a defect, and repairing it later needs another deliberate GPC test change this plan never plans for. GPC2's ordering pins (rule between opening paragraph and Dialogue discipline) also constrain the §4 insertion point, unmentioned.
- fix: Add one scope clause: the §4 edit may adjust that single clause (e.g. "the prompt itself is changed only under the FS19 deliberate-change precedent") and name GPC2's pinned literals/orderings as constraints on the §4 insertion.

### S1's shipped M5 test pins the inventory at exactly 81 rows — S2's own inventory row breaks it, and the plan never names that surface

- severity: medium
- confidence: high
- origin: NEW
- location: Plan Scope In item 6 (FS11 inventory row), item 7 / DoD 7; `test/spec-artifact-skeleton.test.js:99`
- defect: Adding `reference.plan-artifact-skeleton` to `skills/sdlc/assets/normative-references.json` moves `sources.length` from 81 to 82, failing S1's shipped M5 assertion `assert.equal(inventory.sources.length, 81, ...)`, yet `test/spec-artifact-skeleton.test.js` appears nowhere in the plan's changed-surface enumeration (Scope, Assumption 4, DoD 5, or Context for the next agent).
- evidence: `test/spec-artifact-skeleton.test.js:99`; verified current count = 81 (`node -e` over the asset); S1's PR fix-wave explicitly recorded "Rejected: R1 (M5's exact-81 pin is the design; future slices amend it deliberately)" (commit 6566d27) — a known cross-slice obligation S2 inherits silently.
- impact: DoD 7 ("full test corpus passes") is unsatisfiable as scoped until an unlisted shipped test is amended; the plan's exhaustive "named permitted change classes" claim is false, and the coupling surfaces at red-CI cost instead of plan time.
- fix: Add `test/spec-artifact-skeleton.test.js` (M5 count 81→82) to the named change surfaces in Scope item 7 and Context for the next agent.

### #146 gets two different tracker end-states, and the disposition is misattributed to R5 §3

- severity: medium
- confidence: high
- origin: NEW
- location: Plan Brainstorm provenance decision (plan line 29) vs Scope In item 8 (line 80) and DoD 9 (line 111)
- defect: The provenance decision says "#146 re-scoped on the tracker with a durable comment — ratified in R5 §3" while Scope item 8 and DoD 9 say the orchestrator "closes #146 as superseded" — re-scope (issue open, altered scope) and close-as-superseded are different, differently-auditable tracker dispositions; and R5 §3 ratified only that the sweep "supersedes #146's bare-checklist shape", never a close or re-scope of the issue.
- evidence: plan line 29 vs plan lines 80/111; `docs/briefs/2026-07-26-design-phase-r5-synthesis.md:59` ("**supersedes #146's bare-checklist shape**" — no tracker disposition anywhere in R5).
- impact: DoD 9's completion action is ambiguous (the next agent cannot tell whether the slice ends with #146 open-but-rescoped or closed), and an auditor following the "ratified in R5 §3" pointer finds no such decision there, breaking the provenance audit trail.
- fix: State one disposition in all three places (e.g. "closed as superseded, the durable comment recording the absorbed rows and the two rejected mandates") and attribute it to the 2026-08-14 gate, not R5 §3.

### G3's ratified done-means ("the metric is carried to Spec/retro") has no home in the planned outcome-proof row

- severity: medium
- confidence: high
- origin: NEW
- location: Plan Scope In item 1 "Outcome proof (G3)" (line 64) and draft binding rule 3 (line 72); R2 brief G3 done-means
- defect: The plan's own Context names the R2 brief "the authority for each gap's candidate change and done-means", and G3's done-means is "every objective has one metric or a cited no-measurement rationale, **and the metric is carried to Spec/retro**" — but the outcome-proof row is specified as {goal, question, metric, baseline, target/window, evidence owner} with no carry/destination field (unlike the G4 sweep's "binding phase" column), and neither draft rule 3 nor any DoD item carries the metric forward.
- evidence: `docs/briefs/2026-07-26-design-phase-r2-plan.md:39` (G3 done-means); plan lines 64 and 72.
- impact: Metrics discovered at Plan can die at Plan — precisely the failure G3 was ratified to close (a delivery DoD proves files shipped while nothing downstream observes the outcome move); the drop is unflagged relative to the declared authority.
- fix: Add a carry/destination field to the outcome-proof row (or a rule-3 clause) requiring each metric to name its Spec/retro landing site.

### Draft binding rule 5 strips G5's class gate off the pre-mortem zero state

- severity: medium
- confidence: high
- origin: NEW
- location: Plan Scope In item 2, draft binding rule 5 (line 74) vs the pre-mortem component (line 66) and R2 brief G5 done-means
- defect: The brief's done-means makes risk rows mandatory for "irreversible/cross-component Plans" with the zero state justified only for "small reversible work"; the skeleton bullet keeps that gate (line 66) but draft rule 5 — the text destined for §4, the binding surface the gate enforces — reads "…or the block declares its zero state" with no size/class condition, so as drafted an irreversible plan passes with a bare zero-state declaration.
- evidence: `docs/briefs/2026-07-26-design-phase-r2-plan.md:19` (G5 done-means); plan line 66 vs line 74.
- impact: The binding law waters down the ratified done-means at the one surface the plan gate actually enforces, and a spec that copies the draft verbatim freezes the weaker rule.
- fix: Put the class/size condition inside rule 5 itself ("…or, for small reversible work, the block declares its zero state with a one-line reason").

CLEAR: A — every DoD item is mechanically or tracker-inspectable falsifiable (files, contract tests, byte-identity, tracker state); no opinion-only or unobservable item found.
CLEAR: F — irreversible track correctly declared: the slice freezes the plan artifact shape, a public authoring surface adopted repos and later slices (S6) bind to, matching S1's precedent.
CLEAR: PROPORTIONALITY — all verification machinery is budgeted and bounded (contract tests < 1 s, offline, no network; `npm test` under the 30-second external timeout; the mechanical sweep linter/CI check deliberately rejected as advisory-only; unfreeze/re-freeze and #146 close are one-shot orchestrator actions).
