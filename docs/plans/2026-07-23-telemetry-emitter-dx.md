# Plan: Telemetry emitter DX — bail with expected template + describe/list

- **Track:** reversible (additive to the `record-run-event` emitter; no event
  vocabulary, envelope, payload schema, or run-store format changes).
- **Slug:** `telemetry-emitter-dx`
- **Brainstorm:** approved 2026-07-23 (human:neil). Design agreed; one
  contradiction raised and resolved (stdout contract, see Rationale).

## Objective

Kill the self-correction churn agents show when invoking `record-run-event`.
Today an unknown event or malformed payload yields one terse stderr line and
`exit 2` with **no write**; the agent reads the diagnostic and retries, often
more than once, because the diagnostic says *what is wrong* but not *what right
looks like*. Make every miss a guaranteed **one-bounce** correction, and give
agents a way to discover the exact invocation shape without reloading prose.

## Rationale

- The exact payload templates live only in `references/system-reference.md §12`.
  At emission time an agent working from memory reconstructs the JSON and can
  guess a wrong field, wrong phase token (`tasks`→`build`, `pr-review`→`pr`), or
  wrong `round`/`wave`. The information needed to self-correct in one step —
  the expected template for *that* event — is not in the failure output.
- The emitter already holds the machine-readable truth: `EVENT_PAYLOADS` and
  `OPTIONAL_EVENT_PAYLOADS` in `telemetry.mjs`. Deriving a template from those
  descriptors means **one source of truth**, no hand-written template strings
  to drift from the validators.
- **Stdout-contract resolution (the one brainstorm contradiction):** the FS13
  emitter contract states "nothing is ever written to stdout". `--describe` /
  `--list` are informational, stdout-shaped invocations. Resolution: the
  no-stdout rule is scoped to *emission* invocations (so pipes stay clean);
  describe/list are a distinct informational invocation class that writes to
  stdout and never touches the run store. Bail templates stay on **stderr** as
  part of the diagnostic. Net: every existing emission call is byte-identical on
  stdout and exit code; only stderr grows richer. Strictly additive.

## Scope

**In:**
1. On `bail()` for an unknown event: append the nearest known event name
   (cheap edit-distance suggestion) and the known-event list.
2. On `bail()` for an invalid/missing payload: append the expected `--payload`
   template for that event, derived mechanically from the payload descriptors
   (required fields, then optional fields annotated as optional), with a
   type→placeholder mapping (e.g. `lifecyclePhase` →
   `"<brainstorm|plan|spec|build|implement|pr>"`, `posInt` → `<n>`).
3. `--list`: print the event vocabulary to **stdout**, exit 0, no run-store
   access, no run-identity resolution.
4. `--describe <event>`: print that event's full invocation template to
   **stdout**, exit 0; unknown event → the same suggestion + list on stderr,
   exit 2.
5. A shared template-rendering helper in `telemetry.mjs` (exported, pure) so the
   bail path, `--describe`, and future callers share the derivation.

**Out:**
- Any change to the event vocabulary, envelope shape, payload validators,
  `by` grammar, run-identity resolution, run-store path/format, or the
  `emitEvent` fail-soft FS5 side-effect path.
- Alias-normalising wrong phase tokens at the emitter (rejected in brainstorm:
  muddies the vocabulary; a suggestion in the error is cleaner).
- The `.sh` wrapper's behaviour beyond passing the new flags through
  (it already forwards argv).
- The sibling PV1 task-scoped-tests slice (separate lifecycle).

## Definition of done

1. Invoking `record-run-event <unknown-event>` prints, on stderr, the nearest
   known event and the full known-event list, and still exits 2 with no write.
2. Invoking with a missing/invalid payload prints, on stderr, the expected
   `--payload` template for that event (required + optional fields, typed
   placeholders), and still exits 2 with no write.
3. `record-run-event --list` prints the vocabulary to stdout and exits 0
   without resolving run identity or touching the run store.
4. `record-run-event --describe <event>` prints that event's template to stdout
   and exits 0; an unknown `--describe` target exits 2 with suggestion + list.
5. The template derivation is a single exported pure helper in `telemetry.mjs`;
   no hand-written per-event template strings exist anywhere.
6. Every existing emission invocation is unchanged on **stdout** and **exit
   code** (stderr may be richer); the full test corpus stays green and biome
   is clean.
7. The FS13 emitter contract comment and `system-reference.md §12` are updated
   to state the scoped no-stdout rule and document `--list`/`--describe`.

## Context for the next agent

- Emitter: `skills/sdlc/scripts/record-run-event.mjs` (arg loop, `bail`,
  `KNOWN_EVENTS`). Shared contract: `skills/sdlc/scripts/telemetry.mjs`
  (`EVENT_PAYLOADS`, `OPTIONAL_EVENT_PAYLOADS`, `validatePayload`).
- The `.sh` wrapper forwards argv to the `.mjs`; no change expected beyond
  ensuring `--list`/`--describe` reach it.
- Tests live in `test/telemetry-emitter.test.js` (node:test). Add cases for the
  four DoD behaviours; keep them assertion-precise on stdout vs stderr and exit
  code so the stdout-contract scoping is pinned.
- A bare `--list`/`--describe` must short-circuit
  **before** run-identity resolution and payload/`by` validation so it works on
  `main`/detached HEAD with no env.
- Reversible-track config: `overrides.reversible.review.design: human` → no plan
  panel; human approval is the design gate.
