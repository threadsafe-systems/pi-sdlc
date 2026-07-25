# Spec panel — consolidated adjudication: PV1 task-scoped test declaration

- Phase: `spec_review` (irreversible track, `review.design: panel`, floor 2 distinct models)
- Spec under review: `docs/specs/2026-07-24-pv1-task-scoped-tests.md` @ commit `93213dc`
- Governing plan: `docs/plans/2026-07-24-pv1-task-scoped-tests.md`
- Date: 2026-07-25
- Logical wave: 1 (round 1)

## Panel composition

Owner-selected roster (Neil): `anthropic/claude-fable-5:xhigh` + `openai-codex/gpt-5.6-luna:xhigh`.

- **`anthropic/claude-fable-5:xhigh`** — completed, verdict delivered (1 high, 2 medium, 3 low; CLEAR A, E). Harvest: `.pi/sdlc/runs/pv1-task-scoped-tests/panels/spec_review-round1-2026-07-25`.
- **`openai-codex/gpt-5.6-luna:xhigh`** — **infra failure ("Service Unavailable")** on the original dispatch AND on the protocol-mandated single retry. Retry-once exhausted → treated as a confirmed infra failure (not a verdict), never counted against the floor.
- **Replacement (per `prefer` pool):** skipped `google/gemini-3.1-pro-preview` (standing documented 429/credit outage) and dispatched the next reliable candidate **`zai/glm-5.2:xhigh`** — completed, verdict delivered (2 low; CLEAR A, B, C, D, F, G). Harvest: `.pi/sdlc/runs/pv1-task-scoped-tests/panels/spec_review-round2-2026-07-25` (harvest label round 2; logical wave 1).

Floor of 2 distinct models met (fable-5 + glm-5.2).

## Orchestrator identity

Orchestrator (spec author + adjudicator) for this session is
`anthropic/claude-opus-4-8` (confirmed by the owner). Both panellists
(`claude-fable-5`, `glm-5.2`) are therefore distinct from the author — the
panel is fully author-independent and the author-exclusion rule holds.

## Findings and adjudication (round 1)

All findings **incorporated** (0 dismissed). 100% incorporation on a *single*
round is not the workflow.md smell (that triggers across two consecutive
rounds); every finding below was independently ground-verified against the repo.

| id | sev | source | finding | disposition |
|---|---|---|---|---|
| F1 | **high** | fable-5 | §10/TST17 accepted a `BREAKING CHANGE:` line in the PR **title**, which is release-inert under the `conventionalcommits` preset (title → squash header; breaking only via `!` header or a body/footer note). | **Incorporated** — §10 + TST17 now require the `BREAKING CHANGE:` footer in the **PR body**, title arm dropped; grounded against `.releaserc.json` (conventionalcommits) + ratified no-`!`-shorthand discipline. |
| F2 | medium | fable-5 | Rule A/B behaviour under co-occurring structural errors (dangling `checkIds`, shape-invalid `scope`) was unspecified, yet TST11 freezes a byte-exact golden. | **Incorporated** — new §4 "Evaluation under co-occurring errors" predicate (shape-invalid `scope` = absent; rules stack, never suppress); TST11 now pins that predicate in the golden. |
| F3 | medium | fable-5 | §12/§14 claimed *all* scenarios are pure in-process `inspectManifest`, but TST4/TST5 assert a *verdict*/zero-command execution (a `runManifest`/CLI property, file I/O), and TST19 is the corpus gate. | **Incorporated** — §12 + §14 preamble restated honestly (TST4/5 lead with in-process `manifestErrors`, end-to-end corollary uses temp-dir `runManifest`; TST13/TST19 are the corpus gate); no-new-expensive-path claim preserved and true. |
| F4 | low | fable-5 | TST11's "non-`add()` path" falsify clause gates nothing observable (a byte-identical string from any reporter yields the same array). | **Incorporated** — falsify clause restricted to observable order/stacking; `add()`-routing marked review-verified, not scenario-gated. |
| F5 | low | fable-5 | Base-spec authority quote mis-cited as §1.5; it lives in §1.4 (Scenario rules). §1.5 is Category rules. | **Incorporated** — §9 (×2) and §13 now cite `§1.1/§1.4`; ground-verified at base-spec lines 179–191. |
| F6 | low | fable-5 | §0/§2 "regression net is mechanically guaranteed present" overclaims — only a *declaration* is guaranteed; a mistagged `"full"` check passes. | **Incorporated** — §0 + §2 title/body reworded to "*declared* regression net"; genuineness explicitly routed to the same human gate as the evidence mapping. |
| G1 | low | glm-5.2 | §6 said the validator's markdown "surfaces" a task-scoped check's argv/stdout; it reports only `id`/status — argv/stdout live in `runner-report.json` in the receipt. | **Incorporated** — §6 reworded to locate the evidence in the runner report (via `--report`) read by the PR panel; conclusion (no mandate change) unchanged. |
| G2 | low | glm-5.2 | §5/§7/TST15 cited base-spec "§2.5 / §6" for the error rule-order paragraph; §6 (SKILL.md law) has no such content — it is in §2.5 only. | **Incorporated** — dropped `§6`; §5 + §7 item 5 now cite §2.5 only. |

