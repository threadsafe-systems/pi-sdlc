# Plan panel round 1 — gemini-3.1-pro-preview

Model: `gemini-3.1-pro-preview`. Artifact: `docs/plans/2026-08-06-diff-scoped-test-premises.md` @ 5eb2567.

### Meta-test deadlock on valid ledger and stub files
- severity: high
- confidence: high
- origin: NEW
- location: Definition of done (DoD 3, DoD 5) and Assumptions (3)
- defect: The textual ban on `merge-base` across all of `test/` will immediately trigger on legitimate usages in `disposition-ledger.test.js` (which falls back to it to pin a baseline commit) and `telemetry-collect.test.js` (which stubs it). This creates an impossible state where the agent cannot pass CI (DoD 6) but is forbidden from rewriting the flagged files (DoD 5).
- evidence: `test/disposition-ledger.test.js:52` and `test/telemetry-collect.test.js:123` legitimately contain `merge-base`. Assumption 3 confirms the detection is a purely textual sweep.
- impact: Implementation will be permanently deadlocked: the agent cannot make the suite green without modifying out-of-scope files, and cannot ignore the false positives without failing the meta-test constraint.
- fix: Narrow the meta-test's textual check to exclude non-scenario usages, or add an explicit allowlist for files that legitimately use `merge-base` for ledger tracking and git stubs.
### Meta-test self-match failure
- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done (DoD 3)
- defect: A textual source-scanning meta-test that searches `test/` for the literal strings `"baseRef("` and `"merge-base"` will scan its own source file, find the string literals it is using as search keys, and fail itself.
- evidence: DoD 3 requires reading "every file under `test/` once" and fails when "any test file other than `test/frozen-surfaces.test.js`" contains the patterns.
- impact: The meta-test will be trivially broken on day one, failing CI and blocking the agent from completing the slice without inventing an unstated exclusion.
- fix: Explicitly exclude the meta-test's own file from the sweep, or specify that the banned strings must be obfuscated in the test source (e.g., `"merge-" + "base"`).
CLEAR: A — Every DoD item is observable and mechanically falsifiable.
CLEAR: B — The general law routing rule has a plausible verification path through the meta-test.
CLEAR: D — The plan honors D1-D4 and does not silently overwrite any other locked decisions.
CLEAR: F — Modifying the shipped skill references behaviorally binds adopters, correctly forcing the irreversible track.
CLEAR: G — The meta-test cost budget is explicit (<1s wall, no subprocess/network) and highly proportionate.
