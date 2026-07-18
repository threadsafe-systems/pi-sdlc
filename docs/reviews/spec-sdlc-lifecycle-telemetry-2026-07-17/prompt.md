# Shared panel prompt — spec review, sdlc-lifecycle-telemetry

Reviewer prompt: the stamped project agent `.pi/agents/pi-sdlc-spec-review.md`
(source of truth: `skills/sdlc/prompts/adversary-spec.prompt.md`; stamped via
`skills/sdlc/scripts/ensure-panel-agent.sh spec_review`).

Panel resolution: `skills/sdlc/scripts/resolve-panel.sh spec_review --author
anthropic --emit-tasks pi-sdlc-spec-review` → `openai-codex/gpt-5.6-luna:high`,
`zai/glm-5.2:high`, `deepseek/deepseek-v4-pro:high` (3 vendors;
`anthropic/claude-opus-4-8:high` dropped as author vendor).

Shared task block given to every reviewer (round 1 reviewed commit a57815a =
spec rev 1; round 2 reviews the rev 2 commit):

```
Review the SPECIFICATION artifact for the feature 'sdlc-lifecycle-telemetry'.

Artifact under review: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md
Repo root (feature branch checkout): /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-lifecycle-telemetry
Branch: feat/sdlc-lifecycle-telemetry.

Upstream artifacts it must be consistent with:
- Plan (rev 2, panel-reviewed, human-approved): docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md
- Plan panel adjudication: docs/reviews/plan-sdlc-lifecycle-telemetry-2026-07-17/consolidated.md
- Governing skill and frozen surfaces: skills/sdlc/SKILL.md, docs/adr/ (esp. ADR 0014 exits, 0017 FS9 read-only checker, 0019 FS11 inventory, 0020 FS12 skill-relative paths), skills/sdlc/scripts/ (lib.mjs, resolve-panel.mjs, ensure-panel-agent.mjs, validate-task.mjs, check-lifecycle.mjs), skills/sdlc/schema/, skills/sdlc/assets/normative-references.json, test/ conventions.

Ground every framework claim in the code: cite file:line. Check especially: (a) the spec's contracts are implementable against the actual frozen CLI surfaces without breaking them; (b) every scenario is falsifiable and offline; (c) the spec pins everything the plan's 'Context for the Specification author' demands; (d) internal consistency of the FS13 event vocabulary, run-store layout, collector seams, run.json schema sketch, and renderer contract. Do not review visual styling (implementation freedom). Findings severity-rated high/medium/low with falsifiable rationale.
```
