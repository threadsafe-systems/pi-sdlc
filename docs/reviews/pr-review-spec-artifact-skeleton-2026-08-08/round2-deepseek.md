### A1 — M6/M7 window-scoping (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: docs/specs/2026-08-08-spec-artifact-skeleton.md, test/spec-artifact-skeleton.test.js
- line: spec:28-36 (AM4 added), test:278,291 (AM4 comments added to M6/M7)
- problem: N/A — fix verified complete. AM4 amendment record enumerates the window-scoping; M6 and M7 test comments name AM4 and state the re-freeze deletes them; AM3 lists three components; SAS13/SAS14 reference three components. All three legs of the re-freeze obligation (restore FROZEN entry, restore IDV19, remove M6/M7) are now recorded.
- repro_or_impact: Verified against adjudication text.

### A2 — M2 block-adjacency (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: test/spec-artifact-skeleton.test.js
- line: 134-161
- problem: N/A — fix verified complete. M2 now splits §4 on blank-line boundaries, verifies block[firstIdx+1] starts with "Author the Spec against the fixed skeleton", block[firstIdx+2] equals the four numbered rules exactly, block[firstIdx+3] starts with "The gate refuses", and block[firstIdx+4] starts with "**Premise durability.**" Mutation-test confirmed: inserting an interloper paragraph between the first paragraph and rules lead-in causes the test to fail with "the rules lead-in must be the block immediately after the first paragraph."
- repro_or_impact: `node --test test/spec-artifact-skeleton.test.js` passes 22/22. Scratch mutation: inserting an interloper `\n\nAn interloper...\n\n` between the first paragraph and the rules lead-in in phase-spec.md triggers M2 adjacency failure (exit 0, 1 fail).

### A3 — SAS9 evidence classes (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: docs/specs/2026-08-08-spec-artifact-skeleton.md
- line: 275-279 (SAS9 amended), 35-38 (AM5 added)
- problem: N/A — fix verified complete. SAS9 now enumerates PV1 manifests (`docs/validation/spec-artifact-skeleton/`), task receipt bundles (`docs/reviews/task-validate-spec-artifact-skeleton-*/`), and PR-phase review artifacts (`docs/reviews/pr-review-spec-artifact-skeleton-*/`). Dangling "(assumption 4)" citation dropped. AM5 records the amendment with authority trail. The delta's own new files under `docs/reviews/pr-review-spec-artifact-skeleton-2026-08-08/` (adjudication, round1, round1-sol/luna/deepseek) match the amended SAS9 glob.
- repro_or_impact: Spec self-consistent; all delta hunks fall within the amended permitted classes.

### A4 — paths.specs (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: skills/sdlc/references/spec-artifact-skeleton.md
- line: 3-4
- problem: N/A — fix verified complete. Preamble now reads "under the configured `paths.specs`, default `docs/specs/<date>-<feat>.md`". The default is cited, not hardcoded. M1 tests unchanged (preamble is not marker-pinned).
- repro_or_impact: Consistent with phase-spec.md §4's "routes to the configured `paths.specs`".

### A5 — em-dash restoration (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: skills/sdlc/assets/normative-references.json
- line: 144, 155
- problem: N/A — fix verified complete. Both tracker-ops assertion fields now contain literal `—` (U+2014) characters, matching main's encoding. `node skills/sdlc/scripts/check-references.mjs` exits 0. M5 test passes.
- repro_or_impact: Diff no longer shows byte changes on unrelated rows; JSON parsing produces identical values.

### A6 — NFR fill-in row assertion (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: test/spec-artifact-skeleton.test.js
- line: 79
- problem: N/A — fix verified complete. New assertion `inSectionOnly("| <characteristic> | <stimulus or condition> | <measurable response> | <scenario id, or ...` added to M1 NFR test. Mutation-test confirmed: removing the fill-in row from the skeleton causes M1 NFR markers test to fail (`✖ M1: NFR markers are section-local`).
- repro_or_impact: `node --test test/spec-artifact-skeleton.test.js` passes 22/22. Scratch mutation: removing the fill-in row fails the test.

