# Plan: expiring test premises — route non-change claims to the standing diff guard

Resolves #208. Track: **irreversible** (the slice edits shipped skill guidance
that adopters bind to behaviourally, so it takes the same track prose-only S5
took). Brainstorm was a live dialogue on 2026-08-06; its four ratified decisions
are restated below as this Plan's provenance.

**Rev 1** — pre-panel draft.

## Objective

Stop the lifecycle from minting tests whose premise expires at merge, and
discharge the four such tests already shipped.

Concretely, at the end of this slice:

1. `phase-spec.md` §4 carries the general law: **a claim whose premise expires
   at merge is not a scenario**, and its specific corollary — a *non-change
   claim* is falsifiable only by a diff, so it routes to the repo's standing
   diff guard rather than being written as a base-relative assertion inside a
   per-slice scenario file. `phase-implement.md` §4 carries a one-line pointer
   at the place the check is actually written.
2. `CONTRIBUTING.md` carries pi-sdlc's own instantiation: `test/frozen-surfaces.test.js`
   is *the* diff guard here, and no other test file may reach for the branch base.
3. A meta-test enforces (2) mechanically — `baseRef(` / `baseFile(` / `merge-base`
   usage outside `test/frozen-surfaces.test.js` fails the suite.
4. The four surviving expired premises in `test/iteration-disposition.test.js`
   are discharged: two converted to the content invariants they always were, two
   retired with a recorded reason.

## Rationale

### The problem, in evidence

