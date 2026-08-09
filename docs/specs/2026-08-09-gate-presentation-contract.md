# Spec: Gate presentation contract (S3)

Status: rev 4 — spec panel round 3 all-incorporated (SPEC-R3-01..03, see
docs/reviews/spec-review-gate-presentation-contract-2026-08-09/).
Run: gate-presentation-contract · track: irreversible · map: #192
Plan: docs/plans/2026-08-09-gate-presentation-contract.md (rev 5, `1dd6211`)
Origin: map #192 resolution comment (issuecomment-5230679564) + design-amendment
comment (issuecomment-5230580141). This run's upstream brainstorm is the live map
record, so the plan carries the amendment as an index with link + gists — the
contract this spec verifies is the very grammar that decision list uses.

## Vocabulary

| Term | Definition | Binds to |
|---|---|---|
| gate presentation | The durable shape of what the Brainstorm gate presents to the approver: an embedded sketch plus a decisions list | phase-brainstorm.md §8 |
| dialogue moves | The named Brainstorm conversational moves — problem/outcome opening (G1), alternative-or-declare (G2), appetite-before-converging (G3), research-or-declare (G4), one constraints prompt (G7) | phase-brainstorm.md §1 |
| home | The single location where a decisions list lives verbatim; exactly one per list | phase-brainstorm.md §9 |
| index | Map-mode plan entries: one gist line + link per ticket, never the full list | phase-plan.md §4 |
| thread variant | Map-mode allowance for the home to be a thread reply on the map issue when decisions were ratified as thread comments | phase-brainstorm.md §9 |
| no upstream gate | A standalone Plan's declaration that no brainstorm record exists; live-formed intent is valid under it | phase-plan.md §4 |
| fired-but-skipped | A G4 research trigger that fired but was not followed; must be declared, not silent | phase-brainstorm.md §1, test/gate-presentation-contract.test.js |
| kind name vs subject matter | Boundary rule: line-kind names may appear as an entry's subject but never as its classification; classification lives only at home | phase-brainstorm.md §9, phase-plan.md §4 |
| contract test | A test that asserts an anchor exists in a governed doc, never restating the rule's substance | test/gate-presentation-contract.test.js |

## Contracts

### C1 Gate-presentation block (§8)

- Signature/shape: one §8 block in `skills/sdlc/references/phase-brainstorm.md`,
  titled **The gate presentation**: the two-artifact requirement (sketch +
  decisions list), the three-kind grammar with exactly one fenced example
  showing all three line kinds, the sketch trigger (new flow or ≥3 interacting
  components) with the absence declaration (absence declared at the gate), the
  amendment loop (human speaks, agent updates, amended list lands), and the
  transition (the plan carries the provenance).
- Preconditions: phase-brainstorm.md exists and §8 is reachable from the
  Brainstorm gate presentation step.
- Postconditions: an approaching Brainstorm gate has a single normative shape to
  present; the example is copy-pasteable; a sketch's absence is declared, never
  silent.
- Invariants: exactly one §8 block; the example shows all three kinds; sketch
  guidance says framing, not contractual, throw-away.
- Error semantics: no precedence — there is no parser; the human gate or a panel
  refuses the first violation it sees. At authoring time a missing block or a
  missing kind in the example is a spec defect, not a runtime error.
- Gated by: GPC1, GPC17, GPC13

### C2 Storage rule (phase-plan.md §4)

- Signature/shape: rule prose in `skills/sdlc/references/phase-plan.md` §4 —
  the first paragraph's section enumeration gains the Brainstorm provenance
  block, and the rule sits between the first paragraph and **Dialogue
  discipline.** The rule: Plans entered from Brainstorm open with the
  provenance block (the gate sketch when one exists, then the decisions list —
  store in plain mode, index in map mode); standalone Plans (`sdlc:plan`, no
  committed upstream) record the live-formed intent in the same position with
  an explicit `no upstream gate` declaration. The rule also states that a plan
  must not contradict a named decision or resurrect a `rejected:` line without
  a declared deviation; enforcement rides the plan panel's existing attack
  surface D (locked decisions) in `prompts/adversary-plan.prompt.md` — by
  reference, never restated, and the prompt stays untouched.
- Preconditions: a Plan is being authored — either from a Brainstorm outcome or
  standalone, with live-formed intent and the explicit `no upstream gate`
  declaration.
