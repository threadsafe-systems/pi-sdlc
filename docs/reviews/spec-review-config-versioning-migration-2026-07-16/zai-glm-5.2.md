# spec_review — zai/glm-5.2:high

Note: first dispatch attempt on this model crashed with a host-side Node
OOM (`FATAL ERROR: Reached heap limit`), unrelated to the artifact under
review. Retried once; this is the successful retry's output.

### CI release-guard watches an over-broad schema glob, conflating the independent PV1 surface

- severity: medium
- confidence: high
- location: spec §8 ("Watched shape surface"), confirmed against the repo
- defect: The guard watches `skills/sdlc/schema/*.schema.json` (any diff). After this change deletes `sdlc.models.schema.json`, the glob still matches `task-validation-manifest.schema.json` (the PV1 manifest schema, an independent frozen surface under ADR 0013/0014 with its own versioning axis) and `sdlc.config.schema.json`. The plan scope 10 says "the **config** schema shape" — the guard's glob is broader than that intent. A non-breaking (additive) change to `task-validation-manifest.schema.json`, or a future new schema file (e.g. OL-B's evidence schema), would trip the guard and demand a `!`/`BREAKING CHANGE:` signal on the PR title even though it is not a config-schema break.
- evidence: `ls skills/sdlc/schema/` returns `sdlc.config.schema.json`, `sdlc.models.schema.json`, `task-validation-manifest.schema.json`, plus the example. The spec §8 text: "`skills/sdlc/schema/*.schema.json` (any diff)". Plan scope 10: "fails when the **config schema shape** (the `schemaVersion` constant or the schema files) changes". ADR 0013/0014 govern task-validation-manifest independently of the config `schemaVersion`.
- impact: False-positive CI failures on legitimate non-config schema changes. Once shipped, the glob is a frozen CI contract — narrowing it later is itself a change to the guard. OL-B (which the plan says consumes this contract) would hit this if it adds a schema file.
- fix: Scope the watched surface to the config schema file(s) by name (`sdlc.config.schema.json`, and during this transition the deleted `sdlc.models.schema.json`) plus the `CONFIG_SCHEMA_VERSION` constant — not a blanket `*.schema.json` glob.

### resolve-panel's move to `readConfig` silently supersedes OL-A's byte-identity guarantee (NF-1(b) / OLA21) for invalid configs

- severity: medium
- confidence: high
- location: spec §5.1 ("Roster source: `readConfig(root).panels`"), §5.2 ("shipped v1 semantics verbatim"), §3.1 ("current: full v2 validation"); OL-A spec §5 NF-1(b) and OLA21
- defect: The spec mandates that resolve-panel source its roster from `readConfig(root).panels`, and §3.1 says readConfig on a `current` config runs full v2 validation via `inspectConfig` before returning. But the shipped OL-A resolver (`resolve-panel.mjs:60-74` `readLifecycle`) does its own raw read of `sdlc.config.json` that **tolerates** an otherwise-invalid config (it only checks lifecycle-path issues), and the OL-A spec's NF-1(b) + OLA20/OLA21 guarantee byte-identical v1 exit codes for "a config … regardless of whether the config is otherwise valid". After this change, a v2 config with one bad non-lifecycle field (or an invalid lifecycle block) exits **2** via `readConfig`/`validateConfig` (`lib.mjs:fail` defaults to code 2), not the v1-path behavior or exit 1 (OLA21's `fail(..., 1)` for invalid lifecycle). The spec's §5.2 claim "shipped v1 semantics verbatim" is in tension with §5.1's readConfig mandate and is never reconciled — an implementer could read "verbatim" as a requirement to preserve the old tolerance, which conflicts with using readConfig.
- evidence: `resolve-panel.mjs:60` `readLifecycle` catches parse errors and returns `null` (v1 path), and at line 71 validates only lifecycle issues via `inspectConfig(raw).find(...)` then `fail(..., 1)`. OL-A spec §5 NF-1(b): "byte-identical … regardless of whether the config is otherwise valid". This spec §3.1: "`current`: full v2 validation via `inspectConfig`, then the parsed config … is returned" — `validateConfig` calls `fail()` at default code 2 (`lib.mjs:165-168`).
- impact: Exit-code regression on a class of inputs (invalid v2 config) that the spec claims is covered "verbatim". An implementer following §5.2 literally would build a contradictory resolver.
- fix: Add one sentence to §5: "For a current (v2) config, readConfig's validation gate is authoritative — an invalid v2 config halts at exit 2 before resolution, superseding OL-A NF-1(b)/OLA21 byte-identity (which applied to the v1 raw-read path); 'shipped v1 semantics verbatim' in §5.2 governs the resolution algorithm for valid configs only."