| Evidence | Failure |
|---|---|
| `IDV30` (S5, PR #206) asserted the branch base still contained a sentence the branch removed. | The instant the branch became the base the assertion inverted. `main` went red (511 pass / 1 fail), the `release` workflow failed, and **v3.1.0 did not cut** until the #207 follow-up. |
| The PR's own `test + biome` check passed. | The premise was true pre-merge. **CI cannot catch this class by construction.** |
| Neither the 3-round spec panel nor the 3-round PR panel flagged it. | The defect is invisible in a pre-merge diff — it is a property of what happens *after* the diff lands, which no reviewer axis currently attacks. |
| `IDV3`, `IDV14`, `IDV15`, `IDV16` use the same shape and did not fail. | They are now **vacuous**: base and working tree are identical, so they assert nothing. A test that silently stops testing is worse than one that fails loudly. |

### Why guidance, not just a fix

`test/frozen-surfaces.test.js` is deliberately base-relative and that is
correct — it exists to police a diff, and it is maintained across slices by an
explicit re-freeze PR (the #190→#191 and #206→#207 pattern). The defect is that
shape being copied into **scenario** files, which are supposed to encode
standing invariants. Per-slice scenario files (`iteration-disposition.test.js`,
`validator-contract.test.js`, …) are the natural place for the mistake to recur,
and nothing in the skill currently distinguishes the two.

### The reframing this Plan encodes (brainstorm D1)

# 208's own candidate resolutions pull against each other: resolution 1 says

scenario tests must assert current-tree invariants; resolution 2 says convert
the four into standing invariants. Three of the four are **explicit non-change
claims** — a spec deliberately declaring "this slice does not touch runtime
surfaces". A non-change claim is falsifiable *only* by a diff. Ban base-relative
assertions from scenario files and those scenarios are not converted, they are
deleted along with the only mechanism that made them falsifiable.

So the operative rule is a **routing** rule, not a conversion rule:

> A non-change claim belongs in the standing diff guard's frozen list — the one
> sanctioned, permanently-maintained diff surface — and nowhere else. Everything
> a scenario file asserts must be true of the current tree alone.

This immediately explains the corpus: `IDV15` was redundant from birth (its
surface was already in `FROZEN`, so `ASD19` asserted the same thing, standing),
and `IDV16` has no home at all (it wanted a whole *directory* frozen for one
slice only — which `FROZEN` deliberately cannot express, and should not). The
residue, `IDV3` and `IDV14`, were never non-change claims: they are *content*
invariants lazily expressed as diffs, and they convert cleanly.

## Scope

### In

- `skills/sdlc/references/phase-spec.md` §4 — the general law (adopter-facing).
- `skills/sdlc/references/phase-implement.md` §4 — one-line cross-reference.
- `CONTRIBUTING.md` — a new section naming pi-sdlc's diff guard and the rule.
- A meta-test enforcing the rule across `test/`.
- `test/iteration-disposition.test.js` — disposition of `IDV3`, `IDV14`,
  `IDV15`, `IDV16` per the table below.

### Out

- **Rewriting `frozen-surfaces.test.js` or the `FROZEN` list.** The guard is
  correct as it stands; this slice does not touch it. (It is itself a frozen
  surface consumer and any change there would need its own re-freeze dance.)
- **Auditing every other test file for expired premises beyond the mechanical
  sweep.** The meta-test is the audit; anything it surfaces beyond the four
  named scenarios is reported, not silently fixed, so the fix stays inspectable.
- **S1's spec-skeleton vocabulary.** This slice states the law in today's prose;
  expressing it in `mechanical`/`inspection`/`carried` terms is S1's job (see
  Context for the next agent).
- **A telemetry event for mid-run track correction.** A real gap found while
  running this slice's own brainstorm, filed separately; not in scope here.

## Design decisions (brainstorm provenance)

| # | Decision | Status |
|---|---|---|
| D1 | The rule is a **routing** rule (non-change claims route to the standing diff guard), not a conversion rule. Only genuine content invariants convert. | Ratified (owner, 2026-08-06) |
| D2 | Both halves ship in this slice — general law in the skill references *and* the pi-sdlc-local instantiation — accepting the irreversible track rather than splitting for a cheaper gate. | Ratified (owner, 2026-08-06) |
| D3 | General law lands in `phase-spec.md` §4 (falsifiability craft) with a pointer in `phase-implement.md` §4; local instantiation lands in `CONTRIBUTING.md` beside the meta-test. | Ratified (owner, 2026-08-06) |
| D4 | Disposition of the four: `IDV3` and `IDV14` convert; `IDV15` and `IDV16` retire with a recorded reason, not a silent deletion. | Ratified (owner, 2026-08-06) |

### Disposition table (D4)

| id | line | today's claim | disposition | reason recorded in the file |
|---|---|---|---|---|
| `IDV3` | :155 | §1–§14 headings of `system-reference.md` unchanged from base | **convert** — assert against a pinned literal heading list | it was always a content invariant (numbering stability), lazily expressed as a diff |
| `IDV14` | :355 | `templates/sdlc-tasks.md` byte-identical to base | **convert** — assert the file carries no spec-gap-log columns | content invariant: the standalone router stays thin |
| `IDV15` | :408 | `validator-task.prompt.md` byte-identical to base | **retire** — discharged | the surface is already in `FROZEN`; `ASD19` asserts this standing, so the scenario was redundant from birth |
| `IDV16` | :421 | no script/schema/workflow file differs from base | **retire** — discharged | "this slice is prose-only" is irreducibly slice-scoped; the frozen list cannot express a one-slice directory freeze and should not |

## Definition of done

1. **Law stated once.** `phase-spec.md` §4 states the general law and its
   non-change corollary; `phase-implement.md` §4 points at it without restating
   it. No third copy anywhere in the references.
2. **Local rule stated once.** `CONTRIBUTING.md` names `test/frozen-surfaces.test.js`
   as the sole diff guard and forbids base-relative assertions elsewhere.
3. **Rule enforced mechanically.** A meta-test fails when any test file other
   than `test/frozen-surfaces.test.js` reaches for the branch base, and is
   itself proven non-vacuous (a negative fixture or an inline mutation shows it
   would fire). **Cost budget:** it runs inside the existing `npm test` corpus,
   reads every file under `test/` once with no subprocess, network, or model
   call, and must stay under 1s wall — a rounding error against the suite's
   current runtime. No new CI job, no new workflow, no `timeout-minutes` change.
4. **The four discharged** exactly per the disposition table, each converted
   assertion proven non-vacuous and each retirement carrying its recorded
   reason.
5. **No expired premise survives** in `test/`: the meta-test passes across the
   whole directory, and any occurrence it finds beyond the four named scenarios
   is reported to the owner rather than silently rewritten.
6. **Suite and lint green** — full `npm test` corpus passes, `npx biome check`
   clean on touched surfaces, `config-doc check` still `current`.
7. **Frozen surfaces untouched** — `ASD19` passes; this slice changes no file in
   the `FROZEN` list, so no re-freeze follow-up PR is owed.

## Assumptions

1. `phase-spec.md` and `phase-implement.md` are **not** in the `FROZEN` list, so
   editing them owes no post-merge re-freeze PR. (Verified against
   `test/frozen-surfaces.test.js`; only scripts, schemas, and the four prompts
   are frozen.)
2. `npx biome check .` is red on `main` itself (3 pre-existing findings under
   `docs/briefs/assets/2026-07-23-orchestration-runtime-prototype/`), so static
   checks are scoped to touched surfaces — carried forward from the S5 build
   plan, unchanged.
3. The meta-test's detection is textual (source scanning), not semantic. A
   sufficiently creative base-relative assertion could evade it; the guard
   targets the observed copy-paste mechanism, not an adversary.
4. S1 will rewrite `phase-spec.md` §4. This slice's prose will need absorbing
   rather than preserving verbatim; that is accepted, not a defect.

## Context for the next agent

- **Carry to S1 (spec artifact skeleton).** S1 owns `templates/sdlc-spec.md` +
  `phase-spec.md` §4 and introduces the scenario kind labels
  `mechanical`/`inspection`/`carried`. The law this slice writes in plain prose
  should be re-expressed in that vocabulary — a non-change claim is the clearest
  example of a scenario that is *not* mechanically verifiable in its own file
  and must be `carried` to the standing guard. Do not silently drop it when
  rewriting the section; restate it.
- **Related open work, linked not duplicated:** #192 (the slate this feeds),
  #177 (the next slice, config-doc render stability), #190→#191 and #206→#207
  (the re-freeze pattern that makes `FROZEN` a maintained surface rather than a
  one-way ratchet).
- **Parked:** whether `validator-contract.test.js` and the other per-slice
  scenario files contain further expired premises beyond what the meta-test
  detects textually. The meta-test answers the mechanical half; a semantic audit
  is not scheduled.
