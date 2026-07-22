# Consolidated spec panel — review-gate config model (#150)

- Date: 2026-07-22
- Target: docs/specs/2026-07-22-review-gate-config-model.md @ 66e38ee (main)
- Panel: google/gemini-3.1-pro-preview:xhigh, openai-codex/gpt-5.6-luna:xhigh
  (author fable-5 excluded; floor 2). **gemini's first dispatch returned empty
  output (infra failure) — retried once per the dispatch-recovery rule; the retry
  produced a verdict, no substitution needed.**
- Orchestrating/adjudicating model: Claude (this session). Spec is owner
  pre-approved after review rounds (goal directive 2026-07-22).

Consolidated to 2 high + 6 medium + 1 low (gemini's fixture-completeness high and
luna's test-surface medium are the same finding; gemini's S9 medium and luna's
S9/S10 medium are the same). Both models are grounded and file-cited; all
verified against the tree. **All incorporated** into spec rev 2 — the one that
looked like a scope expansion (schema-break `!`) is resolved by correcting the
spec's own over-claim, not by widening scope.

## H1 — surface inventory misses v3-hardcoded test fixtures (gemini + luna)

- Verified: `test/fs8-helpers.js:16` (`VALID_CONFIG` schemaVersion 3 + `design:"panel"`),
  `test/hooks.test.js:24`, `test/telemetry-side-effects.test.js:78`,
  `test/installed-consumer.test.js:60`, `test/check-lifecycle-git.test.js:21`,
  `test/check-completion.test.js`, `test/readiness-lib.test.js` all pin v3/scalars.
- Disposition: **INCORPORATE.** §2 test list expanded to include the shared
  `fs8-helpers.js VALID_CONFIG` (high leverage) and every v3 fixture/test; add a
  fixture sweep to the DoD so S16 is achievable.

## H2 — `approve:agent` contradicts phase-plan/phase-spec human-approval prose (luna)

- Verified: `phase-plan.md:65` "design gate plus human approval"; `phase-spec.md:73`
  "plus human approval". My spec only reconciled `phase-pr-review.md` (S11).
- Disposition: **INCORPORATE.** Reconcile all three references: the seam is "design
  gate plus approval by the effective approver — human, or the agent under
  `approve:agent`." S11 covers phase-plan, phase-spec, and phase-pr-review.

## M3 — schema-break guard accepts `!`; N2 over-claims (luna) — corrected, not widened

- Verified: `check-schema-break.mjs:40` accepts a `feat!:` title; `:80` recommends
  it; `schema-break.test.js:57-58` expects `feat!:`/`feat(config)!:` to pass.
- Disposition: **INCORPORATE (reword N2), scope-out the guard change.** N2's job is
  only that *this PR's* commit carries a `BREAKING CHANGE:` footer (which both the
  guard and the angular-preset semantic-release honor; the bare `!` yields "no
  release" per the known gotcha). N2 is reworded to state exactly that and to stop
  implying check-schema-break enforces a no-`!` rule. Hardening the guard to reject
  `!` is a separate release-guard concern (candidate follow-up), out of #150's
  config-decomposition scope. No surviving contradiction once N2 is accurate.

## M4 — reserved `preview` lacks a closed-world rejection scenario (luna)

- Disposition: **INCORPORATE.** S13 gains rejection assertions: an unknown sibling
  key on a gate dial is rejected, and a non-boolean `preview` is rejected — at both
  base and override levels — so the frozen boundary is actually tested.

## M5 — S5/S6 can't prove identical merge across the two consumers (luna)

- Verified: resolver guard is `... === "skip"`, so a shallow resolver merge that
  drops `validate` (leaving it `undefined`) still resolves a panel and S5 passes
  falsely; `config-doc.mjs:93` and `resolve-panel.mjs:92` hold separate private
  merges.
- Disposition: **INCORPORATE.** C3c mandates a **single shared exported helper**
  (`effectiveReviewDial`/`effectiveReview` in `lib.mjs`) consumed by both
  `config-doc` and `resolve-panel`; S5/S6 become observable (a test that fails if
  either inherited field is dropped, e.g. asserts effective `validate:"panel"`
  survives an `approve`-only override).

## M6 — agent-approval telemetry unspecified (luna)

- Verified: `telemetry.mjs:58` accepts any `nonEmptyString` approver;
  `system-reference.md:308-309` documents only "every human gate approval".
- Disposition: **INCORPORATE.** Pin the `gate.approved` approver value for an agent
  gate to the telemetry `--by` grammar's `agent` token; state the emission rule
  ("every gate approval, human or agent"); update system-reference; add a scenario.

## M7 — S9/S10 stale-vocabulary bans are impossible as written (luna + gemini)

- Verified: `human`/`panel` are retained as `approve`/`validate` values;
  `SKILL.md:43` "advisory mode"; `resolve-panel.mjs:154` `advisory[${phase}]:` log
  prefix — a blanket `advisory` grep or "no removed scalar words" over-fails.
- Disposition: **INCORPORATE.** S9 restricted to "no `advisory` **as a gate value/
  grammar** and no `panel|advisory|human|off` gate **enumeration**"; explicitly
  allows `approve:human`, `validate:panel`, brainstorm `human|off`, session
  advisory mode, and the log prefix. S10 forbids only the removed scalar
  *explanations*, not the words `panel`/`human`.

## M8 — interview two-prompts-per-dial breaks the locked ≤3-prompt ceiling (luna)

- Verified: `templates/setup-sdlc.md:53-55` locks "≤ 3 prompts" (two core decisions
  - confirmation); C7d's two-prompts-per-object-dial = 4.
- Disposition: **INCORPORATE.** C7d becomes **one compound prompt per object dial**
  (`validate/approve`), preserving the two-core-decisions + confirmation ceiling.

## L9 — stale v3 version strings not swept (luna)

- Verified: `resolve-panel.mjs:3,55`, `config-doc.mjs:183`, `setup-sdlc.mjs:34,244,567`,
  `setup-sdlc.sh:18`, `sdlc-status.mjs:3` carry v3 text.
- Disposition: **INCORPORATE.** Add a v4 version-string sweep to N4/§2.

## Result

No finding dismissed on the merits; M3's guard-change is scoped out with a
recorded reason and the spec's own over-claim corrected. All folded into spec
rev 2. **Panel converges clean: no high or medium survives.**
