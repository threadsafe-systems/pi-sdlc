# Plan: sandboxed end-to-end integration harness (L1 + L2)

- Date: 2026-07-17 (rev 2 — incorporates 9 of 10 consolidated findings of the
  owner-requested advisory panel,
  `docs/reviews/plan-review-e2e-integration-harness-2026-07-17/consolidated.md`;
  E4 partially dismissed with reason there — scenario D matches PR #92's
  shipped behaviour; the spec-prose drift it surfaced is fixed on the #92
  branch)
- Track: **reversible** (test tooling and fixtures only; no frozen surface,
  no schema, no consumer-visible behaviour). Fast path: plan → build →
  implement → PR; human plan gate; the PR panel still runs.
- Brainstorm: plain dialogue, 2026-07-17 (this session), decision-ready.
  Grounded hinges (corrected per panel E9): `pi install <path> -l` adds a
  local package to project settings **without copying** (`packages.md`), so
  the harness installs a *staged copy*; a new provider needs `models` and an
  `apiKey` value (`custom-provider.md`), so the puppet ships a full zero-cost
  model declaration + dummy key; `-e` is per-run ephemeral and is the
  ratified loading path for the puppet extension.
- Sequencing: **starts after PR #92 (schemaVersion 3, IC-A) merges** — the
  scenario matrix asserts v3 semantics. Relates to IC-B: shared
  infrastructure, neither blocks the other.

## Objective

One command that, from a clean machine state, proves the full adoption chain
works: install pi-sdlc into pi from a staged copy of the local checkout →
skill and `/setup-sdlc` template discovered → setup drives a config → the
sdlc scripts behave correctly *through the install-root paths* → an agent
session (scripted model) obeys the observable law — with every run sandboxed
(no real credentials, no tracker mutations, offline pi) and deterministic
enough to block PRs.

## The claim ladder (binding design principle)

- **L1 — install/discovery + CLI conformance (PR-blocking):** the package
  installs from a staged copy, resources are discovered, and the shipped
  scripts behave per contract at their install-root locations. No model.
- **L2 — puppet-model e2e (PR-blocking):** the wiring — the installed skill
  demonstrably reaches the model request stream, tool calls execute, and
  transcripts contain/omit the SKILL's mandated mechanical markers. The
  "model" is a local scripted server; this proves plumbing, **not** agent
  judgment. Anti-vacuity is structural (see decision 5).
- **L3 — live smoke (OUT of this stream):** real cheap model,
  nightly/manual, judgment-adjacent claims. Follow-up once L1/L2 exist.

## Ratified decisions

1. **L2 asserts effects and mandated markers, never free prose.** Scenario
   scripts use *minimal* trigger regexes; assertions target tool/file
   effects and the SKILL's mechanically-mandated markers (exact announce
   string, exact `[sdlc hook] <phase>:<timing> …` use/result lines and
   their ordering, refusal-to-announce). Robust to SKILL rewording.
2. **Lives in this repo** at `test/e2e/` with its own CI job. Sibling
   foreign-consumer repo deferred; the harness generates a scratch consumer
   repo per scenario.
3. **pi is pinned** (exact version in `devDependencies`); pi-release drift
   lands as a reviewed bump commit, never ambient flake.
4. **Sandbox = enumerated observed guards in CI; container = confinement
   (optional, local).** The env sandbox provides: allowlisted child
   environment (constructed, not filtered), `HOME` redirected to scratch,
   `PI_OFFLINE=1`, fabricated `auth.json`, no `gh` on PATH (a logging stub
   where a scenario needs one), a **credential denial list** (at minimum
   `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_API_KEY`/`GEMINI_API_KEY`,
   `DEEPSEEK_API_KEY`, `ZAI_API_KEY`, `GITHUB_TOKEN`, `GH_TOKEN`, AWS
   credential vars, plus glob catch-alls `*_API_KEY`/`*_TOKEN`/`*_SECRET`,
   with an explicit `PI_E2E_ALLOW_<VAR>` escape hatch) — the harness refuses
   to start on a hit — and a teardown scan asserting no writes outside the
   scratch roots. The plan claims *observation*, not confinement; the
   provided `Dockerfile` (localhost-only network) is the confinement
   variant and CI does not require it. (Panel E1.)
