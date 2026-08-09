# Spec review prompt — spike exit rule, round 1

Owner-requested whole-artifact panel.

- Repo: `/home/neil/code/threadsafe/pi-sdlc`
- Commit: `ecd5c47`
- Target: `docs/specs/2026-08-09-spike-exit-rule.md`
- Requested roster: `maas-qwen/deepseek-v4-flash-0732:high`, `openai-codex/gpt-5.6-terra:high`

Required context:

1. Target Spec, top to bottom.
2. Approved Plan rev 4.
3. `skills/sdlc/references/spec-artifact-skeleton.md`.
4. `skills/sdlc/references/phase-brainstorm.md` §8.
5. `test/gate-presentation-contract.test.js`.
6. Gate-presentation Spec C1/C8.
7. `.pi/sdlc/workflow.md`.

Treat Plan provenance and rev 4 as owner-ratified and locked. Verify skeleton
blocks and binding rules, contract completeness, route precedence,
direction × treatment semantics, premise durability, scenario kinds and forms,
NFR bindings, SER14's carry destination, and the one-file anti-restatement seam.
PROPORTIONALITY is mandatory: every CI/release-gate scenario needs a plausible
time/cost budget and the Spec must remain at contract altitude. Ground framework
claims in `file:line` evidence. Read-only; do not edit, commit, or push. Return
only the stamped spec-review findings/CLEAR format.
