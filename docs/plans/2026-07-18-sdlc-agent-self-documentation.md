# Plan: agent self-documentation for pi-sdlc

- Date: 2026-07-18 (rev 2)
- Revision history: rev 1 was the pre-panel draft. Rev 2 incorporates every high
  and medium Plan-panel finding plus both low findings: it restores the full
  IC-B setup-interview scope and full OL-C standalone-entrypoint/adopted-config
  scope, pins generated-file recognition, makes FS11 omission discovery
  mechanical, defines configuration-relative phase prose, adds the telemetry
  merge contract, and makes the skill-size and single-Spec structure
  falsifiable.
- Track: **irreversible**. This change adds installed public documentation and
  configuration-explanation surfaces, assigns canonical ownership for normative
  phase law, and changes the interface agents rely on to enter and navigate the
  lifecycle. It does not change the configuration schema or lifecycle ceremony.
- Brainstorm: plain dialogue on 2026-07-18, approved by Neil Chambers. The
  approved direction is a package-level system reference plus phase references,
  together with a generated consumer `CONFIG.md`; JSON remains authoritative. A
  strict-YAML migration is deferred to #102 and lifecycle decomposition into
  distinct phase skills is deferred to #101.
- Programme relationship: this stream fully absorbs **IC-B** from the
  config-intent-vocabulary plan and **OL-C** from the opt-in-lifecycle plan.
  Their complete accepted scope remains binding here: IC-B's generated
  explanation, drift check, agent-led setup interview, and reduced TTY fallback;
  OL-C's kernel-first skill surface, supporting references, six standalone
  entrypoints, and adopted-config-dominates behaviour. They will not ship as
  separate streams. This plan is the canonical umbrella where those earlier
  plans overlap.
- Related but independent: #91 owns phase-specific agent definitions and
  author-model preferences; this stream documents the current public composition
  without choosing that design.
- Human gate: Plan rev 2 approved by Neil Chambers on 2026-07-18 after the
  two-model Plan panel reached its stop condition.

## Objective

Make pi-sdlc self-documenting for agents. From installed package documentation
plus a consumer repository's committed adoption artifacts, an agent must be able
to understand:

- what pi-sdlc is and what its invariant kernel guarantees;
- how adoption and readiness work;
- the tracks, lifecycle phases, transitions, artifacts, gates, and refusal
  rules;
- the consumer's effective configuration and the behavioural consequence of each
  value;
- every public skill, command, prompt role, configured integration, delegated
  dependency, and advanced mode it may need to invoke;
- where to read next for the current phase;

without opening implementation source or configuration schemas merely to
understand the product.

Source inspection remains appropriate when changing implementation. The
documentation contract covers use and operation of the public interface, not
implementation internals.

## Rationale

The package already contains substantial prose, but it is not an effective
documentation module:

1. `SKILL.md` combines startup law, configuration interpretation, six phase
   disciplines, panel mechanics, validation, tracker modes, hooks, and PR
   completion in one large instruction surface. A newly grounded agent must load
   unrelated phase detail to discover the system's shape.
2. The root README is oriented toward installation and human readers. It is not
   a complete agent-facing system map.
3. The JSON manifest states values but does not explain their behavioural
   consequences, alternatives, or effective track-specific shape. Understanding
   it currently requires cross-reading the schema, implementation, and long-form
   skill prose.
4. Public commands, prompt roles, delegated skills, and optional/configured
   dependencies are described in several places without one complete
   public-surface inventory.
5. IC-B and OL-C already planned pieces of the solution. Delivering them
   separately would create a third explanatory layer and duplicate normative
   law.

The deep-module seam is the installed documentation interface: agents learn a
small reading protocol and receive the lifecycle's full public behaviour behind
it. The deletion test is satisfied because removing this interface would
redistribute system discovery across the skill, schema, scripts, prompts, and
source implementation.

## Design principles

1. **Progressive disclosure.** Startup loads only the kernel, effective consumer
   shape, and routing instructions. Detailed phase law is loaded when that phase
   begins; the full system reference is available for orientation and
   cross-phase questions.
2. **One canonical owner per normative statement.** The kernel and sequencing
   law stay in `SKILL.md`; detailed invariant phase contracts live in phase
   references; consumer JSON owns configured values; generated `CONFIG.md`
   explains but never overrides those values. Phase references identify every
   configuration-dependent branch and route it to the effective consumer shape
   instead of assuming a track, gate mode, panel floor, or separate-Spec
   setting. Explanatory references link rather than silently restate canonical
   law.
