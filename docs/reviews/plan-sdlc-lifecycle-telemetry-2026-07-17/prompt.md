# Shared panel prompt — plan review, sdlc-lifecycle-telemetry (round 1)

Reviewer prompt: the stamped project agent `.pi/agents/pi-sdlc-plan-review.md`
(source of truth: `skills/sdlc/prompts/adversary-plan.prompt.md`; stamped via
`skills/sdlc/scripts/ensure-panel-agent.sh plan_review`).

Panel resolution: `skills/sdlc/scripts/resolve-panel.sh plan_review --author
anthropic --emit-tasks pi-sdlc-plan-review` → `openai-codex/gpt-5.6-sol:high`,
`zai/glm-5.2:high`, `deepseek/deepseek-v4-pro:high` (3 vendors;
`anthropic/claude-opus-4-8:high` dropped as author vendor).

Shared task block given to every reviewer:

```
Review the PLAN artifact for the feature 'sdlc-lifecycle-telemetry'.

Artifact under review: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-lifecycle-telemetry/docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md
Repo root (feature branch checkout): /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-lifecycle-telemetry
Branch: feat/sdlc-lifecycle-telemetry, commit 027a0a5.

Upstream context the plan must be consistent with:
- The governing lifecycle skill: skills/sdlc/SKILL.md (phases, gates, panels, house patterns).
- Brainstorm decisions are recorded verbatim in the plan's 'Constraints and locked decisions' section (approved by the human owner 2026-07-17); treat them as ratified inputs, not findings.
- Existing frozen surfaces: docs/adr/ (FS1-FS12; ADRs 0014-0020), skills/sdlc/scripts/ (house CLI patterns), skills/sdlc/schema/.
- Prior review-artifact conventions: docs/reviews/<phase>-<feat>-<date>/.

Grounding rule: cite file:line for any claim about the existing framework/codebase. Do not review visual styling choices (explicitly implementation freedom). Findings must be severity-rated (high/medium/low) with falsifiable rationale.
```
