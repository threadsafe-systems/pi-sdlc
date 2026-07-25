### Missing required flags can perform malformed mutations

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 228-270
- problem: The CLI never validates each subcommand's required options or numeric values. `create-task` without `--parent` creates an unparented task, while omitted `--title`/`--body` are passed to `gh` as literal `undefined`.
- repro_or_impact: With a fake `gh`, `create-epic --repo-root ...` succeeded while invoking `gh issue create --title undefined --body undefined`; malformed or orphaned tracker records can therefore be created instead of producing the documented usage error.

### Partial create failures lose the created issue identity

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 122-136
- problem: After successfully creating an issue, any node lookup, parent wiring, or board-add failure returns only the downstream error and discards the new issue's number and URL. There is neither rollback nor partial-result metadata.
- repro_or_impact: A fake board failure returned `{ok:false,reason:"project unavailable"}` after issue `#123` had already been created. A caller cannot recover through this interface and may retry, creating duplicate issues.

### The binding CLI surface was not implemented

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 37-38, 228-248
- problem: The binding Build plan requires `--gh-cmd`, `--repo`, `--project`, `--owner`, and `--labels`, but the parser rejects all of them and hardcodes `gh`; only singular repeated `--label` exists.
- repro_or_impact: Invocations using `--gh-cmd`, `lookup-node --repo`, or `set-status --project ... --owner ...` each exit 2 with "unexpected argument," so the approved interface and executable fake-command testing seam are unavailable.

### Bulk status cleanup acceptance is absent

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 202-217
- problem: `set-status` can update exactly one `--item`; it cannot consume filters or the output of `find-items`. This does not implement the Plan's bulk-by-filter status operation or Build T4's required board-cleanup demonstration.
- repro_or_impact: Moving every matching board item still requires an external JSON parser and loop; the documented examples only show one fixed issue, and no fake-CLI test demonstrates the required bulk cleanup.

### Frontier can admit tasks with omitted open blockers

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 151-160
- problem: Each child fetches only `blockedBy(first:10)` without requesting or checking that connection's `pageInfo`, then treats those ten nodes as the complete blocker set.
- repro_or_impact: A child whose first ten blockers are closed but whose connection has another open blocker is returned as runnable. A fake response with `blockedBy.pageInfo.hasNextPage:true` reproduced the incorrect frontier inclusion.

### Creation does not guarantee Todo status

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 97-103, 122-136
- problem: `create-epic` and `create-task` only call `gh project item-add`; they never resolve the Status field or set its `Todo` option despite the binding contract and documentation promising that state.
- repro_or_impact: On a project without an enabled item-added workflow, newly created epics/tasks remain statusless and disappear from Todo-based views and filters.
