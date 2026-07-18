### T1's harness-core work list never names the headless project-trust flag its own spike is verifying

- severity: high
- confidence: high
- location: build plan T1 "Work" bullet (harness core) vs T1 spike bullet ("settings-level project trust without a TTY")
- defect: The staged package is installed to project settings (`pi install <staged> -l` → `.pi/settings.json`), and every L1/L2 invocation runs the agent against that project. Non-interactive modes ignore `.pi/settings.json` and all project resources unless trust is explicitly granted, yet T1's harness-core bullet (sandbox construction, staging, invocation helpers) never mentions setting `--approve`/`-a` or `defaultProjectTrust: "always"` in the scratch `HOME`. The requirement is buried as one of four items in the verification spike, so it reads as "to be discovered" rather than as a named, must-build wire-up.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness.md` decision 7 + scope item 1 describe staging+install and pinned-pi invocation helpers with no trust wiring; pi docs, `settings.md:16`: "Non-interactive modes (`-p`, `--mode json`, and `--mode rpc`) do not show a trust prompt. Without an applicable saved trust decision, they use `defaultProjectTrust` from global settings: `ask` (default) and `never` ignore those project resources"; `settings.md:20`: "`pi config` and package commands use the same project trust flow ... Pass `--approve` to trust project-local settings for one command." `pi install -l` is a package command, so it is subject to the same flow.
- impact: If the harness's fresh scratch `HOME` leaves `defaultProjectTrust` at its default (`ask`), every non-interactive `pi install <staged> -l` and every subsequent `pi -p ...` L1/L2 run silently ignores the installed package and skill — the entire harness could run "green" while never exercising the skill at all, defeating L1 and (absent the anti-vacuity sentinel catching it) risking a confusing failure mode rather than the intended install/discovery assertions.
- fix: Add an explicit harness-core work item: construct the scratch global `settings.json` with `defaultProjectTrust: "always"` (or pass `--approve`/`-a` on every invocation) as part of sandbox construction, not as a spike discovery.

### T1 fuses an open-ended discovery spike with the harness-core implementation it gates, with no re-plan checkpoint

