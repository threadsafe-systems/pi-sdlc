# Spec panel — sdlc-lifecycle-telemetry (rev as-committed)

- Reviewer: zai/glm-5.2 (author vendor anthropic excluded)
- Artifact: `docs/specs/2026-07-17-sdlc-lifecycle-telemetry.md` @ a57815a
- Governing: plan `docs/plans/2026-07-17-sdlc-lifecycle-telemetry.md` rev 2;
  ADRs 0005/0014/0017/0019/0020; frozen CLIs in `skills/sdlc/scripts/`.
- Scope: contracts, frozen shapes, scenario falsifiability, framework reality.
  Visual styling is out of scope (implementation freedom).

Every framework claim below was verified against the pinned source at commit
a57815a (the branch HEAD).

## Findings

### Regeneration-from-`raw/` for sessions is unspecified, and LT17 cannot gate it

- severity: high
- confidence: high
- location: spec §6.1 (session adapter), §6.4 (raw/regeneration), §6 (collect
  CLI), scenario LT17
- defect: The session adapter has only one documented input path — live pi
  session directories via `--sessions-dir` — yet §6.4 promises that a re-run
  against a populated `raw/` reproduces an identical `run.json` "from the
  snapshot". There is no CLI mode (`--from-raw`/`--replay`) and no rule that
  says the collector reads `raw/sessions/` when present, so §6.1 and §6.4 do
  not connect. Worse, LT17 ("offline replay mode") leaves live sources in
  place, so it passes trivially by re-reading unchanged inputs and never
  proves the collector consults `raw/sessions/` at all.
- evidence: §6.1 adapter #3: "candidate session files come from the pi session
  directories for the consumer root and `<root>.worktrees/*`
  (overridable/extendable via repeatable `--sessions-dir`)". §6.4: "collect
  snapshots verbatim into `raw/`: every correlated session transcript file …
  Re-running collect against a run store whose `raw/` is populated … reproduces
  the identical run.json … Regeneration is defined from the snapshot." The
  §6 collect signature lists `--sessions-dir DIR`… and `--llm-cmd/--no-llm`,
  `--gh-cmd/--no-github` but no raw-read switch. LT17: "after one collect
  populates `raw/`, a second collect in offline replay mode reproduces a
  byte-identical run.json" — it never removes or mutates the live session
  sources.
- impact: `raw/` is part of FS13 (the irreversible run-store layout) and
  "regenerate-from-raw is the whole versioning story" (plan pragmatism
  clause). The plan's stated reason `raw/` exists is that parent sessions get
  pruned. If the implementer ships a collector that on "regeneration" still
  reads live `--sessions-dir` (the only documented session source), then once
  those sessions are pruned, regeneration silently yields a gappy `run.json`
  instead of the promised byte-identical reproduction — exactly the failure
  `raw/` was built to prevent. The frozen shape is write-only in effect and
  the core R3 durability outcome is unverifiable.
