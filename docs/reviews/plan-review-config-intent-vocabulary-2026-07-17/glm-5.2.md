# Plan review — config intent vocabulary (schemaVersion 2→3)

Reviewer: glm-5.2 (adversarial plan panel). Target: `docs/plans/2026-07-17-config-intent-vocabulary.md` (rev 1, working tree), repo HEAD `63ef0d6`. All claims grounded to `file:line`.

### 1. Deleting `minVendor` drops the dogfooding repo's live PR-gate floor (3→2) and silently re-axes vendor→model-identity

- severity: high
- confidence: high
- location: Plan scope item 1 (v2→v3 mapping table) vs DoD item 4; also conflicts with the inline sketch comment in the same block
- defect: The mapping table states `panels.phases.*.minVendor → **deleted, no successor**`, while the inline `panels` sketch says an "optional per-phase panelSize override replaces any per-gate floor need." The repo's own config (the plan's named first migration fixture) has **no `lifecycle` block**, so `minVendor` is the *active* floor: `resolve-panel.mjs:296` routes a no-block config to `resolveVendor()`, and `resolve-panel.mjs:164` sets `floor = ph.minVendor ?? 1`. The repo's `pr_review.minVendor = 3` (`.pi/sdlc/sdlc.config.json:46`) is therefore the live merge-gate floor. Under the literal mapping (`minVendor` deleted, `review.panelSize` default 2 per `sdlc.config.schema.json` minPanel default) the migrated repo's PR-gate floor falls 3→2 — a merge-gate weakening that violates kernel safety and directly falsifies DoD item 4 ("identical … floors"). Even if the Spec picks the escape hatch (`minVendor:3 → panels.phases.pr_review.panelSize:3`), the dedup axis changes from vendor (`resolve-panel.mjs:172` vendor-dedupe) to model-identity (`resolve-panel.mjs:251` identity-dedupe) — a semantic change the plan never flags; it only happens to be outcome-neutral for today's 4-model/4-vendor roster.
- evidence: `.pi/sdlc/sdlc.config.json:46` (`pr_review.minVendor: 3`, no `lifecycle` key at all); `resolve-panel.mjs:164,296`; plan scope item 1 mapping table row `panels.phases.*.minVendor → deleted, no successor` vs the inline `panels` comment "per-phase panelSize override replaces any per-gate floor need"
- impact: The irreversible-track PR panel floor — the one gate that actually blocks merge — is silently weakened on the dogfooding repo, and the migration's correctness for the first fixture is ambiguous (two contradicting statements in the same scope item).
- fix: Make the mapping table row read `panels.phases.*.minVendor → panels.phases.<phase>.panelSize` (the per-phase override, preserving the integer), and add one line noting the axis change vendor→model-identity so the Spec must prove outcome-equivalence (or refuse) per roster.

### 2. The mapping table is NOT total — the no-`lifecycle`-block shape (the repo's own config) has no synthesis rule, yet the plan asserts totality

- severity: high
- confidence: high
- location: Plan scope item 3 ("The mapping table above is total for every shape `inspectConfig` accepts today") + scope item 1 mapping table
- defect: Every row in the mapping table maps a key that lives **inside** `lifecycle.*`, `enforcement`, or `minVendor`. The repo's own config has none of those except `enforcement` and `minVendor` — it has no `lifecycle` block (`.pi/sdlc/sdlc.config.json`, verified: no `lifecycle` key). After v3 makes `review`/`shape` "always explicit", the migration must *synthesise* `review.brainstorm`/`review.design`/`review.code`/`review.tasks`/`review.panelSize`/`shape.separateSpec`/`shape.publishToTracker`/`shape.defaultTrack` from the implicit defaults currently baked into `resolve-panel.mjs:228-238` (`gate?.mode ?? …`, `gate?.minPanel ?? 2`), `check-lifecycle.mjs` skips, and SKILL.md prose. None of those defaults are enumerated in v3 vocabulary, so the migration of the plan's own first fixture is unspecified. The totality claim ("total for every shape `inspectConfig` accepts today") is false: `inspectConfig` (`lib.mjs:214`) accepts a no-block v2 config — that is exactly the counterexample.
- evidence: `.pi/sdlc/sdlc.config.json` (no `lifecycle` key); `lib.mjs:214` (`inspectConfig`) and `lib.mjs:346` (lifecycle keys are all optional — `collectLifecycleSection` returns early on `undefined`); plan scope item 3 totality assertion
- impact: The first and only real migration target is the one shape the mapping table cannot describe; a Spec author either invents the synthesis rules (the plan forbids this — "a Spec that cannot express a v2 dial must return here") or the migration refuses the repo's own config.
- fix: Add a mapping-table row for the absent-block case: enumerate, in v3 vocabulary, the default `review.*`/`shape.*` values a no-block v2 config expands to (brainstorm=human, design=panel, code=panel, tasks=subagent, panelSize=2, separateSpec=false→true semantics, publishToTracker=2, defaultTrack=irreversible) so the synthesis is binding, not Spec-discretion.

