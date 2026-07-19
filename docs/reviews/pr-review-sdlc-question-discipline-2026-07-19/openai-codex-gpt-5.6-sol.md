Task: PR review of branch feat/sdlc-question-discipline at commit 50c9286 in repo root /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline. TRACK: reversible. Artifact under review: the full diff `git diff main...HEAD` (docs-only: skills/sdlc/references/*.md, both PR templates, plan/build docs, validation manifests/receipts). GOVERNING_DOCS: docs/plans/2026-07-19-sdlc-question-discipline.md (plan) and docs/plans/2026-07-19-sdlc-question-discipline-build.md (build plan). This is the reversible track: a Specification does not exist and must NOT be demanded. Named review input: pr-body.md, including its 'Assumptions & discretionary calls' section — scrutinise those recorded calls. Grounding rule: cite file:line for any claim about the framework or repo. Required output: findings only — each with severity (high/medium/low), file:line, and a one-line remediation — or PASS if none. Do not edit any files.
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
bash: git status --short && git rev-parse HEAD && git diff --st...
bash: git diff --unified=80 main...HEAD -- pr-body.md docs/plan...
bash: git diff --unified=80 main...HEAD -- skills/sdlc/referenc...
find: **/*question-discipline*
 M pr-body.md
50c928643a377163ea472485127dab804e73f8e4
 .github/pull_request_template.md                   |   6 +
 .../2026-07-19-sdlc-question-discipline-build.md   | 117 ++++
 docs/plans/2026-07-19-sdlc-question-discipline.md  | 156 +++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  63 ++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 160 +++++
 .../validator.md                                   | 478 ++++++++++++++
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  81 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 199 ++++++
 .../validator.md                                   | 683 +++++++++++++++++++++
 .../disposition-ledger.md                          |   2 +-
 docs/validation/sdlc-question-discipline/t1.json   |  63 ++
 docs/validation/sdlc-question-discipline/t2.json   |  81 +++
 skills/sdlc/assets/pull_request_template.md        |   6 +
 skills/sdlc/references/phase-brainstorm.md         |  19 +-
 skills/sdlc/references/phase-implement.md          |  22 +
 skills/sdlc/references/phase-plan.md               |  20 +
 skills/sdlc/references/phase-pr-review.md          |  55 +-
 skills/sdlc/references/phase-spec.md               |  18 +
 skills/sdlc/references/phase-tasks.md              |  17 +
 skills/sdlc/references/system-reference.md         |  58 +-
 24 files changed, 2404 insertions(+), 20 deletions(-)
M	.github/pull_request_template.md
A	docs/plans/2026-07-19-sdlc-question-discipline-build.md
A	docs/plans/2026-07-19-sdlc-question-discipline.md
A	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/generated-agent.md
A	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/manifest.json
A	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/receipt.json
A	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/runner-report.json
A	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/validator.md
A	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/generated-agent.md
A	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/manifest.json
A	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/receipt.json
A	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/runner-report.json
A	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator.md
M	docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
A	docs/validation/sdlc-question-discipline/t1.json
A	docs/validation/sdlc-question-discipline/t2.json
M	skills/sdlc/assets/pull_request_template.md
M	skills/sdlc/references/phase-brainstorm.md
M	skills/sdlc/references/phase-implement.md
M	skills/sdlc/references/phase-plan.md
M	skills/sdlc/references/phase-pr-review.md
M	skills/sdlc/references/phase-spec.md
M	skills/sdlc/references/phase-tasks.md
M	skills/sdlc/references/system-reference.md
diff --git a/docs/plans/2026-07-19-sdlc-question-discipline-build.md b/docs/plans/2026-07-19-sdlc-question-discipline-build.md
new file mode 100644
index 0000000..3d7c63e
--- /dev/null
+++ b/docs/plans/2026-07-19-sdlc-question-discipline-build.md
@@ -0,0 +1,117 @@
+# Build plan: Question-presentation discipline (sdlc-question-discipline)
+
+- **Slug:** `sdlc-question-discipline`
+- **Date:** 2026-07-19
+- **Track:** reversible — no Specification; tasks map to the Plan's
+  definition-of-done items (never re-derived).
+- **Governing plan:** `docs/plans/2026-07-19-sdlc-question-discipline.md`
+  (rev1, approved at the human design gate 2026-07-19)
+- **Branch:** `feat/sdlc-question-discipline`
+
+## Decomposition rationale (assumption-tier, stated inline)
+
+Sliced as **two tasks**: the shared contract must land before the six
+phase deltas that point at it (a real content dependency, wired as a
+`blockedBy` edge), while the deltas + template edits are one coherent slice
+because every delta is a thin layer over the same contract and splitting them
+six ways would multiply validation ceremony with no independence gained.
+Object via a Build correction if this slicing is wrong.
+
+## T1 — Shared question-presentation contract in `system-reference.md`
+
+**Objective.** Add the new top-level section **"Presenting questions to the
+human"** to `skills/sdlc/references/system-reference.md` (appended after §13 as
+§14; no renumbering of §1–13): single end-of-reply numbered block; one distinct
+question per item, one question per sentence; context line only when needed;
+enumerated alternatives, never fabricated; at most one reasoned recommendation
+per question, never fabricated; **uniform soft cap 3–5 blocking questions per
+turn, deltas may only lower it; overflow demotes, never lengthens**; triage
+tiers **Blocking / Assumption / Parked**; **never ask a repo-discoverable
+fact**; explicitly tool-agnostic. Update §6 "Skills and tools are enhancements"
+to neutral example language (no "questions-helper plugin" / "questions tool").
+Add a §11 routing-table row for the new section.
+
+**Satisfies plan DoD:** items 1, 3 (system-reference share), 5.
+
+**Checks (exact commands; PV1 manifest projected from this table):**
+
+| Category | Command (argv) | Requirement |
+|---|---|---|
+| tests | `npm test` | required — full suite green (catches structural tests over references) |
+| static | `npx biome check .` | required — repo lint |
+| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 1/3/5 |
+| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` | required — section exists |
+| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` scoped check via `node -e` asserting the §11 routing row also matches (implementer projects exact argv) | required — routed |
+| bannedPatterns | `grep -ri "questions-helper" skills/sdlc/references/system-reference.md` and `grep -ri "questions tool" skills/sdlc/references/system-reference.md` | required — pattern must be ABSENT (runner's bannedPatterns semantics: the named pattern occurring is the failure) |
+
+## T2 — Six phase deltas + PR-template assumptions section
+
+**Objective.** Layer the per-phase deltas from the approved plan's "Agreed
+design" table onto the shared contract, as pointers-plus-delta (no
+restatement), in all six `skills/sdlc/references/phase-*.md`:
+
+- **brainstorm**: replace the broken §1 questions bullet with a contract
+  pointer; recommendations widen-not-steer; map mode: parked = fog →
+  "Not yet specified"; no assumption ledger.
+- **plan**: questions close doc-section-blocking decisions; design-reopening
+  questions surface as proposed backward transitions; recommendations
+  expected; draft-first; assumption→in-doc / parked→"context for the next
+  agent"; scope questions always enumerated.
+- **spec**: behavioural/edge-case questions as draft scenarios (id, pass/fail,
+  recommendation, ratify-by-exception); blocking slots reserved for
+  contract/surface decisions; overflow demotes into the draft; `file:line`
+  emphasis on the repo-discoverable rule.
+- **tasks**: question block effectively banned (backward transition or
+  assumption); mechanical calls stated inline; parked questions attach
+  per-task in the build-plan doc, projected to sub-issue bodies; note the
+  build-plan **"Assumptions" appendix** contract (plan-ratified accrual home).
+- **implement**: mid-task interrupts = external blockers only (class-based);
+  all else batches to the validator seam; assumptions accrue in the build-plan
+  appendix and land in the PR body's "Assumptions & discretionary calls"
+  section (+ task close comment when tracker-backed); §10 gains
+  worker-questions-route-to-dispatcher.
+- **pr-review**: §5.4 escalation shape (pre-adjudicated ratify/amend: id,
+  gist, raising reviewers, recommended disposition + reason); only proposed
+  high/medium dismissals and ratified-residual-risk touches escalate;
+  per-wave post-consolidation under the cap; human-ratified dismissals bind
+  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
+  PR body's assumptions section as panel input **without weakening** the
+  no-development-findings-in-body rule.
+
+Add the empty-allowed **"Assumptions & discretionary calls"** section to
+`skills/sdlc/assets/pull_request_template.md` and
+`.github/pull_request_template.md`.
+
+**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
+
+**Blocked by:** T1 (the pointer target must exist).
+
+**Checks (exact commands; PV1 manifest projected from this table):**
+
+| Category | Command (argv) | Requirement |
+|---|---|---|
+| tests | `npm test` | required |
+| static | `npx biome check .` | required |
+| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
+| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
+| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
+| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |
+
+## Assumptions (appendix — accrues during Implement; copied into the PR body)
+
+- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
+  rationale above.
+- (T1) The shared-contract section wording avoids the repo's S2
+  generic-surface banned literals (e.g. the word "handover" is loom-domain);
+  "carried forward in the phase's context for the next agent" is the
+  sanctioned phrasing.
+- (T2) `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`
+  S25 anchor updated to the new brainstorm bullet text — one line, outside
+  the plan's stated scope, forced by ASD5's living-anchor test when the old
+  bullet was replaced. Treated as a discretionary call, not a scope change.
+
+## Tracker projection
+
+Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
+(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
+`blockedBy` T1. This doc remains canonical; the tracker is a projection.
diff --git a/docs/plans/2026-07-19-sdlc-question-discipline.md b/docs/plans/2026-07-19-sdlc-question-discipline.md
new file mode 100644
index 0000000..280330e
--- /dev/null
+++ b/docs/plans/2026-07-19-sdlc-question-discipline.md
@@ -0,0 +1,156 @@
+# Plan: Question-presentation discipline across SDLC phase prompts
+
+- **Slug:** `sdlc-question-discipline`
+- **Date:** 2026-07-19
+- **Track:** reversible (ratified at the design gate, 2026-07-19)
+- **Status:** rev1, approved (human gate per `overrides.reversible.review.design: human`)
+
+## Objectives
+
+1. Establish **one shared question-presentation contract** — owned once in
+   `references/system-reference.md` — governing how any lifecycle phase asks the
+   human for input: single end-of-reply numbered block, one question per item,
+   enumerated alternatives, explicit reasoned recommendations, a uniform soft cap
+   of 3–5 blocking questions per turn, and three triage tiers (Blocking /
+   Assumption / Parked).
+2. Give each of the six phase references a **phase-shaped delta** layered on that
+   contract, so clarification behaviour matches each phase's character
+   (divergent brainstorm → convergent plan → falsifiable spec → gateless build →
+   interrupt-minimal implement → pre-adjudicated PR escalations).
+3. **Remove the unactionable tool framing**: the current brainstorm bullet tells
+   the agent to use "a tool for that (e.g. a questions-helper plugin)" — but
+   `pi-questions-helper` is a user-side slash command, not an agent tool. The
+   contract defines a structured format that interactive helpers can extract
+   well, without naming or depending on any tool.
+4. End **question bombardment**: overflow beyond the cap demotes to assumption or
+   parked tiers — never a longer block — and repo-discoverable facts are never
+   asked at all.
+
+## Rationale
+
+- The brainstorm reference's question-tool bullet is unactionable as written
+  (the referenced plugin is human-invoked; the agent has no such tool), so
+  agents silently degrade to unstructured question walls.
+- Brainstorm is the **only** phase with any question-presentation guidance;
+  plan/spec/tasks/implement/pr-review have none, yet plan/spec negotiation and
+  PR-panel adjudication are where the human is bombarded hardest.
+- The design was agreed in a full brainstorm dialogue (2026-07-19, this
+  session) covering the shared contract plus all six phase deltas; every open
+  question below was resolved by the human owner during that dialogue.
+
+## Agreed design (carried from Brainstorm)
+
+### Shared contract (new top-level section in `system-reference.md`)
+
+- Single numbered question block, last thing in the reply; never scattered.
+- One distinct question per item; one question per sentence; context line only
+  when the bare question is ambiguous.
+- Alternatives as a numbered list when they exist; never fabricated (no
+  invented yes/no framing of genuinely open questions).
+- At most one **Recommended — because <reason>** per question; never a
+  recommendation without a reason; never fabricated when genuinely neutral.
+- **Soft cap: 3–5 blocking questions per turn, uniform across phases.** Phase
+  deltas may only lower it. Overflow **demotes** (to assumption or parked),
+  never lengthens the block.
+- **Triage tiers** — every candidate question lands in exactly one:
+  - **Blocking**: asked now, in the block.
+  - **Assumption**: not asked; stated explicitly ("Proceeding on the assumption
+    that X — object now if wrong").
+  - **Parked**: one line + destination phase, carried in the phase handover.
+- **Never ask the human a fact the repo can answer** — legitimate questions are
+  about intent; a question about what the code does means the reading was
+  skipped. (Universal rule; Spec adds the `file:line` emphasis.)
+- The section is tool-agnostic. The existing §6 "Skills and tools are
+  enhancements" example language ("a questions-helper plugin", "a missing
+  questions tool") is neutralised to match.
+- §11 next-read routing table gains a row for the new section.
+
+### Per-phase deltas
+
+| Phase | Delta |
+|---|---|
+| Brainstorm | Replace the broken §1 bullet with a pointer to the shared contract. Recommendations must widen the option space, not steer it (free on mechanical questions, sparing on design direction). Map mode: a parked question **is** fog — it lands in "Not yet specified"; sharp parked questions become tickets. No assumption ledger (artifact-free phase; the Plan restates surviving assumptions). |
+| Plan | Questions must close a decision blocking a specific Plan-doc section. A question that would reopen the agreed design is presented as a **proposed backward transition** to Brainstorm, never smuggled into the block. Recommendations expected (their absence signals an un-agreed design). **Draft-first**: present the drafted doc with the block alongside; ask-first only when no credible draft is possible. Assumption tier → written into the doc (gate approval ratifies); Parked tier → the doc's "context for the next agent" section. Scope-boundary questions always carry enumerated alternatives. |
+| Spec | Inherits draft-first and tiers-map-onto-artifact. **Behavioural/edge-case questions must be posed as draft scenarios** (stable id, pass/fail, recommendation) ratified by exception — never open "what should happen when X?" questions. Blocking slots are reserved for genuinely open contract/surface decisions; the cap's escape valve is demotion into the draft. `file:line` grounding emphasis on the repo-discoverable-facts rule. |
+| Tasks/Build | Question block effectively banned: a blocking question resolves to either a proposed backward transition (upstream gap — the counterfeit-artifact rule's conversational twin) or an assumption (mechanical decomposition call, stated inline). Parked questions attach **per-task** in the build-plan doc entry and are projected into sub-issue bodies at tracker publish; the doc row is the source. |
+| Implement | Mid-task interrupts reserved for **external blockers only** (credentials, tooling, billing, permissions — class-based, no number). Everything else batches to the task boundary (validator seam) under the uniform cap; steady-state near zero because upstream flaws go backward and discretionary calls are the agent's, recorded as assumptions. Assumptions get a durable, PR-visible home: an **"Assumptions & discretionary calls"** section in the PR body (+ task close comment when tracker-backed). §10 gains: a dispatched worker's blocking question routes to the dispatching implementer, who applies the triage — one channel to the human. |
+| PR review | Escalations arrive **pre-adjudicated** as ratify/amend decisions: finding id + one-line gist + raising reviewers (agreement signal) + recommended disposition with reason. Only **proposed dismissals of high/medium findings** (plus anything touching a previously human-ratified residual-risk boundary) escalate; incorporations are just work. Escalation happens per fix wave, post-consolidation, never streamed, under the uniform cap; overflow means incorporate the cheap ones. **Human-ratified dismissals bind forward** across waves and sessions on the same finding class (recorded in `consolidated.md` with human-ratified attribution) unless new evidence emerges. The panel receives the PR body's assumptions section as named review input. |
+
+## Scope
+
+**In:**
+
+- `skills/sdlc/references/system-reference.md` — new top-level section
+  ("Presenting questions to the human"), §6 example-language neutralisation,
+  §11 routing row.
+- All six `skills/sdlc/references/phase-*.md` — per-phase deltas above.
+- `skills/sdlc/assets/pull_request_template.md` and this repo's own
+  `.github/pull_request_template.md` — add an "Assumptions & discretionary
+  calls" section (empty-allowed), with `phase-pr-review.md` §4 wording that
+  names it as **panel input** while preserving the existing "the PR body does
+  not carry the local panel's development findings" rule.
+- The pre-existing uncommitted async-dispatch guidance in
+  `phase-pr-review.md` §5 (async `tasks:` dispatch + react-per-child polling)
+  — ratified at the plan gate as folded into this stream and carried as its
+  own commit on the feature branch.
+
+**Out:**
+
+- `SKILL.md` kernel (routing via system-reference §11 suffices; keeps the
+  frozen kernel surface untouched).
+- All `scripts/`, `schema/`, `prompts/` files — no behaviourally-executed
+  surface changes; the PR-review delta instructs the orchestrating agent to
+  name the assumptions section in its dispatch task text rather than editing
+  `prompts/adversary-pr.prompt.md`.
+- `templates/sdlc-*.md` standalone entrypoints (verified: they route to the
+  references and restate no question guidance).
+- Any config schema or FS-numbered contract change (prose-only; FS5/FS8/FS9/
+  FS10/FS13 untouched).
+
+## Definition of done
+
+1. `system-reference.md` contains the shared-contract section with the exact
+   cap (3–5, uniform, deltas lower-only), the three tiers, the
+   overflow-demotes rule, the repo-discoverable-facts rule, and no tool names;
+   §11 routes to it; §6's example language no longer names a questions tool.
+2. Each of the six phase references contains its delta, phrased as a layer on
+   the shared contract (pointer, not restatement).
+3. `grep -ri "questions-helper\|questions tool" skills/sdlc/` returns no
+   matches.
+4. Both PR templates contain the "Assumptions & discretionary calls" section;
+   `phase-pr-review.md` §4 names it as panel input without weakening the
+   no-findings-in-body rule.
+5. Full test suite passes (`npm test`) and lint is clean — including any
+   structural tests over the references.
+6. The two brainstorm-identified tensions are resolved in the shipped text:
+   (a) PR-body wording cannot be read as licence to put panel findings in the
+   body; (b) the assumption-accrual point (below) is stated in
+   `phase-implement.md`.
+
+## Context for the next agent (including parked questions)
+
+- **Assumption-accrual home (parked from Brainstorm, resolved here as a
+  proposed decision):** assumptions accrue during Implement as an
+  **"Assumptions" appendix of the build-plan doc** (which exists on both
+  tracks and below the tracker threshold), appended per task; PR preparation
+  copies the appendix into the PR body section. Gate approval of this plan
+  ratifies that choice.
+- **Parked to Implement:** whether any existing structural tests assert
+  section counts/ordering in `system-reference.md` — discover by running the
+  suite before editing; adjust expectations only where the test encodes
+  structure rather than behaviour.
+- The previously uncommitted async-dispatch diff in `phase-pr-review.md` is
+  folded into this stream (gate decision) and committed first on the feature
+  branch, so all later edits to that file build on it.
+- Reviewer-facing precedent: PR #17 finding-11 and PR #114's reuse of it are
+  the motivating examples for the binding-dismissals rule.
+
+## Assumptions ratified by approving this plan
+
+1. Track is **reversible** (prose-only change to skill documentation surfaces;
+   trivially revertable; freezes no schema, wire format, or executed
+   contract). Under `overrides.reversible`, `review.design: human` — this
+   human gate, no plan panel, and no separate Spec phase.
+2. The PR-template addition is in scope now (both copies), not parked.
+3. Assumption-accrual home is the build-plan appendix, as above.
+4. Slug `sdlc-question-discipline`; branch `feat/sdlc-question-discipline`.
 > adjudicate → stop) used by the Plan and Spec design panels, which link here
 > rather than restating it. `SKILL.md` owns the kernel and phase sequence. Paths
 > are skill-relative. Every configuration-dependent branch is an explicit **under
 > your configuration** callout routed to the effective shape (current
 > `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when absent/stale).
 ## 1. Purpose and invocation modes
 PR review runs the panel against the finished branch and drives the diff to a
 clean opening. It runs two ways:
 - **Full lifecycle:** the final phase, after Implement.
 - **Standalone entrypoint `sdlc:pr-review`** (`templates/sdlc-pr-review.md`):
   needs no committed upstream (the diff is self-contained). Unadopted it applies a
   small fixed panel default and offers an **optional, skippable grounding prompt**
   for existing design material, disclosing grounded-vs-diff-only; adopted it runs
   the committed `pr_review` gate at the committed mode/floors, never below them.
 ## 2. Entry conditions and authoritative upstream inputs
 The authoritative input is the final committed branch diff. On the irreversible
 track the linked governing docs (plan, Specification, Build plan) ground the
 panel; on the reversible track the plan and Build plan ground it and a
 Specification must not be demanded.
 ## 3. Configured before-hook order and blocking semantics
 Fire `hooks.pr.before` (and `hooks."*"`) first: `*` items first, then
 phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
 contract in `references/system-reference.md`, "Hooks".
 ## 4. Required activity and artifact/output shape — the PR body and cycle
 Prepare the PR body from `.github/pull_request_template.md`: declare the track and
 slug, link governing documents per track — irreversible: plan, Specification,
 Build plan; reversible: plan and Build plan, never a Specification; none: a reason
 — and, for a tracker-backed Build, list the epic, every task sub-issue, and the
 shared board. Add `Closes #<task-issue>` for each task completed by merging the
 PR; use the explicit no-tracker exemption for a below-threshold (per
 `shape.publishToTracker`) or `track: none` change. The PR body describes the
 change for its audience; it does not carry the local panel's development findings.
+It **does** carry an **"Assumptions & discretionary calls"** section
+(provisioned by the PR template, empty-allowed): the assumptions accrued during
+Implement, copied from the build-plan doc's appendix
+(`references/phase-implement.md`). That section is **input to** the PR panel —
+named review material for the judgement pass — never a channel for panel
+findings; the no-development-findings rule above is unchanged.
 Every PR declares its track in the template's `sdlc` declaration block
 (provisioned by setup). The `check-lifecycle` script verifies the declared track's
 artifacts are committed: run it locally before opening the PR; in CI it runs
 wherever the repository has configured the shipped workflow or the documented
 snippet. The declaration values are `irreversible`, `reversible`, or `none`;
 lifecycle tracks require a slug, and `none` requires a reason. Auto-generated
 `[bot]` PRs without a valid declaration are exempt; a valid present declaration
 always dominates. Before opening the PR, run the local lifecycle checker from the
 installed skill path:
 ```bash
 node <skill-dir>/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .
 ```
 `track: none` is an exemption declaration, not a third lifecycle track; it
 requires a reason and its honesty remains PR-panel prose law. CI enforcement is
 conditional on the repository configuring the shipped workflow or snippet.
 ## 5. Invariant gate/approval seam — the panel run-shape
 Each design panel (Plan, Spec) and the PR panel run the **same shape**. The four
 phase reviewer prompts are the single sources of truth in `prompts/`; never
 hand-copy a prompt per model.
 1. **Resolve the panel** for the phase (live, deduped, author-excluded):
    ```bash
    scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <provider/model>
    ```
    It reads the merged config's `panels` block, keeps models with credentials, and
    applies the configured phase floor and author-exclusion rule under the config's
    shortfall posture. Add `--pong` for a live smoke test (costs a call per
    candidate; off by default). When `resolve-panel` prints a `proceed`-mode
    shortfall advisory, carry it into that phase's consolidated writeup and, at PR
    phase, into the PR itself as a comment or adjudication note. Do not commit a
    standalone decision log for the shortfall.
    > **Under your configuration:** the per-phase floor is `review.panelSize` or a
    > `panels.phases.<phase>.panelSize` override, and shortfall handling is
    > `review.onShortfall` (`fail` = hard-fail below the floor; `proceed` =
    > best-effort and surface it). Read the effective values from current
    > `CONFIG.md` (or authoritative `sdlc.config.json`); never assume a floor.
 2. **Dispatch** the phase template across the resolved models. Two paths:
    - in-harness (default in a live pi session): stamp the phase's project prompt
      into ONE model-agnostic, project-scoped agent, then dispatch it once per
      resolved model via the `subagent` tool's per-task `model` override (one agent
      reused across the panel, not one file per model):
      ```bash
      scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
      scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
      ```
      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
      its task value with the exact review task: name the artifact paths, commit,
-     governing documents, grounding rule, and required findings-only output; then
-     dispatch the populated array in one call. Per-model attribution comes back on
-     each task's `result.model`. `ensure-panel-agent.sh` copies the prompt body
-     verbatim and writes to the consumer repo's `.pi/agents` where the session
-     resolves project agents (NOT a `cd`-ed cwd). Consult the project's governing
-     documents (for example `AGENTS.md`) for any local sub-agent gotchas.
+     governing documents, grounding rule, and required findings-only output. Dispatch
+     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
+     not as a blocking call: a blocking multi-model dispatch only returns control after
+     every reviewer finishes, so a reviewer that crashes in the first second still sits
+     unactioned until the slowest sibling completes minutes later. Async dispatch
+     returns immediately with one run id/`asyncDir` covering every child in the panel.
+     Per-model attribution comes back on each task's `result.model` once you read it.
+     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
+     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
+     `cd`-ed cwd). Consult the project's governing documents (for example
+     `AGENTS.md`) for any local sub-agent gotchas.
    - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
      stamps one prompt file across `--model` flags.
    Give each reviewer the exact inputs: the artifact under review, the upstream
-   artifacts it must be consistent with, the repo path and commit, and the
+   artifacts it must be consistent with, the repo path and commit, the PR body's
+   "Assumptions & discretionary calls" section as named review material, and the
    grounding rule (cite `file:line` for any framework claim). For `pr_review`,
    populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
    from the linked documents before dispatch; never send literal placeholders. On
    the reversible track, provide the plan and Build plan only and explicitly state
    that a Specification must not be demanded.
    **Before you fan out** (either path): confirm the `subagent` tool is actually in
    your toolset. If it is missing in a live pi session, the fix is a session reload
    (the plugin registers tools at session start), NOT a switch to the detached path
    or a claim that you are outside pi. For a read-only research fan-out inside a
    worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
    returns the brief inline) so children never block on a forbidden write. Prefer
 `wait({ all: true })` over status-polling for read-only fan-out, and read a
 child's transcript before treating a "detached" status label as lost output.
+   **React per-child, not per-batch.** Once dispatched async, poll
+   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
+   once every child in that run finishes) at a short interval; a `wait({ id:
+   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
+   timeout returns control without stopping the run. Diff each poll's per-child
+   status against the last one: the moment any child shows an infra failure (see
+   below) rather than a verdict, act on it immediately — do not wait for the other
+   panelists still running. A replacement dispatch for that model is a brand-new,
+   separate async `subagent` single-agent call, not folded back into the original
+   `tasks:` array, so it runs alongside whichever siblings from the first batch are
+   still going. Keep polling until every original child and every replacement is
+   accounted for.
+
    **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
    candidate pool, not merely documentation. A reviewer that returns a model
    verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
    never silently replaced. A reviewer that fails before producing a verdict —
    including crash, OOM, overload/billing exhaustion, timeout, transport/tool
    failure, or empty output — is an infra failure: retry that model once when the
    failure may be transient, then replace it with the next untried, credentialed
    model in that phase's configured `prefer` list. Do not count a failed model
    against the configured panel floor. Continue through the ordered candidate
    pool until the panel floor is met or the pool is exhausted. Only then apply
    `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
    shortfall and continues. Never substitute an unconfigured model or treat an
    infra failure as a reviewer verdict.
    **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
    panel, record `panel.dispatched` and preserve the panel's artifacts with
    `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
    then `panel.consolidated` after adjudication — see
    `references/system-reference.md` ("Lifecycle telemetry") for the event map.
 3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
    as signal, preserve genuine disagreement.
 4. **Adjudicate**: for every high or medium finding, either incorporate it or
    record a one-line reason for dismissal. Disclose the orchestrating model in the
    consolidated file. Disputed high or medium findings are decided by the project's
    human owner, who is the final adjudicator. Reviewer output is roughly eighty per
    cent right and overreaches, so nothing is actioned blindly and nothing is
    dismissed silently.
+
+   Escalate disputes to the human per the shared contract
+   (`references/system-reference.md`, "Presenting questions to the human") with
+   the PR delta: escalations reach the human **once per fix wave, after
+   consolidation, never streamed as reviewers return**, and arrive
+   **pre-adjudicated** as ratify/amend decisions — each escalated finding
+   carries its id, a one-line gist, the reviewers who raised it (cross-model
+   agreement is signal), and the agent's recommended disposition with its
+   reason. Only **proposed dismissals of high or medium findings** — plus
+   anything touching a previously human-ratified residual-risk boundary —
+   escalate; incorporating a finding is agreement and needs no permission.
+   Overflow past the cap usually means incorporate the cheap ones rather than
+   argue them. A **human-ratified dismissal binds forward**: record it in
+   `consolidated.md` with its human-ratified attribution and do not re-litigate
+   the same finding class in later waves or later sessions unless new evidence
+   emerges.
 5. **Stop** when no high or medium finding survives adjudication. Low findings are
    recorded, not blocking. Termination is measured against surviving findings, so a
    ruthless panel that always emits nits still converges.
 Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
 file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
 adjudication and the orchestrating model.
 > **Under your configuration:** whether a Plan panel and a Spec panel run at all
 > depends on the effective track and `review.design`; the PR panel runs on both
 > tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
 > strength. Read them; never assume `panel`.
 Run the local PR panel against the final committed branch, consolidate and
 adjudicate its findings in the durable internal review artifact under
 `docs/reviews/`, and repeat after each fix wave until no high or medium survives.
 This is the pre-PR sense check that the branch is a finished artefact; retain the
 artifact for future analysis, but do not add development findings to the PR body
 or post them as GitHub review comments.
 ## 6. Refusal and backward-transition behaviour
 Merging with a high or medium finding that survived adjudication is forbidden.
 Backward transition to any earlier phase is always allowed when the panel exposes
 a design flaw. Only after the panel is clean, open the PR with the clean body.
 ## 7. After-hook order and warning semantics
 Fire `hooks.pr.after` (and `hooks."*"`) after the PR opens: phase-specific first,
 then `*`. A failed `after` hook **warns** (recorded, never blocking).
 ## 8. Completion evidence and next transition
 Completion evidence is a clean panel (no surviving high/medium), a passing
 `check-lifecycle`, and the opened PR with its clean body. **Completion is
 machine-checked, not narrated.** After the PR exists, do not state that the
 Implement/PR phase is "complete" or "PASS" without first running:
 ```bash
 node <skill-dir>/scripts/check-completion.mjs --claim pr-open --slug <slug> --closes <n> [--closes <n> ...]
 ```
 This checks the pushed branch, open PR, matching valid declaration, and GitHub's
 native closing-issue references. After merge, do not state that the tracked
 effort is finished without running:
 ```bash
 node <skill-dir>/scripts/check-completion.mjs --claim epic-done --epic <epic-number> --pr <pr-number>
 ```
 This checks every native epic sub-issue is closed and that the named merged PR
 closes all of them. Either check failing means the claim is false; state what's
 missing instead of declaring done. If a GitHub reviewer
 raises a new concern after opening, focus it with an inline comment, address it
 with a commit, reply with that commit's short SHA, and rerun the panel and the
 `pr-open` check before updating the PR. The post-PR review is for new reviewer
 concerns, not a transcript of the local sense check. The lifecycle completes on
 merge.
 ## 9. Advanced-mode pointers
 Gate artefacts may be rendered to a self-contained interactive HTML view with the
 global `sdlc-visual-docs` skill — a pointer, not a dependency (see
 `references/system-reference.md`, "Advanced modes").
diff --git a/skills/sdlc/references/phase-spec.md b/skills/sdlc/references/phase-spec.md
index 8b1bc54..de3eb39 100644
--- a/skills/sdlc/references/phase-spec.md
+++ b/skills/sdlc/references/phase-spec.md
@@ -1,89 +1,107 @@
 # Phase reference: Specification
 > Detailed public contract for the Specification phase. `SKILL.md` owns the
 > kernel, readiness gate, and phase sequence; this reference owns Spec's
 > mechanics. Paths are skill-relative. Every configuration-dependent branch is an
 > explicit **under your configuration** callout routed to the effective shape
 > (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
 > companion is absent or stale) — never a silently assumed track, gate mode, or
 > separate-Spec setting.
 ## 1. Purpose and invocation modes
 Specification fixes the contracts, interfaces, surface area, functional and
 non-functional requirements, and the falsifiable verification scenarios (stable
 ids, pass/fail conditions). It runs two ways:
 - **Full lifecycle:** entered after an approved Plan on the irreversible track
   (or the merged Plan+Spec artifact when `shape.separateSpec: false`).
 - **Standalone entrypoint `sdlc:spec`** (`templates/sdlc-spec.md`): needs a
   committed plan doc. Unadopted with no committed plan it may **stamp-and-interview**
   (see `references/system-reference.md`, "Standalone entrypoints", for the stamp
   contract); adopted with no committed plan it **refuses and redirects** to
   `sdlc:plan`.
 The Spec defines verification **scenarios** — falsifiable acceptance criteria
 with stable ids and pass/fail conditions — **not** implementation test code. A
 scenario that cannot be made to fail is a broken spec.
 ## 2. Entry conditions and authoritative upstream inputs
 The authoritative upstream input is the committed, approved Plan doc. On the
 reversible track a Specification is **not** required and must not be demanded.
 > **Under your configuration:** whether Spec is a required phase depends on the
 > effective track and `shape.separateSpec`. Read them; do not assume Spec always
 > runs.
 ## 3. Configured before-hook order and blocking semantics
 Fire `hooks.spec.before` (and `hooks."*"`) first: `*` items first, then
 phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
 contract in `references/system-reference.md`, "Hooks".
 ## 4. Required activity and artifact/output shape
 Produce the Spec doc: **contracts, interfaces, surface area, functional and
 non-functional requirements, and falsifiable verification scenarios with stable
 ids**. Its home routes to the configured `paths.specs`.
+**Dialogue discipline.** Ask per the shared contract
+(`references/system-reference.md`, "Presenting questions to the human") and
+Plan's draft-first rule, with Spec's delta:
+
+- **Behavioural and edge-case questions are posed as draft scenarios, never
+  open questions**: not "what should happen when X?" but "SN: when X → Y
+  (pass) / Z (fail). Recommended: Y — because …", ratified or amended by
+  exception. Drafted scenarios are Spec's assumption tier: gate approval
+  ratifies them.
+- The blocking slots are reserved for genuinely open **contract/surface
+  decisions** the agent cannot responsibly settle alone; the cap's escape
+  valve is demotion into the draft, never a longer block — edge cases
+  legitimately number in the dozens and belong in the draft as recommended
+  scenarios.
+- Never ask the human what the code currently does: the same `file:line`
+  grounding demanded of panel reviewers applies to the authoring agent's
+  questions — legitimate questions are about intent.
+
 > **Under your configuration:** the artifact home is `<paths.specs>/<date>-<feat>.md`
 > using the committed `paths.specs` value — do not hardcode `docs/specs`.
 ## 5. Invariant gate/approval seam
 The invariant seam is a **design gate grounded in the code, plus human
 approval**. On the irreversible track a spec panel runs, grounded against the
 repository at a named commit.
 > **Under your configuration:** `review.design` (`panel` | `advisory` | `human` |
 > `off`), possibly adjusted by per-track `overrides`, sets the spec gate. Read the
 > effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`);
 > never assume `panel`. When `shape.separateSpec: false`, there is no separate
 > spec gate — the merged Plan+Spec artifact carries one design gate.
 When a panel runs it follows the shared panel run-shape owned by
 `references/phase-pr-review.md`, "Panels", via the `spec_review` phase; the
 reviewer prompt is `prompts/adversary-spec.prompt.md`. Reviewers are grounded
 in the code and must cite `file:line` for any framework claim.
 ## 6. Refusal and backward-transition behaviour
 Standalone `sdlc:spec` refuses-with-redirect when adopted and no committed plan
 exists. Backward transition to Plan or Brainstorm is always allowed when the Spec
 reveals an upstream flaw.
 ## 7. After-hook order and warning semantics
 Fire `hooks.spec.after` (and `hooks."*"`) after the gate: phase-specific first,
 then `*`. A failed `after` hook **warns** (recorded, never blocking).
 ## 8. Completion evidence and next transition
 Completion evidence is the committed Spec doc, the consolidated spec-panel
 artifact under the configured reviews home, and human approval. Next transition
 is **Build/Tasks** (`references/phase-tasks.md`).
 ## 9. Advanced-mode pointers
 None specific to Spec.
