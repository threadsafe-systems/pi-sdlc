### Committed symlink trust-boundary bypass (`skills/sdlc/scripts/sdlc-status.mjs:178-217`)

- verdict: NOT-CLOSED
- evidence: The mode check correctly accepts monorepo-prefixed `100755` blobs and rejects monorepo-prefixed `120000` symlinks at lines 178-180, 214; gitlinks are safely rejected earlier by the exact `HEAD:path` blob lookup at lines 185-187. However, `git update-index --assume-unchanged` or `--skip-worktree` makes both diffs at lines 193-198 report clean after the manifest is changed; the uncommitted filesystem JSON is then read at line 217 and the command incorrectly exits 0/`ready`. Ordinary hardlink mutation was detected as dirty, and exact/case-sensitive `HEAD:path` lookup prevents a differently cased tree entry from satisfying the required path.

### Unknown-argument value disclosure (`skills/sdlc/scripts/sdlc-status.mjs:103-107`)

- verdict: VERIFIED
- evidence: Line 106 retains the argument name through the first `=` while replacing the complete value, including further `=` characters, with `…`. Reproduction with `--api-key=secret=tail` emitted `unexpected argument: --api-key=…`; the sentinel test is at `test/readiness-output.test.js:212-217`, and existing output goldens pass.

### Error-blocked skips use fail-worded reasons (`skills/sdlc/scripts/sdlc-status.mjs:279-288`)

- verdict: VERIFIED
- evidence: Lines 284-286 propagate an errored ancestor’s actual message before consulting `SKIP_REASON`. The error case is covered at `test/readiness-output.test.js:228-235`; FAIL blockers still use their pinned reason, demonstrated by the dirty-manifest assertion `"manifest has uncommitted changes"` at lines 300-316.

### Root flag consumes a following option token (`skills/sdlc/scripts/sdlc-status.mjs:77-84`)

- verdict: VERIFIED
- evidence: Lines 78-82 reject a missing value or following supported long-option token without incrementing the argument index, so `--format json` is subsequently parsed and preserves JSON output. `--repo-root --format json` exits 2 with `--repo-root requires a value`; coverage is at `test/readiness-output.test.js:219-226`.

### NEW DEFECTS

### Git index flags bypass the byte-identity check

- severity: high
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 193-217
- problem: `git diff --quiet` honors `assume-unchanged` and `skip-worktree`, so either index flag can hide modified manifest content from both cleanliness comparisons. The code subsequently parses that uncommitted content and reports it as committed and valid.
- repro_or_impact: On a ready fixture, run `git update-index --assume-unchanged .pi/sdlc/sdlc.config.json` or `--skip-worktree`, overwrite the manifest with different valid JSON, then run status. It exits 0/`ready`, with `adoption.manifest-clean:pass` and `config.valid:pass`, violating the §2.4 byte-identity trust boundary; models are vulnerable through the analogous path at lines 238-252.