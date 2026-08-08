PLAN-R1-01: fixed — Prompt scope is limited to skeleton-awareness; re-round mechanics remain explicitly out of scope (plan:32,41,50).
PLAN-R1-02: fixed — FS11 inventory-row delivery and checking are explicit (plan:33,62).
PLAN-R1-03: fixed — DoD now requires literal `Given:`/`When–Then:`/`Falsify:` blocks (plan:34,58).
PLAN-R1-04: fixed — Objective now claims explicit/reviewable guidance, not mechanical prevention (plan:13,50).
PLAN-R1-05: fixed — Additional permitted change classes are named separately from production authoring prose (plan:51).
PLAN-R1-06: fixed — Interface coverage is consistently limited to introduced/modified interfaces (plan:27,31).
PLAN-R1-07: fixed — Test and full-suite budgets plus the real Biome command are stated (plan:34,62).

### Standing IDV19 guard makes the planned unfreeze fail the full suite

- severity: high
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:32,60,67`
- defect: The plan requires removing `adversary-spec.prompt.md` from `FROZEN`, but the existing IDV19 test requires every adversary prompt to remain there. The plan does not permit or require reconciling that standing assertion.
- evidence: `test/iteration-disposition.test.js:491-498` loops over all adversary prompts and asserts each is frozen; `test/frozen-surfaces.test.js:29-32` currently includes the spec prompt.
- impact: Any implementation following the amended unfreeze fails `npm test`, making DoD 7 unreachable.
- fix: Add `test/iteration-disposition.test.js` to the permitted changes and specify the temporary IDV19 reconciliation and its restoration during re-freeze.

### No mandatory post-merge re-freeze protects the reopened prompt

- severity: high
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:32,60,67`
- defect: The amendment treats removing the prompt from `FROZEN` as the end state and does not require the mandatory follow-up that restores standing protection.
- evidence: The project precedent says the post-merge re-freeze is mandatory and the slice is incomplete until it merges (`docs/specs/2026-07-24-pv1-task-scoped-tests.md:238-245`; `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:138-140`).
- impact: ASD19 permanently stops guarding this public reviewer contract, allowing later prompt drift to merge unobserved.
- fix: Require an immediate track-none follow-up that re-adds the prompt to `FROZEN`, restores IDV19, and make slice completion depend on that follow-up merging.

### Prompt attack-surface placement and output compatibility are unspecified

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:32,41,58,60`
- defect: “Add attack surfaces” does not say whether to extend existing A–H surfaces or add a new letter, while the prompt’s strict output contract only requires `CLEAR` lines for A–H (`skills/sdlc/prompts/adversary-spec.prompt.md:21-49`). A new skeleton surface would require an output-contract change that the plan otherwise forbids.
- evidence: Existing prompt has closed A–H attack-surface/output wording; the plan permits only skeleton-awareness attack-surface diffs.
- impact: An implementation can leave the strict output contract stale or omit a separately testable skeleton surface.
- fix: Specify the exact existing surfaces to extend and require exact skeleton-path/component anchors without adding a new attack-surface letter or touching round mechanics.

### Generic prompt change does not reach consumer prompt overrides

- severity: medium
- confidence: high
- location: `docs/plans/2026-08-08-spec-artifact-skeleton.md:13,32,50`
- defect: The objective claims the spec panel will enforce the skeleton, but runtime prompt resolution uses a consumer override before the package prompt (`skills/sdlc/scripts/ensure-panel-agent.mjs:71-75`). The repository’s own spec override has no skeleton-awareness surfaces (`test/fixtures/consumer/.pi/sdlc/prompts/adversary-spec.prompt.md:21-29`).
- impact: Consumers with an override remain unenforced, so the claimed asymmetry closure is not universal.
- fix: Bound the objective to the package-default prompt and explicitly declare consumer overrides outside this slice, or specify an override migration contract.

CLEAR: F — The irreversible track remains appropriate for the intentionally frozen artifact/prompt shape; no new schema, API, dial, or configuration shape is introduced.
CLEAR: PROPORTIONALITY — Current `npm test` passes 534 tests in about 5 seconds, making the stated 30-second external bound plausible; the offline string-test budget is also proportionate.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Returned four concrete delta findings with severities, locations, and repository file:line evidence."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "timeout 30 npm test",
      "result": "passed",
      "summary": "534 passed, 0 failed, approximately 5.05 seconds."
    },
    {
      "command": "git diff --check 756f929..832e182 -- docs/plans/2026-08-08-spec-artifact-skeleton.md",
      "result": "passed",
      "summary": "No whitespace errors."
    },
    {
      "command": "git status --short",
      "result": "passed",
      "summary": "No staged or worktree changes."
    }
  ],
  "validationOutput": [
    "Reviewed only the amended plan text against the round-1 adjudication and repository contracts."
  ],
  "residualRisks": [
    "IDV19 will fail unless temporarily reconciled with the planned prompt unfreeze.",
    "The prompt requires a mandatory post-merge re-freeze to restore ASD19 protection.",
    "Consumer prompt overrides bypass the amended package-default attack surfaces."
  ],
  "noStagedFiles": true,
  "diffSummary": "Reviewed the plan amendment from 756f929 to 832e182; no files modified.",
  "reviewFindings": [
    "high: test/iteration-disposition.test.js:491-498 - planned FROZEN removal contradicts the standing IDV19 assertion.",
    "high: docs/plans/2026-08-08-spec-artifact-skeleton.md:32,60,67 - mandatory post-merge re-freeze is absent.",
    "medium: skills/sdlc/prompts/adversary-spec.prompt.md:21-49 - prompt attack-surface/output placement is unspecified.",
    "medium: skills/sdlc/scripts/ensure-panel-agent.mjs:71-75 - consumer overrides bypass the new enforcement."
  ],
  "manualNotes": "All PLAN-R1-01..07 fixes were confirmed before reporting new delta defects."
}
```