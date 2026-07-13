# Specification: adoption readiness semantics

- Date: 2026-07-12
- Governing Plan: `docs/plans/2026-07-12-sdlc-adoption-readiness.md`
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Track: **irreversible**
- Author vendor: openai
- Human gate: Specification approved by Neil Chambers on 2026-07-12.
- Frozen surfaces:
  - supersedes ADR 0010's `sdlc-status` 0/1/2 contract;
  - introduces FS8, the `sdlc-status` v1 output/exit surface;
  - does not amend FS1, FS2, FS3, FS5, or ADR 0011.

## 0. Summary

`pi-sdlc` currently treats filesystem presence of a manifest as sufficient to
enter full law. This change makes readiness a four-state, read-only inspection
of the current git worktree:

- `0 ready`
- `1 not-adopted`
- `2 error`
- `3 not-ready`

Readiness requires a clean manifest blob in current `HEAD`, a valid active
manifest, a present and structurally valid models file, and a readable optional
workflow. It makes no network, credential, or model call.

The status command gains a versioned JSON output for machine callers and a
stable text representation for humans. `SKILL.md` branches explicitly on all
four exits. Actual agent adherence remains transcript-audited prose under ADR
0011; tests verify command behaviour and required contract text, not live agent
conduct.

## 1. CLI contract — `sdlc-status` (FS8)

### 1.1 Invocation

Existing entry points remain:

```text
sdlc-status.sh [--config DIR | --repo-root DIR] [--format text|json]
sdlc-status.mjs [--config DIR | --repo-root DIR] [--format text|json]
```

- `--format` defaults to `text`.
- `--format text` and `--format json` are the only accepted values.
- Argument handling first scans the complete argv only to detect a well-formed
  `--format json` pair, independent of position, then performs normal parsing.
  Once found anywhere, every argument error uses the JSON envelope.
- `--config` and `--repo-root` retain their existing root-resolution meaning
  and are mutually exclusive. Passing both is exit 2.
- `--help`/`-h` prints usage and exits 0 without running readiness. Help is not a
  `ready` result and does not emit the status envelope.
- Unknown flags, missing values, or extra positional arguments are exit 2.
- The `.sh` wrapper remains a thin Node launcher; its contract is identical to
  `.mjs`.

### 1.2 Exit/state mapping

| Exit | `state` | Meaning |
|---|---|---|
| 0 | `ready` | Trustworthy inspection completed and every readiness check passed. |
| 1 | `not-adopted` | Inspection proved that current `HEAD` has no manifest blob. |
| 2 | `error` | CLI/root/git/config failure prevents a trustworthy readiness decision. |
| 3 | `not-ready` | Current `HEAD` has a valid manifest, but active content is uncommitted or a supporting prerequisite failed. |

No other readiness exit is valid in FS8 v1.

### 1.3 JSON output

With `--format json`, every readiness result, including exits 1–3, writes exactly
one JSON object plus a trailing newline to stdout and writes nothing to stderr:

```json
{
  "schemaVersion": 1,
  "root": "/absolute/consumer/root",
  "state": "ready",
  "exitCode": 0,
  "checks": [
    {
      "id": "git.repository",
      "status": "pass",
      "message": "resolved root is a git worktree"
    }
  ]
}
```

Contract:

```ts
type StatusState = "ready" | "not-adopted" | "error" | "not-ready";
type CheckStatus = "pass" | "fail" | "error" | "skip";
type StatusCheckId =
  | "cli.arguments"
  | "root.resolve"
  | "git.repository"
  | "adoption.manifest-head"
  | "adoption.manifest-clean"
  | "config.valid"
  | "models.head"
  | "models.clean"
  | "models.valid"
  | "workflow.readable";

type StatusCheck = {
  id: StatusCheckId;
  status: CheckStatus;
  message: string;
  remediation?: string;
};

type StatusReportV1 = {
  schemaVersion: 1;
  root: string;
  state: StatusState;
  exitCode: 0 | 1 | 2 | 3;
  checks: StatusCheck[];
};
```

