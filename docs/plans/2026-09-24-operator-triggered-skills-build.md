# Build plan — operator-triggered sdlc skills

Plan: [`2026-09-24-operator-triggered-skills.md`](2026-09-24-operator-triggered-skills.md)
Track: **reversible** (no Spec) · Slug: `operator-triggered-skills`

Every task's Definition of Done includes the code-prose pass owned by
`references/phase-implement.md` §4, with the exact handoff
`Code-prose pass: complete`, placed before the task's validator/closure seam.

## Decomposition rationale

One task. Every edit is prose in service of one policy, and the kernel, the
system reference, the README, the ADRs and the tests that pin them must change
together: splitting them would leave an intermediate commit where the docs test
asserts wording that no longer exists. The Plan's pre-mortem destinations
("Build task 1/2/3") all land in T1.

## Dependency graph

```text
T1 (policy prose + tests)  ── independent
```

## Tasks

### T1 — Operator-triggered skills; silent not-adopted branch; no advisory mode

- **Surfaces:**
  - `skills/sdlc/SKILL.md` — `description` frontmatter; a one-line invocation
    rule in the kernel; the exit-1 branch; the exit-2/exit-3 wording and the
    closing paragraph of the readiness section, with advisory mode removed.
  - `skills/sdlc-retro/SKILL.md` — `description` frontmatter.
  - `skills/sdlc/references/system-reference.md` §3 — advisory-mode paragraph
    removed; a sentence stating the not-adopted behaviour.
  - `README.md` — adoption paragraph.
  - `docs/adr/0030-operator-triggered-skills.md` (new); one-line
    "amended by ADR 0030" notes in `docs/adr/0010-opt-in-semantics.md` and
    `docs/adr/0015-adoption-readiness-policy.md`; `docs/adr/README.md` index if
    it lists ADRs.
  - `test/docs.test.js` — startup fragments updated.
  - `test/operator-triggered-skills.test.js` (new) — the focused contract.
  - `test/e2e/scenarios/a.mjs` — scripted reply and assertions.
- **Does:**
  - Both descriptions say the skill loads only on an explicit operator request
    (`/skill:<name>`, a `/sdlc-*` command, or a direct ask), and drop "Use at
    the start of any feature or change" and "This is the project law, not a
    suggestion". Neither gains `disable-model-invocation`.
  - Exit 1 tells the agent: do not announce, do not ask, do not mention
    adoption; set the sdlc aside and continue the task.
  - Exit 2 and exit 3 still stop; the five pre-exit-0 prohibitions stay.
  - Scenario A's scripted reply carries no adoption offer, and its assertion
    forbids `/setup-sdlc` and `advisory` in the transcript.
- **Scenarios owned:** none — reversible track, no Spec.
- **Checks:**
  - `npm test` (`scope: ["full"]`, offline, ~60s).
  - `node --test test/operator-triggered-skills.test.js`
    (`scope: ["task"]`, offline, <2s). Asserts: both descriptions state
    operator-only loading and carry neither the ambient phrase nor
    `disable-model-invocation`; the exit-1 branch forbids asking and mentioning
    adoption and names no `/setup-sdlc`; `SKILL.md` and `system-reference.md`
    contain no `/advisory mode/i`; the README states operator-only loading and
    the silent unadopted path; ADR 0030 exists and is indexed from ADR 0010 and
    0015. Each negative assertion is checked against a fixture that satisfies
    every other assertion and carries only the forbidden text. `sdlc-status`
    runs in a temp non-git directory (expects `root.resolve` error) and in this
    repository with `git` off `PATH` (expects `root.resolve` pass and
    `git.repository` error), pinning the exit-2 carve-out to real behaviour.
  - `npx biome check .` (static, offline, <10s).
  - `node skills/sdlc/scripts/check-references.mjs` (static, offline, <5s).
- **DoD:** every Plan Definition-of-done bullet; `npm run test:e2e` green run
  by hand (see A2); `Code-prose pass: complete`.

## Scenario → task ownership

None. The reversible track runs without a Spec, so no scenario ids exist. The
Plan's Definition of done is the falsifiable list standing in for scenario
coverage.

## Spec gap log

| description | severity | disposition | landing site |
| --- | --- | --- | --- |
| No Spec exists — reversible track — so no scenario ids back T1's checks | minor | assumption-recorded | Assumptions appendix, A1 |
| The e2e suite cannot run under the deterministic runner | minor | assumption-recorded | Assumptions appendix, A2 |

## Assumptions

- **A1 — no scenario ids.** T1 owns no scenarios, so Rule B does not apply;
  Rule A is met by `npm test` tagged `"full"`.
- **A2 — e2e runs by hand and in CI, not in the manifest.** The harness refuses
  to start when a credential variable is in its environment, and the runner
  passes argv with no shell, so `env -i PATH="$PATH" …` cannot be expressed as
  a check. T1 runs `env -i PATH="$PATH" HOME="$HOME" node test/e2e/run.mjs`
  by hand before the PR, and the `e2e` workflow runs it on the PR.
- **A3 — below the tracker threshold.** One task against a committed
  `shape.publishToTracker` of 2, so no epic or sub-issues are minted.
- **A5 — surfaces discovered at Implement.** Two surfaces outside T1's list
  moved with the change. The disposition ledger
  `docs/validation/sdlc-agent-self-documentation/disposition-ledger.md` quoted
  the old exit-1 and exit-2 text: S05 is now `replaced`, S06 is re-anchored,
  and the S10 and S11 advisory rows are `replaced`. `test/skill-kernel.test.js`
  caps `SKILL.md` at 220 lines; the new prose was tightened to fit rather than
  raising the cap.
- **A6 — a YAML hazard in the description.** The first rewrite of the `sdlc`
  description contained `it: sequences`; pi parses frontmatter as YAML, so
  the unquoted `: ` made pi drop the skill and every e2e L2 scenario locked at
  the discovery gate. Fixed in the text, and the focused test now rejects `: `
  in an unquoted description.
- **A7 — exit-2 amendment.** The Plan's in-place amendment lands in T1:
  kernel exit-2 branch, system-reference §3, README, ADR 0030 and ADR 0015's
  amendment note, and focused tests. Only `root.resolve` is carved out;
  `git.repository` still stops, because it also fails when `git` cannot run or
  an explicit root is wrong, which an adopted repository can produce. The
  templates pass `--repo-root .`, so `root.resolve` never fails there and their
  stop-on-exit-2 rule still matches the kernel.
- **A4 — release type.** `feat:`; no config shape changes, so the ADR 0021
  release guard does not apply.

## Tracker

No tracker objects (A3).
