# Spec panel round 1 — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Commit: `1c8a706`.

### C5 as written breaks IDV17: DSP15 is unsatisfiable without an edit the Spec never specifies

- severity: high
- confidence: high
- origin: NEW
- location: Spec §6 C5.1 ("the source-inspection regex at today's line 471 is just data and needs no import"); test/iteration-disposition.test.js:471-472
- defect: C5.1 dispositions the line-471 regex but not the assertion on the next line. IDV17 ends with `assert.deepEqual([...new Set(spawned)], ["git"], "local git is the only permitted subprocess")` (line 472), which **requires at least one `execFileSync("git"` call to remain in the file**. C5.1-C5.4 remove every such call (lines 24, 31, 355, 408, 421 are the only ones), so the exact edits the Spec mandates make IDV17 fail.
- evidence: Simulated the C5 removals against the live file and re-ran IDV17's extraction: `spawned after C5: [] -> deepEqual to ["git"]? false`. The regex literal at line 471 (`/execFileSync\("([^"]+)"/g`) does not match its own escaped source, verified: `"matchAll(/execFileSync\\(\"…\"/g)".match(/execFileSync\("([^"]+)"/) === null`. C5.1's claim covers only the import; nothing in C5 or the DSP table dispositions line 472, and C4.2 forbids scaffolding changes only to the detector, so an implementer following C5 literally ships a red suite.
- impact: DSP15 ("Full `npm test` passes") cannot gate as claimed: implementing the Spec exactly turns the suite red, and the unavoidable extra edit to IDV17 (plus the now-false file-header comment "shells out to local git only … (N2/IDV17)") is unspecified, so its shape is guessed at implement time — the exact "described-but-unrun" failure class this Plan lineage exists to kill.
- fix: Add to C5.1: IDV17's subprocess-inventory assertion changes to assert the spawned set is empty (and the header comment drops "shells out to local git"), with a matching DSP clause.

### C4.2's bracket-bounding claim is false for variable-argv git calls

- severity: medium
- confidence: high
- origin: NEW
- location: Spec §4 C4.2 ("The git argv regex stops at the first closing array bracket. It therefore does not combine an unrelated git invocation with a moving-ref token elsewhere in the file.")
- defect: The "therefore" does not follow. `argvTail` is `[^\]]*`, which stops at the first `]` *character* — but when a git invocation passes its argv through a variable (no array literal), there is no `]` at the call site, and the pattern bridges past the call into arbitrary subsequent text until the next `]` anywhere in the file.
- evidence: Executed against the extracted prototype's exact patterns: `execFileSync("git", args); log("merge-base")` **matches** `mergeBasePattern`, and `execFileSync("git", opts, "diff"); use("main")` **matches** `directReadPattern`; adding any intervening `]` (`execFileSync("git", args[0]); log("merge-base")`) breaks the match. Both counterexamples are plausible test shapes (a wrapped git helper plus a later test title or assertion string containing `merge-base`/`main`).
- impact: The normative prose misstates the frozen detector core's behaviour — the same detector-described-vs-detector-executed gap that generated plan rounds 1-3. A future false positive of this shape will contradict the Spec's stated semantics, and the file-scoped exemption story ("all reported occurrences … serve the same present behaviour") breaks for a file exempted over a bridging artifact.
- fix: Restate honestly: the bound is the next `]` character, which contains bridging only when the argv is an array literal; a variable argv can bridge until the file's next `]` (or tighten the tail to also stop at `)`).

### The DSP3 law-check test has no named home

- severity: medium
- confidence: high
- origin: NEW
- location: Spec §8 N1 ("The guard and DSP3"), §9 DSP12 ("The two new tests"), §3 C1, §4 C4.1
- defect: N1 and DSP12 quantify over "the two new tests", but only one new test file is ever named (`test/diff-scoped-premises.test.js`, C4.1, scoped to the guard). The standing C1-law scenario (DSP1/DSP3) — the slice's centrepiece and the mechanical witness the #192 comment names — has no specified file, name, or relationship to the guard's sweep.
- evidence: Grepped the Spec: `test/diff-scoped-premises.test.js` is the only new test path it names; C1/DSP1-DSP3 and §7 name the scenario but never its home. Contrast C4.1, which names the guard's home explicitly.
- impact: An implementer must guess whether DSP3 lives inside the guard file or a second file, and DSP12's "two new tests import no child-process/network API" cannot be checked against an unidentified set; the durable #192 handoff points at a witness with no committed address.
- fix: Name the DSP3 test's file (in C1 or C4.1) and state that DSP12's import/cost bounds quantify over exactly that file plus the guard file.

### Guard equality vs subset against the exemption map is unspecified (stale exemptions can rot)

