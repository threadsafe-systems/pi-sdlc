# Plan: proactive code-prose discipline

Status: approved at Plan gate

Track: reversible

Issue: #176

Run slug: `writing-comments-discipline`

## 1. Problem

Implementation agents routinely narrate review history, issue provenance, task labels, and future work inside comments, docstrings, and test names. Giving an agent access to a comment-writing skill or reminding it during startup has not changed this behavior reliably: the current repository already carries a local workflow reminder, yet clear process-provenance examples remain in tracked tests. Retrospective PR cleanup wastes reviewer attention and lets stale prose survive when review misses it.

The lifecycle needs an authoring sequence that separates executable implementation from reader-facing prose, places an explicit audit at the task boundary, and lets the existing PR panel judge the final combined diff without creating a second review phase.

## 2. Objectives

1. Make reader-facing comments and docstrings a deliberate post-implementation activity rather than prose written during code construction.
2. Make every task audit changed comments, docstrings, and test names before validation or closure.
3. Give every normal PR reviewer one self-contained code-prose attack surface without adding specialist reviewers or changing panel floors.
4. Ship the discipline as portable pi-sdlc law, independent of any global or repository-local comment-writing skill.
5. Bring pi-sdlc's tracked source/test baseline into compliance for clear, unambiguous process-provenance violations.

## 3. Agreed design

### 3.1 Comment-last authoring

Reader-facing comments and docstrings are deferred until executable behavior is mechanically green. A deliberate code-prose pass then adds only prose needed to explain contracts, invariants, surprising constraints, or non-obvious rationale, while deleting narration, provenance, futures, apologies, and code restatement.

Machine-consumed or type-affecting comment forms—compiler, lint, coverage and generation directives, and semantically active JSDoc—are executable infrastructure and may be authored inline. Human-facing prose within those forms remains subject to the final pass.

### 3.2 Test-name treatment

Test names are necessarily authored with tests and are not deferred. The final code-prose pass audits every changed test name as a standalone behavioral claim. Current local Specification scenario IDs may remain as compact traceability tags when the rest of the name independently explains behavior. Canonical repository-wide scenario keys are deferred.

### 3.3 Task-close seam

The code-prose pass is mandatory for every implementation task:

- under `review.tasks: subagent|self`, immediately before deterministic validation;
- under `review.tasks: off`, immediately before commit or task completion;
- under standalone Implement, before declaring implementation complete.

The worker handoff must include exactly one uncommitted process attestation: `Code-prose pass: complete`. The parent does not dispatch validation or close the task without it. The attestation is not source text, manifest data, receipt data, or a committed artifact; PR reviewers judge the actual prose.

### 3.4 Authority and review

`references/phase-implement.md` owns the canonical, self-contained law. `references/phase-tasks.md` requires the pass in task Definition of Done. `prompts/adversary-review.prompt.md` carries the compact attack surface because stamped reviewers do not inherit phase context. Tests keep the authoring and reviewer surfaces aligned.

The normal PR panel reviews one frozen diff after the comment pass. No specialist reviewer, extra panel round, changed floor, or separate prose-review phase is introduced. Comment findings use impact-based severity and cannot be dismissed as style without an evidence-backed disposition.

### 3.5 Dogfood baseline

The change performs a bounded sweep of tracked source and test files and removes clear process-provenance comments/docstrings/test names. Ambiguous domain vocabulary is not rewritten merely because it resembles review terminology. The package law supersedes this repository's local `writing-comments` workflow reminder, which is removed once the package-owned route exists.

## 4. Scope

### In

- Canonical authoring/task-close law in `skills/sdlc/references/phase-implement.md`.
- Task-DoD projection in `skills/sdlc/references/phase-tasks.md`.
- Code-prose attack surface in `skills/sdlc/prompts/adversary-review.prompt.md`.
- Documentation/contract tests proving the authoring and reviewer surfaces retain the same core obligations.
- Removal of the redundant local `.pi/sdlc/workflow.md` reminder.
- Bounded cleanup of clear violations in tracked source and tests.
- Any required reference-inventory/frozen-surface handling for deliberately changed public surfaces.

### Out

- A CI scanner, denylist, AST comment parser, lint rule, or automatic prose classifier.
- Specialist comment reviewers or reviewer specialization generally.
- A second review phase or additional panel floor.
- Depending on, discovering, or negotiating precedence with global/local comment-writing skills.
- Markdown plans/specs/reviews/ADRs and shipped documentation archaeology such as `#38` surface-name citations; carry that cleanup to #178.
- Canonical/global scenario-key design; carry that contract to S1/#178.
- Retrofitting every historical ambiguous comment or renaming behaviorally adequate scenario-tagged tests.

## 5. Definition of Done

1. The Implement reference states comment-last ordering, the executable-directive exception, the five reader-now laws, test-name audit, configuration-independent closure seam, and exact handoff attestation.
2. The Tasks reference requires each task DoD to include the code-prose pass without making the deterministic validator a prose judge.
3. The PR reviewer prompt treats comments, docstrings, and test names as a concrete maintainability attack surface, applies impact-based severity, and rejects process narration as more than bikeshedding.
4. Contract tests fail if the Implement and reviewer surfaces lose any shared core obligation or if task-close ordering/attestation disappears.
5. The local workflow pointer to an optional global skill is removed after the package law becomes authoritative.
6. A bounded source/test sweep removes every clear process-provenance violation identified by the implementation audit; the PR adjudication records any disputed case rather than silently rewriting it.
7. Full tests, touched-surface lint, reference inventory, frozen-surface handling, lifecycle checking, and configured PR panel all pass.
8. No new runtime dependency, public code API, persisted shape, schema, panel role, review phase, or configuration dial is introduced.

## 6. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Comment-last becomes a box-ticking ceremony | Exact task-handoff barrier plus normal reviewers inspecting final bytes; no claim that attestation proves quality. |
| Deferring prose makes semantically active comments impossible to author | Executable/type-affecting comment forms are explicitly exempt from ordering, not from final prose audit. |
| Review expands into style bikeshedding | Prompt limits findings to reader harm, staleness, misleading behavior, process provenance, and non-obvious-contract failures; severity follows impact. |
| Self-contained guidance drifts between author and reviewer | Contract tests cover the shared obligations while each surface remains purpose-shaped. |
| Baseline cleanup becomes a taxonomy rewrite | Only clear source/test violations are changed; ambiguous/domain terms and Markdown archaeology are excluded. |
| Scenario traceability is damaged | Existing local scenario IDs remain allowed when paired with a standalone behavioral name; canonical keys are deferred. |

## 7. Assumptions

1. The task-close attestation is orchestration evidence and need not be persisted to prove prose quality.
2. Existing PR disposition rules are sufficient for code-prose findings; no new severity or stop rule is needed.
3. `phase-implement.md` is available to both full-lifecycle and standalone Implement flows, so it can own the law without a new public reference.
4. Reviewer prompts must remain self-contained because reviewer agents do not inherit the lifecycle references.

## 8. Carries

- **CARRY-TO-#178:** normalize shipped Markdown archaeology identifiers, including `#38`-style citations, in the glossary/identifier stream.
- **CARRY-TO-S1/#178:** design immutable, repository-unique scenario namespaces and canonical keys before treating test-name IDs as globally resolvable.

## 9. Context for Build

Build should decompose by authority surface rather than by paragraph: canonical Implement law and task projection; reviewer attack surface and parity contract; bounded baseline/workflow cleanup plus integrated verification. Do not add a prose scanner or broaden cleanup into documentation taxonomy. Price the full corpus and any focused contract tests within the existing per-commit budget.
