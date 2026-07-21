# Brief: retro-informed orchestration, wallclock, and DoD-sweep candidates

Status: conjecture / future feature investigation. Not a plan, not a spec —
a map-mode destination, seeded by a real retro rather than by intuition.
Companion to `docs/briefs/2026-07-14-orchestrator-led-automation-intake-contract.md`,
which this brief now has empirical grounding for.

## Where this came from

Neil asked for an sdlc retro of Case's most recent feature run,
`feat/29-capability-collections` (PR threadsafe-systems/case#35, merged
2026-07-21 as `59273b1`), then asked whether four raw observations he'd
been carrying intersect with what the retro turns up. They do, directly.
This brief is that weave, rephrased as candidate outcomes ready to seed a
future brainstorm; it has since grown a fifth (C5, below) and an
independent-review pass (`2026-07-21`, three fresh-context reviewers)
found further corrections and gaps folded in throughout.

### Retro method note (a finding in itself)

`sdlc-retro`'s automated collector (`skills/sdlc-retro/scripts/collect-run.mjs`)
came back empty for this run: **Case has not adopted FS13 lifecycle
telemetry**, so there is no `.pi/sdlc/runs/capability-collections/events.jsonl`
manifest to correlate sessions, panels, or timing against. Per the
collector's own coverage semantics this is an honest `manifest.absent` /
`sessions.none` result, not a bug — but it means every quantitative claim
below is reconstructed by hand from committed artifacts (review directories,
commit log, PR body, build-plan text), not measured. A scratch
`run.json`/`index.html` sit uninstantiated at
`case/.pi/sdlc/runs/capability-collections/` (git-ignored, not committed) as
evidence of the gap, not as a usable retro.

**Correction:** this is not a `sdlc.config.json` gap — FS13 (`record-run-event`,
the `panel.dispatched`/`panel.consolidated`/etc. directives) is agent-executed
prose law baked into the `sdlc` skill itself, not a config-gated hook; there is
no config field for it to wire up. The actual gap was a stale **package pin**:
`~/.pi/agent/settings.json`'s `packages` list carried
`git:github.com/threadsafe-systems/pi-sdlc@v2.0.0`, and FS13 shipped in
**v2.1.0** (PR #104) — confirmed `v2.0.0` is an ancestor of `v2.1.0` in this
repo's history, and no `record-run-event` script or "Lifecycle telemetry"
section existed in the pinned checkout. The capability-collections session
ran entirely against that pre-FS13 copy of the skill, so it could not have
emitted telemetry regardless of what Case's own config said. **Fixed during
this session:** the pin is bumped to `@v2.4.0` (current `main` release, four
minors ahead of the FS13 cut, no breaking changes in between per
`CHANGELOG.md`) and `pi update --extension` re-fetched the checkout —
verified `scripts/record-run-event.{mjs,sh}` and `references/system-reference.md`
§12 are now present locally. The next Case feature run started fresh should
emit real telemetry with zero config changes on Case's side; this should
still be confirmed empirically on that next run rather than assumed.

### What the manual reconstruction shows

- One continuous pi session (`~/.pi/agent/sessions/--home-neil-code-threadsafe-case--`,
  correlated by grep for the slug across two session files spanning
  2026-07-20 09:20–19:38, ~10 hours) carried Brainstorm through Implement
  and all three PR-review cycles. No model or session handover between
  phases; the same author model (`anthropic/claude-opus-4-8:high`) wrote
  Plan, Spec, Build, and every implementation task.
- The build plan (`docs/plans/2026-07-20-capability-collections-build.md`)
  explicitly names an initial parallel frontier — `cc-t1` and `cc-t2` have
  no `blockedBy` — but the task-validation receipts
  (`docs/reviews/task-validate-capability-collections-cc-t{1..5}-2026-07-20/`)
  are timestamped sequentially, ~7–15 minutes apart, one after another:
  16:35 → 16:50 → 16:56 → 17:03 → 17:12. The plan identified the
  parallelisable seam; execution didn't use it.
- `moonshotai/kimi-k3` (the configured third `pr_review` panelist) timed out
  at exactly 1,200,000 ms (20 minutes) in **both** cycle 1 and cycle 2
  (`docs/reviews/pr-capability-collections-2026-07-20/round{1,2}-moonshotai-kimi-k3-timeout.md`),
  each time silently substituted by the next configured preference
  (Bedrock Opus 4.8) to preserve the panel floor. It was excluded from
  cycle 3 only by explicit "owner direction" recorded in the consolidated
  adjudication — a manual, ad hoc intervention, not a mechanism. That's
  ~40 minutes of dead panel wallclock. **Correction (independent review,
  2026-07-21):** the substitution itself was automatic both times —
  `consolidated.md`/`consolidated-cycle2.md` both record the existing
  retry-then-substitute mechanism firing on its own, not a human
  intervening in the moment. The human "owner direction" only *excluded*
  kimi-k3 from the cycle-3 roster afterward, as a standing policy change
  for the rest of the run — it did not trigger either individual
  substitution. The ~40 minutes of dead wallclock stands; the recovery
  mechanism was already working as designed, which sharpens C5's point
  rather than undercutting it: the *substitution* isn't the gap, the
  *lag before it fires* is.
- `AGENTS.md` and `README.md` were updated (34 and 78 lines), but as a
  free-standing `docs(architecture): clarify capability placement` commit
  landing *after* PR-panel clearance (cycle 3) and outside the build plan's
  scenario-ownership ledger (`CC-01`…`CC-21`, all singly owned; no scenario
  covers repo-facing docs). Nothing in Plan, Spec, or Build asked for this
  sweep — it happened because it happened to occur to the agent late, which
  matches Neil's own account of nudging the agent at the end. (This repo has
  no `CHANGELOG.md` to sweep — Case relies on GitHub Releases/semantic-release
  output instead, which is itself a useful negative data point: the checklist
  has to be judged per repo, not applied as a fixed list.)
