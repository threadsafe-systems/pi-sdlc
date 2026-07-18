# Spec handover: pi-sdlc agent self-documentation

- Plan gate: **approved**, 2026-07-18.
- Track: **irreversible**.
- Canonical Plan: `docs/plans/2026-07-18-sdlc-agent-self-documentation.md`
  rev 2.
- Plan panel:
  `docs/reviews/plan-review-sdlc-agent-self-documentation-2026-07-18/`.
- This brief is navigation only; the approved Plan is authoritative.

## Decisions to carry forward

- Fully absorb IC-B and OL-C, including the setup interview, six shared named
  phase entrypoints, and adopted-config-dominates. The entrypoints are not six
  independently discovered skills; that question remains #101.
- Keep `sdlc.config.json` authoritative. Generate committed `CONFIG.md` with an
  effective-behaviour summary plus JSON-order key reference.
- Check `CONFIG.md` non-blockingly after readiness. Current output is read;
  missing/stale/error output warns and falls back to validated JSON. FS8/FS9 do
  not change.
- Recognize generated output through a package-owned, versioned sentinel.
  Unsupported or absent sentinels are consumer collisions and cannot be silently
  overwritten.
- Make `SKILL.md` the kernel/router, capped at 220 lines and 16 KiB. Put
  invariant phase law in six package-relative references and
  configuration-dependent behaviour in current `CONFIG.md`/JSON.
- Extend FS11 with public-surface classification plus mechanical discovery so a
  missing inventory row is detectable.
- Preserve both setup integration changes when rebasing with lifecycle
  telemetry: configuration-document generation and telemetry event calls.

## Specification shape

Write one Specification with three explicit contract groups:

1. package law, references, routing, disposition audit, and #38 entrypoints;
2. setup interview plus deterministic render/write/check and collision
   contracts;
3. startup fallback, FS11 discovery, installed-consumer fixtures, and
   integration.

Freeze stable scenarios for every Definition-of-Done row, including non-vacuity
mutations and explicit non-changes to config schemaVersion 3, readiness,
lifecycle checking, ceremony, and the deferred #91/#101/#102 scopes.

## Grounding order

1. Approved Plan and consolidated Plan review.
2. `docs/plans/2026-07-17-config-intent-vocabulary.md` for IC-B.
3. `docs/plans/2026-07-14-opt-in-lifecycle.md` and issue #38 for OL-C.
4. Current `skills/sdlc/SKILL.md` and FS11 inventory/checker.
5. Pi's installed `docs/skills.md` progressive-disclosure contract.

Do not re-open YAML, phase-skill decomposition, model preferences, or readiness
blocking during Specification. Exact filenames, command names, exits, envelopes,
sentinel grammar, discovery patterns, and scenario IDs are now the Spec author's
decisions within the approved constraints.
