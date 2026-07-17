# PR review consolidation: config-versioning-migration

- Date: 2026-07-16 through 2026-07-17
- Track: irreversible
- Initial commit: `7ad1fa69dc42c2c5c4d29ef32c8ec2ea168cbfd8`
- Fix commits: `216d2119d9d60fc31cbf97c6770d354326eeab06`, `3d925c68e723d69190c7355cc02c38d06d4881e5`
- Orchestrator: `openai-codex/gpt-5.6-sol:high`
- Reviewers: `openai-codex/gpt-5.6-sol:high`, `deepseek/deepseek-v4-pro:high`, `google/gemini-3.5-flash:high`, and `google/gemini-3.1-pro-preview:high`

## Model resolution note

The exact user-requested `google/gemini-3.1-pro-review` returned HTTP 404 from Google's `v1beta generateContent` endpoint. The available `google/gemini-3.1-pro-preview:high` was substituted and completed both verification cycles. The final panel covered three independent vendors. The updated dogfood roster also exposed that `resolve-panel` did not map `GEMINI_API_KEY`; the integration fix adds that provider credential seam and a regression.

## Consolidated findings and adjudication

### 1. Staging symlink traversal

- Initial severity: high
- Disposition: incorporated in `216d211`
- Resolution: staging creation rejects symlink traversal; later strengthened to unlink the dedicated staging entry and recreate it with `O_EXCL | O_NOFOLLOW`.
- Verification: all final reviewers marked resolved.

### 2. Malformed config allowed unrelated setup writes

- Initial severity: medium
- Disposition: incorporated in `216d211`
- Resolution: malformed existing config returns an exit-1 refusal report before normal setup or any bundle write.
- Verification: all participating cycle-2 reviewers marked resolved.

### 3. Interactive JSON confirmation polluted stdout

- Initial severity: medium
- Disposition: incorporated in `216d211`
- Resolution: confirmation uses stderr; the PTY regression redirects and parses stdout as one JSON envelope.
- Verification: all participating cycle-2 reviewers marked resolved.

### 4. Hard-linked staging path could still be truncated

- Initial severity: high
- Disposition: incorporated in `3d925c6`
- Resolution: existing staging entries are unlinked without following, then recreated exclusively; hard-link and symlink sentinels remain byte-identical.
- Verification: all final reviewers marked resolved.

### 5. Prompt-time source edits could be lost

- Initial severity: high
- Disposition: incorporated in `3d925c6`
- Resolution: setup re-reads and byte-compares both raw inputs immediately after confirmation and refuses before writing if either changed.
- Verification: all final reviewers marked resolved.

### 6. Post-confirmation uncooperative-writer race

- Initial severity: high
- Disposition: owner-adjudicated boundary; dismissed as out of supported contract with explicit residual risk
- Evidence: portable synchronous Node filesystem operations do not provide a cross-file compare-and-swap. Eliminating every path-replacement/open-file-descriptor race would require a quarantine/no-replace protocol, new recovery states, retained backups, and a reopened Spec/ADR design.
- Owner decision: on 2026-07-17 Neil selected the single-writer option. After answering yes, the operator must not edit either config file or run another setup/migration until completion.
- Incorporated controls: setup prints that boundary before confirmation; prompt-time changes still refuse; Spec rev 3, Build plan, and ADR 0025 record the boundary and residual risk.

## Recorded low findings

The following remain non-blocking and are recorded rather than silently dismissed:

1. Bare no-runFlag setup does not offer residue cleanup: deferred; a flagged interactive run cleans ignored residue.
2. Defensive lifecycle author diagnostic can name `--author` for an invalid default: deferred; committed schema validation makes that source unreachable.
3. `CONFIG_DEFAULTS.schemaVersion` remains 1: retained intentionally for the documented missing-manifest compatibility path, outside the persisted version seam.
4. `VALID_MODELS` test export is unused: recorded test-only dead data.
5. Non-TTY residue cleanup retains ignored residue: by design and pinned by CV11.

## Verification

- Focused migration, documentation, resolver, and setup tests pass.
- Full suite: 206 tests pass.
- Biome lint passes.
- LSP diagnostics on edited JavaScript files report no errors.
- `git diff --check` passes.

## Final verdict

**PASS.** No high or medium finding survives owner adjudication. Low findings are recorded and non-blocking. The PR review cycle is complete once the review artifacts, single-writer disposition, Google credential seam, and updated roster are committed and the final suite remains green.
