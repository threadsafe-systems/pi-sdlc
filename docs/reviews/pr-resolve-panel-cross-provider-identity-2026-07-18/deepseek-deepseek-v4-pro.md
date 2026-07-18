### Bedrock-native model identity: region prefix stripped then discarded for non-aliased vendors — functionally harmless but confusing

- severity: low
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.mjs
- line: 154-162
- problem: For Bedrock-native models (e.g., `amazon-bedrock/us.amazon.nova-pro-v1:0`), the function strips the `us.` region prefix to derive `amazon.nova-pro-v1:0`, then discovers `amazon` is not in `BEDROCK_ALIAS_VENDORS` and returns the *original* `stripped` (which still contains the `us.` prefix). The intermediate prefix stripping is a no-op for this path. Behavior is correct; this is a code-clarity issue only.
- repro_or_impact: No functional impact — verified by the "Bedrock-native model" test. Clarity only.
- smell: Speculative Generality (the prefix strip is computed and thrown away for this path)

### PV1 manifest `tests` check incomplete relative to Build plan Definition of Done

- severity: low
- confidence: high
- file: docs/validation/resolve-panel-cross-provider-identity/rpi-t1.json
- line: 7-12
- problem: The Build plan's Definition of Done requires "full `npm test` suite green." The PV1 manifest's `tests` category runs only `node --test test/resolve-panel-v3.test.js`, not the full corpus (`npm test` / `node --test test/*.test.js`, 29 files). A future regression elsewhere would not be caught by this manifest.
- repro_or_impact: No current regression (315/315 pass verified separately), but the manifest's declared coverage is narrower than the DoD statement.
- smell: none
