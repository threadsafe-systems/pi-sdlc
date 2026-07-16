# ADR 0021: merged versioned configuration and release guard

- Status: accepted
- Date: 2026-07-16
- Supersedes: ADR 0001 and ADR 0002
- Amends: ADR 0012

## Context

Configuration and panel-roster data were split across two consumer files with
different versioning treatment. That split could not describe or detect a
coordinated shape migration, and Conventional-Commit release automation did not
mechanically ensure that a config-schema break rode a package major.

## Decision

Use `.pi/sdlc/sdlc.config.json` as the single consumer surface for configuration
and the `panels` roster. Its schema governs shape and data types only. The
integer `schemaVersion` has its own clock, independent of package semver; roster
values and model identifiers never cause a schema bump. The two-file fold is
the forwards-only schemaVersion 1 to 2 migration.

A config-schema shape break must ride a package major. CI watches the named
config schema files and the `CONFIG_SCHEMA_VERSION` line and requires the
release-visible PR title or body to carry a Conventional-Commit breaking signal.
Inner branch commits do not satisfy that squash-release signal.

## Consequences

- Consumers migrate or pin; ordinary readers never mutate old configuration.
- Config shape and package semver remain separate axes even though release
  policy requires shape breaks to ship in majors.
- The former standalone roster schema and consumer file are retired.
- Unwatched schemas retain their independent version contracts.
