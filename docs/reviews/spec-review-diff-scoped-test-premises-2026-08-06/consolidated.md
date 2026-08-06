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
| 2 | 2 | `claude-fable-5` | `round2-claude-fable-5.md` | `panel.dispatched{round:2,wave:2}` + `panel.harvested{round:2,wave:2}` |
| 2 | 2 | `gemini-3.1-pro-preview` | `round2-gemini-3.1-pro-preview.md` | same workflow/harvest |
| 3 | 3 | `claude-fable-5` | `round3-claude-fable-5.md` | `panel.dispatched{round:3,wave:3}` + `panel.harvested{round:3,wave:3}`; trim-the-tail sub-floor |

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

## Round 2 (delta `1c8a706..442668d`)

Both reviewers confirmed `SPEC-R1-01` through `SPEC-R1-08` discharged. No
`REOPENED` tags.

| id | severity | origin | reviewer(s) | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `SPEC-R2-01` | medium | NEW | fable-5 | IDV17's revised empty-set regex assertion has no mutation witness; a rotted regex passes forever | **incorporated** |
| `SPEC-R2-02` | low | NEW | fable-5 | C4.1 mislabels DSP4-DSP6 as C1-law scenarios although C4.5 correctly assigns C1 to DSP1-DSP3 | **incorporated** |
| `SPEC-R2-03` | low | NEW | fable-5 | "declaration of" over-claims a regex that matches function declarations but not arrow assignment declarations | **incorporated** |

Gemini returned CLEAR A-H with no findings. **Counts:** 0 high, 1 medium, 2
low. Incorporated 3; dismissed 0; barred 0; carries 0.

### `SPEC-R2-01` — negative assertion made non-vacuous

C5.1 now requires the line-471 subprocess regex to be hoisted and exercised
against an in-memory `execFileSync("fixture"` sample assembled from split tokens
before it asserts the real source returns `[]`. New DSP16 gates both halves and
the C5 trace now includes it.

### `SPEC-R2-02` and `-03` — prose narrowed to mechanism

C4.1 now assigns DSP1-DSP3 to the C1 law and DSP4-DSP7 to the guard. C4.2 now
says "call to or **function declaration** of" `baseRef`/`baseFile`, matching the
normative regex without claiming arrow-assignment coverage.

## Round 3 (trim-the-tail delta `442668d..0ef749a`)

Fable confirmed `SPEC-R2-01` through `SPEC-R2-03` discharged. No `REOPENED` tags.

| id | severity | origin | reviewer | defect | disposition |
| --- | --- | --- | --- | --- | --- |
| `SPEC-R3-01` | low | NEW | fable-5 | C5.1 hoists a mutable global regex but does not require fresh state/reset between the mutation witness and real-source scan | **incorporated** |

**Counts:** 0 high, 0 medium, 1 low. Incorporated 1; dismissed 0; barred 0;
carries 0.

C5.1 now hoists the regex **source**, not a shared `/g` instance, and requires
one projection function to construct a fresh global regex per call for both the
sample and real source. DSP16 fails on shared state or non-zero `lastIndex`.
This mirrors C4.2's explicit state-reset discipline without leaving the chosen
API to implementation.

## Dismissal posture

All three waves incorporated 100% of findings (8/8, 3/3, 1/1). The disclosure
threshold remains triggered and is reported rather than filed as diligence.
Each claim was checked against source or executed regex behaviour; round 2 had
genuine cross-model disagreement (Gemini clean, Fable three findings), and the
round-3 low demonstrated another executable state hazard rather than style
feedback. No finding was dismissed.
