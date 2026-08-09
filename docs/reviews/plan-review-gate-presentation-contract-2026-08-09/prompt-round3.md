# Task for pi-sdlc-plan-review — round 3 (convergence check)

You are reviewing a REVISED PLAN document for the pi-sdlc repo at
/home/neil/code/threadsafe/pi-sdlc (main, commit 844e559). This is round 3
of the plan panel — a DELTA/convergence review.

ARTIFACT: docs/plans/2026-08-09-gate-presentation-contract.md (rev 3).
The delta is commit 1d1af2c..844e559 on that file
(git diff 1d1af2c..844e559 -- docs/plans/2026-08-09-gate-presentation-contract.md),
but you may read the whole file for context.

ROUND 2 FINDINGS AND THEIR ADJUDICATED FIXES (all 3 incorporated; records
under docs/reviews/plan-review-gate-presentation-contract-2026-08-09/ —
round2.md consolidation, adjudication.md round-2 section):

R2-D1 (high, NEW): dogfood mode contradiction — rev 2's block declared
"plain mode" while the run is map-sourced (Map #192 slate row), and the
ratified map mode had no variant for decisions ratified as map-thread
comments. FIXED in three parts, verify all three:
  (a) a resolution comment on #192 is now the single home of the full
      grammar — fetch it:
      gh api repos/threadsafe-systems/pi-sdlc/issues/comments/5230679564 -q .body
      It must contain the verbatim sketch (mermaid) + the full-grammar
      decisions list (appetite:/decision:/rejected: lines, ASCII arrow).
  (b) the plan's dogfood block is converted to the map-mode INDEX it
      prescribes: "map mode — this block is the index", named gist entries
      linking the resolution comment (reference-style links), sketch still
      embedded verbatim.
  (c) In-scope 3 gained the thread-variant clause (the resolution comment
      may be a comment in the map thread; entries sharing a comment share
      one home).
  Dogfood-consistency checks: index entry count (13) == canonical list line
  count in the resolution comment (13); every index entry links the same
  home; the sketch in the plan and the sketch in the comment are identical;
  nothing in the plan restates the full grammar (one-place law).

R2-D2 (medium, REOPEN R1-07): the ADR bar was restated twice in rev 2.
FIXED: both restatements removed; verify In-scope 1 now references
system-reference.md's Governance paragraph with NO criteria list, and the
canonical ADR-bar decision line in the resolution comment is likewise
reference-only. Verify the criteria live only at system-reference.md (grep
"hard to reverse" — expect exactly the system-reference.md hit).

R2-D3 (medium, NEW): G4/G7 semantics were missing from the contract-test
directions. FIXED: verify In-scope 5 now names the G4 trigger rules
(required only when a named trigger fires; fired-but-skipped declared) and
the G7 rules (constraints named or "none identified"; bind only when
actually binding), and DoD 1 names them as asserted semantics.

YOUR TASK (three parts):

1. Verify each of the 3 fixes landed exactly as adjudicated — quote the
   rev-3 text (and, for R2-D1, the resolution-comment text) proving each.
   If a fix is missing, partial, or contradicts its adjudication, report it
   (REOPEN R2-Dn).
2. Regression hunt over the rev-3 delta: any NEW defect the edits
   introduced — broken reference-style links (target must be defined
   exactly once and spelled identically), index/gist lines that smuggle the
   full grammar back in, contradictions between the provenance block,
   In scope, DoD, and Assumptions, any scope creep beyond the ratified
   design (contract tests on prose + human gate, nothing more).
3. Convergence verdict: with rounds 1-2 fully incorporated (14 findings
   total, 0 dismissed), explicitly state whether rev 3 is ready for the
   Plan gate or what remains.

PROPORTIONALITY ATTACK SURFACE (per workflow.md): also attack the fixes for
over-reach — does any rev-3 addition create ceremony the ratified design
rejects (no gate-time parser, no new dial, no new panel), or duplicate a
rule whose single home is elsewhere (one-place law)? A fix that satisfies
its finding but bloats the contract is a finding.

GROUNDING RULE: every finding cites file:line from the ACTUAL tree with
verbatim quoted evidence; re-read before citing; run commands as evidence
(git, grep, gh api, npm test). No speculation about unopened files. If you
cannot verify a claim, do not make it.

OUTPUT FORMAT: one section per finding —

### <REOPEN R2-Dn | NEW>

- severity: high|medium|low
- confidence: high|medium|low
- location: file:line(s)
- defect: …
- evidence: verbatim quotes with locations
- impact: …
- fix: …
Then one CLEAR line per verified R2 fix and per check that passes
(CLEAR: R2-D1 — …). End with CLEAR: A/B/C/D/E/F lines for the standing
review surfaces (falsifiability, provenance, boundaries, frozen surfaces,
dependencies, track) and a final FINDINGS or NO-FINDINGS line.
