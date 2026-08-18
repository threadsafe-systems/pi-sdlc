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
| PR-R1-05 | L | sol | The IDV19 exemption comment and the M6/M7 section marker narrate lifecycle provenance (AM ids, "on this branch", future deletion) rather than a current invariant | **Dismissed — human-ratified 2026-08-15 (human:neil)**, binding forward: ratified spec C6 mandates exactly that comment, its AM1/AM3 citation, and its placement (M7 pins it mechanically); the citation is the spec's chosen discoverability mechanism for the unfreeze window, temporariness is the code's current invariant, and the re-freeze deletes both comments |
| PR-R1-06 | L | luna | IDV19's test name claimed "contains every adversary prompt" while the body exempts `plan` | **Incorporated** — name window-qualified ("plan exempt in this unfreeze window"); the original name's restoration folded into the PR body's re-freeze component 2; M7 unaffected (anchors on the `test("IDV19:` prefix) |
| PR-R1-07 | L | luna | `frozen-surfaces.test.js` header prose still says the suite protects plan/spec/task-validator prompts | **Dismissed** — a header edit would add a hunk outside PAS10's permitted change class for that file (the single FROZEN-entry removal) to fix a transient prose nit; the array itself is the authoritative membership statement, the window is documented at the governing sites (IDV19's exemption comment, M6/M7, spec AM1/AM3), and the re-freeze restores full coverage |

Cross-model agreement: PR-R1-01 raised independently by all three reviewers.
Dismissal posture: 4 incorporated, 1 recorded, 1 dismissed with reason, 1
escalated with a dismissal recommendation — not a 100%-incorporation wave.

deepseek's inspection walk (PAS10 all 55 files hunk-by-hunk, PAS13 gap
traceability, PAS14 obligations) returned CLEAR with executed mechanics
(618/618 corpus, receipts verified, GPC2 pin 62 chars, no carries minted).

## Escalations for the owner

- **E1 (PR-R1-05):** resolved — dismissed, human-ratified 2026-08-15
  (human:neil); the ratified dismissal binds forward per the adjudication
  contract.

## Round 2 (harvest label 3)

Delta review over `2f8be30..482bd95` (the fix wave `d81be3e` plus the
review-artifacts commit `482bd95`) with the round-1 dispositions table; full
panel (sol, luna, deepseek) since wave 1 carried three mediums.

Prior fixes: PR-R1-01, PR-R1-02, and PR-R1-06 confirmed RESOLVED by every
reviewer; PR-R1-04/05/07 respected without reopen (PR-R1-05's owner verdict
still pending as E1). Round-2 findings, deduped 5 raw → 3:

| id | sev | raised by | finding | disposition |
| --- | --- | --- | --- | --- |
| PR-R2-01 | M | sol REOPENED(PR-R1-03) + deepseek | `anchorSentence` sliced from the pre-citation terminator to the segment end, so a coverage name drifted into a trailing sentence still passed (both reviewers proved it by mutation — a legal reopen: the evidence arises from the round-1 helper itself) | **Incorporated** — the helper now terminates at the first sentence terminator after the citation; both reviewers' forward-drift mutations plus sol's round-1 in-sentence mutation replayed and all are caught, the unmutated prompt passes |
| PR-R2-02 | M | sol + luna (deepseek L) | `.tmp-t3-report.json` — a stale scratch runner report with an ERROR verdict no committed manifest state produces — was swept into `d81be3e` by a `git add -A`, landing outside PAS10's permitted classes and contradicting the committed t3 PASS receipt | **Incorporated** — `git rm`'d in this wave; fix-wave commits now stage explicit paths, never `-A` |
| PR-R2-03 | L | sol + deepseek | This record stated round 2's range as `2f8be30..d81be3e` (excluding the commit it ships in) and carried future-narrating "Verdicts pending" prose | **Incorporated** — range corrected above; the pending line replaced by this adjudication |

Round-2 incorporation is 3/3 — flagged per the dismissal-posture rule, with
the mitigating note that two of the three are mechanical hygiene defects
(committed scratch file, wrong recorded range) admitting no reasonable
dismissal, and the third is a proven test-strength gap.

## Round 3 (harvest label 4)

Delta review over `482bd95..f4ababf` (the round-2 fix wave and this record's
round-2 sections); full panel (sol, luna, deepseek) since round 2 carried two
mediums. PR-R2-02 and PR-R2-03's round-2 correction confirmed RESOLVED by all
three; PR-R2-01 confirmed for `.`-terminated drift and re-reopened for the
residual class. Round-3 findings, deduped 6 raw → 2 (both raised by all
three reviewers independently):

