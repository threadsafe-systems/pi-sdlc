# spec_review round 3 — trim-the-tail confirmation — openai-codex/gpt-5.6-luna:xhigh

Target: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `7feaa15`
(delta `be21293..7feaa15`). Verbatim reviewer output.

**Sub-floor dispatch, deliberately** (D7 trim-the-tail exemption): one reviewer
against a configured floor of 2. Not a shortfall under `onShortfall: fail`,
which governs full review rounds. Wave 3, harvest label 5 (labels 2–4 belong to
wave 2's failed/retry/replacement dispatches).

The child was again marked `failed` by the subagent acceptance layer for making
no edits on a read-only review — **fourth occurrence this run**. Verdict complete
and recovered from `output-0.log`; no replacement dispatched.

---

### REOPENED(SPEC-R2-06) — A1’s Plan marker still does not point downstream
- severity: medium
- confidence: high
- location: Spec §3 C4(b), IDV32; Plan scope row 6
- defect: C4(b) requires each amended artifact to carry a marker pointing to the downstream record. Plan scope row 6 only says `AMENDED, class (b), 2026-07-26`, while IDV32 merely requires that the Plan contain some marker naming each amendment; a marker on DoD 5 can satisfy it while row 6 remains unlinked.
- evidence: Spec C4(b) requires a marker “pointing to it” (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:200-205`); A1 claims row 6 and DoD 5 carry such markers (`:35`); Plan row 6 lacks an A1/spec pointer (`docs/plans/2026-07-26-iteration-disposition-vocabulary.md:123`), while DoD 5 has one (`:206`); IDV32 only says “the Plan contains” a matching marker (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:304`).
- impact: The amended Plan surface remains discoverable only by reading the downstream Spec, violating the amendment-in-place contract.
- fix: Require an adjacent `AMENDED, class (b), see spec §1 A<n>` marker on every amended Plan surface and anchor IDV32 to each surface.
### NEW — Amendment preamble has a stale cardinality
- severity: medium
- confidence: high
- location: Spec §1
- defect: Rev3 adds A3 and A4 but retains “Both are class (b),” contradicting the four amendment records A1–A4.
- evidence: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md:22-25,27,39,49,60`.
- impact: Amendment accounting is internally inconsistent and can cause readers or gates to overlook A3/A4.
- fix: Change “Both” to “All four” or remove the cardinality.
CLEAR: SPEC-R2-01 — A3/A4 and Plan markers now formalize the prefix and `barred` amendments (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:49-69`; `docs/plans/2026-07-26-iteration-disposition-vocabulary.md:95-96,117`).
CLEAR: SPEC-R2-02 — C3 assigns outbound `CARRY-TO-IMPLEMENT` to `phase-tasks.md` §8 and IDV26 gates it (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:171,318`).
CLEAR: SPEC-R2-03 — IDV26 now gates all four outbound carry statements (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:318`).
CLEAR: SPEC-R2-04 — Plan scope row 11 and DoD 9 now carry the A2 markers (`docs/plans/2026-07-26-iteration-disposition-vocabulary.md:128,216`).
CLEAR: SPEC-R2-05 — The Plan Objective now places the spec-gap log solely in `phase-tasks.md` §4 (`docs/plans/2026-07-26-iteration-disposition-vocabulary.md:43-48`).
CLEAR: SPEC-R2-07 — IDV29 explicitly gates the `review.tasks: off` fallback (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:301`).
CLEAR: SPEC-R2-08 — IDV30 anchors the amendment to the existing “Only … escalate” sentence (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:302`).
CLEAR: SPEC-R2-09 — IDV31 anchors the alias at the binds-forward paragraph (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:303`).
CLEAR: SPEC-R2-10 — IDV14 now asserts the exact severity and disposition enums (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:306`).
CLEAR: SPEC-R2-11 — Totals were removed; the per-contract table explicitly marks C8 as diff-inspection-only, so no substantive verification signal was lost (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:322-341`).
CLEAR: SPEC-R2-12 — N5 and IDV20 are bounded to named artifacts in this repository (`docs/specs/2026-07-26-iteration-disposition-vocabulary.md:279,312`).
CLEAR: coverage — Every C1–C8 contract has a listed scenario mapping; IDV32’s insufficient marker assertion is the finding above.
CLEAR: C — No new interface or signature defect was introduced.
CLEAR: E — The delta contains documentation and review artifacts only; no new framework-behaviour claim is introduced.
CLEAR: F — No new non-functional requirement defect was introduced.
CLEAR: G — No new mechanism overclaim was found beyond the stale amendment-count contradiction reported above.
