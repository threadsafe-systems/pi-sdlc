# Review: feat/model-thinking-levels (6d8eca3..ad7b450) — glm-5.2

Reversible-track docs+config change. Documents pi's `provider/model:thinking`
suffix in the FS2 schema `description` (no validation-contract change),
illustrates it in the example, and sets real thinking levels in this repo's
own `.pi/sdlc/sdlc.models.json`.

**VERIFIED: no high or medium findings.** Low-severity observations below.

## Verification performed

- **Schema is description-only (byte-level).** `diff 6d8eca3..ad7b450` of
  `skills/sdlc/schema/sdlc.models.schema.json` adds exactly one line: the
  `description` on the `phase.prefer` array. `pattern: "^[^/]+/.+$"`,
  `minItems: 1`, `required`, `additionalProperties: false` are byte-identical
  before/after (sha256 of both blobs compared; the only delta is the added
  description). Nothing that was valid/invalid before changes. ✓
- **Bedrock-colon claim accurate.** `pi --list-models | grep bedrock` shows
  real colon-suffixed ids, e.g. `amazon.nova-2-lite-v1:0`,
  `anthropic.claude-haiku-4-5-20251001-v1:0`. The plan's "don't add enum
  validation" reasoning holds. ✓
- **`pi --help` confirms the syntax.** `--model` "supports provider/id and
  optional `:<thinking>`"; `--thinking` levels are exactly
  `off, minimal, low, medium, high, xhigh, max` — matching the schema
  description's level list verbatim. ✓
- **lib.mjs needs no changes (traced every suffixed roster entry).**
  - `PM_RE = /^[^/]+\/.+$/` matches all 8 suffixed ids (the `.+` consumes
    the colon and suffix). ✓
  - `vendor()` uses `.includes()` on the full string — all entries resolve
    to the expected vendor (openai/zai/anthropic/moonshot). ✓
  - `hasCreds()` uses `pm.split("/")[0]` → suffix stripped, irrelevant. ✓
- **Thinking levels internally consistent with rationale.** plan/spec=high
  (irreversible design, gated 1–2×/effort), pr_review=medium (iterates
  across fix waves, min_panel 3 → cost compounds), task_validate=low
  (mechanistic checklist executor; `low` not `off` so it can still reason
  over command output). Each level is justified and the ordering
  (high ≥ medium > low) matches the stated rigor-vs-cost tradeoff. ✓
- **No stale roster reference missed.** `test/fixtures/consumer/...sdlc.models.json`
  is a deliberately different fixture (loom-sdlc, gpt-5.5/deepseek-v4-pro/
  claude-fable-5) with matching golden files — not a stale copy of the
  dogfood roster. Historical `docs/reviews/*` and `docs/specs/*` records
  are immutable and correctly left alone.
- **`npm test`: 33/33 pass** (S3 schema-validates its examples; S3c/S6/S7
  resolve-panel paths unaffected).

## Low-severity observations (not blockers)

### pongOk passes the `:thinking` suffix into `pi --model` AND `--thinking off`

- severity: low
- confidence: high
- file: skills/sdlc/scripts/resolve-panel.mjs
- line: 95-109 (unchanged by this PR)
- problem: `pongOk()` does `const model = rest.join("/")` then invokes
  `pi --provider <p> --model <model> --thinking off ...`. For a suffixed
  roster entry the `--model` value carries the suffix
  (e.g. `gpt-5.6-sol:high`), so pi receives TWO thinking specifiers: the
  `:high` shorthand embedded in the model string and the explicit
  `--thinking off`. The plan's verification established the suffix is
  parsed on its own (the cited `model_change`/`thinking_level_change`
  events) but did not exercise the combined `--model X:high --thinking off`
  case, so the claim "pongOk() … unaffected, verified" is slightly
  overconfident on this specific interaction.
- repro_or_impact: Only reachable on the manual `--pong` diagnostic path
  (no skill flow, README, or test passes `--pong`; SKILL.md flags it as a
  paid smoke test). On any resolution, `pongOk` is wrapped in `try/catch`
  that returns `false` on failure, so the worst case is a model being
  erroneously dropped with reason "PONG failed" — not a crash or a wrong
  panel in the default flow. Likely a non-issue (pi documents accepting
  the suffix), but a `--pong` run against the new roster is the one place
  to confirm.

### SKILL.md validator example does not mention the now-documented `:thinking` syntax

- severity: low
- confidence: high
- file: skills/sdlc/SKILL.md
- line: 249
- problem: The "Per-task validator" section still shows unsuffixed
  `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5`. These
  are generic illustrative ids (deliberately different from the dogfood
  roster) and remain valid, so this is not wrong — but a one-line note
  that a `:low` suffix can pin the validator's reasoning level would make
  the newly-documented capability discoverable from the skill doc itself.
- smell: none (documentation completeness, not a baseline smell)
