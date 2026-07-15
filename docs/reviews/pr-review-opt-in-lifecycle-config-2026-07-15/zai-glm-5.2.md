# OL-A PR #48 review — `feat/opt-in-lifecycle` (adversarial, review-only)

Scope: T1 (schema / `inspectConfig` / `decomposeGateMode`), T2 (`resolve-panel`
model-identity resolution + frozen v1 path), T3 (`setup-sdlc` fresh-adoption
profiles / custom / existing-config refusal). Reviewed against spec rev4
(`docs/specs/2026-07-14-opt-in-lifecycle-config.md`) and the build plan.

Verified by execution, not prose: all 27 OL-A scenarios pass; full corpus
(185 tests) green; resolve-panel v1 path confirmed byte-identical to `main`
across 6 argument shapes (incl. `--author` vendor, `exclude_author_vendor`
toggle, `--emit-tasks`); setup `--yes` non-profile output matches the OLA16
hardcoded expectation. Schema/collector cross-checked and aligned (incl. the
`allOf` if/then "spec_review must be absent" idiom and `additionalProperties:
false` everywhere). Thinking-suffix recogniser is exact (`off/minimal/low/
medium/high/xhigh/max` only; Bedrock `:0`/`:1` retained). Worktree clean, no
edits made.

### Text-mode setup report silently drops the validation error reason

- severity: low
- confidence: high
- file: skills/sdlc/scripts/setup-sdlc.mjs
- line: 388 (text branch of `renderReport`), reached via 118 + 424-427
- problem: `renderReport`'s JSON branch (line 387) emits `report.error`, but the
  text branch (line 388) only prints `root:` / `exit-code:` / references /
  assets and never prints `report.error`. When an assembled config fails
  `inspectConfig` in `writeBundle` (line 424-427, e.g. an invalid `--prefix`,
  or an invalid dial collected by the interactive custom interview), the run
  exits 2 having written nothing, with NO explanation of why. The interactive
  custom path (line 118, `if (opts.lifecycle) return structuredClone(...)`)
  skips per-dial validation and defers everything to `writeBundle`, so a typo'd
  free-text mode / non-integer threshold produces a bare `exit-code: 2` and an
  empty asset list with no diagnostic.
- repro_or_impact: `setup-sdlc.mjs --repo-root <tmp> --profile standard --prefix
  BAD --yes` → stdout is `root: ...\nexit-code: 2\nreference: ... ok\nreference:
  ... ok\n` (stderr empty, no error text); the same run with `--format json`
  correctly shows `"error": "assembled configuration is invalid: prefix must
  match /^[a-z][a-z0-9-]*$/"`. Fresh adopters using the interactive custom path
  (a new OL-A surface) who mistype a value get a confusing exit-2 with no clue.
  Fix: emit `report.error` in the text branch (one line, e.g. push
  `error: ${report.error}` after the exit-code line when set).
- smell: Duplicated Code (the JSON/text branches already encode the same report;
  the omission is an asymmetry between two renderings of one shape) — judgement
  call, capped at low.

## Notes (not defects — judged spec-compliant / pre-existing, recorded for the parent)

- `resolve-panel.mjs:216` does `validationMode === "off"` for `taskValidation`.
  OLA18 forbids raw *gate*-mode comparisons outside `decomposeGateMode`, but
  `taskValidation.mode` is a separate vocabulary (`subagent|self|off`) that the
  four-row decomposition table cannot model (`decomposeGateMode` throws on
  `subagent`/`self`). Spec §4.2 itself specifies the `== "off"` refusal. Not a
  violation.
- Interactive setup against an *existing* config is now always refused with the
  OL-B pointer (verified: `interview()` always sets `opts.profile`, so the
  profile-refusal branch at `setup-sdlc.mjs` fires before the `configMutating`
  ladder). This matches spec §4.3 ("`--profile` against an existing config is
  refused"; interactive is an accepted changed path) but is a behavioural
  change for existing adopters who previously used the interactive interview to
  mutate prefix/announce — they must now use non-interactive flags
  (`--prefix … --force`). Config is never modified on refusal. Residual risk,
  not a bug.
- `rootFlagOnly` in `setup-sdlc.mjs` is dead (assigned, never read); pre-existing
  on `main`, carried forward untouched.

## Conclusion

No high- or medium-severity defects found. The T1/T2/T3 implementation faithfully
realises spec rev4: closed vocabulary with deterministic ordered issues, exact
model-identity dedupe with positional winners, lifecycle-governed author
exclusion, `--track` refusal semantics, `task_validate` fixed floor / off-refusal,
byte-identical v1 fallback, and byte-identical FS10 envelope. One low-severity
usability gap (text-mode error suppression) is the sole actionable item.
