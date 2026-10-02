Round-2 fix confirmations:

- PR-R2-01: landed as ratified — `skills/sdlc/SKILL.md:30` runs the gate without `--repo-root`; risk recorded at `docs/adr/0030-operator-triggered-skills.md:43-46`, `docs/plans/2026-09-24-operator-triggered-skills.md:173-179`, Build A7 `:114-118`; test renamed at `test/operator-triggered-skills.test.js:107`. Confirmed (record-accuracy issues below do not contest the decision).
- PR-R2-02: `skills/sdlc/SKILL.md:42` now reads "any other error is never a reason…"; pinned by `test/docs.test.js:102` and `test/operator-triggered-skills.test.js:76`. Confirmed.
- PR-R2-03: `skills/sdlc/SKILL.md:30` + `test/operator-triggered-skills.test.js:100-105`. Confirmed (residual `$SDLC_ROOT` gap below).
- PR-R2-04: ledger S06 is `replaced` at `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md:38`. Confirmed.
- PR-R2-05: "PR panel round 1" is gone from the Plan amendment (`:169-172`). Confirmed.

No `CARRY-TO-*` records exist in the governing documents or review directory; nothing to discharge.

### Forbidding `--repo-root` in the kernel silently drops a supported monorepo-subdirectory consumer

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 28-30
- problem: Step 1 now says "from the task's working directory, without `--repo-root`" and the old escape hatch ("or pass `--repo-root`") is deleted and forbidden by test (`test/operator-triggered-skills.test.js:103`). A manifest-configured consumer subdirectory inside a monorepo is a supported topology (`docs/specs/2026-07-12-sdlc-adoption-readiness.md:509-510` AR9; prefix handling at `skills/sdlc/scripts/sdlc-status.mjs:189-191`). Without `--repo-root`, `inspectRoot` walks up from cwd, finds no manifest at the git top-level, and resolves the top-level (`skills/sdlc/scripts/lib.mjs:72-86`), so `adoption.manifest-head` fails and the gate returns exit 1 — which the kernel now handles by saying nothing and continuing (`SKILL.md:36-38`).
- repro_or_impact: Reproduced: `git init`, commit `packages/foo/.pi/sdlc/{sdlc.config.json,panels,workflow.md}`; from the repo root `sdlc-status --format json` → `not-adopted`, `adoption.manifest-head:fail`; `--repo-root packages/foo` (the form the previous kernel sanctioned) → `ready`. An operator who launches pi at the monorepo root and explicitly asks `/skill:sdlc` for that consumer gets a silent bypass in an adopted repository — the fail-open class PR-R1-01/PR-R2-01 were about. This is a side effect of the owner-ratified option A ("run without `--repo-root`") that the decision record does not weigh; it does not contest the `root.resolve` carve-out itself, but any fix touches the ratified wording (e.g. "without `--repo-root` unless the consumer root is a subdirectory of the git repository", or naming `$SDLC_ROOT`), so it should be escalated rather than absorbed.

### The recorded two-fault risk understates its trigger and leaves ADR 0030's Decision contradicting its Consequences

