# Programme plan: make pi-sdlc an observable, complete lifecycle

- Date: 2026-07-12
- Classification: **irreversible programme**. The programme is deliberately
  decomposed below; each child change follows its own irreversible
  Plan → Specification → Build → Implement → PR lifecycle and classifies its
  frozen-surface amendments before implementation. This programme artifact
  does not proceed directly to one Specification or Build.
- Known affected surfaces: FS1, FS2, FS5, FS7, plus a new durable lifecycle-run
  receipt surface and a new author-model preference surface. Child plans must
  narrow and classify these rather than changing all of them in one release.
- Author vendor: openai.
- Governing review: critical audit of the repository's SDLC assets on
  2026-07-12, accepted in full by the project owner.
- Human gate: programme decomposition and fixed decisions approved by Neil
  Chambers on 2026-07-12.

## Objective

Make the shipped `sdlc` skill reliably lead a capable agent from adoption to a
completed PR without hidden prerequisites, contradictory track rules, or
project-specific assumptions. Preserve the current process philosophy while
making phase outcomes, transitions, coverage, and completion mechanically
observable wherever practical.

## Programme decomposition and ordering

The accepted recommendations are split into five independently gated child
changes. Each gets its own Plan, plan panel, human approval, Specification,
spec panel, human approval, Build, tracker projection, human Build approval,
implementation, and PR panel. No child may absorb another child's frozen
surface merely for convenience.

1. **Adoption and contract honesty** — O1, O2, and O8: complete adoption,
   track-specific PR contracts, package-relative invocation, path overrides,
   lifecycle CI/template claims, and broken/assumed references including
   `AGENTS.md`, `CONTRIBUTORS.md` versus `CONTRIBUTING.md`, the missing PR
   template, and the missing panel task block.
2. **Authoring outcomes and traceability** — O3 plus the plain-Brainstorm recap:
   normative phase templates, transition sequence, and complete objective/DoD
   → requirement/scenario → task → check coverage.
3. **Portable validation and durable lifecycle state** — O4 and O5, split into
   two independently gated sub-changes:
   - **3a Portable validator** — project-declared checks, explicit applicability,
     and offline TypeScript/non-TypeScript fixtures. Promoted as an immediate
     prerequisite after the first Adoption Readiness Build exposed the current
     unconditional TypeScript validator as a process blocker.
   - **3b Durable lifecycle state** — resumable gate state, approvals/checks,
     and hook receipts; remains after child 2 establishes authoring/traceability
     contracts.
4. **Model governance** — O7: a new author-preference surface and explicit,
   non-configurable review-panel invariants.
5. **Tracker coherence** — O6: conditional tracker modes, durable no-tracker
   fallbacks, and verified Build-time projection.

Ordering: Adoption Readiness has completed Plan, Specification, and Build but
its implementation is blocked. Child 3a (Portable validator) is promoted now
and must merge before Adoption Readiness enters Implement. This is an approved
backward correction after Build exposed a flaw, not a skipped gate. Child 2
still precedes child 3b because durable lifecycle state consumes the authoring
and traceability contracts. Child 4 may proceed after child 1's adoption stream;
child 5 may proceed after that stream. The dedicated board bootstrap was
completed during the first Adoption Readiness Build.

### Build-time tracker bootstrap for this programme

The orchestrating agent owns this explicit prerequisite at the start of the
first approved child Build, before publishing any implementation tickets:

1. Create a dedicated organisation-owned **pi-sdlc Build Board** rather than
   reusing an unrelated project.
2. Verify the project id, URL, required Status options, repository link, and
   `gh` permissions using the read-back operations in `tracker-ops.md`.
3. Add the verified tracker block to this repository's config as a programme
   setup artifact.
4. Only then let the approved child Build decide and publish its epic/tasks.

Failure to create or verify the board blocks that Build and is surfaced to the
human owner; it is not silently converted into an implementation task. This
makes board provisioning owned and in scope while preserving the rule that
Build, not Plan or Specification, chooses tickets.

## Required outcomes

### O1 — Honest, complete adoption

A repository reported as fully adopted has every load-bearing asset needed to
complete the lifecycle, not just a config file. Setup provisions or explicitly
verifies the required configuration, model readiness, PR declaration surface,
and lifecycle checks. Partial readiness is reported distinctly from full
readiness.

