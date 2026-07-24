# pi-sdlc system reference

> The agent-facing system map for pi-sdlc. It answers, from documentation alone,
> what the product is and how to operate its public interface — without reading
> implementation source. It is explanatory and links canonical law rather than
> restating it; detailed per-phase mechanics live in the six
> `references/phase-*.md`. All paths are skill-relative and resolve from an
> installed consumer repository.

## 1. Purpose

pi-sdlc is a portable, project-agnostic software-development lifecycle skill for
pi. It gives a change **one predictable way to enter the codebase**: an enforced
sequence of brainstorm → plan → spec → build → implement → PR review, with
per-phase adversarial review panels and per-task deterministic validation,
driven by a small per-project manifest (`.pi/sdlc/sdlc.config.json`). It is a
framework a repository *adopts*, not a global default.

## 2. Kernel — invariant guarantees and the two tracks

The **iron law** fixes what may not be skipped forward. Backward moves —
returning to an earlier phase when a later one exposes a flaw — are always
allowed and never penalised: the sunk cost of an earlier gate never justifies
shipping a known-wrong design.

Two tracks:

- **Irreversible** — a change that freezes a shape other code, data, or
  extensions bind to: public interfaces, contracts, persisted schemas, wire
  formats, stored-record shapes. Requires brainstorm, plan, spec, build,
  implement, PR; a plan panel **and** a spec panel run pre-PR.
- **Reversible (fast path)** — everything else (internal refactors, docs, tests,
  tooling). Requires brainstorm (may be brief), plan, build, implement, PR; no
  pre-PR design panel, but the PR panel still runs.

When in doubt, use the repo's committed `shape.defaultTrack` (default
`irreversible`). The kernel and the sequence are owned by `SKILL.md`.

## 3. Adoption & readiness

