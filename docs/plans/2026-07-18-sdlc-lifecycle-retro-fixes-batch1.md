# Plan: sdlc lifecycle retro fixes, batch 1 (completion contract, delegation hardening, stall guidance)

- Date: 2026-07-18
- Track: **reversible** (fast path). Skill prose plus one new small script; no
  persisted consumer schema change, no public/frozen contract touched.
- Source: retro Epic #76 (`docs/retros/2026-07-17-config-versioning-lifecycle-retro.html`),
  sub-issues #77 (W1/H2), #78 (T1/T2), #79 (H1) — the epic's three HIGH-priority
  findings.
- Brief brainstorm: this session's scoping audit of #77–79 against this repo's
  own iron law and `agent-brief.md` template; tracker bodies tightened before
  drafting this Plan (see the three issues' revision history). Direction
  ratified by the project owner: "go ahead with the rewrite and tightening
  then plan+build."
- Human gate: **Approved** by Neil Chambers, 2026-07-18 (reviewed in VS Code,
  "accepted"). Build's tracker projection is final; Implement may proceed.
- Fix-wave amendment: the PR panel found completion-gate inconsistencies;
  this batch also hardens native GitHub relationship checks and teaches panel
  dispatch to advance through the configured `prefer` candidates after
  reviewer infrastructure failure. These are in-scope correctness fixes to
  the same retro outcome, not a new tracker task.

## Objective

Close the three HIGH-priority behavioural gaps the config-versioning-migration
lifecycle retro found. All three share one through-line: the human acted as a
liveness/completion detector instead of a judgment-maker.

1. A phase must not claim "complete"/"PASS" without a machine-checked
   deliverable (W1/H2).
2. A dispatched worker subagent runs under an explicit scope contract, and an
   infra-class dispatch failure self-heals once before costing a human turn
   (T1/T2).
3. A stalled phase self-detects and self-resumes before the human notices
   dead air (H1).

## Contradiction / boundary named up front

Two of the retro's three original fix proposals pointed at surfaces this repo
does not own: T2's "make the dispatch helper auto-retry" named the
`dispatch-subagents` skill, and H1's "harness... auto-resume" named `pi`
harness behaviour. Both are separate codebases pi-sdlc has no PR/panel
jurisdiction over — `dispatch-subagents` lives in a remote-less local skill
repo; the `pi` harness is a different, not-shipped-here project entirely.
This plan deliberately narrows both to what pi-sdlc's own `SKILL.md` can
actually deliver: prose self-instruction the orchestrating agent follows when
*it* is the one issuing `subagent` dispatches or absorbing a provider stall.
The out-of-repo halves are named explicitly and descoped below, not silently
dropped.

## Scope

### In

- A new completion-check script (exact name/CLI pinned at Build) with two
  modes:
  - `pr-open` — branch pushed with no unpushed commits; an open PR exists for
    it; the PR body carries exactly one valid `sdlc` declaration block; the
    PR body references every in-scope sub-issue (`Closes #N`).
  - `epic-done` — every native sub-issue of the given epic is `CLOSED`; the
    PR is `MERGED`.
- `SKILL.md` (Implement/PR phase): no "complete"/"PASS" claim without running
  the matching check and it passing.
- `SKILL.md` (Implement phase): the canonical worker task-prompt shape for
  any subagent this skill dispatches — explicit stop-conditions, a
  recommended `toolBudget`/`turnBudget` default, and a canonical "finalize
  now" resume message.
- `SKILL.md`: an orchestrator self-instruction — one automatic retry on an
  infra-class dispatch failure (crash/OOM/timeout/transport error) before it
  is treated as needing human attention; a second consecutive infra failure,
  or any model-authored verdict, still surfaces normally.
- `SKILL.md`: a phase-agnostic stall-detection rule — after N consecutive
  turns (N pinned at Build) ending in a provider/tool error with no assistant
  content, the agent self-issues a continuation before treating the phase as
  blocked.
- Tests asserting the above `SKILL.md` content lands, and unit tests for the
  new completion-check script.
- Tracker: #77, #78, #79 retargeted to the build-task shape (done as part of
  this Plan's own preparation — see each issue's current body).

### Out

- Any edit to `/home/neil/.agents/skills/dispatch-subagents` (separate,
  remote-less repo, outside this project's jurisdiction). If that skill's own
  generic worker-prompt boilerplate should converge on this shape, that is a
  separate, informal change to that skill directly.
- Any change to the `pi`/`pi-coding-agent` harness. The genuine fix for H1 — a
  visible, harness-emitted stall signal and true auto-resume — is out of
  scope; this plan ships only the interim, prose-level self-detection an
  orchestrating agent can perform for itself.
- #80–#85 (the epic's MEDIUM/LOW sub-issues) — separate future batches.
- Wiring the new completion-check script into CI as a required status check.

## Definition of done

- [ ] The completion-check script exists, is unit-tested, and `SKILL.md`
      requires it before any complete/PASS claim in Implement/PR.
- [ ] `SKILL.md` states the canonical worker task-prompt shape
      (stop-conditions + `toolBudget`/`turnBudget` default) for
      sdlc-dispatched subagents.
- [ ] `SKILL.md` states the infra-vs-verdict distinction and the
      auto-retry-once rule.
- [ ] `SKILL.md` states the stall-detection threshold and self-resume action.
- [ ] `npm test` and `npm run lint` (biome) clean.
- [ ] #77, #78, #79 each close on this effort's PR merge (native `Closes #N`
      references).
- [ ] PR panel runs to the stop condition (reversible track: no pre-PR panel;
      the PR panel still runs).

## Context for the next agent

Build must pin: the completion-check script's exact filename/CLI surface, and
must state explicitly that it is permitted to call `gh` (a deliberate,
named divergence from `check-lifecycle.mjs`'s offline-only design — do not
fold this into that script or silently reuse its contract). Build also
decides exactly where the worker-prompt/toolBudget text and the
infra-retry/stall-detection prose live structurally within `SKILL.md`
(existing Implement section vs. a new subsection) — keep the two homes
(if the rule is ever restated in more than one place) in sync, per this
project's own "editing a rule in one place only is itself a red flag"
discipline.