Cross-model agreement: fable-5 and glm-5.2 independently landed adjacent
citation-precision findings (F5 on §1.4 vs §1.5; G2 on §2.5 vs §6), both around
the base-spec section mapping — reinforcing signal, both fixed.

CLEAR coverage across the panel: A (both), B (glm), C (glm), D (glm), E (fable),
F (glm), G (glm).

## Round 2 (delta) — fable-5:xhigh + glm-5.2:xhigh @ commit `23ad6f6`

Harvest: `.pi/sdlc/runs/pv1-task-scoped-tests/panels/spec_review-round3-2026-07-25`.
**All eight round-1 findings independently CONFIRMED fixed** by both reviewers
(fable-5 confirmed F1–F6/G1–G2; glm-5.2 confirmed F1–F6/G1). Three new/reopened
findings, all verified and incorporated (fix-wave commit this round):

| id | sev | source | finding | disposition |
|---|---|---|---|---|
| R2-1 | medium | glm-5.2 (NEW) | §10/TST17's F1 fix over-corrected: it claimed title-only signals are universally release-inert and that "the ratified commit-discipline avoids `!`". Ground-verified false — under the `conventionalcommits` preset a `type!:` PR **title** IS a breaking signal, and `scripts/check-commit-messages.mjs:9` accepts `!`; the avoid-`!` rationale traces to a now-stale angular-preset assumption (ADR 0027:27–28). | **Incorporated (corrected)** — §10 now states both placements (`!` title OR body footer) are valid under the preset + commit-lint, keeps only the true narrow claim (a literal `BREAKING CHANGE:` *text string in the title* is not a signal), and **standardises this change on the body footer**. TST17 falsify reworded. **The body-footer-only-vs-also-permit-`!` choice is escalated to the owner** (touches ratified commit-discipline; see note). |
| R2-2 | medium | fable-5 REOPENED(F3) | TST19 still carried the universal "all new tests are offline in-process `inspectManifest`/Ajv assertions" claim the F3 fix removed elsewhere — contradicting TST4/TST5's sanctioned temp-dir `runManifest` corollary. | **Incorporated** — TST19 reworded to exempt TST4/TST5's bounded temp-dir corollary (§12). |
| R2-3 | low | glm-5.2 REOPENED(G2) | TST15 still cited base-spec "§2.5/§6"; G2's round-1 fix edited §5 + §7 item 5 but missed TST15. | **Incorporated** — TST15 now cites §2.5 only. |

## Owner escalation (RESOLVED 2026-07-25)

**R2-1 policy question** — the 2026-07-17 "avoid `type(scope)!:` shorthand"
discipline rested on the repo then using the **angular** preset (which ignored
`!`); the repo now uses **conventionalcommits** (`.releaserc.json`) which honours
`!`, and `commit-lint` accepts it. **Owner decision (Neil, 2026-07-25): permit
the `!` shorthand.** §10/TST17 widened to accept EITHER a `type(scope)!:`/`type!:`
PR title OR a `BREAKING CHANGE:` body footer. The superseded 2026-07-17
avoid-`!` discipline no longer applies; ADR 0027:27–28's stale angular-preset
rationale line should be refreshed in a follow-up.

## Outcome

Round 2 confirms every round-1 fix and leaves **no high finding** surviving; two
mediums + one low from round 2 are all incorporated. One owner decision (R2-1
placement policy) is open before the Spec gate closes. Round 2 was NOT 100%
re-litigation — it confirmed fixes in one line each and found only genuine
residuals, so the workflow.md two-round-100%-incorporation smell does not apply.
Per "trim the tail", once R2-1 is settled the residual is wording-only; a
narrow delta re-confirm of the touched §10/TST17/TST19/TST15 (or owner
accept-without-redispatch) closes the gate.
