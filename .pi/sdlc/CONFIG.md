<!-- pi-sdlc:config-doc v2 fingerprint=121fa933519c34d8563998743f837bf3be1e76748f90d59016bce60280a6646e -->

# pi-sdlc effective configuration (generated)

> **Generated file — do not hand-edit.** `.pi/sdlc/sdlc.config.json` is the
> authoritative manifest; this companion only *explains* it. Hand edits are
> unsupported and are detected as stale. Regenerate with `config-doc.sh write`.

## Effective lifecycle shape

The behaviour below is derived only from the committed `sdlc.config.json`
values, resolved per track. The default track is
`shape.defaultTrack: irreversible`; tracker publication threshold
`shape.publishToTracker` is `2`.

### Track: irreversible

- **Phases:** brainstorm, plan, spec, build, implement, PR.
- **Design gate (`review.design`): panel** — an adversarial multi-model panel runs and must reach its stop condition.
- **Code/PR gate (`review.code`): panel** — an adversarial multi-model panel runs and must reach its stop condition.
- **Brainstorm gate (`review.brainstorm`): human**.
- **Task validation (`review.tasks`): subagent** — each task ends with a validator subagent running the deterministic runner.
- **Panel floor (`review.panelSize`): 2** distinct model(s); shortfall posture `review.onShortfall`: fail.
- **Separate Specification (`shape.separateSpec`): true** — Plan and Spec are distinct gated artifacts.

### Track: reversible

- **Phases:** brainstorm, plan, build, implement, PR.
- **Design gate (`review.design`): human** — a human owner reviews and approves; no model panel (reversible: no pre-PR design panel unless configured; the PR panel still runs).
- **Code/PR gate (`review.code`): panel** — an adversarial multi-model panel runs and must reach its stop condition.
- **Brainstorm gate (`review.brainstorm`): human**.
- **Task validation (`review.tasks`): subagent** — each task ends with a validator subagent running the deterministic runner.
- **Panel floor (`review.panelSize`): 2** distinct model(s); shortfall posture `review.onShortfall`: fail.
- **Separate Specification (`shape.separateSpec`): true** — not applicable on the reversible fast path (no Spec phase); it governs the irreversible track's plan/spec split.

## Resolved panel floors

Resolved as `resolve-panel` does: a per-phase `panels.phases.<phase>.panelSize`
wins; else `task_validate` is 1; else the track's
`overrides.<track>.review.panelSize`, else `review.panelSize`.

- **irreversible:** plan_review=2, spec_review=2, pr_review=3, task_validate=1.
- **reversible:** plan_review=2, spec_review=2, pr_review=3, task_validate=1.

## Configuration keys (JSON order)