- severity: low
- confidence: high
- origin: NEW
- location: Spec §4 C4.1 ("The test fails when a reported file is neither fixed nor present in the closed exemption map"), §9 DSP7
- defect: C4.1 defines only the unexempted-hit failure. Neither C4.1 nor DSP7's fail column ("A current hit is unlisted, `iteration-disposition.test.js` remains, or an exemption lacks a reason") makes the guard fail when an exempted file *stops* matching, so "the exemption list is the standing audit" (Plan) can silently accumulate stale entries; DSP7's "contains only the two C4.4 files" is ambiguous between equality and subset.
- evidence: Quoted clauses; no clause anywhere in §4/§9 fails on an exemption entry with zero reported occurrences.
- impact: The audit claim over-promises: an exemption whose subject was rewritten stays exempt forever, and the pass condition can be implemented as a subset check without violating any stated fail branch.
- fix: State that the guard asserts the reported inventory equals the exemption map's key set exactly (a non-reporting exemption entry fails).

### DSP14 mislabels the §7 handoff as "C5-linked"

- severity: low
- confidence: high
- origin: NEW
- location: Spec §9 DSP14 ("Issue #192 contains the C5-linked handoff naming DSP3")
- defect: The §7 handoff concerns C1's premise-durability law and DSP3; C5 is the iteration-disposition disposition contract and has nothing to do with issue #192. §1 says "The S1 handoff lands in §7 and scenario DSP14", confirming the label is wrong.
- evidence: §7: "S1's rewrite of `phase-spec.md` §4 must preserve the premise-durability law … names the standing test scenario DSP3"; C5 (§6) touches only `test/iteration-disposition.test.js`.
- impact: A scenario that gates by inspecting the comment against "the C5-linked handoff" checks a nonexistent linkage; a literal-minded gate reviewer could pass/fail on the wrong criterion.
- fix: Change "C5-linked" to "§7/C1-linked".

### C4.2 branch-1 prose ("a call") misdescribes the normative regex, which also matches declarations

- severity: low
- confidence: high
- origin: NEW
- location: Spec §4 C4.2 branch 1 vs C4.3 ("reported by its direct `merge-base` argv and helper declaration")
- defect: Branch 1 is described as "a call to a helper named `baseRef` or `baseFile`", but the normative regex `\bbase(?:Ref|File)\s*\(` also matches declarations, and C4.3 itself relies on declaration matches — the prose and the frozen core disagree on what the branch reports.
- evidence: Executed: `function baseRef() {` matches `helperPattern` (stress case P2); C4.3 explicitly counts frozen-surfaces' "helper declaration" as a report source.
- impact: Anyone reasoning from the prose (e.g., a future class-(b) amendment argument about whether a declaration-only file is a hit) reaches the wrong answer; the regex, not the prose, is normative, so the prose must match it.
- fix: Reword branch 1 to "a call to or declaration of a helper named `baseRef` or `baseFile`".

### N2/DSP12's 1-second gate names no observer

- severity: low
- confidence: medium
- origin: NEW
- location: Spec §8 N2, §9 DSP12 ("the combined wall time is ≥1 second")
- defect: The fail condition is a measurement with no stated mechanism or environment: the Spec does not say whether the bound is an in-suite wall-clock assertion (flaky under CI load) or a review-time measurement, so the scenario's observer is undefined.
- evidence: §5 records prototype timing (0.06 s with Node startup) but §8/§9 specify no measurement procedure; `.pi/sdlc/workflow.md` requires priced scenarios — the price exists, the meter does not.
- impact: Two implementers produce incompatible gates (a flaky timing assert vs no mechanical gate at all), and DSP12's fail branch cannot be adjudicated consistently.
- fix: State the measurement mechanism (e.g., review-time `node --test` duration of the two named files, not an in-suite assert).

CLEAR: A — C5.2's frozen literal matches the live `system-reference.md` §1-§14 headings exactly (em-dashes included, §15 correctly excluded), and both C4.4 exemption reasons are grounded (disposition-ledger.test.js:48-57 pinned-first fallback; frozen-surfaces.test.js:49-51 guard contract); nothing missing or over-committed beyond the findings above.
CLEAR: E — executed the extracted prototype at 1c8a706: `swept: 60`, hits and reasons reproduce §5 byte-for-byte; the 74/60/6-JSON/8-MD counts, all cited line numbers (disposition-ledger:53,57; frozen-surfaces:49-51; harness.mjs:250,290; telemetry-emitter:288; tracker-ops' 13 `main:` titles), the named negatives, self-match freedom, and `lastIndex` handling all verified correct.
CLEAR: H — the plan-review consolidated record mints no `CARRY-TO-SPEC`; the Spec's §1 claim is accurate, and both named plan handoffs (detector deliverables → §4/§5 executed inventory; S1 comment → §7/DSP14 with a concrete comment URL) land at their named sites.
