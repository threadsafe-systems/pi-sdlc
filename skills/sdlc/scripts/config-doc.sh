#!/usr/bin/env bash
# CONFIG-DOC-WRAPPER: render/write/check the generated .pi/sdlc/CONFIG.md companion.
set -euo pipefail
exec node "$(dirname "$0")/config-doc.mjs" "$@"
