# Sandboxed end-to-end integration harness

> **Status:** under construction (T1 landed; L1/L2 suites follow). This skeleton
> is completed by T5.

One command proves the full pi-sdlc adoption chain works from a clean machine
state: a staged copy of the package installs into pi, its resources are
discovered, the shipped scripts behave per contract at their install-root
locations, and a scripted-model session obeys the observable law — every run
sandboxed (no real credentials, no tracker mutations, offline pi) and
deterministic enough to block PRs.

## The claim ladder

- **L1 — install/discovery + CLI conformance (PR-blocking).** The package
  installs from a staged copy, resources are discovered, and the shipped scripts
  behave per contract at their install-root locations. No model.
- **L2 — puppet-model e2e (PR-blocking).** The installed skill demonstrably
  reaches the model request stream, tool calls execute, and transcripts
  contain/omit the SKILL's mandated mechanical markers. The "model" is a local
  scripted server; this proves plumbing, **not** agent judgment.
- **L3 — live smoke (out of scope here).** Real cheap model, nightly/manual.

## Running

The harness **refuses to start** when the ambient environment contains a
credential on its denial list (see below), so run it from a clean environment.
In CI the environment is already clean; locally:

```bash
env -i PATH="$PATH" HOME="$HOME" node test/e2e/harness.mjs --self-test
```

## Observed isolation (not confinement)

The harness claims *observation*, not confinement:

- the child environment is **allowlist-constructed**, never filtered;
- `HOME` is redirected to a scratch directory with
  `defaultProjectTrust: "always"` and a fabricated `auth.json`;
- `PI_OFFLINE=1`;
- `gh` is **shadowed by a sandbox stub** (a deny-stub by default; a logging
  exit-0 stub for the tracker-attempt scenario), so the real binary is
  unreachable and every attempt is logged;
- a **credential denial list** (exact vars plus `*_API_KEY` / `*_TOKEN` /
  `*_SECRET` catch-alls, with a per-variable `PI_E2E_ALLOW_<VAR>` escape hatch)
  makes the harness refuse to start on a hit;
- a **teardown no-write scan** fails the run on any write outside the scratch
  roots.

Confinement is the documented container variant (localhost-only network); CI
does not require it.

## Install-root fidelity

Local-path installs in pi are **by reference**. The harness therefore stages a
*copy* of the package into a scratch install root and installs *that* with
`pi install <staged> -l`, then asserts every resource and script resolves under
the install root — guarding the checkout-relative-path regression class without
misstating pi's install semantics.

<!-- TODO(T3): puppet provider + sentinel / negative-control mechanism. -->
<!-- TODO(T4): scenario authoring guide (A–E, G + negative twins). -->
<!-- TODO(T5): CI wiring, determinism manifest compare, container variant, pi-bump procedure. -->
