# Build plan: sandboxed e2e integration harness (L1 + L2)

- Date: 2026-07-17
- Track: **reversible**; slug `e2e-integration-harness`
- Sources: `docs/plans/2026-07-17-e2e-integration-harness.md` (rev 2);
  advisory panel `docs/reviews/plan-review-e2e-integration-harness-2026-07-17/`
- Sequencing: **implementation starts after PR #92 (schemaVersion 3) merges**;
  this worktree branches off pre-#92 main and rebases onto merged main at
  T1 start. Until then this build plan is the committed breakdown only.
- Tracker: the epic + sub-issue/board publish happens **at implement-start**
  (when #92 has merged and the stream is unblocked), not now — there is no
  resumability value in a blocked epic for a stream that cannot begin. Board
  is project 5.

## Definition of done (stream)

The plan's DoD 1–8: `npm run test:e2e` stages+installs pi-sdlc, runs L1 + the
six L2 scenarios (A–E, G) + the shared negative control, deterministic across
two fresh-sandbox runs (manifest byte-compare), isolation guards observed,
install-root fidelity, anti-vacuity proven, CI `e2e` job green with the
T1-measured timeout, pi pinned. No change to the sdlc skill/scripts/schema.

Portable checks (this repo): `node --test`, `node --check`, `npx biome check`
on edited files, and the harness's own `npm run test:e2e`.

## T1 — harness core + staging/install + verification spike (no deps)

- **Files:** `test/e2e/harness.mjs`, `package.json` (exact `pi`
  devDependency pin + `test:e2e` script), `test/e2e/README.md` (skeleton),
  `test/e2e/SPIKE.md` (recorded findings).
- **Work:** sandbox construction per plan decision 4 — allowlist-constructed
  child env, `HOME` → fresh scratch, `PI_OFFLINE=1`, fabricated `auth.json`,
  credential denial list + glob catch-all + `PI_E2E_ALLOW_*` escape hatch
  (refuse-to-start on hit), scratch git consumer repo, teardown no-write
  scan; package **staging** (copy checkout → scratch install root) +
  `pi install <staged> -l` (decision 7); pinned-pi invocation helpers;
  session-JSONL/transcript readers; the **post-exit assertion phase**
  (must-match/must-not-match over session record + file effects); the
  **normalized run-manifest** emitter (ordered steps, tool calls, markers,
  file hashes; volatile fields stripped). **Spike (blocks the rest):** verify
  against the pinned pi — local-path install + discovery, `-e` provider
  registration (models + apiKey requirements), headless `-p`, and
  **settings-level project trust without a TTY**; measure a one-L1 +
  one-L2-skeleton baseline wall-clock → record it in SPIKE.md and set the CI
  job timeout from it.
- **DoD refs:** plan DoD 2 (manifest), 3 (isolation), 4 (staging), 7/8
  (pin/timeout basis). Risks: headless-trust, pi API drift.
- **Checks:** `node --check test/e2e/harness.mjs`; `npx biome check
  test/e2e/`; the spike commands recorded as reproducible in SPIKE.md.

## T2 — L1 install/discovery + CLI conformance (depends on T1)

- **Files:** `test/e2e/l1.mjs` (+ helpers).
- **Work:** `pi install` + discovery assertions (`pi list`, skill +
  `/setup-sdlc` template present); script conformance through **install-root
  paths** — setup presets solo/standard/full fresh writes, preset-patch +
  override guard, the four `sdlc-status` states, older-v2 honest refusal
  (remedy names re-run/pin, never "migration"), `check-lifecycle` body mode
  against committed artifacts.
- **DoD refs:** plan DoD 4 (install-root fidelity), and the L1 half of DoD 1.
- **Checks:** `npm run test:e2e -- --scenario l1`; `npx biome check`.

## T3 — puppet provider + scenario format + anti-vacuity (depends on T1)

- **Files:** `test/e2e/puppet/` (the `pi -e` extension registering provider
  `puppet` with a full zero-cost model declaration + dummy key; the local
  `openai-completions` server), `test/e2e/scenario-format.mjs`.
- **Work:** ordered in-loop steps (trigger regex → canned assistant
  turn/tool call, multi-turn tool-call loops) **plus** post-exit assertions;
  the **sentinel gate** (server refuses to unlock steps until it observes a
  pinned installed-`SKILL.md` sentence in the request stream) and the
  **shared negative control** (skill removed / sentinel mutated ⇒ every
  scenario must fail).
- **DoD refs:** plan DoD 5 (anti-vacuity), decisions 5/6.
- **Checks:** a self-test that the negative control fails as required;
  `node --check`; `npx biome check`.

## T4 — scenarios A–E, G (depends on T3)

- **Files:** `test/e2e/scenarios/{a,b,c,d,e,g}.mjs`.
- **Work:** author each per plan scope item 4, each with its negative twin —
  A (unadopted → announce absent), B (solo vs full design-gate delta via
  ordered effects incl. the multi-turn `resolve-panel plan_review` bash
  call), C (v2 → not-ready, "migration" absent), D (`review.tasks` self vs
  subagent validator-dispatch delta; `task_validate` self-refusal per #92
  M1), E (`publishToTracker` 2 vs never via the logging `gh` stub), G (exact
  `[sdlc hook] implement:before use=…/result:` lines correctly ordered
  around the hook tool call and first write).
- **DoD refs:** plan DoD 6 (markers + negative twins), the L2 half of DoD 1.
- **Checks:** `npm run test:e2e`; `npx biome check`.

## T5 — CI wiring + README + determinism (depends on T2, T4)

- **Files:** `.github/workflows/*.yml` (add the `e2e` job), `test/e2e/README.md`
  (complete), `package.json` (`test:e2e` finalised).
- **Work:** separate `e2e` job on PR + main running two full fresh-sandbox
  runs + manifest byte-compare + the T1-measured job timeout; README
  documents the claim ladder, scenario authoring, sentinel/negative-control,
  container variant, pi-bump procedure.
- **DoD refs:** plan DoD 1, 2, 7, 8.
- **Checks:** the `e2e` job green on this stream's PR; `npx biome check`;
  local `npm run test:e2e` twice → identical manifests.

## Cross-cutting close-out

- Rebase onto merged main (v3) before T1 code lands; re-verify the spike
  against the merged tree.
- Publish the tracker epic + 5 sub-issues (T1–T5) + board at implement-start.
- Per-task validation: the harness scenarios themselves are the deterministic
  evidence; PV1 manifests per task where the repo's committed validator
  config requires them at implement time.
