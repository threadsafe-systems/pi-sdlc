# Contributing to pi-sdlc

## Commit messages: Conventional Commits (required, enforced)

Every commit in this repository follows [Conventional
Commits](https://www.conventionalcommits.org/):

    <type>(<optional scope>)<optional !>: <description>

`type` is one of: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`,
`test`, `build`, `ci`, `chore`, `revert`. `scope` is optional and lowercase.
A `!` before the colon, or a `BREAKING CHANGE:` footer, signals a breaking
change.

This is functional, not stylistic: releases are automated and the commit
`type` drives the version bump and the changelog (`feat` → minor, `fix` →
patch, a breaking-change signal → major; `docs`/`chore`/`ci`/`test`/
`refactor`/`style`/`build` produce no release).

### It is mechanically checked

A CI check (`commit-lint`) runs on every pull request. It validates the
Conventional-Commits header grammar on **every commit in the PR** and on the
**PR title itself** — because the PR/merge title can become the squash-commit
message. A non-conventional commit or PR title fails the check and blocks the
merge. Fix commit messages with `git commit --amend` / `git rebase -i` and
update the PR title in the GitHub UI.

## Releases

Merging to `main` runs the `release` workflow: it computes the next semantic
version from the commit history since the last tag, updates `CHANGELOG.md`,
creates a `v<version>` git tag, and publishes a GitHub Release. There is **no
npm publish** — pi-sdlc is distributed as a git package (see
`docs/adr/0009-distribution-model.md` and
`docs/adr/0012-release-versioning-policy.md`). The git tag is the version
source of truth; a merge that contains only non-releasing commit types
produces no release, and that is expected.
