# Plan panel round 2 (delta) — claude-fable-5

Model: `claude-fable-5`. Delta: `5eb2567..bcba627`.

PLAN-R1-01 — **Discharged.** The three files rev 1 missed are inventoried with per-file dispositions and the sharper moving-ref-vs-pinned law; verified the citations are real (`test/disposition-ledger.test.js:48-52`, `test/telemetry-collect.test.js:123,358,370`, `test/telemetry-collect-soft.test.js:333`). A new instance of the same defect class introduced by rev 2's own broadened pattern set is filed separately below as NEW, not a reopen.
PLAN-R1-02 — **Discharged.** DoD 5 is now a decidable three-way rule with named landing sites (meta-test source / this Plan); a narrower new defect in its third branch is filed below.
PLAN-R1-03 — **Discharged.** The carry now has two mechanical witnesses (DoD 6 scenario + #192 comment) and is in Scope In; a new defect in what the scenario can actually check is filed below.
PLAN-R1-04 — **Discharged.** Objective 3 and DoD 3 now mandate non-literal pattern assembly and an inline in-memory mutation, explicitly forbidding an on-disk fixture under `test/`.
### The rev-2 `main:` pattern fires 13 times on an uninventoried fourth file
- severity: high
- confidence: high
- origin: NEW
- location: Objective 3 + Rationale "The refinement round 1 forced" table + Assumption 3
- defect: Rev 2 broadened the pattern set to `merge-base`, `main:`, `origin/main`, `baseRef(`, `baseFile(` but the inventory was evidently produced with a narrower scan: run with rev 2's own patterns at HEAD, the sweep also fires on `test/tracker-ops.test.js`, which appears nowhere in the exemption table. This is PLAN-R1-01's defect class — a detection pattern frozen without being run as specified — reintroduced by the fix itself.
- evidence: `test/tracker-ops.test.js:448` `test("main: dispatches find-items end to end", () => {` and 12 further `test("main: ...")` titles (grep `-cE "merge-base|main:|origin/main|baseRef\(|baseFile\("` → `test/tracker-ops.test.js:13`). None is a ref; all are test-title prose. The plan states "it fires on three files outside the guard" and Assumption 3 claims "The exemption inventory is complete **as of `5eb2567`**."
- impact: DoD 3 (meta-test with these patterns fails on any non-exempt file), DoD 5 ("the meta-test passes after that disposition"), and Assumption 3 are jointly unsatisfiable at HEAD: an implementer building exactly what Objective 3 specifies ships a red suite, or silently widens the exemption list beyond what the Plan ratified.
- fix: Re-run the sweep with the exact rev-2 pattern set and either context-scope `main:` to a git-ref position (e.g., `<ref>:<path>` inside a git invocation) or add `tracker-ops.test.js` as a fourth reasoned exemption ("token appears only in test-title strings, not as an anchor").
### DoD 5's escalation branch contradicts "the meta-test passes"
- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done, item 5
- defect: The third disposition branch — "escalated as a **filed issue id** recorded in this Plan" — leaves the occurrence in the tree, matching the pattern, and not in the exemption list; the very next sentence requires "The meta-test passes after that disposition." As written, branch 3 cannot coexist with a green meta-test, resurrecting the self-contradiction shape PLAN-R1-02 was raised for.
- evidence: DoD 5: "exactly one of: brought in scope and fixed; exempted with a recorded reason in the meta-test source; or escalated as a **filed issue id** recorded in this Plan. The meta-test passes after that disposition." Nothing states that escalation also silences the meta-test.
- impact: The DoD is undecidable for exactly the case it exists to govern: an occurrence too big to fix in-slice either blocks the suite or gets an unratified exemption entry the Plan never sanctioned.
- fix: State that an escalated occurrence also enters the exemption list with the filed issue id as its recorded reason, making the exemption list the single mechanism for all non-fixed occurrences.
### The `baseRef`/`baseFile` helper definitions have no disposition
- severity: medium
- confidence: high
- origin: NEW
- location: Scope In (iteration-disposition bullet) + Disposition table (D4) + Assumption 3
- defect: `test/iteration-disposition.test.js` contains moving-ref occurrences beyond the four scenario bodies: the helper definitions themselves (`origin/main` at :22 and :27, `merge-base` at :24, the `baseRef(`/`baseFile(` declarations at :21/:30-31). After D4's dispositions the helpers are dead code that still trips the meta-test, and no plan text — not the disposition table, not Scope In, not the exemption inventory — names them.
- evidence: `test/iteration-disposition.test.js:21-31` (helper defs); the four uses at :155, :355, :408, :421 all vanish under D4 (IDV3/IDV14 convert to current-tree assertions, IDV15/IDV16 retire); Scope In limits the file's work to "disposition of `IDV3`, `IDV14`, `IDV15`, `IDV16` per the table below"; the exemption table lists three other files only.
- impact: An implementer following the disposition table exactly ends with the meta-test red on the very file the slice fixes; DoD 4 and DoD 5 cannot both be closed without unstated extra work.
- fix: Add one line to Scope In or the disposition table: the then-unused `baseRef`/`baseFile` helpers (lines 20-33) are deleted with the four dispositions.
### DoD 6 claims a wording-independent check no textual scenario can deliver
- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done item 6 + Assumption 5
- defect: DoD 6 requires "a standing scenario asserts `phase-spec.md` §4 states the law", while Assumption 5 says this "guards the law's *presence*, not its wording" and that S1 will absorb rather than preserve the prose. A textual scenario can only anchor on wording; the plan specifies no anchor mechanism, so the two constraints are jointly unimplementable: pin phrases and S1 must preserve them verbatim (contradicting Assumption 5), pin nothing decidable and "states the law" is unfalsifiable.
- evidence: DoD 6: "a standing scenario asserts `phase-spec.md` §4 states the law"; Assumption 5: "which is why DoD 6 guards the law's *presence*, not its wording"; the plan nowhere says what strings/structure the scenario checks.
- impact: The slice's own centrepiece guard — added specifically to fix PLAN-R1-03 — cannot be turned into a falsifiable spec scenario without the implementer inventing the anchor policy the Plan should own, and S1 has no instruction on whether tripping it means "restore the wording" or "move the anchors".
- fix: Specify the anchor (e.g., a small set of concept tokens or a durable marker the section must retain) and state that S1's rewrite updates the scenario's anchors rather than deleting the scenario.
### The DoD 6 standing scenario carries no cost budget
- severity: low
- confidence: high
- origin: NEW
- location: Definition of done items 3 and 6
- defect: DoD 3's budget ("inside the existing `npm test` corpus… no subprocess… under 1s") is scoped to the meta-test only; the DoD 6 standing scenario is new gate-running machinery with no stated budget.
- evidence: DoD 3's budget sentence names only the meta-test; DoD 6 states no cost terms.
- impact: Trivial in practice (a single file read), but the plan's own budget discipline — imposed on the meta-test in round 1 — is applied inconsistently to the machinery added in round 2.
- fix: Extend DoD 3's budget clause ("in-corpus, no subprocess, no new CI job") to cover the DoD 6 scenario in one line.
CLEAR: D — the delta touches no ratified decision; D1–D4 restated unchanged, FROZEN untouched claims verified (`test/frozen-surfaces.test.js:39-43` lists `validator-task.prompt.md`, confirming IDV15's retirement reason; `phase-spec.md`/`phase-implement.md` absent from `FROZEN`, confirming Assumption 1).
CLEAR: F — the plan already claims the irreversible track and the delta adds no new frozen shape beyond what that track covers; the exemption-list format lives in test source, not a published contract.