- **`schemaVersion`** = `3`
  - The config schema version this skill requires. Alternatives: none (must equal the skill's supported version).
- **`prefix`** = `"pi-sdlc"`
  - Issue/branch prefix for this project. Alternatives: any prefix matching the schema pattern.
- **`labelPrefix`** = `"sdlc"`
  - Tracker label family prefix. Alternatives: any prefix matching the schema pattern.
- **`announce`** = `"Using the sdlc skill to drive this change through its lifecycle (pi-sdlc, dogfooding itself)."`
  - The startup announcement string. Alternatives: any non-empty string.
- **`paths`** = `{"plans":"docs/plans","specs":"docs/specs","reviews":"docs/reviews","agents":".pi/agents"}`
  - Artifact homes (plans/specs/reviews/agents). Alternatives: any repo-relative paths; references route artifacts here.
- **`tracker`** = `{"repo":"threadsafe-systems/pi-sdlc","board":{"number":5,"url":"https://github.com/orgs/threadsafe-systems/projects/5"}}`
  - GitHub tracker repo + board for map/epic modes. Alternatives: omit to disable tracker-backed modes.
- **`hooks`** = `{"implement":{"before":[{"use":"tool:worktree_session","do":"Create AND enter a worktree for the feature branch so the session's working root moves into it (create-then-enter); target all subsequent writes there."}]}}`
  - Local before/after workflow hooks per phase. Alternatives: omit, or declare run/use items (see system-reference Hooks).
- **`review`** = `{"brainstorm":"human","design":"panel","code":"panel","tasks":"subagent","panelSize":2,"onShortfall":"fail"}`
  - The six review dials (brainstorm/design/code/tasks/panelSize/onShortfall). An override under `overrides.<track>.review` changes the effective result per track.
- **`shape`** = `{"separateSpec":true,"publishToTracker":2,"defaultTrack":"irreversible"}`
  - separateSpec / publishToTracker / defaultTrack. Alternatives per schema; publishToTracker may be an integer or "never".
- **`overrides`** = `{"reversible":{"review":{"design":"human"}}}`
  - Per-track (irreversible/reversible) dial overrides. Alternatives: omit, or override review dials for one track.
- **`panels`** = ``{"$comment":"Panel roster for this repo. resolve-panel reconciles this preference order against live credentials, applies the per-phase floor, and excludes the authoring model. Entries may carry pi's ':<thinking>' suffix (off/minimal/low/medium/high/xhigh/max). panelSize is a distinct-model floor measured on model identity rather than vendor: modelIdentity() folds a Bedrock alias onto its direct vendor/model, so two routes to one model count once toward the floor. Order is strongest-reasoning-first; later entries are fallbacks reached only when an earlier one lacks credentials or fails at dispatch. plan_review and spec_review gate design decisions that are expensive to reverse, so they run at xhigh. A pair such as anthropic/claude-opus-5 followed immediately by amazon-bedrock/eu.anthropic.claude-opus-5 is a provider-route twin, not a duplicate: the Bedrock entry contributes no distinct-model slot and is skipped whenever the direct entry is selected, but it is the pool's only same-model different-route option and is what dispatch recovery reaches for when the direct route fails provider-side. Where the direct route has no credentials the twin is selected on its own merits as an ordinary panelist. Deleting either half as a duplicate removes that option. anthropic/claude-fable-5-1 has no twin available: Bedrock publishes fable-5-1 inference profiles, but this account's role is not permitted to invoke them. Model ids drift, so re-check with `pi --list-models` — and note that catalogue presence alone proves neither that the caller may invoke a model nor that it can be dispatched as a subagent child, which are the two properties this roster actually depends on.","authorDefault":"anthropic/claude-fable-5-1:high","phases":{"plan_review":{"panelSize":2,"prefer":["anthropic/claude-fable-5-1:xhigh","google-vertex/gemini-3.1-pro-preview:xhigh","openai-codex/gpt-5.6-luna:xhigh","zai/glm-5.3:xhigh","zai/glm-5.3-flash:xhigh","anthropic/claude-opus-5:xhigh"]},"spec_review":{"panelSize":2,"prefer":["anthropic/claude-fable-5-1:xhigh","google-vertex/gemini-3.1-pro-preview:xhigh","openai-codex/gpt-5.6-luna:xhigh","zai/glm-5.3:xhigh","zai/glm-5.3-flash:xhigh","anthropic/claude-opus-5:xhigh"]},"pr_review":{"panelSize":3,"prefer":["anthropic/claude-fable-5-1:xhigh","openai-codex/gpt-5.6-sol:xhigh","openai-codex/gpt-5.6-luna:xhigh","anthropic/claude-opus-5:xhigh","amazon-bedrock/eu.anthropic.claude-opus-5:xhigh","zai/glm-5.3:xhigh","zai/glm-5.3-flash:xhigh","google-vertex/gemini-3.1-pro-preview:xhigh","moonshotai/kimi-k3:xhigh"]},"task_validate":{"panelSize":1,"prefer":["anthropic/claude-haiku-4-5-20251001","amazon-bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0","zai/glm-5.3-flash","zai/glm-5.3:low"]}}}``
  - The panel roster (authorDefault + per-phase prefer/panelSize). Resolved live against credentials by resolve-panel.

## Fingerprint & generator format

- generator format: `v2`
- fingerprint: `121fa933519c34d8563998743f837bf3be1e76748f90d59016bce60280a6646e`
- The fingerprint is `sha256(version + NUL + canonicalJson(config))`; it changes
  when any config value changes or the render format is bumped. The check also
  compares the full body byte-for-byte, so hand edits are detected as stale.

## Regenerate & check

```bash
config-doc.sh write   # regenerate this file from sdlc.config.json
config-doc.sh check   # report current | missing | stale | error
```

See `references/system-reference.md` for the full public system map.
