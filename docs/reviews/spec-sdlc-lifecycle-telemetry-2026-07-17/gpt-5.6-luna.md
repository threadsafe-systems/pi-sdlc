### The frozen event record has no actual schema

- severity: high
- confidence: high
- location: Specification §3, lines 56-88; §7, lines 238-261
- defect: FS13 is declared irreversible, but the spec supplies only prose placeholders: payload member types/requiredness, `by` name grammar, timestamp acceptance, and the permitted coverage markers are not defined. The envelope simultaneously shows `payload` as required and calls it optional, and the run record's arrays/absence semantics are likewise untyped; no committed event schema is named at all.
- evidence: The spec says “Envelope (all fields required unless noted)” and then says “`payload` is event-specific, optional” (spec:62-70), while §7 only sketches `hard: { ... }`, `soft: { ... }` and says coverage markers are “incl.” (spec:240-260). LT1 merely asserts a “schema-conforming line” (spec:302-303), but there is no event-schema artifact in the commit (`find docs -iname '*telemetry*'` found only the plan, spec, and plan review).
- impact: Different implementers can emit incompatible v1 records while satisfying every listed scenario, freezing an unusable downstream contract; a no-manifest run also cannot satisfy an unstated required `title`/`track` policy in LT14.
- fix: Add a committed FS13 event JSON Schema and a complete run.json JSON Schema (or equivalent field tables) that pin every type, required/optional field, absence value, enum, marker grammar, and unknown-field rule, then make LT1/LT13/LT14 validate those exact contracts.

### Phase exit telemetry required by the plan is missing

- severity: high
- confidence: high
- location: Specification §3 vocabulary, lines 73-88; §4, lines 128-138
- defect: The approved plan requires prose-emitted phase enter/exit events, but the v1 vocabulary contains only `phase.entered` and `phase.backward`; there is no `phase.exited` (or equivalent), no payload for it, and no hook/scenario that records it.
- evidence: Plan R1 explicitly lists “phase enter/exit” (docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:61-66). The spec's entire event table has `phase.entered` at line 76 but no exit event (spec:73-88), and §4 mandates only “every phase entry” (spec:130-134).
- impact: The frozen event vocabulary cannot record the end of the final phase or an explicit phase boundary, so phase durations/swimlanes must guess from later entries; the spec silently fails a locked plan outcome and the missing field cannot be recovered for v1 runs.
- fix: Add a v1 `phase.exited` event with exact payload and SKILL.md hook/scenario coverage, or explicitly revise the approved plan before freezing FS13.

### Regeneration is not reproducible from the declared raw archive

- severity: high
- confidence: high
- location: Specification §6.1 and §6.4, lines 176-236
- defect: `collect` reads review artifacts and git state, but §6.4 snapshots only sessions, GitHub responses, and LLM request/response pairs. The claimed byte-identical regeneration therefore still depends on mutable `docs/reviews/*` and branch/diff data that are not in `raw/`.
- evidence: The adapters read “Review artifacts” and “git/GitHub” (spec:190-195), while the raw layout contains only `sessions/`, `github/`, and `llm/` (spec:46-49) and the snapshot promise lists only those three classes (spec:230-236). LT17 reruns immediately and never mutates/removes a review or git input before replay (spec:355-356).
- impact: A later collector cannot regenerate the same v1 record after a fix wave, rebased branch, changed review artifact, or missing source file; this makes the regenerate-don't-migrate claim false and allows schema evolution to recompute a different historical run.
- fix: Snapshot every non-manifest input used for distillation (including review files and git/diff responses) with deterministic names, and define replay mode to consume those snapshots exclusively; add a mutation/removal replay scenario.

### The LLM interface is not implementable as a pinned contract

