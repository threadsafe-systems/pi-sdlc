# Build plan: sandboxed e2e integration harness (L1 + L2)

- Date: 2026-07-17 (rev 2 — incorporates all 13 findings of the
  owner-requested build-plan advisory,
  `docs/reviews/build-review-e2e-integration-harness-2026-07-17/consolidated.md`;
  no dismissals)
- Track: **reversible**; slug `e2e-integration-harness`
- Sources: `docs/plans/2026-07-17-e2e-integration-harness.md` (rev 2);
  plan advisory `docs/reviews/plan-review-e2e-integration-harness-2026-07-17/`
- Sequencing: **T1+ implementation starts after PR #92 (schemaVersion 3)
  merges**; this worktree branches off pre-#92 main and rebases onto merged
  main before T1 code lands. **T0 (spike) can run now** against pinned pi.
- Tracker (B3): the epic + T0–T5 sub-issues + board (project 5) are
  published **on commit of this build plan**, with the epic marked
  blocked-on-#92 — not deferred to implement-start.

## Definition of done (stream)

Plan DoD 1–8, plus the rev-2 hardening: anti-vacuity sentinel + negative
control, install-root staging, normalized run-manifest determinism
(source-order tool calls), observed-isolation guards with a self-test, the
`e2e` status check emitted on PR + main. No change to the sdlc
skill/scripts/schema. Every task carries a committed **PV1 manifest**
(`docs/validation/e2e-integration-harness/t*.json`) with exact argv +
category dispositions + owned-scenario mapping, and a validator receipt (B4).

Portable checks: `node --test`, `node --check`, `npx biome check`, and the
harness `npm run test:e2e`.

## T0 — verification spike (gating; runnable now) (B2)

- **Files:** `test/e2e/SPIKE.md`, a throwaway `test/e2e/spike.mjs`.
- **Work:** against the **pinned** pi, prove with exact argv + pass/fail
  assertions (nonzero exit on failure): (1) stage a package copy + `pi
  install <staged> -l` and assert discovery of the skill + `/setup-sdlc`
  template under the install root (`pi list`); (2) headless project trust —
  scratch global `~/.pi/agent/settings.json` with
  `defaultProjectTrust: "always"` (and/or `--approve`) makes `-p` actually
  load the project package (assert the skill is present in a `-p` run, absent
  without trust) (B1); (3) `-e` puppet extension registers provider `puppet`
  with a zero-cost `models` entry + dummy `apiKey`, selectable via
  `--provider puppet --model <id>` (B1/E9); (4) a headless `-p` round-trip
  reaches the local server and completes a tool loop; (5) a per-operation
  baseline wall-clock (single L1 op, single L2 skeleton turn).
- **Output:** SPIKE.md records commands, results, the per-op benchmark, and
  an explicit **go/no-go against each ratified plan decision** (halt + re-plan
  if any is falsified — Otto-gotcha guard).
- **Checks:** `node test/e2e/spike.mjs` exits 0; SPIKE.md committed with the
  benchmark and go/no-go table.

## T1 — harness core + staging/install (depends on T0)

- **Files:** `test/e2e/harness.mjs`, `package.json` (exact `pi` devDependency
  pin), `package-lock.json` (B7), `test/e2e/README.md` (skeleton).
- **Work:** sandbox construction using T0's confirmed findings —
  allowlist-constructed child env, `HOME` → fresh scratch **with
  `defaultProjectTrust: "always"`** (B1), `PI_OFFLINE=1`, fabricated
  `auth.json`, credential denial list + glob catch-all + `PI_E2E_ALLOW_*`
  escape hatch (refuse-to-start on hit), scratch git consumer repo, teardown
  no-write scan, a PATH without `gh`; package staging + `pi install <staged>
  -l`; pinned-pi invocation helpers; session-JSONL/transcript readers; the
  post-exit assertion phase (must-match/must-not-match); the normalized
  run-manifest emitter (ordered steps, **tool calls in assistant source
  order** — not completion order (B13) — markers, file hashes; volatile
  fields stripped). Include a **guard self-test** (B8): inject one var per
  denial class + a glob hit + a permitted escape, probe `command -v gh`,
  attempt an out-of-root write; assert refusal/scan failure.
- **DoD refs:** plan DoD 2, 3, 4; decision 7. **Checks:** `node --check
  test/e2e/harness.mjs`; `npm ci` succeeds with the new lockfile; `npx biome
  check test/e2e/`; the guard self-test exits nonzero on each injected breach.

