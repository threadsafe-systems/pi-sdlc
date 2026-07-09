# Plan: extract loom-sdlc into a portable `sdlc` skill (`pi-sdlc`)

- Date: 2026-07-09
- Track: **irreversible** — several consumer-visible surfaces freeze (see §Frozen
  surfaces). Full pipeline: plan panel AND spec panel before build.
- Author vendor: anthropic (excluded from panels).
- Revision: v2, incorporating the plan panel (openai-codex, deepseek, zai;
  adjudication in `docs/reviews/plan-pi-sdlc-extraction-2026-07-09/`).

## Rationale

`loom-sdlc` is a working, enforced software-development lifecycle: fixed phase
sequence, two tracks, per-phase adversarial gates, a resolve/stamp/dispatch panel
machine, a per-task validator, worktree discipline, and delegation to the
already-global `adversarial-review`, `dispatch-subagents`,
`gh-pr-review-comments`, and `sdlc-visual-docs` skills. The pattern is generic;
its **identity** is loom-specific. Extracting it makes the pattern reusable and
turns it into a shareable, portable artefact (a background-IP / ThreadSafe
pattern-library asset that also underpins the SDLC-integration services).

### Where the loom coupling actually lives (corrected from v1)

A file-by-file audit (not a single grep) locates the real generalisation work,
correcting v1's wrong claim that it is "in the four phase prompts":

- **The four phase prompts are already generic.** `adversary-review.prompt.md`
  and `validator-task.prompt.md` have zero loom/domain references;
  `adversary-plan.prompt.md:12` and `adversary-spec.prompt.md:14` each name
  loom's governing-doc set (`HANDOVER.md`, `northstar`, `first-principles`) only
  as *examples* of "governing docs and locked decisions". Work here is a
  two-line genericisation, nothing more.
- **`SKILL.md` (body) is the bulk of the work:** the name/announce string
  (`:2,3,6,8,14`), loom plan cross-refs (`:10-12`), the `loom-sdlc:*` label
  vocabulary in the map/build prose (`:65,74,79,120,122,129`), "Loom Build
  Board" (`:129`).
- **`assets/tracker-ops.md`** hard-codes `threadsafe-systems/loom`, "Loom Build
  Board" project #4 + URL, and the nine `loom-sdlc:*` labels (`:8-35`).
- **`assets/agent-brief.md`** uses loom adapter-boundary examples (`:32-34`) and
  `loom-sdlc:*` label examples (`:91-99`).
- **The scripts** hard-code the `loom-` agent-name prefix
  (`ensure-panel-agent.sh:40-43`) and resolve paths relative to the skill's own
  location (see §Consumer-root resolution — the load-bearing design problem).

## Distribution model (grounded in existing precedent)

Two global-skill precedents exist: a personal mono-repo (`~/.agents/skills/`) and
**dedicated `threadsafe-systems/pi-*` repos** for productised, shareable pi
tooling (`pi-worktree`, `pi-repo-html`, `pi-md-to-pdf`), each shaped
`pi-<name>/skills/<name>/SKILL.md`, declaring `"pi": {"skills": ["./skills"]}` in
`package.json`, and surfaced via pi's git skill discovery
(`~/.pi/agent/git/github.com/threadsafe-systems/...`). A portable SDLC belongs in
the second bucket. Target:

```
threadsafe-systems/pi-sdlc/
  LICENSE  README.md  package.json      # package.json: {"pi":{"skills":["./skills"]}}
  skills/sdlc/
    SKILL.md                 # process law + engine, project-agnostic, <PREFIX>-tokenised
    scripts/                 # resolve-panel, ensure-panel-agent (consumer-root + manifest aware)
    prompts/                 # the four phase-prompt skeletons (generic)
    schema/                  # sdlc.config.json JSON Schema + a documented example
    assets/                  # tracker-ops + agent-brief as <PREFIX>/<LABEL_PREFIX> templates
  docs/{plans,specs,reviews} # this extraction's own SDLC artefacts (dogfood)
```

## The seam and manifest

