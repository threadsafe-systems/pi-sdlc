# ADR 0028: lifecycle telemetry and post-mortem dashboard (FS13)

- Status: accepted
- Date: 2026-07-18
- Decision owners: pi-sdlc maintainers

Note on numbering: the governing spec
(`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md`) names this decision
"ADR 0021" — the next free slot when the spec was written. Main advanced past
that number with unrelated ADRs (0021-0027) before this stream's Build phase
landed; this file uses 0028, the next free slot at commit time. The content
below is the spec's ADR unchanged in substance.

## Context

The lifecycle has no durable record of its own execution: phase timing, panel
cost/precision, human-wait, and rework are invisible once a feature ships.
Reconstructing them after the fact from scattered session transcripts and
GitHub history is unreliable and does not scale. The lifecycle needed an
always-on, low-friction capture mechanism plus a deterministic post-mortem
pipeline that never fabricates a figure it cannot measure.

## Decision

Freeze **FS13**, two stored-record shapes:

1. **The run-manifest event contract** (spec §3): one JSON object per
   `events.jsonl` line, schema version 1, envelope
   `{schemaVersion, ts, slug, event, by, payload}` with a fixed v1 event
   vocabulary (15 event types) and additive-only payloads. Consumers ignore
   unknown event types and unknown payload fields. Captured by
   `skills/sdlc/scripts/record-run-event.{mjs,sh}` (manual prose emission) and
   automatically by `resolve-panel.mjs`, `ensure-panel-agent.mjs`, and
   `validate-task.mjs` after successful completion (additive optional
   `--slug`; frozen stdout/exit-code contracts unchanged, NF3) and by
   `skills/sdlc/scripts/harvest-panel.{mjs,sh}` (panel-artifact preservation).
   The committed schema `skills/sdlc-retro/schema/event.schema.json` mirrors
   the vocabulary table field-for-field.
2. **The distilled retro record `run.json` v1** (spec §7), produced by
   `skills/sdlc-retro/scripts/collect-run.{mjs,sh}` from the manifest, panel
   harvests, correlated pi session transcripts, discovered review
   directories, and injectable git/gh/LLM seams, then rendered into a
   single self-contained offline HTML dashboard by
   `skills/sdlc-retro/scripts/render-retro.{mjs,sh}`. `hard` values are
   measured or coverage-marked absent, never estimated; `soft` values (LLM
   narratives, steering classification, panel precision) are always
   model-attributed and structurally separated from `hard` so the renderer
   cannot conflate them. The committed schema
   `skills/sdlc-retro/schema/run.schema.json` pins the v1 shape; the LLM
   request/response protocol is pinned by
   `skills/sdlc-retro/schema/llm-protocol.schema.json`.

Both schemas are hand-rolled-validated (NF2: no schema-validation library at
runtime; a JSON Schema library validates only in tests, matching the
`inspectManifest`/PV1 precedent) and tests assert the hand-rolled validators
agree with the committed schema files on every fixture.

Every non-manifest input `collect` consumes (correlated session transcripts,
review-artifact files, git command outputs, GitHub responses, LLM
request/response pairs) is snapshotted verbatim into the run store's
`raw/` before distillation; `--from-raw` replays exclusively from those
snapshots and reproduces a byte-identical `run.json` even after live sources
are pruned, rebased, or mutated (regenerate, never migrate). Committed soft
strings pass a deterministic redaction pass, are rejected outright (not
truncated) on a >=12-consecutive-word verbatim substring of any correlated
user message, and are capped at 500 characters (NF4); steering entries carry
only `{index, ts, class}`, never user text.

The run store (`.pi/sdlc/runs/<slug>/`) is git-ignored; the distilled record
and dashboard (`docs/retros/<slug>/run.json`, `docs/retros/<slug>/index.html`)
are committed.

## Consequences

- Every FS5 CLI's frozen stdout/exit-code contract is unchanged; telemetry is
  additive and fail-soft everywhere it touches the lifecycle (an unresolvable
  run identity or an unwritable store degrades to one stderr warning, never a
  behavioural change).
- The post-mortem pipeline can regenerate `run.json` at any time after the
  fact from `raw/`, without re-consulting mutated or deleted live sources.
- No committed artifact can carry a secret or verbatim user prompt text by
  construction (NF4 is a mechanism enforced by `collect`, not an aspiration).
- Schema evolution is additive-only; a future collector regenerates from the
  manifest + `raw/` rather than migrating existing `run.json` files.
- FS9 (`check-lifecycle`), FS8 status, FS10 setup, FS11 inventory semantics,
  and FS12 path rules are unchanged; this decision adds a new capture and
  post-mortem surface without touching any of them.
