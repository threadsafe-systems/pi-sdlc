### NEW — Index still smuggles line-kind grammar via synonyms

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-09-gate-presentation-contract.md:38-39,45-46,52-54`
- defect: Although literal `appetite:`/`decision:`/`rejected:` prefixes were removed, index entries still restate the grammar through “three line kinds,” “rejections,” and “refused alternative” prefixes, contradicting the claim that line-kind prefixes live only at the resolution-comment home.
- evidence: The plan says “entries are pure descriptive gists; the line-kind prefixes live only at home” (lines 38-39), but entries retain “three line kinds (appetite exactly-one-first, decision, rejected)” (line 45) and “refused alternative —” (lines 52-54). The live comment contains the corresponding canonical grammar at `/tmp/r4-comment.md:26,33-35`.
- impact: The map index duplicates grammar classification and weakens the one-place law, creating drift between the plan index and canonical resolution comment.
- fix: Rewrite these entries as content-only gists without line-kind names or refusal-category prefixes.

CLEAR: R3-A1 — Live rev-4 index entries have no literal `appetite:`/`decision:`/`rejected:` prefixes; command output reported `none`, and the home counts are correct.

CLEAR: R3-A2 — The plan sketch (lines 19-31) and live comment sketch (`/tmp/r4-comment.md:7-19`) both hash to `bab0b82b73231f380f8d6a902d2d53ba5b40696c27155d5b0fdfe5ad345386b2`; fetched comment size is 3996 bytes.

CLEAR: Live grammar — `grep -c '^- \(appetite\|decision\|rejected\):' /tmp/r4-comment.md` returned 13.

CLEAR: Reference links — `[s3-gate-record]` is defined exactly once at line 56 and all 14 references use that spelling.

CLEAR: ADR/proportionality — ADR criteria remain by reference only; “no parser, no dial, no panel” remains explicit.

CLEAR: A — DoD items use falsifiable commands or static assertions.

CLEAR: B — Objective outcomes have contract-test and human-gate verification paths.

CLEAR: C — Scope boundaries remain coherent aside from the index-label defect above.

CLEAR: D — Locked enforcement remains routed to frozen attack-surface D.

CLEAR: E — FS11, S2, Spec/Build ordering, ADR, and thread-variant dependencies are named.

CLEAR: F — The irreversible track correctly matches public phase-contract changes.

FINDINGS