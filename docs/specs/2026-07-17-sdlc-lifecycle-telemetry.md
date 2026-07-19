# Specification: lifecycle telemetry and post-mortem dashboard (sdlc-retro)

- Date: 2026-07-17
- Plan: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 2,
  panel-reviewed, human-approved 2026-07-17)
- Track: irreversible (freezes FS13: the run-manifest event contract and the
  `run.json` v1 retro record)
- Author vendor: anthropic
- Spec panel: rounds 1–2 adjudicated 2026-07-17 —
  `docs/reviews/spec-sdlc-lifecycle-telemetry-2026-07-17/consolidated.md`.
  This is revision 3: rev 2 incorporated SF1–SF19 (round 1, none
  dismissed); rev 3 incorporated the round-2 findings with one partial
  dismissal recorded in the consolidated file (schema files are Build
  deliverables mirroring these normative tables, not spec-time artifacts)
  for human ratification.
- Human gate: Spec rev 3 approved by Neil Chambers on 2026-07-17, including
  ratification of (a) the schemas-at-Build partial dismissal and (b) the
  optional-`phase.exited`-with-pinned-derivation shape (plan wording
  deviation recorded in §3).

## 1. Surfaces and homes

Two frozen stored-record shapes, together **FS13** (to be recorded as ADR
0021, a deliverable of this feature):

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
  panels/<panelPhase>-round<N>-<YYYY-MM-DD>/ # harvested pi-subagents artifacts (§5)
    status.json
    events.jsonl
    [transcripts/...]                   # optional, --with-transcripts only
  raw/                                  # collect-time snapshots (§6.4)
    sessions/<session-file-name>.jsonl  # verbatim copies
    reviews/<review-dir>/...            # verbatim copies of consumed files
    git/<name>.json                     # captured git command outputs
    github/<name>.json                  # verbatim API responses
    llm/<name>.json                     # verbatim {request, response} pairs
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

`schemaVersion`, `ts`, `slug`, `event`, and `by` are required; `payload` is
event-specific and optional only where the table below shows none. `by` MUST
match `^(script:[a-z][a-z0-9-]*|agent|human:[a-z0-9][a-z0-9-]*)$` — human
identities are slug-style (`human:neil-chambers`), never free text with
spaces; auto-emitted events
set `by` to `script:<basename>` of the emitting CLI (`script:resolve-panel`,
`script:ensure-panel-agent`, `script:harvest-panel`,
`script:validate-task`). Payloads are additive-only. Consumers MUST ignore
unknown event types and unknown payload fields (forward compatibility). The
v1 vocabulary:

| Event | Emission | Payload (v1) |
|---|---|---|
| `run.started` | prose | `{title, track}` |
| `phase.entered` | prose | `{phase}` (brainstorm/plan/spec/build/implement/pr) |
| `phase.exited` | prose, optional | `{phase}` — MAY be emitted; when absent the collector derives the boundary (§6.3). Recorded decision: the plan's "phase enter/exit" is satisfied by mandatory enter + derived-or-explicit exit, minimising prose-emission burden |
| `phase.backward` | prose | `{from, to, reason}` |
| `gate.approved` | prose | `{phase, artifact, rev, approver}` |
| `artifact.revised` | prose | `{artifact, rev, reason}` |
| `panel.resolved` | auto (`resolve-panel`) | `{panelPhase, models[], authorExcluded}` |
| `panel.agent_stamped` | auto (`ensure-panel-agent`) | `{panelPhase, agent}` |
| `panel.dispatched` | prose | `{panelPhase, round, models[]}` |
| `panel.harvested` | auto (`harvest-panel`) | `{panelPhase, round, dir, missed[]}` |
| `panel.consolidated` | prose | `{panelPhase, round, findings:{high,medium,low}, incorporated, dismissed}` |
| `task.validated` | auto (`validate-task`) | `{task, verdict, scenarioIds[]}` |
| `lifecycle.checked` | prose (caller-side; `check-lifecycle` itself is untouched, FS9) | `{verdict}` |
| `pr.opened` | prose | `{number}` |
| `pr.fix_wave` | prose | `{number, sha}` |

