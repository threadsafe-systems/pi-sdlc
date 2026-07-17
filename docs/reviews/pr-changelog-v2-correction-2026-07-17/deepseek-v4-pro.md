## Review findings: PR #73

No concrete defects found. All three verification axes pass. Findings below are verification evidence, not defects.

---

### (a) Track:none claim — VERIFIED

- severity: low
- confidence: high
- file: CHANGELOG.md
- line: n/a
- problem: None. The diff touches only `CHANGELOG.md` (1 file, +18/-24 lines). No product code, no config files, no docs/plans/, docs/specs/, or docs/build-plans/ artifacts. `npm test` passes clean (206/206). `git status` shows no staged files. Track:none is honest.
- repro_or_impact: Not a defect — verification evidence.

---

### (b) CHANGELOG.md accuracy against repo state — VERIFIED

- severity: low
- confidence: high
- file: CHANGELOG.md
- line: 1-17
- problem: None. Every claim in the new `## [1.0.1]` entry checks out against external state:

  - **v2.0.0 truly deleted:** `git ls-remote --tags origin 'v*'` returns no `v2.0.0` tag. `gh release list` shows no v2.0.0 release. (The local clone has a stale v2.0.0 tag at the same commit as v1.0.1 — an environmental artifact, not a defect. Remote state is clean.)
  - **v1.0.1 truly exists:** Remote annotated tag `8a135dc` → commit `b375469`. GitHub Release at `v1.0.1` published 2026-07-17T10:46:09Z, body matches the Bug Fixes entry in CHANGELOG.md. Tagger: Neil Chambers (hand-cut, consistent with provenance note).
  - **Bug Fixes entry matches reality:** The `04d6361` commit is indeed commit `04d6361a90215fb08a9a43281dddcc7bdc28387e` — `fix(release): switch semantic-release to conventionalcommits preset, pinned 9.3.1 (#72)`. Compare URL `v1.0.0...v1.0.1` correctly shows 2 commits: `04d6361` and `b375469`.
  - **Poisoned message confirmed:** `git log --format='%B' 04d6361 -1` shows the line `BREAKING CHANGE: footer, so either form now correctly triggers a major` — prose describing the new preset, not a breaking-change footer. The conventionalcommits parser's note scanner matched the literal token `BREAKING CHANGE:` at line start.
- repro_or_impact: Not a defect — verification evidence.

---

### (c) Ordering claim — VERIFIED

- severity: low
- confidence: high
- file: n/a (repo topology)
- line: n/a
- problem: None. The ordering guarantee holds precisely:

  ```
  v1.0.1 annotated tag → commit b375469 (chore(release): 2.0.0 [skip ci])
                          ↑ parent
                        04d6361 (fix(release): ... #72)  ← poisoned message lives here
  ```

  - `git merge-base docs/changelog-v2-correction main` = `b375469` — the exact commit v1.0.1 points to.
  - `04d6361` is the parent of `b375469` — confirmed by `git log --oneline --ancestry-path 04d6361..v1.0.1` = `b375469`.
  - After merge, the only commit since v1.0.1 will be `a5152af` (`docs(changelog): ...`). The `docs:` type does not trigger a release under the `conventionalcommits` preset configured in `.releaserc.json`.
  - 04d6361 is an ancestor of the v1.0.1 tag and will never be re-analyzed by semantic-release.

  **Edge case considered:** If a CI runner has the v2.0.0 tag cached locally, it points to the same commit `b375469` as v1.0.1. Semantic-release would pick the higher version (`v2.0.0`) and analyze commits since `b375469` — still only `a5152af`. Same outcome. No risk.
- repro_or_impact: Not a defect — verification evidence.

---

### Residual note: local v2.0.0 tag artifact

- severity: low
- confidence: high
- file: n/a (local environment)
- line: n/a
- problem: The worktree's local clone still has the `v2.0.0` tag (pointing to `b375469`). It does not exist on the remote (`git ls-remote --tags` confirmed). This is strictly a local artifact from the pre-deletion pull and poses no merge risk — CI fetches remote tags. However, anyone working in this worktree who runs `git describe` or `git tag -l` will see the stale tag, which could cause momentary confusion.
- repro_or_impact: `git tag -l 'v*'` in this worktree includes v2.0.0. `git ls-remote --tags origin 'v*'` does not. Cleanup suggested: `git tag -d v2.0.0` (purely local hygiene, not a PR defect).

---

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Diff touches only CHANGELOG.md (+18/-24). No product code, config, or SDLC artifacts modified. Track:none scope strictly observed."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "All verification claims ground-checked: (a) git ls-remote --tags confirms no v2.0.0 on remote; (b) gh release list + gh release view confirm v1.0.1 exists with correct body; (c) git merge-base + ancestry-path confirm 04d6361 sits before v1.0.1 tag; (d) conventionalcommits preset won't release on docs: commit type."
    }
  ],
  "changedFiles": [
    "CHANGELOG.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "git ls-remote --tags origin 'v*'",
      "result": "passed",
      "summary": "No v2.0.0 tag on remote; v1.0.1 present at 8a135dc -> b375469"
    },
    {
      "command": "gh release list -R threadsafe-systems/pi-sdlc",
      "result": "passed",
      "summary": "v1.0.1 is Latest; no v2.0.0 release exists"
    },
    {
      "command": "gh release view v1.0.1 -R threadsafe-systems/pi-sdlc",
      "result": "passed",
      "summary": "Body matches CHANGELOG Bug Fixes entry; published 2026-07-17T10:46:09Z; not prerelease"
    },
    {
      "command": "git merge-base docs/changelog-v2-correction main",
      "result": "passed",
      "summary": "b375469 — exact commit v1.0.1 points to"
    },
    {
      "command": "git log --ancestry-path 04d6361..v1.0.1",
      "result": "passed",
      "summary": "b375469 only — 04d6361 is parent of v1.0.1's target commit"
    },
    {
      "command": "npm test",
      "result": "passed",
      "summary": "206/206 pass, 0 fail"
    },
    {
      "command": "git diff --name-only origin/main..HEAD",
      "result": "passed",
      "summary": "Only CHANGELOG.md modified"
    }
  ],
  "validationOutput": [
    "Track:none: honest — 1 file, docs-only, no product or config change",
    "CHANGELOG.md: v1.0.1 entry accurate against remote tags, GitHub Releases, and commit history",
    "Ordering: 04d6361 is ancestor of v1.0.1 tag; merge-base = v1.0.1; no re-analysis risk",
    "Local v2.0.0 tag artifact: exists in worktree clone only, not on remote — cosmetic, zero merge risk"
  ],
  "residualRisks": [
    "Stale local v2.0.0 tag in this worktree (not on remote) — purely cosmetic, no merge impact. Recommend `git tag -d v2.0.0` for hygiene.",
    "The commit at b375469 has message 'chore(release): 2.0.0 [skip ci]' — the v1.0.1 tag points to a commit whose message says v2.0.0. This is an immutable historical artifact; the tag (not the message) is authoritative. CHANGELOG and GitHub Release correctly say v1.0.1."
  ],
  "noStagedFiles": true,
  "diffSummary": "Replaces the auto-generated v2.0.0 CHANGELOG entry with a hand-written v1.0.1 entry including a provenance note explaining the misfire. +18/-24 lines in CHANGELOG.md only.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "PR #73 is a clean, minimal, and well-reasoned correction. All three verification axes (track:none, CHANGELOG accuracy, ordering) pass with high confidence. The one environmental artifact (local stale v2.0.0 tag) does not affect the merge outcome. No defects found."
}
```
