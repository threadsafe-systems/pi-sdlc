# Round 1 adjudication — spec-artifact-skeleton (2026-08-08)

Orchestrator adjudication of the 12 deduped round-1 findings (3 reviewers).
Each verdict states what was verified against the tree at 103148c before fixing.

## ACCEPT

### A1 — M6/M7 pin the unfreeze window and would break the mandatory re-freeze (HIGH; luna)
Verified: M6 asserts `FROZEN == L3` (16 entries, spec prompt absent); M7 asserts
exactly one filtered `ADVERSARY_PROMPTS` use and two unfiltered loops. AM3's
re-freeze (re-add the FROZEN entry, restore IDV19's unfiltered loop) makes both
assertions fail — the re-freeze PR could not leave the corpus green. Spec C7/AM3
never stated M6/M7's end-of-life. Fix: AM4 — M6/M7 are window-scoped and the
re-freeze PR removes them; AM3/SAS13/SAS14 grow the third component; the M6/M7
test comments name the window and AM4; the PR description's re-freeze obligation
lists three steps.

### A2 — M2 does not enforce adjacency (MED; sol + luna)
Verified: spec C7 M2 and SAS2 mandate adjacency ("no paragraph may sit between
them"; falsify: "inserting any paragraph between §4's first paragraph and the
rules paragraph"), but the test only searched the region between the first
paragraph and Premise durability. Reproduced sol's counterexample mentally: an
inserted paragraph in between left the test green. Fix: block-adjacency M2 —
§4's paragraph blocks must be exactly [first paragraph, intro+rules-lead block,
the four numbered lines, defect+pointer block, Premise durability], contiguous,
in order. Reading recorded: C2/SAS2's "paragraph" is the contiguous inserted
region (C2 itself renders the rules as a numbered list, so one literal markdown
paragraph is impossible); contiguity is the enforceable content of the rule.

### A3 — SAS9's permitted diff list excludes the slice's validation evidence (MED; sol)
Verified: SAS9 enumerates seven production/test change classes "and nothing
else", but the branch adds 5 PV1 manifests + 5 receipt bundles (and this PR
review consolidation). SAS9 also cites "(assumption 4)" of the build plan, whose
assumption 4 is actually about serial validators — the plan defines no permitted
change classes at all. Fix: AM5 — SAS9 becomes self-contained: it enumerates the
C1–C7 surfaces plus the PV1 validation-evidence classes
(`docs/validation/<slug>/`, `docs/reviews/task-validate-<slug>-*/`) and the
PR-phase review artifacts (`docs/reviews/pr-review-<slug>-*/`), and drops the
dangling plan citation. The no-change claims (templates, consumer fixtures,
package.json/lockfile) stay.

### A4 — skeleton hardcodes the default specs directory (MED; sol)
Verified: skeleton line 3 says `docs/specs/<date>-<feat>.md` while phase-spec.md
§4 says the Spec's home "routes to the configured `paths.specs`". Fix: the
skeleton preamble names the configured `paths.specs` with `docs/specs/` as the
default. M1 pins markers, not the preamble — no test impact.

### A5 — inventory edit rewrote two unrelated rows (MED/LOW; sol + luna)
Verified in the diff: two tracker-ops assertion strings changed from literal
`—` to `—`, violating C4's "no other row changes". Fix: restore the
literal em dashes.

### A6 — M1 never checks the NFR fill-in row (MED; sol)
Verified: C7 M1 requires "the fill-in table row" among C1's literal
placeholders; the test asserted only the NFR table header and the `unbound`
substring (which the canonical rule sentence also contains). Fix: assert the
complete NFR fill-in row `| <characteristic> | <stimulus or condition> |
<measurable response> | <scenario id, or ...> |` section-locally.

### A7 — t5.json gives the corpus run 300 s; SAS10's budget is 30 s (MED; sol)
Verified: `tests.full` timeoutMs 300000; SAS10 fails any run over 30 s. Fix:
timeout 30000 and the evidence label names SAS10's budget. This mutates the T5
manifest, so the T5 runner + validator + receipt are re-executed after the fix.

### A8 — skeleton has no zero-item convention (MED; sol)
Verified: the preamble says "Fill in every block below; delete none of the
markers", while Vocabulary is conditional and Contracts permits zero interfaces —
a zero-item spec cannot comply. Fix: one preamble sentence declaring the
empty-state convention (`none — <one-line reason>` entry; declared, never
implicit). Preamble is not marker-pinned — no test impact.

### A9 — T1/T2 validator records cite nonexistent `report.json` (LOW; sol + luna)
Verified: only T1/T2 validator.md files carry the wrong path (3 occurrences
each); the bundles contain `runner-report.json`; receipts do not hash
validator.md, so a prose correction is safe without re-validation. Fix: correct
all six occurrences to `runner-report.json`.

### A10 — t5.json lifecycle.declaration evidence label says SAS4 (LOW; deepseek)
Verified: the check is mapped to SAS10 in `categories.scenarios`; the label
copied the wrong scenario id. Fix: label reads SAS10. Folds into the same t5.json
edit as A7; one T5 re-validation covers both.

## REJECT

### R1 — M5's exact-81 row pin is not durable (MED; luna)
C7 M5 mandates the exact count by design ("the inventory contains exactly 81
rows"). The pin is the mechanism, not the defect: a future slice adding a row
amends M5 deliberately, exactly as this slice amended FROZEN/L3 under an
amendment record. The no-other-row-changed invariant already routes to SAS9's
diff inspection (C4's gating split). Durability through deliberate amendment is
the repo's standing pattern.

### R2 — M1's H1 test accepts trailing text (LOW; luna)
False positive: the assertion is `startsWith("# Spec artifact skeleton\n")` —
the `\n` boundary rejects any trailing characters on the heading line
(`# Spec artifact skeleton (wrong)` has a space where the prefix demands `\n`,
so the test fails, as claimed to be required).

## Post-fix obligations

- Full corpus + biome + check-references + check-lifecycle re-run.
- T5 receipt regenerated (manifest changed: A7 + A10): fresh runner report,
  fresh independent validator, fresh receipt.json; old receipt superseded —
  recorded in the bundle.
- Round 2 delta panel over the fix wave before PR open.
