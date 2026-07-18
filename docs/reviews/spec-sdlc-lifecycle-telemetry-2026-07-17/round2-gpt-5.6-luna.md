| Finding | Round-2 verification |
|---|---|
| SF1 | **UNRESOLVED (high):** §3/§7 now name `event.schema.json` and `run.schema.json` and require validator/schema agreement, but the frozen field shape is still only a sketch and neither schema exists at the reviewed commit. The required/absent representation for `run.json` hard values and even `title`/`track` is not pinned. |
| SF2 | **RESOLVED with gate caveat:** §3 adds optional `phase.exited` and §6.3 defines explicit-or-derived boundaries. This is a deliberate deviation from the plan's literal “phase enter/exit” wording and remains subject to the spec's pending human gate. |
| SF3 | **PARTIAL (medium):** §2/§6.4 add review/git raw snapshots and explicit `--from-raw` exclusive replay, and LT17 destroys/mutates sessions, reviews, and GitHub. LT17 does not mutate or remove the live git source, so it cannot falsify a replay implementation that secretly rereads git. |
| SF4 | **UNRESOLVED (high):** §6.2 pins exec-without-shell, cardinality, timeout, and top-level request/response keys, but the `inputs` and `output` shapes remain “kind-specific” prose; the referenced protocol schema/fixtures are not present at the reviewed commit. |
| SF5 | **RESOLVED:** §6.3 now pins JSONL-order pairing, first-entry handling, capped waits, phase/out-of-window attribution, and excludes nested child sessions from the panel rollup. |
| SF6 | **RESOLVED:** §8 and LT20 bind each dashboard section to representative data and explicitly make an empty shell fail. |
| SF7 | **PARTIAL (medium):** §6 freezes the collect JSON/text envelope and atomic output, but §8 only gives render exit meanings and an output path; render stdout, stderr diagnostics, usage errors, and invalid-input I/O behavior remain uncontracted. |
| SF8 | **RESOLVED:** §4 and LT24 require a skill-relative `harvest-panel.sh` token in the dispatch step. |
| SF9 | **RESOLVED:** §3.3 and LT8 correctly trigger after report computation for PASS/FAIL/ERROR and both `--report` modes, and explicitly state that the runner writes no receipt. |
| SF10 | **RESOLVED:** §3.1 honestly limits the no-invalid-record guarantee to prevalidation and delegates torn final-line handling to collector soft-failure. |
| SF11 | **PARTIAL (medium):** §11 adds a named redaction pass, 500-character cap, and LT28, but it does not define how verbatim prompt text is detected/removed; the cited precedent only redacts selected environment values. |
| SF12 | **PARTIAL (medium):** §9 fixes the repeated-token problem and adds structural checks for scripts/hooks, but the omission test does not cover the other claimed normative-reference classes (schema files, SKILL.md store/path prose, or ADR 0021). |
| SF13 | **RESOLVED:** §6.1 pins the observed pi directory mapping, top-level candidate files, unresolved marker, and explicit repeatable override. |
| SF14 | **RESOLVED:** §3 pins automatic `by` basenames and its grammar; §3.1/LT2 require invalid `--by` to exit 2 before writing. |
| SF15 | **RESOLVED:** §5 pins flat top-level `status.json`/`events.jsonl` under `--from`, including missing/partial behavior. |
| SF16 | **RESOLVED:** §6.1/§6.2 define `github.error` and `llm.error:<kind>` continuation semantics; LT29 gates non-zero, invalid-JSON, and timeout seams. |
| SF17 | **RESOLVED:** §6.1 says `sessions.none` fires for zero correlated sessions regardless of cause. |
| SF18 | **RESOLVED:** §7 explicitly requires hand-rolled validation and validator/schema fixture agreement under NF2. |
| SF19 | **RESOLVED:** §1 correctly describes ADR 0021 as a deliverable rather than an existing authority. |

### FS13 schemas and missing-run metadata are still not frozen