diff --git a/skills/sdlc/references/phase-tasks.md b/skills/sdlc/references/phase-tasks.md
index ba680a8..d074066 100644
--- a/skills/sdlc/references/phase-tasks.md
+++ b/skills/sdlc/references/phase-tasks.md
@@ -1,108 +1,125 @@
 # Phase reference: Build / Tasks
 > Detailed public contract for the Build phase. Its `#38` standalone-entrypoint
 > surface is named `sdlc:tasks`; the internal phase name, the `*-build.md`
 > artifact suffix, the `sdlc:build` hook key, and the `sdlc:build-task`/`sdlc:epic`
 > tracker labels stay "build". `SKILL.md` owns the kernel and phase sequence; this
 > reference owns Build's mechanics. Paths are skill-relative. Every
 > configuration-dependent branch is an explicit **under your configuration**
 > callout routed to the effective shape (current `.pi/sdlc/CONFIG.md`, or
 > authoritative `sdlc.config.json` when absent/stale).
 ## 1. Purpose and invocation modes
 Build decomposes the vetted Spec into a task breakdown: each task names its check
 commands and the scenario ids it satisfies, pulled from the Spec, never
 re-derived. It runs two ways:
 - **Full lifecycle:** entered after an approved Spec (or the merged Plan+Spec
   artifact / reversible-track Plan).
 - **Standalone entrypoint `sdlc:tasks`** (`templates/sdlc-tasks.md`): needs
   committed scenario ids upstream. With absent upstream it **always
   refuses-with-redirect** in both adoption states and **never fabricates scenario
   ids or check tables** (the counterfeit-artifact rule).
 ## 2. Entry conditions and authoritative upstream inputs
 The authoritative upstream input is the committed Spec's falsifiable scenarios
 (or, on the reversible track, the approved Plan's definition of done). Build
 never invents scenario ids for absent upstream.
 ## 3. Configured before-hook order and blocking semantics
 Fire `hooks.build.before` (and `hooks."*"`) first: `*` items first, then
 phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
 contract in `references/system-reference.md`, "Hooks".
 ## 4. Required activity and artifact/output shape
 Produce the committed build-plan doc — the canonical task breakdown carrying
 objectives, rationale, check commands, and scenario ids per task. Its home routes
 to the configured `paths.plans` as `<date>-<feat>-build.md`. This doc stays the
 authoritative record even when it is also projected to the tracker.
+**Dialogue discipline.** Build expects **zero blocking questions**
+(shared contract: `references/system-reference.md`,
+"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
+scenarios or the Plan's definition of done are incomplete — present it as a
+proposed backward transition (§6). This is the counterfeit-artifact rule's
+conversational twin: Build papers over an upstream hole with neither
+fabricated ids nor questions. Mechanical decomposition choices — granularity,
+ordering, blocking edges, a near-threshold publish call — are the agent's
+derivation calls: state them inline as assumptions and proceed; the committed
+build-plan doc is the reviewable record, and a gateless phase manufactures no
+approval interaction. A question **parked to Implement attaches to the
+build-plan doc entry of the task it affects** (projected into the sub-issue
+body above threshold; the doc row is the source), so the claiming session sees
+it at claim time. The build-plan doc also carries an **"Assumptions"
+appendix** — the accrual home Implement appends discretionary calls to as
+tasks complete (`references/phase-implement.md`).
+
 > **Under your configuration:** the artifact home uses committed `paths.plans`;
 > do not hardcode `docs/plans`.
 ## 5. Invariant gate/approval seam
 Build has **no gate of its own** — it is derived from the vetted Spec. Its output
 is validated downstream, per-task, during Implement.
 > **Under your configuration:** whether the breakdown is also published to the
 > tracker depends on `shape.publishToTracker` (see §9); the gate seam itself does
 > not vary.
 ## 6. Refusal and backward-transition behaviour
 Standalone `sdlc:tasks` refuses-with-redirect when its committed scenario/id
 upstream is absent, in any adoption state, emitting no fabricated ids or check
 tables. Backward transition to Spec/Plan is always allowed when decomposition
 reveals an upstream gap.
 ## 7. After-hook order and warning semantics
 Fire `hooks.build.after` (and `hooks."*"`) after the breakdown: phase-specific
 first, then `*`. A failed `after` hook **warns** (recorded, never blocking).
 ## 8. Completion evidence and next transition
 Completion evidence is the committed build-plan doc (and, above threshold, its
 tracker projection). Next transition is **Implement** (`references/phase-implement.md`).
 ## 9. Advanced-mode pointers — tracker-backed Build (epic + sub-issues + board)
 The committed build-plan doc stays the canonical task breakdown — objectives,
 rationale, check commands, and scenario ids per task never live only in the
 tracker. When that breakdown has at least the committed `shape.publishToTracker`
 count of tasks, publish it as tracker objects too, so the work is visible and
 resumable across sessions:
 - One **epic issue** (label `<LABEL_PREFIX>:epic`), body linking the plan/spec/
   build-plan docs and restating the definition of done.
 - One **native sub-issue per task** (label `<LABEL_PREFIX>:build-task`, wired via
   `addSubIssue`), body written to `assets/agent-brief.md`'s template: the task's
   check commands and the scenario ids it satisfies, pulled from the build plan,
   never re-derived.
 - **Blocking edges** (`addBlockedBy`) only where a task genuinely can't start
   before another finishes — most tasks in a well-sliced build have none and stay
   simultaneously open.
 - Every issue added to the shared board (one reusable, org-owned board, never one
   per epic — see `assets/tracker-ops.md`), moving `Todo → In Progress` on claim,
   `→ In Review` when its PR opens, `→ Done` on merge/close, `→ Blocked` on an
   external stall. The epic itself moves to `Done` only once every sub-issue is
   closed.
 > **Under your configuration:** the publish threshold is the committed
 > `shape.publishToTracker` count (the value is authoritative; `"never"` disables
 > the publish step). A build below the threshold (or any build when it is
 > `"never"`) stays a plain committed build-plan doc — the tracker overhead is not
 > proportionate. A project without a `tracker` block cannot use this mode.
 **Implement** then works the board's frontier one sub-issue at a time, same
 discipline as working a map: claim before starting, close and update the board on
 completion, and let a PR's `Closes #<sub-issue>` list do the bookkeeping. The
 tracker is a **projection** of the committed docs, never the source of truth — if
 they disagree, the doc wins and the tracker gets corrected, which is why the CI
 presence-check keeps reading committed docs, not issues. All sub-issue/blocking
 mutations and board mechanics are owned once by `assets/tracker-ops.md`.
diff --git a/skills/sdlc/references/system-reference.md b/skills/sdlc/references/system-reference.md
index d1c694e..8efa9cb 100644
--- a/skills/sdlc/references/system-reference.md
+++ b/skills/sdlc/references/system-reference.md
@@ -23,325 +23,369 @@ returning to an earlier phase when a later one exposes a flaw — are always
 allowed and never penalised: the sunk cost of an earlier gate never justifies
 shipping a known-wrong design.
 Two tracks:
 - **Irreversible** — a change that freezes a shape other code, data, or
   extensions bind to: public interfaces, contracts, persisted schemas, wire
   formats, stored-record shapes. Requires brainstorm, plan, spec, build,
   implement, PR; a plan panel **and** a spec panel run pre-PR.
 - **Reversible (fast path)** — everything else (internal refactors, docs, tests,
   tooling). Requires brainstorm (may be brief), plan, build, implement, PR; no
   pre-PR design panel, but the PR panel still runs.
 When in doubt, use the repo's committed `shape.defaultTrack` (default
 `irreversible`). The kernel and the sequence are owned by `SKILL.md`.
 ## 3. Adoption & readiness
 A repository has **adopted** the sdlc when its current `HEAD` commit contains
 `.pi/sdlc/sdlc.config.json` — a manifest merely present on disk (untracked,
 staged, or ignored) is not adoption. Being **ready** to run under law needs more:
 the active manifest must also be clean and valid, its merged `panels` roster
 present and valid, and any `.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8,
 ADR 0016) proves all of this mechanically with four states (`ready`,
 `not-adopted`, `error`, `not-ready`). `SKILL.md` owns the four-state startup
 branch table and its exit codes; this reference does not restate the FS8 check
 ids or exits.
 **Advisory mode** is the escape hatch when a repo has not opted in but the user
 still wants sdlc guidance for one session, with the user's explicit in-session
 consent. In advisory mode: never use any `announce` string and never claim the
 session runs "under law"; prefix every phase marker with `advisory:`; follow the
 phase sequence as guidance only; and MUST NOT create or mutate tracker objects,
 MUST NOT claim any gate as passed, and MUST NOT stamp panel agents. An `error`
 state is never silently downgraded to advisory mode — advisory is not a bypass.
 To opt in, run `/setup-sdlc` (see §8).
 ## 4. Tracks, phases, transitions, gates, refusal
 The lifecycle sequence at a glance (the phase/gate table states the **maximal**
 shape; which gates actually run, and at what strength, is the repo's committed
 config — see §6 and each phase reference's `under your configuration` callouts):
 | Phase | Artifact | Detailed contract |
 |---|---|---|
 | Brainstorm | agreed design (or a map issue) | `references/phase-brainstorm.md` |
 | Plan | objectives, rationale, scope, DoD, next-agent context | `references/phase-plan.md` |
 | Spec | contracts, interfaces, surface area, falsifiable scenarios | `references/phase-spec.md` |
 | Build | task breakdown with checks + scenario ids | `references/phase-tasks.md` |
 | Implement | code and tests | `references/phase-implement.md` |
 | PR review | the diff, driven to a clean panel | `references/phase-pr-review.md` |
 Transitions run forward through the sequence; backward transitions are always
 permitted. Gates: `review.design` gates Plan+Spec, `review.code` gates the PR,
 `review.tasks` sets per-task validation, `review.brainstorm` sets the brainstorm
 gate; per-track `overrides` may adjust them. Refusal and backward behaviour for
 each phase is documented in that phase's reference. The shared panel run-shape
 (resolve → dispatch → consolidate → adjudicate → stop) is owned by
 `references/phase-pr-review.md`, "Panels".
 ## 5. Public composition inventory (FS11 taxonomy)
 The complete public interface is inventoried and completeness-checked by FS11
 (`assets/normative-references.json` + `scripts/check-references.mjs`). Every row
 carries a `class`:
 - **`package-public`** — package-owned public agent-facing surfaces: `SKILL.md`,
   `references/system-reference.md`, the six `references/phase-*.md`, the six
   `templates/sdlc-<slug>.md` standalone entrypoints, `templates/setup-sdlc.md`,
   the `scripts/*.sh` command wrappers (readiness, lifecycle checking, panel
   resolution/stamping, task validation, reference checking, config-doc), the
   `schema/*.json` schemas/examples, and the four `prompts/*.prompt.md` reviewer/
   validator roles.
 - **`delegated`** — delegated external skills: `adversarial-review`,
   `dispatch-subagents`, `gh-pr-review-comments`, `sdlc-visual-docs`.
 - **`runtime-tool`** — required runtime tools (e.g. `git`, `gh`, `node`).
 - **`consumer-integration`** — consumer-configured hooks/integrations: the
   `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
   consumer `.pi/sdlc/CONFIG.md`.
 - **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
-  rendering, a questions-helper plugin).
+  rendering, an interactive question-answering aid).
 - **`internal`** — implementation internals: the `*.mjs` implementations behind
   `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
   and are not catalogued file by file.
 FS11 also carries a `discovery` block naming public roots/glob patterns and a
 closed internal-helper exclusion list; `check-references.mjs` walks the discovery
 set, subtracts the exclusion list, and asserts every discovered public artifact
 has an inventory row (inverse completeness). See `references/phase-*.md` for how
 each surface is used, and §10 for the source-inspection boundary.
 ## 6. Configuration & extension surfaces
 - **`sdlc.config.json`** (schemaVersion 3) — the authoritative manifest. It owns
   the configured values; the phase references route every configuration-dependent
   branch to it via `under your configuration` callouts. Its shape is documented in
   `schema/sdlc.config.schema.json` and `schema/sdlc.config.example.json`.
 - **`.pi/sdlc/CONFIG.md`** — the generated consumer companion that *explains* the
   effective shape of the committed config. JSON is authoritative; `CONFIG.md`
   explains, never overrides. It is generated/regenerated/checked by the
   `config-doc` module (`scripts/config-doc.sh render|write|check`). Startup reads
   it when current and falls back to authoritative JSON when it is missing, stale,
   or an unrecognized collision (see `SKILL.md`, startup freshness).
 ### Hooks (local workflow)
 A repo may declare local workflow actions in the `hooks` object of
 `sdlc.config.json`, so the global process stays identical everywhere while each
 repo layers on its own ways of working. Hook phase keys are the six lifecycle
 names — `brainstorm`, `plan`, `spec`, `build`, `implement`, `pr` — plus `*`
 (every phase). This vocabulary is distinct from the four review-panel phases and
 must not be conflated. Each phase key carries optional `before`/`after` arrays of
 hook items; each item is exactly one of:
 - `{ "run": "<command>" }` — a shell command the agent executes verbatim.
 - `{ "use": "skill:<name>" | "tool:<name>", "do": "<intent>" }` — an instruction
   the agent interprets: `tool:<name>` invokes that tool with `do` as the intent
   (missing tool = hook failure); `skill:<name>` loads that skill and performs `do`
   per its instructions (missing skill = hook failure). The `do` text is the
   acceptance criterion.
 **Ordering.** `before` hooks fire `*` items first, then phase-specific; `after`
 hooks fire phase-specific first, then `*`. Within a list, array order.
 **Failure.** A failed or skipped `before` hook **blocks** the phase (report, then
 retry, ask, or move backward — do not enter the phase). A failed `after` hook
 **warns**: recorded, never blocking.
 **Working directory.** A `run` hook executes from the session's current working
 root at fire time — the consumer root unless a hook or workflow has legitimately
 moved it (e.g. a `before` hook entered a worktree; a worktree is a checkout of the
 same repo, so repo-relative commands still resolve). If your workflow uses
 worktrees: creating one is not enough — the session's working root must move into
 it (create-then-enter). Writing to the main checkout after creating a worktree is
 a red flag.
 **Announce-on-fire (the audit trail).** Before executing any hook and after it
 completes, emit exactly:
 ```
 [sdlc hook] <phase>:<before|after> run$ <command>
 [sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
 [sdlc hook] <phase>:<before|after> result: ok
 [sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
 ```
 A transcript that enters a phase whose `before` hooks lack these lines is a
 violation. Hooks are prose law executed by the agent — the same enforcement model
 as the iron law; there is no mechanical runner.
 **Trust boundary.** `run` hooks execute arbitrary shell commands with the agent's
 privileges, from a committed file. They sit inside pi's existing project-trust
 boundary: enabling hooks for a repo means trusting that repo's config, exactly as
 you already must for `.pi/prompts` and project settings. The agent always echoes
 the exact command before running it, and the scaffolder warns whenever it writes a
 `run` hook.
 ### `workflow.md` (prose layer)
 An optional `.pi/sdlc/workflow.md` carries local ways-of-working that don't
 decompose into hooks (e.g. "no risky merges on Fridays"). At announce, enumerate
 each top-level bullet (first line, truncated to 80 chars). The gate/process
 conflict rule is owned by `SKILL.md`: *gates* always resolve to the global rule
 (local rules may ADD gates, never remove or weaken them); *process* — everything
 else — resolves to the local rule.
 ### Tracker
 A project with a `tracker` block can use the two tracker-backed modes (Brainstorm
 map mode, Build epic/sub-issue/board). All mutation and board mechanics are owned
 once by `assets/tracker-ops.md`.
 ### Skills and tools are enhancements, not dependencies
-Any skill or tool the agent reaches for opportunistically — a questions-helper
-plugin, web research, codebase exploration, anything named anywhere in this
-documentation as a way to do a phase better — is an enhancement, never a hard
-dependency a phase blocks on. When it is missing, degrade to the plain fallback
-(inline structured prose for a missing questions tool, a direct read/grep for
-missing research tooling) and say so, rather than stopping or refusing to proceed.
+Any skill or tool the agent reaches for opportunistically — web research,
+codebase exploration, a richer rendering surface, anything named anywhere in
+this documentation as a way to do a phase better — is an enhancement, never a
+hard dependency a phase blocks on. When it is missing, degrade to the plain
+fallback (a direct read/grep for missing research tooling, plain structured
+prose for a missing richer surface) and say so, rather than stopping or
+refusing to proceed.
 Name no external tool as a shipped dependency of the skill itself. **This rule
 does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
 deliberate, load-bearing contract with the failure semantics above (before=block,
 after=warn); a missing `use:` tool/skill on a configured hook is a hook failure,
 full stop.
 ## 7. Artifacts & durable evidence
 - **Plan / Spec / Build docs** under the configured `paths.plans` / `paths.specs`.
 - **Review artifacts** under `paths.reviews`: one file per model, the shared
   `prompt.md`, and a `consolidated.md` with the adjudication and orchestrating
   model.
 - **Validation receipts** under `docs/reviews/task-validate-<feature>-<task-id>-<date>/`,
   verifiable with `scripts/verify-task-receipt.mjs`.
 - **Tracker projection** (epic + sub-issues + board) — a live, resumable
   projection of the committed build-plan doc, never the source of truth.
 - **ADRs** under `docs/adr/` (see §10, governance).
 ## 8. Normal full-lifecycle operation and the six standalone entrypoints
 **Normal operation:** run `sdlc-status`; on ready, announce and proceed through
 brainstorm → plan → spec → build → implement → PR, loading each phase's
 `references/phase-*.md` when that phase begins.
 **Standalone entrypoints** (`sdlc:<slug>`) let an agent enter a single phase
 directly through package-owned prompt templates `templates/sdlc-<slug>.md` — one
 lifecycle skill's shared named surfaces, **not** six independently discovered
 skills (that is #101). The six slugs are `brainstorm`, `plan`, `spec`, `tasks`,
 `implement`, `pr-review`. Their adopted/unadopted degradation contract, the
 `sdlc:spec` sampling stamp, and the adopted-config-dominates switch are documented
 where each template lives; the switch is driven by the FS8 `adoption.manifest-head`
 predicate (an `sdlc-status` `error` stops the entrypoint rather than treating it as
 adopted). `sdlc:tasks` and `sdlc:implement` never fabricate scenario ids or check
 tables for absent upstream, in any adoption state. See each `references/phase-*.md`
 "Purpose and invocation modes" and the `templates/sdlc-<slug>.md` routers.
 ## 9. Advanced modes
 - **Map mode** (Brainstorm, wayfinder-lite) for oversized/foggy efforts — see
   `references/phase-brainstorm.md`, "§9", and `assets/tracker-ops.md`.
 - **Tracker-backed Build** (epic + sub-issues + board) above the committed
   `shape.publishToTracker` threshold — see `references/phase-tasks.md`, "§9".
 - **Visual gate artefacts** — gate artefacts may be rendered into a self-contained
   interactive HTML view (traceability matrix, contract panel, risk map, DoD
   coverage) with the global `sdlc-visual-docs` skill: declare node IDs in headings
   and edge triples in front matter, then `lint.mjs` / `render.mjs`. This is a
   pointer, not a dependency: renders are ephemeral, never committed as a
   requirement, and never CI-checked.
 ## 10. Operational troubleshooting and the source-inspection boundary
 - **Not ready?** Run `sdlc-status --format json` and read the failing check's
   remediation. When `config.schema-current` fails, the sanctioned actions are to
   pin the older skill release, or re-run `setup-sdlc` (`--force` to replace) —
   there is no pre-adoption config fold-forward. Never hand-edit `schemaVersion` or
   the config shape.
 - **Stale `CONFIG.md`?** Run `scripts/config-doc.sh write` to regenerate; startup
   falls back to authoritative JSON meanwhile.
 - **Source-inspection boundary.** Source is read **only when changing
   implementation**. Understanding and operating the public interface — everything
   in this reference and the phase references — never requires opening
   implementation source or configuration schemas. Implementation work itself does
   require source inspection; no reference claims otherwise.
 Governance: when a decision made anywhere in the lifecycle is hard to reverse,
 surprising without context, and the result of a real trade-off — all three — write
 it to `docs/adr/` immediately (see `docs/adr/README.md`). Existing flat
 locked-decisions lists in a project's governing docs are historical record and are
 not migrated. The documentation-authority hierarchy and the generated-explanation
 trust model are recorded in ADR 0029.
 ## 11. Next-read routing (authority map)
 | Question | Canonical answer |
 |---|---|
 | Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
 | What global law and sequence apply? | `SKILL.md` kernel/router |
 | What does this phase require? | The corresponding `references/phase-*.md` |
 | What values has this repository chosen? | `sdlc.config.json` |
 | What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
 | What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
 | What implementation realizes a surface? | Source, only when implementation work requires it |
+| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
 ## 12. Lifecycle telemetry (FS13)
 Every instrumented run keeps a durable manifest of its own lifecycle at
 `.pi/sdlc/runs/<slug>/events.jsonl` (git-ignored; the sibling `sdlc-retro`
 skill distills it into a committed post-mortem — see that skill's SKILL.md
 for the collect/render pipeline once the run store has anything to distill).
 Emission is fail-soft everywhere (an unresolvable run identity or an
 unwritable store degrades to one stderr warning, never a behavioural change)
 and additive-only to every frozen FS5 contract (ADR 0028).
 Record these prose-emitted inflection points with
 `scripts/record-run-event.sh <event>` (relative to this loaded skill;
 headless: `node <skill-dir>/scripts/record-run-event.mjs <event>`) and its
 event-type payload:
 - **Run start**: once, right after the readiness gate confirms this repo is
   ready and before announcing —
   `record-run-event.sh run.started --payload '{"title":"<feature title>","track":"<irreversible|reversible>"}'`.
 - **Every phase entry**: on entering brainstorm/plan/spec/build/implement/pr —
   `record-run-event.sh phase.entered --payload '{"phase":"<phase>"}'`.
 - **Every human gate approval**: when the human approves a phase's gate —
   `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
 - **Panel dispatch**: immediately after dispatching a design or PR panel —
   `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
   — and, harvest-at-dispatch, immediately preserve its artifacts with
   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
   (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
 - **Panel consolidation**: after adjudicating a round's findings —
   `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
 - **Caller-side lifecycle-check recording**: right after running
   `check-lifecycle` (itself untouched, FS9) —
   `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
 - **PR open**: right after opening the PR —
   `record-run-event.sh pr.opened --payload '{"number":<n>}'`.
 - **Fix wave**: after addressing a post-PR reviewer concern with a commit —
   `record-run-event.sh pr.fix_wave --payload '{"number":<n>,"sha":"<short-sha>"}'`.
 `resolve-panel.sh`, `ensure-panel-agent.sh`, and `validate-task.sh` emit their
 own events automatically (`panel.resolved`, `panel.agent_stamped`,
 `task.validated`) after successful completion — nothing to do beyond passing
 `--slug` when it isn't resolvable from the current git branch. Per-task
 validator dispatch also harvests: immediately after a `task_validate`
 subagent completes, run `scripts/harvest-panel.sh --phase task_validate
 --round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
 ## 13. Stall detection and self-resume
 This applies in any phase, live or dispatched, not only Spec. A provider or
 transport failure can exhaust its own retries and go quiet — empty assistant
 turns, a `stopReason: error`, no further output — leaving the human as the
 only thing watching for it. Don't wait for that: after **2 consecutive
 turns** end this way (an error-terminated turn with no assistant content),
 treat it as a stall, not a stop, and self-issue a continuation/retry before
 reporting anything as blocked. Only report a stall to the human if the
 self-issued retry also fails.
 This is an interim, prose-level mitigation, not a substitute for a genuine
 fix: the real fix is a harness-level visible "stalled — retryable" signal and
 true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
 project does not own or ship. Treat this section as covering the gap until
 that exists upstream, not as the final word.
+## 14. Presenting questions to the human
+
+Every phase asks the human for input the same way. This section is the single
+owner of that contract; each `references/phase-*.md` layers a phase-shaped
+delta on top and never restates it. The contract is deliberately
+**tool-agnostic**: it depends on no plugin or helper, degrades to plain prose
+in any environment, and is by construction the structure an interactive
+answering aid extracts well — so no environment detection is ever needed.
+
+**The block.**
+
+- All questions for the human go in **one numbered block, as the last thing in
+  the reply** — never scattered through prose.
+- One distinct question per numbered item, one question per sentence — no
+  compound questions.
+- Add a one-line context only when the bare question alone is ambiguous.
+- When alternatives exist, list them as a numbered list under the question.
+  Never fabricate alternatives — no invented yes/no framing of a genuinely
+  open question.
+- Mark at most one option per question **"Recommended — because <reason>"**.
+  Never a recommendation without a reason; never a fabricated recommendation
+  when genuinely neutral.
+
+**The budget.** At most **3–5 blocking questions per turn**: a soft cap
+applied with judgment, uniform across phases. A phase delta may only lower it,
+never raise it. Overflow **demotes** to a lower tier — it never lengthens the
+block.
+
+**The triage tiers.** Every candidate question lands in exactly one:
+
+- **Blocking** — asked now, in the block.
+- **Assumption** — not asked; stated explicitly ("Proceeding on the assumption
+  that X — object now if wrong"). Where the phase has an artifact, assumptions
+  are written into it so the gate ratifies them (see the phase deltas).
+- **Parked** — recorded as one line with its destination ("parked to Spec")
+  and carried forward in the phase's context for the next agent.
+
+**Never ask a repo-discoverable fact.** A legitimate question is about intent,
+priorities, or external state only the human knows. A question about what the
+code, config, or docs currently do means the reading was skipped — read first,
+using the degraded research fallbacks above when richer tooling is missing.
+
[Showing lines 804-1691 of 1691 (50.0KB limit). Full output: /tmp/pi-bash-304059a860426d66.log]
docs/plans/2026-07-19-sdlc-question-discipline-build.md
docs/plans/2026-07-19-sdlc-question-discipline.md
docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/
docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/
docs/validation/sdlc-question-discipline/
bash: nl -ba pr-body.md | sed -n '1,240p'; printf '\n--- WORKTR...
bash: for f in skills/sdlc/references/phase-brainstorm.md skill...
bash: git show --stat --oneline --decorate 50c928643a377163ea47...
bash: for f in docs/validation/sdlc-question-discipline/t1.json...
     1	<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
     2
     3	```sdlc
     4	track: reversible
     5	slug: sdlc-question-discipline
     6	```
     7
     8	Teaches every lifecycle phase how to ask the human for input. One shared
     9	question-presentation contract now lives in the system reference — single
    10	end-of-reply numbered block, enumerated alternatives, reasoned
    11	recommendations, a uniform 3–5 soft cap, and Blocking/Assumption/Parked
    12	triage tiers — and each of the six phase references layers a phase-shaped
    13	delta over it (divergent brainstorm through pre-adjudicated PR-review
    14	escalations). The unactionable "questions tool" framing is removed: the
    15	contract is tool-agnostic and degrades to plain prose. Also carries the
    16	previously drafted async panel-dispatch guidance (react per-child) folded in
    17	at the plan gate, and both PR templates gain the "Assumptions & discretionary
    18	calls" section as named panel input.
    19
    20	## Governing documents
    21
    22	- Plan: `docs/plans/2026-07-19-sdlc-question-discipline.md`
    23	- Build plan: `docs/plans/2026-07-19-sdlc-question-discipline-build.md`
    24	- Reversible track — no Specification is required.
    25
    26	## Tracker references
    27
    28	- Epic: #115
    29	- Tasks: Closes #116, Closes #117
    30	- Board: pi-sdlc build board (org project 5)
    31
    32	## Assumptions & discretionary calls
    33
    34	Copied from the build-plan doc's "Assumptions" appendix:
    35
    36	- Two-task slicing (T1 shared contract → T2 phase deltas) with a native
    37	  blockedBy edge; decomposition rationale recorded in the build plan.
    38	- Shared-contract wording avoids the S2 generic-surface banned literals
    39	  (e.g. "handover" is a loom-domain word); "carried forward in the phase's
    40	  context for the next agent" is the sanctioned phrasing.
    41	- Disposition-ledger S25 anchor updated to the reworded brainstorm bullet —
    42	  one line outside the plan's stated scope, forced by ASD5's living-anchor
    43	  test; treated as a discretionary call, not a scope change.
--- WORKTREE DIFF ---
diff --git a/pr-body.md b/pr-body.md
index 54cd400..c32349e 100644
--- a/pr-body.md
+++ b/pr-body.md
@@ -1,73 +1,43 @@
+<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
+
 ```sdlc
 track: reversible
-slug: e2e-integration-harness
+slug: sdlc-question-discipline
 ```
-## Summary
-
-Adds a **sandboxed end-to-end integration harness** (`test/e2e/`) that proves the
-full pi-sdlc adoption chain works from a clean machine state — install →
-discovery → shipped-script conformance → a scripted-model session that obeys the
-observable law — every run sandboxed and deterministic enough to block PRs.
-
-Two PR-blocking claim levels:
-
-- **L1 — install/discovery + CLI conformance.** A staged copy of the package is
-  installed with `pi install <staged> -l`; the skill and `/setup-sdlc` template
-  are discovered under the install root; and the shipped scripts behave per
-  contract *through their install-root paths* — setup presets (solo/standard/
-  full), preset-patch + override guard, the four `sdlc-status` states, the
-  older-v2 honest refusal (remedy names re-run/pin, never "migration"),
-  `check-lifecycle` body mode, and `onShortfall` proceed/fail.
-- **L2 — puppet-model e2e.** A local scripted OpenAI-compatible server stands in
-  for the model. An anti-vacuity **discovery + sentinel gate** means a scenario
-  can only advance once pi genuinely surfaces the install-root `SKILL.md` and its
-  body is read back — so L2 can never pass while discovery or skill loading is
-  broken. Scenarios A–E and G assert real, config-driven tool results
-  (`sdlc-status`, `resolve-panel`), pi's real tool-execution order, file effects,
-  and the exact hook announce contract; a shared **negative control** locks every
-  scenario under a mutated sentinel and with the skill removed.
-
-Isolation is **observed, not confined**: an allowlist-constructed child env,
-scratch `HOME`, `PI_OFFLINE=1`, a `gh` deny-stub, a credential denial list that
-refuses to start on a hit, and a teardown no-write scan over the checkout source
-tree. `pi` is pinned exactly to `0.80.10`. A new `e2e` CI job runs the suite plus
-a two-run byte-identical **determinism** gate on PRs and `main`.
-
-No change to the sdlc skill, scripts, schema, or prose.
+Teaches every lifecycle phase how to ask the human for input. One shared
+question-presentation contract now lives in the system reference — single
+end-of-reply numbered block, enumerated alternatives, reasoned
+recommendations, a uniform 3–5 soft cap, and Blocking/Assumption/Parked
+triage tiers — and each of the six phase references layers a phase-shaped
+delta over it (divergent brainstorm through pre-adjudicated PR-review
+escalations). The unactionable "questions tool" framing is removed: the
+contract is tool-agnostic and degrades to plain prose. Also carries the
+previously drafted async panel-dispatch guidance (react per-child) folded in
+at the plan gate, and both PR templates gain the "Assumptions & discretionary
+calls" section as named panel input.
 ## Governing documents
-- Plan: `docs/plans/2026-07-17-e2e-integration-harness.md`
-- Build plan: `docs/plans/2026-07-17-e2e-integration-harness-build.md`
-- Reversible track: no Specification is required.
+- Plan: `docs/plans/2026-07-19-sdlc-question-discipline.md`
+- Build plan: `docs/plans/2026-07-19-sdlc-question-discipline-build.md`
+- Reversible track — no Specification is required.
 ## Tracker references
-- Epic: `#93`
-- Tasks: `#94` (T0), `#95` (T1), `#96` (T2), `#97` (T3), `#98` (T4), `#99` (T5)
-- Board: threadsafe-systems project 5
-
-Closes #93
-Closes #94
-Closes #95
-Closes #96
-Closes #97
-Closes #98
-Closes #99
-
-## Verification
+- Epic: #115
+- Tasks: Closes #116, Closes #117
+- Board: pi-sdlc build board (org project 5)
-- `npm run test:e2e` / `node test/e2e/run.mjs --determinism`: L1 + the six L2
-  scenarios (A–E, G) + the shared negative control, twice from fresh sandboxes,
-  byte-identical normalized manifests.
-- `node test/e2e/harness.mjs --self-test`: all isolation guards fire.
-- `npm test` (217 unit tests) and `npx biome check .` remain green.
-- Note for reviewers: the suite must run from a clean environment
-  (`env -i PATH="$PATH" HOME="$HOME" …`) because the harness deliberately refuses
-  to start when ambient credentials are present.
+## Assumptions & discretionary calls
-## Branch protection (repo-admin follow-up)
+Copied from the build-plan doc's "Assumptions" appendix:
-Making the `e2e` status check merge-blocking is a repo-admin branch-protection
-action, not a code change (documented in `test/e2e/README.md`).
+- Two-task slicing (T1 shared contract → T2 phase deltas) with a native
+  blockedBy edge; decomposition rationale recorded in the build plan.
+- Shared-contract wording avoids the S2 generic-surface banned literals
+  (e.g. "handover" is a loom-domain word); "carried forward in the phase's
+  context for the next agent" is the sanctioned phrasing.
+- Disposition-ledger S25 anchor updated to the reworded brainstorm bullet —
+  one line outside the plan's stated scope, forced by ASD5's living-anchor
+  test; treated as a discretionary call, not a scope change.
   119	     `cd`-ed cwd). Consult the project's governing documents (for example
   120	     `AGENTS.md`) for any local sub-agent gotchas.
   121	   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
   122	     stamps one prompt file across `--model` flags.
   123
   124	   Give each reviewer the exact inputs: the artifact under review, the upstream
   125	   artifacts it must be consistent with, the repo path and commit, the PR body's
   126	   "Assumptions & discretionary calls" section as named review material, and the
   127	   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   128	   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   129	   from the linked documents before dispatch; never send literal placeholders. On
   130	   the reversible track, provide the plan and Build plan only and explicitly state
   131	   that a Specification must not be demanded.
   132
   133	   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   134	   your toolset. If it is missing in a live pi session, the fix is a session reload
   135	   (the plugin registers tools at session start), NOT a switch to the detached path
   136	   or a claim that you are outside pi. For a read-only research fan-out inside a
   137	   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   138	   returns the brief inline) so children never block on a forbidden write. Prefer
   139	`wait({ all: true })` over status-polling for read-only fan-out, and read a
   140	child's transcript before treating a "detached" status label as lost output.
   141
   142	   **React per-child, not per-batch.** Once dispatched async, poll
   143	   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
   144	   once every child in that run finishes) at a short interval; a `wait({ id:
   145	   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
   146	   timeout returns control without stopping the run. Diff each poll's per-child
   147	   status against the last one: the moment any child shows an infra failure (see
   148	   below) rather than a verdict, act on it immediately — do not wait for the other
   149	   panelists still running. A replacement dispatch for that model is a brand-new,
   150	   separate async `subagent` single-agent call, not folded back into the original
   151	   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   152	   still going. Keep polling until every original child and every replacement is
   153	   accounted for.
   154
   155	   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   156	   candidate pool, not merely documentation. A reviewer that returns a model
   157	   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   158	   never silently replaced. A reviewer that fails before producing a verdict —
   159	   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   160	   failure, or empty output — is an infra failure: retry that model once when the
   161	   failure may be transient, then replace it with the next untried, credentialed
   162	   model in that phase's configured `prefer` list. Do not count a failed model
   163	   against the configured panel floor. Continue through the ordered candidate
   164	   pool until the panel floor is met or the pool is exhausted. Only then apply
   165	   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   166	   shortfall and continues. Never substitute an unconfigured model or treat an
   167	   infra failure as a reviewer verdict.
   168
   169	   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   170	   panel, record `panel.dispatched` and preserve the panel's artifacts with
   171	   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   172	   then `panel.consolidated` after adjudication — see
   173	   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
   174
   175	3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   176	   as signal, preserve genuine disagreement.
   177	4. **Adjudicate**: for every high or medium finding, either incorporate it or
   178	   record a one-line reason for dismissal. Disclose the orchestrating model in the
   179	   consolidated file. Disputed high or medium findings are decided by the project's
   180	   human owner, who is the final adjudicator. Reviewer output is roughly eighty per
   181	   cent right and overreaches, so nothing is actioned blindly and nothing is
   182	   dismissed silently.
   183
   184	   Escalate disputes to the human per the shared contract
   185	   (`references/system-reference.md`, "Presenting questions to the human") with
   186	   the PR delta: escalations reach the human **once per fix wave, after
   187	   consolidation, never streamed as reviewers return**, and arrive
   188	   **pre-adjudicated** as ratify/amend decisions — each escalated finding
   189	   carries its id, a one-line gist, the reviewers who raised it (cross-model
   190	   agreement is signal), and the agent's recommended disposition with its
   191	   reason. Only **proposed dismissals of high or medium findings** — plus
   192	   anything touching a previously human-ratified residual-risk boundary —
   193	   escalate; incorporating a finding is agreement and needs no permission.
   194	   Overflow past the cap usually means incorporate the cheap ones rather than
   195	   argue them. A **human-ratified dismissal binds forward**: record it in
   196	   `consolidated.md` with its human-ratified attribution and do not re-litigate
   197	   the same finding class in later waves or later sessions unless new evidence
   198	   emerges.
   199	5. **Stop** when no high or medium finding survives adjudication. Low findings are
   200	   recorded, not blocking. Termination is measured against surviving findings, so a
   201	   ruthless panel that always emits nits still converges.
   202
   203	Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
   204	file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
   205	adjudication and the orchestrating model.
   206
   207	> **Under your configuration:** whether a Plan panel and a Spec panel run at all
   208	> depends on the effective track and `review.design`; the PR panel runs on both
   209	> tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
   210	> strength. Read them; never assume `panel`.
   211
   212	Run the local PR panel against the final committed branch, consolidate and
   213	adjudicate its findings in the durable internal review artifact under
   214	`docs/reviews/`, and repeat after each fix wave until no high or medium survives.
   215	This is the pre-PR sense check that the branch is a finished artefact; retain the
   216	artifact for future analysis, but do not add development findings to the PR body
   217	or post them as GitHub review comments.
   218
   219	## 6. Refusal and backward-transition behaviour
   220
   221	Merging with a high or medium finding that survived adjudication is forbidden.
   222	Backward transition to any earlier phase is always allowed when the panel exposes
   223	a design flaw. Only after the panel is clean, open the PR with the clean body.
   224
   225	## 7. After-hook order and warning semantics
   226
   227	Fire `hooks.pr.after` (and `hooks."*"`) after the PR opens: phase-specific first,
   228	then `*`. A failed `after` hook **warns** (recorded, never blocking).
   229
   230	## 8. Completion evidence and next transition
   231
   232	Completion evidence is a clean panel (no surviving high/medium), a passing
   233	`check-lifecycle`, and the opened PR with its clean body. **Completion is
   234	machine-checked, not narrated.** After the PR exists, do not state that the
   235	Implement/PR phase is "complete" or "PASS" without first running:
   236
   237	```bash
   238	node <skill-dir>/scripts/check-completion.mjs --claim pr-open --slug <slug> --closes <n> [--closes <n> ...]
   239	```
   240
   241	This checks the pushed branch, open PR, matching valid declaration, and GitHub's
   242	native closing-issue references. After merge, do not state that the tracked
   243	effort is finished without running:
   244
   245	```bash
   246	node <skill-dir>/scripts/check-completion.mjs --claim epic-done --epic <epic-number> --pr <pr-number>
   247	```
   248
   249	This checks every native epic sub-issue is closed and that the named merged PR
   250	closes all of them. Either check failing means the claim is false; state what's
   251	missing instead of declaring done. If a GitHub reviewer
   252	raises a new concern after opening, focus it with an inline comment, address it
   253	with a commit, reply with that commit's short SHA, and rerun the panel and the
   254	`pr-open` check before updating the PR. The post-PR review is for new reviewer
   255	concerns, not a transcript of the local sense check. The lifecycle completes on
   256	merge.
   257
   258	## 9. Advanced-mode pointers
   259
   260	Gate artefacts may be rendered to a self-contained interactive HTML view with the
   261	global `sdlc-visual-docs` skill — a pointer, not a dependency (see
   262	`references/system-reference.md`, "Advanced modes").
===skills/sdlc/references/phase-spec.md
     1	# Phase reference: Specification
     2
     3	> Detailed public contract for the Specification phase. `SKILL.md` owns the
     4	> kernel, readiness gate, and phase sequence; this reference owns Spec's
     5	> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
     6	> explicit **under your configuration** callout routed to the effective shape
     7	> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
     8	> companion is absent or stale) — never a silently assumed track, gate mode, or
     9	> separate-Spec setting.
    10
    11	## 1. Purpose and invocation modes
    12
    13	Specification fixes the contracts, interfaces, surface area, functional and
    14	non-functional requirements, and the falsifiable verification scenarios (stable
    15	ids, pass/fail conditions). It runs two ways:
    16
    17	- **Full lifecycle:** entered after an approved Plan on the irreversible track
    18	  (or the merged Plan+Spec artifact when `shape.separateSpec: false`).
    19	- **Standalone entrypoint `sdlc:spec`** (`templates/sdlc-spec.md`): needs a
    20	  committed plan doc. Unadopted with no committed plan it may **stamp-and-interview**
    21	  (see `references/system-reference.md`, "Standalone entrypoints", for the stamp
    22	  contract); adopted with no committed plan it **refuses and redirects** to
    23	  `sdlc:plan`.
    24
    25	The Spec defines verification **scenarios** — falsifiable acceptance criteria
    26	with stable ids and pass/fail conditions — **not** implementation test code. A
    27	scenario that cannot be made to fail is a broken spec.
    28
    29	## 2. Entry conditions and authoritative upstream inputs
    30
    31	The authoritative upstream input is the committed, approved Plan doc. On the
    32	reversible track a Specification is **not** required and must not be demanded.
    33
    34	> **Under your configuration:** whether Spec is a required phase depends on the
    35	> effective track and `shape.separateSpec`. Read them; do not assume Spec always
    36	> runs.
    37
    38	## 3. Configured before-hook order and blocking semantics
    39
    40	Fire `hooks.spec.before` (and `hooks."*"`) first: `*` items first, then
    41	phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
    42	contract in `references/system-reference.md`, "Hooks".
    43
    44	## 4. Required activity and artifact/output shape
    45
    46	Produce the Spec doc: **contracts, interfaces, surface area, functional and
    47	non-functional requirements, and falsifiable verification scenarios with stable
    48	ids**. Its home routes to the configured `paths.specs`.
    49
    50	**Dialogue discipline.** Ask per the shared contract
    51	(`references/system-reference.md`, "Presenting questions to the human") and
    52	Plan's draft-first rule, with Spec's delta:
    53
    54	- **Behavioural and edge-case questions are posed as draft scenarios, never
    55	  open questions**: not "what should happen when X?" but "SN: when X → Y
    56	  (pass) / Z (fail). Recommended: Y — because …", ratified or amended by
    57	  exception. Drafted scenarios are Spec's assumption tier: gate approval
    58	  ratifies them.
    59	- The blocking slots are reserved for genuinely open **contract/surface
    60	  decisions** the agent cannot responsibly settle alone; the cap's escape
    61	  valve is demotion into the draft, never a longer block — edge cases
    62	  legitimately number in the dozens and belong in the draft as recommended
    63	  scenarios.
    64	- Never ask the human what the code currently does: the same `file:line`
    65	  grounding demanded of panel reviewers applies to the authoring agent's
    66	  questions — legitimate questions are about intent.
    67
    68	> **Under your configuration:** the artifact home is `<paths.specs>/<date>-<feat>.md`
    69	> using the committed `paths.specs` value — do not hardcode `docs/specs`.
    70
    71	## 5. Invariant gate/approval seam
    72
    73	The invariant seam is a **design gate grounded in the code, plus human
    74	approval**. On the irreversible track a spec panel runs, grounded against the
    75	repository at a named commit.
    76
    77	> **Under your configuration:** `review.design` (`panel` | `advisory` | `human` |
    78	> `off`), possibly adjusted by per-track `overrides`, sets the spec gate. Read the
    79	> effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`);
    80	> never assume `panel`. When `shape.separateSpec: false`, there is no separate
    81	> spec gate — the merged Plan+Spec artifact carries one design gate.
    82
    83	When a panel runs it follows the shared panel run-shape owned by
    84	`references/phase-pr-review.md`, "Panels", via the `spec_review` phase; the
    85	reviewer prompt is `prompts/adversary-spec.prompt.md`. Reviewers are grounded
    86	in the code and must cite `file:line` for any framework claim.
    87
    88	## 6. Refusal and backward-transition behaviour
    89
    90	Standalone `sdlc:spec` refuses-with-redirect when adopted and no committed plan
    91	exists. Backward transition to Plan or Brainstorm is always allowed when the Spec
    92	reveals an upstream flaw.
    93
    94	## 7. After-hook order and warning semantics
    95
    96	Fire `hooks.spec.after` (and `hooks."*"`) after the gate: phase-specific first,
    97	then `*`. A failed `after` hook **warns** (recorded, never blocking).
    98
    99	## 8. Completion evidence and next transition
   100
   101	Completion evidence is the committed Spec doc, the consolidated spec-panel
   102	artifact under the configured reviews home, and human approval. Next transition
   103	is **Build/Tasks** (`references/phase-tasks.md`).
   104
   105	## 9. Advanced-mode pointers
   106
   107	None specific to Spec.
===skills/sdlc/references/phase-tasks.md
     1	# Phase reference: Build / Tasks
     2
     3	> Detailed public contract for the Build phase. Its `#38` standalone-entrypoint
     4	> surface is named `sdlc:tasks`; the internal phase name, the `*-build.md`
     5	> artifact suffix, the `sdlc:build` hook key, and the `sdlc:build-task`/`sdlc:epic`
     6	> tracker labels stay "build". `SKILL.md` owns the kernel and phase sequence; this
     7	> reference owns Build's mechanics. Paths are skill-relative. Every
     8	> configuration-dependent branch is an explicit **under your configuration**
     9	> callout routed to the effective shape (current `.pi/sdlc/CONFIG.md`, or
    10	> authoritative `sdlc.config.json` when absent/stale).
    11
    12	## 1. Purpose and invocation modes
    13
    14	Build decomposes the vetted Spec into a task breakdown: each task names its check
    15	commands and the scenario ids it satisfies, pulled from the Spec, never
    16	re-derived. It runs two ways:
    17
    18	- **Full lifecycle:** entered after an approved Spec (or the merged Plan+Spec
    19	  artifact / reversible-track Plan).
    20	- **Standalone entrypoint `sdlc:tasks`** (`templates/sdlc-tasks.md`): needs
    21	  committed scenario ids upstream. With absent upstream it **always
    22	  refuses-with-redirect** in both adoption states and **never fabricates scenario
    23	  ids or check tables** (the counterfeit-artifact rule).
    24
    25	## 2. Entry conditions and authoritative upstream inputs
    26
    27	The authoritative upstream input is the committed Spec's falsifiable scenarios
    28	(or, on the reversible track, the approved Plan's definition of done). Build
    29	never invents scenario ids for absent upstream.
    30
    31	## 3. Configured before-hook order and blocking semantics
    32
    33	Fire `hooks.build.before` (and `hooks."*"`) first: `*` items first, then
    34	phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
    35	contract in `references/system-reference.md`, "Hooks".
    36
    37	## 4. Required activity and artifact/output shape
    38
    39	Produce the committed build-plan doc — the canonical task breakdown carrying
    40	objectives, rationale, check commands, and scenario ids per task. Its home routes
    41	to the configured `paths.plans` as `<date>-<feat>-build.md`. This doc stays the
    42	authoritative record even when it is also projected to the tracker.
    43
    44	**Dialogue discipline.** Build expects **zero blocking questions**
    45	(shared contract: `references/system-reference.md`,
    46	"Presenting questions to the human"). A genuinely blocking question here almost always means the Spec's
    47	scenarios or the Plan's definition of done are incomplete — present it as a
    48	proposed backward transition (§6). This is the counterfeit-artifact rule's
    49	conversational twin: Build papers over an upstream hole with neither
    50	fabricated ids nor questions. Mechanical decomposition choices — granularity,
    51	ordering, blocking edges, a near-threshold publish call — are the agent's
    52	derivation calls: state them inline as assumptions and proceed; the committed
    53	build-plan doc is the reviewable record, and a gateless phase manufactures no
    54	approval interaction. A question **parked to Implement attaches to the
    55	build-plan doc entry of the task it affects** (projected into the sub-issue
    56	body above threshold; the doc row is the source), so the claiming session sees
    57	it at claim time. The build-plan doc also carries an **"Assumptions"
    58	appendix** — the accrual home Implement appends discretionary calls to as
    59	tasks complete (`references/phase-implement.md`).
    60
    61	> **Under your configuration:** the artifact home uses committed `paths.plans`;
    62	> do not hardcode `docs/plans`.
    63
    64	## 5. Invariant gate/approval seam
    65
    66	Build has **no gate of its own** — it is derived from the vetted Spec. Its output
    67	is validated downstream, per-task, during Implement.
    68
    69	> **Under your configuration:** whether the breakdown is also published to the
    70	> tracker depends on `shape.publishToTracker` (see §9); the gate seam itself does
    71	> not vary.
    72
    73	## 6. Refusal and backward-transition behaviour
    74
    75	Standalone `sdlc:tasks` refuses-with-redirect when its committed scenario/id
    76	upstream is absent, in any adoption state, emitting no fabricated ids or check
    77	tables. Backward transition to Spec/Plan is always allowed when decomposition
    78	reveals an upstream gap.
    79
    80	## 7. After-hook order and warning semantics
    81
    82	Fire `hooks.build.after` (and `hooks."*"`) after the breakdown: phase-specific
    83	first, then `*`. A failed `after` hook **warns** (recorded, never blocking).
    84
    85	## 8. Completion evidence and next transition
    86
    87	Completion evidence is the committed build-plan doc (and, above threshold, its
    88	tracker projection). Next transition is **Implement** (`references/phase-implement.md`).
    89
    90	## 9. Advanced-mode pointers — tracker-backed Build (epic + sub-issues + board)
    91
    92	The committed build-plan doc stays the canonical task breakdown — objectives,
    93	rationale, check commands, and scenario ids per task never live only in the
    94	tracker. When that breakdown has at least the committed `shape.publishToTracker`
    95	count of tasks, publish it as tracker objects too, so the work is visible and
    96	resumable across sessions:
    97
    98	- One **epic issue** (label `<LABEL_PREFIX>:epic`), body linking the plan/spec/
    99	  build-plan docs and restating the definition of done.
   100	- One **native sub-issue per task** (label `<LABEL_PREFIX>:build-task`, wired via
   101	  `addSubIssue`), body written to `assets/agent-brief.md`'s template: the task's
   102	  check commands and the scenario ids it satisfies, pulled from the build plan,
   103	  never re-derived.
   104	- **Blocking edges** (`addBlockedBy`) only where a task genuinely can't start
   105	  before another finishes — most tasks in a well-sliced build have none and stay
   106	  simultaneously open.
   107	- Every issue added to the shared board (one reusable, org-owned board, never one
   108	  per epic — see `assets/tracker-ops.md`), moving `Todo → In Progress` on claim,
   109	  `→ In Review` when its PR opens, `→ Done` on merge/close, `→ Blocked` on an
   110	  external stall. The epic itself moves to `Done` only once every sub-issue is
   111	  closed.
   112
   113	> **Under your configuration:** the publish threshold is the committed
   114	> `shape.publishToTracker` count (the value is authoritative; `"never"` disables
   115	> the publish step). A build below the threshold (or any build when it is
   116	> `"never"`) stays a plain committed build-plan doc — the tracker overhead is not
   117	> proportionate. A project without a `tracker` block cannot use this mode.
   118
   119	**Implement** then works the board's frontier one sub-issue at a time, same
   120	discipline as working a map: claim before starting, close and update the board on
   121	completion, and let a PR's `Closes #<sub-issue>` list do the bookkeeping. The
   122	tracker is a **projection** of the committed docs, never the source of truth — if
   123	they disagree, the doc wins and the tracker gets corrected, which is why the CI
   124	presence-check keeps reading committed docs, not issues. All sub-issue/blocking
   125	mutations and board mechanics are owned once by `assets/tracker-ops.md`.
===skills/sdlc/references/system-reference.md
     1	# pi-sdlc system reference
     2
     3	> The agent-facing system map for pi-sdlc. It answers, from documentation alone,
     4	> what the product is and how to operate its public interface — without reading
     5	> implementation source. It is explanatory and links canonical law rather than
     6	> restating it; detailed per-phase mechanics live in the six
     7	> `references/phase-*.md`. All paths are skill-relative and resolve from an
     8	> installed consumer repository.
     9
    10	## 1. Purpose
    11
    12	pi-sdlc is a portable, project-agnostic software-development lifecycle skill for
    13	pi. It gives a change **one predictable way to enter the codebase**: an enforced
    14	sequence of brainstorm → plan → spec → build → implement → PR review, with
    15	per-phase adversarial review panels and per-task deterministic validation,
    16	driven by a small per-project manifest (`.pi/sdlc/sdlc.config.json`). It is a
    17	framework a repository *adopts*, not a global default.
    18
    19	## 2. Kernel — invariant guarantees and the two tracks
    20
    21	The **iron law** fixes what may not be skipped forward. Backward moves —
    22	returning to an earlier phase when a later one exposes a flaw — are always
    23	allowed and never penalised: the sunk cost of an earlier gate never justifies
    24	shipping a known-wrong design.
    25
    26	Two tracks:
    27
    28	- **Irreversible** — a change that freezes a shape other code, data, or
    29	  extensions bind to: public interfaces, contracts, persisted schemas, wire
    30	  formats, stored-record shapes. Requires brainstorm, plan, spec, build,
    31	  implement, PR; a plan panel **and** a spec panel run pre-PR.
    32	- **Reversible (fast path)** — everything else (internal refactors, docs, tests,
    33	  tooling). Requires brainstorm (may be brief), plan, build, implement, PR; no
    34	  pre-PR design panel, but the PR panel still runs.
    35
    36	When in doubt, use the repo's committed `shape.defaultTrack` (default
    37	`irreversible`). The kernel and the sequence are owned by `SKILL.md`.
    38
    39	## 3. Adoption & readiness
    40
    41	A repository has **adopted** the sdlc when its current `HEAD` commit contains
    42	`.pi/sdlc/sdlc.config.json` — a manifest merely present on disk (untracked,
    43	staged, or ignored) is not adoption. Being **ready** to run under law needs more:
    44	the active manifest must also be clean and valid, its merged `panels` roster
    45	present and valid, and any `.pi/sdlc/workflow.md` readable. `sdlc-status` (FS8,
    46	ADR 0016) proves all of this mechanically with four states (`ready`,
    47	`not-adopted`, `error`, `not-ready`). `SKILL.md` owns the four-state startup
    48	branch table and its exit codes; this reference does not restate the FS8 check
    49	ids or exits.
    50
    51	**Advisory mode** is the escape hatch when a repo has not opted in but the user
    52	still wants sdlc guidance for one session, with the user's explicit in-session
    53	consent. In advisory mode: never use any `announce` string and never claim the
    54	session runs "under law"; prefix every phase marker with `advisory:`; follow the
    55	phase sequence as guidance only; and MUST NOT create or mutate tracker objects,
    56	MUST NOT claim any gate as passed, and MUST NOT stamp panel agents. An `error`
    57	state is never silently downgraded to advisory mode — advisory is not a bypass.
    58	To opt in, run `/setup-sdlc` (see §8).
    59
    60	## 4. Tracks, phases, transitions, gates, refusal
    61
    62	The lifecycle sequence at a glance (the phase/gate table states the **maximal**
    63	shape; which gates actually run, and at what strength, is the repo's committed
    64	config — see §6 and each phase reference's `under your configuration` callouts):
    65
    66	| Phase | Artifact | Detailed contract |
    67	|---|---|---|
    68	| Brainstorm | agreed design (or a map issue) | `references/phase-brainstorm.md` |
    69	| Plan | objectives, rationale, scope, DoD, next-agent context | `references/phase-plan.md` |
    70	| Spec | contracts, interfaces, surface area, falsifiable scenarios | `references/phase-spec.md` |
    71	| Build | task breakdown with checks + scenario ids | `references/phase-tasks.md` |
    72	| Implement | code and tests | `references/phase-implement.md` |
    73	| PR review | the diff, driven to a clean panel | `references/phase-pr-review.md` |
    74
    75	Transitions run forward through the sequence; backward transitions are always
    76	permitted. Gates: `review.design` gates Plan+Spec, `review.code` gates the PR,
    77	`review.tasks` sets per-task validation, `review.brainstorm` sets the brainstorm
    78	gate; per-track `overrides` may adjust them. Refusal and backward behaviour for
    79	each phase is documented in that phase's reference. The shared panel run-shape
    80	(resolve → dispatch → consolidate → adjudicate → stop) is owned by
    81	`references/phase-pr-review.md`, "Panels".
    82
    83	## 5. Public composition inventory (FS11 taxonomy)
    84
    85	The complete public interface is inventoried and completeness-checked by FS11
    86	(`assets/normative-references.json` + `scripts/check-references.mjs`). Every row
    87	carries a `class`:
    88
    89	- **`package-public`** — package-owned public agent-facing surfaces: `SKILL.md`,
    90	  `references/system-reference.md`, the six `references/phase-*.md`, the six
    91	  `templates/sdlc-<slug>.md` standalone entrypoints, `templates/setup-sdlc.md`,
    92	  the `scripts/*.sh` command wrappers (readiness, lifecycle checking, panel
    93	  resolution/stamping, task validation, reference checking, config-doc), the
    94	  `schema/*.json` schemas/examples, and the four `prompts/*.prompt.md` reviewer/
    95	  validator roles.
    96	- **`delegated`** — delegated external skills: `adversarial-review`,
    97	  `dispatch-subagents`, `gh-pr-review-comments`, `sdlc-visual-docs`.
    98	- **`runtime-tool`** — required runtime tools (e.g. `git`, `gh`, `node`).
    99	- **`consumer-integration`** — consumer-configured hooks/integrations: the
   100	  `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
   101	  consumer `.pi/sdlc/CONFIG.md`.
   102	- **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
   103	  rendering, an interactive question-answering aid).
   104	- **`internal`** — implementation internals: the `*.mjs` implementations behind
   105	  `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
   106	  and are not catalogued file by file.
   107
   108	FS11 also carries a `discovery` block naming public roots/glob patterns and a
   109	closed internal-helper exclusion list; `check-references.mjs` walks the discovery
   110	set, subtracts the exclusion list, and asserts every discovered public artifact
   111	has an inventory row (inverse completeness). See `references/phase-*.md` for how
   112	each surface is used, and §10 for the source-inspection boundary.
   113
   114	## 6. Configuration & extension surfaces
   115
   116	- **`sdlc.config.json`** (schemaVersion 3) — the authoritative manifest. It owns
   117	  the configured values; the phase references route every configuration-dependent
   118	  branch to it via `under your configuration` callouts. Its shape is documented in
   119	  `schema/sdlc.config.schema.json` and `schema/sdlc.config.example.json`.
   120	- **`.pi/sdlc/CONFIG.md`** — the generated consumer companion that *explains* the
   121	  effective shape of the committed config. JSON is authoritative; `CONFIG.md`
   122	  explains, never overrides. It is generated/regenerated/checked by the
   123	  `config-doc` module (`scripts/config-doc.sh render|write|check`). Startup reads
   124	  it when current and falls back to authoritative JSON when it is missing, stale,
   125	  or an unrecognized collision (see `SKILL.md`, startup freshness).
   126
   127	### Hooks (local workflow)
   128
   129	A repo may declare local workflow actions in the `hooks` object of
   130	`sdlc.config.json`, so the global process stays identical everywhere while each
   131	repo layers on its own ways of working. Hook phase keys are the six lifecycle
   132	names — `brainstorm`, `plan`, `spec`, `build`, `implement`, `pr` — plus `*`
   133	(every phase). This vocabulary is distinct from the four review-panel phases and
   134	must not be conflated. Each phase key carries optional `before`/`after` arrays of
   135	hook items; each item is exactly one of:
   136
   137	- `{ "run": "<command>" }` — a shell command the agent executes verbatim.
   138	- `{ "use": "skill:<name>" | "tool:<name>", "do": "<intent>" }` — an instruction
   139	  the agent interprets: `tool:<name>` invokes that tool with `do` as the intent
   140	  (missing tool = hook failure); `skill:<name>` loads that skill and performs `do`
   141	  per its instructions (missing skill = hook failure). The `do` text is the
   142	  acceptance criterion.
   143
   144	**Ordering.** `before` hooks fire `*` items first, then phase-specific; `after`
   145	hooks fire phase-specific first, then `*`. Within a list, array order.
   146
   147	**Failure.** A failed or skipped `before` hook **blocks** the phase (report, then
   148	retry, ask, or move backward — do not enter the phase). A failed `after` hook
   149	**warns**: recorded, never blocking.
   150
   151	**Working directory.** A `run` hook executes from the session's current working
   152	root at fire time — the consumer root unless a hook or workflow has legitimately
   153	moved it (e.g. a `before` hook entered a worktree; a worktree is a checkout of the
   154	same repo, so repo-relative commands still resolve). If your workflow uses
   155	worktrees: creating one is not enough — the session's working root must move into
   156	it (create-then-enter). Writing to the main checkout after creating a worktree is
   157	a red flag.
   158
   159	**Announce-on-fire (the audit trail).** Before executing any hook and after it
   160	completes, emit exactly:
   161
   162	```
   163	[sdlc hook] <phase>:<before|after> run$ <command>
   164	[sdlc hook] <phase>:<before|after> use=<use> do=<first 80 chars of do>
   165	[sdlc hook] <phase>:<before|after> result: ok
   166	[sdlc hook] <phase>:<before|after> result: failed (<one-line reason>)
   167	```
   168
   169	A transcript that enters a phase whose `before` hooks lack these lines is a
   170	violation. Hooks are prose law executed by the agent — the same enforcement model
   171	as the iron law; there is no mechanical runner.
   172
   173	**Trust boundary.** `run` hooks execute arbitrary shell commands with the agent's
   174	privileges, from a committed file. They sit inside pi's existing project-trust
   175	boundary: enabling hooks for a repo means trusting that repo's config, exactly as
   176	you already must for `.pi/prompts` and project settings. The agent always echoes
   177	the exact command before running it, and the scaffolder warns whenever it writes a
   178	`run` hook.
   179
   180	### `workflow.md` (prose layer)
   181
   182	An optional `.pi/sdlc/workflow.md` carries local ways-of-working that don't
   183	decompose into hooks (e.g. "no risky merges on Fridays"). At announce, enumerate
   184	each top-level bullet (first line, truncated to 80 chars). The gate/process
   185	conflict rule is owned by `SKILL.md`: *gates* always resolve to the global rule
   186	(local rules may ADD gates, never remove or weaken them); *process* — everything
   187	else — resolves to the local rule.
   188
   189	### Tracker
   190
   191	A project with a `tracker` block can use the two tracker-backed modes (Brainstorm
   192	map mode, Build epic/sub-issue/board). All mutation and board mechanics are owned
   193	once by `assets/tracker-ops.md`.
   194
   195	### Skills and tools are enhancements, not dependencies
   196
   197	Any skill or tool the agent reaches for opportunistically — web research,
   198	codebase exploration, a richer rendering surface, anything named anywhere in
   199	this documentation as a way to do a phase better — is an enhancement, never a
   200	hard dependency a phase blocks on. When it is missing, degrade to the plain
   201	fallback (a direct read/grep for missing research tooling, plain structured
   202	prose for a missing richer surface) and say so, rather than stopping or
   203	refusing to proceed.
   204	Name no external tool as a shipped dependency of the skill itself. **This rule
   205	does not cover hooks:** a `hooks` entry a repo has explicitly configured is a
   206	deliberate, load-bearing contract with the failure semantics above (before=block,
   207	after=warn); a missing `use:` tool/skill on a configured hook is a hook failure,
   208	full stop.
   209
   210	## 7. Artifacts & durable evidence
   211
   212	- **Plan / Spec / Build docs** under the configured `paths.plans` / `paths.specs`.
   213	- **Review artifacts** under `paths.reviews`: one file per model, the shared
   214	  `prompt.md`, and a `consolidated.md` with the adjudication and orchestrating
   215	  model.
   216	- **Validation receipts** under `docs/reviews/task-validate-<feature>-<task-id>-<date>/`,
   217	  verifiable with `scripts/verify-task-receipt.mjs`.
   218	- **Tracker projection** (epic + sub-issues + board) — a live, resumable
   219	  projection of the committed build-plan doc, never the source of truth.
   220	- **ADRs** under `docs/adr/` (see §10, governance).
   221
   222	## 8. Normal full-lifecycle operation and the six standalone entrypoints
   223
   224	**Normal operation:** run `sdlc-status`; on ready, announce and proceed through
   225	brainstorm → plan → spec → build → implement → PR, loading each phase's
   226	`references/phase-*.md` when that phase begins.
   227
   228	**Standalone entrypoints** (`sdlc:<slug>`) let an agent enter a single phase
   229	directly through package-owned prompt templates `templates/sdlc-<slug>.md` — one
   230	lifecycle skill's shared named surfaces, **not** six independently discovered
   231	skills (that is #101). The six slugs are `brainstorm`, `plan`, `spec`, `tasks`,
   232	`implement`, `pr-review`. Their adopted/unadopted degradation contract, the
   233	`sdlc:spec` sampling stamp, and the adopted-config-dominates switch are documented
   234	where each template lives; the switch is driven by the FS8 `adoption.manifest-head`
   235	predicate (an `sdlc-status` `error` stops the entrypoint rather than treating it as
   236	adopted). `sdlc:tasks` and `sdlc:implement` never fabricate scenario ids or check
   237	tables for absent upstream, in any adoption state. See each `references/phase-*.md`
   238	"Purpose and invocation modes" and the `templates/sdlc-<slug>.md` routers.
   239
   240	## 9. Advanced modes
   241
   242	- **Map mode** (Brainstorm, wayfinder-lite) for oversized/foggy efforts — see
   243	  `references/phase-brainstorm.md`, "§9", and `assets/tracker-ops.md`.
   244	- **Tracker-backed Build** (epic + sub-issues + board) above the committed
   245	  `shape.publishToTracker` threshold — see `references/phase-tasks.md`, "§9".
   246	- **Visual gate artefacts** — gate artefacts may be rendered into a self-contained
   247	  interactive HTML view (traceability matrix, contract panel, risk map, DoD
   248	  coverage) with the global `sdlc-visual-docs` skill: declare node IDs in headings
   249	  and edge triples in front matter, then `lint.mjs` / `render.mjs`. This is a
   250	  pointer, not a dependency: renders are ephemeral, never committed as a
   251	  requirement, and never CI-checked.
   252
   253	## 10. Operational troubleshooting and the source-inspection boundary
   254
   255	- **Not ready?** Run `sdlc-status --format json` and read the failing check's
   256	  remediation. When `config.schema-current` fails, the sanctioned actions are to
   257	  pin the older skill release, or re-run `setup-sdlc` (`--force` to replace) —
   258	  there is no pre-adoption config fold-forward. Never hand-edit `schemaVersion` or
   259	  the config shape.
   260	- **Stale `CONFIG.md`?** Run `scripts/config-doc.sh write` to regenerate; startup
   261	  falls back to authoritative JSON meanwhile.
   262	- **Source-inspection boundary.** Source is read **only when changing
   263	  implementation**. Understanding and operating the public interface — everything
   264	  in this reference and the phase references — never requires opening
   265	  implementation source or configuration schemas. Implementation work itself does
   266	  require source inspection; no reference claims otherwise.
   267
   268	Governance: when a decision made anywhere in the lifecycle is hard to reverse,
   269	surprising without context, and the result of a real trade-off — all three — write
   270	it to `docs/adr/` immediately (see `docs/adr/README.md`). Existing flat
   271	locked-decisions lists in a project's governing docs are historical record and are
   272	not migrated. The documentation-authority hierarchy and the generated-explanation
   273	trust model are recorded in ADR 0029.
   274
   275	## 11. Next-read routing (authority map)
   276
   277	| Question | Canonical answer |
   278	|---|---|
   279	| Is this repository adopted and ready? | `sdlc-status` against committed adoption artifacts |
   280	| What global law and sequence apply? | `SKILL.md` kernel/router |
   281	| What does this phase require? | The corresponding `references/phase-*.md` |
   282	| What values has this repository chosen? | `sdlc.config.json` |
   283	| What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
   284	| What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
   285	| What implementation realizes a surface? | Source, only when implementation work requires it |
   286	| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
   287
   288	## 12. Lifecycle telemetry (FS13)
   289
   290	Every instrumented run keeps a durable manifest of its own lifecycle at
   291	`.pi/sdlc/runs/<slug>/events.jsonl` (git-ignored; the sibling `sdlc-retro`
   292	skill distills it into a committed post-mortem — see that skill's SKILL.md
   293	for the collect/render pipeline once the run store has anything to distill).
   294	Emission is fail-soft everywhere (an unresolvable run identity or an
   295	unwritable store degrades to one stderr warning, never a behavioural change)
   296	and additive-only to every frozen FS5 contract (ADR 0028).
   297
   298	Record these prose-emitted inflection points with
   299	`scripts/record-run-event.sh <event>` (relative to this loaded skill;
   300	headless: `node <skill-dir>/scripts/record-run-event.mjs <event>`) and its
   301	event-type payload:
   302
   303	- **Run start**: once, right after the readiness gate confirms this repo is
   304	  ready and before announcing —
   305	  `record-run-event.sh run.started --payload '{"title":"<feature title>","track":"<irreversible|reversible>"}'`.
   306	- **Every phase entry**: on entering brainstorm/plan/spec/build/implement/pr —
   307	  `record-run-event.sh phase.entered --payload '{"phase":"<phase>"}'`.
   308	- **Every human gate approval**: when the human approves a phase's gate —
   309	  `record-run-event.sh gate.approved --payload '{"phase":"<phase>","artifact":"<path>","rev":<n>,"approver":"human:<slug>"}'`.
   310	- **Panel dispatch**: immediately after dispatching a design or PR panel —
   311	  `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
   312	  — and, harvest-at-dispatch, immediately preserve its artifacts with
   313	  `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
   314	  (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
   315	- **Panel consolidation**: after adjudicating a round's findings —
   316	  `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
   317	- **Caller-side lifecycle-check recording**: right after running
   318	  `check-lifecycle` (itself untouched, FS9) —
   319	  `record-run-event.sh lifecycle.checked --payload '{"verdict":"<verdict>"}'`.
   320	- **PR open**: right after opening the PR —
   321	  `record-run-event.sh pr.opened --payload '{"number":<n>}'`.
   322	- **Fix wave**: after addressing a post-PR reviewer concern with a commit —
   323	  `record-run-event.sh pr.fix_wave --payload '{"number":<n>,"sha":"<short-sha>"}'`.
   324
   325	`resolve-panel.sh`, `ensure-panel-agent.sh`, and `validate-task.sh` emit their
   326	own events automatically (`panel.resolved`, `panel.agent_stamped`,
   327	`task.validated`) after successful completion — nothing to do beyond passing
   328	`--slug` when it isn't resolvable from the current git branch. Per-task
   329	validator dispatch also harvests: immediately after a `task_validate`
   330	subagent completes, run `scripts/harvest-panel.sh --phase task_validate
   331	--round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
   332
   333	## 13. Stall detection and self-resume
   334
   335	This applies in any phase, live or dispatched, not only Spec. A provider or
   336	transport failure can exhaust its own retries and go quiet — empty assistant
   337	turns, a `stopReason: error`, no further output — leaving the human as the
   338	only thing watching for it. Don't wait for that: after **2 consecutive
   339	turns** end this way (an error-terminated turn with no assistant content),
   340	treat it as a stall, not a stop, and self-issue a continuation/retry before
   341	reporting anything as blocked. Only report a stall to the human if the
   342	self-issued retry also fails.
   343
   344	This is an interim, prose-level mitigation, not a substitute for a genuine
   345	fix: the real fix is a harness-level visible "stalled — retryable" signal and
   346	true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
   347	project does not own or ship. Treat this section as covering the gap until
   348	that exists upstream, not as the final word.
   349
   350	## 14. Presenting questions to the human
   351
   352	Every phase asks the human for input the same way. This section is the single
   353	owner of that contract; each `references/phase-*.md` layers a phase-shaped
   354	delta on top and never restates it. The contract is deliberately
   355	**tool-agnostic**: it depends on no plugin or helper, degrades to plain prose
   356	in any environment, and is by construction the structure an interactive
   357	answering aid extracts well — so no environment detection is ever needed.
   358
   359	**The block.**
   360
   361	- All questions for the human go in **one numbered block, as the last thing in
   362	  the reply** — never scattered through prose.
   363	- One distinct question per numbered item, one question per sentence — no
   364	  compound questions.
   365	- Add a one-line context only when the bare question alone is ambiguous.
   366	- When alternatives exist, list them as a numbered list under the question.
   367	  Never fabricate alternatives — no invented yes/no framing of a genuinely
   368	  open question.
   369	- Mark at most one option per question **"Recommended — because <reason>"**.
   370	  Never a recommendation without a reason; never a fabricated recommendation
   371	  when genuinely neutral.
   372
   373	**The budget.** At most **3–5 blocking questions per turn**: a soft cap
   374	applied with judgment, uniform across phases. A phase delta may only lower it,
   375	never raise it. Overflow **demotes** to a lower tier — it never lengthens the
   376	block.
   377
   378	**The triage tiers.** Every candidate question lands in exactly one:
   379
   380	- **Blocking** — asked now, in the block.
   381	- **Assumption** — not asked; stated explicitly ("Proceeding on the assumption
   382	  that X — object now if wrong"). Where the phase has an artifact, assumptions
   383	  are written into it so the gate ratifies them (see the phase deltas).
   384	- **Parked** — recorded as one line with its destination ("parked to Spec")
   385	  and carried forward in the phase's context for the next agent.
   386
   387	**Never ask a repo-discoverable fact.** A legitimate question is about intent,
   388	priorities, or external state only the human knows. A question about what the
   389	code, config, or docs currently do means the reading was skipped — read first,
   390	using the degraded research fallbacks above when richer tooling is missing.
   391
===.github/pull_request_template.md
     1	<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
     2
     3	```sdlc
     4	track: reversible
     5	slug: replace-with-feature-slug
     6	```
     7
     8	## Governing documents
     9
    10	- Irreversible: link the plan, Specification, and Build plan.
    11	- Reversible: link the plan and Build plan; no Specification is required.
    12	- None: replace `slug:` with `reason:` and explain the exemption.
    13
    14	## Tracker references
    15
    16	For a tracker-backed Build (two or more tasks), link the epic and every task
    17	sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
    18	PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
    19	Build` and explain briefly.
    20
    21	- Epic: `#<epic-issue>`
    22	- Tasks: `#<task-issue>`, `#<task-issue>`
    23	- Board: `<TRACKER_BOARD>`
    24
    25	## Assumptions & discretionary calls
    26
    27	Assumptions and discretionary implementation choices accrued during Implement,
    28	copied from the build-plan doc's "Assumptions" appendix. Review input for the
    29	PR panel — not a place for panel findings. Write `None` when nothing accrued.
===skills/sdlc/assets/pull_request_template.md
     1	<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
     2
     3	```sdlc
     4	track: reversible
     5	slug: replace-with-feature-slug
     6	```
     7
     8	## Governing documents
     9
    10	- Irreversible: link the plan, Specification, and Build plan.
    11	- Reversible: link the plan and Build plan; no Specification is required.
    12	- None: replace `slug:` with `reason:` and explain the exemption.
    13
    14	## Tracker references
    15
    16	For a tracker-backed Build (two or more tasks), link the epic and every task
    17	sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
    18	PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
    19	Build` and explain briefly.
    20
    21	- Epic: `#<epic-issue>`
    22	- Tasks: `#<task-issue>`, `#<task-issue>`
    23	- Board: `<TRACKER_BOARD>`
    24
    25	## Assumptions & discretionary calls
    26
    27	Assumptions and discretionary implementation choices accrued during Implement,
    28	copied from the build-plan doc's "Assumptions" appendix. Review input for the
    29	PR panel — not a place for panel findings. Write `None` when nothing accrued.
[Showing lines 564-1393 of 1393 (50.0KB limit). Full output: /tmp/pi-bash-138784ced59b4164.log]
50c9286 (HEAD -> feat/sdlc-question-discipline) docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  81 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 199 ++++++
 .../validator.md                                   | 683 +++++++++++++++++++++
 5 files changed, 1023 insertions(+)
50c9286 (HEAD -> feat/sdlc-question-discipline) docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
2699186 docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
04b6876 docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
244ec22 docs(sdlc): add shared question-presentation contract (T1, #116)
69e62eb docs(sdlc): build plan for question-presentation discipline
c759c20 docs(sdlc): plan for question-presentation discipline across phases
32ebaa1 docs(sdlc): dispatch review panels async and react per-child
docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/generated-agent.md:5: trailing whitespace.
+extensions:
docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/generated-agent.md:5: trailing whitespace.
+extensions:
docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator.md:179: trailing whitespace.
+validate-task.mjs-107-
Command exited with code 2
===docs/validation/sdlc-question-discipline/t1.json
{
  "schemaVersion": 1,
  "taskId": "t1",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": [
        "npm",
        "test"
      ],
      "timeoutMs": 300000,
      "evidence": [
        "Full corpus green with the new system-reference section (structural tests over references included)"
      ]
    },
    {
      "id": "static.lint",
      "argv": [
        "npm",
        "run",
        "lint"
      ],
      "timeoutMs": 120000,
      "evidence": [
        "Repository formatting and lint rules"
      ]
    },
    {
      "id": "standards.section-present",
      "argv": [
        "grep",
        "-q",
        "Presenting questions to the human",
        "skills/sdlc/references/system-reference.md"
      ],
      "evidence": [
        "Shared question-presentation contract section exists (plan DoD 1)"
      ]
    },
    {
      "id": "standards.routing-row",
      "argv": [
        "grep",
        "-q",
        "How does any phase ask the human for input?",
        "skills/sdlc/references/system-reference.md"
      ],
      "evidence": [
        "Next-read routing table routes to the new section (plan DoD 1)"
      ]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const s=require('fs').readFileSync('skills/sdlc/references/system-reference.md','utf8'); if(/questions-helper|questions tool/i.test(s)){console.error('banned questions-tool naming present');process.exit(1)}"
      ],
      "evidence": [
        "Tool-dependent phrasing absent from the system reference (plan DoD 1/3)"
      ]
    },
    {
      "id": "patterns.diff",
      "argv": [
        "git",
        "diff",
        "--check",
        "HEAD"
      ],
      "evidence": [
        "No whitespace-error banned patterns in the task diff"
      ]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": [
        "tests.full"
      ]
    },
    "static": {
      "applicability": "required",
      "checkIds": [
        "static.lint"
      ]
    },
    "scenarios": {
      "applicability": "n/a",
      "reason": "Reversible track: no Specification exists; T1 maps to approved plan DoD items 1/3/5 per the build plan's T1 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": [
        "standards.section-present",
        "standards.routing-row"
      ]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": [
        "patterns.no-tool-naming",
        "patterns.diff"
      ]
    }
  }
}
===docs/validation/sdlc-question-discipline/t2.json
{
  "schemaVersion": 1,
  "taskId": "t2",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": [
        "npm",
        "test"
      ],
      "timeoutMs": 300000,
      "evidence": [
        "Full corpus green with all six phase deltas (disposition-ledger anchor test included)"
      ]
    },
    {
      "id": "static.lint",
      "argv": [
        "npm",
        "run",
        "lint"
      ],
      "timeoutMs": 120000,
      "evidence": [
        "Repository formatting and lint rules"
      ]
    },
    {
      "id": "standards.all-six-deltas",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
      ],
      "evidence": [
        "Every phase reference layers its delta over the shared contract (plan DoD 2)"
      ]
    },
    {
      "id": "standards.pr-template-repo",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        ".github/pull_request_template.md"
      ],
      "evidence": [
        "Repo PR template carries the assumptions section (plan DoD 4)"
      ]
    },
    {
      "id": "standards.pr-template-asset",
      "argv": [
        "grep",
        "-q",
        "Assumptions & discretionary calls",
        "skills/sdlc/assets/pull_request_template.md"
      ],
      "evidence": [
        "Setup-provisioned PR template carries the assumptions section (plan DoD 4)"
      ]
    },
    {
      "id": "standards.panel-input-naming",
      "argv": [
        "grep",
        "-qF",
        "input to** the PR panel",
        "skills/sdlc/references/phase-pr-review.md"
      ],
      "evidence": [
        "phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"
      ]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
      ],
      "evidence": [
        "Tool-dependent phrasing absent across the skill (plan DoD 3)"
      ]
    },
    {
      "id": "patterns.diff",
      "argv": [
        "git",
        "diff",
        "--check",
        "HEAD"
      ],
      "evidence": [
        "No whitespace-error banned patterns in the task diff"
      ]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": [
        "tests.full"
      ]
    },
    "static": {
      "applicability": "required",
      "checkIds": [
        "static.lint"
      ]
    },
    "scenarios": {
      "applicability": "n/a",
      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": [
        "standards.all-six-deltas",
        "standards.pr-template-repo",
        "standards.pr-template-asset",
        "standards.panel-input-naming"
      ]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": [
        "patterns.no-tool-naming",
        "patterns.diff"
      ]
    }
  }
}
===docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/receipt.json
{
  "schemaVersion": 1,
  "taskId": "t1",
  "manifestPath": "docs/validation/sdlc-question-discipline/t1.json",
  "manifestSha256": "8a5d6998c52d29429fe97ccc769a2f9ecc68fb5a71a5b803c56291dfbe99821c",
  "runnerReportSha256": "a4cd05e145eb3c4cda3380ea0093f881392122230adafa15cc97e78d80af4383",
  "generatedAgentSha256": "ec3895ff8b685dc90b6ce2db27aa82b37d1abeea1612749d9b1377c42d69cbdd",
  "model": "openai-codex/gpt-5.6-terra",
  "runnerVerdict": "PASS",
  "validatorVerdict": "PASS",
  "createdAt": "2026-07-19T08:39:58Z"
}
===docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/receipt.json
{
  "schemaVersion": 1,
  "taskId": "t2",
  "manifestPath": "docs/validation/sdlc-question-discipline/t2.json",
  "manifestSha256": "db6244591c4cfef99cfd4055fdd12ae845600303c4f21542b52bb15fc47f5d03",
  "runnerReportSha256": "c9618797e70d171f98c01632c54db288d3680615acadabeb8a96ec97a7af7b59",
  "generatedAgentSha256": "ec3895ff8b685dc90b6ce2db27aa82b37d1abeea1612749d9b1377c42d69cbdd",
  "model": "openai-codex/gpt-5.6-terra",
  "runnerVerdict": "PASS",
  "validatorVerdict": "PASS",
  "createdAt": "2026-07-19T08:47:30Z"
}
bash: git diff --unified=30 main...50c928643a377163ea472485127d...
bash: git show 50c928643a377163ea472485127dab804e73f8e4:skills/...
bash: git show 50c928643a377163ea472485127dab804e73f8e4:skills/...
bash: git show main:skills/sdlc/references/phase-pr-review.md |...
diff --git a/.github/pull_request_template.md b/.github/pull_request_template.md
index 909ceb3..2780304 100644
--- a/.github/pull_request_template.md
+++ b/.github/pull_request_template.md
@@ -1,23 +1,29 @@
 <!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
 ```sdlc
 track: reversible
 slug: replace-with-feature-slug
 ```
 ## Governing documents
 - Irreversible: link the plan, Specification, and Build plan.
 - Reversible: link the plan and Build plan; no Specification is required.
 - None: replace `slug:` with `reason:` and explain the exemption.
 ## Tracker references
 For a tracker-backed Build (two or more tasks), link the epic and every task
 sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
 PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
 Build` and explain briefly.
 - Epic: `#<epic-issue>`
 - Tasks: `#<task-issue>`, `#<task-issue>`
 - Board: `<TRACKER_BOARD>`
+
+## Assumptions & discretionary calls
+
+Assumptions and discretionary implementation choices accrued during Implement,
+copied from the build-plan doc's "Assumptions" appendix. Review input for the
+PR panel — not a place for panel findings. Write `None` when nothing accrued.
diff --git a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
index 90b1252..25e0e47 100644
--- a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
+++ b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
@@ -27,61 +27,61 @@ The table below is the ASD5 review baseline. Each row has:
 anchor check.
 ## Normative statements
 | ID | Statement (gist) | Disposition | Destination | Anchor |
 |---|---|---|---|---|
 | S01 | Adoption is opt-in, not a global default | retained | skills/sdlc/SKILL.md | framework a repo *adopts*, not a global default |
 | S02 | Ready criteria; four mechanical states | retained | skills/sdlc/SKILL.md | proves this mechanically with four states |
 | S03 | Run the gate; branch on exit code | retained | skills/sdlc/SKILL.md | branch on its exit |
 | S04 | Exit 0 ready: announce + enumerate hooks/workflow | retained | skills/sdlc/SKILL.md | announce with the config's `announce` string |
 | S05 | Exit 1 not-adopted: no announce; offer setup/advisory | retained | skills/sdlc/SKILL.md | State the repo has not adopted the |
 | S06 | Exit 2 error: stop; never downgrade to advisory | retained | skills/sdlc/SKILL.md | An error is never silently downgraded to advisory mode |
 | S07 | Exit 3 not-ready: remediate; schema-current; no fold-forward | retained | skills/sdlc/SKILL.md | pre-adoption config fold-forward |
 | S08 | Before ready, MUST NOT enter phase/fire hooks/mutate tracker | retained | skills/sdlc/SKILL.md | MUST NOT create or mutate tracker objects |
 | S09 | Startup table is agent-executed prose law (ADR 0011) | retained | skills/sdlc/SKILL.md | agent-executed prose law (ADR 0011) |
 | S10 | Advisory mode is a one-session escape hatch | moved | skills/sdlc/references/system-reference.md | escape hatch when a repo has not opted in |
 | S11 | Advisory-mode behavioural rules | moved | skills/sdlc/references/system-reference.md | never claim the session runs |
 | S12 | Iron law: backward always allowed, no sunk-cost | retained | skills/sdlc/SKILL.md | sunk cost of an earlier gate never justifies shipping a |
 | S13 | Irreversible definition | retained | skills/sdlc/SKILL.md | freezes a shape other code, data, or |
 | S14 | Irreversible track requires plan+spec panels | retained | skills/sdlc/SKILL.md | plan panel AND spec panel |
 | S15 | Reversible fast path; PR panel still runs | retained | skills/sdlc/SKILL.md | none pre-PR; the PR panel still runs |
 | S16 | PR track declaration, check-lifecycle, bot exemption | moved | skills/sdlc/references/phase-pr-review.md | PRs without a valid declaration |
 | S17 | Review dials + overrides + separateSpec | retained | skills/sdlc/SKILL.md | `shape.separateSpec: false` merges Plan and Spec |
 | S18 | Read config for values, CONFIG.md for meaning | retained | skills/sdlc/SKILL.md | Read the config for values |
 | S19 | Phase/artifact/home sequence table | retained | skills/sdlc/SKILL.md | task breakdown with checks + scenario ids |
 | S20 | Brainstorm map-mode footnote | moved | skills/sdlc/references/phase-brainstorm.md | too large or too foggy |
 | S21 | Build epic-mode footnote | moved | skills/sdlc/references/phase-tasks.md | tracker-backed Build (epic + sub-issues + board) |
 | S22 | Brainstorm is live dialogue; rubber-duck | moved | skills/sdlc/references/phase-brainstorm.md | rubber-duck the idea, not agree with it |
 | S23 | Raise a contradiction or say there isn't one | moved | skills/sdlc/references/phase-brainstorm.md | Raise a contradiction, or say there isn't one |
 | S24 | Use tools, proportional not mandatory | moved | skills/sdlc/references/phase-brainstorm.md | proportional, not mandatory ceremony |
-| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present multiple open questions in a structured form |
+| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present open questions per the shared contract |
 | S26 | Expand and pressure-test, don't commandeer | moved | skills/sdlc/references/phase-brainstorm.md | Expand and pressure-test, don't commandeer |
 | S27 | Map mode: switch when large/foggy | moved | skills/sdlc/references/phase-brainstorm.md | wayfinder-lite |
 | S28 | The map issue is the canonical resumable artifact | moved | skills/sdlc/references/phase-brainstorm.md | resumable artifact for the effort, not a doc |
 | S29 | Tickets are typed native sub-issues, HITL/AFK | moved | skills/sdlc/references/phase-brainstorm.md | native GitHub sub-issues of the map |
 | S30 | Fog of war: only ticket sharp questions | moved | skills/sdlc/references/phase-brainstorm.md | Don't ticket what you can't yet phrase precisely |
 | S31 | Out of scope is not fog | moved | skills/sdlc/references/phase-brainstorm.md | Work beyond the destination |
 | S32 | Working the map: one ticket per session | moved | skills/sdlc/references/phase-brainstorm.md | never resolve more than one ticket per session |
 | S33 | Exit the moment the destination is decision-ready | moved | skills/sdlc/references/phase-brainstorm.md | the moment the destination is decision-ready |
 | S34 | Build-plan doc is canonical; publish threshold | moved | skills/sdlc/references/phase-tasks.md | canonical task breakdown |
 | S35 | Epic/sub-issue/blocking/board discipline | moved | skills/sdlc/references/phase-tasks.md | One **native sub-issue per task** |
 | S36 | Below-threshold plain doc; Implement frontier | moved | skills/sdlc/references/phase-tasks.md | one sub-issue at a time |
 | S37 | Tracker is a projection; doc wins | moved | skills/sdlc/references/phase-tasks.md | never the source of truth |
 | S38 | Spec defines falsifiable scenarios, not test code | moved | skills/sdlc/references/phase-spec.md | A scenario that cannot be made to fail is a broken spec |
 | S39 | Implementer writes tests test-first; floor not ceiling | moved | skills/sdlc/references/phase-implement.md | floor, not the ceiling |
 | S40 | Panels share one shape; prompts single source | moved | skills/sdlc/references/phase-pr-review.md | single sources of truth in `prompts/` |
 | S41 | resolve-panel behaviour | moved | skills/sdlc/references/phase-pr-review.md | keeps models with credentials |
 | S42 | Dispatch: two paths, one reused agent | moved | skills/sdlc/references/phase-pr-review.md | one agent reused across the panel |
 | S43 | Before fan-out confirm the subagent tool | moved | skills/sdlc/references/phase-pr-review.md | confirm the `subagent` tool is actually in |
 | S44 | Consolidate duplicates | moved | skills/sdlc/references/phase-pr-review.md | collapse duplicates into one issue |
 | S45 | Adjudicate every high/medium; ~80% right | moved | skills/sdlc/references/phase-pr-review.md | roughly eighty per cent right |
 | S46 | Stop when no high/medium survives | moved | skills/sdlc/references/phase-pr-review.md | no high or medium finding survives adjudication |
 | S47 | Save panel artifacts under reviews home | moved | skills/sdlc/references/phase-pr-review.md | Save panel artifacts under |
 | S48 | review.tasks dial; validator is a checklist executor | moved | skills/sdlc/references/phase-implement.md | checklist executor, not a judge |
 | S49 | Portable/deterministic; no imposed tsc | moved | skills/sdlc/references/phase-implement.md | no unconditional `npx tsc --noEmit` |
 | S50 | PV1 manifest, five categories, scenario mapping | moved | skills/sdlc/references/phase-implement.md | five categories |
 | S51 | PV2 deterministic runner; receipt; verify | moved | skills/sdlc/references/phase-implement.md | verify-task-receipt.mjs |
 | S52 | Prepare PR body from template; declare/link | moved | skills/sdlc/references/phase-pr-review.md | Prepare the PR body from |
 | S53 | Run check-lifecycle before opening the PR | moved | skills/sdlc/references/phase-pr-review.md | run the local lifecycle checker |
 | S54 | Local PR panel loop; keep dev findings out of PR body | moved | skills/sdlc/references/phase-pr-review.md | do not add development findings to the PR body |
 | S55 | Open only when clean; new-concern reply-with-SHA flow | moved | skills/sdlc/references/phase-pr-review.md | reply with that commit's short SHA |
diff --git a/skills/sdlc/assets/pull_request_template.md b/skills/sdlc/assets/pull_request_template.md
index 909ceb3..2780304 100644
--- a/skills/sdlc/assets/pull_request_template.md
+++ b/skills/sdlc/assets/pull_request_template.md
@@ -1,23 +1,29 @@
 <!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
 ```sdlc
 track: reversible
 slug: replace-with-feature-slug
 ```
 ## Governing documents
 - Irreversible: link the plan, Specification, and Build plan.
 - Reversible: link the plan and Build plan; no Specification is required.
 - None: replace `slug:` with `reason:` and explain the exemption.
 ## Tracker references
 For a tracker-backed Build (two or more tasks), link the epic and every task
 sub-issue. Use `Closes #<task-issue>` for task issues completed by merging this
 PR. For a single-task or `track: none` change, write `N/A — no tracker-backed
 Build` and explain briefly.
 - Epic: `#<epic-issue>`
 - Tasks: `#<task-issue>`, `#<task-issue>`
 - Board: `<TRACKER_BOARD>`
+
+## Assumptions & discretionary calls
+
+Assumptions and discretionary implementation choices accrued during Implement,
+copied from the build-plan doc's "Assumptions" appendix. Review input for the
+PR panel — not a place for panel findings. Write `None` when nothing accrued.
diff --git a/skills/sdlc/references/phase-brainstorm.md b/skills/sdlc/references/phase-brainstorm.md
index fd99f8b..2982aab 100644
--- a/skills/sdlc/references/phase-brainstorm.md
+++ b/skills/sdlc/references/phase-brainstorm.md
@@ -9,64 +9,70 @@
 ## 1. Purpose and invocation modes
 Brainstorm turns an idea into an agreed design. It runs two ways:
 - **Full lifecycle:** the first phase, entered after `sdlc-status` reports ready.
 - **Standalone entrypoint `sdlc:brainstorm`** (`templates/sdlc-brainstorm.md`):
   a directly invocable dialogue. It needs no committed upstream; unadopted it
   runs as plain dialogue, adopted it runs as the configured gate.
 Brainstorm is a live dialogue, not a drafting exercise the agent completes
 alone. The agent's job is to be the author's thinking companion: actively
 rubber-duck the idea, not agree with it. Going along with whatever the human
 says first is a failure mode, not politeness. This applies to both plain
 dialogue and map mode below — it is how the conversation runs, not a mode of
 its own.
 Concrete behaviour, not just tone:
 - **Raise a contradiction, or say there isn't one.** Before the gate, name at
   least one contradiction, unstated assumption, or gap in the design if one
   exists. If the design is genuinely clean, state that explicitly ("no
   contradiction found") rather than saying nothing — silence is not evidence of
   soundness.
 - **Use the tools available**, not just the conversation, when they would
   actually sharpen the thinking: web research for prior art or external
   grounding, and codebase exploration when the idea touches an existing pattern
   the human might be unaware of or wrongly assuming is novel. This is
   proportional, not mandatory ceremony — a brief brainstorm does not need a
   research pass just to be brief.
-- **Present multiple open questions in a structured form** when the environment
-  provides a tool for that (e.g. a questions-helper plugin) rather than a wall of
-  unstructured prose. When it is not there, degrade to inline structured prose
-  (see `references/system-reference.md`, "Skills and tools are enhancements").
+- **Present open questions per the shared contract** —
+  `references/system-reference.md`, "Presenting questions to the human": one
+  numbered end-of-reply block, enumerated alternatives, reasoned
+  recommendations, the uniform soft cap, and the Blocking/Assumption/Parked
+  triage tiers — never a wall of unstructured prose. Brainstorm's delta: a
+  recommendation must **widen the option space, not steer it** — recommend
+  freely on mechanical questions (where something should live), sparingly on
+  design direction (what something should be). Assumptions stated in dialogue
+  need no ledger here: Brainstorm commits no artifact, and the Plan restates
+  every assumption that survives.
 - **Expand and pressure-test, don't commandeer.** Contradictions and questions
   exist to widen the human's option space, not to steer the design toward the
   agent's own preferred answer. The human remains the owner of the direction;
   the gate is *their* approval, not the agent's conviction.
 ## 2. Entry conditions and authoritative upstream inputs
 No committed upstream artifact is required — Brainstorm forms intent live. Its
 authoritative inputs are the human's stated goal and any existing code, docs, or
 prior-art the dialogue chooses to ground against.
 ## 3. Configured before-hook order and blocking semantics
 If the effective config declares `hooks.brainstorm.before` (and/or `hooks."*"`),
 fire them first. **Before** hooks fire `*` items first, then phase-specific; a
 failed or skipped `before` hook **blocks** the phase. See
 `references/system-reference.md`, "Hooks", for the full hook contract, ordering,
 failure semantics, and the announce-on-fire audit trail.
 > **Under your configuration:** the hooks that actually fire are whatever
 > `.pi/sdlc/sdlc.config.json` declares for `brainstorm`/`*`. Do not assume any
 > repo has brainstorm hooks.
 ## 4. Required activity and artifact/output shape
 The activity is the dialogue itself. Plain brainstorm produces **no committed
 artifact** — the agreed design is carried forward into the Plan. Map mode (§9)
 produces a GitHub map issue as its canonical, resumable record.
 ## 5. Invariant gate/approval seam
@@ -104,55 +110,58 @@ using the agreed design as its objective.
 Default brainstorm is a single dialogue gated by human approval, sized for one
 session. Switch to **map mode** when the idea is too large or too foggy for
 that: the destination — what reaching the end of this effort's brainstorming
 looks like, usually a Plan-ready decision — is not visible yet, and forcing it
 into one dialogue would either truncate the thinking or blow the session's
 context.
 **The map** is a GitHub issue labeled `<LABEL_PREFIX>:map` — the canonical,
 resumable artifact for the effort, not a doc. Its body carries: **Destination**
 (what reaching the end of this map looks like, one or two lines), **Notes**
 (skills to consult, standing preferences), **Decisions so far** (one line per
 closed ticket, gisted, linking the ticket for detail), and **Not yet specified**
 (the fog — see below). Never restate a ticket's detail on the map; the map is an
 index, the ticket is the store.
 **Tickets** are native GitHub sub-issues of the map, each typed by label
 (`<LABEL_PREFIX>:ticket-research` | `-prototype` | `-grilling` | `-task` — see
 `assets/tracker-ops.md` for the label vocabulary and every mutation). Every
 ticket is either **HITL** (worked with a live human — it only resolves through
 that real exchange; an agent answering its own grilling questions has broken
 this) or **AFK** (agent alone), marked explicitly with the `<LABEL_PREFIX>:hitl`
 / `<LABEL_PREFIX>:afk` label alongside its ticket-type label. A session
 **claims** a ticket by assigning it to itself before starting work
 (`assets/tracker-ops.md`, "Claim by assignment"). Blocking uses the native
 `blockedBy` edge so the **frontier** — open, unblocked, unclaimed tickets — is
 visible without reopening a conversation.
 **Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
 whether the question is sharp now, not whether you can answer it now: ticket when
 it is already sharp (even if blocked); leave it in **Not yet specified** when you
-can't yet phrase it that sharply — write it as loosely as the view allows.
+can't yet phrase it that sharply — write it as loosely as the view allows. A
+**parked** question (the shared contract's tier) is fog by another name: in map
+mode it lands in Not yet specified rather than a separate ledger, graduating to
+a ticket once sharp.
 Resolving a ticket clears the fog ahead of it, graduating whatever is now
 specifiable into fresh tickets, one at a time.
 **Out of scope.** Work beyond the destination is not fog — it is out of scope,
 its own map section, never graduating. If a ticket turns out to sit past the
 destination, close it and record one line (gist + why) in Out of scope rather
 than resolving it on the route.
 **Working the map** (never resolve more than one ticket per session): load the
 map's low-res body (not every ticket); choose the ticket (the user's choice, or
 the first frontier ticket); claim it; resolve it, invoking whatever the ticket
 type and `## Notes` call for; record the resolution as a comment, close the
 ticket, and append one line to Decisions so far; graduate any fog the answer
 specifies into fresh tickets, and rule out of scope anything the answer reveals
 is past the destination.
 **Exit** the moment the destination is decision-ready — often before every fog
 patch has graduated. At that point proceed to Plan normally, using the
 destination as its objective. If breadth-first mapping surfaces no fog at all —
 the whole effort fits in one session — skip the map and use plain brainstorm
 dialogue instead.
 Map-mode mechanics (labels, sub-issue/blocking mutations, board discipline) are
 owned once by `assets/tracker-ops.md`.
diff --git a/skills/sdlc/references/phase-implement.md b/skills/sdlc/references/phase-implement.md
index 8456824..d244541 100644
--- a/skills/sdlc/references/phase-implement.md
+++ b/skills/sdlc/references/phase-implement.md
@@ -19,60 +19,78 @@ branch. It runs two ways:
   check tables**.
 The implementer writes real tests **test-first** (watch them fail, then
 implement) and treats the spec scenarios as the **floor, not the ceiling**.
 ## 2. Entry conditions and authoritative upstream inputs
 The authoritative upstream input is the committed build-plan doc (and its tracker
 projection above threshold): each task's check commands and the scenario ids it
 satisfies. Work the board's frontier one sub-issue at a time when tracker-backed;
 claim before starting.
 ## 3. Configured before-hook order and blocking semantics
 Fire `hooks.implement.before` (and `hooks."*"`) first: `*` items first, then
 phase-specific. A failed or skipped `before` hook **blocks** the phase. A common
 `implement.before` hook creates **and enters** a worktree — the session's working
 root must move into it (create-then-enter); writing to the main checkout after
 creating a worktree is a red flag. Full hook contract, working-directory rule,
 and announce-on-fire audit trail in `references/system-reference.md`, "Hooks".
 > **Under your configuration:** the implement hooks that fire are exactly those
 > declared in `sdlc.config.json`; do not assume a worktree hook exists.
 ## 4. Required activity and artifact/output shape
 Produce code and tests on the feature branch (worktree or checkout per the
 project's hooks/workflow). Each task's checks are whatever its approved Build task
 declared.
+**Dialogue discipline.** Implement lowers the interrupt surface of the shared
+contract (`references/system-reference.md`,
+"Presenting questions to the human") to near zero:
+
+- **Mid-task interrupts are reserved for external blockers only** — missing
+  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
+  cases where proceeding is impossible and no repository reading helps.
+- Everything else batches to the **task boundary** (the validator seam) under
+  the uniform cap. Expected steady state is near zero: an upstream flaw is a
+  backward transition (§6), and a discretionary implementation choice the
+  upstream deliberately left open is the agent's call, recorded as an
+  assumption — asking the human to make it is ceremony, not care.
+- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
+  tasks complete (plus the task's close comment when tracker-backed) and are
+  copied into the PR body's **"Assumptions & discretionary calls"** section at
+  PR preparation, where the panel reads them as review input
+  (`references/phase-pr-review.md`).
+
 ## 5. Invariant gate/approval seam — the per-task validator
 The invariant seam is per-task validation selected by `review.tasks`:
 - `subagent` (default): each task ends with one **validator subagent**, a
   checklist executor, not a judge.
 - `self`: the implementer runs the same declared checks directly (no subagent
   dispatch; `resolve-panel task_validate` refuses).
 - `off`: per-task validation is skipped entirely — no manifest, runner, receipt,
   or PASS gate is required.
 > **Under your configuration:** read the effective `review.tasks` value from
 > current `CONFIG.md` (or authoritative `sdlc.config.json`); never assume
 > `subagent`. Per-track `overrides` may adjust it.
 Validation is **portable and deterministic**: the task's checks are whatever its
 approved Build task declared, never a language or tool the skill imposes. There
 is no unconditional `npx tsc --noEmit` and no assumed `CONTRIBUTORS` file — a
 TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
 linter, another repo declares its own tools.
 Under `subagent` or `self`, every task carries a committed **PV1 validation manifest**
 (`<repository validation home>/<feature>/<task-id>.json`, schema
 `schema/task-validation-manifest.schema.json`) projected from its canonical Build
 task. It names, as exact argv arrays, the task's checks across five categories —
 `tests`, `static`, `scenarios`, `standards`, `bannedPatterns` — each `required`
 or `n/a` with a Build-approved reason, plus the mapping from each owned
 Specification scenario to the required checks that evidence it.
 The **deterministic runner** (`scripts/validate-task.sh` → `validate-task.mjs`,
@@ -108,39 +126,43 @@ Fire `hooks.implement.after` (and `hooks."*"`) after each unit of work:
 phase-specific first, then `*`. A failed `after` hook **warns** (recorded, never
 blocking).
 ## 8. Completion evidence and next transition
 Completion evidence is passing tests, per-task PASS receipts (under `subagent`/
 `self`), and closed sub-issues (tracker-backed). Next transition is **PR review**
 (`references/phase-pr-review.md`).
 ## 9. Advanced-mode pointers
 Tracker-backed frontier work is described in `references/phase-tasks.md`, "§9".
 ## 10. Dispatching implementation workers
 When Implement delegates a task to a subagent rather than building in the
 surface directly, give it the same shape every time:
 - **Scope, stated as a stop-condition.** Name exactly the task's check
   commands and Definition-of-Done items as the boundary of its work, and say
   plainly not to explore or fix adjacent things past that boundary.
 - **A `toolBudget`/`turnBudget` by default.** Attach a bounded budget (the
   `subagent` tool's own `toolBudget: { soft, hard }` / `turnBudget: {
   maxTurns, graceTurns }` parameters) so a worker drifting past scope is
   nudged, then finalized, without a human having to notice and intervene.
 - **A canonical "finalize now" resume message** for a worker caught
   exploring past scope: "You were exploring past this task's stated scope.
   Stop investigating and finalize your current change against the stated
   check commands now." Reuse this wording rather than improvising a new one
   each time.
+- **Workers never triage for themselves.** A dispatched worker's blocking
+  question returns to the dispatching implementer — its stop-condition and
+  budget shape already imply this — and the implementer applies the shared
+  contract's triage tiers. One channel to the human, never one per worker.
 - **Infra failure gets one automatic retry; no verdict does.** If a
   dispatched worker's run ends in an **infra-class failure** — a process
   crash, an out-of-memory kill, overload or billing exhaustion, a provider
   timeout, a transport/tool error, or empty output — that is infrastructure
   noise, not a REVISE/FAIL verdict from the model. Retry that exact dispatch once, automatically, before treating it as
   needing human attention. A second consecutive infra failure on the same
   dispatch, or any model-authored verdict, surfaces to the human as normal —
   never silently retried away.
diff --git a/skills/sdlc/references/phase-plan.md b/skills/sdlc/references/phase-plan.md
index 28da500..4490875 100644
--- a/skills/sdlc/references/phase-plan.md
+++ b/skills/sdlc/references/phase-plan.md
@@ -10,60 +10,80 @@
 ## 1. Purpose and invocation modes
 Plan fixes the objectives, rationale, scope, definition of done, and context for
 the next agent. It runs two ways:
 - **Full lifecycle:** entered after an agreed Brainstorm design.
 - **Standalone entrypoint `sdlc:plan`** (`templates/sdlc-plan.md`): needs no
   committed upstream; unadopted it runs and forms intent live, adopted it runs as
   the configured gate.
 ## 2. Entry conditions and authoritative upstream inputs
 The authoritative upstream input is the agreed Brainstorm design (or, standalone,
 the intent formed live). No committed artifact is required to begin.
 ## 3. Configured before-hook order and blocking semantics
 Fire `hooks.plan.before` (and `hooks."*"`) first: `*` items first, then
 phase-specific; array order within a list. A failed or skipped `before` hook
 **blocks** the phase. Full contract in `references/system-reference.md`, "Hooks".
 > **Under your configuration:** the plan hooks that fire are exactly those
 > declared in `sdlc.config.json`; assume none by default.
 ## 4. Required activity and artifact/output shape
 Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
 and context for the next agent**. Its home routes to the configured
 `paths.plans`.
+**Dialogue discipline.** Ask per the shared contract
+(`references/system-reference.md`, "Presenting questions to the human") with
+Plan's convergent delta:
+
+- Every blocking question must **close a decision that blocks writing a
+  specific Plan section**. A question that would reopen the agreed design is
+  not a Plan question — present it as a proposed backward transition to
+  Brainstorm (§6), never smuggled into the block.
+- **Recommendations are expected**: by Plan the agent holds an agreed design;
+  a blocking question with no recommendation signals the design was not
+  actually agreed.
+- **Draft first**: present the drafted Plan doc with the question block
+  alongside it; ask before drafting only when a blocking question prevents any
+  credible draft.
+- The triage tiers map onto the artifact: **assumptions are written into the
+  doc** (rationale/context) so gate approval ratifies them rather than leaving
+  them in session scrollback, and **parked questions go into "context for the
+  next agent"**. Scope-boundary questions always carry enumerated
+  alternatives — "is X in or out" is never posed as open prose.
+
 > **Under your configuration:** the artifact home is `<paths.plans>/<date>-<feat>.md`
 > using the committed `paths.plans` value — do not hardcode `docs/plans`.
 ## 5. Invariant gate/approval seam
 The invariant seam is a **design gate plus human approval**. The design gate is
 `review.design`; on the irreversible track a plan panel runs before approval.
 > **Under your configuration:** `review.design` is one of `panel` | `advisory` |
 > `human` | `off`, and per-track `overrides.{irreversible,reversible}` may adjust
 > it. On the **reversible** track there is no pre-PR design panel (the PR panel
 > still runs); on the **irreversible** track the plan panel runs. Read the
 > effective track and `review.design` from current `CONFIG.md` (or authoritative
 > `sdlc.config.json`) — never assume `panel`, and never assume the track. When
 > `shape.separateSpec: false`, Plan and Spec merge into one gated artifact.
 When a panel runs, it follows the shared panel run-shape (resolve → dispatch →
 consolidate → adjudicate → stop) owned by `references/phase-pr-review.md`,
 "Panels". The reviewer prompt is `prompts/adversary-plan.prompt.md` via the
 `plan_review` phase; never hand-copy a prompt per model.
 ## 6. Refusal and backward-transition behaviour
 Plan does not refuse on upstream grounds. Backward transition to Brainstorm is
 always allowed when planning reveals the design is unsound.
 ## 7. After-hook order and warning semantics
 Fire `hooks.plan.after` (and `hooks."*"`) after the gate: phase-specific first,
 then `*`. A failed `after` hook **warns** (recorded, never blocking).
     1	# Phase reference: Brainstorm
     2
     3	> Detailed public contract for the Brainstorm phase. `SKILL.md` owns the kernel,
     4	> the readiness gate, and the phase sequence; this reference owns Brainstorm's
     5	> mechanics. Paths are skill-relative. Every configuration-dependent branch is an
     6	> explicit **under your configuration** callout routed to the effective shape
     7	> (current `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the
     8	> companion is absent or stale) — never a silently assumed value.
     9
    10	## 1. Purpose and invocation modes
    11
    12	Brainstorm turns an idea into an agreed design. It runs two ways:
    13
    14	- **Full lifecycle:** the first phase, entered after `sdlc-status` reports ready.
    15	- **Standalone entrypoint `sdlc:brainstorm`** (`templates/sdlc-brainstorm.md`):
    16	  a directly invocable dialogue. It needs no committed upstream; unadopted it
    17	  runs as plain dialogue, adopted it runs as the configured gate.
    18
    19	Brainstorm is a live dialogue, not a drafting exercise the agent completes
    20	alone. The agent's job is to be the author's thinking companion: actively
    21	rubber-duck the idea, not agree with it. Going along with whatever the human
    22	says first is a failure mode, not politeness. This applies to both plain
    23	dialogue and map mode below — it is how the conversation runs, not a mode of
    24	its own.
    25
    26	Concrete behaviour, not just tone:
    27
    28	- **Raise a contradiction, or say there isn't one.** Before the gate, name at
    29	  least one contradiction, unstated assumption, or gap in the design if one
    30	  exists. If the design is genuinely clean, state that explicitly ("no
    31	  contradiction found") rather than saying nothing — silence is not evidence of
    32	  soundness.
    33	- **Use the tools available**, not just the conversation, when they would
    34	  actually sharpen the thinking: web research for prior art or external
    35	  grounding, and codebase exploration when the idea touches an existing pattern
    36	  the human might be unaware of or wrongly assuming is novel. This is
    37	  proportional, not mandatory ceremony — a brief brainstorm does not need a
    38	  research pass just to be brief.
    39	- **Present open questions per the shared contract** —
    40	  `references/system-reference.md`, "Presenting questions to the human": one
    41	  numbered end-of-reply block, enumerated alternatives, reasoned
    42	  recommendations, the uniform soft cap, and the Blocking/Assumption/Parked
    43	  triage tiers — never a wall of unstructured prose. Brainstorm's delta: a
    44	  recommendation must **widen the option space, not steer it** — recommend
    45	  freely on mechanical questions (where something should live), sparingly on
    46	  design direction (what something should be). Assumptions stated in dialogue
    47	  need no ledger here: Brainstorm commits no artifact, and the Plan restates
    48	  every assumption that survives.
    49	- **Expand and pressure-test, don't commandeer.** Contradictions and questions
    50	  exist to widen the human's option space, not to steer the design toward the
    51	  agent's own preferred answer. The human remains the owner of the direction;
    52	  the gate is *their* approval, not the agent's conviction.
    53
    54	## 2. Entry conditions and authoritative upstream inputs
    55
    56	No committed upstream artifact is required — Brainstorm forms intent live. Its
    57	authoritative inputs are the human's stated goal and any existing code, docs, or
    58	prior-art the dialogue chooses to ground against.
    59
    60	## 3. Configured before-hook order and blocking semantics
    61
    62	If the effective config declares `hooks.brainstorm.before` (and/or `hooks."*"`),
    63	fire them first. **Before** hooks fire `*` items first, then phase-specific; a
    64	failed or skipped `before` hook **blocks** the phase. See
    65	`references/system-reference.md`, "Hooks", for the full hook contract, ordering,
    66	failure semantics, and the announce-on-fire audit trail.
    67
    68	> **Under your configuration:** the hooks that actually fire are whatever
    69	> `.pi/sdlc/sdlc.config.json` declares for `brainstorm`/`*`. Do not assume any
    70	> repo has brainstorm hooks.
    71
    72	## 4. Required activity and artifact/output shape
    73
    74	The activity is the dialogue itself. Plain brainstorm produces **no committed
    75	artifact** — the agreed design is carried forward into the Plan. Map mode (§9)
    76	produces a GitHub map issue as its canonical, resumable record.
    77
    78	## 5. Invariant gate/approval seam
    79
    80	The invariant seam is **human approval of the agreed design**. The gate is the
    81	human owner's, not the agent's.
    82
    83	> **Under your configuration:** `review.brainstorm` is `human` or `off`. Read the
    84	> effective value from current `CONFIG.md` (or authoritative `sdlc.config.json`).
    85	> When `off`, there is no explicit brainstorm gate, but the design must still be
    86	> agreed before Plan begins; never assume a fixed gate mode.
    87
    88	## 6. Refusal and backward-transition behaviour
    89
    90	Brainstorm refuses nothing on upstream grounds (there is no upstream). Backward
    91	transition into Brainstorm from any later phase is always allowed and never
    92	penalised when a later phase exposes a design flaw — the sunk cost of a later
    93	gate never justifies shipping a known-wrong design.
    94
    95	## 7. After-hook order and warning semantics
    96
    97	If `hooks.brainstorm.after` (and/or `hooks."*"`) are declared, fire them after
    98	the gate: phase-specific first, then `*`. A failed `after` hook **warns**
    99	(recorded, never blocking). Full semantics in `references/system-reference.md`,
   100	"Hooks".
   101
   102	## 8. Completion evidence and next transition
   103
   104	Completion evidence is the human-approved design (plain mode) or a
   105	decision-ready map destination (map mode). The next transition is **Plan**,
   106	using the agreed design as its objective.
   107
   108	## 9. Advanced-mode pointers — map mode (wayfinder-lite)
   109
   110	Default brainstorm is a single dialogue gated by human approval, sized for one
   111	session. Switch to **map mode** when the idea is too large or too foggy for
   112	that: the destination — what reaching the end of this effort's brainstorming
   113	looks like, usually a Plan-ready decision — is not visible yet, and forcing it
   114	into one dialogue would either truncate the thinking or blow the session's
   115	context.
   116
   117	**The map** is a GitHub issue labeled `<LABEL_PREFIX>:map` — the canonical,
   118	resumable artifact for the effort, not a doc. Its body carries: **Destination**
   119	(what reaching the end of this map looks like, one or two lines), **Notes**
   120	(skills to consult, standing preferences), **Decisions so far** (one line per
   121	closed ticket, gisted, linking the ticket for detail), and **Not yet specified**
   122	(the fog — see below). Never restate a ticket's detail on the map; the map is an
   123	index, the ticket is the store.
   124
   125	**Tickets** are native GitHub sub-issues of the map, each typed by label
   126	(`<LABEL_PREFIX>:ticket-research` | `-prototype` | `-grilling` | `-task` — see
   127	`assets/tracker-ops.md` for the label vocabulary and every mutation). Every
   128	ticket is either **HITL** (worked with a live human — it only resolves through
   129	that real exchange; an agent answering its own grilling questions has broken
   130	this) or **AFK** (agent alone), marked explicitly with the `<LABEL_PREFIX>:hitl`
   131	/ `<LABEL_PREFIX>:afk` label alongside its ticket-type label. A session
   132	**claims** a ticket by assigning it to itself before starting work
   133	(`assets/tracker-ops.md`, "Claim by assignment"). Blocking uses the native
   134	`blockedBy` edge so the **frontier** — open, unblocked, unclaimed tickets — is
   135	visible without reopening a conversation.
   136
   137	**Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
   138	whether the question is sharp now, not whether you can answer it now: ticket when
   139	it is already sharp (even if blocked); leave it in **Not yet specified** when you
   140	can't yet phrase it that sharply — write it as loosely as the view allows. A
   141	**parked** question (the shared contract's tier) is fog by another name: in map
   142	mode it lands in Not yet specified rather than a separate ledger, graduating to
   143	a ticket once sharp.
   144	Resolving a ticket clears the fog ahead of it, graduating whatever is now
   145	specifiable into fresh tickets, one at a time.
   146
   147	**Out of scope.** Work beyond the destination is not fog — it is out of scope,
   148	its own map section, never graduating. If a ticket turns out to sit past the
   149	destination, close it and record one line (gist + why) in Out of scope rather
   150	than resolving it on the route.
   151
   152	**Working the map** (never resolve more than one ticket per session): load the
   153	map's low-res body (not every ticket); choose the ticket (the user's choice, or
   154	the first frontier ticket); claim it; resolve it, invoking whatever the ticket
   155	type and `## Notes` call for; record the resolution as a comment, close the
   156	ticket, and append one line to Decisions so far; graduate any fog the answer
   157	specifies into fresh tickets, and rule out of scope anything the answer reveals
   158	is past the destination.
   159
   160	**Exit** the moment the destination is decision-ready — often before every fog
   161	patch has graduated. At that point proceed to Plan normally, using the
   162	destination as its objective. If breadth-first mapping surfaces no fog at all —
   163	the whole effort fits in one session — skip the map and use plain brainstorm
   164	dialogue instead.
   165
   166	Map-mode mechanics (labels, sub-issue/blocking mutations, board discipline) are
   167	owned once by `assets/tracker-ops.md`.
===PLAN
     1	# Phase reference: Plan
     2
     3	> Detailed public contract for the Plan phase. `SKILL.md` owns the kernel,
     4	> readiness gate, and phase sequence; this reference owns Plan's mechanics. Paths
     5	> are skill-relative. Every configuration-dependent branch is an explicit **under
     6	> your configuration** callout routed to the effective shape (current
     7	> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when the companion is
     8	> absent or stale) — never a silently assumed track, gate mode, or panel floor.
     9
    10	## 1. Purpose and invocation modes
    11
    12	Plan fixes the objectives, rationale, scope, definition of done, and context for
    13	the next agent. It runs two ways:
    14
    15	- **Full lifecycle:** entered after an agreed Brainstorm design.
    16	- **Standalone entrypoint `sdlc:plan`** (`templates/sdlc-plan.md`): needs no
    17	  committed upstream; unadopted it runs and forms intent live, adopted it runs as
    18	  the configured gate.
    19
    20	## 2. Entry conditions and authoritative upstream inputs
    21
    22	The authoritative upstream input is the agreed Brainstorm design (or, standalone,
    23	the intent formed live). No committed artifact is required to begin.
    24
    25	## 3. Configured before-hook order and blocking semantics
    26
    27	Fire `hooks.plan.before` (and `hooks."*"`) first: `*` items first, then
    28	phase-specific; array order within a list. A failed or skipped `before` hook
    29	**blocks** the phase. Full contract in `references/system-reference.md`, "Hooks".
    30
    31	> **Under your configuration:** the plan hooks that fire are exactly those
    32	> declared in `sdlc.config.json`; assume none by default.
    33
    34	## 4. Required activity and artifact/output shape
    35
    36	Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
    37	and context for the next agent**. Its home routes to the configured
    38	`paths.plans`.
    39
    40	**Dialogue discipline.** Ask per the shared contract
    41	(`references/system-reference.md`, "Presenting questions to the human") with
    42	Plan's convergent delta:
    43
    44	- Every blocking question must **close a decision that blocks writing a
    45	  specific Plan section**. A question that would reopen the agreed design is
    46	  not a Plan question — present it as a proposed backward transition to
    47	  Brainstorm (§6), never smuggled into the block.
    48	- **Recommendations are expected**: by Plan the agent holds an agreed design;
    49	  a blocking question with no recommendation signals the design was not
    50	  actually agreed.
    51	- **Draft first**: present the drafted Plan doc with the question block
    52	  alongside it; ask before drafting only when a blocking question prevents any
    53	  credible draft.
    54	- The triage tiers map onto the artifact: **assumptions are written into the
    55	  doc** (rationale/context) so gate approval ratifies them rather than leaving
    56	  them in session scrollback, and **parked questions go into "context for the
    57	  next agent"**. Scope-boundary questions always carry enumerated
    58	  alternatives — "is X in or out" is never posed as open prose.
    59
    60	> **Under your configuration:** the artifact home is `<paths.plans>/<date>-<feat>.md`
    61	> using the committed `paths.plans` value — do not hardcode `docs/plans`.
    62
    63	## 5. Invariant gate/approval seam
    64
    65	The invariant seam is a **design gate plus human approval**. The design gate is
    66	`review.design`; on the irreversible track a plan panel runs before approval.
    67
    68	> **Under your configuration:** `review.design` is one of `panel` | `advisory` |
    69	> `human` | `off`, and per-track `overrides.{irreversible,reversible}` may adjust
    70	> it. On the **reversible** track there is no pre-PR design panel (the PR panel
    71	> still runs); on the **irreversible** track the plan panel runs. Read the
    72	> effective track and `review.design` from current `CONFIG.md` (or authoritative
    73	> `sdlc.config.json`) — never assume `panel`, and never assume the track. When
    74	> `shape.separateSpec: false`, Plan and Spec merge into one gated artifact.
    75
    76	When a panel runs, it follows the shared panel run-shape (resolve → dispatch →
    77	consolidate → adjudicate → stop) owned by `references/phase-pr-review.md`,
    78	"Panels". The reviewer prompt is `prompts/adversary-plan.prompt.md` via the
    79	`plan_review` phase; never hand-copy a prompt per model.
    80
    81	## 6. Refusal and backward-transition behaviour
    82
    83	Plan does not refuse on upstream grounds. Backward transition to Brainstorm is
    84	always allowed when planning reveals the design is unsound.
    85
    86	## 7. After-hook order and warning semantics
    87
    88	Fire `hooks.plan.after` (and `hooks."*"`) after the gate: phase-specific first,
    89	then `*`. A failed `after` hook **warns** (recorded, never blocking).
    90
    91	## 8. Completion evidence and next transition
    92
    93	Completion evidence is the committed Plan doc plus, on the irreversible track,
    94	the consolidated plan-panel artifact under the configured reviews home and human
    95	approval. Next transition is **Specification** (or **Build/Tasks** directly when
    96	`shape.separateSpec: false` merges them, or on the reversible track where Spec is
    97	not required).
    98
    99	> **Under your configuration:** whether a separate Spec follows is set by
   100	> `shape.separateSpec` and the effective track; read it rather than assuming a
   101	> Spec is always next.
   102
   103	## 9. Advanced-mode pointers
   104
   105	None specific to Plan. Oversized/foggy efforts are handled upstream by Brainstorm
   106	map mode (`references/phase-brainstorm.md`).
     1	# Phase reference: Implement
     2
     3	> Detailed public contract for the Implement phase. `SKILL.md` owns the kernel
     4	> and phase sequence; this reference owns Implement's mechanics, including the
     5	> per-task validator. Paths are skill-relative. Every configuration-dependent
     6	> branch is an explicit **under your configuration** callout routed to the
     7	> effective shape (current `.pi/sdlc/CONFIG.md`, or authoritative
     8	> `sdlc.config.json` when absent/stale).
     9
    10	## 1. Purpose and invocation modes
    11
    12	Implement turns the vetted Build breakdown into code and tests on the feature
    13	branch. It runs two ways:
    14
    15	- **Full lifecycle:** entered after an approved Build breakdown.
    16	- **Standalone entrypoint `sdlc:implement`** (`templates/sdlc-implement.md`):
    17	  needs committed tasks/build with named checks. With absent upstream it
    18	  **always refuses-with-redirect** in both adoption states and **never fabricates
    19	  check tables**.
    20
    21	The implementer writes real tests **test-first** (watch them fail, then
    22	implement) and treats the spec scenarios as the **floor, not the ceiling**.
    23
    24	## 2. Entry conditions and authoritative upstream inputs
    25
    26	The authoritative upstream input is the committed build-plan doc (and its tracker
    27	projection above threshold): each task's check commands and the scenario ids it
    28	satisfies. Work the board's frontier one sub-issue at a time when tracker-backed;
    29	claim before starting.
    30
    31	## 3. Configured before-hook order and blocking semantics
    32
    33	Fire `hooks.implement.before` (and `hooks."*"`) first: `*` items first, then
    34	phase-specific. A failed or skipped `before` hook **blocks** the phase. A common
    35	`implement.before` hook creates **and enters** a worktree — the session's working
    36	root must move into it (create-then-enter); writing to the main checkout after
    37	creating a worktree is a red flag. Full hook contract, working-directory rule,
    38	and announce-on-fire audit trail in `references/system-reference.md`, "Hooks".
    39
    40	> **Under your configuration:** the implement hooks that fire are exactly those
    41	> declared in `sdlc.config.json`; do not assume a worktree hook exists.
    42
    43	## 4. Required activity and artifact/output shape
    44
    45	Produce code and tests on the feature branch (worktree or checkout per the
    46	project's hooks/workflow). Each task's checks are whatever its approved Build task
    47	declared.
    48
    49	**Dialogue discipline.** Implement lowers the interrupt surface of the shared
    50	contract (`references/system-reference.md`,
    51	"Presenting questions to the human") to near zero:
    52
    53	- **Mid-task interrupts are reserved for external blockers only** — missing
    54	  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
    55	  cases where proceeding is impossible and no repository reading helps.
    56	- Everything else batches to the **task boundary** (the validator seam) under
    57	  the uniform cap. Expected steady state is near zero: an upstream flaw is a
    58	  backward transition (§6), and a discretionary implementation choice the
    59	  upstream deliberately left open is the agent's call, recorded as an
    60	  assumption — asking the human to make it is ceremony, not care.
    61	- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
    62	  tasks complete (plus the task's close comment when tracker-backed) and are
    63	  copied into the PR body's **"Assumptions & discretionary calls"** section at
    64	  PR preparation, where the panel reads them as review input
    65	  (`references/phase-pr-review.md`).
    66
    67	## 5. Invariant gate/approval seam — the per-task validator
    68
    69	The invariant seam is per-task validation selected by `review.tasks`:
    70
    71	- `subagent` (default): each task ends with one **validator subagent**, a
    72	  checklist executor, not a judge.
    73	- `self`: the implementer runs the same declared checks directly (no subagent
    74	  dispatch; `resolve-panel task_validate` refuses).
    75	- `off`: per-task validation is skipped entirely — no manifest, runner, receipt,
    76	  or PASS gate is required.
    77
    78	> **Under your configuration:** read the effective `review.tasks` value from
    79	> current `CONFIG.md` (or authoritative `sdlc.config.json`); never assume
    80	> `subagent`. Per-track `overrides` may adjust it.
    81
    82	Validation is **portable and deterministic**: the task's checks are whatever its
    83	approved Build task declared, never a language or tool the skill imposes. There
    84	is no unconditional `npx tsc --noEmit` and no assumed `CONTRIBUTORS` file — a
    85	TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
    86	linter, another repo declares its own tools.
    87
    88	Under `subagent` or `self`, every task carries a committed **PV1 validation manifest**
    89	(`<repository validation home>/<feature>/<task-id>.json`, schema
    90	`schema/task-validation-manifest.schema.json`) projected from its canonical Build
    91	task. It names, as exact argv arrays, the task's checks across five categories —
    92	`tests`, `static`, `scenarios`, `standards`, `bannedPatterns` — each `required`
    93	or `n/a` with a Build-approved reason, plus the mapping from each owned
    94	Specification scenario to the required checks that evidence it.
    95
    96	The **deterministic runner** (`scripts/validate-task.sh` → `validate-task.mjs`,
    97	surface PV2) — not the model — validates the manifest, executes only its declared
    98	argv with no shell, evaluates categories and scenarios, bounds and redacts command
    99	evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or `ERROR` (exit 2).
   100	Build, not the validator, owns which commands run and which categories are `n/a`;
   101	the validator cannot invent a command, weaken a check, or decide applicability.
   102	Under `subagent`, the validator subagent (`prompts/validator-task.prompt.md`) runs
   103	the runner, confirms exit and report verdict agree, and reports each result; under
   104	`self` the implementer runs the runner directly. A nonzero runner result blocks
   105	task completion; a task is not done until the runner returns PASS. Each task stores
   106	a runtime receipt (manifest copy, runner report, hashes, verdicts, plus the
   107	generated-agent copy and model under `subagent`) under
   108	`docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verifiable with
   109	`scripts/verify-task-receipt.mjs`. Judgement review happens later at the PR panel.
   110
   111	> **Under your configuration:** the task-validator model preference is
   112	> `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5` — a `:low` (or
   113	> `:off`) thinking suffix fits this checklist-executor role. The effective roster
   114	> resolves from the committed `panels` block via `resolve-panel task_validate`.
   115
   116	## 6. Refusal and backward-transition behaviour
   117
   118	Standalone `sdlc:implement` refuses-with-redirect when its committed
   119	tasks/build upstream is absent. A failing validator blocks the task, not the
   120	whole lifecycle. Backward transition to Build/Spec is always allowed when
   121	implementation reveals an upstream flaw.
   122
   123	## 7. After-hook order and warning semantics
   124
   125	Fire `hooks.implement.after` (and `hooks."*"`) after each unit of work:
   126	phase-specific first, then `*`. A failed `after` hook **warns** (recorded, never
   127	blocking).
   128
   129	## 8. Completion evidence and next transition
   130
   131	Completion evidence is passing tests, per-task PASS receipts (under `subagent`/
   132	`self`), and closed sub-issues (tracker-backed). Next transition is **PR review**
   133	(`references/phase-pr-review.md`).
   134
   135	## 9. Advanced-mode pointers
   136
   137	Tracker-backed frontier work is described in `references/phase-tasks.md`, "§9".
   138
   139	## 10. Dispatching implementation workers
   140
   141	When Implement delegates a task to a subagent rather than building in the
   142	surface directly, give it the same shape every time:
   143
   144	- **Scope, stated as a stop-condition.** Name exactly the task's check
   145	  commands and Definition-of-Done items as the boundary of its work, and say
   146	  plainly not to explore or fix adjacent things past that boundary.
   147	- **A `toolBudget`/`turnBudget` by default.** Attach a bounded budget (the
   148	  `subagent` tool's own `toolBudget: { soft, hard }` / `turnBudget: {
   149	  maxTurns, graceTurns }` parameters) so a worker drifting past scope is
   150	  nudged, then finalized, without a human having to notice and intervene.
   151	- **A canonical "finalize now" resume message** for a worker caught
   152	  exploring past scope: "You were exploring past this task's stated scope.
   153	  Stop investigating and finalize your current change against the stated
   154	  check commands now." Reuse this wording rather than improvising a new one
   155	  each time.
   156	- **Workers never triage for themselves.** A dispatched worker's blocking
   157	  question returns to the dispatching implementer — its stop-condition and
   158	  budget shape already imply this — and the implementer applies the shared
   159	  contract's triage tiers. One channel to the human, never one per worker.
   160	- **Infra failure gets one automatic retry; no verdict does.** If a
   161	  dispatched worker's run ends in an **infra-class failure** — a process
   162	  crash, an out-of-memory kill, overload or billing exhaustion, a provider
   163	  timeout, a transport/tool error, or empty output — that is infrastructure
   164	  noise, not a REVISE/FAIL verdict from the model. Retry that exact dispatch once, automatically, before treating it as
   165	  needing human attention. A second consecutive infra failure on the same
   166	  dispatch, or any model-authored verdict, surfaces to the human as normal —
   167	  never silently retried away.
   168
===PR
     1	# Phase reference: PR review
     2
     3	> Detailed public contract for the PR phase. This reference is also the **single
     4	> owner** of the shared panel run-shape (resolve → dispatch → consolidate →
     5	> adjudicate → stop) used by the Plan and Spec design panels, which link here
     6	> rather than restating it. `SKILL.md` owns the kernel and phase sequence. Paths
     7	> are skill-relative. Every configuration-dependent branch is an explicit **under
     8	> your configuration** callout routed to the effective shape (current
     9	> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when absent/stale).
    10
    11	## 1. Purpose and invocation modes
    12
    13	PR review runs the panel against the finished branch and drives the diff to a
    14	clean opening. It runs two ways:
    15
    16	- **Full lifecycle:** the final phase, after Implement.
    17	- **Standalone entrypoint `sdlc:pr-review`** (`templates/sdlc-pr-review.md`):
    18	  needs no committed upstream (the diff is self-contained). Unadopted it applies a
    19	  small fixed panel default and offers an **optional, skippable grounding prompt**
    20	  for existing design material, disclosing grounded-vs-diff-only; adopted it runs
    21	  the committed `pr_review` gate at the committed mode/floors, never below them.
    22
    23	## 2. Entry conditions and authoritative upstream inputs
    24
    25	The authoritative input is the final committed branch diff. On the irreversible
    26	track the linked governing docs (plan, Specification, Build plan) ground the
    27	panel; on the reversible track the plan and Build plan ground it and a
    28	Specification must not be demanded.
    29
    30	## 3. Configured before-hook order and blocking semantics
    31
    32	Fire `hooks.pr.before` (and `hooks."*"`) first: `*` items first, then
    33	phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
    34	contract in `references/system-reference.md`, "Hooks".
    35
    36	## 4. Required activity and artifact/output shape — the PR body and cycle
    37
    38	Prepare the PR body from `.github/pull_request_template.md`: declare the track and
    39	slug, link governing documents per track — irreversible: plan, Specification,
    40	Build plan; reversible: plan and Build plan, never a Specification; none: a reason
    41	— and, for a tracker-backed Build, list the epic, every task sub-issue, and the
    42	shared board. Add `Closes #<task-issue>` for each task completed by merging the
    43	PR; use the explicit no-tracker exemption for a below-threshold (per
    44	`shape.publishToTracker`) or `track: none` change. The PR body describes the
    45	change for its audience; it does not carry the local panel's development findings.
    46	It **does** carry an **"Assumptions & discretionary calls"** section
    47	(provisioned by the PR template, empty-allowed): the assumptions accrued during
    48	Implement, copied from the build-plan doc's appendix
    49	(`references/phase-implement.md`). That section is **input to** the PR panel —
    50	named review material for the judgement pass — never a channel for panel
    51	findings; the no-development-findings rule above is unchanged.
    52
    53	Every PR declares its track in the template's `sdlc` declaration block
    54	(provisioned by setup). The `check-lifecycle` script verifies the declared track's
    55	artifacts are committed: run it locally before opening the PR; in CI it runs
    56	wherever the repository has configured the shipped workflow or the documented
    57	snippet. The declaration values are `irreversible`, `reversible`, or `none`;
    58	lifecycle tracks require a slug, and `none` requires a reason. Auto-generated
    59	`[bot]` PRs without a valid declaration are exempt; a valid present declaration
    60	always dominates. Before opening the PR, run the local lifecycle checker from the
    61	installed skill path:
    62
    63	```bash
    64	node <skill-dir>/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .
    65	```
    66
    67	`track: none` is an exemption declaration, not a third lifecycle track; it
    68	requires a reason and its honesty remains PR-panel prose law. CI enforcement is
    69	conditional on the repository configuring the shipped workflow or snippet.
    70
    71	## 5. Invariant gate/approval seam — the panel run-shape
    72
    73	Each design panel (Plan, Spec) and the PR panel run the **same shape**. The four
    74	phase reviewer prompts are the single sources of truth in `prompts/`; never
    75	hand-copy a prompt per model.
    76
    77	1. **Resolve the panel** for the phase (live, deduped, author-excluded):
    78
    79	   ```bash
    80	   scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <provider/model>
    81	   ```
    82
    83	   It reads the merged config's `panels` block, keeps models with credentials, and
    84	   applies the configured phase floor and author-exclusion rule under the config's
    85	   shortfall posture. Add `--pong` for a live smoke test (costs a call per
    86	   candidate; off by default). When `resolve-panel` prints a `proceed`-mode
    87	   shortfall advisory, carry it into that phase's consolidated writeup and, at PR
    88	   phase, into the PR itself as a comment or adjudication note. Do not commit a
    89	   standalone decision log for the shortfall.
    90
    91	   > **Under your configuration:** the per-phase floor is `review.panelSize` or a
    92	   > `panels.phases.<phase>.panelSize` override, and shortfall handling is
    93	   > `review.onShortfall` (`fail` = hard-fail below the floor; `proceed` =
    94	   > best-effort and surface it). Read the effective values from current
    95	   > `CONFIG.md` (or authoritative `sdlc.config.json`); never assume a floor.
    96
    97	2. **Dispatch** the phase template across the resolved models. Two paths:
    98	   - in-harness (default in a live pi session): stamp the phase's project prompt
    99	     into ONE model-agnostic, project-scoped agent, then dispatch it once per
   100	     resolved model via the `subagent` tool's per-task `model` override (one agent
   101	     reused across the panel, not one file per model):
   102
   103	     ```bash
   104	     scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
   105	     scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
   106	     ```
   107
   108	     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
   109	     its task value with the exact review task: name the artifact paths, commit,
   110	     governing documents, grounding rule, and required findings-only output. Dispatch
   111	     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
   112	     not as a blocking call: a blocking multi-model dispatch only returns control after
   113	     every reviewer finishes, so a reviewer that crashes in the first second still sits
   114	     unactioned until the slowest sibling completes minutes later. Async dispatch
   115	     returns immediately with one run id/`asyncDir` covering every child in the panel.
   116	     Per-model attribution comes back on each task's `result.model` once you read it.
   117	     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
   118	     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
   119	     `cd`-ed cwd). Consult the project's governing documents (for example
   120	     `AGENTS.md`) for any local sub-agent gotchas.
   121	   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
   122	     stamps one prompt file across `--model` flags.
   123
   124	   Give each reviewer the exact inputs: the artifact under review, the upstream
   125	   artifacts it must be consistent with, the repo path and commit, the PR body's
   126	   "Assumptions & discretionary calls" section as named review material, and the
   127	   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   128	   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   129	   from the linked documents before dispatch; never send literal placeholders. On
   130	   the reversible track, provide the plan and Build plan only and explicitly state
   131	   that a Specification must not be demanded.
   132
   133	   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   134	   your toolset. If it is missing in a live pi session, the fix is a session reload
   135	   (the plugin registers tools at session start), NOT a switch to the detached path
   136	   or a claim that you are outside pi. For a read-only research fan-out inside a
   137	   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   138	   returns the brief inline) so children never block on a forbidden write. Prefer
   139	`wait({ all: true })` over status-polling for read-only fan-out, and read a
   140	child's transcript before treating a "detached" status label as lost output.
   141
   142	   **React per-child, not per-batch.** Once dispatched async, poll
   143	   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
   144	   once every child in that run finishes) at a short interval; a `wait({ id:
   145	   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
   146	   timeout returns control without stopping the run. Diff each poll's per-child
   147	   status against the last one: the moment any child shows an infra failure (see
   148	   below) rather than a verdict, act on it immediately — do not wait for the other
   149	   panelists still running. A replacement dispatch for that model is a brand-new,
   150	   separate async `subagent` single-agent call, not folded back into the original
   151	   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   152	   still going. Keep polling until every original child and every replacement is
   153	   accounted for.
   154
   155	   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   156	   candidate pool, not merely documentation. A reviewer that returns a model
   157	   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   158	   never silently replaced. A reviewer that fails before producing a verdict —
   159	   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   160	   failure, or empty output — is an infra failure: retry that model once when the
   161	   failure may be transient, then replace it with the next untried, credentialed
   162	   model in that phase's configured `prefer` list. Do not count a failed model
   163	   against the configured panel floor. Continue through the ordered candidate
   164	   pool until the panel floor is met or the pool is exhausted. Only then apply
   165	   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   166	   shortfall and continues. Never substitute an unconfigured model or treat an
   167	   infra failure as a reviewer verdict.
   168
   169	   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   170	   panel, record `panel.dispatched` and preserve the panel's artifacts with
   171	   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   172	   then `panel.consolidated` after adjudication — see
   173	   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
   174
   175	3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   176	   as signal, preserve genuine disagreement.
   177	4. **Adjudicate**: for every high or medium finding, either incorporate it or
   178	   record a one-line reason for dismissal. Disclose the orchestrating model in the
   179	   consolidated file. Disputed high or medium findings are decided by the project's
   180	   human owner, who is the final adjudicator. Reviewer output is roughly eighty per
   181	   cent right and overreaches, so nothing is actioned blindly and nothing is
   182	   dismissed silently.
   183
   184	   Escalate disputes to the human per the shared contract
   185	   (`references/system-reference.md`, "Presenting questions to the human") with
   186	   the PR delta: escalations reach the human **once per fix wave, after
   187	   consolidation, never streamed as reviewers return**, and arrive
   188	   **pre-adjudicated** as ratify/amend decisions — each escalated finding
   189	   carries its id, a one-line gist, the reviewers who raised it (cross-model
   190	   agreement is signal), and the agent's recommended disposition with its
   191	   reason. Only **proposed dismissals of high or medium findings** — plus
   192	   anything touching a previously human-ratified residual-risk boundary —
   193	   escalate; incorporating a finding is agreement and needs no permission.
   194	   Overflow past the cap usually means incorporate the cheap ones rather than
   195	   argue them. A **human-ratified dismissal binds forward**: record it in
   196	   `consolidated.md` with its human-ratified attribution and do not re-litigate
   197	   the same finding class in later waves or later sessions unless new evidence
   198	   emerges.
   199	5. **Stop** when no high or medium finding survives adjudication. Low findings are
   200	   recorded, not blocking. Termination is measured against surviving findings, so a
   201	   ruthless panel that always emits nits still converges.
   202
   203	Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
   204	file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
   205	adjudication and the orchestrating model.
   206
   207	> **Under your configuration:** whether a Plan panel and a Spec panel run at all
   208	> depends on the effective track and `review.design`; the PR panel runs on both
   209	> tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
   210	> strength. Read them; never assume `panel`.
   211
   212	Run the local PR panel against the final committed branch, consolidate and
   213	adjudicate its findings in the durable internal review artifact under
   214	`docs/reviews/`, and repeat after each fix wave until no high or medium survives.
   215	This is the pre-PR sense check that the branch is a finished artefact; retain the
   216	artifact for future analysis, but do not add development findings to the PR body
   217	or post them as GitHub review comments.
   218
   219	## 6. Refusal and backward-transition behaviour
   220
   221	Merging with a high or medium finding that survived adjudication is forbidden.
   222	Backward transition to any earlier phase is always allowed when the panel exposes
   223	a design flaw. Only after the panel is clean, open the PR with the clean body.
   224
   225	## 7. After-hook order and warning semantics
   226
   227	Fire `hooks.pr.after` (and `hooks."*"`) after the PR opens: phase-specific first,
   228	then `*`. A failed `after` hook **warns** (recorded, never blocking).
   229
   230	## 8. Completion evidence and next transition
   231
   232	Completion evidence is a clean panel (no surviving high/medium), a passing
   233	`check-lifecycle`, and the opened PR with its clean body. **Completion is
   234	machine-checked, not narrated.** After the PR exists, do not state that the
   235	Implement/PR phase is "complete" or "PASS" without first running:
   236
   237	```bash
   238	node <skill-dir>/scripts/check-completion.mjs --claim pr-open --slug <slug> --closes <n> [--closes <n> ...]
   239	```
   240
   241	This checks the pushed branch, open PR, matching valid declaration, and GitHub's
   242	native closing-issue references. After merge, do not state that the tracked
   243	effort is finished without running:
   244
   245	```bash
   246	node <skill-dir>/scripts/check-completion.mjs --claim epic-done --epic <epic-number> --pr <pr-number>
   247	```
   248
   249	This checks every native epic sub-issue is closed and that the named merged PR
   250	closes all of them. Either check failing means the claim is false; state what's
   251	missing instead of declaring done. If a GitHub reviewer
   252	raises a new concern after opening, focus it with an inline comment, address it
   253	with a commit, reply with that commit's short SHA, and rerun the panel and the
   254	`pr-open` check before updating the PR. The post-PR review is for new reviewer
   255	concerns, not a transcript of the local sense check. The lifecycle completes on
   256	merge.
   257
   258	## 9. Advanced-mode pointers
   259
   260	Gate artefacts may be rendered to a self-contained interactive HTML view with the
   261	global `sdlc-visual-docs` skill — a pointer, not a dependency (see
   262	`references/system-reference.md`, "Advanced modes").
    75	   ```
    76
    77	   It reads the merged config's `panels` block, keeps models with credentials, and
    78	   applies the configured phase floor and author-exclusion rule under the config's
    79	   shortfall posture. Add `--pong` for a live smoke test (costs a call per
    80	   candidate; off by default). When `resolve-panel` prints a `proceed`-mode
    81	   shortfall advisory, carry it into that phase's consolidated writeup and, at PR
    82	   phase, into the PR itself as a comment or adjudication note. Do not commit a
    83	   standalone decision log for the shortfall.
    84
    85	   > **Under your configuration:** the per-phase floor is `review.panelSize` or a
    86	   > `panels.phases.<phase>.panelSize` override, and shortfall handling is
    87	   > `review.onShortfall` (`fail` = hard-fail below the floor; `proceed` =
    88	   > best-effort and surface it). Read the effective values from current
    89	   > `CONFIG.md` (or authoritative `sdlc.config.json`); never assume a floor.
    90
    91	2. **Dispatch** the phase template across the resolved models. Two paths:
    92	   - in-harness (default in a live pi session): stamp the phase's project prompt
    93	     into ONE model-agnostic, project-scoped agent, then dispatch it once per
    94	     resolved model via the `subagent` tool's per-task `model` override (one agent
    95	     reused across the panel, not one file per model):
    96
    97	     ```bash
    98	     scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
    99	     scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
   100	     ```
   101
   102	     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
   103	     its task value with the exact review task: name the artifact paths, commit,
   104	     governing documents, grounding rule, and required findings-only output; then
   105	     dispatch the populated array in one call. Per-model attribution comes back on
   106	     each task's `result.model`. `ensure-panel-agent.sh` copies the prompt body
   107	     verbatim and writes to the consumer repo's `.pi/agents` where the session
   108	     resolves project agents (NOT a `cd`-ed cwd). Consult the project's governing
   109	     documents (for example `AGENTS.md`) for any local sub-agent gotchas.
   110	   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
   111	     stamps one prompt file across `--model` flags.
   112
   113	   Give each reviewer the exact inputs: the artifact under review, the upstream
   114	   artifacts it must be consistent with, the repo path and commit, and the
   115	   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   116	   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   117	   from the linked documents before dispatch; never send literal placeholders. On
   118	   the reversible track, provide the plan and Build plan only and explicitly state
   119	   that a Specification must not be demanded.
   120
   121	   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   122	   your toolset. If it is missing in a live pi session, the fix is a session reload
   123	   (the plugin registers tools at session start), NOT a switch to the detached path
   124	   or a claim that you are outside pi. For a read-only research fan-out inside a
   125	   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   126	   returns the brief inline) so children never block on a forbidden write. Prefer
   127	`wait({ all: true })` over status-polling for read-only fan-out, and read a
   128	child's transcript before treating a "detached" status label as lost output.
   129
   130	   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   131	   candidate pool, not merely documentation. A reviewer that returns a model
   132	   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   133	   never silently replaced. A reviewer that fails before producing a verdict —
   134	   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   135	   failure, or empty output — is an infra failure: retry that model once when the
   136	   failure may be transient, then replace it with the next untried, credentialed
   137	   model in that phase's configured `prefer` list. Do not count a failed model
   138	   against the configured panel floor. Continue through the ordered candidate
   139	   pool until the panel floor is met or the pool is exhausted. Only then apply
   140	   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   141	   shortfall and continues. Never substitute an unconfigured model or treat an
   142	   infra failure as a reviewer verdict.
   143
   144	   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   145	   panel, record `panel.dispatched` and preserve the panel's artifacts with
   146	   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   147	   then `panel.consolidated` after adjudication — see
   148	   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
   149
   150	3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   151	   as signal, preserve genuine disagreement.
   152	4. **Adjudicate**: for every high or medium finding, either incorporate it or
   153	   record a one-line reason for dismissal. Disclose the orchestrating model in the
   154	   consolidated file. Disputed high or medium findings are decided by the project's
   155	   human owner, who is the final adjudicator. Reviewer output is roughly eighty per
   156	   cent right and overreaches, so nothing is actioned blindly and nothing is
   157	   dismissed silently.
   158	5. **Stop** when no high or medium finding survives adjudication. Low findings are
   159	   recorded, not blocking. Termination is measured against surviving findings, so a
   160	   ruthless panel that always emits nits still converges.
   161
   162	Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
   163	file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
   164	adjudication and the orchestrating model.
   165
   166	> **Under your configuration:** whether a Plan panel and a Spec panel run at all
   167	> depends on the effective track and `review.design`; the PR panel runs on both
   168	> tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
   169	> strength. Read them; never assume `panel`.
   170
   171	Run the local PR panel against the final committed branch, consolidate and
   172	adjudicate its findings in the durable internal review artifact under
   173	`docs/reviews/`, and repeat after each fix wave until no high or medium survives.
   174	This is the pre-PR sense check that the branch is a finished artefact; retain the
   175	artifact for future analysis, but do not add development findings to the PR body
   176	or post them as GitHub review comments.
   177
   178	## 6. Refusal and backward-transition behaviour
   179
   180	Merging with a high or medium finding that survived adjudication is forbidden.
   181	Backward transition to any earlier phase is always allowed when the panel exposes
   182	a design flaw. Only after the panel is clean, open the PR with the clean body.
   183
   184	## 7. After-hook order and warning semantics
   185
===PACKAGE
{
  "scripts": {
    "test": "node --test test/*.test.js",
    "test:e2e": "node test/e2e/run.mjs",
    "lint": "biome check .",
    "format": "biome check --write ."
  }
}
read: skills/sdlc/scripts/harvest-panel.mjs
grep: test
grep: skills
bash: git show 32ebaa1 --stat --oneline && git show 32ebaa1 -- ...
#!/usr/bin/env node
// harvest-panel.mjs — FS13 §5 harvest CLI: preserves pi-subagents lifecycle
// artifacts (status.json, events.jsonl, and optionally transcripts/) from a
// panel dispatch's async run directory into the consumer's run store, before
// they evaporate.
//
// Usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S]
//                          [--with-transcripts] [--format text|json]
//                          [--config DIR | --repo-root DIR]
//
// Contract (spec §5): --from names a directory carrying status.json and
// events.jsonl at its top level (the shape of a pi-subagents asyncDir).
// Harvest copies both into panels/<panelPhase>-round<N>-<date>/;
// --with-transcripts additionally copies a top-level transcripts/
// subdirectory (when present) into transcripts/ at the destination. A
// missing/aborted source directory or file is a report, not a throw: exit 0,
// missed[] populated, and the panel.harvested event records the gap. Exit 2
// only for usage errors or an unwritable destination.
import { cpSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { inspectRoot } from "./lib.mjs";
import { emitEvent, PANEL_PHASES, resolveRunSlug, runStoreDir } from "./telemetry.mjs";
function bail(msg) {
	process.stderr.write(`harvest-panel: ${msg}\n`);
	process.exit(2);
}
function parseArgs(argv) {
	const opts = { format: "text", withTranscripts: false };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const val = (name) => {
			const v = argv[++i];
			if (v === undefined || v.startsWith("-")) bail(`${name} requires a value`);
			return v;
		};
		if (a === "--phase") opts.phase = val("--phase");
		else if (a === "--round") opts.round = val("--round");
		else if (a === "--from") opts.from = val("--from");
		else if (a === "--slug") opts.slug = val("--slug");
		else if (a === "--with-transcripts") opts.withTranscripts = true;
		else if (a === "--format") {
			const f = val("--format");
			if (f !== "text" && f !== "json") bail("--format must be text or json");
			opts.format = f;
		} else if (a === "--config") opts.config = val("--config");
		else if (a === "--repo-root") opts.repoRoot = val("--repo-root");
		else if (a === "-h" || a === "--help") opts.help = true;
		else bail(`unexpected argument: ${a}`);
	}
	return opts;
}
function usage() {
	return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
}
// Copy one file if present; return "copied" | "missed".
function harvestFile(srcDir, name, destDir) {
	const src = join(srcDir, name);
	if (!existsSync(src) || !statSync(src).isFile()) return "missed";
	cpSync(src, join(destDir, name));
	return "copied";
}
function harvestTranscripts(srcDir, destDir) {
	const src = join(srcDir, "transcripts");
	if (!existsSync(src) || !statSync(src).isDirectory()) return "missed";
	cpSync(src, join(destDir, "transcripts"), { recursive: true });
	return "copied";
}
function main() {
	const opts = parseArgs(process.argv.slice(2));
	if (opts.help) {
		console.log(usage());
		process.exit(0);
	}
	if (!opts.phase) bail(usage());
	if (!PANEL_PHASES.includes(opts.phase)) bail(`unknown panel phase '${opts.phase}'. Known: ${PANEL_PHASES.join(", ")}`);
	if (!opts.round) bail(usage());
	const round = Number(opts.round);
	if (!Number.isInteger(round) || round <= 0) bail("--round must be a positive integer");
	if (!opts.from) bail(usage());
	const rootResult = inspectRoot({ config: opts.config, repoRoot: opts.repoRoot });
	if (!rootResult.ok) bail(`sdlc: ${rootResult.message}`);
	const root = rootResult.root;
	// Run identity is required to know where to harvest TO; unlike record-run-event
	// this is not a soft skip — an unresolvable identity leaves no destination.
	const resolved = resolveRunSlug({ slug: opts.slug, cwd: root });
	if (resolved.skip) bail(`sdlc-telemetry: ${resolved.skip}`);
	const slug = resolved.slug;
	const date = new Date().toISOString().slice(0, 10);
	const destDir = join(runStoreDir(root, slug), "panels", `${opts.phase}-round${round}-${date}`);
	try {
		mkdirSync(destDir, { recursive: true });
	} catch (err) {
		bail(`cannot create destination directory: ${err?.message || err}`);
	}
	const files = [];
	const missed = [];
	for (const name of ["status.json", "events.jsonl"]) {
		const status = harvestFile(opts.from, name, destDir);
		files.push({ name, status });
		if (status === "missed") missed.push(name);
	}
	if (opts.withTranscripts) {
		const status = harvestTranscripts(opts.from, destDir);
		files.push({ name: "transcripts", status });
		if (status === "missed") missed.push("transcripts");
	}
	const relDir = relative(root, destDir);
	const report = { ok: true, phase: opts.phase, round, dir: relDir, files, missed };
	if (opts.format === "json") {
		console.log(JSON.stringify(report, null, 2));
	} else {
		console.log(`harvested ${opts.phase} round ${round} -> ${relDir}`);
		for (const f of files) console.log(`  ${f.name}: ${f.status}`);
		if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
	}
	emitEvent({
		event: "panel.harvested",
		slug,
		by: "script:harvest-panel",
		payload: { panelPhase: opts.phase, round, dir: relDir, missed },
		root,
	});
	process.exit(0);
}
if (import.meta.url === `file://${process.argv[1]}`) main();
telemetry-docs.test.js-30-
telemetry-docs.test.js-31- // ---------------------------------------------------------------------------
telemetry-docs.test.js-32- // LT24 — each mandated sdlc SKILL.md hook step contains record-run-event.sh
telemetry-docs.test.js-33- // and its event-type token; the panel-dispatch step (and the validator-
telemetry-docs.test.js:34: // dispatch step) additionally contains the skill-relative harvest-panel.sh
telemetry-docs.test.js-35- // token; sdlc-retro SKILL.md names collect/render invocations
telemetry-docs.test.js-36- // skill-relatively (FS12 forms).
telemetry-docs.test.js-37- // ---------------------------------------------------------------------------
telemetry-docs.test.js-38- const MANDATED_EVENTS = ["run.started", "phase.entered", "gate.approved", "panel.dispatched", "panel.consolidated", "lifecycle.checked", "pr.opened", "pr.fix_wave"];
telemetry-docs.test.js-45- 		assert.ok(window.includes("record-run-event.sh"), `event '${event}' must be co-located with a record-run-event.sh mention`);
telemetry-docs.test.js-46- 	}
telemetry-docs.test.js-47- });
telemetry-docs.test.js-48-
telemetry-docs.test.js:49: test("LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh", () => {
telemetry-docs.test.js-50- 	const dispatchIdx = telemetryDoc.indexOf("panel.dispatched");
telemetry-docs.test.js-51- 	assert.ok(dispatchIdx >= 0);
telemetry-docs.test.js-52- 	const dispatchWindow = telemetryDoc.slice(dispatchIdx, dispatchIdx + 600);
telemetry-docs.test.js-53- 	assert.ok(dispatchWindow.includes("harvest-panel.sh"), "panel-dispatch step must name harvest-panel.sh");
telemetry-docs.test.js-49- test("LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh", () => {
telemetry-docs.test.js-50- 	const dispatchIdx = telemetryDoc.indexOf("panel.dispatched");
telemetry-docs.test.js-51- 	assert.ok(dispatchIdx >= 0);
telemetry-docs.test.js-52- 	const dispatchWindow = telemetryDoc.slice(dispatchIdx, dispatchIdx + 600);
telemetry-docs.test.js:53: 	assert.ok(dispatchWindow.includes("harvest-panel.sh"), "panel-dispatch step must name harvest-panel.sh");
telemetry-docs.test.js-54-
telemetry-docs.test.js-55- 	const telemetrySectionIdx = telemetryDoc.indexOf("Lifecycle telemetry (FS13)");
telemetry-docs.test.js-56- 	assert.ok(telemetrySectionIdx >= 0);
telemetry-docs.test.js-57- 	const telemetrySection = telemetryDoc.slice(telemetrySectionIdx);
telemetry-docs.test.js-54-
telemetry-docs.test.js-55- 	const telemetrySectionIdx = telemetryDoc.indexOf("Lifecycle telemetry (FS13)");
telemetry-docs.test.js-56- 	assert.ok(telemetrySectionIdx >= 0);
telemetry-docs.test.js-57- 	const telemetrySection = telemetryDoc.slice(telemetrySectionIdx);
telemetry-docs.test.js:58: 	assert.ok(/validator dispatch also harvests[\s\S]*harvest-panel\.sh/.test(telemetrySection), "the validator-dispatch step must name harvest-panel.sh");
telemetry-docs.test.js-59- });
telemetry-docs.test.js-60-
telemetry-docs.test.js-61- test("LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms)", () => {
telemetry-docs.test.js-62- 	assert.ok(retroSkillMd.includes("scripts/collect-run.sh --slug"), "skill-relative collect invocation");
telemetry-docs.test.js-78- 	} catch (error) {
telemetry-docs.test.js-79- 		assert.fail(`check-references report is not valid JSON: ${error.message}\n${r.stdout}`);
telemetry-docs.test.js-80- 	}
telemetry-docs.test.js-81- 	assert.equal(report.state, "pass");
telemetry-docs.test.js:82: 	const newIds = ["script.record-run-event", "script.harvest-panel", "retro.script.collect-run", "retro.script.render-retro", "retro.schema.event", "retro.schema.run", "retro.schema.llm-protocol", "retro.skill.source", "telemetry.adr-0028", "sdlc.skill.telemetry-section"];
telemetry-docs.test.js-83- 	for (const id of newIds) {
telemetry-docs.test.js-84- 		const check = report.checks.find((c) => c.id === id);
telemetry-docs.test.js-85- 		assert.ok(check, `check ${id} must be present`);
telemetry-docs.test.js-86- 		assert.equal(check.status, "pass", `${id}: ${check.message}`);
telemetry-docs.test.js-135- });
telemetry-docs.test.js-136-
telemetry-docs.test.js-137- test("structural coverage: every hook script named by §4 has an FS11 inventory entry", () => {
telemetry-docs.test.js-138- 	const inv = inventory();
telemetry-docs.test.js:139: 	for (const rel of ["skills/sdlc/scripts/record-run-event.mjs", "skills/sdlc/scripts/record-run-event.sh", "skills/sdlc/scripts/harvest-panel.mjs", "skills/sdlc/scripts/harvest-panel.sh"]) {
telemetry-docs.test.js-140- 		assert.ok(hasEntryFor(inv, rel), `missing FS11 entry for ${rel}`);
telemetry-docs.test.js-141- 	}
telemetry-docs.test.js-142- });
telemetry-docs.test.js-143-
telemetry-harvest.test.js:1: // FS13 harvest-panel tests (lt-t3): copying pi-subagents lifecycle artifacts
telemetry-harvest.test.js-2- // from an async run directory into the run store, with honest missed[]
telemetry-harvest.test.js-3- // coverage on partial/missing sources. Scenarios LT11-LT12. Offline (NF1).
telemetry-harvest.test.js-4-
telemetry-harvest.test.js-5- import assert from "node:assert/strict";
telemetry-harvest.test.js-11- import { test } from "node:test";
telemetry-harvest.test.js-12-
telemetry-harvest.test.js-13- const here = dirname(fileURLToPath(import.meta.url));
telemetry-harvest.test.js-14- const repoRoot = dirname(here);
telemetry-harvest.test.js:15: const harvestPanel = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.mjs");
telemetry-harvest.test.js-16- const harvestPanelSh = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.sh");
telemetry-harvest.test.js-17-
telemetry-harvest.test.js-18- function tmp(prefix = "sdlc-lt3-") {
telemetry-harvest.test.js-19- 	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
telemetry-harvest.test.js-12-
telemetry-harvest.test.js-13- const here = dirname(fileURLToPath(import.meta.url));
telemetry-harvest.test.js-14- const repoRoot = dirname(here);
telemetry-harvest.test.js-15- const harvestPanel = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.mjs");
telemetry-harvest.test.js:16: const harvestPanelSh = join(repoRoot, "skills", "sdlc", "scripts", "harvest-panel.sh");
telemetry-harvest.test.js-17-
telemetry-harvest.test.js-18- function tmp(prefix = "sdlc-lt3-") {
telemetry-harvest.test.js-19- 	return realpathSync(mkdtempSync(join(tmpdir(), prefix)));
telemetry-harvest.test.js-20- }
telemetry-harvest.test.js-74-
telemetry-harvest.test.js-75- 		const events = readEvents(root, "lt11-run");
telemetry-harvest.test.js-76- 		assert.equal(events.length, 1);
telemetry-harvest.test.js-77- 		assert.equal(events[0].event, "panel.harvested");
telemetry-harvest.test.js:78: 		assert.equal(events[0].by, "script:harvest-panel");
telemetry-harvest.test.js-79- 		assert.equal(events[0].payload.panelPhase, "pr_review");
telemetry-harvest.test.js-80- 		assert.equal(events[0].payload.round, 1);
telemetry-harvest.test.js-81- 		assert.deepEqual(events[0].payload.missed, []);
telemetry-harvest.test.js-82- 		assert.ok(events[0].payload.dir.includes("panels"));
telemetry-harvest.test.js-140-
telemetry-harvest.test.js-141- // ---------------------------------------------------------------------------
telemetry-harvest.test.js-142- // Usage-error and CLI sanity.
telemetry-harvest.test.js-143- // ---------------------------------------------------------------------------
telemetry-harvest.test.js:144: test("harvest-panel: unknown phase and non-positive round exit 2", () => {
telemetry-harvest.test.js-145- 	const root = tmp("sdlc-lt3-root-");
telemetry-harvest.test.js-146- 	const src = mkAsyncDir();
telemetry-harvest.test.js-147- 	try {
telemetry-harvest.test.js-148- 		const badPhase = run(["--phase", "bogus", "--round", "1", "--from", src, "--repo-root", root]);
telemetry-harvest.test.js-156- 		rmSync(src, { recursive: true, force: true });
telemetry-harvest.test.js-157- 	}
telemetry-harvest.test.js-158- });
telemetry-harvest.test.js-159-
telemetry-harvest.test.js:160: test("harvest-panel.sh wrapper delegates to .mjs identically", () => {
telemetry-harvest.test.js-161- 	const root = tmp("sdlc-lt3-root-");
telemetry-harvest.test.js-162- 	const src = mkAsyncDir();
telemetry-harvest.test.js-163- 	try {
telemetry-harvest.test.js-164- 		const r = spawnSync("bash", [harvestPanelSh, "--phase", "pr_review", "--round", "1", "--from", src, "--repo-root", root, "--slug", "lt-sh"], { encoding: "utf8" });
sdlc-retro/SKILL.md-20- ```
sdlc-retro/SKILL.md-21- .pi/sdlc/runs/<slug>/
sdlc-retro/SKILL.md-22-   events.jsonl                          # the manifest: one FS13 event per line
sdlc-retro/SKILL.md:23:   panels/<panelPhase>-round<N>-<date>/  # harvested pi-subagents artifacts
sdlc-retro/SKILL.md-24-     status.json
sdlc-retro/SKILL.md-25-     events.jsonl
sdlc-retro/SKILL.md-26-     [transcripts/...]
sdlc-retro/SKILL.md-52- docs/retros/<slug>/run.json`).
sdlc-retro/SKILL.md-53-
sdlc-retro/SKILL.md-54- `collect-run` joins the manifest, harvested panel artifacts, correlated pi
sdlc-retro/SKILL.md:55: session transcripts (top-level session files only; nested per-child subagent
sdlc-retro/SKILL.md-56- sessions are excluded — panel effort is counted solely from harvested
sdlc-retro/SKILL.md-57- artifacts), discovered review directories, and injectable `--git-cmd`/
sdlc-retro/SKILL.md-58- `--gh-cmd`/`--llm-cmd` seams into a schema-valid `run.json`. Pass `--no-llm`
sdlc/SKILL.md-84- The table above states the **maximal** shape. Which gates actually run, and at
sdlc/SKILL.md-85- what strength, is the repo's committed config: `review.design`
sdlc/SKILL.md-86- (`panel` | `advisory` | `human` | `off`) gates plan+spec, `review.code` gates the
sdlc/SKILL.md:87: PR, `review.tasks` (`subagent` | `self` | `off`) sets per-task validation,
sdlc/SKILL.md-88- `review.brainstorm` (`human` | `off`) sets the brainstorm gate; per-track
sdlc/SKILL.md-89- `overrides` (`irreversible`/`reversible`) adjust `design`/`code`/`tasks`/
sdlc/SKILL.md-90- `panelSize`. `shape.separateSpec: false` merges Plan and Spec into one gated
sdlc/SKILL.md-173-
sdlc/SKILL.md-174- - `adversarial-review` (global): generic reviewer template mechanics; sdlc keeps
sdlc/SKILL.md-175-   its own phase-specific prompts, so use `scripts/ensure-panel-agent.sh`.
sdlc/SKILL.md:176: - `dispatch-subagents` (global): detached fan-out, model discovery, the
sdlc/SKILL.md-177-   0-byte-log rule, monitoring.
sdlc/SKILL.md-178- - `gh-pr-review-comments` (global): atomic inline posting and thread replies.
sdlc/SKILL.md-179- - `assets/tracker-ops.md` (project-local): GitHub sub-issue/blocking mutations and
sdlc/references/phase-implement.md-68-
sdlc/references/phase-implement.md-69- The invariant seam is per-task validation selected by `review.tasks`:
sdlc/references/phase-implement.md-70-
sdlc/references/phase-implement.md:71: - `subagent` (default): each task ends with one **validator subagent**, a
sdlc/references/phase-implement.md-72-   checklist executor, not a judge.
sdlc/references/phase-implement.md-73- - `self`: the implementer runs the same declared checks directly (no subagent
sdlc/references/phase-implement.md-74-   dispatch; `resolve-panel task_validate` refuses).
sdlc/references/phase-implement.md-70-
sdlc/references/phase-implement.md-71- - `subagent` (default): each task ends with one **validator subagent**, a
sdlc/references/phase-implement.md-72-   checklist executor, not a judge.
sdlc/references/phase-implement.md:73: - `self`: the implementer runs the same declared checks directly (no subagent
sdlc/references/phase-implement.md-74-   dispatch; `resolve-panel task_validate` refuses).
sdlc/references/phase-implement.md-75- - `off`: per-task validation is skipped entirely — no manifest, runner, receipt,
sdlc/references/phase-implement.md-76-   or PASS gate is required.
sdlc/references/phase-implement.md-77-
sdlc/references/phase-implement.md-78- > **Under your configuration:** read the effective `review.tasks` value from
sdlc/references/phase-implement.md-79- > current `CONFIG.md` (or authoritative `sdlc.config.json`); never assume
sdlc/references/phase-implement.md:80: > `subagent`. Per-track `overrides` may adjust it.
sdlc/references/phase-implement.md-81-
sdlc/references/phase-implement.md-82- Validation is **portable and deterministic**: the task's checks are whatever its
sdlc/references/phase-implement.md-83- approved Build task declared, never a language or tool the skill imposes. There
sdlc/references/phase-implement.md-85- TypeScript task declares `tsc`, a JavaScript task declares `node --check` and its
sdlc/references/phase-implement.md-86- linter, another repo declares its own tools.
sdlc/references/phase-implement.md-87-
sdlc/references/phase-implement.md:88: Under `subagent` or `self`, every task carries a committed **PV1 validation manifest**
sdlc/references/phase-implement.md-89- (`<repository validation home>/<feature>/<task-id>.json`, schema
sdlc/references/phase-implement.md-90- `schema/task-validation-manifest.schema.json`) projected from its canonical Build
sdlc/references/phase-implement.md-91- task. It names, as exact argv arrays, the task's checks across five categories —
sdlc/references/phase-implement.md-99- evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or `ERROR` (exit 2).
sdlc/references/phase-implement.md-100- Build, not the validator, owns which commands run and which categories are `n/a`;
sdlc/references/phase-implement.md-101- the validator cannot invent a command, weaken a check, or decide applicability.
sdlc/references/phase-implement.md:102: Under `subagent`, the validator subagent (`prompts/validator-task.prompt.md`) runs
sdlc/references/phase-implement.md-103- the runner, confirms exit and report verdict agree, and reports each result; under
sdlc/references/phase-implement.md-104- `self` the implementer runs the runner directly. A nonzero runner result blocks
sdlc/references/phase-implement.md-105- task completion; a task is not done until the runner returns PASS. Each task stores
sdlc/references/phase-implement.md-104- `self` the implementer runs the runner directly. A nonzero runner result blocks
sdlc/references/phase-implement.md-105- task completion; a task is not done until the runner returns PASS. Each task stores
sdlc/references/phase-implement.md-106- a runtime receipt (manifest copy, runner report, hashes, verdicts, plus the
sdlc/references/phase-implement.md:107: generated-agent copy and model under `subagent`) under
sdlc/references/phase-implement.md-108- `docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verifiable with
sdlc/references/phase-implement.md-109- `scripts/verify-task-receipt.mjs`. Judgement review happens later at the PR panel.
sdlc/references/phase-implement.md-110-
sdlc/references/phase-implement.md-128-
sdlc/references/phase-implement.md-129- ## 8. Completion evidence and next transition
sdlc/references/phase-implement.md-130-
sdlc/references/phase-implement.md:131: Completion evidence is passing tests, per-task PASS receipts (under `subagent`/
sdlc/references/phase-implement.md-132- `self`), and closed sub-issues (tracker-backed). Next transition is **PR review**
sdlc/references/phase-implement.md-133- (`references/phase-pr-review.md`).
sdlc/references/phase-implement.md-134-
sdlc/references/phase-implement.md-138-
sdlc/references/phase-implement.md-139- ## 10. Dispatching implementation workers
sdlc/references/phase-implement.md-140-
sdlc/references/phase-implement.md:141: When Implement delegates a task to a subagent rather than building in the
sdlc/references/phase-implement.md-142- surface directly, give it the same shape every time:
sdlc/references/phase-implement.md-143-
sdlc/references/phase-implement.md-144- - **Scope, stated as a stop-condition.** Name exactly the task's check
sdlc/references/phase-implement.md-145-   commands and Definition-of-Done items as the boundary of its work, and say
sdlc/references/phase-implement.md-146-   plainly not to explore or fix adjacent things past that boundary.
sdlc/references/phase-implement.md-147- - **A `toolBudget`/`turnBudget` by default.** Attach a bounded budget (the
sdlc/references/phase-implement.md:148:   `subagent` tool's own `toolBudget: { soft, hard }` / `turnBudget: {
sdlc/references/phase-implement.md-149-   maxTurns, graceTurns }` parameters) so a worker drifting past scope is
sdlc/references/phase-implement.md-150-   nudged, then finalized, without a human having to notice and intervene.
sdlc/references/phase-implement.md-151- - **A canonical "finalize now" resume message** for a worker caught
sdlc/references/phase-pr-review.md-97- 2. **Dispatch** the phase template across the resolved models. Two paths:
sdlc/references/phase-pr-review.md-98-    - in-harness (default in a live pi session): stamp the phase's project prompt
sdlc/references/phase-pr-review.md-99-      into ONE model-agnostic, project-scoped agent, then dispatch it once per
sdlc/references/phase-pr-review.md:100:      resolved model via the `subagent` tool's per-task `model` override (one agent
sdlc/references/phase-pr-review.md-101-      reused across the panel, not one file per model):
sdlc/references/phase-pr-review.md-102-
sdlc/references/phase-pr-review.md-103-      ```bash
sdlc/references/phase-pr-review.md-105-      scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
sdlc/references/phase-pr-review.md-106-      ```
sdlc/references/phase-pr-review.md-107-
sdlc/references/phase-pr-review.md:108:      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
sdlc/references/phase-pr-review.md-109-      its task value with the exact review task: name the artifact paths, commit,
sdlc/references/phase-pr-review.md-110-      governing documents, grounding rule, and required findings-only output. Dispatch
sdlc/references/phase-pr-review.md-111-      the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
sdlc/references/phase-pr-review.md-108-      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
sdlc/references/phase-pr-review.md-109-      its task value with the exact review task: name the artifact paths, commit,
sdlc/references/phase-pr-review.md-110-      governing documents, grounding rule, and required findings-only output. Dispatch
sdlc/references/phase-pr-review.md:111:      the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
sdlc/references/phase-pr-review.md-112-      not as a blocking call: a blocking multi-model dispatch only returns control after
sdlc/references/phase-pr-review.md-113-      every reviewer finishes, so a reviewer that crashes in the first second still sits
sdlc/references/phase-pr-review.md-114-      unactioned until the slowest sibling completes minutes later. Async dispatch
sdlc/references/phase-pr-review.md-112-      not as a blocking call: a blocking multi-model dispatch only returns control after
sdlc/references/phase-pr-review.md-113-      every reviewer finishes, so a reviewer that crashes in the first second still sits
sdlc/references/phase-pr-review.md-114-      unactioned until the slowest sibling completes minutes later. Async dispatch
sdlc/references/phase-pr-review.md:115:      returns immediately with one run id/`asyncDir` covering every child in the panel.
sdlc/references/phase-pr-review.md-116-      Per-model attribution comes back on each task's `result.model` once you read it.
sdlc/references/phase-pr-review.md-117-      `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
sdlc/references/phase-pr-review.md-118-      consumer repo's `.pi/agents` where the session resolves project agents (NOT a
sdlc/references/phase-pr-review.md-118-      consumer repo's `.pi/agents` where the session resolves project agents (NOT a
sdlc/references/phase-pr-review.md-119-      `cd`-ed cwd). Consult the project's governing documents (for example
sdlc/references/phase-pr-review.md-120-      `AGENTS.md`) for any local sub-agent gotchas.
sdlc/references/phase-pr-review.md:121:    - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
sdlc/references/phase-pr-review.md-122-      stamps one prompt file across `--model` flags.
sdlc/references/phase-pr-review.md-123-
sdlc/references/phase-pr-review.md-124-    Give each reviewer the exact inputs: the artifact under review, the upstream
sdlc/references/phase-pr-review.md-130-    the reversible track, provide the plan and Build plan only and explicitly state
sdlc/references/phase-pr-review.md-131-    that a Specification must not be demanded.
sdlc/references/phase-pr-review.md-132-
sdlc/references/phase-pr-review.md:133:    **Before you fan out** (either path): confirm the `subagent` tool is actually in
sdlc/references/phase-pr-review.md-134-    your toolset. If it is missing in a live pi session, the fix is a session reload
sdlc/references/phase-pr-review.md-135-    (the plugin registers tools at session start), NOT a switch to the detached path
sdlc/references/phase-pr-review.md-136-    or a claim that you are outside pi. For a read-only research fan-out inside a
sdlc/references/phase-pr-review.md-140- child's transcript before treating a "detached" status label as lost output.
sdlc/references/phase-pr-review.md-141-
sdlc/references/phase-pr-review.md-142-    **React per-child, not per-batch.** Once dispatched async, poll
sdlc/references/phase-pr-review.md:143:    `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
sdlc/references/phase-pr-review.md-144-    once every child in that run finishes) at a short interval; a `wait({ id:
sdlc/references/phase-pr-review.md-145-    <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
sdlc/references/phase-pr-review.md-146-    timeout returns control without stopping the run. Diff each poll's per-child
sdlc/references/phase-pr-review.md-147-    status against the last one: the moment any child shows an infra failure (see
sdlc/references/phase-pr-review.md-148-    below) rather than a verdict, act on it immediately — do not wait for the other
sdlc/references/phase-pr-review.md-149-    panelists still running. A replacement dispatch for that model is a brand-new,
sdlc/references/phase-pr-review.md:150:    separate async `subagent` single-agent call, not folded back into the original
sdlc/references/phase-pr-review.md-151-    `tasks:` array, so it runs alongside whichever siblings from the first batch are
sdlc/references/phase-pr-review.md-152-    still going. Keep polling until every original child and every replacement is
sdlc/references/phase-pr-review.md-153-    accounted for.
sdlc/references/phase-pr-review.md-168-
sdlc/references/phase-pr-review.md-169-    **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
sdlc/references/phase-pr-review.md-170-    panel, record `panel.dispatched` and preserve the panel's artifacts with
sdlc/references/phase-pr-review.md:171:    `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
sdlc/references/phase-pr-review.md-172-    then `panel.consolidated` after adjudication — see
sdlc/references/phase-pr-review.md-173-    `references/system-reference.md` ("Lifecycle telemetry") for the event map.
sdlc/references/phase-pr-review.md-174-
sdlc/references/system-reference.md-94-   `schema/*.json` schemas/examples, and the four `prompts/*.prompt.md` reviewer/
sdlc/references/system-reference.md-95-   validator roles.
sdlc/references/system-reference.md-96- - **`delegated`** — delegated external skills: `adversarial-review`,
sdlc/references/system-reference.md:97:   `dispatch-subagents`, `gh-pr-review-comments`, `sdlc-visual-docs`.
sdlc/references/system-reference.md-98- - **`runtime-tool`** — required runtime tools (e.g. `git`, `gh`, `node`).
sdlc/references/system-reference.md-99- - **`consumer-integration`** — consumer-configured hooks/integrations: the
sdlc/references/system-reference.md-100-   `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
sdlc/references/system-reference.md-310- - **Panel dispatch**: immediately after dispatching a design or PR panel —
sdlc/references/system-reference.md-311-   `record-run-event.sh panel.dispatched --payload '{"panelPhase":"<panelPhase>","round":<n>,"models":[...]}'`
sdlc/references/system-reference.md-312-   — and, harvest-at-dispatch, immediately preserve its artifacts with
sdlc/references/system-reference.md:313:   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`
sdlc/references/system-reference.md-314-   (skill-relative; headless: `node <skill-dir>/scripts/harvest-panel.mjs`).
sdlc/references/system-reference.md-315- - **Panel consolidation**: after adjudicating a round's findings —
sdlc/references/system-reference.md-316-   `record-run-event.sh panel.consolidated --payload '{"panelPhase":"<panelPhase>","round":<n>,"findings":{"high":<n>,"medium":<n>,"low":<n>},"incorporated":<n>,"dismissed":<n>}'`.
sdlc/references/system-reference.md-327- `task.validated`) after successful completion — nothing to do beyond passing
sdlc/references/system-reference.md-328- `--slug` when it isn't resolvable from the current git branch. Per-task
sdlc/references/system-reference.md-329- validator dispatch also harvests: immediately after a `task_validate`
sdlc/references/system-reference.md:330: subagent completes, run `scripts/harvest-panel.sh --phase task_validate
sdlc/references/system-reference.md-331- --round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
sdlc/references/system-reference.md-332-
sdlc/references/system-reference.md-333- ## 13. Stall detection and self-resume
sdlc/references/system-reference.md-328- `--slug` when it isn't resolvable from the current git branch. Per-task
sdlc/references/system-reference.md-329- validator dispatch also harvests: immediately after a `task_validate`
sdlc/references/system-reference.md-330- subagent completes, run `scripts/harvest-panel.sh --phase task_validate
sdlc/references/system-reference.md:331: --round <n> --from <asyncDir>` the same way as a design/PR panel dispatch.
sdlc/references/system-reference.md-332-
sdlc/references/system-reference.md-333- ## 13. Stall detection and self-resume
sdlc/references/system-reference.md-334-
32ebaa1 docs(sdlc): dispatch review panels async and react per-child
 skills/sdlc/references/phase-pr-review.md | 30 ++++++++++++++++++++++++------
 1 file changed, 24 insertions(+), 6 deletions(-)
commit 32ebaa18afce4fbdfb7abccd8f925a864913481a
Author: Neil Chambers <n3llyb0y.uk@gmail.com>
Date:   Sun Jul 19 09:30:24 2026 +0100
    docs(sdlc): dispatch review panels async and react per-child
    Pre-existing drafted guidance folded into the sdlc-question-discipline
    stream at its plan gate: dispatch the panel tasks array with async: true,
    poll per-child status, and replace infra-failed reviewers immediately
    instead of waiting for the slowest sibling.
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index ce1895e..dcac05e 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -101,12 +101,17 @@ hand-copy a prompt per model.
      `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
      its task value with the exact review task: name the artifact paths, commit,
-     governing documents, grounding rule, and required findings-only output; then
-     dispatch the populated array in one call. Per-model attribution comes back on
-     each task's `result.model`. `ensure-panel-agent.sh` copies the prompt body
-     verbatim and writes to the consumer repo's `.pi/agents` where the session
-     resolves project agents (NOT a `cd`-ed cwd). Consult the project's governing
-     documents (for example `AGENTS.md`) for any local sub-agent gotchas.
+     governing documents, grounding rule, and required findings-only output. Dispatch
+     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
+     not as a blocking call: a blocking multi-model dispatch only returns control after
+     every reviewer finishes, so a reviewer that crashes in the first second still sits
+     unactioned until the slowest sibling completes minutes later. Async dispatch
+     returns immediately with one run id/`asyncDir` covering every child in the panel.
+     Per-model attribution comes back on each task's `result.model` once you read it.
+     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
+     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
+     `cd`-ed cwd). Consult the project's governing documents (for example
+     `AGENTS.md`) for any local sub-agent gotchas.
    - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
      stamps one prompt file across `--model` flags.
@@ -127,6 +132,19 @@ hand-copy a prompt per model.
 `wait({ all: true })` over status-polling for read-only fan-out, and read a
 child's transcript before treating a "detached" status label as lost output.
+   **React per-child, not per-batch.** Once dispatched async, poll
+   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
+   once every child in that run finishes) at a short interval; a `wait({ id:
+   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
+   timeout returns control without stopping the run. Diff each poll's per-child
+   status against the last one: the moment any child shows an infra failure (see
+   below) rather than a verdict, act on it immediately — do not wait for the other
+   panelists still running. A replacement dispatch for that model is a brand-new,
+   separate async `subagent` single-agent call, not folded back into the original
+   `tasks:` array, so it runs alongside whichever siblings from the first batch are
+   still going. Keep polling until every original child and every replacement is
+   accounted for.
+
    **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
    candidate pool, not merely documentation. A reviewer that returns a model
    verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
bash: npm test
bash: npm run lint
bash: node skills/sdlc/scripts/check-lifecycle.mjs --body pr-bo...
bash: node skills/sdlc/scripts/verify-task-receipt.mjs docs/rev...
> pi-sdlc@0.1.1 test
> node --test test/*.test.js
✔ ASD17: ADR 0029 exists and states the authority hierarchy + trust model (7.655146ms)
✔ ASD17: programme + IC-B + OL-C plans carry absorption notes (2.212475ms)
✔ ASD17: docs assert #91/#101/#102 remain independent and out of scope (0.414015ms)
✔ ASD17: ADR 0029 is registered in the ADR directory (no orphan) (0.238508ms)
✔ pr-open: fails when branch has unpushed commits (20.353232ms)
✔ pr-open: fails when branch has no upstream (17.627394ms)
✔ pr-open: fails when no open PR is found (1.985751ms)
✔ pr-open: fails when the PR body has zero declaration blocks (18.642869ms)
✔ pr-open: fails when the PR body has a duplicate declaration block (1.074486ms)
✔ pr-open: fails when a required Closes reference is missing (17.352885ms)
✔ pr-open: passes when branch is pushed, one open PR, one valid declaration, all closes present (13.796526ms)
✔ pr-open: fails when declaration track or slug does not match the claim (2.976414ms)
✔ epic-done: fails when a sub-issue is still open (17.315448ms)
✔ epic-done: fails when the linked PR is not merged (1.804488ms)
✔ epic-done: passes when all sub-issues are closed and the PR is merged (5.288784ms)
✔ epic-done: fails when the merged PR does not close every epic sub-issue (1.024769ms)
✔ epic-done: uses the resolved repo-root for every gh call (11.070788ms)
✔ epic-done: errors (not vacuous pass) when the epic has zero sub-issues (7.355681ms)
✔ pr-open: records a visible note when --closes is omitted (30.120535ms)
✔ cli: rejects an unknown --claim value (0.293565ms)
✔ cli: rejects invalid issue numbers without throwing (0.244363ms)
✔ cli: does not consume a following flag when a value is missing (0.127558ms)
✔ irreversible artifacts pass only when all committed documents exist (471.42121ms)
✔ missing artifact and missing artifact directory are contract failures (870.790071ms)
✔ reversible never requires a specification (293.239059ms)
✔ configured paths are authoritative and multiple dated matches pass (559.29615ms)
✔ working-tree-only artifacts do not count (575.613566ms)
✔ configured path escape is an operational config error (587.747322ms)
✔ help is available without a declaration source (121.168987ms)
✔ flags mode accepts a reversible declaration (287.925854ms)
✔ invalid track stays null in the report envelope (159.520396ms)
✔ track none requires a reason and demands no artifacts (409.737229ms)
✔ body grammar rejects ambiguity and invalid lines (586.896815ms)
✔ bot exemption applies only without a valid declaration (742.304693ms)
✔ empty body and event filenames remain source errors (412.768066ms)
✔ event payload null body is an empty body and missing login is not exempt (244.059238ms)
✔ JSON mode is inert for shell metacharacters and emits one envelope (207.928628ms)
✔ CV27: config classification precedes inspection while FS9 semantics and envelope stay unchanged (854.416342ms)
✔ live inventory passes with explicit non-package classifications (426.011419ms)
✔ missing target and assertion mutations are contract failures (423.164679ms)
✔ consumer and external entries are classified without probing (238.765499ms)
✔ readiness requires the verifier assertion and path containment (854.346392ms)
✔ invalid inventory and JSON argument errors emit one envelope (216.974073ms)
✔ shell wrapper resolves beside itself from a consumer cwd (316.629756ms)
✔ ASD6: render is deterministic and byte-identical across runs (19.867697ms)
✔ ASD6: write twice is byte-identical (retained) (15.121282ms)
✔ ASD6: rendered CONFIG.md carries all §14 sections and every schemaVersion-3 key in JSON order (7.849141ms)
✔ ASD8: CONFIG.md declares JSON authority, warning, fingerprint identity, guidance, and pointer (0.535947ms)
✔ ASD7: byte-matching current file is retained (28.247732ms)
✔ ASD7: a recognized stale / body-edited companion is regenerated (12.576118ms)
✔ ASD7: an unrecognized collision is refused (exit 3) without --force and forced (exit 0) with it (21.605726ms)
✔ ASD7 (CLI): refused write exits 3 (315.622881ms)
✔ ASD9: check returns current / missing / stale / error for the four inputs (37.594808ms)
✔ ASD9: check detects a body edit and a render-format mismatch as stale (2.820942ms)
✔ ASD9: check mutates nothing in any state (31.770576ms)
✔ ASD6/sentinel: sentinelLine round-trips through parseSentinel as recognized (0.341852ms)
✔ panel floors: render surfaces per-track resolved floors incl task_validate=1 and per-phase overrides (§14) (0.444039ms)
✔ panel floors: task_validate resolves to 1 and per-track override applies when no per-phase panelSize (6.774058ms)
✔ symlink safety: a symlinked companion is never followed (check error / write refused) (1.223855ms)
✔ symlink safety: a DANGLING symlink is refused, never created through the link (15.523197ms)
✔ ICA1: valid v3 config has zero issues (34.518518ms)
✔ ICA1: shipped example is valid v3 (8.09816ms)
✔ ICA1: minimal valid v3 (no optional blocks) has zero issues (0.314563ms)
✔ ICA2: overrides.none is rejected (0.394935ms)
✔ ICA2: a review.merge key is rejected (5.394612ms)
✔ ICA2: shape.defaultTrack none is rejected (0.377826ms)
✔ ICA2: retired/reserved top-level key 'lifecycle' is unknown (0.340901ms)
✔ ICA2: retired/reserved top-level key 'enforcement' is unknown (0.175079ms)
✔ ICA2: retired/reserved top-level key 'evidence' is unknown (7.432987ms)
✔ ICA3: missing review block is an issue (5.022233ms)
✔ ICA3: missing a required review dial is an issue (0.399726ms)
✔ ICA3: missing shape block is an issue (15.770674ms)
✔ ICA3: overrides with an empty track object is an issue (0.245863ms)
✔ ICA3: per-track brainstorm override is rejected (0.181763ms)
✔ ICA4: panels.rules is an unknown key (0.243606ms)
✔ ICA4: panels.phases.*.minVendor is an unknown key (0.177164ms)
✔ ICA4: a panels phase without prefer is invalid (0.166519ms)
✔ ICA7: migrate.mjs does not exist (0.191693ms)
✔ ICA7: no migration symbols remain in scripts (34.164844ms)
✔ ICA6: schema-older remedy names re-run/pin and never 'migration' (0.608124ms)
✔ ICA6: a v2 config is refused (not mutated) by readConfig (121.833871ms)
✔ ICA6: classifyConfigVersion is total over the version matrix (0.216572ms)
✔ ICA20: retired config vocabulary has no runtime reader (2.948803ms)
✔ ICA21: SKILL reads shape.publishToTracker (no hardcoded task-count law) (0.318698ms)
✔ ASD5: the ledger parses and covers both statements and red flags (9.543866ms)
✔ ASD5 (non-vacuous): every pre-change SKILL.md red flag is covered by a retained RF row (34.0069ms)
✔ ASD5: every retained/moved row's destination exists and contains its anchor (2.917511ms)
✔ ASD5: anchors are unique (no rule owned twice) (0.555563ms)
✔ ASD5: every pre-change red flag is retained in SKILL.md (0.444883ms)
✔ ASD5 (non-vacuous): removing a moved statement from its destination is detected (0.599836ms)
✔ OH7: readiness/hooks law lives in the system reference; SKILL keeps the red flags (1.747251ms)
✔ OH7: the Implement table row no longer prescribes 'in a worktree' (0.474353ms)
✔ OH8: announce-on-fire + workflow.md enumeration in system reference; conflict rule in SKILL (0.324118ms)
✔ OH9: exactly two new ADRs (opt-in, hooks) with context/decision/consequences (0.604752ms)
✔ OH12: README has the opt-in story and drops the old no-manifest-defaults claim (0.372012ms)
✔ FS9/FS10 dogfood assets are present (0.439776ms)
✔ FS9 documentation carries declaration rules and reversible grounding (9.605287ms)
✔ FS9 and FS10 ADRs freeze the new surfaces (0.461094ms)
✔ AR10: all four startup branches and every prohibition are present and mutation-detectable (0.655261ms)
✔ AR10: docs never equate manifest presence with readiness or claim mechanical agent enforcement (0.48992ms)
✔ AR11: README carries the complete migration story (0.407849ms)
✔ AR11: ADR 0010 is superseded and the policy ADR 0015 restates the migration (8.736971ms)
✔ AR11: ADR 0016 freezes the FS8 machine surface (0.559985ms)
✔ AR11: no stale opted-in output claim remains in shipped guidance (0.377694ms)
✔ AR11: wrapper help/comments and .mjs usage match the FS8 invocation (0.295067ms)
✔ AR11: the setup template requires committing .pi⁄sdlc and points at the status gate (0.204937ms)
✔ CV29: CI and shipped bindings point at the merged config surface (7.260858ms)
✔ CV30: repository and consumer dogfood fixtures use one schemaVersion-3 config (0.656025ms)
✔ CV31: startup clean-break and shortfall carry instructions are explicit (0.334072ms)
✔ CV32: five migration ADRs exist and amended decisions link forward (7.895746ms)
✔ RB1 (BT1): the PR reference requires check-completion.mjs before a complete/PASS claim (0.222393ms)
✔ RB2 (BT2): the Implement reference states the worker task-prompt shape and infra-retry-once rule (0.139651ms)
✔ RB3 (BT3): the system reference states the stall-detection threshold and self-resume action (0.181073ms)
✔ RB4 (panel recovery): the PR reference advances failed reviewers through the configured prefer list (4.370857ms)
unknown format "uri" ignored in schema at path "#/properties/tracker/properties/board/properties/url"
unknown format "uri" ignored in schema at path "#/properties/tracker/properties/board/properties/url"
✔ S2: no loom-domain content in the generic surface (27.306991ms)
✔ S3: JSON schemas validate their examples (193.274307ms)
✔ S3b: ensure-panel-agent rejects malformed config (exit 2) (1868.903535ms)
✔ S3c: resolve-panel rejects malformed merged panels (exit 2) (850.374677ms)
✔ S4: stamped name+tools+body byte-identical to golden; description == FS4 (971.968248ms)
✔ S5: agent lands in the CONSUMER's .pi/agents (not the skill dir) (201.613028ms)
✔ S6: resolve-panel --emit-tasks deep-equals golden under isolated env (1395.781674ms)
✔ S7: resolution terminal cases (460.917234ms)
✔ ASD19: frozen surfaces are byte-identical to the branch base (60.584723ms)
✔ ASD19: FS8/FS9 check ids remain present in their frozen scripts (13.81266ms)
✔ ASD14: every inventory row carries a valid class (14.200427ms)
✔ ASD14: all six taxonomy values are represented across the inventory (0.327751ms)
✔ ASD14: the live inventory passes structural discovery with a row for every public artifact (312.932558ms)
✔ ASD15: a valid fixture passes; an undocumented artifact under a discovery root fails (485.763932ms)
✔ ASD15: removing a row for a still-present public artifact fails discovery (226.519098ms)
unknown format "uri" ignored in schema at path "#/properties/tracker/properties/board/properties/url"
unknown format "uri" ignored in schema at path "#/properties/tracker/properties/board/properties/url"
✔ OH1: valid hooks pass both the JSON Schema and validateConfig (307.253255ms)
✔ OH1: the committed example (with hooks) validates against the schema (13.446526ms)
✔ OH1: mutations are rejected by BOTH the schema and validateConfig (exit 2) (1610.372099ms)
✔ OH2: readConfig strict mode rejects a missing manifest naming /setup-sdlc (200.906113ms)
✔ OH2: default readConfig returns defaults for a missing manifest (0.798566ms)
✔ OH2: strict mode returns the config (incl. hooks) when the manifest is present (6.352481ms)
✔ ASD1: the system reference and all six phase references resolve skill-relative (4.026715ms)
✔ ASD1: the six advertised sdlc:<slug> invocations map to existing templates (2.232475ms)
✔ ASD1: every package-relative skill link inside the references resolves (10.376375ms)
✔ ASD1: .pi/sdlc/CONFIG.md resolves consumer-relative (never package-relative) (292.793945ms)
✔ readConfig returns current defaults when the manifest is absent (4.557334ms)
✔ readConfig validates and returns merged v3 fields (2.494207ms)
✔ readConfig keeps newer and malformed version diagnostics distinct (280.606383ms)
✔ SP1: shipped generic commands use skill-relative forms (16.04017ms)
✔ SP2: installed skill commands run from consumer cwd (1612.283328ms)
✔ ASD3: phase-brainstorm.md carries all nine §6 headings (10.864594ms)
✔ ASD3: phase-brainstorm.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.395482ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-brainstorm.md is detected (0.351054ms)
✔ ASD3: phase-plan.md carries all nine §6 headings (0.176192ms)
✔ ASD3: phase-plan.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.138187ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-plan.md is detected (10.304023ms)
✔ ASD3: phase-spec.md carries all nine §6 headings (0.295799ms)
✔ ASD3: phase-spec.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.100833ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-spec.md is detected (0.139856ms)
✔ ASD3: phase-tasks.md carries all nine §6 headings (0.272155ms)
✔ ASD3: phase-tasks.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.137994ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-tasks.md is detected (3.452535ms)
✔ ASD3: phase-implement.md carries all nine §6 headings (0.151039ms)
✔ ASD3: phase-implement.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.060912ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-implement.md is detected (2.98072ms)
✔ ASD3: phase-pr-review.md carries all nine §6 headings (0.141786ms)
✔ ASD3: phase-pr-review.md has at least one 'under your configuration' callout to CONFIG.md/JSON (0.810554ms)
✔ ASD3 (non-vacuous): removing the config callout from phase-pr-review.md is detected (0.113937ms)
✔ AR3: every manifest dirty variant exits 3 at adoption.manifest-clean (1920.324004ms)
✔ AR9: a linked worktree is ready on its own HEAD/index/working tree (262.870123ms)
✔ AR9: a dirty manifest in the main checkout does not contaminate a linked worktree (493.918712ms)
✔ AR9: detached HEAD with the required blobs is ready (372.970692ms)
✔ AR9: a symlinked consumer root compares equal after realpath and is ready (387.240809ms)
✔ AR9: a configured monorepo subdirectory uses prefixed HEAD blob paths and can be ready (844.327539ms)
✔ AR9: a consumer root that is a git submodule is inspected as its own worktree (705.618595ms)
✔ AR9: sparse checkout omitting required committed files deterministically fails, never ready (273.994177ms)
✔ AR9/PR-panel: a manifest committed as a symlink is never trusted as adoption content (378.143559ms)
✔ AR3/PR-panel: assume-unchanged and skip-worktree index flags cannot smuggle uncommitted content (728.506442ms)
✔ AR4: a corrupt .git pointer is git.repository:error, exit 2 (186.024183ms)
✔ RL1: inspectRoot explicit precedence — config over repoRoot over sdlcRoot; relative resolves against cwd (17.963205ms)
✔ RL2: inspectRoot walks ancestors from cwd to a configured project root (1.123921ms)
✔ RL3: inspectRoot falls back to the git top-level for a manifest-less repo (65.92862ms)
✔ RL4: inspectRoot returns the error member (never exits) outside any project (14.744694ms)
✔ RL5: inspectRoot honours $SDLC_ROOT when no explicit option is given (0.98327ms)
✔ SP4: consumer path seam preserves spelling and rejects slash/backslash escapes (17.404048ms)
✔ RL6: inspectConfig — valid input yields [], non-objects yield the deterministic issue (1.27205ms)
✔ RL7: inspectConfig — aggregates every issue in validation-rule order, never throws (11.420959ms)
✔ RL7b: inspectConfig — malformed nested structures aggregate without throwing (0.50629ms)
✔ RL9: validateConfig first diagnostic is byte-identical to the first collector issue (exit 2) (1408.827298ms)
✔ RL11: config validator still accepts valid input (exit 0) after delegation (85.440035ms)
✔ AR8: ready fixture — exact text golden (387.573248ms)
✔ AR8: ready fixture — exact JSON golden (deterministic serialization) (422.655855ms)
✔ AR8: not-adopted — text carries fail + remediation and pinned skips (exit 1) (266.608518ms)
✔ AR8: JSON on every state 0-3 is a single valid envelope with only FS8 fields (1369.597894ms)
✔ AR8: secret sentinels in the environment never appear in output (1086.435549ms)
✔ AR8: --format json anywhere in argv forces the envelope for argument errors (522.450298ms)
✔ AR8: JSON envelope root falls back to absolute cwd on root-resolution failure (192.215025ms)
✔ AR8: cli.arguments error envelope uses the single unambiguous explicit root when available (267.158645ms)
✔ AR8/PR-panel: argument values after '=' are elided from diagnostics (98.006312ms)
✔ AR4/PR-panel: a root flag never consumes a following option as its value (223.900716ms)
✔ PR-panel: skips blocked by an errored check propagate that check's own message (146.434468ms)
✔ AR7: missing panels + workflow read failure both surface, exit 3 (291.697135ms)
✔ AR7: malformed config still evaluates independent workflow check; error precedence wins (254.316504ms)
✔ AR7: skip pins — not-adopted repo (147.3264ms)
✔ AR7: skip pins — dirty manifest still evaluates independent workflow checks (254.383438ms)
✔ wrapper: sdlc-status.sh output and exit are identical to direct .mjs invocation (1031.79664ms)
✔ NR7: generic prompts do not require absent governing files (1.53428ms)
✔ NR7: skill dispatch instructions are concrete and CI claims are bounded (3.050127ms)
✔ NR7: inventory checker and ADR are shipped and versioned (2.603921ms)
✔ CV29: normative inventory rebinds readiness to merged panels (0.588824ms)
✔ NR8: source prompt extraction remains the fixture authority (4.823059ms)
✔ ICA12: pr_review floor 3, author's provider-mate stays, author identity excluded (226.690464ms)
✔ ICA12: plan_review floor 2 caps at two (154.394976ms)
✔ ICA12: task_validate floors at 1 (172.664046ms)
✔ ICA13: --track required when overrides present (154.308797ms)
✔ ICA13: reversible design override refuses; irreversible resolves (471.427138ms)
✔ ICA14: review.tasks off refuses task_validate (93.517676ms)
✔ ICA14: design human refuses plan_review with no-panel message (133.995464ms)
✔ ICA14: separateSpec false refuses spec_review with no-spec-gate message (255.386554ms)
✔ ICA15: per-phase panelSize overrides review.panelSize (356.776359ms)
✔ ICA15: floor 1 does not exclude the author identity (302.032941ms)
✔ ICA16: onShortfall proceed advises and exits 0 below floor (280.541362ms)
✔ ICA16: onShortfall fail exits 1 below floor (271.884775ms)
✔ ICA14: review.tasks self refuses task_validate (only subagent resolves) (237.326087ms)
✔ ICA24: separateSpec false precedes the human/off refusal for spec_review (224.097556ms)
✔ rpi-t1: Bedrock-hosted Claude collapses to the direct-API identity for author-exclusion (187.641517ms)
✔ rpi-t1: distinct Bedrock version qualifiers stay distinct identities (203.258243ms)
✔ rpi-t1: same model + same version, different Bedrock region, dedupes to one panelist (139.377073ms)
✔ rpi-t1: Bedrock-native model with no direct-provider equivalent is unaffected (162.721492ms)
✔ CV28: watched config schema changes require the PR release signal (1966.589955ms)
✔ CV28: inner breaking commits are ignored in favour of the squash title (426.386547ms)
✔ CV28: only the named schemas and CONFIG_SCHEMA_VERSION line are watched (1164.534317ms)
✔ CV19: committed migrated v2 config without a models file is ready in text and JSON (765.304394ms)
✔ CV17: recognised v1 is not-ready with canonical migration remedy and unrelated checks still report (367.971117ms)
✔ CV18: schemaVersion 4 is an error with the canonical newer remedy (432.950543ms)
✔ CV19: a panels-less v2 config is valid but not-ready (307.312414ms)
✔ CV20: malformed JSON and invalid schemaVersion remain config errors (671.601206ms)
✔ current v2 structural validation errors remain config.valid errors (602.32281ms)
✔ filesystem-only manifests are not committed adoption (630.679454ms)
✔ argument, root, and git errors retain exit 2 (1193.765844ms)
✔ workflow readability remains an independent readiness check (585.154312ms)
✔ unrelated dirty files do not affect readiness (313.163849ms)
✔ status completes with a PATH exposing only git (354.769035ms)
✔ fresh bundle provisions requested assets and idempotent rerun retains them (610.418197ms)
✔ CI marker directories are not mistaken for CI files (289.169557ms)
✔ existing CI suppresses workflow creation and reports refusal (299.859809ms)
✔ template info strings must be exactly sdlc (240.506084ms)
✔ consumer template with the wrong companion is refused byte-identically (404.670711ms)
✔ consumer template with multiple declarations is refused (326.506661ms)
✔ consumer template without the declaration is refused byte-identically (143.818751ms)
✔ invalid assembled configuration fails before any bundle write (172.980596ms)
✔ target parent conflicts fail before any bundle write (341.923878ms)
✔ unreadable package sources fail before any bundle write (304.878038ms)
✔ invalid existing config and models are refused without overwrite (536.652165ms)
✔ workflow from another repository is refused (167.365112ms)
✔ malformed CI marker fails before any bundle write (423.235331ms)
✔ operational JSON errors preserve the resolved consumer root (429.005371ms)
✔ existing target directories fail before any bundle write (304.364205ms)
✔ bundle reports resolved package references before writing (263.123138ms)
schema-version: 2
root: /tmp/setup-interview-V0BTw2
exit-code: 0
reference: reference.pr-template ok — resolved /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/skills/sdlc/assets/pull_request_template.md
reference: reference.checker ok — resolved /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline/skills/sdlc/scripts/check-lifecycle.mjs
asset: config created — created /tmp/setup-interview-V0BTw2/.pi/sdlc/sdlc.config.json
asset: config-doc created — created .pi/sdlc/CONFIG.md: created new companion
asset: pr-template created — created /tmp/setup-interview-V0BTw2/.github/pull_request_template.md
✔ ASD11: setup template names the kernel, tracks, gate modes, consequences, and two core decisions (9.724767ms)
✔ ASD11: the interactive fallback asks at most 3 prompts (two decisions + confirmation) (21.021131ms)
✔ ASD11: collectInterview asks exactly the two core decisions (0.352591ms)
✔ ASD11: every dial remains reachable non-interactively by flag (0.226909ms)
✔ ASD20: setup-sdlc.mjs carries the config-doc write call site (0.210709ms)
✔ ASD20 (landing-order conditional): any already-landed telemetry call sites are preserved (0.139452ms)
✔ OH4: --yes writes a schema-valid config; bundle re-run refuses config changes; --force overwrites (901.231298ms)
✔ OH5: --hook-use fields 3-4 = use, do = remainder after 4th colon (colons in do preserved) (261.365923ms)
✔ OH5: --hook-run command = remainder after 2nd colon (colons preserved); trust warning on stderr (179.606198ms)
✔ OH5: mixed repeated hook flags preserve argv order in the written list (440.869896ms)
✔ OH5: malformed hook flags exit 2 (1741.053687ms)
✔ PR-fix: value-taking flags accept values that begin with '-' (e.g. --announce '--foo') (260.408516ms)
✔ OH5: partial tracker flags exit 2 (all-or-none) (212.88975ms)
✔ OH5: no config flags and no TTY exits 2 (interview needs a TTY) (213.631047ms)
✔ OH6: package.json pi.prompts includes ./templates and the template has a description (4.794663ms)
✔ ICA17: --profile is retired (163.450934ms)
✔ ICA17: --lifecycle-json is retired (181.353997ms)
✔ ICA17: --enforcement is retired (145.645337ms)
✔ ICA17: --preset custom is retired (148.338348ms)
✔ ICA18: --preset standard writes the explicit standard bundle (176.006122ms)
✔ ICA18: per-dial flags override the preset; --override lands in overrides (418.124882ms)
✔ ICA18: --preset full carries the reversible design override (109.167651ms)
✔ ICA19: --preset patches review/shape/overrides and preserves other keys (193.045808ms)
✔ ICA19: patch that would delete consumer overrides refuses without --force (423.049442ms)
✔ ICA23: --override reversible:brainstorm:off is rejected exit 2 (94.582067ms)
✔ ICA23: --override reversible:onShortfall:fail is rejected exit 2 (72.665605ms)
✔ ICA23: --override frozen:design:panel is rejected exit 2 (174.762085ms)
✔ ICA23: --override reversible:design:banana is rejected exit 2 (280.461413ms)
✔ ICA23: --override reversible:panelSize:zero is rejected exit 2 (217.933942ms)
✔ ICA23: --override reversible:design is rejected exit 2 (193.873616ms)
✔ ICA6: older-schema config + --force replaces with a fresh v3 config (290.812522ms)
✔ ICA19: a single-dial patch preserves the other committed dials (357.25853ms)
✔ ICA19: preset patch refuses when it would drop a consumer override track (443.698921ms)
✔ ASD4: SKILL.md is within the 220-line / 16384-byte ceiling (4.595605ms)
✔ ASD4: SKILL.md retains all seven kernel responsibilities (2.039003ms)
✔ ASD4: SKILL.md contains no duplicated detailed phase-mechanics block (0.30259ms)
✔ ASD16: every §5 checklist answer is derivable from docs alone (8.503261ms)
✔ ASD16: docs state the source-inspection boundary (source only when changing implementation) (6.907611ms)
✔ ASD16 (non-vacuous): no doc claims implementation work can avoid source inspection (0.644058ms)
✔ ASD12: all six sdlc:<slug> entrypoint templates exist (14.462583ms)
✔ ASD12: every entrypoint drives adopted-config on the FS8 adoption.manifest-head predicate and stops on error (5.727821ms)
✔ ASD12: the sdlc:spec stamp is structurally valid and only spec emits one (13.415197ms)
✔ ASD12: sdlc:pr-review discloses grounded-vs-diff-only and never runs below committed floors (0.456772ms)
✔ ASD12: brainstorm/plan run without upstream (unadopted) and as configured gate (adopted) (0.433601ms)
✔ ASD13: sdlc:tasks and sdlc:implement refuse-with-redirect in BOTH adoption states and fabricate nothing (0.376226ms)
✔ ASD10: startup invokes config-doc check outside FS8 readiness and FS9 completion (1.02779ms)
✔ ASD10: current reads CONFIG.md; missing/stale emit the fixed warning and fall back to JSON (0.215587ms)
✔ ASD10: the error branch splits collision (warn+fallback) from invalid-config (surface + stop) (5.652582ms)
✔ ASD10: prose is never authority over JSON, and readiness/lifecycle contracts are unchanged (0.367617ms)
✔ FS13 telemetry load trigger is present in the kernel (regression guard) (0.20786ms)
✔ ASD2: system reference contains every §5 checklist section (5.88787ms)
✔ ASD2 (non-vacuous): deleting any one section is detected (3.498475ms)
✔ ASD2: §5 public-composition inventory narrates the six-class taxonomy (0.545146ms)
✔ LT18: soft data carries attribution and matches the fixture LLM's scripted responses (386.986091ms)
✔ LT18: an unreadable review directory yields precision.unparsed:<dir> and no precision number (180.475514ms)
✔ LT19: --no-llm (noLlm:true) output validates and carries soft.absent (31.402453ms)
✔ LT17: --from-raw reproduces a byte-identical run.json after live sources are destroyed (594.331537ms)
✔ LT28: neither the sentinel secret nor the verbatim prompt sentence appears in run.json (299.9189ms)
✔ NF4 unit: sanitizeSoftString redacts, rejects n-gram containment, and caps at 500 chars (0.439128ms)
✔ LT29: a failing --gh-cmd yields github.error, schema-valid, no fabricated PR data (163.327976ms)
✔ LT29: an --llm-cmd returning invalid JSON yields llm.error:narrative, schema-valid, no fabricated summary (234.34675ms)
✔ LT29: an --llm-cmd that times out yields llm.error:<kind>, schema-valid, exit unaffected (618.376353ms)
✔ llm-protocol schema: request/response fixtures validate (4.010912ms)
✔ LT13 (hard): complete fixture store -> schema-valid run.json with known-answer rollups (538.109847ms)
✔ LT14: a gappy store names every gap and derives nothing from missing sources (238.049948ms)
✔ LT14: --no-github records github.skipped, not github.error (13.006667ms)
✔ LT15: manifest adapter skips and counts malformed lines (manifest.partial) (14.883269ms)
✔ LT15: harvest adapter maps per-model fields correctly (5.098071ms)
✔ LT15: transcript usage/cost sums correctly and a version-4 transcript soft-fails per-file (3.068022ms)
✔ LT15: review-dir discovery matches <phase>-<slug>-<date> naming (5.283941ms)
✔ LT15: git/GitHub adapters consume only the injected fakes (329.80799ms)
✔ LT16: phase attribution, agent time, capped human-wait, rework, window bounds (8.863867ms)
✔ LT16: a 3-hour gap contributes exactly 30 minutes to human-wait (24.755348ms)
✔ collect-run: no run store exits 1 (nothing collectable) (195.72691ms)
✔ collect-run: writes docs/retros/<slug>/run.json by default and validates (233.265667ms)
✔ resolveSessionDirs: an override list is used verbatim; absence marks sessions.dir_unresolved (3.222975ms)
✔ LT24: every mandated hook step names record-run-event.sh and its event-type token together (1.071083ms)
✔ LT24: the panel-dispatch step and the validator-dispatch step each name harvest-panel.sh (0.262379ms)
✔ LT24: sdlc-retro SKILL.md names collect and render invocations skill-relatively (FS12 forms) (4.358436ms)
✔ LT25: check-references passes with the new inventory entries (141.253062ms)
✔ LT25: deleting a new entry's target file fails check-references (295.769121ms)
✔ structural coverage: every sdlc-retro script has an FS11 inventory entry (1.655062ms)
✔ structural coverage: every hook script named by §4 has an FS11 inventory entry (0.327497ms)
✔ structural coverage: every committed sdlc-retro schema file has an FS11 inventory entry (1.135781ms)
✔ structural coverage: ADR 0028 has an FS11 inventory entry and exists (4.306068ms)
✔ structural coverage: every run-store/retro path named normatively by either SKILL.md has an inventory entry (0.541045ms)
✔ LT27: docs/retros/sdlc-lifecycle-telemetry/run.json and index.html exist (0.918853ms)
✔ LT27: the dogfood run.json validates against the committed schema and hand-rolled validator (12.788441ms)
✔ LT27: coverage markers honestly record the pre-instrumentation gap (partial coverage by design) (0.280432ms)
✔ LT27: the committed dashboard renders all seven anchors for the dogfood run (0.263713ms)
✔ LT1: valid emit appends one schema-conforming line, creating the store (201.111649ms)
✔ LT1b: --by defaults to agent when omitted (155.486927ms)
✔ LT2: bad inputs exit 2 and never touch the manifest (1013.966868ms)
✔ schema agreement: unknown event types remain valid for forward-compatible consumers (0.743059ms)
✔ LT2b: a bad input against a non-existent store attempts no write (113.782242ms)
✔ LT3: concurrent emitters produce N complete, non-interleaved lines (306.593042ms)
✔ empty explicit identities do not fall through to another identity (262.640413ms)
✔ LT4: --slug beats env beats branch mapping (411.008345ms)
✔ LT5: unresolvable identity skips (exit 0, one warning, no write) (322.121123ms)
✔ LT26: .gitignore ignores the run store (9.733022ms)
✔ emitter: .sh wrapper delegates to .mjs identically (98.547581ms)
✔ vocabulary: every known event has a payload descriptor (0.183543ms)
✔ LT11: harvest copies status.json + events.jsonl and emits panel.harvested (223.161845ms)
✔ LT11: --with-transcripts copies the transcripts/ subdirectory (236.941937ms)
✔ LT12: a missing source directory exits 0 with both files missed (201.386457ms)
✔ LT12: a partially-present source (status without events) reports one missed (137.146849ms)
✔ harvest-panel: unknown phase and non-positive round exit 2 (364.616652ms)
✔ harvest-panel.sh wrapper delegates to .mjs identically (179.058844ms)
✔ LT20: full fixture renders all seven anchors with known-answer data bindings (3.741179ms)
✔ LT20: an empty-shell run.json fails to carry any pinned data binding (0.284994ms)
✔ LT21: render-twice byte-identity and no generation-time values (10.390685ms)
✔ LT21 (CLI): rendering the same --run input twice via the CLI is byte-identical (416.708711ms)
✔ LT22: soft-data figures carry data-soft and visible attribution (0.660994ms)
✔ LT22: a soft-less run.json renders coverage notices, not fabricated numbers (0.366198ms)
✔ LT23: every coverage marker is rendered under #coverage (0.358639ms)
✔ render-retro CLI: unreadable/unparseable/schema-invalid --run exits 1; usage errors exit 2 (836.295465ms)
✔ render-retro CLI: default --out is index.html beside the input; --format json envelope (133.021445ms)
✔ LT6: resolve-panel emits panel.resolved; stdout/exit byte-identical with/without --slug (590.167465ms)
✔ LT7: ensure-panel-agent emits panel.agent_stamped; stdout/exit byte-identical (575.574261ms)
✔ LT8: validate-task emits task.validated on PASS with and without --report (814.131074ms)
✔ LT8: validate-task emits task.validated on FAIL (216.191946ms)
✔ LT8: validate-task emits task.validated on an ERROR fixture whose manifest parses (55.394419ms)
✔ LT8: an unparseable-manifest ERROR skips emission with the standard warning (45.494675ms)
✔ LT9: unwritable run store degrades to a warning; primary output unaffected (296.22979ms)
✔ nested --repo-root run stores are git-ignored too (gitignore anchoring) (7.258045ms)
✔ LT10: check-lifecycle.mjs and .sh are untouched by FS5 side-effect emission (3.721693ms)
✔ PV1: a valid JavaScript manifest runs only declared checks and passes (345.181241ms)
✔ PV2: only declared argv run; an undeclared tool command never executes (709.95573ms)
✔ PV3: schema and inspectManifest reject the mutation matrix before any command runs (276.165324ms)
✔ PV4: command outcomes are complete and deterministic; runner continues after failures (180.084188ms)
✔ PV4: a timeout is reported as FAIL with timedOut (1196.974103ms)
✔ PV5: category applicability is exact; injected n/a shapes are rejected (242.332003ms)
✔ PV6: scenario mapping gates the verdict (259.92181ms)
✔ PV7: standards and banned patterns are commands, not judgement (310.341157ms)
✔ PV8: evidence is bounded and secrets are redacted (222.779188ms)
✔ PV8 unit: boundStream and redaction name-matching are precise (500.739136ms)
✔ PV9: JSON/text/exit agree and JSON mode is order-independent (1514.122112ms)
✔ PV9: --report writes the exact JSON bytes atomically (363.707462ms)
✔ PV9: --report outside the repo root is refused and clobbers nothing (373.011525ms)
✔ PV10: generic validator law and generated agent are portable (0.787476ms)
✔ PV11: receipt hash verification detects mutation of any stored file (18.585869ms)
✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (3.112629ms)
✔ parseArgs: recognises JSON anywhere and rejects bad flags (8.367213ms)
✔ PV13: renderText is a faithful projection of the report (225.545984ms)
ℹ tests 397
ℹ suites 0
ℹ pass 397
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 19580.174127
> pi-sdlc@0.1.1 lint
> biome check .
Checked 144 files in 582ms. No fixes applied.
root: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-question-discipline
mode: body
state: pass
exit-code: 0
track: reversible
slug: sdlc-question-discipline
reason: -
exempt: false
check: cli.arguments pass — arguments are valid
check: root.resolve pass — consumer root resolved
check: git.repository pass — resolved root is a git worktree
check: config.valid pass — committed configuration is valid
check: declaration.source pass — declaration source read
check: declaration.parse pass — one declaration structure parsed
check: declaration.track pass — track: reversible
check: declaration.slug pass — slug: sdlc-question-discipline
check: declaration.reason pass — reason not applicable for lifecycle track
check: artifact.plan pass — plan document(s): 2026-07-19-sdlc-question-discipline.md
check: artifact.spec skip — specification not required on the reversible track
check: artifact.build pass — build document(s): 2026-07-19-sdlc-question-discipline-build.md
verify-task-receipt: unexpected argument: docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/receipt.json
Command exited with code 2
bash: node skills/sdlc/scripts/verify-task-receipt.mjs --help &...
usage: verify-task-receipt.mjs --dir RECEIPT_DIR
verify-task-receipt: unexpected argument: --receipt
Command exited with code 2
bash: node skills/sdlc/scripts/verify-task-receipt.mjs --dir do...
receipt verified: docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19
receipt verified: docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19
bash: for c in 32ebaa1 c759c20 69e62eb 244ec22 04b6876 2699186 ...
bash: git show 04b6876:docs/reviews/task-validate-sdlc-question...
bash: git show 50c9286:docs/reviews/task-validate-sdlc-question...
bash: git show 2699186 --format=fuller --no-patch; git show 244...
32ebaa1 docs(sdlc): dispatch review panels async and react per-child
 skills/sdlc/references/phase-pr-review.md | 30 ++++++++++++++++++++++++------
 1 file changed, 24 insertions(+), 6 deletions(-)
c759c20 docs(sdlc): plan for question-presentation discipline across phases
 docs/plans/2026-07-19-sdlc-question-discipline.md | 156 ++++++++++++++++++++++
 1 file changed, 156 insertions(+)
69e62eb docs(sdlc): build plan for question-presentation discipline
 .../2026-07-19-sdlc-question-discipline-build.md   | 109 +++++++++++++++++++++
 1 file changed, 109 insertions(+)
244ec22 docs(sdlc): add shared question-presentation contract (T1, #116)
 docs/validation/sdlc-question-discipline/t1.json | 63 ++++++++++++++++++++++++
 skills/sdlc/references/system-reference.md       | 58 +++++++++++++++++++---
 2 files changed, 114 insertions(+), 7 deletions(-)
04b6876 docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
 .../generated-agent.md                             |  48 +++
 .../manifest.json                                  |  63 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 160 +++++++
 .../validator.md                                   | 478 +++++++++++++++++++++
 5 files changed, 761 insertions(+)
2699186 docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
 .github/pull_request_template.md                   |  6 ++
 .../2026-07-19-sdlc-question-discipline-build.md   |  8 +++
 .../disposition-ledger.md                          |  2 +-
 docs/validation/sdlc-question-discipline/t2.json   | 81 ++++++++++++++++++++++
 skills/sdlc/assets/pull_request_template.md        |  6 ++
 skills/sdlc/references/phase-brainstorm.md         | 19 +++--
 skills/sdlc/references/phase-implement.md          | 22 ++++++
 skills/sdlc/references/phase-plan.md               | 20 ++++++
 skills/sdlc/references/phase-pr-review.md          | 25 ++++++-
 skills/sdlc/references/phase-spec.md               | 18 +++++
 skills/sdlc/references/phase-tasks.md              | 17 +++++
 11 files changed, 217 insertions(+), 7 deletions(-)
50c9286 docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
 .../generated-agent.md                             |  48 ++
 .../manifest.json                                  |  81 +++
 .../receipt.json                                   |  12 +
 .../runner-report.json                             | 199 ++++++
 .../validator.md                                   | 683 +++++++++++++++++++++
 5 files changed, 1023 insertions(+)
jq: error (at <stdin>:160): Cannot iterate over null (null)
Command exited with code 5
jq: error (at <stdin>:199): Cannot iterate over null (null)
Command exited with code 5
commit 26991866ed9955358588857c38db497ffb500f2c
Author:     Neil Chambers <n3llyb0y.uk@gmail.com>
AuthorDate: Sun Jul 19 09:45:57 2026 +0100
Commit:     Neil Chambers <n3llyb0y.uk@gmail.com>
CommitDate: Sun Jul 19 09:45:57 2026 +0100
    docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
    Brainstorm widens-not-steers and unifies parked questions with map-mode
    fog; Plan closes decisions draft-first with tiers mapped onto the doc;
    Spec poses edge cases as draft scenarios ratified by exception; Build
    expects zero blocking questions and attaches parked items per-task;
    Implement reserves mid-task interrupts for external blockers and accrues
    assumptions to the build-plan appendix; PR review escalates only
    pre-adjudicated high/medium dismissal proposals once per wave, with
    human-ratified dismissals binding forward. Both PR templates gain the
    'Assumptions & discretionary calls' section as named panel input.
    Disposition-ledger S25 anchor follows the reworded brainstorm bullet.
commit 244ec22287efe0ed46a8febed815f3b51f0999a7
Author:     Neil Chambers <n3llyb0y.uk@gmail.com>
AuthorDate: Sun Jul 19 09:37:37 2026 +0100
Commit:     Neil Chambers <n3llyb0y.uk@gmail.com>
CommitDate: Sun Jul 19 09:37:37 2026 +0100
    docs(sdlc): add shared question-presentation contract (T1, #116)
    New system-reference section 14: single end-of-reply numbered block,
    one question per item, enumerated alternatives, reasoned
    recommendations, uniform 3-5 soft cap (deltas lower-only), triage tiers
    Blocking/Assumption/Parked, overflow demotes, never ask a
    repo-discoverable fact. Tool-agnostic; skills-and-tools and FS11
    example language neutralised; routing row added. PV1 manifest included.
commit 04b687635b553cbd5c325e6d74c45132991dd02f
Author:     Neil Chambers <n3llyb0y.uk@gmail.com>
AuthorDate: Sun Jul 19 09:40:10 2026 +0100
Commit:     Neil Chambers <n3llyb0y.uk@gmail.com>
CommitDate: Sun Jul 19 09:40:10 2026 +0100
    docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
commit 50c928643a377163ea472485127dab804e73f8e4
Author:     Neil Chambers <n3llyb0y.uk@gmail.com>
AuthorDate: Sun Jul 19 09:47:31 2026 +0100
Commit:     Neil Chambers <n3llyb0y.uk@gmail.com>
CommitDate: Sun Jul 19 09:47:31 2026 +0100
    docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
bash: jq 'keys' docs/reviews/task-validate-sdlc-question-discip...
bash: git diff --check main...50c928643a377163ea472485127dab804...
bash: nl -ba docs/validation/sdlc-question-discipline/t1.json |...
bash: git show 2699186^:docs/plans/2026-07-19-sdlc-question-dis...
[
  "categories",
  "commands",
  "errors",
  "exitCode",
  "manifest",
  "manifestErrors",
  "repoRoot",
  "scenarios",
  "schemaVersion",
  "taskId",
  "verdict"
]
jq: error (at docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/runner-report.json:160): Cannot iterate over null (null)
jq: error (at docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/runner-report.json:199): Cannot iterate over null (null)
Command exited with code 5
docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/generated-agent.md:5: trailing whitespace.
+extensions:
docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/generated-agent.md:5: trailing whitespace.
+extensions:
docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator.md:179: trailing whitespace.
+validate-task.mjs-107-
exit=2
    42	    "tests": {
    43	      "applicability": "required",
    44	      "checkIds": ["tests.full"]
    45	    },
    46	    "static": {
    47	      "applicability": "required",
    48	      "checkIds": ["static.lint"]
    49	    },
    50	    "scenarios": {
    51	      "applicability": "n/a",
    52	      "reason": "Reversible track: no Specification exists; T1 maps to approved plan DoD items 1/3/5 per the build plan's T1 check table."
    53	    },
    54	    "standards": {
    55	      "applicability": "required",
    56	      "checkIds": ["standards.section-present", "standards.routing-row"]
    57	    },
    58	    "bannedPatterns": {
    59	      "applicability": "required",
    60	      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    61	    }
    62	  }
    63	}
    60	    "tests": {
    61	      "applicability": "required",
    62	      "checkIds": ["tests.full"]
    63	    },
    64	    "static": {
    65	      "applicability": "required",
    66	      "checkIds": ["static.lint"]
    67	    },
    68	    "scenarios": {
    69	      "applicability": "n/a",
    70	      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    71	    },
    72	    "standards": {
    73	      "applicability": "required",
    74	      "checkIds": ["standards.all-six-deltas", "standards.pr-template-repo", "standards.pr-template-asset", "standards.panel-input-naming"]
    75	    },
    76	    "bannedPatterns": {
    77	      "applicability": "required",
    78	      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    79	    }
    80	  }
    81	}
     1	---
     2	name: pi-sdlc-task-validate
     3	description: sdlc task_validate reviewer. Stamped by the sdlc skill; edit the template, not this file. Dispatch one task per model via the subagent tool's per-task model override.
     4	tools: read,grep,find,ls,bash
     5	extensions:
     6	---
     7
     8	You are one of several independent reviewers in a multi-model panel, a mechanistic task validator. You are NOT a code reviewer and you give NO quality opinions. Your only job is to run the deterministic validation runner over the task's committed manifest and report what it returns, with the runner's own report as evidence. Judgement review happens later at the PR panel; do not pre-empt it. You never invent commands, decide applicability, reinterpret scenarios, or edit the manifest.
     9
    10	## Inputs the caller gives you
     1	---
     2	name: pi-sdlc-task-validate
     3	description: sdlc task_validate reviewer. Stamped by the sdlc skill; edit the template, not this file. Dispatch one task per model via the subagent tool's per-task model override.
     4	tools: read,grep,find,ls,bash
     5	extensions:
     6	---
     7
     8	You are one of several independent reviewers in a multi-model panel, a mechanistic task validator. You are NOT a code reviewer and you give NO quality opinions. Your only job is to run the deterministic validation runner over the task's committed manifest and report what it returns, with the runner's own report as evidence. Judgement review happens later at the PR panel; do not pre-empt it. You never invent commands, decide applicability, reinterpret scenarios, or edit the manifest.
     9
    10	## Inputs the caller gives you
    75	  high/medium dismissals and ratified-residual-risk touches escalate;
    76	  per-wave post-consolidation under the cap; human-ratified dismissals bind
    77	  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
    78	  PR body's assumptions section as panel input **without weakening** the
    79	  no-development-findings-in-body rule.
    80
    81	Add the empty-allowed **"Assumptions & discretionary calls"** section to
    82	`skills/sdlc/assets/pull_request_template.md` and
    83	`.github/pull_request_template.md`.
    84
    85	**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
    86
    87	**Blocked by:** T1 (the pointer target must exist).
    88
    89	**Checks (exact commands; PV1 manifest projected from this table):**
    90
    91	| Category | Command (argv) | Requirement |
    92	|---|---|---|
    93	| tests | `npm test` | required |
    94	| static | `npx biome check .` | required |
    95	| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
    96	| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
    97	| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
    98	| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |
    99
   100	## Assumptions (appendix — accrues during Implement; copied into the PR body)
   101
   102	- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
   103	  rationale above.
   104
   105	## Tracker projection
   106
   107	Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
   108	(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
   109	`blockedBy` T1. This doc remains canonical; the tracker is a projection.
    78	  PR body's assumptions section as panel input **without weakening** the
    79	  no-development-findings-in-body rule.
    80
    81	Add the empty-allowed **"Assumptions & discretionary calls"** section to
    82	`skills/sdlc/assets/pull_request_template.md` and
    83	`.github/pull_request_template.md`.
    84
    85	**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
    86
    87	**Blocked by:** T1 (the pointer target must exist).
    88
    89	**Checks (exact commands; PV1 manifest projected from this table):**
    90
    91	| Category | Command (argv) | Requirement |
    92	|---|---|---|
    93	| tests | `npm test` | required |
    94	| static | `npx biome check .` | required |
    95	| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
    96	| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
    97	| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
    98	| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |
    99
   100	## Assumptions (appendix — accrues during Implement; copied into the PR body)
   101
   102	- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
   103	  rationale above.
   104	- (T1) The shared-contract section wording avoids the repo's S2
   105	  generic-surface banned literals (e.g. the word "handover" is loom-domain);
   106	  "carried forward in the phase's context for the next agent" is the
   107	  sanctioned phrasing.
   108	- (T2) `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`
   109	  S25 anchor updated to the new brainstorm bullet text — one line, outside
   110	  the plan's stated scope, forced by ASD5's living-anchor test when the old
   111	  bullet was replaced. Treated as a discretionary call, not a scope change.
   112
   113	## Tracker projection
   114
   115	Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
   116	(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
   117	`blockedBy` T1. This doc remains canonical; the tracker is a projection.
bash: nl -ba docs/validation/sdlc-question-discipline/t1.json |...
bash: git diff --numstat main...HEAD; git status --porcelain=v2
bash: git show HEAD:.github/pull_request_template.md | sha256su...
     1	{
     2	  "schemaVersion": 1,
     3	  "taskId": "t1",
     4	  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
     5	  "repoRoot": ".",
     6	  "ownedScenarios": [],
     7	  "checks": [
     8	    {
     9	      "id": "tests.full",
    10	      "argv": ["npm", "test"],
    11	      "timeoutMs": 300000,
    12	      "evidence": ["Full corpus green with the new system-reference section (structural tests over references included)"]
    13	    },
    14	    {
    15	      "id": "static.lint",
    16	      "argv": ["npm", "run", "lint"],
    17	      "timeoutMs": 120000,
    18	      "evidence": ["Repository formatting and lint rules"]
    19	    },
    20	    {
    21	      "id": "standards.section-present",
    22	      "argv": ["grep", "-q", "Presenting questions to the human", "skills/sdlc/references/system-reference.md"],
    23	      "evidence": ["Shared question-presentation contract section exists (plan DoD 1)"]
    24	    },
    25	    {
    26	      "id": "standards.routing-row",
    27	      "argv": ["grep", "-q", "How does any phase ask the human for input?", "skills/sdlc/references/system-reference.md"],
    28	      "evidence": ["Next-read routing table routes to the new section (plan DoD 1)"]
    29	    },
    30	    {
    31	      "id": "patterns.no-tool-naming",
    32	      "argv": ["node", "-e", "const s=require('fs').readFileSync('skills/sdlc/references/system-reference.md','utf8'); if(/questions-helper|questions tool/i.test(s)){console.error('banned questions-tool naming present');process.exit(1)}"],
    33	      "evidence": ["Tool-dependent phrasing absent from the system reference (plan DoD 1/3)"]
    34	    },
    35	    {
    36	      "id": "patterns.diff",
    37	      "argv": ["git", "diff", "--check", "HEAD"],
    38	      "evidence": ["No whitespace-error banned patterns in the task diff"]
    39	    }
    40	  ],
    41	  "categories": {
    42	    "tests": {
    43	      "applicability": "required",
    44	      "checkIds": ["tests.full"]
    45	    },
     1	{
     2	  "schemaVersion": 1,
     3	  "taskId": "t2",
     4	  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
     5	  "repoRoot": ".",
     6	  "ownedScenarios": [],
     7	  "checks": [
     8	    {
     9	      "id": "tests.full",
    10	      "argv": ["npm", "test"],
    11	      "timeoutMs": 300000,
    12	      "evidence": ["Full corpus green with all six phase deltas (disposition-ledger anchor test included)"]
    13	    },
    14	    {
    15	      "id": "static.lint",
    16	      "argv": ["npm", "run", "lint"],
    17	      "timeoutMs": 120000,
    18	      "evidence": ["Repository formatting and lint rules"]
    19	    },
    20	    {
    21	      "id": "standards.all-six-deltas",
    22	      "argv": [
    23	        "node",
    24	        "-e",
    25	        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
    26	      ],
    27	      "evidence": ["Every phase reference layers its delta over the shared contract (plan DoD 2)"]
    28	    },
    29	    {
    30	      "id": "standards.pr-template-repo",
    31	      "argv": ["grep", "-q", "Assumptions & discretionary calls", ".github/pull_request_template.md"],
    32	      "evidence": ["Repo PR template carries the assumptions section (plan DoD 4)"]
    33	    },
    34	    {
    35	      "id": "standards.pr-template-asset",
    36	      "argv": ["grep", "-q", "Assumptions & discretionary calls", "skills/sdlc/assets/pull_request_template.md"],
    37	      "evidence": ["Setup-provisioned PR template carries the assumptions section (plan DoD 4)"]
    38	    },
    39	    {
    40	      "id": "standards.panel-input-naming",
    41	      "argv": ["grep", "-qF", "input to** the PR panel", "skills/sdlc/references/phase-pr-review.md"],
    42	      "evidence": ["phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"]
    43	    },
    44	    {
    45	      "id": "patterns.no-tool-naming",
    46	      "argv": [
    47	        "node",
    48	        "-e",
    49	        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
    50	      ],
    51	      "evidence": ["Tool-dependent phrasing absent across the skill (plan DoD 3)"]
    52	    },
    53	    {
    54	      "id": "patterns.diff",
    55	      "argv": ["git", "diff", "--check", "HEAD"],
    56	      "evidence": ["No whitespace-error banned patterns in the task diff"]
    57	    }
    58	  ],
    59	  "categories": {
    60	    "tests": {
    61	      "applicability": "required",
    62	      "checkIds": ["tests.full"]
    63	    },
{
  "id": "patterns.diff",
  "argv": [
    "git",
    "diff",
    "--check",
    "HEAD"
  ],
  "evidence": [
    "No whitespace-error banned patterns in the task diff"
  ],
  "status": "PASS",
  "exitCode": 0,
  "signal": null,
  "timedOut": false,
  "durationMs": 9,
  "stdoutTail": "",
  "stderrTail": ""
}
{
  "id": "patterns.diff",
  "argv": [
    "git",
    "diff",
    "--check",
    "HEAD"
  ],
  "evidence": [
    "No whitespace-error banned patterns in the task diff"
  ],
  "status": "PASS",
  "exitCode": 0,
  "signal": null,
  "timedOut": false,
  "durationMs": 15,
  "stdoutTail": "",
  "stderrTail": ""
}
6	0	.github/pull_request_template.md
117	0	docs/plans/2026-07-19-sdlc-question-discipline-build.md
156	0	docs/plans/2026-07-19-sdlc-question-discipline.md
48	0	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/generated-agent.md
63	0	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/manifest.json
12	0	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/receipt.json
160	0	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/runner-report.json
478	0	docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19/validator.md
48	0	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/generated-agent.md
81	0	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/manifest.json
12	0	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/receipt.json
199	0	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/runner-report.json
683	0	docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19/validator.md
1	1	docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
63	0	docs/validation/sdlc-question-discipline/t1.json
81	0	docs/validation/sdlc-question-discipline/t2.json
6	0	skills/sdlc/assets/pull_request_template.md
14	5	skills/sdlc/references/phase-brainstorm.md
22	0	skills/sdlc/references/phase-implement.md
20	0	skills/sdlc/references/phase-plan.md
48	7	skills/sdlc/references/phase-pr-review.md
18	0	skills/sdlc/references/phase-spec.md
17	0	skills/sdlc/references/phase-tasks.md
51	7	skills/sdlc/references/system-reference.md
1 .M N... 100644 100644 100644 54cd40017c3588506ba9eb5e248ec2c0a3a3b39e 54cd40017c3588506ba9eb5e248ec2c0a3a3b39e pr-body.md
17673d25ddff749b1fc11cc9d1d3931284d35e28283cf8600a88fb1aae168346  -
17673d25ddff749b1fc11cc9d1d3931284d35e28283cf8600a88fb1aae168346  -
bash: nl -ba docs/plans/2026-07-19-sdlc-question-discipline.md ...
    50	- At most one **Recommended — because <reason>** per question; never a
    51	  recommendation without a reason; never fabricated when genuinely neutral.
    52	- **Soft cap: 3–5 blocking questions per turn, uniform across phases.** Phase
    53	  deltas may only lower it. Overflow **demotes** (to assumption or parked),
    54	  never lengthens the block.
    55	- **Triage tiers** — every candidate question lands in exactly one:
    56	  - **Blocking**: asked now, in the block.
    57	  - **Assumption**: not asked; stated explicitly ("Proceeding on the assumption
    58	    that X — object now if wrong").
    59	  - **Parked**: one line + destination phase, carried in the phase handover.
    60	- **Never ask the human a fact the repo can answer** — legitimate questions are
    61	  about intent; a question about what the code does means the reading was
    62	  skipped. (Universal rule; Spec adds the `file:line` emphasis.)
    63	- The section is tool-agnostic. The existing §6 "Skills and tools are
    64	  enhancements" example language ("a questions-helper plugin", "a missing
    65	  questions tool") is neutralised to match.
    66	- §11 next-read routing table gains a row for the new section.
    67
    68	### Per-phase deltas
    69
    70	| Phase | Delta |
    71	|---|---|
    72	| Brainstorm | Replace the broken §1 bullet with a pointer to the shared contract. Recommendations must widen the option space, not steer it (free on mechanical questions, sparing on design direction). Map mode: a parked question **is** fog — it lands in "Not yet specified"; sharp parked questions become tickets. No assumption ledger (artifact-free phase; the Plan restates surviving assumptions). |
    73	| Plan | Questions must close a decision blocking a specific Plan-doc section. A question that would reopen the agreed design is presented as a **proposed backward transition** to Brainstorm, never smuggled into the block. Recommendations expected (their absence signals an un-agreed design). **Draft-first**: present the drafted doc with the block alongside; ask-first only when no credible draft is possible. Assumption tier → written into the doc (gate approval ratifies); Parked tier → the doc's "context for the next agent" section. Scope-boundary questions always carry enumerated alternatives. |
    74	| Spec | Inherits draft-first and tiers-map-onto-artifact. **Behavioural/edge-case questions must be posed as draft scenarios** (stable id, pass/fail, recommendation) ratified by exception — never open "what should happen when X?" questions. Blocking slots are reserved for genuinely open contract/surface decisions; the cap's escape valve is demotion into the draft. `file:line` grounding emphasis on the repo-discoverable-facts rule. |
    75	| Tasks/Build | Question block effectively banned: a blocking question resolves to either a proposed backward transition (upstream gap — the counterfeit-artifact rule's conversational twin) or an assumption (mechanical decomposition call, stated inline). Parked questions attach **per-task** in the build-plan doc entry and are projected into sub-issue bodies at tracker publish; the doc row is the source. |
    76	| Implement | Mid-task interrupts reserved for **external blockers only** (credentials, tooling, billing, permissions — class-based, no number). Everything else batches to the task boundary (validator seam) under the uniform cap; steady-state near zero because upstream flaws go backward and discretionary calls are the agent's, recorded as assumptions. Assumptions get a durable, PR-visible home: an **"Assumptions & discretionary calls"** section in the PR body (+ task close comment when tracker-backed). §10 gains: a dispatched worker's blocking question routes to the dispatching implementer, who applies the triage — one channel to the human. |
    77	| PR review | Escalations arrive **pre-adjudicated** as ratify/amend decisions: finding id + one-line gist + raising reviewers (agreement signal) + recommended disposition with reason. Only **proposed dismissals of high/medium findings** (plus anything touching a previously human-ratified residual-risk boundary) escalate; incorporations are just work. Escalation happens per fix wave, post-consolidation, never streamed, under the uniform cap; overflow means incorporate the cheap ones. **Human-ratified dismissals bind forward** across waves and sessions on the same finding class (recorded in `consolidated.md` with human-ratified attribution) unless new evidence emerges. The panel receives the PR body's assumptions section as named review input. |
    78
    79	## Scope
    80
    81	**In:**
    82
    83	- `skills/sdlc/references/system-reference.md` — new top-level section
    84	  ("Presenting questions to the human"), §6 example-language neutralisation,
    85	  §11 routing row.
    86	- All six `skills/sdlc/references/phase-*.md` — per-phase deltas above.
    87	- `skills/sdlc/assets/pull_request_template.md` and this repo's own
    88	  `.github/pull_request_template.md` — add an "Assumptions & discretionary
    89	  calls" section (empty-allowed), with `phase-pr-review.md` §4 wording that
    90	  names it as **panel input** while preserving the existing "the PR body does
    91	  not carry the local panel's development findings" rule.
    92	- The pre-existing uncommitted async-dispatch guidance in
    93	  `phase-pr-review.md` §5 (async `tasks:` dispatch + react-per-child polling)
    94	  — ratified at the plan gate as folded into this stream and carried as its
    95	  own commit on the feature branch.
    96
    97	**Out:**
    98
    99	- `SKILL.md` kernel (routing via system-reference §11 suffices; keeps the
   100	  frozen kernel surface untouched).
    42	| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 1/3/5 |
    43	| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` | required — section exists |
    44	| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` scoped check via `node -e` asserting the §11 routing row also matches (implementer projects exact argv) | required — routed |
    45	| bannedPatterns | `grep -ri "questions-helper" skills/sdlc/references/system-reference.md` and `grep -ri "questions tool" skills/sdlc/references/system-reference.md` | required — pattern must be ABSENT (runner's bannedPatterns semantics: the named pattern occurring is the failure) |
    46
    47	## T2 — Six phase deltas + PR-template assumptions section
    48
    49	**Objective.** Layer the per-phase deltas from the approved plan's "Agreed
    50	design" table onto the shared contract, as pointers-plus-delta (no
    51	restatement), in all six `skills/sdlc/references/phase-*.md`:
    52
    53	- **brainstorm**: replace the broken §1 questions bullet with a contract
    54	  pointer; recommendations widen-not-steer; map mode: parked = fog →
    55	  "Not yet specified"; no assumption ledger.
    56	- **plan**: questions close doc-section-blocking decisions; design-reopening
    57	  questions surface as proposed backward transitions; recommendations
    58	  expected; draft-first; assumption→in-doc / parked→"context for the next
    59	  agent"; scope questions always enumerated.
    60	- **spec**: behavioural/edge-case questions as draft scenarios (id, pass/fail,
    61	  recommendation, ratify-by-exception); blocking slots reserved for
    62	  contract/surface decisions; overflow demotes into the draft; `file:line`
    63	  emphasis on the repo-discoverable rule.
    64	- **tasks**: question block effectively banned (backward transition or
    65	  assumption); mechanical calls stated inline; parked questions attach
    66	  per-task in the build-plan doc, projected to sub-issue bodies; note the
    67	  build-plan **"Assumptions" appendix** contract (plan-ratified accrual home).
    68	- **implement**: mid-task interrupts = external blockers only (class-based);
    69	  all else batches to the validator seam; assumptions accrue in the build-plan
    70	  appendix and land in the PR body's "Assumptions & discretionary calls"
    71	  section (+ task close comment when tracker-backed); §10 gains
    72	  worker-questions-route-to-dispatcher.
    73	- **pr-review**: §5.4 escalation shape (pre-adjudicated ratify/amend: id,
    74	  gist, raising reviewers, recommended disposition + reason); only proposed
    75	  high/medium dismissals and ratified-residual-risk touches escalate;
    76	  per-wave post-consolidation under the cap; human-ratified dismissals bind
    77	  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
    78	  PR body's assumptions section as panel input **without weakening** the
    79	  no-development-findings-in-body rule.
    80
    81	Add the empty-allowed **"Assumptions & discretionary calls"** section to
    82	`skills/sdlc/assets/pull_request_template.md` and
    83	`.github/pull_request_template.md`.
    84
    85	**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
    86
    35	  grounding, and codebase exploration when the idea touches an existing pattern
    36	  the human might be unaware of or wrongly assuming is novel. This is
    37	  proportional, not mandatory ceremony — a brief brainstorm does not need a
    38	  research pass just to be brief.
    39	- **Present open questions per the shared contract** —
    40	  `references/system-reference.md`, "Presenting questions to the human": one
    41	  numbered end-of-reply block, enumerated alternatives, reasoned
    42	  recommendations, the uniform soft cap, and the Blocking/Assumption/Parked
    43	  triage tiers — never a wall of unstructured prose. Brainstorm's delta: a
    44	  recommendation must **widen the option space, not steer it** — recommend
    45	  freely on mechanical questions (where something should live), sparingly on
    46	  design direction (what something should be). Assumptions stated in dialogue
    47	  need no ledger here: Brainstorm commits no artifact, and the Plan restates
    48	  every assumption that survives.
    49	- **Expand and pressure-test, don't commandeer.** Contradictions and questions
    50	  exist to widen the human's option space, not to steer the design toward the
    51	  agent's own preferred answer. The human remains the owner of the direction;
    52	  the gate is *their* approval, not the agent's conviction.
   133	(`assets/tracker-ops.md`, "Claim by assignment"). Blocking uses the native
   134	`blockedBy` edge so the **frontier** — open, unblocked, unclaimed tickets — is
   135	visible without reopening a conversation.
   136
   137	**Fog of war.** Don't ticket what you can't yet phrase precisely. The test is
   138	whether the question is sharp now, not whether you can answer it now: ticket when
   139	it is already sharp (even if blocked); leave it in **Not yet specified** when you
   140	can't yet phrase it that sharply — write it as loosely as the view allows. A
   141	**parked** question (the shared contract's tier) is fog by another name: in map
   142	mode it lands in Not yet specified rather than a separate ledger, graduating to
   143	a ticket once sharp.
   144	Resolving a ticket clears the fog ahead of it, graduating whatever is now
   145	specifiable into fresh tickets, one at a time.
   146
   147	**Out of scope.** Work beyond the destination is not fog — it is out of scope,
   105	     scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
   106	     ```
   107
   108	     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
   109	     its task value with the exact review task: name the artifact paths, commit,
   110	     governing documents, grounding rule, and required findings-only output. Dispatch
   111	     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
   112	     not as a blocking call: a blocking multi-model dispatch only returns control after
   113	     every reviewer finishes, so a reviewer that crashes in the first second still sits
   114	     unactioned until the slowest sibling completes minutes later. Async dispatch
   115	     returns immediately with one run id/`asyncDir` covering every child in the panel.
   116	     Per-model attribution comes back on each task's `result.model` once you read it.
   117	     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
   118	     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
   119	     `cd`-ed cwd). Consult the project's governing documents (for example
   120	     `AGENTS.md`) for any local sub-agent gotchas.
   121	   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
   122	     stamps one prompt file across `--model` flags.
   123
   124	   Give each reviewer the exact inputs: the artifact under review, the upstream
   125	   artifacts it must be consistent with, the repo path and commit, the PR body's
   126	   "Assumptions & discretionary calls" section as named review material, and the
   127	   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   128	   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   129	   from the linked documents before dispatch; never send literal placeholders. On
   130	   the reversible track, provide the plan and Build plan only and explicitly state
   131	   that a Specification must not be demanded.
   132
   133	   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   134	   your toolset. If it is missing in a live pi session, the fix is a session reload
   135	   (the plugin registers tools at session start), NOT a switch to the detached path
   136	   or a claim that you are outside pi. For a read-only research fan-out inside a
   137	   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   138	   returns the brief inline) so children never block on a forbidden write. Prefer
   139	`wait({ all: true })` over status-polling for read-only fan-out, and read a
   140	child's transcript before treating a "detached" status label as lost output.
   141
   142	   **React per-child, not per-batch.** Once dispatched async, poll
   143	   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
   144	   once every child in that run finishes) at a short interval; a `wait({ id:
   145	   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
   146	   timeout returns control without stopping the run. Diff each poll's per-child
   147	   status against the last one: the moment any child shows an infra failure (see
   148	   below) rather than a verdict, act on it immediately — do not wait for the other
   149	   panelists still running. A replacement dispatch for that model is a brand-new,
   150	   separate async `subagent` single-agent call, not folded back into the original
   151	   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   152	   still going. Keep polling until every original child and every replacement is
   153	   accounted for.
   154
   155	   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   156	   candidate pool, not merely documentation. A reviewer that returns a model
   157	   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   158	   never silently replaced. A reviewer that fails before producing a verdict —
   159	   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   160	   failure, or empty output — is an infra failure: retry that model once when the
   161	   failure may be transient, then replace it with the next untried, credentialed
   162	   model in that phase's configured `prefer` list. Do not count a failed model
   163	   against the configured panel floor. Continue through the ordered candidate
   164	   pool until the panel floor is met or the pool is exhausted. Only then apply
   165	   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   166	   shortfall and continues. Never substitute an unconfigured model or treat an
   167	   infra failure as a reviewer verdict.
   168
   169	   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   170	   panel, record `panel.dispatched` and preserve the panel's artifacts with
   171	   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   172	   then `panel.consolidated` after adjudication — see
   173	   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
   174
   175	3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   176	   as signal, preserve genuine disagreement.
    42			else if (a === "--slug") opts.slug = val("--slug");
    43			else if (a === "--with-transcripts") opts.withTranscripts = true;
    44			else if (a === "--format") {
    45				const f = val("--format");
    46				if (f !== "text" && f !== "json") bail("--format must be text or json");
    47				opts.format = f;
    48			} else if (a === "--config") opts.config = val("--config");
    49			else if (a === "--repo-root") opts.repoRoot = val("--repo-root");
    50			else if (a === "-h" || a === "--help") opts.help = true;
    51			else bail(`unexpected argument: ${a}`);
    52		}
    53		return opts;
    54	}
    55
    56	function usage() {
    57		return "usage: harvest-panel.mjs --phase PANEL_PHASE --round N --from DIR [--slug S] [--with-transcripts] [--format text|json] [--config DIR|--repo-root DIR]";
    58	}
    59
    60	// Copy one file if present; return "copied" | "missed".
    61	function harvestFile(srcDir, name, destDir) {
    62		const src = join(srcDir, name);
    63		if (!existsSync(src) || !statSync(src).isFile()) return "missed";
    64		cpSync(src, join(destDir, name));
    65		return "copied";
    66	}
    67
   101			mkdirSync(destDir, { recursive: true });
   102		} catch (err) {
   103			bail(`cannot create destination directory: ${err?.message || err}`);
   104		}
   105
   106		const files = [];
   107		const missed = [];
   108		for (const name of ["status.json", "events.jsonl"]) {
   109			const status = harvestFile(opts.from, name, destDir);
   110			files.push({ name, status });
   111			if (status === "missed") missed.push(name);
   112		}
   113		if (opts.withTranscripts) {
   114			const status = harvestTranscripts(opts.from, destDir);
   115			files.push({ name: "transcripts", status });
   116			if (status === "missed") missed.push("transcripts");
   117		}
   118
   119		const relDir = relative(root, destDir);
   120		const report = { ok: true, phase: opts.phase, round, dir: relDir, files, missed };
   121
   122		if (opts.format === "json") {
   123			console.log(JSON.stringify(report, null, 2));
   124		} else {
   125			console.log(`harvested ${opts.phase} round ${round} -> ${relDir}`);
   126			for (const f of files) console.log(`  ${f.name}: ${f.status}`);
   127			if (missed.length > 0) console.log(`missed: ${missed.join(", ")}`);
   128		}
   129
### Async dispatch snapshots incomplete panel telemetry
- severity: medium
- confidence: high
- file: skills/sdlc/references/phase-pr-review.md
- line: 111-115, 169-173
- problem: Async dispatch returns before reviewers finish, yet the instructions immediately run a one-shot harvester; `harvest-panel.mjs:61-65,108-116` only copies the files’ current contents, so later events/results and separately dispatched replacements are not preserved.
- repro_or_impact: Start a slow async panel and harvest immediately as instructed; the destination remains an initial snapshot after the source updates, corrupting lifecycle telemetry.
- remediation: Harvest each async directory only after its children reach terminal states, with distinct destinations for replacement runs.
### Brainstorm restates the supposedly single-owned contract
- severity: low
- confidence: high
- file: skills/sdlc/references/phase-brainstorm.md
- line: 39-43
- problem: The phase repeats the shared block, alternatives, recommendation, cap, and tier rules despite the explicit “pointer-plus-delta, no restatement” requirement at `docs/plans/2026-07-19-sdlc-question-discipline-build.md:49-51` and single-owner claim at `skills/sdlc/references/system-reference.md:352-354`.
- repro_or_impact: A future shared-contract change can leave this second copy stale and cause Brainstorm to follow different rules from other phases.
- remediation: Keep only the section pointer and Brainstorm-specific delta.
### Validation’s diff check is vacuous
- severity: low
- confidence: high
- file: docs/validation/sdlc-question-discipline/t1.json
- line: 35-38
- problem: `git diff --check HEAD` examines uncommitted working-tree changes rather than the committed task diff, so both task receipts attest to a check that normally evaluates an empty diff; T2 repeats this at `docs/validation/sdlc-question-discipline/t2.json:53-56`.
- repro_or_impact: Both reports record PASS, while `git diff --check main...50c928643a377163ea472485127dab804e73f8e4` reports three trailing-whitespace errors in the committed review artifacts.
- remediation: Check an explicit task-base-to-task-HEAD range and regenerate whitespace-clean receipts.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Three concrete findings include severity, confidence, file, line, impact, and remediation."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "397 tests passed."
    },
    {
      "command": "npm run lint",
      "result": "passed",
      "summary": "Biome checked 144 files."
    },
    {
      "command": "node skills/sdlc/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .",
      "result": "passed",
      "summary": "Reversible declaration and Plan/Build artifacts passed."
    },
    {
      "command": "node skills/sdlc/scripts/verify-task-receipt.mjs --dir <T1> && node skills/sdlc/scripts/verify-task-receipt.mjs --dir <T2>",
      "result": "passed",
      "summary": "Both task receipts verified."
    },
    {
      "command": "git diff --check main...50c928643a377163ea472485127dab804e73f8e4",
      "result": "failed",
      "summary": "Three committed trailing-whitespace errors were reported."
    }
  ],
  "validationOutput": [
    "Lifecycle check passed without requiring a Specification.",
    "T1 and T2 receipt hashes and verdicts verified."
  ],
  "residualRisks": [
    "pr-body.md is an unstaged named review input and is not part of commit 50c9286."
  ],
  "noStagedFiles": true,
  "diffSummary": "Documentation-only lifecycle question discipline, async panel guidance, templates, plans, and validation evidence.",
  "reviewFindings": [
    "medium: skills/sdlc/references/phase-pr-review.md:111-115,169-173 - async panels are harvested before completion",
    "low: skills/sdlc/references/phase-brainstorm.md:39-43 - shared contract is restated despite single-owner requirement",
    "low: docs/validation/sdlc-question-discipline/t1.json:35-38 - diff validation checks the wrong range"
  ],
  "manualNotes": "No files were edited."
}
```