- fix: Pin the regeneration read path in §6.4 (e.g. "when `raw/sessions/` is
  populated, collect reads sessions from there and ignores `--sessions-dir`")
  and strengthen LT17 to remove/mutate the live `--sessions-dir` source before
  the second collect so it actually falsifies a collector that ignores the
  snapshot.

### The FS11 "covers every normative reference" outcome has no falsifiable scenario

- severity: medium
- confidence: high
- location: spec §9, scenario LT25; `check-references.mjs`
- defect: §9 claims the inventory is extended to cover *every* package-owned
  normative reference the new surfaces introduce, but the FS11 checker only
  validates that the *listed* entries are well-formed and their targets exist;
  it has no un-inventoried-reference detection. LT25 asserts "passes" +
  "deleting a target fails it" — neither can detect a missing entry (e.g. an
  un-inventoried `render-retro.sh`). Separately, §4 mandates `record-run-event.sh`
  appear at every hook step, so an inventory entry whose `assertion` is the bare
  token would fail the checker's exactly-once rule.
- evidence: `check-references.mjs`: `if (["package",
  "readiness"].includes(entry.resolution) && sourceCount !== 1) { add(entry.id,
  "fail", \`source assertion occurs ${sourceCount} times; expected exactly
  once\`)` — package/readiness assertions must occur exactly once in their
  source. §4: "each mandated hook step contains the token `record-run-event.sh`"
  (many occurrences in `SKILL.md`). §9: "additive entries … covering every
  package-owned normative reference introduced by: … the sdlc SKILL.md hook
  steps (`record-run-event.sh`, `harvest-panel.sh`)". LT25 gates only listed
  entries.
- impact: A whole script can ship uninventoried and LT25 stays green, so the
  "FS11 discipline" honesty claim (plan R5 DoD) is not mechanically enforced,
  only manually asserted — the very gap FS11 exists to close.
- fix: Add a structural coverage test (grep `skills/sdlc-retro/scripts/` and
  the new hook tokens in `SKILL.md`, assert each script name has an inventory
  entry), and note in §9 that hook-step tokens repeat so each entry's
  `assertion` must be a unique phrase, not the bare token.

### `validate-task` emission trigger ("after writing its receipt") misstates the frozen script

- severity: medium
- confidence: high
- location: spec §3.3, scenario LT8; `validate-task.mjs`, ADR 0014
- defect: §3.3 says "`validate-task.mjs` emits `task.validated` after writing
  its receipt." `validate-task.mjs` never writes a receipt: it writes an
  optional `--report` (`atomicWriteReport`, only when `--report` is passed);
  the *receipt* is assembled by the validator subagent and verified by
  `verify-task-receipt.mjs` (ADR 0014). So the emission trigger is undefined
  for the no-`--report` path and for non-PASS verdicts, and a literal reading
  ties emission to an output the runner does not produce.
- evidence: `validate-task.mjs` `main()` writes only via
  `atomicWriteReport(opts.report, …)` guarded by `if (opts.report)`; no
  `receipt` string anywhere in the file (grep returns nothing). ADR 0014:
  "Each task stores a runtime receipt … under
  `docs/reviews/task-validate-<feature>-<task-id>-<date>/`, verified by
  `scripts/verify-task-receipt.mjs`" — the receipt is the subagent's artifact.
  §3.3 ties the auto-emit to "writing its receipt". LT8 covers only the PASS
  case.
- impact: An implementer could gate `task.validated` on the `--report` write,
  silently suppressing emission whenever `--report` is absent, or skip emission
  on FAIL/ERROR — neither behaviour is pinned or tested, and R1's
  "always-on/auto-emitted" intent is violated.
- fix: State in §3.3 that emission occurs after the report is *computed*
  (regardless of `--report`), for every verdict (PASS/FAIL/ERROR), and add an
  LT8 assertion for a FAIL fixture emitting `task.validated` with the failing
  verdict.

### `sessions.none` marker trigger is under-specified for the manifest-present case

- severity: low
- confidence: medium
- location: spec §6.1 (correlation rule), §7 (coverage enumeration), LT14
- defect: §6.1 ties `sessions.none` specifically to "No manifest ⇒ window
  undefined ⇒ sessions.none", but LT14 expects a marker when the manifest
  exists yet *no* sessions correlate (window defined, zero hits). The
  enumeration in §7 lists `sessions.none` without distinguishing the two
  causes, so the manifest-present-but-no-correlated-sessions gap has no named
  marker.
- evidence: §6.1: "No manifest ⇒ window undefined ⇒ `sessions.none` coverage
  marker (never guessed)." LT14: "a gappy store (no panels dir, no
  correlatable sessions) produces … coverage markers [that] name each gap."
  §7 enumerates `sessions.none` once.
- impact: An implementer must guess whether to reuse `sessions.none` or invent
  a second marker; either choice could diverge from the renderer's `#coverage`
  expectations (LT23).
- fix: State in §6.1 that `sessions.none` fires whenever zero sessions
  correlate, regardless of whether the cause is a missing manifest or an empty
  window.

### `run.json` schema-validation method is unpinned under the no-dependency constraint

- severity: low
- confidence: medium
- location: spec §7, NF2; precedent `validate-task.mjs` `inspectManifest`
- defect: §7 says run.json is "validated … against the committed schema" and
  NF2 forbids new runtime deps, but Node has no built-in JSON-Schema validator.
  The only NF2-compliant path is a hand-rolled validator mirroring the schema
  (the existing precedent), which the spec never states; an implementer could
  instead reach for `ajv` and violate NF2.
- evidence: §7: "Pinned by committed schema … (validated in tests against all
  fixtures)." NF2: "no new runtime dependencies (Node built-ins only …)."
  Existing precedent: `validate-task.mjs` ships
  `schema/task-validation-manifest.schema.json` but validates via the
  hand-rolled `inspectManifest`, never a schema library; no `ajv`/similar
  appears anywhere in the repo.
