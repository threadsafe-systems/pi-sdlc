### REOPEN R3-A1 — Synonym prefixes still encode the rejected line kind

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-09-gate-presentation-contract.md:38-39,52-54`
- defect: The exact `rejected:` tokens were removed, but all three entries now use the repeated synonym prefix `refused alternative —`; this still classifies index entries by the grammar that is supposed to live only at the linked home.
- evidence: Lines 38-39 claim “entries are pure descriptive gists; the line-kind prefixes live only at home,” while lines 52-54 each begin `- [refused alternative — ...]`. Mechanical checks returned `canonical-prefix lines: 0` but `synonym-prefix lines: 3`.
- impact: The map-mode index continues to reproduce the rejected line kind under another label, leaving R3-A1 only partially fixed and preserving the one-place-law breach.
- fix: Remove the repeated `refused alternative —` prefix and begin each gist directly with its subject.

CLEAR: R3-A2 — The live comment fetched as 3,996 bytes; both extracted Mermaid bodies were 868 bytes and hashed `bab0b82b73231f380f8d6a902d2d53ba5b40696c27155d5b0fdfe5ad345386b2`, with `cmp` reporting `IDENTICAL`.

CLEAR: live-home cardinality — The fetched comment contained exactly 1 `appetite:`, 9 `decision:`, and 3 `rejected:` lines; the required combined grep returned 13, matching rev-4 lines 37-39.

CLEAR: reference integrity — The `[s3-gate-record]` target at line 56 is defined exactly once, resolves to live comment `5230679564`, and all 13 index entries use the identically spelled reference.

CLEAR: provenance consistency — Apart from the synonym-prefix defect, the rev-4 sketch, map-mode index/store split, linked resolution-comment home, In scope, DoD, and Assumptions remain mutually consistent.

CLEAR: proportionality — Lines 51 and 120-129 retain contract tests on prose plus the human gate and explicitly prohibit a parser, dial, or new panel.

CLEAR: A — DoD items remain mechanically falsifiable and include explicit commands and runtime budgets.

CLEAR: B — The two-artifact provenance objective has direct contract-test and document-placement verification paths.

CLEAR: C — The change remains one-spec scope across two phase references and one contract-test file; excluded prompts, templates, rendering, and mechanics remain excluded.

CLEAR: E — Ordering, frozen-surface, reference-inventory, lifecycle, and existing-test dependencies are named.

CLEAR: F — The plan correctly remains on the irreversible track because it freezes a public phase contract.

FINDINGS: 1 — Although the ledger records all 16 round-1–3 findings incorporated and 0 dismissed, R3-A1 remains only partially effective; rev 4 is not ready for the Plan gate until the three synonym prefixes are removed.