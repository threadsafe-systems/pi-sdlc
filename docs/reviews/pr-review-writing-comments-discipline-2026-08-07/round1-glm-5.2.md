# PR panel round 1 — glm-5.2

Model: `zai/glm-5.2:xhigh`. Commit: `e4a567669f4d8c9c59dd354ab42ecf3dd6c46a95`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

Based on my thorough review of the full diff, committed blobs, test runs, receipt verification, and carry landing checks, here are my findings.

### Incomplete `lt-t*` task-label cleanup in PR-touched files

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/scripts/telemetry.mjs
- line: 6-7 (also test/telemetry-dogfood.test.js:1, test/telemetry-emitter.test.js:1)
- problem: The wc-t3 DoD states "No tracked source/test comment or test name known to cite ... task/slice history survives without a reader-now justification." The PR cleaned `lt-t1`/`lt-t2`/`lt-t3` from specific inline comments in these same files (e.g. the `emitEvent` header in telemetry.mjs, the manifest-coverage comment in telemetry-dogfood.test.js), proving the author recognised `lt-t*` as prohibited task/slice history — but left the same class of label in the file headers: `telemetry.mjs:6-7` (`lt-t2`, `lt-t4`), `test/telemetry-dogfood.test.js:1` (`lt-t8`), `test/telemetry-emitter.test.js:1` (`lt-t1`). None carries a reader-now justification, and none is recorded as a disputed case in the PR adjudication.
- repro_or_impact: `grep -nE "lt-t[0-9]+" skills/sdlc/scripts/telemetry.mjs test/telemetry-dogfood.test.js test/telemetry-emitter.test.js` returns the surviving labels. The PR is dogfooding a code-prose law whose own enumerated "task/slice history" prohibition is violated by the PR's own cleanup in the very files it edited, undermining the law's authority and leaving the wc-t3 DoD unmet on its own touched surface. (`FS5`/`FS13` archaeology identifiers in the same headers are correctly deferred to CARRY-TO-#178; `lt-t*` task labels are not covered by that carry.)

### Contract test under-covers the "no external comment-writing skill" obligation

- severity: low
- confidence: high
- origin: NEW
- file: test/writing-comments-discipline.test.js
- line: 48-51
- problem: The test "The package law does not depend on an external comment-writing skill" asserts only `workflow` and `implement` against `/writ+ing-comments|global[^\n]*comment/i`. The package law is projected into four surfaces (phase-implement.md, phase-tasks.md, adversary-review.prompt.md, .pi/sdlc/workflow.md); tasks.md and the reviewer prompt are not checked. The Plan's DoD #4 promises contract tests that fail if shared core obligations are lost, and Plan objective #4 ("portable pi-sdlc law, independent of any global or repository-local comment-writing skill") spans every projecting surface.
- repro_or_impact: Append "see the global writing-comments skill" to `skills/sdlc/references/phase-tasks.md` or `skills/sdlc/prompts/adversary-review.prompt.md`; the test still passes, silently accepting a re-introduced external-skill dependency in two of the four law surfaces.

No HIGH severity findings.

Residual risks (not blocking, documented as in-slice or follow-up):
- The frozen-surfaces.test.js header sentence "The PR reviewer prompt is governed by the focused code-prose contract while absent from this list" is a deliberate reopening-window marker; it does not trip Law 5 because the file itself changes at re-freeze, but the post-merge follow-up named in amendment A1 must restore both the FROZEN entry and IDV19's three-prompt assertion — the currently-weakened IDV19 (only `["plan","spec"]`) will not catch a forgotten restoration on its own.
- Both programme carries landed at their named destinations: CARRY-TO-#178 as a comment on issue #178 (2026-08-07T23:11:46Z) and CARRY-TO-S1/#178 as a comment on map #192 (2026-08-07T23:11:47Z); neither is a CARRY-TO-IMPLEMENT/CARRY-TO-BUILD, so no build-plan landing site was required.
- PV1 receipts for wc-t1/wc-t2/wc-t3 all verify via `verify-task-receipt.mjs` (manifest, runner-report, and generated-agent SHA-256s match the recorded hashes; runnerVerdict=validatorVerdict=PASS).