- severity: high
- confidence: high
- location: spec §1, §3 lines 68-111, §7 lines 316-347, LT14
- defect: The revision promises that committed schemas “mirror” prose, but supplies neither the event schema nor the full `run.json` schema; the current reviewed commit contains no `skills/sdlc-retro/` schema files. In addition, `run.json` sketches `title` and `track` as top-level fields while the collector accepts only `--slug`, and LT14 requires a schema-valid no-manifest/gappy output without specifying where those required values come from.
- evidence: §7 says “`slug, title, track`” and calls `hard` values “absent” without defining null/omission/coverage encoding (lines 322-343); §6's only required identity argument is `--slug` (lines 202-205); LT14 requires schema validity for a gappy store (lines 447-449). `git ls-tree -r --name-only 3baf57d` at commit `3baf57d` returns no `skills/sdlc-retro` paths.
- impact: This remains an irreversible shape that implementers must invent, and a collector cannot satisfy the stated no-manifest scenario and required top-level fields consistently.
- fix: Include/commit complete event and run schemas before the gate, pin timestamp/unknown-field/absence semantics, and either make `title`/`track` optional with explicit coverage or add a deterministic source/CLI input for them.

### LLM request and response payloads remain non-buildable

- severity: high
- confidence: high
- location: spec §6.2 lines 254-280 and §7 lines 341-347
- defect: Naming `llm-protocol.schema.json` and saying `inputs`/`output` are kind-specific does not specify their member names, types, requiredness, or the exact narrative/steering/precision output structures. No protocol schema or fixture is present at the reviewed commit, so two collectors can send different JSON while both claiming conformance to this spec.
- evidence: The only request definition is `{kind, slug, model?, inputs}` and the only response definition is `{kind, model, provider, output}` (lines 262-270); the invoked cardinalities do not define the payloads consumed by each adapter. `git ls-tree -r --name-only 3baf57d` shows no `skills/sdlc-retro/schema/llm-protocol.schema.json`.
- impact: The fake seam and `--from-raw` replay cannot be implemented or independently verified against a stable contract; LT13/LT18 can pass a fixture tailored to an arbitrary implementation.
- fix: Commit separate exact request/response schemas and fixtures for each kind, including attribution, routing, call ordering, output bounds, and replay naming.

### Auto-panel events use a phase vocabulary incompatible with the frozen CLIs

- severity: high
- confidence: high
- location: spec §3 payload field types lines 102-110 and §3.3 lines 146-150
- defect: The spec requires every `phase` payload value to be one of six lifecycle names, while the auto-emitting `resolve-panel` and `ensure-panel-agent` CLIs accept the distinct four-value review-panel vocabulary; §3.3 provides no mapping or conversion rule for their emitted `panel.resolved`/`panel.agent_stamped` payloads.
- evidence: The spec says “`phase` is one of the six phase names” (line 102) and requires those CLIs to emit their §3 events (lines 146-150). The pinned source exports `PHASES` as `plan_review`, `spec_review`, `pr_review`, `task_validate` (`skills/sdlc/scripts/lib.mjs:10-14`), rejects any other resolver phase (`skills/sdlc/scripts/resolve-panel.mjs:61-62`), and the agent stamper documents/validates the same four IDs (`skills/sdlc/scripts/ensure-panel-agent.mjs:43-51`). The source explicitly warns that the six hook phases are distinct and must not be conflated (`skills/sdlc/scripts/lib.mjs:26-28`).
- impact: A literal implementation either emits schema-invalid events for the auto CLI's phase argument or invents an unpinned mapping, corrupting the irreversible event contract and panel-to-lifecycle attribution.
- fix: Add a normative four-panel-to-six-lifecycle mapping (including `task_validate`) and require the auto emitters to record the mapped value, or permit and schema the two vocabularies separately.

### LT17 does not actually test git replay isolation

- severity: medium
- confidence: high
- location: spec §6.4 lines 304-314 and LT17 lines 458-462
- defect: The replay rule correctly says `--from-raw` must ignore live git, but LT17 only deletes/mutates session and review fixtures and replaces the GitHub fake; it leaves the live branch, commits, and diff unchanged. A collector that rereads git can therefore pass the byte-identical replay scenario.
- evidence: §6.1 obtains branch commits/diff stats via live `git` (lines 232-238), while §6.4 claims replay remains identical after live inputs mutate (lines 306-314). LT17's mutation list has “session fixture files deleted, review files edited, fake `--gh-cmd` replaced” but no branch/commit/diff mutation (lines 458-462).
- impact: The core regenerate-from-raw guarantee is not gated for one of the newly added raw input classes, so rebases or later diff changes can silently alter historical records.
- fix: In LT17 mutate/remove the live git seam too (or inject a fake git command and change it), then assert replay output is unchanged and no live git invocation occurred.