- impact: Ambiguity between "validates against the schema" (implies a
  validator library) and NF2 (forbids one); risk of an NF2 breach or a
  schema/validator drift where the committed file is decorative.
- fix: State in §7 that validation is hand-rolled to mirror
  `run.schema.json` (no schema library), matching the `inspectManifest`
  precedent, and that LT13/19 assert the hand-rolled validator and the schema
  agree on all fixtures.

### `phase.exit` dropped from the plan's "enter/exit" vocabulary

- severity: low
- confidence: medium
- location: plan R1 ("phase enter/exit"); spec §3 event table; §6.3
- defect: The plan names "phase enter/exit" as skill-prose events, but the
  spec's v1 vocabulary provides only `phase.entered` (plus `phase.backward`)
  and attributes phase duration purely from `phase.entered` boundaries +
  window end. The exit half of the plan's stated events is absent with no
  recorded decision.
- evidence: Plan R1: "Skill-prose-emitted events: phase enter/exit …". Spec §3
  table: `phase.entered`, `phase.backward` only. §6.3: "per-phase attribution
  by `phase.entered` boundaries."
- impact: Low — exit is derivable and the design is coherent — but a phase
  that is entered and then the run ends is bounded only by the manifest window,
  and a future "phase abandoned without a successor" signal would need a new
  event under additive-only evolution.
- fix: Add a one-line note in §3 that `phase.exit` is intentionally derived
  (next `phase.entered` or window end) rather than emitted, so the delta from
  the plan is a recorded decision.

## CLEAR notes

- CLEAR: A (frozen shapes vs plan) — event envelope is additive-only with
  `payload` additive; `run.json` separates `hard`/`soft` structurally; FS1
  `paths` stays closed (`lib.mjs` `pathKeys` = plans/specs/reviews/agents;
  schema `additionalProperties:false`) and the spec hardcodes rather than
  extending it; FS5 changes are additive optional flags only. (The `raw/`
  read-back gap is captured as the HIGH finding, not a shape-completeness
  defect.)
- CLEAR: C (contracts/interfaces) — emitter/collect/render CLI envelopes match
  the house `0/1/2` exit pattern and `--config|--repo-root`/`--format
  text|json` conventions; slug grammar `^[a-z0-9]+(?:-[a-z0-9]+)*$` matches
  `validate-task.mjs` `TASK_RE`; FS12 skill-relative invocation is consistent.
- CLEAR: E (framework reality) — verified `resolve-panel.mjs`,
  `ensure-panel-agent.mjs`, `validate-task.mjs`: all primary output goes to
  stdout, diagnostics/errors via `lib.mjs` `fail()`→stderr, so an emission side
  effect writing only to the run-store file + prefixed stderr cannot alter
  stdout/exit (LT6–LT9 implementable as written). `check-lifecycle.{sh,mjs}`
  untouched is testable (LT10). O_APPEND + single write ≤32 KiB is a sound
  atomic-append mechanism (LT3). Cross-skill `lib.mjs` import via
  package-relative path is feasible.
- CLEAR: G (honesty) — §12 "opt-in" reads as "adopted by skill update, no
  forced migration", consistent with always-on emission; NF4 "no verbatim user
  text" is a design+human-review guarantee (gist) rather than mechanically
  enforced, which matches the plan's accepted mitigation (no falsifiable
  scenario exists for it, but the plan does not promise one).

