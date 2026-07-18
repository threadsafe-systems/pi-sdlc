# Round 2 verification — sdlc-lifecycle-telemetry spec rev 2

- Reviewer: zai/glm-5.2 (author vendor anthropic excluded)
- Artifact: `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` @ 3baf57d (rev 2)
- Adjudication verified against: `consolidated.md` (SF1–SF19)
- Grounding: all framework claims verified against pinned source at commit
  3baf57d on branch `feat/sdlc-lifecycle-telemetry`.

## Verification table (SF1–SF19)

| SF | Sev (r1) | Status | Rev-2 resolution (spec section) |
|----|----------|--------|---------------------------------|
| SF1 | HIGH | ✅ resolved | §3 normative payload-type table pins every field type; `by` grammar pinned `^(script:[a-z][a-z0-9-]*\|agent\|human:[^\s:]+)$`; coverage marker set closed in §7; committed schema named normative with hand-rolled-validator-agrees-with-schema test obligation. **One new defect in the type table — see N1.** |
| SF2 | HIGH | ✅ resolved | §3 adds optional `phase.exited` (prose, `{phase}`); §6.3 pins three-case boundary derivation (explicit exit → next enter → window end); deviation from plan wording recorded as a decision and flagged for human ratification. |
| SF3 | HIGH | ✅ resolved | §6.4 + §2 add `raw/reviews/` and `raw/git/`; snapshots *every* non-manifest input; §6 `--from-raw` reads exclusively from `raw/`; LT17 destroys/mutates live sources before replay. |
| SF4 | HIGH | ✅ resolved | §6.2 pins execFile-no-shell, one call per request, request/response JSON shapes with `kind` cardinality, validation-before-use, 120 s timeout, `llm.error:<kind>` semantics, committed protocol schema + fixtures. |
| SF5 | HIGH | ✅ resolved | §6.3 pins JSONL-order pairing per session file, phase-span attribution with `unattributed` bucket, capped-gap (30 min) human-wait, and the disjointness rule (top-level-only session correlation excludes child files). Verified against actual pi session dir structure: top-level `*.jsonl` + nested timestamped child dirs. |
| SF6 | HIGH | ✅ resolved | §8 pins per-section data bindings; LT20 asserts known-answer values; empty shell fails. |
| SF7 | MED | ✅ resolved | §6 pins `--format json` envelope `{ok,out,coverage[],warnings[]}`, stderr prefix, atomic temp+rename; §8 pins render exits/default-out/determinism. |
| SF8 | MED | ✅ resolved | §4 + LT24 require skill-relative `harvest-panel.sh` token in the dispatch step. |
| SF9 | MED/LOW | ✅ resolved (1 minor gap — see S1) | §3.3 reworded to "after report is computed", every verdict, regardless of `--report`. Verified against `validate-task.mjs`: report computed in `runManifest()` before optional `atomicWriteReport`; three verdicts PASS(0)/FAIL(1)/ERROR(2) confirmed; no receipt written by runner (ADR 0014: receipt is subagent artifact). LT8 covers PASS×FAIL × report/no-report. |
| SF10 | HIGH | ✅ resolved | §3.1 guarantee re-scoped to prevalidation ("no invalid record is ever attempted"); torn-final-line from mid-append I/O failure tolerated by collector's malformed-line skip (§6.1). Honest framing. |
| SF11 | MED | ✅ resolved | NF4 pins deterministic redaction (PV2 `buildRedactionValues` precedent, verified exported at `validate-task.mjs:28`) + 500-char cap; LT28 sentinel scenario. |
| SF12 | MED | ✅ resolved | §9 unique-phrase assertion rule + structural omission-coverage test. Verified `check-references.mjs`: exactly-once enforced for package/readiness entries (`sourceCount !== 1`). |
| SF13 | HIGH | ✅ resolved | §6.1 pins `~/.pi/agent/sessions/--<abs-path-/- → ->---` mapping, labelled pi-internal/best-effort, `sessions.dir_unresolved` marker, `--sessions-dir` override. Verified against actual dirs: `--home-neil-code-threadsafe-pi-sdlc--` matches `/home/neil/code/threadsafe/pi-sdlc`. |
| SF14 | HIGH+MED | ✅ resolved (1 minor gap — see S2) | §3 auto-event `by` values pinned (`script:<basename>`); emitter validates grammar, exit 2 (LT2). Verified grammar matches all four script basenames. |
| SF15 | MED | ✅ resolved | §5 pins flat top-level `status.json`/`events.jsonl` (asyncDir shape); foreground dispatches harvest as `missed[]` with async recommendation. |
| SF16 | MED | ✅ resolved | §6.1/§6.2 `github.error`/`llm.error:<kind>` markers, continue semantics; LT29. |
| SF17 | LOW | ✅ resolved | §6.1: "`sessions.none` fires whenever zero sessions correlate, whatever the cause." |
| SF18 | LOW | ✅ resolved | §7: hand-rolled validators pinned (`inspectManifest` precedent, verified at `validate-task.mjs`); schema files normative, drift-tested. |
| SF19 | LOW | ✅ resolved | §1: "to be recorded as ADR 0021, a deliverable of this feature." |

**19/19 resolved.** All fixes landed and are sound except one type-table defect the
SF1 fix introduced (N1) and two low-severity surviving gaps (S1, S2).

## New findings

### N1 — `incorporated` and `dismissed` payload fields mis-typed as strings by the normative catch-all