3. **Public-interface completeness, not file-tree completeness.** Everything an
   agent may invoke, configure, load, or depend upon is documented. Internal
   helpers are summarized as implementation and are not catalogued file by file.
4. **Deterministic generated explanation.** `CONFIG.md` is rendered only from
   the committed JSON data and package-owned explanation vocabulary. It is never
   a second editable configuration surface.
5. **Safe degradation.** Missing, stale, or unreadable generated documentation
   never blocks an otherwise-ready repository and is never silently trusted. The
   agent warns, falls back to authoritative JSON, and names the regeneration
   action.
6. **Package-relative navigation.** All package references use skill-relative
   paths and remain valid from an installed consumer repository, matching pi's
   skill progressive-disclosure contract.
7. **No format churn.** JSON remains the sole authoritative manifest for this
   stream. Comments/YAML and dual-format support are out of scope.

## What this delivers

### 1. A package-level system reference

Ship one obvious agent-facing system map within the installed skill's on-demand
reference area. It explains the complete public interface at conceptual depth:

- purpose, kernel, adoption/readiness, tracks, and lifecycle sequence;
- authority/read-order map showing which artifact answers which question;
- the six phases at a glance, with links to their detailed contracts;
- public component inventory using the taxonomy below;
- configuration and extension surfaces;
- artifacts and durable evidence;
- normal full-lifecycle operation and standalone phase entrypoints;
- advanced map/tracker-backed modes;
- operational troubleshooting and source-inspection boundary.

It is explanatory, not a second copy of detailed phase law.

### 2. Six canonical phase references

Ship one concise, package-relative reference for each lifecycle phase:
Brainstorm, Plan, Specification, Build/Tasks, Implement, and PR Review. Each
phase reference owns the detailed public contract for that phase and states:

- purpose and invocation modes;
- entry conditions and authoritative upstream inputs;
- configured before-hook order and blocking semantics;
- required activity and artifact/output shape;
- the invariant gate/approval seam plus explicit `under your configuration`
  branches routed to current `CONFIG.md` or authoritative JSON, never a silently
  assumed track or maximal shape;
- refusal and backward-transition behaviour;
- after-hook order and warning semantics;
- completion evidence and next transition;
- advanced-mode pointers where applicable.

`SKILL.md` retains the cross-phase kernel and sequence, then routes to the
current phase reference instead of duplicating its detailed mechanics. Moving
prose must use a disposition audit so no current normative statement is silently
dropped or owned twice.

These references document phases; they do not turn phases into separately
discovered skills. That architectural decision belongs to #101.

### 3. A slimmer kernel-first `SKILL.md`

Restructure the installed skill into the small interface every lifecycle session
must learn:

- readiness branching and announcement law;
- invariant kernel and forward/backward transition law;
- effective-shape reading protocol;
- authority map and public reference pointers;
- phase sequence and phase-reference loading rule;
- cross-phase red flags and conflict rules;
- delegation pointers that genuinely apply across phases.

The frontmatter remains specific enough for pi to discover the skill for
lifecycle work. References are relative to the skill directory, as required by
pi's skill model.

### 4. Generated consumer `.pi/sdlc/CONFIG.md`

Setup generates a committed companion explanation from `sdlc.config.json`. JSON
remains authoritative. The generated document contains both approved views:

1. **Behaviour-first effective summary**: resolved lifecycle shape by track,
   including phase/gate strength, separate-Spec behaviour, task validation,
   tracker threshold, panel floors/overrides, hooks, and integrations.
2. **JSON-order key reference**: every persisted key's current value, what it
   makes the agent do, legal alternatives, and where an override changes the
   effective result.

It also contains:

- a generated-file warning;
- source/configuration fingerprint and generator-format identity sufficient for
  deterministic freshness checking;
- regeneration and check instructions;
- a short pointer to the installed package system reference.

It does not reproduce the general lifecycle handbook or become consumer-editable
prose law.

Setup behaviour must be safe for fresh and existing adopters. It creates or
refreshes recognized generated output, retains current output when identical,
and refuses to overwrite an unrecognized consumer-authored collision without
explicit sanctioned action. The plan-level recognition boundary is a
package-owned generated sentinel carrying a supported render-format identity: a
file with that valid sentinel remains recognized generated output when stale or
body-edited, while a missing, malformed, or unsupported sentinel is an
unrecognized consumer collision and is never silently overwritten. Hand edits to
recognized generated output are unsupported and are detected as stale;
deliberate regeneration may replace them. The Specification freezes the sentinel
grammar, refusal exits, and exact overwrite modes.

