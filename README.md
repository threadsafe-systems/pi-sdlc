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

With no manifest, the skill still runs phases + panels using built-in defaults
(`prefix`/`labelPrefix` = `sdlc`, standard doc paths); a models file is still
required to resolve a panel.

## The panel machine

```bash
skills/sdlc/scripts/ensure-panel-agent.sh pr_review          # stamp one project-scoped reviewer agent
skills/sdlc/scripts/resolve-panel.sh pr_review --author <vendor> --emit-tasks <agent>
```

`resolve-panel` reconciles your `sdlc.models.json` preference against live
credentials and prints a ready-to-paste `subagent` `tasks: [...]` array (one task
per resolved model, per-task `model` override). The full process law is in
`skills/sdlc/SKILL.md`.

## Licence

MIT. See `LICENSE`.