- Postconditions: the plan's opening block shape matches its mode; a standalone
  plan's live-formed intent is visible at the top.
- Invariants: plain is the default; the map branch fires only when the upstream
  record is a map ticket; the standalone branch is reachable only with the
  declaration; index entries never classify by kind (boundary rule).
- Error semantics: no precedence — a missing declaration or a mode mismatch is
  refused by the human gate on sight; no automated ordering.
- Gated by: GPC2

### C3 Decision-line grammar

- Signature/shape: the three line kinds with literal prefixes `appetite:`,
  `decision:`, `rejected:` as written in §8's example; the suffix
  `(-> ADR 00NN)` in literal ASCII on any decision or rejected line that
  qualifies under the Governance bar.
- Preconditions: a decisions list is being written at home.
- Postconditions: the list is grep-discoverable (estimator hook) and every
  crystallized alternative is present.
- Invariants: exactly one `appetite:` line and it is first; every entry is one
  physical line; `rejected:` lines are unconditional (not gated by the ADR
  criteria); line prefixes are the only classification device.
- Error semantics: a second appetite line, an appetite not first, or a
  multiline entry is a defect visible on inspection; no machine precedence
  because no parser is in scope.
- Gated by: GPC5, GPC14

### C4 ADR suffix by reference

- Signature/shape: §8 prose points at system-reference.md Governance (the
  three-criteria bar, lines 268–273) for when a decision merits an ADR, and
  states that qualifying decisions take the suffix; the suffix itself is the
  literal ASCII `(-> ADR 00NN)`.
- Preconditions: C1's §8 block exists.
- Postconditions: the ADR criteria live in exactly one place; §8 never restates
  them; the suffix requirement is conditional on the bar and renders unchanged
  in issue comments and plan docs.
- Invariants: ASCII-only suffix form; reference-by-pointer, never restatement;
  the suffix is required whenever the bar applies, never free-standing.
- Error semantics: a restatement of the criteria in §8 is refused at review;
  a unicode arrow is a one-character defect, no precedence involved.
- Gated by: GPC6

### C5 Research move (G4, §1)

- Signature/shape: phase-brainstorm.md §1's tools bullet naming the
  research-or-declare move with exactly three triggers — external dependency,
  prior-art claim, cross-repo pattern invoked — required only when a trigger
  fires; the proportional/not-mandatory-ceremony sentence stays; a
  fired-but-skipped trigger must be declared.
- Preconditions: C10's §1 moves exist.
- Postconditions: research is trigger-based, never ceremonial; skipping is
  visible, not silent.
- Invariants: exactly three triggers; outside triggers there is no research
  ceremony; a fired-but-skipped trigger is declared in the same gate
  presentation.
- Error semantics: an undeclared skip is refused at the gate when seen; no
  ordering among triggers — they are independent booleans.
- Gated by: GPC7

### C6 Constraints prompt (G7, §1)

- Signature/shape: phase-brainstorm.md §1 naming the one-prompt move — ask the
  human to name the constraints that shape the design, or declare
  `none identified` — with the rule that named constraints inform the design
  and become decision lines only when they actually bind.
- Preconditions: C10's §1 moves exist.
- Postconditions: constraint capture has a fixed moment and no binding force at
  Brainstorm time.
- Invariants: one prompt, not a battery; `none identified` is a valid complete
  answer; Brainstorm never binds a constraint itself.
- Error semantics: at most one error class — §1 prose that lets Brainstorm bind
  constraints, refused at review.
- Gated by: GPC8

### C8 Test discipline

- Signature/shape: `test/gate-presentation-contract.test.js` — contract tests
  that read the governed docs and assert anchors (block exists, grammar line
  present, triggers named, pointers present), never restating rule substance;
  no new configuration dial anywhere.
- Preconditions: the governed docs carry the anchors C1–C6 and C9–C10 define.
- Postconditions: anchor drift fails CI; substance stays single-sourced in the
  docs; no runtime grammar machinery exists anywhere.
- Invariants: no test embeds a verbatim substring of ≥80 characters from any
  governed doc; no new config dial; no new tooling, dependency, or script.
