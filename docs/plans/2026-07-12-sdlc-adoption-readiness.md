# Plan: adoption readiness semantics

- Date: 2026-07-12
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Owns stream outcome: A1 and the readiness-semantics portion of A2
- Track: **irreversible**. This changes the public `sdlc-status` policy and exit
  meanings frozen by ADR 0010, the `SKILL.md` startup gate, and consumer upgrade
  behaviour. It explicitly supersedes ADR 0010 rather than misclassifying the
  change under ADR 0005/FS5.
- Author vendor: openai
- Human gate: Plan approved by Neil Chambers on 2026-07-12.

## Objective

Make “this repository has adopted pi-sdlc and is ready to run it as law” a
truthful, machine-observable statement. Distinguish adoption, validity, and
readiness without paid calls, and make startup fail before announcing or
entering the lifecycle when required local foundations are incomplete.

## Required outcomes

### R1 — Committed adoption is enforced

A repository is adopted only when the current `HEAD` contains
`.pi/sdlc/sdlc.config.json` in the resolved consumer repository. Mere index or
filesystem presence — staged-but-uncommitted, untracked, or ignored — is not
committed adoption and returns exit 1.

If `HEAD` contains the manifest but the index or working-tree copy differs from
the committed blob, the repository is adopted but the active configuration is
not ready: exit 3 reports an uncommitted-manifest blocker. This prevents an
agent from running law against config content that has not passed the repo's
commit boundary.

A non-git directory cannot claim committed adoption. It returns exit 2 and the
SDLC stops; advisory mode is not offered on an operational error.

The check is read-only and evaluates the consumer repository/worktree resolved
by existing root rules. Linked worktrees read their own `HEAD`, index, and
working-tree copy rather than the main checkout's branch.

### R2 — Four status outcomes have fixed meanings

`sdlc-status` returns exactly these top-level outcomes:

| Exit | State | Meaning |
|---|---|---|
| 0 | `ready` | Manifest is tracked and valid; every readiness prerequisite owned by this change is present and valid. |
| 1 | `not-adopted` | No manifest blob exists in current `HEAD`, including absent, staged-only, untracked-only, or ignored-only content. |
| 2 | `error` | Bad arguments, malformed manifest, root/git operational failure, or another condition that prevents a trustworthy readiness decision. |
| 3 | `not-ready` | A valid manifest exists in `HEAD`, but its active copy is uncommitted or another independently checkable readiness prerequisite is missing or invalid. |

This supersedes ADR 0010's `0 opted-in / 1 no manifest / 2 invalid` contract.
Existing callers must branch on all four outcomes; exit 3 must never fall
through to “run under full law.”

### R3 — Initial readiness prerequisites are bounded

This change owns only prerequisites available before later stream changes:

- tracked, schema-valid `sdlc.config.json`;
- present, schema-valid `sdlc.models.json`;
- optional `workflow.md`, when present, is readable.

`paths` and hooks are not separate readiness checks: they are part of FS1
manifest validity, so malformed values classify the manifest as exit 2.
Malformed models and an unreadable optional workflow are supporting-prerequisite
failures and therefore exit 3, not operational exit 2.

It does not require live credentials, PONGs, tracker configuration, PR/CI assets,
phase templates, author-model preferences, or durable run receipts. Later
sub-changes may add readiness prerequisites through explicitly versioned
contract amendments; they must not reinterpret exits 0–3.

Model IDs are validated structurally by existing rules, not checked against a
live provider roster in this change.

### R4 — Diagnostics aggregate independent blockers

One run reports every blocker that can be determined without first fixing
another blocker. For example, a tracked valid manifest plus a missing models
file and unreadable workflow reports both readiness blockers and exits 3.

