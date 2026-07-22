# ADR 0030: review-gate `validate` × `approve` decomposition (schemaVersion 4)

- Status: accepted
- Date: 2026-07-22
- Relates to: ADR 0021 (config schema clock + release guard), ADR 0026 (v3 intent
  vocabulary), ADR 0027 (pre-adoption clean-break policy, amended alongside this),
  ADR 0022 (user-owned panel enforcement posture)
- Issue: #150

## Context

Through schemaVersion 3, `review.design` and `review.code` were a single scalar
`gateMode` (`panel | advisory | human | off`). That scalar conflated two
orthogonal decisions and hid a constant:

- whether an adversarial panel runs, and
- who adjudicates its findings and advances the phase.

The split was already latent in `lib.mjs`: `decomposeGateMode()` mapped each
scalar to a `{ reviewer, arbiter, blocking }` triple, but only `.reviewer` was
ever read — `arbiter`/`blocking` were dead fields. "advisory" in particular read
as "the agent may ignore the panel," which is not what the SDLC's disposition
discipline permits.

## Decision

Decompose the two gate dials into a `{ validate, approve }` object
(schemaVersion **3 → 4**, a clean break):

- **`validate`**: `panel | skip` — does an adversarial panel run before the
  artifact is presented?
- **`approve`**: `human | agent` — who adjudicates findings and advances the
  phase?
- **`preview`**: an optional **reserved** boolean, accepted by the schema but read
  by nothing in v4 (its behaviour lands in a later, non-breaking change; reserving
  the name now keeps that addition additive under the closed-world schema).

Naming was owner-ratified (2026-07-22): **`agent`** (not `auto`/`self`) names the
accountable approver; **`skip`** (not `none`/`off`) names "no panel" — the
"reads like a bypass" concern was raised and consciously overridden, so rendered
prose frames `skip` as an authored choice, never an illicit gate-skip.

### Base vs override, and the deep-merge

A **base** dial (`review.design`/`review.code`) requires both `validate` and
`approve` — v4 keeps v3's "all dials explicit" ethos. A per-track **override**
(`overrides.<track>.review.design`/`.code`) is a **partial** gate dial (each field
optional, at least one set) that **deep-merges** field-by-field onto the base, so
a track can relax exactly one axis (e.g. reversible flips only `approve`). A
single shared exported `effectiveReview` helper in `lib.mjs` performs this merge;
both `config-doc.mjs` and `resolve-panel.mjs` import it so they cannot drift.

### The desugar table (translation guide, not runtime)

The canonical old→new mapping, used to hand-author configs and by `setup-sdlc`
presets. There is **no runtime scalar acceptor** — a v4 reader rejects a string
where a gate-dial object is expected.

| v3 scalar | v4 gate dial |
|---|---|
| `panel` | `{ validate: panel, approve: human }` |
| `advisory` | `{ validate: panel, approve: agent }` |
| `human` | `{ validate: skip, approve: human }` |
| `off` | `{ validate: skip, approve: agent }` |

The `advisory → approve: agent` row is an **intentional amendment**, not a
behaviour-preserving translation: old `advisory` was non-blocking, whereas
`{ validate: panel, approve: agent }` under the always-on disposition invariant
(below) makes disposition mandatory. This tightening is the whole point of the
change — making "ignore findings" unexpressible.

### The disposition invariant (prose-law, unchanged)

Whenever `validate: panel`, every finding is recorded and incorporated-or-
justified and no surviving high/medium may advance — **regardless of `approve`**.
`approve: agent` means the agent is the gate adjudicator and advances with no
human escalation for that gate; the human-final-adjudicator rule in
`phase-pr-review.md` governs `approve: human` gates. No config field encodes
"blocking".

## Consequences

- The schema shape breaks (v3 → v4); it rides a package major and the ADR 0021
  release guard (`CONFIG_SCHEMA_VERSION` bump + a `BREAKING CHANGE:` footer —
  never the `!` shorthand, which the repo's angular-preset semantic-release does
  not parse). Consistent with the (amended) clean-break policy (ADR 0027), the two
  co-owned dogfood adopters (this repo + Case) hand-author their v4 configs and
  everyone else pins; there is no automated migrator.
- `decomposeGateMode` is deleted; `arbiter`/`blocking` disappear with it.
- Telemetry `gate.approved` accepts an agent approver (the bare `agent` token);
  the directive reads "every gate approval (human or agent)".
- `preview` remains a candidate for a later, additive checkpoint feature (#136).
