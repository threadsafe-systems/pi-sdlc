# PR review — operator-triggered skills

Track: reversible

## Round 1

Commit: `658879c5a743231b9a74ae0ec2845144bfa1b27f`

Reviewers (harvest label `pr_review-round1`):

- `anthropic/claude-fable-5-1:xhigh`
- `openai-codex/gpt-5.6-sol:xhigh`
- `openai-codex/gpt-5.6-luna:xhigh`

| ID | Severity | Origin | Finding | Raised by | Disposition |
|---|---|---|---|---|---|
| OT-R1-01 | high | NEW | Handling a `git.repository` exit 2 as exit 1 fails open in an adopted repository: that check also fails when `git` cannot run or an explicit root is wrong. | fable, sol, luna | **incorporated** — only `root.resolve` is carved out; it fails only with no explicit root and neither a manifest nor a git repository enclosing the working directory (`lib.mjs` `inspectRoot`). Kernel, system-reference §3, README, ADR 0030, Plan amendment and Build A7 updated; two behavioural tests run `sdlc-status` in a non-git directory and in this repository with `git` off `PATH`. |
| OT-R1-02 | high | NEW | The `/sdlc-*` templates stop on every exit 2 while claiming to match the kernel, which now carves out exit-2 cases. | fable, sol | **incorporated** via OT-R1-01 — the templates pass `--repo-root .`, so `root.resolve` cannot fail there; their stop-on-exit-2 rule matches the narrowed kernel again. Recorded in Build A7. |
| OT-R1-03 | medium | NEW | The focused test's reverted fixtures aborted on the first positive assertion, so the forbidden-text clauses were never exercised. | fable, sol | **incorporated** — each contract now deletes every required pattern and appends every forbidden sample in turn; removing the forbidden-text check fails 6 tests. |
| OT-R1-04 | medium | NEW | ADR 0030 and ADR 0015's amendment note named only the exit-1 branch, although the exit-2 handling also changed. | fable, sol, luna | **incorporated** — both notes name the `root.resolve` exit-2 case. ADR 0015's body stays historical per the Plan; the amendment note routes readers to ADR 0030. |
| OT-R1-05 | medium | NEW | "There is no partial or session-only lifecycle" contradicts the retained `/sdlc-*` unadopted sampling path. | luna | **incorporated** — system-reference §3 and ADR 0030 now state that the standalone commands keep their sampling path because only the operator invokes them. |
| OT-R1-06 | low | NEW | The no-git test only regex-matched `SKILL.md`. | luna | **incorporated** — see OT-R1-01's behavioural tests. |
| OT-R1-07 | low | NEW | The Plan promised README and ADR assertions that did not land. | fable | **incorporated** — the focused test pins the README paragraph and the ADR 0030 cross-references. |
| OT-R1-08 | low | NEW | The disposition ledger re-gisted S05 to post-change behaviour while calling it `retained`. | fable | **incorporated** — S05 is `replaced` with its baseline gist; S06 keeps its baseline gist and a current anchor. |
| OT-R1-09 | low | NEW | Build A5 said "three files" and listed two. | fable | **incorporated** — A5 rewritten to name the two surfaces. |
| OT-R1-10 | low | NEW | The task receipt directory carried `report.json` as a duplicate of `runner-report.json`. | fable | **incorporated** — duplicate removed; `validator.md` points at `runner-report.json`; the receipt still verifies. |
| OT-R1-11 | low | NEW | ADR 0030 did not state that an explicit `/skill:sdlc` in an unadopted repository now gets no acknowledgement. | fable | **incorporated** — added to Consequences. |
| OT-R1-12 | low | NEW | The Build plan overstated mutation coverage (the `disable-model-invocation` assertion had no mutant). | sol | **incorporated** via OT-R1-03 — that assertion now runs through the same contract helper. |

No finding was dismissed. Round 2 receives only this fix-wave delta.
