# Round 4 — corrupted `action=status` payload (evidence, partial reconstruction)

**What this file is.** The aggregated `subagent action=status` payload returned for
round-4 run `call_0bd9ed57bf7b4c5ebcd95c9d` was a corrupted/hallucinated rendering
of the children's actual outputs. This file preserves the corrupted content
(partial — reconstructed from the orchestrator's context; the payload was truncated
at ~50 KB during retrieval) as evidence of the failure mode. The TRUE outputs are
`round4-gemini-3.1-pro-preview.md` and `round4-gpt-5.6-luna.md` (extracted from the
child session transcripts).

**Run metadata (accurate):** status complete; totalCostUsd 0.1582; totalTokens 334693;
durationMs ~2049386; children gemini (111770 ms) and luna (~33 min), both completed.

## Corrupted gemini section (findings that exist in NO spec revision)

- SPEC-R4-01 (medium): claimed SAS12 (cited "L:377-381" of a supposedly 388-line file)
  contains "M10 verifies that it is the complete and accurate source for F1's
  construction" — unfalsifiable. **No M10 exists in revs 1-4; SAS12 is at L:282-287
  of the 310-line file and contains no such claim.**
- SPEC-R4-02 (low): claimed M5 asserts "the AM1…AM3 lines and the re-freeze comment
  appear byte-for-byte in the block from the first '### Amendment classes' heading to
  the next '###' heading" but not "up to the next heading". **M5 (L:131) is the
  inventory-row assertion; 'Amendment classes' and 'phase-tasks.md' appear nowhere
  in any revision of this spec.**
- SPEC-R4-03 (low): claimed SAS1 cites "F4 adds zero new runtime behaviour (it is a
  docs+tests-only slice). §Out of scope carries that sentence." **Neither sentence
  nor a §Scope section exists in any revision.**
- SPEC-R4-04 (low): claimed "M3 makes no mention of fences; a triple-backtick line
  inside the prompt's Delta-rounds section would satisfy the heading-to-heading range
  test". **M3 (L:129) asserts byte-identity of the whole section range against pinned
  block L1 — no fence loophole exists.**

## Corrupted luna section

- SPEC-R4-05 (medium): "Stale premise in SAS11 — spec must verify current state, not
  round history" — claimed SAS11's premise "still says 'rev 2 repaired M4 by adding
  the missing kind/evidence rows… the scenario verifies those two lines byte-for-byte'".
  **SAS11 (L:276-280) is the no-tooling scenario (M8); it has never carried that
  premise in any revision.**
- REOPENED(SPEC-R2-05): "No-tool-law contract row lacks byte-identity pin for
  kind/evidence rows" — **same non-existent content class.**
- Confirmation list cited "spec L:24-45 (AM1), L:47-65 (AM2), L:67-84 (AM3), …,
  L:370-376 (output format block)" — **actual AM1 is L:17-22 in a 310-line file.**

## Verification method used to establish corruption

`git log --all -S "M10 verifies"`, `-S "complete and accurate source"`, `-S "phase-tasks"`
over all revisions plus direct reads of revs 1-4: zero hits. The corrupted payload's
structural vocabulary (NEW/REOPENED tags, severity lines, CLEAR lines) was
shape-correct but its content was fabricated.
