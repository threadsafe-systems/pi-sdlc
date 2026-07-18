#!/usr/bin/env bash
# FS13 emitter wrapper — delegates to record-run-event.mjs.
set -euo pipefail
exec node "$(dirname "$0")/record-run-event.mjs" "$@"
