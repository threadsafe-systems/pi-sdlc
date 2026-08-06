# Plan: expiring test premises — route non-change claims to the standing diff guard

Resolves #208. Track: **irreversible** (the slice edits shipped skill guidance
that adopters bind to behaviourally, so it takes the same track prose-only S5
took). Brainstorm was a live dialogue on 2026-08-06; its four ratified decisions
are restated below as this Plan's provenance.

**Rev 2** — incorporates plan-panel round 1 (4 findings: 1 high, 3 medium; 0
dismissed). Record:
`docs/reviews/plan-review-diff-scoped-test-premises-2026-08-06/consolidated.md`.
The high finding (`PLAN-R1-01`, raised by both reviewers) was that rev 1 froze a
detection pattern **without ever running it** — run at HEAD it fires on three
files rev 1 never named. Running it produced the sharper law rev 2 is built on
(moving ref vs pinned commit, below), so the round changed the design rather
than patching the DoD.

## Objective

Stop the lifecycle from minting tests whose premise expires at merge, and
discharge the four such tests already shipped.

Concretely, at the end of this slice:

1. `phase-spec.md` §4 carries the general law: **a premise anchored to a moving
   ref expires; a scenario must be true of the current tree, or anchored to a
   pinned immutable commit** — and its corollary, that a *non-change claim* is
   falsifiable only by a diff and therefore routes to the repo's standing diff
   guard rather than being written as a base-relative assertion inside a
   per-slice scenario file. `phase-implement.md` §4 carries a one-line pointer
   at the place the check is actually written.
2. `CONTRIBUTING.md` carries pi-sdlc's own instantiation: `test/frozen-surfaces.test.js`
   is the only test permitted to assert against a **moving** ref, and every
   other reach for one is either a bug or an entry in the meta-test's reasoned
   exemption list.
3. A meta-test enforces (2) mechanically, over the inventory established at plan
   time (below): it flags moving-ref reads (`merge-base`, `main:`, `origin/main`,
   and the `baseRef(`/`baseFile(` helpers) in any file under `test/` that is not
   in its exemption list, **assembling its patterns non-literally** so it never
   matches its own source, and proving itself non-vacuous by an **inline
   mutation** rather than an on-disk fixture (a fixture would plant forbidden
   tokens in the directory being swept).
4. The four surviving expired premises in `test/iteration-disposition.test.js`
   are discharged: two converted to the content invariants they always were, two
   retired with a recorded reason.
5. This slice's own centrepiece is guarded the way it asks everyone else to
   guard theirs: a standing scenario asserts `phase-spec.md` §4 states the law,
   so S1's ratified rewrite of that section cannot silently drop it.

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

### The refinement round 1 forced: moving ref vs pinned commit (`PLAN-R1-01`)

Rev 1 said "base-relative assertions belong only in the diff guard" and proposed
to enforce it by banning the tokens outright. Both reviewers ran that scan
against HEAD — which rev 1 never did — and it fires on three files outside the
guard:

| file | what it actually does | disposition |
|---|---|---|
| `test/disposition-ledger.test.js:52` | a **real** `git merge-base HEAD main` call — but only as a *fallback* behind a pinned baseline commit (`d528b979`, :50) | **exempt, with reason** — see below |
| `test/telemetry-collect.test.js:123,358,370` | the literal token inside **git stub source strings** (fake `git` executables that echo a canned answer) | **exempt, with reason** — the token is data, not a call |
| `test/telemetry-collect-soft.test.js:333` | same: git stub source | **exempt, with reason** |

The first is not a false positive to wave through — it is the **worked example
of the correct pattern**, and it already carries a comment from a prior author
that is half of this slice's law, discovered independently and never
generalised (`test/disposition-ledger.test.js:48-49`):

> a bare merge-base would drift onto main's tip after integrating main, so the
> baseline commit is pinned

That sharpens the law. The defect was never "reads git history"; it is **reading
a ref whose identity changes when the branch merges**:

| anchor | example | expires at merge? |
|---|---|---|
| moving ref | `merge-base HEAD main`, `main:<path>`, `origin/main` | **yes** — this is the whole defect class |
| pinned commit | `d528b979:<path>` | no — a SHA is a constant |
| current tree | `readFileSync(...)` | no |

So the exemption for `disposition-ledger.test.js` is principled, not ad hoc, and
the stub files are a third category again (a matched token that is not an
anchor at all). Each exemption carries its reason in the meta-test source, which
makes the exemption list itself the standing audit: a new file reaching for a
moving ref fails until someone either fixes it or justifies it in writing.

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
- A meta-test enforcing the rule across `test/`, carrying the three exemptions
  inventoried above with a reason each.
