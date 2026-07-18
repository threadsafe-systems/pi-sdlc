# Round 2 verification — sdlc-lifecycle-telemetry spec rev 2

- Reviewer: deepseek/deepseek-v4-pro (author vendor anthropic excluded)
- Artifact: `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` @ 3baf57d (rev 2)
- Round-1 adjudication: `docs/reviews/spec-sdlc-lifecycle-telemetry-2026-07-17/consolidated.md` (SF1–SF19)
- Round-1 per-model: gpt-5.6-luna, glm-5.2, deepseek-v4-pro in same directory
- Plan: `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` (rev 2)
- Scope: SF1-SF19 fix verification + new-defect sweep from rev-2 changes

## SF1–SF19 verification table

| SF | Severity (round 1) | Verdict | Rev-2 location & evidence |
|----|--------------------|---------|--------------------------|
| SF1 | HIGH | **RESOLVED** | §3 normative payload-type table + field types; §3 `by` grammar `^(script:[a-z][a-z0-9-]*|agent|human:[^\s:]+)$`; §3 auto `by` values pinned (`script:resolve-panel`, etc.); §7 closed marker set enumerated; §7 hand-rolled validator + schema-agreement test obligation |
| SF2 | HIGH | **RESOLVED** | §3 table: `phase.exited` event added (prose, optional); §6.3: "a phase spans its `phase.entered.ts` to its explicit `phase.exited.ts` when present, else the next `phase.entered.ts`, else the window end"; recorded decision text in event table |
| SF3 | HIGH | **RESOLVED** | §2: `raw/` layout includes `reviews/`, `git/`, `github/`, `llm/`, `sessions/`; §6.4: snapshots **every non-manifest input**; §6: `--from-raw` replay mode reads exclusively from `raw/`; LT17: live sources destroyed/mutated before replay |
| SF4 | HIGH | **RESOLVED** | §6.2: full LLM protocol — `{kind, slug, model?, inputs}` with per-kind `inputs`; one call per request; timeout 120 s; `llm.error:<kind>`; protocol schema at `skills/sdlc-retro/schema/llm-protocol.schema.json` |
| SF5 | HIGH | **RESOLVED** | §6.3: agent time = "assistant ts − ts of the immediately preceding entry in the same session file, JSONL order; first-entry turns contribute 0"; human-wait = user−preceding-assistant gap "each gap capped at 30 minutes"; disjointness rule: "nested child session files are excluded from correlation" → "panel is never counted twice"; `unattributed` bucket for out-of-span entries |
| SF6 | HIGH | **RESOLVED** | §8: per-section data bindings — `#exec-strip` renders every `hard.totals` value; `#phase-swimlane` one element per `hard.phases[]` with `data-phase`; `#cost-breakdown` per-model/per-phase with `data-model`/`data-phase`; `#panel-deepdive` per finding; `#steering-map` per steering entry; `#rework-panel` three rework counts; LT20 asserts known-answer values; "an empty shell fails" |
| SF7 | MED | **RESOLVED** | §6: `--format json` envelope `{ok, out, coverage[], warnings[]}` on stdout; stderr prefix `sdlc-telemetry:`; atomic temp+rename; §8: render exits 0/1/2 |
| SF8 | MED | **RESOLVED** | §4: "the panel-dispatch step additionally contains a skill-relative `harvest-panel.sh` invocation token"; LT24: asserts dispatch step contains the harvest token |
| SF9 | MED/LOW | **RESOLVED** | §3.3: "emits `task.validated` after its report is **computed** — for every verdict (PASS, FAIL, and ERROR) and regardless of whether `--report` was passed"; LT8: PASS/FAIL × report/no-report |
| SF10 | HIGH | **RESOLVED** | §3.1: "the no-partial-line guarantee is prevalidation-scoped, not a filesystem-transaction claim: a torn final line from a rare mid-append I/O failure is tolerated by collectors, which count and skip malformed lines" |
| SF11 | MED | **RESOLVED** | NF4: "every committed soft string passes a deterministic redaction pass (environment-value redaction per the PV2 `buildRedactionValues` precedent) and is capped at 500 characters; LT28 is the gate"; LT28: sentinel scenario with secret + verbatim prompt → neither appears in run.json/dashboard |
| SF12 | MED | **RESOLVED** | §9: "Each new entry's `assertion` is a **unique phrase** in its source (the checker enforces exactly-once; a bare repeated token like `record-run-event.sh` cannot be an assertion)"; structural coverage test asserts every script/hook has an inventory entry; LT25 covers both |
| SF13 | HIGH | **RESOLVED** | §6.1: "derived best-effort from the observed pi convention: `~/.pi/agent/sessions/` + the absolute path with its leading `/` dropped, every `/` replaced by `-`, wrapped as `--<mapped>--`"; `sessions.dir_unresolved` marker; repeatable `--sessions-dir` override |
| SF14 | HIGH+MED | **RESOLVED** | §3: auto `by` values pinned per CLI (`script:resolve-panel`, etc.); §3.1: exit 2 for "a `--by` value violating the §3 grammar" |
| SF15 | MED | **RESOLVED** | §5: "`--from` names a directory carrying `status.json` and `events.jsonl` at its **top level** — the shape of a pi-subagents async run directory (`asyncDir`)"; foreground dispatches harvest as `missed[]` |
| SF16 | MED | **RESOLVED** | §6.1: failing `--gh-cmd` → `github.error`, collection continues; §6.2: invalid response/non-zero exit/timeout → `llm.error:<kind>`, collection continues; LT29: scenario for both |
| SF17 | LOW | **RESOLVED** | §6.1: "`sessions.none` fires whenever **zero sessions correlate**, whatever the cause (no manifest, undefined window, or an empty window) — never guessed" |
| SF18 | LOW | **RESOLVED** | §7: "schema validation is **hand-rolled** (the `inspectManifest` precedent in `validate-task.mjs`), never a schema library; tests assert the hand-rolled validator and the committed schema file agree on every fixture" |
| SF19 | LOW | **RESOLVED** | §1: "Two frozen stored-record shapes, together **FS13** (to be recorded as ADR 0021, a deliverable of this feature)" — no circular reference to non-existent ADR |