- Error semantics: a restating test or a new dial is refused at review (this
  spec's panel and the PR panel), not at runtime.
- Gated by: GPC10, GPC11, GPC12, GPC15

### C9 Map-mode provenance split (§9)

- Signature/shape: phase-brainstorm.md §9 stating: the sketch embeds verbatim
  in the plan in both modes (a gate artifact, belonging to no ticket); only
  the decisions list becomes the index (named links, gist lines); the
  resolution comment is the single home of the full grammar — a decision
  ticket's resolution comment or, thread variant, a comment in the map thread
  when decisions are ratified there; entries sharing a comment share one home;
  the boundary rule (no line-kind prefix, no uniform classification of any
  kind; kind names permitted as subject matter; classification lives only at
  home).
- Preconditions: the run is map-sourced; C1's §8 block exists.
- Postconditions: the full decisions list exists verbatim in exactly one place;
  the plan's map-mode entries are gists with named links.
- Invariants: one home per list; the sketch never becomes a ticket artifact;
  the plan never duplicates the full list.
- Error semantics: duplicate homes or a duplicated full list are refused by the
  human gate on sight; no automated ordering.
- Gated by: GPC3, GPC4, GPC18, GPC14

### C10 Dialogue moves (§1)

- Signature/shape: phase-brainstorm.md §1 naming the moves — problem/outcome
  opening that names no mechanism (G1), alternative-or-declare (G2), appetite
  elicited before converging (G3) — alongside the G4 and G7 moves of C5 and
  C6.
- Preconditions: phase-brainstorm.md exists.
- Postconditions: the dialogue discipline has named, greppable moves; DoD 1's
  "§1 moves present" is checkable.
- Invariants: G1 names no mechanism; G3 precedes convergence; moves are named,
  not scripted.
- Error semantics: a missing move name is refused at review; no precedence
  among moves.
- Gated by: GPC16

## Functional requirements

| FR | Requirement | Binding |
|---|---|---|
| F1 | Define the decision-line grammar once, in §8's example, with one-line entries and the conditional ASCII ADR suffix | C1, C3, C4, GPC1, GPC5, GPC6 |
| F2 | Decide storage by record kind: §4 rule (plain default, map index, standalone declaration) + §9 split (home, thread variant, sketch in both modes) | C2, C9, GPC2, GPC3, GPC4, GPC18 |
| F3 | Keep the ADR bar by reference, never restated | C4, GPC6 |
| F4 | Make research trigger-based with declared skips, in §1 | C5, GPC7 |
| F5 | Give constraint capture one prompt and no binding force at Brainstorm, in §1 | C6, GPC8 |
| F6 | Name the dialogue moves G1–G3 in §1 | C10, GPC16 |
| F7 | Enforce with contract tests only — no gate-time parser, no new dial, no new tooling | C8, GPC10, GPC11, GPC12, GPC15 |

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
|---|---|---|---|
| Maintainability — analysability | #158's future estimator greps the artifact of record for decisions | Every decision line discoverable by literal one-line prefix search, zero parsing | GPC5 |
| Compatibility — co-existence | Both plain and map runs consume the contract | Zero new dials, dependencies, scripts, or tooling — verified by manifest and file-surface diff against merge-base | GPC11 |
| Maintainability — modularity | A ratified decision is edited after the gate | The rule prose asserts exactly one home per list and forbids copies elsewhere | GPC3 |
| Usability — appropriateness recognizability | The gate approver reads the presentation | The sketch conveys entities, boundaries, flows, actors at a glance; framing is visibly non-contractual | GPC13 |
| Portability — adaptability | The decisions list travels between plan docs and GitHub comments | Grammar renders unchanged in both: plain ASCII prefixes, no tool-specific syntax | GPC14 |

## Scenarios

Kind tally: 14 mechanical, 2 inspection, 1 carried — 17 total, 82% mechanical.

### GPC1 — §8 block and three-kind example · mechanical

Given: `skills/sdlc/references/phase-brainstorm.md` at HEAD.
When–Then: it contains exactly one §8 block titled **The gate presentation**;
inside it, exactly one fenced example shows a sketch and all three
decision-line kinds, with the literal grammar `- appetite: <scale/time/effort>`
present; §8 states the gate presentation is exactly two artifacts (sketch +
decisions list) and names no third contractual artifact or recap block.
Falsify: a second block, a missing kind in the example, a grammar line
altered, or §8 requiring a third artifact or a prose recap block.

### GPC2 — §4 storage rule: plain default, map index, standalone declaration · mechanical

Given: `skills/sdlc/references/phase-plan.md` at HEAD.
When–Then: its §4 first-paragraph section enumeration includes the Brainstorm
provenance block; a rule between the first paragraph and **Dialogue
discipline.** states that plans entered from Brainstorm open with the
provenance block (sketch when one exists, then decisions list — store in plain
mode, index in map mode), that plain is the default, and that standalone plans
record live-formed intent with an explicit `no upstream gate` declaration;
the same §4 rule also states that a plan must not contradict a named decision
or resurrect a `rejected:` line without a declared deviation, routing
enforcement to the plan panel's attack surface D by reference.
Falsify: the enumeration unchanged, plain described as anything but the
default, the standalone branch reachable without the declaration, or the
no-contradiction/no-resurrection statement missing from §4.

### GPC3 — §9 one home, no duplication · mechanical

Given: `skills/sdlc/references/phase-brainstorm.md` §9 at HEAD.
When–Then: §9 requires, for map-sourced runs, one gist line + named link per
ticket in the plan and the full decisions list verbatim in exactly one home —
the resolution comment; §9 forbids duplicating the full list into the plan and
carries the boundary rule (no line-kind prefix, no uniform classification of
any kind; kind names permitted as subject matter; classification lives only at
home).
Falsify: a rule permitting the full list in both plan and home, a missing
boundary rule, or index grammar that classifies entries by kind.

### GPC4 — thread variant conditions · mechanical

Given: phase-brainstorm.md §9 at HEAD.
When–Then: the thread variant appears in §9 conditioned on the decisions having
been ratified as thread comments on the map issue, and requires entries
sharing that comment to share one home.
Falsify: the variant unconditional, usable when decisions were not ratified
in-thread, or permitting one home per entry.

### GPC5 — decision grammar ordered and one-line · mechanical

Given: the §8 example in phase-brainstorm.md.
When–Then: the example and its rules show exactly one `appetite:` line and it is
the first decision line; every entry of all three kinds is one physical line;
`decision:` lines carry a ratified decision with a one-line why; `rejected:`
lines are unconditional — no ADR-criteria gate on crystallizing a refused
alternative.
Falsify: zero or two appetite lines in the normative example, an appetite not
first, a multiline entry of any kind, or any prose gating `rejected:` lines on
the ADR criteria.

### GPC6 — ADR bar by reference, conditional ASCII suffix · mechanical

Given: phase-brainstorm.md §8 and `skills/sdlc/references/system-reference.md`
Governance section.
When–Then: §8 names when a decision merits an ADR by pointing at the Governance
bar in system-reference.md, does not restate the criteria, and states that
qualifying decisions take the suffix; the suffix form shown is the literal
ASCII `(-> ADR 00NN)`.
Falsify: criteria text restated in §8, a unicode-arrow suffix form, or the
suffix presented as unconditional or as freely omittable.

### GPC7 — G4 triggers in §1 with declared skips · mechanical

Given: phase-brainstorm.md §1 and test/gate-presentation-contract.test.js.
When–Then: §1's tools bullet names exactly the three triggers (external
dependency, prior-art claim, cross-repo pattern invoked), keeps the
proportional/not-mandatory-ceremony sentence, and requires a fired-but-skipped
declaration; the test asserts both branches — trigger fired and researched,
trigger fired but skipped-with-declaration.
Falsify: a fourth trigger, the ceremony sentence removed, a missing
skip-declaration rule, or a test asserting only one branch.