### Render CLI contract remains incomplete

- severity: medium
- confidence: high
- location: spec §8 lines 349-365
- defect: Unlike collect, render has no pinned `--format` or stdout envelope and does not define whether successful output is silent, what stderr contains, or how malformed JSON, missing input, unwritable output, and unknown flags map to diagnostics and exit 1 versus 2.
- evidence: §8 specifies only `render-retro.mjs --run FILE [--out FILE]` and “Exit 0 written; 1 run.json fails schema validation; 2 usage/IO” (lines 351-358). LT20-LT23 exercise generated HTML, not any of those stream/error contracts.
- impact: Consumers and tests can observe incompatible render CLI behavior even though the advertised house CLI contract appears complete.
- fix: Pin render parse/help/stdout/stderr and malformed-input/output-failure behavior, then add falsifiable scenarios for each exit class.

### NF4 redaction does not enforce its prompt-text claim

- severity: medium
- confidence: high
- location: spec §6.1 lines 225-231, §6.2 lines 275-280, §11 lines 525-530, LT28
- defect: The only named mechanism is environment-value redaction “per the `buildRedactionValues` precedent”; that precedent redacts only values from credential-named environment variables (and values of at least four characters), not arbitrary transcript/user prompt text or model-generated verbatim copies. LT28's one sentinel proves only that one fixture string is removed, not the stated general no-verbatim-prompt guarantee.
- evidence: The spec permits user text as steering input and model-produced soft outputs (lines 225-231, 275-280) while claiming all committed artifacts contain no verbatim prompt text (lines 525-529). The verified precedent collects only env entries whose names match `REDACT_NAME_RE` and whose values are at least four characters (`skills/sdlc/scripts/validate-task.mjs:31-39`).
- impact: A compliant implementation can leave a non-environment prompt sentence in `soft.narratives` or copy it through an LLM response while passing the env-value redaction description; the committed retro can violate NF4.
- fix: Define deterministic prompt-safe output handling (for example, forbid transcript-derived text except bounded classifier labels, or redact against the complete input text) and add sentinels covering secret locations and every committed string class.

### FS11 omission coverage is narrower than the claimed inventory

- severity: medium
- confidence: high
- location: spec §9 lines 383-396, LT25 lines 507-508
- defect: The new structural test proves entries for scripts and hook script tokens only, while §9 claims coverage of all package-owned references introduced by the new SKILL.md, store paths, schema files, and ADR 0021. The existing checker validates only entries that are already listed, so omitted schema/path/ADR references still pass.
- evidence: §9 explicitly limits the structural assertions to “every script” and “every hook script” (lines 392-396), while the checker iterates only `raw.sources` and checks each listed assertion/target (`skills/sdlc/scripts/check-references.mjs:138-177`); LT25 only deletes a listed target (lines 507-508).
- impact: The FS11 honesty outcome remains partly manual: a newly introduced schema or normative store-path sentence can ship without an inventory entry and no specified test fails.
- fix: Extend the structural coverage fixture to enumerate the new SKILL.md/schema/ADR/store-path references and assert each has exactly one inventory entry, not just that listed targets exist.

### Plan R2's validator harvest outcome is not represented in the hooks

