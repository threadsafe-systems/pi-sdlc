# PR review — plan artifact skeleton (S2): consolidated adjudication

Orchestrating model: `anthropic/claude-fable-5` (author; excluded from the panel).
Branch under review: `feat/plan-artifact-skeleton`; round 1 target `2f8be30`.

## Panel and dispatch record

Resolved panel (floor 3, author excluded): `openai-codex/gpt-5.6-sol:xhigh`,
`openai-codex/gpt-5.6-luna:xhigh`,
`amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh`.

- **Wave 1 original** (harvest label 1): all three children infra-failed with
  zero verdicts — sol and luna hit the 30-minute child timeout mid-review;
  opus-4-8 failed at launch (`AccessDeniedException`: the AWS role lacks
  `bedrock:InvokeModelWithResponseStream` on that inference profile —
  non-transient credential failure).
- **Wave 1 recovery** (harvest label 2): sol and luna retried once with a
  raised budget per the transient-retry rule; opus replaced by the next
  untried credentialed model in the configured prefer pool,
  `deepseek/deepseek-v4-pro:xhigh`. All three returned verdicts. No model
  verdict was discarded (the originals produced none), and no failed model
  counts against the floor.
- Harvest label ↔ logical wave: labels 1 and 2 are both **logical wave 1**;
  round 2's delta dispatch takes label 3.

## Round 1 findings (deduped 8 raw → 7)

| id | sev | raised by | finding | disposition |
| --- | --- | --- | --- | --- |
| PR-R1-01 | M | sol + luna + deepseek | Plan and Spec `Status:` lines still said "owner approval pending", contradicting the spec's own Plan pointer, the build doc, the AM1 record, and the PR body | **Incorporated** — both status lines now record owner approval 2026-08-14 with the two ratifications |
| PR-R1-02 | M | sol | Manifest `timeoutMs` kill-switches (300 s / 120 s / 60 s) sat far above the governed budgets (30 s / 1 s / 5 s), so PAS11's bound was not enforced by the machinery that marks it PASS | **Incorporated** — every check across t1–t5 tightened to its committed budget; class-b build amendment recorded; the five receipts attest the pre-amendment runs and their runner reports show measured durations inside budget; runner re-run PASS under the tightened budgets (corpus 3.5 s, single files ≤ 77 ms, checks ≤ 228 ms) |
| PR-R1-03 | M | sol | M3 searched the whole attack-surface segment for coverage names, so anchor-sentence drift passed (sol verified by mutation) | **Incorporated** — M3 now scopes name assertions to the anchor sentence (the sentence carrying the skeleton citation); sol's exact mutation replayed post-fix and is caught |
| PR-R1-04 | L | sol | `validator.md` in each receipt bundle names the validator's scratch report path, not the committed `runner-report.json` | **Recorded, no fix** — validator.md files are verbatim copies of validator output; rewriting them would falsify the record. Convention, stated here durably: at bundle assembly the scratch report is relocated to `runner-report.json` adjacent to `validator.md` in the same bundle |
| PR-R1-05 | L | sol | The IDV19 exemption comment and the M6/M7 section marker narrate lifecycle provenance (AM ids, "on this branch", future deletion) rather than a current invariant | **Escalated to owner** — contradicts ratified spec C6, which mandates exactly that comment, its AM1/AM3 citation, and its placement (M7 pins it mechanically). Recommendation: dismiss — the citation is the spec's chosen discoverability mechanism for the unfreeze window, temporariness *is* the code's current invariant, and the re-freeze deletes both comments |
| PR-R1-06 | L | luna | IDV19's test name claimed "contains every adversary prompt" while the body exempts `plan` | **Incorporated** — name window-qualified ("plan exempt in this unfreeze window"); the original name's restoration folded into the PR body's re-freeze component 2; M7 unaffected (anchors on the `test("IDV19:` prefix) |
| PR-R1-07 | L | luna | `frozen-surfaces.test.js` header prose still says the suite protects plan/spec/task-validator prompts | **Dismissed** — a header edit would add a hunk outside PAS10's permitted change class for that file (the single FROZEN-entry removal) to fix a transient prose nit; the array itself is the authoritative membership statement, the window is documented at the governing sites (IDV19's exemption comment, M6/M7, spec AM1/AM3), and the re-freeze restores full coverage |

Cross-model agreement: PR-R1-01 raised independently by all three reviewers.
Dismissal posture: 4 incorporated, 1 recorded, 1 dismissed with reason, 1
escalated with a dismissal recommendation — not a 100%-incorporation wave.

deepseek's inspection walk (PAS10 all 55 files hunk-by-hunk, PAS13 gap
traceability, PAS14 obligations) returned CLEAR with executed mechanics
(618/618 corpus, receipts verified, GPC2 pin 62 chars, no carries minted).

## Escalations for the owner

- **E1 (PR-R1-05):** panel asks to strip the AM1/AM3 provenance comments;
  ratified C6 mandates them. Owner decides; recommended disposition: dismiss
  (reason above). Not absorbed, not silently dismissed.

## Round 2

Delta review over `2f8be30..d81be3e` with this dispositions table; full panel
(three reviewers) since wave 1 carried three mediums. Verdicts pending.
