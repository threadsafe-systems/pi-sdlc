#!/usr/bin/env bash
# resolve-panel.sh — thin entry point for the sdlc panel resolver.
# All logic lives in resolve-panel.mjs (JSON handling is cleaner in node).
#
# Usage: resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> \
#          [--author <provider/model>] [--pong] \
#          [--track irreversible|reversible] [--emit-tasks <agent>] \
#          [--config DIR|--repo-root DIR]
set -euo pipefail
exec node "$(dirname "$0")/resolve-panel.mjs" "$@"
