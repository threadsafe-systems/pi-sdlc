#!/usr/bin/env bash
# collect-run.sh — thin entry point for the sdlc-retro post-mortem collector.
# All logic lives in collect-run.mjs.
#
# Usage: collect-run.sh --slug S [--out FILE] [--format text|json]
#          [--git-cmd CMD] [--base-ref BRANCH] [--gh-cmd CMD] [--no-github]
#          [--sessions-dir DIR]... [--config DIR|--repo-root DIR]
# Exit: 0 success; 1 nothing collectable; 2 usage/operational error.
set -euo pipefail
exec node "$(dirname "$0")/collect-run.mjs" "$@"
