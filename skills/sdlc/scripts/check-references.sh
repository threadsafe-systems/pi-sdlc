#!/usr/bin/env bash
# NORMATIVE-REFERENCE-WRAPPER: FS11-v1
set -euo pipefail
exec node "$(dirname "$0")/check-references.mjs" "$@"
