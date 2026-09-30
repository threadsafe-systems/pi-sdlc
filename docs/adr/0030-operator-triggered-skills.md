# ADR 0030: the sdlc skills are operator-triggered; not-adopted is silent

- Status: accepted
- Date: 2026-09-25
- Amends: ADR 0010 (the exit-1 offer), ADR 0015 (the exit-1 branch, and a
  root outside any git repository is `not-adopted`), ADR 0023 (the same
  classification in the FS8 surface)

- Context: pi-sdlc is usually installed globally, so its skills are listed in
  every session. The `sdlc` description told agents to load it "at the start of
  any feature or change", and the exit-1 (`not-adopted`) branch then told them
  to offer `/setup-sdlc` or a session-only advisory mode that needed the user's
  in-session consent. Agents in repositories that had never adopted the sdlc
  therefore stopped to ask a question the operator never wanted. A working
  directory outside any git repository hit the same stop through exit 2:
  `sdlc-status` reported `root.resolve` or `git.repository` as an error. Those
  checks also error for a repository that exists but that git cannot use (git
  missing, dubious ownership, a pruned worktree), so the agent could not treat
  them as "no repository" without letting an adopted repository slip through.
- Decision: both skills (`sdlc`, `sdlc-retro`) are operator-triggered. Their
  descriptions say they load only on an explicit operator request
  (`/skill:<name>`, a `/sdlc-*` command, or a direct ask). They stay listed in
  the system prompt rather than setting `disable-model-invocation: true`,
  because pi hides such skills entirely and the `/sdlc-*` and `/setup-sdlc`
  prompt templates resolve the skill directory from that listing. On exit 1
  the agent does not announce, ask, or mention adoption; it sets the lifecycle
  aside and continues the task. Advisory mode is removed. Every exit 2 and
  exit 3 still stops, and the pre-exit-0 prohibitions are unchanged.
  `sdlc-status` reports a root outside any git repository as `not-adopted`
  (`root.resolve` pass, `git.repository` fail, exit 1), but only when the
  filesystem proves it: the root is an existing directory, `$GIT_DIR` is unset,
  and neither the root nor any ancestor, on its given or symlink-resolved path,
  holds a `.git` entry or is itself a git directory. The proof never runs git,
  so a repository git cannot use still reports `error`. This holds however the
  root is given (working directory, `--repo-root`, or `$SDLC_ROOT`).
  `sdlc-status` exit codes, state names, check ids, and output shape do not
  change; a manifest on disk outside git is still not adoption. The standalone
  `/sdlc-*` commands keep their unadopted sampling path, since only the
  operator invokes them.
- Consequences: adoption is purely an operator action. Adopted repositories no
  longer get the lifecycle ambiently; the operator invokes it, and CI's
  `check-lifecycle`, where a repository installs it, still gates their PRs. An operator who explicitly runs
  `/skill:sdlc` in an unadopted repository gets no acknowledgement that the
  lifecycle did not start; the agent simply does the task. Operator triggering
  rests on description wording, which a model can ignore; the cost of that
  failure in an unadopted repository is one silent status check.
  Callers of `sdlc-status` see a root outside any git repository move from exit
  2 to exit 1. Outside the standalone commands, there is no sanctioned way to
  follow the lifecycle as non-binding guidance in an unadopted repository.
