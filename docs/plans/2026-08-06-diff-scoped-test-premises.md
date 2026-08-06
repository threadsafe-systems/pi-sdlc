# Plan: expiring test premises — route non-change claims to the standing diff guard

Resolves #208. Track: **irreversible** (the slice edits shipped skill guidance
that adopters bind to behaviourally, so it takes the same track prose-only S5
took). Brainstorm was a live dialogue on 2026-08-06; its four ratified decisions
are restated below as this Plan's provenance.

**Rev 3** — incorporates plan-panel round 2 (6 findings: 1 high, 4 medium, 1
low; 0 dismissed). Record:
`docs/reviews/plan-review-diff-scoped-test-premises-2026-08-06/consolidated.md`.

Round 1's high (`PLAN-R1-01`) was that rev 1 froze a detection pattern **without
ever running it**. Rev 2 ran it and inventoried three exempt files — and round 2
found rev 2 had done the same thing again with its own broadened pattern set
(`PLAN-R2-01`: `main:` fires 13 times on a fourth file, all test *titles*).
Two waves of the same defect class is a generator, not two incidents, so rev 3
fixes the generator: **the detector matches the call shape, not the token.**
Both reviewers proposed adding another exemption; neither proposed this. Rev 2
was a patch wave; rev 3 is a restructure.

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
3. A meta-test enforces (2) mechanically. It flags a **git invocation whose
   argument list names a moving ref** — the call shape, not the bare token — in
   any file under `test/` outside its exemption list. It assembles its patterns
   **non-literally** so it never matches its own source, and proves itself
   non-vacuous by an **inline mutation** of an in-memory string rather than an
   on-disk fixture (a fixture would plant matching source in the directory being
   swept). Its exemption list has **two** entries, each carrying its reason in
   the source; the list is the standing audit.
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

### The refinement the panel forced: moving ref vs pinned commit, matched by call shape

Rev 1 said "base-relative assertions belong only in the diff guard" and proposed
to enforce it by banning the tokens outright. Round 1 ran that scan against
HEAD — which rev 1 never did — and it fired on three files outside the guard.
Rev 2 inventoried those three and broadened the token set; round 2 then ran
*that* set and found a fourth file, `test/tracker-ops.test.js`, where `main:`
appears 13 times in `test("main: …")` **titles**. Same defect class, second
wave. The token is the wrong thing to match.

Every genuine occurrence is a **git subprocess invocation whose argument list
names a moving ref**. Test titles, git-stub source strings, and comments are
never that. Matching the call shape instead of the token, measured over all 45
files under `test/` at `bcba627`:

| detector | files matched | false positives |
|---|---|---|
| bare token (rev 2) | 7 | 4 — `tracker-ops` (test titles), `telemetry-collect`, `telemetry-collect-soft`, `telemetry-emitter` (git stub source) |
| call shape (rev 3) | 3 | **0** |

The three real matches, and the exemption list that follows from them:

| file | what it actually does | disposition |
|---|---|---|
| `test/frozen-surfaces.test.js` | the standing diff guard — the one place a moving-ref read is correct | **exemption 1**, by definition |
| `test/disposition-ledger.test.js:52` | a **real** `git merge-base HEAD main` call — but only as a *fallback* behind a pinned baseline commit (`d528b979`, :50) | **exemption 2**, with reason — see below |
| `test/iteration-disposition.test.js:21-31` | the `baseRef`/`baseFile` helpers | **no exemption needed** — they become dead code under D4 and are deleted with it (`PLAN-R2-04`) |

So the exemption list shrinks from rev 2's five-and-growing to **two**, both
principled. That is the test that the restructure is right: a guard whose
exemption list grows every round is theatre.

`disposition-ledger.test.js` is not a false positive to wave through — it is the
**worked example of the correct pattern**, and it already carries a comment from
a prior author that is half of this slice's law, discovered independently and
never generalised (`test/disposition-ledger.test.js:48-49`):

> a bare merge-base would drift onto main's tip after integrating main, so the
> baseline commit is pinned

That sharpens the law. The defect was never "reads git history"; it is **reading
a ref whose identity changes when the branch merges**:

| anchor | example | expires at merge? |
|---|---|---|
| moving ref | `merge-base HEAD main`, `main:<path>`, `origin/main` | **yes** — this is the whole defect class |
| pinned commit | `d528b979:<path>` | no — a SHA is a constant |
| current tree | `readFileSync(...)` | no |

