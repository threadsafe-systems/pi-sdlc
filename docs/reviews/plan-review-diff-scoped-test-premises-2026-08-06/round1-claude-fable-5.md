# Plan panel round 1 — claude-fable-5

Model: `claude-fable-5`. Artifact: `docs/plans/2026-08-06-diff-scoped-test-premises.md` @ 5eb2567.

### Meta-test as specified fails today on three uninventoried files — DoD 3/5/6 are jointly unsatisfiable within the stated scope
- severity: high
- confidence: high
- origin: NEW
- location: Objective item 3, Scope "In"/"Out", DoD items 3, 5, 6
- defect: The plan freezes the meta-test's detection patterns (`baseRef(` / `baseFile(` / `merge-base` outside `test/frozen-surfaces.test.js` fails the suite) without ever running that scan against the current corpus. Run today, it fires on three files the plan never names, none of which are in scope to change.
- evidence: `test/disposition-ledger.test.js:52` invokes `git merge-base HEAD main` as a real baseline fallback ("fall back to merge-base/main only if unavailable", :48-49); `test/telemetry-collect.test.js:123,358,370` and `test/telemetry-collect-soft.test.js:333` contain the literal `merge-base` in git stubs. Scope "In" lists only `test/iteration-disposition.test.js` among existing test files; DoD 5 requires "the meta-test passes across the whole directory"; DoD 6 requires the full suite green. Objective 2's rule ("no other test file may reach for the branch base") is already false at HEAD via `disposition-ledger.test.js:52`.
- impact: Implement is forced into one of three unstated moves: widen scope (rewrite disposition-ledger/telemetry tests), weaken the pattern (silently narrowing the guard the DoD promises), or add an allowlist (contradicting CONTRIBUTING's planned "sole diff guard" claim). Whichever is chosen, the DoD as written cannot be met by the work as scoped.
- fix: Run the audit at plan time, inventory the three files, and pre-decide each disposition in the plan (e.g., match actual git `merge-base` invocations rather than the bare token, plus an explicit reasoned exemption or in-scope rewrite for `disposition-ledger.test.js`'s fallback).
### DoD 5 contradicts itself, and its escape clause is unverifiable
- severity: medium
- confidence: high
- origin: NEW
- location: Definition of done, item 5
- defect: "The meta-test passes across the whole directory" and "any occurrence it finds beyond the four named scenarios is reported to the owner rather than silently rewritten" cannot both hold when such an occurrence exists — and per the finding above, three exist now. Additionally "reported to the owner" names no landing site, so no check can falsify whether it happened.
- evidence: DoD 5 quoted above; occurrences at `test/disposition-ledger.test.js:52`, `test/telemetry-collect.test.js:123`, `test/telemetry-collect-soft.test.js:333`. The framework's own disposition vocabulary requires escalations/carries to land somewhere named (skills/sdlc/references/system-reference.md:455-458).
- impact: A gate reviewer cannot decide whether DoD 5 is met: a found-but-reported occurrence simultaneously satisfies clause two and violates clause one. The unfalsifiable "reported" clause invites a prose-only discharge — the exact failure mode this plan exists to kill.
- fix: Reword DoD 5 to a decidable rule: any occurrence beyond the four is either brought in scope, or exempted with a recorded reason in the meta-test, or escalated as a filed issue id — and the meta-test must pass after that disposition.
### The carry to S1 is an orphan by the framework's own carry law
- severity: medium
- confidence: high
- origin: NEW
- location: "Context for the next agent" — "Carry to S1"
- defect: The plan's central deliverable (the law in `phase-spec.md` §4) is protected across S1's ratified rewrite of that exact section by nothing but a prose instruction in this plan doc ("Do not silently drop it when rewriting the section; restate it"). The framework's carry vocabulary is within-run (`CARRY-TO-SPEC/BUILD/IMPLEMENT/BACKLOG`); the only durable cross-run landing is `CARRY-TO-BACKLOG` "as a filed issue id", which the plan does not mint, and no standing scenario asserts §4 carries the law.
- evidence: skills/sdlc/references/system-reference.md:452-458 (carry destinations and no-orphan rule; backlog carry "lands as a filed issue id"); docs/briefs/2026-07-26-design-phase-r5-synthesis.md:58,107 (S1 owns `phase-spec.md` §4 and is next in the ratified order); plan Assumption 4 concedes S1 "will need absorbing" the prose.
- impact: This reproduces the plan's own diagnosed failure class on its own centerpiece: an obligation whose only witness is prose that a later slice can silently drop with nothing failing. The plan converts other prose invariants into standing scenarios (IDV3/IDV14) but leaves its own new law unguarded — an internal inconsistency of approach.
- fix: Land the carry durably — either a standing content scenario asserting `phase-spec.md` §4 states the non-change-claim law, or a filed issue id attached to the S1 slate (#192).
### The meta-test's self-application is unstated: it flags its own source and its own negative fixture
- severity: medium
- confidence: high
- origin: NEW
- location: Objective item 3 and DoD item 3
- defect: The only stated exemption is `test/frozen-surfaces.test.js`, but the meta-test's own source must contain the tokens `baseRef(`/`baseFile(`/`merge-base` as pattern literals, and DoD 3's "negative fixture" option would put forbidden tokens under `test/` — which the same DoD says the test "reads every file under `test/` once". Written as specified, the meta-test fails on itself or its fixture.
- evidence: Objective 3: "`baseRef(` / `baseFile(` / `merge-base` usage outside `test/frozen-surfaces.test.js` fails the suite." DoD 3: "proven non-vacuous (a negative fixture or an inline mutation …)" and "reads every file under `test/` once".
- impact: A naive implementation turns the suite permanently red; the inevitable workaround (self-exemption, non-literal pattern construction, fixture outside `test/`) is currently an implementer's silent judgment call rather than a planned decision, on a slice whose whole point is eliminating silent guard erosion.
- fix: State the exemption set exactly (the guard plus the meta-test itself, with patterns assembled non-literally) and mandate the inline-mutation proof, not an on-disk fixture under `test/`.
CLEAR: D — the plan is consistent with ratified D1–D4 (disposition table matches D4 row-for-row against test/iteration-disposition.test.js:149,355,408,421) and flags rather than reopens the S1/§4 interaction (Assumption 4); the ratified slate ordering (brief :107) is not contradicted.
CLEAR: F — irreversible track claimed and honoured: full phase set, plan panel pending; over-classification of adopter-facing guidance prose is the safe direction under SKILL.md's two-track law ("When in doubt, use the repo's committed `shape.defaultTrack`").
CLEAR: PROPORTIONALITY — the only new machinery (the meta-test) carries an explicit budget: in-suite, single pass over `test/`, no subprocess/network/model calls, <1s wall, no new CI job (DoD 3); the IDV3/IDV14 conversions remove git subprocesses, reducing suite cost.
