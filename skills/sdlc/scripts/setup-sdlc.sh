#!/usr/bin/env bash
# setup-sdlc.sh — thin entry point for the sdlc opt-in scaffolder.
# All logic lives in setup-sdlc.mjs (JSON config handling in node).
#
# Usage: setup-sdlc.sh [--prefix V] [--label-prefix V] [--announce V]
#          [--tracker-repo owner/name --tracker-board-number N --tracker-board-url U]
#          [--hook-run "<phase>:<before|after>:<command>"]
#          [--hook-use "<phase>:<before|after>:<kind>:<name>:<do>"]
#          [--seed-panels] [--enforcement strict|preference] [--force] [--yes]
#          [--config DIR|--repo-root DIR]
# Writes <root>/.pi/sdlc/sdlc.config.json (opt-in). Existing schema-1 configs
# migrate only after a live-TTY confirmation; otherwise setup refuses safely.
set -euo pipefail
exec node "$(dirname "$0")/setup-sdlc.mjs" "$@"
