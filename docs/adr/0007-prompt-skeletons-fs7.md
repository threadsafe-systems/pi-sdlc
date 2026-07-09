# ADR 0007: prompt skeletons (FS7)

- Context: a consumer may override a phase reviewer prompt; an override must remain
  compatible with the panel's expectations.
- Decision: freeze the required `##` section headings of the four generic prompts.
  Overrides are whole-file and must preserve those headings; the consumer owns
  keeping them in step. The plan/spec generic prompts carry a domain-neutral
  governing-doc line; projects needing specific doc names override.
- Consequences: changing a required heading is a breaking change for overrides.
