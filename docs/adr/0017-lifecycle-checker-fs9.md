# ADR 0017: FS9 — declared-track lifecycle checker surface

- Context: The two lifecycle tracks require different artifact sets, and a PR
  must make its claim explicit so local and CI checks can distinguish a
  reversible PR from an irreversible PR that omitted its Specification. The
  checker is a new consumer-facing CLI and its output must not drift.
- Decision: FS9 schema version 1 freezes the `sdlc` fenced declaration grammar:
  exactly one block; `track` is `irreversible`, `reversible`, or `none`;
  lifecycle tracks require a lowercase hyphenated `slug` (≤64); `none`
  requires a single-line `reason` (≤200). A valid declaration dominates the
  auto-generated `[bot]` exemption; an eligible bot without a valid
  declaration passes as `none` with a generated reason. `check-lifecycle.sh`
  and `.mjs` accept event, body, or direct flags sources, use exits 0 pass / 1
  contract failure / 2 operational error, and emit schema-versioned text or
  JSON reports with the frozen check ids and prerequisite/skip semantics in
  the approved Specification.
- Consequences:
  - The checker is read-only, offline, and canonical locally; CI is an
    integration that supplies the GitHub event payload.
  - Semantic honesty of a track or `none` exemption remains PR-panel prose
    law; the checker verifies declared-track artifact conformance.
  - Adding check ids, changing grammar, or changing envelope fields requires
    an explicit FS9 schema-version bump and migration. `sdlc-status` FS8 is
    unchanged.
- Supersedes: none (new surface).
