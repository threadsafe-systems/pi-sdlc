# Plan panel round 1 — adjudication (slug gate-presentation-contract)

Orchestrator: maas-qwen/qwen3.8-max. All findings verified against the tree
before adjudication. Result: **11/11 ACCEPT**, plan rev 2.

## R1-01 (high, gemini) — ACCEPT via rewording, no prompt edit

Verified: `adversary-plan.prompt.md` is FROZEN (test/frozen-surfaces.test.js:29)
and its attack surface D ("Locked decisions: does the plan re-open or
contradict a settled decision without flagging it?") already catches
contradicting or resurrecting a provenance line, because the provenance block
travels inside the plan doc itself (the artifact under review). Fix: In-scope
item 4 keeps the doc-side requirement only (a plan must not contradict a named
decision or resurrect a `rejected:` line without a declared deviation) and
routes enforcement to surface D by reference. No prompt edit; S3 does no
unfreeze/re-freeze dance.

## R1-02 (high, gemini) — ACCEPT

Verified at phase-plan.md:36-38. Fix: rev 2 requires extending §4's first
paragraph enumeration to include the Brainstorm provenance block; DoD 2
asserts both the enumeration and the rule placement.

## R1-03 (high, luna) — ACCEPT

Verified at phase-plan.md:16-19 (standalone needs no committed upstream).
Fix: the rule is qualified — Plans entered from Brainstorm carry the
provenance block; standalone Plans record the live-formed intent in the same
position with an explicit "no upstream gate" declaration. Contract tests
assert both branches.

## R1-04 (medium, gemini+luna) — ACCEPT

Verified at phase-brainstorm.md:33-38. Fix: In-scope item 2 specifies the G4
rewrite: the existing proportional/anti-ceremony sentence stays; named
triggers (external dependency, prior-art claim, cross-repo pattern invoked)
make research-or-declare required only when a trigger fires; outside triggers
no research ceremony; a fired-but-skipped trigger must be declared.

## R1-05 (medium, luna) — ACCEPT

The ratified split (owner Q4 ratification) is: sketch embeds verbatim in BOTH
modes (a gate artifact, belonging to no ticket); only the decisions list
becomes the index in map mode; "full grammar" means the three line kinds,
which live once in the ticket resolution comment. Fix: rev 2 states this
split explicitly in In-scope items 3-4 so "index" cannot be read as covering
the sketch.

## R1-06 (medium, luna) — ACCEPT with phase routing

S1 precedent: literal anchors belong to the Spec phase (separateSpec=true).
Fix: In-scope item 5 enumerates the semantic directions the contract tests
must cover — appetite exactly-one-first, one-line grammar, ASCII `(-> ADR
00NN)` suffix, sketch trigger + absence declaration, store/index split,
standalone exception, ADR-bar reference, no-parser prohibition — and defers
literal anchor definitions to the Spec.

## R1-07 (medium, luna) — ACCEPT

Verified: the three-criteria bar lives at system-reference.md:268-273.
Fix: In-scope item 1 adds preserving the bar BY REFERENCE to that location
(never restated) for both modes, with a contract-test anchor on the reference.

## R1-08 (medium, luna) — ACCEPT

Verified: check-lifecycle.sh wraps check-lifecycle.mjs; the irreversible track
requires artifact.plan + artifact.spec + artifact.build. Fix: DoD 7 names the
exact command and conditions exit 0 on Spec AND Build artifacts being
committed; mid-run partial failures expected (S1 precedent).

## R1-09 (medium, luna) — ACCEPT

Fix: G7 specified as one constraints prompt: the human names the constraints
that shape the design or declares "none identified"; named constraints inform
the design and are recorded as decision lines only when they actually bind;
Brainstorm never binds a constraint itself.

## R1-10 (medium, luna) — ACCEPT

Fix: DoD items 3-9 name exact commands (node --test on the contract file,
npm test, npx biome check with the touched-file set, node
check-references.mjs, bash check-lifecycle.sh with track/slug, ASD19 via full
corpus, git diff main...HEAD for test/fixtures/consumer/).

## R1-11 (low, gemini+luna) — ACCEPT

Transcription drift between the map comment (Unicode →) and the reviewer task
(ASCII ->). Fix: ASCII `(-> ADR 00NN)` pinned as canonical in rev 2's grammar
line; map #192 comment amended to match. Prose arrows elsewhere are
non-normative and untouched.