The documentation must not claim that CI, templates, tracker facilities, or
panels exist unless setup or a readiness check has verified them.

### O2 — One coherent contract for both tracks

The irreversible and reversible tracks each have complete, non-contradictory
phase and PR inputs. In particular, the reversible track must not require a
specification it intentionally omits. Every phase and hook has an unambiguous
entry, gate, approval, after-hook, and transition point.

Plain brainstorm ends with a concise, human-approved decision recap carrying
the chosen direction, alternatives rejected, assumptions, scope, unresolved
questions, evidence consulted, and recommended track. Map mode remains the
large/foggy alternative.

### O3 — Explicit authoring outcomes and traceability

The package ships normative, concise authoring templates for Plan,
Specification, Build plan, consolidated panel adjudication, and PR lifecycle
declaration. The templates expose the information the corresponding reviewer
prompts already judge.

Traceability is complete and falsifiable:

`plan objective / DoD → spec requirement or scenario → build task → check command`

No required objective, DoD item, requirement, or scenario may disappear between
phases. The Build gate rejects uncovered requirements and scenarios before
implementation begins.

### O4 — Portable implementation validation

Task validation is project-agnostic. It runs checks declared by the approved
Build plan or project configuration and supports an explicit, justified `n/a`
where a check category does not apply. It does not universally prescribe
TypeScript or any other language-specific command.

Every implementation task has independently verifiable completion criteria,
exact check commands, scenario coverage, and explicit scope boundaries. A task
cannot pass merely because the full suite happens to exit zero.

### O5 — Observable lifecycle state and gates

A mechanical surface can report the current track, phase, required artifacts,
completed gates, outstanding approvals/checks, configured hooks, and panel
readiness. Gate evidence is durable enough to resume in a later session without
reconstructing state from chat history alone. Child 3 introduces a new,
versioned consumer-facing lifecycle-run receipt beneath `.pi/sdlc/runs/`; the
Specification pins its exact filename, schema, mutation/merge rules, and git
policy. Status derives resumability from that receipt plus canonical committed
artifacts rather than inventing state from their mere presence.

This deliberately re-opens ADR 0011's transcript-only audit decision. Hooks
remain agent-executed prose law, not a mechanical runner, but successful and
failed hook receipts are also recorded in the lifecycle-run receipt. The child
change must amend/supersede ADR 0011 and state honestly that such a receipt is
evidence emitted by the agent, not independent proof that the action occurred.
Documentation calls the system an auditable agent protocol rather than implying
a hook engine exists.

### O6 — Coherent tracker behaviour

Tracker-backed modes are conditional on tracker configuration. A repository
without a tracker has an explicit, durable fallback for map mode and multi-task
Build rather than an impossible mandatory step.

When a tracker is configured, Build — not Plan or Specification — decides the
implementation tasks after the specification is approved. Build writes the
canonical build-plan document, verifies complete scenario/DoD coverage, then
publishes the epic and task issues as its projection. Each task issue carries
its outcome, scope, scenario ids, exact checks, dependencies, and testable DoD.
The human owner reviews and approves the Build output and tracker projection
before implementation begins.

This repository's dedicated ThreadSafe GitHub project board is created and
verified by the orchestrating agent during the first child Build's tracker
bootstrap. Existing unrelated boards must not be reused merely because they
exist.

### O7 — Author-model preferences are distinct from review panels

Projects can express preferred models for authoring Brainstorm, Plan,
Specification, Build, and Implement work, independently from panel rosters and
task validators. The meaning of `author_default` is made unambiguous or replaced
without silently changing an existing frozen contract.

Review invariants are global law for judgement panels: Plan, Specification,
and PR panels require at least two distinct reviewer vendors and exclude the
author's vendor. Task validation remains a one-validator mechanistic check and
has no author-exclusion requirement. Valid configuration may strengthen a
judgement panel but cannot weaken those floors. The legacy
`rules.exclude_author_vendor` field is deprecated through an explicit migration
rather than silently honoured as a law-weakening switch.

