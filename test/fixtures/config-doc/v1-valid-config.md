<!-- pi-sdlc:config-doc v1 fingerprint=47b61fe4fedb58813e24f74942d39f9a1b3bbf119c81d44ecf5f1abce6f79c82 -->

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
- **`prefix`** = `"demo"`
  - Issue/branch prefix for this project. Alternatives: any prefix matching the schema pattern.
- **`labelPrefix`** = `"demo"`
  - Tracker label family prefix. Alternatives: any prefix matching the schema pattern.
- **`announce`** = `"Using the sdlc skill."`
  - The startup announcement string. Alternatives: any non-empty string.
- **`paths`** = `{"plans":"docs/plans","specs":"docs/specs","reviews":"docs/reviews","agents":".pi/agents"}`
  - Artifact homes (plans/specs/reviews/agents). Alternatives: any repo-relative paths; references route artifacts here.
- **`review`** = `{"brainstorm":"human","design":"panel","code":"panel","tasks":"subagent","panelSize":2,"onShortfall":"fail"}`
  - The six review dials (brainstorm/design/code/tasks/panelSize/onShortfall). An override under `overrides.<track>.review` changes the effective result per track.
- **`shape`** = `{"separateSpec":true,"publishToTracker":2,"defaultTrack":"irreversible"}`
  - separateSpec / publishToTracker / defaultTrack. Alternatives per schema; publishToTracker may be an integer or "never".
- **`overrides`** = `{"reversible":{"review":{"design":"human"}}}`
  - Per-track (irreversible/reversible) dial overrides. Alternatives: omit, or override review dials for one track.
- **`panels`** = `{"authorDefault":"anthropic/claude-opus-4-8:high","phases":{"plan_review":{"panelSize":2,"prefer":["zai/glm-5.2:high","deepseek/deepseek-v4-pro:high"]},"spec_review":{"panelSize":2,"prefer":["zai/glm-5.2:high","deepseek/deepseek-v4-pro:high"]},"pr_review":{"panelSize":3,"prefer":["zai/glm-5.2:high","deepseek/deepseek-v4-pro:high"]},"task_validate":{"panelSize":1,"prefer":["deepseek/deepseek-v4-flash"]}}}`
  - The panel roster (authorDefault + per-phase prefer/panelSize). Resolved live against credentials by resolve-panel.

## Fingerprint & generator format

- generator format: `v1`
- fingerprint: `47b61fe4fedb58813e24f74942d39f9a1b3bbf119c81d44ecf5f1abce6f79c82`
- The fingerprint is `sha256(version + NUL + canonicalJson(config))`; it changes
  when any config value changes or the render format is bumped. The check also
  compares the full body byte-for-byte, so hand edits are detected as stale.

## Regenerate & check

```bash
config-doc.sh write   # regenerate this file from sdlc.config.json
config-doc.sh check   # report current | missing | stale | error
```

See `references/system-reference.md` for the full public system map.
