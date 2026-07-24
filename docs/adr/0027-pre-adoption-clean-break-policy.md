# ADR 0027: pre-adoption clean-break policy for config-schema changes

- Status: accepted
- Date: 2026-07-17
- Relates to: ADR 0021 (config schema clock + release guard), ADR 0026 (v3)

## Context

The schemaVersion 1→2 change shipped migration tooling (`migrate.mjs`, a fold
algorithm, refusal taxonomy). The 2→3 intent-vocabulary change (ADR 0026)
initially planned the same. But pi-sdlc has exactly one adopter — this
repository — and is expected to iterate on its shape before any external
adoption. A provably-honest migration for a population of one is ceremony with
no beneficiary, and the review effort spent proving its non-regression contract
was disproportionate.

## Decision

Until a first external adopter exists, config-schema shape breaks ship as a
**clean break** with no migration tooling:

- The sole adopter (this repo) hand-authors its config on the new schema in the
  same change that lands the break.
- Everyone else's escape hatch is the version pin (`__PI_SDLC_REF__` / a pinned
  `pi-sdlc` release keeps their config working on the release that wrote it).
- Breaks still ride package majors and the ADR 0021 release guard
  (`CONFIG_SCHEMA_VERSION` bump + a `BREAKING CHANGE:` footer — never the `!`
  shorthand, which the repo's angular-preset semantic-release does not parse).
- Version diagnostics stay honest (FS11): the schema-older remedy names only
  paths that exist — re-run setup or pin — and never promises a migration.

The 2→3 change accordingly deletes `migrate.mjs` and all setup migration
plumbing.

## Consequences

- Simpler, faster iteration while the framework is pre-adoption; the migration
  surface is not a standing maintenance cost.
- A stealth external adopter would hit the break; mitigated by the pin, the
  honest remedy text, and this policy being stated openly.
- **This policy expires at first external adoption.** From that point a
  schema break must ship a migration (or an equivalently honest forward path),
  and this ADR is superseded by whatever records that decision.

## Amendment (2026-07-24): "external adopter" excludes co-owned dogfood

A schema-shape clean break raises the same question for every repo that pins
pi-sdlc and carries its own committed config but is controlled by the same
owner — currently `threadsafe/case` and `threadsafe/pi-notion`. Does a
co-owned dogfood repo close the clean-break window described above?
Owner-adjudicated: it does not. **"External adopter" means a genuine third
party; it explicitly excludes co-owned dogfood repos** (repos the same owner
controls and can hand-author). The clean-break rationale ("a migration for a
population of one is ceremony with no beneficiary") still holds when the whole
adopter population is several co-owned repos, all hand-authorable.

Accordingly, a schema break affecting co-owned dogfood repos ships as a
**coordinated clean break with no migrator**: this repo hand-authors its
config in the landing change, and each co-owned dogfood repo re-authors its
config as a coordinated follow-up, pinning the pre-break release until it
does. That coordinated re-author is the "equivalently honest forward path"
this policy requires. The window still closes at the first genuinely external
adopter.
