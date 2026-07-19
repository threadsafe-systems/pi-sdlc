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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
50c9286 docs(sdlc): T2 validation receipt (runner PASS, validator PASS)
2699186 docs(sdlc): layer phase-shaped question deltas over the shared contract (T2, #117)
04b6876 docs(sdlc): T1 validation receipt (runner PASS, validator PASS)
244ec22 docs(sdlc): add shared question-presentation contract (T1, #116)
69e62eb docs(sdlc): build plan for question-presentation discipline
c759c20 docs(sdlc): plan for question-presentation discipline across phases
32ebaa1 docs(sdlc): dispatch review panels async and react per-child
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
<!-- pi-sdlc lifecycle declaration: choose irreversible, reversible, or none. Non-none tracks require a slug; none requires a reason. Link the governing documents below. -->
```sdlc
track: reversible
slug: sdlc-question-discipline
```
Teaches every lifecycle phase how to ask the human for input. One shared
question-presentation contract now lives in the system reference — single
end-of-reply numbered block, enumerated alternatives, reasoned
recommendations, a uniform 3–5 soft cap, and Blocking/Assumption/Parked
triage tiers — and each of the six phase references layers a phase-shaped
delta over it (divergent brainstorm through pre-adjudicated PR-review
escalations). The unactionable "questions tool" framing is removed: the
contract is tool-agnostic and degrades to plain prose. Also carries the
previously drafted async panel-dispatch guidance (react per-child) folded in
at the plan gate, and both PR templates gain the "Assumptions & discretionary
calls" section as named panel input.
## Governing documents
- Plan: `docs/plans/2026-07-19-sdlc-question-discipline.md`
- Build plan: `docs/plans/2026-07-19-sdlc-question-discipline-build.md`
- Reversible track — no Specification is required.
## Tracker references
- Epic: #115
- Tasks: Closes #116, Closes #117
- Board: pi-sdlc build board (org project 5)
## Assumptions & discretionary calls
Copied from the build-plan doc's "Assumptions" appendix:
- Two-task slicing (T1 shared contract → T2 phase deltas) with a native
  blockedBy edge; decomposition rationale recorded in the build plan.
- Shared-contract wording avoids the S2 generic-surface banned literals
  (e.g. "handover" is a loom-domain word); "carried forward in the phase's
  context for the next agent" is the sanctioned phrasing.
- Disposition-ledger S25 anchor updated to the reworded brainstorm bullet —
  one line outside the plan's stated scope, forced by ASD5's living-anchor
  test; treated as a discretionary call, not a scope change.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
diff --git a/skills/sdlc/references/system-reference.md b/skills/sdlc/references/system-reference.md
index d1c694e..8efa9cb 100644
--- a/skills/sdlc/references/system-reference.md
+++ b/skills/sdlc/references/system-reference.md
@@ -100,7 +100,7 @@ carries a `class`:
   `hooks` object, `.pi/sdlc/workflow.md`, the tracker board, and the generated
   consumer `.pi/sdlc/CONFIG.md`.
 - **`optional-enhancement`** — optional enhancements (e.g. `sdlc-visual-docs`
-  rendering, a questions-helper plugin).
+  rendering, an interactive question-answering aid).
 - **`internal`** — implementation internals: the `*.mjs` implementations behind
   `*.sh` wrappers and `scripts/lib.mjs`. These are summarized as implementation
   and are not catalogued file by file.
@@ -194,12 +194,13 @@ once by `assets/tracker-ops.md`.
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
@@ -282,6 +283,7 @@ trust model are recorded in ADR 0029.
 | What do those values mean here? | Current `.pi/sdlc/CONFIG.md`; validated JSON fallback when absent/stale |
 | What public surfaces comprise pi-sdlc? | `references/system-reference.md` + FS11 inventory |
 | What implementation realizes a surface? | Source, only when implementation work requires it |
+| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
 ## 12. Lifecycle telemetry (FS13)
@@ -345,3 +347,45 @@ true auto-resume, which is `pi`/`pi-coding-agent` runtime behaviour this
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
# Plan: Question-presentation discipline across SDLC phase prompts
- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible (ratified at the design gate, 2026-07-19)
- **Status:** rev1, approved (human gate per `overrides.reversible.review.design: human`)
## Objectives
1. Establish **one shared question-presentation contract** — owned once in
   `references/system-reference.md` — governing how any lifecycle phase asks the
   human for input: single end-of-reply numbered block, one question per item,
   enumerated alternatives, explicit reasoned recommendations, a uniform soft cap
   of 3–5 blocking questions per turn, and three triage tiers (Blocking /
   Assumption / Parked).
2. Give each of the six phase references a **phase-shaped delta** layered on that
   contract, so clarification behaviour matches each phase's character
   (divergent brainstorm → convergent plan → falsifiable spec → gateless build →
   interrupt-minimal implement → pre-adjudicated PR escalations).
3. **Remove the unactionable tool framing**: the current brainstorm bullet tells
   the agent to use "a tool for that (e.g. a questions-helper plugin)" — but
   `pi-questions-helper` is a user-side slash command, not an agent tool. The
   contract defines a structured format that interactive helpers can extract
   well, without naming or depending on any tool.
4. End **question bombardment**: overflow beyond the cap demotes to assumption or
   parked tiers — never a longer block — and repo-discoverable facts are never
   asked at all.
## Rationale
- The brainstorm reference's question-tool bullet is unactionable as written
  (the referenced plugin is human-invoked; the agent has no such tool), so
  agents silently degrade to unstructured question walls.
- Brainstorm is the **only** phase with any question-presentation guidance;
  plan/spec/tasks/implement/pr-review have none, yet plan/spec negotiation and
  PR-panel adjudication are where the human is bombarded hardest.
- The design was agreed in a full brainstorm dialogue (2026-07-19, this
  session) covering the shared contract plus all six phase deltas; every open
  question below was resolved by the human owner during that dialogue.
## Agreed design (carried from Brainstorm)
### Shared contract (new top-level section in `system-reference.md`)
- Single numbered question block, last thing in the reply; never scattered.
- One distinct question per item; one question per sentence; context line only
  when the bare question is ambiguous.
- Alternatives as a numbered list when they exist; never fabricated (no
  invented yes/no framing of genuinely open questions).
- At most one **Recommended — because <reason>** per question; never a
  recommendation without a reason; never fabricated when genuinely neutral.
- **Soft cap: 3–5 blocking questions per turn, uniform across phases.** Phase
  deltas may only lower it. Overflow **demotes** (to assumption or parked),
  never lengthens the block.
- **Triage tiers** — every candidate question lands in exactly one:
  - **Blocking**: asked now, in the block.
  - **Assumption**: not asked; stated explicitly ("Proceeding on the assumption
    that X — object now if wrong").
  - **Parked**: one line + destination phase, carried in the phase handover.
- **Never ask the human a fact the repo can answer** — legitimate questions are
  about intent; a question about what the code does means the reading was
  skipped. (Universal rule; Spec adds the `file:line` emphasis.)
- The section is tool-agnostic. The existing §6 "Skills and tools are
  enhancements" example language ("a questions-helper plugin", "a missing
  questions tool") is neutralised to match.
- §11 next-read routing table gains a row for the new section.
### Per-phase deltas
| Phase | Delta |
|---|---|
| Brainstorm | Replace the broken §1 bullet with a pointer to the shared contract. Recommendations must widen the option space, not steer it (free on mechanical questions, sparing on design direction). Map mode: a parked question **is** fog — it lands in "Not yet specified"; sharp parked questions become tickets. No assumption ledger (artifact-free phase; the Plan restates surviving assumptions). |
| Plan | Questions must close a decision blocking a specific Plan-doc section. A question that would reopen the agreed design is presented as a **proposed backward transition** to Brainstorm, never smuggled into the block. Recommendations expected (their absence signals an un-agreed design). **Draft-first**: present the drafted doc with the block alongside; ask-first only when no credible draft is possible. Assumption tier → written into the doc (gate approval ratifies); Parked tier → the doc's "context for the next agent" section. Scope-boundary questions always carry enumerated alternatives. |
| Spec | Inherits draft-first and tiers-map-onto-artifact. **Behavioural/edge-case questions must be posed as draft scenarios** (stable id, pass/fail, recommendation) ratified by exception — never open "what should happen when X?" questions. Blocking slots are reserved for genuinely open contract/surface decisions; the cap's escape valve is demotion into the draft. `file:line` grounding emphasis on the repo-discoverable-facts rule. |
| Tasks/Build | Question block effectively banned: a blocking question resolves to either a proposed backward transition (upstream gap — the counterfeit-artifact rule's conversational twin) or an assumption (mechanical decomposition call, stated inline). Parked questions attach **per-task** in the build-plan doc entry and are projected into sub-issue bodies at tracker publish; the doc row is the source. |
| Implement | Mid-task interrupts reserved for **external blockers only** (credentials, tooling, billing, permissions — class-based, no number). Everything else batches to the task boundary (validator seam) under the uniform cap; steady-state near zero because upstream flaws go backward and discretionary calls are the agent's, recorded as assumptions. Assumptions get a durable, PR-visible home: an **"Assumptions & discretionary calls"** section in the PR body (+ task close comment when tracker-backed). §10 gains: a dispatched worker's blocking question routes to the dispatching implementer, who applies the triage — one channel to the human. |
| PR review | Escalations arrive **pre-adjudicated** as ratify/amend decisions: finding id + one-line gist + raising reviewers (agreement signal) + recommended disposition with reason. Only **proposed dismissals of high/medium findings** (plus anything touching a previously human-ratified residual-risk boundary) escalate; incorporations are just work. Escalation happens per fix wave, post-consolidation, never streamed, under the uniform cap; overflow means incorporate the cheap ones. **Human-ratified dismissals bind forward** across waves and sessions on the same finding class (recorded in `consolidated.md` with human-ratified attribution) unless new evidence emerges. The panel receives the PR body's assumptions section as named review input. |
## Scope
**In:**
- `skills/sdlc/references/system-reference.md` — new top-level section
  ("Presenting questions to the human"), §6 example-language neutralisation,
  §11 routing row.
- All six `skills/sdlc/references/phase-*.md` — per-phase deltas above.
- `skills/sdlc/assets/pull_request_template.md` and this repo's own
  `.github/pull_request_template.md` — add an "Assumptions & discretionary
  calls" section (empty-allowed), with `phase-pr-review.md` §4 wording that
  names it as **panel input** while preserving the existing "the PR body does
  not carry the local panel's development findings" rule.
- The pre-existing uncommitted async-dispatch guidance in
  `phase-pr-review.md` §5 (async `tasks:` dispatch + react-per-child polling)
  — ratified at the plan gate as folded into this stream and carried as its
  own commit on the feature branch.
**Out:**
- `SKILL.md` kernel (routing via system-reference §11 suffices; keeps the
  frozen kernel surface untouched).
- All `scripts/`, `schema/`, `prompts/` files — no behaviourally-executed
  surface changes; the PR-review delta instructs the orchestrating agent to
  name the assumptions section in its dispatch task text rather than editing
  `prompts/adversary-pr.prompt.md`.
- `templates/sdlc-*.md` standalone entrypoints (verified: they route to the
  references and restate no question guidance).
- Any config schema or FS-numbered contract change (prose-only; FS5/FS8/FS9/
  FS10/FS13 untouched).
## Definition of done
1. `system-reference.md` contains the shared-contract section with the exact
   cap (3–5, uniform, deltas lower-only), the three tiers, the
   overflow-demotes rule, the repo-discoverable-facts rule, and no tool names;
   §11 routes to it; §6's example language no longer names a questions tool.
2. Each of the six phase references contains its delta, phrased as a layer on
   the shared contract (pointer, not restatement).
3. `grep -ri "questions-helper\|questions tool" skills/sdlc/` returns no
   matches.
4. Both PR templates contain the "Assumptions & discretionary calls" section;
   `phase-pr-review.md` §4 names it as panel input without weakening the
   no-findings-in-body rule.
5. Full test suite passes (`npm test`) and lint is clean — including any
   structural tests over the references.
6. The two brainstorm-identified tensions are resolved in the shipped text:
   (a) PR-body wording cannot be read as licence to put panel findings in the
   body; (b) the assumption-accrual point (below) is stated in
   `phase-implement.md`.
## Context for the next agent (including parked questions)
- **Assumption-accrual home (parked from Brainstorm, resolved here as a
  proposed decision):** assumptions accrue during Implement as an
  **"Assumptions" appendix of the build-plan doc** (which exists on both
  tracks and below the tracker threshold), appended per task; PR preparation
  copies the appendix into the PR body section. Gate approval of this plan
  ratifies that choice.
- **Parked to Implement:** whether any existing structural tests assert
  section counts/ordering in `system-reference.md` — discover by running the
  suite before editing; adjust expectations only where the test encodes
  structure rather than behaviour.
- The previously uncommitted async-dispatch diff in `phase-pr-review.md` is
  folded into this stream (gate decision) and committed first on the feature
  branch, so all later edits to that file build on it.
- Reviewer-facing precedent: PR #17 finding-11 and PR #114's reuse of it are
  the motivating examples for the binding-dismissals rule.
## Assumptions ratified by approving this plan
1. Track is **reversible** (prose-only change to skill documentation surfaces;
   trivially revertable; freezes no schema, wire format, or executed
   contract). Under `overrides.reversible`, `review.design: human` — this
   human gate, no plan panel, and no separate Spec phase.
2. The PR-template addition is in scope now (both copies), not parked.
3. Assumption-accrual home is the build-plan appendix, as above.
4. Slug `sdlc-question-discipline`; branch `feat/sdlc-question-discipline`.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
diff --git a/skills/sdlc/references/phase-brainstorm.md b/skills/sdlc/references/phase-brainstorm.md
index fd99f8b..2982aab 100644
--- a/skills/sdlc/references/phase-brainstorm.md
+++ b/skills/sdlc/references/phase-brainstorm.md
@@ -36,10 +36,16 @@ Concrete behaviour, not just tone:
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
@@ -131,7 +137,10 @@ visible without reopening a conversation.
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
diff --git a/skills/sdlc/references/phase-plan.md b/skills/sdlc/references/phase-plan.md
index 28da500..4490875 100644
--- a/skills/sdlc/references/phase-plan.md
+++ b/skills/sdlc/references/phase-plan.md
@@ -37,6 +37,26 @@ Produce the Plan doc: **objectives, rationale, scope in/out, definition of done,
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
diff --git a/skills/sdlc/references/phase-spec.md b/skills/sdlc/references/phase-spec.md
index 8b1bc54..de3eb39 100644
--- a/skills/sdlc/references/phase-spec.md
+++ b/skills/sdlc/references/phase-spec.md
@@ -47,6 +47,24 @@ Produce the Spec doc: **contracts, interfaces, surface area, functional and
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
diff --git a/skills/sdlc/references/phase-tasks.md b/skills/sdlc/references/phase-tasks.md
index ba680a8..d074066 100644
--- a/skills/sdlc/references/phase-tasks.md
+++ b/skills/sdlc/references/phase-tasks.md
@@ -41,6 +41,23 @@ objectives, rationale, check commands, and scenario ids per task. Its home route
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
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
diff --git a/.github/pull_request_template.md b/.github/pull_request_template.md
index 909ceb3..2780304 100644
--- a/.github/pull_request_template.md
+++ b/.github/pull_request_template.md
@@ -21,3 +21,9 @@ Build` and explain briefly.
 - Epic: `#<epic-issue>`
 - Tasks: `#<task-issue>`, `#<task-issue>`
 - Board: `<TRACKER_BOARD>`
+
+## Assumptions & discretionary calls
+
+Assumptions and discretionary implementation choices accrued during Implement,
+copied from the build-plan doc's "Assumptions" appendix. Review input for the
+PR panel — not a place for panel findings. Write `None` when nothing accrued.
diff --git a/skills/sdlc/assets/pull_request_template.md b/skills/sdlc/assets/pull_request_template.md
index 909ceb3..2780304 100644
--- a/skills/sdlc/assets/pull_request_template.md
+++ b/skills/sdlc/assets/pull_request_template.md
@@ -21,3 +21,9 @@ Build` and explain briefly.
 - Epic: `#<epic-issue>`
 - Tasks: `#<task-issue>`, `#<task-issue>`
 - Board: `<TRACKER_BOARD>`
+
+## Assumptions & discretionary calls
+
+Assumptions and discretionary implementation choices accrued during Implement,
+copied from the build-plan doc's "Assumptions" appendix. Review input for the
+PR panel — not a place for panel findings. Write `None` when nothing accrued.
diff --git a/skills/sdlc/references/phase-implement.md b/skills/sdlc/references/phase-implement.md
index 8456824..d244541 100644
--- a/skills/sdlc/references/phase-implement.md
+++ b/skills/sdlc/references/phase-implement.md
@@ -46,6 +46,24 @@ Produce code and tests on the feature branch (worktree or checkout per the
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
@@ -135,6 +153,10 @@ surface directly, give it the same shape every time:
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
diff --git a/skills/sdlc/references/phase-pr-review.md b/skills/sdlc/references/phase-pr-review.md
index ce1895e..cbdd9f1 100644
--- a/skills/sdlc/references/phase-pr-review.md
+++ b/skills/sdlc/references/phase-pr-review.md
@@ -43,6 +43,12 @@ shared board. Add `Closes #<task-issue>` for each task completed by merging the
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
@@ -101,17 +107,23 @@ hand-copy a prompt per model.
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
@@ -127,6 +139,19 @@ hand-copy a prompt per model.
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
@@ -155,6 +180,22 @@ child's transcript before treating a "detached" status label as lost output.
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
 10 files changed, 1784 insertions(+)
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
---
no matches
---
10:## 1. Purpose
19:## 2. Kernel — invariant guarantees and the two tracks
39:## 3. Adoption & readiness
60:## 4. Tracks, phases, transitions, gates, refusal
83:## 5. Public composition inventory (FS11 taxonomy)
114:## 6. Configuration & extension surfaces
210:## 7. Artifacts & durable evidence
222:## 8. Normal full-lifecycle operation and the six standalone entrypoints
240:## 9. Advanced modes
253:## 10. Operational troubleshooting and the source-inspection boundary
275:## 11. Next-read routing (authority map)
288:## 12. Lifecycle telemetry (FS13)
333:## 13. Stall detection and self-resume
350:## 14. Presenting questions to the human
# Build plan: Question-presentation discipline (sdlc-question-discipline)
- **Slug:** `sdlc-question-discipline`
- **Date:** 2026-07-19
- **Track:** reversible — no Specification; tasks map to the Plan's
  definition-of-done items (never re-derived).
- **Governing plan:** `docs/plans/2026-07-19-sdlc-question-discipline.md`
  (rev1, approved at the human design gate 2026-07-19)
- **Branch:** `feat/sdlc-question-discipline`
## Decomposition rationale (assumption-tier, stated inline)
Sliced as **two tasks**: the shared contract must land before the six
phase deltas that point at it (a real content dependency, wired as a
`blockedBy` edge), while the deltas + template edits are one coherent slice
because every delta is a thin layer over the same contract and splitting them
six ways would multiply validation ceremony with no independence gained.
Object via a Build correction if this slicing is wrong.
## T1 — Shared question-presentation contract in `system-reference.md`
**Objective.** Add the new top-level section **"Presenting questions to the
human"** to `skills/sdlc/references/system-reference.md` (appended after §13 as
§14; no renumbering of §1–13): single end-of-reply numbered block; one distinct
question per item, one question per sentence; context line only when needed;
enumerated alternatives, never fabricated; at most one reasoned recommendation
per question, never fabricated; **uniform soft cap 3–5 blocking questions per
turn, deltas may only lower it; overflow demotes, never lengthens**; triage
tiers **Blocking / Assumption / Parked**; **never ask a repo-discoverable
fact**; explicitly tool-agnostic. Update §6 "Skills and tools are enhancements"
to neutral example language (no "questions-helper plugin" / "questions tool").
Add a §11 routing-table row for the new section.
**Satisfies plan DoD:** items 1, 3 (system-reference share), 5.
**Checks (exact commands; PV1 manifest projected from this table):**
| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required — full suite green (catches structural tests over references) |
| static | `npx biome check .` | required — repo lint |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 1/3/5 |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` | required — section exists |
| standards | `grep -q "Presenting questions to the human" skills/sdlc/references/system-reference.md` scoped check via `node -e` asserting the §11 routing row also matches (implementer projects exact argv) | required — routed |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc/references/system-reference.md` and `grep -ri "questions tool" skills/sdlc/references/system-reference.md` | required — pattern must be ABSENT (runner's bannedPatterns semantics: the named pattern occurring is the failure) |
## T2 — Six phase deltas + PR-template assumptions section
**Objective.** Layer the per-phase deltas from the approved plan's "Agreed
design" table onto the shared contract, as pointers-plus-delta (no
restatement), in all six `skills/sdlc/references/phase-*.md`:
- **brainstorm**: replace the broken §1 questions bullet with a contract
  pointer; recommendations widen-not-steer; map mode: parked = fog →
  "Not yet specified"; no assumption ledger.
- **plan**: questions close doc-section-blocking decisions; design-reopening
  questions surface as proposed backward transitions; recommendations
  expected; draft-first; assumption→in-doc / parked→"context for the next
  agent"; scope questions always enumerated.
- **spec**: behavioural/edge-case questions as draft scenarios (id, pass/fail,
  recommendation, ratify-by-exception); blocking slots reserved for
  contract/surface decisions; overflow demotes into the draft; `file:line`
  emphasis on the repo-discoverable rule.
- **tasks**: question block effectively banned (backward transition or
  assumption); mechanical calls stated inline; parked questions attach
  per-task in the build-plan doc, projected to sub-issue bodies; note the
  build-plan **"Assumptions" appendix** contract (plan-ratified accrual home).
- **implement**: mid-task interrupts = external blockers only (class-based);
  all else batches to the validator seam; assumptions accrue in the build-plan
  appendix and land in the PR body's "Assumptions & discretionary calls"
  section (+ task close comment when tracker-backed); §10 gains
  worker-questions-route-to-dispatcher.
- **pr-review**: §5.4 escalation shape (pre-adjudicated ratify/amend: id,
  gist, raising reviewers, recommended disposition + reason); only proposed
  high/medium dismissals and ratified-residual-risk touches escalate;
  per-wave post-consolidation under the cap; human-ratified dismissals bind
  forward (recorded in `consolidated.md`) unless new evidence; §4 names the
  PR body's assumptions section as panel input **without weakening** the
  no-development-findings-in-body rule.
Add the empty-allowed **"Assumptions & discretionary calls"** section to
`skills/sdlc/assets/pull_request_template.md` and
`.github/pull_request_template.md`.
**Satisfies plan DoD:** items 2, 3 (remainder), 4, 5, 6.
**Blocked by:** T1 (the pointer target must exist).
**Checks (exact commands; PV1 manifest projected from this table):**
| Category | Command (argv) | Requirement |
|---|---|---|
| tests | `npm test` | required |
| static | `npx biome check .` | required |
| scenarios | — | n/a: reversible track, no Specification; this task maps to plan DoD items 2/3/4/5/6 |
| standards | `grep -l "Presenting questions to the human" skills/sdlc/references/phase-brainstorm.md skills/sdlc/references/phase-plan.md skills/sdlc/references/phase-spec.md skills/sdlc/references/phase-tasks.md skills/sdlc/references/phase-implement.md skills/sdlc/references/phase-pr-review.md` (all six must match; implementer projects the exact all-six assertion argv) | required — every phase delta points at the contract |
| standards | `grep -q "Assumptions & discretionary calls" .github/pull_request_template.md` and same for `skills/sdlc/assets/pull_request_template.md` | required — both templates carry the section |
| bannedPatterns | `grep -ri "questions-helper" skills/sdlc` and `grep -ri "questions tool" skills/sdlc` | required — patterns must be ABSENT across the skill |
## Assumptions (appendix — accrues during Implement; copied into the PR body)
- (build-time) Two-task slicing and the T1→T2 edge, per the decomposition
  rationale above.
- (T1) The shared-contract section wording avoids the repo's S2
  generic-surface banned literals (e.g. the word "handover" is loom-domain);
  "carried forward in the phase's context for the next agent" is the
  sanctioned phrasing.
- (T2) `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md`
  S25 anchor updated to the new brainstorm bullet text — one line, outside
  the plan's stated scope, forced by ASD5's living-anchor test when the old
  bullet was replaced. Treated as a discretionary call, not a scope change.
## Tracker projection
Threshold met (2 tasks ≥ `shape.publishToTracker: 2`): one epic
(`sdlc:epic`) + two sub-issues (`sdlc:build-task`) on board 5, T2 wired
`blockedBy` T1. This doc remains canonical; the tracker is a projection.
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
# Phase reference: PR review
> Detailed public contract for the PR phase. This reference is also the **single
> owner** of the shared panel run-shape (resolve → dispatch → consolidate →
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
It **does** carry an **"Assumptions & discretionary calls"** section
(provisioned by the PR template, empty-allowed): the assumptions accrued during
Implement, copied from the build-plan doc's appendix
(`references/phase-implement.md`). That section is **input to** the PR panel —
named review material for the judgement pass — never a channel for panel
findings; the no-development-findings rule above is unchanged.
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
     governing documents, grounding rule, and required findings-only output. Dispatch
     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
     not as a blocking call: a blocking multi-model dispatch only returns control after
     every reviewer finishes, so a reviewer that crashes in the first second still sits
     unactioned until the slowest sibling completes minutes later. Async dispatch
     returns immediately with one run id/`asyncDir` covering every child in the panel.
     Per-model attribution comes back on each task's `result.model` once you read it.
     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
     `cd`-ed cwd). Consult the project's governing documents (for example
     `AGENTS.md`) for any local sub-agent gotchas.
   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
     stamps one prompt file across `--model` flags.
   Give each reviewer the exact inputs: the artifact under review, the upstream
   artifacts it must be consistent with, the repo path and commit, the PR body's
   "Assumptions & discretionary calls" section as named review material, and the
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
   **React per-child, not per-batch.** Once dispatched async, poll
   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
   once every child in that run finishes) at a short interval; a `wait({ id:
   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
   timeout returns control without stopping the run. Diff each poll's per-child
   status against the last one: the moment any child shows an infra failure (see
   below) rather than a verdict, act on it immediately — do not wait for the other
   panelists still running. A replacement dispatch for that model is a brand-new,
   separate async `subagent` single-agent call, not folded back into the original
   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   still going. Keep polling until every original child and every replacement is
   accounted for.
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
   Escalate disputes to the human per the shared contract
   (`references/system-reference.md`, "Presenting questions to the human") with
   the PR delta: escalations reach the human **once per fix wave, after
   consolidation, never streamed as reviewers return**, and arrive
   **pre-adjudicated** as ratify/amend decisions — each escalated finding
   carries its id, a one-line gist, the reviewers who raised it (cross-model
   agreement is signal), and the agent's recommended disposition with its
   reason. Only **proposed dismissals of high or medium findings** — plus
   anything touching a previously human-ratified residual-risk boundary —
   escalate; incorporating a finding is agreement and needs no permission.
   Overflow past the cap usually means incorporate the cheap ones rather than
   argue them. A **human-ratified dismissal binds forward**: record it in
   `consolidated.md` with its human-ratified attribution and do not re-litigate
   the same finding class in later waves or later sessions unless new evidence
   emerges.
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
diff --git a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
index 90b1252..25e0e47 100644
--- a/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
+++ b/docs/validation/sdlc-agent-self-documentation/disposition-ledger.md
@@ -54,7 +54,7 @@ anchor check.
 | S22 | Brainstorm is live dialogue; rubber-duck | moved | skills/sdlc/references/phase-brainstorm.md | rubber-duck the idea, not agree with it |
 | S23 | Raise a contradiction or say there isn't one | moved | skills/sdlc/references/phase-brainstorm.md | Raise a contradiction, or say there isn't one |
 | S24 | Use tools, proportional not mandatory | moved | skills/sdlc/references/phase-brainstorm.md | proportional, not mandatory ceremony |
-| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present multiple open questions in a structured form |
+| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present open questions per the shared contract |
 | S26 | Expand and pressure-test, don't commandeer | moved | skills/sdlc/references/phase-brainstorm.md | Expand and pressure-test, don't commandeer |
 | S27 | Map mode: switch when large/foggy | moved | skills/sdlc/references/phase-brainstorm.md | wayfinder-lite |
 | S28 | The map issue is the canonical resumable artifact | moved | skills/sdlc/references/phase-brainstorm.md | resumable artifact for the effort, not a doc |
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
# Phase reference: Implement
> Detailed public contract for the Implement phase. `SKILL.md` owns the kernel
> and phase sequence; this reference owns Implement's mechanics, including the
> per-task validator. Paths are skill-relative. Every configuration-dependent
> branch is an explicit **under your configuration** callout routed to the
> effective shape (current `.pi/sdlc/CONFIG.md`, or authoritative
> `sdlc.config.json` when absent/stale).
## 1. Purpose and invocation modes
Implement turns the vetted Build breakdown into code and tests on the feature
branch. It runs two ways:
- **Full lifecycle:** entered after an approved Build breakdown.
- **Standalone entrypoint `sdlc:implement`** (`templates/sdlc-implement.md`):
  needs committed tasks/build with named checks. With absent upstream it
  **always refuses-with-redirect** in both adoption states and **never fabricates
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
**Dialogue discipline.** Implement lowers the interrupt surface of the shared
contract (`references/system-reference.md`,
"Presenting questions to the human") to near zero:
- **Mid-task interrupts are reserved for external blockers only** — missing
  credentials, broken or absent tooling, billing/rate exhaustion, permissions:
  cases where proceeding is impossible and no repository reading helps.
- Everything else batches to the **task boundary** (the validator seam) under
  the uniform cap. Expected steady state is near zero: an upstream flaw is a
  backward transition (§6), and a discretionary implementation choice the
  upstream deliberately left open is the agent's call, recorded as an
  assumption — asking the human to make it is ceremony, not care.
- Assumptions accrue in the build-plan doc's **"Assumptions" appendix** as
  tasks complete (plus the task's close comment when tracker-backed) and are
  copied into the PR body's **"Assumptions & discretionary calls"** section at
  PR preparation, where the panel reads them as review input
  (`references/phase-pr-review.md`).
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
surface PV2) — not the model — validates the manifest, executes only its declared
argv with no shell, evaluates categories and scenarios, bounds and redacts command
evidence, and returns `PASS` (exit 0), `FAIL` (exit 1), or `ERROR` (exit 2).
Build, not the validator, owns which commands run and which categories are `n/a`;
the validator cannot invent a command, weaken a check, or decide applicability.
Under `subagent`, the validator subagent (`prompts/validator-task.prompt.md`) runs
the runner, confirms exit and report verdict agree, and reports each result; under
`self` the implementer runs the runner directly. A nonzero runner result blocks
task completion; a task is not done until the runner returns PASS. Each task stores
a runtime receipt (manifest copy, runner report, hashes, verdicts, plus the
generated-agent copy and model under `subagent`) under
`docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verifiable with
`scripts/verify-task-receipt.mjs`. Judgement review happens later at the PR panel.
> **Under your configuration:** the task-validator model preference is
> `deepseek/deepseek-v4-flash`, then `anthropic/claude-haiku-4-5` — a `:low` (or
> `:off`) thinking suffix fits this checklist-executor role. The effective roster
> resolves from the committed `panels` block via `resolve-panel task_validate`.
## 6. Refusal and backward-transition behaviour
Standalone `sdlc:implement` refuses-with-redirect when its committed
tasks/build upstream is absent. A failing validator blocks the task, not the
whole lifecycle. Backward transition to Build/Spec is always allowed when
implementation reveals an upstream flaw.
## 7. After-hook order and warning semantics
Fire `hooks.implement.after` (and `hooks."*"`) after each unit of work:
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
- **Workers never triage for themselves.** A dispatched worker's blocking
  question returns to the dispatching implementer — its stop-condition and
  budget shape already imply this — and the implementer applies the shared
  contract's triage tiers. One channel to the human, never one per worker.
- **Infra failure gets one automatic retry; no verdict does.** If a
  dispatched worker's run ends in an **infra-class failure** — a process
  crash, an out-of-memory kill, overload or billing exhaustion, a provider
  timeout, a transport/tool error, or empty output — that is infrastructure
  noise, not a REVISE/FAIL verdict from the model. Retry that exact dispatch once, automatically, before treating it as
  needing human attention. A second consecutive infra failure on the same
  dispatch, or any model-authored verdict, surfaces to the human as normal —
  never silently retried away.
deps-ok
 M pr-body.md
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
skills/sdlc/references/phase-tasks.md:12:## 1. Purpose and invocation modes
skills/sdlc/references/phase-tasks.md:25:## 2. Entry conditions and authoritative upstream inputs
skills/sdlc/references/phase-tasks.md:31:## 3. Configured before-hook order and blocking semantics
skills/sdlc/references/phase-tasks.md:37:## 4. Required activity and artifact/output shape
skills/sdlc/references/phase-tasks.md:64:## 5. Invariant gate/approval seam
skills/sdlc/references/phase-tasks.md:73:## 6. Refusal and backward-transition behaviour
skills/sdlc/references/phase-tasks.md:80:## 7. After-hook order and warning semantics
skills/sdlc/references/phase-tasks.md:85:## 8. Completion evidence and next transition
skills/sdlc/references/phase-tasks.md:90:## 9. Advanced-mode pointers — tracker-backed Build (epic + sub-issues + board)
skills/sdlc/references/phase-plan.md:10:## 1. Purpose and invocation modes
skills/sdlc/references/phase-plan.md:20:## 2. Entry conditions and authoritative upstream inputs
skills/sdlc/references/phase-plan.md:25:## 3. Configured before-hook order and blocking semantics
skills/sdlc/references/phase-plan.md:34:## 4. Required activity and artifact/output shape
skills/sdlc/references/phase-plan.md:63:## 5. Invariant gate/approval seam
skills/sdlc/references/phase-plan.md:81:## 6. Refusal and backward-transition behaviour
skills/sdlc/references/phase-plan.md:86:## 7. After-hook order and warning semantics
skills/sdlc/references/phase-plan.md:91:## 8. Completion evidence and next transition
skills/sdlc/references/phase-plan.md:103:## 9. Advanced-mode pointers
---
d528b97 test(e2e): sandboxed end-to-end integration harness (L1 + L2) (#100)
a6b9d80 feat(config): intent vocabulary schemaVersion 3 (IC-A) (#92)
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
✔ PV9: --report writes the exact JSON bytes atomically (390.564853ms)
✔ PV9: --report outside the repo root is refused and clobbers nothing (391.945479ms)
✔ PV10: generic validator law and generated agent are portable (0.843712ms)
✔ PV11: receipt hash verification detects mutation of any stored file (8.473464ms)
✔ PV11: a FAIL runner-report cannot ride under runnerVerdict PASS (4.599953ms)
✔ parseArgs: recognises JSON anywhere and rejects bad flags (0.682791ms)
✔ PV13: renderText is a faithful projection of the report (247.975104ms)
ℹ tests 397
ℹ suites 0
ℹ pass 397
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 20017.959597
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
{
  "schemaVersion": 1,
  "taskId": "t2",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": ["npm", "test"],
      "timeoutMs": 300000,
      "evidence": ["Full corpus green with all six phase deltas (disposition-ledger anchor test included)"]
    },
    {
      "id": "static.lint",
      "argv": ["npm", "run", "lint"],
      "timeoutMs": 120000,
      "evidence": ["Repository formatting and lint rules"]
    },
    {
      "id": "standards.all-six-deltas",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs');const files=['phase-brainstorm','phase-plan','phase-spec','phase-tasks','phase-implement','phase-pr-review'].map(f=>'skills/sdlc/references/'+f+'.md');const missing=files.filter(f=>!fs.readFileSync(f,'utf8').includes('Presenting questions to the human'));if(missing.length){console.error('missing contract pointer: '+missing.join(', '));process.exit(1)}"
      ],
      "evidence": ["Every phase reference layers its delta over the shared contract (plan DoD 2)"]
    },
    {
      "id": "standards.pr-template-repo",
      "argv": ["grep", "-q", "Assumptions & discretionary calls", ".github/pull_request_template.md"],
      "evidence": ["Repo PR template carries the assumptions section (plan DoD 4)"]
    },
    {
      "id": "standards.pr-template-asset",
      "argv": ["grep", "-q", "Assumptions & discretionary calls", "skills/sdlc/assets/pull_request_template.md"],
      "evidence": ["Setup-provisioned PR template carries the assumptions section (plan DoD 4)"]
    },
    {
      "id": "standards.panel-input-naming",
      "argv": ["grep", "-qF", "input to** the PR panel", "skills/sdlc/references/phase-pr-review.md"],
      "evidence": ["phase-pr-review names the section as panel input without weakening the no-findings rule (plan DoD 4/6)"]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": [
        "node",
        "-e",
        "const fs=require('fs'),path=require('path');const walk=(d)=>fs.readdirSync(d,{withFileTypes:true}).flatMap((e)=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p];});const bad=walk('skills/sdlc').filter((f)=>/questions-helper|questions tool/i.test(fs.readFileSync(f,'latin1')));if(bad.length){console.error('banned naming in: '+bad.join(', '));process.exit(1);}"
      ],
      "evidence": ["Tool-dependent phrasing absent across the skill (plan DoD 3)"]
    },
    {
      "id": "patterns.diff",
      "argv": ["git", "diff", "--check", "HEAD"],
      "evidence": ["No whitespace-error banned patterns in the task diff"]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": ["tests.full"]
    },
    "static": {
      "applicability": "required",
      "checkIds": ["static.lint"]
    },
    "scenarios": {
      "applicability": "n/a",
      "reason": "Reversible track: no Specification exists; T2 maps to approved plan DoD items 2/3/4/5/6 per the build plan's T2 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": ["standards.all-six-deltas", "standards.pr-template-repo", "standards.pr-template-asset", "standards.panel-input-naming"]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    }
  }
}
{
  "schemaVersion": 1,
  "taskId": "t1",
  "buildPlan": "docs/plans/2026-07-19-sdlc-question-discipline-build.md",
  "repoRoot": ".",
  "ownedScenarios": [],
  "checks": [
    {
      "id": "tests.full",
      "argv": ["npm", "test"],
      "timeoutMs": 300000,
      "evidence": ["Full corpus green with the new system-reference section (structural tests over references included)"]
    },
    {
      "id": "static.lint",
      "argv": ["npm", "run", "lint"],
      "timeoutMs": 120000,
      "evidence": ["Repository formatting and lint rules"]
    },
    {
      "id": "standards.section-present",
      "argv": ["grep", "-q", "Presenting questions to the human", "skills/sdlc/references/system-reference.md"],
      "evidence": ["Shared question-presentation contract section exists (plan DoD 1)"]
    },
    {
      "id": "standards.routing-row",
      "argv": ["grep", "-q", "How does any phase ask the human for input?", "skills/sdlc/references/system-reference.md"],
      "evidence": ["Next-read routing table routes to the new section (plan DoD 1)"]
    },
    {
      "id": "patterns.no-tool-naming",
      "argv": ["node", "-e", "const s=require('fs').readFileSync('skills/sdlc/references/system-reference.md','utf8'); if(/questions-helper|questions tool/i.test(s)){console.error('banned questions-tool naming present');process.exit(1)}"],
      "evidence": ["Tool-dependent phrasing absent from the system reference (plan DoD 1/3)"]
    },
    {
      "id": "patterns.diff",
      "argv": ["git", "diff", "--check", "HEAD"],
      "evidence": ["No whitespace-error banned patterns in the task diff"]
    }
  ],
  "categories": {
    "tests": {
      "applicability": "required",
      "checkIds": ["tests.full"]
    },
    "static": {
      "applicability": "required",
      "checkIds": ["static.lint"]
    },
    "scenarios": {
      "applicability": "n/a",
      "reason": "Reversible track: no Specification exists; T1 maps to approved plan DoD items 1/3/5 per the build plan's T1 check table."
    },
    "standards": {
      "applicability": "required",
      "checkIds": ["standards.section-present", "standards.routing-row"]
    },
    "bannedPatterns": {
      "applicability": "required",
      "checkIds": ["patterns.no-tool-naming", "patterns.diff"]
    }
  }
}
skills/sdlc/references/phase-tasks.md:23:  ids or check tables** (the counterfeit-artifact rule).
skills/sdlc/references/phase-tasks.md:48:proposed backward transition (§6). This is the counterfeit-artifact rule's
---
17:export const CATEGORY_ORDER = ["tests", "static", "scenarios", "standards", "bannedPatterns"];
18:const COMMAND_CATEGORIES = ["tests", "static", "standards", "bannedPatterns"];
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
30:    "lint": "biome check .",
task-validate-sdlc-question-discipline-t1-2026-07-19
task-validate-sdlc-question-discipline-t2-2026-07-19
verify-task-receipt: unexpected argument: docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19
verify-task-receipt: unexpected argument: docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
usage: verify-task-receipt.mjs --dir RECEIPT_DIR
verify-task-receipt: unexpected argument: --receipt
verify-task-receipt: unexpected argument: --receipt
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
receipt verified: docs/reviews/task-validate-sdlc-question-discipline-t1-2026-07-19
receipt verified: docs/reviews/task-validate-sdlc-question-discipline-t2-2026-07-19
read: /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-qu...
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
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
## Assumptions & discretionary calls
Assumptions and discretionary implementation choices accrued during Implement,
copied from the build-plan doc's "Assumptions" appendix. Review input for the
PR panel — not a place for panel findings. Write `None` when nothing accrued.
> pi-sdlc@0.1.1 lint
> biome check .
Checked 144 files in 319ms. No fixes applied.
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
test/extraction.test.js:66:	const alt = /loom|rundriver|northstar|handover|conveyanc|clc|build board|threadsafe-systems|adapter boundary|sdlc-artifacts/i;
---
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
139:`wait({ all: true })` over status-polling for read-only fan-out, and read a
142:   **React per-child, not per-batch.** Once dispatched async, poll
143:   `subagent({ action: "status", id: <asyncId> })` (not `wait`, which only unblocks
145:   <asyncId>, timeoutMs: 20000 })` call doubles as that interval's sleep, since a
111:     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
139:`wait({ all: true })` over status-polling for read-only fan-out, and read a
---
373:**The budget.** At most **3–5 blocking questions per turn**: a soft cap
350:## 14. Presenting questions to the human
370:  Never a recommendation without a reason; never a fabricated recommendation
371:  when genuinely neutral.
372:
373:**The budget.** At most **3–5 blocking questions per turn**: a soft cap
374:applied with judgment, uniform across phases. A phase delta may only lower it,
375:never raise it. Overflow **demotes** to a lower tier — it never lengthens the
376:block.
377:
378:**The triage tiers.** Every candidate question lands in exactly one:
bash: cd /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc...
184:   Escalate disputes to the human per the shared contract
195:   argue them. A **human-ratified dismissal binds forward**: record it in
196:   `consolidated.md` with its human-ratified attribution and do not re-litigate
286:| How does any phase ask the human for input? | "Presenting questions to the human" (§14, this file) |
39:- **Present open questions per the shared contract** —
### Async-panel guidance contradicts the retained "prefer `wait({ all: true })`" rule in the same section
- severity: medium
- confidence: high
- file: skills/sdlc/references/phase-pr-review.md
- line: 137–153
- problem: The retained sentence "Prefer `wait({ all: true })` over status-polling for read-only fan-out" (phase-pr-review.md:138–139) sits directly above the new mandate "React per-child, not per-batch… poll `subagent({ action: \"status\" … })` (not `wait` …)" (phase-pr-review.md:142–143). A PR review panel *is* a read-only fan-out (reviewers return findings, no writes), so the same section now gives an agent two opposite instructions for the same dispatch, and prose-contract docs are this repo's executable surface.
- repro_or_impact: An agent following the older sentence blocks on `wait({ all: true })` for the panel and loses exactly the crashed-reviewer reaction latency the new paragraph exists to eliminate; which behaviour you get depends on which paragraph the model anchors on.
- remediation: Rescope the retained sentence to "read-only *research* fan-out via `researcher-readonly`" explicitly (e.g. "for research fan-outs; panel dispatch follows the per-child polling rule below") or delete it.
### "Binds forward across sessions" has no cross-session discovery mechanism
- severity: medium
- confidence: medium
- file: skills/sdlc/references/phase-pr-review.md
- line: 195–198
- problem: "A human-ratified dismissal binds forward: record it in `consolidated.md` … do not re-litigate the same finding class in later waves **or later sessions**" — but `consolidated.md` lives in a per-run dated directory (`<paths.reviews>/<phase>-<feat>-<date>/`, phase-pr-review.md:200–202), and nothing in the phase reference instructs a *later* session to locate or read prior runs' consolidated files before adjudicating. The rule's cross-session half is unenforceable as written.
- repro_or_impact: A fresh session running the panel on a follow-up PR has no instructed path to the prior ratification (the PR #17→#114 precedent worked via operator memory, not the doc); the same finding class gets re-escalated to the human, defeating the rule's stated purpose.
- remediation: Name the lookup step — e.g. "before adjudication, grep prior `<paths.reviews>/pr-*` consolidated files (or the disposition ledger) for human-ratified dismissals touching this finding class".
### Parenthetical about `wait` contradicts the very next sentence
- severity: low
- confidence: high
- file: skills/sdlc/references/phase-pr-review.md
- line: 143–146
- problem: "(not `wait`, which only unblocks once every child in that run finishes)" is immediately followed by advice to call `wait({ id, timeoutMs: 20000 })` as the poll-interval sleep "since a timeout returns control without stopping the run". As literally written the parenthetical is false by the mechanism the next sentence depends on — bounded `wait` does *not* only unblock when every child finishes.
- repro_or_impact: A literal-minded agent may conclude `wait` is unusable entirely and busy-loop bare status calls, or distrust the timeout-as-sleep trick; the two sentences cannot both be followed as stated.
- remediation: Reword the parenthetical to "not a bare `wait` with no timeout, which only unblocks once every child finishes".
### PR body (the named panel input) is not part of the commit under review; branch carries a stale committed `pr-body.md`
- severity: low
- confidence: high
- file: pr-body.md
- line: 1–5 (committed blob at 50c9286)
- problem: `git show 50c9286:pr-body.md` still declares `slug: e2e-integration-harness` (inherited from main d528b97); the actual PR body — including the "Assumptions & discretionary calls" section handed to this panel as named review input — exists only as an uncommitted working-tree edit at the review SHA. The review input has no committed provenance, and merging leaves a misleading tracked `pr-body.md` on main either way.
- repro_or_impact: `git status` shows ` M pr-body.md`; a reviewer or future session reconstructing the panel inputs from commit 50c9286 gets the wrong PR body (mitigated only because the build-plan doc's committed Assumptions appendix duplicates the content).
- remediation: Untrack `pr-body.md` (gitignore it) or commit the current body before panel dispatch so the named input is reproducible from the SHA.
### Brainstorm "pointer" restates the shared contract's element list
- severity: low
- confidence: high
- file: skills/sdlc/references/phase-brainstorm.md
- line: 39–44
- problem: The plan's DoD item 2 requires each phase delta be "phrased as a layer on the shared contract (pointer, not restatement)" (docs/plans/2026-07-19-sdlc-question-discipline.md, "Definition of done" item 2), yet the brainstorm bullet re-enumerates the contract's five elements ("one numbered end-of-reply block, enumerated alternatives, reasoned recommendations, the uniform soft cap, and the Blocking/Assumption/Parked triage tiers") — a duplicate of system-reference.md §14 that can now drift independently.
- repro_or_impact: Any future amendment to §14's element set (e.g. cap change) silently invalidates the brainstorm gloss; no test anchors the two.
- remediation: Trim the bullet to the pointer plus brainstorm's delta only.
- smell: Duplicated Code
### Routing row hardcodes "§14" while §13 self-describes as a stopgap
- severity: low
- confidence: high
- file: skills/sdlc/references/system-reference.md
- line: 286
- problem: The §11 routing row cites the new section by number — "(§14, this file)" — unlike sibling rows which cite by name; §13 ("Stall detection and self-resume", system-reference.md:344–348) explicitly says it covers a gap "until that exists upstream, not as the final word", so its eventual removal renumbers §14 and the row silently points at the wrong section.
- repro_or_impact: Section-number drift in a doc-set whose anchors are machine-tested elsewhere (ASD5 ledger tests match strings, not numbers) would leave a stale cross-reference no test catches.
- remediation: Cite by section name only, matching the other routing rows.
No high-severity findings. Verification performed: `npm test` (397 pass), `npm run lint` (clean), both task receipts verified via `verify-task-receipt.mjs --dir` (t1, t2 PASS), banned-pattern greps (`questions-helper|questions tool` absent from `skills/sdlc/`), S25 ledger anchor matches the new brainstorm bullet, "handover" absent from `skills/sdlc/` (test/extraction.test.js:66 ban confirmed), all three recorded discretionary calls in pr-body.md check out against the code, and all `(§6)` backward-transition cross-references resolve in their respective phase files.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Six concrete findings returned, each with severity, repo-relative file:line, and one-line remediation (2 medium, 4 low; no high). Grounded via git show 50c9286, full-file reads, and executed checks."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "npm test",
      "result": "passed",
      "summary": "397 tests pass, 0 fail (includes ASD5 living-anchor and frozen-surface structural tests)"
    },
    {
      "command": "npm run lint (biome check .)",
      "result": "passed",
      "summary": "144 files checked, clean"
    },
    {
      "command": "node skills/sdlc/scripts/verify-task-receipt.mjs --dir docs/reviews/task-validate-sdlc-question-discipline-t{1,2}-2026-07-19",
      "result": "passed",
      "summary": "both receipts verified"
    },
    {
      "command": "grep -ri 'questions-helper\\|questions tool' skills/sdlc/",
      "result": "passed",
      "summary": "no matches — plan DoD item 3 holds"
    }
  ],
  "validationOutput": [
    "397/397 tests green at 50c9286; lint clean; t1+t2 PV1 receipts verify; banned-literal and anchor checks hold"
  ],
  "residualRisks": [
    "Cross-session binding of human-ratified dismissals relies on an undiscoverable per-run consolidated.md (finding 2) — rule may silently fail to bind in future sessions",
    "wait({all:true}) vs per-child-polling ambiguity (finding 1) may cause inconsistent panel-dispatch behaviour until rescoped",
    "Tracked pr-body.md at repo root remains a stale/mutating artifact on main regardless of this PR",
    "Doc-only prose contract: no automated test asserts the new §14 rules or phase deltas beyond string presence, so semantic drift is test-invisible"
  ],
  "noStagedFiles": true,
  "diffSummary": "Docs-only reversible-track change: new system-reference §14 shared question-presentation contract, six phase-reference deltas, async panel-dispatch guidance in phase-pr-review, Assumptions & discretionary calls section in both PR templates, plan/build docs, PV1 manifests + receipts, one disposition-ledger anchor update",
  "reviewFindings": [
    "medium: skills/sdlc/references/phase-pr-review.md:137-153 - retained 'prefer wait({all:true}) for read-only fan-out' contradicts new per-child status-polling mandate for the (read-only) panel",
    "medium: skills/sdlc/references/phase-pr-review.md:195-198 - 'binds forward across sessions' rule has no instructed discovery path to prior runs' consolidated.md",
    "low: skills/sdlc/references/phase-pr-review.md:143-146 - '(not wait, which only unblocks once every child finishes)' contradicted by the next sentence's wait({timeoutMs}) advice",
    "low: pr-body.md:1-5 - committed blob at 50c9286 still declares slug e2e-integration-harness; actual PR body incl. assumptions section is uncommitted working-tree state",
    "low (smell: Duplicated Code): skills/sdlc/references/phase-brainstorm.md:39-44 - pointer restates the contract's five elements against the plan's 'pointer, not restatement' DoD",
    "low: skills/sdlc/references/system-reference.md:286 - routing row hardcodes '§14' though §13 self-describes as a removable stopgap"
  ],
  "manualNotes": "Read-only review; no files edited or committed. All three 'Assumptions & discretionary calls' entries in pr-body.md were verified against code and found accurate (two-task slicing with blockedBy in build plan; 'handover' banned by test/extraction.test.js:66 and absent from skills/sdlc; S25 ledger anchor matches the reworded bullet and the anchor test passes)."
}
```
