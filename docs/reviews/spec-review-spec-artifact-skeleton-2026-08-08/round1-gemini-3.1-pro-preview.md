### Spec artifact skeleton

- severity: high
- confidence: high
- origin: NEW
- location: Contracts C2 and C1
- defect: C2's canonical rule sentences omit two explicit constraints mandated by the Plan for `phase-spec.md` §4: it drops the "mechanical/total ratio is readable off the spec" requirement from Rule 3, and it drops the "interfaces mentioned only as unchanged context do not [have a block], and must not be silently re-described" rule from Rule 2.
- evidence: Plan Scope In #2 explicitly mandates both. C2 Rule 3 defines only "every scenario carries exactly one kind label" and C2 Rule 2 defines only "every interface this change introduces or modifies has a Contracts block". C1 internally contradicts this by claiming the ratio rule "mirrors C2 rule 3".
- impact: These constraints freeze missing from the authoring surface in `phase-spec.md` §4, violating the plan's scope, and contract tests (M2/M4) will enforce the wrong, incomplete sentences.
- fix: Expand C2's canonical rule sentences to fully incorporate the Plan's mandated text for the ratio (Rule 3) and unchanged context (Rule 2).

- severity: high
- confidence: high
- origin: NEW
- location: Contracts C3 and C7 (M4)
- defect: C3 violates the Plan's explicit directive that "the prompt references, never restates" by mandating that the prompt's anchors literally restate the rule definitions disguised as questions (e.g., Anchor D instructs the prompt to ask "whether every coined term used two or more times in the body appears in the spec's Vocabulary table..."). Anchor D also completely omits the required pointer to the skeleton.
- evidence: Plan Scope In #3: "The binding-rule definitions themselves live only in the skeleton and phase-spec.md §4 — the prompt references, never restates." C3 requires the prompt to spell out the exact evaluation logic for B, C, D, and F. M4 merely bans exact verbatim string matches of the sentences, creating a technical loophole.
- impact: The prompt assumes ownership of the rule definitions, recreating the very author/reviewer asymmetry the plan exists to close. M4 asserts a meaningless string technicality instead of the plan's actual reference-never-restate law.
- fix: Rewrite C3 to only demand that each anchor names its target component and instructs the reviewer to verify it against the definition in `references/spec-artifact-skeleton.md`, without restating the rule logic in the prompt.

- severity: medium
- confidence: high
- origin: NEW
- location: Verification scenarios (SAS8/SAS9)
- defect: The plan explicitly identifies the consumer override fixtures as a strict boundary that must not be touched, but the spec provides no falsifiable verification scenario to enforce this.
- evidence: Plan A3 (PLAN-R3-01) states "the consumer override fixtures are a strict boundary". The Spec's SAS8 diff-guards the `FROZEN` array, but `test/fixtures/consumer/` is not in that list and no other scenario asserts its immutability.
- impact: An implementation agent could modify the consumer fixtures (e.g., `test/fixtures/consumer/adversary-spec.prompt.md`) to artificially pass broken tests, and no spec-gated scenario would fail.
- fix: Add a mechanical verification scenario (or extend SAS8/SAS9) asserting that the contents of `test/fixtures/consumer/` are byte-identical to the branch base.

CLEAR: A — The `FROZEN` unfreeze/refreeze mechanics exactly match the plan's specified operations and IDV19 constraints.
CLEAR: E — No framework runtime dependencies introduced; test operations are standard pure string assertions.
CLEAR: F — NFR table bounds each requirement correctly and uses the explicit unbound marker correctly for maintainability.
CLEAR: G — Spec mechanism accurately reflects the described offline contract string checks without over-claiming.
CLEAR: H — No carries minted, none landed. No-orphan rule trivially satisfied.
