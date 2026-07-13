#!/usr/bin/env bash
# validate-task.sh — thin entry point for the deterministic per-task validation
# runner (PV2). All logic lives in validate-task.mjs.
#
# Usage: validate-task.sh --manifest PATH [--repo-root DIR] [--format text|json] [--report PATH]
# Exit: 0 PASS; 1 FAIL; 2 ERROR (CLI/manifest/root/runner/report-write).
set -euo pipefail
exec node "$(dirname "$0")/validate-task.mjs" "$@"
