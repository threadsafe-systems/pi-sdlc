# plan_review round 3 (delta) — google/gemini-3.1-pro-preview:xhigh

Target: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` @ `66d9520`
(delta `bd19184..66d9520`). Verbatim reviewer output.

Dispatch note: the explicit "this is a READ-ONLY review, you are expected to make
NO file edits" line added to this round's task text stopped the acceptance-layer
mislabel seen in round 2; this child completed normally.

---

### [REOPENED(PLAN-R2-03)] Missing `defect class` from the finding-record shape

- severity: high
- confidence: high
- location: Scope item 1
- defect: Rev3 successfully split the overloaded "finding class" into three nouns (`origin tag`, `disposition`, and `defect class`) via D12 and replaced `class` with `origin tag` in the record shape. However, it completely forgot to include `defect class` in the record shape list.
- evidence: Scope 1 defines the finding-record shape as `(id, origin tag, severity, disposition, one-line reason, landing site where applicable)`.
- impact: The consolidation table will have no column for `defect class`. The binds-forward dismissal bar (`phase-pr-review.md:209-217`), which D12 explicitly confirms keys on this semantic category, will be permanently broken because the required data is no longer recorded anywhere.
- fix: Add `defect class` to the finding-record shape list in Scope 1.

### [REOPENED(PLAN-R2-02)] Backlog checkpoint evades agent-run PR gate enforcement

- severity: medium
- confidence: high
- location: Scope item 7 vs Scope item 2 and D8
- defect: Rev3 added an *inbound*-carry check to the adversary prompts to fix PLAN-R2-02, but this explicit phrasing completely misses the *outbound* terminal `CARRY-TO-BACKLOG` checkpoint that blocks the PR gate.
- evidence: Scope 7 requires verifying "every carry addressed to this phase". A previous round's `CARRY-TO-BACKLOG` is addressed to the backlog, not the PR phase, so the PR agent won't verify it.
- impact: `CARRY-TO-BACKLOG` dispositions will routinely leak past the agent-run PR gate without a filed issue ID, making the no-orphan rule for backlog items a dead letter just as it was in rev2.
- fix: Update Scope 7's `adversary-review.prompt.md` addition to explicitly require verifying that any prior-round `CARRY-TO-BACKLOG` has its filed issue ID recorded in `consolidated.md`.

### [NEW] DoD 1 Counting Contradiction

- severity: low
- confidence: high
- location: Definition of done, item 1
- defect: The list of term groups claims there are "seven", but enumerates exactly eight distinct items separated by commas.
- evidence: "all seven term groups — origin tags, dispositions, the `defect class` pointer, reopen bar, finding-record shape including the id format, carry destinations + no-orphan, ratified collision, amendment classes"
- impact: Fails falsification during verification because an implementer counting the groups will find 8, causing the DoD check to mechanically fail or forcing an undocumented merging of terms.
- fix: Change "seven" to "eight".

CLEAR: B — All stated outcomes have a plausible verification path explicitly covered by test budgets or document checks.
CLEAR: D — The plan correctly adheres to the ratified decisions and flags the D9 refreeze properly without reopening settled laws.
CLEAR: F — Track is correctly classified as irreversible, no reversible fast-path claims are made.
