### Unenforced binding rules via frozen spec panel prompt

- severity: high
- confidence: high
- location: `Assumption 3` vs `Scope > Out`
- defect: The plan explicitly relies on the spec panel to enforce the new binding rules (Vocabulary, kind labels, Given/When/Then), but explicitly forbids changing the spec panel's prompt. Without updating the prompt, the panel remains blind to these new rules and will not enforce them.
- evidence: Assumption 3 states the rules are "enforced by the spec panel — not by a new mechanical checker", while Scope Out bans "Any change to prompts/adversary-spec.prompt.md (frozen; G7 territory)." Reading `adversary-spec.prompt.md` confirms it currently does not instruct reviewers to check for Vocabulary, scenario kinds, or three-part forms.
- impact: The central enforcement mechanism of the slice is broken; non-compliant specs will pass the gate because the adversarial reviewer is not instructed to verify the new skeleton rules.
- fix: Move `prompts/adversary-spec.prompt.md` to In Scope, unfreeze it per established procedure, and update its Attack Surfaces to enforce the new skeleton rules.

### Unfalsifiable Definition of Done for scenario form

- severity: high
- confidence: high
- location: `Definition of done`, item 3
- defect: The DoD requires a test that asserts the skeleton's scenario form *requires* all three parts, which is impossible to verify on a static markdown file without the mechanical checker the plan explicitly bans.
- evidence: DoD 3 states "Contract tests assert... that the skeleton's scenario form requires all three parts", but Assumption 3 explicitly excludes a "new mechanical checker." A test can only verify that a markdown template *contains* the three parts as fill-in blocks, not that it *requires* them.
- impact: The DoD item is unfalsifiable and contradictory, meaning it cannot be satisfied by any implementable test during the Build phase.
- fix: Rephrase DoD 3 to assert that the skeleton *contains* the three-part scenario form as literal fill-in blocks.

### Unbudgeted CI verification machinery

- severity: medium
- confidence: high
- location: `Scope > In`, item 3
- defect: The plan introduces new CI verification machinery (contract tests) but fails to state a time or cost budget for them.
- evidence: Scope In 3 and DoD 3 introduce "Contract tests proving the authoring surface...", but nowhere does the plan provide a time/cost budget for these checks, violating the proportionality requirement.
- impact: Unstated test budgets can lead to unbounded or disproportionate CI duration and cost when the checks are implemented.
- fix: State a specific, plausible execution time and cost budget (e.g., offline, sub-millisecond, pure string-assertion) for the contract tests.

CLEAR: B — The stated outcome (closing the author/reviewer asymmetry) is verifiably tied to the skeleton additions.
CLEAR: C — Scope boundaries are coherent; the change is well-sized for one spec's worth of work.
CLEAR: D — The plan strictly adheres to the locked decisions (router preservation, no new dials, and out-of-scope routing).
CLEAR: F — The track classification is correctly set to irreversible for freezing a public shape.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Three concrete findings provided with severity and explicit file/section paths."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [],
  "validationOutput": [],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "",
  "reviewFindings": [
    "blocker: Assumption 3 vs Scope Out - spec panel prompt is frozen, leaving new rules structurally unenforced",
    "blocker: Definition of done item 3 - unfalsifiable requirement for a test asserting a markdown form 'requires' inputs",
    "medium: Scope In item 3 - unbudgeted verification machinery (contract tests) violating proportionality"
  ],
  "manualNotes": ""
}
```