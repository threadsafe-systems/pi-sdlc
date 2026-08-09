# PR review prompt — wave 1

Review commit `763706b6871e3508f5066e52b208d6ae3a4da1d5` against base
`a3f62c7ddc8697fd3712f18e241296de5df2d312` using
`/tmp/spike-exit-rule-pr.diff`.

- Track: irreversible.
- Governing documents:
  `docs/plans/2026-08-09-spike-exit-rule.md`,
  `docs/specs/2026-08-09-spike-exit-rule.md`, and
  `docs/plans/2026-08-09-spike-exit-rule-build.md`.
- Named review input: `/tmp/spike-exit-rule-pr-body.md`, especially its
  Assumptions & discretionary calls section.
- Review the full changed files and verify load-bearing claims against the
  committed blob.
- Preserve the Spec's no-parser/no-new-machinery constraints and existing gate
  invariants.
- Check every carry, especially SER14's required issue #245 and committed PR
  landing record.
- Apply SER13's guidance inspection without launching an extra reviewer; emit at
  most one checklist finding if defective.
- Return only the stamped adversary-review prompt's strict findings format,
  grounded in repository-relative file and line evidence.
