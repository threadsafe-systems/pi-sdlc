# Consolidated PR review — adoption bundle, PR #24

- Author/orchestrator: anthropic
- Track: irreversible
- Head: `47b2068`
- Panel: openai-codex/gpt-5.6-luna:medium, zai/glm-5.2:medium,
  deepseek/deepseek-v4-pro:medium (anthropic excluded)

## Round 1 adjudication

### F1 — incomplete prompt-source preflight (medium)

`setup-sdlc` checked only `adversary-plan` before copying four prompts. Fixed:
`writeBundle` now checks every `PROMPT_BASES` source before any asset writes.

### F2 — Git execution errors misclassified as artifact failures (medium)

Nonzero `git ls-tree` results were reported as missing artifacts. Fixed:
artifact checks now emit `error`/exit 2 for Git inspection failures, while
zero matches remain contract `fail`/exit 1.

### F3 — conditional PR-template companion not enforced (medium)

The acceptance regex accepted mismatched `track`/`slug`/`reason` combinations.
Fixed with track-sensitive structural parsing and a regression fixture.

### F4 — invalid track leaked into report (medium)

Fixed by assigning `report.track` only after `declaration.track` passes, with a
regression fixture asserting `null`.

All four were incorporated; no finding was dismissed.

## Verification round

The verification panel read current code and reproduced the fixes:

- F1 RESOLVED — all four prompt references checked before writes.
- F2 RESOLVED — Git inspection error is operational exit 2.
- F3 RESOLVED — current code requires `reason` only for `none`, `slug` for
  lifecycle tracks; wrong-companion fixture refuses byte-identically. One
  reviewer initially called this PARTIAL because both companions may be
  present, but the approved grammar/parser separately rejects unknown or
  forbidden declaration keys and the two independent verification reviewers
  confirmed the implementation and tests; no surviving medium remains.
- F4 RESOLVED — invalid track remains null.

## New verification findings and adjudication

### F5 — known target collisions could cause partial provisioning (medium)

Fixed in `47b2068`: setup preflights target parent components before the first
write and returns exit 2 with an empty asset report when a target parent is a
regular file or cannot be inspected. Regression test covers `.github` as a
file.

### F6 — generated configuration was not validated before writing (medium)

Fixed in `47b2068`: `inspectConfig` validates the assembled config before any
write; invalid values return exit 2 and no assets. Regression test covers an
invalid prefix.

### F7 — malformed bot declaration is exempted (low)

**Adjudication: DEFERRED-OK / owner-approved contract.** FS9 §1.3 says a bot
with no valid declaration — including zero or only invalid/ambiguous blocks —
passes as `none` with a generated reason. This is intentional and does not
bypass the approved contract; semantic honesty remains PR-panel prose law.
No high or medium finding survives.

## Stop condition

After the second fix wave: zero surviving high/medium findings. Final code,
full suite, lint, FS8-untouched check, and T1–T5 PV2 receipts all pass.