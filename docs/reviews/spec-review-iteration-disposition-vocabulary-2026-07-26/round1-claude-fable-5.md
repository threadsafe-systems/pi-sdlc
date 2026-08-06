# spec_review round 1 — anthropic/claude-fable-5:xhigh

Target: `docs/specs/2026-07-26-iteration-disposition-vocabulary.md` @ `c0e8d22`.
Verbatim reviewer output (14 findings).

---

### C3's outbound carry column has no gating scenario — `CARRY-TO-SPEC`/`CARRY-TO-BUILD` can be silently omitted

- severity: high
- confidence: high
- location: spec §3 C3 (line 101–108) vs §5 IDV11/IDV12 (lines 207–208)
- defect: No scenario asserts the outbound carry statements *exist*. IDV11 ("Each outbound carry statement sits within an 'under your configuration' callout / falsified when any states a destination unconditionally") is vacuously satisfied by zero outbound statements, and IDV12 gates only "the four inbound checkpoints". An implementation that writes `phase-plan.md` §5 with the amendment classes (IDV9) and the glossary citation (IDV4) but no `CARRY-TO-SPEC` sentence — and `phase-spec.md` §5 without `CARRY-TO-BUILD` — passes every mechanical scenario in §5.
- evidence: IDV11's falsifier is presence-conditional ("any states a destination unconditionally", spec line 207); IDV12 is explicitly inbound-only (line 208); no other IDV mentions outbound minting. Plan scope items 3–4 require "§5 gains … `CARRY-TO-SPEC` as a legal Plan-panel disposition" and "`CARRY-TO-BUILD`" (docs/plans/2026-07-26-iteration-disposition-vocabulary.md, scope rows 3–4); #174 rec 6's "carry to Spec" half is claimed as instantiated by this slice.
- impact: The headline mechanism of the slice — a Plan panel legally disposing spec-grade findings as carries instead of fix waves — is ungated; the spec's own premise ("Each contract states what normative text must exist, where" + a falsifier per scenario) is unmet for C3's outbound column.
- fix: Add a mechanical scenario (or widen IDV12) asserting `phase-plan.md` §5 contains `CARRY-TO-SPEC` and `phase-spec.md` §5 contains `CARRY-TO-BUILD`, each inside its callout.

### C2 says "Ten additions" over an eleven-row table; IDV5 gates only "ten"

- severity: medium
- confidence: high
- location: spec §3 C2 (lines 78–92) and IDV5 (line 201)
- defect: The C2 table numbers rows 1–10 and then appends an unnumbered eleventh row ("— | 5 | Artifact-inventory self-audit") while the header says "Ten additions" and IDV5 asserts "all ten C2 additions". Read literally, an implementation omitting the artifact-inventory self-audit satisfies IDV5.
- evidence: spec line 78 "Ten additions, distributed across the existing numbered steps"; line 92 the unnumbered `—` row; line 201 IDV5 "contains all ten C2 additions". The plan counted ten by treating trim-the-tail + sub-floor exemption as one item (plan scope item 2, assumption 4 "*derived count — re-check*"); the spec split them into rows 6 and 7, making eleven, without updating the header.
- impact: This is the exact hand-copied-enumeration drift class rev4 of the plan existed to remove (`PLAN-R3-04`, `PLAN-R4-01`), reintroduced in the spec's central contract; the self-audit addition — plan D5's compensation for dropping the mechanical check — has an evadable gate.
- fix: Number the self-audit row 11 (or renumber to a true ten), and make IDV5 say "every row of the C2 table" instead of a count.

### IDV17 forbids what IDV14/IDV16 require — branch-base byte-comparisons need a `git` subprocess

- severity: medium
- confidence: high
- location: spec §5 IDV17 (line 213) vs IDV14 (line 210), IDV16 (line 212), IDV3 (line 199)
- defect: IDV17's falsifier is "any new test spawns a process or exceeds the budget", but IDV14 ("`templates/sdlc-tasks.md` is byte-identical to the branch base") and IDV16 ("No file under … differs from the branch base") are only implementable by comparing against the merge-base — which in this corpus is done by spawning `git` (`execFileSync`). Additionally, the "< 2s whole-suite runtime delta" bound (N2) names no measurement baseline or procedure, so it gates nothing.
- evidence: test/frozen-surfaces.test.js:44–48 implements exactly this comparison via `execFileSync("git", ["-C", repo, "diff", "--name-only", base, "HEAD", …])`; the plan's budget language was "offline greps … no model calls" (plan scope item 9, citing test/phase-references.test.js:4 "Offline grep; no model calls") — the spec hardened "no model calls" into "no subprocess", which the required scenarios cannot satisfy.
- impact: A faithful implementer must either violate IDV17 or reclassify IDV14/IDV16's assertions as "not new tests" by folding them into frozen-surfaces.test.js — a loophole the spec neither names nor permits; and the stated 2s budget cannot fail.
- fix: Change IDV17's prohibition to "no model calls and no network" (permitting local `git` in the existing corpus style) and either name a runtime measurement procedure or mark the 2s figure advisory.

