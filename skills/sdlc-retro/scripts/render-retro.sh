#!/usr/bin/env bash
# render-retro.sh — thin entry point for the sdlc-retro dashboard renderer.
# All logic lives in render-retro.mjs.
#
# Usage: render-retro.sh --run FILE [--out FILE] [--format text|json]
# Exit: 0 written; 1 --run unreadable/unparseable/schema-invalid; 2 usage error.
set -euo pipefail
exec node "$(dirname "$0")/render-retro.mjs" "$@"
