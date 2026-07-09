# ADR 0006: token convention and genericisation clearance (FS6)

- Context: the generic SKILL/tracker-ops/agent-brief describe the process with
  `<TOKEN>` placeholders the orchestrating agent resolves from the manifest.
- Decision: use angle-bracket uppercase tokens (`<PREFIX>`, `<LABEL_PREFIX>`,
  `<ANNOUNCE>`, `<TRACKER_*>`). The clearance gate is BOTH an exhaustive
  substitution and an empty S2 grep over the whole tree; the grep is a necessary
  but not sufficient backstop (concept names without the literals need manual
  removal).
- Consequences: adding a project-specific value means adding a token, not baking a
  literal; the grep protects against regressions.
