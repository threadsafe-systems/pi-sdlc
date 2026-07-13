# Shared panel prompt — plan_review, sdlc-adoption-bundle, 2026-07-13

Agent: `.pi/agents/pi-sdlc-plan-review.md` (stamped from
`skills/sdlc/prompts/adversary-plan.prompt.md` via `ensure-panel-agent.sh`).
Author vendor excluded: anthropic. Panel resolved by
`resolve-panel.sh plan_review --author anthropic`.

Task text given to every reviewer:

> Review the feature plan at docs/plans/2026-07-13-sdlc-adoption-bundle.md in
> /home/neil/code/threadsafe/pi-sdlc (read-only). Baseline: commit 65d2a55;
> the plan itself is an uncommitted working-tree gate artifact. Read it top to
> bottom. Required upstream context: the governing programme plan
> docs/plans/2026-07-12-sdlc-lifecycle-hardening.md and parent stream plan
> docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md (this child owns the
> remaining non-readiness A2 plus the track/PR portion of A3), plus the
> shipped sibling child docs/plans/2026-07-12-sdlc-adoption-readiness.md.
> Ground every framework claim against skills/sdlc/SKILL.md, README.md,
> docs/adr/ (especially 0015, 0016, 0005, 0011), skills/sdlc/scripts/
> (setup-sdlc.mjs, sdlc-status.mjs, ensure-panel-agent.mjs, lib.mjs),
> skills/sdlc/prompts/, skills/sdlc/schema/, .github/workflows/ci.yml, and
> the absence of .github/pull_request_template.md — cite file:line for any
> claim about the framework or code. Focus: (1) is this one coherent,
> correctly-scoped child (no trespass into sub-changes 3/4 or programme
> children 2/3/5, no readiness/FS8 reopening); (2) is the PR track-declaration
>
> + lifecycle-checker contract falsifiable and are the R1-R6 outcomes and DoD
> checkable; (3) are the recognise/refuse/instruct setup semantics, CI-offer
> condition, and existing-consumer upgrade path internally consistent with
> the stream's locked decisions; (4) any contradiction, gap, or risk the plan
> misses. Return ranked findings with severity (high/medium/low), each with
> file:line evidence and a concrete fix.