- One high/medium-class defect in cycle 1 (finding 12: the built image
  registered `conveyancing_search` but lacked the `qmd` binary,
  `spawn qmd ENOENT`) was **self-found by the orchestrator** (Neil), not by
  any of the three PR panelists or any PV1 check. It was an operational
  readiness gap — the kind of thing a deploy/runtime-smoke checklist item
  would have caught structurally rather than by luck.

## The four observations, rephrased against this evidence

### C1 — No mechanism to steer authoring models across phases (orchestrator gap)

Today `panels.phases.*.prefer` (config) governs *review* model selection —
plan/spec/PR panels, task validators — and does it well, with automatic
fallback (see the Kimi substitution above). There is no equivalent for who
*authors* Brainstorm, Plan, Spec, Build, and Implement. In this run, one
model in one uninterrupted session did all of it; every phase transition,
context compaction, and model change Neil wants is currently manual — he
asks for a handover, or clears the session, or names the next model, by
hand, every time.

This is not the same gap `O7` (this repo's own lifecycle-hardening
programme, `docs/plans/2026-07-12-sdlc-lifecycle-hardening.md`) is already
closing: `O7` adds a **static per-phase author preference** (config field),
which is necessary but not sufficient. What's missing is *dynamic*
governance — something that watches phase transitions, decides (or is told)
which model authors the next phase, prepares the handover material a fresh
session/model needs (decision recap, frozen surfaces touched, open
questions), and can course-correct mid-phase. `docs/briefs/2026-07-14-orchestrator-led-automation-intake-contract.md`
already sketches the shape of an orchestrator for the *unattended* case;
this observation asks for the *attended* case first — an orchestrator that
assists a human who is still in the loop, before reaching for the
zero-touch version. Worth noting explicitly: the programme's own scope
currently lists "a general workflow engine, daemon, or event bus" as **Out**
— adopting any orchestrator, attended or not, means deliberately revisiting
that boundary, not quietly extending O7.

### C2 — Implementation orchestration is the acute pain point, separate from C1

Called out on its own because, in Neil's words, it's the major sticking
point: a supervisor that hands well-defined build tasks to implementer
agents, in parallel where the dependency frontier allows it, without Neil
having to wrap Implement in a `/goal` just to get it to actually finish
everything. This run is direct proof of the gap: the build plan *already*
computed a parallel frontier (`cc-t1`/`cc-t2` independent) and it still ran
sequentially, one task at a time, in a single session. The planning layer
knows what's parallelisable; nothing acts on it. Distinguish this from C1
because the smallest viable version doesn't require solving cross-phase
authoring governance at all — it only needs a Build-phase supervisor loop
that reads the dependency frontier it already produces and dispatches
`pi-subagents` (parallel mode already exists, per `SKILL.md`'s
`dispatch-subagents`/`pi-subagents` skills) against the unblocked frontier,
polling each to completion before advancing it. Candidate first slice of C1,
not a prerequisite for it.

