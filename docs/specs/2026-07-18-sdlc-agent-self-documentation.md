# Specification: agent self-documentation for pi-sdlc

- Date: 2026-07-18 (rev 2)
- Revision history: rev 1 pre-panel draft. **rev 2 incorporates every spec-panel
  finding** (1 high, 6 medium, 3 low) —
  `docs/reviews/spec-review-sdlc-agent-self-documentation-2026-07-18/consolidated.md`:
  the startup `error` fallback is disambiguated (§15); the §9 adoption predicate
  is corrected to the `adoption.manifest-head` check with error → stop; the
  entrypoint stamp text is pinned and ASD12 made structural; the FS11 discovery
  set is made satisfiable against the pre-change inventory (§16); sentinel
  version lifecycle, `canonicalJson`, glob constraints, and the redundant
  version check are pinned (§§13/16); the SKILL ceiling gains a Build
  backward-transition escape (§§4/21); ASD20 is made landing-order conditional.
- Plan: `docs/plans/2026-07-18-sdlc-agent-self-documentation.md` rev 2
  (approved 2026-07-18); spec handover
  `docs/briefs/2026-07-18-sdlc-agent-self-documentation-spec-handover.md`.
- Spec gate: **approved** by Neil Chambers on 2026-07-18, after the two-model
  spec panel (`zai/glm-5.2:high`, `deepseek/deepseek-v4-pro:high`) reached its
  stop condition at rev 2.
- Track: **irreversible**. Adds installed public documentation and
  configuration-explanation surfaces, assigns canonical ownership for normative
  phase law, and changes the interface agents use to enter and navigate the
  lifecycle. Config schemaVersion 3 and lifecycle ceremony are unchanged.
- Absorbs: **IC-B** (`docs/plans/2026-07-17-config-intent-vocabulary.md` rev 5,
  scope items 5/6) and **OL-C** (`docs/plans/2026-07-14-opt-in-lifecycle.md`
  rev 3 scope items 4/7, and issue #38's ratified entrypoint contract). Neither
  ships as a separate stream.
- Independent: #91 (phase-specific agent definitions/author-model preferences),
  #101 (phases as independently discovered skills), #102 (YAML/comments/dual
  format). None are re-opened here.
- Scenario ids: `ASD<n>` (stable; the floor, not the ceiling, for tests).
- Grounding order, authoritative: this Spec's constraints derive from the
  approved Plan and consolidated Plan review
  (`docs/reviews/plan-review-sdlc-agent-self-documentation-2026-07-18/consolidated.md`);
  IC-B/OL-C plans and #38; current `skills/sdlc/SKILL.md`, FS11
  (`assets/normative-references.json` + `scripts/check-references.mjs`); pi's
  installed `docs/skills.md` progressive-disclosure contract (`references/`
  loaded on-demand, skill-relative paths).

This is **one** Specification with three explicit contract groups. One human
approval covers all three because they jointly define one coherent agent reading
interface. The groups are:

- **Group A** — §§4–9: package law, references, routing, disposition audit, and
  the six #38 entrypoints.
- **Group B** — §§10–14: setup interview plus the deterministic
  render/write/check module, sentinel/fingerprint, and collision contracts.
- **Group C** — §§15–18: startup fallback, FS11 discovery/classification,
  installed-consumer fixtures, and the telemetry/setup merge.

## 1. Surface area

| Surface | Change | Group |
|---|---|---|
| `skills/sdlc/references/system-reference.md` | **new** package-level agent-facing system map (§5) | A |
| `skills/sdlc/references/phase-{brainstorm,plan,spec,tasks,implement,pr-review}.md` | **new** six canonical phase references (§6) | A |
| `skills/sdlc/SKILL.md` | slimmed to kernel-first router (§7); statement-level disposition ledger produced (§8) | A |
| `templates/sdlc-{brainstorm,plan,spec,tasks,implement,pr-review}.md` | **new** six package-owned standalone entrypoint prompts (§9) | A |
| `templates/setup-sdlc.md` | agent-led explanatory interview rewrite (§10) | B |
| `skills/sdlc/scripts/setup-sdlc.mjs` | reduced TTY fallback (§10); generate `CONFIG.md` via the shared module (§§11–13); preserve telemetry call sites on rebase (§18) | B/C |
| `skills/sdlc/scripts/config-doc.mjs` + `config-doc.sh` | **new** deep render/write/check module (§§11–13) | B |
| `.pi/sdlc/CONFIG.md` (this repo) | **new** generated companion, committed in the same PR | B |
| `skills/sdlc/scripts/check-references.mjs` | FS11 classification + structural discovery / inverse completeness (§16) | C |
| `skills/sdlc/assets/normative-references.json` | classified rows + new public surfaces + discovery config (§16) | C |
| `skills/sdlc/assets/normative-references.schema.json` | `class` field + discovery block (§16) | C |
| `docs/adr/0028-*.md` | **new** documentation-authority + generated-explanation-trust ADR (§19) | A |
| `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`, IC-B plan, OL-C plan | absorption notes (§19) | A |
| `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md` | **new** statement-level SKILL disposition ledger (§8) | A |
| `test/` | scenario tests per §20 | A/B/C |

