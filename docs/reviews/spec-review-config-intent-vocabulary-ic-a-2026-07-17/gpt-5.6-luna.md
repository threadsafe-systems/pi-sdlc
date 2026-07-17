1. Migrated panels are truncated at the new floor

- severity: high
- confidence: high
- spec section targeted: §4.4, §5 R2, ICA12
- defect: The v2 vendor branch emits every credentialed, deduplicated roster entry, while the specified v3 resolution loop stops as soon as it reaches the floor. Thus the claimed identical-panel migration is false even when the roster has distinct vendors/models and no axis collision.
- evidence: In the current code, `resolveVendor()` loops through all `ph.prefer` entries without a floor break (`skills/sdlc/scripts/resolve-panel.mjs:172-193`), whereas `resolveLifecycle()` breaks immediately at `panel.length >= floor` (`skills/sdlc/scripts/resolve-panel.mjs:251-273`). The spec nevertheless says the candidate loop is preserved (§4.4, lines 125-126) and ICA12 requires identical panels (lines 339-342). The committed roster has four candidates in each phase (`.pi/sdlc/sdlc.config.json:37-51`) and floors 2/3/1 (`.pi/sdlc/sdlc.config.json:38,42,46,50`), so an all-credential fixture necessarily exposes the truncation.
- impact: ICA12 cannot pass against the natural all-credential fixture, and migration silently changes which reviewers run (including task validation), despite the plan's non-regression requirement.
- fix: Require v3 to retain the v2 candidate-collection cardinality/order (remove the early break), or explicitly redefine migration and ICA12 around a changed, floor-capped panel and amend the plan's non-regression contract.

2. The task-validation migration contradicts the binding mapping table

- severity: medium
- confidence: high
- spec section targeted: §5.4, §5 repo prediction, ICA6
- defect: The plan's binding v2→v3 table requires `minVendor: 1` on `task_validate` to be materialized as `panels.phases.task_validate.panelSize: 1`, but the spec explicitly drops it and predicts no task override.
- evidence: The governing plan requires that exact destination at `docs/plans/2026-07-17-config-intent-vocabulary.md:126`. The spec says all block-absent per-phase values equal to the default produce no override and specifically predicts “task_validate ... no override written” (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:160-164,187-194`), and ICA6 repeats that result at lines 312-320.
- impact: The frozen migration shape and ICA6 test will violate the plan's ratified mapping/DoD even though runtime floor behavior happens to remain 1; downstream consumers cannot rely on the binding destination shape.
- fix: Write `panels.phases.task_validate.panelSize: 1` for the migrated `minVendor: 1` row and update §5/ICA6, or obtain a plan amendment removing the explicit mapping requirement.

3. Valid v2 configs without a roster have no destination for per-gate floors

- severity: high
- confidence: high
- spec section targeted: §2 optional panels, §5.4, exhaustive-case claim
- defect: `inspectConfig` accepts a v2 config with a lifecycle block but no `panels`; when its plan/spec floor differs from the PR floor, §5 requires a `panels.phases.<phase>.panelSize` override even though there is no roster to carry or synthesize. The fold therefore either loses a committed floor or creates an invalid v3 panels block.
- evidence: The current v2 validator only validates `panels` when it is present (`skills/sdlc/scripts/lib.mjs:268-273`), so absence is an inspectConfig-accepted v2 shape. The spec makes `panels` optional in v3 (§2, lines 17-18), but requires per-phase floor overrides for differing plan/spec floors (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:155-164`) and then says step 8 merely carries roster fields (`:182-183`). A concrete accepted shape is the current standard preset's lifecycle, whose plan floor is 1 and PR floor is 2 (`skills/sdlc/scripts/setup-sdlc.mjs:46-52`), with `panels` omitted.
- impact: This is a valid v2 shape that hits no refusal R1-R3 but cannot be folded to a valid v3 shape while preserving semantics, disproving the §5 exhaustiveness assertion (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:187-194`).
- fix: Add a named refusal for missing-roster configs with unmappable per-phase floors (plan amendment required), or specify a valid standalone floor representation that does not require a roster and update the v3 contract.

4. Standard preset cannot both preserve v2 floors and round-trip to the stated v3 bundle

- severity: medium
- confidence: high
- spec section targeted: §5.4, §6 presets, ICA7
- defect: The v2 standard preset has `plan_review.minPanel: 1` and `pr_review.minPanel: 2`, so the stated migration algorithm must write a plan-phase override; the v3 standard answer bundle only declares `panelSize: 2` and has no such override. ICA7's claim that all three v2 presets fold onto their v3 bundles is therefore undefined/false.
- evidence: Current `LIFECYCLE_PRESETS.standard` sets plan review `minPanel: 1` and PR review `minPanel: 2` (`skills/sdlc/scripts/setup-sdlc.mjs:46-52`). The migration rule writes a per-phase override whenever a plan/spec floor differs from the PR-derived review floor (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:155-164`), yielding `review.panelSize: 2` plus `panels.phases.plan_review.panelSize: 1`. The v3 standard bundle lists only `panelSize 2` and no phase override (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:214-216`), while ICA7 demands round-trip (`:321-324`).
- impact: Build must guess whether “round-trip” means byte/shape equality or merely effective floors; either choice can make ICA7 or floor-preservation wrong, and a preset application can silently change standard plan-review composition.
- fix: Define round-trip as effective semantics and assert the explicit migrated plan override, or add that override to the canonical standard bundle and specify how it is represented when no roster is present.

5. R2 is not buildable without a frozen legacy vendor algorithm

- severity: medium
- confidence: high
- spec section targeted: §5.4 R2
- defect: R2 requires migration to reproduce the exact v2 `vendor()` equivalence relation after §4 deletes that heuristic, but the spec does not define or preserve the function in the migration surface. An implementer can choose a different legacy classification and accept/refuse a different set of valid v2 configs.
- evidence: The current v2 heuristic is a private function with concrete substring/order rules at `skills/sdlc/scripts/resolve-panel.mjs:116-126`; `modelIdentity()` is likewise defined at `:128-133`. The spec only says to use “v2 `vendor()` value” and that the vendor heuristic is deleted (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:165-171,105-108`), without a normative definition or required test vectors.
- impact: The claim that R1–R3 are exhaustive and that every non-refused roster is outcome-equivalent is not reproducible; migration safety depends on an undocumented deleted implementation detail.
- fix: Specify the exact legacy vendor function/test vectors in the migration contract and retain it as migration-only code, explicitly outside the v3 runtime resolver.

