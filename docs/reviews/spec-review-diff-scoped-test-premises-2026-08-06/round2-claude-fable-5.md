# Spec panel round 2 (delta) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `1c8a706..442668d`.

### SPEC-R1 fix confirmations (round 1 → rev 2)

- SPEC-R1-01 — fixed: C5.1 now couples import/helper removal with IDV17 `["git"]→[]` and the header amendment; verified against `test/iteration-disposition.test.js:7,21-31,471-472` (regex at :471, `["git"]` equality at :472, "shells out to local git" header at :3-4).
- SPEC-R1-02 — fixed: C4.1/C4.5 name `test/diff-scoped-premises.test.js` as the single home of guard + DSP1-DSP6; N2/DSP12 name the same path.
- SPEC-R1-03 — fixed: C5.2's `line.slice(3)` projection verified — I executed the strip against `skills/sdlc/references/system-reference.md:10-370`; all 14 headings equal the spec's literal array exactly (em-dash, `&`, parentheticals included), and §15 exists so the retained ≤14 filter is load-bearing and named by "§1-§14".
- SPEC-R1-04 — fixed: I extracted rev 2's fenced prototype byte-for-byte and executed it at `442668d`: `swept: 60`, exactly the three §5 hits with identical reasons. Stress probes: `execFileSync("git", args); log("merge-base")` → no match; `spawnSync("git", argv, opts)` + later `"main"` → no match; all three literal-argv positives match; `rev-parse HEAD` and `init -b main` negatives do not.
- SPEC-R1-05 — fixed: C4.1 and DSP7 now require exact key-set equality with stale-exemption failure named in the fail column.
- SPEC-R1-06 — fixed: DSP14 says "§7/C1-linked", matching §7's ownership.
- SPEC-R1-07 — fixed as adjudicated (but the new wording over-claims; see NEW finding below).
- SPEC-R1-08 — fixed: N2/DSP12 name the command (`node --test test/diff-scoped-premises.test.js`), the sub-second bar, and the review-time (not in-suite) observer.

### IDV17's revised empty-set assertion has no non-vacuity gate

- severity: medium
- confidence: high
- origin: NEW
- location: §6 C5.1 and §9 (no DSP row gates the IDV17 amendment beyond DSP15 suite-greenness)
- defect: Rev 2 flips IDV17's only positive assertion (`["git"]` — self-proving, since the regex demonstrably matched) into a negative empty-set assertion (`[]`), and specifies no non-vacuity check. A rotted or mistyped source-inventory regex at `iteration-disposition.test.js:471` would satisfy `deepEqual([], [])` forever, silently disabling the file's subprocess-reintroduction guard.
- evidence: C5.1: "Amend IDV17's source-inventory expectation from `["git"]` to `[]` … The source-inspection regex at today's line 471 remains useful data for proving the empty set." `test/iteration-disposition.test.js:471-472` confirms the regex and equality. §9 maps C5 only to DSP8-DSP11 (IDV3/IDV14/IDV15/IDV16); no scenario exercises the amended IDV17. Contrast the spec's own discipline elsewhere: DSP3, DSP5, DSP9 and C5.3 all mandate mutation-based non-vacuity, and DSP5's fail column treats "any pattern branch is vacuous" as failure.
- impact: The revised empty-set contract — the exact mechanism claimed to prove "the scenario corpus uses no subprocess" — cannot be falsified against regex rot; the spec's honesty claim in the amended assertion message ("the scenario corpus uses no subprocess") rests on an ungated matcher.
- fix: Add one sentence to C5.1 requiring an in-memory split-token `execFileSync("x"` sample to prove the line-471 regex still reports, mirroring DSP5's pattern.

### C4.1 mislabels DSP4-DSP6 as "standing C1-law scenarios"

- severity: low
- confidence: high
- origin: NEW
- location: §4 C4.1, first sentence (delta text)
- defect: C4.1 says the file "owns both the guard and the standing C1-law scenarios DSP1-DSP6", but per C4.5 and §9 only DSP1-DSP3 own the C1 law; DSP4-DSP6 are detector/sweep scenarios. Internal inconsistency introduced by the rev-2 fix for SPEC-R1-02.
- evidence: C4.1: "owns both the guard and the standing C1-law scenarios DSP1-DSP6"; C4.5: "DSP1-DSP3 in that same file own the C1 law and mutation checks"; §9 DSP4-DSP6 rows gate enumeration/non-vacuity/self-scan, not C1.
- impact: An implementer reading C4.1 alone could bind DSP4-DSP6 test titles or grouping to the C1 law, conflicting with C4.5's structure and DSP1's "duplicated elsewhere" fail condition audits.
- fix: Reword to "owns both the guard scenarios DSP4-DSP6 and the C1-law scenarios DSP1-DSP3".

### C4.2's "declaration of" over-claims what the helper regex matches

- severity: low
- confidence: high
- origin: NEW
- location: §4 C4.2 branch 1 (delta text from the SPEC-R1-07 fix)
- defect: The new prose "a call to or declaration of a helper named `baseRef` or `baseFile`" claims all declarations are reported, but the normative `helperPattern` (`\bbase(?:Ref|File)\s*\(`) matches only `function baseRef(`-style declarations; arrow/assignment declarations escape. C4.3's narrowness list does not disclose this false-negative class.
- evidence: Executed probe against the extracted rev-2 patterns: `function baseRef() {…}` → `["base helper"]`; `const baseRef = () => 1;` → `[]`. C4.3 lists only dynamic assembly, same-function variables, and cross-module helpers as intentional false negatives.
- impact: A prose-over-mechanism claim in the normative pattern-set section; an auditor relying on C4.2 would wrongly expect an arrow-declared (uncalled) helper to be reported. (Any *use* still matches at the call site, so practical reach is unchanged.)
- fix: Say "function-declaration of" or add arrow-style declarations to C4.3's intentional false negatives.

CLEAR: A — Frozen shapes match locked decisions D1-D4 field-by-field (plan `docs/plans/…:227-230,238`): law in `phase-spec.md` §4 exists at `:44`, pointer target `phase-implement.md` §4 at `:43`; the `FROZEN` list (`test/frozen-surfaces.test.js:26-44`) contains none of the files C1-C3/C5 touch, so N5/DSP15 hold.
CLEAR: E — Framework behaviour verified by execution at the pinned tree: prototype runs on stock Node (`swept: 60`, 3 hits identical to §5), regex `lastIndex` resets are correct, prototype self-scan reports `[]`, `find test` confirms 74 files/60 matching extensions, and `node --test <file>` is valid Node test-runner invocation.
CLEAR: F — N1-N5 each name a gating scenario; the rev-2 N2 meter now has a command, threshold, and observer, with §5's 0.06 s execution as headroom evidence.
CLEAR: H — No `CARRY-TO-SPEC` was minted at the plan gate (plan rev 4 and the plan-panel record contain none); §1's no-carry statement and the §7 handoff-as-deliverable framing are accurate.
