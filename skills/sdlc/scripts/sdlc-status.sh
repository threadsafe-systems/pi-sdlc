#!/usr/bin/env bash
# sdlc-status.sh — thin entry point for the FS8 four-state readiness gate.
# All logic lives in sdlc-status.mjs; this wrapper's contract is identical.
#
# Usage: sdlc-status.sh [--config DIR | --repo-root DIR] [--format text|json]
# Read-only inspection of the consumer repo (FS3-resolved): adoption binds to
# the manifest blob in current HEAD; readiness needs clean+valid config,
# committed+clean+valid models, and a readable optional workflow.md.
# Exit: 0 ready; 1 not-adopted; 2 error (CLI/root/git/config); 3 not-ready.
set -euo pipefail
exec node "$(dirname "$0")/sdlc-status.mjs" "$@"