- severity: high
- confidence: high
- location: Specification §6.2, lines 204-214
- defect: The spec requires a JSON request and response but never defines either shape, and incorrectly says an output run.json schema's `soft.attribution` pins both directions. It also does not define whether `CMD` is one executable path or shell-like argv, how many calls occur, or how a response is associated with a phase/panel.
- evidence: The only contract is “an executable receiving one JSON request on stdin and returning one JSON response on stdout” followed by “the schema of both is pinned by the committed run.json schema's `soft.attribution` and fixture files” (spec:206-208); `soft.attribution` in the run sketch is only `{model,provider}` (spec:255-256). LT18 only compares outputs to a fixture's scripted responses (spec:357-360), without pinning the requests or invocation protocol.
- impact: Implementations cannot interoperate with the fake seam or replay raw LLM calls deterministically, and LT18 cannot distinguish a correct adapter from one that invents a different request/response protocol.
- fix: Commit separate request/response schemas and fixtures, pin exact call count, input/output routing, model attribution, error/timeout semantics, and use an explicit argv-array seam rather than an ambiguous `CMD` string.

### Hard derived measures can produce different numbers from the same inputs

- severity: high
- confidence: high
- location: Specification §6.3, lines 216-226
- defect: Several supposedly pinned formulas leave the events to select and deduplication rules unspecified: “previous-entry” for assistant duration and the assistant→user pairing are undefined, and adding transcript usage to harvested panel totals has no rule to prevent counting one panel twice.
- evidence: The spec defines agent time as “previous-entry ts → assistant ts,” human wait as summed assistant→user gaps, and rollups as transcript usage “plus harvested panel totals” (spec:218-224), but does not say which JSONL entry is previous, which assistant owns a user gap when there are multiple assistant messages, or how panel totals are related to transcript turns. LT16 asserts one hand-computed fixture (spec:352-354), which cannot gate the missing cases.
- impact: Two conforming collectors can report different agent time, wait, token, and dollar totals—and a normal panel with both a harvested status and session transcript can be double-counted—so the supposedly comparable hard telemetry freezes incorrect numbers.
- fix: Specify exact event pairing/order/tie rules, phase assignment and out-of-window handling, and a stable identity/deduplication rule with fixtures for repeated assistant messages and panel transcripts present in both sources.

### Renderer scenarios allow an empty dashboard to pass

- severity: high
- confidence: high
- location: Specification §8, lines 263-287; LT20-LT23, lines 364-376
- defect: The plan requires semantic executive, swimlane, cost hierarchy, panel matrix, steering, and rework content, but the renderer contract pins only seven anchors, offline/deterministic properties, and soft-data attributes. LT20-LT23 can pass for seven empty elements and a coverage list, without checking any required metric or visualization content.
- evidence: Plan R4 requires the executive metrics, phase blocks, cost hierarchy/flow, model×finding matrix, steering marks, and rework counts (docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:137-153). The spec only says the anchors are rendered (spec:280-285), while LT20 checks anchors/external references and LT21-LT23 check determinism, soft attributes, and coverage (spec:366-376); none asserts executive fields, phase blocks, costs, findings, steering marks, or rework counts.
- impact: A renderer that emits empty `<section id=...>` elements (or a generic notice despite available inputs) satisfies all renderer scenarios while failing the dashboard objective and the plan's Definition of Done.
- fix: Pin per-section required semantic elements/data bindings and add representative known-answer assertions for every R4 section, including the explicit coverage-only alternative when its inputs are absent.

### Collector and renderer CLI envelopes are not frozen