Author preferences live in a new, separate, versioned surface rather than being
added to FS2's exactly-four review phase keys. It covers Brainstorm, Plan,
Specification, Build, and Implement. FS2 `author_default` retains its existing
vendor-exclusion fallback behaviour for compatibility and is documented as
such; it is never repurposed to dispatch an author.

### O8 — All shipped references and path customisation work

Every referenced file, template, task block, command, and invocation path is
shipped or explicitly consumer-owned and optional. Package-relative commands
remain executable when the session cwd is the consumer repository.

All advertised `paths` overrides are either honoured throughout generation,
documentation, readiness checks, and artifact checks, or removed through an
explicitly versioned contract change. There are no inert configuration fields.

## Scope

### In

- `skills/sdlc/SKILL.md` lifecycle, phase-transition, tracker, panel, and
  enforcement language.
- Plan, Spec, Build, consolidation, brainstorm-recap, and PR templates.
- Consumer setup and readiness/status behaviour.
- Lifecycle artifact and traceability checks suitable for CI and local use.
- Track-specific PR declaration and verification.
- Portable task-check configuration and validator prompt behaviour.
- Author-model preference configuration and model-resolution behaviour.
- Review-panel invariant reconciliation.
- Tracker/no-tracker behaviour and this repository's tracker configuration.
- Package-relative script invocation and every currently broken or assumed
  reference (`AGENTS.md`, PR template, panel task block, configurable paths).
- Tests, documentation, examples, ADRs, migration notes, and release-impact
  classification required by changes to frozen surfaces.

### Out

- Replacing GitHub Projects with a new tracker implementation.
- A general workflow engine, daemon, or event bus.
- Deployment, release approval, or post-merge lifecycle phases.
- Choosing implementation task boundaries before the Specification is approved;
  that belongs to Build.
- Reusing an unrelated organisation project board for pi-sdlc.
- Making optional visual gate rendering mandatory.

## Constraints and locked decisions

- The committed Plan, Specification, and Build-plan documents remain canonical;
  tracker objects are projections.
- Build decides implementation decomposition only after Specification approval.
- Reviewer prompts remain single sources of truth; generated per-model agents
  are not committed.
- Reviewer findings are consolidated and adjudicated; surviving high or medium
  findings block forward progress.
- Existing frozen surfaces evolve according to their ADRs. The Specification
  must identify any major-version requirement rather than disguising a breaking
  change as additive.
- Runtime tooling should remain dependency-light and usable from a consumer
  repository.
- Existing configured hooks retain their before-blocks / after-warns semantics
  unless an explicit migration is specified and approved.

## Risks and dependencies

- **Programme coordination:** five child lifecycles can drift or duplicate
  contracts. This programme plan and its outcome IDs remain the governing
  index; each child plan declares the outcome subset it owns and its dependency
  on earlier child contracts.
- **Bootstrap:** readiness and CI enforcement cannot require assets before setup
  has installed them. Upgrade behaviour for existing consumers must be explicit.
- **Backward compatibility:** adding author phases to FS2 or changing required
  panel minima may be breaking under ADR 0002.
- **False enforcement:** durable receipts can prove artifacts and checks, but
  cannot prove the quality of human thought. Claims must remain bounded to what
  the mechanism observes.
- **Tracker prerequisite:** the organisation currently has no dedicated
  pi-sdlc board. The orchestrating agent owns creation and verification at the
  start of the first child Build; failure blocks and is escalated to the human
  owner.
- **GitHub permissions:** project creation, field updates, labels, hierarchy,
  and blocking edges require suitable `gh` scopes and must be verified after
  mutation.
- **Portability:** CI providers and non-GitHub consumers may need a local checker
  even if the shipped PR integration targets GitHub.

## Definition of done

- [ ] A fresh consumer can adopt pi-sdlc and one command distinguishes not
      adopted, partially ready, and ready-to-run states with actionable
      diagnostics.
- [ ] The adopted consumer receives or verifiably supplies every artifact that
      the skill calls mandatory, including the track declaration and lifecycle
      artifact check.
- [ ] Offline fixture-based reversible and irreversible lifecycle walkthroughs
      reach the PR-ready state with no missing or contradictory required input;
      they prove contract completeness without network access or model calls.
- [ ] Every lifecycle phase has a shipped outcome template or an explicit
      durable fallback, a transition sequence, and a falsifiable gate.
