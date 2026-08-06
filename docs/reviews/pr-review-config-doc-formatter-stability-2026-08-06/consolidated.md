# PR-panel adjudication — config-doc formatter stability

Target: stacked delta `f112573..8cf8a2c` (PR #213 base), irreversible track.  
Orchestrator: `anthropic/claude-opus-5`.

## Artifact inventory

| wave | round | reviewer | artifact | telemetry |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | `panel.dispatched{round:1,wave:1}` + matching harvest |
| 1 | 1 | `gpt-5.6-sol` | `round1-gpt-5.6-sol.md` | same workflow/harvest |
| 1 | 1 | `gpt-5.6-luna` | `round1-gpt-5.6-luna.md` | same workflow/harvest |
| 2 | 2 | `claude-fable-5` | `round2-claude-fable-5.md` | `panel.dispatched{round:2,wave:2}` + matching harvest |
| 2 | 2 | `gpt-5.6-sol` | `round2-gpt-5.6-sol.md` | same workflow/harvest |
| 2 | 2 | `gpt-5.6-luna` | `round2-gpt-5.6-luna.md` | same workflow/harvest |

## Round 1 findings

Cross-model duplicates are one finding at the higher independently proposed severity.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `PR-R1-01` | medium | NEW | fable-5, luna | v1 fixture sentinel is asserted, but the body bytes and claimed baseline provenance are not mechanically pinned | **incorporated** |
| `PR-R1-02` | medium | NEW | sol, luna | spreading every backtick run into `Math.max` can exceed V8's argument limit for a valid large value | **incorporated** |
| `PR-R1-03` | low | NEW | fable-5 | `codeSpan`'s no-padding precondition is load-bearing but undocumented at the helper | **incorporated** |
| `PR-R1-04` | low | NEW | fable-5 | proposed PR body reports stale 526/24/54 test counts | **incorporated** |

**Counts:** 2 medium, 2 low. Incorporated 4; dismissed 0; barred 0; carries 0.

### `PR-R1-01` — complete fixture pin

The focused test now computes SHA-256 over the entire v1 fixture and compares it with the captured baseline hash before exercising stale/regenerate behavior. Build amendment A2 replaces the process-comment requirement with this stronger executable pin; provenance remains in the Spec, respecting the implementation-comment law.

### `PR-R1-02` — iterative maximum

`codeSpan` now walks regex matches and updates one scalar maximum, so argument count is constant. A 150,000-separated-run witness reproduces the prior overflow scale without exceeding the focused-test budget.

### `PR-R1-03` / `-04` — invariant and publication honesty

The helper states the present JSON-token boundary invariant that makes no-padding correct. The PR body now reports the post-fix 528 full, 25 config-doc, and 55 combined focused tests.

## Carries, frozen surfaces, and stack

No carry was minted. Both receipts verified before dispatch. No ASD19-frozen surface is touched. PR #213's head is an ancestor of this branch and its delta is excluded from this review; this PR stays stacked until #213 lands.

## Round 2 findings

Every round-1 disposition was confirmed incorporated; no finding was legally reopened.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `PR-R2-01` | low | NEW | fable-5 | large-run witness checks only a two-backtick prefix and would accept an over-long delimiter | **incorporated** — assertion now equals the complete serialized line with exactly two delimiters |
| `PR-R2-02` | low | NEW | sol | refreshed T1 runner report named the review-directory manifest while the receipt names the canonical validation manifest | **incorporated** — final deterministic rerun uses the canonical `docs/validation/.../t1.json`; receipt/report path agreement is checked before publication |

**Round-2 counts:** 0 high, 0 medium, 2 low. Incorporated 2; dismissed 0; barred 0; carries 0.

## Stop status

No high or medium finding survives adjudication. Low findings are incorporated without another round. No dismissal or carry exists.
