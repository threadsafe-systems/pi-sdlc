# Spec: repo opt-in + local workflow hooks

- Date: 2026-07-10
- Track: **irreversible**. Implements the approved plan
  `docs/plans/2026-07-10-sdlc-opt-in-and-hooks.md` (panel-reviewed, 8c3c476).
- Author vendor: anthropic (excluded from panels).
- Revision: v2, incorporating the spec panel (gpt-5.2, deepseek-v4-pro,
  glm-5.2; adjudication in
  `docs/reviews/spec-sdlc-opt-in-and-hooks-2026-07-10/consolidated.md`).
- Amends: FS1 (`sdlc.config.json` schema — additive `hooks` property) and the
  skill's announce policy. Explicitly does NOT amend: FS3 (`resolveRoot`), FS5
  (existing script CLIs — `ensure-panel-agent` and `resolve-panel` behaviour is
  unchanged for all configs valid today; a config carrying `hooks` was
  previously rejected with exit 2 and becomes valid — that is the additive FS1
  change itself), FS2, FS4, FS6, FS7.
- Worktree neutrality (normative): pi-sdlc ships NO recommended worktree tool
  or skill. Every `use` value naming a worktree mechanism in this spec is a
  consumer-supplied placeholder (`tool:my_worktree_tool`), never a shipped
  default; the scaffolder asks the developer for their tool/skill name and
  writes what they answer.

## 0. Overview

Three new consumer surfaces and one policy change:

1. **FS1 amendment**: optional `hooks` in `sdlc.config.json` (§1).
2. **New script `sdlc-status`** — the mechanical half of the opt-in gate (§3).
3. **New scaffolder `setup-sdlc`** + `/setup-sdlc` prompt template (§5).
4. **Announce policy**: the skill refuses to run as law in a repo without a
   manifest; advisory mode is the explicit fallback (§2). Enforcement of hooks
   and workflow.md is prose law executed by the agent with a pinned,
   transcript-greppable announce format (§1.4, §4) — there is no hook engine.

## 1. Contract: `hooks` in `sdlc.config.json` (FS1 amendment, additive)

### 1.1 Shape

New optional top-level key `hooks`. Top-level `additionalProperties: false`
stands; `hooks` joins the enumerated properties (schema file + `validateConfig`
`allowed` set + example).

```json
"hooks": {
  "implement": {
    "before": [
      { "use": "tool:my_worktree_tool",
        "do": "Create AND enter a worktree for the feature branch so the session's working root moves into it; target all subsequent writes there." }
    ]
  },
  "*": {
    "after": [ { "run": "scripts/notify.sh sdlc-phase-done" } ]
  }
}
```

(`tool:my_worktree_tool` is a consumer-supplied placeholder — see the
neutrality note in the header.)

```json
```

JSON Schema fragment (normative; add to `schema/sdlc.config.schema.json` with
these definitions):

```json
"hooks": {
  "type": "object",
  "additionalProperties": false,
  "minProperties": 1,
  "properties": {
    "brainstorm": { "$ref": "#/definitions/phaseHooks" },
    "plan":       { "$ref": "#/definitions/phaseHooks" },
    "spec":       { "$ref": "#/definitions/phaseHooks" },
    "build":      { "$ref": "#/definitions/phaseHooks" },
    "implement":  { "$ref": "#/definitions/phaseHooks" },
    "pr":         { "$ref": "#/definitions/phaseHooks" },
    "*":          { "$ref": "#/definitions/phaseHooks" }
  }
},
"definitions": {
  "phaseHooks": {
    "type": "object",
    "additionalProperties": false,
    "minProperties": 1,
    "properties": {
      "before": { "$ref": "#/definitions/hookList" },
      "after":  { "$ref": "#/definitions/hookList" }
    }
  },
  "hookList": { "type": "array", "minItems": 1,
                "items": { "$ref": "#/definitions/hookItem" } },
  "hookItem": {
    "oneOf": [
      { "type": "object", "additionalProperties": false, "required": ["run"],
        "properties": { "run": { "type": "string",
                                  "pattern": "^[^\\r\\n]+$" } } },
      { "type": "object", "additionalProperties": false,
        "required": ["use", "do"],
        "properties": {
          "use": { "type": "string",
                   "pattern": "^(skill|tool):[a-z][a-z0-9_-]*$" },
          "do":  { "type": "string", "pattern": "^[^\\r\\n]+$" } } }
    ]
  }
}
```

