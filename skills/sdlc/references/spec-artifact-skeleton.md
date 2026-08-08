# Spec artifact skeleton

The fixed shape for sdlc Spec docs (`docs/specs/<date>-<feat>.md`). Fill in
every block below; delete none of the markers. A Spec that omits a required
piece is defective at authoring time — the Spec gate refuses it, not the
reviewer's patience.

## Vocabulary

Fill the table when the change coins a term or redefines an existing one.
Every entry binds the term to the identifier or file that owns it.

| Term | Definition | Binds to |
|---|---|---|
| <term> | <one-sentence definition> | <identifier or file> |

Binding rule: every coined term used two or more times in the body appears in the Vocabulary table, and every term in the table appears in the body.

## Contracts

One block per interface this change introduces or modifies. Interfaces
mentioned only as unchanged context get no block.

### <interface name>

- Signature/shape: <the surface as called or read — parameters, return shape, file layout>
- Preconditions: <what must hold before use>
- Postconditions: <what is true after use>
- Invariants: <what stays true across uses>
- Error semantics: <precedence when several errors can fire, or "at most one error possible">
- Gated by: <scenario ids that verify this contract>

Binding rule: every interface this change introduces or modifies has a Contracts block (interfaces mentioned only as unchanged context do not, and must not be silently re-described).

## Scenario kind labels

Every scenario carries exactly one label:

- `mechanical` — a runner/argv check can decide it.
- `inspection` — a human or panel decides it at a named decision point; the
  scenario names that point in its body, the label stays the literal
  `inspection`.
- `carried` — deferred to a later phase; the scenario names the destination
  in its body, the label stays the literal `carried`.

One label per scenario; the mechanical/total ratio must be readable off the
spec.

Binding rule: every scenario carries exactly one kind label and the mechanical/total ratio is readable off the spec.

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
|---|---|---|---|
| <characteristic> | <stimulus or condition> | <measurable response> | <scenario id, or `unbound — accepted at gate` with a reason> |

Binding rule: every NFR has a response measure and a binding scenario id, or the literal marker `unbound — accepted at gate` with a reason.

## Scenario form

Three named parts, each on its own line:

- `Given:` the state or fixture; `Given: none` is permitted and expected for
  pure-function scenarios.
- `When–Then:` the behaviour and its outcome.
- `Falsify:` what would show the scenario failing.

No keyword parser, no step definitions.
