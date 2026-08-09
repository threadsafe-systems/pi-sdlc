# Spec: Gate presentation contract (S3)

Status: rev 1 — spec panel pending
Run: gate-presentation-contract · track: irreversible · map: #192
Plan: docs/plans/2026-08-09-gate-presentation-contract.md (rev 5, `5f105fa`)
Origin: map #192 resolution comment (issuecomment-5230679564) + design-amendment
comment (issuecomment-5230580141). This run's upstream brainstorm is the live map
record, so the plan carries the amendment as an index with link + gists — the
contract this spec verifies is the very grammar that decision list uses.

## Vocabulary

| Term | Definition | Binds to |
|---|---|---|
| gate presentation | The durable shape of what the Brainstorm gate presents to the approver: an embedded sketch plus a decisions list | phase-brainstorm.md §8 |
| home | The single location where a decisions list lives verbatim; exactly one per list | phase-plan.md §6a/§6b rules |
| index | Map-mode plan entries: one gist line + link per ticket, never the full list | phase-plan.md §6b |
| thread variant | Map-mode allowance for the home to be a thread reply on the map issue when decisions were ratified as thread comments | phase-plan.md §6b |
| no upstream gate | A standalone Plan's declaration that no brainstorm record exists; live-formed intent is valid under it | phase-plan.md §6a |
| fired-but-skipped | A G4 research trigger that fired but was not followed; must be declared, not silent | phase-brainstorm.md §8, test/gate-presentation.test.js |
| kind name vs subject matter | Boundary rule: line-kind names may appear as an entry's subject but never as its classification; classification lives only at home | phase-plan.md §6b intro |
| contract test | A test that asserts an anchor exists in a governed doc, never restating the rule's substance | test/gate-presentation.test.js |

## Contracts

### C1 Gate-presentation block (§8)

- Signature/shape: one §8 block in `skills/sdlc/references/phase-brainstorm.md`,
  prose guidance + exactly one fenced example showing a sketch and all three
  decision-line kinds; the appetite grammar line appears verbatim in the example.
- Preconditions: phase-brainstorm.md exists and §8 is reachable from the
  Brainstorm gate presentation step.
- Postconditions: an approaching Brainstorm gate has a single normative shape to
  present; the example is copy-pasteable.
- Invariants: exactly one §8 block; the example shows all three kinds; sketch
  guidance says framing, not contractual, throw-away.
- Error semantics: no precedence — there is no parser; the human gate or a panel
  refuses the first violation it sees. At authoring time a missing block or a
  missing kind in the example is a spec defect, not a runtime error.
- Gated by: GPC1, GPC13

### C2 Storage modes (§6a/§6b)

- Signature/shape: rule prose in `skills/sdlc/references/phase-plan.md` deciding
  storage by brainstorm record kind — plain (full list verbatim in the plan)
  vs map (index in the plan, full list once at home), plus the thread variant
  and the no-upstream declaration branch.
- Preconditions: a Plan is being authored from a Brainstorm outcome.
- Postconditions: the full decisions list exists verbatim in exactly one place;
  the plan's entry shape matches its mode.
- Invariants: one home per list; plain is the default; the map branch fires only
  when the upstream record is a map ticket; index entries never classify by kind.
- Error semantics: no precedence — duplicate homes or a missing no-upstream
  declaration are refused by the human gate on sight; no automated ordering.
- Gated by: GPC2, GPC3, GPC4, GPC11

### C3 Decision-line grammar

- Signature/shape: the three line kinds with literal prefixes `appetite:`,
  `decision:`, `rejected:` as written in §8's example; optional `(-> ADR 00NN)`
  suffix on decision/rejected lines.
- Preconditions: a decisions list is being written at home.
- Postconditions: the list is grep-discoverable (estimator hook) and every
  crystallized alternative is present.
- Invariants: exactly one `appetite:` line and it is first; `rejected:` lines
  are unconditional (not gated by the ADR criteria); line prefixes are the only
  classification device.
