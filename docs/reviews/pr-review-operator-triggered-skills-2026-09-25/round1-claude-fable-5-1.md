### Exit-2 rule silently bypasses the lifecycle in an adopted repo whenever `git.repository` fails for an environmental reason

- severity: high
- confidence: high
- origin: NEW
- file: skills/sdlc/SKILL.md
- line: 39-43 (also skills/sdlc/references/system-reference.md:52-54, README.md:50-52, docs/adr/0030-operator-triggered-skills.md:21-23)
- problem: The kernel asserts that a failing `root.resolve` or `git.repository` check means "there is no git repository that could have adopted the sdlc" and tells the agent to "handle it exactly as exit 1" (say nothing, continue outside the lifecycle). That premise is false: `git.repository` is set to `error` with the identical message "resolved root is not within a git worktree" whenever `git rev-parse --show-toplevel` fails for *any* reason (`skills/sdlc/scripts/sdlc-status.mjs:152-154`, and `git()` at :51-53 maps a spawn error to code -1), including `git` missing from `PATH` and a wrong/nonexistent `--repo-root`. The report gives the agent no way to distinguish these from a genuine non-git directory.
- repro_or_impact: Reproduced both cases against an adopted repo (manifest committed in HEAD, `sdlc-status` exit 0 normally): (1) `PATH=<dir-with-only-node> node sdlc-status.mjs --repo-root <adopted> --format text` → `state: error`, `exit-code: 2`, `git.repository error — resolved root is not within a git worktree`; (2) `--repo-root <adopted>-typo` → identical output. Under the new law the agent, explicitly invoked by the operator in an adopted repo, now says nothing and proceeds without the lifecycle; before this change exit 2 always surfaced diagnostics and stopped. This contradicts the same bullet's "an error is never a reason to continue outside the lifecycle" and ADR 0015's "exits 2 and 3 stop the SDLC", and it is exactly the silent-bypass ADR 0015 was written to prevent. The test name `a directory with no git repository is handled as not-adopted rather than halting` (test/operator-triggered-skills.test.js:72) and the ledger S06 gist inherit the same false claim. Only `root.resolve` is a safe non-git signal (it can fail only with no explicit root, no manifest anywhere up the tree, and no git toplevel — `lib.mjs:64-92`); `git.repository` is not.

### `/sdlc-*` templates now contradict the kernel on exit 2 and falsely claim to match it

- severity: medium
- confidence: high
- origin: NEW
- file: templates/sdlc-brainstorm.md
- line: 19-23 (same sentence at templates/sdlc-plan.md:21, sdlc-spec.md:21, sdlc-tasks.md:21, sdlc-implement.md:21, sdlc-pr-review.md:22)
- problem: Every standalone template says "On `error` (exit 2) **stop** and surface the diagnostic — an errored `sdlc-status` is unknown-adoption" and "On `not-ready` (exit 3) or `error` (exit 2) **stop** … matching the `SKILL.md` startup table". After this diff the startup table no longer stops on exit 2 for `root.resolve`/`git.repository`, so the "matching" claim is stale and the two prose laws give opposite instructions for the same report. The A7 amendment's landing list (build plan :99-101) names kernel, system-reference, README, ADR and test but never reconsidered the templates, which run `sdlc-status --repo-root .` and therefore hit `git.repository` in any non-git directory.
- repro_or_impact: `/sdlc-brainstorm` in a non-git directory: template says stop and surface; kernel (which the template claims to match) says treat as exit 1 and run the sampling path. An agent following either document is violating the other; a reader of the template is told it agrees with a table it no longer agrees with.

### Mutation guard in the focused test is vacuous for every negative assertion; the comment and build plan claim otherwise