- No additional top-level or check fields are emitted in schema version 1.
- `root` is absolute. If root resolution fails before an absolute consumer root
  is known, `root` is the absolute cwd from which resolution was attempted.
- `checks` are emitted in the canonical order in §2.2.
- `message` and `remediation` are single-line, non-empty strings.
- No auth key name, credential value, auth-file content, or environment-secret
  value appears in output.
- Expected readiness failures do not write diagnostics outside the envelope.
- `cli.arguments:error` is the sole check for unknown flags, missing values,
  invalid/duplicate `--format`, conflicting root flags, or extra positionals;
  all later checks are `skip`. Its `root` is absolute cwd unless a single valid
  explicit root was already unambiguously available.
- A catastrophic failure before the full-argv JSON pre-scan can complete may
  write one line to stderr and exit 2; once a well-formed `--format json` pair
  exists anywhere in argv, the valid envelope is mandatory.

### 1.4 Text output

Default text output is line-oriented:

```text
root: /absolute/consumer/root
state: ready
exit-code: 0
check: git.repository pass — resolved root is a git worktree
```

The same check-line grammar is used for every status, including:

```text
check: config.valid skip — manifest is not committed in current HEAD
```

For a check with remediation, immediately follow it with:

```text
remediation: <check-id> — <single-line remediation>
```

Rules:

- First three lines are always `root`, `state`, `exit-code`, in that order.
- Check lines follow §2.2 canonical order.
- Text output uses stdout for all states and expected diagnostics; stderr is
  reserved for the same pre-format catastrophic exception as JSON.
- Legacy `opted-in:`, `prefix:`, `labelPrefix:`, `hooks:`, `workflow:`, and
  `models:` summary lines are removed. Their previous meanings cannot represent
  the four-state contract honestly. Migration is documented under §6.
- The configured `announce` string is never emitted by `sdlc-status`.

## 2. Inspection contract

### 2.1 No mutation or live calls

Inspection is read-only. It does not write files, run hooks, stamp agents,
modify git, inspect live credentials, invoke `pi`, call a model, access the
network, or mutate GitHub.

### 2.2 Canonical checks

Checks appear in this order. A check that cannot run because an earlier result
removed its trustworthy input is emitted as `skip`, not omitted.

| ID | Purpose | Failure classification |
|---|---|---|
| `cli.arguments` | Validate the complete CLI argument set. | error → exit 2 |
| `root.resolve` | Resolve the consumer root using existing FS3 selection rules. | error → exit 2 |
| `git.repository` | Confirm the root is within one git worktree and compute its repo-relative prefix. | error → exit 2 |
| `adoption.manifest-head` | Confirm current `HEAD` contains the consumer-root-relative manifest blob. | fail → exit 1 |
| `adoption.manifest-clean` | Independently compare index and working-tree manifest against `HEAD`. | fail → exit 3 |
| `config.valid` | Parse and validate the clean active manifest using unchanged FS1 rules. | error → exit 2 |
| `models.head` | Confirm current `HEAD` contains the consumer-root-relative models blob. | fail → exit 3 |
| `models.clean` | Independently compare index and working-tree models file against `HEAD`. | fail → exit 3 |
| `models.valid` | Parse and validate clean models using unchanged FS2 rules. | fail → exit 3 |
| `workflow.readable` | If `.pi/sdlc/workflow.md` exists, read it successfully; absence passes. | fail → exit 3 |

The check set is closed for FS8 schema version 1. Adding adoption-bundle checks in
the next stream sub-change requires FS8 schema version 2 plus migration; existing
v1 check meanings are never reinterpreted.

### 2.3 Root and git rules

