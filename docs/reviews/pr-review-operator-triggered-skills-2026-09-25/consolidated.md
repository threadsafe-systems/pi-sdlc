# PR review — operator-triggered skills

Track: reversible

## Round 1

Commit: `658879c5a743231b9a74ae0ec2845144bfa1b27f`

Reviewers (harvest label `pr_review-round1`):

- `anthropic/claude-fable-5-1:xhigh`
- `openai-codex/gpt-5.6-sol:xhigh`
- `openai-codex/gpt-5.6-luna:xhigh`

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R1-01 | high | NEW | fail-open safety gap | Handling a `git.repository` exit 2 as exit 1 fails open in an adopted repository: that check also fails when `git` cannot run or an explicit root is wrong. | fable, sol, luna | **incorporated** — only `root.resolve` is carved out; it fails only with no explicit root and neither a manifest nor a git repository enclosing the working directory (`lib.mjs` `inspectRoot`). Kernel, system-reference §3, README, ADR 0030, Plan amendment and Build A7 updated; two behavioural tests run `sdlc-status` in a non-git directory and in this repository with `git` off `PATH`. |
| PR-R1-02 | high | NEW | cross-document contradiction | The `/sdlc-*` templates stop on every exit 2 while claiming to match the kernel, which now carves out exit-2 cases. | fable, sol | **incorporated** via PR-R1-01 — the templates pass `--repo-root .`, so `root.resolve` cannot fail there; their stop-on-exit-2 rule matches the narrowed kernel again. Recorded in Build A7. |
| PR-R1-03 | medium | NEW | vacuous test | The focused test's reverted fixtures aborted on the first positive assertion, so the forbidden-text clauses were never exercised. | fable, sol | **incorporated** — each contract now deletes every required pattern and appends every forbidden sample in turn; removing the forbidden-text check fails 6 tests. |
| PR-R1-04 | medium | NEW | stale cross-reference | ADR 0030 and ADR 0015's amendment note named only the exit-1 branch, although the exit-2 handling also changed. | fable, sol, luna | **incorporated** — both notes name the `root.resolve` exit-2 case. ADR 0015's body stays historical per the Plan; the amendment note routes readers to ADR 0030. |
| PR-R1-05 | medium | NEW | cross-document contradiction | "There is no partial or session-only lifecycle" contradicts the retained `/sdlc-*` unadopted sampling path. | luna | **incorporated** — system-reference §3 and ADR 0030 now state that the standalone commands keep their sampling path because only the operator invokes them. |
| PR-R1-06 | low | NEW | test does not exercise behaviour | The no-git test only regex-matched `SKILL.md`. | luna | **incorporated** — see PR-R1-01's behavioural tests. |
| PR-R1-07 | low | NEW | planned verification missing | The Plan promised README and ADR assertions that did not land. | fable | **incorporated** — the focused test pins the README paragraph and the ADR 0030 cross-references. |
| PR-R1-08 | low | NEW | inaccurate audit record | The disposition ledger re-gisted S05 to post-change behaviour while calling it `retained`. | fable | **incorporated** — S05 is `replaced` with its baseline gist; S06 keeps its baseline gist and a current anchor. |
| PR-R1-09 | low | NEW | inaccurate audit record | Build A5 said "three files" and listed two. | fable | **incorporated** — A5 rewritten to name the two surfaces. |
| PR-R1-10 | low | NEW | duplicate artifact | The task receipt directory carried `report.json` as a duplicate of `runner-report.json`. | fable | **incorporated** — duplicate removed; `validator.md` points at `runner-report.json`; the receipt still verifies. |
| PR-R1-11 | low | NEW | missing consequence | ADR 0030 did not state that an explicit `/skill:sdlc` in an unadopted repository now gets no acknowledgement. | fable | **incorporated** — added to Consequences. |
| PR-R1-12 | low | NEW | overstated verification | The Build plan overstated mutation coverage (the `disable-model-invocation` assertion had no mutant). | sol | **incorporated** via PR-R1-03 — that assertion now runs through the same contract helper. |

No finding was dismissed. Round 2 receives only this fix-wave delta.

## Round 2

Delta: `658879c..f2d2860`

Reviewers (harvest label `pr_review-round2`): the same three models. All
confirmed every round-1 fix. Round-2 reviewer output cites round-1 findings by
the ids `OT-R1-nn`, which map one-to-one to `PR-R1-nn` above.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R2-01 | high | REOPENED(PR-R1-01) | fail-open safety gap | `root.resolve` also fails when `git` cannot run and the manifest is absent from the working tree, so an adopted repository (manifest in `HEAD`, deleted on disk) can still reach the silent branch. Reproduced by fable and sol. | fable (medium), sol (high) | **escalated** — put to the owner with three options; the owner chose A: keep the `root.resolve` carve-out, have the kernel run `sdlc-status` without `--repo-root`, and record the two-fault case as a known risk in the Plan amendment and ADR 0030. Closing it needs a change to the frozen `sdlc-status`/`lib.mjs` and is out of scope. The test that ran with the manifest on disk is renamed to say so. |
| PR-R2-02 | low | NEW | self-contradicting law | The exit-2 bullet carves out `root.resolve`, then ends "an error is never a reason to continue outside the lifecycle". | fable | **incorporated** — now "any other error is never a reason…", pinned by the focused test and `docs.test.js`. |
| PR-R2-03 | low | NEW | unconstrained invocation | The README's non-git promise holds only when `sdlc-status` runs without `--repo-root`, but the kernel allowed either form. | fable | **incorporated** — kernel step 1 now runs `sdlc-status` from the working directory without `--repo-root`; the focused test pins it. |
| PR-R2-04 | low | REOPENED(PR-R1-08) | inaccurate audit record | Ledger S06 stayed `retained`, though exit 2 no longer always stops. | sol, luna | **incorporated** — S06 is `replaced`, citing ADR 0030. |
| PR-R2-05 | low | NEW | process provenance in governing doc | The Plan amendment cited "PR panel round 1". | sol | **incorporated** — removed; the behavioural reason stands on its own. |

No finding was dismissed. Round 3 receives only this fix-wave delta.
