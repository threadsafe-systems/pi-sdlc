# Plan: semantic-release pipeline (v2, release-only after panel split)

- Date: 2026-07-11 (revised)
- Track: **irreversible**. Establishes a public release policy — GitHub
  Releases and semver tags become an external contract — and meets the iron
  law's own test squarely. Plan panel AND spec panel both required.
- Revision: v2. v1 bundled this with biome+CI (reversible tooling); split
  after plan-panel review — see
  `docs/reviews/plan-ci-biome-semantic-release-2026-07-11/consolidated.md`.
  Biome+CI now its own reversible-track plan:
  `docs/plans/2026-07-11-biome-ci.md`.
- Depends on: `docs/plans/2026-07-11-biome-ci.md` (the release workflow
  reuses the same biome check as a safety re-check before releasing) and the
  new **global** skill `~/.pi/agent/skills/conventional-commits/` (personal
  agent config, not part of this repo, mandates Conventional Commits for
  every commit the project owner's agents write, in every repo).
- Brief brainstorm: this session's design conversation with the project
  owner, including live verification of repo state and a corrected
  ADR 0009 reading (see below).

## Objectives

Automate versioning and release publishing from commit history: semantic
version bumps, a generated `CHANGELOG.md`, a git tag, and a **GitHub
Release** on merge to `main` — explicitly no npm publish.

## Rationale

Manual version bumping (`v0.1.0`, `v0.1.1`, hand-edited) doesn't scale and
drifts from what actually shipped. Automated semver from correctly-typed
commit history removes that class of error, once commits are reliably typed
— which is why this plan also scopes in mechanical enforcement of that
typing (see below), not just documentation of it.

## A correction from plan-panel review (kimi-k2.6, high severity, verified)

v1 of this plan claimed "ADR 0009 already recorded git-based distribution as
the deliberate model, explicitly naming registry publishing out of scope."
**That's wrong** — rereading ADR 0009 directly, it records only the
repo-hosting decision (`threadsafe-systems/pi-sdlc`, `skills/sdlc/`,
`package.json` metadata); it never mentions npm, registries, or publishing
scope at all. The "no npm publish" choice is **this session's own new
decision**, not a restatement of an already-locked one — which strengthens,
rather than removes, the case for a dedicated ADR (scoped in below).

## Decisions locked (from this session's design conversation)

- **No npm publish.** `pi-sdlc` has never been published (confirmed: 404 on
  the npm registry) and the README's own distribution story is git-based
  installation. Given ADR 0009 doesn't actually cover this (see correction
  above), this is a fresh decision, recorded in a new ADR, not a reopening
  of a locked one.
- **GitHub Releases** are the release artifact (`@semantic-release/github`).
- **Conventional Commits, enforced globally** — every individual commit,
  including SDLC-phase commits, gets a real conventional-commit type going
  forward, per the new global skill's proposed mapping (`docs(plan):`,
  `feat(hooks):`, etc.). semantic-release's default "scan every commit since
  the last tag" behaviour is used as-is.
- **GitHub Actions**, release on merge to `main`.

## What changed after plan-panel review (all three vendors; see consolidated.md)

1. **DoD now requires a `semantic-release --dry-run`** against this branch's
   actual commit range before merge — unanimous high-severity finding across
   all three reviewers, with glm naming the concrete tool. This closes the
   loop the v1 DoD explicitly (and wrongly) waived: plugin config parsing,
   tag-format match against the existing `v0.1.0`/`v0.1.1` baseline, and
   changelog rendering are all verified pre-merge, not assumed.
2. **Mechanical commit-message enforcement is now in scope**, not just
   documented. Three vendors independently flagged that a personal skill +
   a `CONTRIBUTING.md` doc cannot mechanically stop a malformed commit from
   landing — and kimi named a sharper variant: GitHub's own merge/squash
   commit *title* can itself be non-conventional even when every inner
   commit is correctly typed. A lightweight commit-message CI check
   (exact mechanism — commitlint vs. a small custom script — pinned at spec
   time, kept minimal) now runs on every PR, checking the merge/PR title
   too.
3. **A new ADR is in scope**: release & versioning policy (no npm, GitHub
   Releases, Conventional-Commits-driven semver). Two vendors independently
   caught this project's own ADR trigger applies here and wasn't scoped.
4. **`package.json`'s version-field drift is now stated as the expected
   consequence, not an open question.** `@semantic-release/npm` is the only
   stock plugin that writes that field, and it's deliberately excluded, so
   the field will go stale while tags advance — documented explicitly: tags
   are the version source of truth; `package.json`'s field is
   non-authoritative unless a lightweight bump mechanism is added later
   (deferred, not silently possible).
