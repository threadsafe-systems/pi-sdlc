# Spec: the `sdlc` skill and its consumer contract (`pi-sdlc`)

- Date: 2026-07-09
- Track: **irreversible**. Implements the approved plan
  `docs/plans/2026-07-09-pi-sdlc-extraction.md` (v3, `75347a0`).
- Author vendor: anthropic (excluded from panels).
- Revision: v3, incorporating spec panel waves 1 and 2 (openai-codex, deepseek,
  zai; adjudication in `docs/reviews/spec-pi-sdlc-extraction-2026-07-09/`).
- Zero-regression claim: the migrated loom drives a change identically to
  loom-sdlc @ loom `main` `b5a3529` (behavioural surface = agent name + tools +
  prompt body + resolved panel + artefacts + gates; see §4 on metadata).

## 0. Overview: two kinds of substitution, and what byte-identity covers

- **Genericisation (static, one-time):** `SKILL.md`, `assets/tracker-ops.md`,
  `assets/agent-brief.md`, and **the script comments** become project-agnostic.
  Project values appear as `<TOKEN>` placeholders described in prose as "resolved
  from `.pi/sdlc/sdlc.config.json`". No script rewrites these; the orchestrating
  agent applies manifest values when it acts.
- **Machine substitution (runtime):** `ensure-panel-agent.sh` writes stamped agent
  files; `resolve-panel` reads `sdlc.models.json`. The only mechanical points.

**What byte-identity gates (S4):** the stamped agent's `name`, `tools`, and
**prompt body** (the behavioural surface the reviewer model acts on). The
`description` frontmatter is regenerated (see §4) and is explicitly NOT under
byte-identity — it is non-behavioural metadata, and loom's current `description`
names a template path (`assets/...`) that legitimately moves in extraction.

**Prompt overrides (confirmed):** the plan-phase and spec-phase reviewer prompts
carry *different* per-phase governing-doc sentences (`adversary-plan.prompt.md:12`
vs `adversary-spec.prompt.md:14`), so no single config token reproduces both. Loom
ships two whole-file prompt overrides for these; `adversary-review` and
`validator-task` use the generic prompts unchanged.

## 1. Contract: `sdlc.config.json` (frozen surface FS1)

JSON object, `additionalProperties:false`, additive-within-major.

| field | type | required | default (no-manifest) | drives |
|---|---|---|---|---|
| `schemaVersion` | integer, `1` only in v1 | yes | treated as `1` | compat gate (see below) |
| `prefix` | string `^[a-z][a-z0-9-]*$` | yes | `sdlc` | stamped agent name |
| `labelPrefix` | string `^[a-z][a-z0-9-]*$` | yes | `sdlc` | label vocabulary + description identity |
| `announce` | non-empty string | yes | `Using the sdlc skill to drive this change through its lifecycle.` | announce string |
| `paths` | object | no | see rows | doc/agent path resolution |
| `paths.plans` | repo-relative dir | no | `docs/plans` | plan docs |
| `paths.specs` | repo-relative dir | no | `docs/specs` | spec docs |
| `paths.reviews` | repo-relative dir | no | `docs/reviews` | review artefacts |
| `paths.agents` | repo-relative dir | no | `.pi/agents` | stamped agents |
| `tracker` | object | no | absent → tracker modes error | GitHub tracker |
| `tracker.repo` | `owner/name` | iff `tracker` | — | issue/label ops |
| `tracker.board.number` | integer ≥ 1 | iff `tracker` | — | project board |
| `tracker.board.url` | URL string | iff `tracker` | — | board URL |

- `schemaVersion`: v1 scripts accept `1` only and exit non-zero with a diagnostic
  for any other value; a no-manifest project is treated as version 1. (Spec-author
  addition beyond the plan's field list — a compat gate consistent with the plan's
  additive-within-major policy; flagged for Neil at the approval gate.)
- Tracker absent: map-mode and tracker-backed build error clearly; phases + panels
  still work.
- Source of truth: committed `schema/sdlc.config.schema.json` + documented example.

