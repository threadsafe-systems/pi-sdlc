# Task for pi-sdlc-plan-review — round 4 (convergence check)

You are reviewing a REVISED PLAN document for the pi-sdlc repo at
/home/neil/code/threadsafe/pi-sdlc (main, commit f755141). This is round 4
of the plan panel — a DELTA/convergence review.

ARTIFACT: docs/plans/2026-08-09-gate-presentation-contract.md (rev 4).
The delta is commit 844e559..f755141 on that file
(git diff 844e559..f755141 -- docs/plans/2026-08-09-gate-presentation-contract.md),
but you may read the whole file for context.

ROUND 3 FINDINGS AND THEIR ADJUDICATED FIXES (both incorporated; records
under docs/reviews/plan-review-gate-presentation-contract-2026-08-09/ —
round3.md consolidation, adjudication.md round-3 section):

R3-A1 (medium, NEW): rev-3 index entries were prefixed with the grammar's
line kinds (`appetite:`, `rejected:`), smuggling the grammar into the index
(one-place-law breach). FIXED: verify the index entries are now pure
descriptive gists — no `appetite:`/`decision:`/`rejected:` prefixes on any
entry — and that the intro line's home-list counts ("one appetite line,
nine decision lines, three rejected lines") are metadata about the home,
not grammar restated on entries.

R3-A2 (high, REOPEN R2-D1): the plan's embedded sketch diverged from the
canonical resolution-comment sketch (the comment carried amended
thread-variant nodes; the plan kept the old ones). FIXED byte-for-byte.
VERIFY MECHANICALLY, against the LIVE comment (it was repaired after
round 3 — see O-1 in round3.md; do NOT trust any local file):

    gh api repos/threadsafe-systems/pi-sdlc/issues/comments/5230679564 -q .body > /tmp/r4-comment.md
    wc -c /tmp/r4-comment.md   # expect ~3996, NOT 23 (the old placeholder)

  then extract the ```mermaid fence from both the plan and /tmp/r4-comment.md
  and sha256-compare them (expect identical, `bab0b82b7323...`). Also
  verify the live comment body genuinely contains the full-grammar list
  (grep -c '^- \(appetite\|decision\|rejected\):' == 13 against the file).

YOUR TASK (three parts):

1. Verify each of the 2 fixes landed exactly as adjudicated — quote rev-4
   text and command output proving each. If a fix is missing, partial, or
   contradicts its adjudication, report it (REOPEN R3-An).
2. Regression hunt over the rev-4 delta: any NEW defect the edits
   introduced — an index entry that still smuggles grammar (including via
   synonyms acting as prefixes), a broken reference link (target defined
   exactly once, spelled identically), contradictions between the
   provenance block, In scope, DoD, and Assumptions, or scope creep beyond
   the ratified design (contract tests on prose + human gate, nothing more).
3. Convergence verdict: rounds 1-3 fully incorporated all 16 findings
   (0 dismissed). Explicitly state whether rev 4 is ready for the Plan
   gate or what remains.

PROPORTIONALITY ATTACK SURFACE (per workflow.md): also attack the fixes for
over-reach — does any rev-4 addition create ceremony the ratified design
rejects (no gate-time parser, no new dial, no new panel), or duplicate a
rule whose single home is elsewhere (one-place law)?

GROUNDING RULE: every finding cites file:line from the ACTUAL tree with
verbatim quoted evidence; re-read before citing; run commands as evidence
(git, grep, gh api, sha256sum). No speculation about unopened files. If you
cannot verify a claim, do not make it.

OUTPUT FORMAT: one section per finding —

### <REOPEN R3-An | NEW>

- severity: high|medium|low
- confidence: high|medium|low
- location: file:line(s)
- defect: …
- evidence: verbatim quotes with locations
- impact: …
- fix: …
Then one CLEAR line per verified R3 fix and per check that passes. End
with CLEAR: A/B/C/D/E/F lines for the standing review surfaces and a final
FINDINGS or NO-FINDINGS line.
