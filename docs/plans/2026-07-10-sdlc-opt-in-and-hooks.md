# Plan: repo opt-in + local workflow hooks (sdlc as framework, not prescription)

- Date: 2026-07-10
- Track: **irreversible** (amends frozen surface FS1 — the config schema — and
  changes the skill's no-manifest policy plus `readConfig` defaults behaviour;
  adds a new consumer-authored surface. Note: FS3 — consumer-root *resolution*,
  ADR 0003, `resolveRoot` in `scripts/lib.mjs` — is **untouched**; the
  no-manifest change lives in `readConfig` and SKILL.md policy, not in root
  resolution.)
- Author: pi session (anthropic), approved by project owner
- Panel: `docs/reviews/plan-sdlc-opt-in-and-hooks-2026-07-10/consolidated.md`

## Objectives

1. **Explicit opt-in.** A repo adopts the sdlc by committing
   `.pi/sdlc/sdlc.config.json`. When the skill is invoked in a repo without it,
   the skill does not silently run with defaults: it refuses, points at
   `/setup-sdlc`, and offers a clearly-labelled *session-only advisory mode*
   (phases as guidance, no announce, no enforcement, no tracker mutations).
2. **Local workflow hooks.** An optional, additive `hooks` field in
   `sdlc.config.json` lets a repo declare adjacent actions **before/after any
   lifecycle phase**. Hook keys are the lifecycle names — `brainstorm`, `plan`,
   `spec`, `build`, `implement`, `pr` — plus `*` (every phase). This vocabulary
   is distinct from the four *panel* phases in `lib.mjs` (`PHASES`), which are
   unchanged. Two hook kinds:
   - `run`: a shell command the agent executes verbatim (same command string
     every time; result is environment-dependent). Example: a notification
     script.
   - `use`/`do`: an instruction naming a skill or tool (`use`) plus intent
     (`do`), interpreted by the agent. Draft shape:
     `{"use": "skill:worktree-setup", "do": "Create AND enter a worktree for
     the feature branch via worktree_session so the session's working root
     moves into it; target all subsequent writes there."}`
     The spec must define how the agent maps `use`/`do` to tool invocations.
   Ordering: `before` hooks fire `*` first, then phase-specific; `after` hooks
   fire phase-specific first, then `*`.
   Failure semantics: a failed/skipped `before` hook **blocks** the phase; a
   failed `after` hook **warns** (recorded, not blocking).
   **Enforcement model (stated plainly):** hooks are prose law executed by the
   agent, exactly like the rest of this skill (the iron law included). There is
   no hook engine. The audit trail is announce-on-fire: the agent announces
   each hook (phase, kind, and for `run` the exact command) as it fires, so a
   session transcript that lacks the announcement is a falsifiable violation.
3. **Prose workflow layer.** An optional `.pi/sdlc/workflow.md` carries local
   ways-of-working that don't decompose into hooks. Loaded at announce time —
   the announce output must enumerate the workflow rules loaded (falsifiable) —
   and prose-enforced by the agent. Conflict rule, operationally defined:
   **gates** are the gate column of SKILL.md's phase table plus the iron-law
   forward-skip rules — global always wins there (locals may add gates, never
   remove or weaken those); **process** is everything else — local wins.
4. **Worktree neutrality.** Remove baked-in worktree prescription from
   SKILL.md. Whether feature branches use worktrees becomes a per-repo
   preference expressed as a hook. Keep one mechanism-agnostic warning: if a
   workflow uses worktrees, *creating one is not enough — the session's working
   root must move into it (create-then-enter); writing to the main checkout
   after creating a worktree is a red flag.*
