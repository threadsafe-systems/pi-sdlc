All evidence verified. Producing the review.

### DoD item depends on a tracker board whose creation is out of scope and unowned

- severity: high
- confidence: high
- location: Plan → Definition of done (9th item); Risks and dependencies → "Tracker prerequisite"; Scope → Out
- defect: A Definition-of-Done item unconditionally requires "a dedicated epic and task projection on an appropriate configured ThreadSafe board," but the board does not exist, its creation is an org GitHub action that is not listed in In-scope work, and Out-of-scope only forbids reusing an unrelated board. The plan names the prerequisite as a risk ("Build publication is blocked until an appropriate board is created") yet writes the DoD as if it were self-contained, so the DoD is not reliably falsifiable: no test can satisfy it without an external artifact the plan does not own.
- evidence: DoD: "The approved Build for this feature creates a dedicated epic and task projection on an appropriate configured ThreadSafe board ... and pauses for human approval before Implement." Risk: "the organisation currently has no dedicated pi-sdlc board. Build publication is blocked until an appropriate board is created and recorded in config." This repo's own manifest has no tracker block at all (`.pi/sdlc/sdlc.config.json` — `grep tracker` returns nothing). The feature is self-referential: its own Build phase is the one that must publish, and it is gated on a board that must precede it.
- impact: The feature cannot reach its own DoD — and cannot pass its own Build gate — unless someone performs an out-of-scope org action; the plan provides no fallback DoD for the no-board case it also requires O6 to support.
- fix: Either move board creation into In-scope as an explicit task with an owner, or make this DoD item conditional ("if a board is configured") consistent with O6's no-tracker fallback.

### O5 hook observability and "durable repository state" conflict with ADR 0011 and leave the storage medium unspecified

- severity: medium
- confidence: high
- location: Plan → O5; Definition of done (7th item)
- defect: O5 demands that "hook receipts and ordering must be observable" and the DoD requires resuming "from durable repository state" that "correctly reports ... hooks," but ADR 0011 locks the decision that hooks have "NO mechanical runner and NO CI check that hooks fired; the audit trail is the announce-on-fire transcript" — i.e. the only record is the chat transcript, which O5 simultaneously says must not be the sole source. The plan neither flags this conflict with a locked decision nor names what durable artifact holds gate/hook state.
- evidence: `docs/adr/0011-hooks-surface.md:15-16` — "with NO mechanical runner and NO CI check that hooks fired; the audit trail is the announce-on-fire transcript." Plan O5 — "Gate evidence is durable enough to resume in a later session without reconstructing state from chat history alone ... their receipts and ordering must be observable." The DoD's "durable repository state" medium (new `.pi/sdlc/` state file vs re-derivation from `docs/reviews/`) is never specified.
- impact: Either the DoD is unmeetable under current locked behavior (hooks are not in durable repo state), or satisfying it silently re-opens ADR 0011 by introducing a durable hook record the ADR explicitly excludes — an irreversible new shape the plan fails to classify as a frozen surface.
- fix: State whether O5 re-opens ADR 0011 (and record the migration) or is satisfied by transcript-derived status only, and name the durable medium for gate/hook evidence.

### Programme-sized scope is deferred to the Specification rather than decomposed

- severity: medium
- confidence: high
- location: Plan → Objective / Scope / Risks ("Scope size")
- defect: The plan bundles ≥12 distinct features — adoption readiness tiers, reversible/irreversible contract repair, five new authoring templates, a new traceability checker, portable (non-TypeScript) validation, a lifecycle-status/resume command, hook observability, tracker/no-tracker fallback, author-model routing, panel-invariant policy reconciliation, broken-reference fixes, and path-override triage — across four frozen surfaces (FS1/FS2/FS5/FS7), and explicitly calls itself a "programme." It acknowledges the risk ("could become multiple loosely connected features") but delegates decomposition to the Specification rather than performing it.
- evidence: Plan Risks — "this touches several frozen surfaces and could become multiple loosely connected features. The Specification must organise it into coherent contracts ... but must preserve one traceable programme outcome." Track header — "Existing frozen surfaces FS1, FS2, FS5, and FS7 are affected."
- impact: A spec this broad risks incoherent or under-specified contracts and a Build that cannot slice cleanly; the plan stage is where decomposition belongs, and deferring it pushes the cost into spec review.
- fix: Split the plan into coordinated specs (e.g. contracts/templates, mechanical checkers, author-model routing, tracker behaviour) with an explicit ordering, or justify in-objective why one spec can hold all four frozen-surface amendments coherently.

