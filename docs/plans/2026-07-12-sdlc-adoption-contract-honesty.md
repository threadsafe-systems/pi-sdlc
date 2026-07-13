# Stream plan: adoption and lifecycle-contract honesty

- Date: 2026-07-12
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Owns programme outcomes: O1, O8, and O2's track/PR-contract portion. O2's
  plain-Brainstorm recap belongs exclusively to programme child 2.
- Classification: **irreversible stream**. The stream is decomposed below; it
  does not proceed directly to one Specification or Build. Known affected
  surfaces include FS1, FS5 where applicable, FS7, ADR 0010's opt-in/status
  contract, and new shipped checker/integration surfaces. Each sub-change must
  classify its own amendments before implementation.
- Author vendor: openai
- Human gate: stream decomposition and fixed decisions approved by Neil
  Chambers on 2026-07-12.

## Stream decomposition and ordering

The plan panel found this stream still too large for one coherent Specification.
It is therefore split into four independently gated sub-changes:

1. **Adoption readiness semantics** — A1 and the readiness portion of A2:
   committed adoption, not-adopted/not-ready/ready states, aggregate diagnostics,
   and existing-consumer migration. This explicitly amends ADR 0010.
2. **Adoption bundle and lifecycle checking** — the remaining A2 plus the
   track/PR portion of A3: setup provisioning, PR declaration, a local lifecycle
   checker, and dedicated GitHub Actions integration.
3. **Normative-reference honesty** — A4 and A7: an enumerated inventory of
   package-owned normative references and mandatory-facility claims, including
   generic-prompt versus consumer-override boundaries.
4. **Skill-relative invocation and path plumbing** — A5 and A6: documented
   skill-relative execution and end-to-end support for every existing path
   override.

Ordering: sub-change 1 precedes 2 because setup consumes readiness semantics;
2 precedes 3 because the claim inventory includes the adoption bundle; 4 may
proceed after 1 and must finish before the stream is complete. Each sub-change
gets its own Plan, panels, Specification, Build, tracker projection, human Build
approval, implementation, and PR.

## Objective

Make adoption truthful and self-contained: when pi-sdlc says a repository is
ready, the repository has or explicitly supplies every mandatory asset needed
to follow both lifecycle tracks through a PR. Remove contradictions, inert
configuration, broken references, and package-location assumptions from the
entry path an agent follows after reading `SKILL.md`.

## Required outcomes

### A1 — Readiness is stronger than manifest presence

The mechanical startup check distinguishes:

1. **ready** — exit 0: committed manifest plus all mandatory local assets and
   contracts are valid and usable;
2. **not adopted** — exit 1: no committed adoption manifest, including a
   manifest that exists only as untracked or ignored working-tree content;
3. **invalid/error** — exit 2: malformed input/configuration or operational
   failure;
4. **adopted but not ready** — new exit 3: the committed manifest is valid, but
   another required config, model roster, lifecycle asset, or integration is
   absent or invalid.

This explicitly amends/supersedes ADR 0010's 0/1/2 meaning: exit 0 changes from
mere manifest presence to full readiness, and exit 3 is added. It is a breaking
status-policy/CLI change requiring migration guidance and updated callers.
ADR 0005 does not govern `sdlc-status`; the Specification must not misclassify
this as an existing FS5 amendment.

Diagnostics identify in one run all blockers that do not depend on fixing
another blocker. Readiness makes no paid model call; optional live/PONG
verification remains a separate explicit operation.

### A2 — Setup produces or verifies a complete adoption bundle

A fresh consumer setup provisions, or recognises a valid consumer-owned
equivalent for, every mandatory asset used by the lifecycle:

- valid identity/configuration and model preference files;
- track declaration for pull requests;
- local lifecycle/artifact checking suitable for developer and CI use;
- shipped phase/review assets required by `SKILL.md`;
- package-relative command access that works while cwd is the consumer repo.

Setup is safe to re-run, reports what it created, retained, upgraded, or refused
to overwrite, and never silently replaces consumer-authored equivalents.
Existing consumers receive an explicit readiness/upgrade path rather than being
reclassified as ready under stronger rules without the new assets.

### A3 — Both tracks have complete, non-contradictory contracts

The irreversible track requires Brainstorm, Plan, Specification, Build,
Implement, and PR. The reversible track requires Brainstorm, Plan, Build,
Implement, and PR and never requires a missing Specification as a PR or reviewer
input.

For each track, the lifecycle defines:

- required artifact inputs at every phase;
- the gate and human approval required to leave the phase;
- before-hook, work, review/gate, approval, after-hook, and transition ordering;
- the source of PR review constraints when a Specification is absent;
- which links and declarations the PR must carry.

