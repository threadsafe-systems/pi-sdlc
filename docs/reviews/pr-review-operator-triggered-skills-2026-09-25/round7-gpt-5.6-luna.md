### Definition-of-done exit-2 clause contradicts an existing exit-1 path

- severity: medium
- confidence: medium
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 151-155
- problem: The amended DoD says `sdlc-status` exits 2 “whenever that proof fails,” but an adopted Git worktree with no committed manifest intentionally exits 1 through `adoption.manifest-head:fail` (`skills/sdlc/scripts/sdlc-status.mjs:202,355-357`).
- repro_or_impact: The existing `filesystem-only manifests are not committed adoption` test uses a Git fixture and expects exit 1 (`test/sdlc-status.test.js:186-208`). A literal implementation of the new DoD would regress this established not-adopted path to exit 2.