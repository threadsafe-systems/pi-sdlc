# ADR 0016: FS8 — the frozen sdlc-status machine surface (schema version 1)

- Context: readiness (ADR 0015) is consumed by agents, shell callers, and CI.
  Like FS1/FS2, its machine surface must be frozen so consumers can bind to it
  without chasing output drift.
- Decision: FS8 schema version 1 freezes, for both entry points
  (`sdlc-status.sh` and `sdlc-status.mjs`, identical contracts):
  - CLI: `[--config DIR | --repo-root DIR] [--format text|json]`; `--format`
    defaults to `text`; a well-formed `--format json` pair anywhere in argv
    makes every subsequent result — including argument errors — use the JSON
    envelope; `--help`/`-h` prints usage, exits 0, and emits no envelope.
  - Exits/states: 0 `ready`, 1 `not-adopted`, 2 `error`, 3 `not-ready`. No
    other readiness exit is valid in v1.
  - JSON envelope: exactly one object plus a trailing newline on stdout, with
    exactly the fields `schemaVersion` (1), `root` (absolute), `state`,
    `exitCode`, and `checks[]` of `{ id, status, message, remediation? }`
    where `status` is `pass|fail|error|skip`.
  - The ten check ids, in canonical order: `cli.arguments`, `root.resolve`,
    `git.repository`, `adoption.manifest-head`, `adoption.manifest-clean`,
    `config.valid`, `models.head`, `models.clean`, `models.valid`,
    `workflow.readable`.
  - Text format: `root:`, `state:`, `exit-code:` first, in that order, then
    `check: <id> <status> — <message>` lines in canonical order, each
    optionally followed by `remediation: <id> — <text>`.
  - Exit/state mapping: 0 `ready`, 1 `not-adopted`, 2 `error`, 3 `not-ready`;
    aggregate precedence is error > not-adopted > not-ready > ready.
  The check set is closed for v1: adoption-bundle (or any new) checks arrive
  only through an explicit FS8 schema-version bump plus migration, and v1
  check meanings are never reinterpreted.
- Consequences: golden tests (`test/readiness-output.test.js`) pin the exact
  text and JSON shapes; any surface change is a new schema version with a
  documented migration, never a silent edit. Consumers should prefer
  `--format json` for parsing; the text form is for humans and simple greps.
