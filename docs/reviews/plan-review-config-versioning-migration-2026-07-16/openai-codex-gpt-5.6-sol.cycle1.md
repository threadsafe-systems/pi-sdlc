# plan_review — openai-codex/gpt-5.6-sol:high — cycle 1 (plan rev 1)

### Migration prompting has no reachable entrypoint

- severity: high
- confidence: high
- location: What this delivers §2; Definition of done §4
- defect: The plan never names an invocation that reaches the interactive migration prompt. The mandatory startup path stops on FS8 exit 3 before any ordinary shared-loader consumer may run, while the DoD tests only the non-interactive halt.
- evidence: Plan lines 113-118 promise loader-driven prompting and lines 198-200 mention "migrate interactively"; skills/sdlc/SKILL.md:27-48 requires sdlc-status first and prohibits entering phases or mutating lifecycle state after exit 3.
- impact: A schema-v1 adopter can be told to migrate but have no defined command or permitted workflow for doing so; the implementation could satisfy the DoD without shipping confirmation or decline behavior.
- fix: Designate the interactive migration entrypoint, update the exit-3 startup flow to permit it, and add end-to-end accept, decline, and non-TTY scenarios.

### The merge necessarily reopens FS10 that scope assigns to OL-B

- severity: high
- confidence: high
- location: Scope out §1; Definition of done §§1,7
- defect: Making setup-sdlc create and consume one merged file necessarily changes its frozen --with-models/models asset behavior, yet the plan explicitly leaves FS10 v2 to OL-B.
- evidence: Plan lines 170-172 exclude OL-B's FS10 v2 while lines 184-188 and 213-218 require setup and all old-file bindings to move to the merged file; skills/sdlc/scripts/setup-sdlc.mjs:199-203,396-409,467-473 implements the separate models flag and asset; ADR 0018 lines 8-17,30 freeze FS10 and require an explicit version bump.
- impact: The implementation must either silently break FS10 v1 or violate the one-file DoD; it also collides with OL-B's planned ownership of the single FS10 v2 migration.
- fix: Explicitly absorb and specify the FS10 v2 bump in this change, including the disposition of --with-models and the models asset, and reconcile OL-B's scope and ADR 0018.

### The resolver's frozen FS5 contract is omitted

- severity: high
- confidence: high
- location: resolve-panel posture change; ADR ledger
- defect: The plan changes resolver exits and requires advisory output without specifying how stdout remains parseable under --emit-tasks, and it gives no disposition for the frozen --models-file flag after the models file disappears.
- evidence: ADR 0005 lines 3-9 freeze resolver stdout, --emit-tasks JSON, --models-file, and exits; skills/sdlc/scripts/resolve-panel.mjs:167-173 emits the machine JSON on stdout while diagnostics use stderr; issue #54's resolution binds the shortfall to stdout; the plan's ADR ledger at lines 151-166 omits ADR 0005.
- impact: Appending an advisory corrupts valid --emit-tasks JSON, while removing or reinterpreting --models-file silently breaks consumers of another frozen surface.
- fix: Add an FS5 v2 decision and ADR migration that pins advisory framing/channel, --emit-tasks shape, exit semantics, and the exact fate of --models-file.

### The migration is not required to survive filesystem failure atomically

- severity: high
- confidence: high
- location: What this delivers §§2-3; Definition of done §§2-3
- defect: Write-nothing is asserted only for malformed or unmappable input, not for write, rename, unlink, permission, or interruption failures during the successful two-file fold.
- evidence: Plan lines 113-123 require replacing the config and deleting the models file, while lines 195-197 test only malformed/unmappable refusal.
- impact: Depending on operation order, a failure can leave consumer data deleted, the old config overwritten while the roster remains, or another half-migrated state that future loaders cannot resolve.
- fix: Require staged atomic replacement with defined recovery semantics and fault-injection tests for every filesystem mutation boundary.

### Unrelated versioned schemas are incorrectly treated as config consumers

- severity: medium
- confidence: high
- location: Rationale §1; Definition of done §1
- defect: The plan claims validate-task and check-references hard-reject consumer config schema versions and requires them to read the merged config, but neither consumes FS1 or FS2.
- evidence: Plan lines 34-39 and 184-188; skills/sdlc/scripts/validate-task.mjs:100-104 validates the independent PV1 task manifest, and skills/sdlc/scripts/check-references.mjs:80-84 validates the independent normative-reference inventory.
- impact: The DoD is impossible as written without widening this change into unrelated frozen schemas or manufacturing dependencies that do not exist.
- fix: Remove validate-task and check-references from the rationale and merged-config consumer list.

### One fixture cannot verify both migration branches

- severity: medium
- confidence: high
- location: Binding decision §4; Definition of done §2
- defect: The plan promises zero effective-panel change for every adopter but requires only "a fixture v1 pair," although migration branches on whether lifecycle exists.
- evidence: Plan lines 78-83 define vendor-axis and model-axis branches, while lines 189-194 require a singular fixture; the real resolver has distinct vendor and lifecycle algorithms at skills/sdlc/scripts/resolve-panel.mjs:176-210 and 219-278.
- impact: Either migration branch, lifecycle floor sourcing, or author exclusion can regress while the stated DoD remains green.
- fix: Require a fixture matrix covering lifecycle-present and lifecycle-absent adopters, all phases, author exclusion, and representative credential shortfalls.

### A binding filename decision is reopened

- severity: medium
- confidence: high
- location: Context for the next agent, line 268
- defect: The plan leaves the merged filename open to Spec despite both its own binding decisions and issue #52 fixing it as sdlc.config.json.
- evidence: Plan lines 78-79 and 105 fix the merged home, but line 268 calls the filename a "default assumption"; issue #52's resolution states "keeping the sdlc.config.json name."
- impact: Spec can relitigate a settled consumer-facing path and produce a migration inconsistent with the canonical brainstorm decision.
- fix: Remove the filename from open Spec decisions and state that .pi/sdlc/sdlc.config.json is binding.

CLEAR: F — The irreversible classification correctly recognizes that the plan changes multiple frozen schemas, machine outputs, and CLI behavior.