6. ICA12 does not falsifiably gate panel equivalence

- severity: medium
- confidence: high
- spec section targeted: ICA12
- defect: “Under identical simulated credentials” does not identify which credentials, author, or `--pong` setting must be used, nor does it give expected panel vectors. A fixture can credential only the first floor-sized candidates and pass while never detecting the truncation in finding 1.
- evidence: ICA12 only states identical panels “under identical simulated credentials” (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:339-342`), while candidate acceptance depends on provider credentials and optional PONG checks (`skills/sdlc/scripts/resolve-panel.mjs:109-114,183-190,258-263`). The repo roster contains more candidates than each floor (`.pi/sdlc/sdlc.config.json:37-51`), so credential selection changes the asserted outcome.
- impact: The purported non-regression gate can pass without exercising the behavior it claims to compare, leaving a breaking panel-composition change undetected.
- fix: Pin the exact all-candidate credential map, author value, `--pong` state, command arguments, expected panel arrays, and stderr normalization in ICA12.

7. The purge scenario conflicts with the required retired-flag diagnostics

- severity: medium
- confidence: high
- spec section targeted: §6 retired flags, §7 P5, ICA20
- defect: ICA20 asks for a grep with zero occurrences of `profile` and `enforcement` in `skills/sdlc/`, while §6 requires setup to recognize those retired flags and emit errors naming their successors. The scenario does not define an allowlist or a semantic distinction that the stated grep can apply.
- evidence: Retired-flag handling is normative and explicitly names `--profile` and `--enforcement` (`docs/specs/2026-07-17-config-intent-vocabulary-ic-a.md:205-208`), while ICA20 says grep `skills/sdlc/` for zero occurrences of both terms (`:373-376`). The current setup parser necessarily contains those flag names (`skills/sdlc/scripts/setup-sdlc.mjs:158-165,215-219`) and current config vocabulary also appears in the resolver (`skills/sdlc/scripts/resolve-panel.mjs:70-80`).
- impact: A literal implementation of ICA20 fails the required retired-flag behavior; a hand-waved semantic grep is not a reproducible acceptance test and can miss vestigial readers.
- fix: Define ICA20 as a syntax-aware search for persisted/current config-key reads with an explicit allowlist for retired CLI spellings and migration fixtures, then test both the allowlisted diagnostics and zero runtime readers.

CLEAR: F — no additional ungrounded performance, durability, or security defect was identified beyond the migration atomicity behavior already explicitly inherited and tested by the spec.
CLEAR: G — no separate honesty defect was identified beyond the concrete non-regression overclaim in finding 1.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Completed the requested read-only adversarial specification review without modifying implementation scope or repository files."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Seven numbered, code-grounded findings include exact spec sections, repository file:line evidence, impact, and smallest fixes."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read spec, governing plans/ADRs, and current implementation files with nl/grep/git status",
      "result": "passed",
      "summary": "Reviewed all requested artifacts and grounded findings against HEAD 63ef0d6."
    }
  ],
  "validationOutput": [
    "Confirmed working-tree review artifacts are uncommitted and no implementation files were changed."
  ],
  "residualRisks": [
    "The spec's migration implementation is not present, so findings identify contract defects rather than runtime test failures."
  ],
  "noStagedFiles": true,
  "diffSummary": "No repository files modified; review artifact only.",
  "reviewFindings": [
    "high: resolve-panel v3 breaks before the floor while v2 emits all candidates, invalidating ICA12.",
    "medium: task_validate panelSize mapping contradicts the governing plan.",
    "medium: standard preset round-trip is contradictory.",
    "medium: R2 depends on an unspecified deleted vendor heuristic.",
    "medium: ICA12 leaves credential fixtures ambiguous.",
    "medium: ICA20 conflicts with required retired-flag diagnostics.",
    "high: v2 configs without panels cannot preserve differing per-phase floors."
  ],
  "manualNotes": "Findings are intentionally limited to high-confidence, evidence-backed specification defects."
}
```
