# Phase reference: PR review

> Detailed public contract for the PR phase. This reference is also the **single
> owner** of the shared panel run-shape (resolve → dispatch → consolidate →
> adjudicate → stop) used by the Plan and Spec design panels, which link here
> rather than restating it. `SKILL.md` owns the kernel and phase sequence. Paths
> are skill-relative. Every configuration-dependent branch is an explicit **under
> your configuration** callout routed to the effective shape (current
> `.pi/sdlc/CONFIG.md`, or authoritative `sdlc.config.json` when absent/stale).

## 1. Purpose and invocation modes

PR review runs the panel against the finished branch and drives the diff to a
clean opening. It runs two ways:

- **Full lifecycle:** the final phase, after Implement.
- **Standalone entrypoint `sdlc:pr-review`** (`templates/sdlc-pr-review.md`):
  needs no committed upstream (the diff is self-contained). Unadopted it applies a
  small fixed panel default and offers an **optional, skippable grounding prompt**
  for existing design material, disclosing grounded-vs-diff-only; adopted it runs
  the committed `pr_review` gate at the committed mode/floors, never below them.

## 2. Entry conditions and authoritative upstream inputs

The authoritative input is the final committed branch diff. On the irreversible
track the linked governing docs (plan, Specification, Build plan) ground the
panel; on the reversible track the plan and Build plan ground it and a
Specification must not be demanded.

## 3. Configured before-hook order and blocking semantics

Fire `hooks.pr.before` (and `hooks."*"`) first: `*` items first, then
phase-specific. A failed or skipped `before` hook **blocks** the phase. Full
contract in `references/system-reference.md`, "Hooks".

## 4. Required activity and artifact/output shape — the PR body and cycle

Prepare the PR body from `.github/pull_request_template.md`: declare the track and
slug, link governing documents per track — irreversible: plan, Specification,
Build plan; reversible: plan and Build plan, never a Specification; none: a reason
— and, for a tracker-backed Build, list the epic, every task sub-issue, and the
shared board. Add `Closes #<task-issue>` for each task completed by merging the
PR; use the explicit no-tracker exemption for a below-threshold (per
`shape.publishToTracker`) or `track: none` change. The PR body describes the
change for its audience; it does not carry the local panel's development findings.
It **does** carry an **"Assumptions & discretionary calls"** section
(provisioned by the PR template, empty-allowed): the assumptions accrued during
Implement, copied from the build-plan doc's appendix
(`references/phase-implement.md`). That section is **input to** the PR panel —
named review material for the judgement pass — never a channel for panel
findings; the no-development-findings rule above is unchanged.

Every PR declares its track in the template's `sdlc` declaration block
(provisioned by setup). The `check-lifecycle` script verifies the declared track's
artifacts are committed: run it locally before opening the PR; in CI it runs
wherever the repository has configured the shipped workflow or the documented
snippet. The declaration values are `irreversible`, `reversible`, or `none`;
lifecycle tracks require a slug, and `none` requires a reason. Auto-generated
`[bot]` PRs without a valid declaration are exempt; a valid present declaration
always dominates. Before opening the PR, run the local lifecycle checker from the
installed skill path:

```bash
node <skill-dir>/scripts/check-lifecycle.mjs --body pr-body.md --repo-root .
```

`track: none` is an exemption declaration, not a third lifecycle track; it
requires a reason and its honesty remains PR-panel prose law. CI enforcement is
conditional on the repository configuring the shipped workflow or snippet.

## 5. Invariant gate/approval seam — the panel run-shape

Each design panel (Plan, Spec) and the PR panel run the **same shape**. The four
phase reviewer prompts are the single sources of truth in `prompts/`; never
hand-copy a prompt per model.

1. **Resolve the panel** for the phase (live, deduped, author-excluded):

   ```bash
   scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate> --author <provider/model>
   ```

   It reads the merged config's `panels` block, keeps models with credentials, and
   applies the configured phase floor and author-exclusion rule under the config's
   shortfall posture. Add `--pong` for a live smoke test (costs a call per
   candidate; off by default). When `resolve-panel` prints a `proceed`-mode
   shortfall advisory, carry it into that phase's consolidated writeup and, at PR
   phase, into the PR itself as a comment or adjudication note. Do not commit a
   standalone decision log for the shortfall.

   > **Under your configuration:** the per-phase floor is `review.panelSize` or a
   > `panels.phases.<phase>.panelSize` override, and shortfall handling is
   > `review.onShortfall` (`fail` = hard-fail below the floor; `proceed` =
   > best-effort and surface it). Read the effective values from current
   > `CONFIG.md` (or authoritative `sdlc.config.json`); never assume a floor.