A consumer repo supplies a manifest directory `.pi/sdlc/` (single canonical
location, used everywhere in this plan):

- `.pi/sdlc/sdlc.config.json` — the frozen config (see §Frozen surfaces).
  Fields: `prefix` (drives agent names and label vocabulary), `announce`
  (the start-of-work string), `paths` (plans/specs/reviews/agents dirs),
  `tracker` (optional: `repo`, `board` {number,url}, `labelPrefix`).
- `.pi/sdlc/sdlc.models.json` — the panel model roster.
- `.pi/sdlc/prompts/*.md` — **optional** project prompt overrides; absent means
  the skill's own generic `prompts/` are used (loom will NOT ship overrides —
  see O3, this preserves "zero behavioural change").

### Consumer-root resolution (the load-bearing design problem)

Today the scripts assume the skill lives *inside* the consumer repo:
`ensure-panel-agent.sh:73-80` uses `git -C "$SKILL_DIR" rev-parse
--show-toplevel` and `resolve-panel.mjs:64` defaults `--models-file` to
`join(here,"..","sdlc.models.json")` (co-located with the script). Once the skill
is a global git-discovered clone, `SKILL_DIR` is inside `pi-sdlc`, so both would
resolve into `pi-sdlc`, writing agents and reading models from the wrong repo —
invisible to the consumer's pi session. The stamped-agent *body* could be
byte-identical while the file lands where pi will never load it.

**Decision:** the extracted scripts resolve the **consumer root** independently
of `SKILL_DIR`. Resolution order, highest precedence first: (1) an explicit
`--config <path>` / `--repo-root <path>` flag; (2) `$LOOM_SDLC_ROOT`-style env
var if set by the SKILL; (3) walk up from `$PWD` to the nearest ancestor
containing `.pi/sdlc/sdlc.config.json`. `--dir` for stamped agents then defaults
to `<consumer-root>/.pi/agents`, and `--models-file` / config default to
`<consumer-root>/.pi/sdlc/`. The SKILL instructs invoking from the consumer repo
root (the pi session-start dir), consistent with the session-start-dir gotcha in
`AGENTS.md`. This resolution contract is itself a frozen surface.

## Frozen surfaces (the full irreversible inventory)

The irreversible-track call is driven by all of the following, each evolving
additively-within-major and each covered by an ADR (D7):

1. `sdlc.config.json` JSON Schema (field names, types, required set, defaults).
2. The `.pi/sdlc/` directory layout (`sdlc.config.json`, `sdlc.models.json`,
   `prompts/`).
3. The script CLIs: `resolve-panel.sh` (`<phase>`, `--author`, `--pong`,
   `--models-file`, `--emit-tasks`, `--config`; its stdout model-list and
   `--emit-tasks` JSON shape; exit codes) and `ensure-panel-agent.sh`
   (`<phase>`, `--dir`, `--tools`, `--force`, `--config`; exit codes).
4. The consumer-root resolution contract (§ above).
5. The derivation rules: phase ids `{plan_review, spec_review, pr_review,
   task_validate}`; agent name = `<prefix>-<phase-slug>` (e.g. `sdlc-pr-review`);
   label vocabulary = `<labelPrefix>:{map,ticket-research,ticket-prototype,
   ticket-grilling,ticket-task,epic,build-task,hitl,afk}`.
6. The four phase-prompt skeleton shapes (the sections a consumer override must
   preserve). If a consumer supplies no override, this does not bind them.

## Objectives

- O1: A project-agnostic `sdlc` skill exists in a dedicated, pi-discoverable
  `pi-sdlc` repo with no loom-domain content in its generic surface.
- O2: A documented, versioned config schema + the resolution contract + the
  script CLIs form the complete, enumerated seam a consumer binds to.
- O3: Loom is migrated to consume the extracted skill via its `.pi/sdlc/`
  manifest with **zero behavioural change** to how a loom change is driven
  (loom ships no prompt overrides; same commands, artefacts, gates).
