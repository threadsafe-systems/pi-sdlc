# ADR 0013: the task-validation manifest is a frozen surface (PV1)

- Context: the per-task validator previously hard-coded five checks in prose,
  including an unconditional `npx tsc --noEmit` and a `CONTRIBUTORS` grep. That
  is not portable: a non-TypeScript repo cannot honestly pass, and a
  documentation task has no meaningful typecheck. Build already owns each task's
  real check commands and scenario ids, so the gate should execute those, not a
  language the skill imposes.
- Decision: every implementation task carries a committed JSON manifest at
  `docs/validation/<feature>/<task-id>.json` validated by
  `schema/task-validation-manifest.schema.json` (schemaVersion 1). It declares
  checks as exact argv arrays with evidence labels, five mandatory categories
  (`tests`, `static`, `scenarios`, `standards`, `bannedPatterns`) each `required`
  or `n/a` with a Build-approved reason, and an exact owned-scenario → required-
  check mapping. The Build plan is canonical; the manifest is its executable
  projection and is reviewed at the Build human gate. The check set/shape is
  additive within schemaVersion 1; a new required field or category is a major
  bump.
- Consequences: task validation is portable across languages and repos, and a
  task cannot pass because the whole suite happens to be green — only its
  declared, scenario-mapped checks count. `n/a` is a Build decision, never
  validator discretion. A malformed manifest fails before any command runs.
