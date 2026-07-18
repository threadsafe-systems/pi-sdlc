```sdlc
track: reversible
slug: e2e-integration-harness
```

## Summary

Adds a **sandboxed end-to-end integration harness** (`test/e2e/`) that proves the
full pi-sdlc adoption chain works from a clean machine state — install →
discovery → shipped-script conformance → a scripted-model session that obeys the
observable law — every run sandboxed and deterministic enough to block PRs.

Two PR-blocking claim levels:

- **L1 — install/discovery + CLI conformance.** A staged copy of the package is
  installed with `pi install <staged> -l`; the skill and `/setup-sdlc` template
  are discovered under the install root; and the shipped scripts behave per
  contract *through their install-root paths* — setup presets (solo/standard/
  full), preset-patch + override guard, the four `sdlc-status` states, the
  older-v2 honest refusal (remedy names re-run/pin, never "migration"),
  `check-lifecycle` body mode, and `onShortfall` proceed/fail.
- **L2 — puppet-model e2e.** A local scripted OpenAI-compatible server stands in
  for the model. An anti-vacuity **discovery + sentinel gate** means a scenario
  can only advance once pi genuinely surfaces the install-root `SKILL.md` and its
  body is read back — so L2 can never pass while discovery or skill loading is
  broken. Scenarios A–E and G assert real, config-driven tool results
  (`sdlc-status`, `resolve-panel`), pi's real tool-execution order, file effects,
  and the exact hook announce contract; a shared **negative control** locks every
  scenario under a mutated sentinel and with the skill removed.

Isolation is **observed, not confined**: an allowlist-constructed child env,
scratch `HOME`, `PI_OFFLINE=1`, a `gh` deny-stub, a credential denial list that
refuses to start on a hit, and a teardown no-write scan over the checkout source
tree. `pi` is pinned exactly to `0.80.10`. A new `e2e` CI job runs the suite plus
a two-run byte-identical **determinism** gate on PRs and `main`.

No change to the sdlc skill, scripts, schema, or prose.

## Governing documents

- Plan: `docs/plans/2026-07-17-e2e-integration-harness.md`
- Build plan: `docs/plans/2026-07-17-e2e-integration-harness-build.md`
- Reversible track: no Specification is required.

## Tracker references

- Epic: `#93`
- Tasks: `#94` (T0), `#95` (T1), `#96` (T2), `#97` (T3), `#98` (T4), `#99` (T5)
- Board: threadsafe-systems project 5

Closes #93
Closes #94
Closes #95
Closes #96
Closes #97
Closes #98
Closes #99

## Verification

- `npm run test:e2e` / `node test/e2e/run.mjs --determinism`: L1 + the six L2
  scenarios (A–E, G) + the shared negative control, twice from fresh sandboxes,
  byte-identical normalized manifests.
- `node test/e2e/harness.mjs --self-test`: all isolation guards fire.
- `npm test` (217 unit tests) and `npx biome check .` remain green.
- Note for reviewers: the suite must run from a clean environment
  (`env -i PATH="$PATH" HOME="$HOME" …`) because the harness deliberately refuses
  to start when ambient credentials are present.

## Branch protection (repo-admin follow-up)

Making the `e2e` status check merge-blocking is a repo-admin branch-protection
action, not a code change (documented in `test/e2e/README.md`).
