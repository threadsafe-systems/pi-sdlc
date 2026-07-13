### Scope spans a whole release programme, not one spec's worth of work

- severity: high
- confidence: high
- location: Objective + O1–O8; Scope/In; Definition of done (16 items)
- defect: The plan bundles eight independent outcomes across at least four frozen surfaces (FS1, FS2, FS5, FS7) — schema changes, five new authoring templates, a traceability checker, a portable validator, a lifecycle-status surface, author-model routing, panel-invariant reconciliation, tracker bootstrap, and reference fixes — into a single Plan→Spec→Build cycle, then defers the decomposition decision to Spec.
- evidence: DoD lists 16 falsifiable-but-distinct deliverables; the plan itself conceds "this touches several frozen surfaces and could become multiple loosely connected features" (Risks → Scope size). The framework's decomposition mechanism (Build epic+sub-issues, SKILL.md:150–190) slices *tasks within one feature*, not multiple frozen-surface contract changes.
- impact: One spec panel cannot coherently adjudicate contracts for FS1/FS2 schema, a new checker CLI, and tracker infra at once; a single PR carrying all eight freezes several unrelated shapes simultaneously, and any one blocking finding stalls the entire programme.
- fix: Split into a small ordered set of plans (e.g. references/honesty fixes; author-model+panel-invariant; traceability+validator; lifecycle-status+durable-state; tracker bootstrap), each its own spec cycle.

### DoD gates merge on an external, unowned prerequisite (board + gh scopes)

- severity: high
- confidence: high
- location: DoD item 9; Scope/Out ("Reusing an unrelated organisation project board"); Risks ("Tracker prerequisite", "GitHub permissions")
- defect: A merge-blocking DoD item requires "the approved Build for this feature creates a dedicated epic and task projection on an appropriate configured ThreadSafe board", yet the plan states no such board exists and its creation needs `gh` scopes that "must be verified after mutation" — and creating (vs. recording) that board is not enumerated in scope.
- evidence: DoD: "creates a dedicated epic and task projection on an appropriate configured ThreadSafe board … pauses for human approval before Implement"; Risks: "the organisation currently has no dedicated pi-sdlc board. Build publication is blocked until an appropriate board is created and recorded in config"; In-scope only lists "this repository's tracker configuration" (recording), not board provisioning.
- impact: If the board or permissions cannot be provisioned, the feature can never reach done; a documentation/checker programme is made hostage to org infrastructure it does not own, and the falsifiable check depends on out-of-band state.
- fix: Move board provisioning to an explicit named prerequisite step with an owner, or make the tracker projection a no-tracker-fallback-acceptable DoD item rather than a hard board requirement.

### O5 requires durable resumable state the current prose-law architecture has no place to store

- severity: medium
- confidence: high
- location: O5; DoD item 7; Track ("Existing frozen surfaces FS1, FS2, FS5, and FS7 are affected")
- defect: O5/DoD7 require lifecycle status to "resume from durable repository state … without reconstructing state from chat history alone," but the framework is explicitly prose-law with no mechanical state store, so a new persisted receipt/state artifact (a freezable shape) is implied yet never named among the affected frozen surfaces.
- evidence: ADR 0011: "NO mechanical runner and NO CI check that hooks fired; the audit trail is the announce-on-fire transcript"; SKILL.md hooks section stores receipts only in the transcript; the plan's affected-surface list is FS1/FS2/FS5/FS7 with no new state surface enumerated.
- impact: An irreversible persisted shape (state/receipt file schema) would be frozen during implementation without design or classification, exactly the "irreversible shape that should force the irreversible track" the plan is supposed to pre-classify.
- fix: Name the durable lifecycle-state/receipt artifact (location + shape) as an explicit new surface the Spec must classify, or scope O5 down to observability of existing committed docs.

### O1's documentation-honesty outcome has no falsifiable DoD; a residual false CI claim would pass

- severity: medium
- confidence: medium
- location: O1 ("documentation must not claim that CI, templates, tracker facilities, or panels exist unless … verified"); Definition of done
- defect: The central honesty outcome — don't claim unverified facilities — has no corresponding DoD item, so the skill could ship still asserting a CI facility that does not exist and every DoD check would still pass.
- evidence: SKILL.md:60 "CI checks the declared track's artifacts are committed" and SKILL.md:201 "the CI presence-check keeps reading committed docs" both assert a CI check that `.github/workflows/ci.yml` does not implement (it runs only `npm test` and `npm run lint`); no DoD item falsifies a lingering false CI/template/panel claim, and `.github/workflows/` is absent from In-scope.
- impact: The plan's most important corrective outcome is unobservable — the defect it exists to fix could survive undetected because nothing checks documentation-to-reality honesty.
- fix: Add a DoD item that fails if any doc claims a CI/template/tracker/panel facility not present or not verified by a readiness check.

### DoD 10 validates against a rule the plan lets the Spec define either way

- severity: medium
- confidence: medium
- location: O7; DoD item 10 ("cannot violate whichever vendor/exclusion invariants the Specification declares global")
- defect: The plan authorises demoting the currently-enforced two-distinct-vendor / author-exclusion floor to "configurable policy" as an acceptable outcome, and phrases its DoD against "whichever … the Specification declares global," so the DoD cannot fail regardless of which way an enforced invariant is weakened.
- evidence: resolve-panel enforcement is stated as law in SKILL.md:223 ("at least two distinct vendors … excludes the author's vendor"); O7 permits "the skill states clearly which parts are configurable policy," i.e. weakening it; DoD 10's outcome is unconstrained by the plan.
- impact: A real enforcement rule can be quietly weakened without the owner adjudicating that as a decision, and the DoD gives false assurance because it self-satisfies for either choice.
- fix: Have the Plan (not the Spec) decide whether the two-vendor floor is iron law or policy, flag any weakening as an owner decision, and pin DoD 10 to that fixed rule.

CLEAR: F — the plan correctly self-classifies as irreversible and states the Spec must classify each frozen-surface amendment as additive or breaking before implementation.
