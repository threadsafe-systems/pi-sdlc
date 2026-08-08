### A1 — Re-freeze scope (docs/specs/2026-08-08-spec-artifact-skeleton.md:29-39)

- verdict: RESOLVED
- evidence: AM3/AM4 and SAS13/SAS14 require all three components; M6/M7 comments identify their window scope. `/tmp/s1-pr-body.md` records the same three-step obligation and orchestrator ownership.

### A2 — Strict M2 adjacency (test/spec-artifact-skeleton.test.js:134-157)

- verdict: RESOLVED
- evidence: M2 now checks contiguous paragraph blocks. Inserting an interloper paragraph in a scratch copy made the targeted test exit 1 with “rules lead-in must be the block immediately after the first paragraph.”

### A3 — SAS9 evidence classes (docs/specs/2026-08-08-spec-artifact-skeleton.md:275-279)

- verdict: PARTIAL
- evidence: VERIFIED-GAP (medium) — SAS9 now permits PV1, task-receipt, and PR-review artifacts, but its exhaustive list still omits the amended Spec itself. `git diff --name-only $(git merge-base main HEAD)...HEAD` includes `docs/specs/2026-08-08-spec-artifact-skeleton.md`, so the submitted diff violates SAS9’s “and nothing else” clause.

### A4 — Configured specification path (skills/sdlc/references/spec-artifact-skeleton.md:3-4)

- verdict: RESOLVED
- evidence: The preamble now names configured `paths.specs` and identifies `docs/specs/` only as the default.

### A5 — Inventory em dashes (skills/sdlc/assets/normative-references.json:142-155)

- verdict: RESOLVED
- evidence: Both tracker assertion strings use literal em dashes again; the full branch-base diff for this file now contains only the intended new skeleton row.

### A6 — NFR fill-in row assertion (test/spec-artifact-skeleton.test.js:77-80)

- verdict: RESOLVED
- evidence: M1 asserts the complete row section-locally. Removing that row in a scratch copy made the targeted test exit 1 with the expected missing-marker assertion.

### A7 — Thirty-second corpus timeout (docs/validation/spec-artifact-skeleton/t5.json:9-13)

- verdict: RESOLVED
- evidence: `tests.full.timeoutMs` is 30000 and its evidence names SAS10. The stored run completed in 5246 ms without timing out.

### A8 — Zero-item convention (skills/sdlc/references/spec-artifact-skeleton.md:5-8)

- verdict: RESOLVED
- evidence: The preamble now requires a declared `none — <one-line reason>` entry while retaining section markers for legitimate zero-entry blocks.

### A9 — T1/T2 report paths (docs/reviews/task-validate-spec-artifact-skeleton-t1-2026-08-08/validator.md:5,18,25)

- verdict: RESOLVED
- evidence: All six T1/T2 references now point to the existing `runner-report.json`; both receipt bundles still pass receipt verification.

### A10 — SAS10 lifecycle evidence label (docs/validation/spec-artifact-skeleton/t5.json:36-39)

- verdict: RESOLVED
- evidence: The lifecycle declaration label now names SAS10 in both manifest copies and the stored runner report.

### T5 rebuilt receipt (docs/reviews/task-validate-spec-artifact-skeleton-t5-2026-08-08/receipt.json:1-12)

- verdict: RESOLVED
- evidence: `verify-task-receipt.mjs` passed; manifest copies are byte-identical, recorded hashes match, and runner/validator verdicts are PASS.

### NEW DEFECTS

none found