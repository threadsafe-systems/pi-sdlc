### DoD item 1: "byte-for-byte" claim is internally contradictory with FS9 v2 output

- severity: high
- confidence: high
- location: Definition of done, item 1
- defect: The DoD asserts repos with no `lifecycle` block "behave byte-for-byte as today across check-lifecycle (v2)." But FS9 v2 bumps `schemaVersion: 1 → 2` and adds a `shape` field to the JSON envelope (per #40 research §5, ratified). These are literal byte changes in the checker output — the claim cannot be true as written. The parenthetical clarification "falsifiable via existing FS9 v1 fixtures remaining green unmodified" references the **v1** checker (which stays frozen), not v2 — the DoD conflates v1 fixture preservation (correct) with v2 output identity (incorrect).
- evidence: Plan DoD item 1: "byte-for-byte as today across check-lifecycle (v2), resolve-panel, setup-sdlc, and the skill prose"; #40 research §5: "FS9 report schemaVersion: 1 → 2 … gaining a shape field"; ADR 0017: "Adding check ids, changing grammar, or changing envelope fields requires an explicit FS9 schema-version bump and migration."
- impact: A Spec author reading the DoD literally would expect v2 JSON output to be byte-identical to v1 on no-lifecycle repos — which is impossible given the schemaVersion and shape-field changes. The Spec would encode a false constraint and CI/golden tests would fail.
- fix: Reword to "check-lifecycle (v2) produces semantically identical pass/fail/skip results as v1 on repos with no lifecycle block, though the envelope gains schemaVersion: 2 and a shape field; existing FS9 v1 fixtures remain green unmodified."

### task_validate panel floor unaddressed when lifecycle block is present

- severity: high
- confidence: high
- location: Scope in, item 2 ("Panel floors single-sourced here")
- defect: The plan declares panel floors single-sourced in `lifecycle.gates.<phase>.{minPanel,minVendors}`. But the `gates` vocabulary has only three keys (plan_review, spec_review, pr_review); `task_validate` is governed by `taskValidation.mode`, not a gate key. When `taskValidation.mode` is `"subagent"` (standard/full profiles), `resolve-panel` is still called for `task_validate` — but the plan never specifies what floor it uses. The #36 research brief §4 says "task_validate.min_panel becomes vestigial" but this detail is absent from the plan. The DoD item 5 says "resolve-panel takes floors from the lifecycle block when present" — but the lifecycle block has no `task_validate` entry in `gates`, creating a gap.
- evidence: Plan scope item 2: "Panel floors single-sourced here"; research-36.md §4: "task_validate.min_panel becomes vestigial (task validation has no panel concept under taskValidation.mode)"; lib.mjs:9: `PHASES = ["plan_review", "spec_review", "pr_review", "task_validate"]`; resolve-panel.mjs:110: `const minPanel = ph.min_panel ?? 1` — currently reads from models file for all four phases; #36 schema block (gates) lists only brainstorm/plan_review/spec_review/pr_review.
- impact: During Build phase, implementers will encounter an undefined resolution: does task_validate use `min_panel` from the deprecated models file? Does it use a fixed floor of 1? Does it bypass resolve-panel entirely under `taskValidation: off`? Without a plan-level answer, the Spec cannot write falsifiable scenarios for resolve-panel under lifecycle-present repos.
- fix: Add an explicit clause to scope item 2 or the compatibility constraints: "When the lifecycle block is present, `task_validate` paneling uses a fixed floor of 1 model / 1 vendor when `taskValidation.mode` is `subagent` or `self`, ignoring `sdlc.models.json` `min_panel` for this phase; when `off`, resolve-panel is never called for task_validate."

### Missing explicit dependency on epic #18 completion

- severity: medium
- confidence: high
- location: Compatibility constraints; no Risks section exists
- defect: The plan references extending epic #18 (#40 research: "lands as a REVISION to #18's contract … SUCCESSOR stream … after epic #18 merges untouched") but the plan itself has no Risks or Dependencies section. The FS9 v2 design assumes the v1 checker's complete shape (grammar, exit set, check ids, fixture set), yet the plan doesn't state that this stream is blocked until #18 merges. If #18 encounters spec changes or post-merge defects, this plan's timing and design assumptions may silently drift.
- evidence: Plan "Compatibility constraints": "Extend, never fork, the shipped FS9/FS10: v1 check ids preserved verbatim" — implies #18 is shipped but never says "this stream is a successor that must wait for #18." #40 research §5: "Land epic #18 … exactly as specced and merge it untouched first. Then deliver this widening as a REVISION." Map #34: "epic #18 (FS9/FS10) is in flight."
- impact: If the Spec/Tasks phases of this stream begin before #18 merges, they would design against an unstable surface. A coordinator might schedule work that cannot complete, or the stream might need re-planning if #18's final shape differs from the spec.
- fix: Add an explicit "Dependencies" section naming epic #18 merge as a prerequisite and noting that any #18 spec change after this plan is written requires a plan revision.

### DoD item 4: evidence check applicability under-specified

- severity: medium
- confidence: medium
- location: Definition of done, item 4
- defect: DoD item 4 says check-lifecycle v2 "enforces evidence.manifest/evidence.scenarios/evidence.channels" without capturing the conditional applicability ratified in the #41 research brief: `evidence.*` checks skip for `track: none`, and skip on reversible track when the PV1 union is empty. The DoD is stated as a blanket enforcement, which a naive Spec author could interpret as demanding evidence on all tracks — producing Spec scenarios that would fail for `track: none` or reversible-with-no-PV1 PRs.
- evidence: Plan DoD item 4: "enforces evidence.manifest/evidence.scenarios/evidence.channels with attested rows rendering UNVERIFIED and rung choice never changing exit codes"; #41 research §1: "track: none → all three skip … track: reversible … evidence is demanded iff the PV1 union is non-empty."
- impact: A Spec author who writes "evidence.manifest must fail when missing for reversible-track PR" would encode a contract that contradicts the ratified research. This wastes Spec-phase cycles and could produce a checker that over-enforces.
- fix: Amend DoD item 4 to include applicability: "evidence.manifest/evidence.scenarios/evidence.channels enforced per the #41 conditional rules (skip for track:none; on reversible, demanded only when PV1 union is non-empty)."

### Plan uses "build" in asset name while surface is "tasks" — confusing but not contradictory

- severity: low
- confidence: high
- location: Scope in, items 4 and 7
- defect: Scope item 4 says the "build surface renamed tasks" with "internal phase name/artifacts/labels/hook key unchanged." Scope item 7 immediately uses "tracker-backed build" as an asset name (`assets/tracker-backed-build.md`). The #38 resolution deliberately keeps internal naming ("build") while renaming only the invocable surface (`sdlc:tasks`). This asymmetry is correct per the ratified decision, but the plan's own text — using "build surface renamed tasks" then using "build" in the next scope item — creates surface-level confusion about whether the rename is ongoing or settled.
- evidence: Plan scope item 4: "the 'build' surface renamed tasks, internal phase name/artifacts/labels/hook key unchanged"; scope item 7: "map mode + tracker-backed build extracted to assets (`assets/map-mode.md`, `assets/tracker-backed-build.md`…)"; #38 resolution: "the standalone entrypoint is named sdlc:tasks … The underlying phase name, its artifact filename convention (*-build.md), and its tracker label vocabulary (sdlc:build-task, sdlc:epic) are unchanged."
- impact: Low — the Spec phase would clarify naming conventions. But a reviewer or downstream agent reading the plan for the first time could misinterpret scope item 4 as a complete rename and flag scope item 7 as a contradiction.
- fix: Add a brief note in scope item 4 or 7: "(Surface name only; internal phase name 'build' and asset names like 'tracker-backed-build.md' stay as-is — per #38.)"

CLEAR: A — All DoD items are falsifiable in principle except for the precision issues above; the "honestly checkable" phrasing in the objective is a qualitative framing, not a DoD item.

CLEAR: B — Every stated outcome in the scope-in list has a plausible verification path (config round-trip, checker exit codes, panel resolution, profile matrix), except the evidence enforcement applicability noted above.

CLEAR: C — Scope in/out boundaries are coherent and consistent with the map (#34) decisions. No contradiction between in-scope and out-of-scope items.

CLEAR: D — The plan does not re-open or contradict any settled locked decisions (ADR 0016 FS8 freeze, ADR 0017 FS9 evolution path, ADR 0018 FS10 envelope, #35-#42 ratified decisions). It correctly follows ADR 0017's prescribed schema-version bump for FS9 v2.

CLEAR: E — Beyond the missing epic-#18 dependency noted above, the major risks (self-loosening #42, kernel-probing config, advisory-as-camouflage, all-minimum shape R1) are adequately addressed in the plan or its upstream research.

CLEAR: F — Track classification as irreversible is correct: the plan freezes the lifecycle config vocabulary, widens the FS9 checker contract, and amends kernel text — all shape-freezing changes under the kernel's own irreversibility test.

```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "Review confined to the PLAN artifact at docs/plans/2026-07-14-opt-in-lifecycle.md, judged against upstream ratified decisions (#35-#42), shipped code (check-lifecycle.mjs, sdlc-status.mjs, resolve-panel.mjs, lib.mjs), governing ADRs (0016/0017/0018), and accepted research briefs. No scope widening — findings address only defects in the plan text."
    },
    {
      "id": "criterion-2",
      "status": "satisfied",
      "evidence": "Five findings with severity, confidence, locations, evidence (plan text quotes, file:line references, issue# comment citations), impact assessments, and one-line fixes. CLEAR attestations for all six attack surfaces A-F."
    }
  ],
  "changedFiles": [],
  "testsAddedOrUpdated": [],
  "commandsRun": [
    {
      "command": "gh issue view 34-42 -R threadsafe-systems/pi-sdlc --comments",
      "result": "passed",
      "summary": "All eight brainstorm tickets read; resolutions, amendments, and research briefs verified against plan claims"
    },
    {
      "command": "read check-lifecycle.mjs, sdlc-status.mjs, resolve-panel.mjs, lib.mjs",
      "result": "passed",
      "summary": "Shipped FS9 v1 checker (12 check ids, schemaVersion 1, hardcoded artifact table), FS8 status (10 check ids, frozen per ADR 0016), resolve-panel (min_panel from models file, 4 phases including task_validate) all verified"
    },
    {
      "command": "read docs/specs/2026-07-13-sdlc-adoption-bundle.md",
      "result": "passed",
      "summary": "FS9/FS10 spec verified: declaration grammar v1, track semantics, artifact resolution, exit mapping, check ids all match plan's compatibility claims"
    },
    {
      "command": "grep min_panel and task_validate across skills/sdlc/",
      "result": "passed",
      "summary": "Confirmed task_validate has min_panel in models schema/validation and resolve-panel reads it — plan's 'panel floors single-sourced' claim incomplete for task_validate phase"
    }
  ],
  "validationOutput": [
    "Five findings: 2 high (DoD byte-for-byte precision, task_validate floor gap), 2 medium (missing #18 dependency, evidence applicability under-specification), 1 low (build/tasks naming confusion in plan text)",
    "All six attack surfaces A-F attested CLEAR except for the issues captured in findings",
    "Plan correctly self-classifies as irreversible and does not contradict any ratified brainstorm decision"
  ],
  "residualRisks": [
    "Plan does not address credential-availability risk for solo profile's advisory PR panel (minPanel:1/minVendors:1 still needs one live model credential)",
    "Standalone pr-review fixed panel default is deferred to Spec — plan acknowledges this but provides no floor constraint"
  ],
  "noStagedFiles": true,
  "diffSummary": "Review output only — no code changes. Findings written to /tmp/sdlc-map/plan-review/deepseek-v4-pro.md.",
  "reviewFindings": [
    "high: DoD item 1 - byte-for-byte claim contradicts FS9 v2 schemaVersion/shape-field changes",
    "high: Scope item 2 - task_validate panel floor unaddressed when lifecycle block present",
    "medium: missing explicit dependency on epic #18 merge",
    "medium: DoD item 4 - evidence check applicability under-specified",
    "low: Scope items 4/7 - build/tasks naming asymmetry creates surface confusion"
  ],
  "manualNotes": "The plan is strong overall — it correctly transcribes all eight ratified brainstorm decisions, properly follows ADR 0017's evolution path for FS9 v2, and keeps FS8/FS10 frozen. The two high-severity findings are precision defects, not design flaws: fix the DoD wording and add the task_validate floor clause, and the plan is ready for Spec."
}
