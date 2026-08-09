### REOPEN R2-D1 — map-mode sketch is not verbatim

- severity: high
- confidence: high
- location: `docs/plans/2026-08-09-gate-presentation-contract.md:24-26`; resolution comment `issuecomment-5230679564` (captured `/tmp/s3-resolution.md:12-14`)
- defect: The plan’s embedded map-mode sketch differs from the canonical resolution-comment sketch, so the required verbatim dogfood copy did not land. It also omits the thread-variant wording from the ticket node.
- evidence: Plan: `INDEX["plan provenance = INDEX\nname-wrapped ticket links,\nDecisions-so-far shape"]` and `TICKET["ticket resolution comment\nsingle home of the full grammar"]`; canonical comment: `INDEX["plan provenance = INDEX\nnamed links + one-line gists\n(Decisions-so-far shape)"]` and `TICKET["resolution comment\nsingle home of the full grammar\n(a decision ticket, or — thread variant —\na comment in the map thread)"]`. Extracted sketch hashes differ: `20e594...` vs `bab0b8...`.
- impact: The plan contradicts its own “sketch ... embeds verbatim” rule and misrepresents this run’s map-thread resolution shape; rev 3 is not ready for the Plan gate.
- fix: Replace the plan mermaid block with the resolution comment’s mermaid block byte-for-byte, then re-run the equality check.

CLEAR: R2-D2 — `docs/plans/2026-08-09-gate-presentation-contract.md:82-84` and resolution comment `/tmp/s3-resolution.md:28` reference `system-reference.md` without restating criteria; the criteria occur at `skills/sdlc/references/system-reference.md:268-270`.

CLEAR: R2-D3 — `docs/plans/2026-08-09-gate-presentation-contract.md:123-126` names G4/G7 test semantics, and `:144-145` requires those semantics in DoD 1.

CLEAR: index cardinality — the plan has 13 index entries (`:40-52`) and the fetched canonical comment has 13 decision lines (`/tmp/s3-resolution.md:23-35`).

CLEAR: reference-style links — all 13 index entries use the same `[s3-gate-record]` target, defined exactly once at `docs/plans/2026-08-09-gate-presentation-contract.md:54`.

CLEAR: one-place grammar — no canonical decision line is reproduced verbatim in the plan’s link labels; the full `appetite:`/`decision:`/`rejected:` list remains in the fetched resolution comment.

CLEAR: proportionality — the plan retains “no parser, no dial, no panel” at `docs/plans/2026-08-09-gate-presentation-contract.md:49` and excludes those surfaces at `:131-140`.

CLEAR: A — DoD items name falsifiable commands or static assertions.

CLEAR: B — stated outcomes have contract-test and existing locked-decision attack-surface verification paths.

CLEAR: C — in/out scope boundaries are coherent in the rev-3 delta.

CLEAR: D — frozen prompt enforcement remains by reference to existing surface D; the delta changes only the plan.

CLEAR: E — S2, Spec/Build lifecycle ordering, FS11, ADR reference, and thread-variant dependencies are named.

CLEAR: F — public phase-reference contract changes correctly remain on the irreversible track.

FINDINGS