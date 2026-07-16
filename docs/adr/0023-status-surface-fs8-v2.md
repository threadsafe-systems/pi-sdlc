# ADR 0023: FS8 schema version 2 reports config-schema drift

- Status: accepted
- Date: 2026-07-16
- Amends: ADR 0015 and ADR 0016

## Context

FS8 schema version 1 assumed separate config and roster files and could not
represent a known older configuration separately from malformed or newer input.
A migrated one-file consumer therefore could not reach `ready` honestly.

## Decision

FS8 schema version 2 retains the four states and exit mapping: 0 `ready`, 1
`not-adopted`, 2 `error`, and 3 `not-ready`. Its canonical checks replace the
three `models.*` checks with additive `config.schema-current` and
`config.panels` checks. Roster validity is part of `config.valid`; manifest HEAD
and cleanliness checks cover the merged file.

A recognised older schema passes deferred `config.valid`, fails
`config.schema-current`, and produces `not-ready`/exit 3 with the canonical
migration-or-pin remedy while independent checks still run. A newer schema is
`error`/exit 2. A current config without `panels` is `not-ready`/exit 3.

## Consequences

- Known behind-drift is remediable readiness work, not a malformed-config error.
- Ahead-drift remains an operational incompatibility.
- Existing state names and exit codes remain stable; the report envelope moves
  to schema version 2 and consumers must migrate their check-id expectations.
