# Plan panel — consolidated adjudication

**Artifact:** `docs/plans/2026-08-06-diff-scoped-test-premises.md` (rev 1, commit `5eb2567`)
**Phase:** `plan_review` · **Track:** irreversible · **Slice:** #208
**Orchestrator (adjudicating model):** `anthropic/claude-opus-5`
**Panel:** `anthropic/claude-fable-5:xhigh`, `google/gemini-3.1-pro-preview:xhigh` (floor 2, met; author `anthropic/claude-opus-5` excluded)

## Artifact inventory (self-audit)

| wave | round label | reviewer | harvest destination | events |
|---|---|---|---|---|
| 1 | 1 | `claude-fable-5` | `panels/plan_review-round1-2026-08-06/` | `panel.dispatched{round 1, wave 1}` |
| 1 | 2 | `gemini-3.1-pro-preview` | `panels/plan_review-round2-2026-08-06/` | same wave; separate `asyncDir`, so a separate destination label |
| 2 | 3 | `claude-fable-5` | `panels/plan_review-round3-2026-08-06/` | `panel.dispatched{round 2, wave 2}` |
| 2 | 4 | `gemini-3.1-pro-preview` | `panels/plan_review-round4-2026-08-06/` | same wave, separate label |

Two destination labels for one logical wave: this harness's `subagent` tool takes
one agent per call, so a two-model panel is two async runs with two `asyncDir`s,
and reusing one label would overwrite the first snapshot.

