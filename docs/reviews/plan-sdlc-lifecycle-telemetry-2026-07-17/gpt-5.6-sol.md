### Auto-emitted events have no unambiguous run identity

- severity: high
- confidence: high
- location: R1, lines 34–54; Scope/In, lines 144–147
- defect: Every event requires a `slug`, but the plan makes `resolve-panel`, `ensure-panel-agent`, and `validate-task` emit automatically without defining any active-run identity source. None of those frozen inputs currently carries the feature slug.
- evidence: The plan requires `slug` in every event and says emission is always-on rather than a remembered flag (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:34-54`); `resolve-panel`'s CLI has no slug/run argument (`skills/sdlc/scripts/resolve-panel.mjs:9-11`), neither does `ensure-panel-agent` (`skills/sdlc/scripts/ensure-panel-agent.mjs:11-12`), and the task manifest's closed property set has no feature/run slug (`skills/sdlc/scripts/validate-task.mjs:100-108`). FS5 also freezes the two panel-script flags and exit contracts (`docs/adr/0005-script-clis-fs5.md:3-9`).
- impact: A spec must either guess from cwd/artifact names, silently attribute events to the wrong interleaved feature, or change frozen CLIs/manifests that the plan does not declare it will version; the central “every run” telemetry guarantee cannot be implemented honestly as written.
- fix: Add a locked active-run identity contract to the plan and explicitly scope/version every frozen CLI or manifest surface needed to establish it without caller guesswork.

### Regeneration omits non-regenerable raw inputs

- severity: high
- confidence: high
- location: R3, lines 77–100; Constraints, lines 172–186; Risks, lines 197–217
- defect: The plan justifies “regenerate from raw archives, never migrate” using the R1/R2 store, but that store archives only manifest and panel artifacts while `collect` also depends on parent pi transcripts, mutable GitHub threads, and LLM classification. No retention or snapshot mechanism makes those additional inputs part of the raw archive.
- evidence: `collect` joins session transcripts, reviews, git/GitHub, and LLM-produced data (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:77-100`), while the asserted always-on raw store is only R1/R2 (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:84-86`) and R2's retained artifacts are panel `status.json`/`events.jsonl`, with only child transcripts optional (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:61-69`).
- impact: Once a parent session is pruned, a PR thread changes, or the classification model changes, a committed v1 record cannot be regenerated into an evolved additive schema from the promised archive, defeating the ratified no-migrator policy.
- fix: Require immutable local snapshots and retention rules for every non-reconstructible collector input (including correlated parent sessions, GitHub data, and attributed soft-data source/output) before claiming regeneration is complete.

### Lifecycle-check telemetry contradicts frozen FS9 and can escape completion

- severity: high
- confidence: high
- location: R1, lines 39–43; Scope/In, lines 144–148; Definition of done, lines 227–229
- defect: R1 requires lifecycle-check runs to auto-emit, which makes the checker write state despite FS9's locked read-only contract, yet the scope and DoD enumerate only `resolve-panel`, `ensure-panel-agent`, and `validate-task`. The feature can therefore satisfy every checkbox while omitting this required event, or implement it by silently violating FS9.
- evidence: The required auto-emitted list includes “lifecycle check runs” (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:39-43`), but the integration scope and fixture-verification checkbox omit `check-lifecycle` (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:144-148`, `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:227-229`). FS9 explicitly settles that “The checker is read-only, offline, and canonical locally” (`docs/adr/0017-lifecycle-checker-fs9.md:17-23`), matching the implementation's read-only declaration (`skills/sdlc/scripts/check-lifecycle.mjs:1-4`).
- impact: This reopens a locked consumer contract without an ADR/versioning decision, and the current acceptance boundary cannot detect that one of R1's named inflection points never records telemetry.
- fix: Put lifecycle-check recording in scope and DoD, and choose explicitly between caller-side recording that preserves FS9 or an explicit FS9 supersession with compatibility tests.

### Collector completion checks cover only a fraction of R3

- severity: medium
- confidence: high
- location: R3, lines 77–100; Definition of done, lines 235–240
- defect: R3 requires five joined source families and numerous derived measures, but the DoD checks only complete/gappy run-store output, coverage markers, size proxies, per-model rollups, and the presence of soft data. It has no falsifiable acceptance for transcript extraction, review/adjudication joins, git/GitHub joins, phase timing, panel precision, cost-per-incorporated-finding, intervention counts, or rework calculations.
- evidence: The source joins and derived metrics are enumerated at `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:77-100`; the collector DoD asserts only the narrower set at `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:235-240`.
- impact: A collector that ignores whole inputs or computes the dashboard's decision-driving metrics incorrectly can still meet the stated definition of done.
- fix: Expand the DoD to require offline fixtures and exact assertions for every R3 source adapter and derived-measure family, using injected fake GitHub and LLM seams.

### The FS1 paths decision is simultaneously out of scope and left open

- severity: medium
- confidence: high
- location: Scope/Out, lines 163–168; Context for the Specification author, lines 280–297
- defect: The plan excludes config-schema changes but instructs the Specification to choose between hardcoded paths and extending `paths`, so one of the explicitly permitted spec answers violates the approved scope.
- evidence: Config schema changes are out of scope (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:163-167`), while the spec is told to decide whether to hardcode or extend `paths` (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:280-282`, `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:290-297`). FS1 currently closes `paths` to `plans`, `specs`, `reviews`, and `agents` (`skills/sdlc/scripts/lib.mjs:187-203`; `skills/sdlc/schema/sdlc.config.schema.json:30-38`).
- impact: The spec gate cannot tell whether an additive FS1 change is authorized, and implementations can diverge on a consumer-visible location contract.
- fix: Decide in the plan that v1 hardcodes the locked telemetry homes, or move the additive FS1 extension explicitly into scope and ADR/DoD coverage.

### FS11 inventory work is missing from scope and completion

- severity: medium
- confidence: high
- location: R5, lines 124–135; Scope/In, lines 142–154; Definition of done, lines 247–252
- defect: R5 invokes FS11 while adding normative SKILL.md commands and a new skill pointer, but neither scope nor DoD requires updating and checking the versioned normative-reference inventory.
- evidence: The plan claims “FS11 discipline” while adding emitter/harvest invocations and an `sdlc-retro` pointer (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:124-135`). FS11 requires package-owned normative targets to occur in the inventory and exist (`docs/adr/0019-normative-reference-honesty-fs11.md:15-28`); the current inventory enumerates existing SKILL/script references (`skills/sdlc/assets/normative-references.json:45-83`, `skills/sdlc/assets/normative-references.json:210-241`), while its test only checks entries already present and cannot detect omitted new entries (`test/check-references.test.js:41-47`).
- impact: The feature can pass `npm test` with its new normative commands absent from FS11's frozen inventory, making the stated honesty discipline incomplete and future missing-target checks inert.
- fix: Add normative-inventory entries and an omission-sensitive FS11 check for every new SKILL command/pointer to Scope/In and the DoD.

CLEAR: B — Each required R1–R5 outcome has a plausible scenario-level verification path once the acceptance and contract gaps above are repaired.

CLEAR: F — The plan correctly selects the irreversible track for two new persisted consumer-bound record schemas.
