# Plan: lifecycle telemetry and post-mortem dashboard (sdlc-retro)

- Date: 2026-07-17
- Track: **irreversible**. This freezes two stored-record shapes downstream
  tooling binds to: the run-manifest event schema (`events.jsonl` under
  `.pi/sdlc/runs/`) and the distilled `run.json` retro record committed to
  `docs/retros/`. The HTML dashboard itself is reversible and iterates freely
  behind them.
- Slug: `sdlc-lifecycle-telemetry`
- Author vendor: anthropic
- Brainstorm gate: design approved by Neil Chambers on 2026-07-17 (dialogue
  mode; decisions recorded under Constraints below).
- Plan panel: round 1 adjudicated 2026-07-17, zero surviving high/medium —
  `docs/reviews/plan-sdlc-lifecycle-telemetry-2026-07-17/consolidated.md`
  (this is revision 2: rev 2 incorporated all 11 findings F1–F11; none
  dismissed).
- Human gate: Plan rev 2 approved by Neil Chambers on 2026-07-17 (round-2
  verification pass waived; all round-1 findings incorporated, none
  disputed).

## Objective

Make every lifecycle run measurable and reviewable after the fact: while a
feature moves brainstorm → plan → spec → build → implement → PR, the skill's
own inflection points record hard telemetry (phases, gates, panels, models,
tokens, cost, human interventions) into a durable run store; afterwards, a
collector distils one schema-versioned `run.json` and a deterministic renderer
produces a self-contained single-scroll HTML **dashboard** that shows at a
glance where time and money went, which models earned their panel seats, where
human steering was needed (and where it shouldn't have been), and what got
reworked. Over a corpus of runs this becomes the evidence base for changing
skills, prompts, and model choices — we cannot improve what we do not measure,
and today we infer what we could be recording.

## Required outcomes

### R1 — A run manifest records lifecycle events as they happen

Every sdlc-driven feature gets an append-only, schema-versioned event log at
`.pi/sdlc/runs/<slug>/events.jsonl` (local, git-ignored). One shared emitter
(house `.sh` + `.mjs` pattern, e.g. `record-run-event`) is the single write
path; nothing writes the file directly.

- **Auto-emitted** events: panel resolution/dispatch (`resolve-panel` /
  `ensure-panel-agent` gain emission as a side effect) and task validation
  results (`validate-task`). Scripts that already run at inflection points do
  the recording — no new agent discipline required for these.
  `check-lifecycle` is **not** touched: it stays read-only per FS9 (ADR
  0017); its telemetry is caller-emitted (prose-emitted, below).
- **Run identity contract**: every event needs a `slug`; the emitter resolves
  it from, in order, an explicit `--slug` flag, the `SDLC_RUN_SLUG`
  environment variable, then the current feature-branch-name mapping. If none
  resolves, emission is **skipped** with a prefixed stderr warning — an
  honest coverage gap, never a guessed attribution. The touched FS5 CLIs gain
  only **additive optional flags/env**; their existing flags, stdout, and
  exit contracts are unchanged, and the ADR records the additive change.
- **Emission channel**: events append only to the run-store file; emitter
  diagnostics go to stderr with a stable prefix. The primary **stdout of
  every touched CLI stays byte-identical** to today (FS5 consumers parse
  it).
- **Skill-prose-emitted** events: phase enter/exit, human gate approval (who,
  which artifact revision), artifact revision bumps, backward moves, PR
  opened/fix-wave, lifecycle-check runs (caller-side, preserving FS9
  read-only). SKILL.md's phase and gate steps name the exact emitter
  invocation so the orchestrating agent runs it as part of the existing
  ceremony.
- Event grammar is minimal and additive-only: `schemaVersion`, `ts`, `slug`,
  `event`, plus a small per-event payload (the Specification pins the v1
  event vocabulary and payloads). Unknown event types are legal and ignored
  by consumers.
- Emission is **always-on** (it is not a flag someone remembers to set) and
  failure-soft: a failed emit warns and never blocks lifecycle work.

### R2 — Panel and subagent telemetry is harvested before it evaporates

Subagent runs currently live under the OS temp root and are lost on reboot;
per-model panel cost has been unrecoverable for every panel run to date.

- After each panel/validator dispatch, the dispatch step harvests the
  pi-subagents **v1 lifecycle artifacts** (`status.json`, `events.jsonl` —
  KB-sized; fields incl. `totalTokens`, `totalCost`, `model`/`modelAttempts`,
  `durationMs`, `turnCount`, `toolCount`) into
  `.pi/sdlc/runs/<slug>/panels/<phase>-<date>/`.
- Tiered retention: metadata always harvested; per-model finding files are
  already durable in `docs/reviews/` (no new capture); full child transcripts
  are optional forensic extras, local and prunable, never required by the
  collector.
- **No global repointing** of pi-subagents' run root: it is a machine-wide
  plugin serving other repos, the bulk is unneeded, and worktree cwds vary.
  Harvest-at-dispatch, scripted into the skill's dispatch step, is the
  mechanism.

### R3 — A collector distils one canonical, comparable run record

`collect` (house script pattern) joins, per slug: the run manifest (R1), the
harvested panel artifacts (R2), pi session transcripts (per-turn `usage`
tokens + dollar cost, model, provider, stopReason, timestamps; `model_change`
events), the committed review artifacts (`docs/reviews/` findings +
`consolidated.md` adjudications), and git/GitHub (branch life, fix waves, PR
threads) into **`run.json`**:

- `schemaVersion` from day one; evolution is additive-only; the migration
  policy is **regenerate from raw archives, never write migrators**. To make
  that honest, `collect` **snapshots every external input it reads** into the
  run store (`raw/` area) before distilling: the correlated session-transcript
  extracts, GitHub API responses, and raw LLM outputs — because parent
  sessions get pruned, GitHub threads mutate, and models change.
  Regeneration is defined **from the snapshot**; the raw store is retained
  indefinitely (it is small; the Specification pins the layout and what is
  extract vs verbatim).
- Size proxies for cross-run comparability from day one: scenario count, task
  count, diff stats, phase set, session count.
- Derived measures: per-phase wall time / agent time / human-wait (proxy,
  capped and labelled as such), per-model and per-phase token/dollar rollups,
  intervention counts by class, rework indicators (revision bumps, backward
  moves, PR fix waves).
- **LLM use is confined to collect time** and stored as data with model
  attribution: narrative phase summaries, user-turn steering classification
  (gate-approval | correction | scope-change | unblock | other), **and
  per-model panel precision** (findings incorporated ÷ raised) with
  cost-per-incorporated-finding — precision is classified from prose
  adjudications in `consolidated.md`, so it is soft, model-attributed data
  with coverage markers when unparseable, never presented as hard telemetry.
  A structured adjudication format that would harden it is recorded as a
  candidate evolution, not built here. Everything downstream is
  deterministic.
- Degrades gracefully: missing manifest events or lost panel harvests produce
  a run.json with explicit gaps (`coverage` markers), never fabricated
  numbers.

### R4 — A deterministic renderer produces the post-mortem dashboard

`render` consumes exactly one `run.json` and emits one **self-contained,
zero-dependency, single-scroll HTML dashboard** (sdlc-visual-docs precedent:
no LLM, no network, deterministic output):

- **Executive strip**: wall time, agent time, human-wait, total $, total
  tokens, models used, interventions, findings survived — the five-second
  hotspot answer.
- **Phase swimlane**: phases as lanes; sessions, panels, and human-wait as
  distinguishable blocks; backward moves drawn explicitly.
- **Cost breakdown**: $ and tokens by phase → activity → model (icicle or
  equivalent hierarchy), plus a phase → model flow view.
- **Panel deep-dive** per review round: model × finding matrix, cross-model
  agreement, per-model precision and cost-per-incorporated-finding.
- **Steering map**: classified intervention marks on the timeline.
- **Rework panel**: revision counts, fix waves, validator retries.
- Text (narratives, adjudication gists) is drill-down polish behind the
  visuals, not the primary surface.
- The renderer embeds **no generation-time values** (no render timestamps);
  rendering the same `run.json` twice under one renderer/Node version yields
  byte-identical output. Cross-version byte stability is not claimed.
- Committed artifacts: `docs/retros/<slug>/run.json` + the rendered HTML
  beside it. Raw stores stay local.

### R5 — A new skill packages the surface; the sdlc skill points at it

- New skill `skills/sdlc-retro/` (SKILL.md + scripts), following the house
  layout, documenting: the run store layout, the event vocabulary pointer,
  collect/render invocation, and the regenerate-don't-migrate policy.
- `skills/sdlc/SKILL.md` gains the instrumentation hooks where they belong
  (phase/gate/dispatch steps name the emitter and harvest calls) and a
  pointer to sdlc-retro for the post-mortem — no duplicated mechanics.
- Docs claim only what ships (normative-reference honesty, FS11 discipline):
  no claim of trend analytics, past-run reconstruction, or CI integration.
  Concretely: `skills/sdlc/assets/normative-references.json` is extended
  (additive; no FS11 schema/report-version bump) to cover every package-owned
  normative reference in `skills/sdlc-retro/*` and the new SKILL.md hook
  commands, and `check-references` passes with them inventoried.
- An ADR freezes the manifest event schema and run.json contract (FS
  numbering continues the existing sequence).
- This repo dogfoods immediately: this feature's own run is instrumented from
  the moment the emitter lands, and its (partial-coverage) retro is the first
  committed `docs/retros/<slug>/` artifact produced by the pipeline.

## Scope

### In

- The `record-run-event` emitter, v1 event vocabulary, run-identity
  resolution, run-store layout (incl. the `raw/` snapshot area), and
  `.gitignore` entry for `.pi/sdlc/runs/`.
- Emission side effects in `resolve-panel` / `ensure-panel-agent` /
  `validate-task` (additive optional flags/env only; frozen stdout/exit
  contracts untouched); skill-prose emitter steps in SKILL.md, including the
  caller-side lifecycle-check event.
- The additive FS11 normative-reference inventory extension for the new
  skill and hooks.
- Panel harvest step (scripted) and its tiered retention rules.
- `collect` (+ its LLM-assisted summarisation/classification, stored as
  data) and the `run.json` v1 schema with size proxies and coverage markers.
- `render` and the single-run dashboard with the sections in R4.
- `skills/sdlc-retro/` skill surface, SKILL.md hook edits, ADR, offline
  tests/fixtures for emitter, harvest, collector (fixture inputs), and
  renderer (golden-ish structural assertions, not pixel tests).

### Out

- The cross-run **trends/fleet dashboard** (v2; run.json carries size proxies
  and schemaVersion so it needs no schema change to arrive).
- Inference-based decks for **past, uninstrumented runs** (maybe-later;
  degraded coverage for the partially-instrumented dogfood run is the only
  concession).
- Any pi-subagents plugin change, global run-root repointing, or pi core
  transcript-format change.
- Schema migrators of any kind (regenerate policy instead).
- CI integration, readiness/`sdlc-status` changes, config schema (FS1/FS2)
  changes of any kind: **v1 hardcodes `.pi/sdlc/runs/` and `docs/retros/`**.
  Extending FS1 `paths` (which today is closed — `additionalProperties:
  false` plus a hardcoded key set in `lib.mjs`) is a possible future
  additive-looking-but-actually-surface change, explicitly not this round.
- Changes to `check-lifecycle` (stays read-only per FS9/ADR 0017) and any
  new structured adjudication format for `consolidated.md` (candidate
  evolution, recorded not built).
- Live network or paid-model calls in tests; renderer never calls a model.

### Sizing

Single-spec intent is affirmed: the spec is structured capture → distil →
render (R1+R2, R3, R4) with R5 cross-cutting. If the spec panel judges the
result oversized, the sanctioned split seam is R1+R2 (capture) vs R3+R4
(pipeline); Build owns task boundaries either way.

## Constraints and locked decisions (brainstorm, 2026-07-17)

- **Instrument, don't infer**: hard-recorded events beat transcript
  archaeology; v1 fully covers future runs only.
- **Telemetry homes**: raw manifest + harvests local and git-ignored under
  `.pi/sdlc/runs/`; distilled `run.json` + HTML committed under
  `docs/retros/<slug>/`. Dollar costs in committed files are accepted.
- **Dashboard, not slide deck** (the 2026-07-17 hand-built retro deck is
  precedent for content, not for form).
- **Always-on tiered harvest, no global repointing** (ratified after
  reviewing pi-subagents' stable v1 lifecycle artifact fields and
  per-invocation `sessionDir` override).
- **Pragmatism clause**: sole-user plugin today — `schemaVersion` +
  additive-only evolution + regenerate-from-raw is the whole versioning
  story; no migrators, no compatibility shims.
- LLM output is data (attributed, stored in run.json), never in the render
  path; render is deterministic and offline.
- House patterns hold: `.sh` + `.mjs` pairs, `lib.mjs` root/config
  resolution, exits 0/1/2, `--format text|json` where a CLI reports.

## Risks and dependencies

- **Prose-emitted events depend on agent discipline.** Phase/gate events are
  emitted because SKILL.md says so; a sloppy session skips them. Mitigation:
  auto-emit everything a script can own; collector marks gaps honestly
  (coverage markers) rather than guessing; the retro itself makes missing
  instrumentation visible, which is self-correcting pressure.
- **Session transcript format is pi-internal, not a contract.** The JSONL
  shape (verified 2026-07-17: per-message `usage` with token/cost breakdown,
  `model_change` events, `version: 3` header) can change upstream.
  Mitigation: collector sniffs the version, fails soft per-file, and the
  manifest — our own contract — carries the load-bearing events.
- **Session ↔ feature correlation.** Sessions are keyed by cwd (worktrees
  produce distinct session dirs) and interleave concerns. Mitigation: the
  manifest is the join spine (slug + timestamps + session ids where
  obtainable); the Specification pins the correlation rule and its failure
  mode.
- **Human-wait is a proxy.** Assistant-done → next-user-message gaps cannot
  distinguish deliberation from absence. Mitigation: cap, label as proxy,
  never present as precise; gate events carry explicit timestamps where
  prose emission happens.
- **LLM classification is soft data.** Steering tags and narratives are
  model-attributed opinions. Mitigation: stored distinctly from hard
  telemetry in run.json; renderer visually separates measured vs inferred.
- **Committed retro content leaks prompt text.** Narrative summaries derive
  from transcripts that may contain sensitive prose. Mitigation: summaries
  are gisted by design; raw transcripts never leave the local store; author
  reviews the committed retro like any other artifact.
- **Harvest timing.** Temp-root artifacts can vanish before harvest (reboot
  mid-run). Mitigation: harvest is part of the dispatch step itself, not a
  later chore.
- **Emission side effects touch FS5 frozen CLIs** whose stdout/exit contracts
  consumers bind to. Mitigation: events write only to the run-store file,
  diagnostics only to prefixed stderr, new flags/env strictly additive and
  optional; fixtures assert the primary stdout of each touched CLI is
  byte-identical with and without emission active.

## Definition of done

- [ ] Emitter appends schema-versioned events; a malformed emit exits
      non-zero without corrupting the log; concurrent appends do not
      interleave partial lines (fixture-tested).
- [ ] `resolve-panel`, `ensure-panel-agent`, and `validate-task` emit their
      events as side effects, fixture-verified offline; emission failure
      does not fail the primary command; each touched CLI's primary stdout is
      byte-identical with emission active vs inactive; an unresolvable slug
      skips emission with a prefixed stderr warning.
- [ ] SKILL.md names emitter invocations at phase enter, gate approval,
      lifecycle-check, and PR events; a structural doc-presence test asserts
      each mandated hook step contains the `record-run-event` token and its
      event-type token (exact prose wording is not pinned).
- [ ] `check-lifecycle` is byte-identical to main (read-only FS9 surface
      untouched).
- [ ] Panel harvest copies the v1 lifecycle artifacts into the run store;
      fixture covers a completed dispatch and a missing/aborted run dir
      (harvest reports, does not throw).
- [ ] `collect` produces a `run.json` from a complete fixture run store and
      from a gappy one (coverage markers present, no fabricated values);
      schema is validated by a committed JSON schema; size proxies and
      per-model rollups present.
- [ ] Every R3 source adapter has its own offline fixture and exact
      assertions: manifest events, harvested panel artifacts, session
      transcripts (a committed fixture transcript in the verified v3 shape),
      review artifacts, and git/GitHub via an injected fake seam — no live
      network in any test.
- [ ] Every derived-measure family is fixture-asserted against known-answer
      inputs: phase timing (incl. the capped human-wait proxy), token/dollar
      rollups, intervention counts, rework indicators, and panel precision.
- [ ] `collect` snapshots its external inputs into the run store's `raw/`
      area before distilling; a re-run against the snapshot alone reproduces
      the same run.json (regeneration fixture).
- [ ] Steering classification, narratives, and panel-precision figures appear
      in run.json as model-attributed **soft** data distinct from hard
      telemetry (the LLM seam is injectable and fixture-driven in tests); a
      fixture run.json without them still renders.
- [ ] `render` emits a single self-contained HTML file with the R4 sections
      from run.json alone, offline; rendering the same input twice under one
      renderer/Node version is byte-identical, and no generation-time value
      is embedded; structural assertions cover each section's presence and
      representative content.
- [ ] `docs/retros/<this-slug>/run.json` + HTML exist, generated by the
      pipeline from this feature's own (partial) run store, and are honest
      about coverage.
- [ ] `skills/sdlc-retro/SKILL.md` documents store layout, invocation, and
      regenerate policy; sdlc SKILL.md points at it; no doc claims trends,
      past-run reconstruction, or CI enforcement.
- [ ] ADR freezes the manifest event vocabulary and run.json v1 contract,
      and records the additive FS5 flag/env extension.
- [ ] The FS11 inventory covers every package-owned normative reference in
      `skills/sdlc-retro/*` and the new hooks; `check-references` passes;
      removing an inventoried new entry fails it.
- [ ] `.pi/sdlc/runs/` is git-ignored; no test performs network access or
      invokes a model; `npm test` and `npm run lint` pass.
- [ ] Plan, Spec, and PR panels reach zero surviving high/medium findings
      with recorded adjudication.

## Context for the Specification author

Observed reality (verified 2026-07-17):

- Session transcripts: `~/.pi/agent/sessions/<cwd-slug>/*.jsonl`, header
  `{"type":"session","version":3,...}`; assistant messages carry
  `message.usage` = `{input, output, cacheRead, cacheWrite, totalTokens,
  cost:{...,total}}` plus `model`, `provider`, `stopReason`; `model_change`
  and `thinking_level_change` are first-class events. Worktree cwds get their
  own session dirs.
- pi-subagents async runs: `<tmpdir>/pi-subagents-<scope>/`, stable
  `lifecycleArtifactVersion` 1 artifacts (`status.json`, `events.jsonl`) with
  `totalTokens`, `totalCost`, `model`/`attemptedModels`/`modelAttempts`,
  `durationMs`, `turnCount`, `toolCount`, `startedAt`/`endedAt`, per-step
  events; consumers are told to read these files and ignore unknown fields.
  The temp root is currently empty — historical panel cost is already lost.
- Review artifacts: `docs/reviews/<phase>-<feat>-<date>/` with one file per
  model, `prompt.md`, `consolidated.md` (adjudications recorded per finding).
  40+ existing directories; naming is consistent enough to parse.
- House script patterns: `skills/sdlc/scripts/*.sh` + `.mjs`, shared
  `lib.mjs` (`resolveRoot`), exits 0 PASS / 1 FAIL / 2 ERROR (ADR 0014
  style), `--format text|json` envelopes (FS8 style). Frozen surfaces run
  FS1–FS12 (ADRs 0016–0020 cover FS8–FS12); this feature continues the
  sequence.
- Config: `.pi/sdlc/sdlc.config.json` (`schemaVersion` 1, `paths` map).
  `paths` is a **closed** set — `additionalProperties: false`
  (`skills/sdlc/schema/sdlc.config.schema.json`) and a hardcoded key set in
  `lib.mjs` — so extending it is a surface change, not additive. **Decided at
  plan level: v1 hardcodes `.pi/sdlc/runs/` and `docs/retros/`; do not extend
  `paths`.**
- Precedents: `docs/retros/2026-07-17-config-versioning-lifecycle-retro.html`
  (hand-built slide deck — content precedent only);
  `~/.agents/skills/sdlc-visual-docs/` (deterministic zero-dep HTML render
  pipeline precedent).
- `.gitignore` currently covers `.pi/agents/` and `.pi-subagents/` but not
  `.pi/sdlc/runs/`.

The Specification must pin: the v1 event vocabulary and per-event payloads
(incl. which events are auto vs prose-emitted); the run-store directory
layout; the harvest step contract; the session↔slug correlation rule and its
failure mode; the `run.json` v1 schema (hard telemetry vs model-attributed
soft data, coverage markers, size proxies) with a committed JSON schema; the
renderer's input contract and per-section structural requirements; CLI
envelopes/exits for emitter, collect, and render; the `raw/` snapshot layout
and retention; the run-identity resolution order and its failure mode; the
FS11 inventory additions; and the SKILL.md hook steps (token-level, not
prose-level). It must not design the visual styling
(implementation freedom) or choose task boundaries (Build owns those).