## T2 — L1 install/discovery + CLI conformance (depends on T1)

- **Files:** `test/e2e/l1.mjs`.
- **Work:** `pi install` + discovery assertions through **install-root
  paths**; setup presets solo/standard/full fresh writes; preset-patch +
  override guard; the four `sdlc-status` states; older-v2 honest refusal
  (remedy names re-run/pin, never "migration"); `check-lifecycle` body mode
  against committed artifacts; **and the `onShortfall` proceed/fail shortfall
  behaviour re-checked through install-root paths (B12)**.
- **DoD refs:** plan DoD 4 + the L1 half of DoD 1. **Checks:**
  `npm run test:e2e -- --scenario l1`; `npx biome check`.

## T3 — puppet provider + scenario format + anti-vacuity (depends on T1)

- **Files:** `test/e2e/puppet/` (the `pi -e` extension per T0's confirmed
  shape; local `openai-completions` server), `test/e2e/scenario-format.mjs`.
- **Work:** ordered in-loop steps (trigger regex → canned turn/tool call,
  multi-turn; **≤1 tool call per assistant turn unless the manifest
  normalizes by source order** (B13)) + post-exit assertions; the **sentinel
  gate** (refuse to unlock steps until an installed-`SKILL.md` sentinel is
  observed in the request stream) and the **shared negative control** (skill
  removed / sentinel mutated ⇒ every scenario fails).
- **DoD refs:** plan DoD 5; decisions 5/6. **Checks:** negative-control
  self-test fails as required; `node --check`; `npx biome check`.

## T4 — scenarios A–E, G (depends on T3)

- **Files:** `test/e2e/scenarios/{a,b,c,d,e,g}.mjs`.
- **Work:** each with its negative twin and full canonical acceptance (B9):
  - **A** unadopted → announce absent **and** setup/advisory offered.
  - **B** solo vs full design-gate delta via ordered effects (multi-turn
    `resolve-panel plan_review` bash call under full; blocked at human gate
    under solo) **and** brainstorm gate on/off.
  - **C** v2 → not-ready, "migration" absent, **and** agent refuses to enter
    phases (no phase/tool effects).
  - **D** `review.tasks` self vs subagent validator-dispatch delta;
    `task_validate` self-refusal (per #92 M1).
  - **E** `publishToTracker` 2 vs never via the logging `gh` stub (attempt
    logged vs none).
  - **G** the **exact** hook contract (B10): literal
    `[sdlc hook] implement:before use=<use> do=<first 80 chars>` before the
    hook tool call, the exact `result: ok` line after, ordered before the
    first write; negative twin: **no hook configured ⇒ no `[sdlc hook]`
    lines**.
- **DoD refs:** plan DoD 6 + the L2 half of DoD 1. **Checks:**
  `npm run test:e2e`; `npx biome check`.

## T5 — CI wiring + README + determinism (depends on T2, T4)

- **Files:** `.github/workflows/ci.yml` (or a new `e2e.yml`),
  `test/e2e/README.md` (complete), `package.json` (`test:e2e` final).
- **Work:** an `e2e` job triggered on **`pull_request` and `push:
  branches:[main]`** (B6) running two full fresh-sandbox runs + manifest
  byte-compare; **measure the real two-run workload and set the job timeout
  via a declared headroom formula, asserting configured timeout > measured
  bound** (B5); README documents the claim ladder, scenario authoring,
  sentinel/negative-control, container variant, pi-bump procedure. Branch
  protection to make the check merge-blocking is a **repo-admin action**,
  noted in the README, not a code deliverable (B6).
- **DoD refs:** plan DoD 1, 2, 7, 8. **Checks:** the `e2e` job green on this
  PR; `npx biome check`; local `npm run test:e2e` twice → identical
  manifests.

## Cross-cutting close-out (with checks — B13/sonnet#7)

- Rebase onto merged main (v3) before T1 code lands.
- **Post-#92 config-drift gate (B11):** after rebase, diff
  `skills/sdlc/schema/sdlc.config.schema.json` and the exact remedy/refusal
  strings + config field paths the scenarios assert (`review.tasks`, the v2
  refusal remedy) against the pre-rebase snapshot; fail loudly on any diff
  touching an asserted field/string, and reconcile before T2/T4 land.
- PV1 manifests `t0.json`–`t5.json` committed with validator receipts (B4).
- **Checks:** SPIKE.md commands re-run and re-recorded against merged main;
  the config-drift diff attached to the PR shows no unreconciled change;
  `verify-task-receipt` passes for each task.
