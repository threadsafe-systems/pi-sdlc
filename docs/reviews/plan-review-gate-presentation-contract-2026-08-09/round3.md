# Plan panel round 3 — consolidated (convergence check over rev 3)

Run: `gate-presentation-contract`, phase `plan_review`, round 3.
Artifact: `docs/plans/2026-08-09-gate-presentation-contract.md` rev 3 at
`844e559`; delta `1d1af2c..844e559`. Same panel as rounds 1-2 (author model
`maas-qwen/qwen3.8-max` excluded, floor 2).

## Roster

| reviewer | model | runId | dur (s) | usage in/out | findings |
|---|---|---|---|---|---|
| gemini | google/gemini-3.1-pro-preview:xhigh | 865eb018 | 307 | 84 750 / 14 135 | 1 (1 medium NEW) |
| luna | openai-codex/gpt-5.6-luna:xhigh | 66270b3b | 401 | 97 139 / 17 261 | 1 (1 high REOPEN) |

Both reviewers verified the three round-2 fixes as landed (CLEAR: R2-D1
structure, R2-D2, R2-D3, plus luna's cardinality/reference-link/one-place
checks and gemini's regression check). Raw outputs:
`round3-gemini-3.1-pro-preview.md`, `round3-gpt-5.6-luna.md`. Prompt:
`prompt-round3.md`.

## Findings (2 canonical)

### R3-A1 — Map-mode index smuggles the grammar back in via line-kind prefixes (medium, NEW, gemini)

- evidence: rev-3 index entries were prefixed `appetite:` and `rejected:`
  (e.g. `- [appetite: one lifecycle slice ...][s3-gate-record]`,
  `- [rejected: verbatim prose recap block ...][s3-gate-record]`),
  re-materialising the line-kind grammar in the index and forcing
  dual-maintenance against the home list.
- verified: TRUE. The one-place law R2-D1 established puts the three line
  kinds in exactly one home; prefixed gists restate them in the plan.
- fix (INCORPORATED in rev 4): prefixes stripped — entries are now pure
  descriptive gists (`[one lifecycle slice ...]`, `[refused alternative — a
  verbatim prose recap block: ...]`); the intro line records the home-list
  shape ("one appetite line, nine decision lines, three rejected lines") as
  metadata about the home, not as grammar on the entries.

### R3-A2 — Plan sketch not verbatim against the canonical resolution-comment sketch (high, REOPEN R2-D1, luna)

- evidence: rev-3 plan sketch carried the pre-thread-variant nodes
  (`INDEX["...name-wrapped ticket links,\nDecisions-so-far shape"]`,
  `TICKET["ticket resolution comment\nsingle home of the full grammar"]`)
  while the canonical comment sketch carried the amended nodes
  (`INDEX["...named links + one-line gists\n(Decisions-so-far shape)"]`,
  `TICKET["resolution comment\n...(a decision ticket, or — thread variant
  — \na comment in the map thread)"]`). Extracted-fence hashes differed
  (`20e594...` plan vs `bab0b8...` canonical).
- verified: TRUE — and it is exactly the "embeds verbatim" rule the contract
  prescribes, caught by the contract's own dogfood. Root cause: the
  resolution comment was amended with thread-variant wording when posted,
  but the plan's embedded copy was not re-synced.
- fix (INCORPORATED in rev 4): plan mermaid block replaced byte-for-byte
  with the canonical comment block; re-verified by sha256 of the extracted
  fences — plan and live comment now both hash `bab0b82b7323`, IDENTICAL.

## Orchestrator defect found while verifying R3-A2 (O-1)

The original resolution-comment post used `gh api ... -f
body=@/tmp/s3-resolution.md`; `gh api -f` treats the value as a literal
string, so the live comment body was the 23-byte text
`@/tmp/s3-resolution.md` rather than the file contents. Repaired with
`jq -n --rawfile b ... '{body:$b}'` + `gh api -X PATCH --input`; the live
comment now round-trips the full gate record (3 996 bytes, sketch + 13
canonical lines; `diff` vs the source file shows only GitHub's trailing
newline). Rounds 1-3 reviewers that CLEARed "the comment holds the record"
were reading the local source file, not the live comment — lesson: verify
posted-artifact round-trips mechanically, and hand the panel the live URL
only after a fetch-back check.

## Verdict

2 findings, 2 incorporated, 0 dismissed. Cumulative ledger: rounds 1-3,
16 findings (11 + 3 + 2), 16 incorporated, 0 dismissed. Plan revised to
rev 4 (single commit with this record). Round 4 = convergence check over
the rev-4 delta, same panel.
