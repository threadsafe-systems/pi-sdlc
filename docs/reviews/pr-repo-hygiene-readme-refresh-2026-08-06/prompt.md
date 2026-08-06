# Task for sdlc-pr-review

## The review target

- Repo: /Users/neil/code/pi-sdlc.worktrees/chore-repo-hygiene-readme-refresh (read-only: do not modify, commit, or push)
- Commit under review: 43d591fa7ea7b9d0e7b8cc55d230b45f5c9f4b3e (full 40 chars)
- Diff: /tmp/sdlc-panel/repo-hygiene.diff (also reproducible as `git diff origin/main...HEAD`)
- Global constraints that bind this change: none from a spec (track: none). The binding constraints are the repository's own shipped invariants: the tests in test/ (notably test/path-plumbing.test.js SP1, which bans the literal `skills/sdlc/scripts/` from README.md and SKILL.md because the skill has no fixed install path), skills/sdlc/scripts/check-references.mjs, and the accuracy of every documented command against the real script argv.
- Declared lifecycle track: none (an exemption, not a third track). Its HONESTY is your prose law to judge: read pr-body.md's declaration block and decide whether this change genuinely warrants an exemption rather than the reversible track. Say so as a finding if it does not.
- Governing documents for the declared feature slug: none exist, by design of track: none. Do NOT demand a plan, Specification, or Build plan.

## What this PR is

Two hygiene commits on the pi-sdlc repo itself:
1. `chore(repo)`: untracks pr-body.md (per-PR scratch that the PR phase writes and check-lifecycle reads) and adds it to .gitignore.
2. `docs(readme)`: documents four already-shipped surfaces the README omitted (the sdlc-retro skill, FS13 lifecycle telemetry, the templates/ prompt commands exported via package.json pi.prompts, tracker-backed builds via tracker-ops), and states that scripts/... paths resolve against the loaded skill directory.

Read pr-body.md in the repo for the full rationale, the "Assumptions & discretionary calls" section (NAMED REVIEW INPUT — scrutinise every recorded call), and the verification claims.

## Attack surface specific to this change

- VERIFY EVERY DOCUMENTED COMMAND AGAINST THE REAL SCRIPT. Run each README invocation's script with no args or --help and confirm the flags, subcommand names, and required arguments actually exist. A README that documents a flag that does not exist is a defect. Check: scripts/record-run-event.sh (--list, --describe, the emit form), scripts/harvest-panel.sh (--phase/--round/--from), scripts/tracker-ops.sh (frontier --parent, set-status --item --status), scripts/collect-run.sh (--slug), scripts/render-retro.sh (--run), and the prompt-command names claimed for templates/ (the filename-becomes-command rule).
- VERIFY EVERY FACTUAL CLAIM about sdlc-retro, telemetry, and tracker mode against skills/sdlc-retro/SKILL.md, skills/sdlc/references/system-reference.md §12, and skills/sdlc/assets/tracker-ops.md. Flag anything overstated, understated, or invented — especially the claims about what is git-ignored vs committed, and the fail-soft/stdout claims.
- DOES THE UNTRACKING BREAK ANYTHING? Search the repo (tests, CI workflows, scripts, skill prose, the shipped setup bundle) for anything that assumes a tracked pr-body.md at the repo root, or that would now silently pick up a gitignored file. Consider the shipped consumer bundle: does pi-sdlc's own .gitignore change need a counterpart in what setup-sdlc provisions for consumers, and is its absence a defect or correctly out of scope?
- IGNORE-RULE CORRECTNESS: is the unanchored `pr-body.md` entry right, or does it over-match (e.g. a legitimately tracked pr-body.md in a fixture or template dir, now invisible)? Verify with `git check-ignore -v` and `git status --ignored` rather than reasoning from the pattern alone.
- README INTERNAL CONSISTENCY: do the new sections contradict anything already in the README or in SKILL.md? Are the new claims stale-prone (would they become false without README.md changing)?
- The comment added to .gitignore is subject to the writing-comments law: it must serve a reader who has no PR and no plan. Judge it.

## Verification claims to falsify

pr-body.md claims: npm test is 512/483 pass/29 fail identically on base commit 21cb0c3, that those 29 are a macOS /var symlink artifact in setup-sdlc's path-escape check, that lint warnings are pre-existing, and that check-references and check-lifecycle pass. Re-run what you can and contradict any claim that does not hold.

## PROPORTIONALITY

For every scenario that runs in CI or a gate, verify a time/cost budget is stated and plausible. Flag as a finding any verification machinery whose cost is unbounded, unstated, or disproportionate to what it gates. A stricter check that ratchets cost without a budget is a defect, not an improvement.

This is round 1: review the whole diff. Tag every finding origin: NEW.

Do not edit any files. Return ONLY the strict findings list, or PASS if you genuinely find nothing.

## Acceptance Contract
Acceptance level: attested
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Return concrete findings with file paths and severity when applicable

Required evidence: review-findings, residual-risks

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
`criteriaSatisfied[].status` must be exactly one of: satisfied, not-satisfied, not-applicable.
`commandsRun[].result` must be exactly one of: passed, failed, not-run.
`manualNotes` and `notes` are optional strings; an empty string means no note and does not satisfy `manual-notes` evidence.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```