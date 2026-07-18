#!/usr/bin/env bash
# setup-sdlc.sh — thin entry point for the sdlc opt-in scaffolder.
# All logic lives in setup-sdlc.mjs (JSON config handling in node).
#
# Usage: setup-sdlc.sh [--preset solo|standard|full]
#          [--review-brainstorm human|off] [--review-design panel|advisory|human|off]
#          [--review-code panel|advisory|human|off] [--review-tasks subagent|self|off]
#          [--panel-size N] [--on-shortfall proceed|fail]
#          [--separate-spec true|false] [--publish-to-tracker N|never]
#          [--default-track irreversible|reversible] [--override track:dial:value]
#          [--prefix V] [--label-prefix V] [--announce V]
#          [--tracker-repo owner/name --tracker-board-number N --tracker-board-url U]
#          [--hook-run "<phase>:<before|after>:<command>"]
#          [--hook-use "<phase>:<before|after>:<kind>:<name>:<do>"]
#          [--seed-panels] [--with-ci-workflow] [--copy-prompts] [--force] [--yes]
#          [--config DIR|--repo-root DIR]
# Writes <root>/.pi/sdlc/sdlc.config.json (opt-in). Older-schema configs are
# refused with an honest remedy: re-run with --force to write a fresh v3
# config, or pin the prior release. There is no config migration.
set -euo pipefail
exec node "$(dirname "$0")/setup-sdlc.mjs" "$@"
