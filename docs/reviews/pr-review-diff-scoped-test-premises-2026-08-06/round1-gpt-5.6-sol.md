# PR panel round 1 — gpt-5.6-sol

Model: `openai-codex/gpt-5.6-sol:xhigh`. Base: `2aa5a89`; commit: `3e81a25`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### Detector non-vacuity leaves required variants untested

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 102-124
- problem: DSP4 validates extensions against the same mutable set used by enumeration, while DSP5 exercises only `baseRef`, `execFileSync`/`merge-base`, and `execFileSync`/`show`/`main`. Required `.cjs`, `baseFile`, `spawnSync`, `runProcess`, `diff`, and `origin/main` variants can rot without detection.
- repro_or_impact: In an archived copy of commit `3e81a25`, independently removing `.cjs`, `spawnSync`, `diff`, or `origin/main` still produced 8/8 passing tests. A future moving-ref premise using one of those mandatory shapes could therefore evade the standing guard while DSP4-DSP7 remain green.

### Law witness accepts both semantic inversion and forbidden duplication

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 61-100
- problem: `lawIssues` checks only token presence, so it cannot establish the law’s meaning; DSP2 also treats the law as non-duplicated whenever any one of five unrelated anchors is missing.
- repro_or_impact: Changing “a moving ref expires” to “a moving ref never expires” passed all eight tests. Adding “A moving ref expires; use a pinned immutable commit” to `phase-implement.md` also passed, despite explicitly restating the moving-ref-versus-pinned law. S1 can thus invert or duplicate the carried law without DSP1-DSP3 firing.

### DSP12 misses ordinary network API imports

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 150-153
- problem: The offline check recognizes only `node:child_process`, global `fetch(`, and dynamic `import(`. Static imports from `node:http`, `node:https`, `node:net`, `node:dns`, or an HTTP client are not detected.
- repro_or_impact: Adding `import { get } from "node:https";` to the test passed all eight scenarios. DSP12 and its PV1 mapping can therefore attest N1’s “no network API” requirement while the guarded file imports one.

### DSP14’s PV1 check proves only that some comment contains a token

- severity: medium
- confidence: high
- origin: NEW
- file: docs/validation/diff-scoped-test-premises/t2.json
- line: 50-54
- problem: `static.handoff` exits successfully for any issue-192 comment containing `DSP3`; it does not verify the required premise-durability law, C1/Spec link, or that these appear in the same handoff comment.
- repro_or_impact: A comment containing only `DSP3` satisfies `out.includes("DSP3")`, so the runner report can mark DSP14 PASS after the actual handoff is deleted or rewritten. The current comment was manually valid, but the committed receipt does not mechanically substantiate the scenario it claims.

### Thin-router check treats data rows as forbidden headers

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 359-367
- problem: `hasSpecGapColumns` examines every pipe-prefixed line rather than Markdown table headers and uses substring matching rather than normalized cells.
- repro_or_impact: A legitimate table data row such as `| This prose mentions description, severity, disposition, and landing site |` returns true and fails IDV14, even though the Spec prohibits only a header containing those four columns.
