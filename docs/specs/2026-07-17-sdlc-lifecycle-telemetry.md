# Specification: lifecycle telemetry and post-mortem dashboard (sdlc-retro)

- Date: 2026-07-17
- Plan: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 2,
  panel-reviewed, human-approved 2026-07-17)
- Track: irreversible (freezes FS13: the run-manifest event contract and the
  `run.json` v1 retro record)
- Author vendor: anthropic
- Spec panel: pending
- Human gate: pending

## 1. Surfaces and homes

Two frozen stored-record shapes, together **FS13** (ADR 0021):

1. the run-manifest event contract (`events.jsonl` lines, §3);
2. the distilled retro record `run.json` (§6), pinned by a committed JSON
   schema.

Component homes (plan decision: hardcoded, no FS1 `paths` change):

| Component | Home | Committed? |
|---|---|---|
| Run store (manifest, harvests, raw snapshots) | `.pi/sdlc/runs/<slug>/` | no — git-ignored |
| Distilled retro record + dashboard | `docs/retros/<slug>/run.json`, `docs/retros/<slug>/index.html` | yes |
| Capture tooling (emitter, harvest) | `skills/sdlc/scripts/` (capture is part of the lifecycle skill) | package |
| Post-mortem tooling (collect, render) + schema | `skills/sdlc-retro/scripts/`, `skills/sdlc-retro/schema/` | package |

The repository `.gitignore` gains `.pi/sdlc/runs/`. Capture scripts are
invoked skill-relative per FS12 (`scripts/record-run-event.sh` from the sdlc
skill; `scripts/collect-run.sh` / `scripts/render-retro.sh` from the
sdlc-retro skill; direct-Node fallback `node <skill-dir>/scripts/<name>.mjs`).
sdlc-retro scripts may import shared helpers from the sibling skill via
package-relative paths (the package ships as one repository); they never
resolve consumer paths through the skill root.

## 2. Run store layout

```
.pi/sdlc/runs/<slug>/
  events.jsonl                          # the manifest (§3); append-only
  panels/<phase>-round<N>-<YYYY-MM-DD>/ # harvested pi-subagents artifacts (§5)
    status.json
    events.jsonl
    [transcripts/...]                   # optional, --with-transcripts only
  raw/                                  # collect-time snapshots (§6.4)
    sessions/<session-file-name>.jsonl  # verbatim copies
    github/<name>.json                  # verbatim API responses
    llm/<name>.json                     # {prompt, model, response} verbatim
```

`<slug>` matches the existing task-id grammar
`^[a-z0-9]+(?:-[a-z0-9]+)*$` (`validate-task.mjs` `TASK_RE`). The run store
is retained indefinitely; nothing in the package prunes it.

## 3. FS13 — run-manifest event contract

One JSON object per line, UTF-8, LF-terminated, appended atomically (single
write, O_APPEND; a serialized line including terminator MUST NOT exceed
32 KiB — the emitter rejects larger payloads).

Envelope (all fields required unless noted):

```json
{"schemaVersion":1,"ts":"<ISO-8601 UTC>","slug":"<slug>","event":"<type>",
 "by":"script:<name>"|"agent"|"human:<name>","payload":{...}}
```

`payload` is event-specific, optional, and additive-only. Consumers MUST
ignore unknown event types and unknown payload fields (forward
compatibility). The v1 vocabulary:

| Event | Emission | Payload (v1) |
|---|---|---|
| `run.started` | prose | `{title, track}` |
| `phase.entered` | prose | `{phase}` (brainstorm/plan/spec/build/implement/pr) |
| `phase.backward` | prose | `{from, to, reason}` |
| `gate.approved` | prose | `{phase, artifact, rev, approver}` |
| `artifact.revised` | prose | `{artifact, rev, reason}` |
| `panel.resolved` | auto (`resolve-panel`) | `{phase, models[], authorExcluded}` |
| `panel.agent_stamped` | auto (`ensure-panel-agent`) | `{phase, agent}` |
| `panel.dispatched` | prose | `{phase, round, models[]}` |
| `panel.harvested` | auto (`harvest-panel`) | `{phase, round, dir, missed[]}` |
| `panel.consolidated` | prose | `{phase, round, findings:{high,medium,low}, incorporated, dismissed}` |
| `task.validated` | auto (`validate-task`) | `{task, verdict, scenarioIds[]}` |
| `lifecycle.checked` | prose (caller-side; `check-lifecycle` itself is untouched, FS9) | `{verdict}` |
| `pr.opened` | prose | `{number}` |
| `pr.fix_wave` | prose | `{number, sha}` |

