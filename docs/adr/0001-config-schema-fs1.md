# ADR 0001: sdlc.config.json is a frozen surface (FS1)

- Superseded by: [ADR 0021](0021-merged-config-schema-and-release-guard.md)

- Context: consumers author `.pi/sdlc/sdlc.config.json`; the scripts and SKILL bind
  to its field names, types, required set, and defaults.
- Decision: freeze the schema (`schemaVersion`, `prefix`, `labelPrefix`, `announce`,
  optional `paths`, optional `tracker`), `additionalProperties:false`, additive
  within a major. `schemaVersion` gates the major (v1 accepts `1` only).
- Consequences: a new required field or a rename is a breaking (major) change; new
  optional fields are additive. A typo'd key fails loudly, not silently.
