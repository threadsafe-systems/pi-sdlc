# ADR 0002: sdlc.models.json is a frozen surface (FS2)

- Context: `resolve-panel` reads the per-phase model roster; consumers author it.
- Decision: freeze the schema — exactly the four v1 phase keys, each with
  `min_panel >= 1` and a non-empty `prefer` of `provider/model` strings; optional
  `rules.exclude_author_vendor` and `author_default`. The skill ships no built-in
  roster (model ids drift per machine), so the file is required to resolve a panel.
- Consequences: adding a fifth phase is a major change; a subset of phases is
  invalid. Value constraints are enforced at runtime (hand-rolled, no dep).
