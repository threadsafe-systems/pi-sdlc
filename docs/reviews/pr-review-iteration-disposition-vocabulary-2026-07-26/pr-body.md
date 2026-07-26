```sdlc
track: irreversible
slug: iteration-disposition-vocabulary
```

Names the thing the lifecycle has always had but never defined: a **finding**.
Before this change a finding has no identity, no class, no lifecycle and no
legal destinations, so nothing forbids re-raising it, nothing records why it was
dropped, and nothing gives it a home in a later phase. The evidence that forced
it: a 14-round plan panel with 0 dismissals across 60+ findings (#174); an
approved Spec amended pre-merge with no disposition record; decomposition-time
spec gaps with only a binary rollback/assume-and-proceed choice.

Slice **S5** of the ratified design-phase change slate, ranked first for its
dogfood dividend.

## What lands

- **`system-reference.md` §15 "Iteration & disposition"** — one normative
  glossary (59 lines): two origin tags, five dispositions (including `barred`
  for a reopen that fails the evidence bar), `defect class` and its
  `finding class` alias, the reopen evidence bar, the finding-record shape, the
  `<PREFIX>-R<round>-<nn>` id with its closed panel-phase mapping, the carry
  destinations, the no-orphan rule and its four checkpoint kinds, the
  ratified-decision collision, and the three amendment classes. Terms only —
  every mechanic stays in its phase reference. Appended as §15 so §1–§14
  numbering is stable for every existing cross-reference.
- **`phase-pr-review.md`** — §5 gains delta-dispatch, id minting, origin
  tagging, ratified-collision escalation (folded *into* the existing
  "Only … escalate" sentence, not appended beside it), dismissal posture,
  trim-the-tail, the sub-floor exemption, the backlog checkpoint, the round-4
  cap with four human-adjudicated options, and the artifact-inventory
  self-audit. §1 defines floors as governing **full review rounds**.
- **`phase-plan.md` / `phase-spec.md` / `phase-tasks.md`** — amendment classes
  at the section that owns the question each answers (§5 gate re-run, §8 renewed
  task approval); §6 keeps a class-(a) pointer only.
- **Carry dispositions** — `CARRY-TO-SPEC`, `-BUILD`, `-IMPLEMENT` behind
  *under your configuration* callouts (the destination is the next phase in the
  *effective configured sequence*); `CARRY-TO-BACKLOG` stated unconditionally
  because it is terminal. Four inbound checkpoints: the Spec gate, build-plan
  completion evidence, task close, the PR gate.
- **`phase-tasks.md` §4 spec-gap log** — four columns, closed enums, an explicit
  "none", inbound carries from Spec as a source; `assumption-recorded` routes
  into the existing Assumptions appendix rather than a second ledger.
- **Three adversary prompts** — the delta-round law, an `origin:` field in each
  STRICT output format, and a per-prompt carry-landing surface. A reviewer
  subagent has none of the skill loaded, so every rule it must obey is inline.
- **`.pi/sdlc/workflow.md`** — the four promoted rules deleted. Deleting them is
  the dogfood proof the promotion landed.

## Governing documents

- Plan: `docs/plans/2026-07-26-iteration-disposition-vocabulary.md` (rev5)
- Specification: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` (rev4)
- Build plan: `docs/plans/2026-07-26-iteration-disposition-vocabulary-build.md`
- Slate: `docs/briefs/2026-07-26-design-phase-r5-synthesis.md` §3 (S5 row)

## Tracker references

- Epic: `#199`
- Tasks: `#200`, `#201`, `#202`, `#203`, `#204`, `#205`
- Board: https://github.com/orgs/threadsafe-systems/projects/5

Closes #200
Closes #201
Closes #202
Closes #203
Closes #204
Closes #205

## Assumptions & discretionary calls

1. **`npx biome check .` is red on the branch base.** Three pre-existing
   `FIXABLE` findings under
   `docs/briefs/assets/2026-07-23-orchestration-runtime-prototype/`, unrelated to
   this slice. Each task's PV1 `static` check is scoped to the surfaces that task
   touches, which is what Plan DoD 8 ("biome is clean on touched files") already
   asks. The base debt is left for its own `track:none` change (#166 pattern).
2. **IDV11 is implemented as a form property, IDV26 as the existence property.**
   IDV11 is owned by T3 but asserts over `phase-tasks.md`, which T4 delivers.
   Rather than co-own a scenario (PV1 Rule B needs a single owner), IDV11 asserts
   that every conditional outbound carry statement that exists sits inside a
   configuration callout — with non-vacuity pinned for the two destinations T3
   delivers — while IDV26 asserts all four exist. Together complete; neither
   vacuous at its own task boundary.
3. **`.pi/sdlc/workflow.md`'s two surviving "When adjudicating" rules keep their
   text byte-for-byte**; only their ordered-list markers renumber (4./5. → 1./2.)
   because the three rules above them were deleted. Called out for IDV21's diff
   read.
4. **`test/fixtures/golden/pr_review.agent.md` is regenerated**; the plan/spec
   goldens are stamped from `test/fixtures/consumer/.pi/sdlc/prompts/` overrides
   and are correctly unchanged — that is the consumer-override path working.
5. **The Plan's scope row 6 marker** read `AMENDED, class (b), 2026-07-26` and
   named no amendment record; IDV32 forbids exactly that, so it now reads
   `see spec §1 A1` like its siblings.
6. **The five generated PV1 manifests were reformatted** to biome's JSON style
   (whitespace-only, semantically identical) and every affected receipt re-issued
   after re-running the runner and the validator subagent — a receipt exists to
   hash the manifest that actually ran.

## Verification

- Full corpus **511 pass**; `npm run test:e2e` → `all e2e checks passed`
- `biome check .` clean apart from the three pre-existing base findings
- `config-doc check` reports `current`; ASD19 green with exactly the three
  adversary prompts reopened; `validator-task.prompt.md` and
  `templates/sdlc-tasks.md` byte-identical to the branch base
- Per-task PV1 receipts (runner + validator, `anthropic/claude-haiku-4-5`) under
  `docs/reviews/task-validate-iteration-disposition-vocabulary-t{1..6}-2026-07-26/`,
  each `verify-task-receipt` verified

## Mandatory follow-up

A post-merge **re-freeze PR** (`track: none`) restoring the three adversary
prompts to `FROZEN` — the #190 → #191 pattern. Not optional.
