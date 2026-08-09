# Dispatch prompt — spec_review round 3 (delta review)

Agent: `pi-sdlc-spec-review` (project, stamped from `prompts/adversary-spec.prompt.md`); per-task model overrides `google/gemini-3.1-pro-preview:xhigh` and `openai-codex/gpt-5.6-luna:xhigh`. Async workflow `call_b9c6441cc2b34e928b21c2fb` (a first attempt, `call_707f62c09af7420a9273c2f2`, failed pre-verdict on a dispatch error — agent names `gemini`/`luna` instead of `pi-sdlc-spec-review` + model overrides; no reviewer ran).

Stamped values supplied in the task:

- `<REPO_PATH>` = `/home/neil/code/threadsafe/pi-sdlc`
- `<COMMIT_SHA>` = `c58ad7a`
- `<SPEC_PATH>` = `docs/specs/2026-08-08-spec-artifact-skeleton.md`
- `<PLAN_PATH>` = `docs/plans/2026-08-08-spec-artifact-skeleton.md`

Round 3 = delta review per the prompt's `## Delta rounds` contract: scope is the rev-2 → rev-3 amendments (the eight distinct fixes for SPEC-R2-01..09). The task supplied all nine round-2 findings with their dispositions, asked each reviewer to confirm each disposition landed (one line each), then hunt the delta for `NEW` defects or lawfully `REOPENED(<id>)` ones, and re-check internal consistency of the touched sections (C1, C4, C7, M1, M3, M5, SAS1, SAS3, SAS5, SAS10) against plan, premise-durability law, and framework reality with full repo access at the named commit.