### GPC8 — G7 one prompt in §1, none identified, no binding · mechanical

Given: phase-brainstorm.md §1 and test/gate-presentation-contract.test.js.
When–Then: §1 names the one-prompt move — name constraints or declare
`none identified` — and states named constraints become decision lines only
when they actually bind; the test asserts the none-identified branch and the
no-binding rule.
Falsify: a battery of prompts, `none identified` treated as a failure state,
or prose letting Brainstorm bind constraints.

### GPC10 — tests anchor-only, bounded restatement · mechanical

Given: test/gate-presentation-contract.test.js at HEAD.
When–Then: every assertion reads a governed doc and checks for an anchor string
or structural fact named in C1–C6 and C9–C10; the test file contains no
contiguous substring of ≥80 characters that appears in any governed doc.
Falsify: any ≥80-character verbatim substring from a governed doc inside the
test file.

### GPC11 — no new dial, dependency, script, or schema change · mechanical

Given: the branch at the verification point and its merge-base with main.
When–Then: `sdlc.config.schema.json` (wherever the schema lives at HEAD),
`package.json`, and `package-lock.json` are byte-identical to merge-base; the
branch adds no file under `skills/sdlc/scripts/`; no governed doc introduces
a configuration knob.
Falsify: any diff in those manifests, a new script, or a doc introducing a
configuration knob.