**Verdict: 19/19 resolved. Zero regressions.**

## New defects introduced in rev 2

### ND1 — `by` grammar regex rejects human names containing spaces

- severity: medium
- confidence: high
- location: spec §3 (envelope grammar), §3.1 (emitter validation)
- defect: The `by` field grammar `^(script:[a-z][a-z0-9-]*|agent|human:[^\s:]+)$` uses `[^\s:]+` for the human-name part, which rejects any value containing whitespace. A natural `--by "human:Neil Chambers"` would fail the emitter's exit-2 validation. The prose envelope `"human:<name>"` gives no indication that spaces are forbidden, and the SKILL.md hook steps would plausibly use a space-separated human name. The spec never documents this constraint.
- evidence:
  - Spec §3: "`by` MUST match `^(script:[a-z][a-z0-9-]*|agent|human:[^\s:]+)$`"
  - Spec §3.1: "Exit 2: … a `--by` value violating the §3 grammar"
  - `[^\s:]` is a negated character class: matches any single character that is NOT whitespace and NOT colon. `human:Neil Chambers` → `[^\s:]+` captures `Neil`, then ` Chambers` (space + more) fails to match `$`.
- impact: The emitter silently rejects a natural human-name format. An operator or SKILL.md author who passes `--by "human:First Last"` gets a confusing exit 2 ("usage error") instead of a recorded event. The workaround (slugified names like `human:neil-chambers`) is undiscoverable from the spec. At worst, prose-emitted events from human gate approvals ship with broken invocations and silently missing telemetry.
- fix: Either (a) relax the human-name regex to `human:[^:]+` (allow spaces), or (b) document the no-whitespace constraint explicitly with a recommended slug-style convention (`human:first-last`) in §3.

### ND2 — `manifest.partial` coverage marker has no documented trigger condition

- severity: low
- confidence: medium
- location: spec §7 (marker set), §6.1 (manifest adapter)
- defect: The closed marker set in §7 includes `manifest.partial` as a valid marker, but no section of the spec defines when the collector emits it. §6.1 says malformed lines are "counted and skipped (coverage marker)" but does not name `manifest.partial` as the marker. The trigger condition (manifest exists but has malformed lines? manifest present but missing expected event types?) is left to the implementer.
- evidence:
  - Spec §7: coverage marker set includes `manifest.partial`
  - Spec §6.1: "malformed lines are counted and skipped (coverage marker)" — does not name `manifest.partial`; the marker name is implied but not stated
  - Compare with `manifest.absent` which is clearly tied to "no manifest and no run store" in §6 exit-1
- impact: Low. An implementer can reasonably infer that malformed lines produce `manifest.partial`. But the marker's exact trigger is undefined — does one malformed line trigger it? Any line? Only if all lines are malformed? Different choices produce different coverage arrays for the same input.
- fix: In §6.1, state: "malformed lines are counted and skipped, and the collector records a `manifest.partial` coverage marker when at least one line is malformed."

## Attack-surface sweep (A–G)

CLEAR: A — Frozen shapes vs plan. All plan-required data (phases, gates, panels, models, tokens, cost, interventions, rework) are captured. Hardcoded paths respect the `paths`-is-closed decision (`lib.mjs` `CONFIG_DEFAULTS.paths` = 4 keys, `sdlc.config.schema.json` `additionalProperties: false`). FS5 changes are additive optional flags only.