So the exemption for `disposition-ledger.test.js` is principled, not ad hoc.
Each exemption carries its reason in the meta-test source, which makes the
exemption list itself the standing audit: a new file invoking git against a
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
- A meta-test enforcing the rule across `test/`, carrying the two exemptions
  inventoried above with a reason each.
- `test/iteration-disposition.test.js` — disposition of `IDV3`, `IDV14`,
  `IDV15`, `IDV16` per the table below, **and deletion of the `baseRef`/`baseFile`
  helpers at :20-33**, which D4 leaves as dead code that would otherwise trip
  the new guard (`PLAN-R2-04`).
- **A standing scenario asserting `phase-spec.md` §4 states the law** — this
  slice's own centrepiece, guarded as a content invariant rather than as prose
  (`PLAN-R1-03`).
- **A comment on #192** recording the carry against the S1 slate, so the
  obligation has a named landing site outside this branch.

### Out

- **Rewriting `frozen-surfaces.test.js` or the `FROZEN` list.** The guard is
  correct as it stands; this slice does not touch it. (It is itself a frozen
  surface consumer and any change there would need its own re-freeze dance.)
- **Rewriting `disposition-ledger.test.js`.** It is already correct (pinned
  anchor with a guarded fallback); it is exempted with a reason, not touched.
- **The git-stub and test-title files** (`telemetry-collect*`, `telemetry-emitter`,
  `tracker-ops`). Under the call-shape detector they are not matches at all, so
  they need neither a fix nor an exemption.
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
   outside its exemption list contains a **git invocation whose argument list
   names a moving ref**; its patterns are assembled non-literally so it never
   matches its own source; every exemption carries a one-line reason in the
   source; and it is proven non-vacuous by an **inline mutation** (scanning a
   synthetic in-memory string), never by an on-disk fixture under `test/`.
   Matching the call shape rather than the bare token is load-bearing, not
   cosmetic: measured at `bcba627` it is the difference between 7 matched files
   (4 of them false) and 3 (none false).
   **Cost budget — covers this test and the DoD 6 scenario together
   (`PLAN-R2-06`):** both run inside the existing `npm test` corpus, read each
   file once with no subprocess, network, or model call, and must stay under 1s
   wall combined — a rounding error against the suite's current runtime. No new
   CI job, no new workflow, no `timeout-minutes` change.
4. **The four discharged** exactly per the disposition table, each converted
   assertion proven non-vacuous and each retirement carrying its recorded
   reason.
5. **Every occurrence is dispositioned, and the suite is green** — for each
   matched occurrence under `test/`, exactly one of: brought in scope and fixed;
   or **entered in the exemption list**, whose recorded reason is either a
   standing justification or a filed issue id for work deferred out of this
   slice. The exemption list is the single mechanism for every non-fixed
   occurrence, so "the meta-test passes after that disposition" is always
   satisfiable (`PLAN-R2-03`). (Replaces rev 1's undecidable "reported to the
   owner", which named no landing site — `PLAN-R1-02`.)
6. **The carry to S1 has landed** — a standing scenario asserts `phase-spec.md`
   §4 states the law, and #192 carries a comment recording the obligation
   against the S1 slice. Prose alone does not discharge it (`PLAN-R1-03`).
   **Anchor policy (`PLAN-R2-05`):** the scenario anchors on a small set of
   *concept* tokens the law cannot be stated without — `moving`, `expire`,
   `pinned` — within §4, not on any sentence. A rewrite that keeps the law
   passes whatever its wording; a rewrite that drops the law fails. If S1 needs
   different tokens for the same concept, S1 **updates the anchors**; deleting
   the scenario is the one move that is not available.
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
3. The exemption inventory is complete **as of `bcba627`**, produced by running
   the rev-3 call-shape detector over all 45 files under `test/`, not predicted
   (`PLAN-R1-01`, `PLAN-R2-01` — the same mistake twice). A file added between
   now and implement surfaces as a new failure, which is the guard working.
4. The meta-test's detection is textual (source scanning), not semantic. It
   catches the observed copy-paste mechanism, not an adversary: a moving-ref
   read assembled dynamically, or reached through a helper in another module,
   evades it. The guard is a ratchet against recurrence, not a proof. Matching
   the call shape narrows what it catches to real git invocations — a
   deliberate trade of theoretical reach for zero false positives, since a
   guard that cries wolf gets exempted into uselessness.
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
