# Build: Telemetry emitter DX

Upstream: `docs/plans/2026-07-23-telemetry-emitter-dx.md` (reversible track, no
Spec). Single task — below `shape.publishToTracker` (2), stays a plain doc, no
tracker projection.

## T1 — bail templates, `--list`, `--describe`

**Objective:** implement Plan DoD items 1-7 in one task; the change is small and
cohesive (one shared helper, two call sites, doc + test updates).

**Scope of work:**
- `telemetry.mjs`: add `renderEventTemplate(event)` (pure, exported) building
  `<event> --payload '{"field":"<placeholder>",...}'` from `EVENT_PAYLOADS` +
  `OPTIONAL_EVENT_PAYLOADS`, with a `TYPE_PLACEHOLDERS` map (`nonEmptyString` →
  `"<...>"`, `lifecyclePhase` → the phase enum joined `|`, `panelPhase`
  likewise, `posInt`/`nonNegInt` → `<n>`, `stringArray` → `[...]`, `findings` →
  `{"high":<n>,"medium":<n>,"low":<n>}`); optional fields appended and
  annotated `(optional)`. Add `suggestEvent(input)` (pure, exported): smallest
  Levenshtein distance across `KNOWN_EVENTS`, tie broken by array order,
  `null` when nothing is close (distance threshold: <= 3 or half the input
  length, whichever is smaller, to avoid nonsense suggestions on short/garbled
  input).
- `record-run-event.mjs`:
  - Unknown-event bail: append `did you mean '<suggestion>'? known events:
    <list>` when a suggestion exists, else just the list (unchanged fallback).
  - Invalid-payload bail: append `expected: <renderEventTemplate(event)>`.
  - New flags, parsed **before** any other validation/resolution: `--list`
    (stdout: one event name per line, exit 0) and `--describe <event>` (stdout:
    `renderEventTemplate(event)`, exit 0; unknown event: same suggestion+list
    treatment as emission, on stderr, exit 2). Both short-circuit before
    `--slug`/`--by`/`--payload`/`--config`/`--repo-root` parsing has any
    run-identity or payload effect — they never touch the run store.
  - Update the file-header contract comment: "no **emission** invocation ever
    writes to stdout" (scoped, not blanket).
- `record-run-event.sh`: no change expected (already forwards argv); confirm
  with a smoke run.
- `references/system-reference.md §12`: document `--list`/`--describe`, note
  bail diagnostics now include the expected template, and reword the no-stdout
  sentence to the scoped form.
- `test/telemetry-emitter.test.js`: add cases — unknown event includes
  suggestion+list; invalid payload includes the exact expected template for at
  least two events (one with an optional field, e.g. `panel.dispatched`); the
  template for the same event is stable across two calls; `--list` output
  exactly equals `KNOWN_EVENTS` sorted or in declared order (pin one); `--list`
  and `--describe` never write to the run store even mid-run (assert no
  `events.jsonl` mtime change) and never require `--slug`/git identity;
  `--describe` on an unknown event exits 2 with the same suggestion format as
  emission; every existing passing-case test still asserts byte-identical
  stdout (empty) and exit 0.

**Checks:**
- `tests.task` — `node --test test/telemetry-emitter.test.js` (task-scoped;
  slice 2 will formalize this as a manifest convention, but nothing blocks
  using it informally here too).
- `tests.full` — `npm test`
- `static.lint` — `npm run lint`

**Scenario ids:** none (reversible track, no Spec — Plan DoD items 1-7 are the
acceptance surface, restated in the PV1 manifest's `standards` category checks
mapped to each DoD item via targeted greps/asserts where mechanical, and to the
task-scoped test file otherwise).

**Assumptions (accrue here as Implement proceeds):**
- `static.lint` in the T1 manifest scopes to the touched files (`npx biome
  check <touched files>`) rather than repo-wide `npm run lint`. Confirmed on
  `main` before starting: 8 pre-existing biome errors from commit `aa58163`
  (orchestration-runtime build-vs-borrow prototype evidence assets, #162,
  2026-07-23) predate and are unrelated to this
  slice. Repairing unrelated repo debt inside a reversible telemetry-DX slice
  is out of scope per the Plan; the scoped check still proves this task's diff
  is clean without silently absorbing someone else's fix.
