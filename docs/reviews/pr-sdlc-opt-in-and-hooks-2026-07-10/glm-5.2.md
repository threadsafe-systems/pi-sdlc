# Review: feat/sdlc-opt-in-hooks (db07616..d47ed9c) — glm-5.2

Adversarial pass. No high- or medium-severity defects found. Hunt targets
verified clean: hook-flag colon grammar (rejoin-after-Nth-colon preserves
embedded/double colons and empty fields), schema-vs-validateConfig drift
(0 drifts across 22 adversarial hook payloads), empty-string resolveRoot
(the `|| undefined` in callers is redundant; `resolveRoot` already treats
`""` as falsy via `if (explicit)`), run-hook security (documented, locked
trust boundary), OHx falsifiability (all scoped per spec; OH8 is
doc-presence by design). Two low findings below.

### Documented exit code 1 ("user declined/aborted") is unreachable in the interview

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 7, 142, 174, 187
- problem: The header comment (line 7) and spec §5.1 advertise exit 1 for
  "user declined/aborted the interview", but `interview()` offers no
  decline/abort branch — it unconditionally calls `writeConfig(...)` then
  `process.exit(0)`. Every `fail()` uses the default code 2, and the only
  `process.exit` calls are `exit(0)`; the only mid-interview exit is
  Ctrl+C (exit 130). Exit 1 is dead.
- repro_or_impact: `grep -n 'process.exit\|fail(' setup-sdlc.mjs` shows no
  exit-1 path. A caller scripting to the documented exit-code contract
  (treating 1 as "declined") would never observe it. No OH test covers it.

### Duplicated flag parsing diverges between the two new scripts (single- vs double-dash)

- severity: low
- confidence: high
- file: skills/sdlc/scripts/sdlc-status.mjs
- line: 22 (cf. setup-sdlc.mjs:27)
- problem: The `--config`/`--repo-root` argument loop plus a `needVal`
  helper are copy-pasted in both new scripts and the two `needVal` copies
  reject different inputs: sdlc-status rejects any value starting with `-`
  (`v.startsWith("-")`), setup-sdlc rejects only `--`
  (`v.startsWith("--")`). Thus `--config -relpath` is accepted by
  setup-sdlc (resolved relative to cwd) but rejected by sdlc-status.
- repro_or_impact: `setup-sdlc.mjs --config -relpath` writes into
  `cwd/-relpath/.pi/sdlc/`; `sdlc-status.mjs --config -relpath` exits 2.
  A symptom of duplicated arg-parsing that belongs in the shared `lib.mjs`
  alongside `resolveRoot`.
- smell: Duplicated Code
