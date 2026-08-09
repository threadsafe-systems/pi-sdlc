### PR-R1-01 — SER14 carry landing (`docs/plans/2026-08-09-spike-exit-rule-build.md:112`)

- verdict: RESOLVED
- evidence: The ledger now points to the committed consolidated record, which contains issue #245, timestamps, zero model calls, and both lifecycle outcomes at `docs/reviews/pr-review-spike-exit-rule-2026-08-09/consolidated.md:42-53`.

### PR-R1-02 — Plan transition semantics (`skills/sdlc/references/phase-brainstorm.md:211-215`)

- verdict: RESOLVED
- evidence: The transition explicitly covers ordinary Brainstorm completion and post-spike `proceed`, while retaining normal-gate control and provenance transfer.

### PR-R1-03 — Discarded spike evidence durability (`skills/sdlc/references/phase-brainstorm.md:203-209`)

- verdict: RESOLVED
- evidence: Every spike now requires a self-contained existing `decision:` line; discard needs no link, while retained evidence must link from that line.

### PR-R1-04 — Duplicate route-anchor falsifier (`test/gate-presentation-contract.test.js:131-143`)

- verdict: RESOLVED
- evidence: SER2 counts each route anchor and requires exactly one occurrence; the focused contract suite passes.

### PR-R1-05 — `delivery-grade` vocabulary alignment (`docs/specs/2026-08-09-spike-exit-rule.md:16`)

- verdict: RESOLVED
- evidence: The Vocabulary definition now uses “detailed requirements,” matching the route-2 trigger at `skills/sdlc/references/phase-brainstorm.md:170-172`.

### NEW DEFECTS

none found