`run` and `do` are single-line by contract (the pattern forbids `\r`/`\n` and
implies non-empty) — this keeps the §1.4 announce lines and any transcript
grep line-oriented and falsifiable.

`validateConfig` (`skills/sdlc/scripts/lib.mjs`) enforces the identical rules
hand-rolled (NFR: no runtime deps): the top-level `hooks` object, if present,
is non-empty; phase keys ∈ {the six lifecycle names, `*`} — this vocabulary is
distinct from panel `PHASES` (lib.mjs) and MUST NOT be conflated; each phase
object non-empty with only `before`/`after` non-empty arrays; each item
exactly the `{run}` form or the `{use, do}` form (an item carrying both `run`
and `use`, unknown keys, empty or multi-line strings, or a bad `use` pattern
exits 2 with the standard `sdlc config <path>: …` diagnostic).

### 1.2 Semantics

- **When**: hooks fire only for phases the declared track actually runs (a
  reversible-track session never fires `spec` hooks).
- **Ordering**: `before` = `*` items first, then phase-specific; `after` =
  phase-specific first, then `*`. Within a list, array order.
- **Failure**: a failed or skipped `before` hook **blocks** the phase (the
  agent must not enter the phase; it reports and either retries, asks, or
  moves backward). A failed `after` hook **warns**: recorded in the session
  and in the phase artifact's notes if one exists, never blocking.
- **`run` items**: the agent executes the command verbatim, after announcing
  it (§1.4), from the **session's current working root at fire time** — the
  FS3 consumer root unless the workflow has legitimately moved the root (e.g.
  a `before` hook entered a worktree; a worktree is a checkout of the same
  repo, so repo-relative commands resolve). Same command string every time;
  environment-dependent result. Exit 0 = ok; non-zero = failed.
- **`use`/`do` mapping rule** (normative): `tool:<name>` → the agent invokes
  the tool `<name>`, using `do` as the intent; the tool missing from the
  session's toolset = hook failure. `skill:<name>` → the agent locates and
  reads that skill (its SKILL.md) and performs `do` per the skill's
  instructions; skill not found = hook failure. Completion judgement: the
  `do` text is the acceptance criterion; if the agent cannot evidence it, the
  hook failed.

### 1.3 Trust boundary (normative language; restate in SKILL.md and README)

> `run` hooks execute arbitrary shell commands with the agent's privileges,
> from a committed file. They sit inside pi's existing project-trust boundary:
> enabling hooks for a repo means trusting that repo's config, exactly as you
> already must for `.pi/prompts` and project settings. The agent always echoes
> the exact command before running it, and the scaffolder warns whenever it
> writes a `run` hook.

### 1.4 Announce-on-fire (the audit trail; pinned, greppable format)

Before executing any hook, and after it completes, the agent emits exactly:

```
[sdlc hook] <phase>:<before|after> run$ <command>
[sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
[sdlc hook] <phase>:<before|after> result: ok
[sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
```

A transcript that enters a phase whose `before` hooks lack these lines is a
falsifiable violation (red flag). This is prose law, agent-executed — the same
enforcement model as the iron law; there is no mechanical runner (locked by
plan adjudication H2).

## 2. Contract: opt-in gate + advisory mode (announce policy)

Decision procedure at skill start (SKILL.md carries this verbatim as a
numbered list):

1. Run `skills/sdlc/scripts/sdlc-status.sh` (§3) from the package checkout —
   the consumer root is resolved via FS3 from `$PWD`, so the session's cwd
   must be inside the consumer repo (or pass `--repo-root`).
2. **Exit 0 (opted in)**: announce with the config's `announce` string, then
   enumerate: each configured hook (phase, timing, kind), and each top-level
   rule of `workflow.md` if present (§4). Proceed under full law.
3. **Exit 1 (not opted in)**: do NOT proceed under law. State: this repo has
   not adopted the sdlc; offer (a) `/setup-sdlc` to opt in, or (b)
   **advisory mode** for this session only, requiring the user's explicit
   in-session consent.