- severity: medium
- confidence: high
- location: spec §3, "Payload field types (normative)" paragraph
- defect: The normative type table's catch-all clause ("every other named field
  is a non-empty string") types `incorporated` and `dismissed` in the
  `panel.consolidated` payload as strings. These are integer finding-counts
  (parallel to `findings:{high,medium,low}` in the same payload object —
  "19/19 incorporated, 0 dismissed" per the round-1 consolidated), and the
  renderer's panel-deepdive and any precision math consume them as numbers. The
  spec also states the committed `event.schema.json` mirrors the table
  "field-for-field", so the schema would freeze the wrong type. This is a new
  defect introduced by the SF1 normative-type-table addition.
- evidence: §3 table `panel.consolidated` payload: `{phase, round, findings:{high,medium,low}, incorporated, dismissed}`. §3 normative types: "`findings` is `{high,medium,low}` of non-negative integers; `authorExcluded` is a string; every other named field is a non-empty string." `incorporated`/`dismissed` are not explicitly typed → fall through to "non-empty string". `consolidated.md`: "19/19 incorporated, 0 dismissed."
- impact: FS13 (the frozen event contract) would ship with count fields typed
  as strings. Downstream consumers (renderer `#panel-deepdive`, collector
  precision rollups, future cross-run dashboards) must parse strings to get
  integers. Correcting the type after freeze is a schema-version bump, not an
  additive change.
- fix: Add `incorporated` and `dismissed` to the explicitly-typed integer list
  in §3: e.g. "`incorporated` and `dismissed` are non-negative integers" (same
  category as `findings`).

### S1 — LT8 does not cover the ERROR-verdict emission that §3.3 claims

- severity: low
- confidence: high
- location: spec §3.3 (emission claim), §10 LT8 (scenario)
- defect: §3.3 states `validate-task` emits `task.validated` "for every verdict
  (PASS, FAIL, and ERROR)" but LT8 only exercises PASS and FAIL fixtures. The
  ERROR path (manifest-not-found / parse-error, exit 2) has no scenario gating
  its emission, so a conforming implementation could silently skip emission on
  ERROR and pass every listed test.
- evidence: §3.3: "for every verdict (PASS, FAIL, and ERROR)." LT8: "on a
  passing fixture (verdict PASS), on a failing fixture (verdict FAIL)." Verified
  `validate-task.mjs` `runManifest` returns `verdict:"ERROR", exitCode:2` for
  manifest-not-found/parse errors.
- impact: Low — ERROR is an edge case and emission there is low-value. But the
  scenario set under-gates the §3.3 claim.
- fix: Add an ERROR-verdict fixture assertion to LT8, or weaken §3.3 to
  "PASS and FAIL" if ERROR emission is not required.

### S2 — prose-event `--by` default is unpinned

- severity: low
- confidence: medium
- location: spec §3.1 (CLI signature), §3 (envelope), §4 (hook steps)
- defect: The emitter CLI signature shows `--by` as optional (`[--by WHO]`) but
  the envelope requires `by`, and no default is stated. For prose events emitted
  by the agent via SKILL.md hooks, §4 only pins the `record-run-event.sh` token
  and the event-type token — not the `--by` value. An implementer must guess the
  default (e.g. `script:record-run-event`, `agent`, or reject-when-omitted).
- evidence: §3.1: `record-run-event.mjs <event> [--slug S] [--by WHO] ...`.
  §3 envelope: `by` is in the required-field list. §4: hook step contains
  `record-run-event.sh` + event-type token; no `--by` value pinned.
- impact: Low — the grammar validates whatever value is passed, and `by` is
  forward-compatible (consumers ignore unknown values). The ambiguity is in the
  unstated default for the common prose-emission case.
- fix: State the `--by` default when the flag is omitted (e.g. defaults to
  `script:record-run-event`), or make `--by` required and update the signature.

### Clarity note (not a finding) — §6.3 unattributed-bucket phrasing

§6.3: "entries outside every span and outside the window are excluded from
per-phase figures and counted in an `unattributed` bucket." The sentence reads
as if out-of-window entries are both excluded and counted. The intended meaning
(within-window-but-unattributed → bucket; outside-window → excluded) is clear
from context and LT16's hand-computed fixture would disambiguate, but a comma
or reword would remove the ambiguity.

## CLEAR

- CLEAR: B — every outcome in the plan's R1–R5 + DoD has at least one
  falsifiable scenario; the renderer binding gaps (SF6) and regeneration gaps
  (SF3) that round-1 found are now scenario-gated.
- CLEAR: D — no contradictions with the plan remain; SF2's enter/exit deviation
  is a recorded decision flagged for ratification; the hardcoded-paths decision,
  regenerate policy, and additive-only FS5 changes are all respected.
- CLEAR: E — all framework claims verified: pi session header `version:3`
  + `message.{usage.cost.total,model,provider,stopReason}` +
  `model_change`/`thinking_level_change` events (verified against
  `~/.pi/agent/sessions/--home-neil-code-threadsafe-pi-sdlc--/*.jsonl`);
  session-dir mapping `--<abs-path-/- → ->---` (verified against 30 actual dirs);
  top-level `*.jsonl` + nested child dirs (verified `find -type d`); FS5 frozen
  CLIs write primary output to stdout / errors via `lib.mjs fail()`→stderr;
  FS1 `paths` closed set `["plans","specs","reviews","agents"]` in `lib.mjs`;
  `check-references.mjs` exactly-once rule; ADR 0014 receipt-is-subagent-artifact;
  ADR 0017 read-only checker.
- CLEAR: F — NF1–NF4 each tied to scenarios; NF2 (no deps) verified against
  existing scripts (Node built-ins only); NF4 now has a mechanism + LT28 gate.
- CLEAR: G — honesty sweep clean; the O_APPEND re-scoping (SF10), soft/hard
  separation, proxy labelling, and partial-coverage dogfood are all honestly
  framed. No over-claiming detected in rev 2.
