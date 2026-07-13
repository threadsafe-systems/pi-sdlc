# Plan: portable per-task validator

- Date: 2026-07-12
- Programme: `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`
- Promotion decision: approved by Neil Chambers during Adoption Readiness Build
  review on 2026-07-12.
- Owns programme outcome: O4
- Track: **irreversible**. This changes the shipped per-task gate contract in
  `SKILL.md` and `validator-task.prompt.md` (FS7) and introduces a versioned task-
  validation manifest schema plus deterministic runner CLI. Existing FS7
  required `##` headings are preserved verbatim, so ADR 0007 override headings
  do not break and ADR 0012 does not require a major release for headings.
- Author vendor: openai
- Human gate: Plan approved by Neil Chambers on 2026-07-12.

## Objective

Make task validation portable across languages and repositories by executing the
approved Build task's declared checks exactly, rather than universally imposing
TypeScript. Preserve the validator's narrow role as a mechanistic checklist
executor: it reports evidence and never substitutes quality judgement.

This change is promoted ahead of Adoption Readiness implementation because the
current unconditional `npx tsc --noEmit` gate cannot honestly pass in this
JavaScript repository.

## Required outcomes

### PV1 — The approved Build task is the source of truth

Every implementation task supplies a committed JSON validation manifest derived
verbatim from its approved Build-plan task. A versioned JSON Schema and
non-networked runner validate it mechanically before any task command runs. Each
entry has:

- stable check id;
- category;
- applicability: `required` or `n/a`;
- exact command when required;
- explicit reason when `n/a`;
- scenario ids or governing rule it evidences.

Commands are argv arrays, not shell strings. The deterministic runner executes
required commands exactly as declared from the repo root, with no shell
interpolation, substitution, or fallback. The validator subagent invokes the
runner and reports its result; it must not add a language-specific command,
replace a command, or infer `n/a` itself.

### PV2 — Applicability is explicit and reviewable

The contract recognises these categories:

1. `tests` — behavioural test commands;
2. `static` — type, syntax, lint, formatting, compilation, or equivalent static
   checks appropriate to the project/task;
3. `scenarios` — mapping from each task-owned Specification scenario to passing
   evidence;
4. `standards` — mechanically greppable project rules, when a governing file
   exists;
5. `banned-patterns` — task/project-prohibited patterns in the task diff.

Every category appears in the task manifest. A category may be `n/a` only with a
specific Build-approved reason. Every implementation task must declare at least
one required mechanically executable check; a documentation/ADR task uses a
docs test, link check, schema check, or similarly meaningful command rather than
a language typechecker. A task with no mechanically verifiable outcome is not
implementation-ready and must move backward to Build instead of inventing a
vague assertion. Scenario `n/a` is allowed only when the task owns no
Specification scenario and the Build plan says why.

The deterministic manifest checker fails missing categories/ids/commands/
reasons, duplicate ids, invalid applicability, undeclared scenario ownership,
and malformed argv before running commands.

### PV3 — No universal language/tool command remains

Neither the skill nor generic validator prompt mandates TypeScript, Node, npm,
Python, Go, Rust, or any other project-specific tool. The literal fixed command
`npx tsc --noEmit` is removed from generic law.

A TypeScript task can still require that command by declaring it in `static`; a
JavaScript task can require `node --check` and Biome; another repository can
declare its own tools. Missing executables make required checks fail with the
attempted command as evidence.

### PV4 — Evidence and verdict are deterministic

The deterministic runner, not LLM judgement, decides manifest validity,
command execution, scenario-to-check coverage, bounded evidence, and overall
PASS/FAIL. For each manifest entry, output records:

- check id and category;
- `PASS`, `FAIL`, or `N/A`;
- exact command for required command checks;
- exit code and bounded final summary/output evidence;
- scenario/rule mapping to the required command check that evidences it.

Overall verdict is `FAIL` if the manifest is invalid, any required check was not
run, any command exits nonzero, any owned scenario lacks a mapping to a passing
required check, or a required rule/pattern check fails. `N/A` never contributes
a pass; it only records approved non-applicability.

