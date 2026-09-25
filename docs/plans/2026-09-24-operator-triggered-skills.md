# Operator-triggered sdlc skills; no opt-in halt in unadopted repos

Track: **reversible** · Slug: `operator-triggered-skills`

## Brainstorm provenance

Plain-mode brainstorm, 2026-09-24, no upstream map. No sketch was drawn: the
change is prose and frontmatter across a handful of files, with no structural
shape.

Decisions ratified in the dialogue, verbatim:

- **Scope of "all skills".** Only this package's skills, `sdlc` and
  `sdlc-retro`. The global skills under `~/.agents/skills` are out of scope.
- **Visible, not hidden.** In pi, `disable-model-invocation: true` removes a
  skill from the system prompt, so "not model-invoked" and "hidden" are the same
  switch. The operator does not mind the skills being visible. Both skills stay
  listed. Operator triggering is carried by the skill descriptions instead.
- **No opt-in halt.** When `sdlc-status` reports `not-adopted`, the agent does
  not announce, does not ask, and makes no mention of the opt-in (no
  `/setup-sdlc` offer). It carries on with the task outside the lifecycle.
- **Advisory mode is deleted**, not kept as an operator-requested mode.
- **Exit 2 (`error`) and exit 3 (`not-ready`) are unchanged.** Both can only
  occur in an adopted repo, so stopping there is not an opt-in halt.
  *Amended during Implement — see "Amendments".*
- **Track: reversible.**
- **Constraints:** none identified.

Evidence gathered during the dialogue:

- pi 0.80.10 `dist/core/skills.js` filters `disableModelInvocation` skills out
  of the prompt skill list; `docs/skills.md` documents the flag as "hidden from
  system prompt. Users must use `/skill:name`".
- The `/sdlc-*` and `/setup-sdlc` templates resolve `<skill-dir>` from the
  skill's listed location. pi prompt templates have no path variable, so hiding
  the skill would strand them. Keeping the skills visible avoids this.
- The e2e L2 discovery gate requires the install-root `SKILL.md` location in
  the request stream, which the visible listing provides.

## Problem statement

- Actor/situation: an operator running pi with pi-sdlc installed globally, while
  an agent works in any repository that has not committed
  `.pi/sdlc/sdlc.config.json`.
- Baseline evidence: the `sdlc` description tells every agent to "Use at the
  start of any feature or change … This is the project law", so agents load it
  ambiently. `SKILL.md`'s exit-1 branch then tells them to offer `/setup-sdlc`
  or advisory mode, and advisory mode needs "the user's explicit in-session
  consent". Agents therefore stop and ask before doing unrelated work.
- Consequence: every session in a non-adopted repository pauses for a
  permission question the operator never wanted. Adoption is an operator
  decision made once, not something an agent should raise.

## Non-goals

- Changing the global skills under `~/.agents/skills` — out of scope by
  decision.
- Hiding the skills with `disable-model-invocation` — it strands the `/sdlc-*`
  templates' skill-directory lookup and the operator does not need it.
- Changing `sdlc-status` exits, states, or check ids — the four-state contract
  is sound; only the agent's reaction to exit 1 changes.
- Changing the standalone templates' `not-adopted` sampling path — those are
  operator-invoked commands, so running them in an unadopted repo is already an
  operator decision.
- Changing `/setup-sdlc` or the `lib.mjs` "not opted in" error — both are
  operator-facing tools, not agent prompts.

## Alternatives considered

- Do nothing — the halt continues in every unadopted repository.
- `disable-model-invocation: true` on both skills — the hard guarantee, but it
  removes the skill location the templates and the e2e discovery gate depend on,
  and needs either a pi extension or a two-command workflow to recover it.
- Keep advisory mode as an operator-requested mode — rejected by the operator;
  it is a second, weaker lifecycle with its own rules to maintain.
- Say one line that the repo has not adopted the sdlc — rejected; the operator
  wants no mention of the opt-in.

## Objectives and scope

- [objective] An agent in a repository that has not adopted the sdlc never
  halts, asks, or mentions adoption because of the sdlc; it continues the task.
- [objective] Neither `sdlc` nor `sdlc-retro` is loaded unless the operator asks
  for it.
- [solution decision] Rewrite the `description` frontmatter of
  `skills/sdlc/SKILL.md` and `skills/sdlc-retro/SKILL.md` to state they load
  only on an explicit operator request (`/skill:<name>`, a `/sdlc-*` command,
  or a direct ask), and add a matching invocation line to the `sdlc` kernel.
- [solution decision] Rewrite the `SKILL.md` exit-1 (`not-adopted`) branch:
  do not announce, do not ask, do not mention adoption; set the sdlc aside and
  continue the task.
- [solution decision] Exit 2 whose failing check is `root.resolve` or
  `git.repository` is handled exactly as exit 1 (see "Amendments").
- [solution decision] Delete advisory mode from `SKILL.md` and
  `references/system-reference.md` §3, keeping the "exit 2 and exit 3 stop"
  rules without the advisory wording.
- [solution decision] Update `README.md`'s adoption paragraph, add ADR 0030
  recording the policy, and add an "amended by ADR 0030" note to ADR 0010 and
  ADR 0015.
