# Mechanical ceremony estimator — research brief

> Resolves map ticket [#161](https://github.com/threadsafe-systems/pi-sdlc/issues/161)
> (map [#158](https://github.com/threadsafe-systems/pi-sdlc/issues/158), "orchestrator-led
> SDLC with dynamic ceremony"). AFK research: how the estimator's inputs are computed
> mechanically, what calibration data already exists, prior art, and a proposed
> estimator contract for the handoff-artifact ticket (#160) to consume.
> Research artifact only — nothing here is ratified design.

## 1. What the estimator must produce

Ratified upstream (map #158): ceremony — steps, reviewer count/roster, worker count,
verifier count, model per role — is derived per-change from a
**complexity / verifiability / time-cost** estimation, **re-derived at every
handoff**, recommendation-only (human ratifies; ratifications become
judge-training material). The estimator is the mechanical core those
recommendations must cite as evidence.

A structural consequence found during this research: **per-handoff re-derivation is
not just governance — it is how the estimator's data improves.** At Brainstorm the
touch set is a guess; at Plan it is declared intent (named files/surfaces); at Build
it is per-task file lists; at Implement it is the actual diff. The same contract runs
at every gate with monotonically better inputs, so early recommendations are
banded/hedged and late ones are sharp. No single-point estimation problem needs
solving.

## 2. Input axes and their mechanical computation

### 2.1 Complexity — blast radius (+ change-shape metrics)

Three mechanisms, in portability order. sdlc is language-portable, so the
language-agnostic rungs are the contract; language-aware rungs are refinements.

| Rung | Mechanism | Portability | Availability |
|---|---|---|---|
| 1 | **Git co-change fan-out**: commits touching path P over a window; count distinct co-changed files (weighted by frequency). | Any language, zero deps | Now — pure git |
| 2 | **Kamei-style change-shape metrics** over the diff (or predicted touch set): NS/ND/NF (subsystems/dirs/files touched), LA/LD (lines), entropy (spread of change across files), NUC (prior changes to these files). | Any language, zero deps | Now — pure git |
| 3 | **Import-graph dependents** (true blast radius): who transitively depends on the touched modules. | Language-tooling-dependent | Partial — see below |

Evidence for rung 1, run against this repo (`skills/sdlc/scripts/lib.mjs`, 4-month
window): co-change set = `SKILL.md`, `setup-sdlc.mjs`, `sdlc.config.schema.json`,
`README.md`, plus 5 test files — which is exactly lib.mjs's real coupling surface.
Recipe (one loop, no tooling):

```bash
for c in $(git log --since="4 months ago" --pretty=%H -- <path>); do
  git show --name-only --pretty=format: $c
done | sort | uniq -c | sort -rn
```

Rung 3 status: pi-lens's `module_report` with `blastRadius: true` returns ranked
transitive dependents from its cached review graph (verified in-session against
lib.mjs — usedBy counts per symbol, `semantic.source: "review-graph"`). But it is a
**pi-session tool over a session-scoped cache**; the shipped `pi-lens-analyze` CLI
emits nothing usable headless (verified: no output, exit 0). Rung 3 is therefore an
*optional enrichment when the estimator runs inside a live pi session*, never a
dependency of the contract. Do not build the estimator on it.

**Timing:** rungs 1–2 need only a touch set, not a diff — at Plan/Build time compute
them over the *declared* touch set (co-change and NUC are history lookups; NS/ND/NF
count the declaration itself); at Implement/PR time recompute over the actual diff.
The declared-vs-actual delta is itself a signal (§5, gaming).

### 2.2 Protected ("frozen") surfaces

Finding: **frozen surfaces are not currently machine-readable across efforts.** The
only declaration is a hardcoded `FROZEN` array inside a per-branch test
(`test/frozen-surfaces.test.js`, ASD19) — correct for that effort's byte-identity
check, useless as an estimator input for the next effort.

Gap to fill (belongs to #159's envelope discussion): a durable, committed
**protected-surfaces manifest** — glob patterns + reason + weight, e.g.
`.pi/sdlc/protected-surfaces.json`. The estimator input is then mechanical:
`|touchSet ∩ manifest|` (weighted). This is a *law/bound* artifact in the
envelope framing: the manifest is static config that *survives*, precisely because
it is a fact about the repo, not a pre-baked judgment about ceremony.

Until a manifest exists, an honest fallback: paths matching the repo's own frozen
test (when present) + schema files + anything named in `panels.$comment`-class
governance blocks. Weak, and the brief recommends not bothering — add the manifest.

### 2.3 Verifiability class

Directly derivable from surfaces that already exist:

- **At Spec/Build:** every measurable outcome / scenario is supposed to map to
  named checks. Coverage ratio = scenarios with at least one named check command
  ÷ total scenarios. The Build plan's per-task check tables make this countable.
- **At Implement:** PV1 manifests (`task-validation-manifest.schema.json`) declare
  five categories (`tests`/`static`/`scenarios`/`standards`/`bannedPatterns`) each
  `required` or `n/a`-with-reason, plus per-scenario `checks` arrays. Class is
  computable per task: **mechanical** (all owned scenarios evidenced by required
  argv checks), **partial** (some `n/a`, some judgment residue), **judgment-only**
  (no runnable evidence — the "what if verification isn't mechanical" residue).

Estimator rule of thumb the corpus should eventually confirm: **review ceremony
scales inversely with mechanical verifiability** — a task whose every scenario is
runner-evidenced needs eyes on design intent only; a judgment-only task is where
independent verification (a second validator, or panel attention) earns its cost.

### 2.4 Time-cost

FS13 retro data (§3) already records per-phase wall time, per-model cost/tokens,
and human-wait. Prediction = size-proxy lookup against prior runs (nearest
neighbours on scenarios/tasks/diff size), not a model. With n=4 runs, banded
("this smells like a 2-day / ~$40 effort") is the honest resolution.

## 3. Calibration corpus — what FS13 already gives us

`skills/sdlc-retro/schema/run.schema.json` (v1) distills a run store into exactly
the fields a calibration loop needs:

| run.json field | Calibration use |
|---|---|
| `sizeProxies` (scenarios, tasks, diff files/insertions/deletions, sessions, phases) | The estimator's predicted complexity vs measured size |
| `hard.panels` + `panelPrecision` (per model: raised / incorporated / dismissed, per wave) | **Review-value signal**: a panel whose findings were largely dismissed was over-provisioned; high incorporated-rate models earn roster preference |
| `hard.rework` (fixWave, phaseBackward, artifactRevised) | **Under-provisioning signal**: backward transitions and long fix-wave tails after light review are the cost of missing ceremony |
| `hard.rollups.humanWaitMs` | The HITL tax — what parking a gate actually costs |
| `hard.totals` (cost, tokens, durationMs by phase/model) | Time-cost priors per phase per model |

Local corpus today: **4 run stores** (`operator-feedback-discipline`,
`review-gate-config-model`, `sdlc-question-discipline`, `sdlc-retro-panel-precision`)
plus Case's runs on the co-owned side. Too small to fit anything; sufficient to
sanity-check hand-set bands. Consequence: **the estimator starts rules-based with
hand-set thresholds; the corpus (grown by #160's ratification capture joined to
retro outcomes by slug) is what eventually trains the autonomous judge.** This
matches the ratified authority model exactly — the judge is out of scope until the
corpus can carry it.

## 4. Prior art

**JIT-SDP (just-in-time software defect prediction)** is the established framing:
score each *change* for risk at submission time from mechanical repository
features. Canonical: Kamei et al. 2013 ("A Large-Scale Empirical Study of
Just-in-Time Quality Assurance"), whose 14 change metrics group into diffusion
(NS, ND, NF, entropy), size (LA, LD, LT), purpose (FIX), history (NDEV, AGE, NUC),
and experience (EXP, REXP, SEXP) — every one derivable from git alone, which is
why §2.1's rungs 1–2 adopt them. Follow-on results that matter here:

- **Effort-aware ranking** (Kamei et al.; Liu et al. 2017 on churn): the goal is
  not "predict defects", it is "spend bounded inspection effort where it pays" —
  literally this estimator's job with reviewers instead of inspectors.
- **Size–defect relation is logarithmic** (Koru/Menzies): bands, not linear
  scalars, are the defensible output resolution.
- **Simple mechanical features perform near ceiling; models drift across repos
  and time** (CSUR 2022 survey): per-repo calibration with periodic refresh, not
  shared weights.
- Refactoring-vs-feature discrimination (2025, arXiv 2507.19714): purpose
  classification changes risk materially — the `track` declaration and plan intent
  already give us a better-than-inferred purpose signal.

Sources: damevski.github.io/files/report_CSUR_2022.pdf; researchgate.net/publication/260648765;
doi 10.1109/esem.2017.8; journals.plos.org/plosone 10.1371/journal.pone.0211359;
arxiv.org/html/2507.19714v1.

## 5. Failure modes

- **Gaming / self-serving under-declaration**: an orchestrator that understates the
  Plan touch set gets light ceremony. Mitigation is structural, already ratified:
  re-derivation at every handoff means the *actual* diff re-prices ceremony at
  Implement/PR regardless of what Plan declared, and the declared-vs-actual delta
  is recorded — a large delta is itself evidence for the retro-audit and the
  human's eye.
- **Drift**: hand-set bands rot as the repo and model landscape change. The FS13
  loop is the refresh mechanism; re-check bands per retro, not per effort.
- **Small-corpus overfitting**: n=4. No learned weights until the corpus is
  meaningfully larger; rules + human ratification are the current design *on
  purpose*.
- **False precision**: emitting `complexity: 7.3` invites misplaced trust. Bands
  (S/M/L/XL) with the contributing evidence lines attached.

## 6. Proposed estimator contract (input for #160)

Deterministic script, sibling to `resolve-panel` — working name
`estimate-ceremony.mjs`. **Zero-LLM core**: computes features and a banded
suggestion; the orchestrating agent composes its recommendation *citing the
script's output*; the human ratifies (authority model as ratified on #158).

**Inputs** (per handoff):

```jsonc
{
  "phase": "plan",                     // the gate being exited
  "track": "irreversible",
  "touchSet": { "kind": "declared" | "actual", "paths": ["..."] },
  "spec": { "scenarios": 12, "checkedScenarios": 10 },   // when spec/build exists
  "pv1": { "perTask": [ { "taskId": "t1", "class": "mechanical" } ] }, // when manifests exist
  "protectedSurfaces": ".pi/sdlc/protected-surfaces.json" // manifest path (gap: §2.2)
}
```

**Computed features**: co-change fan-out, NS/ND/NF/LA/LD/entropy/NUC over the
touch set (git), protected-surface intersection count, verifiability class +
coverage ratio, nearest-neighbour time-cost band from local run.json corpus,
declared-vs-actual delta when both exist.

**Output** (evidence-first; every line cites its feature):

```jsonc
{
  "band": "S" | "M" | "L" | "XL",
  "verifiability": "mechanical" | "partial" | "judgment-only",
  "evidence": [ { "claim": "...", "feature": "coChangeFanout", "value": 9 } ],
  "suggestion": {                       // suggestion, never decision
    "collapse": ["spec"],               // phases the band justifies skipping
    "panel":   { "size": 1 },           // count only; roster stays resolve-panel's job
    "producerModelClass": "fast" | "strong" | "frontier",
    "verification": "runner-only" | "runner+validator" | "runner+independent-eyes"
  }
}
```

**Boundaries**: roster selection stays in `resolve-panel` (credentialed, deduped,
author-excluded — solved). Model-class → concrete model mapping stays in the
envelope's allowlist (#159). The script never reads ratification history — the
*judge* eventually does; keeping the mechanical core history-free keeps it
falsifiable.

**Non-goals now**: learned weights, cross-repo calibration, rung-3 graph
dependency, any LLM call inside the estimator.

## 7. Handed to other tickets

- **#159 (envelope)**: protected-surfaces manifest as a surviving static *law*
  artifact; model-class→allowlist mapping; whether bands may auto-decide anything
  on the reversible track or always recommend.
- **#160 (handoff artifact)**: the contract in §6 is the proposed `estimate`
  block of the handoff; ratification capture should record the full estimator
  output + the human's decision + (later, via retro join on slug) the outcome.
- **#163 (headless HITL)**: `humanWaitMs` is already measured — the parking-cost
  baseline exists.
- **Map fog, still fog**: non-mechanical verification residue (this brief names
  the *class* mechanically but not what to do about judgment-only tasks beyond
  "more eyes"); band thresholds themselves (hand-set, retro-refreshed).
