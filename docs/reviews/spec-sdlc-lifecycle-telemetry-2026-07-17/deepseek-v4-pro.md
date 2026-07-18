### Session directory discovery mechanism is undefined (blocks collector)

- severity: high
- confidence: high
- location: spec §6.1, "Session transcripts" paragraph
- defect: The spec states sessions are discovered from "the pi session directories for the consumer root and `<root>.worktrees/*`" but never defines the mapping from a repo-root path to pi session directory paths. The plan Context mentions `~/.pi/agent/sessions/<cwd-slug>/*.jsonl` (plan:344) but `<cwd-slug>` is a pi-internal transformation with no documented contract. The collector has no implementable default session discovery. The `--sessions-dir` override exists but the spec wording says it "extends" the default, implying there IS a default. Without this, the collector's core value (agent time, human-wait, token/cost rollups from transcripts) is unreachable through the default path.
- evidence:
  - Spec §6.1: "candidate session files come from the pi session directories for the consumer root and `<root>.worktrees/*` (overridable/extendable via repeatable `--sessions-dir`)"
  - Plan Context (plan:344): "Session transcripts: `~/.pi/agent/sessions/<cwd-slug>/*.jsonl`"
  - No code in `skills/sdlc/scripts/` defines a `<cwd-slug>` computation; no ADR or SKILL.md documents it. Searched the repo for `cwd-slug` or `sessionDir` mapping: only the plan Context reference exists.
- impact: The collector cannot correlate session transcripts to a run without the user manually discovering and passing session directories via `--sessions-dir`. Every run without manual `--sessions-dir` flags produces `sessions.none` coverage — agent time and per-model costs from transcripts are lost for default-path usage.
- fix: Define the default session-directory discovery in the spec: either (a) pin the `<cwd-slug>` derivation formula from the repo root (e.g. `~/.pi/agent/sessions/<sha256-or-slug-of-realpath>/`), or (b) state that there is no default — session directories are always explicit via `--sessions-dir` — and update §6.1 to remove the "pi session directories for the consumer root" claim, plus add a scenario proving the `sessions.none` marker with no `--sessions-dir`.

### Auto-emitted event `by` field values not specified

- severity: high
- confidence: high
- location: spec §3 event vocabulary table, §3 envelope
- defect: The envelope requires `"by":"script:<name>"|"agent"|"human:<name>"` but the vocabulary table (§3) marks events as "auto" or "prose" without stating what `by` value each auto-emitted event populates. For `panel.resolved` (auto, `resolve-panel`), `panel.agent_stamped` (auto, `ensure-panel-agent`), `panel.harvested` (auto, `harvest-panel`), and `task.validated` (auto, `validate-task`), the implementer must guess whether to pass `script:resolve-panel`, `script:resolve-panel.mjs`, or a different convention. The `<name>` part of `script:<name>` is never defined.
- evidence:
  - Spec §3 envelope: `"by":"script:<name>"|"agent"|"human:<name>"`
  - Spec §3 vocabulary: `panel.resolved | auto (resolve-panel)`, etc. — no `by` column.
  - Spec §3.1 emitter CLI: `--by WHO` — no format validation specified.
  - The `by` field is listed as required ("all fields required unless noted") but no defaults are stated for auto-emitted events.
- impact: Different implementers (or the same implementer making different guesses across scripts) will write inconsistent `by` values into the manifest. Since the manifest is an FS13 frozen stored-record shape, downstream consumers (collectors, future cross-run dashboards) that key on `by` will see fragmentation. The freeze is wrong until this is pinned.
- fix: Add a `by` column to the vocabulary table stating the exact value for each event, e.g. `script:resolve-panel` for `panel.resolved`, `script:ensure-panel-agent` for `panel.agent_stamped`, etc. Also validate `--by` against the envelope grammar in the emitter and exit 2 on mismatch.

### run.json JSON schema is absent from the spec

- severity: medium
- confidence: high
- location: spec §7
- defect: §7 states "Pinned by committed schema `skills/sdlc-retro/schema/run.schema.json`" but provides only a prose sketch of the top-level keys. The actual JSON Schema document is not included in the spec. For a frozen stored-record shape (FS13), the schema IS the contract; the prose sketch omits field types, required/optional distinctions, array item schemas, enum values for coverage markers, the `soft` sub-schema, and exact field names. An implementer reading only the spec cannot build a conformant `run.json` or validate one.
- evidence:
  - Spec §7: "Pinned by committed schema `skills/sdlc-retro/schema/run.schema.json` (validated in tests against all fixtures)"
  - Spec §7 prose sketch: `schemaVersion: 1`, `slug, title, track`, `coverage: [ { marker, detail? } ]`, `sizeProxies: { ... }`, `hard: { ... }`, `soft: { ... }` — field types, optionality, and nested shapes are undescribed.
  - Compare with how the spec handles the emitter envelope (§3) — exact JSON with types — vs the hand-wavy `run.json` sketch.