**Explicitly unchanged (frozen)** — no edit, and guarded by ASD19:
`sdlc-status.mjs`/`.sh` and its FS8 check ids/exits; `check-lifecycle.mjs` and
its FS9 check ids/exits/declaration grammar; `lib.mjs` config schema and
`sdlc.config.schema.json` (schemaVersion **3**); `resolve-panel.mjs` behaviour,
floors, and refusal order; `validate-task.mjs`/`verify-task-receipt.mjs` and the
PV1/PV2 contract; the four `prompts/*.prompt.md` reviewer templates; panel sizing
and track/ceremony law.

---

# Group A — package law, references, routing, entrypoints

## 2. Naming and path conventions (normative)

- Package references live under `skills/sdlc/references/` and are loaded
  on-demand per pi's `references/` progressive-disclosure convention. Every
  package cross-reference is written **skill-relative** (e.g.
  `references/phase-plan.md`, `scripts/config-doc.sh`), never absolute and never
  assuming the package is the current working directory.
- The six phase slugs are exactly `brainstorm`, `plan`, `spec`, `tasks`,
  `implement`, `pr-review` — the #38 surface names (`build` surface renamed
  `tasks`; the internal phase name, `*-build.md` artifact suffix, `sdlc:build`
  hook key, and `sdlc:build-task`/`sdlc:epic` labels stay "build", per #38).
