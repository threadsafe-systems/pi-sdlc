### `--hook-use` colon parsing "remainder after 3rd `:`" contradicts OH5 expected output

- severity: high
- confidence: high
- location: spec §5.1 flag table, `--hook-use` row; verified against OH5 example
- defect: The flag format is `"<phase>:<before|after>:<use>:<do>"` where `use` itself is `tool:NAME` or `skill:NAME` (pattern `^(skill|tool):[a-z][a-z0-9_-]*$` per §1.1). The table says `do` = remainder after 3rd `:`. In the OH5 example `implement:before:tool:worktree_session:enter the worktree`, the colon positions are: 1st=after `implement`, 2nd=after `before`, 3rd=after `tool`, 4th=after `worktree_session`. Remainder after 3rd `:` = `worktree_session:enter the worktree`. But OH5 expects `do=enter the worktree` and `use=tool:worktree_session`. The remainder-after-4th-`:` (or a pattern-aware parse that extracts `use` as two `:`-delimited tokens) is required, not remainder-after-3rd.
- evidence: spec §5.1: `--hook-use "<phase>:<before|after>:<use>:<do>"` ... `do` = remainder after 3rd `:` . OH5: `--hook-use "implement:before:tool:worktree_session:enter the worktree"` produces `use=tool:worktree_session`, `do=enter the worktree`. These are incompatible: remainder after the 3rd `:` (between `tool` and `worktree_session`) is `worktree_session:enter the worktree`, not `enter the worktree`.
- impact: The scaffolder `--hook-use` parsing rule is broken as written. An implementer following the literal "3rd `:`" instruction produces wrong `use`/`do` values, or the flag must be parsed with a different algorithm than the spec states. The shape that gets written to `sdlc.config.json` would be wrong — `use=tool` with `do=worktree_session:enter the worktree` instead of the intended `use=tool:worktree_session` with `do=enter the worktree`.
- fix: Change "remainder after 3rd `:`" to "remainder after 4th `:`" and note that `use` itself spans two colon-delimited tokens (prefix then name), OR describe the parse as "after extracting phase and before|after (first two `:`-delimited tokens), match the `use` pattern `^(skill|tool):[a-z][a-z0-9_-]*$` against the remainder; `do` is whatever follows that match."

### `sdlc-status` specified only as `.sh`, missing the `.mjs` core required for JSON handling

