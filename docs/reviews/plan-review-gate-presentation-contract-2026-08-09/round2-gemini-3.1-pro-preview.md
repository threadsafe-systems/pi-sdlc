### REOPEN R1-07

- severity: medium
- confidence: high
- location: lines 40 and 74
- defect: The plan restates the exact ADR bar criteria in its own text and introduces a typo (`-` instead of `+`), directly violating the adjudication to preserve it solely by reference and not restate it.
- evidence: `- decision: the three-criteria ADR bar (hard-to-reverse + surprising + real trade-off)` (line 40) and `(hard to reverse + surprising - real trade-off — never restated in §8)` (line 74).
- impact: Redundant restatement in the plan creates multiple sources of truth and drift risk, failing the "never restated" instruction.
- fix: Remove the parenthetical criteria lists from lines 40 and 74, leaving only the reference to `system-reference.md`.

### NEW

- severity: high
- confidence: high
- location: lines 5, 13, and 34-45
- defect: The plan's status declares it is in map mode (`Map #192 slate row S3`), but the dogfood provenance block claims `plain mode — this block is the store` and writes out the full decisions grammar rather than the required map-mode index format (named links).
- evidence: `Map #192 slate row S3` (line 5) vs `plain mode — this block is the store` (line 13) and the full bulleted list under `### The decisions list` (lines 34-45).
- impact: The dogfood block fails to model the very map-mode index structure (named links + gists) it prescribes, contradicting its own rule and confusing downstream spec agents.
- fix: Change the dogfood provenance block to declare `map mode — this list is the index`, and convert the bullet points to named ticket links with one-line gists, aligning with the plan's map mode status.

CLEAR: R1-01 — Fix landed as adjudicated; enforcement delegated to existing attack surface D by reference, leaving prompt frozen.
CLEAR: R1-02 — Fix landed as adjudicated; In-scope 4 and DoD 2 correctly require extending the first-paragraph enumeration.
CLEAR: R1-03 — Fix landed as adjudicated; rule qualified with standalone "no upstream gate" exception.
CLEAR: R1-04 — Fix landed as adjudicated; G4 folded with proportionality preserved, named triggers, and fired-but-skipped declaration.
CLEAR: R1-05 — Fix landed as adjudicated; store/index split and sketch embedding rules unambiguously defined.
CLEAR: R1-06 — Fix landed as adjudicated; semantic contract tests specified, literal anchors deferred to Spec.
CLEAR: R1-08 — Fix landed as adjudicated; DoD 7 names exact command and conditions exit 0 on Spec AND Build artifacts.
CLEAR: R1-09 — Fix landed as adjudicated; G7 defined as one non-binding prompt.
CLEAR: R1-10 — Fix landed as adjudicated; exact commands named in all applicable DoD items.
CLEAR: R1-11 — Fix landed as adjudicated; `(-> ADR 00NN)` ASCII pinned as canonical.

CLEAR: A — DoD items are all explicit commands or verifiable string checks.
CLEAR: B — The outcome (a verifiable rule) is directly anchored to contract tests.
CLEAR: E — No missing risks or dependencies identified in the delta.
CLEAR: F — Track classification correctly remains irreversible due to rule definition.

FINDINGS