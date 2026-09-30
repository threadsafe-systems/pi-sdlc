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
- Changing `sdlc-status` exit codes, state names, check ids, or output shape —
  the four-state contract is sound. One classification changes: a root that no
  git repository encloses is `not-adopted`, not `error` (see "Amendments").
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
- [solution decision] `sdlc-status` reports `not-adopted` (exit 1) when
  inspection proves no git repository encloses the root or the working
  directory, so the kernel's exit-2
  branch needs no exception and every exit 2 stops (see "Amendments").
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
| Security and secret delivery | n/a — no credentials or network paths change; the one script change is read-only filesystem inspection | — | — | — |
| CI/CD | applies — the unit suite and e2e L2 scenario A assert the old text | `npm test`, `npm run lint`, and `npm run test:e2e` pass | PR | CI green |
| Usability (ISO 25010) | applies — the change exists to remove an interruption | exit-1 branch contains no question to the human | Implement | docs test |
| Compatibility (ISO 25010) | applies — adopted repositories stop getting ambient lifecycle enforcement, and `sdlc-status` callers see roots outside any git repository move from exit 2 to exit 1 | release note states both | PR | semantic-release changelog entry |

## Pre-mortem

| Risk | Trigger | Consequence | Mitigation | Owner | Destination |
|---|---|---|---|---|---|
| Agents still load `sdlc` ambiently | a model treats "starting a change" as a reason to load a listed skill despite the description | the kernel runs in sessions the operator did not trigger | the description leads with the operator-only rule; the exit-1 branch is silent anyway, so the worst case in an unadopted repo is one status command | PR author | Build task 1 |
| Adopted repos lose enforcement unnoticed | an operator expects the law to apply without invoking it | a change lands outside the lifecycle | release note and README say how to invoke; CI `check-lifecycle`, where installed, still gates PRs in adopted repos | PR author | Build task 2 |
| The no-repository proof is wrong | a repository `sdlc-status` cannot see (git missing, dubious ownership, pruned worktree, `GIT_DIR` redirect) is classified as absent | an adopted repository is silently set aside | the proof needs the root and the working directory to be existing directories with no `.git` entry or git directory at themselves or any ancestor (logical and physical path), and no `GIT_DIR`, `GIT_WORK_TREE` or `GIT_COMMON_DIR`; anything short of it stays `error`; tests pin each reviewer-reproduced case | PR author | Build task 2 |
| A stale advisory reference survives | advisory wording in a file the sweep missed | agents still see an advisory option | test asserts no "advisory mode" text in `SKILL.md` and `system-reference.md` | PR author | Build task 3 |

## Definition of done

- `skills/sdlc/SKILL.md` and `skills/sdlc-retro/SKILL.md` descriptions state
  operator-only loading; neither carries `disable-model-invocation`.
- The `SKILL.md` exit-1 branch contains no offer, question, or mention of
  adoption, and tells the agent to continue the task outside the lifecycle.
- No text in `SKILL.md` or `references/system-reference.md` matches
  `/advisory mode/i`.
- `sdlc-status` exits 1 when the filesystem proves no git repository encloses
  the root or the working directory (with or without an explicit root, and
  with none of `GIT_DIR`, `GIT_WORK_TREE` or `GIT_COMMON_DIR` set), and exits 2
  whenever that proof fails, including a `.git` git cannot use and a root that
  points away from the caller's repository;
  every exit 2 and exit 3 stops; all five pre-exit-0 prohibitions remain.
- ADR 0030 exists with Context/Decision/Consequences; ADR 0010 and 0015 name it.
- `npm test`, `npm run lint`, and `npm run test:e2e` pass.

## Context for the next agent

- The `review.design: advisory` config value is a different concept (a
  non-blocking design panel) and stays.
- `templates/sdlc-*.md` keep their `not-adopted` sampling path unchanged.
- `skills/sdlc/scripts/sdlc-status.mjs` leaves the ASD19 frozen set for this
  change; a tracked follow-up re-freezes it after merge. `lib.mjs` and the
  `.sh` wrapper stay frozen.
- Release type: `feat:` (minor). No config shape changes, so the ADR 0021
  release guard does not apply.

## Amendments

- **2026-09-25 — non-git directories halted through exit 2.** Trigger: running
  `sdlc-status` in a fresh temp directory during Implement returned exit 2
  (`git.repository` failing with `--repo-root`, `root.resolve` failing without
  it), not exit 1. The brainstorm premise that exit 2 only occurs in adopted
  repositories was false, so an agent in any non-git directory would still
  stop. Class **(b)**: the objective is unchanged and no frozen shape is
  touched; the kernel's exit-2 branch now handles a `root.resolve` failure
  exactly as exit 1. `git.repository` is not carved out: it also fails when
  `git` cannot run or an explicit root is wrong, so an adopted repository can
  produce it. The kernel runs `sdlc-status` from the working directory without
  `--repo-root`, since an explicit root always passes `root.resolve`.
  Superseded by the next amendment. Author: the implementing agent
  (anthropic/claude-opus-5-5).
- **2026-09-25 — `sdlc-status` proves the absence of a repository.** Trigger:
  no reading of exit 2 in the kernel is safe. `root.resolve` and `git.repository` both fail for a missing
  repository and for a repository git cannot use (git missing, dubious
  ownership, a pruned worktree), and forbidding `--repo-root` stranded
  monorepo-subdirectory consumers. Class **(a)**: it changes the classification
  in the frozen `sdlc-status` surface, so the Plan gate re-runs. Change:
  `sdlc-status` reports `root.resolve:pass`, `git.repository:fail`, state
  `not-adopted`, exit 1 when it proves no git repository encloses the root or
  the working directory: both are existing directories, neither they nor any
  ancestor (logical and physical path) holds a `.git` entry or looks like a
  git directory, and no `GIT_DIR`, `GIT_WORK_TREE` or `GIT_COMMON_DIR` is set.
  The working directory is proved too because an on-disk manifest above a
  repository, `core.worktree`, or a mistaken explicit root can point the root
  away from the repository the caller is in. Anything short of that
  proof keeps today's `error`. The kernel drops its exit-2 exception and
  restores `--repo-root`. Exit codes, state names, check ids, and the output
  shape do not change; a manifest on disk outside git still never counts as
  adoption (ADR 0015). Disposition: owner chose this option after escalation.
  Author: the implementing agent (anthropic/claude-opus-5-5).
