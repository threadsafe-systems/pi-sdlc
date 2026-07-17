# ADR 0024: FS5 preference-mode resolver and merged input

- Status: accepted
- Date: 2026-07-16
- Amends: ADR 0005

## Context

The merged config retires the separate roster input, and user-owned preference
posture requires a non-blocking shortfall without corrupting the resolver's
machine-readable stdout.

## Decision

`resolve-panel` reads only the merged config. `--models-file` is retired and is
a usage error that names the merged `panels` location without reading the
supplied path. Under `strict`, the established 0 success / 1 shortfall / 2 bad
input behavior remains. Under `preference`, a sub-target but non-empty panel
emits its target-versus-actual and author-readmission advisory on stderr,
emits the normal list or `--emit-tasks` JSON on stdout, and exits 0. Mode/gate
refusals and empty panels still exit 1.

## Consequences

- Existing strict callers retain their exit behavior.
- Preference callers must treat stderr as advisory context while stdout remains
  byte-parseable.
- The obsolete path override cannot silently reintroduce a second source of
  truth.
