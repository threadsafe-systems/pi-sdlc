# External review methodology — gap analysis and adoption slate (keith-workbench)

Status: brainstorm input, not a ratified decision. Assesses the review
methodology codified in Greg's `keith-workbench` repository (commit `76ce359`,
2026-08-14, clean tree) against pi-sdlc's reviewer machinery, and proposes an
adopt/adapt/decline slate. Every claim about the external system cites a file
in that repository; every claim about ours cites this one. Feeds the reviewer-
specialist stream of the SDLC revamp; adjacent open work: #137 (3-cycle
cliff), #174 (panel non-convergence), #131 (build review), #132 (task model
assigner), #158 (dynamic ceremony, decision-complete), #159 (protected-surfaces
manifest), #192 (design-phase craft slate).

## 1. The system under assessment

Two tiers plus a design-side ratchet, all single-model (Claude Code `Agent`
tool, `subagent_type: "general-purpose"`):

| Tier | Chain | Job |
| --- | --- | --- |
| Per-change | `/review` → `/review-fix` → `keith-colleague-review` | 6 specialist agents + domain overlays → independent verification scoring → bounded fix loop → human-triaged GitHub review |
| Periodic audit | `bug-hunt` → `triage-findings` → `harden` | module × specialist fan-out (40–60 agents, user-gated batches), CVSS/OWASP + likelihood×impact banding → deployment-context "Practical Risk" triage → remediation drain |
| Design | `plan-critique-ratchet` | inline self-critique + fresh-context agent critique reading the plan text only |

Key files: `skills/review/commands/review.md` (the core),
`skills/review/commands/review-fix.md` (convergence loop),
`skills/review/references/review-contexts/{crypto,frontend,ffi-unsafe}.md`
(specialist overlays), `skills/quality/skills/bug-hunt/SKILL.md`,
`skills/quality/skills/triage-findings/SKILL.md`,
`bug-hunt/cycle-2/tools/TRIAGE-RUBRIC.md` (deployment-grounded scoring),
`skills/keith/skills/keith-colleague-review/SKILL.md`.

The `/review` specialists: Guidelines Compliance, Bug Hunter, Architecture &
History, Test Coverage (conditional), Error Handling (conditional), Claim
Auditor (conditional).

## 2. Question: are blockers identified by likelihood/reachability?

Yes — in three layers, and this is the system's strongest and most
battle-tested region.

1. **Per-finding verification scoring** (`review.md` Phase 3). Every raw
   finding goes to an independent verifier agent that scores
   `LIKELIHOOD (1–5) × IMPACT (1–5) × 4`; ≥60 blocks, 80+ is critical.
   Confidence is a *gate* into scoring, not a score. Anti-inflation rules are
   explicit: a finding about code that does not exist yet is L2 at most ("the
   tell: if your demonstrating mutation begins by *adding a function*,
   likelihood is 2"); "score the finding you can demonstrate, not the one you
   can imagine". Deliberate consequences are stated in both directions: a
   certainly-false-but-inert docstring filters at 8; a low-probability
   security break at likelihood 2 × impact 5 = 40 does not block but a
   plausible-next-edit path at 3 × 5 = 60 must be fixed.
2. **The threshold decides what blocks, not what is worth doing.** Sub-60
   findings with one-or-two-line fixes carry a `CHEAP` tag and are fixed in
   the same pass without spawning a review cycle. Blocking and fixing are
   decoupled.
3. **Audit-tier banding.** `bug-hunt` gives security findings a full CVSS
   v3.1 vector (eight metrics forced explicit) and everything else a
   qualitative likelihood×impact matrix; crown-jewel surfaces (auth, payments,
   PII, data integrity, compliance, signing) promote exactly one band with a
   recorded reason, never silently. `triage-findings` then adds Practical
   Risk: Reachability + Data Sensitivity + Mitigations +
   Already-Firing/Active-Exploitation, each 0–3, summed to four action tiers.

Two caveats worth carrying into anything we adopt:

- **Domain overlays deliberately re-blind likelihood.** `crypto.md` and
  `ffi-unsafe.md` instruct "score 90+ regardless of how unlikely the attack
  scenario seems" for key-compromise/UB classes. Defensible there (UB and
  crypto failures are latent, not improbable), but it is a valve that
  reintroduces likelihood-free blocking in exactly the domains where reviewers
  over-block. Any overlay of ours must justify that valve per-domain, not
  inherit it.