- severity: medium
- confidence: high
- location: spec §3 title and body; compare with §5.1 `setup-sdlc` treatment
- defect: `sdlc-status` is named only as `sdlc-status.sh` throughout §3 and the decision procedure in §2. The spec says it must read JSON config (to validate it and report hook counts), which requires Node.js. All existing scripts in this project follow the `.sh` (bash wrapper exec'ing node) → `.mjs` (core logic) pattern (verified: `ensure-panel-agent.sh:5` execs `ensure-panel-agent.mjs`; `resolve-panel.sh:5` execs `resolve-panel.mjs`; `skills/sdlc/scripts/` contains paired `.sh`/`.mjs`). `setup-sdlc` explicitly says "(+ `.mjs`)" in §5.1. `sdlc-status` has no such parenthetical — the implementer must guess that a `.mjs` counterpart is needed.
- evidence: spec §3 says "sdlc-status.sh" only, with no mention of `.mjs`. Existing script pattern at `skills/sdlc/scripts/ensure-panel-agent.sh:5`: `exec node "$(dirname "$0")/ensure-panel-agent.mjs" "$@"`. `setup-sdlc.sh` in §5.1 explicitly says "(+ `.mjs`)". The spec says sdlc-status must validate config (exit 2 = "same diagnostics as `validateConfig`"), read hook counts, and output structured keys — all of which require `lib.mjs` imports (`resolveRoot`, `validateConfig`, etc.) available only in Node.js.
- impact: Implementer ambiguity about whether `sdlc-status.sh` is a standalone bash script (would need to duplicate config parsing in bash) or follows the project's established `.sh`→`.mjs` pattern. Wrong choice wastes implementation effort or creates a fragile bash JSON parser.
- fix: Name the script pair `sdlc-status.sh` (+ `.mjs`, no new runtime deps) consistent with the `setup-sdlc` treatment in §5.1, and note that the `.mjs` core imports `resolveRoot` and `validateConfig` from `lib.mjs`.

### Dead cross-reference "§2.1" in §6.7

- severity: low
- confidence: high
- location: spec §6.7 (SKILL.md required change #7)
- defect: §6.7 says "The announce paragraph updated to route through `sdlc-status` (§2.1)." Section 2 has no subsection 2.1 — it is a flat section titled "Contract: opt-in gate + advisory mode (announce policy)" with no numbered subsections. The intended reference is to §2 itself.
- evidence: spec §6.7: "The announce paragraph updated to route through `sdlc-status` (§2.1)." spec §2 heading: `## 2. Contract: opt-in gate + advisory mode (announce policy)` — no `### 2.1` or equivalent sub-heading follows; the numbered list (1-6) is body content, not a subsection.
- impact: An implementer trying to follow the cross-reference finds no target. Minor — the likely intent (§2 as a whole) is recoverable.
- fix: Change `(§2.1)` to `(§2)`.

### FS5 "behaviour unchanged" claim is technically over-broad

- severity: low
- confidence: medium
- location: spec preamble and §7 NFR3
- defect: The spec claims "FS5 (existing script CLIs — `ensure-panel-agent` and `resolve-panel` behaviour is unchanged)" and NFR3 says "zero behaviour change to existing script CLIs." However, `validateConfig` (called by `readConfig` → `ensure-panel-agent`) will now accept configs that contain a valid `hooks` key, where before those configs would be rejected with "unknown key 'hooks'" (exit 2). A config with valid hooks changes from exit 2 (before) to exit 0 (after). While no real-world consumer can have `hooks` today (it was always rejected), the claim of *zero* behaviour change is technically false — the set of configs accepted by `ensure-panel-agent` expands.
- evidence: spec preamble: "Explicitly does NOT amend: FS3 (`resolveRoot`), FS5 (existing script CLIs — `ensure-panel-agent` and `resolve-panel` behaviour is unchanged, including no-manifest defaults)." Current `validateConfig` `allowed` set at `skills/sdlc/scripts/lib.mjs:88`: `new Set(["schemaVersion", "prefix", "labelPrefix", "announce", "paths", "tracker"])` — hooks is not in this set, so any config with hooks exits 2. After the change, valid hooks are accepted (exit 0).
- impact: Minimal — no actual consumer is affected because `hooks` was always rejected. The claim is an honesty sweep issue: NFR3's test criterion ("goldens stay green unmodified") is satisfied (goldens have no hooks), but the prose overstates.
- fix: Qualify the claim: "no behaviour change for configs without hooks; configs with hooks are now validated (previously rejected as unknown key), which is the intended additive change to FS1." Or simply drop "zero behaviour change" in favour of the test criterion alone.

### OH2 verification scenario only tests the rejection path, not the success path for `readConfig` strict mode

- severity: low
- confidence: medium
- location: spec §8 OH2
- defect: OH2 tests `readConfig(root, {requireManifest:true})` on a manifest-less root (exits 2) and `readConfig(root)` default (returns defaults). It does not test `readConfig(root, {requireManifest:true})` with a valid manifest present — does it return the config? Does it validate hooks? The success behaviour of `readConfig` strict mode is unverified. An implementation could satisfy OH2 by making strict mode always exit 2 (trivial, wrong).
- evidence: spec OH2: "`readConfig(root, {requireManifest:true})` on a manifest-less root exits 2 and the diagnostic names `/setup-sdlc`; default `readConfig(root)` still returns defaults." Missing: valid-manifest case.
- impact: The `requireManifest:true` success path could be implemented incorrectly (e.g., exiting 2 even when manifest is present) and OH2 would not catch it. Low because the spec elsewhere defines the opt-in gate via `sdlc-status`, not `readConfig` directly, so this API is secondary.
- fix: Add to OH2: "`readConfig(root, {requireManifest:true})` on a root WITH a valid manifest returns the config (including hooks, if present) and does NOT exit."

CLEAR: A — The `hooks` shape is complete: JSON Schema fragment covers all valid/invalid cases, `validateConfig` rules are enumerated, and every field is defined with types and constraints. No missing field that can't be backfilled later. The additive nature preserves FS1 per ADR 0001.

CLEAR: B — Every verification scenario (OH1-OH11) is falsifiable and gates its claimed outcome. OH1 tests JSON Schema + hand-rolled validation; OH2 tests readConfig modes; OH3 tests sdlc-status outputs; OH4-5 test scaffolder; OH6 tests template discoverability; OH7-8 test SKILL.md contents; OH9 tests ADR presence; OH10 tests dogfood config; OH11 tests regression. Each scenario names concrete pass/fail conditions.

CLEAR: C — All interface contracts are buildable: the JSON Schema additions are syntactically valid; the `validateConfig` rules are specified in prose sufficient for hand-rolled implementation; the flag tables for `setup-sdlc` and `sdlc-status` are complete with types, constraints, and exit codes. The `readConfig` options-bag signature change is backward-compatible (default empty opts).

CLEAR: D — No contradiction with the approved plan or locked decisions. The plan's five objectives, scope, and DoD are faithfully reflected. Plan adjudication H2 (no hook engine) is correctly cited and followed. Plan adjudication M3 (CLI not fully pinned in plan) is properly resolved in spec. Plan adjudication H3 (run hook trust) is incorporated in §1.3. Plan adjudication M5 (two ADRs) is reflected in OH9.

CLEAR: E — Framework composition is correct. `pi.prompts` mechanism (verified at `~/.nvm/versions/node/v25.6.1/lib/node_modules/@earendil-works/pi-coding-agent/docs/packages.md:126,163` and `prompt-templates.md` "Locations") correctly supports loading templates from a package's `pi.prompts` array. The `templates/` directory is separate from `skills/sdlc/prompts/` (reviewer prompts), avoiding collision. The `/setup-sdlc` template name derivation from filename follows prompt-templates.md rules. No framework misstatements found.

CLEAR: F — Non-functional requirements NFR1-NFR4 are stated and each tied to scenarios: NFR1 (no new deps) is gated by implementer discipline but verifiable by dependency inspection; NFR2 (no live model calls) is gated by OH4/OH5 using temp dirs; NFR3 (no regression) is gated by OH11; NFR4 (docs consistency) is a prose requirement gated by review. Performance and security (run hook trust) are addressed in §1.3 with explicit mitigations.

CLEAR: G — The spec is honest about its enforcement model: hooks and workflow.md are explicitly "prose law, agent-executed" with no mechanical runner (§0, §1.4, §4). OH8 explicitly limits its scope to "documentation presence" and defers behavioural adherence to panel/human review. The trust boundary for `run` hooks (§1.3) acknowledges the risk and situates it within pi's existing project-trust model rather than claiming to eliminate it.
