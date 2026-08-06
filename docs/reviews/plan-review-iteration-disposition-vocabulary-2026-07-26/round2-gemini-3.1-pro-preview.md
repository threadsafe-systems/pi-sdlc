# plan_review round 2 (delta) — google/gemini-3.1-pro-preview:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `bd19184`
(delta `a83f11a..bd19184`). Verbatim reviewer output.

**Dispatch note.** This child was marked `failed` by the subagent acceptance
layer ("completed without making edits for an implementation task") despite
returning a complete verdict. Per `phase-pr-review.md` §5 "Reviewer dispatch
recovery" — a reviewer that returns a model verdict has completed its
assignment and is never silently replaced — this is an **acceptance-layer
mislabel of a read-only review, not an infra failure**. No replacement was
dispatched; the verdict below was recovered from the run's `output-1.log`.
All three findings are self-graded `high` by the reviewer; the consolidated
adjudication re-grades two of them with recorded reasons.

---

### NEW: DoD 12 contradicts D8 on terminal disposition checkpoint requirements

- severity: high
- confidence: high
- location: Definition of done, item 12
- defect: DoD 12 demands that "no destination in the glossary lacks" an inbound-carry obligation that names a checkpoint it blocks, but D8 defines `CARRY-TO-BACKLOG` as a terminal exit to a filed issue that intrinsically has no SDLC checkpoint to block.
- evidence: D8 (`plus terminal CARRY-TO-BACKLOG (a filed issue id)`) vs DoD 12 (`no destination in the glossary lacks one`).
- impact: The completion criteria are logically impossible to satisfy because a terminal issue-tracker destination cannot have a downstream phase checkpoint to block.
- fix: Amend DoD 12 to explicitly exempt terminal destinations (like `CARRY-TO-BACKLOG`) from the blocked-checkpoint requirement.

### NEW: Reviewer gatekeepers are blind to the inbound-carry rule

- severity: high
- confidence: high
- location: Scope item 7 vs Objective 3
- defect: The plan relies on the Spec and PR panels to enforce the "gate is not passable while inbound carry is unlanded" rule (Scope 4), but explicitly forbids reviewers from reading phase references (Objective 3) and fails to add the verification rule to their adversary prompts in Scope 7.
- evidence: Objective 3 (`reviewer subagent has no skill loaded and cannot follow a reference`), Scope 4 (`the Spec gate is not passable while a CARRY-TO-SPEC ... is unlanded`), and Scope 7 (adversary prompts gain tagging and emit rules, but no inbound-carry verification rule).
- impact: The no-orphan rule's enforcement at agent-gated phases (Spec and PR) will be a dead letter because the reviewing models do not know they are required to check upstream carries.
- fix: Add an instruction to the adversary prompts in Scope 7 requiring the reviewer to verify that all upstream carries addressed to their phase have been landed.

### NEW: Terminology collision and ontology error in "finding classes"

- severity: high
- confidence: high
- location: Scope item 1 and Objective 1
- defect: The plan overloads the term "finding class" to mean both a semantic defect category (e.g. "Build-authority", per `phase-pr-review.md` line 210) and an origin tag (`NEW` / `REOPENED`). It additionally conflates these origin tags with downstream dispositions by listing `CARRY-TO-<dest>` as the third class.
- evidence: Scope 1 (`finding classes NEW / REOPENED(<id>) / CARRY-TO-<dest>`) vs D11 (`dismissal bar continues to key on finding class, not id`) vs Scope 7 (`tag every finding NEW or REOPENED`).
- impact: Defining `NEW` and `REOPENED` as "finding classes" corrupts the existing binds-forward dismissal rule ("do not re-litigate the same finding class"), and defining `CARRY-TO` as a class contradicts its role as a disposition.
- fix: Rename `NEW` / `REOPENED` to "finding origin tags" (or similar) in the glossary to preserve "finding class" for semantic categories, and correctly classify `CARRY-TO-<dest>` purely as a disposition.

CLEAR: B — All stated outcomes have a falsifiable verification path via CI or committed artifacts.
CLEAR: D — All deviations from prior ratified decisions are explicitly recorded as amendments with new bounding logic.
CLEAR: F — The irreversible track is correctly claimed since the changes define cross-phase contract semantics and shared vocabulary that must govern all lifecycle implementations.