A malformed manifest exits 2 because trustworthy config-dependent checks cannot
continue, but still reports independent root/git facts already known. Models
and workflow readiness use a non-fatal validation seam: existing
`readModels`/`validateModels` terminate with exit 2 for `resolve-panel` and must
not be reused in a way that changes that frozen caller's behaviour. Diagnostic
ordering is deterministic so humans, tests, and callers can compare results.

Both human-readable and machine-consumable output expose:

- resolved root;
- tracked-adoption result;
- state and exit meaning;
- each readiness check with pass/fail/error and a stable identifier;
- actionable remediation for each blocker.

The Specification pins the output/flag shape as a new frozen `sdlc-status`
machine-output surface under its own ADR. ADR 0005 remains scoped to its
existing sibling CLIs; this new surface receives equivalent explicit versioning
rather than being left provisional.

### R5 — Startup law follows readiness, not presence

`SKILL.md`'s first decision procedure branches as follows:

- exit 0: announce and proceed under full law;
- exit 1: offer setup or explicit advisory mode;
- exit 2: surface the error and stop the SDLC;
- exit 3: state that the repo is adopted but incomplete, list remediation, and
  stop before announce; advisory mode is not silently offered as a way around a
  broken adopted configuration.

The prose contract forbids hooks, panel stamping, tracker mutation, gate claims,
and phase entry before exit 0. Mechanical tests cover `sdlc-status` outputs and
exit codes plus mutation/doc-presence checks for the four `SKILL.md` branches;
actual agent adherence remains transcript-audited prose under ADR 0011.

### R6 — Existing consumers receive an explicit migration

The change includes:

- a superseding ADR that records the four outcomes and compatibility cost;
- migration guidance for callers that previously treated any manifest-backed
  exit 0 as readiness, and for non-git `--repo-root` callers that previously
  received exit 1 but now receive exit 2;
- fixtures representing existing valid config-only and config+models consumers;
- clear communication that additional adoption-bundle prerequisites arrive in
  the next sub-change rather than being silently required here.

The existing `readConfig(root)` default behaviour for panel-generation contracts
is not changed by this child unless the Specification proves it is required and
classifies the additional compatibility impact.

## Scope

### In

- `sdlc-status` adoption/readiness policy, diagnostics, output, and exit contract.
- Git tracked/ignored/untracked/non-git detection at the resolved root.
- Validation of current config/models/readable-workflow readiness prerequisites.
- `SKILL.md` startup branching and readiness terminology.
- README/setup-template wording necessary to explain current readiness and the
  forthcoming bundle upgrade.
- ADR 0010 supersession and migration documentation.
- Offline fixtures and tests for all state combinations and aggregate results.

### Out

- Provisioning missing readiness assets; adoption-bundle sub-change 2.
- PR templates, local lifecycle checker, or GitHub Actions integration;
  sub-change 2.
- Normative-reference checker; sub-change 3.
- Skill invocation and path override plumbing beyond existing validation;
  sub-change 4.
- Live credential/model availability checks or PONGs.
- Author-model preferences, tracker setup, lifecycle receipts, or task
  validation.
- Changing hook execution or advisory-mode restrictions.

## Constraints and locked decisions

- Root resolution FS3 remains unchanged.
- FS1 config and FS2 models schemas remain unchanged in this child.
- Exit 0 is the only state allowed to enter full SDLC law.
- Errors that prevent a trustworthy answer are distinct from known readiness
  blockers.
- Readiness is read-only and makes no network or paid-model calls.
- Advisory mode remains explicit, session-only, non-announcing, and incapable of
  mutating tracker objects or claiming gates.
- Diagnostic output must not expose credentials or auth-file contents.

## Risks and dependencies

- **Git states:** linked worktrees, detached HEAD, sparse checkout, submodules,
  ignored files, repositories without an initial commit, staged-only files, and
  dirty tracked manifests complicate committed adoption. The contract uses a
  current-`HEAD` blob plus index/working-tree equality, with representative
  fixtures for each relevant state.
