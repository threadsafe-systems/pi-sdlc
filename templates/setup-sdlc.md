---
description: Adopt the pi-sdlc lifecycle in this repo (opt-in scaffolder)
---
Set this repository up to use the sdlc skill by writing its `.pi/sdlc/` manifest.

Run the scaffolder from the pi-sdlc package checkout, with the session's working
directory inside the target repo (so FS3 root resolution finds it), for example:

```bash
skills/sdlc/scripts/setup-sdlc.sh --with-models
```

Or non-interactively:

```bash
skills/sdlc/scripts/setup-sdlc.sh \
  --prefix myproj --label-prefix myproj-sdlc \
  --announce "Using the sdlc skill to drive this change through its lifecycle." \
  --with-models
```

The interview covers: `prefix`/`labelPrefix`, the announce string, an optional
GitHub tracker, an optional worktree hook (you supply YOUR worktree tool/skill
name — pi-sdlc ships none), and an optional after-phase notification `run` hook.

`run` hooks execute arbitrary shell commands with the agent's privileges from the
committed config; only commit hooks you trust (same boundary as `.pi/prompts`).

After it writes `.pi/sdlc/`, confirm the generated `sdlc.config.json` back to the
user and remind them to commit `.pi/sdlc/` to adopt the sdlc for the repo.
