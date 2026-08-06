I've now completed all verification. Let me compile the findings.

---

### F1 fix verification

- **Verdict**: RESOLVED. `.gitignore:20` has `/pr-body.md` (anchored). `git check-ignore -v pr-body.md` matches; `git check-ignore -v docs/reviews/some-future-panel-2026-08-10/pr-body.md` returns exit 1 (no match). The fix is real and complete. ✓

### F2 fix verification

- **Verdict**: RESOLVED. README.md lines 181-186 now separate soft-skip (identity) from exit 2 (I/O failure) and point to `references/system-reference.md` §12. The standalone emitter's exit-2-on-I/O behavior is verified at `record-run-event.mjs:172-175`. ✓

### F3 fix verification

- **Verdict**: RESOLVED. README.md line 172 now says "adoption does not write an ignore rule for it, so add `**/.pi/sdlc/runs/` to your own `.gitignore`." ✓

### F4 fix verification

- **Verdict**: RESOLVED. pr-body.md verification section now says "2 warnings, 1 info" and "It spans more than one script — 8 failures come from `check-lifecycle.test.js` and 5 from `setup-v3.test.js`." Re-ran: lint is 2 warnings, 1 info; test failures confirmed at 8 from check-lifecycle, 5 from setup-v3. ✓

### F5 fix verification

- **Verdict**: RESOLVED. README.md line 191 now says "These two commands resolve against the `sdlc-retro` skill, not `sdlc`." ✓

### F6 fix verification

- **Verdict**: RESOLVED. pr-body.md "Residual risk" section records consumer stale-pr-body.md hazard and flags for follow-up PR. ✓

### F7 fix verification

- **Verdict**: RESOLVED. Telemetry/retro section trimmed to summary with explicit pointers: "references/system-reference.md §12 owns the full contract" and "That skill's `SKILL.md` owns the pipeline's contract." No longer near-verbatim duplicates. ✓

---

### pr-body.md first paragraph still claims the ignore entry "is unanchored" (present tense)

- severity: low
- confidence: high
- file: pr-body.md (untracked, repo root)
- line: 19
- problem: The initial description paragraph says "The ignore entry is unanchored to cover a fixture consumer root nested under this repository" — present-tense "is" — but the actual `.gitignore` entry is now `/pr-body.md` (root-anchored). The "Assumptions & discretionary calls" section correctly documents the round-1 correction to anchored, but a reader who stops at the first paragraph gets a now-false factual claim. The PR body is NAMED REVIEW INPUT and should describe the current state.
- repro_or_impact: A reader or future panel reviewing this PR's description paragraph would believe the ignore rule is unanchored, contradicting the actual `.gitignore`. The "Assumptions" section muddles this by narrating the correction, but the first paragraph was never updated to match.
- origin: NEW

---