- severity: medium
- confidence: high
- location: Specification §6 and §8, lines 162-174 and 263-272
- defect: `collect-run` advertises `--format text|json`, but the spec defines neither stdout envelope, diagnostics, help/argument rules, atomic output behaviour, nor text-vs-JSON differences; `render-retro` defines only exit prose and likewise no stdout/stderr contract.
- evidence: The plan's house-pattern context requires “exits 0 PASS / 1 FAIL / 2 ERROR” and `--format text|json` where a CLI reports, while the spec gives collect only three exit meanings and a default output path (spec:167-174) and render only “Exit 0 written; 1 ...; 2 ...” (spec:268-272). LT13/LT19 assert the output file, not the CLI envelopes or error streams (spec:339-362).
- impact: Script callers and offline tests cannot reliably distinguish success diagnostics from errors or consume the advertised JSON mode; implementations can ship incompatible CLIs while all current scenarios pass.
- fix: Pin complete invocations, parse/error/help behaviour, stdout/stderr bytes/envelopes, output-write atomicity, and exit mapping for both tools, then add malformed/IO/format scenarios.

### The lifecycle never has a tested harvest hook

- severity: medium
- confidence: high
- location: Specification §4 and LT24, lines 128-138 and 378-384
- defect: The spec describes the dispatch step as invoking harvest in §5, but neither §4 nor LT24 requires `harvest-panel.sh` (or any harvest invocation) to appear in `skills/sdlc/SKILL.md`; the documentation test checks only the emitter token/event tokens.
- evidence: The approved plan says the phase/gate/dispatch steps must name “the emitter and harvest calls” (docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:161-163). The spec's hook requirement lists emitter inflections only (spec:130-138), and LT24 asserts only `record-run-event.sh` and event-type tokens (spec:380-384). LT11 can pass against a direct script fixture even if dispatch never calls that script.
- impact: The always-on R2 retention outcome is not gated; a shipped skill can keep writing no panel artifacts while all harvest unit tests pass.
- fix: Require the skill dispatch hook to contain a skill-relative `harvest-panel.sh` invocation and assert that token (plus its phase/round/slug seam) in LT24.

### validate-task is specified to write a receipt that it does not write

- severity: medium
- confidence: high
- location: Specification §3.3 and LT8, lines 116-126 and 320-322
- defect: The spec says `validate-task.mjs` emits after “writing its receipt,” but the frozen runner has no receipt-writing operation; it writes only an optional `--report`, and the runtime receipt is created by the validator agent outside this CLI.
- evidence: The existing runner's only persistence path is `atomicWriteReport(opts.report, ...)` (skills/sdlc/scripts/validate-task.mjs:475-488), and its frozen CLI options are only `--manifest`, `--repo-root`, `--format`, `--report`, and `--help` (skills/sdlc/scripts/validate-task.mjs:431-450; docs/adr/0014-task-validation-runner-pv2.md:7-20). The spec nevertheless requires emission after a receipt (spec:120-122) and tests “the receipt and report” (spec:320-322).
- impact: Implementers must guess whether to add a new frozen persistence path, emit after `--report`, or instrument the out-of-process validator; changing the runner to create receipts could violate PV2's frozen output/exit contract and LT8 has no falsifiable receipt timing target.
- fix: Define the side effect as occurring after a successful atomic `--report` write (and cover report/no-report and PASS/FAIL), or specify a separate caller-owned receipt hook without changing PV2.

### O_APPEND does not provide the promised no-partial-line failure guarantee

- severity: high
- confidence: high
- location: Specification §3 and §3.1, lines 56-60 and 99-106
- defect: A direct single `O_APPEND` write cannot guarantee that an I/O failure leaves the file without a partial record, yet the spec simultaneously mandates that write strategy and promises “the manifest is never left with a partial line.”
- evidence: The contract requires a single direct append (`O_APPEND`, one write) and a ≤32 KiB line (spec:58-60), then assigns any I/O failure exit 2 while promising no partial line (spec:103-104). LT2 tests only pre-write validation failures (unknown/malformed/oversized payload), and LT3 tests successful concurrency; no scenario exercises a failed append or recovery (spec:304-307).
- impact: A full/unavailable filesystem or short write can leave a malformed `events.jsonl` line that every later collector must skip, silently losing the event and violating the irreversible manifest contract.
- fix: Either weaken the guarantee to prevalidation-only, or specify and test a failure-safe append protocol (for example a lock plus verified write/recovery strategy) that can actually roll back or quarantine a failed record.

