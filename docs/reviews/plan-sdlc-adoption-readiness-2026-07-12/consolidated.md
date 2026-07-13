# Consolidated plan review — adoption readiness semantics

- Target: `docs/plans/2026-07-12-sdlc-adoption-readiness.md`
- Panel: `zai/glm-5.2:high`, `anthropic/claude-opus-4-8:high`,
  `moonshotai/kimi-k2.6:high` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI

## High

### H1 — Paths/hooks could never be exit-3 prerequisites

FS1 validates them inside the manifest, so malformed values necessarily make
the manifest invalid rather than “valid but not ready.”

**Adjudication: incorporated.** Paths/hooks were removed from readiness
prerequisites and explicitly remain exit-2 manifest failures.

### H2 — DoD overclaimed mechanical tests of agent behaviour

All reviewers identified that announcements, phase entry, stamping, tracker
mutation, and gate claims are agent-executed prose, not code paths.

**Adjudication: incorporated.** Tests are now limited to status outputs/exits and
mutation checks of the four documented `SKILL.md` branches. Live agent adherence
remains transcript-audited prose under ADR 0011.

### H3 — Non-git handling contradicted the advisory branch

Two reviewers rated this high: R1 allowed advisory mode after an exit-2
operational error while R5 stopped on exit 2.

**Adjudication: incorporated.** Non-git is unambiguously exit 2 and stops the
SDLC; advisory mode is not offered. Migration notes cover the former exit-1
behaviour for non-git `--repo-root` callers.

## Medium

### M1 — “Committed” versus index-tracked adoption was ambiguous

**Adjudication: incorporated.** Adoption now requires a manifest blob in current
`HEAD`. Staged-only/untracked/ignored-only manifests are exit 1. A committed
manifest whose index or working-tree copy differs is exit 3. Linked worktrees
use their own HEAD/index/worktree. Fixtures cover these distinctions.

### M2 — Models/workflow classifications and fatal validators were unresolved

**Adjudication: incorporated.** Missing/malformed models and unreadable workflow
are fixed as exit 3. The plan names the need for a non-fatal readiness seam and
forbids changing existing `resolve-panel` exit behaviour.

### M3 — Existing non-git test fixtures would all break

**Adjudication: incorporated.** The risk and DoD now require git-initialised
positive/not-adopted fixtures and a separate non-git exit-2 fixture.

### M4 — New machine output lacked frozen-surface treatment

**Adjudication: incorporated.** The output/flag shape is explicitly a new frozen
`sdlc-status` surface under its own ADR, not silently folded into ADR 0005.

### M5 — Absent-manifest DoD lacked git context

**Adjudication: incorporated.** The DoD now scopes absent/staged/untracked/
ignored exit-1 cases to git-initialised fixtures.

## Low

- R6 now documents non-git exit-1 → exit-2 migration.
- Current test-fixture replacement is an explicit dependency.

## Stop condition

No high or medium finding survives adjudication in the revised plan. The plan is
one coherent Specification's worth of work. The next gate is human approval;
no Specification, Build, tracker mutation, or implementation begins before it.