- Standalone entrypoints are package-owned prompt templates
  `templates/sdlc-<slug>.md`, advertised as the invocation `sdlc:<slug>`. They
  are one lifecycle skill's shared named surfaces, **not** six independently
  discovered skills (that is #101).
- The generated consumer companion is `.pi/sdlc/CONFIG.md` (consumer-relative to
  the repo root, alongside `sdlc.config.json`).

## 3. Authority and reading model (normative, binding on every reference)

The Plan's authority table is the binding read-order contract. Every reference
in Group A obeys it:

| Question | Canonical answer |
|---|---|
| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
| What global law and sequence apply? | `SKILL.md` kernel/router |
| What does this phase require? | The corresponding `references/phase-*.md` |
| What values has this repository chosen? | `sdlc.config.json` |
| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
| What implementation realizes a surface? | Source, only when implementation work requires it |

**Link-not-repeat rule.** A reference may state an invariant contract once and
link to canonical law it does not own; it must not silently restate or
contradict a rule owned elsewhere. Every configuration-dependent branch in any
reference is written as an explicit `under your configuration` callout that
routes the reader to current `CONFIG.md` (or authoritative `sdlc.config.json`
when absent/stale) — never as an assumed track, gate mode, panel floor, or
separate-Spec setting.

## 4. `SKILL.md` kernel-first contract (normative)

`SKILL.md` is restructured to the smallest interface every lifecycle session
must learn, retaining exactly these responsibilities and no detailed per-phase
mechanics:

1. readiness branching and announcement law (the FS8 four-state startup table);
2. the invariant kernel and forward/backward transition law (two tracks; the
   iron law; backward moves always allowed);
3. the effective-shape reading protocol (read `sdlc.config.json`, and current
   `CONFIG.md` for meaning; §15 startup check);
4. the authority map (§3 table) and pointers to `references/system-reference.md`
   and the six `references/phase-*.md`;
5. the phase sequence and the rule that each phase's detailed contract is loaded
   from its phase reference when that phase begins;
6. cross-phase red flags and the gate/process conflict rule;
7. delegation pointers that genuinely apply across phases (`adversarial-review`,
   `dispatch-subagents`, `gh-pr-review-comments`, `assets/tracker-ops.md`,
   `assets/agent-brief.md`).

**Size ceiling (falsifiable):** the restructured `SKILL.md` is **≤ 220 physical
lines and ≤ 16384 bytes** (measured on the committed file). It contains **no
duplicated phase-mechanics section**: detailed per-phase entry/hook/gate/refusal
mechanics appear in exactly one phase reference, not in `SKILL.md`. The
frontmatter `name: sdlc` and a `description` sufficient for pi to discover the
skill for lifecycle work are retained; all references are skill-relative.

**Ceiling feasibility.** The 220-line/16 KiB cap is approved Plan law (DoD 4).
If Build finds it physically impossible to retain all seven §4 kernel
responsibilities within the cap, that is a design flaw to surface as a **backward
transition to Plan** (the iron law permits backward moves at any time), not a
unilateral spec-time loosening of an approved DoD. Build must not silently ship
a larger `SKILL.md`.

## 5. `references/system-reference.md` contract (normative)

One agent-facing system map answering the **source-free comprehension
checklist**. It must contain, as discoverable sections, at minimum:

1. **Purpose** — what pi-sdlc is.
2. **Kernel** — the invariant guarantees and the two tracks.
3. **Adoption & readiness** — FS8 states and how a repo opts in (links, does not
   restate FS8 mechanics).
4. **Tracks, phases, transitions, gates, refusal** — the lifecycle sequence at a
   glance, each phase linking its `references/phase-*.md`.
5. **Public composition inventory** — the FS11 taxonomy (§16) narrated:
   package-owned surfaces, delegated skills, required tools, consumer-configured
   integrations, optional enhancements, and the source-inspection boundary.
6. **Configuration & extension surfaces** — `sdlc.config.json`, generated
   `CONFIG.md`, hooks, `workflow.md`, tracker (links to the effective-shape
   authority, does not hardcode dial values).
7. **Artifacts & durable evidence** — plan/spec/build docs, review artifacts,
   validation receipts, tracker projection.
8. **Normal full-lifecycle operation and the six standalone entrypoints** (§9).
9. **Advanced modes** — map mode and tracker-backed build, pointing at their
   package references/assets.
10. **Operational troubleshooting and the source-inspection boundary** — that
    source is read only when changing implementation.
11. **Next-read routing** — the §3 authority table, so an agent knows which
    artifact answers which question.

It is explanatory and must not become a second copy of detailed phase law.

## 6. `references/phase-*.md` contract (normative)

Each of the six phase references owns the detailed **invariant** public contract
for its phase and states, as required headings, all of:

1. **Purpose and invocation modes** (full-lifecycle and the `sdlc:<slug>`
   standalone entrypoint).
2. **Entry conditions and authoritative upstream inputs.**
3. **Configured before-hook order and blocking semantics** (routes to the
   effective hooks; does not assume any repo's hooks).
4. **Required activity and artifact/output shape** (artifact home routes to
   `paths.*`).
5. **Invariant gate/approval seam**, with every variable branch written as an
   explicit `under your configuration` callout routed to `CONFIG.md`/JSON —
   never a silently assumed track, gate mode, floor, or separate-Spec value.
6. **Refusal and backward-transition behaviour.**
7. **After-hook order and warning semantics.**
8. **Completion evidence and next transition.**
9. **Advanced-mode pointers** where applicable (Brainstorm→map mode;
   tasks→tracker-backed build).

These references document phases; they do **not** turn phases into separately
discovered skills (#101).

## 7. Disposition of moved normative prose (normative)

Relocating any current `SKILL.md` normative statement is governed by a
**statement-level disposition ledger** committed at
`docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`. Every
current normative rule and red flag in the pre-change `SKILL.md` maps to exactly
one disposition:

- **retained** in `SKILL.md` (kernel/router), or
- **moved** to exactly one named reference (system reference or a specific phase
  reference), or
- **intentionally replaced** with a recorded reason.

No current normative statement may be silently dropped or owned twice. The Plan
and PR panels ground against the pre-change `SKILL.md`; the ledger is the review
baseline.

## 8. `SKILL.md` disposition audit (falsifiable)

The disposition ledger enumerates each pre-change normative statement id, its
verbatim (or gisted-with-link) text, and its disposition + destination. A test
(ASD5) asserts: (a) every ledger row's destination reference exists and contains
the moved statement's anchor text; (b) no destination is listed for two
different retained/moved statements that duplicate the same rule; (c) the ledger
covers the full pre-change red-flags list. Removing a moved statement from its
destination reference fails ASD5 non-vacuously.

## 9. Six standalone entrypoints and adopted-config-dominates (normative)

Six package-owned prompt templates `templates/sdlc-<slug>.md`, each a thin router
that: (1) resolves the `sdlc` skill directory and runs `sdlc-status`; (2) loads
the corresponding `references/phase-*.md`; (3) enforces the #38 degradation
contract below; (4) never duplicates phase mechanics (it links the shared phase
reference).

**Adopted-config-dominates — the binary switch.** Detection uses the FS8
adoption check directly: a repository is **adopted** iff the `sdlc-status`
`adoption.manifest-head` check passes — equivalently, its state ∈ {`ready`,
`not-ready`} — i.e. the committed `HEAD` contains `.pi/sdlc/sdlc.config.json`
(`sdlc-status.mjs`). This freezes #38's "presence of the manifest at the
expected root" as the FS8 committed-`HEAD` adoption oracle (a mechanical
tightening to the now-canonical adoption authority, not a re-decision of #38's
switch). It deliberately does **not** use "exit ≠ 1": FS8 aggregates `error` to
exit 2 ahead of the `not-adopted` branch, and an errored `sdlc-status` (e.g. a
`git.repository` failure that skips `adoption.manifest-head`) is genuinely
unknown-adoption. On `error` (exit 2) the entrypoint **stops** and surfaces the
diagnostic, matching the `SKILL.md` startup table — it is never treated as
adopted. When adopted, **every** entrypoint loses sampling leniency and runs
under committed configuration and upstream requirements; missing upstream is
always refuse-with-redirect.

**Per-entrypoint table (frozen from #38):**

| Entrypoint | Upstream needed | Unadopted, upstream missing | Adopted, upstream missing |
|---|---|---|---|
| `sdlc:brainstorm` | none | runs as dialogue | runs as configured gate |
| `sdlc:plan` | none | runs, forms intent live | runs as configured gate |
| `sdlc:spec` | committed plan doc | **stamp-and-interview** | **refuse-with-redirect** ("run `sdlc:plan`") |
| `sdlc:tasks` | committed scenario ids | **always refuse-with-redirect** — never fabricates ids | same |
| `sdlc:implement` | committed tasks/build with named checks | **always refuse-with-redirect** | same |
| `sdlc:pr-review` | none (diff self-contained) | **optional skippable grounding prompt**; output discloses grounded-vs-diff-only | runs as configured gate |

**Stamp (normative, single plain-prose line, no YAML/JSON, never parsed by any
tooling).** The canonical form for `sdlc:spec` is exactly:

> `> Sampled via sdlc:spec, standalone — no committed plan found; intent captured by interview below. Not adopted; nothing here is checker-verified.`

The stamp is structurally verifiable (ASD12) without the external #38 text: it is
a single line beginning `>`, contains no `{`/YAML front matter, and includes the
required disclosure phrases "no committed plan", "Not adopted", and
"checker-verified". Only `sdlc:spec` emits a stamp (it is the only
stamp-and-interview entrypoint).

**`sdlc:pr-review` grounding relationship (frozen from #38):** reuses the
`adversary-review` panel mechanics; when unadopted it applies a small fixed
panel default (no committed floor to read) and offers an optional, skippable
prompt for existing design material, disclosing grounded-vs-diff-only; when
adopted it runs the committed `pr_review` gate at the committed mode/floors,
never below them.

`sdlc:tasks` and `sdlc:implement` never fabricate scenario ids or check tables
for absent upstream (the counterfeit-artifact rule), in any adoption state.

---

# Group B — setup interview and configuration explanation

## 10. Agent-led explanatory setup (normative)

`templates/setup-sdlc.md` leads the conversation and **explains before eliciting
choices**, naming each concept it must teach:

1. the invariant kernel and the difference between lifecycle law and
   configurable scaffolding;
2. tracks and the irreversible/reversible distinction;
3. what `panel`, `advisory`, `human`, and `off` mean in practice;
4. the consequences of separate Specification (`shape.separateSpec`), tracker
   publication (`shape.publishToTracker`), task validation (`review.tasks`), and
   shortfall posture (`review.onShortfall`);
5. that adoption reduces to **two owner decisions** — who reviews designs
   (`review.design`) and who reviews code (`review.code`) — with everything else
   defaulted and explained rather than presented as a quiz.

Setup finishes by explaining the generated `sdlc.config.json` and `CONFIG.md`,
the commit/adoption step, and `sdlc-status` verification.

**TTY-fallback ceiling (falsifiable):** the `setup-sdlc.mjs` interactive
readline fallback asks **at most the two core decisions plus a final
confirmation** (≤ 3 prompts total). Every dial remains reachable
non-interactively via the existing flags (`--preset`, `--review-*`,
`--panel-size`, `--on-shortfall`, `--separate-spec`, `--publish-to-tracker`,
`--default-track`, repeatable `--override`); reducing the fallback removes no
non-interactive configurability. The interactive prompt count is asserted in
tests (ASD11).

## 11. `config-doc` module: public interface (normative)

One deep module `skills/sdlc/scripts/config-doc.mjs` (Node builtins only; no new
runtime dependencies), with the thin wrapper `config-doc.sh`. The **same
renderer** backs setup, regeneration, and checking — there is no separate prose
template path that can disagree with the check. Public sub-commands:

```
config-doc.sh render [--repo-root DIR] [--format text|json]
config-doc.sh write  [--repo-root DIR] [--force] [--format text|json]
config-doc.sh check  [--repo-root DIR] [--format text|json]
```

- `render` — read and validate `sdlc.config.json` (via `lib.mjs` `inspectConfig`,
  reusing the frozen validator), emit the expected `CONFIG.md` to **stdout**,
  and **never mutate the repository**. Exit 0 on a valid config; exit 2 on an
  invalid/unreadable config with a bounded diagnostic.
- `write` — render, then create/regenerate `.pi/sdlc/CONFIG.md` per the
  recognition/collision rules in §13. Reports the taken `action`.
- `check` — classify the on-disk companion into one of four states without
  mutating anything (§12).

All three share one deterministic renderer function so `write` output and the
`check` expected render are byte-identical by construction.

## 12. `check` states, exits, and envelope (normative)

`check` compares the on-disk `.pi/sdlc/CONFIG.md` against the freshly rendered
expected file (sentinel line + body):

| State | Condition | exit |
|---|---|---|
| `current` | file present, sentinel recognized, fingerprint matches, and body byte-identical to the expected render | 0 |
| `missing` | file absent | 1 |
| `stale` | file present, sentinel recognized, but fingerprint/body differs from the current expected render (includes a recognized older-version sentinel) | 1 |
| `error` | file present with an absent/malformed/unsupported sentinel (an unrecognized consumer collision), **or** `sdlc.config.json` invalid/unreadable | 2 |

`missing` and `stale` share exit 1 (both mean "regenerate"); the JSON `state`
field disambiguates them, satisfying the four-way distinction. Because the
fingerprint incorporates `CURRENT_SENTINEL_VERSION` (§13), a `fingerprint
matches` result already implies the sentinel version equals the current version;
no separate version-equality conjunct is needed. The two `error` sub-cases are
distinguished in `reason` (`collision` vs `invalid-config`) so §15 startup can
branch deterministically. The JSON envelope
(`--format json`) is:

```json
{
  "schemaVersion": 1,
  "state": "current|missing|stale|error",
  "exitCode": 0,
  "path": ".pi/sdlc/CONFIG.md",
  "sentinel": { "present": true, "wellFormed": true, "version": "v1",
                "recognized": true, "fingerprint": "<hex>" },
  "expectedFingerprint": "<hex>",
  "reason": "<bounded diagnostic>"
}
```

`check` **never writes** in any state (asserted by ASD9). Text mode prints one
`state`/`reason` summary line plus one line per report field, matching the
existing runner idiom (`sdlc-status`, `check-references`).

## 13. Sentinel, fingerprint, and collision recognition (normative)

**Sentinel.** The first physical line of a generated `CONFIG.md` is a
package-owned HTML comment:

```
<!-- pi-sdlc:config-doc v1 fingerprint=<64-hex> -->
```

Grammar: literal prefix `<!-- pi-sdlc:config-doc`, a version token matching
`v[0-9]+`, a single space, `fingerprint=` followed by 64 lowercase hex chars,
then `-->`. `CURRENT_SENTINEL_VERSION = "v1"`. The package also carries
`SUPPORTED_SENTINEL_VERSIONS` (the set of all package-issued versions; `{"v1"}`
now) used solely for the recognition boundary.

**Sentinel-version lifecycle (normative).** `SUPPORTED_SENTINEL_VERSIONS` must
include every render-format version ever shipped in a released pi-sdlc, so a
correctly-generated companion from any prior release stays *recognized generated
output* (and is safely `regenerated`, never `refused`). A version may be dropped
from the set only at a package **major**-version boundary, documented in the
release notes as a breaking change; `config-doc.sh write` (regenerate) is the
sanctioned upgrade path across a supported version, and `--force` is the only
path across a retired one.

**Recognition boundary** (identity, independent of freshness):

- **Recognized generated output** — first line matches the sentinel grammar and
  its version ∈ `SUPPORTED_SENTINEL_VERSIONS`. Such a file is treated as
  pi-sdlc-generated even when stale or body-edited.
- **Unrecognized consumer collision** — no sentinel, malformed sentinel, or a
  version outside `SUPPORTED_SENTINEL_VERSIONS`. Never silently overwritten.

**Fingerprint.** `fingerprint = sha256hex(CURRENT_SENTINEL_VERSION + "\u0000" +
canonicalJson(config))` (Node `crypto`, builtin). **`canonicalJson` is pinned**
so two implementations cannot disagree: recursively walk the validated config
object; for every object, build a new plain object whose keys are inserted in
ascending order under the default `Array.prototype.sort()` comparison (UTF-16
code-unit order); leave arrays in their existing order (recursing into their
elements); then `JSON.stringify` with no `space` argument. This is invariant to
source-file whitespace and key order but sensitive to values and to the
render-format version, so a config value change or a renderer-format bump both
produce a `stale` result. Body edits are additionally caught because `check`
compares the full body byte-for-byte to the expected render.

**`write`/setup action matrix:**

| On-disk state | `write` behaviour | reported `action` | exit |
|---|---|---|---|
| absent | render and create | `created` | 0 |
| recognized, current (fingerprint+body match) | no-op, retain byte-identical | `retained` | 0 |
| recognized, stale/body-edited | regenerate (replace; hand edits are unsupported and deliberately overwritten) | `regenerated` | 0 |
| unrecognized collision, no `--force` | refuse, do not write | `refused` | 3 |
| unrecognized collision, `--force` | overwrite | `forced` | 0 |

Repeated `write` on an already-`current` file is byte-identical and reports
`retained`.

## 14. `CONFIG.md` content contract (normative)

A generated `CONFIG.md` contains, in order:

1. the sentinel line (§13);
2. a **generated-file warning** stating the file is generated, that
   `sdlc.config.json` is authoritative, and that hand edits are unsupported and
   detected as stale;
3. **behaviour-first effective summary** — the resolved lifecycle shape by
   track: phase/gate strength, `separateSpec` behaviour, task validation,
   tracker threshold, panel floors/overrides, hooks, and configured
   integrations, derived only from the committed values;
4. **JSON-order key reference** — every persisted key in the config's JSON
   order: current value, what it makes the agent do, legal alternatives, and
   where an override changes the effective result. Covers every accepted
   schemaVersion-3 key;
5. **fingerprint + generator-format identity** (mirrors the sentinel) sufficient
   for deterministic freshness checking;
6. **regeneration and check instructions** (the exact `config-doc.sh write` /
   `check` invocations);
7. a short pointer to `references/system-reference.md`.

It must **not** reproduce the general lifecycle handbook or become
consumer-editable prose law. Rendering is deterministic: repeated generation
from the same config is byte-identical (ASD6).

---

# Group C — integration, startup, completeness

## 15. Non-blocking startup freshness behaviour (normative)

After `sdlc-status` returns ready (exit 0) and the existing announcement/hook
inventory has run, and **outside** FS8 readiness and FS9 lifecycle completion,
`SKILL.md` instructs the agent to invoke `config-doc.sh check`:

- **`current`** → read `.pi/sdlc/CONFIG.md` as the consumer-shape explanation;
- **`missing` or `stale`** → emit a **fixed warning**, read authoritative
  `sdlc.config.json`, continue under its values, and name the regeneration
  action (`config-doc.sh write`);
- **`error`** → branch on the `reason`: an unrecognized **collision**
  (`reason: collision`) means the config itself is valid, so emit the fixed
  warning, read authoritative `sdlc.config.json`, continue under its values, and
  name the regeneration action; an **invalid-config** `error`
  (`reason: invalid-config`) cannot occur here because FS8 readiness (exit 0)
  already guarantees `config.valid` — it is a dead branch at startup, and if it
  ever surfaces (a post-readiness race) the agent surfaces the diagnostic and
  stops rather than inventing a fallback;
- never treat generated prose as authority over JSON.

The fixed warning text is frozen by the Spec (a single line naming the state and
the `config-doc.sh write` regeneration action) and asserted by ASD10. **No
readiness state, FS8 check id/exit, FS9 lifecycle-check id, or CI requirement
changes.** `CONFIG.md` is never part of readiness, lifecycle completion, or
mandatory consumer CI.

## 16. FS11 extension: classification + structural discovery (normative)

The existing `normative-references.json` + `check-references.mjs` are extended
(no new manifest).

**Classification.** Each inventory row gains a required `class` field, one of:

1. `package-public` — package-owned public agent-facing surface;
2. `delegated` — delegated external skill/capability;
3. `runtime-tool` — required runtime tool;
4. `consumer-integration` — consumer-configured hook/integration;
5. `optional-enhancement` — optional enhancement;
6. `internal` — implementation internal.

The schema (`normative-references.schema.json`) adds `class` to the allowed keys
and its enum; `check-references.mjs` validates it. Coverage additions — rows for
every public surface the frozen discovery set below surfaces that the pre-change
inventory lacks, each classified: `references/system-reference.md`, all six
`references/phase-*.md`, all six `templates/sdlc-<slug>.md` entrypoints,
`config-doc.mjs`/`.sh`, the generated `CONFIG.md` surface (consumer-owned), and
the pre-existing-but-uninventoried public files the discovery roots now cover:
`skills/sdlc/scripts/check-lifecycle.sh`, `skills/sdlc/scripts/setup-sdlc.sh`,
`skills/sdlc/schema/sdlc.config.schema.json`, and
`skills/sdlc/schema/sdlc.config.example.json`. After these additions the frozen
discovery set is satisfiable against the pre-change inventory (the baseline
reference check is green), which is what makes ASD15's omission mutation
non-vacuous.

**Structural discovery (inverse completeness).** The inventory carries a
`discovery` block naming public roots/glob patterns and a **closed
internal-helper exclusion list**. Frozen discovery set:

- roots/patterns: `skills/sdlc/references/*.md`, `templates/sdlc-*.md`,
  `templates/setup-sdlc.md`, `skills/sdlc/scripts/*.sh`,
  `skills/sdlc/prompts/*.prompt.md`, `skills/sdlc/schema/*.json`;
- closed exclusion list (internal, not required in the inventory): the `*.mjs`
  implementations behind `*.sh` wrappers, `skills/sdlc/scripts/lib.mjs`, and any
  file explicitly classed `internal`.

The discovery patterns use only a single-segment `*` wildcard in filename
position (no recursive `**`, no character classes); matching is implemented with
`readdirSync` + an anchored `RegExp` — Node builtins only, honouring §19's
no-new-dependency rule.

`check-references.mjs` walks the discovery set, subtracts the exclusion list, and
asserts **every discovered public artifact has an inventory row**. A discovered
public artifact with no row → `fail`. Discovery never executes inventory data
(preserves the FS11-v1 offline guarantee). Removing an inventory row, a phase
explanation, or a public reference fails **non-vacuously** (ASD15).

## 17. Installed-consumer fixtures (normative)

A test fixture simulates an **installed** consumer: the package resolved at a
node_modules-style path and a separate consumer repo as cwd. It proves, using
only documented skill-relative/consumer-relative paths (never assuming package
== cwd):

- `references/system-reference.md`, all six `references/phase-*.md`, and all six
  `templates/sdlc-<slug>.md` resolve;
- every package-relative link inside those references resolves;
- the advertised `sdlc:<slug>` invocations map to existing templates;
- `.pi/sdlc/CONFIG.md` resolves consumer-relative.

## 18. Telemetry/setup merge contract (normative)

Both this stream and `feat/sdlc-lifecycle-telemetry` (lt-t2, FS5 side-effect
emission) edit `setup-sdlc.mjs`. The landing-second stream must **re-seed and
verify both** integrations after rebase:

- setup's `CONFIG.md` generation (this stream's `config-doc` write call site);
- setup's telemetry `record-run-event` call sites (the telemetry stream's).

Neither may be dropped merely because each branch's isolated tests pass. A merge
assertion (ASD20) verifies both call sites coexist in the merged `setup-sdlc.mjs`
(this stream owns nothing in `telemetry.mjs`).

---

## 19. Governance and non-functional requirements (normative)

- **ADR 0028** records the documentation authority hierarchy (§3) and the
  generated-explanation trust model (JSON authoritative; `CONFIG.md` explains,
  never overrides; safe degradation) — durable, surprising without context, and
  chosen after the monolith-vs-duplication trade-off.
- Programme/stream docs (`docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`, the
  IC-B and OL-C plans) gain notes making complete IC-B/OL-C absorption visible;
  prior disposition work is preserved as review input, not copied verbatim.
- No new runtime dependencies; Node builtins only; deterministic output;
  existing error-message style and exit-code idioms.
- Package-relative navigation matches pi's `references/` progressive-disclosure
  contract.
- Release: expected additive **feature** release unless the Specification's
  implementation discovers a genuinely breaking installed interface change;
  track irreversibility does not itself force a semantic-version major.
- Tests: `node --test` corpus + biome lint clean per repo CI; FS11 reference
  check, config schema check, and installed-consumer e2e fixtures pass.

## 20. Verification scenarios (falsifiable; `ASD<n>`)

Each DoD row of the Plan is covered; non-vacuity mutations are explicit.

**Group A — package law, routing, entrypoints:**

- **ASD1** (DoD 1): an installed-consumer test locates `system-reference.md`,
  all six `phase-*.md`, all six `sdlc:<slug>` entrypoint templates, and
  `.pi/sdlc/CONFIG.md` through only documented skill-relative/consumer-relative
  paths; none resolves via a cwd==package assumption.
- **ASD2** (DoD 2): `system-reference.md` contains every §5 checklist section;
  a mutation deleting any one section fails the section-presence test
  (non-vacuous).
- **ASD3** (DoD 3): each `phase-*.md` contains all nine §6 required headings and
  at least one explicit `under your configuration` callout routing to
  `CONFIG.md`/JSON; a phase reference stating a fixed track/gate without the
  callout fails.
- **ASD4** (DoD 4): committed `SKILL.md` is ≤ 220 physical lines and ≤ 16384
  bytes and contains no duplicated phase-mechanics section (no phase's
  entry/hook/gate/refusal mechanics block appears in `SKILL.md`).
- **ASD5** (DoD 4): the disposition ledger covers every pre-change `SKILL.md`
  normative statement and red flag; each row's destination reference exists and
  contains the moved statement's anchor text; removing a moved statement from
  its destination fails non-vacuously.
- **ASD12** (DoD 10): for each of the six entrypoints, the adopted and unadopted
  behaviours match the §9 table; the `sdlc:spec` stamp is structurally valid (a
  single `>`-prefixed line, no YAML/JSON, containing the disclosure phrases "no
  committed plan", "Not adopted", "checker-verified"); the `sdlc:pr-review`
  grounding disclosure is present; adopted-config-dominates is driven by the FS8
  `adoption.manifest-head` predicate, and an `sdlc-status` `error` stops the
  entrypoint rather than treating it as adopted.
- **ASD13** (DoD 10, negative): `sdlc:tasks` and `sdlc:implement` with absent
  upstream refuse-with-redirect in both adoption states and emit no fabricated
  scenario ids or check tables.

**Group B — setup, config explanation:**

- **ASD6** (DoD 5/6): `config-doc render` on a valid config is deterministic and
  byte-identical across runs; `write` twice is byte-identical; the rendered
  `CONFIG.md` contains all §14 sections and covers every schemaVersion-3 key in
  JSON order.
- **ASD7** (DoD 5): recognition boundary — a recognized-but-stale/body-edited
  `CONFIG.md` is `regenerated` by `write`; an unrecognized collision is
  `refused` (exit 3) without `--force` and `forced` (exit 0) with it; a byte
  matching `current` file is `retained`.
- **ASD8** (DoD 6): `CONFIG.md` declares JSON authority, carries the
  generated-file warning, the fingerprint/format identity, valid
  `write`/`check` regeneration guidance, and the system-reference pointer.
- **ASD9** (DoD 7): `check` returns `current`/`missing`/`stale`/`error` for the
  four constructed inputs; it detects a config-value change, a body edit, and a
  render-format-version change as `stale`/mismatch; `check` mutates nothing in
  any state.
- **ASD11** (DoD 9): the setup template names each concept it must explain
  (kernel, tracks, gate modes, consequences, two core decisions); the
  `setup-sdlc.mjs` TTY fallback asks ≤ 3 interactive prompts (two decisions +
  confirmation); every dial is reachable non-interactively by flag.

**Group C — integration, completeness, non-changes:**

- **ASD10** (DoD 8): startup reads `CONFIG.md` when `check` is `current`; emits
  the frozen warning and falls back to JSON on `missing`/`stale`; surfaces the
  diagnostic and falls back on `error`; never treats prose as authority over
  JSON. FS8 readiness and FS9 result contracts are unchanged by this behaviour.
- **ASD14** (DoD 11): every inventory row carries a valid `class`; the six
  taxonomy values are all represented across the inventory; structural discovery
  over the §16 roots minus the closed exclusion list finds a row for every
  public artifact.
- **ASD15** (DoD 11, non-vacuity): adding an undocumented public artifact under a
  discovery root (with no inventory row) fails discovery; removing an existing
  inventory row, phase reference, or public link fails the reference check and
  the installed-consumer test.
- **ASD16** (DoD 12): a test derives every answer of the §5 source-free
  comprehension checklist from docs only, reading no implementation file; and
  asserts no reference/doc claims implementation work itself can avoid source
  inspection.
- **ASD17** (DoD 13): ADR 0028 exists and states the authority hierarchy + trust
  model; the programme and IC-B/OL-C plan docs carry absorption notes; the docs
  assert #91/#101/#102 remain independent and out of scope.
- **ASD18** (DoD 14): the full `node --test` corpus, biome lint, FS11 reference
  check, config schema check, and installed-consumer e2e fixtures pass.
- **ASD19** (explicit non-changes): `sdlc-status` FS8 check ids/exits,
  `check-lifecycle` FS9 check ids/exits/declaration grammar, config
  schemaVersion **3** and `sdlc.config.schema.json`, `resolve-panel` behaviour,
  and panel/ceremony/track law are byte-identical to baseline; #91/#101/#102
  scopes are untouched.
- **ASD20** (telemetry merge; landing-order conditional): at this stream's own
  merge it asserts the `config-doc` write call site is present in
  `setup-sdlc.mjs` and that any already-landed telemetry `record-run-event` call
  sites are preserved. The full both-coexist assertion binds whichever of this
  stream and `feat/sdlc-lifecycle-telemetry` rebases second; that stream
  re-seeds and verifies both call sites.

## 21. Context for Build

Slice at least these task seams (Build owns final decomposition):

1. **A1 — package docs + skill routing + disposition** (Group A §§2–8): create
   `system-reference.md` and six `phase-*.md`; slim `SKILL.md`; produce the
   disposition ledger; ADR 0028 + programme/plan absorption notes.
2. **A2 — standalone entrypoints** (§9): six `templates/sdlc-<slug>.md` routers
   with the #38 table, stamp, adopted-config-dominates, and pr-review grounding.
3. **B1 — `config-doc` module** (§§11–14): renderer/write/check, sentinel,
   fingerprint, collision matrix, `CONFIG.md` content.
4. **B2 — setup integration + interview** (§10, §18): agent-led template,
   reduced TTY fallback, setup's `config-doc` write call site (preserving
   telemetry call sites on rebase); this repo's committed `.pi/sdlc/CONFIG.md`.
5. **C1 — startup + FS11 + installed-consumer e2e** (§§15–17): startup check
   wiring in `SKILL.md`; FS11 classification + structural discovery; installed
   fixtures; the telemetry merge assertion.

Each Build task names its check commands and the `ASD<n>` scenario ids it
satisfies, per the frozen scenarios above. If the §4 SKILL ceiling proves
infeasible while retaining all kernel responsibilities, A1 halts and returns to
Plan with the evidence rather than shipping over-cap. One Specification and one
human approval remain appropriate because all three groups jointly define one
coherent agent reading interface.
