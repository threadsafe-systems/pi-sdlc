### R2-A1 — SAS9 omits the slice specification (docs/specs/2026-08-08-spec-artifact-skeleton.md:46-49,280-284)

- verdict: RESOLVED
- evidence: Commit `748c998` adds AM6 with the exact specification path, cites R2-A1 as authority, and updates SAS9’s When–Then to include that path before retaining “and nothing else.”
- evidence: The full 48-file branch diff maps completely to SAS9’s ten classes:
  1. New skeleton: `skills/sdlc/references/spec-artifact-skeleton.md`.
  2. `phase-spec.md` §4: `skills/sdlc/references/phase-spec.md`.
  3. Deliberately-unfrozen prompt: `skills/sdlc/prompts/adversary-spec.prompt.md`.
  4. Inventory row: `skills/sdlc/assets/normative-references.json`.
  5. Two named tests: `test/frozen-surfaces.test.js`, `test/iteration-disposition.test.js`.
  6. New contract test: `test/spec-artifact-skeleton.test.js`.
  7. PV1 manifests: `docs/validation/spec-artifact-skeleton/t1.json`, `t2.json`, `t3.json`, `t4.json`, `t5.json`.
  8. Task receipts: `generated-agent.md`, `manifest.json`, `receipt.json`, `runner-report.json`, and `validator.md` under each of `docs/reviews/task-validate-spec-artifact-skeleton-t1-2026-08-08/` through `t5-2026-08-08/` (25 files).
  9. PR-review artifacts: `adjudication.md`, `adjudication-round2.md`, `round1.md`, `round1-sol.md`, `round1-luna.md`, `round1-deepseek.md`, `round2.md`, `round2-sol.md`, `round2-luna.md`, and `round2-deepseek.md` under `docs/reviews/pr-review-spec-artifact-skeleton-2026-08-08/`.
  10. Slice specification: `docs/specs/2026-08-08-spec-artifact-skeleton.md`.
- evidence: `git diff --name-only $(git merge-base main HEAD)...HEAD` reported 48 files with zero unmatched. The round-3 delta contains only five round-2 review records and the specification amendment; no test moved. `/tmp/s1-pr-round3.diff` is byte-identical to `git diff eecc239..748c998` (275 lines), `git diff --check` passed, and the index is empty. `npm test` passed 556/556 in 8.15 seconds.

### NEW DEFECTS

none found