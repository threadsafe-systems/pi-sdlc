# PR panel round 3 (delta) — claude-fable-5

Model: `anthropic/claude-fable-5:xhigh`. Delta: `5856f15..b35248b`.

Turn budget wrap-up was requested after 8 assistant turns (soft limit 8, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

All verifications complete. Findings follow.

### Prior-disposition confirmations (delta 5856f15..b35248b)

- PR-R2-01 **confirmed incorporated**: all six replayed inversions (`cannot`/`won't`/`no longer`/`does not ever`/`false that`/`do not assert`) are rejected by `lawIssues`, and the full-law-plus-inversion-mention duplicate is now detected (`statesMovingPinnedLaw === true`). Residual regression in NEW finding 1.
- PR-R2-02 **confirmed incorporated**: multiline, side-effect, and aliased static imports all yield their specifiers in both corpora, with in-test witnesses. Residual in NEW finding 2.
- PR-R2-03 **confirmed incorporated**: `runProcess(["git", "show", "origin/main:path"])` positive present in DSP5 and verified to match `directReadPattern`.
- PR-R2-04 **confirmed incorporated**: the committed t2 predicate rejects the round-2 token-only comment (replayed: `false`); requires `phase-spec.md`, the exact preservation instruction, `**DSP3**`, and the full HTTPS link whose `#9-verification-scenarios` anchor exists in the Spec; build-plan argv matches `t2.json` byte-for-byte.
- PR-R2-05 **confirmed incorporated** for the replayed appended direction (`// Retired by the PR.` appended after the block is now extracted and fails `processHistory`). Residual in NEW finding 3.
- PR-R2-06 **confirmed incorporated**: PR body reports 519/30; live runs at b35248b give `npm test` 519 pass and IDV corpus 30 pass.
- PR-R2-07 **confirmed incorporated**: separator predicate is `/^:?-+:?$/` with a dedicated `| - |` short-separator mutation; prose data row stays clean.
- Hashes/receipts: t1 and t2 `manifestSha256`/`runnerReportSha256` recomputed and match both receipts; review-dir `manifest.json` copies byte-identical to `docs/validation/.../t{1,2}.json`; both runner reports record PASS. Carries: none minted anywhere in the run's Plan/Spec/Build/panel records (grep-verified); the S1 handoff remains landed at issue #192 and witnessed by `static.handoff`.

### The delta's duplication predicate now requires the literal verb "assert", so paraphrased law duplicates evade DSP1's cross-file check

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js
- line: 62-66 (statesMovingPinnedLaw), consumed by DSP1 cross-file loop at approx 103-108
- problem: To separate positive law from inversion, `pinnedRoute` was changed from `current tree … pinned immutable commit` to `\bassert[\s\S]{0,30}\bcurrent tree\b…`. Every match of the new predicate is a match of the old one, so duplication detection is strictly narrower: reproduced — "A premise anchored to a moving ref expires; **rely on** the current tree or a pinned immutable commit instead." and the "check against" variant both return `false` under the new predicate while the pre-delta (5856f15) predicate returned `true`.
- repro_or_impact: A reference file can restate the full moving-ref-versus-pinned law with any verb other than "assert" and DSP1/DSP2 stay green, defeating the single-owner invariant those scenarios exist to enforce — a detection-surface regression introduced by this delta's fix for PR-R2-01. Requiring "assert" only in the DSP1 positive check for phase-spec §4 (or accepting a small verb class in the duplication predicate) restores the old coverage.

### `importSpecifiers` returns the first quoted string after any `from` in the statement, so a comment inside an import spoofs the specifier

- severity: medium
- confidence: high
- origin: NEW
- file: test/diff-scoped-premises.test.js (82-88); test/iteration-disposition.test.js (24-30)
- problem: The specifier is extracted with a non-global `\bfrom\s+["']([^"']+)["']` match over the whole multi-line statement. Reproduced: `import {\n\t// from "node:fs"\n\texecFileSync,\n} from "node:child_process";` reports `["node:fs"]` — the prohibited builtin is invisible to both guards. The probe file is Biome-clean (`biome check` passes), so formatting gates do not close it. Same first-match root cause: two statements on one line report only the first specifier (`["node:fs"]` for an `node:fs`+`node:child_process` pair), though that shape is at least format-unstable.
- repro_or_impact: In DSP12 the only backstops are `fetch(`/`import(` bans and the git-argv `matches()` shapes, so a spoofed `node:child_process` import plus e.g. `execFileSync("curl", …)` passes every DSP scenario; in IDV17 the call-shape ban catches only unaliased names, so `execFile as run` under a spoofed specifier evades there too. Extracting the **last** `from "…"` match (or stripping comments before parsing, as IDV17 already does for its call scan) closes it.

### IDV33's `commentBlock` extends only downward, so contiguous process history prepended above the ownership comment is never inspected

- severity: medium
- confidence: high
- origin: NEW
- file: test/iteration-disposition.test.js
- line: 458-465 (commentBlock), approx
- problem: The block starts at the first `//` line containing the needle and extends forward while lines start with `//`; it never walks backward. Reproduced: inserting `// Retired by the PR panel.` on the line immediately above `// validator-task.prompt.md is protected…` leaves the extracted block without that line and `processHistory` does not fire — all 30 tests stay green while the same contiguous comment block carries the exact history DSP11/IDV33 forbids.
- repro_or_impact: The consolidated PR-R2-05 disposition claims "whole contiguous ownership comment blocks checked", but only the lower half of the block is; walking `start` backward over preceding `//` lines makes the claim true.

### Consolidated inventory claims every panel artifact carries the wrap-up caveat, but round2-gpt-5.6-luna.md carries none

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-diff-scoped-test-premises-2026-08-06/consolidated.md
- line: 19-22 (paragraph under the artifact-inventory table); round2-gpt-5.6-luna.md (whole file, 23 lines)
- problem: The delta extended the artifact table to six rows but left the sentence "Each artifact carries the harness's turn-budget wrap-up caveat (`Output may be partial`)" directly beneath it. `round2-gpt-5.6-luna.md` contains no caveat line (grep: 0; fable-5 and sol round-2 artifacts: 1 each). The header's "Target: branch diff `2aa5a89..3e81a25`" also now understates the adjudicated range, which the round-2 section extends to 5856f15.
- repro_or_impact: Record-honesty drift in the adjudication artifact itself — the same class the run previously corrected in PR-R1-02; scoping the caveat sentence to the artifacts that carry it (or adding luna's caveat status) fixes it.

No high-severity findings. No undischarged carries. No new baseline-smell judgement calls beyond the concrete defects above.