### Plan scope item 11 / DoD 9 (`.pi/sdlc/CONFIG.md` regeneration) silently dropped with no amendment record

- severity: medium
- confidence: high
- location: spec §1, §3, §6 (whole document) vs plan scope item 11 and DoD 9
- defect: The plan's scope item 11 ("Regenerate `.pi/sdlc/CONFIG.md` (currently stale vs `sdlc.config.json`) as its own `chore` commit on this branch") and DoD 9 ("`.pi/sdlc/CONFIG.md` reports `current`") appear nowhere in the spec — no contract, no scenario, no §1-style recorded amendment. Worse, N1's "no … config file changes" reads as forbidding it.
- evidence: `grep -n "CONFIG" docs/specs/2026-07-26-iteration-disposition-vocabulary.md` returns nothing; plan scope table row 11 and DoD 9 verified in docs/plans/2026-07-26-iteration-disposition-vocabulary.md; no `chore` commit exists on the branch (`git log`: bd19184…c0e8d22 are all plan/spec docs commits).
- impact: A spec that demonstrates a recorded class-(b) amendment for one scope change (item 6) while silently dropping another (item 11) fails the plan's DoD at merge and contradicts the audit discipline the slice installs.
- fix: Either add a one-line contract + scenario for the CONFIG.md chore commit, or record its removal/deferral as a second §1 amendment row and reconcile N1's wording.

### The §1 amendment violates the spec's own class-(b) definition — the Plan is not amended "in place"

- severity: medium
- confidence: high
- location: spec §1 vs §3 C4 class (b)
- defect: C4 defines class (b) as "**amend in place**, recording trigger, class, disposition, and author". §1 records the disposition in the *Spec* and explicitly leaves the Plan untouched ("Recorded here rather than by silently editing the Plan"), so the approved Plan retains a scope row (6) naming a nonexistent path and a DoD item (5) requiring content in a file the slice pledges to keep byte-identical — with no marker in the Plan pointing at the amendment.
- evidence: Spec §1 "Recorded here rather than by silently editing the Plan"; C4 "(b) … **amend in place**, recording trigger, class, disposition, and author"; plan scope row 6 names `skills/sdlc/templates/sdlc-tasks.md` (verified nonexistent: `skills/sdlc/` contains only assets/prompts/references/schema/scripts/SKILL.md; templates live at repo root); IDV14 requires `templates/sdlc-tasks.md` byte-identical to base.
- impact: The slice's flagship live demonstration of its own amendment vocabulary contradicts the definition it is freezing: a later reader of the approved Plan alone sees a false scope row and DoD item with no disposition trail — the exact failure mode (case channel-presence rev5) the plan cites as motivating evidence.
- fix: Either amend the Plan in place with a one-line pointer to this disposition table, or amend C4(b)'s definition to state where the amendment record may live when the artifact is upstream of the recording phase.

### Ratified-collision escalation contradicts §5's existing "Only … escalate" sentence, and no reconciling clause is specified

- severity: medium
- confidence: high
- location: spec §3 C2 row 4 vs skills/sdlc/references/phase-pr-review.md:205–207
- defect: C2 adds a mandatory escalation trigger ("a finding contradicting an owner-ratified decision escalates; it is never absorbed") into step 4, but the existing step-4 text says "**Only** proposed dismissals of high or medium findings — plus anything touching a previously human-ratified residual-risk boundary — escalate". A ratified-collision finding is neither of those. The spec added a §1 bridging clause for exactly this class of conflict (floors vs sub-floor exemption) but specifies no amendment to the "Only" sentence.
- evidence: phase-pr-review.md:205–207 quoted above; spec C2 row 4 and the "§1 bridging clause" paragraph (which reconciles only the floors conflict).
- impact: Post-implementation, §5 will contain two normative sentences that contradict each other on when escalation is permitted — a document-internal contradiction of the kind plan DoD 13 forbids, in the reference this slice most heavily edits; IDV5 cannot catch it since both sentences are present.
- fix: Add to C2 (or the bridging-clause paragraph) an explicit amendment of the "Only … escalate" sentence to include ratified-decision collisions.

### Glossary noun "defect class" vs the file's literal phrase "finding class" — no bridge, so the binds-forward key is unfindable by grep