Hook execution ordering remains agent-executed, transcript-audited prose under
ADR 0011 in this stream. This stream documents internally coherent transition
semantics but does not claim to test that a live agent actually fired or ordered
hooks; programme child 3 alone may re-open that enforcement boundary.

Offline walkthrough fixtures must reach a PR-ready state for both tracks
without inventing an absent artifact.

### A4 — Mandatory claims are coupled to shipped or verified reality

Documentation and prompts may call a CI check, PR template, panel input,
tracker facility, file, command, or agent mandatory only when the package ships
it or readiness verifies a consumer-owned equivalent.

Automated consistency checks operate over a pinned inventory: every enumerated
package-owned normative reference resolves or is marked optional/external, and
every enumerated mandatory-facility claim maps to a shipped or readiness-
verified target. Consumer-owned files such as governing documents remain
optional unless explicitly configured.

Generic package prompts are covered by the inventory. A whole-file consumer
prompt override is reported as consumer-owned and semantically unverified; the
package does not falsely certify its internal references.

### A5 — Commands are executable from consumer cwd

Pi's documented skill contract resolves relative script and asset references
from the skill directory (`docs/skills.md`, “How Skills Work” and “Skill
Structure”), not from consumer cwd. Every command shown in the skill uses that
contract unambiguously; it does not pretend `skills/sdlc/...` exists inside the
consumer. Headless instructions use a resolved package-root path or direct Node
`.mjs` entry point and are documented separately.

Installed-consumer fixtures resolve the installed skill directory and exercise
startup status, setup, panel-agent stamping, panel resolution, and lifecycle
checking while the subprocess cwd remains the consumer repository. POSIX shell
wrappers are conveniences; direct Node entry points are the supported
cross-platform fallback, including Windows.

### A6 — Advertised path overrides work end to end

This stream proposes retaining and honouring all existing `paths` overrides,
not removing them; approval of this stream ratifies that fork. Plans, specs,
reviews, and generated agents resolve through the configured paths consistently
in:

- documentation and generated instructions;
- setup/readiness;
- artifact/lifecycle checks;
- panel artifact destinations;
- installed-consumer fixtures.

Default paths remain unchanged for existing consumers. A configured path cannot
escape the consumer repository.

### A7 — Broken and assumed references are eliminated

The child covers at least the known failures:

- absent `.github/pull_request_template.md`;
- missing panel dispatch task block after `FILL_IN_TASK_BLOCK`;
- unconditional `AGENTS.md` assumptions;
- erroneous `CONTRIBUTORS.md` versus `CONTRIBUTING.md` naming;
- package-relative `skills/sdlc/scripts/...` examples from consumer cwd;
- hard-coded plan/spec/review homes that ignore configured paths.

The Specification must inventory the full shipped documentation/prompt
reference graph so success is not limited to this initial list.

## Scope

### In

- Startup adoption/readiness states and diagnostics.
- `/setup-sdlc` and headless setup behaviour for the complete adoption bundle.
- Shipped or generated PR declaration and local/CI lifecycle-check integration.
- Reversible/irreversible phase and PR input contracts.
- Track-specific phase inputs and PR contracts; authoring transition templates
  remain programme child 2, and live hook receipts remain child 3.
- Package-relative CLI/invocation discoverability from consumer cwd.
- End-to-end support for all existing `paths` overrides.
- Reference inventory/checking across `SKILL.md`, README, templates, prompts,
  scripts, schemas, and generated assets.
- Existing-consumer upgrade behaviour, compatibility classification, ADRs,
  documentation, and offline fixtures.

### Out

- Authoring content/templates beyond the minimum PR declaration; child 2 owns
  Brainstorm/Plan/Spec/Build/consolidation authoring templates, the plain-
  Brainstorm recap contract, and the standard transition-sequence presentation.
- Objective/scenario/task traceability checking; child 2.
- Durable run receipts or current-phase state; child 3.
- Portable task validation; child 3.
- Author-model dispatch and panel-invariant changes; child 4.
- Tracker/no-tracker mode semantics; child 5.
- Live credential/PONG calls in readiness or tests.
- A general CI-provider abstraction; local checking is canonical, with GitHub
  Actions integration shipped for this GitHub-focused package.

## Constraints and locked decisions

- Existing default artifact paths remain unchanged.
- Consumer-authored files are not overwritten without an explicit force or
  migration action.
- Generated per-model reviewer agents remain ignored and non-canonical.
- The package remains usable as a git-installed pi package; there is no npm
  publication dependency.
- Local checking must be runnable independently of GitHub Actions so the
  lifecycle contract does not depend solely on hosted CI.
- No test makes a paid model or network call.
- “Model preference files” in this stream means only the existing FS2
  `sdlc.models.json`; child 4 alone owns author-model preferences.
- This stream defines track/PR inputs and readiness, but does not choose child
  2's authoring/transition template structure or child 3's durable state schema.
