# ADR 0014: the task-validation runner and receipt are a frozen surface (PV2)

- Context: PV1 (ADR 0013) defines what a task must check; something deterministic
  must execute it. Leaving execution and pass/fail judgement to the validator LLM
  would reintroduce the non-determinism and honesty gaps the change exists to
  remove.
- Decision: `scripts/validate-task.sh` → `validate-task.mjs` is the frozen runner
  CLI (`--manifest`, `--repo-root`, `--format text|json`, `--report`, `--help`).
  It validates the manifest, executes only declared argv with `shell:false` and
  the inherited environment from the repo root, evaluates categories/scenarios,
  bounds each command's evidence to the last 100 lines / 10,240 bytes per stream
  with a fixed truncation marker, redacts credential-named environment values,
  and returns `PASS` (0) / `FAIL` (1) / `ERROR` (2) with an exact text/JSON
  report shape. `--report` persists the JSON atomically. The validator subagent
  runs the runner, confirms exit and verdict agree, and reports results; it never
  runs an undeclared command, decides applicability, or judges quality. Each task
  stores a runtime receipt (manifest copy, runner report, generated-agent copy,
  sha256 hashes, model, verdicts) under
  `docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verified by
  `scripts/verify-task-receipt.mjs`.
- Consequences: task pass/fail is mechanical and reproducible offline; the model
  is a reporter, not a judge. The receipt is agent-emitted runtime evidence, not
  proof of model determinism, but its hashes make stored artifacts tamper-
  evident. Output/exit/report shapes are additive within schemaVersion 1; a new
  field or exit meaning is a major bump. The runner is POSIX-portable and makes
  no network, model, or credential-file access; Windows manifests must declare
  executable argv (no implicit shell), since `shell:false` does not resolve
  `.cmd` shims. Both the manifest and the `--report` target are confined to the
  repo root (a stray report path cannot clobber an arbitrary file). Redaction is
  scoped to credential-named environment values only (defence in depth); a
  command that prints a secret from a config file or a non-credential-named
  variable is the command's responsibility, not the runner's.
