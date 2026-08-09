### NEW

- severity: medium
- confidence: high
- location: docs/plans/2026-08-09-gate-presentation-contract.md:38-50
- defect: The map-mode index block smuggles the full grammar back in by explicitly prefixing the gist entries with `appetite:` and `rejected:`, directly violating the one-place law R2-D1 established.
- evidence: `- [appetite: one lifecycle slice (brainstorm→PR)...][s3-gate-record]` and `- [rejected: verbatim prose recap block...][s3-gate-record]`
- impact: Bloats the map-mode index into a near-verbatim copy of the store, defeating the durability split and requiring authors to dual-maintain the line prefixes in both the thread ticket and the plan.
- fix: Remove the `appetite:` and `rejected:` prefixes from the index links so they are pure descriptive gists (e.g. `[lifecycle slice (brainstorm→PR)...]` and `[refused: verbatim prose recap block...]`).

CLEAR: R2-D1 — The resolution comment holds exactly the sketch and the 13 full-grammar lines; the plan converted its dogfood block to a 13-line map-mode index correctly linking to that comment; and In-scope 3 contains the thread-variant clause.
CLEAR: R2-D2 — Both ADR-bar restatements are removed. In-scope 1 now says "(never restated in §8, including this plan — R2-D2)" and the resolution comment preserves it strictly by reference. The criteria live exactly once in system-reference.md.
CLEAR: R2-D3 — In-scope 5 and DoD 1 explicitly name the G4 trigger/skip rule and the G7 none/binding semantics.
CLEAR: regression check — No broken reference-style links, contradictions, or scope creep beyond the ratified design were introduced.
CLEAR: A — falsifiability: all DoD items are falsifiable and describe offline checks or validations.
CLEAR: B — provenance: clear and verifiable handling for brainstorm-gate vs standalone scenarios.
CLEAR: C — boundaries: in-scope and out-of-scope boundaries accurately capture the changes required without creep.
CLEAR: D — frozen surfaces: prompt files are correctly identified as out-of-scope and not modified.
CLEAR: E — dependencies: risks are properly accounted for in the assumptions block (G4/G7 rules integrate cleanly).
CLEAR: F — track: irreversible track is properly assigned due to rule prose modifications.

Convergence verdict: Rev 3 incorporates the R2 fixes correctly but is not ready for the Plan gate because it introduced one regression. Once the index lines are reduced to pure descriptive gists (stripping the grammar prefixes), it will be ready.
FINDINGS