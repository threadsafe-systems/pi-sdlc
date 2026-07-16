# Plan: config versioning & migration contract for consumer surfaces

- Date: 2026-07-16 (rev 3 — rev 1 was the pre-panel draft; rev 2 incorporated
  all 13 adjudicated findings from plan-panel cycle 1; rev 3 incorporates all
  7 adjudicated findings from cycle 2, see
  `docs/reviews/plan-review-config-versioning-migration-2026-07-16/consolidated.md`)
- Track: **irreversible** (merges two frozen consumer schemas into one new
  committed shape, reopens the frozen FS8 contract to v2, reopens the frozen
  FS5 `resolve-panel` CLI contract, and reopens the frozen FS10 setup-bundle
  surface for the merged file — all surfaces consumers and CI bind to)
- Slug: `config-versioning-migration`
- Brainstorm: map issue
  [#49](https://github.com/threadsafe-systems/pi-sdlc/issues/49) —
  decision-ready 2026-07-16; five grilling tickets (#50–#54) closed, exit call
  BUILD recorded on the map. The map is canonical for brainstorm-phase
  decisions until this document; this document is canonical from here.
- Downstream dependent: **OL-B** (the queued opt-in-lifecycle sub-change:
  checker/evidence, the FS10 *report-nudge* bump, existing-adopter profile
  application). OL-B's "apply profiles to existing adopters" IS a migration;
  this contract must land first so OL-B consumes it rather than hard-coding an
  ad-hoc one-off (sequencing recorded on #49). OL-B has no tracking issue yet.

## Objective

Give pi-sdlc's consumer-facing config surfaces a **versioning and migration
contract**: collapse the two frozen config files (FS1 `sdlc.config.json`,
FS2 `sdlc.models.json`) into **one merged schema** with an independent integer
`schemaVersion`; define **how an existing adopter crosses a schema-shape
break** (detect-on-load, prompt-for-confirmation, forwards-only, majors
block); make FS8 `sdlc-status` the **non-interactive drift detector** (→ FS8
v2); and move panel-diversity governance to an **advisory, user-owned
posture** (`strict | preference` enforcement toggle) — then perform the
**inaugural 1→2 migration** (the two-files→one-file fold) on this repo itself
as the first dogfooded consumer.

## Rationale (why this, why now)

- **Code is versioned; consumer config state is not.** semantic-release/tags
  version the package (ADR 0012), but the config loader hard-rejects anything
  but `schemaVersion 1` (`lib.mjs` `inspectConfig`), and `sdlc.models.json`
  carries no version stamp at all. The first real schema evolution (the
  vendor→model delineator shift in OL-A / v0.8.0) is already undetectable to
  existing adopters' configs. (`validate-task` and `check-references` version
  their own independent manifest/inventory schemas — those are *not* config
  consumers and are untouched by this change.)
- **The moment the config needs `schemaVersion: 2`, every adopter hard-fails
  with no migration path.** Getting the contract in place before more
  refinements accumulate silently is the whole point of map #49.
- **OL-B is blocked on this by design**: profile application to existing
  adopters is a migration; building the general mechanism first means OL-B
  consumes it instead of forcing a later reconciliation.

## Decisions carried from the map (binding)

Each is adjudicated and owner-ratified on its ticket; the ticket carries full
detail. This plan translates, it does not relitigate.

1. **#50 — single merged schema.** FS1 + FS2 collapse into **one file, one
   schema** governing **shape + data types only**. Value changes (roster/model
   -id churn) never bump the version. `schemaVersion` is an **integer on its
   own clock, independent of the package semver axis** (ADR 0012) — the two
   deliberately do not bind. The two-files→one-file merge is itself the
   **inaugural shape bump (1 → 2)**, where 2 *is* the single-file shape.
2. **#51 — advisory, never-block panel posture.** Panel diversity (vendor or
   model) is preference + recommendation, not an enforced floor;
   author-exclusion is likewise advisory. The resolver goes best-effort and
   surfaces gaps rather than refusing to form a panel. The human owns the
   decision — the waiver is signed by configuring. Setup MAY detect available
   credentials and recommend; the human always arbitrates.
3. **#52 — migration mechanism + enforcement toggle.** Migration is
   **detect-on-load + prompt-for-confirmation** (a courtesy; the human
   confirms), **forwards-only with no backward-compat window** (stay-put
   adopters pin a skill version). Refining #51: **enforcement is a user
   toggle** — `strict` hard-fails on the configured diversity floors,
   `preference` proceeds best-effort (`prompt` mode is out of scope). The
   diversity floors are **two retained axes: `minVendor`, `minModel`** (see
   the composition principle below for how they coexist with the shipped
   OL-A vocabulary). Honest failure: interactive decline and non-interactive
   CI both **halt on the version axis with a stated remedy** ("migrate, or
   pin skill version X"); unmappable/malformed transforms **report exactly
   what could not be mapped and write nothing** — never a half-migrated
   file. Overlay: **a schema-shape break rides a package major release**
   (majors block, minor/patch sail through), so semver major-pinning is the
   consumer's protection; auto-migrate-in-CI was rejected as unsafe. The
   merged file **keeps the `.pi/sdlc/sdlc.config.json` name and home**
   (settled at #52 — binding, not a Spec question).
4. **#52 — the inaugural fold.** The 1→2 migration **removes the models file
   and writes one merged `sdlc.config.json`**, rewriting fields as necessary.
   It **preserves today's blocking behaviour as `enforcement: strict` on the
   adopter's existing axis** (an adopter without a `lifecycle` block maps to
   the vendor axis, one with a `lifecycle` block to the model axis), so the
   fold produces **zero effective-panel change** for every existing adopter.
5. **#53 — FS8 is the drift detector (→ FS8 v2), asymmetric.** `sdlc-status`
   must resolve a schema to run, so detection is intrinsic to it; no second
   surface. **Behind-drift** (config schema older than the skill) becomes a
   new **non-fatal check `config.schema-current`** landing the existing
   **`not-ready` state (exit 3)** with the #52 remedy — no fifth state, no
   new exit code, no short-circuit (other checks still report).
   **Ahead-drift** (config newer than a pinned older skill) **stays `error`
   (exit 2)**: a genuine can't-resolve exception. Consequence: today's
   `config.valid` "must be 1" reject **splits** — known-older → not-ready
   via the new check; newer or malformed → error.
6. **#54 — ephemeral advisory decision-log; no new tooling.** The durable
   waiver is the `preference` flag itself. On a sub-target panel in
   `preference` mode, `resolve-panel` **prints the shortfall** (target
   `minVendor`/`minModel` vs the panel actually formed) **to stderr and
   proceeds**; the **orchestrator is taught** (SKILL.md instruction) to carry
   that shortfall into the PR (adjudication writeup / PR comment). Nothing is
   committed as a standalone log; no automated `gh` posting (panels also run
   pre-PR at Plan/Spec, and automation is asymmetrical to an all-advisory
   path). *(Panel-adjudicated translation of #54's informal "stdout": the
   advisory channel is **stderr**, because FS5 reserves stdout for machine
   output — `--emit-tasks` JSON and the plain panel list must stay
   parseable.)*

## Composition principle: the toggle vs the shipped OL-A vocabulary (binding)

OL-A (v0.8.0) shipped `lifecycle.gates.*.mode` (`panel|advisory|human|off`)
and a model-identity floor (`minPanel`), deliberately dropping vendor from the
lifecycle vocabulary. This plan does not reopen that. The reconciliation is:

1. **The `strict | preference` toggle is subordinate to per-gate `mode`.** It
   applies only where a panel actually forms (`mode: panel`, and the panel an
   `advisory` gate runs), and it governs exactly one thing: **whether a
   diversity-floor shortfall at panel resolution is fatal (`strict`) or
   advisory (`preference`)**. It never changes a gate's mode, never makes a
   blocking gate non-blocking, and never touches the merge gate (which has no
   key, per OL-A's kernel rule).
2. **The two diversity axes are exclusive, never additive.** When a
   `lifecycle` block is present, the model axis (`minPanel`, distinct-model
   identity) is the **sole** diversity floor — `minVendor` is not applicable
   and the schema treats it as such (exact expression is Spec-level).
   `minVendor` exists **only** as the folded legacy axis for adopters without
   a `lifecycle` block (the v1 two-distinct-vendors rule carried through the
   fold). OL-A's vendor-drop stands unchanged *inside* the lifecycle
   vocabulary; after OL-B applies a profile to a formerly vendor-axis repo,
   the lifecycle block's model axis takes over and the legacy axis retires.
3. **The fold maps blocking → `enforcement: strict` on the adopter's existing
   axis** (decision 4), so no adopter's effective panel changes at migration.

## What this delivers (scope in)

1. **The merged schema (v2)**: one `.pi/sdlc/sdlc.config.json` carrying the
   union of today's config fields and the models-roster fields (types
   preserved), a top-level integer `schemaVersion: 2`, the
   `strict | preference` enforcement toggle, and the two diversity axes per
   the composition principle. Exact field layout/naming is Spec-level
   translation (per #51's residual items), bounded by: no consumer-owned data
   loss, types preserved, and the OL-A `lifecycle` block carried through
   unchanged in semantics.
2. **The migration engine**: detect-on-load in the shared config loader —
   on reading a `schemaVersion` older than current, interactive contexts
   prompt ("migrate now?"), apply the fold on confirmation, halt-with-remedy
   on decline; non-interactive contexts halt-with-remedy immediately.
   Unmappable input → precise report, zero writes. Forwards-only: no
   downgrade path ships. **The fold carries a recovery contract** (ordinary
   file operations cannot make a two-file transition atomic, so the guarantee
   is recoverability, not transactionality): the merged file is staged and
   durably written before the models file is removed, and the observable
   post-recovery state after a failure at any filesystem boundary (write,
   rename, unlink, permissions, interruption) is either the **complete
   original v1 pair** or the **complete v2 state**. The one intermediate
   state ordinary file ops permit — a valid v2 config beside a leftover
   models file — is defined as **cleanup-safe residue**: loaders treat the
   v2 config as authoritative, and the next migration-entrypoint run detects
   and removes the residue. Never any other half-migrated state.
   **Ownership is bound**: the shared loader is **detection-only** — it never
   prompts and never writes; confirmation and all file mutation live
   exclusively in the designated entrypoint (scope 3); every other consumer
   halts with the remedy even on a TTY.
3. **The designated interactive entrypoint**: `setup-sdlc` is the interactive
   migration surface (re-run on a v1 repo detects the pending fold and offers
   it; exact flag/interview shape is Spec-level). To do that it reads the old
   config via a **raw-read path that bypasses the shared loader's version
   guard** (scoped to the migration entrypoint only — no other consumer gets
   the bypass), avoiding the circular dependency where the migration tool is
   blocked by the guard it exists to satisfy. The SKILL.md startup flow
   is amended so that from FS8 `not-ready` with `config.schema-current`
   failing, running the migration entrypoint is explicitly permitted — the
   one sanctioned action from that state besides pinning. **Fresh adopters**:
   setup writes `enforcement: preference` **by default** (the #52-ratified
   posture — never block by default; the user may opt into `strict` through
   the interview).
4. **The inaugural 1→2 fold** implementing decision 4: consume
   `sdlc.config.json` (v1) + `sdlc.models.json`, emit the merged v2 file,
   delete the models file (atomically, per scope 2), preserve blocking as
   `enforcement: strict` on the adopter's axis. Dogfood: this repo's own two
   files are folded as part of the change. (The fold deliberately does NOT
   cure the repo's recorded vendor-resolver dogfood drift — zero effective-
   panel change preserves the vendor axis by design; adopting the lifecycle
   model axis here is separate hygiene, out of scope per map #49.)
5. **FS8 v2** implementing decision 5: the `config.schema-current` check,
   the `config.valid` split (known-older → hand-off to the new check;
   newer/malformed → error), remedy strings carrying the #52 message shape,
   and whatever envelope bump the v2 contract needs (the report's own
   `schemaVersion` field is currently 1). **Disposition of the three models
   checks** (`models.head`, `models.clean`, `models.valid`, which today
   hardcode the separate models file): for a `schemaVersion >= 2` config,
   models-data validity folds into `config.valid`, and the head/clean
   concerns are already covered by `adoption.manifest-*` on the merged file
   — so the three checks stop demanding a file that correctly no longer
   exists. Whether they report pass-with-note or leave the v2 check set is a
   Spec/ADR-0016-revision detail; the disposition itself is bound here (a
   migrated repo must be able to reach `ready`).
6. **`check-lifecycle` compatibility**: its own `config.valid` check (via the
   shared `inspectConfig`) accepts `schemaVersion: 2`; it does **not** own
   drift detection (that is FS8's job) — a v2 config passes, a v1 config
   under a v2 skill fails with the same remedy text, never a bare reject.
7. **`resolve-panel` posture change (FS5 reopen)** implementing decisions
   2/3/6: under `strict`, current behaviour (hard-fail below floor, exit 1);
   under `preference`, form the best panel available, print the shortfall
   advisory **to stderr**, emit the normal machine output on stdout, **exit
   0**. Author-exclusion becomes advisory under `preference` (the author's
   model may appear, flagged in the stderr advisory). The frozen
   `--models-file` flag is **retired with an explicit deprecation error**
   naming the merged config (a breaking change riding the same major).
   `--emit-tasks` JSON and the plain stdout panel list stay byte-parseable in
   both modes.
8. **`setup-sdlc` merged-file surface (FS10 reopen, scoped)**: setup writes
   the one merged v2 file; `--with-models` and the separate models asset are
   retired on the same major (explicit deprecation error, not silence). This
   is an FS10 bump **scoped to the file surface**, and it is versioned: the
   setup report envelope moves to **FS10 `schemaVersion: 2`** (it is 1
   today), pinned by text/JSON golden tests. OL-B's planned FS10
   *report-nudge* bump is a separate, composing revision — the two are
   sequenced (this one first), not colliding.
9. **SKILL.md orchestrator instruction** implementing decision 6: on a
   sub-target panel, carry the printed shortfall into the phase's writeup
   and, at the PR phase, into the PR itself (comment or adjudication note).
10. **Release-channel guard**: a CI check that fails when the config schema
    shape (the `schemaVersion` constant or the schema files) changes without
    a breaking-change signal (`!`/`BREAKING CHANGE`) on the
    **release-visible subject** — merge-mode-aware: under this repo's squash
    workflow that is the squash/PR title (the commit semantic-release
    actually reads, per ADR 0012), never merely an inner branch commit —
    making "a shape break rides a major" mechanically enforced, not
    process-hoped (see Release-channel discipline).
11. **The ADR set** (see ledger below) — written as part of this change, not
    after.

## Release-channel discipline (binding)

The schema-shape break (1→2) ships as a **package major release** of pi-sdlc.
Consumers pinned to a pre-major ref are untouched; unpinned consumers fail
loud (FS8 not-ready / loader halt) with a remedy, never silent-auto-mutate.
This overlays, and does not bind, the independent `schemaVersion` integer
(#50): the two clocks stay separate; policy requires a shape break to ride a
major, and scope item 10's CI guard enforces that policy mechanically (a
schema-shape diff without a breaking-change commit signal fails CI, so an
ordinary `feat:` cannot silently ship the break as a minor).

## ADR ledger (write at Implement, content fixed here)

1. **Merge ADR** — supersedes the two-surface split in ADR 0001 (FS1) and
   ADR 0002 (FS2): one merged schema, shape+types only, independent integer
   `schemaVersion`, value-changes-never-bump. Carries the release-channel
   discipline (schema break ⇒ package major, CI-guarded) as an ADR 0012
   addendum or inline section.
2. **Posture ADR** — the #51/#52 trust-model decision: a governance skill
   whose panel-diversity and author-exclusion floors are **user-owned**
   (`strict | preference` toggle over the exclusive axes), with the
   maintainers never wielding the floor. Must record the **toggle**, not an
   absolute never-block. Also records the ephemeral decision-log posture
   (#54) and the composition principle with OL-A's gate modes.
3. **FS8 v2 ADR revision** — amends ADR 0016 (status-surface) and touches
   ADR 0015 (adoption-readiness policy): the reopened contract, the
   `config.schema-current` check, the asymmetric behind/ahead exit mapping.
4. **FS5 revision** — amends ADR 0005 (script CLIs): the `preference`-mode
   exit-0 carve-out (strict keeps `0/1/2` exactly), the stderr advisory
   channel, and the retirement of `--models-file`.
5. **FS10 file-surface revision** — amends ADR 0018 (adoption bundle): setup
   writes the merged file; `--with-models`/models asset retired; explicitly
   sequenced before (and composing with) OL-B's planned report-nudge bump.

## Scope out (explicitly not this change)

- **OL-B content**: checker/evidence surface, FS9 v2, the FS10 *report-nudge*
  bump, profile application UX to existing adopters. OL-B consumes this
  contract; it is not delivered here.
- **The `prompt` enforcement mode** (out of scope at #52).
- **Any backward/downgrade migration** (forwards-only; pin to stay).
- **Auto-migrate in CI** (rejected at #52 as unsafe).
- **A durable/committed decision-log artifact** (rejected at #54).
- **FS9 declaration grammar and the lifecycle checker's semantics** —
  untouched (scope item 6 is a compatibility fix to its config parse, not a
  checker-semantics change).
- **This repo's vendor→model axis hygiene** (adopting a `lifecycle` block
  here) — separate hygiene item per map #49, deliberately not folded in.
- **The #55 map-mechanics review** (orthogonal process change, own issue).
- **Roster value governance** (which models are preferred, id drift) — data,
  not schema; explicitly never a version event (#50).

## Definition of done (falsifiable)

1. **Merged schema round-trips**: a v2 `sdlc.config.json` containing the
   field union validates; every verified consumer of either old file —
   `lib.mjs` loaders, `resolve-panel`, `ensure-panel-agent`, `setup-sdlc`,
   `check-lifecycle`, `sdlc-status` — reads the merged file and behaves
   semantically identically for an equivalent configuration.
   (`validate-task` and `check-references` consume neither old file and are
   untouched.)
2. **The inaugural fold is exact, across both branches**: a fixture matrix
   covering (a) a lifecycle-absent v1 pair and (b) a lifecycle-present v1
   pair shows the fold produces the merged v2 file, preserves every
   consumer-owned field (paths, tracker, hooks, lifecycle), maps blocking to
   `enforcement: strict` on the correct axis per branch, and produces
   **zero effective-panel change** (same resolved panel for the same
   credentials before and after, across the review phases and
   author-exclusion cases) — asserted by test, not prose.
3. **Refusal honesty**: a malformed or unmappable v1 input causes a precise
   "could not map X" report and **no file writes** (asserted: directory
   bytes untouched on failure).
4. **Fold recovery contract**: fault-injection tests at each filesystem
   mutation boundary (staged write, rename, models-file unlink) show the
   observable post-recovery state is either the complete original v1 pair
   or the complete v2 state; the one permitted residue (valid v2 config +
   leftover models file) is proven cleanup-safe — loaders read the v2
   config authoritatively and the next migration-entrypoint run removes the
   residue. No other intermediate state is reachable.
5. **Interactive migration end-to-end**: on a v1 repo with a TTY, the
   designated entrypoint offers the fold; **accept** produces the exact
   fixture-matrix result; **decline** halts with the remedy naming both
   options (migrate / pin); **non-TTY** halts identically with no prompt. No
   flag exists that auto-migrates unattended. **Every other consumer**
   (resolver, checker, status) halts with the remedy on a v1 config even on
   a TTY — asserted: none of them prompts or writes.
   **Fresh adoption posture**: a fresh `setup-sdlc` run writes
   `enforcement: preference` unless the human explicitly selects `strict` —
   asserted by a setup fixture in both paths.
6. **FS8 v2 drift detection**: on a repo whose config is `schemaVersion 1`
   under a v2 skill, `sdlc-status` reports `config.schema-current: fail`,
   state `not-ready`, **exit 3**, with the remedy message, and the other
   checks still report. On a config stamped `schemaVersion 3` (the future),
   it reports state `error`, **exit 2**. On a **migrated v2 repo with no
   models file**, `sdlc-status` reaches `ready` (exit 0) — the three models
   checks no longer demand the retired file. All asserted by fixture tests.
7. **FS10 v2 setup surface**: the setup report envelope carries
   `schemaVersion: 2`, pinned by text and JSON golden tests; `--with-models`
   errors with the deprecation message (asserted by test, mirroring the
   `--models-file` FS5 case).
8. **Preference-mode resolver (FS5)**: with `enforcement: preference` and
   credentials that cannot meet the configured floor, `resolve-panel`
   exits 0, emits byte-parseable machine output on stdout (`--emit-tasks`
   JSON and plain list), and prints a shortfall advisory to stderr naming
   target vs achieved. With `enforcement: strict`, same input exits 1 as
   today. Author-exclusion under `preference` demotes to advisory (the
   author's model may appear, flagged on stderr). `--models-file` errors
   with the deprecation message. Asserted by tests across both modes.
9. **No stale binding breaks — enumerated**: `.github/workflows/ci.yml`;
   the SKILL.md panel-invocation prose and startup (exit-3) flow;
   `skills/sdlc/assets/normative-references.json` (the `sdlc.models.json`
   and models-schema targets removed/re-pointed); the JSON schema files
   under `skills/sdlc/schema/`; every `skills/sdlc/scripts/*` reader. Each
   updated and green; a grep for `sdlc.models.json` across the tree returns
   only historical docs (plans/specs/reviews/ADRs).
10. **Release-channel guard**: the CI check from scope 10 exists and a test
    (or dry-run fixture) shows a schema-shape diff whose release-visible
    subject (squash/PR title) lacks a breaking-change signal failing it —
    including the case where an inner branch commit carries `feat!` but the
    squash title does not.
11. **Dogfood**: this repo's own tree carries exactly one merged v2 config
    (no `sdlc.models.json`), its committed panel floors reproduce the current
    effective panels, and the repo's own CI is green under the new surfaces.
12. **ADRs shipped**: the five ledger items exist in `docs/adr/`,
    cross-referenced from the superseded/amended ADRs.

## Risks

- **OL-A reconciliation execution risk.** The composition principle is now
  binding at plan level, but the Spec still has to express "axis
  exclusivity" in schema + validator without breaking OL-A adopters — the
  fold's zero-effective-panel-change guarantee is the fixed point the Spec's
  scenarios must assert.
- **Consumer breakage at the major.** Unpinned consumers whose CI pulls the
  skill at HEAD will halt on the major until they migrate or pin. This is
  the designed honest outcome, but the remedy text and release notes carry
  the whole UX burden; both get explicit review at Spec.
- **Fold correctness for hand-edited configs.** Real adopter configs may
  carry unknown fields or hand edits. The unmappable→report+write-nothing
  rule covers the failure mode, but the mapping table must be exhaustive
  over both schemas' documented fields — the Spec enumerates it field by
  field.
- **FS8 v2 envelope churn.** Downstreams parsing the FS8 JSON report (CI
  annotations, adoption checks) must be enumerated and updated; the check-id
  addition is additive but the report `schemaVersion` bump is not.
- **Two FS10 bumps in flight.** This change bumps FS10's file surface; OL-B
  bumps its report surface. Sequencing is fixed (this first), but if OL-B
  work starts before this merges, ADR 0018's revision history must be
  reconciled once, not twice.

## Compatibility constraints (binding on Spec and Tasks)

- **Zero effective-panel change at the fold** — the non-negotiable fixed
  point (decision 4).
- **OL-B must be buildable on top**: the migration engine's interface
  (detect → prompt/halt → fold → report) is the seam OL-B's profile
  application consumes; don't specialise it to the 1→2 fold only.
- **FS8 exit-code vocabulary is closed**: 0/1/2/3 keep their meanings; drift
  maps onto existing states (#53), never a new exit.
- **FS5 machine stdout is sacred**: `--emit-tasks` JSON and the plain panel
  list stay byte-parseable in every mode; advisories live on stderr.
- **`schemaVersion` stays an independent integer** — no derivation from
  semver anywhere in code or docs (#50); the release-channel policy (shape
  break ⇒ major) is enforced by the scope-10 CI guard, not by code coupling.
- **Tracker is projection; docs are canonical** — unchanged.

## Context for the next agent (Spec phase)

- Authoritative inputs, in order: this plan (rev 3); the consolidated plan
  review (`docs/reviews/plan-review-config-versioning-migration-2026-07-16/`);
  the #50–#54 resolution comments (each carries its full adjudicated
  detail); map #49's body (Decisions so far + Exit); ADRs 0001, 0002, 0005,
  0012, 0015, 0016, 0018; the OL-A stream plan
  (`docs/plans/2026-07-14-opt-in-lifecycle.md`, rev 3) for the shipped
  `lifecycle` vocabulary the composition principle binds to.
- Spec-level decisions explicitly left open by the map and this plan: the
  merged file's exact field layout and any renames (union rule bounds it;
  the name/home `.pi/sdlc/sdlc.config.json` is binding, per #52); the exact
  remedy/shortfall strings; the FS8 v2 report-envelope details and the
  pass-with-note vs drop expression of the models-check disposition (the
  disposition itself is bound in scope 5); the schema expression of axis
  exclusivity (composition principle item 2); the migration entrypoint's
  exact flag/interview shape on `setup-sdlc`. (Loader ownership is no longer
  open: detection-only in the shared loader, prompts/writes exclusively in
  `setup-sdlc` — the Spec chooses only the plumbing.)
- Scenario-id convention for the spec: `CV<n>` (config-versioning),
  falsifiable, stable ids.
