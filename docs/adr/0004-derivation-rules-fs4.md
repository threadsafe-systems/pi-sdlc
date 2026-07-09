# ADR 0004: derivation rules (FS4)

- Context: stamped agent names, the description identity, and the tracker label
  vocabulary are all derived from config, not free-form.
- Decision: agent name = `<prefix>-<phase-slug>` (phase id with `_`->`-`); stamped
  `description` = `<labelPrefix> <phase> reviewer. Stamped by the sdlc skill; ...`
  (regenerated, non-behavioural — pi dispatches by name + prompt body); label
  vocabulary = `<labelPrefix>:{map,ticket-*,epic,build-task,hitl,afk}`.
- Consequences: the name/label formulae freeze; a consumer's dispatch and labels
  bind to them. The description is metadata and not under byte-identity.