### 3.1 Emitter CLI

`skills/sdlc/scripts/record-run-event.{sh,mjs}`:

```
record-run-event.mjs <event> [--slug S] [--by WHO] [--payload JSON]
                     [--config DIR | --repo-root DIR]
```

- Exit 0: event appended, or emission **skipped** because run identity is
  unresolvable (skip prints one `sdlc-telemetry:`-prefixed warning line to
  stderr). Skips are soft by design — callers never fail because telemetry
  could not attribute.
- Exit 2: usage error, unknown event type, malformed/oversized `--payload`,
  or an I/O failure — and the manifest is never left with a partial line.
- Nothing is ever written to stdout. Diagnostics go to stderr with the
  `sdlc-telemetry:` prefix.

### 3.2 Run identity resolution

In order: `--slug` flag → `SDLC_RUN_SLUG` environment variable → current git
branch mapped to a slug (strip a single `<type>/` prefix, e.g. `feat/`,
`fix/`; lowercase; `/`→`-`; result must match the slug grammar). On `main`,
`master`, a detached HEAD, or a non-conforming result, identity is
**unresolvable** → skip-with-warning. Never guess from cwd or artifact names.

### 3.3 FS5 side-effect emission

`resolve-panel.mjs` and `ensure-panel-agent.mjs` gain **additive optional**
`--slug` handling (flag + env, same resolution as §3.2) and emit their §3
events after successful completion. `validate-task.mjs` emits
`task.validated` after writing its receipt. Frozen contracts are untouched:
existing flags, argument shapes, **stdout bytes, and exit codes are
byte-identical** with emission active, inactive, skipped, or failed.
Emission failure (e.g. unwritable store) degrades to the same
skip-with-warning stderr path and never alters the primary exit code.
`check-lifecycle.mjs` is not modified at all.

## 4. SKILL.md hook steps

`skills/sdlc/SKILL.md` names the emitter at each prose-emitted inflection
point: run start, every phase entry, every human gate approval, panel
dispatch/consolidation, caller-side lifecycle-check recording, PR open, and
fix waves. Contract is **token-level**: each mandated hook step contains the
token `record-run-event.sh` and its event-type token (e.g. `gate.approved`);
exact prose wording is not pinned. `skills/sdlc-retro/SKILL.md` documents the
store layout, collect/render invocation, coverage semantics, and the
regenerate-don't-migrate policy, and the sdlc skill points at it for the
post-mortem step.

## 5. Harvest contract

`skills/sdlc/scripts/harvest-panel.{sh,mjs}`:

```
harvest-panel.mjs --phase P --round N --from DIR [--slug S]
                  [--with-transcripts] [--format text|json]
                  [--config DIR | --repo-root DIR]
```

- Copies `status.json` and `events.jsonl` from `--from` (a pi-subagents run
  directory or an equivalent artifact directory) into
  `panels/<phase>-round<N>-<date>/`; `--with-transcripts` additionally copies
  transcript files under `transcripts/`.
- Reports per-file `copied|missed` in its envelope. A missing/aborted source
  directory or file is a **report, not a throw**: exit 0, `missed[]`
  populated, and the `panel.harvested` event records the gap (which `collect`
  surfaces as a coverage marker). Exit 2 only for usage errors or an
  unwritable destination.
- The skill's dispatch step invokes harvest immediately after panel
  completion (harvest-at-dispatch, plan R2).

## 6. Collector contract

`skills/sdlc-retro/scripts/collect-run.{mjs,sh}`:

```
collect-run.mjs --slug S [--out FILE] [--format text|json]
                [--llm-cmd CMD | --no-llm] [--gh-cmd CMD] [--no-github]
                [--sessions-dir DIR]... [--config DIR | --repo-root DIR]
```

