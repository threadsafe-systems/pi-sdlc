### Identity normalisation is ambiguous for colon-bearing model IDs and is not fully gated

- severity: high
- confidence: high
- location: §2 “Panellist identity” (docs/specs/2026-07-14-opt-in-lifecycle-config.md:94-101); OLA10 (lines 333-340)
- defect: “any `:thinking` suffix stripped” does not define the recogniser that distinguishes a Pi thinking suffix from a colon that is part of the model ID. Consequently, implementations can either strip a Bedrock version suffix (collapsing version-strict identities) or retain an effort suffix; OLA10 also has no case proving that the provider portion participates in identity.
- evidence: The pinned models schema deliberately accepts arbitrary colon suffixes because Bedrock model IDs use one, giving `amazon-bedrock/anthropic.claude-opus-4-8-v1:0` as its example, while separately enumerating Pi thinking levels `off|minimal|low|medium|high|xhigh|max` (skills/sdlc/schema/sdlc.models.schema.json:46-47). The new normative text only says “any `:thinking` suffix” (spec:95) and OLA10 exercises `:high`/`:low` and same-provider version strings, but neither a Bedrock `:0`/`:1` pair nor `p/model` versus `q/model` (spec:333-340).
- impact: This irreversible identity rule can silently merge distinct versioned models or count effort variants as distinct; an implementation that keys on only the model segment also passes all listed OLA10 cases despite violating the declared `provider/model` identity.
- fix: Define the exact trailing-token recogniser (including whether only the seven named Pi levels are stripped and how an otherwise identical model ID is represented) and add OLA10 cases showing `amazon-bedrock/...:0` != `...:1` and `p/m` != `q/m`.

### OLA12 retains the removed vendor floor

- severity: medium
- confidence: high
- location: OLA12 (docs/specs/2026-07-14-opt-in-lifecycle-config.md:347-349); plan scope item 2 (docs/plans/2026-07-14-opt-in-lifecycle.md:111-115)
- defect: The re-cut scenario still requires `task_validate` floors “fixed 1/1,” which retains the former model/vendor notation after the normative contract and plan changed this path to a fixed one-model floor.
- evidence: §4.2 now says `task_validate` uses “fixed floor 1 model” (spec:240-242), and the ratified plan says “fixed floor of 1 model” (plan:111-115), whereas OLA12 alone says “fixed 1/1” (spec:347-349).
- impact: The verification contract can preserve or reintroduce a vendor dimension in the lifecycle path, directly contradicting the amendment that vendor is absent from lifecycle vocabulary.
- fix: Change OLA12 to require a fixed one-distinct-model floor and explicitly assert that no vendor count or vendor diagnostic is calculated on the lifecycle-present path.

### The author-model rule is not falsified against the existing vendor opt-out

- severity: medium
- confidence: high
- location: §4.2 “Author-model exclusion” (docs/specs/2026-07-14-opt-in-lifecycle-config.md:210-218); OLA11 (lines 341-346)
- defect: The lifecycle contract says author-model exclusion is active whenever effective `minPanel >= 2`, but neither the contract nor OLA11 states/gates what happens when the extant FS2 `rules.exclude_author_vendor` is `false`. An implementation can retain that old guard, disabling the new model exclusion, and pass OLA11's default-rule fixture.
- evidence: The existing FS2 schema exposes `rules.exclude_author_vendor` (skills/sdlc/schema/sdlc.models.schema.json:16-21), and the current resolver makes exclusion conditional on it (skills/sdlc/scripts/resolve-panel.mjs:110-113). OLA11 tests model matching, suffix stripping, and the v1 bare-vendor path, but does not set that rule false (spec:341-346).
- impact: A committed lifecycle shape may silently allow author self-review based on a legacy vendor setting, violating the ratified active-at-2 author-model rule and leaving the regression undetectable.
- fix: State that lifecycle-present author-model exclusion ignores `rules.exclude_author_vendor`, and add an OLA11 fixture with that rule `false` which still excludes the author model at `minPanel: 2`.

CLEAR: E — Existing resolver vendor-keyed behaviour is explicitly confined to the byte-identical no-`lifecycle` v1 path; no additional framework/lifecycle mismatch was found in the delta.
CLEAR: F — The delta adds no distinct performance, durability, or security claim beyond deterministic/non-regression contracts; the identified identity cases are covered by the findings above.
CLEAR: G — Apart from the concrete contradictory OLA12 verification wording, no new unsupported outcome claim was found.
