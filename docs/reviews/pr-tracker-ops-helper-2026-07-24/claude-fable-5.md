### `--repo-root`/`--config` are silently ignored — the tool resolves the wrong repo's config

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 230, 256
- problem: `parseArgs` initialises `opts` with `repoRoot: "", config: ""` and `main` passes them straight to `inspectRoot({ config: opts.config, repoRoot: opts.repoRoot, cwd })`. `inspectRoot`'s chain is `config ?? repoRoot ?? sdlcRoot ?? $SDLC_ROOT` — the empty-string `config` is non-nullish so it wins the `??` chain, then fails the `if (explicit)` truthiness check, so **both flags are dead** and resolution always falls back to the cwd ancestor walk. Every sibling script initialises these to `undefined` (check-lifecycle.mjs:57, sdlc-status.mjs:67) or guards with `config || undefined` (record-run-event.mjs:138 — this exact gotcha is already documented in-repo).
- repro_or_impact: Reproduced: `node tracker-ops.mjs find-items --repo-root /tmp/to-fixture` from `/tmp` (fixture has a valid `.pi/sdlc/sdlc.config.json`) → `tracker-ops: cannot locate a consumer repo; pass --config <dir> or set $SDLC_ROOT`, exit 2. Worse: run from *inside a different sdlc-adopting repo* with `--repo-root` pointing at the intended one, and the tool silently uses the cwd repo's `tracker.repo`/board/labelPrefix — a mutating subcommand (`create-epic`, `set-status`) then writes to the **wrong repo's tracker**. The new doc explicitly instructs "pass `--repo-root DIR` when not running from the consumer root" (assets/tracker-ops.md:53-54), so this documented path is broken. The only test exercising this (`main: dispatches find-items end to end`) passes for the wrong reason: it never overrides `cwd`, so `inspectRoot` finds the pi-sdlc repo's *own* config and the fixture passed via `--repo-root` is never read.

### Missing required options are not validated — `create-epic --title t` creates a live issue with body `"undefined"`

- severity: high
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 106-113, approx 258-266
- problem: No subcommand validates its required options. A missing `--body` (or `--title`) flows as `undefined` into the `gh` args array; `spawnSync` stringifies non-string args (verified: `spawnSync("echo",["a",undefined])` → `"a undefined"`), so `gh issue create --title t --body undefined` runs for real, succeeds, gets labeled, sub-issue-wired, and board-added, returning `{ok:true}` exit 0. Verified through the seam: `main(["create-epic","--title","t"])` produced `["issue","create","--repo","threadsafe-systems/pi-sdlc","--title","t","--body",undefined,...]` and an `ok:true` result. The script's own contract (header line 23) says usage errors are exit 2.
- repro_or_impact: A one-flag slip creates garbage remote state (a real GitHub issue titled/bodied `undefined`, on the board, under the epic) and reports success — the caller has no signal anything went wrong. Similarly `--issue`/`--parent`/`--number` omissions become `NaN`/`undefined` in GraphQL variables (`-F n=undefined`), surfacing as confusing exit-1 gh errors instead of exit-2 usage errors.

