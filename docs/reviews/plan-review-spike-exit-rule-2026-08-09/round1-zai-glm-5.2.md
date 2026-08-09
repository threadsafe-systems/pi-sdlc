Confirmed: the GPC contract (#240) was merged immediately before this plan; `phase-brainstorm.md` is governed by GPC contract tests (positive anchor matches) but is NOT in the ASD19 byte-identical FROZEN array; and C8 (no-governed-text-restatement) is enforced only inside `gate-presentation-contract.test.js`. Writing findings now.

### §8 spike block touches a just-frozen GPC contract surface without an amendment classification

- severity: medium
- confidence: high
- origin: NEW
- location: In scope §1; Definition of done §9; "Context for the next agent"
- defect: The plan places the spike-routing block inside `phase-brainstorm.md` §8, which is now the GPC-governed gate-presentation contract surface (frozen at #240, merged immediately before this plan at `2bd390e`), but never classifies the addition as amending versus alongside that contract, and never justifies §8 over §1 (where the sibling G4 research-or-declare move lives and which is not a contract surface).
- evidence: In scope §1: "`phase-brainstorm.md` §8: a compact spike-routing block after the existing gate-presentation grammar." GPC spec `docs/specs/2026-08-09-gate-presentation-contract.md` GPC1 When–Then pins "exactly one §8 block titled **The gate presentation**" and its Falsifier enumerates §8-content violations: "§8 requiring a third artifact or a prose recap block." The `sectionOf(brainstorm, 8)` helper in `test/gate-presentation-contract.test.js` runs every GPC §8 assertion against the *entire* §8, so the spike block is inside the contract's extraction window. DoD §9 only asserts "the existing gate-presentation contract corpus remains green" — a test-pass guard, not a boundary. The "Context for the next agent" says "subordinate to the existing two-artifact gate presentation" but states subordination, not non-amendment.
- impact: A future editor can read the spike block as part of the gate-presentation contract (the section is one extracted unit), so a wording drift in the spike block could be treated as a GPC amendment without the backward-transition/unfreeze discipline GPC's own amendment classes require. It also freezes a placement choice that §1 would have avoided without touching any contract surface.
- fix: State explicitly in scope §1 or an assumption that the spike block is a non-amending addition (a distinct titled block within §8, outside GPC C1's invariants), name the specific GPC invariants it must preserve, and justify §8 over §1 (sibling to G4) rather than asserting subordination alone.

### Two contract-test files will assert anchors in the same §8 surface with no stated division of labor and no C8 enforcement on the new file

- severity: low
- confidence: medium
- origin: NEW
- location: In scope §7; Definition of done §5
- defect: The plan creates `test/spike-exit-rule.test.js` asserting anchors in `phase-brainstorm.md` §8 alongside the existing `test/gate-presentation-contract.test.js`, which already extracts the same §8 and whose header states "Later tasks append their section's assertions to this one file"; the plan gives no division of labor, and the no-governed-restatement bound (C8) is mechanically enforced only for the GPC file.
- evidence: `test/gate-presentation-contract.test.js` header: "Contract tests assert anchors in the governed docs ... Later tasks append their section's assertions to this one file." The C8 self-check (80-char window against the three governed docs) exists only in that file (GPC10); no other test enforces it across new files. Scope §7 describes the new file as asserting "semantic anchors" over "the governed §8 prose."
- impact: Any §8 edit thereafter requires coordinated updates to two files, and the new file's C8 compliance rests on review vigilance, not a failing check — the same hand-copied-pointer-drift class the plan warns about elsewhere.
- fix: Either state that the spike test owns only the spike block's anchors (and GPC owns the gate-presentation block's), or append the spike anchors to the existing GPC file; in either case name the ownership boundary.

### "Preserves the six-phase topology" and "introduces no telemetry or storage schema" are true-by-construction DoD claims with no named falsifier

- severity: low
- confidence: medium
- origin: NEW
- location: Definition of done §1 and §4; In scope §7
- defect: DoD §1 ("preserves ... the six-phase topology") and §4 ("introduces no telemetry or storage schema") are negative claims that hold only because the plan does not touch SKILL.md's phase sequence or the telemetry schemas; they are framed as completion checks but no proposed test (scope §7's `spike-exit-rule.test.js`) owns either assertion.
- evidence: The six-phase count is pinned only in `test/phase-references.test.js:15` (`SLUGS = ["brainstorm","plan","spec","tasks","implement","pr-review"]`) and SKILL.md, neither of which the plan edits; FS13 telemetry lives in `skills/sdlc/...` files the plan does not touch. Scope §7 lists the test's anchors but not a topology or telemetry negative-assertion.
- impact: A later implementer could add a telemetry hook or a phase-shaped heading without tripping any DoD item, because the claims are structural rather than asserted.
- fix: Add one falsifiable anchor to scope §7 (e.g. assert the spike block names itself "not a ... lifecycle phase" and contains no FS13 event/`docs/spikes/` path), or restate these two DoD clauses as structural guarantees ("no edit to SKILL.md or telemetry files") rather than verifiable checks.

### "Provisional candidate deliverable" treatment retains spike code with no defined home; the build-phase risk is deferred, not named

- severity: low
- confidence: medium
- origin: NEW
- location: In scope §4; Out of scope; Assumptions §5
- defect: The four-way artifact treatment includes a provisional `candidate deliverable` that retains spike code, but the plan rejects any mandatory directory and parks cleanup/promotion to a follow-up, so retained provisional code has no defined storage location and the risk that it is mistaken for reviewable committed code is deferred rather than named as a spike-time dependency.
- evidence: In scope §4: "provisional `foundation` | provisional `candidate deliverable` ... remains provisional until downstream contracts are satisfied." Rejected decision: "new spike telemetry events or a mandatory `docs/spikes/` hierarchy." Assumption §5: "A retained spike artifact may be useful only during implementation; its cleanup/promotion policy is a separate cross-phase change rather than hidden scope in S4."
- impact: During build, a provisional candidate deliverable with no home is ambiguous as reviewable code; the plan's "not acceptance of downstream requirements" guard is guidance-level, not a storage or lifecycle rule.
- fix: Add one assumption naming this as a deferred dependency (retained provisional code has no home until the parked follow-up lands) so the spec explicitly scopes it out rather than leaving it implicit.

CLEAR: B — every objective outcome (four-way routing, human checkpoint, direction/treatment independence, stop/revise/proceed topology, no gate bypass) has a verification path through §8 string anchors, matching the repo's guidance-as-falsifiable-anchors model.
CLEAR: C — scope is one §8 prose block plus one contract-test file (a single spec's worth); in-scope and out-of-scope are mutually consistent and align with the locked Brainstorm decisions/rejections.
CLEAR: D — no contradiction with locked decisions; the Brainstorm gate's rejection of a universal timebox and mandatory throwaway supersedes R1-G6/R5-S4 and is explicitly flagged ("the Brainstorm gate supersedes their mandatory timebox and throwaway claims"); DoD §8's FS11 no-new-row claim is correct (`phase-brainstorm.md` is already inventoried as `reference.phase-brainstorm`, assertion `# Phase reference: Brainstorm`).
CLEAR: F — the irreversible track is correct: the change edits a public reference (`phase-brainstorm.md`, an FS11 `package-public` target) and adds a contract test, freezing a greppable contract shape that adopting consumers depend on.
CLEAR: PROPORTIONALITY — every proposed check carries a budget matching repo precedent (`#177`: 30s full-suite ceiling, 1s single-file; `biome`/`check-references`/`check-lifecycle` are sub-second offline), and the DoD machinery is the standard irreversible-track set, not disproportionate to a one-block-plus-one-test change.
