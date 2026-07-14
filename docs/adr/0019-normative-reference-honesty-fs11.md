# ADR 0019: versioned normative-reference honesty surface (FS11)

- Status: accepted
- Date: 2026-07-14
- Decision owners: pi-sdlc maintainers

## Context

The skill's generic prompts and documentation contain normative references to
files, commands, CI checks, and external facilities. A missing file or an
unconfigured facility can make the lifecycle contract appear complete while
remaining inert. A broad grep cannot distinguish package-owned, consumer-owned,
and external references.

## Decision

Ship a versioned package inventory at
`skills/sdlc/assets/normative-references.json` and a read-only checker at
`skills/sdlc/scripts/check-references.mjs` (with a shell wrapper). The inventory
schema and report envelope are version 1. Package-owned and readiness assertions
must occur exactly once and package-owned targets must exist. Consumer-owned
references report `unverified-consumer`; external references report `external`.
Readiness entries are statically coupled to the exact shipped verifier assertion
and do not perform live readiness, network, GitHub, or model calls.

The inventory covers every normative reference in the enumerated generic source
files; incidental examples are explicitly non-normative. Whole-file consumer
prompt overrides are not semantically certified by the package.

## Consequences

- Broken package references fail an offline deterministic check rather than being
  silently accepted.
- Consumer-owned equivalents remain possible without false package certification.
- Changes to the inventory or report shape require a schema/report-version
  decision and migration.
- The checker is not a general Markdown parser and does not replace FS8 readiness
  or FS9 lifecycle checking.
