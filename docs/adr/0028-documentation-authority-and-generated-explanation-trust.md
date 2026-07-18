# ADR 0028: documentation authority hierarchy and generated-explanation trust

- Status: accepted
- Date: 2026-07-18
- Relates to: ADR 0016 (FS8 readiness), ADR 0026 (intent-vocabulary config v3),
  the normative-reference inventory (FS11)
- Stream: `sdlc-agent-self-documentation`
  (`docs/plans/2026-07-18-sdlc-agent-self-documentation.md`,
  `docs/specs/2026-07-18-sdlc-agent-self-documentation.md`)

## Context

Before this stream a single large `SKILL.md` combined startup law,
configuration interpretation, six phase disciplines, panel mechanics,
validation, tracker modes, hooks, and PR completion. An agent had to load
unrelated phase detail to discover the system's shape, and the JSON manifest
stated values without explaining their behavioural consequences. The obvious
fixes each carry a durable, non-obvious cost:

- A **single monolith** keeps one source of truth but forces every session to
  load everything and cannot explain a specific consumer's effective shape.
- **Duplicated documentation** (a human README, a schema, long-form skill prose,
  and a per-consumer explanation) drifts: the same rule restated in four places
  eventually contradicts itself, and no reader knows which copy is authoritative.

The stream also introduces a *generated* consumer companion (`.pi/sdlc/CONFIG.md`)
that explains the committed config. A generated explanation that is trusted while
stale is a silent-corruption hazard; one that blocks an otherwise-ready repository
is an availability hazard.

## Decision

**1. A single documentation-authority hierarchy.** Exactly one artifact answers
each question, and references link rather than restate:

| Question | Canonical answer |
|---|---|
| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
| What global law and sequence apply? | `SKILL.md` kernel/router |
| What does this phase require? | The corresponding `references/phase-*.md` |
| What values has this repository chosen? | `sdlc.config.json` |
| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
| What implementation realizes a surface? | Source, only when implementation work requires it |

`SKILL.md` is the kernel/router; each `references/phase-*.md` owns exactly one
phase's detailed contract; `references/system-reference.md` is the explanatory
map that must not become a second copy of phase law. A reference may state an
invariant contract once and link to canonical law it does not own; it must not
silently restate or contradict a rule owned elsewhere. Relocating any normative
prose is governed by a statement-level disposition ledger
(`docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`) so no rule
is dropped or owned twice.

**2. A generated-explanation trust model.** `sdlc.config.json` is authoritative;
`.pi/sdlc/CONFIG.md` explains those values and never overrides them. Safe
degradation is mandatory:

- The companion is rendered deterministically from the validated committed JSON by
  one `config-doc` module — the same renderer backs setup, regeneration, and the
  freshness check, so no separate prose path can disagree with the check.
- A package-owned sentinel + fingerprint makes freshness mechanically decidable.
  Missing, stale, or unrecognized-collision companions never block a ready
  repository: startup emits a fixed warning, falls back to authoritative JSON,
  names the regeneration action, and continues. Generated prose is never trusted
  as authority over JSON.
- The companion is never part of FS8 readiness, FS9 lifecycle completion, or
  mandatory consumer CI.

## Consequences

- Progressive disclosure: startup loads only the kernel, effective shape, and
  routing; detailed phase law loads when a phase begins.
- Drift is bounded structurally: FS11 classification + inverse-completeness
  discovery fails when a public surface is added without an inventory row or a
  documented reference/link is removed; the disposition ledger guards the
  kernel-slim relocation.
- A consumer can always understand its effective configuration from generated
  prose when fresh, and never loses safety when it is stale, because JSON remains
  the single authority.
- This is durable, surprising without context (a documentation split that also
  says "never trust the generated doc over JSON"), and the result of a real
  monolith-vs-duplication trade-off — hence an ADR rather than only a note in the
  triggering artifact.
