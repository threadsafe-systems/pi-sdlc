# Spec review — docs/specs/2026-08-14-plan-artifact-skeleton.md (rev 1, commit 2b521ff)

All findings NEW this round. Grounding verified before judging: L1/L2 byte-match the current `adversary-plan.prompt.md` Delta-rounds and Output-format sections (programmatic compare, trailing newline normalized); L3 equals the current `FROZEN` array minus `adversary-plan.prompt.md`, in order (17→16); the five canonical rule sentences match the approved plan's binding rules verbatim; GPC2's pinned literal is exactly `assert.match(planSec4f, /the prompt itself stays untouched/)` at test/gate-presentation-contract.test.js:309 and GPC10 is the ≥80-char-window bound at :324-334; S1's M5 count pin is `81` at test/spec-artifact-skeleton.test.js:99 against a current 81-row inventory; `skills/sdlc/references/*.md` is a discovery root (inverse completeness confirmed via a passing `check-references.mjs` run); the extraction goldens stamp from the consumer override (`test/fixtures/consumer/.pi/sdlc/prompts/adversary-plan.prompt.md` exists; S4 stamps with `--config consumer`); `check-lifecycle.sh` supports `--track T [--slug S]`; the gate-presentation spec's Amendments section at docs/specs/2026-08-09-gate-presentation-contract.md:407-409 reads "None at rev 3."; the 66-character count of the replacement pin is correct.

### NEW — "FS19" is an unresolvable internal id frozen into shipped §4 prose and pinned by GPC2