- **Proportionality against the objective is absent.** The chain never reads
  a plan, spec, or definition of done. It is a diff-correctness machine:
  proportional to the *change* (diff-scoped, pre-existing issues excluded) but
  blind to whether the change over- or under-serves its objective. pi-sdlc
  panels grounded in governing docs (`<GOVERNING_DOCS>`,
  `<GLOBAL_CONSTRAINTS>`, the PR's Assumptions section) are the woods-view the
  external system lacks. Not adoptable *from* them; must not be traded away
  *to* them.

## 3. Question: does it avoid burning cycles on its own wake? (trees-for-woods)

The system was visibly burned by review loops policing their own output
("every finding real, none of them shipped") and built machinery we currently
lack:

- **Locus tagging** — every finding tagged `shipped`/`tests`/`checks`/
  `tooling` plus new-this-session. Reported, never scored: "sixteen findings,
  zero in shipped code" is surfaced as the headline of such a round. A locus
  term inside the score is explicitly rejected because it would let a review
  discount its own findings.
- **Production-impact continuation gate** (`review-fix.md` Step 1.4): from
  cycle 2, only a `shipped` runtime-behaviour finding may spawn another
  panel. Everything else is still fixed — in place, each fix verified by its
  own re-run — but does not keep the loop alive.
- **Convergence discipline**: cycle 1 hunts, cycle 2+ verifies a *closed
  list* (each fix restated as a claim to falsify); the unbounded lenses
  (guidelines/prose, test coverage) are excluded from verification cycles
  because they cannot return empty against any diff; two identical
  consecutive rounds stop unconditionally; meta-tests (asserting source
  shape) get a *declared boundary* instead of unbounded mutation
  whack-a-mole.

This is direct medicine for #174 (a recorded 14-round non-convergence)
and #137 (the 3-cycle cliff).

## 4. Question: how deep are the specialists really?

Remit actionability, specialist by specialist:

| Specialist | Actionable? | Evidence |
| --- | --- | --- |
| Guidelines | Yes | must quote the violated CLAUDE.md text verbatim; forbidden to invent unwritten conventions |
| Bug Hunter | Mostly | 9 hunt categories with concrete signals; mandatory concrete failure scenario or drop |
| Architecture & History | Yes | real method: `git log` per file, revert-grep, churn check; `quality-hunt`'s Design Charter adds a counterfactual gate (finding dropped unless it states current shape, alternative, and what becomes easier) |
| Test Coverage | Yes | behavioural coverage, criticality honesty rule |
| Error Handling | Yes | 8-point checklist (silent swallow, lost context, unbounded retry, cleanup on error paths) |
| Claim Auditor | Best in class | evidence gate: verbatim claim + contradicting evidence or command output, else it is not a finding |

**Security is the shallow one.** In `/review` it is Bug Hunter item 5 (one
line: "injection, auth bypass, data exposure, SSRF"). In `bug-hunt`, OWASP
Top 10 is applied at *collation* — the lead agent tags A01–A10 after the
specialist reports — and the security specialist's own brief is a single
sentence. There are no per-category probes: no authz-per-endpoint walk (A01),
no IDOR sweep, no SSRF sink inventory, no session/authn checklist. The
methodology is interpreted at run time, not explained. The crypto overlay
proves the author knows the difference — it is a genuine methodology (nonce
reuse, constant-time comparison, KATs, zeroisation on error paths, plus
verification-rubric adjustments). No overlay of that depth exists for
web/API security or authorisation, the domain the reviewed product actually
occupies. The compensation is `TRIAGE-RUBRIC.md`'s hand-maintained
deployment fact sheet — excellent, but corpus-specific workbench material,
not skill.

**The methodology is part-codified, part-operator.** Cycle-2 in practice ran
lenses the skill does not define — domain (15 output files), financial (8),
data (6), API, privacy, frontend, concurrency — briefed in per-run
`BATCH-*-INSTRUCTIONS.md` files, some referencing the author's home
directory, with the author as named triager in `keith-colleague-review`.
Adopting the skills without codifying those improvised remits would not
reproduce the observed review quality. The reasoning quality lives in the
verification rubric and the operator's steering, not in deep codified
personas.

**Missing from the per-change chain even before new personas are invented:**
concurrency (present in `bug-hunt`'s table, absent from `/review`),
migration/data-safety (colleague-review escalates on `supabase/migrations/**`
but no migration methodology exists anywhere), privacy/PII flow, performance
(explicitly excluded), supply chain (`dep-audit` exists outside the loop),
observability/operability.

**The transferable design rule:** a specialist = detection signals + an
additional hunt list + a domain definition of "adequate testing" + a
**verification-rubric adjustment**. The rubric adjustment is what makes an
overlay a real persona rather than a name — it changes how findings are
scored, not just what is hunted. A specialist that cannot state its rubric
adjustment and a falsifiable hunt list is not ready to ship.

## 5. Question: when is a specialist required? (dispatch proportionality)

Mechanical triggers, all adoptable:

- **Conditional agents**: test-coverage only if testable source changed;
  error-handling only if error paths touched; claim-auditor only if prose
  changed.
- **Overlay detection**: dependency/file-pattern/import signals, or a
  `review-context:` declaration in the repo's context file.
- **Sensitivity ladder** (`keith-colleague-review`): depth by diff size
  (<50 lines: read it yourself; 50–500: core three agents; >500: full
  panel) *overridden* by path sensitivity — auth/roles, migrations,
  unauthenticated endpoints, credentials/tokens/payments force the full
  panel regardless of size.

The sensitivity axis is orthogonal to #158's estimator
(complexity/verifiability) and slots naturally into #159's protected-surfaces
manifest: the estimator prices ceremony; the manifest names the paths where
sensitivity floors it.

## 6. Question: how are findings validated, and does model diversity matter?

Their answer to single-model bias is **execution-backed independent
verification**: fresh verifier agents in fresh provisioned worktrees (never a
reviewer's leftover tree), reproduction preferred over re-reading ("an
agreement reached by reading the same lines is not independent
verification"), deflators for linter-catchable and pedantic findings, plus
`bug-hunt`'s cross-validation (two agents agreeing is signal; contradictions
are flagged as high-signal) and an optional 10% inter-rater calibration
re-score in triage.

Ours is **cross-model panels** + author exclusion + consolidation + human
adjudication. Complementary, not competing: cross-model catches
model-family blind spots; execution-backed verification catches per-finding
falsity by running the claim. pi-sdlc currently has no execution-backed
verification step — the orchestrator adjudicates on prose. The two combine
naturally: verifier model ≠ finder model buys both properties in one
dispatch, and verifier work fits the fast pool (#132, #158's class-keyed
pools — finders strong/frontier and family-diverse, verifiers fast and
family-disjoint from the finder, claim-audit/task-validate fast).

## 7. Adoption slate

**Adopt** (lands in `prompts/adversary-review.prompt.md` and
`references/phase-pr-review.md` §5 unless noted):

1. **Likelihood×impact scoring ladders and a defined blocking threshold.**
   Today our severity is `high|medium|low` with no ladder — severity is
   vibes, and the iron law ("no surviving high/medium") makes inflation
   directly blocking. Defined anchors + "the threshold decides what blocks,
   not what is worth doing" + a `CHEAP` lane attack over-blocking at the
   root.
2. **Execution-backed verification pass** for surviving high/medium findings
   before adjudication; verifier model family ≠ finder family.
3. **Locus tag + production-impact continuation gate + bounded delta
   rounds** → #137/#174. The gate governs *re-dispatch only*, never merge
   eligibility or scoring, exactly as the source system is careful to state —
   otherwise it collides with the iron law.
4. **Sensitivity escalation ladder** feeding panel size/composition, backed
   by a committed sensitive-paths manifest (#159's shape).
5. **Claim-auditor evidence gate** (verbatim claim + cited contradiction,
   else drop) folded into the adversary prompt's code-prose discipline.

**Adapt:**

1. **Context overlays as the specialist mechanism** — one base panel,
   composable domain overlays meeting the crypto-overlay bar (signals + hunt
   list + adequacy definition + rubric adjustment). This is how the existing
   design-artifact personas extend into code artifacts without specialist
   sprawl. The security overlay must be built to real OWASP-probe depth or
   not shipped — a name-drop overlay is worse than none because it claims
   coverage.
2. **Practical-risk triage + deployment fact sheet.** Wrong cost profile
   per-PR; right as a periodic audit lane and backlog triage. The durable
   insight is the fact sheet: reachability scoring requires curated, dated,
   correction-tracked deployment facts (their first pass collapsed — 96% of
   543 rows scored maximum reachability — and was repaired by moving
   frequency to its own factor and grounding the ladder in verified facts).
3. **Crown-jewel promotion** (explicit, reasoned, one band, capped) as the
   counterweight so likelihood-gating never filters low-probability ×
   catastrophic findings.

**Decline:**

1. Same-model panels (cross-model is the one thing their harness cannot do);
   the full `bug-hunt` ceremony as a PR gate (audit tool, wrong cost
   profile); `review-fix`'s autonomy defaults (our human adjudication +
   4-round protocol is stronger governance); operator-personal ergonomics
   (voice rules, named-person triage); objective-blind review framing (keep
   panels grounded in plan/spec/DoD).

## 8. Frictions to design deliberately

- **Pre-human filtering vs adjudication law.** Their 60-threshold filters
  before a human sees findings; our law says nothing is dismissed silently
  and humans adjudicate high/medium dismissals. Resolution: scores *band*
  findings (their filtered list stays visible too); adjudication authority
  stays where pi-sdlc puts it.
- **`CHEAP`-lane scope creep.** Their own rule already bounds it
  (broad-adjacent fixes on cycle 1 only, narrow after); adopt with the same
  bound so Implement scope discipline holds.
- **Verification cost.** One verifier per finding is expensive: batch (they
  batch above 15), verify only what would block, use the fast pool.

## 9. Bottom line

Adopt the scoring, verification, and convergence machinery — it is
battle-tested against precisely the failure modes recorded in #137 and #174.
Adopt the overlay *mechanism* as the shape of code-review personas. Decline
what pi-sdlc already does better: model diversity, objective grounding, and
human-owned adjudication. The external specialists are shallower than the
review output suggests; the transferable pieces are the rubrics, not the
personas.