Per-check captured evidence is limited to the last 200 lines and 20 KiB,
whichever limit is reached first, with a deterministic truncation marker. Before
persistence/output, the runner redacts sentinel/secret values from environment
variables whose names match key/token/secret/password/auth credential patterns.
It never reads credential files. Tests inject unique secret sentinels and fail
on any appearance.

The validator does not review architecture, code quality, style beyond declared
mechanical rules, or whether the Build should have required additional checks.
Those are Build/human/PR-panel responsibilities.

### PV5 — Bootstrap is honest

The first implementation task atomically adds the manifest schema/runner,
updates the validator prompt/law, and adds offline tests. Validation occurs only
at task end: the worktree then contains the new prompt and passing deterministic
runner. The orchestrator regenerates the validator agent from that worktree and
runs it against the first task's committed manifest. This is the explicit
cut-over mechanic; no old prompt is used for the end-of-task gate and no
TypeScript exception is granted.

The runtime validator receipt (manifest path, runner report, generated-agent
hash, model, and verdict) is saved with review artifacts. Automated tests prove
the deterministic runner and generated prompt; the model transcript is runtime
gate evidence, not claimed as reproducible offline proof.

The Adoption Readiness epic remains Blocked until this portable-validator PR is
merged and its task manifests can be validated under the new contract.

### PV6 — Existing panel machinery remains compatible

Model resolution, validator model preference, generated-agent naming/tools,
consumer prompt override precedence, and plan/spec/PR reviewer prompts remain
unchanged. The generic prompt preserves the three current FS7 headings verbatim:
`## Inputs the caller gives you`, `## Checks (run every one; do not skip)`, and
`## Output format (STRICT: markdown only)`. Migration guidance tells whole-file
overrides they must adopt the new manifest/runner contract before use. This
change owns neutralising the validator prompt's `<CONTRIBUTORS_PATH>` input into
a generic governing-standards manifest field; programme child 1's normative-
reference work records that ownership and does not edit the validator input.

## Scope

### In

- `SKILL.md` per-task validation law and red flags.
- Generic `validator-task.prompt.md` input/output/check contract.
- Versioned JSON task-manifest schema and deterministic validation/command runner
  with a frozen CLI/output contract.
- FS7 compatibility/migration treatment for whole-file consumer overrides.
- `test/validator-contract.test.js` plus
  `test/fixtures/validator-manifests/` for TypeScript, JavaScript, non-Node,
  malformed, redaction, truncation, and mutation cases.
- Self-hosting bootstrap procedure for this change.
- After this PR merges, mechanically re-project the blocked Adoption Readiness
  Build into committed per-task manifests and refreshed issue bodies, then
  re-open that Build's human gate. Neil Chambers owns re-approval before its
  tasks leave Blocked.

### Out

- Running validators through a new daemon or workflow engine.
- Choosing task checks outside Build; Build remains authoritative.
- Full Plan/Spec/Build authoring templates and traceability checker; programme
  child 2.
- Durable lifecycle receipts; programme child 3b.
- Author-model or panel-invariant changes; programme child 4.
- Changing `sdlc.models.json`, panel resolver behaviour, or validator model
  preferences.
- Adding TypeScript or any tool solely to satisfy generic validation.

## Constraints and locked decisions

- Validator remains one subagent and requires only one vendor.
- It is a checklist executor, not a quality judge.
- Required commands execute exactly and from repo root; no shell-command
  rewriting or fallback substitution.
- `n/a` is Build-approved input, never validator discretion.
- The Build plan remains canonical; tracker task bodies are projections.
- Generated panel agents remain non-canonical and ignored.
- Tests make no paid model or network call.
- Prompt section-heading compatibility follows ADR 0007/FS7; any required
  heading amendment is classified before implementation.

## Risks and dependencies

- **Manifest drift:** until programme child 2 ships Build templates, the Build
  author writes separate JSON manifests by hand from the canonical Build-plan
  task. The deterministic schema/runner catches malformed manifests, while
  human Build approval checks semantic fidelity between plan and manifest.
