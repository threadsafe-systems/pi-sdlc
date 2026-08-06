# PR-panel adjudication — diff-scoped test premises

Target: branch diff `2aa5a89..3e81a25`, irreversible track. Orchestrator:
`anthropic/claude-opus-5`. Reviewers:
`anthropic/claude-fable-5:xhigh`, `openai-codex/gpt-5.6-sol:xhigh`, and
`openai-codex/gpt-5.6-luna:xhigh`.

## Artifact inventory

| wave | harvest round | reviewer | artifact | telemetry |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | `panel.dispatched{round:1,wave:1}` + `panel.harvested{round:1,wave:1}` |
| 1 | 1 | `gpt-5.6-sol` | `round1-gpt-5.6-sol.md` | same workflow/harvest |
| 1 | 1 | `gpt-5.6-luna` | `round1-gpt-5.6-luna.md` | same workflow/harvest |

All three children completed with model verdicts. Each artifact carries the
harness's turn-budget wrap-up caveat (`Output may be partial`); findings and
CLEARs are recorded as the returned verdicts, not as claims of exhaustive
coverage.

## Round 1 findings

Cross-model duplicates are one finding at the higher independently proposed
severity.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `PR-R1-01` | medium | NEW | fable-5 | DSP11's mapped task test never asserts the two present-ownership comments exist or obey the no-process-history rule | **incorporated** |
| `PR-R1-02` | medium | NEW | fable-5 | Spec-panel round-2 consolidated prose calls Gemini clean/genuine disagreement without disclosing the artifact's partial-output caveat | **incorporated** |
| `PR-R1-03` | medium | NEW | fable-5, sol | DSP12 and IDV17 can admit static subprocess/network builtin imports while claiming offline/no-subprocess operation | **incorporated** |
| `PR-R1-04` | medium | NEW | fable-5, sol, luna | DSP4/DSP5 do not exercise mandatory extension, helper, invoker, operation, ref, and fixture-HEAD variants; one DSP4 assertion is tautological | **incorporated** |
| `PR-R1-05` | medium | NEW | sol | The law witness accepts semantic inversion and a forbidden moving-ref/pinned-law restatement in the implementation pointer | **incorporated** |
| `PR-R1-06` | medium | NEW | sol, luna | DSP14's PV1 check proves only that some issue-192 comment contains `DSP3`, not the law, linked Spec, or same-comment requirement | **incorporated** |
| `PR-R1-07` | low | NEW | fable-5 | IDV17's absolute no-subprocess claim is evadable through `node:child_process` plus a non-literal command | **incorporated with PR-R1-03** |
| `PR-R1-08` | low | NEW | sol | IDV14 treats any pipe-prefixed data row mentioning the four terms as a forbidden table header | **incorporated** |

**Counts after deduplication:** 6 medium, 2 low. Incorporated 8; dismissed 0;
barred 0; carries 0.

## Incorporation evidence

### `PR-R1-01` — DSP11 obtains a real witness

`iteration-disposition.test.js` gains IDV33. It extracts both ownership comments,
requires the FROZEN-list and standing-guard owners, and rejects process-history
vocabulary (`Plan`, `panel`, `PR`, `removed`, `retired`). Deleting either comment
now turns the T1 task check red, so DSP11's PV1 mapping is no longer partial.

### `PR-R1-02` — gate record states the evidence honestly

The Spec-panel consolidated record now says both round-2 artifacts carry the
harness partial-output caveat and describes Gemini CLEAR/Fable findings as the
*returned verdicts*, not exhaustive independent passes. The dismissal-posture
paragraph no longer overstates the disagreement.

### `PR-R1-03` / `PR-R1-07` — static import boundaries

Both scenario corpora parse their static imports. They reject
`node:child_process`, `node:http`, `node:http2`, `node:https`, `node:net`,
`node:dgram`, `node:dns`, and `node:tls`; non-builtin imports remain forbidden.
IDV17 also bans `execFileSync(` and `spawnSync(` call shapes after strings and
comments are blanked. This closes the reviewers' reproduced ordinary-import
paths without claiming semantic proof against adversarial dynamic construction.

### `PR-R1-04` — every mandatory detector variant is load-bearing

DSP4 compares the extension set with the independent literal vocabulary
`.cjs`/`.js`/`.mjs` and retains nested/self witnesses. DSP5 now exercises:

- both helper names;
- `execFileSync`, `spawnSync`, and `runProcess`;
- `merge-base`, `show`, and `diff`;
- `main` and `origin/main`; and
- current-tree, `rev-parse HEAD`, `show HEAD:path`, `diff HEAD`, sandbox-init,
  and variable-argv negatives.

The tautological same-set extension assertion is removed.

### `PR-R1-05` — semantic direction and partial duplication are gated

The law projector now requires the moving-ref expiry relationship, rejects
`never/not expire`, and requires the current-tree/pinned-immutable route. DSP2
rejects any moving-ref-versus-pinned restatement even when the non-change half is
absent. DSP3 includes inversion and duplication probes in addition to anchor
removals.

### `PR-R1-06` — one complete handoff comment

T2's shell-free exact argv now parses issue #192's comment objects and requires
one comment body to contain all of `DSP3`, `premise-durability`, and the linked
Spec path. The Build plan and PV1 manifest carry the same command.

### `PR-R1-08` — Markdown header semantics

IDV14 now treats a row as a header only when the next row is a same-width
Markdown separator and normalized cells equal the four required names. A prose
data-row mutation stays clean; the forbidden header mutation still fails.

## Carry and frozen-surface checkpoints

No `CARRY-TO-BUILD`, `CARRY-TO-IMPLEMENT`, or `CARRY-TO-BACKLOG` was minted.
The S1 handoff remains landed at issue #192 comment 5202737602 and is exercised
by T2's strengthened `static.handoff`. ASD19 passes and no FROZEN path changes.

## Dismissal posture

Round 1 incorporated 8/8 findings. That continues the already-disclosed
100%-incorporation smell from the Spec panel; it is not labelled diligence.
Every finding was reproduced or checked against source before incorporation,
and no reviewer recommendation was actioned solely to avoid disagreement.