4. **Advisory accepted**: advisory mode never uses any `announce` string
   (none exists — the plan's "no announce" means exactly this) and never
   claims the session runs "under law"; per-phase markers are permitted but
   every one is prefixed `advisory:`; follow the phase sequence as guidance;
   MUST NOT create or mutate tracker objects, MUST NOT claim any gate as
   passed, MUST NOT stamp panel agents.
5. **Advisory declined**: the skill stops; the session continues without the
   sdlc.
6. **Exit 2 (invalid config)**: surface the diagnostic and stop; an invalid
   manifest is never silently downgraded to advisory mode.

`readConfig(root, opts)` (`scripts/lib.mjs`) gains an options bag:
`readConfig(root, { requireManifest: true })` exits 2 with a diagnostic that
names `/setup-sdlc` when the manifest is absent. Default call sites
(`ensure-panel-agent`) are unchanged — no-manifest defaults remain (existing
spec S7 and FS5 stay green).

## 3. Contract: `sdlc-status` CLI (new script; frozen on ship)

`skills/sdlc/scripts/sdlc-status.sh` (+ `.mjs`, same bash-wrapper→node-core
pattern as the existing scripts; no new runtime deps):
`sdlc-status.sh [--config D | --repo-root D]` (root resolution = FS3,
unchanged, reused from `lib.mjs`).

- stdout, opted in (exactly these keys, one per line, in this order):

  ```
  root: <abs path>
  opted-in: yes
  prefix: <prefix>
  labelPrefix: <labelPrefix>
  hooks: <phase>:<before|after> <count>   (one line per configured pair; or `hooks: none`)
  workflow: present | absent
  models: present | absent
  ```

- not opted in: `opted-in: no` (plus `root:`) on stdout; pointer to
  `/setup-sdlc` on stderr; exit 1.
- exit codes: `0` opted in (config valid); `1` no manifest; `2` invalid
  config/bad args (same diagnostics as `validateConfig`).

## 4. Contract: `workflow.md` (prose layer)

- Location: `<root>/.pi/sdlc/workflow.md`. Optional. Free markdown; the
  recommended form is top-level bullets, one rule each.
- **Load rule (falsifiable)**: at announce, the agent lists every top-level
  bullet (each `-`/`*` line at indent 0), first line, truncated to 80 chars.
  A present workflow.md whose rules are not enumerated at announce is a
  violation.
- **Conflict rule (operational)**: *gates* = the Gate column of SKILL.md's
  phase table plus the iron law's forward-skip prohibitions — global always
  wins; local rules may ADD gates, never remove or weaken those. *Process* =
  everything else — local wins.
- Enforcement: prose law, agent-executed, panel-verified (no tooling).

## 5. Contract: `setup-sdlc` scaffolder + `/setup-sdlc` template

### 5.1 CLI: `skills/sdlc/scripts/setup-sdlc.sh` (+ `.mjs`, no new runtime deps)

| flag | value | maps to |
|---|---|---|
| `--prefix <v>` | `^[a-z][a-z0-9-]*$` | `prefix` |
| `--label-prefix <v>` | `^[a-z][a-z0-9-]*$` | `labelPrefix` |
| `--announce <v>` | non-empty | `announce` |
| `--tracker-repo <owner/name>` | `owner/name` | `tracker.repo` |
| `--tracker-board-number <n>` | int ≥ 1 | `tracker.board.number` |
| `--tracker-board-url <u>` | http(s) URL | `tracker.board.url` |
| `--hook-run "<phase>:<before\|after>:<command>"` | command = remainder after 2nd `:` | one `{run}` item |
| `--hook-use "<phase>:<before\|after>:<kind>:<name>:<do>"` | `use` = fields 3–4 rejoined (`<kind>:<name>`, must match the §1.1 pattern); `do` = remainder after the 4th `:` | one `{use,do}` item |
| `--with-models` | boolean | also write `sdlc.models.json` from the committed example (with a "re-check model ids" comment) |
| `--force` | boolean | overwrite an existing config |
| `--yes` | boolean | non-interactive with defaults for anything not flagged |
| `--config D` / `--repo-root D` | dir | target root (FS3 resolution otherwise) |

- Repeated `--hook-run`/`--hook-use` flags (mixed freely) each append one
  item; per-phase/timing list order = global argv order (stable).
- Modes: any config flag or `--yes` ⇒ non-interactive (no prompts). Otherwise
  interactive interview (prefix, labels, announce, tracker y/n; worktree
  preference — if yes, the developer is ASKED for their tool/skill name and
  the answer becomes the `implement:before` `use` hook: no shipped default
  mechanism, per the neutrality note; notifications — offered as an `*:after`
  `run` hook); interactive without a TTY ⇒ exit 2 usage error.
- The three tracker flags are all-or-none (FS1 requires `repo` + `board`);
  partial tracker flags ⇒ exit 2.
- Self-validation: the script validates the resulting object with
  `validateConfig` BEFORE writing; an invalid result is a bug and exits 2
  writing nothing.
- Existing `<root>/.pi/sdlc/sdlc.config.json` without `--force` ⇒ exit 2,
  file untouched. `--with-models` never overwrites an existing models file
  (skip + note on stderr).
- Writing any `run` hook prints the §1.3 trust warning on stderr.
- Exit codes: `0` written; `1` user declined/aborted the interview; `2` error
  (bad args, invalid result, existing-without-`--force`, no TTY for
  interview).

### 5.2 Template

`templates/setup-sdlc.md` (new top-level dir — NOT `skills/sdlc/prompts/`,
which holds reviewer prompts), registered in `package.json` as
`"pi": { "skills": ["./skills"], "prompts": ["./templates"] }` (mechanism:
pi docs — packages.md "prompts entries in package.json", prompt-templates.md
"Locations"; filename ⇒ `/setup-sdlc`). Body: frontmatter `description`,
then instructions to run the interview via
`skills/sdlc/scripts/setup-sdlc.sh` (path relative to the package checkout,
run with the session's cwd inside the consumer repo), confirm the written
config back to the user, and remind about committing `.pi/sdlc/`.

## 6. SKILL.md required changes (each greppable)

1. A section `## Opt-in and advisory mode` containing the §2 numbered
   procedure, with a `### Advisory mode` subsection carrying the §2 step-4
   restrictions (greps: `^## Opt-in and advisory mode`,
   `^### Advisory mode`).
2. A section `## Hooks (local workflow)` carrying: the phase-key vocabulary,
   ordering, before=block / after=warn, the §1.4 announce format block
   verbatim, the §1.2 mapping rule, and the §1.3 trust paragraph.
3. Phase table Implement row reworded to: `code and tests | the feature
   branch (worktree or checkout per the project's hooks/workflow) |` — the
   prescription phrase `in a worktree` no longer appears in the row.
4. The worktree mechanism warning (verbatim): *"If your workflow uses
   worktrees: creating one is not enough — the session's working root must
   move into it (create-then-enter). Writing to the main checkout after
   creating a worktree is a red flag."*
5. `workflow.md` load + conflict rule (§4).
6. Red flags list gains: `Skipping or silently reordering a configured phase
   hook.` and `Writing to the main checkout after creating a worktree.`
7. The announce paragraph updated to route through `sdlc-status` (§2).

## 7. Non-functional requirements

- NFR1: no new runtime dependencies; validation stays hand-rolled in
  `lib.mjs`; `setup-sdlc` is bash + node like the existing scripts.
- NFR2: no test makes a live/paid model call; scaffolder tests run against
  fresh temp dirs (`mkdtemp`), never this repo's own `.pi/sdlc/`.
- NFR3: no behaviour change to existing script CLIs (FS5) for any config
  valid today: the prior spec's S3b/S3c/S4–S7 scenarios and the committed
  goldens stay green unmodified. (A config carrying `hooks` — previously
  exit 2 — becoming valid is the additive FS1 change, not an FS5 change.)
- NFR4: docs stay consistent — README opt-in story matches SKILL.md §2.

## 8. Verification scenarios (stable ids; falsifiable)

- OH1 (§1.1 schema): the committed example config extended with the
  documented `hooks` example validates against the JSON Schema; mutations —
  empty top-level `hooks` (`{}`), unknown phase key (`deploy`), unknown hook
  kind (`{exec:…}`), empty `do`, multi-line `run` or `do` (embedded `\n`),
  item with both `run` and `use`, empty `before` array, empty phase object,
  `use` failing the pattern — are each rejected by BOTH the JSON Schema and
  `validateConfig` (exit 2). Falsify: any mutation accepted.
- OH2 (§2 readConfig): `readConfig(root, {requireManifest:true})` on a
  manifest-less root exits 2 and the diagnostic names `/setup-sdlc`; on a
  root WITH a valid manifest it returns the config (including `hooks` when
  present) without exiting; default `readConfig(root)` still returns
  defaults. Falsify: wrong exit/message, missing success path, or changed
  default behaviour.
- OH3 (§3): in a temp repo with a valid config + hooks, `sdlc-status.sh`
  exits 0 and stdout carries the §3 keys in order with correct hook counts;
  in a manifest-less temp repo it exits 1 with `opted-in: no`; with a
  corrupted config it exits 2. Falsify: wrong exit code, missing/misordered
  keys, wrong counts.
- OH4 (§5.1): in a fresh temp git repo, `setup-sdlc.sh --prefix x
  --label-prefix y --yes` exits 0 and the written config passes
  `validateConfig`; re-run without `--force` exits 2 leaving the file
  byte-identical; `--force` overwrites. Falsify: any deviation.
- OH5 (§5.1 hooks flags): `--hook-run "implement:before:echo hi"` produces
  `{run:"echo hi"}`; `--hook-use
  "implement:before:tool:my_worktree_tool:enter the worktree: now"` produces
  `{use:"tool:my_worktree_tool", do:"enter the worktree: now"}` (fields 3–4
  = `use`; `do` = remainder after the 4th `:`, itself containing `:`); a
  `--hook-run` whose command embeds `:` parses as remainder-after-2nd-`:`;
  mixed repeated hook flags preserve argv order in the written lists; a
  `--hook-run` write emits the trust warning on stderr; malformed hook flags
  (bad phase, bad timing, `use` not matching the pattern) exit 2. Falsify:
  wrong shape, wrong order, no warning, malformed accepted.
- OH6 (§5.2): `package.json` `pi.prompts` includes `./templates`;
  `templates/setup-sdlc.md` exists with a `description`. Falsify: template
  not discoverable as `/setup-sdlc`.
- OH7 (§6): greps against SKILL.md — `^## Opt-in and advisory mode`,
  `^### Advisory mode`, `^## Hooks (local workflow)`, `\[sdlc hook\]`, both
  new red-flag lines, the create-then-enter warning sentence; AND the
  Implement table row does not contain `in a worktree`. Falsify: any grep
  misses / the row phrase remains.
- OH8 (§1.4/§4 prose law): SKILL.md contains the announce-format block and
  the workflow.md enumeration rule verbatim (grep). Behavioural adherence is
  panel- and human-verified prose, asserted here only as documentation
  presence. Falsify: block absent.
- OH9 (ADRs): `docs/adr/` gains exactly two new ADRs — opt-in semantics;
  hooks surface — each meeting the ADR README criteria. Falsify: missing or
  merged.
- OH10 (dogfood): this repo's committed `.pi/sdlc/sdlc.config.json` passes
  `validateConfig`; `sdlc-status.sh` exits 0 here. Falsify: invalid or
  exit ≠ 0.
- OH11 (NFR3 regression): the pre-existing test suite passes unmodified
  (`npm test` green including prior S3b/S3c/S4–S7 coverage). Falsify: any
  prior test changed to accommodate this feature or failing.
- OH12 (NFR4 README): README contains `/setup-sdlc` and the opt-in story,
  and no longer claims the skill "still runs phases + panels using built-in
  defaults" with no manifest. Falsify: pointer absent or stale claim
  remains.

## 9. Out of scope (restates plan)

Hook engine/runner or CI enforcement of hook firing; sub-mode hook points
(map tickets, build sub-issues); pi-worktree or any notifier as a dependency;
deployment/post-merge phases; migration tooling; tracker pluggability.
