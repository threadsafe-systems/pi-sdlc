# Consolidated PR review — adoption bundle, PR #24

- Author/orchestrator: anthropic
- Track: irreversible
- Head: `d8bf81c`
- Panel: openai/gpt-5.6-sol:medium, deepseek/deepseek-v4-pro:medium,
  amazon-bedrock/global.anthropic.claude-haiku-4-5-20251001-v1:medium
  (author vendor anthropic excluded from the direct panel)

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

## Final verification and stop condition

The last completed three-vendor verification found and led to these fixes:

- ambiguous multiple template blocks → setup now requires exactly one
  fenced `sdlc` block;
- implicit mutable `main` workflow fallback → setup now requires
  `SDLC_PACKAGE_REF` or an installed package Git `HEAD`, otherwise exits 2;
- workflow source read on non-CI runs → read is conditional on
  `--with-ci-workflow`;
- prompt read race and target type/symlink hazards → all prompt reads use the
  setup error boundary, and target parents/targets are preflighted for
  containment, directory, and symlink conflicts.

Subsequent verification fix waves addressed: invalid config under `--force`,
malformed CI marker paths, bot value-invalid exemption, empty source paths,
resolved-root JSON errors, checker-source readability, directory-vs-file CI
markers, exact `sdlc` template info strings, and the pinned bot exemption
message. The final head `d8bf81c` passed 145 tests, lint, and LSP diagnostics;
the final three-vendor panel found no surviving high/medium defect. The shared
package-source mutation regression was removed after detecting a concurrent
cross-file test race. **Zero surviving high/medium findings; PR stop condition
met.**