5. **Bootstrap-sequencing risk is now resolved by the dry-run requirement**
   (item 1) rather than left open: running `--dry-run` against this PR's own
   actual commit range, before merge, answers both "would this PR's own
   landing trigger an unexpected release" and "does semantic-release exit
   clean when nothing is release-eligible" concretely.
6. **Rationale no longer cites an unmerged PR's bug as "observed" history**
   — reworded to state the JSON bug was caught during this session's own
   development (true, still a real motivating example for the sibling
   biome+CI plan), not implied to be sitting in merged history.

## An honest expectation, still true after the split

`v0.1.1` is not at current `main` HEAD — 11 commits (all of PR #1) sit
between the tag and HEAD, none conventional-commit-typed. Confirmed via the
dry-run requirement (item 1 above): the pipeline's first activation will not
retroactively release that already-merged work. The first automated release
fires from whatever lands after this pipeline is live and follows the new
commit convention — verified by dry-run, not assumed.

## An external-contributor gap, now mechanically closed

The global conventional-commits skill is personal to the project owner's
machine. The commit-message CI check (item 2 above) is what actually
enforces the convention for any contributor, with or without that skill —
`CONTRIBUTING.md` remains in scope as the discoverable, human-readable
statement of the same rule, but is no longer the only enforcement mechanism.

## Scope

### In

- `.github/workflows/release.yml`: on push to `main` — `npm ci`, `npm test`,
  biome check (reusing `docs/plans/2026-07-11-biome-ci.md`'s config), then
  semantic-release with a plugin set producing a changelog, git tag, and
  GitHub Release, explicitly omitting `@semantic-release/npm`. Exact plugin
  list/config pinned at spec time against current semantic-release
  documentation (not asserted here — package/plugin specifics drift the
  same way model IDs do, same discipline this project already applies
  there).
- A commit-message CI check (PR-time), validating type-prefix grammar on
  every commit in the PR and the PR/merge title itself.
- `CONTRIBUTING.md`: states the Conventional Commits requirement, documents
  the mechanical check, documents the release-on-merge-to-`main` mechanic.
- README: notes the release policy (GitHub Releases, semver, no npm).
- **New ADR**: release & versioning policy.
- Pre-merge `semantic-release --dry-run` verification (part of the
  implementation/verification step, not just a doc claim).

### Out

- npm publish (a fresh decision, recorded in the new ADR, not a reopening
  of ADR 0009 — which never covered this).
- Rewriting historical commit messages (the ~20 pre-existing commits stay
  as-is; semantic-release only needs correctly-typed commits after the
  `v0.1.1` baseline).
- Any change to the portable `sdlc` skill itself prescribing commit-message
  format to consumer repos — the global skill, the commit-message CI check,
  and this repo's own `CONTRIBUTING.md` carry that requirement here;
  `sdlc`-the-skill stays commit-convention-agnostic for portability.
- A `package.json` version-bump mechanism beyond tags (deferred, named
  explicitly rather than left ambiguous).

## Definition of done

- [ ] Release workflow present, correctly scoped (push to `main` only, no
      npm plugin), **and verified via `semantic-release --dry-run`** against
      this branch's real commit range before merge — plugin config parses,
      tag format matches `v0.1.0`/`v0.1.1`, changelog renders.
- [ ] Commit-message CI check present, AND wired into `main`'s branch
      protection `required_status_checks.contexts` (a reported-but-not-
      required check does not block a merge — spec-panel finding, two
      independent reviewers; see spec §10 item 2 and SR11) — verified by a
      deliberately malformed commit/PR-title actually showing the PR as
      `BLOCKED`, not just red.
- [ ] New ADR committed: release & versioning policy.
- [ ] `CONTRIBUTING.md` states the commit convention and the mechanical
      check, independent of any personal global skill.
- [ ] README updated with the release policy.
- [ ] `npm test` green; no regression to the 33 existing tests.
- [ ] Existing tags respected; no version-numbering conflict (verified by
      the dry-run, not assumed).

## Context for the next agent

- Depends on `docs/plans/2026-07-11-biome-ci.md` landing first (or at least
  being spec'd in parallel) for the shared biome check.
- Spec must pin: the exact semantic-release plugin list and config shape;
  the exact GitHub Actions permissions block (`contents: write` at minimum;
  confirm whether default `GITHUB_TOKEN` suffices or a PAT is needed); the
  commit-message check's exact mechanism (commitlint vs. custom script).
- Sequencing note for the project owner: PR #2 (brainstorm persona) and
  PR #3 (thinking levels) are both green and unmerged as of this plan.
  Worth deciding merge order before spec/implement on either split plan.
