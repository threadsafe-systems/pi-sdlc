# Phase reference: Specification

> Detailed public contract for the Specification phase. `SKILL.md` owns the
> kernel, readiness gate, and phase sequence; this reference owns Spec's
> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
> explicit **under your configuration** callout routed to the effective shape
> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
> companion is absent or stale) — never a silently assumed track, gate mode, or
> separate-Spec setting.

## 1. Purpose and invocation modes

Specification fixes the contracts, interfaces, surface area, functional and
non-functional requirements, and the falsifiable verification scenarios (stable
ids, pass/fail conditions). It runs two ways:

- **Full lifecycle:** entered after an approved Plan on the irreversible track
  (or the merged Plan+Spec artifact when `shape.separateSpec: false`).
- **Standalone entrypoint `sdlc:spec`** (`templates/sdlc-spec.md`): needs a
  committed plan doc. Unadopted with no committed plan it may **stamp-and-interview**
  (see `references/system-reference.md`, "Standalone entrypoints", for the stamp
  contract); adopted with no committed plan it **refuses and redirects** to
  `sdlc:plan`.

The Spec defines verification **scenarios** — falsifiable acceptance criteria
with stable ids and pass/fail conditions — **not** implementation test code. A
scenario that cannot be made to fail is a broken spec.

## 2. Entry conditions and authoritative upstream inputs

The authoritative upstream input is the committed, approved Plan doc. On the
reversible track a Specification is **not** required and must not be demanded.

> **Under your configuration:** whether Spec is a required phase depends on the
> effective track and `shape.separateSpec`. Read them; do not assume Spec always
> runs.

## 3. Configured before-hook order and blocking semantics

Fire `hooks.spec.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".

## 4. Required activity and artifact/output shape

Produce the Spec doc: **contracts, interfaces, surface area, functional and
non-functional requirements, and falsifiable verification scenarios with stable
ids**. Its home routes to the configured `paths.specs`.

> **Under your configuration:** the artifact home is `<paths.specs>/<date>-<feat>.md`
> using the committed `paths.specs` value — do not hardcode `docs/specs`.

## 5. Invariant gate/approval seam

The invariant seam is a **design gate grounded in the code, plus human
approval**. On the irreversible track a spec panel runs, grounded against the
repository at a named commit.

> **Under your configuration:** `review.design` (`panel` | `advisory` | `human` |
> `off`), possibly adjusted by per-track `overrides`, sets the spec gate. Read the
> effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`);
> never assume `panel`. When `shape.separateSpec: false`, there is no separate
> spec gate — the merged Plan+Spec artifact carries one design gate.

When a panel runs it follows the shared panel run-shape owned by
`references/phase-pr-review.md`, "Panels", via the `spec_review` phase; the
reviewer prompt is `prompts/adversary-review.prompt.md`. Reviewers are grounded
in the code and must cite `file:line` for any framework claim.

## 6. Refusal and backward-transition behaviour

Standalone `sdlc:spec` refuses-with-redirect when adopted and no committed plan
exists. Backward transition to Plan or Brainstorm is always allowed when the Spec
reveals an upstream flaw.

## 7. After-hook order and warning semantics

Fire `hooks.spec.after` (and `hooks."*"`) after the gate: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).

## 8. Completion evidence and next transition

Completion evidence is the committed Spec doc, the consolidated spec-panel
artifact under the configured reviews home, and human approval. Next transition
is **Build/Tasks** (`references/phase-tasks.md`).

## 9. Advanced-mode pointers

None specific to Spec.
