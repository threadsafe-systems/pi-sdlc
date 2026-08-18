# Consolidated adjudication: spec panel, S2 plan artifact skeleton

- Target: `docs/specs/2026-08-14-plan-artifact-skeleton.md`
- Round 1 commit under review: `2b521ff` (rev 1)
- Panel phase: `spec_review` (floor 2, track irreversible, `onShortfall: fail`)
- Orchestrator/adjudicator: `anthropic/claude-fable-5` (session identity, verified via `PI_MODEL`)
- Reviewers, round 1: `openai-codex/gpt-5.6-luna:xhigh` (`round1-gpt-5.6-luna.md`), `zai/glm-5.2:xhigh` (`round1-zai-glm-5.2.md`)
- Roster note: `google/gemini-3.1-pro-preview:xhigh` (first in the configured prefer list after author exclusion) was skipped without dispatch: it infra-failed this same session's plan-panel round 1 with a non-transient HTTP 429 (prepay credits depleted), so it was replaced by the next credentialed model per the reviewer-dispatch recovery rule rather than re-burning a dispatch on a known-dead credential. Floor 2 met with two verdicts; no shortfall.
- glm's review opened with byte-level grounding verification (L1/L2/L3 accuracy, GPC pins, M5 count, FS11 inverse completeness, golden/consumer resolution) — all confirmed, matching the orchestrator's own pre-authoring checks.

## Round 1 — findings and dispositions

