<!-- pi-sdlc:config-doc v1 fingerprint=c4c956f1cbd562c96fc26fbafdc624178f3562ce0f4311b16199c676233f9865 -->

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
- **`panels`** = `{"$comment":"Panel roster for pi-sdlc itself. Preference reconciled against live credentials by resolve-panel; model ids drift, re-check with `pi --list-models`. Entries may carry pi's ':<thinking>' suffix (off/minimal/low/medium/high/xhigh/max). panelSize is the per-phase distinct-model floor (model-identity axis). See docs/plans/2026-07-11-model-thinking-levels.md for the reasoning levels.","authorDefault":"anthropic/claude-opus-4-8:high","phases":{"plan_review":{"panelSize":2,"prefer":["openai-codex/gpt-5.6-sol:high","zai/glm-5.2:high","anthropic/claude-opus-4-8:high","deepseek/deepseek-v4-pro:high"]},"spec_review":{"panelSize":2,"prefer":["anthropic/claude-opus-4-8:high","openai-codex/gpt-5.6-luna:high","zai/glm-5.2:high","deepseek/deepseek-v4-pro:high"]},"pr_review":{"panelSize":3,"prefer":["anthropic/claude-fable-5:high","openai-codex/gpt-5.6-sol:high","google/gemini-3.1-pro-preview:high","deepseek/deepseek-v4-pro:high"]},"task_validate":{"panelSize":1,"prefer":["openai-codex/gpt-5.6-terra","anthropic/claude-haiku-4-5","deepseek/deepseek-v4-flash","zai/glm-5.2:low"]}}}`
  - The panel roster (authorDefault + per-phase prefer/panelSize). Resolved live against credentials by resolve-panel.

## Fingerprint & generator format

- generator format: `v1`
- fingerprint: `c4c956f1cbd562c96fc26fbafdc624178f3562ce0f4311b16199c676233f9865`
- The fingerprint is `sha256(version + NUL + canonicalJson(config))`; it changes
  when any config value changes or the render format is bumped. The check also
  compares the full body byte-for-byte, so hand edits are detected as stale.

## Regenerate & check

```bash
config-doc.sh write   # regenerate this file from sdlc.config.json
config-doc.sh check   # report current | missing | stale | error
```

See `references/system-reference.md` for the full public system map.