**Dispatch note.** `gemini-3.1-pro-preview`'s run is marked `failed` by the
harness with the signal *"completed without making edits for an implementation
task"* — an acceptance heuristic misfiring on a read-only reviewer. It returned a
complete, format-conformant verdict, so per `phase-pr-review.md` §5 ("a reviewer
that returns a model verdict … has completed its assignment and is never
silently replaced") it counts toward the floor and was **not** replaced. No
shortfall.

## Round 1 — findings

| id | severity | origin | reviewers | gist | disposition |
|---|---|---|---|---|---|
| `PLAN-R1-01` | high | NEW | **both** | The meta-test as specified fires today on 3 uninventoried files, making DoD 3/5/6 jointly unsatisfiable within the stated scope | incorporated |
| `PLAN-R1-02` | medium | NEW | fable-5 | DoD 5 contradicts itself, and "reported to the owner" names no landing site so nothing can falsify it | incorporated |
| `PLAN-R1-03` | medium | NEW | fable-5 | The carry to S1 is an orphan: the slice's centrepiece is guarded only by prose a later slice can silently drop — the plan reproduces its own diagnosed failure class | incorporated |
| `PLAN-R1-04` | medium | NEW | **both** | The meta-test's self-application is unstated: it matches its own pattern literals, and DoD 3's "negative fixture" would plant forbidden tokens under `test/` | incorporated |

**Counts:** 1 high, 3 medium, 0 low. **Incorporated 4, dismissed 0.**

100% incorporation in a single wave is not yet the two-wave smell
`phase-pr-review.md` §5 flags, but it is recorded here so the next wave is
judged against it. No finding was incorporated merely to avoid an argument:
each is a concrete, verified defect (see evidence below).

## Adjudication detail

### `PLAN-R1-01` — high, cross-model agreement

Verified independently before incorporating. `grep -rn "merge-base\|baseRef(\|baseFile("
test/` at `5eb2567` returns, outside the guard:

- `test/disposition-ledger.test.js:52` — a **real** `git merge-base HEAD main` call.
- `test/telemetry-collect.test.js:123,358,370`, `test/telemetry-collect-soft.test.js:333`
  — the literal token inside **git stub source strings**, never a base read.

Both reviewers reached this by running the scan the plan should have run at plan
time. That is the finding's real content: rev 1 froze a detection pattern
without executing it once.

**Incorporated, and it sharpens the law rather than just patching the DoD.**
`disposition-ledger.test.js:48-49` already carries a comment from a prior author
— *"a bare merge-base would drift onto main's tip after integrating main, so the
baseline commit is pinned"* — which is half of this slice's law, discovered
independently and never generalised. The distinction it implies:

> A premise anchored to a **moving ref** (`merge-base`, `main`, `origin/main`)
> expires. A premise anchored to a **pinned immutable commit** does not.

So `disposition-ledger.test.js` is not a false positive to be waved through — it
is the **worked example** of the correct pattern, and its exemption is
principled rather than ad hoc. The stub files are a different category again
(the token is data, not a call). Rev 2 inventories all three, states the
moving-ref-vs-pinned-ref distinction as the operative law, and makes the
exemption list carry a reason per entry so the list *is* the audit.

### `PLAN-R1-02` — medium

Correct and decisive: "the meta-test passes across the whole directory" and
"occurrences beyond the four are reported, not rewritten" cannot both hold once
an occurrence exists — and three do. The reviewer also correctly cites
`system-reference.md:455-458`: this framework requires a carry to land somewhere
*named*. Rev 2 replaces DoD 5 with a decidable three-way rule (in scope /
exempted with a recorded reason in the meta-test / escalated as a filed issue
id) plus "and the meta-test passes after that disposition".

### `PLAN-R1-03` — medium

The sharpest finding of the round, and the one with the least to do with tests.
The plan's centrepiece — the law landing in `phase-spec.md` §4 — was protected
across S1's ratified rewrite of that exact section by nothing but a prose
sentence in a plan doc. That is precisely the failure class this slice exists to
kill (an obligation whose only witness is prose), applied to the slice's own
deliverable. Incorporated as a **standing content scenario** asserting
`phase-spec.md` §4 states the law, which dogfoods the rule the slice is
introducing, plus a comment on #192 recording the carry against the S1 slate.

### `PLAN-R1-04` — medium, cross-model agreement

Both reviewers independently derived that a source-scanning guard containing its
own patterns as literals fails itself. Rev 2 mandates non-literal pattern
assembly (so no self-exemption is needed at all) and an **inline mutation**
proof rather than an on-disk fixture under `test/` — the fixture route would
plant forbidden tokens in the very directory being swept.

## Round 2 (delta, `5eb2567..bcba627`) — findings

Both reviewers confirmed all four round-1 findings discharged, in one line each,
without re-litigation. No `REOPENED` tags were raised.

| id | severity | origin | reviewers | gist | disposition |
|---|---|---|---|---|---|
| `PLAN-R2-01` | high | NEW | **both** | Rev 2's broadened token set fires 13 times on a fourth uninventoried file (`tracker-ops.test.js`), all test *titles* — rev 1's defect class, reintroduced by rev 1's fix | incorporated **by restructure**, not by the proposed fix |
| `PLAN-R2-02` | medium | NEW | fable-5 | Rev 2 dropped rev 1's explicit exclusion of the diff guard without adding it to the exemption list, so the guard fails its own meta-test | incorporated |
| `PLAN-R2-03` | medium | NEW | gemini | DoD 5's escalation branch leaves the occurrence matching and unexempted, contradicting "the meta-test passes" | incorporated |
| `PLAN-R2-04` | medium | NEW | gemini | The `baseRef`/`baseFile` helper definitions have no disposition; D4 leaves them dead code that still trips the guard | incorporated |
| `PLAN-R2-05` | medium | NEW | gemini | DoD 6 wants a wording-independent check; no textual scenario can deliver one without an anchor policy the Plan never states | incorporated |
| `PLAN-R2-06` | low | NEW | gemini | The DoD 6 scenario carries no cost budget, though round 1 imposed one on the meta-test | incorporated |

**Counts:** 1 high, 4 medium, 1 low. **Incorporated 6, dismissed 0.**

### `PLAN-R2-01` — incorporated, but not as either reviewer proposed

Verified: `test/tracker-ops.test.js` carries 13 `main:` matches, every one a
`test("main: …")` title. Both reviewers proposed the same fix — add a fourth
exemption (or hand-scope the `main:` token). **Both were rejected in favour of a
structural fix**, because the finding's real content is that this is the *second*
wave of one defect class: a detection pattern frozen without being run as
specified. Two instances of one mechanism is a generator, and patching the third
instance would invite a fourth.

Every genuine occurrence is a git subprocess invocation whose argument list
names a moving ref; test titles, stub source, and comments never are. Measured
over all 45 files under `test/` at `bcba627` before adopting it:

| detector | files matched | false positives |
|---|---|---|
| bare token (rev 2) | 7 | 4 |
| call shape (rev 3) | 3 | 0 |

This also dissolves `PLAN-R2-02` — the exemption list is now explicit and
short (the guard itself, plus `disposition-ledger.test.js`'s pinned-anchor
fallback) — and it retires rev 2's two telemetry-stub exemptions, which the
call-shape detector never matches. Rev 2 was a patch wave; rev 3 is a
restructure that removes the generator, the same move S5's rev 4 made.

### `PLAN-R2-03` through `PLAN-R2-06`

All four verified and incorporated as written: the exemption list becomes the
single mechanism for every non-fixed occurrence (`-03`); the dead helpers at
`test/iteration-disposition.test.js:20-33` are added to Scope In for deletion
(`-04`); DoD 6 gains an explicit concept-token anchor policy with an instruction
that S1 may re-anchor but not delete (`-05`); and DoD 3's cost budget is widened
to cover both new tests (`-06`).

## Dismissal-posture disclosure

**Two consecutive waves at 100% incorporation (4/4, then 6/6).** Per
`phase-pr-review.md` §5 this is a reportable smell and is reported to the owner
rather than recorded as diligence.

The adjudicator's read: this is not reviewer over-reach being waved through —
every finding was independently re-verified against the tree before
incorporation, and one (`PLAN-R2-01`) had its *proposed fix* rejected. It is
evidence that revs 1 and 2 were under-baked, and specifically that the same
authoring mistake — specifying a detector without executing it — was made
twice. The correct response is the rev-3 restructure rather than a third patch
wave, and the fact that the panel found the second instance rather than the
author is itself the finding worth carrying to the owner.

## Escalations to the human

None of the three escalating cases applies: no dismissal of a high or medium
finding is proposed, no finding touches a previously human-ratified
residual-risk boundary, and none contradicts an owner-ratified decision (D1-D4
untouched; both reviewers emitted `CLEAR: D` in both rounds).

The 100%-incorporation smell above is disclosed to the owner at the gate, as
the dismissal posture requires — it is a disclosure, not an escalation.

## Cross-session ratified-dismissal check

`grep -rl "ratif" docs/reviews/*/consolidated.md` searched before adjudicating;
no prior consolidated file records a ratified dismissal of any finding class
raised here.