- [ ] A traceability checker fails fixtures with an uncovered plan DoD item,
      spec requirement/scenario, build task, or missing check command, and
      passes a complete fixture.
- [ ] Task validation passes representative non-TypeScript and TypeScript
      fixtures using declared checks, and fails when a required check, scenario
      mapping, or task-specific criterion is absent or failing.
- [ ] Lifecycle status can resume from durable repository state and correctly
      reports track, phase, gates, approvals/checks, hooks, and panel readiness
      in positive and negative fixtures.
- [ ] Tracker-configured and no-tracker fixtures both complete Brainstorm and
      Build lawfully; neither encounters an impossible mandatory tracker step.
- [ ] At the first child Build, the orchestrating agent creates and read-back
      verifies the dedicated pi-sdlc board and configures this repo; every
      approved child Build then creates its own epic/task projection with exact
      checks and DoD and pauses for human approval before Implement.
- [ ] Author preferences for Brainstorm, Plan, Spec, Build, and Implement are
      accepted, validated, resolved, and demonstrably separate from reviewer
      and validator selection.
- [ ] Tests prove that Plan, Specification, and PR panels cannot resolve below
      two distinct reviewer vendors or include the author's vendor, regardless
      of consumer configuration; task validation still resolves one validator.
- [ ] Every shipped internal reference — including `AGENTS.md`, the erroneous
      `CONTRIBUTORS.md` name, PR template, and panel task block — resolves or is
      explicitly optional/consumer-owned in package and installed-consumer
      fixtures; package scripts work with consumer cwd.
- [ ] Every supported path override is exercised end-to-end, or its removal is
      documented and tested as the approved versioned behaviour.
- [ ] Existing v1 config/models fixtures either remain valid unchanged or fail
      only behind an approved schema-major migration with tested guidance;
      setup/upgrade behaviour and schema/CLI/template compatibility are
      documented in ADRs.
- [ ] Automated documentation-to-assets checks fail when shipped prose claims a
      mandatory CI check, template, tracker facility, panel input, or command
      that the package neither supplies nor readiness-verifies.
- [ ] The full automated suite and lint pass with no live paid-model calls.
- [ ] Plan, Specification, Build, and PR panels reach the no-surviving-high-or-
      medium stop condition, with all dismissals recorded.

## Context for the Specification author

The critical audit found that the conceptual protocol is strongest in
Brainstorm/map mode, review adjudication, prompt grounding, and tracker source-
of-truth discipline. Preserve those strengths. The principal defects to resolve
are missing enforcement assets, contradictory reversible-track PR inputs,
optional tracker versus mandatory publication, TypeScript-specific validation,
thin authoring templates, incomplete Build coverage rules, absent author-model
routing, implicit phase transitions, configurable weakening of stated panel
law, inert path overrides, and broken/assumed references.

Each child Specification should inspect the existing historical Plan/Spec/Build
artifacts as useful examples but must not treat them as shipped templates. It
defines stable verification scenario ids only for its owned outcome subset and
names upstream child contracts it consumes. No Specification chooses
implementation task boundaries or creates tracker tasks; each child Build does
that after its Specification approval.

## Absorption note — agent self-documentation (2026-07-18)

The **agent self-documentation** stream
(`docs/plans/2026-07-18-sdlc-agent-self-documentation.md`, rev 2, gate approved;
spec rev 2, scenarios ASD1–ASD20) is the canonical umbrella where this
programme's documentation and configuration-explanation outcomes land. It fully
**absorbs IC-B** (config-intent-vocabulary scope items 5/6: generated `CONFIG.md`,
drift check, agent-led setup interview, reduced TTY fallback) and **OL-C**
(opt-in-lifecycle scope items 4/7 plus issue #38's ratified entrypoint contract:
kernel-first `SKILL.md`, supporting references, six standalone `sdlc:<slug>`
entrypoints, adopted-config-dominates). Neither ships as a separate stream. The
documentation-authority hierarchy and generated-explanation trust model are
recorded in **ADR 0029**.

Independent and **not** re-opened by this stream: **#91** (phase-specific agent
definitions / author-model preferences), **#101** (phases as independently
discovered skills), **#102** (YAML/comments/dual configuration format). This
stream documents the current public composition without choosing any of those
designs.