### 5. Deterministic render, regeneration, and check interface

Expose one deep configuration-documentation module with a small public interface
capable of:

- rendering the expected Markdown from validated configuration without mutating
  the repository;
- writing/regenerating the companion deliberately;
- checking whether the companion is current;
- returning bounded, deterministic current/missing/stale/error results suitable
  for setup, agent startup, tests, and optional CI.

The same renderer is used by setup, regeneration, and checking. There is no
separate prose template path that can disagree with the check.

Exact command names, exit codes, output envelopes, fingerprint algorithm, and
collision recognition are frozen by the Specification rather than guessed in
this Plan.

### 6. Non-blocking startup freshness behaviour

After `sdlc-status` returns ready and the normal announcement/hook inventory has
run, the skill invokes the lightweight companion check:

- **current**: read `CONFIG.md` as the consumer-shape explanation;
- **missing or stale**: emit a fixed warning, read authoritative
  `sdlc.config.json`, continue under its values, and name the regeneration
  action;
- **checker error**: surface the bounded diagnostic, fall back to validated JSON
  where safe, and continue unless an existing readiness condition independently
  blocks;
- never treat generated prose as authority over JSON.

This is deliberately outside FS8 readiness and FS9 lifecycle completion. No
readiness state, lifecycle-check id, or CI requirement changes in this stream.

### 7. Agent-led explanatory setup

Complete IC-B's setup teaching surface. The packaged setup template leads the
conversation and explains, before eliciting choices:

- the invariant kernel and the difference between lifecycle law and configurable
  scaffolding;
- tracks and the irreversible/reversible distinction;
- what `panel`, `advisory`, `human`, and `off` mean in practice;
- the consequences of separate Specification, tracker publication,
  task-validation, and shortfall choices;
- essentially two owner decisions: who reviews designs and who reviews code.

Everything else is defaulted and explained rather than presented as a jargon
quiz. The script keeps complete non-interactive flags for every dial, while its
headless TTY fallback asks no more than the two core decisions plus
confirmation. Setup finishes by explaining the generated JSON and `CONFIG.md`,
the commit/adoption step, and readiness verification.

### 8. Six standalone phase entrypoints and adopted-config-dominates

Complete OL-C's ratified #38 invocation surface without pre-empting #101. One
packaged lifecycle skill exposes named entrypoints for `sdlc:brainstorm`,
`sdlc:plan`, `sdlc:spec`, `sdlc:tasks`, `sdlc:implement`, and `sdlc:pr-review`
through package-owned prompt/named-invocation surfaces sharing the same
canonical phase references; this stream does not create six independently
discovered skills.

Their behaviour remains the ratified #38 contract:

- Brainstorm and Plan can run without committed upstream artifacts.
- Specification may stamp-and-interview only in an unadopted repository; an
  adopted repository with no committed Plan refuses and redirects.
- Tasks and Implement always refuse and redirect when their committed
  scenario/check-bearing upstream is absent; they never fabricate scenario ids
  or checks.
- PR Review may offer an optional grounding prompt when unadopted and runs under
  committed review configuration when adopted.
- The sampling stamp remains plain prose and never becomes a parsed lifecycle
  artifact.
- **Adopted-config-dominates** is the binary switch: when the ratified
  adopted-config detection condition is true, every entrypoint loses sampling
  leniency and follows committed configuration and upstream requirements.

The Specification carries forward #38's exact table, stamp text, detection rule,
and `adversarial-review` relationship rather than re-deciding them.

### 9. Public-surface inventory and completeness checking

Extend the existing FS11 normative-reference inventory and checker rather than
introducing another manifest. Its public-interface coverage must include:

- packaged skill and all six standalone phase entrypoints;
- all six phase references;
- setup, readiness, lifecycle checking, panel resolution/stamping, task
  validation/receipt verification, reference checking, and other advertised
  commands;
- reviewer/validator prompt roles;
- consumer configuration, generated explanation, workflow, hooks, tracker, and
  artifact surfaces;
- delegated external skills and tools, classified by requirement;
- advanced modes and their package-owned references.

Classification is explicit:

1. package-owned public surfaces;
2. delegated skills/capabilities;
3. required runtime tools;
4. consumer-configured hooks/integrations;
5. optional enhancements;
6. implementation internals.

