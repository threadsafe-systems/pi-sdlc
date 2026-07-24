### H1 — RESOLVED (tracker-ops.mjs:304,364)
Defaults undefined; `opts.config || undefined`; unrelated-CWD test passes.

### H2 — RESOLVED (tracker-ops.mjs:336-359)
Per-command validation exits before any `gh` call; missing body/parent and non-integer tests pass. (Author note: Fable/Sol found the `0`/`""` floor gap in the *same* commit Luna verified here as RESOLVED for the literally-missing-flag case — the floor gap is tracked as a new defect below, converging with Fable/Sol's N1.)

### H3 — RESOLVED (tracker-ops.mjs:51-55,309,368)
`spawnSync` uses the parsed command; fake-executable subprocess test passes.

### M1 — RESOLVED. M2 — RESOLVED. M3 — RESOLVED. M4 — RESOLVED. M5 — RESOLVED. M6 — RESOLVED
`--from-status` filters and updates every match, returning partial progress on failure; both bulk tests pass. (Author note: Fable/Sol flagged the doc-example gap under M6 as PARTIAL; Luna's ruling is code-only and doesn't contradict that — the doc gap is incorporated regardless.)

### L1 — RESOLVED

### NEW DEFECTS

**Zero `--parent` creates an orphan task** (medium, high confidence) — `needInt` accepts `0`; `if (parent)` treats it as absent; `create-task --parent 0` created and boarded a task with no `addSubIssue` call. Converges with Fable's N1/Sol's H2-partial.

**Invalid `--since` silently reports success with no matches** (low, high confidence) — `Date.parse` never validated; converges with Fable's N4.

**Bulk status mode is undocumented in the primary asset** (low, high confidence) — converges with Fable's N6/Sol's M6-partial.
