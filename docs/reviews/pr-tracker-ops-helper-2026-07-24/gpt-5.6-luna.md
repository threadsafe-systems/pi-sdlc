### Malformed creation commands mutate the tracker

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 122-136, 228-248
- problem: Required `--title`, `--body`, and `--parent` arguments are not validated. Missing `--parent` creates and boards an unparented task; missing title/body are passed to `gh`.
- repro_or_impact: `create-task --title x --body b` succeeds without `addSubIssue`; a no-argument `create-epic` invocation created remote issue #173 during review.

### Declared CLI flags are not implemented

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 228-270
- problem: The binding requires `--gh-cmd`, lookup `--repo`, project/owner flags, and `--labels`, but the parser supports none of these (only config-derived targeting and repeated singular `--label`).
- repro_or_impact: `find-items --gh-cmd /bin/false --repo-root .` exits 2 with `unexpected argument: --gh-cmd`; documented targeting and fake-command injection cannot work.

### Frontier ignores blockedBy pagination

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 151-160
- problem: The query fetches only `blockedBy(first:10)` and never checks that connection's `pageInfo`.
- repro_or_impact: A child with ten closed blockers and an eleventh open blocker is returned as frontier-ready, allowing work to start before its dependency is complete.

### find-items silently truncates large boards

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 175-180
- problem: `gh project item-list` is hard-capped at 1000 items without checking pagination or reporting truncation.
- repro_or_impact: On a board exceeding the cap, matching items beyond the first 1000 are omitted and bulk cleanup/status updates silently leave them untouched.

No low-severity findings.