1. Resolve root with existing FS3 precedence: explicit `--config` /
   `--repo-root`, then `$SDLC_ROOT`, configured ancestor walk, then git top-level.
   `sdlc-status` uses this non-fatal seam:

   ```ts
   type RootInspection =
     | { ok: true; root: string }
     | { ok: false; attemptedRoot: string; message: string };

   inspectRoot(options?: {
     config?: string;
     repoRoot?: string;
     cwd?: string;
     sdlcRoot?: string;
   }): RootInspection;
   ```

   `attemptedRoot` is absolute cwd when no more specific absolute candidate can
   be established. Existing `resolveRoot` remains behaviour-compatible for
   existing callers and may delegate to `inspectRoot` before retaining its
   current `fail(...)` behaviour.
2. Canonicalise the selected root and `git rev-parse --show-toplevel` with
   filesystem realpath on both sides. This comparison tolerates symlinked paths,
   including symlinked temporary directories.
3. The consumer root may equal the git top level or be a descendant selected by
   FS3's manifest ancestor walk/explicit root. Compute a POSIX git path prefix
   from canonical git top level to canonical consumer root; any `..` escape or a
   root belonging to a different worktree is an error. Git blob paths below are
   `<prefix>/.pi/sdlc/...` (or `.pi/sdlc/...` for an empty prefix).
4. A non-git directory, inaccessible repository, or git command failure is
   `git.repository:error`, state `error`, exit 2.
5. A git repository without `HEAD` is a trustworthy non-adoption result:
   `git.repository:pass`, `adoption.manifest-head:fail`, state `not-adopted`,
   exit 1.
6. Linked worktrees use their own top-level, `HEAD`, index, and working tree.
   Detached `HEAD` is valid because the contract binds to current `HEAD`, not a
   branch name.

### 2.4 Committed and clean manifest

`adoption.manifest-head` asks whether the blob exists at exactly the
consumer-root-relative git path:

```text
HEAD:<prefix>/.pi/sdlc/sdlc.config.json
```

- No blob: exit 1, whether the working-tree file is absent, ignored, untracked,
  or staged for addition.
- Blob exists: continue.

`adoption.manifest-clean` performs two independent comparisons for the manifest
path: index versus `HEAD`, then working tree versus index. A combined
working-tree-versus-`HEAD` diff is insufficient because staged and unstaged
changes can cancel.

- Any staged edit/deletion, unstaged edit/deletion, staged edit followed by a
  working-tree reversion, type change, or replacement fails and exits 3.
- Unrelated dirty files do not affect readiness.
- A clean manifest in a linked worktree or detached HEAD passes.

The active filesystem manifest is parsed only after both adoption checks pass.
Therefore it is byte-identical to the trusted current-`HEAD` blob when
`config.valid` runs.

### 2.5 Config classification

A clean committed manifest that cannot be read, parsed, or validated under
unchanged FS1 rules is `config.valid:error`, state `error`, exit 2. This includes
invalid `paths` and hooks; they are not separate readiness failures.

The implementation introduces a non-exiting issue collector behind existing
validation but does not change public FS1 acceptance or existing callers:

```ts
type ValidationIssue = { path: string; message: string };

inspectConfig(raw: unknown): ValidationIssue[];
inspectModels(raw: unknown): ValidationIssue[];
```

- Empty array means structurally valid.
- Non-object inputs return a deterministic issue (`path: ""`, message
  `must be a JSON object`) and never throw or exit.
- Ordering is deterministic by validation-rule order.
- Existing `validateConfig(raw, path)` and `validateModels(raw, path)` retain
  their process-exit behaviour, acceptance rules, first-finding order, and
  existing path-prefixed diagnostic text by delegating to the collectors and
  calling existing `fail(...)` when issues exist.
- `resolve-panel` and `ensure-panel-agent` outputs/exits remain unchanged.
- The collectors are internal library exports, not a consumer CLI surface.

### 2.6 Models classification

The models path remains fixed at `.pi/sdlc/sdlc.models.json` beneath the
consumer root, but readiness binds it to current `HEAD` and clean active content
just like the manifest.