- ADR 0011 remains unchanged by this stream; only child 3 may supersede its
  transcript-only hook audit decision.

## Risks and dependencies

- **Git commitment detection:** tests must cover git repositories, untracked
  manifests, ignored files, and explicit non-git/error behaviour without
  making adoption nondeterministic.
- **Consumer-owned equivalents:** overly loose equivalence would recreate false
  readiness; overly strict byte identity would overwrite legitimate local
  customisation. The Specification must pin structural acceptance checks.
- **CI installation:** workflow files can collide with existing consumer CI.
  Setup must compose or install a dedicated workflow without silently editing
  unrelated workflows.
- **Invocation portability:** Pi documents skill-relative asset/script
  resolution but does not install package scripts as conventional binaries.
  In-harness instructions must use skill-relative resolution; headless and
  Windows use a resolved package-root/direct-Node fallback rather than inventing
  a binary.
- **Reference checking:** simple grep cannot understand every conditional or
  consumer-owned reference. Checks must focus on normative references and allow
  explicitly marked optional/external targets.
- **Compatibility:** stronger readiness turns some former exit-0 repos into
  exit 3. This explicitly supersedes ADR 0010 and requires caller, documentation,
  fixture, and migration updates; it is not mislabelled as an ADR-0005/FS5
  change.

## Definition of done

- [ ] Fresh-repo fixtures distinguish not adopted, adopted-not-ready, and ready
      with pinned exit/status semantics and actionable aggregate diagnostics.
- [ ] An untracked or ignored manifest cannot be mistaken for a committed full
      adoption; non-git behaviour is explicit and tested.
- [ ] Setup provisions a complete default adoption bundle in a fresh fixture,
      reaches ready status, and is idempotent on a second run.
- [ ] Setup recognises structurally valid consumer-owned equivalents and refuses
      conflicting files without explicit overwrite/migration consent.
- [ ] Existing pre-change consumer fixtures receive a tested, documented upgrade
      path and do not suffer silent destructive rewrites.
- [ ] A local lifecycle checker and shipped GitHub Actions integration fail when
      required track artifacts/declarations are absent and pass complete
      reversible and irreversible fixtures.
- [ ] Reversible and irreversible offline walkthroughs reach PR-ready state with
      exactly their required artifacts; the reversible fixture never references
      a Specification.
- [ ] Offline contract fixtures prove both track definitions have internally
      consistent artifact/gate/approval transitions; they do not claim to prove
      live hook execution, which remains transcript-only under ADR 0011.
- [ ] Documentation-to-assets tests fail for each known broken/assumed reference
      and pass only after every package-owned reference resolves or is marked
      optional/consumer-owned.
- [ ] Supported package commands execute from an installed-consumer fixture cwd
      for status, setup, panel stamping/resolution, and lifecycle checking.
- [ ] Non-default `paths.plans`, `paths.specs`, `paths.reviews`, and
      `paths.agents` fixtures pass setup, readiness, artifact checking, generated
      instruction, and panel-destination checks without writing defaults.
- [ ] Default-path existing fixtures remain byte/behaviour compatible except for
      explicitly approved readiness changes.
- [ ] Every entry in the pinned normative-reference inventory resolves or is
      marked optional/external, and every inventoried mandatory-facility claim
      maps to a shipped or readiness-verified target; mutation fixtures fail
      each mapping independently.
- [ ] ADR 0010 is superseded with the 0/1/2/3 readiness semantics; callers and
      existing-consumer fixtures demonstrate the documented migration. FS1,
      FS7, new checker surfaces, and any genuine FS5 impact are classified
      separately.
- [ ] `npm test` and `npm run lint` pass with no live model or network calls.
- [ ] The child Plan, Specification, and PR panels reach no surviving high or
      medium findings, with adjudications recorded.

## Context for the Specification author

Start from the observed gaps, not from a greenfield redesign:

- `sdlc-status` currently treats manifest existence as ready adoption and only
  reports models as present/absent.
- setup writes config and optionally models, but not the PR declaration or
  lifecycle CI/check integration the skill claims.
- `.github/pull_request_template.md` is absent and CI does not check lifecycle
  artifacts.
- the reversible track omits Specification while PR instructions assume one.
- only `paths.agents` is consumed programmatically; other path overrides are
  hard-coded in prose.
- package scripts physically live under the installed skill while examples are
  written as if that path exists in the consumer.
- the panel instructions contain a missing task-block reference, and prompts
  assume governing files with inconsistent names.

Each sub-change Specification defines stable verification scenario IDs only for
its owned outcome subset and pins any consumer-equivalence rules it uses. No one
Specification covers A1–A7 together. The stream must not define full phase
authoring templates, the Brainstorm recap, durable run-state schema, task
validator, author-model selection, tracker fallback, or implementation task
breakdown; those belong to later programme children or Build.