- Error semantics: a second appetite line or an appetite not first is a defect
  visible on inspection; no machine precedence because no parser is in scope.
- Gated by: GPC5, GPC14

### C4 ADR suffix by reference

- Signature/shape: §8 prose points at system-reference.md Governance (the
  three-criteria bar, lines 268–273) for when a decision merits an ADR; the
  suffix itself is the literal ASCII `(-> ADR 00NN)`.
- Preconditions: C1's §8 block exists.
- Postconditions: the ADR criteria live in exactly one place; §8 never restates
  them; the suffix renders unchanged in issue comments and plan docs.
- Invariants: ASCII-only suffix form; reference-by-pointer, never restatement.
- Error semantics: a restatement of the criteria in §8 is refused at review;
  a unicode arrow is a one-character defect, no precedence involved.
- Gated by: GPC6

### C5 Research triggers (G4)

- Signature/shape: §8 prose naming exactly three triggers — external dependency,
  prior-art claim, cross-repo pattern — and requiring a fired-but-skipped
  declaration for any trigger that fired without research following.
- Preconditions: C1's §8 block exists.
- Postconditions: research is trigger-based, never ceremonial; skipping is
  visible, not silent.
- Invariants: exactly three triggers; a fired-but-skipped trigger is declared in
  the same gate presentation.
- Error semantics: an undeclared skip is refused at the gate when seen; no
  ordering among triggers — they are independent booleans.
- Gated by: GPC7

### C6 Constraints prompt (G7)

- Signature/shape: §8 prose requiring the Brainstorm to ask the human one
  prompt — name constraints or declare `none identified` — and a rule that
  named constraints become decision lines only in a later phase when they
  actually bind.
- Preconditions: C1's §8 block exists.
- Postconditions: constraint capture has a fixed moment and no binding force at
  Brainstorm time.
- Invariants: one prompt, not a battery; `none identified` is a valid complete
  answer; Brainstorm never binds.
- Error semantics: at most one error class — a §8 that lets Brainstorm bind
  constraints, refused at review.
- Gated by: GPC8

### C7 Handoff seams

- Signature/shape: the §4 authoring-skeleton bullet in phase-brainstorm.md
  (pointing at references/spec-artifact-skeleton.md) and the §6b handoff line in
  phase-plan.md (the plan gate presents what the next gate needs).
- Preconditions: C1 and C2 exist.
- Postconditions: the Brainstorm → Plan → Spec chain names its skeleton at both
  joins.
- Invariants: pointers, not restatements of the skeleton's content.
- Error semantics: a missing bullet or handoff line is refused at review; no
  precedence between the two — they are independent surfaces.
- Gated by: GPC9

### C8 Test discipline

- Signature/shape: `test/gate-presentation.test.js` — contract tests that read
  the governed docs and assert anchors (block exists, grammar line present,
  triggers named, pointers present), never restating rule substance.
- Preconditions: the governed docs carry the anchors C1–C7 define.
- Postconditions: anchor drift fails CI; substance stays single-sourced in the
  docs.
- Invariants: no test asserts a rule definition it restates; no new config dial
  appears anywhere.
- Error semantics: a restating test is refused at review (this spec's panel and
  the PR panel), not at runtime.
- Gated by: GPC10, GPC12

## Functional requirements

| FR | Requirement | Binding |
|---|---|---|
| F1 | Define the decision-line grammar once, in §8's example, with the boundary rule for kind names vs subject matter | C1, C3, GPC1, GPC5 |
| F2 | Decide storage by record kind: plain default, map index + home, thread variant, no-upstream declaration | C2, GPC2, GPC3, GPC4 |
| F3 | Keep the ADR bar by reference and the suffix ASCII | C4, GPC6 |
| F4 | Make research trigger-based with declared skips | C5, GPC7 |
| F5 | Give constraint capture one prompt and no binding force at Brainstorm | C6, GPC8 |
| F6 | Enforce with contract tests only — no gate-time parser, no new dial | C8, GPC10, GPC11, GPC12 |