- No models blob in `HEAD`: `models.head:fail`, later models checks skip, exit 3,
  even if an untracked/staged/ignored filesystem file exists.
- Blob exists but index or working tree differs/deletes it:
  `models.head:pass`, `models.clean:fail`, `models.valid:skip`, exit 3.
- Clean file unreadable: `models.valid:fail`, exit 3.
- Clean file invalid JSON or invalid under unchanged FS2 rules:
  `models.valid:fail`, exit 3.
- Clean and structurally valid: all three pass.
- No provider/model availability or credential check occurs.

Index-vs-HEAD and working-tree-vs-index comparisons are separate. Readiness uses
`inspectModels`; it must not invoke the existing exiting `readModels` path.
Existing panel behaviour remains byte/exit compatible. Read failures use the
same deterministic internal filesystem seam as workflow tests.

### 2.7 Workflow classification

The workflow path is `.pi/sdlc/workflow.md`.

- Absent: `workflow.readable:pass` with a message saying it is optional and
  absent.
- Present and readable to completion: pass.
- Present but unreadable or read fails: fail, exit 3.
- Workflow content is not semantically validated in this child.

Tests exercise read failure through an injected filesystem seam or deterministic
stub, not Unix-only permission assumptions. The seam is internal and does not
change FS8.

### 2.8 Dependency and aggregate-state contract

Dependency matrix (`run` means evaluate even if another independent check
failed; `skip` emits a stable explanatory message):

| Check | Prerequisite to run |
|---|---|
| `cli.arguments` | none |
| `root.resolve` | `cli.arguments:pass` |
| `git.repository` | `root.resolve:pass` |
| `adoption.manifest-head` | `git.repository:pass` |
| `adoption.manifest-clean` | `adoption.manifest-head:pass` |
| `config.valid` | `adoption.manifest-clean:pass` |
| `models.head` | `adoption.manifest-head:pass` |
| `models.clean` | `models.head:pass` |
| `models.valid` | `models.clean:pass` |
| `workflow.readable` | `adoption.manifest-head:pass` |

Thus not-adopted results emit `manifest-head:fail` and all later checks as
`skip`; dirty-manifest results still evaluate independent models/workflow
checks, while `config.valid` skips.

After the report contains every independently determinable check:

1. Any `error` check → state `error`, exit 2.
2. Else `adoption.manifest-head:fail` → `not-adopted`, exit 1.
3. Else any `fail` check → `not-ready`, exit 3.
4. Else → `ready`, exit 0.

Exit-3 wording is “current `HEAD` contains a manifest, but active content is
uncommitted or a supporting prerequisite failed.” Manifest validity is asserted
only when `config.valid` actually runs; dirty-manifest reports do not overclaim
that the committed or active manifest was validated.

Checks dependent on an errored/skipped prerequisite are `skip`. Independent
checks continue. Example: with a clean valid manifest, missing models and a
workflow read failure are both reported, then exit 3. With malformed config,
models/workflow checks that do not require config may still run; any
`config.valid:error` keeps the final state at exit 2.

## 3. Startup policy contract (`SKILL.md`)

The startup decision table is normative:

| Exit | Agent action |
|---|---|
| 0 | Emit configured announce, enumerate configured hooks/workflow rules, enter full law. |
| 1 | Do not announce. State not adopted; offer `/setup-sdlc` or explicit session-only advisory mode. |
| 2 | Do not announce. Surface error diagnostics and stop the SDLC; do not offer advisory as a bypass. |
| 3 | Do not announce. State adopted but incomplete, list remediations, and stop the SDLC; do not offer advisory as a bypass. |

Before exit 0, the prose contract forbids entering a phase, firing hooks,
stamping panel agents, mutating tracker objects, or claiming gates. This is
agent-executed law under ADR 0011. Offline documentation mutation tests verify
that all four branches and prohibitions remain present; they do not claim to
execute or prove agent behaviour.

## 4. Security, compatibility, and non-functional requirements

### 4.1 Security