Exit 0 success (run.json written, possibly with coverage markers), 1 nothing
collectable (no manifest and no run store), 2 usage/operational error.
Default `--out` is `docs/retros/<slug>/run.json`.

### 6.1 Source adapters

1. **Manifest**: `.pi/sdlc/runs/<slug>/events.jsonl`; malformed lines are
   counted and skipped (coverage marker), never fatal.
2. **Panel harvests**: `panels/*/status.json|events.jsonl` — per-model
   tokens/cost/duration/turns (pi-subagents `lifecycleArtifactVersion` 1
   fields; unknown fields ignored).
3. **Session transcripts**: pi session JSONL, header `version` 3 (sniffed;
   other versions ⇒ per-file soft-fail + coverage marker). Extracted facts:
   per-assistant-message `usage` (tokens + `cost.total`), `model`,
   `provider`, `stopReason`, timestamps; `model_change` /
   `thinking_level_change` events; user-message timestamps and text (text
   used only for steering classification and never copied into run.json
   verbatim).
4. **Review artifacts**: `docs/reviews/<phase>-<slug>-<date>/` per-model
   files and `consolidated.md`.
5. **git/GitHub**: branch commits and diff stats via `git`; PR metadata,
   review threads, and timeline via `--gh-cmd` (default `gh`). `--no-github`
   skips with a coverage marker. Tests always inject a fake `--gh-cmd`; no
   test performs network access.

**Correlation rule (sessions ↔ slug)**: candidate session files come from the
pi session directories for the consumer root and `<root>.worktrees/*`
(overridable/extendable via repeatable `--sessions-dir`). A session is
correlated iff at least one of its messages falls within the run window
[first manifest event ts − 1h, last manifest event ts + 1h]. No manifest ⇒
window undefined ⇒ `sessions.none` coverage marker (never guessed).

### 6.2 LLM seam (soft data)