## Non-functional requirements

| Characteristic (ISO 25010) | Stimulus/condition | Response measure | Binding |
|---|---|---|---|
| Maintainability — analysability | #158's future estimator greps the artifact of record for decisions | Every decision line discoverable by literal prefix search, zero parsing | GPC5 |
| Compatibility — co-existence | Both plain and map runs consume the contract | Zero new tooling, scripts, or dependencies; schema file byte-identical to main | GPC11 |
| Maintainability — modularity | A ratified decision is edited after the gate | The edit touches exactly one artifact (the home); no copy to update | GPC3 |
| Usability — appropriateness recognizability | The gate approver reads the presentation | The sketch conveys entities, boundaries, flows, actors at a glance; framing is visibly non-contractual | GPC13 |
| Portability — adaptability | The decisions list travels between plan docs and GitHub comments | Grammar renders unchanged in both: plain ASCII prefixes, no tool-specific syntax | GPC14 |

## Scenarios

Kind tally: 12 mechanical, 2 inspection, 1 carried — 15 total, 80% mechanical.

### GPC1 — §8 block and three-kind example · mechanical

Given: `skills/sdlc/references/phase-brainstorm.md` at HEAD.
When–Then: it contains exactly one §8 block; inside it, exactly one fenced
example shows a sketch and all three decision-line kinds, with the literal
grammar `- appetite: <scale/time/effort>` present; the surrounding prose calls
the sketch framing, not contractual, and throw-away.
Falsify: a second block, a missing kind in the example, a grammar line altered,
or prose making the sketch contractual.

### GPC2 — plain mode is default; §6a branch gated on the declaration · mechanical

Given: `skills/sdlc/references/phase-plan.md` at HEAD.
When–Then: its §6a rule prose states plain mode stores the full decisions list
verbatim in the plan, and that branch applies when the upstream record is not a
map ticket or the plan declares `no upstream gate`; the no-upstream branch
requires the declaration to be present in the plan itself.
Falsify: plain described as anything but the default, or the no-upstream branch
reachable without the declaration.

### GPC3 — map mode: index in plan, full list once at home · mechanical

Given: phase-plan.md at HEAD.
When–Then: its §6b rule prose requires, for map-sourced runs, one gist line +
link per ticket in the plan and the full decisions list verbatim in exactly one
home — the ticket resolution comment; the prose forbids duplicating the full
list into the plan; the intro carries the boundary rule (no line-kind prefix,
no uniform classification of any kind; kind names permitted as subject matter;
classification lives only at home).
Falsify: a rule permitting the full list in both plan and home, a missing
boundary rule, or index grammar that classifies entries by kind.

### GPC4 — thread variant conditions · mechanical

Given: phase-plan.md at HEAD.
When–Then: the thread variant appears in §6b conditioned on the decisions having
been ratified as thread comments on the map issue, and requires index entries
sharing that home to share one comment.
Falsify: the variant unconditional, or usable when decisions were not ratified
in-thread, or permitting one home per entry.

### GPC5 — decision grammar unconditional and ordered · mechanical

Given: the §8 example in phase-brainstorm.md.
When–Then: the example and its rules show exactly one `appetite:` line and it is
the first decision line; `decision:` lines carry a ratified decision with a
one-line why; `rejected:` lines are unconditional — no ADR-criteria gate on
crystallizing a refused alternative.
Falsify: zero or two appetite lines in the normative example, an appetite not
first, or any prose gating `rejected:` lines on the ADR criteria.

### GPC6 — ADR bar by reference, ASCII suffix · mechanical

Given: phase-brainstorm.md §8 and `skills/sdlc/references/system-reference.md`
Governance section.
When–Then: §8 names when a decision merits an ADR by pointing at the Governance
bar in system-reference.md and does not restate the criteria; the suffix form
shown is the literal ASCII `(-> ADR 00NN)`.
Falsify: criteria text restated in §8, or a unicode-arrow suffix form.

