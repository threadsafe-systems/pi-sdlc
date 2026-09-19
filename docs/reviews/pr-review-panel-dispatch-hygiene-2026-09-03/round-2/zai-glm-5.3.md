# Round 2 delta review — zai/glm-5.3

Delta: `ecd0cf44..8999315`. Method: every empirical claim below was re-derived
against the artifact it cites (installed pi-subagents 0.65.1 source, `resolve-panel.mjs`,
live `pi --list-models`, `npm test`, GitHub API), not accepted from prose.

## JOB 1 — round-1 incorporation check (13 Incorporated rows)

- **PR-R1-01** — LANDED. The recipe now uses `workflowScript` + `runs.all` + run-level
  `timeoutMs`; I ran the tool's own static validator (`validateWorkflowScript`) on the
  recipe as written: `ok: true`. `wait` → `bg_wait` fixed in all three places. Per-child
  `model` (incl. `:xhigh` suffix) and `output` are honored; run-level `timeoutMs` becomes
  `deadlineAt` bounding the whole wave. Two riders: findings 4 and 8 below.
- **PR-R1-02** — LANDED. Factor (double), once-only, and aggregate ceiling all present.
  The ceiling itself is incoherent with the ladder: finding 2.
- **PR-R1-03** — LANDED. Rewritten claim matches `resolve-panel.mjs`: `hasCreds` runs
  before the identity dedupe, so an uncredentialed direct route promotes the twin.
- **PR-R1-04** — LANDED. Calibration restated truthfully (55 files, 2 of 3 exhausted,
  third failed on credentials); 45-min floor and size trigger explicitly marked
  untested interpolation.
- **PR-R1-05** — LANDED. Probe claims removed; replaced by the honest "catalogue
  presence proves neither" note. See finding 11 for the DoD's replacement claim.
- **PR-R1-06** — LANDED (stall carve-out added). The carve-out's discriminator is
  wrong: finding 3.
- **PR-R1-07** — LANDED. Verified `dispatch.sh` has no timeout option; external
  bounding + kill-as-timeout now stated.
- **PR-R1-08** — LANDED. Code-verified: `resolve-panel.mjs:82-83` fails without
  `--track` when overrides exist; doc explains exactly that.
- **PR-R1-11** — LANDED. "No entry re-ranked; index not claimed" is true against the
  config diff for all four pools.
- **PR-R1-12** — LANDED. `timeout` removed from the transient-retry enumeration;
  exclusion sentence added.
- **PR-R1-13** — LANDED (implement-side timeout exception). Half-aligned only: finding 6.
- **PR-R1-14** — LANDED. Comment trimmed to durable facts — but one of those "durable
  facts" is false: finding 5.
- **PR-R1-15** — LANDED. PR #274 title is now conventional and `commit-lint` is green
  (verified live).

Escalated rows: PR-R1-09's remedy was partly executed and the restated A4 contains a
new false claim (finding 1); PR-R1-10 remains undispositioned on the branch (finding 7).

## Findings

### 1. The "corrected" A4 introduces a new false claim: #268/#270 ARE on the project board

- severity: medium
- confidence: high
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 163-167 (A4), 170-173 (Tracker)
- problem: A4's rewrite asserts "both carry no labels and neither appears on the project
  board". Labels: true (both `labels: []`). Board: false — GitHub's projectV2 number 5
  ("pi-sdlc Build Board", the repo's only project) contains #268 (item created
  2026-08-18T10:19:55Z) and #270 (2026-08-18T10:20:00Z), i.e. they were on the board
  before round 1, before the fix wave, and at HEAD. The original A4 claim was therefore
  half true (board: yes, labels: no); the correction flipped the true half to false.
- repro_or_impact: `gh api graphql` for project 5 items shows both issues present since
  Aug 18. The passage exists solely to state only true things after round 1 falsified
  five claims; it ships a sixth. It also inverts the escalation's substance: the
  "existing projection" half of A4's original argument actually holds, so the owner is
  being asked to ratify a deviation premised on a misdiagnosis.
