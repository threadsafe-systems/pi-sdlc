# ADR 0015: adoption is the committed HEAD manifest; readiness is four-state

- Amended by: [ADR 0023](0023-status-surface-fs8-v2.md)

- Context: ADR 0010 defined opt-in as "the presence of a committed manifest",
  but the gate mechanically tested only filesystem presence, so untracked,
  staged, ignored, or dirty manifests counted as adoption and non-git roots
  could pass. The old status (0 opted-in / 1 no manifest / 2 invalid) could
  not honestly express "adopted but incomplete", and its exit 0 overclaimed
  readiness.
- Decision: `sdlc-status` (FS8, spec
  `docs/specs/2026-07-12-sdlc-adoption-readiness.md`) now mechanically
  enforces ADR 0010's committed-manifest intent. Adoption means the manifest
  blob exists in the **current `HEAD`** of the consumer's own git worktree;
  readiness additionally requires the active manifest clean (index vs `HEAD`
  and working tree vs index, independently) and FS1-valid, the models file
  committed, clean, and FS2-valid, and any `.pi/sdlc/workflow.md` readable.
  Four states map to exits: 0 `ready` / 1 `not-adopted` / 2 `error` / 3
  `not-ready` (frozen surface in ADR 0016). The SKILL.md startup table is the
  policy consumer: announce and enter law only on exit 0; exit 1 offers
  `/setup-sdlc` or explicit session-only advisory; exits 2 and 3 stop the
  SDLC and are never downgraded to advisory. That table remains agent-executed
  prose law (ADR 0011): the script proves repository state; nothing here
  claims to mechanically enforce agent behaviour.
- Consequences (migration):
  - Exit 0 now means fully ready, not merely manifest-present: a repo that
    formerly exited 0 on a filesystem-only or dirty manifest may now exit 3
    until config and models are committed and clean.
  - Exit 3 is new (adopted but incomplete or dirty); callers must branch on
    0/1/2/3 explicitly.
  - Non-git roots move to exit 2: historically they exited 1 without a
    manifest and 0 with a valid filesystem manifest. Non-git consumers must
    adopt inside a git repository.
  - The legacy text summary keys (`opted-in:`, `prefix:`, `labelPrefix:`,
    `hooks:`, `workflow:`, `models:`) are removed; parsers migrate to the FS8
    `check:` lines or preferably `--format json`.
  - Git consumers already carrying clean, committed, valid config and models
    become ready after upgrading with no file rewrite.
- Supersedes: ADR 0010.
