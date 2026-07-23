# Orchestration runtime prototype: build vs borrow (map #158, ticket #162)

**Date:** 2026-07-23
**Ticket:** threadsafe-systems/pi-sdlc#162 (map #158)
**Status:** Both spikes executed against one real phase. Recommendation at §6 — pending owner ratification on #162.
**Spike artifacts:** `docs/briefs/assets/2026-07-23-orchestration-runtime-prototype/` (runnable sources + captured run evidence)
**LLM spend:** ≈ $0.008 total (cheap-model roster, real diff, real provider chaos included free of charge)

## 1. Method

Both candidates were prototyped against the **same real phase**: a PR-review panel over a real
pi-sdlc diff (the 12-line `sdlc.config.json` hunk of `7621fe8`), roster resolved by the real
`resolve-panel.mjs` script seam from a spike-local config whose `pr_review` pool holds cheap fast
models (`deepseek-v4-flash`, `glm-5.2:low`, `haiku-4-5`), floor 2. Not simulated: real
`pi --mode json -p` children, real provider errors, real verdicts (the $0.001 panel found a
plausible high finding in the roster commit).

- **Build** (`orchestrator.mjs`, ~230 lines): thin headless node runner owning a durable run dir
  (`state.json` + `events.jsonl`), spawning per-reviewer pi children directly — the pattern
  pi-subagents' async artifacts already embody (`status.json`/`events.jsonl`/per-child logs).
- **Borrow** (`drive.mjs`, ~110 lines): `taskflow-core` 0.2.4 driven programmatically with
  pi-taskflow's real subagent runner (`createPiSubagentRunner`), host-synthesized flow def
  (parallel branches + approval), two modes: their headless semantics, and our injected
  `requestApproval` park.

Version note vs the brainstorm evidence comment: pi-taskflow 0.2.4 has since split into a thin pi
host + a host-neutral **`taskflow-core`** engine ("the seam that lets pi-taskflow run on pi,
Codex, …"), with a spawn-only `detached-runner.js`. The engine IS importable headless — several
disqualifiers below are therefore sharper than "it's session-bound", they are engine semantics.

## 2. Build spike — what actually happened (run evidence in assets)

One `advance` invocation of the thin runner, with a sabotage knob forcing one reviewer's first
attempt onto an invalid model id, produced this live sequence (`run2/events.jsonl`):

1. `panel.resolved` — roster `haiku-4-5` + `deepseek-v4-flash` (floor 2, pool remainder `glm-5.2:low`).
2. `haiku-4-5` attempt 1+2 both hit a **real, unplanned infra failure** — the Anthropic
   subscription's third-party usage pool was exhausted (`stopReason:"error"` inside a normal
   `agent_end`, **process exit 0**). Classified infra, retried once, then **substituted**:
   `reviewer.substituted → glm-5.2:low` — *while the deepseek child was still mid-flight*
   (per-child reaction, no barrier).
3. `deepseek` sabotaged attempt 1 classified infra (provider 400), retry-once succeeded:
   verdict PASS, $0.0011, 36s.
4. Consolidation (mechanical, zero-token), `ceremony.recommended` emitted with the #160
   evidence-cited block (verdicts, surviving findings, cost, wall time), run **parks** at
   `awaiting-ratification` and the process **exits 0**.
5. Later invocation `advance --decision approve` → `ceremony.ratified` (handoffId-joined pair)
   → `done`. No process lived across the gap.

A second run (`run3`) was **SIGKILL'd mid-panel** after reviewer 1 completed: on re-invoke, the
completed reviewer's verdict was preserved (exactly one `reviewer.started` for it across the whole
run), only the in-flight reviewer re-ran; the run then parked with 2 surviving high/medium
findings rendered into `ratification-request.md`. The `failed-shortfall` path (completed < floor)
was also exercised live in `run1`.

**Requirement coverage (all demonstrated, not designed):** non-blocking per-child supervision incl.
pool substitution; per-child model; monitored workers (per-attempt cost/duration/classification);
semantic infra-vs-verdict with retry-once; durable resume across kill; fully headless; parked—
never auto-decided—HITL; native emission of the #160 `ceremony.recommended`/`ceremony.ratified`
pair and per-reviewer harvest events (the FS13 `panelPrecision` starvation fixed structurally).

