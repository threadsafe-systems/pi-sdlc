# plan_review round 1 — anthropic/claude-fable-5:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `7c2ae92`.
Verbatim reviewer output.

---

### The no-orphan rule has no enforcement point for CARRY-TO-BUILD, and no in-scope surface owns any receiving-side check

- severity: high
- confidence: high
- location: Rationale D8; Scope items 1, 3–6
- defect: D8 freezes "a receiving gate is not passable while a carry addressed to it is unlanded," but the scope table only adds *outbound* dispositions (`phase-plan.md` §5 gains `CARRY-TO-SPEC`, `phase-spec.md` §5 gains `CARRY-TO-BUILD`) and the glossary is "Terms only — no when/who mechanics" (item 1). No in-scope change assigns the inbound "is a carry addressed to me unlanded?" check to any phase reference — and for `CARRY-TO-BUILD` the named enforcement point does not exist: Build has no gate at all.
- evidence: skills/sdlc/references/phase-tasks.md:81-83 — "## 5. Invariant gate/approval seam / Build has **no gate of its own** — it is derived from the vetted Spec. Its output is validated downstream, per-task, during Implement." `phase-implement.md` (receiving phase for item 6's `CARRY-TO-IMPLEMENT`) appears nowhere in the scope table.
- impact: The plan's central guarantee — a finding is "never silently absorbed, re-litigated, or dropped" — is exactly the property the no-orphan rule carries, and it merges as a glossary term with no phase obligated to check it; a `CARRY-TO-BUILD` minted at the Spec panel can orphan with no gate anywhere that is "not passable." This is the irreversible track: the vocabulary shape freezes with the hole in it.
- fix: Add scope rows assigning the inbound-carry check to each receiving phase's reference (and for gateless Build/Implement, name the substitute checkpoint — e.g. Build-plan completion evidence in `phase-tasks.md` §8 and task claim in `phase-implement.md`), or narrow D8 to destinations whose receiving gate exists.

### Carry destinations are defined against the maximal shape only; merged-Spec and reversible configurations make `CARRY-TO-SPEC` point at a phase that does not exist

- severity: medium
- confidence: high
- location: Scope items 3–4; Rationale D8
- defect: The plan fixes `CARRY-TO-SPEC` as the Plan panel's legal carry and `CARRY-TO-BUILD` as Spec's, unconditionally — but the phase references it amends are config-agnostic contracts in which the "next phase" varies: under `shape.separateSpec: false` there is no separate Spec gate (one merged design gate), and the references' own law is to route every configuration-dependent branch through an "under your configuration" callout.
- evidence: skills/sdlc/references/phase-plan.md:74 — "When `shape.separateSpec: false`, Plan and Spec merge into one gated artifact"; phase-plan.md:95-97 — "Next transition is **Specification** (or **Build/Tasks** directly when `shape.separateSpec: false` merges them, or on the reversible track where Spec is not required)."
- impact: The Spec will have to invent destination-resolution behaviour for non-maximal shapes (does a merged-gate panel mint `CARRY-TO-BUILD`? is `CARRY-TO-SPEC` illegal there?) with no plan-level decision to ground it — precisely the "under-scoped by construction" failure the plan's own rationale warns about.
- fix: Add one sentence to Scope item 1 or D8 defining the destination as "the next phase in the effective configured sequence," with the concrete tokens as the maximal-shape instances.

### The round cap's "move on" verdict is unbounded and collides with the stop condition and the merge prohibition at pr_review

- severity: medium
- confidence: high
- location: Rationale D4; Scope item 2 (Step 5 additions)
- defect: D4 has the human adjudicate "iterate-vs-move-on," and item 2 installs the round-4 cap in `phase-pr-review.md` §5 Step 5 — the run-shape shared by plan, spec, *and PR* panels. "Move on" with surviving high/medium findings is forbidden at PR ("Merging with a high or medium finding that survived adjudication is forbidden"), and the workflow.md semantics D4 claims to keep contain no "move on" option at all — its three options are keep going, restructure, or backward transition.
- evidence: .pi/sdlc/workflow.md:40-43 — "Diagnose to the human: is this (a) genuine rev1 defects (keep going), (b) findings caused by your own fix waves (churn — restructure instead), or (c) a design flaw (backward transition to Plan)?"; skills/sdlc/references/phase-pr-review.md:242; skills/sdlc/SKILL.md:194 (red flag).
- impact: The Spec must either invent the bounded option list (undecided at Plan altitude for a change whose whole point is bounding dispositions) or ship a §5 rule that lets a human "move on" past surviving highs at PR — weakening a gate, which SKILL.md's gate/process rule forbids.
- fix: Enumerate the churn-diagnosis options in the plan (workflow.md's a/b/c plus ratified dismissal) and state that at `pr_review` "move on" is only reachable via ratified dismissals, never past a surviving high/medium.

### Trim-the-tail promotion contradicts the panel-floor/shortfall law it will now live beside

- severity: medium
- confidence: high
- location: Rationale D7; Scope item 2 (Steps 3–4 additions)
- defect: Trim-the-tail re-dispatches "ONLY that reviewer" — a deliberate one-reviewer round — but the same §5 it is being promoted into applies a configured per-phase panel floor with a shortfall posture; this repo's committed floor is 2 with `onShortfall: "fail"`. The plan promotes the rule globally without stating whether a delta-confirmation round is exempt from the floor.
- evidence: .pi/sdlc/workflow.md:36-39 (trim-the-tail); skills/sdlc/references/phase-pr-review.md:83-94 (floor + `review.onShortfall`, "`fail` = hard-fail below the floor"); .pi/sdlc/sdlc.config.json — `"panelSize": 2, "onShortfall": "fail"`.
- impact: As global prose law, a literal reading makes every trim-the-tail round a floor violation under `fail`-posture configs (i.e., this repo's); the rule that worked as a local supplement becomes self-contradictory law when promoted, and the Spec has no plan-level decision to resolve it.
- fix: State in the plan that the panel floor governs full review rounds and a trim-the-tail delta confirmation is an explicitly exempt sub-floor dispatch.

### DoD 11 cannot fail: "dogfood dividend is observed" has no fail condition and "where it is already written" excuses everything

- severity: medium
- confidence: high
- location: Definition of done, item 11
- defect: DoD 11 requires this slice's own panels to run "under the new vocabulary where it is already written." The prompt/reference changes are authored during Implement, i.e. *after* both the plan panel and spec panel have run — so at panel time the only vocabulary "already written" is `.pi/sdlc/workflow.md`'s existing four rules, which are mandatory today regardless of this slice. And "the dogfood dividend is observed" names no observable that could be absent.
- evidence: Plan DoD 11; .pi/sdlc/workflow.md:16-50 (the delta/dismissal/cap/trim rules already binding on this repo's panels); plan's own sequencing (Scope items 2, 7 are Implement-phase edits to references/prompts).
- impact: A DoD item in a list headlined "all falsifiable at merge" that no check can fail; at merge review nobody can distinguish "dividend observed" from "panels ran normally," so the item is decoration and DoD 11's inclusion falsely inflates the slice's verification story.
- fix: Replace DoD 11 with the checkable core: this slice's committed consolidated artifacts tag every row `NEW`/`REOPENED(<id>)` and record a disposition per row, per the workflow.md rules in force.

### Finding-id minting is unowned: `REOPENED(<prior-id>)` presupposes stable cross-round ids nobody is assigned to create

- severity: medium
- confidence: high
- location: Scope items 1, 2, 7
- defect: The glossary's record shape includes an `id`, prompts must tag `REOPENED(<prior-id>)`, and "every consolidated row is `NEW` or `REOPENED(<id>)`" — but no scope item states which step mints ids, their uniqueness scope (round, run, cross-session), or how an id relates to the "finding class" the existing binds-forward rule operates on.
- evidence: skills/sdlc/references/phase-pr-review.md:209-217 — the existing cross-session bar works by grepping prior `consolidated.md` for the same "finding class," not ids; the plan's Scope item 1 lists "id" in the record shape with no minting rule anywhere in items 1–11.
- impact: The load-bearing primitive of the whole delta mechanism is identity; without a minting/uniqueness decision the three prompts, §5 steps 3–4, and the pasted-at-dispatch table can each assume a different id scheme, and the reopen bar ("new evidence absent when the finding was dispositioned") is unadjudicable when ids don't resolve.
- fix: Add one plan sentence assigning id minting to the consolidation step with run-scoped uniqueness, and stating that the binds-forward class lookup keys on class, with id as the within-run handle.

### A permanent package test freezing this repo's consumer `workflow.md` content inverts the gate/process authority rule

- severity: medium
- confidence: high
- location: Scope item 9; DoD 6
- defect: Item 9 adds a corpus test asserting "`workflow.md`'s promoted rules are gone." `.pi/sdlc/workflow.md` is a consumer-integration surface whose *process* content is, by the skill's own law, locally owned — yet the package test suite would permanently forbid four classes of local process text, long after the one-time promotion proof has served its purpose.
- evidence: skills/sdlc/SKILL.md (gate/process conflict rule) — "*process* — everything else — resolves to the local rule"; skills/sdlc/references/system-reference.md §5 classes `.pi/sdlc/workflow.md` as `consumer-integration`; scope item 9 — "that `workflow.md`'s promoted rules are gone."
- impact: Any future local workflow experiment that textually resembles a promoted rule (e.g. a stricter local round cap while calibrating) fails the package suite; a migration assertion becomes a standing prohibition the skill's own authority model says the package must not own.
- fix: Make the promoted-rules-gone check a DoD-6 review assertion of this slice's diff (or a test deleted by the re-freeze follow-up), not a permanent corpus test.

### DoD 2's "does not restate a definition" is a judgement call inside an "all falsifiable at merge" list

- severity: low
- confidence: high
- location: Definition of done, items 2–3
- defect: DoD 2 forbids the four references restating glossary definitions while DoD 3 requires `phase-pr-review.md` §5 to "state" the dismissal-posture rule, tagging, and the reopen-adjacent machinery; the plan itself concedes the boundary is "a review judgement recorded in the Spec," so half of DoD 2 is not falsifiable at merge, and the term-vs-mechanic line it depends on is nowhere defined.
- evidence: Plan DoD header "all falsifiable at merge" vs DoD 2 "(duplication is a review judgement recorded in the Spec)"; DoD 3's list of rules §5 must "state."
- impact: The one DoD item guarding the plan's core architecture (D1's single-owner glossary) can neither pass nor fail mechanically; drift between glossary and references will be litigated finding-by-finding at Spec review instead of settled here.
- fix: Downgrade DoD 2's second clause to an explicitly review-judged item, or define the boundary (term definitions = the six groups' sentences; everything else is mechanics).

### Forward-amendment law is being filed under a frozen heading that means the opposite

- severity: low
- confidence: high
- location: Scope items 3–5 (§6 additions)
- defect: The amendment classes — governing *forward* changes to an already-approved artifact — are added under §6, whose heading is contract-frozen as "Refusal and backward-transition behaviour"; the nine-heading taxonomy leaves no room to rename or insert a section, so the content-heading mismatch is permanent.
- evidence: test/phase-references.test.js:20-30 — `"6 refusal/backward": /^## 6\. Refusal and backward-transition behaviour/m` among nine required anchors; plan scope item 4 — "§6 gains **'Amending an approved Spec'**."
- impact: An agent routed by heading (`SKILL.md`'s loading rule and the references' own IA) looking for amendment rules has no reason to open "Refusal and backward-transition behaviour"; the mismatch quietly degrades the comprehension surface S7 later has to fix.
- fix: Have the plan name the placement tension and either justify §6 (amendment as the third member of a "changing course" section) or route amendment law to §4/§8 where artifact shape lives.

### D4's round-3→round-4 change amends the ratified slate row but records it only as an amendment of #174 rec 1 — ratified-decision collision bookkeeping

- severity: low
- confidence: high
- location: Rationale D4 vs provenance
- defect: The owner-ratified S5 slate row and the R3-G7 candidate both say "round-3 churn diagnosis"; D4 moves the cap to round 4 and flags this only as a "deliberate amendment of rec 1" — unlike D7, which explicitly records its deviation "as a deliberate extension of R5's S5 row." The deviation from the *ratified slate text* is unrecorded. (Not a reopen demand: D4 is itself brainstorm-ratified; the defect is the provenance mislabel, in a plan whose subject matter is disposition provenance.)
- evidence: docs/briefs/2026-07-26-design-phase-r5-synthesis.md §3 S5 row — "round-3 churn diagnosis with bounded options"; docs/briefs/2026-07-26-design-phase-r3-spec.md:438 — "round-3 churn diagnosis"; plan D4 — "not #174 rec 1's round 3."
- impact: The slate is the authoritative upstream; a future reader diffing plan against slate finds an unflagged discrepancy on exactly the mechanism (churn cap) this slice exists to make auditable.
- fix: Add to D4 the same clause D7 carries: "recorded as a deliberate amendment of R5's S5 row (and R3-G7's candidate), keeping workflow.md's round-4 semantics."

CLEAR: F — track declared irreversible; correct, since the slice freezes a vocabulary S1 and later slices bind to and reopens three frozen prompt surfaces (test/frozen-surfaces.test.js:34-36) with the D9 re-freeze pattern.
CLEAR: PROPORTIONALITY — all new checks are offline grep-shaped tests matching corpus precedent (test/phase-references.test.js:4 "Offline grep; no model calls"); the panel-side additions (round-4 cap, delta scoping, trim-the-tail) bound review cost rather than ratchet it, and D5 keeps the mechanical checker (#174 rec 3) out.
