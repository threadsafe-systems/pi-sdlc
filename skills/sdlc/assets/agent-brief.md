# Writing durable issue/ticket bodies

Shared rules for writing the body of any GitHub issue this project's tooling
creates as a unit of work for an agent (or a human) to pick up later: a
wayfinder-lite map ticket, a build-phase sub-issue, or an ad-hoc follow-up
issue written by hand. Adapted from the discipline that made issues
#7/#10/#11/#12 (the post-reorg cleanup) reusable weeks after the PRs that
raised them — codified here so it's a rule, not a thing each session
reinvents.

The issue may sit open for days or weeks, claimed and unclaimed, across
sessions and possibly across agents. Write it so it stays useful as the
codebase changes underneath it.

## The four rules

### 1. Durable over precise

- **Do** describe interfaces, types, behavioral contracts, check commands,
  and scenario ids.
- **Don't** reference file paths or line numbers — they go stale the moment
  something is renamed or moved. Name the module or concept instead ("the
  boundary-invariant guard", not "`test/invariants.test.ts:100`").

### 2. Behavioral, not procedural

State **what** should be true when the issue is resolved, not **how** to get
there. The agent that eventually works it will explore the codebase fresh and
make its own implementation decisions; a procedural brief just goes stale
faster and constrains a solution the author hadn't fully thought through.

- **Good:** "The boundary-invariant guard's allowlist shrinks to the one
  sanctioned module only; the current exceptions route through that boundary
  instead."
- **Bad:** "Open `driver.ts` and move the import to line 12."

### 3. Complete, testable acceptance criteria

Every criterion must be independently verifiable — a command, a grep, a test
name — not a vibe.

- **Good:** "`npx tsc --noEmit` exits 0."
- **Bad:** "Tests should typecheck properly."

### 4. Explicit scope boundaries

State what is deliberately **not** part of this issue, so the person or agent
who picks it up doesn't gold-plate or make assumptions about adjacent work
that belongs to a different ticket.

## Template

```markdown
## What this resolves

One or two sentences: the decision, investigation, or implementation slice
this issue is for.

## Current state

What's true now — the status quo this issue changes.

## Desired state

What should be true once this issue is closed. Behavioral, not procedural.

## Key interfaces / concepts

- The types, contracts, or check commands relevant to resolving this —
  named by concept, never by file path or line number.

## Acceptance criteria

- [ ] Testable criterion 1
- [ ] Testable criterion 2

## Out of scope

- Adjacent thing this issue deliberately does not cover.

## Blocked by

- For a map ticket or build sub-issue: the native `blockedBy` edge (see
  `tracker-ops.md`) is authoritative — this section only gists it for a
  quick read; don't let the two drift, and if they ever disagree, the native
  edge wins. For a hand-written, non-tracked issue with no native edge to
  wire, this section is the only record: the issue(s) that must close before
  this one can start, or "None — can start immediately."
```

## Where this applies

- **Wayfinder-lite map tickets** (`<LABEL_PREFIX>:ticket-*`): "What this resolves"
  is the decision or investigation; there is no code yet, so "Key
  interfaces" is often the open question's shape rather than an existing
  type.
- **Build sub-issues** (`<LABEL_PREFIX>:build-task`): "Key interfaces" names the
  task's check commands and the spec/plan scenario ids it satisfies (pulled
  straight from the committed build-plan doc — don't re-derive them).
- **Ad-hoc follow-up issues**: the same template, written by hand, same four
  rules.

This file does not replace the committed plan/spec/build-plan docs — those
stay canonical for tracker-backed builds, and the map issue itself is
canonical for map mode (see `tracker-ops.md`, "Canonical source, per mode").
It only shapes how the tracker's own objects are worded so they survive the
wait between creation and pickup.