**Addendum (2026-07-21, Neil):** add a second pair of eyes on the build
plan itself, before implementation starts on any task. Not a code reviewer —
the build plan doesn't have code yet — a sense-check that (a) nothing in the
approved Specification got dropped or silently reinterpreted while it was
broken into tasks, and (b) the split, sequencing, and dependency frontier
are sound: right-sized deliverables, seams in the right places, sticky
points called out, and the parallelisable set correctly identified (the
capability-collections retro shows this can go wrong quietly — the frontier
was computed correctly but then not acted on, which is exactly the kind of
thing a second reviewer might have flagged before Implement started rather
than after). One independent reviewer is enough here, not a floor-3 panel —
this is a sense-check, not an adversarial design panel. Bonus scope,
explicitly called out by Neil: that reviewer should also recommend, per
task, which model ought to implement it — "know your team," i.e. this
reviewer is also where a per-task author-model suggestion (feeding C1/C2's
dispatch) could originate, rather than being guessed at dispatch time.
This needs a **new `panels.phases` key** — today's schema closes that enum
at `plan_review`/`spec_review`/`pr_review`/`task_validate`
(`skills/sdlc/schema/sdlc.config.schema.json`) — so it's a schema/script
change, out of scope for a config-only session; captured here as a
concrete addition to whichever child stream picks up C2. See
`docs/briefs/2026-07-21-panel-roster-redesign.md` for the same-day panel
roster redesign this addendum was raised alongside.

### C3 — Reviewer wallclock needs a floor/ceiling policy and captured metrics

Kimi-k3 cost ~40 minutes of dead panel time across two cycles before a human
excluded it from the next cycle's roster (the individual substitutions
were automatic both times — see the correction above) — there is currently
no automatic "N timeouts → drop from roster for the rest of this run" rule,
and no captured distribution of per-model review latency to know whether
1,200,000 ms is a reasonable timeout, a chronically-too-short one, or
evidence a given model belongs lower in a `prefer` list. FS13 lifecycle
telemetry (`docs/adr/0028-lifecycle-telemetry-fs13.md`, already shipped:
`lt-t1` merged 2026-07-17) is the right substrate to build the "captured
metrics" half of this ask on. **Correction (independent review,
2026-07-21):** checked directly against `skills/sdlc/scripts/telemetry.mjs`
— the shipped vocabulary is `panel.resolved` / `panel.dispatched` /
`panel.harvested` (carrying a `missed` list) / `panel.consolidated`; there
is no dedicated timeout/infra-failure event, and `panel.dispatched`
carries no per-model duration. It can timestamp *when a round started and
was harvested*, not directly measure an individual reviewer's timeout or
polling cadence — a genuine gap, not just an adoption gap, and one this
programme would need to close before C3's metrics half is actually
buildable. Separately, the gap that blocked Case specifically from getting
any telemetry at all was a stale pre-FS13 package pin (see retro method
note above, now fixed). What's still missing is both the finer-grained
event(s) and a policy layer on top — a poll/check-in cadence for
tightly-bounded tasks, and an automatic timeout-count exclusion rule —
rather than relying on "owner direction" every time.

### C4 — A judicious, domain-aware non-functional/DoD sweep, prompted during planning

`O3` already gives falsifiable, scenario-level traceability for what the
Specification declares — but nothing prompts the *human* during Brainstorm/
Plan to consider the cross-cutting items that keep getting model-guessed or
skipped entirely: repo-facing docs that other agents and humans depend on
(`AGENTS.md`, `README.md`, `CONTRIBUTING.md`, changelog/release notes — where
one exists), and situationally relevant NFR categories (logging/observability,
security, CI/CD, performance, operational/deploy readiness). The
capability-collections run shows both failure modes in one PR: the docs
sweep happened, but late, ad hoc, and outside the scenario ledger; and the
one real operational-readiness defect (missing `qmd` in the built image)
was caught by luck, not by structure. The ask is explicitly **not** a fixed
checklist bolted onto every run — Case has no `CHANGELOG.md` at all, so a
naive "always update CHANGELOG.md" rule would misfire — but a judgement
prompt at Plan time: "given this change's domain, which of [docs a
consumer/agent relies on; logging/observability; security; CI/CD;
performance; deploy/operational readiness] plausibly need a look, and which
don't, and why not."

### C5 — Blocking parallel dispatch is a pernicious, recurring failure mode; async + per-child reaction must be enforced