- suggested fix: Correct A4 and the Tracker section to "both are unlabelled but both
  sit on the shared board (project 5, since 2026-08-18); only the labelling half of the
  original claim was false", and restate the escalation on that basis.

### 2. The 4× gate ceiling collides arithmetically with the recovery ladder it bounds

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 235-241
- problem: "Cap total panel time at four times the wave's opening budget" is a reactive
  tripwire, and the ladder it bounds mandates sequences that cannot fit inside it. With
  opening budget B: wave times out at B; the doubled wave (mandated "once") runs 2B,
  ending at 3B; a reviewer that "timed out again at the raised budget" must be replaced,
  and any replacement dispatched at t=3B with a budget ≥ B ends at ≥ 4B — at the
  ladder's own raised budget (2B) it ends at 5B, 25 % past the cap. If that replacement
  times out, the per-child rung mandates another 2B. "Total panel time" is also
  undefined (elapsed wall-clock vs summed child time — under the summed reading the
  doubled wave alone is 3×2B = 6B against a 4B cap), and "on reaching the cap, stop
  dispatching" gives no rule for the attempt already in flight (kill it? let it run
  past the cap?) nor a pre-dispatch check ("never dispatch an attempt that cannot
  finish inside the cap"). "The wave's opening budget" is itself ambiguous (gate's
  first wave vs current wave — under the latter reading the cap is 8B and nearly
  unreachable, i.e. decorative).
- repro_or_impact: A large diff against this repo's 9-entry pool produces exactly this
  sequence; an operator following §5 to the letter either violates the cap or must
  improvise semantics the text doesn't give. Round 1 demanded an aggregate ceiling
  (PR-R1-02); the delivered ceiling doesn't compose with the doubling rules two
  paragraphs above it.
