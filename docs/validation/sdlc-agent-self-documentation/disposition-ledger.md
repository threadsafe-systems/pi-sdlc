# SKILL disposition ledger — agent self-documentation

- Feature: `sdlc-agent-self-documentation`
- Baseline: the pre-change `skills/sdlc/SKILL.md` (git `HEAD` before this stream;
  commit `1f873eb` on `main`, ~551 lines).
- Purpose (Spec §7/§8): every normative rule and red flag in the pre-change
  `SKILL.md` maps to exactly one disposition — **retained** in `SKILL.md`
  (kernel/router), **moved** to exactly one named reference, or **intentionally
  replaced** with a recorded reason. No current normative statement is silently
  dropped or owned twice.

## How to read this ledger (machine-checkable)

The table below is the ASD5 review baseline. Each row has:

- **ID** — stable statement id.
- **Disposition** — `retained` | `moved` | `replaced`.
- **Destination** — the repo-relative file that now owns the statement
  (`skills/sdlc/SKILL.md` for `retained`; a reference for `moved`; `—` for
  `replaced`).
- **Anchor** — a verbatim phrase that must appear (whitespace-normalized) in the
  destination file. ASD5 asserts every `retained`/`moved` row's destination
  exists and contains its anchor; deleting a moved statement from its destination
  fails non-vacuously. Anchors are unique across rows, so no rule is owned twice.

`replaced` rows carry a reason instead of an anchor and are exempt from the
anchor check.

## Normative statements

