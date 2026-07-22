# Consolidated plan panel — review-gate config model (#150)

- Date: 2026-07-22
- Target: docs/plans/2026-07-22-review-gate-config-model.md @ 66e38ee (main)
- Panel: google/gemini-3.1-pro-preview:xhigh, openai-codex/gpt-5.6-luna:xhigh
  (author anthropic/claude-fable-5 excluded; floor 2 met, no substitution).
- Orchestrating/adjudicating model: Claude (this session), with the human owner
  as final adjudicator on the disputed policy finding (H2).

Consolidated to 3 high + 3 medium (gemini's high and luna's deep-merge medium
are the same finding). gemini's CLEAR D/E directly dispute luna's M4/H2 — genuine
cross-model disagreement, resolved in favour of luna's grounded, file-cited
findings (ADR 0027 and Case's config were verified to exist as cited).

## H1 — `overrides` deep-merge vs required-fields contradiction (gemini + luna)

- Disposition: **INCORPORATE.** Base dial requires both `validate` + `approve`;
  `overrides.{track}.review` dials allow **partial** objects (optional fields)
  and **deep-merge** per field. This is internally coherent (base is fully
  explicit; an override relaxes only the axis it names). Open Decisions 1 & 3
  reworded to this single contract; Spec finalizes the exact schema.

## H2 — clean-break posture vs ADR 0027 + Case already adopted (luna) — DISPUTED

- Verified: `docs/adr/0027-pre-adoption-clean-break-policy.md` (accepted
  2026-07-17) states clean-break holds "until a first external adopter exists"
  and "expires at first external adoption," after which a break must ship "a
  migration (or an equivalently honest forward path)." Case
  (`/home/neil/code/threadsafe/case/.pi/sdlc/sdlc.config.json`) is a committed
  schemaVersion-3 adopter (`design:panel`, `code:panel`).
- Disposition: **INCORPORATE + human-owner decision.** The plan must engage ADR
  0027 explicitly (it currently cites only the older rev-5 precedent). The open
  question — *is Case an "external adopter" that closes the clean-break window,
  and if so is the forward path a migrator or a coordinated re-author?* — is a
  policy/ownership call reserved for the human owner. Escalated to Neil.

## H3 — `approve:agent` vs the human-final-adjudicator rule (luna)

- Disposition: **INCORPORATE (clarify).** `approve:agent` is not new behaviour:
  it is exactly today's `advisory`/`off` adjudication (`arbiter:none` — the agent
  adjudicates and advances with no human gate for that phase). The plan/Spec must
  state this precisely: under `approve:agent` the agent is the adjudicator for
  that gate, the disposition invariant still applies (no surviving high/medium),
  and there is no human escalation for that gate. The human-final-adjudicator
  rule in phase-pr-review.md applies to `approve:human` gates. Add the
  phase-prose reconciliation, telemetry (`gate.approved` approver value for
  agent), and scenarios to scope.

## M4 — the "faithful" desugar overclaims semantic preservation (luna)

- Disposition: **INCORPORATE.** The desugar is faithful on the reviewer/arbiter
  axes, but the always-on disposition invariant intentionally tightens old
  `advisory`'s non-blocking behaviour (a surviving high/medium can no longer
  pass). Relabel as an **intentional semantic amendment** (this is precisely the
  brainstorm decision that "ignore findings" must be unexpressible), covered by
  the ADR + a scenario. Note no current adopter uses `advisory` (this repo and
  Case both use `panel`), so real-world blast is nil — but the claim is corrected.

## M5 — additive `preview` vs closed-world validation (luna)

- Disposition: **INCORPORATE.** With `additionalProperties:false` on the dial
  object and the validator rejecting unknown review keys, a future `preview`
  field is rejected by a v4 reader — so "additive without a further break" is
  false as written. Resolution: **reserve an optional `preview` field in the v4
  schema now** (accepted, documented as reserved / no runtime effect in v4), which
  honours both "defer the semantics" and "additive later." Alternative (accept a
  later schema change for preview) is recorded; final call is Spec's, but the
  inaccurate DoD/claim is fixed either way.

## M6 — missing setup surfaces (luna)

- Disposition: **INCORPORATE.** Add `skills/sdlc/scripts/setup-sdlc.sh` (usage
  string) and `skills/sdlc/templates/setup-sdlc.md` (interview) to the impacted
  surface list, and add a stale-vocabulary sweep covering package wrappers and
  templates to the DoD.

## Result

No finding dismissed. All 6 incorporated into plan rev 2. H2 was owner-adjudicated
by Neil (2026-07-22): Case is co-owned dogfood, not an external adopter — the
clean break stands, ADR 0027 is amended, and Case's re-author is a coordinated
follow-up. **Panel converges clean: no high or medium finding survives
adjudication.**