FS11 gains mechanical structural discovery over Specification-pinned public
roots/patterns, with a closed internal-helper exclusion list. The
hand-maintained inventory remains the record of assertions and classifications
for each discovered surface; discovery adds the inverse completeness check, so
omitting a new public artifact from the inventory fails. Removing an inventory
row, a phase explanation, or a public reference likewise fails non-vacuously.
Installed-consumer fixtures prove relative links and advertised invocations
resolve without assuming the package is the current working directory.

### 10. Governance and compatibility artifacts

Record the documentation authority hierarchy and generated-explanation trust
model in an ADR because both are durable, surprising without context, and chosen
after a real trade-off between one monolith and duplicated documentation.

Amend the programme/stream documentation so the complete IC-B and OL-C outcomes
are visibly absorbed here rather than appearing as unfinished parallel
deliverables. Preserve prior disposition work as review input rather than
copying its now-stale proposed text verbatim.

## Authority and reading model

| Question                                | Canonical answer                                                         |
| --------------------------------------- | ------------------------------------------------------------------------ |
| Is this repository adopted and ready?   | `sdlc-status` result against committed adoption artifacts                |
| What global law and sequence apply?     | `SKILL.md` kernel/router                                                 |
| What does this phase require?           | The corresponding package phase reference                                |
| What values has this repository chosen? | `sdlc.config.json`                                                       |
| What do those values mean here?         | Current generated `CONFIG.md`; validated JSON fallback when absent/stale |
| What public surfaces comprise pi-sdlc?  | Package system reference plus FS11 inventory                             |
| What implementation realizes a surface? | Source code, only when implementation work requires it                   |

## Scope out

