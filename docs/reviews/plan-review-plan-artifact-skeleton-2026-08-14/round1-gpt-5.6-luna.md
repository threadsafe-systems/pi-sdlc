### Prompt change omits the stamped-agent golden

- severity: high
- confidence: high
- origin: NEW
- location: Plan Scope/In item 3 and item 7 (lines 75-79), Definition of done item 7 (line 109)
- defect: The plan requires changing `adversary-plan.prompt.md` but does not include or permit regenerating `test/fixtures/golden/plan_review.agent.md`. The existing extraction test compares each stamped agent body to that golden, so the required prompt anchors necessarily make `npm test` fail unless an unplanned golden change is made.
- evidence: `test/extraction.test.js:133-142` runs all `PHASES` and asserts the stamped body equals `test/fixtures/golden/${phase}.agent.md`; the plan's change list at `:75-79` names the prompt and contract tests but no golden, while `:109` requires the full corpus to pass.
- impact: The stated DoD is unreachable within the declared scope, or an implementer must silently broaden the diff; the package's consumer-facing stamped Plan reviewer remains stale if the golden is not updated.
- fix: Add `test/fixtures/golden/plan_review.agent.md` to the permitted change classes and require deterministic regeneration plus the existing extraction test.

### Frozen-list narrowing is not mechanically guarded

- severity: high
- confidence: high
- origin: NEW
- location: Plan Scope/In items 4-5 and 7 (lines 76-79), Definition of done item 5 (line 107)
- defect: The plan claims that only `adversary-plan.prompt.md` is deliberately removed from the frozen set, but its new contract-test requirements do not pin the `FROZEN` membership/order or the minimal IDV19 exemption. `ASD19` diffs only the paths currently in `FROZEN`, so deleting another entry can leave the suite green; after the planned exemption, IDV19 does not catch non-prompt removals either.
- evidence: `test/frozen-surfaces.test.js:15-49` builds the list and diffs only `...FROZEN`; `test/iteration-disposition.test.js:491-499` only checks adversary-prompt membership. The plan's contract-test inventory at `:79` mentions only §4, skeleton, and prompt anchors, despite DoD `:107` promising only one deliberate unfreeze.
- impact: A protected script, schema, or prompt can silently stop being protected during the unfreeze window, contradicting the irreversible-surface claim and allowing an accidental contract change to merge.
- fix: Require a temporary contract assertion for the exact post-unfreeze `FROZEN` list and the one-loop IDV19 exemption, and specify removal/restoration of those window-scoped assertions in the post-merge re-freeze.

### Existing gate contract says the prompt stays untouched

- severity: high
- confidence: high
- origin: NEW
- location: Brainstorm provenance decision (line 30) and Scope/In item 3 (line 75)
- defect: The plan deliberately edits and unfreezes a prompt that the already-shipped provenance contract explicitly calls frozen and untouched, but it does not identify this as a declared supersession/deviation or update the governing contract's wording. The provenance block's new `decision:` line is not enough to explain which existing locked rule is being overridden while the Plan remains in draft and owner approval is pending.
- evidence: `skills/sdlc/references/phase-plan.md:47-50` says enforcement routes to the frozen prompt and “the prompt itself stays untouched”; `test/gate-presentation-contract.test.js:306-310` pins that phrase; the S3 plan still marks editing the prompt out of scope at `docs/plans/2026-08-09-gate-presentation-contract.md:133-136`; this plan requires the edit at `:30` and `:75`.
- impact: The slice can pass stale provenance-contract tests while violating a settled public decision, leaving future authors unable to tell whether the prompt-freeze law still applies or has a narrowly scoped exception.
- fix: Record an explicit owner-ratified deviation/supersession of the GPC prompt-freeze decision and update the governed §4/test wording to preserve D while permitting only these skeleton-awareness anchors.

### Objective claims an unverified timing/cost outcome

