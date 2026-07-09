# ADR 0005: script CLIs (FS5)

- Context: the SKILL and consumers invoke `resolve-panel.sh` / `ensure-panel-agent.sh`
  by flag and rely on their stdout/exit-code contract.
- Decision: freeze the flags (`--author`, `--pong`, `--models-file`, `--emit-tasks`,
  `--config`, `--repo-root`, `--dir`, `--tools`, `--force`), the `--emit-tasks` JSON
  shape, and exit codes (0 ok / 1 under-panel / 2 bad input). `resolve-panel` reads
  only models; `ensure-panel-agent` reads only config.
- Consequences: renaming a flag or changing an exit code is a breaking change.
