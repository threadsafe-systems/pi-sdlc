# PR panel round 2 — kimi-k3

Model: `moonshotai/kimi-k3:xhigh`. Delta: `e4a5676..5a877da`.

Turn budget wrap-up was requested after 10 assistant turns (soft limit 10, grace 2). Process-mode live steering is unavailable, so the child was warned at launch to wrap up by this budget. Output may be partial.

All verification is complete. Compiling findings.

### Round-1 disposition checks (confirmed remedied, one line each)

- **WC-R1-01** — grep for `lt-t[0-9]+`, `PR-fix`, `revision adds`, `not yet landed/recorded`, `this feature's own` across `skills/ test/ .pi/` returns zero hits; labels are gone — **but the remedy was applied inside two frozen files, producing the NEW high finding below.**
- **WC-R1-02** — `test/writing-comments-discipline.test.js:52-56` now loops `[workflow, implement, tasks, reviewPrompt]`; both vars are defined at file top; test passes.
- **WC-R1-03** — IDV19 gained the negative assertion (`test/iteration-disposition.test.js:498`); issue #222 exists (OPEN, checklist covering both restorations); A1 cites it. Mechanical bound verified: the IDV19 parse of `^\t"([^"]+)",$` means re-adding the review prompt to `FROZEN` without editing IDV19 fails CI — the re-freeze cannot land silently halfway.
- **WC-R1-04** — message now reads "phase spans are empty when the source record has no phase.entered events" — present-condition prose.
- **WC-R1-05** — IDV33 mutations now splice structurally at the located ownership-comment line (offset 0/1); `commentBlock` re-locates the needle and its `assert.notEqual(-1)` guard plus the earlier `frozenOwner` lookup make the missing-comment path fail loudly, not silently.
- **WC-R1-06** — `phase-implement.md:115-120` now assigns "the parent blocks … and only then dispatches" (`subagent`) vs "the implementer … running the validator directly" (`self`); the contract test asserts both mode clauses and passes.

### Fix wave breaks ASD19: two FROZEN surfaces edited, tree red at HEAD

- severity: high
- confidence: high
- origin: NEW
- file: test/frozen-surfaces.test.js
- line: 48-52 (breach caused by edits at skills/sdlc/scripts/resolve-panel.mjs:9 and skills/sdlc/scripts/validate-task.mjs:8)
- problem: The fix wave removed the `lt-t2` tag from the `--slug is additive (FS13 lt-t2)` comments in `resolve-panel.mjs` and `validate-task.mjs`, both of which are on ASD19's `FROZEN` byte-identity list. Unlike the deliberate, amendment-covered `adversary-review.prompt.md` reopening (A1), these two edits got no reopening, no FROZEN-list adjustment, and no build-plan amendment.
- repro_or_impact: `node --test test/frozen-surfaces.test.js` at 5a877da fails: `frozen surfaces changed since febbed4…: skills/sdlc/scripts/resolve-panel.mjs\nskills/sdlc/scripts/validate-task.mjs`. Full suite: 534 pass / 1 fail (round 1 was 535/535). The branch's own freeze gate is red at the fix-wave commit, so the tree cannot merge green; either the two comment edits must be reverted (the labels stay until #222-style follow-up) or a bounded, amendment-recorded reopening like A1 must be extended to cover them.

### "Coexist" test name overclaims a body that can never exercise coexistence

- severity: low
- confidence: high
- origin: NEW
- file: test/setup-config-doc.test.js
- line: 92-99
- problem: The renamed test `ASD20: optional telemetry and config-doc call sites coexist` asserts `/writeConfigDoc\(root/` unconditionally, then branches: the `if` branch repeats the identical assertion (so it adds no failure mode), and the `else` branch is `assert.ok(true)`. The conditional is dead code — coexistence is never exercised, and its failure message "this fixture has no telemetry call site" mislabels the real `setup-sdlc.mjs` source as a fixture. Under the law this branch ships, a changed test name must be a standalone behavioral claim; this one claims a behavior the body does not test.
- repro_or_impact: `skills/sdlc/scripts/setup-sdlc.mjs` contains no `record-run-event` today, so the `else` branch always runs; even if telemetry later lands, the `if` branch cannot fail independently of the first line. A reader believes call-site coexistence has regression protection; only the already-asserted config-doc line does. Fix: delete the conditional (and the duplicate assertion) or make the telemetry branch assert something real, e.g. ordering or both call sites.
- smell: Duplicated Code

No medium-severity findings. No other high-severity findings. Verified clean: `check-references.mjs` exit 0 against the renewed `normative-references.json` assertion; all delta-touched test files pass except the ASD19 breach above; the new phase-implement checkpoint regexes match the committed text in both modes; IDV19's negative assertion plus #222 mechanically bounds the post-merge re-freeze.
