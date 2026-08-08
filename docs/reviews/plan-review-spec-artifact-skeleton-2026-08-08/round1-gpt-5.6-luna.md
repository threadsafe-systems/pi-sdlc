### Public-reference inventory omission blocks completion

- severity: high
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:25,49,60`
- defect: The plan adds a new public reference but restricts changes to `phase-spec.md` and that file, while DoD 7 requires the reference inventory to pass. FS11 discovers every `skills/sdlc/references/*.md` file and fails if it lacks an inventory row.
- evidence: `skills/sdlc/assets/normative-references.json:890-891`; `skills/sdlc/scripts/check-references.mjs:119-133`; existing phase-spec inventory row at `skills/sdlc/assets/normative-references.json:340-348`.
- impact: An implementation following scope necessarily fails the required inventory check, so the slice cannot satisfy its own DoD or ship as a package-certified public surface.
- fix: Add the required `normative-references.json` row and explicitly allow that metadata/test change in scope.

### Required tests are excluded by the file-change boundary

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:32,49,56,65`
- defect: Scope requires contract tests, but Assumption 4 says only the two reference surfaces change and the context names only those edit targets.
- evidence: The plan requires “Contract tests” at `:32` and DoD 3 at `:56`, while `:49` says “only `phase-spec.md` and the new … skeleton change.”
- impact: The implementer cannot both add the required tests and obey the stated frozen-surface discipline; review cannot distinguish permitted test changes from scope violations.
- fix: State that contract tests and required inventory metadata are permitted, while limiting the two-file rule to production authoring surfaces.

### Interface coverage rule contradicts the skeleton scope

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:27,31`
- defect: The skeleton requires a Contracts block “per changed interface,” but the binding rule requires a block for every interface named anywhere in the body. The plan does not define whether unchanged/external interfaces mentioned for context need blocks.
- evidence: The ratified R3 candidate has the same unresolved split: `docs/briefs/2026-07-26-design-phase-r3-spec.md:103,106`; S1 retains the contract-block shape in `docs/briefs/2026-07-26-design-phase-r5-synthesis.md:58`.
- impact: Authors can follow the skeleton and still violate the binding rule, or add needless contract blocks for interfaces not changed; the interface artifact shape is not consistently buildable.
- fix: Define “interface named” as “changed interface,” or require explicit unchanged/interface-context blocks.

### Reviewer-parity objective is not supported by the frozen prompt

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:13,31,39,48`
- defect: The objective claims authors receive the same skeleton reviewers demand and assumes the panel enforces every new rule, but the unchanged reviewer prompt only names signatures/types/error semantics and NFR-to-scenario binding.
- evidence: `skills/sdlc/prompts/adversary-spec.prompt.md:23-29` contains no Vocabulary table, scenario-kind labels, `Given:`, or NFR measure/unbound requirement; the plan explicitly forbids changing that prompt at `:39`. R5 describes S1’s intended skeleton at `docs/briefs/2026-07-26-design-phase-r5-synthesis.md:58`.
- impact: Four of the five new obligations have no explicit reviewer-side enforcement contract, so the claimed asymmetry closure is overstated and omissions may remain panel discoveries.
- fix: Narrow the objective to authoring guidance parity with the reviewer attack surfaces and explicitly require the existing panel flow to load and verify this phase reference.

### Prevention outcome has no falsifiable verification path

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:13,48,54-56,68`
- defect: The objective promises that under-specification is prevented, but the plan explicitly says tests only prove guidance text is present and excludes dogfooding a real spec.
- evidence: `:48` says tests do not prove a spec satisfies the rules, while `:68` says no real spec is required; DoD 3 at `:56` only checks that labels appear in the skeleton.
- impact: A deliberately malformed specification can pass every planned test, so the central outcome is asserted rather than falsifiable.
- fix: Recast the outcome as making omissions explicit and reviewable, or add a bounded fixture/check that validates a representative spec against the skeleton.

### CI verification has no proportionality budget

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:32,60`
- defect: DoD 7 gates on the full corpus, lint, inventory, and lifecycle checks without time/cost bounds; “touched-surface lint” is not an existing command.
- evidence: `package.json:27-31` defines only `npm test` and whole-repository `biome check .`; CI runs them at `.github/workflows/ci.yml:26-31` without a timeout.
- impact: Added verification cost can grow without a falsifiable budget, violating the required proportionality check for CI/gate machinery.
- fix: Name exact commands and state a measured focused-test budget plus an external timeout and offline/no-network constraint for the full gate.

CLEAR: A — The irreversible track matches the new public authoring shape and no locked artifact shape is reopened.

CLEAR: E — The slice changes documentation guidance only; no runtime framework behavior is introduced.

CLEAR: F — The plan does state an NFR measure-plus-scenario or explicit-unbound rule.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Returned six concrete, file-grounded findings with severity and remediation."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "git status --short && git rev-parse HEAD",
      "result": "passed",
      "summary": "Confirmed review commit and clean worktree."
    },
    {
      "command": "git diff 756f929^ 756f929 --stat",
      "result": "passed",
      "summary": "Confirmed the target commit adds only the plan."
    },
    {
      "command": "npm test",
      "result": "not-run",
      "summary": "Read-only plan review; no implementation tests required."
    }
  ],
  "validationOutput": [
    "Read the plan, ratified R3/R5 briefs, phase references, router, frozen-surface test, reviewer prompt, and real spec."
  ],
  "residualRisks": [
    "The plan remains internally unimplementable until inventory scope and verification budgets are corrected."
  ],
  "noStagedFiles": true,
  "diffSummary": "No files modified; adversarial review only.",
  "reviewFindings": [
    "high: public reference inventory omission blocks completion",
    "medium: required tests excluded by file-change boundary",
    "medium: interface coverage rule contradicts skeleton scope",
    "medium: reviewer-parity objective is unsupported by the frozen prompt",
    "medium: prevention outcome has no falsifiable verification path",
    "medium: CI verification has no proportionality budget"
  ],
  "manualNotes": "No supervisor coordination or repository edits were needed."
}
```