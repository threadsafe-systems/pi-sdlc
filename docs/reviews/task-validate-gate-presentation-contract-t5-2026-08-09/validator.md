# Task validator — t5 (gate-presentation-contract)

Validated: 2026-08-09. Manifest: docs/validation/gate-presentation-contract/t5.json.
Spec: docs/specs/2026-08-09-gate-presentation-contract.md. Track: irreversible.

## Runner
`bash skills/sdlc/scripts/validate-task.sh --manifest docs/validation/gate-presentation-contract/t5.json
  --report docs/reviews/task-validate-gate-presentation-contract-t5-2026-08-09/runner-report.json`
exited 0 and wrote verdict PASS. Runner report committed at
docs/reviews/task-validate-gate-presentation-contract-t5-2026-08-09/runner-report.json.

## Declared checks (all PASS)
- tests.task — node --test test/gate-presentation-contract.test.js → 27 pass.
- tests.full — npm test → 582 pass, 0 fail.
- static.refs — check-references.mjs → exit 0.
- static.lifecycle — check-lifecycle --track irreversible --slug gate-presentation-contract → pass.
- static.lint — biome check on test/gate-presentation-contract.test.js + test/diff-scoped-premises.test.js → clean, no fixes.

## Owned scenarios — independent spot-check
- GPC10 (tests anchor-only, bounded restatement): read
  test/gate-presentation-contract.test.js. All `import` lines are `node:` built-ins
  (assert, child_process, fs, path, url, test). Assertions are anchor/structural
  checks over phase-brainstorm.md and phase-plan.md (section boundaries, literals,
  ordering, counts, 80-char substring windows over governed docs) — they pin
  anchors named in the spec, never restate rule substance. The two GPC10 tests
  enforce the import-node-builtins rule and the no-≥80-char-substring rule.
- GPC11 (no new dial/dependency/script/schema change): re-verified via git.
  schema/sdlc.config.schema.json, skills/sdlc/schema/sdlc.config.schema.json,
  package.json, package-lock.json, .pi/sdlc/sdlc.config.json are byte-identical
  to merge-base (4e682ca) with main; `git diff --diff-filter=A $MB...HEAD --
  skills/sdlc/scripts/` is empty (no new scripts); `git diff --name-only $MB...HEAD
  -- test/fixtures/consumer/` is empty. The three GPC11 tests reproduce these as
  branch-scoped diff guards with an origin/main fallback.
- GPC12 (corpus green, anchors preserved): tests.full (582 pass) includes the
  pre-existing anchor suites (skill-kernel phase-brainstorm anchors,
  iteration-disposition, diff-scoped-premises guard); static.refs (check-references
  exit 0) confirms FS11 inverse completeness; static.lint confirms biome clean on
  both touched test files.

## DSP7 exemption
test/diff-scoped-premises.test.js carries a new EXEMPTIONS entry for
test/gate-presentation-contract.test.js exempting it from the
base-relative-diff-premise guard. The branch diff to diff-scoped-premises.test.js
is exactly that one exemption line. Exemption text cites GPC11's spec-mandated
merge-base comparison as the reason — the same class as the standing
frozen-surfaces exemption. Correct and in scope for t5.

## Result
PASS. No source files edited. Validation artifacts only (report.json,
validator.md, runner-report.json).
