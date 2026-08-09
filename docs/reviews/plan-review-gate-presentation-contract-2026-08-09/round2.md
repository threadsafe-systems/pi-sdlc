# Plan panel round 2 — consolidated (delta over rev 2)

Run: `gate-presentation-contract`, phase `plan_review`, round 2.
Artifact: `docs/plans/2026-08-09-gate-presentation-contract.md` rev 2 at
`1d1af2c`; delta `00b3322..1d1af2c`. Same panel as round 1 (author model
`maas-qwen/qwen3.8-max` excluded, floor 2).

## Roster

| reviewer | model | runId | dur (s) | usage in/out | findings |
|---|---|---|---|---|---|
| gemini | google/gemini-3.1-pro-preview:xhigh | 1eb25441 | 239 | 94 866 / 14 650 | 2 (1 high NEW, 1 medium REOPEN) |
| luna | openai-codex/gpt-5.6-luna:xhigh | 9dd23ec5 | 299 | 91 381 / 15 436 | 1 (1 medium NEW) |

Both reviewers verified all eleven round-1 fixes as landed (CLEAR: R1-01
through R1-11, each with quoted rev-2 evidence). Raw outputs:
`round2-gemini-3.1-pro-preview.md`, `round2-gpt-5.6-luna.md`. Prompt:
`prompt-round2.md`.

## Findings (3 canonical, deduplicated)

### R2-D1 — Dogfood mode contradiction; map-mode design lacks the thread variant (high, NEW, gemini)

- evidence: Status line 5 declares the run a Map #192 slate row (map mode),
  but the dogfood provenance block declares `plain mode — this block is the
  store` and embeds the full grammar (lines 11-14, 34-45).
- verified: TRUE. This slice is map-sourced (slate row on #192; the design
  amendment itself was posted to the #192 thread). Rev 1's plain-mode
  declaration was wrong, and the round-2 dispatch prompt inherited the error
  (its part 3 asserted "this plan WAS entered from Brainstorm, so the block
  must be the store") — gemini flagged the contradiction anyway; luna CLEARed
  DOGFOOD only by deferring to the prompt's false assertion. Dogfood lesson:
  a dispatch prompt cannot settle a design question it presupposes.
- deeper gap: the ratified map mode presumes per-decision tickets, but this
  repo's actual practice ratifies decisions as comments in the map thread.
- fix (INCORPORATED in rev 3): (a) new resolution comment on #192
  ([issuecomment-5230679564](https://github.com/threadsafe-systems/pi-sdlc/issues/192#issuecomment-5230679564))
  holds the verbatim sketch + full-grammar decisions list — the single home;
  (b) the dogfood block converted to the map-mode index it prescribes (named
  gist entries linking the resolution comment); (c) In-scope 3 gains the
  thread-variant clause (a comment in the map thread may be the resolution
  comment; entries sharing a comment share one home).

### R2-D2 — ADR bar restated despite R1-07 adjudication (medium, REOPEN R1-07, gemini)

- evidence: line 40 restates the three criteria (with a `-`/`+` typo) and
  line 74 carries a parenthetical criteria list.
- verified: TRUE (both locations quoted verbatim from rev 2). The R1-07
  adjudication said preserved by reference, never restated; rev 2 restated
  twice.
- fix (INCORPORATED in rev 3): both restatements removed; the decision line
  and In-scope 1 now reference system-reference.md's Governance paragraph
  only. The canonical full-grammar list in the resolution comment is likewise
  reference-only.

### R2-D3 — G4/G7 semantics absent from the contract-test directions (medium, NEW, luna)

- evidence: rev 2 added concrete G4 trigger/skip rules (lines 83-87) and G7
  `none identified`/binding rules (lines 87-90), but the enumerated
  contract-test directions (lines 107-113) name neither.
- verified: TRUE. Spec/Build could omit both obligations while satisfying
  every listed direction.
- fix (INCORPORATED in rev 3): In-scope 5 gains two semantic directions (G4
  trigger-fired/skip-declared; G7 none-identified/binds-only-when-actually-
  binding); DoD 1 names them as asserted semantics.

## Verdict

3 findings, 3 incorporated, 0 dismissed. All 11 round-1 fixes verified
CLEAR by both reviewers. Plan revised to rev 3 (single commit with this
record). Round 3 = convergence check over the rev-3 delta, same panel.