- **Unreadable files:** CI often runs as the owner, making permission failures
  difficult to exercise portably. Tests need a deterministic strategy or a
  seam that does not depend on Unix-only permissions.
- **Exit-code break:** shell callers may treat any nonzero result identically.
  Migration must state how to distinguish 1, 2, and 3 and update all shipped
  callers atomically.
- **Status naming:** current output says `opted-in: yes/no`. New state naming must
  not leave contradictory legacy keys that imply not-ready is ready.
- **Existing fixtures:** `test/sdlc-status.test.js` currently uses non-git temp
  directories. Positive/not-adopted fixtures must be rebuilt as git repositories
  with commits; a separate non-git fixture proves exit 2.
- **Fatal validators:** shared models validators terminate the process with exit
  2 for existing panel callers. Readiness needs a backward-compatible non-fatal
  validation seam or isolated equivalent; it must not alter `resolve-panel`'s
  existing exit contract.
- **Premature bundle coupling:** this child must not anticipate sub-change 2 by
  declaring absent PR/CI assets not-ready before their contract is approved.

## Definition of done

- [ ] A committed, clean config plus valid models returns exit 0/state `ready`
      in an offline git fixture.
- [ ] In git-initialised fixtures, absent, staged-only, untracked-only, and
      ignored-only manifests each return exit 1/state `not-adopted`.
- [ ] A manifest present in `HEAD` but modified in the index or working tree
      returns exit 3 with an uncommitted-manifest blocker; clean linked-worktree
      and detached-HEAD fixtures have pinned expected results.
- [ ] A malformed tracked manifest, bad CLI arguments, and a non-git root each
      return exit 2/state `error` with distinct stable diagnostics.
- [ ] A committed valid manifest with missing models, malformed models, or an
      unreadable optional workflow returns exit 3/state `not-ready`; each has a
      stable independent check ID.
- [ ] A fixture with two independent readiness blockers reports both in stable
      order during one run.
- [ ] Human-readable and machine-consumable outputs carry root, state, stable
      check IDs, per-check result, and remediation without leaking auth data.
- [ ] Script tests cover outputs/exits 0/1/2/3, and documentation mutation tests
      fail when any `SKILL.md` branch omits its required stop/proceed rule. The
      test claim is limited to script and contract text; live agent adherence is
      transcript-audited prose under ADR 0011.
- [ ] `SKILL.md`, README, and setup guidance use readiness terminology
      consistently and do not equate manifest presence with full readiness.
- [ ] Existing current-config and non-git fixtures demonstrate migration from
      ADR 0010; a superseding ADR records the breaking policy/exit change, and a
      separate ADR freezes the new machine-output shape.
- [ ] Existing FS1/FS2 validation scenarios and default `readConfig` behaviour
      remain green unless an approved Specification explicitly classifies a
      necessary change.
- [ ] No readiness test performs network access, reads live credentials, or
      invokes a paid model.
- [ ] `npm test` and `npm run lint` pass.
- [ ] Plan, Specification, and PR panels reach no surviving high or medium
      findings with recorded adjudication.

## Context for the Specification author

Current behaviour to replace:

- `skills/sdlc/scripts/sdlc-status.mjs` checks only filesystem existence of the
  manifest before calling `readConfig`, then exits 0 and prints
  `opted-in: yes` even when models are absent.
- `skills/sdlc/SKILL.md` treats exit 0 as adopted and enters full law.
- ADR 0010 freezes 0/1/2 around manifest presence but describes adoption as a
  **committed** manifest, which current code never verifies.
- `sdlc-status` reports hook counts and models presence but does not validate the
  models file or expose a machine-readable aggregate check result.

The Specification must pin stable scenario IDs for R1–R6, the exact diagnostic
and machine-output contract, malformed-model/unreadable-workflow
classifications, and the ADR/migration treatment. It must not provision the
adoption bundle, create tracker tasks, or choose implementation task boundaries;
those belong to the next sub-change or Build.
