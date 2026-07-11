# Spec: semantic-release pipeline (GitHub Releases, no npm publish)

- Date: 2026-07-11
- Track: **irreversible**. Implements the approved plan
  `docs/plans/2026-07-11-semantic-release.md` (v2, plan-panel reviewed —
  adjudication in
  `docs/reviews/plan-ci-biome-semantic-release-2026-07-11/consolidated.md`).
  Establishes a public release contract (semver git tags + GitHub Releases),
  so the spec panel is required before implementation.
- Author vendor: anthropic (excluded from panels).
- Depends on: `docs/plans/2026-07-11-biome-ci.md` (sibling reversible-track
  plan) for the shared biome check the release workflow re-runs as a safety
  gate, and for main-branch protection. That plan's spec/implementation is
  **not** committed in this worktree yet — see the open questions (§10).
- Live-verification discipline (normative): every package version, plugin
  name, config key, and permission string in this spec was verified against
  the live npm registry and the plugins' published READMEs on 2026-07-11 (see
  §8 evidence), not from model memory — the same discipline this project
  applies to model IDs.
- Scope note: this spec **pins** the exact artifacts (`.releaserc`,
  `release.yml`, the commit-message check, `CONTRIBUTING.md`, the README
  section) as normative code blocks. It does **not** create those files —
  implementation follows spec-panel approval. The one exception, created as a
  real committed file alongside this spec, is the ADR
  `docs/adr/0012-release-versioning-policy.md`, because this project's SDLC
  law (`skills/sdlc/SKILL.md`, "## ADRs") says a hard-to-reverse decision is
  written to `docs/adr/` immediately, not only stated in the artifact that
  triggered it. The decision it records was already locked by the plan panel.

## 0. Overview

Automate versioning and release publishing from commit history on merge to
`main`: compute the next semver from Conventional-Commits, render/commit
`CHANGELOG.md`, create the `v${version}` git tag, and publish a **GitHub
Release** — with **no npm registry publish** (locked; ADR 0012). Two
enforcement surfaces make the pipeline correct rather than merely present:

1. **`.releaserc.json`** — the pinned plugin set and config (§1), explicitly
   omitting `@semantic-release/npm`.
2. **`.github/workflows/release.yml`** — push-to-`main` trigger, least
   permissions, default `GITHUB_TOKEN` (§2).
3. **`.github/workflows/commit-lint.yml`** + `scripts/check-commit-messages.mjs`
   — a lightweight custom PR-time check of the Conventional-Commits header
   grammar on every non-merge commit **and the PR title itself** (§3).
4. **ADR 0012** — release & versioning policy (§4, and the committed file).
5. **`CONTRIBUTING.md`** (§5) and a **README release-policy section** (§6).

Non-authoritative-`package.json`-version stance is pinned in §7. Falsifiable
verification scenarios (SR1–SR10) are in §9.

## 1. Contract: `.releaserc.json` (pinned, normative)

Verified live (2026-07-11): `semantic-release` latest is **25.0.6**
(`npm view semantic-release version`), engine
`node: ^22.14.0 || >= 24.10.0`. semantic-release core **bundles** these
plugins as dependencies (so they need no separate install):
`@semantic-release/commit-analyzer@^13.0.1`,
`@semantic-release/release-notes-generator@^14.1.0`,
`@semantic-release/github@^12.0.0`, **and `@semantic-release/npm@^13.1.1`**
(bundled but deliberately unused). Not bundled — must be added:
`@semantic-release/changelog@6.0.3`, `@semantic-release/git@10.0.1`.

The default plugin list (when `plugins` is omitted) is `commit-analyzer,
release-notes-generator, npm, github` — i.e. it **would** publish to npm.
Pinning `plugins` explicitly is therefore required to (a) exclude npm and
(b) add changelog + git.

### 1.1 The file (`.releaserc.json` at repo root)

```json
{
  "branches": ["main"],
  "tagFormat": "v${version}",
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    ["@semantic-release/changelog", {
      "changelogFile": "CHANGELOG.md"
    }],
    ["@semantic-release/github", {
      "successComment": false,
      "failComment": false,
      "failTitle": false,
      "releasedLabels": false
    }],
    ["@semantic-release/git", {
      "assets": ["CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }]
  ]
}
```

### 1.2 Pin rationale (each key defensible to the panel)

