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

## Escalations to the human

None. No dismissal of a high or medium finding is proposed, no finding touches a
previously human-ratified residual-risk boundary, and none contradicts an
owner-ratified decision (D1-D4 are untouched; both reviewers emitted `CLEAR: D`).

## Cross-session ratified-dismissal check

`grep -rl "ratif" docs/reviews/*/consolidated.md` searched before adjudicating;
no prior consolidated file records a ratified dismissal of any finding class
raised here.