### O7 defers its central invariant decision; its DoD is a placeholder and the author-preference frozen-surface home is unspecified

- severity: medium
- confidence: high
- location: Plan → O7; Definition of done (10th and 11th items)
- defect: O7 poses a dichotomy — "either the distinct-vendor floor and author-vendor exclusion are global law, or the skill states clearly which parts are configurable policy" — but picks neither, and the DoD inherits the gap: "Tests prove that review-panel configuration cannot violate whichever vendor/exclusion invariants the Specification declares global" is a placeholder no one can write a test against until the spec decides. Separately, O7 adds author preferences for five lifecycle phases (Brainstorm/Plan/Spec/Build/Implement) without saying whether they live in FS2 (whose phases are the four review-panel ids, not lifecycle author phases) or FS1, leaving an irreversible schema choice open.
- evidence: Plan O7 text and DoD "whichever ... the Specification declares global." The current code already makes the exclusion conditional, not global: `skills/sdlc/scripts/resolve-panel.mjs:111` — `const excludeAuthor = cfg.rules?.exclude_author_vendor !== false && minPanel >= 2;` (disabled for `task_validate`, min_panel 1). ADR 0002 freezes "exactly the four v1 phase keys" (`docs/adr/0002-models-schema-fs2.md`; `skills/sdlc/schema/sdlc.models.schema.json:26-27`), so five new author phase keys are a major schema change whose home the plan does not name.
- impact: The spec is forced to make two irreversible decisions (what is global law; which frozen surface holds author preferences) with no plan-level guidance, and one DoD item cannot be falsified until those decisions land.
- fix: State the direction O7 takes on global-vs-configurable invariants (the code already shows conditional), and name the frozen surface (FS1 vs FS2 vs new) for author-phase preferences so the spec classifies the amendment additively or breaking.

### Redefining `author_default` is likely a breaking change to FS2 but is left unclassified

- severity: medium
- confidence: medium
- location: Plan → O7 ("The meaning of `author_default` is made unambiguous or replaced")
- defect: O7 proposes making `author_default` "unambiguous or replaced," but the field is already part of frozen surface FS2 and its schema description overstates the code: the schema calls it "Fallback author (provider/model) when --author is omitted" while the resolver uses it only to derive the excluded vendor, never to select an author model. "Replacing" its meaning is therefore a breaking change to a frozen contract, yet the plan neither classifies it as breaking nor flags the existing schema/code divergence.
- evidence: `skills/sdlc/schema/sdlc.models.schema.json:11` — `"description": "Fallback author (provider/model) when --author is omitted."`; `skills/sdlc/scripts/resolve-panel.mjs:112` — `const authorSpec = author || cfg.author_default || "";` (used only for `authorVendor` at line 113, never dispatched). ADR 0002 consequences — "a new required field or a rename is a breaking (major) change."
- impact: An implementer could "clarify" `author_default` into an actually-dispatched author model, silently changing frozen FS2 semantics without a major-version bump.
- fix: Classify the `author_default` change as additive-vs-breaking explicitly, or narrow O7 to documenting the existing vendor-exclusion-only meaning without behavior change.

### "Walkthrough tests reach PR" versus "no live paid-model calls" tension is unresolved

- severity: low
- confidence: medium
- location: Plan → Definition of done (3rd and 14th items)
- defect: The DoD requires both that "Reversible and irreversible lifecycle walkthrough tests reach PR" and that "The full automated suite and lint pass with no live paid-model calls," but a walkthrough that genuinely reaches PR would invoke paid panels; the plan never states that walkthroughs are fixture/simulation-based, leaving the boundary for the implementer to guess.
- evidence: DoD 3 — "Reversible and irreversible lifecycle walkthrough tests reach PR with no missing or contradictory required input." DoD 14 — "The full automated suite and lint pass with no live paid-model calls."
- impact: An implementer may either ship tests that burn paid calls (violating DoD 14) or simulate so thinly that "reach PR" is not meaningfully exercised.
- fix: Add one line stating walkthroughs run against fixtures/mocks with no network, defining what "reach PR" proves in that mode.

CLEAR: F — the plan correctly self-classifies as **irreversible**; it amends frozen surfaces FS1/FS2/FS5/FS7 (public contracts consumers bind to), which is exactly the irreversible trigger, and claims no reversible fast path.
