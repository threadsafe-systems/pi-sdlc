# Specification: adoption bundle and lifecycle checking

- Date: 2026-07-13
- Governing Plan: `docs/plans/2026-07-13-sdlc-adoption-bundle.md`
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Parent stream: `docs/plans/2026-07-12-sdlc-adoption-contract-honesty.md`
- Track: **irreversible**
- Author vendor: anthropic
- Spec panel: rounds 1–2 adjudicated, zero surviving high/medium —
  `docs/reviews/spec-sdlc-adoption-bundle-2026-07-13/consolidated.md`
  (this is revision 3; round-2 luna dropout disclosed there).
- Human gate: Specification approved by Neil Chambers on 2026-07-13.
- Frozen surfaces:
  - introduces **FS9**: the PR track-declaration grammar and the
    `check-lifecycle` CLI output/exit surface, schema version 1 (new ADR);
  - introduces **FS10**: `setup-sdlc`'s bundle-mode asset-report surface,
    schema version 1 (new ADR);
  - does not amend FS1, FS2, FS3, FS8 (ADR 0016), ADR 0015, ADR 0011,
    ADR 0013, or ADR 0014. FS5 gains one new sibling CLI
    (`check-lifecycle`); `setup-sdlc` gains additive flags plus one
    ADR-0018-recorded compatibility change to existing-config handling
    (§3.1, §6.2). No other existing CLI contract changes.

## 0. Summary

`setup-sdlc` grows from writing config (+ optional models) to provisioning or
verifying the complete adoption bundle: a PR template carrying a minimal
machine-parseable track declaration, optional prompt copies, and — only when
the repository has no CI at all — an offered GitHub Actions workflow. A new
read-only, offline CLI, `check-lifecycle`, makes the declared-track artifact
contract falsifiable locally and in CI. The dogfooding repository adopts the
full bundle. `sdlc-status`/FS8 is untouched: no repository's readiness result
changes.

## 1. FS9 — the PR track declaration (grammar v1)

### 1.1 The declaration block

A declaration is a fenced code block whose info string is exactly `sdlc`,
anywhere in the PR body (or template):

````text
```sdlc
track: reversible
slug: my-feature
```
````

Block-content grammar (line-oriented; `\n` or `\r\n`; blank lines ignored):

- `track: <irreversible|reversible|none>` — required, exactly once.
- `slug: <slug>` — required exactly once when track ≠ `none`; forbidden when
  track = `none`. `<slug>` matches `^[a-z0-9]+(-[a-z0-9]+)*$`, length ≤ 64.
- `reason: <text>` — required exactly once when track = `none`; forbidden
  otherwise. `<text>` is a non-empty single line, length ≤ 200.
- Keys are lowercase, followed by `:` and one space. Unknown keys, duplicate
  keys, or any non-matching non-blank line make the block **invalid**.

A body parses to **exactly one valid declaration** when it contains exactly
one `sdlc`-fenced block and that block is valid. Zero blocks = no
declaration. Two or more blocks = ambiguous (fail, never "first wins"). One
malformed block = invalid declaration (fail, with the line-level diagnostic).

### 1.2 Track semantics (artifact demands)

| track | required committed artifacts for `<slug>` |
|---|---|
| `irreversible` | plan, spec, build plan |
| `reversible` | plan, build plan — a Specification is never demanded |
| `none` | none — exemption declaration, not a third lifecycle track |

### 1.3 Auto-generated-PR exemption

A PR is **exempt-eligible** when the PR author login ends with `[bot]`
(GitHub App convention: `dependabot[bot]`, `github-actions[bot]`, …), taken
from `.pull_request.user.login` in CI mode or `--author` in local mode.

Precedence is a single rule: **a present, valid declaration always
dominates** — it is checked normally regardless of author. Exemption applies
only when an exempt-eligible PR has **no valid declaration** (zero blocks,
or only invalid/ambiguous blocks): the PR then passes as `none` with the
recorded reason `auto-generated PR (author: <login>)`. A non-exempt PR
without a valid declaration fails. Exemption identification is frozen in FS9
v1; it is not configurable and not checker discretion.

### 1.4 Artifact resolution

Artifact paths derive from the FS1 config's `paths` (defaults `docs/plans`,
`docs/specs`) resolved against the consumer root:

- plan: `<paths.plans>/<date>-<slug>.md`
- spec: `<paths.specs>/<date>-<slug>.md`
- build plan: `<paths.plans>/<date>-<slug>-build.md`

