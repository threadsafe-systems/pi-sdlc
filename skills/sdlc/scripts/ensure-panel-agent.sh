#!/usr/bin/env bash
# ensure-panel-agent.sh — thin entry point for the sdlc panel-agent stamper.
# All logic lives in ensure-panel-agent.mjs (JSON config handling in node).
#
# Usage: ensure-panel-agent.sh <plan_review|spec_review|pr_review|task_validate> \
#          [--dir DIR] [--tools CSV] [--force] [--config DIR|--repo-root DIR]
set -euo pipefail
exec node "$(dirname "$0")/ensure-panel-agent.mjs" "$@"
