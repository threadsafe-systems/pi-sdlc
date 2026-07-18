# Spec review — zai/glm-5.2:high

- Artifact: `docs/specs/2026-07-18-sdlc-agent-self-documentation.md` rev 1
- Commit: d528b97 (main)
- Verdict: 3 medium, 1 low; CLEAR on A/D/F/G.

All framework claims verified against the pinned code (`sdlc-status.mjs`,
`check-references.mjs`, `lib.mjs`, `setup-sdlc.mjs`, schema, inventory) and pi's
`docs/skills.md`.

## Findings

### Frozen FS11 discovery set is not satisfiable against the current inventory

- severity: medium; confidence: high
- location: §16 (frozen discovery set + closed exclusion list; coverage additions)
- The frozen roots `skills/sdlc/scripts/*.sh` and `skills/sdlc/schema/*.json`
  minus the exclusion list discover existing files with no inventory row and not
  in the coverage additions: `check-lifecycle.sh`, `setup-sdlc.sh`,
  `sdlc.config.schema.json`, `sdlc.config.example.json`. `check-references.mjs`
  walking this set fails the baseline, so ASD14/ASD15/ASD18 cannot pass and the
  non-vacuity mutation is ambiguous.
- fix: enumerate those four as classified rows, or extend the exclusion list, and
  state the frozen set is satisfiable against the pre-change inventory.

### §9 adoption predicate "exit ≠ 1" misstates FS8

- severity: medium; confidence: high
- location: §9 (adopted-config-dominates)
- `sdlc-status.mjs:299-303` aggregates `error`→exit 2 first; exit ≠ 1 is not
  equivalent to "adopted"/"committed HEAD has the manifest". An errored repo
  (e.g. `git.repository` failure skipping `adoption.manifest-head`) would be
  classified adopted-and-strict with no readable config, contradicting
  `SKILL.md`'s "error ⇒ stop".
- fix: adopted iff `adoption.manifest-head` passes (state ∈ {ready, not-ready});
  treat exit 2 as stop.

### ASD12 "match the frozen #38 text" is non-falsifiable

- severity: medium; confidence: medium
- location: §9 stamp + ASD12
- #38's resolution lives only on GitHub (no repo capture); the stamp string is
  introduced with "e.g.", so no canonical string is verifiable.
- fix: pin the exact stamp string in the spec, or restate ASD12 structurally
  (single plain-prose line, no YAML/JSON, required disclosure phrases).

### ASD20 merge assertion is unconditional but depends on landing order

- severity: low; confidence: medium
- location: §18 + ASD20
- No `record-run-event`/telemetry references exist in `setup-sdlc.mjs` yet; the
  unconditional both-coexist assertion is undefined if this stream lands first.
- fix: make ASD20 landing-order conditional.

## CLEAR

- A (frozen shapes complete), D (no contradiction with plan/locked decisions;
  committed-HEAD reconciliation matches SKILL.md; no FS8/FS9/schemaVersion-3
  change claimed or violated), F (NFRs each tied to a falsifiable scenario),
  G (honest trust model). E covered by finding 2; B/C by findings 1/3/4.

Residual (non-defect): the ≤220-line/16 KiB ceiling vs the current
551-line/32223-byte file is a >60% reduction — aggressive but falsifiable; the
`phase-tasks.md` filename vs internal "build" phase name is a deliberate #38
asymmetry the references must explain.
