### C2 supersession amendment omits the required amendment record

- severity: medium
- confidence: high
- origin: NEW
- location: `docs/plans/2026-08-14-plan-artifact-skeleton.md:79,114` (Scope item 3 and DoD 7)
- defect: Rev 3 now requires a one-line edit to the already-approved gate-presentation Specification's Amendments section, but does not require that entry to record the trigger, amendment class, disposition, and author (or an in-place marker if the full record lives in this later Plan). The target currently has only `None at rev 3`, so the plan also must say that this line is replaced rather than left alongside the new entry.
- evidence: The plan says only “a one-line entry” and “records the C2 clause supersession” at `docs/plans/2026-08-14-plan-artifact-skeleton.md:79,114`; approved-Spec amendment law requires those fields at `skills/sdlc/references/phase-spec.md:106-112`, and the shared law requires an in-place marker when a later phase owns the full record at `skills/sdlc/references/system-reference.md:464-470`; the target Amendments section is `docs/specs/2026-08-09-gate-presentation-contract.md:407-409`.
- impact: An implementation can satisfy the new one-line DoD while leaving the approved spec's amendment history without the required class/disposition/author, making it impossible to tell whether this frozen C2 supersession was a valid in-place amendment or a required backward transition and undermining the stated “never silently” record.
- fix: Require replacement of `None at rev 3` with a one-line full amendment record carrying trigger, class, disposition, and author (plus an in-place marker naming this Plan if applicable), or explicitly route the frozen C2 supersession through its required backward Spec gate.

CONFIRMED: PLAN-R1-01 — rev 3 correctly replaces golden regeneration with goldens-unchanged-by-design and keeps both fixture trees untouched.
CONFIRMED: PLAN-R1-02 — rev 3 retains exact post-unfreeze FROZEN membership and the one-prompt IDV19 guard, deleted by re-freeze.
CONFIRMED: PLAN-R1-03 — the §4/GPC2 prompt-freeze supersession is explicit, narrowly scoped, and owner-escalated.
CONFIRMED: PLAN-R1-04 — the FS11 inventory change is paired with the explicit M5 81→82 amendment.
CONFIRMED: PLAN-R1-05 — #146 is consistently close-as-superseded, attributed to this gate, and owner-escalated.
CONFIRMED: PLAN-R1-06 — outcome rows retain a `carried to` landing site.
CONFIRMED: PLAN-R1-07 — NFR rows require applicability plus a reason.
CONFIRMED: PLAN-R1-08 — pre-mortem zero state is limited to small reversible work with a reason.
CONFIRMED: PLAN-R1-09 — the objective is structural and has a retro-owned FS13 proxy path.
CONFIRMED: PLAN-R1-10 — the required verification commands now have explicit external budgets.
CONFIRMED: PLAN-R2-01 — the false consumer-golden premise is removed; package-prompt coverage is explicitly assigned to anchors.
CONFIRMED: PLAN-R2-02 — the shipped gate-presentation spec's C2 supersession is now named as an Amendments change class (record-shape gap reported above).
CONFIRMED: PLAN-R2-03 — the replacement GPC2 pin is explicitly bounded by GPC10's 80-character rule.

CLEAR: B — the structural objective and retro proxy have a plausible verification path.
CLEAR: C — rev 3 keeps the fixture boundary, C2 amendment, and package-prompt coverage within one coherent slice.
CLEAR: D — the settled prompt-freeze collision is explicitly declared and escalated; the finding above concerns the amendment record mechanics.
CLEAR: F — the public plan-authoring shape is correctly classified as irreversible.
CLEAR: PROPORTIONALITY — every listed CI/gate check has an explicit external budget, and the added assertions are offline string checks under the contract-test budget.
