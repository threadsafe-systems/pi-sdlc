### H1 — RESOLVED (tracker-ops.mjs:302-364)
Options default to `undefined`; unrelated-cwd regression test passes.

### H2 — PARTIAL (tracker-ops.mjs:295-358)
`needInt` accepted zero; `create-task --parent 0` created and boarded a task with zero `addSubIssue` calls.

### H3 — PARTIAL (tracker-ops.mjs:302-326)
`--gh-cmd` genuinely reaches the real spawn path (RESOLVED on that narrow point). But the parser still rejects binding `--repo`, `--project`, `--owner`, `--labels`; only repeated `--label` exists. **The dismissal is not defensible**: the committed Build plan explicitly marks its interface "binding for Implement — do not redesign mid-task" and separately specifies these subcommand flags at docs/plans/2026-07-24-tracker-ops-helper-build.md:9-39; config-derived global resolution does not contradict also supporting command-specific overrides, and the governing Plan repeats them at lines 55-72.

### M1-M5 — RESOLVED
(Partial-create identity, blockedBy pagination, find-items truncation, cross-repo collisions, explicit Todo — all verified against the committed blob and passing tests.)

### M6 — PARTIAL
`--from-status` bulk updates work and report partial progress, tested. But Build T4 requires the bulk invocation demonstrated in `assets/tracker-ops.md`, which still showed only single-item `set-status`; the bulk test also calls `opSetStatus` directly rather than the executable seam.

### L1 — RESOLVED

### NEW DEFECTS
No new high-severity defects.

**Bulk status updates also mutate repository-less draft items** (medium, high confidence) — repository filtering deliberately retained items with absent `content.repository`; a fake board with one configured-repo issue and one Todo draft produced `item-edit` calls for both.

**Large-board filters cannot overcome the truncation refusal** (medium, high confidence) — the truncation guard runs before every local filter, and none of `--number`/`--status`/`--title-contains` is passed to `gh project item-list` as a server-side query, so the diagnostic's suggested narrowing cannot work; exact item lookup, single-number set-status, and bulk cleanup all become unusable past 1000 items.

No new low-severity defects.