## 2. Contract: `sdlc.models.json` (frozen surface FS2)

Fields `resolve-panel` reads (verified `resolve-panel.mjs:84,179-193`):

| field | type | required | meaning |
|---|---|---|---|
| `author_default` | `provider/model` | no | fallback author |
| `rules.exclude_author_vendor` | boolean | no (default true) | drop author vendor when min_panel ≥ 2 |
| `phases` | object | yes | must contain **exactly** the four v1 phase keys |
| `phases.<phase>.min_panel` | integer ≥ 1 | yes | distinct-vendor floor |
| `phases.<phase>.prefer` | string[] `provider/model` | yes, non-empty | ordered preference |

- **All four phase keys are required in v1** (`plan_review, spec_review,
  pr_review, task_validate`); a subset is invalid (tightening later would break).
- **No built-in roster.** Model ids drift per machine, so the skill ships none;
  `resolve-panel` REQUIRES `<consumer-root>/.pi/sdlc/sdlc.models.json` and exits
  non-zero with a clear error if it is absent (even in no-manifest mode).
  Stamping and path resolution do not need it.
- Committed `schema/sdlc.models.schema.json` + example.

## 3. Contract: consumer-root resolution (frozen surface FS3)

Both scripts resolve the **consumer root** independently of `SKILL_DIR`:

1. `--config <dir>` or `--repo-root <dir>` (a DIRECTORY, not a file) → that root.
2. else `$SDLC_ROOT` env var if set → that root.
3. else walk up from `$PWD`; first ancestor containing
   `.pi/sdlc/sdlc.config.json` → that root.
4. else `git rev-parse --show-toplevel` of `$PWD`, with built-in defaults.
5. else exit non-zero: `sdlc: cannot locate a consumer repo; pass --config <dir>
   or set $SDLC_ROOT`.

Derived: config = `<root>/.pi/sdlc/sdlc.config.json`; models =
`<root>/.pi/sdlc/sdlc.models.json`; `ensure-panel-agent --dir` default =
`<root>/<paths.agents>`. `SKILL_DIR` is never used for consumer paths.

## 4. Contract: derivation rules (frozen surface FS4)

- Phase ids (fixed): `plan_review, spec_review, pr_review, task_validate`.
- Phase → template: `plan_review→adversary-plan`, `spec_review→adversary-spec`,
  `pr_review→adversary-review`, `task_validate→validator-task`.
