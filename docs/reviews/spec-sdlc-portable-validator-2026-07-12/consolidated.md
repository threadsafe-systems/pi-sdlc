# Consolidated spec review — portable per-task validator

- Target: `docs/specs/2026-07-12-sdlc-portable-validator.md`
- Plan: `docs/plans/2026-07-12-sdlc-portable-validator.md`
- Successful panel: `anthropic/claude-opus-4-8:high`, `zai/glm-5.2:high`
  (two vendors; minimum satisfied; OpenAI excluded as author)
- `moonshotai/kimi-k2.6:high` timed out after 900 seconds; timeout output is
  retained as `kimi-k2.6-timeout.md` and contributed no adjudicable findings.
- Orchestrating model: OpenAI

## High

### H1 — Runner report persistence was unreachable from the frozen CLI

Both successful reviewers found the spec promised atomic report writes and
report-write errors without defining an output flag; the LLM was expected to
copy stdout “verbatim.”

**Adjudication: incorporated.** PV2 now has optional `--report PATH`. The runner
atomically writes the exact JSON bytes and stdout matches them. Report-write
failure is a representable ERROR. The validator invokes this flag and does not
copy report content itself.

### H2 — Generic `SKILL.md` law was not specified or scenario-gated

**Adjudication: incorporated.** New §6 pins manifest/runner/receipt law, removes
unconditional TypeScript and CONTRIBUTORS assumptions, preserves mechanistic
one-validator semantics, and adds bypass/stale-override red flags. PV10 mutation-
tests every required law item.

## Medium

### M1 — Normative manifest example was invalid

**Adjudication: incorporated.** `static.lint` and `patterns.diff` command entries
were added, with evidence labels; every category reference now resolves.

### M2 — Evidence truncation allowed multiple conforming algorithms

**Adjudication: incorporated.** Decode → LF-normalise → redact → independently
bound each stream to 100 lines/10,240 bytes. No borrowing. Complete-line then
Unicode-scalar trimming and marker accounting are pinned; combined maximum is
200 lines/20,480 bytes.

### M3 — Redaction matched benign names such as AUTHOR/MONKEY

**Adjudication: incorporated.** Credential tokens must be underscore/start/end
delimited. Common API/OAuth/AWS names match; MONKEY/AUTHOR/KEYBOARD do not.

### M4 — Runner ERROR had no generic diagnostic field

**Adjudication: incorporated.** `errors[]` represents CLI/root/execution/report-
write errors; `manifestErrors[]` is manifest-specific. ERROR requires at least
one combined entry.

### M5 — Receipt agent hash was not verifiable from stored artifacts

**Adjudication: incorporated.** Receipt directories store
`generated-agent.md`; its hash must match the dispatch source at validation time
and remains independently verifiable after worktree cleanup.

### M6 — Standards/rule evidence mapping was lost

**Adjudication: incorporated.** Every command now has non-empty evidence labels,
reported with command results. Human Build approval judges semantic sufficiency;
the runner enforces presence/mapping mechanically.

### M7 — Cross-field error pointers were ambiguous

**Adjudication: incorporated.** Fixed rule order, canonical JSON pointers, and
lexicographic same-pointer ordering are specified.

## Low findings incorporated

- The spec explains category/applicability normalisation through the categories
  map instead of per-check duplication.
- Windows/POSIX executable semantics are explicit; the runner never silently
  inserts a shell or rewrites argv.
- PV11 separates offline receipt/hash tests from runtime model evidence.

## Stop condition

No high or medium finding survives adjudication in the revised Specification.
The next gate is human approval. No Build plan, portable-validator tracker epic,
or implementation begins before approval.
