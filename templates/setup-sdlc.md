---
description: Adopt the pi-sdlc lifecycle in this repo (opt-in scaffolder)
---
Set this repository up to use the sdlc skill by writing its `.pi/sdlc/` manifest.

This template can run before the `sdlc` skill has ever been loaded in this
session — do not assume `scripts/` is already grounded. First, find the `sdlc`
skill's own directory (the folder containing its `SKILL.md`, from your skills
listing or by locating the installed `pi-sdlc` package), and resolve
`<skill-dir>` to that absolute path. Run every `scripts/...` command below as
`<skill-dir>/scripts/...`, with the session's working directory kept inside the
target repo so FS3 root resolution finds it:

```bash
<skill-dir>/scripts/setup-sdlc.sh
```

For headless use, resolve `<skill-dir>` the same way and run
`node <skill-dir>/scripts/setup-sdlc.mjs` (or the `.sh` entry point).

Or non-interactively:

```bash
<skill-dir>/scripts/setup-sdlc.sh \
  --preset standard \
  --prefix myproj --label-prefix myproj-sdlc \
  --announce "Using the sdlc skill to drive this change through its lifecycle."
```

The interview covers: a **preset** (`solo` | `standard` | `full`) or each dial
hand-picked (`review.brainstorm/design/code/tasks`, `review.panelSize`,
`review.onShortfall`, `shape.separateSpec/publishToTracker/defaultTrack`);
`prefix`/`labelPrefix`; the announce string; an optional GitHub tracker; an
optional worktree hook (you supply YOUR worktree tool/skill name — pi-sdlc
ships none); and an optional after-phase notification `run` hook. Every dial is
also reachable non-interactively by flag (`--preset`, `--review-*`,
`--panel-size`, `--on-shortfall`, `--separate-spec`, `--publish-to-tracker`,
`--default-track`, repeatable `--override <track>:<dial>:<value>`).

`run` hooks execute arbitrary shell commands with the agent's privileges from
the committed config; only commit hooks you trust (same boundary as
`.pi/prompts`).

After it writes `.pi/sdlc/`, confirm the generated `sdlc.config.json` back to
the user, then have them commit `.pi/sdlc/` — adoption is the manifest blob in
the current git `HEAD`, and readiness also needs the committed `panels` roster.
Verify with `<skill-dir>/scripts/sdlc-status.sh` in pi, or headlessly with
`node <skill-dir>/scripts/sdlc-status.mjs` (exit 0 = ready; exit 3 = adopted
but incomplete, for example uncommitted `.pi/sdlc/` files).
