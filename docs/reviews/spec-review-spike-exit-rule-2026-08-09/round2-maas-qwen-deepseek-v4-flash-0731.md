## Panel status note

Round-2 delta review (commit range `ecd5c47..b8ad46c`). All nine round-1 dispositions re-verified against the amended rev-2 spec and the live tree; each is confirmed fixed: SPEC-R1-01 (C2/C3/SER6 now require "adequately met" current criteria before any direction or Plan transition), R1-02 (C5/SER1 add durable exact-set discovery — verified the tree has exactly six `references/phase-*.md` and six `templates/sdlc-*.md`), R1-03 (SER12 adds `check-lifecycle.sh --track irreversible --slug spike-exit-rule`; flags verified in `check-lifecycle.mjs:90-95`), R1-04 (SER13/14 bind to a committed consolidated record naming SHA/inventory/issue), R1-05 (literal `### Spike exit loop` boundary pinned in C1/C5), R1-06 (#147 named in C1/F1), R1-07 (single mermaid fence + literal `The next transition is **Plan**`; verified `phase-brainstorm.md:133,161` and GPC1/GPC17), R1-08 (`delivery-grade`/`human checkpoint` in Vocabulary), R1-09 (SER3 falsifier now routes empirically-answerable non-delivery-grade questions to spike).

### #147 read-tier naming has no mechanical scenario — inspection-only gate on a locked decision

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md` F1 (line 153), C1 Postconditions (line 45), SER13 (lines 315/320)
- defect: The #147 read-tier naming requirement (a locked plan decision, round-1 SPEC-R1-06) is bound only to SER13, an `inspection` scenario decided by the PR panel. No mechanical scenario asserts the `#147` anchor in the spike block, so a regression that silently drops the naming passes all CI and is caught only at the last gate.
- evidence: F1 binds "name #147 …" to `C1, SER2, SER3, SER13`. SER2 (route order) and SER3 (route boundaries) are the mechanical gates on F1 and never mention #147; grep shows `147` appears only in C1 postcondition, F1, and SER13. The same spec (C5/SER2) already adds offline anchor greps over the extracted spike block, so a `#147` anchor check is the established, trivial pattern in this file.
- impact: A locked, durable decision becomes CI-invisible; an editor removing the #147 sentence from the read route would ship green through `npm test` and only the PR panel verdict would catch it — inconsistent with the spec's own altitude for the other four route anchors.
- fix: Add "the read route names #147 as future read-tier mechanisation outside S4" to SER2's When–Then (and its falsify) so the naming is mechanically asserted in the same spike-block anchor test.

### C1 spike-block boundary is a `####`-sub-heading trap

- severity: medium
- confidence: medium
- origin: NEW
- location: `docs/specs/2026-08-09-spike-exit-rule.md` C1 Signature/shape (line 33) and C5 Signature/shape (line 97)
- defect: The block boundary is "extends … to the next level-three-or-higher heading," and C5 "extracts the literal `### Spike exit loop` block only." Because "level-three-or-higher" means depth ≥ 3, any `####` (or `#####`) sub-heading the implementer naturally writes inside the spike guide (`#### Route 1: read`, etc.) terminates the block early, silently truncating the SER2/SER3/SER4-anchor assertions to the first route.
- evidence: `phase-brainstorm.md` §8 currently has no `###`/`####` sub-headings (only `## 8.`/`## 9.`), so the boundary phrase introduces an unstated constraint that the spike guide must be a single flat body with no sub-headings at all. The spec never forbids sub-headings within the block, so an implementer is not warned that structurally grouping the four routes breaks extraction.
- impact: An implementer guessing at the boundary produces a spurious SER2/SER3 failure (or, if the test is tuned to pass by accident, a truncated block that no longer owns the full guide); the literal contract is under-determined.
- fix: State explicitly that the block is a single flat body containing no level-3-or-deeper sub-heading, or redefine the boundary as "the next heading of level 2 or shallower."

CLEAR: A — the exact-set (six phase refs, six routers), two-artifact, three-line-kind, one-mermaid, literal-Plan-anchor shapes are verified against the live tree and match the locked plan decisions; no missing/over-committing field found.
CLEAR: B — all 14 scenarios carry exactly one kind label (12 mechanical / 1 inspection / 1 carried, 86% readable), each has the three-part Given/When–Then/Falsify form, and none is vacuous; SER13/SER14 name their decision/destination points per the skeleton.
CLEAR: C — every contract has a populated Contracts block; C1/C2/C3/C4/C5 all carry gated-by scenarios; the only under-specification found is the C1 boundary reported above.
CLEAR: D — no internal contradiction found; spec route order (read→Plan→judgment→spike) matches the plan's authoritative in-scope prose (item 2), and C2/C3/SER6/SER7 direction/Plan-transition semantics are mutually consistent.
CLEAR: E — `check-lifecycle.sh --track irreversible --slug spike-exit-rule` flags verified in `check-lifecycle.mjs:90-95`; `node skills/sdlc/scripts/check-references.mjs` runs exit 0 (verified); `npm test`/`biome` scripts exist in `package.json`; the §8 block composes with the existing `sectionOf`/GPC assertions without breaking them.
CLEAR: F — all five NFRs have a response measure and a binding scenario id; the performance response measure predates this delta and is unchanged.
CLEAR: G — no overclaiming found in the delta; SER1/SER12 claims were verified against the actual test file and scripts.
CLEAR: H — no inbound `CARRY-TO-SPEC` exists (verified plan and plan-review records mint none); the plan's parked ephemeral-evidence follow-up lands as SER14 (carried → pr_review), the carry landing is complete.