- severity: medium
- confidence: high
- origin: NEW
- location: Objective (line 38) and Assumptions item 3 (line 97)
- defect: The objective claims a deficient Plan will become incomplete “at authoring time instead of at panel cost,” but the plan supplies no baseline, target, observation window, or evidence owner for that outcome and explicitly says its tests do not show any Plan satisfies the rules. The listed contract tests only prove that guidance and anchors exist.
- evidence: The objective's timing/cost claim is at `:38`; the contract-test scope at `:79` is static guidance presence, and Assumption `:97` says tests prove only guidance/anchors, “not that any given Plan satisfies them.”
- impact: A spec can satisfy every listed test while the author/reviewer asymmetry and panel cost remain unchanged; the headline outcome is therefore not falsifiable from this plan.
- fix: Either provide a bounded representative deficient-Plan verification/inspection scenario with an evidence owner and target, or recast the objective as the structural deliverables the tests actually establish.

### NFR applicability reason is dropped from the binding rule

- severity: medium
- confidence: high
- origin: NEW
- location: Scope/In item 1 (line 65) versus binding rule 4 (line 73)
- defect: The skeleton is required to carry `applicability + reason`, but the §4 binding law requires only “applicability” (and adds a technical reason only for `n/a`). Thus an applicable row with a bare `yes` is accepted by the gate while violating the skeleton shape and R2-G4's auditability goal.
- evidence: Plan `:65` specifies columns `{applicability + reason, target, binding phase, verification}`; Plan `:73` says every row carries “applicability, target, binding phase, and verification, or `n/a` with a technical reason”; R2's authority requires “applicability reason” for every row at `docs/briefs/2026-07-26-design-phase-r2-plan.md:40`.
- impact: The required discovery rationale can silently disappear, making applicability classifications non-auditable and weakening the very NFR omission gap this slice claims to close.
- fix: Change binding rule 4 to require `applicability + reason` for every row, with a technical reason also required for `n/a`.

### Pre-mortem zero-state exception is lost in §4

- severity: medium
- confidence: high
- origin: NEW
- location: Scope/In item 1 and binding rule 5 (lines 66 and 74)
- defect: The skeleton limits a zero-state pre-mortem to “small reversible work,” but the binding rule permits any Plan to declare the zero state and does not require that justification. This Plan itself is explicitly irreversible, so the gate law can admit exactly the high-risk artifact R2-G5 says must have a risk row.
- evidence: Plan `:5` declares `Track: irreversible`; `:66` says only small reversible work may declare zero state; `:74` broadens the rule to any pre-mortem block that declares zero state. R2-G5's done-means at `docs/briefs/2026-07-26-design-phase-r2-plan.md:19` requires a row for irreversible/cross-component Plans and reserves the exemption for small reversible work.
- impact: An irreversible or cross-component Plan can omit trigger, consequence, mitigation, owner, and destination while passing the stated binding rule, leaving risk review unauditable.
- fix: Qualify the rule's zero-state branch with the small/reversible criterion and require the Plan to state the size/reversibility justification.

### Gate-check budgets are incomplete

- severity: medium
- confidence: high
- origin: NEW
- location: Scope/In item 7 (line 79) and Definition of done item 7 (line 109)
- defect: Only the new contract test has a `< 1 s` budget; the required `biome check`, `check-references.mjs`, and lifecycle checks have no time/cost budget. The proportionality requirement therefore cannot verify that all CI/gate machinery remains bounded.
- evidence: Plan `:79` budgets only “contract tests < 1 s”; `:109` requires `biome check`, reference, and lifecycle checks without limits. The repository's comparable plan explicitly budgets these checks individually at `docs/plans/2026-08-09-spike-exit-rule.md:165-172`.
- impact: A stricter or unexpectedly expensive check can ratchet CI/gate cost without violating this DoD, making the new verification burden unbounded relative to the small prose slice.
- fix: Add plausible external budgets (and the command scope) for Biome, reference checking, and lifecycle checking, or remove any check that is not intended as a gate.

CLEAR: F — the plan correctly classifies the public authoring-shape freeze as irreversible.