- severity: medium
- confidence: high
- location: spec §2 (Defect class row) vs skills/sdlc/references/phase-pr-review.md:211, 217
- defect: The spec asserts `phase-pr-review.md:209-217` "keys the binds-forward dismissal bar on [defect class]", but that text twice uses the phrase "finding class", not "defect class". No C2 addition renames or aliases it, and IDV2 only checks the glossary defines "defect class". Shipped as specified, the mechanics reference uses a term the glossary never defines, and the glossary defines a term the mechanics never use.
- evidence: phase-pr-review.md:211 "do not re-litigate the same finding class"; :217 "any hit on the same finding class"; spec §2 "**Pre-existing** — `phase-pr-review.md:209-217` keys the binds-forward dismissal bar on it."
- impact: D12 was minted (PLAN-R2-03, high) precisely to stop two names attaching to this one concept; the spec re-creates the split in the opposite direction — an agent following the glossary and grepping consolidated files or the reference for "defect class" finds nothing.
- fix: Add a one-line alias in the glossary definition ("also written 'finding class' in `phase-pr-review.md` §5") or a C2 micro-amendment aligning the two occurrences, gated by a phrase in IDV2/IDV5.

### Id-format prefix is underivable — `<panelPhase>` values are `plan_review`/`spec_review`/`pr_review`, the example is `PLAN`

- severity: medium
- confidence: high
- location: spec §2 "Id format" (line 47) and C2 row 2 (line 83)
- defect: The format is `<panelPhase>-R<round>-<nn>` with the example `PLAN-R2-03`, but the framework's panel-phase vocabulary is `plan_review | spec_review | pr_review | task_validate`; no mapping to the `PLAN`-style token is stated. A pr_review consolidation cannot mechanically decide between `PR_REVIEW-R1-01`, `PR-R1-01`, and `REVIEW-R1-01` — and `REOPENED(<id>)` resolution depends on the ids being predictable.
- evidence: phase-pr-review.md §5 step 1: `scripts/resolve-panel.sh <plan_review|spec_review|pr_review|task_validate>`; spec line 47 example `PLAN-R2-03`; the run's own consolidated.md uses `PLAN-R<n>-<nn>` with no stated derivation rule.
- impact: The id is a frozen shape ("the handle `REOPENED(<id>)` resolves against"); an ambiguous prefix rule freezes wrong — two sessions in one run can mint differently-prefixed ids for the same panel phase, breaking reopen resolution and IDV2's "id format" check is satisfiable by any reading.
- fix: State the closed prefix mapping (`plan_review→PLAN`, `spec_review→SPEC`, `pr_review→PR`) in the glossary term.

### "Barred" is a disposition-shaped outcome with no value in the closed disposition set

- severity: medium
- confidence: high
- location: spec §2 "Reopen evidence bar" and C2 row 3
- defect: A reopen failing the evidence bar "is recorded as barred", and every consolidated row must carry a disposition from the closed set `incorporated | dismissed | CARRY-TO-<dest> | escalated` — but "barred" is none of these, and the spec doesn't say which disposition a barred reopen's row records. The vocabulary freezes with a mandatory record whose required field has no legal value for one of the slice's own named outcomes.
- evidence: spec §2 disposition set (four values); "the adjudicator records it as barred rather than re-arguing it"; "Finding record shape. Every consolidated finding row carries: … disposition …"; C2 row 3 "a reopen failing the evidence bar is recorded as barred".
- impact: Irreversible-track vocabulary: once consolidated.md rows bind to the four-value set, retrofitting a fifth value (or an aliasing rule) is a breaking change to the record shape; agents will improvise inconsistently at exactly the adjudication moment the slice standardises.
- fix: Either add `barred` to the disposition set or state that a barred reopen records disposition `dismissed` with reason "reopen barred: no new evidence".

### §2 and C1 route "carry destinations" to C7 (frozen surfaces); the correct contract is C3

- severity: medium
- confidence: high
- location: spec lines 54 and 68–69
- defect: "**Carry destinations and the no-orphan rule.** §3, C7" and C1's content list "the carry destinations (C7)" both point at C7 — which is "Frozen-surface handling". The carry destinations and no-orphan rule live in C3.
- evidence: spec line 54, lines 68–69; §3 heading map: C3 = "Carry dispositions per phase" (line 99), C7 = "Frozen-surface handling" (line 165).
- impact: C1's normative content specification — what the glossary must contain — is defined by reference to the wrong contract, twice; an implementer following it literally builds the glossary's carry-destination section against the frozen-surface contract. Same hand-copied-pointer drift class the plan's rev4 removed.
- fix: Change both pointers from C7 to C3.

### IDV21 is labeled `mechanical` while defining itself as no-test; the coverage count is wrong under the table's own labels

