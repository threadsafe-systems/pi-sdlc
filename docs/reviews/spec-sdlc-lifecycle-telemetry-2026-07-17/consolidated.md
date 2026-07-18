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

## Outcome (round 1)

19/19 incorporated, 0 dismissed. Round 2 verification pass run over rev 2
(finding density at round 1 warranted verification rather than declaration).

---

# Round 2 (verification pass over rev 2 @ 3baf57d)

- Panel: same three models; per-model files `round2-gpt-5.6-luna.md`,
  `round2-glm-5.2.md`, `round2-deepseek-v4-pro.md`.
- Verification: glm-5.2 and deepseek-v4-pro independently verify **19/19
  resolved, zero regressions**; gpt-5.6-luna confirms 12 resolved and rates
  the rest partial/unresolved chiefly on one recurring premise (schema files
  absent at the reviewed commit — adjudicated below) plus genuinely new
  defects, all adjudicated here. Rev 3 incorporates every accepted item.

**R2-A (HIGH, luna) — panel-phase vocabulary collision**: auto emitters
speak the four-value FS5 panel vocabulary while the payload table typed
`phase` as the six lifecycle names. **INCORPORATED** (rev 3): panel events
now carry `panelPhase` (four-value FS5 vocabulary) with a pinned
panel→lifecycle mapping (task_validate→implement) for collector
attribution; harvest `--phase` takes the panel vocabulary.

**R2-B (HIGH, luna) — LLM `inputs`/`output` still prose**: **INCORPORATED**
(rev 3): per-kind request/response shapes pinned normatively in §6.2.

**R2-C (HIGH-part, luna) — run.json `title`/`track` source + absence
encoding unpinned**: **INCORPORATED** (rev 3): sourced from `run.started`,
optional with coverage; uniform omitted-never-null absence rule.

**R2-D (MED, luna) — LT17 does not isolate git**: **INCORPORATED** (rev 3):
`--git-cmd` injectable seam added (with `git.error` marker); LT17 mutates
the git seam too.

**R2-E (MED, luna) — render CLI envelope incomplete**: **INCORPORATED**
(rev 3): `--format text|json`, `{ok, out, warnings[]}` envelope, stderr
prefix, atomic write, exit-1 vs exit-2 mapping pinned.

**R2-F (MED, luna) — NF4 mechanism insufficient for verbatim prompt text**:
**INCORPORATED** (rev 3): steering entries carry no user text; ≥
12-consecutive-word n-gram containment check rejects verbatim carryover;
LT28 extended.

**R2-G (MED, luna) — FS11 omission test narrower than claimed classes**:
**INCORPORATED** (rev 3): structural test extended to schema files, ADR
0021, and normative store/retro paths in both SKILL.mds.

**R2-H (MED, luna) — validator-dispatch harvest hook missing (plan R2 says
panel/validator)**: **INCORPORATED** (rev 3): §4 + LT24 require the harvest
token at validator dispatch too.

**R2-I (MED, luna) — `phase.exited` deviation needs ratification before
freeze**: acknowledged; explicitly on the human gate agenda (below).

**N1 (MED, glm) — `incorporated`/`dismissed` mis-typed as strings by the
catch-all**: **INCORPORATED** (rev 3): typed non-negative integers.

**S1 (LOW, glm) — ERROR-verdict emission untested**: **INCORPORATED**
(rev 3): emission pinned to task-id-known ERROR cases; LT8 covers
parse-ok-ERROR and unparseable-skip.

**S2 (LOW, glm) — `--by` default unpinned**: **INCORPORATED** (rev 3):
defaults to `agent`.

**ND1 (MED, deepseek) — `human:<name>` grammar rejects spaces,
undocumented**: **INCORPORATED** (rev 3): grammar tightened to slug-style
`human:[a-z0-9][a-z0-9-]*` and documented (`human:neil-chambers`).

**ND2 (LOW, deepseek) — `manifest.partial` trigger undefined**:
**INCORPORATED** (rev 3): ≥ 1 malformed line records it.

**glm clarity note — §6.3 unattributed phrasing**: **INCORPORATED** (rev 3).

**PARTIAL DISMISSAL (luna's recurring premise across SF1/SF4 partials) —
"committed schema files must exist at the spec commit"**: DISMISSED with
reason: the spec's normative tables (§3 envelope/payload types, §6.2
protocol shapes, §7 structure + closed marker set) are the frozen contract;
the schema *files* are Build deliverables required to mirror those tables
field-for-field and drift-tested against them (§3/§7). Requiring JSON schema
files inside the spec artifact would move implementation into the spec
phase; FS9/FS10 precedent likewise pinned contracts in spec prose with
artifacts landing at Build. **Ratified by Neil Chambers on 2026-07-17.**

## Outcome (round 2)

All accepted round-2 findings incorporated in rev 3; the partial dismissal
(above) and the plan-wording deviation (`phase.exited` optional + derived,
SF2/R2-I) were both **ratified by Neil Chambers on 2026-07-17** at the spec
gate. No high/medium survives adjudication; the spec gate is closed on
rev 3.
