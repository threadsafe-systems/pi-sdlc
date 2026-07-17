1. ### Preset patch silently deletes overrides the preset does not carry

   - severity: high
   - confidence: high
   - file: skills/sdlc/scripts/setup-sdlc.mjs
   - line: 566-573
   - problem: The data-loss guard runs only when the replacement has no `overrides` at all. Reapplying `--preset full` to a config that also has an `irreversible` override exits 0 and replaces the whole block with Full's reversible-only override, contrary to ICA19/S7; compare existing and replacement overrides and require `--force` for every removed or altered consumer entry.
   - repro_or_impact: Create with `--preset full --override irreversible:code:human`, then run `--preset full`; the second command reports `patched` and silently deletes `overrides.irreversible`, potentially removing a deliberate review gate.

2. ### `review.tasks: self` still resolves a validator subagent

   - severity: medium
   - confidence: high
   - file: skills/sdlc/scripts/resolve-panel.mjs
   - line: 166-175
   - problem: `task_validate` refuses only `off`, so `self` falls through to panel resolution even though the v3 contract defines it as self-validation rather than subagent validation. Refuse panel resolution for every task mode except `subagent` (with distinct `self`/`off` diagnostics), and make the SKILL validator prose branch on the same dial.
   - repro_or_impact: A seeded `solo` config persists `review.tasks: "self"`, yet `resolve-panel task_validate` exits 0 and prints a model; a caller can dispatch the exact subagent that the committed intent disables.

3. ### Bare `--force` falsely succeeds without replacing an old config

   - severity: medium
   - confidence: high
   - file: skills/sdlc/scripts/setup-sdlc.mjs
   - line: 536-588
   - problem: `--force` is not included in `configMutating`; for an older schema it bypasses the refusal branches but never reaches the replacement branch, then reports the config as `retained`. Treat an older config plus `--force` as a whole-file replacement even when no other config flag is supplied.
   - repro_or_impact: Against a schemaVersion-2 file, `setup-sdlc --force` exits 0, creates the PR template, and leaves the config byte-identical at v2. This breaks the clean-break remedy advertised by `REMEDY_SCHEMA_OLDER` and leaves `sdlc-status` not-ready despite apparent success.

4. ### A one-dial patch resets every other intent dial to Standard

   - severity: medium
   - confidence: medium
   - file: skills/sdlc/scripts/setup-sdlc.mjs
   - line: 133-153, 564-580
   - problem: When no preset is supplied, `reviewShapeFromOptions` seeds the Standard bundle, and the existing-config path replaces all of `review` and `shape`; therefore a command intended to set one dial rewrites unrelated dials. For existing v3 configs without `--preset`, seed from the existing intent blocks and overlay only explicitly supplied flags.
   - repro_or_impact: Create a Solo config, then run `--review-code human`; the command also changes `brainstorm off→human`, `tasks self→subagent`, `panelSize 1→2`, and `publishToTracker never→4`, silently increasing and changing lifecycle ceremony.

5. ### Tracker publication prose still hard-codes the retired threshold

   - severity: medium
   - confidence: high
   - file: skills/sdlc/SKILL.md
   - line: 112-117, 233-234, 532-533
   - problem: Although the new paragraph reads `shape.publishToTracker`, the surrounding phase note, single-task rule, and red flag still mandate the old two-task behavior. Remove those constants and express every publish/skip/red-flag decision solely in terms of the committed value, including `1` and `"never"`.
   - repro_or_impact: With `publishToTracker: 4`, the SKILL simultaneously says two tasks publish and four tasks publish; with `"never"`, line 532 still calls a two-task non-publish a violation. Agents following prose law can mutate tracker state against the committed intent.

6. ### Revised ADR 0022 still declares the deleted v2 vocabulary as current law

   - severity: medium
   - confidence: high
   - file: docs/adr/0022-user-owned-panel-enforcement-posture.md
   - line: 20-30
   - problem: The revision note maps the posture to `review.onShortfall`, but the normative Decision and Consequences still say consumers own `strict | preference` and still describe the retired `lifecycle.minPanel`/`minVendor` branch. Rewrite those sections in `fail | proceed`, `panelSize`, model-identity terms, retaining old names only as explicitly historical mapping.
   - repro_or_impact: This governing ADR instructs an adopter to author keys and values that `inspectConfig` now rejects, and contradicts ADR 0026's claim that the vendor axis is deleted.

7. ### README still identifies schemaVersion 2 as the frozen config surface

   - severity: medium
   - confidence: high
   - file: README.md
   - line: 23-27
   - problem: Public configuration guidance still advertises optional `lifecycle` settings, an `enforcement` posture, and “schemaVersion-2” after the clean break. Replace this with the v3 `review`/`shape`/`overrides` vocabulary and schemaVersion 3.
   - repro_or_impact: A new adopter following the README will hand-author retired keys or pin the wrong schema contract, and the resulting manifest fails `config.valid`.

8. ### The setup wrapper still promises a migration that was deleted

   - severity: medium
   - confidence: high
   - file: skills/sdlc/scripts/setup-sdlc.sh
   - line: 5-12
   - problem: The shipped wrapper usage still advertises retired `--enforcement strict|preference` and says schema-1 configs migrate after TTY confirmation, directly violating the clean-break/FS11 honesty requirement. Mirror the v3 CLI usage and state that older configs require `--force` replacement or a pinned prior release.
   - repro_or_impact: `setup-sdlc.sh --enforcement strict` actually exits 2, and no interactive migration exists; the wrapper's own documentation sends users down two nonexistent paths.