### The build plan's binding `--gh-cmd` global flag was never implemented

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 37-40, 229-249
- problem: The build plan's "Interface design (**binding for Implement — do not redesign mid-task**)" section mandates a global `--gh-cmd CMD` flag ("default `gh`, `execFile`-no-shell, injectable for tests") on every subcommand, and the Plan's test bullet specifies "fake-`--gh-cmd` unit tests ... following the existing fake-executable test pattern". The shipped CLI has no such flag — `parseArgs` rejects it (`tracker-ops: unexpected argument: --gh-cmd`, exit 2; reproduced), `defaultGh` hardcodes `spawnSync("gh", ...)`, and injection exists only via the JS-level `main(argv, {gh})` parameter. Consequently the real spawn path (`defaultGh`, including its trim/`code:-1` handling) is entirely untested, and the CLI-as-invoked can never be pointed at a fake executable.
- repro_or_impact: Anyone following the governing build-plan interface (or porting the other scripts' `--*-cmd` seam habits) gets exit 2. This is a direct conformance break against the documents this reversible-track review is grounded in.

### `frontier` ignores `blockedBy` pagination — issues with >10 blockers can be falsely reported unblocked

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 152-161
- problem: The frontier query fetches `blockedBy(first:10)` with no `pageInfo { hasNextPage }` on that connection, then treats a child as unblocked when *every fetched* blocker is CLOSED. If a child has 11+ blockers and the first 10 are closed but a later one is open, it lands on the frontier. The same function explicitly guards the `subIssues(first:100)` connection with a `hasNextPage` refusal ("refusing an incomplete frontier"), so the author demonstrably cares about exactly this failure class — and the Plan mandates preserving the "`blockedBy`-is-a-connection" caveat.
- repro_or_impact: A frontier consumer (task dispatch) claims and starts work on a task that is actually blocked. Failing test: fake gh returning 10 CLOSED blockedBy nodes for an issue that has an 11th OPEN blocker → `frontier` returns it as available.

### `create-epic`/`create-task` partial failure loses the created issue — invites duplicate creation

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 122-137
- problem: `opCreateEpicOrTask` is a four-step remote mutation (create → lookup → addSubIssue → boardAdd). If any step after `createIssue` fails, the function returns that step's bare `{ok:false, reason}` — the already-created issue's `number`/`url` are discarded from the result. The operation is not idempotent and reports no partial progress.
- repro_or_impact: A transient `gh` failure at the board-add step (rate limit, network) leaves a real issue on GitHub while the tool reports failure; the natural agent recovery is to re-run the command, creating a duplicate issue. This inverts the tool's stated purpose ("the exact 're-finding what I just created' gap this tool exists to close"). Fix shape: include `created.number`/`created.url` (and which step failed) in every post-create failure result.

### `find-items` silently truncates at 1000 board items — no `totalCount` guard

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 176-179
- problem: `gh project item-list ... --limit 1000` is taken as complete: the response's `totalCount` (which the test fixtures even fabricate) is never compared against `items.length`, so a board with >1000 items yields silently incomplete results. `frontier` refuses incomplete pages; `find-items` — and `set-status`-by-issue-number, which resolves through it — does not.
- repro_or_impact: On a large board, `set-status --item <n>` returns `{ok:false, reason:"no board item found for issue #n"}` for a genuinely-boarded issue, and bulk `find-items --status` sweeps miss items with no warning — the exact bulk-cleanup use case this tool was built for (board 5 already carries multiple epics' items and only grows).

### Item resolution matches on issue number only — cross-repo collisions on multi-repo boards mutate the wrong item

- severity: medium
- confidence: medium
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 179-199, 210-215
- problem: `opFindItems` projects `content.number` and drops `content.repository`, so an org project holding items from more than one repo makes `--number N` ambiguous; `opSetStatus` then takes `found.items[0]` — possibly another repo's issue #N — and edits its status. The `--since` join compounds it: it queries `issue(number:N)` in `tracker.repo` for *every* item, so a foreign-repo item is filtered by the timestamp of the same-numbered issue in the wrong repo.
- repro_or_impact: On any board that ever aggregates a second repo (org projects support this; the board is org-owned), `set-status --item 42 --status Done` can move the wrong repo's #42. Fix shape: filter candidates by `content.repository === tracker.repo` (or expose it and refuse ambiguity).

### `needVal` rejects any value beginning with `-` — bodies/titles/substrings starting with a dash are unpassable

- severity: low
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: 222-225
- problem: `needVal` treats any value starting with `-` as a missing value and exits 2. Reproduced: `create-epic --title t --body "- first bullet" --repo-root ...` → `tracker-ops: --body requires a value`, exit 2. The doc's own canonical example is `--body "$(cat epic-body.md)"`; a body whose first character is a markdown bullet (`- `) — common in this repo's issue bodies — cannot be passed. Same for `--title-contains "-"` or a negative-looking token.
- repro_or_impact: Legitimate documented invocations fail with a misleading "requires a value" diagnostic; the agent's workaround will be exactly the hand-rolled `gh` call the SKILL.md rule now forbids.

### `--format` value is unvalidated — any typo silently selects text output

- severity: low
- confidence: high
- file: skills/sdlc/scripts/tracker-ops.mjs
- line: approx 279-283
- problem: The final print branch is `format === "json" ? ... : text`, and `parseArgs` accepts any `--format` value, so `--format jsn` (or anything else) silently produces text output instead of an exit-2 usage error, unlike the documented `json|text` contract.
- repro_or_impact: A scripted caller expecting JSON on stdout gets `ok: {...}` prose and its parse breaks downstream; contract says unknown usage is exit 2.

No further high-severity findings. Baseline smells beyond those folded in above: none rising past the concrete defects already listed (the parallel flag-cascade/dispatch if-chains in `parseArgs`/`main` mirror the repo's existing script convention, so not flagged).
