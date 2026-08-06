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
| 2 | 2 | `claude-fable-5` | `round2-claude-fable-5.md` | `panel.dispatched{round:2,wave:2}` + `panel.harvested{round:2,wave:2}` |
| 2 | 2 | `gpt-5.6-sol` | `round2-gpt-5.6-sol.md` | same workflow/harvest |
| 2 | 2 | `gpt-5.6-luna` | `round2-gpt-5.6-luna.md` | same workflow/harvest |

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

## Round 2 (delta `3e81a25..5856f15`)

Every round-1 disposition was confirmed or legally reopened with new mutation
evidence. No high finding.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `PR-R2-01` | medium | `REOPENED(PR-R1-05)` | all | Law inversion coverage remains phrase-specific, and the positive-law predicate doubles as duplication detection so a nearby inversion phrase can mask a full duplicate | **incorporated** |
| `PR-R2-02` | medium | `REOPENED(PR-R1-03)` | all | Both import guards parse only single-line `import … from`; multiline and side-effect prohibited imports evade them, including aliased subprocess calls | **incorporated** |
| `PR-R2-03` | medium | `REOPENED(PR-R1-04)` | sol | DSP5 never exercises `runProcess` through the direct `show`/`diff` branch | **incorporated** |
| `PR-R2-04` | medium | `REOPENED(PR-R1-06)` | sol | DSP14 still accepts a token-only comment that neither instructs preservation nor proves a real link | **incorporated** |
| `PR-R2-05` | medium | `REOPENED(PR-R1-01)` | sol | IDV33 truncates each ownership comment at the expected period, so forbidden history appended afterward is not inspected | **incorporated** |
| `PR-R2-06` | medium | NEW | fable-5 | Proposed PR body still claims 518/29 tests after the refreshed branch now runs 519/30 | **incorporated** |
| `PR-R2-07` | low | `REOPENED(PR-R1-08)` | fable-5 | IDV14 requires three dashes, allowing a valid one-dash Markdown delimiter row to evade the forbidden-header check | **incorporated** |

**Counts:** 6 medium, 1 low. Incorporated 7; dismissed 0; barred 0;
carries 0.

### `PR-R2-01` — positive relation and inversion are separate predicates

`statesMovingPinnedLaw` now detects duplication from the positive expiry and
current-tree/pinned relationships alone. `lawIssues` separately rejects common
negation around the premise, expiry, and route (`false that`, `cannot`, `won't`,
`no longer`, `does not ever`, `do not assert`). DSP3 exercises premise-prefix,
expiry, and route inversions; an inversion mention can no longer mask a duplicate
in another reference.

### `PR-R2-02` — complete static-import statements

Both files enumerate `^import …;` statements across line breaks and extract
`from` or side-effect specifiers. Multiline/aliased and `import "node:https"`
forms therefore reach the prohibited-builtin checks. IDV17's call-shape bans
remain defense in depth rather than its import parser's substitute.

### `PR-R2-03` to `-05` — residual witnesses closed

- DSP5 adds a `runProcess(["git", "show", "origin/main:path"])` positive.
- DSP14 now requires one comment to contain `phase-spec.md`, the exact
  `must preserve the premise-durability law` instruction, bold `**DSP3**`, and
  the full HTTPS Spec verification-scenarios link.
- IDV33 extracts the entire contiguous comment block before checking ownership
  and forbidden history, so appended comment text stays in scope.

### `PR-R2-06` / `-07` — publication evidence and Markdown grammar

The proposed PR body now reports 519/30 tests. IDV14 accepts one-or-more dash
separator cells, with a dedicated short-separator mutation; prose rows remain
clean.

## Carry and frozen-surface checkpoints

No `CARRY-TO-BUILD`, `CARRY-TO-IMPLEMENT`, or `CARRY-TO-BACKLOG` was minted.
The S1 handoff remains landed at issue #192 comment 5202737602 and is exercised
by T2's strengthened `static.handoff`. ASD19 passes and no FROZEN path changes.

## Dismissal posture

Rounds 1 and 2 incorporated every finding (8/8, then 7/7). That continues the
already-disclosed 100%-incorporation smell from the Spec panel; it is not
labelled diligence. Every finding was reproduced or checked against source
before incorporation, and no reviewer recommendation was actioned solely to
avoid disagreement.
