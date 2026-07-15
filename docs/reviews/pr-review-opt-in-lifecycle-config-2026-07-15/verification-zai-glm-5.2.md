VERIFIED

- P1: `mergePlanSpec` accepts only exact `true` or `false`; `yes` exits 1 immediately with a textual diagnostic and writes no config.
- P2: every custom interactive enum, positive-integer field, and tracker threshold is validated directly after its prompt; text-mode errors are emitted through the interactive exception path, leaving global `renderReport` and NF-1(c) unchanged.
- P3: `readLifecycle` falls back only for ENOENT or JSON parse failure; other read errors emit the config path and exit 1.
- No new high/medium regression found in the focused diff.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "P1/P2/P3 were verified against commit c30006a1f573485c48b55ed349639cc1ba0a2cfb; focused suites passed 19/19 with no residual high/medium finding."
    }
  ],
  "changedFiles": [
    "skills/sdlc/scripts/resolve-panel.mjs",
    "skills/sdlc/scripts/setup-sdlc.mjs",
    "test/resolve-panel-lifecycle.test.js",
    "test/setup-lifecycle.test.js",
    "docs/reviews/pr-review-opt-in-lifecycle-config-2026-07-15/consolidated.md"
  ],
  "testsAddedOrUpdated": [
    "test/resolve-panel-lifecycle.test.js",
    "test/setup-lifecycle.test.js"
  ],
  "commandsRun": [
    {
      "command": "node --test test/setup-lifecycle.test.js",
      "result": "passed",
      "summary": "8/8 passed, including invalid Boolean and invalid gate immediate-diagnostic PTY reproductions and NF-1(c)."
    },
    {
      "command": "node --test test/resolve-panel-lifecycle.test.js",
      "result": "passed",
      "summary": "11/11 passed, including refusal on unreadable lifecycle config."
    },
    {
      "command": "git status --porcelain=v1 && git diff --cached --name-only",
      "result": "passed",
      "summary": "No staged files; pre-existing unstaged .pi/sdlc/sdlc.models.json modification remains untouched."
    }
  ],
  "validationOutput": [
    "Focused setup and resolver suites passed 19/19.",
    "Invalid custom Boolean/gate answers exit 1 with text and no config write.",
    "Non-ENOENT lifecycle read failure exits 1 with a cannot-read diagnostic naming sdlc.config.json."
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "Fix validates all custom lifecycle interview dials immediately and separates absent/unparseable lifecycle fallback from filesystem read failures.",
  "reviewFindings": [
    "no blockers"
  ],
  "manualNotes": "VERIFIED. P4/P6 were not re-litigated because the fix did not change their evidence. The existing unstaged .pi/sdlc/sdlc.models.json change was not created or modified by this review."
}
```
