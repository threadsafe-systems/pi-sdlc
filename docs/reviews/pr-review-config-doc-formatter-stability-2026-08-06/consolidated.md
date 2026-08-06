# PR-panel adjudication — config-doc formatter stability

Target: stacked delta `f112573..8cf8a2c` (PR #213 base), irreversible track.  
Orchestrator: `anthropic/claude-opus-5`.

## Artifact inventory

| wave | round | reviewer | artifact | telemetry |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | `panel.dispatched{round:1,wave:1}` + matching harvest |
| 1 | 1 | `gpt-5.6-sol` | `round1-gpt-5.6-sol.md` | same workflow/harvest |
| 1 | 1 | `gpt-5.6-luna` | `round1-gpt-5.6-luna.md` | same workflow/harvest |

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

## Stop status

Round 1 requires a full delta round because two medium findings were incorporated. No dismissal is proposed.