### 3. `panels.rules.excludeAuthorVendor` becomes vestigial in v3 and escapes DoD item 1's purge

- severity: high
- confidence: high
- location: Plan scope item 1 (v3 `panels` sketch retains `rules`), DoD item 1, Design principle
- defect: v3 makes `review` always explicit, so `resolve-panel` always takes the lifecycle/model-identity branch; `resolveVendor()` — the *only* reader of `panels.rules.excludeAuthorVendor` (`resolve-panel.mjs:165`) — becomes dead code (the lifecycle branch at `resolve-panel.mjs:257` derives `excludeAuthor = floor >= 2` and never reads the rule). The v3 sketch keeps `panels.rules`, so `excludeAuthorVendor` persists as a committed key with no runtime reader — exactly what the Design principle ("every persisted key is read at runtime") and DoD item 2 forbid. DoD item 1's purge names only `profile` and `minVendor`, so this vestige is never caught. The repo actively sets it (`.pi/sdlc/sdlc.config.json` `panels.rules.excludeAuthorVendor: true`), so migration either drops it (unflagged behaviour change for any consumer relying on the vendor-axis exclusion) or carries it forward unread.
- evidence: `resolve-panel.mjs:165` (sole read of `excludeAuthorVendor`, inside `resolveVendor`) vs `resolve-panel.mjs:257` (lifecycle branch ignores it) vs `resolve-panel.mjs:296` (branch selection); `.pi/sdlc/sdlc.config.json` (`rules.excludeAuthorVendor: true`); plan DoD item 1 lists only `profile` and `minVendor`
- impact: A retained, documented key that does nothing — the precise "vestigial state" the plan's own rationale (#1, #4) attacks — silently survives because the purge list is incomplete.
- fix: Add `panels.rules.excludeAuthorVendor` to DoD item 1's grep purge (or explicitly state in the mapping that it is deleted with no successor once the vendor path is retired), and reconcile the repo's `excludeAuthorVendor: true` in the migration fixture disposition.

### 4. `shape.publishToTracker` (carried over from `publishThreshold`) has no runtime reader — the plan's DoD item 2 would reject the very key it preserves

- severity: medium
- confidence: high
- location: Plan scope item 1 mapping (`lifecycle.tracker.publishThreshold → shape.publishToTracker`), DoD item 2, Design principle
- defect: No code reads `publishThreshold`/`publishToTracker`: grep across `skills/sdlc/scripts/`, `skills/sdlc/assets/`, `skills/sdlc/SKILL.md`, `docs/` finds only the validator (`lib.mjs:357-359`) and the setup writers (`setup-sdlc.mjs:42,50,63,635`). The actual publish decision is hardcoded in prose — SKILL.md:202 "two or more tasks", SKILL.md:220 "A single-task build", SKILL.md:517, and `assets/pull_request_template.md:16` — none of which consult the config value. So the plan carries a key into v3 that its own DoD item 2 ("a key with no reader fails the Spec gate") and Design principle ("every persisted key is load-bearing") immediately reject. This is an internal contradiction in the plan: it both preserves the key and sets a gate that forbids it.
- evidence: `lib.mjs:357-359` (only validator); `setup-sdlc.mjs:42,50,63` (only writers); `SKILL.md:202,220,517` + `assets/pull_request_template.md:16` (hardcoded "two or more tasks", config unread); plan mapping row and DoD item 2
- impact: Either the Spec fails its own DoD item 2 audit table for `publishToTracker`, or the key ships unread — re-creating in v3 the "key that lies" defect the plan exists to remove.
- fix: State explicitly whether `shape.publishToTracker` gains a script reader in IC-A (and name it), or is dropped; if kept, point the hardcoded "two or more tasks" prose at the config value so the key becomes load-bearing.

### 5. `task_validate` floor regresses 1→2: the fixed-1 rule and `minVendor:1` have no v3 mapping

- severity: medium
- confidence: high
- location: Plan scope item 1 (v3 `review` sketch: single `panelSize`), mapping table, DoD item 4
- defect: v2 has two distinct task-validation floors: for a no-block repo, `resolveVendor` uses `ph.minVendor ?? 1` (`resolve-panel.mjs:164`) — the repo's `task_validate.minVendor = 1` (`.pi/sdlc/sdlc.config.json:50`); for a lifecycle-block repo, the OL-A rule forces `floor = 1` for `task_validate` regardless of `minPanel` (`resolve-panel.mjs:233-237`). v3 collapses every floor into a single `review.panelSize` (default 2), and the mapping table only maps `gates.*.minPanel → review.panelSize` — `task_validate` was never a `gates.*.minPanel`, so its floor has no row. A migrated repo therefore resolves `task_validate` at `panelSize` 2 instead of 1, changing per-task validation behaviour and falsifying DoD item 4 ("identical resolve-panel outcomes").
- evidence: `resolve-panel.mjs:164` (vendor floor) and `resolve-panel.mjs:233-237` (forced `floor = 1` for task_validate) vs the v3 sketch's single `panelSize`; `.pi/sdlc/sdlc.config.json:50` (`task_validate.minVendor: 1`); mapping table has no `task_validate` row
- impact: Per-task validator panels silently demand 2 distinct models where today 1 suffices — a behaviour change on the dogfooding repo's own task validation, hidden behind a "non-regression" DoD that the mapping breaks.
- fix: Add a mapping row for the task-validate floor (`task_validate` fixed-1 rule / `minVendor:1 → panels.phases.task_validate.panelSize:1`, or an explicit `review.tasksFloor`), and pin it in the non-regression fixtures.