- impact: Build cannot produce a schema file without inventing details the spec should decide. If the schema is built during implementation and later found to contradict the spec's intent, the shape — already frozen — needs additive-only correction, but the correction surface is undefined until a schema exists. The review scenarios LT13-LT19 reference "validates against the committed schema" but the schema they validate against is unspecified here.
- fix: Either include the full JSON Schema inline in §7 (as the emitter envelope is included in §3), or commit a draft schema as part of the spec artifact and reference it with a content hash.

### Harvest source directory structure not specified

- severity: medium
- confidence: medium
- location: spec §5
- defect: The harvest script copies `status.json` and `events.jsonl` from `--from DIR` but never specifies whether DIR is the top-level pi-subagents run directory (where these files sit flat) or whether pi-subagents nests them per-model. The plan Context (plan:351-354) says artifacts are "stable `lifecycleArtifactVersion` 1 artifacts (`status.json`, `events.jsonl`)" at `<tmpdir>/pi-subagents-<scope>/` but does not describe whether a panel dispatch (multiple models) produces one directory containing all models' artifacts or one directory per model. The harvest script needs to know what to enumerate.
- evidence:
  - Spec §5: "Copies `status.json` and `events.jsonl` from `--from` (a pi-subagents run directory or an equivalent artifact directory) into `panels/<phase>-round<N>-<date>/`"
  - Plan Context (plan:351-354): "pi-subagents async runs: `<tmpdir>/pi-subagents-<scope>/`, stable `lifecycleArtifactVersion` 1 artifacts (`status.json`, `events.jsonl`) with `totalTokens`, `totalCost`, `model`/`attemptedModels`/`modelAttempts`..."
  - No code in the repo documents the subdirectory layout of a multi-model pi-subagents dispatch.
- impact: If the dispatch produces per-model subdirectories, the harvest script must enumerate them. If it produces a flat directory, the script copies two files. Getting this wrong means harvested data is incomplete or misattributed, and since panel cost/token data is already lost from historical runs (plan R2), getting the harvest wrong for v1 is a missed-at-launch defect.
- fix: Pin the expected directory structure under `--from`: either "DIR contains `status.json` and `events.jsonl` at its top level" (flat), or "DIR contains one subdirectory per model review, each with `status.json` and `events.jsonl`" (nested). Validate this against actual pi-subagents dispatch output.

### Collector error paths for failed `--gh-cmd` / `--llm-cmd` are undefined

- severity: medium
- confidence: medium
- location: spec §6.1-6.2
- defect: §6.1 defines `--no-github` for skipping GitHub and §6.2 defines `--no-llm` for skipping LLM, but neither defines the behavior when `--gh-cmd CMD` or `--llm-cmd CMD` is provided and the command fails (non-zero exit, crash, invalid JSON output). No scenario (LT13-LT19) covers this error path. The spec's coverage-marker system should have an enumerated marker for these failures but doesn't.
- evidence:
  - Spec §6.1: "PR metadata, review threads, and timeline via `--gh-cmd` (default `gh`). `--no-github` skips with a coverage marker." No failure behavior stated.
  - Spec §6.2: "`--llm-cmd CMD` names an executable receiving one JSON request on stdin and returning one JSON response on stdout". No failure behavior stated.
  - Scenario LT13: "complete fixture run store (manifest + harvests + committed v3 transcript fixture + review fixtures + fake `--gh-cmd` + fixture `--llm-cmd`)" — only the happy path. No scenario for `--gh-cmd` returning exit 1 or `--llm-cmd` producing non-JSON.
- impact: The collector's operational contract has undefined behavior for a common failure mode. An implementer must guess whether to produce a coverage marker (like `github.error`), exit non-zero, or silently skip. Different choices produce different `run.json` shapes for the same underlying gap.
- fix: Define the failure behavior: e.g. "if `--gh-cmd` exits non-zero or `--llm-cmd` returns invalid JSON, the collector emits a coverage marker (`github.error` / `llm.error`) and continues; the run.json remains valid." Add scenario(s) covering these paths.

