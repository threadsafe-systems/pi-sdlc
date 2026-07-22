# Consolidated PR panel — review-gate config model (#150)

- Date: 2026-07-22
- Track: irreversible. Branch: `feat/review-gate-config-model`.
- Panel: openai-codex/gpt-5.6-sol:xhigh, openai-codex/gpt-5.6-luna:xhigh,
  amazon-bedrock/global.anthropic.claude-opus-4-8:xhigh (author
  anthropic/claude-fable-5 excluded; floor 3 met, no substitution).
- Orchestrating/adjudicating model: Claude (this session).
- Result: **converged clean over 5 waves — no high or medium finding survives.**
  All findings incorporated; none dismissed.

## Wave 1 (HEAD 5765e9e) — 6 findings, all incorporated

- **[HIGH, 3 models] test/e2e/l1.mjs still v3/scalar** (CI-blocking: the e2e
  workflow runs on every PR). Fixed to v4 objects + `reversible:code:panel/agent`
  override. Root cause: l1.mjs is not a `*.test.js`, so the full-suite run missed
  it; the T5 grep-completeness rule named it but it slipped.
- **[MED] phase completion contracts require panel+human for skip/agent gates** —
  §8 of phase-plan/spec/pr-review reconciled.
- **[MED] config-doc reversible note "PR panel still runs" unconditional** —
  conditioned on `review.code.validate`.
- **[MED] resolver deep-merge test is a false pass** — the guard only reacts to
  `validate:skip`, so a dropped `validate` still resolves; replaced with an
  observable test (validate:skip base + approve-only override must refuse).
- **[LOW] SKILL kernel telemetry "every human gate approval"** → "(human or agent)".
- **[LOW] floorFor private panelSize merge** → shared `effectiveReview`.
- **[LOW] config-doc stale "schemaVersion-3" render message** + S9 sweep broadened.

## Wave 2 (HEAD 19b768e) — wave-1 all verified resolved; new findings incorporated

- **[HIGH, self-introduced in wave 1] §8 dropped `approve:human` on validate:skip** —
  approval by the effective approver now ALWAYS happens; only the panel is
  conditional on `validate`.
- **[MED] adjudication step 4 human-owner-decides unconditional** — conditioned on
  `approve:human`; `approve:agent` = agent adjudicates, no escalation.
- **[MED] reversible "no design panel" unconditional** — honors a reversible
  `validate:panel` override.
- **[MED] resolve-panel ignores `--repo-root`** (pre-existing latent bug: empty
  `--config` shadows it in `inspectRoot`'s `??` chain) — fixed by passing empty
  strings as `undefined`.
- **[LOW] config-doc panelFloors private panelSize merge** → shared helper.

## Waves 3–4 (HEAD 862a9ed, 2b32ccf) — imperative panel-run prose conditioning

Waves 3–4 conditioned every imperative "run/rerun the panel" sentence in the
phase references on `review.code.validate: panel` (phase-pr-review §1, run-shape,
escalation, §6 refusal, §8 rerun; phase-plan/spec seams; phase-implement; the
standalone `sdlc:pr-review` router). Note this is pre-existing documentation
style: v3's `review.code: human|off` already meant "no panel," carried by the
"under your configuration" callouts; #150 preserves and now sharpens it. The
run-shape steps themselves (resolve→dispatch→consolidate→adjudicate→stop) describe
panel mechanics and are gated by the now-conditional entry.

## Wave 5 (HEAD 2b32ccf) — convergence

- gpt-5.6-sol: CLEAR (no high/medium; mergeable).
- gpt-5.6-luna: CLEAR (no high/medium; both gate paths consistent; mergeable).
- opus-4-8 (wave 3 holistic pass): mergeable — verified schema break, BREAKING
  CHANGE signal, resolve-panel guard, config-doc determinism/currency, schema↔
  hand-validator parity (ajv), disposition-invariant honesty, migration honesty;
  one low cosmetic (config-doc reversible designNote) subsequently fixed in wave 3.

## Residuals

None blocking. One low cosmetic doc-redundancy (opus) fixed. The broader
observation that phase-pr-review's primary narrative is written for the panel path
is accepted as pre-existing documentation style (unchanged risk vs v3's human/off
gates), with the conditioning carried by the updated callouts + the mechanical
`resolve-panel` refusal.
