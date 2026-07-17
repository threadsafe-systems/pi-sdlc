# PR review prompt: config-versioning-migration

- Repo: `/home/neil/code/threadsafe/pi-sdlc.worktrees/feat-config-versioning-migration`
- Initial commit: `7ad1fa69dc42c2c5c4d29ef32c8ec2ea168cbfd8`
- Fixed commits: `216d2119d9d60fc31cbf97c6770d354326eeab06`, `3d925c68e723d69190c7355cc02c38d06d4881e5`
- Diff: `git diff main...<commit>`
- Track: irreversible
- Governing documents:
  - `docs/plans/2026-07-16-config-versioning-migration.md`
  - `docs/specs/2026-07-16-config-versioning-migration.md`
  - `docs/plans/2026-07-16-config-versioning-migration-build.md`
- Constraints: no consumer-owned data loss; preserve types and OL-A lifecycle semantics; detection-only shared loader; zero effective-panel change; offline determinism; FS5/FS10 machine stdout purity; strict-mode conservation; independent integer schemaVersion.

Reviewers used the project-scoped `pi-sdlc-pr-review` agent stamped verbatim from `skills/sdlc/prompts/adversary-review.prompt.md`. Each reviewer was instructed to read committed blobs, cite file and line evidence, return findings only, and verify fixes against actual code rather than author replies.
