### Redirected worktrees are misclassified as not-adopted

- severity: high
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 65-93
- problem: `provablyOutsideGit` only rejects `$GIT_DIR` and filesystem `.git` markers; it ignores `GIT_WORK_TREE` and `core.worktree`, which can govern a worktree outside the repository tree.
- repro_or_impact: With a committed manifest deleted from the working tree, running from the repository with `GIT_WORK_TREE=<external-dir>` (or configuring `core.worktree` likewise) returns `not-adopted`/exit 1 instead of error. The kernel then silently bypasses lifecycle enforcement.

### README migration guidance still prescribes the obsolete non-git exit code

- severity: medium
- confidence: high
- origin: NEW
- file: README.md
- line: 68-70
- problem: The migration section says non-git roots move to exit 2, while the new status implementation returns `git.repository:fail`, `not-adopted`, exit 1 (skills/sdlc/scripts/sdlc-status.mjs:196-198, 343-347). `test/docs.test.js:134-159` also requires this obsolete wording.
- repro_or_impact: Callers following the README will treat a normal non-git result as an error and may stop instead of continuing; the stale test assertion falsely validates the contradiction.