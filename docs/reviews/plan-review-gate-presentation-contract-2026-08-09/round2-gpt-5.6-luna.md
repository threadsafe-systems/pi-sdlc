### G4/G7 requirements are not included in enumerated contract-test coverage

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-09-gate-presentation-contract.md:78-113`
- defect: Rev 2 adds concrete G4 trigger/skip rules and G7 `none identified`/binding rules, but the enumerated contract-test directions omit both. The generic “§1 moves present” DoD does not identify falsifiable assertions for these additions.
- evidence: “named triggers ... make research-or-declare required only when a trigger fires” (`:83-87`) and “declare ‘none identified’ ... only when they actually bind” (`:87-90`), versus the listed test directions at `:107-113`, which contain neither G4 nor G7 semantics.
- impact: Spec/build can omit these newly added obligations while satisfying every explicitly listed contract-test direction.
- fix: Add G4 trigger/skip and G7 none-identified/binding cases to the semantic test-direction list and DoD assertions.

CLEAR: R1-01 — In-scope 4 makes the requirement doc-side and routes enforcement to existing attack surface D; out-of-scope explicitly freezes the prompt (`:103-118`).

CLEAR: R1-02 — In-scope 4 and DoD 2 explicitly require extending the §4 first-paragraph enumeration with the provenance block (`:96-98`, `:130-133`).

CLEAR: R1-03 — The standalone exception records live intent with an explicit “no upstream gate” declaration (`:98-102`).

CLEAR: R1-04 — G4 preserves proportionality, names triggers, and requires fired-but-skipped declaration (`:81-87`).

CLEAR: R1-05 — Map mode explicitly embeds the sketch in both modes while indexing only the decisions list and placing the full grammar in the ticket comment (`:91-95`).

CLEAR: R1-06 — The plan enumerates semantic contract-test directions and defers literal anchors to Spec (`:107-113`).

CLEAR: R1-07 — The ADR bar is preserved by reference to the Governance paragraph and is not to be restated in §8 (`:70-77`).

CLEAR: R1-08 — DoD 7 names the exact lifecycle command and requires committed Spec and Build artifacts (`:141-144`).

CLEAR: R1-09 — G7 is one prompt with the explicit `none identified` outcome and no Brainstorm-side binding (`:87-90`).

CLEAR: R1-10 — DoD 3-8 name the exact test, corpus, Biome, reference-check, lifecycle, and diff commands (`:134-148`).

CLEAR: R1-11 — The canonical suffix is explicitly ASCII `(-> ADR 00NN)` (`:37`).

CLEAR: DOGFOOD — This plan is explicitly ratified from a plain-mode Brainstorm and declares “this block is the store”; its sketch and decisions list are present, while the standalone exception is separately scoped to `sdlc:plan` (`:11-14`, `:23-24`, `:32-46`, `:96-102`).

CLEAR: A — DoD checks are observable commands or placement/content assertions; the finding concerns omitted coverage, not an uncheckable DoD item.

CLEAR: B — The objective’s provenance and downstream-panel outcomes have explicit document/test verification paths.

CLEAR: C — Plain/map and Brainstorm/standalone boundaries are explicitly separated.

CLEAR: D — The plan preserves the frozen prompt and references its existing locked-decisions surface.

CLEAR: E — S2, Spec anchor ownership, ADR Governance, and FS11 dependencies are named.

CLEAR: F — The plan selects the irreversible track for public contract-shape changes.

FINDINGS