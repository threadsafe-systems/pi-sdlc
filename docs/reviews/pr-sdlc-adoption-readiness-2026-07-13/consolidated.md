# PR panel — consolidated adjudication (round 1)

- PR: #17 feat(readiness): FS8 four-state adoption readiness for sdlc-status
- Reviewed HEAD: f62b157; fix wave: see round-1 fix commit referenced on the PR.
- Panel: openai-codex/gpt-5.6-sol:medium, zai/glm-5.2:medium,
  deepseek/deepseek-v4-pro:medium (author vendor anthropic excluded).
- Orchestrating/authoring model: anthropic/claude-opus-4-8 (this repo's
  author_default; consolidation and adjudication by the authoring session).

## Findings and adjudication

| # | Severity | Source | Finding | Adjudication |
|---|---|---|---|---|
| 1 | high | sol | Committed symlinked manifest/models pass head+clean checks while validation follows the link to uncommitted content — breaks §2.4 byte-identity | **Incorporated**: `headIsRegularFile` (git ls-tree --full-tree mode check); symlinked manifest → `config.valid:error`, symlinked models → `models.valid:fail` (mirrors the sparse-omission classification); tests added |
| 2 | medium | sol | Unknown-argument diagnostics echo pasted values (e.g. `--api-key=…`), violating §4.1 redaction | **Incorporated**: values after `=` elided from `cli.arguments` messages; sentinel test added |
| 3 | medium | deepseek | Skips blocked by an *errored* check reuse fail-worded SKIP_REASON ("manifest has uncommitted changes"), losing the real cause | **Incorporated**: errored ancestors now propagate their own message into dependent skips; test added |
| 4 | medium | glm | `:(top)` pathspec magic "requires git ≥ 2.43", false error on older git | **Dismissed — claim factually wrong**: the `top` magic word long predates 2.43 (git pathspec.c `PATHSPEC_FROMTOP`; magic documented in the git 2.12 docs era; the `:/` shorthand dates to 1.7.6 — see git-scm.com/docs/git/2.12.5 and stackoverflow.com/questions/31951595). No change |
| 5 | low | sol | Root flags consume a following option token as their value, fabricating a root | **Incorporated** (cheap): a value starting with `--` is treated as a missing value; test added |
| 6 | low | deepseek | Duplicate `--config`/`--repo-root` silently overwrite | **Dismissed**: FS8 §1.1 enumerates argument errors closed-form (duplicate is specified only for `--format`); adding error classes would drift the frozen v1 contract |
| 7 | low | deepseek | `parsed.format` set but rendering uses only the pre-scan | **Dismissed**: the pre-scan render path is spec-mandated (§1.1/§1.3); parseArgs still must validate the value and detect duplicates, so the field is not removable without losing required errors |
| 8 | low | deepseek | `--format=json` (equals syntax) rejected | **Dismissed**: within spec (§1.1 defines the well-formed pair as space-separated); finding 2's fix makes the resulting diagnostic clearer |
| 9 | low | deepseek | `reasonFor` fallback unreachable | **Dismissed**: retained as defensive code for future check additions; harmless and deterministic |

## Stop condition

After the round-1 fix wave, no high or medium finding survives adjudication.
Low findings 6–9 are recorded, not blocking. Round 2 of the panel runs against
the fix commit to confirm.

## Round 2 (verification pass against d84d865)

Panel: openai-codex/gpt-5.6-sol:medium, deepseek/deepseek-v4-pro:medium.
Per-model outputs: `gpt-5.6-sol.round2.md`, `deepseek-v4-pro.round2.md`.

- Round-1 fixes 2–4: **VERIFIED by both models.**
- Round-1 fix 1 (symlink trust): deepseek VERIFIED; sol NOT-CLOSED via a NEW
  finding (below).

| # | Severity | Source | Finding | Adjudication |
|---|---|---|---|---|
| 10 | high | sol | `git update-index --assume-unchanged` / `--skip-worktree` hide worktree changes from `git diff`, smuggling uncommitted manifest/models content past cleanliness into validation (false ready) | **Incorporated**: `cleanAgainstHead` adds a direct byte-identity comparison — `git hash-object` of the present working file vs `git rev-parse HEAD:<path>` — immune to index flags. An absent working file still defers to the validity check, preserving the sparse-checkout contract (AR9). Side effect adjudicated: a committed symlink is now caught by cleanliness itself (active bytes ≠ HEAD blob bytes → exit 3), which is the more honest classification; the HEAD-mode guard from round 1 remains as defence in depth. Tests added for both index flags × both files |

## Stop condition (round 2)

After the round-2 fix wave, no high or medium finding survives adjudication.
Round 3 verifies the index-flag fix.
