# Plan panel — openai-codex/gpt-5.6-luna:xhigh

Target: docs/plans/2026-07-22-review-gate-config-model.md @ 66e38ee (main)

### Clean-break posture contradicts the governing adoption policy

- severity: high
- confidence: high
- location: Plan scope-out migration and Case edit
- defect: The plan treats Case as a future adopter that may pin, but Case already has a committed schemaVersion 3 config. ADR 0027 says the clean-break exception expires at the first external adopter and thereafter requires migration or an equivalently honest forward path.
- evidence: `threadsafe/case/.pi/sdlc/sdlc.config.json:2`; `docs/adr/0027-pre-adoption-clean-break-policy.md:19-25,41-43`.
- impact: The v4 release will classify Case's config as older and make its lifecycle not-ready until a separate rewrite; the plan neither coordinates that rewrite nor supersedes the locked policy.
- fix: Amend ADR 0027 and include a coordinated Case forward path and release-order/test contract before shipping v4.

### `approve:agent` conflicts with the human-final-adjudicator rule

- severity: high
- confidence: high
- location: Plan design principle
- defect: The plan says `approve:agent` adjudicates and "does not block on a human," but the existing panel contract requires disputed high/medium findings to be decided by the human owner.
- evidence: `skills/sdlc/references/phase-pr-review.md:191-207`; `skills/sdlc/references/system-reference.md:308-309`.
- impact: The new actor cannot implement its promised semantics: agent approval still blocks on human escalation, while the plan does not define telemetry, prose, or scenarios for agent approval.
- fix: Specify whether agent approval may resolve disputes without escalation, then update the phase contract, telemetry payloads, and tests.

### The "faithful" advisory desugar silently changes behavior

- severity: medium
- confidence: high
- location: Plan desugar/rationale
- defect: Current `advisory` is `arbiter:none, blocking:false` and the renderer says its findings do not block; mapping it to `{validate:panel, approve:agent}` under the new invariant makes high/medium disposition mandatory.
- evidence: `skills/sdlc/scripts/lib.mjs:135-143`; `skills/sdlc/scripts/config-doc.mjs:99-103`.
- impact: The table is not a faithful semantic translation, so v3 advisory users receive an undocumented governance change during the hard break.
- fix: Label this as an intentional semantic amendment and add ADR/scenario coverage for agent adjudication and mandatory disposition.

### The promised additive `preview` path is incompatible with closed-world validation

- severity: medium
- confidence: high
- location: Plan schema promise and DoD
- defect: The plan requires rejecting unknown fields and simultaneously promises a future `preview` field can be added without another breaking bump.
- evidence: `skills/sdlc/schema/sdlc.config.schema.json:72-84` (`additionalProperties:false`); validator rejects unknown review keys `skills/sdlc/scripts/lib.mjs:348-354`.
- impact: An unchanged v4 reader will reject a config using future `preview`, so the additive/no-break claim has no compatible implementation.
- fix: Reserve `preview` now and test it, define forward readers to ignore it, or explicitly require a later schema/version break.

### Deep-merge recommendation conflicts with required dial fields

- severity: medium
- confidence: high
- location: Open Decisions 1 and 3
- defect: Deep-merging a track override is recommended so one axis can change, but requiring both fields on every dial makes partial overrides invalid and deep-merge equivalent to replacement.
- evidence: Plan Open Decisions 1 and 3.
- impact: Spec has no coherent contract for the "flip only one axis" reversible use case.
- fix: Make base dials fully required but override fields optional, or abandon deep-merge.

### Public setup surfaces are missing from the impacted-surface inventory

- severity: medium
- confidence: high
- location: Grounded surface list
- defect: The list names `setup-sdlc.mjs` but omits the public shell wrapper and setup interview template, both of which still expose the scalar grammar and advisory semantics.
- evidence: `skills/sdlc/scripts/setup-sdlc.sh:6-8`; `templates/setup-sdlc.md:29-32,58-62`.
- impact: The canonical setup instructions can invoke invalid or obsolete options after the change.
- fix: Add both files to scope and add a stale-vocabulary check covering wrappers and templates.

CLEAR: F — Persisted schema and schemaVersion change correctly classified as irreversible.
