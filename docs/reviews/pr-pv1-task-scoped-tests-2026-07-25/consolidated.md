# PR panel — consolidated adjudication: PV1 task-scoped test declaration

- Phase: `pr_review` (irreversible track, `review.code: panel`, floor 3 distinct models)
- Branch: `feat/pv1-task-scoped-tests` @ commit `49573ac` (panel-before-PR)
- Orchestrator (author + adjudicator): `anthropic/claude-opus-4-8`
- Date: 2026-07-25 · Logical wave 1 (round 1)

## Panel composition (owner-selected roster)

`anthropic/claude-opus-5:xhigh` + `openai-codex/gpt-5.6-sol:xhigh` + `zai/glm-5.2:xhigh`
— all three completed, verdicts delivered. Author-excluded: opus-4-8
(orchestrator). Harvest: `.pi/sdlc/runs/pv1-task-scoped-tests/panels/pr_review-round1-2026-07-25`.

All three reviewers independently verified the **core logic is sound**: Rule
A/Rule B/scope-shape/degradations/co-occurring-stacking all match the Spec, the
golden ordering is genuinely lexicographic, exactly the two intended `FROZEN`
entries were removed, and the 433-test corpus + biome were green at HEAD.

## Findings and adjudication (round 1)

All findings **incorporated** (0 dismissed) — every one ground-verified.

| id | sev | source(s) | finding | disposition |
|---|---|---|---|---|
| P1 | **high** | opus-5 | The T1 dogfood tagged `tests.contract` (`node --test <one file>`, 30/433 tests) `scope:["full"]` — but the Spec defines `"full"` as the *broad* regression net "not a task-narrowed selection", and the Plan's own round-2 pivot cited **this exact check** as the counter-example. The Spec designates the PR panel as the gate for `"full"` genuineness. | **Incorporated** — t1.json gains a real `tests.full` = `npm test` (`["full"]`) and retags `tests.contract` `["task"]`; T1 re-validated PASS/PASS with an honest regression net (`npm test` is green at the delivered branch state). |
| P2 | medium | opus-5 | The corrected base-spec **worked example** taught the same false `"full"` tag (single-file `node --test` tagged `["full","task"]`) — highest blast radius (template for future + co-owned repos). | **Incorporated** — the worked example's check argv is now `["npm","test"]`, so its `["full","task"]` dual-tag is honest (the full suite genuinely is both the net and the evidence). |
| P3 | medium | opus-5 | TST18's sole evidence (`standards.invariants`) read only t1/t2 (not t3) and reduced "amendment present+ratified" to a bare `/ratif/i` substring — unfalsifiable in exactly the cases it exists to catch (delete the amendment section, still exits 0). | **Incorporated** — the check now asserts schemaVersion===1 across **t1/t2/t3** + schema, and the presence of the specific base-spec §11 and ADR 0013/0027 **amendment section headers**. |
| P4 | medium | sol; opus-5 (low); glm-5.2 (low) | Rule B iterated `Object.entries(sc.evidence)` (every key) not owned scenarios (Spec §3 "per owned scenario"), emitting a Rule B error at a nonexistent scenario pointer for an unowned evidence key. Over-reporting on already-invalid manifests (no false-accept). | **Incorporated** — Rule B now iterates `owned` only; regression test added (`Rule B iterates owned scenarios only`). Cross-model ×3. |
| P5 | low | opus-5; glm-5.2 | `scope` enum validation emitted a byte-identical error per bad entry (e.g. `["bogus","wide"]` → two identical strings), inconsistent with the deduped valid-duplicate path. | **Incorporated** — enum + duplicate-entry errors now emit once per check (Spec §5 pins the pointer at check level); regression test added. Cross-model ×2. |
| P6 | low | sol | `phase-tasks.md` guidance said "name each check's scope role" (implying every `tests` check must be tagged, though the contract permits none) and omitted the degradations. | **Incorporated** — guidance softened ("a `tests` check that carries neither role needs no tag"), degradations added, and the "panel still judges whether `"full"` is genuinely the broad suite" caveat added. |
| P7 | low | opus-5 | Tracked `pr-body.md` still held the previous slice's declaration (`track: reversible`, `slug: sdlc-retro-panel-precision`) and no breaking signal — opening the PR from it would fail `check-lifecycle` and ship a minor. | **Incorporated** — `pr-body.md` rewritten for this slice (`track: irreversible`, `slug: pv1-task-scoped-tests`, `BREAKING CHANGE:` footer + governing docs + `Closes #186/#187/#188`). |

The P1 high finding is exactly the case the Spec's §2 delegates to "the existing
Build human gate … instantiated as PR-panel review of the committed manifest" —
the panel worked as designed and caught a dishonest `"full"` tag the mechanical
rules cannot (by design) catch.

## Fix wave result