- [solution decision] Update `test/docs.test.js` startup fragments and e2e
  scenario A so they assert the new behaviour.
- [constraint] Keep the pre-exit-0 prohibitions (no phase, hooks, stamping,
  tracker mutation, or gate claims) intact.
- [constraint] Keep both skills listed in the system prompt.
- parked: whether the global `~/.agents/skills` should follow — destination:
  the operator, outside this repository.

## Outcome proof

| Goal | Question | Metric | Baseline | Target/window | Evidence owner | Carried to |
|---|---|---|---|---|---|---|
| No opt-in halt | Does the kernel still tell an agent to offer adoption or advisory mode on exit 1? | proxy: `test/docs.test.js` asserts the exit-1 branch forbids asking/mentioning adoption and that no advisory wording remains in `SKILL.md` or `system-reference.md`; e2e scenario A asserts the transcript carries no `/setup-sdlc` or advisory text | the kernel mandates the offer | test green at PR | PR author | Build task checks |
| Operator-triggered | Do the skill descriptions still invite ambient loading? | proxy: a test asserts both descriptions state operator-only loading and no longer say "Use at the start of any feature or change" | ambient description | test green at PR | PR author | Build task checks |

Agent behaviour is prose law (ADR 0011), so the proxies prove the law's text, not
agent compliance. No live-model measurement is planned; the operator judges it
in use.

## Non-functional requirements & repo-doc sweep

| Area | Applicability + reason | Target | Binding phase | Verification |
|---|---|---|---|---|
| README / AGENTS.md docs | applies — README describes the exit-1 opt-in prompt and advisory mode; no AGENTS.md exists | README adoption paragraph matches the new behaviour | Implement | `test/docs.test.js` OH12 and a new README assertion |
| ADR record | applies — ADR 0010/0015 describe the exit-1 offer | ADR 0030 records the change; 0010 and 0015 point at it | Implement | `test/docs.test.js` ADR checks |
| Observability | n/a — no telemetry event or run-store field changes | — | — | — |
| Security and secret delivery | n/a — no credentials, scripts, or network paths change | — | — | — |
| CI/CD | applies — the unit suite and e2e L2 scenario A assert the old text | `npm test`, `npm run lint`, and `npm run test:e2e` pass | PR | CI green |
| Usability (ISO 25010) | applies — the change exists to remove an interruption | exit-1 branch contains no question to the human | Implement | docs test |
| Compatibility (ISO 25010) | applies — adopted repositories stop getting ambient lifecycle enforcement | release note states the skills are operator-triggered | PR | semantic-release changelog entry |

## Pre-mortem

| Risk | Trigger | Consequence | Mitigation | Owner | Destination |
|---|---|---|---|---|---|
| Agents still load `sdlc` ambiently | a model treats "starting a change" as a reason to load a listed skill despite the description | the kernel runs in sessions the operator did not trigger | the description leads with the operator-only rule; the exit-1 branch is silent anyway, so the worst case in an unadopted repo is one status command | PR author | Build task 1 |
| Adopted repos lose enforcement unnoticed | an operator expects the law to apply without invoking it | a change lands outside the lifecycle | release note and README say how to invoke; CI `check-lifecycle` still gates PRs in adopted repos | PR author | Build task 2 |
| A stale advisory reference survives | advisory wording in a file the sweep missed | agents still see an advisory option | test asserts no "advisory mode" text in `SKILL.md` and `system-reference.md` | PR author | Build task 3 |

## Definition of done

- `skills/sdlc/SKILL.md` and `skills/sdlc-retro/SKILL.md` descriptions state
  operator-only loading; neither carries `disable-model-invocation`.
- The `SKILL.md` exit-1 branch contains no offer, question, or mention of
  adoption, and tells the agent to continue the task outside the lifecycle.
- No text in `SKILL.md` or `references/system-reference.md` matches
  `/advisory mode/i`.
- An exit 2 caused by `root.resolve` or `git.repository` is handled as exit 1;
  every other exit 2, and exit 3, still stops; all five pre-exit-0 prohibitions
  remain.
- ADR 0030 exists with Context/Decision/Consequences; ADR 0010 and 0015 name it.
- `npm test`, `npm run lint`, and `npm run test:e2e` pass.

## Context for the next agent

- The `review.design: advisory` config value is a different concept (a
  non-blocking design panel) and stays.
- `templates/sdlc-*.md` keep their `not-adopted` sampling path unchanged.
- Release type: `feat:` (minor). No config shape changes, so the ADR 0021
  release guard does not apply.

## Amendments

- **2026-09-25 — non-git directories halted through exit 2.** Trigger: running
  `sdlc-status` in a fresh temp directory during Implement returned exit 2
  (`git.repository` failing with `--repo-root`, `root.resolve` failing without
  it), not exit 1. The brainstorm premise that exit 2 only occurs in adopted
  repositories was false, so an agent in any non-git directory would still
  stop. Class **(b)**: the objective is unchanged and no frozen shape is
  touched; the kernel's exit-2 branch now handles those two checks exactly as
  exit 1. Disposition: amended in place. Author: the implementing agent
  (anthropic/claude-opus-5-5).