| ID | Statement (gist) | Disposition | Destination | Anchor |
|---|---|---|---|---|
| S01 | Adoption is opt-in, not a global default | retained | skills/sdlc/SKILL.md | framework a repo *adopts*, not a global default |
| S02 | Ready criteria; four mechanical states | retained | skills/sdlc/SKILL.md | proves this mechanically with four states |
| S03 | Run the gate; branch on exit code | retained | skills/sdlc/SKILL.md | branch on its exit |
| S04 | Exit 0 ready: announce + enumerate hooks/workflow | retained | skills/sdlc/SKILL.md | announce with the config's `announce` string |
| S05 | Exit 1 not-adopted: no announce; offer setup/advisory | retained | skills/sdlc/SKILL.md | State the repo has not adopted the |
| S06 | Exit 2 error: stop; never downgrade to advisory | retained | skills/sdlc/SKILL.md | An error is never silently downgraded to advisory mode |
| S07 | Exit 3 not-ready: remediate; schema-current; no fold-forward | retained | skills/sdlc/SKILL.md | pre-adoption config fold-forward |
| S08 | Before ready, MUST NOT enter phase/fire hooks/mutate tracker | retained | skills/sdlc/SKILL.md | MUST NOT create or mutate tracker objects |
| S09 | Startup table is agent-executed prose law (ADR 0011) | retained | skills/sdlc/SKILL.md | agent-executed prose law (ADR 0011) |
| S10 | Advisory mode is a one-session escape hatch | moved | skills/sdlc/references/system-reference.md | escape hatch when a repo has not opted in |
| S11 | Advisory-mode behavioural rules | moved | skills/sdlc/references/system-reference.md | never claim the session runs |
| S12 | Iron law: backward always allowed, no sunk-cost | retained | skills/sdlc/SKILL.md | sunk cost of an earlier gate never justifies shipping a |
| S13 | Irreversible definition | retained | skills/sdlc/SKILL.md | freezes a shape other code, data, or |
| S14 | Irreversible track requires plan+spec panels | retained | skills/sdlc/SKILL.md | plan panel AND spec panel |
| S15 | Reversible fast path; PR panel still runs | retained | skills/sdlc/SKILL.md | none pre-PR; the PR panel still runs |
| S16 | PR track declaration, check-lifecycle, bot exemption | moved | skills/sdlc/references/phase-pr-review.md | PRs without a valid declaration |
| S17 | Review dials + overrides + separateSpec | retained | skills/sdlc/SKILL.md | `shape.separateSpec: false` merges Plan and Spec |
| S18 | Read config for values, CONFIG.md for meaning | retained | skills/sdlc/SKILL.md | Read the config for values |
| S19 | Phase/artifact/home sequence table | retained | skills/sdlc/SKILL.md | task breakdown with checks + scenario ids |
| S20 | Brainstorm map-mode footnote | moved | skills/sdlc/references/phase-brainstorm.md | too large or too foggy |
| S21 | Build epic-mode footnote | moved | skills/sdlc/references/phase-tasks.md | tracker-backed Build (epic + sub-issues + board) |
| S22 | Brainstorm is live dialogue; rubber-duck | moved | skills/sdlc/references/phase-brainstorm.md | rubber-duck the idea, not agree with it |
| S23 | Raise a contradiction or say there isn't one | moved | skills/sdlc/references/phase-brainstorm.md | Raise a contradiction, or say there isn't one |
| S24 | Use tools, proportional not mandatory | moved | skills/sdlc/references/phase-brainstorm.md | proportional, not mandatory ceremony |
| S25 | Present open questions structured | moved | skills/sdlc/references/phase-brainstorm.md | Present multiple open questions in a structured form |
| S26 | Expand and pressure-test, don't commandeer | moved | skills/sdlc/references/phase-brainstorm.md | Expand and pressure-test, don't commandeer |
| S27 | Map mode: switch when large/foggy | moved | skills/sdlc/references/phase-brainstorm.md | wayfinder-lite |
| S28 | The map issue is the canonical resumable artifact | moved | skills/sdlc/references/phase-brainstorm.md | resumable artifact for the effort, not a doc |
| S29 | Tickets are typed native sub-issues, HITL/AFK | moved | skills/sdlc/references/phase-brainstorm.md | native GitHub sub-issues of the map |
| S30 | Fog of war: only ticket sharp questions | moved | skills/sdlc/references/phase-brainstorm.md | Don't ticket what you can't yet phrase precisely |
| S31 | Out of scope is not fog | moved | skills/sdlc/references/phase-brainstorm.md | Work beyond the destination |
| S32 | Working the map: one ticket per session | moved | skills/sdlc/references/phase-brainstorm.md | never resolve more than one ticket per session |
| S33 | Exit the moment the destination is decision-ready | moved | skills/sdlc/references/phase-brainstorm.md | the moment the destination is decision-ready |
| S34 | Build-plan doc is canonical; publish threshold | moved | skills/sdlc/references/phase-tasks.md | canonical task breakdown |
| S35 | Epic/sub-issue/blocking/board discipline | moved | skills/sdlc/references/phase-tasks.md | One **native sub-issue per task** |
| S36 | Below-threshold plain doc; Implement frontier | moved | skills/sdlc/references/phase-tasks.md | one sub-issue at a time |
| S37 | Tracker is a projection; doc wins | moved | skills/sdlc/references/phase-tasks.md | never the source of truth |
| S38 | Spec defines falsifiable scenarios, not test code | moved | skills/sdlc/references/phase-spec.md | A scenario that cannot be made to fail is a broken spec |
| S39 | Implementer writes tests test-first; floor not ceiling | moved | skills/sdlc/references/phase-implement.md | floor, not the ceiling |
| S40 | Panels share one shape; prompts single source | moved | skills/sdlc/references/phase-pr-review.md | single sources of truth in `prompts/` |
| S41 | resolve-panel behaviour | moved | skills/sdlc/references/phase-pr-review.md | keeps models with credentials |
| S42 | Dispatch: two paths, one reused agent | moved | skills/sdlc/references/phase-pr-review.md | one agent reused across the panel |
| S43 | Before fan-out confirm the subagent tool | moved | skills/sdlc/references/phase-pr-review.md | confirm the `subagent` tool is actually in |
| S44 | Consolidate duplicates | moved | skills/sdlc/references/phase-pr-review.md | collapse duplicates into one issue |
| S45 | Adjudicate every high/medium; ~80% right | moved | skills/sdlc/references/phase-pr-review.md | roughly eighty per cent right |
| S46 | Stop when no high/medium survives | moved | skills/sdlc/references/phase-pr-review.md | no high or medium finding survives adjudication |
| S47 | Save panel artifacts under reviews home | moved | skills/sdlc/references/phase-pr-review.md | Save panel artifacts under |
| S48 | review.tasks dial; validator is a checklist executor | moved | skills/sdlc/references/phase-implement.md | checklist executor, not a judge |
| S49 | Portable/deterministic; no imposed tsc | moved | skills/sdlc/references/phase-implement.md | no unconditional `npx tsc --noEmit` |
| S50 | PV1 manifest, five categories, scenario mapping | moved | skills/sdlc/references/phase-implement.md | five categories |
| S51 | PV2 deterministic runner; receipt; verify | moved | skills/sdlc/references/phase-implement.md | verify-task-receipt.mjs |
| S52 | Prepare PR body from template; declare/link | moved | skills/sdlc/references/phase-pr-review.md | Prepare the PR body from |
| S53 | Run check-lifecycle before opening the PR | moved | skills/sdlc/references/phase-pr-review.md | run the local lifecycle checker |
| S54 | Local PR panel loop; keep dev findings out of PR body | moved | skills/sdlc/references/phase-pr-review.md | do not add development findings to the PR body |
| S55 | Open only when clean; new-concern reply-with-SHA flow | moved | skills/sdlc/references/phase-pr-review.md | reply with that commit's short SHA |
| S56 | track:none exemption is not a third track | moved | skills/sdlc/references/phase-pr-review.md | exemption declaration, not a third lifecycle track |
| S57 | Visual gate artefacts are an optional pointer | moved | skills/sdlc/references/system-reference.md | self-contained interactive HTML view |
| S58 | Hooks object; phase keys distinct from review phases | moved | skills/sdlc/references/system-reference.md | distinct from the four review-panel phases |
| S59 | Hook item kinds run/use | moved | skills/sdlc/references/system-reference.md | missing tool = hook failure |
| S60 | Hook ordering | moved | skills/sdlc/references/system-reference.md | `before` hooks fire `*` items first |
| S61 | Hook failure: before blocks, after warns | moved | skills/sdlc/references/system-reference.md | retry, ask, or move backward |
| S62 | Hook working directory; worktree create-then-enter | moved | skills/sdlc/references/system-reference.md | create-then-enter |
| S63 | Announce-on-fire audit trail | moved | skills/sdlc/references/system-reference.md | Announce-on-fire (the audit trail) |
| S64 | Hook trust boundary | moved | skills/sdlc/references/system-reference.md | execute arbitrary shell commands with the agent's |
| S65 | workflow.md prose layer enumeration | moved | skills/sdlc/references/system-reference.md | no risky merges on Fridays |
| S66 | Gate/process conflict rule | retained | skills/sdlc/SKILL.md | local rules may ADD gates, never remove or weaken |
| S67 | Skills/tools are enhancements, not dependencies | moved | skills/sdlc/references/system-reference.md | enhancement, never a hard |
| S68 | Enhancement rule does not cover hooks | moved | skills/sdlc/references/system-reference.md | This rule does not cover hooks |
| S69 | Delegation pointers (do not reimplement) | retained | skills/sdlc/SKILL.md | do not reimplement |
| S70 | ADR criteria: hard-to-reverse + surprising + trade-off | moved | skills/sdlc/references/system-reference.md | surprising without context, and the result of a real trade-off |

