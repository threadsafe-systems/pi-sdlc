# Plan review prompt

Review the irreversible-track Plan at
`docs/plans/2026-07-18-sdlc-agent-self-documentation.md` in
`/home/neil/code/threadsafe/pi-sdlc` at commit
`d528b9799ed38f8c03708cbd27047543932017d3`. The Plan itself is the current
uncommitted artifact.

Upstream and governing inputs:

- `skills/sdlc/SKILL.md`
- `README.md`
- `docs/plans/2026-07-17-config-intent-vocabulary.md` (especially IC-B)
- `docs/plans/2026-07-14-opt-in-lifecycle.md` (especially OL-C)
- `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- `skills/sdlc/assets/normative-references.json`
- pi's installed skills documentation at
  `/home/neil/.nvm/versions/node/v25.6.1/lib/node_modules/`
  `@earendil-works/pi-coding-agent/docs/skills.md`

The approved brainstorm direction is recorded in the Plan header and Objective:
both package-level agent references and generated consumer `CONFIG.md`; JSON
remains authoritative; `CONFIG.md` freshness is non-blocking with JSON fallback;
public agent-facing surfaces are exhaustive while internal helpers are not; this
stream absorbs IC-B and OL-C; #101/#102/#91 remain deferred/independent.

Ground every framework/repository claim in `file:line` evidence. Review plan
quality, consistency, completeness, feasibility, scope discipline, authority
seams, compatibility, and whether it is decision-ready for Specification.

Return findings only, each with severity high/medium/low, evidence, consequence,
and concrete correction. If there are no findings, say `no findings`.
