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

Reviewers (harvest label `pr_review-round2`): the same three models. Fable
confirmed each round-1 fix line by line; the table records two round-1
findings reopened (PR-R2-01, PR-R2-04). Round-2 reviewer output cites round-1 findings by
the ids `OT-R1-nn`, which map one-to-one to `PR-R1-nn` above.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R2-01 | high | REOPENED(PR-R1-01) | fail-open safety gap | `root.resolve` also fails when `git` cannot run and the manifest is absent from the working tree, so an adopted repository (manifest in `HEAD`, deleted on disk) can still reach the silent branch. Reproduced by fable and sol. | fable (medium), sol (high) | **escalated** — put to the owner with three options; the owner chose A: keep the `root.resolve` carve-out, have the kernel run `sdlc-status` without `--repo-root`, and record the two-fault case as a known risk in the Plan amendment and ADR 0030. Closing it needs a change to the frozen `sdlc-status`/`lib.mjs` and is out of scope. The test that ran with the manifest on disk is renamed to say so. |
| PR-R2-02 | low | NEW | self-contradicting law | The exit-2 bullet carves out `root.resolve`, then ends "an error is never a reason to continue outside the lifecycle". | fable | **incorporated** — now "any other error is never a reason…", pinned by the focused test and `docs.test.js`. |
| PR-R2-03 | low | NEW | unconstrained invocation | The README's non-git promise holds only when `sdlc-status` runs without `--repo-root`, but the kernel allowed either form. | fable | **incorporated** — kernel step 1 now runs `sdlc-status` from the working directory without `--repo-root`; the focused test pins it. |
| PR-R2-04 | low | REOPENED(PR-R1-08) | inaccurate audit record | Ledger S06 stayed `retained`, though exit 2 no longer always stops. | sol, luna | **incorporated** — S06 is `replaced`, citing ADR 0030. |
| PR-R2-05 | low | NEW | process provenance in governing doc | The Plan amendment cited "PR panel round 1". | sol | **incorporated** — removed; the behavioural reason stands on its own. |

No finding was dismissed. Round 3 receives only this fix-wave delta.

## Round 3

Delta: `f2d2860..c8c5a60`

Reviewers (harvest label `pr_review-round3`): the same three models. Fable
confirmed PR-R2-01..05 as landed; luna returned no findings.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R3-01 | medium | NEW | fail-open safety gap | Forbidding `--repo-root` in the kernel strands a monorepo-subdirectory consumer: from the git top-level, `sdlc-status` finds no manifest and reports `not-adopted`, which the kernel handles silently. Reproduced. | fable | **escalated** — the owner chose to fix `sdlc-status` in this PR (Plan rev 4, class (a)). Incorporated in `96f755c`: the kernel accepts `--repo-root` again. |
| PR-R3-02 | medium | NEW | fail-open safety gap | The recorded two-fault risk understates its trigger: `root.resolve` fails for any `git rev-parse` failure, including dubious ownership, not only a missing `git`; ADR 0030's Decision contradicts its Consequences. Reproduced. Sol raised the ADR contradiction as REOPENED(PR-R2-01). | fable, sol | **escalated** — same owner decision. Incorporated in `96f755c`: `sdlc-status` reports `not-adopted` only on a filesystem proof that no repository encloses the root; dubious ownership, a missing `git`, a broken `.git` file, a bare repository and `$GIT_DIR` stay `error`, each pinned by a test. The kernel's exit-2 exception and the recorded risk are gone; ADR 0030 is rewritten. |
| PR-R3-03 | low | NEW | overstated mitigation | ADR 0030 and the Plan say CI's `check-lifecycle` still gates adopted repositories' PRs, but that workflow is opt-in. | fable | **incorporated** — both now say "where a repository installs it". |
| PR-R3-04 | low | NEW | unconstrained invocation | `$SDLC_ROOT` is an explicit root the kernel did not neutralise, so a non-git directory would still stop. | fable | **incorporated** — the proof applies to any root; a test covers `$SDLC_ROOT`, `--repo-root .` and an absolute `--repo-root`. |
| PR-R3-05 | low | NEW | self-contradicting law | Step 1's synopsis offered `[--repo-root DIR]` in the sentence that forbade it. | fable | **incorporated** — the prohibition is gone; step 1 accepts `--repo-root`, pinned by the focused test. |
| PR-R3-06 | low | REOPENED(PR-R2-04) | inaccurate audit record | Build A5 said S06 "is re-anchored" after S06 became `replaced`. | fable, sol | **incorporated** — every exit 2 stops again, so S06 is `retained` on its re-anchored phrase and A5 is accurate. |
| PR-R3-07 | low | NEW | inaccurate audit record | The round-2 header said all reviewers confirmed every round-1 fix, while its table records two reopened findings. | fable | **incorporated** — the header now names who confirmed what. |

