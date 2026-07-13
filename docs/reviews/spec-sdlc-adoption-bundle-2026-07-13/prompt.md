# Shared panel prompt — spec_review, sdlc-adoption-bundle, 2026-07-13

Agent: `.pi/agents/pi-sdlc-spec-review.md` (stamped from
`skills/sdlc/prompts/adversary-spec.prompt.md` via `ensure-panel-agent.sh`).
Author vendor excluded: anthropic. Panel resolved by
`resolve-panel.sh spec_review --author anthropic`.

Task text given to every reviewer (round 1):

> Review the Specification at docs/specs/2026-07-13-sdlc-adoption-bundle.md
> in /home/neil/code/threadsafe/pi-sdlc (read-only). Baseline commit 65d2a55;
> the spec and its governing plan are uncommitted working-tree gate
> artifacts. Upstream artifacts it must be consistent with: the approved plan
> docs/plans/2026-07-13-sdlc-adoption-bundle.md (rev 3; read its panel record
> docs/reviews/plan-sdlc-adoption-bundle-2026-07-13/consolidated.md for the
> adjudicated constraints, especially F1 track:none ratification, F3
> pinned-checkout acquisition, F8 event-payload extraction), the parent
> stream plan docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md, and
> the programme plan docs/plans/2026-07-12-sdlc-lifecycle-hardening.md.
> Ground every claim in the CODE: skills/sdlc/SKILL.md,
> skills/sdlc/scripts/{setup-sdlc.mjs,sdlc-status.mjs,lib.mjs,
> ensure-panel-agent.mjs,validate-task.mjs},
> skills/sdlc/prompts/adversary-review.prompt.md, skills/sdlc/schema/,
> test/{setup-sdlc.test.js,sdlc-status.test.js,readiness-output.test.js},
> docs/adr/0005|0011|0013|0014|0015|0016, .github/workflows/ci.yml,
> package.json — cite file:line for framework claims. Focus: (1) contract
> completeness/precision — are FS9 grammar, checker CLI/checks/envelope,
> FS10 asset actions/report/exits, structural-acceptance boundaries, and the
> CI-absence probe pinned tightly enough to implement without invention, and
> internally consistent; (2) falsifiability — do scenarios AB1-AB17 have
> real pass AND fail conditions, are any outcomes unfalsifiable or any
> scenario unable to fail; (3) fidelity — does the spec deliver every plan
> R1-R6 requirement and DoD item without adding scope (no FS8 changes, no
> sub-3/4 trespass) and without contradicting locked decisions (ADR
> 0014/0015/0016, stream locked decisions); (4) implementability against
> real code — e.g. does the proposed setup-sdlc compatibility change
> conflict with pinned tests, is the HEAD ls-tree artifact matching sound in
> worktrees/subdirectory-prefix cases per sdlc-status.mjs precedent, is the
> event-payload approach sound. Return ranked findings (high/medium/low),
> each with file:line evidence and a concrete fix; state explicit CLEARs
> where an area is sound.