### GPC12 — corpus green, anchors preserved · mechanical

Given: the branch at the verification point.
When–Then: `node --test test/gate-presentation-contract.test.js` runs offline
and completes in under 1 second; `npm test` passes in full within the plan's
30-second external budget — including the pre-existing anchor tests
(skill-kernel phase-brainstorm anchors, iteration-disposition suite,
diff-scoped-premises guard) — `node skills/sdlc/scripts/check-references.mjs`
exits 0, and `npx biome check` is clean on the touched-file set.
Falsify: any red test, a contract-test run reaching the network or exceeding
one second, a corpus run exceeding the budget, a broken cross-reference, or a
lint finding on a touched file.

### GPC13 — sketch guidance reads as framing · inspection

Given: the §8 sketch guidance prose in phase-brainstorm.md after the §8 rebuild
lands.
When–Then: at the PR gate, the PR panel judges whether the guidance captures
entities, boundaries, data flows, and actors as framing — explicitly
throw-away and not contractual — matching the ratified whiteboard framing. The
inspection lives at the PR gate because phase-implement.md §5 defines the
per-task validator as a checklist executor, not a judge, with judgement review
happening later at the PR panel.
Falsify: guidance that makes the sketch a deliverable, a contract surface, or
something to preserve beyond the plan embed.

### GPC14 — dogfood conformity of this run against home · inspection

Given: this run's plan (rev 5, `1dd6211`), the map #192 index entries, and the
canonical home body (issuecomment-5230679564).
When–Then: at the PR gate, the panel compares the plan's embedded sketch and
its index against the home body — the sketch byte-for-byte, the full grammar
present once at home, gists classifying nothing, home link present.
Falsify: a sketch in the plan differing from home's, an index entry
classifying by kind, a duplicated full list, a stale list, or a missing home
link.

### GPC15 — phase-doc edits stay in declared scope · carried

Carried to: pr_review.
Given: the branch's full diff at PR time.
When–Then: the PR panel verifies every phase-doc edit falls inside the
surfaces C1–C6, C8, and C9–C10 declare (phase-brainstorm.md §1/§8/§9,
phase-plan.md §4, the one new test file) and that no governed doc outside
that set changed, no frozen surface changed, no parser or runtime grammar
machinery was added anywhere, and `git diff main...HEAD --
test/fixtures/consumer/` is empty. Lifecycle artifacts — this spec, the plan
doc (docs/plans/2026-08-09-gate-presentation-contract.md), the build plan,
the review records under docs/reviews/, and task receipts — are expected in
the diff and exempt from the surface check.
Falsify: an out-of-scope phase-doc or governed-doc edit, a silent
frozen-surface change, any new parsing machinery, or a consumer-fixture diff.

### GPC16 — §1 dialogue moves named · mechanical

Given: phase-brainstorm.md §1 at HEAD.
When–Then: §1 names the moves — a problem/outcome opening that names no
mechanism (G1), alternative-or-declare (G2), and appetite elicited before
converging (G3) — alongside the G4 and G7 moves.
Falsify: any of G1–G3 absent, G1 naming a mechanism, or appetite elicited only
after convergence.

### GPC17 — §8 names trigger, absence, amendment loop, transition · mechanical

Given: phase-brainstorm.md §8 at HEAD.
When–Then: §8 states the sketch trigger (new flow or ≥3 interacting
components), requires the absence declaration when no sketch exists, names
the amendment loop (human speaks, agent updates, amended list lands), and
states the transition (the plan carries the provenance).
Falsify: any of the four unnamed, or the trigger condition altered.

### GPC18 — sketch embeds in both modes · mechanical

Given: phase-brainstorm.md §9 at HEAD.
When–Then: §9 states the sketch embeds verbatim in the plan in both plain and
map modes, as a gate artifact belonging to no ticket; only the decisions list
becomes the index.
Falsify: the sketch omitted from one mode's embed rule, or the sketch made a
ticket artifact.

## Amendments

None at rev 3.