- severity: medium
- confidence: high
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 25-27 and 43-46 (same claims at docs/plans/2026-09-24-operator-triggered-skills.md:174-177 and docs/plans/2026-09-24-operator-triggered-skills-build.md:116-118)
- problem: The new risk text says the silent path needs "a host where `git` cannot run" / "`git` unrunnable". The actual condition is any non-zero `git rev-parse --show-toplevel` from cwd with no manifest on disk (`lib.mjs:80-89` catches everything): dubious ownership (`safe.directory`), a linked worktree whose gitdir was pruned, etc. — none of which require git to be absent. Meanwhile the Decision at line 25-27 still asserts `root.resolve` "fails only when no explicit root was passed and neither a manifest nor a git repository encloses the working directory", which the Consequences paragraph added in this delta now refutes inside the same document.
- repro_or_impact: Reproduced with git installed and on `PATH`: commit `.pi/sdlc/sdlc.config.json`, `rm` it from the working tree, run `GIT_TEST_ASSUME_DIFFERENT_OWNER=1 node sdlc-status.mjs` (git's own switch for the dubious-ownership path; `git rev-parse` prints "fatal: detected dubious ownership") → `state: error`, `root.resolve error`, exit 2 → kernel continues silently. With the manifest on disk the same setup stops on `git.repository`. Dubious ownership is routine in bind-mounted containers and CI checkouts, so the record the owner ratified rates the second fault as rarer than it is. This does not contest the decision to record rather than fix; it asks that the record and the Decision sentence state the real trigger.

### "CI's `check-lifecycle` still gates its PRs" is stated unconditionally, but the workflow is opt-in and refused for the subdirectory case

- severity: low
- confidence: high
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 45-46 (same at docs/plans/2026-09-24-operator-triggered-skills.md:177-178)
- problem: The mitigation offered for the accepted two-fault risk assumes every adopted repository runs `check-lifecycle` in CI. The workflow is only provisioned with `--with-ci-workflow` (`skills/sdlc/scripts/setup-sdlc.mjs:167,297,528`) and is refused when existing CI is detected or the consumer root is a subdirectory of the git repository (`:625-626`).
- repro_or_impact: An adopter who ran `/setup-sdlc` without the flag, or a monorepo subdirectory consumer, has no CI backstop; the risk record tells them they do. The same overclaim pre-exists at ADR 0030:37-38, but the delta re-uses it as the justification for a newly accepted safety gap.

### `$SDLC_ROOT` is an explicit root the kernel does not neutralise, so the README's non-git promise still depends on an uncontrolled input

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 30 (README.md:51-53 makes the promise)
- problem: The PR-R2-03 fix removes `--repo-root`, but FS3 precedence treats `$SDLC_ROOT` identically as an explicit root (`skills/sdlc/scripts/lib.mjs:66-67`; `docs/adr/0003-consumer-root-resolution-fs3.md:7`), and `sdlc-status` itself advertises setting it in its `root.resolve` remediation (`sdlc-status.mjs:145`). With it set, `root.resolve` passes and `git.repository` errors, which the kernel says to surface and stop on.
- repro_or_impact: Reproduced in a temp non-git directory: no env → `root.resolve:error` (silent path); `SDLC_ROOT=.` → `root.resolve:pass git.repository:error`, exit 2 → stop with diagnostics, contradicting README:51-53. Either the kernel should say the gate runs with `$SDLC_ROOT` unset (or that an operator-set root is honoured), or the README claim should be conditioned.

### Step 1's synopsis still advertises `[--repo-root DIR]` in the sentence that forbids it

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 28-30
- problem: The instruction reads "run `scripts/sdlc-status.sh [--repo-root DIR] [--format text|json]` … from the task's working directory, without `--repo-root`." The synopsis and the directive in the same sentence disagree; nothing pins the synopsis (`test/docs.test.js:184` pins only the `.mjs` usage string).
- repro_or_impact: Agent-executed prose law (`SKILL.md:49-50`) that offers an option and forbids it in one breath; an agent reading the synopsis first has a sanctioned-looking form the rule then bans.

### Build A5 still says S06 is "re-anchored" after this delta made it `replaced`

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills-build.md
- line: 100
- problem: A5 states "S05 is now `replaced`, S06 is re-anchored", but the delta changed S06 to `replaced` with no anchor (`docs/validation/sdlc-agent-self-documentation/disposition-ledger.md:38`) per PR-R2-04.
- repro_or_impact: The governing Build plan now misdescribes the ledger's current state; the same class of stale audit record was raised and fixed as PR-R1-09.

### Consolidated round-2 header contradicts its own table

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-operator-triggered-skills-2026-09-25/consolidated.md
- line: 36-37
- problem: "All confirmed every round-1 fix" — but the table two rows below records PR-R2-01 as `REOPENED(PR-R1-01)` by fable and sol and PR-R2-04 as `REOPENED(PR-R1-08)` by sol and luna, and the saved outputs `round2-gpt-5.6-sol.md` and `round2-gpt-5.6-luna.md` contain no confirmation lines at all.
- repro_or_impact: An auditor reading the header takes two reopened findings as confirmed fixes; the audit record is internally inconsistent.

No high-severity findings.