- suggested fix: Define the measure (elapsed since first dispatch of the gate,
  consolidation gaps excluded), state it as a pre-dispatch feasibility check
  (remaining-cap < candidate budget ⇒ don't dispatch; go to shortfall), and say what
  happens to in-flight children at cap time.

### 3. The zero-output stall carve-out keys on a signal that also describes every budget-exhausted reviewer

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 229-233
- problem: "A child that produced no output at all may have stalled" — a reviewer that
  read the diff for 44 minutes and was killed at the 45-minute deadline also produced
  no output at all, yet its failure is deterministic budget exhaustion, not a stall.
  As worded, the rule routes exactly the case the doubling rule exists for (verdict-less
  exhaustion) into the route-twin path at the same budget, where it deterministically
  times out again — the futile move §5 itself warns against — after burning wall-clock
  against the finding-2 cap. The decidable evidence exists at decision time (terminal
  result rows carry `usage`/turns only when nonzero; the transcript shows turn count),
  but the rule names the wrong field. On the detached path (external kill, finding
  PR-R1-07's remedy) there is no output channel at all, so the discriminator is
  unobservable there as written.
- repro_or_impact: 55-file diff, 45-min wave budget, reviewer killed mid-analysis with
  an empty final message: operator classifies "provider-side", tries the twin at 45 min,
  twin times out identically, ladder re-enters at the timeout rung having spent 90 min.
- suggested fix: Key the carve-out on "no evidence of progress" — zero reported
  usage/turns in the terminal result or transcript — not "no output"; and note that the
  detached path must capture per-child transcripts to apply it at all.

### 4. "The subagent tool's 30-minute default" is false for the dispatch shape §5 now prescribes

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 188-191 (claim), 127 (recipe it accompanies)
- problem: pi-subagents 0.65.1 (installed here; no global `timeoutMs` configured):
  "Foreground and single async runs use config timeoutMs, else 30m; **async composites
  have no default parent deadline**". §5's wave dispatch is an async composite
  (`workflowScript`), so silence inherits NO deadline — unbounded — not a 30-minute cap.
  The sentence "the subagent tool's 30-minute default is never inherited by silence" is
  thus untrue for every wave dispatch made with the recipe four sections above it, and
  it understates the hazard (unbounded run, not a 30-min one). phase-implement.md:241-242
  makes the same claim for worker dispatches, where it holds only for single/foreground
  runs, not workflow-dispatched ones.
- repro_or_impact: An operator who relies on the stated fallback and omits `timeoutMs`
  on a wave gets a run that never self-terminates — precisely the class of accident the
  paragraph exists to prevent, with the wrong failure mode named.
- suggested fix: State both defaults: single/foreground silence → 30 min; composite
  async silence → unbounded. The explicit-`timeoutMs` advice stands.

### 5. The haiku "route twin" does not identity-fold; the config's universal fold claim is false for it

- severity: medium
- confidence: high
- origin: NEW
- file: .pi/sdlc/sdlc.config.json
- line: 46 ($comment), 71-74 (task_validate prefer)
- problem: `modelIdentity("amazon-bedrock/eu.anthropic.claude-haiku-4-5-20251001-v1:0")`
  returns `anthropic/claude-haiku-4-5-20251001-v1:0` (the Bedrock inference-profile id
  carries a `-v1:0` version qualifier the direct id lacks), which does NOT equal the
  direct entry's identity `anthropic/claude-haiku-4-5-20251001`. The $comment's general
  claim — "modelIdentity() folds a Bedrock alias onto its direct vendor/model, so two
  routes to one model count once toward the floor" — is true for the opus pair but false
  for the haiku pair this same delta added to task_validate. The plan's "task_validate
  gains a route twin" (2026-09-03-panel-dispatch-hygiene.md:208) repeats it.
- repro_or_impact: Raise task_validate's panelSize to 2 (or copy the pattern into a
  bigger pool): resolver selects both routes as "distinct" models, silently satisfying
  the distinct-model floor with one model on two routes — the exact invariant the
  comment claims is protected. Durable config prose falsified by the config's own
  roster, the same failure mode round 1 documented five times.
- suggested fix: Either scope the fold claim to exact-id matches after the vendor
  segment ("folds only when the post-vendor id is identical — versioned inference-profile
  ids like `-v1:0` do not fold"), or normalize version qualifiers in `modelIdentity`
  (out of scope here — #141 owns the resolver).

### 6. phase-implement.md was aligned on the deterministic timeout but not on the stall carve-out it now contradicts

- severity: medium
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-implement.md
- line: 251-259
- problem: The delta edited this file specifically to align timeout doctrine with §5
  (timeout excluded from same-budget retry; retry once at double). But §5's new
  zero-output carve-out (a stall is not exhaustion; doubling buys a longer stall) was
  not propagated: implement doctrine now says unconditionally "A timeout is the
  exception: … retry it once at double the budget instead of unchanged". For a worker
  that stalled with zero output, that mandates the exact move §5 just declared futile.
- repro_or_impact: A provider-stalled implement worker gets a doubled budget and stalls
  longer, consuming the parent's attention window; the two references give opposite
  remedies for the same event, and §5 is the declared single owner of dispatch-shape
  doctrine that other references link to.
- suggested fix: Add the one-sentence carve-out to phase-implement.md (zero-progress
  timeout → treat as infra/provider failure, not a doubled retry).

### 7. Escalated PR-R1-10 is still undispositioned: no task-validation receipts for T1/T2 on the branch

- severity: medium
- confidence: high
- origin: NEW (carry-landing check)
- file: docs/plans/2026-09-03-panel-dispatch-hygiene-build.md
- line: 124 (the discharged row covers only the T2-reading carry)
- problem: `review.tasks: "subagent"` is the committed control. The consolidated
  escalation recommended running `task_validate` for T1 and T2 and committing the
  receipts before the gate passes. The delta commits none: `docs/validation/` has no
  panel-dispatch-hygiene artifacts, and the only PV1 manifests (t1/t2/t3.json) belong
  to the 2026-07-24 feature. No owner decision ratifying the waiver is recorded either;
  the build plan records an escalation only for A4.
- repro_or_impact: The gate is presenting at round 2 with a configured control waived
  and neither of the two closures (receipts or recorded owner ratification) present.
- suggested fix: Run task_validate for T1/T2 and commit the receipts, or record the
  owner's explicit ratification in the build plan before the gate passes.

### 8. The recipe's per-child relative `output` lands under managed artifacts, not the reviews dir

- severity: low
- confidence: high
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 130-134
- problem: `output: "<reviews dir>/sol.md"` filled with a repo-relative path is routed
  by `resolveSingleOutputPath` under the run's artifacts dir
  (`artifacts/outputs/<runId>/…`), not the literal path; only absolute paths pass
  through. The result reports an `outputPathMapping` note, but §5's artifact rule
  ("save panel artifacts under `<paths.reviews>/…`, one file per model") points the
  operator at the repo path.
- repro_or_impact: An operator following the recipe verbatim with a relative path
  finds no `sol.md` in the reviews dir and must dig the mapping out of the run result.
- suggested fix: One clause in the recipe: "use an absolute output path (or harvest
  from `asyncDir`); relative child outputs are routed under the run's artifacts dir".

### 9. Provider-side failures lost the same-budget transient retry on twin-less pools

- severity: low
- confidence: medium
- origin: NEW
- file: skills/sdlc/references/phase-pr-review.md
- line: 204-213
- problem: "A provider-side failure takes the route twin" excludes 429/5xx/transport
  from the same-budget retry entirely. pr_review has a twin; plan_review and
  spec_review pools have none, so a transient 429 on a design panel now burns a pool
  slot (model diversity) with no same-route retry. This goes beyond what PR-R1-06
  demanded (don't double the budget on stalls).
- repro_or_impact: One blip during a plan panel costs a panelist where a 60-second
  retry previously recovered it.
- suggested fix: Keep one same-budget retry for provider-side failures when the pool
  declares no twin; go straight to the twin when it does.

### 10. The committed round-1 artifact set omits the shared prompt.md §5 requires

- severity: low
- confidence: high
- origin: NEW
- file: docs/reviews/pr-review-panel-dispatch-hygiene-2026-09-03/
- line: n/a (directory)
- problem: §5's artifact shape is "one file per model, the shared `prompt.md`, and a
  `consolidated.md`". The committed set has the three reviewer files and consolidated.md;
  no prompt.md exists in the tree (working tree is clean).
- repro_or_impact: The gate's own record doesn't meet its own artifact contract, and
  the retro collector loses the dispatched prompt for this run.
- suggested fix: Commit the round-1 prompt.md alongside the reviewer files.

### 11. The plan's DoD now claims a universal subagent-child probe for which no receipt exists

- severity: low
- confidence: medium
- origin: NEW
- file: docs/plans/2026-09-03-panel-dispatch-hygiene.md
- line: 186-190
- problem: The rewritten DoD claims every configured id "answers a probe dispatched as
  a subagent child". The only probe evidence on record (#275, commit 35d3edd's message)
  predates the new ids (`zai/glm-5.3-flash`, the dated haiku, the Bedrock haiku twin
  were not configured at probe time), and no receipt for a post-replacement probe is
  committed. I ran CLI-path probes of all three new ids (all PONG) — but #275 itself
  documents that the CLI path is not the child path.
- repro_or_impact: This is the same claim class round 1 falsified (PR-R1-05:
  "every id answered by a live probe" was 4 of 25). An affirmative universal claim with
  no committed receipt cannot be re-derived by a future reader.
- suggested fix: Commit the probe receipt (ids, dates, dispatch-path method) under
  docs/validation/, or weaken the DoD to what is receipted.

## Proportionality

No finding. The delta is sized to its findings: four commits, prose corrections plus a
roster swap; both new §5 rules trace to round-1 findings (PR-R1-02, PR-R1-06) rather
than inventing scope. The test retarget is a net strengthening (the semantic anchor is
preserved and `runs.all([` / `timeoutMs` assertions added); the suite is 616/616 green
under a canonical `TMPDIR`, which I re-ran, confirming the corrected A6/DoD claim.

VERDICT: REVISE
