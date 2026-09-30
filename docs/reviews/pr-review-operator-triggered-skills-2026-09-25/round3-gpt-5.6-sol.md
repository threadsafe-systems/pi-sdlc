### Accepted-risk text still contradicts the `root.resolve` definition

- severity: low
- confidence: high
- origin: REOPENED(PR-R2-01)
- file: docs/adr/0030-operator-triggered-skills.md
- line: 25-27
- problem: The newly added consequence at lines 43-46 correctly records that `root.resolve` can fail inside an adopted repository, but the Decision still says it fails “only” when no git repository encloses the working directory.
- repro_or_impact: The ADR now gives mutually exclusive definitions of the same check, obscuring the owner-accepted two-fault risk even though the selected carve-out itself remains unchanged.

### S06 fix leaves the governing assumption stale

- severity: low
- confidence: high
- origin: REOPENED(PR-R2-04)
- file: docs/plans/2026-09-24-operator-triggered-skills-build.md
- line: 97-101
- problem: A5 says S06 “is re-anchored,” but this delta changes S06 to `replaced` in `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md:38`. The named PR-body assumption repeats the stale claim.
- repro_or_impact: Readers auditing the disposition receive two incompatible accounts of whether the baseline rule was retained or replaced.