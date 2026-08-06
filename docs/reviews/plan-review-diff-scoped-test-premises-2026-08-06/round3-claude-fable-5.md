# Plan panel round 3 (delta) — claude-fable-5

Model: `claude-fable-5`. Delta: `bcba627..8091fc8`.

**Round-2 dispositions:**
- PLAN-R2-01: discharged — call-shape restructure landed (Objective 3; rationale "matched by call shape" section). Its supporting measurement spawns NEW findings below.
- PLAN-R2-02: discharged — `frozen-surfaces.test.js` is exemption 1 of 2 in the rev-3 match table.
- PLAN-R2-03: discharged — DoD 5 now routes every non-fixed occurrence through the exemption list; the contradiction is gone.
- PLAN-R2-04: discharged — Scope In deletes the helpers at `:20-33`; verified they sit at `test/iteration-disposition.test.js:20-32`.
- PLAN-R2-05: discharged — DoD 6 anchors on `moving`/`expire`/`pinned`; verified none pre-exist in §4 (`skills/sdlc/references/phase-spec.md:44-70`), so the anchors cannot pass vacuously today.
- PLAN-R2-06: discharged — DoD 3's budget now covers both tests, <1s combined.
### Measurement scope contradicts enforcement scope — and the excluded files contain the detector's first false positive
- severity: high
- confidence: high
- origin: NEW
- location: rationale ("measured over all 45 files under `test/` at `bcba627`"), Objective 3 / DoD 3 ("any file under `test/`"), Assumption 3
- defect: The sweep the plan enforces is "any file under `test/`", but the measurement backing the "3 matched, 0 false" claim covered only 45 files — `test/` at `bcba627` contains **74** files (`git ls-tree -r bcba627 -- test/`), and the 45 are exactly the top-level `*.js` files. The 16 silently excluded `test/e2e/*.mjs` files contain real git invocations whose argument lists literally name `main`.
- evidence: `test/e2e/harness.mjs:250` and `:290`: `runProcess(["git", "init", "-q", "-b", "main", ...])` — a genuine git subprocess invocation with `"main"` in the literal argument array, creating a sandbox branch; nothing about it expires at merge. Verified no other moving-ref token under `test/e2e/` (grep at `bcba627`).
- impact: Either the implemented meta-test honors DoD 3's "any file under `test/`" and flags `harness.mjs` — falsifying "0 false positives" and breaking the two-entry exemption list the plan calls "the test that the restructure is right" — or the meta-test sweeps only top-level `*.js`, in which case DoD 3 mis-states its own scope and e2e is permanently outside the guard. Assumption 3's "inventory complete as of `bcba627`" is only true of a file set the plan never names.
- fix: State the sweep's exact file set (e.g., `test/*.test.js`), re-state the measurement over that set, and record the e2e exclusion (or inclusion + disposition of `harness.mjs`) explicitly.
### The detector definition is frozen without its pattern set, and bare `main` impales it either way
- severity: high
- confidence: high
- origin: NEW
- location: Objective 3, rationale ("Every genuine occurrence is a **git subprocess invocation whose argument list names a moving ref**"), DoD 3
- defect: The plan freezes a detector *concept* and a *measured result* but never states the patterns that produced 3/0. The corpus shows no pattern set can satisfy the definition as written: if bare `main` inside a git argv counts as "naming a moving ref", `harness.mjs:250/290` (`git init -b main`) false-positives; if bare `main` does not count (only `merge-base`/`main:`/`origin/main` tokens), then the most natural expiring shape — `execFileSync("git", [..., "diff", "main", ...])` or `git show` with the ref in a variable — is invisible, which is exactly how the corpus's only real `main:<path>` read behaves (next finding).
- evidence: `test/frozen-surfaces.test.js:49-51` — the sanctioned guard itself passes the moving ref through a loop variable (`for (const ref of ["main", "origin/main"]) … execFileSync("git", ["-C", repo, "merge-base", "HEAD", ref]`); its git argv names no moving ref, only `merge-base`. Any detector reproducing the claimed 3 matches must therefore treat `merge-base` as the flagged token and *exclude* bare `main` — which the definition "names a moving ref" does not say.
- impact: This is the third wave of the R1/R2 generator in a subtler form: rev 1 froze a pattern unrun, rev 2 froze a broadened set unrun, rev 3 froze a *measurement* whose pattern set is unstated and unreproducible from the plan text. The spec author cannot implement "the" detector; whichever regex they pick either breaks the 0-FP claim or narrows coverage below the stated law.
- fix: Enumerate the concrete flagged tokens/shape (e.g., "`merge-base`, `main:`, or `origin/main` as an element of a git subprocess argument array") in Objective 3/DoD 3, and restate the definition to match what was actually measured.
### The measurement table's baseline row is unreproducible: rev 2's token set matches 6 files, not 7, and `telemetry-emitter` is not a git-stub file
- severity: medium
- confidence: high
- origin: NEW
- location: rationale measurement table ("bare token (rev 2) | 7 | 4 — … telemetry-emitter (git stub source)"), DoD 3 ("7 matched files (4 of them false)")
- defect: Rev 2's documented token set (`merge-base`, `main:`, `origin/main`, `baseRef(`, `baseFile(` — the text rev 3 deleted) matches **6** top-level test files at `bcba627`, not 7: `telemetry-emitter.test.js` contains none of those tokens (verified: grep over the file exits with no match). The table also mischaracterizes it as "git stub source": the file stubs nothing — it builds *real* git repos via real `execFileSync("git", …)`.
- evidence: `git grep -E "merge-base|origin/main|main:|baseRef\(|baseFile\(" bcba627 -- test/telemetry-emitter.test.js` → no matches; `test/telemetry-emitter.test.js:41-56` — real `git init/add/commit` helper, no stub. Reproducing "7" requires adding a quoted-`"main"` token rev 2 never listed.
- impact: DoD 3 hard-codes "7 matched (4 false)" as the load-bearing justification for the restructure. In a plan whose R1 **and** R2 highs were both "a scan result claimed but not actually run as described", a third unreproducible measurement — inside the definition of done — repeats the defect class the rev-3 preamble claims to have killed.
- fix: Re-run the baseline with rev 2's actual token set, correct the row to 6/3-false (or state the broadened set that yields 7), and fix the `telemetry-emitter` characterization.
### The universal "every genuine occurrence is a call-shape match" claim is false at occurrence granularity in the measured corpus
- severity: medium
- confidence: high
- origin: NEW
- location: rationale ("Every genuine occurrence is a **git subprocess invocation whose argument list names a moving ref**. Test titles, git-stub source strings, and comments are never that."), DoD 5 ("for each matched occurrence")
- defect: The corpus's only real `main:<path>` read names the moving ref in a data literal, not in a git invocation's argument list: `test/disposition-ledger.test.js:53` pushes `"main:skills/sdlc/SKILL.md"` into `refs`, and the consuming git call at `:57` is `execFileSync("git", ["-C", repo, "show", ref])` — argv names no moving ref. The file is caught only via the incidental `merge-base` fallback at `:52`.
- evidence: `test/disposition-ledger.test.js:52-57`, read at `8091fc8` (file unchanged from `bcba627`).
- impact: DoD 5 dispositions "each matched occurrence" — the `:53/:57` moving-ref read is a genuine occurrence that is never a match, so exemption 2's recorded reason will cite the merge-base fallback while the actual `main:` read rides along unseen; and a future file copying disposition-ledger's shape *minus* the merge-base fallback (ref-in-variable, the corpus's demonstrated habit — `frozen-surfaces.test.js:49-51` does the same) evades the guard entirely. Assumption 4's honesty note names only "assembled dynamically, or reached through a helper in another module"; same-function variable flow is neither.
- fix: Weaken the universal claim to file granularity ("every file with a genuine occurrence contains at least one call-shape match at `bcba627`"), and add same-file variable indirection to Assumption 4's named evasion classes.
CLEAR: C — in/out boundaries are internally consistent in the delta (the tracker-ops/telemetry files moved coherently from "exempt" to "not matches"); the e2e scope gap is filed under the first finding, not a new boundary contradiction.
CLEAR: D — D1-D4 untouched by the delta; DoD 5's rewrite implements, not reopens, PLAN-R1-02's disposition.
CLEAR: F — track remains irreversible; the delta freezes no new shape beyond the detector already covered above.
CLEAR: PROPORTIONALITY — DoD 3 states a concrete combined budget (<1s wall, inside existing `npm test`, no subprocess/network/model, no new CI job) covering both new tests; scanning even the full 74-file corpus is trivially within it.
