# ADR 0011: local workflow hooks are agent-executed prose, not an engine

- Context: worktree usage (and similar per-team practices) was hard-coded in the
  skill's Implement row ("in a worktree"), naming a practice without a mechanism
  and wrongly prescribing a preference. Repos need a way to layer local process
  onto the identical global lifecycle — enter a worktree at `implement`, notify
  after a phase — without pi-sdlc taking a dependency on any specific tool.
- Decision: add an optional `hooks` object to `sdlc.config.json` (FS1, additive
  within schemaVersion 1). Phase keys are the six lifecycle names + `*`;
  `before`/`after` arrays hold items that are exactly `{run}` (a verbatim shell
  command) or `{use, do}` (an agent-interpreted `skill:`/`tool:` instruction).
  `before` hooks block on failure, `after` hooks warn. `run`/`do` are single-line
  by contract so the mandatory announce-on-fire audit lines stay greppable.
  Enforcement is prose law executed by the agent — the same model as the iron
  law — with NO mechanical runner and NO CI check that hooks fired; the audit
  trail is the announce-on-fire transcript. pi-sdlc names no worktree tool of its
  own; a repo that wants one supplies its own `use` target (the scaffolder asks).
  `run` hooks are arbitrary command execution inside pi's existing project-trust
  boundary (same as `.pi/prompts`); the agent echoes each command and the
  scaffolder warns when writing one.
- Consequences: repos express preference without the framework prescribing it,
  keeping the dependency direction clean (pi-sdlc never names pi-worktree). The
  honesty cost is explicit: hooks are as enforceable as the rest of the skill —
  no more, no less — and a hostile committed config can run commands, mitigated
  by trust-boundary framing and announce-on-fire, not by sandboxing. A future
  engine or sub-mode hook points (map tickets, build sub-issues) remain additive.