- **Shell portability:** commands are project-authored and may be shell-specific.
  The validator reports the actual environment failure; it does not translate
  commands.
- **Output volume and secrets:** raw command output can be large or contain
  secrets. The fixed 200-line/20-KiB tail and credential-pattern redaction reduce
  exposure but cannot recognise arbitrary secrets not present in protected env
  values; commands remain responsible for not printing sensitive files.
- **Scenario evidence:** test names may not literally contain scenario IDs. The
  manifest maps each owned scenario to one or more required command check ids;
  Build/human review decides whether that command is semantically sufficient,
  while the runner deterministically rejects missing/non-passing mappings.
- **Override drift:** consumer whole-file prompt overrides will not automatically
  receive the new contract. Readiness work later may report override status, but
  this change must provide explicit migration guidance now.
- **Self-hosting order:** the first task is an atomic cut-over. The new prompt and
  runner must be present and their offline checks green before the generated
  validator runs; the saved runtime receipt proves which prompt hash/model was
  used without pretending the model transcript is deterministic.
- **Sibling Build re-approval:** Adoption Readiness's approved Build and tracker
  projection must be refreshed after merge and explicitly re-approved before
  leaving Blocked.

## Definition of done

- [ ] The generic skill/prompt contains no unconditional TypeScript or other
      language-specific command.
- [ ] A strict task-manifest contract requires all five categories, stable ids,
      applicability, commands/reasons, and scenario/rule evidence.
- [ ] A deterministic schema/runner rejects missing category/id/argv/reason,
      duplicate id, invalid applicability, unmapped scenario, or unrun required
      check before a PASS verdict.
- [ ] JavaScript, TypeScript, and non-Node fixtures each preserve and run only
      declared argv arrays; mutation fixtures fail if an undeclared command is
      introduced or a declared command is substituted.
- [ ] Required command exit 0/nonzero/missing-executable cases produce pinned
      PASS/FAIL evidence; approved `n/a` produces N/A and never PASS.
- [ ] Every task-owned scenario maps to at least one passing required check id;
      missing, unknown, N/A, or failing mappings deterministically fail.
- [ ] Standards and banned-pattern checks remain mechanistic and fail when a
      declared rule/pattern is violated.
- [ ] Runner output/verdict grammar is deterministic; each check retains at most
      the last 200 lines and 20 KiB with a pinned truncation marker.
- [ ] Secret-sentinel fixtures prove protected environment credential values are
      redacted from reports; the runner never reads credential files.
- [ ] Generated validator-agent golden preserves naming/tools/FS7 headings,
      contains the portable contract, and omits the old fixed `npx tsc --noEmit`.
- [ ] Existing plan/spec/PR and `task_validate` resolution goldens remain
      unchanged; validator-agent naming/tools and all three FS7 headings remain.
- [ ] Consumer override migration and self-hosting bootstrap are documented.
- [ ] Each implementation task stores a runtime gate receipt showing manifest,
      deterministic runner PASS, generated-agent hash/model, and validator PASS;
      offline DoD claims are limited to runner/prompt tests.
- [ ] After merge, Adoption Readiness manifests/issues are refreshed and its
      Build is explicitly re-approved before tasks leave Blocked.
- [ ] `npm test` and `npm run lint` pass without live model/network calls.
- [ ] Plan, Specification, and PR panels reach no surviving high or medium
      findings with recorded adjudication.

## Context for the Specification author

Current generic law hard-codes five checks, including unconditional
`npx tsc --noEmit`, in both `SKILL.md` and `validator-task.prompt.md`. The prompt
accepts a free-form `<TASK_CHECKS>` block but does not define stable check ids,
applicability, malformed-input failure, bounded evidence, or an honest way for a
non-TypeScript project to proceed.

The Specification must pin stable verification scenario IDs, JSON manifest
schema, deterministic runner CLI/output/exit rules, argv execution, 200-line/
20-KiB evidence limits, redaction, scenario mappings, FS7 heading compatibility,
override migration, runtime receipt, cut-over order, and sibling Build re-
approval. It must not choose implementation task boundaries or create tracker
tasks; that belongs to Build after Specification approval.
