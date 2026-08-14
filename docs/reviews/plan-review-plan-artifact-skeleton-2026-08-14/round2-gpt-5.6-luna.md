### Package-default golden remains unverified

- severity: high
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-14-plan-artifact-skeleton.md:80,95,113` (Scope item 4 / consumer-fixture boundary / DoD 6)
- defect: The newly added golden-regeneration requirement cannot both use the changed package-default prompt and keep the existing extraction test plus consumer fixture unchanged. The extraction test stamps with `--config consumer`, and the stamping code gives that consumer override precedence; regenerating the golden from the package prompt would therefore fail the existing byte comparison, while regenerating from the unchanged override leaves the changed package prompt's stamped agent untested.
- evidence: `test/extraction.test.js:133-142` invokes `ensure-panel-agent.mjs` with `--config consumer` and compares the result to `test/fixtures/golden/plan_review.agent.md`; `skills/sdlc/scripts/ensure-panel-agent.mjs:71-75` resolves a consumer override before the generic package prompt; the plan simultaneously says the golden is regenerated because of the prompt change (`:80`) and that `test/fixtures/consumer/` is untouched (`:95`).
- impact: DoD 6 is either unreachable or vacuous, and the package-default prompt can ship with new anchors without any committed stamped-agent golden or extraction assertion covering it.
- fix: Add a separately named package-default stamping/golden assertion (and budget) while retaining the consumer-override golden, or explicitly permit and update the consumer fixture and its corresponding test contract.

CONFIRMED: PLAN-R1-01 — stamped-agent golden regeneration is now named in Scope item 4 and DoD 6.
CONFIRMED: PLAN-R1-02 — the unfreeze window now names exact FROZEN-membership and one-prompt IDV19 guards, with deletion by re-freeze.
CONFIRMED: PLAN-R1-03 — the single-clause §4/GPC2 supersession is explicit and escalated for owner ratification.
CONFIRMED: PLAN-R1-04 — S1 M5's exact inventory count is explicitly amended from 81 to 82.
CONFIRMED: PLAN-R1-05 — #146 is consistently stated as close-as-superseded and attributed to this gate.
CONFIRMED: PLAN-R1-06 — outcome-proof rows now have a `carried to` landing-site field and rule 3 requires it.
CONFIRMED: PLAN-R1-07 — rule 4 now requires an applicability reason on every sweep row.
CONFIRMED: PLAN-R1-08 — rule 5 now limits zero-state pre-mortems to small reversible work with a reason.
CONFIRMED: PLAN-R1-09 — the headline objective is structural and now has a retro-owned proxy-evidence note.
CONFIRMED: PLAN-R1-10 — DoD 9 gives external budgets for the contract test, full suite, Biome, references, and lifecycle checks.

CLEAR: B — the structural objective and its proxy evidence have a plausible retrospective verification path.
CLEAR: D — the new settled-decision supersession and tracker disposition are explicitly surfaced for owner ratification.
CLEAR: F — the plan correctly keeps the public authoring-shape freeze on the irreversible track.
CLEAR: PROPORTIONALITY — the listed CI/gate checks have explicit external budgets and no new unbounded machinery is proposed.
