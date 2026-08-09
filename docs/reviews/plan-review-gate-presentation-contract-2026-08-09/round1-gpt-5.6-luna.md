### Standalone Plan has no provenance source

- id: 1
- severity: high
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:81-85
- defect: The plan requires every Plan doc to open with Brainstorm provenance, but standalone Plan explicitly has no committed upstream or Brainstorm artifact.
- evidence: Plan: “every Plan doc opens with the Brainstorm provenance block”; `skills/sdlc/references/phase-plan.md:15-23`: “Standalone entrypoint `sdlc:plan` … needs no committed upstream” and “the intent formed live.”
- impact: Implementers cannot satisfy both the standalone no-upstream contract and the new mandatory provenance rule.
- fix: Qualify provenance as required for Plans entered from Brainstorm and define the standalone live-intent exception.

### Map-mode storage rule is internally ambiguous

- id: 2
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:34,39,81-84
- defect: The plan says the sketch is embedded verbatim “in both modes” while also saying map-mode Plan is an index and the full grammar lives in the ticket comment.
- evidence: “the sketch … embeds verbatim in the plan in both modes” versus “map mode — the plan is the index” and “the full grammar lives in exactly one place, the ticket resolution comment.”
- impact: Map implementations may duplicate the sketch/list in the Plan, violating the ratified one-place/index shape.
- fix: State explicitly whether map mode links both artifacts or embeds only the sketch while indexing the decisions.

### G4 does not reconcile the existing research rule

- id: 3
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:73-77
- defect: The plan adds “research-or-declare with named triggers” but does not say how it changes the existing optional-research prose.
- evidence: Plan: “research-or-declare with named triggers”; `skills/sdlc/references/phase-brainstorm.md:33-38`: “This is proportional, not mandatory ceremony — a brief brainstorm does not need a research pass just to be brief.”
- impact: An implementer can preserve the old rule and omit required trigger-based research or explicit declination.
- fix: Specify the named-trigger branch, the required explicit declination, and the preserved proportional exception outside those triggers.

### Contract-test coverage is not defined tightly enough

- id: 4
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:86-87,101-103
- defect: “Contract tests assert the anchors above” does not enumerate the exact invariants or mutation failures.
- evidence: “contract tests asserting the rule prose anchors above (offline string assertions, S1 pattern).”
- impact: Tests could pass while omitting appetite ordering, one-line grammar, sketch trigger, map one-place law, ADR criteria, or parser prohibition.
- fix: List every required literal/regex anchor and a negative mutation for each semantic direction.

### ADR-bar requirement is absent from implementation scope

- id: 5
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:68-72,99-103
- defect: The provenance mentions the three-criteria ADR bar, but the §8 scope and DoD never require preserving it as an additional deep record.
- evidence: Provenance says “the three-criteria ADR bar … stays an additional deep record”; §8 scope lists the grammar, trigger, amendment loop, and transition but not the ADR bar.
- impact: The implementation can drop the hard-to-reverse/surprising/real-trade-off rule while still claiming §8 complete.
- fix: Add the ADR-bar rule to In scope and require a contract-test anchor for all three criteria plus the always-recorded rejected line.

### Lifecycle DoD command is neither runnable nor conditionally complete

- id: 6
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:107-110
- defect: `check-lifecycle --track ...` is not an available command, and the irreversible checker requires both Spec and Build artifacts, not merely a Build doc.
- evidence: Plan: “`check-lifecycle --track irreversible --slug gate-presentation-contract` exit 0 once build doc exists”; `skills/sdlc/scripts/check-lifecycle.mjs:25-27` requires `artifact.spec` and `artifact.build`, and `:57` fails missing artifacts.
- impact: The stated DoD cannot be executed as written and can remain false after only the named Build dependency exists.
- fix: Give the exact `node skills/sdlc/scripts/check-lifecycle.mjs` command and condition it on both committed Spec and Build artifacts, or defer it to the downstream lifecycle plan.

### G7 wording is not an executable dialogue move

- id: 7
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:73-77
- defect: “one constraints prompt, named never bound” is ambiguous and omits the required no-constraints outcome.
- evidence: Plan: “one constraints prompt, named never bound (G7)”; the ratified wording requires naming design-shaping constraints or declaring “none identified,” without binding them.
- impact: An implementer can bind constraints during Brainstorm or omit an explicit empty result.
- fix: Specify one prompt to name design-shaping constraints or record `none identified`, and state that Brainstorm never binds them.

### Decisions-list suffix does not match the ratified grammar

- id: 8
- severity: low
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:35
- defect: The dogfood grammar uses a Unicode arrow instead of the ratified ASCII `->` ADR suffix.
- evidence: Plan: “optional (→ ADR 00NN) suffix.”
- impact: Exact prose anchors or future consumers can diverge on the locked suffix spelling.
- fix: Use the exact `(-> ADR 00NN)` spelling in the provenance and contract assertions.

### Definition-of-done commands are under-specified

- id: 9
- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:104-113
- defect: Offline timing, touched-file linting, reference checking, frozen-surface identity, and fixture cleanliness have no exact commands or file set.
- evidence: “Contract test file runs offline, < 1 second”; “biome clean on touched files”; “`check-references` exit 0”; “Frozen surfaces byte-identical … `test/fixtures/consumer/` untouched.”
- impact: DoD assessment depends on reviewer interpretation and cannot reliably falsify each item.
- fix: Name the exact test, `npx biome check` paths, `node ...check-references.mjs`, and git diff commands for frozen and fixture surfaces.

CLEAR: F — the plan explicitly selects the irreversible track and does not claim the reversible fast path.

CLEAR: dogfood consistency — appetite is first and unique, entries are one physical line, rejected entries carry rationale, and the qualifying sketch is present.

CLEAR: §4 placement — the current first paragraph ends at `phase-plan.md:38` and Dialogue discipline starts at `:40`, so the requested insertion point is unambiguous.

CLEAR: skill-kernel anchors — the plan leaves `SKILL.md` out of scope, and existing `test/skill-kernel.test.js:52-55` guards the two map-detail markers.

CLEAR: proportionality — the ratified appetite explicitly chooses an S1-sized irreversible slice, while parser, dial, and new-panel machinery remain excluded.

FINDINGS