- severity: medium
- confidence: high
- location: spec §5 IDV21 (line 217) and the coverage line (line 221)
- defect: §5 defines `mechanical` as "a test decides it", yet IDV21 says "**Verified in this slice's diff only — no standing test**" while carrying kind `mechanical`. Counting the table's labels gives 20 mechanical / 3 inspection; the coverage line claims "19 mechanical, 4 inspection" — consistent only if IDV21 is silently reclassified.
- evidence: spec line 194 "Kind: **mechanical** (a test decides it) or **inspection** (a human/panel decides it at a named point)"; line 217; line 221; label count: IDV1–17, 19, 21, 23 mechanical (20); IDV18, 20, 22 inspection (3).
- impact: The kind taxonomy is a contract S1 will consume ("scenario kind labels" are S1's, built on this vocabulary); a scenario whose kind is false in the very spec that introduces the discipline is a credibility and precedent defect, and the coverage claim is arithmetically false.
- fix: Give IDV21 a third kind (e.g. `diff-inspection (this slice's PR panel)`) or relabel it `inspection`, and correct the coverage counts.

### C6's mandatory origin tag has no home in the prompts' STRICT output formats

- severity: medium
- confidence: high
- location: spec §3 C6 item 1 vs skills/sdlc/prompts/adversary-{plan,spec,review}.prompt.md output-format sections
- defect: The delta-round law requires "tag every finding `NEW` or `REOPENED(<prior-id>)`", but all three prompts carry STRICT output formats enumerating exact per-finding fields (severity/confidence/location/… ; adversary-review adds "Return ONLY a markdown list of findings, nothing else") with no origin field. The spec doesn't say whether the tag is a new field, amends the format block, or rides in the title — an implementer must guess, and a format-compliant reviewer can legally omit tags.
- evidence: adversary-review.prompt.md "Output format (STRICT) / Return ONLY a markdown list of findings, nothing else" with a closed field list; adversary-plan/spec "Output format (STRICT: markdown only, findings only…)" with closed field lists; C6 adds the law "as static text in the prompt body" only; IDV15 "checks presence, not identity".
- impact: The record shape's origin-tag field (§2) is populated from reviewer output; leaving its serialization unspecified against a "STRICT … nothing else" format means the tagging contract and the format contract contradict, and IDV15 passes either way.
- fix: Specify that each prompt's output format gains an `origin:` field (or an equivalent stated serialization) as part of the delta-round-law addition.

### C3 names no section for `phase-implement.md`, making IDV12's "wrong section" falsifier vacuous there

- severity: low
- confidence: high
- location: spec §3 C3 row 4 (line 106) vs IDV12 (line 208)
- defect: Every other C3 row pins a section (§5, §5, §8, §5); the `phase-implement.md` row names only the file, yet IDV12 claims each inbound checkpoint "appear[s] in their named reference and section" with falsifier "any missing or in the wrong section". With nine frozen headings (test/phase-references.test.js:20–30) the placement is load-bearing and the implementer must guess between §4 (dialogue/assumptions), §5 (validator seam), and §8 (completion evidence).
- evidence: spec line 106 "| `phase-implement.md` | — | `CARRY-TO-IMPLEMENT` | **task close** |"; plan scope 5b says it "lands in the receiving task's checks or the Assumptions appendix" without naming a section either.
- impact: One of the four inbound checkpoints has an unenforceable half of its scenario and an unspecified home in a frozen-heading document.
- fix: Name the section (e.g. §4, beside the Assumptions-appendix text at phase-implement.md:61–65) in C3 and IDV12.

### A mechanically countable budget (glossary ≤ 60 lines) is gated only by panel judgement

- severity: low
- confidence: high
- location: spec §3 C1 "Budget", N3, IDV18 (lines 186, 214)
- defect: "≤ 60 lines" is a hard numeric bound trivially checkable by the same offline-grep corpus, but its only scenario is IDV18 (inspection), whose falsifier is "panel judges either false" — so a 75-line glossary can pass if a panel shrugs, making the stated number decorative rather than contractual.
- evidence: spec line 74 "Budget: ≤ 60 lines (Plan assumption 1)"; N3/IDV18 bind it to inspection only; the plan stated it as a soft "target under ~60 lines" (assumption 1) — the spec hardened the number without hardening the gate.
- impact: Either the bound is real (then it needs a mechanical scenario) or it is a target (then "≤" over-claims); as written the spec claims more than its verification machinery gates.
- fix: Either add the line count to a mechanical scenario or restate the budget as the plan's "target ~60, judged at IDV18".
CLEAR: (c) — verified every cross-file reference to `system-reference.md` sections by number (§5, §9, §11, §12, §13, §14 in SKILL.md, phase refs, plans, briefs, test/docs.test.js RB3, test/system-reference.test.js SECTIONS, test/startup-freshness.test.js) targets §≤14 and is presence-based, not count- or last-section-based; appending §15 breaks nothing.