- O4: `pr_review` is proven equivalent end-to-end; the other three phases are
  proven equivalent on their deterministic outputs (stamped agent + resolved
  panel logic). Equivalence is demonstrated, not asserted.

## Scope

**In:** the `pi-sdlc` repo and `sdlc` skill (generalised, `<PREFIX>`-tokenised
SKILL body + generic prompts + tracker-ops/agent-brief templates + JSON Schema +
documented example + README + package.json); the consumer-root resolution
rewrite of both scripts; the loom migration — loom gains `.pi/sdlc/` (its
`sdlc.config.json` + `sdlc.models.json`, no prompt overrides), loom's
`.pi/skills/loom-sdlc/` is deleted, and every in-repo pointer is updated:
`AGENTS.md`, `CONTRIBUTORS.md`, `.github/pull_request_template.md`, and the
`.gitignore` agent-glob (to `<prefix>-*`); ADRs for the frozen surfaces; a
regression proof.

**Out:** tracker pluggability beyond GitHub (Jira/GitLab) — GitHub only, just
tokenised; any new phase, gate, track, or change to adjudication/stop rules; any
change to the four delegated global skills; any change to loom's `src/` or
runtime; **generalising loom's CI `sdlc-artifacts` job** — it stays hard-coded to
loom's `docs/plans|specs` paths (the manifest `paths` field drives *skill-internal*
resolution only, NOT CI; this is disclosed so no equivalence claim covers CI);
publishing to a public registry; **the licence choice** (a pre-build dependency
owned by Neil — see §Dependencies).

## Dependencies (must resolve before build)

- DEP1: **Licence choice** for `pi-sdlc` (Neil). It is background IP; a permissive
  licence (MIT/Apache-2.0) makes it shareable, a proprietary/no-licence keeps it
  closed. Build cannot add `LICENSE` until this is decided; `LICENSE` is therefore
  NOT in the DoD, and D1 requires only `README.md` + `package.json`.
- DEP2: **Sequencing.** The `pi-sdlc` repo must be published and git-discoverable
  on the machine (D1) *before* loom's engine deletion lands, so loom is never left
  without a working SDLC. See R4.

## Definition of done (falsifiable)

- D1: `pi-sdlc` repo exists with `skills/sdlc/{SKILL.md,scripts,prompts,schema,
  assets}`, `README.md`, and `package.json` declaring `"pi":{"skills":["./skills"]}`;
  pi discovers `/skill:sdlc` (assert the surfaced git path + a `pi` skill-list
  entry).
- D2: `grep -rniE 'loom|rundriver|northstar|handover|conveyanc|clc|build board|threadsafe-systems'
  skills/sdlc/` returns zero matches outside `schema/` examples and `docs/`
  (covers SKILL body, prompts, tracker-ops, agent-brief — the full generic surface).
- D3: `sdlc.config.json` has a committed JSON Schema and a documented example;
  a malformed manifest is rejected by the scripts with a clear non-zero error.
- D4a (deterministic, agents): for all four phases, the extracted
  `ensure-panel-agent` stamps a **full file** (frontmatter + body + filename +
  landing path) byte-identical to loom's pre-extraction stamp, AND the file lands
  in the **consumer's** `.pi/agents` when the skill is invoked from a global path
  (golden fixtures committed under `docs/reviews/`).
- D4b (deterministic, panel logic): under a fixed, stubbed credential environment,
  the extracted `resolve-panel` selects the **same model set** and emits the
  **same `--emit-tasks` JSON** as the original for all four phases (logic
  equivalence, not a live-env byte snapshot).
- D5: Loom's `.pi/skills/loom-sdlc/` is deleted; `.pi/sdlc/` holds only loom's
  config + models (no prompt overrides, no engine scripts); `AGENTS.md`,
  `CONTRIBUTORS.md`, the PR template, and `.gitignore` are updated to the new
  path/prefix; loom's offline gate (`npm test`, `tsc`) stays green.