Payload field types (normative): `phase` is one of the six **lifecycle**
phase names (brainstorm/plan/spec/build/implement/pr); `panelPhase` is one
of the four **panel** phases (`plan_review|spec_review|pr_review|
task_validate` — the existing FS5 vocabulary, deliberately distinct from
lifecycle `phase`; the collector attributes panels to lifecycle phases via
the fixed mapping plan_review→plan, spec_review→spec, pr_review→pr,
task_validate→implement); `models[]`, `missed[]`, `scenarioIds[]` are arrays
of non-empty strings; `round` and `number` are positive integers; `rev` is a
positive integer; `findings` is `{high,medium,low}` of non-negative
integers; `incorporated` and `dismissed` are non-negative integers;
`authorExcluded` is a string; every other named field is a non-empty string.
Every field named in a payload cell is required within that payload. The
committed schema `skills/sdlc-retro/schema/event.schema.json` mirrors this
table field-for-field, and the run.json schema mirrors §7 — both validated
by hand-rolled validators (§7); tests assert validator and schema file agree
on all fixtures.

### 3.1 Emitter CLI

`skills/sdlc/scripts/record-run-event.{sh,mjs}`:

```
record-run-event.mjs <event> [--slug S] [--by WHO] [--payload JSON]
                     [--config DIR | --repo-root DIR]
```

`--by` defaults to `agent` when omitted (prose emissions are agent-driven).

- Exit 0: event appended, or emission **skipped** because run identity is
  unresolvable (skip prints one `sdlc-telemetry:`-prefixed warning line to
  stderr). Skips are soft by design — callers never fail because telemetry
  could not attribute.
- Exit 2: usage error, unknown event type, a `--by` value violating the §3
  grammar, malformed/oversized `--payload`, or an I/O failure. All
  validation happens **before** any write, so no invalid record is ever
  attempted (the no-partial-line guarantee is prevalidation-scoped, not a
  filesystem-transaction claim: a torn final line from a rare mid-append I/O
  failure is tolerated by collectors, which count and skip malformed lines,
  §6.1).
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
`task.validated` after its report is **computed**, regardless of whether
`--report` was passed: always for PASS and FAIL, and for ERROR whenever the
manifest parsed far enough to yield the task id (an unparseable manifest has
nothing to attribute and skips emission with the standard warning); the
runner writes no receipt (receipts are the validator agent's artifact,
ADR 0014). Frozen contracts are untouched:
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
token `record-run-event.sh` and its event-type token (e.g. `gate.approved`),
and the panel-dispatch **and validator-dispatch** steps additionally contain
a skill-relative `harvest-panel.sh` invocation token (plan R2 covers both);
exact prose wording is not pinned. `skills/sdlc-retro/SKILL.md` documents the
store layout, collect/render invocation, coverage semantics, and the
regenerate-don't-migrate policy, and the sdlc skill points at it for the
post-mortem step.

## 5. Harvest contract

`skills/sdlc/scripts/harvest-panel.{sh,mjs}`:

```
harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S]
                  [--with-transcripts] [--format text|json]
                  [--config DIR | --repo-root DIR]
```

- `--from` names a directory carrying `status.json` and `events.jsonl` at
  its **top level** — the shape of a pi-subagents async run directory
  (`asyncDir`). Harvest copies both into `panels/<panelPhase>-round<N>-<date>/`
  (`--phase` takes the four-value panel vocabulary, §3);
  `--with-transcripts` additionally copies transcript files under
  `transcripts/`. Foreground dispatches that produce no such artifacts
  harvest as `missed[]` — an honest coverage gap; the skill recommends async
  dispatch where panel telemetry completeness matters.
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
collect-run.mjs --slug S [--out FILE] [--format text|json] [--from-raw]
                [--llm-cmd CMD | --no-llm] [--gh-cmd CMD] [--no-github]
                [--sessions-dir DIR]... [--config DIR | --repo-root DIR]
