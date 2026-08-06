# PR panel round 2 (delta) — gpt-5.6-sol

Model: `openai-codex/gpt-5.6-sol:xhigh`. Delta: `3e81a25..5856f15`.

Turn budget wrap-up was requested after 9 assistant turns (soft limit 9, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### Offline guard misses valid multiline imports

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-03)
- file: test/diff-scoped-premises.test.js
- line: 160-168
- problem: The new static-import check only recognizes single-line `import … from "…";` statements. A Biome-clean multiline import from a prohibited network builtin bypasses DSP12.
- repro_or_impact: Adding a multiline `import { get } from "node:https";` plus `void get;` left all 8 detector tests passing and passed Biome, so N1 can still be falsely attested.

### Detector variants remain only partially load-bearing

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-04)
- file: test/diff-scoped-premises.test.js
- line: 25, 116-135
- problem: DSP5 tests `runProcess` only with `merge-base`, never with the mandatory `show`/`diff` direct-read branch. The direct-read matcher can silently stop accepting `runProcess`.
- repro_or_impact: Replacing `gitStart` with `processGitStart` only in `directReadPattern` removes all `runProcess(["git","show"/"diff",…])` detection while all 8 tests still pass.

### Law witness still accepts semantic inversion

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-05)
- file: test/diff-scoped-premises.test.js
- line: 61-65, 96-106
- problem: `statesMovingPinnedLaw` only recognizes nearby `never`/`not` after “moving ref”; it ignores negation preceding the premise.
- repro_or_impact: Prefixing the normative sentence with “It is false that” inverted the law while all 8 DSP tests passed. The original `never expires` and duplication mutations now fail, but the claimed semantic-direction witness remains incomplete.

### DSP14 still accepts a token-only comment

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-06)
- file: docs/validation/diff-scoped-test-premises/t2.json
- line: 51-58
- problem: The strengthened predicate requires three substrings but does not verify that the comment states S1 must preserve the law or actually links the Specification.
- repro_or_impact: A comment containing only `DSP3 premise-durability docs/specs/2026-08-06-diff-scoped-test-premises.md` satisfies the exact committed predicate despite containing neither the required preservation instruction nor a Markdown link.

### IDV33 truncates comments before checking forbidden history

- severity: medium
- confidence: high
- origin: REOPENED(PR-R1-01)
- file: test/iteration-disposition.test.js
- line: 446-454
- problem: Each ownership-comment regex stops at `diff guard.` or `current-tree behaviour.`, so forbidden process-history prose appended after that period is excluded from the checked substring.
- repro_or_impact: Appending `Retired by the PR.` to the FROZEN ownership comment left the complete 38-test mutation run green, despite directly violating DSP11’s no-process-history rule.

### IDV17 still permits aliased subprocess execution

- severity: low
- confidence: high
- origin: REOPENED(PR-R1-07)
- file: test/iteration-disposition.test.js
- line: 486-506
- problem: The import parser misses multiline imports, while the call bans only recognize original API names. Aliasing `execFileSync` therefore bypasses both protections and the literal inventory.
- repro_or_impact: A Biome-clean multiline `import { execFileSync as run } from "node:child_process"` followed by `run(process.execPath, ["-e", ""])` executed a child process while all 30 task tests passed.

### CLEAR surfaces

- high severity: none found.
- confirmed resolved: PR-R1-02 and PR-R1-08.
- carries: none minted or undischarged; the S1 handoff currently lands at issue #192.
- receipts: T1/T2 manifest and runner hashes verify; deterministic runner replays returned PASS.
- new defects unrelated to prior findings: none found.
