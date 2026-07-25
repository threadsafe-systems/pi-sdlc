# Spec authoring + panel steering (supplement; does not replace the sdlc skill's phase contract)

## While authoring, before any panel round

1. **Price every verification scenario.** Any scenario that runs in CI or a
   release gate must state an explicit time budget (e.g. `timeout-minutes`) and,
   where relevant, a cost bound. A scenario whose runtime is unbounded or
   unknown is not done — estimate it or bound it. If honest gating genuinely
   needs an expensive path, split it: a bounded per-commit smoke plus an
   explicitly scheduled/release-time full run. (A converged spec once shipped a
   48-minute per-branch CI gate because no reviewer axis priced it.)
2. **Keep spec altitude.** Contract shapes, scenarios, error semantics belong
   here; narrative history does not. Panel history goes in the review artifact,
   never the spec header.

## When dispatching each panel round, append to every reviewer task

> Additional attack surface — PROPORTIONALITY: for every scenario that runs in
> CI or a gate, verify a time/cost budget is stated and plausible. Flag as a
> finding any verification machinery whose cost is unbounded, unstated, or
> disproportionate to what it gates. A stricter check that ratchets cost without
> a budget is a defect, not an improvement.
> 
> Rounds after the first are DELTA reviews: here are the prior findings and
> their dispositions [paste table]. Tag each finding NEW or REOPENED(<prior id>);
> a REOPENED finding requires new evidence not present when it was dispositioned.
> Confirming prior fixes needs one line each, not a full re-litigation.

## When adjudicating

1. **Dismissal is a real verdict.** Reviewer output is ~80% right; if you have
   incorporated 100% across two consecutive rounds, say so to the human — it is
   a smell, not diligence. Propose dismissals (with one-line reasons) for
   findings you'd only incorporate to avoid arguing; the human ratifies, and a
   ratified dismissal bars that finding class in later rounds.
2. **Trim the tail.** When a round yields no highs and a single medium (or less)
   from one reviewer: fix it, then re-dispatch ONLY that reviewer for a delta
   confirmation — or offer the human accept-without-redispatch. Do not run a
   full multi-reviewer round to chase one medium.
3. **Round cap.** If round 4 arrives with new high/medium findings still
   appearing, stop dispatching. Diagnose to the human: is this (a) genuine rev1
   defects (keep going), (b) findings caused by your own fix waves (churn —
   restructure instead), or (c) a design flaw (backward transition to Plan)?
4. **Identity discipline.** Pass `--author` as the model THIS session is
   actually running as (check it; do not copy from a prior session), and record
   the same identity as Orchestrator in the consolidated artifact.
5. **Artifact discipline, every round.** Commit per-round reviewer outputs +
   consolidated adjudication (incorporated/dismissed counts) with each fix-wave
   commit, and emit the `panel.consolidated` telemetry event per round — not
   once at the end.

# Writing comments

You must refer to the global writting-comments skill during the implementation phase