- Git and filesystem commands receive argument arrays; no readiness path
  interpolates repository content into a shell command.
- Diagnostics redact credential values and do not inspect auth files or secret
  environment variables.
- Remediation never prints file contents.
- Symlink/path behaviour follows existing root/path validation; no configured
  artifact path may escape the repo under this child.

### 4.2 Compatibility

- FS1 and FS2 accepted/rejected documents are unchanged.
- FS3 root-selection precedence is unchanged; §2.3 validates that the selected
  root is truly the worktree top-level.
- Existing `resolve-panel` and `ensure-panel-agent` CLI exits/output remain
  unchanged.
- `readConfig(root)` default no-manifest behaviour remains unchanged.
- `sdlc-status` text output and exits are intentionally breaking and migrate to
  FS8 v1.
- Two ADRs are required: one supersedes ADR 0010's adoption/readiness policy;
  a separate ADR freezes FS8's output, check IDs, schema-version, and exit
  surface.

### 4.3 Performance and portability

- One status run completes using bounded local filesystem/git operations; no
  recursive repository scan is allowed.
- The check count is fixed in FS8 v1.
- Direct `.mjs` invocation is cross-platform. Tests do not rely on POSIX file
  modes for unreadability.
- JSON serialization is deterministic by object field and check order.

## 5. Verification scenarios

### AR1 — Clean committed repository is ready

Given a git-initialised fixture with a commit containing valid config and models,
a clean manifest, and no workflow, text and JSON runs exit 0/state `ready`; all
checks pass, workflow says optional/absent, and no network/model command runs.

Falsify: nonzero exit, missing check, wrong order, or live call.

### AR2 — Filesystem presence is not committed adoption

In separate git fixtures whose current `HEAD` lacks the manifest, test absent,
untracked, ignored, and staged-for-addition manifests. Each exits 1/state
`not-adopted`; `adoption.manifest-head` fails and config/models checks that
require adoption skip.

Falsify: any case exits 0/3 or claims ready.

### AR3 — Dirty committed manifest is not ready

From a ready fixture, test staged edit, unstaged edit, staged deletion,
unstaged deletion, and a staged edit whose working-tree copy is then reverted
to `HEAD`. Each exits 3/state `not-ready` with
`adoption.manifest-clean:fail`; unrelated dirty files still exit 0.

Falsify: dirty manifest exits 0/1/2 or unrelated dirt blocks readiness.

### AR4 — Git and CLI errors are distinct

Unknown/missing/conflicting arguments, an unresolvable implicit root, and a
non-git explicit root exit 2/state `error` with `cli.arguments`, `root.resolve`,
or `git.repository` as specified. With `--format json` anywhere in argv, even an
earlier unknown flag or later root-resolution failure produces a valid envelope.
A git repository without an initial commit exits 1/state `not-adopted`.

Falsify: argument JSON is order-dependent/invalid, operational errors offer
readiness/not-adoption incorrectly, or no-HEAD repo exits 2.

### AR5 — Manifest validity remains an error

A committed clean manifest with invalid JSON, invalid path escape, or malformed
hook exits 2/state `error` at `config.valid`. Existing FS1 mutation tests retain
their results.

Falsify: malformed manifest becomes exit 3 or FS1 acceptance changes.

### AR6 — Supporting prerequisites are not-ready

With clean valid config, independently test models absent from `HEAD`,
untracked/staged-for-addition models, dirty committed models, clean-but-
unreadable models, malformed models, FS2-invalid models, and injected workflow
read failure. Each exits 3/state `not-ready` at the specified head/clean/valid
check; no existing panel CLI exit or diagnostic changes.

Falsify: filesystem-only models make the repo ready, any case becomes exit 2,
or a panel regression occurs.

### AR7 — Independent blockers aggregate

A fixture with models absent from `HEAD` and injected workflow read failure
emits both failures in canonical order and exits 3. A fixture with malformed
config plus missing committed models reports both independently determinable
results but exits 2 by precedence. Golden arrays also pin every `skip` for a
not-adopted repo and for a dirty-manifest repo according to §2.8.

