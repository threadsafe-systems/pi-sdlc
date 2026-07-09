# Spec: the `sdlc` skill and its consumer contract (`pi-sdlc`)

- Date: 2026-07-09
- Track: **irreversible**. Implements the approved plan
  `docs/plans/2026-07-09-pi-sdlc-extraction.md` (v3, `75347a0`).
- Author vendor: anthropic (excluded from panels).
- Zero-regression claim: the migrated loom drives a change identically to
  loom-sdlc @ loom `main` `b5a3529`.

## 0. Overview and the one mechanism the plan delegated to the spec

The plan fixes the shape; this spec pins the contracts. Two kinds of
"substitution" exist and must not be conflated:

- **Genericisation (static, one-time):** `SKILL.md`, `assets/tracker-ops.md`,
  `assets/agent-brief.md` become project-agnostic documents. Project-specific
  values appear as `<TOKEN>` placeholders described in prose as "resolved from
  `.pi/sdlc/sdlc.config.json`". No script rewrites these; the orchestrating agent
  reads the manifest and applies the values when it acts. They are never
  per-project stamped.
- **Machine substitution (runtime, per stamp/resolve):** `ensure-panel-agent.sh`
  writes stamped agent files with literal substitution; `resolve-panel` reads
  `sdlc.models.json`. These are the only mechanical substitution points, and the
  only outputs under byte-identity gates.

