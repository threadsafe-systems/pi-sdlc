### R1 contradicts R5 on advisory mode for non-git directories

- severity: high
- confidence: high
- location: R1 (line 29–31) vs R5 (line 94–97)
- defect: R1 states that a non-git directory “produces an explicit operational-error result and may only use the existing user-consented advisory mode,” but R5 maps exit 2 (the operational-error code) to “surface the error and stop the SDLC” with no advisory-mode offer. Only exit 1 is defined as the advisory-mode path.
- evidence: Plan text: “A non-git directory cannot claim committed adoption. It produces an explicit operational-error result and may only use the existing user-consented advisory mode; it is never silently treated as ready.” vs “exit 2: surface the error and stop the SDLC”.
- impact: Implementers cannot satisfy both outcomes simultaneously; the spec will inherit an ambiguity about whether non-git consumers may enter advisory mode.
- fix: Remove “and may only use the existing user-consented advisory mode” from R1, or move non-git to exit 1 with an explicit diagnostic if advisory mode is intended.

### DoD item 7 demands unimplementable “mutation tests” against prose instructions

- severity: high
- confidence: high
- location: Definition of done, item 7 (line 173–175)
- defect: The DoD requires “mutation tests fail if exit 3 announces, enters a phase, stamps an agent, mutates a tracker, or claims a gate.” The only shipped startup caller of `sdlc-status` is `skills/sdlc/SKILL.md` (prose instructions to an agent); there is no code path that branches on exit codes, so no mechanical mutation test can be written. These are agent behaviours, not script outputs.
- evidence: `skills/sdlc/SKILL.md:22–30` contains the branching instructions; no script or library in the repo invokes `sdlc-status` and acts on its exit code programmatically. `grep -r sdlc-status` returns only `SKILL.md`, test files, and the script itself.
- impact: The team cannot falsify this DoD item; it is an opinion about future agent behaviour rather than an observable check.
- fix: Replace the item with verifiable script-level checks (e.g., “`sdlc-status` stdout on exit 3 does not contain the configured `announce` string”) and a separate `SKILL.md` prose-audit check.

### Existing sdlc-status test suite invalidated by git-tracking requirement

- severity: medium
- confidence: high
- location: `test/sdlc-status.test.js` (line 35–43) and Definition of done item 12 (line 188)
- defect: Every existing `sdlc-status` test creates a temp directory without a `.git` directory. Under the new plan, non-git roots must return exit 2, so all existing tests expecting exit 0/1 for bare temp dirs will fail. The plan’s DoD requires `npm test` to pass but never flags that the existing `sdlc-status` tests must be rewritten to initialise git repos.
- evidence: `test/sdlc-status.test.js:35–43` defines `mkRepo` with `mkdirSync` but no `git init`; all four existing scenarios (`opted-in repo`, `manifest-less repo`, `corrupt config`, `dogfood config`) rely on this. The plan’s Risks section mentions complex git states but omits the baseline breakage of the existing test file.
- impact: Implementation will hit a hidden test-regression that blocks `npm test` and requires unplanned rework.
- fix: Add to Risks/Dependencies: “The existing `test/sdlc-status.test.js` must be replaced with git-initialised fixtures; this is prerequisite work for `npm test` to remain green.”

### `lib.mjs` `readModels` forces exit 2, conflicting with desired exit 3 for malformed models

- severity: medium
- confidence: high
- location: R3 / R2 table / DoD item 4, grounded against `skills/sdlc/scripts/lib.mjs:183–228`
- defect: The plan classifies a missing or malformed models file as a readiness prerequisite (implying exit 3 / `not-ready`), but the shared `lib.mjs` `readModels` and `validateModels` functions call `fail()`, which hard-codes `process.exit(2)`. If `sdlc-status` invokes these functions directly, malformed models will emit exit 2 (error) rather than exit 3. The plan does not flag the need to avoid or modify this shared FS2/FS5 surface.
- evidence: `skills/sdlc/scripts/lib.mjs:183–195` (`readModels`) and `197–228` (`validateModels`) both call `fail()` (line 76) which exits 2. `skills/sdlc/scripts/resolve-panel.mjs` relies on this behaviour (FS5). The plan states “FS1 config and FS2 models schemas remain unchanged in this child” (Constraints) but omits the script behaviour.
- impact: The specification will inherit an unresolved tension: either `sdlc-status` duplicates validation logic, or `lib.mjs` must gain a non-exiting mode, which risks breaking the frozen FS5 `resolve-panel` contract.
- fix: Add to Dependencies: “`sdlc-status` must validate models without invoking the exiting `readModels` path, or the Specification must explicitly classify a backward-compatible `lib.mjs` change (e.g., a `{noExit}` option) and its FS5 compatibility impact.”

CLEAR: A — The remaining DoD items are falsifiable via offline fixtures, exit-code checks, grep audits, and existing test commands.
CLEAR: B — Every stated outcome (R1–R6) has a concrete verification path the spec can turn into an offline fixture.
CLEAR: C — In-scope and out-of-scope items are coherent and bound a single spec’s worth of work; no contradiction with objectives.
CLEAR: D — The plan explicitly flags ADR 0010 supersession and does not contradict FS3, FS1, FS2, or FS5 without notice.
CLEAR: F — The plan correctly self-classifies as irreversible because it changes frozen exit-code and policy surfaces.
