# Plan panel round 4 — consolidated (convergence check over rev 4)

Run: `gate-presentation-contract`, phase `plan_review`, round 4.
Artifact: `docs/plans/2026-08-09-gate-presentation-contract.md` rev 4 at
`f755141`; delta `844e559..f755141`.

## Roster — two pre-verdict infra failures, two substitutions

| slot | model | runId | outcome |
|---|---|---|---|
| 1 | openai-codex/gpt-5.6-luna:xhigh | 0a6138c9 | ✅ verdict — 1 medium NEW |
| 2 | google/gemini-3.1-pro-preview:xhigh | 970696fc | ❌ billing 429 "prepayment credits are depleted" (1.3 s, pre-verdict) — see `round4-gemini-3.1-pro-preview-infra-failure.md` |
| 2-sub | anthropic/claude-fable-5:xhigh | 058e6a35 | ❌ account rate-limit 429 (pre-verdict) — see `round4-claude-fable-5-infra-failure.md` |
| 2-sub² | openai-codex/gpt-5.6-sol:xhigh | 1f04704d | ✅ verdict — 1 medium REOPEN R3-A1 |

Floor of 2 satisfied by luna + sol. Author model `maas-qwen/qwen3.8-max`
excluded. Gemini's failure is billing-level (needs a credits top-up at
ai.studio), not transient; fable-5's was its second pre-verdict panel 429.

## Findings (1 canonical after dedup)

### R4-A1 — Index synonym prefixes still classify entries by line kind (medium; luna NEW + sol REOPEN R3-A1, independently converged)

- evidence: rev-4 entries 11-13 each begin `- [refused alternative — ...]`
  (lines 52-54) while lines 38-39 claim "entries are pure descriptive
  gists; the line-kind prefixes live only at home". sol's mechanical check:
  canonical-prefix lines 0, synonym-prefix lines 3.
- verified: TRUE. The uniform prefix classifies those three entries as the
  `rejected:` lines — a functional synonym of the prefixes R3-A1 removed;
  the one-place-law breach survived under another label.
- fix (INCORPORATED in rev 5): the three entries now begin with their
  subject ("the plan carries no verbatim prose recap block — ...", "no
  gate-time mechanical grammar parser ...", "rejected alternatives never
  get discarded below the ADR bar ..."); the intro's boundary statement is
  sharpened: entries carry no line-kind prefix and no uniform
  classification of any kind; kind names may appear only as subject matter
  of the decision being gisted (as they do in the sketch); classification
  lives only at home.

## Dismissed sub-claims (luna's broader reading, not seconded by sol)

Luna's finding also claimed (a) the line-45 entry "three line kinds
(appetite exactly-one-first, decision, rejected)" and (b) the intro's
home-list counts restate the grammar. DISMISSED as subject matter, not
classification: the line-45 entry gists the grammar decision, whose
subject IS the line kinds — any faithful gist must name them; and the
ratified design embeds the sketch verbatim in BOTH modes while the
sketch's own DECS node names `appetite: / decision: / rejected:`. The
one-place law protects the full entry list, not the vocabulary. Sol's
independent review flagged neither.

## Verdict

1 canonical finding, 1 incorporated, 0 dismissed standing (2 sub-claims
dismissed with reasoning). Both reviewers CLEARed R3-A2 mechanically
(live-comment fetch: 3 996 bytes; both fences hash
`bab0b82b73231f380f8d6a902d2d53ba5b40696c27155d5b0fdfe5ad345386b2`,
`cmp` IDENTICAL; home cardinality 1/9/3 = 13). Cumulative ledger:
rounds 1-4, 17 findings, 17 incorporated, 0 dismissed standing.
Plan revised to rev 5 (single commit with this record). Round 5 =
convergence check over the rev-5 delta; panel luna + sol (gemini down,
fable-5 rate-limited).