### A7 — t5.json timeout 30000 (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: docs/validation/spec-artifact-skeleton/t5.json
- line: 11
- problem: N/A — fix verified complete. `tests.full.timeoutMs` changed from 300000 to 30000. Evidence label says "inside SAS10's 30-second budget (this check's timeout enforces it)". Runner report shows `timedOut: false, durationMs: 5246` (well under 30s). T5 receipt rebuilt and verified (`node skills/sdlc/scripts/verify-task-receipt.mjs --dir ...` → "receipt verified").
- repro_or_impact: A 31s run would now correctly time out and produce FAIL.

### A8 — zero-item convention (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: skills/sdlc/references/spec-artifact-skeleton.md
- line: 5-8
- problem: N/A — fix verified complete. Preamble now includes: "A block that legitimately has zero entries — no coined terms, no changed interfaces, no NFRs — keeps its header and markers and carries one `none — <one-line reason>` entry where entries would go: a zero state is declared, never silent." Preamble text is not marker-pinned; all M1 tests still pass.
- repro_or_impact: Author can now produce a compliant zero-item spec by filling in `none — <reason>` lines.

### A9 — T1/T2 report.json → runner-report.json (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: docs/reviews/task-validate-spec-artifact-skeleton-t1-2026-08-08/validator.md, docs/reviews/task-validate-spec-artifact-skeleton-t2-2026-08-08/validator.md
- line: 5,18,25 (T1), 5,25,32 (T2)
- problem: N/A — fix verified complete. All six occurrences of `report.json` corrected to `runner-report.json`. No `report.json` remains in either file (`grep report\\.json` — zero hits). T1/T2 receipts still verify (hashes cover manifest + runner-report only, not validator.md).
- repro_or_impact: Reviewers following the committed evidence links now land on existing files.

### A10 — t5.json lifecycle.declaration evidence label (VERIFIED-GAP: none — fix fully landed)

- severity: n/a (fix verified)
- confidence: high
- file: docs/validation/spec-artifact-skeleton/t5.json
- line: 39
- problem: N/A — fix verified complete. `lifecycle.declaration.evidence` now says "SAS10: the run's lifecycle declaration...". Categories.scenarios correctly maps SAS10 → lifecycle.declaration. T5 receipt rebuilt and verified.
- repro_or_impact: Evidence label now matches the scenario mapping (SAS10, not SAS4).

### Rebuilt T5 receipt integrity (VERIFIED-GAP: none)

- severity: n/a (check)
- confidence: high
- file: docs/reviews/task-validate-spec-artifact-skeleton-t5-2026-08-08/
- problem: N/A. `verify-task-receipt.mjs --dir ...` returns "receipt verified". All T1-T5 receipts verified. T5 manifest SHA (`aaef12ee...`) and runner-report SHA (`81fefc14...`) match stored artifacts. Runner verdict PASS, validator verdict PASS. Full corpus: 556 pass, 0 fail, 5081ms (under budget).
- repro_or_impact: All receipt hashes consistent with committed files.

### REGRESSION HUNT: none found

- severity: n/a
- confidence: high
- problem: No regressions detected. Frozen surfaces pass ASD19 (byte-identical to base, `adversary-spec.prompt.md` correctly absent from FROZEN). `check-references` passes. `check-lifecycle` passes (state: pass). Full corpus 556/556 green. All 22 skeleton contract tests pass. No test file assertion was weakened — the M2 rewrite is strictly stronger than the original (block-adjacency implies the old region-search). The preamble expansion does not collide with any marker test. The em-dash restoration is semantically neutral. T5 timeout tightening is a safety improvement, not a regression.
- repro_or_impact: `npm test` passes 556/556. `node skills/sdlc/scripts/check-references.mjs` exits 0. `bash skills/sdlc/scripts/check-lifecycle.sh --track irreversible --slug spec-artifact-skeleton` exits 0. `node --test test/frozen-surfaces.test.js` passes 2/2.