- D6: `pr_review` is driven end-to-end in loom through the extracted skill; the
  run produces exactly the artefact set the SKILL defines — `docs/reviews/<phase>-<feat>-<date>/`
  containing one file per model, `prompt.md`, and a `consolidated.md` carrying
  the named required sections (panel table, per-finding adjudication, stop
  condition, orchestrating model). "Shape" = that file set + those sections;
  the non-deterministic *content* of `consolidated.md` is NOT byte-compared.
- D7: ADRs recorded for each frozen surface class in §Frozen surfaces (schema +
  layout + CLIs + resolution contract + derivation rules + prompt skeletons),
  and for the skill name and distribution model.

## Verification scenarios (for the spec to make testable)

- V1 (O1/D2): the loom-leakage grep over `skills/sdlc/` is empty.
- V2 (O2/D3): the schema validates loom's example; an intentionally broken example
  is rejected non-zero.
- V3a (O4/D4a): golden full-file + landing-path diff of the four stamped agents,
  extracted-vs-original, invoked from a simulated global skill path, is empty and
  lands under the consumer `.pi/agents`.
- V3b (O4/D4b): under a stubbed cred env, the four-phase model set + `--emit-tasks`
  JSON match the original.
- V4 (O3/D5): loom engine/script duplication grep empty; pointer-update grep shows
  no stale `.pi/skills/loom-sdlc` reference in `AGENTS.md`/`CONTRIBUTORS.md`/PR
  template; loom offline gate green.
- V5 (O3/D6): the loom `pr_review` dry run yields the defined review dir + sections.
- V6 (O2/D7): the ADR files exist, one per frozen-surface class + name + distribution.

## Risks

- R1: **Hidden coupling in SKILL/tracker-ops/agent-brief prose** beyond the grep.
  Mitigation: the spec pins the `<PREFIX>`/`<LABEL_PREFIX>` token set and lists
  every substitution site; D2's grep is the backstop.
- R2: **Silent behavioural drift in loom.** Mitigation: D4a/D4b golden gates on the
  deterministic surfaces; D6 end-to-end for pr_review; not eyeballing.
- R3: **A frozen surface freezes wrong.** Mitigation: the spec panel scrutinises the
  full §Frozen surfaces inventory (not just the schema); additive-within-major in
  the ADRs.
- R4: **Cross-repo sequencing / overlap window.** Mitigation (DEP2): publish +
  verify `pi-sdlc` discoverable first; loom's manifest + pointer land; the engine
  deletion lands only after D1 is verifiable on the machine. Loom is never on
  `main` without a working SDLC.
- R5: **Consumer-root resolution regressions** (worktree vs main checkout).
  Mitigation: V3a exercises invocation from a global skill path and asserts the
  consumer landing dir.

## Context for the next agent (spec author)

Current skill: `~/code/threadsafe/loom/.pi/skills/loom-sdlc/` (SKILL.md 285 lines;
`scripts/resolve-panel.mjs`+`.sh`, `scripts/ensure-panel-agent.sh`; four
`assets/*.prompt.md`; `assets/agent-brief.md`; `assets/tracker-ops.md`;
`sdlc.models.json`). The spec must, field-by-field: (a) pin the
`sdlc.config.json` JSON Schema including `prefix`, `announce`, `paths.{plans,
specs,reviews,agents}`, and optional `tracker.{repo,board.{number,url},
labelPrefix}`, with defaults for a no-manifest/no-tracker project (agent prefix
`sdlc`, label prefix `sdlc`, doc paths `docs/plans|specs|reviews`, `.pi/agents`,
announce "Using the sdlc skill to drive this change through its lifecycle",
tracker modes error if invoked without `tracker`); (b) pin the consumer-root
resolution order; (c) pin the derivation rules (agent name `<prefix>-<phase-slug>`;
the nine-label vocabulary from `labelPrefix`); (d) pin the `<PREFIX>`/`<LABEL_PREFIX>`
token convention and every substitution site in SKILL/tracker-ops/agent-brief;
(e) pin each of the four prompt skeletons' required sections; (f) specify the
stubbed-cred harness for D4b. Prompts need only the two-line governing-doc
genericisation (`adversary-plan:12`, `adversary-spec:14`).
