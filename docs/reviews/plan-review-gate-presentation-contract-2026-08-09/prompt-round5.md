# Task for pi-sdlc-plan-review — round 5 (convergence check)

You are reviewing a REVISED PLAN document for the pi-sdlc repo at
/home/neil/code/threadsafe/pi-sdlc (main, commit 5f105fa). This is round 5
of the plan panel — a DELTA/convergence review over a small wording fix.

ARTIFACT: docs/plans/2026-08-09-gate-presentation-contract.md (rev 5).
The delta is commit f755141..5f105fa on that file
(git diff f755141..5f105fa -- docs/plans/2026-08-09-gate-presentation-contract.md),
but you may read the whole file for context.

ROUND 4 RECORD (docs/reviews/plan-review-gate-presentation-contract-2026-08-09/
— round4.md, adjudication.md round-4 section): 1 canonical finding,
incorporated:

R4-A1 (medium): rev-4 index entries 11-13 all began `refused alternative —`,
a uniform classification of those entries by line kind under a synonym
(one-place-law breach surviving R3-A1's fix relabelled). FIXED in rev 5,
two parts — verify both:
  (a) the three entries now begin with their SUBJECT and carry no shared
      classification prefix. Mechanical check: extract the 13 index lines
      (lines matching `^- \[.*\]\[s3-gate-record\]$`) and verify (i) no
      leading token repeats across ≥3 entries as a prefix, (ii) none begins
      with a grammar prefix or synonym (`appetite:`, `rejected:`, `refused
      alternative`, `decision:`).
  (b) the intro's boundary statement is sharpened: entries carry no
      line-kind prefix AND no uniform classification of any kind; kind
      names may appear only as subject matter of the decision being gisted
      (as they do in the sketch); classification lives only at home.

Also DISMISSED in round 4 (do NOT re-raise without new evidence): the
line-45 grammar-decision entry naming the three kinds, and the intro's
home-list counts — adjudicated as subject matter, not classification (the
ratified design embeds the sketch, whose DECS node names all three kinds,
verbatim in both modes; the one-place law protects the entry list, not the
vocabulary).

YOUR TASK (three parts):

1. Verify R4-A1's fix landed exactly as adjudicated — quote rev-5 text and
   command output. If missing, partial, or contradicting its adjudication,
   report it (REOPEN R4-A1).
2. Regression hunt over the rev-5 delta, bounded by proportionality (this
   is a wording delta on three bullets + one intro sentence): reference
   link integrity still holds (`[s3-gate-record]` defined exactly once, 13
   entries spelled identically); the sketch still hashes identical to the
   live comment's fence
   (gh api repos/threadsafe-systems/pi-sdlc/issues/comments/5230679564 -q .body,
   extract the mermaid fence, sha256-compare; expect bab0b82b7323...);
   nothing else changed.
3. Convergence verdict: rounds 1-4 incorporated all 17 findings
   (0 dismissed standing). Explicitly state whether rev 5 is ready for the
   Plan gate or what remains.

PROPORTIONALITY ATTACK SURFACE (per workflow.md): this round exists to
confirm a three-bullet wording fix. A finding here needs concrete evidence
of a defect in rev 5's text — not a re-litigation of adjudicated
dismissals, not new demands on the map-mode index beyond the ratified
design (named links + descriptive gists; full grammar once at home; no
parser, no dial, no panel).

GROUNDING RULE: every finding cites file:line from the ACTUAL tree with
verbatim quoted evidence; re-read before citing; run commands as evidence
(git, grep, gh api, sha256sum). No speculation about unopened files. If you
cannot verify a claim, do not make it.

OUTPUT FORMAT: one section per finding —

### <REOPEN R4-A1 | NEW>

- severity: high|medium|low
- confidence: high|medium|low
- location: file:line(s)
- defect: …
- evidence: verbatim quotes with locations
- impact: …
- fix: …
Then one CLEAR line per verified check. End with CLEAR: A/B/C/D/E/F lines
for the standing review surfaces and a final FINDINGS or NO-FINDINGS line.
