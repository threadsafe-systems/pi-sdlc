# ADR 0010: repo opt-in is the presence of a committed manifest

> Superseded by ADR 0015: the committed-manifest intent below is now
> mechanically enforced against current `HEAD`, with four-state readiness
> (0 ready / 1 not-adopted / 2 error / 3 not-ready). The exit codes described
> here are historical.

- Context: the skill previously ran as project law in any repo, falling back to
  built-in defaults (`prefix`/`labelPrefix` = `sdlc`, standard doc paths) when
  `.pi/sdlc/sdlc.config.json` was absent (FS3 root resolution ends at the git
  top-level with defaults; `readConfig` returned defaults for a missing
  manifest). That made adoption implicit and made "this repo uses the sdlc"
  unfalsifiable — a foreign repo would silently be driven under law.
- Decision: a repo opts in by committing `.pi/sdlc/sdlc.config.json`. A new
  `sdlc-status` script is the mechanical gate (exit 0 opted-in / 1 no manifest /
  2 invalid); the skill announces and runs as law only on exit 0. On exit 1 it
  offers `/setup-sdlc` or an explicit, session-only *advisory mode* (no announce
  string, no gate claims, no tracker mutations, no stamped agents). `readConfig`
  gains a `{ requireManifest: true }` mode used by the gate; its default
  behaviour (defaults when absent) is unchanged so the existing panel scripts
  (`ensure-panel-agent`, `resolve-panel`, FS5) are untouched. FS3 `resolveRoot`
  is likewise untouched — this is a skill-policy + `readConfig` change, not a
  root-resolution change.
- Consequences: adoption is explicit and travels with the clone; CI presence
  checks already key off committed artifacts. The behaviour change is
  intentionally not a schema-version bump (no `sdlc.config.json` shape changed);
  it is a policy change recorded here. Repos that previously relied on the
  no-manifest default now see the opt-in prompt instead — acceptable at current
  consumer count, and the migration is a single `/setup-sdlc` run.
