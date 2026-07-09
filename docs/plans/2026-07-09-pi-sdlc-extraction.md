# Plan: extract loom-sdlc into a portable `sdlc` skill (`pi-sdlc`)

- Date: 2026-07-09
- Track: **irreversible** — several consumer-visible surfaces freeze (see §Frozen
  surfaces). Full pipeline: plan panel AND spec panel before build.
- Author vendor: anthropic (excluded from panels).
- Revision: v3, incorporating plan panel waves 1 and 2 (openai-codex, deepseek,
  zai; adjudication in `docs/reviews/plan-pi-sdlc-extraction-2026-07-09/`).

## Rationale

`loom-sdlc` is a working, enforced software-development lifecycle: fixed phase
sequence, two tracks, per-phase adversarial gates, a resolve/stamp/dispatch panel
machine, a per-task validator, worktree discipline, and delegation to the
already-global `adversarial-review`, `dispatch-subagents`,
`gh-pr-review-comments`, and `sdlc-visual-docs` skills. The pattern is generic;
its **identity** is loom-specific. Extracting it makes the pattern reusable and
turns it into a shareable, portable artefact (a background-IP / ThreadSafe
pattern-library asset that also underpins the SDLC-integration services).

### Where the loom coupling actually lives

A file-by-file audit locates the real generalisation work:

- **The four phase prompts are almost generic.** `adversary-review.prompt.md`
  and `validator-task.prompt.md` have zero loom/domain references;
  `adversary-plan.prompt.md:12` and `adversary-spec.prompt.md:14` each name
  loom's governing-doc set (`HANDOVER.md`, `northstar`, `first-principles`) as
  *examples* of "governing docs and locked decisions". These two are the only
  prompt coupling, and they are load-bearing grounding for loom's reviewers (they
  force the reviewer to read those docs), so loom keeps them via a project
  override rather than losing them to the generic form (see O3).
- **`SKILL.md` (body)** is the bulk: name/announce string (`:2,3,6,8,14`), loom
  plan cross-refs (`:10-12`), the `loom-sdlc:*` label vocabulary in map/build prose
  (`:65,74,79,120,122`), "Loom Build Board" (`:129`), and the loom CI job name
  `sdlc-artifacts` referenced generically (`:143`).
- **`assets/tracker-ops.md`** hard-codes `threadsafe-systems/loom`, "Loom Build
  Board" project #4 + URL, and the nine `loom-sdlc:*` labels (`:8-35`).
- **`assets/agent-brief.md`** uses a loom adapter-boundary example (`:32-34`) and
  `loom-sdlc:*` label examples (`:91-99`).
- **The scripts** hard-code the `loom-` agent-name prefix
  (`ensure-panel-agent.sh:40-43`), the `loom-sdlc` skill label in the stamped
  agent `description` frontmatter (`ensure-panel-agent.sh:93`), and resolve paths
  relative to the skill's own location (see §Consumer-root resolution).

## Distribution model (grounded in existing precedent)

Two global-skill precedents exist: a personal mono-repo (`~/.agents/skills/`) and
**dedicated `threadsafe-systems/pi-*` repos** for productised, shareable pi tooling
(`pi-worktree`, `pi-repo-html`, `pi-md-to-pdf`), each shaped
`pi-<name>/skills/<name>/SKILL.md`, declaring `"pi": {"skills": ["./skills"]}` in
`package.json`, shipping an MIT `LICENSE`, and surfaced via pi's git skill discovery
(`~/.pi/agent/git/github.com/threadsafe-systems/...`). A portable SDLC belongs in
the second bucket. Target:

```
threadsafe-systems/pi-sdlc/
  LICENSE  README.md  package.json      # package.json: {"pi":{"skills":["./skills"]}}
  skills/sdlc/
    SKILL.md                 # process law + engine, project-agnostic, token-driven
    scripts/                 # resolve-panel, ensure-panel-agent (consumer-root + manifest aware)
    prompts/                 # the four phase-prompt skeletons (generic)
    schema/                  # sdlc.config.json + sdlc.models.json JSON Schemas + documented examples
    assets/                  # tracker-ops + agent-brief as <PREFIX>/<LABEL_PREFIX> templates
  docs/{plans,specs,reviews} # this extraction's own SDLC artefacts (dogfood)
```

## The seam and manifest

A consumer repo supplies a manifest directory `.pi/sdlc/` (single canonical
location everywhere in this plan):

- `.pi/sdlc/sdlc.config.json` — the frozen config. Fields: `prefix` (drives agent
  names), `labelPrefix` (drives label vocabulary AND the stamped-agent
  `description` label), `announce` (start-of-work string), `paths`
  (plans/specs/reviews/agents), `tracker` (optional: `repo`, `board`
  {number,url}).
