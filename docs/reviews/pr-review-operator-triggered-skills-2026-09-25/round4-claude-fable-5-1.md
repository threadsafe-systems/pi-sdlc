Round-3 disposition confirmations:

- PR-R3-01: landed — `skills/sdlc/SKILL.md:28-30` accepts `--repo-root`; `test/operator-triggered-skills.test.js:81-86` pins it; monorepo `--repo-root <sub>` → `ready` in my repro. Confirmed.
- PR-R3-02: landed — `provablyOutsideGit` at `skills/sdlc/scripts/sdlc-status.mjs:64-94`; git-off-PATH, dubious ownership, broken `.git`, bare, `$GIT_DIR`, symlink cases all exit 2 (`test/sdlc-status.test.js:276-308`); kernel exception removed (`SKILL.md:40-41`); ADR 0030 rewritten. Confirmed.
- PR-R3-03: `docs/adr/0030-operator-triggered-skills.md:40` and the Plan pre-mortem say "where a repository installs it". Confirmed.
- PR-R3-04: `$SDLC_ROOT` case pinned at `test/sdlc-status.test.js:264`. Confirmed.
- PR-R3-05: synopsis and directive agree at `SKILL.md:28-30`. Confirmed.
- PR-R3-06: ledger S06 `retained` on the re-anchored phrase (`disposition-ledger.md:38`); Build A5 says "re-anchored". Confirmed.
- PR-R3-07: round-2 header names who confirmed what (`consolidated.md:36-39`). Confirmed.
- Carries: no `CARRY-TO-*` records exist in the governing docs or review directory; the A8 re-freeze is a DoD checkbox on open epic #278. Nothing undischarged.

### An on-disk manifest in a non-git ancestor redirects the root, and the proof then reports an adopted repository as `not-adopted`

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 194-197 (proof applied to `root`; root chosen by `inspectRoot`'s manifest walk, `skills/sdlc/scripts/lib.mjs:69-75`)
- problem: `provablyOutsideGit` is evaluated on the FS3-resolved `root`, not on the directory the operator is in. Without an explicit root, `inspectRoot` walks up for the nearest on-disk `.pi/sdlc/sdlc.config.json` before consulting git; if the adopted repo's working-tree manifest is absent (deleted, or a sparse checkout that excludes `.pi/` — spec AR9's supported case) and a non-git ancestor carries a stray manifest (e.g. `~/.pi/sdlc/sdlc.config.json` from a `/setup-sdlc` run in `$HOME`; `setup-sdlc.mjs:372-379` does not require git), the root becomes that ancestor. The ancestor has no `.git` above it, so the proof is true, `git.repository` is `fail`, and the report is `not-adopted`/exit 1 for a cwd that sits inside a repository whose `HEAD` has adopted the sdlc. ADR 0030:34-35 and README:51-52 describe the condition as "the working directory outside any git repository", which is not what is proven.
- repro_or_impact: Reproduced: non-git `outer/` with `outer/.pi/sdlc/sdlc.config.json`; `outer/proj` is a git repo with the manifest committed; `rm outer/proj/.pi/sdlc/sdlc.config.json`; from `outer/proj`: `sdlc-status --format json` → `state: not-adopted, exitCode: 1, root: outer, root.resolve:pass git.repository:fail adoption.manifest-head:skip`. Same setup on `origin/main` → `error`/exit 2 (stop with diagnostics); with `--repo-root .` → `not-ready`/exit 3 (stop). Under `SKILL.md:36-39` the agent now says nothing and continues outside the lifecycle in an adopted repository — the fail-open class PR-R1-01/PR-R2-01/PR-R3-02 were about, reintroduced through the manifest-walk branch the proof does not guard. A fix within the ratified decision: when no explicit root was given, require the proof to hold for the working directory as well (or only apply it when `root` equals the cwd-derived `attemptedRoot`).

### README's caller-migration guide still tells shell callers that non-git roots exit 2

- severity: medium
- confidence: high
- origin: NEW
- file: README.md
- line: 68-70
- problem: The "Migrating callers of the old two-state status" section states "Non-git roots move to exit 2: they historically exited 1 without a manifest and 0 with a valid one." After this PR a non-git root exits 1 in both cases (`test/sdlc-status.test.js:257-274`), and the PR body's own "Caller-visible change" says so. Only the adoption paragraph (README:43-56) was updated; the migration bullet 16 lines below it now contradicts it.
- repro_or_impact: A shell/CI caller following the README branches on exit 2 for "not a git repo" and on exit 1 for "git repo, no manifest"; the former now arrives as exit 1 and is misclassified. This is the same document the Plan's NFR row cites as the README verification target.

### The FS8 freeze record is not reconciled with the new `git.repository:fail` aggregate rule

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 5-7 and 36-37 (also `skills/sdlc/scripts/sdlc-status.mjs:340`, `docs/adr/0016-status-surface-fs8.md` "Decision")
- problem: ADR 0016 freezes the FS8 machine surface and rules that "check meanings are never reinterpreted" and "any surface change is a new schema version with a documented migration, never a silent edit"; the FS8 spec (`docs/specs/2026-07-12-sdlc-adoption-readiness.md` §2.2, §2.3 item 4, §2.8, AR4) fixes `git.repository` as error-only and "not-adopted results emit `manifest-head:fail`". This PR gives `git.repository` a `fail` status and adds a second not-adopted trigger (`sdlc-status.mjs:346`) with no schema bump, while ADR 0030 amends 0010/0015/0023 but neither amends ADR 0016 nor states why its bump rule does not apply; the code comment `// aggregate (spec §2.8)` at line 340 now labels a rule that §2.8 does not contain.
- repro_or_impact: A consumer binding to the documented FS8 v2 contract (`not-adopted ⟺ adoption.manifest-head:fail`, all later checks skip) now receives `not-adopted` with `adoption.manifest-head:skip` and `git.repository:fail`. The ADR chain tells a reader the surface may not change without a schema version, while the surface did; either an ADR 0016 amendment note recording the exception (and its rationale) or a schema bump is owed. This concerns how the ratified change is recorded, not whether it is made.

### Plan amendment cites review-panel finding ids as its trigger

- severity: low
- confidence: high
- origin: REOPENED(PR-R2-05)
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 182-183
- problem: The second amendment, added after PR-R2-05 was dispositioned, reads "Trigger: PR panel findings PR-R2-01, PR-R3-01 and PR-R3-02 showed…". PR-R2-05 removed exactly this class of review-round provenance from the first amendment because the behavioural reason stands on its own; the new text reintroduces it in a governing document.
- repro_or_impact: The finding ids live in a review directory that can be reorganised independently of the Plan, leaving a dangling provenance reference; the sentence is complete without them.

### Frozen-surfaces test name still calls `sdlc-status.mjs` a frozen script

- severity: low
- confidence: high
- origin: NEW
- file: test/frozen-surfaces.test.js
- line: 51-53
- problem: The test "ASD19: FS8/FS9 check ids remain present in their frozen scripts" reads `HEAD:skills/sdlc/scripts/sdlc-status.mjs`, which this PR removed from `FROZEN` (line 15-31). The name asserts a status the file no longer has until the A8 re-freeze lands.
- repro_or_impact: A reader of the test output takes `sdlc-status.mjs` as byte-frozen while the first ASD19 test no longer checks it; stale claim in a test name.

No high-severity findings.