- severity: high
- confidence: medium
- location: build plan T1 "Work" — "Spike (blocks the rest): verify against the pinned pi ..."
- defect: T1 delivers both `harness.mjs` (staging, sandbox, assertion phase, manifest emitter) and a four-part behavioral spike (local-path install/discovery, `-e` provider registration, headless `-p`, headless project trust) in the same task, with the same "T1 done" gate. If the spike falsifies a ratified plan decision (the plan's own Risks section cites a precedent: "published pi has diverged from its docs" — the Otto pi-SDK gotcha), there is no defined branch point to halt and revise the plan before the harness-core code (built in that same task) is written against the wrong assumption.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness-build.md` T1 combines "harness core + staging/install + verification spike" as one task with one "Checks:" line; plan's own Risks section: "pi API drift ... Known prior: published pi has diverged from its docs (Otto spike gotcha)."
- impact: "T1 done" is ambiguous — a reviewer cannot tell from the build plan whether harness-core code is contingent on spike findings or written in parallel/beforehand, risking throwaway work or a silent mismatch between SPIKE.md's recorded findings and what `harness.mjs` actually implements.
- fix: Split T1 into a gating T0 (spike only, output = SPIKE.md + go/no-go note against each ratified decision) and a T1 that builds harness core using T0's confirmed findings.

### Scenario G has no specified negative twin, leaving DoD 6 unfalsifiable for that scenario

- severity: medium
- confidence: high
- location: plan scope item 4 (scenario G) and build plan T4 (scenario G) vs plan DoD 6
- defect: DoD 6 requires "Scenarios A–E, G assert exactly the markers/effects named in scope item 4, each with a negative twin." Scope item 4 and T4's work item for G describe only the positive assertion (exact `[sdlc hook] implement:before use=… do=…` / `result:` lines, correctly ordered) with no stated negative case (e.g., hook absent ⇒ no lines emitted; hook misconfigured ⇒ failure line; wrong ordering ⇒ fail). Since hook execution is "prose law ... there is no mechanical runner" (no script enforces it), the only verification a scripted puppet can offer is whether its own canned turn contains the string it was told to contain — a negative twin is the only thing that would prove the assertion is not trivially true.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness.md` scope item 4, scenario G bullet (no negative case named); `skills/sdlc/SKILL.md:434-435`: "Hooks are prose law executed by the agent — the same enforcement model as the iron law; there is no mechanical runner."
- impact: Without a defined negative twin, scenario G can pass by construction (the puppet always emits the lines it is scripted to emit) and never demonstrates the harness would catch a broken/missing hook-announce contract — DoD 6 is not actually met for G as written.
- fix: Name G's negative twin explicitly in the plan/build plan, e.g. "no hook configured ⇒ hook lines absent from transcript," and add it to T4's scenario-g.mjs work item.

### F (onShortfall) has no owning L1 task despite being named as an L1-strength scope item

- severity: medium
- confidence: high
- location: plan scope item 4 footnote "(F — onShortfall — stays L1-strength...)" vs build plan T2 work list
- defect: The plan states F (`enforcement: preference|strict` shortfall behavior) "stays L1-strength: script-level behaviour already unit-tested, re-checked through install-root paths" — implying L1 should re-check it. Build plan T2's work list (setup presets, preset-patch+override guard, the four `sdlc-status` states, older-v2 refusal, `check-lifecycle` body mode) never mentions onShortfall/enforcement, and no other task references it either.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness.md:135` "(F — onShortfall — stays L1-strength: script-level behaviour already unit-tested, re-checked through install-root paths.)"; `docs/plans/2026-07-17-e2e-integration-harness-build.md` T2 "Work" bullet (no mention); confirmed real behavior at `skills/sdlc/scripts/resolve-panel.mjs:159-160,208,288` (`adviseShortfall`) and `skills/sdlc/scripts/setup-sdlc.mjs:655` (enforcement prompt).
- impact: A named scope item silently has no owning task or check — either it ships untested through install-root paths (contradicting the plan's own claim) or the build plan is incomplete relative to its source plan.
- fix: Add an explicit T2 bullet: re-run the existing `enforcement: preference|strict` shortfall unit coverage against the staged install root.

### Determinism gate doesn't account for pi's non-deterministic parallel tool-completion ordering

- severity: medium
- confidence: medium
- location: plan decision/DoD 2 (normalized run manifest) and build plan T1 manifest emitter
- defect: The manifest strips "volatile fields — timestamps, UUIDs, absolute scratch paths" and claims byte-identical output across two fresh-sandbox runs, including "ordered tool calls." Pi's documented default execution mode runs sibling tool calls from one assistant message concurrently after sequential preflight, and `tool_execution_end` fires "in tool completion order," which is not guaranteed stable across runs for any turn issuing more than one tool call.
- evidence: `extensions.md` (Tool Events section): "In parallel tool mode: `tool_execution_start` is emitted in assistant source order during the preflight phase ... `tool_execution_end` is emitted in tool completion order after each tool is finalized ... final `toolResult` message events are still emitted later in assistant source order."
- impact: If any L2 scenario's puppet script issues more than one tool call per assistant turn (plausible for multi-effect scenarios like E, which both logs a `gh` attempt and needs a distinct effect check), the manifest's tool-call ordering could legitimately differ between two fresh-sandbox runs, causing DoD 2's byte-compare to flake — exactly the "flaky as written" failure mode the plan's own panel review (E8) was meant to close.
- fix: Either constrain all scenario scripts to one tool call per assistant turn (name this as a scenario-authoring constraint in scope/T3), or normalize the manifest's tool-call ordering by assistant source order (already stable per docs) rather than completion order.

### v3 config-vocabulary rebase risk is real and under-checked, not just a generic "re-verify"

- severity: medium
- confidence: high
- location: build plan Cross-cutting close-out ("Rebase onto merged main (v3) before T1 code lands; re-verify the spike against the merged tree") vs T2/T4 scenario fixtures
- defect: PR #92 (schemaVersion 3) is still open/unmerged and has already changed both a config field name/vocabulary (`lifecycle.taskValidation` → `review.tasks`, confirmed on the open branch) and a user-facing remedy string that scenario C's assertion depends on verbatim (the "never 'migration'" wording). T2/T4 hard-code literal field paths and literal strings against this in-flux branch, but the build plan's only mitigation is "re-verify the spike," and the spike's own checklist (install/discovery, `-e` provider registration, headless `-p`, headless trust, baseline timing) contains no item to diff the sdlc config schema/scripts pre- vs. post-rebase.
- evidence: on `origin/feat/config-intent-vocabulary` (tip `9fa5f03`), `skills/sdlc/scripts/resolve-panel.mjs:172-173` reads `review.tasks` (not `lifecycle.taskValidation`, the field name on this worktree's current `skills/sdlc/scripts/lib.mjs:363`); `skills/sdlc/scripts/lib.mjs:28` on the same branch has already changed the v2-refusal remedy text once (from a version this plan's own reviewers say used to say "migration" style wording) since the branch is still being reviewed.
- impact: A further round of #92 review feedback (plausible — it's still open) could silently break T2/T4's hard-coded field-path or literal-string assertions after the harness stream has already been coded against a snapshot of #92, with no build-plan step designed to catch that class of drift.
- fix: Add an explicit T2/T4 (or close-out) check: after rebase, diff `skills/sdlc/schema/sdlc.config.schema.json` and the literal remedy/refusal strings referenced by scenario fixtures against the pre-rebase snapshot, and fail loudly on any diff touching a field or string the scenarios assert on.

### Cross-cutting close-out items have no falsifiable check, unlike every other task

- severity: low
- confidence: medium
- location: build plan "Cross-cutting close-out" section
- defect: T1 through T5 each carry an explicit "Checks:" line. The cross-cutting close-out ("Rebase onto merged main (v3) before T1 code lands; re-verify the spike against the merged tree", tracker publish, PV1 manifests "where the repo's committed validator config requires them") has no equivalent falsifiable check.
- evidence: `docs/plans/2026-07-17-e2e-integration-harness-build.md`, "Cross-cutting close-out" section — no "Checks:" line, contrast with every T1-T5 block.
- impact: "Rebase done correctly" and "spike re-verified" are asserted as done by convention rather than by any check a reviewer or CI can run, which is inconsistent with the rest of the build plan's own falsifiability standard.
- fix: Add a "Checks:" line to the close-out section, e.g. "spike commands from SPIKE.md re-run and re-recorded against merged main; diff of config schema/scripts vs pre-rebase snapshot attached to the PR."

CLEAR: A — every DoD item in the build plan (1-8, inherited from the source plan) is a falsifiable pass/fail check (exit codes, byte-compare, negative-control fail, named script constants); no opinion-based item found.
CLEAR: D — no locked decision from the source plan or repo governance is reopened or contradicted by the build task breakdown; T1-T5 track the plan's ratified decisions 1-9 without redefining any of them.
CLEAR: F — the stream stays test-tooling-only (no schema/script/skill change in scope, confirmed against the actual `skills/sdlc/` tree); nothing it touches freezes a contract, schema, or wire format that would force the irreversible track.
