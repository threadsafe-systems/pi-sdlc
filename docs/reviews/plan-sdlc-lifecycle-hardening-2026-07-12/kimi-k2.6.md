### Scope exceeds one spec and the plan admits it

- severity: high
- confidence: high
- location: Scope / In scope; Risks section
- defect: The plan commits to ~15 distinct surfaces (SKILL.md, all templates, setup, readiness, CI checks, traceability, task-check config, author-model prefs, panel invariants, tracker/no-tracker, script references, tests, ADRs, migration notes) across eight outcomes. Its own risk section states it “could become multiple loosely connected features,” yet it does not decompose.
- evidence: “Scope size: this touches several frozen surfaces and could become multiple loosely connected features. The Specification must organise it into coherent contracts and may recommend a major release…” (Risks). In-scope list covers `skills/sdlc/SKILL.md`, Plan/Spec/Build/consolidation/brainstorm-recap/PR templates, setup/readiness, CI checks, traceability, task-check config, author-model prefs, panel invariants, tracker behaviour, broken references, tests, ADRs, migration notes.
- impact: A single spec cannot keep traceability across this many surfaces; implementation will scatter, panels will be overwhelmed, and requirements will likely be dropped silently.
- fix: Decompose into at least two plans: (1) lifecycle observability, setup honesty, and broken-reference repair; (2) authoring templates, model preferences, and tracker coherence.

### Non-TypeScript fixture infrastructure is unscoped

- severity: medium
- confidence: high
- location: O4 — Portable implementation validation; DoD — task validation passes representative non-TypeScript and TypeScript fixtures
- defect: O4 and the DoD require project-agnostic task validation with non-TypeScript fixtures, but the repo currently has no non-TypeScript fixtures, no harness for them, and the shipped validator prompt still prescribes `npx tsc --noEmit`. The plan names no dependency or fixture strategy.
- evidence: `skills/sdlc/prompts/validator-task.prompt.md:12` prescribes “2. Types: run `npx tsc --noEmit` from the repo root.” `package.json` has `"test": "node --test"` only. No non-TS sample projects or fixtures exist in the tree.
- impact: Implementers must invent fixture sourcing during Build, risking incomplete validation or last-minute scope expansion.
- fix: Add a risk/dependency naming how non-TypeScript fixtures are sourced (e.g., committed sample repos, generated temp projects, or a bounded language fixture set).

### Tracker board creation has no owner or phase assignment

- severity: medium
- confidence: high
- location: O6 — Coherent tracker behaviour; Risks — Tracker prerequisite
- defect: The plan’s own Build is blocked until “an appropriate board is created and recorded in config,” yet no phase or hook owns board creation. The existing setup scaffolder does not create boards; `tracker-ops.md` documents it as a one-time manual step.
- evidence: “Tracker prerequisite: the organisation currently has no dedicated pi-sdlc board. Build publication is blocked until an appropriate board is created and recorded in config.” (Risks). `skills/sdlc/assets/tracker-ops.md` “Setup (once)” shows manual `gh project create` commands, invoked by no script.
- impact: The plan can reach Build and stall indefinitely because no agent or human step is assigned to create the board.
- fix: Assign board creation to Setup (e.g., a `--create-board` flag) or to an explicit pre-Build manual prerequisite with a named owner and verification step.

### DoD delegates invariant choice to the unwritten Specification

- severity: medium
- confidence: high
- location: DoD — “Tests prove that review-panel configuration cannot violate whichever vendor/exclusion invariants the Specification declares global.”
- defect: This DoD item is contingent on a decision the Specification has not yet made. A plan’s acceptance criteria must be independently falsifiable; “whichever … the Specification declares” means the DoD cannot be tested until the spec is complete, and it permits the spec to declare weaker invariants than the plan implies.
- evidence: DoD item verbatim: “Tests prove that review-panel configuration cannot violate whichever vendor/exclusion invariants the Specification declares global.”
- impact: The plan lacks a falsifiable stop condition for O7; the spec could declare a weak invariant and the tests would trivially pass.
- fix: State the intended invariant in the plan (e.g., “distinct-vendor floor ≥ 2 and author-vendor exclusion are non-configurable”) so the DoD can test against it directly.

### Broken `CONTRIBUTORS.md` reference in prompts is omitted from scope

- severity: medium
- confidence: high
- location: In scope — “every currently broken or assumed reference”; `skills/sdlc/prompts/adversary-review.prompt.md`
- defect: The plan lists `AGENTS.md`, PR template, panel task block, and configurable paths as broken references to fix, but omits the adversary-review prompt’s reference to `CONTRIBUTORS.md` (the actual file is `CONTRIBUTING.md`). Because the plan claims to cover “every currently broken or assumed reference,” this is a scope gap.
- evidence: `skills/sdlc/prompts/adversary-review.prompt.md:35` says “Where AGENTS.md/CONTRIBUTORS.md endorses something”. The repo contains `CONTRIBUTING.md`, not `CONTRIBUTORS.md`. Plan In-scope says: “Package-relative script invocation and every currently broken or assumed reference (`AGENTS.md`, PR template, panel task block, configurable paths).”
- impact: The spec author may not fix the prompt, leaving a broken reference in a shipped frozen surface (FS7).
- fix: Add `CONTRIBUTORS.md → CONTRIBUTING.md` to the explicit list of broken references in scope.

### FS2 breaking change for author-model preferences lacks migration guard in DoD

- severity: medium
- confidence: high
- location: O7; Constraints; DoD
- defect: O7 requires author-model preferences for five new lifecycle phases. The existing `sdlc.models.schema.json` (FS2/ADR 0002) has `"additionalProperties": false` at the root and freezes exactly four panel phase keys. Adding per-author phase preferences is a breaking schema change requiring a major version bump, yet the DoD does not require a test proving existing v1 configs still load without error after the change.
- evidence: `skills/sdlc/schema/sdlc.models.schema.json` has `"additionalProperties": false` and `"required": ["phases"]` with exactly four keys. ADR 0002: “adding a fifth phase is a major change.”
- impact: A spec could add new keys without bumping `schemaVersion`, silently breaking existing consumers on the next config validation.
- fix: Add a DoD item requiring backward-compatibility tests: existing v1 `sdlc.models.json` and `sdlc.config.json` fixtures must still pass validation after the schema change, or the schema version must be bumped and migration documented.

CLEAR: B — Every stated outcome has a plausible verification path (traceability checker, status command, walkthrough tests, config validation, reference resolution tests).
CLEAR: D — The plan explicitly flags FS1, FS2, FS5, and FS7 as affected and requires the Specification to classify each amendment as additive or breaking; no unflagged contradiction found.
CLEAR: F — The plan correctly claims the irreversible track because it amends consumer-facing schema, script CLI, template, and prompt frozen surfaces.
