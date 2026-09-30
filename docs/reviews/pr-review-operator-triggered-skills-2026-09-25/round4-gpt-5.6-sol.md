### Ancestor manifest can silently bypass an adopted nested repository

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 179-196
- problem: Implicit root resolution can select a filesystem manifest above a nested repository before Git discovery, while `provablyOutsideGit` checks only that selected ancestor. An adopted nested repository whose active manifest is deleted can therefore become silent `not-adopted`.
- repro_or_impact: With `outer/.pi/sdlc/sdlc.config.json` outside Git and `outer/repo` containing a committed manifest subsequently deleted, running from `outer/repo` returns root `outer`, `git.repository:fail`, exit 1. Removing the outer manifest correctly resolves `outer/repo` and returns exit 3; under `skills/sdlc/SKILL.md:36-39`, the former result silently bypasses the lifecycle.

### Common-directory Git repositories evade the filesystem proof

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 82-86
- problem: `looksLikeGitDir` requires `HEAD`, `objects`, and `refs` to be colocated, but valid linked-worktree or split Git directories can carry `HEAD` plus a `commondir` file pointing to shared objects and refs. Such a repository is falsely proven absent.
- repro_or_impact: A directory containing `HEAD` and `commondir` pointing to a valid bare common directory passes `git -C <dir> rev-parse --git-dir --git-common-dir --is-bare-repository`, but `sdlc-status --repo-root <dir>` returns exit 1 instead of the promised bare-repository error. The kernel then silently continues outside the lifecycle.

### README gives contradictory non-Git exit codes

- severity: medium
- confidence: high
- origin: NEW
- file: README.md
- line: 68-70
- problem: The migration section says non-Git roots move to exit 2, contradicting the new exit-1 behavior documented at lines 51-53 and implemented by this change. `test/docs.test.js:159` actively pins the obsolete statement.
- repro_or_impact: A caller following the migration guidance will implement the wrong branch for non-Git roots; running `sdlc-status` in a fresh directory now exits 1.

### Disposition ledger denies its recorded replacements

- severity: low
- confidence: high
- origin: NEW
- file: docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
- line: 138-141
- problem: The “Intentionally replaced” section says none were replaced and every statement was retained or moved, while rows S05, S10, and S11 at lines 37 and 42-43 are explicitly `replaced`.
- repro_or_impact: The audit ledger gives mutually exclusive answers about whether baseline rules were intentionally removed.

### Build plan still describes a one-task, prose-only change

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills-build.md
- line: 12-20
- problem: The decomposition rationale still says “One task” and “Every edit is prose,” although the amended plan contains T1 and T2 and T2 changes executable code.
- repro_or_impact: Readers cannot trust the governing rationale to describe the current decomposition or implementation risk.

### Plan amendment reintroduces review-round provenance

- severity: low
- confidence: high
- origin: REOPENED(PR-R2-05)
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 182-184
- problem: The new amendment cites specific PR-panel finding IDs, reintroducing the process provenance removed for PR-R2-05. This evidence was added in commit `96f755c`, after the earlier disposition.
- repro_or_impact: The governing plan now depends on review-run history rather than stating only the durable behavioral trigger.