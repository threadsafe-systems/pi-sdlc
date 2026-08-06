# PR panel round 2 (delta) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `3e81a25..5856f15`.

Turn budget wrap-up was requested after 9 assistant turns (soft limit 9, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

# PR review — delta round 2 (3e81a25..5856f15), reviewer claude-fable-5

Verification base executed before findings: full `npm test` at 5856f15 (519 pass), `node --test` on both changed corpora (DSP 8/8, IDV 30/30 green), all four refreshed receipt hashes recomputed and matching (`t1`/`t2` manifest + runner-report SHA-256), review-dir `manifest.json` byte-identical to `docs/validation/.../t2.json`, working tree clean. Carry landing: clean — no `CARRY-TO-BACKLOG`/`CARRY-TO-BUILD`/`CARRY-TO-IMPLEMENT` minted anywhere in this run's Plan/Spec/Build/panel records (grep-verified); the S1 handoff remains landed at issue #192 and is exercised by the strengthened `static.handoff` PASS in T2's committed runner report. No high-severity finding.

**Prior dispositions:** PR-R1-01 confirmed fixed (IDV33 present, passing, matches both ownership comments; no self-match). PR-R1-02 confirmed fixed (spec-panel consolidated now discloses both partial-output caveats and de-overstates the disagreement). PR-R1-03/PR-R1-07 confirmed incorporated for the reproduced ordinary paths (single-line `node:child_process`/network imports rejected; `execFileSync(`/`spawnSync(` shapes banned) — residual narrowing in NEW finding 3 below. PR-R1-04 confirmed fixed (all helper/invoker/op/ref variants load-bearing; tautology removed; re-ran DSP5 positives/negatives). PR-R1-05 confirmed incorporated for the reproduced `never expires` inversion — residual in NEW findings 1–2 below. PR-R1-06 confirmed fixed (same-comment three-token argv identical in manifest, review copy, runner report, and Build plan). PR-R1-08 confirmed fixed for the reproduced prose-row false positive — residual in NEW finding 5.

### Law witness's inversion guard recognizes only `never/not expire`; common inversions are accepted as the valid law

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 61-67 (statesMovingPinnedLaw), consumed by DSP1 at 83-93
- problem: The new `inverted` regex is `\b(?:never|not)\s+expire\w*\b`. Reproduced: rewriting the law as "a moving ref **cannot** expire", "**won't** expire", "**no longer** expires", or "does **not ever** expire" all return `statesMovingPinnedLaw === true`, so DSP1 accepts a semantically inverted phase-spec §4 as the canonical law. Only the exact two negation words directly adjacent to `expire` are rejected.
- repro_or_impact: Ran the helper against all four phrasings — each accepted (`true`). The PR-R1-05 incorporation claim ("rejects `never/not expire`") is literally true but the inversion class it was meant to close remains open; a future doc edit can invert the governing law with DSP1/DSP3 green.

### `statesMovingPinnedLaw` conflates "states the law" with "states it uninverted", so a duplication is masked by any nearby inversion mention

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 61-67, consumed by DSP1 cross-file check (89-92) and DSP2 (95-99)
- problem: The helper returns `movingExpires && !inverted && pinnedRoute`. DSP1's other-files check and DSP2 use `statesMovingPinnedLaw(...) === false` to mean "does not duplicate the law". Reproduced: a file containing the complete verbatim law **plus** one pedagogical phrase like "(do not assume a moving ref never expires)" returns `false` — the inversion mention masks a genuine full duplication, defeating the single-owner invariant both scenarios exist to enforce.
- repro_or_impact: Appending the full law + that one parenthetical to `phase-implement.md` §4 keeps DSP1, DSP2, and DSP3 green while the law is duplicated. The duplication predicate should be `movingExpires && pinnedRoute` (inversion handled separately for the positive phase-spec check).

### The new import boundary is line-anchored: a multi-line static import of `node:child_process` evades DSP12 and IDV17 entirely

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js; test/iteration-disposition.test.js
- line: 160-166 (DSP12 import loop); 486-501 (IDV17), approx
- problem: Both guards enumerate specifiers with `/^import .*? from "([^"]+)";$/gm`, which only matches single-line imports. Reproduced: `import {\n\texecFile as <longAlias>,\n} from "node:child_process";` yields zero specifiers seen by the guard, and the banned call-shape list (`execFileSync/execSync/spawnSync/spawn/fetch/import/require`) omits `exec(`, `execFile(`, `fork(` and any aliased name, so the aliased call passes the blanked-source scan too — both files stay green with a live subprocess import.
- repro_or_impact: `biome.json` sets `lineWidth: 320`, so an import clause over 320 chars (trivially reachable with several named imports or a long alias) is *canonically* multi-line — formatting checks do not close this path. This narrows the PR-R1-03/R1-07 incorporation from "static import boundaries reject subprocess/network builtins" to "single-line import boundaries"; parsing all `from "..."` specifiers without the `^import` line anchor closes it in one change.

### Proposed PR body's Validation section is stale against the refreshed branch it describes

- severity: medium
- confidence: high
- origin: NEW
- file: /tmp/diff-scoped-test-premises-pr.md (Validation section)
- line: approx 24-27
- problem: The body claims "`npm test` — 518 pass" and "`node --test test/iteration-disposition.test.js` — 29 pass". At 5856f15 the actual counts are **519** and **30** (IDV33 added in this delta), and the branch's own refreshed runner reports record 519/30. The PR body predates the delta's fixes and was not refreshed alongside the receipts.
- repro_or_impact: Ran both commands at HEAD: 519 and 30 pass. Posting this body would commit a gate record that misstates the branch's own committed evidence — the same record-honesty class as PR-R1-02, now in the artifact about to be published.

### IDV14's forbidden-table detector requires 3+ dash separators, so a valid GFM table with `| - |` delimiters evades it

- severity: low
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 359-375 (tableCells/hasSpecGapColumns), approx
- smell: —
- problem: The separator predicate `/^:?-{3,}:?$/` plus equal-column-count requirement rejects delimiter rows GitHub renders as valid tables. Reproduced: `| Description | Severity | Disposition | Landing site |` followed by `| - | - | - | - |` returns `hasSpecGapColumns === false` while rendering as a real Spec-gap table in the router template.
- repro_or_impact: The forbidden Spec-gap columns can be reintroduced into `templates/sdlc-tasks.md` with short-dash separators and IDV14 stays green. Accept `-{1,}` (GFM minimum) in the separator cells; the extra-column superset case is already caught (verified).

No high-severity findings. No undischarged carries. Receipt hashes, manifest copies, and runner-reported counts all verified honest against live re-runs.
