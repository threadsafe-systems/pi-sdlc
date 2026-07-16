# Spec: config versioning & migration contract for consumer surfaces

- Date: 2026-07-16 (rev 1 — pre-panel draft)
- Slug: `config-versioning-migration`
- Track: **irreversible** (merges FS1 + FS2 into one committed schema v2,
  reopens FS8 → v2, reopens the FS5 `resolve-panel` CLI contract, reopens the
  FS10 setup surface for the merged file)
- Upstream (authoritative, in order): plan rev 3
  (`docs/plans/2026-07-16-config-versioning-migration.md`); the consolidated
  plan review (`docs/reviews/plan-review-config-versioning-migration-2026-07-16/`);
  map [#49](https://github.com/threadsafe-systems/pi-sdlc/issues/49) ticket
  resolutions #50–#54; ADRs 0001, 0002, 0005, 0012, 0015, 0016, 0018; the
  OL-A spec (`docs/specs/2026-07-14-opt-in-lifecycle-config.md`, rev 3) for
  the shipped `lifecycle` vocabulary, which this spec binds to and does not
  reopen.
- Scenario ids: `CV<n>`, stable, falsifiable.

This spec translates the plan; it does not relitigate the map decisions. Where
the plan left a Spec-level choice open, the choice is made here and marked
**[spec decision]** with its rationale.

## 1. Surface area

Files changed (under `skills/sdlc/` unless noted):

| Surface | File | Nature |
|---|---|---|
| Merged schema (v2) | `schema/sdlc.config.schema.json` | breaking: `schemaVersion` const 1→2; new `panels` key (roster + enforcement); example updated |
| Retired schema | `schema/sdlc.models.schema.json`, `schema/sdlc.models.example.json` | **deleted** (roster examples fold into `sdlc.config.example.json`) |
| Shared loader | `scripts/lib.mjs` | version seam (`classifyConfigVersion`), v2 `inspectConfig`, detection-only guard in `readConfig`, `readModels` retired, migration raw-read export |
| Migration engine | `scripts/migrate.mjs` (**new**) | pure fold planner + staged-write applier (setup-only IO) |
| Migration entrypoint | `scripts/setup-sdlc.mjs` (+ `.sh`) | migration mode (detect/prompt/fold), merged-file write, `--with-models` retired, `--seed-panels` added, FS10 report `schemaVersion: 2` |
| Panel resolution | `scripts/resolve-panel.mjs` (+ `.sh`) | roster from merged config; `enforcement` toggle; stderr shortfall advisories; `--models-file` retired |
| Status | `scripts/sdlc-status.mjs` (+ `.sh`) | FS8 v2: `config.schema-current` + `config.panels` checks, three `models.*` checks retired, report `schemaVersion: 2` |
| Checker compat | `scripts/check-lifecycle.mjs` | `config.valid` accepts v2; v1 → error with the canonical remedy (never a bare reject); FS9 semantics otherwise untouched |
| Agent stamping | `scripts/ensure-panel-agent.mjs` | inherits the loader guard (halts with remedy on v1); no other change |
| CI guard | `scripts/check-schema-break.mjs` (**new**) + `.github/workflows/ci.yml` | release-channel guard: schema-shape diff requires a breaking-change signal on the release-visible subject |
| Skill prose | `SKILL.md` | startup exit-3 flow sanctions the migration entrypoint; panel prose names the merged file; orchestrator shortfall-carry instruction |
| Assets | `assets/normative-references.json` | `consumer.models` / `schema.models` entries removed or re-pointed to the merged file |
| Dogfood | `.pi/sdlc/sdlc.config.json`, `.pi/sdlc/sdlc.models.json` | this repo's own pair folded (models file deleted) |
| Tests | `test/` | fold fixture matrix, fault injection, FS8 v2, resolver modes, FS10 goldens; v1 config/models fixtures re-homed as migration-input fixtures |
| ADRs | `docs/adr/` | the five ledger items (plan "ADR ledger") |

Explicitly untouched: `validate-task.mjs`, `verify-task-receipt.mjs`,
`check-references.mjs` (their manifest/inventory schemas are independent —
plan rationale); the FS9 declaration grammar, checker semantics, and its
report envelope (`schemaVersion: 1` stays — only its config parse gains the
version split); prompts; `assets/agent-brief.md`; `assets/tracker-ops.md`;
the OL-A `lifecycle` vocabulary (carried verbatim, semantics unchanged).

## 2. The merged v2 schema — normative

One file: `.pi/sdlc/sdlc.config.json` (name and home binding, per #52).
`schemaVersion` is an **integer on its own clock** (#50): shape + data types
only; roster/value churn never bumps it. Version 2 *is* the single-file shape.

```jsonc
{
  "schemaVersion": 2,                       // required; integer const 2
  "prefix": "...",                          // unchanged FS1 (required)
  "labelPrefix": "...",                     // unchanged FS1 (required)
  "announce": "...",                        // unchanged FS1 (required)
  "paths":   { ... },                       // unchanged FS1 (optional)
  "tracker": { ... },                       // unchanged FS1 (optional)
  "hooks":   { ... },                       // unchanged FS1 (optional)
  "lifecycle": { ... },                     // unchanged OL-A vocabulary (optional)

  "enforcement": "strict" | "preference",   // optional; DEFAULT "preference" —
                                            // top level so a roster-less fresh
                                            // config can still record it
  "panels": {                               // optional (see presence rule) — the folded FS2
    "$comment": "...",                      // optional, string (carried from the models file)
    "authorDefault": "provider/model",      // optional; was FS2 author_default
    "rules": {                              // optional
      "excludeAuthorVendor": true | false   // optional; was FS2 rules.exclude_author_vendor;
                                            // read ONLY on the vendor axis (as OL-A shipped)
    },
    "phases": {                             // required within panels; exactly the four phases
      "plan_review":   { "minVendor": 2, "prefer": ["p/m", ...] },
      "spec_review":   { ... },
      "pr_review":     { ... },
      "task_validate": { ... }
    }
  }
}
```

Structural rules (all closed vocabularies, `inspectConfig` ordered-collector
style, as OL-A):

- `schemaVersion` must be the integer `2` for a structurally valid v2 config;
  other values route through the version seam (§3.1), never through a generic
  "unknown key"-style issue.
- `panels` is **optional** at the schema level. **[spec decision]** Presence
  is a *readiness* concern, not a *validity* concern — this preserves v1
  semantics exactly: a v1 repo without a models file was structurally adopted
  but `not-ready` (FS8 `models.head` fail, exit 3), never `error`. FS8 v2
  keeps that parity via the new `config.panels` check (§6.2). A schema-level
  `required` would have promoted "no roster yet" from exit 3 to exit 2, a
  semantic change the plan does not authorise.
- Within `panels`: unknown keys rejected per-path; `phases` required with
  exactly the four phase keys (`plan_review`, `spec_review`, `pr_review`,
  `task_validate`), mirroring FS2; each phase: `prefer` required, non-empty
  array of `provider/model` strings (the thinking-suffix documentation from
  the FS2 schema carries over verbatim — shape-only validation, no
  colon-suffix enum); `minVendor` optional, integer ≥ 1, **default 1**.
- `enforcement` is **top-level** **[spec decision]**: it governs resolution
  posture, not roster data, and a fresh roster-less config (no `panels` yet)
  must still be able to record it explicitly (DoD 5). Enum exactly
  `{"strict","preference"}`; **default `preference`** when absent
  (#52-ratified never-block-by-default posture). The fold and fresh setup
  both always write it explicitly (§4, §5), so the default governs only
  hand-authored configs.
- `authorDefault` shape rule identical to FS2 `author_default`
  (`^[^/]+/.+$`).
- **Axis coexistence [spec decision — composition principle item 2's
  "schema treats it as such"]:** `panels.phases.<p>.minVendor` remains
  *schema-valid* alongside a `lifecycle` block, but is **runtime-superseded**
  on the model axis with the existing OL-A notice form (§5.2). Rationale: the
  plan's "no consumer-owned data loss" bound forbids the fold from dropping a
  lifecycle-present adopter's committed `min_panel` values, and OL-A already
  shipped exactly this supersede-with-notice semantics; hard schema
  exclusivity would force either data loss or an unmappable fold. The two
  axes stay exclusive *in effect*: when `lifecycle` is present the
  distinct-model floor (`lifecycle.gates.<p>.minPanel`) is the sole floor;
  without it, `minVendor` governs. Never additive.
- The OL-A `lifecycle` vocabulary, cross-field rules, and panellist-identity
  rule are untouched and are not restated here (OL-A spec §2 remains
  normative for them).

### 2.1 Version-classification vocabulary (normative)

`lib.mjs` exports:

```js
export const CONFIG_SCHEMA_VERSION = 2;
export const KNOWN_PAST_VERSIONS = new Set([1]);
export function classifyConfigVersion(raw)
// → { kind: "current" }                    schemaVersion === 2
// → { kind: "older",   version: 1 }        schemaVersion ∈ KNOWN_PAST_VERSIONS
// → { kind: "newer",   version: n }        integer schemaVersion > 2
// → { kind: "invalid" }                    non-object raw, missing/non-integer/
//                                          non-positive schemaVersion, or an
//                                          integer < 1 or an unrecognised past
//                                          integer (there is none besides 1)
```

Pure, total, throw-free. Every version-sensitive consumer (loader, FS8,
checker, resolver, setup) branches on this classification — no consumer
re-implements version comparison.

### 2.2 Canonical remedy strings (normative, exact)

Exported constants in `lib.mjs`; every surface uses these verbatim (the plan
puts the whole cross-major UX burden on these strings):

- **Behind (older) remedy** — `REMEDY_SCHEMA_OLDER(found)`:

  ```
  config schemaVersion <found> predates this skill (requires 2) — run the setup-sdlc migration interactively to fold it forward, or pin pi-sdlc to a release before the schema-2 major
  ```

- **Ahead (newer) message** — `REMEDY_SCHEMA_NEWER(found)`:

  ```
  config schemaVersion <found> is newer than this skill (requires 2) — upgrade pi-sdlc, or run the pinned pi-sdlc release that wrote this config
  ```

Surfaces prefix these with their own diagnostic conventions (`sdlc: …`,
check messages, report remediation fields) but never rewrite the body text.

## 3. The migration contract

### 3.1 Shared loader: detection-only (binding)

`readConfig(root, …)` gains the version guard, and **only** detection:

- Missing manifest: unchanged v1 behaviour (defaults, or the opt-in gate
  under `requireManifest`).
- Parse failure: unchanged (`sdlc: cannot parse …`).
- `classifyConfigVersion` = `older`: **halt** — `fail()` with
  `sdlc: ${REMEDY_SCHEMA_OLDER(found)}`, exit 2. Never prompts (even on a
  TTY), never writes. This is the "every other consumer halts with the
  remedy" rule: `ensure-panel-agent`, and any future `readConfig` caller,
  inherit it with no per-consumer code.
- `newer` or `invalid`: **halt** with `sdlc: ${REMEDY_SCHEMA_NEWER(found)}`
  (newer) or the existing invalid-manifest diagnostic (invalid).
- `current`: full v2 validation via `inspectConfig`, then the parsed config
  (now including `panels` when present) is returned.

`readModels` is **deleted** from `lib.mjs`. No v2 code path reads
`.pi/sdlc/sdlc.models.json` — which is precisely what makes the fold residue
(§3.4) cleanup-safe by construction.

**Raw-read bypass (scoped):** `lib.mjs` exports
`readConfigRawForMigration(root)` → `{ config: <parsed-or-null>,
models: <parsed-or-null>, configText, modelsText }`, reading both v1 files
with **no version guard and no validation**. Greppable containment rule
(CONTRIBUTORS-class, asserted by test): the only importer of
`readConfigRawForMigration` outside `test/` is `setup-sdlc.mjs`/`migrate.mjs`
— no other consumer gets the bypass.

### 3.2 The migration engine (`migrate.mjs`) — OL-B's seam

Two functions, strictly separated:

- **`planMigration({ config, models })` — pure, no IO.** Input: the raw
  parsed v1 pair. Output:
  - `{ ok: true, from: 1, to: 2, config: <v2 object>, notes: [string] }`, or
  - `{ ok: false, unmappable: [{ path, message }] }` — every path that could
    not be mapped, exhaustively (not first-failure).

  Internally the engine is a **registry of forward steps keyed by source
  version** (`{ 1: foldV1toV2 }`), composed in ascending order until
  `CONFIG_SCHEMA_VERSION` — the detect → plan → confirm → apply → report
  interface OL-B's profile application plugs into (a new step or a
  same-version transform), never a 1→2 special case.

- **`applyMigration(root, plan)` — the only writer**, called exclusively by
  `setup-sdlc` after interactive confirmation (§4). Write ordering is the
  recovery contract (§3.4).

Forwards-only: no downgrade function exists anywhere.

### 3.3 The inaugural 1→2 fold — exhaustive mapping table (normative)

Input: v1 `sdlc.config.json` (FS1) + v1 `sdlc.models.json` (FS2). Both
documents' vocabularies are closed, so this table is total; any key outside
it is **unmappable** (report + write nothing).

| v1 source | v2 destination | Rule |
|---|---|---|
| config `schemaVersion: 1` | `schemaVersion: 2` | rewritten |
| config `prefix`, `labelPrefix`, `announce`, `paths`, `tracker`, `hooks`, `lifecycle` | same keys, top level | carried **verbatim** (deep-equal) |
| config: any other key | — | unmappable |
| models `$comment` | `panels.$comment` | verbatim |
| models `author_default` | `panels.authorDefault` | verbatim value |
| models `rules.exclude_author_vendor` | `panels.rules.excludeAuthorVendor` | verbatim value; `rules` omitted when absent |
| models `phases.<p>.min_panel` | `panels.phases.<p>.minVendor` | verbatim value (rename is honest: v1's vendor-deduped `min_panel` *was* a distinct-vendor floor) |
| models `phases.<p>.prefer` | `panels.phases.<p>.prefer` | verbatim array |
| models: any other key | — | unmappable |
| — (synthesised) | top-level `enforcement: "strict"` | **always** (even when the models file is absent); preserves today's blocking behaviour on the adopter's existing axis (decision 4) |
| absent models file | `panels` absent | a roster-less v1 repo folds to a roster-less v2 config (readiness parity via `config.panels`, §6.2) |

Axis note: the fold itself is axis-agnostic — the adopter's axis is selected
at *resolution* time by the presence of `lifecycle` (composition principle),
so "maps blocking to `enforcement: strict` on the adopter's existing axis"
falls out of the one `enforcement` write. **Zero effective-panel change** is
the fixed point: for any v1 pair and any credential set, the resolved panel
(members, order, thinking suffixes, exit code) before and after the fold is
identical in `strict` mode (CV8).

Malformed input (either file unparseable, or `planMigration` returns
`ok: false`): setup reports every unmappable path
(`cannot map <path>: <message>`) and **writes nothing** — asserted as
directory-bytes-untouched (CV9).

### 3.4 Recovery contract (fold write ordering)

Ordinary file operations cannot make a two-file transition atomic; the
guarantee is **recoverability**:

1. Write the merged v2 document to a staging file in the same directory
   (`.pi/sdlc/.sdlc.config.json.migrate-tmp`), flush/fsync.
2. Atomically `rename` the staging file over `.pi/sdlc/sdlc.config.json`.
3. `unlink` `.pi/sdlc/sdlc.models.json`.

Post-recovery observable states at every failure boundary:

| Failure at | Observable state | Class |
|---|---|---|
| step 1 (write/fsync/permissions) | complete original v1 pair (+ ignorable tmp file, removed on next entrypoint run) | original |
| step 2 (rename) | complete original v1 pair (+ tmp) | original |
| step 3 (unlink) or interruption between 2 and 3 | valid v2 config beside the leftover models file | **cleanup-safe residue** |

No other intermediate state is reachable (the config file is only ever
replaced whole, via rename). Residue is cleanup-safe **by construction**: no
v2 code path reads the models file (§3.1), so the v2 config is authoritative
the instant the rename lands; the next migration-entrypoint run detects the
residue and offers its removal (§4.3). Fault-injection tests cover each
boundary (CV10).

## 4. `setup-sdlc` — the designated interactive entrypoint (FS10 reopen, scoped)

### 4.1 Migration mode

On any invocation whose resolved root carries a config classified `older`,
setup enters **migration mode before all other behaviour**:

- **TTY:** print what will happen (both file paths, the target version), then
  prompt: `migrate .pi/sdlc/sdlc.config.json to schemaVersion 2 now? (y/N)`.
  - **Accept:** `planMigration` → on `ok`, `applyMigration` (§3.4); report
    (FS10 v2, §4.4) with `config: migrated` and `models: removed` actions;
    exit 0. On unmappable: report every path, write nothing, exit 1.
  - **Decline (or empty answer):** halt, exit 1, stderr carrying
    `REMEDY_SCHEMA_OLDER` (both options: migrate / pin). No writes.
- **Non-TTY:** identical halt, exit 1, same remedy, **no prompt**.
- **`--yes` does NOT confirm migration.** The confirmation is answerable only
  by a live TTY reply — this *is* the "no flag auto-migrates unattended"
  rule (DoD 5), mechanically. There is no `--migrate-yes`, no env override.
- **No flag mixing:** migration mode combined with any config-mutating flag
  (`--profile`, `--prefix`, `--label-prefix`, `--announce`, tracker flags,
  hook flags, `--seed-panels`, `--force`) is refused — exit 1,
  `setup-sdlc: migrate first — re-run with no config flags to fold the v1 config, then apply changes` —
  one mutation class per run, so the fold is never entangled with a
  simultaneous reconfiguration. (`--config`/`--repo-root`/`--format` remain
  legal in migration mode.)

A config classified `newer` refuses with `REMEDY_SCHEMA_NEWER` (exit 1);
`invalid` follows the existing refused-invalid-existing-config path.

### 4.2 Residue cleanup

When the root carries a **current** (v2) config *and*
`.pi/sdlc/sdlc.models.json` exists (or a leftover staging tmp file): on a
TTY, offer removal
(`remove leftover .pi/sdlc/sdlc.models.json (folded into sdlc.config.json)? (y/N)`);
accept → unlink + report `models: removed`; decline or non-TTY → report a
non-fatal note (`models: retained` with remediation naming the residue), no
write, and the run otherwise proceeds normally. **[spec decision]** The
prompt (rather than unconditional deletion) keeps every mutation in this
change behind an interactive confirmation; the plan's "detects and removes"
is satisfied on the accept path, and the residue is harmless meanwhile by
§3.1.

### 4.3 Fresh adoption and the retired flags

- Fresh setup (no existing config) writes the **one merged v2 file**:
  `schemaVersion: 2`, and top-level `enforcement` **explicitly** —
  `"preference"` unless the human selects otherwise. The interview gains one
  question (after the profile step):
  `panel enforcement — preference: proceed best-effort and surface shortfalls; strict: hard-fail below the configured floors (preference/strict) [preference]`.
  Non-interactive: new flag `--enforcement <strict|preference>`, default
  `preference` when omitted. (`--profile <p> --yes` therefore writes
  `enforcement: "preference"` unless `--enforcement strict` is passed —
  CV15.)
- **`--with-models` is retired**: exit 2 (usage), message
  `setup-sdlc: --with-models is retired — the panel roster now lives in .pi/sdlc/sdlc.config.json (schemaVersion 2); use --seed-panels`.
- **`--seed-panels` (new)** replaces the seeding use-case: embeds the
  packaged example roster (now living inside
  `schema/sdlc.config.example.json`) as the written config's `panels` block.
  Interactive interview asks
  `seed the example panel roster (model ids drift; review after)? (y/N)`,
  default no — parity with the old opt-in `--with-models`. Without seeding,
  the written config omits `panels` (readiness then reports
  `config.panels` fail until a roster is committed — same UX as a v1 repo
  without a models file).
- The existing-config ladder (`retained`/`refused`/`--force upgraded`) and
  the OL-B deferral refusal for `--profile` on an existing config are
  unchanged **for v2 configs**.

### 4.4 FS10 report envelope v2

The setup report (text and JSON) moves to `schemaVersion: 2` (from 1),
pinned by goldens (CV16):

- JSON envelope: `{"schemaVersion": 2, "root", "exitCode", "error"?,
  "references", "assets"}` — structure otherwise unchanged.
- The `assets[].action` vocabulary grows `migrated` and `removed` (existing:
  `created`, `retained`, `refused`, `upgraded`).
- Error/catastrophic envelopes also carry `schemaVersion: 2`.

This is the FS10 file-surface bump, sequenced **before** OL-B's report-nudge
bump (which will compose on top as a further revision; ADR 0018 reconciled
once).

## 5. `resolve-panel` — posture change (FS5 reopen)

### 5.1 Input surface

- Roster source: `readConfig(root).panels`. The loader guard (§3.1) makes a
  v1 config halt with the remedy (exit 2 via `fail`) before any resolution.
- Missing manifest entirely: `sdlc: this project requires .pi/sdlc/sdlc.config.json with a panels roster to resolve a panel (the skill ships no built-in model roster)`
  — exit 2 (the FS2-required posture carried to the merged file).
- Manifest present (v2) but `panels` absent, or `panels.phases.<phase>`
  unusable: exit 1, `resolve-panel: no panels roster for <phase> in .pi/sdlc/sdlc.config.json — add a panels block (see schema/sdlc.config.example.json)`.
- **`--models-file` is retired**: exit 2 (usage), message
  `resolve-panel: --models-file is retired — the panel roster now lives in .pi/sdlc/sdlc.config.json (schemaVersion 2)`.
- All other flags (`--author`, `--pong`, `--track`, `--emit-tasks`,
  `--config`, `--repo-root`) unchanged.

### 5.2 Axis selection (unchanged) and floor sourcing

- `lifecycle` absent ⇒ **vendor axis**: shipped v1 semantics verbatim —
  vendor dedupe, floor = `panels.phases.<p>.minVendor` (default 1),
  author-vendor exclusion governed by `panels.rules.excludeAuthorVendor !==
  false && floor >= 2`. Diagnostics keep their v1 shapes.
- `lifecycle` present ⇒ **model axis**: OL-A semantics verbatim — distinct
  model identities, floor from `lifecycle.gates.<p>.minPanel` /
  `taskValidation`, author-model exclusion at `minPanel >= 2`, `--track`
  rules, gate-mode refusals via `decomposeGateMode`. The supersede notice is
  re-pointed at the merged layout:
  `note: minVendor=<m> in sdlc.config.json panels superseded by <source> (minPanel=<p>)`.
- Gate-mode refusals (`reviewer: "none"`, task validation `off`, per-track
  ambiguity) are **mode questions, not floor questions**: they stay exit 1
  in **both** enforcement modes (composition principle item 1 — the toggle
  never changes a gate's mode).

### 5.3 The `enforcement` toggle (normative)

Effective value: top-level `enforcement ?? "preference"`.

- **`strict`:** current behaviour exactly — shortfall below the effective
  floor exits 1 with the existing `FAILED to reach …` stderr; exits stay
  `0/1/2` with today's meanings (ADR 0005 carve-out applies only to
  `preference`).
- **`preference`:** form the best panel available and **exit 0**:
  1. Resolution proceeds exactly as in `strict` (same ordering, dedupe,
     exclusion) — but a floor shortfall does not fail.
  2. **Author readmission on shortfall only:** if the panel is below the
     floor after normal resolution, previously author-excluded candidates
     are readmitted in `prefer` order (still deduped on the axis identity)
     until the floor is met or candidates are exhausted. Each readmitted
     panellist is flagged (below). Author exclusion therefore still holds
     whenever the floor is reachable without the author.
  3. **Machine stdout is sacred:** the panel list / `--emit-tasks` JSON on
     stdout stays byte-parseable and format-identical in both modes; every
     advisory goes to **stderr** (#54 as panel-adjudicated).
  4. **Shortfall advisory (exact shape), on stderr, when the panel is below
     the floor:**

     ```
     advisory[<phase>]: enforcement is 'preference' — panel below target: <axis>=<target>, achieved=<achieved>; proceeding. Carry this shortfall into the phase writeup and the PR.
     ```

     where `<axis>` is `minVendor` (vendor axis) or `minPanel` (model axis).
  5. **Author-readmission advisory (exact shape), per readmitted model:**

     ```
     advisory[<phase>]: author model <identity> included — author exclusion demoted under 'preference'
     ```

     (vendor axis: `author vendor <vendor> included — …`.)
  6. **Empty panel is still failure [spec decision]:** zero credentialed
     panellists exits 1 in both modes
     (`resolve-panel: no credentialed models available for <phase>`). The
     toggle governs the *diversity floor*, not panel *existence* — an empty
     panel emitted with exit 0 would be a silent no-review, which the
     advisory posture ("surface gaps") forbids.

The existing informational stderr (`panel[<phase>]: …`, `dropped …` lines)
is retained in both modes.

## 6. `sdlc-status` — FS8 v2

### 6.1 Check set

```
cli.arguments, root.resolve, git.repository,
adoption.manifest-head, adoption.manifest-clean,
config.valid, config.schema-current, config.panels,
workflow.readable
```

`models.head`, `models.clean`, `models.valid` are **retired** (removed from
the check set — **[spec decision]** removal, not pass-with-note: a
perpetual pass-with-note for a file that correctly no longer exists would be
noise that never changes, and the report `schemaVersion` bump already
signals the vocabulary change to envelope consumers). Their concerns map:
presence → `config.panels`; cleanliness → `adoption.manifest-*` on the
merged file; validity → `config.valid`.

PREREQ additions: `config.schema-current` ← `config.valid`;
`config.panels` ← `config.schema-current`. SKIP_REASON:
`config.valid` → "manifest is not a valid recognised schema";
`config.schema-current` → "config schema is not current".

### 6.2 The version split (decision 5, asymmetric)

Within `config.valid` (prereq `adoption.manifest-clean`, as today), after
JSON parse and the regular-file guard:

| `classifyConfigVersion` | `config.valid` | `config.schema-current` | State/exit |
|---|---|---|---|
| `current` (2) | full v2 validation → pass / error as today | pass — `config schema is current (schemaVersion 2)` | per other checks |
| `older` (1) | **pass** — `manifest parses; schemaVersion 1 is a recognised superseded schema (full validation deferred to migration)` | **fail** — message `config schema is behind this skill (schemaVersion 1 < 2)`, remediation = `REMEDY_SCHEMA_OLDER(1)` | `not-ready`, **exit 3**; all other checks still evaluate and report |
| `newer` (n) | **error** — `REMEDY_SCHEMA_NEWER(n)` | skip | `error`, **exit 2** |
| `invalid` | error (today's invalid-manifest diagnostics, message now naming 2) | skip | `error`, exit 2 |

Behind-drift is deliberately a plain `fail` on an existing state: no fifth
state, no new exit code, no short-circuit (#53). Ahead-drift is a genuine
can't-resolve exception and stays `error`.

`config.panels` (prereq `config.schema-current` pass): pass when
`panels` is present in the valid v2 config
(`panels roster present`); fail when absent —
`no panels roster in the manifest`, remediation
`add a panels block to .pi/sdlc/sdlc.config.json (see schema/sdlc.config.example.json)`.
This preserves the v1 readiness meaning of the retired `models.head`
(roster-less = adopted-but-not-ready, exit 3). Models-file **residue** (v2
config + leftover `sdlc.models.json`) is *not* a check: it is defined
cleanup-safe (§3.4) and a residue-bearing repo can be `ready` (CV19 asserts
`ready` on a clean migrated repo; residue disappears at the next entrypoint
run).

### 6.3 Envelope

The FS8 report (text and JSON) moves to **`schemaVersion: 2`** (from 1),
including the catastrophic-failure envelope. Everything else about the
envelope (fields, ordering, text rendering) is unchanged. Exit vocabulary
closed and unchanged: 0 ready / 1 not-adopted / 2 error / 3 not-ready.

## 7. `check-lifecycle` — compatibility only

Its internal `config.valid` check routes through `classifyConfigVersion`:

- `current`: validate as today (v2 rules) — a valid v2 config passes.
- `older`: `config.valid` = **error**, message
  `manifest is superseded: ${REMEDY_SCHEMA_OLDER(1)}` — the same remedy
  text, never a bare "schemaVersion must be 2" reject. (Checker check
  statuses only have pass/fail/error/skip and `config.valid` failures are
  already `error`-class here; the FS8 not-ready nuance belongs to FS8, which
  owns drift detection — the checker merely refuses honestly.)
- `newer` / `invalid`: error with `REMEDY_SCHEMA_NEWER` / existing text.

No FS9 grammar, artifact, exemption, or envelope change; the checker's
report `schemaVersion` stays 1.

## 8. CI release-channel guard (`check-schema-break.mjs`)

A new read-only script + CI step making "a shape break rides a major"
mechanical (plan scope 10):

- **Watched shape surface:** `skills/sdlc/schema/*.schema.json` (any diff)
  and the `CONFIG_SCHEMA_VERSION` constant line in
  `skills/sdlc/scripts/lib.mjs`.
- **Signal source (merge-mode aware):** under this repo's squash workflow the
  release-visible subject is the **PR title** (the commit semantic-release
  reads, ADR 0012). The guard reads the PR title and body from
  `$GITHUB_EVENT_PATH`. Breaking signal = conventional-commit `!` in the
  title (`type(scope)!:` / `type!:`) **or** a `BREAKING CHANGE:` /
  `BREAKING-CHANGE:` line in the PR body. Inner branch commits are
  deliberately ignored — a `feat!` inner commit under a plain squash title
  must still fail (CV28).
- **Behaviour:** diff of watched paths between the PR base and head
  (`git diff --name-only <base>...<head>` plus the constant-line check); if
  non-empty and no breaking signal → exit 1 naming the changed shape files
  and the required signal; otherwise exit 0. No network, no deps.
- **Wiring:** a step in `.github/workflows/ci.yml` after checkout (needs
  `fetch-depth: 0` or an explicit base fetch), passing the event path.
- The script is testable offline via fixture event payloads and synthetic
  repos (CV28) — the CI step is thin.

## 9. Skill prose and asset bindings

- **SKILL.md startup flow (exit 3):** the not-ready instruction gains: when
  `config.schema-current` is the failing check, running the `setup-sdlc`
  migration interactively is the one sanctioned action besides pinning —
  the agent must not hand-edit `schemaVersion` or the config shape.
- **SKILL.md panel prose:** references to `sdlc.models.json` re-pointed at
  the merged config's `panels` block (resolve-panel description, adoption
  checklist line).
- **SKILL.md orchestrator instruction (decision 6):** in the panel section:
  when `resolve-panel` prints a `preference`-mode shortfall advisory, the
  orchestrator carries it into that phase's consolidated writeup, and at PR
  phase into the PR itself (comment or adjudication note). Nothing is
  committed as a standalone log.
- **`assets/normative-references.json`:** `consumer.models` (target
  `.pi/sdlc/sdlc.models.json`) and `schema.models` entries removed;
  a `consumer.panels`-style entry re-points at the merged file with a
  verification assertion against the v2 surface; `check-references` corpus
  stays green.
- **Tree hygiene:** after this change, `rg "sdlc.models.json"` over the repo
  returns matches only under `docs/` historical artifacts (plans, specs,
  reviews, ADRs) (CV29).

## 10. ADR set (content bound by the plan ledger)

Written at Implement as part of this change: (1) merge ADR superseding
0001/0002 + ADR 0012 release-channel addendum; (2) posture ADR
(`strict|preference`, user-owned floors, ephemeral decision-log, composition
principle); (3) ADR 0016 revision (FS8 v2) touching 0015; (4) ADR 0005
revision (FS5 preference carve-out, stderr advisory channel, `--models-file`
retirement); (5) ADR 0018 revision (FS10 file surface, `--with-models`
retirement, sequencing before OL-B). Cross-referenced from the superseded/
amended ADRs (CV32).

## 11. Non-functional requirements

- **NF-1 (offline determinism):** every changed script stays
  dependency-free, offline, deterministic; `planMigration` is pure (same
  input → same plan, byte-identical serialised output).
- **NF-2 (stdout sacred, FS5):** `resolve-panel` machine stdout
  (`--emit-tasks` JSON, plain list) is byte-parseable and format-identical
  across both enforcement modes; advisories never touch stdout. FS8/FS10
  JSON envelopes remain the only stdout of their scripts.
- **NF-3 (mutation containment):** the shared loader never prompts and never
  writes; all confirmation and file mutation live in `setup-sdlc`
  (+`migrate.mjs` under it); `sdlc-status` and `check-lifecycle` stay
  read-only. Asserted by the raw-read containment grep (§3.1) and CV5.
- **NF-4 (no version coupling):** no code derives `schemaVersion` from the
  package semver or vice versa; the release-channel policy is enforced only
  by the §8 CI guard.
- **NF-5 (strict-mode conservation):** under `enforcement: strict`, every
  changed script's exit codes keep today's meanings exactly
  (`resolve-panel` 0/1/2; FS8 0/1/2/3; setup 0/1/2).
- **NF-6 (closed vocabulary):** no code path interprets an unknown `panels`
  or version value permissively; classification/validation always precede
  use.

## 12. Verification scenarios (falsifiable; ids stable)

Fixture matrix used throughout: **pair-A** = lifecycle-absent v1 pair (this
repo's shapes: hooks, tracker, `$comment`, `author_default`,
`exclude_author_vendor: true`, four phases with `min_panel` 2/2/3/1);
**pair-B** = lifecycle-present v1 pair (OL-A `full` profile + the same
models file). Expected v2 outputs are committed fixture files compared
deep-equal.

**Schema & version seam:**

- **CV1** — a v2 config carrying the full union (all FS1 keys + `lifecycle` +
  complete `panels`) yields zero `inspectConfig` issues; removing any
  required sub-key or adding one unknown key at each level (`panels.foo`,
  `panels.rules.foo`, `panels.phases.foo`, `panels.phases.plan_review.foo`)
  each yield exactly one per-path issue.
- **CV2** — top-level `enforcement: "prompt"` (out-of-scope value),
  `minVendor: 0`, non-array `prefer`, and a `phases` set missing
  `task_validate` are each invalid with per-path issues; `panels` absent is
  **valid** (presence is readiness, §2), as is `enforcement` absent.
- **CV3** — `classifyConfigVersion`: `2`→current; `1`→older(1); `3`→newer(3);
  `"2"`, `2.5`, `0`, `-1`, missing key, non-object → invalid. Total and
  throw-free over the fixture set.
- **CV4** — axis coexistence: a v2 config with both `lifecycle` and
  `minVendor` values is schema-valid; `resolve-panel` on the model axis
  prints the supersede notice naming both values and never reads `minVendor`
  as a floor (falsifier: set `minVendor: 99` — resolution still succeeds at
  `minPanel`).
- **CV5** — loader detection-only: `readConfig` on a v1 config exits 2 with
  `REMEDY_SCHEMA_OLDER` verbatim, **with stdin a TTY-like interactive
  stream**, never prompting (no stdin read) and never writing (directory
  bytes untouched). `ensure-panel-agent` on the same repo halts identically
  with no per-consumer code (falsifier: a prompt or a write from any
  consumer other than setup).

**The fold:**

- **CV6** — fold(pair-A) deep-equals the committed v2 fixture: every
  consumer-owned field carried verbatim per the §3.3 table, `minVendor`
  values equal the old `min_panel` values, `enforcement: "strict"`,
  `schemaVersion: 2`, and the models file is gone.
- **CV7** — fold(pair-B): `lifecycle` block carried **verbatim**
  (deep-equal), `enforcement: "strict"`, `minVendor` values still present
  (no data loss). A roster-less variant (config only, no models file) folds
  to a v2 config with no `panels` key.
- **CV8** — **zero effective-panel change**: for pair-A and pair-B, across
  all four phases, with author-exclusion cases (author in/not in roster) and
  a fixed simulated credential set, `resolve-panel`'s stdout panel (members,
  order, suffixes) and exit code are identical before the fold (v1 skill
  semantics, from the recorded v1 goldens) and after (v2 on the folded
  config, `strict`). Fails on any single divergence.
- **CV9** — refusal honesty: a v1 models file with one unknown key (e.g.
  `phases.plan_review.weight`) produces `ok: false` with `cannot map
  phases.plan_review.weight` (and every other unmappable path listed), and
  the setup run reports them and writes **nothing** (recursive directory
  hash unchanged).
- **CV10** — recovery contract, fault-injected at each boundary (write,
  fsync/rename, unlink): post-state is the complete original v1 pair
  (boundaries 1–2) or valid-v2-plus-residue (boundary 3); no other state is
  observed. Residue cleanup-safety: with residue present, `resolve-panel` /
  `sdlc-status` / `check-lifecycle` behave identically to the residue-free
  v2 repo (falsifier: any read of the leftover models file).
- **CV11** — residue removal: on a v2 repo with residue, an interactive
  setup run offers removal; accept unlinks and reports `models: removed`;
  decline and non-TTY leave the file and report the retained note; the
  stale migration staging tmp file is likewise removed on accept.

**Migration entrypoint:**

- **CV12** — interactive accept on pair-A: prompt shown once, fold applied,
  result equals CV6's fixture, report carries `config: migrated` +
  `models: removed`, exit 0.
- **CV13** — interactive decline: exit 1, remedy naming both options
  (migrate / pin), directory bytes untouched.
- **CV14** — non-TTY: identical halt with **no prompt**; `--yes` (with or
  without a TTY) does **not** confirm the migration (still prompts on TTY /
  halts non-TTY); migration mode with `--profile standard` (or any mutating
  flag) is refused with the migrate-first message. Falsifier for the
  no-unattended rule: any flag/env combination that folds without a live
  TTY reply.
- **CV15** — fresh posture: `--profile standard --yes` on a fresh repo
  writes top-level `enforcement: "preference"` explicitly (with or without
  `--seed-panels`; `panels` present only with the flag); with
  `--enforcement strict`, `"strict"`; interactive defaults accept-all yields
  `"preference"`. Both paths asserted (DoD 5).
- **CV16** — FS10 v2 goldens: text and JSON reports carry
  `schemaVersion: 2` in success, refusal, and catastrophic envelopes;
  `--with-models` exits 2 with the exact retirement message and writes
  nothing.

**FS8 v2:**

- **CV17** — v1 config under the v2 skill: `config.valid` pass (deferral
  message), `config.schema-current` **fail** with `REMEDY_SCHEMA_OLDER(1)`
  as remediation, state `not-ready`, **exit 3**, and every other check still
  reports (git/manifest/workflow checks evaluated, `config.panels` skipped
  with the schema-not-current reason).
- **CV18** — config stamped `schemaVersion: 3`: `config.valid` error with
  `REMEDY_SCHEMA_NEWER(3)`, state `error`, **exit 2**.
- **CV19** — migrated v2 repo (no models file, committed clean, panels
  present): state `ready`, **exit 0**; the report contains no `models.*`
  check ids and carries `schemaVersion: 2`. A panels-less v2 repo instead
  reports `config.panels` fail, `not-ready`, exit 3.
- **CV20** — malformed manifest (non-JSON, or junk `schemaVersion`): error,
  exit 2, existing message shapes (updated to name 2).

**Resolver (FS5):**

- **CV21** — `preference` + shortfall (vendor axis: `minVendor: 3`, two
  credentialed vendors; model axis: `minPanel: 3`, two credentialed models):
  exit **0**, stdout byte-parseable (plain list and `--emit-tasks` JSON both
  parse and name exactly the achieved panel), stderr carries the exact §5.3
  shortfall advisory naming axis, target, achieved.
- **CV22** — `strict`, same inputs: exit 1 with today's failure stderr;
  byte-identical machine stdout format. (`enforcement` absent behaves as
  `preference` — asserted once on the vendor axis.)
- **CV23** — author demotion: under `preference`, when the floor is
  reachable without the author, the author model/vendor is still excluded;
  when not reachable, the author is readmitted, flagged with the exact §5.3
  advisory, and exit is 0; under `strict` the author is never readmitted
  (exit 1 on shortfall). Empty-panel: zero credentialed models exits 1 in
  **both** modes.
- **CV24** — `--models-file <path>` exits 2 with the exact retirement
  message, without reading the path (falsifier: point it at a
  crash-inducing fixture).
- **CV25** — halts: on a v1 config, resolve-panel halts with
  `REMEDY_SCHEMA_OLDER` (never prompts, never writes — the every-other-
  consumer rule); on a v2 config without `panels`, exit 1 with the
  no-roster message; on a missing manifest, exit 2 with the adapted
  requires-manifest message.
- **CV26** — vendor-axis conservation: for a folded pair-A config under
  `strict`, all four phases' stdout/stderr/exit match the recorded v1
  goldens modulo only the renamed notice/file strings enumerated in the
  test (falsifier: any unenumerated diff).

**Checker:**

- **CV27** — `check-lifecycle` on a v2 repo passes `config.valid`; on a v1
  config reports `config.valid` error containing `REMEDY_SCHEMA_OLDER(1)`
  verbatim (exit 2), not a bare schemaVersion reject; FS9 declaration
  checks and envelope (`schemaVersion: 1`) unchanged.

**Release guard:**

- **CV28** — with a synthetic base/head diff touching
  `schema/sdlc.config.schema.json`: PR title `feat: x` → exit 1;
  `feat!: x` → exit 0; `feat(scope)!: x` → exit 0; title `feat: x` + body
  `BREAKING CHANGE: schema v2` → exit 0; **inner commit `feat!` with plain
  title `feat: x` → exit 1** (the squash-subject rule); a diff touching only
  non-watched files → exit 0 regardless of title. Same for a
  `CONFIG_SCHEMA_VERSION` line change.

**Bindings, dogfood, prose:**

- **CV29** — `rg -l "sdlc\.models\.json"` over the tree returns only paths
  under `docs/`; `normative-references.json` validates and
  `check-references` exits 0; `.github/workflows/ci.yml` carries the guard
  step.
- **CV30** — dogfood: this repo's tree carries exactly one
  `.pi/sdlc/sdlc.config.json` at `schemaVersion: 2` and no
  `sdlc.models.json`; `sdlc-status` exits 0; `resolve-panel` for each review
  phase reproduces the pre-fold panel for the same credentials (the CV8
  fixed point on the live repo).
- **CV31** — SKILL.md greppable assertions (docs.test.js style): the exit-3
  startup flow names the setup-sdlc migration as the sanctioned action; the
  panel section carries the shortfall-carry instruction; no SKILL.md
  reference to `sdlc.models.json` remains.
- **CV32** — the five ADRs exist in `docs/adr/` and each superseded/amended
  ADR (0001, 0002, 0005, 0012, 0015, 0016, 0018) contains a forward
  cross-reference.

A scenario that cannot be made to fail is a defect in this spec.

## 13. Out of scope (binding, from the plan)

OL-B content (checker/evidence, FS9 v2, FS10 report-nudge, profile
application to existing adopters — it consumes §3.2's engine seam); the
`prompt` enforcement mode; any downgrade path; auto-migrate in CI; a
durable decision-log artifact; this repo's vendor→model axis hygiene;
roster value governance; the #55 map-mechanics review.

## 14. Context for Tasks

- Suggested slicing: **(T1)** schema v2 + version seam + loader guard +
  remedy constants (`lib.mjs`, schema files) [CV1–5]; **(T2)** migration
  engine + setup migration mode + FS10 v2 + fresh posture
  [CV6–16]; **(T3)** resolver posture + retirement [CV21–26];
  **(T4)** FS8 v2 + checker compat [CV17–20, 27]; **(T5)** CI guard +
  bindings + SKILL.md + ADRs + dogfood fold [CV28–32]. T2–T4 depend on T1;
  T5 depends on all.
- The v1 test corpus for configs/models does not vanish: it re-homes as
  migration-input fixtures (CV6–9) and recorded v1 goldens (CV8, CV26).
- Record the v1 goldens for CV8/CV26 **before** touching the resolver
  (capture from the pre-change tree), or generate them from a pinned
  checkout — the fixed point must be measured against shipped behaviour,
  not against the new code's own output.
- The dogfood fold (CV30) is a working-tree/commit operation performed via
  the real entrypoint (interactive), not hand-edited — it is the first
  consumer of the contract.
- PR declares slug `config-versioning-migration` on the irreversible track;
  the plan, this spec, and the build doc satisfy the FS9 artifact demands.
