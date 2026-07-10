#!/usr/bin/env bash
# sdlc-status.sh — thin entry point for the sdlc opt-in status probe.
# All logic lives in sdlc-status.mjs (JSON config handling in node).
#
# Usage: sdlc-status.sh [--config DIR|--repo-root DIR]
# Reports whether the consumer repo (FS3-resolved) has opted in, plus its
# prefix/labelPrefix, configured hooks, and workflow/models presence.
# Exit 0 = opted in (valid config); 1 = no manifest; 2 = invalid config/bad args.
set -euo pipefail
exec node "$(dirname "$0")/sdlc-status.mjs" "$@"
