# Spec panel consolidated record — spec-artifact-skeleton (2026-08-08)

Panel: `spec_review`, floor 2 (config), track irreversible.
Roster (resolved with live-credential PONGs; `anthropic/claude-fable-5:xhigh` dropped — PONG failed): `google/gemini-3.1-pro-preview:xhigh`, `openai-codex/gpt-5.6-luna:xhigh`.
Author: `maas-qwen/qwen3.8-max` (orchestrator; not in roster — no self-review exclusion needed).
Target: `docs/specs/2026-08-08-spec-artifact-skeleton.md` at `3f596a0` (rev 1).

## Round 1 (wave 1) — full-spec review

### Findings

| id | reviewer | sev/conf | location | defect (one line) | disposition |
|---|---|---|---|---|---|
| SPEC-R1-01 | gemini | high/high | C2, C1 | C2's canonical sentences drop two plan-mandated clauses: ratio (rule 3) and unchanged-context (rule 2); C1 claims to mirror content C2 never states | **incorporated** |
| SPEC-R1-02 | gemini | high/high | C3, M4 | Anchors restate rule logic disguised as questions (plan In #3: "references, never restates"); anchor D omits the skeleton pointer; M4's verbatim-only ban is a loophole | **incorporated** (fix merged with SPEC-R1-04) |
| SPEC-R1-03 | gemini | med/high | SAS8/SAS9 | Plan A3's strict `test/fixtures/consumer/` boundary has no falsifiable scenario | **incorporated** (as inspection, see adjudication) |
| SPEC-R1-04 | luna | high/high | C2/C3/SAS4 | C3's required B anchor contains the exact canonical substring banned by M4 — a literal implementation cannot pass both | **incorporated** (root cause shared with SPEC-R1-02) |
| SPEC-R1-05 | luna | high/high | AM3/SAS13 | Re-freeze is recorded but not gated; no scenario requires it to merge; contradicts plan DoD 9 | **incorporated** |
| SPEC-R1-06 | luna | high/high | C3/C7/SAS3 | M3 checks token presence only: cannot reject a ninth letter, enforce anchor placement inside B/C/D/F, or preserve the closed output-format block | **incorporated** |
| SPEC-R1-07 | luna | med/high | C1/C7/SAS1 | M1 omits section-order and literal-placeholder assertions; empty/reordered/non-scaffold skeletons pass | **incorporated** |
| SPEC-R1-08 | luna | med/high | C4/C7/SAS5 | M5 checks 3 of C4's 10 fields; a schema-valid but semantically wrong row passes | **incorporated** |
| SPEC-R1-09 | luna | med/high | SAS9/SAS10 | Base-relative non-change scenarios violate premise durability (`phase-spec.md` §4; `CONTRIBUTING.md:29-35`) | **incorporated** |
| SPEC-R1-10 | luna | med/high | SAS10 | Plan DoD 7 (biome over changed files + reference inventory + lifecycle checks) not covered | **incorporated** |
| SPEC-R1-11 | luna | med/high | NFR table | Compatibility row says "17 remaining frozen entries"; correct count is 16 | **incorporated** |
| SPEC-R1-12 | luna | med/high | C7/SAS11 | C7's "exactly M1–M7" inventory contains no assertion for SAS11's checks | **incorporated** |
| SPEC-R1-13 | luna | med/med | NFR table | The unbound row's reason sits in the response-measure column, not the Binding cell the shape it introduces requires | **incorporated** |

CLEAR (gemini): A, E, F, G, H. CLEAR (luna): E, H.

### Adjudication (orchestrator, rev 2)

All 13 incorporated, 0 dismissed. Twelve distinct fixes (SPEC-R1-02/04 share a root cause):

1. **C2 canonical sentences completed** (01): rule 2 gains "(interfaces mentioned only as unchanged context do not, and must not be silently re-described)"; rule 3 gains "and the mechanical/total ratio is readable off the spec" — both verbatim from plan In #2. C1's mirror claims are now true.
2. **Anchors rewritten reference-only** (02+04): each anchor names its component, instructs verification against `references/spec-artifact-skeleton.md`, cites that path — no rule logic restated. M4 semantics defined: none of the four canonical sentences appears as a contiguous substring. The luna-02 contradiction (anchor containing a banned substring) is structurally impossible in rev 2.
3. **Consumer fixtures gated** (03): folded into the new SAS9 PR-gate diff inspection. Deviation from gemini's proposed fix recorded: a mechanical base-relative fixture diff is barred by the premise-durability law, the fixtures are not in the standing FROZEN guard, and adding them exceeds this slice's permitted test changes — PR-gate inspection against the authoring diff is the law-conformant route.
4. **Re-freeze gated** (05): new SAS14 `carried` — destination: post-merge track-none follow-up, orchestrator-owned; slice not complete until the re-freeze PR merges (plan DoD 9, In #5).
5. **M3 structural** (06): exactly eight headings `A.`–`H.` in order, no letter beyond H; anchors inside B/C/D/F paragraphs; output-format section byte-identical to an embedded literal block. Self-contained expectations, not base-relative.
6. **M1 proves the scaffold** (07): fixed section order + every literal fill-in placeholder asserted.
7. **M5 exact** (08): all ten row fields exactly; inventory holds exactly 81 rows.
8. **Premise durability restored** (09): old mechanical SAS9/SAS10 dependency-diff claims → SAS9 PR-gate inspection; assumption 5 added fixing the literal-expectation rule for contract tests.
9. **DoD 7 covered** (10): SAS10 now sweeps `npm test` + timing budget + `biome check` over changed files + `check-references` + `check-lifecycle`.
10. **Arithmetic fixed** (11): 17 → 16. Author's own oversight: the pre-dispatch self-check fixed three of the four count sites and missed the NFR row.
11. **M8 added** (12): SAS11's pair of assertions now in the C7 inventory (M1–M8).
12. **Unbound reason relocated** (13): the Binding cell now carries `unbound — accepted at gate — reason: …`.

### Dismissal posture

13 incorporated / 0 dismissed because every finding was evidence-backed against the plan text, the premise-durability law, or the spec's own internal consistency — no finding was stylistic or speculative. SPEC-R1-11 was the author's arithmetic slip, caught by a reviewer after the author's own self-check missed one site; recorded for honesty.

## Round 2 (wave 2) — delta review of rev 2

Target: rev 2 at `1aaf4b1`. Scope: verification of the 13 round-1 dispositions plus `NEW`/`REOPENED` findings per the prompt's Delta rounds contract.

### Verification of round-1 fixes

- gemini: 12 of 13 confirmed; **SPEC-R1-08 REOPENED** (its rev-2 fix introduced a field-count contradiction — see SPEC-R2-01).
- luna: 13 of 13 confirmed (with independent line-number evidence per finding).

### Findings

| id | reviewer | sev/conf | origin | location | defect (one line) | disposition |
|---|---|---|---|---|---|---|
| SPEC-R2-01 | gemini | high/high | REOPENED(SPEC-R1-08) | C4, C7 (M5), SAS5 | M5/SAS5 require "all ten fields" but C4's row has exactly 9 (matches the schema's 9 required keys, `additionalProperties: false`) — unbuildable contradiction | **incorporated** |
| SPEC-R2-02 | gemini | med/high | NEW | C7 (Gated by) | C7's gating list includes SAS8, which has no C7 marker set (it routes to the standing ASD19 diff guard); M8 maps to SAS11 | **incorporated** |
| SPEC-R2-03 | gemini | med/high | NEW | C1 (kind labels) | "the label names that point/destination" is impossible — labels are the three literal strings; the scenario body names the point/destination (as SAS9/SAS14 dogfood) | **incorporated** |
| SPEC-R2-04 | luna | med/high | NEW | C7/M3, SAS3 | M3 asserts anchor presence only; C3's signature/postconditions require anchors to name their component and cite the skeleton path — a nameless anchor would pass | **incorporated** |
| SPEC-R2-05 | luna | high/high | NEW | C3/C7/M3, SAS3 | C3's precondition declares the `## Delta rounds` section byte-stable, but M3 protects only headings/anchors/output-format — round mechanics could change with all tests passing | **incorporated** |
| SPEC-R2-06 | luna | med/high | NEW | C1/C7/M1, SAS1 | M1 checks global marker presence/order but not section-locality or section-set exactness — markers moved into one section or an extra section pass | **incorporated** |
| SPEC-R2-07 | luna | med/high | NEW | C4/C7/M5 | Same root cause as SPEC-R2-01: no defined tenth field; schema requires exactly 9 keys with optional `verification` only | **incorporated** (fix merged with SPEC-R2-01) |
| SPEC-R2-08 | luna | med/high | NEW | C4/C7/M5, SAS5 | Row match + 81-row count leaves the other 80 rows unconstrained; `check-references` does no baseline comparison, so "no other row changed" is mechanically unprovable | **incorporated** (routed to SAS9 diff inspection, see adjudication) |
| SPEC-R2-09 | luna | high/high | NEW | SAS10 | `bash skills/sdlc/scripts/check-lifecycle.sh` with no arguments exits 2 (`exactly one declaration source group is required`) — verified live; DoD-7 scenario cannot pass as written | **incorporated** |

CLEAR (gemini): A, B, E, F, G, H. CLEAR (luna): D, F, H.

### Adjudication (orchestrator, rev 3)

All 9 incorporated, 0 dismissed. Eight distinct fixes (SPEC-R2-01/07 share the reopened root cause). Every evidence claim verified by the orchestrator before ruling: field count parsed from C4's literal JSON, schema `required` array read, `check-lifecycle.sh` run live in both forms, SAS8/SAS9/M3 texts re-read.

1. **M5 field count corrected** (01+07): "all nine fields exactly" — every schema-required key with C4's values, schema forbids extra keys — plus the explicit assertion that the optional `verification` key is absent. The rev-2 "ten" was an authoring slip introduced while expanding M5 to satisfy SPEC-R1-08; the reopening was legitimate under the Delta rounds contract (the contradiction did not exist until rev 2).
2. **C7 gating list corrected** (02): `SAS1–SAS7` (marker sets M1–M7) + SAS11 (marker set M8) + SAS10 (suite sweep); explicit note that SAS8/SAS9 gate C5 and the PR diff, not C7.
3. **Kind-label wording corrected** (03): "the scenario names that point/destination in its body, the label stays the literal `inspection`/`carried`" — the skeleton now states what its own SAS9/SAS14 dogfooding already does.
4. **M3 asserts anchor content** (04): each anchor must contain its component name and the literal path `references/spec-artifact-skeleton.md`; the four anchors together must name all five components.
5. **Delta rounds protected** (05): M3 gains a byte-identity assertion for the `## Delta rounds` section against an embedded literal block; SAS3's falsify gains "editing any Delta-rounds line". The round mechanics that produced this very review are now mechanically frozen by the spec they reviewed.
6. **M1 section-locality** (06): exact section set (no extras), each marker/placeholder inside its owning section; SAS1's falsify extended accordingly.
7. **No-other-row invariant rerouted** (08): M5 drops the mechanically unprovable claim (row match + 81-row count only); C4's invariant stands, gated by SAS9's PR-gate diff inspection — the same premise-durability routing the spec already applies to every other non-change claim (SAS8, SAS9's fixture/template claims). C4's `Gated by` now names the split: SAS5 mechanical half, SAS9 inspection half. Ratio unchanged (SAS9 was already inspection).
8. **Lifecycle invocation fixed** (09): SAS10 now specifies `check-lifecycle.sh --track irreversible --slug spec-artifact-skeleton` and records that the current spec-stage `artifact.build` failure is expected until the Build phase lands — so the scenario is honest about time-of-check.

### Dismissal posture

9 incorporated / 0 dismissed. SPEC-R2-01/07 is the second arithmetic slip in this panel's history (SPEC-R1-11 was the first), both author-introduced and reviewer-caught; recorded for honesty. SPEC-R2-05 is the round's best catch: a byte-stability precondition with no matching mechanical protection — exactly the reference-never-trust gap the skeleton exists to prevent.

## Round 3 (wave 3) — delta review of rev 3

Target: rev 3 at `c58ad7a`. Scope: verification of the nine round-2 dispositions plus `NEW`/`REOPENED` findings on the rev-3 delta.

### Verification of round-2 fixes

- gemini: 8 of 9 confirmed; **SPEC-R2-06 REOPENED** (rev 3 fixed SAS1's prose but not M1's normative definition — see SPEC-R3-01).
- luna: 9 of 9 confirmed — including SPEC-R2-06, citing `:127`. **Panel disagreement, resolved by the orchestrator:** line 127 was read directly; M1's definition carried no section-locality or exact-set assertions, so gemini's reopen is correct and luna's confirmation was a misread. Recorded for honesty — confirmations are spot-checked, not trusted.

### Findings

| id | reviewer | sev/conf | origin | location | defect (one line) | disposition |
|---|---|---|---|---|---|---|
| SPEC-R3-01 | gemini | med/high | REOPENED(SPEC-R2-06) | C7 (M1) vs SAS1 | SAS1 claims M1 checks section-locality and exact section set, but M1's definition still omits both — SAS1's falsification claim dishonest | **incorporated** |
| SPEC-R3-02 | gemini | med/high | NEW | C1 vs C7 (M1) | C1 mandates binding-rule sentences in four component blocks, but no marker or scenario verifies their presence | **incorporated** |
| SPEC-R3-03 | gemini | med/high | NEW | C7 (M2) vs SAS2 | SAS2 claims M2 checks §4 placement/paragraph order; M2 is defined as a loose file-presence check | **incorporated** |
| SPEC-R3-04 | gemini | low/high | NEW | C6 vs C7 (M7) | C6's mandated AM1/AM3/re-freeze comment is unfalsifiable — M7/SAS7 never check it | **incorporated** |
| SPEC-R3-05 | gemini | low/high | NEW | C7 (M6) vs SAS6 | SAS6 claims M6 falsifies reordering, but M6 defines membership only — reordering passes | **incorporated** |
| SPEC-R3-06 | luna | med/high | REOPENED(SPEC-R2-05) | C7/M3, SAS3 | "a literal expected block the test embeds" pins neither bytes nor source — the test could embed an altered Delta-rounds/output-format block and still pass; assumption 5 requires self-contained expectations | **incorporated** |

CLEAR (gemini): A, C, D, E, F, H. CLEAR (luna): A, C, D, E, F, G, H.

### Adjudication (orchestrator, rev 4)

All 6 incorporated, 0 dismissed. Six distinct fixes. Recurring defect class named for the record: rounds 2–3 kept finding **scenario prose claiming more than the marker definitions it cites** (R2-06 → R3-01, R3-03, R3-04, R3-05). Normative force lives in the M-definitions; scenario text is description. Rev 4 re-grounded every scenario claim in its marker definition.

1. **M1 definition completed** (01): exact section set (no extras) and every marker/placeholder only between its owning header and the next. SAS1's claims are now true.
2. **Binding-rule sentences pinned and gated** (02): C1 items 1–4 now fix each block's binding-rule sentence as C2's exact canonical sentence 1–4 (single source of truth); M1 asserts all four present in the skeleton, each inside its owning section (Vocabulary→1, Contracts→2, kind labels→3, NFR→4).
3. **M2 precise and durable** (03): literal anchor assertions — §4's first paragraph begins `Produce the Spec doc:`; the rules+pointer paragraph sits between it and `**Premise durability.**`; the three existing anchor paragraphs (`**Premise durability.**`, `**Dialogue discipline.**`, `> **Under your configuration:**`) follow in order. No moving base — pure literal anchors, durable after merge. SAS2's falsify extended to placement and paragraph integrity.
4. **Comment gated** (04): M7 asserts the comment's presence naming AM1 and AM3 and the re-freeze obligation; SAS7 extended.
5. **Order gated** (05): M6 asserts the `FROZEN` array equals pinned literal list **L3** exactly, in L3's order — membership, count, and order in one equality. SAS6's reordering claim is now backed.
6. **Literal blocks pinned** (06): M3's two "test embeds" expectations replaced by blocks **L1** (Delta rounds) and **L2** (output format) quoted verbatim under C7; orchestrator verified both byte-exact against `adversary-spec.prompt.md` before commit. L3 pinned the same way against `test/frozen-surfaces.test.js` minus the unfrozen entry. A tampered embed can no longer pass its own contract — which is exactly the round mechanics that produced this review, now mechanically frozen with pinned bytes.

### Dismissal posture

6 incorporated / 0 dismissed. SPEC-R3-06 is the round's deepest catch: an underspecification hiding inside an already-accepted fix shape ("the test embeds"), exposed only when assumption 5 was applied to it. Both reopen were lawful — each cited rev-3 text that did not exist when the original finding was dispositioned.

### Round map

- Round 1: 13 findings (5 high / 8 medium) — 13 incorporated, 0 dismissed. Spec rev 1 → rev 2.
- Round 2: 9 findings (3 high / 6 medium; 1 reopened, 8 new) — 9 incorporated, 0 dismissed; all 13 round-1 fixes verified by both reviewers. Spec rev 2 → rev 3.
- Round 3: 6 findings (4 medium / 2 low; 2 reopened, 4 new) — 6 incorporated, 0 dismissed; one panel disagreement (R2-06) resolved by direct line read. Spec rev 3 → rev 4.

## Round 4 (wave 4) — capped convergence check on rev 4

Both reviewers read rev 4 at 310 lines (committed `1af8348`). gemini ran 112 s, luna ran long; both confirmed all six round-3 fixes landed before raising new findings.

### Verification of round-3 fixes

Both reviewers: SPEC-R3-01..06 landed. luna additionally re-verified L1/L2 byte-for-byte against `adversary-spec.prompt.md:32-49` and confirmed removing the pre-C5 prompt entry from `test/frozen-surfaces.test.js` yields L3 exactly.

### Process incident — corrupted delivery payload (adjudication record)

The orchestrator's first read of round 4 used an aggregated `action=status` payload. That payload was a corrupted rendering of the children's outputs: it carried five findings citing structure that exists in **no revision** of the spec — `### M9`/`### M10` marker sections, a 388-line file, a SAS11 premise about "rev 2 kind/evidence rows", a SAS12 "M10 verifies F1 source" claim, and AM rows in `phase-tasks.md` (a file this spec never touches). Verified against revs 1–4 via `git log -S` and direct reads: none of that text ever existed. The provisional ruling (5/5 dismissed as non-grounded) was then overturned when the actual child transcripts were recovered from `~/.pi/agent/sessions/.../7de9a482` and `.../5de73589` — the true outputs are the three grounded findings below, with accurate line citations. The corrupted payload is preserved at `round4-corrupted-status-payload.md` as evidence of the failure mode. **Law applied:** panel outputs are sourced from child transcripts / saved output files, never from aggregated status payloads.

### Findings (true outputs, from child transcripts)

1. **SPEC-R4-01 — M2 does not enforce C2's immediate §4 insertion or paragraph intactness** (luna, `REOPENED(SPEC-R3-03)`, medium, high confidence). C2 (`:71`) mandates "inserted immediately after §4's first paragraph" and "existing paragraphs stay intact and in order"; rev-4 M2 asserted only non-adjacent placement ("after ... before") and paragraph *beginnings*, and SAS2's When–Then overclaimed "intact". A body-rewrite of §4's existing paragraphs (first sentence kept) or an interleaved paragraph would have passed M2.
2. **SPEC-R4-02 — verification scenarios out of sync with the rev-4 M-definitions** (gemini, `NEW`, medium, high confidence). SAS2 omitted M2's named anchor paragraphs; SAS6 omitted the pinned list **L3** that M6 checks equality against; SAS7 claimed literal assertions (`["plan", "spec", "review"]`, `validator-task.prompt.md`) that M7 left implicit — the round-2/3 overclaim defect class, recreated in the rev-4 delta.
3. **SPEC-R4-03 — M2 omits C2's mandated "anything missing is a spec defect" sentence** (gemini, `NEW`, low, high confidence). C2's signature fixes that literal sentence in the §4 rules paragraph; rev-4 M2 asserted only the four rule sentences and the pointer, leaving the mandated sentence unfalsifiable.

### Adjudication (orchestrator, rev 5)

All three genuine; 3/3 incorporated:

1. **M2 adjacency + intactness routing** (01): M2 now asserts the rules paragraph sits *immediately* after §4's first paragraph (adjacency — no paragraph may sit between), each existing anchor paragraph still begins with its anchor sentence, and states explicitly that M2 asserts adjacency/beginnings/order only — full byte-intactness of the three existing paragraphs' bodies is a diff-shape claim verified at the PR gate by SAS9 (premise durability: no mechanical assertion against a moving base). SAS9's §4 entry now spells the shape out: exactly one inserted paragraph, every existing §4 line untouched — "this is where C2's 'existing paragraphs stay intact' precondition is verified". SAS2's When–Then rewritten to match M2 exactly (no overclaim); its falsify covers interleaved paragraphs and altered anchor sentences.
2. **Scenario/M-definition re-sync** (02): SAS2 names the three anchor paragraphs (as M2 does); SAS6's When–Then now states equality with pinned list **L3** exactly; M7 expanded to enumerate every literal assertion SAS7 claims (the literal `["plan", "spec", "review"]` constant, the two unfiltered sibling loops, the surviving `validator-task.prompt.md` assertion) — the overclaim direction closed by strengthening M7, not weakening SAS7.
3. **Mandated sentence asserted** (03): M2 and SAS2 now assert the literal sentence `anything missing is a spec defect` inside the rules paragraph; SAS2's falsify covers its deletion.

### Dismissal posture

3 incorporated / 0 dismissed. SPEC-R4-01 is the round's headline: a lawful reopen catching that rev 4's M2 fix satisfied the *letter* of R3-03 (placement anchors) while still under-enforcing C2's own signature (immediacy, intactness). The reopen was evidence-perfect — it cited `:71` vs `:128` vs `:225-226` accurately. The delivery-corruption incident is the round's process lesson and is now standing law for panel output sourcing.

### Round map

- Round 1: 13 findings (5 high / 8 medium) — 13 incorporated, 0 dismissed. Spec rev 1 → rev 2.
- Round 2: 9 findings (3 high / 6 medium; 1 reopened, 8 new) — 9 incorporated, 0 dismissed; all 13 round-1 fixes verified by both reviewers. Spec rev 2 → rev 3.
- Round 3: 6 findings (4 medium / 2 low; 2 reopened, 4 new) — 6 incorporated, 0 dismissed; one panel disagreement (R2-06) resolved by direct line read. Spec rev 3 → rev 4.
- Round 4: 3 findings (2 medium / 1 low; 1 reopened, 2 new) — 3 incorporated, 0 dismissed; delivery-corruption incident recorded and law updated. Spec rev 4 → rev 5.