A repository has **adopted** the sdlc when its current `HEAD` commit contains
`.pi/sdlc/sdlc.config.json` — a manifest merely present on disk (untracked,
staged, or ignored) is not adoption. Being **ready** to run under law needs more:
the active manifest must also be clean and valid, its merged `panels` roster
present and valid, and any `.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8,
ADR 0016) proves all of this mechanically with four states (`ready`,
`not-adopted`, `error`, `not-ready`). `SKILL.md` owns the four-state startup
branch table and its exit codes; this reference does not restate the FS8 check
ids or exits.

**Advisory mode** is the escape hatch when a repo has not opted in but the user
still wants sdlc guidance for one session, with the user's explicit in-session
consent. In advisory mode: never use any `announce` string and never claim the
session runs "under law"; prefix every phase marker with `advisory:`; follow the
phase sequence as guidance only; and MUST NOT create or mutate tracker objects,
MUST NOT claim any gate as passed, and MUST NOT stamp panel agents. An `error`
state is never silently downgraded to advisory mode — advisory is not a bypass.
To opt in, run `/setup-sdlc` (see §8).

## 4. Tracks, phases, transitions, gates, refusal

The lifecycle sequence at a glance (the phase/gate table states the **maximal**
shape; which gates actually run, and at what strength, is the repo's committed
config — see §6 and each phase reference's `under your configuration` callouts):

| Phase | Artifact | Detailed contract |
|---|---|---|
| Brainstorm | agreed design (or a map issue) | `references/phase-brainstorm.md` |
| Plan | objectives, rationale, scope, DoD, next-agent context | `references/phase-plan.md` |
| Spec | contracts, interfaces, surface area, falsifiable scenarios | `references/phase-spec.md` |
| Build | task breakdown with checks + scenario ids | `references/phase-tasks.md` |
| Implement | code and tests | `references/phase-implement.md` |
| PR review | the diff, driven to a clean panel | `references/phase-pr-review.md` |

Transitions run forward through the sequence; backward transitions are always
permitted. Gates: `review.design` gates Plan+Spec, `review.code` gates the PR,
`review.tasks` sets per-task validation, `review.brainstorm` sets the brainstorm
gate; per-track `overrides` may adjust them. Refusal and backward behaviour for
each phase is documented in that phase's reference. The shared panel run-shape
(resolve → dispatch → consolidate → adjudicate → stop) is owned by
`references/phase-pr-review.md`, "Panels".

## 5. Public composition inventory (FS11 taxonomy)

The complete public interface is inventoried and completeness-checked by FS11
(`assets/normative-references.json` + `scripts/check-references.mjs`). Every row
carries a `class`:

- **`package-public`** — package-owned public agent-facing surfaces: `SKILL.md`,
  `references/system-reference.md`, the six `references/phase-*.md`, the six
  `templates/sdlc-<slug>.md` standalone entrypoints, `templates/setup-sdlc.md`,
  the `scripts/*.sh` command wrappers (readiness, lifecycle checking, panel
  resolution/stamping, task validation, reference checking, config-doc), the
  `schema/*.json` schemas/examples, and the four `prompts/*.prompt.md` reviewer/
  validator roles.
- **`delegated`** — delegated external skills: `adversarial-review`,
  `dispatch-subagents`, `gh-pr-review-comments`, `sdlc-visual-docs`.
- **`runtime-tool`** — required runtime tools (e.g. `git`, `gh`, `node`).
- **`consumer-integration`** — consumer-configured hooks/integrations: the
  `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
  consumer `.pi/sdlc/CONFIG.md`.
- **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
  rendering, an interactive question-answering aid).
- **`internal`** — implementation internals: the `*.mjs` implementations behind
  `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
  and are not catalogued file by file.

FS11 also carries a `discovery` block naming public roots/glob patterns and a
closed internal-helper exclusion list; `check-references.mjs` walks the discovery
set, subtracts the exclusion list, and asserts every discovered public artifact
has an inventory row (inverse completeness). See `references/phase-*.md` for how
each surface is used, and §10 for the source-inspection boundary.

## 6. Configuration & extension surfaces

- **`sdlc.config.json`** (schemaVersion 3) — the authoritative manifest. It owns
  the configured values; the phase references route every configuration-dependent
  branch to it via `under your configuration` callouts. Its shape is documented in
  `schema/sdlc.config.schema.json` and `schema/sdlc.config.example.json`.
- **`.pi/sdlc/CONFIG.md`** — the generated consumer companion that *explains* the
  effective shape of the committed config. JSON is authoritative; `CONFIG.md`
  explains, never overrides. It is generated/regenerated/checked by the
  `config-doc` module (`scripts/config-doc.sh render|write|check`). Startup reads
  it when current and falls back to authoritative JSON when it is missing, stale,
  or an unrecognized collision (see `SKILL.md`, startup freshness).

### Hooks (local workflow)

A repo may declare local workflow actions in the `hooks` object of
`sdlc.config.json`, so the global process stays identical everywhere while each
repo layers on its own ways of working. Hook phase keys are the six lifecycle
names — `brainstorm`, `plan`, `spec`, `build`, `implement`, `pr` — plus `*`
(every phase). This vocabulary is distinct from the four review-panel phases and
must not be conflated. Each phase key carries optional `before`/`after` arrays of
hook items; each item is exactly one of:

- `{ "run": "<command>" }` — a shell command the agent executes verbatim.
- `{ "use": "skill:<name>" | "tool:<name>", "do": "<intent>" }` — an instruction
  the agent interprets: `tool:<name>` invokes that tool with `do` as the intent
  (missing tool = hook failure); `skill:<name>` loads that skill and performs `do`
  per its instructions (missing skill = hook failure). The `do` text is the
  acceptance criterion.

**Ordering.** `before` hooks fire `*` items first, then phase-specific; `after`
hooks fire phase-specific first, then `*`. Within a list, array order.

**Failure.** A failed or skipped `before` hook **blocks** the phase (report, then
retry, ask, or move backward — do not enter the phase). A failed `after` hook
**warns**: recorded, never blocking.

**Working directory.** A `run` hook executes from the session's current working
root at fire time — the consumer root unless a hook or workflow has legitimately
moved it (e.g. a `before` hook entered a worktree; a worktree is a checkout of the
same repo, so repo-relative commands still resolve). If your workflow uses
worktrees: creating one is not enough — the session's working root must move into
it (create-then-enter). Writing to the main checkout after creating a worktree is
a red flag.

**Announce-on-fire (the audit trail).** Before executing any hook and after it
completes, emit exactly:

```
[sdlc hook] <phase>:<before|after> run$ <command>
[sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
[sdlc hook] <phase>:<before|after> result: ok
[sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
```

A transcript that enters a phase whose `before` hooks lack these lines is a
violation. Hooks are prose law executed by the agent — the same enforcement model
as the iron law; there is no mechanical runner.

**Trust boundary.** `run` hooks execute arbitrary shell commands with the agent's
privileges, from a committed file. They sit inside pi's existing project-trust
boundary: enabling hooks for a repo means trusting that repo's config, exactly as
you already must for `.pi/prompts` and project settings. The agent always echoes
the exact command before running it, and the scaffolder warns whenever it writes a
`run` hook.

### `workflow.md` (prose layer)

An optional `.pi/sdlc/workflow.md` carries local ways-of-working that don't
decompose into hooks (e.g. "no risky merges on Fridays"). At announce, enumerate
each top-level bullet (first line, truncated to 80 chars). The gate/process
conflict rule is owned by `SKILL.md`: *gates* always resolve to the global rule
(local rules may ADD gates, never remove or weaken them); *process* — everything
else — resolves to the local rule.

### Tracker

A project with a `tracker` block can use the two tracker-backed modes (Brainstorm
map mode, Build epic/sub-issue/board). All mutation and board mechanics are owned
once by `assets/tracker-ops.md`.

### Skills and tools are enhancements, not dependencies

Any skill or tool the agent reaches for opportunistically — web research,
codebase exploration, a richer rendering surface, anything named anywhere in
this documentation as a way to do a phase better — is an enhancement, never a
hard dependency a phase blocks on. When it is missing, degrade to the plain
fallback (a direct read/grep for missing research tooling, plain structured
prose for a missing richer surface) and say so, rather than stopping or
refusing to proceed.
Name no external tool as a shipped dependency of the skill itself. **This rule
does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
deliberate, load-bearing contract with the failure semantics above (before=block,
after=warn); a missing `use:` tool/skill on a configured hook is a hook failure,
full stop.

## 7. Artifacts & durable evidence

- **Plan / Spec / Build docs** under the configured `paths.plans` / `paths.specs`.
- **Review artifacts** under `paths.reviews`: one file per model, the shared
  `prompt.md`, and a `consolidated.md` with the adjudication and orchestrating
  model.
- **Validation receipts** under `docs/reviews/task-validate-<feature>-<task-id>-<date>/`,
  verifiable with `scripts/verify-task-receipt.mjs`.
- **Tracker projection** (epic + sub-issues + board) — a live, resumable
  projection of the committed build-plan doc, never the source of truth.
- **ADRs** under `docs/adr/` (see §10, governance).

## 8. Normal full-lifecycle operation and the six standalone entrypoints

**Normal operation:** run `sdlc-status`; on ready, announce and proceed through
brainstorm → plan → spec → build → implement → PR, loading each phase's
`references/phase-*.md` when that phase begins.

**Standalone entrypoints** (`sdlc:<slug>`) let an agent enter a single phase
directly through package-owned prompt templates `templates/sdlc-<slug>.md` — one
lifecycle skill's shared named surfaces, **not** six independently discovered
skills (that is #101). The six slugs are `brainstorm`, `plan`, `spec`, `tasks`,
`implement`, `pr-review`. Their adopted/unadopted degradation contract, the
`sdlc:spec` sampling stamp, and the adopted-config-dominates switch are documented
where each template lives; the switch is driven by the FS8 `adoption.manifest-head`
predicate (an `sdlc-status` `error` stops the entrypoint rather than treating it as
adopted). `sdlc:tasks` and `sdlc:implement` never fabricate scenario ids or check
tables for absent upstream, in any adoption state. See each `references/phase-*.md`
"Purpose and invocation modes" and the `templates/sdlc-<slug>.md` routers.

## 9. Advanced modes

- **Map mode** (Brainstorm, wayfinder-lite) for oversized/foggy efforts — see
  `references/phase-brainstorm.md`, "§9", and `assets/tracker-ops.md`.
- **Tracker-backed Build** (epic + sub-issues + board) above the committed
  `shape.publishToTracker` threshold — see `references/phase-tasks.md`, "§9".
- **Visual gate artefacts** — gate artefacts may be rendered into a self-contained
  interactive HTML view (traceability matrix, contract panel, risk map, DoD
  coverage) with the global `sdlc-visual-docs` skill: declare node IDs in headings
  and edge triples in front matter, then `lint.mjs` / `render.mjs`. This is a
  pointer, not a dependency: renders are ephemeral, never committed as a
  requirement, and never CI-checked.

## 10. Operational troubleshooting and the source-inspection boundary

- **Not ready?** Run `sdlc-status --format json` and read the failing check's
  remediation. When `config.schema-current` fails, the sanctioned actions are to
  pin the older skill release, or re-run `setup-sdlc` (`--force` to replace) —
  there is no pre-adoption config fold-forward. Never hand-edit `schemaVersion` or
  the config shape.
- **Stale `CONFIG.md`?** Run `scripts/config-doc.sh write` to regenerate; startup
  falls back to authoritative JSON meanwhile.
- **Source-inspection boundary.** Source is read **only when changing
  implementation**. Understanding and operating the public interface — everything
  in this reference and the phase references — never requires opening
  implementation source or configuration schemas. Implementation work itself does
  require source inspection; no reference claims otherwise.

Governance: when a decision made anywhere in the lifecycle is hard to reverse,
surprising without context, and the result of a real trade-off — all three — write
it to `docs/adr/` immediately (see `docs/adr/README.md`). Existing flat
locked-decisions lists in a project's governing docs are historical record and are
not migrated. The documentation-authority hierarchy and the generated-explanation
trust model are recorded in ADR 0029.

## 11. Next-read routing (authority map)

| Question | Canonical answer |
|---|---|
| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
| What global law and sequence apply? | `SKILL.md` kernel/router |
| What does this phase require? | The corresponding `references/phase-*.md` |
| What values has this repository chosen? | `sdlc.config.json` |
| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
| What implementation realizes a surface? | Source, only when implementation work requires it |
| How does any phase ask the human for input? | "Presenting questions to the human" (this file) |

## 12. Lifecycle telemetry (FS13)

Every instrumented run keeps a durable manifest of its own lifecycle at
`.pi/sdlc/runs/<slug>/events.jsonl` (git-ignored; the sibling `sdlc-retro`
skill distills it into a committed post-mortem — see that skill's SKILL.md
for the collect/render pipeline once the run store has anything to distill).
Emission is fail-soft everywhere (an unresolvable run identity or an
unwritable store degrades to one stderr warning, never a behavioural change)
and additive-only to every frozen FS5 contract (ADR 0028). No *emission*
invocation ever writes to stdout; a rejected event or payload's stderr
diagnostic names the nearest known event (for a mistyped event name) or the
exact expected `--payload` template (for a missing/malformed field), so a
miss self-corrects in one bounce instead of a reload-the-docs guessing loop.
Two informational-only flags — `--list` (the known-event vocabulary) and
`--describe <event>` (that event's full invocation template) — print to
stdout, exit 0, and never resolve run identity or touch the run store; use
them to discover the exact shape before emitting rather than guessing from
memory.

Record these prose-emitted inflection points with
`scripts/record-run-event.sh <event>` (relative to this loaded skill;
headless: `node <skill-dir>/scripts/record-run-event.mjs <event>`) and its
event-type payload:

- **Run start**: once, right after the readiness gate confirms this repo is
  ready and before announcing —
  `record-run-event.sh run.started --payload '{"title":"<feature title>","track":"<irreversible|reversible>"}'`.
- **Every phase entry**: on entering brainstorm/plan/spec/build/implement/pr —
  `record-run-event.sh phase.entered --payload '{"phase":"<phase>"}'`.
- **Every human gate approval**: when the human approves a phase's gate —
  `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
- **Panel dispatch**: immediately after dispatching a design or PR panel —
  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<wave>,"models":[...]}'`
  — and, harvest-at-dispatch, immediately preserve its artifacts with
  `scripts/harvest-panel.sh --phase <panelPhase> --round <label> [--wave <wave>] --from <asyncDir>`
  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
  Two distinct numbers appear here on purpose: `<wave>` is the **logical
  review-wave counter** — a replacement dispatch for an infra-failed reviewer
  belongs to its original wave and carries that wave's `<wave>` in the `round`
  payload field of both the dispatch and consolidation events and in
  `harvest-panel --wave`. `<label>` is the harvest `--round` **destination
  allocation label**, which may advance past the wave to avoid overwriting a
  prior snapshot (see `references/phase-pr-review.md`, "Harvest-at-dispatch");
  it defaults to `<wave>` when omitted. `harvest-panel` records both in a
  `meta.json` sidecar so the collector groups same-wave rounds without parsing
  prose; still note any label↔wave divergence in that wave's `consolidated.md`
  for human readers.
- **Panel consolidation**: after adjudicating a round's findings —
  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<wave>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
- **Caller-side lifecycle-check recording**: right after running
  `check-lifecycle` (itself untouched, FS9) —
  `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
- **PR open**: right after opening the PR —
  `record-run-event.sh pr.opened --payload '{"number":<n>}'`.
- **Fix wave**: after addressing a post-PR reviewer concern with a commit —
  `record-run-event.sh pr.fix_wave --payload '{"number":<n>,"sha":"<short-sha>"}'`.

`resolve-panel.sh`, `ensure-panel-agent.sh`, and `validate-task.sh` emit their
own events automatically (`panel.resolved`, `panel.agent_stamped`,
`task.validated`) after successful completion — nothing to do beyond passing
`--slug` when it isn't resolvable from the current git branch. Per-task
validator dispatch also harvests: immediately after a `task_validate`
subagent completes, run `scripts/harvest-panel.sh --phase task_validate
--round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.

## 13. Stall detection and self-resume

This applies in any phase, live or dispatched, not only Spec. A provider or
transport failure can exhaust its own retries and go quiet — empty assistant
turns, a `stopReason: error`, no further output — leaving the human as the
only thing watching for it. Don't wait for that: after **2 consecutive
turns** end this way (an error-terminated turn with no assistant content),
treat it as a stall, not a stop, and self-issue a continuation/retry before
reporting anything as blocked. Only report a stall to the human if the
self-issued retry also fails.

This is an interim, prose-level mitigation, not a substitute for a genuine
fix: the real fix is a harness-level visible "stalled — retryable" signal and
true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
project does not own or ship. Treat this section as covering the gap until
that exists upstream, not as the final word.

## 14. Presenting questions to the human

Every phase asks the human for input the same way. This section is the single
owner of that contract; each `references/phase-*.md` layers a phase-shaped
delta on top and never restates it. The contract is deliberately
**tool-agnostic**: it depends on no plugin or helper, degrades to plain prose
in any environment, and is by construction the structure an interactive
answering aid extracts well — so no environment detection is ever needed.

**The block.**

- All questions for the human go in **one numbered block, as the last thing in
  the reply** — never scattered through prose.
- One distinct question per numbered item, one question per sentence — no
  compound questions.
- Add a one-line context only when the bare question alone is ambiguous.
- When alternatives exist, list them as a numbered list under the question.
  Never fabricate alternatives — no invented yes/no framing of a genuinely
  open question.
- Mark at most one option per question **"Recommended — because <reason>"**.
  Never a recommendation without a reason; never a fabricated recommendation
  when genuinely neutral.

**The budget.** At most **3–5 blocking questions per turn**: a soft cap
applied with judgment, uniform across phases. A phase delta may only lower it,
never raise it. Overflow **demotes** to a lower tier — it never lengthens the
block.

**The triage tiers.** Every candidate question lands in exactly one:

- **Blocking** — asked now, in the block.
- **Assumption** — not asked; stated explicitly ("Proceeding on the assumption
  that X — object now if wrong"). Where the phase has an artifact, assumptions
  are written into it so the gate ratifies them (see the phase deltas).
- **Parked** — recorded as one line with its destination ("parked to Spec")
  and carried forward in the phase's context for the next agent.

**Never ask a repo-discoverable fact.** A legitimate question is about intent,
priorities, or external state only the human knows. A question about what the
code, config, or docs currently do means the reading was skipped — read first,
using the degraded research fallbacks above when richer tooling is missing.

