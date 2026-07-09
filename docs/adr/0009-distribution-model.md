# ADR 0009: distribution as a dedicated pi-* repo

- Context: two precedents exist — the personal `~/.agents/skills/` mono-repo, and
  dedicated `threadsafe-systems/pi-*` repos (pi-worktree, pi-repo-html, pi-md-to-pdf)
  for productised, shareable pi tooling surfaced via pi's git skill discovery.
- Decision: ship as `threadsafe-systems/pi-sdlc` with `skills/sdlc/`, a
  `package.json` declaring `"pi": {"skills": ["./skills"]}`, and an MIT licence.
- Consequences: portable and installable per-project; a shareable ThreadSafe asset,
  not tied to any one consumer repo.
