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
| 3 | 5 | `claude-fable-5` | `panels/plan_review-round5-2026-08-06/` | `panel.dispatched{round 3, wave 3}` |
| 3 | 6 | `gemini-3.1-pro-preview` | `panels/plan_review-round6-2026-08-06/` | same wave, separate label |

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

## Round 3 (delta, `bcba627..8091fc8`) — findings

Both reviewers confirmed all six round-2 findings discharged. No `REOPENED` tags.

| id | severity | origin | reviewer | gist | disposition |
|---|---|---|---|---|---|
| `PLAN-R3-01` | high | NEW | fable-5 | The measured file set (45 top-level `*.js`) is not the enforced one (`test/` = **74** files); `test/e2e/harness.mjs:250,290` runs `git init -b main` | **incorporated** |
| `PLAN-R3-02` | high | NEW | fable-5 | The detector concept is frozen without its pattern set, and the definition contradicts the measurement — the sanctioned guard passes refs via a loop variable, so its argv names no moving ref | **incorporated** |
| `PLAN-R3-03` | medium | NEW | fable-5 | The baseline row is unreproducible: rev 2's documented tokens match **6** files, not 7; `telemetry-emitter` is mischaracterised as git-stub source | **incorporated** |
| `PLAN-R3-04` | medium | NEW | fable-5 | "Every genuine occurrence is a call-shape match" is false at occurrence granularity — `disposition-ledger.test.js:53,57` reads `main:<path>` through a variable | **incorporated** |
| `PLAN-R3-05` | high | NEW | gemini | `telemetry-emitter.test.js:288` (`rev-parse HEAD`) is an uninventoried false positive | **DISMISSED** — see below |

**Counts:** 3 high, 2 medium, 0 low. **Incorporated 4, dismissed 1.**

### `PLAN-R3-05` — dismissed (high), with a partial incorporation

The finding asserts the Plan "explicitly defines `HEAD` as a moving ref". It does
not. Rev 3's anchor table lists `merge-base HEAD main`, `main:<path>` and
`origin/main`; `HEAD` appears only *inside* the first example string, as part of
a merge-base invocation against the main line. The reviewer generalised an
example into a definition.

The substance is also wrong. `test/telemetry-emitter.test.js:288` is
`execFileSync("git", ["-C", detached, "rev-parse", "HEAD"])` against a temp repo
the test built four lines earlier (`gitRepo({ branch: "work" })`, :286) in order
to detach it and assert the telemetry emitter skips on detached HEAD. That reads
the fixture's own tip — the thing under test — not the main line. It cannot
expire at merge, because no merge changes it. Verified by reading `:286-294`.

**Partially incorporated:** the misreading was invited by a table that showed
`HEAD` inside an example without saying it is not itself an anchor. Rev 4's
anchor table gains an explicit row — *a fixture repo's own `HEAD` → does not
expire* — so the next reader cannot make the same inference.

This is the round's one dismissal and it is recorded as a real verdict, not an
oversight: cross-model agreement was absent (fable-5 did not raise it), the
claim was checked against the file rather than against the reviewer's summary,
and the fix it proposed would have added a false exemption that weakened the
guard.

### `PLAN-R3-01` to `-04` — incorporated as one restructure, not four patches

All four verified independently:

- `git ls-tree -r --name-only bcba627 -- test/ | wc -l` → **74**; top-level
  `*.js` → **45**. `test/e2e/harness.mjs:250,290` confirmed.
- `test/frozen-surfaces.test.js:49-51` confirmed: `for (const ref of ["main",
  "origin/main"]) … execFileSync("git", ["-C", repo, "merge-base", "HEAD", ref])`
  — argv names `merge-base`, no moving ref.
- `git grep -lE "merge-base|origin/main|main:|baseRef\(|baseFile\(" bcba627 --
  'test/*.js' | wc -l` → **6**, and the same grep over
  `test/telemetry-emitter.test.js` → no match. The rev-3 table's "7" came from a
  probe regex including quoted `"main"`, which rev 2 never documented.
- `test/disposition-ledger.test.js:53,57` confirmed: `"main:skills/sdlc/SKILL.md"`
  enters `refs`, consumed by `execFileSync("git", […, "show", ref])`.

`PLAN-R3-02` is the diagnostic one and it is why these are one fix rather than
four. It shows the rev-3 *definition* and the rev-3 *measurement* describe
different things, and that no reader can reconstruct the regex that produced
"3 matched, 0 false". Patching the definition again would produce a fourth gap.

## Churn diagnosis (round 3, ahead of the round cap)

The round cap fires at round 4. This diagnosis is raised at round 3 because the
evidence is already unambiguous and dispatching a fourth round against a Plan
known to be at the wrong altitude is precisely the re-dispatch-instead-of-
restructure failure the cap exists to prevent.

| wave | Plan froze | panel found |
|---|---|---|
| 1 | a token ban, never executed | fires on 3 unnamed files |
| 2 | a broadened token set, never executed as specified | fires on a 4th (test *titles*) |
| 3 | a measurement whose pattern set was never stated | baseline unreproducible; definition ≠ measurement |

One mechanism, three instances: **the Plan was specifying an executable artifact
in prose.** Prose cannot be run, so each round the panel correctly found the gap
between description and behaviour.

Against the cap's four bounded options this is **(b) — churn generated by our
own fix waves; restructure rather than re-dispatch.** Rev 4 moves the detector's
pattern set, swept file set, and inventory out of the Plan and into the Spec as
deliverables that must be produced by execution, with a DoD item making a
described-but-unrun matcher a gate failure. Put to the owner at the gate.

## Dismissal-posture disclosure

**Waves 1 and 2 ran at 100% incorporation (4/4, then 6/6); wave 3 did not
(4/5, one high dismissed).** Per `phase-pr-review.md` §5 the two-wave streak is
a reportable smell and was reported to the owner rather than recorded as
diligence.

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
