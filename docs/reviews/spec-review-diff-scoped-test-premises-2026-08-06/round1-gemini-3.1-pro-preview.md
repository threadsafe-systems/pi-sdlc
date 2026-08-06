# Spec panel round 1 — gemini-3.1-pro-preview

Model: `google/gemini-3.1-pro-preview:xhigh`. Commit: `1c8a706`.

### IDV17 fails unconditionally after C5.1 removes subprocesses

- severity: high
- confidence: high
- origin: NEW
- location: Spec §6 (C5.1)
- defect: C5.1 mandates removing all executable uses of `execFileSync` from `test/iteration-disposition.test.js`, but leaves the existing `IDV17` test unchanged. `IDV17` strictly asserts that the file contains `execFileSync("git"...)`, so it will fail when the test file is modified to have zero subprocesses.
- evidence: `test/iteration-disposition.test.js` line 472 at `7710509` (and `1c8a706`): `assert.deepEqual([...new Set(spawned)], ["git"], ...)` expects exactly one `"git"` string to be matched by the source-inspection regex. After C5, `spawned` will be strictly `[]`.
- impact: The test suite will be broken after C5 is implemented because IDV17 will assert `[]` deepEquals `["git"]`.
- fix: Update C5.1 to either remove IDV17's `["git"]` assertion or amend it to expect `[]`.

### Missing implementation contract for S1 mechanical witness (DSP3)

- severity: high
- confidence: high
- origin: NEW
- location: Spec §3 and §7
- defect: The Spec mandates a new test (referred to as "DSP3") to verify the presence of the `moving`, `expire`, and `pinned` anchors in `phase-spec.md` (and N2/DSP12 reference "the two new tests"). However, no contract section actually instructs the implementer to create this test, nor specifies what file it should live in (unlike C4 which explicitly creates `test/diff-scoped-premises.test.js`).
- evidence: §7 mentions "The comment names the standing test scenario DSP3 as the mechanical witness", and N2/DSP12 reference "The two new tests". But neither §3 nor §6 contain instructions to build this scenario.
- impact: An implementer executing the Spec's contracts (C1-C5) will not build the required mechanical witness test for the S1 carry, failing the Plan's core "standing scenario" requirement (DoD 6) and S1 handoff verification.
- fix: Add a new contract (e.g., C1.1) specifying the creation, location, and logic of the standing scenario test that enforces C1 and contains the DSP3 non-vacuity check.

### C5.2 literal array mismatch with existing `numbered()` helper

- severity: medium
- confidence: high
- origin: NEW
- location: Spec §6 (C5.2)
- defect: C5.2 mandates comparing the current-tree headings against an "exact literal array" that lacks `## ` prefixes (e.g., `1. Purpose`), but the existing `numbered()` helper in `test/iteration-disposition.test.js` includes the full line with the `## ` prefix.
- evidence: C5.2's literal array starts with `1. Purpose`. In `test/iteration-disposition.test.js` line 39, `numbered()` uses `body.split("\n").filter((line) => /^## \d+\. /.test(line))` which yields elements like `## 1. Purpose`.
- impact: If implemented literally as specified, IDV3 will unconditionally fail because `## 1. Purpose` does not equal `1. Purpose`.
- fix: Instruct the implementer to either add `## ` prefixes to the literal array in C5.2, or update the `numbered()` helper to strip them.

CLEAR: A — Frozen shapes vs locked decisions: No shapes are frozen beyond the textual regex, which matches exactly what is described.
CLEAR: B — Verification scenarios: All scenarios correctly describe testing their respective targets (save for the missing C1 implementation).
CLEAR: C — Contracts and interfaces: The regex API properly isolates argv blocks via `[^\\]]*`.
CLEAR: D — Contradictions: No internal contradictions beyond those stated.
CLEAR: E — Framework reality: File reads and regexp semantics are sound.
CLEAR: F — Non-functional requirements: NFRs are explicitly stated and gated by scenarios.
CLEAR: G — Honesty sweep: The regex openly admits its limitations (false negatives) in C4.3.
CLEAR: H — Carry landing: Issue comment on #192 is correctly cited and landed.