- severity: medium
- confidence: high
- origin: NEW
- file: test/operator-triggered-skills.test.js
- line: 37-38, 46-49, 51-56, 58-62, 67-70
- problem: The comment "Each check runs against the real text and against a reverted fixture, so a check that can no longer fail is caught rather than passing vacuously" (and build plan :60-61, "Each assertion is mutation-checked … as `docs.test.js` AR10 does") is untrue. `assert.throws(() => assertOperatorOnly(REVERTED.description))` and `assert.throws(() => assertSilentExitOne(REVERTED.exitOne))` each abort on the *first* positive `assert.match`, so the `AMBIENT` `doesNotMatch` loop and the `/\/setup-sdlc|advisory|opt in|offer `/i` `doesNotMatch` are never exercised by the fixture. AR10 (test/docs.test.js:115-121) mutates and re-asserts each fragment individually; this test does not.
- repro_or_impact: Reproduced: deleting `for (const re of AMBIENT) assert.doesNotMatch(desc, re);` → 5/5 pass; deleting `assert.doesNotMatch(branch, /\/setup-sdlc|advisory|opt in|offer `/i);` → 5/5 pass. The checks that guard the actual regression (an adoption offer or ambient phrase creeping back) are the unguarded ones.

### Plan-committed verification never landed: no README assertion and no ADR 0030 check exist

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills.md
- line: 123-124
- problem: The Plan's NFR table binds README verification to "`test/docs.test.js` OH12 and a new README assertion" and the ADR record to "`test/docs.test.js` ADR checks". The build plan's Checks (:52-66) carry neither, the spec-gap log (:76-80) does not record dropping them, and the branch contains no assertion on the new README paragraph or on ADR 0030 (`grep -rn 0030 test/` is empty; OH12 at test/docs.test.js:61-64 still only checks `/setup-sdlc` and "has not adopted|opt").
- repro_or_impact: The README paragraph and ADR 0030 — two of the four user-facing statements of the new policy — can drift or be reverted without any test failing, while the Plan tells a reader they are covered.

### ADR 0015/0030 amendment scope notes understate what changed

- severity: low
- confidence: high
- origin: NEW
- file: docs/adr/0015-adoption-readiness-policy.md
- line: 3-4 (and docs/adr/0030-operator-triggered-skills.md:6)
- problem: Both notes say ADR 0030 amends only "the agent's exit-1 branch", but ADR 0030's Decision (:20-23) also changes the exit-2 branch, and ADR 0015's body (:21-23) is the document that fixes "exits 2 and 3 stop the SDLC" — the very sentence 0030 carves out. A reader of 0015 is told exit-2 handling is unaffected.
- repro_or_impact: Stale cross-reference; the ADR chain misdirects anyone tracing why exit 2 no longer always stops.

### Disposition ledger re-gists baseline rows to post-change semantics while calling them "retained"

- severity: low
- confidence: high
- origin: NEW
- file: docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
- line: 37-38
- problem: The ledger's contract (:4-10, :30-33) is that each row maps a *pre-change* SKILL.md statement (baseline commit `1f873eb`) to a disposition. S05's baseline statement ("offer setup/advisory") was replaced, not retained; the diff instead rewrites the "Statement (gist)" column to the new behaviour and keeps `retained`, so the row no longer describes anything in the stated baseline.
- repro_or_impact: A reader auditing "did baseline S05 survive?" is told yes; the honest record is `replaced` (as done for S10/S11) plus a note that the exit-1/exit-2 statements were rewritten under ADR 0030.

### Build plan A5 says "Three files" and lists two, one of which is not a file pinning old text

- severity: low
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-24-operator-triggered-skills-build.md
- line: 92-97
- problem: A5 opens "Three files outside T1's list pinned the old text" then names the disposition ledger and the `skill-kernel.test.js` 220-line ceiling (a size limit, not old text). The PR body says "Two surfaces". Internally inconsistent record of what was discovered at Implement.
- repro_or_impact: Reader cannot tell whether a third pinned surface was missed or miscounted.

### `report.json` is a byte-identical duplicate of `runner-report.json`, outside the review-directory convention

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/task-validate-operator-triggered-skills-t1-2026-09-25/report.json
- line: 1-117
- problem: Same sha256 (`5030c440…`) as `runner-report.json`; every other `task-validate-*` directory ships only `runner-report.json`, and `validator.md:5` points at the duplicate while `receipt.json` hashes the canonical name.
- repro_or_impact: Two copies of one artifact that can diverge on the next regeneration; a reader has no way to know which the receipt attests.

### ADR 0030 Consequences omit that exit-1 silence now applies to explicit operator invocations

- severity: low
- confidence: medium
- origin: NEW
- file: docs/adr/0030-operator-triggered-skills.md
- line: 26-32
- problem: Context (:8-13) justifies silence by the ambient-load case ("a question the operator never wanted"). With operator-only loading, the exit-1 branch is reached only after the operator typed `/skill:sdlc` or asked directly; the Consequences record the ambient-failure cost but not that an explicit `/skill:sdlc` in an unadopted repo now yields no acknowledgement at all. The decision is ratified in the Plan (:80-81), so this is a recording gap, not a request to reopen it.
- repro_or_impact: Operators reading the ADR to understand why their explicit invocation produced nothing will not find that consequence stated.