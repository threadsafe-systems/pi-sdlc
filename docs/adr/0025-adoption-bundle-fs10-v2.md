# ADR 0025: FS10 schema version 2 uses the merged config surface

- Status: accepted
- Date: 2026-07-16
- Amends: ADR 0018

## Context

FS10 schema version 1 exposed a standalone models asset and `--with-models`,
which conflict with the merged schemaVersion-2 consumer surface. Setup is also
the only safe place to confirm and apply a forwards migration.

## Decision

FS10 schema version 2 writes one `.pi/sdlc/sdlc.config.json`, including seeded
`panels` when requested. Fresh setup defaults to `enforcement: preference`;
strict is an explicit choice. `--with-models` is retired as a usage error and
`--seed-panels` is the replacement. When setup detects schemaVersion 1, an
interactive no-mutation-flags run may confirm the atomic fold; non-interactive
runs and declines halt with the migration-or-pin remedy. Existing-adopter
profile application remains deferred.

This file-surface revision lands before and composes with OL-B's separate FS10
report-nudge revision. It does not implement that nudge, evidence/checker work,
or profile application.

## Consequences

- Setup is the sole confirmation and migration writer; other readers remain
  detection-only.
- The report envelope and asset vocabulary are schema version 2.
- Consumers use the merged file and no longer provision a separate roster.