- Splitting lifecycle phases into independently discovered skills (#101).
- Phase-specific agent definitions, personas, tool shaping, or author-model
  preferences (#91).
- YAML, JSONC, comments in the authoritative manifest, dual-format support, or
  configuration migration (#102).
- New lifecycle ceremony, tracks, gate strengths, panel sizing, approval policy,
  or tracker policy.
- Making `CONFIG.md` part of readiness, lifecycle completion, or mandatory
  consumer CI.
- A tune-config command; this stream explains alternatives and regeneration but
  does not add an interactive post-adoption editor.
- Documentation of internal helper modules or implementation algorithms.
- Telemetry/retro semantics except listing already-public surfaces accurately;
  the active telemetry stream keeps ownership of its own normative content.
- Durable lifecycle resume state and resume briefs.

## Compatibility and migration

- `sdlc.config.json` schemaVersion 3 and its meaning are unchanged.
- Existing readiness exits/check ids and lifecycle-check declarations/check ids
  are unchanged.
- Existing consumers remain operational if `CONFIG.md` is absent; startup warns
  and falls back rather than refusing.
- Fresh setup writes the companion as part of the adoption bundle. Existing
  adopters obtain it through the sanctioned setup/regeneration path.
- Consumer-authored collisions are never silently overwritten.
- Package reference paths and standalone named invocations are additive, but
  relocating normative prose requires compatibility tests and a disposition
  ledger proving no rule disappeared.
- Existing non-interactive setup flags remain available; reducing the fallback
  interview does not remove headless configurability.
- The change is expected to be an additive feature release unless the
  Specification discovers a genuinely breaking installed interface change; track
  irreversibility does not itself require a semantic-version major.

## Risks and mitigations

1. **A slim skill omits law.** Mitigation: statement-level disposition ledger,
   structural negative tests, and plan/spec/PR panels grounded against the
   pre-change skill.
2. **Phase references duplicate or contradict the kernel.** Mitigation: explicit
   ownership table, link-not-repeat discipline, and mutation tests for required
   cross-references.
3. **Generated prose is trusted while stale.** Mitigation: deterministic
   non-blocking check, fixed warning, and authoritative JSON fallback.
4. **Renderer and checker disagree.** Mitigation: one deep render/check module;
   checking compares against the same expected render used for writing.
5. **The inventory becomes a brittle file list.** Mitigation: inventory public
   interfaces only and classify internals explicitly.
6. **Package links work only in this repository.** Mitigation:
   installed-consumer fixtures and skill-relative paths.
7. **The documentation stream collides with telemetry work.** Mitigation:
   preserve that stream's normative content ownership and rebase the public
   inventory after it lands. Both streams also edit setup integration: the
   landing stream must re-seed and verify both the `CONFIG.md` generation hook
   and telemetry event call sites after rebase; neither may be dropped merely
   because each stream's isolated tests pass.
8. **`CONFIG.md` grows into a second handbook.** Mitigation: constrain it to
   effective consumer behaviour and key reference; package semantics stay in
   installed references.
9. **One Specification spans prose and executable contracts.** Mitigation: keep
   one approval because the reading interface is coherent, but structure the
   Specification into three explicit freeze groups: package
   law/routing/entrypoints; setup/config renderer/interview;
   integration/inventory/installed-consumer acceptance.

## Definition of done

1. An installed-consumer test can locate the system reference, all six phase
   references, all six named phase entrypoints, and the generated consumer
   explanation through only documented skill-relative/consumer-relative paths.
2. The package system reference answers the approved source-free comprehension
   checklist: purpose, kernel, adoption, tracks, phases, public composition,
   configuration, artifacts, commands, dependencies, extensions, and next-read
   routing.
3. Every phase reference states its entry conditions, upstream inputs, before
   hooks, required outputs, invariant gate seam, explicit configuration-relative
   branches, refusal/backward behaviour, after hooks, completion evidence, and
   next transition.
4. `SKILL.md` is kernel-first, no more than 220 physical lines and 16 KiB, and
   contains no duplicated phase-mechanics sections; a statement-level
   disposition audit accounts for every current normative rule and red flag as
   retained, moved to exactly one named reference, or intentionally replaced
   with approved reasoning.
5. Fresh setup deterministically generates `CONFIG.md`; an existing valid
   adopter can regenerate it without changing JSON values; repeated generation
   is byte-identical; supported generated sentinels and consumer collisions
   follow the pinned recognition boundary.
6. `CONFIG.md` contains both the effective behaviour summary and JSON-order key
   reference, covers every accepted config key, declares JSON authority, and
   contains valid check/regeneration guidance.
7. The companion checker distinguishes current, missing, stale, and error cases;
   detects config changes, generated-doc edits, and renderer-format changes; and
   never mutates during check mode.
8. Startup uses current generated documentation when available and emits tested
   non-blocking warning/fallback behaviour otherwise. Existing readiness and
   lifecycle-check result contracts remain unchanged.
9. The agent-led setup template explains the kernel, tracks, gate modes, and
   consequences before eliciting choices; the TTY fallback asks at most two core
   decisions plus confirmation; every dial remains reachable non-interactively.
10. All six standalone entrypoints satisfy #38's adopted/unadopted table,
    stamp/refusal rules, adopted-config-dominates switch, and PR-review
    grounding relationship; negative fixtures prove Tasks and Implement never
    fabricate missing upstream ids/checks.
11. The extended FS11 inventory classifies every public agent-facing surface and
    all six phases; structural discovery, omission mutations, and
    installed-package reference tests fail non-vacuously when representative
    public artifacts, rows, explanations, or links are removed.
12. No internal implementation file must be read to answer the source-free
    comprehension checklist; docs and tests never claim that implementation work
    itself can avoid source inspection.
13. Programme/stream documents and the new ADR make complete IC-B/OL-C
    absorption and documentation authority unambiguous; #91, #101, and #102
    remain independent.
14. Full project tests, lint, schema/reference checks, installed e2e fixtures,
    and all task-declared scenario checks pass.

## Context for Specification

The Specification must freeze, in three explicit contract groups:

1. **Package law, routing, and entrypoints**: source-free comprehension
   scenarios and non-vacuity mutations; package reference topology and each
   phase contract's required headings/content obligations;
   configuration-relative callout rules; exact authority/disposition rules for
   moving normative prose; the SKILL size test; and #38's six entrypoint,
   stamp/refusal, adopted-config-dominates, and PR-grounding contracts.
2. **Setup and configuration explanation**: renderer/checker interface,
   statuses, exits, output envelope, deterministic Markdown requirements,
   generated sentinel/fingerprint/version strategy, fresh/existing-adopter
   collision and regeneration behaviour, agent-led interview obligations, and
   the two-decisions-plus-confirmation TTY ceiling.
3. **Integration and completeness**: fixed startup warning/fallback contract and
   ordering after readiness; FS11 schema/classification extension and structural
   public-surface discovery rule; installed-consumer fixture topology and
   package-relative link/invocation checks; telemetry/setup merge assertions;
   and explicit non-changes to FS8, FS9, config schemaVersion 3, ceremony, and
   deferred issue scopes.

The Build phase should separate at least the
package-documentation/skill-routing/entrypoint work from
generated-config/checker/setup work, with a final inventory and
installed-consumer integration task. One Specification and one human approval
remain appropriate because all three groups jointly define one coherent agent
reading interface.
