# PR panel round 2 (delta) — gpt-5.6-luna

Model: `openai-codex/gpt-5.6-luna:xhigh`. Delta: `3e81a25..5856f15`.

### Offline guards miss static imports

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-03)
- file: test/diff-scoped-premises.test.js
- line: 163
- problem: The import regex only recognizes single-line `import ... from ...` forms, so side-effect or multiline imports such as `import "node:https";` evade the prohibited-builtin check. IDV17 uses the same incomplete parser.
- repro_or_impact: Adding `import "node:https";` leaves the offline scenarios passing while importing a prohibited network API.

### Law witness accepts inverted routing semantics

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-05)
- file: test/diff-scoped-premises.test.js
- line: 61-65
- problem: `statesMovingPinnedLaw` checks only token order and does not validate the direction of the current-tree/pinned-commit instruction.
- repro_or_impact: Replacing “assert the current tree or a pinned immutable commit instead” with “do not assert the current tree or a pinned immutable commit instead” still satisfies DSP1-DSP3.