2. **Dispatch** the phase template across the resolved models. Two paths:
   - in-harness (default in a live pi session): stamp the phase's project prompt
     into ONE model-agnostic, project-scoped agent, then dispatch it once per
     resolved model via the `subagent` tool's per-task `model` override (one agent
     reused across the panel, not one file per model):

     ```bash
     scripts/ensure-panel-agent.sh pr_review   # writes .pi/agents/<prefix>-pr-review.md
     scripts/resolve-panel.sh pr_review --author <provider/model> --emit-tasks <prefix>-pr-review
     ```

     `--emit-tasks` prints a ready-to-paste `subagent` `tasks: [...]` array. Replace
     its task value with the exact review task: name the artifact paths, commit,
     governing documents, grounding rule, and required findings-only output. Dispatch
     the populated array with `async: true` (`subagent({ tasks: [...], async: true })`),
     not as a blocking call: a blocking multi-model dispatch only returns control after
     every reviewer finishes, so a reviewer that crashes in the first second still sits
     unactioned until the slowest sibling completes minutes later. Async dispatch
     returns immediately with one run id/`asyncDir` covering every child in the panel.
     Per-model attribution comes back on each task's `result.model` once you read it.
     `ensure-panel-agent.sh` copies the prompt body verbatim and writes to the
     consumer repo's `.pi/agents` where the session resolves project agents (NOT a
     `cd`-ed cwd). Consult the project's governing documents (for example
     `AGENTS.md`) for any local sub-agent gotchas.
   - detached (headless/cron/CI, no live tool): `dispatch-subagents`'s `dispatch.sh`
     stamps one prompt file across `--model` flags.

   Give each reviewer the exact inputs: the artifact under review, the upstream
   artifacts it must be consistent with, the repo path and commit, the PR body's
   "Assumptions & discretionary calls" section as named review material, and the
   grounding rule (cite `file:line` for any framework claim). For `pr_review`,
   populate the prompt's `<TRACK>` from the PR declaration and `<GOVERNING_DOCS>`
   from the linked documents before dispatch; never send literal placeholders. On
   the reversible track, provide the plan and Build plan only and explicitly state
   that a Specification must not be demanded.

   **Before you fan out** (either path): confirm the `subagent` tool is actually in
   your toolset. If it is missing in a live pi session, the fix is a session reload
   (the plugin registers tools at session start), NOT a switch to the detached path
   or a claim that you are outside pi. For a read-only research fan-out inside a
   worktree, dispatch the project `researcher-readonly` agent (no `write` tool,
   returns the brief inline) so children never block on a forbidden write. For
   such research fan-outs — not panel dispatch, which follows the per-child
   polling rule below — prefer `wait({ all: true })` over status-polling, and
   read a child's transcript before treating a "detached" status label as lost
   output.

   **React per-child, not per-batch.** Once dispatched async, poll
   `subagent({ action: "status", id: <asyncId> })` (not a bare `wait` with no
   timeout, which only unblocks once every child in that run finishes) at a
   short interval; a `wait({ id: <asyncId>, timeoutMs: 20000 })` call doubles as
   that interval's sleep, since a timeout returns control without stopping the
   run. Diff each poll's per-child
   status against the last one: the moment any child shows an infra failure (see
   below) rather than a verdict, act on it immediately — do not wait for the other
   panelists still running. A replacement dispatch for that model is a brand-new,
   separate async `subagent` single-agent call, not folded back into the original
   `tasks:` array, so it runs alongside whichever siblings from the first batch are
   still going. Keep polling until every original child and every replacement is
   accounted for.

   **Reviewer dispatch recovery.** The resolved `prefer` list is an ordered
   candidate pool, not merely documentation. A reviewer that returns a model
   verdict (findings, `PASS`, or `REVISE`) has completed its assignment and is
   never silently replaced. A reviewer that fails before producing a verdict —
   including crash, OOM, overload/billing exhaustion, timeout, transport/tool
   failure, or empty output — is an infra failure: retry that model once when the
   failure may be transient, then replace it with the next untried, credentialed
   model in that phase's configured `prefer` list. Do not count a failed model
   against the configured panel floor. Continue through the ordered candidate
   pool until the panel floor is met or the pool is exhausted. Only then apply
   `review.onShortfall`: `fail` stops and asks the human; `proceed` records the
   shortfall and continues. Never substitute an unconfigured model or treat an
   infra failure as a reviewer verdict.

   **Harvest-at-dispatch (FS13).** Immediately after dispatching any design or PR
   panel, record `panel.dispatched` and preserve the panel's artifacts with
   `scripts/harvest-panel.sh --phase <panelPhase> --round <n> --from <asyncDir>`,
   then `panel.consolidated` after adjudication — see
   `references/system-reference.md` ("Lifecycle telemetry") for the event map.
   An async dispatch's harvest is a point-in-time copy: **re-run the same
   harvest once every child has reached a terminal state** so the preserved
   artifacts carry final results, and harvest each replacement dispatch's own
   `asyncDir` too rather than letting it vanish from the run store. `--round`
   is a positive-integer destination label, not only a fix-wave counter: a
   replacement dispatch takes its **own round number** — reusing the
   original's would overwrite that snapshot. The telemetry events keep the
   **logical wave number** regardless (a replacement's `panel.dispatched`
   carries its original wave's round; see `references/system-reference.md`,
   "Lifecycle telemetry"); only the harvest label advances, and the
   label↔wave mapping is recorded in the wave's `consolidated.md`.