Added 2026-07-21 (Neil), flagged as its own item because "this is a
pernicious issue" recurring "time and again," not a one-off from the
capability-collections retro. The observed pattern: a panel of 2+ reviewers
is dispatched, one model fails or hangs, and if the dispatch was blocking
(no `async: true`), the whole call cannot return — and therefore the
orchestrator cannot react — until every sibling in the batch finishes, no
matter how fast they were. The fix has to be **enforced**, not just
available: awaited/async dispatch plus active per-child polling, so a
failing or stalled panelist can be replaced immediately rather than only
after the slowest sibling (or the failing model's own timeout) resolves.

**What's already true, checked directly against this repo's own skill
text, not assumed:** this exact protocol is already fully specified —
for panel review only. `skills/sdlc/references/phase-pr-review.md` (§2,
"Dispatch") is explicit and detailed: dispatch with `async: true`, never
blocking ("a blocking multi-model dispatch only returns control after
every reviewer finishes, so a reviewer that crashes in the first second
still sits unactioned until the slowest sibling completes"); then "React
per-child, not per-batch" — poll `subagent({ action: "status", id })` at a
short interval (a `wait({ id, timeoutMs: 20000 })` doubles as the sleep),
diff each poll against the last, and "the moment any child shows an infra
failure rather than a verdict, act on it immediately — do not wait for the
other panelists still running"; a documented "Reviewer dispatch recovery"
rule then retries once on a transient infra failure before substituting
the next untried, credentialed model from that phase's `prefer` list, all
without counting the failure against the panel floor. `phase-plan.md`
explicitly inherits this same shared run-shape for the plan/spec design
panels ("owned by `references/phase-pr-review.md`, 'Panels'") rather than
restating it, so plan_review/spec_review/pr_review all already carry the
same contract on paper.

**Where the real gap is, then:** two places, both checked directly rather
than assumed.

1. **Possible compliance gap on the phases that already have the rule.**
   The capability-collections retro shows kimi-k3 sitting through the full
   1,200,000ms configured timeout in *both* PR-review cycles before being
   substituted — which is consistent with the documented protocol
   eventually working (it *was* substituted, panel floor was met both
   times), but is very hard to distinguish from "the agent just issued one
   long blocking wait" from the committed evidence alone, since neither
   this repo's retro tooling nor Case's (currently un-adopted, see the
   retro brief above) telemetry captures per-poll timestamps — only the
   dispatch and the eventual timeout-and-substitution are recorded. Put
   plainly: we can't yet tell, from durable evidence, whether "act
   immediately" is being honoured in spirit (short-interval polling that
   simply found nothing to react to until the model's own 20-minute
   ceiling fired — in which case the real lever is lowering that ceiling
   or adding an earlier no-progress heuristic, not the dispatch mechanism)
   or is quietly not being followed at all (a single long blocking
   `subagent_wait` masquerading as compliant because the outcome still
   looked correct). This needs a mechanical audit — likely an FS13 event
   addition capturing each poll, not a new prose rule — before concluding
   which one it is.
2. **Confirmed coverage gap on the phases that don't have the rule at
   all.** Checked directly: neither `phase-implement.md` nor
   `system-reference.md` nor `SKILL.md` mention `async: true`, "React
   per-child," or the dispatch-recovery rule anywhere. `task_validate`
   (a single dispatch, not a panel, per `O7`) has no documented
   async/reactive requirement of its own — a hung validator can currently
   block the rest of Implement with no equivalent escape hatch. Build's
   §10 ("Dispatching implementation workers") documents scope/budget/retry
   discipline for a *single* worker dispatch but has no parallel-fan-out
   protocol at all — confirming **C2**'s finding from the other direction:
   there is currently nothing in Build to enforce async on, because Build
   doesn't dispatch parallel implementation workers at all yet. Any C2
   build-supervisor design must bake this same enforced-async-plus-
   per-child-reaction contract in from the start rather than inherit it by
   accident, and `task_validate` should get the same explicit requirement
   regardless of C2's timeline.

## Independent review findings (2026-07-21) — problem areas not yet triaged into C1–C5

Three fresh-context reviewers (one blind retro of the raw case#35 evidence
with no exposure to this brief; one adversarial critique of this brief
against that evidence; one mechanics review of the panel-roster config
change) surfaced further concrete problems in the capability-collections
run itself, beyond what C1–C5 already cover. Unlike the corrections folded
into C3/C5 above, these are net-new findings, not disputes with this
brief's existing claims. Deliberately left un-triaged into C1–C5 or new
candidates — that's the sub-issue-breakdown work Neil is doing separately.

### High

- The entire irreversible-track lifecycle — brainstorm, plan (3 review
  rounds), spec (2 rounds), build plan, all 5 implementation tasks, and 3
  PR-review cycles — ran inside one ~8-hour day (`ab71b19` 11:39 through
  `c2e8f83` 19:38). Zero calendar time existed between any gate for
  reflection on the Plan's own 10-item risk register.
- **7 commits landed on the PR branch *after* cycle-3 clearance
  (`c2e8f83`) and were squash-merged with it, never seen by any panel**:
  `d70603c`, `6ab3dea`, `2ad90c0`, `57256ea`, `2708937`, `04fca4f`,
  `ca8c122` — touching Docker networking, the Honcho integration, a
  Bedrock API token, new shell scripts, and `capability-composer.ts`
  itself. `consolidated-cycle3.md` explicitly scopes its review to
  `342234c`; nothing after that commit was adversarially reviewed before
  merge. This is the single most concrete finding of the whole review —
  worth its own line in any future PR-gate hardening work, not just filed
  under an existing candidate.

### Medium

- Panel diversity was thinner than the raw "floor of 3 met" framing
  suggests: Bedrock Opus 4.8 reviewed all three PR cycles (the one
  constant across every round), and cycles 1–2 had only 2 reviewers
  complete before a same-cycle substitute was dispatched — effectively a
  degraded, not a full, floor-3 panel for most of the run.
- Quota exhaustion wasn't unique to kimi-k3/PR-review: `gpt-5.6-luna`
  hit its usage limit at dispatch in **both** the plan panel and the spec
  panel (`plan-review.../consolidated.md`, `spec-review.../consolidated.md`),
  each time silently substituted. The `prefer` list is aspirational
  under live quota constraints across every panel phase, not just the one
  C3 already covers.
- All 5 implementation tasks completed in ~43 minutes total
  (`4fbb73a` 16:30 → `4bea7c0` 17:13), despite the Build plan's own
  test-first mandate ("make at least one owned scenario fail for the
  intended reason and retain that red→green evidence") and real
  cross-task dependencies (`cc-t3` blocked by `cc-t2`, `cc-t4` blocked by
  `cc-t1`+`cc-t3`). Plausible but worth an honest look: is genuine
  red→green discipline survivable at this pace, or does the timeline
  imply tests and code were written together.
- The PR panel's 3-cycle hard cap is a structural cliff, not just a
  cost control: cycles 1 and 2 both surfaced real high/medium findings
  (5, then 2); cycle 3 was the last chance by construction, which is a
  standing incentive to rate cycle-3 findings low regardless of their
  actual severity.
- The accepted `/proc/self/environ` residual (ADR 0004) states production
  secret delivery "must avoid initial environment values ... before that
  residual is acceptable" — but `apps/bot/src/config.ts` in the shipped
  code unconditionally reads `SLACK_BOT_TOKEN`/`SLACK_APP_TOKEN`/`HONCHO_*`
  from `process.env` today. The ADR's own stated precondition for
  accepting the residual isn't met by what actually shipped — this is a
  documented acknowledgement, not a satisfied condition.
- The capability collision-detection logic (the core runtime trust
  boundary) needed 3 revision rounds inside the **plan phase alone**
  before the spec even started (round 1: the "hijack" framing was
  inverted; round 2: the fix created a new blind spot around a tool
  literally named `read`; round-2-wave-2b: stale DoD wording lagging the
  already-fixed logic) — suggesting the design wasn't grounded against
  pi's actual tool-registry merge behaviour before submission.
- Supply-chain/credential risk never surfaced in C1–C5: the spec records
  that `npm ci`/extension setup execute third-party code with builder
  privileges, and that private builds borrow a personal git identity
  pending a dedicated GitHub App (`docs/specs/2026-07-20-capability-collections.md`
  around lines 872–879).
- The spec explicitly records that its own future capability-refresher
  design has a same-path module-cache staleness gap and a lazy-
  registration collision blind spot (same spec, ~lines 855–864) — directly
  relevant to C1/C3's dynamic-governance ambitions and never cited there.
- A PR review comment on #35 flags qmd's indexing cost as an ongoing
  operational/performance burden on *ordinary* Case rebuilds (not just the
  capability build), asking for an independently cacheable
  materialiser/sidecar — a concrete instance of the performance category
  C4 only names generically.

### Low

- `docs/adr/0004...md` and the product brief were both amended *after*
  cycle-3 clearance, without re-review — the governing documents the panel
  approved aren't quite the ones that shipped.
- All 5 task-validate receipts show the identical validator model
  (`claude-haiku-4-5`) and identical generated-agent hash — no model
  diversity at the validation layer; a shared blind spot in that model
  would silently pass every task the same way.
- The brainstorm's approval preceded proper grounding: the plan panel
  found that skills are structurally unloadable under Case's
  `noTools:"builtin"` posture — a basic blocker the brainstorm missed
  entirely, forcing a mid-plan owner scope fork (enable builtin `read`).
  "Approved by the human owner the same day" described a design that
  couldn't work as stated.
- The source/ref-validation surface accumulated a distinct new gap in
  every one of the 3 PR cycles (git-option injection → tag-ancestry
  syntax → WHATWG-normalization divergence → still-open malformed-https
  forms) — each fix addressed the previous finding but revealed an
  adjacent one, consistent with no coherent up-front threat model rather
  than a converging design.
- deepseek's spec-review dispatch was rejected by the acceptance harness
  for "no edits" (expected for a read-only reviewer) — a known quirk, but
  one that could mask a genuine partial failure if ever relied on as an
  automated completion signal rather than manually inspected.
- Two residuals recorded only in `consolidated-cycle3.md` and not
  mentioned in any brief: WHATWG-normalized malformed sources (e.g.
  `https:github.com/x/y`) can still pass `parseLedger` even though the
  schema rejects them, and recursive filesystem-writability was
  spot-checked rather than exhaustively proven.

## Relationship to the existing programme

- `O5` (observable lifecycle state, FS13 telemetry) already supplies the
  capture substrate C3 needs; the gap is downstream — Case's adoption, plus
  a policy layer telemetry alone doesn't provide.
- C5 is a precondition for C3's timeout-exclusion policy actually working
  in real time (you can't replace a stalled panelist immediately if the
  dispatch that would let you notice is itself blocking) and for C2's
  build-supervisor to be safe to build at all.
- `O7` (author-model preferences) is a necessary but insufficient piece of
  C1 — static preference, not dynamic governance/handover.
- `O3` (explicit authoring outcomes/traceability) is the nearest existing
  outcome to C4 but is scoped to what the Specification already declares,
  not to prompting for what it's silently missing.
- C2 is close to `docs/briefs/2026-07-14-orchestrator-led-automation-intake-contract.md`'s
  territory but deliberately scoped smaller: a Build-phase parallel-dispatch
  supervisor, not the full unattended Plan→Spec→Build→Implement pipeline
  that brief investigates.
- None of C1/C2 fit cleanly inside the programme's current **Out** line
  ("a general workflow engine, daemon, or event bus") — picking any of them
  up means an explicit decision to amend that scope line, not a silent
  extension.

## Open questions for whoever picks this up

- Is C1 (dynamic authoring governance) and C2 (Build-phase parallel
  supervisor) one child stream or two, given C2 is usable standalone and
  much smaller?
- Does C3's timeout-exclusion policy belong in `sdlc.config.json` (per-model,
  per-phase, e.g. "exclude after 2 consecutive timeouts this run") or in the
  panel-dispatch runner itself?
- Where does C4's prompt live mechanically — a Brainstorm-recap checklist
  section, a Plan-gate question the human must answer or explicitly waive,
  or a lint that flags an unaddressed category rather than blocking?
- Now that Case's package pin is bumped to `v2.4.0`, confirm on the *next*
  Case feature run that telemetry is actually emitted end-to-end (a stale
  pin is an easy silent regression for any consumer — worth a readiness/
  setup check that can detect "adopted but running an old package version"
  rather than relying on someone noticing, as happened here).
- C5: what would it actually take to make "async + per-child reaction"
  mechanically checkable rather than prose-trusted — an FS13 event per
  poll (`panel.polled`?), a lint over session transcripts that flags a
  single long blocking `subagent`/`subagent_wait` call spanning a whole
  panel dispatch, or something else? And should the per-child timeout
  ceiling itself (1,200,000ms today) be a configured, phase-tunable value
  rather than whatever default currently produces that number, given C3's
  separate finding that we don't yet know if 20 minutes is reasonable,
  chronically too short, or too long for any given model/phase pairing?

This brief makes no scope-in/out decision. It exists so a future brainstorm
starts from retro evidence instead of from memory of a hard day.
