### Legacy non-regression contradicts the mandatory evidence checks

- severity: high
- confidence: high
- location: Scope in 2 and 5–6 (lines 53–65, 83–101); Definition of done 1 and 4 (lines 130–145)
- defect: The plan promises byte-for-byte v1 behavior for every repo without a `lifecycle` block while also appending evidence checks that the ratified contract makes failing for an irreversible PR with no evidence manifest. Those requirements cannot both be satisfied.
- evidence: The plan says “Absent block ⇒ today's full shape **byte-for-byte**” and requires existing FS9 v1 fixtures to remain green unmodified, but issue #41 Resolution §1 classifies a missing `evidence.channels.json` as `fail → 1` on the irreversible track; `test/check-lifecycle-git.test.js:20-31,44-59` constructs an irreversible, no-`lifecycle`, no-evidence fixture and requires exit 0.
- impact: Definition of done 1 is impossible under the ratified evidence applicability, so either legacy consumers silently acquire a new failure or the evidence contract is weakened; the current test requirement cannot adjudicate which behavior is intended.
- fix: Narrow “absent block = full” to effective lifecycle-dial semantics and state the intentional FS9-v2 evidence migration/applicability separately, including which existing v1 fixtures must change or remain green.

### The base-tip shape is unavailable on the shipped execution paths

- severity: high
- confidence: high
- location: Scope in 6 (lines 97–101); Definition of done 4 (lines 139–145); Compatibility constraints (lines 163–168)
- defect: The plan mandates base-branch-tip judging but does not add the dependency that makes the base commit readable in CI, nor define a shape source for the still-supported local `--body` and `--track` modes. “Error on unreadable base” therefore turns the current shipped workflow into an error path and leaves local verdict semantics unspecified.
- evidence: The shipped workflow uses default shallow `actions/checkout@v4` with no base fetch (`skills/sdlc/assets/sdlc-lifecycle.yml:13-23`), while the checker event parser currently retains only body and author (`skills/sdlc/scripts/check-lifecycle.mjs:136-145`) and its CLI has no base-ref input (`skills/sdlc/scripts/check-lifecycle.mjs:29`); ADR 0017 says the checker remains canonical locally.
- impact: CI may exit 2 because the base-tip object is absent, and local checks can disagree with CI or cannot evaluate shaped repos at all, breaking the promised local/CI checker contract.
- fix: Add scope and DoD scenarios for extracting the event base SHA, provisioning/fetching that object in both shipped and dogfood workflows, and a pinned base-shape rule or explicit base-ref input for local modes.

### Ratified setup nudges have no FS10 evolution path

- severity: high
- confidence: high
- location: Evidence ladder (lines 83–89); Definition of done 8 (lines 157–161)
- defect: The plan omits the ratified setup-report `recommendation:` surface from its DoD and records evolution only for FS9 and the evidence artifact, even though adding that line changes frozen FS10 output. Implementing the upstream decision would therefore violate ADR 0018; omitting it would violate issue #41.
- evidence: Map issue #34’s decision record for #41 explicitly says nudges are emitted by “checker + setup,” and issue #41 Resolution §4 specifies a `recommendation: ci-workflow` bundle-report line; ADR 0018 freezes FS10 v1 text/JSON report shape and requires an explicit schema-version bump and migration (`docs/adr/0018-adoption-bundle-fs10.md:8-13,30`).
- impact: The Specification has no compliant choice: it must either silently mutate a frozen consumer surface or drop a ratified adoption behavior.
- fix: Add the setup recommendation to scope/DoD and require the corresponding FS10 schema-version/ADR migration (including text and JSON representation).

### Existing adopters have no safe path to select a profile

- severity: medium
- confidence: high
- location: Profiles (lines 66–73); Definition of done 2 (lines 134–136); Scope out (lines 110–126)
- defect: Setup is required to write expanded profile dials, but the plan defines only fresh-write behavior and neither includes nor excludes migration of an existing implicit-`full` manifest. The shipped setup contract retains a no-intent existing config and refuses a mutating replacement without `--force`, which replaces the whole config.
- evidence: `setup-sdlc` treats an existing config as retained, refuses config mutation without `--force`, and overwrites it with `--force` (`skills/sdlc/scripts/setup-sdlc.mjs:379-392`); map issue #34, “Not yet specified,” explicitly leaves “the setup/tune path” for already-adopted implicit-full repos unresolved. The plan’s out-of-scope list does not dispose of that dependency.
- impact: Existing consumers cannot opt into `solo` or `standard` through the promised setup flow without destructive reconstruction risk to paths, tracker, and hooks, so a central adoption cohort is untestable.
- fix: Add one migration scenario that applies a selected profile to an existing valid manifest while preserving unrelated consumer-owned config and respecting FS10 refusal semantics.

### `custom` is incorrectly treated as a fourth preset

- severity: medium
- confidence: high
- location: Profiles (lines 66–68); Definition of done 2 (lines 134–136)
- defect: The plan calls all four profile values presets and requires “all four presets” to round-trip, contradicting the ratified decision that `custom` has no preset expansion and every dial is hand-picked at setup.
- evidence: Issue #37 Resolution states: “`custom` = no preset, every dial hand-picked at setup”; the plan instead says “`solo`/`standard`/`full`/`custom` presets expanded by setup” and “all four presets round-trip.”
- impact: A spec following the plan can invent and freeze an unintended default `custom` shape, defeating the closed-vocabulary/provenance contract.
- fix: Describe three presets plus a custom interview path, and replace the fourth-preset DoD check with validation of a fully hand-selected representative custom shape.

### Standalone PR review can bypass an adopted profile floor

- severity: medium
- confidence: high
- location: Standalone entrypoints (lines 74–82); Context for Spec (lines 182–185)
- defect: “`pr-review` … minus the profile floor” and the unqualified open “fixed panel default” contradict adopted-config-dominates; the fixed fallback is ratified only for an unadopted repo with no config to read.
- evidence: Issue #38 Resolution’s table says adopted `sdlc:pr-review` “runs as configured gate,” and its adversarial-review ruling explains that the small fixed default applies because an unadopted repo has “no committed config to read `minPanel`/`minVendors` from.”
- impact: An adopted consumer could invoke the standalone surface to evade its committed `pr_review` mode and panel floors, directly violating the plan’s own “may not skip forward past your own committed shape” objective.
- fix: Qualify the fixed default and profile-floor bypass as unadopted-only; require adopted standalone PR review to use the committed mode and floors.

CLEAR: F — The plan correctly classifies the new config vocabulary, report schema, and evidence schema as irreversible surfaces.
