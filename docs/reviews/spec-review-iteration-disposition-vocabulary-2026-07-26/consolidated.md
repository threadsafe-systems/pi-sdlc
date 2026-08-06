# Spec panel — iteration & disposition vocabulary (S5)

- **Artifact under review (round 1):** `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `c0e8d22`
- **Phase:** `spec_review` · **Track:** irreversible · **Floor:** 2 · **onShortfall:** fail
- **Panel:** `anthropic/claude-fable-5:xhigh`, `google/gemini-3.1-pro-preview:xhigh`
- **Orchestrator / author identity:** `anthropic/claude-opus-5` (excluded from the panel)
- **Harvest:** `.pi/sdlc/runs/iteration-disposition-vocabulary/panels/spec_review-round1-2026-07-26`

Ids are run-scoped, `SPEC-R<round>-<nn>` per the closed prefix mapping this Spec
now defines.

## Round 1 — 1 high, 14 medium, 2 low · incorporated 17, dismissed 0

fable-5 returned 14 findings, gemini 6, with 3 duplicates — the widest wave of
the run. The Spec was rewritten whole rather than patched (three findings were
enumeration/pointer drift, the class this run regenerates in every patch wave).

| id | class | origin | sev (adjudicated) | reviewer(s) | finding | disposition |
|---|---|---|---|---|---|
| SPEC-R1-01 | contract gap | NEW | **high** | fable-5 | C3's **outbound** carries had no gating scenario: IDV11 gated only callout *form* (vacuous with zero outbound statements) and IDV12 was inbound-only, so an implementation with no `CARRY-TO-SPEC`/`CARRY-TO-BUILD` at all passed every mechanical scenario | **incorporated** — new **IDV26** asserts both outbound statements exist. Grade upheld high: the slice's headline mechanism was ungated |
| SPEC-R1-02 | count drift | NEW | medium | **both** | C2 header said "Ten additions" over an eleven-row table; IDV5 gated "all ten", so the artifact-inventory self-audit could be silently dropped | **incorporated** — the count is **deleted**, not corrected; IDV5 now asserts *every row of the C2 table* by phrase. (Rev2's first draft reproduced the same defect — "Twelve" over thirteen rows — before the count was removed) |
| SPEC-R1-03 | verifiability gap | NEW | medium | fable-5 | IDV17 forbade any new test spawning a process, but IDV14/IDV16's branch-base byte comparisons are implementable only via `git` subprocess (`frozen-surfaces.test.js:44-48`); and the "<2s" bound named no measurement procedure | **incorporated** — IDV17 now forbids **model and network** calls, permits local `git`; the runtime figure is explicitly **advisory**, not gated |
| SPEC-R1-04 | contract gap | NEW | medium | fable-5 | Plan scope item 11 / DoD 9 (`CONFIG.md` regeneration) appeared nowhere in the Spec, and N1 read as forbidding it | **incorporated** as amendment **A2** + new **IDV24**; N1 narrowed. **Evidence corrected:** the reviewer said no `chore` commit exists, having examined only `bd19184..c0e8d22`; it exists at **`7c2ae92`**. The finding stands, its evidence does not |
| SPEC-R1-05 | amendment discipline | NEW | medium | fable-5 | The §1 class-(b) amendment **violated the class-(b) definition it was freezing**: "amend in place" vs a record living only in the Spec, leaving the approved Plan naming a nonexistent path with no disposition trail | **incorporated** — the **Plan is now amended in place** (scope rows 6 and 11, DoD 5 carry `AMENDED, class (b)` markers pointing at spec §1), and C4(b) gains the rule that a later-phase amendment may keep its full record downstream *only* with an in-place marker upstream |
| SPEC-R1-06 | vocabulary collision | NEW | medium | fable-5 | Ratified-collision escalation contradicts the existing "**Only** proposed dismissals … escalate" sentence (`phase-pr-review.md:205-207`), and no reconciling amendment was specified | **incorporated** — C2 row 5 explicitly amends that sentence to admit a third case |
| SPEC-R1-07 | vocabulary collision | NEW | medium | fable-5 | The glossary defines `defect class` while the file it points at says "**finding class**" (`phase-pr-review.md:211,:217`) — a grep for either finds nothing of the other; D12's two-names-one-concept defect, recreated in the opposite direction | **incorporated** — the alias is stated in §2, added at the existing text by C2 row 13, and gated by IDV2 |
| SPEC-R1-08 | contract gap | NEW | medium | fable-5 | Id prefix underivable: panel phases are `plan_review`/`spec_review`/`pr_review`, the example was `PLAN`; `REOPENED(<id>)` resolution depends on predictable ids | **incorporated** — closed mapping (`plan_review→PLAN`, `spec_review→SPEC`, `pr_review→PR`, `task_validate→TASK`) in §2, gated by IDV2 |
| SPEC-R1-09 | contract gap | NEW | medium | fable-5 | "Barred" is a named outcome with **no legal value** in the closed disposition set, so a barred reopen's mandatory disposition field has nothing to record | **incorporated** — `barred` added as a fifth disposition, distinct from `dismissed` because it is a mechanical consequence of the evidence rule rather than a human-ratified verdict (assumption 4 records that this is additive) |
| SPEC-R1-10 | routing error | NEW | medium | **both** | §2 and C1 pointed "carry destinations" at **C7** (frozen surfaces); they live in C3 | **incorporated** — both pointers corrected |
| SPEC-R1-11 | count drift | NEW | medium | fable-5 | IDV21 was labelled `mechanical` while defining itself as no-standing-test; the coverage line claimed 19/4 where the labels gave 20/3 | **incorporated** — new **`diff-inspection`** kind for IDV21; coverage recounted from the labels (23/4/1 = 28) |
| SPEC-R1-12 | contract gap | NEW | medium | fable-5 | The mandatory origin tag had no home in the prompts' STRICT closed field lists (`adversary-review`: "Return ONLY … nothing else"), so a format-compliant reviewer could legally omit it | **incorporated** — C6 item 2 adds an `origin:` field to each prompt's output format, gated by **IDV28** |
| SPEC-R1-13 | contract gap | NEW | medium | **both** (gemini high, fable low) | C3 named no section for `phase-implement.md` while IDV12 asserted "named reference **and section**" — unimplementable | **incorporated** — §4 landing + §5 block, **plus** a fallback the panel did not reach: under `review.tasks: off` there is no PASS gate (`phase-implement.md:71-73`), so §5 routes the obligation to the PR panel's carry-landing surface. Adjudicated **medium** between the two grades, recorded |
| SPEC-R1-14 | contract gap | NEW | medium | gemini | C5 defined the spec-gap log as gaps "found during decomposition", which cannot receive an inbound `CARRY-TO-BUILD` (those originate at Spec) | **incorporated** — definition broadened to "found during decomposition *or* carried inbound from Spec" |
| SPEC-R1-15 | proportionality | NEW | medium | gemini | C5's `assumption-recorded` composition rule was gated by no scenario | **incorporated** — new **IDV27** |
| SPEC-R1-16 | verifiability gap | NEW | low | gemini | `CARRY-TO-BACKLOG` was forced behind an "under your configuration" callout though terminal and universally available | **incorporated** — explicitly exempted in C3 and IDV11 |
| SPEC-R1-17 | count drift | NEW | low | fable-5 | The glossary's ≤60-line budget was mechanically countable but gated only by panel judgement | **incorporated** — new **IDV25** counts it mechanically |

### Cross-model signal

Three findings were raised independently by both models (`SPEC-R1-02`, `-10`,
`-13`) — treated as strengthened, not merely deduplicated. One genuine severity
disagreement is recorded rather than smoothed: `SPEC-R1-13` (gemini high, fable
low), adjudicated medium.

### Dismissal posture — fifth consecutive wave at 100%

45 findings across five waves, 0 dismissals. Reported per the rule. The nearest
thing to a dismissal this wave is `SPEC-R1-04`, where the *finding* was
incorporated but its *evidence* was corrected — recorded rather than passed
through, since propagating a false claim about the branch history would be its
own defect.

### Artifact-inventory self-audit

| Round | Reviewer outputs | Consolidated | `panel.dispatched` | `panel.consolidated` | Harvest |
|---|---|---|---|---|---|
| 1 | `round1-claude-fable-5.md`, `round1-gemini-3.1-pro-preview.md` | this file | emitted | emitted | `spec_review-round1-2026-07-26` |

**Ratified-decision collisions:** none. No finding demanded reopening D1–D12.

### Dispatch-layer note

The acceptance layer marked the gemini child `failed` for "completed without
making edits" a **third time** this run, despite `acceptance: attested` and an
explicit READ-ONLY instruction. Verdict complete and recovered from
`output-1.log`; no replacement dispatched (`phase-pr-review.md` §5). Still a
`CARRY-TO-BACKLOG` candidate once this slice ships.

---

## Round 2 (delta, `c0e8d22..be21293`) — 3 high, 9 medium · incorporated 12, dismissed 0

**Reviewer roster changed mid-wave.** `anthropic/claude-fable-5:xhigh` was the
resolved panelist and **infra-failed twice without returning a verdict**:
attempt 1 produced 124KB of tool output (directory listings, whole files) and no
findings; attempt 2, under a tightened effort-budget brief, produced 3.9KB that
was the acceptance-report **template echoed back**. Under `phase-pr-review.md`
§5 that is an infra failure, not a verdict — retried once, then replaced with
`openai-codex/gpt-5.6-luna:xhigh`, the next untried credentialed candidate. The
failed model does **not** count against the floor; the wave met `panelSize: 2`
with gemini + luna.

> **Harvest label ↔ wave divergence** (recorded per the harvest rule): all three
> dispatches belong to **wave 2**; harvest labels are `spec_review-round2`
> (failed dispatch), `-round3` (retry), `-round4` (replacement), because a label
> may not overwrite a prior snapshot. `meta.json` carries both numbers.

**A caution recorded against the orchestrator:** `resolve-panel` prints only
enough models to meet the floor, so its two-line output is *not* the candidate
pool. Reading it as exhaustion would have triggered `onShortfall: fail` and an
unnecessary human interrupt; `gpt-5.6-luna`, `glm-5.2`, `deepseek-v4-pro` and
`claude-opus-4-8` were all credentialed and untried.

| id | class | origin | sev (adjudicated) | reviewer(s) | finding | disposition |
|---|---|---|---|---|---|---|
| SPEC-R2-01 | amendment discipline | NEW | **high** | **both** (luna high, gemini medium) | Rev2 changed the Plan's **locked** vocabulary without a recorded amendment: `barred` widened D12's four-value disposition set, and the id format moved from `<panelPhase>-` to `<PREFIX>-`. `barred` was justified in an *assumption* — and an assumption cannot override locked scope | **incorporated** — formalised as Plan amendments **A3** (prefix mapping) and **A4** (`barred`), both with in-place markers on Plan D11, D12 and scope item 1. Grade upheld high: the slice's own amendment discipline was being bypassed by its author |
| SPEC-R2-02 | contract gap | NEW | **high** | luna | `CARRY-TO-IMPLEMENT` had **no outbound minting owner**: C5 permitted it as a spec-gap disposition while C3 gave `phase-tasks.md` no outbound column — a legal disposition no phase could emit | **incorporated** — `phase-tasks.md` §8 is now the outbound owner, and IDV26 gates it |
| SPEC-R2-03 | contract gap | NEW | **high** | gemini | `CARRY-TO-BACKLOG`'s outbound statement was ungated: IDV26 covered only Spec/Plan, IDV13 covered the *checkpoint*, not the minting statement | **incorporated** — IDV26 now gates **all four** outbound statements |
| SPEC-R2-04 | amendment discipline | REOPENED(SPEC-R1-05) | medium | gemini | The Spec claimed A2 was "marked in the Plan itself"; Plan row 11 and DoD 9 carried **no** `AMENDED` marker — so the Spec asserted something false and re-committed the very violation `SPEC-R1-05` fixed | **incorporated** — markers added to row 11 and DoD 9. Legitimate reopen: the evidence (rev2's text) did not exist at disposition time |
| SPEC-R2-05 | routing error | NEW | medium | luna | A1 folded scope item 6 away, but the Plan **Objective** still directed readers to `templates/sdlc-tasks.md` | **incorporated** — Objective pointer amended in place |
| SPEC-R2-06 | verifiability gap | NEW | medium | **both** | C4(b)'s in-place-marker rule was gated by nothing; IDV2/IDV9 only assert the classes appear | **incorporated** — new **IDV32** mechanically asserts that every `A<n>` in Spec §1 has a matching Plan marker |
| SPEC-R2-07 | verifiability gap | NEW | medium | **both** | The `review.tasks: off` fallback was specified in C3 but asserted by no scenario, so "no configuration leaves the carry unchecked" was unenforced | **incorporated** — new **IDV29** |
| SPEC-R2-08 | vocabulary collision | NEW | medium | luna | C2 row 5 required *amending* the existing "Only … escalate" sentence, but IDV5 only checks a phrase exists somewhere in §5 — an implementation could append a third rule and leave the contradiction standing | **incorporated** — new **IDV30**, anchored at `phase-pr-review.md:205-207` |
| SPEC-R2-09 | vocabulary collision | NEW | medium | luna | The `finding class` alias was required *at the binds-forward paragraph* but gated only as "somewhere in §5" | **incorporated** — new **IDV31**, anchored at `:209-217` |
| SPEC-R2-10 | verifiability gap | NEW | medium | luna | C5 froze enum values (`blocker`\|`minor`; three dispositions) that IDV14 never asserted — an arbitrary-valued log would pass | **incorporated** — IDV14 now asserts the exact enums |
| SPEC-R2-11 | count drift | NEW | medium | luna | Coverage arithmetic false (labels give 24/3/1, the summary claimed 23/4/1), and "every contract has ≥1 mechanical scenario" was false — C8 has only the diff-inspection IDV21 | **incorporated** structurally: **all totals deleted**, replaced by a per-contract coverage table, with C8's mechanical-free status stated plainly as a ratified decision (`PLAN-R1-07`). Third occurrence of the counting-drift class in this run |
| SPEC-R2-12 | contract gap | NEW | medium | luna | N5's universal "nothing a consumer repo has committed becomes invalid" is unfalsifiable and contradicts the Plan's own exclusion of consumer repos | **incorporated** — N5 bounded to this repository's named paths; IDV20 rewritten to match |

### Cross-model signal

Three findings were raised independently by both reviewers (`SPEC-R2-01`, `-06`,
`-07`), with one severity disagreement recorded rather than smoothed
(`SPEC-R2-01`: luna high, gemini medium — adjudicated high).

### Convergence note

Round 2's twelve findings cluster into two classes: **(i) the author bypassing
the slice's own amendment discipline** (`-01`, `-04`, `-05`) and **(ii) contract
clauses shipped without a gating scenario** (`-02`, `-03`, `-06`, `-07`, `-08`,
`-09`, `-10`). Class (ii) is round 1's dominant pattern recurring, which is why
rev3 adds five scenarios rather than prose. Class (i) is now structurally
guarded by IDV32.

### Dismissal posture — sixth consecutive wave at 100%

57 findings across six waves, 0 dismissals. Reported per the rule.

### Artifact-inventory self-audit

| Wave | Reviewer outputs | Consolidated | `panel.dispatched` | `panel.consolidated` | Harvest label(s) |
|---|---|---|---|---|---|
| 1 | `round1-claude-fable-5.md`, `round1-gemini-3.1-pro-preview.md` | this file | emitted | emitted | `spec_review-round1` |
| 2 | `round2-gemini-3.1-pro-preview.md`, `round2-gpt-5.6-luna.md` (fable: no verdict, twice) | this file | emitted (×2: original + replacement) | emitted | `spec_review-round2`, `-round3`, `-round4` |

**Ratified-decision collisions (round 2):** none. A3 and A4 amend locked Plan
scope, but as recorded class-(b) amendments with owner-visible markers — not as
absorbed findings.

---

## Round 3 (trim-the-tail confirmation, `be21293..7feaa15`) — 2 medium · incorporated 2, dismissed 0

**Sub-floor dispatch** under D7: one reviewer (`gpt-5.6-luna:xhigh`) against a
floor of 2, recorded as the exemption requires. Wave 3, harvest label 5.

**Eleven of twelve round-2 findings confirmed CLEAR**, each with a file:line
citation, plus explicit CLEARs on coverage completeness and on the judgement
call that deleting the totals lost no verification signal.

| id | class | origin | sev | finding | disposition |
|---|---|---|---|---|---|
| SPEC-R3-01 | verifiability gap | REOPENED(SPEC-R2-06) | medium | "A1's Plan marker still does not point downstream": Plan row 6 allegedly carries `AMENDED, class (b), 2026-07-26` with no pointer to the Spec record, and IDV32 only requires the Plan to contain *some* matching marker | **incorporated** — the factual premise is false: Plan row 6 already points downstream (`Full disposition record: docs/specs/2026-07-26-iteration-disposition-vocabulary.md §1 (A1)`, same row, second cell). The reviewer's structural concern was also incorporated: IDV32 now requires every amended Plan surface to carry an adjacent marker naming that specific record, so a marker elsewhere cannot satisfy the gate |
| SPEC-R3-02 | count drift | NEW | medium | §1's preamble still said "**Both** are class (b)" after A3 and A4 were added — four records under a two-record cardinality | **incorporated** — the cardinality is **deleted**, not corrected. Fourth occurrence of the hand-maintained-count drift class in this run (`PLAN-R3-04`, `SPEC-R1-02`, `SPEC-R2-11`, now this); every remaining count in either document has been removed rather than fixed |

### Dismissal posture — the streak continues at six

Six consecutive waves ran at 100% incorporation (57 findings, 0 dismissals)
and were reported as a smell each time. Wave 7 adds two more incorporations
with no dismissal: `SPEC-R3-01`'s evidence half was based on a factual error
(the cited Plan text demonstrably exists) and both its IDV32-tightening
structural half and the reclassification are counted as incorporated. The
streak is now seven waves at 100% incorporation — reported, per the rule.

### Convergence

17 → 12 → 2 findings, with the high band empty since round 2 and eleven of twelve
prior findings independently confirmed fixed. Both round-3 findings are
bookkeeping rather than mechanism.

### Artifact-inventory self-audit

| Wave | Reviewer outputs | Consolidated | `panel.dispatched` | `panel.consolidated` | Harvest label(s) |
|---|---|---|---|---|---|
| 1 | `round1-claude-fable-5.md`, `round1-gemini-3.1-pro-preview.md` | this file | emitted | emitted | `spec_review-round1` |
| 2 | `round2-gemini-3.1-pro-preview.md`, `round2-gpt-5.6-luna.md` (fable: no verdict, twice) | this file | emitted (×2) | emitted | `-round2`, `-round3`, `-round4` |
| 3 | `round3-gpt-5.6-luna.md` (sub-floor) | this file | emitted | emitted | `-round5` |

**Ratified-decision collisions (round 3):** none.
