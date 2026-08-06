# Spec panel round 3 (trim-the-tail delta) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `442668d..0ef749a`. Sub-floor confirmation under the trim-the-tail rule.

### SPEC-R2 fix confirmations (round 2 → rev 3, delta 442668d..0ef749a)
- SPEC-R2-01 — fixed: C5.1 now mandates hoisting the line-471 regex and probing it with a split-token in-memory `execFileSync("fixture"` sample before the empty-set assertion; new DSP16 gates both halves and §10's C5 row traces it. Executed: `[...sample.matchAll(/execFileSync\("([^"]+)"/g)]` over the assembled sample reports `fixture`, and split-token assembly keeps the raw source clean, so the check is non-vacuous as specified.
- SPEC-R2-02 — fixed: C4.1 now reads "owns the C1-law scenarios DSP1-DSP3 and guard scenarios DSP4-DSP7", consistent with C4.5 ("DSP1-DSP3 … own the C1 law") and §10's guard row (DSP4-DSP7, DSP12); including DSP7 is correct since the exemption-equality scenario lives in the same file.
- SPEC-R2-03 — fixed: C4.2 branch 1 now says "call to or function declaration of", matching the normative `\bbase(?:Ref|File)\s*\(` pattern's actual reach (`function baseRef(` matches; arrow assignment is no longer claimed).
### C5.1's hoisted `/g` regex is shared mutable state with no statelessness requirement
- severity: low
- confidence: high
- origin: NEW
- location: §6 C5.1 (delta sentence "Hoist that regex to a local constant…"; gated by DSP16)
- defect: The delta orders the mutation probe to run on the hoisted constant *before* the real-source empty-set assertion, but the regex is a `/g` pattern whose `lastIndex` is mutated by `.test()`/`.exec()`, and C5.1 states no reset or stateless-API requirement. A natural implementation (`hoisted.test(sample)` then `source.matchAll(hoisted)`) leaves `lastIndex` dirty, and `matchAll` clones the dirty `lastIndex`, so the real-file scan starts mid-source.
- evidence: Executed at `0ef749a`: after `shared.test(sample)` → `lastIndex === 22`; then `[...'execFileSync("bash" ...'.matchAll(shared)]` returns `[]` despite a hit at offset 0. Current regex at `test/iteration-disposition.test.js:471` is `/execFileSync\("([^"]+)"/g`. The spec's own normative prototype (C4.2 `matches()`) resets `lastIndex = 0` after every `.test()`, showing this hazard class is a recognized project standard that C5.1 omits.
- impact: DSP16 can report "pass" (sample reported, real file empty) while the empty-set assertion silently skips the head of the file — the exact false-pass window DSP16 exists to close; practical exposure is small (first ~22 chars) but the contract is under-specified relative to the project's demonstrated discipline.
- fix: Add one clause to C5.1: probe and scan via `matchAll` on a fresh-state regex (or reset `lastIndex` after the sample probe), mirroring the C4.2 prototype's reset discipline.
CLEAR: A — Delta freezes no new shape; DSP16 adds a scenario row, changes no persisted schema or locked D1-D4 decision, and §10's amended C5 cell matches Plan DoD 4's own "each converted assertion proven non-vacuous" language (`docs/plans/2026-08-06-diff-scoped-test-premises.md:266`).
CLEAR: B — DSP16 gates both halves of the new C5.1 obligation with mechanical pass/fail columns; verified non-vacuous by execution; no delta outcome is left ungated.
CLEAR: D — C4.1, C4.5, §9, and §10 now agree on DSP1-DSP3 (C1 law) vs DSP4-DSP7 (guard); rev-header counts (1 medium, 2 low, 0 dismissed) match the consolidated round-2 record.
CLEAR: E — No framework misstatement in the delta: sample match, split-token non-self-reporting, and the regex's non-self-match (the literal `execFileSync\("` in source contains a backslash the pattern rejects) all verified by execution; `matchAll` clone semantics appear only as evidence for the C-class finding above.
CLEAR: F — Delta adds no NFR; DSP16 is local-file, in-memory work already covered by N1/N2's budget with §5's 0.06 s headroom.
CLEAR: G — "function declaration" and DSP16's claims now state exactly what the mechanisms do; no delta sentence over-claims.
CLEAR: H — No `CARRY-TO-SPEC` exists at the plan gate (plan rev 4 and plan-panel record contain none); §1's no-carry statement is unchanged and accurate.
