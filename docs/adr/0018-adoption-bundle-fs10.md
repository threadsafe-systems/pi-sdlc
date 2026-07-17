# ADR 0018: FS10 — setup adoption-bundle report surface

- Amended by: [ADR 0025](0025-adoption-bundle-fs10-v2.md)

- Context: `setup-sdlc` previously wrote only configuration (+ optional models)
  and hard-failed when configuration already existed. The skill's PR contract
  names a template and lifecycle integration that were not provisioned. A
  complete bundle needs deterministic, non-destructive provisioning and a
  machine-readable result.
- Decision: FS10 schema version 1 freezes the bundle asset actions and report:
  `created`, `retained`, `upgraded`, or `refused`; text begins with `root:` and
  `exit-code:`, followed by reference and asset lines; JSON contains
  `schemaVersion`, `root`, `exitCode`, `references`, and `assets`, with an
  `error` field for operational exit 2. Exits are 0 when all processed assets
  succeed, 1 for refused assets or interview decline, and 2 for operational
  errors. Package references are resolved before the first write. Existing
  consumer-authored assets are recognised structurally or refused with
  instructions; they are never merged or overwritten, and `--force` applies
  only to configuration replacement.
- Compatibility: In bundle mode, an existing configuration with mutating
  flags and no `--force` reports `config: refused`, exits 1, and continues
  independent asset processing. A no-intent re-run retains configuration;
  `--force` reports `upgraded`. This deliberately replaces the old
  exit-2-abort behavior while preserving the no-overwrite guarantee. Existing
  hook trust warnings remain on stderr in text mode and are embedded in the
  config report message in JSON mode.
- Consequences:
  - Setup can be safely re-run to upgrade existing consumers without silently
    replacing their files.
  - Prompt copies are consumer-owned overrides and may become stale; refresh
    is an explicit delete-and-re-copy action.
  - FS10 evolves only through an explicit schema-version bump and migration.
    FS8 readiness/status remains unchanged in this child.
- Supersedes: none (new bundle surface; the existing-config behavior change is
  recorded above).
