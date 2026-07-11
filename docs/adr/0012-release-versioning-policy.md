# ADR 0012: release & versioning policy — GitHub Releases, no npm publish

- Context: pi-sdlc versioning was manual (`v0.1.0`, `v0.1.1`, hand-set
  `package.json` `version`), which drifts from what actually shipped. Adopting
  semantic-release automates semver bumps, a `CHANGELOG.md`, git tags, and a
  release artifact from commit history — but doing so freezes a **public
  release contract** (external consumers bind to the tag/version scheme and to
  the release channel), which forces a deliberate choice of channel and
  authority. Two facts shape that choice: pi-sdlc has never been published to
  npm (confirmed: 404 on the registry) and its distribution story is git-based
  installation (ADR 0009). ADR 0009 records only the repo-hosting decision
  (`threadsafe-systems/pi-sdlc`, `skills/sdlc/`, `package.json` metadata,
  MIT) — it never mentions npm, registries, or publishing scope, so the
  "how do we release, and where" question is genuinely undecided until now.
  This decision meets the ADR trigger on all three counts: hard to reverse
  (a public release channel and version scheme), surprising without context
  (a Node package that deliberately never publishes to npm and whose
  `package.json` `version` goes stale on purpose), and a real trade-off
  (release ergonomics vs. registry reach; automation vs. a stale version
  field).
- Decision:
  - **No npm registry publish.** This is a fresh decision recorded here, not
    a restatement of ADR 0009 (which does not cover it). semantic-release runs
    **without** `@semantic-release/npm`; the pipeline never runs `npm publish`
    and holds no registry token.
  - **GitHub Releases are the release artifact**, created by
    `@semantic-release/github`, on merge to `main`.
  - **Conventional-Commits-driven semver** is the versioning source:
    `@semantic-release/commit-analyzer` computes the bump (`feat` → minor,
    `fix` → patch, a breaking-change signal → major; documentation/chore/ci/
    test/refactor/style/build types produce no release) and
    `@semantic-release/release-notes-generator` +
    `@semantic-release/changelog` render `CHANGELOG.md`, committed back to
    `main` by `@semantic-release/git`.
  - **Git tags (`v${version}`) are the version source of truth.**
    `package.json`'s `version` field is **non-authoritative**: because
    `@semantic-release/npm` is excluded (the only stock plugin that writes
    that field), the field stays at its last hand-set value while tags
    advance. A `package.json`-bump mechanism is deferred, not silently
    possible.
  - Commit-message discipline is enforced mechanically by a lightweight CI
    check (custom script) on every PR, validating the Conventional-Commits
    header grammar on each non-merge commit and on the PR/merge title itself.
- Consequences: releases become automatic, correctly-versioned, and traceable
  to typed commit history, removing a class of manual-bump error. The honesty
  costs are explicit: (1) `package.json` `version` drifts from the real
  released version by design — consumers and tooling must read git tags /
  GitHub Releases, not the field; (2) the release depends on commit types
  being correct, which the CI check enforces but which still requires authors
  (and merge/squash titles) to follow the convention; (3) `main`'s branch protection (a GitHub ruleset requiring one approving
  review, bypassable only by `OrganizationAdmin`) does not cover the default
  `GITHUB_TOKEN`'s `github-actions[bot]` identity, so committing
  `CHANGELOG.md` back to `main` needed a resolution beyond the default token:
  a fine-grained PAT (`RELEASE_PAT`, `Contents: Read and write` on this repo
  only, owned by the bypassed account) authenticates both the changelog push
  and the Release creation — see the spec's §2.3 for the full mechanism.
  Reversal (adding npm publish later) remains additive — re-introduce
  `@semantic-release/npm` and a registry token — but is a new, deliberate
  decision, not a default.
