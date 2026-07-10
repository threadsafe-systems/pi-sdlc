### `--hook-use` silently mangles colon-containing names instead of rejecting them

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 69-76 (parseHookUse)
- problem: `parseHookUse` splits on `:` and reconstructs `use` from fields 3–4 (`kind:name`) without validating the result against the `use` pattern (`^(skill|tool):[a-z][a-z0-9_-]*$`). When a user passes a `--hook-use` with a name containing extra colons (e.g. `"plan:before:tool:my:worktree:do stuff"` → 6 fields), the parser silently takes `kind=field3, name=field4`, constructs `use="tool:my"`, and puts the remainder including the user's intended name fragment into `do`. Since `"tool:my"` matches the use pattern, `validateConfig` accepts it and the config is written with **different semantics than the user intended** (`use="tool:my"` instead of the intended `use="tool:my:worktree"`).
- repro_or_impact: `node setup-sdlc.mjs --repo-root /tmp/d --hook-use "implement:before:tool:my:worktree:enter the worktree: now" --yes` exits 0 and writes `{"use":"tool:my","do":"worktree:enter the worktree: now"}`. The user's intended `use="tool:my:worktree"` is silently truncated. A fix would add a `USE_RE.test(use)` check inside `parseHookUse` that fails early with a clear diagnostic, before `addHook` is called. (Note: the name pattern already forbids colons, so this is invalid input — the bug is that it's silently accepted rather than rejected.)

### Exit code 1 is unreachable in setup-sdlc (spec contract not honoured)

- severity: medium
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: approx 150-170 (interview), approx 186-191 (non-interactive path)
- problem: The spec (§5.1 exit codes) says exit 1 means "user declined/aborted the interview", but neither code path produces exit code 1. The interactive interview has no decline/abort mechanism (no cancel prompt, no clean abort handling), and the non-interactive flag path always calls `writeConfig` which exits 0 or 2. Sending SIGINT during the interview exits with signal code (130 on typical shells), not 1. A tool or CI that checks for exit code 1 to detect user abort would never see it.
- repro_or_impact: Run `setup-sdlc.mjs` (interactive, no flags) and try to "decline" — no mechanism exists. The exit-code contract of the spec is not fulfilled by the implementation.

### Malformed `--hook-use` edge case test gaps: colon-in-name and `\r` in command

- severity: low
- confidence: medium
- file: test/setup-sdlc.test.js
- line: approx 102-115 (OH5 malformed hook flags test block)
- problem: The malformed hook flag test covers bad-phase, bad-timing, too-few-fields, bad-use-kind, and 2-field `--hook-run`. It does not cover: (a) `--hook-run "plan:before:"` (empty command after 2nd colon — correctly caught but untested); (b) `\r` (carriage return) in a `run` command; (c) `--hook-use` with a `use` name that contains a colon (the case from the first finding above, where the parser silently mangles input). Verified: `node setup-sdlc.mjs --repo-root /tmp/d --hook-run 'plan:before:line1\rline2'` exits 2 (caught by `SINGLE_LINE_RE`), and `--hook-run 'plan:before:'` exits 2 (caught by pattern). Both are correct but untested.
- repro_or_impact: No current bug — the implementation handles these. The gap is regression risk: a future refactor of `validateHookItem` or `SINGLE_LINE_RE` could accidentally accept these without any test noticing.

### `validateConfig` error path references unwritten file path in setup-sdlc

- severity: low
- confidence: medium
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 123 (validateConfig call in writeConfig), lib.mjs:107 (validateConfig)
- problem: In `writeConfig`, `validateConfig(cfg, target)` is called before `mkdirSync`/`writeFileSync`. The `target` path is `<root>/.pi/sdlc/sdlc.config.json`. If validation fails, the error diagnostic says `sdlc config <target>: <detail>` — naming a file that hasn't been written yet (and whose parent directory may not exist). The message is misleading because it points at a non-existent file as if that file caused the error, when the error is in the to-be-written object.
- repro_or_impact: A user who passes `--hook-use "plan:before:tool:bad.name:do stuff"` sees: `sdlc config /tmp/.../.pi/sdlc/sdlc.config.json: hooks.plan.before[0].use must match ...` — the user might look at the (non-existent) file for the problem when the actual issue is in their CLI flags. The diagnostic should distinguish "config to be written" from "existing config file."
