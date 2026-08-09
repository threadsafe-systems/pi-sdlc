# Spec-review round 3 — gate-presentation-contract (S3)

Panel: openai/gpt-5.6-luna:xhigh · maas-qwen/glm-5.2:xhigh
Author: maas-qwen/qwen3.8-max · artifact: spec rev 3 at `f8ed3c1`
Wave note: wave 1 (workflow call_71e623f1bd044c188621b79a, children a374264a/6d84f1ea)
was killed by a mistaken duplicate-stop (exit 143, no verdicts); wave 2
(call_76a9aab92b0b4ba48b55e144) produced the verdicts below. Telemetry
records both waves.

## Raw verdicts

- luna: 3 findings (0 high, 2 medium, 1 low) — round3-luna.md
- glm: CLEAR across all surfaces A–E + PROPORTIONALITY — round3-glm.md

## Canonical findings and adjudications

### SPEC-R3-01 — GPC15 lifecycle exemption omits the ordinary plan doc · medium · ACCEPT

luna. GPC15's exempt list named "this spec, the build plan, the review
records…, and task receipts" but omitted the ordinary Plan doc, which is a
distinct artifact from the Build plan (phase-plan.md:36-38 "Plan doc" vs
phase-tasks.md:36-40 "build-plan doc"). Verified: this branch's own diff
contains docs/plans/2026-08-09-gate-presentation-contract.md, which the
carried scenario as written could reject or leave ungoverned.
Fix (rev 4): exemption list now names the plan doc explicitly alongside the
build plan. glm's CLEAR on B missed this; luna's evidence is verbatim and
decisive.

### SPEC-R3-02 — GPC13 assigned prose judgment to a checklist validator · medium · ACCEPT

luna. Rev-3 GPC13 placed its judgment "at the first per-task task-close
validation during Implement" with "the validator (or owner)" as judge.
phase-implement.md §5 defines the per-task validator verbatim as "a checklist
executor, not a judge" and "Judgement review happens later at the PR panel."
The named decision point therefore had no legitimate judge. Verified verbatim.
Fix (rev 4): GPC13 moved to the PR gate with the PR panel as judge, citing
phase-implement.md §5 as the reason. Luna offered this as option (a); chosen
over inventing a new Implement owner-inspection with no home in the framework,
and it co-locates the three doc-prose inspection/carried scenarios (GPC13,
GPC14, GPC15) at PR time. No ripple: C1's Gated-by and the usability NFR bind
the scenario id, unchanged.

### SPEC-R3-03 — GPC2 carried a fourth named part `When–Then (continued):` · low · ACCEPT

luna. spec-artifact-skeleton.md:63 defines "Three named parts" — Given:/
When–Then:/Falsify:. GPC2's `When–Then (continued):` label is a fourth named
part. glm's PROPORTIONALITY defense ("reasonable continuation of a long
When–Then") is rejected: the skeleton's form rule is literal, and this spec is
the skeleton's dogfood — mechanical decidability is the slice's point.
Fix (rev 4): continuation folded into the single When–Then part as unlabelled
continuation lines ("; the same §4 rule also states…").

## glm CLEAR adjudication

glm verified all ten R2 fixes, gating lists, Vocabulary both-ways, DoD
coverage, decidability, and skeleton conformance — its CLEAR stands for every
surface except the three points above, where luna's verbatim evidence
overrides. The direct conflict on GPC2's form is resolved for luna (skeleton
text is literal). No glm finding to adjudicate.

## Ledger

Round 3: 3 raw → 3 canonical. Incorporated 3, dismissed 0.
Cumulative: 32 findings, 32 incorporated, 0 dismissed.
Spec rev 4 applies all three fixes.
