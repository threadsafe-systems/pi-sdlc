# ADR 0030: the sdlc skills are operator-triggered; not-adopted is silent

- Status: accepted
- Date: 2026-09-25
- Amends: ADR 0010 (the exit-1 offer), ADR 0015 (the exit-1 branch)

- Context: pi-sdlc is usually installed globally, so its skills are listed in
  every session. The `sdlc` description told agents to load it "at the start of
  any feature or change", and the exit-1 (`not-adopted`) branch then told them
  to offer `/setup-sdlc` or a session-only advisory mode that needed the user's
  in-session consent. Agents in repositories that had never adopted the sdlc
  therefore stopped to ask a question the operator never wanted. A non-git
  directory hit the same stop through exit 2 (`root.resolve` or
  `git.repository` failing).
- Decision: both skills (`sdlc`, `sdlc-retro`) are operator-triggered. Their
  descriptions say they load only on an explicit operator request
  (`/skill:<name>`, a `/sdlc-*` command, or a direct ask). They stay listed in
  the system prompt rather than setting `disable-model-invocation: true`,
  because pi hides such skills entirely and the `/sdlc-*` and `/setup-sdlc`
  prompt templates resolve the skill directory from that listing. On exit 1,
  and on exit 2 when the failing check is `root.resolve` or `git.repository`,
  the agent does not announce, ask, or mention adoption; it sets the lifecycle
  aside and continues the task. Advisory mode is removed. Other exit-2 causes
  and exit 3 still stop, and the pre-exit-0 prohibitions are unchanged.
  `sdlc-status` states, exits, and check ids do not change.
- Consequences: adoption is purely an operator action. Adopted repositories no
  longer get the lifecycle ambiently; the operator invokes it, and CI's
  `check-lifecycle` still gates their PRs. Operator triggering rests on
  description wording, which a model can ignore; the cost of that failure in an
  unadopted repository is one silent status check. There is no longer any
  sanctioned way to follow the lifecycle as non-binding guidance in an
  unadopted repository.