CLEAR: B — Verification scenarios. All 27 scenarios (LT1–LT29, skipping LT24-LT27 counted once) are falsifiable and each maps to a spec section. LT3 (concurrent emitters), LT17 (regeneration with destroyed sources), and LT28 (sentinel leakage) are the strongest adversarial gates and are correctly specified.

CLEAR: C — Contracts and interfaces. Emitter, harvest, collector, and renderer CLIs each have pinned signatures, exit codes, and envelope shapes. The collector's `--format json` envelope `{ok, out, coverage[], warnings[]}` has undefined field-level types but matches the house pattern's level of detail (FS8 precedent).

CLEAR: D — Contradictions. No contradictions found between spec and plan. The SF2 phase.exited deviation is explicitly recorded as a decision. No internal contradictions in rev 2.

CLEAR: E — Framework reality. Verified: `lib.mjs` `CONFIG_DEFAULTS` (closed paths), `validate-task.mjs` `TASK_RE` (slug grammar match), `inspectManifest` (hand-rolled validator precedent), `.gitignore` (currently `.pi/agents/` only — spec correctly requires adding `.pi/sdlc/runs/`), `HOOK_PHASES` (six lifecycle phases match spec). All spec claims about frozen-surface preservation are implementable.

CLEAR: F — Non-functional requirements. NF1–NF4 each tied to scenarios: NF1 (LT3–LT23 all fixture-based, no network), NF2 (testable — Node built-ins only), NF3 (LT6–LT10 byte-identical stdout/exit), NF4 (LT28 sentinel scenario).

CLEAR: G — Honesty sweep. Human-wait labelled a proxy with explicit 30-minute cap. LLM output is "soft data" with attribution, structurally separated from `hard` in run.json. Coverage markers make gaps explicit. Dogfood retro described as "partial coverage by design." No over-claims detected beyond ND1 (undocumented whitespace constraint).

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Verified all 19 SF1–SF19 fixes in rev 2 spec text with section citations. Found 0 regressions. Swept attack surfaces A–G. Found 1 medium new defect (ND1: by-grammar rejects spaces in human names) and 1 low new defect (ND2: manifest.partial trigger undocumented)."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "grep TASK_RE skills/sdlc/scripts/validate-task.mjs",
      "result": "passed",
      "summary": "Verified slug grammar ^[a-z0-9]+(?:-[a-z0-9]+)*$ matches spec §2"
    },
    {
      "command": "grep inspectManifest skills/sdlc/scripts/validate-task.mjs",
      "result": "passed",
      "summary": "Verified hand-rolled validator precedent exists at validate-task.mjs:88"
    },
    {
      "command": "grep CONFIG_DEFAULTS skills/sdlc/scripts/lib.mjs",
      "result": "passed",
      "summary": "Verified paths is a closed 4-key set; spec correctly hardcodes instead of extending"
    },
    {
      "command": "grep '\\.pi/' .gitignore",
      "result": "passed",
      "summary": "Verified .gitignore currently covers .pi/agents/ only; spec correctly requires adding .pi/sdlc/runs/"
    },
    {
      "command": "ls docs/adr/ | sort | tail -3",
      "result": "passed",
      "summary": "Confirmed ADRs end at 0020; spec rev 2 correctly says 'to be recorded as ADR 0021'"
    }
  ],
  "validationOutput": [
    "19/19 round-1 findings resolved with no regressions",
    "1 new medium defect: by-grammar human:[^\\s:]+ rejects space-containing human names",
    "1 new low defect: manifest.partial marker trigger condition undocumented",
    "All 7 attack surfaces (A-G) clear of additional defects"
  ],
  "residualRisks": [
    "ND1: human names with spaces rejected by emitter -- workaround exists (slugify names) but is undiscoverable",
    "LT3 concurrent-emitter atomicity: O_APPEND + single write under PIPE_BUF is effectively atomic on Linux but POSIX does not guarantee it for regular files",
    "run.json JSON schema still not committed (spec §7 references it as a future artifact); schema sketch is sufficient for spec-level review but Build must produce the actual schema file"
  ],
  "noStagedFiles": true,
  "diffSummary": "No code changes. Read-only verification of spec rev 2 against round-1 findings SF1-SF19 + new-defect sweep.",
  "reviewFindings": [
    "medium: spec §3, §3.1 - by-grammar human:[^\\s:]+ rejects space-containing human names (ND1)",
    "low: spec §7, §6.1 - manifest.partial marker trigger condition undocumented (ND2)"
  ],
  "manualNotes": "Rev 2 is solid. All 19 round-1 findings are correctly addressed with honest, specific text. The two new defects are minor: ND1 is a one-character regex fix or one-sentence documentation addition; ND2 is a one-sentence clarification. The spec is ready for human gate with these two nits."
}
```
