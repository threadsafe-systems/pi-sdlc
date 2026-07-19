#!/usr/bin/env bash
# harvest-panel.sh — thin entry point for the FS13 panel-telemetry harvest CLI.
# All logic lives in harvest-panel.mjs.
#
# Usage: harvest-panel.sh --phase PANEL_PHASE --round N [--wave W] --from DIR [--slug S]
#          [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]
set -euo pipefail
exec node "$(dirname "$0")/harvest-panel.mjs" "$@"