### NF4 has no mechanism or gate against prompt/secret leakage

- severity: medium
- confidence: high
- location: Specification §6.1, §6.2, and NF4, lines 183-214 and 394-405
- defect: The collector feeds user-message text and review prose to an LLM and permits model-generated narratives/soft data into the committed run.json, but specifies no output sanitization, secret redaction, or prompt-text detector. “Text is never copied verbatim” does not prevent an LLM from reproducing it.
- evidence: User text is read for steering (spec:187-189), narratives and classification are stored in `soft` (spec:206-214), while NF4 asserts committed artifacts contain no secrets or verbatim prompt text (spec:403-405). LT18 checks only placement/attribution/class labels, and LT27 checks coverage honesty; neither checks leakage.
- impact: A compliant collector can copy a prompt or secret into `soft.narratives` or an LLM response-derived field, causing the committed dogfood artifact to violate the stated security/privacy requirement with no failing scenario.
- fix: Define a deterministic redaction/safe-output policy and schema/length constraints for every committed soft string, then add fixtures containing sentinel prompts/secrets and assert they never reach run.json or HTML.

CLEAR: A — No other frozen-shape defect found beyond the event/run schema and missing phase-exit findings above.
CLEAR: B — Findings identify LT scenarios that pass without gating the claimed outcome; the remaining listed scenarios have explicit pass conditions.
CLEAR: C — The LLM, collector, event payload, receipt, and derived-measure interfaces contain the concrete under-specification described above; no additional interface defect found.
CLEAR: D — The phase enter/exit omission, receipt contradiction, and replay/rendering mismatches are the concrete internal/plan contradictions found.
CLEAR: E — No additional framework-behaviour defect was asserted without source grounding; the validate-task lifecycle is grounded in the cited repository lines.
CLEAR: F — Renderer content, regeneration, and NF4 requirements are not fully scenario-gated as described above; no additional NFR defect found.
CLEAR: G — The NF4 claim exceeds the specified mechanism; no additional over-claim found.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Concrete severity-rated findings cite the specification, governing plan, ADR 0014, and validate-task.mjs with exact paths and line ranges."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read specification, plan, panel adjudication, governing skill, ADRs, scripts, schemas, and tests",
      "result": "passed",
      "summary": "Required review context inspected."
    },
    {
      "command": "git -C /home/neil/code/threadsafe/pi-sdlc.worktrees/feat-sdlc-lifecycle-telemetry status --short",
      "result": "passed",
      "summary": "Review made no changes; pre-existing worktree changes were not modified."
    }
  ],
  "validationOutput": [
    "Review findings written to the authoritative output path."
  ],
  "residualRisks": [
    "No implementation was changed; all listed defects remain for the specification author."
  ],
  "noStagedFiles": true,
  "diffSummary": "Read-only specification review; no files changed.",
  "reviewFindings": [
    "medium: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:162-174,263-272 - collector/render CLI envelopes are not frozen despite advertised format/exits.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:56-261 - FS13 and run.json are described only by incomplete sketches, not pinned schemas.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:73-138 - phase exit event required by plan is missing.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:176-236 - raw replay omits mutable review/git inputs.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:204-214 - LLM request/response seam is not pinned.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:216-226 - hard-measure formulas and source deduplication are ambiguous.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:263-376 - renderer scenarios permit empty dashboard sections.",
    "medium: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:128-138,378-384 - lifecycle harvest invocation is not tested.",
    "medium: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:116-126,320-322 - validate-task receipt timing contradicts the frozen runner.",
    "high: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:56-106 - O_APPEND failure path cannot guarantee no partial line.",
    "medium: docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:183-214,394-405 - NF4 leakage claim has no enforcing mechanism or scenario."
  ],
  "manualNotes": "This is a read-only adversarial review; no staged files were created."
}
``` 
