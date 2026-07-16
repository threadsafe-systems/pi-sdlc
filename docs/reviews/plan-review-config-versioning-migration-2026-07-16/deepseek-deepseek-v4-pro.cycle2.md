# plan_review — deepseek/deepseek-v4-pro:high — cycle 2 (plan rev 2)

### FS8 models checks survive the merge with no design

- severity: high
- confidence: high
- location: Plan scope item 5 (FS8 v2), DoD-10 (dogfood)
- defect: After the fold removes sdlc.models.json, FS8's models.head, models.clean, and models.valid checks all look for a separate file at .pi/sdlc/sdlc.models.json. FS8 v2 scope adds config.schema-current and splits config.valid but never addresses the three models checks for v2 configs. DoD-10 (dogfood green with no sdlc.models.json) is unreachable — sdlc-status fails models.head.
- evidence: sdlc-status.mjs:15 (CHECK_IDS), :25-27 (dependency chain), :173 (hardcoded path), :240; plan scope item 5; plan DoD-10.
- impact: Dogfood CI cannot pass; a migrated consumer fails readiness on checks for a file that correctly no longer exists.
- fix: Add to FS8 v2 scope: for schemaVersion >= 2 configs, the three models checks are skipped-as-pass or remapped to the merged config's models section — and state which.

### Migration detection in shared loader blocks the designated migration entrypoint

- severity: medium
- confidence: high
- location: Plan scope items 2 and 3
- defect: The shared loader halts on an older schemaVersion; setup-sdlc (the designated migration entrypoint) reads the old config via that same shared loader (inspectConfig). Circular: the migration tool's prerequisite is blocked by the guard it exists to satisfy.
- evidence: plan scope items 2-3; setup-sdlc.mjs:447 (inspectConfig via shared lib); lib.mjs:183 (hard reject).
- impact: Implementation dead end; "flag/interview shape is Spec-level" does not resolve the architectural tension.
- fix: State that setup-sdlc reads the old config via a raw-read path bypassing the migration guard (migration entrypoint only).

CLEAR: A, B, C, D, E, F as detailed in the transcript (all other surfaces attested clean).