### GPC7 — G4 triggers are trigger-based with declared skips · mechanical

Given: phase-brainstorm.md §8 and test/gate-presentation.test.js.
When–Then: §8 names exactly the three triggers (external dependency, prior-art
claim, cross-repo pattern) and requires a fired-but-skipped declaration; the
test asserts both branches — trigger fired and researched, trigger fired but
skipped-with-declaration.
Falsify: a fourth trigger, a missing skip-declaration rule, or a test asserting
only one branch.

### GPC8 — G7 one prompt, none identified, no binding · mechanical

Given: phase-brainstorm.md §8 and test/gate-presentation.test.js.
When–Then: §8 requires asking the human one prompt — name constraints or
declare `none identified` — and states named constraints become decision lines
only in a later phase when they actually bind; the test asserts the
none-identified branch and the no-binding rule.
Falsify: a battery of prompts, `none identified` treated as a failure state, or
prose letting Brainstorm bind constraints.

### GPC9 — handoff seams present · mechanical

Given: phase-brainstorm.md §4 and phase-plan.md §6b.
When–Then: phase-brainstorm.md carries the authoring-skeleton bullet pointing at
references/spec-artifact-skeleton.md, and phase-plan.md carries the handoff line
(the plan gate presents what the next gate needs); both are pointers, not
restatements.
Falsify: a missing bullet or line, or either restating the skeleton's content.

### GPC10 — tests reference anchors, never restate · mechanical

Given: test/gate-presentation.test.js at HEAD.
When–Then: every assertion reads a governed doc and checks for an anchor string
or structural fact named in C1–C7; no assertion embeds a rule definition the doc
already carries (verified by the test file containing no multi-sentence rule
prose copied from the docs).
Falsify: any assertion restating substance — e.g. re-implementing the ADR
criteria or the boundary rule inside the test.

### GPC11 — no new dial, no schema change · mechanical

Given: `schema/sdlc.config.schema.json` at HEAD and at merge-base with main.
When–Then: the file is byte-identical across the branch; no new config key
appears in any governed doc.
Falsify: any diff in the schema file, or a doc introducing a configuration knob.

### GPC12 — corpus green, anchors preserved · mechanical

Given: the branch at the verification point.
When–Then: `npm test` passes in full — including the pre-existing anchor tests
(skill-kernel phase-brainstorm anchors, iteration-disposition suite,
diff-scoped-premises guard) — `scripts/check-references.sh` exits 0, and biome
is clean on touched surfaces.
Falsify: any red test, a broken cross-reference, or a lint finding on a touched
file.

### GPC13 — sketch guidance reads as framing · inspection

Given: the §8 sketch guidance prose in phase-brainstorm.md after T1 lands.
When–Then: at T1's task-close validation, the validator (or owner) judges
whether the guidance captures entities, boundaries, data flows, and actors as
framing — explicitly throw-away and not contractual — matching the ratified
whiteboard framing.
Falsify: guidance that makes the sketch a deliverable, a contract surface, or
something to preserve beyond the plan embed.

### GPC14 — dogfood conformity of this run · inspection

Given: this run's plan (rev 5, `5f105fa`) and the map #192 index entries.
When–Then: at the PR gate, the panel judges whether the run's own artifacts
conform to the finalized contract — plan carries the sketch verbatim + an index
whose gists classify nothing; home is issuecomment-5230679564.
Falsify: an index entry classifying by kind, a duplicated full list, or a
missing home link.

### GPC15 — phase-doc edits stay in declared scope · carried

Carried to: pr_review.
Given: the branch's full diff at PR time.
When–Then: the PR panel verifies every phase-doc edit falls inside the surfaces
C1–C7 declare (phase-brainstorm.md §4/§8, phase-plan.md §6a/§6b, the one new
test file) and that no governed doc outside that set changed.
Falsify: an out-of-scope edit to a governed doc, or a silent change to a frozen
surface.

## Amendments

None at rev 1.
