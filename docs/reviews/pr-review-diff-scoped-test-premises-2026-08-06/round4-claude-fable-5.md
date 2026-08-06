# PR panel round 4 (delta) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `c0c7ecc..fd03110`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

### Column-0 anchoring in the restructured import allowlist admits indented imports and `export … from` re-exports

- severity: medium
- confidence: high
- origin: REOPENED(PR-R3-02)
- file: test/diff-scoped-premises.test.js (81-83, 184-189) and test/iteration-disposition.test.js (24-27, 508-513)
- line: 81-83
- problem: `assertExactImports` filters `source.split("\n").filter((line) => /^import\b/.test(line))`, so only lines whose column 0 starts with `import` are compared against the allowlist. Two valid-ESM static-load shapes escape it entirely: (1) an indentation-prefixed import — `\timport { execFileSync } from "node:child_process";` runs fine under Node (repro executed: yields a live `execFileSync` binding) but never enters the filtered list; (2) any `export … from` re-export — `export * from "./helper.mjs";` statically loads and executes an arbitrary local module at test load without containing the word `import`. In `diff-scoped-premises.test.js` there is no second layer at all (the offline patterns ban only `fetch(`/`import(`), so an indented child_process import plus a direct call is fully invisible to DSP12/DSP13. In `iteration-disposition.test.js` the banned-call scan (line 515-521) catches unaliased calls in the main file only; an indented aliased import (`import { execFile as run }`) plus `run(…)`, or `export * from "./helper.mjs"` moving the calls into a file the scan never reads, bypasses both layers.
- repro_or_impact: Reproduced: both shapes pass `assertExactImports` unchanged against the allowlist, and both execute under `node` (`typeof execFileSync === "function"`; re-export module loads). The guard's stated invariant — "the guard stays offline / makes no subprocess call" — is evadable by the same defect class round 3 reopened. Partial mitigation: Biome format in the PV1 `static.lint` check would flag the indented shape on a touched file, but `export … from` is format-clean and lint-clean. Bounded fix within the restructure's own philosophy: extend the filter to `/^\s*(?:import|export)\b/` and add both shapes as `assert.throws` mutation witnesses.

### IDV33 ownership-block extractor also stops at non-column-0 comment lines

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 456-463
- problem: `commentBlock` walks contiguity with `line.startsWith("//")`, so an indentation-prefixed comment line (`\t// Retired by the PR.`) adjacent to the ownership block terminates the walk and is excluded from the extracted block, escaping the `processHistory` `doesNotMatch` — the same column-0-anchoring generator as the import filter, in the check that was just rebuilt to be "bidirectional and complete".
- repro_or_impact: Append `\t// Retired by the PR.` after `// FROZEN list; …` (line 440): the block walk excludes it, IDV33 stays green while process-history prose sits visibly inside the ownership comment. Mitigated by Biome dedenting top-level comments on format check; hence low.

No high-severity findings. No other new defects found at any severity in the c0c7ecc..fd03110 receipt delta: both receipts' `manifestSha256`/`runnerReportSha256` recomputed and match, `createdAt` (12:37:43Z / 12:39:45Z) correctly postdates the fix commit (12:36:01Z), validator prose matches the actually-executed witnesses, no FROZEN path is touched (docs/reviews only), working tree is byte-identical to fd03110, and both corpora run green (38/38).

## Prior-disposition verification (round-3 evidence vs. c0c7ecc code)

- **PR-R3-01 — RESOLVED.** `statesMovingPinnedLaw` pinnedRoute (diff-scoped-premises.test.js:64) is verb-free (`current tree … pinned immutable commit` only); `not true that` added to premiseDenied (line 69) with a direct DSP3 mutation witness (`It is not true that a premise`); duplication replayed across `assert`/`use`/`rely on`/`check against` (lines 130-133). All witnesses executed green.
- **PR-R3-02 — RESOLVED as reported, REOPENED for residual** (finding above). The regex parsers are removed; the exact allowlist rejects every round-3 shape (semicolonless, trailing-comment, multiline comment-spoof, aliased — replayed as `assert.throws` witnesses at lines 187-189 / 511-513), but the replacement filter has its own column-0 blind spot, confirmed by repro.
- **PR-R3-03 — RESOLVED.** `commentBlock` (iteration-disposition.test.js:456-463) walks backward (line 460) and forward (line 462) from the needle; both prepended (`// Retired by the PR.\n// validator-task.prompt.md`) and appended (`// FROZEN list;\n// Retired by the PR.`) mutations are run through the *actual* extractor (line 473-475), not a synthetic string.
- **PR-R3-04 — RESOLVED.** The inventory lists wave 3 with its telemetry row, the target is base-relative ("branch from `2aa5a89`; each delta wave below records its exact end"), and the caveat claim is scoped honestly ("round-2 Luna returned no caveat").

**Carry landing:** clean — the consolidated record states no `CARRY-TO-BUILD`/`CARRY-TO-IMPLEMENT`/`CARRY-TO-BACKLOG` was minted, and a repo-wide grep confirms no mint anywhere in this run's Plan/Spec/Build/panel records; the S1 handoff remains landed at issue #192 comment 5202737602 and is exercised by T2's executed `static.handoff` PASS.

## Round-cap diagnosis (round 4)

A recurring defect generator **survives in narrowed form**: rounds 1-3 all traced to *hand-rolled textual models of module/comment syntax standing in for the real grammar*. The c0c7ecc restructure genuinely killed the regex-parser instance, but its replacement re-instantiates the generator as column-0 line anchoring (both findings above share that single root cause). The survivors are hardening gaps in self-protective test scaffolding — not defects in the shipped references, detector, or receipts — and are partially fenced by Biome format enforcement in the PV1 manifests. Of the four bounded options, **(b) — churn generated by our own fix waves; restructure rather than re-dispatch — is warranted**: one final structural change (anchor the filter at `/^\s*(?:import|export)\b/` in the shared helper, plus the two new mutation witnesses) eliminates the generator's last habitat; a 5th dispatch would only replay this class. Option (d) ratified dismissal is defensible only if the human accepts the documented textual-not-semantic threat model as covering the `export … from` shape, which the current PR prose does not explicitly claim; the cap forbids merging past the surviving medium without one of those two routes.
