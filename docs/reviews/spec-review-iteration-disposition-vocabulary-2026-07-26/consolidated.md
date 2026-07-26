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

| id | origin | sev (adjudicated) | reviewer(s) | finding | disposition |
|---|---|---|---|---|---|
| SPEC-R1-01 | NEW | **high** | fable-5 | C3's **outbound** carries had no gating scenario: IDV11 gated only callout *form* (vacuous with zero outbound statements) and IDV12 was inbound-only, so an implementation with no `CARRY-TO-SPEC`/`CARRY-TO-BUILD` at all passed every mechanical scenario | **incorporated** — new **IDV26** asserts both outbound statements exist. Grade upheld high: the slice's headline mechanism was ungated |
| SPEC-R1-02 | NEW | medium | **both** | C2 header said "Ten additions" over an eleven-row table; IDV5 gated "all ten", so the artifact-inventory self-audit could be silently dropped | **incorporated** — the count is **deleted**, not corrected; IDV5 now asserts *every row of the C2 table* by phrase. (Rev2's first draft reproduced the same defect — "Twelve" over thirteen rows — before the count was removed) |
| SPEC-R1-03 | NEW | medium | fable-5 | IDV17 forbade any new test spawning a process, but IDV14/IDV16's branch-base byte comparisons are implementable only via `git` subprocess (`frozen-surfaces.test.js:44-48`); and the "<2s" bound named no measurement procedure | **incorporated** — IDV17 now forbids **model and network** calls, permits local `git`; the runtime figure is explicitly **advisory**, not gated |
| SPEC-R1-04 | NEW | medium | fable-5 | Plan scope item 11 / DoD 9 (`CONFIG.md` regeneration) appeared nowhere in the Spec, and N1 read as forbidding it | **incorporated** as amendment **A2** + new **IDV24**; N1 narrowed. **Evidence corrected:** the reviewer said no `chore` commit exists, having examined only `bd19184..c0e8d22`; it exists at **`7c2ae92`**. The finding stands, its evidence does not |
| SPEC-R1-05 | NEW | medium | fable-5 | The §1 class-(b) amendment **violated the class-(b) definition it was freezing**: "amend in place" vs a record living only in the Spec, leaving the approved Plan naming a nonexistent path with no disposition trail | **incorporated** — the **Plan is now amended in place** (scope rows 6 and 11, DoD 5 carry `AMENDED, class (b)` markers pointing at spec §1), and C4(b) gains the rule that a later-phase amendment may keep its full record downstream *only* with an in-place marker upstream |
| SPEC-R1-06 | NEW | medium | fable-5 | Ratified-collision escalation contradicts the existing "**Only** proposed dismissals … escalate" sentence (`phase-pr-review.md:205-207`), and no reconciling amendment was specified | **incorporated** — C2 row 5 explicitly amends that sentence to admit a third case |
| SPEC-R1-07 | NEW | medium | fable-5 | The glossary defines `defect class` while the file it points at says "**finding class**" (`phase-pr-review.md:211,:217`) — a grep for either finds nothing of the other; D12's two-names-one-concept defect, recreated in the opposite direction | **incorporated** — the alias is stated in §2, added at the existing text by C2 row 13, and gated by IDV2 |
| SPEC-R1-08 | NEW | medium | fable-5 | Id prefix underivable: panel phases are `plan_review`/`spec_review`/`pr_review`, the example was `PLAN`; `REOPENED(<id>)` resolution depends on predictable ids | **incorporated** — closed mapping (`plan_review→PLAN`, `spec_review→SPEC`, `pr_review→PR`, `task_validate→TASK`) in §2, gated by IDV2 |
| SPEC-R1-09 | NEW | medium | fable-5 | "Barred" is a named outcome with **no legal value** in the closed disposition set, so a barred reopen's mandatory disposition field has nothing to record | **incorporated** — `barred` added as a fifth disposition, distinct from `dismissed` because it is a mechanical consequence of the evidence rule rather than a human-ratified verdict (assumption 4 records that this is additive) |
| SPEC-R1-10 | NEW | medium | **both** | §2 and C1 pointed "carry destinations" at **C7** (frozen surfaces); they live in C3 | **incorporated** — both pointers corrected |
| SPEC-R1-11 | NEW | medium | fable-5 | IDV21 was labelled `mechanical` while defining itself as no-standing-test; the coverage line claimed 19/4 where the labels gave 20/3 | **incorporated** — new **`diff-inspection`** kind for IDV21; coverage recounted from the labels (23/4/1 = 28) |
| SPEC-R1-12 | NEW | medium | fable-5 | The mandatory origin tag had no home in the prompts' STRICT closed field lists (`adversary-review`: "Return ONLY … nothing else"), so a format-compliant reviewer could legally omit it | **incorporated** — C6 item 2 adds an `origin:` field to each prompt's output format, gated by **IDV28** |
| SPEC-R1-13 | NEW | medium | **both** (gemini high, fable low) | C3 named no section for `phase-implement.md` while IDV12 asserted "named reference **and section**" — unimplementable | **incorporated** — §4 landing + §5 block, **plus** a fallback the panel did not reach: under `review.tasks: off` there is no PASS gate (`phase-implement.md:71-73`), so §5 routes the obligation to the PR panel's carry-landing surface. Adjudicated **medium** between the two grades, recorded |
| SPEC-R1-14 | NEW | medium | gemini | C5 defined the spec-gap log as gaps "found during decomposition", which cannot receive an inbound `CARRY-TO-BUILD` (those originate at Spec) | **incorporated** — definition broadened to "found during decomposition *or* carried inbound from Spec" |
| SPEC-R1-15 | NEW | medium | gemini | C5's `assumption-recorded` composition rule was gated by no scenario | **incorporated** — new **IDV27** |
| SPEC-R1-16 | NEW | low | gemini | `CARRY-TO-BACKLOG` was forced behind an "under your configuration" callout though terminal and universally available | **incorporated** — explicitly exempted in C3 and IDV11 |
| SPEC-R1-17 | NEW | low | fable-5 | The glossary's ≤60-line budget was mechanically countable but gated only by panel judgement | **incorporated** — new **IDV25** counts it mechanically |

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
