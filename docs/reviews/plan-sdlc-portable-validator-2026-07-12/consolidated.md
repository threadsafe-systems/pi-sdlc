# Consolidated plan review — portable per-task validator

- Target: `docs/plans/2026-07-12-sdlc-portable-validator.md`
- Panel: `zai/glm-5.2:high`, `anthropic/claude-opus-4-8:high`,
  `moonshotai/kimi-k2.6:high` (three vendors; OpenAI excluded as author)
- Orchestrating model: OpenAI

## High

### H1 — Deterministic verdict claims were impossible with prose and no parser

Two reviewers found the offline fixtures could not prove how an LLM interprets
malformed structured markdown or whether it invented commands/N/A.

**Adjudication: incorporated.** The plan now introduces a versioned JSON
manifest schema and deterministic non-networked runner. The runner validates
manifests, executes exact argv arrays, evaluates scenario mappings, bounds/
redacts evidence, and decides PASS/FAIL. The subagent invokes and reports the
runner instead of supplying those judgements.

### H2 — First-task self-hosting lacked explicit cut-over mechanics

**Adjudication: incorporated.** The first task atomically adds schema/runner,
prompt/law, and tests. At task end, the worktree contains the new green runner
and prompt; the orchestrator regenerates the agent from that worktree and saves
a receipt with prompt hash/model/verdict. No old-prompt gate or TypeScript
exception is used.

## Medium

### M1 — Runtime self-hosting was not reproducible offline

**Adjudication: incorporated.** Offline claims are limited to deterministic
runner and prompt/golden tests. The live validator transcript is explicitly a
runtime gate receipt, not deterministic test evidence.

### M2 — Adoption Readiness re-projection lacked re-approval

**Adjudication: incorporated.** After merge, its canonical Build manifests and
issue bodies are refreshed and Neil Chambers re-approves that Build before any
item leaves Blocked.

### M3 — Output bounds and secret handling were subjective

**Adjudication: incorporated.** Per-check evidence retains at most the last 200
lines and 20 KiB with a pinned marker. Credential-pattern environment values are
redacted; sentinel fixtures fail on leakage, and the runner never reads
credential files.

### M4 — Validator standards input overlapped programme child 1

**Adjudication: incorporated.** This child owns neutralising the validator
prompt input into manifest-defined governing standards. Child 1 records that
ownership and does not edit the validator input later.

### M5 — FS7 heading/release impact was undecided

**Adjudication: incorporated.** All three existing validator `##` headings are
preserved verbatim, so ADR 0007 override-heading compatibility remains and no
ADR-0012 major release is triggered by headings.

### M6 — At-least-one command could force meaningless checks

**Adjudication: incorporated with a stricter honest rule.** Every implementation
task requires at least one meaningful mechanically executable check. Docs/ADR
tasks use docs/link/schema tests; if no mechanistic outcome exists, the task is
not implementation-ready and moves backward to Build rather than inventing a
command or vague assertion.

### M7 — Fixture location and task-validate golden were omitted

**Adjudication: incorporated.** Tests live in
`test/validator-contract.test.js` with manifests under
`test/fixtures/validator-manifests/`. DoD explicitly protects task-validator
resolution goldens, naming/tools, and FS7 headings.

## Low

Secret-sentinel/redaction DoD was added explicitly.

## Stop condition

No high or medium finding survives adjudication in the revised Plan. The next
gate is human approval. No Specification, Build, tracker projection, or
implementation for the portable validator begins before approval.