- **`branches: ["main"]`** — release only from `main`. semantic-release
  validates configured release branches exist on the remote (confirmed via
  the `ERELEASEBRANCHES` error hit during §8 evidence gathering).
- **`tagFormat: "v${version}"`** — this is also the semantic-release default,
  pinned explicitly so it is auditable against the existing `v0.1.0`/`v0.1.1`
  baseline. Core (not a plugin) creates and pushes the tag. Verified in §8:
  a probe `feat:` commit yields the would-be tag `v0.2.0`.
- **`@semantic-release/commit-analyzer` + `@semantic-release/release-notes-generator`**
  — default Angular/conventionalcommits preset: `feat` → minor, `fix` →
  patch, `feat!`/`BREAKING CHANGE:` → major; `docs`/`chore`/`ci`/`test`/
  `refactor`/`style`/`build` with no breaking marker → **no release**. This
  is what makes the bootstrap safe (SR1) and matches the global
  conventional-commits skill's mapping.
- **`@semantic-release/changelog` with `changelogFile: "CHANGELOG.md"`** —
  writes/prepends the rendered notes to a repo-committed `CHANGELOG.md`
  (the plan's named deliverable). Not bundled; add as a devDependency.
- **`@semantic-release/github`** — publishes the GitHub Release (the release
  artifact per the plan). Comments/labels are **disabled**
  (`successComment: false, failComment: false, failTitle: false,
  releasedLabels: false`) so the workflow needs only `contents: write` (see
  §2.2). This is the tight-token default; the alternative (leave defaults on,
  broaden permissions) is stated in §2.3 for the panel to weigh.
- **`@semantic-release/git` with `assets: ["CHANGELOG.md"]` and the
  `[skip ci]` message** — commits the updated `CHANGELOG.md` back to `main`
  so the file stays current in the tree. `assets` is pinned to
  `["CHANGELOG.md"]` (not the plugin default
  `['CHANGELOG.md','package.json','package-lock.json','npm-shrinkwrap.json']`,
  verified live) so it **cannot** touch `package.json` even accidentally.
  The `[skip ci]` message keyword is the plugin default (verified live) and
  prevents the changelog commit from re-triggering CI. Not bundled; add as a
  devDependency. **Interaction risk with branch protection: see §10.**

### 1.3 devDependency additions (pinned)

Add to `package.json` `devDependencies` (semver-caret, matching the live
latest verified 2026-07-11):

```json
"semantic-release": "^25.0.6",
"@semantic-release/changelog": "^6.0.3",
"@semantic-release/git": "^10.0.1"
```

`commit-analyzer`, `release-notes-generator`, and `github` arrive transitively
with `semantic-release` (bundled) and are not listed separately (minimal
footprint). No runtime (non-dev) dependency is added; the shipped skill's
zero-runtime-dep posture (hooks spec NFR1) is unchanged.

## 2. Contract: `.github/workflows/release.yml` (pinned, normative)

### 2.1 The file

```yaml
name: release

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
          persist-credentials: false
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
      - run: npm ci
      - run: npm test
      # Biome safety re-check — reuses the sibling biome-ci plan's config.
      # Kept as an explicit step; exact invocation pinned by that plan (§10).
      - run: npx --no-install biome ci .
      - run: npx --no-install semantic-release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2.2 Permissions — verified precisely (answers plan item 2)

`@semantic-release/github`'s published README (verified live 2026-07-11)
states the **minimum required permissions** for the default `GITHUB_TOKEN`:

- `contents: write` — to publish a GitHub Release (and, for us, to push the
  tag and the `@semantic-release/git` changelog commit).
- `issues: write` — **only** to comment on released issues.
- `pull-requests: write` — **only** to comment on released pull requests.

Because §1.1 **disables** all issue/PR commenting and labelling
(`successComment/failComment/failTitle/releasedLabels: false`), the
issues/pull-requests scopes are not exercised, so the pinned workflow grants
**`contents: write` only** — the true minimum for this plugin set. The
top-level `permissions:` block is set explicitly (default-deny for every
other scope).

### 2.3 Default `GITHUB_TOKEN` vs. PAT — verified precisely (answers plan item 2)

The default `GITHUB_TOKEN` **suffices**; no PAT is needed for this plugin set.
Verified against the github plugin README's GitHub Actions note: the default
token can publish releases. Its documented limitation — releases made with
`GITHUB_TOKEN` do **not** trigger further workflow `release` events — is
irrelevant here (no downstream release-triggered workflow exists) and is in
fact desirable, and it compounds with `[skip ci]` to guarantee the changelog
commit cannot loop the pipeline. A PAT would only become necessary if a
future workflow needed to fire on the created release, or if main-branch
protection forbids the changelog push without a bypass actor (§10) — neither
is adopted here. `persist-credentials: false` on checkout avoids leaving the
Actions token in the git remote; semantic-release authenticates via the
`GITHUB_TOKEN` env var it reads directly.

## 3. Contract: commit-message CI check (pinned, normative)

### 3.1 Mechanism decision — custom script over commitlint (answers plan item 3)

**Chosen: a small custom Node script**, not commitlint. Reasoning for the
panel to scrutinise:

- **Consistency with this repo's established pattern.** pi-sdlc deliberately
  hand-rolls its JSON-Schema validation in `skills/sdlc/scripts/lib.mjs` to
  hold a zero-runtime-dependency posture (hooks spec NFR1). A ~40-line regex
  check is the same discipline; `@commitlint/cli` +
  `@commitlint/config-conventional` pull a substantial transitive tree for a
  check whose entire requirement is one header-line grammar.
- **The requirement is narrow and fixed.** We validate exactly the type-prefix
  header grammar over the fixed vocabulary the global conventional-commits
  skill pins (`feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert`).
  We do not need commitlint's body/footer parsing, header-length rules, or
  configurable rule sets.
- **The PR/merge title is a first-class input.** The kimi-sourced plan finding
  is that GitHub's merge/squash commit *title* can be non-conventional even
  when every inner commit is typed (real precedent in this very repo: PR #1
  landed as the merge commit `sdlc: repo opt-in + local workflow hooks (#1)`
  — non-conventional). The PR title arrives as a workflow context value; a
  custom script reads it from an env var trivially, whereas commitlint would
  need it piped in anyway. One script covers both commits and the title with
  identical grammar.
- **Honest tradeoff (stated, not hidden).** A regex header check is less
  rigorous than commitlint's full parser — it does not validate
  `BREAKING CHANGE:` footer formatting or body structure. That is acceptable
  because the only thing that must be correct for semantic-release to compute
  the right bump is the header type-prefix, which is exactly what this checks;
  the `!` breaking marker is validated, and `BREAKING CHANGE:` footers remain
  a documented author responsibility (CONTRIBUTING §5).

### 3.2 What it validates (grammar, pinned)

The header line (first line of a commit subject, or the PR title) must match:

```
^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9][a-z0-9._-]*\))?(!)?: .+
```

- **type** — required, one of the fixed vocabulary (nothing else).
- **scope** — optional, parenthesised, lowercase, non-empty when present.
- **`!`** — optional breaking-change marker, allowed immediately before `:`.
- **`:` + description** — required separator and a non-empty description.

Applied to:

1. **Every non-merge commit** in the PR range (`git log --no-merges
   <base>..<head>` subjects). Merge commits (`Merge …`) are excluded — they
   are not authored subjects and are not release-relevant.
2. **The PR title itself** (`github.event.pull_request.title`) — covers the
   squash/merge-title failure mode regardless of merge strategy.

Exit non-zero listing every offending subject/title if any fail; exit zero
otherwise. No network, no model call, no runtime dependency (pure Node +
`git`).

### 3.3 The files (pinned)

`scripts/check-commit-messages.mjs` (Node, ESM — matches the repo's
`"type": "module"`):

```js
#!/usr/bin/env node
// Validates the Conventional Commits header grammar for a set of subjects.
// Usage: node scripts/check-commit-messages.mjs
//   Env: PR_TITLE          (optional) the pull-request title to check
//        COMMIT_RANGE       (optional) e.g. "origin/main..HEAD"; default HEAD~1..HEAD
import { execSync } from "node:child_process";

const TYPES = ["feat","fix","docs","style","refactor","perf","test","build","ci","chore","revert"];
const HEADER = new RegExp(`^(${TYPES.join("|")})(\\([a-z0-9][a-z0-9._-]*\\))?(!)?: .+`);

function subjectsInRange(range) {
  const out = execSync(`git log --no-merges --format=%s ${range}`, { encoding: "utf8" });
  return out.split("\n").map((s) => s.trim()).filter(Boolean);
}

const range = process.env.COMMIT_RANGE || "HEAD~1..HEAD";
const failures = [];
for (const subject of subjectsInRange(range)) {
  if (!HEADER.test(subject)) failures.push(`commit: ${subject}`);
}
const prTitle = (process.env.PR_TITLE || "").trim();
if (prTitle && !HEADER.test(prTitle)) failures.push(`PR title: ${prTitle}`);

if (failures.length) {
  console.error("Non-conventional commit header(s) found:\n" + failures.map((f) => "  - " + f).join("\n"));
  console.error(`\nExpected: <type>(<scope>)!: <description>  (type ∈ ${TYPES.join(", ")})`);
  process.exit(1);
}
console.log("All commit headers and the PR title follow Conventional Commits.");
```

`.github/workflows/commit-lint.yml`:

```yaml
name: commit-lint

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

permissions:
  contents: read

jobs:
  commit-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: actions/setup-node@v4
        with:
          node-version: "24"
      - run: node scripts/check-commit-messages.mjs
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
          COMMIT_RANGE: origin/${{ github.event.pull_request.base.ref }}..HEAD
```

`types: [... edited ...]` ensures a later PR-title edit re-runs the check.
`fetch-depth: 0` gives the base ref for the range diff.

## 4. Contract: ADR 0012 (committed file — see §-note in header)

`docs/adr/0012-release-versioning-policy.md` is created as a real file with
this spec (rationale in the header note). It records, in this repo's
Context/Decision/Consequences format (per `docs/adr/README.md`, trigger =
hard to reverse ∧ surprising without context ∧ a real trade-off — all three
hold for a public release contract):

- **No npm publish** as a **fresh** decision (ADR 0009 covers only
  repo-hosting; verified by rereading it — it never mentions npm/registries),
  not a restatement.
- GitHub Releases + `v${version}` tags as the release artifact.
- Conventional-Commits-driven semver as the versioning source.
- `package.json`'s version field is non-authoritative (see §7).

## 5. Deliverable: `CONTRIBUTING.md` content (pinned, drafted inline)

Decision: **drafted inline here** (not created as a file) — it is an
implementation artifact produced after spec approval. The implementer writes
this exact content to `CONTRIBUTING.md` at repo root:

```markdown
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
```

## 6. Deliverable: README release-policy section (pinned, drafted inline)

Decision: **drafted inline here** (not applied to `README.md`). The
implementer inserts this section into `README.md` immediately before the
`## Licence` section:

```markdown
## Releases & versioning

Releases are automated with
[semantic-release](https://semantic-release.gitbook.io/). Merging to `main`
computes the next [semantic version](https://semver.org/) from the
[Conventional Commits](https://www.conventionalcommits.org/) since the last
tag, updates `CHANGELOG.md`, tags `v<version>`, and publishes a **GitHub
Release**. There is **no npm publish** — pi-sdlc is installed as a git package
(see `## Install`). Git tags are the version source of truth; `package.json`'s
`version` field is not automatically bumped and is not authoritative. Commit
messages must follow Conventional Commits and are checked in CI — see
`CONTRIBUTING.md`.
```

## 7. Contract: `package.json` version field is non-authoritative (answers plan item 5)

**Definitively verified (not assumed):** without `@semantic-release/npm`,
semantic-release does **not** touch `package.json`'s `version` field.
`@semantic-release/npm` is the only stock plugin that writes that field, and
it is deliberately excluded (§1). Additionally, `@semantic-release/git`'s
`assets` is pinned to `["CHANGELOG.md"]` (§1.2), so even the changelog commit
cannot include `package.json`. Confirmed empirically in §8: a full dry-run
left `package.json` at `0.1.1` unchanged.

**Pinned stance:** git tags (`v${version}`) are the single version source of
truth. `package.json`'s `version` field will remain at its last hand-set value
(`0.1.1`) while tags advance, and is explicitly **non-authoritative**. A
`package.json`-bump mechanism (e.g. a later minimal plugin/script) is
**deferred, not silently possible** — adding one is a future decision, out of
scope here.

## 8. Dry-run evidence (gathered 2026-07-11 on branch `feat/semantic-release`)

Method: installed `semantic-release@25`, `@semantic-release/changelog@6`,
`@semantic-release/git@10` with `npm install --no-save` (node_modules is
gitignored; `package.json` untouched), and ran
`npx semantic-release --dry-run --no-ci` with a temporary, uncommitted config
using the version+changelog plugin subset (the `github`/`git` plugins'
`verifyConditions` require a live `GITHUB_TOKEN` + network and are exercised
in CI, not locally). Version computation, tag format, changelog rendering, and
bootstrap behaviour are all local-verifiable and were verified. The temp
config and any generated `CHANGELOG.md` were removed and the branch reset to
its pre-probe HEAD; `git status` is clean.

**Live version facts** (`npm view`, 2026-07-11):
`semantic-release@25.0.6` (engine `node ^22.14.0 || >=24.10.0`);
`commit-analyzer@13.0.1`, `release-notes-generator@14.1.1`, `changelog@6.0.3`,
`git@10.0.1`, `github@12.0.9`.

**Scenario 1 — bootstrap proof (current HEAD, all non-releasing commits):**

```
ℹ  Found git tag v0.1.1 associated with version 0.1.1 on branch feat/semantic-release
ℹ  Found 12 commits since last release
ℹ  Analysis of 12 commits complete: no release
ℹ  There are no relevant changes, so no new version is released.
(exit 0)
```

→ Confirms the pipeline's first activation does **not** retroactively release
the 11 pre-existing non-conventional commits since `v0.1.1` (plus the one
`docs(plan):` commit, which is correctly non-releasing), and exits **clean**
(0), not fail-loud. Answers both bootstrap questions the plan raised.

**Scenario 2 — version + tag + changelog (probe `feat:` + `fix:` commits):**

```
ℹ  Found git tag v0.1.1 associated with version 0.1.1 on branch feat/semantic-release
ℹ  Found 14 commits since last release
ℹ  Analysis of 14 commits complete: minor release
ℹ  The next release version is 0.2.0
ℹ  Release note for version 0.2.0:
### Bug Fixes
    * **cli:** probe patch-level change ... (dcf4c34)
### Features
    * **release:** probe commit to exercise version + changelog ... (e319679)
```

→ Confirms: `feat` → minor bump from the `v0.1.1` baseline → next version
`0.2.0`; would-be tag `v0.2.0` matches `tagFormat: "v${version}"` and the
existing `v0.1.0`/`v0.1.1` convention; release notes render with sectioned
Features/Bug Fixes and the descriptions verbatim.

**Config-parse / no-npm:** both dry-runs loaded the pinned plugin config
without error under semantic-release 25.0.6; `@semantic-release/npm` was never
in the resolved plugin set; `package.json` `version` stayed `0.1.1`.

## 9. Verification scenarios (stable ids; falsifiable)

- **SR1 (bootstrap, dry-run):** `semantic-release --dry-run` against the real
  commit range since `v0.1.1` where no commit is a releasing type reports "no
  release" / "no new version is released" and exits 0. Falsify: any version
  computed, a retroactive release proposed, or a non-zero exit.
  *(Evidenced §8 Scenario 1.)*
- **SR2 (version + tag + changelog, dry-run):** with a releasing commit
  present, the dry-run computes the correct semver from `v0.1.1` (`feat` →
  `0.2.0`; `fix` → `0.1.2`; breaking → `1.0.0`), the would-be tag matches
  `v${version}`, and release notes render the commit descriptions. Falsify:
  wrong bump, tag not `v<semver>`, or empty/garbled notes.
  *(Evidenced §8 Scenario 2.)*
- **SR3 (config parses, no npm, no package.json write):** the pinned
  `.releaserc.json` loads under semantic-release 25 with no error; the
  resolved plugin set contains commit-analyzer, release-notes-generator,
  changelog, github, git and does **not** contain `@semantic-release/npm`; a
  full dry-run leaves `package.json` `version` unchanged. Falsify: load error,
  npm plugin resolved, or `version` mutated. *(Evidenced §8.)*
- **SR4 (commit check blocks a malformed commit):** on a PR whose range
  contains a commit subject violating the §3.2 grammar (e.g. `updated stuff`),
  `check-commit-messages.mjs` exits non-zero naming that subject; on an
  all-conventional range it exits 0. Falsify: malformed accepted, or valid
  rejected.
- **SR5 (commit check blocks a malformed PR/merge title):** with
  `PR_TITLE="Big update"` (non-conventional) the check exits non-zero even
  when every commit in the range is conventional; with a conventional
  `PR_TITLE` it exits 0. Falsify: a non-conventional title accepted.
- **SR6 (workflow trigger + least permission):** `release.yml` triggers only
  on `push` to `main`, declares top-level `permissions: contents: write` (and
  no broader scope), and references no PAT secret (only `secrets.GITHUB_TOKEN`).
  Falsify: any other trigger ref, missing/looser `contents` scope, a PAT
  secret referenced, or a missing `permissions` block.
- **SR7 (no registry publish path):** grep across `.releaserc.json` and both
  workflows finds no `@semantic-release/npm`, no `npm publish`, and no
  `NPM_TOKEN`/`NODE_AUTH_TOKEN`; `package.json` gains no `publishConfig` and
  no `publish`-ing script. Falsify: any publish path present.
- **SR8 (ADR present & correct):** `docs/adr/0012-release-versioning-policy.md`
  exists, uses Context/Decision/Consequences, records no-npm as a **fresh**
  decision (not a restatement of ADR 0009), and names GitHub Releases +
  Conventional-Commits-driven semver. Falsify: missing, wrong format, or
  framed as a restatement of 0009.
- **SR9 (docs deliverables):** `CONTRIBUTING.md` exists and states the
  Conventional-Commits requirement, the mechanical `commit-lint` check, and
  the release-on-merge-to-`main` mechanic; `README.md` carries the
  `## Releases & versioning` section including "no npm" and "tags are the
  source of truth". Falsify: either file missing the required statements.
- **SR10 (no test regression):** `npm test` stays green (the existing 33
  tests) after the devDependency additions; the new
  `check-commit-messages.mjs` adds no runtime dependency and no failing test.
  Falsify: any pre-existing test fails, or a runtime dep is introduced.

## 10. Open questions / judgement calls for the spec panel

1. **Branch protection × `@semantic-release/git` push (cross-plan).** The
   pinned config commits `CHANGELOG.md` back to `main` with the default
   `GITHUB_TOKEN`. If the sibling biome-ci plan adds branch protection to
   `main` requiring PRs/reviews, that **direct push will be rejected** unless
   the release actor is granted a bypass (GitHub "allow specified actors to
   bypass required pull requests"). Options for the panel: (a) grant the
   github-actions bot bypass on `main`; (b) drop `@semantic-release/git` and
   rely on GitHub Release notes only (contradicts the plan's committed-
   `CHANGELOG.md` deliverable); (c) publish releases from tags via a
   different flow. **Recommended: (a)**, documented as a one-time protection
   setting in the biome-ci plan's branch-protection step. Flagged rather than
   silently decided because it spans both plans.
2. **github-plugin comments disabled to keep `contents: write`-only.** §1.1
   disables PR/issue comments and labels so the token stays minimal. This
   trades away the automatic "released in vX" PR comment and the failure
   issue. Alternative: re-enable defaults and broaden `permissions` to add
   `issues: write` + `pull-requests: write`. Recommended: keep minimal
   (as pinned); the red Actions run is sufficient failure signal. Panel to
   confirm the tradeoff.
3. **Biome step depends on the unspecced sibling plan.** `release.yml` and
   the DoD reference `npx --no-install biome ci .` from
   `docs/plans/2026-07-11-biome-ci.md`, which is not spec'd/implemented in
   this worktree. The exact biome invocation and its `devDependency` are
   owned by that plan. Sequencing per the plan's own note: biome-ci should
   land (or be spec'd in parallel) first. If biome is not yet wired at
   implementation time, the biome step is a placeholder to be reconciled, not
   silently dropped.
4. **Node version pin.** The workflow pins `node-version: "24"` (satisfies
   semantic-release 25's engine `^22.14.0 || >=24.10.0`). `package.json` has
   no `engines` field today; adding one is out of scope but the panel may want
   it noted.

## 11. Out of scope (restates plan)

- npm registry publish (locked; ADR 0012).
- Rewriting the ~20 pre-existing non-conventional commit messages (the
  pipeline only needs correctly-typed commits after `v0.1.1`).
- Any `sdlc`-the-skill change prescribing commit format to consumer repos
  (portability — this repo's own `CONTRIBUTING.md` + `commit-lint` check
  carry the requirement here).
- A `package.json` version-bump mechanism beyond tags (§7 — deferred).
- Main-branch protection configuration itself (owned by the biome-ci plan;
  interaction flagged in §10.1).