No finding was dismissed. Round 4 reviews the whole change set, since the
`sdlc-status` change reshapes the PR.

## Round 4

Full review: `origin/main...5f8662d`

Reviewers (harvest label `pr_review-round4`): the same three models. Fable
confirmed PR-R3-01..07 as landed.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R4-01 | high | NEW | fail-open safety gap | `$GIT_WORK_TREE` or `core.worktree` pointing outside the repository moves the resolved root there; the proof checked only the root, so an adopted repository whose manifest was deleted reported `not-adopted`. Reproduced. | luna | **incorporated** — the proof must hold for the working directory as well as the root, and `$GIT_WORK_TREE` or `$GIT_COMMON_DIR` set makes absence unprovable; each case is pinned by a test. |
| PR-R4-02 | medium | NEW | fail-open safety gap | An on-disk manifest in a non-git ancestor wins the FS3 walk over a nested adopted repository whose own manifest was deleted; the proof then held for that ancestor and the report was `not-adopted`. Reproduced. | fable, sol | **incorporated** — same fix: the working directory sits inside the repository, so the result is `error`. Pinned by a test. |
| PR-R4-03 | medium | NEW | fail-open safety gap | A gitdir holding `HEAD` and a `commondir` file (a linked worktree's gitdir) did not look like a git directory, so it was proven absent. Reproduced. | sol | **incorporated** — a HEAD beside `objects/`, `refs/` or `commondir` counts as a git directory. Pinned by a test. |
| PR-R4-04 | medium | NEW | stale caller guidance | README's caller-migration section still said non-git roots exit 2, and `test/docs.test.js` pinned that wording. | fable, sol, luna | **incorporated** — the section and its test fragments now state exit 1 for a root outside git and exit 2 for a repository git cannot use. |
| PR-R4-05 | medium | NEW | unrecorded contract change | ADR 0016 and the FS8 spec fix `git.repository` as error-only with `adoption.manifest-head:fail` the sole not-adopted trigger; ADR 0030 neither amended them nor said why no schema bump. | fable | **incorporated** — ADR 0016 and the spec carry "Amended by ADR 0030" notes; ADR 0030 states why the schema version stays 2; the aggregate comment cites the amendment. |
| PR-R4-06 | low | NEW | inaccurate audit record | The ledger's "Intentionally replaced" section said none were replaced while S05, S10 and S11 are `replaced`. | sol | **incorporated** — the section names the three rows. |
| PR-R4-07 | low | NEW | inaccurate audit record | The Build's decomposition rationale still said "One task" and "Every edit is prose". | sol | **incorporated** — it describes T1 and T2. |
| PR-R4-08 | low | REOPENED(PR-R2-05) | process provenance | The Plan's second amendment cited panel finding ids as its trigger. | fable, sol | **incorporated** — the trigger states the behavioural reason only. |
| PR-R4-09 | low | NEW | inaccurate audit record | An ASD19 test name still called `sdlc-status.mjs` a frozen script. | fable | **incorporated** — renamed. |

No finding was dismissed. Round 5 is a delta review of the fixes.

## Round 5

Delta: `5f8662d..18d6cc4`

Reviewers (harvest label `pr_review-round5`): the same three models. Fable
confirmed PR-R4-01..09 and found no fail-open path after probing empty git
variables, `GIT_CEILING_DIRECTORIES`, case-insensitive `.GIT`, dangling `.git`
symlinks and symlinked working directories. Sol marked PR-R4-05 partial (see
PR-R5-02). Luna returned no findings.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R5-01 | medium | NEW | hollow test | Four root-proof cases ran from the repository checkout, so the new working-directory proof failed first and they no longer tested the root proof; removing the symlink-resolved walk went undetected. | fable | **incorporated** — those cases run from a temp directory; removing the root proof now fails 3 tests and removing the symlink-resolved walk fails 1 (corrected under PR-R6-04). The is-directory guard stays explicit; a file root already fails through `ENOTDIR`, and the "root is a file" case pins that outcome. |
| PR-R5-02 | medium | REOPENED(PR-R4-05) | stale contract summary | The spec, ADR 0016 and the Plan's pre-mortem and Definition of done described the new classification as root-only, omitting the working-directory and environment conditions. The spec note also missed §1.2 and AR4. | sol, fable | **incorporated** — the spec, ADR 0015, 0016 and 0023 notes, system-reference §3 and the Plan state both directories; the spec note lists §1.2 and AR4. |
| PR-R5-03 | low | NEW | unactionable diagnostic | A provably non-git root reached from inside a repository reported the same message as an unusable repository. | fable | **incorporated** — `git.repository` now says the working directory is inside a git repository and suggests `--repo-root` into it; the test asserts the message. |
| PR-R5-04 | low | NEW | misleading test name | The round-4 regression test also covered git environment overrides and a `commondir` gitdir. | sol, fable | **incorporated** — split into two tests named for what each asserts. |
| PR-R5-05 | low | NEW | duplicated code | The `root.resolve` fallback proved the working directory twice, since `attemptedRoot` is always the working directory. | fable | **incorporated** — the redundant call is gone. |

No finding was dismissed.

## Round 6

Delta: `18d6cc4..71fca38`

Reviewers (harvest label `pr_review-round6`): the same three models. Fable
confirmed PR-R5-01..05; sol marked PR-R5-02 and PR-R5-03 partial (PR-R6-02,
PR-R6-03). Luna returned no findings. No finding concerns a fail-open path.

| ID | Severity | Origin | Class | Finding | Raised by | Disposition |
|---|---|---|---|---|---|---|
| PR-R6-01 | medium | NEW | inverted contract wording | The ADR 0015, 0016 and 0023 notes said "when no git repository provably encloses", which reads as absence of proof rather than proof of absence. | fable | **incorporated** — the notes say "when the filesystem proves no git repository encloses", matching the spec. |
| PR-R6-02 | medium | REOPENED(PR-R5-02) | stale contract summary | The Plan's Definition of done omitted the `GIT_DIR`, `GIT_WORK_TREE` and `GIT_COMMON_DIR` condition. | sol | **incorporated** — the Definition of done states the proof, the environment condition, and that any failed proof exits 2. |
| PR-R6-03 | low | REOPENED(PR-R5-03) | overstated diagnostic | The new `git.repository` message said the working directory "is inside a git repository" when the proof had only failed (a broken `.git` file, a dangling symlink). | fable, sol | **incorporated** — the message says the working directory "cannot be proven outside a git repository", and the remediation adds running from the root itself. |
| PR-R6-04 | low | NEW | inaccurate audit record | The PR-R5-01 disposition gave mutation counts of 7 and 3; they counted failure lines, not tests. | fable, sol | **incorporated** — corrected to 3 tests and 1 test, remeasured from the failing-tests summary. |
| PR-R6-05 | low | NEW | stale contract summary | The `sdlc-status.mjs` header and the Build's Surfaces bullet described exit 1 for the root only. | fable | **incorporated** — both name the root and the working directory. |
| PR-R6-06 | low | NEW | duplicated code | The message assertion re-implemented the test file's `check()` helper. | fable | **incorporated** — it uses `check()`. |

No finding was dismissed.