Falsify: only first blocker appears or precedence is wrong.

### AR8 — Output contracts are exact and safe

Golden text and JSON fixtures cover exits 0–3, including CLI-argument errors and
`skip` lines. JSON contains only FS8 fields, valid state/exit pairs, the exact
schema-v1 check set/order, and no stderr after JSON pre-scan recognition. Text
begins root/state/exit-code. Secret sentinel values placed in environment/auth
fixtures never appear.

Falsify: shape drift, nondeterminism, extra field, leaked sentinel, or invalid
JSON on a known failure.

### AR9 — Git-root variants use the correct context

A linked worktree uses its own root/HEAD/index; detached HEAD with required blobs
is ready; a symlinked consumer root compares equal after realpath; and a
manifest-configured consumer subdirectory inside a monorepo uses prefixed `HEAD`
blob paths and can become ready. A dirty manifest in one worktree does not
contaminate another.

A consumer root that is itself a git submodule is inspected as its own worktree;
a parent consumer does not recurse into submodules. Sparse checkout that omits a
required committed active file is unsupported for readiness and deterministically
fails (`config.valid:error` for manifest, `models.valid:fail` for models) rather
than claiming ready.

Falsify: symlink/subdirectory is rejected, main-checkout state controls a linked
worktree, detached HEAD is rejected, submodule boundary is crossed, or omitted
sparse files report ready.

### AR10 — Startup contract has four branches

Documentation mutation tests remove or alter each exit branch and each
pre-exit-0 prohibition in turn; the test fails. Current docs test passes. This
scenario verifies contract presence only, not live agent adherence.

Falsify: a mutated branch/prohibition is not detected.

### AR11 — Migration is complete

Existing non-git status fixture is replaced by explicit git fixtures; separate
non-git fixtures with and without a filesystem manifest prove exit 2.
README/SKILL/setup guidance and the policy ADR state that former manifest-backed
exit 0 may become exit 3, former non-git exit 1 becomes exit 2, and a non-git
manifest that formerly produced exit 0 also becomes exit 2. The separate FS8 ADR
pins machine output. No stale `opted-in: yes/no` output claim remains.

Falsify: stale caller/docs/fixture or missing compatibility statement.

### AR12 — No regression and no paid calls

`npm test` and `npm run lint` pass. Existing panel goldens and FS1/FS2 validation
scenarios are unchanged. Tests run with provider credentials removed and a
network/model-call sentinel that fails if invoked.

Falsify: regression, modified old golden to hide behaviour change, or live call.

## 6. Migration contract

The ADR superseding 0010 and README must state:

- ADR 0010's committed-manifest intent is now mechanically enforced.
- Exit 0 means fully ready under the prerequisites currently shipped, not merely
  manifest-present.
- Exit 3 is new and means adopted but incomplete/dirty.
- Non-git explicit roots move to exit 2: without a manifest they historically
  returned exit 1, while with a valid manifest they historically returned exit
  0.
- Text parsers must migrate from legacy summary keys to FS8 text or preferably
  `--format json`.
- Shell callers must branch on 0/1/2/3 explicitly.
- The next stream sub-change will add adoption-bundle prerequisites through an
  explicit FS8 evolution; this change does not predeclare them.

A separate FS8 ADR freezes schema version 1, exact output fields/check IDs,
text/JSON formats, and exits. No automatic file rewrite is needed for **git**
consumers already carrying clean committed valid config and models; they become
ready after upgrading. Config-only or filesystem-only-model consumers are
not-ready until models are committed and valid. Non-git consumers must adopt in
a git repository.

## 7. Out of scope

Provisioning missing assets; PR templates; lifecycle/CI checker; normative-
reference checker; path-override plumbing; author models; tracker setup;
lifecycle receipts; task validation; live credential/PONG checks; workflow
semantic validation; or any hook execution engine.