### resolve-panel's missing-manifest exit-2 path has no specified mechanism — `readConfig` returns defaults silently

- severity: medium
- confidence: high
- location: spec §5.1 ("Missing manifest entirely: … exit 2"), §3.1 ("Missing manifest: unchanged v1 behaviour (defaults …)")
- defect: §5.1 requires resolve-panel to exit 2 with a specific message when the manifest is missing. But §3.1 says `readConfig` on a missing manifest returns `CONFIG_DEFAULTS` (no failure) — `lib.mjs:145-152` returns `{ ...CONFIG_DEFAULTS, ... }` without exiting when `requireManifest` is false (the default). So `readConfig(root).panels` on a missing manifest yields `undefined`, indistinguishable from a present-but-panels-less manifest (which §5.1 says is exit 1). The spec pins the exit code and message but never says how resolve-panel detects the missing-manifest case to produce exit 2 rather than falling through to exit 1.
- evidence: `lib.mjs:145-152`: `if (!existsSync(p)) { if (requireManifest) { fail(...) } return { ...CONFIG_DEFAULTS, ... }; }`. Spec §5.1 gives two different exit codes (2 vs 1) for two cases that `readConfig` does not distinguish. The §5.1 message ("this project requires .pi/sdlc/sdlc.config.json with a panels roster to resolve a panel") differs from readConfig's `requireManifest` message ("no manifest at … Run /setup-sdlc to adopt the sdlc") at `lib.mjs:148`.
- impact: An implementer must guess the mechanism (separate `existsSync` check, `requireManifest: true` with a changed message, or a new readConfig option). A wrong guess produces exit 1 instead of exit 2 for a missing manifest — a frozen-surface exit-code defect (ADR 0005: exit 2 = bad input).
- fix: Specify in §5.1 that resolve-panel detects the missing manifest explicitly (e.g. an `existsSync` guard or `readConfig(root, { requireManifest: true })`) before sourcing `panels`, and confirm the exact §5.1 message is emitted (not readConfig's default requireManifest message).

### No falsifiable scenario gates the claim that gate-mode refusals stay exit 1 in preference mode

- severity: low
- confidence: high
- location: spec §5.2 ("Gate-mode refusals … stay exit 1 in both enforcement modes"), §5.3 item 6
- defect: §5.2 makes a binding claim — a gate whose mode decomposes to `reviewer: "none"` (or task validation `off`) exits 1 regardless of `enforcement` — but no CV scenario tests preference mode against a human/off gate. CV21–23 test shortfalls, author demotion, and empty panels; none assert "preference + gate `human` → exit 1 (not 0)". An implementer who accidentally lets preference mode exit 0 past a no-panel gate has no failing scenario to catch it.
- evidence: Spec §5.2 last bullet. CV list (§12): CV21 (shortfall), CV22 (strict same input), CV23 (author demotion + empty panel). None combine `enforcement: preference` with a gate mode decomposing to `reviewer: none`.
- impact: A claim with no falsifiable gate. The code path is natural (gate refusal precedes resolution) but unprotected by a test.
- fix: Add a clause to CV23 (or a new CV): "under `preference`, a gate with `reviewer: none` (e.g. `mode: human`) still exits 1, not 0 — the toggle governs floor shortfall only where a panel forms."

### `inspectModels`/`validateModels` become dead code but their disposition is unstated

- severity: low
- confidence: high
- location: spec §1 surface table ("`readModels` retired"), §3.1 ("`readModels` is deleted")
- defect: The spec says `readModels` is deleted from `lib.mjs`, but `inspectModels` and `validateModels` (also exported, `lib.mjs:429`, `lib.mjs:486`) lose all their callers: `sdlc-status.mjs:268` (the retired `models.valid` check) and `setup-sdlc.mjs:448` (the retired `--with-models` path). The spec never states whether they are deleted or left as dead exports. Leaving them invites a future consumer to re-couple to a file that no longer exists.
- evidence: `grep` shows `inspectModels` callers at `sdlc-status.mjs:13,268` and `setup-sdlc.mjs:11,448` — both retired by this change. The spec §1/§3.1 name only `readModels` for deletion.
- impact: Minor — dead code or an ambiguous surface. An implementer leaving them creates an unmaintained validator for a deleted schema.
- fix: State in §3.1 that `inspectModels` and `validateModels` are also retired (deleted or explicitly marked internal-only) alongside `readModels`, since all callers are removed by this change.

VERDICT: REVISE
