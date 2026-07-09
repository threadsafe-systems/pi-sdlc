# ADR 0003: consumer-root resolution contract (FS3)

- Context: once the skill is a global git-discovered clone, its own directory is
  NOT the consumer repo; naive `git -C "$SKILL_DIR"` resolution would stamp agents
  into the skill repo, invisible to the consumer's pi session.
- Decision: resolve the consumer root independently of the skill dir, in fixed
  precedence: `--config/--repo-root` dir, then `$SDLC_ROOT`, then walk up from
  `$PWD` to `.pi/sdlc/sdlc.config.json`, then the git top-level of `$PWD` (defaults),
  then exit non-zero with a diagnostic.
- Consequences: the precedence and the terminal cases are frozen; changing them
  breaks callers. `--config`/`--repo-root` are directories, not files.
