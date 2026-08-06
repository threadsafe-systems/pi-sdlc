# PR panel round 4 (delta) — gpt-5.6-sol

Model: `openai-codex/gpt-5.6-sol:xhigh`. Delta: `c0c7ecc..fd03110`.

### Reversed law wording still evades duplication detection

- severity: medium
- confidence: high
- origin: REOPENED(PR-R3-01)
- file: test/diff-scoped-premises.test.js
- line: 61-64
- problem: The predicate remains order-sensitive: it requires `current tree` before `pinned immutable commit`, so an equivalent restatement with those alternatives reversed is accepted. The new `use`/`rely on`/`check against` probes and `not true` inversion work, but cover only the canonical concept order.
- repro_or_impact: Appending `A premise anchored to a moving ref expires; rely on a pinned immutable commit or the current tree instead.` to `phase-implement.md` left all eight DSP tests passing, violating C2’s single-owner rule. The recurring semantic-regex generator therefore survives round 4; bounded option **(b), restructure rather than re-dispatch**, is warranted.

### Comment-prefixed static imports bypass the exact allowlist

- severity: medium
- confidence: high
- origin: REOPENED(PR-R3-02)
- file: test/diff-scoped-premises.test.js
- line: 81-83
- problem: `assertExactImports` examines only lines beginning literally with `import`, so a valid comment-prefixed static import is invisible; the same helper defect exists in `test/iteration-disposition.test.js:24-26`. The reported semicolonless, trailing-comment, multiline, comment-spoof, and aliased mutations are caught only because their first line begins with `import`.
- repro_or_impact: Adding `/* preload */ import { execFileSync as run } from "node:child_process";` and `run("true");` left the DSP corpus green and passed Biome with no findings while executing a subprocess. This is another surviving textual-parser generator; round-cap option **(b), structural import enforcement rather than another syntax-shape patch**, is warranted.
