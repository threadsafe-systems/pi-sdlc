# pi-sdlc

A portable, project-agnostic **software-development lifecycle** skill for
[pi](https://github.com/earendil-works/pi). It gives any repo one enforced way a
change enters the codebase: **brainstorm → plan → spec → build → implement → PR**,
with per-phase adversarial review panels, a per-task validator, worktree
discipline, and optional GitHub tracker-backed builds.

The package ships two skills — `sdlc`, the lifecycle itself, and `sdlc-retro`,
the post-mortem pipeline over the lifecycle telemetry `sdlc` emits — plus a set
of standalone prompt commands.


## Install

pi discovers the package via its git package metadata (`package.json`'s
`"pi": {"skills": ["./skills"], "prompts": ["./templates"]}`). Clone under pi's
git skill path, or add `threadsafe-systems/pi-sdlc` to your pi packages, then
invoke `/skill:sdlc`.

### Standalone entrypoints

`templates/` exports one prompt command per lifecycle phase, so a session can
enter mid-lifecycle instead of replaying the router: `/sdlc-brainstorm`,
`/sdlc-plan`, `/sdlc-spec`, `/sdlc-tasks` (the Build phase), `/sdlc-implement`,
and `/sdlc-pr-review`. Each is a thin router into the same phase reference the
full lifecycle uses, so the phase's gates, hooks, and refusal conditions are
identical either way — entering at a phase is not a licence to skip the ones
before it. `/setup-sdlc` is the adoption scaffolder.

## Configure a project

Create `.pi/sdlc/` in your repo:

- `sdlc.config.json` — identity (`prefix`, `labelPrefix`, `announce`), optional
  paths/tracker/hooks, the `review`/`shape` intent blocks (with optional
  per-track `overrides`), and the merged per-phase `panels` roster. See
  `skills/sdlc/schema/sdlc.config.example.json` and its JSON Schema. This
  schemaVersion-3 file is the single frozen consumer configuration surface.
- `prompts/<name>.prompt.md` (optional) — override a phase reviewer prompt when
  your project needs a specific grounding the generic prompt does not carry.

Without adoption the skill does not run as project law. `sdlc-status` is the
mechanical four-state gate: exit 0 `ready`, 1 `not-adopted`, 2 `error`, 3
`not-ready`. Adoption means the **current git `HEAD`** contains
`.pi/sdlc/sdlc.config.json` — a file merely on disk is not adoption — and
readiness (exit 0) additionally requires that manifest clean and valid with a
merged `panels` roster. Invoking the skill in a repo whose
`HEAD` has no manifest prompts you to adopt it with `/setup-sdlc`, or to
continue in a clearly-labelled session-only advisory mode. The fastest way to
opt in is the `/setup-sdlc` scaffolder, which interviews you (identity,
optional tracker, optional worktree and notification hooks) and writes the
manifest — then commit `.pi/sdlc/` to actually adopt.

### Migrating callers of the old two-state status

FS8 (ADR 0015/0016) intentionally breaks the old `sdlc-status` output and
exits:

- Exit 0 used to mean "manifest present and valid"; it now means fully ready.
  A repo that formerly exited 0 on a filesystem-only or dirty manifest may now
  exit 3 until the merged config is committed, clean, and carries `panels`.
- Exit 3 is new (adopted but incomplete or dirty); shell callers must branch
  on 0/1/2/3 explicitly.
- Non-git roots move to exit 2: they historically exited 1 without a manifest
  and 0 with a valid one. Non-git consumers must adopt inside a git
  repository.
- The legacy text summary keys (`opted-in:`, `prefix:`, `labelPrefix:`,
  `hooks:`, `workflow:`, `models:`) are removed; parse the FS8 `check:` lines
  or preferably `--format json`.

## Local workflow hooks

An optional `hooks` object in `sdlc.config.json` lets a repo run adjacent actions
before/after any lifecycle phase (`brainstorm`, `plan`, `spec`, `build`,
`implement`, `pr`, or `*`). Each hook is either a `{ "run": "<command>" }` shell
command or a `{ "use": "skill:… | tool:…", "do": "…" }` agent instruction;
`before` hooks block the phase on failure, `after` hooks warn. This is how a repo
expresses preferences the global skill must not hard-code — for example, using
your own worktree tool to enter a fresh workspace at `implement`, or pinging a
channel after each phase. `run` hooks execute with the agent's privileges from
the committed config, so only commit hooks you trust. Free-prose local rules that
don't fit a hook go in `.pi/sdlc/workflow.md`.

## The panel machine

```bash
scripts/ensure-panel-agent.sh pr_review          # skill-relative in pi
scripts/resolve-panel.sh pr_review --author <vendor> --emit-tasks <agent>
```

Every `scripts/…` path in this README and throughout the skill resolves against
the **loaded skill directory**, never the repository root — the skill has no
fixed install path, so it may not name one. Headless callers invoke the `.mjs`
sibling of any `.sh` as `node <skill-dir>/scripts/<name>.mjs`.

`resolve-panel` reconciles the merged config's `panels` preference against live
credentials and prints a ready-to-paste `subagent` `tasks: [...]` array (one task
per resolved model, per-task `model` override). The full process law is in
`skills/sdlc/SKILL.md`.

## Portable per-task validator

Each implementation task is gated by a committed **validation manifest**
(`docs/validation/<feature>/<task-id>.json`, schema
`skills/sdlc/schema/task-validation-manifest.schema.json`) projected from its
approved Build task. The manifest declares the task's checks as exact argv
arrays across five categories (`tests`, `static`, `scenarios`, `standards`,
`bannedPatterns`), each `required` or `n/a` with a Build-approved reason, plus
the mapping from each owned spec scenario to the checks that evidence it.

Each check may carry an optional **`scope`** array (`("full" | "task")[]`). Two
rules apply: when the `tests` category is `required`, at least one referenced
check must be tagged `"full"` (the regression net); and when `scenarios` is
`required`, each owned scenario whose evidence cites a `tests`-category check
must cite at least one tagged `"task"` (that task's specific tests). One check
that serves both roles tags `scope: ["full", "task"]`. A manifest with no `scope`
tags on its required `tests` checks is rejected — author them so the runner can
tell the broad suite from a task's own evidence (see
`docs/specs/2026-07-12-sdlc-portable-validator.md` §11).

The deterministic runner executes it:

```bash
<skill-dir>/scripts/validate-task.sh \
  --manifest <repository validation home>/<feature>/<task-id>.json --repo-root . --format json \
  --report <configured paths.reviews>/task-validate-<feature>-<task-id>-<date>/runner-report.json
```

The runner — not the model — runs only declared commands (`shell:false`),
evaluates categories/scenarios, bounds and redacts evidence, and exits `0` PASS /
`1` FAIL / `2` ERROR. The validator subagent runs it, confirms exit and verdict
agree, and reports results; `scripts/verify-task-receipt.mjs` checks the stored
receipt hashes. Validation is portable: a TypeScript task declares `tsc`, a
JavaScript task declares `node --check` and its linter, another repo declares its
own tools. There is no unconditional TypeScript check and no assumed
`CONTRIBUTORS` file (see `docs/adr/0013-*` and `0014-*`).

**Migrating a whole-file validator prompt override:** overrides keep FS7 heading
compatibility but must adopt the manifest/runner contract (run the runner, report
its results) before use; a stale override that still greps for `tsc`/
`CONTRIBUTORS` no longer reflects the generic law.

## Tracker-backed builds

A `tracker` block in `sdlc.config.json` (a `repo`, and a `board` number/URL)
unlocks two optional modes: Brainstorm **map mode**, where an oversized or foggy
effort becomes a map issue with decision tickets, and the Build **epic/sub-issue/
board** mode, where an approved build plan is projected into a tracked epic. The
projection fires at the task count set by `shape.publishToTracker` (`"never"`
disables it). The committed plan stays the source of truth; the tracker is its
projection.

Every tracker or board mutation — issue creation, status changes, sub-issue and
blocking edges, frontier, claim — goes through one helper, whose subcommands
cover the GraphQL and Projects-v2 calls the mode needs:

```bash
scripts/tracker-ops.sh frontier --parent <epic-issue> --format json
scripts/tracker-ops.sh set-status --item <issue-number> --status "In Progress"
```

The mechanics and the label vocabulary are documented in
`skills/sdlc/assets/tracker-ops.md`.

## Lifecycle telemetry and retros

An instrumented run keeps a durable manifest of its own lifecycle at
`.pi/sdlc/runs/<slug>/events.jsonl` — run start, phase entry and exit, human gate
approvals, panel dispatch and consolidation, task validation, PR events. The run
store is git-ignored: raw material stays local.

```bash
scripts/record-run-event.sh --list                 # the event vocabulary
scripts/record-run-event.sh --describe phase.entered   # that event's payload
scripts/record-run-event.sh phase.entered --slug <slug> --payload '{...}'
scripts/harvest-panel.sh --phase pr_review --round 1 --from <subagent-dir>
```

Emission is fail-soft: an unresolvable run identity or an unwritable store
degrades to a single stderr warning and never changes lifecycle behaviour.
Emission never writes to stdout; only the two informational flags do.

The `sdlc-retro` skill is the post-mortem half. It collects the run store into a
distilled, schema-valid record and renders it as one self-contained HTML
dashboard — phase timing, cost, panel precision, human wait, and rework:

```bash
scripts/collect-run.sh --slug <slug>               # -> docs/retros/<slug>/run.json
scripts/render-retro.sh --run docs/retros/<slug>/run.json
```

Unlike the run store, the distilled record and its dashboard are meant to be
committed. `collect-run` takes injectable `--git-cmd`/`--gh-cmd`/`--llm-cmd`
seams; `--no-llm` drops the LLM seam entirely, and `run.json` still validates —
with narratives, steering classification, and panel precision reported as absent
rather than guessed.

## Adoption bundle and lifecycle checking

Re-run `/setup-sdlc` to provision the adoption bundle. It creates or retains
configuration, a PR template with a machine-readable `sdlc` declaration block,
and (when requested) prompt overrides. It refuses conflicting consumer-authored
files and gives instructions rather than merging or overwriting them. Existing
configuration is retained on a bundle re-run; replacing it still requires
`--force`. Copied prompts are consumer-owned overrides and refresh by deleting
the copy and re-running with `--copy-prompts`.

Declare one of these in every lifecycle PR:

- `track: irreversible` + `slug:` — plan, Specification, and Build plan;
- `track: reversible` + `slug:` — plan and Build plan; no Specification;
- `track: none` + `reason:` — an exemption, not a third lifecycle track.

Run the checker locally against a PR body:

```bash
node <skill-dir>/scripts/check-lifecycle.mjs \
  --body pr-body.md --repo-root . --format text
```

The checker is read-only and offline. GitHub Actions integration is optional:
setup offers a pinned pi-sdlc workflow only when no CI configuration is detected;
repositories with existing CI receive a copy-paste snippet instead. The local
checker is canonical, and CI enforces the declaration only where that workflow
or snippet is configured.

## Reference consistency

The package ships a versioned normative-reference inventory and an offline checker
for package-owned claims. Consumer-owned files such as `.pi/sdlc/workflow.md`
and local prompt overrides are not silently certified; external facilities such
as GitHub Projects are reported as external. Run the checker from the installed
skill directory when auditing the package itself. It does not replace
`sdlc-status` readiness or the declared-track lifecycle checker.

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

## Licence

MIT. See `LICENSE`.
