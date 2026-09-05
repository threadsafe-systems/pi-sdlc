# PR review — panel dispatch hygiene: consolidated adjudication

Orchestrating model: `anthropic/claude-opus-5` (author; excluded from the panel).
Branch under review: `feat/panel-dispatch-hygiene`; round 1 target `ecd0cf44`.
PR: #274.

## Panel and dispatch record

Resolved panel (floor 3, author excluded, track `reversible`):
`anthropic/claude-fable-5-1:xhigh`, `openai-codex/gpt-5.6-sol:xhigh`,
`openai-codex/gpt-5.6-luna:xhigh`.

- **Wave 1 original** (harvest label 1): `sol` and `luna` returned verdicts.
  `fable-5-1` infra-failed at launch with `claude_code_version_too_old` — the
  child runtime presents Claude Code 2.1.75 and the model requires 2.1.251+.
  Non-transient, so no same-model retry was attempted.
- **Wave 1 recovery** (harvest label 2): `fable-5-1` replaced by
  `zai/glm-5.3:xhigh`, the next untried candidate that a dispatch-path probe
  had shown to be live. `deepseek/deepseek-v4-pro` sits ahead of it in the pool
  and was skipped: the same probe returned `402 Insufficient Balance`.
- Harvest label ↔ logical wave: labels 1 and 2 are both **logical wave 1**.
- Dispatch budget: 2,700,000 ms (45 min), the floor this PR introduces. The
  diff is 5 files / 486 lines, below both size triggers.

Every reviewer was dispatched with an explicit budget, so wave 1 dogfooded the
rule under review.

## Round 1 findings (22 raw → 15 deduped)

| id | sev | raised by | finding | disposition |
| --- | --- | --- | --- | --- |
| PR-R1-01 | H | luna | §5's in-harness recipe emits `subagent({ tasks: [...] })`, a shape the installed pi-subagents API rejects as removed legacy orchestration; it also names `wait` where the tool is `bg_wait`. Neither dispatch path can express the new budget. | **Incorporated** |
| PR-R1-02 | M | sol · glm | Wave-level budget raise is unquantified — no factor, no once-only, no aggregate ceiling. Worst case on this repo's pool is 8 × (90+180) = 2,160 model-minutes. | **Incorporated** |
| PR-R1-03 | M | sol · glm · luna | The route-twin claim "never appears in the resolved panel" is false: `resolve-panel.mjs` checks credentials *before* dedupe, so an uncredentialed direct route promotes the twin to a full panelist. | **Incorporated** |
| PR-R1-04 | M | sol · glm | The 45/90 calibration misreports its only observation: 55 changed files (not 70), and 2 of 3 reviewers timed out (opus failed on `AccessDeniedException`). The ≥30-file/≥2,000-line trigger has no calibration at all. | **Incorporated** |
| PR-R1-05 | M | glm | "Every id … answered by a live probe" is false — 4 of 25 ids were probed. A one-shot PONG also cannot establish *dispatchability*, which is the property the roster actually needs. | **Incorporated** |
| PR-R1-06 | M | sol | The rule treats every timeout as deterministic, but a provider hang also consumes the deadline — so it doubles the budget on a stalled route before trying the twin. | **Incorporated** |
| PR-R1-07 | M | sol | The detached path (`dispatch.sh`) has no timeout option, so a headless session cannot comply with the new rule. | **Incorporated** |
| PR-R1-08 | M | luna | Both documented resolver invocations omit `--track`, which this repo's per-track overrides make mandatory; the documented command exits before resolving. | **Incorporated** |
| PR-R1-09 | M | sol · luna | A4 waives the tracker projection on the claim that #268/#270 are "labelled and on the shared board". Both have `labels: []` and neither is on project 5. | **Escalated** |
| PR-R1-10 | M | sol | `review.tasks: subagent` requires a committed PV1 manifest and task-validation receipt per task; neither T1 nor T2 has one. The `CARRY-TO-IMPLEMENT` is not discharged. | **Escalated** |
| PR-R1-11 | L | sol · glm · luna | "No entry changed position; only ids moved" is false — `pr_review` grew 8→9 and four entries shifted index. | **Incorporated** |
| PR-R1-12 | L | glm | "timeout" is still enumerated under the transient retry-then-replace remedy that the new rung declares futile, two paragraphs above it. | **Incorporated** |
| PR-R1-13 | L | glm | `phase-implement.md:246` still classes a provider timeout as noise warranting a same-budget retry, contradicting §5's unscoped reclassification. | **Incorporated** |
| PR-R1-14 | L | luna | The config `$comment` has become process archaeology — dates, ticket diagnoses, probe records, supersession notes — and is republished into the generated companion. | **Incorporated** |
| PR-R1-15 | L | glm | CI was red: `commit-lint` rejected the PR title as non-conventional. | **Incorporated** — fixed during round 1 |

Raw-to-deduped: sol 8, luna 6, glm 8 = 22 raw; 15 after collapsing the three
route-twin reports into PR-R1-03, the three position reports into PR-R1-11, and
the two calibration reports into PR-R1-04.

## Cross-model agreement

Three independent reviewers raised the route-twin overclaim and the
position-stability error. Two raised the missing wave ceiling and the
calibration misreport. Agreement across vendors is the strongest signal in the
set, and every one of those four is a **factual** error rather than a judgement
call — the panel was not disagreeing with the design, it was catching untrue
statements.

## Author's assessment

Five assertions this author committed to durable artifacts were falsified:

1. "every id … answered by a live probe" — 4 of 25 were probed (PR-R1-05)
2. "No entry changed position" — four entries moved (PR-R1-11)
3. "#268/#270 are labelled" — both carry no labels (PR-R1-09)
4. "`npm test` fails 29 of 616 on `main`" — it is 616/616 green under a
   canonical `TMPDIR`; the failures were a local path artefact, and a prior run
   in this repo already knew it
5. §5's calibration — 55 files and 2 of 3 reviewers, not 70 and all

The common cause is not carelessness about any single fact; it is writing
confident claims into shipped prose from recall rather than re-deriving each
one at the moment of writing. The verification that did happen was real but
selective, and selective verification reads exactly like thorough verification
once it is committed.

Two of these — PR-R1-01 and PR-R1-08 — were failures this author personally hit
while dispatching this very panel, worked around silently, and did not
recognise as defects in the document being edited.

## Escalations for the human

- **PR-R1-09 (tracker projection).** A4's premise is false. Either produce the
  epic-plus-sub-issue projection the Build contract requires at threshold, or
  label #268/#270, add them to board 5, and restate A4 on what is actually
  true. Recommendation: the latter — the projection's purpose is a workable
  frontier, and two labelled board items give that for a two-file change.
- **PR-R1-10 (task-validation receipts).** `review.tasks: subagent` was not
  honoured. Recommendation: run `task_validate` for T1 and T2 and commit the
  receipts before the gate passes, rather than waiving a configured control.
- **Roster remediation scope** (author-raised, not a panel finding): a
  dispatch-path probe found `fable-5-1` undispatchable here (this PR's own
  regression), `deepseek-v4-pro`/`-flash` at `402`, and `haiku-4-5` failing an
  identity check. How much is fixed in this PR is an open question to the owner.

## Verdict

Three REVISE verdicts, no surviving disagreement between reviewers. Round 1
does not pass. A fix wave is required, after which round 2 is a delta review
scoped to the fix range.