### 6. `review.design` cannot express distinct `plan_review` vs `spec_review` modes on the same track (second totality hole, unnamed in Risks)

- severity: medium
- confidence: medium
- location: Plan scope item 1 (`review.design` = "plan+spec gating"), mapping table, Risks
- defect: v2 models `plan_review` and `spec_review` as independent gates (`lib.mjs:407-414`, `collectLifecycleGate` per gate), so a config with `plan_review.mode = "panel"` and `spec_review.mode = "human"` on the *same* (irreversible) track validates today. v3 collapses both into one `review.design` dial, and `overrides` are keyed by track (`overrides.reversible.review.design`), not by gate — so "plan panel, spec human on irreversible" has no v3 home. The plan's Risks section names only "per-track spec_review splits" (which *are* expressible via overrides); the per-gate same-track divergence is the unexpressible case it does not name, so the totality claim has a second hole and the "refuse loudly" fallback is not signalled for it.
- evidence: `lib.mjs:407-414` (plan_review and spec_review validated independently, each accepting any gateMode); v3 sketch `design: "panel", // plan+spec gating` and `overrides: { reversible: { review: { design: "human" } } }` (track-keyed only); Risks bullet gives only the per-track example
- impact: A valid v2 custom shape either migrates with silent loss (spec mode dropped to plan mode) or the Spec must invent a key the plan says to escalate back — either way the "exactly one v3 home" guarantee fails for an accepted v2 shape.
- fix: Either enumerate `plan_review ≠ spec_review (same track)` in the Risks refusal list, or extend `overrides` to allow per-gate split (e.g. `overrides.<track>.review.planDesign`/`specDesign`).

### 7. Telemetry merge hazard is under-mitigated: IC-A rewrites the very scripts lt-t2 seeds with side-effect emission calls

- severity: medium
- confidence: medium
- location: Plan Risks ("In-flight telemetry stream churn")
- defect: The mitigation "IC-A avoids touching telemetry.mjs" addresses only the shared vocabulary module. But lt-t2 is "FS5 side-effect emission" (per the programme stream), which is emitted *from* `resolve-panel.mjs` / `check-lifecycle.mjs` / `setup-sdlc.mjs` via `record-run-event` calls embedded in those scripts — exactly the files IC-A re-sources wholesale. Whichever stream lands second must manually re-seed the other's emission hooks across a full rewrite of these three scripts; the plan's "sequence merges / rebase" mitigation does not name this embedded-call coupling, so the rebase cost is hidden.
- evidence: Plan scope item 2 ("resolve-panel, check-lifecycle, setup-sdlc, and inspectConfig read v3 only" — i.e. IC-A rewrites them); plan Risks telemetry bullet limits mitigation to `telemetry.mjs`; the lt-t2 frontier (FS5 side-effect emission) targets these same scripts per the programme plan
- impact: A silent loss of lifecycle telemetry events on one of the two merge orders, discovered only when a run-store comes up empty.
- fix: Add to Risks that IC-A must preserve (or the second-landing stream must re-seed) any `record-run-event` call sites inside the three re-sourced scripts, and name the merge-order contract explicitly.

---

CLEAR: F (track classification) — the plan correctly self-classifies as irreversible (schemaVersion 2→3 persisted break, rides a package major per ADR 0021; the guard exists at `skills/sdlc/scripts/check-schema-break.mjs` invoked in `.github/workflows/ci.yml:20` and recognises the `BREAKING CHANGE:` footer at `check-schema-break.mjs:39`). Kernel safety holds structurally: the merge gate retains no `review.*` key (check-lifecycle artifact demands are track/declaration-driven, `check-lifecycle.mjs` CHECK_IDS), and `shape.defaultTrack` excludes `none`, matching the v2 enum at `lib.mjs:366`. No v3 key can weaken the merge gate or introduce `track: none`.

CLEAR: D (locked decisions) — ADR 0022 posture semantics are preserved (renamed `enforcement → review.onShortfall`, strict/proceed semantics unchanged per `resolve-panel.mjs:80,194,274`); the OL rev-3 Binding-migration opt-in ("evidence demanded only when a lifecycle block is present") dissolution is explicitly flagged as an OL-B Spec re-decision with a working proposal (explicit `evidence` key), and the profile/application cancellation is recorded as a binding amendment note. (The residual risk — that IC-A's migrated repo config carries no evidence opt-out marker until OL-B ships — is covered by the totality/no-block findings above, not a separate locked-decision break.)
