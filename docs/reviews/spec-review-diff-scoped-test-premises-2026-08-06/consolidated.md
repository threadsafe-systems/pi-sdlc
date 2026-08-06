# Spec-panel adjudication — diff-scoped test premises

Target: `docs/specs/2026-08-06-diff-scoped-test-premises.md` rev 1 at
`1c8a706`. Track: irreversible. Author model:
`anthropic/claude-opus-5`. Reviewers:
`anthropic/claude-fable-5:xhigh` and
`google/gemini-3.1-pro-preview:xhigh`.

## Artifact inventory

| wave | harvest round | reviewer | artifact | telemetry |
| --- | ---: | --- | --- | --- |
| 1 | 1 | `claude-fable-5` | `round1-claude-fable-5.md` | `panel.dispatched{round:1,wave:1}` + `panel.harvested{round:1,wave:1}` |
| 1 | 1 | `gemini-3.1-pro-preview` | `round1-gemini-3.1-pro-preview.md` | same workflow/harvest |

The async workflow's `status.json` held both reviewer outputs. The mechanical
harvester persisted the workflow status/events/meta; the two markdown artifacts
above are verbatim extractions of `workflow.value.{fable,gemini}` from that
status file.

## Round 1 findings

Cross-model duplicates are one finding at the higher independently proposed
severity.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `SPEC-R1-01` | high | NEW | both | C5 removes every executable `execFileSync("git")`, but IDV17 still expects the spawned set to equal `["git"]`; the suite must go red | **incorporated** |
| `SPEC-R1-02` | high | NEW | both | DSP3 is the centrepiece mechanical witness, but rev 1 names no file or creation contract for it while referring ambiguously to "two new tests" | **incorporated** |
| `SPEC-R1-03` | medium | NEW | gemini | C5.2's literal headings omit the Markdown `##` prefix while the existing local `numbered` projection retains it | **incorporated** |
| `SPEC-R1-04` | medium | NEW | fable-5 | `argvTail = "[^\\]]*"` does not bound a variable-argv call; rev 1's regex can bridge into unrelated later text despite claiming it cannot | **incorporated** |
| `SPEC-R1-05` | low | NEW | fable-5 | The guard rejects unexempted hits but not stale exemptions that have stopped matching, so the exemption map can rot | **incorporated** |
| `SPEC-R1-06` | low | NEW | fable-5 | DSP14 calls the S1 handoff "C5-linked" although §7 and C1 own it | **incorporated** |
| `SPEC-R1-07` | low | NEW | fable-5 | C4.2 says helper *call*, while the normative regex and C4.3 intentionally match declarations too | **incorporated** |
| `SPEC-R1-08` | low | NEW | fable-5 | N2/DSP12 price a one-second wall-time gate without naming the observer or command | **incorporated** |

**Counts after deduplication:** 2 high, 2 medium, 4 low. Incorporated 8;
dismissed 0; barred 0; carries 0.

## Incorporation evidence (Spec rev 2)

### `SPEC-R1-01` — IDV17 and file-header contract

C5.1 now requires all three coupled changes: remove the child-process import and
base helpers; change IDV17's expected spawned set from `["git"]` to `[]`; and
change the file header to state that the corpus uses no subprocess or network.
The source-inspection regex remains as data proving the empty set. This removes
the red-suite contradiction rather than leaving an implement-time guess.

### `SPEC-R1-02` — one named test file owns both concerns

C4.1 now makes `test/diff-scoped-premises.test.js` the home of both the guard and
DSP1-DSP6. C4.5 names the law and detector test cases in that file; N2 and DSP12
name the same path. The #192 witness therefore has a committed address and no
unidentified second test file exists.

### `SPEC-R1-03` — projection representation fixed

C5.2 now requires the local heading projection to strip the Markdown `##`
prefix with `line.slice(3)` before comparing to the displayed literal array.
The displayed values and computed values therefore have one exact shape.

### `SPEC-R1-04` — literal argv is now structural

The normative prototype now has two exact starts:

- `execFileSync`/`spawnSync`: literal second-argument array after `"git", [`;
- `runProcess`: literal first-argument array beginning `["git"`.

Only after that literal array does `argvTail` scan to `]`. Executed countercheck:
`execFileSync("git", args); log("merge-base")` no longer matches, while
`execFileSync("git", ["merge-base", "HEAD", "main"])` does. Re-running the
prototype preserves the executed 60-file/3-hit inventory in §5.

### `SPEC-R1-05` — equality, not subset

C4.1 and DSP7 now require exact equality between the reported file-key set and
the exemption-map key set after fixes. An unexpected hit or a non-reporting
stale exemption fails; every reason remains mandatory and non-empty.

### `SPEC-R1-06` to `-08` — contract wording and meter

- DSP14 now says `§7/C1-linked`.
- C4.2 says helper "call to or declaration of".
- N2/DSP12 define a review-time measurement:
  `node --test test/diff-scoped-premises.test.js`, under one second, with no
  in-suite timing assertion.

## Grounding repeated by the adjudicator

- `test/iteration-disposition.test.js:471-472` confirms the regex plus
  `["git"]` equality that C5 would otherwise break.
- The local `numbered` projection at `:150-154` returns full heading lines today;
  C5.2 now tells implementation exactly how that shape changes.
- The extracted rev-2 prototype is byte-identical to
  `/tmp/detect-moving-ref-premises.mjs`; executing it at rev 2 still reports 60
  swept files and exactly the three §5 hits.
- A direct stress probe confirms variable argv → `false`, literal argv with
  `merge-base` → `true` under the revised patterns.
- No formal `CARRY-TO-SPEC` appears in the Plan-panel consolidated record; §1's
  no-orphan claim remains correct.

## Dismissal posture

Round 1 incorporated 8/8 findings. This is the first 100%-incorporation wave, so
it does not trigger the two-consecutive-wave disclosure threshold. Every finding
was checked against source or executed regex behaviour before incorporation;
none was absorbed merely because a reviewer proposed it.
