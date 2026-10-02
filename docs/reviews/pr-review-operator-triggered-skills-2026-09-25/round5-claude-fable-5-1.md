Round-4 disposition confirmations:

- PR-R4-01: landed — `skills/sdlc/scripts/sdlc-status.mjs:67` treats `$GIT_WORK_TREE`/`$GIT_COMMON_DIR` as unprovable and `:201` requires the proof for `cwd`; pinned at `test/sdlc-status.test.js:319-321,326-328`. Confirmed.
- PR-R4-02: landed — nested adopted repo under a non-git manifest now `error` via the cwd proof; pinned at `test/sdlc-status.test.js:330-340`. Confirmed.
- PR-R4-03: landed — `looksLikeGitDir` accepts HEAD beside `objects`, `refs` or `commondir` (`sdlc-status.mjs:84`); pinned at `test/sdlc-status.test.js:342-347`. Confirmed.
- PR-R4-04: landed — `README.md:68-71` states exit 1 for a root outside git and exit 2 for an unusable repository; `test/docs.test.js:136-138` pins the new wording. Confirmed.
- PR-R4-05: landed — `docs/adr/0016-status-surface-fs8.md:3-5` and the spec header (`docs/specs/2026-07-12-sdlc-adoption-readiness.md:10-12`) carry the amendment note; ADR 0030:40-45 states why the schema stays 2; `sdlc-status.mjs:345` cites it. Confirmed.
- PR-R4-06: landed — `disposition-ledger.md:140-141` names S05/S10/S11. Confirmed.
- PR-R4-07: landed — build plan `:12-17` describes T1 and T2. Confirmed.
- PR-R4-08: landed — plan `:182-183` trigger states the behavioural reason only. Confirmed.
- PR-R4-09: landed — `test/frozen-surfaces.test.js:51` renamed. Confirmed.
- Carries: no `CARRY-TO-*` records exist in the governing docs, ADR 0030 or the review directory (grep); the A8 re-freeze is a follow-up on epic #278, not a carry. Nothing undischarged.
- Fail-open sweep of the delta: probed `GIT_DIR=""`, `GIT_WORK_TREE=""`, `GIT_CEILING_DIRECTORIES`, a `.GIT` entry on a case-insensitive filesystem, a dangling `.git` symlink, a cwd whose logical path is a symlink into a repository, and an explicit root that is a symlink inside a repository pointing to a non-git directory — every case is `error`/2 or the pre-existing `manifest-head:fail` path; no path reports `not-adopted` for a caller git can discover a repository from. The only non-git case the cwd requirement moves to exit 2 is an explicit `--repo-root`/`$SDLC_ROOT` naming a provably non-git directory while the caller's cwd is inside some other repository (e.g. a git-managed `$HOME`, or the pi-sdlc checkout itself); that is the outcome the PR-R4-01 disposition ratified and ADR 0030:34-39, README:68-70 and the PR body all state it, so it is not raised as a defect (see the diagnostic finding below).

### The cwd guard hollows out four existing root-proof pins: the symlink-resolved walk and the is-directory guard now have zero effective test coverage

- severity: medium
- confidence: high
- origin: NEW
- file: test/sdlc-status.test.js
- line: 222, 286, 298, 306
- problem: These four `runStatus` calls pass no `cwd`, so they run from the pi-sdlc checkout (`test/fs8-helpers.js:39`), which is inside a git repository. After this delta `provablyOutsideGit(cwd)` at `sdlc-status.mjs:201` is therefore `false` before the root proof is ever consulted, and each case reports `error` regardless of what `provablyOutsideGit(root)` returns. The labels "explicit root, git not on PATH", "root is a file", "symlink into a repository, git not on PATH" and the missing-root case no longer pin the root proof at all; the author fixed the same masking at line 263 (`cwd: tmpdir()`) but not here.
- repro_or_impact: Two mutants on a copy of 18d6cc4: (a) replace `provablyOutsideGit(root)` with `true` at `sdlc-status.mjs:201` → `node --test test/sdlc-status.test.js` fails only the new commondir case (line 347); the whole "a repository git cannot use is an error" test stays green. (b) drop `physical` from the walk set (`:86`) and the `isDirectory` guard (`:71`) → all 42 tests in `sdlc-status`/`readiness-output`/`readiness-git` pass; the identical mutant applied at the round-4 base `5f8662d` is caught by the line-306 symlink case. The symlink-resolved walk is the guard ADR 0030:33-34 and build plan T2 (`:90-95`) rely on for "a symlink into a repository" exiting 2; a regression there would now ship undetected. Fix: pass `cwd: tmpdir()` on those four calls, as line 263 and 347 already do.

