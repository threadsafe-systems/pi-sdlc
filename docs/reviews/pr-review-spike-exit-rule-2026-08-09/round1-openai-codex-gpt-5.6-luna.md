### SER14 carry is not landed

- severity: high
- confidence: high
- origin: NEW
- file: docs/plans/2026-08-09-spike-exit-rule-build.md
- line: 112
- problem: The carry ledger requires SER14 to land in a committed PR consolidated record, but records only “issue #245 created; PR landing pending.” No PR consolidated record exists in the reviewed tree.
- repro_or_impact: `skills/sdlc/references/phase-pr-review.md:260-262` requires every carry to land before the gate passes; the PR gate cannot verify SER14’s required issue, timestamps, and call count.

### Normal Brainstorm completion no longer names a Plan transition

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-brainstorm.md
- line: 210-213
- problem: The unconditional transition was replaced with “For proceed,” but `proceed` is only a post-spike direction. A normal Brainstorm with no load-bearing uncertainty selects no direction and has no explicit next transition.
- repro_or_impact: Approve a design without entering the spike loop; the only remaining Plan instruction is scoped to post-spike `proceed`, so an agent can stall instead of entering Plan.

### Discarded spikes need not preserve their learning

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-brainstorm.md
- line: 203-208
- problem: The summary requirement is scoped to “Retained spike evidence” and its linked decision line, but the Spec requires discarded spikes to retain a self-contained learning summary (`docs/specs/2026-08-09-spike-exit-rule.md:111-113`).
- repro_or_impact: Select `discard`, remove the evidence, and omit the decision-line summary; the phase prose permits this, losing the rationale and violating the durable-decision contract.

### SER2 does not reject duplicate route anchors

- severity: low
- confidence: high
- origin: NEW
- file: test/gate-presentation-contract.test.js
- line: 131-140
- problem: The test checks only each route’s first `indexOf` occurrence and never counts duplicates, although SER2 explicitly falsifies duplicate routes.
- repro_or_impact: Appending a second “Read now” route leaves the first-occurrence order unchanged and the focused suite still passes, allowing ambiguous routing prose.