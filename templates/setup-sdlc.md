---
description: Adopt the pi-sdlc lifecycle in this repo (opt-in scaffolder)
---
Set this repository up to use the sdlc skill by writing its `.pi/sdlc/` manifest.

In pi, run the skill-relative command below; the loaded skill supplies its
`scripts/` entry point, while the session's working directory remains
inside the target repo so FS3 root resolution finds it:

```bash
scripts/setup-sdlc.sh --with-models
```

For headless use, resolve `<skill-dir>` from the installed skill and run
`<skill-dir>/scripts/setup-sdlc.sh` (or the direct Node `.mjs` entry point).

Or non-interactively:

```bash
scripts/setup-sdlc.sh \
  --prefix myproj --label-prefix myproj-sdlc \
  --announce "Using the sdlc skill to drive this change through its lifecycle." \
  --with-models
```

The interview covers: `prefix`/`labelPrefix`, the announce string, an optional
GitHub tracker, an optional worktree hook (you supply YOUR worktree tool/skill
name — pi-sdlc ships none), and an optional after-phase notification `run` hook.

`run` hooks execute arbitrary shell commands with the agent's privileges from the
committed config; only commit hooks you trust (same boundary as `.pi/prompts`).

After it writes `.pi/sdlc/`, confirm the generated `sdlc.config.json` back to
the user, then have them commit `.pi/sdlc/` — adoption is the manifest blob in
the current git `HEAD`, and readiness also needs the committed models file.
Verify with `scripts/sdlc-status.sh` in pi, or `node <skill-dir>/scripts/sdlc-status.mjs` headlessly (exit 0 = ready; exit 3 =
adopted but incomplete, for example uncommitted `.pi/sdlc/` files).
