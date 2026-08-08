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

### Round map

- Round 1: 13 findings (5 high / 8 medium) — 13 incorporated, 0 dismissed. Spec rev 1 → rev 2.
