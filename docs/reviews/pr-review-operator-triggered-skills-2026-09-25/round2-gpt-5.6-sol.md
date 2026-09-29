### `root.resolve` can still fail open in an adopted repository

- severity: high
- confidence: high
- origin: REOPENED(OT-R1-01)
- file: skills/sdlc/SKILL.md
- line: 39-42
- problem: The carve-out assumes `root.resolve` proves no adopted repository exists, but `inspectRoot` catches every failed `git rev-parse` after checking only the working-tree manifest (`skills/sdlc/scripts/lib.mjs:64-91`). The fix-wave test covers only an adopted checkout whose manifest remains on disk (`test/operator-triggered-skills.test.js:98-104`).
- repro_or_impact: In a temporary Git repository, commit `.pi/sdlc/sdlc.config.json`, delete the working-tree file, and run status without an explicit root while Git is absent from `PATH`; it exits 2 with `root.resolve:error` even though `HEAD` is adopted. The startup rule then silently proceeds outside the lifecycle instead of stopping on the adopted-but-incomplete repository.

### S06 is still incorrectly recorded as retained

- severity: low
- confidence: high
- origin: REOPENED(OT-R1-08)
- file: docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
- line: 38
- problem: The newly rewritten S06 row says the baseline rule “Exit 2 error: stop” is retained, but the baseline stopped every exit 2 (`d528b979:skills/sdlc/SKILL.md:37-39`) while the current kernel exempts `root.resolve` (`skills/sdlc/SKILL.md:39-42`). That rule was partially replaced, not retained.
- repro_or_impact: The ledger’s test checks only that its anchor substring exists, so it passes despite the inaccurate disposition and gives auditors a false account of the policy change.

### Plan amendment cites review-round provenance

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 170-173
- problem: The rationale now attributes the `git.repository` decision to “PR panel round 1,” although the adjacent behavioral explanation is self-contained. This embeds review-process provenance rather than reader-now rationale.
- repro_or_impact: Review round numbering or artifact organization can change independently of this governing plan, leaving a stale provenance reference that maintainers must chase.