### `--by` CLI flag has no format validation

- severity: medium
- confidence: medium
- location: spec §3.1
- defect: The emitter CLI accepts `--by WHO` with no stated validation. The envelope grammar restricts `by` to `"script:<name>"|"agent"|"human:<name>"`, but the emitter does not enforce this. A caller passing `--by "something-else"` would write an invalid line into the manifest. The collector handles malformed lines by skipping them (§6.1: "malformed lines are counted and skipped"), but the emitter should reject invalid input at write time, not defer detection to read time — especially since the manifest is an append-only log that is never corrected.
- evidence:
  - Spec §3.1: "Exit 2: usage error, unknown event type, malformed/oversized `--payload`, or an I/O failure" — `--by` format is absent from the validation list.
  - Spec §3 envelope: `"by":"script:<name>"|"agent"|"human:<name>"` — constrained grammar.
- impact: Prose-emitted events from SKILL.md (where the agent constructs the emitter invocation) can write `by` values that violate the envelope contract, producing collector-skipped lines and coverage gaps that are indistinguishable from genuine corruption.
- fix: Add `--by` format validation to the emitter's exit-2 conditions: reject values that don't match `/^(script:[a-z][a-z0-9-]*|agent|human:[^\s:]+)$/` or equivalent.

### validate-task emission timing tied to optional `--report` flag

- severity: low
- confidence: high
- location: spec §3.3
- defect: §3.3 states `validate-task.mjs` emits `task.validated` "after writing its receipt." But `--report` is an optional flag on `validate-task.mjs` (ADR 0014, confirmed at `validate-task.mjs` line with `parseArgs`). When `--report` is not passed, no receipt is written, and the emission trigger point is undefined. The implementer must guess whether to emit anyway (after report assembly) or skip emission when `--report` is absent.
- evidence:
  - Spec §3.3: "validate-task.mjs emits task.validated after writing its receipt"
  - ADR 0014: "`--report` persists the JSON atomically" — optional.
  - `validate-task.mjs` (line with `if (opts.report)`): receipt writing is conditional on `--report`.
- impact: In CI or headless invocations that omit `--report` (using only `--format json` for stdout), the emission behavior diverges from the spec's stated trigger. The SKILL.md validator subagent always uses `--report`, but the CLI's standalone contract is ambiguous.
- fix: Clarify: "validate-task.mjs emits `task.validated` after the report is assembled and, when `--report` is passed, after the receipt is written."

### Spec references ADR 0021 which does not exist

- severity: low
- confidence: high
- location: spec §1
- defect: The spec states "FS13 (ADR 0021)" as though ADR 0021 already records the decision. But ADR 0021 does not exist — the `docs/adr/` directory ends at ADR 0020. The ADR is part of this feature's deliverables (plan DoD: "ADR freezes the manifest event vocabulary and run.json v1 contract"). The spec's frozen-shape claim is circular: it invokes an ADR that hasn't been written yet to justify its own immutability.
- evidence:
  - Spec §1: "Two frozen stored-record shapes, together FS13 (ADR 0021)"
  - `docs/adr/` listing: files end at `0020-skill-relative-paths-fs12.md`; no `0021` exists.
  - Plan DoD: "ADR freezes the manifest event vocabulary and run.json v1 contract" — ADR 0021 is an output, not a pre-existing authority.
- impact: Low (self-correcting once ADR 0021 is written as part of implementation). But a spec claiming immutability should not invoke a non-existent authority. A reader who checks the reference finds nothing.
- fix: Reword to "FS13 (to be recorded as ADR 0021)" or write ADR 0021 as part of the spec package.

### CLEAR on remaining attack surfaces

CLEAR: A — Frozen shapes vs the plan's locked decisions, field by field: the event vocabulary, run-store layout, and run.json structure cover all plan-required data (phases, gates, panels, models, tokens, cost, interventions, rework). The hardcode decision for `.pi/sdlc/runs/` and `docs/retros/` correctly respects the plan's prohibition on extending `paths`. No missing field that cannot be backfilled.

CLEAR: B — Verification scenarios: all 27 scenarios (LT1–LT27) are falsifiable and offline. Each maps to a specific spec section and can be tested with fixture data. LT3 (concurrent emitters) is the riskiest but falsifiable with a spawn fixture. LT17 (regeneration) has the offline-replay-mode ambiguity noted above but is structurally falsifiable.

