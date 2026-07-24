# Consolidated PR review — telemetry-emitter-dx (PR #164)

- Head: `f25704a` (pre-fix); adjudicated fixes land in a follow-up commit on the
  same branch.
- Declared track: reversible
- Orchestrator: anthropic (this session)
- Configured panel (`pr_review`, reversible-track roster): 3 distinct-model
  floor. Resolved: `openai-codex/gpt-5.6-sol:xhigh`, `openai-codex/gpt-5.6-luna:xhigh`,
  `amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh`.
- Author excluded: `anthropic/claude-fable-5` (`authorDefault`).

## Panel composition and infra recovery

`amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh` failed before producing
a verdict (`AccessDeniedException: 403`) — an infra failure, not a reviewer
verdict, and non-transient (credential/entitlement class), so it was not
retried. Replaced with the next untried, credentialed candidate in `pr_review`'s
`prefer` list: `deepseek/deepseek-v4-pro:xhigh`. Floor of 3 distinct models met
by the two originals plus the replacement.

## Findings and adjudication

Cross-model agreement (2/2 reviewing models that raised findings) on three
issues; one single-model finding.

1. **Medium — malformed/missing `--payload` bails skip the expected template**
   (gpt-5.6-luna, deepseek-v4-pro, cross-model agreement).
   `record-run-event.mjs`'s JSON-parse-failure and missing-`--payload`-value
   bail paths predated the template addition and never called
   `renderEventTemplate`, contrary to Plan DoD 2. **Incorporated**: both bail
   sites now append the template (the missing-value path only when the event
   token was already parsed and known — documented as a residual limitation
   when `--payload` precedes the event token). Regression tests added
   (`DX-fix:` prefixed cases in `test/telemetry-emitter.test.js`).

2. **Medium — `renderEventTemplate`/lookup crashes on inherited-property event
   names** (gpt-5.6-luna only, single-model, high confidence, mechanically
   reproduced independently). `EVENT_PAYLOADS[event]` for `event ===
   "__proto__"` resolves to `Object.prototype` (an inherited accessor, not
   `undefined`), so the function threw instead of returning `null`. Verified:
   `renderEventTemplate("__proto__")` → `TypeError: required is not iterable`
   pre-fix. **Incorporated**: guarded both `EVENT_PAYLOADS` and
   `OPTIONAL_EVENT_PAYLOADS` lookups with `Object.hasOwn`. Regression test added
   covering `__proto__`/`constructor`/`toString`/`hasOwnProperty`.

3. **Low — `patterns.diff`'s `git diff --check HEAD` doesn't inspect the
   committed diff** (gpt-5.6-luna, deepseek-v4-pro, cross-model agreement).
   Verified: `git diff --check origin/main...HEAD` reported trailing
   whitespace at `docs/reviews/.../generated-agent.md:5` (from
   `ensure-panel-agent.mjs`'s `extensions: ${extensions}` template producing a
   trailing space when `extensions` is empty) while `git diff --check HEAD`
   passed post-commit (working tree already matched HEAD). Two distinct
   sub-issues, adjudicated separately:
   - The concrete whitespace instance: **incorporated** — stripped from the
     committed `generated-agent.md` copy and rehashed the receipt.
   - The check-design limitation (`HEAD` vs `origin/main...HEAD`) and the
     root-cause generator bug in `ensure-panel-agent.mjs` (a different,
     unrelated FS5 script, shared by every phase's panel stamping, not just
     this task's): **dismissed for this slice** — `patterns.diff: git diff
     --check HEAD` is the existing repo-wide PV1 manifest convention (used by
     every prior manifest, not introduced by this task); redesigning it, and
     fixing the shared generator, are out of scope for a reversible
     telemetry-DX slice and would bundle an unrelated fix into this PR. Filed
     as a follow-up concern rather than a drive-by fix, consistent with this
     PR's existing recorded discretionary call to leave the repo's
     pre-existing unrelated lint debt (commit `7621fe8`) untouched.

4. **Low — validator.md links to a deleted report path** (gpt-5.6-luna,
   deepseek-v4-pro, cross-model agreement). Leftover from an earlier loose-file
   convention before converting to the receipt-directory convention.
   **Incorporated**: repointed to the sibling `runner-report.json` inside the
   same receipt directory.

No high finding. No medium finding survives adjudication (both incorporated).

## Final verification

- `node --test test/telemetry-emitter.test.js`: 28/28 pass (12 original DX
  cases + 4 new fix-regression cases).
- `npm test`: 421/421 pass (full corpus).
- `npx biome check <touched files>`: clean, 0 fixes needed.
- `git diff --cached --check`: clean (post-fix, includes the receipt directory).
- T1 PV1 receipt re-verified PASS/PASS after rehash
  (`verify-task-receipt.mjs --dir docs/reviews/task-validate-telemetry-emitter-dx-t1-2026-07-23`).

No high or medium finding survives. Ready to merge after the fix commit lands.