- `test/iteration-disposition.test.js` — disposition of `IDV3`, `IDV14`,
  `IDV15`, `IDV16` per the table below.
- **A standing scenario asserting `phase-spec.md` §4 states the law** — this
  slice's own centrepiece, guarded as a content invariant rather than as prose
  (`PLAN-R1-03`).
- **A comment on #192** recording the carry against the S1 slate, so the
  obligation has a named landing site outside this branch.

### Out

- **Rewriting `frozen-surfaces.test.js` or the `FROZEN` list.** The guard is
  correct as it stands; this slice does not touch it. (It is itself a frozen
  surface consumer and any change there would need its own re-freeze dance.)
- **Rewriting the three exempted files.** `disposition-ledger.test.js` is
  already correct (pinned anchor); the two telemetry stub files never read a
  base at all. They are inventoried and exempted with reasons, not touched.
- **A semantic audit for expired premises the textual sweep cannot see.** The
  meta-test is the mechanical audit and is honest about its reach
  (assumption 3); a semantic pass is not scheduled.
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
   as the only test permitted to assert against a moving ref, and states the
   moving-ref-vs-pinned-commit distinction.
3. **Rule enforced mechanically.** A meta-test fails when any file under `test/`
   outside its exemption list reads a moving ref; its patterns are assembled
   non-literally so it never matches its own source; every exemption carries a
   one-line reason in the source; and it is proven non-vacuous by an **inline
   mutation** (scanning a synthetic in-memory string), never by an on-disk
   fixture under `test/`. **Cost budget:** it runs inside the existing
   `npm test` corpus, reads every file under `test/` once with no subprocess,
   network, or model call, and must stay under 1s wall — a rounding error
   against the suite's current runtime. No new CI job, no new workflow, no
   `timeout-minutes` change.
4. **The four discharged** exactly per the disposition table, each converted
   assertion proven non-vacuous and each retirement carrying its recorded
   reason.
5. **Every occurrence is dispositioned, and the suite is green** — for each
   moving-ref read under `test/`, exactly one of: brought in scope and fixed;
   exempted with a recorded reason in the meta-test source; or escalated as a
   **filed issue id** recorded in this Plan. The meta-test passes after that
   disposition. (Replaces rev 1's undecidable "reported to the owner", which
   named no landing site — `PLAN-R1-02`.)
6. **The carry to S1 has landed** — a standing scenario asserts `phase-spec.md`
   §4 states the law, and #192 carries a comment recording the obligation
   against the S1 slice. Prose alone does not discharge it (`PLAN-R1-03`).
7. **Suite and lint green** — full `npm test` corpus passes, `npx biome check`
   clean on touched surfaces, `config-doc check` still `current`.
8. **Frozen surfaces untouched** — `ASD19` passes; this slice changes no file in
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
3. The exemption inventory is complete **as of `5eb2567`**. It was produced by
   running the sweep, not predicted (`PLAN-R1-01`); a file added between now and
   implement surfaces as a new failure, which is the guard working.
4. The meta-test's detection is textual (source scanning), not semantic. It
   catches the observed copy-paste mechanism, not an adversary: a moving-ref
   read assembled dynamically, or reached through a helper in another module,
   evades it. The guard is a ratchet against recurrence, not a proof.
5. S1 will rewrite `phase-spec.md` §4. This slice's prose will need absorbing
   rather than preserving verbatim; that is accepted, not a defect — which is
   why DoD 6 guards the law's *presence*, not its wording.

## Context for the next agent

- **Carry to S1 (spec artifact skeleton) — landed, not just stated.** S1 owns
  `templates/sdlc-spec.md` + `phase-spec.md` §4 and introduces the scenario kind
  labels `mechanical`/`inspection`/`carried`. The law this slice writes in plain
  prose should be re-expressed in that vocabulary — a non-change claim is the
  clearest example of a scenario that is *not* mechanically verifiable in its
  own file and must be `carried` to the standing guard. **Two witnesses hold S1
  to it** (DoD 6): a standing scenario that fails if §4 stops stating the law,
  and a comment on #192. The prose instruction alone was `PLAN-R1-03`.
- **Related open work, linked not duplicated:** #192 (the slate this feeds),
  #177 (the next slice, config-doc render stability), #190→#191 and #206→#207
  (the re-freeze pattern that makes `FROZEN` a maintained surface rather than a
  one-way ratchet).
- **Parked:** whether `validator-contract.test.js` and the other per-slice
  scenario files contain further expired premises beyond what the meta-test
  detects textually. The meta-test answers the mechanical half; a semantic audit
  is not scheduled.
