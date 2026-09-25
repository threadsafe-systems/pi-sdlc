# ADR 0030: the sdlc skills are operator-triggered; not-adopted is silent

- Status: accepted
- Date: 2026-09-25
- Amends: ADR 0010 (the exit-1 offer), ADR 0015 (the exit-1 branch, and exit 2
  when `root.resolve` fails)

- Context: pi-sdlc is usually installed globally, so its skills are listed in
  every session. The `sdlc` description told agents to load it "at the start of
  any feature or change", and the exit-1 (`not-adopted`) branch then told them
  to offer `/setup-sdlc` or a session-only advisory mode that needed the user's
  in-session consent. Agents in repositories that had never adopted the sdlc
  therefore stopped to ask a question the operator never wanted. A working
  directory outside any git repository hit the same stop through exit 2:
  `sdlc-status` run from such a directory with no explicit root fails
  `root.resolve`.
- Decision: both skills (`sdlc`, `sdlc-retro`) are operator-triggered. Their
  descriptions say they load only on an explicit operator request
  (`/skill:<name>`, a `/sdlc-*` command, or a direct ask). They stay listed in
  the system prompt rather than setting `disable-model-invocation: true`,
  because pi hides such skills entirely and the `/sdlc-*` and `/setup-sdlc`
  prompt templates resolve the skill directory from that listing. On exit 1,
  and on exit 2 when the failing check is `root.resolve`, the agent does not
  announce, ask, or mention adoption; it sets the lifecycle aside and continues
  the task. `root.resolve` is the only exit-2 check treated this way: it fails
  only when no explicit root was passed and neither a manifest nor a git
  repository encloses the working directory. `git.repository` also fails when
  `git` cannot run or an explicit root is wrong, so an adopted repository can
  produce it; it still stops. Advisory mode is removed. Other exit-2 causes and
  exit 3 still stop, and the pre-exit-0 prohibitions are unchanged.
  `sdlc-status` states, exits, and check ids do not change. The standalone
  `/sdlc-*` commands keep their unadopted sampling path, since only the
  operator invokes them.
- Consequences: adoption is purely an operator action. Adopted repositories no
  longer get the lifecycle ambiently; the operator invokes it, and CI's
  `check-lifecycle` still gates their PRs. An operator who explicitly runs
  `/skill:sdlc` in an unadopted repository gets no acknowledgement that the
  lifecycle did not start; the agent simply does the task. Operator triggering
  rests on description wording, which a model can ignore; the cost of that
  failure in an unadopted repository is one silent status check. Outside the
  standalone commands, there is no sanctioned way to follow the lifecycle as
  non-binding guidance in an unadopted repository.