### `git.repository:error` for a provably non-git root does not say why the result is not `not-adopted`

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 203-204
- problem: When `top` fails and the root is provably outside git but the working directory is not (the case the delta added at `:201`), the report emits the same message and remediation as an unusable repository — "resolved root is not within a git worktree" / "adopt the sdlc inside a git repository". The actual reason for exit 2 rather than exit 1 (the caller's working directory sits inside a git repository) appears nowhere in the report, although README:68-70 tells callers the exit-1 classification depends on both directories.
- repro_or_impact: From any git checkout: `sdlc-status --repo-root /tmp/nongit --format json` → `error`/2, `git.repository: "resolved root is not within a git worktree"`. Under `SKILL.md:40-41` the agent surfaces exactly this diagnostic and stops; the operator sees a remediation that describes the exit-1 condition and cannot tell from the report that their cwd, not the root, produced the stop. A distinct message for the `provablyOutsideGit(root) && !provablyOutsideGit(cwd)` branch would make the stop actionable.

### Spec amendment note omits two sections that still state the superseded rule

- severity: low
- confidence: high
- origin: NEW
- file: docs/specs/2026-07-12-sdlc-adoption-readiness.md
- line: 10-12 (also 68 and 459-460)
- problem: The new "Amended by: ADR 0030" note enumerates the affected sections as "§2.2, §2.3 item 4, §2.8", but §1.2's exit/state table (line 68: exit 1 = "Inspection proved that current `HEAD` has no manifest blob") and AR4 (lines 459-460: "an unresolvable implicit root, and a non-git explicit root exit 2/state `error`") also state the rule ADR 0030 replaces and are not listed.
- repro_or_impact: §1.2 is the table consumers bind to; a reader who jumps to it or to AR4 gets no pointer that exit 1 now also covers a root outside git, while the header's explicit section list implies the enumeration is complete.

### New test name describes only half of its cases

- severity: low
- confidence: high
- origin: NEW
- file: test/sdlc-status.test.js
- line: 311
- problem: "a root outside git that points away from the caller's repository is an error" also asserts that `$GIT_WORK_TREE`/`$GIT_COMMON_DIR` set from a non-git cwd is an error (lines 326-328, where there is no caller repository) and that an explicit root which is itself a gitdir with a `commondir` file is an error (lines 342-347, a root inside git, not outside it). Neither group is a "root outside git that points away from the caller's repository".
- repro_or_impact: A failure in the env-var or commondir group is reported under a claim that does not describe it; the standalone behavioural claim is false for two of the four groups. Split the test or name it for the shared property (absence of a repository is unprovable → error).

### Redundant second proof in the root-resolve fallback implies a distinction that does not exist

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 185
- problem: `provablyOutsideGit(rootInspection.attemptedRoot) && provablyOutsideGit(cwd)` — `attemptedRoot` is always `resolve(base)` where `base` is the same `cwd` (`skills/sdlc/scripts/lib.mjs:65,89`), so the second call re-walks the identical directory and can never change the outcome; the conjunction reads as if the two could differ, unlike the genuinely distinct pair at line 201.
- repro_or_impact: No behavioural effect; a reader infers a cwd/attemptedRoot divergence that `inspectRoot` cannot produce, and the message at line 187 ("using it as the root") already states they are the same directory.
- smell: Duplicated Code

No high-severity findings.