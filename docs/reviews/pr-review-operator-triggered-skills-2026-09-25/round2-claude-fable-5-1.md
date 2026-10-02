Round 1 fix confirmations (one line each):

- OT-R1-01: confirmed — `skills/sdlc/SKILL.md:39-42` carves out only `root.resolve`; `git.repository` still stops; both behavioural tests pass (`test/operator-triggered-skills.test.js:87-108`).
- OT-R1-02: confirmed — all six templates pass `--repo-root .` (`templates/sdlc-*.md:13`), so `inspectRoot` takes the explicit branch (`lib.mjs:67-68`) and `root.resolve` cannot fail there; repro above shows the same non-git dir yields `git.repository` error under that form.
- OT-R1-03/12: confirmed — `assertContract` (`test/operator-triggered-skills.test.js:41-49`) deletes each required pattern and appends each forbidden sample; the `disable-model-invocation` assertion now runs through it (line 62).
- OT-R1-04/11: confirmed — ADR 0015:3-6 and ADR 0030:5-6, 36-38 updated.
- OT-R1-05: confirmed — `system-reference.md:56-57`, ADR 0030:31-33.
- OT-R1-06/07: confirmed — behavioural tests plus README/ADR assertions at lines 110-125.
- OT-R1-08/09/10: confirmed — ledger S05 `replaced`, Build A5 rewritten, `report.json` deleted and `validator.md` repointed.

### The stated `root.resolve` invariant is false: it also fails when `git` cannot run, so an adopted repository can still reach the silent branch

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 25-27 (same claim at skills/sdlc/SKILL.md:40, skills/sdlc/references/system-reference.md:53-54, docs/plans/2026-09-24-operator-triggered-skills-build.md:109-113, docs/plans/2026-09-24-operator-triggered-skills.md:169-172)
- problem: The carve-out is justified by "`root.resolve` … fails only when no explicit root was passed and neither a manifest nor a git repository encloses the working directory", and the ADR contrasts it with `git.repository`, which "also fails when `git` cannot run". But `inspectRoot` (`skills/sdlc/scripts/lib.mjs:64-92`) resolves via explicit root → on-disk manifest in any ancestor (`existsSync`, line 74) → `execFileSync("git", ["rev-parse","--show-toplevel"])` wrapped in a bare `catch` (lines 81-90). So `root.resolve` also errors whenever git cannot spawn (or `rev-parse` fails for safe.directory / corrupt `.git`) and no manifest file is on disk — the "manifest" that protects it is the working-tree file, not the HEAD blob that defines adoption. The test at `test/operator-triggered-skills.test.js:98-108` ("in an adopted repository with git unavailable fails git.repository, not root.resolve") passes only because this repo's working tree carries the manifest; its name attributes to adoption what the on-disk file provides.
- repro_or_impact: Reproduced: `git init` a repo, commit `.pi/sdlc/sdlc.config.json` (status → `ready`, exit 0); `rm .pi/sdlc/sdlc.config.json` (uncommitted delete; with git on PATH status → `not-ready`, exit 3, so the kernel stops); now run with `PATH=<empty dir>` → `state: error`, `exit-code: 2`, `check: root.resolve error — cannot locate a consumer repo`. Under `SKILL.md:39-41` the agent "handle[s] it exactly as exit 1" and silently continues outside the lifecycle in a repository whose `HEAD` has adopted it. Same outcome for a sparse checkout that excludes `.pi/` when git is unrunnable. It needs two faults at once, so the operational exposure is narrow, but the ADR/kernel/reference encode an invariant that is not what the code implements, and the tests pin the on-disk-manifest guard, not the stated one.

### Exit-2 bullet contradicts itself: "handle exactly as exit 1" (continue outside the lifecycle) followed by "an error is never a reason to continue outside the lifecycle"

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 39-42
- problem: The rewritten bullet tells the agent that a `root.resolve` error is handled "exactly as exit 1", and bullet 3 (lines 36-38) defines exit 1 as "continue the task outside it [the lifecycle]". The same bullet then ends with the absolute "an error is never a reason to continue outside the lifecycle". The "Otherwise" scoping makes the intended reading recoverable, but the literal law now contains a universal that the preceding sentence violates. `disposition-ledger.md:38` anchors that phrase and records the baseline "Exit 2 error: stop" as `retained`, though exit 2 no longer always stops.
- repro_or_impact: This is agent-executed prose law (SKILL.md:47-50); an agent that weighs the categorical "never" over the carve-out will stop and surface diagnostics in a non-git directory, which is exactly the behaviour ADR 0030 set out to remove. Rewording to "any other error is never a reason…" (and updating the ledger anchor) removes the contradiction.

### README's "working directory outside any git repository → silent" holds only for one of the two invocation forms the kernel permits

- severity: low
- confidence: high
- origin: NEW
- file: README.md
- line: 51-53
- problem: The README promises that in "a working directory outside any git repository, the agent sets the lifecycle aside silently". That is true only when `sdlc-status` is run without `--repo-root`; `SKILL.md:29-31` leaves both forms open ("with cwd inside the consumer repo or pass `--repo-root`"). With `--repo-root .` — the form every `/sdlc-*` template uses (`templates/sdlc-brainstorm.md:13` etc.) — the explicit branch of `inspectRoot` (`lib.mjs:67-68`) makes `root.resolve` pass and `git.repository` errors instead, which `SKILL.md:41-42` says to surface and stop on.
- repro_or_impact: Reproduced in a temp non-git dir: no flag → `root.resolve error`; `--repo-root .` → `root.resolve pass`, `git.repository error — resolved root is not within a git worktree`. The operator-facing guarantee therefore depends on an agent choice the kernel does not constrain; either the kernel should tell the agent to omit `--repo-root` when cwd is the consumer repo, or the README should condition the claim (as `system-reference.md:52-54` and ADR 0030:13-16 already do by naming the check).

No high-severity findings. No undischarged carries found (no `CARRY-TO-*` records exist in the governing documents or review directories).