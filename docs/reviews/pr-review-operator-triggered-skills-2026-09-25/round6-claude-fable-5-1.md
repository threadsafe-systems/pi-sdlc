Round-5 disposition confirmations (delta `18d6cc4..71fca38`):

- PR-R5-01: landed — the four cases pass `cwd: tmpdir()` (`test/sdlc-status.test.js:222,286,298,306`); on a git-initialised copy of `71fca38`, replacing `provablyOutsideGit(root)` with `true` at `sdlc-status.mjs:201` now fails 3 tests and dropping `physical` from the walk set fails 1 (both previously undetected). Confirmed, but see the count finding below.
- PR-R5-02: landed — spec header names §1.2 and AR4 and both directories (`docs/specs/2026-07-12-sdlc-adoption-readiness.md:10-13`); ADR 0015/0016/0023 notes, `system-reference.md:52-54`, Plan pre-mortem `:140` and DoD `:151-154` state both directories. Confirmed, but the ADR wording introduces a new defect (first finding).
- PR-R5-03: landed — `sdlc-status.mjs:203-205` splits the branch and emits the working-directory message; `test/sdlc-status.test.js:319` asserts it. Confirmed.
- PR-R5-04: landed — `test/sdlc-status.test.js:341` is a separate test named for the shared property; the env-var and `commondir` cases moved into it. Confirmed.
- PR-R5-05: landed — `sdlc-status.mjs:185` proves `attemptedRoot` only. Confirmed.
- Carries: no `CARRY-TO-*` record exists in the Plan, Build plan, ADR 0030 or the review directory (grep); nothing to discharge.

### Frozen-surface amendment notes invert the burden of proof: "no git repository provably encloses" describes the fail-open rule the code rejects

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0016-status-surface-fs8.md
- line: 3-6 (same sentence at docs/adr/0015-adoption-readiness-policy.md:4-6 and docs/adr/0023-status-surface-fs8-v2.md:6-8)
- problem: The rewritten notes say the result is `not-adopted` "when no git repository provably encloses the root or the working directory". Read as written, that is *absence of proof of enclosure* (∄ repository that provably encloses), whereas the implementation requires *proof of absence* — `provablyOutsideGit` at `skills/sdlc/scripts/sdlc-status.mjs:65-97` and the spec header's "when the filesystem proves no git repository encloses" (`docs/specs/2026-07-12-sdlc-adoption-readiness.md:10-11`). The previous root-only wording was imprecise; this one is inverted on exactly the axis PR-R3-02 and the Plan's pre-mortem row (`:140`, "anything short of it stays `error`") turn on.
- repro_or_impact: Counter-example the notes get wrong: a working directory holding `.git` → `gitdir: /nonexistent` — git itself says "not a git repository", so no repository provably encloses it, yet `sdlc-status` reports `error`/2 (`test/sdlc-status.test.js:289-291`; reproduced). ADR 0016 is the FS8 freeze consumers and the A8 re-freeze follow-up bind to; a maintainer implementing from its note (or the frozen `sdlc-status.sh` wrapper's successor) would build the fail-open classification the branch spent three rounds removing. Fix: "when the filesystem proves no git repository encloses…" as the spec header already says.

### `git.repository` error message asserts a fact the proof did not establish

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 205
- problem: The new branch fires when `!provablyOutsideGit(cwd)`, which means only that absence is unprovable, but the message states "the working directory is inside a git repository". A cwd whose `.git` is a broken gitfile or dangling symlink, or a bare/gitdir-shaped directory, reaches this branch although git reports no repository there.
- repro_or_impact: `mkdir -p /tmp/p/{nongit,broken}; printf 'gitdir: /nonexistent\n' > /tmp/p/broken/.git; cd /tmp/p/broken && node sdlc-status.mjs --repo-root /tmp/p/nongit --format json` → `error`/2 with "the working directory is inside a git repository" and "run from the consumer repository" (reproduced). Under `SKILL.md`'s stop rule the agent surfaces this verbatim; the operator is told they are inside a repository that `git status` says does not exist, and the remediation points at a "consumer repository" that is not there. Behaviour (exit 2) is correct; only the caller-facing claim overstates. "…but the working directory cannot be proven outside one" would be accurate.

### Script header still states the root-only exit-1 contract

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 8-9
- problem: The usage header says exit 1 means "HEAD has no manifest blob, or no git repository encloses the root", but the branch at `:201-203` also requires the working directory to be provably outside git; a root outside git from a git-enclosed cwd is exit 2 (`test/sdlc-status.test.js:317-318`). The PR-R5-02 fix updated every external contract summary and left the script's own. (Same root-only shorthand in the Build plan's Surfaces bullet, `docs/plans/2026-09-24-operator-triggered-skills-build.md:82-83`, though its "Does" bullet at `:89-95` is precise.)
- repro_or_impact: A caller reading the script header to decide how to branch on exit 1 gets an incomplete precondition; the header can go stale without the function beneath it changing, which is the staleness test.

### Round-5 disposition overstates the restored mutation coverage

- severity: low
- confidence: medium
- origin: NEW
- file: docs/reviews/pr-review-operator-triggered-skills-2026-09-25/consolidated.md
- line: 104
- problem: The PR-R5-01 disposition records "removing the root proof now fails 7 tests and removing the symlink-resolved walk fails 3". On a git-initialised copy of `71fca38`, `node --test 'test/**/*.test.js'` shows the root-proof mutant (`provablyOutsideGit(root)` → `true` at `:201`) newly failing 3 tests (4 if `:185` is mutated too) and the symlink-walk mutant (`physical` dropped from the walk set at `:86`) newly failing 1 (`a repository git cannot use is an error, not not-adopted`).
- repro_or_impact: The record is an audit artefact for the ratified `sdlc-status` change; the substantive claim (both mutants are now caught) holds, but the counts overstate the coverage by 2-3×. Confidence is medium only because the author may have counted assertion labels rather than tests; either way the record should say what it measured.

### Inline re-implementation of the `check()` helper

- severity: low
- confidence: high
- origin: NEW
- file: test/sdlc-status.test.js
- line: 319
- problem: `reportOf(pointedAway).checks.find((c) => c.id === "git.repository").message` re-implements `check(report, id)` (`:27-31`), which also asserts the check is present; the inline form throws a bare `TypeError` on a missing check instead of `missing check git.repository`, and re-parses a report `assertStatusError` already parsed one line earlier.
- repro_or_impact: No behavioural effect; a regression that drops the check id would surface as a `TypeError` rather than the file's standard assertion message.
- smell: Duplicated Code

No high-severity findings. No finding contradicts the owner-ratified decision to change `sdlc-status` in this PR.