- **Agent name** = `<prefix>-<phase-slug>`, phase-slug = phase id with `_`→`-`
  (`prefix=loom` → `loom-plan-review` … byte-identical to today's `:40-43`).
- **`tools`** frontmatter: default `read,grep,find,ls,bash` (unchanged).
- **Prompt body**: the (override-or-generic) template body verbatim (no
  `tail -n +2`), with `REVIEWER_TAG` replaced by the exact literal
  `one of several independent reviewers in a multi-model panel`
  (`ensure-panel-agent.sh:88`). This is the byte-identity surface.
- **`description`** (regenerated, non-behavioural per framework grounding: pi
  dispatches by `name` + prompt body; `description` is list/metadata only). Exact
  frozen string:
  `description: <labelPrefix> <phase> reviewer. Stamped by the sdlc skill; edit the
  template, not this file. Dispatch one task per model via the subagent tool's
  per-task model override.` (`<phase>` = the phase id). No template-name/path is
  referenced (loom's `assets/<template>` path is intentionally dropped; the
  template moved). It is NOT under old-vs-new byte-identity, but S4 asserts the
  stamped `description` equals this generated string exactly.
- **Label vocabulary** = `<labelPrefix>:{map, ticket-research, ticket-prototype,
  ticket-grilling, ticket-task, epic, build-task, hitl, afk}`.

## 5. Contract: script CLIs (frozen surface FS5)

`resolve-panel.sh <phase> [--author X] [--pong] [--models-file P] [--emit-tasks A]
[--config D | --repo-root D]`
- stdout: model list (one `provider/model`/line), or `{ "tasks":[{agent,
  task:"FILL_IN_TASK_BLOCK", model}...] }` pretty JSON with `--emit-tasks`.
- stderr: panel summary + drop reasons.
- exit: `0` iff `panel.length ≥ min_panel`; `1` on under-panel; `2` on bad args,
  unknown phase, or unreadable/unparseable/invalid **models** file (verified
  `resolve-panel.mjs:79-89`). resolve-panel does NOT read `sdlc.config.json`.

`ensure-panel-agent.sh <phase> [--dir D] [--tools CSV] [--force] [--config D |
--repo-root D]`
- writes `<dir>/<agent-name>.md`; body verbatim; frontmatter per FS4.
- **Prompt resolution order:** first `<root>/.pi/sdlc/prompts/<template>.prompt.md`
  (consumer override); else `<skill-dir>/prompts/<template>.prompt.md` (generic).
- idempotent; refuses to overwrite differing content without `--force`; rejects
  flag-like values for `--dir`/`--tools`; `--help` prints only the header.
- exit: `0` on write/up-to-date; `2` on bad args/unknown phase/invalid manifest;
  `1` on missing template or existing-differing-without-force.

**Manifest validation (no new deps, NFR2) — split by which file each script
reads:**
- `ensure-panel-agent.sh` reads and validates **only `sdlc.config.json`**:
  `schemaVersion` is `1`; `prefix`/`labelPrefix` match `^[a-z][a-z0-9-]*$`;
  `announce` non-empty; `paths.*` repo-relative strings if present; `tracker`
  (if present) has `repo` matching `owner/name`, `board.number` integer ≥ 1,
  `board.url` a URL; no unknown top-level keys.
- `resolve-panel` reads and validates **only `sdlc.models.json`**: `phases` has
  **exactly** the four v1 keys (checked via the full key set at startup, not just
  the requested phase); each `min_panel` an integer ≥ 1; each `prefer` a non-empty
  array of `provider/model` strings; `rules.exclude_author_vendor` (if present)
  boolean; `author_default` (if present) a `provider/model` string.
Each exits `2` with a clear message on violation. Hand-rolled (no JSON-Schema
library at runtime); the committed schemas validate the examples at S3 test time.
Neither script requires the OTHER's file.

## 6. Contract: tokens + genericisation clearance (frozen surface FS6)

Tokens (angle-bracket, uppercase): `<PREFIX>`, `<LABEL_PREFIX>`, `<ANNOUNCE>`,
`<PLANS_DIR>`, `<SPECS_DIR>`, `<REVIEWS_DIR>`, `<AGENTS_DIR>`, `<TRACKER_REPO>`,
`<TRACKER_BOARD>`, `<TRACKER_BOARD_URL>`.

**Clearance is BOTH: (a) the exhaustive site list below is fully applied, AND (b)
the S2 grep over the ENTIRE `skills/sdlc/` tree (SKILL.md, prompts, assets, AND
scripts) returns empty** (outside `schema/` examples and `docs/`). The grep is
necessary but NOT sufficient: a loom concept name containing none of the grep
literals (date-stamped plan-doc paths, `journal`) leaks past it, so the site list
— not the grep — is the primary mechanism and must be exhaustive:

- `SKILL.md`: `:2,3,6,8` skill name/"enters Loom"; `:10,:12` loom plan-doc
  cross-refs (incl. the date-stamped `2026-07-08-sdlc-v2-upgrades` path the grep
  does NOT catch); `:25` "journal shapes" (loom persistence concept; remove, do
  not grep `journal`); `:14` announce→`<ANNOUNCE>`; `:65,74,79,120,122` `loom-sdlc:*`→`<LABEL_PREFIX>:*`;
  `:129` "Loom Build Board"→`<TRACKER_BOARD>`; `:143` `sdlc-artifacts`→generic
  "your CI presence-check"; `:161,174,175` command paths (skill-relative, run from
  consumer root); `:180` "loom prompts"; `:249,268` self/governing-doc refs.
- `assets/tracker-ops.md`: `:3` skill name; `:8,56,111,129,131,144,146,153,154,
  167,186,191` repo/owner→`<TRACKER_REPO>`; `:10-12` board provenance + the
  date-stamped `2026-07-08-sdlc-v2-upgrades-build` plan path (grep does NOT catch
  the latter); `:10,145,153` board→`<TRACKER_BOARD>`/`<TRACKER_BOARD_URL>`;
  `:24-35` labels→`<LABEL_PREFIX>:*`; **`:135` RunDriver example→domain-neutral;
  `:232` `sdlc-artifacts`→generic**.
- `assets/agent-brief.md`: `:23,32,34` adapter-boundary example→domain-neutral;
  `:93,97` labels→`<LABEL_PREFIX>:*`.
- **scripts** (comments only; logic is already generic): `resolve-panel.sh:2`,
  `resolve-panel.mjs:3`, `ensure-panel-agent.sh:2,6,8,12,29,83` "loom-sdlc"/"loom"
  prose → "sdlc"/"the consumer" wording. (`ensure-panel-agent.sh:40-43,93` are
  logic, handled by FS4.)

## 7. Contract: prompt skeletons (frozen surface FS7)

The four generic prompts under `skills/sdlc/prompts/` MUST retain these exact `##`
section headings (a consumer whole-file override must preserve them):

- `adversary-plan`: `## The review target`, `## Required context (read before
  judging)`, `## Attack surfaces (verify each; also hunt for defects not listed)`,
  `## Output format (STRICT: markdown only, findings only, no preamble, no
  conclusion)`.
- `adversary-spec` (five headings, exact text and order): `## The review target`,
  `## Required context (read ALL before judging)` (note "ALL", unlike plan),
  `## Grounding against the framework (MANDATORY for any claim about framework
  behaviour)` (between Required context and Attack surfaces), `## Attack surfaces
  (verify each; also hunt for defects not listed)`, `## Output format (STRICT:
  markdown only, findings only, no preamble, no conclusion)`.
- `adversary-review`: `## Method`, `## Baseline smells (Standards, judgement
  calls)`, `## The review target`, `## Output format (STRICT)`, `## Verification
  mode (only when the caller asks for it)`.
- `validator-task`: `## Inputs the caller gives you`, `## Checks (run every one;
  do not skip)`, `## Output format (STRICT: markdown only)`.

The generic plan/spec prompts replace their governing-doc parenthetical with a
domain-neutral form ("the project's `AGENTS.md` and any governing or
locked-decision documents it names"). Loom ships whole-file overrides for
`adversary-plan`/`adversary-spec` restoring its exact `:12`/`:14` lines; the
consumer owns keeping the other headings in step (documented trade-off; these two
prompts are small and stable).

## 8. Loom instance manifest (the migration must produce exactly this)

`.pi/sdlc/sdlc.config.json`: `{schemaVersion:1, prefix:"loom",
labelPrefix:"loom-sdlc", announce:"Using loom-sdlc to drive this change through its
lifecycle.", paths:{plans:"docs/plans",specs:"docs/specs",reviews:"docs/reviews",
agents:".pi/agents"}, tracker:{repo:"threadsafe-systems/loom", board:{number:4,
url:"https://github.com/orgs/threadsafe-systems/projects/4"}}}`.
`.pi/sdlc/sdlc.models.json`: loom's current file verbatim.
`.pi/sdlc/prompts/{adversary-plan,adversary-spec}.prompt.md`: whole-file copies of
loom's current two prompts.

## 9. Non-functional requirements

- NFR1: no offline-gate test makes a live/paid model call. D4b/S6 use an
  **isolated** environment: `HOME` set to a temp dir containing
  `.pi/agent/auth.json` (fixture with keys for exactly `{anthropic, deepseek,
  openai-codex, zai-coding-cn, moonshotai}` and AWS creds for amazon-bedrock),
  all ambient credential env vars cleared, no `--pong`. The expected panel per
  phase is a committed golden (`test/fixtures/resolve-panel-golden.json`) captured
  once from the pre-extraction script under that same isolated env (a one-time
  setup, not a gate run).
- NFR2: scripts are POSIX-bash `set -euo pipefail` / node, no new runtime deps
  (validation is hand-rolled per §5).
- NFR3: the whole generic surface (incl. scripts) has zero loom-domain content
  (S2 grep).
- NFR4: MIT `LICENSE` committed (DEP1).

## 10. Verification scenarios (stable ids)

- S1 (D1): `pi` lists `/skill:sdlc`; repo has `package.json`
  `{"pi":{"skills":["./skills"]}}`, `README.md`, MIT `LICENSE`. Falsify: skill
  absent.
- S2 (FS6/NFR3): `grep -rniE 'loom|rundriver|northstar|handover|conveyanc|clc|
  build board|threadsafe-systems|adapter boundary|sdlc-artifacts' skills/sdlc/`
  empty outside `schema/`+`docs/`, **scripts included**. Falsify: any match.
- S3 (FS1/FS2): each JSON Schema validates its example. Falsify: valid example
  rejected.
- S3b (FS1/§5, config): `ensure-panel-agent`, given a mutated `sdlc.config.json`
  (bad `schemaVersion`, missing required key, bad-regex `prefix`/`labelPrefix`,
  empty `announce`, malformed `tracker`, extra top-level key), exits `2` with a
  clear message. Falsify: mutated config accepted or wrong exit code.
- S3c (FS2/§5, models): `resolve-panel`, given a mutated `sdlc.models.json`
  (missing/extra phase, `min_panel:0`, empty `prefer`, bad `provider/model`,
  non-boolean `rules.exclude_author_vendor`), exits `2`. Falsify: mutated models
  file accepted or wrong exit code.
- S4 (FS4/FS7/D4a): for all four phases, stamping under loom's manifest yields
  `name` + `tools` + **body** byte-identical to the committed loom golden fixture
  (plan/spec via overrides, review/validate generic), AND the stamped
  `description` equals the FS4 generated string exactly. Falsify: any name/tools/
  body diff, or a description not matching FS4.
- S5 (FS3/D4a): with `$PWD` in a simulated consumer and the skill at a global
  path, the stamped agent lands under `<consumer-root>/<paths.agents>`. Falsify:
  written under the skill repo.
- S6 (FS5/D4b/NFR1): under the isolated cred env (§9), `resolve-panel
  --emit-tasks` for all four phases deep-equals the committed golden. Falsify: any
  divergence.
- S7 (FS3): terminal cases — outside any repo with no flag/env exits non-zero with
  the diagnostic; no-manifest git repo resolves root + defaults but
  `resolve-panel` errors clearly without a models file. Falsify: silent wrong root
  or crash.
- S8 (O3/D5): after migration, `.pi/skills/loom-sdlc/` gone; `.pi/sdlc/` holds
  config+models+two overrides; no stale `.pi/skills/loom-sdlc` path in
  `AGENTS.md`/`CONTRIBUTORS.md`/PR-template/`.gitignore`; loom config reproduces
  prefix/labelPrefix/announce; loom offline gate green. Falsify: any stale ref,
  changed value, red gate.
- S9 (DEP2/D5): a committed loom artefact
  `docs/reviews/<...>/discovery-verified.md` recording the discovered `pi-sdlc`
  commit + surfaced path exists, and its commit is an ancestor (same-repo) of
  loom's engine-deletion commit. Falsify: artefact absent or not an ancestor of
  the deletion.
- S10 (D6): a loom `pr_review` dry run produces `docs/reviews/<...>/` with
  per-model files + `prompt.md` + `consolidated.md` carrying the four named
  sections (panel table, per-finding adjudication, stop condition, orchestrating
  model). Falsify: missing file/section.
- S11 (D7): one ADR per frozen surface FS1–FS7 + name + distribution exists.
  Falsify: missing ADR.

## 11. Out of scope (restates plan)

Tracker pluggability beyond GitHub; new phases/gates/tracks; changes to the four
delegated global skills or to loom `src/`/runtime; generalising loom's CI
`sdlc-artifacts` job (stays hard-coded; R6); public-registry publishing.