**Honest gaps the spike dodged** (the real cost of "build"): child process ownership — the
SIGKILL test **orphaned a live pi child** that kept running unsupervised (needs process-group
kill or reattach; both externals carry detached-control registries for exactly this); atomic
state writes; timeouts as an infra class; concurrency caps; wiring to the real FS13
`record-run-event` vocabulary and run store instead of spike-flavoured events; gate-block
rendering riding artifact approval (#160); tracker/verification integration. All mechanical;
none change the shape.

## 3. Borrow spike — what actually happened

**A1 (their headless semantics — deps without `requestApproval`):** the panel phase ran fine
through taskflow's own runner (both branches, $0.003, 141s wall). Then the approval phase
auto-rejected — `approval:{decision:"reject",auto:true}`, `gate:{verdict:"block"}` — and the run
finished `status:"blocked"`. Then, live:

> `forkRunForResume`: *"Run '…' has status 'blocked' and is not resumable (expected failed or paused)"*

`resume.js` declares blocked runs "immutable terminal history". So headless, **the human's
pending decision terminally strands the run**: the paid panel work is unrecoverable by resume (a
fresh run could only reuse it via the opt-in cross-run cache — cache-shaped recovery, not
resume-shaped, and `approval`/`gate` phases are hard-excluded from that cache).

**A2 (the wrap — our injected `requestApproval` parking on a decision file):** works; run
completed after `decision.json` appeared. But the park is an **in-memory awaited promise**: it
holds only while our long-lived driver process survives. If that process dies while parked, the
run persists as `status:"running"` — which is *also* not resumable (only `failed|paused` are).
A durable park means our persist wrapper forging `paused` into their state file — i.e. owning a
foreign engine's resume semantics from outside. At that point the borrow is taskflow-core as a
DAG library under our runner, our HITL seam, our persistence discipline — and the sdlc's phase
graph between human gates is small enough that the DAG is the trivial part.

**Structural constraints found in source while porting Sketch A:**

- `map` resolves **one agent for all items** (`resolveAgent(phase.agent, …)` — constant across
  the fan-out). The evidence comment's "map with per-item model" doesn't exist in 0.2.4.
- Per-child models need `parallel` with per-branch `agent` — but branches are **def-static**,
  and the roster is runtime data. So the host must resolve the roster and synthesize the def per
  run: roster dynamism (the interesting decision) lives outside the flow either way. Sketch A's
  `script → map` shape only works single-model.
- No substitution primitive: `retry` re-runs the same branch agent/model; `race` is
  first-success; panel semantics ("floor of N, draw replacements from pool") aren't expressible.
- Runtime-generated (`expand`/`flow{def}`) fragments are treated as untrusted (breadth caps,
  `script` denied) — correct hardening, but it forecloses the "generate the roster fan-out at
  runtime inside the flow" escape hatch for anything that also needs script seams.
- `pi` exits **0 on provider errors** (error lives in `agent_end.stopReason`) — so the semantic
  infra-vs-verdict classifier must be our code under either candidate, confirming the
  brainstorm's gap table.

## 4. Comparison against the ticket's requirement list

| #162 requirement | Build (thin runner) | Borrow (taskflow-core) |
|---|---|---|
| Non-blocking per-child supervision | Native: reaction in each child's settle handler; live substitution mid-flight | No primitive; map/parallel are barrier joins; per-item retry only |
| Parallel tasks, per-task model | Per-child spawn arg from roster/pool | Def-static branches; host synthesizes def per run |
| Monitored workers | Per-attempt events: cost, duration, classification | Phase-level usage; per-call detail only in trace-file format (couple to parse) |
| Infra-vs-verdict + retry-once | Semantic classifier (`stopReason`, verdict contract) + retry-once + substitution | `retry{max:1}` same-model; `expect` validates verdict shape; no substitution |
| Durable / resumable | Kill-tested; completed work preserved | Resume only `failed\|paused`; `blocked` (headless auto-reject) and `running` (crash while parked) both terminal |
| Headless | Plain node process, exits while parked | Engine importable, but approval semantics fight headlessness (A1) |
| HITL seam parks, never auto-decides | Park state + decision file across processes | Auto-reject is engine policy headless; wrap is process-lifetime-bound (A2) |
| Dependency risk | Zero new deps (node + pi CLI + existing scripts) | Two pre-1.0 single-author packages mid-refactor (0.2.4 just split core out) + a `@earendil-works/pi-coding-agent` import in the runner |
| Handoff/telemetry contracts (#160) | `events.jsonl` is ours; ceremony pair + harvest native | Would bolt onto their trace format; phase-level cost only |

**What borrow genuinely offers that build lacks** (for honesty): zero-token static verification
of the graph, budget ceilings, cross-run caching/incremental recompute, tournament/loop/race
machinery, saved reusable flows. None of these are #162 requirements; the sdlc's inter-gate
graphs are small, and the hard requirements are exactly the supervision semantics taskflow
doesn't model.

## 5. pi-subagents note

The "thin runner over pi-subagents" option was prototyped as *pattern*, not import: pi-subagents
ships TS-source extension code whose 3,833-line background runner is session-hosted, but its
artifact contract (per-run dir, `status.json`, `events.jsonl`, per-child output logs, detached
runner process, control channel) is precisely what the spike runner re-implemented in miniature —
and the spike confirmed the contract is sufficient for every #162 requirement. Borrowing the
*shape* while owning the code keeps the #160 branch-carried committed `events.jsonl` and FS13
vocabulary first-class instead of adapter-translated.

## 6. Recommendation (pending owner ratification)

**Build.** A ~230-line thin runner met every #162 requirement in one session with zero new
dependencies, on the same substrate both externals bottom out in (`pi --mode json -p`). The
decisive evidence is not effort but semantics: taskflow's HITL and persistence model
(auto-reject → blocked → non-resumable; park bound to process lifetime) is structurally opposed
to the ratified #160/#163 direction (parked gates riding a branch-carried run store, no live
process across the human gap), and its fan-out primitives cannot express per-child models,
per-child reaction, or pool substitution without the host doing that work anyway.

Carry forward as *borrowed ideas, not dependencies*: `expect`-style output contracts on
reviewer/worker children (verdict parsing was the flakiest part of the spike), zero-token
preflight verification of the run plan, budget ceilings per run (envelope bounds, #159), and
detached-control-style child process ownership (the orphan finding).

Scope consequence for the child stream that builds this: the runner is the small half; the
supervision policy (classification taxonomy, retry/substitute rules, shortfall behaviour,
park/resume protocol over the #160 run store) is the design center.

## 7. Reproduction

Assets dir contains `orchestrator.mjs` (build), `drive.mjs` (borrow), the spike config, subject
diff, and the captured `events.jsonl`/state/park logs for runs 1–3 and both borrow modes.
`orchestrator.mjs <dir> init && orchestrator.mjs <dir> advance [--decision …]`; sabotage via
`SPIKE_INFRA_FAIL_FIRST=<model-substring>`. `drive.mjs headless|park` (needs
`npm i pi-taskflow@0.2.4` + a link to the global pi-coding-agent). Both consume
`skills/sdlc/scripts/resolve-panel.mjs` unmodified.
