# Consolidated spec review — adoption readiness semantics

- Target: `docs/specs/2026-07-12-sdlc-adoption-readiness.md`
- Plan: `docs/plans/2026-07-12-sdlc-adoption-readiness.md`
- Panel: `anthropic/claude-opus-4-8:high`, `zai/glm-5.2:high`,
  `moonshotai/kimi-k2.6:high` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI

## High

### H1 — Fatal FS3 root resolution could not emit the mandatory JSON envelope

Two reviewers raised this (high/medium). Existing `resolveRoot` terminates via
`process.exit`, making `root.resolve:error` unreachable as structured output.

**Adjudication: incorporated.** The spec now defines a concrete non-fatal
`inspectRoot` result seam. Existing `resolveRoot` may delegate but retains its
current fatal behaviour for existing callers. JSON root failures emit FS8.

### H2 — Symlinked roots falsely mismatched git top-level

**Adjudication: incorporated.** Selected root and git top-level are compared
after filesystem realpath on both sides; symlinked temp/root fixtures are
required.

### H3 — CLI argument failures had no envelope/check contract

**Adjudication: incorporated.** `cli.arguments` is the first stable check ID.
A full-argv pre-scan recognises a well-formed `--format json` pair regardless of
position; all argument errors then emit the envelope with later checks skipped.

### H4 — Combined git diff could miss cancelling staged/working changes

**Adjudication: incorporated.** Manifest and models cleanliness require separate
index-vs-HEAD and working-tree-vs-index comparisons. AR3 covers a staged edit
whose working copy is reverted to HEAD.

## Medium

### M1 — Models could be filesystem-only yet report ready

**Adjudication: incorporated.** Models now require their own current-HEAD blob,
clean index/worktree, readability, and FS2 validity. Untracked/staged/ignored or
dirty models are exit 3; AR6 covers each class.

### M2 — Monorepo/subdirectory adoption was broken

**Adjudication: incorporated.** FS3 may select a consumer root beneath git top
level. The spec computes a safe repo-relative prefix and uses prefixed HEAD blob
paths. AR9 covers configured monorepo subdirectories.

### M3 — Check dependencies and skip arrays were ambiguous

**Adjudication: incorporated.** §2.8 now contains a complete dependency matrix.
Not-adopted and dirty-manifest golden arrays pin every run/skip decision.

### M4 — `StatusCheckId` was undefined and future evolution unclear

**Adjudication: incorporated.** The exact ten-ID union is defined. FS8 v1 has a
closed check set; adoption-bundle checks require schema version 2 and migration,
without reinterpreting v1 IDs.

### M5 — Dirty-manifest wording overclaimed validity

**Adjudication: incorporated.** Exit 3 now says HEAD contains a manifest but
active content is uncommitted or a prerequisite failed. Validity is claimed only
when `config.valid` runs.

### M6 — Collector behaviour and legacy diagnostics were under-specified

**Adjudication: incorporated.** Non-object inputs return deterministic issues and
never throw. Existing validators preserve acceptance, first-finding order,
path-prefixed diagnostics, and exit behaviour.

### M7 — Text `skip` format and unreadable-model scenario were missing

**Adjudication: incorporated.** Text uses the same check-line grammar for skip.
AR6 includes clean-but-unreadable models through the deterministic filesystem
seam.

## Low findings incorporated

- Sparse checkout and submodule boundaries are pinned in AR9.
- Migration covers non-git roots both with and without historical manifests.
- Two ADRs are required: ADR-0010 supersession and a separate FS8 surface ADR.
- FS8 exact check arrays and CLI-error golden output are covered by AR7/AR8.

## Stop condition

No high or medium finding survives adjudication in the revised Specification.
The next gate is human approval. No Build plan, board creation, tracker issue, or
implementation begins before that approval.