3. **Consolidate**: collapse duplicates into one issue, keep cross-model agreement
   as signal, preserve genuine disagreement.
4. **Adjudicate**: for every high or medium finding, either incorporate it or
   record a one-line reason for dismissal. Disclose the orchestrating model in the
   consolidated file. Disputed high or medium findings are decided by the project's
   human owner, who is the final adjudicator. Reviewer output is roughly eighty per
   cent right and overreaches, so nothing is actioned blindly and nothing is
   dismissed silently.

   Escalate disputes to the human per the shared contract
   (`references/system-reference.md`, "Presenting questions to the human") with
   the PR delta: escalations reach the human **once per fix wave, after
   consolidation, never streamed as reviewers return**, and arrive
   **pre-adjudicated** as ratify/amend decisions — each escalated finding
   carries its id, a one-line gist, the reviewers who raised it (cross-model
   agreement is signal), and the agent's recommended disposition with its
   reason. Only **proposed dismissals of high or medium findings** — plus
   anything touching a previously human-ratified residual-risk boundary —
   escalate; incorporating a finding is agreement and needs no permission.
   Overflow past the cap usually means incorporate the cheap ones rather than
   argue them. A **human-ratified dismissal binds forward**: record it in
   `consolidated.md` with its human-ratified attribution and do not re-litigate
   the same finding class in later waves or later sessions unless new evidence
   emerges. The cross-session half of that rule needs a lookup, not memory:
   **before adjudicating, search prior consolidated files under the configured
   reviews home** (e.g. grep `<paths.reviews>/pr-*/consolidated.md` for
   `ratif` — the broad stem, because records predating this attribution
   convention word ratification differently) and treat any hit on the same
   finding class as already adjudicated unless new evidence has emerged.
5. **Stop** when no high or medium finding survives adjudication. Low findings are
   recorded, not blocking. Termination is measured against surviving findings, so a
   ruthless panel that always emits nits still converges.

Save panel artifacts under `<configured paths.reviews>/<phase>-<feat>-<date>/`: one
file per model, the shared `prompt.md`, and a `consolidated.md` carrying the
adjudication and the orchestrating model.

> **Under your configuration:** whether a Plan panel and a Spec panel run at all
> depends on the effective track and `review.design`; the PR panel runs on both
> tracks. `review.code` (`panel` | `advisory` | `human` | `off`) sets the PR gate
> strength. Read them; never assume `panel`.

Run the local PR panel against the final committed branch, consolidate and
adjudicate its findings in the durable internal review artifact under
`docs/reviews/`, and repeat after each fix wave until no high or medium survives.
This is the pre-PR sense check that the branch is a finished artefact; retain the
artifact for future analysis, but do not add development findings to the PR body
or post them as GitHub review comments.

## 6. Refusal and backward-transition behaviour

Merging with a high or medium finding that survived adjudication is forbidden.
Backward transition to any earlier phase is always allowed when the panel exposes
a design flaw. Only after the panel is clean, open the PR with the clean body.

## 7. After-hook order and warning semantics

Fire `hooks.pr.after` (and `hooks."*"`) after the PR opens: phase-specific first,
then `*`. A failed `after` hook **warns** (recorded, never blocking).

## 8. Completion evidence and next transition

Completion evidence is a clean panel (no surviving high/medium), a passing
`check-lifecycle`, and the opened PR with its clean body. **Completion is
machine-checked, not narrated.** After the PR exists, do not state that the
Implement/PR phase is "complete" or "PASS" without first running:

```bash
node <skill-dir>/scripts/check-completion.mjs --claim pr-open --slug <slug> --closes <n> [--closes <n> ...]
```

This checks the pushed branch, open PR, matching valid declaration, and GitHub's
native closing-issue references. After merge, do not state that the tracked
effort is finished without running:

```bash
node <skill-dir>/scripts/check-completion.mjs --claim epic-done --epic <epic-number> --pr <pr-number>
```

This checks every native epic sub-issue is closed and that the named merged PR
closes all of them. Either check failing means the claim is false; state what's
missing instead of declaring done. If a GitHub reviewer
raises a new concern after opening, focus it with an inline comment, address it
with a commit, reply with that commit's short SHA, and rerun the panel and the
`pr-open` check before updating the PR. The post-PR review is for new reviewer
concerns, not a transcript of the local sense check. The lifecycle completes on
merge.

## 9. Advanced-mode pointers

Gate artefacts may be rendered to a self-contained interactive HTML view with the
global `sdlc-visual-docs` skill — a pointer, not a dependency (see
`references/system-reference.md`, "Advanced modes").
