# Consolidated spec panel — sdlc-lifecycle-telemetry (round 1)

- Date: 2026-07-17
- Artifact: `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` @ a57815a (rev 1)
- Panel: openai-codex/gpt-5.6-luna:high, zai/glm-5.2:high,
  deepseek/deepseek-v4-pro:high (author vendor anthropic excluded)
- Orchestrating/adjudicating model: anthropic (Claude, session model) —
  human ratification at the spec gate
- Per-model files: `gpt-5.6-luna.md`, `glm-5.2.md`, `deepseek-v4-pro.md`

## Findings (deduped SF1–SF19) and adjudication

All 19 incorporated in rev 2; none dismissed.

**SF1 (HIGH; luna + deepseek)** — FS13 lacked actual schemas: payload types,
`by` grammar, marker set, run.json fields were prose sketches.
**INCORPORATED**: normative payload-type table added to §3; `by` grammar
pinned with per-event auto values; coverage marker set closed; §7 names the
committed schemas as the normative contract with a
hand-rolled-validator-agrees-with-schema test obligation.

**SF2 (HIGH luna / LOW glm)** — plan says "phase enter/exit", spec had only
`phase.entered`. **INCORPORATED** as a recorded decision: optional
`phase.exited` event added; collector derives the boundary when absent
(next `phase.entered` or window end, §6.3). Flagged for human ratification
at the gate as a deviation-in-shape from the plan's wording.

**SF3 (HIGH; luna + glm, strongest agreement)** — regeneration was not
reproducible: reviews/git not snapshotted (luna) and no pinned replay read
path, LT17 trivially passable (glm). **INCORPORATED**: `raw/` gains
`reviews/` and `git/`; `collect` snapshots *every* non-manifest input;
explicit `--from-raw` replay mode reads exclusively from snapshots; LT17 now
destroys/mutates live sources before the replay.

**SF4 (HIGH, luna)** — LLM seam not implementable (shapes, call count,
invocation undefined). **INCORPORATED**: §6.2 pins execFile-no-shell, one
call per request, request/response JSON shapes with `kind`
narrative|steering|precision, per-kind cardinality, validation, timeout, and
`llm.error:<kind>` failure semantics, plus a committed protocol schema.

**SF5 (HIGH, luna)** — derived measures under-determined (pairing,
double-counting panels). **INCORPORATED**: §6.3 pins entry pairing in JSONL
order per session file, phase-span attribution with an `unattributed`
bucket, capped-gap pairing for human-wait, and the disjointness rule
(nested child transcripts excluded from correlation; panels counted solely
from harvests) preventing double counting.

**SF6 (HIGH, luna)** — renderer scenarios permitted an empty dashboard.
**INCORPORATED**: §8 pins per-section data bindings (totals, `data-phase`
blocks, per-model cost nodes, per-finding rows, steering marks, rework
counts); LT20 asserts known-answer values; an empty shell fails.

**SF7 (MED, luna)** — collect/render CLI envelopes unfrozen.
**INCORPORATED**: `--format json` envelope `{ok, out, coverage[],
warnings[]}`, stderr prefix, atomic temp+rename output pinned in §6.

**SF8 (MED, luna)** — no tested harvest hook in SKILL.md. **INCORPORATED**:
§4 + LT24 require the skill-relative `harvest-panel.sh` token in the
dispatch step.

**SF9 (MED/LOW; luna + glm + deepseek)** — `validate-task` "after writing
its receipt" misstates the frozen runner (no receipt; `--report` optional).
**INCORPORATED**: emission after report is computed, every verdict,
regardless of `--report`; LT8 covers PASS/FAIL × report/no-report.

**SF10 (HIGH, luna)** — O_APPEND "never a partial line" overclaim.
**INCORPORATED**: guarantee re-scoped to prevalidation (no invalid record
ever attempted); torn-final-line tolerance delegated to the collector's
malformed-line handling, stated honestly in §3.1.

**SF11 (MED, luna)** — NF4 had no leakage mechanism or gate.
**INCORPORATED**: deterministic redaction pass (PV2 `buildRedactionValues`
precedent) + 500-char cap on committed soft strings; new sentinel scenario
LT28.

**SF12 (MED, glm)** — FS11 checker can't detect omitted entries; bare
repeated tokens break exactly-once. **INCORPORATED**: unique-phrase
assertion rule + structural omission-coverage test in §9/LT25.

**SF13 (HIGH, deepseek)** — session-directory discovery undefined.
**INCORPORATED**: §6.1 pins the observed pi mapping (`--<abs path, leading /
dropped, / → ->--` under `~/.pi/agent/sessions/`), labelled pi-internal and
best-effort, with `sessions.dir_unresolved` marker and `--sessions-dir`
override.

**SF14 (HIGH+MED, deepseek)** — per-event `by` values and `--by` validation
unpinned. **INCORPORATED**: auto-event `by` values pinned
(`script:<basename>`); emitter validates the grammar, exit 2 (LT2).

**SF15 (MED, deepseek)** — harvest `--from` structure unknown.
**INCORPORATED**: pinned flat top-level `status.json`/`events.jsonl`
(asyncDir shape); foreground dispatches harvest as `missed[]` with an
async-dispatch recommendation.

**SF16 (MED, deepseek)** — gh/llm failure paths undefined.
**INCORPORATED**: `github.error` / `llm.error:<kind>` markers, continue
semantics, new scenario LT29.

**SF17 (LOW, glm)** — `sessions.none` trigger ambiguity. **INCORPORATED**:
fires whenever zero sessions correlate, any cause.

**SF18 (LOW, glm)** — schema-validation method vs NF2. **INCORPORATED**:
hand-rolled validators pinned (`inspectManifest` precedent); schema files
normative, drift-tested.

**SF19 (LOW, deepseek)** — spec cited a non-existent ADR 0021 as authority.
**INCORPORATED**: reworded "to be recorded as ADR 0021, a deliverable".

## Outcome

19/19 incorporated, 0 dismissed. Round 2 verification pass over rev 2 to
follow (finding density at round 1 warrants verification rather than
declaration). SF2's shape deviation from the plan's wording is flagged for
the human owner at the spec gate.