5. **Scaffolder.** `/setup-sdlc` — a pi prompt template shipped by this package
   via the `pi.prompts` field in `package.json` (mechanism verified:
   docs/packages.md, docs/prompt-templates.md "Locations"; template lives in a
   new top-level `templates/` or similar dir, NOT `skills/sdlc/prompts/`, which
   holds reviewer prompts) — backed by `scripts/setup-sdlc.sh` so it also works
   headless. It interviews the developer — prefix/labels, tracker y/n, worktree
   preference, notifications — and writes `sdlc.config.json` (+ models
   skeleton, + hooks). CLI sketch (spec pins the full flag table):
   non-interactive flags mirroring config keys (`--prefix`, `--label-prefix`,
   `--announce`, `--tracker-repo`, `--hook <phase>:<before|after>:<spec>` …);
   exit codes: 0 = config written, 1 = user declined/aborted, 2 = error.

## Rationale

- The skill currently *prescribes* (runs with defaults in any repo, hard-codes
  "in a worktree" in the Implement row). Observed failure: agents create
  worktrees but never enter them, because the skill names the practice without
  the mechanism, and the mechanism (`worktree_session` create+enter) is a
  per-machine/per-developer choice the global skill must not hard-depend on.
- Keeping the dependency direction clean: pi-sdlc never names pi-worktree; a
  repo that uses worktrees names it in its own hook. Framework, not
  prescription.
- Presence-of-manifest is the cheapest honest opt-in signal: no new marker
  file, travels with the clone, CI already keys off committed artifacts.

## Risks

- **`run` hooks are arbitrary command execution** from a committed file: a
  hostile or careless `sdlc.config.json` injects shell commands into agent
  sessions with the agent's privileges. Mitigations: the agent echoes the
  exact command and phase before executing (announce-on-fire); the scaffolder
  prints a warning when writing `run` hooks; the trust boundary is pi's
  existing project-trust model — the same boundary that already governs
  `.pi/prompts` and project settings. The spec must restate this in the hooks
  contract.
- **Bootstrap ordering:** this repo itself had no manifest; the refusal
  behaviour must land together with (or after) the dogfood config commit, and
  script tests must use fixture configs, or maintainers/CI hit refusal errors
  mid-development.

## Scope

### In

- `sdlc.config.json` schema: add optional `hooks` to
  `skills/sdlc/schema/sdlc.config.schema.json` — this requires touching the
  schema file itself (top-level `additionalProperties: false` stands; `hooks`
  becomes an enumerated optional property), the documented example, AND the
  `allowed` set in `scripts/lib.mjs` `validateConfig`. Additive within
  schemaVersion 1 (FS1-safe per ADR 0001). Shape: per-phase keys from the six
  lifecycle names + `*`; each with optional `before`/`after` arrays; items are
  `{run}` or `{use, do}`.
- `readConfig` (`scripts/lib.mjs`): a strict mode that rejects a missing
  manifest (used by the opt-in gate); default callers unchanged where the
  frozen script contracts require it. FS3 `resolveRoot` untouched.
- `.pi/sdlc/workflow.md` convention: documented in SKILL.md and README; no
  tooling beyond load-and-obey (agent-interpreted), with the announce-time
  enumeration requirement above.
- SKILL.md changes (each greppable): a section on the opt-in gate at announce
  (manifest present/absent × advisory accepted/declined); a section titled
  "Advisory mode"; hook discipline (before=block, after=warn, announce on
  fire, `*` ordering); the Implement row reworded so it no longer contains the
  prescription "in a worktree"; the create-then-enter worktree warning; new
  red flags: *skipping or silently reordering a configured phase hook*,
  *writing to the main checkout after creating a worktree*.
- README: opt-in story, hooks, workflow.md, /setup-sdlc.
- `scripts/setup-sdlc.sh` (+ `.mjs`) and the `/setup-sdlc` prompt template +
  `pi.prompts` wiring in `package.json`.
- **Two ADRs** (one per surface, per docs/adr/README.md): (a) opt-in
  semantics — no-manifest policy change in the skill + `readConfig` strict
  mode; (b) the `hooks` surface (shape, vocabulary, failure semantics, trust
  boundary).
