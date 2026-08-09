### 1. Panel scope check delegated to the wrong file

- severity: high
- confidence: high
- location: `In scope` item 4
- defect: The plan dictates adding a panel scope check (for resurrected rejected lines) to `phase-plan.md` §4, which dictates the authoring agent's behavior, not the panel's check; the actual reviewer prompt (`adversary-plan.prompt.md`) is excluded from scope.
- evidence: "the plan panel's scope check includes resurrected `rejected:` lines." in `phase-plan.md` §4 vs `phase-plan.md` line 70 noting "The reviewer prompt is `prompts/adversary-plan.prompt.md`".
- impact: The objective that downstream panels catch resurrected rejections cannot be verified because the panel prompt isn't modified to catch them.
- fix: Add `skills/sdlc/prompts/adversary-plan.prompt.md` to In Scope to modify the locked-decisions attack surface, or explicitly note that the existing "Locked decisions" attack surface in the panel prompt already covers it without modifying `phase-plan.md` to dictate panel scope.

### 2. Provenance rule placement contradicts existing artifact shape

- severity: high
- confidence: high
- location: `Definition of done` item 2 and `In scope` item 4
- defect: Placing the provenance rule between the first paragraph and "Dialogue discipline" leaves the first paragraph contradicting the new rule, as the first paragraph strictly enumerates the doc's sections without mentioning the provenance block.
- evidence: "contract tests assert placement between the first paragraph and **Dialogue discipline.**" against `skills/sdlc/references/phase-plan.md` lines 36-37: "Produce the Plan doc: **objectives, rationale, scope in/out, definition of done, and context for the next agent**."
- impact: The agent reference for Plan will contain contradicting directives on whether the provenance block is a required part of the Plan doc, leading to invalid plans.
- fix: Add a requirement to update the first paragraph of `phase-plan.md` §4 to explicitly include the Brainstorm provenance block in the list of required sections.

### 3. G4 fold contradicts existing anti-ceremony constraint

- severity: medium
- confidence: high
- location: `In scope` item 2
- defect: The plan requires folding the G4 "research-or-declare with named triggers" move into the existing tools bullet, but fails to resolve the contradiction with the bullet's explicit anti-ceremony constraint.
- evidence: "research-or-declare with named triggers (G4, folded into the existing tools bullet)" against `skills/sdlc/references/phase-brainstorm.md` line 25: "This is proportional, not mandatory ceremony — a brief brainstorm does not need a research pass just to be brief."
- impact: Forcing a "declare" mandate into a bullet that forbids mandatory ceremony creates conflicting instructions that authoring agents cannot reliably navigate.
- fix: Explicitly specify how to rewrite the tools bullet to integrate G4's named triggers while preserving the proportional/anti-ceremony constraint.

### 4. Dogfood arrow diverges from ratified design

- severity: low
- confidence: high
- location: `### The decisions list` line 35
- defect: The plan specifies the ADR suffix using a Unicode arrow (`→`) instead of the ASCII arrow (`->`) specified in the ratified design.
- evidence: `optional (→ ADR 00NN) suffix` in the plan vs `optional (-> ADR 00NN) suffix` in the ratified S3 design.
- impact: Implementers writing the regex parser or contract tests will mismatch the expected ASCII arrow, breaking S3 design compliance.
- fix: Change the arrow to ASCII `->` in the dogfood block's grammar rule.

CLEAR: A — all 8 DoD items are mechanically falsifiable by identifiable test commands or static assertions.
CLEAR: F — plan correctly claims the irreversible track for modifying phase contracts.

FINDINGS
