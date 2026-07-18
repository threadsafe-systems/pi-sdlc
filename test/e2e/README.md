# Sandboxed end-to-end integration harness

One command proves the full pi-sdlc adoption chain works from a clean machine
state: a staged copy of the package installs into pi, its resources are
discovered, the shipped scripts behave per contract at their install-root
locations, and a scripted-model session obeys the observable law — every run
sandboxed (no real credentials, no tracker mutations, offline pi) and
deterministic enough to block PRs.

```bash
# Full suite (L1 + L2 scenarios + shared negative control):
env -i PATH="$PATH" HOME="$HOME" npm run test:e2e
# With the two-run determinism gate (what CI runs):
env -i PATH="$PATH" HOME="$HOME" node test/e2e/run.mjs --determinism
# A single layer/scenario:
env -i PATH="$PATH" HOME="$HOME" node test/e2e/run.mjs --scenario l1
env -i PATH="$PATH" HOME="$HOME" node test/e2e/run.mjs --scenario B
```

The `env -i PATH="$PATH" HOME="$HOME"` prefix is how CI and local runs invoke the
suite: the harness **refuses to start** when the ambient environment contains a
credential on its denial list (see below), so it needs a clean environment.

## The claim ladder

- **L1 — install/discovery + CLI conformance (PR-blocking).** The package
  installs from a staged copy, resources are discovered, and the shipped scripts
  behave per contract at their install-root locations. No model. See `l1.mjs`.
- **L2 — puppet-model e2e (PR-blocking).** The installed skill demonstrably
  reaches the model request stream, tool calls execute against the real
  install-root scripts, and the assistant stream carries the SKILL's mandated
  mechanical markers in the right order. The "model" is a local scripted server
  (`puppet/`); this proves plumbing, **not** agent judgment. See `scenarios/`.
- **L3 — live smoke (out of scope here).** Real cheap model, nightly/manual.

## Files

| File | Role |
|---|---|
| `harness.mjs` | Sandbox construction, isolation guards, staging/install, pinned-pi invocation, transcript/effect readers, post-exit assertions, the normalized run-manifest emitter, the teardown no-write scan, and `--self-test`. |
| `l1.mjs` | The L1 suite (runnable; `runL1()`). |
| `puppet/server.mjs` | The scripted OpenAI-compatible SSE server with the anti-vacuity sentinel gate. |
| `puppet/index.mjs` | The `pi -e` provider extension (zero-cost model, dummy key). |
| `scenario-format.mjs` | The L2 scenario runner + shared negative control + `--self-test`. |
| `scenarios/{a,b,c,d,e,g}.mjs` | The six L2 scenarios and their negative twins. |
| `scenarios/index.mjs` | Scenario aggregator + standalone runner. |
| `run.mjs` | Top-level runner: L1 + L2 + negative control + `--determinism`. |

## Observed isolation (not confinement)

The harness claims *observation*, not confinement:

- the child environment is **allowlist-constructed**, never filtered;
- `HOME` is redirected to a scratch directory with
  `defaultProjectTrust: "always"` and a fabricated `auth.json`;
- `PI_OFFLINE=1`;
- `gh` is **shadowed by a sandbox stub** (a logging deny-stub by default that
  exits nonzero; a logging exit-0 stub for the tracker-attempt scenario), so the
  real binary is unreachable and every attempt is logged;
- a **credential denial list** (exact vars — `ANTHROPIC_API_KEY`,
  `OPENAI_API_KEY`, `GITHUB_TOKEN`, AWS vars, … — plus `*_API_KEY` / `*_TOKEN` /
  `*_SECRET` catch-alls, with a per-variable `PI_E2E_ALLOW_<VAR>` escape hatch)
  makes the harness **refuse to start** on a hit;
- a **teardown no-write scan** fails the run on any write to the repository
  checkout. Because `HOME` is redirected, pi's own state writes are structurally
  confined to the scratch sandbox; the checkout is the meaningful
  checkout-relative-path leak surface. (Watching the live `~/.pi` produced
  false positives from unrelated concurrent pi processes, so it is not a default
  watched root.)