5. **Anti-vacuity is a hard requirement of the puppet protocol** (panel
   E3): the server refuses to unlock any scenario's scripted steps until it
   has observed installed-skill content (a pinned sentinel from the
   installed `SKILL.md`) in the incoming request stream; and the harness
   runs a shared **negative control** — with the skill removed (and with
   the sentinel mutated), every scenario must FAIL. L2 can therefore never
   pass while discovery or skill loading is broken.
6. **Puppet loading + identity** (panel E6/E9): the extension is loaded per
   invocation via `pi -e test/e2e/puppet/` (never via the pi-sdlc package
   manifest — no production leak); it registers provider `puppet` with a
   full zero-cost model declaration and a dummy non-secret key, and every
   L2 invocation pins `--provider puppet --model <id>`.
7. **Install-root fidelity, not "pi-managed copy"** (panel E2): because
   local-path installs are by reference, the harness stages a copy of the
   package into a scratch install root, installs *that* with
   `pi install <staged-copy> -l`, and asserts every resource and script
   resolves under the install root — guarding the checkout-relative-path
   regression class without misstating pi's install semantics.

## Scope in

1. **Harness core** (`test/e2e/harness.mjs`): sandbox construction per
   decision 4 (fresh per run), package staging + install per decision 7,
   pinned-pi invocation helpers, session-JSONL/transcript readers,
   **post-exit assertion phase** (must-match / must-not-match over the
   session record and file effects — the mechanism for every negative
   assertion; panel E7), scenario runner with per-scenario isolation, a
   `--scenario` filter, and the **normalized run manifest** (ordered
   matched steps, tool calls, markers, file hashes; volatile fields —
   timestamps, UUIDs, absolute scratch paths — stripped) used by the
   determinism gate (panel E8).
2. **L1 suite**: install + discovery assertions (`pi list`, skill +
   `/setup-sdlc` template present); script conformance through install-root
   paths — setup presets (solo/standard/full fresh writes), preset-patch +
   override guard, the four `sdlc-status` states, older-v2-config honest
   refusal (remedy names re-run/pin, never migration), `check-lifecycle`
   body mode against committed artifacts.
3. **Puppet provider + scenario format**: the `pi -e` extension + local
   `openai-completions` server (decision 6); scenario format = ordered
   in-loop steps (trigger regex → canned assistant turn/tool call, with
   multi-turn tool-call loops) **plus** post-exit assertions (decision/E7);
   the anti-vacuity sentinel gate + shared negative control (decision 5).
