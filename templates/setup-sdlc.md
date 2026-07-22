---
description: Adopt the pi-sdlc lifecycle in this repo (agent-led opt-in scaffolder)
---
Set this repository up to use the sdlc skill by writing its `.pi/sdlc/` manifest.
**Lead the conversation and explain before eliciting choices** — adoption
reduces to two owner decisions; everything else is defaulted and explained, not
presented as a jargon quiz.

This template can run before the `sdlc` skill has ever been loaded in this
session — do not assume `scripts/` is already grounded. First, find the `sdlc`
skill's own directory (the folder containing its `SKILL.md`) and resolve
`<skill-dir>` to that absolute path. Run every `scripts/...` command below as
`<skill-dir>/scripts/...`, with the session's working directory kept inside the
target repo so root resolution finds it.

## Explain first (teach these concepts before asking anything)

1. **The invariant kernel vs configurable scaffolding.** The lifecycle *law* —
   the phase sequence, the iron law (no skipping forward; backward always
   allowed), and the gates that must exist — is fixed and not configurable. What
   a repo configures is the *scaffolding*: which gates run and at what strength.
   Explain that distinction plainly.
2. **Tracks — the irreversible/reversible distinction.** An **irreversible**
   change freezes a shape others bind to (public interfaces, contracts, persisted
   schemas, wire formats); it runs the full brainstorm→plan→spec→build→implement→PR
   path with design panels. A **reversible** change (internal refactors, docs,
   tests, tooling) takes the fast path — no pre-PR design panel, but the PR panel
   still runs. `shape.defaultTrack` is the when-in-doubt track.
3. **What the two gate-dial axes mean in practice.** Each design/code gate is
   `{ validate, approve }`. `validate` = does an adversarial panel run before the
   artifact is presented? `panel` = yes (findings must be dispositioned); `skip` =
   no panel for this gate (an authored choice, not a bypass). `approve` = who
   adjudicates findings and advances the phase? `human` = a human owner; `agent` =
   the agent adjudicates and advances (no human gate; the disposition discipline
   still applies either way). Explain each in plain terms.
4. **The consequences of the other dials.** `shape.separateSpec` (a distinct Spec
   gate vs merging plan+spec into one gated artifact); `shape.publishToTracker`
   (the build-task count at which the breakdown is projected to an epic/board, or
   `never`); `review.tasks` (`subagent` = a validator subagent per task; `self` =
   you run the declared checks; `off` = no per-task validation); and
   `review.onShortfall` (`proceed` = best-effort when the panel roster falls short
   of the floor and surface it; `fail` = hard-fail below the floor).
5. **Adoption reduces to two owner decisions.** Everything above is defaulted;
   the only two choices the owner must actively make are the **designs gate
   (`review.design` = `<validate>/<approve>`)** and the **code gate
   (`review.code`)**. Frame the interview around those two compound choices
   (one prompt each), defaulting the rest and explaining what the defaults mean.

## Run the scaffolder

```bash
<skill-dir>/scripts/setup-sdlc.sh
```

For headless use, run `node <skill-dir>/scripts/setup-sdlc.mjs` (or the `.sh`
entry point). The interactive TTY fallback asks **at most the two core decisions
plus a final confirmation** (≤ 3 prompts); every other dial defaults to the
`standard` bundle. Every dial is also reachable **non-interactively by flag**, so
reducing the fallback removes no configurability:

```bash
<skill-dir>/scripts/setup-sdlc.sh \
  --review-design panel/human --review-code panel/human \
  --review-brainstorm human --review-tasks subagent --panel-size 2 \
  --on-shortfall fail --separate-spec true --publish-to-tracker 2 \
  --default-track irreversible \
  --prefix myproj --label-prefix myproj-sdlc \
  --announce "Using the sdlc skill to drive this change through its lifecycle."
```

Additional flags: `--preset solo|standard|full` (an answer bundle that expands
into explicit dials; never persisted), repeatable
`--override <track>:<dial>:<value>`, `--tracker-repo`/`--tracker-board-number`/
`--tracker-board-url`, `--hook-run`/`--hook-use` (you supply YOUR worktree
tool/skill name — pi-sdlc ships none), `--seed-panels`, `--with-ci-workflow`,
`--copy-prompts`, `--force`, `--yes`, `--format text|json`.

`run` hooks execute arbitrary shell commands with the agent's privileges from the
committed config; only commit hooks you trust (same boundary as `.pi/prompts`).

## Finish: explain what was written, then commit and verify

Setup writes both `.pi/sdlc/sdlc.config.json` (the authoritative manifest) **and**
`.pi/sdlc/CONFIG.md` (a generated companion that *explains* the effective shape;
JSON stays authoritative). Explain the generated `sdlc.config.json` back to the
user and point them at `CONFIG.md` for the behavioural summary. Then have them
**commit `.pi/sdlc/`** — adoption is the manifest blob in the current git `HEAD`,
and readiness also needs the committed `panels` roster. `CONFIG.md` is **not**
part of readiness — it is a generated explanation; startup warns and falls back to
authoritative JSON when it is missing or stale, and `sdlc-status` never checks it.
Verify with `<skill-dir>/scripts/sdlc-status.sh` in pi, or headlessly with
`node <skill-dir>/scripts/sdlc-status.mjs` (exit 0 = ready; exit 3 = adopted but
incomplete, for example uncommitted `.pi/sdlc/` files). Regenerate `CONFIG.md`
any time with `<skill-dir>/scripts/config-doc.sh write`.
