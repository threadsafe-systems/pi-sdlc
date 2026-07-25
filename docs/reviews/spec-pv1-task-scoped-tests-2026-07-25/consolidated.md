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

## Orchestrator identity caveat

Orchestrator identity for this session is not exposed by the runtime; the repo's
`panels.authorDefault` is `anthropic/claude-fable-5`. If this session is in fact
running as fable-5, then fable-5's review is not fully author-independent. The
second reviewer (glm-5.2) is independent regardless, and the sole HIGH finding
came from fable-5. Flagged to the owner (ceremony authority, who selected the
roster) for a decision on whether to also seat luna once its provider recovers.

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

## Outcome

Round-1 fix wave applied to `docs/specs/2026-07-24-pv1-task-scoped-tests.md`
(17 edits). No high or medium finding survives. Per workflow.md "trim the tail",
the next step is a **delta re-dispatch of the two reviewers** confirming the
fixes (or owner accept-without-redispatch) before the Spec gate closes.
