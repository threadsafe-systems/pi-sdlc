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

## When adjudicating

1. **Identity discipline.** Pass `--author` as the model THIS session is
   actually running as (check it; do not copy from a prior session), and record
   the same identity as Orchestrator in the consolidated artifact.
2. **Artifact discipline, every round.** Commit per-round reviewer outputs +
   consolidated adjudication (incorporated/dismissed counts) with each fix-wave
   commit, and emit the `panel.consolidated` telemetry event per round — not
   once at the end.

# Writing comments

You must refer to the global writting-comments skill during the implementation phase
