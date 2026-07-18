---
name: sdlc-retro
description: Post-mortem pipeline for the sdlc's lifecycle telemetry (FS13) — collect the run store into a distilled run.json, then render it as a single self-contained HTML dashboard. Use after a feature's implement/PR phases to see phase timing, cost, panel precision, human-wait, and rework for that run.
---

# sdlc-retro

The post-mortem half of FS13 (see `docs/adr/0028-lifecycle-telemetry-fs13.md`,
governing spec `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md`). The
capture half — the run-manifest event contract, the emitter, and the panel
harvest CLI — lives in the sibling `sdlc` skill; read its `## Lifecycle
telemetry (FS13)` section for the hook steps that populate the run store this
skill distills.

## Run store layout

Every instrumented run lives at `.pi/sdlc/runs/<slug>/` (git-ignored; raw
material stays local, never committed):

```
.pi/sdlc/runs/<slug>/
  events.jsonl                          # the manifest: one FS13 event per line
  panels/<panelPhase>-round<N>-<date>/  # harvested pi-subagents artifacts
    status.json
    events.jsonl
    [transcripts/...]
  raw/                                  # collect-time snapshots (see below)
    sessions/<session-file-name>.jsonl
    reviews/<review-dir>/...
    git/<name>.json
    github/<name>.json
    llm/<name>.json
```

`<slug>` is the feature slug used throughout the run (matches
`validate-task.mjs`'s `TASK_RE` grammar). The distilled record and dashboard
are committed, not the run store: `docs/retros/<slug>/run.json` (schema
`skills/sdlc-retro/schema/run.schema.json`) and
`docs/retros/<slug>/index.html`. The manifest's event envelope/payload shapes
are pinned by `skills/sdlc-retro/schema/event.schema.json`; the `--llm-cmd`
request/response protocol (below) is pinned by
`skills/sdlc-retro/schema/llm-protocol.schema.json`. All three schemas are
frozen by `docs/adr/0028-lifecycle-telemetry-fs13.md` (FS13).

## Invocation (FS12-relative)

In pi, run `scripts/collect-run.sh --slug <slug>` relative to this loaded
skill. For headless use, run
`node <skill-dir>/scripts/collect-run.mjs --slug <slug>`. Then render the
distilled record: `scripts/render-retro.sh --run docs/retros/<slug>/run.json`
(headless: `node <skill-dir>/scripts/render-retro.mjs --run
docs/retros/<slug>/run.json`).

`collect-run` joins the manifest, harvested panel artifacts, correlated pi
session transcripts (top-level session files only; nested per-child subagent
sessions are excluded — panel effort is counted solely from harvested
artifacts), discovered review directories, and injectable `--git-cmd`/
`--gh-cmd`/`--llm-cmd` seams into a schema-valid `run.json`. Pass `--no-llm`
to skip the LLM seam entirely (no narratives, no steering classification, no
panel precision — `run.json` still validates, with a `soft.absent` coverage
marker) or `--no-github` to skip the GitHub seam. `render-retro` turns one
`run.json` into a single self-contained, offline HTML file: no external
`http(s)://` references, no external `<script src>`/`<link href>`, no
generation-time values, byte-identical across repeated renders of the same
input.

## Coverage semantics

`run.json`'s top-level `coverage[]` array names every gap this run's data has:
an absent or partial manifest, a missing panel harvest for a phase, no
correlatable sessions, an unresolvable session directory, a non-v3 session
file, a skipped or failed GitHub/git/LLM call, absent soft data entirely, or
an unparseable panel-precision round. `hard` values are measured or
coverage-marked absent — **never estimated**; `soft` values (LLM-generated
phase narratives, steering classification, panel precision) are always
model-attributed under `soft.attribution` and structurally separated from
`hard`, so the dashboard can never present a guess as a measurement. The
dashboard renders every coverage marker under its `#coverage` anchor and
substitutes an explicit notice — never a fabricated number — in any section
whose inputs are absent.

## Regenerate, don't migrate

`run.json`'s schema evolves additive-only. When a future collector version
needs a new field, it regenerates `run.json` from the manifest plus the run
store's `raw/` snapshots (`--from-raw`, which reads exclusively from those
snapshots and never re-consults a live source) rather than migrating an
already-committed `run.json`. This is the same reason `raw/` exists: every
non-manifest input `collect` consumes is snapshotted verbatim before
distillation, so a rerun stays byte-identical even after live sessions,
review files, or git/GitHub state have moved on.

## Dogfood retro

`docs/retros/sdlc-lifecycle-telemetry/run.json` and `index.html` are this
feature's own committed retro, generated once the emitter existed partway
through its own build — its coverage markers honestly record the
pre-instrumentation gap rather than claiming full-run coverage. This is the
expected shape for any mid-adoption run: partial coverage, never
backfilled by inference.