**Prompt overrides (confirmed, not changed):** the plan-phase and spec-phase
reviewer prompts each carry a *different* per-phase governing-doc sentence
(`adversary-plan.prompt.md:12` vs `adversary-spec.prompt.md:14` — the spec line
adds "prior specs the spec claims zero regression against"), so no single config
token reproduces both. Loom therefore ships exactly two whole-file prompt
overrides for these two prompts; `adversary-review` and `validator-task` use the
generic prompts unchanged (already byte-identical to loom's today).

## 1. Contract: `sdlc.config.json` (frozen surface FS1)

JSON object. Additive-within-major. Required and optional fields:

| field | type | required | default (no-manifest) | drives |
|---|---|---|---|---|
| `schemaVersion` | integer ≥ 1 | yes | — | compat gate; scripts reject an unknown major |
| `prefix` | string, `^[a-z][a-z0-9-]*$` | yes | `sdlc` | stamped agent name `<prefix>-<phase-slug>` |
| `labelPrefix` | string, `^[a-z][a-z0-9-]*$` | yes | `sdlc` | label vocabulary + stamped-agent `description` label |
| `announce` | string (non-empty) | yes | `Using the sdlc skill to drive this change through its lifecycle.` | the start-of-work announce string |
| `paths` | object | no | see below | skill-internal doc/agent path resolution |
| `paths.plans` | string (repo-relative dir) | no | `docs/plans` | where plan docs live |
| `paths.specs` | string | no | `docs/specs` | where spec docs live |
| `paths.reviews` | string | no | `docs/reviews` | where review artefacts live |
| `paths.agents` | string | no | `.pi/agents` | where stamped agents are written |
| `tracker` | object | no | absent → tracker modes disabled | GitHub tracker identity |
| `tracker.repo` | string `owner/name` | required iff `tracker` present | — | issue/label operations |
| `tracker.board.number` | integer ≥ 1 | required iff `tracker` present | — | the project board |
| `tracker.board.url` | string (URL) | required iff `tracker` present | — | the project board URL |

- **Unknown top-level keys:** rejected (strict; `additionalProperties: false`) so
  a typo is loud, not silent.
- **Tracker absent:** map-mode and tracker-backed build MUST error with a clear
  message ("this project has no `tracker` configured; brainstorm map mode and the
  epic/sub-issue/board build step require it"). Phases + panels still work.
- A committed JSON Schema (`schema/sdlc.config.schema.json`) is the source of
  truth; the table above is its human description. A documented example
  (`schema/sdlc.config.example.json`) accompanies it.

## 2. Contract: `sdlc.models.json` (frozen surface FS2)

The panel model roster the resolver reads. Fields consumed by `resolve-panel`
(verified against `resolve-panel.mjs:84,179-193`):

| field | type | required | meaning |
|---|---|---|---|
| `author_default` | string `provider/model` | no | fallback author when `--author` omitted |
| `rules.exclude_author_vendor` | boolean | no (default true) | drop the author's vendor from a panel of ≥2 |
| `phases` | object keyed by phase id | yes | per-phase config |
| `phases.<phase>.min_panel` | integer ≥ 1 | yes | distinct-vendor floor |
| `phases.<phase>.prefer` | string[] of `provider/model` | yes | ordered preference, deduped to one per vendor |

- Phase keys MUST be a subset of `{plan_review, spec_review, pr_review,
  task_validate}`.
- Committed JSON Schema `schema/sdlc.models.schema.json` + example. Malformed →
  non-zero with a clear error (FR-D3).

## 3. Contract: consumer-root resolution (frozen surface FS3)

Both scripts resolve the **consumer root** independently of the skill's own
location. Deterministic precedence:

1. `--config <path>` or `--repo-root <path>` explicit flag → that root.
2. else `$SDLC_ROOT` env var if set → that root.
3. else walk up from `$PWD`; first ancestor containing
   `.pi/sdlc/sdlc.config.json` → that root (a configured project).
4. else the `git rev-parse --show-toplevel` of `$PWD`, using built-in defaults
   (a no-manifest project).
5. else (not in a git repo, no flag/env) → exit non-zero with:
   `sdlc: cannot locate a consumer repo; pass --config <dir> or set $SDLC_ROOT`.

Derived: `paths.agents` and `.pi/sdlc/` resolve relative to the consumer root.
`ensure-panel-agent.sh --dir` default = `<root>/<paths.agents>`;
`resolve-panel --models-file` default = `<root>/.pi/sdlc/sdlc.models.json`;
config default = `<root>/.pi/sdlc/sdlc.config.json`. `SKILL_DIR` is NEVER used for
consumer path resolution.

## 4. Contract: derivation rules (frozen surface FS4)

- Phase ids (fixed): `plan_review, spec_review, pr_review, task_validate`.
- Phase → prompt template: `plan_review→adversary-plan`, `spec_review→adversary-spec`,
  `pr_review→adversary-review`, `task_validate→validator-task`.
- **Agent name** = `<prefix>-<phase-slug>`, phase-slug = phase id with `_`→`-`.
  So with `prefix=loom`: `loom-plan-review, loom-spec-review, loom-pr-review,
  loom-task-validate` (byte-identical to `ensure-panel-agent.sh:40-43` today).
- **Stamped `description` label** = `<labelPrefix>`. The description line is
  `description: <labelPrefix> <phase> reviewer. Stamped from <template>.prompt.md
  — edit the template, not this file. Dispatch one task per model via the subagent
  tool's per-task model override.` With `labelPrefix=loom-sdlc` this reproduces
  `ensure-panel-agent.sh:93` byte-for-byte.
- **Label vocabulary** = `<labelPrefix>:{map, ticket-research, ticket-prototype,
  ticket-grilling, ticket-task, epic, build-task, hitl, afk}` (the nine labels of
  `tracker-ops.md:24-32`).

## 5. Contract: script CLIs (frozen surface FS5)

`resolve-panel.sh <phase> [--author <provider/model|vendor>] [--pong]
[--models-file <path>] [--emit-tasks <agent>] [--config <path>|--repo-root <path>]`

- stdout without `--emit-tasks`: the resolved panel, one `provider/model` per line.
- stdout with `--emit-tasks <agent>`: `{ "tasks": [ {agent, task:"FILL_IN_TASK_BLOCK",
  model}, ... ] }` pretty JSON, one task per resolved model.
- stderr: the panel summary + drop reasons.
- exit: 0 iff `panel.length ≥ min_panel`; 2 on bad args; 1 on under-panel.
- Behaviour identical to loom's current script except default `--models-file`
  derives from the consumer root (FS3), not the script dir.

`ensure-panel-agent.sh <phase> [--dir <dir>] [--tools <csv>] [--force]
[--config <path>|--repo-root <path>]`

- writes `<dir>/<agent-name>.md` (default `<root>/<paths.agents>/<agent-name>.md`).
- copies the (override or generic) prompt body verbatim (NO `tail -n +2`),
  substitutes `REVIEWER_TAG` generically, stamps frontmatter per FS4.
- idempotent; refuses to overwrite differing content without `--force`; rejects
  flag-like values for `--dir`/`--tools`; `--help` prints only the header.
- exit: 0 on write/up-to-date; 2 on bad args/unknown phase; 1 on missing template
  or existing-differing-without-force.

## 6. Contract: token convention + substitution-site inventory (frozen surface FS6)

Generic tokens (angle-bracket, uppercase): `<PREFIX>`, `<LABEL_PREFIX>`,
`<ANNOUNCE>`, `<PLANS_DIR>`, `<SPECS_DIR>`, `<REVIEWS_DIR>`, `<AGENTS_DIR>`,
`<TRACKER_REPO>`, `<TRACKER_BOARD>`, `<TRACKER_BOARD_URL>`. Every genericisation
site (static prose, resolved by the reading agent) — the complete list the build
must clear, derived from the audit:

- `SKILL.md`: `:2` name→`sdlc`; `:3,:6` skill name; `:8` "enters Loom"→generic;
  `:10` loom plan cross-ref→removed/generic; `:14` announce→`<ANNOUNCE>`;
  `:65,74,79,120,122` `loom-sdlc:*`→`<LABEL_PREFIX>:*`; `:129` "Loom Build
  Board"→`<TRACKER_BOARD>`; `:143` `sdlc-artifacts` CI name→generic "your CI
  presence-check"; `:161,174,175` command paths→skill-relative `scripts/…` with a
  note they run from the consumer root; `:180` "loom prompts"→"the prompts";
  `:249` self-ref→generic; `:268` loom governing-doc paths→generic example.
- `assets/tracker-ops.md`: `:3` skill name; `:8,:56,:111,:129,:131,:144,:146,
  :153,:154,:167,:186,:191` `threadsafe-systems/loom`/owner→`<TRACKER_REPO>` and
  its owner; `:10,:145,:153` "Loom Build Board"/project #4/URL→`<TRACKER_BOARD>`/
  `<TRACKER_BOARD_URL>`; `:24-35` `loom-sdlc:*`→`<LABEL_PREFIX>:*`.
- `assets/agent-brief.md`: `:23,:32,:34` loom adapter-boundary example→a
  domain-neutral example; `:93,:97` `loom-sdlc:*`→`<LABEL_PREFIX>:*`.

Machine-substitution sites (stamp time): agent name, description label
(`ensure-panel-agent.sh:93`), `REVIEWER_TAG` (already generic).

## 7. Contract: prompt skeletons (frozen surface FS7)

The four generic prompts under `skills/sdlc/prompts/` keep their current required
sections (Method/target/output-format/verification-mode as applicable). The
plan-phase and spec-phase generic prompts replace their governing-doc parenthetical
with a domain-neutral form: "(the project's `AGENTS.md` and any governing or
locked-decision documents it names)". A consumer needing its exact doc set ships a
whole-file override under `.pi/sdlc/prompts/<name>.prompt.md`. Overriding is
whole-file; the consumer owns keeping the non-doc sections in step (documented
trade-off; these two prompts are small and stable).

## 8. Loom instance manifest (the migration must produce exactly this)

`.pi/sdlc/sdlc.config.json`: `{schemaVersion:1, prefix:"loom",
labelPrefix:"loom-sdlc", announce:"Using loom-sdlc to drive this change through
its lifecycle.", paths:{plans:"docs/plans",specs:"docs/specs",
reviews:"docs/reviews",agents:".pi/agents"}, tracker:{repo:"threadsafe-systems/loom",
board:{number:4, url:"https://github.com/orgs/threadsafe-systems/projects/4"}}}`.
`.pi/sdlc/sdlc.models.json`: loom's current file verbatim.
`.pi/sdlc/prompts/adversary-plan.prompt.md` and `adversary-spec.prompt.md`:
whole-file copies of loom's current two prompts (preserving `:12`/`:14`).

## 9. Non-functional requirements

- NFR1: no test in the offline gate makes a live/paid model call. D4b uses a
  stubbed credential env (fixture `auth.json` + env vars) since `hasCreds()` is
  file/env-only.
- NFR2: scripts are POSIX-bash, `set -euo pipefail`, no new runtime deps.
- NFR3: the generic surface has zero loom-domain content (FR-D2 grep).
- NFR4: MIT `LICENSE` committed (DEP1).

## 10. Verification scenarios (stable ids)

- S1 (FS-all/D1): `pi` lists `/skill:sdlc`; repo has `package.json`
  `{"pi":{"skills":["./skills"]}}`, `README.md`, MIT `LICENSE`. Falsify: skill
  absent from `pi` skill list.
- S2 (FS6/D2): `grep -rniE 'loom|rundriver|northstar|handover|conveyanc|clc|build board|threadsafe-systems|adapter boundary|sdlc-artifacts' skills/sdlc/`
  is empty outside `schema/`+`docs/`. Falsify: any match.
- S3 (FS1/FS2/D3): each schema validates its example; a mutated (bad-type,
  missing-required, extra-key) example is rejected non-zero. Falsify: bad example
  accepted.
- S4 (FS4/FS7/D4a): for all four phases, stamping under loom's manifest yields a
  full agent file (frontmatter+description+body+filename) byte-identical to the
  committed loom golden fixture; plan/spec via overrides, review/validate generic.
  Falsify: any diff.
- S5 (FS3/D4a): invoked with `$PWD` inside a simulated consumer while the skill is
  at a global path, the stamped agent lands under `<consumer-root>/.pi/agents`, not
  the skill dir. Falsify: file written under the skill repo.
- S6 (FS5/D4b): under the stubbed cred env, `resolve-panel --emit-tasks` for all
  four phases emits the same model set + JSON as the pre-extraction script.
  Falsify: any divergence.
- S7 (FS3): resolution terminal cases — outside any repo with no flag/env exits
  non-zero with the diagnostic; no-manifest git repo uses defaults. Falsify:
  silent wrong root.
- S8 (O3/D5): after migration, loom's `.pi/skills/loom-sdlc/` is gone; `.pi/sdlc/`
  holds config+models+two overrides; `AGENTS.md`/`CONTRIBUTORS.md`/PR-template/
  `.gitignore` carry no stale `.pi/skills/loom-sdlc` path; loom config reproduces
  `prefix`/`labelPrefix`/`announce`; loom offline gate green. Falsify: any stale
  ref, changed value, or red gate.
- S9 (DEP2/D5): loom's deletion commit is a descendant of the commit/verification
  that confirmed `/skill:sdlc` discovery. Falsify: deletion precedes discovery.
- S10 (D6): a loom `pr_review` dry run produces `docs/reviews/<...>/` with per-model
  files + `prompt.md` + `consolidated.md` carrying the four named sections.
  Falsify: missing file or section.
- S11 (D7): one ADR per frozen surface FS1–FS7 + name + distribution model exists.
  Falsify: missing ADR.

## 11. Out of scope (restates plan)

Tracker pluggability beyond GitHub; new phases/gates/tracks; changes to the four
delegated global skills or to loom `src/`/runtime; generalising loom's CI
`sdlc-artifacts` job (stays hard-coded; R6); public-registry publishing.