CLEAR: C — Contracts and interfaces: emitter, harvest, collector, and renderer CLIs each have pinned signatures, exit codes, and envelope shapes. The emitter's signature uses positional `<event>` which is conventional. The key gaps (session discovery, harvest directory structure, `by` defaults) are captured as findings above.

CLEAR: D — Contradictions with plan: no direct contradictions found. The spec correctly implements the plan's R1-R5 outcomes, the hardcoded-paths decision, the regenerate-don't-migrate policy, and the additive-only FS5 flag changes. The plan's F3 resolution (caller-side lifecycle-check emission) is correctly reflected.

CLEAR: E — Framework reality: verified against `resolve-panel.mjs` (FS5, exits 0/1/2, `--emit-tasks` JSON shape), `ensure-panel-agent.mjs`, `validate-task.mjs` (ADR 0014 exits 0/1/2, `--report` optional), `check-lifecycle.mjs` (ADR 0017, read-only), `lib.mjs` (closed `paths` key set at CONFIG_DEFAULTS), `sdlc.config.schema.json` (`additionalProperties: false`). The spec's claims about frozen surface preservation are implementable against the actual code. `.gitignore` currently covers `.pi/agents/` and `.pi-subagents/` but not `.pi/sdlc/runs/` — the spec correctly requires adding it (§9, LT26).

CLEAR: F — Non-functional requirements: NF1-NF4 are stated and each is tied to at least one scenario or test assertion. NF1 (offline/deterministic) is gated by LT3-LT23 all being fixture-based. NF2 (no new runtime deps) is testable. NF3 (fail-soft) is gated by LT6-LT9. NF4 (no secrets in committed artifacts) is a design constraint enforced by the raw/ vs committed separation.

CLEAR: G — Honesty sweep: the spec is unusually honest. It labels human-wait as a proxy with a cap (§6.3), calls LLM output "soft data" with attribution (§6.2, §7), marks coverage gaps explicitly (§7 `coverage` array), and never claims cross-run analytics or past-run reconstruction (plan scope out). The dogfood retro is described as "partial coverage by design" (LT27). No over-claiming detected beyond the ADR-0021 circularity noted above.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Returned 8 concrete findings with file paths, severity ratings, spec locations, evidence citations, impacts, and fixes. Found 2 high-severity (session discovery undefined, auto-emitted `by` field unspecified), 4 medium-severity, 2 low-severity findings."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "grep for session/cwd-slug mapping in repo",
      "result": "passed",
      "summary": "Only the plan Context mentions ~/.pi/agent/sessions/<cwd-slug>; no code defines the mapping from consumer root to cwd-slug"
    },
    {
      "command": "ls docs/adr/ | sort",
      "result": "passed",
      "summary": "ADRs end at 0020; ADR 0021 referenced in spec §1 does not exist"
    }
  ],
  "validationOutput": [],
  "residualRisks": [
    "Session directory discovery: collector defaults to sessions.none unless user passes --sessions-dir; this is a launch-day coverage gap but correctable additively since the sessions.none marker already exists in the schema",
    "Concurrent emitter atomicity: O_APPEND + single write under 32 KiB is effectively atomic on Linux regular files but POSIX does not guarantee it for regular files; LT3 may be filesystem-dependent"
  ],
  "noStagedFiles": true,
  "diffSummary": "No code changes; review-only artifact written to docs/reviews/spec-sdlc-lifecycle-telemetry-2026-07-17/deepseek-v4-pro.md",
  "reviewFindings": [
    "high: spec §6.1 - session directory discovery mechanism undefined; no mapping from repo root to pi session directories",
    "high: spec §3 - auto-emitted event `by` field values not specified in vocabulary table; implementer must guess",
    "medium: spec §7 - run.json JSON schema absent from spec; prose sketch insufficient for frozen stored-record shape",
    "medium: spec §5 - harvest source directory structure unspecified; flat vs nested layout not pinned",
    "medium: spec §6.1-6.2 - collector error paths for failed --gh-cmd/--llm-cmd undefined; no scenario covers failures",
    "medium: spec §3.1 - --by CLI flag has no format validation; invalid by values can enter the manifest",
    "low: spec §3.3 - validate-task emission timing tied to optional --report flag",
    "low: spec §1 - references ADR 0021 which does not exist"
  ],
  "manualNotes": "All findings are concrete and actionable without follow-up questions. The spec is fundamentally sound — the high findings are specification gaps (missing definitions), not design flaws. The session discovery gap is the most impactful: it means the collector's default path cannot correlate transcripts to runs, which neuters the agent-time and cost-from-transcripts features unless users manually pass --sessions-dir."
}
```