- `.pi/sdlc/sdlc.models.json` — the panel model roster. Its schema is also frozen
  (fields consumed by `resolve-panel`: `phases.<phase>.{prefer[],min_panel}`,
  `rules.exclude_author_vendor`, `author_default`).
- `.pi/sdlc/prompts/*.md` — **optional** project prompt overrides. A project
  overrides only prompts whose generic form would lose grounding it needs; absent
  files fall back to the skill's generic `prompts/`. **Loom ships exactly two
  overrides** (`adversary-plan`, `adversary-spec`) preserving its governing-doc
  anchor; `adversary-review` and `validator-task` use the generic prompts
  unchanged (they are already identical to loom's).

### Consumer-root resolution (the load-bearing design problem)

Today the scripts assume the skill lives inside the consumer repo:
`ensure-panel-agent.sh:73-80` uses `git -C "$SKILL_DIR" rev-parse
--show-toplevel` and `resolve-panel.mjs:64` defaults `--models-file` to
`join(here,"..","sdlc.models.json")` (co-located with the script). Once the skill
is a global git-discovered clone, `SKILL_DIR` is inside `pi-sdlc`, so both resolve
into `pi-sdlc` — agents land in the wrong repo, the models file is not found, and
the stamped-agent *body* could be byte-identical while landing where pi never
loads it.

**Decision:** the extracted scripts resolve the **consumer root** independently of
`SKILL_DIR`. Precedence, highest first: (1) explicit `--config <path>` /
`--repo-root <path>`; (2) a `SDLC_ROOT` env var if the SKILL sets it; (3) walk up
from `$PWD` to the nearest ancestor containing `.pi/sdlc/sdlc.config.json`
(a configured project); (4) if none is found, the git top-level of `$PWD` with the
built-in defaults (a no-manifest project); (5) if `$PWD` is not in a git repo and
no flag/env is given, exit non-zero with a diagnostic telling the user to pass
`--config` or set `SDLC_ROOT`. `--dir` for stamped agents then defaults to
`<consumer-root>/.pi/agents`; `--models-file` / config default to
`<consumer-root>/.pi/sdlc/`. The SKILL instructs invoking from the consumer repo
root (the pi session-start dir), per the session-start-dir gotcha in `AGENTS.md`.
This resolution contract is a frozen surface.

## Frozen surfaces (the full irreversible inventory)

Each evolves additively-within-major and is covered by an ADR (D7):

1. `sdlc.config.json` JSON Schema (fields, types, required set, defaults).
2. `sdlc.models.json` JSON Schema (the fields `resolve-panel` reads, above).
3. The `.pi/sdlc/` directory layout (`sdlc.config.json`, `sdlc.models.json`,
   optional `prompts/`).
4. The script CLIs: `resolve-panel.sh` (`<phase>`, `--author`, `--pong`,
   `--models-file`, `--emit-tasks`, `--config`; its stdout model-list and
   `--emit-tasks` JSON shape; exit codes) and `ensure-panel-agent.sh`
   (`<phase>`, `--dir`, `--tools`, `--force`, `--config`; exit codes).
5. The consumer-root resolution contract (§ above).
6. Derivation rules: phase ids `{plan_review, spec_review, pr_review,
   task_validate}`; agent name = `<prefix>-<phase-slug>` where phase-slug is the
   phase id with `_`→`-` (so `pr_review`→`pr-review`, giving `loom-pr-review` when
   `prefix=loom` — byte-identical to today); the stamped `description` label =
   `<labelPrefix>` (so `loom-sdlc` for loom); label vocabulary =
   `<labelPrefix>:{map,ticket-research,ticket-prototype,ticket-grilling,
   ticket-task,epic,build-task,hitl,afk}`.
7. The four phase-prompt skeleton shapes (the sections a consumer override must
   preserve). Absent an override, this does not bind a consumer.

## Objectives

- O1: A project-agnostic `sdlc` skill exists in a dedicated, pi-discoverable
  `pi-sdlc` repo with no loom-domain content in its generic surface.
- O2: A documented, versioned config schema + models schema + the resolution
  contract + the script CLIs form the complete, enumerated seam a consumer binds
  to.
- O3: Loom is migrated to consume the extracted skill via its `.pi/sdlc/` manifest
  with **zero behavioural change** to how a loom change is driven: identical
  commands, agent names, label vocabulary, announce string, artefacts, gates, and
  reviewer grounding (loom ships exactly the two prompt overrides that preserve
  its governing-doc anchor).
- O4: `pr_review` is proven equivalent end-to-end; the other three phases are
  proven equivalent on their deterministic outputs (stamped agent full file +
  landing path + resolved panel logic). Equivalence is demonstrated, not asserted.

## Scope

**In:** the `pi-sdlc` repo and `sdlc` skill (generalised, token-driven SKILL body
+ generic prompts + tracker-ops/agent-brief templates + two JSON Schemas +
documented examples + README + package.json + MIT LICENSE per DEP1); the
consumer-root resolution rewrite of both scripts; the loom migration — loom gains
`.pi/sdlc/` (its `sdlc.config.json`, `sdlc.models.json`, and two prompt
overrides), loom's `.pi/skills/loom-sdlc/` is deleted, and every in-repo pointer
is updated: `AGENTS.md`, `CONTRIBUTORS.md`, `.github/pull_request_template.md`,
and the `.gitignore` agent-glob (to `<prefix>-*`); ADRs for the frozen surfaces;
a regression proof.

**Out:** tracker pluggability beyond GitHub (Jira/GitLab) — GitHub only, tokenised;
any new phase, gate, track, or change to adjudication/stop rules; any change to the
four delegated global skills; any change to loom's `src/` or runtime; **generalising
loom's CI `sdlc-artifacts` job** — it stays hard-coded to loom's `docs/plans|specs`
paths (the manifest `paths` field drives *skill-internal* resolution only, NOT CI;
disclosed so no equivalence claim covers CI, and see R6); publishing to a public
registry.

## Dependencies (hard pre-build gates)

- DEP1: **Licence.** `pi-sdlc` ships an **MIT** `LICENSE` (matching the
  `pi-md-to-pdf`/`pi-repo-html` precedent and the "shareable" intent), unless Neil
  chooses otherwise at the approval gate. Build commits `LICENSE`; D1 requires it.
  If Neil defers the licence, build is blocked (no publish without a licence
  decision).
- DEP2: **Sequencing.** The `pi-sdlc` repo must be published and pi-discoverable on
  the machine (D1) *before* loom's engine deletion (D5) lands, so loom is never
  left without a working SDLC. Enforced as a falsifiable ordering gate in D5.

## Definition of done (falsifiable)

- D1: `pi-sdlc` repo exists with `skills/sdlc/{SKILL.md,scripts,prompts,schema,
  assets}`, `README.md`, `package.json` declaring `"pi":{"skills":["./skills"]}`,
  and an MIT `LICENSE`; pi discovers `/skill:sdlc` (assert the surfaced git path +
  a `pi` skill-list entry).
- D2: `grep -rniE 'loom|rundriver|northstar|handover|conveyanc|clc|build board|threadsafe-systems|adapter boundary|sdlc-artifacts'
  skills/sdlc/` returns zero outside `schema/` examples and `docs/`. This is a
  lexical backstop; the spec's exhaustive substitution-site list is the primary
  mechanism (concept-name leaks without those literals need manual review).
- D3: `sdlc.config.json` and `sdlc.models.json` each have a committed JSON Schema
  and documented example; a malformed manifest of either is rejected by the
  scripts with a clear non-zero error.
- D4a (deterministic, agents): for all four phases, the extracted
  `ensure-panel-agent` stamps a **full file** (frontmatter incl. `description` +
  body + filename) byte-identical to loom's pre-extraction stamp — using loom's
  two prompt overrides for plan/spec and the generic prompts for review/validate —
  AND the file lands in the **consumer's** `.pi/agents` when the skill is invoked
  from a global path (golden fixtures under `docs/reviews/`).
- D4b (deterministic, panel logic): under a fixed, stubbed credential environment
  (env vars + a fixture `auth.json`; no live calls, per `resolve-panel`'s
  `hasCreds`), the extracted `resolve-panel` selects the same model set and emits
  the same `--emit-tasks` JSON as the original for all four phases.
- D5: Loom's `.pi/skills/loom-sdlc/` is deleted; `.pi/sdlc/` holds only loom's
  config + models + two prompt overrides (no engine scripts); loom's config
  reproduces the current `prefix=loom`, `labelPrefix=loom-sdlc`, and announce
  string (asserted); `AGENTS.md`, `CONTRIBUTORS.md`, the PR template, and
  `.gitignore` are updated; loom's offline gate stays green. **Ordering gate:** the
  deletion commit is made only after `pi` discovery of `/skill:sdlc` is verified on
  the machine (DEP2) — falsified by the commit graph if violated.
- D6: `pr_review` is driven end-to-end in loom through the extracted skill; the run
  produces exactly the SKILL-defined artefact set — `docs/reviews/<phase>-<feat>-<date>/`
  with one file per model, `prompt.md`, and a `consolidated.md` carrying the named
  required sections (panel table, per-finding adjudication, stop condition,
  orchestrating model). "Shape" = that file set + those sections; the
  non-deterministic *content* of `consolidated.md` is not byte-compared.
- D7: ADRs recorded for each frozen-surface class in §Frozen surfaces (both schemas,
  layout, CLIs, resolution contract, derivation rules, prompt skeletons) and for the
  skill name and distribution model.

## Verification scenarios (for the spec to make testable)

- V1 (O1/D2): the loom-leakage grep over `skills/sdlc/` is empty.
- V2 (O2/D3): each schema validates loom's example; an intentionally broken example
  of each is rejected non-zero.
- V3a (O4/D4a): golden full-file + landing-path diff of the four stamped agents
  (two via overrides, two generic), invoked from a simulated global skill path, is
  empty and lands under the consumer `.pi/agents`.
- V3b (O4/D4b): under the stubbed cred env, the four-phase model set + `--emit-tasks`
  JSON match the original.
- V4 (O3/D5): loom engine/script duplication grep empty; no stale
  `.pi/skills/loom-sdlc` reference in `AGENTS.md`/`CONTRIBUTORS.md`/PR template;
  loom config reproduces prefix/labelPrefix/announce; loom offline gate green;
  deletion commit is a descendant of the discovery-verification.
- V5 (O3/D6): the loom `pr_review` dry run yields the defined review dir + sections.
- V6 (O2/D7): the ADR files exist, one per frozen-surface class + name + distribution.

## Risks

- R1: **Hidden coupling in SKILL/tracker-ops/agent-brief prose.** Mitigation: the
  spec pins the `<PREFIX>`/`<LABEL_PREFIX>` token set and every substitution site
  (incl. `ensure-panel-agent.sh:93` description and `SKILL.md:143` CI-job name);
  D2's widened grep is the lexical backstop.
- R2: **Silent behavioural drift in loom.** Mitigation: D4a/D4b deterministic gates;
  D6 end-to-end for pr_review; loom instance values asserted in D5.
- R3: **A frozen surface freezes wrong.** Mitigation: the spec panel scrutinises the
  full §Frozen surfaces inventory; additive-within-major in the ADRs.
- R4: **Cross-repo sequencing / overlap window.** Mitigation (DEP2 + D5 ordering
  gate): publish + verify discoverable first; loom manifest + pointer land; engine
  deletion last, as a verified descendant commit.
- R5: **Consumer-root resolution regressions** (worktree vs main checkout, no-manifest,
  outside-repo). Mitigation: the five-step contract names every terminal case;
  V3a exercises the global-path branch and asserts the consumer landing dir.
- R6: **Manifest `paths` vs loom CI hard-coding divergence.** loom's CI
  `sdlc-artifacts` job stays hard-coded to `docs/plans|specs`; if loom ever changes
  doc paths via the manifest, CI must be updated in lockstep. Mitigation: the loom
  config documents that CI is not path-aware; treated as accepted, disclosed coupling.

## Context for the next agent (spec author)

Current skill: `~/code/threadsafe/loom/.pi/skills/loom-sdlc/`. The spec must,
field-by-field: (a) pin the `sdlc.config.json` JSON Schema (`prefix`, `labelPrefix`,
`announce`, `paths.{plans,specs,reviews,agents}`, optional `tracker.{repo,
board.{number,url}}`) with no-manifest defaults (`prefix`=`sdlc`,
`labelPrefix`=`sdlc`, doc paths `docs/plans|specs|reviews`, `.pi/agents`, announce
"Using the sdlc skill to drive this change through its lifecycle", tracker modes
error if invoked without `tracker`); (b) pin the `sdlc.models.json` schema; (c) pin
the five-step consumer-root resolution incl. every terminal case; (d) pin the
derivation rules (agent name `<prefix>-<phase-slug>`; description label
`<labelPrefix>`; the nine-label vocabulary); (e) pin the token convention and every
substitution site in SKILL/tracker-ops/agent-brief and `ensure-panel-agent.sh:93`;
(f) pin each of the four prompt skeletons' required sections and identify the two
loom overrides; (g) specify the stubbed-cred harness for D4b.

**Loom's manifest instance values** (the migration must produce exactly these, so
O3 holds): `prefix`=`loom`, `labelPrefix`=`loom-sdlc`, `announce`="Using loom-sdlc
to drive this change through its lifecycle.", `paths`=`docs/plans|specs|reviews` +
`.pi/agents`, `tracker.repo`=`threadsafe-systems/loom`,
`tracker.board`={number:4, url:"https://github.com/orgs/threadsafe-systems/projects/4"},
plus the two prompt overrides (`adversary-plan`, `adversary-spec`) preserving the
`HANDOVER.md`/`northstar`/`first-principles` governing-doc anchor.