- Tests: hooks validation (accept documented shape; reject bad phase key,
  unknown hook kind, empty `do`), `readConfig` strict mode, scaffolder run
  against a fresh temp repo.
- Dogfood: this repo's own `.pi/sdlc/` config committed (ordering per Risks).

### Out

- Any hard dependency on pi-worktree or any notification tool.
- A hook execution engine outside agent interpretation (no daemon, no event
  bus, no script-level runner); `run` hooks are commands the agent runs at the
  right time under announce-on-fire discipline.
- Hook points for sub-modes (map tickets, tracker-backed build tasks) — v1
  vocabulary is the six lifecycle phases + `*` only; additive later if needed.
- CI enforcement that hooks fired (hooks are session behaviour, not
  artifacts; the transcript announcement is the audit trail).
- Deployment/post-merge phases (the sdlc still ends at PR merge).
- Migration tooling for existing consumers (consumer count ≈ 1; the ADRs +
  README note suffice).

## Definition of done

- [ ] Schema file, example, and `validateConfig` accept the documented `hooks`
      shape and reject malformed ones (bad phase key, unknown hook kind, empty
      `do`); covered by `npm test`.
- [ ] `readConfig` strict mode rejects a missing manifest; covered by
      `npm test`.
- [ ] SKILL.md contains, verifiable by grep: an opt-in gate section, a section
      titled "Advisory mode", the hook discipline rules (before=block,
      after=warn, announce-on-fire, `*` ordering), and the two new red flags;
      the Implement row no longer contains the phrase "in a worktree"; the
      create-then-enter warning is present.
- [ ] The announce-time refusal/advisory flow and workflow.md conflict rule
      read coherently — verified at the spec and PR panels (prose, not unit
      tests).
- [ ] `setup-sdlc.sh` writes a schema-valid config non-interactively with
      flags and interactively without; exercised against a fresh temp repo in
      tests; exit codes 0/1/2 as pinned above.
- [ ] `/setup-sdlc` template is discoverable via `pi.prompts` in
      `package.json`.
- [ ] Two ADRs committed (opt-in semantics; hooks surface).
- [ ] Tests green (`npm test`).
- [ ] This repo has a committed, schema-valid `.pi/sdlc/sdlc.config.json`
      (dogfood).
- [ ] README updated; no reference anywhere to pi-worktree as a dependency.

## Context for the next agent

- Frozen surfaces: FS1 = `skills/sdlc/schema/sdlc.config.schema.json` (+ ADR
  0001, `additionalProperties: false` is a locked decision — extend the
  enumerated properties, don't relax it). FS3 = consumer-root resolution (ADR
  0003, `resolveRoot`, `scripts/lib.mjs:57`) — do NOT modify it for this
  change; the no-manifest behaviour lives in `readConfig` (~lib.mjs:79) and
  SKILL.md policy.
- Panel phases (`PHASES`, lib.mjs:9: plan_review, spec_review, pr_review,
  task_validate) are a different vocabulary from hook phase keys (brainstorm,
  plan, spec, build, implement, pr). Don't conflate them.
- The observed bug motivating all this: sdlc-driven sessions ran
  `git worktree add` but kept writing to the main checkout. The
  `worktree_session` tool (pi-worktree package) fixes this with create/enter
  semantics; the skill must describe the *requirement* (session root moves)
  without naming that tool.
- "No PRs on Fridays" style rules are the canonical `workflow.md` example —
  they are illustrative, not shipped defaults.
- Spec must pin: the exact hooks JSON Schema fragment; the announce-time
  decision procedure (manifest present/absent × advisory accepted/declined) as
  falsifiable scenarios; hook failure semantics and announce-on-fire as
  falsifiable scenarios (transcript lacks announcement ⇒ violation); how the
  agent maps `use`/`do` to tool invocations; the full setup-sdlc flag table;
  the `run`-hook trust-boundary language.