## Red flags (pre-change list — all retained in `SKILL.md`)

| ID | Red flag (gist) | Disposition | Destination | Anchor |
|---|---|---|---|---|
| RF01 | Skipping a gate forward | retained | skills/sdlc/SKILL.md | Skipping a gate forward |
| RF02 | Skipping/reordering a configured phase hook | retained | skills/sdlc/SKILL.md | Skipping or silently reordering a configured phase hook |
| RF03 | Writing to main after creating a worktree | retained | skills/sdlc/SKILL.md | Writing to the main checkout after creating a worktree |
| RF04 | Merging with a surviving high/medium finding | retained | skills/sdlc/SKILL.md | Merging with a high or medium finding that survived adjudication |
| RF05 | Dismissing/incorporating a finding without reason | retained | skills/sdlc/SKILL.md | Dismissing a finding without a recorded reason |
| RF06 | A spec outcome no scenario can falsify | retained | skills/sdlc/SKILL.md | A spec outcome that no scenario can falsify |
| RF07 | Committing generated per-model adversary files | retained | skills/sdlc/SKILL.md | Committing generated per-model adversary files |
| RF08 | Editing a phase reviewer prompt in more than one place | retained | skills/sdlc/SKILL.md | Editing a phase reviewer prompt in more than one place |
| RF09 | Resolving more than one map ticket per session | retained | skills/sdlc/SKILL.md | Resolving more than one map ticket in a single session |
| RF10 | A HITL ticket the agent answered itself | retained | skills/sdlc/SKILL.md | A HITL ticket resolved by the agent answering its own questions |
| RF11 | Bypassing the deterministic validation runner | retained | skills/sdlc/SKILL.md | Bypassing the deterministic validation runner |
| RF12 | A stale whole-file validator prompt override | retained | skills/sdlc/SKILL.md | A stale whole-file validator prompt override |
| RF13 | Above-threshold build skipping the publish step | retained | skills/sdlc/SKILL.md | that skips |
| RF14 | Treating the tracker as the source of truth | retained | skills/sdlc/SKILL.md | Treating the tracker (map, epic, sub-issues, board) as the source of truth |

## Merge-integration relocations (from main #103/#104, absorbed at merge)

These sections did not exist in this stream's restructure baseline (`d528b97`);
they landed on `main` after the branch point (retro-fixes-batch1 #103 and
lifecycle-telemetry #104) and were **moved** into the new reference architecture
when `main` was integrated, so the ledger records them for completeness. Same
anchor discipline as above.

| ID | Statement (gist) | Disposition | Destination | Anchor |
|---|---|---|---|---|
| M01 | Dispatching implementation workers (stop-conditions, tool/turn budgets, infra-retry-once) | moved | skills/sdlc/references/phase-implement.md | Dispatching implementation workers |
| M02 | Stall detection and self-resume (2-consecutive-turn threshold) | moved | skills/sdlc/references/system-reference.md | Stall detection and self-resume |
| M03 | Lifecycle telemetry (FS13) emission map + harvest-at-dispatch | moved | skills/sdlc/references/system-reference.md | Record these prose-emitted inflection points |

## Intentionally replaced

None. Every pre-change (`d528b97` baseline) normative statement and red flag is
retained in the kernel/router or moved to exactly one reference. New additions in
the restructured `SKILL.md` (e.g. the startup freshness check and its
`CONFIG.md`-prose-vs-JSON red flag) are net-new to this stream and are not ledger
rows, which map pre-change statements only. Content that landed on `main` after
the branch point (#103/#104) and was relocated at merge is recorded in the
merge-integration table above.