8 raw findings (luna 3 medium; glm 3 medium + 2 low), deduped to 7: luna-F1 and glm-NEW-2 are the same defect (M3/PAS4 not gating C3's per-letter anchor distribution). All verified against the tree at `2b521ff` before disposition.

| ID | Sev | Source | Finding (gist) | Verified evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| SPEC-R1-01 | medium | luna-F1 + glm-NEW-2 | M3/PAS4 assert only a union of anchors across A–E, so a degenerate distribution passes while violating C3's per-letter map; surface A pre-contains "Definition of done" so union checks lean on pre-existing text | spec C3 vs M3; `adversary-plan.prompt.md` surface A; S1's shipped coverage-map assertion in `test/spec-artifact-skeleton.test.js` | **incorporated** — M3/PAS4 pin exactly one anchor per letter with the full per-letter coverage map, S1's shipped pattern |
| SPEC-R1-02 | medium | glm-NEW-1 | "FS19" — an unresolvable process id — would be frozen into shipped §4 prose and GPC2's pin, violating the slice's own no-process-citations law for shipped surfaces | repo-wide grep: zero FS19 hits in `skills/`, `test/`, `CONTRIBUTING.md`; S1's shipped §4 carries only resolvable package paths | **incorporated** — surviving rule re-worded self-descriptively ("the deliberate-change discipline: a recorded unfreeze with a mandatory re-freeze"); replacement pin now 62 characters, still under GPC10's bound. Within the gate ratification: the owner ratified the supersession and surviving-rule semantics, not a byte-string |
| SPEC-R1-03 | medium | luna-F2 | Portability NFR bound to PAS11/PAS12, neither of which verifies the whole-slice dependency/tooling boundary (that lives in PAS10's diff inspection) | NFR row vs PAS11/PAS12 scope | **incorporated** — row re-bound to PAS10 + PAS12 with the split stated in the measure |
| SPEC-R1-04 | medium | luna-F3 | The three inspection scenarios (PAS10/13/14) carry no proportionality budget; PAS10 reads the full diff unboundedly | Performance row lists only command bounds | **incorporated** — each inspection scenario states its budget (rides the already-dispatched gate panel, bounded inspected set; an over-permitted diff fails PAS10 instead of expanding review); new NFR row binds it |
| SPEC-R1-05 | medium | glm-NEW-3 | M8's "mandate phrasing" is not decidable as a string assertion — implementers can ship different denial sets | S1's shipped M8 is a crisp literal set | **incorporated** — M8 fixed as five literal substrings (`Cucumber`, `Behat`, `Gherkin`, `linter`, `CI check`) + the required guidance sentence |
| SPEC-R1-06 | low | glm-NEW-4 | PAS5's Falsify overclaims: partial sub-spans do not fail M4's full-sentence matching | S1's shipped M4 semantics | **incorporated** — Falsify re-worded honestly (full-sentence matching by design) |
| SPEC-R1-07 | low | glm-NEW-5 | C6's mandated comment, if contiguous with the ownership block above IDV19, is absorbed by IDV33's process-history guard and fails on the word "plan" | `test/iteration-disposition.test.js:460-486` commentBlock expansion + the case-insensitive process-history regex (word-bounded alternation of Plan, panel, PR, removed, retired); "adversary-plan" contains a standalone `plan` token | **incorporated** — C6 pins the comment's placement inside the IDV19 test body adjacent to the filtered loop |

Tally, round 1: 5 medium / 2 low; **7 incorporated, 0 dismissed**.

## CLEAR reconciliation

- luna: A (L3 byte-checked), D (canonical sentences match the plan), E, G. glm: D, E (with its full grounding walk), F, PROPORTIONALITY.
- glm's PROPORTIONALITY CLEAR conflicts with luna's SPEC-R1-04 (inspection budgets): adjudicated **in favour of the finding** — glm's CLEAR covered command-running scenarios, luna's finding targets the inspection scenarios, which indeed carried no bound at rev 1.

## Round 2 — delta review of `2b521ff..9b40119` (rev 2)

- Round 2 commit under review: `9b40119` (rev 2); reviewers: `openai-codex/gpt-5.6-luna:xhigh` (`round2-gpt-5.6-luna.md`), `zai/glm-5.2:xhigh` (`round2-zai-glm-5.2.md`). No infra events.
- All seven round-1 fixes confirmed by both reviewers; glm re-verified the delta byte-level (L1/L2/L3 re-diffed, GPC2 ordering survival, the 62-char pin's GPC10 safety, denial-set self-collision check — "CI/CD" does not contain "CI check" — IDV19/IDV33 placements, golden's zero REVIEWER_TAG derivation, the `None at rev 3.` target line).
- 3 raw findings deduped to 2 (both reviewers caught the stale pin count independently).

| ID | Sev | Source | Finding (gist) | Verified evidence | Disposition |
| --- | --- | --- | --- | --- | --- |
| SPEC-R2-01 | medium | luna + glm | PAS3 still asserted the revoked 66-character pin count; the re-worded pin measures 62 — an internal contract/scenario contradiction | `wc -c` on the pin literal = 62; 66 was the rev-1 FS19-worded variant's length | **incorporated** — PAS3 now says 62-character |
| SPEC-R2-02 | medium | luna | The gate-inspections NFR row's stimulus covers spec + PR gates but bound only PAS10 (the PR-diff half), leaving the spec-gate half outside the verification contract | NFR row vs PAS13 (spec gate) / PAS14 (PR gate) | **incorporated** — row re-bound to PAS10, PAS13, PAS14 |

Tally, round 2: 2 medium; **2 incorporated, 0 dismissed**. Round-2 CLEARs: luna A/C/E/G/PROPORTIONALITY; glm A/B/C/E/F/G/PROPORTIONALITY — no conflicts.

**Convergence adjudication:** severities falling (5M/2L → 2M), zero reopens, every prior fix independently confirmed, and both round-2 findings are one-word/one-cell corrections. The panel has converged; adjudicated to proceed to the owner gate at rev 3 rather than dispatch a third round over two count/binding fixes the gate inspects directly.

Cumulative: **9 findings, 9 incorporated, 0 dismissed** across 2 rounds (one fix-shape alternative — a second golden pipeline — was rejected back at the plan panel; none arose here).

## Escalations

None new. The two standing plan-gate ratifications (GPC supersession, #146 close-as-superseded) are already owner-approved; SPEC-R1-02's re-wording stays within the ratified supersession's semantics (recorded above).