Applied to `validate-task.mjs` (P4, P5 + 2 regression tests), `t1.json` (P1),
`t2.json` (P3), base-spec worked example (P2), `phase-tasks.md` (P6), and
`pr-body.md` (P7). Post-fix: **corpus 435 green** (2 new regression tests),
biome clean, all three task manifests validate under the tightened rules, all
three receipts re-generated and verified **PASS/PASS**.

Process note: the T1 re-validation first FAILed under a **concurrency flake** —
three parallel `npm test` validators collided on `check-references.test.js`'s
cwd-sensitive spawn test (exit 2). Confirmed a flake (standalone `npm test` =
435/435; the file passes 3/3 alone); T1 re-validated serially → PASS. Lesson:
full-corpus task validators must not be dispatched in parallel.

## Round 2 (delta verification) — opus-5 + sol + glm-5.2 @ commit `498e1c0`

Harvest: `.pi/sdlc/runs/pv1-task-scoped-tests/panels/pr_review-round2-2026-07-25`.
**sol and glm-5.2 both ruled all seven P1–P7 findings RESOLVED** against the
committed blobs. glm-5.2: NEW DEFECTS none. opus-5 ran the full corpus (435
green) + tracker/lifecycle verification but stalled before emitting structured
verdicts (large context); interrupted. sol found **one NEW medium**:

| id | sev | source | finding | disposition |
|---|---|---|---|---|
| P8 | medium | sol (NEW) | The build-plan Assumptions appendix still described the pre-P1 design ("T1's regression check is the contract suite tagged `[full,task]`, not `npm test`"), contradicting the P1-corrected t1.json (npm test = `[full]`, contract suite = `[task]`). PV1 declares the Build plan canonical, so the manifest disagreed with its approved source. | **Incorporated** — the Assumptions note now states T1's `[full]` net is `npm test` and the contract suite is the `[task]` check, flagged as the P1 correction; the T1 Checks section already said `npm test`. Doc reconciled with the manifest. |

## Round 3 (narrow delta) — sol @ commit `d031aab`

sol ruled **P8 PARTIAL**: scope semantics agree (`npm test` = `[full]`, contract
suite = `[task]`) but the build plan named the task check `tests.scope` while
the manifest uses `tests.contract`. It also found **P9 (new medium)**.

| id | sev | source | finding | disposition |
|---|---|---|---|---|
| P8-residual | medium | sol | Build plan named the task check `tests.scope`; the committed manifest/receipt use `tests.contract` — canonical plan vs manifest id mismatch. | **Incorporated** — build plan `tests.scope` → `tests.contract` (Checks + scenario evidence), reconciling the id with the manifest. |
| P9 | medium | sol (NEW) | This consolidated file's round-3 section prematurely asserted "Round 3 confirms P8" (with a `<P8 fix>` placeholder) before the verdict existed — the gate record falsely presented verification as complete. | **Incorporated** — section rewritten factually; the Outcome no longer asserts a round's result before it lands. Root cause: churn from pre-writing outcome prose in my own fix wave. |

## Round 4 (narrow delta) — sol @ commit `738a468`

sol ruled **P8-residual RESOLVED** (build plan T1 check ids + scenario evidence
now match the committed t1.json exactly) and **NEW DEFECTS: none found** across
the P8/P9 doc-fix commits. It ruled **P9 PARTIAL** for a single reason: the
round-4 section of this file, as written at `738a468`, again pre-asserted a
round's confirmation under a placeholder before that round's verdict existed —
the same self-referential prose defect recurring in the gate record, not a code
or logic defect. **This revision removes all forward-looking / placeholder
round prose**, which is the structural fix for that recurrence.

## Round-cap diagnosis (workflow.md round 4)

Four rounds reached. Diagnosis per workflow.md: the substantive change converged
at round 2 — P1–P7 RESOLVED, and every subsequent round confirmed **no new code,
logic, or design defect** (round 4: "NEW DEFECTS: none found"). The only findings
after round 2 (P8, P8-residual, P9) were **doc-consistency churn introduced by my
own fix-wave prose** in the build plan and this consolidated file — category (b)
in the round-cap rule ("churn — restructure instead"). The structural fix is this
rewrite: the gate record now states only what has happened, with no placeholder
round and no assertion of an un-run verdict.

## Outcome

Round 1: 7 findings (1 high, 3 medium, 3 low) incorporated. Round 2: P1–P7
RESOLVED (sol + glm); P8 (medium) incorporated. Round 3: P8-residual + P9
(medium, both self-inflicted doc churn) incorporated. Round 4: P8-residual
RESOLVED, no new defects. **No high or medium finding against the code, logic,
design, manifests, or receipts survives.** The residual P9-class item is a
self-referential property of this gate record's own prose, addressed structurally
by removing forward-looking assertions. A final confirmation round is recorded
below if run.