`<date>` matches `^\d{4}-\d{2}-\d{2}$` and is unknown to the caller: the
checker lists the directory **in `HEAD`** (`git ls-tree` of
`HEAD:<prefix><dir>`, with the same top-level/prefix rules as FS8 §2.3) and
matches filenames exactly against the pattern. An artifact **exists** when
≥ 1 filename matches; every match is listed in the check message (a
re-planned feature legitimately has more than one dated doc). Filename
matching is exact — `<slug>` never matches by prefix/substring, and the
build-plan pattern's `-build` suffix keeps plan and build-plan disjoint.
Committed means the blob is in current `HEAD`; working-tree-only or
staged-only docs do not exist for the checker.

A configured directory that does not exist in `HEAD` yields **zero
matches** — the artifact does not exist (`artifact.*:fail`); a failing
`ls-tree` on a missing tree path is never classified as an operational
error. Exit 2 is reserved for repository/git *execution* failures.

Containment: after joining `paths` values to the consumer root, the checker
normalises the result (platform-aware, including `\`-separated segments)
and verifies it remains inside the consumer root; escape is
`config.valid:error` (exit 2). This is enforcement at the point of use on
every platform — FS1 validation itself is unchanged.

## 2. FS9 — CLI contract, `check-lifecycle`

### 2.1 Invocation

New sibling pair, FS5 house pattern (thin `.sh` launcher, identical `.mjs`
contract):

```text
check-lifecycle.sh [--config DIR | --repo-root DIR] [--format text|json]
                   (--event FILE | --body FILE [--author LOGIN]
                    | --track T [--slug S] [--reason R] [--author LOGIN])
```

- Root resolution, `--format` handling (default `text`, full-argv JSON
  pre-scan), and `--help` semantics are identical to FS8 §1.1.
- Exactly one **declaration source group** is required:
  - `--event FILE` (CI mode): FILE is a GitHub event payload; the body is
    `.pull_request.body`, the author `.pull_request.user.login`. Read as
    JSON data from the file — never via shell interpolation of body content.
  - `--body FILE` (local mode): FILE contains the raw body text; `--author`
    optionally supplies the login for exemption.
  - `--track`/`--slug`/`--reason` (local flags mode): the declaration is
    given directly; value rules of §1.1 apply, evaluated by the
    `declaration.track`/`.slug`/`.reason` checks exactly as in the other
    modes. `--author` as above.
- Event-payload semantics (pinned): a payload that is not valid JSON or has
  no `.pull_request` object is `declaration.source:error` (exit 2). A
  `null` or absent `.pull_request.body` is a valid **empty body** (no
  declaration — proceeds to §1.3 exemption/fail logic). A missing or
  non-string `.pull_request.user.login` means the author is unknown: the PR
  is not exempt-eligible, and this alone is never an error.
- Mixing source groups, unknown flags, missing values, or unreadable
  `--event`/`--body` files are operational errors (exit 2).

### 2.2 Exit/state mapping

`validate-task` convention (ADR 0014 style): `0 pass`, `1 fail` (contract
violation: declaration missing/invalid/ambiguous, missing reason/slug,
missing required artifact), `2 error` (CLI/root/git/config/payload failure).
No other exit is valid in FS9 v1.

### 2.3 Canonical checks

Emitted in this order; a check whose prerequisite did not pass is `skip`,
never omitted (FS8 §2.8 discipline):

| ID | Purpose | Failure classification |
|---|---|---|
| `cli.arguments` | Validate the complete argument set incl. source-group exclusivity. | error → 2 |
| `root.resolve` | FS3 root resolution (non-fatal seam). | error → 2 |
| `git.repository` | Root is in one git worktree; compute prefix. | error → 2 |
| `config.valid` | Read committed-or-active FS1 config for `paths` (unchanged FS1 rules) + §1.4 containment. | error → 2 |
| `declaration.source` | Obtain body/flags; parse event payload JSON (§2.1 semantics). | error → 2 |
| `declaration.parse` | Block **structure** only, or exempt fallback per §1.3. | fail → 1 |
| `declaration.track` | Track **value** ∈ {irreversible, reversible, none}. | fail → 1 |
| `declaration.slug` | Slug presence rule + value rule (regex/length) per track. | fail → 1 |
| `declaration.reason` | Reason presence rule + value rule (non-empty/length) per track. | fail → 1 |
| `artifact.plan` | Plan doc exists in `HEAD` per §1.4. | fail → 1 |
| `artifact.spec` | Spec doc exists in `HEAD` per §1.4. | fail → 1 |
| `artifact.build` | Build-plan doc exists in `HEAD` per §1.4. | fail → 1 |

Validation boundary (all modes): `declaration.parse` validates **structure
only** — exactly one `sdlc`-fenced block, known keys, no duplicates, no
unknown keys, no non-key non-blank lines (flags mode passes it trivially).
**Value-level** validation is owned by `declaration.track` (membership),
`declaration.slug` (presence per track, regex, length), and
`declaration.reason` (presence per track, non-empty, length) — so every
value defect fires the same check id in event, body, and flags modes. When
the §1.3 exempt fallback applies, `declaration.parse` passes with the
message `no valid declaration; auto-generated exemption applies (author:
<login>)` and **synthesises** track `none` plus the generated reason;
`declaration.track` and every downstream check then evaluate those
synthetic values through the normal rules — no check special-cases the
exempt state beyond this handoff.

Prerequisite matrix (multi-prerequisite; a check runs only when every
listed prerequisite passed, else `skip` with the stable message
`prerequisite <id> did not pass`):

| Check | Prerequisites |
|---|---|
| `cli.arguments` | none |
| `root.resolve` | `cli.arguments` |
| `git.repository` | `root.resolve` |
| `config.valid` | `git.repository` |
| `declaration.source` | `cli.arguments` |
| `declaration.parse` | `declaration.source` |
| `declaration.track` | `declaration.parse` |
| `declaration.slug` | `declaration.track` |
| `declaration.reason` | `declaration.track` |
| `artifact.plan` | `config.valid`, `declaration.slug` |
| `artifact.spec` | `config.valid`, `declaration.slug` |
| `artifact.build` | `config.valid`, `declaration.slug` |

Applicability skips (distinct from prerequisite skips, pinned messages):
when track = `none` (declared or exempt), every `artifact.*` check is
`skip` with `no artifact demanded for track: none` (and `declaration.slug`
passes vacuously with `slug not applicable for track: none` **when no slug
is present** — a slug supplied with track `none` is forbidden by §1.1 and
fails `declaration.slug` with a distinct diagnostic); when track =
`reversible`, `artifact.spec` is `skip` with `specification not required on
the reversible track`.

Aggregate precedence: any `error` → exit 2; else any `fail` → exit 1; else
exit 0.

### 2.4 Output envelope

JSON (`--format json`; exactly one object + trailing newline on stdout,
nothing on stderr after the pre-scan, FS8 §1.3 discipline):

```ts
type LifecycleState = "pass" | "fail" | "error";

type LifecycleReportV1 = {
  schemaVersion: 1;
  root: string;               // absolute; cwd fallback as FS8
  mode: "event" | "body" | "flags";
  state: LifecycleState;
  exitCode: 0 | 1 | 2;
  track: "irreversible" | "reversible" | "none" | null;
  slug: string | null;
  reason: string | null;
  exempt: boolean;
  checks: { id: string; status: "pass" | "fail" | "error" | "skip";
            message: string; remediation?: string }[];
};
```

Null semantics (uniform rule — each field is `null` until its own check
passes): `track` is `null` until `declaration.track` passes; `slug` is
`null` until `declaration.slug` passes, and remains `null` for track
`none` (where the check passes with no slug value); `reason` is `null`
until `declaration.reason` passes, and remains `null` for track ≠ `none`
— for exempt passes it carries the generated
`auto-generated PR (author: <login>)` reason. A field whose own check
fails is `null`; raw invalid input is never echoed into these fields.

Text format mirrors FS8 §1.4: `root:`, `mode:`, `state:`, `exit-code:`,
`track:`, `slug:`, `reason:`, `exempt:` header lines in that order (null
fields print as `-`), then `check:` / `remediation:` lines in canonical
order. No credential value, auth-file
content, or environment-secret value appears in output; PR-body content is
only ever echoed in single-line, length-capped (≤ 120 chars, control
characters replaced) diagnostic excerpts.

### 2.5 Inspection discipline

Read-only, offline, deterministic: no file writes, no network, no model
call, no credential read, no shell interpolation of repository or PR-body
content (git invoked with argument arrays), bounded git/filesystem
operations (single-directory `ls-tree` listings, no recursive scan).

## 3. FS10 — `setup-sdlc` bundle provisioning

### 3.1 Bundle-run trigger, CLI, and asset set

Complete CLI (additive to the existing surface):

```text
setup-sdlc.sh [existing config/tracker/hook flags] [--with-models]
              [--with-ci-workflow] [--copy-prompts] [--force] [--yes]
              [--format text|json] [--config DIR | --repo-root DIR]
```

Flag taxonomy (pinned): **root flags** — `--config`, `--repo-root`;
**config flags** — `--prefix`, `--label-prefix`, `--announce`,
`--tracker-*`, `--hook-*`, `--force`; **asset flags** — `--with-models`,
`--with-ci-workflow`, `--copy-prompts`; **output flag** — `--format`.

**Interview mode** runs only when argv contains nothing beyond root flags.
Any config flag, asset flag, output flag, or `--yes` selects **flags
mode**, and every flags-mode run and every completed interview is a
**bundle run** — there is no separate legacy mode; every such run processes
the bundle asset set below and ends with the §3.4 report. (This extends the
existing precedent that a single config flag writes a full defaulted
config; `--with-models`-style flags now select flags mode too. The
pre-change behaviour of writing only config is retired; OH4-era tests
update accordingly, recorded in ADR 0018.) `--format` follows the FS8
full-argv JSON pre-scan; since the output flag selects flags mode,
`--format json` is non-interactive by construction. A declined interview keeps its existing behaviour: exit 1,
nothing written, no report envelope. The interview gains one question per
new optional asset (ci-workflow, prompt copies).

Bundle assets, each with a stable id:

| id | target | provisioned |
|---|---|---|
| `config` | `.pi/sdlc/sdlc.config.json` | always (existing behaviour) |
| `models` | `.pi/sdlc/sdlc.models.json` | with `--with-models` (existing) |
| `pr-template` | `.github/pull_request_template.md` | always in bundle runs |
| `ci-workflow` | `.github/workflows/sdlc-lifecycle.yml` | with `--with-ci-workflow` AND CI-absence probe passes |
| `prompt.<base>` | `.pi/sdlc/prompts/<base>.prompt.md` | with `--copy-prompts` (all four phase prompts) |

Per-asset resolution (recognise / refuse / instruct):

- **absent** → write → report `created`.
- **present and structurally satisfying** (per-asset check, §3.2) → leave
  byte-identical → report `retained`.
- **present, not satisfying** → leave byte-identical, report `refused` with
  a remediation instruction (what block/content to add manually). Never
  merge, never overwrite. `--force` does **not** extend to non-config
  assets; the manual path is delete-then-re-run.
- `config` keeps its existing `--force` semantics for *replacement*; in a
  bundle re-run without config-mutating flags an existing config reports
  `retained` and provisioning continues. With config-mutating flags, an
  existing config, and no `--force`: `config` reports `refused` (exit 1 by
  §3.4), the requested change is NOT applied, and provisioning of remaining
  assets continues. The previous hard-fail (exit 2 abort) is retired — an
  ADR-0018-recorded compatibility change; the protective guarantee (no
  overwrite without `--force`) is unchanged. With `--force`, `config`
  reports `upgraded`.
- `models` with `--with-models` and an existing file reports `retained`
  (today's "leaving it untouched" message becomes this report line).

Preflight rule: every source read (template content, workflow content,
prompt sources, models example) is resolved **before the first write**; a
missing package source is exit 2 with nothing written. A `refused` asset
never aborts provisioning of remaining independent assets.

### 3.2 Structural-acceptance checks (per asset)

- `pr-template`: the file contains at least one fenced code block with info
  string `sdlc` that contains a line matching
  `^track: (irreversible|reversible|none)$` **and** its conditional
  companion: a line beginning `slug:` when the track value is
  `irreversible`/`reversible`, or a line beginning `reason:` when it is
  `none` (the plan's adjudicated F12 boundary). Companion *values* may be
  placeholders — template acceptance requires a valid track value and the
  right companion key, not checker-valid values.
- `ci-workflow`: recognition applies to the exact target filename only and
  is a **pure line match** — the file must contain a line matching
  `repository:\s*threadsafe-systems/pi-sdlc`, a line matching
  `ref:\s*\S+`, and a line matching `node\s+\S*check-lifecycle\.mjs`, each
  anywhere in the file. No YAML-structural awareness is required or
  permitted; the false-positive trade-off (lines satisfied across
  different steps) is accepted — recognition is provisioning assistance,
  not a security boundary. Other existing workflow files are never
  inspected, edited, or counted as equivalents (they only feed the
  CI-absence probe).
- `prompt.<base>`: any existing file at the override path is `retained`
  (consumer-owned by definition; never compared, never refreshed — the
  documented refresh is delete-and-re-copy).
- `config`/`models`: structural satisfaction = parses and validates under
  unchanged FS1/FS2 rules; an existing-but-invalid file is `refused` with
  the validation diagnostic (never exit 2 in bundle mode — invalidity of a
  consumer file is their remediation, not our crash).

### 3.3 CI-absence probe

The `ci-workflow` asset is offered only when NONE of the following exists
relative to the consumer root (exact frozen list, FS10 v1):

`.github/workflows/` containing ≥ 1 `*.yml`/`*.yaml` file **other than the
target file itself** (`sdlc-lifecycle.yml`); `.gitlab-ci.yml`;
`.circleci/config.yml`; `azure-pipelines.yml`; `Jenkinsfile`;
`.travis.yml`; `bitbucket-pipelines.yml`; `.buildkite/` containing ≥ 1 file.

Excluding the target file keeps re-runs coherent: a previously provisioned
workflow does not suppress itself — on re-run the existing target file is
evaluated by §3.2 and reports `retained`/`refused` (AB8).

When the probe finds CI and `--with-ci-workflow` was requested, the asset
reports `refused` with the documented snippet (§4.3) as remediation, and
**no workflow file is created** (creation suppression, not merely no-edit).

When the consumer root is not the git top level (non-empty FS8-style
prefix), `ci-workflow` is always `refused` with a remediation noting that
GitHub Actions only runs workflows at the repository root.

### 3.4 Report envelope and exits

Every bundle run ends with a machine-stable report.

Text format, pinned line order: `root:` and `exit-code:` header lines
first, in that order; then `reference: <id> <ok|broken> — <message>` lines
in the §3.4 reference order below; then
`asset: <id> <created|retained|upgraded|refused> — <message>` lines in the
§3.1 table order, each optionally followed by
`remediation: <id> — <single-line instruction>`. No `schemaVersion:` line
in text mode (FS8 convention). `--format json`:

```ts
type SetupReportV1 = {
  schemaVersion: 1;
  root: string;
  exitCode: 0 | 1 | 2;
  error?: string; // present only on exit 2, single line
  references: { id: string; status: "ok" | "broken"; message: string }[];
  assets: { id: string; action: "created" | "retained" | "upgraded" | "refused";
            message: string; remediation?: string }[];
};
```

**References** (preflight verification, AB12): stable ids
`reference.pr-template`, `reference.ci-workflow`, `reference.prompts`,
`reference.models-example`, `reference.checker` — the package sources the
bundle reads plus the checker script the generated workflow/snippet
invokes. Only references needed by the requested asset set are verified
and reported. Any `broken` reference is exit 2 with `assets: []` and
nothing written (§3.1 preflight).

Exits: `0` — every processed asset is `created`/`retained`/`upgraded`;
`1` — at least one `refused` asset, or the interactive interview was
declined (existing meaning preserved; a declined interview writes nothing
and emits no report); `2` — operational/validation error (bad args,
unwritable target, broken reference, invalid assembled config).
`upgraded` is reserved in v1 for `config`-with-`--force` replacement; no
other v1 path emits it.

Error/warning channelling: in text mode, existing `fail()` diagnostics and
the `RUN_HOOK_WARNING` stay on stderr unchanged. In JSON mode, every
post-pre-scan result — including exit-2 errors — emits exactly one
`SetupReportV1` envelope on stdout (`error` field set, stderr empty), and
the `RUN_HOOK_WARNING` is carried as the trailing sentence of the `config`
asset's `message` instead of stderr. Self-validation behaviour is
unchanged.

## 4. Shipped asset content

### 4.1 PR template (package source, provisioned to consumers and this repo)

`.github/pull_request_template.md` contains, in order: an HTML guidance
comment explaining the three track values, the slug and reason rules, and
the exemption; the declaration block with placeholder values:

````text
```sdlc
track: reversible
slug: replace-with-feature-slug
```
````

and a **Governing documents** section instructing track-specific links:
irreversible → plan, spec, build plan; reversible → plan, build plan (with
the explicit note that no Specification exists on the reversible track and
review grounds on plan + build plan); none → replace the block's `slug`
line with a `reason:` line. The template is identical for the dogfood repo
and consumers (single package source file).

### 4.2 Offered workflow (`.github/workflows/sdlc-lifecycle.yml`)

Triggered on `pull_request`; `permissions: contents: read` (the event
payload path needs nothing more). Steps, structurally: checkout of the
consumer repo (PR head/merge ref, so `HEAD` contains the PR's committed
docs); a second checkout of `threadsafe-systems/pi-sdlc` **pinned to the
release tag current at generation time** into a fixed sub-directory;
Node setup (`>= 22`); then
`node <dir>/skills/sdlc/scripts/check-lifecycle.mjs --event "$GITHUB_EVENT_PATH" --repo-root "$GITHUB_WORKSPACE"`.
The PR body is never interpolated into any `run:` line or `env:` value —
the checker alone reads it from the event file. A clearly marked
placeholder comment block ("add your test/lint steps here") follows; no
consumer toolchain is assumed. Upgrading the checker = bumping the pinned
ref; the generated file records this in a comment.

### 4.3 Existing-CI snippet

For repositories with CI, documentation (README + the `refused`
remediation) provides the same two steps (pinned pi-sdlc checkout + node
invocation) as a copy-paste snippet for their existing workflow.

### 4.4 Dogfood integration (this repository)

`ci.yml` gains a `lifecycle` job: checkout, Node setup, and
`node skills/sdlc/scripts/check-lifecycle.mjs --event "$GITHUB_EVENT_PATH"`
— the in-repo checker, no second checkout, no new permissions. The repo
receives the shipped PR template verbatim. The PR shipping this child
declares `track: irreversible`, `slug: sdlc-adoption-bundle`, and must pass
its own check (its plan/spec/build docs are committed in the PR).

## 5. Documentation and prompt contract

### 5.1 SKILL.md

- The iron-law sentence pair "Every PR declares its track (see
  `.github/pull_request_template.md`). CI checks the declared track's
  artifacts are committed." is replaced by: "Every PR declares its track in
  the template's `sdlc` declaration block (provisioned by setup). The
  `check-lifecycle` script verifies the declared track's artifacts are
  committed — run it locally before opening the PR; in CI it runs wherever
  the repository has configured the shipped workflow or the documented
  snippet." (Exact wording may be edited for flow; the mutation-tested
  assertions below are the contract.)
- The PR-phase sentence "Open the PR with `.github/pull_request_template.md`
  filled in (track declared, plan and spec linked, checklist complete)."
  becomes track-aware: track + slug declared, governing docs linked **per
  track** (irreversible: plan+spec+build; reversible: plan+build), and for
  reversible PRs the PR panel grounds on the plan and build-plan documents.
- New short subsection (PR section or Delegation list) documenting
  `check-lifecycle` local usage and the `track: none` + reason exemption
  including the auto-generated rule.

Mutation-tested doc assertions (each has a test that fails when the
assertion is removed): the three track values; the reason-when-none rule;
the slug-when-not-none rule; the auto-generated `[bot]` exemption; the
local and CI invocation of `check-lifecycle`; setup's
recognise/refuse/instruct + re-run semantics; the absence of any
unconditional "CI checks" claim.

### 5.2 `adversary-review.prompt.md`

The prompt's inputs block gains two placeholders — `<TRACK>` (the declared
track) and `<GOVERNING_DOCS>` (the repo-relative paths of the governing
documents for the slug) — and this exact normative sentence: "When
`<TRACK>` is `reversible`, ground review constraints in the plan and
build-plan documents; a Specification does not exist on this track and
must not be demanded." SKILL.md's panel-dispatch instructions direct the
orchestrator to fill both placeholders from the PR's declaration. No other
prompt changes. Mutation tests bind to the placeholder names and the exact
sentence (AB16).

### 5.3 README

Documents: the bundle asset list, bundle re-run/upgrade path for existing
consumers, `check-lifecycle` local + CI usage, the CI-absence probe and
snippet, prompt-copy staleness + delete-and-re-copy refresh, and the
conditional nature of CI enforcement.

### 5.4 ADRs

- **ADR 0017 (FS9)**: declaration grammar v1, exemption rule, check ids,
  output envelopes, exits; closed check set; evolution only by schema-
  version bump + migration.
- **ADR 0018 (FS10)**: setup bundle asset set, per-asset actions,
  structural-acceptance boundaries, CI-absence probe list, report
  envelopes, exit mapping, preflight rule; and the recorded compatibility
  change to setup's existing-config behaviour.

## 6. Security, compatibility, non-functional

### 6.1 Security

- The PR body is untrusted input end to end: parsed as data from the event
  file, never shell-interpolated; diagnostics cap and sanitise excerpts
  (§2.4); metacharacter/injection fixtures are mandatory (AB7).
- Git and filesystem commands receive argument arrays.
- The generated workflow never elevates permissions beyond
  `contents: read` and never echoes the PR body.
- No configured path may escape the consumer repository: the checker
  enforces normalised containment at point of use on every platform
  (§1.4), over and above FS1 validation.

### 6.2 Compatibility

- FS8 (`sdlc-status`) output, checks, and exits: byte-identical before and
  after this child for every fixture (AB14). FS1/FS2 acceptance unchanged.
  `resolve-panel`, `ensure-panel-agent`, `validate-task`,
  `verify-task-receipt` unchanged.
- `setup-sdlc`'s change to existing-config handling (hard-fail →
  `retained` + continue, absent config-mutating flags) is a deliberate,
  ADR-0018-recorded compatibility change; the `--force` replacement path
  and interview decline exit are preserved.
- The package remains git-installed; no npm publication, no new runtime
  dependency (Node ≥ 22, no third-party packages).

### 6.3 Non-functional

- Checker runtime is bounded: fixed check count, single-directory `HEAD`
  listings only.
- All new tests are offline and deterministic; no network, credential, or
  model call anywhere (AB17).
- JSON serialisation is deterministic by field and check order.

## 7. Verification scenarios

### AB1 — Declaration grammar is exact

Fixtures cover: each valid track value; missing block; two blocks
(ambiguous); unknown key; duplicate key; wrong-case key; slug on `none`;
reason on lifecycle tracks; invalid slug charset/length; empty/overlong
reason; `\r\n` bodies. Valid cases pass parsing; each invalid case exits 1
with a distinct `declaration.*` diagnostic; ambiguity never resolves to
"first block wins".

Falsify: any malformed case passes, any distinct case shares a diagnostic,
or two blocks parse.

### AB2 — Exemption rule and precedence

A `[bot]`-authored event with no declaration passes as `none`
(`exempt: true`, generated reason). A human-authored event with no
declaration fails. A `[bot]`-authored event **with** a valid declaration is
checked against that declaration (declaration dominates — a bot declaring
`irreversible` with missing spec fails). A `[bot]`-authored event with only
an invalid block passes as exempt per §1.3.

Falsify: exemption overrides a valid declaration, a human PR is exempted,
or a bot PR without declaration fails.

### AB3 — Irreversible conformance

With committed plan+spec+build for the slug: pass. Removing each artifact
from `HEAD` in turn fails with the stable id naming exactly the missing doc
(`artifact.plan` / `artifact.spec` / `artifact.build`).

Falsify: a missing artifact passes or the wrong id fires.

### AB4 — Reversible never demands a spec

With committed plan+build and **no spec anywhere**: pass, with
`artifact.spec:skip` and its fixed message. Removing plan or build fails.

Falsify: reversible demands a spec or passes without plan/build.

### AB5 — `none` demands nothing

`track: none` + reason: pass with all `artifact.*` checks `skip` and zero
git artifact lookups beyond config. Without reason: exit 1 at
`declaration.reason`.

Falsify: none demands an artifact or a reasonless none passes.

### AB6 — Committed content through configured paths

A fixture with non-default `paths.plans`/`paths.specs` passes only when
docs are committed under the configured paths; identical docs at default
paths fail. Working-tree-only and staged-only docs fail; committed docs
with a dirty working tree still pass (HEAD is authoritative). Multiple
dated matches for one slug pass and are all listed.

Falsify: default paths are consulted despite config, uncommitted docs
count, or multi-match fails.

### AB7 — Envelope exactness, mode parity, injection inertness

Golden text and JSON fixtures pin exits 0/1/2 including argument errors
(FS8-style JSON pre-scan). The same fixture yields identical `state`,
`exitCode`, and check id+status sequences via `--event`, `--body`, and
flags modes; check messages and the `mode` field may differ by mode.
Bodies containing
shell metacharacters, `$(…)`, backticks, quotes, ANSI, and `${{ }}`
expressions parse inertly; diagnostics stay single-line and length-capped;
a secret sentinel in the environment never appears in output.

Falsify: mode-dependent verdicts, shape drift, executed/echoed payload, or
leaked sentinel.

### AB8 — Fresh-repo bundle provisioning and idempotence

In a fresh git fixture, one setup run with
`--yes --with-models --with-ci-workflow` reports `created` for config,
models, pr-template, ci-workflow per the FS10 envelope (text and JSON) and
exits 0. A second identical run reports `retained` for all and exits 0,
byte-identical targets. With one asset made unsatisfying (e.g. a
lookalike PR template), the re-run reports that asset `refused` (exit 1)
while still reporting the others `retained` — refusal does not abort
independent assets.

Falsify: non-idempotent re-run, missing report line, refusal aborting
others, or wrong exit.

### AB9 — Config guard preserved, bundle re-run enabled

Existing config + bundle re-run without config flags: `config retained`,
provisioning continues, exit 0. Existing config + config-mutating flags
without `--force`: `config refused`, other assets still processed, exit 1.
With `--force`: `config upgraded`. Preflight: a deleted package source
(e.g. models example) exits 2 with **nothing written**.

Falsify: silent config rewrite, force weakening, hard-fail regression that
blocks bundle acquisition, or partial write after a preflight failure.

### AB10 — Recognise / refuse / instruct

An existing consumer PR template containing a structurally valid `sdlc`
block (non-canonical surrounding content) is `retained` byte-identically. A
lookalike without the block is `refused` byte-identically with a
remediation instructing the exact block to add. Same pattern for a
consumer-authored `sdlc-lifecycle.yml` matching/failing §3.2.

Falsify: any merge/overwrite of a consumer file, or a lookalike recognised.

### AB11 — CI-absence probe, both branches

A no-CI fixture with `--with-ci-workflow` receives the workflow whose
content passes the §3.2 structural boundary (pinned pi-sdlc checkout +
`check-lifecycle.mjs` invocation + placeholder comment). Fixtures with each
frozen probe marker (a `.github/workflows/*.yml`, `.gitlab-ci.yml`, …)
receive **no new workflow file**, a `refused` report with the snippet
remediation, and no edit to any existing file.

Falsify: workflow created alongside CI, probe marker missed, or generated
workflow missing a structural element.

### AB12 — Referenced-asset verification

Setup verifies every package asset the requested bundle references (§3.4
`reference.*` ids: template/workflow sources, prompts, models example,
checker script) and reports each as `ok`/`broken` in text and JSON; a
fixture with a broken package reference reports it as `broken`, exits 2,
and writes nothing (§3.1 preflight).

Falsify: a broken reference goes unreported, or anything is written after
one.

### AB13 — Prompt copies use the existing override slot

`--copy-prompts` seeds `.pi/sdlc/prompts/` with the four phase prompts
(`created`); `ensure-panel-agent` then resolves the copy; without the
option the package prompt resolves. A pre-existing override file is
`retained`, never compared or refreshed.

Falsify: copies land elsewhere, override not honoured, or an existing
override touched.

### AB14 — Existing consumers and FS8 are untouched

An existing config+models consumer fixture acquires the bundle via re-run
with no destructive rewrite. The FS8 test suite (`test/sdlc-status.test.js`,
`test/readiness-output.test.js`) passes **unmodified** — no FS8 golden or
behavioural test file is edited in the diff — and `sdlc-status.mjs`'s FS8
code paths are not modified by this child (any shared-`lib.mjs` change must
keep those unmodified tests green).

Falsify: an FS8 test edit in the diff, an FS8 test failure, or an
`sdlc-status.mjs` behavioural change.

### AB15 — The dogfood repo passes its own check

This repo carries the shipped PR template and the `ci.yml` lifecycle job.
An offline fixture replays this PR's own declaration
(`irreversible` / `sdlc-adoption-bundle`) against this repo's `HEAD` after
the docs are committed: pass. The job runs the in-repo checker with
unchanged workflow permissions.

Falsify: the shipping PR cannot pass its own declared check.

### AB16 — Documentation and prompt contract is mutation-tested

Doc tests fail when any §5.1 enumerated assertion is removed from
SKILL.md/README; a test fails if SKILL.md regains an unconditional "CI
checks" claim; `adversary-review.prompt.md` tests assert the reversible
grounding text (plan+build, spec-not-demanded) and fail on its removal.
These verify contract presence, not live agent conduct (ADR 0011).

Falsify: a mutated assertion goes undetected.

### AB17 — No regression, no live calls

`npm test` and `npm run lint` pass. Existing FS1/FS2/FS8/PV1/PV2 and panel
goldens are unchanged. All new tests run with provider credentials removed
and a network/model-call sentinel that fails if invoked.

Falsify: regression, golden edited to mask drift, or live call.

## 8. Out of scope

Readiness/`sdlc-status` changes (FS8 v2 bundle checks); the full
normative-reference inventory (sub-change 3); skill-relative invocation
documentation and `paths` plumbing for pre-existing surfaces (sub-change
4); plan front-matter `track:`; authoring/transition templates (programme
child 2); durable receipts/hook enforcement (child 3); author-model
dispatch (child 4); tracker semantics (child 5); non-GitHub CI providers;
task boundaries (Build owns them).