- severity: medium
- confidence: high
- location: spec C8 Signature/shape edit 1 (docs/specs/2026-08-14-plan-artifact-skeleton.md:210); Vocabulary "surviving rule" row (:59); M2's clause assertion (:145)
- defect: The surviving-rule clause writes "the FS19 deliberate-change precedent" into shipped `phase-plan.md` §4 and GPC2 pins that literal, but "FS19" is defined nowhere in any shipped surface — it exists only in the S1/S2 slices' specs, plans, and review artifacts — so the shipped package reference cites a precedent no reader can resolve, contradicting the slice's own law that shipped surfaces carry no process citations.
- evidence: repo-wide grep (md/js/mjs, excluding node_modules): "FS19" hits only docs/specs/2026-08-08-spec-artifact-skeleton.md, docs/specs/2026-08-14-plan-artifact-skeleton.md, docs/plans/2026-08-14-plan-artifact-skeleton.md:79, and docs/reviews/*; zero hits in skills/, test/, CONTRIBUTING.md. S1's shipped precedent (skills/sdlc/references/phase-spec.md §4) writes only resolvable package paths into §4, no check ids. The plan's own Context law: shipped surfaces "must carry no gap ids, slice names, issue numbers, or process citations — those live in this plan and the spec only."
- impact: phase-plan.md is package-public (inventory row `reference.phase-plan`); the pinned clause names an id that resolves to nothing in the package, and because GPC2 pins the 66-char literal, correcting it later requires another owner-ratified supersession cycle — the exact cost this slice is paying now for one clause.
- fix: word the shipped clause and its GPC2 pin self-descriptively (e.g. "the deliberate-change precedent — recorded unfreeze with mandatory re-freeze"), still under GPC10's 80-character bound.

### NEW — M3/PAS4 do not gate C3's per-letter anchor distribution

- severity: medium
- confidence: high
- location: spec C7 M3 (:146) and PAS4 (:260-263), against C3's Signature/shape
- defect: C3 fixes which skeleton sections each anchor covers (A→Definition of done + the `Carried to` field; B→Problem statement + Outcome proof; C→Objectives and scope + Non-goals + Context for the next agent; D→Brainstorm provenance + Alternatives considered; E→NFR sweep + Pre-mortem), but M3/PAS4 assert only that five anchors sit inside A–E, each citing the path, and that together they name all ten section names — a degenerate distribution (all ten names concentrated in one anchor, or coverage leaning on pre-existing surface titles) passes the gate while violating C3's specified shape.
- evidence: spec :146 "the five anchors ... together naming all ten section names of C1" and :263 "together naming all ten skeleton sections" — no per-letter mapping in either; the prompt's surface A line already contains "Definition of done" pre-slice (skills/sdlc/prompts/adversary-plan.prompt.md:22), so a union assertion can pass partly on pre-existing text; S1's shipped precedent pins the distribution (test/spec-artifact-skeleton.test.js:204 `const coverage = { Vocabulary: surfaceLine("D"), ... }`).
- impact: the per-surface routing (each attack surface checks the sections it semantically owns) is the review mechanism this slice ships; a mis-distributed anchor set passes the corpus, freezes at the mandatory re-freeze, and no standing guard re-checks it afterwards (the prompt returns to FROZEN).
- fix: M3/PAS4 pin the per-letter coverage map exactly as C3 states it — including the `Carried to` field name inside A — mirroring S1's shipped coverage assertion.

### NEW — M8's denial set ("mandate phrasing") is not decidable as a string assertion

- severity: medium
- confidence: high
- location: spec C7 M8 (:151) and PAS12 (:308-312)
- defect: M8 bans "no `linter` or `CI check` mandate phrasing" — unlike the first half of the same sentence ("no `Cucumber`, `Behat`, or `Gherkin` substring"), "mandate phrasing" names no literal set, so the sole mechanical gate on the Portability NFR's linter/CI clause is left to implementer guesswork (ban the bare substrings everywhere? ban only imperative sentences mentioning them?).
- evidence: spec :151 and PAS12's When–Then :311 repeat the phrase; contrast S1's shipped M8, a crisp literal pair (test/spec-artifact-skeleton.test.js M8: three banned substrings plus the required literal sentence "No keyword parser, no step definitions.").
- impact: two implementers can ship different denial sets — one accepting a skeleton sentence the other's test fails — so PAS12 cannot reproducibly gate what it claims, and the NFR row "Portability ... linter/CI-check mandate" is only weakly bound.
- fix: fix M8's denial set as literals (no `linter`, `CI check`, `Cucumber`, `Behat`, or `Gherkin` substring anywhere in the skeleton) plus the required guidance sentence, exactly as S1 did.

### NEW — PAS5's Falsify overclaims: partial spans do not fail M4

- severity: low
- confidence: high
- location: spec PAS5 Falsify (:266-269)
- defect: PAS5's falsify clause says "copying any canonical sentence, or any contiguous span of one, into the prompt fails M4", but M4 asserts only that no full canonical sentence appears as a contiguous substring — copying a proper sub-span of a rule sentence passes M4.
- evidence: spec :147 (M4: "none of C2's five canonical rule sentences appears anywhere in the prompt as a contiguous substring"); S1's shipped M4 implements exactly full-sentence matching (`for (const sentence of CANONICAL) assert.ok(!prompt.includes(sentence))`, test/spec-artifact-skeleton.test.js).
- impact: the falsify line claims detection strength the mechanism does not have; an implementer or auditor reading PAS5 believes partial restatements are caught when they are not — an honesty defect in the scenario contract.
- fix: delete "or any contiguous span of one" from PAS5's falsify clause, or extend M4 to a stated minimum span length if partial restatements are meant to be caught.

### NEW — C6's AM1/AM3 comment can break the untouched IDV33 depending on placement

- severity: low
- confidence: medium
- location: spec C6 (:132-137); test/iteration-disposition.test.js:457-486
- defect: C6 requires "an accompanying comment naming AM1/AM3 and the re-freeze obligation" with no placement constraint; if that comment is written contiguously with the existing "// Non-change obligations ..." block directly above the IDV19 test and names the unfrozen prompt file (`adversary-plan.prompt.md`, as AM1's own title does), IDV33 fails, because its case-insensitive process-history regex matches the word "plan".
- evidence: test/iteration-disposition.test.js:457-458 (the two-line ownership comment immediately above `test("IDV19: ..."`); :460-486 (IDV33 expands contiguous `//` lines into the block, then asserts the block does not match `/\b(?:Plan|panel|PR|removed|retired)\b/i` — "adversary-plan" contains a standalone `plan` token); spec AM1's subject is "FS19 unfreeze of `adversary-plan.prompt.md`".
- impact: a spec-conforming implementation can turn the corpus red via the very comment the spec mandates, and the failure cause (placement, not content) is not discoverable from the spec text.
- fix: C6 pins the comment's placement — inside the IDV19 test body adjacent to the filtered loop, never contiguous with the ownership comments above the test.

CLEAR: D — no contradictions found: canonical rule sentences match the approved plan verbatim; AM1-AM4, PAS15, and the DoD/scope restatements align with plan rev 4's ratified decisions; the 11/3/1 = 15 (73%) ratio is arithmetically correct.

CLEAR: E — every framework-behaviour claim verified true at this tree: L1/L2/L3 byte-accuracy, FROZEN/ASD19 mechanics, IDV19's `/^\t"([^"]+)",$/m` parsing, IDV15/IDV28 reading the package prompts (unaffected by additive anchors), GPC2/GPC10 pins and the 66<80 bound math, FS11 discovery/inverse completeness at 81 rows, goldens stamped from the consumer override (fixture ships its own plan prompt), check-lifecycle `--track/--slug` support, and no test pinning the gate-presentation spec doc.

CLEAR: F — all NFR rows are stated with response measures and bindings; the one unbound row carries the literal marker with a reason, per the shipped skeleton law.

CLEAR: PROPORTIONALITY — every CI/gate-running scenario has a stated, plausible budget (new contract tests < 1 s; npm test under 30 s; biome/check-references/check-lifecycle each ≤ 5 s); the window-scoped M6/M7 guards are cheap string assertions scheduled for deletion at re-freeze; no unbounded or ratcheting machinery.