```

Exit 0 success (run.json written, possibly with coverage markers), 1 nothing
collectable (no manifest and no run store), 2 usage/operational error.
Default `--out` is `docs/retros/<slug>/run.json`. `--format json` reports
`{ok, out, coverage[], warnings[]}` on stdout (text mode renders the same
fields human-readably); all diagnostics go to stderr with the
`sdlc-telemetry:` prefix; run.json is written atomically (temp file +
rename). **`--from-raw` is replay mode**: every adapter reads exclusively
from `raw/` (sessions, reviews, git, github, llm) and no live source —
session dirs, `docs/reviews/`, `git`, `--gh-cmd`, `--llm-cmd` — is
consulted.

### 6.1 Source adapters

1. **Manifest**: `.pi/sdlc/runs/<slug>/events.jsonl`; malformed lines are
   counted and skipped — at least one malformed line records the
   `manifest.partial` coverage marker — never fatal. `title` and `track` in
   run.json come from the `run.started` payload and are optional: absent
   (coverage-marked) when no `run.started` event exists. Absence encoding is
   uniform everywhere: a value a source cannot supply is **omitted** (never
   `null`, never a sentinel) and its gap is named by a coverage marker.
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
   files and `consolidated.md`. The `<phase>-review-<slug>-<date>` form (a
   `-review-` infix) is an equally-accepted alternative and the recommended
   form going forward; the collector discovers both.
5. **git/GitHub**: branch commits and diff stats via `--git-cmd` (default
   `git`) — an injectable seam exactly like `--gh-cmd`; a failing
   `--git-cmd` records `git.error` and collection continues. PR metadata,
   review threads, and timeline via `--gh-cmd` (default `gh`). `--no-github`
   skips with a coverage marker; a **failing** `--gh-cmd` (non-zero exit or
   invalid JSON) records `github.error` and collection continues. Tests
   always inject a fake `--gh-cmd`; no test performs network access.

**Correlation rule (sessions ↔ slug)**: candidate session files are the
**top-level** `*.jsonl` files (nested per-child subagent session files are
excluded — panel effort is counted solely from harvested artifacts, §6.3) in
the pi session directories for the consumer root and `<root>.worktrees/*`,
derived best-effort from the observed pi convention: `~/.pi/agent/sessions/`
+ the absolute path with its leading `/` dropped, every `/` replaced by
`-`, wrapped as `--<mapped>--`. This is a pi-internal convention: a
directory that fails to resolve yields a `sessions.dir_unresolved` marker,
and repeatable `--sessions-dir` is the explicit override. A session is
correlated iff at least one of its messages falls within the run window
[first manifest event ts − 1h, last manifest event ts + 1h].
`sessions.none` fires whenever **zero sessions correlate**, whatever the
cause (no manifest, undefined window, or an empty window) — never guessed.

### 6.2 LLM seam (soft data)

`--llm-cmd CMD` names one executable path, invoked without a shell
(execFile), **once per request**, receiving one JSON request on stdin and
returning one JSON response on stdout. The protocol (pinned by
`skills/sdlc-retro/schema/llm-protocol.schema.json` and fixtures, hand-rolled
validation per §7):

- request: `{kind: "narrative"|"steering"|"precision", slug, model?, inputs}`
  where `inputs` is kind-specific — `narrative`: one phase's manifest events
  + correlated turn summaries; `steering`: the ordered user-turn texts of one
  session; `precision`: one review round's per-model findings +
  `consolidated.md` text. One request per phase / per session / per review
  round respectively (call count is therefore fixture-predictable).
  Per-kind shapes (normative): `narrative` inputs `{phase, events[],
  turns[]}` (events = the phase's manifest lines verbatim; turns =
  `{ts, role, model?}`) → output `{summary}` (string, ≤ 500 chars
  post-redaction); `steering` inputs `{sessionId, userTurns[]}` of
  `{index, ts, text}` → output `{classifications[]}` of `{index, class}`
  with class in the five steering classes and length equal to `userTurns`;
  `precision` inputs `{reviewDir, models[], findingsText,
  consolidatedText}` → output `{perModel[]}` of `{model, raised,
  incorporated, dismissed}` (non-negative integers). The committed protocol
  schema mirrors these shapes field-for-field.
- response: `{kind, model, provider, output}` with kind-specific `output`
  validated before use; an invalid response, non-zero exit, or timeout
  (default 120 s, PV2 precedent) records an `llm.error:<kind>` coverage
  marker and collection continues without that item.
- every request/response pair is snapshotted verbatim to `raw/llm/` (§6.4),
  which is what `--from-raw` replays.

Soft outputs: phase narratives, user-turn steering classification
(`gate-approval|correction|scope-change|unblock|other`), and per-model panel
precision parsed from prose adjudications. Committed steering entries store
only `{index, ts, class}` — never the user text. All soft data carries model
attribution; unparseable adjudications yield `precision.unparsed:<dir>`
coverage markers, not numbers. `--no-llm` produces a valid run.json with
`soft` absent and a `soft.absent` marker.

### 6.3 Derived measures (hard, deterministic)

Pinned formulas: wall time = last − first manifest event. Phase boundaries:
a phase spans its `phase.entered.ts` to its explicit `phase.exited.ts` when
present, else the next `phase.entered.ts`, else the window end; an entry
(transcript message or event) is attributed to the phase whose span contains
its ts; an entry within the window but outside every span is counted in an
`unattributed` bucket; an entry outside the window is excluded from
per-phase figures entirely. Agent time = Σ
over assistant entries of (assistant ts − ts of the immediately preceding
entry **in the same session file**, JSONL order; first-entry turns
contribute 0). Human-wait = Σ over user entries of (user ts − ts of the
immediately preceding assistant entry in the same session, when the
preceding entry is an assistant one), **each gap capped at 30 minutes**,
always labelled a proxy. Token/dollar rollups by model × phase: transcript
`usage` sums cover the orchestrating sessions; harvested panel totals cover
panel children; the two are **disjoint by construction** (nested child
session files are excluded from correlation, §6.1) — a panel is never
counted twice. Rework = `artifact.revised` count, `phase.backward` count,
`pr.fix_wave` count; intervention counts by steering class (soft). Size
proxies: scenario count (spec scenario ids), task count, diff stats
(files/insertions/deletions), session count, phase set.

### 6.4 Raw snapshots and regeneration

Before distilling, `collect` snapshots verbatim into `raw/` **every
non-manifest input it consumed**: correlated session transcript files, the
review-artifact files it read, captured git command outputs, every GitHub
response, and every LLM request/response pair — with deterministic names.
Re-running `collect --from-raw` reads exclusively from those snapshots
(§6) and reproduces the byte-identical run.json even after live sources are
pruned, rebased, or mutated. This is the regenerate-don't-migrate mechanism:
schema evolution is additive-only; a new collector regenerates from the
manifest + `raw/`; migrators are never written.

## 7. run.json v1

Pinned by committed schema `skills/sdlc-retro/schema/run.schema.json`
(validated in tests against all fixtures). Top level:

```
schemaVersion: 1
slug, title, track
coverage:   [ { marker, detail? } ]          # closed v1 marker set:
            # manifest.absent, manifest.partial, panels.missing:<phase>,
            # sessions.none, sessions.dir_unresolved, session.version:<file>,
            # github.skipped, github.error, git.error, llm.error:<kind>,
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
the renderer cannot conflate them. The committed
`skills/sdlc-retro/schema/run.schema.json` pins every field name, type,
required/optional status, enum, and array item shape for this structure and
is the normative contract; the sketch above is its outline. Per NF2, schema
validation is **hand-rolled** (the `inspectManifest` precedent in
`validate-task.mjs`), never a schema library; tests assert the hand-rolled
validator and the committed schema file agree on every fixture, so the
schema cannot drift into decoration.

## 8. Renderer contract

`skills/sdlc-retro/scripts/render-retro.{mjs,sh}`:

```
render-retro.mjs --run FILE [--out FILE] [--format text|json]
```

Exit 0 written; 1 the `--run` input is unreadable, unparseable, or fails
schema validation; 2 usage error (missing/unknown args) or an unwritable
`--out`. `--format json` reports `{ok, out, warnings[]}` on stdout (text
mode renders the same human-readably); diagnostics go to stderr with the
`sdlc-telemetry:` prefix; output is written atomically (temp + rename).
Default `--out`: `index.html` beside the input.

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
- Pinned per-section data bindings (an empty shell fails its scenario):
  `#exec-strip` renders every `hard.totals` value; `#phase-swimlane` renders
  one element per `hard.phases[]` entry carrying `data-phase`;
  `#cost-breakdown` one element per by-model and by-phase rollup entry
  carrying `data-model`/`data-phase`; `#panel-deepdive` one element per
  panel round per model and per finding; `#steering-map` one mark per
  `soft.steering[]` entry; `#rework-panel` the three rework counts. Fixture
  scenarios assert representative known-answer values appear in the output.
- Every element visualising `soft` data carries `data-soft="true"` and a
  visible attribution; hard and soft are never merged in one figure.
- Visual styling within these structural requirements is implementation
  freedom (plan constraint).

## 9. FS11 inventory additions

`skills/sdlc/assets/normative-references.json` gains additive entries (no
schemaVersion bump) covering every package-owned normative reference
introduced by: the sdlc SKILL.md hook steps (`record-run-event.sh`,
`harvest-panel.sh`), the sdlc-retro SKILL.md (its scripts, schema, store
paths), the schema files, and ADR 0021. Each new entry's `assertion` is a
**unique phrase** in its source (the checker enforces exactly-once; a bare
repeated token like `record-run-event.sh` cannot be an assertion).
`check-references` passes; removing any new entry's target breaks it. Because
the FS11 checker cannot detect an *omitted* entry, a structural coverage
test additionally asserts that every script under
`skills/sdlc-retro/scripts/`, every hook script named by §4, every committed
schema file under `skills/sdlc-retro/schema/`, ADR 0021, and every
run-store/retro path named normatively by either SKILL.md has an inventory
entry.

## 10. Scenarios

Emitter (LT1–LT5):

- **LT1** — a valid emit appends exactly one schema-conforming line; the file
  is created on first use with its parent directories.
- **LT2** — unknown event type, malformed JSON payload, an oversized
  (>32 KiB) payload, and a `--by` value violating the grammar each exit 2
  and leave the manifest byte-identical (prevalidation: no write is
  attempted).
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
- **LT8** — `validate-task` emits `task.validated` with the task id, verdict,
  and scenario ids: on a passing fixture (verdict PASS), on a failing fixture
  (verdict FAIL), on an ERROR fixture whose manifest parses (emits with
  verdict ERROR), and both with and without `--report`; an
  unparseable-manifest ERROR skips emission; report/stdout bytes are
  identical with emission active vs inactive.
- **LT9** — with the run store unwritable, all three commands succeed with
  their normal output plus one prefixed stderr warning.
- **LT10** — `check-lifecycle.mjs` and `check-lifecycle.sh` are byte-identical
  to main (FS9 read-only surface untouched).

Harvest (LT11–LT12):

- **LT11** — harvesting a fixture pi-subagents run dir copies `status.json` +
  `events.jsonl` into `panels/<panelPhase>-round<N>-<date>/` and emits
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
- **LT17** — regeneration: after one collect populates `raw/`, the live
  sources are destroyed or mutated (session fixture files deleted, review
  files edited, fake `--gh-cmd` replaced by one that fails, fake
  `--git-cmd` replaced by one that fails after the fixture repo gains a new
  commit); a second collect with `--from-raw` still reproduces a
  byte-identical run.json — falsifying any collector that secretly re-reads
  any live source, git included.
- **LT18** — soft data appears only under `soft`, carries attribution, and
  the steering classes and precision figures match the fixture LLM's scripted
  responses; an unparseable consolidated fixture yields
  `precision.unparsed:<dir>` and no precision number for that panel.
- **LT19** — `--no-llm` output validates, carries `soft.absent`, and renders
  (with LT22's notice).

Renderer (LT20–LT23):

- **LT20** — output contains all seven section anchors, is a single file,
  matches a no-external-reference scan (no `http://`, `https://`,
  `src=`/`href=` pointing off-file), and every §8 data binding is present
  with fixture known-answer values (totals in `#exec-strip`, one
  `data-phase` block per phase, per-model cost nodes, per-finding panel
  rows, steering marks, rework counts) — an empty shell fails.
- **LT21** — rendering the same run.json twice yields byte-identical files;
  the output contains no generation timestamp (fixture greps for the render
  date injected nowhere).
- **LT22** — soft-data figures carry `data-soft="true"` and attribution; a
  `soft`-less run.json renders coverage notices in `#steering-map` and the
  precision panel instead of numbers.
- **LT23** — every coverage marker in the fixture run.json is rendered under
  `#coverage`.

Robustness (LT28–LT29):

- **LT28** — leakage sentinel: a fixture transcript containing a sentinel
  secret (env-style value) and a sentinel verbatim prompt sentence produces
  a run.json and dashboard in which neither sentinel appears; every
  committed soft string is ≤ 500 characters, has passed the redaction pass,
  and contains no ≥ 12-consecutive-word verbatim substring of any correlated
  user message (NF4).
- **LT29** — seam failure: a `--gh-cmd` that exits non-zero and an
  `--llm-cmd` that returns invalid JSON (and one that times out) each yield
  a schema-valid run.json carrying `github.error` / `llm.error:<kind>`
  markers, exit 0, and no fabricated values.

Docs, inventory, dogfood (LT24–LT27):

- **LT24** — a structural doc test asserts each mandated sdlc SKILL.md hook
  step contains `record-run-event.sh` and its event-type token (run start,
  phase entries, gate approvals, panel dispatch/consolidation,
  lifecycle-check, PR open, fix wave) and that the dispatch step contains
  the skill-relative `harvest-panel.sh` token; sdlc-retro SKILL.md names
  collect and render invocations skill-relatively (FS12 forms).
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
  run store. Mechanism, not aspiration: every committed soft string passes a
  deterministic redaction pass (environment-value redaction per the PV2
  `buildRedactionValues` precedent), is capped at 500 characters, and is
  rejected (replaced by a coverage-marked omission) if it contains a ≥
  12-consecutive-word verbatim substring of any correlated user message — a
  deterministic n-gram containment check in `collect`, since redaction alone
  cannot stop an LLM reproducing prompt text; steering entries carry no user
  text at all (§6.2). LT28 is the gate.

## 12. Migration

None for existing consumers: every surface is new and opt-in; FS5 CLIs gain
only additive optional flags; `check-lifecycle`, FS8 status, FS9 checker,
FS10 setup, FS11 inventory semantics, and FS12 path rules are unchanged.
Uninstrumented historical runs are out of scope; the dogfood retro documents
partial coverage as the expected shape for mid-adoption runs.