- severity: medium
- confidence: high
- location: governing plan R2 lines 79-83; spec §4 lines 161-170 and LT24 lines 501-506
- defect: The approved plan requires harvesting after each “panel/validator dispatch,” but the spec's only mandated harvest hook is the panel-dispatch step; neither §4 nor LT24 requires a validator/task-validation dispatch to invoke `harvest-panel.sh`.
- evidence: Plan R2 says “After each panel/validator dispatch, the dispatch step harvests” (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:79-83`). Spec §4 enumerates panel dispatch/consolidation but no validator dispatch (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:161-170`), and LT24 checks only the panel-dispatch hook (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:501-506`). The existing source treats `task_validate` as a distinct panel phase (`skills/sdlc/scripts/lib.mjs:10-14`).
- impact: Validator lifecycle artifacts can evaporate without violating any spec scenario, contrary to R2 and the panel/subagent telemetry objective.
- fix: Add an explicit task-validator dispatch harvest hook and LT24 assertion (or amend plan R2 to exclude validator dispatch and state the intentional scope).

### phase.exited is not yet an approved plan-compatible shape

- severity: medium
- confidence: high
- location: spec §3 line 88; governing plan R1 lines 61-66; spec header line 13
- defect: The spec labels `phase.exited` optional and replaces explicit exit emission with collector derivation, but the governing plan requires phase enter/exit as prose-emitted events; the spec merely records this as an in-document decision while the human gate is still pending.
- evidence: Plan R1 lists “phase enter/exit” among skill-prose events (`docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md:61-66`). Spec §3 says `phase.exited` “MAY be emitted” and that derived-or-explicit exit satisfies it (`docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md:86-89`); the spec is still marked “Human gate: pending” (line 13).
- impact: If the owner expects the approved plan's explicit ceremony, final-phase duration is inferred from the last manifest event rather than recorded, and the irreversible v1 event contract may be frozen before the plan deviation is ratified.
- fix: Obtain and record human ratification before the spec gate, or require an explicit `phase.exited` hook at every phase exit and update LT scenarios accordingly.

CLEAR: E — The phase-vocabulary contradiction above is the only framework-reality defect asserted; it is grounded in the pinned resolver/stamper source.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Completed the requested read-only rev-2 verification against SF1-SF19, the governing plan, and pinned repository source; only the required review artifact was written."
    }
  ],
  "changedFiles": [
    "docs/reviews/spec-sdlc-lifecycle-telemetry-2026-07-17/round2-gpt-5.6-luna.md"
  ],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "read rev-2 specification, consolidated SF1-SF19 adjudication, governing plan, and per-model round-1 reviews",
      "result": "passed",
      "summary": "All required review documents inspected top to bottom."
    },
    {
      "command": "git ls-tree -r --name-only 3baf57d -- skills/sdlc-retro docs/adr",
      "result": "passed",
      "summary": "No skills/sdlc-retro schema paths or ADR 0021 exist at the reviewed commit."
    },
    {
      "command": "git status --short",
      "result": "passed",
      "summary": "No staged files; pre-existing model-file modification was not changed."
    }
  ],
  "validationOutput": [
    "Verification table covers SF1-SF19; surviving and newly exposed defects are severity-rated with source/spec citations."
  ],
  "residualRisks": [
    "The review target is pre-implementation; absent future schema files and fixtures remain blocking until committed by the implementation."
  ],
  "noStagedFiles": true,
  "diffSummary": "Read-only round-2 specification verification; one required review artifact written, no product files modified.",
  "reviewFindings": [
    "high: spec §1/§3/§7 - event and run.json schemas are referenced but not actually pinned, and no-manifest run title/track sourcing is undefined.",
    "high: spec §6.2 - LLM kind-specific request/response shapes remain unspecified.",
    "high: spec §3 - six lifecycle phase type conflicts with four-value auto CLI phase vocabulary without a mapping.",
    "medium: spec LT17 - live git replay isolation is not tested.",
    "medium: spec §8 - render CLI stream/error contract is not frozen.",
    "medium: spec NF4/LT28 - redaction mechanism does not enforce no verbatim prompt text.",
    "medium: spec §9/LT25 - inventory omission test does not cover all claimed normative-reference classes.",
    "medium: plan R2/spec §4 - validator dispatch harvest hook is missing.",
    "medium: spec §3 - optional phase exit remains a pending plan deviation."
  ],
  "manualNotes": "SF2, SF3, SF4, SF7, SF11, and SF12 are only partial despite rev-2 incorporation claims; SF5-SF6, SF8-SF10, and SF13-SF19 are resolved by concrete text. The phase vocabulary finding is new and grounded in lib.mjs/resolve-panel.mjs/ensure-panel-agent.mjs."
}
```
