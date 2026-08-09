### Required phase surfaces are excluded from the contract and carried scope

- id: SPEC-R1-01
- severity: high
- area: B
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:305-307` — “phase-brainstorm.md §4/§8, phase-plan.md §6a/§6b, the one new test file”
- defect: The plan requires edits to `phase-brainstorm.md` §1 and §9 and `phase-plan.md` §4, but neither the C1–C7 contracts nor GPC15 covers those surfaces. A correct implementation must either fail GPC15 or modify required surfaces without a gating scenario.
- fix: Add §1, §9, and phase-plan §4 to the relevant contract signatures and scenarios, and widen GPC15’s permitted-surface list.

### The §8 contract omits required gate artifacts and lifecycle behavior

- id: SPEC-R1-02
- severity: high
- area: B
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:28-30` — “one §8 block … exactly one fenced example showing a sketch and all three decision-line kinds”; `:168-174` — GPC1 checks only that example and framing prose.
- defect: The plan requires exactly two artifacts, a sketch trigger and absence declaration, the amendment loop, and the transition carrying provenance, but C1/GPC1 do not require or verify any of these. An implementation containing only the example and framing language can pass the spec while omitting core §8 behavior.
- fix: Extend C1 and GPC1 with exact-two-artifact, sketch-trigger/absence, amendment-loop, and provenance-transition requirements and falsifiers.

### One-line entry shape is not frozen or gated

- id: SPEC-R1-03
- severity: medium
- area: B
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:59-67` — C3 specifies prefixes and appetite ordering but no one-line entry invariant; `:210-213` — GPC5 only requires a one-line “why” for `decision:` lines.
- defect: The approved plan requires all decision-list entries to be one line, but multiline `appetite:` or `rejected:` entries are permitted by this spec and remain prefix-discoverable, so the estimator-facing shape is not actually enforced.
- fix: Add an invariant that every list entry is one physical line and make GPC5 mechanically reject multiline entries of all three kinds.

### C2 makes its standalone branch unreachable

- id: SPEC-R1-04
- severity: medium
- area: E
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:44-48` — C2 includes “the no-upstream declaration branch” but states its precondition as “a Plan is being authored from a Brainstorm outcome.”
- defect: A standalone Plan is specifically not authored from a Brainstorm outcome, so the stated precondition excludes the branch whose contract C2 claims to define.
- fix: Change the precondition to cover either a Brainstorm-derived Plan or a standalone Plan with live-formed intent and an explicit `no upstream gate` declaration.

### ADR suffix optionality contradicts the ratified requirement

- id: SPEC-R1-05
- severity: medium
- area: E
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:59-61` — “optional `(-> ADR 00NN)` suffix on decision/rejected lines”; `:221-224` — GPC6 verifies only the suffix spelling.
- defect: The approved plan says “qualifying decisions take the suffix” (`docs/plans/2026-08-09-gate-presentation-contract.md:47-49`), but this spec permits omitting it and has no scenario for the qualification rule.
- fix: State that the suffix is required whenever the referenced Governance bar applies and add that conditional requirement to GPC6.

### A mechanical scenario uses an undecidable semantic test

- id: SPEC-R1-06
- severity: medium
- area: C
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:255-263` — GPC10 requires a runner to determine whether an assertion “embeds a rule definition” or “restat[es] substance,” with only an example involving copied ADR criteria.
- defect: No executable criterion distinguishes copied rule substance, paraphrase, or legitimate test prose, so a runner cannot decide this mechanical scenario as written; both false positives and semantic restatements that evade the wording are possible.
- fix: Pin an exact finite set of forbidden literal strings/substrings for the test, or relabel the semantic portion as inspection.

### Dogfood verification does not actually verify the canonical home

- id: SPEC-R1-07
- severity: medium
- area: D
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:294-299` — GPC14’s Given names only the plan and map index, and its falsifiers omit a mismatched sketch; the When–Then merely says the plan “carries the sketch verbatim.”
- defect: The plan requires the sketch to be embedded verbatim in both modes (`docs/plans/2026-08-09-gate-presentation-contract.md:102-106`), but GPC14 does not require fetching the linked resolution comment or comparing the two sketches. A stale or altered embedded sketch can therefore pass.
- fix: Include the canonical home body in Given, require byte-for-byte comparison of the sketch and home record, and add a mismatched-sketch falsifier.

### Compatibility NFR is broader than its binding scenario

- id: SPEC-R1-08
- severity: medium
- area: F
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:157` — “Zero new tooling, scripts, or dependencies”; `:265-270` — GPC11 checks only schema identity and configuration keys.
- defect: A new script, package dependency, or tool can be added without changing the schema or a governed-doc configuration key, so GPC11 cannot gate the NFR’s stated response measure.
- fix: Add checks for package manifests/lockfiles and new tooling/script surfaces, or narrow the NFR to the schema/config invariants GPC11 actually verifies.

### Modularity NFR is not verified by GPC3

- id: SPEC-R1-09
- severity: medium
- area: F
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:158` — “The edit touches exactly one artifact (the home); no copy to update”; `:188-196` — GPC3 checks only static storage prose and duplication rules.
- defect: GPC3 cannot decide what a post-gate edit would touch and does not verify the claimed one-artifact update behavior. The NFR is therefore bound to a scenario that asserts a different, weaker property.
- fix: Bind the NFR to an explicit unique-home scenario, or replace the response measure with the static one-home/no-duplicate invariant that GPC3 actually checks.

### GPC12 names a non-existent repository-root command

- id: SPEC-R1-10
- severity: medium
- area: C
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:275-278` — “`scripts/check-references.sh` exits 0.”
- defect: From the repository root there is no `scripts/check-references.sh`; the wrapper is `skills/sdlc/scripts/check-references.sh` (`skills/sdlc/scripts/check-references.sh:1-4`). The scenario cannot be executed as written, unlike the plan’s full path at `docs/plans/2026-08-09-gate-presentation-contract.md:158`.
- fix: Use `bash skills/sdlc/scripts/check-references.sh` or the plan’s exact `node skills/sdlc/scripts/check-references.mjs` command.

### The no-parser prohibition has no gating scenario

- id: SPEC-R1-11
- severity: medium
- area: B
- quote: `docs/specs/2026-08-09-gate-presentation-contract.md:148-150` — “Enforce with contract tests only — no gate-time parser, no new dial”; `:135-139` — C8 gates restating tests and config dials but not parser absence.
- defect: The plan explicitly requires both no parser and no dial (`docs/plans/2026-08-09-gate-presentation-contract.md:53-55`), but no GPC scenario rejects a parser. A parser can be added inside the permitted new test file while GPC10–GPC12 remain green.
- fix: Add a mechanical or PR-gate inspection scenario that explicitly rejects parser/runtime grammar machinery and binds it to the no-parser requirement.

CLEAR: PROPORTIONALITY — No separate over-engineering defect is supported; the offline contract-test pattern is explicitly selected by the approved plan.

VERDICT: 11 findings (2 high, 9 medium, 0 low)
