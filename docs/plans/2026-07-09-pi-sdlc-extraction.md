# Plan: extract loom-sdlc into a portable `sdlc` skill (`pi-sdlc`)

- Date: 2026-07-09
- Track: **irreversible** (the per-project manifest schema becomes a frozen
  surface that consumer projects bind to). Full pipeline: plan panel AND spec
  panel before build.
- Author vendor: anthropic (excluded from panels).

## Rationale

`loom-sdlc` is a working, enforced software-development lifecycle: fixed phase
sequence, two tracks, per-phase adversarial gates, a resolve/stamp/dispatch
panel machine, a per-task validator, worktree discipline, and delegation to the
already-global `adversarial-review`, `dispatch-subagents`,
`gh-pr-review-comments`, and `sdlc-visual-docs` skills. The pattern is generic;
only its **identity** is loom-specific. An audit of the live skill found 69
loom references in four mechanical buckets: naming (`loom-sdlc`, `loom-*`
agents, `loom-sdlc:*` labels), paths (`docs/plans|specs|reviews`, `.pi/agents`),
tracker identity (`threadsafe-systems/loom`, "Loom Build Board" project #4), and
domain examples baked into the four phase prompts (RunDriver honesty discipline,
locked decisions, northstar/adapter pointers). Buckets 1 to 3 are parameterisable;
bucket 4 is the only genuine generalisation work.

Extracting it makes the pattern reusable across projects and turns it into a
shareable, portable artefact (a background-IP / ThreadSafe pattern-library asset
that also underpins the SDLC-integration services).

## Distribution model (grounded in existing precedent)

The machine has two global-skill precedents: a personal mono-repo
(`~/.agents/skills/`: adversarial-review, dispatch-subagents,
gh-pr-review-comments, remnic-memory-ops) and **dedicated `threadsafe-systems/pi-*`
repos** for productised, shareable pi tooling (`pi-worktree`, `pi-repo-html`,
`pi-md-to-pdf`), each shaped `pi-<name>/skills/<name>/SKILL.md` and surfaced via
pi's git skill discovery (`~/.pi/agent/git/github.com/threadsafe-systems/...`).
A portable SDLC belongs in the second bucket. Target:

```
threadsafe-systems/pi-sdlc/
  LICENSE  README.md
  skills/sdlc/
    SKILL.md                 # the process law + engine, project-agnostic
    scripts/                 # resolve-panel, ensure-panel-agent (manifest-driven)
    prompts/                 # generic phase-prompt skeletons (plan/spec/review/validate)
    schema/                  # sdlc.config.json JSON Schema + a documented example
    assets/                  # generic tracker-ops + agent-brief
  docs/{plans,specs,reviews} # this extraction's own SDLC artefacts (dogfood)
```

## The seam (the frozen surface)

The generic skill is driven by a small per-project manifest that a consumer repo
supplies under `.pi/sdlc/`:

- `sdlc.config.json` — name/prefix, doc paths, `.pi/agents` dir, tracker repo +
  board (project number/url) + label prefix. This file's **schema is the frozen
  contract** (it evolves additively within a major, per the irreversible-track
  rule).
- `sdlc.models.json` — the panel model roster (already project-local today).
- `prompts/*.md` — the project's four phase prompts (generic skeleton plus the
  project's own honesty-discipline / locked-decision inserts).

`resolve-panel`, `ensure-panel-agent`, and the SKILL body read the manifest
instead of hard-coding `loom`. Precedence: an absent manifest falls back to
documented conventional defaults (docs/plans etc.), so a project with no tracker
still gets phases + panels.

## Objectives

- O1: A project-agnostic `sdlc` skill exists in a dedicated `pi-sdlc` repo with
  no loom-domain content in the generic surface.
- O2: A documented, versioned manifest schema (`sdlc.config.json`) is the single
  seam a consumer binds to; the scripts and SKILL read it.
- O3: Loom is migrated to consume the extracted skill via its manifest, with
  **zero behavioural change** to how a loom change is driven.
- O4: The migration is proven equivalent, not asserted (golden comparison of the
  panel machinery's observable output before and after).

## Scope

**In:** the new `pi-sdlc` repo and `sdlc` skill (generalised SKILL, scripts,
prompt skeletons, schema + example, generic assets, README, LICENSE); the loom
migration (loom keeps only its manifest + four project prompts + tracker values;
loom's engine/scripts are removed in favour of the global skill); a regression
proof; ADRs for the frozen manifest schema, the name, and the distribution model.

**Out:** tracker pluggability beyond GitHub (Jira/GitLab) — GitHub only, just
parameterised; any new phase, gate, track, or change to the adjudication/stop
rules; any change to the four delegated global skills; any change to loom's
`src/` or its runtime; publishing to a public registry or licensing decisions
(flagged for Neil, not executed here); creating the GitHub remote (deferred to
build, after spec approval).

## Definition of done (falsifiable)

- D1: `pi-sdlc` repo exists with `skills/sdlc/{SKILL.md,scripts,prompts,schema,assets}`,
  README, LICENSE; the skill is discoverable by pi (surfaced git path present).
- D2: `grep -rniE 'loom|rundriver|northstar|handover|conveyanc|clc' skills/sdlc/`
  returns zero matches outside `schema/example` and `docs/` (no loom leakage in
  the generic surface). Falsifiable by the grep.
- D3: `sdlc.config.json` has a committed JSON Schema and a documented example;
  a malformed manifest is rejected with a clear error by the scripts.
- D4: With loom's manifest supplied, the extracted `resolve-panel` emits output
  **byte-identical** to loom's current `resolve-panel` for all four phases, and
  `ensure-panel-agent` produces agents whose bodies are byte-identical to the
  pre-extraction stamps (golden comparison committed under `docs/reviews/`).
- D5: Loom's `.pi/skills/loom-sdlc/` no longer contains a copy of the engine
  scripts or the generic SKILL body; it contains only the manifest, the four
  project prompts, and the tracker values, plus a one-line pointer to the global
  skill. Loom's offline gate (`npm test`, `tsc`) stays green.
- D6: One phase (pr_review) is driven end-to-end in loom through the extracted
  skill in a dry run, producing the same artefact shape as before.
- D7: ADRs recorded for: the manifest schema (frozen), the skill name, the
  distribution/discovery model.

## Verification scenarios (for the spec to make testable)

- V1 (O1/D2): the loom-leakage grep over `skills/sdlc/` is empty.
- V2 (O2/D3): schema validates the loom example; an intentionally broken example
  is rejected.
- V3 (O2/D4): golden diff of `resolve-panel` output (all four phases) and
  `ensure-panel-agent` bodies, extracted-vs-original, is empty.
- V4 (O3/D5): loom engine/script duplication grep is empty; loom offline gate green.
- V5 (O3/D6): the loom pr_review dry run yields a `docs/reviews/<...>/consolidated.md`
  of the same shape as this repo's own.
- V6 (O4/D7): three ADR files exist with the three-part trigger recorded.

## Risks

- R1: **Hidden loom coupling in prompt bodies.** Bucket 4 may carry more
  loom-specific reasoning than a grep catches. Mitigation: the spec pins each
  phase prompt's generic skeleton and lists every project insert explicitly.
- R2: **Silent behavioural drift in loom.** The migration could subtly change a
  command or path. Mitigation: D4/V3 golden comparison is the gate, not eyeballing.
- R3: **Manifest schema freezes wrong.** An under-designed schema forces a
  breaking change later. Mitigation: spec panel scrutinises the schema as the
  irreversible surface; additive-within-major discipline documented in an ADR.
- R4: **Two sources of truth during migration.** Mitigation: loom deletes its
  engine copy in the same change that points it at the global skill (no overlap
  window on `main`).

## Context for the next agent (spec author)

The current skill is at `~/code/threadsafe/loom/.pi/skills/loom-sdlc/` (SKILL.md
285 lines, scripts resolve-panel.mjs/.sh + ensure-panel-agent.sh, four
`assets/adversary-*|validator-task.prompt.md`, `agent-brief.md`, `tracker-ops.md`,
`sdlc.models.json`). The generalisation is name/path/tracker parameterisation
plus lifting the four prompts' loom inserts into loom's project overlay. The spec
must pin the manifest JSON Schema field-by-field (the frozen surface) and the
generic skeleton of each of the four phase prompts.
