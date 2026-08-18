### Stale "owner approval pending" status lines contradict the recorded owner approval

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-08-14-plan-artifact-skeleton.md
- line: 3
- problem: The plan's Status line says "owner approval pending. Two escalations for the owner at the gate: the GPC clause supersession … and the #146 disposition", but every sibling artifact in the same diff records those two ratifications as already granted: `docs/specs/2026-08-14-plan-artifact-skeleton.md:7` ("Plan: … rev 4, owner-approved 2026-08-14, including the ratified GPC clause supersession and the #146 close-as-superseded disposition"), `docs/reviews/spec-review-plan-artifact-skeleton-2026-08-14/consolidated.md:51` ("The two standing plan-gate ratifications … are already owner-approved"), `docs/plans/2026-08-14-plan-artifact-skeleton-build.md:3-5` ("spec … rev 3 (approved 2026-08-14 …)"), and `pr-body.md` (both docs "owner-approved"). The gate-presentation spec's new AM1 record ("owner-ratified at that slice's Plan gate") contradicts the plan's own header inside this same diff.
- repro_or_impact: A reader of the authoritative governance record — the PR panel (PAS13's inspected set includes "the committed spec"), re-reviewers, or a future slice citing this plan — sees a document claiming its own approval is pending while sibling records say the gate passed and both escalations were ratified. On an irreversible track, the approval state of the plan/spec is load-bearing; the headers misstate it. Main-branch precedent confirms the staleness: S1's spec (`docs/specs/2026-08-08-spec-artifact-skeleton.md`), S3's, and S4's Status lines carry no "pending" marker at all.
- fix: Update both Status lines to record the gate outcome (e.g. drop "owner approval pending" and the pending-escalation framing, stating owner-approved 2026-08-14 with the two ratifications).

### Stale "owner approval pending" status line in the spec (same defect, second governing doc)

- severity: medium
- confidence: high
- origin: NEW
- file: docs/specs/2026-08-14-plan-artifact-skeleton.md
- line: 3
- problem: The spec's own Status line ends "owner approval pending", while the build plan header in the same diff says the spec is "rev 3 (approved 2026-08-14, spec panel converged over 2 rounds, 9/9 incorporated)" and `pr-body.md` calls it "rev 3, owner-approved".
- repro_or_impact: Same reader harm as above for the spec gate: the shipped specification self-describes as unapproved, contradicting the build plan and PR body that bind this slice's tasks to it.
- fix: Same as above — update the Status line to the approved state.

Everything else inspected is CLEAR:

- PAS10 diff-class walk (all 55 changed files): every hunk falls inside the permitted classes — new skeleton, §4-only `phase-plan.md` edits (inserted rules paragraph + single-clause swap; both hunks within §4, verified against the file), additive-only prompt anchors (F, carry-landing paragraph, Delta rounds, output format untouched), one inventory row, the M5 count line as the only `test/spec-artifact-skeleton.test.js` change, the GPC2 pin line as the only GPC change, the one-line Amendments replacement in the gate-presentation spec (trigger/class/disposition/author/in-place marker all present), the two named test reconciliations, the new contract-test file, and lifecycle artifacts under their configured homes. `templates/sdlc-plan.md`, `test/fixtures/golden/`, `test/fixtures/consumer/`, `package.json`, and the lockfile are untouched.
- PAS13: G1→Problem statement/Non-goals/Alternatives, G2→boundary labels, G3→Outcome proof, G4→sweep, G5→Pre-mortem — all non-empty fill-in sections; skeleton carries no process citations (grep for issue ids/gap ids clean); reads as authoring guidance.
- PAS14: spec AM3 and the PR body both record the track-none re-freeze (orchestrator-owned, three components — FROZEN re-add, IDV19 restore, M6/M7 deletion), the #146 close-as-superseded with its durable-comment content, and that slice completion depends on both.
- Mechanics verified by execution at 2f8be30: `npm test` 618/618 green in 3.4s (canonical TMPDIR); the new contract-test file 29/29 in 42ms (<1s budget); GPC/frozen/IDV/S1 suites green; `check-references.mjs` exit 0 (inventory inverse-complete with the new row); `check-lifecycle.sh --track irreversible --slug plan-artifact-skeleton` exit 0; all five task receipts verify via `verify-task-receipt.mjs`; the t5 manifest carries the class-b amendment's standalone ASD19 run as `tests.asd19` with scope `["task"]`; biome clean on the new test file. Replacement GPC2 pin is 62 characters (under GPC10's 80-char bound). Carry landing: no carry minted anywhere in the diff (spec's "Inbound carries: None" and the build plan's gap log are accurate).
- Proportionality: all added verification is offline, literal-pinned, and bounded (measured: contract tests 42ms, corpus 3.4s, checks ≤1s); no unbounded or disproportionate machinery introduced.
