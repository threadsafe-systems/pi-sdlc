#!/usr/bin/env bash
# tracker-ops.sh — thin entry point for the sdlc tracker-ops helper.
# All logic lives in tracker-ops.mjs.
#
# Usage: tracker-ops.sh <subcommand> [options] [--repo-root DIR|--config DIR]
#          [--format json|text]
# Subcommands: lookup-node, create-epic, create-task, add-blocked-by,
#   frontier, claim, find-items, set-status, board-add
# Exit: 0 success; 1 operation failed; 2 usage/operational error.
set -euo pipefail
exec node "$(dirname "$0")/tracker-ops.mjs" "$@"