Confirm the guards fire with `node test/e2e/harness.mjs --self-test`. Confinement
is the documented **container variant** — run the suite inside a container with
localhost-only networking (the puppet binds `127.0.0.1`); CI does not require it.

## Install-root fidelity

Local-path installs in pi are **by reference**. The harness stages a *copy* of
the package into a scratch install root and installs *that* with
`pi install <staged> -l`, then runs every shipped script from its staged
install-root path — guarding the checkout-relative-path regression class
without misstating pi's install semantics.

## Anti-vacuity: the sentinel gate and negative control

pi surfaces an installed skill by listing it (with its install-root
`SKILL.md` location) in the system prompt; the model reads the file on demand.
Each L2 scenario therefore begins with an ungated **loader** turn that reads the
install-root `SKILL.md`. The puppet server keeps every *scenario* step **locked**
until it observes a pinned **sentinel** — a stable sentence from the SKILL.md
body (`DEFAULT_SENTINEL` in `scenario-format.mjs`) — in that read result. So a
scenario can only advance if the installed skill was genuinely loaded from the
install root.

The **shared negative control** runs every scenario in two failing modes:

- **mutated sentinel** — the skill is present but the pinned sentinel never
  matches, so the gate never unlocks;
- **skill removed** — the installed skill is deleted, so discovery and the loader
  read fail.

Every scenario must lock (fail) under both. This is what makes L2 non-vacuous:
it can never pass while discovery or skill loading is broken.

**What L2 asserts (and does not).** The puppet is a scripted stand-in, so the
canned assistant text is authored, not judged. The load-bearing, non-scripted
signals are: (1) the sentinel gate (the skill was really loaded), (2) the
**tool results** of the real install-root scripts (`sdlc-status`,
`resolve-panel`, `check-lifecycle`) which are config-driven, and (3) the **order**
of real tool execution that pi drives between turns. Mandated markers (the
announce contract, `[sdlc hook]` lines) are asserted against the assistant
**emission stream** — pi's `-p` mode does not print assistant text that
accompanies a tool call — interleaved with that real execution.

## Authoring a scenario

A scenario is an object (see `scenarios/a.mjs` for the simplest):

```js
{
  name: "X-...",
  tools: "read,bash,write",   // pi --tools list
  ghStub: false,              // true installs the exit-0 logging gh stub
  prompt: "…",                // the single headless user prompt
  setup: async (sandbox) => ({ consumer }),  // build+adopt a scratch consumer
  steps: [                    // ordered canned turns (loader is auto-prepended)
    { content: "…", toolCalls: [{ name: "bash", arguments: { command: "…" } }] },
    { content: "…" },
  ],
  assert: ({ record }) => { /* throw on failure */ },
}
```

`record` carries `{ exitCode, stdout, transcript, requests, toolCalls, markers,
files, ghLog, locked }`. Assert on `transcript`/`markers` for mandated agent
output, on the scenario's tool results for config-driven script behaviour
(use the `common.mjs` helpers, which exclude the loader's SKILL.md read), on
`toolCalls` for source-order tool sequencing, on `files` for write effects, and
on `ghLog` for tracker attempts. Keep trigger regexes minimal; assert effects
and mandated markers, never free prose.

## Determinism

`run.mjs --determinism` runs the full suite (L1 + positive L2 + both
negative-control modes) twice, each from a fresh sandbox, and byte-compares the
normalized run manifests (volatile fields — absolute scratch paths, UUIDs,
timestamps, durations — stripped; tool calls in assistant **source order**; NC
lock statuses included). CI enforces the comparison.

## Pinned pi and the bump procedure

`@earendil-works/pi-coding-agent` is pinned **exactly** in `devDependencies`
(never a range), so `npm ci` supplies the exact binary the suite runs against.
pi-release drift lands as a deliberate, reviewed bump:

1. Change the exact version in `package.json`; refresh `package-lock.json`.
2. Re-run `test/e2e/spike.mjs` (SPIKE.md's go/no-go table) against the new pin;
   reconcile any API drift before touching scenarios.
3. Run the full suite (`--determinism`) and reconcile the sentinel if the
   SKILL.md body sentence moved.
4. Land the bump as its own commit; never let a pi upgrade arrive ambiently.
