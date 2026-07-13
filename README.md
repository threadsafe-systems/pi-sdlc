# pi-sdlc

A portable, project-agnostic **software-development lifecycle** skill for
[pi](https://github.com/earendil-works/pi). It gives any repo one enforced way a
change enters the codebase: **brainstorm → plan → spec → build → implement → PR**,
with per-phase adversarial review panels, a per-task validator, worktree
discipline, and optional GitHub tracker-backed builds.

It is the generalised form of the `loom-sdlc` skill, driven by a small per-project
manifest so the process is identical everywhere while the identity (name, labels,
tracker, model roster) is per-project.

## Install

pi discovers the skill via its git package metadata (`package.json`'s
`"pi": {"skills": ["./skills"]}`). Clone under pi's git skill path, or add
`threadsafe-systems/pi-sdlc` to your pi packages, then invoke `/skill:sdlc`.

## Configure a project

Create `.pi/sdlc/` in your repo:

- `sdlc.config.json` — identity: `prefix`, `labelPrefix`, `announce`, optional
  `paths` and `tracker`. See `skills/sdlc/schema/sdlc.config.example.json` and its
  JSON Schema.
- `sdlc.models.json` — the per-phase panel model roster (required to run panels).
  See `skills/sdlc/schema/sdlc.models.example.json`.
- `sdlc.config.json` and `sdlc.models.json` are the **frozen surfaces** consumers
  bind to (additive within a major).
- `prompts/<name>.prompt.md` (optional) — override a phase reviewer prompt when
  your project needs a specific grounding the generic prompt does not carry.

With no manifest the skill does not run as project law: invoking it in a repo
that has not committed `.pi/sdlc/sdlc.config.json` prompts you to adopt it with
`/setup-sdlc`, or to continue in a clearly-labelled session-only advisory mode.
The fastest way to opt in is the `/setup-sdlc` scaffolder, which interviews you
(identity, optional tracker, optional worktree and notification hooks) and writes
the manifest. A models file is still required to resolve a panel.

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
skills/sdlc/scripts/ensure-panel-agent.sh pr_review          # stamp one project-scoped reviewer agent
skills/sdlc/scripts/resolve-panel.sh pr_review --author <vendor> --emit-tasks <agent>
```

`resolve-panel` reconciles your `sdlc.models.json` preference against live
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

The deterministic runner executes it:

```bash
skills/sdlc/scripts/validate-task.sh \
  --manifest docs/validation/<feature>/<task-id>.json --repo-root . --format json \
  --report docs/reviews/task-validate-<feature>-<task-id>-<date>/runner-report.json
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
