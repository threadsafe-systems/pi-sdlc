### Prompt anchors are not structurally tied to their required surfaces

- severity: medium
- confidence: high
- origin: NEW
- location: C3 (lines 97-107); C7/M3 (lines 143-146); PAS4 (lines 260-264)
- defect: C3 requires one specific anchor in each of A, B, C, D, and E and requires each anchor to instruct verification, but M3 only requires five path-containing anchors somewhere in the union of A–E and section-name coverage. It never checks the per-letter mapping or that an anchor is an instruction rather than descriptive text.
- evidence: C3 maps A–E individually (`Definition of done`, `Problem statement`, `Objectives and scope`, `Brainstorm provenance`, and `Non-functional requirements & repo-doc sweep`) and says each anchor instructs verification (`docs/specs/2026-08-14-plan-artifact-skeleton.md:99-105`); M3 only says “five anchors present inside the A, B, C, D, E surface paragraphs” and checks names/path (`:146`).
- impact: A Build can put all five strings in one surface, or merely list section names and the path, while PAS4 passes; the plan panel can therefore omit the locked-decision or risk checks that the prompt change is meant to add.
- fix: Make M3 assert exactly one anchor per A–E with the prescribed section mapping and an explicit verification instruction, or add a named inspection scenario that gates those semantic requirements.

### Portability NFR is bound to scenarios that cannot gate its whole claim

- severity: medium
- confidence: high
- origin: NEW
- location: Non-functional requirements (line 235); PAS10–PAS12 (lines 296-312)
- defect: The Portability row claims no runtime assertion machinery, Gherkin-family tooling, linter/CI-check mandate, or new dependency “anywhere in the slice” but binds only PAS11 and PAS12. PAS11 runs commands and PAS12 scans only the skeleton's vocabulary; neither verifies package/lockfile or other-slice changes, which are checked only by the separate PAS10 PR-diff inspection.
- evidence: The row binds the global response measure to `PAS11, PAS12` (`docs/specs/2026-08-14-plan-artifact-skeleton.md:235`); PAS12's M8 is limited to skeleton text (`:308-312`), while the package/lockfile and full-slice boundary is only in PAS10 (`:296-300`).
- impact: The NFR's declared binding is false and a consumer can treat the named checks as sufficient while a dependency or tooling change outside the skeleton remains unexamined; the claimed portability boundary is not traceable from its Binding cell.
- fix: Bind this row to PAS10 (and PAS12 for skeleton wording), or expand the named scenarios with an explicit whole-slice dependency/tooling check.

### Gate inspections have no proportionality budget

- severity: medium
- confidence: high
- origin: NEW
- location: Non-functional requirements (line 232); PAS10, PAS13, PAS14 (lines 296-324)
- defect: The only stated budgets cover command execution (30 seconds for `npm test`, 1 second for the new test, and 5 seconds for other commands); the three inspection scenarios that run at the PR/spec gates have no time, diff-size, artifact-count, or review-cost budget. PAS10 in particular asks a panel to inspect the branch's full diff, including all lifecycle evidence.
- evidence: The Performance row lists only external command bounds (`docs/specs/2026-08-14-plan-artifact-skeleton.md:232`); PAS10 requires inspection of “every hunk” in the full PR diff (`:296-300`), while PAS13 and PAS14 likewise require panel confirmations at the spec/PR gates without a bound (`:314-324`).
- impact: Verification cost is unbounded as lifecycle artifacts or the diff grow, so the specification cannot substantiate its proportionality requirement or prevent a gate from expanding beyond the small skeleton change it gates.
- fix: State an explicit plausible time/cost and scope cap for each gate inspection (for example, maximum inspected files/lines and panel minutes), or narrow the scenarios to a fixed bounded artifact set.

CLEAR: A — The current FROZEN list was byte-checked; its post-unfreeze L3 is the current list minus only adversary-plan.prompt.md.
CLEAR: D — The canonical rule sentences match the approved plan's binding-rule text, and no additional contradiction was found.
CLEAR: E — No unverified framework/dependency-behaviour claim is used in these findings; the local consumer-resolution and test surfaces were read directly.
CLEAR: G — No additional over-claim survived beyond the three concrete contract/NFR defects above.