4. **L2 scenarios** (the v3 behaviour-change net; each with at least one
   negative twin):
   - **A** unadopted repo → post-exit: announce string absent from the
     session; setup/advisory offered.
   - **B** solo vs full preset → design-gate delta expressed as **ordered
     effects** (panel E10): under full, the scripted flow reaches a
     `resolve-panel plan_review` bash call (multi-turn: trigger → bash tool
     call → trigger on its result); under solo, phase entry is blocked at
     the human gate and no resolve-panel call occurs. Brainstorm on/off
     asserted the same way (no free-prose assertions).
   - **C** committed v2 config → not-ready; agent refuses phases; remedy
     honest (post-exit: "migration" absent).
   - **D** `review.tasks: self` vs `subagent` → validator dispatch delta;
     `resolve-panel task_validate` refusal for `self` (matches #92's M1
     behaviour + test; spec prose aligned on the #92 branch).
   - **E** `shape.publishToTracker` `2` vs `"never"` → **L2 with the
     logging `gh` stub** (panel E5): threshold met ⇒ tracker attempt logged
     (and safely stubbed); `never` ⇒ no attempt logged.
   - **G** configured implement hook → the exact
     `[sdlc hook] implement:before use=… do=…` line before the hook
     executes and the exact `result: ok|failed` line after, correctly
     ordered relative to the hook's tool call and the first write.
   (F — onShortfall — stays L1-strength: script-level behaviour already
   unit-tested, re-checked through install-root paths.)
5. **CI wiring**: a separate `e2e` job (PR + main): two full runs from
   fresh sandboxes, manifest byte-compare between them, and a job timeout.
   The concrete runtime budget is **measured by the T1 spike** and then
   fixed in the DoD-enforcing job config (panel E10) — no guessed number.
6. **Docs**: `test/e2e/README.md` — claim ladder, scenario authoring, the
   negative-control and sentinel mechanism, container variant, pi-bump
   procedure.

## Scope out

- **L3 live smoke** (real model, secrets/budget) — follow-up stream.
- Sibling foreign-consumer repo; docker-required CI; Windows.
- Any change to the sdlc skill, scripts, schema, or prose (a harness-exposed
  defect is its own change on its own track).
- Performance/load; multi-version pi matrix (single pinned version).

## Definition of done (falsifiable)

1. `npm run test:e2e` from a clean checkout: stages, installs, runs L1 +
   the six L2 scenarios (A–E, G) + the shared negative control; exits 0;
   any failure exits 1 naming the scenario and assertion.
2. **Determinism:** two consecutive full runs, each from a fresh sandbox,
   produce byte-identical normalized run manifests (volatile fields
   stripped); CI enforces the comparison.
3. **Isolation (observed):** the harness refuses to start on any credential
   denial-list hit; the child env is allowlist-constructed with
   `PI_OFFLINE=1`; `gh` is absent or the logging stub; teardown fails the
   run on any write outside the scratch roots. (Confinement is the
   documented container variant, not a CI claim.)
4. **Install-root fidelity:** L1 resolves every script and resource under
   the staged install root, never the repo checkout.
5. **Anti-vacuity:** the negative control demonstrably fails every L2
   scenario when the skill is absent and when the sentinel is mutated; the
   puppet refuses to unlock steps without observing the sentinel.
6. Scenarios A–E, G assert exactly the markers/effects named in scope item
   4, each with a negative twin.
7. CI: the `e2e` job runs on PRs and main, is green on this stream's own
   PR, blocks merge like the unit job, and carries the T1-measured timeout.
8. pi pinned exactly; README documents the bump procedure.

## Risks

- **Puppet brittleness:** SKILL rewording can strand a trigger →
  per-step timeout fails loudly with the unmatched transcript; triggers stay
  minimal (decision 1); the sentinel is a single pinned sentence chosen for
  stability and updated consciously when the SKILL changes.
- **Headless project-trust:** pre-trusting the scratch repo from settings in
  `-p` mode is verified in T1 against the pinned pi before any scenario
  work; fall back to pi's documented non-interactive trust mechanism —
  verify, don't assume.
- **pi API drift:** pinned version; T1 verifies install, discovery, `-e`
  provider registration (models + key requirements), and `-p` mode against
  the pin. Known prior: published pi has diverged from its docs (Otto spike
  gotcha).
- **Runtime creep:** T1 measures the baseline; the job timeout enforces the
  measured budget; scenarios share staging where isolation allows.

## Context for the next agent (Build phase)

- Task seams (suggested): **T1** harness core + staging/install + pin +
  spike (trust, provider registration, `-p`, baseline timing → sets the CI
  timeout); **T2** L1 suite; **T3** puppet server + scenario format +
  sentinel/negative-control mechanism; **T4** scenarios A–E, G;
  **T5** CI wiring + README + determinism manifest compare. T2–T4 depend on
  T1; T4 depends on T3.
- Authoritative inputs: this plan (rev 2); the consolidated advisory review;
  pi docs (`packages.md`, `custom-provider.md`, `settings.md`,
  `sessions.md`, `containerization.md`); the v3 surfaces of PR #92
  (ICA1–ICA24 name the exact script behaviours L1 re-checks).
- The brainstorm dialogue's matrix is advisory; scope item 4 is canonical.
