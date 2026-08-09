# Plan review prompt — spike exit rule, round 1

Review the S4 spike-exit-rule Plan as a read-only adversarial plan reviewer.

- Repo: `/home/neil/code/threadsafe/pi-sdlc`
- Commit: `fa6ef9e`
- Target: `docs/plans/2026-08-09-spike-exit-rule.md`
- Logical wave: 1, whole-artifact review

Required context:

1. Read the target top to bottom.
2. Read `skills/sdlc/references/phase-brainstorm.md` §8.
3. Read `docs/briefs/2026-07-26-design-phase-r1-brainstorm.md` R1-G6.
4. Read `docs/briefs/2026-07-26-design-phase-r5-synthesis.md` S4.
5. Read `test/gate-presentation-contract.test.js`.
6. Read `.pi/sdlc/workflow.md`.

Treat every Brainstorm provenance decision and rejection in the Plan as
owner-ratified and locked. Judge against the existing two-artifact gate contract
and six-phase topology.

Additional attack surface — PROPORTIONALITY: verify every proposed CI or gate
check has a plausible time/cost budget and flag disproportionate machinery.

Do not edit, commit, or push. Return only the stamped plan-review findings
format, including CLEAR lines for clean attack surfaces.