`--llm-cmd CMD` names an executable receiving one JSON request on stdin and
returning one JSON response on stdout (the schema of both is pinned by the
committed run.json schema's `soft.attribution` and fixture files). Soft
outputs: phase narratives, user-turn steering classification
(`gate-approval|correction|scope-change|unblock|other`), and per-model panel
precision parsed from prose adjudications. All soft data carries model
attribution; unparseable adjudications yield `precision.unparsed:<dir>`
coverage markers, not numbers. `--no-llm` produces a valid run.json with
`soft` absent and a `soft.absent` marker.

### 6.3 Derived measures (hard, deterministic)

Pinned formulas: wall time = last − first manifest event; per-phase
attribution by `phase.entered` boundaries; agent time = sum of correlated
assistant-turn durations (previous-entry ts → assistant ts within a session);
human-wait = sum of assistant→user gaps, **each gap capped at 30 minutes**,
always labelled a proxy; token/dollar rollups by model × phase from
transcript usage plus harvested panel totals; rework = `artifact.revised`
count, `phase.backward` count, `pr.fix_wave` count; intervention counts by
steering class (soft). Size proxies: scenario count (spec scenario ids), task
count, diff stats (files/insertions/deletions), session count, phase set.

### 6.4 Raw snapshots and regeneration

Before distilling, `collect` snapshots verbatim into `raw/`: every correlated
session transcript file, every GitHub response, and every LLM request/
response pair. Re-running `collect` against a run store whose `raw/` is
populated (offline, `--no-github`, fixture LLM replay from `raw/llm/`)
reproduces the identical run.json. This is the regenerate-don't-migrate
mechanism: schema evolution is additive-only; a new collector regenerates
from `raw/`; migrators are never written.

## 7. run.json v1

Pinned by committed schema `skills/sdlc-retro/schema/run.schema.json`
(validated in tests against all fixtures). Top level:

```
schemaVersion: 1
slug, title, track
coverage:   [ { marker, detail? } ]          # enumerated markers incl.
            # manifest.absent, manifest.partial, panels.missing:<phase>,
            # sessions.none, session.version:<file>, github.skipped,
            # soft.absent, precision.unparsed:<dir>
sizeProxies:{ scenarios, tasks, diff{files,insertions,deletions},
              sessions, phases[] }
hard:       { window{start,end}, phases[], sessions[], panels[],
              models[], rollups{byModel[],byPhase[]}, rework{...},
              totals{tokens,cost,wallMs,agentMs,humanWaitMs} }
soft:       { attribution{model,provider}, narratives[], steering[],
              panelPrecision[] }             # optional as a whole
```

`hard` values are measured or absent (coverage-marked) — never estimated.
`soft` values are model-attributed. The schema separates them structurally so
the renderer cannot conflate them.

## 8. Renderer contract

`skills/sdlc-retro/scripts/render-retro.{mjs,sh}`:

```
render-retro.mjs --run FILE [--out FILE]
```

Exit 0 written; 1 run.json fails schema validation; 2 usage/IO. Default
`--out`: `index.html` beside the input.

- Single self-contained HTML file: no external URL references of any kind
  (no `http(s)://` fetches, no `<script src>`, no `<link href>`); inline
  CSS/JS only; renders offline from `file://`.
- Deterministic: consumes `run.json` alone; embeds **no generation-time
  values**; rendering the same input twice under one renderer/Node version is
  byte-identical. Never invokes a model.
- Single-scroll dashboard with stable section anchors, each rendered whenever
  its inputs exist and replaced by an explicit coverage notice when they
  don't: `#exec-strip`, `#phase-swimlane`, `#cost-breakdown`,
  `#panel-deepdive`, `#steering-map`, `#rework-panel`, `#coverage`.
- Every element visualising `soft` data carries `data-soft="true"` and a
  visible attribution; hard and soft are never merged in one figure.
- Visual styling within these structural requirements is implementation
  freedom (plan constraint).

## 9. FS11 inventory additions

`skills/sdlc/assets/normative-references.json` gains additive entries (no
schemaVersion bump) covering every package-owned normative reference
introduced by: the sdlc SKILL.md hook steps (`record-run-event.sh`,
`harvest-panel.sh`), the sdlc-retro SKILL.md (its scripts, schema, store
paths), the run.json schema file, and ADR 0021. `check-references` passes;
removing any new entry's target breaks it.

## 10. Scenarios

Emitter (LT1–LT5):

- **LT1** — a valid emit appends exactly one schema-conforming line; the file
  is created on first use with its parent directories.
- **LT2** — unknown event type, malformed JSON payload, and an oversized
  (>32 KiB) payload each exit 2 and leave the manifest byte-identical.
- **LT3** — N concurrent emitters (fixture spawns ≥20 in parallel) produce
  exactly N complete, parseable lines with no interleaving.
- **LT4** — identity resolution order: `--slug` beats `SDLC_RUN_SLUG` beats
  branch mapping; branch `feat/some-thing` maps to `some-thing`.
- **LT5** — on `main` and on a detached HEAD with no flag/env, emission skips:
  exit 0, one `sdlc-telemetry:` stderr warning, no file write.

FS5 side effects (LT6–LT10):

- **LT6** — `resolve-panel` with a resolvable slug emits `panel.resolved`;
  its stdout and exit code are byte-identical to a run without emission
  (fixture diff), including `--emit-tasks` output.
- **LT7** — `ensure-panel-agent` emits `panel.agent_stamped`; stdout/exit
  byte-identical either way.
- **LT8** — `validate-task` on a passing fixture manifest emits
  `task.validated` with the task id, verdict, and scenario ids; the receipt
  and report are byte-identical either way.
- **LT9** — with the run store unwritable, all three commands succeed with
  their normal output plus one prefixed stderr warning.
- **LT10** — `check-lifecycle.mjs` and `check-lifecycle.sh` are byte-identical
  to main (FS9 read-only surface untouched).

Harvest (LT11–LT12):

- **LT11** — harvesting a fixture pi-subagents run dir copies `status.json` +
  `events.jsonl` into `panels/<phase>-round<N>-<date>/` and emits
  `panel.harvested`; `--with-transcripts` also copies transcripts, default
  does not.
- **LT12** — a missing source dir and a partially-present one (status without
  events) exit 0 with `missed[]` in the envelope and the event payload.

Collector (LT13–LT19):

- **LT13** — a complete fixture run store (manifest + harvests + committed v3
  transcript fixture + review fixtures + fake `--gh-cmd` + fixture
  `--llm-cmd`) produces a run.json that validates against the committed
  schema, with size proxies and by-model/by-phase rollups asserted
  against known answers.
- **LT14** — a gappy store (no panels dir, no correlatable sessions) produces
  a schema-valid run.json whose coverage markers name each gap and whose
  hard section contains no value derived from a missing source.
- **LT15** — per-adapter known-answer fixtures: manifest with malformed lines
  (skipped + counted), harvest fields mapped correctly, transcript usage/cost
  summed correctly, a version-4 transcript soft-fails per-file with a marker,
  review-dir discovery matches `<phase>-<slug>-<date>` naming, git/GitHub
  adapter consumes only the injected fakes.
- **LT16** — derived-measure formulas against a hand-computed fixture: phase
  attribution, agent time, capped human-wait (a 3-hour gap contributes
  exactly 30 minutes), rework counts, window bounds.
- **LT17** — regeneration: after one collect populates `raw/`, a second
  collect in offline replay mode reproduces a byte-identical run.json.
- **LT18** — soft data appears only under `soft`, carries attribution, and
  the steering classes and precision figures match the fixture LLM's scripted
  responses; an unparseable consolidated fixture yields
  `precision.unparsed:<dir>` and no precision number for that panel.
- **LT19** — `--no-llm` output validates, carries `soft.absent`, and renders
  (with LT22's notice).

Renderer (LT20–LT23):

- **LT20** — output contains all seven section anchors, is a single file, and
  matches a no-external-reference scan (no `http://`, `https://`,
  `src=`/`href=` pointing off-file).
- **LT21** — rendering the same run.json twice yields byte-identical files;
  the output contains no generation timestamp (fixture greps for the render
  date injected nowhere).
- **LT22** — soft-data figures carry `data-soft="true"` and attribution; a
  `soft`-less run.json renders coverage notices in `#steering-map` and the
  precision panel instead of numbers.
- **LT23** — every coverage marker in the fixture run.json is rendered under
  `#coverage`.

Docs, inventory, dogfood (LT24–LT27):

- **LT24** — a structural doc test asserts each mandated sdlc SKILL.md hook
  step contains `record-run-event.sh` and its event-type token (run start,
  phase entries, gate approvals, panel dispatch/consolidation,
  lifecycle-check, PR open, fix wave); sdlc-retro SKILL.md names collect and
  render invocations skill-relatively (FS12 forms).
- **LT25** — `check-references` passes with the new inventory entries; a
  mutation deleting a new entry's target file fails it.
- **LT26** — `.gitignore` covers `.pi/sdlc/runs/` (fixture: a file under it
  is ignored per `git check-ignore`).
- **LT27** — `docs/retros/sdlc-lifecycle-telemetry/run.json` +
  `index.html` exist, the run.json validates against the committed schema,
  and its coverage markers honestly record the pre-instrumentation gap
  (dogfood retro, partial coverage by design).

## 11. Non-functional requirements

- **NF1** — offline and deterministic: no test performs network access or
  invokes a model; all external effects go through injectable seams.
- **NF2** — no new runtime dependencies (Node built-ins only, matching every
  existing script).
- **NF3** — telemetry is fail-soft everywhere it touches the lifecycle: no
  frozen FS5/FS9 contract changes beyond the declared additive flags; no
  emission path may alter a primary command's stdout or exit code.
- **NF4** — committed artifacts (`run.json`, dashboard) contain no secrets
  and no verbatim user prompt text; raw material stays in the git-ignored
  run store.

## 12. Migration

None for existing consumers: every surface is new and opt-in; FS5 CLIs gain
only additive optional flags; `check-lifecycle`, FS8 status, FS9 checker,
FS10 setup, FS11 inventory semantics, and FS12 path rules are unchanged.
Uninstrumented historical runs are out of scope; the dogfood retro documents
partial coverage as the expected shape for mid-adoption runs.