| id | sev | raised by | finding | disposition |
| --- | --- | --- | --- | --- |
| PR-R3-01 | M | all three, REOPENED(PR-R2-01) | The round-2 forward bound matched only `.` — an anchor sentence ending `?` or `!`, or left unterminated, still let coverage names drift into a trailing sentence (each variant proven by mutation) | **Incorporated** — the forward bound now matches `[.?!]` symmetrically with the backward bound, and an unterminated anchor sentence fails outright (`anchorSentence` returns null and M3 asserts termination). Replay battery: all three rounds' six drift mutations caught, the trailing-question control and the unmutated prompt pass |
| PR-R3-02 | L | all three | The round-3 placeholder section this file carried re-introduced both PR-R2-03 patterns: an out-of-repo range pointer and future-narrating append prose | **Incorporated** — this section now records the completed round with its exact range; the convention henceforth: a round's section is written only once its verdicts are adjudicated, so this file never carries placeholders for unfinished rounds |

## Round 4 (harvest label 5; cap round)

Delta review over `f4ababf..0092099` (the round-3 fix wave and its
artifacts); full panel. PR-R3-02 confirmed RESOLVED by all three; PR-R3-01
confirmed for every battery variant and re-reopened for a residual class.
Round-4 findings, deduped 4 raw → 3:

| id | sev | raised by | finding | disposition |
| --- | --- | --- | --- | --- |
| PR-R4-01 | M | all three, REOPENED(PR-R3-01) | An anchor sentence stripped of its terminator while a later terminated sentence follows folds that later text into the extracted slice, so drifted names still pass (mutation-proven at `0092099`) | **Resolved by restructure** — human-ratified 2026-08-15 (human:neil, cap option b); the parser is deleted, so the defect class has no code to live in. Verification appendix below |
| PR-R4-02 | M | deepseek | The backward bound matches only space-suffixed terminators (`". "`), so a `.\n` line-wrap boundary hides backward drift (mutation-proven) | **Resolved by restructure** — same ratification |
| PR-R4-03 | L | luna | The round-3 root-cause paragraph narrated dispatch-time process in the durable record | **Incorporated** — paragraph removed in this wave |

## Cap diagnosis (round cap reached; no round 5 dispatched)

The 4th full round still carries mediums, so per the cap no 5th round runs
and the survivors go to the owner with a diagnosis.

**Diagnosis: churn generated by our own fix waves (cap option b).** The
anchor-guard lineage — PR-R1-03 → PR-R2-01 → PR-R3-01 → PR-R4-01/02 — has
attacked the *fix* each round, not the shipped diff: round 1 found the real
defect (segment-wide name search), and every later medium was a mutation
against the parser introduced by the previous wave. Every other surface of
the branch (skeleton, §4 rules, prompt anchors, manifests, lifecycle docs,
receipts, carry landing) has been CLEAR since round 2. A regex sentence
parser converges on an English-sentence-boundary oracle it cannot express;
iterating it further manufactures findings.

**Restructure proposed (not a re-dispatch):** delete `anchorSentence`
entirely and pin each surface's anchor sentence as a verbatim literal in the
test, the repo's established byte-pin idiom (frozen surfaces, the GPC2 pin,
L1/L2 blocks). M3 then asserts: the pinned literal appears in its surface's
segment, the skeleton path appears exactly once per segment (so the only
citation is the pinned sentence's own), and each literal names its coverage
sections (self-evident by content, checked once at pin time). Sentence
parsing — terminator classes, whitespace classes, paragraph bounds —
disappears; any edit to an anchor sentence, including every mutation class
raised in rounds 1–4, is a byte-level pin break. The trade-off is the
standard one for this repo's pins: a deliberate anchor change must update
the pinned literal, which is exactly the attention the deliberate-change
discipline wants.

**Restructure verification (ratified plan, executed).** `anchorSentence`
is deleted; the five anchor sentences are byte-pinned constants and M3
asserts each appears verbatim in its surface's segment, that the skeleton
path occurs exactly once per segment, and that each pin names its coverage
sections. Deterministic battery at the restructure commit: all seven drift
mutations raised across rounds 1–4 (in-sentence wording, `.`/`?`/`!`
forward drift, unterminated same-sentence, unterminated trailing-paragraph
fold, `.\n` backward line-wrap) are caught; a benign trailing sentence
passes; a smuggled second citation is caught; the unmutated prompt passes
29/29 with the full corpus green. A single-reviewer sub-floor confirmation
dispatch (exempt from the round cap per the floor rule) verified the
restructure delta: CONFIRMED — pins byte-identical to the shipped prompt,
no parser logic remains, all mutation classes fail, no new hole found
(`round-confirm-deepseek-v4-pro.md`). The panel carries no surviving high
or medium finding.

**Artifact-inventory self-audit** (round ↔ record ↔ events ↔ harvest):
round 1 ↔ §Round 1 ↔ `panel.dispatched` ×2 (original + recovery)/
`panel.consolidated` r1 ↔ labels 1 (failed original) and 2 (recovery);
round 2 ↔ §Round 2 ↔ r2 events ↔ label 3; round 3 ↔ §Round 3 ↔ r3 events
↔ label 4; round 4 ↔ this section ↔ r4 events ↔ label 5.
