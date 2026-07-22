<!-- pi-sdlc:config-doc v1 fingerprint=cb3db0dbcf269d3782afd64a05fee1987c881daaed662d54bc37cd9220c3b818 -->

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
- **Design gate — validate (`review.design.validate`): panel** — an adversarial multi-model panel runs before the artifact is presented.
- **Design gate — approve (`review.design.approve`): human** — a human owner adjudicates and advances.
- **Code/PR gate — validate (`review.code.validate`): panel** — an adversarial multi-model panel runs before the artifact is presented.
- **Code/PR gate — approve (`review.code.approve`): human** — a human owner adjudicates and advances.
- **Brainstorm gate (`review.brainstorm`): human**.
- **Task validation (`review.tasks`): subagent** — each task ends with a validator subagent running the deterministic runner.
- **Panel floor (`review.panelSize`): 2** distinct model(s); shortfall posture `review.onShortfall`: fail.
- **Separate Specification (`shape.separateSpec`): true** — Plan and Spec are distinct gated artifacts.

### Track: reversible

- **Phases:** brainstorm, plan, build, implement, PR.
- **Design gate — validate (`review.design.validate`): skip** — no panel runs for this gate (an authored choice, not a bypass) (reversible: no pre-PR design panel unless configured; the PR panel still runs).
- **Design gate — approve (`review.design.approve`): human** — a human owner adjudicates and advances.
- **Code/PR gate — validate (`review.code.validate`): panel** — an adversarial multi-model panel runs before the artifact is presented.
- **Code/PR gate — approve (`review.code.approve`): human** — a human owner adjudicates and advances.
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

- **`schemaVersion`** = `4`
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
- **`review`** = `{"brainstorm":"human","design":{"validate":"panel","approve":"human"},"code":{"validate":"panel","approve":"human"},"tasks":"subagent","panelSize":2,"onShortfall":"fail"}`
  - The six review dials (brainstorm/design/code/tasks/panelSize/onShortfall). An override under `overrides.<track>.review` changes the effective result per track.
- **`shape`** = `{"separateSpec":true,"publishToTracker":2,"defaultTrack":"irreversible"}`
  - separateSpec / publishToTracker / defaultTrack. Alternatives per schema; publishToTracker may be an integer or "never".
- **`overrides`** = `{"reversible":{"review":{"design":{"validate":"skip"}}}}`
  - Per-track (irreversible/reversible) dial overrides. Alternatives: omit, or override review dials for one track.
- **`panels`** = `{"$comment":"Panel roster for pi-sdlc itself, redesigned 2026-07-21 grounded in vals.ai SWE-bench-Verified and LM Council's HLE/GPQA-Diamond/FrontierMath/Terminal-Bench aggregates (see docs/briefs/2026-07-21-retro-informed-orchestration-and-ceremony-candidates.md and docs/briefs/2026-07-21-panel-roster-redesign.md for full rationale + citations). Preference reconciled against live credentials by resolve-panel; model ids drift, re-check with `pi --list-models`. Entries may carry pi's ':<thinking>' suffix (off/minimal/low/medium/high/xhigh/max). panelSize is the per-phase distinct-model floor (model-identity axis, verified exact-identity not vendor-wide in resolve-panel.mjs's modelIdentity()). plan_review/spec_review run rarely per effort and gate irreversible design tradeoffs, so cost is a rounding error against a bad architecture call: bumped to xhigh and re-led with the models that top HLE/GPQA-Diamond/FrontierMath (Fable 5, Gemini 3.1 Pro Preview), not just SWE-bench. pr_review is explicitly the highly-technical/high-reasoning gate (owner direction, 2026-07-21): bumped to xhigh throughout; kimi-k3 stays in the roster (genuinely top-tier on SWE-bench-Verified, 93.4%) but demoted to last preference after this repo's own retro evidence of two hard 1,200,000ms timeouts in a single Case PR-review run (docs/briefs/2026-07-21-retro-informed-orchestration-and-ceremony-candidates.md); gemini-3.1-pro-preview is likewise demoted, not dropped, pending its known API-credit/429 availability issue. task_validate drops gpt-5.6-terra (owner-reported operational trouble; it also ranks well down the SWE-bench-Verified table, consistent with that report) and leads with haiku-4-5, matching what Case's config already does. authorDefault moves off claude-opus-4-8 to claude-fable-5 (95.0% SWE-bench-Verified + FrontierMath Tier-4 leader vs opus-4-8's 88.6%/56.1%) as the best available single all-rounder until per-phase author preferences ship (see C1, same brief); a side effect verified against modelIdentity()'s exact-model (not vendor-wide) exclusion: the amazon-bedrock/global.anthropic.claude-opus-4-8 pr_review fallback, dead weight while authorDefault==opus-4-8, becomes a live distinct reviewer once the author identity moves to fable-5. Qwen (current Bedrock-hosted Qwen3-235B/Qwen3-Coder-480B) was evaluated and NOT added: it sits clearly behind every roster model on SWE-bench-Verified and WebDev Arena, and the newer, more competitive Qwen 3.6/3.7 line isn't available through any configured provider yet — worth re-checking once it is.","authorDefault":"anthropic/claude-fable-5:high","phases":{"plan_review":{"panelSize":2,"prefer":["anthropic/claude-fable-5:xhigh","google/gemini-3.1-pro-preview:xhigh","openai-codex/gpt-5.6-luna:xhigh","zai/glm-5.2:xhigh","deepseek/deepseek-v4-pro:xhigh","anthropic/claude-opus-4-8:xhigh"]},"spec_review":{"panelSize":2,"prefer":["anthropic/claude-fable-5:xhigh","google/gemini-3.1-pro-preview:xhigh","openai-codex/gpt-5.6-luna:xhigh","zai/glm-5.2:xhigh","deepseek/deepseek-v4-pro:xhigh","anthropic/claude-opus-4-8:xhigh"]},"pr_review":{"panelSize":3,"prefer":["anthropic/claude-fable-5:xhigh","openai-codex/gpt-5.6-sol:xhigh","openai-codex/gpt-5.6-luna:xhigh","amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh","deepseek/deepseek-v4-pro:xhigh","zai/glm-5.2:xhigh","google/gemini-3.1-pro-preview:xhigh","moonshotai/kimi-k3:xhigh"]},"task_validate":{"panelSize":1,"prefer":["anthropic/claude-haiku-4-5","deepseek/deepseek-v4-flash","zai/glm-5.2:low"]}}}`
  - The panel roster (authorDefault + per-phase prefer/panelSize). Resolved live against credentials by resolve-panel.

## Fingerprint & generator format

- generator format: `v1`
- fingerprint: `cb3db0dbcf269d3782afd64a05fee1987c881daaed662d54bc37cd9220c3b818`
- The fingerprint is `sha256(version + NUL + canonicalJson(config))`; it changes
  when any config value changes or the render format is bumped. The check also
  compares the full body byte-for-byte, so hand edits are detected as stale.

## Regenerate & check

```bash
config-doc.sh write   # regenerate this file from sdlc.config.json
config-doc.sh check   # report current | missing | stale | error
```

See `references/system-reference.md` for the full public system map.
